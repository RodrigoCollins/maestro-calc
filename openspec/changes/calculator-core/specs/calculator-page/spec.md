# Delta for calculator-page

Generalises the template from "first instance" to "every calculator": the controls, live recalculation, client script contract and layout rules hold for any calculator built on `calculator-web-core`, with `concrete` as the worked example (its figures, shapes and hints stay as written). Adds the public DOM hooks. Continues the prefix CP (next free id: CP54). The spec intro (applied at archive) reads: "The calculator page template in `apps/web`: ... First instance: `concrete` at `/concrete-calculator` and `/es/calculadora-de-concreto`; every later calculator uses the same template through the generic core (`calculator-web-core`)." Every other CP requirement is unchanged.

## ADDED Requirements

### Requirement: Public DOM hooks

The markup of every calculator page MUST expose these hooks, which the browser suites and the script depend on; renaming one is a contract change:

| hook | where | meaning |
|---|---|---|
| `data-calculator="<id>"` | the calculator body | the id of the calculator the page renders |
| `data-unit="<system>"` | each unit-system button | the unit system it selects; the pressed button has `aria-pressed="true"` |
| `data-choice="<selectKey>"` | the group element around the buttons of a single-choice group | the select key of the descriptor; each button carries the option it sets in its `value` and the pressed one has `aria-pressed="true"` |
| `data-step="<inputKey>"` | the block around the two stepper buttons | the input they change; each button carries `less` or `more` in its `value` |
| `data-reserved="<area>"` | each block whose size is reserved in the server HTML and the script fills | the area: `copy`, `answer`, `notice` |
| `data-copy` | the "Copy link" button | copies the current address |
| `data-copy-status` | the polite status element | the copy outcome text |
| `data-answer` | the short answer | the polite live region the script rewrites |
| `data-not-running` | the "not running" note | hidden by the script once it runs |
| `data-messages` | the one inert `<template>` | holds the message entries the script reads |
| `data-primary="<outputKey>"` | the large figure | names the output key it mirrors |
| `data-primary-before`, `data-primary-after` | the text around the large figure | the two parts of the primary sentence |
| `data-output="<outputKey>"` | each result value | one per output the page shows (`calculator-page` [CP4]) |
| `data-line="<index>"` | each shopping line | its position in the declared list, from `0` |
| `data-shopping="<purchaseUnit>"` | each shopping quantity | one per shopping line |
| `data-fill="<placeholder>"` | each value inside a shopping label or note | the placeholder of the split template it fills |
| `data-line-note="<index>"` | the note of a shopping line | the line it belongs to |
| `data-cost-row="<outputKey>"` | each cost row | shown once its price is above zero |
| `data-hint-row="<outputKey>"` + `data-price-hint="<outputKey>"` | the price hint of a cost row | shown while its price is zero |

The hooks are derived from the descriptor and the module (never typed per calculator in a generic component), and the concrete names `data-shape-button`, `data-bag`, `data-waste-step`, `data-bag-lb`, `data-bag-yield` and `data-yield` no longer exist. The visible markup, ids, aria and text of the concrete pages are unchanged by the rename.

#### Scenario: [CP54] Hooks on the concrete page
- GIVEN built `/concrete-calculator`
- WHEN the hooks are listed
- THEN the `data-choice="shape"` group holds four buttons (values `slab`, `footing`, `column`, `steps`), the `data-choice="bag"` group three, the `data-step="waste"` block two buttons (values `less` and `more`), one `data-copy`, one `data-copy-status`, six `data-output` elements in the order of [CP4], one `data-shopping="bag-80"` and one `data-primary`
- AND one `data-line="0"` with `data-fill="bagLb"` in its label, one `data-line-note="0"` with `data-fill="yield"`, and the shape-driven block `calc-choice-area` with `style="--calc-rows:4"`
- AND none of `data-shape-button`, `data-bag`, `data-waste-step`, `data-bag-lb`, `data-bag-yield`, `data-yield`, `data-value`, `data-direction`, `data-reserved="shape"` or `data-reserved="steppers"` is present

#### Scenario: [CP55] Hooks drive behaviour
- GIVEN the default page with scripts running
- WHEN the `value="footing"` button of the `data-choice="shape"` group is pressed, then the `value="more"` button of the `data-step="waste"` block once
- THEN the footing fields show with `aria-pressed="true"` on that button, `waste` reads `15`, and `data-copy-status` stays empty until `data-copy` is pressed

#### Scenario: [CP56] Absent features have no hooks
- GIVEN a calculator whose module has no choice group, stepper or shopping line (rectangle-area), its page view rendered through the real components with the Astro container
- WHEN its page markup is read
- THEN no `data-choice`, `data-step` or `data-shopping` element exists and `data-output`, `data-primary`, `data-copy` and `data-copy-status` follow the table

## MODIFIED Requirements

### Requirement: Form controls

The form MUST show only the fields the selected option of its choice group shows (concrete: the shape), in this order, each with a visible `<label>` and the unit hint of the active unit system. Hidden fields keep their values and are neither visible nor focusable. A calculator with no choice group shows all its fields.
(Previously: "the fields of the selected shape"; the stepper bounds were stated as 0 to 50 and the reserved area as the four-row constant.)

For concrete:

| shape | visible fields |
|---|---|
| `slab` | `length`, `width`, `thickness` |
| `footing` | `length`, `footingWidth`, `footingDepth`, `count` |
| `column` | `diameter`, `height`, `count` |
| `steps` | `stepWidth`, `rise`, `run`, `stepCount` |

Always visible, after the shape fields: `waste` (with `wasteHelp` text, a "Less extra" and a "More extra" button changing it by 5 points within the `min` and `max` of the `waste` descriptor, 0 to 50), the bag size (three buttons), `bagPrice`, `readyMixPrice`. The shape (four buttons) and the unit system (two buttons) come first. Single-choice buttons form a labelled group and expose their state with `aria-pressed`. Length, percent and money inputs use `inputmode="decimal"`, counts `inputmode="numeric"`, all `autocomplete="off"`; the form has no submit button. Number inputs are at least 56 CSS px tall and every other control (buttons, toggles) at least 44 by 44 px on a 390 px viewport. Every input has an associated visible label, and the focus ring is the orange ring of `site-shell`. Default text of inputs: `12 ft`, `10 ft`, `4 in`, `16 in`, `8 in`, `12 in`, `8 ft`, `4 ft`, `7 in`, `11 in`, `3`, `1`, `10`; the price inputs are empty with the placeholder `0.00`, and an empty price means `$0` (no error): the script passes an empty price to the engine as an explicitly `undefined` field, which validation reads as the default. The block size of the area a choice group drives is the same for every option of the group (it reserves the tallest visibility set of the group, four rows for the concrete shapes), so switching the option or restoring a shared link shifts nothing below it.

#### Scenario: [CP11] Visible fields per shape
- GIVEN the page with scripts running
- WHEN each shape button is pressed in turn
- THEN the visible shape fields and their order equal the table, the others are `hidden`, and the pressed button has `aria-pressed="true"` and the other three `false`

#### Scenario: [CP12] Labels and keyboards
- GIVEN the default page
- WHEN the controls are inspected
- THEN every input has a label whose text is the `calc.concrete.inputs.<key>` catalog value of the locale, length/percent/money inputs have `inputmode="decimal"`, count inputs `inputmode="numeric"`, and there is no submit button

#### Scenario: [CP51] Unit hint on every length field
- GIVEN the default page (US system)
- WHEN the ten length fields are read
- THEN each has a visible hint after its input, `site.calculator.hintFt` (`length`, `width`, `height`, `stepWidth`) or `site.calculator.hintIn` (the other six), and its input is described by it (`aria-describedby`); the count, waste and price inputs have no unit hint, and the waste input is described by its help text
- AND under `metric` the hints read `site.calculator.hintM` (the four long fields) and `site.calculator.hintCm` (the six others), written by the script from inert messages in the page

#### Scenario: [CP13] Touch targets on a phone
- GIVEN Chromium at 390x844
- WHEN the bounding boxes of the visible buttons and inputs are measured
- THEN every button is at least 44 by 44 px and every number input at least 56 px tall

#### Scenario: [CP14] Same block size for all shapes
- GIVEN the form on the phone profile
- WHEN the height of the shape-dependent area is measured for each of the four shapes
- THEN the four heights are equal

### Requirement: Live recalculation

With scripts running, every edit MUST update the short answer, the figures and the shopping quantity without a button and without a page load, using the same validation and arithmetic as the engine (no second formula implementation). Updates happen on every `input` event and on every button press. The short answer is a polite live region. Pressing Enter in a field MUST NOT navigate or reload. A stepper clamps at the `min` and `max` of the descriptor of its input, never at a constant of the page code.
(Previously: the waste steppers were stated as "within 0 to 50"; the bounds were constants duplicated from the engine.)

Hand-verified states (US unit system, defaults otherwise):

| state | yd3 | ft3 | m3 | net ft3 | bags (80 lb unless stated) |
|---|---|---|---|---|---|
| default | 1.63 | 44.00 | 1.25 | 40.00 | 74 |
| `length` = `20` (20 ft) | 2.72 | 73.33 | 2.08 | 66.67 | 123 |
| bag 60 lb | 1.63 | 44.00 | 1.25 | 40.00 | 98 |
| bag 40 lb | 1.63 | 44.00 | 1.25 | 40.00 | 147 |
| `waste` = `0` | 1.48 | 40.00 | 1.13 | 40.00 | 67 |
| `waste` = `15` (More extra once) | 1.70 | 46.00 | 1.30 | 40.00 | 77 |
| footing, defaults (12 ft x 16 in x 8 in, 1 piece) | 0.43 | 11.73 | 0.33 | 10.67 | 20 |
| footing `l=216 n=3` (F1) | 1.96 | 52.80 | 1.50 | 48.00 | 88 |
| column, defaults (C1) | 0.26 | 6.91 | 0.20 | 6.28 | 12 |
| column `n=4` (C2) | 1.02 | 27.65 | 0.78 | 25.13 | 47 |
| steps, defaults (T1) | 0.52 | 14.12 | 0.40 | 12.83 | 24 |

(Arithmetic: `length` 20 ft: 240 x 120 x 4 = 115200 in3 = 200/3 ft3 = 66.67, x 11/10 = 220/3 = 73.33, / 27 = 2.716, 73.33 x 0.0283168 = 2.077, / 0.6 = 122.2 -> 123. Footing defaults: 144 x 16 x 8 = 18432 in3 = 32/3 ft3 = 10.67, x 11/10 = 176/15 = 11.73, / 27 = 0.4346, bags 176/9 = 19.56 -> 20. `waste` 0: 40 / 27 = 1.48, 40 x 0.0283168 = 1.13, 40 / 0.6 = 66.67 -> 67. `waste` 15: 40 x 1.15 = 46, 46 / 27 = 1.704, 46 x 0.0283168 = 1.303, 46 / 0.6 = 76.67 -> 77.)

#### Scenario: [CP19] Typing updates the result
- GIVEN the default EN page with scripts running
- WHEN `20` is typed in the length field (nothing else is pressed)
- THEN the short answer becomes `Slab (20 ft × 10 ft, 4 in thick): 2.72 cubic yards with 10% extra. Bags of 80 lb: 123.` and the figures equal the row for `length` = `20`

#### Scenario: [CP20] Shape switching
- GIVEN the default page
- WHEN Footing, Column and Steps are pressed in turn
- THEN the figures equal the rows footing defaults, column defaults and steps defaults, and each short answer starts with `Footing (`, `Column (`, `Steps (` (EN) or `Zapata (`, `Columna (`, `Escalones (` (ES)

#### Scenario: [CP21] Bag size
- GIVEN the default page
- WHEN the 60 lb button, then the 40 lb button, are pressed
- THEN the bag quantity is `98`, then `147`, the volumes do not change, the yield line reads `About 0.45 cubic feet per bag`, then `About 0.30 cubic feet per bag`, and the short answer ends `Bags of 60 lb: 98.` then `Bags of 40 lb: 147.`

#### Scenario: [CP22] Waste field and steppers
- GIVEN the default page
- WHEN `0` is typed in the waste field, and separately "More extra" is pressed once
- THEN the figures equal the rows `waste` = `0` and `waste` = `15`
- AND "Less extra" at `0` and "More extra" at `50` leave the value unchanged, and the bounds are those of the `waste` descriptor

#### Scenario: [CP23] Enter does not navigate
- GIVEN focus in any input
- WHEN Enter is pressed
- THEN the URL path and the page stay the same and no request is made

#### Scenario: [CP24] Client equals engine
- GIVEN the states of the table and the cases S2, S3 (metric), F1, C2, T1, H of `calc-concrete`
- WHEN each is loaded through its query in Chromium
- THEN every displayed figure equals the engine output rounded for display (the same strings the build-time render produces for that state)

#### Scenario: [CP57] Stepper bounds follow the descriptor
- GIVEN a calculator whose stepper input has descriptor bounds `min` 0 and `max` 20, a fixture, with the stepper at 20
- WHEN "More" is pressed
- THEN the value stays 20, and changing the descriptor bound to 30 lets it reach 25 with no change to page code

### Requirement: Client script contract

Each calculator MUST have one client entry module of its own (`apps/web/src/client/entries/<id>.ts`), shared by both locales of that calculator, produced by the web build and loaded with `<script type="module" src>` from the page. The entry MAY statically import same-origin hashed chunks, including the generic mount and controller; the entry plus its whole static import graph MUST be at most 49,152 bytes (`site-quality`). The entry imports only its own calculator and page module (never the registry `apps/web/src/lib/calculators.ts`) and builds it from the yields-only module of `@maestro-calc/data` (`material-data-contract`) when it needs yields, never from the material record, so no source name, URL or other metadata reaches the bundle. It uses the engine's validation, arithmetic and URL codec from the workspace packages (no copy of a formula). It MUST contain no message text (strings arrive as inert HTML templates in the page: error messages for the 12 user-facing codes, the answer sentences, labels), no storage or network API, no third-party code, and no `https://` URL other than the site origin. The same figures MUST come out of the build-time render and of the script for any state (shared formatting). These rules, and the contract tests that enforce them, hold for EVERY entry of `CALCULATOR_PAGES`, not only the concrete one.
(Previously: the entry rules were written for the concrete entry, and CP48 named `entries/concrete.ts`.)

#### Scenario: [CP42] One entry per calculator, shared by both locales
- GIVEN the built `dist`
- WHEN the script URLs of `/concrete-calculator` and `/es/calculadora-de-concreto` are compared and the static import graph of that entry is resolved
- THEN both pages load the same entry file, the entry plus its static graph is at most 49,152 bytes, and no file of the graph contains catalog message text of either locale

#### Scenario: [CP47] No foreign origin in the entry graph
- GIVEN the built entry of `concrete` and every file of its static import graph
- WHEN searched for `https://` and `http://`
- THEN the only match allowed is the site origin `https://maestrocalc.com`, and the QUIKRETE source URL appears only in the HTML (as an allowlisted outbound link), never in JavaScript

#### Scenario: [CP48] Entry does not import the registry
- GIVEN the module graph of every `apps/web/src/client/entries/<id>.ts` for each id in `CALCULATOR_PAGES` (today `concrete`)
- WHEN the contract test walks its imports
- THEN neither `apps/web/src/lib/calculators.ts`, nor the directory of another calculator of core (the forbidden pattern is derived from that entry's own id), nor the root entry of `@maestro-calc/data` is reached

#### Scenario: [CP43] Message templates are inert HTML
- GIVEN the built page
- WHEN the message templates are read
- THEN the 12 user-facing error messages (with their `{min}` / `{max}` placeholders), the four answer sentences, the copy states, the four unit hints and the two volume sentences (`{value} cubic yards`, `{value} cubic meters`) are present in the page's locale as entries (`<p id="errors.BELOW_MIN">`) of one inert `<template>` element, and none of them is rendered until the script uses it

### Requirement: Layout stability

The page MUST NOT shift layout when scripts run: the result panel and the form reserve their final block size in the server HTML, figures use fixed-width cells, and the area driven by a choice group has the size of its tallest visibility set (derived from the module, `calculator-web-core`). The elements the script reveals or rewrites also reserve their size in the server HTML: the "Copy link" button and its status line, the steppers, the notice area (the "not running" note, then URL notices), and the short answer (sized for its longest sentence at the phone width, so a footing or steps sentence does not add a line).
(Previously: "the shape-dependent area has the size of its tallest shape", a hand constant of four rows.)

#### Scenario: [CP44] Load shift
- GIVEN Chromium on the phone profile opening `/concrete-calculator` and `/es/calculadora-de-concreto`, with and without a query
- WHEN the load settles
- THEN cumulative layout shift is at most 0.01

#### Scenario: [CP58] Reservation is derived
- GIVEN the concrete page
- WHEN the reserved row count of the shape-driven area is read from the build
- THEN it equals the largest number of fields shown for any shape (four), and a fixture group with a five-field option reserves five
