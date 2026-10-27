# Delta for calculator-page

Replaces the fixed reserved sizes of the answer, notice and copy blocks by a size that fits the content at every width, fixing the empty gap under the answer on desktop (a 10.75 rem reserve for a sentence that wraps to two lines there). Only the "Layout stability" requirement changes; every other CP requirement is unchanged. Continues the prefix CP (next free id: CP59). Kept as written: [CP44], [CP58].

Terms. A reserved block is a block marked `data-reserved="answer"`, `"notice"` or `"copy"` ([CP54] hooks). Its content at a width is the tallest content it can hold at that width, over both locales and every state the page can put in it (the answer: the longest answer sentence of the calculator; the notice: the "not running" note and the longest URL notice; the copy: the status text and the fallback text field). One line is the computed line height of that block's text.

## MODIFIED Requirements

### Requirement: Layout stability

The page MUST NOT shift layout when scripts run: the result panel and the form reserve their final block size in the server HTML, figures use fixed-width cells, and the area driven by a choice group has the size of its tallest visibility set (derived from the module, `calculator-web-core`). The elements the script reveals or rewrites also reserve their size in the server HTML: the "Copy link" button and its status line, the steppers, the notice area (the "not running" note, then URL notices), and the short answer.

The reserved blocks `answer`, `notice` and `copy` MUST reserve a block size that is set per viewport width, in CSS only (the reserve is the same with scripts disabled and no script measures it), through a line-count custom property per block (`--answer-lines`, `--notice-lines`, `--copy-lines`) multiplied by that block's line height, with the line counts changed at breakpoints expressed in `rem` (so they follow the user's text zoom). At each width of the set 320, 390, 480, 640, 768, 1024 and 1280 CSS px, in both directions:
- the content of the block fits its reserve (the content height is at most the reserved height), so nothing overflows or shifts when the script rewrites it;
- the unused reserve (reserved height minus content height) is less than one line, so no empty gap of a full line or more is left under the answer, the notice or the copy block.

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
- WHEN the height of the answer content and the reserved height of `data-reserved="answer"` are measured
- THEN the content height is at most the reserved height in every combination (an e2e test in `layout.spec.ts`, run red first against the 10.75 rem constant on the lower-bound side)

#### Scenario: [CP60] The unused answer reserve is under one line
- GIVEN the same widths, locales and sentences as [CP59]
- WHEN the reserved height minus the height of the longest sentence at that width is computed
- THEN it is less than one line (the computed line height of the answer), at all seven widths; in particular at 1280 px the gap under the answer is no longer 100 px or more (an e2e test; a recorded measurement of the unused reserve per width is added to the apply progress)

#### Scenario: [CP61] The notice and copy blocks fit with less than one line unused
- GIVEN the built concrete pages at the seven widths and both locales, with the notice showing the "not running" note, then each URL notice, and the copy block showing its status text and its fallback field
- WHEN each block's content height and reserved height are measured
- THEN the content fits the reserve and the unused reserve is less than one line, per block and per width (an e2e test; the "not running" note is the content measured when scripts are disabled)

#### Scenario: [CP62] Running the script shifts nothing at any width
- GIVEN Chromium opening `/concrete-calculator` and `/es/calculadora-de-concreto` at each of the seven widths, with and without `?v=1&sh=footing&l=216&n=3`
- WHEN the load settles and the sum of layout-shift entries is taken, and the position of the first element below each reserved block is compared before and after the script mounts
- THEN the sum is at most 0.01 (Lighthouse CLS stays at or below 0.01 on `/concrete-calculator` and `/es/calculadora-de-concreto`, [SQ9]) and the position does not change (an e2e test and the Lighthouse run)

#### Scenario: [CP63] The reserve is CSS-only
- GIVEN the built concrete page in Chromium with JavaScript disabled, and the same page with JavaScript enabled
- WHEN the computed height of each reserved block is read at 390 and 1280 px
- THEN the heights are equal with and without scripts, and the built entry module contains no code that sets a reserved height (a contract test over the entry graph, besides the e2e comparison)

#### Scenario: [CP64] Breakpoints follow text zoom
- GIVEN the built stylesheet
- WHEN the media queries that change the line-count properties are read
- THEN every one is expressed in `rem` or `em` and none in `px` (a contract test over the built CSS)

#### Scenario: [CP65] A calculator page can override the line counts
- GIVEN a fixture calculator body that sets `--answer-lines` to a value different from the shared one, rendered through the real components, and a second fixture with no answer slot
- WHEN the computed reserved height of the answer block is read at 390 and 1280 px, and the page markup is searched for `data-reserved="answer"`
- THEN the first reserves its own line count multiplied by the answer line height with no edit to the shared stylesheet, and the second has no answer block and no reserve for it (a unit/e2e test on the fixtures, in the style of [CP56])

#### Scenario: [CP66] The Spanish concrete page stays within the HTML budget
- GIVEN the full-length budget fixture of `CalculatorBody.budget.test.ts` for the Spanish concrete page, built from the real components with the longest copy, after this change
- WHEN its HTML size is measured and compared with the 40,960 byte limit of [SQ7]
- THEN the page is at most 40,960 bytes, its headroom is not smaller than the 124 bytes measured before this change, the measured headroom is recorded in the apply progress, and `npm run check:site` passes on the real build (the seeded "one byte over" case still fails the gate, [SQ7])
