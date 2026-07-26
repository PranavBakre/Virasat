import { evaluateGates } from "./gates.ts";
import { applyInferences } from "./inferences.ts";
import { RULES } from "./table.ts";
import type {
  Claim,
  ClaimSet,
  DocRequirement,
  EstateProfile,
  Rule,
  RuleContext,
} from "./types.ts";

function resolveDocuments(
  profile: EstateProfile,
  rule: Rule,
): DocRequirement[] {
  return rule.docsRequired.map((document) => ({
    ...document,
    have: profile.documents?.[document.id] ?? "unknown",
  }));
}

function materialize(
  rule: Rule,
  context: RuleContext,
  profile: EstateProfile,
): Claim {
  const docsRequired = resolveDocuments(profile, rule);
  const blockedOn = docsRequired
    .filter((document) => document.have !== "yes")
    .map((document) => document.id);

  return {
    id: rule.id,
    ...(context.assetRef ? { assetRef: context.assetRef } : {}),
    title:
      typeof rule.title === "function" ? rule.title(context) : rule.title,
    authority: rule.authority,
    forms: [...rule.forms],
    docsRequired,
    status: blockedOn.length === 0 ? "filable" : "blocked",
    blockedOn,
    ...(rule.timelineNote ? { timelineNote: rule.timelineNote } : {}),
    legalBasis: rule.legalBasis,
    verify: rule.verify,
    ...(rule.commonlyMissed === undefined
      ? {}
      : { commonlyMissed: rule.commonlyMissed }),
  };
}

function sharesFor(profile: EstateProfile): string | undefined {
  if (!profile.religion) return undefined;

  if (
    profile.religion === "hindu" ||
    profile.religion === "sikh" ||
    profile.religion === "jain" ||
    profile.religion === "buddhist"
  ) {
    return "Share division follows the Hindu Succession Act. This iteration does not calculate percentages.";
  }

  return "Share calculation follows personal-law or Indian Succession Act rules. Consult a lawyer for division; the document requirements shown still apply.";
}

export function deriveClaims(profile: EstateProfile): ClaimSet {
  const gates = evaluateGates(profile);
  const track = profile.will === "yes" ? "probate" : "intestate";

  if (gates.some((gate) => gate.blocking)) {
    return {
      gates,
      claims: [],
      cards: [],
      track,
    };
  }

  const baseClaims = RULES.flatMap((rule) =>
    rule.contexts(profile).map((context) => materialize(rule, context, profile)),
  );
  const inferred = applyInferences(profile, baseClaims);
  const sharesNote = sharesFor(profile);

  return {
    gates,
    claims: inferred.claims,
    cards: inferred.cards,
    ...(sharesNote ? { sharesNote } : {}),
    track,
  };
}
