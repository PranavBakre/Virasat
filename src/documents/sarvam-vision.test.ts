import { describe, expect, test } from "bun:test";
import { zipSync } from "fflate";
import {
  createRateLimitedRequester,
  extractDigitizedText,
  uploadToSignedUrl,
} from "./sarvam-vision.ts";

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

describe("Sarvam Vision document upload", () => {
  test("uploads an Azure block blob with the required headers", async () => {
    let request: Request | undefined;

    await uploadToSignedUrl(
      "https://example.blob.core.windows.net/document.pdf",
      {
        name: "document.pdf",
        bytes: new Uint8Array([1, 2, 3]),
        type: "application/pdf",
      },
      async (input, init) => {
        request = new Request(input, init);
        return new Response(null, { status: 201 });
      },
    );

    expect(request?.method).toBe("PUT");
    expect(request?.headers.get("content-type")).toBe("application/pdf");
    expect(request?.headers.get("x-ms-blob-type")).toBe("BlockBlob");
    expect(new Uint8Array(await request!.arrayBuffer())).toEqual(new Uint8Array([1, 2, 3]));
  });

  test("includes the storage provider response when upload fails", async () => {
    const upload = uploadToSignedUrl(
      "https://example.blob.core.windows.net/document.pdf",
      {
        name: "document.pdf",
        bytes: new Uint8Array([1]),
        type: "application/pdf",
      },
      async () => new Response("<Code>MissingRequiredHeader</Code>", { status: 400 }),
    );

    await expect(upload).rejects.toThrow(
      "Document upload failed (400): <Code>MissingRequiredHeader</Code>",
    );
  });
});

describe("Sarvam Vision output extraction", () => {
  test("detects ZIP output even when storage returns a generic content type", () => {
    const output = zipSync({
      "document.md": new TextEncoder().encode("# Death certificate\nRegistration No 12"),
    });

    expect(extractDigitizedText(output, "application/octet-stream")).toContain(
      "Death certificate",
    );
    expect(extractDigitizedText(output, "application/octet-stream")).not.toContain("PK");
  });
});
