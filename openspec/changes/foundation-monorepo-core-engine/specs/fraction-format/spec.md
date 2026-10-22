# Delta for fraction-format

Package: `@maestro-calc/core`. Rounding policy plus feet-inch-fraction (and general length) text parsing and formatting. Depends on `exact-rational` and `units-quantities`.

Principle: calculation never rounds. Rounding happens once, at the display or purchase boundary, through the functions in this spec. Parsing is exact and never rounds.

## ADDED Requirements

### Requirement: Fraction rounding policy

`roundToFraction(value, denominator, mode)` MUST round an exact Rational `value` to the nearest multiple of `1/denominator` and return the integer tick count `k` (a `bigint`) such that the rounded value is `k/denominator`.

- `denominator` MUST be an integer in 2..64 inclusive (any integer in the range, not only powers of two). Anything else (0, 1, 65, negative, non-integer, `NaN`) MUST fail with `INVALID_DENOMINATOR`.
- `mode` MUST be one of `nearest` (default), `up`, `down`. Any other value (including inherited property names such as `toString`) MUST fail with `INVALID_MODE`; `toDecimalParts` and `formatFeetInches` share this rule through the same rounding kernel.
  - `nearest`: closest multiple; exact ties (value x denominator has fractional part exactly 1/2) round away from zero, symmetrically for negatives.
  - `up`: smallest multiple >= value (toward positive infinity).
  - `down`: largest multiple <= value (toward negative infinity).
- A value that is already a multiple of `1/denominator` MUST be returned unchanged in every mode.

Source: round-half-away-from-zero ("commercial rounding"), the convention of ISO 80000-1:2009 Annex B for positive values (ties round up), extended symmetrically to negative values by this spec so that `round(-x) = -round(x)` in `nearest` mode. `up`/`down` are ceiling/floor on the signed value.

Hand-verified table (inches, `v x d` shown):

| value v | d | v x d | nearest | up | down |
|---|---|---|---|---|---|
| 1/128 | 64 | 1/2 | 1 | 1 | 0 |
| -1/128 | 64 | -1/2 | -1 | 0 | -1 |
| 3/128 | 64 | 3/2 | 2 | 2 | 1 |
| -3/128 | 64 | -3/2 | -2 | -1 | -2 |
| 1/3 | 16 | 16/3 = 5.333 | 5 | 6 | 5 |
| 2/3 | 16 | 32/3 = 10.667 | 11 | 11 | 10 |
| -1/3 | 16 | -16/3 = -5.333 | -5 | -5 | -6 |
| 3/4 | 16 | 12 | 12 | 12 | 12 |
| 5/4 | 2 | 5/2 | 3 | 3 | 2 |
| 1/2 | 3 | 3/2 | 2 | 2 | 1 |
| 0 | 7 | 0 | 0 | 0 | 0 |

#### Scenario: Tie at 1/128 inch rounds away from zero
- GIVEN value `1/128` in and denominator 64
- WHEN rounded with `nearest`
- THEN `k = 1` (the value is exactly halfway between 0 and 1/64)
- AND for `-1/128` the result is `k = -1`

#### Scenario: Directed modes on ties and non-ties
- GIVEN the table above
- WHEN each row is evaluated in the three modes
- THEN every cell matches exactly

#### Scenario: Non-power-of-two denominator
- GIVEN value `1/2` and denominator 3
- WHEN rounded `nearest`
- THEN `k = 2` (tie at 3/2 goes away from zero), i.e. the value `2/3`

#### Scenario: Invalid denominators
- GIVEN denominators `0`, `1`, `65`, `-2`, `2.5`, `NaN`
- WHEN rounding is requested
- THEN each fails `INVALID_DENOMINATOR`
- AND `2` and `64` succeed (boundaries are inclusive)

#### Scenario: Idempotence and symmetry properties
- GIVEN random Rationals and every denominator 2..64
- WHEN `nearest` rounding is applied twice, and again to the negated value
- THEN `round(round(x)) = round(x)`, `round(-x) = -round(x)`, and `|x - round(x)| <= 1/(2d)`
- AND `down(x) <= x <= up(x)` with `up(x) - down(x) <= 1/d`

### Requirement: Decimal display rounding

`toDecimalParts(value, places, mode)` MUST round an exact Rational `value` to the nearest multiple of `10^-places` using the same modes and tie rule as the fraction rounding policy (`nearest` with ties away from zero, `up` toward positive infinity, `down` toward negative infinity) and return `{ negative: boolean, integer: bigint, fraction: string }`, where `integer >= 0` is the whole part of the rounded magnitude, `fraction` is exactly `places` ASCII digits (zero-padded; the empty string when `places = 0`), and `negative` is true only when the rounded value is strictly less than zero (no negative zero). It never passes through `number`. Localized separators are a web concern; the parts carry no separator.

- `places` MUST be an integer in 0..12 inclusive; anything else (-1, 13, 1.5, `NaN`) MUST fail `INVALID_PLACES`.

Source: same rounding convention as the fraction policy (ISO 80000-1:2009 Annex B, extended symmetrically to negatives).

Hand-verified table (`v x 10^places` shown; text written as `[-]integer.fraction` for readability):

| value v | places | v x 10^p | nearest | up | down |
|---|---|---|---|---|---|
| 1/3 | 2 | 33.33 | 0.33 | 0.34 | 0.33 |
| 2/3 | 2 | 66.67 | 0.67 | 0.67 | 0.66 |
| 1/8 | 2 | 12.5 (tie) | 0.13 | 0.13 | 0.12 |
| -1/8 | 2 | -12.5 (tie) | -0.13 | -0.12 | -0.13 |
| 5/2 | 0 | 2.5 (tie) | 3 | 3 | 2 |
| -5/2 | 0 | -2.5 (tie) | -3 | -2 | -3 |
| 1/20 | 1 | 0.5 (tie) | 0.1 | 0.1 | 0.0 |
| -1/1000 | 2 | -0.1 | 0.00 | 0.00 | -0.01 |
| 145161/12500 | 2 | 1161.288 | 11.61 | 11.62 | 11.61 |
| 145161/12500 | 4 | 116128.8 | 11.6129 | 11.6129 | 11.6128 |
| 7 | 3 | 7000 | 7.000 | 7.000 | 7.000 |

#### Scenario: Decimal table
- GIVEN the table above
- WHEN each row is evaluated in the three modes
- THEN every cell matches exactly (for example `-1/8` at 2 places `nearest` is `{ negative: true, integer: 0, fraction: "13" }` and `7` at 3 places is `{ negative: false, integer: 7, fraction: "000" }`)

#### Scenario: No negative zero in decimals
- GIVEN `-1/1000` at 2 places
- WHEN rounded `nearest` or `up`
- THEN the parts are `{ negative: false, integer: 0, fraction: "00" }`

#### Scenario: Places boundaries
- GIVEN `1/3` at 12 places, and places `-1`, `13`, `1.5`, `NaN`
- WHEN rounded `nearest`
- THEN the first gives fraction `"333333333333"` (12 digits) with integer `0`; the others fail `INVALID_PLACES`
- AND places `0` succeeds with an empty fraction

### Requirement: Purchase ceiling

`ceilToPurchaseUnits(quantity)` MUST return the smallest non-negative integer `n` (`bigint`) with `n >= quantity` for an exact Rational quantity of purchase units. Exact integers MUST map to themselves (no floating-point overshoot). A negative input MUST fail with `NEGATIVE_QUANTITY`. Zero returns 0.

Source: a purchase cannot be fractional; whole units are bought (ceiling). No other rounding of purchase quantities is allowed.

#### Scenario: Exact integers do not overshoot
- GIVEN `18000/144` (exactly 125) and `(7/10) x (10/7)` (exactly 1)
- WHEN passed to the ceiling
- THEN the results are `125` and `1`

#### Scenario: Fractions round up
- GIVEN `7/2`, `1/1000000000000000000000000000000`, `0`
- WHEN passed to the ceiling
- THEN the results are `4`, `1`, `0`

#### Scenario: Negative rejected
- GIVEN `-1/2`
- WHEN passed to the ceiling
- THEN it fails `NEGATIVE_QUANTITY`

### Requirement: Feet-inch-fraction formatting

`formatFeetInches(length, { denominator, mode })` MUST take a `Quantity<'length'>`, round its inch value per the rounding policy (the signed value is rounded; `denominator` required, `mode` default `nearest`), then return both structured parts and canonical text:

- Parts: `{ negative: boolean, feet: bigint, inches: bigint, fraction: { numerator: bigint, denominator: bigint } }` where `feet >= 0`, `0 <= inches <= 11`, the fraction is in lowest terms with `0 <= numerator < denominator` (a zero fraction is `0/1`), and `negative` is true only when the rounded value is strictly less than zero (no negative zero).
- Carry: when rounding reaches a full inch or foot, the carry propagates (inches to feet).
- Canonical text (ASCII marks): `[-]<feet>' <inches>"` where the inches portion is `<whole>` when the fraction is zero, `<whole> <n>/<d>` when whole inches and a fraction are both non-zero, and `<n>/<d>` when whole inches are zero and the fraction is non-zero. The feet component is always present, including `0'`. Example forms: `5' 3 1/2"`, `1' 0"`, `0' 11 15/16"`, `0' 3/4"`.

Source: US customary tape-measure convention with 1 ft = 12 in (NIST SP 811 Appendix B) and binary or other fractions of an inch.

#### Scenario: Mixed number
- GIVEN `127/2` in (63.5 in) and denominator 16
- WHEN formatted
- THEN text is `5' 3 1/2"` (63 = 5 x 12 + 3; 8/16 reduces to 1/2)
- AND parts are `{ negative: false, feet: 5, inches: 3, fraction: 1/2 }`

#### Scenario: Carry at the foot boundary (11 15/16" + 1/16")
- GIVEN `191/16` in (11 15/16") plus `1/16` in
- WHEN the sum (`192/16` = 12 in) is formatted at denominator 16
- THEN text is `1' 0"`
- AND `191/16` alone formats as `0' 11 15/16"`

#### Scenario: Rounding carries across inch and foot
- GIVEN `383/32` in (11 31/32") and denominator 16
- WHEN formatted `nearest` (383/32 x 16 = 191.5, a tie, rounds to 192 = 12 in)
- THEN text is `1' 0"`
- AND GIVEN `9215/64` in (143 63/64") at denominator 32 (63/64 x 32 = 31.5, a tie, rounds to 32), the text is `12' 0"`; at denominator 64 it is `11' 11 63/64"`

#### Scenario: Zero
- GIVEN `0 in`
- WHEN formatted at any valid denominator
- THEN text is `0' 0"` and `negative` is false

#### Scenario: Negative values
- GIVEN `-127/2` in and denominator 16
- WHEN formatted
- THEN text is `-5' 3 1/2"` and `negative` is true
- AND `-1/128` in at denominator 64 formats as `-0' 1/64"` (tie rounds away from zero)

#### Scenario: No negative zero
- GIVEN `-1/200` in at denominator 64 (-64/200 = -0.32, rounds to 0)
- WHEN formatted
- THEN text is `0' 0"` and `negative` is false

#### Scenario: Exact feet and large values
- GIVEN `144 in` and `2401/2 in` (1200.5 in) at denominator 2
- WHEN formatted
- THEN texts are `12' 0"` and `100' 1/2"`

#### Scenario: Reduced fractions and non-binary denominators
- GIVEN `3/4` in at denominator 8 (6/8) and `1/2` in at denominator 3
- WHEN formatted
- THEN texts are `0' 3/4"` and `0' 2/3"`

#### Scenario: Directed modes
- GIVEN `1/128` in at denominator 64
- WHEN formatted with `up` and with `down`
- THEN texts are `0' 1/64"` and `0' 0"`
- AND `-1/128` formats `up` as `0' 0"` and `down` as `-0' 1/64"`

#### Scenario: Thirds of a foot
- GIVEN `1/3 ft` (4 in) and `1/3 in` at denominator 16
- WHEN formatted
- THEN texts are `0' 4"` and `0' 5/16"` (16/3 = 5.33 rounds to 5)

### Requirement: Length text grammar

`parseLength(text, { defaultUnit })` MUST convert user text to a `Quantity<'length'>` exactly (never rounding, never via `number`) or return a failure whose `errors` holds exactly one `{ code }` (see the failure conventions in `exact-rational`). The error MAY also carry an additive `offset` (zero-based index into the original text where the fault was detected) for UI highlighting; consumers MUST NOT depend on it. `defaultUnit` (a length unit, default `in`) applies only to numbers written without any unit marker; the calculator contract chooses it from the active unit system.

Pre-processing and lexical rules:

- Maximum input length is 128 characters (counted before trimming); longer input fails `TOO_LONG`.
- Whitespace (`ws`) is one or more of U+0020, U+0009, U+00A0. Other whitespace (newline, etc.) is `MALFORMED`. Leading and trailing `ws` is ignored.
- Digits are ASCII `0-9` only. Any single digit run longer than 18 digits fails `TOO_LARGE`. Decimal separator is `.`; any comma anywhere in the input fails `DECIMAL_COMMA` (a comma used as decimal or thousands separator; `1,000 ft` is never read as 1 ft). Locale-aware decimal input is out of scope for this change.
- Feet marks: `'` U+0027, `′` U+2032 (prime), `’` U+2019 (typographic apostrophe produced by smartphone keyboards), or words `ft`, `foot`, `feet`.
- Inch marks: `"` U+0022, `″` U+2033 (double prime), `”` U+201D (typographic closing quote), or words `in`, `inch`, `inches`.
- Other unit words: `yd`, `yard`, `yards`, `mm`, `cm`, `m`, `meter`, `meters`, `metre`, `metres`.
- Unit words are case-insensitive.
- A unit token is a maximal run `[A-Za-z]+[0-9]*`. When such a token directly follows a digit (no whitespace) and is `e`/`E` or `x`/`X` followed by a digit, it is numeric notation (exponent or hex) and fails `MALFORMED`. Any other unit token that follows a number and is not in the lists above (for example `furlongs`, `sq`, `ft2`, `m2`, `yd3`) fails `UNKNOWN_UNIT`. Input with no number at all (for example `abc`, `ft`) is `MALFORMED`.

Grammar (EBNF; `ws*` is zero or more `ws`, `ws+` is one or more):

```
input     := ws* sign? body ws*
sign      := "-" | "+" | "−"                      (U+002D, U+002B, U+2212)
body      := compound | simple
compound  := uint ws* FEETMARK sep inches ws* INCHMARK?
sep       := ws* | "-"                             (hyphen immediately adjacent to both neighbours)
inches    := number                                (any form below)
simple    := number ws* UNIT?
UNIT      := FEETMARK | INCHMARK | unit-word
FEETMARK  := "'" | "′" | "’" | "ft" | "foot" | "feet"
INCHMARK  := '"' | "″" | "”" | "in" | "inch" | "inches"
unit-word := "yd" | "yard" | "yards" | "mm" | "cm" | "m" | "meter" | "meters" | "metre" | "metres"
number    := mixed | fraction | decimal
mixed     := uint ( ws+ | "-" ) fraction
fraction  := uint "/" uint                         (no whitespace around "/")
decimal   := uint ( "." uint )? | "." uint
uint      := [0-9]+
```

Semantics and constraints:

- The sign applies to the whole value (`-5' 3"` is -63 in, not -60 + 3).
- `compound` = feet (non-negative integer only) + inches. The inch mark is OPTIONAL only when the feet mark is a symbol (`'`, `′`, `’`); if the feet mark is a word (`ft`, `foot`, `feet`) the inch mark MUST be present (so `5 ft 2` is not read as 5 ft 2 in; it fails `MALFORMED`).
- The inches component of a compound is not limited to < 12 (`5' 15"` is 75 in).
- Fraction denominators are any positive integer (not limited to 2..64); denominator `0` fails `ZERO_DENOMINATOR`.
- `simple` with no `UNIT` uses `defaultUnit`. `simple` with a unit accepts all numeric forms, including mixed numbers and decimals (`1 1/2 ft`, `0.1 ft`).
- A unit token that is not in the lists above fails `UNKNOWN_UNIT` per the lexical rule (including area or volume shorthands such as `ft2`, `m2` and words such as `furlongs`, `sq`); fractional feet are not allowed in a compound (`5.5' 3"` is `MALFORMED`).
- Empty or whitespace-only input fails `EMPTY`.
- Any other deviation (including unit-only input, two feet parts, inches before feet, a space around the slash, exponent notation, full-width digits, double signs, a space between sign and number, a negative sign after the foot mark) fails `MALFORMED`.
- Result precedence for inputs with several faults: `TOO_LONG`, then `EMPTY`, then `DECIMAL_COMMA` (any comma present); otherwise any one applicable code; never success.
- The function never throws.

#### Scenario: Equivalent spellings of 63.5 inches
- GIVEN `5' 3-1/2"`, `5ft 3 1/2in`, `63.5in`, `5' 3.5"`, `5'-3 1/2"`, `5'3 1/2`, `5′ 3 1/2″`, `5’ 3 1/2”`
- WHEN each is parsed
- THEN every result equals `127/2` in (5 x 12 + 3.5 = 63.5)

#### Scenario: Feet only, inches only, bare numbers
- GIVEN `5'`, `5'3"`, `5 ft 3 in`, `3/4` (default unit in), `3/4` (default unit ft), `5` (default unit in), `5` (default unit ft), `3-1/2`
- WHEN each is parsed
- THEN results are `60`, `63`, `63`, `3/4`, `9`, `5`, `60`, `7/2` inches (3/4 ft = 9 in)

#### Scenario: Signs and unicode minus
- GIVEN `-5' 3"`, `−5' 3"` (U+2212), `+5'`, `-0"`, `0' 0"`
- WHEN parsed
- THEN results are `-63`, `-63`, `60`, `0`, `0` inches; zero has no sign

#### Scenario: Whitespace tolerance
- GIVEN `  5'   3  1/2"  ` and `5'` U+00A0 `3"`
- WHEN parsed
- THEN results are `127/2` and `63` inches

#### Scenario: Inches beyond 11 and large feet
- GIVEN `5' 15"` and `100'`
- WHEN parsed
- THEN results are `75` and `1200` inches

#### Scenario: Metric and other units
- GIVEN `1.5 m`, `10 mm`, `2.54 cm`, `1 yd`, `0.1 ft`, `1 1/2 ft`, `5 FT`
- WHEN parsed
- THEN results in inches are `7500/127` (3/2 x 5000/127), `50/127`, `1` (254/100 = 127/50 cm x 50/127), `36`, `6/5` (1/10 x 12), `18`, `60`

#### Scenario: Exactness (no rounding in parse)
- GIVEN `1/3"` and `3/7"`
- WHEN parsed
- THEN results are exactly `1/3` in and `3/7` in

#### Scenario: Empty and too long
- GIVEN `""`, `"   "`, a 128-character input (`1`, then 126 spaces, then `'`), and the same with 127 spaces (129 characters)
- WHEN parsed
- THEN results are `EMPTY`, `EMPTY`, success (12 in), and `TOO_LONG`

#### Scenario: Zero denominator
- GIVEN `1/0"` and `3 1/0`
- WHEN parsed
- THEN both fail `ZERO_DENOMINATOR`

#### Scenario: Huge digit runs
- GIVEN `123456789012345678"` (18 digits), `1234567890123456789"` (19 digits), and `0.1234567890123456789` (19 fractional digits)
- WHEN parsed
- THEN results are success (exactly 123456789012345678 in), `TOO_LARGE`, `TOO_LARGE`

#### Scenario: Unknown unit
- GIVEN `5 furlongs`, `5 sq ft`, `5 m2`, `5 ft2`, `5ft2`, `2 yd3`
- WHEN parsed
- THEN each fails `UNKNOWN_UNIT` (unit tokens `furlongs`, `sq`, `m2`, `ft2`, `ft2`, `yd3` are not length units)

#### Scenario: Comma rejected with a dedicated code
- GIVEN `5,5`, `1,000 ft`, `1,000.5"`, `5' 3,5"`
- WHEN parsed
- THEN each fails `DECIMAL_COMMA`

#### Scenario: Malformed inputs
- GIVEN `"` , `'`, `ft`, `abc`, `5' 3 1/2 1/2"`, `5.5' 3"`, `5' -3"`, `5" 3'`, `3//4`, `1 / 2`, `1e3`, `1E9`, `0x10`, `５'`, `5'3'`, `--5`, `- 5`, `5 3 1/2`, `.`, `1.`, `5'-`, `3.5 1/2`, `1/2.5`, `1 yd 2 ft`, `5 ft 2`, and an input containing a newline
- WHEN each is parsed
- THEN each fails `MALFORMED` and none throws

### Requirement: Format/parse round trip

For every denominator `d` in 2..64 and every integer `k` (positive, negative, zero, magnitudes beyond 10^9) with `|k/d| < 10^15` inches (the bound keeps every digit run within the parser's 18-digit limit with margin), the length `q = k/d` inches MUST satisfy `parseLength(formatFeetInches(q, d).text) = q`. Furthermore, for every canonical text `t` produced by the formatter, `formatFeetInches(parseLength(t), d).text = t` at the same `d`.

#### Scenario: Property-based round trip
- GIVEN at least 1,000 random `(k, d)` pairs per run with `d` in 2..64 and `|k/d| < 10^15`
- WHEN formatted and re-parsed
- THEN the parsed value equals `k/d` inches in every case

#### Scenario: Idempotent formatting
- GIVEN the canonical texts `5' 3 1/2"`, `1' 0"`, `-0' 1/64"`
- WHEN parsed and formatted at denominators 2, 2, 64 respectively
- THEN the same texts are produced
