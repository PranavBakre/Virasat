import { describe, expect, test } from "bun:test";
import { parseClientMessage } from "./protocol.ts";

describe("browser protocol validation", () => {
  test("accepts the supported multiplexed events", () => {
    expect(parseClientMessage('{"type":"start","language":"kn-IN"}')).toEqual({
      type: "start", language: "kn-IN",
    });
    expect(parseClientMessage(
      '{"type":"typed_answer","questionId":"banks","text":"yes"}',
    )).toEqual({ type: "typed_answer", questionId: "banks", text: "yes" });
    expect(parseClientMessage(
      '{"type":"set_document","documentId":"death-certificate","status":"yes"}',
    )).toEqual({
      type: "set_document", documentId: "death-certificate", status: "yes",
    });
  });

  test("rejects invalid languages, statuses and oversized messages", () => {
    expect(parseClientMessage('{"type":"start","language":"fr-FR"}')).toBeNull();
    expect(parseClientMessage(
      '{"type":"set_document","documentId":"x","status":"maybe"}',
    )).toBeNull();
    expect(parseClientMessage("x".repeat(1_001))).toBeNull();
  });
});
