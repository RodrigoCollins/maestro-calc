# Delta for calculator-page

Replaces the fixed reserved sizes of the answer, notice and copy blocks by a size that fits the content at every width, fixing the empty gap under the answer on desktop (a 10.75 rem reserve for a sentence that wraps to two lines there). Only the "Layout stability" requirement changes; every other CP requirement is unchanged. Continues the prefix CP (next free id: CP59). Kept as written: [CP44], [CP58]. Added: [CP59] to [CP66]. [CP66] is the byte gate every slice of the gap fix respects: the reserve rule and its media blocks are paid for by trims measured on the Spanish full-length proof (design K9, K10), never by the headroom.

Terms. A reserved block is a block marked `data-reserved="answer"`, `"notice"` or `"copy"` ([CP54] hooks). Its content at a width is the tallest content the page puts in it at that width on load or on a state change, over both locales (the answer: the longest answer sentence of the calculator and the `—` error state; the notice: the "not running" note, with its paragraph margin, and the longest URL notice; the copy: the mounted content, the "Copy link" button, its gap and the status line with its longest status text). The clipboard fallback text field is not content of the copy block: the script inserts it only after the user presses the button, so it is a user-initiated state (its shift carries `hadRecentInput` and is excluded from the layout-shift sum), and the copy reserve is measured against the mounted content. "One line" is a per-block unit: for the answer it is `--text-h3 × --leading-body` (1.375rem × 1.55 = 2.13rem, 34.1 px at the default size); for the notice and the copy block it is the body line, `--text-base × --leading-body` (1.0625rem × 1.55 = 1.65rem, 26.35 px at the default size). An e2e test reads each unit from the computed `line-height` of the block's text, never from a constant.

## MODIFIED Requirements

### Requirement: Layout stability

The page MUST NOT shift layout when scripts run: the result panel and the form reserve their final block size in the server HTML, figures use fixed-width cells, and the area driven by a choice group has the size of its tallest visibility set (derived from the module, `calculator-web-core`). The elements the script reveals or rewrites also reserve their size in the server HTML: the "Copy link" button and its status line, the steppers, the notice area (the "not running" note, then URL notices), and the short answer.

The reserved blocks `answer`, `notice` and `copy` MUST reserve a block size that is set per viewport width, in CSS only (the reserve is the same with scripts disabled and no script measures it). The answer and the notice reserve through a line-count custom property (`--answer-lines`; `--notice-lines` where the notice needs a count of its own) multiplied by that block's line unit (Terms: the answer line for the answer; the body line for the notice when it has its own count), with the line counts changed at breakpoints expressed in `rem` (so they follow the user's text zoom). The copy block, whose mounted content does not wrap at any width, keeps one fixed reserve sized to that content. At each width of the set 320, 390, 480, 640, 768, 1024 and 1280 CSS px, in both directions:
- the content of the block fits its reserve (the content height is at most the reserved height), so nothing overflows or shifts when the script rewrites it;
- the unused reserve (reserved height minus content height) is less than one line of that block (Terms), so no empty gap of a full line or more is left under the answer, the notice or the copy block.

The line-count properties MUST be overridable by a calculator page: a page (or a fixture) that sets one of them on the calculator body changes the reserve of its block with no change to the shared stylesheet, and a calculator that has no such block reserves nothing for it.
(Previously: the short answer was "sized for its longest sentence at the phone width", through fixed reserves (answer 10.75 rem, notice 9 rem, copy 5 rem) that were measured at 320 and 390 px only and left about 104 px empty under the answer on desktop.)

#### Scenario: [CP44] Load shift
- GIVEN Chromium on the phone profile opening `/concrete-calculator` and `/es/calculadora-de-concreto`, with and without a query
- WHEN the load settles
- THEN cumulative layout shift is at most 0.01

#### Scenario: [CP58] Reservation is derived
- GIVEN the concrete page
- WHEN the reserved row count of the shape-driven area is read from the build
- THEN it equals the largest number of fields shown for any shape (four), and a fixture group with a five-field option reserves five

#### Scenario: [CP59] The answer fits its reserve at seven widths
- GIVEN the built concrete pages in Chromium, once per width of 320, 390, 480, 640, 768, 1024 and 1280 px and per locale, with the answer rewritten by the script to each of its four sentences (slab, footing, column, steps) and to the `—` error state
- WHEN the natural height of the answer content (the block measured with its `min-height` set to `0` and `display: flow-root`, then restored) and the reserved height of `data-reserved="answer"` are measured
- THEN the content height is at most the reserved height in every combination (an e2e test in `layout.spec.ts`, run red first against the 10.75 rem constant on the lower-bound side)

#### Scenario: [CP60] The unused answer reserve is under one answer line
- GIVEN the same widths, locales and sentences as [CP59]
- WHEN the reserved height minus the tallest natural height over both locales at that width is computed, and one answer line is read as the computed `line-height` of the answer text (`--text-h3 × --leading-body`, 34.1 px at the default size)
- THEN the difference is less than that line at all seven widths; in particular at 1280 px the gap under the answer is no longer 100 px or more (an e2e test; a recorded measurement of the unused reserve per width is added to the apply progress)

#### Scenario: [CP61] The notice and copy blocks fit with less than one body line unused
- GIVEN the built concrete pages at the seven widths and both locales, with the notice holding the "not running" note (its natural height measured with scripts disabled, with `display: flow-root` on the block so the note's paragraph margin is counted), then each URL notice, and the copy block holding its mounted content (the "Copy link" button, the gap and the status line with the longest status text; the fallback field is not inserted)
- WHEN each block's content height and reserved height are measured, and one line is read as the computed `line-height` of that block's text (the body line, 26.35 px at the default size)
- THEN per block and per width the content fits the reserve and the unused reserve is less than one body line (an e2e test; the notice is measured in its own unit, not in answer lines)

#### Scenario: [CP62] Running the script shifts nothing at any width
- GIVEN Chromium opening `/concrete-calculator` and `/es/calculadora-de-concreto` at each of the seven widths, with and without `?v=1&sh=footing&l=216&n=3`
- WHEN the load settles and the sum of layout-shift entries is taken, and the position of the first element below each reserved block is compared before and after the script mounts
- THEN the sum is at most 0.01 (Lighthouse CLS stays at or below 0.01 on `/concrete-calculator` and `/es/calculadora-de-concreto`, [SQ9]) and the position does not change (an e2e test and the Lighthouse run)

#### Scenario: [CP63] The reserve is CSS-only
- GIVEN the built concrete page in Chromium with JavaScript disabled, and the same page with JavaScript enabled
- WHEN the computed height of each reserved block is read at 390 and 1280 px
- THEN the heights are equal with and without scripts, and the built entry module contains no code that sets a reserved height (a contract test over the entry graph, besides the e2e comparison)

#### Scenario: [CP64] Breakpoints follow text zoom
- GIVEN the source `calculator.css` read by the styles contract test, and the built CSS of the concrete page
- WHEN the `@media` blocks that set a line-count property are collected from each text, and every length inside their conditions is parsed as a number with its unit, whatever the condition syntax (`(min-width: 30rem)` in the source, `(width>=30rem)` in the built CSS, or any other form the minifier emits)
- THEN every length has the unit `rem` and no length has the unit `px`, in both texts, and the set of `rem` values of the built CSS equals the set in the source (a contract test; the design's `WIDTHS` cross-check reads the same source parser)

#### Scenario: [CP65] A calculator page can override the line counts
- GIVEN `CalculatorBody` rendered through the Astro container with the concrete page view and `style="--answer-lines:3"` on the body (a fixture override), and the rectangle-area page view rendered the same way (its module has no answer slot)
- WHEN the markup of the first is read for the inline custom property on the body and its answer block, and the markup of the second is searched for `data-reserved="answer"`
- THEN the first carries `--answer-lines:3` on the calculator body and its answer block keeps the shared `min-height` formula so the reserve resolves to 3 × the answer line with no edit to the shared stylesheet (the formula is the one the styles contract test pins), and the second has no answer block and no reserve for it (a unit test on the two fixtures, in the style of [CP56], in slice H2)

#### Scenario: [CP66] The Spanish concrete page stays within the HTML budget
- GIVEN the full-length budget fixture of `CalculatorBody.budget.test.ts` for the Spanish concrete page, built from the real components with the longest copy, after this change
- WHEN its HTML size is measured and compared with the 40,960 byte limit of [SQ7]
- THEN the page is at most 40,960 bytes, its headroom is not smaller than the 124 bytes measured before this change, the measured headroom is recorded in the apply progress, and `npm run check:site` passes on the real build (the seeded "one byte over" case still fails the gate, [SQ7])
