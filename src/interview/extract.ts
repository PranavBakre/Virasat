import type { SarvamAIClient } from "sarvamai";
import type { Question } from "./questions.ts";
import { extractWithSarvam } from "../sarvam/chat.ts";

const YES = ["yes", "yeah", "correct", "ಹೌದು", "ಇದೆ", "ಇತ್ತು", "हाँ"];
const NO = ["no", "not", "never", "ಇಲ್ಲ", "ಇರಲಿಲ್ಲ", "नहीं", "नही"];
const UNKNOWN = ["don't know", "dont know", "not sure", "unsure", "ಗೊತ್ತಿಲ್ಲ", "पता नहीं", "मालूम नहीं"];

const DIRECT_VALUES: Record<string, string[]> = {
  applied: ["applied", "application", "ಅರ್ಜಿ", "आवेदन"],
  hindu: ["hindu", "ಹಿಂದೂ", "हिंदू"],
  sikh: ["sikh", "ಸಿಖ್", "सिख"],
  jain: ["jain", "ಜೈನ", "जैन"],
  buddhist: ["buddhist", "ಬೌದ್ಧ", "बौद्ध"],
  muslim: ["muslim", "islam", "ಮುಸ್ಲಿಂ", "मुस्लिम"],
  christian: ["christian", "ಕ್ರಿಶ್ಚಿಯನ್", "ईसाई"],
  spouse: ["spouse", "wife", "husband", "ಪತ್ನಿ", "ಪತಿ", "पत्नी", "पति"],
  son: ["son", "ಮಗ", "बेटा", "पुत्र"],
  daughter: ["daughter", "ಮಗಳು", "बेटी", "पुत्री"],
  mother: ["mother", "ತಾಯಿ", "माँ", "माता"],
  father: ["father", "ತಂದೆ", "पिता"],
  sole: ["sole", "single holder", "ಒಬ್ಬರ", "अकेले"],
  joint: ["joint", "ಜಂಟಿ", "संयुक्त"],
  retired: ["retired", "pensioner", "ನಿವೃತ್ತ", "सेवानिवृत्त"],
  "employed-at-death": ["working", "employed", "job", "ಕೆಲಸ", "ನೌಕರಿ", "नौकरी", "काम"],
  "never-salaried": ["never salaried", "self employed", "farmer", "ಸಂಬಳದ ಕೆಲಸ ಇರಲಿಲ್ಲ", "वेतन वाली नौकरी नहीं"],
  "under-5L": ["under 5 lakh", "below 5 lakh", "ಐದು ಲಕ್ಷಕ್ಕಿಂತ ಕಡಿಮೆ", "पाँच लाख से कम"],
  "5L-15L": ["under 15 lakh", "below 15 lakh", "ಐದು ರಿಂದ ಹದಿನೈದು ಲಕ್ಷ", "पंद्रह लाख से कम"],
  "over-15L": ["over 15 lakh", "above 15 lakh", "ಹದಿನೈದು ಲಕ್ಷಕ್ಕಿಂತ ಹೆಚ್ಚು", "पंद्रह लाख से अधिक"],
};

export function extractLocally(question: Question, transcript: string): string | null {
  const normalized = transcript.trim().toLocaleLowerCase();
  if (!normalized || normalized.length > 500) return null;
  if (question.kind === "text") {
    const value = transcript.trim().replace(/\s+/gu, " ");
    return value.length <= (question.maxLength ?? 100) ? value : null;
  }
  const exactValue = question.values.find(value => value.toLocaleLowerCase() === normalized);
  if (exactValue) return exactValue;
  if (question.values.includes("applied")
    && DIRECT_VALUES.applied.some(term => normalized.includes(term))) return "applied";

  if (question.values.includes("unknown") && hasPhrase(normalized, UNKNOWN)) return "unknown";
  if (question.values.includes("unsure") && hasPhrase(normalized, UNKNOWN)) return "unsure";
  if (question.values.includes("no") && hasPhrase(normalized, NO)) return "no";
  if (question.values.includes("yes") && hasPhrase(normalized, YES)) return "yes";

  for (const value of question.values.filter(value => value !== "applied")) {
    if (DIRECT_VALUES[value]?.some((term) => normalized.includes(term))) return value;
  }
  return null;
}

function hasPhrase(text: string, phrases: readonly string[]): boolean {
  return phrases.some((phrase) => {
    if (/^[a-z]{1,3}$/.test(phrase)) {
      return new RegExp(`\\b${phrase}\\b`, "u").test(text);
    }
    return text.includes(phrase);
  });
}

export async function extractAnswer(
  question: Question,
  transcript: string,
  client: SarvamAIClient | null,
): Promise<{ value: string | null; source: "sarvam" | "local" }> {
  if (typeof transcript !== "string" || transcript.trim().length > 500) {
    return { value: null, source: "local" };
  }

  if (client) {
    try {
      const value = await extractWithSarvam(client, question, transcript.trim());
      if (value !== null) return { value, source: "sarvam" };
    } catch (error) {
      console.log("Sarvam extraction unavailable", error);
    }
  }

  return { value: extractLocally(question, transcript), source: "local" };
}
