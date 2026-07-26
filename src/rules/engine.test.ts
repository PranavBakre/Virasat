import { describe, expect, test } from "bun:test";

import { deriveClaims } from "./engine.ts";
import type { EstateProfile } from "./types.ts";

function makeProfile(overrides: Partial<EstateProfile> = {}): EstateProfile {
  return {
    deathCertificate: "yes",
    religion: "hindu",
    will: "no",
    state: "karnataka",
    district: "Bengaluru Urban",
    relationship: "spouse",
    survivingHeirs: ["widow", "son", "daughter"],
    banks: {
      exists: "yes",
      accounts: [
        {
          id: "bank-1",
          bankName: "State Bank of India",
          bankType: "commercial",
          holding: "sole",
          nominee: "yes",
          nomineeName: "Spouse",
        },
      ],
    },
    employment: "employed-at-death",
    epfo: { exists: "yes", serviceYears: 22 },
    insurance: { exists: "unknown" },
    pension: { exists: "no" },
    documents: {
      "death-certificate": "yes",
      "claimant-id": "yes",
      "nominee-id": "yes",
      "bank-claim-form": "yes",
      "cancelled-cheque": "yes",
      "joint-photograph": "yes",
      "uan-pf-number": "yes",
      "family-details": "yes",
      "legal-heir-proof": "yes",
      "employer-nominee-record": "yes",
    },
    ...overrides,
  };
}

describe("deriveClaims", () => {
  test("is deterministic for the same profile", () => {
    const profile = makeProfile();

    expect(deriveClaims(profile)).toEqual(deriveClaims(profile));
  });

  test.each([
    ["no", "death-certificate-missing"],
    ["applied", "death-certificate-pending"],
  ] as const)(
    "locks claim routing when the death certificate is %s",
    (deathCertificate, gateId) => {
      const result = deriveClaims(makeProfile({ deathCertificate }));

      expect(result.claims).toEqual([]);
      expect(result.cards).toEqual([]);
      expect(result.gates).toHaveLength(1);
      expect(result.gates[0]).toMatchObject({
        id: gateId,
        blocking: true,
      });
    },
  );

  test("materializes one bank claim per account with its asset reference", () => {
    const result = deriveClaims(
      makeProfile({
        banks: {
          exists: "yes",
          accounts: [
            {
              id: "bank-1",
              bankName: "State Bank of India",
              bankType: "commercial",
              holding: "sole",
              nominee: "yes",
            },
            {
              id: "bank-2",
              bankName: "Canara Bank",
              bankType: "commercial",
              holding: "sole",
              nominee: "yes",
            },
          ],
        },
      }),
    );

    const bankClaims = result.claims.filter((claim) =>
      claim.id.startsWith("bank-"),
    );
    expect(bankClaims).toHaveLength(2);
    expect(bankClaims.map((claim) => claim.assetRef).sort()).toEqual([
      "bank-1",
      "bank-2",
    ]);
  });

  test("derives PF, EPS, EDLI, and employer dues for employment with EPFO", () => {
    const result = deriveClaims(makeProfile());
    const ids = result.claims.map((claim) => claim.id);

    expect(ids).toContain("epfo-pf");
    expect(ids).toContain("epfo-eps");
    expect(ids).toContain("epfo-edli");
    expect(ids).toContain("employer-dues");
  });

  test("EPFO no removes PF, EPS, and EDLI but retains employer dues", () => {
    const result = deriveClaims(
      makeProfile({
        epfo: { exists: "no" },
      }),
    );
    const ids = result.claims.map((claim) => claim.id);

    expect(ids).not.toContain("epfo-pf");
    expect(ids).not.toContain("epfo-eps");
    expect(ids).not.toContain("epfo-edli");
    expect(ids).toContain("employer-dues");
  });

  test("missing documents block a claim without deleting it", () => {
    const baseline = deriveClaims(makeProfile());
    const missingDeathCertificate = deriveClaims(
      makeProfile({
        documents: {
          ...makeProfile().documents,
          "death-certificate": "no",
        },
      }),
    );

    expect(
      missingDeathCertificate.claims.map(({ id, assetRef }) => ({
        id,
        assetRef,
      })),
    ).toEqual(
      baseline.claims.map(({ id, assetRef }) => ({
        id,
        assetRef,
      })),
    );

    const affectedClaims = missingDeathCertificate.claims.filter((claim) =>
      claim.docsRequired.some(
        (requirement) => requirement.id === "death-certificate",
      ),
    );
    expect(affectedClaims.length).toBeGreaterThan(0);
    for (const claim of affectedClaims) {
      expect(claim.status).toBe("blocked");
      expect(claim.blockedOn).toContain("death-certificate");
    }
  });

  test("every derived claim retains its citation and verification marker", () => {
    const result = deriveClaims(makeProfile());

    expect(result.claims.length).toBeGreaterThan(0);
    for (const claim of result.claims) {
      expect(claim.legalBasis.trim().length).toBeGreaterThan(0);
      expect(typeof claim.verify).toBe("boolean");
    }
    expect(
      result.claims.find((claim) => claim.id === "epfo-edli")?.verify,
    ).toBe(true);
    expect(
      result.claims.find((claim) => claim.id === "employer-dues")?.verify,
    ).toBe(true);
  });

  // The simplified no-nominee ceiling is ₹15 lakh at a commercial bank but only
  // ₹5 lakh at a cooperative bank. The rule used to require bankType
  // "commercial", so a cooperative account matched nothing and the family was
  // shown no route at all for it.
  test.each([
    ["commercial", "under-5L", "bank-no-nominee-simplified"],
    ["commercial", "5L-15L", "bank-no-nominee-simplified"],
    ["commercial", "over-15L", "bank-no-nominee-succession-certificate"],
    ["cooperative", "under-5L", "bank-no-nominee-simplified"],
    ["cooperative", "5L-15L", "bank-no-nominee-succession-certificate"],
    ["cooperative", "over-15L", "bank-no-nominee-succession-certificate"],
  ] as const)(
    "routes a %s bank account at %s to %s",
    (bankType, amountBracket, expectedClaimId) => {
      const result = deriveClaims(
        makeProfile({
          banks: {
            exists: "yes",
            accounts: [
              {
                id: "bank-1",
                bankName: "Test Bank",
                bankType,
                holding: "sole",
                nominee: "no",
                amountBracket,
              },
            ],
          },
        }),
      );

      const bankClaims = result.claims.filter((claim) =>
        claim.id.startsWith("bank-"),
      );
      expect(bankClaims.map((claim) => claim.id)).toEqual([expectedClaimId]);
    },
  );

  test("an unknown balance routes to court rather than to nothing", () => {
    for (const amountBracket of ["unknown", undefined] as const) {
      const result = deriveClaims(
        makeProfile({
          banks: {
            exists: "yes",
            accounts: [
              {
                id: "bank-1",
                bankType: "commercial",
                holding: "sole",
                nominee: "no",
                ...(amountBracket ? { amountBracket } : {}),
              },
            ],
          },
        }),
      );

      expect(
        result.claims.map((claim) => claim.id).filter((id) => id.startsWith("bank-")),
      ).toEqual(["bank-no-nominee-succession-certificate"]);
    }
  });

  test("a joint account with survivorship claims without any certificate", () => {
    const result = deriveClaims(
      makeProfile({
        banks: {
          exists: "yes",
          accounts: [
            {
              id: "bank-1",
              bankName: "Canara Bank",
              bankType: "commercial",
              holding: "joint",
              survivorship: "yes",
            },
          ],
        },
      }),
    );

    const claim = result.claims.find(
      (candidate) => candidate.id === "bank-joint-survivorship",
    );
    expect(claim).toBeDefined();
    expect(claim?.docsRequired.map((document) => document.id)).not.toContain(
      "succession-certificate",
    );
  });

  // The guard that matters most. CLAUDE.md: a spurious claim is visible and
  // survivable, a silently dropped entitlement is not. Every account the family
  // told us about must surface on at least one claim, whatever its shape.
  test("no known bank account is ever silently dropped", () => {
    const accounts = [
      { id: "a", bankType: "commercial", holding: "sole", nominee: "yes" },
      { id: "b", bankType: "commercial", holding: "sole", nominee: "no", amountBracket: "5L-15L" },
      { id: "c", bankType: "cooperative", holding: "sole", nominee: "no", amountBracket: "5L-15L" },
      { id: "d", bankType: "commercial", holding: "sole", nominee: "no", amountBracket: "over-15L" },
      { id: "e", bankType: "unknown", holding: "sole", nominee: "no", amountBracket: "unknown" },
      { id: "f", bankType: "commercial", holding: "joint", survivorship: "yes" },
    ] as const;

    const result = deriveClaims(
      makeProfile({ banks: { exists: "yes", accounts: [...accounts] } }),
    );
    const covered = new Set(
      result.claims.map((claim) => claim.assetRef).filter(Boolean),
    );

    for (const account of accounts) {
      expect(covered).toContain(account.id);
    }
  });

  test("a dormant account surfaces the UDGAM search card", () => {
    const result = deriveClaims(
      makeProfile({
        banks: {
          exists: "yes",
          accounts: [
            {
              id: "bank-1",
              bankType: "commercial",
              holding: "sole",
              nominee: "yes",
              dormantOver10Years: "yes",
            },
          ],
        },
      }),
    );

    expect(result.cards.map((card) => card.id)).toContain("bank-dormant-udgam");
  });

  test("keeps discovery cards outside the claims collection", () => {
    const result = deriveClaims(
      makeProfile({
        banks: { exists: "no" },
        employment: "never-salaried",
        epfo: { exists: "no" },
        insurance: { exists: "unknown" },
      }),
    );

    expect(result.cards.map((card) => card.id)).toContain(
      "insurance-discovery",
    );
    expect(
      result.claims.some(
        (claim) =>
          claim.id.includes("insurance") ||
          claim.title.toLowerCase().includes("insurance"),
      ),
    ).toBe(false);
  });

  test("does not drop the positive answers from the reported retired-parent interview", () => {
    const result = deriveClaims(makeProfile({
      relationship: "son",
      district: "Bengaluru Suburban",
      employment: "retired",
      epfo: { exists: "no" },
      pension: { exists: "yes" },
      banks: {
        exists: "yes",
        accounts: [{
          id: "bank-1",
          bankName: "Union Bank of India",
          holding: "sole",
          nominee: "yes",
          nomineeName: "Nilima Bakre",
        }],
      },
      postOfficeSchemes: { exists: "no" },
      insurance: { exists: "yes", nominee: "yes", nomineeIsClaimant: "yes" },
      securities: { exists: "no", form: "demat" },
      mutualFunds: { exists: "yes", nominee: "yes" },
      immovableProperty: { exists: "yes" },
      vehicle: { exists: "yes" },
      bankLocker: { exists: "yes" },
      receivables: "no",
      liabilities: "no",
    }));

    expect(result.claims.map((claim) => claim.id)).toEqual([
      "bank-nominee",
      "pension-family",
      "insurance-nominee",
      "mutual-funds-nominee",
    ]);
    expect(result.cards.map((card) => card.id)).toEqual([
      "property-mutation-track",
      "vehicle-transfer-track",
      "bank-locker-access-track",
    ]);
  });
});
