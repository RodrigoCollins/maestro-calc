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

### Requirement: No shipped materials, minimal surface

The package MUST export no material records in this change. Its public API MUST be limited to the record types and `defineMaterial`. Test fixtures (like the plywood sheet above) live in tests only. Package coverage MUST meet the quality gate (>= 90 percent).

#### Scenario: Empty registry
- GIVEN the package entry point
- WHEN its exports are enumerated
- THEN no exported value is a material record

#### Scenario: Dependency direction
- GIVEN `packages/data/package.json`
- WHEN its workspace dependencies are listed
- THEN only `@maestro-calc/core` appears
