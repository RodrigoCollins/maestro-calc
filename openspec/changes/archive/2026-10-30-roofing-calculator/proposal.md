# Proposal: roofing-calculator

## Intent

Roofing, PLAN §4.1 #5 (9.9K searches a month, CPC $13; 65 % of roofers are Latino): the roof area in squares, the bundles of shingles, the rolls of underlayment and their cost, with the IRC rules for asphalt shingles. Content approved in advance under the owner's rule of 2026-10-29; the technical decisions below are the orchestrator's (owner, 2026-10-30: "metele autonomo").

## Decisions

1. **The roof is the footprint on the slope.** Area = footprint length × width (with the overhangs) × √(1 + (p/12)²): exact for any roof whose planes share one pitch (gable, hip, shed). The factor uses `squareRoot` (#139), truncated to 20 decimals.
2. **The roofing square is a unit.** `sq` = 100 ft² (14,400 in²) joins the area units of the catalog (32 units), so the primary figure is shown in squares like any other unit.
3. **Pitch is a whole rise in 12** (`count`, 0 to 24, default 6): the pitches roofers quote; 21:12 is the IRC limit before the manufacturer's instructions (R905.2.6).
4. **Coverage is injected** (`createRoofing(coverage)`, like drywall): a bundle covers 100/3 ft² (three bundles a square, GAF Timberline HDZ, 33.33 sq ft per bundle), a roll of synthetic underlayment is 48 in × 250 ft (GAF FeltBuster data sheet, 1,000 sq ft excluding laps).
5. **The underlayment follows the code** (IRC 2021 Table R905.1.1(2), asphalt shingles, areas where wind design is not required, read on codes.iccsafe.org 2026-10-30): from 4:12 one layer lapped 2 in; from 2:12 up to 4:12 two layers (36 in sheets lapped 19 in, so each shows half its width less 2 in); end laps 4 in. A roll covers (250 ft − 4 in) × (48 − 2) in = 957.06 ft² in one layer, half in two. The extra allowance applies to the bundles and the rolls (starter strip, hips, valleys, cuts).
6. **The IRC check** (R905.2.2): below 2:12 asphalt shingles are not allowed (`belowMinimum`), from 2:12 up to 4:12 the rolls count two layers (`doubleUnderlayment`).

## Slices

1. **Core** (this PR): `sq`; `createRoofing`; fixture, data module, drift guard; registry, catalogs, `PAGELESS`.
2. **Page and go-live**: page module (answer, shopping, cost), content EN/ES, methodology, route `/roofing-calculator` + `/es/calculadora-de-tejas`, E2E record.
