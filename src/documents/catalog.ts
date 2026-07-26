export type DocumentDefinition = {
  ids: string[];
  title: string;
  category: string;
  patterns: RegExp[];
};

// These are evidence labels, not legal requirements. The ids deliberately point
// back to the rules table so the parser can only satisfy a requirement that the
// deterministic engine already knows about.
export const DOCUMENT_CATALOG: DocumentDefinition[] = [
  {
    ids: ["death-certificate"],
    title: "Death certificate",
    category: "Identity and civil records",
    patterns: [/\bdeath certificate\b/i, /\bcertificate of death\b/i, /ಮರಣ ಪ್ರಮಾಣ ಪತ್ರ/u],
  },
  {
    ids: ["succession-certificate"],
    title: "Succession certificate",
    category: "Court and heir records",
    patterns: [/\bsuccession certificate\b/i, /\bsection 372\b/i],
  },
  {
    ids: ["heir-proof", "legal-heir-proof"],
    title: "Legal heir certificate",
    category: "Court and heir records",
    patterns: [/\blegal heir(?:ship)? certificate\b/i, /\bsurviving member certificate\b/i],
  },
  {
    ids: ["annex-i-b"],
    title: "Bank claim form — Annex I-B",
    category: "Bank records",
    patterns: [/\bannex(?:ure)?[\s-]*i[\s-]*b\b/i, /\bclaim form signed by all claimants\b/i],
  },
  {
    ids: ["annex-i-c"],
    title: "Bond of indemnity — Annex I-C",
    category: "Bank records",
    patterns: [/\bannex(?:ure)?[\s-]*i[\s-]*c\b/i, /\bbond of indemnity\b/i],
  },
  {
    ids: ["annex-i-d"],
    title: "Heir disclaimer or NOC — Annex I-D",
    category: "Bank records",
    patterns: [/\bannex(?:ure)?[\s-]*i[\s-]*d\b/i, /\bdisclaimer.*non-claimant\b/i],
  },
  {
    ids: ["bank-claim-form"],
    title: "Bank deceased-claim form",
    category: "Bank records",
    patterns: [/\bdeceased (?:depositor )?claim form\b/i, /\bclaim form.*nominee\b/i],
  },
  {
    ids: ["account-proof"],
    title: "Bank account proof",
    category: "Bank records",
    patterns: [/\baccount statement\b/i, /\bpassbook\b/i, /\baccount number\b.{0,80}\bifsc\b/is],
  },
  {
    ids: ["cancelled-cheque"],
    title: "Cancelled cheque",
    category: "Bank records",
    patterns: [/\bcancelled cheque\b/i, /\bcanceled cheque\b/i],
  },
  {
    ids: ["uan-pf-number"],
    title: "UAN or PF account record",
    category: "Employment and EPFO",
    patterns: [/\buniversal account number\b/i, /\buan\b.{0,40}\b\d{12}\b/is, /\bpf (?:account|number)\b/i],
  },
  {
    ids: ["employer-nominee-record"],
    title: "Employer nominee record",
    category: "Employment and EPFO",
    patterns: [/\bnomination (?:and declaration )?form\b/i, /\bemployer nominee record\b/i],
  },
  {
    ids: ["family-details"],
    title: "Family details",
    category: "Employment and EPFO",
    patterns: [/\bfamily details\b/i, /\bfamily particulars\b/i, /\bform 10d\b/i],
  },
  {
    ids: ["joint-photograph"],
    title: "Family photograph",
    category: "Employment and EPFO",
    patterns: [/\bjoint photograph\b/i, /\bfamily photograph\b/i],
  },
  {
    ids: ["claimant-id"],
    title: "Claimant identity proof",
    category: "Identity and civil records",
    patterns: [/\bclaimant(?:'s)? (?:id|identity)\b/i],
  },
  {
    ids: ["nominee-id"],
    title: "Nominee identity proof",
    category: "Identity and civil records",
    patterns: [/\bnominee(?:'s)? (?:id|identity)\b/i],
  },
  {
    ids: ["survivor-id"],
    title: "Surviving holder identity proof",
    category: "Identity and civil records",
    patterns: [/\bsurviv(?:or|ing holder)(?:'s)? (?:id|identity)\b/i],
  },
];
