import { describe, expect, test } from "bun:test";
import { AGENT_TOOLS, recordAnswers } from "./agent.ts";

describe("agent interview tools", () => {
  test("records several explicit, enum-valid answers in question order", () => {
    const result = recordAnswers({}, {
      answers: {
        epfo: { value: "yes", evidence: "had an EPFO account" },
        employment: { value: "employed-at-death", evidence: "was working" },
        "death-certificate": { value: "yes", evidence: "Yes" },
      },
    }, "Yes, I have the death certificate. He was working and had an EPFO account.");

    expect(result.profile).toMatchObject({
      deathCertificate: "yes",
      employment: "employed-at-death",
      epfo: { exists: "yes" },
    });
    expect(JSON.parse(result.content).accepted.map(
      (answer: { id: string }) => answer.id,
    )).toEqual(["death-certificate", "employment", "epfo"]);
  });

  test("drops unknown fields and invalid enum values instead of coercing them", () => {
    const result = recordAnswers({}, {
      answers: {
        religion: { value: "other", evidence: "Sorry" },
        inventedClaim: { value: "yes", evidence: "Sorry" },
      },
    }, "Sorry");

    expect(result.changed).toBeFalse();
    expect(result.profile).toEqual({});
    expect(JSON.parse(result.content).accepted).toEqual([]);
  });

  test("recovers explicit multi-fact enum answers the model omitted", () => {
    const seeded = recordAnswers({}, { answers: {} }, "Yes, I have the death certificate");
    const result = recordAnswers(seeded.profile, { answers: {} }, [
      "He was Hindu, did not leave a will, and I am his son.",
      "He lived in Mysuru, was working, and had a PF account.",
    ].join(" "));

    expect(result.profile).toMatchObject({
      deathCertificate: "yes",
      religion: "hindu",
      will: "no",
      relationship: "son",
      employment: "employed-at-death",
      epfo: { exists: "yes" },
    });
  });

  test("does not turn a user's question into a yes answer", () => {
    const result = recordAnswers({}, { answers: {} }, "Did he have a PF account?");
    expect(result.profile).toEqual({});
  });

  test("derives the answer schema from the authored question bank", () => {
    const recordTool = AGENT_TOOLS.find(
      (tool) => tool.function.name === "record_answers",
    );
    const answers = (recordTool?.function.parameters.properties as {
      answers?: { properties?: Record<string, unknown> };
    }).answers?.properties;

    expect(answers?.["death-certificate"]).toEqual({
      type: "object",
      properties: {
        value: { type: "string", enum: ["yes", "applied", "no"] },
        evidence: {
          type: "string",
          minLength: 1,
          maxLength: 200,
          description: "An exact quote from this user turn that supports this value.",
        },
      },
      required: ["value", "evidence"],
      additionalProperties: false,
    });
    expect(answers?.religion).toBeDefined();
  });
});
