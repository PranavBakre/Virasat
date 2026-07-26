import { describe, expect, test } from "bun:test";
import { extractFastPath, extractLocally } from "./extract.ts";
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

  test("never lets an unknown answer collapse into no", () => {
    // The failure this product exists to prevent. "ಗೊತ್ತಿಲ್ಲ" contains "ಇಲ್ಲ" and
    // "no idea" contains "no", so a naive order records both as a firm no and
    // silently drops the claim that an unknown would have surfaced.
    for (const answer of ["no idea", "I don't know", "ಗೊತ್ತಿಲ್ಲ", "not sure"]) {
      expect(extractFastPath(question("epfo"), answer)).toBe("unknown");
      expect(extractLocally(question("epfo"), answer)).toBe("unknown");
    }
    // Where the question offers no unknown value, defer rather than guess "no".
    for (const answer of ["no idea", "I don't know"]) {
      expect(extractFastPath(question("death-certificate"), answer)).toBeNull();
      expect(extractLocally(question("death-certificate"), answer)).toBeNull();
    }
  });

  test("bounds free-text labels", () => {
    expect(extractLocally(question("district"), "  Bengaluru   Urban ")).toBe("Bengaluru Urban");
    expect(extractLocally(question("district"), "x".repeat(81))).toBeNull();
  });
  test("does not create a securities claim for an empty demat account", () => {
    for (const answer of ["They did, but it was empty", "The account had no holdings"]) {
      expect(extractFastPath(question("demat"), answer)).toBe("no");
      expect(extractLocally(question("demat"), answer)).toBe("no");
    }
  });
});

describe("fast path — resolves ordinary answers with no model call", () => {
  test("reads indirect affirmations and negations", () => {
    const dc = question("death-certificate");
    for (const answer of ["I do", "Yes, I do.", "I have it", "we got it last week",
      "it's with my brother", "in hand", "ಹೌದು"]) {
      expect(extractFastPath(dc, answer)).toBe("yes");
    }
    for (const answer of ["I don't have it yet", "not yet", "nope", "ಇಲ್ಲ", "नहीं"]) {
      expect(extractFastPath(dc, answer)).toBe("no");
    }
    expect(extractFastPath(dc, "we applied for it")).toBe("applied");
  });

  test("defers a sentence that carries both a negative and an affirmative", () => {
    // Late negation is what keyword matching gets backwards, so it must go to
    // the model rather than be guessed at.
    expect(extractFastPath(question("death-certificate"), "no, he did have one")).toBeNull();
  });

  test("does not read an affirmation out of a contraction", () => {
    // Substring matching finds "i do" inside "i don't" and "sure" inside "unsure".
    expect(extractFastPath(question("epfo"), "I don't think so")).not.toBe("yes");
    expect(extractFastPath(question("epfo"), "unsure")).toBe("unknown");
  });
});
