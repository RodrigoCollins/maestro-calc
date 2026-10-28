# Delta for calculator-page

Second live page (`rectangle-area`, Square Footage). Two requirements change: "Page anatomy and content collection" (the content contracts apply per entry and per id, `workedExample` is strict per id, entries may be staged before their page is routed) and "Layout stability" (a page declares its own answer and notice line counts, emitted as one `<style>` in the head of that page only, and [CP60] and [CP61] hold on the second page). Continues the prefix CP (next free id: CP67). Changed: [CP6], [CP7], [CP8], [CP9], [CP10], [CP60], [CP64], [CP65], [CP66] (wording of today's headroom; the 40,836 B pin is unchanged). Added: [CP67] to [CP75]. Kept as written: [CP5], [CP44], [CP58], [CP59], [CP61] to [CP63]. Every other requirement of the capability is unchanged.

## MODIFIED Requirements

### Requirement: Page anatomy and content collection

The page order MUST follow PLAN.md §5.1: H1 and the short answer; the tool (form); the result panel (`h2` from `site.calculator.resultHeading`) with volumes, shopping line and costs (for a calculator with no shopping or cost slot, the figures it has); then, from the `calculators` content collection, the sections How to use, Formulas and worked example, Tips and common mistakes, FAQ (questions as `h3`) and Sources and review date, in that order. A breadcrumb (`Home` > calculator name) appears above the H1 as a labelled list, not a second `nav`. No ad slot, related-calculator block or IRC block exists in this change.

The collection `calculators` has one entry per calculator and locale (`concrete` and `rectangle-area` x `en`, `es`: 4 entries). Frontmatter MUST validate: `id` (a calculator id of the web registry; entries may exist before their page is routed, see `site-routing-i18n` `PAGELESS`, and the content contract tables of the next paragraph accept such a staged id), `locale`, `updated` (ISO date), `ownerReview` (`pending` or `approved`), `sources` (a non-empty list of `{ name, url, retrieved }` with a non-empty name, an `https` URL and an ISO date), and `workedExample`, whose shape is strict per `id` and selected by `id`: for `concrete`, `{ netFt3, totalFt3, yd3, bags, bagLb }` as display strings and numbers; for `rectangle-area`, the input state as a query and the displayed figures (`query` `v=1&l=144`, `ft2` `120.00`, `yd2` `13.33`, `m2` `11.15`; the exact field names are a design decision). A generic string record is not accepted, so a typo in a figure name fails the strict schema. The build MUST fail on a missing, unknown or invalid field, on a duplicate `(id, locale)`, on a missing counterpart locale, and on a calculator page id without entries. The section ids are, EN: `how-to-use`, `formulas`, `tips`, `faq`, `sources`; ES: `como-usar`, `formulas`, `consejos`, `preguntas-frecuentes`, `fuentes`. The body has between 800 and 1,500 words per entry (PLAN.md §5.1), each FAQ answer is plain text (no links, emphasis or lists) of at most 450 characters (it is repeated in the `FAQPage` JSON-LD, so the cap bounds the HTML budget), the same number of `h2` and FAQ items in both locales (8 FAQ items for `rectangle-area`), and no formal imperative or voseo form in the Spanish entry (`trust-pages`: Spanish register and parity).

The content, methodology and budget contracts MUST be tables by calculator id (each row names the id, its figures or constants and its expected entries), so a third calculator adds rows and no test file. A table row MAY exist for an id that is in the registry and not yet in `CALCULATOR_PAGES`; an entry whose id is in neither the page list nor a table row is still rejected as unexpected.
(Previously: the content contract rejected every entry outside `CALCULATOR_PAGES` as unexpected, and `workedExample` had the concrete shape only.)

Sources: `sources` MUST include, for each material the calculator uses, the yield source of that material (for `concrete`, `concreteMix`: same name, URL and `retrieved` date as the data record) and a source for unit conversions (NIST SP 811, Appendix B). `rectangle-area` uses no material, so its sources are NIST SP 811 Appendix B (and any other conversion source the content cites). The sources section lists each as name, link and "retrieved" date, and shows the `updated` date as `<time datetime="YYYY-MM-DD">` equal to the frontmatter. The waste default of `concrete` is explained as a rule of thumb the user can change, never as a standard. `ownerReview` MUST NOT be rendered (case-insensitively, no `ownerReview`, `draft`, `borrador`, `pending review` in the HTML), and `check:site` prints the count of `pending` entries without failing on it.

The worked example figures live in `workedExample`, are shown in the Formulas section, and a contract test runs the example state through core and requires equality: for `concrete` the default state (`netFt3` `40.00`, `totalFt3` `44.00`, `yd3` `1.63`, `bags` `74`, `bagLb` `80`); for `rectangle-area` the state decoded from the `query` of the example, which is 12 ft × 10 ft and not the 10 ft × 10 ft default (`ft2` `120.00`, `yd2` `13.33`, `m2` `11.15`).

#### Scenario: [CP5] Section order and ids
- GIVEN built `/concrete-calculator` and `/es/calculadora-de-concreto`
- WHEN ids and headings are collected in order
- THEN each has one `h1`, the result `h2`, then five content `h2` with the ids above in order, FAQ questions as `h3` inside `faq`/`preguntas-frecuentes`, one `<ol>` with `aria-label` from `site.calculator.breadcrumb` above the `h1`, and exactly one `nav` on the page

#### Scenario: [CP6] Frontmatter is validated
- GIVEN an entry (of either id) with `sources: []`, or `ownerReview: maybe`, or `updated: 25/10/2026`, or a source `url: "http://..."`, or a `concrete` `workedExample` missing `bags`, or a `rectangle-area` `workedExample` missing its `query` or with a misspelled figure name
- WHEN `npm run build` runs
- THEN it exits non-zero naming the entry and the field (a build test per id)

#### Scenario: [CP7] Counterpart and duplicates
- GIVEN, per id, the `es` entry removed, and separately a duplicate `(id, en)`, for `concrete` and for `rectangle-area`
- WHEN the content contract test runs
- THEN it fails naming the id (`concrete` or `rectangle-area`) and `es`, and the duplicate respectively (a contract test over the table of ids)

#### Scenario: [CP8] Sources and review date
- GIVEN the built calculator pages of every id in `CALCULATOR_PAGES`
- WHEN the sources section is parsed
- THEN for `concrete` it lists the QUIKRETE source with the URL `https://www.quikrete.com/PDFs/DATA_SHEET-Concrete%20Mix%201101.pdf` and `2026-10-25`, and a NIST SP 811 source with a retrieval date; for `rectangle-area` it lists NIST SP 811 Appendix B with a retrieval date; and `time[datetime]` equals the entry's `updated`
- AND the text contains no `ownerReview`, `draft`, `borrador` or `pending review`

#### Scenario: [CP9] Worked example cannot drift
- GIVEN the `workedExample` of each entry of each id
- WHEN the contract test runs the example state through the registry calculator (the default state for `concrete`, the decoded `query` `v=1&l=144` for `rectangle-area`)
- THEN `concrete` figures equal `40.00`, `44.00`, `1.63`, `74`, `80` and `rectangle-area` figures equal `120.00`, `13.33`, `11.15`, each appears in the Formulas section, and changing one in the Markdown or in the engine alone fails the test (a contract test)

#### Scenario: [CP10] Length and parity
- GIVEN the four entries
- WHEN words, `h2` and FAQ items are counted per id
- THEN each body has 800 to 1,500 words, the counts of `h2` and of FAQ items are equal across the locales of an id, and `rectangle-area` has 8 FAQ items in each locale (a contract test)

### Requirement: Layout stability

The page MUST NOT shift layout when scripts run: the result panel and the form reserve their final block size in the server HTML, figures use fixed-width cells, and the area driven by a choice group has the size of its tallest visibility set (derived from the module, `calculator-web-core`). The elements the script reveals or rewrites also reserve their size in the server HTML: the "Copy link" button and its status line, the steppers, the notice area (the "not running" note, then URL notices), and the short answer.

The reserved blocks `answer`, `notice` and `copy` MUST reserve a block size that is set per viewport width, in CSS only (the reserve is the same with scripts disabled and no script measures it). The answer and the notice reserve through a line-count custom property (`--answer-lines`; `--notice-lines` where the notice needs a count of its own) multiplied by that block's line unit (Terms: the answer line for the answer; the body line for the notice when it has its own count), with the line counts changed at breakpoints expressed in `rem` (so they follow the user's text zoom). The copy block, whose mounted content does not wrap at any width, keeps one fixed reserve sized to that content. At each width of the set 320, 390, 480, 640, 768, 1024 and 1280 CSS px, in both directions:
- the content of the block fits its reserve (the content height is at most the reserved height), so nothing overflows or shifts when the script rewrites it;
- the unused reserve (reserved height minus content height) is less than one line of that block (Terms), so no empty gap of a full line or more is left under the answer, the notice or the copy block.

The line-count properties MUST be overridable by a calculator page: a page declares its own counts per breakpoint, for the answer and for the notice, in its row of the page table (`PAGES[id].reserve`), and the build emits them as one `<style>` in the `<head>` of that page only, setting `--answer-lines` and `--notice-lines` on `.calculator` with `rem` breakpoints. A fixture sets them the same way, through a head style. The shared stylesheet is not edited, the calculator body carries no inline style (the body has no `style` prop), a page without a `reserve` emits no such `<style>` and carries 0 extra bytes, and a calculator that has no answer block reserves nothing for it. An inline style on the body is not accepted: it holds one value for every width, while the counts of a short sentence change with the width. The `rectangle-area` page declares both counts (its area sentence and its "not running" note are shorter than concrete's, for which the shared counts are sized); its counts and breakpoints are measured on the built page in Chromium on macOS and on Linux before they are pinned, the breakpoints following the later drop of the two, never guessed. `concrete` keeps the shared counts of `calculator.css`.
(Previously: the short answer was "sized for its longest sentence at the phone width", through fixed reserves (answer 10.75 rem, notice 9 rem, copy 5 rem) that were measured at 320 and 390 px only and left about 104 px empty under the answer on desktop; the override was an inline style on the calculator body.)

Terms. A reserved block is a block marked `data-reserved="answer"`, `"notice"` or `"copy"` ([CP54] hooks). Its content at a width is the tallest content the page puts in it at that width on load or on a state change, over both locales (the answer: the longest answer sentence of the calculator and the `—` error state; the notice: the "not running" note, with its paragraph margin, and the longest URL notice; the copy: the mounted content, the "Copy link" button, its gap and the status line with its longest status text). The clipboard fallback text field is not content of the copy block: the script inserts it only after the user presses the button, so it is a user-initiated state (its shift carries `hadRecentInput` and is excluded from the layout-shift sum), and the copy reserve is measured against the mounted content. "One line" is a per-block unit: for the answer it is `--text-h3 × --leading-body` (1.375rem × 1.55 = 2.13rem, 34.1 px at the default size); for the notice and the copy block it is the body line, `--text-base × --leading-body` (1.0625rem × 1.55 = 1.65rem, 26.35 px at the default size). An e2e test reads each unit from the computed `line-height` of the block's text, never from a constant.

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
- GIVEN the same widths, locales and sentences as [CP59] on the concrete pages, and the same widths and locales on the `rectangle-area` pages with the answer rewritten to each of the four hand-verified cases of `calc-rectangle-area` (in imperial and in metric) and to the `—` error state
- WHEN the reserved height minus the tallest natural height over both locales at that width is computed, and one answer line is read as the computed `line-height` of the answer text (`--text-h3 × --leading-body`, 34.1 px at the default size)
- THEN the difference is less than that line at all seven widths, except at the last pixel width before a breakpoint of that page and that block (derived from the CSS the page ships: the page's own `reserve` rules where it sets the property, otherwise the shared rules of `calculator.css`; the breakpoints of another page never widen this allowance), where it is less than two lines (text wraps a few pixels earlier on some platforms than where the breakpoints were measured; the breakpoints follow the latest drop so the content fits everywhere, amended 2026-10-27 after CI on Linux Chromium); in particular at 1280 px the gap under the answer is no longer 100 px or more (an e2e test driven by the `answer` group of the page's record; a recorded measurement of the unused reserve per width, for each page, is added to the apply progress)

#### Scenario: [CP61] The notice and copy blocks fit with less than one body line unused
- GIVEN the built concrete pages at the seven widths and both locales, with the notice holding the "not running" note (its natural height measured with scripts disabled, with `display: flow-root` on the block so the note's paragraph margin is counted), then each URL notice, and the copy block holding its mounted content (the "Copy link" button, the gap and the status line with the longest status text; the fallback field is not inserted)
- WHEN each block's content height and reserved height are measured, and one line is read as the computed `line-height` of that block's text (the body line, 26.35 px at the default size)
- THEN per block and per width the content fits the reserve and the unused reserve is less than one body line, or less than two at the last pixel width before a breakpoint (as in [CP60]) (an e2e test; the notice is measured in its own unit, not in answer lines)

#### Scenario: [CP62] Running the script shifts nothing at any width
- GIVEN Chromium opening `/concrete-calculator` and `/es/calculadora-de-concreto` at each of the seven widths, with and without `?v=1&sh=footing&l=216&n=3`
- WHEN the load settles and the sum of layout-shift entries is taken, and the position of the first element below each reserved block is compared before and after the script mounts
- THEN the sum is at most 0.01 (Lighthouse CLS stays at or below 0.01 on `/concrete-calculator` and `/es/calculadora-de-concreto`, [SQ9]) and the position does not change (an e2e test and the Lighthouse run)

#### Scenario: [CP63] The reserve is CSS-only
- GIVEN the built concrete page in Chromium with JavaScript disabled, and the same page with JavaScript enabled
- WHEN the computed height of each reserved block is read at 390 and 1280 px
- THEN the heights are equal with and without scripts, and the built entry module contains no code that sets a reserved height (a contract test over the entry graph, besides the e2e comparison)

#### Scenario: [CP64] Breakpoints follow text zoom
- GIVEN the source `calculator.css` read by the styles contract test, the built CSS of the concrete page, and the CSS of every `reserve` of the page table (the output of the reserve builder for each row, and the head `<style>` of each built page that has a `reserve`)
- WHEN the `@media` blocks that set a line-count property are collected from each text, and every length inside their conditions is parsed as a number with its unit, whatever the condition syntax (`(min-width: 30rem)` in the source, `(width>=30rem)` in the built CSS, or any other form the minifier emits)
- THEN every length has the unit `rem` and no length has the unit `px`, in every text; the set of `rem` values of the built concrete CSS equals the set in the source; the set of each built page's head `<style>` equals the breakpoints of its `reserve`; the reserve builder throws on a non-`rem` or non-increasing breakpoint and on a count that is not a positive integer; and both pixel edges of every breakpoint of `calculator.css` and of every `reserve` are among the e2e widths of `layout.spec.ts` (a contract test; the `WIDTHS` cross-check reads the same parser)
(Previously: `calculator.css` and the built concrete CSS only.)

#### Scenario: [CP65] A calculator page can override the line counts
- GIVEN the layout and `CalculatorBody` rendered through the Astro container with the concrete page view and a fixture head style `.calculator{--answer-lines:3}` (a fixture override), the built `rectangle-area` and `concrete` pages, and a test-only slot-free page module (`calculator-web-core` proof) rendered through the container
- WHEN the `<head>` and the calculator body of each are read
- THEN the fixture carries the rule in one `<style>` in the `<head>`, no `<style>` in the body and no `style` attribute on the calculator body, and its answer block keeps the shared `min-height` formula, so the reserve resolves to 3 × the answer line with no edit to the shared stylesheet (the formula is the one the styles contract test pins); the built `rectangle-area` page has a `data-reserved="answer"` block and one head `<style>` whose text equals the reserve builder's output for `PAGES['rectangle-area'].reserve`, setting both `--answer-lines` and `--notice-lines` on `.calculator`, while the built `concrete` page has no such `<style>` and no calculator body carries a `style` attribute; and the slot-free module has no answer block and no reserve for it (a unit test on the fixtures, in the style of [CP56], and a build test on the two pages once `rectangle-area` is routed)
(Previously: the override was an inline style on the calculator body, the second fixture was the rectangle-area view with no answer slot, and no page used the override.)

#### Scenario: [CP66] The Spanish concrete page stays within the HTML budget
- GIVEN the full-length budget fixture of `CalculatorBody.budget.test.ts` for the Spanish concrete page, built from the real components with the longest copy, after this change
- WHEN its HTML size is measured and compared with the 40,960 byte limit of [SQ7]
- THEN the page is at most 40,836 bytes (the pin; it measures 40,573 B before this change, which is 263 B under the pin and 387 B under the 40,960 byte limit), so its headroom to 40,960 B is never smaller than 124 bytes, the measured size and both margins are recorded in the apply progress, and `npm run check:site` passes on the real build (the seeded "one byte over" case still fails the gate, [SQ7])

#### Scenario: [CP67] Static render of the square footage page
- GIVEN built `/square-footage-calculator` and `/es/calculadora-de-pies-cuadrados` parsed with no script run
- WHEN the H1, the answer, the result figures and the sections are read
- THEN the H1 is `Square Footage Calculator` (en) and `Calculadora de pies cuadrados` (es), the answer is the default sentence of `calc-rectangle-area` [RAP2], `data-output` `areaFt2`, `areaYd2` and `areaM2` read `100.00`, `11.11` and `9.29`, the large figure mirrors `areaFt2` (`[data-primary]`, whose own row is `hidden`), and there is no choice, stepper, shopping, cost or price element (a build test over the dist HTML)

#### Scenario: [CP68] Same anatomy as the first page
- GIVEN the same two built pages
- WHEN ids and headings are collected as in [CP5]
- THEN each has one `h1`, the result `h2`, the five content `h2` with the ids of this requirement in order, FAQ questions as `h3` inside `faq` / `preguntas-frecuentes` (8 each), one breadcrumb `<ol>` above the `h1` and exactly one `nav` (a build test, through the same table-driven helper as [CP5])

#### Scenario: [CP69] A staged entry may merge before the page is routed
- GIVEN the `rectangle-area` entries present (`ownerReview: pending`) while `rectangle-area` is still in `PAGELESS`, and a third entry for an id that is in neither the registry nor a table row
- WHEN the content contract test runs
- THEN it passes for the staged `rectangle-area` entries (no "unexpected" problem), fails naming the third id, and `check:site` prints the pending count without failing (a contract test)

#### Scenario: [CP70] Content cites the right sources and the worked example
- GIVEN the built `rectangle-area` pages in both locales
- WHEN the Formulas and Sources sections are read
- THEN Formulas shows `12 ft`, `10 ft`, `120.00`, `13.33` and `11.15` (the example of [CP9], `ft` in both locales), Sources cites NIST SP 811 Appendix B with a retrieval date, the page links to `/methodology#square-footage` (en) and `/es/metodologia#pies-cuadrados` (es), and the entries have `ownerReview: approved` at the go-live merge while the HTML shows no `ownerReview`, `draft`, `borrador` or `pending review` (a build test)
- AND the apply progress records the owner's explicit approval of both entries, with its date and where it was given (the chat or a linked PR comment), before the commit that sets `ownerReview: approved`; no agent sets `approved` without that record (a process check of the verify phase: the go-live is gated on it)

#### Scenario: [CP71] The four hand-verified cases reproduce from their links
- GIVEN Chromium on `/square-footage-calculator` and `/es/calculadora-de-pies-cuadrados` opened with `?v=1&l=144`, `?v=1`, `?v=1&l=150` and `?v=1&l=240&w=180`
- WHEN the script mounts
- THEN the three rows read `120.00` / `13.33` / `11.15`, `100.00` / `11.11` / `9.29`, `125.00` / `13.89` / `11.61` and `300.00` / `33.33` / `27.87` (ft² / yd² / m²), and the answer sentence names the dimensions of the case (an e2e test driven by the `states` of the `rectangle-area` record)

#### Scenario: [CP72] The metric toggle shows square meters with its unit
- GIVEN the same page with the metric toggle pressed, or opened with `u=m`
- WHEN the large figure and the answer are read
- THEN the large figure is the m² value (`9.29` by default, `11.15` for the worked example), the answer ends with `square meters.` / `metros cuadrados.`, and the ft² row is shown as a secondary row (an e2e test)

#### Scenario: [CP73] The answer and notice reserves are measured on this page too
- GIVEN the built `rectangle-area` pages with their per-page head reserve of [CP65], the widths, locales and sentences of [CP60], and the notice holding the "not running" note of this page (`noscript` text plus `calc.rectangle-area.page.example`, measured as in [CP61]) and each URL notice
- WHEN [CP59], [CP60], [CP61] and the cumulative layout shift of [CP62] are measured
- THEN the answer fits its reserve and the unused answer reserve is under one answer line, and the notice fits its reserve and the unused notice reserve is under one body line, each with two lines allowed only at the last pixel width before a breakpoint of this page and that block, at all seven widths and every breakpoint edge in both locales; the layout shift is at most 0.01; and the line counts that pass are the ones recorded in the apply progress, with the macOS and Linux sweeps they came from (an e2e test through the `answer` group and the notice probe of the `rectangle-area` record)

#### Scenario: [CP74] The page renders with scripts disabled
- GIVEN the built `rectangle-area` pages in Chromium with JavaScript disabled, and the same with JavaScript enabled
- WHEN the answer, the three figures and the heights of the reserved blocks are read at 390 and 1280 px
- THEN the figures read `100.00`, `11.11`, `9.29`, the answer is the default sentence, the "not running" note shows, and the reserved heights equal those with JavaScript enabled (an e2e test, [CP63] for the second page)

#### Scenario: [CP75] The new page keeps the entry and the HTML within budget
- GIVEN a clean `npm run build` with both calculator pages routed
- WHEN `npm run check:site` and the entry contracts run
- THEN each `rectangle-area` HTML file is at most 40,960 bytes with the full-length copy of its entries, its entry module and static graph are at most 49,152 bytes with no concrete module and no choice, stepper, shopping or cost slot in the graph, its page weight is at most 196,608 bytes, and the measured sizes are recorded in the apply progress (a build test and the existing entry contracts; no budget is raised)
