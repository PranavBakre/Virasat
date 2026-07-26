# Iteration 1 — Voice interview (terminal)

> Status: **not started** · Depends on: [Iteration 0](iteration-0-claims-engine.md)
> Time budget: **~1 hour.**

## What it does

`bun run interview.ts` runs the interview as a voice loop in the terminal: it
speaks a question, you answer into the mic, it extracts the answer into the
`EstateProfile`, picks the next question, and repeats — then prints the same
checklist Iteration 0 printed.

Still no browser. This iteration proves the *loop*, not the interface.

## Why terminal voice before browser voice

Browser mic capture, audio encoding, and API plumbing are three independent
sources of failure. Doing them in one iteration means a broken demo with no way
to tell which layer broke. Here the audio path is a file on disk, so a failure is
unambiguously a Sarvam problem or a logic problem.

It also means Iteration 2 is *only* a UI, which is the part most likely to run
long.

## Files

| File | Contents |
|---|---|
| `src/sarvam/client.ts` | Shared fetch wrapper, key from env, the two auth conventions |
| `src/sarvam/stt.ts` | `transcribe(path) → { transcript, languageCode, confidence }` |
| `src/sarvam/tts.ts` | `speak(text, lang) → Buffer` (decode base64, write wav) |
| `src/sarvam/chat.ts` | `extract(schema, system, user) → T` — json_schema constrained |
| `src/interview/questions.ts` | Question bank, kn-IN and en-IN text per question |
| `src/interview/state.ts` | `nextQuestion(profile) → Question \| null` |
| `src/interview/extract.ts` | transcript + question → typed answer → profile patch |
| `interview.ts` | The loop |

Endpoint shapes: [sarvam-api.md](../sarvam-api.md). Do not guess the headers —
STT/TTS use `api-subscription-key`, chat uses `Authorization: Bearer`.

## Build order

1. **`stt.ts` against a sample file.** Record 5 seconds of Kannada into
   `samples/`, transcribe it, print the transcript. Nothing else until this
   prints real text. ~15 min.
2. **`tts.ts`.** Speak one hardcoded question, play it. `afplay` on macOS. ~10 min.
3. **`questions.ts` + `state.ts`.** Pure functions, no audio. Test by calling
   `nextQuestion()` against profiles by hand. ~10 min.
4. **`extract.ts`.** The constrained-JSON step. ~15 min.
5. **`interview.ts`.** Wire the loop. ~10 min.

## The extraction contract

This is the step where correctness is at risk, so it is constrained hard.

The model sees: the question that was asked, its allowed answer values, and the
transcript. It returns one enum value plus a confidence. It never sees the rules
table and never returns free text.

```ts
// The schema is generated per-question from the question's own `answers` list,
// so the model is structurally unable to return a value the profile can't hold.
const schema = {
  type: "object",
  required: ["value", "confidence"],
  properties: {
    value: { type: "string", enum: [...question.answers, "unclear"] },
    confidence: { type: "number" },
  },
};
```

`"unclear"` is always in the enum. That is the escape hatch that keeps the model
from forcing a wrong answer into a valid slot — and it routes to the re-ask path
instead of silently corrupting the profile.

**Never let extraction write a field the question didn't ask about.** One
question, one field. A transcript that volunteers extra information ("he had a
PF account and also an LIC policy") is thrown away and re-asked later. Losing
that is fine; a mis-attributed answer is not.

## Loop shape

```ts
while (true) {
  const q = nextQuestion(profile);
  if (!q) break;                         // terminating condition — not a count

  await play(await speak(q.text[lang], lang));
  const audio = await record();          // press enter to stop
  const { transcript, confidence } = await transcribe(audio);

  // Low STT confidence is a different failure than low extraction confidence:
  // the first means "didn't hear you", the second means "didn't understand you".
  // They get different re-asks.
  if (confidence < 0.6) { await reask(q, "misheard"); continue; }

  const answer = await extract(q, transcript);
  if (answer.value === "unclear") { await reask(q, "unclear"); continue; }

  profile = applyAnswer(profile, q, answer.value);
}

printChecklist(deriveClaims(profile));
```

Re-ask once per failure, then fall through to typed input. Never loop on the
same question more than twice — a distressed person being asked the same thing
three times is a product failure regardless of what the API returned.

## Question bank rules

The wording is product surface, not filler. Constraints:

- **One fact per question.** "Did he have a bank account, and was there a
  nominee?" is two questions.
- **Short sentences.** They are being spoken aloud to someone who is grieving.
- **No jargon in the question.** Ask "did he work a salaried job?", not "was he
  an EPF subscriber." Jargon belongs in the *output*, where it names the form
  they have to ask for.
- **Kannada is authored, not translated.** Write the kn-IN string directly.
  Machine-translating bureaucratic English produces Kannada nobody says.
- **Never ask what can be derived.** If `epfo.exists === "no"`, service years is
  not a question.

## Done when

- [ ] A full spoken interview in Kannada produces a populated profile
- [ ] The same run in English also works (language follows STT detection)
- [ ] `nextQuestion()` returns `null` and the loop exits on its own
- [ ] The printed checklist matches what Iteration 0 printed for the same answers
- [ ] Saying something unintelligible triggers exactly one re-ask, then moves on
- [ ] Committed: `feat: iteration 1 — voice interview loop with Sarvam STT/TTS`

## Explicitly out

- Browser, HTTP server, any UI
- Streaming or barge-in — push-to-talk only
- Saving the session anywhere
- Extracting more than one field per turn
