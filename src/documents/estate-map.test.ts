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
});
