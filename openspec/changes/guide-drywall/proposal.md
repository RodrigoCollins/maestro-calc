# Proposal: guide-drywall

## Intent

PLAN §5.4, guide 4: "How to estimate and quote a drywall job", EN/ES, ending in the drywall calculator. It is the fourth guide of seven. It does not repeat the calculator page: it is about building the quote, with the level of finish as the main labor difference.

## Decisions

1. **Same frame as the other guides.** A `ROUTES` row under `/guides` and `/es/guias`, a `TRUST_IDS` entry, a `GUIDES` row tied to `drywall`, `page.<id>.title|description` in both site catalogs. No new template, component or style; the levels table is a Markdown table, as in the methodology.
2. **Facts with sources.** Quantities are the calculator's own worked example and rates (USG compound and tape, the approximate door and window allowances). The levels of finish come from the Gypsum Association GA-214-2022 Quick Reference Guide (the gypsum.org copy refuses automated fetches; the CISCA-hosted copy is cited). No labor rate or material price is given: both are left to the reader.
3. **Copy pending** the owner's reading (`ownerReview: pending`).
4. **Also archives** `guides-tape-measure-square-footage`, verified in production after #162, to save a CI run.
