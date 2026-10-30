# Proposal: roof-pitch-calculator

## Intent

Roof pitch, PLAN §4.1 #4 (22.2K searches a month, CPC $11; 65 % of roofers are Latino), with the IRC check of PLAN §4.2 ("Chequeos de código IRC: techo"). Content approved in advance under the owner's rule of 2026-10-29; the technical decisions below are the orchestrator's (owner, 2026-10-30: "porque depende de mi no hay forma de que lo soluciones vos?").

## Decisions

1. **The angle is a base dimension** (`angle`, exponents (0, 0, 1)) with the degree `deg` as its canonical unit. Not a dimensionless (0, 0) name: core names a dimension by its exponents, so a length over a length would have become an "angle". With its own base, a ratio stays unnamed.
2. **Square root**: `squareRoot(x)`, the integer square root of `x · 10^40`, so `0 ≤ √x − r < 10^-20`; exact when the root has at most twenty decimals.
3. **Arctangent**: `arctangentDegrees(t)`, Euler's series `atan(t) = t/(1+t²) · Σ cₙ yⁿ`, `y = t²/(1+t²) ≤ ½` (each term at most half the previous), in 10^-45 fixed point; `atan(t) = 90° − atan(1/t)` above 1; within 10^-20 of a degree, with `PI` to 35 digits.

## IRC 2021 minimum slopes (read from the code text, codes.iccsafe.org, 2026-10-30)

| Covering | Minimum | Section |
|---|---|---|
| Asphalt shingles | 2:12; double underlayment from 2:12 up to 4:12 | R905.2.2 |
| Clay and concrete tile | 2½:12; double underlayment from 2½:12 to 4:12 | R905.3.2 |
| Metal roof shingles | 3:12 | R905.4.2 |
| Mineral-surfaced roll roofing | 1:12 | R905.5.2 |
| Slate | 4:12 | R905.6.2 |
| Wood shingles / shakes | 3:12 | R905.7.2 / R905.8.2 |

## Slices

1. **Core math** (this PR): the angle dimension and the degree; `squareRoot`; `arctangentDegrees`. Unit tests with references computed to 60 digits, properties for both bounds, mutation 100 % on the units shard.
2. **The calculator and its page**: rise and run → pitch x/12, angle, percent slope, rafter length per foot of run and for a given run; covering select with the IRC warning; content, methodology, route.
