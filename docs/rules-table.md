# virasat — rules table v1

> **This document is the product.** Everything else is packaging. `src/rules/table.ts`
> is a transcription of this file into typed data — when they disagree, this file wins.
>
> **Scope:** Karnataka · Hindu Succession Act (intestate) path · movable assets, full treatment.
>
> **Every `[VERIFY]` = confirm against the cited source before demo.**
> Do not delete a `[VERIFY]` without checking. A verified-looking claim that
> was never verified is the one output of this product that can actively harm
> someone — it sends a grieving family to a counter that turns them away.
>
> Legal basis shorthand: **RBI-2025** = RBI Settlement of Claims (Deceased
> Customers) Directions 2025 · **HSA** = Hindu Succession Act 1956 ·
> **ISA** = Indian Succession Act 1925 · movable-only rule: succession
> certificate covers movable assets only.

---

## 0. GATES (checked before any claim routes)

| condition | effect |
|---|---|
| death certificate = no | map shows single red card: "get death certificate first — registrar of births & deaths / hospital → municipal office. nothing moves without it." all claims render locked |
| religion ≠ hindu/sikh/jain/buddhist | claims + checklists still shown, shares section replaced with: "share calculation follows [Muslim personal law / ISA rules] — consult a lawyer for division. document requirements below still apply." |
| will = yes | all no-will routes swap to probate/executor track (section 6). amber flag if will = "not sure" |
| relationship not in class I (HSA schedule: widow, son, daughter, mother) [VERIFY class I list against HSA schedule, indiacode] | banner: "claims are normally filed by a class I heir. you can prepare the packet; a legal heir must sign/file." |

---

## 1. BANK ACCOUNTS & FDs

| holding | nominee | amount | route | authority | docs required | timeline note |
|---|---|---|---|---|---|---|
| joint (with survivorship / E-or-S) | — | any | survivor continuation. NO certificate needed | branch | death certificate, survivor's ID, account details | days [VERIFY survivorship clause wording — some joint accounts lack it, RBI-2025 annex] |
| sole | yes | any | nomination claim | branch | claim form + death certificate + nominee ID only — RBI-2025 explicitly bars banks from demanding succession certificate, probate, or indemnity in nominee cases [S1] | RBI-2025 mandates 15-day settlement [VERIFY in S1 text] |
| sole | no | ≤ ₹15 lakh (commercial bank) | simplified no-nominee route — NO court, and NO third-party surety allowed | branch | claim form (Annex I-B, all claimants sign), death certificate, valid ID proof, bond of indemnity (Annex I-C), disclaimer/NOC from non-claimant heirs (Annex I-D), legal heir certificate OR independent-person affidavit on heirs (Annex I-E) [S1] | 15-day mandate post-docs [VERIFY in S1 text] |
| sole | no | > ₹15 lakh | succession certificate track | city civil court (bengaluru) / district court (elsewhere in karnataka) | succession certificate (see section 5) + death certificate + claimant ID + account proof | months — set expectation honestly |
| sole | no | any, cooperative bank | threshold is ₹5 lakh, not 15 | branch / court | same as above at the lower threshold | [VERIFY per RBI-2025] |
| any | — | account dormant >10 yrs | funds may be in RBI DEA fund | bank first, UDGAM portal to search | same as applicable row above + UDGAM search result | discovery card: udgam.rbi.org.in |

---

## 2. LIFE INSURANCE (LIC pattern; private insurers ~same)

| nominee | route | docs | note |
|---|---|---|---|
| yes (claimant) | death claim by nominee | claim form (LIC form 3783/3801 [VERIFY form numbers, licindia.in]), original policy document, death certificate, nominee ID, NEFT mandate/cancelled cheque | if death within 3 yrs of policy start, insurer may investigate — set expectation |
| yes (someone else) | that nominee files; product preps packet | same | banner: nominee ≠ automatic sole owner of proceeds under HSA if disputes arise [VERIFY nuance — keep one careful line only] |
| no nominee | legal heirs claim | above + legal heir certificate or succession certificate per insurer threshold [VERIFY LIC's threshold] | slower route, flag it |
| policy document lost | duplicate policy first | indemnity + advertisement per LIC process [VERIFY] | red card with steps |

---

## 3. EPF / PENSION / EMPLOYER DUES

| trigger from interview | claim derived | form / authority | docs |
|---|---|---|---|
| employment = employed at death, had PF | PF balance | EPFO form 20 | death certificate, claimant ID + bank details, member's UAN/PF number [VERIFY form list epfindia.gov.in] |
| same | EPS pension for widow/children | EPFO form 10D | same + family details, photos |
| same | EDLI insurance (life cover up to ~₹7 lakh, near-automatic entitlement, almost nobody claims it) | EPFO form 5IF | same [VERIFY current EDLI max amount] |
| same | gratuity + final salary + leave encashment | employer HR | death certificate, legal heir proof, nominee record with employer |
| employment = retired, receiving pension | family pension conversion + arrears | pension disbursing bank + treasury (karnataka: PPO route) | death certificate, PPO, claimant ID, joint photo if required [VERIFY karnataka treasury process] |
| don't know if PF existed | discovery card | — | "check old salary slips for UAN, or ask employer HR; UAN portal search" |

---

## 4. SHARES / MUTUAL FUNDS / DEMAT

| nominee | value | route | docs |
|---|---|---|---|
| yes | any | transmission to nominee | transmission form (DP/AMC), death certificate, nominee KYC |
| no | ≤ ₹5 lakh per DP/AMC [VERIFY current SEBI simplified-transmission threshold — it has changed over the years] | simplified: legal heir proof + indemnity + NOCs | per DP/AMC list |
| no | above threshold | succession certificate / probate | section 5 |

---

## 5. SUCCESSION CERTIFICATE & LEGAL HEIR CERTIFICATE (karnataka)

| item | legal heir certificate | succession certificate |
|---|---|---|
| what it proves | who the heirs are | right to collect movable assets (debts & securities) — movable ONLY, never property title |
| issued by | tahsildar via nadakacheri portal (atalji janasnehi kendra) [VERIFY current portal name + fee] | civil court — city civil court bengaluru / district court [VERIFY court fee % under karnataka court fees act, and cap] |
| used for | pension, employer dues, small-value bank/insurance routes | no-nominee bank >15L, shares above threshold, debts owed to deceased |
| time | weeks [VERIFY nadakacheri SLA] | months (court notice + objection window ~45 days [VERIFY]) |
| docs to apply | death certificate, applicant ID, family details/ration card, address proof | petition u/s 372 ISA, death certificate, heir list, asset schedule with values, NOCs from co-heirs |

---

## 6. WILL EXISTS (probate track — thin coverage, honest banner)

| condition | route |
|---|---|
| will names executor | executor applies; probate optional in karnataka for most cases but institutions above thresholds may demand probate or letters of administration [VERIFY karnataka probate practice — presidency-town mandatory rule doesn't cover bengaluru, confirm] |
| will, no executor | letters of administration, district court |
| product behaviour | show document checklists as normal; shares section says "distribution per the will — probate advisable for high-value/contested estates" |

---

## 7. SHARES SUMMARY (spoken by agent, hindu intestate only)

class I heirs (HSA schedule): widow, sons, daughters, mother — equal shares. daughters equal post-2005 amendment. [VERIFY exact schedule wording]

agent line: "under the hindu succession act, [name]'s property divides equally among: [derived list from interview q17]."

---

## 8. INFERENCE RULES (fire without being asked — the intelligence layer)

| if | then add |
|---|---|
| employed at death | gratuity + EDLI + final salary claims, even if user never mentioned them |
| receiving pension | family pension + arrears claim |
| any bank ticked + "don't know" on accounts | UDGAM unclaimed-deposit search card |
| retired + 60+ | post office schemes prompt in drill-down |
| any asset with no nominee | one-line nudge card: "for YOUR OWN accounts — add nominees this week. this entire process disappears when a nominee exists." (delight + impact line) |
| liabilities = yes / unknown | card: "debts don't vanish — check CIBIL, credit cards, running loans before distributing assets" |

---

## OUT OF SCOPE v1

Routes shown as single "here's the track" cards, no workflow:

property/land mutation (revenue dept / khata), vehicle transfer (RTO), gold/locker
contents beyond access claim, agricultural land (patwari/bhoomi), digital assets,
muslim/christian/parsi share calculation, NRI claimants.

---

## SOURCES

Download all into `legal_sources/` before building — verify `[VERIFY]` tags against these.

| ref | what | link |
|---|---|---|
| S1 | RBI (Settlement of Claims in respect of Deceased Customers of Banks) Directions, 2025 — notification RBI/2025-26/82, issued 26 sep 2025, mandatory by 31 mar 2026. annexes I-A to I-H are the standard claim formats: mirror these in the letter generator | https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12901&Mode=0 |
| S2 | Hindu Succession Act, 1956 — class I / class II heir schedule at the end | https://www.indiacode.nic.in/handle/123456789/1362 — confirm via search "Hindu Succession Act" on indiacode.nic.in if handle changed |
| S3 | Indian Succession Act, 1925 — part IX (probate/LoA), part X ss. 370–390 (succession certificate, petition u/s 372) | search "Indian Succession Act 1925" on https://www.indiacode.nic.in |
| S4 | EPFO death claim forms — form 20 (PF), 10D (pension), 5IF (EDLI) + current EDLI cover amount | https://www.epfindia.gov.in → "Downloads / Forms" section |
| S5 | LIC death claim process + forms | https://licindia.in → "Customer Services / Claims" |
| S6 | nadakacheri (atalji janasnehi kendra) — karnataka legal heir/family tree certificate application, fee, SLA | https://nadakacheri.karnataka.gov.in |
| S7 | UDGAM — RBI unclaimed deposits search portal (discovery card link, use verbatim in product) | https://udgam.rbi.org.in |
| S8 | SEBI simplified transmission threshold for securities (verify current limit for section 4) | search "transmission of securities threshold" on https://www.sebi.gov.in |
| S9 | Karnataka Court Fees and Suits Valuation Act — succession certificate court fee % and cap | search on https://dpal.karnataka.gov.in or the karnataka high court site |

**Notes:**

- **S1 is the crown source** — it settles most bank-row `[VERIFY]` tags in one
  read, and its annex formats double as your letter templates. Read it first.
- Also verified from S1 coverage: joint-account nominee rights arise only after
  ALL holders die; missing-person claims need a court civil-death declaration
  (small claims up to ~₹1 lakh may proceed on FIR + non-traceable report);
  PPF/SCSS are excluded from these directions and follow their own scheme rules
  — add a one-line card for PPF accordingly.
- indiacode handles occasionally change; if a link 404s, search the act name on
  the site rather than trusting a mirror. **Never source act text from blogs.**

---

## How this file maps to code

| Section | Code |
|---|---|
| 0 | `evaluateGates()` in `src/rules/engine.ts` — runs before any claim routes |
| 1–4 | `RULES` array in `src/rules/table.ts` — one entry per row |
| 5 | `Certificate` cards, referenced by `blockedOn` from rows in 1 and 4 |
| 6 | `probateTrack()` — swaps the route set, does not extend it |
| 7 | `sharesFor(profile)` — returns a spoken string, never a computation |
| 8 | `applyInferences()` — runs after `RULES` filtering, appends derived claims and cards |
| Out of scope | Static `TRACK_CARDS` — shown, never workflowed |

Every row transcribed into `table.ts` carries its `legalBasis` (the `S…` ref)
and a `verify: true` flag if the row still holds a `[VERIFY]`. The renderer is
required to display both. See
[architecture.md](architecture.md#the-one-architectural-boundary-that-matters).
