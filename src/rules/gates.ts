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

  return [];
}
