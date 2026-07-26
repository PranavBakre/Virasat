// V3 is a quiet editorial public-service surface. It is intentionally isolated
// from the register tokens used by /app and the alternative /v2 concept.
tailwind.config = {
  theme: {
    extend: {
      colors: {
        paper: "#F7F4EE",
        navy: "#1D2951",
        muted: "#6B6865",
        accent: "#DCCFC1",
        ivory: "#FFFDF8",
        line: "#DDD7CE",
        mist: "#E9EDF5",
        mistDeep: "#DCE3EF",
      },
      fontFamily: {
        display: ["Instrument Serif", "Georgia", "serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      maxWidth: {
        page: "1320px",
      },
    },
  },
};
