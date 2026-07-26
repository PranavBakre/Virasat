import type { Question } from "../../src/interview/questions.ts";
import type { InterviewLanguage } from "../../src/voice/config.ts";
import type { Env } from "../env.ts";

export async function extractWithSarvam(
  env: Env,
  question: Question,
  transcript: string,
): Promise<string | null> {
  if (!env.SARVAM_API_KEY) return null;
  const response = await fetch("https://api.sarvam.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.SARVAM_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sarvam-30b",
      stream: false,
      temperature: 0.1,
      reasoning_effort: null,
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
            "Resolve indirect answers rather than giving up on them.",
            "Possession implies yes; absence implies no.",
            "Only use unknown when the person says they do not know.",
            "Read the whole utterance because a late negation can flip its meaning.",
            "",
            "Classify only the field asked about. Ignore volunteered facts about",
            "other fields because another question will collect them.",
            "",
            'Return {"value":"..."}. Return null only when the utterance genuinely',
            "does not address the question.",
          ].join("\n"),
        },
        { role: "user", content: transcript },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: `${question.id}_answer`,
          strict: true,
          schema: answerSchema(question),
        },
      },
    }),
  });
  if (!response.ok) throw new Error(`Sarvam extraction failed: ${response.status}`);
  const payload = await response.json<{
    choices?: Array<{ message?: { content?: string | null } }>;
  }>();
  const output = payload.choices?.[0]?.message?.content;
  return output ? parseAnswer(question, output) : null;
}

export async function* streamSarvamSpeech(
  env: Env,
  text: string,
  language: InterviewLanguage,
): AsyncGenerator<Uint8Array> {
  if (!env.SARVAM_API_KEY || !text.trim() || text.length > 2_500) return;
  const response = await fetch("https://api.sarvam.ai/text-to-speech", {
    method: "POST",
    headers: {
      "api-subscription-key": env.SARVAM_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      target_language_code: language,
      model: "bulbul:v3",
      speaker: "shubh",
      pace: 0.9,
      output_audio_codec: "mp3",
    }),
  });
  if (!response.ok) throw new Error(`Sarvam speech failed: ${response.status}`);
  const payload = await response.json<{ audios?: string[] }>();
  for (const audio of payload.audios ?? []) yield base64ToBytes(audio);
}

function answerSchema(question: Question): Record<string, unknown> {
  return {
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
  };
}

function parseAnswer(question: Question, output: string): string | null {
  const value = (JSON.parse(output) as { value?: unknown }).value;
  if (typeof value !== "string") return null;
  if (question.kind === "enum") return question.values.includes(value) ? value : null;
  const text = value.trim().replace(/\s+/gu, " ");
  return text && text.length <= (question.maxLength ?? 100) ? text : null;
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}
