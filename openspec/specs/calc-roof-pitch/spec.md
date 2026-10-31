# calc-roof-pitch

## Requirements

### Requirement: Inputs

The roof pitch calculator SHALL take the rise (0 to 100 ft, default 6 in), the run (1/16 in to 100 ft, default 12 in), the rafter run (0 to 100 ft, default 12 ft), the overhang (0 to 10 ft, default 12 in) and the covering (`asphalt` default, `tile`, `metal`, `roll`, `slate`, `wood`), with URL keys `r`, `n`, `rr`, `oh`, `c`.

- [RP1] The defaults are 6 in of rise over 12 in of run, a 12 ft rafter run with a 12 in overhang, asphalt shingles; a run of zero is refused.

### Requirement: Pitch and rafter

Pitch = rise ÷ run × 12 (in 12, exact); angle = atan(rise ÷ run) in degrees, within 10^-20 of a degree; rafter = (rafter run + overhang) × √(1 + (rise ÷ run)²), the root truncated to 20 decimals; shown in feet and in meters.

- [RP2] The default roof: 6 in 12, 26.57°, 156 × 1.11803398874989484820 in = 14.53 ft (4.43 m).
- [RP3] 9 over 24 is 4.5 in 12; 1 ft over 1 ft is 12 in 12 and 45°; a flat roof is 0° and its rafter is its run.

### Requirement: IRC minimum slopes

The covering SHALL be checked against the IRC 2021 minimum slope, in 12: asphalt 2 (R905.2.2), tile 2.5 (R905.3.2), metal shingles 3 (R905.4.2), roll roofing 1 (R905.5.2), slate 4 (R905.6.2), wood shingles and shakes 3 (R905.7.2, R905.8.2). The page reads the check in the answer (`meets`, `double`, `below`).

- [RP4] A pitch 1/16 in 12 under the minimum warns `belowMinimum` with that minimum; at the minimum it does not.
- [RP5] Asphalt shingles and tile warn `doubleUnderlayment` from their minimum up to, not at, 4 in 12; other coverings never do; the default roof warns nothing.

### Requirement: URL and catalog

- [RP6] Every valid state round-trips through the link, and the five released tuples are appended in input order.


### Requirement: Slope drawing

The page MUST draw the slope of a valid moment with a positive rise as a right triangle rising to the right in the 300 by 200 frame, clamped to a ratio between 1:4 and 4:1, with the run dimensioned under it, the rise on its right and the pitch note (`calc.roof-pitch.page.pitch`) above it, named by the answer sentence. A zero rise MUST draw nothing.

#### Scenario: [RPD1] Default slope
- GIVEN the default state (6 in over 1 ft)
- THEN the outline is `M6 137.5L188.9 137.5L188.9 46Z` and the labels are `1 ft`, `6 in` and `6.00 in 12` (`6.00 en 12` in Spanish)

#### Scenario: [RPD2] Flat roof
- GIVEN a rise of 0
- THEN the plan is `null`
