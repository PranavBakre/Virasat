# Iteration 2 — Document store and estate map

> Status: **implemented; live Sarvam Vision verification pending**
> Depends on: [Iteration 1](iteration-1-voice-chat.md)

## What it does

Each estate receives an opaque workspace id. The family can upload PDFs, scans,
photos, and text exports; Virasat stores the originals, digitises scans with
Sarvam Vision, classifies the extracted evidence, and marks only matching
rules-table document ids as held.

The existing claims schedule becomes the estate map. It groups claims by
institution, shows readiness by group, and deduplicates documents still needed
across every claim.

## Safety boundary

The parser handles evidence, never entitlement.

- Sarvam Vision extracts text; it does not decide which claims exist.
- Classification can satisfy only document ids already named by a cited rule.
- Ambiguous files remain `needs-review`; they do not make a claim filable.
- Missing evidence changes readiness, never whether an entitlement exists.
- `no` and `unknown` remain separate in the estate map.

## Storage

- Workspace metadata: `.virasat-data/estates/<estate-id>/workspace.json`
- Originals: `.virasat-data/estates/<estate-id>/originals/`
- Parsed text: `.virasat-data/estates/<estate-id>/extracted/`
- The entire data root is ignored by git.
- The estate id is stored in the page URL and browser local storage. There is no
  account or sign-in in this iteration, so the URL is the workspace access key.
- A reset clears interview facts but preserves uploaded originals.

This is a local prototype store, not a production privacy or access-control
model. Production requires authenticated households, encrypted object storage,
retention controls, deletion, malware scanning, and an audit trail.

## Parsing

- PDF, PNG, JPEG, TXT, Markdown, CSV, and JSON
- Up to 10 files in one upload, 20 MB each
- Text formats are read locally.
- PDF and image formats use the Sarvam Document Digitization job API when
  `SARVAM_API_KEY` is configured.
- Without a key, originals are retained and unread scans remain reviewable.
- A title or filename alone never proves possession. Automatic filing requires
  independent structural evidence in extracted content.
- Users can correct every readiness-changing document assertion.
- Vision jobs are queued, API calls are spaced to 10 requests per minute, and
  `429`/`503` responses retry with bounded backoff.

## Added modules

| Path | Owns |
|---|---|
| `src/documents/catalog.ts` | Known evidence labels mapped to rules-table document ids |
| `src/documents/classify.ts` | Deterministic evidence classification |
| `src/documents/sarvam-vision.ts` | Upload, poll, and download lifecycle for Indic OCR |
| `src/documents/store.ts` | Local workspace metadata and original-file storage |
| `src/documents/estate-map.ts` | Grouped claims and deduplicated missing-document view |
| `src/documents/process.ts` | Upload validation and parse/classify orchestration |

## Done when

- [x] An estate workspace survives page refresh
- [x] Multiple supported documents upload together
- [x] Originals and metadata remain outside source control
- [x] Known evidence updates claim readiness
- [x] Ambiguous evidence remains reviewable
- [x] Generic mentions and negated filenames cannot assert possession
- [x] Held evidence remains visible and correctable
- [x] Concurrent answers preserve document updates
- [x] Vision batches respect provider rate limits
- [x] The estate map groups claims and deduplicates missing documents
- [x] Typecheck and tests pass twice
- [ ] A scanned Kannada document completes against a live Sarvam Vision key

## Explicitly out

- User accounts, sharing permissions, or institution access
- Production encryption, retention, deletion, and malware scanning
- Automatic claim eligibility inferred from uploaded text
- Editing extracted text or manually reclassifying ambiguous evidence
