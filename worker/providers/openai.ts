import type { Question } from "../../src/interview/questions.ts";
import type { InterviewLanguage } from "../../src/voice/config.ts";
import { pcm16ToWav, type PcmRecording } from "../../src/voice/pcm.ts";
import type { Env } from "../env.ts";

type ResponsesPayload = {
  output?: Array<{
    content?: Array<{ type?: string; text?: string }>;
  }>;
};

export async function extractWithOpenAI(
  env: Env,
  question: Question,
  transcript: string,
): Promise<string | null> {
  if (!env.OPENAI_API_KEY) return null;
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: env.OPENAI_EXTRACTION_MODEL || "gpt-5.6-luna",
      reasoning: { effort: "none" },
      store: false,
      instructions: [
        "Classify only the field currently being asked.",
        "Ignore volunteered facts about every other field.",
        "Return null when the answer is unclear or unrelated.",
        `Question: ${question.copy["en-IN"]}`,
      ].join("\n"),
      input: transcript,
      text: {
        verbosity: "low",
        format: {
          type: "json_schema",
          name: `${question.id.replaceAll("-", "_")}_answer`,
          strict: true,
          schema: answerSchema(question),
        },
      },
    }),
  });
  if (!response.ok) throw new Error(`OpenAI extraction failed: ${response.status}`);
  const payload = await response.json<ResponsesPayload>();
  const output = payload.output
    ?.flatMap((item) => item.content ?? [])
    .find((item) => item.type === "output_text")
    ?.text;
  return output ? parseAnswer(question, output) : null;
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
  const value: unknown = JSON.parse(output);
  if (!value || typeof value !== "object") return null;
  const answer = (value as { value?: unknown }).value;
  if (typeof answer !== "string") return null;
  if (question.kind === "enum") {
    return question.values.includes(answer) ? answer : null;
  }
  const text = answer.trim().replace(/\s+/gu, " ");
  return text && text.length <= (question.maxLength ?? 100) ? text : null;
}

export async function transcribeWithOpenAI(
  env: Env,
  recording: PcmRecording,
  language: InterviewLanguage,
): Promise<string> {
  if (!env.OPENAI_API_KEY || recording.byteLength === 0) return "";
  const wav = pcm16ToWav(recording);
  const form = new FormData();
  form.set("file", new File([wav], "virasat-answer.wav", { type: "audio/wav" }));
  form.set("model", env.OPENAI_TRANSCRIBE_MODEL || "gpt-4o-transcribe");
  form.set("language", language.split("-")[0] ?? "en");
  form.set("response_format", "json");
  form.set(
    "prompt",
    "A short estate interview answer in Kannada, Hindi, English, or Indian code-mixed speech. Preserve bank, district, EPFO, UAN, pension, nominee, and insurance terms.",
  );

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${env.OPENAI_API_KEY}` },
    body: form,
  });
  if (!response.ok) throw new Error(`OpenAI transcription failed: ${response.status}`);
  const payload = await response.json<{ text?: string }>();
  return payload.text?.trim() ?? "";
}

export async function* streamOpenAISpeech(
  env: Env,
  text: string,
  language: InterviewLanguage,
): AsyncGenerator<Uint8Array> {
  if (!env.OPENAI_API_KEY || !text.trim() || text.length > 2_500) return;
  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts",
      voice: "coral",
      input: text,
      instructions: [
        "Speak gently and clearly to an adult handling family paperwork after a death.",
        "Use an Indian accent and an unhurried pace.",
        `Read the supplied ${language} text exactly without translating it or adding commentary.`,
      ].join(" "),
      response_format: "mp3",
      speed: 0.9,
    }),
  });
  if (!response.ok || !response.body) {
    throw new Error(`OpenAI speech failed: ${response.status}`);
  }
  const reader = response.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) return;
    yield value;
  }
}
