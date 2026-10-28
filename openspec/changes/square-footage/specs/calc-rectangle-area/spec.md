# Delta for calc-rectangle-area

`rectangle-area` becomes the second live calculator (Square Footage). Its engine, descriptor, URL keys `l` and `w`, `RELEASED` and `REGISTRY` do not change. Only the title, the page copy and the hand-verified display cases are specified here. The existing scenarios of this capability carry no ids; the scenarios added here use the new prefix RAP (RA is taken in the foundation tasks), RAP1 to RAP8. Kept as written: every requirement other than "Bilingual labels".

## MODIFIED Requirements

### Requirement: Bilingual labels

Every label key required by the i18n convention for `rectangle-area` MUST exist in both `en` and `es` with the exact values given in `i18n-catalog`. The title is `Square Footage Calculator` (en) and `Calculadora de pies cuadrados` (es). `apps/web` MUST import the calculator and the catalogs through their package entry points, list the calculator in `apps/web/src/lib/calculators.ts`, and its test suite MUST assert case A through that import.
(Previously: the title was `Rectangle Area` / `Área de un rectángulo`, the name of a proof calculator with no page.)

#### Scenario: Catalog completeness for the calculator
- GIVEN the `rectangle-area` descriptors and output keys
- WHEN the required keys are derived by convention
- THEN each resolves in both `en` and `es`

#### Scenario: Web smoke import
- GIVEN the `apps/web` test project
- WHEN it runs
- THEN it computes case A via `@maestro-calc/core/calculators/rectangle-area` and, with `t = createTranslator({ ...esCommon, ...esRectangleArea })` built from the `es` catalog modules of `@maestro-calc/i18n`, renders `t('calc.rectangle-area.title')` as `Calculadora de pies cuadrados` (unit test)

## ADDED Requirements

### Requirement: Page copy and hand-verified display cases

The `rectangle-area` catalog modules MUST hold, beyond the derived keys, exactly these page keys in both locales with the same placeholders: `calc.rectangle-area.page.answer` (placeholders `{length}`, `{width}`, `{area}`), `calc.rectangle-area.page.areaFt2` and `calc.rectangle-area.page.areaM2` (placeholder `{value}`), and `calc.rectangle-area.page.example`. The page module declares `primary: { imperial: 'areaFt2', metric: 'areaM2' }` and one `answerSlot` with the single template `calc.rectangle-area.page.answer`; `{area}` is the unit sentence of the primary output (`page.areaFt2` for imperial, `page.areaM2` for metric) filled with the displayed figure, and `{length}` and `{width}` are the language-free dimension texts of `calculator-page` (`10 ft`, `12 ft 6 in`, `3.05 m`) in both locales. The answer templates are `A {length} by {width} area is {area}.` (en) and `Un área de {length} por {width} mide {area}.` (es). The yd² row stays a secondary row in both unit systems. The English unit sentences are `{value} square feet` and `{value} square meters`; the Spanish ones are `{value} pies cuadrados` and `{value} metros cuadrados`. Spanish uses the neutral tú register and the trade terms `pies cuadrados` and `yardas cuadradas`; dimensions keep the symbols `ft` and `in` in Spanish, as on the Spanish concrete page (`12 ft por 10 ft`), because the dimension text is shared by both locales.

Display conventions are those of `calculator-page` (2 decimal places, `.` decimal point, `,` thousands separator, dimensions as `12 ft`, `12 ft 6 in`, metric as `3.66 m`). Hand-verified cases (1 ft² = 1/9 yd² = 0.09290304 m², exact by definition; no value is on a half-cent tie, so the rounding mode cannot change a displayed figure):

| Case | Query | ft² | yd² | m² |
|---|---|---|---|---|
| Worked example 12 ft × 10 ft | `v=1&l=144` | 120.00 | 120/9 = 13.333… → 13.33 | 120 × 0.09290304 = 11.1483648 → 11.15 |
| Default 10 × 10 | `v=1` | 100.00 | 11.111… → 11.11 | 9.290304 → 9.29 |
| 12 ft 6 in × 10 ft | `v=1&l=150` | 125.00 | 13.888… → 13.89 | 11.61288 → 11.61 |
| 20 × 15 | `v=1&l=240&w=180` | 300.00 | 33.333… → 33.33 | 27.870912 → 27.87 |

#### Scenario: [RAP1] Page keys are exactly the four, with equal placeholders
- GIVEN the `en` and `es` modules of `rectangle-area`
- WHEN the keys beyond the derived set are listed and their placeholders compared
- THEN they are exactly `calc.rectangle-area.page.answer`, `.areaFt2`, `.areaM2` and `.example`, each present in both locales, with `{length}`, `{width}`, `{area}` in `answer` and `{value}` in both unit sentences (a unit test in `apps/web` over the catalogs, in the style of the concrete page-key test [ICW11])

#### Scenario: [RAP2] Default answer sentence per unit system
- GIVEN the page view of `rectangle-area` built with the default state (`v=1`), for `en` and `es`, in imperial and in metric
- WHEN the answer text is read
- THEN imperial English is `A 10 ft by 10 ft area is 100.00 square feet.`, imperial Spanish is `Un área de 10 ft por 10 ft mide 100.00 pies cuadrados.`, metric English is `A 3.05 m by 3.05 m area is 9.29 square meters.` and metric Spanish is `Un área de 3.05 m por 3.05 m mide 9.29 metros cuadrados.` (a unit test through `controllerOf` and the page view; the sentences are the stated assumption of the proposal, with `ft` kept in Spanish by the owner-side decision of the design review, fixed by this scenario)

#### Scenario: [RAP3] Four cases through the controller
- GIVEN the four cases of the table, entered as their query state
- WHEN `controllerOf` evaluates each in imperial
- THEN the ft², yd² and m² figures equal the table row (`120.00`, `13.33`, `11.15`; `100.00`, `11.11`, `9.29`; `125.00`, `13.89`, `11.61`; `300.00`, `33.33`, `27.87`), the large figure is the ft² value, and the answer sentence names the dimensions of the case (en: `12 ft by 10 ft`, `10 ft by 10 ft`, `12 ft 6 in by 10 ft`, `20 ft by 15 ft`; es: `12 ft por 10 ft`, `10 ft por 10 ft`, `12 ft 6 in por 10 ft`, `20 ft por 15 ft`) (a unit test, `apps/web/src/calculator/rectangle-area/controller.test.ts`)

#### Scenario: [RAP4] Metric headline is square meters with its unit
- GIVEN the same four states under `u=m`
- WHEN `controllerOf` evaluates each
- THEN the large figure is the m² value (`11.15`, `9.29`, `11.61`, `27.87`) and the answer sentence ends with `square meters.` (en) or `metros cuadrados.` (es), so the metric headline is never a bare number (a unit test)

#### Scenario: [RAP5] Example line carries the worked example
- GIVEN `calc.rectangle-area.page.example` in both locales
- WHEN it is read
- THEN it names `12 ft`, `10 ft` and `120.00` in both locales (a unit test; the home card of `trust-pages` [TP28] shows this line as evidence)

#### Scenario: [RAP6] Spanish register and terms
- GIVEN the `es` module of `rectangle-area`
- WHEN the catalog hygiene test and the content `registerProblems` check run
- THEN no formal imperative or voseo form is found, `pies cuadrados` and `yardas cuadradas` are the area terms used, the answer template adds no unit word to `{length}` and `{width}` (they carry their own `ft`, `in` or `m`), and no `rectángulo` appears in the title (a unit test)

#### Scenario: [RAP7] Old title is gone
- GIVEN the repository sources and catalogs
- WHEN `Rectangle Area` and `Área de un rectángulo` are searched in code, tests and catalogs outside archived changes
- THEN there is no match, and the pins that named them (`catalog-content.test.ts`, `translate.test-d.ts`, `calculators.test.ts`, `page-view.test.ts`) assert the new titles (a contract test)

#### Scenario: [RAP8] The engine and the URL contract are untouched
- GIVEN `RELEASED` and `REGISTRY` and the descriptor tables of this capability
- WHEN the released-contract tests run
- THEN `l` and `w` with default `120` are unchanged and the diff of this change touches nothing under `packages/core` (a contract test plus a diff check)
