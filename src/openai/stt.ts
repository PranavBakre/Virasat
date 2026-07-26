import type OpenAI from "openai";
import type { InterviewLanguage } from "../voice/config.ts";
import {
  pcm16ToWav,
  type PcmRecording,
} from "../voice/pcm.ts";
import { OPENAI_MODELS } from "./config.ts";

export {
  appendPcm16,
  createRecording,
  pcm16ToWav,
  type PcmRecording,
} from "../voice/pcm.ts";

export async function transcribeRecording(
  client: OpenAI,
  recording: PcmRecording,
  language: InterviewLanguage,
): Promise<string> {
  if (recording.byteLength === 0) return "";
  const wav = pcm16ToWav(recording);
  const wavBuffer = wav.buffer.slice(
    wav.byteOffset,
    wav.byteOffset + wav.byteLength,
  ) as ArrayBuffer;
  const response = await client.audio.transcriptions.create({
    file: new File([wavBuffer], "virasat-answer.wav", { type: "audio/wav" }),
    model: OPENAI_MODELS.transcription,
    language: language.split("-")[0],
    response_format: "json",
    prompt: "A short estate interview answer in Kannada, Hindi, English, or Indian code-mixed speech. Preserve bank, district, EPFO, UAN, pension, nominee, and insurance terms.",
  });
  return response.text.trim();
}
