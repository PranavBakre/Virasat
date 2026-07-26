import { describe, expect, test } from "bun:test";
import { extractLocally } from "./extract.ts";
import { questionById } from "./questions.ts";

function question(id: string) {
  const result = questionById(id);
  if (!result) throw new Error(`Missing question ${id}`);
  return result;
}

describe("deterministic extraction fallback", () => {
  test("classifies authored-language answers", () => {
    expect(extractLocally(question("banks"), "ಹೌದು, ಬ್ಯಾಂಕ್ ಖಾತೆ ಇತ್ತು")).toBe("yes");
    expect(extractLocally(question("insurance"), "नहीं")).toBe("no");
    expect(extractLocally(question("epfo"), "I don't know")).toBe("unknown");
    expect(extractLocally(question("bank-amount"), "5L-15L")).toBe("5L-15L");
  });

  test("extracts the pending field and ignores volunteered fields", () => {
    expect(extractLocally(
      question("employment"),
      "He was working, and there was also an SBI account",
    )).toBe("employed-at-death");
  });

  test("returns null for unbounded or ambiguous input", () => {
    expect(extractLocally(question("banks"), "perhaps later")).toBeNull();
    expect(extractLocally(question("banks"), "x".repeat(501))).toBeNull();
  });

  test("prioritises applied over a nearby no", () => {
    expect(extractLocally(
      question("death-certificate"),
      "No certificate yet, but we applied already",
    )).toBe("applied");
  });

  test("bounds free-text labels", () => {
    expect(extractLocally(question("district"), "  Bengaluru   Urban ")).toBe("Bengaluru Urban");
    expect(extractLocally(question("district"), "x".repeat(81))).toBeNull();
  });
});
