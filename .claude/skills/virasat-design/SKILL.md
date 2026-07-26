---
name: virasat-design
description: The virasat visual language — a ruled register on paper stock, indigo ink, Tiro Kannada serif for the spoken voice and Anek Latin for the record, built on GOV.UK Design System patterns. Load before writing ANY UI, HTML, Tailwind class, or styling in this repo. Overrides ~/.claude/frontend-design.md, which is a dark SaaS palette for a different product and must not be used here.
---

# virasat design language

**This overrides `~/.claude/frontend-design.md`.** That file is the GrowthX
dark-theme SaaS system for gx-client-next. Do not load it, do not use its
tokens, do not use the baseline-font unit system here.

Live implementation: `web/index.html` (tokens + print styles) and `web/app.js`
(the register). When this file and the code disagree, fix the code.

## Who is looking at this

A spouse or adult child, 45–70, often more fluent in Kannada than English,
within weeks of a death, on a laptop, doing paperwork they have never done
before and do not want to be doing.

Every decision below follows from that sentence. When in doubt: *does this make
a tired, grieving 60-year-old's next step more obvious?* If not, cut it.

## The concept: speech becoming record

Two panels, and the contrast between them **is** the design.

- **Left is a conversation.** Serif, warm, spoken. An accumulating transcript of
  what the agent already knows, then the live question, large.
- **Right is a register.** Sans, ruled, numbered, tabular. A schedule of what the
  estate is owed.

Someone talks, and a legal document assembles itself. That is the product in one
image, and it is what the layout should make you feel.

The numbering is not decoration. A succession-certificate petition under s.372
ISA requires an enumerated schedule of assets — the register is the thing the
family will actually have to produce, so numbering it encodes something true.

## Borrowed: GOV.UK Design System

GOV.UK solved this exact problem — guiding stressed, low-confidence people
through high-stakes bureaucracy. Take the **patterns**, not the visuals (no
Transport font, no black-and-yellow).

| Borrowed | Applied here |
|---|---|
| [Task list component](https://design-system.service.gov.uk/components/task-list/) | Each claim is a row: name + hint left, status right |
| [Complete multiple tasks](https://design-system.service.gov.uk/patterns/complete-multiple-tasks/) | Status vocabulary and the progress line above the register |
| [Summary list](https://design-system.service.gov.uk/components/summary-list/) | `<dl>` key/value rows with hairline rules — claim details and the transcript |
| Grouping under short headings | Claims banded by institution once there are several |
| One thing per page | One question at a time in the left panel |
| Sentence case for statuses | No `uppercase tracking-widest` labels anywhere |

### The status principle worth internalising

**GOV.UK gives the finished state no visual weight, so attention falls on the
work that remains.** This is the single most useful thing taken from them, and
it is the opposite of the instinct to make "done" green and loud.

| State | Treatment | Why |
|---|---|---|
| Ready to file | `neem` text + 7px filled square. **No tag.** | Good news, stated quietly |
| Documents to confirm | `ochreTint` filled tag, `ochreInk` text | Needs action — gets the weight |
| Waiting on documents | same tag | A doc confirmed absent, not merely unasked |
| Confirm details | `ink2` plain text | GOV.UK's "cannot start yet" — nothing to do yet |

### Unknown is not missing

A document nobody was asked about is **not** a missing document. The engine can
only mark it `unknown`; rendering that as "Missing" invents bad news and makes
every claim look blocked.

- `have: "no"` → "Still to get: …" in `ochreInk`
- `have: "unknown"` → "Not yet confirmed: …" in `ink2`
- all held → "All 3 in hand" in `neem`

This is the tri-state rule from CLAUDE.md applied to the *presentation* layer,
and it is easy to lose. Losing it costs the demo its best moment: with unknowns
read as missing, the headline becomes "0 ready to file".

### Lead with the finding, not the shortfall

The register header says `5 claims identified · 5 ready to file` — count first,
readiness second, and the readiness clause is omitted entirely when it is zero.
Never make "0 ready to file" the headline; it is discouraging and tells the
family nothing they can act on.

The header also **names** the rarely-claimed entitlements ("Includes EPFO death
insurance (EDLI) and Employer dues — claims most families never file"). That
sentence is the entire point of the product, so it must not be something you
have to scroll to reach.

## Type

Two voices, two Indian-script foundries. Both on Google Fonts, both verified live.

```html
<link href="https://fonts.googleapis.com/css2?family=Anek+Latin:wght@400;500;600&family=Tiro+Kannada:ital@0;1&display=swap" rel="stylesheet">
```

| Role | Face | Why |
|---|---|---|
| The spoken voice — Kannada questions *and* their English gloss | **Tiro Kannada** (Tiro Typeworks) | A scholarly Indic text serif. Book-like and dignified where a sans would be clinical. Covers Kannada and Latin in one design, so the question and its translation share a voice. |
| The record — labels, statuses, register rows, all UI | **Anek Latin** (Ek Type) | Contemporary Indian sans. Neutral, tabular, unfussy. |

The English gloss is set in **serif italic** — it is the same voice speaking, not
a separate UI string.

Never bold past 600. Heavy type reads as shouting here.

### Kannada is not Latin at a different size

1. Kannada renders **~1.05em** against Latin at the same optical size.
2. Kannada needs **`line-height: 1.75`** vs `1.6` for Latin — conjuncts stack and
   vowel signs extend above and below, so tighter leading collides.

Apply by script, not by element.

### Scale — deliberately large

Base **17px**, not 14. The audience is 45–70; this is an accessibility decision,
not a stylistic one, and density is not a reason to shrink it.

| Role | Size | Face |
|---|---|---|
| Question (Kannada) | 29px | Tiro |
| Question (English gloss) | 18px italic | Tiro |
| Register summary stat | 19px 500 | Anek |
| Claim name | 19px 500 | Anek |
| Body, `<dd>` values | 16–17px | Anek |
| Hint, `<dt>` keys, status | 14–15px | Anek |
| Source line, eyebrow labels | 13px | Anek |

`.tnum` (`font-variant-numeric: tabular-nums`) on every gutter number and count.
Running text caps around 52–65 characters.

## Colour

Indigo-dominant ledger on cool-biased paper stock. Neutrals carry a slight blue
bias toward the accent, so they read as chosen rather than inherited.

```js
tailwind.config = { theme: { extend: { colors: {
  paper:      '#F1F0EA',  // ground — paper stock, grey-biased, NOT cream
  sheet:      '#FBFAF7',  // the register sheet
  rule:       '#D5D2C8',  // hairline
  ruleSoft:   '#E4E1D8',  // inner hairline
  ink:        '#1A1B21',  // near-black, blue bias
  ink2:       '#5B5D68',  // cool grey
  indigo:     '#23306B',  // the dominant accent — ledger ink
  neem:       '#3F6B47',  // ready
  ochre:      '#8F6410',  // waiting (borders/icons)
  ochreTint:  '#EBDFC4',  // status tag fill
  ochreInk:   '#5E4508',  // status tag text
  brick:      '#8F2F26',  // hard gate
  terra:      '#A64A26',  // rarely-claimed — the one flourish
} } } }
```

Semantic colour (`neem` / `ochre` / `brick`) is deliberately separate from the
accent (`indigo`) and does not count as it.

### Measured contrast — do not re-estimate these

| Token | on `paper` | on `sheet` |
|---|---|---|
| `ink` | 15.04 AAA | 16.46 AAA |
| `indigo` | 10.78 AAA | 11.79 AAA |
| `brick` | 7.07 AAA | 7.73 AAA |
| `ink2` | 5.73 AA | 6.27 AA |
| `neem` | 5.40 AA | 5.91 AA |
| `terra` | 5.07 AA | 5.54 AA |
| `ochre` | 4.60 AA | 5.03 AA |

`ochreInk` on `ochreTint` is 6.82:1. `sheet` on `indigo` (the button) is 11.79:1.

`rule` and `ruleSoft` are ~1.3:1 — **borders only**, never text, never icons.

`terra` was darkened from `#B4552D` specifically so it clears AA on *both*
grounds; the original only passed on `sheet`, which is a trap waiting for the
first time someone puts the flag on a `paper` band.

## Layout

```
┌───────────────────────────┬──────────────────────────────────────────┐
│  The conversation         │  Schedule of claims                      │
│  ───────────────────────  │  5 claims identified · 5 ready to file    │
│  Death certificate   Yes  │              Includes EDLI and Employer   │
│  Bank account   SBI · …   │              dues — rarely claimed        │
│  Work        Salaried…    │ ════════════════════════════════════════ │
│                           │  Banks and deposits                      │
│  Last step                │ ──────────────────────────────────────── │
│  ನಿಮ್ಮ ಬಳಿ ಇರುವ           │  01  State Bank of India    ▪ Ready to file│
│  ದಾಖಲೆಗಳನ್ನು…             │      sole account with registered nominee │
│  Tick the documents…      │      File at    Branch holding the account│
│                           │      Form       Bank claim form           │
│  ☑ Death certificate      │      Documents  All 3 in hand             │
│  ☐ Bank claim form        │      S1 — RBI … 2025   Unverified         │
│                    [Begin]│                                          │
└───────────────────────────┴──────────────────────────────────────────┘
```

- Grid `[0.82fr_1.18fr]`, gap 36px. The register gets the larger share — it is
  the deliverable.
- **Hairlines only. No cards, no rounded corners, no shadows, no accent rails.**
  A register is ruled paper. This is also what keeps the page off the current
  AI-design default of accent-barred rounded cards on cream.
- Group headings are `bg-paper` bands across the sheet — the ruled break in a
  ledger.
- Numbers live in a 42px gutter, tabular, `ink2`.
- The transcript is what fills the left column. Before it existed the panel had
  ~400px of dead space and read as broken; it also happens to be the visible
  evidence of the "Memory and Context" rubric point.
- **Where to file comes before what's missing.** Always — it is the family's
  first question.
- The register never reorders once a claim lands. A list that reshuffles while
  someone reads it is unusable and looks broken on stage.

## Single theme, on purpose

No dark mode. This is a paper document; inverting it would break the concept.
A deliberate commitment, not an omission.

## Tone in the interface

- **No celebration.** No confetti, no emoji, no "🎉". State counts plainly.
- **"your husband" / "your father"** once the relationship is known. Never "the
  deceased" in user-facing text.
- **No jargon in questions** — "was he working at the time?", not "was he an EPF
  subscriber". Jargon belongs in the register, where it names the form to ask for.
- **Sentence case.** No uppercase tracking-wide eyebrows.
- Every claim shows its source ref and an **Unverified** flag when the rule still
  carries a `[VERIFY]`. Being auditable is part of the visual identity — this
  product's credibility is its entire value.
- `Cmd+P` is the export feature. The print stylesheet drops the interview panel
  and prints the register.

## What building.md still forbids

`rules/building.md` bans loading states, animations, mobile responsiveness, and
custom CSS. **That still holds.** The exceptions in `<style>` are the token
config, `.tnum`, a visible `:focus-visible`, `prefers-reduced-motion`, and the
print block — all structural, none decorative.

Desktop only. No responsive work.
