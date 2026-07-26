import type { SarvamAIClient } from "sarvamai";
import type { InterviewLanguage } from "../voice/config.ts";

export async function* streamSpeech(
  client: SarvamAIClient,
  text: string,
  language: InterviewLanguage,
): AsyncGenerator<Uint8Array> {
  if (!text.trim() || text.length > 2_500) return;

  // The SDK's WebSocket TTS type only permits Bulbul v2. convertStream exposes
  // Bulbul v3 without casts and still lets Bun relay chunks as they arrive.
  const audio = await client.textToSpeech.convertStream({
    text,
    target_language_code: language,
    model: "bulbul:v3",
    speaker: "shubh",
    pace: 0.9,
    output_audio_codec: "mp3",
  });
  const stream = audio.stream();
  if (!stream) return;

  const reader = stream.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    yield value;
  }
}
