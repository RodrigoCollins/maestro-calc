# calc-topsoil

New capability. The topsoil calculator of `@maestro-calc/core` (`topsoil`), its catalog entries and its page module. Prefix: TS (first id: TS1).

## Requirements

### Requirement: Inputs

In order: `length` (default 10 ft, URL `l`), `width` (default 10 ft, URL `w`), `depth` (default 4 in, 0 to 2 ft, URL `d`), `waste` (default 10 %, 0 to 50, URL `ws`), `bag` (select `0-75` | `1` | `1-5` cubic feet, default `0-75`, URL `bg`), `bagPrice` (URL `bp`), `yardPrice` (URL `yp`).

#### Scenario: [TS1] Defaults
- THEN the calculator reads 10 ft by 10 ft by 4 in, 10 % extra, 0.75 cu ft bags, no prices (a unit test)

### Requirement: Volume, bags and costs

As `calc-mulch`: net = length × width × depth; total = net × (1 + waste / 100); bags = ⌈total ÷ bag volume⌉.

#### Scenario: [TS2] Default bed, hand-verified
- THEN net = 100/3 ft³; total = 110/3 ft³ = 110/81 yd³ (1.36), 1.04 m³; 49 bags of 0.75 cu ft (440/9 = 48.9), 37 of 1 cu ft, 25 of 1.5 cu ft (a unit test)

#### Scenario: [TS3] Costs
- GIVEN `bag = 1`, `bagPrice = $4`, `yardPrice = $45`
- THEN a bag cost of $148.00 (37 × 4) and a bulk cost of $61.11 (110/81 × 45 = 61.11…) (a unit test)

#### Scenario: [TS4] URL round trip
- THEN every valid state survives encode and decode (a property test)

### Requirement: Page module

The page (no route yet) shows cubic yards (or cubic meters) as the large figure, one bag line, two costs and the bed plan with the depth note, named by the answer: "A 10 ft by 10 ft area, 4 in deep, needs 1.36 cubic yards of topsoil: 49 bags of 0.75 cu ft."

#### Scenario: [TS5] Answer
- THEN the EN and ES answers read as above, hand-verified (a controller test)
