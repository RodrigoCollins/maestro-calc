# Apply progress: calculator-core

## G1: generic controller, concrete as module #1

Branch `feat/calculator-core-g1-generic-controller` (from `main` a77cd56, planning commit 18d7299). Mode: strict TDD (`npm test`, vitest). Slices S1 to S6 done as work-unit commits; G1.4 (push, CI, the four reviewers, Judgment Day, PR) belongs to the orchestrator. Nothing was pushed.

### Commits (oldest first)

| Slice | Commit | Subject | Changed lines (`git diff --shortstat -M`) |
|---|---|---|---|
| S1 | b6c8684 | refactor(calculator): move the concrete web files into calculator/concrete | 52+ / 47- (99) |
| S2 | f66647d | feat(calculator): add the page-module contract | 340+ |
| S2 | 526837d | feat(calculator): add the choice slot and the concrete page module | 181+ |
| S3 | 00e01ce | feat(calculator): add the stepper and cost slots | 262+ / 1- |
| S3 | e530451 | feat(calculator): add the shopping slot and the concrete bag line | 234+ / 2- |
| S3 | c65b447 | feat(calculator): add the answer slot and complete the concrete page module | 173+ / 27- |
| S4 | dab1158 | feat(calculator): add the derived field texts and output figures | 367+ / 3- |
| S4 | 4c80645 | refactor(calculator): derive the field texts and figures from the definition | 139+ / 217- |
| (S5 gate) | 5953902 | test(web): measure the client bundles with the whitespace removed | 9+ |
| S5 | db7e452 | refactor(calculator): share one error helper and read texts by value ahead of the generic controller | 75+ / 68- |
| S5 | f02978e | refactor(calculator): drive the controller from the page module | 626+ / 472- |
| S6 | 7997614 | test(calculator): prove rectangle-area through the generic controller | 150+ |
| S6 | 6ea1f28 | test(web): scan the generic code for DOM access and calculator ids | 138+ |

### Forecast vs actual

| Slice | Forecast | Actual | Note |
|---|---|---|---|
| S1 | ~80 | 99 | six renames, all shown as `=>` by `git diff --stat -M` (similarity kept) |
| S2 | ~330 | 521 (340 + 181) | no named split; cut at the natural boundary (contract, then the slot and the module), each commit under 400 |
| S3 | ~370 | 669 (262 + 234 + 173) | named split S3b (answer slot) taken, plus a second cut (shopping slot); each commit under 400 |
| S4 | ~330 | 723 (367 + 356) | additions (texts, `outputText`, tests) first, then the controller switch; each under 400 |
| S5 | ~380 | 1,241 (+9 for the gate fix) | OVER: see "Deviations" 1 |
| S6 | ~280 | 288 (150 + 138) | within the cap |
| Group | ~1,770 | ~3,550 | forecasts were low for the test volume (every slot error code, both locales of fixtures) and for Prettier's expansion |

### Group tip evidence (G1.1 to G1.3)

- `git log main..HEAD --oneline`: the planning commit 18d7299 and the 13 commits of S1 to S6 above (this progress commit follows).
- `git diff --stat main -- packages/` empty; `git diff --stat main -- .github/workflows/ci.yml 'packages/*/stryker.config.mjs'` empty; `git diff --stat main -- apps/web/src/contract/mutation* apps/web/src/lib/released.contract.test.ts apps/web/src/lib/i18n-contract.test.ts` empty.
- `npm run verify` exit 0 (format:check, sync, lint, typecheck, test:coverage, build, check:site, check:dist): 189 test files, 3,436 tests (baseline on `main`: 3,269), coverage 100 percent statements, branches, functions and lines (2,325 / 1,290 / 733 / 1,999).
- Dist diff (design M-6): the HTML of `<scratch>/dist-main` (built from `main`) and `apps/web/dist` normalised with `sd '/_astro/[A-Za-z0-9_.-]+\.(js|css)' '/_astro/ASSET.$1'`, then `diff -r -x '*.js'`: empty (0 differing files). Sanity: a one-letter edit in the copy is reported, so the check can fail.
- JS graph of the concrete entry: real build (`npm run check:site`) 37,848 B (baseline 36,450 B on `main`, +1,398 B; target at most 38,500 B, gate 49,152 B). Library build (`client-entry.contract` helper, whitespace removed, see Deviations 2): 38,744 B (same build on the S4 tree 37,299 B, on `main` 37,330 B).
- Other budgets: HTML largest 34,073 B (limit 40,960), calculator page weight 161,931 B (limit 196,608), CSS and fonts unchanged.
- `npm run test:e2e` (Chromium against `wrangler dev`): 283 passed, run after S1, S3, S5 and at the tip (38.8 s). `npm run lighthouse` not run (needs the Lighthouse tooling and Chrome; markup is byte-identical so the audit has nothing new to find).

### Scenario ids proven, and negative proofs (each run, then reverted; `git status --porcelain` clean afterwards)

S1: no new scenario (behaviour preserved; [CP46] id helpers moved to `ids.ts`, plus `labelId`). Negative proof: reorder `slab` fields in the moved `shapes.ts` (shapes test and layout test fail), reverted. e2e green.

S2: [CWC2] (choices, primary), [CWC3] (`shoppingLinesOf`: declared order, reversed engine order, extra, missing, duplicate, unit), [CWC28], [CWC29], [CP58] (slot side), K10/K11 type proofs in `page-module.test-d.ts`. Negative proofs: `rows` constant 4 (the five-field fixture fails), drop `CHOICE_OPTIONS` (missing-option case fails), match shopping by index (reversed-order cases fail).

S3: [CWC2] complete, [CWC3] slot side, [CP57] (max 20 and max 30 fixtures), [CP22] logic, [CP16] (cost rows), [CP21] (bag yields 0.60, 0.45, 0.30 checked against the real data package before asserting), answer sentences [CP1], [CP33]. Negative proofs: clamp at a literal 50 (the max 30 fixture fails), cost row at price 0 (`>= 0`), shopping match by index, answer template fixed to `answer.slab`.

S4: [CWC5] (fifteen text keys, default texts, metric texts), [CWC6] (empty price is an own `undefined` key, via a spy over the engine's `validate`), [CWC8], [CWC14], [CWC15] logic, K7 (`Environment.helps`), `FieldView.hidden`. Negative proofs: `rawTextOf` returns the text as typed in `texts.ts` (the two empty-price cases fail), `rawTextOf` skipped in the controller (29 concrete controller tests fail), bound read in the wrong unit (the `1001 ft` case fails).

S5: [CWC3] creation check and later-run drift, [CWC5], [CWC8], [CWC10] to [CWC12], [CWC14], [CWC15], [CWC17] through the unchanged concrete assertions, [CP22] through the slot, no-slot module, money primary, choice group fixture, [CWC36] size (see above). Negative proofs: drop the `shoppingLinesOf` call at creation (three SHOPPING_LINES cases fail), step event without the guard (no-slot case fails), skip the equal-value guard (bound cases fail, concrete and fixture).

S6: [CWC1], [CWC6] (rectangle record is exactly `length` and `width`), [CWC7], [CWC9], [CWC13], [CWC16], [CWC31], [CWC34]. Negative proofs: `const w = window;` in `controller.ts` (CWC9 names the file), `'concrete'` string literal in `texts.ts` and `import '../concrete/shapes.ts'` in a slot (CWC34 names both).

### Deviations from the design and tasks

1. **S5 is one rewrite commit of 1,098 changed lines** (`f02978e`) plus a 143-line preparation commit (`db7e452`). `controller.ts` is replaced wholesale by `controllerOf` (a closure over the module), which git counts as 611 changed lines alone; the fixture tests that give 100 percent branch coverage (`controller.test.ts`, 207 lines) must ship with it, and the concrete test accessors, the mount and the builder re-point must land in the same green commit. The named split (PanelView and answer into S5b) would have needed a concrete-typed intermediate controller and doubled the churn, so it was not taken.
2. **The library-build size gate measured the wrong thing.** `client-entry.contract` and `client-size.contract` build the entry in Vite library mode, which keeps whitespace in an `es` bundle: the printed size on `main` was 47,451 B against the 49,152 B gate (1.7 KB of room), while the shipped file is 36,450 B (`check:site`). The generic core adds about 1.4 KB, which fits the real budget by a wide margin and the pretty-printed one not at all. Commit 5953902 removes the whitespace in the helper (`rolldownOptions.output.minify.codegen.removeWhitespace`), adds a test that the measured bundle has no indentation, and leaves both budgets (49,152 B and 40,960 B) unchanged. Measured with the fix: `main` 37,330 B, S4 tree 37,299 B, tip 38,744 B. G2 and G3 should expect the same proxy.
3. **CWC7 text says `150` restores `125.00`, but a bare number in a length field is read in the field's default unit (feet for rectangle-area).** `150` is 150 ft, so the figures are `1,500.00`, `166.67`, `139.35`; `150 in` (or `12.5`) gives `125.00`, `13.89`, `11.61`. The rectangle test asserts both and the spec delta needs the same correction (the `l=150` URL is inches, which is why CWC13 holds).
4. **Extra exports and shapes not in the design table:** `byTextKey` (overloaded record builder, so `Record<TextKey<C>, V>` needs no assertion: the review's claim that a `Record<string, V>` assigns to a literal-key record is wrong, TS2740), `isTextInput`, `optionOf`, `fail` (one helper for every `PageModuleError`; the cause is `{ id, at }` for every code, not per-code fields), `TextInput`. `PanelView<C>` and `State`/`View`/`Output` are generic in `C` so the test accessors keep literal keys (`noPropertyAccessFromIndexSignature` forbids `panel.figures.x` on a `Record<string, V>`).
5. **`outputText` fails loudly for a fraction hint and for a quantity with no decimal hint** (no calculator uses a fraction hint yet; K5 only specifies the decimal and money formats).
6. **`answerValues` now reads the shape's fields from `SHAPE_FIELDS`** (placeholder = key, except `footingWidth` to `width` and `footingDepth` to `depth`) instead of a four-case switch; same sentences, smaller graph. `answerValuesOf` (the S3 interim) and `figuresOf` use: the builder `lib/concrete-page.ts` now calls `answerValues`; `figuresOf` stays for the unrouted view until S10.
7. **S4's controller used `choiceSlot` directly, not `concretePage`,** until S5, so the interim graph did not pull the other slots into the client.
8. **Strict TDD order:** RED was observed for every new module and every changed signature. Exceptions where the test pins behaviour that already held (break-the-code spot checks recorded above instead): the raw-record own-key `undefined` (S4), `hidden` and `helps` accessors (the S4 test was written after the controller edit; run against the old controller it could not load because `concrete-layout.ts` was deleted in the same commit), the generic-code scan (passes on clean code by design, proven by the seeded cases and three negative proofs).
9. **The apply-progress commit and the tick of `tasks.md` and `state.yaml` are one docs commit on top of S6.**

### Test and coverage numbers

Baseline `main`: 177 files, 3,269 tests. Tip: 189 files, 3,436 tests. Coverage thresholds all met; `apps/web/src/calculator/**` at 100 percent in the four counters.

### Remaining for the orchestrator (G1.4, GX1 to GX6)

Push the branch, CI (`verify`, `mutation` matrix and gate, `site-browser`), the four reviewers, Judgment Day, the PR body from G1.4, and the `site-browser` wall time. G2 branches from this tip.

## G1 correction round 1

Review of `a77cd56..b1e2f09` (four lenses). Fifteen work-unit commits on top of `b1e2f09`; no history rewrite, nothing under `packages/` or `.github/` touched (`git diff --stat main -- packages/ .github/` is empty).

| Finding | Commit | What changed |
|---|---|---|
| R1-1 / REL-2 (CWC9 scan scope) | `0c85185` | Two lists in `generic-code.contract.test.ts`: the browser scan runs over every non-test, non-`__testing__` source under `calculator/**` (per-id folders included), the id scan keeps the per-id exclusion (CWC34). New assertion that `concrete/page.ts` and `rectangle-area/page.ts` are in the browser list. Negative proof: `export const leak = typeof window;` appended to `concrete/page.ts` failed the test, reverted. |
| REL-1 (duplicate declared materials) | `7aad51e` | `shoppingLinesOf` throws `SHOPPING_LINES` when `declared` has a duplicate. Test row is now `['a','a']` against `[a, b]` (red first: it returned `[a, a]`). |
| RD-5 (misleading code) | `1af9f05`, `68c74d5` | `ANSWER_SELECT` added to `PageModuleCode` and the design list; `answerSlot` and its test use it (red first). |
| RD-6 (line by position) | `0e5a4b2` | `bagsOf` finds the line by `materialId === 'concrete-mix'`; two tests (a leading other-material line, a line of another material) failed on the old code. |
| RD-4 (`ShoppingLineSpec` cardinality) | `7670c0c` | `fill` and `note.fill` are gone: the placeholders are the keys of `parts().fills`, `note` is a page-key suffix string. Concrete's output is byte-identical (dist diff empty). Design updated. |
| RD-1 / R1-4 (`PanelView` precision) | `699a5ee` | `figures` and `costs` are `Readonly<Partial<Record<OutputKey<C>, ...>>>`, and `CostSlot.visible` returns the same partial type. No `?.` was needed in the test accessors (`toBe` accepts `undefined`); no assertions added (M-1 kept). |
| RD-3 (controller closure) | `13ee000` | The shadowing local `Moment` is gone (the exported `Moment<C>` is used); the controller-side `shoppingLinesOf` runs only for a module with no shopping slot (a module with a slot is checked, with its units, in `shopping.view`), with a comment; `answerOf` narrows `moment.result` inline. Functions stay in the closure, as asked. |
| R1-5 / RES-3 (fail at creation) | `8dce3f4` | `controllerOf` writes every figured output of the defaults run with `outputText` and checks both primaries are figured; failure is `PageModuleError('OUTPUT_HINT')` with `{ id, at }`. New fixture `hintedCalculator`; tests: fraction hint on a secondary and on the primary, a primary with no hint, the metric primary (red first: none threw). Design updated. |
| REL-3 (slot-absent branch) | `cbbacc9` | `rectangle-area/controller.test.ts` presses a `step` through the any-calculator controller (the rectangle-area event union has no percent key, so no assertion is needed) and asserts the same state, view and no write. Task 6.1 wording updated; the money-primary branch still rests on the `moneyCalculator` suite. |
| REL-4 (weak assertion) | `4f52989` | The hidden `footingWidth` equals `mustBeOk(concrete.validate({}), ...).footingWidth` (`mustBeOk` is the helper this file already imports; there is no `unwrap` here). |
| RD-2 (AGENTS.md step 12) | `1c24569` | Says the controller is generic and the mount and `calculator/concrete/` are still concrete's own; `docs.contract` green. |
| R1-2 (sounder DOM guard) | `b949044` | ESLint block for `apps/web/src/calculator/**/*.ts` (tests, `.d.ts`, `__testing__` ignored) with `no-restricted-globals` over the names of `restrictedGlobalGroups` that the finding lists. A seeded `export const x = window;` in `controller.ts` failed `eslint` (the message reuses the core wording, "packages/core must stay host-independent"), reverted. The text scan stays for ids. |
| R1-3 (no-whitespace assertion) | `3122bad` | `!/\n[ \t]/` and no blank line, plus at most one line, on the engine surface and on the concrete client entry build. Both builds are a single line today. |
| RES-4 (forecast and isolation) | `4669ab0` | Design forecast for the rectangle-area proof entry is 31,000-33,000 B with a mount (27,227 B measured without one). `entry-graph.contract` builds `controllerOf(rectangleAreaPage)` from a virtual entry and asserts no `calculator/slots/` and no `calculator/concrete/` module is reached, plus a seeded case that finds a slot. No proof entry file was needed. |
| RES-1 (numbers) | docs commit of this round | Lines 43 and 64 above: `main` is 36,450 B (growth +1,398 B at the time); the "design assumed" sentence is gone. |
| RD-7 (hygiene) | this section | Rule below. |

### Rule for G2 and G3 (RD-7)

A commit above 400 changed lines carries a body that gives the reason. A per-calculator rewrite (anything under `calculator/<id>/` or the concrete mount) stays out of a generic-rewrite commit. One change per subject.

### Decisions and deviations

- RD-3: the finding offered "run once and reuse" or a comment. The controller-side check was kept only for a module with no shopping slot, because with a slot `shopping.view` already runs the stricter check (units) on the same engine lines; a comment says why. The output is unchanged.
- RD-4: the preferred option (derive from `parts().fills`) was taken; nothing in the generic code read the removed fields, so no builder change was needed. G2's builder reads the keys of `fills`.
- R1-5: the check also runs for the metric primary, so a calculator whose metric primary has no figure fails at creation. No registry calculator changes behaviour.

### Measured

- `npm run format && npm run lint && npm run typecheck && npm run test:coverage` green; 189 files, 3,452 tests (round start: 3,436), coverage thresholds met, `apps/web/src/calculator/**` at 100 percent.
- `npm run verify` exit 0. `check:site`: JS graph of the concrete calculator page 38,137 B (limit 49,152; the round added 289 B, mostly the creation check in `controller.ts`; the G1 target of 38,500 B still holds), largest HTML 34,073 B, CSS 7,358 B, calculator page weight 162,220 B.
- Dist diff against `main` (HTML normalised with `sd '/_astro/[A-Za-z0-9_.-]+\.(js|css)' '/_astro/ASSET.$1'`, then `diff -r -x '*.js'`): empty.

## G1 Judgment Day

Both blind judges returned no severe finding on `a77cd56..0ead3c1` (judge B recomputed the slab, `l=240`, footing and rectangle-area figures by hand; both traced the replace-only write, the hidden-field read, the own `undefined` money key, the unit toggle, the stepper clamp and the shopping checks). **JUDGMENT: APPROVED.** Info items folded in the exit commit: the stale `concrete-layout.ts` reference in `components/calculator/model.ts` (both judges) and `sessionStorage` added to the calculator-layer `no-restricted-globals` set (judge A). Follow-ups: the lint message reuses the core wording ("packages/core must stay host-independent"); `FORM_ORDER` and `PAGE_KEY` are declared ahead of G2 (tasks 8.x). G1.4 (push, CI, PR, merge) is the orchestrator's.

## G2: page parts

Branch `feat/calculator-core-g2-page-parts` (from `main` 4fb7848, which holds the merged G1). Mode: strict TDD (`npm test`, vitest). Slices S7 to S14 as work-unit commits; G2.5 (push, CI, the four reviewers, Judgment Day, PR) belongs to the orchestrator. Nothing was pushed. The hygiene rule of "G1 correction round 1" held: a commit over 400 changed lines carries a body with its reason (one: `6075a7d`), no per-calculator rewrite shares a commit with a generic rewrite, one change per subject. Mapping tools used for the dist diff are in the scratchpad (`g2/map.py`, `g2/norm.sh`), not in the repository.

### Commits (oldest first, `git diff --shortstat -M`)

| Slice | Commit | Subject | Changed lines |
|---|---|---|---|
| S7 | 0ef9577 | refactor(web): rename the calculator DOM hooks to the generic scheme | 115+ / 69- (184) |
| S8 | e9b6d88 | refactor(web): rename the concrete page builder to page-view | 82+ / 11- (93), rename shown as `=>` |
| S8 | 31440b4 | feat(calculator): add the form layout the page builder will read | 150+ |
| S9 | 703a2c8 | feat(web): add the generic form view the page builder derives from a module | 377+ / 6- (383) |
| S9 | 6075a7d | refactor(web): render the calculator form from the generic form view | 207+ / 250- (457, body gives the reason) |
| S10 | 5920e77 | feat(web): add the generic result view the page builder derives from a module | 289+ / 6- (295) |
| S10 | e63bc2f | refactor(web): render the result panel from the generic result view | 141+ / 132- (273) |
| S10 | c7bcb8a | refactor(calculator): drop figuresOf now the panel is built from the definition | 95+ / 191- (286) |
| S11 | f701c24 | feat(web): add the generic page view builder with the messages list | 276+ / 9- (285) |
| S11 | 4e73499 | refactor(web): write the page messages from the generic page view | 83+ / 148- (231) |
| S12 | 945f08d | feat(web): add the per-id page table | 84+ |
| S12 | 7a69964 | feat(web): choose the page module by id in CalculatorView | 199+ / 97- (296) |
| S13 | 574f9f8 | refactor(client): rename the concrete mount to the generic mount | 4+ / 4-, `concrete-mount.ts => mount.ts` at 100 percent similarity |
| S14 | 3408f86 | refactor(client): mount every calculator page through the generic mount | 162+ / 82- (244) |

### Forecast vs actual

| Slice | Forecast | Actual | Note |
|---|---|---|---|
| S7 | ~130 | 184 | eleven files, the form test for `--calc-rows` and the m-6 pin |
| S8 | ~150 | 243 (93 + 150) | the rename carries the guard tests that bring `page-view.ts` to 100 percent (see Deviations 3); the layout is its own commit |
| S9 | ~330 | 840 (383 + 457) | additive builder first, then the component switch; the switch is over 400 and its body says why |
| S10 | ~320 | 854 (295 + 273 + 286) | additive builder, component switch, then `figuresOf` removal (its table of hand-verified figures was kept) |
| S11 | ~220 | 516 (285 + 231) | additive `pageViewOf`, then the template switch |
| S12 | ~270 | 380 (84 + 296) | table first, then the view, callers, scan and docs |
| S13 | ~30 | 8 | pure rename |
| S14 | ~300 | 244 | one commit (the entry call-site is one line of the new signature) |
| Group | ~1,750 | 3,269 | forecast was low for test volume (fixtures for both locales and every absent branch) and Prettier expansion, as in G1 |

### Group tip evidence (G2.1 to G2.4)

- `git log main..HEAD --oneline` shows the 14 commits above (this progress commit follows). `git diff --stat main -- packages/ .github/` is empty; `git diff --stat main -- apps/web/src/contract/mutation* apps/web/src/lib/released.contract.test.ts apps/web/src/lib/i18n-contract.test.ts 'packages/*/stryker.config.mjs'` is empty.
- `npm run verify` exit 0: 192 test files, 3,517 tests (G1 tip 3,452 in 189 files), coverage 100 percent statements, branches, functions and lines (2,435 / 1,360 / 774 / 2,099), including `apps/web/src/lib/page-view.ts` from S8.
- `npm run check:site` (real build): JS graph of the concrete calculator page 38,378 B (G1 tip 38,137 B, +241 B; target at most 38,500 B, gate 49,152 B), largest HTML 34,314 B (`/es/calculadora-de-concreto`, G1 tip 34,073 B), CSS 7,399 B, page weight of the calculator 162,702 B (limit 196,608 B), no JavaScript elsewhere.
- Full-length HTML proof (`CalculatorBody.budget.test`): EN 40,557 B, ES 40,834 B of 40,960 B. The baseline in the S7 task (39,268 / 39,517 B) was stale: on the G1 tip it was 40,316 / 40,593 B, so S7 added +227 B (forecast +~200 B) and the whole group +241 B. **ES headroom is now 126 B**, not the 1,250 B the brief assumed: the next calculator page or any markup growth needs a budget decision first.
- `npm run test:e2e`: 283 passed (39.3 to 40.2 s of Playwright wall time locally), run after S7, S11, S12, S13 and S14 and at the tip; the S7 negative run (one hook renamed in the form only) failed 22 and passed 261. `npm run lighthouse`: exit 0, six pages, performance, accessibility, best practices and SEO all 1, CLS 0 on every page including both calculator pages.
- Dist diff (G2.4), baseline `dist` built from `main` (the G1 tip build, which was already proven identical to the pre-G1 build): the mapping is applied to a copy of the calculator pages, `/_astro/` names are normalised in both trees, `diff -r -x '*.js'` is **empty**; a one-attribute edit in the copy is reported, so the check can fail. Per-mapping match counts, identical on `/concrete-calculator` and `/es/calculadora-de-concreto`: `data-shape-button` 4, `data-bag` 3, `data-waste-step` 2, `data-bag-yield` 1, `data-bag-lb` 1, `data-yield` 1, `calc-shape-area` area 1, `<p class="calc-shopping">` 1. The inline CSS rule `.calc-shape-area{...}` maps to the G2 `.calc-choice-area{gap:var(--space-3);min-height:calc(var(--calc-rows,1) * 6rem + (var(--calc-rows,1) - 1) * var(--space-3));display:grid}` (the m-6 expression, minifier spacing aside) in 14 pages, 1 on each calculator page. The intermediate builds after S9, S10, S11 and S12 were diffed the same way (empty each time).
- GX2 hygiene: `git log main..HEAD --format=%B | rg -i 'co-authored|claude|anthropic|generated with'` returns nothing.

### Scenario ids proven, and negative proofs (each run, then reverted; `git status --porcelain` clean afterwards)

S7: [CP54] (rename part), [CP55], [CWC28] (CSS side), [CWC36] (HTML size print), SQ31 part (assertions unchanged: the e2e diff holds selector text only). Negative proofs: form renamed to `data-choice="shapeX"` without the mount (e2e 22 failed), CSS back to `calc(4 * 6rem + 3 * gap)` (styles contract pin failed).

S8: [CWC30], K13 (AGENTS step 11 sentence, `docs.contract` row), coverage entry for `lib/page-view.ts` (`coverage.contract` first). Negative proofs: the `FORM_ORDER` check replaced by `if (false)` (the gap fixture failed), the coverage entry lowered to 99 (`coverage.contract` failed).

S9: [CWC5] (builder side), [CWC24] (form part), [CWC28], [CWC29] (render), [CP11], [CP12], [CP14], [CP51], [CP58]; `PAGE_KEY` for a missing stepper key and for a unit with no hint. Negative proofs: rows hard-coded to 4 in the builder (the five-row fixture failed), `--calc-rows:4` hard-coded in the component (the render fixture failed), count input given `decimal` (the input-mode case failed).

S10: [CWC3] (render, declared order), [CWC24] (rows), [CP54] (line hooks), [CP15], [CP16], [CP1], [CP2] through the unchanged concrete assertions, K5/K6 (rows from display hints, bare primary value). Negative proofs: shopping lines reversed (the two-line fixture failed), `data-line` dropped (three component cases failed).

S11: [CWC23] (messages part), [CWC25] (builder side), [CP43], [CP40] and R7 (the no-JS note with and without the example), design m-2 (the unit-hint rule). Negative proofs: two messages swapped (order tests failed), hint key made optional (the `mm` case failed), a trailing space on the bare note (the R7 case failed).

S12: [CWC23], [CWC24], [CWC26] (type test, `astro check` fails naming the table and the id when a `SCRIPTS` row is deleted), [CWC27], [CWC34] (components, builder and, from S14, the mount join the id scan), [CP54] (full list), [CP56], K13 (AGENTS step 14, `docs.contract`). Negative proofs: the `SCRIPTS` row deleted (`npm run typecheck` failed with two errors), `pageView('concrete', locale)` back in the view (the `pageView(id, locale)` source test failed).

S13: K13 (AGENTS step 12 path, `docs.contract` and `client-hygiene` lists). Negative proof: the entry pointed at `../mounts.ts` (the entry contracts failed to build).

S14: [CWC18] to [CWC22] (generic mount, proved by the unchanged e2e: ids and `aria-describedby`, Enter, `replaceState` count, clipboard fallback, controls enabled), [CWC25], [CWC34] (mount joins the scan), [CWC36], [CWC37] (the hygiene scan only, derived from `CALCULATOR_PAGES`; `entry-graph` and `client-entry` still name the concrete entry until S17), [CP42], [CP43], [CP47], [CP48], [CP55]. Negative proofs: `fetch(` appended to `mount.ts` (hygiene failed), `lib/pages.ts` imported by the entry (the graph and size contracts failed), `rg` of the slot selectors in `find(`/`findAs(` is clean after moving the one `find(row, '[data-shopping]')` to a list lookup.

### Deviations from the design and tasks

1. **Slices split into an additive commit and a switch commit** (S9, S10, S11, S12): every slice but S7, S13 and S14 went over 400 on the rewrite, so each builder (`formViewOf`, `resultViewOf`, `pageViewOf`, `PAGES`) landed first, with its tests and nothing rendering it, and the component or caller switch followed. The tree is green at each commit and no commit is above 400 except `6075a7d` (457), whose body says why. S10 took a third commit for the `figuresOf` removal.
2. **`pageViewOf` arrives in S11, not S12.** The S11 tests (answer only with an answer slot, the no-JS note, messages for a module with no slot) need a builder that accepts any module, so `pageViewOf(module, locale, catalog)` is complete in S11 and `concreteView` is a one-line wrapper until S12 re-points its callers and deletes it.
3. **S8 carries guard tests that S12 later replaces.** The 100 percent entry for `lib/page-view.ts` is in S8 as the owner rule says; the renamed builder was at 91 percent statements and 79 percent branches (its throws for a drifted definition or catalog), covered with mocked-module tests. S9 removed the helpers they covered and S12 rewrote the rest as direct `pageViewOf` calls on a broken copy of the definition, with no module mock.
4. **The dist-diff mapping needed one change:** the calculator stylesheet is inlined in every HTML file, so the `.calc-shape-area` rule maps in all 14 pages (counts above), not only the two calculator pages; the attribute mappings apply to the calculator pages only, as written. The m-6 assertion compares the minified rule without whitespace (the minifier writes `var(--calc-rows,1)`).
5. **K13 rows were added, not replaced, in S8 and S13:** `docs.contract` had no row for the builder path, so S8 added `apps/web/src/lib/page-view.ts`; S12 replaced the `concreteView` row with `apps/web/src/lib/pages.ts` and added "the recipe does not contain `concreteView`"; S13 replaced the concrete-mount row.
6. **`figuresOf` removal kept its evidence.** The hand-verified table (default, length 20, bags 40 and 60, waste 0 and 15, footing F1, column, steps, prices, zero and very large bag counts) now runs through the display hints and the cost slot in `concrete/present.test.ts`, the methodology contract reads the engine through `outputText`, and the bag-count guards moved to `answerValues`, which still reads the mix line. Only the error-path tests of the removed function went away.
7. **The primary-output rule was in two places** (`controller.ts` and `page-view.ts`): the module's `primary[system]`, else the output with the primary role. After the group tip it moved to `page-module.ts` as `primaryOutputOf` (one rule, one throw) with `sentenceNameOf` (the message name the builder writes and the controller reads); the controller's `primaryOf` closure and the builder's copy both call it. Proven by `page-view.test.ts` (the sentence the builder writes for each unit system is the one the controller shows, on concrete in both locales, a hinted primary per system and a hint-free primary) and `page-module.test.ts` (the named output per system, the role fallback, the throw for a named output the calculator lacks, the sentence name with and without a hint). Negative proof: the thrown message changed in `page-module.ts` (the throw test fails naming it), reverted. The same follow-up fixed `FORM_ORDER` for a stepper on a choice-driven field (`801d6ec`).
8. **Test-support additions:** `formCalculator` (five count fields), `lengthCalculator`, `lengthsCalculator` and `fieldsOf` in `apps/web/src/__testing__/page-fixtures.ts`.
9. **Strict TDD order:** RED was seen for every new module and changed assertion (the S7 unit run failed 9 tests; its e2e RED was the 22 failures of the wrong-hook proof rather than a separate run against the old build). Pure renames (S13, the S8 rename) have the recorded exception: the moved tests keep their assertions. Spot checks instead of RED, for behaviour that already held: the graph-reach assertions of S14 and the derived hygiene list (proven by the negative proofs above).

### Test and coverage numbers

G1 tip: 189 files, 3,452 tests. G2 tip: 192 files, 3,517 tests (3,526 after the two follow-up commits); coverage thresholds all met; `apps/web/src/calculator/**` and `apps/web/src/lib/page-view.ts` at 100 percent in the four counters.

### Remaining for the orchestrator (G2.5, GX1 to GX6)

Push the branch, CI (`verify`, `mutation` matrix and gate, `site-browser`), the four reviewers, Judgment Day, the PR body from G2.5 and the `site-browser` job wall time. G3 branches from this tip (or from `main` once G2 merges).

## G2 correction round

After the four GX3 reviews on `d77fb9d` (one CRITICAL, verified: the HTML budget proof under-measured the page). Same mode as the group: strict TDD, one unit per commit, the tree green at each, nothing pushed, `packages/` and `.github/` untouched. The owner kept the budget at 40,960 B (SQ7) and chose to trim the generic markup.

### Commits (oldest first, `git diff --shortstat -M`)

| Finding | Commit | Subject | Changed lines |
|---|---|---|---|
| MP-html-budget-proof-under-measures (CRITICAL), MP-render-choices-queries-per-event | 768874e | refactor(web): carry the choice and stepper keys on the group and the option as the button value | 115+ / 96- (211) |
| MP-html-budget-proof-under-measures (the fixture) | 53c1bca | test(web): measure the HTML budget with the real head and the script island | 9+ / 16- (25) |
| TB-builder-skips-controller-creation-checks, MP-page-view-repeats | bd11a1c | fix(web): replay the controller's creation checks in the page builder | 140+ / 72- (212) |
| TQ-lost-output-type-guard | c767917 | fix(calculator): refuse a value of the wrong kind in outputText, naming the output | 20+ / 5- (25) |
| MP-dimension-order-dead, MP-model-header-comment-stale, SC-agents-step12-cross-reference, MP-agents-step-12-dangling-reference, TQ-slice-12-pins-error-count, TQ-view-source-text-pin | f861641 | refactor(web): drop the dead dimension order and refresh the stale comments and pins | 18+ / 37- (55) |
| SC-cwc37-partial-claim, SC-task-12-1-file-named, deviations 10 and 11 | this commit | docs(openspec): record the G2 correction round | |

### Findings

- **MP-html-budget-proof-under-measures (CRITICAL).** The fixture rendered the about head, no island and a hand-made route table. With the real head (`headFor('concrete', …)`), the real `ROUTES` and the `ConcreteScript` island, the G2 tip measured EN 40,781 B and ES 41,050 B (90 B over). Trim (deviation 10), tests first: `CalculatorForm.test.ts` (7 assertions edited, RED 7), `CalculatorBody.test.ts` (the CP54 list adds `data-value`, `data-direction`, `data-reserved="shape"` and `data-reserved="steppers"` to the hooks that must be absent), then the component, the mount and the three Playwright specs (selector text only; `git diff -U0 -- tooling/site-browser/e2e | rg '^[-+].*expect'` shows selectors only, SQ31). Then the faithful fixture (its RED, run before the trim: ES 41,050 B). After the trim the faithful fixture measures **EN 40,567 B, ES 40,836 B** of 40,960 B (ES headroom 124 B, at least the 90 B asked; the unfaithful fixture at the G2 tip read 40,557 / 40,834). The real page: largest HTML 34,100 B (G2 tip 34,314 B, 214 B saved).
- **MP-render-choices-queries-per-event.** Folded into the trim: `Ui` holds `units` and `choices` (each group with its buttons), collected once at mount; `renderChoices` runs no `querySelectorAll`.
- **TB-builder-skips-controller-creation-checks.** `checkModule(module, defaults)` in `controller.ts` holds the K15 shopping match (an empty declared list for a module with no shopping slot) and the OUTPUT_HINT checks (every figured output writable, the primary of each unit system among them); `controllerOf` and `pageViewOf` both call it. Tests first in `lib/page-view.test.ts` (RED 3: `shoppingCalculator` with no shopping slot gives `SHOPPING_LINES`; a hint-free imperial or metric primary gives `OUTPUT_HINT` naming the key, and `controllerOf` throws the same message) and `lib/pages.test.ts` (`controllerOf(entry.module)` for every `PAGES` row: a regression guard, green from the start).
- **MP-page-view-repeats.** `pageViewOf` computes the default moment once and passes it to `formViewAt` and `resultViewAt`; the exported `formViewOf` and `resultViewOf` keep their signatures as wrappers. `pageKey(id, suffix)` spells `calc.<id>.page.<suffix>` once. `lib/page-view.ts` stays at 100 percent.
- **TQ-lost-output-type-guard.** `outputText` throws `TypeError('<key> is a <measure>, not money')` for Money on a quantity descriptor and `'<key> is money, not a quantity'` for the reverse (test first, RED 1). `calculator/**` stays at 100 percent.
- **MP-dimension-order-dead.** `DIMENSION_ORDER` deleted; its test now checks each shape's fields against the definition's input order. `SHAPES` stays (it gives the `Shape` type that `SHAPE_FIELDS` satisfies), `SHAPE_FIELDS` has three callers.
- **MP-model-header-comment-stale.** Header rewritten: the view of one page built by `lib/page-view.ts`, no `Concrete*` types.
- **SC-agents-step12-cross-reference, MP-agents-step-12-dangling-reference.** Step 12 names `apps/web/src/calculator/<id>/page.ts` where it describes the entry; `docs.contract` green.
- **TQ-slice-12-pins-error-count.** `slice(ALL_ERROR_CODES.length)`.
- **TQ-view-source-text-pin.** The literal `pageView(id, locale)` pin is gone; `not.toContain('concreteView')` and the no-`concrete`-outside-`SCRIPTS` scan stay.
- **SC-cwc37-partial-claim.** The S14 line above scopes [CWC37] to the hygiene scan.
- **SC-task-12-1-file-named.** Task 12.1 names the files that hold the CWC23 EN/ES assertion.
- **TQ-generic-mount-no-slot-path-untested.** Deferred to G3 S17 (the rectangle-area proof entry and its lookup check): there is no DOM test environment in the unit suite, and the browser suite runs only the concrete pages until a slot-free page is routed.
- **Left alone, on purpose.** MP-primary-before-span-imperial-only (pre-existing, `candidate_caused` false; a fix costs about 30 B of HTML the ES page cannot spare without a budget decision; follow-up), MP-message-names-without-shared-rule (pre-existing, pinned by tests; follow-up), TQ-figures-helper-reimplements-builder (the block keeps the hand-verified figures as evidence; a rewrite against `resultViewOf` is a G3 docs-slice candidate), SC-cwc27-source-proxy (by design per task 12.1, executable once a second id exists).

### Deviations from the design and tasks (continued)

10. **Hook trim: the group is no longer byte-identical to `main` before the G2.4 mapping.** The G2 tip put `data-choice="<key>" data-value="<v>"` on every choice button and `data-step="<key>" data-direction="<d>"` on every stepper button, plus `data-reserved` on the area and the steppers; the faithful budget fixture showed that scheme 90 B over the ES budget. The owner kept SQ7 at 40,960 B and chose the trim: the key sits on the block (`<div class="calc-group" … data-choice="shape">`, `<div class="calc-steppers" data-step="waste">`), each button carries its option as its native `value`, and `data-reserved="shape"` / `"steppers"` are dropped (nothing read them: the mount reads `data-reserved` only for `notice` and `copy`, the CSS never does). The design's DOM-contract table and the G2.4 task carry the new mapping. **G2.4 redone** against a fresh `main` worktree build (`git worktree add … main`, `npm ci`, `npm run build`; scratchpad `g2c/map.sh`, `g2c/map.log`): on the two calculator pages of the copy, in order, `data-shape-button="([a-z]+)"` → `value="$1"` (4), `aria-labelledby="calc-shape-label">` → `… data-choice="shape">` (1), `data-bag="([0-9]+)"` → `value="$1"` (3), `aria-labelledby="calc-bag-label">` → `… data-choice="bag">` (1), `data-waste-step="([a-z]+)"` → `value="$1"` (2), `data-reserved="steppers"` → `data-step="waste"` (1), `class="calc-shape-area" data-reserved="shape"` → `class="calc-choice-area" style="--calc-rows:4"` (1), `data-bag-yield` → `data-line-note="0"` (1), `data-bag-lb` → `data-fill="bagLb"` (1), `data-yield` → `data-fill="yield"` (1), `<p class="calc-shopping">` → `<p class="calc-shopping" data-line="0">` (1); counts identical on `/concrete-calculator` and `/es/calculadora-de-concreto`, a zero count fails the script. The inline `.calc-shape-area{…}` rule maps to the branch's `.calc-choice-area{…}` rule (asserted to carry the m-6 `min-height`) in the 14 pages that inline the calculator stylesheet (the two 404 pages do not). `/_astro/` names normalised in both trees; `diff -r -x '*.js'` **empty**. Negative proof: `data-choice="bag"` edited to `"bags"` in the mapped copy is reported (5 diff lines naming it). The worktree was removed afterwards.
11. **The builder replays the creation checks.** The design made `controllerOf` the one place that refuses a module (K15, OUTPUT_HINT); a module that failed there still built a static page and died at mount. `checkModule` is now shared, so `astro build` fails first. No behaviour changes for the registry calculators (the `PAGES` table test proves every row builds a controller).

### Measured

- `npm run verify` exit 0: 192 test files, 3,531 tests (G2 tip 3,526); coverage thresholds all met, `apps/web/src/calculator/**` and `apps/web/src/lib/page-view.ts` at 100 percent in the four counters.
- `npm run check:site`: JS graph of the concrete calculator page 38,778 B (G2 tip 38,378 B; the mount collects the groups and the controller shares `checkModule`; the G1 soft target of 38,500 B is exceeded by 278 B, a follow-up for G3 if the owner wants it back under; gate 49,152 B), largest HTML 34,100 B (`/es/calculadora-de-concreto`, G2 tip 34,314 B), CSS 7,399 B, calculator page weight 162,888 B (limit 196,608 B), no JavaScript elsewhere.
- Full-length HTML proof with the faithful fixture: EN 40,567 B, ES 40,836 B of 40,960 B.
- `npm run build && npm run test:e2e`: 283 passed (39.5 s of Playwright wall time), run after the trim and at the tip; the mapping, verify and e2e logs are in the scratchpad (`g2c/`).

## G2 Judgment Day

Two blind judges on `da0c0e2` (the correction-round tip) returned no severe finding; both agreed on the same two info items, folded in below (same mode: strict TDD, one unit per commit, the tree green at each, nothing pushed, `packages/` and `.github/` untouched, no other refactor). **JUDGMENT: APPROVED.**

### Commits (oldest first, `git diff --shortstat -M`)

| Item | Commit | Subject | Changed lines |
|---|---|---|---|
| A second placeholder in a shopping text | a2206d0 | fix(web): refuse a shopping text that carries a second placeholder, naming its page key | 83+ / 8- (91) |
| MP-primary-before-span-imperial-only | 1601c04 | fix(web): hold the primary prefix span when either unit system's sentence has one | 68+ / 11- (79) |
| this section | this commit | docs(openspec): record the G2 Judgment Day verdict | |

### Info items

- **A second placeholder in a shopping text (both judges).** `fillSplitOf` in `lib/page-view.ts` split a label or note around the first placeholder the fills name, so a text holding a second one (another fill name, or the same name twice) would have rendered it as literal `{name}` text with no `data-fill` element. The builder now fails the build instead: after splitting on the chosen placeholder, a leftover `{<fill name>}` throws `SHOPPING_LINES` with `at` the page-key suffix (`alphaLine`, `alphaNote`), the existing code whose meaning fits (the declared line and its text disagree); no new `PageModuleCode`. Tests first in `lib/page-view.test.ts` (RED 3: two fills in the label, the same fill twice in the label, two fills in the note; plus a green case with text on both sides of one placeholder in the label and another fill in the note). The `ShoppingLineSpec.parts` comment in `calculator/page-module.ts` said a line may carry any number of placeholders; it now says one placeholder per text, the label and the note filled by one name each, the same or not. `lib/page-view.ts` stays at 100 percent.
- **MP-primary-before-span-imperial-only (both judges; the correction round had left it as a follow-up).** `ResultPanel.astro` rendered `<span data-primary-before>` only when the build-time (US) sentence had a prefix, and the mount tolerates a missing span, so a module whose metric sentence has a prefix while the US one starts with `{value}` lost the prefix after a unit switch. The result view's primary now carries `prefixed` (`components/calculator/model.ts`): `resultViewOf` derives it from the sentences of both unit systems (`sentenceOf`, the page key of each system's primary output or the bare `{value}`), and the component renders the span when `prefixed` is true with the US `before` text (empty when that sentence has none), which the script then rewrites. Tests first: `lib/page-view.test.ts` (RED: the hinted fixture with `{value} feet` / `Edge {value} inches` gives `prefixed: true` with `before: ''`; concrete gives `prefixed: false`; the five existing primary expectations carry the flag) and `ResultPanel.test.ts` (RED: the span is rendered empty when prefixed with an empty `before`, absent when not prefixed). Concrete has no prefix in either locale, so its markup is byte-identical: the estimated 30 B of HTML were never spent.

### Measured

- Full-length HTML proof with the faithful fixture after both units: **EN 40,567 B, ES 40,836 B** of 40,960 B, the same two numbers as after the correction round (the concrete page did not grow by a byte).
- `npm run typecheck` 0 errors, `npm run lint` clean and the relevant vitest files green before each commit (`page-view.test.ts` 50, `ResultPanel.test.ts` 8, `CalculatorBody.test.ts` and `CalculatorBody.budget.test.ts` unchanged and green).
- `npm run verify` exit 0 at the tip: 192 test files, 3,537 tests (correction round 3,531: four for the placeholder guard, two for the prefix span); coverage thresholds all met, `apps/web/src/calculator/**` and `apps/web/src/lib/page-view.ts` at 100 percent; `check:site` unchanged (largest HTML 34,100 B, JS graph of the concrete page 38,778 B, calculator page weight 162,888 B)..

## G2 exit (GX1 to GX6)

- GX1: `npm run verify` exit 0 on the tip `572dd08`; CI run 40420681908 on that tip green: `verify` 2 min 20 s, the eight `mutation` shards 1 to 4 min each (cache hits, `packages/` untouched), `mutation-gate` green, `site-browser` green. The first three runs of PR #93 never started: the private repository had used up the free plan's Actions minutes; the owner made the repository public on 2026-10-26 and the rerun went through.
- GX2: `git log main..HEAD --format=%B | rg -i 'co-authored|claude|anthropic|generated with'` returns nothing (27 commits).
- GX3 and GX4: see "G2 correction round" and "G2 Judgment Day" above.
- GX5: PR #93 `refactor(web): generic page parts, per-id tables and mount (calculator-core group 2)`, opened as a draft on `d77fb9d` and marked ready on `572dd08` with the body of task G2.5.
- GX6: `site-browser` wall time 3 min 36 s (00:00:57 to 00:04:33 UTC; limit 15 minutes, SQ15).
- The native Gentle AI review could not run from the Claude Code runtime (its lens agents expose no shell there and return incomplete by design); the owner disabled receipt-driven development for this delivery and the four GX3 reviewers plus Judgment Day stand as the review.

