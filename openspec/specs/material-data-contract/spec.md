# material-data-contract

Package: `@maestro-calc/data`. The typed shape of a material record and its definition-time validation. This change ships NO materials; the first real materials arrive with the first calculator that needs them (Concrete). Depends on `@maestro-calc/core` only.

## Requirements

### Requirement: Material record shape

The package MUST export types and a `defineMaterial(record)` function describing a material:

- `id`: identifier matching `^[a-z][a-z0-9]*(-[a-z0-9]+)*$`; unique within a registry.
- `nameKey`: i18n key of the form `material.<id>.name`.
- `purchaseUnits`: non-empty list; each entry has `id` (matching `^[a-z][a-z0-9]*(-[a-z0-9]+)*$`, unique within the material), `nameKey` of the form `material.<id>.units.<unitId>`, and `size`, a core `Quantity` (any dimension) stating the physical amount one purchase unit provides (for example 32 ft2 for a 4 x 8 ft sheet).
- `source`: provenance with `name` (non-empty text) and `retrieved` (ISO date `YYYY-MM-DD`), plus an optional `url`.

All numeric data MUST be exact core values (`Quantity`/`Rational`); the type MUST NOT permit JavaScript `number` for physical amounts. Records MUST be immutable after definition.

`defineMaterial` MUST validate eagerly and throw an error with code `INVALID_MATERIAL` and a machine-readable `reason` among: `INVALID_ID`, `INVALID_NAME_KEY`, `NO_PURCHASE_UNITS`, `INVALID_UNIT_ID`, `DUPLICATE_UNIT_ID`, `INVALID_UNIT_NAME_KEY`, `NON_POSITIVE_SIZE` (size must be strictly greater than zero), `MISSING_SOURCE`, `INVALID_SOURCE_DATE` (not a real calendar date in `YYYY-MM-DD` form).

#### Scenario: Valid plywood sheet
- GIVEN a record with `id: 'plywood-sheet'`, `nameKey: 'material.plywood-sheet.name'`, one purchase unit `{ id: 'sheet', nameKey: 'material.plywood-sheet.units.sheet', size: 32 ft2 }` (4 ft x 8 ft = 32 ft2), and `source: { name: 'Manufacturer catalog', retrieved: '2026-10-22' }`
- WHEN defined
- THEN it is returned unchanged in content and is immutable, and `size` equals `4608 in2` (32 x 144)

#### Scenario: Rejections
- GIVEN records with: `id: 'Plywood'`; `nameKey: 'plywood.name'`; `purchaseUnits: []`; two units sharing `id`; a unit `size` of `0 ft2`; a negative size; no `source`; `retrieved: '2026-02-30'`; `retrieved: '22/10/2026'`
- WHEN each is defined
- THEN the reasons are respectively `INVALID_ID`, `INVALID_NAME_KEY`, `NO_PURCHASE_UNITS`, `DUPLICATE_UNIT_ID`, `NON_POSITIVE_SIZE`, `NON_POSITIVE_SIZE`, `MISSING_SOURCE`, `INVALID_SOURCE_DATE`, `INVALID_SOURCE_DATE`

#### Scenario: No float amounts
- GIVEN a record passing `size: 32` (a JavaScript number)
- WHEN type-checked
- THEN the typecheck gate rejects it

### Requirement: Shipped materials, minimal surface

The entry point of the package MUST export exactly these values: the record types, `defineMaterial`, and the shipped material records, which in this change are `concreteMix` only. The only other export of the package is the yields-only subpath below. Every shipped record MUST be created with `defineMaterial` (so it passes the validation above). Test fixtures (like the plywood sheet above) live in tests only. Package coverage MUST meet the quality gate (>= 90 percent).
(Previously: the package exported no material records; its public API was limited to the record types and `defineMaterial`.)

`concreteMix` is the record of Portland-cement concrete mix sold in bags:

| field | value |
|---|---|
| `id` | `concrete-mix` |
| `nameKey` | `material.concrete-mix.name` |
| `purchaseUnits` | `bag-40` (`material.concrete-mix.units.bag-40`, size `3/10 ft3`), `bag-60` (`...units.bag-60`, size `9/20 ft3`), `bag-80` (`...units.bag-80`, size `3/5 ft3`), in that order |
| `source.name` | `QUIKRETE Concrete Mix No. 1101 data sheet (product nos. 1101-40, 1101-60, 1101-80), revised October 2022` |
| `source.url` | `https://www.quikrete.com/PDFs/DATA_SHEET-Concrete%20Mix%201101.pdf` |
| `source.retrieved` | `2026-10-25` |

The size is the yield of one bag, stated by the manufacturer as approximate ("approximately 0.30 / 0.45 / 0.60 cubic feet (8.5 / 12.7 / 17 liters)" for 40 / 60 / 80 lb). The record is a generic estimate of a 4000 psi bag mix, not a claim about every brand; copy that cites it MUST say "about" or "approximately". In canonical cubic inches the sizes are `518.4 = 2592/5`, `777.6 = 3888/5` and `1036.8 = 5184/5` in3 (0.30 x 1728, 0.45 x 1728, 0.60 x 1728). Owner action OA1 is the acknowledgement of this source; prices are never part of a record. Retrieval date: the data sheet was read on 2026-10-25.

(The scenario "Empty registry" of the previous block is dropped: [MDC1] replaces it.)

Yields-only module: besides the entry point, the package MUST export a subpath `@maestro-calc/data/yields/concrete-mix` whose only export is `CONCRETE_MIX_YIELDS`, a frozen record `{ 'bag-40': 3/10 ft3, 'bag-60': 9/20 ft3, 'bag-80': 3/5 ft3 }` of exact `Quantity<'volume'>` values. It imports only `@maestro-calc/core` and holds no source, name key or other text. `concreteMix` MUST take its purchase-unit sizes from this record (the same objects), so the two cannot drift. Client code that needs the yields imports this subpath, never the entry point (`calculator-page` [CP47], [CP48]).

#### Scenario: [MDC5] Yields-only module
- GIVEN `@maestro-calc/data/yields/concrete-mix`
- WHEN its exports and its source text are read
- THEN the only export is `CONCRETE_MIX_YIELDS` with the three sizes above, the file contains no `http`, no `material.` key and no source name, and each `concreteMix.purchaseUnits[i].size` is the very object `CONCRETE_MIX_YIELDS['bag-<n>']`

#### Scenario: Dependency direction
- GIVEN `packages/data/package.json`
- WHEN its workspace dependencies are listed
- THEN only `@maestro-calc/core` appears

#### Scenario: [MDC1] Exports
- GIVEN the package entry point
- WHEN its exported values are enumerated
- THEN the only material record is `concreteMix`, alongside `defineMaterial`

#### Scenario: [MDC2] Concrete mix record
- GIVEN `concreteMix`
- WHEN its fields are read
- THEN the id, name key, three purchase units (ids, name keys, sizes `3/10`, `9/20`, `3/5 ft3`, equal to `2592/5`, `3888/5`, `5184/5 in3`), source name, URL and `retrieved` match the table exactly, and the record is frozen

#### Scenario: [MDC3] Record passes the contract
- GIVEN `concreteMix`
- WHEN re-validated with `defineMaterial`
- THEN it is accepted unchanged, every size is a `Quantity<'volume'>` strictly greater than zero, and `retrieved` is a real calendar date

#### Scenario: [MDC4] Source is cited
- GIVEN the record
- WHEN `source.name` and `source.url` are read
- THEN both are non-empty, the URL is `https` and the date is `2026-10-25`; the same source name and date appear on the EN and ES calculator pages and in the methodology (`calculator-page`, `trust-pages`)
