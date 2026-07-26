import { DOCUMENT_CATALOG } from "./catalog.ts";

export type Classification = {
  title: string;
  category: string;
  matchedDocumentIds: string[];
  confidence: number;
};

function searchable(filename: string, extractedText: string): string {
  return `${filename.replace(/[_-]+/g, " ")}\n${extractedText}`.slice(0, 250_000);
}

export function classifyDocument(
  filename: string,
  extractedText: string,
): Classification {
  const input = searchable(filename, extractedText);
  const matches = DOCUMENT_CATALOG
    .map((definition) => ({
      definition,
      hits: definition.patterns.filter((pattern) => pattern.test(input)).length,
    }))
    .filter((candidate) => candidate.hits > 0)
    .sort((left, right) => right.hits - left.hits);

  const best = matches[0];
  if (!best) {
    return {
      title: "Document needs review",
      category: "Unsorted",
      matchedDocumentIds: [],
      confidence: 0,
    };
  }

  // One known phrase is enough to file a document provisionally. A matching
  // filename raises confidence; no catalog match always stays reviewable.
  const filenameMatches = best.definition.patterns.some((pattern) =>
    pattern.test(filename.replace(/[_-]+/g, " "))
  );
  const confidence = Math.min(0.98, 0.58 + best.hits * 0.17 + (filenameMatches ? 0.12 : 0));

  return {
    title: best.definition.title,
    category: best.definition.category,
    matchedDocumentIds: best.definition.ids,
    confidence,
  };
}
