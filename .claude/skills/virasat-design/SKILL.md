---
name: virasat-design
description: The virasat visual language — a ruled register on paper stock, indigo ink, Tiro Kannada serif for the spoken voice and Anek Latin for the record, built on GOV.UK Design System patterns. Load before writing ANY UI, HTML, Tailwind class, or styling in this repo. Overrides ~/.claude/frontend-design.md, which is a dark SaaS palette for a different product and must not be used here.
---

# virasat design language

**This overrides `~/.claude/frontend-design.md`.** That file is the GrowthX
dark-theme SaaS system for gx-client-next. Do not load it, do not use its
tokens, do not use the baseline-font unit system here.

Live implementation: `web/tokens.js` (the shared token config — **edit colours and
faces here, not in a page**), `web/landing.html`, `web/index.html`, and
`web/app.js`. When this file and the code disagree, fix the code.

Routes: `/` is the landing page, `/app` is the interview.

## Language order: English primary, Kannada secondary

**English leads everywhere in the interface.** Kannada sits underneath it, smaller,
in `ink2`.

This is a demo-surface decision, not a product-values one: the people who judge,
read, and share this are reading English. The Kannada is still authored and still
spoken aloud — it is the voice layer, and it is what the actual user hears. It is
just not the thing that has to be decoded first by someone scanning the screen.

Concretely: English question at the large size in Tiro, Kannada beneath it at
roughly two-thirds the size. Wordmark is `Virasat` with `ವಿರಾಸತ್` secondary.

Never set Kannada in italic. Tiro Kannada ships an italic, but slanted Kannada is
not an idiomatic emphasis form — use size and colour instead.

## Copy rules — these apply to every page, and hardest to the landing page

The single most common failure in this repo has been **writing paragraphs where a
line would do.** Long copy is not thoroughness; on a landing page it is the thing
that makes a good layout look bad.

| Rule | Test |
|---|---|
| **One idea per section** | Can you state the section in its heading alone? If not, split it. |
| **Two sentences maximum per block** | Three sentences means one is unnecessary. Cut it. |
| **Never more than two rendered lines** | At reading width. A four-line paragraph is a wall. |
| **Headings alone must carry the argument** | A reader who reads only headings should get the whole pitch. |
| **Concrete nouns and numbers, not adjectives** | "Three separate forms" beats "a complex process". |
| **One primary action** | Repeat the same CTA. Never offer a competing one. |
| **Every sentence adds a new fact** | If it only rephrases the previous sentence, delete it. |
| **Show, don't describe** | A real register excerpt beats any sentence about the register. |

Write the sentence, then cut it in half. The halved version is almost always the
one to ship.

Body copy on the landing page runs at **17–19px**, not the 16px of the app's dense
register — fewer words means they can be larger.

## The landing page

Inverse of the app. The app is speech becoming record; the landing page makes you
feel the **absence** of the record, then shows the register as the answer.

### The greeting is not the pitch (26 Jul)

The page used to open with *"Several institutions owe your family money. None will
mention the others."* That is the strongest argument the product has and the wrong
first sentence to show a spouse three weeks after a death — it opens on money.

It now opens with **"You shouldn't have to work out who to call."** — acknowledge
the burden, then offer to carry it. The institutions line was **not cut**; it leads
the section that is *about* the problem, where an argument belongs.

**The rule this encodes:** the first sentence acknowledges, the second offers, and
the argument waits for section two. Warmth on this page comes from language, space
and pace — never from softening the palette.

### The voice is the primary action

One control, and it is the microphone. Square, `bg-indigo`, generous padding, an
inline mic glyph, label **"Talk to us"**, Kannada line beneath, and one quiet line
offering to type instead — because a grieving person may not want to speak aloud.

**It is a doorway, not a second microphone.** It navigates to `/app`, which already
begins listening on load (`connect()` fires `{type:"start"}` on socket open). The
audio pipeline — `getUserMedia` → `pcm-worklet` → `/ws` — stays in exactly one
place. **Never build a second mic on the landing page**; two audio paths will drift
and one of them will be broken on stage.

The control is square because this system has no rounded surfaces. The glyph does
the affording, not a pill shape.

- **The loose slips** are the signature device: **four** institution demands as
  `bg-sheet` fragments on the `paper` ground, each rotated 0.6–1.6° via a static
  `.slip-*` class, in a **two-column** grid. These are the actual pieces of paper a
  family is handed, lying where they fall. Static transforms, not animation —
  `building.md` still bans animation. This is the one place the page leaves the
  grid; everywhere else is strict hairline alignment.
- **Four, not six, and two columns not three (26 Jul).** Six slips in a 3-wide grid
  read as a pile of demands dumped on the reader before the page had offered any
  help. The four kept each carry a distinct point: volume (bank annexures, EPFO
  forms), a dependency (the legal heir certificate several others need first), and
  the risk (succession certificate, months). Six `.slip-*` rotation classes remain
  defined; four are in use. **Adding a fifth means dropping one** — the section's
  job is to be understood, not to be exhaustive.
- **Every slip is sourced.** The demands come from the rules table (Annex I-B/C/D/E
  from S1, Forms 20/10D/5IF from S4), not from invention. Do not add a slip for a
  requirement that has no row.
- **EDLI gets its own band**, and it is where `terra` is spent. It is the single
  most persuasive fact the product has.
- **The register excerpt is styled identically to the real app**, and elides rows
  02–03 with an explicit `⋯` row. Without the elision the 01 → 04 jump reads as a
  rendering bug.
- **The honesty tags are persuasion, not hedging.** "Cover amount pending
  verification" next to the EDLI figure, and `Unverified` inside the excerpt,
  make the page more credible rather than less.
- **Never make a claim a later iteration will falsify.** An early draft said
  "nothing you say is stored beyond the session" — true in Iteration 0, false once
  Convex sessions land in Iteration 1. It now reads "No account, no sign-in."
  A false privacy claim about data concerning a death is worse than no claim.

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
  paper:      '#F4F1E9',  // ground — paper stock. Warmed from #F1F0EA (26 Jul)
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

**Still grey-biased, still not cream.** The 26 Jul warming moved `paper` two steps
toward warm to stop the ground reading clinical to a grieving reader. It is a
nudge, not a repalette — the instruction to stay off pastel, cream, and soft
rounded surfaces is unchanged and is the thing that keeps this page from looking
like every other AI-built wellness site.

### Measured contrast — do not re-estimate these

Recomputed 26 Jul against the warmed `paper`. Warming a ground **raises** contrast
against dark ink, so every pair improved; nothing needed reverting.

| Token | on `paper` | on `sheet` |
|---|---|---|
| `ink` | 15.22 AAA | 16.46 AAA |
| `indigo` | 10.90 AAA | 11.79 AAA |
| `brick` | 7.15 AAA | 7.73 AAA |
| `ink2` | 5.80 AA | 6.27 AA |
| `neem` | 5.46 AA | 5.91 AA |
| `terra` | 5.13 AA | 5.54 AA |
| `ochre` | 4.65 AA | 5.03 AA |

If `paper` is ever changed again, **recompute all seven** — `ochre` is the binding
constraint at 4.65 and has the least headroom above AA.

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
custom CSS. **That still holds.** The exceptions in `<style>` are `.tnum`,
`.balance` (`text-wrap: balance`, on every display heading so a two-line headline
does not orphan its last word), the `.slip-*` static rotations, a visible
`:focus-visible`, `prefers-reduced-motion`, and the print block — all structural,
none decorative. Tokens live in `web/tokens.js`, not in a page.

Desktop only. No responsive work.
