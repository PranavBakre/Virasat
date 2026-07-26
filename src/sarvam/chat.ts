import type { SarvamAIClient } from "sarvamai";
import type { Question } from "../interview/questions.ts";

type SchemaRequest = Parameters<SarvamAIClient["chat"]["completions"]>[0] & {
  stream: false;
  response_format: {
    type: "json_schema";
    json_schema: Record<string, unknown>;
  };
};

export async function extractWithSarvam(
  client: SarvamAIClient,
  question: Question,
  transcript: string,
): Promise<string | null> {
  const request: SchemaRequest = {
    model: "sarvam-30b",
    stream: false,
    temperature: 0.1,
    max_tokens: 80,
    messages: [
      {
        role: "system",
        content: [
          "Classify only the field currently being asked.",
          "Ignore volunteered facts about every other field.",
          `Question: ${question.copy["en-IN"]}`,
          question.kind === "enum"
            ? `Allowed values: ${question.values.join(", ")}`
            : `Return only the requested short label, at most ${question.maxLength} characters.`,
          'Return {"value":"..."}. Use null when the answer is unclear.',
        ].join("\n"),
      },
      { role: "user", content: transcript },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: `${question.id}_answer`,
        strict: true,
        schema: {
          type: "object",
          properties: {
            value: {
              anyOf: question.kind === "enum"
                ? [{ enum: question.values }, { type: "null" }]
                : [{ type: "string", minLength: 1, maxLength: question.maxLength }, { type: "null" }],
            },
          },
          required: ["value"],
          additionalProperties: false,
        },
      },
    },
  };

  const response = await client.chat.completions(request);
  const content = response.choices[0]?.message.content;
  if (!content) return null;

  const parsed: unknown = JSON.parse(content);
  if (!isValueResponse(parsed)) return null;
  if (parsed.value === null) return null;
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
