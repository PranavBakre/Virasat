import type { BankAccount, EstateProfile, Rule, RuleContext } from "./types.ts";

function bankContexts(
  profile: EstateProfile,
  applies: (account: BankAccount) => boolean,
): RuleContext[] {
  if (profile.banks?.exists !== "yes") return [];

  return (profile.banks.accounts ?? [])
    .filter(applies)
    .map((account) => ({
      assetRef: account.id,
      label: account.bankName,
    }));
}

export const RULES: Rule[] = [
  {
    id: "bank-nominee",
    title: ({ label }) =>
      label
        ? `${label} — sole account with registered nominee`
        : "Bank — sole account with registered nominee",
    authority: "Branch holding the account",
    forms: ["Bank claim form"],
    docsRequired: [
      { id: "death-certificate", label: "Death certificate" },
      { id: "bank-claim-form", label: "Bank claim form" },
      { id: "nominee-id", label: "Nominee ID" },
    ],
    timelineNote: "RBI 2025 mandates settlement within 15 days of submission.",
    legalBasis: "S1 — RBI Settlement of Claims Directions, 2025",
    verify: true,
    contexts: (profile) =>
      bankContexts(
        profile,
        (account) =>
          account.holding === "sole" && account.nominee === "yes",
      ),
  },
  {
    id: "bank-no-nominee-simplified",
    title: ({ label }) =>
      label
        ? `${label} — sole account without nominee`
        : "Bank — sole account without nominee",
    authority: "Branch holding the account",
    forms: ["Annex I-B", "Annex I-C", "Annex I-D", "Annex I-E"],
    docsRequired: [
      { id: "death-certificate", label: "Death certificate" },
      { id: "claimant-id", label: "Claimant ID" },
      { id: "annex-i-b", label: "Claim form signed by all claimants (Annex I-B)" },
      { id: "annex-i-c", label: "Bond of indemnity (Annex I-C)" },
      {
        id: "annex-i-d",
        label: "Disclaimer or NOC from non-claimant heirs (Annex I-D)",
      },
      {
        id: "heir-proof",
        label: "Legal heir certificate or independent-person affidavit (Annex I-E)",
      },
    ],
    timelineNote: "RBI 2025 mandates settlement within 15 days after all documents are submitted.",
    legalBasis: "S1 — RBI Settlement of Claims Directions, 2025",
    verify: true,
    contexts: (profile) =>
      bankContexts(
        profile,
        (account) =>
          account.holding === "sole" &&
          account.nominee === "no" &&
          account.bankType === "commercial" &&
          (account.amountBracket === "under-5L" ||
            account.amountBracket === "5L-15L"),
      ),
  },
  {
    id: "epfo-pf",
    title: "EPFO provident fund balance",
    authority: "EPFO regional office or member portal",
    forms: ["Form 20"],
    docsRequired: [
      { id: "death-certificate", label: "Death certificate" },
      { id: "claimant-id", label: "Claimant ID" },
      { id: "cancelled-cheque", label: "Bank details or cancelled cheque" },
      { id: "uan-pf-number", label: "Member UAN or PF number" },
    ],
    legalBasis: "S4 — EPFO death claim forms",
    verify: true,
    contexts: (profile) =>
      profile.employment === "employed-at-death" &&
      profile.epfo?.exists === "yes"
        ? [{}]
        : [],
  },
];
