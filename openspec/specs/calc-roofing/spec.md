# calc-roofing

## Requirements

### Requirement: Inputs

The roofing calculator SHALL take the footprint length and width with the overhangs (0 to 1,000 ft, defaults 40 ft and 30 ft), the pitch as a whole rise in 12 (0 to 24, default 6), the extra (0–50 %, default 10) and optional prices per bundle and per roll; URL keys `l`, `w`, `p`, `ws`, `bp`, `rp`.

- [RF1] The defaults are a 40 ft by 30 ft footprint, 6 in 12, 10 % extra, no prices.

### Requirement: Roof area and materials

Area = length × width × √(1 + (p/12)²), the root truncated to 20 decimals; shown in squares (`sq`, 100 ft²), square feet and square meters. Bundles = ⌈area × (1 + extra) ÷ the injected bundle coverage⌉. Rolls = ⌈area × (1 + extra) ÷ what a roll covers⌉: (roll length − 4 in) × (roll width − 2 in) from 4 in 12, half of it below (two layers, IRC 2021 Table R905.1.1(2)). The cost of the shingles = bundles × bundle price; of the underlayment = rolls × roll price.

- [RF2] The default roof: 1,200 × 1.11803398874989484820 = 1,341.64 ft², 13.42 squares, 124.64 m²; 45 bundles, 2 rolls; no warning.
- [RF3] Flat: 1,200 ft², 40 bundles, 3 rolls; 12 in 12: 1,697.06 ft², 57 bundles, 2 rolls; no extra: 41 bundles; 60 × 40 ft at 8 in 12 with 15 %: 2,884.44 ft², 100 bundles, 4 rolls.
- [RF4] 3 in 12: 1,236.93 ft², 41 bundles, 3 rolls, `doubleUnderlayment`; at 2 in 12 the same warning; at 4 in 12 one layer (42 bundles, 2 rolls) and none.
- [RF5] Below 2 in 12 (IRC R905.2.2) `belowMinimum` with the minimum 2, and the rolls still count two layers.
- [RF6] For the default roof $35 a bundle costs $1,575.00 and $90 a roll $180.00 ($270.00 at 3 in 12, three rolls); with no prices both are $0.

### Requirement: Injected coverage

`createRoofing(coverage)` SHALL accept exactly `{ bundle, rollWidth, rollLength }`, an area above zero, a roll wider than its 2 in side lap and longer than its 4 in end lap, keep a frozen snapshot, and otherwise throw `INVALID_DEFINITION` with reason `ROOFING_COVERAGE`. The data package holds 100/3 ft² a bundle (GAF Timberline HDZ, 33.33 sq ft per bundle) and a 48 in × 250 ft roll (GAF FeltBuster data sheet, ©2014, 7/14).

- [RF7] null, a number, a missing or extra key, a zero or non-area bundle, a non-length or too short roll side, a plain number, or an inherited key throws `ROOFING_COVERAGE`.

### Requirement: URL and catalog

- [RF8] Every valid state round-trips through the link, and the six released tuples are appended in input order.
