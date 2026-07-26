---
name: virasat-design
description: The virasat visual language — warm paper ground, indigo ink, Anek type, Kannada as a first-class script. Load before writing ANY UI, HTML, Tailwind class, or styling in this repo. Overrides ~/.claude/frontend-design.md, which is a dark SaaS palette for a different product and must not be used here.
---

# virasat design language

**This overrides `~/.claude/frontend-design.md`.** That file is the GrowthX
dark-theme SaaS system for gx-client-next. Do not load it, do not use its
tokens, do not use the baseline-font unit system here. virasat is light, warm,
and document-shaped.

## Who is looking at this

A spouse or adult child, 45–70, often more fluent in Kannada than English,
within weeks of a death, on a laptop, doing paperwork they have never done
before and do not want to be doing.

Every decision below follows from that sentence. When in doubt, ask: *does this
make a tired, grieving 60-year-old's next step more obvious?* If not, cut it.

## The idea: redeemed paperwork

virasat's output is a document. The visual language leans into that instead of
hiding it — this is the passbook, the ration card, the stamp paper, made
legible and humane.

That framing is also what makes it Indian without costume. **Indian officialdom
is a real, specific visual culture** — warm paper stock, ink-blue rubber stamps,
ruled columns, ochre file covers. Borrow the materials, drop the ugliness.

### Never do these

The costume trap. Every one of these reads as an outsider's idea of India:

- Marigold garlands, mandalas, paisley, rangoli borders, temple arches
- Tricolour (saffron / white / green) — politically loaded, and wrong for grief
- Gold gradients, "ethnic" pattern dividers, henna-style flourishes
- Diya/lamp icons in a product about a death

Also banned, from the other direction — the generic AI-startup look:

- Dark mode, purple or blue gradients, glassmorphism, glow effects
- Inter, or any grotesk that looks like a dev tool
- Emoji as UI (🎉 especially — see Tone)

## Type

**Anek** — a Google Fonts superfamily by **Ek Type**, an Indian foundry, with
Latin and Kannada drawn together as one design. This is the single strongest
Indian move available and it is functional, not decorative: the Kannada is not
a fallback bolted onto a Latin face.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anek+Kannada:wght@400;500;600&family=Anek+Latin:wght@400;500;600&display=swap" rel="stylesheet">
```

```css
--font-latin: 'Anek Latin', system-ui, sans-serif;
--font-kannada: 'Anek Kannada', 'Anek Latin', system-ui, sans-serif;
```

Weights: 400 body, 500 emphasis, 600 headings. **Never bold beyond 600** — heavy
type reads as shouting in this context.

### Kannada is not Latin at a different size

Two rules, both non-obvious, both load-bearing:

1. **Kannada renders at ~1.05em** relative to Latin at the same optical size.
   Its glyphs are visually smaller at equal point size.
2. **Kannada needs `line-height: 1.75`** vs `1.6` for Latin. Conjuncts stack
   vertically and vowel signs extend above and below; tighter leading collides.

Apply by script, not by element — a claim card mixes both.

```html
<p class="font-kannada text-[1.05em] leading-[1.75]">ಅವರಿಗೆ ಬ್ಯಾಂಕ್ ಖಾತೆ ಇತ್ತೇ?</p>
```

### Scale — deliberately large

The audience is 45–70. Base is **17px**, not 14px or 16px. This is an
accessibility decision driven by who is reading, and it is not negotiable for
density reasons.

| Role | Size | Weight | Notes |
|---|---|---|---|
| Question (the spoken line) | 28px | 500 | The largest thing on screen |
| Claim title | 19px | 600 | |
| Body / document lines | 17px | 400 | |
| Meta (timeline, citation) | 15px | 400 | Secondary ink |
| Legal citation / `[VERIFY]` | 14px | 500 | Never smaller — it must stay readable |

Line length caps at **68 characters**. Long measure is hostile to a distracted
reader.

## Colour

Warm paper ground, ink-blue text, earthen accents. Indigo and terracotta are
genuinely Indian — indigo dye and block printing, terracotta and laterite — and
both are somber enough for the context.

```js
// Tailwind CDN config — paste inline in <script>, this is the whole system
tailwind.config = {
  theme: {
    extend: {
      colors: {
        paper:    '#FAF6EF',  // warm ground — never #FFF, it's clinical
        surface:  '#FFFFFF',  // cards lifted off the paper
        rule:     '#E3DACC',  // borders, column rules
        ink:      '#1F1B16',  // primary text — warm near-black, never #000
        ink2:     '#5C5349',  // secondary text
        indigo:   '#2A3663',  // primary accent, headings, links
        terra:    '#B4552D',  // "commonly missed" — the EDLI flag
        ochre:    '#B07D1A',  // blocked / waiting on a document
        neem:     '#4C6B41',  // filable now
        brick:    '#9B3226',  // hard gate (no death certificate)
      },
      fontFamily: {
        latin:   ['Anek Latin', 'system-ui', 'sans-serif'],
        kannada: ['Anek Kannada', 'Anek Latin', 'system-ui', 'sans-serif'],
      },
    },
  },
}
```

### Status colour is meaning, not decoration

| Status | Colour | Why this one |
|---|---|---|
| Filable now | `neem` | Muted olive. A bright green would read as celebratory. |
| Blocked on a document | `ochre` | Turmeric. **Amber, never red** — a missing document is the next step, not an error. |
| Existence unknown | `ink2` | Neutral. "Go check" is not a warning. |
| Hard gate | `brick` | Muted, not fire-engine red. Used at most once on screen. |
| Commonly missed | `terra` | The EDLI flag. This is the delight moment — let it be the warmest thing on the page. |

### Contrast — measured, not estimated

Against `paper` (`#FAF6EF`):

| Token | Ratio | Verdict |
|---|---|---|
| `ink` | 15.89:1 | AAA |
| `indigo` | 10.79:1 | AAA |
| `ink2` | 6.99:1 | AA |
| `brick` | 6.77:1 | AA |
| `neem` | 5.59:1 | AA |
| `terra` | 4.56:1 | AA — **tight**, see below |
| `ochre` | 3.36:1 | large text / non-text only |

Two rules fall out of this:

- **`ochre` is never body text.** Use it for the status rule, badge fills, and
  icons. An ochre badge takes `ink` text (4.72:1), never white (3.62:1).
- **`terra` only at 19px/500 or larger.** It clears AA with little headroom, and
  it is used for the "commonly missed" flag — which is a claim title, so this is
  satisfied by default. Don't demote it to meta type.

`rule` (`#E3DACC`) is 1.29:1 — a border colour only. Never text, never an icon.

`white on indigo` is 11.63:1, so indigo is safe as a filled button or header band.

## Layout

Two columns on a laptop. Conversation left, the deliverable right.

```
┌──────────────────────────────┬────────────────────────────────────┐
│                              │                                    │
│    the question, large       │   CLAIMS                           │
│    in their language         │                                    │
│                              │   ▌ BANK — nominee registered      │
│         ◉ hold to speak      │     file at the branch · 15 days   │
│                              │     needs: claim form              │
│    ── or type your answer ── │                                    │
│    ┌──────────────────────┐  │   ▌ EPFO — death insurance (EDLI)  │
│    │                      │  │     Form 5IF                       │
│    └──────────────────────┘  │     most families never file this  │
│                              │                                    │
└──────────────────────────────┴────────────────────────────────────┘
     paper ground                    surface cards on paper
```

- **Left is calm, right accumulates.** The right column never empties and never
  reorders once a claim lands. A list that reshuffles while someone reads it is
  unusable and looks broken on stage.
- **Status is a 3px left rule on the card**, not a pill or a badge floating in
  the corner. Ruled margins are the paper vocabulary.
- **Where to file comes before what's missing.** Always. It is the family's
  first question.
- Generous padding: `24px` inside cards, `20px` between them. Crowding raises
  stress, and stress is the thing being designed against.
- Rounded corners `6px` maximum. Paper has edges.
- **One shadow, barely there:** `0 1px 2px rgba(31,27,22,0.06)`. No glows, no
  layered shadows, no blur.

## Tone in the interface

- **No celebration.** No confetti, no emoji, no "🎉 4 claims found!". Say
  "4 claims · 1 you can file today" and let it land on its own.
- **"your husband" / "your father"** once the relationship is known. Never
  "the deceased" in user-facing text.
- **No jargon in questions** — "did he work a salaried job?", not "was he an EPF
  subscriber". Jargon belongs in the output, where it names the form to ask for.
- **`[VERIFY]` renders visibly**, small caps, `ink2`, with its citation. An
  unverified rule that looks authoritative is the design failure that can
  actually hurt someone.
- Every claim shows its source ref (`S1`, `S4`) in meta type. Being auditable is
  part of the visual identity — this product's credibility is its whole value.

## What building.md still forbids

`rules/building.md` bans loading states, animations, mobile responsiveness, and
custom CSS. **That still holds.** The token block above is the one exception,
and it exists because deciding colour once is cheaper than re-deciding it at
4 PM.

Everything here is Tailwind utilities against those tokens. If you find yourself
writing a `<style>` block beyond the font imports and the config, stop.

Desktop only. No responsive work. No dark mode.
