import type { EstateProfile } from "../rules/types.ts";
import { QUESTIONS, type Question } from "./questions.ts";

export function nextQuestion(profile: EstateProfile): Question | null {
  return QUESTIONS.find((question) =>
    question.applies(profile) && !question.answered(profile)
  ) ?? null;
}

export function applyQuestionAnswer(
  profile: EstateProfile,
  question: Question,
  value: string,
): EstateProfile {
  const normalized = value.trim();
  if (question.kind === "enum" && !question.values.includes(normalized)) {
    throw new Error(`Invalid value for ${question.id}`);
  }
  if (question.kind === "text"
    && (!normalized || normalized.length > (question.maxLength ?? 100))) {
    throw new Error(`Invalid text for ${question.id}`);
  }

  // Each question owns its patch, so one turn cannot write volunteered fields.
  return { ...profile, ...question.patch(normalized, profile) };
}

export function applyAnswerToCurrentQuestion(
  profile: EstateProfile,
  questionId: string,
  value: string,
): EstateProfile | null {
  const current = nextQuestion(profile);
  if (!current || current.id !== questionId) return null;
  return applyQuestionAnswer(profile, current, value);
}
