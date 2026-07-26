# Iteration 0 — Claims engine

> Status: **not started**
> Time budget: **20 minutes.** If it runs over, cut rows from the rules table —
> never cut the citation field.

## What it does

`bun run core.ts` reads a hardcoded `EstateProfile`, derives every claim that
family can file, and prints the checklist to the terminal.

No UI. No Sarvam. No network. This is the magic moment with the packaging
removed.

## Why this is the right Iteration 0

The product's entire claim to value is that the derivation is *correct and
complete*. Voice is how someone reaches the derivation; it is not the thing that
makes the product worth having. If `deriveClaims()` produces a checklist that
makes a Karnataka family say "I didn't know about three of these" — the project
works. Everything after this is interface.

Corollary: this is the one iteration where being slow is fine and being wrong is
not.

## Files

| File | Contents |
|---|---|
| `src/rules/types.ts` | `EstateProfile`, `Claim`, `ClaimSet` — copy from [architecture.md](../architecture.md#data-contracts) |
| `src/rules/table.ts` | The rules table as a typed array — from [rules-table.md](../rules-table.md) |
| `src/rules/engine.ts` | `deriveClaims(profile: EstateProfile): ClaimSet` |
| `core.ts` | Hardcoded profile + `printChecklist()` |

## Build order

1. **`types.ts`** — the three contracts, nothing else. 2 min.
2. **`table.ts`** — start with **four** claim rows only: bank, EPFO PF, EPFO
   EDLI, insurance. EDLI is the one that produces the demo's surprise, so it is
   not optional. 8 min.
3. **`engine.ts`** — gates first, then filter rows by profile, then compute
   `status` and `blockedOn` from `docsRequired`. 6 min.
4. **`core.ts`** — hardcoded profile, print. 4 min.

Add the remaining claim rows (pension, demat, mutual funds, small savings,
gratuity) only after the four-row version prints correctly. The table is
append-only data; the engine does not change as rows are added.

## The hardcoded profile

Use a realistic Karnataka case, not an empty object — the printout is the demo,
and an all-`unknown` profile prints nothing interesting.

```ts
const profile: EstateProfile = {
  deathCertificate: true,
  religion: "hindu",
  will: "no",
  state: "karnataka",
  relationship: "spouse",
  survivingHeirs: ["widow", "son", "daughter"],
  bank: { exists: "yes", holding: "sole", nominee: "yes" },
  epfo: { exists: "yes", salaried: true, serviceYears: 22 },
  insurance: { exists: "unknown" },
  pension: { exists: "no" },
};
```

This profile is chosen to exercise every code path worth seeing: a claim that is
filable today (bank, nominee registered), a claim the family didn't know existed
(EDLI), a claim blocked on a missing document (EPFO forms), and an asset whose
existence is unknown (insurance → "check for policies").

## Engine shape

```ts
export function deriveClaims(profile: EstateProfile): ClaimSet {
  const gates = evaluateGates(profile);
  // Hard gate: no death certificate → nothing routes. Return early with a
  // single instruction rather than a checklist the family cannot act on.
  if (gates.some(g => g.blocking)) return { gates, claims: [] };

  const claims = RULES
    .filter(rule => rule.applies(profile))
    .map(rule => materialize(rule, profile));

  return { gates, claims, sharesNote: sharesFor(profile) };
}
```

`materialize()` resolves `docsRequired` against what the profile says the family
has, sets `status` to `blocked` when any required doc is missing, and carries
`legalBasis` and `verify` through untouched.

## Output format

Terminal, grouped by claim, missing documents called out last per claim:

```
VIRASAT — claims map
Karnataka · Hindu Succession Act (intestate) · movable assets

  [1] BANK — sole account with registered nominee              ✓ file today
      where:   branch holding the account
      docs:    death certificate ✓ · claim form · nominee ID ✓
      note:    RBI 2025 bars the bank from demanding a succession
               certificate, probate, or indemnity in nominee cases
      timeline: 15 days from submission

  [2] EPFO — provident fund balance                            ⚠ blocked
      where:   EPFO regional office / member portal
      forms:   Form 20
      missing: joint photograph, cancelled cheque

  [3] EPFO — death insurance (EDLI)                            ⚠ blocked
      where:   same claim packet as Form 20
      forms:   Form 5IF
      missing: joint photograph
      note:    paid on top of the PF balance — most families never file this

  [4] INSURANCE — existence unknown                            ? check
      action:  search for policy documents, premium receipts, or bank
               debits to an insurer

  4 claims · 1 filable now · 2 blocked on documents · 1 to confirm
```

Print `[VERIFY]` rows with a visible marker. An unverified legal claim that
*looks* verified is the worst possible output of this program.

## Done when

- [ ] `bun run core.ts` prints a checklist with no network access
- [ ] Changing `epfo.exists` to `"no"` removes claims 2 and 3 from the output
- [ ] Changing `deathCertificate` to `false` collapses output to the single gate
- [ ] Every printed claim shows a non-empty `legalBasis`
- [ ] Committed: `feat: iteration 0 — claims engine derives checklist from profile`

## Explicitly out

- Reading answers from anywhere but the hardcoded object
- Any Sarvam call
- Share percentages (a display note, not a computation — see
  [rules-table.md](../rules-table.md))
- Pretty formatting beyond plain text
