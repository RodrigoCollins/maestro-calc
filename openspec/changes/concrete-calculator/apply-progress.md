# Apply progress: concrete-calculator (G1 engine)

Branch `feat/concrete-g1-engine` (all G1 slices are work-unit commits on this one branch; no push, no PR). Strict TDD. Baseline before S1: `npm run verify` green, 128 files, 2,346 tests.

## G1.1 Owner actions (information, not blockers)

- OA2: the 17 URL keys and defaults are approved as written in the spec by the pipeline (owner decision delegated): `sh l w t fw fd d h sw rs rn ns n ws bg bp rp` with defaults `slab 144 120 4 16 8 12 96 48 7 11 3 1 10 80 0 0`. They become permanent when G1 merges.
- OA3: the waste default `10` is a rule of thumb the user can change, never a standard (per spec).
- OA1: the yield source is QUIKRETE Concrete Mix No. 1101 data sheet, URL `https://www.quikrete.com/PDFs/DATA_SHEET-Concrete%20Mix%201101.pdf`, retrieved `2026-10-25`, as stated by the spec.

## Slices

(see the per-slice sections below)
