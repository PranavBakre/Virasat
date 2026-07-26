import { describe, expect, test } from "bun:test";
import { classifyDocument } from "./classify.ts";
import { isSupportedDocument } from "./process.ts";

describe("classifyDocument", () => {
  test("maps a death certificate only to a known rules-table document id", () => {
    const result = classifyDocument(
      "scan.pdf",
      "Government of Karnataka\nCertificate of Death\nRegistration No 12",
    );

    expect(result.matchedDocumentIds).toEqual(["death-certificate"]);
    expect(result.category).toBe("Identity and civil records");
  });

  test("one legal-heir record can satisfy both rules-table aliases", () => {
    const result = classifyDocument(
      "legal-heir-certificate.pdf",
      "Legal heir certificate issued to the surviving members\nCertificate No 44",
    );

    expect(result.matchedDocumentIds).toEqual(["heir-proof", "legal-heir-proof"]);
    expect(result.confidence).toBeGreaterThanOrEqual(0.75);
  });

  test("ambiguous evidence stays unsorted", () => {
    expect(classifyDocument("photo-1.jpg", "").matchedDocumentIds).toEqual([]);
  });

  test("a requirement mentioning a document never proves it is held", () => {
    const result = classifyDocument(
      "instructions.txt",
      "Please attach the death certificate with the application.",
    );

    expect(result.matchedDocumentIds).toEqual([]);
    expect(result.confidence).toBe(0);
  });

  test("a trailing requirement marker also prevents auto-filing", () => {
    const result = classifyDocument(
      "letter.txt",
      "Death certificate required. Registration number should be visible.",
    );

    expect(result.matchedDocumentIds).toEqual([]);
    expect(result.confidence).toBe(0);
  });

  test("a negated filename never auto-files evidence", () => {
    const result = classifyDocument("not-a-death-certificate.pdf", "");

    expect(result.matchedDocumentIds).toEqual([]);
    expect(result.confidence).toBe(0);
  });

  test("a generic title phrase stays reviewable without structural evidence", () => {
    const result = classifyDocument("scan.pdf", "Death certificate");

    expect(result.matchedDocumentIds).toEqual(["death-certificate"]);
    expect(result.confidence).toBeLessThan(0.75);
  });

  test("synonymous title phrases are not independent evidence", () => {
    const deathCertificate = classifyDocument(
      "scan.pdf",
      "Death certificate. Certificate of death.",
    );
    const heirCertificate = classifyDocument(
      "scan.pdf",
      "Legal heir certificate. Surviving member certificate.",
    );

    expect(deathCertificate.matchedDocumentIds).toEqual(["death-certificate"]);
    expect(deathCertificate.confidence).toBeLessThan(0.75);
    expect(heirCertificate.matchedDocumentIds).toEqual([
      "heir-proof",
      "legal-heir-proof",
    ]);
    expect(heirCertificate.confidence).toBeLessThan(0.75);
  });

  test("a list naming multiple documents remains unsorted", () => {
    const result = classifyDocument(
      "requirements.txt",
      "Death certificate\nSuccession certificate\nClaimant identity",
    );

    expect(result.matchedDocumentIds).toEqual([]);
    expect(result.confidence).toBe(0);
  });
});

test("text uploads remain supported when multipart adds a charset", () => {
  const file = new File(["Certificate of Death"], "record.txt", {
    type: "text/plain;charset=utf-8",
  });
  expect(isSupportedDocument(file)).toBe(true);
});
