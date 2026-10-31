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

<h2 id="topsoil">Topsoil calculator</h2>

The [topsoil calculator](/topsoil-calculator) finds the volume of topsoil for a rectangular area at a given depth, in cubic yards for a bulk order and in whole bags for a store run. Every length is kept as an exact number, and the result is rounded only when it is shown.

The formulas:

- Volume = length × width × depth.
- Total volume = volume × (1 + extra ÷ 100).
- Cubic yards = total volume ÷ 27, with the volume in cubic feet.
- Bags = total volume ÷ bag size, rounded up to a whole bag.

No material constant is involved: a bag holds the volume printed on it, 0.75, 1 or 1.5 cubic feet, and one cubic yard is exactly 27 cubic feet. The starting 10 percent extra is a rule of thumb for settling, not a measured figure, and you can change it. The metric figures use one foot as exactly 0.3048 meters (NIST SP 811, Appendix B). The bag count is the only figure rounded in the calculation, always up. The volumes are rounded to two decimals only when they are shown.

Hand-verified cases. The automated tests run these cases through the calculator and compare every figure below with the result.

| Case                                                                | Cubic yards | Cubic meters | Bags |
| ------------------------------------------------------------------- | ----------- | ------------ | ---- |
| 10 ft × 10 ft × 4 in, 10 % extra, 0.75 cu ft bags (starting values) | 1.36        | 1.04         | 49   |
| Same, 1.5 cu ft bags (`?v=1&bg=1-5`)                                | 1.36        | 1.04         | 25   |
| Same, no extra (`?v=1&ws=0`)                                        | 1.23        | 0.94         | 45   |
| 20 ft × 10 ft × 6 in (`?v=1&l=240&w=120&d=6`)                       | 4.07        | 3.11         | 147  |
| 50 ft × 40 ft × 1 in (`?v=1&l=600&w=480&d=1`)                       | 6.79        | 5.19         | 245  |

<h2 id="paint">Paint calculator</h2>

The [paint calculator](/paint-calculator) finds the gallons of paint for the walls of a rectangular room, less its doors and windows, and the whole gallon cans to buy. Every length is kept as an exact number, and the result is rounded only when it is shown.

The formulas:

- Wall area = 2 × (length + width) × height.
- Area to paint = wall area − 20 square feet per door − 15 square feet per window, never below zero.
- Gallons = area to paint × coats ÷ coverage per gallon.
- Cans = gallons, rounded up to a whole gallon.

The coverage is approximately 350 square feet per gallon for one coat, the low end of the 350 to 400 square feet per gallon at 4 mils wet in the Sherwin-Williams Quali-Kote Interior Latex Product Data Sheet (July 2020). The 20 square feet of a door (a standard 36 by 80 inch door) and the 15 square feet of a window (3 by 5 feet) are approximate allowances. A US gallon is exactly 231 cubic inches, and a liter is exactly 1,000 cubic centimeters (NIST SP 811, Appendix B). The can count is the only figure rounded in the calculation, always up. The other figures are rounded to two decimals only when they are shown.

Hand-verified cases. The automated tests run these cases through the calculator and compare every figure below with the result.

| Case                                                                                | Gallons | Liters | Cans |
| ----------------------------------------------------------------------------------- | ------- | ------ | ---- |
| 12 ft × 12 ft room, 8 ft walls, 1 door, 2 windows, 2 coats (starting values)        | 1.91    | 7.22   | 2    |
| Same, 3 coats (`?v=1&c=3`)                                                          | 2.86    | 10.84  | 3    |
| Same, no doors or windows (`?v=1&dr=0&wn=0`)                                        | 2.19    | 8.31   | 3    |
| 20 ft × 15 ft, 9 ft walls (`?v=1&l=240&w=180&h=108`)                                | 3.31    | 12.55  | 4    |
| 50 ft × 40 ft, 10 ft walls, 2 doors, 8 windows (`?v=1&l=600&w=480&h=120&dr=2&wn=8`) | 9.37    | 35.47  | 10   |

<h2 id="drywall">Drywall calculator</h2>

The [drywall calculator](/drywall-calculator) finds the drywall sheets for the walls of a rectangular room, less its doors and windows, and its ceiling when you include it, with the joint compound and the paper tape to finish them. Every length is kept as an exact number, and the result is rounded only when it is shown.

The formulas:

- Wall area = 2 × (length + width) × height, less 20 square feet per door and 15 square feet per window, never below zero.
- Area to cover = wall area, plus length × width when the ceiling is included.
- Sheets = area × (1 + extra ÷ 100) ÷ the area of one sheet (32 square feet for 4 × 8, 48 for 4 × 12), rounded up.
- Joint compound = area × 9 gallons per 1,000 square feet; pails of 4.5 gallons, rounded up.
- Joint tape = area × 370 feet per 1,000 square feet; rolls of 500 feet, rounded up.

The compound rate is approximately 9 gallons per 1,000 square feet: USG says about two 4.5-gallon pails of Sheetrock UltraLightweight All Purpose Joint Compound finish 1,000 square feet. The tape rate is approximately 370 feet per 1,000 square feet, from the USG submittal sheet for Sheetrock Brand Heavy Joint Tape (J1393, revised October 2015). The extra applies to the sheets only; the compound and the tape follow the area itself. The 20 square feet of a door and the 15 square feet of a window are approximate allowances. The calculator does not count screws, corner bead or trim. A square foot is exactly 0.09290304 square meters (NIST SP 811, Appendix B). The purchase counts are the only figures rounded in the calculation, always up; the other figures are rounded to two decimals only when they are shown.

Hand-verified cases. The automated tests run these cases through the calculator and compare every figure below with the result.

| Case                                                                                                             | Square feet | Sheets | Pails | Rolls |
| ---------------------------------------------------------------------------------------------------------------- | ----------- | ------ | ----- | ----- |
| 12 ft × 12 ft room, 8 ft walls, 1 door, 2 windows, walls and ceiling, 4 × 8 sheets, 10 % extra (starting values) | 478.00      | 17     | 1     | 1     |
| Same, 4 × 12 sheets (`?v=1&sz=4x12`)                                                                             | 478.00      | 11     | 1     | 1     |
| Same, walls only (`?v=1&sf=walls`)                                                                               | 334.00      | 12     | 1     | 1     |
| 20 ft × 15 ft, 9 ft walls (`?v=1&l=240&w=180&h=108`)                                                             | 880.00      | 31     | 2     | 1     |
| 50 ft × 40 ft, 10 ft walls, 2 doors, 8 windows (`?v=1&l=600&w=480&h=120&dr=2&wn=8`)                              | 3,640.00    | 126    | 8     | 3     |

<h2 id="roof-pitch">Roof pitch calculator</h2>

The [roof pitch calculator](/roof-pitch-calculator) turns a rise and a run into the pitch in 12, the angle and the rafter length, and checks the pitch against the minimum slope of the chosen covering. Every length is kept as an exact number, and the result is rounded only when it is shown.

The formulas:

- Slope = rise ÷ run.
- Pitch in 12 = slope × 12.
- Angle = arctangent of the slope, in degrees.
- Rafter length = (rafter run + overhang) × √(1 + slope²).

The square root is kept to twenty decimals (it is never above the true root and less than 10⁻²⁰ below it), and the arctangent within 10⁻²⁰ of a degree, from Euler's series with pi to 35 digits. The minimum slopes come from the 2021 International Residential Code: R905.2.2 asphalt shingles, 2 in 12, with two layers of underlayment from 2 in 12 up to 4 in 12; R905.3.2 clay and concrete tile, 2 1/2 in 12, with the same two layers up to 4 in 12; R905.4.2 metal roof shingles, 3 in 12; R905.5.2 mineral-surfaced roll roofing, 1 in 12; R905.6.2 slate, 4 in 12; R905.7.2 and R905.8.2 wood shingles and shakes, 3 in 12. A pitch equal to the minimum meets it, and at 4 in 12 one layer of underlayment is enough. The figures are rounded to two decimals only when they are shown.

Hand-verified cases, with a 12 ft rafter run and a 12 in overhang. The automated tests run these cases through the calculator and compare every figure below with the result.

| Case                              | Pitch in 12 | Degrees | Rafter (ft) |
| --------------------------------- | ----------- | ------- | ----------- |
| 6 in over 12 in (starting values) | 6.00        | 26.57   | 14.53       |
| 3 in over 12 in (`?v=1&r=3`)      | 3.00        | 14.04   | 13.40       |
| 4 in over 12 in (`?v=1&r=4`)      | 4.00        | 18.43   | 13.70       |
| 9 in over 12 in (`?v=1&r=9`)      | 9.00        | 36.87   | 16.25       |
| 12 in over 12 in (`?v=1&r=12`)    | 12.00       | 45.00   | 18.38       |

<h2 id="roofing">Roofing calculator</h2>

The [roofing calculator](/roofing-calculator) turns the footprint of a roof and its pitch into the area of the roof in squares, the bundles of asphalt shingles and the rolls of underlayment to buy. Every length is kept as an exact number, and the result is rounded only when it is shown.

The formulas:

- Roof area = length × width × √(1 + (pitch ÷ 12)²), the footprint with its overhangs.
- Squares = roof area ÷ 100.
- Bundles = roof area × (1 + extra ÷ 100) ÷ 33⅓ square feet, rounded up.
- Rolls = roof area × (1 + extra ÷ 100) ÷ (250 ft − 4 in) × (48 − 2) in, rounded up; half of that coverage below 4 in 12.

The square root is kept to twenty decimals. A bundle covers approximately 33⅓ square feet, three to a square (GAF Timberline HDZ, 33.33 square feet per bundle). A roll of synthetic underlayment is 48 inches by 250 feet, 1,000 square feet excluding laps (GAF FeltBuster data sheet). The laps come from Table R905.1.1(2) of the 2021 International Residential Code for asphalt shingles where wind design is not required: from 4 in 12 one layer lapped 2 inches with 4-inch end laps; from 2 in 12 up to 4 in 12 two layers, so a roll covers half. Section R905.2.2 allows asphalt shingles only from 2 in 12; below it the calculator warns. The extra applies to the bundles and the rolls alike. The calculator does not count nails, drip edge, starter strips, ridge caps, flashing or an ice barrier. A square foot is exactly 0.09290304 square meters (NIST SP 811, Appendix B). The purchase counts are the only figures rounded in the calculation, always up; the other figures are rounded to two decimals only when they are shown.

Hand-verified cases. The automated tests run these cases through the calculator and compare every figure below with the result.

| Case                                                                        | Squares | Square feet | Bundles | Rolls |
| --------------------------------------------------------------------------- | ------- | ----------- | ------- | ----- |
| 40 ft × 30 ft footprint, 6 in 12, 10 % extra (starting values)              | 13.42   | 1,341.64    | 45      | 2     |
| Same, 3 in 12, two layers of underlayment (`?v=1&p=3`)                      | 12.37   | 1,236.93    | 41      | 3     |
| Same, flat (`?v=1&p=0`)                                                     | 12.00   | 1,200.00    | 40      | 3     |
| Same, 12 in 12 (`?v=1&p=12`)                                                | 16.97   | 1,697.06    | 57      | 2     |
| 60 ft × 40 ft footprint, 8 in 12, 15 % extra (`?v=1&l=720&w=480&p=8&ws=15`) | 28.84   | 2,884.44    | 100     | 4     |

<h2 id="feet-and-inches">Feet and inches calculator</h2>

The [feet and inches calculator](/feet-and-inches-calculator) adds or subtracts two lengths in feet, inches and fractions, or multiplies or divides one length by a whole number. Every length is kept as an exact number, and the result is rounded only when it is shown.

The formulas:

- Add: first + second.
- Subtract: first − second, or second − first when the second length is the longer, with a note that says so.
- Multiply: first × number.
- Divide: first ÷ number.

The feet-and-inches figure is rounded to the nearest 1/16 of an inch; the decimal inches show two places and the meters three. A foot is exactly 12 inches and an inch is exactly 0.0254 meters (NIST SP 811, Appendix B). No other constant is involved.

Hand-verified cases. The automated tests run these cases through the calculator and compare every figure below with the result.

| Case                                                                  | Feet and inches | Inches | Meters |
| --------------------------------------------------------------------- | --------------- | ------ | ------ |
| 12 ft 6 in + 3 ft 8 1/4 in (starting values)                          | 16 ft 2 1/4 in  | 194.25 | 4.934  |
| 12 ft 6 in − 3 ft 8 1/4 in (`?v=1&o=subtract`)                        | 8 ft 9 3/4 in   | 105.75 | 2.686  |
| 10 ft − 12 ft 6 in, the second longer (`?v=1&o=subtract&a=120&b=150`) | 2 ft 6 in       | 30.00  | 0.762  |
| 12 ft 6 in × 2 (`?v=1&o=multiply`)                                    | 25 ft           | 300.00 | 7.620  |
| 12 ft 6 in ÷ 7 (`?v=1&o=divide&n=7`)                                  | 1 ft 9 7/16 in  | 21.43  | 0.544  |

## Corrections

If you find a mistake, tell us. The [corrections section of the about page](/about#corrections) explains how to report it and how we log the fix.
