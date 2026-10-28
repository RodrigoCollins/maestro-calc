# Delta for i18n-catalog

Only the exact-value row of `calc.rectangle-area.title` changes (the retitle for the go-live). The page keys of `rectangle-area` are specified in `calc-rectangle-area` [RAP1]. Every other requirement of this capability is unchanged.

## MODIFIED Requirements

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
| `calc.rectangle-area.title` | Square Footage Calculator | Calculadora de pies cuadrados |
| `calc.rectangle-area.inputs.length` | Length | Largo |
| `calc.rectangle-area.inputs.width` | Width | Ancho |
| `calc.rectangle-area.outputs.areaFt2` | Area (square feet) | Área (pies cuadrados) |
| `calc.rectangle-area.outputs.areaYd2` | Area (square yards) | Área (yardas cuadradas) |
| `calc.rectangle-area.outputs.areaM2` | Area (square meters) | Área (metros cuadrados) |
| `errors.DECIMAL_COMMA` | Use a period for decimals and no thousands separator (for example 1250.5). | Usa punto para los decimales y no uses separador de miles (por ejemplo 1250.5). |

(A unit test over the catalogs; the same strings are the H1 of the calculator page, `calculator-page` [CP67].)
(Previously: the first row was `Rectangle Area` / `Área de un rectángulo`.)

Spanish register (spec delta, PR 12 correction round 1): every Spanish message addresses the reader as tú (Ingresa, Usa, Elige), never as usted, because the approved visual direction (`docs/design/direction.md`: "Spanish UI copy: neutral Spanish (tú)") is the product owner's decision. The first draft of this table said `Use punto … no use` and the other messages said Ingrese and Elija; a catalog test rejects the formal imperatives.

#### Scenario: Unknown key at runtime
- GIVEN a key cast past the type system that is absent from the catalog
- WHEN `t(key)` is called
- THEN `MISSING_MESSAGE` is thrown (no other locale is consulted)

#### Scenario: Interpolation
- GIVEN a test message `"Max {max} items"`
- WHEN resolved with `{ max: "100" }`, with `{}` (cast past the type system), and with `{ max: "{x}", extra: 1 }`
- THEN results are `Max 100 items`, a thrown `MISSING_PARAM`, and `Max {x} items`
