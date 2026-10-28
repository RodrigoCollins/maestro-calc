# Apply progress: blueprint-panel

## PR 1 (`feat/blueprint-panel`): S1a, S1b, S2a, S2b done

Mode: strict TDD (`npx vitest run <path>`, `npm test`). Nothing was pushed. Pushing, CI, the four reviewers, Judgment Day, the PR, the merge and the Linux confirmation (task 4.8) belong to the orchestrator (P1.3).

### Baseline (task 1.1, main `05de1f7` plus the planning commits, tip `f25fc41`)

| Measure | Value |
|---|---|
| `npm run verify` | exit 0; 212 test files, 3,907 tests |
| ES concrete full-length proof ([CP66]) | 40,678 B of 40,836 B (EN 40,389 B) |
| rectangle-area full-length ([SQ34]) | EN 34,122 B, ES 34,159 B (headroom 6,838 B and 6,801 B) |
| JS entry graphs (built `dist`) | concrete 39,164 B, rectangle-area 33,803 B (limit 49,152 B); library builds 39,674 B and 34,050 B |
| Built HTML | concrete EN 31,750 B, ES 33,753 B; square footage EN 25,155 B, ES 26,593 B |
| e2e (`npm run test:e2e`) | 489 passed |

The baseline `dist` was copied to the session scratchpad (`dist-prev`) for the dist diffs below.

### Commits (oldest first; `openspec/` excluded; `git diff -M --shortstat <parent> <commit>`)

| Slice | Commit | Subject | Changed lines |
|---|---|---|---|
| S1a | b0a2b6d | feat(web): add the drawing slot and its geometry | 339+ / 1- (340) |
| S1a2 | 9fad9ba | feat(web): lay out the rectangle plan | 258+ (258) |
| S1b | a1ae7c9 | feat(web): resolve plans in the controller | 125+ / 4- (129) |
| S1b2 | f7a8ce0 | feat(web): inject the SVG writer into the mount | 295+ / 8- (303) |
| S1c | 2a2a83a | test(web): guard the injected writer in the entry contracts | 156+ / 10- (166) |
| S2a | ab00df9 | feat(web): draw the square footage plan | 371+ / 21- (392) |
| S2a2 | 2f759c5 | fix(web): size the drawing labels by their measured line box | 50+ / 45- (95) |
| S2b | 642be9b | test(e2e): declare the square footage drawing record | 154+ / 5- (159) |
| S2b2 | 7aea812 | test(e2e): record the square footage drawing | 320+ / 2- (322) |

### Forecast vs actual

| Slice | Forecast | Actual | Note |
|---|---|---|---|
| S1a | 280-330 | 340 + 258 = 598 | split: see deviation 1 |
| S1b | 300-360 | 129 + 303 + 166 = 598 | split into S1b, S1b2 and S1c (the planned S1c) |
| S2a | 280-340 | 392 + 95 = 487 | the 95 are the measured line-box fix (deviation 3) |
| S2b | 200-260 | 159 + 322 = 481 | split: record, then the suite |
| PR 1 | 1,060-1,290 | **2,070** (2,021+ / 49-, `git diff -M --shortstat f25fc41..HEAD -- . ':(exclude)package-lock.json' ':(exclude)tooling/site-browser/package-lock.json' ':(exclude)openspec/'`) | every commit at most 400 |

`openspec/` planning lines on their own line: 9 files, 1,217 insertions (`main..f25fc41`), plus this record and the task marks. SX4: `git diff --stat main -- packages/core packages/data .github` is empty at every commit (mutation N/A); `packages/i18n` changed (rectangle-area catalogs and their tests), not a Stryker shard.

### Deviations

1. **Split rule applied by measurement, functional halves instead of tests-only halves.** The coverage gate holds `apps/web/src/calculator/**` at 100 %, so geometry code cannot land without its unit tests; a tests-only half would leave the code commit red. S1a became the slot type and core geometry (`clampedRatio`, `fitRectangle`, `dimensionLine`, `textWidth`, `labelBox`, `fitLabel`) with their table tests (340), then S1a2 the rectangle layout (`rectangleGutters`, `rectanglePlan`) with its tables and the [BD13] property test (258). S1b became controller plans (129), writer plus mount hook plus the client-hygiene file list (303, the hygiene list must move with `draw.ts`), then S1c, the planned contract-only slice (166). S2b became the record type, group, [SQ42] contract and recipe (159), then the e2e suite (322). Every commit was checked alone (typecheck, lint, the affected tests) before the next.
2. **`rectanglePlan` and `rectangleGutters` live in `slots/drawing.ts`** (design named only `fitRectangle` and `dimensionLine`), so the label-collision property ([BD12], [BD13]) is proven once on the generic layout and concrete's slab and footing can reuse it in PR 3. `apps/web/src/calculator/rectangle-area/plan.ts` only maps the moment to numbers and texts.
3. **Label box height is 1.25 sizes, not the 17-unit row of design B5.** The e2e [BD14] run measured Barlow Condensed at 1.24 sizes (`getBBox` 21.1 at 17, 18.75 at 15), so a top label at the design's 17-unit row poked 0.35 units above the box (`"1 ft" leaves the drawing`). Fixed in S2a2 (`LINE = 1.25`, labels centred with `dominant-baseline="central"`); top gutter 41.3, bottom row 27.3. The hand tables were re-derived; two floating-point ties are noted in the tests (164.25 and 185.55 round down).
4. **The left gutter holds the width label of both unit systems** (`RectangleSpec.widest`), so the unit toggle moves no coordinate ([BD11]); with the label of one system only, `10 ft` and `3.05 m` would give different gutters.
5. **`DrawingSlot` carries `messages`** (the page-key suffixes its labels name, like `AnswerSlot.templates`), so `page-view.ts` puts exactly those entries in the inert template and a missing key throws `PAGE_KEY` naming it ([ICW20]).
6. **`ResolvedPlan` carries the `frame`** (the controller copies `drawing.frame`), so `nodesOf` draws the 16-unit grid without reading the DOM. `Draw` takes an `Element`; the namespace is `box.namespaceURI`.
7. **The area label is a 15-unit note in the helper colour** (`#B9C6DA`), as in the mockup, not a 17-unit white label; the inside rule (`width <= rw - 12`, `rh >= 29`) is unchanged.
8. **Concrete HTML is not byte-identical to `main`: only the hashed script names differ** (same length, same bytes: 31,750 B EN, 33,753 B ES; the comparison with the hashes masked is identical). The controller and the mount are shared, so the concrete graph grows 456 B (39,164 to 39,620 B) by the plan resolution and the `[data-drawing]` list lookup; the writer and the geometry are in the square footage chunk only (`createElementNS`, `dominant-baseline` and `stroke-dasharray` appear in `RectangleAreaScript…js` and in no shared chunk). Tasks 2.10 and 3.10 expected an empty concrete diff; that cannot hold once `controller.ts` changes.
9. **[BD21] CLS is proven by the existing `layout.spec.ts` load sweep** (27 widths, both locales, with and without a state), which now loads the box; `drawing.spec.ts` does not repeat it. The Lighthouse representatives are the home, methodology and concrete pages, so Lighthouse does not audit the square footage page.
10. **[BD23] no-script axe runs with the page script refused** (`**/_astro/*.js` aborted, as `calculator.spec.ts` does), because axe itself needs JavaScript; the [BD20] size check uses `javaScriptEnabled: false`.
11. **Negative proof 4.9 (factor 0.56 to 0.4) fails only with the fallback font** (`"30,479.97 m" is 75.46 wide, over 74.8`); Barlow Condensed measures about 0.30 sizes per character, so the web-font run still passes at 0.4. A factor of 0.25 fails both runs. `drawing.spec.ts` reads `CHAR` from the geometry module, so the estimate is never a second constant.

### TDD cycle evidence

| Task | RED (seen failing, right reason) | GREEN | REFACTOR |
|---|---|---|---|
| 1.2-1.3 | `slots/drawing.test.ts`, `drawing.property.test.ts`: `Cannot find module './drawing.ts'` | `slots/drawing.ts`; 47 tests pass | format, lint, typecheck, coverage 100 % on `drawing.ts` |
| 1.4 | `page-module.test-d.ts`: `has no exported member 'Frame'`, `Property 'drawing' does not exist` | `Frame`, `DrawingSlot`, `drawing?` | same |
| 2.1 | `controller.test.ts`: 4 failed (`view.plan` absent); the no-slot case green on arrival (break-the-code NP2) | `View.plan`, `planOf` | same |
| 2.2 | `client/draw.test.ts`: `Cannot find module './draw.ts'` | `client/draw.ts` | same |
| 2.3-2.5 | 7 failed: hygiene file list, writer build `ENOENT`, `createElementNS` scan, seeded writer cases; lookup exclusions green on arrival (NP3 breaks them) | `draw.ts`, `mount.ts` hook | same |
| 3.1-3.4 | `plan.test.ts` module missing; panel box 3 failed; `drawingCss is not a function`; page-view 2 failed; catalog 5 failed; typecheck errors | `plan.ts`, `page.ts`, panel, `page-view.ts`, `reserve.ts`, `pages.ts`, catalogs | same, plus one lint fix (unused destructures) |
| 3.5 | entry-graph derived: became red when `page.ts` declared `drawing` before the entry imported `draw.ts` | `entries/rectangle-area.ts` | same |
| 4.1 | `drawing-record.contract.test.ts`: rectangle-area named | group in `rectangle-area-pages.ts` | same |
| 4.2 | `tsc` (site-browser): `'drawing' does not exist in type 'E2eSpec'` | `E2eDrawing` | same |
| 4.3 | `drawing.spec.ts`: 2 failed (box on a page without the group) | record group; then 6 failed on measured label boxes, fixed by S2a2 | `npm run typecheck --prefix tooling/site-browser` |

### Work unit evidence

| Unit | Focused test command and result | Runtime harness | Rollback boundary |
|---|---|---|---|
| S1a/S1a2 | `npx vitest run apps/web/src/calculator/slots/drawing apps/web/src/calculator/page-module`: 4 files, 47 tests pass | N/A (no page imports it); `npm run build && npm run check:site` green, dist identical to baseline | `page-module.ts` slot type, `slots/drawing.ts` and its tests |
| S1b/S1b2/S1c | `npx vitest run apps/web/src/calculator apps/web/src/client apps/web/src/contract`: 1,272 tests pass at S1b2 | `npm run build && npm run check:site` green; HTML equal modulo hashed script names | `controller.ts` plan, `client/draw.ts`, `mount.ts` hook, four contract edits |
| S2a/S2a2 | `npx vitest run` (whole suite): 216 files, 3,987 tests pass | build shows the box and head style on the two square footage pages only | `rectangle-area/plan.ts`, `page.ts`, entry, panel, `page-view.ts`, `pages.ts`, `reserve.ts`, catalogs |
| S2b/S2b2 | `npm run test:e2e -- drawing.spec`: 33 passed | `npm run build && npm run test:e2e`: 522 passed | record group, `drawing.spec.ts`, contract, AGENTS.md |

### Scenario ids proven

- blueprint-drawing: [BD1] (unit tables, e2e default labels), [BD2], [BD3] (CWC9 scan, coverage 100 %), [BD9] (unit and e2e), [BD10] (controller sequence, e2e keep-last with `—`), [BD11] (unit coordinates, e2e relabel), [BD12], [BD13] (property, 1,000 runs each), [BD14] (e2e at 320 px, web and fallback fonts, macOS; Linux pending 4.8), [BD15] (catalog, page-view, e2e name), [BD16] (panel unit, e2e), [BD17] (e2e: two renames for `''`, `1`, `15`), [BD18] (unit: swatches equal `direction.md`, 4.5:1 on ink; e2e axe in default and typed states), [BD19] (`nodesOf`, markup, e2e role and `aria-hidden`), [BD20] (e2e, seven widths, with and without script, three queries), [BD21] (`layout.spec.ts` sweep), [BD22] (`pages.test.ts`), [BD23] (e2e), [BD24] (writer build scan, namespace scan, seeded), [BD25] (e2e).
- calculator-web-core: page-module drawing row, [CWC41], [CWC42], [CWC43], [CWC44], [CWC45].
- calculator-page: [CP48] MODIFIED (derived import rule, seeded both ways), [CP76], [CP77] (figures and markup byte-equal with the box removed, EN and ES).
- i18n-catalog: [ICW20], [ICW21] (rectangle-area).
- site-quality: [SQ38] tip 1 (40,678 B), [SQ40], [SQ41], [SQ42] (contract plus browser check), [SQ44] partial (CLS sweep, axe, Lighthouse on its representatives).

### Negative proofs (applied, run red, reverted; the tree compared clean after each)

S1a (1.8):
1. `CLAMP = 5`: 5 failed (`is the true ratio inside the clamp…`, `draws 100 by 1, clamped`, `draws 1 by 100, clamped`, `draws 100 ft by 1 ft at the clamp…`, zero sides).
2. Swap symmetry dropped (`Math.max(length / width, 1 / CLAMP)` for the short side): `× gives exactly the inverse ratio when the sides swap`.
3. `document.title` read in `drawing.ts`: `× apps/web/src/calculator/slots/drawing.ts reads no document, window or navigator…`.

S1b (2.11):
1. `mount.ts` imports `./draw.ts` as a value: 4 failed (`is not reached from the generic mount`, `is imported by no source but the entries`, the graph reach of both entries).
2. A plan for an invalid state (`result === undefined` guard removed): `× gives a plan for the default, 20 ft and 15 ft, and none while abc is typed`, `× gives null for a state the page does not draw`.
3. `find(root, '[data-drawing]')` in the mount: 11 failed in `slot-free-proof`, including `looks up neither the drawing box nor the share link with a throwing lookup`.
4. `box.innerHTML = ''` in `draw.ts`: `client-hygiene` and `[BD24] holds no HTML string…` failed.
5. Orange `#F06A1E`: `× takes white, safety orange and the helper line from the direction table` and the node list.

S2a (3.11):
1. Box before `.calc-primary`: `× renders one empty aria-hidden svg box between the large figure and the rows`.
2. `role="img"` on the server box: same case fails.
3. `background:linear-gradient(…)` in `drawingCss` (rebuilt): `× carries no .home- selector and no gradient on any page but the homes` and the `pages.test.ts` rule.
4. ES `drawing` key removed: 5 catalog tests failed and `tsc`: `does not satisfy the expected type 'CatalogOf<…>'`.
5. `drawing` declared on the slot-free module: `× has no slot element…` ([CWC45]) and the page-view message order.

S2b (4.9):
1. Estimate factor 0.4: `fits the longest labels at 320 px with the fallback font` failed in both locales (`"30,479.97 m" is 75.46… wide, over 74.8`); 0.25 fails the web-font run too (deviation 11).
2. `style="width:200px"` set by `draw` (rebuilt): 8 failed (`keeps the box size…` at every query, `draws with no CSP violation and no inline style`).
3. `aria-live="polite"` on the box (rebuilt): unit `× puts the box in no live region`; e2e `× is no live region and renames only on a valid change while typing` (EN, ES).
4. Record group renamed: `× declares the drawing group…` naming `rectangle-area: the page module declares the drawing slot and its browser record has no drawing group`.

### Measurements (PR 1 tip `7aea812`)

| Measure | Before | After | Budget |
|---|---|---|---|
| ES concrete full-length ([CP66], [SQ38]) | 40,678 B | **40,678 B** | pin 40,836 B |
| EN concrete full-length | 40,389 B | 40,389 B | 40,960 B |
| rectangle-area full-length EN / ES ([SQ40]) | 34,122 / 34,159 B | **34,380 / 34,419 B** (headroom 6,580 / 6,541 B) | 40,960 B |
| Built square footage HTML EN / ES | 25,155 / 26,593 B | 25,413 / 26,853 B (+258 / +260: box 66 B, head rule 140 B, template entry) | 40,960 B |
| rectangle-area JS graph (built, [SQ41]) | 33,803 B | **38,220 B** (entry chunk 4,823 B with writer and plan, mount chunk 33,397 B) | 49,152 B |
| concrete JS graph (built) | 39,164 B | 39,620 B (mount chunk only) | 49,152 B |
| Library builds (client-entry contract) | 39,674 / 34,050 B | 40,114 / 38,548 B | 49,152 B |
| Calculator page weight (largest, ES concrete) | 162,927 B | 163,383 B | 196,608 B |
| CSS (largest, square footage) | 7,813 B | 7,953 B | 20,480 B |
| e2e | 489 passed | **522 passed** (3.3 min) | |

### Dist diff against the baseline (3.10)

Changed: the two square footage pages (box after `.calc-primary`, `[data-drawing]` head rule after the reserve, the `drawing` template entry, the script name), the two concrete pages (hashed script names only, bytes equal), and the three script chunks (`mount`, `ConcreteScript`, `RectangleAreaScript`). Nothing else differs.

### Gates (tip `7aea812`)

- `npm run verify`: exit 0 (217 files, 3,999 tests; coverage thresholds met; `check:site`, `check:dist` green). No timeout in an untouched package.
- `npm run build && npm run check:site && npm run test:e2e`: exit 0, 522 passed.
- `npm run lighthouse`: exit 0 (six representatives; the square footage page is not one of them).
- `npm run typecheck --prefix tooling/site-browser`: clean.

### Screenshots (macOS Chromium, built site via `astro preview`)

Scratchpad of the session: `sqft-final-{en,es}-{390,1280}.png` (default), `sqft-final-tall-*` (10 ft by 20 ft, area in the bottom row), `sqft-final-longest-*` (99,999 ft 11 63/64 in both sides), and the pre-fix `sqft-{clamp,metric,long,tall}-*`. Labels are legible (17 units render at about 17.5 px at 390 px), nothing overlaps or clips. At 1280 px the box stops at its 24rem cap on the left of a wide panel.

### Linux gate (task 4.8, orchestrator-owned)

Request: run the `site-browser` CI job on the PR 1 tip; `drawing.spec.ts` ([BD14] both font runs, [BD20]) and `layout.spec.ts` ([BD21]) must pass on Linux Chromium. Local command: `npm run build && npm run test:e2e -- drawing.spec layout.spec`. Not confirmed until the orchestrator records the run id here. Watch item: the fallback-font run assumes Linux resolves the metric-adjusted Arial fallback or Liberation Sans; a DejaVu fallback would be wider than 0.56 sizes per character for digit-heavy labels.
