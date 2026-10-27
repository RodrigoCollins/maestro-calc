# Design Review: calculator-core

**Verdict: APPROVE WITH CHANGES.**

The architecture is right: a language-free page module with optional slots, one generic controller, mount and view, server-only copy joining, and `Record<CalculatorPageId, …>` tables. Concrete as module #1 and rectangle-area as a headless module #2 is the right proof. The behaviour-preservation claims check out against the code. Six things must change before tasks are written:

- the generic typing cannot be built as designed (M-1);
- the D13 proof cannot run in CI as designed (M-2);
- the slice plan rests on a false assumption about how lines are counted (M-3);
- the shopping slot leaves open where `qty` comes from (M-4);
- the per-calculator files need their own folder to scale (M-5);
- one gate can never pass as written (M-6).

None of them changes the decisions D1 to D13.

---

## Must change before tasks

### M-1. The generic typing cannot be built without type assertions

**Touches:** design "Interfaces / contracts", K10, K11, Risks; signatures table.

**Evidence.** I compiled probes with the repository's `tsc` and `tsconfig.base.json` (strict, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`) against the real `packages/core/src`.

1. **`StateOf<C>` cannot be built inside generic code.** Take `function f<C extends AnyCalculator>(c: C): StateOf<C>`. Inside it, `c.validate({})` returns `InputsOf<readonly InputDescriptor[]>`, the type of the constraint, not `StateOf<C>`. The compiler reports `TS2322: Type 'InputsOf<readonly InputDescriptor[]>' is not assignable to type 'StateOf<C>'`. `decode(c, …)` does the same: `I` is inferred from the constraint.
   - So `controllerOf<C>` cannot build `Moment<C>`, `State<C>` or `View<C>` from what the engine returns. The only ways around it are `as`, which `no-unsafe-type-assertion` bans for `apps/web/src/**` (`eslint.config.js:271-275`), or a guard at every engine call.
   - Typing over the parts instead (`Calculator<string, I, O, W>`) does not satisfy the constraint `AnyCalculator`. `RunOutput<O>` stays deferred (`TS2344`).
2. **`AnyCalculator` is not public.** It is declared at `packages/core/src/calculator/descriptors.ts:205`, but `packages/core/src/calculator/index.ts` does not export it. Exporting it would be a core change, which D3 forbids and which touches the mutation identity inputs.
3. **The K11 risk does not exist.** `PageModule<typeof concrete>` and `PageModule<typeof rectangleArea>` both assign to `PageModule<AnyCalculator>`. This holds with method slots and also with function-property slots: the index-signature state of `AnyCalculator` is assignable to the concrete state. The fallback ("a `PAGES` row holds a view function") is not needed for assignability.
4. **K10's rationale is partly wrong.** For concrete literal key unions, `Readonly<Record<string, V>>` already assigns to `Readonly<Record<'a' | 'b', V>>` with no assertion. The rule did not force the hand-written lists. A guard is needed only for a generic `K`: `Object.fromEntries` into `Record<K, V>` fails with `TS2322`.

**What compiles.** One probe compiled cleanly (`tsc` exit 0) with no assertion. Its shape:

- a precise public overload, `controllerOf<C extends AnyCalculator>(m: PageModule<C>): Controller<C>`;
- an erased implementation, `controllerOf(m: AnyPageModule): Controller<AnyCalculator> { … }`;
- precise keys at the boundary: `view.fields.length` is typed, and `rectangle-area`'s `view.fields.waste` is an error.

This is the repository's own pattern: `encode` and `decode` in `packages/core/src/url/codec.ts:74-83` and `:219-226`.

**Change in design.md:**

- **AnyCalculator.** Define `type AnyCalculator = Calculator<string, readonly InputDescriptor[], readonly OutputDescriptor[], readonly string[]>` in `calculator/page-module.ts`. It is built only from exported core types, so core does not change.
- **Rule for generic code.** Generic code (`controllerOf`, `pageViewOf`, `mount`, the view and text helpers) is written once over `AnyPageModule` (state `InputsOf<readonly InputDescriptor[]>`, keys `string`). Its exported entry points carry one overload signature in `C` for callers and tests. Values are narrowed by descriptor kind (`isQuantity`, `instanceof Rational`), as K10 already says.
- **K10 becomes:** "no type assertion in generic code. Erased implementation plus a typed overload. Slot factories narrow keys with runtime-checked type predicates (`isPercentKey(c)`), which are tested on both branches." `records.ts#keyed` is needed only if a slot factory still has to build a `Record<K, V>`; otherwise drop the file.
- **K11 and Risks.** Replace the K11 risk and its fallback with the assignability fact above, and keep the `test-d` that proves it. The real risk to record: a slot is called with the state of another calculator. Each module carries its own calculator, so this cannot happen by construction, and `pages.test-d.ts` proves the per-id rows.

### M-2. The D13 proof cannot be built in the browser job

**Touches:** design "Astro side" › Unrouted rectangle-area proof; S19; Risks; spec CWC33 note (R4).

**Evidence.**

- **The browser job has no root install.** The `site-browser` job (`.github/workflows/ci.yml:286-323`) downloads the `web-dist` artifact and runs `npm ci --prefix tooling/site-browser` only.
- **Astro is not available there.** `tooling/site-browser/package.json` holds Playwright, axe, LHCI, Wrangler and TypeScript, but not Astro. The browser tooling contract notes that the tooling "resolves without a root install" (`browser-tooling.contract.test.ts:101`).
- **So the design's `tooling/site-browser/e2e/proof-build.ts`, which calls Astro's `build` with `injectRoute`, cannot run in CI.** It would also make the tooling package depend on the root install, which is the boundary that keeps `verify` free of browsers.
- **The mechanism itself is fine.** `CalculatorBody.budget.test.ts` already runs three Astro builds with `injectRoute` inside vitest, so this is about where the build runs.

**Change in design.md, one of:**

- **(a) Recommended.** Add `apps/web/scripts/build-proof.ts`, run as `npm run build:proof` in the `verify` job after `build`. It builds `contract/__testing__/rectangle-area-proof.astro` with `injectRoute` into `apps/web/.proof-dist` (ignored, never `dist`) and uploads it as its own artifact `web-proof`. The browser job downloads it, and `rectangle-area-proof.spec.ts` serves it through `page.route`.
  - Locally: `npm run build && npm run build:proof && npm run test:e2e`. The spec fails with that sentence when the directory is missing.
  - The slice must also edit `ci.yml`, `ci.contract.test.ts` and the `test:e2e` notes in AGENTS.md. Forecast about +60 lines, but minus the 50-line helper in tooling.
  - CI cost: one more Astro build in `verify`, measured in the slice.
- **(b)** Take the spec's own fallback and drop to unit level:
  - the rendered markup through the Astro container (CWC24, CP56);
  - the graph check (CWC4) through `buildClient`;
  - the headless controller (CWC1, 7, 13, 16, 31).

  Then name the one thing only a browser proves, which is that the mount tolerates absent slot elements (today `collect` uses `find`, which throws on a missing element, `concrete-mount.ts:73-101`). Accept it as covered by code review plus the absence of slot selectors in `collect`.

Either way, rewrite R4: "Chromium against a proof build made in `verify` and served with `page.route`."

### M-3. Recut the slices around renames

**Touches:** "Answer first", Technical approach 1, K1, Review units, Split contingencies, Forecast guard lines, Risks row 1, Open questions.

**Evidence.**

- **Renames are detected.** git 2.50.1 with `diff.renames` unset (`git config --get diff.renames` exits 1), so renames are detected by default.
- **The repository has done this before.** `git show --shortstat 4f20847` (four renames re-imported) gives `18 files changed, 31 insertions(+), 31 deletions(-)`.
- **So K1's premise ("a 300-line rename costs 600 lines") is false** under the `git diff --shortstat` measure. The strangler plan then pays twice where the rename plan pays nothing:
  - it moves code out of `concrete-controller.ts` into `texts.ts` and `views.ts` (delete plus add);
  - it extracts `client/dom.ts` (S14, about 200 lines of pure moves).
- **It also leaves dual models in the tree.** `concrete-controller.ts` keeps the old `Panel` next to `PanelView` (S5), and a `View` that is half generic (S6). Each intermediate slice is harder to review than "same file, generalised in place".
- **It contradicts the proposal's approach.** The proposal says "Move code before rewriting it" (proposal.md "Approach").

**Rule to state.** Rename detection needs 50 % similarity between the two ends of the measured range. So a rename lands in a slice where the file changes by less than half (a rename plus import fixes), and the generalising edits come in later slices. The group PR on GitHub may still show a heavily rewritten file as a delete plus add. Reviewers review per slice, and that is the review unit.

The recommended cut is in its own section below: 18 slices, about 4,300 lines, against 20 and about 5,600.

### M-4. The shopping slot does not say where `qty` comes from or how lines match the engine

**Touches:** Interfaces (`ShoppingLineSpec`, `ShoppingSlot`, `shoppingSlot`); spec CWC3.

**Evidence.** `shoppingSlot(lines, view: (m) => { unit, fills }[])` returns no `qty`, but `ShoppingLineView` has one ("qty `—` without a result"). Nothing says which engine line feeds which slot line. Core's `ShoppingLine` is `{ materialId, purchaseUnit, qty }` (`descriptors.ts:128-132`). Calculators 6 to 10 have several lines, and the engine may return them in its own order. Meanwhile the server markup must hold a fixed number of lines, or the page shifts (CP44).

**Change.**

- `ShoppingLineSpec` gains `material: string`.
- The slot finds the engine line by `materialId`, writes `qty` as `groupedInteger(line.qty)` (as today, `concrete-present.ts:107`), or `—` without a result.
- The slot factory, or `definePage`, throws when the default run's `materialId`s differ from the declared lines. That keeps the line count static.
- Say in CWC3 that lines are matched by material, not by position.

### M-5. Give each calculator's web files a folder

**Touches:** Module map, signatures table, K3, CWC34 scan definition, AGENTS recipe text, the e2e record path.

**Evidence.**

- **The flat folder does not scale.** The design puts `<id>-page.ts` plus concrete's `concrete-shapes.ts`, `concrete-present.ts` and their tests flat in `apps/web/src/calculator/`, next to the generic files. At 100+ calculators that is several hundred files in one folder.
- **The CWC34 scan gets fiddly.** "Generic file" then has to be defined by a list of names, not a path.
- **Two files would share a name.** `calculator/concrete-page.ts` (module) and `lib/concrete-page.ts` (builder) would coexist from S2 to S13.
- **Core already does this.** It uses `packages/core/src/calculators/<id>/`.

**Change.**

- Per-calculator web code goes in `apps/web/src/calculator/<id>/`: `page.ts` for the module, plus `shapes.ts`, `present.ts` and the tests for concrete.
- Generic code goes in `calculator/*.ts` and `calculator/slots/*.ts`.
- CWC34 and CWC9 then scan by path ("everything under `calculator/` except `calculator/<registry id>/`").
- `client-graph` can also forbid another calculator's web folder (`/apps/web/src/calculator/(?!<ownId>\/|slots\/)[^/]+\//`). That strengthens CP48 at no cost.
- Coverage stays 100 % (it is still under `calculator/**`).
- The moves are pure renames, folded into S1 (below).
- The recipe names `apps/web/src/calculator/<id>/page.ts`. `docs.contract` resolves it to `calculator/concrete/page.ts` (`pathsIn` fills `<id>`, `docs.contract.test.ts` `pathsIn`).

### M-6. The dist-diff gate can never pass as written

**Touches:** Gates › Group tip; Migration / rollout.

**Evidence.**

- **G1 rewrites the controller and the mount,** so the content of the concrete JavaScript chunk changes. "Normalise the `/_astro/*.js` names" makes the script `src` comparable, but the chunk files still differ. "G1 and G3 tips must diff empty" therefore fails.
- **G2 also changes the inline CSS.** Astro inlines page CSS (`_headers` comment, line 2): `.calc-shape-area` becomes `.calc-choice-area`, and `min-height` uses `var(--calc-rows)`. The G2 baseline mapping must cover that CSS text, not only the attributes.

**Change.** "The dist diff compares every file except `/_astro/*.js`, with chunk names normalised in the HTML. The G2 baseline applies the hook mapping, the two new attributes, `style="--calc-rows:4"` and the CSS rule rename." JavaScript is guarded by the `client-entry` size print and by the e2e.

---

## Minor

- **m-1 (K10 text).** Drop the sentence "That rule is why the old lists were written out by hand". Literal unions accept `Object.fromEntries` (M-1 point 4).
- **m-2 (page view, hints).** Today the hint set is fixed (`lib/concrete-page.ts:31-40`, `HINTS` holds `ft` and `in` only, plus the template list `ft, in, m, cm`). Spec the generic rule:
  - the hint messages are the distinct `defaultUnit`s in input order, then the distinct `metricDefaultUnit`s in input order (for concrete: `ft, in, m, cm`, so the bytes stay the same);
  - the key is `site.calculator.hint<Unit>`;
  - the builder throws naming the unit when the key is missing (`yd` and `mm` have none).
- **m-3 (coverage of the builder).** `pageViewOf(m, locale, catalog)` takes the catalog as an argument, so it is catalog-free. If it moves to `calculator/page-view.ts`, it falls under the 100 % gate, which `lib/**` is not (`vitest.config.ts:12-28`). Only `lib/pages.ts` would then import catalogs. Recommended; otherwise state that `lib/page-view.ts` is checked by the render tests only.
- **m-4 (K12, client bytes).** Page-copy key suffixes (`shoppingLine`, `priceHint`, `readyMixNote`) live in the client-importable module, but only the server uses them. This is acceptable (tens of bytes, no message text). Record it as intentional.
- **m-5 (CWC9 and CWC34 scans).** `concrete-controller.test.ts:1-6` imports catalogs and `lib/concrete-page.ts`. Both scans must exclude test files, and CWC34 must match ids in string literals and paths, not in comments. Today's comments in `model.ts:1-7` and `present.ts` name concrete.
- **m-6 (K9, CSS).** Write `min-height: calc(var(--calc-rows, 1) * 6rem + (var(--calc-rows, 1) - 1) * var(--space-3))`. The fallback keeps a missing attribute from collapsing the area. `styles.contract.test.ts:264-267` pins the new expression.
- **m-7 (K4, K8).** Two extension paths to record:
  - every select renders as a button group; a long material list may later want another presentation, added without changing the hook contract;
  - the stepper takes `Rational` and percent only; a count stepper (Paint coats) would widen `next`.

  Both are acceptable YAGNI.
- **m-8 (form order).** `formOf` makes the form order the declaration order and requires the driven fields to follow their select directly. Concrete satisfies this: `concrete.ts` inputs are `shape`, ten lengths, `stepCount`, `count`, `waste`, `bag`, prices, which match `DIMENSION_ORDER` and `ALWAYS_VISIBLE`. Put the rule in recipe step 1 ("declare a select's driven fields right after it"), so an author learns it before the build throws.
- **m-9 (Rollback).** The groups are stacked. Revert newest first: G1 cannot be reverted alone after G2 has merged.
- **m-10 (spec wording).** Four fixes:
  - CWC "Second-calculator success criterion": also list the `PAGES` and `SCRIPTS` rows;
  - CWC "Generic controller behaviour": the money placeholder and input modes belong to the builder, not the controller;
  - the slot table for answer values: it also receives the primary text;
  - the builder joins `noscript` and `example` without a trailing space when the example key is absent.
- **m-11 (S16 record).** `E2E` in `calculator-pages.ts` imports `CalculatorPageId` as a type, as `urls.ts:2` does. Keep the record free of runtime imports from `@maestro-calc/*`: the browser job has no root install (see M-2).

---

## Recommended slice cut

Lines are `git diff --shortstat` with rename detection. Each group leaves `main` green. The hook rename and its e2e edits are one slice. A rename never shares a slice with the edits that generalise the file.

### G1: generic controller, concrete as module #1 (about 1,650 lines)

| Slice | Content | Forecast |
|---|---|---|
| S1 | Renames only:<br>• `concrete-controller.ts` → `calculator/controller.ts`<br>• concrete's files → `calculator/concrete/` (`shapes.ts`, `present.ts`, tests; the controller test stays as module #1's regression test, `calculator/concrete/controller.test.ts`)<br>• id helpers out of `concrete-layout.ts` into `ids.ts`<br>• import fixes<br>• AGENTS step 12 glob and the docs row (K13) | ~60 |
| S2 | `page-module.ts` (local `AnyCalculator`, `definePage`), `slots/choices.ts`, `concrete/page.ts` (primary, choices), tests and `test-d` (assignability) | ~320 |
| S3 | `slots/{steppers,shopping,costs,answer}.ts` (shopping by `material`, M-4), concrete module complete | ~370 (answer slot moves to S5 if over) |
| S4 | In place in `controller.ts`:<br>• `texts.ts`, built from the three hand-written lists (new code, not a move)<br>• raw record, field views, `Environment.helps`<br>• `outputText` and `priceText` in `present.ts`<br>• delete `concrete-layout.ts`; the mount uses `textKeysOf` | ~330 |
| S5 | `controllerOf` (erased implementation plus typed overload, M-1), choice and step events through the slots, `PanelView` from `DisplayHint` and the slots, answer; test and mount accessors re-pointed | ~380 |
| S6 | `calculator/rectangle-area/page.ts` plus headless tests for every absent branch (CWC1, 7, 13, 16, 31); `generic-code.contract` (CWC9, CWC34 by path) | ~280 |

### G2: page parts (about 1,650 lines)

| Slice | Content | Forecast |
|---|---|---|
| S7 | Hook rename: 57 references in 11 files, `--calc-rows`, CSS, styles contract, budget measured | ~130 |
| S8 | `form-layout.ts` plus tests; rename `lib/concrete-page.ts` → `page-view.ts` (in `calculator/` per m-3, or `lib/`), with AGENTS step 11 and the docs row | ~150 |
| S9 | Generic form view: builder form part, model form types, `CalculatorForm`, tests | ~330 |
| S10 | Generic result view: `ResultPanel`, `ShoppingLine` per line, `figuresOf` removed | ~320 |
| S11 | Messages list (hint rule m-2) and `CalculatorBody` | ~220 |
| S12 | `lib/pages.ts` table, `CalculatorView` via `pageView`, the `concreteView(` callers; rename `client/concrete-mount.ts` → `client/mount.ts` in its own commit | ~230 |
| S13 | Generic mount in place (no `dom.ts` split), `entries/concrete.ts` → `mount(concretePage)`, hygiene list | ~300 |

### G3: tests and docs (about 1,000 lines)

| Slice | Content | Forecast |
|---|---|---|
| S14 | Typed `E2E` record plus generic `calculator.spec.ts` (contingency a/b as in the design) | ~350 |
| S15 | `a11y`, `layout` and `csp` over the record | ~160 |
| S16 | Entry contracts per id, plus proof-entry slot exclusion, `client-graph` from `ownId` (also the web calculator folder, M-5), templates pins | ~200 |
| S17 | D13 proof through mechanism (a) of M-2: page, island, entry, `build-proof` script, CI and ci-contract edit, spec | ~220 |
| S18 | AGENTS recipe plus `docs.contract` tokens (CWC35) | ~140 |

**Total:** about 4,300 lines in 18 slices, against about 5,600 in 20. The same three group PRs, each over 400 lines, as the owner accepts. The 400-line risk is Medium: S3, S5 and S14 sit at 370 to 380 and keep their contingencies.

---

## Verified and found correct

**Architecture.**

- K3 holds. The controller and the mount reach slot code only through the module object, so the graph check sees slot files only through the per-id module's explicit imports.
- `buildClient` reports module ids before tree shaking (`client-build.ts:13-14`, `buildEnd`). The CWC4 check is therefore an import-graph proof, which is stronger than a tree-shaking proof.
- The rectangle-area forecast is plausible: the engine surface is 28,457 B, minus `concrete.ts` (4,775 B) and the yields (226 B), plus about 6 to 7.5 KB of page code, gives about 29.5 to 31 KB.
- Concrete's 37,000 to 38,500 B leaves at least 10.6 KB under the 49,152 B gate.

**Behaviour preservation.**

- The panel rows are static: yd³, ft³, m³, net, with the primary row hidden (`concrete-page.ts:155-160`, `concrete-mount.ts:143-148`).
- `Figures.order` is never read outside its own file, so dropping it is safe.
- `volumeText` is grouped with 2 places (`present.ts:48-49`), and `DisplayHint` declares `places: 2` on all four volume outputs (`concrete.ts:187-208`). `outputText` therefore gives the same strings.
- The cost outputs have no display hint, so they show only through the cost slot. This matches today.
- The message names `volume.yd3` and `volume.m3` equal `<measure>.<unit>` (`CalculatorBody.astro:23`).
- Every page-key suffix of the convention already exists in `en/concrete.ts:38-56`, so no catalog changes.
- The waste descriptor declares `min` 0 and `max` 50 (`concrete.ts:178-179`), so K8 can drop `WASTE_MIN` and `WASTE_MAX` (`concrete-controller.ts:476-477`).

**DOM and CSP.**

- The 57 references in 11 files match the per-file table exactly (counted with `rg`).
- The +195 B estimate reproduces at about 200 B.
- The CSP allows inline styles: `style-src 'self' 'unsafe-inline'` (`apps/web/public/_headers:10`).
- The CP14 and CLS proofs survive the variable-based `min-height`, because the pixels are the same as `4 * 6rem + 3 * gap` (`calculator.css:71-75`).

**Typing.**

- The lint rule's scope is as the design says: `apps/web/src/**/*.{ts,…}` and package sources, not tests (`eslint.config.js:271-275`).
- `.astro` files are type-unchecked (`:325`).

**Specs.**

- R1, R2, R3, R5, R6 and R7 are correct fixes.
- R3 should list every hook the suites and the mount read: `data-direction`, `data-line`, `data-fill`, `data-line-note`, `data-cost-row`, `data-hint-row`, `data-price-hint`, `data-reserved`, `data-primary-before`, `data-primary-after`, `data-answer`, `data-not-running`, `data-messages`, `data-unit` and `data-calculator`. The spec says renaming any of them is a contract change.
- CWC6's rectangle-area record (`length` and `width` only) follows from spreading the valid state.

**Unchanged by this change.**

- The `end-state` counts (no new page).
- The `i18n-contract.test-d.ts` unions (no key changes; `ConcretePageKeys` stays exact).
- Mutation: no core or data change, provided that M-1 keeps `AnyCalculator` web-local.
- The `docs.contract` path check works with the new tokens, because `<id>` resolves to concrete paths that exist at every slice, as long as K13 is kept.
- Rollback by group revert is sound (order per m-9).
