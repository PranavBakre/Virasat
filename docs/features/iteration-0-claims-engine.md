# Iteration 0 — Claims engine

> Status: **not started**
> Time budget: **20 minutes.** If it runs over, cut rows from the rules table —
> never cut the citation field.

## What it does

`bun run core.ts` reads a hardcoded `EstateProfile`, derives every identified
claim within virasat's Karnataka movable-assets scope, and prints the checklist
to the terminal.

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
| `src/rules/types.ts` | `EstateProfile`, `Claim`, `Card`, `ClaimSet` — copy from [architecture.md](../architecture.md#data-contracts) |
| `src/rules/table.ts` | Rules table §1–§4 as a typed array — from [rules-table.md](../rules-table.md) |
| `src/rules/gates.ts` | §0 gates |
| `src/rules/inferences.ts` | §8 — the layer that makes it feel intelligent |
| `src/rules/engine.ts` | `deriveClaims(profile: EstateProfile): ClaimSet` |
| `core.ts` | Hardcoded profile + `printChecklist()` |

## Build order

1. **`types.ts`** — the contracts, nothing else. 2 min.
2. **`gates.ts`** — §0. Four conditions, and the death-certificate early return.
   Cheap, and it's what stops the engine emitting nonsense for a family that
   can't act yet. 3 min.
3. **`table.ts`** — start with **three** §1–§3 rows only: bank sole-with-nominee,
   bank sole-no-nominee (≤15L), EPFO PF. 6 min.
4. **`inferences.ts`** — just the `employed-at-death` rule, which alone adds
   EDLI, EPS pension, and gratuity. **This is not optional and not deferrable:**
   EDLI is the claim that produces the demo's surprise, and it exists only here.
   4 min.
5. **`engine.ts`** — gates → filter rows → apply inferences → compute `status`
   and `blockedOn`. 3 min.
6. **`core.ts`** — hardcoded profile, print. 2 min.

Add the remaining rows (insurance, pension, demat, mutual funds, small savings)
and the remaining inference rules only after this version prints correctly. The
table is append-only data; the engine does not change as rows are added.

## The hardcoded profile

Use a realistic Karnataka case, not an empty object — the printout is the demo,
and an all-`unknown` profile prints nothing interesting.

```ts
const profile: EstateProfile = {
  deathCertificate: "yes",
  religion: "hindu",
  will: "no",
  state: "karnataka",
  district: "Bengaluru Urban",
  relationship: "spouse",
  survivingHeirs: ["widow", "son", "daughter"],
  banks: {
    exists: "yes",
    accounts: [{
      id: "bank-1",
      bankName: "State Bank of India",
      bankType: "commercial",
      holding: "sole",
      nominee: "yes",
      nomineeName: "Spouse",
    }],
  },
  employment: "employed-at-death",
  epfo: { exists: "yes", serviceYears: 22 },
  insurance: { exists: "unknown" },
  pension: { exists: "no" },
  documents: {
    "death-certificate": "yes",
    "claimant-id": "yes",
    "cancelled-cheque": "no",
    "joint-photograph": "no",
  },
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
  // Hard gate: a missing or pending death certificate locks every route.
  // Return the gate so the renderer can show the single next action.
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
- [ ] Changing `deathCertificate` to `"no"` or `"applied"` collapses output to the single gate
- [ ] Every printed claim shows a non-empty `legalBasis`
- [ ] Committed: `feat: iteration 0 — claims engine derives checklist from profile`

## Explicitly out

- Reading answers from anywhere but the hardcoded object
- Any Sarvam call
- Share percentages (a display note, not a computation — see
  [rules-table.md](../rules-table.md))
- Pretty formatting beyond plain text
