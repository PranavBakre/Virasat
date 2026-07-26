export const SUPPORTED_LANGUAGES = ["kn-IN", "hi-IN", "en-IN"] as const;
export type InterviewLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const VOICE_PROVIDERS = ["sarvam", "openai"] as const;
export type VoiceProvider = (typeof VOICE_PROVIDERS)[number];

export function isInterviewLanguage(value: unknown): value is InterviewLanguage {
  return typeof value === "string"
    && SUPPORTED_LANGUAGES.includes(value as InterviewLanguage);
}

export function isVoiceProvider(value: unknown): value is VoiceProvider {
  return typeof value === "string"
    && VOICE_PROVIDERS.includes(value as VoiceProvider);
}
