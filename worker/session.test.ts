import { describe, expect, test } from "bun:test";
import type { Env } from "./env.ts";
import { InterviewSession } from "./session.ts";

class FakeSocket {
  readonly sent: Array<string | ArrayBuffer | ArrayBufferView> = [];
  private listeners = new Map<string, Array<(event: MessageEvent) => void>>();

  addEventListener(type: string, listener: (event: MessageEvent) => void): void {
    const listeners = this.listeners.get(type) ?? [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  send(value: string | ArrayBuffer | ArrayBufferView): void {
    this.sent.push(value);
  }

  emitMessage(value: string): void {
    for (const listener of this.listeners.get("message") ?? []) {
      listener({ data: value } as MessageEvent);
    }
  }

  messages(): Array<Record<string, any>> {
    return this.sent
      .filter((value): value is string => typeof value === "string")
      .map((value) => JSON.parse(value) as Record<string, any>);
  }
}

const env = {
  ASSETS: {} as Fetcher,
  VOICE_PROVIDER: "sarvam",
} satisfies Env;

describe("Cloudflare interview session", () => {
  test("advances a typed interview over a Worker WebSocket", async () => {
    const socket = new FakeSocket();
    const session = new InterviewSession(socket as unknown as WebSocket, env);
    session.start();

    expect(socket.messages()[0]?.payload.question.id).toBe("death-certificate");
    socket.emitMessage(JSON.stringify({
      type: "typed_answer",
      questionId: "death-certificate",
      text: "yes",
    }));
    await new Promise((resolve) => setTimeout(resolve, 0));

    const states = socket.messages().filter((message) => message.type === "state");
    expect(states.at(-1)?.payload.profile.deathCertificate).toBe("yes");
    expect(states.at(-1)?.payload.question.id).toBe("religion");
  });

  test("keeps voice disabled when no provider secret is bound", () => {
    const socket = new FakeSocket();
    new InterviewSession(socket as unknown as WebSocket, env).start();
    expect(socket.messages()[0]?.payload.providers).toEqual({
      sarvam: false,
      openai: false,
    });
  });

  test("starts an OpenAI recording only when its secret is bound", async () => {
    const socket = new FakeSocket();
    const session = new InterviewSession(socket as unknown as WebSocket, {
      ...env,
      VOICE_PROVIDER: "openai",
      OPENAI_API_KEY: "test-openai",
    });
    session.start();
    socket.emitMessage(JSON.stringify({
      type: "stt_start",
      questionId: "death-certificate",
    }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(socket.messages().at(-1)?.type).toBe("stt_ready");
  });
});
