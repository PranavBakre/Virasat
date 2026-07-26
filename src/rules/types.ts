export type YesNoUnknown = "yes" | "no" | "unknown";

export type AssetAnswer = {
  exists: YesNoUnknown;
};

export type AmountBracket =
  | "under-5L"
  | "5L-15L"
  | "over-15L"
  | "unknown";

// Securities have TWO simplified-transmission thresholds, not one: ₹15 lakh for
// demat (per beneficial owner) and ₹5 lakh for physical certificates (per listed
// company). So the form decides which threshold applies — the bracket alone
// cannot. Keep the threshold logic in the rule, the way bankType does for banks.
// docs/rules-table.md §4.
export type SecuritiesForm = "demat" | "physical" | "unknown";

export type BankAccount = {
  id: string;
  bankName?: string;
  bankType?: "commercial" | "cooperative" | "unknown";
  holding?: "sole" | "joint";
  jointHolderIsClaimant?: YesNoUnknown;
  survivorship?: YesNoUnknown;
  nominee?: YesNoUnknown;
  nomineeName?: string;
  amountBracket?: AmountBracket;
  dormantOver10Years?: YesNoUnknown;
};

export type EstateProfile = {
  deathCertificate?: "yes" | "applied" | "no";
  religion?:
    | "hindu"
    | "sikh"
    | "jain"
    | "buddhist"
    | "muslim"
    | "christian"
    | "other";
  will?: "yes" | "no" | "unsure";
  state?: "karnataka" | "other";
  district?: string;
  relationship?: "spouse" | "son" | "daughter" | "mother" | "father" | "other";
  survivingHeirs?: Array<"widow" | "widower" | "son" | "daughter" | "mother">;
  ageAtDeath?: number;

  banks?: AssetAnswer & { accounts?: BankAccount[] };
  insurance?: AssetAnswer & {
    insurer?: string;
    nominee?: YesNoUnknown;
    nomineeIsClaimant?: YesNoUnknown;
    policyDocumentLost?: YesNoUnknown;
  };
  employment?: "employed-at-death" | "retired" | "never-salaried" | "unknown";
  epfo?: AssetAnswer & { uanKnown?: YesNoUnknown; serviceYears?: number };
  pension?: AssetAnswer & {
    govtService?: YesNoUnknown;
    ppoAvailable?: YesNoUnknown;
  };
  // Was `demat` with a valueBracket splitting at ₹5 lakh. That was wrong: ₹5 lakh
  // is the PHYSICAL-certificate threshold; demat is ₹15 lakh. Renamed to
  // `securities` because it now covers both forms, and switched to the shared
  // AmountBracket, whose boundaries (5L, 15L) are exactly the two thresholds.
  securities?: AssetAnswer & {
    nominee?: YesNoUnknown;
    form?: SecuritiesForm;
    amountBracket?: AmountBracket;
  };
  mutualFunds?: AssetAnswer & {
    nominee?: YesNoUnknown;
    amountBracket?: AmountBracket;
  };
  postOfficeSchemes?: AssetAnswer & {
    schemes?: Array<"ppf" | "nsc" | "mis" | "scss" | "other">;
  };
  immovableProperty?: AssetAnswer;
  vehicle?: AssetAnswer;
  bankLocker?: AssetAnswer;
  receivables?: YesNoUnknown;
  liabilities?: YesNoUnknown;
  documents?: Record<string, YesNoUnknown>;
};

export type Gate = {
  id: string;
  title: string;
  body: string;
  blocking: boolean;
};

export type DocSpec = {
  id: string;
  label: string;
  whereToGet?: string;
};

export type DocRequirement = DocSpec & {
  have: YesNoUnknown;
};

export type Claim = {
  id: string;
  assetRef?: string;
  title: string;
  authority: string;
  forms: string[];
  docsRequired: DocRequirement[];
  status: "filable" | "blocked" | "uncertain";
  blockedOn: string[];
  timelineNote?: string;
  legalBasis: string;
  verify: boolean;
  commonlyMissed?: boolean;
};

export type Card = {
  id: string;
  kind: "discovery" | "warning" | "nudge" | "out-of-scope-track";
  title: string;
  body: string;
  link?: string;
};

export type ClaimSet = {
  gates: Gate[];
  claims: Claim[];
  cards: Card[];
  sharesNote?: string;
  track: "intestate" | "probate";
};

export type RuleContext = {
  assetRef?: string;
  label?: string;
};

export type Rule = {
  id: string;
  title: string | ((context: RuleContext) => string);
  authority: string;
  forms: string[];
  docsRequired: DocSpec[];
  timelineNote?: string;
  legalBasis: string;
  verify: boolean;
  commonlyMissed?: boolean;
  contexts: (profile: EstateProfile) => RuleContext[];
};
