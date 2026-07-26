// Shared design tokens for every page. Loaded after the Tailwind CDN so the
// config is picked up before first paint. Single source so the landing page and
// the app cannot drift apart — see .claude/skills/virasat-design/SKILL.md.
tailwind.config = {
  theme: {
    extend: {
      colors: {
        // Warmed from #F1F0EA on 26 Jul 2026. A grieving reader meets this ground
        // first, and the cooler grey read as clinical. Contrast improved rather
        // than regressed — a lighter ground lifts every dark ink on it. Worst
        // pair (ochre) went 4.60 → 4.65. All seven still AA or better.
        paper: "#F4F1E9",
        sheet: "#FBFAF7",
        rule: "#D5D2C8",
        ruleSoft: "#E4E1D8",
        ink: "#1A1B21",
        ink2: "#5B5D68",
        indigo: "#23306B",
        neem: "#3F6B47",
        ochre: "#8F6410",
        ochreTint: "#EBDFC4",
        ochreInk: "#5E4508",
        brick: "#8F2F26",
        terra: "#A64A26",
      },
      fontFamily: {
        sans: ["Anek Latin", "system-ui", "sans-serif"],
        voice: ["Tiro Kannada", "Georgia", "serif"],
      },
    },
  },
};
