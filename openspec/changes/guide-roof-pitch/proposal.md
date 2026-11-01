# Proposal: guide-roof-pitch

## Intent

PLAN §5.4, guide 3: "How to measure a roof and understand its pitch", EN/ES, ending in the roof pitch calculator and linking the roofing calculator in its text. It is the fifth guide of seven.

## Decisions

1. **Same frame as the other guides.** A `ROUTES` row under `/guides` and `/es/guias`, a `TRUST_IDS` entry, a `GUIDES` row tied to `roof-pitch`, `page.<id>.title|description` in both site catalogs. No new template, component or style.
2. **Facts with sources.** The minimum slopes are the ones the roof pitch calculator already publishes from the 2021 IRC, Section R905 (owner-approved with that calculator). Every other figure is right-triangle arithmetic, run through the roof pitch engine (angles, rafter lengths) and the roofing formula (slope factor). The Spanish terms follow the calculators: subida, recorrido, cabio, alero, fieltro.
3. **Copy pending** the owner's reading (`ownerReview: pending`).
4. **Also archives** `guide-drywall`, verified in production after #163, to save a CI run.
