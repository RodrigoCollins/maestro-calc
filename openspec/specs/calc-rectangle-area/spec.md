# calc-rectangle-area

Package: `@maestro-calc/core` (calculator `rectangle-area`) with labels in `@maestro-calc/i18n`. The single proof calculator of this change: it exercises exact lengths, mixed imperial/metric input, exact area conversion, the calculator contract, the URL codec, and the catalog. It is not a product page; no UI is in scope.

## Requirements

### Requirement: Descriptor

The calculator `rectangle-area` MUST be defined through `defineCalculator` with these inputs in this order:

| key | kind | urlKey | default | constraints |
|---|---|---|---|---|
| `length` | length | `l` | `10 ft` (120 in) | defaultUnit `ft`, metricDefaultUnit `m`, min `0` (inclusive), max `100000 ft` (inclusive) |
| `width` | length | `w` | `10 ft` (120 in) | defaultUnit `ft`, metricDefaultUnit `m`, min `0` (inclusive), max `100000 ft` (inclusive) |

Both fields accept every length unit and form defined by `fraction-format` (feet-inch-fraction, decimals, metric) in either unit system. A unit-less number is feet under the `imperial` unit system and metres under `metric`. It MUST be recorded in the released URL contract snapshot (`url-state-codec`, `released.contract.test.ts`) with exactly the keys and defaults above (`l` and `w`, default `120`).

Outputs (declaration order, all of measure `area`):

| key | role | display hint |
|---|---|---|
| `areaFt2` | `primary` | `{ unit: 'ft2', format: 'decimal', places: 2 }` |
| `areaYd2` | `secondary` | `{ unit: 'yd2', format: 'decimal', places: 2 }` |
| `areaM2` | `secondary` | `{ unit: 'm2', format: 'decimal', places: 2 }` |

The calculator declares no warnings and produces no shopping lines.

#### Scenario: Metadata
- GIVEN the `rectangle-area` calculator
- WHEN its input descriptors are read
- THEN inputs and outputs match the tables exactly

### Requirement: Area computation (exact)

Formula: `area = length x width` (area of a rectangle, Euclidean geometry), computed on exact Rationals in canonical inches (`in x in = in2`), then expressed in `ft2`, `yd2`, `m2` using the exact factors of `units-quantities` (international inch = 25.4 mm exactly, 1959; NIST SP 811 Appendix B). No rounding occurs in `compute`; results are exact Rationals. Rounding for display is the web layer's responsibility.

Hand-verified examples (`ft2 = in2 / 144`, `yd2 = in2 / 1296`, `m2 = in2 x 16129 / 25,000,000`):

| Case | length x width | in2 | ft2 | yd2 | m2 |
|---|---|---|---|---|---|
| A | `10'` x `12' 6"` (120 x 150 in) | 18000 | 125 | 125/9 | 145161/12500 |
| B | `3' 6"` x `2'` (42 x 24 in) | 1008 | 7 | 7/9 | 1016127/1562500 |
| C | `5' 3-1/2"` x `2'` (127/2 x 24 in) | 1524 | 127/12 | 127/108 | 6145149/6250000 |
| D | `3 m` x `2 m` (15000/127 x 10000/127 in) | 150000000/16129 | 3125000/48387 | 3125000/435483 | 6 |
| E | `10'` x `2 m` (120 x 10000/127 in) | 1200000/127 | 25000/381 | 25000/3429 | 762/125 |
| F | defaults `10 ft` x `10 ft` (120 x 120 in) | 14400 | 100 | 100/9 | 145161/15625 |
| G | `0` x `10'` | 0 | 0 | 0 | 0 |
| H | `100000'` x `100000'` (1,200,000 in each) | 1,440,000,000,000 | 10,000,000,000 | 10,000,000,000/9 | 929,030,400 |

Arithmetic, line by line:

- A: 120 x 150 = 18000; 18000/144 = 125 (144 x 125 = 18000); 18000/1296 = 125/9 (divide by 144); m2: 18000 x 16129 = 290,322,000; / 25,000,000 = 290322/25000 = 145161/12500 (numerator odd and not a multiple of 5, so reduced). Check by metres: 3.048 m x 3.81 m = 11.61288 m2 = 145161/12500.
- B: 42 x 24 = 1008; 1008/144 = 7; 1008/1296 = 7/9; m2: 1008 x 16129 = 16,258,032; / 25,000,000, both divided by 16 = 1,016,127 / 1,562,500 (reduced). Check: 1.0668 m x 0.6096 m = 0.65032128 m2.
- C: 127/2 x 24 = 1524; 1524/144 = 127/12; 1524/1296 = 127/108; m2: 1524 x 16129 = 24,580,596; / 25,000,000, both divided by 4 = 6,145,149 / 6,250,000 (reduced). Check: 1.6129 m x 0.6096 m = 0.98322384 m2.
- D: 3 m = 3 x 5000/127 = 15000/127 in; 2 m = 10000/127 in; product 150,000,000/16129 in2; ft2 = /144 = 150,000,000/2,322,576 = 3,125,000/48,387 (divide by 48); yd2 = /9 = 3,125,000/435,483; m2 = in2 / (25,000,000/16129) = 6 exactly. Check: 6 m2 x 10.76391 = 64.5835 ft2 (3,125,000/48,387 = 64.58349).
- E: 10 ft = 120 in; 2 m = 10000/127 in; product 1,200,000/127 in2; ft2 = /144 = 25000/381 (gcd 48); yd2 = 25000/3429; m2 = 1,200,000/127 x 16129/25,000,000 = 1,200,000 x 127/25,000,000 = 152,400,000/25,000,000 = 6.096 = 762/125. Check: 3.048 m x 2 m = 6.096 m2.
- F: 120 x 120 = 14400; /144 = 100; /1296 = 100/9; m2 = 14400 x 16129 / 25,000,000 = 232,257,600/25,000,000 = 9.290304 = 145161/15625.
- G: any zero factor gives 0.
- H: 100000 ft = 1,200,000 in; square = 1.44 x 10^12 in2; /144 = 10^10 ft2; yd2 = 10^10/9; m2: 30,480 m x 30,480 m = 929,030,400.

#### Scenario: Mixed imperial feet-inch-fraction (cases A, B, C)
- GIVEN raw inputs per cases A, B, and C (written exactly as shown)
- WHEN `run` is called
- THEN `areaFt2`, `areaYd2`, `areaM2` equal the table values exactly (as Rationals, not floating-point approximations)

#### Scenario: Metric and mixed units (cases D, E)
- GIVEN `{ length: "3 m", width: "2 m" }` and `{ length: "10'", width: "2 m" }`
- WHEN run
- THEN outputs equal rows D and E exactly
- AND in D the `areaM2` output equals the Rational `6`, proving metric round-trip exactness

#### Scenario: Defaults (case F)
- GIVEN `{}`
- WHEN run
- THEN outputs equal row F

#### Scenario: Zero dimension (case G)
- GIVEN `{ length: "0", width: "10'" }`
- WHEN run
- THEN all three outputs are exactly 0 and no error occurs

#### Scenario: Unit-less numbers are feet (imperial)
- GIVEN `{ length: "10", width: "12.5" }`
- WHEN run (default unit system `imperial`)
- THEN `areaFt2` is `125` (12.5 ft = 150 in), identical to case A

#### Scenario: Unit-less numbers are metres (metric)
- GIVEN `{ length: "3", width: "2" }` run with `{ unitSystem: 'metric' }`
- WHEN run
- THEN the outputs equal row D exactly (3 m = 15000/127 in, 2 m = 10000/127 in): `areaFt2 = 3125000/48387`, `areaYd2 = 3125000/435483`, `areaM2 = 6`
- AND `{ length: "10'", width: "2" }` with `{ unitSystem: 'metric' }` equals row E (`10'` keeps its explicit feet; `2` is metres)

#### Scenario: Maximum bounds (case H)
- GIVEN `{ length: "100000'", width: "100000'" }`
- WHEN run
- THEN outputs equal row H exactly
- AND `{ length: "100001'" }` fails with `{ field: 'length', code: 'ABOVE_MAX' }`

#### Scenario: Invalid inputs
- GIVEN `{ length: "-1" }`, `{ width: "abc" }`, `{ length: "1/0" }`, `{ width: "5 furlongs" }`, `{ length: "" }`, `{ length: "1e9" }`, `{ length: "999999999999999999 ft" }`, `{ width: "10,5" }`, `{ length: "10 ft2" }`
- WHEN each is run alone
- THEN the errors are `BELOW_MIN`, `MALFORMED`, `ZERO_DENOMINATOR`, `UNKNOWN_UNIT`, `EMPTY`, `MALFORMED`, `ABOVE_MAX`, `DECIMAL_COMMA`, `UNKNOWN_UNIT` on the named field, and no result is produced

#### Scenario: Result shape
- GIVEN any valid run
- WHEN the result is inspected
- THEN `outputs` has exactly the keys `areaFt2` (primary), `areaYd2` (secondary), `areaM2` (secondary) in that order, each a `Quantity` of dimension area, and `shopping` and `warnings` are empty
- AND every string in the result is an identifier (language-free)

### Requirement: Consistency properties

For random valid lengths `l` and widths `w`: swapping them yields identical outputs; `areaYd2 x 9 = areaFt2` exactly; `areaM2` equals `areaFt2 x 381/1250 x 381/1250` exactly (since 1 ft = 381/1250 m, hence 1 ft2 = 145161/1562500 m2); outputs are non-negative.

#### Scenario: Properties hold
- GIVEN at least 1,000 random pairs of valid lengths per run
- WHEN computed
- THEN all four properties hold with exact equality

### Requirement: Shareable state

The calculator's state MUST round-trip through the URL codec using urlKeys `l` and `w`.

#### Scenario: Encoding
- GIVEN length `12' 6"` (150 in) and default width
- WHEN encoded
- THEN the query is `v=1&l=150`
- AND length `5' 3-1/2"` (127/2 in) with width `2'` (24 in) encodes as `v=1&l=127/2&w=24`
- AND the case D state (3 m x 2 m) under the metric unit system encodes as `v=1&u=m&l=15000/127&w=10000/127`

#### Scenario: Decoding links
- GIVEN `v=1&l=150`, `v=1&l=abc&w=24`, `l=150&w=24&utm_source=x`, `v=1&u=m&l=127%2F2`
- WHEN decoded
- THEN states are `length = 150 in, width = 120 in`; `length = 120 in` (default, one `INVALID_VALUE` for `l`) with `width = 24 in`; `length = 150 in, width = 24 in` with no issues; `length = 127/2 in`, `width = 120 in`, `unitSystem = metric` with no issues

### Requirement: Bilingual labels

Every label key required by the i18n convention for `rectangle-area` MUST exist in both `en` and `es` with the exact values given in `i18n-catalog`. `apps/web` MUST import the calculator and the catalogs through their package entry points, list the calculator in `apps/web/src/lib/calculators.ts`, and its test suite MUST assert case A through that import.

#### Scenario: Catalog completeness for the calculator
- GIVEN the `rectangle-area` descriptors and output keys
- WHEN the required keys are derived by convention
- THEN each resolves in both `en` and `es`

#### Scenario: Web smoke import
- GIVEN the `apps/web` test project
- WHEN it runs
- THEN it computes case A via `@maestro-calc/core/calculators/rectangle-area` and, with `t = createTranslator({ ...esCommon, ...esRectangleArea })` built from the `es` catalog modules of `@maestro-calc/i18n`, renders `t('calc.rectangle-area.title')` as `Área de un rectángulo`
