import { mkdir, readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import type { EstateProfile } from "../rules/types.ts";
import type { EstateWorkspace, StoredDocument } from "./types.ts";

const DATA_ROOT = join(process.cwd(), ".virasat-data", "estates");
const ESTATE_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isEstateId(value: string | null): value is string {
  return value !== null && ESTATE_ID.test(value);
}

function estateDirectory(estateId: string): string {
  if (!isEstateId(estateId)) throw new Error("Invalid estate id");
  return join(DATA_ROOT, estateId);
}

function workspacePath(estateId: string): string {
  return join(estateDirectory(estateId), "workspace.json");
}

export async function loadWorkspace(estateId: string): Promise<EstateWorkspace> {
  try {
    return JSON.parse(await readFile(workspacePath(estateId), "utf8")) as EstateWorkspace;
  } catch (error) {
    if (!isMissingFile(error)) throw error;
  }

  const now = new Date().toISOString();
  const workspace: EstateWorkspace = {
    id: estateId,
    profile: {},
    documents: [],
    createdAt: now,
    updatedAt: now,
  };
  await saveWorkspace(workspace);
  return workspace;
}

function isMissingFile(error: unknown): boolean {
  return error instanceof Error && "code" in error
    && (error as NodeJS.ErrnoException).code === "ENOENT";
}

export async function saveWorkspace(workspace: EstateWorkspace): Promise<void> {
  workspace.updatedAt = new Date().toISOString();
  await mkdir(estateDirectory(workspace.id), { recursive: true });
  await Bun.write(workspacePath(workspace.id), `${JSON.stringify(workspace, null, 2)}\n`);
}

export async function saveProfile(
  workspace: EstateWorkspace,
  profile: EstateProfile,
): Promise<void> {
  workspace.profile = profile;
  await saveWorkspace(workspace);
}

export async function saveOriginal(
  estateId: string,
  documentId: string,
  file: File,
): Promise<string> {
  const directory = join(estateDirectory(estateId), "originals");
  await mkdir(directory, { recursive: true });
  const extension = extname(file.name).toLowerCase().replace(/[^.a-z0-9]/g, "").slice(0, 8);
  const destination = join(directory, `${documentId}${extension}`);
  await Bun.write(destination, file);
  return destination;
}

export async function saveExtractedText(
  estateId: string,
  documentId: string,
  extractedText: string,
): Promise<void> {
  const directory = join(estateDirectory(estateId), "extracted");
  await mkdir(directory, { recursive: true });
  await Bun.write(join(directory, `${documentId}.txt`), extractedText);
}

export function addStoredDocument(
  workspace: EstateWorkspace,
  document: StoredDocument,
): void {
  workspace.documents.unshift(document);
}

export function clearStoredDocumentMatch(
  workspace: EstateWorkspace,
  documentId: string,
): void {
  for (const document of workspace.documents) {
    if (document.status !== "organized"
      || !document.matchedDocumentIds.includes(documentId)) continue;
    document.matchedDocumentIds = document.matchedDocumentIds.filter((id) => id !== documentId);
    if (!document.matchedDocumentIds.length) {
      document.status = "needs-review";
      document.confidence = Math.min(document.confidence, 0.74);
      document.error = "Automatic match removed. Confirm this document manually if needed.";
    }
  }
}

export function applyDocumentMatches(
  profile: EstateProfile,
  document: StoredDocument,
): EstateProfile {
  if (document.status !== "organized") return profile;
  const matches = Object.fromEntries(
    document.matchedDocumentIds.map((documentId) => [documentId, "yes" as const]),
  );
  return {
    ...profile,
    documents: { ...profile.documents, ...matches },
  };
}
