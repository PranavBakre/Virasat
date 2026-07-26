import { DOCUMENT_CATALOG } from "./catalog.ts";

export type Classification = {
  title: string;
  category: string;
  matchedDocumentIds: string[];
  confidence: number;
};

const NON_EVIDENCE_CONTEXT =
  /\b(?:attach|provide|required?|requirements?|needed|missing|without|not|checklist|instructions?|sample|template)\b/i;

const STRUCTURAL_EVIDENCE = [
  /\b(?:registration|certificate|serial|reference|document)\s*(?:number|no\.?)\b/i,
  /\b(?:issued|certified|registered)\s+(?:by|to|on)\b/i,
  /\bdate of (?:issue|death)\b/i,
  /\b(?:signature|signed|seal|stamp)\b/i,
  /\b(?:name of (?:deceased|claimant|nominee)|account holder)\b/i,
  /\b(?:government|bank|employer|provident fund organisation|epfo)\s+of\b/i,
];

function positivePatternHit(pattern: RegExp, input: string): boolean {
  const match = new RegExp(pattern.source, pattern.flags.replace("g", "")).exec(input);
  if (!match || match.index === undefined) return false;
  const context = input.slice(
    Math.max(0, match.index - 48),
    match.index + match[0].length + 48,
  );
  return !NON_EVIDENCE_CONTEXT.test(context);
}

export function classifyDocument(
  filename: string,
  extractedText: string,
): Classification {
  const normalizedFilename = filename.replace(/[_-]+/g, " ");
  const boundedText = extractedText.slice(0, 250_000);
  const filenameCanIdentifyEvidence = !NON_EVIDENCE_CONTEXT.test(normalizedFilename);
  const structuralHits = STRUCTURAL_EVIDENCE.filter((pattern) => pattern.test(boundedText)).length;
  const matches = DOCUMENT_CATALOG
    .map((definition) => ({
      definition,
      textHits: definition.patterns.filter((pattern) =>
        positivePatternHit(pattern, boundedText)
      ).length,
      filenameHits: filenameCanIdentifyEvidence
        ? definition.patterns.filter((pattern) =>
          positivePatternHit(pattern, normalizedFilename)
        ).length
        : 0,
    }))
    .map((candidate) => ({
      ...candidate,
      score: candidate.textHits * 2 + candidate.filenameHits,
    }))
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) => right.score - left.score);

  const best = matches[0];
  if (!best) {
    return {
      title: "Document needs review",
      category: "Unsorted",
      matchedDocumentIds: [],
      confidence: 0,
    };
  }

  // A tie is not evidence. Requirement lists commonly name several documents,
  // and picking the first catalog row would silently invent possession.
  if (matches[1]?.score === best.score) {
    return {
      title: "Document needs review",
      category: "Unsorted",
      matchedDocumentIds: [],
      confidence: 0,
    };
  }

  // A title phrase merely identifies what a file discusses. Auto-filing needs
  // a second independent, structural signal from the document body, such as a
  // registration number, issuer, or signature. Catalog patterns are synonyms,
  // so matching two of them is still only one kind of evidence.
  const isEvidence = best.textHits >= 1 && structuralHits >= 1;
  const confidence = isEvidence
    ? Math.min(0.98, 0.86 + best.textHits * 0.04 + Math.min(structuralHits, 2) * 0.03)
    : Math.min(0.74, 0.46 + best.textHits * 0.12 + best.filenameHits * 0.08);

  return {
    title: best.definition.title,
    category: best.definition.category,
    matchedDocumentIds: best.definition.ids,
    confidence,
  };
}
