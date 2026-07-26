import type { BankAccount, DocSpec, EstateProfile, Rule, RuleContext } from "./types.ts";

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

// The simplified no-nominee route has a different ceiling per bank type:
// ₹15 lakh at a commercial bank, ₹5 lakh at a cooperative bank (RBI-2025).
// An unknown bank type takes the STRICTER ceiling — the rules table is explicit
// that an unknown is never guessed downward, because guessing high sends the
// family to a branch that turns them away.
function withinSimplifiedCeiling(account: BankAccount): boolean {
  if (account.amountBracket === undefined || account.amountBracket === "unknown") {
    return false;
  }

  const cooperativeOrUnknownType = account.bankType !== "commercial";

  return cooperativeOrUnknownType
    ? account.amountBracket === "under-5L"
    : account.amountBracket === "under-5L" || account.amountBracket === "5L-15L";
}

const nomineeTransmissionDocs: DocSpec[] = [
  { id: "death-certificate", label: "Death certificate" },
  { id: "transmission-form", label: "DP or AMC transmission form" },
  { id: "nominee-id", label: "Nominee KYC" },
];
const simplifiedTransmissionDocs: DocSpec[] = [
  { id: "death-certificate", label: "Death certificate" },
  { id: "transmission-form", label: "DP or AMC transmission form" },
  { id: "legal-heir-proof", label: "Legal-heir proof" },
  { id: "indemnity", label: "Indemnity" },
  { id: "heir-nocs", label: "NOCs from the other legal heirs" },
];
const certificateTransmissionDocs: DocSpec[] = [
  { id: "death-certificate", label: "Death certificate" },
  { id: "transmission-form", label: "DP or AMC transmission form" },
  { id: "succession-certificate", label: "Succession certificate" },
  { id: "claimant-id", label: "Claimant KYC" },
];

export const RULES: Rule[] = [
  {
    // Rules table §1 row 1. Was missing, so a joint account with a survivorship
    // clause produced no claim at all — the easiest route of the lot rendered as
    // nothing.
    id: "bank-joint-survivorship",
    title: ({ label }) =>
      label
        ? `${label} — joint account, continues in the survivor's name`
        : "Bank — joint account, continues in the survivor's name",
    authority: "Branch holding the account",
    forms: [],
    docsRequired: [
      { id: "death-certificate", label: "Death certificate" },
      { id: "survivor-id", label: "Surviving holder's ID" },
      { id: "account-proof", label: "Account details — passbook or statement" },
    ],
    timelineNote:
      "Days, not months. No succession certificate and no probate — the survivorship clause carries it.",
    legalBasis: "S1 — RBI Settlement of Claims Directions, 2025",
    verify: true,
    contexts: (profile) =>
      bankContexts(
        profile,
        (account) =>
          account.holding === "joint" && account.survivorship === "yes",
      ),
  },
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
          withinSimplifiedCeiling(account),
      ),
  },
  {
    // Rules table §1 row 4. Was missing, so an account ABOVE the simplified
    // ceiling — or one whose balance nobody knows — produced no claim. The
    // family was shown nothing for their largest account. This route is slow and
    // unwelcome news, but silence is worse: it reads as "nothing to claim here".
    id: "bank-no-nominee-succession-certificate",
    title: ({ label }) =>
      label
        ? `${label} — sole account without nominee, above the simplified limit`
        : "Bank — sole account without nominee, above the simplified limit",
    authority:
      "City Civil Court, Bengaluru — or the district court where the deceased ordinarily resided",
    forms: ["Petition under s. 372, Indian Succession Act"],
    docsRequired: [
      { id: "death-certificate", label: "Death certificate" },
      { id: "claimant-id", label: "Claimant ID" },
      { id: "account-proof", label: "Account details — passbook or statement" },
      {
        id: "succession-certificate",
        label: "Succession certificate",
        whereToGet:
          "Civil court. Expect months, plus a ~45-day objection window after notice.",
      },
    ],
    timelineNote:
      "Months, not weeks. If the balance is unknown, ask the branch for a balance certificate first — it may fall under the simplified limit and avoid court entirely.",
    legalBasis: "S1 — RBI Settlement of Claims Directions, 2025; S3 — ISA ss. 370–390",
    verify: true,
    contexts: (profile) =>
      bankContexts(
        profile,
        (account) =>
          account.holding === "sole" &&
          account.nominee === "no" &&
          !withinSimplifiedCeiling(account),
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
  {
    id: "pension-family",
    title: "Family pension conversion and arrears",
    authority: "Pension-disbursing bank and Karnataka treasury",
    forms: [],
    docsRequired: [
      { id: "death-certificate", label: "Death certificate" },
      { id: "ppo", label: "Pension payment order (PPO)" },
      { id: "claimant-id", label: "Claimant ID" },
      { id: "joint-photograph", label: "Joint photograph, if required" },
    ],
    legalBasis: "S4 — Karnataka treasury pension route",
    verify: true,
    contexts: (profile) =>
      profile.employment === "retired" && profile.pension?.exists === "yes"
        ? [{}]
        : [],
  },
  {
    id: "insurance-nominee",
    title: "Life insurance — registered nominee files",
    authority: "The life insurer",
    forms: ["Insurer death-claim form"],
    docsRequired: [
      { id: "death-certificate", label: "Death certificate" },
      { id: "insurance-claim-form", label: "Insurer death-claim form" },
      { id: "policy-document", label: "Original policy document" },
      { id: "nominee-id", label: "Nominee ID" },
      { id: "cancelled-cheque", label: "NEFT mandate or cancelled cheque" },
    ],
    timelineNote: "The insurer may investigate if death occurred within three years of the policy start.",
    legalBasis: "S5 — LIC death claim process",
    verify: true,
    contexts: (profile) =>
      profile.insurance?.exists === "yes" && profile.insurance.nominee === "yes"
        ? [{}]
        : [],
  },
  {
    id: "insurance-legal-heirs",
    title: "Life insurance — legal heirs claim",
    authority: "The life insurer",
    forms: ["Insurer death-claim form"],
    docsRequired: [
      { id: "death-certificate", label: "Death certificate" },
      { id: "insurance-claim-form", label: "Insurer death-claim form" },
      { id: "policy-document", label: "Original policy document" },
      { id: "claimant-id", label: "Claimant ID" },
      { id: "cancelled-cheque", label: "NEFT mandate or cancelled cheque" },
      { id: "legal-heir-proof", label: "Legal-heir or succession certificate required by the insurer" },
    ],
    timelineNote: "Without a nominee, expect the insurer to require proof of the legal heirs.",
    legalBasis: "S5 — LIC death claim process",
    verify: true,
    contexts: (profile) =>
      profile.insurance?.exists === "yes" && profile.insurance.nominee === "no"
        ? [{}]
        : [],
  },
  {
    id: "securities-nominee",
    title: "Demat holdings — transmission to nominee",
    authority: "Depository participant (DP)",
    forms: ["DP transmission form"],
    docsRequired: nomineeTransmissionDocs,
    legalBasis: "S8 — SEBI transmission of securities",
    verify: true,
    contexts: (profile) =>
      profile.securities?.exists === "yes" && profile.securities.nominee === "yes"
        ? [{}]
        : [],
  },
  {
    id: "securities-simplified",
    title: "Demat holdings — simplified transmission to legal heirs",
    authority: "Depository participant (DP)",
    forms: ["DP transmission form"],
    docsRequired: simplifiedTransmissionDocs,
    legalBasis: "S8 — SEBI transmission of securities",
    verify: true,
    contexts: (profile) => {
      const holding = profile.securities;
      if (holding?.exists !== "yes" || holding.nominee !== "no") return [];
      const withinLimit = holding.form === "demat"
        ? holding.amountBracket === "under-5L" || holding.amountBracket === "5L-15L"
        : holding.amountBracket === "under-5L";
      return withinLimit ? [{}] : [];
    },
  },
  {
    id: "securities-succession-certificate",
    title: "Demat holdings — succession-certificate route",
    authority: "Civil court, then the depository participant (DP)",
    forms: ["Petition under s. 372, Indian Succession Act", "DP transmission form"],
    docsRequired: certificateTransmissionDocs,
    timelineNote: "Obtain a succession certificate before filing the transmission request.",
    legalBasis: "S8 — SEBI transmission of securities; S3 — ISA ss. 370–390",
    verify: true,
    contexts: (profile) => {
      const holding = profile.securities;
      if (holding?.exists !== "yes" || holding.nominee !== "no") return [];
      const withinLimit = holding.form === "demat"
        ? holding.amountBracket === "under-5L" || holding.amountBracket === "5L-15L"
        : holding.amountBracket === "under-5L";
      return withinLimit ? [] : [{}];
    },
  },
  {
    id: "mutual-funds-nominee",
    title: "Mutual funds — transmission to nominee",
    authority: "Asset management company (AMC) or registrar",
    forms: ["AMC transmission form"],
    docsRequired: nomineeTransmissionDocs,
    legalBasis: "S8 — SEBI transmission of securities",
    verify: true,
    contexts: (profile) =>
      profile.mutualFunds?.exists === "yes" && profile.mutualFunds.nominee === "yes"
        ? [{}]
        : [],
  },
  {
    id: "mutual-funds-simplified",
    title: "Mutual funds — simplified transmission to legal heirs",
    authority: "Asset management company (AMC) or registrar",
    forms: ["AMC transmission form"],
    docsRequired: simplifiedTransmissionDocs,
    legalBasis: "S8 — SEBI transmission of securities",
    verify: true,
    contexts: (profile) => {
      const holding = profile.mutualFunds;
      const withinLimit = holding?.amountBracket === "under-5L"
        || holding?.amountBracket === "5L-15L";
      return holding?.exists === "yes" && holding.nominee === "no" && withinLimit
        ? [{}]
        : [];
    },
  },
  {
    id: "mutual-funds-succession-certificate",
    title: "Mutual funds — succession-certificate route",
    authority: "Civil court, then the asset management company (AMC)",
    forms: ["Petition under s. 372, Indian Succession Act", "AMC transmission form"],
    docsRequired: certificateTransmissionDocs,
    timelineNote: "Obtain a succession certificate before filing the transmission request.",
    legalBasis: "S8 — SEBI transmission of securities; S3 — ISA ss. 370–390",
    verify: true,
    contexts: (profile) => {
      const holding = profile.mutualFunds;
      const withinLimit = holding?.amountBracket === "under-5L"
        || holding?.amountBracket === "5L-15L";
      return holding?.exists === "yes" && holding.nominee === "no" && !withinLimit
        ? [{}]
        : [];
    },
  },
];
