import { SarvamAIClient } from "sarvamai";
export function getSarvamApiKey(): string | null {
  const key = process.env.SARVAM_API_KEY?.trim();
  return key ? key : null;
}

export function createSarvamClient(apiKey = getSarvamApiKey()): SarvamAIClient {
  if (!apiKey) throw new Error("SARVAM_API_KEY is not configured");
  return new SarvamAIClient({ apiSubscriptionKey: apiKey });
}
