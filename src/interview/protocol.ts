import { isInterviewLanguage, type InterviewLanguage } from "../sarvam/config.ts";

export type ClientMessage =
  | { type: "start"; language: InterviewLanguage }
  | { type: "set_language"; language: InterviewLanguage }
  | { type: "typed_answer"; text: string; questionId: string }
  | { type: "stt_start"; questionId: string }
  | { type: "stt_stop" }
  | { type: "set_document"; documentId: string; status: "yes" | "no" | "unknown" }
  | { type: "reset" };

export type ServerMessage =
  | { type: "state"; payload: unknown }
  | { type: "stt_ready" }
  | { type: "transcript"; text: string; final: boolean }
  | { type: "answer"; questionId: string; text: string; value: string }
  | { type: "unclear"; questionId: string }
  | { type: "tts_start"; contentType: string }
  | { type: "tts_end" }
  | { type: "error"; code: string; message: string };

export function parseClientMessage(raw: string): ClientMessage | null {
  if (raw.length > 1_000) return null;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!value || typeof value !== "object") return null;
  const message = value as Record<string, unknown>;

  if ((message.type === "start" || message.type === "set_language")
    && isInterviewLanguage(message.language)) {
    return { type: message.type, language: message.language };
  }
  if (message.type === "typed_answer"
    && isShortString(message.text, 500) && isShortString(message.questionId, 80)) {
    return { type: "typed_answer", text: message.text, questionId: message.questionId };
  }
  if (message.type === "stt_start" && isShortString(message.questionId, 80)) {
    return { type: "stt_start", questionId: message.questionId };
  }
  if (message.type === "set_document"
    && isShortString(message.documentId, 100)
    && (message.status === "yes" || message.status === "no" || message.status === "unknown")) {
    return {
      type: "set_document",
      documentId: message.documentId,
      status: message.status,
    };
  }
  if (message.type === "stt_stop" || message.type === "reset") {
    return { type: message.type };
  }
  return null;
}

function isShortString(value: unknown, max: number): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= max;
}
