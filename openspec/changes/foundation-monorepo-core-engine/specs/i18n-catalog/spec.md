# Delta for i18n-catalog

Package: `@maestro-calc/i18n`. Keyed EN/ES label catalog. Core never contains display text; it exposes identifiers, and this package resolves them. Implements PLAN.md §6.1 (language separated from logic).

Out of scope: plural rules, number/date/currency formatting (a web concern using `Intl`), locale detection and routing, locale-aware decimal input, and any content beyond the proof calculator and the shared error codes.

## ADDED Requirements

### Requirement: Locales and catalog modules

The package MUST export the supported locale list `locales = ['en', 'es']` and `defaultLocale = 'en'`. Catalogs are split into one module per locale per scope, importable separately so that a page bundles only what it renders: `@maestro-calc/i18n/catalogs/<locale>/common` (shared messages such as errors) and `@maestro-calc/i18n/catalogs/<locale>/<calculatorId>`. Each module is a flat object mapping dotted message keys to message strings. The `en` module is the source of truth for its scope: the set of valid keys (a TypeScript string-literal union) is derived from it, and the matching `es` module MUST be declared so that a missing or extra key is a compile-time error (for example `as const satisfies CatalogOf<typeof en>`). Keys follow the grammar `segment ( "." segment )+` where a segment matches `[A-Za-z0-9-]+`.

#### Scenario: Locale list
- GIVEN the package entry point
- WHEN `locales` and `defaultLocale` are read
- THEN they are `['en', 'es']` and `'en'`

#### Scenario: Missing Spanish key is a compile error
- GIVEN an `en` calculator module with a key that its `es` counterpart lacks (or an `es` key absent from `en`)
- WHEN the typecheck gate runs
- THEN it fails naming the key

### Requirement: Key naming convention

Keys for a calculator `<id>` MUST be: `calc.<id>.title`, `calc.<id>.inputs.<fieldKey>`, `calc.<id>.options.<fieldKey>.<optionId>` (one per option of every `select` field), `calc.<id>.outputs.<outputKey>`, `calc.<id>.warnings.<code>`. Shared messages MUST be `errors.<CODE>` (in the `common` modules) for every code a `FieldError` or URL issue can carry: `EMPTY`, `MALFORMED`, `DECIMAL_COMMA`, `ZERO_DENOMINATOR`, `UNKNOWN_UNIT`, `TOO_LONG`, `TOO_LARGE`, `BELOW_MIN`, `ABOVE_MAX`, `UNKNOWN_OPTION`, `INVALID_VALUE`, `UNSUPPORTED_VERSION`. Codes that are only thrown as programming errors (for example `DIMENSION_MISMATCH`, `INVALID_RESULT`) are not user-facing and have no message.

Error messages MAY use placeholders: `errors.BELOW_MIN` MUST contain `{min}` and `errors.ABOVE_MAX` MUST contain `{max}`; the other error messages MUST NOT contain placeholders. The web layer supplies `min`/`max` already formatted in the field's display unit and locale (core provides them as canonical Rational strings).

#### Scenario: Convention for the proof calculator
- GIVEN the calculator `rectangle-area` with inputs `length`, `width` (no select fields), outputs `areaFt2`, `areaYd2`, `areaM2`, and no warnings
- WHEN the required key set is derived
- THEN it is exactly `calc.rectangle-area.title`, `calc.rectangle-area.inputs.length`, `calc.rectangle-area.inputs.width`, `calc.rectangle-area.outputs.areaFt2`, `calc.rectangle-area.outputs.areaYd2`, `calc.rectangle-area.outputs.areaM2`, plus the twelve `errors.<CODE>` keys

#### Scenario: Option keys
- GIVEN the test fixture `fixture-box` with select field `sel` and options `x`, `y`
- WHEN its required key set is derived
- THEN it includes `calc.fixture-box.options.sel.x` and `calc.fixture-box.options.sel.y`

### Requirement: Message resolution

`createTranslator(catalog)` MUST return a function `t(key, params?)` over the given catalog object (typically the spread of a locale's `common` module and one calculator module). `t` MUST return the message for `key`. There is NO runtime fallback to another locale: completeness is guaranteed at compile time (previous requirement) and by tests. If the key is absent from the catalog at runtime (only reachable by casting past the type system), `t` MUST throw `MISSING_MESSAGE` (programming error). Placeholders use the form `{name}` where `name` matches `[A-Za-z][A-Za-z0-9]*`; the `params` argument is typed from the placeholders of the message; every placeholder MUST be replaced by the string form of the same-named param; a missing param MUST throw `MISSING_PARAM`; extra params are ignored; replaced values are inserted verbatim (never re-scanned for placeholders). Messages MUST NOT contain a `{` or `}` other than as placeholders.

#### Scenario: Compile-time keys
- GIVEN `t = createTranslator(enRectangleArea)` and a call `t('calc.rectangle-area.nope')`
- WHEN type-checked
- THEN the typecheck gate rejects it

#### Scenario: Exact labels
- GIVEN the catalogs
- WHEN resolving the proof calculator keys
- THEN results are exactly:

| key | en | es |
|---|---|---|
| `calc.rectangle-area.title` | Rectangle Area | Área de un rectángulo |
| `calc.rectangle-area.inputs.length` | Length | Largo |
| `calc.rectangle-area.inputs.width` | Width | Ancho |
| `calc.rectangle-area.outputs.areaFt2` | Area (square feet) | Área (pies cuadrados) |
| `calc.rectangle-area.outputs.areaYd2` | Area (square yards) | Área (yardas cuadradas) |
| `calc.rectangle-area.outputs.areaM2` | Area (square meters) | Área (metros cuadrados) |
| `errors.DECIMAL_COMMA` | Use a period for decimals and no thousands separator (for example 1250.5). | Use punto para los decimales y no use separador de miles (por ejemplo 1250.5). |

#### Scenario: Unknown key at runtime
- GIVEN a key cast past the type system that is absent from the catalog
- WHEN `t(key)` is called
- THEN `MISSING_MESSAGE` is thrown (no other locale is consulted)

#### Scenario: Interpolation
- GIVEN a test message `"Max {max} items"`
- WHEN resolved with `{ max: "100" }`, with `{}` (cast past the type system), and with `{ max: "{x}", extra: 1 }`
- THEN results are `Max 100 items`, a thrown `MISSING_PARAM`, and `Max {x} items`

### Requirement: Catalog completeness and hygiene

Automated tests MUST verify, for every key in every `en` module: the key exists in the matching `es` module; both messages are non-empty strings without leading or trailing whitespace; the set of placeholder names is identical in both; no `es` key exists that is absent from `en`. Automated tests in `apps/web` (the composition root) MUST also verify that for every calculator listed in `apps/web/src/lib/calculators.ts`, all keys required by the naming convention exist in both locales, and that every user-facing error code listed above has an `errors.<CODE>` key with the placeholder rule above. These cross-package checks MUST NOT introduce a runtime dependency between `core` and `i18n`.

#### Scenario: Missing Spanish key fails the build
- GIVEN an `en` key with no `es` counterpart
- WHEN the typecheck gate and the test suite run
- THEN both fail naming the key

#### Scenario: Placeholder mismatch fails
- GIVEN `en` message `"Max {max}"` and `es` message `"Máximo"`
- WHEN the test suite runs
- THEN the completeness test fails

#### Scenario: Calculator without labels fails
- GIVEN a listed calculator with an output key lacking a catalog entry
- WHEN the test suite runs
- THEN the registry-completeness test fails naming the missing key
