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
- JS graph of the concrete entry: real build (`npm run check:site`) 37,848 B (baseline 36,476 B, +1,372 B; target at most 38,500 B, gate 49,152 B). Library build (`client-entry.contract` helper, whitespace removed, see Deviations 2): 38,744 B (same build on the S4 tree 37,299 B, on `main` 37,330 B).
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
2. **The library-build size gate measured the wrong thing.** `client-entry.contract` and `client-size.contract` build the entry in Vite library mode, which keeps whitespace in an `es` bundle: the printed size on `main` was 47,451 B against the 49,152 B gate (1.7 KB of room), while the shipped file is 36,476 B (`check:site`). The design assumed 36,450 B for this print. The generic core adds about 1.4 KB, which fits the real budget by a wide margin and the pretty-printed one not at all. Commit 5953902 removes the whitespace in the helper (`rolldownOptions.output.minify.codegen.removeWhitespace`), adds a test that the measured bundle has no indentation, and leaves both budgets (49,152 B and 40,960 B) unchanged. Measured with the fix: `main` 37,330 B, S4 tree 37,299 B, tip 38,744 B. G2 and G3 should expect the same proxy.
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
