# Delta for i18n-catalog

Package: `@maestro-calc/i18n`. Adds the `concrete` calculator module, the material keys and the calculator-page UI keys. Continues the existing scenario prefix ICW (next free id: ICW10). Spanish stays neutral tú with US trade terms ("losa", "zapata", "yardas cúbicas", "bolsas de 80 lb", "premezclado").

## MODIFIED Requirements

### Requirement: Key naming convention

Keys for a calculator `<id>` MUST be: `calc.<id>.title`, `calc.<id>.inputs.<fieldKey>`, `calc.<id>.options.<fieldKey>.<optionId>` (one per option of every `select` field), `calc.<id>.outputs.<outputKey>`, `calc.<id>.warnings.<code>`. A calculator module MAY also hold page copy under `calc.<id>.page.<name>` (free-form names, placeholders allowed); these keys are not derived from the definition, MUST exist in both locales with the same placeholders, and are the only keys beyond the derived ones a calculator module may contain. A material shipped in `@maestro-calc/data` has the keys `material.<id>.name` and `material.<id>.units.<unitId>` (one per purchase unit); they live in the module of the calculator that uses the material until a second calculator shares it. Shared messages MUST be `errors.<CODE>` (in the `common` modules) for every code a `FieldError` or URL issue can carry: `EMPTY`, `MALFORMED`, `DECIMAL_COMMA`, `ZERO_DENOMINATOR`, `UNKNOWN_UNIT`, `TOO_LONG`, `TOO_LARGE`, `BELOW_MIN`, `ABOVE_MAX`, `UNKNOWN_OPTION`, `INVALID_VALUE`, `UNSUPPORTED_VERSION`. Codes that are only thrown as programming errors (for example `DIMENSION_MISMATCH`, `INVALID_RESULT`) are not user-facing and have no message.
(Previously: only derived keys were allowed in a calculator module and material keys did not exist.)

Error messages MAY use placeholders: `errors.BELOW_MIN` MUST contain `{min}` and `errors.ABOVE_MAX` MUST contain `{max}`; the other error messages MUST NOT contain placeholders. The web layer supplies `min`/`max` already formatted in the field's display unit and locale (core provides them as canonical Rational strings).

#### Scenario: Convention for the proof calculator
- GIVEN the calculator `rectangle-area` with inputs `length`, `width` (no select fields), outputs `areaFt2`, `areaYd2`, `areaM2`, and no warnings
- WHEN the required key set is derived
- THEN it is exactly `calc.rectangle-area.title`, `calc.rectangle-area.inputs.length`, `calc.rectangle-area.inputs.width`, `calc.rectangle-area.outputs.areaFt2`, `calc.rectangle-area.outputs.areaYd2`, `calc.rectangle-area.outputs.areaM2`, plus the twelve `errors.<CODE>` keys

#### Scenario: Option keys
- GIVEN the test fixture `fixture-box` with select field `sel` and options `x`, `y`
- WHEN its required key set is derived
- THEN it includes `calc.fixture-box.options.sel.x` and `calc.fixture-box.options.sel.y`

#### Scenario: [ICW10] Derived keys of concrete
- GIVEN the calculator `concrete`
- WHEN the required key set is derived
- THEN it is `calc.concrete.title`, the 17 `calc.concrete.inputs.<key>` (`shape`, `length`, `width`, `thickness`, `footingWidth`, `footingDepth`, `diameter`, `height`, `stepWidth`, `rise`, `run`, `stepCount`, `count`, `waste`, `bag`, `bagPrice`, `readyMixPrice`), `calc.concrete.options.shape.{slab,footing,column,steps}`, `calc.concrete.options.bag.{40,60,80}`, the 6 `calc.concrete.outputs.<key>` (`volumeYd3`, `volumeFt3`, `volumeM3`, `netVolume`, `bagCost`, `readyMixCost`), plus the twelve `errors.<CODE>` keys (no `warnings` keys)

#### Scenario: [ICW11] Material and page keys
- GIVEN the `concrete` modules of both locales
- WHEN the keys beyond the derived set are listed
- THEN they are exactly `material.concrete-mix.name`, `material.concrete-mix.units.bag-40`, `.bag-60`, `.bag-80`, and `calc.concrete.page.answer.slab`, `.answer.footing`, `.answer.column`, `.answer.steps`, `.example`, `.volumeYd3`, `.volumeM3`, `.shoppingLine`, `.bagYield`, `.wasteHelp`, `.wasteLess`, `.wasteMore`, `.priceHint`, `.readyMixNote`

#### Scenario: [ICW12] Exact labels of concrete
- GIVEN the catalogs
- WHEN resolving these keys
- THEN results are exactly:

| key | en | es |
|---|---|---|
| `calc.concrete.title` | Concrete Calculator | Calculadora de Concreto |
| `calc.concrete.inputs.shape` | Shape | Forma |
| `calc.concrete.inputs.length` | Length | Largo |
| `calc.concrete.inputs.width` | Width | Ancho |
| `calc.concrete.inputs.thickness` | Thickness | Espesor |
| `calc.concrete.inputs.footingWidth` | Footing width | Ancho de la zapata |
| `calc.concrete.inputs.footingDepth` | Footing depth | Profundidad de la zapata |
| `calc.concrete.inputs.diameter` | Diameter | Diámetro |
| `calc.concrete.inputs.height` | Height | Altura |
| `calc.concrete.inputs.stepWidth` | Step width | Ancho de los escalones |
| `calc.concrete.inputs.rise` | Rise (height of each step) | Altura de cada escalón (rise) |
| `calc.concrete.inputs.run` | Run (depth of each step) | Profundidad de cada escalón (run) |
| `calc.concrete.inputs.stepCount` | Number of steps | Cantidad de escalones |
| `calc.concrete.inputs.count` | Number of pieces | Cantidad de piezas |
| `calc.concrete.inputs.waste` | Extra for waste (%) | Extra por desperdicio (%) |
| `calc.concrete.inputs.bag` | Bag size | Tamaño de la bolsa |
| `calc.concrete.inputs.bagPrice` | Price per bag ($) | Precio por bolsa ($) |
| `calc.concrete.inputs.readyMixPrice` | Ready-mix price per cubic yard ($) | Precio del premezclado por yarda cúbica ($) |
| `calc.concrete.options.shape.slab` | Slab | Losa |
| `calc.concrete.options.shape.footing` | Footing | Zapata |
| `calc.concrete.options.shape.column` | Column | Columna |
| `calc.concrete.options.shape.steps` | Steps | Escalones |
| `calc.concrete.options.bag.40` / `.60` / `.80` | 40 lb / 60 lb / 80 lb | 40 lb / 60 lb / 80 lb |
| `calc.concrete.outputs.volumeYd3` | Concrete needed (cubic yards) | Concreto necesario (yardas cúbicas) |
| `calc.concrete.outputs.volumeFt3` | Concrete needed (cubic feet) | Concreto necesario (pies cúbicos) |
| `calc.concrete.outputs.volumeM3` | Concrete needed (cubic meters) | Concreto necesario (metros cúbicos) |
| `calc.concrete.outputs.netVolume` | Volume before extra (cubic feet) | Volumen sin extra (pies cúbicos) |
| `calc.concrete.outputs.bagCost` | Cost of the bags | Costo de las bolsas |
| `calc.concrete.outputs.readyMixCost` | Cost of ready-mix | Costo del premezclado |
| `material.concrete-mix.name` | Concrete mix | Mezcla de concreto |
| `material.concrete-mix.units.bag-40` / `.bag-60` / `.bag-80` | 40 lb bag / 60 lb bag / 80 lb bag | Bolsa de 40 lb / Bolsa de 60 lb / Bolsa de 80 lb |
| `calc.concrete.page.example` | Example: a 12 ft by 10 ft slab, 4 in thick. | Ejemplo: una losa de 12 ft por 10 ft, de 4 in de espesor. |
| `calc.concrete.page.volumeYd3` | {value} cubic yards | {value} yardas cúbicas |
| `calc.concrete.page.volumeM3` | {value} cubic meters | {value} metros cúbicos |
| `calc.concrete.page.shoppingLine` | Concrete mix, {bagLb} lb bags | Mezcla de concreto, bolsas de {bagLb} lb |
| `calc.concrete.page.bagYield` | About {yield} cubic feet per bag | Unos {yield} pies cúbicos por bolsa |
| `calc.concrete.page.wasteLess` | Less extra | Menos extra |
| `calc.concrete.page.wasteMore` | More extra | Más extra |
| `calc.concrete.page.priceHint` | Add your price to see the cost | Agrega tu precio para ver el costo |
| `calc.concrete.page.wasteHelp` | Extra covers spills, uneven ground and over-digging. 10% is a common starting point; change it to match your job. | El extra cubre derrames, terreno disparejo y excavación de más. El 10% es un punto de partida común; cámbialo según tu trabajo. |
| `calc.concrete.page.readyMixNote` | Ready-mix: order the volume above; your supplier sets the minimum and the increments. | Premezclado: pide el volumen de arriba; tu proveedor define el mínimo y los incrementos. |

#### Scenario: [ICW13] Answer sentences
- GIVEN the four `calc.concrete.page.answer.<shape>` keys
- WHEN their placeholders are listed
- THEN `slab` has `{length}`, `{width}`, `{thickness}`, `{volume}`, `{waste}`, `{bagLb}`, `{bags}`; `footing` has `{count}`, `{length}`, `{width}`, `{depth}`, `{volume}`, `{waste}`, `{bagLb}`, `{bags}`; `column` has `{count}`, `{diameter}`, `{height}`, `{volume}`, `{waste}`, `{bagLb}`, `{bags}`; `steps` has `{stepCount}`, `{stepWidth}`, `{rise}`, `{run}`, `{volume}`, `{waste}`, `{bagLb}`, `{bags}`, identical in both locales (`{volume}` is the text of `volumeYd3` or `volumeM3`, so the unit system picks cubic yards or cubic meters)
- AND the slab sentence is exactly `Slab ({length} × {width}, {thickness} thick): {volume} with {waste}% extra. Bags of {bagLb} lb: {bags}.` (en) and `Losa ({length} × {width}, {thickness} de espesor): {volume} con {waste}% de extra. Bolsas de {bagLb} lb: {bags}.` (es), so no sentence needs a plural form
- AND the other three start with `Footing (`, `Column (`, `Steps (` (en) and `Zapata (`, `Columna (`, `Escalones (` (es) and end with `Bags of {bagLb} lb: {bags}.` / `Bolsas de {bagLb} lb: {bags}.`

### Requirement: Catalog completeness and hygiene

Automated tests MUST verify, for every key in every `en` module (including `site`): the key exists in the matching `es` module; both messages are non-empty strings without leading or trailing whitespace; the set of placeholder names is identical in both; no `es` key exists that is absent from `en`. Automated tests in `apps/web` (the composition root) MUST also verify that for every calculator listed in `apps/web/src/lib/calculators.ts`, all keys required by the naming convention exist in both locales and the module holds no key beyond the derived ones, the `calc.<id>.page.*` keys and the material keys of the materials it uses, that every material record exported by `@maestro-calc/data` has its `material.<id>.*` keys in both locales, that every user-facing error code listed above has an `errors.<CODE>` key with the placeholder rule above, and that every page id of the route table has its `page.<id>.title` and `page.<id>.description` in both locales. These cross-package checks MUST NOT introduce a runtime dependency between `core` and `i18n`.
(Previously: the module scope and the web-side checks did not include `site`, the route table, page keys or material keys.)

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

#### Scenario: [ICW14] Material without keys fails
- GIVEN `concreteMix` and a catalog whose `material.concrete-mix.units.bag-60` is removed
- WHEN the web test suite runs
- THEN the material-completeness test fails naming the key

#### Scenario: [ICW15] Undeclared extra key fails
- GIVEN the `en` `concrete` module with an extra key `calc.concrete.extra`
- WHEN the web test suite runs
- THEN the registry-completeness test fails naming the key

### Requirement: Site catalog scope

The package MUST provide a `site` module per locale, importable as `@maestro-calc/i18n/catalogs/<locale>/site`, holding page chrome and metadata strings. Keys MUST be `site.<...>` (shell text, including the calculator-page UI under `site.calculator.*`) or `page.<id>.title` / `page.<id>.description` where `<id>` is one of `home`, `methodology`, `about`, `privacy`, `terms`, `contact`, `concrete`, `notFound`. All 16 `page.*` keys MUST exist in both locales. `site.skipLink` MUST exist and resolve to `Skip to main content` (en) and `Saltar al contenido principal` (es). `site.tagline` MUST exist and resolve to the PLAN.md §3 taglines (ICW8). The `site` module follows the same flat-object, derived-union, no-fallback and `satisfies` completeness rules as other modules, and MUST NOT contain placeholders. Long-form trust copy and calculator article copy are not part of the catalog.
(Previously: seven page ids and 14 `page.*` keys, no `concrete`, no `site.calculator.*`.)

#### Scenario: [ICW1] Required page keys
- GIVEN the `en` and `es` `site` modules
- WHEN their keys matching `page.*` are listed
- THEN each locale has exactly the 16 keys `page.<id>.title` and `page.<id>.description` for the eight ids

Note: 16 keys is the end-of-change state of the concrete-calculator change (it was 14 at the end of the web shell). Page ids enter the route table and the catalog together; the pinned 16 is asserted once, in `end-state.contract.test.ts`.

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

#### Scenario: [ICW16] Concrete page metadata
- GIVEN `page.concrete.title` and `page.concrete.description` in each locale
- WHEN resolved
- THEN they are exactly `Concrete Calculator: Cubic Yards and Bags | Maestro Calc` (56 characters) and `Estimate the cubic yards and bags of concrete for a slab, footing, column or steps. Free, instant, in feet, inches or meters.` (125 characters) in `en`; and `Calculadora de Concreto en Yardas y Bolsas | Maestro Calc` (57) and `Calcula las yardas cúbicas y las bolsas de concreto para una losa, zapata, columna o escalones. Gratis, al instante, en pies, pulgadas o metros.` (144) in `es`

#### Scenario: [ICW17] Calculator-page UI keys
- GIVEN the `site.calculator.*` keys of each locale
- WHEN resolved
- THEN they are exactly the following, with no placeholders:

| key | en | es |
|---|---|---|
| `site.calculator.breadcrumb` | Breadcrumb | Ruta de navegación |
| `site.calculator.breadcrumbHome` | Home | Inicio |
| `site.calculator.resultHeading` | Result | Resultado |
| `site.calculator.unitsLabel` | Units | Unidades |
| `site.calculator.unitsUs` | US (ft, in) | EE. UU. (ft, in) |
| `site.calculator.unitsMetric` | Metric (m, cm) | Métrico (m, cm) |
| `site.calculator.copyLink` | Copy link | Copiar enlace |
| `site.calculator.linkCopied` | Link copied | Enlace copiado |
| `site.calculator.copyFailed` | Could not copy. Select the link and copy it. | No se pudo copiar. Selecciona el enlace y cópialo. |
| `site.calculator.noscript` | This page needs JavaScript to recalculate. If it is off or did not load, the result below is the example. | Esta página necesita JavaScript para recalcular. Si está desactivado o no cargó, el resultado de abajo es el ejemplo. |
| `site.calculator.estimateNote` | Estimates only. Check quantities with your supplier and the local building code. | Son estimaciones. Confirma las cantidades con tu proveedor y el código de construcción local. |
| `site.calculator.hintFt` | feet | pies |
| `site.calculator.hintIn` | inches | pulgadas |
| `site.calculator.hintM` | meters | metros |
| `site.calculator.hintCm` | centimeters | centímetros |

#### Scenario: [ICW18] Concrete register
- GIVEN every Spanish message of the `concrete` module and of `site.calculator.*`
- WHEN the register test runs
- THEN none contains a rejected formal imperative or voseo form
