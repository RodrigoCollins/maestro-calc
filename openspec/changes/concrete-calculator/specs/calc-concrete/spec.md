# Delta for calc-concrete

Package: `@maestro-calc/core` (calculator `concrete`, built by `createConcrete(yields)`) with labels in `@maestro-calc/i18n` and bag yields in `@maestro-calc/data` (`concrete-mix`). The first shipped calculator: concrete for a slab, a footing, a column or steps, with a waste allowance, a bag shopping line and optional costs. Model: `calc-rectangle-area`. Prefix: CC. Scenarios are pure core scenarios (no DOM); the page is `calculator-page`.

Yields in this spec are data values of `material-data-contract` (`concrete-mix`): QUIKRETE Concrete Mix No. 1101 data sheet, 40 lb = 0.30 ft3 (3/10), 60 lb = 0.45 ft3 (9/20), 80 lb = 0.60 ft3 (3/5), all "approximately" per the manufacturer. Owner action OA1 reduces to acknowledging that source.

## ADDED Requirements

### Requirement: Descriptor and permanent URL contract

The calculator `concrete` MUST be defined through `defineCalculator`, produced by `createConcrete(yields)`, with these inputs in this order. Lengths accept every form of `fraction-format` in either unit system; a bare number is read in the unit shown (ft/in under `imperial`, m/cm under `metric`).

| key | kind | urlKey | default | constraints (inclusive) |
|---|---|---|---|---|
| `shape` | select | `sh` | `slab` | options `slab`, `footing`, `column`, `steps` |
| `length` | length | `l` | `12 ft` (144 in) | ft / m, 0 to `1000 ft` |
| `width` | length | `w` | `10 ft` (120 in) | ft / m, 0 to `1000 ft` |
| `thickness` | length | `t` | `4 in` | in / cm, 0 to `10 ft` |
| `footingWidth` | length | `fw` | `16 in` | in / cm, 0 to `10 ft` |
| `footingDepth` | length | `fd` | `8 in` | in / cm, 0 to `10 ft` |
| `diameter` | length | `d` | `12 in` | in / cm, 0 to `20 ft` |
| `height` | length | `h` | `8 ft` (96 in) | ft / m, 0 to `100 ft` |
| `stepWidth` | length | `sw` | `4 ft` (48 in) | ft / m, 0 to `100 ft` |
| `rise` | length | `rs` | `7 in` | in / cm, 0 to `5 ft` |
| `run` | length | `rn` | `11 in` | in / cm, 0 to `5 ft` |
| `stepCount` | count | `ns` | `3` | 0 to 50 |
| `count` | count | `n` | `1` | 1 to 1000 |
| `waste` | percent | `ws` | `10` (percent points) | 0 to 50 |
| `bag` | select | `bg` | `80` | options `40`, `60`, `80` (pounds) |
| `bagPrice` | money | `bp` | `$0` | `$0` to `$10000` |
| `readyMixPrice` | money | `rp` | `$0` | `$0` to `$10000` (per cubic yard) |

Meaning by shape: `slab` uses `length`, `width`, `thickness`; `footing` uses `length`, `footingWidth`, `footingDepth`, `count` (pieces of that length); `column` uses `diameter`, `height`, `count`; `steps` uses `stepWidth`, `rise`, `run`, `stepCount`. `waste`, `bag`, `bagPrice`, `readyMixPrice` apply to every shape. Validation covers every field whatever the shape.

Outputs (declaration order):

| key | measure | role | display hint |
|---|---|---|---|
| `volumeYd3` | volume | `primary` | `{ unit: 'yd3', format: 'decimal', places: 2 }` |
| `volumeFt3` | volume | `secondary` | `{ unit: 'ft3', format: 'decimal', places: 2 }` |
| `volumeM3` | volume | `secondary` | `{ unit: 'm3', format: 'decimal', places: 2 }` |
| `netVolume` | volume | `intermediate` | `{ unit: 'ft3', format: 'decimal', places: 2 }` |
| `bagCost` | money | `secondary` | none |
| `readyMixCost` | money | `secondary` | none |

`volumeYd3`, `volumeFt3` and `volumeM3` are the same quantity (total volume including waste); each names the unit it is shown in. `netVolume` is the volume before waste. The calculator declares no warnings and one shopping line (`materialId: 'concrete-mix'`, `purchaseUnit: 'bag-<bag>'`).

The ordered tuples of all 17 inputs MUST be appended to the released URL snapshot (`RELEASED`) with exactly these `urlKey`s, kinds and defaults (as canonical URL text): `sh` `slab`, `l` `144`, `w` `120`, `t` `4`, `fw` `16`, `fd` `8`, `d` `12`, `h` `96`, `sw` `48`, `rs` `7`, `rn` `11`, `ns` `3`, `n` `1`, `ws` `10`, `bg` `80`, `bp` `0`, `rp` `0`; `options` for `sh` and `bg`. These keys and defaults become PERMANENT on merge to `main` (`url-state-codec` rules 1 to 8); the approval of the owner is OA2 and happens before the first merge of the engine group.

#### Scenario: [CC1] Metadata
- GIVEN `createConcrete` called with the three yields
- WHEN its input and output descriptors are read
- THEN they match the tables exactly (order, kinds, urlKeys, defaults, bounds, default units, roles, display hints) and no warnings are declared

#### Scenario: [CC2] Released snapshot
- GIVEN the `RELEASED` snapshot after this change
- WHEN the contract tests run
- THEN 17 tuples for `concrete` exist in the order above, `released.contract.test.ts` registers the calculator, and renaming `sh` to `s`, or changing the `waste` default from `10` to `12`, fails the contract test

#### Scenario: [CC3] urlKeys are legal
- GIVEN the 17 urlKeys
- WHEN checked against `calculator-contract`
- THEN each matches `^[a-z][a-z0-9]{0,2}$`, none is `v` or `u`, and all are distinct

### Requirement: Yield injection

`createConcrete(yields)` MUST take the bag yields as a record with exactly the keys `40`, `60`, `80`, each a `Quantity<'volume'>` strictly greater than zero. Core MUST NOT import `@maestro-calc/data` and MUST NOT contain yield constants outside test fixtures. A record that misses a key, has another key, or holds a non-volume or non-positive value MUST throw `CoreError` with code `INVALID_DEFINITION`, reason `BAG_YIELDS` and cause `{ id: 'concrete', reason: 'BAG_YIELDS' }`. The factory owns this reason: it is thrown by `createConcrete` before `defineCalculator` is called, it is NOT a reason of `defineCalculator`, and the closed reason list of `calculator-contract` (`DEFINITION_REASONS`) does not change. The web composition root builds the record from the yields-only module of `@maestro-calc/data` (`material-data-contract`: purchase unit `bag-<n>` to key `<n>`), never from the material record, so the client bundle carries no source metadata.

#### Scenario: [CC4] Valid yields
- GIVEN yields `{ 40: 3/10 ft3, 60: 9/20 ft3, 80: 3/5 ft3 }`
- WHEN `createConcrete` is called
- THEN it returns a calculator whose bag for `80` divides volume by `3/5 ft3`

#### Scenario: [CC5] Invalid yields
- GIVEN yields missing `60`, yields with an extra key `50`, yields with `80: 0 ft3`, and yields with `80: 1 ft` (a length)
- WHEN each is passed to `createConcrete`
- THEN each throws `INVALID_DEFINITION` with reason `BAG_YIELDS` and cause `{ id: 'concrete', reason: 'BAG_YIELDS' }`
- AND `DEFINITION_REASONS` does not contain `BAG_YIELDS`

#### Scenario: [CC6] Yield drift guard
- GIVEN the yields used by the core tests, the yields-only module of `@maestro-calc/data` and the `concrete-mix` record
- WHEN the web contract test compares them
- THEN `3/10`, `9/20`, `3/5` ft3 are equal in all three, and the test fails when any side changes alone

### Requirement: Volume computation (exact)

All arithmetic is on exact Rationals in canonical inches (`units-quantities`), with `PI` from `core-geometry`. No rounding occurs in `compute`. Net volume `V` by shape:

| shape | formula | source |
|---|---|---|
| `slab` | `length x width x thickness` | volume of a rectangular prism |
| `footing` | `length x footingWidth x footingDepth x count` | rectangular prism, `count` identical pieces |
| `column` | `PI x (diameter / 2)^2 x height x count` | volume of a cylinder, `count` identical pieces |
| `steps` | `stepWidth x run x rise x N(N+1)/2`, `N = stepCount` | each step is a full-height block: step `k` is `stepWidth x run x (k x rise)`, and `1 + 2 + ... + N = N(N+1)/2` |

Total volume `Vt = V x (1 + waste/100)` (waste is applied before bags, percent points as Rational). Conversions use the exact factors of `units-quantities` (`ft3 = in3 / 1728`, `yd3 = in3 / 46656`, `m3 = in3 x 2048383 / 125000000000`).

Hand-verified cases (all `waste = 10` unless stated; `PI` is the `core-geometry` Rational):

| Case | state (changes from defaults) | net `V` | total `Vt` | yd3 (2 places) | m3 (2 places) |
|---|---|---|---|---|---|
| S1 slab default | none (`v=1`) | 69120 in3 = 40 ft3 | 76032 in3 = 44 ft3 | 44/27 = 1.63 | 608369751/488281250 = 1.25 |
| S2 slab | `l=240 w=180 t=6` (20 ft x 15 ft x 6 in) | 259200 in3 = 150 ft3 | 165 ft3 | 55/9 = 6.11 | 4.67 |
| S3 slab, metric | `u=m`, raw `4`, `3`, `10` (4 m x 3 m x 10 cm) | 6/5 m3 = 1.20 | 33/25 m3 = 1.32 | 1.73 | 1.32 |
| F1 footing | `sh=footing l=216 n=3` (3 x 18 ft x 16 in x 8 in) | 82944 in3 = 48 ft3 | 264/5 = 52.8 ft3 | 88/45 = 1.96 | 1.50 |
| C1 column | `sh=column` (12 in x 8 ft, 1 piece) | 3456 x PI in3 = 2 x PI ft3 (6.28) | 11 x PI/5 ft3 (6.91) | 0.26 | 0.20 |
| C2 columns | `sh=column n=4` | 13824 x PI in3 = 8 x PI ft3 (25.13) | 44 x PI/5 ft3 (27.65) | 1.02 | 0.78 |
| T1 steps | `sh=steps` (3 steps, 4 ft wide, 7 in rise, 11 in run) | 22176 in3 = 77/6 ft3 (12.83) | 847/60 ft3 (14.12) | 847/1620 = 0.52 | 0.40 |
| T2 one step | `sh=steps ns=1` | 3696 in3 = 77/36 ft3 | 847/360 ft3 | 0.09 | 0.07 |
| T3 no steps | `sh=steps ns=0` | 0 | 0 | 0.00 | 0.00 |
| Z zero length | `l=0` | 0 | 0 | 0.00 | 0.00 |
| H maximum slab | `l=12000 w=12000 t=120 ws=0` (1000 ft x 1000 ft x 10 ft) | 17,280,000,000 in3 = 10,000,000 ft3 | same | 370,370.37 | 283,168.47 |

Arithmetic, line by line:

- S1: 144 x 120 = 17280; x 4 = 69120 in3; / 1728 = 40 ft3 (the mockup: 4 in = 1/3 ft, 12 x 10 x 1/3 = 40). Net yd3 = 40/27 = 1.48. x 11/10 = 76032 in3 = 44 ft3; / 27 = 44/27 = 1.6296 (1.63). m3 = 76032 x 2048383 / 125000000000: 76032 = 2^8 x 297, the denominator is 2^9 x 5^12, so the fraction is 297 x 2048383 / (2 x 5^12) = 608369751 / 488281250 = 1.24594 (1.25). Check: 44 ft3 x 0.028316846592 = 1.24594.
- S2: 240 x 180 = 43200; x 6 = 259200; / 1728 = 150 ft3. x 11/10 = 165 ft3; / 27 = 55/9 = 6.111 (6.11). Net yd3 = 50/9 = 5.56. m3 = 165 x 0.028316846592 = 4.6723 (4.67).
- S3: 4 m x 3 m x 0.1 m = 1.2 m3 exactly (each metric length is `n x 5000/127` or `n x 50/127` in; the factors cancel, so the result is the exact Rational 6/5 m3). x 11/10 = 33/25 = 1.32 m3. ft3 = 1.32 / 0.028316846592 = 46.6153 (46.62); yd3 = 46.6153 / 27 = 1.7265 (1.73).
- F1: 216 x 16 x 8 = 27648 in3 = 16 ft3 per piece; x 3 = 48 ft3; x 11/10 = 52.8 = 264/5 ft3; / 27 = 264/135 = 88/45 = 1.9556 (1.96). Net yd3 = 48/27 = 16/9 = 1.78. m3 = 52.8 x 0.028316846592 = 1.4951 (1.50).
- C1: radius 6 in; PI x 36 x 96 = 3456 x PI in3; / 1728 = 2 x PI ft3 = 6.2832. x 11/10 = 11 x PI/5 = 6.9115 ft3; / 27 = 0.2560 (0.26); m3 = 6.9115 x 0.028316846592 = 0.19571 (0.20).
- C2: 4 x 3456 x PI = 13824 x PI in3 = 8 x PI ft3 = 25.1327; x 11/10 = 44 x PI/5 = 27.6460 ft3 (27.65); / 27 = 1.02393 (1.02); m3 = 27.6460 x 0.028316846592 = 0.78285 (0.78).
- T1: N(N+1)/2 = 3 x 4 / 2 = 6; 48 x 11 x 7 = 3696; x 6 = 22176 in3; / 1728 = 77/6 = 12.8333 ft3 (22176 = 1728 x 12 + 1440, and 1440/1728 = 5/6). x 11/10 = 847/60 = 14.1167 ft3; / 27 = 847/1620 = 0.52284 (0.52); net yd3 = 77/162 = 0.4753 (0.48); m3 = 14.1167 x 0.028316846592 = 0.39975 (0.40).
- T2: N = 1: 48 x 11 x 7 x 1 = 3696 in3 = 77/36 ft3 = 2.1389 ft3; x 11/10 = 847/360 = 2.3528 ft3; / 27 = 0.0871 (0.09); m3 = 0.0666 (0.07).
- H: 12000 x 12000 x 120 = 17,280,000,000 in3; / 1728 = 10,000,000 ft3; / 27 = 370,370.37 yd3; m3 = 10^7 x 0.028316846592 = 283,168.47 (283,168.46592).

#### Scenario: [CC7] Slab default (S1)
- GIVEN `run({})`
- WHEN the outputs are read in the units of their display hints
- THEN `netVolume` is exactly `40 ft3`, `volumeFt3` is exactly `44 ft3`, `volumeYd3` is exactly `44/27 yd3` (1.63 at 2 places), `volumeM3` is exactly `608369751/488281250 m3` (1.25)
- AND the three volume outputs are the same quantity (`76032 in3`)

#### Scenario: [CC8] Other slabs (S2, S3)
- GIVEN S2 raw inputs `{ length: "20", width: "15", thickness: "6in" }` (imperial) and S3 raw inputs `{ length: "4", width: "3", thickness: "10" }` run with `{ unitSystem: 'metric' }`
- WHEN run
- THEN S2 equals its row exactly (`volumeFt3 = 165 ft3`, `volumeYd3 = 55/9`) and S3 has `netVolume = 6/5 m3` and `volumeM3 = 33/25` exactly, with `volumeYd3` 1.73 and `volumeFt3` 46.62 at 2 places

#### Scenario: [CC9] Footing with a piece count (F1)
- GIVEN `{ shape: "footing", length: "18ft", count: "3" }`
- WHEN run
- THEN `netVolume` is exactly `48 ft3` and `volumeFt3` exactly `264/5 ft3`, `volumeYd3` exactly `88/45`
- AND `{ shape: "footing", length: "18ft", count: "1" }` gives a `netVolume` of exactly `16 ft3`

#### Scenario: [CC10] Column uses PI exactly (C1, C2)
- GIVEN `{ shape: "column" }` and `{ shape: "column", count: "4" }`
- WHEN run
- THEN `netVolume` is exactly `2 x PI ft3` and `8 x PI ft3` as Rationals built from `core-geometry` `PI` (not a float), `volumeFt3` is exactly `11 x PI/5` and `44 x PI/5`, and the displayed values match the table (0.26 yd3, 1.02 yd3)

#### Scenario: [CC11] Steps stacked as full-height blocks (T1, T2, T3)
- GIVEN `{ shape: "steps" }`, `{ shape: "steps", stepCount: "1" }`, `{ shape: "steps", stepCount: "0" }`
- WHEN run
- THEN `netVolume` is exactly `77/6 ft3`, `77/36 ft3` and `0`, and no error occurs for zero steps

#### Scenario: [CC12] Zero dimension and maximum bounds (Z, H)
- GIVEN `{ length: "0" }` and `{ length: "1000ft", width: "1000ft", thickness: "10ft", waste: "0" }`
- WHEN each is run
- THEN the first has all volumes exactly `0`, no error and 0 bags; the second has `netVolume` exactly `10000000 ft3` and `volumeYd3` exactly `10000000/27`

#### Scenario: [CC13] Unused fields do not matter
- GIVEN the same footing state run twice, once with defaults for `diameter`, `height`, `stepCount` and once with `diameter = 5 ft`, `height = 50 ft`, `stepCount = 40`
- WHEN both are run
- THEN the outputs are equal exactly

### Requirement: Waste and bag shopping

`waste` is a percent in `[0, 50]` and `Vt = V x (1 + waste/100)`; the waste default `10` is a rule of thumb the user can change (OA3), not a standard. The bag count is `qty = ceilToPurchaseUnits(Vt / yield(bag))` (the ratio of two volumes; whole bags only, no other rounding). The shopping list has exactly one line `{ materialId: 'concrete-mix', purchaseUnit: 'bag-<bag>', qty }`, also when `qty` is `0n`. Net volume without waste never feeds the bag count.

Hand-verified bag counts (`Vt / yield`, yields 3/10, 9/20, 3/5 ft3):

| Case | `Vt` ft3 | 40 lb | 60 lb | 80 lb |
|---|---|---|---|---|
| S1 slab default | 44 | 440/3 = 146.67 -> **147** | 880/9 = 97.78 -> **98** | 220/3 = 73.33 -> **74** |
| S1, `ws=0` | 40 | 400/3 = 133.33 -> **134** | 800/9 = 88.89 -> **89** | 200/3 = 66.67 -> **67** |
| S2 slab | 165 | 550 -> **550** (exact) | 3300/9 = 366.67 -> **367** | 275 -> **275** (exact) |
| S2, `ws=0` | 150 | 500 -> **500** | 1000/3 = 333.33 -> **334** | 250 -> **250** |
| F1 footing | 264/5 | 176 -> **176** (exact) | 352/3 = 117.33 -> **118** | 88 -> **88** (exact) |
| C1 column | 11 x PI/5 = 6.9115 | 23.04 -> **24** | 15.36 -> **16** | 11.52 -> **12** |
| C2 columns | 44 x PI/5 = 27.6460 | 92.15 -> **93** | 61.44 -> **62** | 46.08 -> **47** |
| T1 steps | 847/60 | 847/18 = 47.06 -> **48** | 847/27 = 31.37 -> **32** | 847/36 = 23.53 -> **24** |
| S3 slab metric | 33/25 m3 = 46.6153 | 155.38 -> **156** | 103.59 -> **104** | 77.69 -> **78** |
| Z zero | 0 | **0** | **0** | **0** |
| H maximum | 10,000,000 | 33,333,334 | 22,222,223 | 16,666,667 |

Arithmetic: S1 80 lb: 44 / (3/5) = 220/3. S2 80 lb: 165 x 5/3 = 275 exactly (an exact integer does not round up: `ceilToPurchaseUnits(275) = 275`); 40 lb: 165 x 10/3 = 550 exactly. F1 40 lb: 264/5 x 10/3 = 176; 80 lb: 264/5 x 5/3 = 88. T1 80 lb: 847/60 x 5/3 = 4235/180 = 847/36. H 80 lb: 10^7 x 5/3 = 16,666,666.67 -> 16,666,667; 60 lb: 10^7 x 20/9 = 22,222,222.2 -> 22,222,223; 40 lb: 10^7 x 10/3 = 33,333,333.3 -> 33,333,334.

#### Scenario: [CC14] Default example, three bag sizes
- GIVEN `{}`, `{ bag: "60" }`, `{ bag: "40" }`
- WHEN run
- THEN `shopping` is `[ { materialId: "concrete-mix", purchaseUnit: "bag-80", qty: 74n } ]`, then `bag-60` with `98n`, then `bag-40` with `147n`

#### Scenario: [CC15] Exact integers do not round up
- GIVEN S2 with `bag: "80"` and with `bag: "40"`, and F1 with `bag: "80"` and with `bag: "40"`
- WHEN run
- THEN the quantities are `275n`, `550n`, `88n`, `176n` (never one more)

#### Scenario: [CC16] Waste is applied before bags
- GIVEN the S1 slab with `waste` `0`, `10` and `12.5`
- WHEN run with the 80 lb bag
- THEN `volumeFt3` is `40`, `44` and `45` (40 x 9/8) and the quantities are `67n`, `74n` and `75n` (45 / 0.6 = 75 exactly)

#### Scenario: [CC17] Other shapes and zero
- GIVEN C1, C2, T1, S3 (metric) and Z with the three bag sizes
- WHEN run
- THEN the quantities equal the table (for example C2 80 lb `47n`, T1 80 lb `24n`, S3 80 lb `78n`) and Z gives a line with `qty: 0n`

#### Scenario: [CC18] Maximum
- GIVEN case H with each bag size
- WHEN run
- THEN the quantities are `33333334n`, `22222223n`, `16666667n` as `bigint`

### Requirement: Costs

`bagCost = bagPrice x qty` (`multiplyCount`, the rounded-up bag count) and `readyMixCost = readyMixPrice x Vt in yd3` (`unitPrice(readyMixPrice, yd3)` and `costOf`), both exact and unrounded (display rounding to cents is the web layer's job). A price of `$0` yields a cost of exactly `$0`; the web layer hides a cost until its price is above zero. Ready-mix volume is NOT rounded to a truck increment and bags are NOT priced by volume.

Hand-verified: S1 with `bagPrice = $6.50` (13/2): 74 x 13/2 = 481. S1 with `readyMixPrice = $150`: 44/27 x 150 = 6600/27 = 2200/9 = 244.44. S1 with `bag: "60"` and `bagPrice = $4.25` (17/4): 98 x 17/4 = 833/2 = 416.50.

#### Scenario: [CC19] Bag cost
- GIVEN `{ bagPrice: "6.50" }`, and `{ bag: "60", bagPrice: "$4.25" }`
- WHEN run
- THEN `bagCost` is exactly `usd(481)` and `usd(833/2)`

#### Scenario: [CC20] Ready-mix cost
- GIVEN `{ readyMixPrice: "150" }`
- WHEN run
- THEN `readyMixCost` is exactly `usd(2200/9)` (displays as 244.44), and `bagCost` is exactly `usd(0)`

#### Scenario: [CC21] Prices default to zero
- GIVEN `{}`
- WHEN run
- THEN `bagCost` and `readyMixCost` are exactly `usd(0)`

### Requirement: Validation

All fields follow `calculator-contract` validation without silent coercion. Errors are reported in declaration order, one per field.

#### Scenario: [CC22] Rejected inputs
- GIVEN each alone: `{ length: "abc" }`, `{ length: "1001ft" }`, `{ thickness: "1,5" }`, `{ count: "0" }`, `{ count: "1001" }`, `{ stepCount: "51" }`, `{ waste: "51" }`, `{ waste: "-1" }`, `{ shape: "pool" }`, `{ shape: "Slab" }`, `{ bag: "50" }`, `{ bagPrice: "-1" }`, `{ bagPrice: "10000.01" }`, `{ readyMixPrice: "1,50" }`, `{ diameter: "" }`
- WHEN run
- THEN the codes are `MALFORMED`, `ABOVE_MAX`, `DECIMAL_COMMA`, `BELOW_MIN` (with `min: "1"`), `ABOVE_MAX` (`max: "1000"`), `ABOVE_MAX` (`max: "50"`), `ABOVE_MAX` (`max: "50"`), `BELOW_MIN`, `UNKNOWN_OPTION`, `UNKNOWN_OPTION`, `UNKNOWN_OPTION`, `MALFORMED`, `ABOVE_MAX`, `DECIMAL_COMMA`, `EMPTY`, on the named field, and no result is produced

#### Scenario: [CC23] Hidden fields are validated too
- GIVEN `{ shape: "slab", diameter: "abc" }`
- WHEN run
- THEN the result is `{ ok: false }` with one `MALFORMED` error on `diameter`

#### Scenario: [CC24] Inputs accept feet-inch-fraction and metric
- GIVEN `{ length: "12' 6\"" }` and `{ length: "3.81 m" }` (both 150 in)
- WHEN each is run
- THEN `netVolume` is exactly `125/3 ft3` for both (150 x 120 x 4 = 72000 in3; 72000 / 1728 = 125/3)

### Requirement: Consistency properties

For at least 1,000 random valid states per run, with exact equality: (P1) `volumeFt3 = netVolume x (1 + waste/100)`; (P2) `volumeYd3 x 27 = volumeFt3` as numbers; (P3) for `qty > 0`, `qty x yield >= Vt` and `(qty - 1) x yield < Vt`; (P4) the bag count never decreases when `waste` increases, and `qty40 >= qty60 >= qty80`; (P5) for `footing` and `column`, `netVolume` with `count = k x m` equals `k x` that with `count = m`; (P6) swapping `length` and `width` of a slab changes no output; (P7) `steps` net volume equals the sum over `k = 1..N` of `stepWidth x run x (k x rise)`; (P8) the results do not change with `diameter`, `height`, `stepCount` for a slab (and the other unused fields for the other shapes); (P9) volumes and costs are non-negative; (P10) `readyMixCost = readyMixPrice x volumeYd3`.

#### Scenario: [CC25] Properties hold
- GIVEN at least 1,000 random valid states per run, covering all four shapes and all bag sizes
- WHEN computed
- THEN P1 to P10 hold with exact equality

### Requirement: Language-free result

Results MUST be language-free (`calculator-contract`): `shopping.materialId` `concrete-mix` and `purchaseUnit` `bag-80` are identifiers, and no output carries text, units-as-labels or currency formatting.

#### Scenario: [CC26] Language-free
- GIVEN the results of cases S1, C2 and T1
- WHEN every string value is collected
- THEN each matches the identifier pattern, a canonical Rational string, or the currency code `USD`

### Requirement: Shareable state

The state MUST round-trip through the URL codec using the urlKeys above: pairs in declaration order, defaults omitted, lengths as canonical inches, `waste` as percent points, money as canonical dollars, `bag` and `shape` as option ids.

#### Scenario: [CC27] Encoding
- GIVEN the default state, the F1 state, and a metric state with `length = 240 in`, `waste = 25/2`, `bag = 60`, `bagPrice = $6.50`
- WHEN encoded
- THEN the queries are `v=1`, `v=1&sh=footing&l=216&n=3`, and `v=1&u=m&l=240&ws=25/2&bg=60&bp=13/2`
- AND `sh=steps` alone encodes as `v=1&sh=steps`, `rp = $150` as `v=1&rp=150`, and `rs = 8 in` with `rn = 10 in` as `v=1&rs=8&rn=10`

#### Scenario: [CC28] Decoding links
- GIVEN `v=1&sh=column&n=4`, `l=240&utm_source=x`, `v=1&u=m&l=240`, and `v=1&sh=Slab&bg=50&ws=51&n=0&ns=51`
- WHEN decoded
- THEN the states are the C2 state with no issues; `length = 240 in` with no issues; `length = 240 in` with `unitSystem = metric`; and all defaults with one `INVALID_VALUE` issue each for `sh`, `bg`, `ws`, `n`, `ns` in that order

#### Scenario: [CC29] Round trip
- GIVEN at least 1,000 random valid states in both unit systems
- WHEN encoded and decoded
- THEN the decoded state and unit system equal the originals with no issues

### Requirement: Registered in the web registry with bilingual labels

`apps/web/src/lib/calculators.ts` MUST list `concrete` (built with the yields of `concrete-mix`), so the registry-equals-directories test, the released-contract test, the language-free test and the catalog-completeness test cover it. The `apps/web` test suite MUST assert case S1 through that registry. Labels are specified in `i18n-catalog`.

#### Scenario: [CC30] Web registry
- GIVEN `apps/web` tests
- WHEN they run
- THEN the registry lists `rectangle-area` and `concrete`, `concrete` has its 17 tuples in `RELEASED`, and S1 computed through the registry gives `volumeYd3` 44/27 and 74 bags of 80 lb
