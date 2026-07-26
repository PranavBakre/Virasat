import OpenAI from "openai";

export const OPENAI_MODELS = {
  extraction: process.env.OPENAI_EXTRACTION_MODEL?.trim() || "gpt-5.6-luna",
  transcription: process.env.OPENAI_TRANSCRIBE_MODEL?.trim() || "gpt-4o-transcribe",
  speech: process.env.OPENAI_TTS_MODEL?.trim() || "gpt-4o-mini-tts",
} as const;

export function getOpenAIApiKey(): string | null {
  const key = process.env.OPENAI_API_KEY?.trim();
  return key ? key : null;
}

export function createOpenAIClient(apiKey = getOpenAIApiKey()): OpenAI {
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
  return new OpenAI({ apiKey });
}
