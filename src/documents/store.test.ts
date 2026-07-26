import { expect, test } from "bun:test";
import { applyDocumentMatches, clearStoredDocumentMatch } from "./store.ts";
import type { EstateWorkspace } from "./types.ts";

test("removing an automatic match makes it reviewable and prevents reset reapplication", () => {
  const workspace: EstateWorkspace = {
    id: "11111111-1111-4111-8111-111111111111",
    profile: { documents: { "death-certificate": "yes" } },
    documents: [{
      id: "document-1",
      originalName: "scan.pdf",
      mimeType: "application/pdf",
      size: 100,
      uploadedAt: "2026-07-26T00:00:00.000Z",
      status: "organized",
      title: "Death certificate",
      category: "Identity and civil records",
      matchedDocumentIds: ["death-certificate"],
      confidence: 0.94,
    }],
    createdAt: "2026-07-26T00:00:00.000Z",
    updatedAt: "2026-07-26T00:00:00.000Z",
  };

  clearStoredDocumentMatch(workspace, "death-certificate");

  expect(workspace.documents[0]?.status).toBe("needs-review");
  expect(workspace.documents[0]?.matchedDocumentIds).toEqual([]);
  expect(applyDocumentMatches({}, workspace.documents[0]!)).toEqual({});
});
