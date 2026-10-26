# Delta for calculator-web-core

The generic web layer shared by every calculator page in `apps/web`: the language-free page module a calculator supplies, the generic controller and mount that drive any module, the server-only page-view builder, the per-id tables, and the proof that a second calculator needs only data and one thin module. Implements PLAN.md §6.1 (separated layers, reuse across 100+ calculators) and closes follow-up JD-5 of the archived `concrete-calculator` change. New capability. Prefix: CWC (next free id: CWC1; ids below run CWC1 to CWC37). Page behaviour stays in `calculator-page` (concrete is its worked example and module #1); this spec fixes what holds for EVERY module. Out of scope: a second live page (rectangle-area stays unrouted), repeatable input groups, new descriptor kinds, any change to `packages/core` or `packages/data`, e2e sharding.

Terms: a module is the page module of one calculator; a slot is one optional member of it; the valid state is the last state the engine accepted; the texts are what the user sees in the fields.

## ADDED Requirements

### Requirement: Page-module contract

Each calculator MUST have exactly one language-free page module, `apps/web/src/calculator/<id>/page.ts`, importable by the client, holding no message text and no DOM or `window` reference. The calculator's own web code lives in its folder `apps/web/src/calculator/<id>/`; every other file under `apps/web/src/calculator/` is generic. Its only mandatory members are `id` (the id of the registry calculator it renders, taken from its definition; the per-id tables, not the module, enforce `CalculatorPageId`) and the calculator definition. Every other member is an optional slot:

| slot | content |
|---|---|
| choice groups | every select input of the definition is a choice group with no slot code; the slot adds, per group, the fields each option value shows |
| steppers | per stepper: the input key it changes and the step (the bounds are the descriptor's, never the module's) |
| answer values and template key | pure functions of the valid state, the result, the unit system and the primary text: the values of the short answer, and the answer template key per state |
| shopping | a LIST of declared lines (zero, one or many), each naming the material it shows; a line is matched to the engine's shopping line by `materialId`, never by position |
| cost rows | the rows shown once their price is above zero |
| primary output | the output key per unit system |

The result rows are not a slot: they are derived from the display hints of the outputs, with no module code. The controller, the mount and the view MUST work for a module that supplies none of the slots. A slot's code MUST live in its own importable module, so a module that omits a slot imports none of that slot's code.

#### Scenario: [CWC1] Minimal module
- GIVEN a module with only `id` and the `rectangle-area` definition
- WHEN the controller is created from it and started with no query
- THEN it reports the default state (`length` `10 ft`, `width` `10 ft`) and the figures `100.00` ft², `11.11` yd², `9.29` m², with no choice, stepper, shopping or cost data

#### Scenario: [CWC2] Concrete is module #1
- GIVEN the concrete module
- WHEN its slots are read
- THEN it declares the fields of the choice group `shape` (slab, footing, column, steps), which drives field visibility, while the choice group `bag` comes from its select with no slot entry; one stepper on `waste` with step 5; a shopping list of one line (material `concrete-mix`, the bag line); cost rows `bagCost` and `readyMixCost`; and the primary output `volumeYd3` (imperial) or `volumeM3` (metric)

#### Scenario: [CWC3] Shopping is a list
- GIVEN a fixture module that declares two shopping lines whose materials the engine returns in the opposite order
- WHEN the view is built and the controller runs
- THEN two shopping lines are rendered in the declared order and updated in place, each matched to its engine line by material (not by position) and addressable by `data-shopping` and `data-line`; with no declared line none is rendered
- AND a module whose declared materials differ from the lines of the engine's default run fails when its controller is created, with the named error `SHOPPING_LINES`, so the number of lines in the server markup is fixed

#### Scenario: [CWC4] Absent slots import nothing
- GIVEN the module graph of the rectangle-area proof entry (a test-only module that mounts the rectangle-area module)
- WHEN its static imports are walked
- THEN no file of the choice, stepper, shopping, cost or answer slot code (`apps/web/src/calculator/slots/`) and no file of `apps/web/src/calculator/concrete/` is reached

### Requirement: Generic controller behaviour

The controller MUST be a pure state machine in `apps/web/src/calculator/`, with no DOM and no `window`, and MUST behave identically for every module. From the definition alone it derives: the field order, one text per input (length through `fieldText`, count through `String`, percent through `percentText`, money through `priceText`), the unit hint of each length field from its default unit and the unit system, the select options and defaults, the validation messages (message code, bounds formatted in the unit of the field), and the figures. The input modes and the money placeholder are static markup and belong to the page-view builder. Every edit is evaluated with the engine's validation and arithmetic (no second formula). The engine is given the raw record `{ ...lastValidState, ...visibleTexts }`, where an empty money field is passed as an explicitly `undefined` key, which validation reads as the default. A hidden field keeps its value.

#### Scenario: [CWC5] Texts and figures from the definition
- GIVEN the concrete controller started with no query, and the concrete page view
- WHEN the controller's field views and the view's fields are read
- THEN the length, width and thickness texts are `12 ft`, `10 ft`, `4 in`, waste is `10`, the price texts are empty, and the figures are `1.63`, `44.00`, `1.25`, `40.00` with `74` bags
- AND in the page view the price placeholder is `0.00`, inputs of kind count have input mode `numeric` and the others `decimal`

#### Scenario: [CWC6] Raw record shape
- GIVEN the concrete controller with `bagPrice` empty
- WHEN the record handed to the engine is inspected
- THEN `bagPrice` is present with the value `undefined` (the key exists), and the other keys carry the visible texts over the last valid state
- AND for rectangle-area the record holds exactly `length` and `width`

#### Scenario: [CWC7] Invalid text blocks everything
- GIVEN the rectangle-area controller
- WHEN `abc` is entered in `length`
- THEN `length` is invalid with the `MALFORMED` message, every figure is `—`, no URL write is requested, and entering `150` restores `125.00` ft², `13.89` yd², `11.61` m² (the width stays `10 ft`)

#### Scenario: [CWC8] Bounds formatted in the field unit
- GIVEN the concrete controller
- WHEN `1001 ft` is entered in `length` and `51` in `waste`
- THEN the messages carry `max` `1,000 ft` and `max` `50%`, as the page shows (`calculator-page` [CP31])

#### Scenario: [CWC9] No DOM, no window
- GIVEN the sources of `apps/web/src/calculator/**`, test files (`*.test.ts`, `*.test-d.ts`) excluded
- WHEN a contract test scans them
- THEN none reads `document`, `window` or `navigator`, none imports a catalog or message text, and the folder keeps 100 % line, branch, function and statement coverage with the concrete and rectangle-area fixtures together covering both branches of every slot

### Requirement: URL state in the controller

The controller MUST decode the query on start with the engine's URL codec and encode the valid state after every valid change. A write is requested only after the first state change, only for a valid state, with replace semantics (never a new history entry), and with `v=1` first, defaults omitted and `u=m` for metric. A link notice (`errors.INVALID_VALUE`, `errors.UNSUPPORTED_VERSION`) is raised on load for a bad link and cleared by the next valid write. The controller never reads or writes storage.

#### Scenario: [CWC10] Decode and encode
- GIVEN the concrete controller started with `?v=1&sh=footing&l=216&n=3`
- WHEN the figures and the query to write are read
- THEN the figures are `1.96`, `52.80`, `1.50`, `48.00` and `88` bags, the length text is `18 ft`, the count `3`, and a later edit writes a replace-only query that begins `v=1`

#### Scenario: [CWC11] Defaults are omitted
- GIVEN the concrete controller started with `?v=1&l=240`
- WHEN `12` is entered in `length`
- THEN the query to write is `?v=1` and the figure for `l=240` was `2.72`

#### Scenario: [CWC12] Noisy and bad links
- GIVEN `?utm_source=x`, and separately `?v=1&sh=Slab&bg=50&ws=51`
- WHEN each is started
- THEN the first requests no write and shows no notice until the first edit; the second shows the default state with the `errors.INVALID_VALUE` notice, and a valid edit clears it

#### Scenario: [CWC13] Second consumer URL keys
- GIVEN the rectangle-area controller started with `?v=1&l=150`
- WHEN the state is read
- THEN `length` is `12 ft 6 in`, `width` is `10 ft`, the area is `125.00` ft² (`l` and `w` are the URL keys), and after the metric toggle the query to write is `?v=1&u=m&l=150`

### Requirement: Unit toggle, notice and copy address

Toggling the unit system MUST NOT change the valid state: every length keeps its exact value and only the texts, hints and unit-dependent figures change. A field whose text is invalid keeps its text and its own unit (a bare number is read in the unit that was shown when it was typed). The controller exposes the current absolute address, including the query, for the copy action and the status of the copy outcome (copied or failed).

#### Scenario: [CWC14] Metric toggle keeps exact values
- GIVEN the default concrete controller
- WHEN the unit system becomes `metric`
- THEN `length` reads `3.6576 m`, `width` `3.048 m`, `thickness` `10.16 cm`, the primary figure is `1.25` cubic meters, bags stay `74`, and the query to write is `?v=1&u=m`

#### Scenario: [CWC15] Invalid bare numbers stay in their unit
- GIVEN thickness `150` typed in the US system (invalid) and then the metric toggle
- WHEN the texts are read
- THEN thickness reads `150 in`, stays invalid and nothing is written
- AND a metric `400` (cm) switched back to US reads `400 cm`

#### Scenario: [CWC16] Metric toggle on a module with no optional slot
- GIVEN the rectangle-area controller with defaults
- WHEN the unit system becomes `metric`
- THEN `length` and `width` read `3.048 m`, the figures stay `100.00` ft², `11.11` yd², `9.29` m², and the hints are the metre hints

#### Scenario: [CWC17] Copy address
- GIVEN the concrete controller after `waste` is set to `15` at origin `https://example.test`
- WHEN the copy address is read
- THEN it is `https://example.test/concrete-calculator?v=1&ws=15`

### Requirement: Generic mount contract

One generic mount MUST drive every module against the server-rendered markup and a module's own markup choices. It MUST: find each field by the id `calc-<key>`; tie hint, help and error elements by their ids and swap the input's `aria-describedby` between hint/help and error; set `aria-invalid` on invalid fields; enable every control that is `disabled` in the static HTML and reveal every hidden button ("Copy link"); mark the pressed button of a choice group with `aria-pressed`; never submit on Enter in a field while Enter on a button presses it; call `history.replaceState` only for a valid state; copy through the clipboard and on failure show the failure status and a read-only selected address field; and rewrite text in place, with no change to the reserved sizes. The mount MUST NOT depend on the concrete calculator.

#### Scenario: [CWC18] Ids and wiring
- GIVEN the built concrete page after mount
- WHEN `length` is invalid
- THEN the input `calc-length` has `aria-invalid="true"` and its `aria-describedby` names the error element only; fixing it restores the hint reference

#### Scenario: [CWC19] Enter
- GIVEN focus in a field, then on a stepper button
- WHEN Enter is pressed in each
- THEN in the field nothing is submitted and the page and path stay; on the button the press is performed once

#### Scenario: [CWC20] replaceState only when valid
- GIVEN `abc` entered in `length` and then `20`
- WHEN the history calls are counted
- THEN none occurs for `abc`, one occurs for `20` with `?v=1&l=240`, and `history.length` is unchanged

#### Scenario: [CWC21] Clipboard fallback
- GIVEN `navigator.clipboard.writeText` rejects
- WHEN the copy button is pressed
- THEN the failure status shows and a read-only field holds the selected address

#### Scenario: [CWC22] Controls enabled by the mount
- GIVEN any calculator page with scripts running
- WHEN the mount has run
- THEN no control is `disabled`, the copy button is visible and the "not running" note is hidden

### Requirement: Page-view builder

A server-only builder in `apps/web/src/lib/` MUST join one module, its definition and the catalogs into one view that the generic components render, replacing a per-calculator view function. The client bundle MUST NOT import the builder and MUST contain no message text (strings reach the client as inert HTML, `calculator-page` [CP43]). The builder derives from the definition the labels `calc.<id>.inputs.*`, the select options, the input modes, the placeholders, the hints and the error templates; calculator-specific copy comes only from the `calc.<id>.page.*` keys. The unit-hint messages of the page are one per distinct `defaultUnit` of the length inputs in input order, then one per distinct `metricDefaultUnit` in input order (concrete: `ft`, `in`, `m`, `cm`), each from `site.calculator.hint<Unit>`; a unit without that key fails the build naming the unit. The no-JS note carries the example sentence `calc.<id>.page.example` when the catalog has it, joined to the note with one space; without it the note has no trailing space.

#### Scenario: [CWC23] Concrete view is unchanged
- GIVEN the concrete module and the `en` and `es` catalogs
- WHEN the view is built and rendered
- THEN the default render equals the table of `calculator-page` [CP1] and [CP2] (text, ids, aria, order), byte for byte in visible text

#### Scenario: [CWC24] Module with no slots renders
- GIVEN the rectangle-area module with no slot
- WHEN the view is built for `en`
- THEN it holds two length fields, the three area rows and no choice group, stepper, shopping line or cost row

#### Scenario: [CWC25] No message text in the client
- GIVEN the built entry of concrete and its static import graph
- WHEN searched for any catalog message of either locale
- THEN none is found, and the builder is not in the graph

### Requirement: Per-id tables are typed records

Every table keyed by calculator page id MUST be typed `Record<CalculatorPageId, …>`: the module and view table used by `CalculatorView`, the script-island table, and the browser-test record (`site-quality`). Adding an id to `CALCULATOR_PAGES` without a row in each table MUST fail `npm run typecheck`. `CalculatorView` MUST render the module of the page id it is given, never one fixed calculator.

#### Scenario: [CWC26] Missing row fails typecheck
- GIVEN an id added to `CALCULATOR_PAGES` with no row in the module table
- WHEN `npm run typecheck` runs
- THEN it fails naming the table and the id

#### Scenario: [CWC27] View follows the id
- GIVEN `CalculatorView` given a page id other than `concrete`
- WHEN it renders
- THEN it uses that id's module and entry script, and never the concrete view

### Requirement: Reserved height from the choice group

The block reserved for the fields a choice group shows MUST be derived from the tallest visibility set of that group (the largest number of fields shown for any option value) and never from a hand-set constant. A new option cannot reduce the reservation below its own height without a failing test. A module with no choice group reserves no choice-driven block beyond its fields.

#### Scenario: [CWC28] Concrete reserves four rows
- GIVEN the concrete shape group (slab 3, footing 4, column 3, steps 4 fields)
- WHEN the reservation is derived
- THEN it is four rows, equal for all four shapes

#### Scenario: [CWC29] A taller option grows the reservation
- GIVEN a fixture module whose group has an option that shows five fields
- WHEN the reservation is derived
- THEN it is five rows with no edit to any constant

#### Scenario: [CWC30] No choice group
- GIVEN the rectangle-area module
- WHEN the layout is derived
- THEN no choice-driven block is reserved

### Requirement: Rectangle-area headless proof

`rectangle-area` MUST run through the generic controller with no optional slot, from `packages/core` and the catalogs, with no copy of any concrete code. Its unit and integration tests MUST cover each slot-absent branch of the controller. Its DOM-level proof is at unit level: its page view, built by the real builder, MUST be rendered through the real calculator components with the Astro container API and read as markup, and a test-only proof entry that mounts the rectangle-area module MUST be walked by the entry-graph contract, whose graph excludes every unused slot. Every element the generic mount looks up with a lookup that fails when the element is absent MUST be present in that markup; slot elements are looked up as lists that may be empty. No page, island, route, sitemap entry, production `dist` file or production catalog key is added for the proof. (Decision of the design, D13: the browser job installs only the browser tooling, so a real-browser proof would need an extra Astro build shipped as a CI artifact for a page that is never routed; the first live slot-free calculator page, Square footage in the next change, is the real-browser proof.)

#### Scenario: [CWC31] Area through the generic controller
- GIVEN the case A text `10'` and `12' 6"` entered in length and width
- WHEN the controller evaluates it
- THEN the figures are `125.00` ft², `13.89` yd², `11.61` m² (`calc-rectangle-area` case A: 125, 125/9, 145161/12500)

#### Scenario: [CWC32] Unrouted proof is excluded
- GIVEN the built site
- WHEN the route table, the sitemap and `dist` are searched for rectangle-area
- THEN it is in none of them, `npm run check:site` is unchanged, and the proof exists only as test files and the test-only entry under `apps/web/src/contract/`

#### Scenario: [CWC33] DOM markup has no slot elements
- GIVEN the rectangle-area page view for `en` rendered through the real `CalculatorBody` with the Astro container
- WHEN the markup is read
- THEN no `data-choice`, `data-step`, `data-shopping`, `data-line`, `data-fill`, `data-line-note`, `data-cost-row`, `data-hint-row` or `data-price-hint` element exists, and the inputs `calc-length` and `calc-width`, two `data-unit` buttons, `data-copy`, `data-copy-status`, `data-primary` and three `data-output` values `100.00`, `11.11`, `9.29` are present
- AND every selector the generic mount looks up with a failing lookup matches an element of this markup (selectors of the shared layout, such as the language switch, are listed by name in the test), and the id of every text input of the module resolves

### Requirement: Second-calculator success criterion

Adding a calculator MUST need only: its core definition, its catalogs, its content, its page module (and its row in the module table `PAGES`), its entry and island (and its row in the script table `SCRIPTS`), its record in the browser-test table, its route row and the pinned counts. It MUST NOT need a change to, or a copy of, the controller, the mount, the view, the components or any generic browser suite. No generic file (every source under `apps/web/src/calculator/` outside `apps/web/src/calculator/<registry id>/`), the generic mount, the generic components, the view builder or the generic suites MAY name a calculator id.

#### Scenario: [CWC34] No calculator id in generic code
- GIVEN the generic controller, mount, components, view builder and suites, test files excluded and comments stripped
- WHEN a contract test scans them for registry ids (`concrete`, `rectangle-area`) in string literals and path segments
- THEN none is found; the per-id folders `apps/web/src/calculator/<id>/`, the records and the tables are outside the scan by path

#### Scenario: [CWC35] Recipe matches the criterion
- GIVEN `AGENTS.md` "Adding a calculator"
- WHEN its steps are read
- THEN the "generalise first" paragraph and the note that `CalculatorView` renders `concreteView` for every id are gone, and a language-free page-module step and a typed browser-record step are present

#### Scenario: [CWC36] Budgets hold for the generic core
- GIVEN the built concrete entry
- WHEN its static import graph is measured
- THEN it is at most 49,152 bytes and the page weight at most 196,608 bytes (`site-quality`)

#### Scenario: [CWC37] Per-entry contracts iterate the pages
- GIVEN the entry contracts (entry graph, client entry, client hygiene, client graph)
- WHEN they run
- THEN each covers one entry per id of `CALCULATOR_PAGES`, the forbidden "another calculator" pattern is derived from the entry's own id (another calculator's core directory and another calculator's web folder `apps/web/src/calculator/<other id>/`), and a new entry is covered without a test edit
