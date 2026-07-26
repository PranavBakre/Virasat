import type { EstateProfile, Gate } from "./types.ts";

export function evaluateGates(profile: EstateProfile): Gate[] {
  if (profile.deathCertificate === "no") {
    return [
      {
        id: "death-certificate-missing",
        title: "Get the death certificate first",
        body: "Get it from the registrar of births and deaths, through the hospital or municipal office. Nothing can be filed without it.",
        blocking: true,
      },
    ];
  }

  if (profile.deathCertificate === "applied") {
    return [
      {
        id: "death-certificate-pending",
        title: "Death certificate application submitted",
        body: "Keep the acknowledgement and wait for the certificate. Nothing can be filed until it arrives.",
        blocking: true,
      },
    ];
  }

  // A will moves the estate off the intestate path this tool covers, so the
  // interview stops here (the scope cut in workflows/1-IDEATION.md). But
  // stopping silently is what made this dangerous: the register showed
  // "Nothing identified yet", which a family reads as "you are owed nothing"
  // — the exact opposite of true. Say what the route actually is.
  //
  // Content from docs/rules-table.md section 6. Nothing here is invented.
  if (profile.will === "yes") {
    return [
      {
        id: "will-probate-track",
        title: "A will changes who files, not what you are owed",
        body: "This checklist covers estates left without a will, so it stops here — but the money is still claimable. The executor named in the will applies; if it names none, the district court issues letters of administration. Probate is no longer mandatory anywhere in India (Indian Succession Act s. 213 was deleted in December 2025), though banks and insurers can still ask for probate or letters of administration above their own limits. The documents are largely the same ones; the authority you file under is not. Take the will to a lawyer before you file.",
        blocking: true,
      },
    ];
  }

  // Not blocking — the intestate checklist is still the right one to work from.
  // But a will surfacing later changes the route, so it cannot pass unmentioned.
  if (profile.will === "unsure") {
    return [
      {
        id: "will-unsure",
        title: "Settle whether there was a will",
        body: "The checklist below assumes there was none. If one turns up, the executor named in it applies instead and the filing route changes — so confirm this before you start filing.",
        blocking: false,
      },
    ];
  }

  return [];
}
