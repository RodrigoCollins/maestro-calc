# Delta for calculator-web-core

The page-module contract gains an optional `drawing` slot, and the generic mount gains an optional `draw` hook and a list lookup (`findAll`) of the share anchor. Continues the prefix CWC (next free id: CWC41). Modified: Page-module contract (one slot row added; [CWC1] to [CWC4] kept as written). Added: [CWC41] to [CWC47]. Every other requirement is unchanged ([CWC9] keeps scanning `apps/web/src/calculator/**` for DOM references; [CWC33] and [CWC38] keep the test-only slot-free module free of every slot, the drawing slot included).

## MODIFIED Requirements

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
| drawing | pure geometry (`blueprint-drawing`): a function from a moment (valid state, result, unit system) to the plan (outline, dimension lines, label values), or to no plan for a state with no drawing yet; no DOM and no message text |

The result rows are not a slot: they are derived from the display hints of the outputs, with no module code. The controller, the mount and the view MUST work for a module that supplies none of the slots. A slot's code MUST live in its own importable module, so a module that omits a slot imports none of that slot's code.
(Previously: six slots; the `drawing` row did not exist.)

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

## ADDED Requirements

### Requirement: The drawing slot and its injected writer

A page module that declares the `drawing` slot MUST put the geometry in its own module under `apps/web/src/calculator/slots/` (generic helpers) or its calculator folder (shape geometry). The DOM writer MUST live in its own client module, MUST NOT be imported by `mount.ts` or by any generic module, and MUST be injected into the mount only by the entry of a page that declares the slot. The mount takes an optional `draw` hook; without it the mount runs no drawing code. The mount looks up the box with a list lookup that may be empty (`findAll`), never a throwing one, so the slot-free proof's static lookup check holds. Every moment the controller reports as valid is passed to the geometry and the result to the writer; an invalid state passes nothing, so the drawing keeps the last plan.

#### Scenario: [CWC41] Geometry is requested per valid moment
- GIVEN the `rectangle-area` controller with a spy writer injected
- WHEN the controller starts, then `length` becomes `20 ft`, then `abc`, then `15 ft`
- THEN the writer receives plans for the default moment, `20 ft` and `15 ft` in that order, and none for `abc` (a unit test of the controller; the web unit suite runs in `node`, with no DOM)

#### Scenario: [CWC42] Writer is injected, not imported
- GIVEN the sources of `apps/web/src/client/mount.ts` and every generic file outside the entries
- WHEN the import graph is walked
- THEN none reaches the drawing writer module, and each entry of a page that declares the slot passes it as the `draw` hook (a contract test)

#### Scenario: [CWC43] Pages without the slot ship no drawing code
- GIVEN the entry of every page of `CALCULATOR_PAGES` and the test-only slot-free proof entry
- WHEN the entry-graph contract walks the static graph of each
- THEN a graph reaches the drawing writer, the geometry and the drawing slot only when that page's module declares the `drawing` slot, and the slot-free proof entry reaches none of them (a contract test; no test edit for a new calculator)

#### Scenario: [CWC44] Mount without a draw hook
- GIVEN the source of `apps/web/src/client/mount.ts` and the slot-free proof page markup
- WHEN the static lookup proof of `slot-free-proof.contract.test.ts` collects every throwing lookup (`find(`, `findAs(`) of the mount
- THEN none names `[data-drawing]` (the box is looked up with `findAll`), every throwing selector resolves on the slot-free markup, and a seeded `find(root, '[data-drawing]')` fails the proof (a contract test; the no-slot runtime branches stay covered by the browser record, as in the Rectangle-area headless proof)

#### Scenario: [CWC45] Slot-free markup has no drawing hook
- GIVEN the test-only slot-free page module rendered through the real `CalculatorBody` with the Astro container
- WHEN the markup is read
- THEN no `data-drawing` element and no drawing box CSS is present (a unit test; extends [CWC33]); the share anchor is generic and present on every page ([CWC47])

### Requirement: The share hook is a list lookup

The generic mount MUST look up the share anchor with a list lookup that may be empty (`findAll(root, '[data-share]')`, never a throwing `find(`), reveal it with the same step that reveals the copy button, and rewrite its `href` with the share URL built from the controller's copy address on every render (`calculator-page`, share requirement). It rewrites with `setAttribute` only. A page markup with no share anchor leaves the mount unchanged.

#### Scenario: [CWC46] href follows the state
- GIVEN `shareHref(env, state, base)` with the base `https://wa.me/` (the value the mount reads from `data-share`), an environment at origin `https://example.test` and the concrete state after `waste` is set to `15`
- WHEN it is called
- THEN it returns `https://wa.me/?text=` followed by the percent-encoded share text, one space and `https://example.test/concrete-calculator?v=1&ws=15` (a unit test of `shareHref`; the mounted anchor's `href` is proved in the browser by `calculator-page` [CP78])

#### Scenario: [CWC47] Missing anchor is not an error
- GIVEN the source of `apps/web/src/client/mount.ts`
- WHEN the static lookup proof of `slot-free-proof.contract.test.ts` collects every throwing lookup of the mount
- THEN none names `[data-share]`: the anchor is looked up with `findAll`, so markup without it runs no share code (a contract test: the proof asserts that the mount's throwing selectors exclude `[data-share]`; the slot-free markup itself carries the generic anchor, so the markup check alone would not catch a throwing lookup)
