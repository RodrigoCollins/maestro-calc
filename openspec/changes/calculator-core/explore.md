# Exploration: calculator-core (generic web layer, follow-up JD-5)

**Answer first.** Recommend C, delivered through a typed `PageModule` with optional feature slots. Concrete becomes module #1 with zero visible behavior change, and rectangle-area is the headless second consumer in tests. Do not ship a second live page in this change.

## 1. Context

- The archived `concrete-calculator` renamed the web modules to concrete-scoped names on purpose (RD-2, `4f20847`), and JD-5 deferred the split: "split a generic core before calculator 2". The archive-report follow-ups repeat it: `CalculatorView.astro` calls `concreteView` for every id, and the e2e page list is hand-kept.
- Today a second calculator would need a copy of: controller (529 lines), mount (295), layout, shapes, concrete-present, `concrete-page.ts`, `model.ts` (all `Concrete*` types), `CalculatorForm/ResultPanel/ShoppingLine` (the markup hardcodes shape, waste, bag, price and cost groups), the island, the entry, and `CONCRETE_PAGES`.
- Gates on main per the archive-report: JS graph 36,450 B of 49,152 B, e2e 283 tests, `site-browser` 5m25s, 100% coverage.

## 2. Map

### 2.1 `apps/web/src/calculator/*`

**Generic or genericisable**

- `concrete-controller.ts:128-136` has `required`/`mustBeOk`, and `:138-149` has descriptor lookup and `message`.
- `:224-236` `rawOf`. Only the `shape`/`bag` selects are named; the empty-price-to-`undefined` rule (DR-11) is really "money kind".
- `:245-255` `evaluate`, `:260-271` `parsedWith`, `:273-280` `boundValues`, `:282-287` `hintOf`.
- `:289-328` `fieldViews`. Only the waste help at `:298` is concrete.
- `:396-413` `commit`/`unchanged` (encode and `replaceState` write), `:415-433` `noticeOf`/`start` (decode).
- `:441-473` `keptText`/`convertedTexts` (the unit toggle), `:518-529` `copyAddress`/`copyOutcome`.
- `:189-208`, `:289-328` and `:451-473` repeat each `TextKey` by hand. A loop over `calculator.inputs` replaces them: length uses `fieldText`, count uses `String`, percent uses `percentText`, money uses `priceText`.
- `present.ts` is language-free number text and already generic. Only `volumeText` hardcodes 2 places, which core's `DisplayHint` (`descriptors.ts:79-90`) already declares per output.
- `concrete-layout.ts:21-25` has the id helpers (`inputId`, `hintId`, `helpId`, `errorId`). They are generic, and `CalculatorField.astro:2` already imports them from this concrete-named file.

**Concrete-shaped**

- `concrete-shapes.ts` (`SHAPES`, `SHAPE_FIELDS`, `DIMENSION_ORDER`).
- `concrete-layout.ts:4-19`: `ALWAYS_VISIBLE`, `TEXT_KEYS`, `RESERVED_ROWS` (tallest shape, for CLS), `layoutOf`.
- Controller: `:14-15` imports `CONCRETE_MIX_YIELDS` and `concrete`. `:66-85` `Panel` (bags, bagLb, bagYield, costs). `:125,475-489` waste stepper (`WASTE_STEP`, `WASTE_MIN/MAX`, which duplicate the engine bounds 0..50). `:336-366` `panelOf` (primary volume key swapped by unit system). `:368-382` `answerOf`. `:496-503` shape and bag events. `:512-513` waste event.
- `concrete-present.ts:68-71` `VOLUME_ORDER`, `:94-117` `figuresOf`, `:130-182` `answerValues` (a switch per shape).

### 2.2 Mount, entry, island

- `client/concrete-mount.ts` generic parts:
  - Helpers `:22-57`, `paragraph` `:103-111`, `renderField` `:113-134` (except `:131`, `DIMENSION_ORDER`).
  - The `render` skeleton `:182-191`, the event wiring `:246-295` (input dispatch, copy via clipboard and its fallback `:209-227`, submit and Enter handling, enabling `:disabled`, revealing hidden buttons).
  - `history.replaceState` at `:243`.
- Concrete parts: `Ui.primary`/`Ui.shopping` `:60-100`, `renderPanel` `:136-164`, the `data-shape-button`/`data-bag` groups `:166-180`, `eventOf` `:197-207`.
- `client/entries/concrete.ts` is 1 line (`mount()`) and `islands/ConcreteScript.astro` is 1 processed `<script>`. Both are already thin; the entry only needs to pass its module. Per DR-1 the entry stays per calculator (CP48: no registry import).

### 2.3 View and components

- `views/CalculatorView.astro`:
  - `:10,32` always call `concreteView(locale)`.
  - `:24-26` `SCRIPTS` is the only per-id table.
  - `:29` reads the `calculators/<locale>/<id>` content entry, which is generic.
- `lib/concrete-page.ts:80-219` builds a `ConcretePageView` from the definition and the catalogs.
  - Generic content: labels `calc.concrete.inputs.*`, `choices` from select options and defaults, `field()` from descriptor kind (inputmode, money placeholder, length hint), `defaultText` (`:66-77`), the `site.calculator.*` texts, templates for errors (all `ALL_ERROR_CODES`), copy and hints.
  - Concrete content: figures (`:110`), sentence (`:115-118`), form layout (`:126-148`), result rows and shopping (`:150-186`), the `calc.concrete.page.*` keys.
  - `:198` bakes `calc.concrete.page.example` into the no-JS note.
- `components/calculator/model.ts` is all `Concrete*` (the header comment says so). `CalculatorForm.astro:31-79` hardcodes the shape, waste, bag and price groups. `ResultPanel.astro` hardcodes costs and `readyMixNote`. `ShoppingLine.astro` hardcodes `data-bag-lb` and `data-yield`. `CalculatorBody.astro:17-24` is generic except `answers` (by shape) and `volumes`. `Breadcrumb`, `SourceList` and `CalculatorField` (except its import) are generic.
- A per-calculator typed shape (names illustrative):
  - Language-free `CalculatorPageSpec<C>`, importable by the client: id, choice groups (select key, optional `drives` visibility map), field order and per-field visibility, steppers `{ key, step }`, primary output per unit system, row list, shopping and cost slots, `figures(valid, result, system)`, `answerValues(valid, result, system)`, answer-template key function.
  - Server-only `pageViewOf(spec, locale)` joins the spec, the catalogs and the definition into one `CalculatorPageView`. This mirrors today's `concrete-present.ts` vs `concrete-page.ts` split and keeps the client bundle language-free (client-entry MESSAGES test).

### 2.4 Core (`packages/core`)

- Derivable from a definition alone (`descriptors.ts`):
  - Field order, kind, key, `urlKey` and defaults.
  - The input mode: count is numeric, the other kinds decimal.
  - The money placeholder.
  - The unit hint from `defaultUnit`/`metricDefaultUnit` (length).
  - Select options and default.
  - Bounds for the error text.
  - The label keys `calc.<id>.inputs.<key>` and output keys `calc.<id>.outputs.<key>` (`messageKeysOf`).
  - Decimal rows (output `display.unit` and `places`).
  - Money rows (`moneyText`).
  - The primary output (`role: 'primary'`).
  - The run outcome, shopping lines `{ materialId, purchaseUnit, qty }`, and the URL codec via `decode`/`encode`.
- Needs presentation data per calculator:
  - Which outputs swap as primary per unit system (concrete yd3 vs m3, `:349`; there is no system tag in `DisplayHint`, and adding one would be a core change, so keep it in the module).
  - Answer-sentence templates and their value functions.
  - The shopping label wording as a split template. Catalog keys `material.concrete-mix.units.bag-80` exist, but the page uses `calc.concrete.page.shoppingLine` for in-place rewrite.
  - Per-line extras (bag yield).
  - Which fields show under which select value (shape).
  - The waste stepper step.
  - The cost-row price hints and the ready-mix note.
- `rectangle-area` (`rectangle-area.ts:28-55`): 2 length inputs, 3 area outputs with display hints, `shopping: []`, no select, count, percent or money. It is the minimal fixture: concrete exercises every feature, rectangle-area exercises every optional-slot-absent branch.

### 2.5 e2e (`tooling/site-browser/e2e`)

- `concrete-pages.ts:27-58` `CONCRETE_PAGES` (paths, catalogs, hand-written slab20/metric sentences, shape starts, bag-end and yield strings). `:64-101` `STATES` (12 hand-verified figure tuples, concrete-only). `:104-109` `SHAPE_FIELDS`.
- `urls.ts:8-11` already derives `calculatorPaths` from `CALCULATOR_PAGES` and `ROUTES`. `smoke.spec.ts` and `no-js.spec.ts` therefore already generalise.
- `calculator.spec.ts` (7 references, e.g. `:40,73,130,241`), `layout.spec.ts`, `a11y.spec.ts` and `csp.spec.ts` (which hardcodes `/concrete-calculator` at `:51,59`) iterate `CONCRETE_PAGES`.
- Split into:
  - Generic suites over a derived page list: enable controls, module aborted leaves static page, labels from the catalog, touch targets, unit toggle, copy link, CSP, axe, layout.
  - Calculator-specific data declared per id, with a `Record<CalculatorPageId, E2eSpec>` type, so a missing row is a type error (the same trick as `SCRIPTS`). It can be imported with the same relative-path style as `urls.ts:1-2`.
- The generic selectors replace `[data-shape-button]`, `[data-bag]`, `[data-waste-step]` and similar (57 references in 11 files) with a generic scheme, e.g. `data-select="<key>"` plus `data-value`.

### 2.6 Contract tests and hand-kept lists

- `entry-graph.contract.test.ts:6-7` and `client-entry.contract.test.ts:9` hardcode `entries/concrete.ts`, and `:16-17` assert concrete core paths. They should iterate `CALCULATOR_PAGES`.
- `__testing__/client-graph.ts:7` has `(?!concrete\/)` hardcoded in the forbidden pattern ("another calculator directory"). It should be derived from the entry id.
- `client-hygiene.contract.test.ts:33-35` pins `['concrete-mount.ts','entries/concrete.ts']`. It becomes the generic mount plus one entry per page id.
- `templates.contract.test.ts:21-22,52-54` and `routing/templates.ts:8,18` pin concrete and rectangle-area. The lists stay hand-kept by design, and the tests should derive their pins.
- `lib/calculators.ts:10` is still hand-kept (a registry test guards it). `lib/i18n-contract.test-d.ts:12,19-33` has the `EnglishKeys` union and a per-calculator `ConcretePageKeys` list. Both remain hand-kept because types cannot read directories.
- `calculator-content.contract.test.ts` and `CalculatorView.test.ts` call `concreteView`/`concrete` directly. They will take the id from the module table.
- `site-check` rules already derive from `CALCULATOR_PAGES`. The concrete strings in `site-check/__testing__/page-fixture.ts` are fixtures only.

## 3. Second-calculator question

- Rectangle-area is already in the registry (PAGELESS) with its URL keys `l`/`w` frozen in `RELEASED`. It is nearly the PLAN §4.1 item #2 ("Square footage, + m2 to ft2": ft², yd², m² outputs).
- As a headless proof it is ideal. It is free, already tested, and it is the minimal fixture for the optional-slot-absent branches that the 100% rule on `apps/web/src/calculator/**` (`vitest.config.ts:25`) demands.
- As a live page it is not a free proof. It means a permanent route and slug, a 5-section md in 2 languages, methodology rows, sources, an owner review of the content (as F.3 was for concrete), a `ROUTES` row, home link and counts in `end-state.contract.test.ts`. A page with no select, no shopping, no cost and no waste does not stress the harder abstractions anyway.
- Recommendation: prove with unit and integration tests on rectangle-area, and leave calculator 2 as a live page to its own change. If the owner wants rectangle-area live, it would be as "Square footage" (#2), and that is a product decision for the proposal.
- First real product calculator after concrete: PLAN §4.1 #2 Square footage, probably rectangle-area itself. Its new presentation needs are an area-valued primary with ft², yd², m² (the primary does not depend on the unit system the way concrete's does), no shopping, no costs, and possibly add-and-subtract rows (undefined).
- Calculators that add more than concrete (#8-10 Gravel/Mulch/Topsoil, #7 Paint, #6 Drywall):
  - Gravel, mulch and topsoil: a material select that drives density (tons, via the core `mass`/`density` dimensions, which exist), a depth input, and several shopping lines (bulk yd³ and bags) with no waste/bag-size groups. The page needs a shopping line list instead of the single line.
  - Paint: coats, openings (a repeatable group, so a possible new descriptor kind).
  - Drywall: several shopping items (sheets, screws, compound, tape).
  - This is why the shopping slot should be a list from the start.

## 4. Approaches

|                                                                                                                                                                                                                                      | A. Fully parameterised generic core                                                                                                                                 | B. Copy for calculator 2, extract later                                                                                                                                       | C. Generic core for definition-driven parts, concrete via typed slots                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| What                                                                                                                                                                                                                                 | Controller, mount, layout, presenter, view all driven by a declarative per-calculator module (fields, groups, figures, templates, shopping)                        | Keep `concrete-*`. Copy to `rectangle-*`/`<id>-*`.                                                                                                                            | Generic: texts, validation, URL, unit toggle, notice, copy, ids, DOM wiring, field/figure loops. Concrete: shape visibility, waste stepper, bag group, figures, answers as typed module slots the core calls                   |
| Pros                                                                                                                                                                                                                                 | Smallest future cost per calculator.                                                                                                                                | Zero risk to concrete now; fastest to calculator 2.                                                                                                                           | The same typed module as A but only the features concrete needs are built now. Reuses concrete's 283 e2e as a regression net. Cost lands only where reuse is proven.                                                          |
| Cons                                                                                                                                                                                                                                 | Speculation from one live example. The declarative surface is large.                                                                                                | Doubles 1,300+ lines of near-identical code and its 100%-coverage tests. Extraction later is harder after divergence. Repeats the JD-5 debt a second time.                     | Needs a clear line between core and slot, and optional slots must be tree-shakable. Touches the public DOM selectors.                                                                                                        |
| Effort                                                                                                                                                                                                                               | High                                                                                                                                                                | Low now, High later                                                                                                                                                           | Medium-High                                                                                                                                                                                                                  |

Recommendation: C (it is A's interface, built incrementally).

- Why: concrete is the only live user, so the interface is shaped by what concrete needs plus what rectangle-area proves absent. Shopping slots are lists and choice groups are generic from day one (§3), because calculators 6-10 will need them.
- It needs two commits groups at least: (1) generic core with concrete as module #1 and no behavior change; (2) rectangle-area headless proof plus the per-id tables.

## 5. Assessments

- **JS budget (49,152 B per page).** The budget is per page: the entry plus its static import graph (`budgets.ts:24,56-84`). A shared generic core is bundled into each entry or a chunk the page imports, so the per-page size is generic core + the module + that calculator's core + yields. It does not accumulate across calculators. The generic loops may cost a little over today's hand-expanded code (a descriptor loop replaces literals, an indirection table replaces a switch). Features that a calculator does not import (stepper, shopping, choice groups) must be importable modules, or every page pays for them. Concrete is at 36,450 B, which leaves about 12,700 B. The `client-entry` and `entry-graph` tests must run per entry.
- **Coverage.** `vitest.config.ts:14,25` puts `apps/web/src/calculator/**` at 100% (lines, branches, functions, statements). The generic controller and the per-calculator modules must live there and be fully covered (concrete and rectangle-area fixtures together cover both branches of every optional slot). The mount, components and lib are not in the coverage include (`:12-18`), so they rely on e2e.
- **e2e wall time.** `site-browser` is 5m25s with a 20-minute bound in CI. Generic suites run once per page and locale, so wall time grows roughly linearly with each calculator page. e2e sharding is already a recorded follow-up. This change adds no pages if rectangle-area stays headless.
- **Mutation.** Stryker covers `packages/core` and `packages/data` only (AGENTS.md). No core change means shards, CI keys and the identity files are untouched. A core change (e.g. a system tag in `DisplayHint`) would not be neutral: it affects the `calculators` shard and the release contract.
- **AGENTS.md recipe afterwards.**
  - Gone: the `concreteView`-for-every-id note and the "generalise first" paragraph (step 12). The hand-kept `CONCRETE_PAGES` becomes a typed per-id e2e record. `SCRIPTS` and the page view fold into one `Record<CalculatorPageId, …>` table with a type error when a row is missing.
  - Stays hand-kept: the `ROUTES` row and catalogs, `calculators.ts`, `PAGELESS`/`CALCULATOR_PAGES`, the `i18n-contract.test-d.ts` unions, `RELEASED`/`REGISTRY`, the 3-line `entries/<id>.ts` and `islands/<Id>Script.astro`, `end-state` counts.
  - New per-calculator step: the language-free `<id>-page-spec.ts` module and a typed e2e record.

## 6. Open questions for the proposal

1. Should rectangle-area go live as "Square footage" (#2) in this change or in the next? Recommendation: next.
2. Rename the public DOM hooks (`data-shape-button`, `data-bag`, `data-waste-step`) to a generic scheme (this touches spec calculator-page clauses and about 57 references), or keep concrete's names as the module's configured attributes?
3. Where do the module and generic code live? The `apps/web/src/calculator/` folder gets the 100% rule. Client-visible modules must stay language-free.
4. Should a non-routed test route (like `contract/__testing__/budget-page.astro`) build rectangle-area through the real view and mount, as a cheap DOM-level proof? Or is unit-level enough?
5. Does the primary-by-unit-system choice stay in the module, or should core's `DisplayHint` gain a unit-system tag (a core change, affecting mutation and the release contract)?
6. How should the `RESERVED_ROWS` reservation (CLS 0.01) be declared generically for fields that show conditionally?
7. Do the controller's `WASTE_MIN/MAX` (`:476-477`) stay as constants or come from the descriptor's `min`/`max`?
8. Is it acceptable that a shopping label stays a split template (`Concrete mix, {bagLb} lb bags`) rather than deriving from `material.*.units.*`?
9. Delivery: PRs grouped per the standing owner decision. Slice suggestion: (1) generic controller + layout/present renames with concrete as module #1; (2) generic mount + view + components; (3) e2e/contract generalisation + rectangle-area headless proof + AGENTS.md.

## 7. Risks

- Single live data point: an interface shaped by concrete can be wrong for calculators 6-10 (several shopping lines, repeatable groups, a second kind of select).
- Behavior regression in a live page. The existing e2e (283), axe and Lighthouse (CLS 0) are the net, so they must stay green without edits to concrete's expectations.
- Byte budget: generic indirection and un-shakable features may add bytes to every calculator's bundle.
- Public DOM and selectors renames fan out to specs and e2e.
- The 100% coverage rule applies to all the new generic code, so the test work is sizable (concrete-controller.test.ts and friends need to move, not be rewritten).
- Scope creep into core (system tag, new descriptor kind) would make mutation and the URL contract part of this change.
