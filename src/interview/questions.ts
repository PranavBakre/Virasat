import type { BankAccount, EstateProfile } from "../rules/types.ts";
import type { InterviewLanguage } from "../voice/config.ts";

export type QuestionCopy = Record<InterviewLanguage, string>;
export type Question = {
  id: string;
  field: string;
  label: string;
  copy: QuestionCopy;
  kind: "enum" | "text";
  values: readonly string[];
  maxLength?: number;
  answered: (profile: EstateProfile) => boolean;
  applies: (profile: EstateProfile) => boolean;
  patch: (value: string, profile: EstateProfile) => Partial<EstateProfile>;
};

const always = () => true;
const inScope = (p: EstateProfile) => p.will !== "yes";
const ynu = ["yes", "no", "unknown"] as const;
const copy = (kn: string, hi: string, en: string): QuestionCopy =>
  ({ "kn-IN": kn, "hi-IN": hi, "en-IN": en });
const asset = (key: keyof EstateProfile) => (value: string) =>
  ({ [key]: { exists: value } }) as Partial<EstateProfile>;
const account = (profile: EstateProfile): BankAccount =>
  profile.banks?.accounts?.[0] ?? { id: "bank-1" };
const bankPatch = (
  current: EstateProfile,
  values: Partial<BankAccount>,
): Partial<EstateProfile> => ({
  banks: { exists: "yes", accounts: [{ ...account(current), ...values }] },
});

const questions: Question[] = [
  {
    id: "death-certificate", field: "deathCertificate", label: "Death certificate",
    copy: copy("ನಿಮ್ಮ ಬಳಿ ಮರಣ ಪ್ರಮಾಣಪತ್ರ ಇದೆಯೇ?", "क्या आपके पास मृत्यु प्रमाणपत्र है?", "Do you have the death certificate?"),
    kind: "enum", values: ["yes", "applied", "no"], answered: p => p.deathCertificate !== undefined,
    applies: always, patch: value => ({ deathCertificate: value as EstateProfile["deathCertificate"] }),
  },
  {
    id: "religion", field: "religion", label: "Family law",
    copy: copy("ಅವರು ಯಾವ ಧರ್ಮವನ್ನು ಅನುಸರಿಸುತ್ತಿದ್ದರು?", "वे किस धर्म का पालन करते थे?", "Which religion did they follow?"),
    kind: "enum", values: ["hindu", "sikh", "jain", "buddhist", "muslim", "christian", "other"],
    answered: p => p.religion !== undefined, applies: always,
    patch: value => ({ religion: value as EstateProfile["religion"] }),
  },
  {
    id: "will", field: "will", label: "Will",
    copy: copy("ಅವರು ಉಯಿಲು ಬರೆದಿದ್ದರೇ?", "क्या उन्होंने कोई वसीयत छोड़ी थी?", "Did they leave a will?"),
    kind: "enum", values: ["yes", "no", "unsure"], answered: p => p.will !== undefined,
    applies: always, patch: value => ({ will: value as EstateProfile["will"] }),
  },
  {
    id: "relationship", field: "relationship", label: "Your relationship",
    copy: copy("ಅವರೊಂದಿಗೆ ನಿಮ್ಮ ಸಂಬಂಧ ಏನು?", "उनसे आपका क्या रिश्ता है?", "What was your relationship to them?"),
    kind: "enum", values: ["spouse", "son", "daughter", "mother", "father", "other"],
    answered: p => p.relationship !== undefined, applies: inScope,
    patch: value => ({ relationship: value as EstateProfile["relationship"] }),
  },
  {
    id: "district", field: "district", label: "District",
    copy: copy("ಅವರು ಕರ್ನಾಟಕದ ಯಾವ ಜಿಲ್ಲೆಯಲ್ಲಿ ವಾಸಿಸುತ್ತಿದ್ದರು?", "वे कर्नाटक के किस ज़िले में रहते थे?", "Which Karnataka district did they live in?"),
    kind: "text", values: [], maxLength: 80, answered: p => p.district !== undefined,
    applies: inScope, patch: district => ({ state: "karnataka", district }),
  },
  {
    id: "employment", field: "employment", label: "Work",
    copy: copy("ಅವರು ಮರಣದ ಸಮಯದಲ್ಲಿ ಕೆಲಸದಲ್ಲಿದ್ದರೇ, ನಿವೃತ್ತರಾಗಿದ್ದರೇ?", "मृत्यु के समय वे नौकरी में थे या सेवानिवृत्त?", "Were they working, retired, or never salaried?"),
    kind: "enum", values: ["employed-at-death", "retired", "never-salaried", "unknown"],
    answered: p => p.employment !== undefined, applies: inScope,
    patch: value => ({ employment: value as EstateProfile["employment"] }),
  },
  {
    id: "epfo", field: "epfo.exists", label: "Provident fund",
    copy: copy("ಅವರಿಗೆ ಪಿಎಫ್ ಖಾತೆ ಇತ್ತೇ?", "क्या उनका पीएफ खाता था?", "Did they have a provident-fund account?"),
    kind: "enum", values: ynu, answered: p => p.epfo?.exists !== undefined,
    applies: p => inScope(p) && p.employment === "employed-at-death",
    patch: value => ({ epfo: { exists: value as "yes" | "no" | "unknown" } }),
  },
  {
    id: "pension", field: "pension.exists", label: "Pension",
    copy: copy("ಅವರಿಗೆ ಪಿಂಚಣಿ ಬರುತ್ತಿತ್ತೇ?", "क्या उन्हें पेंशन मिलती थी?", "Were they receiving a pension?"),
    kind: "enum", values: ynu, answered: p => p.pension?.exists !== undefined,
    applies: p => inScope(p) && p.employment === "retired", patch: asset("pension"),
  },
  {
    id: "banks", field: "banks.exists", label: "Bank accounts",
    copy: copy("ಅವರಿಗೆ ಬ್ಯಾಂಕ್ ಖಾತೆ ಅಥವಾ ಠೇವಣಿ ಇತ್ತೇ?", "क्या उनका कोई बैंक खाता या जमा राशि थी?", "Did they have any bank accounts or deposits?"),
    kind: "enum", values: ynu, answered: p => p.banks?.exists !== undefined,
    applies: inScope, patch: value => value === "yes"
      ? ({ banks: { exists: "yes", accounts: [{ id: "bank-1" }] } })
      : asset("banks")(value),
  },
  {
    id: "bank-name", field: "banks.accounts[0].bankName", label: "Bank",
    copy: copy("ಬ್ಯಾಂಕಿನ ಹೆಸರೇನು?", "बैंक का नाम क्या है?", "What is the bank's name?"),
    kind: "text", values: [], maxLength: 100, answered: p => account(p).bankName !== undefined,
    applies: p => p.banks?.exists === "yes", patch: (bankName, profile) => bankPatch(profile, { bankName }),
  },
  {
    id: "bank-holding", field: "banks.accounts[0].holding", label: "Account holding",
    copy: copy("ಖಾತೆ ಒಬ್ಬರ ಹೆಸರಲ್ಲಿತ್ತೇ ಅಥವಾ ಜಂಟಿಯಾಗಿತ್ತೇ?", "खाता अकेले उनके नाम पर था या संयुक्त?", "Was the account sole or joint?"),
    kind: "enum", values: ["sole", "joint"], answered: p => account(p).holding !== undefined,
    applies: p => p.banks?.exists === "yes", patch: (holding, profile) => bankPatch(profile, { holding: holding as "sole" | "joint" }),
  },
  {
    id: "joint-claimant", field: "banks.accounts[0].jointHolderIsClaimant", label: "Joint holder",
    copy: copy("ಜಂಟಿ ಖಾತೆದಾರರು ನೀವೇನಾ?", "क्या आप संयुक्त खाताधारक हैं?", "Are you the joint account holder?"),
    kind: "enum", values: ynu, answered: p => account(p).jointHolderIsClaimant !== undefined,
    applies: p => account(p).holding === "joint",
    patch: (value, profile) => bankPatch(profile, { jointHolderIsClaimant: value as "yes" | "no" | "unknown" }),
  },
  {
    id: "bank-nominee", field: "banks.accounts[0].nominee", label: "Nominee",
    copy: copy("ಈ ಖಾತೆಗೆ ನಾಮಿನಿ ಇದ್ದಾರೇ?", "क्या इस खाते में नॉमिनी है?", "Does this account have a nominee?"),
    kind: "enum", values: ynu, answered: p => account(p).nominee !== undefined,
    applies: p => account(p).holding === "sole",
    patch: (value, profile) => bankPatch(profile, { nominee: value as "yes" | "no" | "unknown" }),
  },
  {
    id: "nominee-name", field: "banks.accounts[0].nomineeName", label: "Nominee name",
    copy: copy("ನಾಮಿನಿಯ ಹೆಸರೇನು?", "नॉमिनी का नाम क्या है?", "What is the nominee's name?"),
    kind: "text", values: [], maxLength: 100, answered: p => account(p).nomineeName !== undefined,
    applies: p => account(p).nominee === "yes",
    patch: (nomineeName, profile) => bankPatch(profile, { nomineeName }),
  },
  {
    id: "bank-amount", field: "banks.accounts[0].amountBracket", label: "Approximate balance",
    copy: copy("ಖಾತೆಯಲ್ಲಿ ಸುಮಾರು ಹದಿನೈದು ಲಕ್ಷಕ್ಕಿಂತ ಹೆಚ್ಚು ಇದೆಯೇ?", "क्या खाते में लगभग पंद्रह लाख से अधिक हैं?", "Is the balance roughly above fifteen lakh?"),
    kind: "enum", values: ["under-5L", "5L-15L", "over-15L", "unknown"],
    answered: p => account(p).amountBracket !== undefined,
    applies: p => account(p).nominee === "no" || account(p).nominee === "unknown",
    patch: (amountBracket, profile) => bankPatch(profile, { amountBracket: amountBracket as BankAccount["amountBracket"] }),
  },
];

const assetSpecs: Array<[string, keyof EstateProfile, string, QuestionCopy]> = [
  ["post-office", "postOfficeSchemes", "Post office savings", copy("ಅವರಿಗೆ ಅಂಚೆ ಕಚೇರಿ ಉಳಿತಾಯ ಯೋಜನೆ ಇತ್ತೇ?", "क्या उनकी कोई डाकघर बचत योजना थी?", "Did they have post-office savings?")],
  ["insurance", "insurance", "Life insurance", copy("ಅವರಿಗೆ ಜೀವ ವಿಮೆ ಇತ್ತೇ?", "क्या उनकी जीवन बीमा पॉलिसी थी?", "Did they have life insurance?")],
  ["demat", "securities", "Shares", copy("ಅವರಿಗೆ ಡಿಮ್ಯಾಟ್ ಖಾತೆ ಇತ್ತೇ?", "क्या उनका डीमैट खाता था?", "Did they have a demat account?")],
  ["mutual-funds", "mutualFunds", "Mutual funds", copy("ಅವರಿಗೆ ಮ್ಯೂಚುವಲ್ ಫಂಡ್ ಇತ್ತೇ?", "क्या उनका म्यूचुअल फंड निवेश था?", "Did they have mutual funds?")],
  ["immovable-property", "immovableProperty", "House or land", copy("ಅವರಿಗೆ ಮನೆ ಅಥವಾ ಜಮೀನು ಇತ್ತೇ?", "क्या उनके पास घर या ज़मीन थी?", "Did they own a house or land?")],
  ["vehicle", "vehicle", "Vehicle", copy("ಅವರಿಗೆ ವಾಹನ ಇತ್ತೇ?", "क्या उनके पास वाहन था?", "Did they own a vehicle?")],
  ["bank-locker", "bankLocker", "Bank locker", copy("ಅವರಿಗೆ ಬ್ಯಾಂಕ್ ಲಾಕರ್ ಇತ್ತೇ?", "क्या उनका बैंक लॉकर था?", "Did they have a bank locker?")],
];
for (const [id, key, label, questionCopy] of assetSpecs) {
  questions.push({
    id, field: `${String(key)}.exists`, label, copy: questionCopy,
    kind: "enum", values: ynu,
    answered: p => (p[key] as { exists?: string } | undefined)?.exists !== undefined,
    applies: inScope, patch: asset(key),
  });
}
for (const [id, key, label, questionCopy] of [
  ["receivables", "receivables", "Money owed", copy("ಅವರಿಗೆ ಯಾರಾದರೂ ಹಣ ಕೊಡಬೇಕಿತ್ತೇ?", "क्या किसी को उनका पैसा देना था?", "Was anyone owed money to them?")],
  ["liabilities", "liabilities", "Loans and cards", copy("ಅವರ ಹೆಸರಿನಲ್ಲಿ ಸಾಲ ಬಾಕಿ ಇತ್ತೇ?", "क्या उनके नाम पर कोई ऋण बकाया था?", "Were there loans or card balances in their name?")],
] as const) {
  questions.push({
    id, field: key, label, copy: questionCopy, kind: "enum", values: ynu,
    answered: p => p[key] !== undefined, applies: inScope,
    patch: value => ({ [key]: value }) as Partial<EstateProfile>,
  });
}

export const QUESTIONS: readonly Question[] = questions;
export function questionById(id: string): Question | undefined {
  return QUESTIONS.find(question => question.id === id);
}
