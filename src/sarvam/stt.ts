import type { SarvamAIClient } from "sarvamai";
import type { InterviewLanguage } from "../voice/config.ts";

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
    high_vad_sensitivity: "true",
    reconnectAttempts: 2,
  });
  configureStreamingSocketForBun(socket);

  socket.on("message", (message) => {
    if (message.type === "error") {
      console.log("Sarvam STT rejected a frame", message.data);
      return;
    }
    if (message.type !== "data" || !("transcript" in message.data)) return;
    if (typeof message.data.transcript === "string") {
      onTranscript(message.data.transcript.trim());
    }
  });
  socket.on("error", onError);
  await socket.waitForOpen();
  return socket;
}

export function configureStreamingSocketForBun(socket: SttSocket): void {
  socket.socket.binaryType = "arraybuffer";
}

export function isTranscriptionOpen(socket: SttSocket | null): boolean {
  return socket?.socket?.readyState === 1;
}

export function sendPcm16(socket: SttSocket, bytes: Uint8Array): boolean {
  if (!isTranscriptionOpen(socket)) return false;
  try {
    socket.transcribe({
      audio: Buffer.from(bytes).toString("base64"),
      sample_rate: 16_000,
      encoding: "audio/wav",
    });
    return true;
  } catch (error) {
    console.log("Sarvam STT send failed", error);
    return false;
  }
}

export function finishTranscription(socket: SttSocket): boolean {
  if (!isTranscriptionOpen(socket)) return false;
  try {
    socket.flush();
    return true;
  } catch (error) {
    console.log("Sarvam STT flush failed", error);
    return false;
  }
}

export function closeTranscription(socket: SttSocket | null): void {
  socket?.close();
}

export type { SttSocket };
