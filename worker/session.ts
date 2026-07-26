import { extractAnswer } from "../src/interview/extract.ts";
import { applyQuestionAnswer, nextQuestion } from "../src/interview/state.ts";
import type { QuestionCopy } from "../src/interview/questions.ts";
import { parseClientMessage, type ServerMessage } from "../src/interview/protocol.ts";
import { isCurrentGeneration } from "../src/interview/session.ts";
import {
  appendPcm16,
  createRecording,
  type PcmRecording,
} from "../src/voice/pcm.ts";
import { deriveClaims } from "../src/rules/engine.ts";
import type { EstateProfile } from "../src/rules/types.ts";
import type { InterviewLanguage, VoiceProvider } from "../src/voice/config.ts";
import type { Env } from "./env.ts";
import {
  extractWithOpenAI,
  streamOpenAISpeech,
  transcribeWithOpenAI,
} from "./providers/openai.ts";
import { SarvamTranscription } from "./providers/sarvam-stt.ts";
import { extractWithSarvam, streamSarvamSpeech } from "./providers/sarvam.ts";

type TranscriptEntry = {
  questionId: string;
  label: string;
  question: QuestionCopy;
  answer: string;
};

type SessionState = {
  profile: EstateProfile;
  language: InterviewLanguage;
  provider: VoiceProvider;
  transcript: TranscriptEntry[];
  sarvamStt: SarvamTranscription | null;
  sarvamSttLanguage: InterviewLanguage | null;
  recording: PcmRecording | null;
  sttQuestionId: string | null;
  latestTranscript: string;
  stopping: boolean;
  speech: number;
  generation: number;
  busy: boolean;
};

export class InterviewSession {
  private state: SessionState;

  constructor(
    private readonly socket: WebSocket,
    private readonly env: Env,
  ) {
    this.state = {
      profile: {},
      language: "en-IN",
      provider: this.defaultProvider(),
      transcript: [],
      sarvamStt: null,
      sarvamSttLanguage: null,
      recording: null,
      sttQuestionId: null,
      latestTranscript: "",
      stopping: false,
      speech: 0,
      generation: 0,
      busy: false,
    };
  }

  start(): void {
    this.socket.addEventListener("message", (event) => {
      if (typeof event.data === "string") {
        void this.handleTextMessage(event.data);
      } else if (event.data instanceof ArrayBuffer) {
        this.handleAudio(new Uint8Array(event.data));
      }
    });
    this.socket.addEventListener("close", (event) => {
      this.state.sarvamStt?.close();
      this.socket.close(event.code, event.reason);
    });
    this.sendState();
  }

  private async ensureSarvamStream(): Promise<SarvamTranscription | null> {
    if (!this.env.SARVAM_API_KEY) return null;
    if (
      this.state.sarvamStt?.isOpen
      && this.state.sarvamSttLanguage === this.state.language
    ) {
      return this.state.sarvamStt;
    }
    this.state.sarvamStt?.close();
    this.state.sarvamStt = null;
    this.state.sarvamSttLanguage = null;
    try {
      const stream = await SarvamTranscription.open(
        this.env.SARVAM_API_KEY,
        this.state.language,
        (text) => {
          if (this.state.provider !== "sarvam" || !this.state.sttQuestionId) return;
          this.state.latestTranscript = text;
          this.send({ type: "transcript", text, final: false });
          if (this.state.stopping) void this.finishSarvamStt();
        },
      );
      this.state.sarvamStt = stream;
      this.state.sarvamSttLanguage = this.state.language;
      return stream;
    } catch (error) {
      console.log("Sarvam STT could not open", error);
      return null;
    }
  }

  private handleAudio(bytes: Uint8Array): void {
    if (bytes.byteLength > 128_000) return;
    if (this.state.provider === "sarvam") {
      if (!this.state.sarvamStt?.send(bytes)) {
        this.state.sarvamStt?.close();
        this.state.sarvamStt = null;
        this.state.sarvamSttLanguage = null;
        this.stopVoice();
        this.send({
          type: "error",
          code: "voice_dropped",
          message: "Voice connection dropped. Press and speak again.",
        });
      }
    } else if (this.state.recording && !appendPcm16(this.state.recording, bytes)) {
      this.stopVoice();
      this.send({
        type: "error",
        code: "voice_too_long",
        message: "That answer was too long. Press and give a shorter answer.",
      });
    }
  }

  private async handleTextMessage(raw: string): Promise<void> {
    const message = parseClientMessage(raw);
    if (!message) {
      this.send({ type: "error", code: "invalid_message", message: "Invalid message." });
      return;
    }
    if (message.type === "start" || message.type === "set_language") {
      this.state.language = message.language;
      this.sendState();
      if (this.state.provider === "sarvam") void this.ensureSarvamStream();
      if (message.type === "start") await this.speakQuestion();
      return;
    }
    if (message.type === "set_provider") {
      this.stopVoice();
      this.state.speech += 1;
      this.state.provider = message.provider;
      this.sendState();
      if (message.provider === "sarvam") void this.ensureSarvamStream();
      return;
    }
    if (message.type === "typed_answer") {
      await this.applyTranscript(message.questionId, message.text);
      return;
    }
    if (message.type === "set_document") {
      this.setDocument(message.documentId, message.status);
      return;
    }
    if (message.type === "reset") {
      this.state.sarvamStt?.close();
      this.state = {
        ...this.state,
        profile: {},
        transcript: [],
        sarvamStt: null,
        sarvamSttLanguage: null,
        recording: null,
        sttQuestionId: null,
        latestTranscript: "",
        stopping: false,
        speech: this.state.speech + 1,
        generation: this.state.generation + 1,
        busy: false,
      };
      this.sendState();
      if (this.state.provider === "sarvam") void this.ensureSarvamStream();
      return;
    }
    if (message.type === "stt_start") {
      const current = nextQuestion(this.state.profile);
      const available = this.state.provider === "sarvam"
        ? Boolean(this.env.SARVAM_API_KEY)
        : Boolean(this.env.OPENAI_API_KEY);
      if (!available || current?.id !== message.questionId) {
        this.send({
          type: "error",
          code: "voice_unavailable",
          message: "Use typed input.",
        });
        return;
      }
      this.state.sttQuestionId = message.questionId;
      if (this.state.provider === "openai") {
        this.state.recording = createRecording();
        this.send({ type: "stt_ready" });
      } else {
        this.state.latestTranscript = "";
        this.state.stopping = false;
        const stream = await this.ensureSarvamStream();
        if (!stream) {
          this.stopVoice();
          this.send({
            type: "error",
            code: "voice_unavailable",
            message: "Use typed input.",
          });
          return;
        }
        this.send({ type: "stt_ready" });
      }
      return;
    }
    if (message.type === "stt_stop") {
      if (this.state.provider === "openai" && this.state.recording) {
        await this.finishOpenAIStt();
      } else if (this.state.provider === "sarvam" && this.state.sarvamStt) {
        this.state.stopping = true;
        if (!this.state.sarvamStt.flush()) {
          this.state.sarvamStt.close();
          this.state.sarvamStt = null;
          this.state.sarvamSttLanguage = null;
          void this.finishSarvamStt();
          return;
        }
        setTimeout(() => void this.finishSarvamStt(), 350);
      }
    }
  }

  private setDocument(
    documentId: string,
    status: "yes" | "no" | "unknown",
  ): void {
    const knownIds = new Set(
      deriveClaims(this.state.profile).claims.flatMap((claim) =>
        claim.docsRequired.map((document) => document.id)
      ),
    );
    if (!knownIds.has(documentId)) {
      this.send({
        type: "error",
        code: "unknown_document",
        message: "Unknown document.",
      });
      return;
    }
    this.state.profile = {
      ...this.state.profile,
      documents: {
        ...this.state.profile.documents,
        [documentId]: status,
      },
    };
    this.sendState();
  }

  private async applyTranscript(questionId: string, transcript: string): Promise<void> {
    if (this.state.busy) {
      this.send({ type: "error", code: "busy", message: "Still reading your last answer." });
      return;
    }
    const question = nextQuestion(this.state.profile);
    if (!question || question.id !== questionId) {
      this.send({
        type: "error",
        code: "stale_question",
        message: "The question has changed.",
      });
      return;
    }

    this.state.busy = true;
    const generation = this.state.generation;
    try {
      const extractor = this.state.provider === "sarvam" && this.env.SARVAM_API_KEY
        ? (pending: typeof question, text: string) =>
          extractWithSarvam(this.env, pending, text)
        : this.state.provider === "openai" && this.env.OPENAI_API_KEY
          ? (pending: typeof question, text: string) =>
            extractWithOpenAI(this.env, pending, text)
          : null;
      const result = await extractAnswer(
        question,
        transcript,
        extractor,
        this.state.provider,
      );
      if (!isCurrentGeneration(generation, this.state.generation)) return;
      if (result.value === null) {
        this.send({ type: "unclear", questionId });
        return;
      }
      this.state.profile = applyQuestionAnswer(this.state.profile, question, result.value);
      this.state.transcript.push({
        questionId,
        label: question.label,
        question: question.copy,
        answer: transcript,
      });
      this.send({ type: "answer", questionId, text: transcript, value: result.value });
      this.sendState();
    } finally {
      this.state.busy = false;
    }
    void this.speakQuestion();
  }

  private async speakQuestion(): Promise<void> {
    const question = nextQuestion(this.state.profile);
    const voiceAvailable = this.state.provider === "sarvam"
      ? Boolean(this.env.SARVAM_API_KEY)
      : Boolean(this.env.OPENAI_API_KEY);
    if (!question || !voiceAvailable) return;

    const speech = this.state.speech + 1;
    this.state.speech = speech;
    this.send({ type: "tts_start", contentType: "audio/mpeg" });
    try {
      const text = question.copy[this.state.language];
      const audio = this.state.provider === "sarvam"
        ? streamSarvamSpeech(this.env, text, this.state.language)
        : streamOpenAISpeech(this.env, text, this.state.language);
      for await (const chunk of audio) {
        if (this.state.speech !== speech) return;
        this.socket.send(chunk);
      }
    } catch (error) {
      console.log(`${this.state.provider} TTS unavailable`, error);
    } finally {
      if (this.state.speech === speech) this.send({ type: "tts_end" });
    }
  }

  private async finishOpenAIStt(): Promise<void> {
    const questionId = this.state.sttQuestionId;
    const recording = this.state.recording;
    this.state.sttQuestionId = null;
    this.state.recording = null;
    if (!questionId || !recording) return;
    try {
      const transcript = await transcribeWithOpenAI(
        this.env,
        recording,
        this.state.language,
      );
      if (!transcript) {
        this.send({ type: "unclear", questionId });
        return;
      }
      this.send({ type: "transcript", text: transcript, final: true });
      await this.applyTranscript(questionId, transcript);
    } catch (error) {
      console.log("OpenAI transcription unavailable", error);
      this.send({
        type: "error",
        code: "voice_unavailable",
        message: "OpenAI transcription failed. Type your answer below.",
      });
    }
  }

  private async finishSarvamStt(): Promise<void> {
    if (!this.state.stopping) return;
    this.state.stopping = false;
    const questionId = this.state.sttQuestionId;
    const transcript = this.state.latestTranscript;
    this.state.sttQuestionId = null;
    this.state.latestTranscript = "";
    if (questionId && transcript) {
      this.send({ type: "transcript", text: transcript, final: true });
      await this.applyTranscript(questionId, transcript);
    } else if (questionId) {
      this.send({ type: "unclear", questionId });
    }
  }

  private stopVoice(): void {
    this.state.sttQuestionId = null;
    this.state.latestTranscript = "";
    this.state.stopping = false;
    this.state.recording = null;
  }

  private defaultProvider(): VoiceProvider {
    if (this.env.VOICE_PROVIDER === "sarvam" || this.env.VOICE_PROVIDER === "openai") {
      return this.env.VOICE_PROVIDER;
    }
    if (this.env.SARVAM_API_KEY) return "sarvam";
    if (this.env.OPENAI_API_KEY) return "openai";
    return "sarvam";
  }

  private send(message: ServerMessage): void {
    this.socket.send(JSON.stringify(message));
  }

  private sendState(): void {
    const question = nextQuestion(this.state.profile);
    const providers = {
      sarvam: Boolean(this.env.SARVAM_API_KEY),
      openai: Boolean(this.env.OPENAI_API_KEY),
    };
    this.send({
      type: "state",
      payload: {
        profile: this.state.profile,
        claimSet: deriveClaims(this.state.profile),
        transcript: this.state.transcript,
        language: this.state.language,
        provider: this.state.provider,
        providers,
        voiceAvailable: providers[this.state.provider],
        question: question
          ? { id: question.id, label: question.label, copy: question.copy }
          : null,
      },
    });
  }
}
