# Proposal: gravel-calculator

## Intent

Add the Gravel calculator, #8 of the MVP catalogue (PLAN §4.1: 49.5K searches a month in English; 47 % of the landscaping trade is Latino). It answers the question a contractor asks the yard: **how many tons do I order** for a rectangle of gravel at a given depth, and what does it cost.

Chosen by the orchestrator while the owner was away (2026-10-28 night, "seguí en automático"): of the eight calculators left it has the simplest formula, reuses the slab plan of `blueprint-drawing`, and opens Mulch and Topsoil, which share its shape. **Go-live waits for the owner's review** (PLAN §5.2).

## Scope

- Core: `createGravel(densities)` in `packages/core/src/calculators/gravel/`, a factory like concrete's, fed by the composition root.
- Data: `packages/data/src/yields/gravel.ts` (two densities, numbers only) and `packages/data/src/materials/gravel.ts` (cited later in the page and the methodology).
- Catalogs EN/ES, the web registry, the `PAGELESS` entry: the calculator exists and is tested, no page yet.
- Out of this change's first PR: the page, its content, the drawing and the go-live (a second change or PR after the owner reviews the numbers).

## The numbers (owner decision)

The weight of a cubic yard of gravel changes by about 40 % with how it is placed, so the calculator asks:

| Placement | Density | Source |
|---|---|---|
| `compacted` (driveway, base, under pavers) — default | 1.83 short tons per cubic yard (3,660 lb/yd³) | WisDOT WHRP G22-05 (Cetin, Bulduk, Likos, Edil; Dec 2023), Table E2, Dense Graded Base ¾-inch: 1.80–1.86 t/yd³, midpoint |
| `loose` (landscaping, paths, drainage) | 1.29 short tons per cubic yard (2,580 lb/yd³) | same table: 1.83 t/yd³ over the compacted-to-loose expansion of 36–47 % (midpoint 41.5 %) |

Both are "approximately" values; the page tells the reader to confirm with the yard. The common rule of thumb (1.4 t/yd³ loose) is between them and is cited by calculators, not by a primary source. Alternatives for the owner: one density (1.4) with no placement choice; or a user-editable density.

## Approach

Exact arithmetic as in concrete: placed volume = length × width × depth; with the extra (default 5 %, 0–50); mass = volume × density of the placement; the loose volume to order = mass ÷ loose density. Outputs: short tons (primary, US), tonnes (primary, metric), the loose volume to order in yd³ and m³, the placed volume, and the cost from an optional price per ton.

## Risks

- The densities are the owner's call (above).
- The ES concrete byte pin is untouched (no shared markup changes).
