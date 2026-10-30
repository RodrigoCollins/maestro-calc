# calc-paint

## Requirements

### Requirement: Inputs

The paint calculator SHALL take the room length and width (0 to 1,000 ft, default 12 ft), the wall height (0 to 50 ft, default 8 ft), the doors (0 to 50, default 1), the windows (0 to 100, default 2), the coats (1 to 5, default 2) and an optional price per gallon (default $0), with URL keys `l`, `w`, `h`, `dr`, `wn`, `c`, `gp`.

- [PA1] The defaults are a 12 ft by 12 ft room with 8 ft walls, 1 door, 2 windows, 2 coats and no price.

### Requirement: Area and gallons

Walls = 2 × (length + width) × height; area to paint = walls − 20 ft² per door − 15 ft² per window, never below zero; gallons = area × coats ÷ the injected coverage per gallon; cans = gallons rounded up; cost = cans × price per gallon. Exact arithmetic; the can count is the only rounding.

- [PA2] The default room: 384 ft² of walls, 334 ft² to paint, 334/175 gal (1.91, 7.22 L), 2 cans.
- [PA3] Three coats: 501/175 gal (2.86), 3 cans. No openings: 384/175 gal (2.19), 3 cans.
- [PA4] A 1 ft by 1 ft room 1 ft high with the default openings paints 0 ft², 0 gal, 0 cans.
- [PA5] At $40 a gallon the default costs $80.00; with no price the cost is $0.

### Requirement: Injected coverage

`createPaint(coverage)` SHALL accept exactly `{ perGallon }`, an area above zero, keep a frozen snapshot, and otherwise throw `INVALID_DEFINITION` with reason `PAINT_COVERAGE`. The data package holds 350 ft² per gallon (Sherwin-Williams Quali-Kote Interior Latex PDS, 07/2020, low end of 350–400).

- [PA6] null, a number, a missing or extra key, a zero, negative or non-area value, or an inherited key throws `PAINT_COVERAGE`.

### Requirement: URL and catalog

- [PA7] Every valid state round-trips through the link, and the seven released tuples are appended in input order.
