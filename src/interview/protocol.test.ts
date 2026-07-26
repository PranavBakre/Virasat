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
    expect(parseClientMessage('{"type":"set_provider","provider":"openai"}')).toEqual({
      type: "set_provider", provider: "openai",
    });
    expect(parseClientMessage('{"type":"chat","text":"Sorry, could you repeat that?"}')).toEqual({
      type: "chat", text: "Sorry, could you repeat that?",
    });
    expect(parseClientMessage('{"type":"stop_generation"}')).toEqual({
      type: "stop_generation",
    });
  });

  test("rejects invalid languages, statuses and oversized messages", () => {
    expect(parseClientMessage('{"type":"start","language":"fr-FR"}')).toBeNull();
    expect(parseClientMessage('{"type":"set_provider","provider":"other"}')).toBeNull();
    expect(parseClientMessage(
      '{"type":"set_document","documentId":"x","status":"maybe"}',
    )).toBeNull();
    expect(parseClientMessage("x".repeat(1_001))).toBeNull();
    expect(parseClientMessage('{"type":"chat","text":"   "}')).toBeNull();
  });
});
