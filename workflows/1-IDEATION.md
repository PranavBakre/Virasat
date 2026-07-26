# Iteration 0 Worksheet — virasat

> Status: **filled, pending mentor approval**
> Phase rules: [`rules/ideation.md`](../rules/ideation.md) → [`rules/building.md`](../rules/building.md)
> Event: Sarvam Epoch Buildathon, Sunday 26 July, Razorpay Arena. Demos 6:30 PM IST.

---

## 1. The problem

**Who specifically has this problem?**
The one family member who ends up "handling the paperwork" after a death in an
Indian household — usually a spouse or an adult child, often 45–70, often more
fluent in Kannada than in English, and almost never someone who has done this
before. In Karnataka this is the person walking into a bank branch with a
death certificate and no idea what else to bring.

**What do they do today?**
They go institution by institution, in person, and find out the requirements by
being turned away. Bank says one thing. LIC says another. EPFO office says come
back with Form 20 *and* Form 10D *and* Form 5IF, which nobody mentioned. Each
counter reveals only its own list, and only when you're standing at it.

**What's the painful part?**
Nobody ever tells them the *full* picture. There is no single moment where
someone says "here are all seven things your family is owed, here is where each
one is filed, here is the document you are missing." So claims are discovered
late, filed wrong, or abandoned entirely — money sits unclaimed in accounts and
EPFO ledgers for years. The grief tax is that the person least able to do
bureaucracy is the person who has to do all of it.

**What would make them say "finally, someone built this"?**
Talking, in their own language, for five minutes — and getting back a complete,
printable list of every identified claim within virasat's Karnataka
movable-assets scope, with the exact forms and the exact documents still
missing.

---

## 2. Iteration 0 — the magic moment

> **One sentence:** Open one web page, advance through a scripted family
> interview, and watch every identified in-scope claim and missing document
> appear in a live checklist.

- One desktop HTML page. `bun run web`.
- No voice yet — the interview progression is scripted in the browser.
- Claim derivation is the real pure rules engine, not hardcoded output.
- Proves the core idea: **the rules table is the product.** If the derivation is
  right and visibly useful, the product works before voice is introduced.

---

## 3. Complexity check

| Signal | This project |
|---|---|
| User types | **One.** The person handling the estate. No admin, no institution login. |
| Screens | **One.** Scripted interview + live checklist. |
| Data model | No database in Iteration 0; one `sessions` table in Iteration 1. |
| Real-time | **No.** Local browser state in Iteration 0; Convex arrives with voice/chat. |
| External APIs | **One vendor** — Sarvam (STT, chat, TTS). Single header auth. |
| Input → output | Answers in → claims list out. Deterministic. |

Verdict: **DOABLE.** The risk is not the build, it is scope creep into things
that look like features (accounts, saving, PDF export, more states).

---

## 4. Scope cuts — decided before building

| Cut | Instead |
|---|---|
| User accounts / login | Session id in the URL. Convex stores the session; no auth. |
| All of India | **Karnataka only.** Hindu Succession Act intestate path. |
| Will / probate track | Detect it, then stop: "you need the probate route, see a lawyer." |
| Immovable property (land, flats) | Out. Movable assets only — that's what a succession certificate covers anyway. |
| Real share calculation for non-Hindu families | Show the document checklist, replace shares with "consult a lawyer." |
| Document upload / OCR | Out of v1. Ask "do you have X?" and believe the answer. |
| PDF export | Print the page. `Cmd+P` is a feature. |
| Streaming voice / barge-in | Push-to-talk. One clip in, one clip out. |
| Fine-tuned share arithmetic | Rules table returns claims and documents. Shares are a display note. |

**Fake-it shortcuts in play:** rules table is a hardcoded TS array; no auth
(session id in the URL); typed-input fallback always available if the mic fails
on stage.

**Stack:** Bun + TypeScript · Convex (backend + DB) · Sarvam (STT/chat/TTS) ·
Tailwind CDN, no build step.

---

## 5. Iteration plan

| # | Feature | Ships | Time |
|---|---|---|---|
| **0** | Web claims mockup — scripted answers + real live checklist | `web/`, `src/rules/` | ~1 hr |
| **1** | Voice interview with secondary text chat | Sarvam, Convex, `src/interview/` | ~1 hr |

**Hard rule:** Iteration 0 must be a complete visual demo backed by the real
rules engine before any Sarvam call is written.

---

## 6. Demo script (3 min)

| Time | Beat |
|---|---|
| 0:00–0:30 | **The problem.** Someone dies. The family owes nobody anything, but seven institutions owe *them* — and no one hands over that list. Claims get abandoned. |
| 0:30–1:00 | **Today's workflow.** Show the actual document lists: bank, LIC, EPFO Form 20/10D/5IF, pension office. Four different counters, four different answers, discovered one rejection at a time. |
| 1:00–3:00 | **Live demo.** Speak to it in Kannada. The conditional checklist fills in as answers land. Tick the documents on hand, then end on every in-scope claim, every form, and the two documents still missing. |

**The moment to land:** the instant a claim the person *didn't know existed*
appears on screen — EDLI insurance is the reliable one; almost nobody knows EPFO
owes them a death-insurance payout on top of the PF balance.

---

## 7. Judging alignment

Sarvam capability selected: **Voice Experience** (2.5× multiplier).

| Rubric parameter | How this scores |
|---|---|
| Job-to-be-done (2.5×) | The job is "tell me everything I can claim." It is completed end-to-end in one session — not a chatbot that gestures at an answer. |
| Memory & context (1×) | The interview accumulates state; later questions are chosen from earlier answers. It never asks about EPFO if the deceased was never salaried. |
| Creativity (1.5×) | A voice agent whose output is a *deterministic legal derivation*, not generated prose. The LLM never invents an entitlement. |
| Impact (1.5×) | Unclaimed deposits and unfiled EPFO claims are a real, large, documented problem in India. |
| Delight (1×) | Grief-appropriate tone. Short sentences. No jargon. Kannada throughout. |

---

## 8. Open questions for the mentor

1. Is Karnataka-only + Hindu-intestate-only a defensible demo scope, or does the
   narrowness read as incomplete? (Position: narrow and correct beats broad and
   wrong, especially for legal content.)
2. How hard should the disclaimer be? This is guidance, not legal advice, and
   every rule carries a `[VERIFY]` marker — see [`docs/rules-table.md`](../docs/rules-table.md).
3. Kannada-first or code-mixed? Saaras v3 has a `codemix` mode, which is closer
   to how people actually speak about banks and forms.

---

## Approval

- [ ] Mentor approved scope
- [ ] Iteration 0 committed and working
