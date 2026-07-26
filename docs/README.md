# virasat documentation

Written before the build, updated as iterations land. For how to *work* in this
repo, read [CLAUDE.md](../CLAUDE.md) first — it carries the binding rules.

## Start here

| Need | Document |
|---|---|
| What we're building and what we cut | [Ideation worksheet](../workflows/1-IDEATION.md) |
| How to work in this repo | [CLAUDE.md](../CLAUDE.md) |
| System design and data contracts | [Architecture](architecture.md) |
| **The claims, documents, and legal citations** | [Rules table](rules-table.md) |
| Sarvam endpoints and params | [Sarvam API](sarvam-api.md) |
| Colours, type, layout, tone | [`virasat-design` skill](../.claude/skills/virasat-design/SKILL.md) |

## The rules table is the product

[rules-table.md](rules-table.md) is not reference material — it is the thing
being built. `src/rules/table.ts` is a transcription of it into typed data.
When they disagree, the markdown wins.

Two conventions in that file matter more than anything else here:

- **`[VERIFY]` markers** flag rules not yet confirmed against a cited source.
  They are rendered visibly in the product. Never delete one without checking
  the source it names.
- **`S1`–`S9` source refs** are the citation vocabulary. Every claim row carries
  one. A row without a citation doesn't ship.

`S1` — the RBI Settlement of Claims (Deceased Customers) Directions 2025 — is
the crown source. It resolves most bank-row `[VERIFY]` tags in one read, and its
annexes double as the claim-form templates. Read it first.

## Iterations

Each is independently demoable — if the day goes badly, Iteration 1 is still a
real demo. That property is the point of the ordering.

| # | Ships | Doc |
|---|---|---|
| 0 | Web mockup: scripted interview + real live checklist | [Web claims mockup](features/iteration-0-web-claims-mockup.md) |
| 1 | Voice interview with secondary text chat | [Voice + chat](features/iteration-1-voice-chat.md) |

## Phase rules

[`rules/ideation.md`](../rules/ideation.md) and
[`rules/building.md`](../rules/building.md) are the buildathon's own process
rules, vendored here so Claude loads them. They are binding, including the parts
that forbid ordinary good practice — the constraint is the 6:30 PM deadline.

## Directories

| Path | Contents |
|---|---|
| `docs/features/` | One doc per iteration: scope, build order, done-when, explicitly-out |
| `docs/worklogs/` | Post-iteration notes — what actually happened vs. the plan |
| `docs/audits/` | `[VERIFY]` resolution records: which source, what it said, what changed |
| `legal_sources/` | Downloaded PDFs from the `S1`–`S9` source list (gitignored) |

## Updating docs

Mid-build, the only doc that must stay current is
[rules-table.md](rules-table.md) — because it is the product. Everything else
can drift until the iteration lands.

When resolving a `[VERIFY]`, write a line in `docs/audits/` naming the source,
the date checked, and what changed. That record is what makes the legal content
defensible to a judge who asks "how do you know?"
