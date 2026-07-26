# Iteration 2 — Browser checklist

> Status: **not started** · Depends on: [Iteration 1](iteration-1-voice-interview.md)
> Time budget: **~1 hour.** This is the demo surface. If the day is running late,
> this is the last iteration — cut Iteration 3 without hesitation.

## What it does

One page. Hold a button, speak, release. The agent asks the next question aloud.
The checklist on the right fills in as answers come in.

That live fill is the demo. The judge should see a claim the family didn't know
about *appear on screen* while someone is still talking.

## Files

| File | Contents |
|---|---|
| `server.ts` | Bun HTTP server — serves the page, hosts two routes |
| `web/index.html` | Single page, inline Tailwind CDN, no build step |
| `web/app.js` | MediaRecorder capture, fetch, render |

Reuse `src/rules/`, `src/interview/`, `src/sarvam/` unchanged. If this iteration
needs to modify the rules engine, something went wrong earlier.

## Routes

```
POST /turn      body: audio blob (webm) + session id
                → { question, questionAudio, profile, claims }

POST /turn/text body: { text, sessionId }     ← the fallback path
                → same shape
```

Session state is a `Map<string, EstateProfile>` in server memory. No database.
Refresh starts over, and that is an accepted, documented limitation.

Both routes return the **full** claim set every turn, not a diff. The client
re-renders wholesale. Diffing is an optimization with no demo value and real
bug risk.

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
   data, no server. ~15 min.
2. **`POST /turn/text`.** Typed input working end to end. This is the fallback
   *and* the fastest way to test the whole loop. ~15 min.
3. **`POST /turn`.** MediaRecorder → webm blob → the same handler with STT in
   front. ~20 min.
4. **Question audio playback.** Base64 from TTS → `Audio` element. ~10 min.

Note step 2 before step 3: the typed path being first means the pipeline is
proven before the mic is introduced, and the fallback can't be dropped for time.

## Done when

- [ ] Full session by voice, start to finished checklist, in the browser
- [ ] Full session by typing, with the mic disabled
- [ ] Claims appear as answers land — visible mid-conversation, not at the end
- [ ] EDLI appears for a salaried deceased and is visibly labelled as commonly missed
- [ ] `Cmd+P` produces a readable printout (this is the "export" feature)
- [ ] Committed: `feat: iteration 2 — browser push-to-talk with live checklist`

## Explicitly out

- Mobile / responsive
- Session persistence
- Auth
- Streaming audio
- PDF generation — print stylesheet only
- Animations, loading skeletons, toasts
