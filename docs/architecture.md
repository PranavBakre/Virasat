# Architecture

> Status: **design contract for v0.1** — written before Iteration 0, updated as
> iterations land. Scope is the buildathon build only.

## Outcome

virasat should let one person — the family member handling an estate — speak for
five minutes in Kannada or English and receive a complete, per-claim checklist:
which claims exist, where each is filed, which documents are needed, and which
of those they do not yet have.

The build is complete when this works end to end without the operator knowing
anything about succession law:

```text
speech (kn-IN / en-IN)
  → transcript
  → interview state machine picks the next question
  → answers accumulate into an EstateProfile
  → rules table derives ClaimSet deterministically
  → checklist renders + next question is spoken back
```

## The one architectural boundary that matters

**The rules table is data. The model is language. They never trade jobs.**

An LLM is used for exactly three things: turning speech into structured answers,
choosing natural phrasing for the next question, and speaking output back. It is
never asked *which claims exist* or *which documents are required*.

```text
                     ┌──────────────────────────────┐
  audio in  ────────►│  Sarvam STT (saaras:v3)      │
                     └──────────────┬───────────────┘
                                    │ transcript
                     ┌──────────────▼───────────────┐
                     │  answer extraction           │  ← LLM, constrained:
                     │  transcript → typed answer   │    json_schema output,
                     └──────────────┬───────────────┘    enum-only fields
                                    │
                     ┌──────────────▼───────────────┐
                     │  EstateProfile (in memory)   │  ← plain object, the
                     └──────────────┬───────────────┘    single source of truth
                                    │
   ══════════════════ deterministic boundary ══════════════════
                                    │
                     ┌──────────────▼───────────────┐
                     │  rules engine                │  ← pure function.
                     │  EstateProfile → ClaimSet    │    no network. no model.
                     └──────────────┬───────────────┘    unit-testable.
                                    │
              ┌─────────────────────┴────────────────────┐
              │                                          │
   ┌──────────▼──────────┐                   ┌───────────▼─────────┐
   │  checklist render   │                   │  next-question pick │
   └─────────────────────┘                   └──────────┬──────────┘
                                                        │ text
                                             ┌──────────▼──────────┐
                                             │  Sarvam TTS         │
                                             └─────────────────────┘
```

**Why this boundary is non-negotiable:** the output is a list of legal
entitlements shown to a grieving person. A hallucinated claim sends someone to a
counter that will turn them away; a hallucinated document requirement sends them
chasing paperwork that does not exist. Every entitlement in the output must be
traceable to a row in [`rules-table.md`](rules-table.md) carrying a citation.
The model may be wrong about what someone *said*. It may never be wrong about
what someone is *owed*.

Practical consequence: `deriveClaims()` takes no API key, makes no network call,
and returns the same output for the same input every time. If it ever needs a
model, the design is wrong.

## Data contracts

Three types carry the entire system. Defined in `src/rules/types.ts`.

```ts
// What we learned from the interview. Every field is optional until asked —
// `undefined` means "not yet asked", never "no".
type EstateProfile = {
  deathCertificate?: boolean;
  religion?: "hindu" | "sikh" | "jain" | "buddhist" | "muslim" | "christian" | "other";
  will?: "yes" | "no" | "unsure";
  state?: "karnataka" | "other";

  // relationship of the person being interviewed, to the deceased
  relationship?: "spouse" | "son" | "daughter" | "mother" | "father" | "other";
  survivingHeirs?: Array<"widow" | "widower" | "son" | "daughter" | "mother">;

  // asset presence — tri-state on purpose: unknown is actionable, it becomes
  // "check whether this exists", which is itself a checklist item
  bank?: AssetAnswer & { holding?: "sole" | "joint"; nominee?: YesNoUnknown };
  insurance?: AssetAnswer & { insurer?: string; policyNumber?: string };
  epfo?: AssetAnswer & { salaried?: boolean; serviceYears?: number };
  pension?: AssetAnswer & { govtService?: boolean };
  demat?: AssetAnswer;
  mutualFunds?: AssetAnswer;
  smallSavings?: AssetAnswer;   // PPF, post office
  gratuity?: AssetAnswer;
};

type YesNoUnknown = "yes" | "no" | "unknown";
type AssetAnswer = { exists: YesNoUnknown };

// One derived entitlement. Produced only by the rules engine.
type Claim = {
  id: string;                    // "bank-nominee", "epfo-edli"
  title: string;                 // "EPFO death insurance (EDLI)"
  authority: string;             // where it is physically filed
  forms: string[];               // "Form 5IF"
  docsRequired: DocRequirement[];
  status: "filable" | "blocked" | "uncertain";
  blockedOn: string[];           // doc ids the family does not have
  timelineNote?: string;         // "RBI 2025 mandates 15-day settlement"
  legalBasis: string;            // citation — required, never empty
  verify: boolean;               // true = carries an unresolved [VERIFY] marker
};

type DocRequirement = {
  id: string;                    // "death-certificate", "nominee-id"
  label: string;
  have: YesNoUnknown;
  whereToGet?: string;           // the coaching layer — Iteration 3
};

type ClaimSet = {
  gates: Gate[];                 // hard blockers, evaluated before any claim
  claims: Claim[];
  sharesNote?: string;           // succession-share guidance, or the lawyer punt
};
```

**Design note on tri-state:** `unknown` is deliberately not collapsed into `no`.
"I don't know if he had a PF account" is a *different* output than "he had no PF
account" — the first produces a checklist item ("check with his last employer's
HR"), the second produces nothing. Collapsing them silently drops claims, which
is the exact failure this product exists to prevent.

## Modules

| Path | Owns | Depends on |
|---|---|---|
| `src/rules/table.ts` | The rules table as data — the claim rows, gates, doc lists, citations | nothing |
| `src/rules/engine.ts` | `deriveClaims(profile) → ClaimSet`. Pure. | `table.ts`, `types.ts` |
| `src/rules/types.ts` | The three contracts above | nothing |
| `src/interview/questions.ts` | Question bank, keyed to profile fields | `types.ts` |
| `src/interview/state.ts` | `nextQuestion(profile) → Question \| null`. Pure. | `questions.ts`, `types.ts` |
| `src/interview/extract.ts` | transcript + pending question → typed answer | `sarvam/chat.ts` |
| `src/sarvam/stt.ts` | `transcribe(audio) → { transcript, languageCode }` | Sarvam API |
| `src/sarvam/tts.ts` | `speak(text, lang) → audio buffer` | Sarvam API |
| `src/sarvam/chat.ts` | Constrained JSON completion | Sarvam API |
| `core.ts` | Iteration 0 entrypoint — hardcoded profile, printed checklist | `rules/` |

**Dependency rule:** `src/rules/` imports nothing from `src/sarvam/` or
`src/interview/`. The arrow points one way. This is what keeps the rules engine
testable without an API key, and what lets Iteration 0 ship before any Sarvam
integration exists.

## Question selection

`nextQuestion()` is a pure function over the profile, not a fixed script. It
returns the highest-value unanswered question:

1. **Gates first.** Death certificate, religion, will. These can invalidate
   every downstream question, so they are never asked late.
2. **Then asset presence**, ordered by how commonly the claim is missed.
   EPFO before bank — people always remember the bank account and never
   remember EDLI.
3. **Then drill-down**, only into assets that answered `yes` or `unknown`.
   If `epfo.exists === "no"`, the service-years question is never asked.
4. **Then heirs**, only if the shares section will actually render (Hindu
   intestate path).

Returns `null` when nothing further would change the ClaimSet. That is the
interview's terminating condition — not a question count, and not the model
deciding it's done.

**Consequence for the demo:** the interview length adapts to the family. A
salaried person's estate asks more questions than a retired farmer's. That
adaptivity is the "Memory and Context" rubric point, and it falls out of the
architecture rather than being bolted on.

## Failure posture

Grief context sets the tone for every failure mode. The system is never
confidently wrong and never dead-ends.

| Failure | Behavior |
|---|---|
| STT returns low confidence | Re-ask once, in simpler words. Then offer typed input. |
| Answer doesn't map to the enum | Keep the field `undefined`, move on, re-ask at the end. Never guess. |
| Sarvam API down | Typed-input fallback stays live. The rules engine needs no network — the checklist still works. |
| Claim row carries `[VERIFY]` | Render it, flagged amber, with the citation shown. Never silently drop it. |
| Non-Hindu family | Claims and documents still render. Shares section is replaced with a lawyer referral. |
| Will exists | Route to the probate track and stop. Do not pretend to handle probate. |

**The stage risk:** a venue mic and a live API are the two things that fail
during a demo. The typed-input path is not a nicety — it is the thing that keeps
the demo alive at 6:30 PM. Build it in Iteration 2 alongside the mic, not after.

## Iteration map

| # | Ships | Boundary added | Doc |
|---|---|---|---|
| 0 | `bun run core.ts` prints a checklist from a hardcoded profile | rules engine + table | [iteration-0-claims-engine.md](features/iteration-0-claims-engine.md) |
| 1 | Terminal voice loop — speak, get asked the next question aloud | Sarvam clients + interview state | [iteration-1-voice-interview.md](features/iteration-1-voice-interview.md) |
| 2 | Browser push-to-talk, checklist fills in live | HTTP surface + UI | [iteration-2-checklist-ui.md](features/iteration-2-checklist-ui.md) |
| 3 | Missing-document coaching | `whereToGet` populated | *(stretch — only if 2 lands by 5pm)* |

Each iteration is independently demoable. If the day goes badly, Iteration 1 is
still a real demo. That property is the point of the ordering.

## Deliberately not built

Named here so they don't get re-litigated at 3 PM.

- **Persistence.** No database, no session storage. Refresh starts over.
- **Auth.** Single anonymous user.
- **Immovable property.** Land and flats need a different legal instrument
  entirely; movable-only keeps the succession-certificate logic coherent.
- **Document upload / OCR.** "Do you have X?" and we believe the answer.
- **Streaming voice.** Push-to-talk. Barge-in is a multi-hour infrastructure
  project and buys no rubric points the checklist doesn't already win.
- **States other than Karnataka.** The rules table is state-scoped by design;
  widening it is a data problem, not an architecture problem, and can wait.
