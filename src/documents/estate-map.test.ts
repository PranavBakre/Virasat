import { expect, test } from "bun:test";
import { deriveClaims } from "../rules/engine.ts";
import { buildEstateMap } from "./estate-map.ts";

test("estate map deduplicates missing documents across claims", () => {
  const claimSet = deriveClaims({
    deathCertificate: "yes",
    religion: "hindu",
    will: "no",
    employment: "employed-at-death",
    epfo: { exists: "yes" },
    documents: { "death-certificate": "yes", "claimant-id": "no" },
  });

  const map = buildEstateMap(claimSet, []);
  const claimantId = map.missingDocuments.find((document) => document.id === "claimant-id");

  expect(map.groups.find((group) => group.id === "epfo")?.claimCount).toBe(3);
  expect(claimantId?.have).toBe("no");
  expect(claimantId?.neededFor.length).toBeGreaterThan(1);
  expect(new Set(map.requiredDocuments.map((document) => document.id)).size)
    .toBe(map.requiredDocuments.length);
  expect(map.requiredDocuments.length).toBe(map.missingDocuments.length + 1);
});

test("estate map keeps held requirements visible for correction", () => {
  const claimSet = deriveClaims({
    deathCertificate: "yes",
    religion: "hindu",
    will: "no",
    employment: "employed-at-death",
    epfo: { exists: "yes" },
    documents: { "death-certificate": "yes", "claimant-id": "yes" },
  });

  const map = buildEstateMap(claimSet, []);

  expect(map.requiredDocuments.some((document) =>
    document.id === "claimant-id" && document.have === "yes"
  )).toBe(true);
  expect(map.missingDocuments.some((document) => document.id === "claimant-id")).toBe(false);
});
