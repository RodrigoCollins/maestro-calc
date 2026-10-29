# Proposal: mulch-calculator

## Intent

Add the Mulch calculator, #9 of the MVP catalogue (PLAN §4.1: 49.5K searches a month in English). It answers: how many cubic yards or bags of mulch for a bed of a given size and depth, and what does it cost. Chosen by the orchestrator on 2026-10-29 while the owner was away, after gravel; **go-live waits for the owner's review** (PLAN §5.2).

## Scope

- Core: `mulch` in `packages/core/src/calculators/mulch/`, a plain calculator like `rectangle-area`: it needs no injected data, because a bag's volume is its label (a 2 cu ft bag holds 2 cu ft) and the rest is exact unit conversion (NIST SP 811, already cited).
- Catalogs EN/ES, the web registry, `PAGELESS`. No page in this change's first PR.

## Owner decisions

- Bag sizes offered: 2 and 3 cubic feet (the common retail sizes; 2 by default).
- Default bed: 20 ft by 4 ft, 3 in deep, 5 % extra (mulch settles and spills).
- Two optional prices: per bag and per cubic yard delivered in bulk.

## Approach

Volume = length × width × depth; with the extra; bags = ceiling of the total over the bag volume (the only rounding). Outputs: cubic yards (primary), cubic feet, cubic meters, the net volume, the bag shopping line and the two costs.
