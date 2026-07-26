import { describe, expect, test } from "bun:test";
import {
  applyAnswerToCurrentQuestion,
  applyQuestionAnswer,
  nextQuestion,
} from "./state.ts";
import { questionById } from "./questions.ts";
import type { EstateProfile } from "../rules/types.ts";

describe("question routing", () => {
  test("asks hard gates first and stops on the probate track", () => {
    let profile: EstateProfile = {};
    expect(nextQuestion(profile)?.id).toBe("death-certificate");

    for (const [id, value] of [
      ["death-certificate", "yes"],
      ["religion", "hindu"],
      ["will", "yes"],
    ] as const) {
      const question = questionById(id);
      if (!question) throw new Error("missing question");
      profile = applyQuestionAnswer(profile, question, value);
    }
    expect(nextQuestion(profile)).toBeNull();
  });

  test("skips PF when the person was never salaried", () => {
    const profile: EstateProfile = {
      deathCertificate: "yes", religion: "hindu", will: "no",
      relationship: "spouse", district: "Mysuru", employment: "never-salaried",
    };
    expect(nextQuestion(profile)?.id).toBe("banks");
  });

  test("routes working to PF and retired to pension", () => {
    const base = {
      deathCertificate: "yes", religion: "hindu", will: "no",
      relationship: "spouse", district: "Mysuru",
    } as const;
    expect(nextQuestion({ ...base, employment: "employed-at-death" })?.id).toBe("epfo");
    expect(nextQuestion({ ...base, employment: "retired" })?.id).toBe("pension");
  });

  test("a question can write only its own field", () => {
    const question = questionById("banks");
    if (!question) throw new Error("missing question");
    const result = applyQuestionAnswer({ religion: "hindu" }, question, "yes");
    expect(result).toEqual({
      religion: "hindu",
      banks: { exists: "yes", accounts: [{ id: "bank-1" }] },
    });
    expect(() => applyQuestionAnswer({}, question, "commercial")).toThrow();
  });

  test("routes one bank account through conditional fields", () => {
    const base: EstateProfile = {
      deathCertificate: "yes", religion: "hindu", will: "no",
      relationship: "spouse", district: "Mysuru",
      employment: "retired", pension: { exists: "no" },
      banks: { exists: "yes", accounts: [{ id: "bank-1", bankType: "commercial" }] },
    };
    expect(nextQuestion(base)?.id).toBe("bank-name");
    const named = applyQuestionAnswer(base, questionById("bank-name")!, "State Bank");
    expect(nextQuestion(named)?.id).toBe("bank-holding");
    const sole = applyQuestionAnswer(named, questionById("bank-holding")!, "sole");
    expect(nextQuestion(sole)?.id).toBe("bank-nominee");
    expect(nextQuestion({
      ...sole,
      banks: {
        exists: "yes",
        accounts: [{
          ...sole.banks!.accounts![0],
          nominee: "yes",
          nomineeName: "Claimant",
        }],
      },
    })?.id).toBe("post-office");
    expect(nextQuestion({
      ...sole,
      banks: {
        exists: "yes",
        accounts: [{ ...sole.banks!.accounts![0], nominee: "no" }],
      },
    })?.id).toBe("bank-amount");
  });

  test("bounds display-only text fields", () => {
    const district = questionById("district")!;
    expect(applyQuestionAnswer({}, district, " Mysuru ").district).toBe("Mysuru");
    expect(() => applyQuestionAnswer({}, district, "x".repeat(81))).toThrow();
  });

  test("collects routing details before completing positive asset answers", () => {
    const profile: EstateProfile = {
      deathCertificate: "yes", religion: "hindu", will: "no",
      relationship: "son", district: "Bengaluru Suburban",
      employment: "retired", pension: { exists: "yes" },
      banks: { exists: "no" }, postOfficeSchemes: { exists: "no" },
      insurance: { exists: "yes" }, securities: { exists: "no", form: "demat" },
      mutualFunds: { exists: "yes" }, immovableProperty: { exists: "yes" },
      vehicle: { exists: "yes" }, bankLocker: { exists: "yes" },
      receivables: "no", liabilities: "no",
    };

    expect(nextQuestion(profile)?.id).toBe("insurance-nominee");
    const insured = applyQuestionAnswer(
      profile,
      questionById("insurance-nominee")!,
      "yes",
    );
    expect(nextQuestion(insured)?.id).toBe("insurance-nominee-claimant");
  });

  test("commits an async answer onto the latest profile without losing evidence", () => {
    const latest: EstateProfile = {
      deathCertificate: "yes",
      documents: { "death-certificate": "yes" },
    };

    expect(applyAnswerToCurrentQuestion(latest, "religion", "hindu")).toEqual({
      deathCertificate: "yes",
      religion: "hindu",
      documents: { "death-certificate": "yes" },
    });
  });

  test("rejects an async answer when concurrent evidence changed the question", () => {
    const latest: EstateProfile = {
      deathCertificate: "yes",
      documents: { "death-certificate": "yes" },
    };

    expect(applyAnswerToCurrentQuestion(latest, "death-certificate", "no")).toBeNull();
  });
});
