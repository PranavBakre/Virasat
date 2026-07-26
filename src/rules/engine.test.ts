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
});
