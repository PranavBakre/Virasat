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
                     └──────────────┬───────────────┘    one field per turn
                                    │
                     ┌──────────────▼───────────────┐
                     │  EstateProfile (Convex doc)  │  ← single source of truth.
                     └──────────────┬───────────────┘    reactive: the checklist
                                    │                    re-renders on write
                                    │
   ══════════════════ deterministic boundary ══════════════════
                                    │
                     ┌──────────────▼───────────────┐
                     │  rules engine                │  ← pure function.
                     │  gates → rows → inferences   │    no network. no model.
                     │  EstateProfile → ClaimSet    │    unit-testable.
                     └──────────────┬───────────────┘
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
  // gates — section 0 of the rules table
  deathCertificate?: "yes" | "applied" | "no";
  religion?: "hindu" | "sikh" | "jain" | "buddhist" | "muslim" | "christian" | "other";
  will?: "yes" | "no" | "unsure";
  state?: "karnataka" | "other";
  district?: string;             // Karnataka district; sets court + Nadakacheri routing

  // relationship of the person being interviewed, to the deceased
  relationship?: "spouse" | "son" | "daughter" | "mother" | "father" | "other";
  survivingHeirs?: Array<"widow" | "widower" | "son" | "daughter" | "mother">;
  ageAtDeath?: number;           // drives the post-office-schemes inference

  // §1 — bank. `amountBracket` and `bankType` are what select the row:
  // ≤15L commercial → no-court route; >15L → succession certificate;
  // cooperative drops the threshold to 5L. Getting these wrong sends a
  // family to court that didn't need to go.
  banks?: AssetAnswer & {
    accounts?: Array<{
      id: string;                       // stable within the session
      bankName?: string;
      bankType?: "commercial" | "cooperative" | "unknown";
      holding?: "sole" | "joint";
      jointHolderIsClaimant?: YesNoUnknown;
      survivorship?: YesNoUnknown;      // E-or-S clause — joint ≠ automatic survivorship
      nominee?: YesNoUnknown;
      nomineeName?: string;             // collected only when a nominee is printed
      amountBracket?: "under-5L" | "5L-15L" | "over-15L" | "unknown";
      dormantOver10Years?: YesNoUnknown; // → UDGAM discovery card
    }>;
  };

  // §2 — insurance. `nomineeIsClaimant` distinguishes "you file" from
  // "someone else files, we prep the packet".
  insurance?: AssetAnswer & {
    insurer?: string;
    nominee?: YesNoUnknown;
    nomineeIsClaimant?: YesNoUnknown;
    policyDocumentLost?: YesNoUnknown;
  };

  // §3 — employment drives the largest inference cluster. This is one field,
  // not a set of booleans, because the three states are mutually exclusive
  // and each routes to a different claim group.
  employment?: "employed-at-death" | "retired" | "never-salaried" | "unknown";
  epfo?: AssetAnswer & { uanKnown?: YesNoUnknown; serviceYears?: number };
  pension?: AssetAnswer & { govtService?: YesNoUnknown; ppoAvailable?: YesNoUnknown };

  // §4 — securities. Threshold is per DP/AMC, so value is bracketed the same way.
  demat?: AssetAnswer & { nominee?: YesNoUnknown; valueBracket?: "under-5L" | "over-5L" | "unknown" };
  mutualFunds?: AssetAnswer & { nominee?: YesNoUnknown; valueBracket?: "under-5L" | "over-5L" | "unknown" };

  postOfficeSchemes?: AssetAnswer & {
    schemes?: Array<"ppf" | "nsc" | "mis" | "scss" | "other">;
  };                              // excluded from RBI-2025; own scheme rules

  // Track-card-only assets in v0.1. Presence is captured so the family is not
  // left with silence, but these do not enter the movable-claims workflow.
  immovableProperty?: AssetAnswer; // house / land
  vehicle?: AssetAnswer;
  bankLocker?: AssetAnswer;

  receivables?: YesNoUnknown;     // money owed to the deceased → certificate track
  liabilities?: YesNoUnknown;     // loans/cards → "debts don't vanish" card

  // Filled after the interview from only the documents relevant to provisional
  // claims. Missing documents affect readiness, never entitlement.
  documents?: Record<string, YesNoUnknown>;
};

type YesNoUnknown = "yes" | "no" | "unknown";
type AssetAnswer = { exists: YesNoUnknown };

// One derived entitlement. Produced only by the rules engine.
type Claim = {
  id: string;                    // "bank-nominee", "epfo-edli"
  assetRef?: string;             // account/asset id when several rows of one kind apply
  title: string;                 // "EPFO death insurance (EDLI)"
  authority: string;             // where it is physically filed
  forms: string[];               // "Form 5IF", "Annex I-B"
  docsRequired: DocRequirement[];
  status: "filable" | "blocked" | "uncertain";
  blockedOn: string[];           // doc ids the family does not have
  timelineNote?: string;         // "RBI 2025 mandates 15-day settlement"
  legalBasis: string;            // "S1" — required, never empty
  verify: boolean;               // true = row still carries a [VERIFY] marker
  commonlyMissed?: boolean;      // EDLI, gratuity, arrears — drives UI emphasis
};

type DocRequirement = {
  id: string;                    // "death-certificate", "legal-heir-certificate"
  label: string;
  have: YesNoUnknown;
  whereToGet?: string;           // later coaching layer
};

// Not a claim. Section 8 inferences and out-of-scope tracks produce these:
// things to check, warnings, and "here's the track" pointers. They are kept
// as a separate type so a card can never be mistaken for an entitlement —
// nothing here is money the family is owed.
type Card = {
  id: string;
  kind: "discovery" | "warning" | "nudge" | "out-of-scope-track";
  title: string;
  body: string;
  link?: string;                 // udgam.rbi.org.in, nadakacheri, …
};

type ClaimSet = {
  gates: Gate[];                 // hard blockers, evaluated before any claim
  claims: Claim[];
  cards: Card[];
  sharesNote?: string;           // succession-share guidance, or the lawyer punt
  track: "intestate" | "probate"; // §6 swaps the route set, never extends it
};
```

**Why amounts are brackets, not numbers:** nobody being interviewed knows the
balance to the rupee, and the rules only ever branch on which side of ₹5 L /
₹15 L a figure falls. Asking "roughly, was it more or less than fifteen lakh?"
is answerable out loud; asking for a number is not. `"unknown"` routes to a
card telling them to get a balance certificate from the branch — which is a
real, correct next step rather than a guess.

**Design note on tri-state:** `unknown` is deliberately not collapsed into `no`.
"I don't know if he had a PF account" is a *different* output than "he had no PF
account" — the first produces a checklist item ("check with his last employer's
HR"), the second produces nothing. Collapsing them silently drops claims, which
is the exact failure this product exists to prevent.

**Design note on documents:** document possession does not decide whether a
claim exists. The rules engine first derives provisional claims from the estate
facts, then resolves each claim's `docsRequired` against `profile.documents`.
A missing form or certificate changes a claim from `filable` to `blocked`; it
never removes the entitlement. The document checklist therefore contains only
documents relevant to claims already identified, rather than one enormous
generic list.

## Modules

| Path | Owns | Depends on |
|---|---|---|
| `src/rules/table.ts` | Rules table §1–§4 as data — claim rows, doc lists, citations | nothing |
| `src/rules/gates.ts` | §0 — `evaluateGates(profile)`, runs before any claim routes | `types.ts` |
| `src/rules/inferences.ts` | §8 — claims and cards that fire without being asked | `types.ts` |
| `src/rules/engine.ts` | `deriveClaims(profile) → ClaimSet`. Pure. | the three above |
| `src/rules/types.ts` | The contracts above | nothing |
| `src/interview/questions.ts` | Question bank, keyed to profile fields | `types.ts` |
| `src/interview/state.ts` | `nextQuestion(profile) → Question \| null`. Pure. | `questions.ts`, `types.ts` |
| `src/interview/extract.ts` | transcript + pending question → typed answer | `sarvam/chat.ts` |
| `src/sarvam/stt.ts` | `transcribe(audio) → { transcript, languageCode }` | Sarvam API |
| `src/sarvam/tts.ts` | `speak(text, lang) → audio buffer` | Sarvam API |
| `src/sarvam/chat.ts` | Constrained JSON completion | Sarvam API |
| `convex/schema.ts` | `sessions` table — one doc per interview | — |
| `convex/sessions.ts` | `create`, `get`, `applyAnswer`, `setDocumentStatus` | `src/rules/` |
| `convex/turn.ts` | `"use node"` action: audio → STT → extract → mutation | `src/sarvam/`, `src/interview/` |
| `web/serve.ts` | Iteration 0 static server + local derive endpoint | `rules/` |
| `web/app.js` | Scripted demo state, document controls, render | local derive endpoint |
| `web/index.html` | Virasat two-column demo surface | Tailwind CDN |

**Dependency rule:** `src/rules/` imports nothing from `src/sarvam/` or
`src/interview/`. The arrow points one way. This is what keeps the rules engine
testable without an API key, and what lets Iteration 0 ship before any Sarvam
integration exists.

## Question selection

`nextQuestion()` is a pure function over the profile, not a fixed script. It
returns the highest-value unanswered question:

1. **Hard gates first.** Death-certificate status, religion, and will. These can
   change or lock every downstream route, so they are never asked late.
2. **Identity and routing.** Relationship to the person who died, then their
   Karnataka district. District selects the court and Nadakacheri guidance.
3. **Employment and asset presence**, ordered by how commonly the claim is
   missed: employment/PF before bank, then post-office schemes, pension,
   insurance, securities, property/vehicle, locker, receivables, and debts.
4. **Conditional drill-down.** Ask follow-ups only for assets answered `yes` or
   `unknown`. Each known bank account gets its own bank name, bank type,
   sole/joint, joint-holder, nominee, and amount-bracket sequence. If
   `epfo.exists === "no"`, the PF follow-ups are never asked.
5. **Heirs**, only if the shares section will actually render (Hindu intestate
   path).
6. **Relevant documents.** Once provisional claims exist, show checkboxes only
   for their required documents and store each as `yes | no | unknown`.

Returns `null` when nothing further would change the ClaimSet. That is the
interview's terminating condition — not a question count, and not the model
deciding it's done.

**Consequence for the demo:** the interview length adapts to the family. A
salaried person's estate asks more questions than a retired farmer's. That
adaptivity is the "Memory and Context" rubric point, and it falls out of the
architecture rather than being bolted on.

## The inference layer

Section 8 of the rules table is where the product stops being a form and starts
being worth building. These rules fire on facts the person never volunteered:

```text
employment = "employed-at-death"
  → EPFO PF (Form 20)
  → EPS pension (Form 10D)
  → EDLI death insurance (Form 5IF)     ← almost nobody claims this
  → gratuity + final salary + leave encashment (employer HR)
```

The person said one thing — "he was working" — and four claims appeared. That
is the entire pitch, and it is also the demo's peak moment.

Implementation constraint: **inferences run after row filtering, never during
it.** `applyInferences()` takes the profile and the claims derived so far, and
appends. It never removes a claim and never rewrites one. Keeping it additive
means a bug in the inference layer can produce a spurious extra claim (visible,
embarrassing, survivable) but can never silently delete a real entitlement
(invisible, and the exact harm this product exists to prevent).

Cards are the other half. Three inferences produce no claim at all:

| Inference | Card | Why it earns its place |
|---|---|---|
| banks ticked + "don't know" on accounts | UDGAM unclaimed-deposit search | Money that already exists and nobody knows about |
| any asset with no nominee | "add nominees to *your own* accounts this week" | The one line that helps the listener, not the estate |
| liabilities yes/unknown | "debts don't vanish — check CIBIL before distributing" | Stops a family distributing assets they'll be chased for |

The nominee nudge is deliberate product design, not filler: it is the only
output addressed to the living person rather than the estate, and it is the
thing that makes someone remember this product a year later.

## Convex

Added in Iteration 1 for the real voice/chat interview. One table, one action,
and two thin function files.

```ts
// convex/schema.ts
sessions: defineTable({
  profile: v.any(),        // EstateProfile — deliberately untyped in the DB,
                           // the TS type in src/rules/types.ts is the contract
  language: v.string(),    // "kn-IN" | "en-IN", follows STT detection
  transcript: v.array(v.object({ q: v.string(), a: v.string() })),
  createdAt: v.number(),
})
```

**Why Convex earns its place here** — it is not just storage:

1. **The live checklist is free.** `useQuery(api.sessions.get)` re-runs on every
   write. The right-hand column filling in mid-conversation — the thing the
   whole demo is built around — is a reactive subscription, not code we write.
   In the in-memory design that was a polling loop or a websocket.
2. **Actions hold the Sarvam keys.** The API key never reaches the browser.
3. **The session survives a refresh.** On stage, a browser crash at 6:29 PM
   stops being fatal.

**Where the derivation runs, and why it matters:** `deriveClaims()` is called
inside the Convex query, on the stored profile — not stored as a materialized
field. Claims are always recomputed from the profile, so a fix to the rules
table takes effect on existing sessions immediately. Never persist a derived
`ClaimSet`; a stale entitlement list outliving the rule that produced it is a
correctness bug with legal consequences.

**The dependency arrow is unchanged.** `src/rules/` imports nothing from
`convex/`. Convex functions import the rules engine, call it, and return the
result. In Iteration 0 the engine runs behind the local `web/serve.ts` endpoint
with no Convex deployment and no network, which keeps the mockup shippable
before any voice backend exists and keeps the rules unit-testable.

`convex/turn.ts` needs `"use node"` at the top — audio buffers and the multipart
upload to Sarvam need the Node runtime, not Convex's default V8 environment.

## Failure posture

Grief context sets the tone for every failure mode. The system is never
confidently wrong and never dead-ends.

| Failure | Behavior |
|---|---|
| STT returns low confidence | Re-ask once, in simpler words. Then offer typed input. |
| Answer doesn't map to the enum | Keep the field `undefined`, move on, re-ask at the end. Never guess. |
| Sarvam API down | Typed-input fallback stays live. The rules engine runs inside a Convex query with no outbound calls — the checklist still works. |
| Claim row carries `[VERIFY]` | Render it, flagged amber, with the citation shown. Never silently drop it. |
| Non-Hindu family | Claims and documents still render. Shares section is replaced with a lawyer referral. |
| Will exists | Route to the probate track and stop. Do not pretend to handle probate. |

**The stage risk:** a venue mic and a live API are the two things that fail
during a demo. Iteration 0 remains a complete scripted fallback. Iteration 1
adds text chat alongside the microphone, through the same extraction path.

## Iteration map

| # | Ships | Boundary added | Doc |
|---|---|---|---|
| 0 | Web mockup: scripted interview + live deterministic checklist | rules engine + web surface | [iteration-0-web-claims-mockup.md](features/iteration-0-web-claims-mockup.md) |
| 1 | Voice interview with secondary text chat | Sarvam + interview state + Convex | [iteration-1-voice-chat.md](features/iteration-1-voice-chat.md) |

Each iteration is independently demoable. If voice or the venue network fails,
Iteration 0 remains a complete visual walkthrough of the core product.

## Deliberately not built

Named here so they don't get re-litigated at 3 PM.

- **Auth.** No accounts. A session id in the URL is the whole access model —
  anyone with the link sees the session. Acceptable for a demo, not for real
  users, and named here so nobody mistakes it for a decision that survived
  scrutiny.
- **Multi-session history.** One session at a time. No "my past estates" list.
- **Immovable property.** Land and flats need a different legal instrument
  entirely; movable-only keeps the succession-certificate logic coherent.
- **Document upload / OCR.** "Do you have X?" and we believe the answer.
- **Streaming voice.** Push-to-talk. Barge-in is a multi-hour infrastructure
  project and buys no rubric points the checklist doesn't already win.
- **States other than Karnataka.** The rules table is state-scoped by design;
  widening it is a data problem, not an architecture problem, and can wait.
