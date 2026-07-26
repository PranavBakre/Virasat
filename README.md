# virasat

**ವಿರಾಸತ್** — *inheritance; what is left behind*

After a death in India, families have to claim money from banks, insurers, EPFO,
and pension offices. Each has a different process and a different document list.
Nobody tells the family the full picture, so claims get missed or abandoned —
money sits unclaimed in accounts and EPFO ledgers for years.

virasat is a voice agent (Kannada/English) that interviews the person handling
the estate, derives which claims that family can file from a rules table built on
the RBI 2025 deceased-claims directions, the Hindu Succession Act, and EPFO
forms — and outputs a checklist per claim: **where to file, what documents are
needed, what's missing.**

> Built for the Sarvam Epoch Buildathon, 26 July, Razorpay Arena.
> Scope: Karnataka · Hindu Succession Act intestate path · movable assets.

## The problem, concretely

The person doing this is usually a spouse or adult child, 45–70, often more
fluent in Kannada than English, and has never done it before. They go
institution by institution and learn each requirement by being turned away.

The claim almost nobody files: **EDLI**. If the deceased was salaried, EPFO owes
the family a death-insurance payout — up to ~₹7 lakh — on top of the provident
fund balance. It needs one form. Most families never hear about it.

virasat's job is to be the one place that says: here are all seven things you
can claim, here is where each one is filed, here are the two documents you're
still missing.

## How it works

```
speech (kn-IN / en-IN)
  → Sarvam Saaras v3            transcript
  → constrained extraction      one typed answer, one field
  → EstateProfile               Convex doc
  → rules engine                pure function, no model
  → checklist + next question
  → Sarvam Bulbul v3            spoken back
```

**The architectural commitment:** the rules table is data, the model is
language, and they never trade jobs. The LLM turns speech into structured
answers and speaks output back. It is never asked which claims exist or which
documents are required — every entitlement traces to a cited row in
[`docs/rules-table.md`](docs/rules-table.md).

This matters because the output is a list of legal entitlements shown to a
grieving person. A hallucinated claim sends someone to a counter that turns them
away. A hallucinated document sends them chasing paperwork that doesn't exist.

## Stack

Bun · TypeScript · Convex (backend + DB) · Sarvam (Saaras v3 STT, Sarvam-30B
chat, Bulbul v3 TTS) · Tailwind CDN.

## Run it

```bash
bun install
bun run web
```

- `http://localhost:3000/` — landing page: the problem, the claim nobody files, a
  real register excerpt
- `http://localhost:3000/app` — the interview and live register
- `http://localhost:3000/app?demo=ready` — jump to the finished state (for demos)

Iteration 1 adds Sarvam voice and secondary text chat. At that point, copy
`.env.example` to `.env` and set the key in the Convex deployment:

```bash
bunx convex env set SARVAM_API_KEY sk_…
```

## Documentation

| | |
|---|---|
| [docs/README.md](docs/README.md) | Index |
| [docs/rules-table.md](docs/rules-table.md) | **The claims, documents, and legal citations — this is the product** |
| [docs/architecture.md](docs/architecture.md) | Data contracts, module boundaries, failure posture |
| [docs/sarvam-api.md](docs/sarvam-api.md) | Verified endpoint reference |
| [workflows/1-IDEATION.md](workflows/1-IDEATION.md) | Scope, cuts, demo script |
| [CLAUDE.md](CLAUDE.md) | Working rules for this repo |

## Status

Iteration 0 is complete.

| # | Iteration | Status |
|---|---|---|
| 0 | Web claims mockup — scripted interview + real checklist | complete |
| 1 | Voice interview with secondary text chat | not started |

## A caution

This is guidance, not legal advice. Rules carrying a `[VERIFY]` marker have not
yet been confirmed against their cited source, and are rendered as such in the
product. The scope is deliberately narrow — one state, one succession path,
movable assets only — because narrow and correct is worth more here than broad
and wrong.
