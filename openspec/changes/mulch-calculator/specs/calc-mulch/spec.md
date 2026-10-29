# calc-mulch

New capability. The mulch calculator of `@maestro-calc/core` (`mulch`) and its catalog entries. Prefix: MU (first id: MU1).

## ADDED Requirements

### Requirement: Inputs

In order: `length` (default 20 ft, ft or m, 0 to 1,000 ft, URL `l`), `width` (default 4 ft, same, URL `w`), `depth` (default 3 in, in or cm, 0 to 2 ft, URL `d`), `waste` (percent, default 5, 0 to 50, URL `ws`), `bag` (select `2` | `3` cubic feet, default `2`, URL `bg`), `bagPrice` (money, URL `bp`), `yardPrice` (money per cubic yard, URL `yp`).

#### Scenario: [MU1] Defaults
- GIVEN no input
- WHEN the calculator runs
- THEN it reads 20 ft by 4 ft by 3 in, 5 % extra, 2 cu ft bags, no prices (a unit test)

### Requirement: Volume, bags and costs

Net volume = `length × width × depth`; total = net × (1 + waste / 100); bags = ⌈total ÷ bag volume⌉; bag cost = bags × bag price; bulk cost = total in cubic yards × yard price. Exact arithmetic; the bag count is the only rounding.

#### Scenario: [MU2] Default bed, hand-verified
- GIVEN the defaults
- THEN net = 20 ft³, total = 21 ft³ = 7/9 yd³ (0.78), 0.59 m³, and 11 bags of 2 cu ft (21 ÷ 2 = 10.5) (a unit test)

#### Scenario: [MU3] 3 cu ft bags and costs
- GIVEN the defaults, `bag = 3`, `bagPrice = $5`, `yardPrice = $36`
- THEN 7 bags (21 ÷ 3), a bag cost of $35.00 and a bulk cost of $28.00 (7/9 × 36) (a unit test)

### Requirement: URL and catalog

Every valid state round-trips through the URL (`RELEASED` tuples appended); the catalogs label every input, option and output in EN and ES.

#### Scenario: [MU4] URL round trip
- GIVEN any valid state
- THEN encode then decode returns it (a property test)
