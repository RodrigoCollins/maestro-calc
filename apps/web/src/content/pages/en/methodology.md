---
id: methodology
locale: en
updated: 2026-10-28
ownerReview: approved
---

# How we calculate

Maestro Calc builds jobsite calculators. This page describes the rules every calculator follows, and it lists the formulas, the constants and the test cases of every calculator we publish. Every calculator we publish follows everything below.

## Exact calculations

Calculations use exact numbers, written as fractions, from the first input to the last step. Nothing is rounded along the way. A result is rounded once, when it is shown to you, and the calculator tells you how it was rounded.

## Tested formulas

Every formula has automated tests. Each test uses a case worked out by hand, so a wrong formula fails a test before it reaches you.

## Sources and review dates

Each calculator page names its sources and shows the date we last reviewed them. When a source changes, we review the calculator again.

<!-- A raw h2 element keeps the section anchor stable if the heading is reworded. -->

<h2 id="concrete">Concrete calculator</h2>

The [concrete calculator](/concrete-calculator) estimates the concrete for a slab, a footing, a column or a set of steps, and the bags of mix to buy. Every length is kept as an exact number, and the result is rounded only when it is shown.

Each shape starts from a volume:

- Slab: length × width × thickness.
- Footing: length × width × depth × pieces.
- Column, a cylinder: π × (diameter / 2)² × height × pieces.
- Steps: step width × run × rise × N(N+1)/2, where N is the number of steps. Each step is a full-height block from the ground to its own tread.

The extra for waste is added to the volume before the bags are counted: total volume = volume × (1 + extra / 100). The number of bags is the total volume divided by the volume one bag makes, rounded up to a whole bag. The 10 percent extra we start with is a rule of thumb that you can change, not a standard.

A bag makes approximately 0.30 cubic feet (40 lb), 0.45 cubic feet (60 lb) or 0.60 cubic feet (80 lb). These yields come from the manufacturer's data sheet: QUIKRETE Concrete Mix No. 1101 data sheet (product nos. 1101-40, 1101-60, 1101-80), revised October 2022, `https://www.quikrete.com/PDFs/DATA_SHEET-Concrete%20Mix%201101.pdf`, retrieved 2026-10-25. Real yields vary with the product and the mix, so treat the bag count as an estimate.

The column uses π = 3.14159265358979323846264338327950288. It is an approximation, and its error is less than 10⁻³⁵.

Hand-verified cases. The automated tests run these cases through the calculator and compare every figure below with the result. Volumes are in cubic feet, and bags are 80 lb bags.

| Case                                                                  | Volume before extra | Volume with 10% extra | Cubic yards | Bags |
| --------------------------------------------------------------------- | ------------------- | --------------------- | ----------- | ---- |
| Slab, 12 ft × 10 ft × 4 in (starting values)                          | 40.00               | 44.00                 | 1.63        | 74   |
| Footing, 18 ft × 16 in × 8 in, 3 pieces (`?v=1&sh=footing&l=216&n=3`) | 48.00               | 52.80                 | 1.96        | 88   |
| Column, 12 in diameter × 8 ft, 1 piece (`?v=1&sh=column`)             | 6.28                | 6.91                  | 0.26        | 12   |
| Steps, 3 steps, 4 ft wide, 7 in rise, 11 in run (`?v=1&sh=steps`)     | 12.83               | 14.12                 | 0.52        | 24   |

<h2 id="square-footage">Square footage calculator</h2>

The [square footage calculator](/square-footage-calculator) finds the area of a rectangle, such as a room, a floor or a slab, from its length and its width. Every length is kept as an exact number, and the result is rounded only when it is shown.

The formula and its two conversions:

- Area in square feet = length × width, with both sides in feet.
- Area in square yards = area in square feet ÷ 9, because one square foot is exactly 1/9 of a square yard.
- Area in square meters = area in square feet × 0.09290304, because one square foot is exactly 0.09290304 square meters.

Both constants are exact. The international foot is exactly 0.3048 meters (NIST SP 811, Appendix B), so a square foot is 0.3048 × 0.3048 = 0.09290304 square meters, and a yard is 3 feet, so a square yard is 9 square feet. The conversions use these exact values, and the figures are rounded to two decimals only when they are shown.

Hand-verified cases. The automated tests run these cases through the calculator and compare every figure below with the result.

| Case                               | Square feet | Square yards | Square meters |
| ---------------------------------- | ----------- | ------------ | ------------- |
| 12 ft × 10 ft (`?v=1&l=144`)       | 120.00      | 13.33        | 11.15         |
| 10 ft × 10 ft (starting values)    | 100.00      | 11.11        | 9.29          |
| 12 ft 6 in × 10 ft (`?v=1&l=150`)  | 125.00      | 13.89        | 11.61         |
| 20 ft × 15 ft (`?v=1&l=240&w=180`) | 300.00      | 33.33        | 27.87         |

<h2 id="gravel">Gravel calculator</h2>

The [gravel calculator](/gravel-calculator) finds the weight of gravel to order for a rectangle at a given depth, compacted or loose, and the loose volume a yard loads for it. Every length is kept as an exact number, and the result is rounded only when it is shown.

The formulas:

- Volume in place = length × width × depth.
- Total volume = volume in place × (1 + extra ÷ 100).
- Weight = total volume × tons per cubic yard as placed.
- Volume to order = weight ÷ tons per cubic yard loose.

The weights per cubic yard are approximate. Compacted gravel uses approximately 1.83 tons per cubic yard, the midpoint of the 1.80 to 1.86 range for dense-graded ¾-inch base in WisDOT WHRP G22-05, Table E2 (December 2023). Loose gravel uses approximately 1.29 tons per cubic yard, the same weight spread over the compacted-to-loose expansion of that table (36 to 47 percent, midpoint 41.5). A ton is a short ton of 2,000 lb, and a metric tonne is exactly 0.90718474 short tons (NIST SP 811, Appendix B). The figures are rounded to two decimals only when they are shown.

Hand-verified cases. The automated tests run these cases through the calculator and compare every figure below with the result.

| Case                                                          | Tons  | Metric tonnes | Cubic yards to order |
| ------------------------------------------------------------- | ----- | ------------- | -------------------- |
| 20 ft × 10 ft × 4 in, compacted, 5 % extra (starting values)  | 4.74  | 4.30          | 3.68                 |
| Same, no extra (`?v=1&ws=0`)                                  | 4.52  | 4.10          | 3.50                 |
| 30 ft × 12 ft × 6 in, compacted (`?v=1&l=360&w=144&d=6`)      | 12.81 | 11.62         | 9.93                 |
| 10 ft × 10 ft × 3 in, loose (`?v=1&l=120&w=120&d=3&pl=loose`) | 1.25  | 1.14          | 0.97                 |

<h2 id="mulch">Mulch calculator</h2>

The [mulch calculator](/mulch-calculator) finds the volume of mulch for a rectangular bed at a given depth, in cubic yards for a bulk order and in whole bags for a store run. Every length is kept as an exact number, and the result is rounded only when it is shown.

The formulas:

- Volume = length × width × depth.
- Total volume = volume × (1 + extra ÷ 100).
- Cubic yards = total volume ÷ 27, with the volume in cubic feet.
- Bags = total volume ÷ bag size, rounded up to a whole bag.

No material constant is involved: a bag holds the volume printed on it, 2 or 3 cubic feet, and one cubic yard is exactly 27 cubic feet. The metric figures use one foot as exactly 0.3048 meters (NIST SP 811, Appendix B). The bag count is the only figure rounded in the calculation, always up. The volumes are rounded to two decimals only when they are shown.

Hand-verified cases. The automated tests run these cases through the calculator and compare every figure below with the result.

| Case                                                           | Cubic yards | Cubic meters | Bags |
| -------------------------------------------------------------- | ----------- | ------------ | ---- |
| 20 ft × 4 ft × 3 in, 5 % extra, 2 cu ft bags (starting values) | 0.78        | 0.59         | 11   |
| Same, 3 cu ft bags (`?v=1&bg=3`)                               | 0.78        | 0.59         | 7    |
| Same, no extra (`?v=1&ws=0`)                                   | 0.74        | 0.57         | 10   |
| 10 ft × 10 ft × 4 in (`?v=1&l=120&w=120&d=4`)                  | 1.30        | 0.99         | 18   |
| 30 ft × 3 ft × 2 in (`?v=1&l=360&w=36&d=2`)                    | 0.58        | 0.45         | 8    |

## Corrections

If you find a mistake, tell us. The [corrections section of the about page](/about#corrections) explains how to report it and how we log the fix.
