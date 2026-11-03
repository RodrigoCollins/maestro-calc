# Plan — Pool calculators (niche 3)

Status: design approved 2026-11-03 (direction v2.1 "depth marker"); not built. Working name
"Waterline" is provisional: the domain is not checked and buying it is the owner's call.

## 1. Why this niche

- Pool owners who look after their own water need a dose they can pour: gallons first, then
  pounds of salt or ounces of chlorine in the units on the jug.
- Seasonal: searches peak May to August. Launching around March 2027 gives Google two or three
  months to index the pages before the peak.
- English only: Spanish searches are 70 to 140 a month ("calculadora de piscina").

## 2. Keyword data (seodata.dev, US, 2026-11-03)

| Cluster | Volume / month | CPC |
|---|---|---|
| Pool volume (4 variants) | about 50,000 | $0.58-1.32 |
| Pool salt (3 variants) | about 25,000 | $3.61 |
| "pool calculator" | 8,100 | $3.22 |
| Chemicals and chlorine | about 6,600 | $2.00-4.70 |
| Pump size / heater size | 1,000 / 720 | $1.21 / $1.92 |

Keyword difficulty is not measured (needs one month of Ahrefs or Semrush, the owner's spend).
Most results for doses are AI-built clone sites on pages.dev: they are competition, never sources.

## 3. Launch set

1. Pool volume: rectangle, round, oval and kidney; length, width, shallow and deep end.
2. Pool salt: gallons, salt now, target; pounds and 40 lb bags.
3. Chlorine: free chlorine now and target, product (liquid 12.5%, household bleach, cal-hypo,
   dichlor); the dose in the units on the jug.
4. Pump size: the flow to turn the pool over in eight hours.

Plus a methodology page and one guide ("Opening your pool this spring").

## 4. Formulas and sources (verified 2026-11-03)

- Volume: gallons = length x width x average depth x 7.48 (rectangle). Round and oval use their
  own area; kidney is an estimate and the page says so.
- Salt: pounds = gallons x (target ppm - current ppm) x 8.34 / 1,000,000 (8.34 lb per gallon of
  water). Hayward AquaRite manual 092538 RevD (hayward.com): ideal 2,700-3,400 ppm, 3,200
  optimal; the only way to lower salt is to drain and refill; use > 99% pure NaCl; wait 10-14
  days on new plaster. Add three quarters, run the pump 24 hours, test, then the rest.
- Chlorine from first principles: 1 ppm = 1 mg/L; 10,000 gal = 37,854 L, so 1 ppm needs 37.85 g
  of available chlorine. Liquid chlorine 12.5% is trade percent (12.5 g per 100 mL), so 303 mL =
  10.24 fl oz per ppm per 10,000 gal.
- Still to verify before building: household bleach (its percent is by weight; check a real
  label and its density), cal-hypo 65% and dichlor 56% available chlorine per pound.
- Pump: the 2021 International Swimming Pool and Spa Code (ISPSC, section 311) sizes a
  residential pool's circulation for a 6-hour turnover (or 36 gpm, whichever is greater), with
  water at most 8 ft/s in the pipes; the "8 hours" in the mockup is the informal trade figure.
  Use the code's 6 hours (gpm = gallons / 360) and show the 8-hour figure as the gentler run.
  Confirm in the ICC CodeNotes before building:
  https://www.iccsafe.org/wp-content/uploads/24-23329_CodeNotes_2021_ISPSC_Velocity_FINAL_MIDRES.pdf

## 5. Design (approved)

Canvas: https://claude.ai/artifact/2pHVanUa86pj7QBsFcS4Bb, row 2 (v2.1). White tile grid
#FAFAF7 with joint lines, ink #111, deep teal #0B6E7F for actions, red #C2261E only for STOP
warnings; Barlow Condensed for numbers and headings, Barlow for text. Results as large
depth-marker tiles ("22,023 GALLONS"); the live side view of the pool with 3½ FT and 8 FT
markers; the chlorine test strip picker; "Today's test" card on the home.

## 6. Architecture

The same monorepo pattern as Cuenta Horas: `apps/pool` (Astro, its own Worker and domain) and
`packages/pool-core` (calculators on `@maestro-calc/core`, its own Stryker shard). Reuse what
`apps/pay` proved: the route table and sitemap, `_headers`, the byte budgets of
`check:site`, the e2e suites in `tooling/site-browser`, the link preview and JSON-LD. Extract to
`packages/site-kit` once a third app repeats them (the Maestro Calc rule: extract on the
second real reuse, with the byte-identical dist guard).

## 7. Open items for the owner

- Brand and domain (Waterline is provisional), then the Workers Builds project.
- One month of Ahrefs or Semrush for keyword difficulty, ideally before building.
