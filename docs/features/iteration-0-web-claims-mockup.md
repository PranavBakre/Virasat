# Iteration 0 — Web claims mockup

> Status: **complete**
> Replaces the former terminal claims-engine and browser-checklist iterations.

## What it does

`bun run web` opens one desktop page. A scripted Kannada/English interview
advances one answer at a time while a real deterministic claims checklist fills
in beside it. After the final answer, the family ticks the documents they have
and each claim updates to filable or blocked.

The interview is mocked. The legal derivation is not.

## Files

| File | Contents |
|---|---|
| `src/rules/types.ts` | Estate profile, rules, gates, claims, cards |
| `src/rules/table.ts` | Starter cited claim rows |
| `src/rules/gates.ts` | Death-certificate blockers |
| `src/rules/inferences.ts` | Additive EPFO and employer-dues cluster |
| `src/rules/engine.ts` | Pure `deriveClaims(profile)` |
| `src/rules/engine.test.ts` | Determinism and legal-boundary tests |
| `web/index.html` | Virasat two-column document interface |
| `web/app.js` | Scripted progression, document controls, rendering |
| `web/serve.ts` | Static server and local `/api/derive` endpoint |

## Real behavior

- Death-certificate `no` or `applied` collapses the output to one hard gate.
- Known bank accounts are evaluated independently and retain an `assetRef`.
- A salaried EPFO member derives PF, EPS, and EDLI; employment also derives
  employer dues.
- Document possession affects filing readiness, never entitlement.
- Every claim retains its legal source and unresolved `[VERIFY]` state.
- Claims and discovery cards are separate and counted separately.
- The same profile always returns the same ClaimSet without network access.

## Deliberately mocked

- Questions and answers are a fixed authored demo sequence.
- No natural-language extraction, microphone, Sarvam, or generated responses.
- No Convex, persistence, sessions, or reactive subscription.
- No fake voice control. The page states that voice arrives next.

## Build order

1. Static two-column HTML shell using the `virasat-design` system.
2. Pure starter claims engine and focused tests.
3. Local `/api/derive` endpoint.
4. Scripted questions that progressively update the real profile.
5. Relevant-document checkboxes and final visual verification.

## Done when

- [x] `bun run web` opens the mockup at `http://localhost:3000`
- [x] Claims appear while the scripted interview advances
- [x] EDLI is visibly marked as commonly missed
- [x] Missing documents block claims without removing them
- [x] Every claim shows its source and `[VERIFY]` when applicable
- [x] Death-certificate `no` and `applied` produce only the hard gate
- [x] `bun run typecheck` and `bun test` pass twice
- [x] Desktop browser render matches the approved Virasat design language

## Explicitly out

- Voice, chat, STT, TTS, and answer extraction
- Convex and persistence
- Mobile or responsive layouts
- Animations, loading states, toasts, and PDF generation
