import { describe, expect, test } from "bun:test";
import { appendPcm16, createRecording, pcm16ToWav } from "./stt.ts";

describe("OpenAI transcription audio", () => {
  test("wraps browser PCM16 in a valid mono 16 kHz WAV container", () => {
    const recording = createRecording();
    expect(appendPcm16(recording, new Uint8Array([1, 2, 3, 4]))).toBe(true);

    const wav = pcm16ToWav(recording);
    const view = new DataView(wav.buffer);
    expect(new TextDecoder().decode(wav.slice(0, 4))).toBe("RIFF");
    expect(new TextDecoder().decode(wav.slice(8, 12))).toBe("WAVE");
    expect(view.getUint16(22, true)).toBe(1);
    expect(view.getUint32(24, true)).toBe(16_000);
    expect(view.getUint16(34, true)).toBe(16);
    expect(view.getUint32(40, true)).toBe(4);
    expect([...wav.slice(44)]).toEqual([1, 2, 3, 4]);
  });
});
