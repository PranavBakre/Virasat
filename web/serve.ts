import { deriveClaims } from "../src/rules/engine.ts";
import type { EstateProfile } from "../src/rules/types.ts";
import { applyQuestionAnswer, nextQuestion } from "../src/interview/state.ts";
import { extractAnswer } from "../src/interview/extract.ts";
import { parseClientMessage, type ServerMessage } from "../src/interview/protocol.ts";
import { isCurrentGeneration } from "../src/interview/session.ts";
import {
  createSarvamClient,
  getSarvamApiKey,
  type InterviewLanguage,
} from "../src/sarvam/config.ts";
import {
  closeTranscription,
  finishTranscription,
  openTranscriptionStream,
  sendPcm16,
  type SttSocket,
} from "../src/sarvam/stt.ts";
import { streamSpeech } from "../src/sarvam/tts.ts";

type TranscriptEntry = { questionId: string; label: string; answer: string };
type Session = {
  profile: EstateProfile;
  language: InterviewLanguage;
  transcript: TranscriptEntry[];
  stt: SttSocket | null;
  sttQuestionId: string | null;
  latestTranscript: string;
  stopping: boolean;
  busy: boolean;
  generation: number;
};

const landing = Bun.file(new URL("./landing.html", import.meta.url));
const index = Bun.file(new URL("./index.html", import.meta.url));
const app = Bun.file(new URL("./app.js", import.meta.url));
const worklet = Bun.file(new URL("./pcm-worklet.js", import.meta.url));
const apiKey = getSarvamApiKey();
const sarvam = apiKey ? createSarvamClient(apiKey) : null;
const tokens = Bun.file(new URL("./tokens.js", import.meta.url));

function initialSession(
  language: InterviewLanguage = "kn-IN",
  generation = 0,
): Session {
  return {
    profile: {}, language, transcript: [], stt: null, sttQuestionId: null,
    latestTranscript: "", stopping: false, busy: false, generation,
  };
}

function send(ws: Bun.ServerWebSocket<Session>, message: ServerMessage): void {
  ws.send(JSON.stringify(message));
}

function sendState(ws: Bun.ServerWebSocket<Session>): void {
  const question = nextQuestion(ws.data.profile);
  send(ws, {
    type: "state",
    payload: {
      profile: ws.data.profile,
      claimSet: deriveClaims(ws.data.profile),
      transcript: ws.data.transcript,
      language: ws.data.language,
      sarvamAvailable: sarvam !== null,
      question: question
        ? { id: question.id, label: question.label, copy: question.copy }
        : null,
    },
  });
}

async function speakQuestion(ws: Bun.ServerWebSocket<Session>): Promise<void> {
  const question = nextQuestion(ws.data.profile);
  if (!sarvam || !question) return;
  send(ws, { type: "tts_start", contentType: "audio/mpeg" });
  try {
    for await (const chunk of streamSpeech(
      sarvam,
      question.copy[ws.data.language],
      ws.data.language,
    )) {
      ws.send(chunk);
    }
  } catch (error) {
    console.log("Sarvam TTS unavailable", error);
  } finally {
    send(ws, { type: "tts_end" });
  }
}

async function applyTranscript(
  ws: Bun.ServerWebSocket<Session>,
  questionId: string,
  transcript: string,
): Promise<void> {
  if (ws.data.busy) return;
  const question = nextQuestion(ws.data.profile);
  if (!question || question.id !== questionId) {
    send(ws, { type: "error", code: "stale_question", message: "The question has changed." });
    return;
  }

  ws.data.busy = true;
  const generation = ws.data.generation;
  try {
    const result = await extractAnswer(question, transcript, sarvam);
    if (!isCurrentGeneration(generation, ws.data.generation)) return;
    if (result.value === null) {
      send(ws, { type: "unclear", questionId });
      return;
    }
    ws.data.profile = applyQuestionAnswer(ws.data.profile, question, result.value);
    ws.data.transcript.push({ questionId, label: question.label, answer: transcript });
    send(ws, { type: "answer", questionId, text: transcript, value: result.value });
    sendState(ws);
    await speakQuestion(ws);
  } finally {
    ws.data.busy = false;
  }
}

async function finishStt(ws: Bun.ServerWebSocket<Session>): Promise<void> {
  if (!ws.data.stopping) return;
  ws.data.stopping = false;
  const questionId = ws.data.sttQuestionId;
  const transcript = ws.data.latestTranscript;
  closeTranscription(ws.data.stt);
  ws.data.stt = null;
  ws.data.sttQuestionId = null;
  if (questionId && transcript) {
    send(ws, { type: "transcript", text: transcript, final: true });
    await applyTranscript(ws, questionId, transcript);
  } else if (questionId) {
    send(ws, { type: "unclear", questionId });
  }
}

const server = Bun.serve<Session>({
  port: Number(process.env.PORT ?? 3000),
  async fetch(request, server) {
    const url = new URL(request.url);
    if (url.pathname === "/ws") {
      const origin = request.headers.get("origin");
      if (origin && new URL(origin).host !== url.host) {
        return new Response("Forbidden", { status: 403 });
      }
      return server.upgrade(request, { data: initialSession() })
        ? undefined : new Response("WebSocket upgrade failed", { status: 400 });
    }
    if (url.pathname === "/app.js") {
      return new Response(app, { headers: { "Content-Type": "text/javascript" } });
    }
    if (url.pathname === "/pcm-worklet.js") {
      return new Response(worklet, { headers: { "Content-Type": "text/javascript" } });
    }

    if (url.pathname === "/tokens.js") {
      return new Response(tokens, { headers: { "Content-Type": "text/javascript" } });
    }

    // The interview lives at /app. The landing page owns the root so the demo can
    // open on the problem statement and click through into the tool.
    if (url.pathname === "/app" || url.pathname === "/index.html") {
      return new Response(index, { headers: { "Content-Type": "text/html" } });
    }

    if (url.pathname === "/") {
      return new Response(landing, { headers: { "Content-Type": "text/html" } });
    }

    return new Response("Not found", { status: 404 });
  },
  websocket: {
    open(ws) {
      sendState(ws);
    },
    async message(ws, data) {
      if (typeof data !== "string") {
        if (!ws.data.stt || data.byteLength > 128_000) return;
        sendPcm16(ws.data.stt, new Uint8Array(data));
        return;
      }

      const message = parseClientMessage(data);
      if (!message) {
        send(ws, { type: "error", code: "invalid_message", message: "Invalid message." });
        return;
      }
      if (message.type === "start" || message.type === "set_language") {
        ws.data.language = message.language;
        sendState(ws);
        if (message.type === "start") await speakQuestion(ws);
      } else if (message.type === "typed_answer") {
        await applyTranscript(ws, message.questionId, message.text);
      } else if (message.type === "set_document") {
        const knownIds = new Set(
          deriveClaims(ws.data.profile).claims.flatMap((claim) =>
            claim.docsRequired.map((document) => document.id)
          ),
        );
        if (!knownIds.has(message.documentId)) {
          send(ws, { type: "error", code: "unknown_document", message: "Unknown document." });
          return;
        }
        ws.data.profile = {
          ...ws.data.profile,
          documents: {
            ...ws.data.profile.documents,
            [message.documentId]: message.status,
          },
        };
        sendState(ws);
      } else if (message.type === "reset") {
        closeTranscription(ws.data.stt);
        ws.data = initialSession(ws.data.language, ws.data.generation + 1);
        sendState(ws);
      } else if (message.type === "stt_start") {
        const current = nextQuestion(ws.data.profile);
        if (!sarvam || !apiKey || current?.id !== message.questionId) {
          send(ws, { type: "error", code: "voice_unavailable", message: "Use typed input." });
          return;
        }
        closeTranscription(ws.data.stt);
        ws.data.latestTranscript = "";
        ws.data.sttQuestionId = message.questionId;
        ws.data.stt = await openTranscriptionStream(
          sarvam, apiKey, ws.data.language,
          (text) => {
            ws.data.latestTranscript = text;
            send(ws, { type: "transcript", text, final: false });
            if (ws.data.stopping) void finishStt(ws);
          },
          (error) => console.log("Sarvam STT unavailable", error),
        );
        send(ws, { type: "stt_ready" });
      } else if (message.type === "stt_stop" && ws.data.stt) {
        ws.data.stopping = true;
        finishTranscription(ws.data.stt);
        setTimeout(() => void finishStt(ws), 800);
      }
    },
    close(ws) {
      closeTranscription(ws.data.stt);
    },
  },
});

console.log(`Virasat: http://localhost:${server.port} (landing) · /app (voice interview)`);
console.log(sarvam ? "Sarvam voice enabled" : "SARVAM_API_KEY missing; typed interview enabled");
