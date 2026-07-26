// Tokens for the "quiet" landing page at /v2 — a DIFFERENT design language from
// the ruled-register system in tokens.js. Kept separate on purpose: the register
// at /app depends on tokens.js, and merging the two palettes would break it.
//
// See .claude/skills/virasat-design/SKILL.md for the register system. This file
// is the alternative brief: a public service that reads like a printed book.
//
// Measured contrast on `bg` #F7F4EE:
//   primary   #1D2951  12.85  AAA
//   secondary #6B6865   5.04  AA
//   accent    #DCCFC1   1.39  FAIL — DECORATIVE ONLY, never text
// On `primary` #1D2951:
//   ivory     #FBF9F4  13.41  AAA
//   accent    #DCCFC1   9.23  AAA  (this is the body colour on dark bands)
//   secondary #6B6865   2.55  FAIL — never on navy
tailwind.config = {
  theme: {
    extend: {
      colors: {
        bg: "#F7F4EE",
        primary: "#1D2951",
        secondary: "#6B6865",
        accent: "#DCCFC1",
        ivory: "#FBF9F4",
        line: "#E8E2D8", // hairline — borders only, 1.2:1
      },
      fontFamily: {
        // Canela is a paid Commercial Type licence and is not on Google Fonts.
        // Cormorant Garamond is the brief's named alternative.
        display: ["Cormorant Garamond", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        kannada: ["Tiro Kannada", "serif"],
      },
    },
  },
};
