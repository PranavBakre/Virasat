import type { Question } from "./questions.ts";
import type { VoiceProvider } from "../voice/config.ts";

// People do not answer "Do you have the death certificate?" with "yes". They say
// "I do", "we got it last week", "it's with my brother". The model is the only
// thing that can read the unusual ones, but sarvam-30b is a reasoning model that
// measured 5–7.7s on every call — far too slow to sit in front of every answer.
// So the closed set of ordinary affirmations and negations is enumerated here and
// resolved with no network call at all.
//
// ORDER IS LOAD-BEARING. Unknown is tested before negative, because "no idea"
// contains "no" and "ಗೊತ್ತಿಲ್ಲ" contains "ಇಲ್ಲ". Get that backwards and "I don't
// know" is recorded as "no" — the exact collapse CLAUDE.md forbids, and the one
// that silently drops a real entitlement.
const UNKNOWN = [
  "don't know", "dont know", "do not know", "no idea", "not sure", "unsure",
  "can't say", "cant say", "cannot say", "not certain", "no clue",
  "ಗೊತ್ತಿಲ್ಲ", "ತಿಳಿದಿಲ್ಲ", "पता नहीं", "पता नही", "मालूम नहीं",
];
const NO = [
  "no", "nope", "not", "never", "not yet", "don't have", "dont have",
  "do not have", "haven't", "havent", "have not", "not with", "lost it",
  "ಇಲ್ಲ", "ಇರಲಿಲ್ಲ", "नहीं", "नही",
];
const YES = [
  "yes", "yeah", "yep", "yup", "i do", "we do", "i have", "we have",
  "i've got", "we've got", "got it", "have it", "with me", "in hand",
  "correct", "right", "of course", "sure", "did have", "does have",
  "had one", "has one", "with my", "with us", "got them", "have them",
  "ಹೌದು", "ಇದೆ", "ಇತ್ತು", "ಸರಿ", "हाँ", "हां",
];

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

  // Same guard as the fast path: an unknown answer returns here rather than
  // falling through to the "no" test below. "ಗೊತ್ತಿಲ್ಲ" contains "ಇಲ್ಲ", so
  // without this the two are indistinguishable.
  if (hasPhrase(normalized, UNKNOWN)) {
    if (question.values.includes("unknown")) return "unknown";
    if (question.values.includes("unsure")) return "unsure";
    return null;
  }
  if (question.values.includes("no") && hasPhrase(normalized, NO)) return "no";
  if (question.values.includes("yes") && hasPhrase(normalized, YES)) return "yes";

  for (const value of question.values.filter(value => value !== "applied")) {
    if (DIRECT_VALUES[value]?.some((term) => normalized.includes(term))) return value;
  }
  return null;
}

function hasPhrase(text: string, phrases: readonly string[]): boolean {
  return phrases.some((phrase) => matchesPhrase(text, phrase));
}

// Every Latin phrase matches on word boundaries, not as a substring. Substring
// matching reads "i do" out of "i don't have it" and "sure" out of "unsure",
// inverting the answer. JS \w is ASCII-only, so \b is meaningless around Kannada
// and Devanagari — those match as plain substrings, which is safe because their
// negations are separate words rather than contractions.
function matchesPhrase(text: string, phrase: string): boolean {
  if (!/[a-z]/u.test(phrase)) return text.includes(phrase);
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  return new RegExp(`(?<![a-z])${escaped}(?![a-z'])`, "u").test(text);
}

// Beyond a few words an answer can carry a negation that flips its meaning
// ("no, he did have an account"), and keyword matching gets that backwards.
// Anything longer goes to the model.
//
// This was 3, which is shorter than how people actually answer — "we got it last
// week" and "I don't have it yet" both blew the cap and went to a model that then
// lost its own race, so they surfaced as "I could not place that answer". The
// contradiction test below is what really guards against late negation, so the cap
// only has to be a backstop.
const MAX_FAST_PATH_WORDS = 6;

// Possession negated explicitly. These have to resolve before the yes/no
// contradiction test, because "don't have it" legitimately contains both a
// negative ("don't have") and an affirmative ("have it") — treating that as a
// contradiction sent the commonest negative answer of all to the model.
const NEGATED_POSSESSION = [
  "don't have", "dont have", "do not have", "haven't", "havent", "have not",
  "didn't have", "didnt have", "did not have", "not with", "no longer",
  "never had", "not had",
];

// Ceiling on how long an answer may wait on the model before local matching takes
// over. Measured sarvam-30b latencies are 5.0–7.7s, so the old 2.5s meant the
// model never once won its own race — every answer paid the round trip and then
// had its result thrown away. There is no faster chat model to switch to
// (sarvam-m is deprecated; only sarvam-30b and sarvam-105b remain, both
// reasoning models), so the deterministic path above absorbs the common answers
// and this deadline is set wide enough for the model to actually finish the rest.
const EXTRACTION_TIMEOUT_MS = 8_000;
const TIMED_OUT = Symbol("extraction-timeout");

// Resolves only answers that cannot be misread: an exact enum value, or a short
// utterance matching exactly one of yes/no/don't-know. Returns null for anything
// ambiguous so the model still handles the hard cases.
export function extractFastPath(question: Question, transcript: string): string | null {
  if (question.kind !== "enum") return null;
  const normalized = transcript.trim().toLocaleLowerCase();
  if (!normalized) return null;

  const exact = question.values.find((value) => value.toLocaleLowerCase() === normalized);
  if (exact) return exact;

  // "we applied for it" is neither yes nor no, and it outranks the "no" that
  // usually sits beside it ("no certificate yet, but we applied already"). Tested
  // ahead of the word cap because "applied" is unambiguous at any length.
  if (question.values.includes("applied") && hasPhrase(normalized, DIRECT_VALUES.applied ?? [])) {
    return "applied";
  }

  if (normalized.split(/\s+/u).length > MAX_FAST_PATH_WORDS) return null;

  if (question.values.includes("no") && hasPhrase(normalized, NEGATED_POSSESSION)) return "no";

  // Tested before the negatives, and it returns rather than falling through:
  // where the question offers no unknown value, defer to the model instead of
  // letting "I don't know" land on "no".
  if (hasPhrase(normalized, UNKNOWN)) {
    if (question.values.includes("unknown")) return "unknown";
    if (question.values.includes("unsure")) return "unsure";
    return null;
  }

  const negative = question.values.includes("no") && hasPhrase(normalized, NO);
  const affirmative = question.values.includes("yes") && hasPhrase(normalized, YES);
  // A sentence carrying both is arguing with itself ("no, he did have one").
  // That is precisely the case keyword matching gets backwards, so hand it over.
  if (negative && affirmative) return null;
  if (negative) return "no";
  if (affirmative) return "yes";

  const direct = question.values.filter((value) =>
    value !== "applied" && DIRECT_VALUES[value]?.some((term) => matchesPhrase(normalized, term)));
  return direct.length === 1 ? (direct[0] as string) : null;
}

export async function extractAnswer(
  question: Question,
  transcript: string,
  extractor: ((question: Question, transcript: string) => Promise<string | null>) | null,
  provider: VoiceProvider,
): Promise<{ value: string | null; source: VoiceProvider | "local" | "fast" }> {
  if (typeof transcript !== "string" || transcript.trim().length > 500) {
    return { value: null, source: "local" };
  }

  // "yes", "ಹೌದು", "no" — the overwhelming majority of answers — resolve with no
  // network call at all. Calling the model first made every one of them wait on a
  // round trip for a classification that is already unambiguous.
  const fast = extractFastPath(question, transcript);
  if (fast !== null) return { value: fast, source: "fast" };

  if (extractor) {
    try {
      const value = await Promise.race([
        extractor(question, transcript.trim()),
        new Promise<typeof TIMED_OUT>((resolve) =>
          setTimeout(() => resolve(TIMED_OUT), EXTRACTION_TIMEOUT_MS)
        ),
      ]);
      if (value === TIMED_OUT) {
        console.log(`${provider} extraction timed out; using local matching`);
      } else if (value !== null) {
        return { value, source: provider };
      }
    } catch (error) {
      console.log(`${provider} extraction unavailable`, error);
    }
  }

  return { value: extractLocally(question, transcript), source: "local" };
}
