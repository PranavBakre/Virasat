# Iteration 2 — agentic chat

Replaces the fixed question queue with a real conversation. The family can say
anything at any time, volunteer several facts at once, ask a question back, or
change an earlier answer. The model drives the turn; the rules table still owns
every entitlement.

Reference implementation studied: `gx-client-next/components/learning-v2/module-assistant.tsx`
(tool loop + streamed turn) and `gx-client-next/modules/learn/ai-companion/`.
That one streams over SSE because it is HTTP. **We already have a WebSocket
carrying audio both ways, so the assistant streams over the same socket** — no
second transport.

## Measured Sarvam capabilities (verified 26 Jul 2026, do not re-derive)

| Capability | Result |
|---|---|
| `tools` + `tool_choice: "auto"` | works, `finish_reason: "tool_calls"`, **366ms** |
| Multi-fact extraction in one call | "yes I have the death certificate, and he had a PF account too" → both fields |
| `stream: true` | async iterable, first delta **288ms**, `chunk.choices[0].delta.content` |
| `reasoning_effort: null` | **20–30× faster** (2.4–11s → ~200ms). SDK enum lists only low/medium/high; null is the documented off switch and must be cast |

Without `reasoning_effort: null` this feature is not viable — the model returns
`content: null` after burning the whole token budget on reasoning.

## The rule that still overrides everything

**The model may never state a claim, form number, document requirement, or
timeline that did not come back from a tool.** `deriveClaims()` stays a pure
function and the register renders only from its output. The model's job is
language: decide what to ask next, phrase it kindly, and read back what the
tools returned.

Concretely: if the model wants to talk about entitlements it must call
`get_checklist` first. The system prompt says so, and because the register is
rendered from `claimSet` rather than from the model's text, a violation is
visible on screen rather than silently authoritative.

## Protocol (frozen — both sides code against this)

Added to `ClientMessage`:

```ts
| { type: "chat"; text: string }        // free-form user turn, max 500 chars
| { type: "stop_generation" }           // abort the in-flight assistant turn
```

`typed_answer` and `stt_start`'s `questionId` stay for now so the old path keeps
working; chat mode does not use them.

Added to `ServerMessage`:

```ts
| { type: "user_message"; id: string; text: string }   // echo, so voice turns render
| { type: "chat_start"; id: string }
| { type: "chat_delta"; id: string; text: string }
| { type: "chat_tool"; id: string; name: string; status: "started" | "completed" }
| { type: "chat_end"; id: string; aborted?: boolean }
```

`state` continues to carry `{ profile, claimSet, language, ... }` and remains the
only thing the register reads.

Ordering guarantee: for one user turn the server emits exactly one
`user_message`, then one `chat_start`, then zero or more `chat_tool` /
`chat_delta`, then exactly one `chat_end`. A `state` frame is emitted after any
tool that changed the profile, so the register updates mid-turn.

## Tools

Derived from `src/interview/questions.ts` so they can never drift from the rules.

### `record_answers`

One optional property per interview field, each constrained to that question's
`values` enum (free-text fields get `maxLength`). The model may set several in
one call — that is the point, it is what makes this a conversation rather than a
form.

Server-side every write is validated against the question whitelist and applied
through the existing `applyQuestionAnswer`. Unknown fields and out-of-enum
values are dropped, not coerced. Returns the fields actually accepted plus a
short summary of what is still unknown, so the model knows what to ask next.

> **Convention change, flagged deliberately.** CLAUDE.md says "One question, one
> field — extraction never writes a field the question didn't ask about, even if
> the transcript volunteers it." Agentic chat requires the opposite: a family
> saying "he was working at Infosys and had a PF account" should have both
> recorded. The original guard against mis-attribution is replaced by strict
> server-side enum validation plus the transcript panel, which shows every
> recorded field so a wrong write is visible. **This needs the owner's sign-off.**

### `get_checklist`

No arguments. Returns the current `deriveClaims(profile)` — claims with their
status, where to file, documents held/missing, gates, and cards. This is the
only way the model is allowed to learn what the family is owed.

## Files

| File | Change |
|---|---|
| `src/interview/protocol.ts` | new message variants + validation |
| `src/interview/agent.ts` | **new** — tool schema, tool execution, turn loop |
| `web/serve.ts` | route `chat` to the agent, stream frames, keep voice wiring |
| `web/app.js` | messages array, delta append, free-form input, tool chips |
| `web/index.html` | input always enabled; no per-question form |

## Done when

- [ ] Typing "he was working at Infosys and had a PF account" records both fields
- [ ] The register updates mid-turn, from `deriveClaims` only
- [ ] Asking "what is EDLI?" gets an answer without derailing the interview
- [ ] Correcting an earlier answer ("actually the account was joint") updates it
- [ ] Voice: a spoken turn becomes a chat turn and the reply is spoken back
- [ ] `bun test` and `bunx tsc --noEmit` clean
- [ ] The model never names a claim absent from `get_checklist`
