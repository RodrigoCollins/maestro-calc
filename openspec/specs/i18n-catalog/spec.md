# i18n-catalog

Package: `@maestro-calc/i18n`. Keyed EN/ES label catalog. Core never contains display text; it exposes identifiers, and this package resolves them. Implements PLAN.md §6.1 (language separated from logic).

Out of scope: plural rules, number/date/currency formatting (a web concern using `Intl`), locale detection and routing, locale-aware decimal input, and any content beyond the proof calculator and the shared error codes.

## Requirements

### Requirement: Locales and catalog modules

The package MUST export the supported locale list `locales = ['en', 'es']` and `defaultLocale = 'en'`. Catalogs are split into one module per locale per scope, importable separately so that a page bundles only what it renders: `@maestro-calc/i18n/catalogs/<locale>/common` (shared messages such as errors), `@maestro-calc/i18n/catalogs/<locale>/site` (site chrome and page metadata) and `@maestro-calc/i18n/catalogs/<locale>/<calculatorId>`. Each module is a flat object mapping dotted message keys to message strings. The `en` module is the source of truth for its scope: the set of valid keys (a TypeScript string-literal union) is derived from it, and the matching `es` module MUST be declared so that a missing or extra key is a compile-time error (for example `as const satisfies CatalogOf<typeof en>`). Keys follow the grammar `segment ( "." segment )+` where a segment matches `[A-Za-z0-9_-]+` (the underscore is what lets `errors.BELOW_MIN` be a key).
(Previously: only `common` and `<calculatorId>` modules were listed.)

#### Scenario: Locale list
- GIVEN the package entry point
- WHEN `locales` and `defaultLocale` are read
- THEN they are `['en', 'es']` and `'en'`

#### Scenario: Missing Spanish key is a compile error
- GIVEN an `en` calculator module with a key that its `es` counterpart lacks (or an `es` key absent from `en`)
- WHEN the typecheck gate runs
- THEN it fails naming the key

#### Scenario: [ICW6] Site module is separately importable
- GIVEN a page that imports only `@maestro-calc/i18n/catalogs/es/site`
- WHEN it is built
- THEN the output contains no `errors.` or `calc.` message text

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
| `errors.DECIMAL_COMMA` | Use a period for decimals and no thousands separator (for example 1250.5). | Usa punto para los decimales y no uses separador de miles (por ejemplo 1250.5). |

Spanish register (spec delta, PR 12 correction round 1): every Spanish message addresses the reader as tú (Ingresa, Usa, Elige), never as usted, because the approved visual direction (`docs/design/direction.md`: "Spanish UI copy: neutral Spanish (tú)") is the product owner's decision. The first draft of this table said `Use punto … no use` and the other messages said Ingrese and Elija; a catalog test rejects the formal imperatives.

#### Scenario: Unknown key at runtime
- GIVEN a key cast past the type system that is absent from the catalog
- WHEN `t(key)` is called
- THEN `MISSING_MESSAGE` is thrown (no other locale is consulted)

#### Scenario: Interpolation
- GIVEN a test message `"Max {max} items"`
- WHEN resolved with `{ max: "100" }`, with `{}` (cast past the type system), and with `{ max: "{x}", extra: 1 }`
- THEN results are `Max 100 items`, a thrown `MISSING_PARAM`, and `Max {x} items`

### Requirement: Catalog completeness and hygiene

Automated tests MUST verify, for every key in every `en` module (including `site`): the key exists in the matching `es` module; both messages are non-empty strings without leading or trailing whitespace; the set of placeholder names is identical in both; no `es` key exists that is absent from `en`. Automated tests in `apps/web` (the composition root) MUST also verify that for every calculator listed in `apps/web/src/lib/calculators.ts`, all keys required by the naming convention exist in both locales, that every user-facing error code listed above has an `errors.<CODE>` key with the placeholder rule above, and that every page id of the route table has its `page.<id>.title` and `page.<id>.description` in both locales. These cross-package checks MUST NOT introduce a runtime dependency between `core` and `i18n`.
(Previously: the module scope and the web-side checks did not include `site` or the route table.)

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

#### Scenario: [ICW7] Route page without metadata fails
- GIVEN a route table id `contact` whose `es` `page.contact.description` is removed
- WHEN the web test suite runs
- THEN the route-completeness test fails naming the key

### Requirement: Site catalog scope

The package MUST provide a `site` module per locale, importable as `@maestro-calc/i18n/catalogs/<locale>/site`, holding page chrome and metadata strings. Keys MUST be `site.<...>` (shell text) or `page.<id>.title` / `page.<id>.description` where `<id>` is one of `home`, `methodology`, `about`, `privacy`, `terms`, `contact`, `notFound`. All 14 `page.*` keys MUST exist in both locales. `site.skipLink` MUST exist and resolve to `Skip to main content` (en) and `Saltar al contenido principal` (es). `site.tagline` MUST exist and resolve to the PLAN.md §3 taglines (ICW8). The `site` module follows the same flat-object, derived-union, no-fallback and `satisfies` completeness rules as other modules, and MUST NOT contain placeholders. Long-form trust copy is not part of the catalog.

#### Scenario: [ICW1] Required page keys
- GIVEN the `en` and `es` `site` modules
- WHEN their keys matching `page.*` are listed
- THEN each locale has exactly the 14 keys `page.<id>.title` and `page.<id>.description` for the seven ids

Note: 14 keys is the end-of-change state. Page ids enter the route table and the catalog together slice by slice; before the last content slice the required set is `page.<id>.*` for the table ids plus `notFound` (ICW4), and the pinned 14 is asserted once the last content slice lands.

#### Scenario: [ICW8] Site tagline
- GIVEN `t('site.tagline')` for each locale
- WHEN resolved
- THEN the values are exactly `Jobsite calculators that estimate what to buy` (en) and `Calcula tu obra y sabe qué comprar` (es), per PLAN.md §3

#### Scenario: [ICW2] Skip link labels
- GIVEN `t('site.skipLink')` for each locale
- WHEN resolved
- THEN the values are exactly `Skip to main content` and `Saltar al contenido principal`

#### Scenario: [ICW3] Missing Spanish site key is a compile error
- GIVEN an `en` `site` key with no `es` counterpart
- WHEN the typecheck gate runs
- THEN it fails naming the key

#### Scenario: [ICW4] Route table and catalog agree
- GIVEN the route table page ids and the catalog
- WHEN the web contract test runs
- THEN every table id has both `page.<id>.title` and `page.<id>.description` in both locales, and the catalog has no `page.<id>` for an id absent from the table plus `notFound`

### Requirement: Spanish site register

Spanish messages in the `site` module MUST use the neutral tú register (per `docs/design/direction.md`), neither usted nor voseo. A catalog test MUST reject, case-insensitively and as whole words, the formal imperatives `Ingrese`, `Elija`, `Utilice`, `Consulte`, `Contáctenos`, `Póngase`, `Verifique` and the common voseo forms `verificá`, `calculá`, `consultá`, `elegí`, `tenés`, `podés`, `querés`, `sabés` in every Spanish module.

#### Scenario: [ICW5] Formal imperative rejected
- GIVEN an `es` `site` message containing `Consulte`
- WHEN the test suite runs
- THEN the register test fails naming the key

#### Scenario: [ICW9] Voseo rejected
- GIVEN an `es` `site` message containing `verificá con un profesional` (the wording PLAN.md uses for the disclaimer)
- WHEN the test suite runs
- THEN the register test fails naming the key and the form `verificá`
