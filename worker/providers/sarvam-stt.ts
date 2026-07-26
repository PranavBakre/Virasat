import type { InterviewLanguage } from "../../src/voice/config.ts";

type TranscriptPayload = {
  type?: string;
  data?: { transcript?: string };
};

export class SarvamTranscription {
  private constructor(
    private readonly socket: WebSocket,
    private readonly onTranscript: (text: string) => void,
  ) {
    socket.addEventListener("message", (event) => this.handleMessage(event));
    socket.addEventListener("error", () => console.log("Sarvam STT unavailable"));
  }

  static open(
    apiKey: string,
    language: InterviewLanguage,
    onTranscript: (text: string) => void,
  ): Promise<SarvamTranscription> {
    const url = new URL("wss://api.sarvam.ai/speech-to-text/ws");
    url.searchParams.set("language-code", language);
    url.searchParams.set("input_audio_codec", "pcm_s16le");
    url.searchParams.set("sample_rate", "16000");
    url.searchParams.set("vad_signals", "true");
    url.searchParams.set("flush_signal", "true");
    url.searchParams.set("high_vad_sensitivity", "true");

    const socket = new WebSocket(
      url.toString(),
      [`api-subscription-key.${apiKey}`],
    );
    return new Promise((resolve, reject) => {
      socket.addEventListener("open", () => {
        resolve(new SarvamTranscription(socket, onTranscript));
      }, { once: true });
      socket.addEventListener("error", () => reject(new Error("Sarvam STT failed")), {
        once: true,
      });
    });
  }

  get isOpen(): boolean {
    return this.socket.readyState === WebSocket.OPEN;
  }

  send(bytes: Uint8Array): boolean {
    if (!this.isOpen) return false;
    this.socket.send(JSON.stringify({
      audio: {
        data: bytesToBase64(bytes),
        sample_rate: 16_000,
        encoding: "audio/wav",
      },
    }));
    return true;
  }

  flush(): boolean {
    if (!this.isOpen) return false;
    this.socket.send(JSON.stringify({ type: "flush" }));
    return true;
  }

  close(): void {
    this.socket.close(1000, "Interview closed");
  }

  private handleMessage(event: MessageEvent): void {
    if (typeof event.data !== "string") return;
    const payload = JSON.parse(event.data) as TranscriptPayload;
    if (payload.type === "error") {
      console.log("Sarvam STT rejected a frame", payload.data);
      return;
    }
    const transcript = payload.data?.transcript;
    if (payload.type === "data" && typeof transcript === "string") {
      this.onTranscript(transcript.trim());
    }
  }
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return btoa(binary);
}
