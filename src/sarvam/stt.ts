import type { SarvamAIClient } from "sarvamai";
import type { InterviewLanguage } from "./config.ts";

type SttSocket = Awaited<ReturnType<SarvamAIClient["speechToTextStreaming"]["connect"]>>;

export async function openTranscriptionStream(
  client: SarvamAIClient,
  apiKey: string,
  language: InterviewLanguage,
  onTranscript: (text: string) => void,
  onError: (error: Error) => void,
): Promise<SttSocket> {
  const socket = await client.speechToTextStreaming.connect({
    "language-code": language,
    "Api-Subscription-Key": apiKey,
    input_audio_codec: "pcm_s16le",
    sample_rate: "16000",
    vad_signals: "true",
    flush_signal: "true",
    reconnectAttempts: 2,
  });

  socket.on("message", (message) => {
    if (message.type !== "data" || !("transcript" in message.data)) return;
    if (typeof message.data.transcript === "string") {
      onTranscript(message.data.transcript.trim());
    }
  });
  socket.on("error", onError);
  await socket.waitForOpen();
  return socket;
}

export function sendPcm16(socket: SttSocket, bytes: Uint8Array): void {
  socket.transcribe({
    audio: Buffer.from(bytes).toString("base64"),
    sample_rate: 16_000,
    encoding: "pcm_s16le",
  });
}

export function finishTranscription(socket: SttSocket): void {
  socket.flush();
}

export function closeTranscription(socket: SttSocket | null): void {
  socket?.close();
}

export type { SttSocket };
