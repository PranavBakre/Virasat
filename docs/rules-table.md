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
| death certificate = no | map collapses to one brick hard-gate card: "get the death certificate first — registrar of births & deaths / hospital → municipal office. nothing moves without it." claim routing stays locked |
| death certificate = applied | map collapses to one brick hard-gate card: "application submitted — keep the acknowledgement and wait for the certificate. nothing can be filed until it arrives." claim routing stays locked |
| religion ≠ hindu/sikh/jain/buddhist | claims + checklists still shown, shares section replaced with: "share calculation follows [Muslim personal law / ISA rules] — consult a lawyer for division. document requirements below still apply." |
| will = yes | all no-will routes swap to probate/executor track (section 6). amber flag if will = "not sure" |
| relationship not in class I (HSA schedule: widow, son, daughter, mother) [VERIFY class I list against HSA schedule, indiacode] | banner: "claims are normally filed by a class I heir. you can prepare the packet; a legal heir must sign/file." |
| district provided | use the Karnataka district to name the district court and Nadakacheri route; Bengaluru uses the city civil court where applicable [VERIFY exact district routing names against S6/S9] |

---

## 1. BANK ACCOUNTS & FDs

Apply this table independently to every known account. Each materialized claim
carries the account's session id and bank name so claims from multiple banks do
not collapse into one row.

| holding | nominee | amount | route | authority | docs required | timeline note |
|---|---|---|---|---|---|---|
| joint (with survivorship / E-or-S) | — | any | survivor continuation. NO certificate needed | branch | death certificate, survivor's ID, account details | days [VERIFY survivorship clause wording — some joint accounts lack it, RBI-2025 annex] |
| sole | yes | any | nomination claim | branch | claim form + death certificate + nominee ID only — RBI-2025 explicitly bars banks from demanding succession certificate, probate, or indemnity in nominee cases [S1] | RBI-2025 mandates 15-day settlement [VERIFY in S1 text] |
| sole | no | ≤ ₹15 lakh (commercial bank) | simplified no-nominee route — NO court, and NO third-party surety allowed | branch | claim form (Annex I-B, all claimants sign), death certificate, valid ID proof, bond of indemnity (Annex I-C), disclaimer/NOC from non-claimant heirs (Annex I-D), legal heir certificate OR independent-person affidavit on heirs (Annex I-E) [S1] | 15-day mandate post-docs [VERIFY in S1 text] |
| sole | no | > ₹15 lakh | succession certificate track | city civil court (bengaluru) / district court (elsewhere in karnataka) | succession certificate (see section 5) + death certificate + claimant ID + account proof | months — set expectation honestly |
| sole | no | any, cooperative bank | threshold is ₹5 lakh, not 15 | branch / court | same as above at the lower threshold | [VERIFY per RBI-2025] |
| any | — | account dormant >10 yrs | funds may be in RBI DEA fund | bank first, UDGAM portal to search | same as applicable row above + UDGAM search result | discovery card: udgam.rbi.org.in |

Before choosing a no-nominee route, collect the bank type and one of four amount
brackets: under ₹5 lakh, ₹5–15 lakh, over ₹15 lakh, or unknown. Unknown uses the
stricter route provisionally and tells the family to obtain a balance
certificate; it is never guessed downward.

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
| same | EDLI insurance (life cover up to ~₹7 lakh, near-automatic entitlement, almost nobody claims it) | EPFO form 5IF | same [VERIFY current EDLI max amount against S4 — secondary sources agree on **₹7 lakh** max, so expect to confirm rather than correct]. **Hard eligibility cliff: EDLI pays only if the member was in employment and contributing at the date of death.** If they had left the job, this claim fails — do not show it as available when employment ≠ employed at death |
| same | gratuity + final salary + leave encashment | employer HR | death certificate, legal heir proof, nominee record with employer [VERIFY legal basis and document list] |
| employment = retired, receiving pension | family pension conversion + arrears | pension disbursing bank + treasury (karnataka: PPO route) | death certificate, PPO, claimant ID, joint photo if required [VERIFY karnataka treasury process] |
| don't know if PF existed | discovery card | — | "check old salary slips for UAN, or ask employer HR; UAN portal search" |

---

## 4. SHARES / MUTUAL FUNDS / DEMAT

| nominee | value | route | docs |
|---|---|---|---|
| yes | any | transmission to nominee | transmission form (DP/AMC), death certificate, nominee KYC |
| no | **demat / mutual fund units: ≤ ₹15 lakh** per beneficial owner | simplified: legal heir proof + indemnity + NOCs | per DP/AMC list |
| no | **physical shares: ≤ ₹5 lakh** per listed company | simplified: legal heir proof + indemnity + NOCs | per RTA list |
| no | above the applicable threshold | succession certificate / probate | section 5 |

> **Fixed 26 Jul 2026 — this row was wrong.** It previously read "≤ ₹5 lakh per
> DP/AMC" for all securities, which conflates two different limits. **Demat is
> ₹15 lakh, not ₹5 lakh** — the old row sent families holding ₹5–15 lakh in demat
> to court when the simplified route was open to them. Ask which form the holding
> is in; almost everything is demat.
>
> [VERIFY both current figures against S8 — sebi.gov.in, not a blog. Secondary
> reporting was the only source available at fix time.]
>
> **Change coming, do NOT ship it yet:** a SEBI circular reported as dated
> **23 Jul 2026** raises these to **₹10 lakh physical / ₹30 lakh demat**, adds a
> Quick Transmission tier (₹10k physical / ₹30k demat), drops probate in
> uncontested cases, mandates acceptance of overseas death certificates, and sets
> 21-day processing — **effective 22 Aug 2026**, i.e. *after* demo day. The
> ₹15L/₹5L figures above are the operative ones today.
> [VERIFY the 23 Jul 2026 circular number and its commencement date on sebi.gov.in
> before this date passes — after 22 Aug 2026 this row becomes wrong.]

---

## 5. SUCCESSION CERTIFICATE & LEGAL HEIR CERTIFICATE (karnataka)

| item | legal heir certificate | succession certificate |
|---|---|---|
| what it proves | who the heirs are | right to collect movable assets (debts & securities) — movable ONLY, never property title |
| issued by | tahsildar via nadakacheri portal (atalji janasnehi kendra) [VERIFY current portal name + fee] | civil court — city civil court bengaluru / district court [VERIFY court fee % under karnataka court fees act, and cap] |
| used for | pension, employer dues, small-value bank/insurance routes | no-nominee bank >15L, shares above threshold, debts owed to deceased |
| time | weeks [VERIFY nadakacheri SLA] | months (court notice + objection window ~45 days [VERIFY against S3, **ISA s. 373** — secondary sources agree on 45 days, expect to confirm]) |
| docs to apply | death certificate, applicant ID, family details/ration card, address proof | petition u/s 372 ISA, death certificate, heir list, asset schedule with values, NOCs from co-heirs |

---

## 6. WILL EXISTS (probate track — thin coverage, honest banner)

| condition | route |
|---|---|
| will names executor | executor applies. **probate is optional everywhere in india** — but institutions above their thresholds may still demand probate or letters of administration in practice [VERIFY the repeal against the primary Act text, S10 — see the note below] |
| will, no executor | letters of administration, district court |
| product behaviour | show document checklists as normal; shares section says "distribution per the will — probate advisable for high-value/contested estates" |

> **The old `[VERIFY]` here asked whether the presidency-town mandatory-probate
> rule covers Bengaluru. That question is now moot — 26 Jul 2026.**
>
> **ISA s. 213 — the provision that made probate mandatory — was *deleted*** by the
> **Repealing and Amending Act, 2025** (assent reported as **20 Dec 2025**). It had
> applied to wills of Hindus, Buddhists, Sikhs, Jains and Parsis within the original
> civil jurisdiction of the Calcutta, Madras and Bombay High Courts. Bengaluru was
> never covered, so the answer for Karnataka was always "not mandatory" — and now
> it is not mandatory anywhere.
>
> The rest of the probate machinery survives (ISA ss. 222–232 grants, s. 276
> petition, Part X succession certificates). **Deletion of s. 213 removes a
> procedural bar, not the need to prove the will as evidence.**
>
> Corroborating signal: SEBI's reported 23 Jul 2026 transmission circular drops the
> probate requirement in uncontested cases, **expressly citing this amendment**.
>
> [VERIFY against the Repealing and Amending Act, 2025 primary text (S10). Law-firm
> secondary sources only at fix time — substance near-certain, citation is not.]
>
> **Product line, safe to say either way:** "probate isn't required by law — but the
> bank or society holding the asset may still ask for it. If they do, that's their
> policy, not a legal requirement."

---

## 7. SHARES SUMMARY (spoken by agent, hindu intestate only)

class I heirs (HSA schedule): widow, sons, daughters, mother — **one share each**. daughters equal post-2005 amendment. [VERIFY exact schedule wording against S2]

**Not simply "equal shares" — HSA s. 10 counts shares, not people:**

| rule | effect |
|---|---|
| all widows together | **one** share between them, not one each |
| each living son, each living daughter, the mother | **one** share each |
| the children of a **predeceased** son or daughter | **one** share for that whole branch, divided within it |

Worked: widow + 2 sons + 1 daughter + mother + 2 children of a predeceased son
= 6 shares. The five living class I heirs take **1/6 each**; the two grandchildren
**split 1/6, i.e. 1/12 each** — not 1/6 each.

> **Fixed 26 Jul 2026 — the old line said "equal shares" flatly.** That
> over-promises to grandchildren whenever a child predeceased the deceased, which
> is exactly the family most likely to be using this. Wrong shares spoken aloud to
> a grieving person is the failure mode this product exists to prevent.
>
> [VERIFY s. 10 rules 1–4 wording against S2, indiacode — the branch rule above
> came from secondary sourcing at fix time.]

agent line, no predeceased child: "under the hindu succession act, [name]'s property divides equally among: [derived list from interview q17]."

agent line, a child predeceased: "under the hindu succession act, [name]'s property divides into [N] shares — one each for [living class I heirs], and one share shared between [predeceased child]'s children."

**If the interview did not establish whether any child predeceased, do not speak a
share split at all.** Say the class I list and route to a lawyer for the division.
Guessing "equal" is the harmful default.

---

## 8. INFERENCE RULES (fire without being asked — the intelligence layer)

| if | then add |
|---|---|
| employed at death | gratuity + EDLI + final salary claims, even if user never mentioned them |
| receiving pension | family pension + arrears claim |
| banks ticked + "don't know" on accounts | UDGAM unclaimed-deposit search card |
| retired + 60+ | post office schemes prompt in drill-down |
| post office schemes = yes / unknown | separate-scheme track card: PPF, NSC, MIS, and SCSS do not use the RBI deceased-bank route; identify the scheme before giving filing guidance [S1] |
| any asset with no nominee | one-line nudge card: "for YOUR OWN accounts — add nominees this week. this entire process disappears when a nominee exists." (delight + impact line) |
| house / land or vehicle = yes / unknown | out-of-scope track card naming the revenue/khata or RTO route; never present it as a movable-asset claim |
| bank locker = yes / unknown | locker-access track card; do not claim coverage of the contents |
| money owed to deceased = yes / unknown | succession-certificate track card for debts and securities owed to the deceased |
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
| S8 | SEBI simplified transmission thresholds for securities — **two limits, not one**: physical (per listed company) and demat (per beneficial owner). Also fetch the **circular reported as dated 23 Jul 2026** raising them to ₹10L/₹30L **effective 22 Aug 2026** — confirm its number and commencement | search "transmission of securities" on https://www.sebi.gov.in |
| S9 | Karnataka Court Fees and Suits Valuation Act — succession certificate court fee % and cap | search on https://dpal.karnataka.gov.in or the karnataka high court site |
| S10 | **Repealing and Amending Act, 2025** — confirm it deleted **ISA s. 213** and the assent date (reported 20 Dec 2025). Settles section 6's probate question | search "Repealing and Amending Act 2025" on https://www.indiacode.nic.in |

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
