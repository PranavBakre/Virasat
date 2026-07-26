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
    // Answers here are short and often quiet — "ಹೌದು", "no". Default VAD
    // gating dropped them as non-speech, which read as the mic not working.
    high_vad_sensitivity: "true",
    reconnectAttempts: 2,
  });
  configureStreamingSocketForBun(socket);

  socket.on("message", (message) => {
    // Sarvam reports rejected frames as an in-band {type:"error"} message and
    // then closes cleanly. Dropping these made a validation error present itself
    // as a dropped connection, with nothing in the logs. Never swallow them.
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
  // sarvamai@1.1.7 defaults its reconnecting transport to browser-style
  // `blob`. Bun's native WebSocket rejects that value during its deferred
  // connection setup, so select Bun's supported binary representation first.
  socket.socket.binaryType = "arraybuffer";
}

// A socket held across presses can be closed by the far end while idle. The SDK
// throws "Socket is not open." from transcribe/flush, and that throw lands inside
// Bun's websocket message handler — so an idle-closed socket took down the whole
// turn instead of just reopening. Report liveness and never throw from here.
export function isTranscriptionOpen(socket: SttSocket | null): boolean {
  return socket?.socket?.readyState === 1;
}

export function sendPcm16(socket: SttSocket, bytes: Uint8Array): boolean {
  if (!isTranscriptionOpen(socket)) return false;
  try {
    socket.transcribe({
      audio: Buffer.from(bytes).toString("base64"),
      sample_rate: 16_000,
      // The only value Sarvam accepts here is "audio/wav" — and it is a
      // declared container, not a request to prepend a RIFF header: the bytes
      // stay raw PCM16, described by `input_audio_codec` at connect. Sending
      // "pcm_s16le" (the codec name, which reads like the honest answer) fails
      // validation server-side, and Sarvam responds by closing the socket with
      // code 1000 — a clean close that looks exactly like an idle timeout. That
      // is what "voice connection constantly dropping" was.
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
