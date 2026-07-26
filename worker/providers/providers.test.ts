import { describe, expect, test } from "bun:test";
import { questionById } from "../../src/interview/questions.ts";
import type { Env } from "../env.ts";
import { extractWithOpenAI } from "./openai.ts";
import { extractWithSarvam } from "./sarvam.ts";

const question = questionById("death-certificate")!;

describe("Worker provider transports", () => {
  test("calls OpenAI Responses with a server-side bearer token", async () => {
    const originalFetch = globalThis.fetch;
    let request: { url: string; init?: RequestInit } | undefined;
    globalThis.fetch = async (input, init) => {
      request = { url: String(input), init };
      return Response.json({
        output: [{ content: [{ type: "output_text", text: '{"value":"yes"}' }] }],
      });
    };
    try {
      const value = await extractWithOpenAI(
        { OPENAI_API_KEY: "test-openai" } as Env,
        question,
        "we have it",
      );
      expect(value).toBe("yes");
      expect(request?.url).toBe("https://api.openai.com/v1/responses");
      expect(new Headers(request?.init?.headers).get("Authorization"))
        .toBe("Bearer test-openai");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test("calls Sarvam chat with its bearer-token convention", async () => {
    const originalFetch = globalThis.fetch;
    let request: { url: string; init?: RequestInit } | undefined;
    globalThis.fetch = async (input, init) => {
      request = { url: String(input), init };
      return Response.json({
        choices: [{ message: { content: '{"value":"applied"}' } }],
      });
    };
    try {
      const value = await extractWithSarvam(
        { SARVAM_API_KEY: "test-sarvam" } as Env,
        question,
        "we applied",
      );
      expect(value).toBe("applied");
      expect(request?.url).toBe("https://api.sarvam.ai/v1/chat/completions");
      expect(new Headers(request?.init?.headers).get("Authorization"))
        .toBe("Bearer test-sarvam");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
