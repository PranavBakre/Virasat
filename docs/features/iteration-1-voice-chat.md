# Iteration 1 — Voice interview with secondary chat

> Status: **implemented; live Sarvam and OpenAI key verification pending**
> Depends on: [Iteration 0](iteration-0-web-claims-mockup.md)

## What it does

The web mockup becomes a real interview. Voice is the primary input: the agent
speaks one authored question, listens to one answer, extracts one typed field,
and advances. Text chat is always available as the secondary path and uses the
same extraction, profile, and rules engine.

## Added files

| File | Contents |
|---|---|
| `src/sarvam/config.ts` | Server-only SDK configuration and language validation |
| `src/sarvam/stt.ts` | Streaming PCM16 audio to transcript |
| `src/sarvam/tts.ts` | Stream authored questions as Bulbul v3 audio |
| `src/sarvam/chat.ts` | Schema-constrained typed extraction |
| `src/openai/config.ts` | Server-only OpenAI configuration and model defaults |
| `src/openai/stt.ts` | Buffer PCM16 and send one WAV clip for transcription |
| `src/openai/tts.ts` | Stream authored questions from the Speech API |
| `src/openai/chat.ts` | Schema-constrained extraction with the Responses API |
| `src/voice/config.ts` | Shared language and provider validation |
| `src/interview/questions.ts` | Kannada/English question bank |
| `src/interview/state.ts` | Pure conditional next-question selection |
| `src/interview/extract.ts` | One transcript to one profile patch |
| `src/interview/protocol.ts` | Validated browser/server WebSocket messages |
| `web/pcm-worklet.js` | Browser PCM16 16 kHz microphone capture |
| `web/serve.ts` | One multiplexed WebSocket: STT, extraction, state, and TTS |

## Input contract

- Voice and text differ only before extraction: voice passes through STT; text
  supplies the transcript directly.
- Both paths extract exactly one field for the pending question.
- `SARVAM_API_KEY` remains in Bun; the browser only sees the Virasat socket.
- `OPENAI_API_KEY` follows the same server-only boundary.
- The provider selector switches STT, extraction, and TTS as one unit without
  resetting accumulated answers or derived claims.
- Routing values are enum-constrained. Bank and nominee names are bounded
  display-only strings and never decide entitlement.
- `"unclear"` re-asks once, then the text path remains available.
- Kannada copy is authored directly, never machine-translated from English.
- The buildathon flow captures one bank account end to end. Additional-account
  looping is deferred; the account id and nested patch shape already preserve
  the per-account rules boundary.

## Done when

- [ ] A full Kannada voice interview reaches the document checklist (live key)
- [x] The same interview can be completed entirely through text chat
- [x] Voice and text use the same extraction/profile path
- [x] Claims continue to appear mid-interview
- [x] Sarvam failure leaves the text path and deterministic checklist usable
- [x] Sarvam and OpenAI can be switched during the same interview session

## Explicitly out

- Barge-in and telephony
- Multiple sessions, accounts, or authentication
- Document upload/OCR
- Additional states or legal tracks
