import { classifyDocument } from "./classify.ts";
import { digitizeDocument } from "./sarvam-vision.ts";
import { saveExtractedText, saveOriginal } from "./store.ts";
import type { StoredDocument } from "./types.ts";

const LOCAL_TEXT_TYPES = new Set([
  "text/plain",
  "text/csv",
  "application/json",
  "text/markdown",
]);

function isLocalText(file: File): boolean {
  const mimeType = file.type.split(";", 1)[0]?.trim();
  const extension = file.name.toLowerCase().split(".").pop();
  return LOCAL_TEXT_TYPES.has(mimeType)
    || ["txt", "md", "csv", "json"].includes(extension ?? "");
}

export const MAX_DOCUMENT_SIZE = 20 * 1024 * 1024;
export const MAX_DOCUMENTS_PER_UPLOAD = 10;

export function isSupportedDocument(file: File): boolean {
  const extension = file.name.toLowerCase().split(".").pop();
  return isLocalText(file)
    || file.type === "application/pdf"
    || file.type === "image/png"
    || file.type === "image/jpeg"
    || ["txt", "md", "csv", "json", "pdf", "png", "jpg", "jpeg"].includes(extension ?? "");
}

function preview(value: string): string {
  return value.replace(/\s+/gu, " ").trim().slice(0, 280);
}

export async function processDocument(
  estateId: string,
  file: File,
  apiKey: string | null,
  language: string,
): Promise<StoredDocument> {
  const id = crypto.randomUUID();
  await saveOriginal(estateId, id, file);
  const base: StoredDocument = {
    id,
    originalName: file.name,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
    uploadedAt: new Date().toISOString(),
    status: "processing",
    title: file.name,
    category: "Unsorted",
    matchedDocumentIds: [],
    confidence: 0,
  };

  try {
    const text = isLocalText(file)
      ? await file.text()
      : apiKey
        ? await digitizeDocument(file, apiKey, language)
        : "";
    const classification = classifyDocument(file.name, text);
    if (text.trim()) await saveExtractedText(estateId, id, text);
    const organized = classification.matchedDocumentIds.length > 0
      && classification.confidence >= 0.75;
    return {
      ...base,
      ...classification,
      status: organized ? "organized" : "needs-review",
      ...(text.trim() ? { extractedTextAvailable: true } : {}),
      ...(preview(text) ? { textPreview: preview(text) } : {}),
      ...(!apiKey && !isLocalText(file)
        ? { error: "Connect SARVAM_API_KEY to read scans and PDFs. The original remains in this estate workspace." }
        : {}),
    };
  } catch (error) {
    console.log("Document parsing unavailable", error);
    return {
      ...base,
      status: "failed",
      error: error instanceof Error ? error.message : "Document parsing failed",
    };
  }
}
