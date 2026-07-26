import type { EstateProfile, YesNoUnknown } from "../rules/types.ts";

export type StoredDocumentStatus =
  | "processing"
  | "organized"
  | "needs-review"
  | "failed";

export type StoredDocument = {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  status: StoredDocumentStatus;
  title: string;
  category: string;
  matchedDocumentIds: string[];
  confidence: number;
  extractedTextAvailable?: boolean;
  textPreview?: string;
  error?: string;
};

export type EstateWorkspace = {
  id: string;
  profile: EstateProfile;
  documents: StoredDocument[];
  createdAt: string;
  updatedAt: string;
};

export type EstateDocumentRequirement = {
  id: string;
  label: string;
  have: YesNoUnknown;
  neededFor: string[];
  whereToGet?: string;
};

export type EstateMapGroup = {
  id: string;
  title: string;
  claimCount: number;
  readyCount: number;
  heldDocuments: number;
  requiredDocuments: number;
  claims: string[];
};

export type EstateMap = {
  groups: EstateMapGroup[];
  requiredDocuments: EstateDocumentRequirement[];
  missingDocuments: EstateDocumentRequirement[];
  organizedDocuments: number;
  reviewDocuments: number;
};
