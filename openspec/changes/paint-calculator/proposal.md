# Proposal: paint-calculator

## Intent

Add the Paint calculator, #7 of the MVP catalogue and the next by English searches after Gravel, Mulch and Topsoil (PLAN §4.1: 49.5K a month; 58 % of painters are Latino). It answers: how many gallons of paint do I buy for the walls of a room, and what does it cost.

Chosen by the orchestrator on 2026-10-29 in the owner's autonomous run: "Después seguí con calculadoras nuevas del catálogo de PLAN §4.1, en orden de búsquedas: núcleo → página → publicación, un PR por calculadora, con la misma regla de contenido aprobado por adelantado." The page content is approved in advance under that rule; the numbers below are the orchestrator's decisions, recorded for the owner.

## Scope

- Core units: the US liquid gallon (`gal`, exactly 231 in³) and the liter (`L`, exactly 1,000 cm³) join the volume units.
- Core: `createPaint(coverage)` in `packages/core/src/calculators/paint/`, a factory like gravel's, fed by the composition root.
- Data: `packages/data/src/yields/paint.ts`, the coverage per gallon (numbers only).
- Page module, content EN/ES, methodology section, route, E2E record: the full go-live in the same PR (owner rule for calculators after topsoil).

## The numbers (orchestrator decisions)

| Number | Value | Source |
|---|---|---|
| Coverage | approximately 350 sq ft per gallon per coat | Sherwin-Williams Quali-Kote Interior Latex, Product Data Sheet (07/2020): 350–400 sq ft per gallon at 4 mils wet. The low end is used, so the estimate does not come up short. |
| Door | 20 sq ft each | A standard 36 × 80 in door (exact arithmetic). Stated as an assumption. |
| Window | 15 sq ft each | A 3 × 5 ft window. Stated as an assumption. |

## Approach

Walls = 2 × (length + width) × height; paint area = walls − doors × 20 sq ft − windows × 15 sq ft, never below zero; paint = paint area × coats ÷ coverage. Purchase: whole gallon cans, the gallons rounded up (quarts were considered and left for v2: one line and one price keep the page simple). No extra percentage: the low-end coverage and the rounding up to whole cans are the margin. Outputs: gallons (primary, US), liters (primary, metric), the paint and wall areas, the can line, and the cost from an optional price per gallon.

Defaults: a 12 × 12 ft room with 8 ft walls, 1 door, 2 windows, 2 coats.

## Out of scope (v2)

Ceilings, primer, trim, quarts and 5-gallon buckets, and an editable coverage.

## Content approval

The page content is approved in advance under the owner's rule of 2026-10-29 quoted above (the same rule as mulch and topsoil), so the entries carry `ownerReview: approved`. The numbers above (coverage, door and window allowances, defaults) are the orchestrator's decisions and are listed for the owner's review after publication.
