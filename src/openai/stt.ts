import type OpenAI from "openai";
import type { InterviewLanguage } from "../voice/config.ts";
import { OPENAI_MODELS } from "./config.ts";

const SAMPLE_RATE = 16_000;
const BYTES_PER_SAMPLE = 2;
const MAX_AUDIO_BYTES = SAMPLE_RATE * BYTES_PER_SAMPLE * 45;

export type PcmRecording = {
  chunks: Uint8Array[];
  byteLength: number;
};

export function createRecording(): PcmRecording {
  return { chunks: [], byteLength: 0 };
}

export function appendPcm16(recording: PcmRecording, bytes: Uint8Array): boolean {
  if (bytes.byteLength === 0) return true;
  if (recording.byteLength + bytes.byteLength > MAX_AUDIO_BYTES) return false;
  recording.chunks.push(bytes.slice());
  recording.byteLength += bytes.byteLength;
  return true;
}

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

export function pcm16ToWav(recording: PcmRecording): Uint8Array {
  const headerSize = 44;
  const output = new Uint8Array(headerSize + recording.byteLength);
  const view = new DataView(output.buffer);

  writeAscii(output, 0, "RIFF");
  view.setUint32(4, 36 + recording.byteLength, true);
  writeAscii(output, 8, "WAVE");
  writeAscii(output, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * BYTES_PER_SAMPLE, true);
  view.setUint16(32, BYTES_PER_SAMPLE, true);
  view.setUint16(34, 16, true);
  writeAscii(output, 36, "data");
  view.setUint32(40, recording.byteLength, true);

  let offset = headerSize;
  for (const chunk of recording.chunks) {
    output.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return output;
}

function writeAscii(target: Uint8Array, offset: number, value: string): void {
  for (let index = 0; index < value.length; index += 1) {
    target[offset + index] = value.charCodeAt(index);
  }
}
