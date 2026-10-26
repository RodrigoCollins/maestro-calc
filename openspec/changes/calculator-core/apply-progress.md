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
