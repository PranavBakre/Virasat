import { deriveClaims } from "../src/rules/engine.ts";
import type { EstateProfile } from "../src/rules/types.ts";
import { buildEstateMap } from "../src/documents/estate-map.ts";
import {
  MAX_DOCUMENT_SIZE,
  MAX_DOCUMENTS_PER_UPLOAD,
  isSupportedDocument,
  processDocument,
} from "../src/documents/process.ts";
import {
  addStoredDocument,
  applyDocumentMatches,
  clearStoredDocumentMatch,
  isEstateId,
  loadWorkspace,
  saveProfile,
  saveWorkspace,
} from "../src/documents/store.ts";
import type { EstateWorkspace } from "../src/documents/types.ts";
import {
  applyAnswerToCurrentQuestion,
  nextQuestion,
} from "../src/interview/state.ts";
import { extractAnswer } from "../src/interview/extract.ts";
import type { QuestionCopy } from "../src/interview/questions.ts";
import { parseClientMessage, type ServerMessage } from "../src/interview/protocol.ts";
import { isCurrentGeneration } from "../src/interview/session.ts";
import { extractWithOpenAI } from "../src/openai/chat.ts";
import { createOpenAIClient, getOpenAIApiKey } from "../src/openai/config.ts";
import {
  appendPcm16,
  createRecording,
  transcribeRecording,
  type PcmRecording,
} from "../src/openai/stt.ts";
import { streamSpeech as streamOpenAISpeech } from "../src/openai/tts.ts";
import { extractWithSarvam } from "../src/sarvam/chat.ts";
import { createSarvamClient, getSarvamApiKey } from "../src/sarvam/config.ts";
import {
  closeTranscription,
  finishTranscription,
  isTranscriptionOpen,
  openTranscriptionStream,
  sendPcm16,
  type SttSocket,
} from "../src/sarvam/stt.ts";
import { streamSpeech as streamSarvamSpeech } from "../src/sarvam/tts.ts";
import {
  isInterviewLanguage,
  type InterviewLanguage,
  type VoiceProvider,
} from "../src/voice/config.ts";

type TranscriptEntry = {
  questionId: string;
  label: string;
  question: QuestionCopy;
  answer: string;
};
type Session = {
  workspace: EstateWorkspace;
  profile: EstateProfile;
  language: InterviewLanguage;
  provider: VoiceProvider;
  transcript: TranscriptEntry[];
  sarvamStt: SttSocket | null;
  sarvamSttLanguage: InterviewLanguage | null;
  recording: PcmRecording | null;
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
const tokens = Bun.file(new URL("./tokens.js", import.meta.url));
// The alternative landing page at /v2 — a separate design language, kept beside
// the register system rather than replacing it so both can be compared.
const landingV2 = Bun.file(new URL("./landing-v2.html", import.meta.url));
const tokensV2 = Bun.file(new URL("./tokens-v2.js", import.meta.url));

const sarvamApiKey = getSarvamApiKey();
const sarvam = sarvamApiKey ? createSarvamClient(sarvamApiKey) : null;
const openAIApiKey = getOpenAIApiKey();
const openai = openAIApiKey ? createOpenAIClient(openAIApiKey) : null;
const providers: Record<VoiceProvider, boolean> = {
  sarvam: sarvam !== null,
  openai: openai !== null,
};

function defaultProvider(): VoiceProvider {
  const configured = process.env.VOICE_PROVIDER?.trim().toLowerCase();
  if (configured === "sarvam" || configured === "openai") return configured;
  if (providers.sarvam) return "sarvam";
  if (providers.openai) return "openai";
  return "sarvam";
}

const workspaces = new Map<string, EstateWorkspace>();

async function workspaceFor(estateId: string): Promise<EstateWorkspace> {
  const existing = workspaces.get(estateId);
  if (existing) return existing;
  const workspace = await loadWorkspace(estateId);
  workspaces.set(estateId, workspace);
  return workspace;
}

function initialSession(
  workspace: EstateWorkspace,
  language: InterviewLanguage = "en-IN",
  generation = 0,
  provider: VoiceProvider = defaultProvider(),
): Session {
  return {
    workspace,
    profile: workspace.profile,
    language,
    provider,
    transcript: [],
    sarvamStt: null,
    sarvamSttLanguage: null,
    recording: null,
    sttQuestionId: null,
    latestTranscript: "",
    stopping: false,
    busy: false,
    generation,
    speech: 0,
  };
}

function send(ws: Bun.ServerWebSocket<Session>, message: ServerMessage): void {
  ws.send(JSON.stringify(message));
}

function sendState(ws: Bun.ServerWebSocket<Session>): void {
  const question = nextQuestion(ws.data.profile);
  const claimSet = deriveClaims(ws.data.profile);
  send(ws, {
    type: "state",
    payload: {
      estateId: ws.data.workspace.id,
      profile: ws.data.profile,
      claimSet,
      documentStore: {
        documents: ws.data.workspace.documents,
        estateMap: buildEstateMap(claimSet, ws.data.workspace.documents),
      },
      transcript: ws.data.transcript,
      language: ws.data.language,
      provider: ws.data.provider,
      providers,
      voiceAvailable: providers[ws.data.provider],
      question: question
        ? { id: question.id, label: question.label, copy: question.copy }
        : null,
    },
  });
}

async function ensureSarvamStream(
  ws: Bun.ServerWebSocket<Session>,
): Promise<SttSocket | null> {
  if (!sarvam || !sarvamApiKey) return null;
  if (
    ws.data.sarvamStt
    && ws.data.sarvamSttLanguage === ws.data.language
    && isTranscriptionOpen(ws.data.sarvamStt)
  ) {
    return ws.data.sarvamStt;
  }

  closeTranscription(ws.data.sarvamStt);
  ws.data.sarvamStt = null;
  ws.data.sarvamSttLanguage = null;
  try {
    const socket = await openTranscriptionStream(
      sarvam,
      sarvamApiKey,
      ws.data.language,
      (text) => {
        if (ws.data.provider !== "sarvam" || !ws.data.sttQuestionId) return;
        ws.data.latestTranscript = text;
        send(ws, { type: "transcript", text, final: false });
        if (ws.data.stopping) void finishSarvamStt(ws);
      },
      (error) => console.log("Sarvam STT unavailable", error),
    );
    ws.data.sarvamStt = socket;
    ws.data.sarvamSttLanguage = ws.data.language;
    return socket;
  } catch (error) {
    console.log("Sarvam STT could not open", error);
    return null;
  }
}

async function speakQuestion(ws: Bun.ServerWebSocket<Session>): Promise<void> {
  const question = nextQuestion(ws.data.profile);
  if (!question || !providers[ws.data.provider]) return;

  const speech = ws.data.speech + 1;
  ws.data.speech = speech;
  send(ws, { type: "tts_start", contentType: "audio/mpeg" });
  try {
    const text = question.copy[ws.data.language];
    const audio = ws.data.provider === "sarvam"
      ? streamSarvamSpeech(sarvam!, text, ws.data.language)
      : streamOpenAISpeech(openai!, text, ws.data.language);
    for await (const chunk of audio) {
      if (ws.data.speech !== speech) return;
      ws.send(chunk);
    }
  } catch (error) {
    console.log(`${ws.data.provider} TTS unavailable`, error);
  } finally {
    if (ws.data.speech === speech) send(ws, { type: "tts_end" });
  }
}

async function applyTranscript(
  ws: Bun.ServerWebSocket<Session>,
  questionId: string,
  transcript: string,
): Promise<void> {
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
  const provider = ws.data.provider;
  const extractor = provider === "sarvam" && sarvam
    ? (pending: typeof question, text: string) => extractWithSarvam(sarvam, pending, text)
    : provider === "openai" && openai
      ? (pending: typeof question, text: string) => extractWithOpenAI(openai, pending, text)
      : null;
  try {
    const result = await extractAnswer(question, transcript, extractor, provider);
    if (!isCurrentGeneration(generation, ws.data.generation)) return;
    if (result.value === null) {
      send(ws, { type: "unclear", questionId });
      return;
    }
    const latestProfile = ws.data.workspace.profile;
    const updatedProfile = applyAnswerToCurrentQuestion(
      latestProfile,
      questionId,
      result.value,
    );
    if (!updatedProfile) {
      ws.data.profile = latestProfile;
      send(ws, {
        type: "error",
        code: "stale_question",
        message: "The question changed while documents were being organized.",
      });
      sendState(ws);
      return;
    }
    ws.data.profile = updatedProfile;
    ws.data.workspace.profile = ws.data.profile;
    await saveProfile(ws.data.workspace, ws.data.profile);
    ws.data.transcript.push({
      questionId,
      label: question.label,
      question: question.copy,
      answer: transcript,
    });
    send(ws, { type: "answer", questionId, text: transcript, value: result.value });
    sendState(ws);
  } finally {
    ws.data.busy = false;
  }

  void speakQuestion(ws);
}

async function finishSarvamStt(ws: Bun.ServerWebSocket<Session>): Promise<void> {
  if (!ws.data.stopping) return;
  ws.data.stopping = false;
  const questionId = ws.data.sttQuestionId;
  const transcript = ws.data.latestTranscript;
  ws.data.sttQuestionId = null;
  ws.data.latestTranscript = "";
  if (questionId && transcript) {
    send(ws, { type: "transcript", text: transcript, final: true });
    await applyTranscript(ws, questionId, transcript);
  } else if (questionId) {
    send(ws, { type: "unclear", questionId });
  }
}

async function finishOpenAIStt(ws: Bun.ServerWebSocket<Session>): Promise<void> {
  const questionId = ws.data.sttQuestionId;
  const recording = ws.data.recording;
  ws.data.sttQuestionId = null;
  ws.data.recording = null;
  if (!openai || !questionId || !recording) return;

  try {
    const transcript = await transcribeRecording(openai, recording, ws.data.language);
    if (!transcript) {
      send(ws, { type: "unclear", questionId });
      return;
    }
    send(ws, { type: "transcript", text: transcript, final: true });
    await applyTranscript(ws, questionId, transcript);
  } catch (error) {
    console.log("OpenAI transcription unavailable", error);
    send(ws, {
      type: "error",
      code: "voice_unavailable",
      message: "OpenAI transcription failed. Type your answer below.",
    });
  }
}

function stopVoice(ws: Bun.ServerWebSocket<Session>): void {
  ws.data.sttQuestionId = null;
  ws.data.latestTranscript = "";
  ws.data.stopping = false;
  ws.data.recording = null;
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
      const estateId = url.searchParams.get("estate");
      if (!isEstateId(estateId)) {
        return new Response("Invalid estate id", { status: 400 });
      }
      const workspace = await workspaceFor(estateId);
      return server.upgrade(request, { data: initialSession(workspace) })
        ? undefined : new Response("WebSocket upgrade failed", { status: 400 });
    }
    if (url.pathname === "/api/documents" && request.method === "POST") {
      const origin = request.headers.get("origin");
      if (origin && new URL(origin).host !== url.host) {
        return new Response("Forbidden", { status: 403 });
      }
      const estateId = url.searchParams.get("estate");
      if (!isEstateId(estateId)) {
        return Response.json({ error: "Invalid estate id" }, { status: 400 });
      }
      const workspace = await workspaceFor(estateId);
      const form = await request.formData();
      const languageValue = form.get("language");
      const language = typeof languageValue === "string" && isInterviewLanguage(languageValue)
        ? languageValue
        : "en-IN";
      const files = form.getAll("documents").filter((value): value is File => value instanceof File);
      if (!files.length || files.length > MAX_DOCUMENTS_PER_UPLOAD) {
        return Response.json(
          { error: `Choose between 1 and ${MAX_DOCUMENTS_PER_UPLOAD} documents.` },
          { status: 400 },
        );
      }
      const invalid = files.find((file) =>
        file.size === 0 || file.size > MAX_DOCUMENT_SIZE || !isSupportedDocument(file)
      );
      if (invalid) {
        return Response.json(
          { error: `${invalid.name} must be a PDF, image, or text file under 20 MB.` },
          { status: 400 },
        );
      }

      const processed = [];
      for (const file of files) {
        processed.push(await processDocument(estateId, file, sarvamApiKey, language));
      }
      for (const document of processed) {
        addStoredDocument(workspace, document);
        workspace.profile = applyDocumentMatches(workspace.profile, document);
      }
      await saveWorkspace(workspace);
      const claimSet = deriveClaims(workspace.profile);
      return Response.json({
        profile: workspace.profile,
        claimSet,
        documentStore: {
          documents: workspace.documents,
          estateMap: buildEstateMap(claimSet, workspace.documents),
        },
      });
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

    if (url.pathname === "/tokens-v2.js") {
      return new Response(tokensV2, { headers: { "Content-Type": "text/javascript" } });
    }

    if (url.pathname === "/v2") {
      return new Response(landingV2, { headers: { "Content-Type": "text/html" } });
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
        if (data.byteLength > 128_000) return;
        if (ws.data.provider === "sarvam") {
          if (!ws.data.sarvamStt) return;
          if (!sendPcm16(ws.data.sarvamStt, new Uint8Array(data))) {
            closeTranscription(ws.data.sarvamStt);
            ws.data.sarvamStt = null;
            ws.data.sarvamSttLanguage = null;
            send(ws, { type: "error", code: "voice_dropped", message: "Voice connection dropped. Press and speak again." });
          }
        } else if (
          ws.data.recording
          && !appendPcm16(ws.data.recording, new Uint8Array(data))
        ) {
          stopVoice(ws);
          send(ws, { type: "error", code: "voice_too_long", message: "That answer was too long. Press and give a shorter answer." });
        }
        return;
      }

      const message = parseClientMessage(data);
      if (!message) {
        send(ws, { type: "error", code: "invalid_message", message: "Invalid message." });
        return;
      }
      // HTTP document uploads and the interview share one workspace object.
      // Rejoin the latest profile before applying the next socket mutation.
      ws.data.profile = ws.data.workspace.profile;
      if (message.type === "start" || message.type === "set_language") {
        ws.data.language = message.language;
        sendState(ws);
        if (ws.data.provider === "sarvam") void ensureSarvamStream(ws);
        if (message.type === "start") await speakQuestion(ws);
      } else if (message.type === "set_provider") {
        stopVoice(ws);
        ws.data.speech += 1;
        ws.data.provider = message.provider;
        sendState(ws);
        if (message.provider === "sarvam") void ensureSarvamStream(ws);
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
        if (message.status !== "yes") {
          clearStoredDocumentMatch(ws.data.workspace, message.documentId);
        }
        ws.data.profile = {
          ...ws.data.profile,
          documents: {
            ...ws.data.profile.documents,
            [message.documentId]: message.status,
          },
        };
        ws.data.workspace.profile = ws.data.profile;
        await saveProfile(ws.data.workspace, ws.data.profile);
        sendState(ws);
      } else if (message.type === "reset") {
        closeTranscription(ws.data.sarvamStt);
        const { workspace, language, generation, provider } = ws.data;
        workspace.profile = workspace.documents.reduce<EstateProfile>(
          (profile, document) => applyDocumentMatches(profile, document),
          {},
        );
        void saveWorkspace(workspace);
        ws.data = initialSession(workspace, language, generation + 1, provider);
        sendState(ws);
        if (ws.data.provider === "sarvam") void ensureSarvamStream(ws);
      } else if (message.type === "stt_start") {
        const current = nextQuestion(ws.data.profile);
        if (!providers[ws.data.provider] || current?.id !== message.questionId) {
          send(ws, { type: "error", code: "voice_unavailable", message: "Use typed input." });
          return;
        }
        ws.data.sttQuestionId = message.questionId;
        if (ws.data.provider === "openai") {
          ws.data.recording = createRecording();
          send(ws, { type: "stt_ready" });
        } else {
          ws.data.latestTranscript = "";
          ws.data.stopping = false;
          const stream = await ensureSarvamStream(ws);
          if (!stream) {
            stopVoice(ws);
            send(ws, { type: "error", code: "voice_unavailable", message: "Use typed input." });
            return;
          }
          send(ws, { type: "stt_ready" });
        }
      } else if (message.type === "stt_stop") {
        if (ws.data.provider === "openai" && ws.data.recording) {
          await finishOpenAIStt(ws);
        } else if (ws.data.provider === "sarvam" && ws.data.sarvamStt) {
          ws.data.stopping = true;
          if (!finishTranscription(ws.data.sarvamStt)) {
            closeTranscription(ws.data.sarvamStt);
            ws.data.sarvamStt = null;
            ws.data.sarvamSttLanguage = null;
            void finishSarvamStt(ws);
            return;
          }
          setTimeout(() => void finishSarvamStt(ws), 350);
        }
      }
    },
    close(ws) {
      closeTranscription(ws.data.sarvamStt);
    },
  },
});

console.log(`Virasat: http://localhost:${server.port} (landing) · /app (voice interview)`);
console.log(
  `Voice providers: Sarvam ${providers.sarvam ? "ready" : "missing key"} · OpenAI ${providers.openai ? "ready" : "missing key"}`,
);
