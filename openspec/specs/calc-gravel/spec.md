# calc-gravel

New capability. The gravel calculator of `@maestro-calc/core` (`createGravel`), its densities in `@maestro-calc/data` and its catalog entries in `@maestro-calc/i18n`. Prefix: GR (first id: GR1). Out of scope here: the page, its content and the drawing.

## Requirements

### Requirement: Inputs

The calculator MUST take, in this order: `length` (default 20 ft, read in ft or m, 0 to 1,000 ft, URL `l`), `width` (default 10 ft, same units and range, URL `w`), `depth` (default 4 in, read in in or cm, 0 to 10 ft, URL `d`), `placement` (select `compacted` | `loose`, default `compacted`, URL `pl`), `waste` (percent, default 5, 0 to 50, URL `ws`) and `tonPrice` (money, default $0, at most $10,000, URL `tp`).

#### Scenario: [GR1] Defaults
- GIVEN no input
- WHEN the calculator runs
- THEN it reads 20 ft by 10 ft by 4 in, compacted, 5 % extra, no price (a unit test)

### Requirement: Weight and volume

The placed volume MUST be `length × width × depth`; the total volume `placed × (1 + waste / 100)`; the weight `total × density(placement)`; the loose volume to order `weight ÷ density(loose)`. Arithmetic is exact; rounding happens only for display (2 places). The cost is `tonPrice × weight in short tons`.

#### Scenario: [GR2] Default driveway, hand-verified
- GIVEN the defaults and the densities 3,660 lb/yd³ (compacted) and 2,580 lb/yd³ (loose)
- WHEN the calculator runs
- THEN placed = 20 × 10 × 1/3 = 66.67 ft³ = 2.47 yd³; total = 70.00 ft³ = 2.59 yd³; weight = 70/27 × 1.83 = 4.74 short tons (4.30 tonnes); loose volume to order = 4.74 ÷ 1.29 = 3.68 yd³ (a unit test with exact fractions)

#### Scenario: [GR3] Loose placement orders its own volume
- GIVEN `placement = loose` and the other defaults
- WHEN the calculator runs
- THEN the weight is 70/27 × 1.29 = 3.34 short tons and the loose volume to order equals the total volume, 2.59 yd³ (a unit test)

#### Scenario: [GR4] Cost
- GIVEN the defaults and `tonPrice = $45`
- WHEN the calculator runs
- THEN the cost is $45 × 4.744… = $213.50 (a unit test)

### Requirement: Injected densities

`createGravel` MUST take the two densities from its caller (the composition root of `apps/web`), validate them (an object with exactly `compacted` and `loose`, each a density above zero, else `INVALID_DEFINITION` with reason `GRAVEL_DENSITIES`) and keep a frozen snapshot. Core never imports the data package.

#### Scenario: [GR5] Bad densities
- GIVEN `null`, a missing key, an extra key or a zero density
- WHEN `createGravel` is called
- THEN it throws `INVALID_DEFINITION` with reason `GRAVEL_DENSITIES` (a unit test)

### Requirement: URL and catalog

The URL codec MUST round-trip every valid state with the keys above (`RELEASED` tuples appended), and the catalogs MUST label every input, option and output in EN and ES (neutral tú register).

#### Scenario: [GR6] URL round trip
- GIVEN any valid state (property test)
- WHEN it is encoded and decoded
- THEN the state is equal (a property test)
