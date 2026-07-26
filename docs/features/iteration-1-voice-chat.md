# Iteration 1 — Voice interview with secondary chat

> Status: **not started**
> Depends on: [Iteration 0](iteration-0-web-claims-mockup.md)

## What it does

The web mockup becomes a real interview. Voice is the primary input: the agent
speaks one authored question, listens to one answer, extracts one typed field,
and advances. Text chat is always available as the secondary path and uses the
same extraction, profile, and rules engine.

## Added files

| File | Contents |
|---|---|
| `src/sarvam/client.ts` | Shared authenticated fetch wrapper |
| `src/sarvam/stt.ts` | Audio to transcript |
| `src/sarvam/tts.ts` | Authored question to audio |
| `src/sarvam/chat.ts` | Schema-constrained typed extraction |
| `src/interview/questions.ts` | Kannada/English question bank |
| `src/interview/state.ts` | Pure conditional next-question selection |
| `src/interview/extract.ts` | One transcript to one profile patch |
| `convex/schema.ts` | Interview session |
| `convex/sessions.ts` | Profile/query/document mutations |
| `convex/turn.ts` | STT → extraction → mutation → TTS action |

## Input contract

- Voice and text differ only before extraction: voice passes through STT; text
  supplies the transcript directly.
- Both paths extract exactly one field for the pending question.
- Routing values are enum-constrained. Bank and nominee names are bounded
  display-only strings and never decide entitlement.
- `"unclear"` re-asks once, then the text path remains available.
- Kannada copy is authored directly, never machine-translated from English.

## Done when

- [ ] A full Kannada voice interview reaches the document checklist
- [ ] The same interview can be completed entirely through text chat
- [ ] Voice and text answers produce identical ClaimSets
- [ ] Claims continue to appear mid-interview
- [ ] Sarvam failure leaves the text path and deterministic checklist usable

## Explicitly out

- Streaming voice, barge-in, and telephony
- Multiple sessions, accounts, or authentication
- Document upload/OCR
- Additional states or legal tracks

