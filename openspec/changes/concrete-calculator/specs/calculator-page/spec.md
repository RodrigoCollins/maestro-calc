# Delta for calculator-page

The calculator page template in `apps/web`: server-rendered form and default result, a small same-origin module script for live results, URL state, errors, unit system, language switch and "Copy link", the calculator content collection (copy, sources, review date) and the page checks. First instance: `concrete` at `/concrete-calculator` and `/es/calculadora-de-concreto`. Implements PLAN.md §4.2 (partially), §4.3, §5.1 to §5.3, §6.4, §7.1, §7.2, §8.1 (no ad slots yet). Prefix: CP. Numbers come from `calc-concrete` (cases S1, F1, C1, T1 and the bag tables); the default is the approved mockup: slab 12 ft x 10 ft x 4 in, 10 % extra, 80 lb bags. Out of scope: WhatsApp share, print, PWA, embed, live drawing, ready-mix order increments, IRC warnings, hubs, related calculators, analytics events, ads.

Display conventions (both locales, a US audience): decimal point `.`, thousands separator `,`; volumes 2 decimal places; bags whole numbers; money `$` and 2 decimals (rounded for display only, `money`); percent as the canonical decimal (`10`, `12.5`). Dimension text in sentences: US as `12 ft`, `4 in`, `12 ft 6 in`, `5 ft 3 1/2 in`; metric to 2 places as `3.66 m` (144 in), `3.05 m` (120 in), `10.16 cm` (4 in).

## ADDED Requirements

### Requirement: Static render of the default result

At build time each calculator page MUST be rendered in full HTML with the default state of the calculator already computed by the engine: the H1, the short answer sentence, the form with default values, the result panel, the shopping line, the content sections, the "not running" note (see "Progressive enhancement and no-JS") and the estimate note. The page MUST be readable and its result correct with scripts disabled or blocked. Result values sit in elements addressable by output key: `data-output="volumeYd3"`, `volumeFt3`, `volumeM3`, `netVolume`, `bagCost`, `readyMixCost`, and the shopping quantity in `data-shopping="bag-80"` (the id of the purchase unit shown).

The default render is:

| element | en | es |
|---|---|---|
| H1 | `Concrete Calculator` | `Calculadora de Concreto` |
| short answer | `Slab (12 ft × 10 ft, 4 in thick): 1.63 cubic yards with 10% extra. Bags of 80 lb: 74.` | `Losa (12 ft × 10 ft, 4 in de espesor): 1.63 yardas cúbicas con 10% de extra. Bolsas de 80 lb: 74.` |
| `volumeYd3` | `1.63` | `1.63` |
| `volumeFt3` | `44.00` | `44.00` |
| `volumeM3` | `1.25` | `1.25` |
| `netVolume` | `40.00` | `40.00` |
| `data-shopping="bag-80"` | `74` | `74` |
| bag yield line | `About 0.60 cubic feet per bag` | `Unos 0.60 pies cúbicos por bolsa` |
| shopping line | `Concrete mix, 80 lb bags` | `Mezcla de concreto, bolsas de 80 lb` |
| price hint | `Add your price to see the cost` | `Agrega tu precio para ver el costo` |

Cost rows (`bagCost`, `readyMixCost`) are not visible while their price is `$0` (D8); the price hint is visible instead.

#### Scenario: [CP1] Default result in the HTML (EN)
- GIVEN built `/concrete-calculator`, parsed without running scripts
- WHEN the elements of the table are read
- THEN each equals the `en` column, `bagCost` and `readyMixCost` are `hidden`, and the price hint is not `hidden`

#### Scenario: [CP2] Default result in the HTML (ES)
- GIVEN built `/es/calculadora-de-concreto`, parsed without running scripts
- WHEN the elements of the table are read
- THEN each equals the `es` column, with the same figures

#### Scenario: [CP3] Built figures come from the engine
- GIVEN the build-time render
- WHEN the figures are compared with `run({})` of the registry calculator
- THEN `1.63` (44/27 yd3), `44.00`, `1.25` (608369751/488281250 m3), `40.00` and `74` equal the engine output rounded for display

#### Scenario: [CP4] Result addressable by key
- GIVEN the default page
- WHEN `[data-output]` elements are listed
- THEN there is exactly one per output key in the order `volumeYd3`, `volumeFt3`, `volumeM3`, `netVolume`, `bagCost`, `readyMixCost`, and one `[data-shopping]`

### Requirement: Page anatomy and content collection

The page order MUST follow PLAN.md §5.1: H1 and the short answer; the tool (form); the result panel (`h2` from `site.calculator.resultHeading`) with volumes, shopping line and costs; then, from the `calculators` content collection, the sections How to use, Formulas and worked example, Tips and common mistakes, FAQ (questions as `h3`) and Sources and review date, in that order. A breadcrumb (`Home` > calculator name) appears above the H1 as a labelled list, not a second `nav`. No ad slot, related-calculator block or IRC block exists in this change.

The collection `calculators` has one entry per calculator and locale (`concrete` x `en`, `es`: 2 entries). Frontmatter MUST validate: `id` (a calculator id of the web registry; entries may exist before their page is routed, see `site-routing-i18n` `PAGELESS`), `locale`, `updated` (ISO date), `ownerReview` (`pending` or `approved`), `sources` (a non-empty list of `{ name, url, retrieved }` with a non-empty name, an `https` URL and an ISO date), and `workedExample` (`{ netFt3, totalFt3, yd3, bags, bagLb }` as display strings and numbers). The build MUST fail on a missing, unknown or invalid field, on a duplicate `(id, locale)`, on a missing counterpart locale, and on a calculator page id without entries. The section ids are, EN: `how-to-use`, `formulas`, `tips`, `faq`, `sources`; ES: `como-usar`, `formulas`, `consejos`, `preguntas-frecuentes`, `fuentes`. The body has between 800 and 1,500 words per entry (PLAN.md §5.1), each FAQ answer is plain text (no links, emphasis or lists) of at most 600 characters (it is repeated in the `FAQPage` JSON-LD, so the cap bounds the HTML budget), the same number of `h2` and FAQ items in both locales, and no formal imperative or voseo form in the Spanish entry (`trust-pages`: Spanish register and parity).

Sources: `sources` MUST include the yield source of `concreteMix` (same name, URL and `retrieved` date as the data record) and a source for unit conversions (NIST SP 811, Appendix B). The sources section lists each as name, link and "retrieved" date, and shows the `updated` date as `<time datetime="YYYY-MM-DD">` equal to the frontmatter. The waste default is explained as a rule of thumb the user can change, never as a standard. `ownerReview` MUST NOT be rendered (case-insensitively, no `ownerReview`, `draft`, `borrador`, `pending review` in the HTML), and `check:site` prints the count of `pending` entries without failing on it.

The worked example figures live in `workedExample`, are shown in the Formulas section, and a contract test runs the default state through core and requires equality: `netFt3` `40.00`, `totalFt3` `44.00`, `yd3` `1.63`, `bags` `74`, `bagLb` `80`.

#### Scenario: [CP5] Section order and ids
- GIVEN built `/concrete-calculator` and `/es/calculadora-de-concreto`
- WHEN ids and headings are collected in order
- THEN each has one `h1`, the result `h2`, then five content `h2` with the ids above in order, FAQ questions as `h3` inside `faq`/`preguntas-frecuentes`, one `<ol>` with `aria-label` from `site.calculator.breadcrumb` above the `h1`, and exactly one `nav` on the page

#### Scenario: [CP6] Frontmatter is validated
- GIVEN an entry with `sources: []`, or `ownerReview: maybe`, or `updated: 25/10/2026`, or a source `url: "http://..."`, or `workedExample` missing `bags`
- WHEN `npm run build` runs
- THEN it exits non-zero naming the entry and the field

#### Scenario: [CP7] Counterpart and duplicates
- GIVEN the `es` entry removed, and separately a duplicate `(concrete, en)`
- WHEN the content contract test runs
- THEN it fails naming `concrete` and `es`, and the duplicate respectively

#### Scenario: [CP8] Sources and review date
- GIVEN the built calculator pages
- WHEN the sources section is parsed
- THEN it lists the QUIKRETE source with the URL `https://www.quikrete.com/PDFs/DATA_SHEET-Concrete%20Mix%201101.pdf` and `2026-10-25`, and a NIST SP 811 source with a retrieval date, and `time[datetime]` equals the entry's `updated`
- AND the text contains no `ownerReview`, `draft`, `borrador` or `pending review`

#### Scenario: [CP9] Worked example cannot drift
- GIVEN the `workedExample` of each entry
- WHEN the contract test runs the default state through the registry calculator
- THEN the figures equal `40.00`, `44.00`, `1.63`, `74`, `80`, each appears in the Formulas section, and changing one in the Markdown or in the engine alone fails the test

#### Scenario: [CP10] Length and parity
- GIVEN the two entries
- WHEN words, `h2` and FAQ items are counted
- THEN each body has 800 to 1,500 words and the counts of `h2` and of FAQ items are equal across locales

### Requirement: Form controls

The form MUST show only the fields of the selected shape, in this order, each with a visible `<label>` and the unit hint of the active unit system. Hidden fields keep their values and are neither visible nor focusable.

| shape | visible fields |
|---|---|
| `slab` | `length`, `width`, `thickness` |
| `footing` | `length`, `footingWidth`, `footingDepth`, `count` |
| `column` | `diameter`, `height`, `count` |
| `steps` | `stepWidth`, `rise`, `run`, `stepCount` |

Always visible, after the shape fields: `waste` (with `wasteHelp` text, a "Less extra" and a "More extra" button changing it by 5 points within 0 to 50), the bag size (three buttons), `bagPrice`, `readyMixPrice`. The shape (four buttons) and the unit system (two buttons) come first. Single-choice buttons form a labelled group and expose their state with `aria-pressed`. Length, percent and money inputs use `inputmode="decimal"`, counts `inputmode="numeric"`, all `autocomplete="off"`; the form has no submit button. Number inputs are at least 56 CSS px tall and every other control (buttons, toggles) at least 44 by 44 px on a 390 px viewport. Every input has an associated visible label, and the focus ring is the orange ring of `site-shell`. Default text of inputs: `12 ft`, `10 ft`, `4 in`, `16 in`, `8 in`, `12 in`, `8 ft`, `4 ft`, `7 in`, `11 in`, `3`, `1`, `10`; the price inputs are empty with the placeholder `0.00`, and an empty price means `$0` (no error): the script passes an empty price to the engine as an explicitly `undefined` field, which validation reads as the default. The block size of the shape-dependent area is the same for all four shapes (it reserves the tallest, four rows), so switching shape or restoring a shared link shifts nothing below it.

#### Scenario: [CP11] Visible fields per shape
- GIVEN the page with scripts running
- WHEN each shape button is pressed in turn
- THEN the visible shape fields and their order equal the table, the others are `hidden`, and the pressed button has `aria-pressed="true"` and the other three `false`

#### Scenario: [CP12] Labels and keyboards
- GIVEN the default page
- WHEN the controls are inspected
- THEN every input has a label whose text is the `calc.concrete.inputs.<key>` catalog value of the locale, length/percent/money inputs have `inputmode="decimal"`, count inputs `inputmode="numeric"`, and there is no submit button

#### Scenario: [CP13] Touch targets on a phone
- GIVEN Chromium at 390x844
- WHEN the bounding boxes of the visible buttons and inputs are measured
- THEN every button is at least 44 by 44 px and every number input at least 56 px tall

#### Scenario: [CP14] Same block size for all shapes
- GIVEN the form on the phone profile
- WHEN the height of the shape-dependent area is measured for each of the four shapes
- THEN the four heights are equal

### Requirement: Result panel

The result panel shows, in order: the primary volume (cubic yards in the US unit system, cubic meters in the metric one) as the large figure; the other two volumes; the volume before extra (`netVolume`, labelled); the shopping line (`shoppingLine`, the quantity, `bagYield` for the chosen bag); the cost rows when their price is above zero; the ready-mix note; the estimate note followed by a link to the terms page in the current locale. Volumes are the engine outputs rounded for display (2 places); ready-mix volume is never rounded to a truck increment. The panel uses the Blueprint tokens (ink ground, safety orange for what to buy) and keeps the text contrast of `site-shell`.

#### Scenario: [CP15] Order and units
- GIVEN the default page in the US unit system
- WHEN the panel text is read
- THEN the large figure is `1.63` cubic yards, followed by `44.00` cubic feet and `1.25` cubic meters, `40.00` before extra, `Concrete mix, 80 lb bags`, `74`, `About 0.60 cubic feet per bag`

#### Scenario: [CP16] Costs appear with a price
- GIVEN the page with scripts running and `bagPrice` set to `6.50`
- WHEN the panel is read
- THEN `bagCost` is visible with `$481.00` (74 x 6.50), the price hint for bags is gone, and `readyMixCost` stays hidden
- AND with `readyMixPrice` set to `150` as well, `readyMixCost` shows `$244.44` (44/27 yd3 x $150 = 2200/9)

#### Scenario: [CP17] Estimate note and terms link
- GIVEN the built pages
- WHEN the panel footer is read
- THEN it shows `site.calculator.estimateNote` and a link to `/terms` (EN) or `/es/terminos` (ES)

#### Scenario: [CP18] Ready-mix is not rounded
- GIVEN `readyMixPrice` `150` and a slab of 20 ft x 10 ft x 4 in
- WHEN the panel is read
- THEN the volume is `2.72` cubic yards and the cost is `$407.41` (220/81 yd3 x 150 = 33000/81 = 407.407...), with no rounding of the volume to quarter yards

### Requirement: Live recalculation

With scripts running, every edit MUST update the short answer, the figures and the shopping quantity without a button and without a page load, using the same validation and arithmetic as the engine (no second formula implementation). Updates happen on every `input` event and on every button press. The short answer is a polite live region. Pressing Enter in a field MUST NOT navigate or reload.

Hand-verified states (US unit system, defaults otherwise):

| state | yd3 | ft3 | m3 | net ft3 | bags (80 lb unless stated) |
|---|---|---|---|---|---|
| default | 1.63 | 44.00 | 1.25 | 40.00 | 74 |
| `length` = `20` (20 ft) | 2.72 | 73.33 | 2.08 | 66.67 | 123 |
| bag 60 lb | 1.63 | 44.00 | 1.25 | 40.00 | 98 |
| bag 40 lb | 1.63 | 44.00 | 1.25 | 40.00 | 147 |
| `waste` = `0` | 1.48 | 40.00 | 1.13 | 40.00 | 67 |
| `waste` = `15` (More extra once) | 1.70 | 46.00 | 1.30 | 40.00 | 77 |
| footing, defaults (12 ft x 16 in x 8 in, 1 piece) | 0.43 | 11.73 | 0.33 | 10.67 | 20 |
| footing `l=216 n=3` (F1) | 1.96 | 52.80 | 1.50 | 48.00 | 88 |
| column, defaults (C1) | 0.26 | 6.91 | 0.20 | 6.28 | 12 |
| column `n=4` (C2) | 1.02 | 27.65 | 0.78 | 25.13 | 47 |
| steps, defaults (T1) | 0.52 | 14.12 | 0.40 | 12.83 | 24 |

(Arithmetic: `length` 20 ft: 240 x 120 x 4 = 115200 in3 = 200/3 ft3 = 66.67, x 11/10 = 220/3 = 73.33, / 27 = 2.716, 73.33 x 0.0283168 = 2.077, / 0.6 = 122.2 -> 123. Footing defaults: 144 x 16 x 8 = 18432 in3 = 32/3 ft3 = 10.67, x 11/10 = 176/15 = 11.73, / 27 = 0.4346, bags 176/9 = 19.56 -> 20. `waste` 0: 40 / 27 = 1.48, 40 x 0.0283168 = 1.13, 40 / 0.6 = 66.67 -> 67. `waste` 15: 40 x 1.15 = 46, 46 / 27 = 1.704, 46 x 0.0283168 = 1.303, 46 / 0.6 = 76.67 -> 77.)

#### Scenario: [CP19] Typing updates the result
- GIVEN the default EN page with scripts running
- WHEN `20` is typed in the length field (nothing else is pressed)
- THEN the short answer becomes `Slab (20 ft × 10 ft, 4 in thick): 2.72 cubic yards with 10% extra. Bags of 80 lb: 123.` and the figures equal the row for `length` = `20`

#### Scenario: [CP20] Shape switching
- GIVEN the default page
- WHEN Footing, Column and Steps are pressed in turn
- THEN the figures equal the rows footing defaults, column defaults and steps defaults, and each short answer starts with `Footing (`, `Column (`, `Steps (` (EN) or `Zapata (`, `Columna (`, `Escalones (` (ES)

#### Scenario: [CP21] Bag size
- GIVEN the default page
- WHEN the 60 lb button, then the 40 lb button, are pressed
- THEN the bag quantity is `98`, then `147`, the volumes do not change, the yield line reads `About 0.45 cubic feet per bag`, then `About 0.30 cubic feet per bag`, and the short answer ends `Bags of 60 lb: 98.` then `Bags of 40 lb: 147.`

#### Scenario: [CP22] Waste field and steppers
- GIVEN the default page
- WHEN `0` is typed in the waste field, and separately "More extra" is pressed once
- THEN the figures equal the rows `waste` = `0` and `waste` = `15`
- AND "Less extra" at `0` and "More extra" at `50` leave the value unchanged

#### Scenario: [CP23] Enter does not navigate
- GIVEN focus in any input
- WHEN Enter is pressed
- THEN the URL path and the page stay the same and no request is made

#### Scenario: [CP24] Client equals engine
- GIVEN the states of the table and the cases S2, S3 (metric), F1, C2, T1, H of `calc-concrete`
- WHEN each is loaded through its query in Chromium
- THEN every displayed figure equals the engine output rounded for display (the same strings the build-time render produces for that state)

### Requirement: URL state

On load, the script MUST read the query with the URL codec of the engine (`url-state-codec`) and set the shape, fields, bag size, unit system and result from it. After every valid state change it MUST replace the current history entry (`history.replaceState`, no new entry, no scroll or reload) with `?` plus the encoded state (`v=1` first, defaults omitted, `u=m` for metric). It MUST NOT change the URL before the first state change (analytics noise such as `utm_source` survives a bare visit), MUST NOT write the URL while any field is invalid, and MUST NOT use any storage. The path, canonical and alternates never change.

#### Scenario: [CP25] Restore from a shared link
- GIVEN Chromium opening `/concrete-calculator?v=1&sh=footing&l=216&n=3`
- WHEN the script has run
- THEN Footing is pressed, the length field reads `18 ft`, the count field `3`, and the figures equal the row for F1 (1.96 / 52.80 / 1.50 / 48.00 / 88)

#### Scenario: [CP26] Writing the query
- GIVEN the default page
- WHEN `20` is typed in the length field, then the 60 lb button is pressed, then `6.50` is typed in the bag price
- THEN the URL query becomes `?v=1&l=240`, then `?v=1&l=240&bg=60`, then `?v=1&l=240&bg=60&bp=13/2`, and `history.length` is unchanged

#### Scenario: [CP27] Back to defaults
- GIVEN the state `?v=1&l=240`
- WHEN `12` is typed in the length field
- THEN the query becomes `?v=1`

#### Scenario: [CP28] Reload keeps the state
- GIVEN the page after the edits of [CP26]
- WHEN the page is reloaded
- THEN the fields, figures and URL are the same

#### Scenario: [CP29] Bad and noisy links
- GIVEN `?v=1&sh=Slab&bg=50&ws=51`, `?v=2&l=240`, `?utm_source=x&l=240` and a bare visit with `?utm_source=x`
- WHEN each is opened
- THEN the first shows the default state with the notice `A value in the link was not valid and was replaced by the default.` (ES `errors.INVALID_VALUE`), the second the default state with the `errors.UNSUPPORTED_VERSION` notice, the third the 20 ft state with no notice, and the fourth keeps `?utm_source=x` in the address bar until the first edit

### Requirement: Errors without a button

When a field is invalid the script MUST mark it `aria-invalid="true"`, show the catalog message of its error code in an element tied to the input with `aria-describedby`, replace the short answer and every figure by `—`, leave the URL as it was, and keep the layout size unchanged. Bounds in messages are formatted in the unit of the field: `errors.ABOVE_MAX` with `max` `1,000 ft` for `length`. Fixing the field clears the error and restores the figures. An empty price field is not an error. Messages come from the catalog of the page locale (the page carries them as inert HTML).

#### Scenario: [CP30] Malformed length
- GIVEN the default page
- WHEN `abc` is typed in the length field
- THEN the field is `aria-invalid`, its message is `This value is not valid.` (ES `Este valor no es válido.`), the short answer and the figures are `—`, and the URL is unchanged
- AND typing `20` clears the error and restores `2.72`, `123`

#### Scenario: [CP31] Bounds with formatted limits
- GIVEN the page
- WHEN `1001 ft` is typed in the length field, `51` in the waste field, and (footing) `1001` in the count field
- THEN the messages are `The value must be at most 1,000 ft.`, `The value must be at most 50%.` and `The value must be at most 1,000.`
- AND `0` in the count field gives `The value must be at least 1.`

#### Scenario: [CP32] Comma and unit errors
- GIVEN the page
- WHEN `1,5` and `5 furlongs` are typed in the thickness field
- THEN the messages are `errors.DECIMAL_COMMA` and `errors.UNKNOWN_UNIT` of the locale, and no figure is computed

### Requirement: Unit system toggle

The unit system is `imperial` (default) or `metric`, set by two buttons (`site.calculator.unitsUs`, `site.calculator.unitsMetric`) with `aria-pressed`. It MUST NOT change the calculated state: after a toggle every length keeps its exact value, and only the text of the fields, the unit hints, the dimension text of the short answer and the large figure change. The metric text of a field is the exact decimal in metres or centimetres when one exists, otherwise exact inches (for example `127/3 in`); the US text is feet and inches with a fraction of denominator up to 64 when that is exact, otherwise exact inches (for example `20000/127 in`). In both directions re-parsing the text gives the same quantity. Under `metric` a bare number typed in a length field is metres (`length`, `width`, `height`, `stepWidth`) or centimetres (the other length fields), and the large figure is cubic meters, followed by cubic yards and cubic feet. Bag sizes stay in pounds. The choice is only in the URL (`u=m`).

#### Scenario: [CP33] Toggle keeps the state
- GIVEN the default page
- WHEN the metric button is pressed
- THEN the length, width and thickness fields read `3.6576 m`, `3.048 m`, `10.16 cm`, the URL query is `?v=1&u=m`, the large figure is `1.25` cubic meters followed by `1.63` cubic yards and `44.00` cubic feet, the short answer reads `Slab (3.66 m × 3.05 m, 10.16 cm thick): 1.25 cubic meters with 10% extra. Bags of 80 lb: 74.`, and the bag quantity is still `74`
- AND pressing the US button restores `12 ft`, `10 ft`, `4 in` and `?v=1`

#### Scenario: [CP34] Metric entry
- GIVEN the metric unit system
- WHEN `4`, `3` and `10` are typed in length, width and thickness
- THEN the state is case S3 of `calc-concrete`: `1.32` cubic meters, `1.73` cubic yards, `46.62` cubic feet, `42.38` cubic feet before extra, `78` bags of 80 lb, and the query is `?v=1&u=m&l=20000/127&w=15000/127&t=500/127`

#### Scenario: [CP50] Metric entry back to US is exact
- GIVEN the metric unit system and `4` typed in the length field (4 m = 20000/127 in)
- WHEN the US button is pressed
- THEN the length field shows exact inches (`20000/127 in`, since 4 m has no exact feet-inch-fraction text with a denominator up to 64), re-parsing that text gives exactly 20000/127 in, the figures are unchanged, and the query still has `l=20000/127`

#### Scenario: [CP35] Explicit units win
- GIVEN the metric unit system
- WHEN `20 ft` is typed in the length field
- THEN the length is 240 in and the query contains `l=240`

### Requirement: Language switch carries the state

The script MUST keep the `href` of the language switch equal to the table counterpart path plus the current query string (empty when the URL has no query), updating it on load and after every URL write. The state keys are language-free, so the other-locale page restores the same state (`site-routing-i18n`).

#### Scenario: [CP36] Switch href
- GIVEN `/concrete-calculator?v=1&l=240`
- WHEN the script has run
- THEN the switch `href` is `/es/calculadora-de-concreto?v=1&l=240`, and the ES page opened from it shows `2.72` `yardas cúbicas` and `Bolsas de 80 lb: 123`

#### Scenario: [CP37] Bare visit
- GIVEN `/es/calculadora-de-concreto` with no query
- WHEN the script has run
- THEN the switch `href` is `/concrete-calculator`

### Requirement: Copy link

A "Copy link" button (`site.calculator.copyLink`) MUST copy the current absolute page address including the query to the clipboard and then show `site.calculator.linkCopied` in a polite status region. If copying is unavailable or rejected, it MUST show `site.calculator.copyFailed` and a read-only text field holding the address, selected. The button is hidden until the script runs.

#### Scenario: [CP38] Copy succeeds
- GIVEN the default page after `waste` is set to `15`, with clipboard permission
- WHEN "Copy link" is pressed
- THEN the clipboard holds `<origin>/concrete-calculator?v=1&ws=15` and the status reads `Link copied` (ES `Enlace copiado`)

#### Scenario: [CP39] Copy fails
- GIVEN a browser where `navigator.clipboard.writeText` rejects
- WHEN "Copy link" is pressed
- THEN the status reads `Could not copy. Select the link and copy it.` and a read-only field shows the address, selected

### Requirement: Progressive enhancement and no-JS

Controls that only work with the script (shape, unit and bag buttons, steppers, inputs, "Copy link") MUST be rendered `disabled` or `hidden` in the HTML and enabled or revealed by the script, so a reader without scripts never meets a dead control. A static "not running" note MUST be visible in the server HTML, in the reserved notice area above the result: `site.calculator.noscript` followed by the calculator's example sentence (`calc.<id>.page.example`). It is not inside `<noscript>`, so it also covers a reader whose browser runs JavaScript but whose module failed to load or start; the script hides it only after a successful mount, and the notice area keeps its block size (the URL notices of [CP29] use the same area). Crawlers and no-JS readers see the default result, content and JSON-LD.

#### Scenario: [CP40] No-JS reader
- GIVEN Chromium with JavaScript disabled on both calculator pages
- WHEN the page is read
- THEN the default result is visible, the note reads `This page needs JavaScript to recalculate. If it is off or did not load, the result below is the example. Example: a 12 ft by 10 ft slab, 4 in thick.` (ES `Esta página necesita JavaScript para recalcular. Si está desactivado o no cargó, el resultado de abajo es el ejemplo. Ejemplo: una losa de 12 ft por 10 ft, de 4 in de espesor.`), "Copy link" is not visible and the form controls are disabled

#### Scenario: [CP41] Script enables the controls
- GIVEN the same page with scripts running
- WHEN the script has mounted
- THEN no control is `disabled`, "Copy link" is visible and the "not running" note is not shown

#### Scenario: [CP49] Module fails to load
- GIVEN Chromium with JavaScript enabled and the request for the entry module aborted
- WHEN the page loads
- THEN the "not running" note stays visible, the controls stay disabled, and the default result is shown

### Requirement: Client script contract

Each calculator MUST have one client entry module of its own (`apps/web/src/client/entries/<id>.ts`), shared by both locales of that calculator, produced by the web build and loaded with `<script type="module" src>` from the page. The entry MAY statically import same-origin hashed chunks; the entry plus its whole static import graph MUST be at most 32,768 bytes (`site-quality`). The entry imports only its own calculator (never the registry `apps/web/src/lib/calculators.ts`) and builds it from the yields-only module of `@maestro-calc/data` (`material-data-contract`), never from the material record, so no source name, URL or other metadata reaches the bundle. It uses the engine's validation, arithmetic and URL codec from the workspace packages (no copy of a formula). It MUST contain no message text (strings arrive as inert HTML templates in the page: error messages for the 12 user-facing codes, the answer sentences, labels), no storage or network API, no third-party code, and no `https://` URL other than the site origin. The same figures MUST come out of the build-time render and of the script for any state (shared formatting).

#### Scenario: [CP42] One entry per calculator, shared by both locales
- GIVEN the built `dist`
- WHEN the script URLs of `/concrete-calculator` and `/es/calculadora-de-concreto` are compared and the static import graph of that entry is resolved
- THEN both pages load the same entry file, the entry plus its static graph is at most 32,768 bytes, and no file of the graph contains catalog message text of either locale

#### Scenario: [CP47] No foreign origin in the entry graph
- GIVEN the built entry of `concrete` and every file of its static import graph
- WHEN searched for `https://` and `http://`
- THEN the only match allowed is the site origin `https://maestrocalc.com`, and the QUIKRETE source URL appears only in the HTML (as an allowlisted outbound link), never in JavaScript

#### Scenario: [CP48] Entry does not import the registry
- GIVEN the module graph of `apps/web/src/client/entries/concrete.ts`
- WHEN the contract test walks its imports
- THEN neither `apps/web/src/lib/calculators.ts`, nor another calculator directory of core, nor the root entry of `@maestro-calc/data` is reached

#### Scenario: [CP43] Message templates are inert HTML
- GIVEN the built page
- WHEN the message templates are read
- THEN the 12 user-facing error messages (with their `{min}` / `{max}` placeholders), the four answer sentences and the notice texts are present in the page's locale in `<template>` elements, and none of them is rendered until the script uses it

### Requirement: Layout stability

The page MUST NOT shift layout when scripts run: the result panel and the form reserve their final block size in the server HTML, figures use fixed-width cells, and the shape-dependent area has the size of its tallest shape. The elements the script reveals or rewrites also reserve their size in the server HTML: the "Copy link" button and its status line, the waste steppers, the notice area (the "not running" note, then URL notices), and the short answer (sized for its longest shape sentence at the phone width, so a footing or steps sentence does not add a line).

#### Scenario: [CP44] Load shift
- GIVEN Chromium on the phone profile opening `/concrete-calculator` and `/es/calculadora-de-concreto`, with and without a query
- WHEN the load settles
- THEN cumulative layout shift is at most 0.01

### Requirement: Accessibility of the interactive page

Every state of the page MUST pass axe-core with the tags of `site-quality` (0 violations): default, each shape, error state, metric, cost rows visible, copy-failed fallback. Focus moves in visual order; the skip link, header, language switch and footer keep working; reduced-motion users get no animation of figures.

#### Scenario: [CP45] Keyboard path
- GIVEN the EN calculator page
- WHEN the user tabs from the skip link through the header links
- THEN focus then visits the unit buttons, the shape buttons, the visible fields in order, the waste buttons, the bag-size buttons, the price fields and "Copy link" in that order, each with the orange focus ring

#### Scenario: [CP46] Error association
- GIVEN an invalid field
- WHEN its accessibility tree entry is read
- THEN the input has `aria-invalid="true"` and an accessible description equal to the error message
