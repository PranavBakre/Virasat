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
    // Reasoning disabled. sarvam-30b reasons by default and measured 2.4-11s,
    // returning content: null when the budget ran out mid-thought. Disabling it
    // takes the same classification to ~200ms with 7 completion tokens. The SDK
    // enum only lists low|medium|high; null is the documented off switch.
    reasoning_effort: null as unknown as undefined,
    // sarvam-30b is a reasoning model: it fills `reasoning_content` before it
    // emits `content`. At max_tokens 80 it hit finish_reason "length" during
    // reasoning every single time and returned content: null — so this whole
    // path silently failed and every answer fell through to local matching after
    // paying the round trip. Measured: 605 completion tokens to classify
    // "we have it" as "yes". reasoning_effort "low" does NOT reduce this.
    // Only reached when local matching cannot place the answer.
    max_tokens: 1_024,
    messages: [
      {
        role: "system",
        content: [
          "You are reading one spoken answer from a grieving family member in India",
          "settling an estate. They speak Kannada, Hindi and English, often mixed,",
          "and they rarely answer with a bare yes or no.",
          "",
          `Question asked: ${question.copy["en-IN"]}`,
          question.kind === "enum"
            ? `Allowed values: ${question.values.join(", ")}`
            : `Return only the requested short label, at most ${question.maxLength} characters.`,
          "",
          "Resolve indirect answers rather than giving up on them:",
          '- Possession implies yes. "I do", "we got it last week", "it is with my',
          '  brother", "in hand" all mean they have it.',
          '- Absence implies no. "not yet", "we have not managed it", "it is lost".',
          '- Only treat an answer as unknown when they say they do not know, not',
          "  when they are merely vague about detail.",
          "- A negation can flip a sentence late; read the whole utterance before",
          '  deciding. "No, he did have one" is yes.',
          "",
          "Classify only the field asked about. If they volunteer facts about other",
          "fields, ignore those completely — another question will collect them.",
          "",
          'Return {"value":"..."}. Return null only when the utterance genuinely',
          "does not address the question at all — not merely because it is",
          "indirect, colloquial, or code-mixed. Null makes the family repeat",
          "themselves, so use it as a last resort.",
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
