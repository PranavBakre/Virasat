# CLAUDE.md — virasat

## Project overview

virasat is a voice agent (Kannada/Hindi/English) for families settling an estate after
a death in India. It interviews the person handling the paperwork, derives which
claims that family can file from a hardcoded rules table, and outputs a
checklist per claim: where to file, which documents are needed, what's missing.

Built for the **Sarvam Epoch Buildathon**, Sunday 26 July, Razorpay Arena.
Demos 6:30 PM IST. Selected Sarvam capability: **Voice Experience** (2.5×).

**Stack:** Bun · TypeScript · Bun WebSocket server · selectable Sarvam/OpenAI
voice providers · Tailwind CDN, no build step.

**Scope:** Karnataka · Hindu Succession Act intestate path · movable assets.

## Phase rules — load one of these before doing anything

This project runs on the buildathon's two-phase model. **Read the matching file
in full before acting.**

| Situation | Load |
|---|---|
| Scoping, still deciding what to build | [rules/ideation.md](rules/ideation.md) — **no code, at all** |
| Building (after 1:00 PM) | [rules/building.md](rules/building.md) — plan → confirm → small chunks |

Both are binding. `rules/building.md` in particular forbids things that look
like good practice on a normal day: no loading states, no animations, no error
handling beyond `console.log`, no mobile responsiveness, no optimizing before it
works. **Follow it anyway.** The constraint is the deadline, not taste.

Never build a feature that isn't in [workflows/1-IDEATION.md](workflows/1-IDEATION.md).
When asked for one, say: *"That's a later iteration. I've noted it. Let's finish
Iteration N first."*

## Skills

| Skill | When |
|---|---|
| `virasat-design` | Before writing **any** UI, HTML, Tailwind class, or styling |
| `verify-rule` | Resolving `[VERIFY]` markers against their cited source |

**Design override:** the global instruction to load `~/.claude/frontend-design.md`
for frontend work **does not apply in this repo.** That file is the GrowthX
dark-theme SaaS system for gx-client-next — wrong product, wrong audience, wrong
everything. Load `.claude/skills/virasat-design/` instead: warm paper ground,
indigo ink, Anek type by Ek Type, Kannada as a first-class script.

## Where to look

**Read docs first — don't explore the codebase when a doc answers the question.**

| Question | Read this |
|---|---|
| What are we building, and what did we deliberately cut? | [workflows/1-IDEATION.md](workflows/1-IDEATION.md) |
| System design, data contracts, module boundaries | [docs/architecture.md](docs/architecture.md) |
| **Which claims exist, what docs each needs, legal citations** | [docs/rules-table.md](docs/rules-table.md) |
| Sarvam endpoints, headers, model names, params | [docs/sarvam-api.md](docs/sarvam-api.md) |
| OpenAI endpoints, models, and provider behavior | [docs/openai-api.md](docs/openai-api.md) |
| What Iteration 0 must do, and when it's done | [docs/features/iteration-0-web-claims-mockup.md](docs/features/iteration-0-web-claims-mockup.md) |
| What Iteration 1 must do | [docs/features/iteration-1-voice-chat.md](docs/features/iteration-1-voice-chat.md) |
| What Iteration 2 must do | [docs/features/iteration-2-document-store.md](docs/features/iteration-2-document-store.md) |

## The rule that overrides everything else

**The rules table is data. The model is language. They never trade jobs.**

The LLM does exactly three things: turn speech into a structured answer, phrase
the next question, and speak output back. It is **never** asked which claims
exist or which documents are required. Every entitlement in the output traces to
a row in [docs/rules-table.md](docs/rules-table.md) carrying a citation.

Concretely:

- `deriveClaims(profile)` is a **pure function**. No API key, no network, no
  model call. Same input, same output, always. If it ever needs a model, the
  design is wrong — stop and say so.
- `src/rules/` imports nothing from `src/sarvam/`, `src/openai/`,
  `src/interview/`, or
  `convex/`. The arrow points one way.
- Never write a claim, form number, document requirement, or timeline that isn't
  in the rules table. **If a rule is needed and isn't there, add it to
  `docs/rules-table.md` with a `[VERIFY]` tag and a source — don't invent it in
  code.**
- Never delete a `[VERIFY]` marker without actually checking the cited source.
- Never persist a derived `ClaimSet`. Claims are recomputed from the profile on
  every read, so a rules fix applies to existing sessions immediately.

Why this is strict: the output is a list of legal entitlements shown to a
grieving person. A hallucinated claim sends someone to a counter that turns them
away. A hallucinated document requirement sends them chasing paperwork that
doesn't exist. Being wrong here costs a real family real weeks.

## Conventions

- **Tri-state, not boolean.** `"yes" | "no" | "unknown"`. Never collapse
  `unknown` into `no` — "I don't know if he had a PF account" produces a
  checklist item; "he had no PF account" produces nothing. Collapsing silently
  drops claims, which is the exact failure this product exists to prevent.
- **Amounts are brackets, not numbers.** `"under-5L" | "5L-15L" | "over-15L"`.
  Nobody knows the balance to the rupee, and the rules only branch on
  thresholds.
- **Inferences are additive.** `applyInferences()` appends claims and cards. It
  never removes or rewrites one. A bug that adds a spurious claim is visible and
  survivable; one that silently drops a real entitlement is not.
- **Claims vs cards.** A `Claim` is money the family is owed. A `Card` is a
  thing to check, a warning, or a pointer. Never let a card render as a claim.
- **One question, one field.** Extraction never writes a field the question
  didn't ask about, even if the transcript volunteers it.
- **Kannada is authored, not translated.** Write `kn-IN` strings directly.
  Machine-translated bureaucratic English produces Kannada nobody says.

## Tone

Someone may be using this within a week of a death.

- No celebration. No confetti, no "🎉 4 claims found!". State counts plainly.
- "your husband" / "your father" when the relationship is known — never "the
  deceased" in user-facing text.
- Amber for blocked, not red. A missing document isn't an error, it's the next
  step.
- Where to file comes before what's missing. That's the family's first question.
- No jargon in questions ("did he work a salaried job?", not "was he an EPF
  subscriber"). Jargon belongs in the output, where it names the form to ask for.

## Commands

```bash
bun install
bun run web           # / = landing · /app = voice/text interview
bun run dev           # Same Bun server with hot reload
bun run convex        # Reserved persistence backend (not in the Iteration 1 voice path)
bun run dev:worker    # Cloudflare Workers runtime on localhost:8787
bun run deploy:worker # Deploy static assets + Worker WebSocket
bun run typecheck
bun run typecheck:worker
bun test
```

`SARVAM_API_KEY` and `OPENAI_API_KEY` go in `.env` for the Bun server. They
never reach the browser. Without either, the typed interview and deterministic
checklist still run.

## Checkpoints

When the user says "checkpoint", commit for them:

```bash
git add .
git commit -m "feat: <short description>

- What: <what was built>
- How: <approach>
- Status: <working/partial/needs testing>"
```

Then confirm with the hash. Git history is the changelog — don't write a
separate one.

## Never commit

- Recorded interview audio (`samples/*.wav`) — may contain real details about a
  real death. Only synthetic `samples/demo-*.wav` are tracked.
- `.env`, `convex/_generated/`
