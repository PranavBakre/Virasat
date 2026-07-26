import { expect, test } from "bun:test";
import { processDocuments } from "./process.ts";
import type { StoredDocument } from "./types.ts";

test("starts every document in a bulk upload concurrently", async () => {
  const files = [
    new File(["one"], "one.txt"),
    new File(["two"], "two.txt"),
    new File(["three"], "three.txt"),
  ];
  const started: string[] = [];
  const releases: Array<() => void> = [];

  const processing = processDocuments(
    "43c20216-ef27-44ac-980a-ddf9d2cd36b6",
    files,
    null,
    "en-IN",
    async (_estateId, file): Promise<StoredDocument> => {
      started.push(file.name);
      await new Promise<void>((resolve) => releases.push(resolve));
      return {
        id: file.name,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        uploadedAt: "2026-07-26T00:00:00.000Z",
        status: "needs-review",
        title: file.name,
        category: "Unsorted",
        matchedDocumentIds: [],
        confidence: 0,
      };
    },
  );

  expect(started).toEqual(["one.txt", "two.txt", "three.txt"]);
  for (const release of releases) release();

  expect((await processing).map((document) => document.originalName)).toEqual(
    ["one.txt", "two.txt", "three.txt"],
  );
});
