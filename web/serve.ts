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
  isTranscriptionOpen,
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
  sttLanguage: InterviewLanguage | null;
  sttQuestionId: string | null;
  latestTranscript: string;
  stopping: boolean;
  busy: boolean;
  generation: number;
  speech: number;
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
    profile: {}, language, transcript: [], stt: null, sttLanguage: null, sttQuestionId: null,
    latestTranscript: "", stopping: false, busy: false, generation, speech: 0,
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

async function ensureTranscriptionStream(
  ws: Bun.ServerWebSocket<Session>,
): Promise<SttSocket | null> {
  if (!sarvam || !apiKey) return null;
  if (
    ws.data.stt
    && ws.data.sttLanguage === ws.data.language
    && isTranscriptionOpen(ws.data.stt)
  ) {
    return ws.data.stt;
  }

  // Language is fixed at connect time, so a language change needs a new socket.
  closeTranscription(ws.data.stt);
  ws.data.stt = null;
  ws.data.sttLanguage = null;
  try {
    const socket = await openTranscriptionStream(
      sarvam, apiKey, ws.data.language,
      (text) => {
        // Ignore transcripts arriving outside an utterance, or the tail of a
        // previous one would leak into the next answer.
        if (!ws.data.sttQuestionId) return;
        ws.data.latestTranscript = text;
        send(ws, { type: "transcript", text, final: false });
        if (ws.data.stopping) void finishStt(ws);
      },
      (error) => console.log("Sarvam STT unavailable", error),
    );
    ws.data.stt = socket;
    ws.data.sttLanguage = ws.data.language;
    return socket;
  } catch (error) {
    console.log("Sarvam STT could not open", error);
    return null;
  }
}

async function speakQuestion(ws: Bun.ServerWebSocket<Session>): Promise<void> {
  const question = nextQuestion(ws.data.profile);
  if (!sarvam || !question) return;
  // TTS runs unlocked, so a new answer can arrive mid-playback. Stamp this run
  // and abandon it the moment a newer one starts, or we stream audio for a
  // question the interview has already moved past.
  const speech = ws.data.speech + 1;
  ws.data.speech = speech;
  send(ws, { type: "tts_start", contentType: "audio/mpeg" });
  try {
    for await (const chunk of streamSpeech(
      sarvam,
      question.copy[ws.data.language],
      ws.data.language,
    )) {
      if (ws.data.speech !== speech) return;
      ws.send(chunk);
    }
  } catch (error) {
    console.log("Sarvam TTS unavailable", error);
  } finally {
    if (ws.data.speech === speech) send(ws, { type: "tts_end" });
  }
}

async function applyTranscript(
  ws: Bun.ServerWebSocket<Session>,
  questionId: string,
  transcript: string,
): Promise<void> {
  // Never drop an answer silently — the user typed it and deserves to know why
  // nothing happened.
  if (ws.data.busy) {
    send(ws, { type: "error", code: "busy", message: "Still reading your last answer." });
    return;
  }
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
  } finally {
    ws.data.busy = false;
  }

  // Released the lock first: speaking the next question must not block the user
  // from answering it. Previously `busy` was held for the whole TTS stream, so
  // rapid typed answers were rejected while audio was still arriving.
  void speakQuestion(ws);
}

async function finishStt(ws: Bun.ServerWebSocket<Session>): Promise<void> {
  if (!ws.data.stopping) return;
  ws.data.stopping = false;
  const questionId = ws.data.sttQuestionId;
  const transcript = ws.data.latestTranscript;
  // The socket stays open for the next answer — reconnecting per press cost a
  // full handshake before any audio could be accepted.
  ws.data.sttQuestionId = null;
  ws.data.latestTranscript = "";
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
        if (!sendPcm16(ws.data.stt, new Uint8Array(data))) {
          closeTranscription(ws.data.stt);
          ws.data.stt = null;
          ws.data.sttLanguage = null;
          send(ws, { type: "error", code: "voice_dropped", message: "Voice connection dropped. Press and speak again." });
        }
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
        // Warm the transcription socket now so the first press is not the thing
        // that pays for the handshake.
        void ensureTranscriptionStream(ws);
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
        void ensureTranscriptionStream(ws);
      } else if (message.type === "stt_start") {
        const current = nextQuestion(ws.data.profile);
        if (!sarvam || !apiKey || current?.id !== message.questionId) {
          send(ws, { type: "error", code: "voice_unavailable", message: "Use typed input." });
          return;
        }
        ws.data.latestTranscript = "";
        ws.data.stopping = false;
        ws.data.sttQuestionId = message.questionId;
        // Normally already open and warm, so this resolves immediately.
        const stream = await ensureTranscriptionStream(ws);
        if (!stream) {
          ws.data.sttQuestionId = null;
          send(ws, { type: "error", code: "voice_unavailable", message: "Use typed input." });
          return;
        }
        send(ws, { type: "stt_ready" });
      } else if (message.type === "stt_stop" && ws.data.stt) {
        ws.data.stopping = true;
        if (!finishTranscription(ws.data.stt)) {
          closeTranscription(ws.data.stt);
          ws.data.stt = null;
          ws.data.sttLanguage = null;
          void finishStt(ws);
          return;
        }
        setTimeout(() => void finishStt(ws), 350);
      }
    },
    close(ws) {
      closeTranscription(ws.data.stt);
    },
  },
});

console.log(`Virasat: http://localhost:${server.port} (landing) · /app (voice interview)`);
console.log(sarvam ? "Sarvam voice enabled" : "SARVAM_API_KEY missing; typed interview enabled");
