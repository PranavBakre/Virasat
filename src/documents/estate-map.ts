import type { Claim, ClaimSet } from "../rules/types.ts";
import type { EstateMap, EstateMapGroup, StoredDocument } from "./types.ts";

const GROUPS = [
  { match: /^bank/, id: "banks", title: "Banks and deposits" },
  { match: /^(epfo|eps)/, id: "epfo", title: "Provident fund and pension" },
  { match: /^employer/, id: "employer", title: "Employer dues" },
  { match: /^insurance/, id: "insurance", title: "Life insurance" },
  { match: /^pension/, id: "pension", title: "Pension" },
  { match: /^(demat|mutual|securities)/, id: "securities", title: "Shares and mutual funds" },
  { match: /^(post-office|ppf|scss)/, id: "post-office", title: "Post office savings" },
];

function groupFor(claim: Claim): { id: string; title: string } {
  return GROUPS.find((group) => group.match.test(claim.id))
    ?? { id: "other", title: "Other claims" };
}

export function buildEstateMap(
  claimSet: ClaimSet,
  documents: StoredDocument[],
): EstateMap {
  const grouped = new Map<string, EstateMapGroup>();
  const missing = new Map<string, EstateMap["missingDocuments"][number]>();

  for (const claim of claimSet.claims) {
    const group = groupFor(claim);
    const existing = grouped.get(group.id) ?? {
      ...group,
      claimCount: 0,
      readyCount: 0,
      heldDocuments: 0,
      requiredDocuments: 0,
      claims: [],
    };
    const uniqueDocs = new Map(claim.docsRequired.map((document) => [document.id, document]));
    existing.claimCount += 1;
    existing.readyCount += claim.status === "filable" ? 1 : 0;
    existing.heldDocuments += [...uniqueDocs.values()].filter((document) => document.have === "yes").length;
    existing.requiredDocuments += uniqueDocs.size;
    existing.claims.push(claim.title);
    grouped.set(group.id, existing);

    for (const document of uniqueDocs.values()) {
      if (document.have === "yes") continue;
      const item = missing.get(document.id) ?? {
        id: document.id,
        label: document.label,
        have: document.have,
        neededFor: [],
        ...(document.whereToGet ? { whereToGet: document.whereToGet } : {}),
      };
      if (!item.neededFor.includes(claim.title)) item.neededFor.push(claim.title);
      if (document.have === "no") item.have = "no";
      missing.set(document.id, item);
    }
  }

  return {
    groups: [...grouped.values()],
    missingDocuments: [...missing.values()].sort((left, right) => {
      if (left.have !== right.have) return left.have === "no" ? -1 : 1;
      return left.label.localeCompare(right.label);
    }),
    organizedDocuments: documents.filter((document) => document.status === "organized").length,
    reviewDocuments: documents.filter((document) => document.status === "needs-review").length,
  };
}
