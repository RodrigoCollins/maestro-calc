# Tasks: Blueprint Panel (live plan drawing and WhatsApp share)

Change: `blueprint-panel` · Inputs: `proposal.md` (D1–D9), `design.md` (B1–B12, slices S1a–S7 and the PR plan are authoritative), `design-review.md` (APPROVE WITH CHANGES, B-1/B-2, M-1..M-8, m-1..m-4, S-1 applied), 5 delta specs under `specs/` (`blueprint-drawing` BD1–BD25 · `calculator-web-core` CWC41–CWC47 and the MODIFIED page-module contract · `calculator-page` CP76–CP86, MODIFIED Result panel, Public DOM hooks, Form controls (CP12) and Client script contract (CP48) · `site-quality` SQ38–SQ44 · `i18n-catalog` ICW19–ICW22) · Mode: strict TDD, artifact store `openspec`, delivery `auto-chain`, chain `stacked-to-main`, one PR per group of slices, work-unit commits per slice. Technical artifacts are English.

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~2,340–2,890 authored in total over 9 slices (`git diff --shortstat`, insertions plus deletions; renames count edited lines only; lockfiles and `openspec/` excluded) |
| 400-line budget risk | Medium. S1b (300–360), S5 (300–370) and S7 (300–370) are closest to 400; S4 (280–340) edits many shared files |
| Chained PRs recommended | Yes (3 PRs) |
| Delivery strategy | auto-chain |
| Chain strategy | stacked-to-main |

Decision needed before apply: No (apply stops at task 5.9 if the S3 measurement gate fails; see Risks 1)
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: Medium

Per-slice forecast (each slice at most 400 by `git diff -M --shortstat`): S1a 280–330 · S1b 300–360 · S2a 280–340 · S2b 200–260 · S3 200–260 · S4 280–340 · S5 300–370 · S6 200–260 · S7 300–370. Per-PR: PR 1 1,060–1,290 · PR 2 480–600 · PR 3 800–1,000. Each slice is the unit of the 400 rule; a PR is the sum of its slices.

Split rule (by measurement, no exception requested): a slice that measures over 400 moves its tests-only half into its own slice inside the same PR (for example S1b: the entry-graph, slot-free and [BD24] contract edits become `S1c`). Tree stays green at each commit.

### What the user sees after each merge

| After | Visible change |
|---|---|
| PR 1 | Square footage: ink blueprint after the big figure (grid, white rectangle, orange-ticked length and width lines, the area inside), following typing and the unit toggle. Concrete unchanged |
| PR 2 | Both pages: green "Send on WhatsApp" / "Enviar por WhatsApp" after "Copy link". The trim changes nothing on screen |
| PR 3 | Concrete: all four shapes drawn live. No shape shows an empty box |

### Suggested Work Units

| Unit | Goal | PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|----|----------------------|-----------------|-------------------|
| S1a | `DrawingSlot` type, generic geometry (`fitRectangle`, `dimensionLine`) | 1 | `npm test -- apps/web/src/calculator/slots/drawing` | N/A (pure code, not yet reachable from any page) | `page-module.ts` type, `slots/drawing.ts` and its tests |
| S1b | Controller `View.plan`, `nodesOf`/`draw`, mount `hooks.draw`, entry-graph and slot-free contracts | 1 | `npm test -- apps/web/src/calculator/controller apps/web/src/client apps/web/src/contract` | `npm run build && npm run check:site` (dist byte-identical) | `controller.ts`, `client/draw.ts`, `mount.ts`, three contract edits |
| S2a | Square footage plan, box, head CSS, catalogs | 1 | `npm test -- apps/web/src/calculator/rectangle-area apps/web/src/components/calculator apps/web/src/lib` | `npm run build && npm run check:site` | `rectangle-area/plan.ts`, `page.ts`, entry, `ResultPanel`, `pages.ts`, catalogs |
| S2b | Square footage e2e drawing record, [SQ42] contract, recipe | 1 | `npm test -- apps/web/src/contract/drawing-record apps/web/src/contract/docs` | `npm run build && npm run test:e2e -- drawing.spec` | `drawing.spec.ts`, the `drawing` group, the contract, AGENTS.md edits |
| S3 | Trim A–E on the concrete markup (behaviour-neutral) | 2 | `npm test -- apps/web/src/components/calculator apps/web/src/styles` | `npm run build && npm run test:e2e -- calculator.spec a11y.spec` | The trim files and guards; revert restores the 40,678 B markup |
| S4 | WhatsApp share on both pages | 2 | `npm test -- apps/web/src/calculator/controller apps/web/src/components/calculator apps/web/src/lib/page-view` | `npm run build && npm run test:e2e -- share.spec layout.spec` | `CalculatorForm.astro`, `shareHref`, `mount.ts` share code, `.calc-share`, two site keys, `share.spec.ts` |
| S5 | Concrete slab, footing, column geometry (undeclared) | 3 | `npm test -- apps/web/src/calculator/concrete/plan` | N/A (module does not declare it yet) | `concrete/plan.ts` and its test |
| S6 | Concrete steps geometry (undeclared) | 3 | `npm test -- apps/web/src/calculator/concrete/plan` | N/A (same) | the steps part of `plan.ts` |
| S7 | Declare all four shapes, entry, 8 keys per locale, concrete e2e group | 3 | `npm test -- apps/web/src/calculator/concrete apps/web/src/contract apps/web/src/lib` | `npm run build && npm run test:e2e && npm run lighthouse` | `page.ts` slot, `entries/concrete.ts`, catalogs, record group |

## Conventions (apply to every slice)

**Branches and stacking.** PR 1 is the existing branch `feat/blueprint-panel` (it carries the openspec planning commits, excluded from the line count and listed on their own line). PR 2 is `feat/blueprint-panel-p2-trim-share`, PR 3 is `feat/blueprint-panel-p3-concrete`; each is created from the previous PR tip and retargeted onto `main` after its parent merges. A child diff never includes parent changes. The first task of each group says so.

**Commits.** Tests ship with the code that proves them: a [RED] test is run red locally, then its [GREEN] code is written, and the slice is committed with the tree green (a RED-only commit is never made). Conventional Commits only, no `Co-Authored-By`, no AI attribution. Subjects are the design's:
- S1a `feat(web): add the drawing slot and its geometry`
- S1b `feat(web): resolve plans in the controller and inject the SVG writer`
- S2a `feat(web): draw the square footage plan`
- S2b `test(e2e): record the square footage drawing`
- S3 `refactor(web): trim the calculator markup`
- S4 `feat(web): share the calculation on WhatsApp`
- S5 `feat(web): add the concrete slab, footing and column geometry`
- S6 `feat(web): add the concrete steps geometry`
- S7 `feat(web): draw the concrete plans`

**Strict TDD loop.** `[RED]` (a failing test, seen failing for the right reason, with the exact verify command) → `[GREEN]` (smallest code) → `[REFACTOR]`, which runs the four commands: `npm run format`, `npm run sync && npm run lint`, `npm run typecheck`, `npm test`. A test that is green on arrival says so and requires a break-the-code spot check (run it, see it fail, revert). Test names cite the scenario id (`// spec: blueprint-drawing › [BD1]`). Negative proofs are applied, run red, reverted; `git status --porcelain` is clean afterwards.

**No DOM in the unit suite.** `apps/web/vitest.config.ts` runs `environment: 'node'`. Unit tests cover pure code only: geometry, `nodesOf`, `shareHref`, the controller's `plan` per moment, markup through the Astro container, and the static lookup proof. DOM behaviour (`draw`, the mount's `href` rewrite, reveal, aria-label, layout) is proven by e2e in `tooling/site-browser/e2e/`. A task never claims a DOM unit test.

**Measurements are recorded, not assumed.** Each slice records in `apply-progress.md`: the ES concrete full-length bytes (the `CalculatorBody.budget.test.ts` print; at most 40,836 B at every tip, 40,678 B at the start), the `rectangle-area` ES/EN fixture sizes and headroom, the entry graph sizes (33,803 B and 39,164 B at the start, limit 49,152 B), `git diff --shortstat`, the e2e count, and the scenario ids proven.

**Size measurement.** `git diff -M --shortstat <previous slice tip>..HEAD -- . ':(exclude)package-lock.json' ':(exclude)tooling/site-browser/package-lock.json' ':(exclude)openspec/'`.

**Slice gates (run before the slice's last commit).**
- `npm run format:check`
- `npm run sync && npm run lint`
- `npm run typecheck`, plus `npm run typecheck --prefix tooling/site-browser` in any slice touching `tooling/` (S2b, S4, S7)
- `npm run test:coverage` (includes the budget proof; 100 % on the geometry files, [BD3])
- `npm run build && npm run check:site`
- `npm run test:e2e` in S2b, S3, S4, S7 (record the count)

**Group rules.**
- Every PR tip leaves `main` green: `npm run verify`, `npm run test:e2e`, `npm run lighthouse`, and the `site-browser` CI job pass.
- **Linux is the final word on layout.** Every layout, label-collision ([BD14]), box-equality ([BD20]), CLS ([BD21]) and copy-reserve ([CP84], [CP85]) test is confirmed by the PR's `site-browser` CI job (Linux Chromium) before merge. Apply cannot push or run CI: the orchestrator records the run id and conclusion in `apply-progress.md`. A macOS-only pass is never recorded as confirmed. Where macOS and Linux differ, Linux wins.
- **Mutation (SX4).** The `calculators` Stryker shard is affected only if `packages/core` changes; the `data` shard only if `packages/data` changes. This change touches neither: `git diff --stat main -- packages/core packages/data` is empty at every tip (stated per slice). `packages/i18n` changes in S2a, S4 and S7 (catalogs, i18n is not in the Stryker shards), so mutation is N/A in every slice and `.github/workflows/ci.yml` and `packages/*/stryker.config.mjs` stay unedited.
- Budgets never rise: HTML 40,960 B, CSS 20,480 B, entry graph 49,152 B, calculator page weight 196,608 B; ES concrete full-length at most 40,836 B ([CP66], [SQ38]). If a tip measures over, use the design fallbacks in order (shorter note templates, shorter `.calc-share` rule, then ask the owner).
- No gradient off the homes, no `innerHTML`, no foreign `https?://` URL in a bundle, no throwing `find(` for `[data-drawing]` or `[data-share]`.
- Rollback: revert PR merge commits newest first (PR 3, 2, 1). PR 2's S3 alone is behaviour-neutral.

### Standard Exit Criteria per slice (SX)

- [ ] SX1 Slice gates green in the order above.
- [ ] SX2 Size: shortstat recorded (renames as renames), at most 400, forecast vs actual in `apply-progress.md`.
- [ ] SX3 Commits: conventional subjects, tree green at each commit, no attribution.
- [ ] SX4 Mutation: N/A, `git diff --stat main -- packages/core packages/data` empty (stated per slice, proof recorded).
- [ ] SX5 Traceability: `apply-progress.md` lists the scenario ids proven, each negative proof run and reverted (`git status --porcelain` clean), and the measured sizes.

### Group Exit Criteria (GX): once per PR, before merge (orchestrator-owned)

- [ ] GX1 `npm run verify` green on the PR tip; CI green (`verify`, `mutation` matrix and gate, `site-browser`); Linux run id recorded.
- [ ] GX2 `git log main..HEAD --format=%B | rg -i 'co-authored|claude|anthropic|generated with'` returns nothing.
- [ ] GX3 Four specialized reviewers on the frozen candidate (after `npm run format`). Only candidate-caused blocking findings gate.
- [ ] GX4 Judgment Day (two judges); at most one scoped correction transaction, then GX1 again.
- [ ] GX5 PR opened against `main` with the body contents of the group's exit task and a Chain Context section (dependency diagram marking the current PR, start state, end state, prior dependencies, follow-ups, out of scope); merged before the next PR merges.
- [ ] GX6 `site-browser` job green and its wall time recorded (limit 15 minutes).

---

## PR 1 — Square footage live drawing (`feat/blueprint-panel`)

Visible on maestrocalc.com after merge: the square footage blueprint. Concrete unchanged.

### S1a — The drawing slot and its geometry

Forecast 280–330. Specs: calculator-web-core MODIFIED page-module contract (drawing row); blueprint-drawing [BD2] (mechanism), [BD3], [BD12], [BD13]. Shard impact: none (`apps/web` only). Green because: a type and generic helpers no page imports; no built file changes.

Commit: `feat(web): add the drawing slot and its geometry`.

- [ ] 1.1 Baseline on `feat/blueprint-panel`: `npm run verify` green; `npm run build && cp -R apps/web/dist <scratch>/dist-prev`; record ES concrete full-length (expect 40,678 B), rectangle-area ES/EN sizes, both entry graph sizes, e2e count. Verify: numbers in `apply-progress.md`.
- [ ] 1.2 [RED] `apps/web/src/calculator/slots/drawing.test.ts` (new) [BD2, BD12 mechanism]: hand-verified tables for `fitRectangle(frame 300×200, gutters, l, w)` at 10×10, 20×10, 10×20 (ratio 2 and 1/2, centred, equal margins) and 100×1 (ratio clamped to 4, `CLAMP = 4`); `dimensionLine(a, b, side, label)` returns the main line, two dashed extension lines, two 45° ticks of half-length 5 and the label 6 units outside; coordinates rounded to 0.1; text width estimate `chars × size × 0.56`; label-inside rule (`width ≤ rw − 12` and `rh ≥ 29`, else the bottom row). Verify: `npm test -- apps/web/src/calculator/slots/drawing` fails (module missing).
- [ ] 1.3 [RED] `apps/web/src/calculator/slots/drawing.property.test.ts` (new) [BD13]: over generated lengths and widths the ratio is non-decreasing in l/w, equals the true ratio inside `[1/4, 4]`, swaps exactly when length and width swap, the outline never leaves the frame, and estimated label boxes never intersect. Verify: `npm test -- apps/web/src/calculator/slots/drawing.property` fails.
- [ ] 1.4 [RED] `apps/web/src/calculator/slots/drawing.test-d.ts` or the existing page-module type test [CWC module row]: `DrawingSlot<C>` has `frame` and `plan(moment): Plan | null`; a module without `drawing` still types. Verify: `npm run typecheck` fails (export missing).
- [ ] 1.5 [GREEN] `apps/web/src/calculator/page-module.ts` (`Frame`, `DrawingSlot<C>`, optional `drawing` member, `definePage` passes it through) and `apps/web/src/calculator/slots/drawing.ts` (`Label`, `PlanLabel`, `Plan`, `Point`, `Side`, `Gutters`, `Rect`, `CLAMP`, `dimensionLine`, `fitRectangle`; no DOM, no `window`). Verify: 1.2, 1.3, 1.4 pass.
- [ ] 1.6 [REFACTOR] The four commands. `rg -n "document|window|navigator" apps/web/src/calculator/slots/drawing.ts` is empty ([BD3], [CWC9] scan stays green).
- [ ] 1.7 Gates and measure: `npm run test:coverage` shows 100 % lines, branches, functions, statements on `slots/drawing.ts` ([BD3]); `npm run build && npm run check:site`; dist diff against `<scratch>/dist-prev` empty (record normalised `/_astro` names if needed); shortstat of S1a.
- [ ] 1.8 Negative proofs: change `CLAMP` to 5 (the 100×1 table and the property test fail); drop the swap symmetry (round half) in `fitRectangle` (swap property fails); put `document.title` in `drawing.ts` (the [CWC9] scan fails); revert each, `git status --porcelain` clean.
- [ ] 1.9 Exit: SX1–SX5. SX4 for S1a: `git diff --stat main -- packages/core packages/data` empty.

### S1b — Controller plans and the injected writer

Forecast 300–360. Specs: calculator-web-core [CWC41], [CWC42], [CWC43], [CWC44], [CWC45]; blueprint-drawing [BD10] (controller spy), [BD19] (`nodesOf` and attributes), [BD24]; calculator-page [CP48] (MODIFIED); site-quality [SQ41] (partial). Shard impact: none. Green because: no page module declares `drawing` yet, so no built file changes. The DOM application of `draw` is not unit-tested (no DOM); the e2e arrives in S2b.

Commit: `feat(web): resolve plans in the controller and inject the SVG writer`.

- [ ] 2.1 [RED] `apps/web/src/calculator/controller.test.ts` (edit) [CWC41, BD10, B3]: with a fixture module that declares `drawing` (a local `definePage` over `rectangle-area` with a stub `plan`) and a spy hook, the sequence default → `20 ft` → `abc` → `15 ft` yields `View.plan` set for the default, `20 ft` and `15 ft` and `undefined` for `abc`; a fixture whose `plan` returns `null` yields `View.plan === null` (generic no-plan rule, [BD8] part, [BD19] input); `Label` messages resolve through `env.messages` into text; a module with no `drawing` yields `undefined` every time. Verify: `npm test -- apps/web/src/calculator/controller` fails (`plan` missing).
- [ ] 2.2 [RED] `apps/web/src/client/draw.test.ts` (new) [BD19, BD24 part, B7]: `nodesOf(plan)` returns exact `{tag, attrs, text?}` lists for a fixture plan (grid `path` with the 16-unit grid, outline, lines with `#B9C6DA` and extension dash `2 3`, orange `#F06A1D` ticks at stroke 2, white labels, notes at 15 units); colour constants equal the table of `docs/design/direction.md` read as text ([BD18] unit part: white on ink, orange on ink and `#B9C6DA` on ink each at least 4.5:1 by the WCAG formula); the node list contains no namespace literal. Verify: `npm test -- apps/web/src/client/draw` fails (module missing).
- [ ] 2.3 [RED] `apps/web/src/contract/entry-graph.contract.test.ts` (edit) [CWC42, CWC43, CP48]: an entry's own imports are the mount and the page module, plus `../draw.ts` exactly when `PAGES[id].module.drawing` is declared (derived); the graph reaches `client/draw.ts` and `slots/drawing.ts` only when declared; `mount.ts` and every generic file outside `entries/` never reach `draw.ts`; seeded failing entry: a slot-free entry that imports `../draw.ts`. Verify: `npm test -- apps/web/src/contract/entry-graph` fails on the seeded and mount cases.
- [ ] 2.4 [RED] `apps/web/src/contract/slot-free-proof.contract.test.ts` (edit) [CWC44, CWC45, CWC47 part]: the slot-free markup has no `data-drawing`; the throwing lookups (`find(`, `findAs(`) of `mount.ts` exclude `[data-drawing]` (and, for [CWC47], `[data-share]`); a seeded `find(root, '[data-drawing]')` in a scratch copy of the mount source fails the proof; the slot-free proof entry reaches neither `draw.ts` nor `slots/drawing.ts`. Verify: `npm test -- apps/web/src/contract/slot-free` fails on the seeded case and the new reach check.
- [ ] 2.5 [RED] `apps/web/src/contract/client-entry.contract.test.ts` (edit) [BD24, SQ41]: for every entry graph that contains `client/draw.ts`, no `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `DOMParser`, `eval`, `new Function`, no namespace literal, calls limited to `createElementNS(box.namespaceURI`, `setAttribute`, `textContent`; the existing `https?://` scan stays (no allowance added); a seeded writer source containing `innerHTML` fails. Verify: `npm test -- apps/web/src/contract/client-entry` fails on the seeded case.
- [ ] 2.6 [GREEN] `apps/web/src/calculator/controller.ts`: `View.plan` (`undefined` while invalid, `null` for a no-plan state, otherwise a `ResolvedPlan` whose labels are text); label resolution via `env.messages`; no DOM. Verify: 2.1 passes.
- [ ] 2.7 [GREEN] `apps/web/src/client/draw.ts` (`Draw`, `nodesOf`, `draw(box, plan)`): skips the redraw when `JSON.stringify(plan)` equals the last plan; `box.replaceChildren(...)` with nodes from `createElementNS(box.namespaceURI, tag)`, `setAttribute`, `textContent`; sets `role="img"`, removes `aria-hidden` and sets `aria-label` only when the text changes; for `null` empties the box and sets `aria-hidden="true"`. Verify: 2.2 passes; the DOM application is covered by S2b e2e.
- [ ] 2.8 [GREEN] `apps/web/src/client/mount.ts`: `mount(module, hooks: { draw?: Draw } = {})`, `findAll(root, '[data-drawing]')` (never a throwing `find(`), calls `hooks.draw?.(box, view.plan)` for each box only when `plan !== undefined`, imports only the `Draw` type. Verify: 2.3, 2.4, 2.5 pass; `npm run build` output unchanged.
- [ ] 2.9 [REFACTOR] The four commands.
- [ ] 2.10 Gates and measure: `npm run build && npm run check:site`; dist diff against `<scratch>/dist-prev` empty; both entry graph sizes unchanged (no page imports the writer yet); shortstat of S1b. If over 400, apply the split rule: tasks 2.3–2.5 become `S1c` `test(web): guard the injected writer in the entry contracts`, committed after S1b with the tree green.
- [ ] 2.11 Negative proofs: make `mount.ts` import `./draw.ts` (the [CWC42] case fails); call `hooks.draw` with the plan of an invalid state (the spy sequence fails); use `find(root, '[data-drawing]')` in the mount (the slot-free proof fails); write `innerHTML` in `draw.ts` ([BD24] fails); change an orange hex (the [BD18] table fails); revert each.
- [ ] 2.12 Exit: SX1–SX5. SX4: `packages/core packages/data` empty.

### S2a — Draw the square footage plan

Forecast 280–340. Specs: blueprint-drawing [BD1], [BD2], [BD12] (real page), [BD15] (name template), [BD16], [BD19] (markup), [BD22]; calculator-page [CP76], [CP77]; i18n-catalog [ICW20] (rectangle-area), [ICW21] (names); calculator-web-core [CWC43] (first declaring page); site-quality [SQ40], [SQ41]. Shard impact: none in `packages/core`/`packages/data`; `packages/i18n` catalogs only (not a shard). Green because: all pieces land together with their guards. The [SQ42] contract is not added here: it lands in S2b with the first record that satisfies it (design), so the S2a tip is green but is never a merge point.

Commit: `feat(web): draw the square footage plan`.

- [ ] 3.1 [RED] `apps/web/src/calculator/rectangle-area/plan.test.ts` (new) [BD1, BD2, BD12]: default moment gives a square, top label `10 ft`, left label `10 ft`, area label `100.00` with `ft²` and the hand-verified coordinates; 20×10 twice as wide as tall; 10×20 twice as tall as wide; 100×1 ratio 4 with labels `100 ft` and `1 ft` inside the frame and not intersecting; metric labels `3.05 m` and `9.29` with `m²` and unchanged coordinates ([BD11] unit half); `12' 6"` gives `12 ft 6 in`, `125.00`. Verify: `npm test -- apps/web/src/calculator/rectangle-area/plan` fails (module missing).
- [ ] 3.2 [RED] `apps/web/src/components/calculator/ResultPanel.test.ts` (edit) [CP76, CP77, BD16, BD19 markup]: through the Astro container, a module with `drawing` renders exactly one `[data-drawing]` svg with `viewBox="0 0 300 200"`, `aria-hidden="true"`, no children, no `role`, placed after `.calc-primary` and before `dl.calc-rows`, no ancestor up to the panel carries `aria-live`, `role="status"` or `role="alert"`; the slot-free module has none ([CWC45]); the figures and rows of the default render are byte-identical to [CP15] / the rectangle-area cases ([CP77]). Verify: `npm test -- apps/web/src/components/calculator/ResultPanel` fails.
- [ ] 3.3 [RED] `apps/web/src/lib/pages.test.ts` (edit) [BD22, B4]: `headStyleOf` of the `rectangle-area` row holds `reserveCss` plus `drawingCss(frame)` equal to `[data-drawing]{display:block;width:100%;max-width:24rem;aspect-ratio:300/200;margin-bottom:var(--space-3);font:600 17px var(--font-display)}`; a row without `drawing` adds 0 B; `calculator.css` contains no `[data-drawing]` rule. Verify: `npm test -- apps/web/src/lib/pages` fails.
- [ ] 3.4 [RED] `apps/web/src/lib/page-view.test.ts` and catalog tests (`apps/web/src/lib/i18n-contract.test-d.ts`, `packages/i18n` hygiene/register tests; locate with `fd`) [ICW20, ICW21, B8]: the page key `calc.rectangle-area.page.drawing` exists in both locales with the placeholders `{length}`, `{width}`, `{area}` equal across locales (EN `Plan: {length} by {width}, {area}`; ES in the neutral tú register, no unit symbol); `EnglishKeys` and the page-key union include it; the message entry `drawing` lands in the inert template. Verify: `npm test -- apps/web/src/lib packages/i18n` and `npm run typecheck` fail.
- [ ] 3.5 [RED] `apps/web/src/contract/entry-graph.contract.test.ts` expectation (no edit; derived): the `rectangle-area` entry must import `../draw.ts`, reach `slots/drawing.ts`, stay at most 49,152 B (forecast about +3.5 KB on 33,803 B), and the `concrete` graph stays unchanged. Verify: `npm test -- apps/web/src/contract/entry-graph` fails (the page does not declare `drawing`).
- [ ] 3.6 [GREEN] `apps/web/src/calculator/rectangle-area/plan.ts` (pure; uses `fitRectangle`, `dimensionLine`, `dimensionText`; area label from the panel figure + `ft²`/`m²`) and `page.ts` (`drawing: { frame: { width: 300, height: 200 }, plan }`). Verify: 3.1 passes.
- [ ] 3.7 [GREEN] `components/calculator/{model.ts,ResultPanel.astro}` (the box after `.calc-primary`, before `dl.calc-rows`, rendered only when the view has a drawing frame), `lib/page-view.ts` (`drawing` message and the frame in the view), `lib/pages.ts` (`headStyleOf` + `drawingCss`), `packages/i18n/src/catalogs/{en,es}/rectangle-area.ts` (`page.drawing`), `lib/i18n-contract.test-d.ts`. Verify: 3.2, 3.3, 3.4 pass.
- [ ] 3.8 [GREEN] `apps/web/src/client/entries/rectangle-area.ts`: `import { draw } from '../draw.ts'; mount(page, { draw })`. Verify: 3.5 passes; `npm run build` shows the box and the head style on the two square footage pages only.
- [ ] 3.9 [REFACTOR] The four commands.
- [ ] 3.10 Gates and measure: `npm run build && npm run check:site`; dist diff against `<scratch>/dist-prev`: only the two square footage pages (box, head style, template entry) and the rectangle-area entry chunk differ, concrete HTML and CSS byte-identical (record the file list); record rectangle-area EN/ES fixture sizes against 40,960 B ([SQ40]) and headroom, the new entry graph size against 49,152 B ([SQ41]), ES concrete full-length unchanged; shortstat of S2a.
- [ ] 3.11 Negative proofs: move the box before `.calc-primary` (the order test fails); give the box a `role="img"` in the server markup (the [BD19] markup case fails); put `linear-gradient` in `drawingCss` (`CalculatorBody.budget.test.ts` gradient ban fails); drop the ES `drawing` key (ICW20 fails naming the key); declare `drawing` on the slot-free module (CWC45 fails); revert each.
- [ ] 3.12 Exit: SX1–SX5. SX4: `packages/core packages/data` empty; `packages/i18n` changed (catalogs), not a Stryker shard.

### S2b — The square footage drawing record

Forecast 200–260. Specs: blueprint-drawing [BD9], [BD10], [BD11], [BD14], [BD15], [BD17], [BD18] (e2e axe), [BD19] (e2e), [BD20], [BD21], [BD23], [BD25]; site-quality [SQ42], [SQ44]. Shard impact: none. Green because: only test and doc files; the [SQ42] contract holds because the record declares `drawing` exactly when the page does.

Commit: `test(e2e): record the square footage drawing`.

- [ ] 4.1 [RED] `apps/web/src/contract/drawing-record.contract.test.ts` (new) [SQ42, M-8]: for each id of `CALCULATOR_PAGES`, read `tooling/site-browser/e2e/<id>-pages.ts` as text; fail, naming the id, unless `PAGES[id].module.drawing` is declared exactly when the text declares a `drawing:` group; seeded cases on fixture strings (declared + no group, group + no slot) fail naming the id. Verify: `npm test -- apps/web/src/contract/drawing-record` fails (rectangle-area declares the slot, the record has no group).
- [ ] 4.2 [RED] `tooling/site-browser/e2e/calculator-pages.test-d.ts` (edit): optional `drawing` group on `E2eSpec`; the `minimal` fixture still types; `RECTANGLE_AREA` carries `drawing`. Verify: `npm run typecheck --prefix tooling/site-browser` fails.
- [ ] 4.3 [RED] `tooling/site-browser/e2e/drawing.spec.ts` (new), generic over records with a `drawing` group: [BD20] box width, height and the next element's top equal before and after the mount, in EN and ES, with and without a query, at every `WIDTHS`; [BD21] CLS at most 0.01; [BD9] typing `12' 6"` gives labels `12 ft 6 in`, `125.00 ft²`, wider outline; [BD10] `20 ft` then `abc` keeps the `20 ft` plan and the answer shows `—`; [BD11] metric toggle relabels (`3.05 m`, `9.29 m²`) with unchanged coordinates; [BD15] `aria-label` contains `12 ft 6 in`, `10 ft` and the area (ES in Spanish); [BD17] a mutation-observer spy sees no live-region mutation while typing and `aria-label` changes only on valid change; [BD14] at 320 px each label's `getBBox` width is at most the estimated width of the geometry, no two label boxes intersect, none leaves the box, measured after `document.fonts.ready` and again with the web fonts blocked (route abort on font requests, fallback font); [BD25] 0 CSP violations; axe 0 violations on both locales in every drawn state. Verify: `npm run build && npm run test:e2e -- drawing.spec` fails (record group missing).
- [ ] 4.4 [GREEN] `tooling/site-browser/e2e/calculator-pages.ts` (type of `E2eSpec`: `drawing`) and `tooling/site-browser/e2e/rectangle-area-pages.ts` (`drawing` group: labels of the hand-verified states, the clamp inputs `100 ft`/`1 ft`, the widths for the box check). Verify: 4.1, 4.2 pass; `npm run typecheck --prefix tooling/site-browser`.
- [ ] 4.5 [GREEN] `AGENTS.md` steps 11–12 (`drawingSlot`-style `drawing` member, `calculator/<id>/plan.ts`, the `draw` hook of the entry, `findAll` rule, head CSS from the `PAGES` row) and the `docs.contract.test.ts` tokens/paths (`apps/web/src/client/draw.ts`, `apps/web/src/calculator/slots/drawing.ts`, `apps/web/src/contract/drawing-record.contract.test.ts`). Verify: `npm test -- apps/web/src/contract/docs` passes (every path named exists).
- [ ] 4.6 [REFACTOR] The four commands, with `npm run typecheck --prefix tooling/site-browser`.
- [ ] 4.7 Gates and measure: `npm run build && npm run check:site && npm run test:e2e` (record count and the drawing suite time); `npm run lighthouse` (a11y, SEO, best practices at least 0.95, CLS at most 0.01); dist unchanged against the S2a tip build; shortstat of S2b and of PR 1.
- [ ] 4.8 **Linux gate (orchestrator-owned).** `drawing.spec.ts` ([BD14], [BD20], [BD21]) must pass on the `site-browser` CI job (Linux Chromium) at the PR 1 tip. Apply records the request and the exact command; the orchestrator records the run id and conclusion here. Not confirmed until then.
- [ ] 4.9 Negative proofs: widen the factor `0.56` to `0.4` in the estimate (the [BD14] measured ≤ estimate assertion fails); make `draw` set `style="width:…"` on the box (the [BD20] case fails); add `aria-live="polite"` to the box in `ResultPanel.astro` (the [BD16] and [BD17] cases fail); remove the `drawing` group (the [SQ42] contract fails naming `rectangle-area`); revert each.
- [ ] 4.10 Exit: SX1–SX5. SX4: `packages/core packages/data` empty.

### PR 1 group tasks

- [ ] P1.1 Tip checks: `git log main..HEAD --oneline` shows the planning commits, then S1a, S1b, S2a, S2b; `git diff --stat main -- packages/core packages/data` is empty; CI/stryker paths unchanged. Record `git diff -M --shortstat main..HEAD -- . ':(exclude)package-lock.json' ':(exclude)tooling/site-browser/package-lock.json' ':(exclude)openspec/'` and the `openspec/` lines on a separate line.
- [ ] P1.2 `npm run verify`; `npm run build && npm run check:site && npm run test:e2e && npm run lighthouse`; ES concrete full-length at most 40,836 B (exact figure; concrete HTML byte-identical to `main`); rectangle-area sizes and headroom; both entry graph sizes; e2e count; `site-browser` wall time.
- [ ] P1.3 Exit: GX1–GX6. PR body: scope (`drawing` slot, geometry, controller plan, injected writer, `findAll` lookup, square footage plan, box, head CSS, catalogs, e2e record, [SQ42] contract, recipe), forecast vs actual per slice, scenario ids (BD1–BD3, BD9–BD13, BD15–BD25 for rectangle-area, CWC41–CWC45, CP48, CP76, CP77, ICW20/ICW21, SQ38 tip 1, SQ40–SQ42, SQ44), negative-proof evidence, the dist-diff list, sizes against budgets, Linux CI run id, rollback (revert PR 1: the entry goes back to `mount(page)`). Chain Context: PR 1 of 3, start state `main` `05de1f7`, end state a generic `drawing` slot plus the live square footage plan, follow-ups PR 2 (trim, share), PR 3 (concrete drawings), out of scope WhatsApp, the concrete trim and any concrete drawing. **Pushing, CI, the four reviewers, Judgment Day, the PR and the merge belong to the orchestrator, not to apply.**

---

## PR 2 — Trim and share (`feat/blueprint-panel-p2-trim-share`)

Visible on maestrocalc.com after merge: the green WhatsApp button on both pages. The trim changes nothing on screen.

### S3 — Trim the calculator markup (A–E)

Forecast 200–260. Specs: calculator-page [CP86] (trim part), MODIFIED Public DOM hooks and Form controls ([CP12]); site-quality [SQ38], [SQ39]. Shard impact: none. Green because: behaviour-neutral by design; guards are rewritten first, then the markup.

Commit: `refactor(web): trim the calculator markup`.

- [ ] 5.1 Create `feat/blueprint-panel-p2-trim-share` from the PR 1 tip (retarget onto `main` after PR 1 merges). Baseline: `npm run verify` green; `npm run build && cp -R apps/web/dist <scratch>/dist-prev`; save the built `dist/es/calculadora-de-concreto.html` as `<scratch>/concrete-es-before.html`; record the budget print for ES and EN concrete (expect 40,678 B ES), and a text snapshot of the visible text, ids and ARIA attributes of both concrete pages (for [SQ39]).
- [ ] 5.2 [RED] Rewrite the guards first (trim A and the form owner): `apps/web/src/components/calculator/CalculatorField.test.ts:17`, `CalculatorForm.test.ts:152` (the form carries `autocomplete="off"`, no input sets its own) and e2e `tooling/site-browser/e2e/calculator.spec.ts:137` (asserts the form attribute plus that no input overrides it, [CP12]). Verify: `npm test -- apps/web/src/components/calculator/CalculatorField apps/web/src/components/calculator/CalculatorForm` fails (inputs still carry the attribute).
- [ ] 5.3 [RED] Trim B guard: `apps/web/src/styles/styles.contract.test.ts:349-350` expects the target size on `.calc-form button` (4 selectors) and no `class="calc-choice"` in markup. Verify: `npm test -- apps/web/src/styles` fails.
- [ ] 5.4 [RED] Trim C guards: `ResultPanel.test.ts:119-130`, `CalculatorBody.test.ts:75,103` (one `p.calc-cost` per cost key holding the label, `[data-output][data-cost-row]` hidden and `[data-price-hint]`), the `slot-free-proof.contract.test.ts` absent-hook list (`data-hint-row` is gone from every page), e2e `calculator.spec.ts` hint-row queries, and a mount check that the two spans toggle (e2e `prices` group). Verify: `npm test -- apps/web/src/components/calculator apps/web/src/contract/slot-free` fails.
- [ ] 5.5 [RED] Trim D and E guards: `ShoppingLine.test.ts:19,27,47` and `CalculatorBody.test.ts:71,97` select `.calc-shopping > span:first-child` and expect no `calc-label` class; `SeoHead` test (locate with `fd SeoHead`): no `<meta name="generator">`. Verify: `npm test -- apps/web/src/components/calculator apps/web/src/layouts` fails.
- [ ] 5.6 [GREEN] Trim A–E: `CalculatorField.astro` (drop `autocomplete="off"`), `CalculatorForm.astro` and `calculator.css` (`.calc-form button` selectors replace `.calc-choice`), `ResultPanel.astro` and `mount.ts` (merge cost row and hint: one `<p class="calc-cost">`; the mount toggles the two spans; remove `data-hint-row`, `costRows`/`hintRows` merge; `.calc-hint` leaves the CSS), `ShoppingLine.astro` (drop `class="calc-label"`), `SeoHead.astro:16` (drop the generator meta). Verify: 5.2–5.5 pass.
- [ ] 5.7 [REFACTOR] The four commands.
- [ ] 5.8 Build and compare ([SQ39]): `npm run build && npm run check:site`; visible text, ids and ARIA of both concrete pages equal the 5.1 snapshot (script: read both trees as text, strip tags and compare attribute sets except the listed removals); `npm run test:e2e -- calculator.spec a11y.spec` passes (the `prices` and a11y groups still pass); shortstat of S3.
- [ ] 5.9 **S3 MEASUREMENT GATE (M-7, [CP86], [SQ38]).** Run `npm test -- apps/web/src/components/calculator/CalculatorBody.budget` and record in `apply-progress.md` the ES and EN concrete full-length sizes before (40,678 B ES) and after, the measured trim in bytes, and `size_after_S3 + 340 (S4) + 556 (S7)`. Rule: if the trim is under 700 B ([CP86]) or `size_after_S3 + 896 > 40,836` (that is, the trim is under 738 B), STOP before S4 is sliced and report to the owner with the numbers; the budget and the pin are never raised and S4 is not started. Always also check the narrower rule that S4 alone must fit (`size_after_S3 + 340 ≤ 40,836`); if only PR 3's addition would break the pin, report and let the owner decide, still without starting a budget raise. Record the verdict (continue or stop).
- [ ] 5.10 Negative proofs: re-add `autocomplete="off"` to one input (the CP12 case fails); restore `class="calc-choice"` on one button (the guard fails); restore a separate hint row (`data-hint-row` guard fails); re-add the generator meta (the SEO test fails); revert each, `git status --porcelain` clean.
- [ ] 5.11 Exit: SX1–SX5. SX4: `packages/core packages/data` empty. Dist diff against `<scratch>/dist-prev`: concrete pages differ only by the listed removals, square footage pages by the same removals where they apply (record the file list).

### S4 — WhatsApp share on both pages

Starts only if task 5.9 says continue. Forecast 280–340. Specs: calculator-page [CP78]–[CP85], MODIFIED Public DOM hooks (`data-share`); calculator-web-core [CWC46], [CWC47]; i18n-catalog [ICW19], [ICW21] (share keys), [ICW22]; site-quality [SQ43], [SQ44], [SQ38] (tip 2), [SQ41]. Shard impact: none (`packages/i18n` site catalogs only). Green because: the anchor is generic and `hidden` without JS; the concrete pin is measured at the slice tip.

Commit: `feat(web): share the calculation on WhatsApp`.

- [ ] 6.1 [RED] `apps/web/src/calculator/controller.test.ts` (edit) [CWC46, CP78 unit half]: `shareHref(env at https://example.test, state concrete ws=15, 'https://wa.me/')` returns `https://wa.me/?text=` + `encodeURIComponent(text + ' https://example.test/concrete-calculator?v=1&ws=15')`; same for the ES environment with the Spanish text; the encoding round trip (decode the `text` parameter gives the sentence and URL); the base is a parameter, never a literal. Verify: `npm test -- apps/web/src/calculator/controller` fails (`shareHref` missing).
- [ ] 6.2 [RED] `apps/web/src/components/calculator/CalculatorForm.test.ts` and `CalculatorBody.test.ts` (edit) [CP80, CP81, CP83 markup, B10]: through the Astro container every page, the slot-free one included, renders `<a class="calc-share" data-share="https://wa.me/" target="_blank" rel="noopener noreferrer" hidden>` after the copy button and before the status, with no `href`; its label is `site.calculator.shareWhatsApp`; the inert message template holds `site.calculator.shareText`. Verify: `npm test -- apps/web/src/components/calculator` fails.
- [ ] 6.3 [RED] `apps/web/src/contract/slot-free-proof.contract.test.ts` and `client-entry.contract.test.ts` (edit) [CWC47, CP81 contract half]: the throwing selectors of the mount exclude `[data-share]`; the mount's only writes on the anchor are `setAttribute('href', …)` and the shared reveal step (source scan); no `https://wa.me` literal in any entry graph ([SQ41], [ICW22]: neither share value appears in any bundle); seeded `find(root, '[data-share]')` fails. Verify: `npm test -- apps/web/src/contract` fails.
- [ ] 6.4 [RED] Catalog tests [ICW19, ICW21, ICW22]: `site.calculator.shareWhatsApp` is `Send on WhatsApp` / `Enviar por WhatsApp`; `site.calculator.shareText` is `Check this calculation:` / `Mira este cálculo:` (one short sentence, no URL, neutral tú, equal placeholder sets); both non-empty. Verify: `npm test -- packages/i18n apps/web/src/lib` and `npm run typecheck` fail.
- [ ] 6.5 [RED] e2e `tooling/site-browser/e2e/share.spec.ts` (new) and the optional `share` group in `E2eSpec` (`calculator-pages.ts`), declared in both records [SQ43, CP78–CP85]: [CP78] the `href` equals the expected encoded URL after `ws=15` (concrete) in EN and ES; [CP79] `rectangle-area` `length=15 ft` gives `l=180`, `abc` keeps the `href`; [CP80] hidden and no `href` with JS disabled (smoke project), visible after the mount; [CP81] attributes and accessible name; [CP82] box at least 44×44 px at 320, 390, 1280, text `#06210F` on `#1FAF5A` at least 4.5:1, orange focus ring, axe 0; [CP83] tab order copy → share → next control (`tabOrder` of both records updated); [CP84] copy block fits both actions at the seven widths with the longest status; [CP85] CLS at most 0.01 and the next element does not move when the anchor is revealed. Verify: `npm run build && npm run test:e2e -- share.spec` fails.
- [ ] 6.6 [GREEN] `components/calculator/{CalculatorForm.astro,model.ts}` (the anchor), `lib/page-view.ts` (label and the `site.calculator.shareText` message entry), `packages/i18n/src/catalogs/{en,es}/site.ts` (two keys each), `calculator/controller.ts` (`shareHref`). Verify: 6.1, 6.2, 6.4 pass.
- [ ] 6.7 [GREEN] `client/mount.ts`: `findAll(root, '[data-share]')`, reveal with the copy button step, on every render `a.setAttribute('href', shareHref(env, state, a.dataset.share ?? ''))`, no listeners. `calculator.css`: `.calc-share` (green `--color-whatsapp`, `--color-on-whatsapp`, min 44×44, orange focus ring) and the `.calc-copy` min-height measured on macOS (record the value and the method). Verify: 6.3 passes; `npm run build`.
- [ ] 6.8 [GREEN] Tab order and records: `tabOrder` and the `share` group in `tooling/site-browser/e2e/{concrete-pages.ts,rectangle-area-pages.ts}`; `share.spec.ts` green on macOS. Verify: `npm run build && npm run test:e2e -- share.spec layout.spec` passes; `npm run typecheck --prefix tooling/site-browser`.
- [ ] 6.9 [REFACTOR] The four commands, with `npm run typecheck --prefix tooling/site-browser`.
- [ ] 6.10 Gates and measure: `npm run build && npm run check:site && npm run test:e2e && npm run lighthouse`; ES concrete full-length at the S4 tip at most 40,836 B (forecast 40,192 B), margin recorded; rectangle-area sizes and entry graphs; shortstat of S4 and of PR 2. If the tip is over the pin, apply the fallbacks in order (shorter `.calc-share` rule, then ask the owner); never raise the budget.
- [ ] 6.11 **Linux gate (orchestrator-owned).** `share.spec.ts` ([CP82], [CP84], [CP85]) and `layout.spec.ts` must pass on the `site-browser` CI job (Linux Chromium) at the PR 2 tip, with the `.calc-copy` min-height confirmed on Linux (the later drop of the two platforms wins). Apply records the request; the orchestrator records the run id and conclusion here and any adjusted value.
- [ ] 6.12 Negative proofs: write `href="https://wa.me/"` in the server markup (the [CP80] and bundle checks fail); use a throwing `find(root, '[data-share]')` (the [CWC47] proof fails); drop `encodeURIComponent` (the round trip fails); drop the reveal (the e2e visible case fails); shrink `.calc-copy` min-height by 1 line (the [CP84] fit fails); revert each.
- [ ] 6.13 Exit: SX1–SX5. SX4: `packages/core packages/data` empty.

### PR 2 group tasks

- [ ] P2.1 Tip checks: `git log main..HEAD --oneline` shows S3 and S4 only; `git diff --stat main -- packages/core packages/data` empty; CI/stryker paths unchanged; record `--shortstat main..HEAD`.
- [ ] P2.2 `npm run verify`; `npm run build && npm run check:site && npm run test:e2e && npm run lighthouse`; ES concrete full-length (exact figure and margin to 40,836 B) at the S3 and S4 tips; e2e count; `site-browser` wall time.
- [ ] P2.3 Exit: GX1–GX6. PR body: scope (trim A–E with the byte table, share anchor, `shareHref`, keys, `.calc-share`, records), forecast vs actual (S3 200–260, S4 280–340), the measured trim and the S3 gate verdict, scenario ids (CP12, CP78–CP86, CWC46, CWC47, ICW19, ICW21, ICW22, SQ38 tip 2, SQ39, SQ41, SQ43, SQ44, Public DOM hooks), negative-proof evidence, sizes against budgets, Linux CI run id, rollback (revert PR 2 restores the markup and removes the share link). Chain Context: PR 2 of 3, start state the PR 1 tip, end state trim plus share on both pages, follow-up PR 3 (concrete drawings, needs about 556 B of the margin), out of scope Copy list, Print, formatted results in the message. **Pushing, CI, the four reviewers, Judgment Day, the PR and the merge belong to the orchestrator, not to apply.**

---

## PR 3 — All four concrete drawings (`feat/blueprint-panel-p3-concrete`)

Visible on maestrocalc.com after merge: every concrete shape drawn live. S5 and S6 add geometry the module does not declare yet, so nothing is visible (and nothing is empty) until S7 lands in the same merge.

### S5 — Slab, footing and column geometry

Forecast 300–370. Specs: blueprint-drawing [BD4], [BD5], [BD6], [BD3]. Shard impact: none. Green because: `plan.ts` is not declared by `page.ts`; no built file changes. If it measures over 400, the footing and column halves of tests move to their own slice in this PR.

Commit: `feat(web): add the concrete slab, footing and column geometry`.

- [ ] 7.1 Create `feat/blueprint-panel-p3-concrete` from the PR 2 tip (retarget onto `main` after PR 2 merges). Baseline: `npm run verify` green; `npm run build && cp -R apps/web/dist <scratch>/dist-prev`; record ES concrete full-length (expect about 40,192 B), entry graphs, e2e count.
- [ ] 7.2 [RED] `apps/web/src/calculator/concrete/plan.test.ts` (new) [BD4, BD5, BD6]: slab default (12 ft by 10 ft, 4 in, count 1): ratio 12:10, labels `12 ft`, `10 ft`, note `4 in`, no count mark; footing from `?v=1&sh=footing&l=216&n=3`: ratio of length to `footingWidth`, label `18 ft`, width label, depth note and count mark `3`; column 12 in, 8 ft, count 2: circle of fixed radius 60 with a horizontal diameter line labelled `12 in`, notes `8 ft` and `2`; metric labels; hand-verified coordinates for each; the shape selector returns `null` for `steps` until S6. Verify: `npm test -- apps/web/src/calculator/concrete/plan` fails (module missing).
- [ ] 7.3 [GREEN] `apps/web/src/calculator/concrete/plan.ts`: pure `planOf(moment)` selected by `shape`; `slab`/`footing` through `fitRectangle`; `column` circle; notes as `{ message, fills }` labels (`drawing.<shape>.note`) and language-free count mark `× n` when n > 1. Verify: 7.2 passes.
- [ ] 7.4 [REFACTOR] The four commands. Coverage 100 % on `plan.ts` (`npm run test:coverage`); `rg -n "document|window" apps/web/src/calculator/concrete/plan.ts` is empty.
- [ ] 7.5 Gates and measure: `npm run build && npm run check:site`; dist diff against `<scratch>/dist-prev` empty; ES full-length unchanged; shortstat of S5.
- [ ] 7.6 Negative proofs: swap length and width in the slab plan (the ratio case fails); drop the count mark rule (the footing case fails); change the column radius (the table fails); revert each.
- [ ] 7.7 Exit: SX1–SX5. SX4: `packages/core packages/data` empty.

### S6 — Steps geometry

Forecast 200–260. Specs: blueprint-drawing [BD7], [BD3]. Shard impact: none. Green because: still undeclared.

Commit: `feat(web): add the concrete steps geometry`.

- [ ] 8.1 [RED] `apps/web/src/calculator/concrete/plan.test.ts` (edit) [BD7]: `steps` with rise 7 in, run 11 in, 4 steps returns a profile of 4 treads (each `run` long and `rise` tall) clamped like a rectangle on the outer `n·run` × `n·rise`, the rise line labelled `7 in` and the run line `11 in` on the first tread, the step count `4` in the note; a many-steps case stays inside the frame; metric labels; the selector no longer returns `null` for any of the four shapes ([BD8] unit half). Verify: `npm test -- apps/web/src/calculator/concrete/plan` fails.
- [ ] 8.2 [GREEN] `apps/web/src/calculator/concrete/plan.ts`: the steps profile as one `path` outline plus the two dimension lines. Verify: 8.1 passes.
- [ ] 8.3 [REFACTOR] The four commands; coverage 100 % on `plan.ts`.
- [ ] 8.4 Gates and measure: `npm run build && npm run check:site`; dist diff empty; shortstat of S6 and of S5 + S6.
- [ ] 8.5 Negative proofs: use `rise` for the run line label (the table fails); let the profile ignore the clamp (the many-steps case fails); revert each.
- [ ] 8.6 Exit: SX1–SX5. SX4: `packages/core packages/data` empty.

### S7 — Draw the concrete plans

Forecast 300–370. Specs: blueprint-drawing [BD8], [BD14], [BD15], [BD19], [BD20], [BD21] (restored `sh=column`, `sh=steps`), [BD22]; calculator-web-core [CWC43] (concrete graph); calculator-page [CP76] (concrete), [CP77], [CP86]; i18n-catalog [ICW20] (concrete 8 keys), [ICW21]; site-quality [SQ38] (tip 3), [SQ41], [SQ42]. Shard impact: none (`packages/i18n` catalogs only). Green because: the slot, the box, the entry hook, the keys and the e2e `drawing` group land together, so the [SQ42] contract holds.

Commit: `feat(web): draw the concrete plans`.

- [ ] 9.1 [RED] `apps/web/src/calculator/concrete/controller.test.ts` (edit) [BD8, CWC41]: through `controllerOf` each of the four shapes returns a plan (labels resolved through the messages: name and note per shape), `View.plan` is never `null` for concrete, and `abc` keeps the previous plan. Verify: `npm test -- apps/web/src/calculator/concrete/controller` fails (slot undeclared).
- [ ] 9.2 [RED] Catalog and markup tests [ICW20, ICW21, CP76, CP77, BD22]: `calc.concrete.page.drawing.{slab,footing,column,steps}` and `….note` (8 keys per locale) in EN and ES with equal placeholder sets and no unit symbol; the `EnglishKeys` and page-key unions include them; the concrete pages render one empty `aria-hidden` box after `.calc-primary` and before `dl.calc-rows`; figures equal [CP15]; the head `<style>` of concrete holds the drawing rule and `calculator.css` none. Verify: `npm test -- apps/web/src/lib apps/web/src/components/calculator packages/i18n` and `npm run typecheck` fail.
- [ ] 9.3 [RED] Entry contracts (derived, no edit) [CWC43, CP48, SQ41]: the concrete entry imports `../draw.ts`, its graph reaches `slots/drawing.ts` and `concrete/plan.ts`, stays at most 49,152 B (forecast about +5 KB on 39,164 B), and no catalog text of either locale appears in any bundle ([ICW22]). Verify: `npm test -- apps/web/src/contract` fails.
- [ ] 9.4 [RED] `apps/web/src/contract/drawing-record.contract.test.ts` stays as written: after the module declares `drawing`, it fails naming `concrete` until the record declares the group. Verify: `npm test -- apps/web/src/contract/drawing-record` fails.
- [ ] 9.5 [RED] e2e: `tooling/site-browser/e2e/concrete-pages.ts` gains the `drawing` group (labels per shape, the clamp inputs, widths); `drawing.spec.ts` runs [BD9]–[BD11], [BD14], [BD15], [BD17], [BD20], [BD23], [BD25] for concrete, including the restored links `?v=1&sh=column` and `?v=1&sh=steps` ([BD21] no shift), a shape switch that keeps the box and the next element's top unchanged, the longest accepted labels at 320 px ([BD14] after `document.fonts.ready` and with the fonts blocked), and axe 0 in every drawn state in both locales. Verify: `npm run build && npm run test:e2e -- drawing.spec` fails.
- [ ] 9.6 [GREEN] `apps/web/src/calculator/concrete/page.ts` (`drawing: { frame: { width: 300, height: 200 }, plan: planOf }`), `apps/web/src/client/entries/concrete.ts` (`mount(page, { draw })`), `packages/i18n/src/catalogs/{en,es}/concrete.ts` (8 keys each; ES neutral tú), `lib/i18n-contract.test-d.ts` (the drawing key union). Verify: 9.1, 9.2, 9.3 pass.
- [ ] 9.7 [GREEN] Record and docs: `concrete-pages.ts` `drawing` group; `AGENTS.md` and `docs.contract` tokens only if the recipe text changed. Verify: 9.4 passes; `npm run typecheck --prefix tooling/site-browser`.
- [ ] 9.8 [REFACTOR] The four commands, with `npm run typecheck --prefix tooling/site-browser`.
- [ ] 9.9 Gates and measure ([CP86], [SQ38]): `npm run build && npm run check:site && npm run test:e2e && npm run lighthouse`; ES concrete full-length at the PR 3 tip at most 40,836 B (forecast 40,748 B, about 88 B margin), exact figure and margin recorded; concrete entry graph against 49,152 B and page weight against 196,608 B; shortstat of S7. If over the pin, apply the fallbacks in order (note templates reduced to the count mark, then a shorter `.calc-share` rule, then ask the owner); never raise the budget or the pin.
- [ ] 9.10 **Linux gate (orchestrator-owned).** On the `site-browser` CI job (Linux Chromium) at the PR 3 tip: [BD14] label collision after `document.fonts.ready` and with the fallback font, [BD20], [BD21] on restored `sh=column` and `sh=steps`, `layout.spec.ts`, Lighthouse CLS at most 0.01. The orchestrator records the run id and conclusion here. If Linux shows a measured width above the estimate, the factor `0.56` is raised in S1a's constant by a scoped correction (the one allowed), never by loosening the assertion.
- [ ] 9.11 Negative proofs: make `page.ts` return `null` for `steps` (the [BD8] case and the restored-link e2e fail); drop one ES note key (ICW20 fails naming the key); leave the concrete record without the group (the [SQ42] contract fails naming `concrete`); put the box before `.calc-primary` on concrete (the order test fails); revert each.
- [ ] 9.12 Exit: SX1–SX5. SX4: `packages/core packages/data` empty.

### PR 3 group tasks

- [ ] P3.1 Tip checks: `git log main..HEAD --oneline` shows S5, S6, S7 only; `git diff --stat main -- packages/core packages/data` empty; CI/stryker paths unchanged; record `--shortstat main..HEAD`.
- [ ] P3.2 `npm run verify`; `npm run build && npm run check:site && npm run test:e2e && npm run lighthouse`; ES concrete full-length at the S5, S6, S7 tips (all at most 40,836 B); both entry graphs; e2e count; `site-browser` wall time.
- [ ] P3.3 Exit: GX1–GX6. PR body: scope (concrete geometry for four shapes, slot declaration, entry hook, 8 keys per locale, e2e group), forecast vs actual (S5 300–370, S6 200–260, S7 300–370), the ES full-length size and margin at the tip, scenario ids (BD4–BD8, BD14, BD15, BD19–BD22, CWC43, CP76, CP77, CP86, ICW20, ICW21, ICW22, SQ38 tip 3, SQ41, SQ42, SQ44), negative-proof evidence, Linux CI run id, rollback (revert PR 3 removes concrete geometry, slot declaration and keys). Chain Context: PR 3 of 3, start state the PR 2 tip, end state both live pages drawn, prior dependencies PR 1 and PR 2, follow-ups (Copy list, Print, shopping list in the share text, drawings for future calculators), out of scope raising any budget. **Pushing, CI, the four reviewers, Judgment Day, the PR and the merge belong to the orchestrator, not to apply.**

---

## Final — Change-level checks

- [ ] F.1 After PR 3 merges: `git diff --stat <pre-change main> -- packages/core packages/data` is empty; `RELEASED` and `REGISTRY` untouched; no budget or pin raised (SQ7 40,960 B, CP66 40,836 B, 49,152 B, 196,608 B); `end-state.contract.test.ts` unchanged (no new page).
- [ ] F.2 `apply-progress.md` lists per slice the forecast vs actual lines, scenario ids proven, each negative proof run and reverted, the measured sizes (ES concrete full-length per slice tip, S3 measured trim and the gate verdict, rectangle-area sizes, entry graphs, e2e count) and the Linux CI run ids of 4.8, 6.11, 9.10.
- [ ] F.3 Archive-ready: delta specs synced to `openspec/specs/` at archive time (blueprint-drawing new; calculator-web-core, calculator-page, site-quality, i18n-catalog); `docs/design/direction.md` carries "Helper line `#B9C6DA`"; `reviewGate` present for the archive report.

---

## Traceability: spec scenario → slice, tasks

| Scenario | Slice | Tasks |
|---|---|---|
| BD1, BD2, BD12 | S1a (mechanism), S2a | 1.2, 3.1 |
| BD3, BD13 | S1a, S5, S6 | 1.3, 1.7, 7.4, 8.3 |
| BD4–BD7 | S5, S6 | 7.2, 8.1 |
| BD8 | S1b (null rule), S7 | 2.1, 9.1 |
| BD9, BD10, BD11 | S1b (spy), S2a (unit), S2b (e2e), S7 | 2.1, 3.1, 4.3, 9.5 |
| BD14 | S2b, S7 (Linux) | 4.3, 4.8, 9.5, 9.10 |
| BD15, BD16, BD17 | S2a, S2b, S7 | 3.2, 3.4, 4.3, 9.5 |
| BD18 | S1b (unit), S2b (e2e) | 2.2, 4.3 |
| BD19 | S1b (`nodesOf`), S2a (markup), S2b (e2e) | 2.2, 3.2, 4.3 |
| BD20, BD21 | S2b, S7 | 4.3, 9.5, 9.10 |
| BD22 | S2a, S7 | 3.3, 9.2 |
| BD23, BD25 | S2b, S7 | 4.3, 9.5 |
| BD24 | S1b | 2.5 |
| CWC41 | S1b, S7 | 2.1, 9.1 |
| CWC42, CWC43 | S1b, S2a, S7 | 2.3, 3.5, 9.3 |
| CWC44, CWC45 | S1b | 2.4, 3.2 |
| CWC46, CWC47 | S4 | 6.1, 6.3 |
| CP48 | S1b, S2a, S7 | 2.3, 3.5, 9.3 |
| CP76, CP77 | S2a, S7 | 3.2, 9.2 |
| CP12, MODIFIED hooks | S3 | 5.2, 5.4 |
| CP78–CP85 | S4 | 6.1–6.5, 6.8 |
| CP86 | S3 (gate), S4, S7 | 5.9, 6.10, 9.9 |
| ICW19, ICW21 (share) | S4 | 6.4 |
| ICW20, ICW21 (names) | S2a, S7 | 3.4, 9.2 |
| ICW22 | S4, S7 | 6.3, 9.3 |
| SQ38 | every tip | 1.1, 5.9, 6.10, 9.9 |
| SQ39 | S3 | 5.8 |
| SQ40 | S2a | 3.10 |
| SQ41 | S1b, S2a, S4, S7 | 2.5, 3.10, 6.3, 9.3 |
| SQ42 | S2b, S7 | 4.1, 4.4, 9.4 |
| SQ43 | S4 | 6.5 |
| SQ44 | S2b, S4, S7 | 4.7, 6.10, 9.9 |

---

## Risks and deviations the apply must know

1. **The concrete margin is thin.** Forecast at PR 3 is about 88 B under 40,836 B. The S3 measurement gate (5.9) runs before S4 is sliced. The design rule stops when `size_after_S3 + 896 > 40,836` (trim under 738 B), which is stricter than "S4 alone fits" (`size_after_S3 + 340`). Apply uses the stricter rule and reports both numbers. Never raise the budget.
2. **S1b is the largest unit risk.** It crosses controller, writer, mount and three contract tests. The split rule makes tasks 2.3–2.5 a tests-only `S1c` in PR 1 if it measures over 400.
3. **S2a precedes the [SQ42] contract.** The contract and the record land in S2b, so the S2a tip has a drawn page without a `drawing` group by design (the contract does not exist yet). The PR is never merged at the S2a tip.
4. **S5 and S6 add dead geometry** until S7. Each is green on its own tests; PR 3 is never merged partial.
5. **The DOM writer has no unit test.** `draw()` application, reveal, `href` rewrite and aria-label changes are proven by e2e only (S2b, S4, S7), plus `nodesOf`, the markup contract and the static lookup proof.
6. **Linux can differ from macOS** (lesson of square-footage): label widths (the 0.56 em estimate), `.calc-copy` min-height and the seven-width fits are confirmed by the PR's `site-browser` CI run before merge; the orchestrator owns the run.
7. **Hook change in the trim.** `data-hint-row` is removed in S3, so the Public DOM hooks table, the slot-free absent-hook list and the hint-row e2e queries move together (5.4).
8. **Share base must stay out of the bundle.** `data-share` carries `https://wa.me/`; any literal in a bundle fails `client-entry.contract.test.ts:39-41`.
