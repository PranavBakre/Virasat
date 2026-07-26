import type OpenAI from "openai";
import type { InterviewLanguage } from "../voice/config.ts";
import { OPENAI_MODELS } from "./config.ts";

export async function* streamSpeech(
  client: OpenAI,
  text: string,
  language: InterviewLanguage,
): AsyncGenerator<Uint8Array> {
  if (!text.trim() || text.length > 2_500) return;

  const response = await client.audio.speech.create({
    model: OPENAI_MODELS.speech,
    voice: "coral",
    input: text,
    instructions: [
      "Speak gently and clearly to an adult handling family paperwork after a death.",
      "Use an Indian accent and an unhurried pace.",
      `Read the supplied ${language} text exactly without translating it or adding commentary.`,
    ].join(" "),
    response_format: "mp3",
    speed: 0.9,
  });
  if (!response.body) return;

  const reader = response.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    yield value;
  }
}
