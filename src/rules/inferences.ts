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

  if (
    profile.postOfficeSchemes?.exists === "yes"
    || profile.postOfficeSchemes?.exists === "unknown"
  ) {
    cards.push({
      id: "post-office-scheme-track",
      kind: "out-of-scope-track",
      title: "Identify the post-office scheme",
      body: "PPF, NSC, MIS and SCSS each use their own deceased-claim process. Check the passbook or certificate before choosing the filing route.",
    });
  }

  if (profile.immovableProperty?.exists !== undefined
    && profile.immovableProperty.exists !== "no") {
    cards.push({
      id: "property-mutation-track",
      kind: "out-of-scope-track",
      title: "House or land needs a mutation or khata route",
      body: "Property transfer is separate from this movable-assets checklist. Start with the local revenue office, municipality or khata authority.",
    });
  }

  if (profile.vehicle?.exists !== undefined && profile.vehicle.exists !== "no") {
    cards.push({
      id: "vehicle-transfer-track",
      kind: "out-of-scope-track",
      title: "Transfer the vehicle through the RTO",
      body: "Vehicle ownership transfer follows the Karnataka RTO process and is separate from the claims listed above.",
    });
  }

  if (profile.bankLocker?.exists !== undefined && profile.bankLocker.exists !== "no") {
    cards.push({
      id: "bank-locker-access-track",
      kind: "out-of-scope-track",
      title: "Ask the bank for the locker-access process",
      body: "The branch must follow its deceased-locker inventory and access process. This checklist does not treat the locker contents as a monetary claim.",
    });
  }

  if (profile.receivables !== undefined && profile.receivables !== "no") {
    cards.push({
      id: "receivables-certificate-track",
      kind: "out-of-scope-track",
      title: "List money owed to the estate",
      body: "Debts and securities owed to the deceased may require a succession certificate. Record each debtor and the amount before approaching the civil court.",
    });
  }

  if (profile.liabilities !== undefined && profile.liabilities !== "no") {
    cards.push({
      id: "liabilities-check",
      kind: "warning",
      title: "Check debts before distributing the estate",
      body: "Loans and card balances do not disappear automatically. Check CIBIL, credit cards and running loans before distributing assets.",
    });
  }

  const hasNoNominee = (profile.banks?.accounts ?? []).some(
    (bank) => bank.nominee === "no",
  ) || profile.insurance?.nominee === "no"
    || profile.securities?.nominee === "no"
    || profile.mutualFunds?.nominee === "no";

  if (hasNoNominee) {
    cards.push({
      id: "add-your-own-nominees",
      kind: "nudge",
      title: "Add nominees to your own accounts",
      body: "For your own bank, insurance and investment accounts, adding a nominee now can spare your family this route later.",
    });
  }

  // Rules table §1 row 6 and §8. `dormantOver10Years` existed on the type but
  // nothing read it, so a long-dormant account produced no pointer at all —
  // and money in the DEA fund is exactly the kind nobody thinks to look for.
  const hasDormantAccount = (profile.banks?.accounts ?? []).some(
    (account) => account.dormantOver10Years === "yes",
  );

  if (hasDormantAccount) {
    cards.push({
      id: "bank-dormant-udgam",
      kind: "discovery",
      title: "Search UDGAM for transferred balances",
      body: "An account dormant for over ten years may have been moved to the RBI's Depositor Education and Awareness fund. Ask the branch first, then search UDGAM — the money is still claimable.",
      link: "https://udgam.rbi.org.in",
    });
  }

  return { claims, cards };
}
