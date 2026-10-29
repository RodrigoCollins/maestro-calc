# blueprint-drawing

New capability. The live plan drawing in the result panel of a calculator page, in the approved Blueprint direction (`docs/design/direction.md`). Prefix: BD (first id: BD1). The drawing is a view of the last valid state: pure geometry in the page module (`drawing` slot, `calculator-web-core` [CWC41]), a DOM writer in its own client module, and a reserved box in the server HTML. Out of scope: drawings for future calculators, true-scale drawing, animation, printing.

Terms: a moment is the controller's current valid state with its figures and unit system; a plan is the set of outline, dimension lines and labels returned for a moment; the box is the server-reserved drawing element `[data-drawing]` inside the result panel; the aspect ratio of a plan is its width divided by its height. Delivery order is the square footage rectangle (PR 1), then all four concrete shapes (`slab`, `footing`, `column`, `steps`) together in PR 3, so no concrete shape shows an empty box on the domain.

## ADDED Requirements

### Requirement: Square footage plan geometry

For `rectangle-area`, the geometry function MUST return, from a moment, a rectangle outline, one dimension line along the top edge labelled with `length`, one along the left edge labelled with `width`, and the area label inside the rectangle. Dimension lines carry end ticks. The function is pure: same moment, same plan, no DOM, no `window`, no message text. Labels are language-free text (dimensions through the shared `dimensionText`, with the symbols `ft`, `in`, `m`, `cm`; the area as the panel figure plus `ft²` or `m²`) or a message key with its fills, which the controller resolves from the inert templates of the page; there is no unit key. Coordinates are numbers in one fixed viewBox.

#### Scenario: [BD1] Default rectangle coordinates
- GIVEN the `rectangle-area` default moment (`length` 10 ft, `width` 10 ft, area 100.00 ft²)
- WHEN the geometry function runs
- THEN the outline is a square, the top line label value is `10 ft`, the left line label value is `10 ft`, the area label value is `100.00` with unit `ft²`, and every coordinate equals the hand-verified table of the test (a unit test)

#### Scenario: [BD2] Landscape and portrait
- GIVEN moments of 20 ft by 10 ft and of 10 ft by 20 ft
- WHEN the geometry function runs
- THEN the first outline is twice as wide as it is tall and the second twice as tall as it is wide, both inside the viewBox with equal margins for the dimension lines (a unit test with hand-verified coordinates)

#### Scenario: [BD3] Geometry is pure and language-free
- GIVEN the sources of the drawing geometry under `apps/web/src/calculator/`
- WHEN the existing scan of `calculator-web-core` [CWC9] runs
- THEN none reads `document`, `window` or `navigator`, none imports a catalog, and the geometry files keep 100 % line, branch, function and statement coverage (a contract test and a coverage gate)

### Requirement: Concrete plan geometry

For `concrete`, the geometry function MUST be selected by the `shape` of the valid state; the four shapes are delivered together (PR 3). `slab`: a rectangle plan with length and width dimension lines, a thickness note and the count. `footing`: a rectangle plan with length and width lines, a depth note and the count. `column`: a circle with one diameter line and the height note and count. `steps`: a side profile with a rise line and a run line and the number of steps. Each plan labels only values the engine accepted: the slab draws no count, since its volume does not use one, and a stair of 0 steps has no profile, so its plan is `null` and the box stays empty ([BD19]). The accessible name of a concrete plan is the page's answer sentence for its shape, which names the shape and its dimensions already, so the page carries no second template for it; the note of each shape is a page message, centred on the frame (its words differ by language and unit system, and centred there any note up to the frame's width fits, so a toggle never moves it).

#### Scenario: [BD4] Slab plan
- GIVEN the concrete default moment (`slab`, 12 ft by 10 ft, thickness 4 in, count 1)
- WHEN the geometry function runs
- THEN the outline has the aspect ratio 12:10, the labels are `12 ft`, `10 ft`, a thickness note `4 in`, and no count mark for a count of 1 (a unit test with hand-verified coordinates)

#### Scenario: [BD5] Footing plan with a count
- GIVEN the moment from the link `?v=1&sh=footing&l=216&n=3` (footing, length 18 ft, count 3)
- WHEN the geometry function runs
- THEN the plan is the footing rectangle at the aspect ratio of its length and width, with the length label `18 ft`, the width label and depth note from the valid state, and a count mark `3` (a unit test)

#### Scenario: [BD6] Column plan
- GIVEN a `column` moment with a diameter of 12 in, a height of 8 ft and a count of 2
- WHEN the geometry function runs
- THEN the outline is a circle of fixed radius, one diameter line is labelled `12 in`, and the height note and count mark are `8 ft` and `2` (a unit test)

#### Scenario: [BD7] Steps plan
- GIVEN a `steps` moment with a rise of 7 in, a run of 11 in and 4 steps
- WHEN the geometry function runs
- THEN the outline is a stair profile of 4 treads, the rise line is labelled `7 in`, the run line `11 in`, and the step count is `4` (a unit test)

#### Scenario: [BD8] Every concrete shape has a plan
- GIVEN each `shape` option of the concrete module once it declares the `drawing` slot (PR 3)
- WHEN the module's drawing slot is asked for a plan
- THEN all four shapes return a plan, and the generic no-plan rule (a state whose `plan` is `null` keeps the box empty and `aria-hidden`, [BD19]) is proved on a fixture module in the controller test, never on a routed concrete shape (a unit test)

### Requirement: Labels come from the last valid inputs

The labels MUST be formatted with the same display formatting as the panel figures (the shared formatting of `calculator-page`, in the active unit system) and MUST come from the last valid state, never from the typed text. While a field is invalid the drawing keeps the last valid plan and the error stays in the field and the answer (`calculator-page` [CP31]).

#### Scenario: [BD9] Typing updates the labels
- GIVEN the `rectangle-area` page with scripts running
- WHEN `length` is changed to `12' 6"`
- THEN the top line label reads `12 ft 6 in`, the area label reads `125.00` with `ft²`, and the outline is wider in the ratio 12.5:10 (an e2e test, hand-verified from `calc-rectangle-area` case A)

#### Scenario: [BD10] An invalid field keeps the last drawing
- GIVEN the `rectangle-area` page after `length` was set to `20 ft`
- WHEN `abc` is typed in `length`
- THEN the field shows its error, the answer shows `—`, and the drawing still shows the 20 ft plan with the label `20 ft`, never `abc` (an e2e test, and a unit test of the controller with a spy writer on the sequence of moments: the spy receives no plan for `abc`)

#### Scenario: [BD11] The unit toggle relabels, the plan stays
- GIVEN the default `rectangle-area` page in the US system
- WHEN the unit system becomes metric
- THEN the plan coordinates are unchanged, the length and width labels read `3.05 m` (`dimensionText`, two decimals), and the area label reads `9.29` with `m²` (an e2e test; labels use the same formatting as [CWC16])

### Requirement: Proportional drawing with clamped ratios

The plan MUST be proportional to the valid dimensions, with the aspect ratio of the drawn outline clamped to a fixed range so that the outline and the dimension lines stay legible at extreme ratios. The labels always carry the true values. The clamp bounds are constants of the geometry module, and the plan always fits the viewBox with its labels.

#### Scenario: [BD12] Extreme ratio is clamped
- GIVEN a `rectangle-area` moment of 100 ft by 1 ft
- WHEN the geometry function runs
- THEN the outline aspect ratio equals the upper clamp bound (not 100), both dimension lines and their labels lie inside the viewBox without overlapping, and the labels read `100 ft` and `1 ft` (a unit test with hand-verified coordinates)

#### Scenario: [BD13] The clamp is symmetric and monotone
- GIVEN moments of widths and lengths over a generated range
- WHEN the geometry function runs on each
- THEN the outline ratio is non-decreasing in length over width, equals the true ratio inside the clamp range, swaps exactly when length and width swap, and the outline never leaves the viewBox (a property test)

#### Scenario: [BD14] Labels do not overlap at 320 px
- GIVEN the `rectangle-area` and `concrete` pages at 320 px in Chromium on Linux with the longest label values the validation accepts
- WHEN the label boxes are measured with `getBBox` after `document.fonts.ready`, and again with the web fonts blocked so the fallback font renders
- THEN in both runs each label's measured width is at most the width the geometry estimated for it, no two label boxes intersect and none leaves the drawing box (an e2e test, per page, on Linux CI)

### Requirement: Accessible name without announcements

The drawn element MUST have `role="img"` and an `aria-label` that names the shape and its dimensions in the page's language, updated by the script on each valid state. The drawing MUST NOT be, or sit inside, a live region (`aria-live`, `role="status"` or `role="alert"`), so only the answer sentence announces changes. The name text comes from inert templates in the page, not from the client bundle.

#### Scenario: [BD15] Name follows the state
- GIVEN the `rectangle-area` page in EN with scripts running
- WHEN `length` is set to `12' 6"`
- THEN the `aria-label` of the drawing names the rectangle with `12 ft 6 in` and `10 ft` and the area (for example `Plan: 12 ft 6 in by 10 ft, 125.00 ft²`), in ES the same in Spanish (an e2e test)

#### Scenario: [BD16] No live region
- GIVEN the built pages of `rectangle-area` and `concrete`
- WHEN the drawing box and its ancestors up to the result panel are read
- THEN none carries `aria-live`, `role="status"` or `role="alert"`, and the only live region of the panel remains the answer sentence (a contract test over the rendered markup)

#### Scenario: [BD17] One announcement per change
- GIVEN a screen-reader-equivalent spy on live-region mutations in Chromium
- WHEN `length` is typed one character at a time
- THEN the drawing causes no live-region mutation and the aria-label changes only when the valid state changes (an e2e test)

### Requirement: Contrast of the drawing

Outline strokes and text labels MUST be white (`#FFFFFF`) on the Blueprint ink ground (`#0E2240`), dimension ticks safety orange (`#F06A1D`) on the ink ground (about 5.1:1) and helper lines and notes "Helper line" `#B9C6DA` (`docs/design/direction.md`) on the ink ground. The colours are SVG presentation attributes set by the writer; `tokens.css` carries no drawing colour. Text labels meet 4.5:1 and every non-text mark (outline, ticks, helper lines) meets 3:1, against the ground they sit on, in both locales.

#### Scenario: [BD18] Contrast ratios
- GIVEN the writer's colour constants, the direction table and the ink ground token
- WHEN the contrast ratios are computed with the WCAG formula
- THEN each constant equals its `docs/design/direction.md` swatch, white on ink is at least 4.5:1, orange on ink is at least 4.5:1, `#B9C6DA` on ink is at least 4.5:1, and axe reports 0 `color-contrast` violations on the drawn pages in both locales ([SQ1]) (a unit test of the tokens and an e2e test)

### Requirement: Reserved box and zero layout shift

The server HTML MUST contain the box on every page that declares the `drawing` slot, with a size fixed by CSS from a width-driven `aspect-ratio`, emitted as per-page head CSS from the page's `PAGES` row (like the `reserve`; the shared `calculator.css` carries no drawing rule). The box has the same size at every state of the page: before the script, after it mounts, for every shape (a shape with no plan keeps the box empty at the same size), and with scripts disabled. The script draws only inside the box and sets no size.

#### Scenario: [BD19] Empty box is decorative
- GIVEN the built page markup and a shape with no plan (or a page before the script runs)
- WHEN the box is read
- THEN it is `aria-hidden="true"`, has no `role="img"`, no children and no CSS ground of its own (plain ink: the grid is an SVG path the script draws, since a gradient is banned off the homes), and the script sets `role="img"`, the name and removes `aria-hidden` only when it draws a plan (a unit test of `nodesOf`, a contract test of the markup and an e2e test)

#### Scenario: [BD20] Server box equals mounted box
- GIVEN Chromium opening each drawn page in both locales at 320, 390, 480, 640, 768, 1024 and 1280 CSS px, with and without a query, on Linux CI
- WHEN the box size is measured before and after the script mounts and after every shape is selected
- THEN the width and height are identical in all those states, and the position of the first element below the box does not change (an e2e test)

#### Scenario: [BD21] CLS is at most 0.01
- GIVEN the drawn pages at the phone profile and the widths of [BD20], including `?v=1&sh=column` and `?v=1&sh=steps` restored links (PR 3)
- WHEN the load settles and layout shifts are summed
- THEN the sum is at most 0.01 and Lighthouse layout shift stays at or below 0.01 ([SQ9]) (an e2e test and a Lighthouse run, Linux CI is the final word)

#### Scenario: [BD22] The box CSS is per page
- GIVEN the built `rectangle-area` and `concrete` pages and the shared `calculator.css`
- WHEN the head `<style>` and the shared stylesheet are read
- THEN the drawing box rule appears in the head `<style>` of the pages that declare the slot only, `calculator.css` contains no `[data-drawing]` rule, and a page with no `drawing` slot carries no box and 0 extra bytes (a build test)

### Requirement: Progressive enhancement and CSP

With scripts disabled the page works as it does today, with the box present, empty, plain ink (no grid, no gradient) and `aria-hidden`. The drawing writer MUST build the SVG with `createElementNS`, `setAttribute` and `textContent` only: no `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `DOMParser`, `eval`, `new Function` or inline script, and the CSP `script-src 'self'` and `style-src` stay unchanged.

#### Scenario: [BD23] No-JS fallback
- GIVEN Chromium with JavaScript disabled opening both drawn pages in EN and ES
- WHEN the page is read
- THEN the box is present, empty, plain ink with no gradient and `aria-hidden`, the figures and the default result are shown, the controls stay disabled with the "not running" note, and axe reports 0 violations ([SQ18]) (an e2e test)

#### Scenario: [BD24] DOM APIs only
- GIVEN the sources of the drawing writer and every module of the entry graphs that import it
- WHEN a contract test scans them
- THEN none contains `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `DOMParser`, `eval` or `new Function`, the writer's calls are `createElementNS` (with `box.namespaceURI`, no namespace literal), `setAttribute` and `textContent`, and the graph holds no `https?://` URL other than the site origin (a contract test)

#### Scenario: [BD25] No CSP violation while drawing
- GIVEN Chromium with the production CSP on both drawn pages in both locales
- WHEN the pages mount and the inputs change
- THEN there are 0 CSP violations ([SQ32]) and no inline script or style is added by the script (an e2e test)
