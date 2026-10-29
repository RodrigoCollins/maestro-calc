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

## PR 1 correction round (on `575475f`)

One scoped round after the owner's screenshots and the review. Strict TDD (each test seen red first), no history rewritten, nothing pushed.

| Finding | Done | Commit |
|---|---|---|
| MAJOR desktop: at 1280 px the drawing is a 24rem box on the left of a wide panel | From 48rem the panel is a grid in the square footage head CSS (`drawingCss`, `reserve.ts`): `minmax(0,1fr) minmax(0,1.25fr)`, rows `auto auto auto 1fr`, the box in column 2 across rows 1-4 (`grid-row:1/-1`), so the slack goes to the last row and the left column keeps its spacing. `calculator.css` is untouched. 767 px added to `WIDTHS` of `layout.spec.ts` and `drawing.spec.ts`; the styles contract now checks the whole head style of every row (reserve and drawing) for both edges. New e2e: beside the rows and wider than them at 768 and 1280 px, under the large figure at 767 px. The server box equals the mounted box at every width (the [BD20] sweep, now 8 widths) | 4cdf54e |
| MAJOR primary figure indented by `min-width:8ch;text-align:right` | `display:inline-block` removed from `.calc-figure`: the row, cost and shopping figures are flex items (blockified), so they keep the fixed right-aligned cell; the large figure is inline, where `min-width` does not apply, so it sits flush. Byte-negative (−21 B). Contract and a new e2e on every page (figure width equals its digits) | a86c953 |
| Fallback font wider than the 0.56 estimate; font runs could pass vacuously; CI fallback set not deterministic | `CHAR` 0.67, from measured advances: DejaVu Sans Bold worst label `<0.01 cm` 0.661, `1.00 m` 0.643; Liberation Sans Bold / Arial Bold 0.536; Barlow Condensed 600 0.412. A unit test runs every label the page writes (both systems, zero to the longest) through the DejaVu Sans Bold and Liberation Sans Bold advance tables. The [BD14] runs assert the Barlow Condensed 600 face: `loaded` and `document.fonts.check` true with the web fonts, `error` and false in the fallback run. CI installs `fonts-dejavu-core fonts-liberation` on every run before the browser tests (contract test). Hand tables re-derived | ab002f8 |
| Unit toggle could move the area note | `RectangleSpec.others` (the texts of the other system) replaces `widest`: the gutter, the inside-or-below decision and the fitted `x` of the top label and the note all use the longest text of either system. Unit: 32 ft square (1,024.00 ft² below, 95.13 m² alone would fit) and 25 ft × 40 ft; e2e: both links toggled, label positions now part of the compared shape | e9b134f |
| Label colour from `size === 17` | `PlanLabel.tone: 'dimension' \| 'note'`, the writer's `FILLS` by tone (a seeded 15-unit dimension label proves it) | e9b134f |
| Shared area helper for PR 3 | `areaLabel(frame, box, text, room?)` in `slots/drawing.ts`, with its own table | e9b134f |
| Grid rebuilt on every redraw | The grid path stays the first child; a redraw removes and appends only the nodes after it (e2e: same node, old label detached) | 6bfb496 |
| `checkModule` did not check the plan's messages | The default plan's name and labels that are messages must be in `drawing.messages`, else `PAGE_KEY` naming the message at creation (and so at build) | 19e05be, 9a214a8 |
| [CP77] four hand-verified cases | Gap recorded: the server renders the default state only, so the unit test stays on the default (EN, ES, byte-equal without the box). The four states with the box present are proven by `calculator.spec.ts` "loads the state …" (4 states × 2 locales) | — |
| [BD16] the answer is the only live region | e2e: the live regions of the page are exactly `.calc-answer` and the copy status, none inside `.calc-result` | 4a23ad1 |
| Rename count after the poll | Still 2 after 500 ms idle | 4a23ad1 |
| Exact `x` of the long top label | `179.8` (the label fits centred at 0.67, so it is not moved) with the rectangle at `163.4`, `32.8` | ab002f8 |
| Area note font (Barlow Condensed 600 vs mockup Barlow 500) | Deviation kept: Barlow 500 has no font file on the site (Barlow 400 and 600, Barlow Condensed 600 and 700 are the four woff2), a fifth file would cost a request and up to 30 KB for one note; the note keeps the label face at 15 units in the helper colour | — |

Commit note: 19e05be alone passes every test but misses the 100 % branch threshold of `apps/web/src/calculator/**` (the select branch of the new check, 99.68 %); 9a214a8 shares `choicesOf` with `start` and restores 100 %. History was not rewritten.

### Negative proofs (applied, run red, reverted; `git status --porcelain` clean after each)

1. `display:inline-block` restored on `.calc-figure` (rebuilt): the new e2e failed on all four pages (`Expected: 67.94, Received: 163.58`); the styles contract failed first (`expected 'inline-block' to be undefined`).
2. Head CSS without the 48rem block (the build before 4cdf54e): the placement e2e failed at `768 px` in both locales; 767 missing from `WIDTHS`: `(min-width:48rem): no width 767`.
3. `CHAR = 0.56`: the DejaVu Sans Bold table test failed with 16 labels over (`<1/64 in`, `0.00 cm`, `1,000,000.00 ft²`, …); fallback run with the fonts not blocked: the face assertion failed (`loaded`, not `error`).
4. Geometry before e9b134f (stashed): `keeps every coordinate on the toggle at 32 ft by 32 ft` failed; on the build before it, the e2e toggle failed at `?v=1&l=384&w=384`. 25 ft × 40 ft no longer discriminates at 0.67 (both systems put the note below); it stays as the owner's case.
5. Writer before 6bfb496: the grid identity e2e failed.
6. Without the plan message check: both `throws PAGE_KEY at creation …` cases failed (`the call did not throw`).
7. `aria-live="polite"` on `.calc-rows` (rebuilt): the [BD16] e2e failed naming `panel`.
8. CI step absent: `installs the fallback fonts on every run, before the browser tests` failed.

### Measurements (tip 9a214a8)

| Measure | Before (575475f) | After | Budget |
|---|---|---|---|
| ES concrete full-length ([CP66]) | 40,678 B | **40,657 B** (−21) | pin 40,836 B |
| EN concrete full-length | 40,389 B | 40,368 B | 40,960 B |
| rectangle-area full-length EN / ES | 34,380 / 34,419 B | 34,654 / 34,693 B | 40,960 B |
| Square footage head CSS (drawing part) | 140 B | 435 B (whole head style 779 B) | — |
| Built square footage HTML EN / ES | 25,413 / 26,853 B | 25,687 / 27,127 B | 40,960 B |
| Built concrete HTML EN / ES | 31,750 / 33,753 B | 31,729 / 33,732 B | 40,960 B |
| Concrete JS graph (built) | 39,620 B | 39,992 B (`checkModule` plan check, shared controller) | 49,152 B |
| CSS (largest, square footage) | 7,953 B | 8,227 B | 20,480 B |
| e2e | 522 passed | **534 passed** (3.5 min) | |

### Gates (tip 9a214a8)

- `npm run format`: no change. `npm run verify`: exit 0 (217 files, 4,013 tests, coverage thresholds met, `check:site`, `check:dist` green).
- `npm run build && npm run check:site && npm run test:e2e`: exit 0, 534 passed.

### Screenshots (macOS Chromium, `astro preview`)

Session scratchpad: `bp-fix-sqft-{en,es}-{390,768,1280}.png`, `bp-fix-concrete-{en,es}-{390,1280}.png`, and `bp-before-*-1280.png`. From 768 px the drawing fills the right column beside the figures; the large figure is flush left on every page. The wider estimate leaves more room left of the width label (the rectangle sits about 6 units further right than before), the price of never overlapping in DejaVu Sans.

Linux gate (task 4.8) still pending; the watch item above is now covered by the 0.67 estimate and the font install.

## PR 2 (`feat/blueprint-panel-share`): S3 and S4 done

Mode: strict TDD. Branch from main `dcc2c8b` (PR 1 merged), so no retarget is needed. Nothing was pushed. Pushing, CI, the four reviewers, Judgment Day, the PR, the merge and the Linux confirmation (task 6.11) belong to the orchestrator (P2.2, P2.3).

### Commits (oldest first; `openspec/` excluded; `git diff -M --shortstat <parent> <commit>`)

| Slice | Commit | Subject | Changed lines |
|---|---|---|---|
| S3 | aa12561 | refactor(web): trim the calculator markup | 106+ / 73- (179) |
| S4a | caafd97 | feat(web): share the calculation on WhatsApp | 200+ / 12- (212) |
| S4b | 55cc084 | test(e2e): record the WhatsApp share link | 190+ / 2- (192) |
| PR 2 | `main..HEAD` | | 496+ / 87- (**583**) |

Forecast vs actual: S3 200-260 → 179; S4 280-340 → 404 as one commit, so the split rule applied (S4a code with its unit and contract tests, S4b the browser record, `share.spec.ts`, the no-JS case and the record contract); PR 2 480-600 → 583. Each commit was checked alone: S4a ran format, lint, typecheck (both), `test:coverage` (4,031 tests, thresholds met), build, `check:site` and the whole e2e (534 passed); the tip tree is byte-identical to the tree that passed every gate below. SX4: `git diff --stat main -- packages/core packages/data .github` is empty (mutation N/A); `packages/i18n` changed (two site keys per locale), not a Stryker shard.

### S3 trim table (measured)

Baseline at `dcc2c8b`: ES concrete full-length proof **40,657 B** (EN 40,368 B), not the 40,678 B of the design (PR 1's correction round took 21 B with `.calc-figure`). Bytes per trim counted on the built `dist/es/calculadora-de-concreto.html` (33,732 → 32,906 B, −826); the sum equals the budget-test delta exactly.

| Trim | What | Count | Bytes | Hook/guard change |
|---|---|---|---|---|
| A | inputs drop `autocomplete="off"`, the form keeps it | 15 × 19 | −285 | `CalculatorField.test.ts`, `CalculatorForm.test.ts` (form carries it, no input sets one), e2e `calculator.spec.ts` [CP12] |
| B | `class="calc-choice"` → `.calc-form button` (4 selectors) | 12 × 20 − 20 | −220 | `styles.contract.test.ts` (target size on `.calc-form button`; no `.calc-choice` selector or `class="calc-choice"` in any `.astro`) |
| C | one `p.calc-cost` per cost: label, figure `[data-output][data-cost-row] hidden`, hint `[data-price-hint]`; the mount swaps the two spans; `.calc-hint` leaves the CSS | 2 rows + 11 B CSS | −218 | `data-hint-row` removed; `ResultPanel.test.ts`, `CalculatorBody.test.ts`, slot-free proof (mount looks up `'[data-cost-row], [data-price-hint]'`, no hint row), e2e `prices` group (figure visible after a price, both spans in one row) |
| D | the label span drops `class="calc-label"` | 3 × 19 | −57 | `ShoppingLine.test.ts`, `CalculatorBody.test.ts` (`.calc-shopping > span:first-child`, no `.calc-label`) |
| E | `<meta name="generator">` dropped | 1 | −46 | new `SeoHead.test.ts` case |
| **Total** | | | **−826** | |

Budget test after S3: ES **39,831 B** (−826), EN 39,549 B (−819); rectangle-area EN 34,519 B, ES 34,558 B (−135 each: A 2 inputs, B 3 buttons, E, the `.calc-hint` CSS).

### S3 measurement gate (task 5.9): continue

- [CP86] trim ≥ 700 B: 826 B. Pass.
- Design rule adjusted to the real baseline: `size_after_S3 + 340 (S4) + 556 (S7) ≤ 40,836` ⇔ trim ≥ 40,657 + 896 − 40,836 = **717 B**; 39,831 + 896 = 40,727 B, margin 109 B. Pass.
- Narrow rule (S4 alone): 39,831 + 340 = 40,171 ≤ 40,836. Pass.
- Verdict: **continue** to S4. No budget or pin was touched.

### [SQ39] neutrality (task 5.8)

Script (`node-html-parser`): visible text (text not under a `hidden` element, no script or style), the ids in order and every `aria-*`/`role` attribute in order, before (`dist` at `dcc2c8b`) and after S3. Equal on all four calculator pages: concrete 146 texts, 68 ids, 32 ARIA attributes per locale; square footage 110, 40, 13. `npm run test:e2e -- calculator.spec a11y.spec`: 181 passed. Dist diff: every HTML page (trim E), the four calculator pages (A-E where they apply) and the mount chunk; nothing else.

### S4 design notes and deviations

1. **The share link sits on a row of its own** under "Copy link" (`display:flex; width:fit-content`, `margin-top: var(--space-2)`), not inline after it. Inline, "Copiar enlace" plus "Enviar por WhatsApp" does not fit 288 px at 320 px, so the copy reserve would need a width breakpoint whose edge moves with font metrics (Linux differs). On its own row the block height is the same at every width: button 2.75 + 0.5 + link 2.75 + status 0.25 + 1.6 = 7.85rem, reserve **8rem** (was 5rem; method: the CSS sum, checked by the [CP61]/[CP84] probe of `layout.spec.ts` at its 28 widths on macOS; Linux pending 6.11). The mockup also puts WhatsApp on its own row; corners stay square like every site button, and the mockup's icon is left out (bytes).
2. **`shareHref` lives in `controller.ts`** as designed; its tests are in `calculator/concrete/controller.test.ts` (task 6.1 named the generic file) because they need a real concrete state and the real message template; the environment is `https://example.test` as [CWC46] says.
3. **The message is `share.text`**, after `copy.failed` in the template; the four message-order tests, the template count and the register count (15 → 17 site keys) moved with it.
4. **[CP84] uses the existing probe** (status set to `copy.copied`, as [CP61]); the failure status adds a read-only field and was never inside the reserve.
5. **[CP85]** is proven by the existing `layout.spec.ts` checks, which now run with the link revealed: load CLS at 28 widths with and without a state, and the reserved blocks plus the next element equal with and without the script. `share.spec.ts` does not repeat them.
6. **The `https://wa.me/` seeded case of the bundle check was green on arrival** (the existing foreign-origin gate already flags it); the share label and text joined `MESSAGES`, and the seeded share-text case was red until the keys existed.
7. Negative proof 1 (server `href`) fails the markup tests (unit and the no-JS e2e); it cannot fail the bundle check, which reads JavaScript only.

### TDD cycle evidence

| Task | RED (seen failing, right reason) | GREEN | REFACTOR |
|---|---|---|---|
| 5.2 | 3 failed: `expected true to be false` (inputs carry `autocomplete`) | trim A | format, lint (one `prefer-includes` fix), typecheck, coverage |
| 5.3 | 2 failed: `.calc-form button` has no `min-height`; 3 `.calc-choice` selectors | trim B | same |
| 5.4-5.5 | 7 failed across `CalculatorField`, `CalculatorForm`, `CalculatorBody`, `ShoppingLine`, `SeoHead`, `ResultPanel` | trims C-E, mount | same |
| 6.1 | 3 failed: `shareHref is not a function` | `shareHref` | same |
| 6.2-6.4 | 19 failed: catalog rows and counts, message orders, anchor markup, slot-free markup and lookup scan, bundle share text | catalogs, page view, model, form, mount | same; fixture `shareLabel` |
| 6.7 (CSS) | 2 failed: no `.calc-share` rule, reserve 5rem under the 7.85rem content | `.calc-share`, `.calc-copy` 8rem | same |
| 6.5 | e2e on the S3 build: 4 no-JS and every `share.spec.ts` case failed (no anchor) | after GREEN: 48 passed | `npm run typecheck --prefix tooling/site-browser` |

### Work unit evidence

| Unit | Focused test command and result | Runtime harness | Rollback boundary |
|---|---|---|---|
| S3 | `npx vitest run apps/web/src/components apps/web/src/contract/slot-free apps/web/src/styles apps/web/src/views`: 327 passed | `npm run build && npm run test:e2e -- calculator.spec a11y.spec`: 181 passed; [SQ39] script equal | `aa12561` (trim files and guards); revert restores the 40,657 B markup |
| S4a | `npx vitest run` (whole suite): 217 files, 4,031 passed at S4a | `npm run test:e2e`: 534 passed at S4a | `caafd97`: anchor, `shareHref`, mount share code, `.calc-share`, two keys per locale |
| S4b | `npx vitest run apps/web/src/contract/browser-record`: 59 passed | `npm run test:e2e -- share.spec no-js.spec`: 48 passed | `55cc084`: record group, `share.spec.ts`, no-JS case |

### Scenario ids proven

calculator-page: [CP12] (unit, e2e), MODIFIED Public DOM hooks (`data-hint-row` gone, `data-cost-row`/`data-price-hint` in one row, `data-share`), [CP78] (unit `shareHref` EN/ES with decode, e2e EN/ES), [CP79] (e2e `15 ft` → `l=180`, `abc` keeps the href), [CP80] (unit markup, no-JS e2e, visible after mount), [CP81] (e2e attributes and accessible name; contract: only `setAttribute`/`getAttribute` on the anchor, listeners on the form only), [CP82] (unit tokens, e2e 320/390/1280 box ≥ 44, `#06210f` on `#1faf5a`, orange ring, axe on the copy area), [CP83] (e2e copy → share → forward; `tabOrder` of both records), [CP84], [CP85] (`layout.spec.ts`, macOS; Linux pending), [CP86] (S3 gate, tip size). calculator-web-core: [CWC46], [CWC47]. i18n-catalog: [ICW19], [ICW21] (register scan, one sentence, no URL, no placeholder), [ICW22] (all four values in the bundle `MESSAGES`). site-quality: [SQ38] tip 2, [SQ39], [SQ41], [SQ43], [SQ44] (CLS sweep, axe, Lighthouse on its representatives).

### Negative proofs (applied, run red, reverted; `git status --porcelain` clean after each)

S3 (5.10):
1. `autocomplete="off"` back on the input: 3 failed (`renders the label tied to…`, `labels every en/es input…`).
2. `class="calc-choice"` on the copy button: `× styles the form buttons by element, with no calc-choice class left in CSS or markup`.
3. A separate `p.calc-hint[data-hint-row]` row back in the panel: 2 failed (`hides a cost row without a price…`, `renders the English table…`).
4. `findAll(root, '[data-cost-row], [data-price-hint], [data-hint-row]')` in the mount: `× looks up no hint row…`.
5. The generator meta back: `× names no generator`.

S4 (6.12):
1. `href="https://wa.me/"` in the server markup: 3 failed (both anchor markup cases, the slot-free markup `a[data-share][hidden]:not([href])`).
2. `shares: [find(root, '[data-share]')]`: 2 failed (`looks up neither the drawing box nor the share link with a throwing lookup`, `reveals the share anchor…`).
3. `encodeURIComponent` dropped: 3 failed (EN, ES and the base case).
4. Reveal dropped (`[data-share][hidden]` out of the mount, rebuilt): `shows a link…`, the tab-order, target-size and axe cases failed.
5. `.calc-copy` 6.35rem (one body line less, rebuilt): unit reserve case failed; e2e `fits every reserved block` failed on both pages (`copy en at 320 px: content fits`) and the four "where the script-free page puts them" cases failed.

### Measurements

| Measure | Start (`dcc2c8b`) | S3 tip | S4 tip | Budget |
|---|---|---|---|---|
| ES concrete full-length ([CP66], [SQ38]) | 40,657 B | **39,831 B** | **40,239 B** (margin 597 B) | pin 40,836 B |
| EN concrete full-length | 40,368 B | 39,549 B | 39,958 B | 40,960 B |
| rectangle-area full-length EN / ES ([SQ40]) | 34,654 / 34,693 B | 34,519 / 34,558 B | 34,928 / 34,966 B (headroom 6,032 / 5,994 B) | 40,960 B |
| Built concrete HTML EN / ES | 31,729 / 33,732 B | 30,910 / 32,906 B | 31,319 / 33,314 B | 40,960 B |
| Built square footage HTML EN / ES | 25,687 / 27,127 B | 25,552 / 26,992 B | 25,961 / 27,400 B | 40,960 B |
| Concrete JS graph (built, `check:site`) | 39,992 B | 39,931 B | 40,160 B | 49,152 B |
| Library builds concrete / rectangle-area | 40,114 / 38,548 B (PR 1) | | 40,648 / 39,546 B | 49,152 B |
| Calculator page weight (largest, ES concrete) | 163,383 B (PR 1) | 162,847 B | 163,484 B | 196,608 B |
| CSS (largest, square footage) | 8,227 B | | 8,480 B | 20,480 B |
| e2e | 534 passed | | **566 passed** (3.5 min) | |

S4 cost +408 B on the ES proof against the +340 B forecast (the built `.calc-share` rule is 244 B, with `width:fit-content` and `margin-top` for the row of its own). PR 3 forecast: 40,239 + 556 = 40,795 B, **41 B under the pin**; the design fallbacks (shorter note templates first) apply there if S7 measures over.

### Gates (tip `55cc084`, tree identical to the verified `7d49cd5`)

- `npm run verify`: exit 0 (217 files, 4,035 tests, coverage thresholds met, `check:site`, `check:dist` green).
- `npm run typecheck --prefix tooling/site-browser`: exit 0.
- `npm run build && npm run check:site && npm run test:e2e`: exit 0, **566 passed**.
- `npm run lighthouse`: exit 0 (six representatives).
- `git log main..HEAD --format=%B | rg -i 'co-authored|claude|anthropic|generated with'`: nothing.

### Screenshots (macOS Chromium, `astro preview` of the built site)

Session scratchpad: `bp2-{concrete,sqft}-{en,es}-{390,1280}.png`. The green link sits under "Copy link", left-aligned, 44 px tall like the buttons, 173 px (EN) and 189 px (ES) wide; text near-black on the WhatsApp green; nothing overlaps at either width.

### Linux gate (task 6.11, orchestrator-owned)

Request: run the `site-browser` CI job on the PR 2 tip; `share.spec.ts` ([CP82]) and `layout.spec.ts` ([CP84], [CP85]) must pass on Linux Chromium, with the 8rem `.calc-copy` reserve confirmed (the copy block holds two 44 px rows and one status line, so its height should not depend on font metrics). Local command: `npm run build && npm run test:e2e -- share.spec layout.spec`. Not confirmed until the orchestrator records the run id here.

PR 2 Linux gate: CI run 40796447511 green (`site-browser` 7m24s), PR #109 merged 2026-10-28.

## PR 3 — Concrete drawings (`feat/blueprint-panel-p3-concrete`, from `main` `ae28b38`)

Applied in the main thread (owner request: no background agents). Commits (`git diff -M --shortstat`, `openspec/` excluded):

| Slice | Commit | Lines | Forecast |
|---|---|---|---|
| S4c bytes | `78b86c0` refactor: drop the unused `nav-link`/`footer-link` classes, `data-cost-row` → `data-cost` | 76 | new |
| S4c share | `bab756c` feat: WhatsApp link full width, 56 px (mockup), copy reserve 9rem (content 8.6rem) | 27 | new |
| S4c panel | `53c3b51` fix: two-column panel independent of the row count (`repeat(11,auto) 1fr`, `PANEL_ROWS` contract) | ~60 | new |
| S5 | `0ccf6f0` slab, footing, column geometry | 421 | 300–370 |
| S6 | `4906cb8` steps geometry | 181 | 200–260 |
| S7a | `6493094` plan named by the answer, writer fits centred labels, notes centred on the frame | 208 | — |
| S7b | `36398cf` concrete wiring: slot, entry, 4 note keys per locale, browser record | 245 | 300–370 |

S5 is 21 lines over 400: the shared helpers of `slots/drawing.ts` reach 100 % coverage only through the concrete tests, so they could not land alone.

Bytes (ES concrete full-length proof, pin 40,836 B): 40,239 at the PR 2 tip → 40,112 after S4c (−127) → 41,222 with the first S7 draft (+1,110: head CSS 451, box 65, eight templates 594, against the 556 forecast) → **40,797 at the tip, margin 39 B**. EN 40,496 B. Concrete entry graph 47,285 B (budget 49,152). The design fallbacks were not enough, so two changes, both within the spec:
1. **The name of a concrete plan is the answer sentence** (`ANSWER`, resolved by the controller; a plan naming the answer on a page without one fails `PAGE_KEY` at creation). It names the shape and its dimensions ([BD15]) and costs no template: −390 B. Design B8 had one name template per shape.
2. **The drawing rule lost `.calc-result>*{grid-column:1}`** (the drawing fills column 2 of every row, so auto-placement puts the rest in column 1) and writes the ratio reduced (`3/2`): −34 B.

Other decisions: the slab draws no count (its volume ignores it); 0 steps → `null`; notes are centred on the frame, not the shape (a toggle moved the ES footing note when its text was fitted per system, caught by `drawing.spec` [BD11]); the ES depth note is `Profundidad: {depth}` (the longest accepted value, 29 characters, fits the 300 frame); the writer fits a centred label by its text (a note's width is known only once filled; a slot-free page's bundle reaches no slot file, so the fitting lives in `client/draw.ts`, not the controller). The independent coordinate check also caught a stair rounding bug (each corner now computed once).

Gates at the tip: `npm run test:coverage` 4,075 tests, thresholds met; typecheck (both); lint; `npm run build && npm run check:site`; `npm run test:e2e` 604 cases (drawing, layout, calculator 334 passed after the note fix). Screenshots: scratchpad `p3-{slab,footing,column,steps}-{390,1280}.png` (ES); four shapes drawn, two columns at 1280 with concrete's long panel.

Lighthouse (9.9): every assertion passes on the six pages. Not run: the dist diffs of 7.5 and 8.4 (S5 and S6 change no built file, since the module declared no drawing until S7). Linux gate (9.10): pending CI on the PR 3 tip.

Negative proofs (each run red, then the file restored; `git status` clean): slab sides swapped (the 12:10 case fails); count mark dropped (the footing and corner cases fail); column radius 50 (the column case fails); run labelled with the rise (the steps and metric cases fail); `steps` always `null` (the [BD8] and steps cases fail); one ES note key dropped (the [ICW12] rows and key list fail); box moved before `.calc-primary` (the order test fails, both locales). The [SQ42] record contract failed naming `concrete` until the record declared its `drawing` group (seen during S7).
