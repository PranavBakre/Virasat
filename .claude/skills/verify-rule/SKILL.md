---
name: verify-rule
description: Resolve [VERIFY] markers in docs/rules-table.md against their cited primary source (S1-S9), correct the row if the source disagrees, and write the audit record. Use when asked to verify a rule, check a source, resolve VERIFY tags, or confirm a claim's legal basis before the demo.
---

# verify-rule

Resolve one or more `[VERIFY]` markers in [`docs/rules-table.md`](../../../docs/rules-table.md)
against the primary source it cites.

**Why this is a skill and not a one-off:** it is repeated, structured, and the
step most likely to be skipped under deadline pressure. A `[VERIFY]` silently
deleted without checking produces a rule that *looks* verified — which is worse
than one that admits it isn't, because the family acts on it.

## Argument

`/verify-rule S1` — resolve every marker citing that source (efficient: one
read settles many markers).
`/verify-rule bank` — resolve markers in a named section.
No argument — list unresolved markers, grouped by source, and stop.

**Prefer verifying by source, not by row.** S1 alone settles most of the bank
rows in a single read.

## Procedure

### 1. Find the markers

```bash
grep -n '\[VERIFY' docs/rules-table.md
```

### 2. Get the source

Check `legal_sources/` first — it may already be downloaded. Otherwise fetch it
from the source table at the bottom of `docs/rules-table.md`.

**Primary sources only.** Never resolve a marker from a blog, a news article, a
law-firm explainer, or an LLM's recollection. If an indiacode handle 404s,
search the act name on `indiacode.nic.in` — do not trust a mirror.

If the source is unreachable, **the marker stays**. Say so and move on. An
unresolved marker is a working state; a wrongly-cleared one is a defect.

### 3. Compare, then act

| Finding | Action |
|---|---|
| Source confirms the row | Delete the `[VERIFY]`. Leave the rule as-is. |
| Source contradicts the row | **Correct the row**, then delete the marker. The source wins, always. |
| Source is silent or ambiguous | **Keep the marker.** Narrow its text to say what specifically is still open. |
| Source reveals a rule we're missing | Add the row, cite it, and note it in the audit — this is the highest-value outcome |

Quote the source in the audit record. Paraphrase is where drift enters.

### 4. Propagate to code

If `src/rules/table.ts` exists, update the matching entry — the row's text, its
`verify` flag, and any changed `docsRequired` or `forms`. The markdown is the
contract, but a stale `table.ts` is what actually reaches the family.

### 5. Write the audit record

One file per session in `docs/audits/`, named `YYYY-MM-DD-<source-ref>.md`:

```markdown
# S1 — RBI Deceased Claims Directions 2025

Checked: 2026-07-26 · Source: https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12901&Mode=0

## §1 row 2 — sole account, nominee registered

**Was:** "RBI-2025 mandates 15-day settlement [VERIFY in S1 text]"
**Source says:** "<direct quote>"
**Outcome:** confirmed · marker removed
```

Record confirmations, not just corrections. "We checked and it was right" is the
evidence that makes the whole table defensible.

## Done when

- [ ] Every marker for the named source is resolved, or explicitly left open with a reason
- [ ] Rows that disagreed with the source are corrected, not just unmarked
- [ ] `src/rules/table.ts` matches the markdown (if it exists yet)
- [ ] An audit file records each decision with a quote
- [ ] Committed: `docs: verify <source-ref> rules against primary source`

## Never

- Delete a `[VERIFY]` without opening the cited source
- Resolve from memory, a blog, or a search snippet
- Add a claim, form number, or document requirement that the source doesn't support
- Leave `table.ts` disagreeing with `rules-table.md`
