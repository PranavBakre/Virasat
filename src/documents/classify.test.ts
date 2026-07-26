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
      "Legal heir certificate issued to the surviving members",
    );

    expect(result.matchedDocumentIds).toEqual(["heir-proof", "legal-heir-proof"]);
  });

  test("ambiguous evidence stays unsorted", () => {
    expect(classifyDocument("photo-1.jpg", "").matchedDocumentIds).toEqual([]);
  });
});

test("text uploads remain supported when multipart adds a charset", () => {
  const file = new File(["Certificate of Death"], "record.txt", {
    type: "text/plain;charset=utf-8",
  });
  expect(isSupportedDocument(file)).toBe(true);
});
