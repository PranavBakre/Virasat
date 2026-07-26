# Audit — 2026-07-26 · rules table cross-checked against external legal research

**Checked by:** Claude (Opus 5), at the user's request
**Trigger:** an all-India legal reference doc was drafted outside this repo, then
cross-checked against `docs/rules-table.md`. The doc now sits at
`legal_sources/LEGAL-CONTEXT-INDIA.md` under an explicit
**UNVERIFIED SECONDARY RESEARCH** header — it is **not** a source of truth.

**Sourcing discipline note.** Only **one** primary source was read in this pass:
the RBI Directions 2025, from rbi.org.in. Everything else came from law-firm
articles and secondary reporting, which `legal_sources/README.md` forbids as a
source of act text. **No `[VERIFY]` marker was deleted on secondary sourcing
alone.** Where substance was corrected, the marker was kept and narrowed so the
next reader knows what to expect from the primary source.

---

## Verified from a primary source ✅

### S1 — RBI (Settlement of Claims in respect of Deceased Customers of Banks) Directions, 2025

**Source:** rbi.org.in notification page (the S1 link in the rules table), read
directly on 26 Jul 2026.
**Result: the rules table was already correct on every bank row.** No change made
to section 1.

Confirmed verbatim:

| Point | Confirmed value |
|---|---|
| Notification | RBI/2025-26/82, DoR.MCS.REC.50/01.01.003/2025-26 |
| Issued / mandatory | 26 Sep 2025 / not later than 31 Mar 2026 |
| Simplified no-nominee threshold | **₹15 lakh** commercial, **₹5 lakh** cooperative ("or such higher limit as the bank may fix") |
| Nominee / survivor cases | Bank **shall not** insist on succession certificate, letters of administration or probate, **nor seek any bond of indemnity or surety from nominee, survivor or third party — irrespective of amount** |
| Settlement time | **15 calendar days** from receipt of all documents |
| Annexes | I-A claim (nominee/survivor) · I-B claim (non-nominee) · I-C indemnity bond · I-D disclaimer/NOC · I-E declaration re legal heirs · I-F locker inventory · I-G safe-custody inventory · I-H indemnity bond (locker valuation) |
| Missing persons | Court order under **BSA 2023 ss. 110 or 111**; under **₹1 lakh**, FIR + police non-traceable report may substitute |
| Excluded | Government savings schemes administered by banks — **SCSS, PPF etc.** |

This read also **corrected the external doc**, which had cited the superseded RBI
Master Circular on Customer Service. Fixed in
`legal_sources/LEGAL-CONTEXT-INDIA.md` §7.1.

The 15-day and cooperative-threshold `[VERIFY]` tags in section 1 rows are now
confirmed by this read. They were left in place rather than deleted, because the
annex-format and survivorship-wording tags in the same rows still need the annex
text itself — resolve the whole row in one pass when S1 is downloaded.

---

## Corrected on secondary sourcing — markers kept ⚠️

### 1. Section 4 — securities threshold conflated two different limits

**Was:** `no nominee · ≤ ₹5 lakh per DP/AMC · simplified route`
**Now:** split into **demat ≤ ₹15 lakh** (per beneficial owner) and
**physical ≤ ₹5 lakh** (per listed company).

**Why this mattered.** A single ₹5 lakh figure sent every family holding
₹5–15 lakh in **demat** down the succession-certificate track — months in court —
when the simplified route was open to them. Almost all retail holdings are demat.
This was the most materially harmful error found.

**Also flagged, not shipped:** a SEBI circular reported as dated **23 Jul 2026**
raises these to **₹10 lakh / ₹30 lakh**, adds a Quick Transmission tier
(₹10k physical / ₹30k demat), drops probate in uncontested cases, mandates
acceptance of overseas death certificates, and sets 21-day processing —
**effective 22 Aug 2026**, after demo day. Deliberately **not** put into the
table as operative. A `[VERIFY]` was added noting that **this row goes stale on
22 Aug 2026**.

Marker retained against **S8**, which was rewritten to ask for both figures and
the new circular.

### 2. Section 7 — "equal shares" is wrong whenever a child predeceased

**Was:** "widow, sons, daughters, mother — equal shares", and a spoken agent line
saying the property "divides equally among" the derived list.
**Now:** HSA **s. 10** share-counting rules stated explicitly — all widows take
**one** share between them; each living child and the mother take **one** share
each; the children of a **predeceased** child take **one share for the whole
branch**, divided within it. Worked example added.

**Why this mattered.** With a predeceased son leaving two children, the old line
implied each grandchild gets a full share. They share one. The product would have
spoken an inflated entitlement to the family most likely to be using it.

Also added: **if the interview never established whether a child predeceased, the
agent must not speak a share split at all** — say the class I list and route to a
lawyer. "Equal" is the harmful default.

Marker retained against **S2** for the s. 10 rule wording.

### 3. Section 6 — the probate `[VERIFY]` premise no longer exists

**Was:** `[VERIFY karnataka probate practice — presidency-town mandatory rule
doesn't cover bengaluru, confirm]`
**Now:** the question is **moot**. **ISA s. 213 — the mandatory-probate provision
— was deleted** by the **Repealing and Amending Act, 2025** (assent reported
20 Dec 2025). It had bound Hindus, Buddhists, Sikhs, Jains and Parsis within the
original civil jurisdiction of the Calcutta, Madras and Bombay High Courts.
Bengaluru was never in scope, so Karnataka's answer was always "not mandatory" —
and it is now not mandatory anywhere in India.

Corroborating signal: SEBI's reported 23 Jul 2026 circular drops probate in
uncontested cases **expressly citing this amendment**.

Retained a narrowed marker against a **new source S10** (the Repealing and
Amending Act, 2025 on indiacode). Substance is near-certain; the citation is not
primary-verified.

Added a safe product line usable either way: *"probate isn't required by law — but
the bank or society holding the asset may still ask for it. If they do, that's
their policy, not a legal requirement."*

---

## Markers narrowed, not resolved

| Marker | Narrowing |
|---|---|
| Section 3 · EDLI max amount | Secondary sources agree on **₹7 lakh** — expect to confirm, not correct. **Also added a hard eligibility cliff the table was missing:** EDLI pays only if the member was contributing **at the date of death**. If they had left the job, the claim fails — it must not render as available when `employment ≠ employed at death`. |
| Section 5 · succession certificate objection window | Pointed at **ISA s. 373** specifically; secondary sources agree on **~45 days**. |

---

## Not touched, deliberately

The external doc is all-India, all personal laws, movable **and** immovable. Most
of it lands on this table's **OUT OF SCOPE v1** list — property mutation, vehicle
transfer, digital assets, Muslim/Christian/Parsi share calculation, NRI claimants.
**Nothing from those areas was added.** Scope held.

Sections **0, 1, 2, 8** were read and found consistent with the research; no
changes made. Section 1 in particular is now primary-source confirmed.

---

---

# Pass 2 — same day, code brought in line with the table

## Attempted and failed: primary text for HSA

**indiacode.nic.in is not machine-fetchable from this environment.** Both the
handle page and two direct bitstream paths return **302 → JS-gated HTML**, not the
PDF. `legal_sources/S2-…pdf` was **not** obtained.

The exact URL for a human with a browser (30-second job):
`https://www.indiacode.nic.in/bitstream/123456789/5519/1/hindu_succession_act,_1956.pdf`

**Consequence:** the HSA `[VERIFY]` markers in sections 0 and 7 **stay open.** Two
independent secondary sources did return **identical verbatim** text for s. 10's
four rules, which raises confidence a long way but is not the primary read this
repo's standard requires. Nothing was resolved on that basis.

## Code fixes — all verified by running the suite

`bun` was not installed on the machine; installed via brew (1.3.14) so the suite
could actually be run rather than reasoned about. **19 pass, 0 fail. `tsc
--noEmit` clean.**

### 1. `src/rules/types.ts` — securities bracket had the wrong boundary

`demat` and `mutualFunds` carried `valueBracket?: "under-5L" | "over-5L"`. ₹5 lakh
is the **physical-certificate** ceiling; demat is **₹15 lakh**. Renamed `demat` →
`securities`, added `SecuritiesForm = "demat" | "physical" | "unknown"`, and
switched both to the shared `AmountBracket` — whose existing boundaries (₹5L,
₹15L) are exactly the two ceilings, so no new bracket type was needed.

Safe to rename because grep confirmed **nothing read these fields** — no rule, no
inference, no interview step, no test. `web/app.js` GROUPS already matches
`/^(demat|mutual|securities)/`, so the UI needed no edit.

### 2. `src/rules/table.ts` — cooperative accounts were silently dropped (live bug)

`bank-no-nominee-simplified` required `bankType === "commercial"`. A cooperative
account with no nominee matched **no rule and no inference**, so the family saw
**nothing at all** for it. Replaced with `withinSimplifiedCeiling()`: ₹15 lakh
commercial, ₹5 lakh cooperative, and **stricter ceiling when the bank type is
unknown** — never guessed downward, per the table's own instruction.

### 3. `src/rules/table.ts` — two documented §1 rows had never been transcribed

Both produced silent drops:

- **`bank-joint-survivorship`** (§1 row 1) — a joint account with a survivorship
  clause is the *easiest* route of the lot and rendered as nothing.
- **`bank-no-nominee-succession-certificate`** (§1 row 4) — an account above the
  ceiling, **or one whose balance nobody knows**, produced no claim. The family was
  shown nothing for their largest account. Slow news beats silence, which reads as
  "nothing to claim here."

### 4. `src/rules/inferences.ts` — `dormantOver10Years` was never read

Added the `bank-dormant-udgam` discovery card (§1 row 6, §8). The field existed on
the type but nothing consumed it, so a long-dormant account produced no pointer to
the DEA fund — money nobody thinks to look for.

## Tests added, and confirmed to actually catch the bug

Six new cases in `src/rules/engine.test.ts`, including a **6-case matrix** over
bank type × amount bracket, an unknown-balance case, a joint-survivorship case, a
dormant-card case, and the one that matters most:

> **"no known bank account is ever silently dropped"** — for six differently
> shaped accounts, asserts every `account.id` surfaces as an `assetRef` on at
> least one claim.

**Verified the guard is real, not decoration:** the pre-fix commercial-only
condition was temporarily reintroduced and the suite **failed** on the cooperative
case, then passed again once restored. A test that cannot fail proves nothing.

## Deliberately NOT done

**§2 life insurance, §3 retired-pension, §4 securities claims, and 6 of the 11 §8
inference rows remain untranscribed.** Writing them is new feature work needing new
profile fields and interview questions — `rules/building.md` forbids adding
features outside the iteration plan, and unreviewed legal rules hours before a demo
is the wrong trade. **They are now listed explicitly in the table's
"How this file maps to code" section**, so the gap is visible instead of implicit.

Also surfaced, no decision made: **a joint account without a survivorship clause
has no row in the rules table at all.** Undefined behaviour, not just
unimplemented. Needs a legal decision before code.

---

## Follow-ups for whoever downloads the sources

1. **S1 first** (unchanged advice) — confirms section 1 outright and its annexes
   are the letter templates.
2. **S8** — get **both** securities figures, and the 23 Jul 2026 circular. This
   row is the one that was actively wrong.
3. **S2** — HSA s. 10 rules 1–4, for the branch-share rule in section 7.
4. **S10** (new) — Repealing and Amending Act 2025, to close the probate question.
5. **S4** — EDLI ₹7 lakh, expected to confirm.
