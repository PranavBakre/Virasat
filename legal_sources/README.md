# legal_sources

Downloaded primary sources for resolving `[VERIFY]` markers in
[../docs/rules-table.md](../docs/rules-table.md). PDFs here are gitignored —
re-fetch them from the source table in that file.

**Never source act text from blogs.** If an indiacode handle 404s, search the
act name on indiacode.nic.in rather than trusting a mirror.

## Priority

**S1 first.** The RBI Settlement of Claims (Deceased Customers) Directions 2025
resolves most bank-row `[VERIFY]` tags in a single read, and its annexes I-A to
I-H are the standard claim formats — they double as the letter templates.

## Checklist

- [ ] `S1-rbi-deceased-claims-2025.pdf` — RBI/2025-26/82, 26 Sep 2025
- [ ] `S2-hindu-succession-act-1956.pdf` — class I/II heir schedule at the end
- [ ] `S3-indian-succession-act-1925.pdf` — part IX, part X ss. 370–390
- [ ] `S4-epfo-forms.pdf` — Forms 20, 10D, 5IF + current EDLI cover amount
- [ ] `S5-lic-death-claim.pdf` — process + form numbers
- [ ] `S6-nadakacheri-legal-heir.pdf` — Karnataka legal heir certificate, fee, SLA
- [ ] `S7` — UDGAM portal, link only (udgam.rbi.org.in), nothing to download
- [ ] `S8-sebi-transmission-threshold.pdf` — current simplified-transmission limit
- [ ] `S9-karnataka-court-fees.pdf` — succession certificate fee % and cap

## When you resolve a `[VERIFY]`

1. Delete the marker in `docs/rules-table.md` and correct the row if the source
   disagrees with it.
2. Write a line in `docs/audits/` — which source, date checked, what changed.

That audit trail is what makes the legal content defensible when a judge asks
"how do you know?"
