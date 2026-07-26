import type OpenAI from "openai";
import type { Question } from "../interview/questions.ts";
import { OPENAI_MODELS } from "./config.ts";

export async function extractWithOpenAI(
  client: OpenAI,
  question: Question,
  transcript: string,
): Promise<string | null> {
  const response = await client.responses.create({
    model: OPENAI_MODELS.extraction,
    reasoning: { effort: "none" },
    store: false,
    instructions: [
      "Classify only the field currently being asked.",
      "Ignore volunteered facts about every other field.",
      "Return null when the answer is unclear or unrelated.",
      `Question: ${question.copy["en-IN"]}`,
      question.kind === "enum"
        ? `Allowed values: ${question.values.join(", ")}`
        : `Return only the requested short label, at most ${question.maxLength} characters.`,
    ].join("\n"),
    input: transcript,
    text: {
      verbosity: "low",
      format: {
        type: "json_schema",
        name: `${question.id.replaceAll("-", "_")}_answer`,
        strict: true,
        schema: {
          type: "object",
          properties: {
            value: {
              anyOf: question.kind === "enum"
                ? [{ enum: question.values }, { type: "null" }]
                : [
                    { type: "string", minLength: 1, maxLength: question.maxLength },
                    { type: "null" },
                  ],
            },
          },
          required: ["value"],
          additionalProperties: false,
        },
      },
    },
  });

  if (!response.output_text) return null;
  const parsed: unknown = JSON.parse(response.output_text);
  if (!isValueResponse(parsed) || parsed.value === null) return null;
  if (question.kind === "enum") {
    return question.values.includes(parsed.value) ? parsed.value : null;
  }
  const text = parsed.value.trim().replace(/\s+/gu, " ");
  return text && text.length <= (question.maxLength ?? 100) ? text : null;
}

function isValueResponse(value: unknown): value is { value: string | null } {
  if (!value || typeof value !== "object") return false;
  const keys = Object.keys(value);
  const answer = (value as { value?: unknown }).value;
  return keys.length === 1 && (typeof answer === "string" || answer === null);
}
