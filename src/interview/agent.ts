import type OpenAI from "openai";
import type { SarvamAIClient } from "sarvamai";
import { deriveClaims } from "../rules/engine.ts";
import type { EstateProfile } from "../rules/types.ts";
import { OPENAI_MODELS } from "../openai/config.ts";
import type { InterviewLanguage, VoiceProvider } from "../voice/config.ts";
import { extractLocally } from "./extract.ts";
import { applyQuestionAnswer, nextQuestion } from "./state.ts";
import { QUESTIONS, type Question } from "./questions.ts";

type ToolCall = { id: string; name: string; arguments: string };
type ToolResult = { content: string; profile: EstateProfile; changed: boolean };
type AgentCallbacks = {
  onDelta: (text: string) => void;
  onTool: (name: string, status: "started" | "completed") => void;
  onProfile: (profile: EstateProfile) => Promise<void>;
  aborted: () => boolean;
};

export type AgentTurn = {
  profile: EstateProfile;
  userText: string;
  language: InterviewLanguage;
  provider: VoiceProvider;
  sarvam: SarvamAIClient | null;
  openai: OpenAI | null;
  callbacks: AgentCallbacks;
};

const answerProperties = Object.fromEntries(QUESTIONS.map((question) => [
  question.id,
  {
    type: "object",
    properties: {
      value: question.kind === "enum"
        ? { type: "string", enum: [...question.values] }
        : { type: "string", minLength: 1, maxLength: question.maxLength ?? 100 },
      evidence: {
        type: "string",
        minLength: 1,
        maxLength: 200,
        description: "An exact quote from this user turn that supports this value.",
      },
    },
    required: ["value", "evidence"],
    additionalProperties: false,
  },
]));

export const AGENT_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "record_answers",
      description: [
        "Record only facts the user explicitly stated in this turn.",
        "For every value, copy the shortest supporting words into evidence exactly.",
        "Never infer an answer from an apology, request to repeat, fragment,",
        "acknowledgement, unrelated question, or ambiguous wording.",
      ].join(" "),
      parameters: {
        type: "object",
        properties: {
          answers: {
            type: "object",
            properties: answerProperties,
            additionalProperties: false,
          },
        },
        required: ["answers"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_checklist",
      description: [
        "Read the deterministic estate checklist.",
        "Call this before naming any claim, form, filing place, document requirement, or timeline.",
      ].join(" "),
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
];

export function recordAnswers(
  profile: EstateProfile,
  input: unknown,
  userText: string,
): ToolResult {
  const proposed = input && typeof input === "object"
    ? (input as { answers?: unknown }).answers
    : null;
  const answers: Record<string, unknown> = proposed
    && typeof proposed === "object"
    && !Array.isArray(proposed)
    ? proposed as Record<string, unknown>
    : {};

  let updated = profile;
  const current = nextQuestion(profile);
  const accepted: Array<{ id: string; label: string; value: string }> = [];
  for (const question of QUESTIONS) {
    const candidate = answers[question.id];
    let value = localExplicitValue(question, userText, current?.id);
    if (candidate && typeof candidate === "object" && !Array.isArray(candidate)) {
      const modelValue = (candidate as Record<string, unknown>).value;
      const evidence = (candidate as Record<string, unknown>).evidence;
      if (typeof modelValue === "string"
        && typeof evidence === "string"
        && supportsCandidate(question, modelValue, evidence, userText, current?.id)) {
        value = modelValue;
      }
    }
    if (value === null) continue;
    try {
      updated = applyQuestionAnswer(updated, question, value);
      accepted.push({ id: question.id, label: question.label, value: value.trim() });
    } catch {
      // Model output is untrusted. Invalid fields and values are ignored.
    }
  }
  return toolResult(updated, accepted, accepted.length > 0);
}

function localExplicitValue(
  question: Question,
  userText: string,
  currentId?: string,
): string | null {
  if (question.kind !== "enum") return null;
  if (question.id === currentId) return extractLocally(question, userText);

  const tokens = questionTokens(question);
  const clauses = userText.split(/[,.;!?]|\b(?:and|but)\b/iu)
    .map((clause) => clause.trim())
    .filter(Boolean)
    .filter((clause) => tokens.some((token) =>
      new RegExp(`(?<![a-z])${token}(?![a-z])`, "iu").test(clause)
    ));
  const values = new Set(clauses.map((clause) => {
    const extracted = extractLocally(question, clause);
    if (extracted !== null) return extracted;
    if (userText.trim().endsWith("?")) return null;
    return question.values.includes("yes")
      && /\b(had|has|have|held|owned)\b/iu.test(clause)
      && !/\b(no|not|never|without)\b/iu.test(clause)
      ? "yes"
      : null;
  }).filter((value): value is string => value !== null));
  return values.size === 1 ? [...values][0]! : null;
}

const SUBJECT_STOP_WORDS = new Set([
  "about", "account", "accounts", "after", "any", "approximately", "are", "did",
  "does", "fund", "have", "the", "their", "them", "they", "this", "was", "what",
  "were", "which", "with", "you", "your",
]);
const QUESTION_ALIASES: Record<string, string[]> = {
  district: ["district", "live", "lived", "stayed"],
  epfo: ["epf", "epfo", "pf", "provident"],
  "death-certificate": ["certificate"],
  employment: ["employed", "job", "salaried", "working"],
  religion: ["hindu", "sikh", "jain", "buddhist", "muslim", "christian"],
  relationship: ["spouse", "wife", "husband", "son", "daughter", "mother", "father"],
};

function supportsCandidate(
  question: Question,
  value: string,
  evidence: string,
  userText: string,
  currentId?: string,
): boolean {
  const quote = evidence.trim().toLocaleLowerCase();
  const turn = userText.trim().toLocaleLowerCase();
  if (!quote || !turn.includes(quote)) return false;

  const current = question.id === currentId;
  const mentionsSubject = current || questionTokens(question).some((token) =>
    new RegExp(`(?<![a-z])${token}(?![a-z])`, "u").test(quote)
  );
  if (!mentionsSubject) return false;

  if (question.kind === "text") {
    const normalized = value.trim().toLocaleLowerCase();
    return Boolean(normalized) && quote.includes(normalized);
  }
  if (extractLocally(question, evidence) === value) return true;
  return !current
    && value === "yes"
    && /\b(had|has|have|held|owned)\b/u.test(quote)
    && !/\b(no|not|never|without)\b/u.test(quote);
}

function questionTokens(question: Question): string[] {
  const source = `${question.label} ${question.copy["en-IN"]}`.toLocaleLowerCase();
  return [...new Set([
    ...(source.match(/[a-z]{3,}/gu) ?? []),
    ...(QUESTION_ALIASES[question.id] ?? []),
  ])]
    .filter((token) => !SUBJECT_STOP_WORDS.has(token));
}

function toolResult(
  profile: EstateProfile,
  accepted: Array<{ id: string; label: string; value: string }>,
  changed: boolean,
): ToolResult {
  const pending = nextQuestion(profile);
  return {
    profile,
    changed,
    content: JSON.stringify({
      accepted,
      nextQuestion: pending
        ? { id: pending.id, canonicalWording: pending.copy }
        : null,
    }),
  };
}

function executeTool(profile: EstateProfile, call: ToolCall, userText: string): ToolResult {
  if (call.name === "get_checklist") {
    return {
      profile,
      changed: false,
      content: JSON.stringify(deriveClaims(profile)),
    };
  }
  if (call.name !== "record_answers") {
    return { profile, changed: false, content: '{"error":"Unknown tool"}' };
  }
  try {
    return recordAnswers(profile, JSON.parse(call.arguments), userText);
  } catch {
    return { profile, changed: false, content: '{"error":"Invalid arguments"}' };
  }
}

function systemPrompt(profile: EstateProfile, language: InterviewLanguage): string {
  const pending = nextQuestion(profile);
  const responseLanguage = language === "kn-IN"
    ? "Kannada" : language === "hi-IN" ? "Hindi" : "English";
  return [
    "You are Virasat, a calm estate-interview assistant for a grieving family in India.",
    `Reply in ${responseLanguage}. Keep replies to two short sentences unless answering a question.`,
    "This is a conversation, not a form. Optionally acknowledge an accepted fact, then ask one useful follow-up.",
    "The accepted array from record_answers is the only truth for acknowledgements. Use its label and value literally; never interpret, embellish, or connect them to the next question.",
    'For example, an accepted District value of "Urban" may be acknowledged only as "I noted the district as Urban", never as "they worked in an urban setting".',
    "If a literal acknowledgement would sound awkward, omit it. Never present the next question's options as facts the user already gave.",
    "Ask the next question exactly once. Do not preview, paraphrase, or list its choices before asking it.",
    "Vary the wording naturally. Do not show question numbers or repeat canonical wording mechanically.",
    "Never call record_answers unless this turn explicitly states the fact.",
    'Replies such as "sorry", "and the text", "okay", "repeat that", or unrelated questions record nothing.',
    "If the reply is unclear, respond naturally and rephrase the same pending question.",
    "You may record several explicit facts from one turn and may correct an earlier fact.",
    "Never state a claim, form, filing place, required document, or timeline unless get_checklist returned it.",
    "Do not call get_checklist merely to choose the next question; record_answers returns that question.",
    `Current profile: ${JSON.stringify(profile)}`,
    pending
      ? `Next missing field: ${pending.id}. Meaning to preserve: ${pending.copy["en-IN"]}`
      : "The interview fields are complete. Offer to explain the checklist or correct an answer.",
  ].join("\n");
}

export async function runAgentTurn(turn: AgentTurn): Promise<EstateProfile> {
  if (turn.provider === "sarvam" && turn.sarvam) {
    return runSarvamTurn(turn, turn.sarvam);
  }
  if (turn.provider === "openai" && turn.openai) {
    return runOpenAITurn(turn, turn.openai);
  }
  turn.callbacks.onDelta(
    "I can continue once this provider has an API key. You can switch providers above.",
  );
  return turn.profile;
}

async function applyToolCalls(
  profile: EstateProfile,
  calls: ToolCall[],
  callbacks: AgentCallbacks,
  userText: string,
): Promise<{ profile: EstateProfile; results: Array<{ call: ToolCall; content: string }> }> {
  let updated = profile;
  const results = [];
  for (const call of calls) {
    if (callbacks.aborted()) break;
    callbacks.onTool(call.name, "started");
    const result = executeTool(updated, call, userText);
    updated = result.profile;
    if (result.changed) await callbacks.onProfile(updated);
    callbacks.onTool(call.name, "completed");
    results.push({ call, content: result.content });
  }
  return { profile: updated, results };
}

function collectToolDelta(
  calls: Map<number, ToolCall>,
  delta: {
    index: number;
    id?: string | null;
    function?: { name?: string | null; arguments?: string | null } | null;
  },
): void {
  const existing = calls.get(delta.index) ?? { id: "", name: "", arguments: "" };
  if (delta.id) existing.id = delta.id;
  if (delta.function?.name) existing.name += delta.function.name;
  if (delta.function?.arguments) existing.arguments += delta.function.arguments;
  calls.set(delta.index, existing);
}

async function runSarvamTurn(
  turn: AgentTurn,
  client: SarvamAIClient,
): Promise<EstateProfile> {
  type Message = Parameters<typeof client.chat.completions>[0]["messages"][number];
  let profile = turn.profile;
  const messages: Message[] = [
    { role: "system", content: systemPrompt(profile, turn.language) },
    { role: "user", content: turn.userText },
  ];

  for (let round = 0; round < 4 && !turn.callbacks.aborted(); round += 1) {
    const tools = round === 0 ? [AGENT_TOOLS[0]!] : [AGENT_TOOLS[1]!];
    const stream = await client.chat.completions({
      model: "sarvam-30b",
      stream: true,
      temperature: 0.4,
      max_tokens: 700,
      reasoning_effort: null as unknown as undefined,
      tool_choice: round === 0
        ? { type: "function", function: { name: "record_answers" } }
        : "auto",
      tools,
      messages,
    });
    let content = "";
    const pendingCalls = new Map<number, ToolCall>();
    for await (const chunk of stream) {
      if (turn.callbacks.aborted()) break;
      const delta = chunk.choices[0]?.delta;
      if (delta?.content) {
        content += delta.content;
      }
      for (const tool of delta?.tool_calls ?? []) collectToolDelta(pendingCalls, tool);
    }
    const calls = [...pendingCalls.values()];
    if (!calls.length || turn.callbacks.aborted()) {
      if (content) turn.callbacks.onDelta(content);
      return profile;
    }

    messages.push({ role: "assistant", tool_calls: calls.map(
      (call) => ({
        id: call.id,
        type: "function" as const,
        function: { name: call.name, arguments: call.arguments },
      }),
    ) });
    const executed = await applyToolCalls(profile, calls, turn.callbacks, turn.userText);
    profile = executed.profile;
    for (const result of executed.results) {
      messages.push({
        role: "tool",
        tool_call_id: result.call.id,
        content: result.content,
      });
    }
  }
  return profile;
}

async function runOpenAITurn(
  turn: AgentTurn,
  client: OpenAI,
): Promise<EstateProfile> {
  type Message = OpenAI.Chat.Completions.ChatCompletionMessageParam;
  let profile = turn.profile;
  const messages: Message[] = [
    { role: "system", content: systemPrompt(profile, turn.language) },
    { role: "user", content: turn.userText },
  ];

  for (let round = 0; round < 4 && !turn.callbacks.aborted(); round += 1) {
    const tools = round === 0 ? [AGENT_TOOLS[0]!] : [AGENT_TOOLS[1]!];
    const stream = await client.chat.completions.create({
      model: OPENAI_MODELS.extraction,
      stream: true,
      reasoning_effort: "none",
      temperature: 0.4,
      max_completion_tokens: 700,
      tool_choice: round === 0
        ? { type: "function", function: { name: "record_answers" } }
        : "auto",
      tools,
      messages,
    });
    let content = "";
    const pendingCalls = new Map<number, ToolCall>();
    for await (const chunk of stream) {
      if (turn.callbacks.aborted()) break;
      const delta = chunk.choices[0]?.delta;
      if (delta?.content) {
        content += delta.content;
      }
      for (const tool of delta?.tool_calls ?? []) collectToolDelta(pendingCalls, tool);
    }
    const calls = [...pendingCalls.values()];
    if (!calls.length || turn.callbacks.aborted()) {
      if (content) turn.callbacks.onDelta(content);
      return profile;
    }

    messages.push({ role: "assistant", content: null, tool_calls: calls.map(
      (call) => ({
        id: call.id,
        type: "function" as const,
        function: { name: call.name, arguments: call.arguments },
      }),
    ) });
    const executed = await applyToolCalls(profile, calls, turn.callbacks, turn.userText);
    profile = executed.profile;
    for (const result of executed.results) {
      messages.push({
        role: "tool",
        tool_call_id: result.call.id,
        content: result.content,
      });
    }
  }
  return profile;
}
