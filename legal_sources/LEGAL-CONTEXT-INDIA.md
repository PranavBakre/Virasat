# ⚠️ UNVERIFIED SECONDARY RESEARCH — NOT A SOURCE OF TRUTH

> **Read this box before using anything below.**
>
> **`docs/rules-table.md` is the product's only source of legal truth.** This file
> is not. Where the two disagree, **the rules table wins** — and this file is the
> one that gets corrected.
>
> **How this file was built:** web search, on 26 July 2026. That means **blogs and
> secondary sites**, which `legal_sources/README.md` explicitly forbids as a source
> of act text. Exactly **one** item here was read from a primary source: the RBI
> Directions 2025, from rbi.org.in — and that read proved **this file wrong** (it
> originally cited the superseded RBI Master Circular; see §7.1).
>
> **Therefore:** treat every citation below as carrying an implicit `[VERIFY]`.
> **Never** transcribe a figure, form number, threshold, or timeline from this file
> into `docs/rules-table.md` or `src/rules/table.ts`. Go to the primary source in
> the rules table's SOURCES section instead.
>
> **What it is good for:** orientation and question-generation — spotting a claim
> route, a trap, or an out-of-scope track the interview should mention, then going
> to the primary source to confirm it. It found three real bugs in the rules table
> that way (see `docs/audits/2026-07-26-legal-context-cross-check.md`).
>
> **Scope mismatch, deliberate:** this file is all-India, all personal laws,
> movable **and** immovable. The product is `Karnataka · HSA intestate · movable`.
> Most of §4.2–4.6, §8, §9, §10 and §11 is on the rules table's
> **OUT OF SCOPE v1** list. Do not build from it.

---

# Legal Context: Death in the Family (India)

**Purpose.** Background orientation on the laws that touch an Indian family after a death — first 24 hours through succession, asset claims, property transfer, tax, and closures. Reference material for framing interview questions, **not** for deriving entitlements.

**Compiled:** 26 July 2026 (see the verification log at §15 — it separates what was checked from what was not)
**Jurisdiction:** Republic of India. Central law in depth; **Karnataka** used as the worked state example (state law varies — see §12).

> **Not legal advice.** This is a map of the statutes, not an opinion on any specific estate. Succession disputes, contested wills, unnatural deaths, and cross-border estates need a lawyer.

---

## Table of contents

| § | Section |
|---|---|
| 0 | [How to use this document](#0-how-to-use-this-document) |
| 1 | [Which law applies to whom](#1-which-law-applies-to-whom-the-first-fork) |
| 2 | [Phase 1 — First 72 hours](#2-phase-1--first-72-hours) |
| 3 | [Phase 2 — The certificate stack](#3-phase-2--the-certificate-stack) |
| 4 | [Phase 3 — Who inherits](#4-phase-3--who-inherits-substantive-succession-law) |
| 5 | [Phase 4 — Wills, probate, administration](#5-phase-4--wills-probate-and-administration) |
| 6 | [Phase 5 — Nominee vs heir: the central confusion](#6-phase-5--nominee-vs-heir-the-single-biggest-confusion) |
| 7 | [Phase 6 — Claiming financial assets](#7-phase-6--claiming-financial-assets-instrument-by-instrument) |
| 8 | [Phase 7 — Immovable property](#8-phase-7--immovable-property) |
| 9 | [Phase 8 — Tax](#9-phase-8--tax) |
| 10 | [Phase 9 — Identity, digital, and closures](#10-phase-9--identity-digital-and-closures) |
| 11 | [Special situations](#11-special-situations) |
| 12 | [State variation](#12-state-variation-what-changes-by-state) |
| 13 | [Traps where families lose money](#13-traps-where-families-lose-money-or-years) |
| 14 | [Master statute index](#14-master-statute-index) |
| 15 | [Verification log](#15-verification-log) |

---

## 0. How to use this document

Death admin in India runs on a **dependency chain**. Almost nothing can be done out of order:

```
Medical Certificate of Cause of Death (MCCD)
        ↓
Death Certificate  ← the master key; nothing downstream works without it
        ↓
   ┌────┴───────────────────────────────┐
   ↓                                    ↓
Was there a Will?                  Legal Heir Certificate
   ↓                    (for pension / PF / gratuity / service dues)
NO → intestate succession
     (§4: depends on religion)
YES → testamentary succession
     (§5: probate now OPTIONAL)
   ↓
   ├→ Succession Certificate (debts & securities only) — §3.4
   ├→ Probate / Letters of Administration (whole estate) — §5.3
   └→ Bank/insurer/employer internal claim process — §7
        ↓
   Mutation / khata transfer of property — §8
        ↓
   Final ITR of the deceased + estate tax position — §9
        ↓
   PAN, Aadhaar, passport, SIM, subscriptions closed — §10
```

**The two most important sentences in this document:**

1. **A nominee is usually a receiver, not an owner** — except for life insurance paid to a spouse/parent/child. (§6)
2. **Since 20 December 2025, probate is no longer legally mandatory anywhere in India** — though banks, societies and registrars may still ask. (§5.3)

---

## 1. Which law applies to whom — the first fork

Indian succession law is **personal law**: it turns on the deceased's religion and, sometimes, on how they married. Get this wrong and every downstream calculation is wrong.

| Deceased was… | Intestate succession governed by | Wills governed by |
|---|---|---|
| Hindu, Buddhist, Sikh, Jain | **Hindu Succession Act, 1956** (HSA) | Indian Succession Act, 1925 (ISA) ss. 57–191 |
| Muslim | **Muslim Personal Law (Shariat) Application Act, 1937** → uncodified Sunni (Hanafi) or Shia (Ithna Ashari) law | Uncodified Muslim law — **ISA formalities do NOT apply** |
| Christian | **ISA, 1925**, ss. 31–49 | ISA, 1925 |
| Parsi | **ISA, 1925**, ss. 50–56 | ISA, 1925 |
| Jew | ISA, 1925, ss. 31–49 | ISA, 1925 |
| Married under **Special Marriage Act, 1954** | **ISA, 1925** (SMA s. 21) — *unless* both spouses were Hindu/Buddhist/Sikh/Jain, in which case HSA applies (SMA s. 21A) | ISA, 1925 |
| Member of a **Scheduled Tribe** | **Custom** — HSA s. 2(2) expressly excludes STs unless the Central Government notifies otherwise | Custom; ISA s. 3 exemptions |
| Goa, Daman & Diu resident | **Portuguese Civil Code, 1867** (still in force) — community of property regime, forced heirship | Portuguese Civil Code |

### 1.1 Edge cases on the fork itself

- **Converts.** A Hindu who converted to Islam/Christianity is governed by the new personal law going forward. But the **Caste Disabilities Removal Act, 1850** protects the convert's *own* right to inherit — conversion does not disinherit you. However, HSA s. 26 disqualifies the *descendants* of a convert (born after conversion) from inheriting from Hindu relatives.
- **Interfaith couples married under SMA.** ISA applies. This surprises Hindu families: the HSA Class I/II scheme does *not* govern; ISA's widow-one-third rule does.
- **Interfaith couples married under religious rites** (one spouse converted to marry). Personal law of the religion of marriage applies.
- **Goa is genuinely different.** Communhão de bens means half the couple's assets already belong to the survivor; only the deceased's half devolves, and even that is subject to forced heirship for descendants. Do not apply mainland law to Goan property.
- **HUF property.** If the deceased was a coparcener in a Hindu Undivided Family, HSA s. 6 governs their notional share *separately* from their self-acquired property, which passes under s. 8. Two different calculations on one death. (§4.1.3)

---

## 2. Phase 1 — First 72 hours

### 2.1 Medical Certificate of Cause of Death (MCCD)

- **Law:** Registration of Births and Deaths Act, 1969 (RBD Act), **s. 10(2)–(3)**.
- The medical practitioner who attended the deceased during their last illness must issue the MCCD, free of charge, in **Form 4** (institutional death) or **Form 4A** (non-institutional death).
- **Hospital death:** issued by the hospital before the body is released.
- **Home death:** the treating doctor issues it. If the person died at home with **no attending doctor**, there is no MCCD — the death is registered on the basis of a statement by the informant, and the local authority/police may need to be involved. This is the single most common cause of delay for at-home deaths.
- MCCD is **not** the death certificate. It is the input to registration.

### 2.2 Was the death natural?

This determines whether the family can proceed directly to cremation/burial, or whether the police own the body first.

| Situation | Governing provision | What happens |
|---|---|---|
| Natural death, doctor attending | RBD Act s. 10 | MCCD issued, body released, no police |
| **Unnatural, sudden, suspicious, accidental, suicide, or death in unclear circumstances** | **BNSS, 2023, s. 194** (replaced CrPC s. 174 w.e.f. 1 July 2024) | Police must inform the nearest Executive Magistrate, hold an **inquest** at the scene before witnesses, and send the report to the Magistrate. Post-mortem where required. **No cremation/burial until police issue the NOC.** |
| **Death in police/judicial custody, or a woman's death within 7 years of marriage** | **BNSS, 2023, s. 196** (replaced CrPC s. 176) | **Magisterial inquiry is mandatory**, in addition to the police inquest. In custodial deaths, post-mortem by a board of doctors. |
| Suspected dowry death | **BNS, 2023, s. 80** (replaced IPC s. 304B) + BNSS s. 196 | Criminal investigation; presumption under **Bharatiya Sakshya Adhiniyam, 2023, s. 118** (was Evidence Act s. 113B) |
| Suspected abetted suicide | **BNS, 2023, s. 108** (replaced IPC s. 306) | Criminal investigation |

> **Practical note.** In an unnatural death the family's first document is not the MCCD — it is the **post-mortem report and police NOC**. Registration then proceeds on the police report. Expect 2–7 days, longer if the viscera go for chemical analysis.

### 2.3 Organ and body donation — a decision with a legal clock

- **Law:** Transplantation of Human Organs and Tissues Act, 1994 (THOTA), as amended in 2011, + THOTA Rules, 2014.
- **Brain-stem death** must be certified by a **board of four** registered medical practitioners (THOTA s. 3(6), Rule 10) — including the medical administrator in charge and a neurologist/neurosurgeon/intensivist from an approved panel — with **two independent examinations** at an interval.
- **Consent:** if the deceased had authorised donation in writing before death, the hospital may remove organs (s. 3(1)). Otherwise the **near relative** in lawful possession of the body must consent (s. 3(2)); "near relative" is defined in s. 2(i) as spouse, son, daughter, father, mother, brother, sister, grandfather, grandmother, grandson, granddaughter.
- **Unclaimed bodies:** s. 5 permits removal after 48 hours if unclaimed.
- **In an unnatural death**, organ retrieval also needs the authorisation of the police/forensic officer conducting the inquest (s. 6) — the medico-legal case takes priority.
- **Whole-body donation** for anatomical study is governed by **state Anatomy Acts** (e.g. Karnataka Anatomy Act, 1957), not THOTA.
- **Corneas/tissue** have a longer window than solid organs, and eye donation is possible after cardiac death — worth knowing because families often assume the window has closed.

### 2.4 Disposal of the body

- **No single central statute.** Governed by **municipal law and byelaws** — e.g. Karnataka Municipal Corporations Act, 1976 and BBMP/GBA burial-ground regulations; state Cemeteries and Burial Grounds Acts.
- Crematorium/burial ground requires the death certificate **or** the MCCD/hospital certificate plus, in unnatural deaths, the police NOC.
- **Right to dignified last rites** is read into **Article 21** of the Constitution — *Pt. Parmanand Katara v. Union of India* (1995) 3 SCC 248; *Ashray Adhikar Abhiyan v. Union of India* (2002) 2 SCC 27. Relevant when a hospital withholds a body over unpaid bills, which courts have repeatedly held to be unlawful.
- **Transport of the body:**
  - *Within India, interstate:* no NOC required by central law; hospitals issue a transport/embalming certificate. Airlines require embalming certificate + death certificate + NOC from police (if medico-legal).
  - *From abroad into India:* embalming certificate, death certificate from the foreign authority, NOC from the Indian Mission (Embassy/Consulate), and a sealed-coffin certificate. The Indian Mission's NOC is the gating document.
  - *Deaths of Indian workers abroad:* Ministry of External Affairs / Indian Community Welfare Fund may bear repatriation cost; for registered emigrant workers, the **Emigration Act, 1983** framework and Pravasi Bharatiya Bima Yojana insurance apply.

### 2.5 Death registration

- **Law:** RBD Act, 1969 as amended by the **Registration of Births and Deaths (Amendment) Act, 2023** (Act 20 of 2023), **in force 1 October 2023**.
- **Where:** Registrar of Births and Deaths of the area where the death *occurred* (not where the person lived). Digitally via the **Civil Registration System (CRS) portal** — `dc.crsorgi.gov.in`.
- **Who must report** (s. 8): head of the household (domestic death); **medical officer in charge** (hospital/institution death); person in charge of the jail (prison death); headman of the village or the local police officer (death in a public place or of a body found).
- **Time limits (s. 10, s. 13):**

| Delay | Requirement |
|---|---|
| **Within 21 days** | Normal registration, free |
| 21–30 days | Registrar may register on payment of a **late fee** |
| 30 days – 1 year | Written permission of the **prescribed authority** + **affidavit**, plus fee |
| **Over 1 year** | Order of a **First Class Magistrate / Judicial Magistrate**, plus affidavit and fee |

- **What the 2023 amendment changed, and why it matters:**
  - Digital registration and **digital death certificates** are now the norm; the certificate is issued electronically.
  - A national database is maintained by the Registrar General of India, and the registered death record may be used to **update other databases** — electoral rolls, Aadhaar, ration card, passport, property registration records. This is the legal basis for the "single-source-of-truth" death update, though inter-department propagation is still uneven in practice.
  - Aadhaar of the deceased and of the informant/parents may be collected.
- **Practical:** get **6–10 certified copies** at the outset. Every downstream institution wants an original or an attested copy, and re-applying later costs weeks.

---

## 3. Phase 2 — The certificate stack

Four different documents get conflated constantly. They are not interchangeable and they come from four different authorities.

### 3.1 Comparison table

| Document | Issued by | Legal basis | Establishes | Used for | Typical time |
|---|---|---|---|---|---|
| **Death Certificate** | Registrar of Births & Deaths | RBD Act, 1969 s. 12/17 | That the person died | Everything | 7–21 days |
| **Legal Heir Certificate** | Tahsildar / Revenue authority (Nadakacheri in Karnataka) | **State revenue rules — no central statute** | Who the surviving family members are | Pension, PF, gratuity, service dues, insurance, some khata transfers | 15–45 days |
| **Succession Certificate** | District Judge (civil court) | **ISA, 1925, ss. 370–390** (Part X) | Authority to collect **debts and securities** | Bank deposits, shares, PPF, mutual funds, provident dues, loans owed to the deceased | **4–8 months** |
| **Probate / Letters of Administration** | High Court or District Judge | ISA, 1925, ss. 222–232, 276 | Validity of the will (probate) / authority to administer the estate (LoA) | Whole estate incl. **immovable property**; conclusive against the world | **6 months – 2+ years** |

### 3.2 Legal Heir Certificate — the widely misunderstood one

- Cheap, fast, administrative. **Not conclusive of title.** It says "these are the surviving family members," not "these people own the property."
- Cannot be used to compel a bank to release a large deposit against competing claims, and cannot transfer immovable property title in a contested case.
- In Karnataka, obtained from the **Tahsildar via Nadakacheri / Seva Sindhu**. Documents: death certificate, applicant's ID, affidavit, family details, ration card or other proof of relationship.
- Often issued alongside a **Family Membership / family tree certificate** (Karnataka: *Vamsha Vruksha*) which sets out the genealogy — required by BBMP for khata transfer and by banks for accounts without nomination.

### 3.3 When you can skip both certificates entirely

This is the practical heart of the matter. Most estates never see a court, because:

- A **valid nomination** exists (bank, insurance, PF, demat, mutual fund) — the institution pays the nominee. §7
- A **survivorship clause** exists on a joint account ("either or survivor", "anyone or survivor", "former or survivor") — the balance goes to the survivor by contract.
- The claim is **below the institution's threshold**, and the institution accepts an **indemnity bond + affidavit + no-objection from other heirs** instead. RBI expressly encourages this for bank deposits; SEBI now mandates it up to ₹10 lakh (physical) / ₹30 lakh (demat). §7
- **All heirs agree** and execute a **family settlement deed** or **relinquishment deed**. A bona fide family settlement of an existing dispute is valid and, per settled Supreme Court law, does **not** require registration or stamp duty *if* it merely records pre-existing rights and does not create a new transfer — but the safe course is to register it. Contrast a **release/relinquishment deed**, which is a transfer instrument and **does** attract stamp duty and registration under the Registration Act, 1908 s. 17.

### 3.4 Succession Certificate — precise scope

- **ISA s. 370:** available only for **debts and securities**. Not immovable property. Not gold, not jewellery, not a car.
- "Securities" per **s. 370(2)**: government promissory notes, stock or debentures of a company or public body, shares, bonds, and any negotiable instrument or deposit.
- **Petition under s. 372** to the District Judge where the deceased ordinarily resided, or where any part of the property is. Must state the death, the ordinary residence, the family/near relatives and their residences, the right in which the petitioner claims, the absence of impediment, and the debts/securities sought.
- Court publishes notice and hears objections; minimum **45 days** notice period (s. 373). Ad valorem **court fee** under the Court Fees Act (state schedule) on the value of the debts/securities — in Karnataka a percentage of the estate value, which for large estates is substantial.
- **s. 381:** the certificate gives the holder **indemnity** — a bank paying the certificate-holder is legally discharged. This is precisely why banks want it.
- **s. 383:** may be revoked (e.g. obtained by fraud, or a will surfaces).
- A succession certificate **does not decide ownership** between heirs; it authorises collection. A later suit for partition can still redistribute.

---

## 4. Phase 3 — Who inherits (substantive succession law)

### 4.1 Hindus, Buddhists, Sikhs, Jains — Hindu Succession Act, 1956

#### 4.1.1 Hindu MALE dying intestate (ss. 8–13)

Property devolves in this order — **each class excludes the next entirely**:

**Class I heirs (Schedule, Class I) — take simultaneously:**
- Son, daughter, **widow**, **mother**
- Son / daughter of a predeceased son
- Son / daughter of a predeceased daughter
- Widow of a predeceased son
- Son / daughter of a predeceased son of a predeceased son
- Widow of a predeceased son of a predeceased son
- *(added by the 2005 amendment)* son and daughter of a predeceased daughter of a predeceased daughter; daughter of a predeceased son of a predeceased daughter; daughter of a predeceased daughter of a predeceased son

> ⚠️ **The father is NOT a Class I heir.** The mother is. If a man dies leaving a widow, children, and both parents, the father gets **nothing** and the mother takes a full share. This shocks families constantly.

**Distribution among Class I (s. 10):**
- Rule 1: the widow — or **all widows together as one share**
- Rule 2: each surviving son and daughter, and the mother — **one share each**
- Rules 3–4: the **branch** of each predeceased son/daughter takes **one share collectively**, divided within the branch

*Worked example.* A man dies intestate leaving a widow, 2 sons, 1 daughter, his mother, and the 2 children of a predeceased son. Shares = widow (1) + son (1) + son (1) + daughter (1) + mother (1) + predeceased son's branch (1) = **6 shares**. Each of the 5 living Class I heirs gets **1/6**. The predeceased son's 2 children **share 1/6, i.e. 1/12 each.**

**Class II heirs (s. 8(b), Schedule Class II)** — only if **no Class I heir exists**. Nine entries taken in strict order; those in an earlier entry exclude later entries; those within the same entry share equally:
I. **Father** — II. son's daughter's son/daughter, brother, sister — III. daughter's son's son/daughter, daughter's daughter's son/daughter — IV. brother's son/daughter, sister's son/daughter — V. father's father, father's mother — VI. father's widow, brother's widow — VII. father's brother, father's sister — VIII. mother's father, mother's mother — IX. mother's brother, mother's sister.

**Then (s. 8(c)–(d)):** **agnates** (related wholly through males), then **cognates** (related through females at some point), ranked under ss. 12–13.

**Then (s. 29): escheat** — the property devolves on the **Government**, taking it as an heir subject to the deceased's obligations and liabilities. See also Constitution **Art. 296**.

#### 4.1.2 Hindu FEMALE dying intestate (ss. 15–16) — the biggest trap in Indian succession law

A completely different, **asymmetric** order:

**s. 15(1) — general rule:**
- (a) sons, daughters (including children of a predeceased child) and the **husband**
- (b) **heirs of the husband**
- (c) **mother and father**
- (d) heirs of the father
- (e) heirs of the mother

> ⚠️ Note that (b) — **her husband's heirs** — come **before her own parents**. A childless widow's self-acquired property therefore goes to her *in-laws'* family before her own mother and father.

**s. 15(2) — the source-based reversion, which overrides s. 15(1) where there is no child or grandchild:**
- Property she **inherited from her father or mother** → reverts to **her father's heirs**
- Property she **inherited from her husband or father-in-law** → reverts to **her husband's heirs**

**Critically, s. 15(2) applies only to inherited property.** Her **self-acquired** property — salary, her own investments, a flat she bought — falls under s. 15(1) and goes to her husband's heirs before her parents. The Law Commission (207th Report, 2008) recommended fixing this asymmetry; **it has not been amended.**

**s. 14 — women's absolute property.** Any property possessed by a female Hindu, however acquired, is held by her as **full owner, not as a limited owner** — abolishing the old "widow's estate". *Exception in s. 14(2):* property acquired by gift, will, or decree that itself prescribes a **restricted estate** stays restricted. The leading case on the boundary is *V. Tulasamma v. Sesha Reddi* (1977) 3 SCC 99 — property given in recognition of a **pre-existing right to maintenance** falls under s. 14(1) and becomes absolute, not s. 14(2).

#### 4.1.3 Coparcenary / ancestral property — HSA s. 6

- Since the **Hindu Succession (Amendment) Act, 2005** (w.e.f. **9 September 2005**), a **daughter is a coparcener by birth in her own right, in the same manner as a son** — same rights and same liabilities in the coparcenary property.
- On the death of a coparcener, their **notional share** (as if a partition had occurred immediately before death) devolves by **testamentary or intestate succession**, not by survivorship. Survivorship as a doctrine is abolished for post-2005 deaths.
- **A daughter's own share devolves on her children as though she had been a coparcener** — s. 6(3) proviso.
- ***Vineeta Sharma v. Rakesh Sharma***, (2020) 9 SCC 1 (11 August 2020, 3-judge bench) settled the conflict between *Prakash v. Phulavati* (2016) and *Danamma v. Amar* (2018):
  - The daughter's right is **by birth** — the coparcenary right is **retroactive**.
  - **The father need NOT have been alive on 9 September 2005.** Overruled *Phulavati* on this point.
  - **But:** a partition **already effected before 20 December 2004** is protected. Only a partition by registered deed or by court decree counts — an oral or unregistered "family arrangement" claimed after the fact will not defeat the daughter's right (s. 6(5) and its explanation).
  - Pending suits and appeals were to be decided in line with this.
- **Self-acquired property is different.** A father's self-acquired property is his to will away entirely; no child has a birthright in it. HSA s. 6 governs only coparcenary property. Conflating the two is the most common family misunderstanding.
- **HSA s. 4(2)** was **omitted** by the 2005 amendment, so agricultural land is no longer carved out of the HSA by central law — but **state tenancy laws** may still create their own devolution rules. Check the state Act. (§12)

#### 4.1.4 Disqualifications

| Provision | Effect |
|---|---|
| **s. 24** *(omitted 2005)* | Certain widows who remarried were formerly disqualified — **no longer** |
| **s. 25** | A **murderer** or abettor of the murder of the deceased is disqualified from inheriting from them |
| **s. 26** | Descendants of a **convert**, born after the conversion, are disqualified — but the convert themselves is protected by the Caste Disabilities Removal Act, 1850 |
| **s. 27** | A disqualified person is treated as if they had **predeceased** the deceased |
| **s. 28** | **No disqualification** on grounds of disease, defect or deformity |

### 4.2 Muslims — uncodified personal law via the Shariat Act, 1937

The Muslim Personal Law (Shariat) Application Act, 1937, **s. 2**, directs that in questions of intestate succession, wills, and legacies, **Muslim personal law applies** to Muslims, overriding custom.

#### 4.2.1 Order of payment from the estate

Before any heir gets anything, the estate discharges, in order:
1. **Funeral expenses**
2. **Wages of domestic servants / debts of service**
3. **All debts** — including the **unpaid dower (mahr)** owed to the widow, which ranks as a **debt**, not a legacy. A widow who has not been paid her mahr is a **creditor of the estate** ahead of all heirs. Widely overlooked.
4. **Legacies (wasiyat)** — limited to **one-third** of the net estate
5. **Residue** → distributed among heirs by the fixed shares below

#### 4.2.2 The one-third rule for wills

- A Muslim may bequeath **at most 1/3 of the net estate** (after debts) to anyone.
- A bequest **to an heir** requires the **consent of the other heirs after the testator's death** — even within the 1/3.
- A bequest **exceeding 1/3 to a non-heir** is valid only to the extent of 1/3 unless the heirs consent.
- The remaining 2/3 **must** pass by the fixed shares. A Muslim therefore cannot disinherit heirs by will.
- **No formalities.** A Muslim will may be **oral**, may be in any form, and needs no attesting witnesses — ISA s. 63 does not apply (ISA s. 58 exempts Muslims from the will provisions). Proof is a question of evidence.

#### 4.2.3 Sunni (Hanafi) scheme

Three tiers, taken in order:

**(1) Sharers (*ashab al-furud*)** — twelve relations with Quranic fixed fractions:

| Sharer | Share |
|---|---|
| **Husband** | **1/4** if there is a child or son's child; **1/2** if not |
| **Wife** (or all wives together) | **1/8** if there is a child or son's child; **1/4** if not |
| **Father** | 1/6 if there is a child or son's child; else takes as residuary |
| **Mother** | **1/6** if there is a child, son's child, or 2+ siblings; else **1/3** |
| **True grandmother** | 1/6, if no mother |
| **Daughter** | **1/2** if the only child; **2/3 shared** if two or more — **but if a son survives, daughters become residuaries and take half a son's share** |
| **Son's daughter** | Similar, subject to nearer heirs |
| **Full sister** | 1/2 alone; 2/3 shared, if no child/father/brother |
| **Consanguine sister** | Similar, in default of full siblings |
| **Uterine brother / uterine sister** | **1/6** each; **1/3 shared** if two or more |

**(2) Residuaries (*asabah*)** — take what remains after sharers: son, son's son, father, brother, etc.
**(3) Distant kindred (*dhawu'l-arham*)** — only if there are no sharers and no residuaries (other than a spouse).

**Key Sunni features that surprise families:**
- **No right of representation.** If a son predeceases the father, that son's children are **entirely excluded** by a surviving son. Contrast HSA, where the predeceased son's branch takes a share. This is the sharpest difference between Hindu and Sunni succession.
- **The son : daughter ratio is 2 : 1** where both survive.
- **A spouse is never excluded** — the widow/widower always takes a share.
- **No adoption** in Sunni law; an adopted child does not inherit as a child (though may be provided for by the 1/3 bequest, or under the Juvenile Justice Act, 2015 if adopted under it — an unsettled interaction).
- **Doctrine of *radd* (return)** and ***awl* (increase/abatement)** adjust the fractions when they under- or over-shoot unity. A death with husband, two full sisters and a mother, for instance, over-subscribes and every share abates proportionately. Get a specialist to compute; do not do this arithmetic informally.
- Heirs' liability for the deceased's debts is **several and proportionate to their shares**, not joint.

#### 4.2.4 Shia (Ithna Ashari) scheme — materially different

- Heirs by **consanguinity** are divided into **three classes**, and a nearer class **wholly excludes** a remoter one:
  - **Class I:** parents; children and lineal descendants
  - **Class II:** grandparents; brothers and sisters and their descendants
  - **Class III:** paternal and maternal uncles and aunts and their descendants
- **Spouse (heir by marriage) inherits alongside every class** and is never excluded.
- Shia law **recognises representation** within a class, unlike Sunni law — a predeceased child's children step into their place.
- Shia law permits a **childless widow** only a share in the husband's **movable** property, not in the land — a much-litigated rule.

> **Practical:** always establish whether the family is Sunni or Shia before computing. Also note **Muslims married under the Special Marriage Act are governed by the ISA, not Muslim law** (SMA s. 21), and Muslims in Goa are governed by the Portuguese Civil Code.

### 4.3 Christians — Indian Succession Act, 1925, ss. 31–49

| Survivors | Widow / widower | Others |
|---|---|---|
| Spouse + lineal descendants | **1/3** | **2/3** to lineal descendants (s. 33(a)) |
| Spouse + kindred (no descendants) | **1/2** | **1/2** to kindred (s. 33(b)) |
| Spouse only, no descendants, no kindred | **Whole estate** | — (s. 33(c)) |
| No spouse | — | Whole estate to lineal descendants, else kindred (ss. 33, 42–48) |

- **s. 33A** — small-estate protection: where there are **no lineal descendants** and the net estate does not exceed **₹5,000**, the widow takes the whole. (The figure has never been revised and is now nominal.)
- **s. 37:** children take **equally**. **s. 38–40:** grandchildren and remoter descendants take **per stirpes** (by representation through their parent's branch).
- **s. 42–43:** if no descendants, the **father** takes the whole; if the father is dead, **mother, brothers and sisters share equally** (s. 43–44).
- **Sons and daughters are treated identically** throughout — no gender distinction, in contrast to HSA s. 15 and Muslim law.
- **Kerala:** the Travancore Christian Succession Act, 1092 ME (which gave daughters only 1/4 of a son's share, capped at ₹5,000) was held inoperative in ***Mary Roy v. State of Kerala*** (1986) 2 SCC 209 — the **ISA applies**, retrospectively to 1951. Kerala Syrian Christian families are still litigating consequences of this decades later.

### 4.4 Parsis — ISA, 1925, ss. 50–56

- Substantially rewritten by the **Indian Succession (Amendment) Act, 1991** to achieve gender parity:
  - **Widow/widower and each child take equal shares.**
  - **Each surviving parent takes half the share of a child** (s. 51).
  - A predeceased child's branch takes by representation (s. 53).
- **s. 50:** no distinction between those who die during the lifetime of a parent and others; a lineal descendant who dies childless and without a spouse is not counted.
- If no lineal descendant, s. 54 sets out the next-of-kin scheme in Schedule II Part I.

### 4.5 Special Marriage Act, 1954

- **s. 21:** succession to the property of a person married under the SMA is regulated by the **ISA, 1925**, as if they were a person to whom Part V of the ISA applies.
- **s. 21A** (inserted 1976): s. 21 does **not** apply where **both parties** to the SMA marriage are Hindu, Buddhist, Sikh or Jain — the **HSA applies** to them.
- **Net effect:** an interfaith SMA couple is governed by the ISA. A Hindu–Hindu couple who chose SMA for convenience remains under the HSA. Families almost never know this.

### 4.6 Scheduled Tribes

- **HSA s. 2(2)** excludes members of Scheduled Tribes from the Act unless the Central Government directs otherwise by notification. **Custom governs.**
- The Supreme Court in ***Kamla Neti v. Special Land Acquisition Officer***, 2022 SCC OnLine SC 1728, declined to extend HSA to ST women judicially but urged the Centre to consider amending s. 2(2). In ***Tirith Kumar v. Daduram*** (2024), the Court applied principles of justice, equity and good conscience to allow a tribal woman's heirs to inherit where custom was not proved.
- **Practical:** if the deceased was a Scheduled Tribe member, the custom of the tribe must be **pleaded and proved**. Also check state-specific tribal land-alienation prohibitions (e.g. Chhotanagpur Tenancy Act, Santhal Parganas Tenancy Act, Karnataka Scheduled Castes and Scheduled Tribes (Prohibition of Transfer of Certain Lands) Act, 1978 — the **PTCL Act**).

---

## 5. Phase 4 — Wills, probate, and administration

### 5.1 Validity of a will (ISA ss. 57–91; does not apply to Muslims)

| Requirement | Provision |
|---|---|
| **Capacity** — sound mind, not a minor, not coerced | s. 59 |
| **Free will** — no fraud, coercion, or importunity | s. 61 |
| **Revocable** at any time | s. 62 |
| **Execution:** testator signs or affixes a mark; **at least two witnesses attest**, each having seen the testator sign, and each signing in the testator's presence | **s. 63** |
| Interpretation, lapse, ademption, void bequests | ss. 74–111 |
| **Privileged wills** — soldiers on expedition, airmen, mariners at sea: may be **unattested, even oral** | ss. 65–66 |

**Not required (but strongly advisable):**
- **Registration** is **optional** — Registration Act, 1908 **s. 18(e)** lists a will as a document whose registration is optional. A registered will is not automatically more valid, but is far harder to challenge as a forgery and cannot be "lost."
- **Stamp duty:** a will attracts **nil** stamp duty (Indian Stamp Act, 1899, Schedule I — no article charges a will).
- **Medical certificate of sound mind** on the date of execution: not required, but the single most effective defence against a later capacity challenge.
- **A doctor or beneficiary as witness:** a beneficiary *can* witness under Indian law (unlike some jurisdictions), but it invites attack. Use independent witnesses.

**Common ways a will fails in Indian courts:**
- Only one attesting witness, or witnesses who did not see the testator sign
- Suspicious circumstances — an ailing testator, an unnatural exclusion of a natural heir, a beneficiary who wrote the will, no explanation for the disposition. Where suspicious circumstances exist, the burden on the propounder is heavier: *H. Venkatachala Iyengar v. B.N. Thimmajamma*, AIR 1959 SC 443, still the governing authority.
- A later will or codicil surfacing
- Disposing of **coparcenary property beyond the testator's notional share**
- A Muslim testator purporting to dispose of more than 1/3

### 5.2 What a will cannot do

- **Muslim testator:** cannot exceed **1/3**; cannot favour an heir without co-heirs' consent. §4.2.2
- **Hindu testator:** cannot will away the **coparcenary interest of other coparceners** — only their own notional share.
- **Goa:** forced heirship under the Portuguese Civil Code reserves a portion for descendants.
- **Cannot defeat a valid nomination in life insurance to a spouse/parent/child** — see §6.2, the beneficial-nominee point.
- **Cannot escape maintenance obligations:** a dependant's claim to maintenance out of the estate survives under **Hindu Adoptions and Maintenance Act, 1956, ss. 21–22** (dependants of a deceased Hindu), and under **BNSS s. 144** / erstwhile CrPC s. 125 principles during life.

### 5.3 Probate — no longer mandatory (major 2025 change)

> **Change of law.** **Section 213 of the Indian Succession Act, 1925 was deleted by the Repealing and Amending Act, 2025**, which received assent on **20 December 2025**.

**Before:** s. 213 barred an executor or legatee from establishing any right in court unless probate or letters of administration had been granted — and this applied to wills of **Hindus, Buddhists, Sikhs, Jains and Parsis** executed within the original civil jurisdiction of the **Calcutta, Madras and Bombay** High Courts, or relating to immovable property within those limits. Muslims and Indian Christians were exempt — a religion-based discrimination long criticised.

**Now:** **probate is optional everywhere in India.** A legatee can rely on a duly proved will without first obtaining probate.

**But do not over-read this:**
- The **remaining probate machinery survives** — ISA ss. 222–232 (who may take probate/LoA), s. 276 (petition), ss. 263 (revocation), and the succession-certificate provisions in Part X are all still in force. You can still *seek* probate, and often should.
- The will must still be **proved as a matter of evidence** in any dispute — deletion of s. 213 removes a procedural bar, not the burden of proof.
- **Third parties may still insist.** Cooperative housing societies, banks, sub-registrars and land-record offices routinely demand probate for chain-of-title comfort. They are now on weaker legal ground, but a family in a hurry may still find probate the faster route. Notably, **SEBI's July 2026 transmission circular expressly removes the probate requirement in uncontested cases**, citing this amendment (§7.3) — a sign that regulators are aligning, but each institution moves at its own pace.
- **Where probate is still clearly worth taking:** a contested or likely-contested estate; a large immovable estate where a purchaser will demand it; an executor who wants the statutory protection of acting under a court grant; a will with unusual dispositions.

**Probate vs Letters of Administration:**

| | Probate | Letters of Administration |
|---|---|---|
| When | Will exists **and names an executor** | No will, **or** will exists but names no executor / executor is dead or renounces |
| Effect | Certifies the will and the executor's authority | Appoints an administrator |
| Provision | ISA ss. 222–228 | ISA ss. 232–236 |
| Bond required | No | **Yes** — administration bond, ISA s. 291 |

**Court fee.** Ad valorem on the value of the estate under the **Court Fees Act** as applicable in the state — the largest hidden cost of probate. Karnataka charges a percentage of estate value with a ceiling; Maharashtra and West Bengal are notoriously expensive. Budget for it before choosing the probate route.

### 5.4 Administration of the estate

- **Executor's duties** (ISA ss. 316–331): collect the assets, pay funeral expenses, then debts, then legacies, then distribute the residue.
- **Order of payment of debts** where the estate is insolvent: ISA ss. 323–326; funeral and administration expenses first.
- **Heirs' liability is limited to the estate they inherit.** No Indian heir inherits personal liability for the deceased's debts beyond the value received. Recovery agents implying otherwise are wrong.
- **Executor's account:** must render accounts on the direction of the court; ISA s. 317.

---

## 6. Phase 5 — Nominee vs heir: the single biggest confusion

This is where most family disputes and most institutional friction originate.

### 6.1 The default rule: a nominee is a trustee, not an owner

The Supreme Court has now settled this across instruments:

- ***Sarbati Devi v. Usha Devi***, (1984) 1 SCC 424 — a nominee under the Insurance Act **does not become the owner**; they receive the money as a trustee for the legal heirs.
- ***Shakti Yezdani v. Jayanand Jayant Salgaonkar***, **2023 INSC 1076 (14 December 2023)** — a 2-judge bench held that nomination under the **Companies Act, 1956 s. 109A / Companies Act, 2013 s. 72** and the **Depositories Act, 1996 s. 9** **does NOT override succession law**. The word "vest" in s. 72 means the nominee holds the securities, not that they own them. The nominee is a **fiduciary holding for the legal heirs**. This affirmed the Bombay High Court and settled a long conflict of authority.

So for **bank deposits, shares, demat holdings, mutual funds, PPF and small savings**, the nominee's role is to **receive and hold**. The institution gets a valid discharge by paying the nominee; the nominee then owes the money to whoever succession law says owns it.

### 6.2 The exception that matters: life insurance to spouse/parent/child

- **Insurance Act, 1938, s. 39**, as amended by the **Insurance Laws (Amendment) Act, 2015** (nomination provisions effective **26 December 2014**), introduced the **"beneficial nominee"** in **s. 39(7)**.
- Where the policyholder nominates their **parents, spouse, or children (or any of them)**, those nominees are **beneficially entitled** to the policy proceeds — they keep the money as owners, and the proceeds do **not** form part of the estate for distribution among other heirs, unless it is proved that the policyholder could not have conferred such beneficial title.
- **s. 39(6):** where the nominee dies after the policyholder but before the claim is settled, the proceeds go to the nominee's heirs.
- **s. 39(4):** a nomination is **not** automatically cancelled by a later assignment of the policy in some cases; and a will does **not** revoke a nomination — a change of nomination must be endorsed on the policy.
- **Any other nominee** (a sibling, a nephew, a friend) is **not** a beneficial nominee and remains a mere trustee for the heirs, per *Sarbati Devi*.

> The distinction is worth restating: **life insurance to a spouse/parent/child is the one place in Indian law where nomination genuinely defeats succession.** Everywhere else, nomination is a payment mechanism.

### 6.3 Consolidated table

| Instrument | Governing provision | Nominee's status | Overrides succession law? |
|---|---|---|---|
| **Life insurance → spouse / parent / child** | Insurance Act s. 39(7) | **Beneficial owner** | ✅ **Yes** |
| Life insurance → anyone else | Insurance Act s. 39; *Sarbati Devi* | Trustee | ❌ No |
| Bank deposit | Banking Regulation Act ss. 45ZA–45ZC | Receiver / trustee | ❌ No |
| Bank locker & safe custody | Banking Regulation Act ss. 45ZD–45ZF | Receiver | ❌ No |
| Shares / debentures | Companies Act 2013 s. 72; *Shakti Yezdani* | Trustee | ❌ No |
| Demat holdings | Depositories Act s. 9; *Shakti Yezdani* | Trustee | ❌ No |
| Mutual fund units | SEBI regulations / AMFI process | Trustee | ❌ No |
| **EPF** | EPF Scheme 1952, **para 61** | **Beneficiary** — the scheme itself directs payment to nominee | ✅ Substantially yes |
| **EPS-95 pension** | EPS 1995 — "family" is **statutorily defined**; nomination is irrelevant | Statutory beneficiary | ✅ Statute overrides both |
| **Gratuity** | Payment of Gratuity Act 1972 s. 4(1)(c), Rule 6 (Form F) | **Beneficiary** under the Act | ✅ Substantially yes |
| **Government family pension** | CCS (Pension) Rules 2021 | Statutorily defined family, **not** nomination | ✅ Statute overrides |
| PPF / small savings | Government Savings Promotion Act 1873, ss. 6–8 | Receiver | ❌ No |
| **Joint account with survivorship clause** | Contract + RBI circular | Survivor takes by **contract** | Practically yes for the bank's discharge; heirs may still claim beneficial ownership |

### 6.4 The practical consequence

If you are a nominee who is **not** a beneficial nominee, and you are **not** the sole heir:
- You may lawfully **collect** the money — the institution is discharged.
- You **may not** simply keep it. You hold it for the heirs as determined by §4.
- The clean resolution is a **family settlement deed** signed by all heirs, recording who takes what. Get it drafted; a WhatsApp agreement will not survive a later dispute.

---

## 7. Phase 6 — Claiming financial assets, instrument by instrument

### 7.1 Bank accounts and deposits

**Law:** Banking Regulation Act, 1949, **ss. 45ZA–45ZF**; Banking Companies (Nomination) Rules, 1985; and — **this is the operative instrument** — the **RBI (Settlement of Claims in respect of Deceased Customers of Banks) Directions, 2025**, notification **RBI/2025-26/82** (DoR.MCS.REC.50/01.01.003/2025-26), issued **26 September 2025**, compliance mandatory **not later than 31 March 2026**.

> **Correction.** This section originally cited the older *RBI Master Circular on Customer Service*. That is **superseded**. The 2025 Directions were read directly from rbi.org.in and are the only primary-source verification in this file. The figures below come from that read.

**What the 2025 Directions actually mandate:**
- **Simplified no-nominee settlement threshold: ₹15 lakh** for commercial banks, **₹5 lakh** for cooperative banks — "or such higher limit as the bank may fix."
- Where a **nominee or survivor** exists, the bank **shall not insist** on a succession certificate, letters of administration, or probate, **and shall not seek any bond of indemnity or surety from the nominee, survivor, or a third party — irrespective of the amount.**
- **Settlement within 15 calendar days** of receiving all required documents (deposits); for lockers, the bank must process and communicate a date within the same 15 days.
- **Annexes I-A to I-H** are the standard formats: I-A claim form (nominee/survivor), I-B claim form (non-nominee), I-C bond of indemnity, I-D letter of disclaimer/NOC, I-E declaration regarding legal heirs, I-F locker inventory, I-G safe-custody articles inventory, I-H bond of indemnity (locker valuation).
- **Missing persons:** a court order under **Bharatiya Sakshya Adhiniyam, 2023, ss. 110 or 111** is required — but for claims **under ₹1 lakh**, an **FIR plus a police non-traceable report** may substitute.
- **Excluded:** government savings schemes administered by banks — **SCSS, PPF and the like** are outside these Directions and follow their own scheme rules.

> **Change of law.** The **Banking Laws (Amendment) Act, 2025** — nomination provisions **in force from 1 November 2025** — allows **up to four nominees** per deposit account.
> - **Deposits:** both **simultaneous** nomination (up to 4 nominees, with specified percentage shares totalling 100%) and **successive** nomination (up to 4 in order, each taking effect only on the death of the one above).
> - **Lockers and articles in safe custody:** **successive nomination only** — not simultaneous.

**Three routes to the money:**

| Situation | What the bank needs |
|---|---|
| **Survivorship clause** ("either or survivor", "anyone or survivor", "former or survivor") | Death certificate. Balance goes to the survivor. No succession certificate. |
| **Valid nomination** | Death certificate + nominee's KYC + claim form. **No succession certificate, no legal heir certificate, no indemnity from other heirs** — RBI is explicit that banks must not insist. |
| **No nomination, no survivorship — at or below ₹15 lakh** (commercial bank; **₹5 lakh** cooperative bank) | Simplified route, **no court**: claim form (Annex I-B, signed by all claimants), death certificate, valid ID, bond of indemnity (Annex I-C), disclaimer/NOC from non-claimant heirs (Annex I-D), and a declaration regarding legal heirs (Annex I-E). **No third-party surety may be demanded.** |
| **No nomination, no survivorship — above ₹15 lakh** (₹5 lakh cooperative) | **Succession certificate** track — city civil court (Bengaluru) or district court. Months, not weeks. |

**Also under the 2025 Directions:**
- Settlement **within 15 calendar days** of receiving complete documents.
- The survivor/nominee may **continue operating an overdraft/loan account** where relevant, and **pipeline transactions** (cheques in clearing) must be credited.
- **Term deposits** are paid with interest at the contracted rate to the date of death and at the applicable rate thereafter, **without premature-withdrawal penalty** to the claimant.
- Joint-account **nominee** rights arise only after **all** holders have died — a nominee cannot claim while a joint holder survives.

**Bank locker:** the bank inventories the contents in the presence of the nominee/survivor and **two independent witnesses**, prepares a signed inventory, and releases the contents. Governed by ss. 45ZE–45ZF and the **RBI Revised Guidelines on Safe Deposit Locker / Safe Custody Article Facility (2021)**, effective 1 January 2022.

**Loans of the deceased:** the estate is liable; **the heirs are not personally liable beyond what they inherit**. Secured loans (home loan) survive against the property. **Check for loan-protection insurance** — many home loans carry credit-life cover that extinguishes the debt on death, and lenders do not always volunteer this.

### 7.2 Life insurance

**Law:** Insurance Act, 1938, ss. 38–39, 45; IRDAI (Protection of Policyholders' Interests) Regulations, 2024.

- **Claim documents:** claim form, original policy document, death certificate, nominee KYC and bank details. Early/unnatural death additionally: post-mortem report, police FIR and inquest/final report, treating hospital records.
- **Settlement timelines** under the IRDAI policyholder-protection regulations: a **non-investigation death claim within 15 days** of receipt of all documents; where investigation is required, the investigation must be completed **within 45 days** of the claim and settled within **15 days** thereafter. Delay attracts **interest at the bank rate + 2%**.
- **Insurance Act s. 45 — the three-year wall:** **no life policy can be called in question on any ground whatsoever after three years** from the date of the policy, its risk commencement, its revival, or the date of the rider, whichever is later. Within three years, the insurer may repudiate for fraud or misstatement, but must give written reasons.
- **Unclaimed policies:** IRDAI requires insurers to display unclaimed-amount search on their websites; also check the **IRDAI Bima Bharosa** grievance portal and the **Unclaimed Deposits / Investor Education and Protection Fund** for lapsed proceeds.
- **Where to look for policies the family doesn't know about:** the deceased's bank statements for premium debits, Form 26AS / AIS for 80C deductions claimed, the **CKYC** registry, employer group-life cover, credit-card complimentary cover, and **NSDL/CDSL insurance repositories**.

### 7.3 Shares, demat, and mutual funds — new framework from 22 August 2026

**Law:** Companies Act, 2013 **s. 56(2)** (transmission) and **s. 72** (nomination) + Companies (Share Capital and Debentures) Rules, 2014, **Rule 19**; Depositories Act, 1996 **s. 9**; SEBI (LODR) Regulations, 2015, **Reg. 40** and Schedule VII.

> **Change of law.** **SEBI circular dated 23 July 2026** overhauls transmission of securities, **effective 22 August 2026** (30 days from the circular). It applies to **listed companies, RTAs, depositories, depository participants and mutual funds** (including SIF units in Statement of Account form).
>
> Key features:
> - **Simplified-documentation thresholds raised** to **₹10 lakh for physical securities** (per listed entity) and **₹30 lakh for dematerialised holdings** (per beneficial owner) — up from ₹5 lakh and ₹15 lakh. Listed companies may voluntarily raise the physical limit further.
> - **New Quick Transmission Processing (QTP)** for low-value claims — up to **₹10,000 (physical)** and **₹30,000 (demat)** — with minimal documentation.
> - **Mandatory probate requirement removed in uncontested cases**, aligning with the deletion of ISA s. 213 (§5.3).
> - **Standardised** claim procedure, document list, and timelines; **death certificates issued overseas are to be accepted**.
> - **Processing within 21 calendar days** of receipt of complete documents.
>
> Verify the exact circular reference and the final document annexures on sebi.gov.in before relying on specific figures — this framework is days old at the time of writing.

**Documents, below threshold:** transmission request form, death certificate (notarised/attested), PAN of the claimant, affidavit/self-declaration, **NOC from other legal heirs or a family settlement deed**, indemnity bond, and — where there is no nomination — a legal heir document. **Above threshold:** succession certificate, probate, letters of administration, or a court decree.

**Joint holding:** the surviving joint holder is simply recorded as the holder; nomination becomes relevant only on the death of the last survivor.

**Mutual funds:** AMFI's standardised transmission process; SEBI permits **up to 3 nominees** for MF folios (and up to 10 for demat accounts under the 2025 SEBI nomination framework — verify current cap). Where the nominee is not the heir, the *Shakti Yezdani* trustee principle applies.

**Unclaimed shares and dividends:** dividends unclaimed for **7 years** and the underlying shares are transferred to the **Investor Education and Protection Fund (IEPF)** under Companies Act ss. 124–125. Recovery is by **Form IEPF-5** to the IEPF Authority — a slow but real route. Also search **IEPF**, the **NSDL/CDSL** unclaimed portals, and **UDiN/MITRA** for orphaned mutual fund folios.

### 7.4 Employees' Provident Fund, pension, and insurance (private sector)

**Law:** Employees' Provident Funds and Miscellaneous Provisions Act, 1952 + EPF Scheme 1952, EPS 1995, EDLI Scheme 1976.

Three separate claims arise on one death — file **all three**:

| Benefit | Form | What it is | Notes |
|---|---|---|---|
| **EPF accumulated balance** | **Form 20** | The corpus | Payable to the registered nominee (EPF Scheme para 61). If no nomination, to legal heirs with succession documents. |
| **EPS-95 family pension** | **Form 10D** | Monthly widow/widower, children's, or orphan pension | "Family" is **statutorily defined** — nomination is irrelevant. Widow pension for life or until remarriage; children's pension for up to **2 children** until age 25. |
| **EDLI insurance** | **Form 5IF** | Group life cover, **up to ₹7 lakh** | Only if the member was **in employment and contributing at the time of death**. If they had left the job, the EDLI claim fails — a hard cliff. Minimum assured benefit applies for members with 12 months' continuous service. |

- **Filed through the last employer**, who certifies the forms. If the employer is defunct, the claim goes directly to the EPFO regional office with attestation by a bank manager, gazetted officer, or magistrate.
- **Documents:** death certificate, MCCD, nominee's Aadhaar and PAN (PAN needed above ₹50,000), cancelled cheque/passbook, deceased's UAN, nomination copy, and for pension a Form 10D with the widow's and children's details.
- **Timelines:** EDLI typically 30–45 days; pension PPO in 30–45 days with arrears, then monthly credit.
- **Also claim:** **gratuity** (below), leave encashment, salary dues, bonus, and any **employer group-term life / group medical** cover. And check whether the deceased's employer offers **compassionate appointment**.

### 7.5 Gratuity

- **Law:** Payment of Gratuity Act, 1972, **s. 4(1)(c)** and Payment of Gratuity (Central) Rules, 1972, **Rule 6 (Form F)**.
- **The 5-year continuous-service condition does NOT apply on death.** s. 4(1) proviso: gratuity is payable on death or disablement regardless of length of service. Employers wrongly refuse on this ground.
- **s. 4(1)(c):** payable to the **nominee**, or if no nomination, to the **heirs**. Where a nominee/heir is a **minor**, s. 4(4) requires the amount to be deposited with the **controlling authority**, who invests it for the minor's benefit until majority — the employer cannot pay it to a parent directly.
- Nomination in **Form F**, and an employee with a family must nominate **within the family** (Rule 6(3)); a nomination in favour of a non-family member becomes void if the employee later acquires a family.
- **Claim:** Form I (by employee), **Form J (by nominee)**, **Form K (by legal heir)**. Employer must pay **within 30 days**; delay attracts **simple interest** (s. 7(3A)).
- **Ceiling:** ₹20 lakh for private-sector employees under s. 4(3) (raised by notification; central government employees have a separate, higher ceiling). Gratuity received by heirs on death is **exempt from income tax** — see §9.
- Disputes go to the **Controlling Authority** (Assistant Labour Commissioner), then appeal to the Appellate Authority.

### 7.6 Government service — family pension and death gratuity

- **Law:** **Central Civil Services (Pension) Rules, 2021** (which consolidated and replaced the CCS (Pension) Rules, 1972); state equivalents (e.g. Karnataka Civil Services Rules) for state employees.
- **Family pension** at the enhanced rate for the first **10 years** from death (if the employee died in service), then the normal rate. "Family" is defined by rule — spouse first, then children in order, then dependent parents, then a disabled sibling; nomination does not determine this.
- **Death gratuity** is a separate lump sum, payable on a slab basis by length of service.
- Widow/widower's pension continues **for life**, including after remarriage in certain cases post-2021 liberalisation; a divorced or separated daughter and a disabled child may be eligible in specified circumstances.
- **CGEGIS** (Central Government Employees Group Insurance Scheme) and leave encashment are additional.
- **Compassionate appointment** schemes exist for a dependent family member.
- **NPS-covered government employees:** on death in service, the default is **annuity for the spouse** under the PFRDA framework — but the family may instead **opt for the old-pension-scheme family pension** benefits under CCS (Pension) Rules; there is a time-bound election. Get this right — the choice is worth lakhs and is frequently mishandled.

### 7.7 NPS, PPF, and small savings

| Instrument | Law | On death |
|---|---|---|
| **NPS** | PFRDA Act, 2013; **PFRDA (Exits and Withdrawals under NPS) Regulations, 2015** | Entire accumulated pension wealth paid to the nominee/legal heir. For **government-sector** subscribers dying in service, default annuity for the spouse unless the family elects otherwise. Claim via the nodal office / CRA (Protean, KFin). |
| **PPF** | **Public Provident Fund Scheme, 2019**, under the **Government Savings Promotion Act, 1873** | Paid to nominee(s) in the specified proportion; if no nomination and the balance exceeds the prescribed limit, a succession certificate or probate is needed. The account **cannot be continued** by the nominee — it is closed and paid out. Interest is paid up to the end of the preceding month of closure. |
| **Sukanya Samriddhi, NSC, KVP, SCSS, POMIS, Post Office deposits** | Government Savings Promotion Act, 1873, **ss. 6–8**; Government Savings Promotion General Rules, 2018 | s. 6 lets the depositor nominate; s. 7 governs payment to the nominee; **s. 8 allows summary payment without legal representation up to a prescribed limit** where there is no nomination. Above it: succession certificate/probate. |
| **Senior Citizens' Savings Scheme** | SCSS Rules, 2019 | Spouse who is a joint holder may continue the account; otherwise closed and paid to nominee. |

### 7.8 Others worth a checklist line

- **Employees' State Insurance:** **ESI Act, 1948, s. 52** — **dependants' benefit**, a monthly pension for the dependants of an insured person who dies of an employment injury. Plus funeral expenses under s. 46(1)(f).
- **Employee's Compensation Act, 1923:** **s. 4** — lump-sum compensation for death arising out of and in the course of employment, computed on the relevant factor in **Schedule IV**. Claim to the Commissioner for Employee's Compensation; s. 4A imposes interest and penalty for delayed payment. Applies where ESI does not.
- **Atal Pension Yojana, PMJJBY (₹2 lakh life cover), PMSBY (₹2 lakh accident cover):** low-value government schemes almost always forgotten. Claim through the bank where the account was held. PMJJBY/PMSBY premiums are auto-debited annually — check the bank statement for a ₹436 / ₹20 debit.
- **Credit cards and co-branded insurance:** many cards carry complimentary personal accident and air-accident cover.
- **Unclaimed deposits:** RBI's **UDGAM** portal (`udgam.rbi.org.in`) centralises unclaimed bank deposits transferred to the **Depositor Education and Awareness (DEA) Fund** under **Banking Regulation Act s. 26A**. Search it — dormant accounts of the deceased frequently surface here.

---

## 8. Phase 7 — Immovable property

### 8.1 The conceptual point: transmission is not transfer

On death, title in immovable property vests in the heirs/legatees **by operation of law, immediately**. No deed transfers it; there is nothing to "register" as a conveyance. What the family does afterwards is:

1. **Update the revenue/municipal record** — *mutation* (khata transfer). This is a **record of who pays tax**, not a title document. *Suraj Bhan v. Financial Commissioner*, (2007) 6 SCC 186 and a long line of cases: **mutation does not create or extinguish title.**
2. **Consolidate title** among multiple heirs — by **partition deed**, **relinquishment/release deed**, or **family settlement**. *These* are transfer instruments and **do** attract stamp duty and registration.

### 8.2 Mutation / khata transfer in Karnataka

| Property type | Authority | Provision | Process |
|---|---|---|---|
| **Agricultural / revenue land** | Village Accountant → Tahsildar | **Karnataka Land Revenue Act, 1964, s. 128** | Any person acquiring rights by **succession, survivorship, inheritance, partition or purchase** must **report to the Village Accountant within 3 months**. s. 129 provides for entry in the record of rights after notice to interested parties; **s. 133** makes the entries presumptive evidence. Non-reporting attracts penalty. |
| **BBMP / Greater Bengaluru urban property** | BBMP (now the Greater Bengaluru Authority corporations) | Karnataka Municipal Corporations Act, 1976, s. 114; BBMP khata rules | Khata transfer via the **e-Aasthi** portal. |
| **Other city corporations / CMC / TMC / panchayat** | Local body | KMC Act 1976 / Karnataka Municipalities Act 1964 / Karnataka Gram Swaraj and Panchayat Raj Act 1993 (Form 9/11 for panchayat properties) | Local process |

**Documents for a death-based khata transfer (Karnataka):**
- Death certificate of the registered owner (original + attested copy)
- **Legal Heir Certificate** from the Tahsildar (intestate) **or** the **will + probate/LoA where taken** (testate) **or** a **succession certificate/court decree** where there is a dispute
- **Family tree / Vamsha Vruksha certificate**
- Latest **tax paid receipts** and the existing khata extract / RTC (Pahani) for agricultural land
- **Encumbrance Certificate** (EC) for the relevant period
- Registered **relinquishment or partition deed**, where the heirs have consolidated title in one name
- Affidavit and indemnity; Aadhaar/PAN of applicants
- **Khata transfer fee** — typically **2% of the stamp duty value** in BBMP practice; verify the current e-Aasthi fee schedule

**Timeline:** 30–90 days in practice. **e-Aasthi** has been rolled out across BBMP zones and has made this faster and more traceable, but the Legal Heir Certificate remains the gating dependency.

### 8.3 Stamp duty — the distinction that decides the cost

| Instrument | Stamp duty (Karnataka) | Registration |
|---|---|---|
| **Transmission by inheritance itself** | **Nil** — no instrument, no duty. Death is not a transfer for stamp purposes. | Not applicable |
| **Will** | **Nil** (no article in Schedule charges a will) | **Optional** — Registration Act s. 18(e) |
| **Probate / Letters of Administration** | Court fee ad valorem, not stamp duty | — |
| **Release / relinquishment deed among family members** | **Concessional** — Karnataka Stamp Act, 1957, Schedule Art. 52: a nominal/reduced duty where the release is **in favour of a family member** (verify the current rate and the definition of "family" in the Art. 52 explanation) | **Mandatory** — Registration Act s. 17 |
| **Partition deed among family members** | Concessional under **Art. 40** of the Karnataka Stamp Act — a fixed amount per share for non-agricultural/agricultural land in specified cases | **Mandatory** |
| **Gift deed to a family member** | Concessional under **Art. 28** | **Mandatory** |
| **Family settlement of a bona fide existing dispute** | Arguably nil if it merely records pre-existing rights and creates no new transfer — but the position is fact-sensitive and sub-registrars often disagree | Prudent to register |

> **Get this right.** The single most expensive avoidable error is executing a **sale deed or a full-rate conveyance** between heirs when a **concessional release or partition deed** would have done. Confirm the current Karnataka Stamp Act rates with the sub-registrar or a documentation lawyer before drafting — Schedule rates are amended almost every budget.

### 8.4 Cooperative housing societies

- **Law:** state cooperative societies Acts — **Karnataka Co-operative Societies Act, 1959**, ss. 30–31 and the Rules; in Maharashtra, MCS Act 1960 s. 30 and the model byelaws.
- On death, the society transfers the shares and interest to the **nominee**, or if none, to the person appearing to the committee to be the heir/legal representative.
- **Crucially:** as with all nominations, the society nominee holds **for the heirs** — the transfer of society shares does **not** determine ownership of the flat. *Indrani Wahi v. Registrar of Cooperative Societies*, (2016) 6 SCC 440: the society **must** transfer to the nominee, but that transfer does not confer title against the heirs, who may pursue their rights.
- Societies routinely demand probate. Post-deletion of ISA s. 213 they are on weaker footing, but expect resistance; an indemnity + NOC from all heirs is usually the pragmatic path.

### 8.5 Tenancy and rent

- **Rented home, deceased was the tenant:** most state rent control Acts provide for **heritability of tenancy** by family members ordinarily residing with the tenant at the time of death — e.g. Karnataka Rent Act, 2001, s. 5; Delhi Rent Control Act s. 2(l). A landlord cannot simply evict the family. Statutory tenancy is heritable, but often only for a limited period and only for co-residing family.
- **Deceased was the landlord:** the heirs step in as landlords; the tenancy continues on the same terms. Rent is payable to the estate/heirs. A fresh agreement is advisable but the tenancy does not terminate on the landlord's death (Transfer of Property Act, 1882, s. 109 — transferee of the lessor's interest takes the rights).
- **Deposits** held by the deceased landlord are an estate liability.

### 8.6 Agricultural land — check state ceilings and restrictions

- **Karnataka Land Reforms Act, 1961:** ceiling limits on agricultural holdings still apply, and inheritance can push an heir over the ceiling — surplus land is liable to be surrendered. The 2020 amendment removed the requirement that a purchaser be an agriculturist, but ceiling provisions and s. 79A/79B history still matter for older transactions.
- **Karnataka SC/ST (PTCL) Act, 1978** — granted land held by SC/ST persons cannot be alienated; devolution is restricted.
- **Tenancy under Karnataka Land Reforms Act Part III** — heritability of occupancy rights follows the Act, not the general HSA.
- **Fragmentation:** several states restrict subdivision below a minimum holding; an heir-wise partition may not be registrable.

---

## 9. Phase 8 — Tax

> **Change of law.** The **Income-tax Act, 2025** replaced the Income-tax Act, 1961 **with effect from 1 April 2026**. Section numbers have changed comprehensively. **Section 159 of the 1961 Act (liability of legal representatives) is now Section 302 of the 2025 Act.** For AY 2026-27 and later, cite the 2025 Act. Where I give a 1961-Act section below without a 2025 equivalent, treat the number as **needing verification** against the new Act — the substantive rule is stable, the numbering is not.

### 9.1 There is no inheritance or estate tax in India

- The **Estate Duty Act, 1953 was abolished with effect from 16 March 1985.** No estate duty, no inheritance tax, no succession tax on the transmission itself.
- The **Gift Tax Act, 1958** was abolished in 1998; gift taxation now sits in the income-tax charge on the recipient.
- **Property received under a will or by inheritance is expressly exempt** from the "income from other sources" charge on gratuitous receipts — the proviso to what was **s. 56(2)(x)** of the 1961 Act (now the corresponding provision of the 2025 Act) excludes property received **under a will or by way of inheritance**, and also on the death of the payer/donor. So inheriting a flat worth ₹5 crore triggers **no** tax on receipt.
- **What IS taxed:** income *from* the inherited asset after the date of death, and capital gains when the heir eventually sells.

### 9.2 The final return of the deceased

- **Charge:** **Income-tax Act, 2025, s. 302** (was 1961 Act s. 159) — the **legal representative** is liable to pay any sum the deceased would have been liable to pay, in the same manner and to the same extent, and is deemed to be an assessee. Assessment and reassessment proceedings may be commenced against or continued against the legal representative.
- **Liability is capped at the estate.** The legal representative's liability is limited to the extent to which the **estate is capable of meeting** it. Personal assets of the heir are not exposed.
- **Two income streams, two returns:**

| Period | Whose income | Filed how |
|---|---|---|
| **1 April → date of death** | The **deceased's** income | ITR in the **deceased's name and PAN**, filed by the registered legal heir |
| **Date of death → 31 March** | The **heirs'** income (or the **estate's**, if under administration) | In the heirs' own returns, in proportion to their shares — or by the **executor** where the estate is still being administered (was 1961 Act s. 168) |

- **Registering as legal heir on the e-filing portal** (`incometax.gov.in`):
  1. Log in with the **legal heir's own PAN**
  2. **Authorised Partners → Register as Representative Assessee**
  3. Category: **Deceased (Legal Heir)**; create a new request
  4. Upload: death certificate, PAN card of the deceased, PAN of the legal heir, **legal heir proof** (legal heir certificate / surviving-member certificate / registered will / family pension certificate / affidavit before an oath commissioner), and the **order of appointment of legal representative** if any
  5. Wait for departmental approval; then switch to the representative-assessee profile and file
- **All heirs need not register** — one representative assessee files. But all heirs share the tax liability proportionately.
- **Deductions and exemptions** (80C/80D-equivalents, or the new-regime slabs) are available in the deceased's final return in full — not pro-rated for the part-year. The **basic exemption limit is not pro-rated** either.
- **Refunds** due to the deceased are credited to the legal heir's registered bank account.
- **TDS mismatches** are the commonest snag: interest credited after the date of death may still be reported against the deceased's PAN in Form 26AS/AIS. Reconcile the AIS and, where necessary, get the payer to correct the TDS return — or claim the credit and explain.
- **Reassessment nuance worth knowing:** a notice issued **to a dead person** is generally invalid; but where the notice was validly issued during the assessee's lifetime, the department may continue against the legal representative under s. 302 (Delhi HC line of authority on erstwhile s. 159).

### 9.3 Capital gains when the heir sells

- **Cost of acquisition = the previous owner's cost** — 1961 Act **s. 49(1)** (verify the 2025 Act equivalent). The heir does **not** get a step-up to the date-of-death value.
- **Period of holding includes the previous owner's holding period** — Explanation to 1961 Act **s. 2(42A)**. So a flat the parent bought in 1995 and the child sells in 2026 is **long-term** for the child from day one.
- **Property acquired before 1 April 2001:** the **fair market value as on 1 April 2001** may be substituted for cost, at the assessee's option. Get a registered-valuer report; you will need it.
- **Indexation:** the **Finance (No. 2) Act, 2024** removed indexation for most assets from 23 July 2024 and set LTCG at **12.5% without indexation** — with a grandfathering option for **resident individuals and HUFs** on **land and buildings acquired before 23 July 2024**, who may compute tax at the lower of 12.5% without indexation or **20% with indexation**. This grandfathering matters enormously for inherited ancestral property. Confirm the current position for the relevant AY.
- **Exemptions still available** to the heir-seller: reinvestment reliefs (erstwhile ss. 54, 54EC, 54F) apply on the same terms.
- **Jointly inherited property:** each heir computes gains on their own share; a single sale deed does not make it one assessee's gain.

### 9.4 Other tax points

- **Gratuity, EPF, EDLI, family pension, and life insurance proceeds received on death:** broadly exempt. Life insurance proceeds on death are exempt without the premium-to-sum-assured conditions that apply to maturity proceeds. **Commuted family pension** received by the family is exempt; **uncommuted family pension** is taxable as "income from other sources" with a standard deduction of one-third or a capped amount — verify the current cap under the 2025 Act.
- **HUF:** if the deceased was the **karta**, the HUF continues; the next senior-most coparcener becomes karta. A **female coparcener can be karta** — *Sujata Sharma v. Manu Gupta*, 2015 (Delhi HC), and the position is now widely accepted post-*Vineeta Sharma*. The HUF's PAN and returns continue; no dissolution occurs on the karta's death.
- **Clubbing / representative assessment:** income of a minor heir is clubbed with the surviving parent's income in most cases.
- **GST / business:** if the deceased ran a registered business, the legal heir must apply for **transfer of GST registration on death** — **CGST Act, 2017, s. 29(1)(a)** (cancellation on death) and **s. 18(3)** / Rule 41 (transfer of unutilised ITC to the transferee). File **Form GST ITC-02**. The successor takes a **fresh registration** and the deceased's registration is cancelled; the legal representative is liable for the deceased's GST dues under **s. 93**.
- **Professional practice / partnership:** a partnership is **dissolved** on a partner's death unless the deed provides otherwise — Indian Partnership Act, 1932, **s. 42(c)**. Check the deed. An LLP continues.
- **Company directorship:** vacates on death; the company must file **Form DIR-12** within 30 days. If the deceased was the **sole director of a One Person Company**, the **nominee named in the OPC's memorandum** becomes the member — Companies Act, 2013, **s. 3(1)** proviso and s. 4(1)(f). If the deceased was the sole director of a private company, the remaining members must appoint a director; **Companies Act s. 152** and Rule 4 mechanics apply, and in a total-vacancy case the Tribunal's route may be needed.

---

## 10. Phase 9 — Identity, digital, and closures

### 10.1 Government IDs

| Document | Action | Authority / law |
|---|---|---|
| **PAN** | **Surrender** after the final ITR is filed and refunds received. Write to the jurisdictional Assessing Officer with the death certificate, the PAN card, and a copy of the final return. **Do not surrender early** — you need the PAN to file. | Income-tax Act, 2025; Income-tax Rules |
| **Aadhaar** | There is **no "deletion" of an Aadhaar number**. UIDAI **deactivates** the Aadhaar of a deceased person; the mechanism runs off the **RBD Act death registration** — the 2023 amendment expressly contemplates using the death database to update Aadhaar. UIDAI has also enabled a family-reported deactivation route via `myaadhaar.uidai.gov.in`. **Never let anyone continue using it** — that is an offence under **Aadhaar Act, 2016, s. 34/35**. | Aadhaar Act, 2016; UIDAI regulations |
| **Passport** | Surrender to the Regional Passport Office with the death certificate for cancellation. | Passports Act, 1967 |
| **Voter ID / electoral roll** | Apply for **deletion in Form 7** to the Electoral Registration Officer. The 2023 RBD amendment also feeds the death record to electoral registration authorities. | Representation of the People Act, 1950, s. 22; Registration of Electors Rules, 1960 |
| **Driving licence** | Surrender to the RTO. | Motor Vehicles Act, 1988 |
| **Ration card** | Remove the member; the card may need to be re-issued in the survivor's name. | NFSA, 2013 + state PDS rules |
| **Gas connection, electricity, water, property tax** | Transfer to a survivor; each utility has a name-transfer form requiring the death certificate + legal heir proof + NOC from other heirs. | Utility byelaws |

### 10.2 Vehicle transfer — Motor Vehicles Act, 1988, s. 50(2)

The two-step clock catches people out:

1. **Within 30 days of the death:** the person succeeding to possession of the vehicle must **inform the registering authority** of the death **and of their intention to use the vehicle**. Having done so, they may **use the vehicle for three months** as if it had been transferred to them.
2. **Within 30 days of the expiry of that three-month period:** apply to the registering authority in the **prescribed form for transfer of ownership** into their name.

- **Form:** **Form 31** under the **Central Motor Vehicles Rules, 1989, Rule 56**, with the death certificate, RC, valid insurance, PUC, Form 30, and a legal heir certificate / succession certificate / NOC from other heirs.
- **Insurance must be transferred too** — a policy in the deceased's name may not respond to a claim by the new owner. Motor insurance transfer on death is time-bound; notify the insurer immediately.
- **Driving the vehicle without doing step 1** exposes the family to prosecution and, worse, to an uninsured-driving position after an accident.

### 10.3 Digital assets — a genuine legal gap

**There is no Indian statute governing digital inheritance.** This is the least-developed area in the whole framework:

- **Digital Personal Data Protection Act, 2023 (DPDP Act):** "Data Principal" under **s. 2(j)** means the individual to whom personal data relates — and includes, for a child, the parent/lawful guardian, and for a person with disability, their guardian. **The Act does not clearly extend rights to the heirs of a deceased Data Principal.** There is no statutory right of access, portability, or erasure exercisable by a family after death. The **DPDP Rules, 2025** (notified 2025, phased implementation) do provide for a Data Principal to **nominate** another individual to exercise their rights **in the event of death or incapacity** — check the notified rule text and its commencement date, because this is the closest thing India has to statutory digital-estate succession and it is very new.
- **Platform policies fill the vacuum,** and they are contractual, not statutory:
  - Google **Inactive Account Manager** (set up in advance) and a post-mortem data request process
  - Apple **Legacy Contact** (iOS 15.2+) — genuinely effective if configured before death
  - Meta/Facebook and Instagram: **memorialisation** or deletion by a verified family member; **Legacy Contact** for Facebook
  - Microsoft, LinkedIn, X: closure on request with a death certificate
  - **Most platforms will delete but not hand over content**, absent a court order
- **Crypto:** if the seed phrase is lost, the asset is **irrecoverable by any legal process**. No court can order a blockchain to move funds. This is the one asset class where pre-death planning is the *only* remedy. Exchange-held crypto (WazirX, CoinDCX, Binance) has a nominee/claim process. Note the tax position — VDA gains taxed at a flat rate with no set-off, under the erstwhile s. 115BBH regime; verify the 2025 Act equivalent.
- **Practical closure list:** email, cloud storage, password manager, domain registrations, UPI handles and payment apps, subscription services (recurring debits keep running for months — check the bank statement and the card's standing instructions), SIM (surrender to the telecom operator with the death certificate; **do not let it lapse before the SIM is de-linked from bank OTPs**), social media, cloud photo libraries.

> **Order of operations trap.** Do **not** surrender the SIM before closing the bank accounts and filing the ITR — the mobile number is the OTP anchor for the bank, the e-filing portal, and the DigiLocker. Close the SIM last.

### 10.4 Other closures

- **Insurance policies (health, motor, home):** claim or cancel; pro-rata refunds may be due.
- **Standing instructions / ECS mandates / UPI autopay:** revoke at the bank. Recurring debits are a real and recurring loss.
- **Credit cards:** notify the issuer, settle the outstanding from the estate, close. **Check for complimentary insurance** before closing.
- **Employer:** final settlement, Form 16 for the part year, gratuity, leave encashment, group insurance, PF transfer/withdrawal, and any **compassionate appointment** entitlement.
- **Clubs, professional bodies, memberships:** transferable in some cases (a club membership may be a valuable transmissible asset — check the byelaws).
- **Locker keys, safe deposit, physical documents:** inventory formally with witnesses; §7.1.

---

## 11. Special situations

### 11.1 Accidental death

**Road accident — Motor Vehicles Act, 1988:**
- **s. 166:** claim before the **Motor Accidents Claims Tribunal (MACT)** for compensation, by the legal representatives of the deceased. Compensation is computed on the **multiplier method** — *Sarla Verma v. DTC*, (2009) 6 SCC 121, as refined by the Constitution Bench in ***National Insurance Co. v. Pranay Sethi***, (2017) 16 SCC 680 (future prospects: **+40%** if the deceased was below 40 and in permanent employment, +30% for 40–50, +15% for 50–60; conventional heads of ₹15,000 / ₹40,000 / ₹15,000 for loss of estate, consortium and funeral expenses, escalating 10% every 3 years).
- **s. 164** (inserted by the **Motor Vehicles (Amendment) Act, 2019**, which **omitted the old s. 163A** and the s. 140 no-fault scheme): a **fixed ₹5,00,000 for death** on a no-fault basis, and ₹2,50,000 for grievous hurt. The claimant elects between s. 164 (fixed, quick, no proof of negligence) and s. 166 (fault-based, potentially far larger).
- **s. 161:** hit-and-run compensation from the Solatium Fund.
- **s. 164B:** Motor Vehicle Accident Fund.
- **s. 166(3) — the six-month limitation, and a live caveat.** The 2019 amendment reinstated a **six-month limitation** for MACT claims, effective **1 April 2022**. **The Supreme Court has stayed the operation of s. 166(3)** pending a challenge to its constitutional validity, directing that tribunals and High Courts must not reject claims **solely** on the ground of delay. **Do not rely on the stay — file within six months.** But an older claim is not necessarily dead; check the current status of the challenge.
- **s. 134:** duty of the driver/owner to report the accident and secure medical aid; **s. 158(6)** requires the police to forward the accident information report to the MACT within 30 days, which triggers a **suo motu** claim proceeding — families often do not realise a claim may already be on file.
- Also claim on the deceased's **own motor policy** if they were the owner-driver — the compulsory personal accident cover.

**Death at work:**
- **ESI-covered employee:** ESI Act, 1948, **s. 52** dependants' benefit (monthly) + funeral expenses under s. 46(1)(f).
- **Not ESI-covered:** **Employee's Compensation Act, 1923, s. 4** lump sum, before the Commissioner for Employee's Compensation. **s. 4A(3)** — interest at 12% plus penalty up to 50% for unjustified delay.
- **Factories Act, 1948, s. 88** — mandatory notice of a fatal accident to the Inspector of Factories; a **s. 90** inquiry may follow. **Building and Other Construction Workers Act, 1996** for construction deaths, with cess-funded welfare board benefits.
- **Mines Act, 1952** for mining deaths.
- The employee's family may pursue **both** statutory compensation **and** a civil/tortious claim, though not double recovery for the same head.

**Medical negligence:** a complaint under the **Consumer Protection Act, 2019** (deficiency in service — a patient is a consumer, *Indian Medical Association v. V.P. Shantha*, (1995) 6 SCC 651), or a civil suit, or a criminal complaint under **BNS s. 106** (causing death by negligence — the *Jacob Mathew v. State of Punjab*, (2005) 6 SCC 1 safeguards apply to doctors), or a complaint to the State Medical Council.

**Public disaster / calamity:** ex gratia under the **Disaster Management Act, 2005** and the SDRF/NDRF norms; relaxed proof-of-death procedures are usually notified for such events.

### 11.2 Missing person presumed dead

- **Bharatiya Sakshya Adhiniyam, 2023, s. 111** (replacing Indian Evidence Act, 1872, **s. 108**): where a person **has not been heard of for seven years** by those who would naturally have heard from them if alive, the **burden of proving that they are alive shifts** to the person asserting it. (BSA s. 110, replacing IEA s. 107, deals with the converse presumption of continuance of life within 30 years.)
- **This is a rule of evidence, not an automatic death certificate.** The family typically must:
  1. File a **missing person FIR** immediately, and obtain a **non-traceable certificate** from the police (usually after a year)
  2. After **seven years**, file a **civil suit / petition for a declaration of presumed death**, or seek a succession certificate/LoA in which the presumption is pleaded
  3. On a court declaration, apply for **death registration** under **RBD Act s. 13(3)** with the Magistrate's order
- **Seven years is the general rule, not an absolute one.** Where the circumstances make death virtually certain — a shipwreck, an air crash, a natural disaster, an avalanche — courts and administrative authorities have accepted a shorter period, and governments routinely notify special relaxations for identified disasters. The Supreme Court has also emphasised that the presumption is rebuttable and the *date* of death is not fixed by the presumption (*LIC v. Anuradha*, (2004) 10 SCC 131 — significant for insurance, because the date of death determines whether the policy was in force).
- **Insurance and banks** will generally not pay before a court declaration, though some insurers have relaxed processes for notified disasters.

### 11.3 Minor heirs

- A minor cannot hold or deal with property independently. The **natural guardian** under **Hindu Minority and Guardianship Act, 1956, s. 6** is the father, and after him the mother (for a minor's person and property, other than undivided family interest). For Muslims, the guardianship rules of the relevant school; for others, the **Guardians and Wards Act, 1890**.
- **HMGA s. 8: the natural guardian CANNOT, without the previous permission of the court, mortgage, charge, sell, gift, exchange or otherwise transfer any part of the minor's immovable property, or lease it for more than five years or beyond one year past the minor's majority.** A transaction in breach is **voidable at the instance of the minor** — which means a purchaser from a guardian without court permission has a defective title, and the minor can set it aside for **three years after attaining majority** (Limitation Act, Art. 60). This is a live title risk on inherited property.
- **Gratuity:** where the nominee/heir is a minor, s. 4(4) of the Payment of Gratuity Act requires deposit with the **controlling authority**, not payment to the parent. §7.5
- **Bank accounts:** operated by the guardian; banks require guardianship documentation.
- **Practical:** where minor heirs are involved, a court-supervised route (probate/LoA with the minor represented, or a guardianship petition) is usually unavoidable and is worth doing properly the first time.

### 11.4 No heirs at all — escheat

- **Hindu:** **HSA s. 29** — the property devolves on the **Government**, which takes it as an heir, **subject to the obligations and liabilities** of a heir.
- **Others:** the **Government takes by escheat** as *bona vacantia*; **Constitution Art. 296** vests such property in the Union or the State as the case may be.
- The State must ordinarily establish escheat affirmatively; courts require strict proof that no heir exists.

### 11.5 Cross-border and NRI estates

- **Immovable property is governed by the *lex situs*** — the law of the place where the property is. An Indian flat devolves under Indian law regardless of where the deceased lived or died.
- **Movable property is governed by the law of the deceased's domicile at death** — ISA **ss. 5, 6**. This creates a genuine split: an NRI's Indian flat under Indian law, their movables under the law of their domicile.
- **Foreign wills and grants:** ISA **s. 228** allows a will already proved and deposited in a court of competent jurisdiction outside India to be the basis for **letters of administration** in India on production of an authenticated copy. A foreign probate is **not directly enforceable**; you re-establish it here.
- **Foreign death certificates:** need apostille (Hague Convention, to which India is a party) or consular attestation, plus certified translation. Note that **SEBI's July 2026 framework now mandates acceptance of overseas death certificates** for securities transmission (§7.3).
- **Repatriation of inheritance abroad:** **FEMA, 1999** + **Foreign Exchange Management (Remittance of Assets) Regulations, 2016** — an NRI/PIO may remit up to **USD 1 million per financial year** out of inherited assets or the sale proceeds of inherited property, on production of **Form 15CA/15CB** and documentary proof of inheritance (will/succession certificate/legal heir certificate). Beyond that, RBI approval.
- **NRO/NRE accounts:** balances in an NRO account of the deceased are remittable within the USD 1 million limit; NRE/FCNR balances are freely repatriable.
- **Agricultural land, plantation property and farmhouses:** an NRI/OCI may **inherit** these (inheritance is permitted) but **cannot purchase** them, and there are restrictions on onward transfer to another non-resident.
- **US/UK estate tax exposure:** India has no inheritance tax, but a deceased with US-situs assets may face **US estate tax** (with a very low exemption for non-domiciliaries), and a UK-domiciled deceased faces **UK IHT** on worldwide assets. The India–US and India–UK DTAAs do not cover estate taxes. Get cross-border advice; families are frequently blindsided here.

### 11.6 Second marriages, live-in relationships, and children outside marriage

- **Bigamous second marriage (Hindu):** void under **Hindu Marriage Act, 1955, s. 5(i) + s. 11**. The second "wife" is **not a widow** and does **not** inherit as a Class I heir. But **children of a void or voidable marriage are legitimate** under **HMA s. 16**, and inherit from their parents. Post-*Revanasiddappa v. Mallikarjun*, 2023 INSC 783 (Constitution Bench), such children also take a share in the parent's **coparcenary/ancestral** property through the parent's notional share — a significant expansion.
- **Live-in partner:** **no inheritance right** in India. A long-term live-in partner may claim **maintenance** under the **Protection of Women from Domestic Violence Act, 2005** (a relationship "in the nature of marriage" — *D. Velusamy v. D. Patchaiammal*, (2010) 10 SCC 469 criteria), and courts have occasionally presumed marriage from long cohabitation, but there is no succession right as such. A **will or nomination is the only reliable protection** for a live-in partner.
- **Muslim second/subsequent wives:** all lawful wives share the wife's collective 1/8 or 1/4 share.
- **Divorced spouse:** does not inherit. Ensure nominations are updated after divorce — a stale nomination in favour of an ex-spouse on a life policy where they were a spouse at nomination raises genuinely difficult questions under s. 39(7).
- **Adopted children:** an adoption validly made under the **Hindu Adoptions and Maintenance Act, 1956** or the **Juvenile Justice (Care and Protection of Children) Act, 2015** gives the child the **same rights as a biological child** (HAMA s. 12) — but the adopted child **loses** rights in their natural family, save for property already vested in them. Muslim law does not recognise adoption for succession.
- **Stepchildren:** do **not** inherit from a step-parent under the HSA unless adopted.

---

## 12. State variation — what changes by state

Central law governs succession, wills, tax, banking, insurance, securities and death registration. **State law governs:**

| Area | Governed by | Karnataka example |
|---|---|---|
| **Stamp duty on partition / release / gift deeds** | State Stamp Act or state amendments to the Indian Stamp Act, 1899 | Karnataka Stamp Act, 1957 — Arts. 28, 40, 52 |
| **Court fee on probate / LoA / succession certificate** | State Court Fees Act | Karnataka Court Fees and Suits Valuation Act, 1958 |
| **Mutation / land records** | State land revenue Act | Karnataka Land Revenue Act, 1964, ss. 128–133 |
| **Municipal khata / property tax transfer** | State municipal Act + local byelaws | Karnataka Municipal Corporations Act, 1976; BBMP **e-Aasthi** |
| **Legal heir / family membership certificate** | State revenue rules — **no central statute** | Tahsildar via **Nadakacheri** / Seva Sindhu |
| **Agricultural land ceiling, tenancy, restrictions on alienation** | State land reform Acts | Karnataka Land Reforms Act, 1961; **PTCL Act, 1978** |
| **Cooperative housing society transfer** | State cooperative societies Act | Karnataka Co-operative Societies Act, 1959 |
| **Rent control / heritability of tenancy** | State rent Act | Karnataka Rent Act, 2001 |
| **Burial grounds, crematoria, disposal of bodies** | State/municipal law | KMC Act, 1976 + BBMP/GBA byelaws |
| **Whole-body donation** | State Anatomy Act | Karnataka Anatomy Act, 1957 |
| **State government employee pension** | State civil service rules | Karnataka Civil Services Rules |

**States that are genuinely different, not just differently priced:**
- **Goa, Daman & Diu:** **Portuguese Civil Code, 1867** — community of property, forced heirship, mandatory inventory proceedings on death. Completely different framework; do not apply mainland law.
- **Jammu & Kashmir and Ladakh:** post-2019 reorganisation, central laws including the HSA and ISA now apply, replacing the erstwhile state succession Acts. Land laws remain distinctive.
- **Kerala:** *Mary Roy* consequences for Syrian Christian succession (§4.3); the Kerala Joint Hindu Family System (Abolition) Act, 1975 abolished joint family property in Kerala — so HSA s. 6 coparcenary analysis does **not** apply to Kerala Hindus.
- **Puducherry:** French Civil Code applies to some *renonçant* families.
- **North-eastern states and Scheduled Areas:** Sixth Schedule autonomy, tribal custom, and matrilineal systems (Khasi, Garo, Jaintia in Meghalaya) — succession follows custom, often through the youngest daughter.
- **Tamil Nadu, Andhra Pradesh, Karnataka, Maharashtra:** each had a **pre-2005 state amendment** to HSA s. 6 giving daughters coparcenary rights (Andhra 1986, Tamil Nadu 1989, Karnataka **1994**, Maharashtra 1994). For deaths and partitions in the window between the state amendment and 9 September 2005, the **state amendment** may govern and produce a different result. Check the date.

---

## 13. Traps where families lose money (or years)

1. **Registering the death after 21 days.** Crosses into late-fee territory; after a year you need a **Magistrate's order**. Nothing downstream moves without the certificate. Do this first.
2. **Getting only one or two copies of the death certificate.** Every institution wants an original or attested copy. Get 6–10 at the outset.
3. **Cremating before the police NOC in an unnatural death.** Blocks the post-mortem, and with it the insurance and MACT claims, permanently.
4. **Assuming the nominee owns the money.** True only for life insurance to a spouse/parent/child. Everywhere else the nominee is a trustee — and keeping the money invites a suit. (§6)
5. **Assuming the father is a Class I heir under the HSA.** He is not. The mother is. (§4.1.1)
6. **Applying HSA s. 8 to a woman's estate.** Her succession runs under **s. 15**, where her **husband's heirs come before her own parents**. (§4.1.2)
7. **Applying representation to a Sunni Muslim estate.** A predeceased son's children are **excluded** by a surviving son. There is no branch share. (§4.2.3)
8. **Forgetting the widow's unpaid mahr.** It is a **debt of the estate**, ranking ahead of all heirs. (§4.2.1)
9. **A will with only one attesting witness.** Fails under ISA s. 63. Two witnesses, each having seen the testator sign.
10. **A Hindu willing away coparcenary property.** Only the notional share is disposable. The rest devolves regardless.
11. **A Muslim will exceeding one-third.** Void beyond 1/3 unless the other heirs consent after death.
12. **Paying probate court fees you no longer have to pay.** ISA s. 213 was **deleted in December 2025** — probate is optional. Push back when a bank or society insists reflexively; SEBI has already dropped it for uncontested securities claims. (§5.3)
13. **Executing a sale deed between heirs** where a concessional **partition or release deed** would do. The stamp duty difference is often lakhs. (§8.3)
14. **Treating khata/mutation as title.** It is a tax record. It does not settle ownership. (§8.1)
15. **Missing the EDLI claim because the deceased had left the job.** EDLI only covers members contributing **at the time of death**. File immediately; the cliff is real. (§7.4)
16. **Missing gratuity because "he hadn't completed five years."** The five-year rule **does not apply on death**. (§7.5)
17. **Choosing the wrong option for a government NPS subscriber's family.** The default annuity versus the old-scheme family pension election is time-bound and worth lakhs. (§7.6)
18. **Missing the MACT six-month window.** Reinstated from 1 April 2022 and currently stayed by the Supreme Court — but file within six months anyway. (§11.1)
19. **Missing the vehicle transfer clock.** Inform the RTO within **30 days** of the death; apply for transfer within **30 days after the three-month use period** ends. And transfer the insurance. (§10.2)
20. **Surrendering the SIM before closing the bank accounts.** The mobile number is the OTP anchor for the bank, the e-filing portal and DigiLocker. Close it last. (§10.3)
21. **Surrendering PAN before filing the final ITR.** You need it to file and to receive the refund. (§10.1)
22. **Letting standing instructions and subscriptions run.** Recurring debits continue for months after death. Audit the bank statement line by line.
23. **Expecting a step-up in the cost of inherited property.** The heir inherits the **previous owner's cost** and holding period. Budget for the capital gains. (§9.3)
24. **Selling a minor heir's share without court permission.** Void at the minor's option under **HMGA s. 8** for three years after majority. A real title defect. (§11.3)
25. **Losing crypto seed phrases.** No court, anywhere, can recover them. Only pre-death planning works. (§10.3)
26. **Not searching for forgotten assets.** RBI **UDGAM** (unclaimed deposits), **IEPF** (unclaimed shares and dividends), insurer unclaimed-amount portals, old PPF and post office accounts, PMJJBY/PMSBY auto-debits. Substantial sums sit unclaimed.
27. **Not checking for loan protection insurance** on the deceased's home loan. Many carry credit-life cover that extinguishes the debt.
28. **Assuming heirs owe the deceased's debts personally.** Liability is capped at the estate inherited. Recovery agents who imply otherwise are wrong.

---

## 14. Master statute index

### Death, body, and registration
| Statute | Key provisions |
|---|---|
| **Registration of Births and Deaths Act, 1969** (as amended by **Act 20 of 2023**, in force 1 Oct 2023) | s. 8 (who reports), s. 10 (MCCD), s. 13 (delayed registration), s. 12/17 (certificate) |
| **Bharatiya Nagarik Suraksha Sanhita, 2023** (replaced CrPC w.e.f. 1 July 2024) | **s. 194** (police inquest, unnatural death), **s. 196** (magisterial inquiry — custodial death, woman's death within 7 years of marriage) |
| **Bharatiya Nyaya Sanhita, 2023** (replaced IPC) | s. 80 (dowry death), s. 106 (death by negligence), s. 108 (abetment of suicide) |
| **Bharatiya Sakshya Adhiniyam, 2023** (replaced Evidence Act) | **s. 111** (presumption of death after 7 years), s. 118 (presumption as to dowry death) |
| **Transplantation of Human Organs and Tissues Act, 1994** (amd. 2011) + Rules 2014 | s. 2(i) (near relative), s. 3 (authority for removal; brain-stem death board), s. 5 (unclaimed bodies), s. 6 (medico-legal cases) |
| State **Anatomy Acts** | Whole-body donation |

### Succession
| Statute | Key provisions |
|---|---|
| **Hindu Succession Act, 1956** (amd. 2005) | s. 2(2) (STs excluded), s. 4, **s. 6** (coparcenary; daughters), **s. 8** + Schedule (male intestate, Class I/II), s. 10 (distribution), ss. 12–13 (agnates/cognates), **s. 14** (women's absolute property), **ss. 15–16** (female intestate), ss. 25–28 (disqualifications), **s. 29** (escheat) |
| **Indian Succession Act, 1925** | ss. 5–6 (domicile), ss. 31–49 (Christians etc.), ss. 50–56 (Parsis), **ss. 57–91** (wills; **s. 59** capacity, **s. 63** execution, ss. 65–66 privileged wills), **s. 213 — DELETED by the Repealing and Amending Act, 2025 (assent 20 Dec 2025)**, ss. 222–232 (probate/LoA), s. 228 (foreign grants), s. 276 (petition), ss. 316–331 (administration), **ss. 370–390** (succession certificates) |
| **Muslim Personal Law (Shariat) Application Act, 1937** | **s. 2** (application of Muslim law) |
| **Special Marriage Act, 1954** | **s. 21** (ISA applies), **s. 21A** (exception for Hindu/Buddhist/Sikh/Jain couples) |
| **Hindu Marriage Act, 1955** | s. 5(i), s. 11 (void bigamous marriage), **s. 16** (legitimacy of children of void marriages) |
| **Hindu Adoptions and Maintenance Act, 1956** | s. 12 (adopted child's rights), **ss. 21–22** (maintenance of dependants out of the estate) |
| **Hindu Minority and Guardianship Act, 1956** | s. 6 (natural guardian), **s. 8** (court permission for dealing with a minor's immovable property) |
| **Guardians and Wards Act, 1890** | Non-Hindu guardianship |
| **Caste Disabilities Removal Act, 1850** | Convert's own right to inherit preserved |
| **Portuguese Civil Code, 1867** | Goa, Daman & Diu |
| **Repealing and Amending Act, 2025** | Deleted ISA s. 213 |
| **Constitution of India** | **Art. 296** (escheat/bona vacantia), Art. 21 (dignified last rites) |
| **Registration Act, 1908** | **s. 17** (compulsory registration — partition, release, gift), **s. 18(e)** (registration of a will is optional) |
| **Indian Stamp Act, 1899** / state Stamp Acts | Duty on partition, release, gift; **nil on a will** |

### Financial assets
| Statute / instrument | Key provisions |
|---|---|
| **Banking Regulation Act, 1949** | **ss. 45ZA–45ZC** (deposit nomination), **ss. 45ZD–45ZF** (locker/safe custody nomination), **s. 26A** (DEA Fund) |
| **Banking Laws (Amendment) Act, 2025** | **Up to 4 nominees**, simultaneous or successive; **in force 1 Nov 2025** |
| **RBI (Settlement of Claims in respect of Deceased Customers of Banks) Directions, 2025** — RBI/2025-26/82, 26 Sep 2025, mandatory by 31 Mar 2026 ✅ *primary-source verified* | **₹15 lakh** simplified threshold (commercial) / **₹5 lakh** (cooperative); **no succession certificate, probate or indemnity from a nominee/survivor at any amount**; **15 calendar day** settlement; Annexes I-A to I-H standard formats; missing persons via **BSA ss. 110/111** (or FIR + non-traceable report under ₹1 lakh); **SCSS/PPF excluded** |
| **RBI** Revised Locker / Safe Custody Guidelines 2021 (eff. 1 Jan 2022) | Locker inventory and access procedure |
| **Insurance Act, 1938** (amd. by **Insurance Laws (Amendment) Act, 2015**) | **s. 39** (nomination), **s. 39(7) — beneficial nominee (spouse/parent/child)**, s. 45 (three-year bar on repudiation) |
| **IRDAI (Protection of Policyholders' Interests) Regulations, 2024** | Claim settlement timelines and interest for delay |
| **Companies Act, 2013** | **s. 56(2)** (transmission), **s. 72** (nomination), ss. 124–125 (IEPF), s. 3(1)/4(1)(f) (OPC nominee), s. 152 (directors) |
| **Depositories Act, 1996** | **s. 9** (nomination for demat) |
| **SEBI (LODR) Regulations, 2015** | **Reg. 40** + Schedule VII (transmission) |
| **SEBI circular dated 23 July 2026** | **Effective 22 Aug 2026** — thresholds ₹10L physical / ₹30L demat; QTP for ₹10k/₹30k; probate not required in uncontested cases; 21-day processing; overseas death certificates accepted |
| **EPF & MP Act, 1952** + EPF Scheme 1952, EPS 1995, EDLI 1976 | EPF Scheme **para 61** (nomination); **Form 20 / 10D / 5IF**; EDLI up to ₹7 lakh |
| **Payment of Gratuity Act, 1972** | **s. 4(1)(c)** and proviso to s. 4(1) (**no 5-year rule on death**), **s. 4(4)** (minor's share to controlling authority), s. 7(3A) (interest for delay), Rule 6 / **Form F** |
| **CCS (Pension) Rules, 2021** | Family pension, death gratuity, statutorily defined family |
| **PFRDA Act, 2013** + **PFRDA (Exits and Withdrawals under NPS) Regulations, 2015** | NPS on death; default spouse annuity for government sector |
| **Government Savings Promotion Act, 1873** + General Rules 2018; **PPF Scheme, 2019** | **ss. 6–8** (nomination; summary payment without legal representation up to a limit) |
| **ESI Act, 1948** | **s. 52** (dependants' benefit), s. 46(1)(f) (funeral expenses) |
| **Employee's Compensation Act, 1923** | **s. 4** + Schedule IV, s. 4A (interest and penalty) |

### Property, tax, identity
| Statute | Key provisions |
|---|---|
| **Transfer of Property Act, 1882** | s. 109 (lessor's transferee), general principles |
| **Karnataka Land Revenue Act, 1964** | **s. 128** (report acquisition of rights within 3 months), s. 129, **s. 133** (presumption) |
| **Karnataka Municipal Corporations Act, 1976** | Khata; BBMP **e-Aasthi** |
| **Karnataka Stamp Act, 1957** | Arts. 28 (gift), 40 (partition), 52 (release) — concessional family rates |
| **Karnataka Co-operative Societies Act, 1959** | ss. 30–31 (transfer of shares on death) |
| **Karnataka Land Reforms Act, 1961**; **Karnataka SC/ST (PTCL) Act, 1978** | Ceilings; restrictions on alienation of granted land |
| **Karnataka Rent Act, 2001** | s. 5 (heritability of tenancy) |
| **Income-tax Act, 2025** (in force **1 April 2026**; replaced the 1961 Act) | **s. 302** (liability of legal representative — was 1961 Act s. 159). Verify 2025-Act equivalents of 1961 Act ss. 49(1) (cost to previous owner), 2(42A) Expl. (holding period), 56(2)(x) proviso (inheritance exempt), 168 (executors), 54/54EC/54F (reinvestment relief) |
| **Estate Duty Act, 1953** | **Abolished w.e.f. 16 March 1985** — no inheritance tax in India |
| **CGST Act, 2017** | s. 29(1)(a) (cancellation on death), s. 18(3) + Rule 41 / Form ITC-02 (ITC transfer), **s. 93** (liability of legal representative) |
| **Indian Partnership Act, 1932** | **s. 42(c)** (dissolution on a partner's death unless the deed provides otherwise) |
| **Motor Vehicles Act, 1988** (amd. 2019) | **s. 50(2)** (transfer on death — 30 days notice, 3 months use, 30 days to apply), **s. 164** (₹5 lakh no-fault death compensation), **s. 166** + **s. 166(3)** (MACT claim; 6-month limitation, **stayed by the Supreme Court**), s. 161 (hit and run), s. 158(6) (police report to MACT) |
| **Central Motor Vehicles Rules, 1989** | **Rule 56 / Form 31** |
| **Aadhaar Act, 2016** | ss. 34–35 (offences — impersonation, unauthorised use) |
| **Digital Personal Data Protection Act, 2023** + **DPDP Rules, 2025** | s. 2(j) (Data Principal — **deceased persons not clearly covered**); nomination of a person to exercise rights on death or incapacity — verify the notified rule and its commencement |
| **FEMA, 1999** + **FEM (Remittance of Assets) Regulations, 2016** | **USD 1 million per financial year** repatriation of inherited assets; Form 15CA/15CB |
| **Consumer Protection Act, 2019** | Medical negligence as deficiency in service |
| **Disaster Management Act, 2005** | Ex gratia; relaxed proof of death for notified disasters |

### Leading cases
| Case | Holding |
|---|---|
| ***Vineeta Sharma v. Rakesh Sharma***, (2020) 9 SCC 1 | Daughter is a coparcener **by birth**; **father need not have been alive on 9 Sep 2005**; only a partition effected **before 20 Dec 2004** by registered deed or decree is protected |
| ***Shakti Yezdani v. Jayanand Jayant Salgaonkar***, 2023 INSC 1076 | Nomination under the Companies Act / Depositories Act does **not** override succession law; the nominee is a fiduciary, not an owner |
| ***Sarbati Devi v. Usha Devi***, (1984) 1 SCC 424 | Insurance nominee is a trustee for the heirs (now subject to the **s. 39(7)** beneficial-nominee exception) |
| ***V. Tulasamma v. Sesha Reddi***, (1977) 3 SCC 99 | Property given in recognition of a pre-existing maintenance right falls under HSA s. 14(1) — becomes absolute |
| ***H. Venkatachala Iyengar v. B.N. Thimmajamma***, AIR 1959 SC 443 | Proof of wills; **suspicious circumstances** raise the propounder's burden |
| ***Mary Roy v. State of Kerala***, (1986) 2 SCC 209 | Travancore Christian Succession Act inoperative; **ISA applies** to Kerala Syrian Christians |
| ***Indrani Wahi v. Registrar of Co-op Societies***, (2016) 6 SCC 440 | A society **must** transfer to the nominee, but that transfer does not confer title against the heirs |
| ***National Insurance Co. v. Pranay Sethi***, (2017) 16 SCC 680 | MACT compensation — future prospects percentages and conventional heads |
| ***Sarla Verma v. DTC***, (2009) 6 SCC 121 | Multiplier method for accident compensation |
| ***Revanasiddappa v. Mallikarjun***, 2023 INSC 783 | Children of void/voidable marriages take a share in the parent's coparcenary property |
| ***LIC v. Anuradha***, (2004) 10 SCC 131 | Presumption of death fixes neither the fact nor the **date** of death conclusively — critical for insurance |
| ***Suraj Bhan v. Financial Commissioner***, (2007) 6 SCC 186 | **Mutation does not create or extinguish title** |
| ***Sujata Sharma v. Manu Gupta***, 2015 (Del HC) | A female coparcener can be **karta** of an HUF |
| ***Pt. Parmanand Katara v. Union of India***, (1995) 3 SCC 248 | Right to dignity extends to the dead — Art. 21 |
| ***Kamla Neti v. SLAO***, 2022 SCC OnLine SC 1728 | HSA s. 2(2) — ST women; Court urged legislative amendment rather than extending HSA judicially |

---

## 15. Verification log

**Verified against current sources on 26 July 2026** (primary or reputable secondary sources checked this session):

| Point | Status |
|---|---|
| **RBI (Settlement of Claims — Deceased Customers) Directions, 2025** — RBI/2025-26/82, 26 Sep 2025, mandatory 31 Mar 2026; **₹15L commercial / ₹5L cooperative** simplified threshold; no succession certificate/probate/indemnity from nominee or survivor at **any** amount; **15 calendar day** settlement; Annexes I-A to I-H; missing persons via **BSA ss. 110/111**, or FIR + non-traceable report under ₹1 lakh; **SCSS/PPF excluded** | ✅✅ **Verified from the primary source** (rbi.org.in). **The only primary-source read in this file.** It corrected an error here — §7.1 originally cited the superseded RBI Master Circular. |
| **ISA s. 213 deleted** by the Repealing and Amending Act, 2025; **assent 20 December 2025**; probate now optional; other probate/LoA/succession-certificate provisions survive | ⚠️ Verified from **law-firm secondary sources only** — not indiacode. Substance is near-certain; confirm against the primary Act text before product use. |
| **Banking Laws (Amendment) Act, 2025** — up to **4 nominees**, simultaneous or successive for deposits, successive only for lockers; nomination provisions **in force 1 November 2025** | ✅ Verified (PIB) |
| **SEBI circular dated 23 July 2026** — effective **22 August 2026**; thresholds **₹10L physical / ₹30L demat**; **QTP** for ₹10k/₹30k; probate not required in uncontested cases; **21-day** processing; overseas death certificates accepted | ✅ Verified — but **three days old**; confirm the circular number and annexures on sebi.gov.in |
| **BNSS s. 194** replaced CrPC s. 174 w.e.f. **1 July 2024**; inquest, Executive Magistrate intimation, report within 24 hours | ✅ Verified |
| **BSA s. 111** = presumption of death after **7 years** (was Evidence Act s. 108) | ✅ Verified |
| **RBD (Amendment) Act, 2023** in force **1 October 2023**; digital CRS; **21-day** window; s. 13 delayed-registration tiers | ✅ Verified |
| **Income-tax Act, 2025** in force **1 April 2026**; **s. 302** = liability of legal representative (was s. 159) | ✅ Verified |
| **Insurance Act s. 39(7)** beneficial nominee (spouse/parent/child), effective **26 December 2014** | ✅ Verified |
| ***Shakti Yezdani***, 14 December 2023 — nominee is a fiduciary, not an owner | ✅ Verified |
| ***Vineeta Sharma***, 11 August 2020 — retroactive coparcenary right; 20 December 2004 partition cut-off | ✅ Verified |
| **MV Act s. 50(2)** — 30 days to inform, 3 months' use, then 30 days to apply; **Form 31 / CMVR Rule 56** | ✅ Verified |
| **MV Act s. 163A omitted**, **s. 164** = ₹5 lakh no-fault death compensation; **s. 166(3)** 6-month limitation effective 1 April 2022 and **stayed by the Supreme Court** | ✅ Verified |
| **EPF Form 20 / 10D / 5IF**; **EDLI up to ₹7 lakh**, only if contributing at death | ✅ Verified |
| **Karnataka Land Revenue Act s. 128** — report within 3 months; BBMP **e-Aasthi**; Tahsildar legal heir certificate | ✅ Verified |
| **Gratuity Form F / Rule 6**; s. 4(1)(c) nominee then heirs | ✅ Verified |

**Written from established legal knowledge, not re-verified this session — check before relying on a specific figure or section number:**

- HSA Class I / Class II heir lists and the s. 10 distribution rules; the 2005 additions to Class I
- HSA ss. 15–16 female-intestate order and the s. 15(2) reversion
- Sunni and Shia share tables, *awl* / *radd*, the 1/3 bequest limit, mahr as a debt
- ISA ss. 31–49 (Christian) and ss. 50–56 (Parsi) fractions; the s. 33A ₹5,000 threshold
- **All Karnataka Stamp Act rates and article numbers** — amended almost every state budget; confirm with the sub-registrar
- **All court-fee figures** for probate / LoA / succession certificate
- **2025-Act section numbers** for cost-to-previous-owner, holding period, the inheritance exemption, executors, and reinvestment reliefs (I have given the 1961-Act numbers, which are now historical)
- Post-Finance (No. 2) Act 2024 LTCG rates and the pre-23-July-2024 grandfathering for land and buildings
- SEBI/MF nominee count caps (3 for MF folios, up to 10 for demat under the 2025 nomination framework)
- IRDAI claim-settlement day counts and the delay-interest formula
- Gratuity ceiling (₹20 lakh) — raised by notification from time to time
- **DPDP Rules, 2025** nomination-on-death provision — very new; confirm the notified rule text and commencement
- CCS (Pension) Rules, 2021 rule numbers for family pension and death gratuity
- FEMA USD 1 million limit and the current Form 15CA/CB procedure
- State-specific pre-2005 HSA s. 6 amendments (Andhra 1986, Tamil Nadu 1989, Karnataka 1994, Maharashtra 1994)

**Known gaps in Indian law itself, not in this document:**
- **No statute governs digital inheritance.** The DPDP Act does not clearly extend rights to a deceased person's heirs; platform policy fills the vacuum. (§10.3)
- **No central statute governs the Legal Heir Certificate.** It is a state revenue creature, which is why its form, name, and evidentiary weight vary by state. (§3.2)
- **HSA s. 15 remains gender-asymmetric** despite the Law Commission's 207th Report (2008). Not amended. (§4.1.2)
- **HSA s. 2(2) still excludes Scheduled Tribes.** The Supreme Court has urged amendment; Parliament has not acted. (§4.6)
- **Muslim succession remains uncodified**, so outcomes depend on which school's rules are proved and on the court's reading.

---

*Compiled 26 July 2026. Re-verify before advising on any specific estate — three of the provisions above changed within the last eight months, and one within the last week.*
