# Delta for units-quantities

Package: `@maestro-calc/core`. Dimensioned quantities with exact conversions. Depends on `exact-rational`.

The API is a set of tree-shakeable free functions (`quantity`, `valueIn`, `add`, `sub`, `negate`, `abs`, `compare`, `equals`, `isZero`, `sign`, `scale`, `divideScalar`, `ratio`, `multiply`, `divide`, `findUnit`) over immutable values; there is no `Quantity` class with methods.

## ADDED Requirements

### Requirement: Dimension model

A dimension MUST be represented internally as an exponent vector over the base dimensions `length` and `mass` (for example area = length^2 mass^0, density = length^-3 mass^1), checked at runtime. The public, typed API exposes exactly these named dimensions in this change:

| Named dimension | Exponents (length, mass) | Canonical unit |
|---|---|---|
| `length` | (1, 0) | `in` |
| `area` | (2, 0) | `in2` |
| `volume` | (3, 0) | `in3` |
| `mass` | (0, 1) | `lb` |
| `density` | (-3, 1) | `lb/in3` |

A `Quantity<D>` MUST carry its named dimension in its type (compile-time) and MUST also carry its exponent vector at runtime for untyped callers. Every quantity is stored as an exact Rational in the canonical unit of its dimension. Quantities and units MUST be immutable.

The canonical mass unit is the avoirdupois pound (`lb`): the domain is US customary first (as the inch is for length), ounce and short-ton factors are then integers or unit fractions, and the kilogram stays exact through the 1959 definition of the pound.

Money is not a dimension (see the `money` capability); percent is a field kind, not a dimension. Angles and other dimensionless ratios are deferred: they MAY be added later as a dimensionless kind (exponent vector all zeros) by the roof-pitch change; this change defines no dimensionless quantity, and same-dimension quotients are plain Rationals (`ratio`).

#### Scenario: Dimension in the type
- GIVEN a `Quantity<'length'>` and a `Quantity<'area'>`
- WHEN the first is passed where `Quantity<'area'>` is expected
- THEN the typecheck gate rejects the program

#### Scenario: Runtime exponent vector
- GIVEN `quantity(2, ft)` and `quantity(1, lb)` used by an untyped caller
- WHEN their runtime dimensions are read
- THEN they are the vectors (1, 0) and (0, 1)

### Requirement: Exact unit factors

Each unit MUST define an exact Rational factor `f` such that `canonical = value x f`. The required units and factors are:

| Dimension | Unit id | Factor to canonical (exact) |
|---|---|---|
| length | `in` | 1 |
| length | `ft` | 12 |
| length | `yd` | 36 |
| length | `mm` | 5/127 |
| length | `cm` | 50/127 |
| length | `m` | 5000/127 |
| area | `in2` | 1 |
| area | `ft2` | 144 |
| area | `yd2` | 1296 |
| area | `mm2` | 25/16129 |
| area | `cm2` | 2500/16129 |
| area | `m2` | 25000000/16129 |
| volume | `in3` | 1 |
| volume | `ft3` | 1728 |
| volume | `yd3` | 46656 |
| volume | `mm3` | 125/2048383 |
| volume | `cm3` | 125000/2048383 |
| volume | `m3` | 125000000000/2048383 |
| mass | `lb` | 1 |
| mass | `oz` | 1/16 |
| mass | `ton` (US short ton) | 2000 |
| mass | `kg` | 100000000/45359237 |
| mass | `tonne` (metric ton) | 100000000000/45359237 |
| density | `lb/in3` | 1 |
| density | `lb/ft3` | 1/1728 |
| density | `lb/yd3` | 1/46656 |
| density | `ton/yd3` | 125/2916 |
| density | `kg/m3` | 2048383/56699046250 |

Length source: the international inch is defined as exactly 25.4 mm (international yard and pound agreement of 1959; NIST Special Publication 811, Appendix B; NIST Handbook 44 Appendix C). Hence 1 mm = 1/25.4 in = 10/254 = 5/127 in, 1 cm = 50/127 in, 1 m = 5000/127 in. 1 ft = 12 in and 1 yd = 3 ft = 36 in are exact by definition. Area and volume factors are the square and cube of the length factor. Arithmetic check: 127^2 = 16129 and 127^3 = 2,048,383; 144 = 12^2; 1296 = 36^2; 1728 = 12^3; 46656 = 36^3; (5000)^2 = 25,000,000; (5000)^3 = 125,000,000,000; 50^3 = 125,000. All metric factors reduce fully because 127 is prime and the numerators are products of 2 and 5 only.

Mass source: the international avoirdupois pound is exactly 0.45359237 kg (international yard and pound agreement of 1959; NIST SP 811 Appendix B; NIST Handbook 44 Appendix C). 1 oz = 1/16 lb and 1 short ton = 2000 lb are exact by definition (NIST Handbook 44 Appendix C); 1 tonne = 1000 kg (SI). Hence 1 kg = 1/0.45359237 lb = 100,000,000/45,359,237 lb; 45,359,237 is odd and does not end in 0 or 5, so it is coprime with 10^8 and the fraction is reduced. 1 tonne = 1000 x 10^8/45,359,237 = 10^11/45,359,237 lb.

Density factors are mass factor / volume factor: `lb/ft3` = 1/1728; `lb/yd3` = 1/46656; `ton/yd3` = 2000/46656 = 125/2916 (both divided by 16); `kg/m3` = (10^8/45,359,237) / (125,000,000,000/2,048,383) = 2,048,383 / (45,359,237 x 1250) = 2,048,383/56,699,046,250 (reduced: 2,048,383 = 127^3, 45,359,237 mod 127 = 44, and 127 is odd and not a multiple of 5).

No float literal (for example `0.0254`, `0.3048`, `0.45359237`) is permitted anywhere in unit definitions; factors are Rationals.

#### Scenario: Millimetre definition of the inch
- GIVEN the quantity `25.4 mm` (exact `127/5` mm)
- WHEN converted to inches
- THEN the value is exactly `1` (127/5 x 5/127 = 1)

#### Scenario: Metre to feet
- GIVEN `1 m`
- WHEN converted to feet
- THEN the value is exactly `1250/381` ((5000/127) / 12 = 5000/1524 = 1250/381; approx 3.2808399)

#### Scenario: Foot to metre
- GIVEN `1 ft`
- WHEN converted to metres
- THEN the value is exactly `381/1250` (12 x 127/5000 = 1524/5000 = 0.3048 m)

#### Scenario: Yard to metre
- GIVEN `1 yd`
- WHEN converted to metres
- THEN the value is exactly `1143/1250` (36 x 127/5000 = 4572/5000 = 0.9144 m)

#### Scenario: Cubic yard and cubic foot
- GIVEN `1 yd3`
- WHEN converted to ft3
- THEN the value is exactly `27` (46656 / 1728)
- AND `1 ft3` converted to yd3 is exactly `1/27`

#### Scenario: Square metre to square feet
- GIVEN `1 m2`
- WHEN converted to ft2
- THEN the value is exactly `1562500/145161` (25,000,000/16129 / 144 = 25,000,000/2,322,576; divide both by 16; approx 10.763910)

#### Scenario: Mass conversions
- GIVEN `1 kg`, `1 lb`, `1 ton`, `32 oz`, `1 tonne`
- WHEN converted to `lb`, `kg`, `kg`, `lb`, `ton` respectively
- THEN the values are exactly `100000000/45359237` (approx 2.2046226), `45359237/100000000` (0.45359237), `45359237/50000` (2000 x 45,359,237/10^8 = 90,718,474,000/10^8 = 907.18474 = 90,718,474/100,000, divided by 2), `2` (32/16), and `50000000/45359237` (10^11/45,359,237 / 2000 = 5 x 10^7/45,359,237; approx 1.1023113)

#### Scenario: Density as a derived dimension
- GIVEN the density `1.4 ton/yd3` (exact `7/5`) and the volume `3 yd3`
- WHEN the density is expressed in `lb/ft3`, and multiplied by the volume
- THEN the density is exactly `2800/27` lb/ft3 (7/5 x 2000 = 2800 lb per 27 ft3; approx 103.7037)
- AND the product is a `Quantity<'mass'>` of exactly `8400 lb` (3 x 2800), which is `21/5 ton` (8400/2000 = 4.2)

#### Scenario: Metric density
- GIVEN `1000 kg/m3` (water, approximately)
- WHEN converted to `lb/ft3`
- THEN the value is exactly `14158423296/226796185` (1000 x 2,048,383 x 1728 / 56,699,046,250 = 3,539,605,824,000 / 56,699,046,250; divide both by 250 to get 14,158,423,296 / 226,796,185; reduced because 226,796,185 = 5 x 45,359,237 and the numerator is 2^8 x 3^3 x 127^3; approx 62.42796)

#### Scenario: Table factor audit
- GIVEN the unit table above
- WHEN each area factor is compared with the square of the corresponding length factor, each volume factor with the cube, and each density factor with its mass factor divided by its volume factor
- THEN all comparisons are equal as Rationals

### Requirement: Construction and conversion

`quantity(value, unit)` MUST accept an exact Rational (or a safe integer) and a unit and return a quantity of the unit's dimension storing `value x factor`. `valueIn(q, unit)` MUST return `canonical / factor` as an exact Rational; passing a unit of another dimension is a compile-time error and MUST throw `DIMENSION_MISMATCH` at runtime. For every unit `u` and every Rational `x`, `valueIn(quantity(x, u), u)` MUST equal `x` (round trip identity). For any two units `u`, `w` of one dimension, converting through `w` MUST NOT change the quantity.

#### Scenario: Round trip across yd3 and ft3
- GIVEN `x = 7/3` and `quantity(x, yd3)`
- WHEN converted with `valueIn(_, ft3)` giving `63` (7/3 x 27) and re-wrapped with `valueIn(quantity(63, ft3), yd3)`
- THEN the result is `7/3`

#### Scenario: Round trip property
- GIVEN random Rationals (including negatives and zero) and each of the 28 units
- WHEN `valueIn(quantity(x, u), u)` is evaluated
- THEN it equals `x` for all samples

#### Scenario: Exact thirds of a foot
- GIVEN `quantity(1/3, ft)`
- WHEN expressed in inches
- THEN the value is exactly `4`
- AND `scale` by the Rational `3` yields a quantity equal to `quantity(1, ft)` (4 in x 3 = 12 in)

### Requirement: Same-dimension arithmetic

`add`, `sub`, `negate`, `abs`, `compare`, `equals`, `isZero`, `sign`, and `ratio` (same-dimension quotient returning a plain Rational) MUST operate on quantities of the same dimension. `scale(q, k)` and `divideScalar(q, k)` by an exact Rational MUST preserve the dimension (division by zero fails `DIVISION_BY_ZERO`; `ratio` with a zero divisor also fails `DIVISION_BY_ZERO`). Mixed-dimension `add`/`sub`/`compare`/`equals`/`ratio` MUST be a compile-time error and MUST also throw `DIMENSION_MISMATCH` when reached at runtime by untyped callers (the exponent vectors are compared).

#### Scenario: Addition across units
- GIVEN `quantity(1, ft)` and `quantity(6, in)`
- WHEN added
- THEN the result equals `18 in` (12 + 6)

#### Scenario: Negative and zero
- GIVEN `quantity(-5/2, in)`
- WHEN `abs` and `negate` are applied
- THEN the results are `5/2 in` and `5/2 in`; and `sign` of the original is -1; `quantity(0, m)` has `isZero` true and equals `quantity(0, ft)`

#### Scenario: Runtime dimension guard
- GIVEN an untyped caller adding a length and an area, or comparing a mass with a length
- WHEN the call executes
- THEN `DIMENSION_MISMATCH` is thrown

### Requirement: Derived products and quotients

`multiply(a, b)` and `divide(a, b)` MUST derive the result dimension by adding (respectively subtracting) the operands' exponent vectors, both at the type level and at runtime, without a per-pair overload table. A result whose exponent vector is not one of the named dimensions is a compile-time error (the result type is `never`) and MUST throw `DIMENSION_MISMATCH` at runtime. The combinations that therefore type-check in this change are:

- `length x length -> area`; `area x length -> volume` and `length x area -> volume`
- `area / length -> length`, `volume / area -> length`, `volume / length -> area`
- `mass / volume -> density`; `density x volume -> mass` and `volume x density -> mass`; `mass / density -> volume`

Division by a zero-valued quantity MUST fail `DIVISION_BY_ZERO`. Results are exact.

Formula source: Euclidean measures (area = length x width; volume = area x height) and density = mass / volume, applied to canonical-unit Rationals: `in x in = in2`, `in2 x in = in3`, `lb / in3 = lb/in3`.

#### Scenario: Length times length
- GIVEN `10 ft` (120 in) and `12 ft 6 in` (150 in)
- WHEN multiplied
- THEN the area is `18000 in2`, which is `125 ft2` (18000/144), `125/9 yd2` (18000/1296 = 125/9)

#### Scenario: Area times length
- GIVEN `18000 in2` and `2 ft` (24 in)
- WHEN multiplied
- THEN the volume is `432000 in3`, which is `250 ft3` (432000/1728)

#### Scenario: Inverse operation
- GIVEN the volume `432000 in3` divided by the area `18000 in2`
- WHEN evaluated
- THEN the length is `24 in`

#### Scenario: Mass over volume
- GIVEN `8400 lb` divided by `3 yd3`
- WHEN evaluated
- THEN the result is a `Quantity<'density'>` equal to `2800/27 lb/ft3` (8400/3 = 2800 lb per yd3 = 2800 lb per 27 ft3)

#### Scenario: Division by zero quantity
- GIVEN `divide(area, quantity(0, in))`
- WHEN evaluated
- THEN it fails `DIVISION_BY_ZERO`

#### Scenario: Unnamed product rejected
- GIVEN `multiply(area, area)` or `multiply(mass, length)`
- WHEN type-checked
- THEN the typecheck gate rejects it
- AND an untyped runtime call throws `DIMENSION_MISMATCH`

### Requirement: Unit lookup by id

`findUnit(dimension, id)` MUST look up a unit definition by id string within one named dimension, for use by parsers and codecs. Lookup MUST be exact-match on the ids in the table (case-sensitive); unknown ids MUST yield an explicit absent result (`undefined`) rather than a default.

#### Scenario: Known and unknown ids
- GIVEN the ids `ft`, `FT`, `furlong`, `ft2`
- WHEN looked up in the `length` dimension
- THEN `ft` resolves; `FT`, `furlong`, and `ft2` are absent (`ft2` belongs to `area`)
- AND `kg` resolves in `mass` but is absent in `length`
