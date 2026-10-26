# Tasks: Calculator Core — Generic Web Layer for Every Calculator Page

Change: `calculator-core` · Inputs: `proposal.md` (D1–D13), `design.md` (K1–K16, the 18-slice plan in "Review units" is authoritative, M-1..M-6 and m-1..m-11 applied), `design-review.md`, 3 delta specs under `specs/` (`calculator-web-core` CWC1–37, `calculator-page` CP54–58 plus kept CP ids, `site-quality` SQ29–32) · Mode: strict TDD (`npm test`), artifact store `openspec`, delivery `auto-chain`, chain `stacked-to-main`, one PR per group (owner rule), work-unit commits per slice.

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~4,420 total (`git diff --shortstat`, rename detection on, lockfiles excluded); 18 review units of 30–380 each |
| 400-line budget risk | Medium. S3 (~370), S5 (~380) and S15 (~350) sit near the cap, each with a named split; S1, S8 and S13 are renames with a similarity guard |
| Chained PRs recommended | Yes (3 group PRs, each above 400 as the owner accepts; every slice is a work-unit commit set inside its group) |
| Suggested split | G1 generic controller, concrete as module #1 (S1–S6, ~1,770) → G2 page parts (S7–S14, ~1,750) → G3 browser record, entry contracts, docs (S15–S18, ~900) |
| Delivery strategy | auto-chain |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: Medium

Per-group forecast: G1 ~1,770 · G2 ~1,750 · G3 ~900 · total ~4,420.
At-risk slices and named splits: S3 (answer slot becomes S3b, ~90, between S3 and S4) · S5 (`PanelView` and the answer, ~120, move into S5b after the events and `controllerOf`) · S15 (record type and concrete's record S15a, split from the suite rewrite S15b) · rename slices S1, S8, S13 (if `--shortstat` shows a rename as delete plus add, the edits that lowered similarity move into the next slice).

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| S1 | Move concrete web files into `calculator/concrete/`, ids helpers | G1 | `npm test -- apps/web/src/calculator apps/web/src/contract/docs` | `npm run build && npm run test:e2e` | the renames plus import fixes and one AGENTS sentence |
| S2 | `definePage`, `shoppingLinesOf`, choice slot, `concrete/page.ts` (part) | G1 | `npm test -- apps/web/src/calculator` | `npm run typecheck` (test-d) | `page-module.ts`, `slots/choices.ts`, `concrete/page.ts` |
| S3 | Stepper, shopping, cost, answer slots; concrete page complete | G1 | `npm test -- apps/web/src/calculator` | `npm run typecheck` | `slots/{steppers,shopping,costs,answer}.ts`, `concrete/present.ts` edits |
| S4 | `texts.ts`, `outputText`, raw record from the definition | G1 | `npm test -- apps/web/src/calculator` | `npm run build && npm run test:e2e` | `texts.ts` and the controller edits; reverts to S3 |
| S5 | `controllerOf` over the page module | G1 | `npm test -- apps/web/src/calculator` | `npm run build && npm run test:e2e`; entry size print | `controller.ts` edits and re-pointed tests; reverts to S4 |
| S6 | Rectangle-area headless proof, generic-code scan | G1 | `npm test -- apps/web/src/calculator/rectangle-area apps/web/src/contract/generic-code` | N/A (tests only, no shipped code) | `rectangle-area/` and one contract test |
| S7 | Rename the 57 DOM hook references, `--calc-rows` CSS | G2 | `npm test -- apps/web/src/components apps/web/src/styles` | `npm run build && npm run test:e2e` | one commit; selectors and CSS only |
| S8 | `lib/concrete-page.ts` → `lib/page-view.ts`, `form-layout.ts` | G2 | `npm test -- apps/web/src/lib apps/web/src/calculator/form-layout` | `npm run build && npm run test:e2e` | rename plus one new file |
| S9 | Generic form view | G2 | `npm test -- apps/web/src/components apps/web/src/lib` | `npm run build && npm run test:e2e` | `page-view.ts` form part, `CalculatorForm.astro`, form types |
| S10 | Generic result view | G2 | same as S9 | `npm run build && npm run test:e2e` | `ResultPanel.astro`, `ShoppingLine.astro`, result types |
| S11 | Messages list from the view | G2 | same as S9 | `npm run build && npm run test:e2e` | messages list, `CalculatorBody.astro` |
| S12 | `lib/pages.ts`, `CalculatorView` by id, D13 render tests | G2 | `npm test -- apps/web/src/lib apps/web/src/views apps/web/src/components` | `npm run build && npm run test:e2e` | `pages.ts`, view edit, caller renames |
| S13 | `client/concrete-mount.ts` → `client/mount.ts` | G2 | `npm test -- apps/web/src/contract/docs apps/web/src/contract/client` | `npm run build && npm run test:e2e` | the rename plus entry import |
| S14 | Generic mount, `mount(concretePage)` entry | G2 | `npm test -- apps/web/src/contract` | `npm run build && npm run check:site && npm run test:e2e` | `mount.ts`, `entries/concrete.ts`, hygiene list |
| S15 | Typed per-id e2e record, generic `calculator.spec.ts` | G3 | `npm run typecheck --prefix tooling/site-browser && npm test -- apps/web/src/contract/browser-record` | `npm run build && npm run test:e2e` | `e2e/calculator-pages.ts`, `e2e/concrete-pages.ts`, `calculator.spec.ts` |
| S16 | axe, layout, CSP suites over the record | G3 | same as S15 | `npm run build && npm run test:e2e` | the three spec files |
| S17 | Entry contracts per id, slot-free proof | G3 | `npm test -- apps/web/src/contract` | `npm run build && npm run check:site` (no rectangle-area in `dist`) | contract tests plus `__testing__/rectangle-area-entry.ts` |
| S18 | AGENTS.md recipe rewrite, `docs.contract` tokens | G3 | `npm test -- apps/web/src/contract/docs` | N/A (docs only) | `AGENTS.md`, `docs.contract.test.ts` |

## Conventions (apply to every slice)

**Branches and stacking.** One branch per group: G1 `feat/calculator-core-g1-generic-controller`, G2 `feat/calculator-core-g2-page-parts`, G3 `feat/calculator-core-g3-browser-record-docs`. G2 branches from the G1 tip and is retargeted onto `main` after G1 merges (never a child diff that includes parent changes); the same for G3. The first task of every group says so.

**Commits (work-unit commits).** Each slice is one or more commits; tests and the code that proves them ship together (a RED test may be committed with its GREEN code). Conventional Commits only, no `Co-Authored-By`, no AI attribution; every commit leaves the tree green. Subjects are the design's "Review units" subjects.

**Strict TDD loop.** RED (a failing test with hand-verified values, seen failing for the right reason) → GREEN (smallest code) → REFACTOR (the four commands: `npm run format`, `npm run sync && npm run lint`, `npm run typecheck`, `npm run test:coverage`). Tags `[RED]`, `[GREEN]`, `[REFACTOR]`. A pure rename or a mechanical edit has no RED: its recorded exception is "the moved tests keep their assertions and stay green" (behaviour-preservation proof, design "Technical approach" 2). A test written against code that is already green says so and requires a break-the-code spot check. Test names cite the scenario id (`// spec: calculator-web-core › [CWC3]`).

**Fixtures.** Synthetic calculators (two-line shopping in reversed engine order, a five-field option, a stepper with `min` 0 and `max` 20, a count, money and boolean input, a descriptor with no bounds) are built with core's `defineCalculator` in one test-only helper `apps/web/src/__testing__/page-fixtures.ts` (check `fd __testing__ apps/web/src`; reuse an existing directory if there is one). It is a test-support path: outside the CWC9/CWC34 scans and outside coverage, like the other `__testing__` helpers.

**Hand-verified figures used below** (from the archived `concrete-calculator` specs, unchanged): concrete default `1.63` yd³ / `44.00` ft³ / `1.25` m³ / `40.00` net / `74` bags (80 lb); `?v=1&sh=footing&l=216&n=3` (F1) `1.96 / 52.80 / 1.50 / 48.00 / 88`; rectangle-area `10 ft × 10 ft` = `100.00` ft² / `11.11` yd² / `9.29` m², `12 ft 6 in × 10 ft` = `125.00 / 13.89 / 11.61`.

**Size measurement.** `git diff --shortstat <previous slice tip>..HEAD -M -- . ':(exclude)package-lock.json' ':(exclude)tooling/site-browser/package-lock.json'` (additions + deletions; rename detection on). Over 400: split at the last RED/GREEN boundary using the slice's named split, update `state.yaml`, never request an exception.

**Slice gates (run before the slice's last commit).** `npm run format:check` · `npm run sync && npm run lint` · `npm run typecheck` (plus `npm run typecheck --prefix tooling/site-browser` when `tooling/` changes) · `npm run test:coverage` (100 percent on `apps/web/src/calculator/**` and on `apps/web/src/lib/page-view.ts` from the slice that creates each) · the shortstat recorded. Also `npm run build && npm run test:e2e`: S1–S5, S7–S14, S15, S16. S6, S17 and S18 change no shipped code or suite, so they skip it.

**Group rules (main stays green, the live site does not change).**
- Every group leaves `main` green: `npm run verify` and the browser job pass on the group tip.
- G1 and G3: the built HTML is byte-identical to the baseline after the `/_astro/` name normalisation (dist-diff task at the group tip). G2: identical after the documented hook/CSS mapping (M-6 procedure, task G2.4).
- The hook rename and the e2e selector edits ship in one slice (S7); a rename never shares a slice with the edits that generalise the renamed file (K1).
- **No change to `packages/core`, `packages/data`, `packages/i18n`**, so no mutation shard, `RELEASED` tuple, URL key or catalog key changes. Proof, run at every group tip and recorded: `git diff --stat main -- packages/` is empty (against the previous group tip while its PR is open), together with `git diff --stat main -- .github/workflows/ci.yml 'packages/*/stryker.config.mjs'` being empty, and the existing `mutation*.contract.test.ts`, `released.contract.test.ts` and `i18n-contract.test.ts` staying green and unedited (`git diff --stat main -- apps/web/src/contract/mutation* apps/web/src/lib/released.contract.test.ts apps/web/src/lib/i18n-contract.test.ts` empty). SX4 (mutation) is therefore N/A for every slice and is not repeated below.
- Budgets (design "Byte budgets"): JS graph at most 49,152 B per entry including the rectangle-area proof entry, HTML at most 40,960 B, calculator page weight at most 196,608 B. Measured at S5 (library build, `client-entry.contract` print), S7 (`CalculatorBody.budget.test` print, both locales), S14 and S17 (real build via `check:site`, library build of the proof entry) and at each group tip. The concrete entry target is at most 38,500 B (gate 49,152).
- Coverage: 100 percent on `apps/web/src/calculator/**` from S1 (already gated) and on `apps/web/src/lib/page-view.ts` from S8, the slice that creates it by rename (own entry in the root `vitest.config.ts`, `coverage.contract.test.ts` first). The design lists this entry under S12; the owner rule here is "from the slice that creates it", so it moves to S8. If the renamed concrete-only builder is below 100 percent at S8, the missing-branch tests are written in S8 and their lines recorded against the forecast.
- Rollback: revert the group merge commits, newest first (G3, then G2, then G1); the groups are stacked, so G1 cannot be reverted alone after G2 has merged.

### Standard Exit Criteria per slice (SX)

- [ ] SX1 Slice gates green in the order above (100 percent coverage where required).
- [ ] SX2 Size: the shortstat is at most 400 and renames show as renames; actual vs forecast recorded in `apply-progress.md`.
- [ ] SX3 Commits: each subject is a conventional commit and the tree is green at each commit.
- [ ] SX4 Mutation: N/A for the whole change (core and data untouched; stated once here).
- [ ] SX5 Traceability: `apply-progress.md` lists the scenario ids proven and each negative proof run and reverted (`git status --porcelain` clean).

### Group Exit Criteria (GX): once per group PR, before merge

- [ ] GX1 `npm run verify` green on the group tip; CI green (`verify`, `mutation` matrix and `mutation-gate`, `site-browser`).
- [ ] GX2 History hygiene: `git log main..HEAD --format=%B | rg -i 'co-authored|claude|anthropic|generated with'` returns nothing.
- [ ] GX3 Four specialized reviewers on the frozen candidate (after `npm run format`): spec conformance, types and package boundaries, test quality, maintainability and performance. Only candidate-caused blocking findings gate.
- [ ] GX4 Judgment Day (two judges); at most one scoped correction transaction, then GX1 again on the corrected tree.
- [ ] GX5 PR opened against `main` with the body contents listed in the group's exit task; merged before the next group merges.
- [ ] GX6 `site-browser` job green and its wall time recorded in `apply-progress.md` (limit 15 minutes, SQ15).

---

## G1 — Generic controller, concrete as module #1 (`feat/calculator-core-g1-generic-controller`)

### S1 — Move the concrete web files into `calculator/concrete/`

Forecast: ~80 changed lines. Specs: none new (behaviour preservation; K13). Green because: pure renames and import fixes; the renamed tests keep their assertions.

Planned commit: `refactor(calculator): move the concrete web files into calculator/concrete`.

- [x] 1.1 Create `feat/calculator-core-g1-generic-controller` from `main`. Baseline: `npm run verify` green; record the entry size printed by `client-entry.contract` (36,450 B expected); build `main` and copy `apps/web/dist` to `<scratch>/dist-main` (the dist-diff baseline, design "Gates" step 1); `rg -n "concrete-controller|concrete-shapes|concrete-present|concrete-layout" apps tooling AGENTS.md` lists every importer to fix.
- [x] 1.2 [RED] `apps/web/src/calculator/ids.test.ts` (new): `inputId('length')` is `calc-length`, `hintId('length')` `calc-length-hint`, `helpId('waste')` `calc-waste-help`, `errorId('length')` `calc-length-error`, `labelId('shape')` `calc-shape-label`. Verify: fails (module missing).
- [x] 1.3 [GREEN] `apps/web/src/calculator/ids.ts` (the five helpers, `(key: string) => string`), the id helpers removed from `concrete-layout.ts` (its remaining rows code imports them), the id assertions moved out of `concrete-layout.test.ts` into `ids.test.ts`. Verify: 1.2 passes; `concrete-layout.test.ts` still green on the rows.
- [x] 1.4 [GREEN, rename] `git mv`: `calculator/concrete-controller.ts` → `calculator/controller.ts`; `concrete-controller.test.ts` → `calculator/concrete/controller.test.ts`; `concrete-shapes.ts` → `calculator/concrete/shapes.ts`; `concrete-shapes.test.ts` → `calculator/concrete/shapes.test.ts`; `concrete-present.ts` → `calculator/concrete/present.ts`; `concrete-present.test.ts` → `calculator/concrete/present.test.ts`. Fix imports only in `client/concrete-mount.ts`, `lib/concrete-page.ts`, the moved tests and any file the `rg` of 1.1 lists. No assertion changes. Verify: `npm test -- apps/web/src/calculator`.
- [x] 1.5 [GREEN] K13: `AGENTS.md` step 12 names `apps/web/src/calculator/controller.ts`, `apps/web/src/calculator/concrete/` and `apps/web/src/client/concrete-mount.ts` where it named `apps/web/src/calculator/concrete-*.ts`; the matching row of `apps/web/src/contract/docs.contract.test.ts` changes in the same commit. Verify: `npm test -- apps/web/src/contract/docs`.
- [x] 1.6 [REFACTOR] The four commands; `rg -n "concrete-controller|concrete-shapes|concrete-present" apps tooling AGENTS.md` is empty (outside `openspec/changes/archive`).
- [x] 1.7 Similarity check: `git diff --shortstat HEAD~1 -M` is at most ~80 lines; `git diff --stat -M HEAD~1` shows `=>` for all six moved files (a plain add plus delete means similarity fell under 50 percent: undo the edit that caused it and move it to S2). Record the numbers.
- [x] 1.8 Negative proof: temporarily re-point one moved test to a wrong accessor and see it fail; revert. `npm run build && npm run test:e2e` green (behaviour preserved).
- [x] 1.9 Exit: SX1–SX3, SX5.

### S2 — Page-module contract and the choice slot

Forecast: ~330 changed lines. Specs: calculator-web-core [CWC2] (primary, choices part), [CWC28], [CWC29]; calculator-page [CP58] (slot side). Green because: new modules nothing imports yet, 100 percent covered.

Planned commits: `test(calculator): pin the page-module contract and the choice slot` · `feat(calculator): add the page-module contract and the choice slot`.

- [x] 2.1 [RED] `apps/web/src/calculator/page-module.test.ts` (new): `definePage({ calculator: concrete })` returns a frozen module with `id` equal to `concrete.id` (`'concrete'`), and the same for `rectangleArea` (`'rectangle-area'`); `shoppingLinesOf('x', ['concrete-mix'], engine)` returns the engine lines in declared order; a two-line fixture whose engine order is the reverse returns declared order [CWC3 core]; each of an extra engine line, a missing line, a duplicate line and (with `units` given) a `purchaseUnit` that differs throws `PageModuleError` with `code` `'SHOPPING_LINES'`, `name` `'PageModuleError'` and `cause` holding `{ id }`; `declared = []` with `engine = []` returns `[]`. Verify: fails (module missing).
- [x] 2.2 [RED] `apps/web/src/calculator/slots/choices.test.ts` (new): `choiceSlot(concrete, [{ select: 'shape', shows: SHAPE_FIELDS }])` gives one group with `select` `'shape'`, `shown('slab')` `length, width, thickness`, `shown('footing')` `length, footingWidth, footingDepth, count`, `shown('column')` `diameter, height, count`, `shown('steps')` `stepWidth, rise, run, stepCount` (the CP11 table), `driven` the union of those twelve keys in definition order, `rows` `4` [CWC28]; a fixture group with an option showing five fields gives `rows` `5` with no constant edited [CWC29, CP58]; an option with no entry throws `PageModuleError` `CHOICE_OPTIONS`; a `shows` key that is not a text input (a select or a boolean) throws `CHOICE_OPTIONS`. Verify: fails.
- [x] 2.3 [RED] `apps/web/src/calculator/concrete/page.test.ts` (new): `concretePage.id` is `'concrete'`, `primary` is `{ imperial: 'volumeYd3', metric: 'volumeM3' }`, `choices.groups[0].select` is `'shape'` with `rows` 4 [CWC2 part]. `apps/web/src/calculator/page-module.test-d.ts` (new): `TextKey<typeof concrete>` equals the 15 keys (ten lengths, `stepCount`, `count`, `waste`, `bagPrice`, `readyMixPrice`); `SelectKey<typeof concrete>` is `'shape' | 'bag'`; `PageModule<typeof concrete>` and `PageModule<typeof rectangleArea>` assign to `AnyPageModule` (K11). Verify: fails.
- [x] 2.4 [GREEN] `apps/web/src/calculator/page-module.ts`: the types of the design's "Interfaces / contracts" block (`AnyCalculator` web-local from exported core types, `SelectKey`, `TextKey`, `PercentKey`, `MoneyKey`, `OutputKey`, `StateOf`, `ResultOf`, `Moment`, `Ready`, the five slot interfaces, `PageModule`, `PageSpec`, `AnyPageModule`), `PageModuleCode`, `PageModuleError`, `definePage<C>` overload plus erased implementation (freeze, `id` from `calculator.id`), `shoppingLinesOf`. No type assertion. Verify: 2.1 and the `test-d` pass.
- [x] 2.5 [GREEN] `apps/web/src/calculator/slots/choices.ts`: `choiceSlot<C>` overload plus erased implementation (rows is the largest `shown` set, throws `CHOICE_OPTIONS`); `apps/web/src/calculator/concrete/page.ts`: `definePage({ calculator: concrete, primary, choices })` with `SHAPE_FIELDS` imported from `./shapes.ts`. Verify: 2.2, 2.3 pass.
- [x] 2.6 [REFACTOR] The four commands; `rg -n "as (Record|unknown|any)|<[A-Z][A-Za-z]*>[a-z(]" apps/web/src/calculator/page-module.ts apps/web/src/calculator/slots` shows no assertion.
- [x] 2.7 Negative proofs: make `rows` a constant 4 (CWC29 fails); drop the `CHOICE_OPTIONS` check (the missing-option case fails); make `shoppingLinesOf` match by index (CWC3 reversed-order case fails); revert.
- [x] 2.8 Exit: SX1–SX3, SX5 (`npm run build && npm run test:e2e` also: client-reachable files exist but nothing imports them).

### S3 — Stepper, shopping, cost and answer slots

Forecast: ~370 changed lines (⚠ split S3b = answer slot, ~90). Specs: calculator-web-core [CWC2] (complete), [CWC3] (slot side); calculator-page [CP57]. Green because: new slot modules plus the concrete module; the controller still uses its own code.

Planned commits: `test(calculator): pin the stepper, shopping, cost and answer slots` · `feat(calculator): add the stepper, shopping, cost and answer slots`.

- [x] 3.1 [RED] `apps/web/src/calculator/slots/steppers.test.ts` (new): `stepperSlot(concrete, { waste: Rational.of(5) })` has `keys` `['waste']`; `next('waste', 10, 'more')` is `15`, `next('waste', 10, 'less')` `5`, `next('waste', 50, 'more')` `50`, `next('waste', 0, 'less')` `0`, `next('waste', 48, 'more')` `50` (clamped at the descriptor bounds 0 and 50) [CP22 logic]; a fixture percent input with `min` 0 and `max` 20 at 20 stays 20 on `more`, and the same fixture with `max` 30 reaches 25 with no page code edit [CP57]; a descriptor without `min` or `max` throws `STEPPER_BOUNDS`; a key that is not a percent input throws `STEPPER_BOUNDS`. Verify: fails.
- [x] 3.2 [RED] `apps/web/src/calculator/slots/shopping.test.ts` (new): the two-line fixture in reversed engine order, `view(moment)` returns two lines in declared order, each `qty` `groupedInteger(line.qty)` (for example `1,234`), `unit` and `fills` from `parts`; without a result every `qty` is `DASH` and the count is still the declared count [CWC3]; `view` throws `SHOPPING_LINES` when the engine lines differ from the declared materials or a `purchaseUnit` differs from the unit `parts` declares (M-4); concrete's slot declares one line with `material` `'concrete-mix'`, `label` `shoppingLine`, `fill` `bagLb`, `note { key: 'bagYield', fill: 'yield' }` [CWC2]. Verify: fails.
- [x] 3.3 [RED] `apps/web/src/calculator/slots/costs.test.ts` (new): `costSlot(concrete, [{ output: 'bagCost', price: 'bagPrice' }, { output: 'readyMixCost', price: 'readyMixPrice' }], { hint: 'priceHint', note: 'readyMixNote' })`; `visible(valid)` is `{ bagCost: false, readyMixCost: false }` for the defaults, `{ bagCost: true, readyMixCost: false }` with `bagPrice` `6.50`, both true with both prices above zero; an output or a price that is not money throws `COST_KINDS`. `apps/web/src/calculator/slots/answer.test.ts` (new): `answerSlot(concrete, { by: 'shape', values })` has `templates` `answer.slab`, `answer.footing`, `answer.column`, `answer.steps` and `template(valid)` follows the shape; without `by` the template is `answer` and `templates` is `['answer']`; `values` is the given function. Verify: fails.
- [x] 3.4 [RED] `apps/web/src/calculator/concrete/present.test.ts` (edit, moved in S1): `bagFills(moment, CONCRETE_MIX_YIELDS)` gives `bagLb` `80`, `60`, `40` for the three bag choices and `yield` `0.60`, `0.45`, `0.30` with a result, `yield` `DASH` without one (`bagLb` still follows the pressed choice); `answerValues(moment, primary)` keeps the four sentences of the existing assertions (default EN `Slab (12 ft × 10 ft, 4 in thick): 1.63 cubic yards with 10% extra. Bags of 80 lb: 74.`), now taking the primary text as its second argument. Update `concrete/page.test.ts`: the module has `steppers`, `shopping` (one line), `costs` (two rows), `answer` [CWC2 complete]. Verify: fails.
- [x] 3.5 [GREEN] `apps/web/src/calculator/slots/{steppers,shopping,costs,answer}.ts` (each a precise overload plus an erased implementation, factories take the calculator first, runtime checks only on data: kinds, bounds, materials), `concrete/present.ts` (`bagFills`, `answerValues(m, primary)`; the old signature stays until S5 re-points the controller, so both exist for this slice), `concrete/page.ts` complete as the design's "Concrete module #1" block. Verify: 3.1–3.4 pass.
- [x] 3.6 [REFACTOR] The four commands; check the diff size; if the shortstat is over 400, cut at 3.3's answer half (S3b).
- [x] 3.7 Negative proofs: clamp at a literal 50 instead of the descriptor bound (the `max` 30 fixture fails, CP57); show a cost row at price 0 (costs test fails); match the shopping line by index (CWC3 fails); revert.
- [x] 3.8 Exit: SX1–SX3, SX5.

### S4 — Field texts and figures from the definition

Forecast: ~330 changed lines. Specs: calculator-web-core [CWC5] (controller side), [CWC6], [CWC8] (regression), [CWC14] (regression). Green because: the controller's three hand lists are replaced by one derived loop; the renamed concrete controller test keeps its assertions.

Planned commits: `test(calculator): pin the derived texts and output figures` · `refactor(calculator): derive the field texts and figures from the definition`.

- [x] 4.1 [RED] `apps/web/src/calculator/texts.test.ts` (new): `textKeysOf(concrete)` is the 15 text keys in definition order; `textsOf(concrete, defaultState, 'imperial')` is `12 ft`, `10 ft`, `4 in`, `16 in`, `8 in`, `12 in`, `8 ft`, `4 ft`, `7 in`, `11 in` (the ten lengths), `3` (`stepCount`), `1` (`count`), `10` (`waste`), and `''` for both prices [CWC5]; metric reads `3.6576 m`, `3.048 m`, `10.16 cm` for `length`, `width`, `thickness` [CWC14 regression]; synthetic fixtures: a count input gives `String(value)`, a money input `priceText`, a percent `percentText`; `textOf` throws on a select and on a boolean; `rawTextOf(moneyInput, '')` is `undefined` and `rawTextOf(moneyInput, '6.50')` is `'6.50'` [CWC6]; `baseOf(concrete, valid)` carries percents as text (`waste: '10'`); `keptText` keeps an invalid text with its own unit [CWC15 logic]. `apps/web/src/calculator/present.test.ts` (extend): `outputText` of the four volume outputs for the default is `1.63`, `44.00`, `1.25`, `40.00`; case H (`10,000,000/27` yd³ hint) is `370,370.37`; a money output formats through `moneyText` (`$481.00`); `priceText` assertions move here from `concrete/present.test.ts`; `DASH` is exported. Verify: fails.
- [x] 4.2 [RED] `apps/web/src/calculator/concrete/controller.test.ts` (extend, accessors only): the record handed to the engine for an empty `bagPrice` has the own key `bagPrice` with value `undefined` (`Object.hasOwn`) and carries the visible texts over the last valid state [CWC6]; `Environment.helps` is read from the environment, so a field with help (`waste`) is described by `calc-waste-help` while no error is present and a field without help is not. Verify: fails.
- [x] 4.3 [GREEN] `apps/web/src/calculator/texts.ts` (the signatures of the design's table: overloaded `textKeysOf` and `textsOf`, `textOf`, `rawTextOf`, `baseOf`, `keptText`), `apps/web/src/calculator/present.ts` (`DASH`, `priceText` moved, `outputText` over `findUnit` and `places`), `controller.ts` (raw record, field views and the unit toggle use `textsOf`/`baseOf`/`keptText`; `Environment.helps`; `FieldView.hidden`), `client/concrete-mount.ts` (fills `helps` from the `#calc-<key>-help` elements and uses `textKeysOf` in place of `TEXT_KEYS`), `concrete-layout.ts` and `concrete-layout.test.ts` deleted (its rows assertions already live in `slots/choices.test.ts` since S2). Verify: 4.1, 4.2 pass; `rg -n "concrete-layout" apps AGENTS.md` is empty.
- [x] 4.4 [REFACTOR] The four commands; the three hand lists are gone (`rg -n "TEXT_KEYS|DIMENSION_ORDER" apps/web/src` has no controller or mount hit).
- [x] 4.5 Negative proofs: skip `rawTextOf` so an empty price becomes `''` (CWC6 fails and the concrete price case fails); read bounds in the wrong unit (CWC8 concrete assertion fails); revert.
- [x] 4.6 Exit: SX1–SX3, SX5.

### S5 — Drive the controller from the page module

Forecast: ~380 changed lines (⚠ split S5b = `PanelView` and the answer, ~120). Specs: calculator-web-core [CWC3] (creation check), [CWC5], [CWC8], [CWC10]–[CWC12], [CWC14], [CWC15], [CWC17] (regression through the unchanged assertions), [CWC36] (library-build size). Green because: the concrete controller test keeps its assertions; only accessors move.

Planned commits: `test(calculator): pin the generic controller contract` · `refactor(calculator): drive the controller from the page module`.

- [x] 5.1 [RED] `apps/web/src/calculator/concrete/controller.test.ts` (accessors re-pointed, assertions unchanged): `panel.volumes.x` → `panel.figures.x`, `panel.bags` → `panel.shopping[0]?.qty`, `view.shape` → `view.choices.shape`, the event helpers built on `controllerOf(concretePage)`. The suite covers [CWC5] (texts and figures `1.63`, `44.00`, `1.25`, `40.00` and `74`), [CWC8], [CWC10] (F1 `1.96 / 52.80 / 1.50 / 48.00 / 88`, length `18 ft`, count `3`), [CWC11], [CWC12], [CWC14], [CWC15], [CWC17] (`https://example.test/concrete-calculator?v=1&ws=15`). Verify: fails (accessors missing).
- [x] 5.2 [RED] `apps/web/src/calculator/controller.test.ts` (new, fixtures): `controllerOf` of the two-line fixture module whose declared materials differ from the engine's default run throws `PageModuleError` `SHOPPING_LINES` at creation [CWC3]; a fixture whose engine drifts on a later run throws on that run (M-4); a `choice` or `step` event the module does not support returns the state unchanged with no write; a fixture with no `primary` uses the `role: 'primary'` output and hides its row; a stepper event whose clamped value equals the current one returns the state unchanged with no write; the `step` event on `waste` at `50` and at `0` (concrete) changes nothing [CP22]. Verify: fails.
- [x] 5.3 [GREEN] `apps/web/src/calculator/controller.ts`: `controllerOf<C>` overload plus erased implementation (creation runs the defaults once and calls `shoppingLinesOf`); choice events through `module.choices`, step events through `module.steppers.next`, answer through `module.answer`, shopping through `module.shopping.view`, costs through `module.costs.visible`; `PanelView { primary, figures, costs, shopping }` from `outputText` and the slots; `State<C>`, `View<C>`, `Output<C>`, `UiEvent<C>`, `Controller<C>` as the design's table; `copyAddress`, `copyOutcome`, `required`, `mustBeOk` unchanged; the old concrete-only exports and the old signatures of `concrete/present.ts` (`figuresOf` stays until S10 for the unrouted view) removed where unused. `client/concrete-mount.ts` accessors re-pointed. Verify: 5.1, 5.2 pass.
- [x] 5.4 [REFACTOR] The four commands. Library build size: `npm test -- apps/web/src/contract/client-entry` prints the concrete entry graph size; record it (target at most 38,500 B, gate 49,152 B) [CWC36 measurement]. `npm run build && npm run test:e2e` green (283 tests).
- [x] 5.5 Negative proofs: drop the `shoppingLinesOf` call at creation (CWC3 creation case fails); route a `step` event for a module with no `steppers` through the slot without the guard (unchanged-state case fails); clamp with a literal (CP22 case fails); revert.
- [x] 5.6 Exit: SX1–SX3, SX5.

### S6 — Prove rectangle-area through the generic controller

Forecast: ~280 changed lines. Specs: calculator-web-core [CWC1], [CWC6] (rectangle record), [CWC7], [CWC9], [CWC13], [CWC16], [CWC31], [CWC34]. Green because: tests plus one slot-free module; no shipped code beyond `rectangle-area/page.ts`, which nothing imports.

Planned commits: `test(calculator): prove rectangle-area through the generic controller` · `test(web): scan the generic code for DOM access and calculator ids`.

- [x] 6.1 [RED] `apps/web/src/calculator/rectangle-area/controller.test.ts` (new): started with no query the fields are `10 ft` and `10 ft`, the figures `100.00`, `11.11`, `9.29`, and `view.choices` is empty, `panel.shopping` empty, `panel.costs` empty, no stepper keys [CWC1]; `abc` in `length` is invalid with code `MALFORMED`, every figure `—`, no write requested, then `150` gives `125.00`, `13.89`, `11.61` with `width` still `10 ft` [CWC7]; `?v=1&l=150` gives `length` `12 ft 6 in`, `width` `10 ft`, area `125.00`, and after the metric toggle the write is `?v=1&u=m&l=150` [CWC13]; the metric toggle of the defaults gives `3.048 m` and `3.048 m`, the figures unchanged and the metre unit hints [CWC16]; `10'` and `12' 6"` give `125.00`, `13.89`, `11.61` [CWC31]; a spy `validate` on a fixture copy of the definition records the raw record: exactly the keys `length` and `width` [CWC6]. Every slot-absent branch of `controller.ts` is hit (the coverage run proves it). Verify: fails (module missing).
- [x] 6.2 [RED] `apps/web/src/contract/generic-code.contract.test.ts` (new): generic files are the non-test sources under `apps/web/src/calculator/` outside `calculator/<registry id>/` (ids read from `apps/web/src/lib/calculators.ts`); test files (`*.test.ts`, `*.test-d.ts`) and `__testing__` excluded; none matches `\b(document|window|navigator)\b` or imports a catalog or `@maestro-calc/i18n` [CWC9]; none contains a registry id (`concrete`, `rectangle-area`) in a string literal or a path segment, comments stripped first [CWC34]. The matcher lives inside the test, seeded: a string with each forbidden pattern is flagged, an id inside a comment is not. Verify: fails only if a seeded line is added to a generic file (see 6.5); fix any real hit in generic code first (comments naming concrete are stripped, string literals are not).
- [x] 6.3 [GREEN] `apps/web/src/calculator/rectangle-area/page.ts`: `export const rectangleAreaPage = definePage({ calculator: rectangleArea })`. Verify: 6.1 passes; coverage on `controller.ts`, `texts.ts` and the slots is 100 percent with the concrete and rectangle-area suites together [CWC9 coverage clause].
- [x] 6.4 [REFACTOR] The four commands; `apps/web/src/calculator/page-module.test-d.ts` adds `@ts-expect-error` for `view.fields.waste` of `controllerOf(rectangleAreaPage)`.
- [x] 6.5 Negative proofs: add `const w = window;` to `controller.ts` (CWC9 names the file); add `'concrete'` as a string literal to `texts.ts` (CWC34 names it); import `../concrete/shapes.ts` from a slot (CWC34 path rule names it); revert.
- [x] 6.6 Exit: SX1–SX3, SX5 (no browser run: S6 ships no used code).

### G1 group tasks

- [x] G1.1 Group tip checks: `git log main..HEAD --oneline` shows S1 to S6; `git diff --stat main -- packages/` is empty; `git diff --stat main -- .github/workflows/ci.yml 'packages/*/stryker.config.mjs'` is empty.
- [x] G1.2 Dist diff (design "Gates", M-6): `npm run build`, normalise the HTML of `<scratch>/dist-main` and `apps/web/dist` with `sd '/_astro/[A-Za-z0-9_.-]+\.(js|css)' '/_astro/ASSET.$1'`, then `diff -r -x '*.js' <scratch>/dist-main apps/web/dist` is empty (CWC23 measurement). JavaScript is guarded by the `client-entry` size print and the e2e. Record the entry size.
- [x] G1.3 `npm run verify`; `npm run build && npm run check:site && npm run test:e2e && npm run lighthouse`; record the concrete entry size and the `site-browser` wall time.
- [ ] G1.4 Exit: GX1–GX6. PR body: scope (generic controller and slots, concrete as module #1, rectangle-area headless), per-slice forecast vs actual (S1 ~80, S2 ~330, S3 ~370, S4 ~330, S5 ~380, S6 ~280; group ~1,770), scenario ids covered (CWC1–3, 5–17, 28–31, 34, CP22, CP57, CP58 part), negative-proof evidence per slice, the dist-diff result and the `git diff --stat main -- packages/` result, rollback: revert the group merge (G1 last, after any later group). **Pushing the branch, CI, the four reviewers, Judgment Day, the PR and the merge belong to the orchestrator, not to apply.**

---

## G2 — Page parts (`feat/calculator-core-g2-page-parts`)

### S7 — Rename the DOM hooks to the generic scheme

Forecast: ~130 changed lines. Specs: calculator-page [CP54] (rename part), [CP55]; site-quality [SQ31]; calculator-web-core [CWC28] (CSS side), [CWC36] (HTML size). Green because: one commit renames the hooks in markup, mount, CSS, unit tests and e2e together, so the site never has two schemes; assertions do not change.

Planned commits: `refactor(web): rename the calculator DOM hooks to the generic scheme`.

- [ ] 7.1 Create `feat/calculator-core-g2-page-parts` from the G1 tip (retarget onto `main` after G1 merges). Baseline: `npm run verify` green; `rg -c "data-shape-button|data-bag\b|data-waste-step|data-bag-lb|data-bag-yield|data-yield|calc-shape-area" apps tooling` lists the 57 references in the 11 files of the design.
- [ ] 7.2 [RED] Edit the references in tests only, assertions unchanged: `CalculatorForm.test.ts` (5), `ShoppingLine.test.ts` (3), `CalculatorBody.test.ts` (3), `styles.contract.test.ts` (3, plus the m-6 pin: the `.calc-choice-area` rule has `min-height: calc(var(--calc-rows, 1) * 6rem + (var(--calc-rows, 1) - 1) * var(--space-3))`), and `tooling/site-browser/e2e/calculator.spec.ts` (22), `a11y.spec.ts` (3), `csp.spec.ts` (1) using `data-choice="shape" data-value="<v>"`, `data-choice="bag" data-value="<v>"`, `data-step="waste" data-direction="<d>"`, `data-fill="bagLb"`, `data-fill="yield"`, `data-line-note="0"`, `.calc-choice-area` with `style="--calc-rows:4"` after `data-reserved="shape"`. Verify: the unit tests fail; the e2e fail against the old build (`npm run build && npm run test:e2e`).
- [ ] 7.3 [GREEN] `CalculatorForm.astro` (5), `ShoppingLine.astro` (3), `styles/calculator.css` (1, the m-6 expression), `client/concrete-mount.ts` (8): the hooks of the table "Today → After" except `data-line`, which arrives with the per-line markup in S10 (CP54 completes there and in S12). The area renders `<div class="calc-choice-area" data-reserved="shape" style="--calc-rows:4">` from the existing constant; S9 derives it. Verify: 7.2 passes; `npm run build && npm run test:e2e` green with 283 tests and the same assertions.
- [ ] 7.4 [REFACTOR] The four commands; `rg -n "data-shape-button|data-bag\b|data-waste-step|data-bag-lb|data-bag-yield|data-yield|calc-shape-area" apps tooling` is empty. HTML budget: `CalculatorBody.budget.test` prints the page HTML size for EN and ES; record them (baseline 39,268 and 39,517 B, forecast +~200 B, limit 40,960).
- [ ] 7.5 Negative proofs: rename one hook in the form but not in the mount (the e2e `calculator.spec.ts` shape test fails); change the CSS to the old fixed `4 * 6rem + 3 * gap` (the styles contract pin fails); revert.
- [ ] 7.6 Exit: SX1–SX3, SX5 (assertions unchanged: `git diff -U0 HEAD~1 -- tooling/site-browser/e2e | rg '^[-+].*expect'` shows only selector text).

### S8 — Rename the page builder and add the form layout

Forecast: ~150 changed lines (⚠ rename slice: similarity guard). Specs: calculator-web-core [CWC30]; K13. Green because: the rename moves only the file path; the new layout module is unused until S9.

Planned commits: `refactor(web): rename the concrete page builder and add the form layout`.

- [ ] 8.1 [GREEN, rename] `git mv apps/web/src/lib/concrete-page.ts apps/web/src/lib/page-view.ts` and `apps/web/src/lib/concrete-page.test.ts` → `apps/web/src/lib/page-view.test.ts`; fix the importers (the function name `concreteView` stays until S12). Verify: `npm test -- apps/web/src/lib`.
- [ ] 8.2 [RED] `apps/web/src/calculator/form-layout.test.ts` (new): `formOf(concretePage)` is `[ choice shape with area { fields: the twelve driven keys in definition order, rows 4 }, field waste with stepper true, choice bag with no area, field bagPrice stepper false, field readyMixPrice stepper false ]`; `formOf(rectangleAreaPage)` is `[ field length, field width ]` with no choice item [CWC30]; driven fields that do not directly follow their select throw `PageModuleError` `FORM_ORDER`; a boolean input throws `FORM_ORDER`. Verify: fails.
- [ ] 8.3 [GREEN] `apps/web/src/calculator/form-layout.ts` (`FormItem`, `formOf(m: AnyPageModule)`; server-only, imported by `lib/page-view.ts` alone from S9). Verify: 8.2 passes.
- [ ] 8.4 [RED→GREEN] Coverage entry: `apps/web/src/contract/coverage.contract.test.ts` first (expects `lib/page-view.ts` at 100 in `vitest.config.ts`), then the entry in the root `vitest.config.ts` (m-3). Verify: `npm run test:coverage`; any uncovered branch of the renamed builder gets a test in `lib/page-view.test.ts` now (recorded against the forecast).
- [ ] 8.5 [GREEN] K13: `AGENTS.md` step 11 sentence names the builder `apps/web/src/lib/page-view.ts` where it named `apps/web/src/lib/<id>-page.ts`; the matching row of `docs.contract.test.ts` changes in the same commit. Verify: `npm test -- apps/web/src/contract/docs`.
- [ ] 8.6 [REFACTOR] The four commands; `rg -n "concrete-page" apps tooling AGENTS.md` is empty (outside the archive).
- [ ] 8.7 Similarity check: `git diff --stat -M HEAD~1` shows `lib/concrete-page.ts => lib/page-view.ts` and the test rename with `=>`; the rename counts only its edited lines. If git shows delete plus add, move the coverage tests of 8.4 into S9 and record it.
- [ ] 8.8 Negative proofs: move a driven field after `waste` in a fixture (FORM_ORDER fails); lower the coverage entry to 99 (`coverage.contract` fails); revert. `npm run build && npm run test:e2e` green.
- [ ] 8.9 Exit: SX1–SX3, SX5.

### S9 — Render the form from a generic form view

Forecast: ~330 changed lines. Specs: calculator-web-core [CWC5] (builder side), [CWC24] (form part), [CWC28]; calculator-page [CP11], [CP12], [CP14], [CP51] (regression), [CP58]. Green because: `concreteView` still produces the whole view, with its form part now built generically; the HTML does not change.

Planned commits: `test(web): pin the generic form view` · `refactor(web): render the calculator form from a generic form view`.

- [ ] 9.1 [RED] `apps/web/src/lib/page-view.test.ts` (extend): the form for concrete has the unit toggle first, then the items of `formOf`, then the copy button; every input has the label `calc.concrete.inputs.<key>`; count inputs have `inputmode` `numeric`, the other inputs `decimal` (derived from the input kind); the price placeholder is `0.00` [CWC5]; the default texts are `12 ft`, `10 ft`, `4 in`, `16 in`, `8 in`, `12 in`, `8 ft`, `4 ft`, `7 in`, `11 in`, `3`, `1`, `10`, `''`, `''` [CP12]; the choice group `shape` has four choices and an `area` with `rows` 4 taken from `choiceSlot` (not a constant) [CWC28, CP58]; the `waste` item has a stepper whose labels are `calc.concrete.page.wasteLess` and `wasteMore`; a missing stepper key throws `PAGE_KEY` naming the key; the hint of each length field is `site.calculator.hintFt` or `hintIn` for the ten fields [CP51]. For rectangle-area the form holds two fields and no choice item [CWC24 part]. Verify: fails.
- [ ] 9.2 [RED] `apps/web/src/components/calculator/CalculatorForm.test.ts` (edit): renders from `FormView` (not from `ConcreteForm`); fields per shape in the order of the CP11 table with the other shapes `hidden`; the area has `data-reserved="shape"` and `style="--calc-rows:4"` from `area.rows`; a fixture `FormView` whose area has `rows` 5 renders `--calc-rows:5` [CWC29 render]; the existing assertions otherwise unchanged. Verify: fails.
- [ ] 9.3 [GREEN] `apps/web/src/lib/page-view.ts` form part (`FormView`, `ChoiceGroupView`, `FieldItemView`, `AreaField`, input modes, placeholder, unit-hint messages), `apps/web/src/components/calculator/model.ts` form types (`ShapeField` becomes `AreaField`), `CalculatorForm.astro` walks `form.items` in order. Verify: 9.1, 9.2 and the unchanged `CalculatorBody.test.ts` pass.
- [ ] 9.4 [REFACTOR] The four commands; coverage 100 percent on `lib/page-view.ts` (fixtures cover the absent branches).
- [ ] 9.5 Negative proofs: hard-code `rows` 4 in the area (the `rows` 5 render case fails); give a count input `decimal` (the input-mode case fails); revert. `npm run build && npm run test:e2e` green.
- [ ] 9.6 Exit: SX1–SX3, SX5.

### S10 — Render the result panel from a generic result view

Forecast: ~320 changed lines. Specs: calculator-web-core [CWC3] (render), [CWC24] (rows), [CWC27] (part); calculator-page [CP54] (line hooks), [CP56] (part), [CP15], [CP1], [CP2] (regression). Green because: the markup per line equals today's plus `data-line`; `figuresOf` is removed only after the panel no longer uses it.

Planned commits: `test(web): pin the generic result view` · `refactor(web): render the result panel from a generic result view`.

- [ ] 10.1 [RED] `apps/web/src/lib/page-view.test.ts` (extend): `result.rows` are the outputs with a display hint in declaration order with the primary hidden (concrete `volumeFt3`, `volumeM3`, `netVolume` plus the primary `volumeYd3`; rectangle-area its three area rows) [CWC24 rows]; the primary template name is `volume.yd3` (`<measure>.<display.unit>`) with the key `calc.concrete.page.volumeYd3`; rectangle-area has no such key and shows the bare value (K6); `shopping` is one line for concrete with `unit` `bag-80`, label split on `{bagLb}` named `bagLb`, note split on `{yield}` named `yield`; rectangle-area `shopping` is empty; `costs` has `bagCost` and `readyMixCost` rows with `hint` and `note` from the cost slot; no `costsNote` for a module without `note`. `apps/web/src/components/calculator/ShoppingLine.test.ts` and `ResultPanel.test.ts` (edit): one `ShoppingLine` carries `data-line="0"`, `data-shopping="bag-80"`, `data-fill="bagLb"` in the label and `data-line-note="0"` with `data-fill="yield"` [CP54 hooks]; two lines (fixture) render as `data-line="0"` and `"1"` with no wrapper element, in the declared order [CWC3 render]; `data-output` elements are one per output key in the CP4 order. Verify: fails.
- [ ] 10.2 [GREEN] `apps/web/src/lib/page-view.ts` result part (`ResultView`, `ShoppingLineView`, `FillSplit`, `costsNote?`), `ResultPanel.astro` maps `shopping`, `ShoppingLine.astro` renders one line with `data-line`, `data-fill`, `data-line-note`, `model.ts` result types; `figuresOf` and its tests removed from `concrete/present.ts` and `concrete/present.test.ts` (the block was replaced by `outputText` coverage in S4). Verify: 10.1 and the unchanged `CalculatorBody.test.ts` pass.
- [ ] 10.3 [REFACTOR] The four commands; `rg -n "figuresOf" apps/web/src` is empty; coverage 100 percent.
- [ ] 10.4 Negative proofs: render the shopping lines by index instead of the declared order (CWC3 fixture fails); drop `data-line` (CP54 hook case fails); revert. `npm run build && npm run test:e2e` green.
- [ ] 10.5 Exit: SX1–SX3, SX5.

### S11 — Write the page messages from the generic view

Forecast: ~220 changed lines. Specs: calculator-web-core [CWC25] (builder side), [CWC23] (messages part); calculator-page [CP43] (regression); design m-2 and R7 rules. Green because: the messages list reproduces today's template order and entries.

Planned commits: `test(web): pin the generic page messages` · `refactor(web): write the page messages from the generic view`.

- [ ] 11.1 [RED] `apps/web/src/lib/page-view.test.ts` (extend): `view.messages` holds, in order, the twelve `errors.*`, the answer templates of `AnswerSlot.templates`, the notices, the copy states, the unit-hint messages and the primary templates `volume.yd3`, `volume.m3` (the exact order of the current `<template>`); the unit-hint rule: concrete gives `ft`, `in`, `m`, `cm` (distinct `defaultUnit` in input order, then distinct `metricDefaultUnit`), each read from `site.calculator.hint<Unit>`; a fixture with a `yd` length input throws `PAGE_KEY` naming `yd` (and `mm` likewise) [m-2]; the no-JS note with `calc.concrete.page.example` is `<noscript text> <example>` joined by one space, a catalog without the key gives the bare note with no trailing space [R7]; `answer` is set only for a module with an answer slot. `CalculatorBody.test.ts` (edit): `[data-answer]` is rendered only when `answer` is set; rectangle-area (fixture view) has no answer element; the `<template>` message entries are unchanged for concrete [CP43]. Verify: fails.
- [ ] 11.2 [GREEN] `apps/web/src/lib/page-view.ts` (messages list, hint rule, example rule), `CalculatorBody.astro` renders `view.messages` in order and the answer region conditionally. Verify: 11.1 and the existing `CalculatorBody.test.ts` / `CalculatorBody.budget.test.ts` pass; the budget print is recorded.
- [ ] 11.3 [REFACTOR] The four commands; coverage 100 percent; the catalog text stays out of the client (`calculator/**` imports no catalog, `generic-code.contract` green).
- [ ] 11.4 Negative proofs: swap two messages (the order assertion fails); drop the `yd` check (the fixture does not throw); leave a trailing space on the bare note (R7 case fails); revert. `npm run build && npm run test:e2e` green.
- [ ] 11.5 Exit: SX1–SX3, SX5.

### S12 — Choose the page module by id

Forecast: ~270 changed lines. Specs: calculator-web-core [CWC23], [CWC24], [CWC26], [CWC27], [CWC34] (components and builder join the scan); calculator-page [CP54] (full), [CP56]. Green because: one table replaces the fixed concrete call; the rendered HTML is the same for concrete.

Planned commits: `test(web): pin the per-id page table and the slot-free render` · `feat(web): choose the page module by id in CalculatorView`.

- [ ] 12.1 [RED] `apps/web/src/lib/pages.test-d.ts` (new): `keyof typeof PAGES` equals `CalculatorPageId`; a table with a missing row (`@ts-expect-error`) fails with the id named [CWC26]. `apps/web/src/lib/pages.test.ts` (new): `pageView('concrete', 'en')` has `id` `'concrete'`; `SCRIPTS` ids (read from `CalculatorView.astro`) equal `CALCULATOR_PAGES`; `CalculatorView.astro` holds neither `concreteView` nor a fixed calculator id [CWC27]; the concrete default render equals the CP1 and CP2 table in visible text for EN and ES [CWC23]. Verify: fails.
- [ ] 12.2 [RED] `apps/web/src/components/calculator/CalculatorBody.test.ts` (edit): the full CP54 list on `pageView('concrete', 'en')`: four `data-choice="shape"` buttons (values `slab`, `footing`, `column`, `steps`), three `data-choice="bag"`, two `data-step="waste"` (one `less`, one `more`), one each of `data-copy`, `data-copy-status`, `data-primary`, one `data-shopping="bag-80"`, six `data-output` in the CP4 order, `data-line="0"` with `data-fill="bagLb"`, `data-line-note="0"` with `data-fill="yield"`, `data-reserved="shape"` with `style="--calc-rows:4"`, and none of `data-shape-button`, `data-bag`, `data-waste-step`, `data-bag-lb`, `data-bag-yield`, `data-yield` [CP54]. A rectangle-area test builds `pageViewOf(rectangleAreaPage, 'en', enRectangleArea)` and renders it through the real `CalculatorBody` with the Astro container (`__testing__/render-component.ts`): two length fields (`#calc-length`, `#calc-width`), the three `data-output` values `100.00`, `11.11`, `9.29`, no choice group, stepper, shopping line or cost row, and no `data-choice`, `data-step`, `data-shopping` element [CWC24, CP56]. `generic-code.contract.test.ts` (extend): the scan adds `components/calculator/*.astro` and `lib/page-view.ts` (the `.astro` comments are stripped) [CWC34]. Verify: fails.
- [ ] 12.3 [GREEN] `apps/web/src/lib/pages.ts`: `PageEntry`, `PAGES satisfies Record<CalculatorPageId, PageEntry>`, `pageView(id, locale)`; `pageViewOf` completes (`concreteView` is renamed `pageViewOf` with its signature `(module, locale, catalog)`); `apps/web/src/views/CalculatorView.astro` calls `pageView(id, locale)` and a `SCRIPTS: Record<CalculatorPageId, …>` table; the `concreteView(` callers (about 8 files) are re-pointed. Verify: 12.1, 12.2 pass.
- [ ] 12.4 [GREEN] K13: `AGENTS.md` step 14 sentence drops "`CalculatorView.astro` calls `concreteView` for every page id" and names the `PAGES` and `SCRIPTS` tables; the matching `docs.contract.test.ts` row is edited in the same commit. Verify: `npm test -- apps/web/src/contract/docs`.
- [ ] 12.5 [REFACTOR] The four commands; `rg -n "concreteView" apps tooling AGENTS.md` is empty (outside the archive); coverage 100 percent on `lib/page-view.ts` and `calculator/**`.
- [ ] 12.6 Negative proofs: delete the `SCRIPTS` row (`npm run typecheck` fails, CWC26); render `concrete` for every id again (the `data-calculator` assertion of the rectangle-area render fails); revert. `npm run build && npm run test:e2e` green.
- [ ] 12.7 Exit: SX1–SX3, SX5.

### S13 — Rename the concrete mount to the generic mount

Forecast: ~30 changed lines (⚠ rename slice: similarity guard). Specs: K13. Green because: only the file path and its importers change.

Planned commits: `refactor(client): rename the concrete mount to the generic mount`.

- [ ] 13.1 [GREEN, rename] `git mv apps/web/src/client/concrete-mount.ts apps/web/src/client/mount.ts`; fix `client/entries/concrete.ts`, the coverage exclusion in `apps/web/src/contract/coverage.contract.test.ts` and `vitest.config.ts`, and any contract that names the old path (`rg -n "concrete-mount" apps tooling AGENTS.md`). Verify: `npm test -- apps/web/src/contract`.
- [ ] 13.2 [GREEN] K13: `AGENTS.md` step 12 names `apps/web/src/client/mount.ts`; the `docs.contract.test.ts` row changes in the same commit.
- [ ] 13.3 [REFACTOR] The four commands; `rg -n "concrete-mount" apps tooling AGENTS.md` is empty (outside the archive).
- [ ] 13.4 Similarity check: `git diff --stat -M HEAD~1` shows `client/concrete-mount.ts => client/mount.ts` with `=>`; shortstat about 30. `npm run build && npm run test:e2e` green.
- [ ] 13.5 Exit: SX1–SX3, SX5.

### S14 — Mount every calculator page through the generic mount

Forecast: ~300 changed lines. Specs: calculator-web-core [CWC18]–[CWC22] (generic mount, proved by the existing e2e), [CWC25], [CWC34] (mount joins the scan), [CWC36]; calculator-page [CP42], [CP43], [CP47], [CP48], [CP55] (regression). Green because: the browser behaviour of concrete is unchanged; the e2e suite is the net.

Planned commits: `test(client): pin the entry as a mount of the page module` · `refactor(client): mount every calculator page through the generic mount`.

- [ ] 14.1 [RED] `apps/web/src/contract/entry-graph.contract.test.ts` and `client-hygiene.contract.test.ts` (edit): the entry `client/entries/concrete.ts` imports exactly `client/mount.ts` and `calculator/concrete/page.ts` (no `lib/` file, no catalog) [CP48]; its graph reaches `calculator/slots/*` and `calculator/concrete/*` through the page module; the hygiene list of scanned entries is derived from `CALCULATOR_PAGES` (no hand list) and finds none of `innerHTML`, `insertAdjacentHTML`, `document.write`, `eval`, `new Function`, `localStorage`, `sessionStorage`, `fetch(`, `XMLHttpRequest`, `sendBeacon`; `client-entry.contract.test.ts`: the library build of the real entry is at most 49,152 B, holds no catalog message and no URL other than `https://maestrocalc.com`, and the builder `lib/page-view.ts` is not in the graph [CWC25, CP42, CP47]. `generic-code.contract.test.ts`: the scan adds `client/mount.ts`. Verify: the entry-shape assertion fails until the entry is rewritten.
- [ ] 14.2 [GREEN] `apps/web/src/client/mount.ts` generalised in place (no `dom.ts` split): `mount(module: AnyPageModule)` builds `controllerOf(module)`; ids through `calculator/ids.ts`; data-driven loops over `[data-choice]`, `[data-step]`, `[data-line]`, `[data-cost-row]` use `findAll` and run zero times over an absent slot (K12); throwing lookups (`find`, `findAs`) only for page-level hooks every module has; `Environment.helps` from the `#calc-<key>-help` elements; no `concrete` name. `apps/web/src/client/entries/concrete.ts` becomes `mount(concretePage)`. Verify: 14.1 passes; `npm run build`.
- [ ] 14.3 [REFACTOR] The four commands. Real-build sizes: `npm run build && npm run check:site` prints the largest page per category; record the concrete entry graph (target at most 38,500 B, gate 49,152 B), HTML and page weight [CWC36 measurement].
- [ ] 14.4 Browser run: `npm run build && npm run test:e2e` green with 283 tests and the same assertions [CWC18–22 proved by the existing `calculator.spec.ts`: ids and `aria-describedby`, Enter, `replaceState` count, clipboard fallback, controls enabled; CP55 by the shape and step press test].
- [ ] 14.5 Negative proofs: add `fetch(` to `mount.ts` (hygiene fails); import `lib/page-view.ts` from the entry (CWC25 and CP48 fail); put a slot selector inside a throwing lookup (the S17 lookup check will catch it; for now `rg` the selector in `find(`/`findAs(` and record the clean result); revert.
- [ ] 14.6 Exit: SX1–SX3, SX5.

### G2 group tasks

- [ ] G2.1 Create the group tip checks: `git log main..HEAD --oneline` shows S7 to S14; `git diff --stat main -- packages/` is empty and the CI/stryker/contract paths of the group rules are unchanged.
- [ ] G2.2 `npm run verify`; `npm run build && npm run check:site && npm run test:e2e && npm run lighthouse`; record entry size, HTML sizes (EN, ES) against the S7 forecast of +~200 B, page weight, and the `site-browser` wall time.
- [ ] G2.3 `git diff --stat main -- packages/` is empty at the tip (G2 diff against `main` once G1 has merged, else against the G1 tip).
- [ ] G2.4 Dist diff with the mapping (design "Gates" step 5): copy `<scratch>/dist-main` to `<scratch>/dist-main-mapped`; on the calculator pages of that copy only, apply in this order with `sd`: `'data-shape-button="([a-z]+)"'` → `'data-choice="shape" data-value="$1"'`; `'data-bag="([0-9]+)"'` → `'data-choice="bag" data-value="$1"'`; `'data-waste-step="([a-z]+)"'` → `'data-step="waste" data-direction="$1"'`; `'data-bag-yield'` → `'data-line-note="0"'`; `'data-bag-lb'` → `'data-fill="bagLb"'`; `'data-yield'` → `'data-fill="yield"'`; `'class="calc-shape-area" data-reserved="shape"'` → `'class="calc-choice-area" data-reserved="shape" style="--calc-rows:4"'`; `'<p class="calc-shopping">'` → `'<p class="calc-shopping" data-line="0">'`; and in the inline `<style>` replace `\.calc-shape-area\{[^}]*\}` with the `\.calc-choice-area\{[^}]*\}` rule read from the G2 build, asserting that rule's `min-height` is the m-6 expression. Each mapping must match at least once per calculator page (a zero count fails the gate). Normalise `/_astro/` names in both trees (`sd '/_astro/[A-Za-z0-9_.-]+\.(js|css)' '/_astro/ASSET.$1'`), then `diff -r -x '*.js' <scratch>/dist-main-mapped apps/web/dist` is empty [CWC23 measurement]. Record the per-mapping match counts.
- [ ] G2.5 Exit: GX1–GX6. PR body: scope (hook rename, page-view builder, generic form, result, messages, per-id tables, generic mount), per-slice forecast vs actual (S7 ~130, S8 ~150, S9 ~330, S10 ~320, S11 ~220, S12 ~270, S13 ~30, S14 ~300; group ~1,750), scenario ids covered (CWC3, 5, 18–27, 30, 34, 36, CP54–56, CP58, SQ31 part), negative-proof evidence, the dist-diff mapping counts, the packages-empty result, rollback: revert the group merge after reverting G3. **Pushing, CI, review, the PR and the merge belong to the orchestrator.**

---

## G3 — Browser record, entry contracts, docs (`feat/calculator-core-g3-browser-record-docs`)

### S15 — Drive the calculator suite from a typed per-id record

Forecast: ~350 changed lines (⚠ split S15a = the record type and concrete's record, S15b = the suite rewrite). Specs: site-quality [SQ29], [SQ30], [SQ31]; calculator-web-core [CWC34] (suites join the scan). Green because: concrete's record carries today's strings, states and shape fields unchanged, so the 283 tests keep their assertions.

Planned commits: `test(site-browser): add the typed per-id record with the concrete spec` · `test(site-browser): drive the calculator suite from the record`.

- [ ] 15.1 Create `feat/calculator-core-g3-browser-record-docs` from the G2 tip (retarget onto `main` after G2 merges). Baseline: `npm run verify` green; `npm run test:e2e` count recorded (283).
- [ ] 15.2 [RED] `tooling/site-browser/e2e/calculator-pages.test-d.ts` (new, checked by `npm run typecheck --prefix tooling/site-browser`): `const missing = {} as const satisfies Record<CalculatorPageId, E2eSpec>` under `// @ts-expect-error` (a missing row is a type error naming the id) [SQ29]; a minimal spec fixture with only `locales`, `ready`, `inputs`, `numeric`, `figures`, `defaults`, `typed`, `states`, `metric`, `tabOrder`, `bounds`, `layoutQueries` and no `choices`, `steppers`, `shopping`, `prices` compiles [SQ30 type side]. Verify: fails (types missing).
- [ ] 15.3 [RED] `apps/web/src/contract/browser-record.contract.test.ts` (new): `calculator-pages.ts` declares `E2E` with `satisfies Record<CalculatorPageId, E2eSpec>`, imports `CalculatorPageId` as a type only and has no runtime import from `@maestro-calc/*` (the browser job has no root install, m-11); `calculatorPages` derives its paths from `ROUTES` for both locales; no generic suite (`calculator.spec.ts`, `a11y.spec.ts`, `layout.spec.ts`, `csp.spec.ts`) contains `concrete`, `/concrete-calculator`, `calculadora-de-concreto`, `data-choice="shape"` or `shape` as a literal outside the concrete record file (seeded: a line with each is flagged) [SQ30, CWC34]. Verify: fails.
- [ ] 15.4 [GREEN] `tooling/site-browser/e2e/calculator-pages.ts` (`E2eLocale`, `E2eSpec`, `E2E`, `E2ePage`, `calculatorPages` as the design's block), `tooling/site-browser/e2e/concrete-pages.ts` (the `CONCRETE` spec with today's strings, `STATES` and `SHAPE_FIELDS` unchanged; `CONCRETE_PAGES` removed). Verify: 15.2 passes; `npm run typecheck --prefix tooling/site-browser`.
- [ ] 15.5 [GREEN] `tooling/site-browser/e2e/calculator.spec.ts` rewritten as the generic suite: per page enable, abort, labels, touch, Enter, copy and fallback, hint, requests, language switch, notices, invalid field, default query; `choices`, `steppers`, `shopping`, `prices` only when the record declares them; assertions unchanged. Verify: `npm run build && npm run test:e2e` runs the same 283 tests with the same assertions [SQ31]; 15.3 passes for this file.
- [ ] 15.6 [REFACTOR] `npm run format`, `npm run sync && npm run lint`, `npm run typecheck` and `npm run typecheck --prefix tooling/site-browser`, `npm run test:coverage`. K13: `AGENTS.md` sentence on `CONCRETE_PAGES` is rewritten to name `e2e/concrete-pages.ts` as concrete's `E2eSpec` and `e2e/calculator-pages.ts` as the table, with its `docs.contract.test.ts` row, in the same commit.
- [ ] 15.7 Negative proofs: delete concrete's `E2E` row (`npm run typecheck --prefix tooling/site-browser` fails naming `concrete`, SQ29); write `/concrete-calculator` in `calculator.spec.ts` (the contract names the file, SQ30); revert.
- [ ] 15.8 Exit: SX1–SX3, SX5; record `npm run test:e2e` test count (283) and that the diff of assertions is selector-free (SQ31, recorded measurement).

### S16 — Run the axe, layout and CSP suites for every calculator

Forecast: ~160 changed lines. Specs: site-quality [SQ31], [SQ32]; kept [SQ17], [SQ19]; calculator-web-core [CWC34]. Green because: the three suites read the record; the executed tests are the same for concrete.

Planned commits: `test(site-browser): run the axe, layout and CSP suites for every calculator`.

- [ ] 16.1 [RED] `apps/web/src/contract/browser-record.contract.test.ts` (extend): `a11y.spec.ts`, `layout.spec.ts` and `csp.spec.ts` import `calculatorPages` and contain no path literal; `csp.spec.ts` loops `calculatorPages` (typing, a choice press when the record declares `choices`, copying the link, switching language) [SQ32]; `layout.spec.ts` reads `layoutQueries` of the record (`?v=1&sh=footing&l=216&n=3` for concrete) [SQ19]; `a11y.spec.ts` runs the default state, one state per option of each declared choice group (shape: footing, column, steps), an invalid field, the metric unit system and, when `prices` is declared, a non-zero price [SQ17]. Verify: fails (suites still hold literals).
- [ ] 16.2 [GREEN] Rewrite `a11y.spec.ts`, `layout.spec.ts`, `csp.spec.ts` over the record. `generic-code.contract` scan list adds the suites (the browser-record test already covers it by file). Verify: 16.1 passes; `npm run build && npm run test:e2e` green with the same 283 tests (record the count and that no test title changed).
- [ ] 16.3 [REFACTOR] The four commands plus `npm run typecheck --prefix tooling/site-browser`.
- [ ] 16.4 Negative proofs: remove the `association` of an error message in a built copy and see the axe state fail naming page, state and rule (SQ20 regression); hardcode a path in `csp.spec.ts` (the contract fails); revert.
- [ ] 16.5 Exit: SX1–SX3, SX5.

### S17 — Entry contracts per id and the slot-free proof

Forecast: ~250 changed lines. Specs: calculator-web-core [CWC4], [CWC32], [CWC33], [CWC36], [CWC37]; kept [CP48]. Green because: the contracts derive from `CALCULATOR_PAGES`; the proof entry is a test-only module under `contract/`.

Planned commits: `test(web): run the entry contracts per page` · `test(web): prove the slot-free markup and the proof entry`.

- [ ] 17.1 [RED] `apps/web/src/contract/client-graph.contract.test.ts` and `__testing__/client-graph.ts` (edit): `graphViolations(modules, ownId)` forbids `lib/calculators.ts`, the root entry of `@maestro-calc/data`, another calculator's core directory and, from the design, `/apps/web/src/calculator/(?!<ownId>\/|slots\/)[^/]+\//` (another calculator's web folder); seeded virtual graphs: a graph for `concrete` reaching `calculator/rectangle-area/page.ts` is flagged, one for `rectangle-area` reaching `calculator/concrete/page.ts` is flagged, `calculator/slots/*.ts` is allowed [CWC37, CP48]. `entry-graph`, `client-entry`, `client-hygiene` and `templates.contract.test.ts` iterate `CALCULATOR_PAGES` (the entry path from the id) with pins derived from `ROUTES` and the registry; a seeded `['concrete', 'rectangle-area']` id list shows a new entry is covered with no test edit [CWC37]. Verify: fails.
- [ ] 17.2 [RED] `apps/web/src/contract/rectangle-area-proof.contract.test.ts` (new) and `apps/web/src/contract/__testing__/rectangle-area-entry.ts` (test-only, `mount(rectangleAreaPage)`): the entry walked through `buildClient` (module ids before tree shaking): no file under `apps/web/src/calculator/slots/` and none under `apps/web/src/calculator/concrete/` is reached, and its minified size is smaller than concrete's entry and at most 49,152 B (forecast about 29,500–31,000 B, printed and recorded) [CWC4, CWC36]. Markup: `pageViewOf(rectangleAreaPage, 'en', enRectangleArea)` through the real `CalculatorBody` with the Astro container has none of `data-choice`, `data-step`, `data-shopping`, `data-line`, `data-fill`, `data-line-note`, `data-cost-row`, `data-hint-row`, `data-price-hint`, and has `#calc-length`, `#calc-width`, two `data-unit` buttons, `data-copy`, `data-copy-status`, `data-primary` and three `data-output` values `100.00`, `11.11`, `9.29` [CWC33]. Lookups: the test reads `client/mount.ts` and extracts the string-literal selector of every throwing lookup (`find(`, `findAs(`); each matches the rectangle-area markup except the layout list (`header a[hreflang]`); per-key lookups through `ids.ts` resolve for each text key of the module; a slot selector inside a throwing lookup fails (seeded) [CWC33]. Exclusion: `ROUTES`, the sitemap rows and the catalogs hold no `rectangle-area` path or `page.rectangle-area.*` key, and no `islands/RectangleAreaScript.astro` or `entries/rectangle-area.ts` exists [CWC32]. Verify: fails (entry missing).
- [ ] 17.3 [GREEN] The generalised contracts and helpers; `contract/__testing__/rectangle-area-entry.ts`. Verify: 17.1, 17.2 pass.
- [ ] 17.4 [REFACTOR] The four commands. Recorded measurement [CWC32]: `npm run build && npm run check:site` unchanged, and `rg -l "rectangle-area" apps/web/dist` is empty. Record the proof entry size.
- [ ] 17.5 Negative proofs: import a slot file from the rectangle-area page (CWC4 names it); put `find('[data-choice]')` in `mount.ts` (CWC33 lookup check names it); add a `rectangle-area` row to `ROUTES` (CWC32 fails); revert.
- [ ] 17.6 Exit: SX1–SX3, SX5 (no browser run: S17 changes no shipped code or suite).

### S18 — Rewrite the adding-a-calculator recipe

Forecast: ~140 changed lines. Specs: calculator-web-core [CWC35]. Green because: docs plus a contract test that resolves every path the recipe names.

Planned commits: `docs(agents): rewrite the adding-a-calculator recipe for the generic core`.

- [ ] 18.1 [RED] `apps/web/src/contract/docs.contract.test.ts` (edit): the rows `concreteView` and `e2e/concrete-pages.ts` (as left by S12 and S15) are replaced by rows for `apps/web/src/calculator/<id>/page.ts`, `apps/web/src/lib/pages.ts`, `apps/web/src/client/mount.ts`, `tooling/site-browser/e2e/<id>-pages.ts`, `tooling/site-browser/e2e/calculator-pages.ts` (`pathsIn` fills `<id>` with `concrete`, so each resolves to an existing file: `calculator/concrete/page.ts`, `calculator/concrete/controller.test.ts`, `e2e/concrete-pages.ts`); the recipe contains neither "generalise" nor `concreteView`, contains the words "language-free" (the page-module step) and "E2eSpec" (the browser-record step) [CWC35]. Verify: fails against the old recipe.
- [ ] 18.2 [GREEN] `AGENTS.md` "Adding a calculator": steps 2–10 keep their text; step 1 gains "Declare a select's driven fields directly after the select (`formOf` throws otherwise)."; steps 11, 12 and 14 and the "Kept by hand" list are replaced with the design's text:
  - 11. The page: `apps/web/src/content/calculators/{en,es}/<id>.md` (frontmatter with the sources, the review date and the worked example, then the five sections in order; run `npm run build` to see the strict schema reject a bad entry), and the page module `apps/web/src/calculator/<id>/page.ts`: `definePage({ calculator, ...slots })`, language-free (no catalog, no DOM), with any helper it needs in the same folder. Declare only the slots the page needs, each from `apps/web/src/calculator/slots/`: `choiceSlot` (the fields each option of a select shows; the reserved height follows), `stepperSlot` (the step; the descriptor must declare `min` and `max`), `shoppingSlot` (one line per material the engine returns, matched by `materialId`), `costSlot`, `answerSlot`, and `primary` per unit system (default: the `role: 'primary'` output). A slot you do not declare is not in the page's bundle. Page copy uses the `calc.<id>.page.*` keys of the convention in `apps/web/src/lib/page-view.ts`. Add the row to `PAGES` in `apps/web/src/lib/pages.ts` (module and catalogs). Test the module through `controllerOf` with the hand-verified cases, as `apps/web/src/calculator/<id>/controller.test.ts` does for concrete.
  - 12. The script: `apps/web/src/client/entries/<id>.ts` calls `mount` from `apps/web/src/client/mount.ts` with the page module (never `lib/calculators.ts` or the data root), and the island `apps/web/src/islands/<Id>Script.astro` holds one processed `<script>`. The entry contracts walk and weigh every entry of `CALCULATOR_PAGES` (49,152 B for the entry and its static graph) without a test edit.
  - 14. Go live, all in one merge (a partial go-live is never merged): the `ROUTES` row in `apps/web/src/routing/routes.ts` with `page.<id>.title` and `page.<id>.description` in `packages/i18n/src/catalogs/{en,es}/site.ts`, the id moved from `PAGELESS` to `CALCULATOR_PAGES` in `apps/web/src/routing/templates.ts`, the `SCRIPTS` row in `apps/web/src/views/CalculatorView.astro`, the home link in `apps/web/src/views/HomeView.astro` with its `page.home.links.<id>` key, and the browser record: `tooling/site-browser/e2e/<id>-pages.ts` exports the `E2eSpec` (the default answer per locale, the hand-verified states, and the groups the page has) and its row goes in `E2E` of `tooling/site-browser/e2e/calculator-pages.ts`; the generic suites pick it up. Then update the pinned counts in `apps/web/src/contract/end-state.contract.test.ts`. The Lighthouse representative in `tooling/site-browser/e2e/representative.ts` stays the one calculator page it names unless you change it on purpose.
  - Kept by hand: the tables `PAGES` (`apps/web/src/lib/pages.ts`), `SCRIPTS` (`apps/web/src/views/CalculatorView.astro`) and `E2E` (`tooling/site-browser/e2e/calculator-pages.ts`), each a `Record<CalculatorPageId, …>`, so a missing row is a type error; plus the existing items (the `EnglishKeys` and page-key unions, the `./testing/<id>-yields` subpath and its list, `RELEASED` and `REGISTRY`, the mutation `deps`, `apps/web/src/lib/calculators.ts`).
  Verify: 18.1 passes.
- [ ] 18.3 [REFACTOR] `npm run format`, `npm run sync && npm run lint`, `npm run typecheck`, `npm test -- apps/web/src/contract/docs`; `rg -n "generalise|concreteView|concrete-mount|concrete-page|concrete-layout" AGENTS.md` is empty.
- [ ] 18.4 Negative proofs: write a path that does not exist in the recipe (`docs.contract` names it); put back the word "generalise" (CWC35 fails); revert.
- [ ] 18.5 Exit: SX1–SX3, SX5 (docs only: no browser run).

### G3 group tasks

- [ ] G3.1 Group tip checks: `git log main..HEAD --oneline` shows S15 to S18; `git diff --stat main -- packages/` is empty; the CI/stryker/contract paths of the group rules are unchanged.
- [ ] G3.2 `npm run verify`; `npm run build && npm run check:site && npm run test:e2e && npm run lighthouse`; record entry sizes (concrete and the proof entry), page weight and the `site-browser` wall time.
- [ ] G3.3 Dist diff at the G3 tip: normalise `/_astro/` names in the G2-tip build and the G3-tip build, then `diff -r -x '*.js' <scratch>/dist-g2 apps/web/dist` is empty (G3 changes only tests and docs). Record it.
- [ ] G3.4 Exit: GX1–GX6. PR body: scope (typed browser record, generic suites, per-id entry contracts, slot-free proof, recipe), per-slice forecast vs actual (S15 ~350, S16 ~160, S17 ~250, S18 ~140; group ~900), scenario ids covered (CWC4, 32, 33, 34, 35, 36, 37, SQ29–32, CP48), negative-proof evidence, the dist-diff and packages-empty results, rollback: revert the group merge first (newest first), then G2, then G1. **Pushing, CI, review, the PR and the merge belong to the orchestrator.**

---

## Final — Change-level checks

- [ ] F.1 After G3 merges: `main` holds `git diff --stat <pre-change main> -- packages/` empty; the site HTML differs from the pre-change build only by the mapped attributes and CSS (G2.4).
- [ ] F.2 `apply-progress.md` lists, per slice, forecast vs actual lines, the scenario ids proven, each negative proof run and reverted, the entry sizes (S5, S14, S17) and the three `site-browser` wall times.

---

## Traceability: spec scenario → slice, test file

Legend: [T] proved by a test in the named file; [E] proved by the existing Playwright suites on the built site (the 283 tests, run at S14 and each later gate); [M] proved by a recorded measurement (dist diff, size print, count), with its task.

### calculator-web-core (CWC1–CWC37)

| Scenario | Slice | Proof | Tasks |
|---|---|---|---|
| CWC1 Minimal module | S6 | [T] `calculator/rectangle-area/controller.test.ts` | 6.1 |
| CWC2 Concrete is module #1 | S2, S3 | [T] `calculator/concrete/page.test.ts` | 2.3, 3.4 |
| CWC3 Shopping is a list | S2, S3, S5, S10 | [T] `page-module.test.ts`, `slots/shopping.test.ts`, `calculator/controller.test.ts`, `ShoppingLine.test.ts` | 2.1, 3.2, 5.2, 10.1 |
| CWC4 Absent slots import nothing | S17 | [T] `contract/rectangle-area-proof.contract.test.ts` | 17.2 |
| CWC5 Texts and figures from the definition | S4, S5, S9 | [T] `texts.test.ts`, `concrete/controller.test.ts`, `lib/page-view.test.ts` | 4.1, 5.1, 9.1 |
| CWC6 Raw record shape | S4, S6 | [T] `concrete/controller.test.ts`, `rectangle-area/controller.test.ts` | 4.2, 6.1 |
| CWC7 Invalid text blocks everything | S6 | [T] `rectangle-area/controller.test.ts` | 6.1 |
| CWC8 Bounds in the field unit | S4, S5 | [T] `concrete/controller.test.ts` (unchanged assertions) | 5.1 |
| CWC9 No DOM, no window | S6 | [T] `contract/generic-code.contract.test.ts` plus coverage | 6.2, 6.3 |
| CWC10 Decode and encode | S5 | [T] `concrete/controller.test.ts` | 5.1 |
| CWC11 Defaults omitted | S5 | [T] `concrete/controller.test.ts` | 5.1 |
| CWC12 Noisy and bad links | S5 | [T] `concrete/controller.test.ts` | 5.1 |
| CWC13 Second consumer URL keys | S6 | [T] `rectangle-area/controller.test.ts` | 6.1 |
| CWC14 Metric toggle exact | S4, S5 | [T] `texts.test.ts`, `concrete/controller.test.ts` | 4.1, 5.1 |
| CWC15 Invalid bare numbers | S4, S5 | [T] `texts.test.ts` (`keptText`), `concrete/controller.test.ts` | 4.1, 5.1 |
| CWC16 Toggle with no slot | S6 | [T] `rectangle-area/controller.test.ts` | 6.1 |
| CWC17 Copy address | S5 | [T] `concrete/controller.test.ts` | 5.1 |
| CWC18 Ids and wiring | S14 | [E] `calculator.spec.ts` | 14.4 |
| CWC19 Enter | S14 | [E] `calculator.spec.ts` | 14.4 |
| CWC20 replaceState only when valid | S14 | [E] `calculator.spec.ts` | 14.4 |
| CWC21 Clipboard fallback | S14 | [E] `calculator.spec.ts` | 14.4 |
| CWC22 Controls enabled | S14 | [E] `calculator.spec.ts` | 14.4 |
| CWC23 Concrete view unchanged | S12, G1–G3 tips | [T] `lib/pages.test.ts`; [M] dist diff | 12.1, G1.2, G2.4, G3.3 |
| CWC24 Module with no slots renders | S9, S10, S12 | [T] `lib/page-view.test.ts`, `CalculatorBody.test.ts` (container render) | 9.1, 10.1, 12.2 |
| CWC25 No message text in the client | S11, S14 | [T] `client-entry.contract.test.ts`, `entry-graph.contract.test.ts` | 11.1, 14.1 |
| CWC26 Missing row fails typecheck | S12 | [T] `lib/pages.test-d.ts` | 12.1, 12.6 |
| CWC27 View follows the id | S12 | [T] `lib/pages.test.ts` (source scan plus per-id table) | 12.1 |
| CWC28 Concrete reserves four rows | S2, S9 | [T] `slots/choices.test.ts`, `CalculatorForm.test.ts` | 2.2, 9.1 |
| CWC29 A taller option grows it | S2, S9 | [T] `slots/choices.test.ts`, `CalculatorForm.test.ts` | 2.2, 9.2 |
| CWC30 No choice group | S8 | [T] `calculator/form-layout.test.ts` | 8.2 |
| CWC31 Area through the generic controller | S6 | [T] `rectangle-area/controller.test.ts` | 6.1 |
| CWC32 Unrouted proof excluded | S17 | [T] `rectangle-area-proof.contract.test.ts`; [M] `rg -l rectangle-area apps/web/dist` empty | 17.2, 17.4 |
| CWC33 Markup has no slot elements | S17 | [T] `rectangle-area-proof.contract.test.ts` | 17.2 |
| CWC34 No calculator id in generic code | S6, S12, S14, S15 | [T] `generic-code.contract.test.ts`, `browser-record.contract.test.ts` | 6.2, 12.2, 14.1, 15.3 |
| CWC35 Recipe matches the criterion | S18 | [T] `contract/docs.contract.test.ts` | 18.1 |
| CWC36 Budgets hold | S5, S14, S17 | [M] size prints; [T] `client-entry.contract.test.ts` limits | 5.4, 14.3, 17.2, G1.3, G2.2, G3.2 |
| CWC37 Per-entry contracts iterate pages | S17 | [T] `client-graph`, `entry-graph`, `client-entry`, `client-hygiene`, `templates` contracts | 17.1 |

### calculator-page (new and kept ids the design touches)

| Scenario | Slice | Proof | Tasks |
|---|---|---|---|
| CP54 Hooks on the concrete page | S7, S10, S12 | [T] `CalculatorBody.test.ts`, `CalculatorForm.test.ts`, `ShoppingLine.test.ts`; [E] `calculator.spec.ts` | 7.2, 10.1, 12.2 |
| CP55 Hooks drive behaviour | S7, S14 | [E] `calculator.spec.ts` | 7.3, 14.4 |
| CP56 Absent features have no hooks | S10, S12 | [T] `CalculatorBody.test.ts` (rectangle-area render) | 10.1, 12.2 |
| CP57 Stepper bounds follow the descriptor | S3, S5 | [T] `slots/steppers.test.ts`, `calculator/controller.test.ts` | 3.1, 5.2 |
| CP58 Reservation is derived | S2, S9 | [T] `slots/choices.test.ts`, `lib/page-view.test.ts` | 2.2, 9.1 |
| CP11, CP12, CP51 (kept: fields per shape, labels, unit hints) | S2, S9 | [T] `slots/choices.test.ts`, `lib/page-view.test.ts` | 2.2, 9.1 |
| CP13, CP14 (kept: touch targets, equal block size) | S7, S14 | [E] `layout.spec.ts`, `calculator.spec.ts` | 7.3, 14.4 |
| CP19–CP22, CP24 (kept: live recalculation) | S5, S14 | [T] `concrete/controller.test.ts`; [E] `calculator.spec.ts` | 5.1, 5.2, 14.4 |
| CP23, CP31, CP33 (kept: Enter, bounds, metric) | S4, S5, S14 | [T] `concrete/controller.test.ts`; [E] | 5.1, 14.4 |
| CP42, CP43, CP47, CP48 (kept: client script contract) | S11, S14, S17 | [T] `client-entry`, `entry-graph`, `client-graph` contracts; `CalculatorBody.test.ts` | 11.1, 14.1, 17.1 |
| CP44 (kept: load shift) | S7, S14 | [E] `layout.spec.ts`; [M] CLS at most 0.01 in Lighthouse | G1.3, G2.2 |

### site-quality

| Scenario | Slice | Proof | Tasks |
|---|---|---|---|
| SQ29 Missing record fails typecheck | S15 | [T] `e2e/calculator-pages.test-d.ts` (`npm run typecheck --prefix tooling/site-browser`) | 15.2, 15.7 |
| SQ30 Generic suites iterate the record | S15 | [T] `calculator-pages.test-d.ts` (minimal spec), `browser-record.contract.test.ts` | 15.2, 15.3 |
| SQ31 Concrete assertions unchanged | S7, S15, S16 | [M] test count 283 and a selector-only assertion diff; [E] suites | 7.6, 15.8, 16.2 |
| SQ32 CSP suite covers every calculator | S16 | [T] `browser-record.contract.test.ts`; [E] `csp.spec.ts` | 16.1, 16.2 |
| SQ17, SQ19 (kept: axe states, load shift with a query) | S16 | [E] `a11y.spec.ts`, `layout.spec.ts` | 16.1, 16.2 |
| SQ18, SQ27 (kept: no-JS project, engine size probe) | each gate | [E] no-JS project; [T] `client-size.contract.test.ts` unchanged and green | slice gates, G1.3, G2.2, G3.2 |

Counts: 37 CWC + 5 CP (54–58) + 4 SQ (29–32) = 46 new ids, all mapped; kept ids named above: CP11, 12, 13, 14, 19, 20, 21, 22, 23, 24, 31, 33, 42, 43, 44, 47, 48, 51 and SQ17, 18, 19, 27 = 22; 68 ids in all.

---

## Review Workload Forecast (final)

| Field | Value |
|-------|-------|
| Estimated changed lines | ~4,420 total: G1 ~1,770 · G2 ~1,750 · G3 ~900 |
| At-risk slices | S3 (~370, split S3b answer slot ~90), S5 (~380, split S5b `PanelView` and answer ~120), S15 (~350, split S15a record, S15b suites), renames S1, S8, S13 (similarity guard; extra edits move to the next slice) |
| Delivery strategy | auto-chain |
| Chain strategy | stacked-to-main, one PR per group, work-unit commits per slice |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: Medium
