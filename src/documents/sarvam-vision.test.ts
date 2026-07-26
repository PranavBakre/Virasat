import { describe, expect, test } from "bun:test";
import { createRateLimitedRequester } from "./sarvam-vision.ts";

describe("Sarvam Vision request limiting", () => {
  test("serializes requests at the configured interval", async () => {
    let clock = 0;
    const requestTimes: number[] = [];
    const requester = createRateLimitedRequester({
      intervalMs: 6_000,
      now: () => clock,
      sleep: async (milliseconds) => {
        clock += milliseconds;
      },
      fetcher: async () => {
        requestTimes.push(clock);
        return new Response("{}", { status: 200 });
      },
    });

    await Promise.all([
      requester("https://api.sarvam.ai/one"),
      requester("https://api.sarvam.ai/two"),
      requester("https://api.sarvam.ai/three"),
    ]);

    expect(requestTimes).toEqual([0, 6_000, 12_000]);
  });

  test("retries 429 and 503 responses with backoff", async () => {
    let clock = 0;
    const requestTimes: number[] = [];
    const statuses = [429, 503, 200];
    const requester = createRateLimitedRequester({
      intervalMs: 100,
      now: () => clock,
      sleep: async (milliseconds) => {
        clock += milliseconds;
      },
      fetcher: async () => {
        requestTimes.push(clock);
        const status = statuses.shift() ?? 200;
        return new Response("{}", {
          status,
          headers: status === 429 ? { "retry-after": "2" } : {},
        });
      },
    });

    const response = await requester("https://api.sarvam.ai/retry");

    expect(response.status).toBe(200);
    expect(requestTimes).toEqual([0, 2_000, 4_000]);
  });
});
