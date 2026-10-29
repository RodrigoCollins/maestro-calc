# Design: Blueprint Panel (live plan drawing and WhatsApp share)

This design implements `proposal.md` (D1–D9 are binding) against main `05de1f7`, revised after `design-review.md` (APPROVE WITH CHANGES; every item applied). The delta specs win over any value written here; where this design found a spec or proposal statement that the code contradicts, it says so under "Corrections". The apply measures every byte and line figure and records it in `apply-progress.md`.

## Answer first

- **Two existing gates shape the writer and the share link.** `client-entry.contract.test.ts:39-41` fails a bundle that holds any `https?://` URL other than maestrocalc.com ([SS23], [CP47]). So the bundle may hold neither the SVG namespace `http://www.w3.org/2000/svg` nor `https://wa.me/`, and no prefix of either is allowlisted. The writer creates nodes with `box.namespaceURI` (the server box is an `<svg>`). The share base comes from the markup (`data-share="https://wa.me/"`), not from code; the anchor has no `href` before the script. If a literal is ever unavoidable, follow `site-check/facts.ts:37-42`: exact identifiers anchored with `(?![\w.-])` and stripped before the scan, never a host prefix.
- **The mockup's grid ground cannot be CSS.** `CalculatorBody.budget.test.ts:210-217` fails any page but the homes that carries `linear-gradient` ([SS28], [SS29]). The writer draws the 16-unit grid as one SVG `path`. Without JS the box is plain ink, the panel's own ground ([BD19], [BD23]).
- **The entry contract has to widen.** `entry-graph.contract.test.ts:27` requires an entry's imports to be exactly the mount and the page module ([CP48]). The rule becomes: those two, plus `../draw.ts` exactly when the page module declares `drawing` (MODIFIED [CP48]; [CWC42], [CWC43]). The test derives this from the module, so a new page needs no test edit.
- **The unit suite has no DOM** (`apps/web/vitest.config.ts:10`, `environment: 'node'`), so the parts that need unit tests are pure: the geometry, `nodesOf(plan)` (the writer's node list), `shareHref` and the controller's `plan` per moment. The DOM application, about 25 lines, is covered by e2e; the mount's lookups are covered statically by the slot-free proof (`slot-free-proof.contract.test.ts:114-119`).
- **The slot-free proof fails any throwing lookup the slot-free markup cannot satisfy**, guarded or not (`throwingSelectors` scans `mount.ts` for `find(`). So `[data-drawing]` and `[data-share]` are looked up with `findAll` (B2, B10).
- **Concrete bytes:** the low-risk trim A–E frees about 826 B, counted on the built `dist/es/calculadora-de-concreto.html` (trim F was dropped: site-shell [SS24]–[SS26] read those tokens on `:root`). The additions cost about 896 B. The forecast margin at PR 3 is about 88 B under the 40,836 B pin (table below). S3 is measured before S4 is sliced; a short margin stops the apply.

## Architecture decisions

| # | Decision | Rejected alternative | Why |
|---|---|---|---|
| B1 | **The `drawing` slot holds geometry only:** `DrawingSlot<C> = { frame: {width, height}; plan(moment: Ready<C>): Plan \| null }`. `null` means the shape has no drawing yet (D7). It lives in `page-module.ts`. The generic helpers go in `slots/drawing.ts`; each page's geometry goes in `calculator/<id>/plan.ts` | The writer in the slot; a `draw` method on the module | The module must stay DOM-free ([CWC9]). A slot with geometry only fits the existing `slots/` pattern and is fully unit-testable |
| B2 | **The writer is injected:** the signature becomes `mount(module, hooks: { draw?: Draw } = {})`. Only the entry of a page that declares the slot imports `client/draw.ts` and passes it in. `mount.ts` imports only the type and looks the box up with `findAll(root, '[data-drawing]')` (a list that may be empty), never a throwing `find(`: the slot-free proof (`slot-free-proof.contract.test.ts:114-119`) flags every throwing lookup whose selector the slot-free markup lacks | Writer inside `mount.ts`; a dynamic `import()` | Without injection every page would ship the writer. A dynamic import adds a chunk and a request, and the entry contracts weigh only the static graph |
| B3 | **The plan is computed only for a ready moment.** In the controller, `View.plan` is `undefined` while a field is invalid, so the mount does not call the writer and the last drawing stays (D4, [CWC41]). It is `null` for a shape with no drawing, and otherwise a plan whose labels are already resolved to text | The writer comparing states; a plan computed from `valid` on every event | The rule is one pure place, tested in `controller.test.ts` with a spy sequence, and it needs no DOM |
| B4 | **Frame 300×200, the same for every shape of a page.** Server markup: `<svg data-drawing viewBox="0 0 300 200" aria-hidden="true"></svg>`, placed after `.calc-primary` and before `dl.calc-rows` (mockup lines 85-95: the SVG follows the figures). Without JS it is plain ink (no gradient: `CalculatorBody.budget.test.ts:215`). Head CSS from the `PAGES` row: `headStyleOf` adds `drawingCss(frame)` = `[data-drawing]{display:block;width:100%;max-width:24rem;aspect-ratio:300/200;margin-bottom:var(--space-3);font:600 17px var(--font-display)}` | The mockup's 342×236; the box sized by script; the rule in `calculator.css` | At 320 px the box is 256 px wide (scale 0.853), so 17-unit labels render at 14.5 px. The mockup frame gives 12.7 px. At 24rem the box caps at 384×256 and labels render at 21.8 px. `aspect-ratio` plus `viewBox` give the same box before and after JS ([BD20]). Per-page head CSS costs 0 B on a page without the slot ([BD22]). The font is inherited, so the writer sets no style ([BD25]) |
| B5 | **Labels first, then the layout.** Text width is estimated as `chars × size × 0.67` (0.56 until the PR 1 correction round, see `apply-progress.md`), wide enough for the widest common fallback font (DejaVu Sans Bold, 0.661 on `<0.01 cm`), and coordinates are rounded to 0.1. Gutters: top = offset 14 + pad 6 + 17; left = 14 + 6 + the width of the width label (text-anchor `end`; the width line is on the left, a deliberate departure from the mockup, which draws it on the right at lines 102-106: it keeps the top-then-left reading order of length then width, and the gutter math is the same on either side); bottom = one 17-unit row, always reserved; right = 6. The ratio `l/w` is clamped to `[1/4, 4]` (`CLAMP = 4`, [BD12]). Then `rw = min(AW, AH·r)`, `rh = rw/r`, centred. The area label goes inside when its width ≤ `rw − 12` and `rh ≥ 29`, otherwise in the bottom row | Fixed gutters (they overflow on `12 ft 6 1/2 in`); measuring text with `getBBox` (needs the DOM and changes per font) | The whole layout is in viewBox units, so if it is collision-free in the unit test it is collision-free at every width. Only real glyph widths can differ from the estimate; the [BD14] e2e asserts each measured `getBBox` width ≤ its estimated width for the longest labels, after `document.fonts.ready` and again with the web fonts blocked (fallback font), on Linux CI |
| B6 | **A dimension line:** `dimensionLine(a, b, side, label)` returns the main line (`#B9C6DA`, 1.2), two dashed extension lines (`2 3`), two 45° orange ticks of half-length 5 at stroke 2, and the label at 6 units outside. The outline is white, stroke 2, fill `rgba(255,255,255,.08)`. Labels are white; notes are `#B9C6DA` at 15 units. `#B9C6DA` is the "Helper line" token of `docs/design/direction.md` (added by this review). `tokens.css` gains no custom property for it: the writer sets SVG presentation attributes, which take the hex directly, and a `:root` token would cost bytes on every page, the concrete pin included; the [BD18] unit test pins the writer's colour constants to the direction table | CSS classes for the strokes; a `--color-helper` token | Presentation attributes cost no HTML bytes. They come from the mockup (lines 96-108) and [BD18] |
| B7 | **Pure `nodesOf(plan)` plus a thin `draw(box, plan)`.** `nodesOf` returns `{tag, attrs, text?}[]`: grid path, outline, lines, ticks, texts. `draw` skips the redraw when `JSON.stringify(plan)` equals the last plan. Otherwise it calls `box.replaceChildren(...)` with nodes built by `createElementNS(box.namespaceURI, tag)`, `setAttribute` and `textContent` ([BD24]). It sets `role="img"` and removes `aria-hidden` when a plan arrives. For `null` it empties the box and sets `aria-hidden="true"` ([BD19], proved through `nodesOf`, the markup contract and e2e) | Keyed node reuse; `innerHTML` | Fewer than 40 nodes, so a rebuild is cheap. The equality check keeps renders that change nothing from mutating the DOM ([BD17]) |
| B8 | **Name: one template per drawn shape, filled by the controller.** Page key `calc.rectangle-area.page.drawing` (rectangle-area) or `calc.concrete.page.drawing.<shape>` (concrete), message ids `drawing` / `drawing.<shape>` by the `page-view.ts` convention, filled from the plan's label texts (EN `Plan: {length} by {width}, {area}`). The writer calls `setAttribute('aria-label')` only when the text changes. There is no live region; the answer stays the only announcement ([BD15]-[BD17]) | No name; an `aria-live` drawing; a static name with `aria-describedby` set to the answer | A static name would save about 150 B on concrete, but [BD15] requires the dimensions in the name. A live region would announce twice per keystroke (D5) |
| B9 | **Label text:** dimensions use `dimensionText` (language-free symbols: `12 ft 6 in`, `3.05 m`, as the answer does). The area is the panel figure plus the language-free symbol `ft²`/`m²`. No unit key exists. Concrete's worded notes (`{thickness} thick`, `{depth} deep`, `{height} high`, `{count} steps`; the count mark `× n` when n > 1 is language-free) come from one template per shape, `calc.concrete.page.drawing.<shape>.note`. The full key set: rectangle-area 1 key (name); concrete 8 keys (name and note per shape), per locale | A unit key for every label | Units are already language-free symbols in the answers and panel ([K8] of square-footage). Templates only where there are words keeps concrete's message bytes down |
| B10 | **Share anchor in the copy area,** after the copy button and before the status ([CP83] tab order): `<a class="calc-share" data-share="https://wa.me/" target="_blank" rel="noopener noreferrer" hidden>{label}</a>`. It has no `href` before the script; the base is the inert `data-share` ([CP80]). The mount looks it up with `findAll(root, '[data-share]')` (M-5). Each render does `setAttribute('href', shareHref(env, state, base))`, which returns `base + '?text=' + encodeURIComponent(text + ' ' + copyAddress(env, state))`, with `text` the `site.calculator.shareText` entry of the messages template. The anchor is revealed with the copy button. The `.calc-copy` min-height grows to the measured value | Under the panel, as in the mockup (lines 145-148); Web Share API; a server `href` | The copy area is where the copy button sits today (`CalculatorForm.astro:78`) and the only reserve that already absorbs a reveal ([CP62]). Moving both under the panel is a visible relocation and a new reserve; it is a follow-up. `data-share` keeps the base URL out of the bundle |
| B11 | **Share is generic:** `CalculatorForm` renders it for every page, like the copy button. The mount looks it up as a list ([CWC47], proved by the static lookup proof) | A per-module flag | Every calculator gets it with no step in the recipe |
| B12 | **Trim without visible change (S3),** in the table below; about 826 B planned against ≥ 700 B required ([CP86]). Visible text, ids and ARIA are equal; hook and guard changes are limited to the trim table (C merges `data-hint-row` into the cost row, [SQ39]) | Raising the pin; shorter copy | Out of scope (proposal); the copy belongs to the owner |

## Concrete bytes (ES full-length fixture; base 40,678 B, pin 40,836 B)

Counted on the built ES page (`apps/web/dist/es/calculadora-de-concreto.html`). The fixture renders the same form, panel, template, head and CSS. S3 records the real delta from `CalculatorBody.budget.test.ts` before and after.

**Task-level rule (M-7):** S3 is measured with the budget test before S4 is sliced. If 40,678 B minus the measured trim plus the forecast additions of PR 2 and PR 3 (about 896 B) exceeds 40,836 B, the apply stops and reports to the owner. The budget and the pin are never raised.

| Trim candidate (S3) | Count | Bytes | User-visible? | Guard to update |
|---|---|---|---|---|
| A. Drop `autocomplete="off"` on each input: the form already sets it (`CalculatorForm.astro:13`), and inputs inherit the form owner's state | 15 × 19 | −285 | No | `CalculatorField.test.ts:17`, `CalculatorForm.test.ts:152`, e2e `calculator.spec.ts:137` (asserts the form attribute plus no override), [CP12] wording |
| B. `class="calc-choice"` → selector `.calc-form button` (4 selectors, +5 each) | 12 × 20 − 20 | −220 | No | `styles.contract.test.ts:349-350` |
| C. Merge each cost row and its hint row: one `<p class="calc-cost">` with label, figure `[data-output][data-cost-row] hidden` and hint `[data-price-hint]`; the mount toggles the two spans; `.calc-hint` leaves the CSS; the `data-hint-row` hook is removed (`ResultPanel.astro:42`, `mount.ts:135,192`) | 100 + 107 + 11 | −218 | No (same row, same text) | `ResultPanel.test.ts:119-130`, `CalculatorBody.test.ts:75,103`, mount `costRows`/`hintRows`, `slot-free-proof.contract.test.ts` absent-hook list, e2e `calculator.spec.ts` hint-row queries, calculator-page Public DOM hooks table (MODIFIED) |
| D. Drop `class="calc-label"` (no CSS rule matches it): 3 spans left after C | 3 × 19 | −57 | No | `ShoppingLine.test.ts:19,27,47`, `CalculatorBody.test.ts:71,97` (use `.calc-shopping > span:first-child`) |
| E. Drop `<meta name="generator">` (`SeoHead.astro:16`) | 1 | −46 | No | none found |
| ~~F. Move `--text-display`, `--grid-size` and `--tick-weight` to the home rule~~ | — | 0 | — | Dropped (orchestrator decision M-7): site-shell [SS24]–[SS26] read these tokens from `tokens.css` on `:root` |
| **Total trim** | | **−826** | | |

| Addition | PR | ES bytes (estimate) | Running size |
|---|---|---|---|
| Trim A–E | 2 (S3) | −826 | 39,852 |
| Share anchor, `site.calculator.shareText` message, `.calc-share` rule (about 170 B) | 2 (S4) | +340 | 40,192 |
| Box (63 B), head `<style>` and drawing rule (133 B), the eight `drawing.<shape>` / `drawing.<shape>.note` entries (about 360 B) | 3 (S7) | +556 | 40,748 (≈ 88 B margin) |

If a PR tip measures over the pin, use the fallbacks in this order: shorter note templates (count mark only), then a shorter `.calc-share` rule, then ask the owner. The budget is never raised.

## Data flow

    input ─→ controller.applyEvent ─→ ready? ─ no ─→ View.plan undefined (writer not called)
                                         └ yes ─→ module.drawing.plan(moment) ─→ resolve notes/name via env.messages ─→ View.plan
    mount.render ─→ hooks.draw?.(svg[data-drawing], View.plan) ─→ nodesOf ─→ createElementNS(box.namespaceURI)
    mount.render ─→ for each findAll('[data-share]'): setAttribute('href', shareHref(env, state, a.dataset.share))
    PAGES[id] ─→ headStyleOf ─→ reserveCss + drawingCss(module.drawing.frame) ─→ <head><style>

## Interfaces

```ts
// page-module.ts
export interface Frame { readonly width: number; readonly height: number }
export interface DrawingSlot<C extends AnyCalculator> {
  readonly frame: Frame;
  /** The plan of a ready moment; null for a state the page does not draw yet. */
  plan(moment: Ready<C>): Plan | null;
}
// slots/drawing.ts
export type Label = { readonly text: string } | { readonly message: string; readonly fills: Readonly<Record<string, string>> };
export interface PlanLabel { readonly x: number; readonly y: number; readonly anchor: 'start' | 'middle' | 'end'; readonly size: 15 | 17; readonly label: Label }
export interface Plan {
  readonly name: Label;
  readonly outline: readonly ({ kind: 'rect'; x: number; y: number; w: number; h: number } | { kind: 'circle'; cx: number; cy: number; r: number } | { kind: 'path'; d: string })[];
  readonly lines: readonly { readonly d: string; readonly tone: 'helper' | 'extension' | 'tick' }[];
  readonly labels: readonly PlanLabel[];
}
export const dimensionLine: (a: Point, b: Point, side: Side, label: Label) => Pick<Plan, 'lines' | 'labels'>;
export const fitRectangle: (frame: Frame, gutters: Gutters, length: number, width: number) => Rect; // clamp [1/4, 4]
// controller.ts
export const shareHref: (env: Environment, state: { readonly search: string }, base: string) => string;
// client/draw.ts
export type Draw = (box: SVGSVGElement, plan: ResolvedPlan | null) => void;
export const nodesOf: (plan: ResolvedPlan) => readonly SvgNode[]; // pure
```

Concrete shapes (S5, S6; declared in S7): `slab` and `footing` use `fitRectangle` with length × width (footing: length × `footingWidth`), plus the note and the count mark. `column` is a circle of fixed radius 60 with a horizontal diameter line. `steps` is a side profile of n treads. Each tread is `run` long and `rise` tall, and the stair as a whole is clamped like a rectangle with an outer `n·run` × `n·rise`. The rise and run dimension lines are on the first tread.

## Slices (400 lines each, `git diff --shortstat`)

| Slice | Files | Forecast |
|---|---|---|
| **S1a** `feat(web): add the drawing slot and its geometry` | `page-module.ts` (`DrawingSlot`, `Frame`), `slots/drawing.ts` (+ `drawing.test.ts` with hand-verified tables, `drawing.property.test.ts` [BD13]) | 280–330 |
| **S1b** `feat(web): resolve plans in the controller and inject the SVG writer` | `controller.ts` (`View.plan`, label resolution) + `controller.test.ts` ([CWC41], [BD10] spy sequence; `null` plan of a fixture module); `client/draw.ts` (`nodesOf`, `draw`) + `draw.test.ts` (`nodesOf` node lists, [BD19] attributes); `mount.ts` (`hooks.draw`, `findAll(root, '[data-drawing]')`); `entry-graph.contract.test.ts` ([CP48] imports derived from `module.drawing`; graph reaches `draw.ts`/`slots/drawing.ts` only when declared); `slot-free-proof.contract.test.ts` (drawing files and `[data-drawing]` absent; the static lookup proof covers [CWC44]); a [BD24] scan in `client-entry.contract.test.ts` | 300–360 |
| **S2a** `feat(web): draw the square footage plan` | `calculator/rectangle-area/plan.ts` + `plan.test.ts` ([BD1], [BD2], [BD12]); `page.ts`, `client/entries/rectangle-area.ts`; `components/calculator/{model.ts,ResultPanel.astro}` + `ResultPanel.test.ts` ([CP76], [CP77]); `lib/page-view.ts` (`drawing` message); `lib/pages.ts` `headStyleOf` + `drawingCss` + tests ([BD22]); catalogs `en/es/rectangle-area.ts` (`page.drawing`); `i18n-contract.test-d.ts` | 280–340 |
| **S2b** `test(e2e): record the square footage drawing` | `tooling/site-browser/e2e/drawing.spec.ts` (box equal before/after mount at every `WIDTHS`, [BD14] `getBBox` ≤ estimate after `document.fonts.ready` and with the fallback font, aria-label, no live region, keep-last on `abc`); optional `drawing` group in `E2eSpec` + `rectangle-area-pages.ts`; the [SQ42] web-side contract (`PAGES[id].module.drawing` declared iff the record text declares `drawing:`), landing with the first record that satisfies it; AGENTS.md steps 11-12 (`drawingSlot`, `draw` hook) and `docs.contract` tokens | 200–260 |
| **S3** `refactor(web): trim the calculator markup` | A–E of the trim table: `CalculatorField.astro`, `CalculatorForm.astro`, `ResultPanel.astro`, `ShoppingLine.astro`, `calculator.css`, `SeoHead.astro`, `mount.ts` (cost spans) and the guards listed; records the budget-test delta, then applies the M-7 stop rule before S4 is sliced | 200–260 |
| **S4** `feat(web): share the calculation on WhatsApp` | `CalculatorForm.astro`, `model.ts`, `page-view.ts` (label, `site.calculator.shareText` entry); `controller.ts` `shareHref` + tests ([CWC46]); `mount.ts` (`findAll(root, '[data-share]')`, reveal, `href`); `calculator.css` (`.calc-share`, `.calc-copy` min-height measured on macOS and Linux); `site.ts` en/es (`site.calculator.shareWhatsApp`, `site.calculator.shareText`); e2e `share.spec.ts` ([CP78]-[CP85]), `tabOrder` of both records | 280–340 |
| **S5** `feat(web): add the concrete slab, footing and column geometry` | `calculator/concrete/plan.ts` (slab, footing, column) + `plan.test.ts` ([BD4], [BD5], [BD6]); not yet declared by the module | 300–370 |
| **S6** `feat(web): add the concrete steps geometry` | `plan.ts` (steps) + tests ([BD7]) | 200–260 |
| **S7** `feat(web): draw the concrete plans` | `page.ts` declares `drawing` for all four shapes ([BD8]); `client/entries/concrete.ts` passes `draw`; catalogs `en/es/concrete.ts` (8 keys each); `i18n-contract.test-d.ts`; the concrete E2E `drawing` group (restored `sh=column`/`sh=steps` [BD21], [BD14]) in the same slice, so the [SQ42] contract holds at every slice; [CP86] size recorded | 300–370 |

PRs: PR 1 = S1a + S1b + S2a + S2b (square footage drawing, visible); PR 2 = S3 + S4 (trim and share); PR 3 = S5 + S6 + S7 (all four concrete drawings, orchestrator decision: no concrete shape ever shows an empty box on the domain). S5 and S6 add geometry the module does not declare yet; each slice is green on its own tests. A slice that measures over 400 lines moves its test-only half into its own slice inside the same PR.

## Testing strategy (RED first per slice)

| Slice | RED first |
|---|---|
| S1a | Hand-verified coordinates for 10×10, 20×10, 10×20 and 100×1 (clamp); property test: monotone, symmetric under swap, never outside the frame, labels never intersect (estimated boxes) |
| S1b | The controller's spy writer receives the default, `20 ft` and `15 ft` and nothing for `abc`; `null` for a fixture state with no plan; `nodesOf` gives exact node lists and `aria-label` text; the entry-graph seeded case (a slot-free entry that imports `draw.ts` fails); the slot-free lookup proof seeded with a throwing `find(root, '[data-drawing]')` fails; [BD24] scan |
| S2a | The rendered panel has one empty `aria-hidden` `[data-drawing]` after `.calc-primary` and before `dl.calc-rows`; the head style holds the drawing rule only on rectangle-area; [CP77] figures are byte-identical; the JS budget prints the new size (forecast about +3.5 KB on 33,803 B) |
| S2b | the [SQ42] contract seeded with a declared slot and no record group fails, naming the id; e2e at every `WIDTHS` in both locales: box size and the next element's top equal with and without JS; CLS ≤ 0.01; axe 0; CSP 0 violations ([BD25]); [BD14] measured ≤ estimated widths at 320 px with web and fallback fonts |
| S3 | Each guard rewritten first (the form owns `autocomplete`; `.calc-form button` declares the target size; one cost row per key with the hint inside it); the budget test prints the ES and EN deltas; the e2e `prices` and a11y groups still pass |
| S4 | `shareHref` exact output for EN and ES and the encoding round trip; e2e: hidden without JS, visible after mount, `href` follows `ws=15` and keeps on `abc`, tab order, 44 px target, contrast, copy reserve fit at seven widths on Linux |
| S5, S6 | Hand-verified plans per shape |
| S7 | [BD8] all four shapes return a plan; e2e restored `?v=1&sh=…` links with no shift; [CP86] size recorded at the PR 3 tip |

Every slice runs `format:check`, `sync && lint`, `typecheck` (plus `--prefix tooling/site-browser` when e2e files change), `test:coverage` (100 % on the geometry files, [BD3]) and `build && check:site`. Every PR tip also runs `verify`, `test:e2e` and `lighthouse`, with Linux CI as the final word on layout.

## What the user sees on maestrocalc.com

| After | Visible change |
|---|---|
| PR 1 | Square footage: an ink blueprint after the big figure with a grid, a white rectangle, orange-ticked length (top) and width (left) lines, and the area inside; it follows typing and the unit toggle. Concrete: unchanged |
| PR 2 | Both pages: a green "Send on WhatsApp" / "Enviar por WhatsApp" button after "Copy link", which opens WhatsApp with the text and the current link. The trim changes nothing on screen |
| PR 3 | Concrete: every shape is drawn live (slab and footing with the thickness or depth note and the count, column with its diameter, steps with rise and run). No shape shows an empty box |

## Risks

| Risk | Mitigation |
|---|---|
| The concrete margin at PR 3 is thin (about 88 B, estimated, after dropping trim F) | S3 measured before S4 is sliced (stop and report if short); the fallbacks in order; the size measured at every tip; never raise the budget |
| Glyph widths exceed the 0.67 em estimate (fallback font before the fonts load) | Conservative factor; [BD14] asserts measured ≤ estimated widths after `document.fonts.ready` and with the fallback font, on Linux; the box size never depends on the text |
| `aspect-ratio` and `viewBox` disagree in a browser | Both carry the same ratio; [BD20] measures before and after the mount |
| `[CP12]` reviewers read the dropped input attribute as a regression | The MODIFIED Form controls and [CP12] state that inputs inherit `autocomplete="off"` from the form; the e2e asserts the form attribute and that no input overrides it |
| The JS budget on concrete (39,164 B + about 5 KB) | Weighed by the client-entry contract at every slice |

## Threat matrix

N/A. There is no shell, subprocess, VCS automation, executable classification or process boundary. The only new outbound link is a user-followed `wa.me` anchor, and the CSP is unchanged.

## Rollback

Each PR reverts as one merge. Reverting PR 1 removes the slot, the writer and the square footage drawing (the entry goes back to `mount(page)`). Reverting PR 2 restores the markup and removes the share link; S3 alone is behavior-neutral. Reverting PR 3 removes concrete's geometry, slot declaration and keys. No URL or data contract changes.

## Corrections to the proposal and the delta specs

All applied in this revision (see `design-review.md`):

1. The box has no CSS ground: a gradient is banned off the homes, so without JS it is plain ink and the grid is an SVG path (B4, B7; proposal, [BD19], [BD23]).
2. No foreign URL or prefix in the bundle: the base from `data-share`, the namespace from `box.namespaceURI` (B7, B10); [SQ41] no longer allows a `wa.me` prefix; the share requirement says "no `href` before the script; the base is the inert `data-share`".
3. [CP76] and the MODIFIED Result panel place the box after `.calc-primary` and before `dl.calc-rows` (mockup lines 85-95).
4. [BD11] reads `3.05 m` (`present.ts:150`).
5. [CWC45] no longer requires the slot-free markup to lack `data-share` (B11).
6. Unit tests target pure code only ([CWC41], [BD10] controller spy; [CWC46] `shareHref` plus e2e [CP78]; [BD19] `nodesOf`, the markup contract and e2e; [CWC44], [CWC47] the static lookup proof).
7. The calculator-page delta carries a MODIFIED [CP48] (Client script contract), a MODIFIED Public DOM hooks table (`data-drawing`, `data-share`, the merged cost row) and a MODIFIED Form controls ([CP12], inherited `autocomplete`).
8. [SQ42] is enforced by a web-side contract test, not a type error.
