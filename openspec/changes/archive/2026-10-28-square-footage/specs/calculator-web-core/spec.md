# Delta for calculator-web-core

The `rectangle-area` page gains an answer slot (`calculator-page` [CP67]), so the unrouted-proof requirement cannot stay as written: the proof moves to a test-only slot-free page module, and [CWC32] ("stays unrouted") retires at the go-live. Continues the prefix CWC (next free id: CWC38). Changed: [CWC33]. Kept as written: [CWC31]. Removed: [CWC32]. Added: [CWC38], [CWC39], [CWC40]. Every other requirement is unchanged ([CWC34] keeps scanning generic code for registry ids; the test-only module lives under `apps/web/src/contract/__testing__/` and is outside that scan by path).

## MODIFIED Requirements

### Requirement: Rectangle-area headless proof

The generic controller and mount MUST run with no optional slot, from `packages/core` and the catalogs, with no copy of any concrete code. The proof is a test-only slot-free page module under `apps/web/src/contract/__testing__/` that wraps the `rectangle-area` calculator with `definePage({ calculator })` and no slot (the real `rectangle-area` page module declares an answer slot and is no longer slot-free). Its unit and integration tests MUST cover each slot-absent branch of the controller. Its DOM-level proof is at unit level: the page view of the test-only module, built by the real builder, MUST be rendered through the real calculator components with the Astro container API and read as markup, and a test-only proof entry that mounts the test-only module MUST be walked by the entry-graph contract, whose graph excludes every unused slot. Every element the generic mount looks up with a lookup that fails when the element is absent MUST be present in that markup; slot elements are looked up as lists that may be empty. The proof adds no page, island, route, sitemap entry, production `dist` file or production catalog key. After the `rectangle-area` go-live no routed page is slot-free, so the no-slot branches of the mount stay covered by this proof alone (the unit suite has no DOM; a browser record for a slot-free page does not exist).
(Previously: the proof ran on the real `rectangle-area` module, which had no slot, "stays unrouted" was asserted by [CWC32], and the first routed slot-free page, Square footage, was to be the real-browser proof. Square footage declares an answer slot, so the first routed page is not slot-free.)

#### Scenario: [CWC31] Area through the generic controller
- GIVEN the case A text `10'` and `12' 6"` entered in length and width
- WHEN the controller evaluates it
- THEN the figures are `125.00` ft², `13.89` yd², `11.61` m² (`calc-rectangle-area` case A: 125, 125/9, 145161/12500)

#### Scenario: [CWC33] DOM markup has no slot elements
- GIVEN the test-only slot-free page module of `rectangle-area` for `en` rendered through the real `CalculatorBody` with the Astro container
- WHEN the markup is read
- THEN no `data-choice`, `data-step`, `data-shopping`, `data-line`, `data-fill`, `data-line-note`, `data-cost-row`, `data-hint-row`, `data-price-hint` or answer-slot element exists, and the inputs `calc-length` and `calc-width`, two `data-unit` buttons, `data-copy`, `data-copy-status`, `data-primary` and three `data-output` values `100.00`, `11.11`, `9.29` are present
- AND every selector the generic mount looks up with a failing lookup matches an element of this markup (selectors of the shared layout, such as the language switch, are listed by name in the test), and the id of every text input of the module resolves (a unit test, `rectangle-area-proof.contract.test.ts` moved to the test-only module)
(Previously: the markup was that of the real rectangle-area page view.)

#### Scenario: [CWC38] The test-only entry graph excludes every slot
- GIVEN the test-only proof entry that mounts the slot-free module
- WHEN the entry-graph contract walks its static import graph
- THEN the graph reaches no slot module, no concrete module and no data package, and its size is within the 49,152 B ceiling of `site-quality` (a contract test; the entry is not part of `CALCULATOR_PAGES` and is not built into `dist`)

#### Scenario: [CWC39] The real rectangle-area entry reaches only the answer slot
- GIVEN the `rectangle-area` entry of `CALCULATOR_PAGES` (`apps/web/src/client/entries/rectangle-area.ts`, mounted with the page module and never `lib/calculators.ts` or the data root)
- WHEN the entry-graph and client-entry contracts walk it
- THEN its graph contains the answer slot and reaches no choice, stepper, shopping or cost slot, no concrete module and no data package, and it is covered with no test edit ([CWC37]) (a contract test)

#### Scenario: [CWC40] Unrouted-proof assertions are retired with the go-live
- GIVEN the go-live merge
- WHEN `apps/web/src/contract/` is listed and `docs.contract.test.ts` runs
- THEN the block that asserted rectangle-area is in no route, sitemap or `dist` file (the former [CWC32]) is gone, `AGENTS.md` steps 12 and 14 are rewritten so that every path they name exists, and the proof files that remain (test-only module and entry) are named by the recipe as test support (a contract test)
