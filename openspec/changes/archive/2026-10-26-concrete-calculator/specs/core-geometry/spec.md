# Delta for core-geometry

Package: `@maestro-calc/core`. Shared geometry constants and functions that more than one calculator needs. First members: a documented rational value of π and the area of a circle. Depends on `exact-rational` and `units-quantities`. Prefix: GEO.

## ADDED Requirements

### Requirement: Rational pi

The package MUST export `PI`, an exact `Rational` equal to `314159265358979323846264338327950288 / 10^35` (the first 35 decimals of π, truncated; in lowest terms as every Rational is). The approximation error is `0 < π - PI < 10^-35` (the next decimals of π are `...950288 4197 1693 99...`, so truncation and rounding agree). No `Math.PI`, no JavaScript float, and no short fraction such as `22/7` or `355/113` MAY appear anywhere in `packages/core/src`. The value and its error bound are disclosed on the methodology page (`trust-pages`).

Source: decimal expansion of π, OEIS A000796 (3.14159265358979323846264338327950288419716939937510...).

#### Scenario: [GEO1] Exact value
- GIVEN `PI`
- WHEN compared with the Rational `314159265358979323846264338327950288/100000000000000000000000000000000000`
- THEN they are equal as Rationals

#### Scenario: [GEO2] Error bound against a longer literal
- GIVEN the 40-decimal literal `3.1415926535897932384626433832795028841971` as the Rational `31415926535897932384626433832795028841971/10^40`
- WHEN `PI` is subtracted from it
- THEN the difference is strictly greater than `0` and strictly less than `1/10^35`

#### Scenario: [GEO3] No float or short fraction in core
- GIVEN every non-test source file of `packages/core/src`
- WHEN searched for `Math.PI`, `22/7`, `22 / 7`, `355/113` and `355 / 113`
- THEN there is no match

### Requirement: Circle area

The package MUST export `circleArea(radius)` taking a `Quantity<'length'>` and returning a `Quantity<'area'>` equal to `PI x radius x radius`, exact (a Rational in canonical square inches), with no rounding. A negative radius MUST throw `CoreError` with code `NEGATIVE_QUANTITY`. A zero radius returns zero. The function is pure and tree-shakeable (a free function over immutable values, like the rest of `units-quantities`).

Hand-verified cases (`ft2 = in2 / 144`):

| radius | area in in2 | area in ft2 | to 4 decimals |
|---|---|---|---|
| `0 in` | 0 | 0 | 0.0000 |
| `1 in` | `PI` | `PI/144` | 0.0218 |
| `6 in` | `36 x PI` | `PI/4` | 0.7854 |
| `1 ft` (12 in) | `144 x PI` | `PI` | 3.1416 |
| `1/2 in` | `PI/4` | `PI/576` | 0.0055 |

#### Scenario: [GEO4] Table values
- GIVEN the radii of the table
- WHEN `circleArea` is evaluated and expressed in `in2` and `ft2`
- THEN each equals the table value exactly as a Rational (for example `circleArea(6 in)` in `ft2` equals `PI/4`, and `circleArea(1 ft)` in `ft2` equals `PI`)

#### Scenario: [GEO5] Scaling and ratio properties
- GIVEN at least 1,000 random non-negative radii per run
- WHEN evaluated
- THEN `circleArea(2r) = 4 x circleArea(r)` exactly, and for `r > 0` the ratio `circleArea(r) / (r x r)` (area over square, as a plain Rational) equals `PI` and lies strictly between `31415/10000` and `31416/10000`

#### Scenario: [GEO6] Negative radius
- GIVEN the radius `-1 in`
- WHEN `circleArea` is called
- THEN it throws `CoreError` with code `NEGATIVE_QUANTITY`

#### Scenario: [GEO7] Cylinder volume composes with the unit algebra
- GIVEN `circleArea(6 in)` and a height of `96 in`
- WHEN multiplied with `multiply` (area x length)
- THEN the result is a `Quantity<'volume'>` of exactly `3456 x PI` in3, which is `2 x PI` ft3 (3456 / 1728 = 2)
