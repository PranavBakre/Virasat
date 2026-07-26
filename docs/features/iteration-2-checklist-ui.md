# Iteration 2 — Browser checklist

> Status: **not started** · Depends on: [Iteration 1](iteration-1-voice-interview.md)
> Time budget: **~1 hour.** This is the demo surface. If the day is running late,
> this is the last iteration — cut Iteration 3 without hesitation.

## What it does

One page. Hold a button, speak, release. The agent asks the next question aloud.
The provisional claims on the right fill in as answers come in. After the estate
questions finish, the left column becomes a checkbox list containing only the
documents required by those claims.

That live fill is the demo. The judge should see a claim the family didn't know
about *appear on screen* while someone is still talking.

## Files

| File | Contents |
|---|---|
| `convex/schema.ts` | `sessions` table |
| `convex/sessions.ts` | `create`, `get`, `applyAnswer`, and `setDocumentStatus` |
| `convex/turn.ts` | `"use node"` action: audio → STT → extract → `applyAnswer` → TTS |
| `web/index.html` | Single page, Tailwind CDN, Convex browser client, no build step |
| `web/app.js` | MediaRecorder capture, `client.action(...)`, render |

Reuse `src/rules/`, `src/interview/`, `src/sarvam/` unchanged. If this iteration
needs to modify the rules engine, something went wrong earlier.

## Convex surface

```ts
sessions.create()                        → sessionId
sessions.get({ sessionId })              → { profile, claims, cards, question,
                                             documentChecklist }
                                           ← subscription. this is what makes
                                             the checklist live.
sessions.applyAnswer({ sessionId, field, value })   ← the fallback path writes
                                                      here directly
sessions.setDocumentStatus({ sessionId, documentId, value })
turn({ sessionId, audio })               ← action: STT → extract → applyAnswer,
                                             returns { questionAudio }
```

`sessions.get` calls `deriveClaims(profile)` on every read. Claims are never
stored — see [architecture.md](../architecture.md#convex).

The client subscribes once and re-renders wholesale on each update. No diffing:
it is an optimization with no demo value and real bug risk.

## Document checklist

The document step happens after provisional claims are known:

1. Deduplicate the `docsRequired` entries across those claims.
2. Show one checkbox per relevant document—never a generic master list.
3. Store checked as `yes`, unchecked as `no`, and not yet answered as `unknown`.
4. Recompute each claim's `status` and `blockedOn` reactively.

Document possession changes filing readiness, not entitlement. Unchecking a
document must never make a claim disappear; it changes that claim to `blocked`
and names the missing document.

**The reactive query is why the demo works.** The action writes the answer; the
subscription pushes the new claim set. Nothing in the UI code coordinates the
two, so the checklist cannot fall out of sync with the profile — which is the
bug that would be most visible and most embarrassing on stage.

## Layout

```
┌──────────────────────────┬─────────────────────────────────┐
│                          │  CLAIMS                          │
│   "ಅವರಿಗೆ ಬ್ಯಾಂಕ್        │                                  │
│    ಖಾತೆ ಇತ್ತೇ?"          │  ✓ BANK — nominee registered     │
│                          │      file at branch · 15 days    │
│      ●  hold to speak    │      needs: claim form           │
│                          │                                  │
│   ─────────────────      │  ⚠ EPFO — provident fund         │
│   or type your answer    │      Form 20 · missing 2 docs    │
│   ┌────────────────┐     │                                  │
│   │                │     │  ⚠ EPFO — death insurance (EDLI) │
│   └────────────────┘     │      Form 5IF                    │
│                          │      ← most families never file  │
│                          │                                  │
│                          │  4 claims · 1 filable now        │
└──────────────────────────┴─────────────────────────────────┘
```

Left column is the conversation. Right column is the deliverable. The right
column never empties and never reorders once a claim is on it — a checklist that
reshuffles while someone reads it is unusable, and looks broken on stage.

## The fallback is not optional

The typed-input box ships **in this iteration, alongside the mic** — not after,
not "if there's time."

Two things reliably fail during a live demo: the venue mic and the network. The
text path routes through the identical extraction and rules code, so it is not a
second implementation — it is the same pipeline with the STT step skipped. Ten
minutes of work that guarantees there is a demo at 6:30 PM.

Test it by pulling the mic permission and running a full session typed.

## Tone

The design constraint is that a person may be using this within a week of a
death. Concretely:

- No celebration. No confetti, no "🎉 4 claims found!". State the count plainly.
- Name the deceased as "your husband" / "your father" if the relationship is
  known, never "the deceased" in the UI.
- Amber for blocked, not red. Nothing here is an error — a missing document is
  just the next step.
- Every claim shows *where to file* before *what's missing*. The family's first
  question is where to go.
- The `[VERIFY]` marker renders visibly, with its citation. See
  [rules-table.md](../rules-table.md) — unverified guidance that looks
  authoritative is the failure mode that actually hurts someone.

Basic Tailwind via CDN. No custom CSS, no animation, no responsive work. Desktop
only — the demo is on a laptop.

## Build order

1. **Static page with hardcoded claims JSON.** Get the layout right with fake
   data, no backend. ~15 min.
2. **Schema + `sessions.get` + answer/document mutations, wired to the page.**
   Typed input and document checkboxes working end to end against Convex. This
   is the fallback *and* the fastest way to prove the reactive render. ~15 min.
3. **`convex/turn.ts` action.** MediaRecorder → webm → STT → the same
   `applyAnswer` mutation. ~20 min.
4. **Question audio playback.** Base64 from TTS → `Audio` element. ~10 min.

Note step 2 before step 3: the typed path being first means the whole pipeline —
including the subscription that drives the live checklist — is proven before the
mic is introduced, and the fallback can't be dropped for time.

Run `bunx convex dev` in a second terminal for the whole iteration. Set
`SARVAM_API_KEY` in the Convex dashboard, not just `.env` — actions read the
deployment's environment, not your shell's.

## Done when

- [ ] Full session by voice, start to finished checklist, in the browser
- [ ] Full session by typing, with the mic disabled
- [ ] Claims appear as answers land — visible mid-conversation, not at the end
- [ ] After the interview, only relevant document checkboxes appear
- [ ] Unchecking a document blocks the affected claim without removing it
- [ ] EDLI appears for a salaried deceased and is visibly labelled as commonly missed
- [ ] `Cmd+P` produces a readable printout (this is the "export" feature)
- [ ] Committed: `feat: iteration 2 — browser push-to-talk with live checklist`

## Explicitly out

- Mobile / responsive
- Auth, accounts, session list
- Streaming audio
- PDF generation — print stylesheet only
- Animations, loading skeletons, toasts
