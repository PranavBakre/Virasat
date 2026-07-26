import type {
  Card,
  Claim,
  DocRequirement,
  DocSpec,
  EstateProfile,
} from "./types.ts";

export type InferenceResult = {
  claims: Claim[];
  cards: Card[];
};

function resolveDocuments(
  profile: EstateProfile,
  documents: DocSpec[],
): DocRequirement[] {
  return documents.map((document) => ({
    ...document,
    have: profile.documents?.[document.id] ?? "unknown",
  }));
}

function inferredClaim(
  profile: EstateProfile,
  claim: Omit<Claim, "docsRequired" | "status" | "blockedOn"> & {
    docsRequired: DocSpec[];
  },
): Claim {
  const docsRequired = resolveDocuments(profile, claim.docsRequired);
  const blockedOn = docsRequired
    .filter((document) => document.have !== "yes")
    .map((document) => document.id);

  return {
    ...claim,
    docsRequired,
    status: blockedOn.length === 0 ? "filable" : "blocked",
    blockedOn,
  };
}

export function applyInferences(
  profile: EstateProfile,
  existingClaims: Claim[],
): InferenceResult {
  const claims = [...existingClaims];
  const cards: Card[] = [];

  if (
    profile.employment === "employed-at-death" &&
    profile.epfo?.exists === "yes"
  ) {
    claims.push(
      inferredClaim(profile, {
        id: "epfo-eps",
        title: "EPS survivor pension",
        authority: "EPFO regional office or member portal",
        forms: ["Form 10D"],
        docsRequired: [
          { id: "death-certificate", label: "Death certificate" },
          { id: "claimant-id", label: "Claimant ID" },
          { id: "cancelled-cheque", label: "Bank details or cancelled cheque" },
          { id: "uan-pf-number", label: "Member UAN or PF number" },
          { id: "family-details", label: "Family details" },
          { id: "joint-photograph", label: "Family photographs" },
        ],
        legalBasis: "S4 — EPFO death claim forms",
        verify: true,
      }),
      inferredClaim(profile, {
        id: "epfo-edli",
        title: "EPFO death insurance (EDLI)",
        authority: "EPFO regional office or member portal",
        forms: ["Form 5IF"],
        docsRequired: [
          { id: "death-certificate", label: "Death certificate" },
          { id: "claimant-id", label: "Claimant ID" },
          { id: "cancelled-cheque", label: "Bank details or cancelled cheque" },
          { id: "uan-pf-number", label: "Member UAN or PF number" },
        ],
        legalBasis: "S4 — EPFO death claim forms",
        verify: true,
        commonlyMissed: true,
      }),
    );
  }

  if (profile.employment === "employed-at-death") {
    claims.push(
      inferredClaim(profile, {
        id: "employer-dues",
        title: "Employer dues — gratuity, final salary and leave encashment",
        authority: "Employer HR",
        forms: [],
        docsRequired: [
          { id: "death-certificate", label: "Death certificate" },
          { id: "legal-heir-proof", label: "Legal heir proof" },
          {
            id: "employer-nominee-record",
            label: "Nominee record held by the employer",
          },
        ],
        legalBasis: "S4 — employer-dues basis pending verification",
        verify: true,
        commonlyMissed: true,
      }),
    );
  }

  if (profile.insurance?.exists === "unknown") {
    cards.push({
      id: "insurance-discovery",
      kind: "discovery",
      title: "Check for life insurance policies",
      body: "Search for policy documents, premium receipts, or bank debits to LIC or another insurer.",
    });
  }

  return { claims, cards };
}
