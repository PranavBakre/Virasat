import { SarvamAIClient } from "sarvamai";

export const SUPPORTED_LANGUAGES = ["kn-IN", "hi-IN", "en-IN"] as const;
export type InterviewLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export function isInterviewLanguage(value: unknown): value is InterviewLanguage {
  return typeof value === "string"
    && SUPPORTED_LANGUAGES.includes(value as InterviewLanguage);
}

export function getSarvamApiKey(): string | null {
  const key = process.env.SARVAM_API_KEY?.trim();
  return key ? key : null;
}

export function createSarvamClient(apiKey = getSarvamApiKey()): SarvamAIClient {
  if (!apiKey) throw new Error("SARVAM_API_KEY is not configured");
  return new SarvamAIClient({ apiSubscriptionKey: apiKey });
}
