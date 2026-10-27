# calculator-page

The calculator page template in `apps/web`: server-rendered form and default result, a small same-origin module script for live results, URL state, errors, unit system, language switch and "Copy link", the calculator content collection (copy, sources, review date) and the page checks. First instance: `concrete` at `/concrete-calculator` and `/es/calculadora-de-concreto`; every later calculator uses the same template through the generic core (`calculator-web-core`). Implements PLAN.md §4.2 (partially), §4.3, §5.1 to §5.3, §6.4, §7.1, §7.2, §8.1 (no ad slots yet). Prefix: CP. Numbers come from `calc-concrete` (cases S1, F1, C1, T1 and the bag tables); the default is the approved mockup: slab 12 ft x 10 ft x 4 in, 10 % extra, 80 lb bags. Out of scope: WhatsApp share, print, PWA, embed, live drawing, ready-mix order increments, IRC warnings, hubs, related calculators, analytics events, ads.

Display conventions (both locales, a US audience): decimal point `.`, thousands separator `,`; volumes 2 decimal places; bags whole numbers; money `$` and 2 decimals (rounded for display only, `money`); percent as the canonical decimal (`10`, `12.5`). Dimension text in sentences: US as `12 ft`, `4 in`, `12 ft 6 in`, `5 ft 3 1/2 in`; metric to 2 places as `3.66 m` (144 in), `3.05 m` (120 in), `10.16 cm` (4 in).

## Requirements

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
- AND the large figure is a mirror of one of the volume rows (`[data-primary]`, naming its output key); the row of the volume it mirrors is `hidden`, so cubic yards (US) or cubic meters (metric) is never shown twice

### Requirement: Page anatomy and content collection

The page order MUST follow PLAN.md §5.1: H1 and the short answer; the tool (form); the result panel (`h2` from `site.calculator.resultHeading`) with volumes, shopping line and costs; then, from the `calculators` content collection, the sections How to use, Formulas and worked example, Tips and common mistakes, FAQ (questions as `h3`) and Sources and review date, in that order. A breadcrumb (`Home` > calculator name) appears above the H1 as a labelled list, not a second `nav`. No ad slot, related-calculator block or IRC block exists in this change.

The collection `calculators` has one entry per calculator and locale (`concrete` x `en`, `es`: 2 entries). Frontmatter MUST validate: `id` (a calculator id of the web registry; entries may exist before their page is routed, see `site-routing-i18n` `PAGELESS`), `locale`, `updated` (ISO date), `ownerReview` (`pending` or `approved`), `sources` (a non-empty list of `{ name, url, retrieved }` with a non-empty name, an `https` URL and an ISO date), and `workedExample` (`{ netFt3, totalFt3, yd3, bags, bagLb }` as display strings and numbers). The build MUST fail on a missing, unknown or invalid field, on a duplicate `(id, locale)`, on a missing counterpart locale, and on a calculator page id without entries. The section ids are, EN: `how-to-use`, `formulas`, `tips`, `faq`, `sources`; ES: `como-usar`, `formulas`, `consejos`, `preguntas-frecuentes`, `fuentes`. The body has between 800 and 1,500 words per entry (PLAN.md §5.1), each FAQ answer is plain text (no links, emphasis or lists) of at most 450 characters (it is repeated in the `FAQPage` JSON-LD, so the cap bounds the HTML budget), the same number of `h2` and FAQ items in both locales, and no formal imperative or voseo form in the Spanish entry (`trust-pages`: Spanish register and parity).

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

### Requirement: Public DOM hooks

The markup of every calculator page MUST expose these hooks, which the browser suites and the script depend on; renaming one is a contract change:

| hook | where | meaning |
|---|---|---|
| `data-calculator="<id>"` | the calculator body | the id of the calculator the page renders |
| `data-unit="<system>"` | each unit-system button | the unit system it selects; the pressed button has `aria-pressed="true"` |
| `data-choice="<selectKey>"` | the group element around the buttons of a single-choice group | the select key of the descriptor; each button carries the option it sets in its `value` and the pressed one has `aria-pressed="true"` |
| `data-step="<inputKey>"` | the block around the two stepper buttons | the input they change; each button carries `less` or `more` in its `value` |
| `data-reserved="<area>"` | each block whose size is reserved in the server HTML and the script fills | the area: `copy`, `answer`, `notice` |
| `data-copy` | the "Copy link" button | copies the current address |
| `data-copy-status` | the polite status element | the copy outcome text |
| `data-answer` | the short answer | the polite live region the script rewrites |
| `data-not-running` | the "not running" note | hidden by the script once it runs |
| `data-messages` | the one inert `<template>` | holds the message entries the script reads |
| `data-primary="<outputKey>"` | the large figure | names the output key it mirrors |
| `data-primary-before`, `data-primary-after` | the text around the large figure | the two parts of the primary sentence |
| `data-output="<outputKey>"` | each result value | one per output the page shows (`calculator-page` [CP4]) |
| `data-line="<index>"` | each shopping line | its position in the declared list, from `0` |
| `data-shopping="<purchaseUnit>"` | each shopping quantity | one per shopping line |
| `data-fill="<placeholder>"` | each value inside a shopping label or note | the placeholder of the split template it fills |
| `data-line-note="<index>"` | the note of a shopping line | the line it belongs to |
| `data-cost-row="<outputKey>"` | each cost row | shown once its price is above zero |
| `data-hint-row="<outputKey>"` + `data-price-hint="<outputKey>"` | the price hint of a cost row | shown while its price is zero |

The hooks are derived from the descriptor and the module (never typed per calculator in a generic component), and the concrete names `data-shape-button`, `data-bag`, `data-waste-step`, `data-bag-lb`, `data-bag-yield` and `data-yield` no longer exist. The visible markup, ids, aria and text of the concrete pages are unchanged by the rename.

#### Scenario: [CP54] Hooks on the concrete page
- GIVEN built `/concrete-calculator`
- WHEN the hooks are listed
- THEN the `data-choice="shape"` group holds four buttons (values `slab`, `footing`, `column`, `steps`), the `data-choice="bag"` group three, the `data-step="waste"` block two buttons (values `less` and `more`), one `data-copy`, one `data-copy-status`, six `data-output` elements in the order of [CP4], one `data-shopping="bag-80"` and one `data-primary`
- AND one `data-line="0"` with `data-fill="bagLb"` in its label, one `data-line-note="0"` with `data-fill="yield"`, and the shape-driven block `calc-choice-area` with `style="--calc-rows:4"`
- AND none of `data-shape-button`, `data-bag`, `data-waste-step`, `data-bag-lb`, `data-bag-yield`, `data-yield`, `data-value`, `data-direction`, `data-reserved="shape"` or `data-reserved="steppers"` is present

#### Scenario: [CP55] Hooks drive behaviour
- GIVEN the default page with scripts running
- WHEN the `value="footing"` button of the `data-choice="shape"` group is pressed, then the `value="more"` button of the `data-step="waste"` block once
- THEN the footing fields show with `aria-pressed="true"` on that button, `waste` reads `15`, and `data-copy-status` stays empty until `data-copy` is pressed

#### Scenario: [CP56] Absent features have no hooks
- GIVEN a calculator whose module has no choice group, stepper or shopping line (rectangle-area), its page view rendered through the real components with the Astro container
- WHEN its page markup is read
- THEN no `data-choice`, `data-step` or `data-shopping` element exists and `data-output`, `data-primary`, `data-copy` and `data-copy-status` follow the table

### Requirement: Form controls

The form MUST show only the fields the selected option of its choice group shows (concrete: the shape), in this order, each with a visible `<label>` and the unit hint of the active unit system. Hidden fields keep their values and are neither visible nor focusable. A calculator with no choice group shows all its fields.
(Previously: "the fields of the selected shape"; the stepper bounds were stated as 0 to 50 and the reserved area as the four-row constant.)

| shape | visible fields |
|---|---|
| `slab` | `length`, `width`, `thickness` |
| `footing` | `length`, `footingWidth`, `footingDepth`, `count` |
| `column` | `diameter`, `height`, `count` |
| `steps` | `stepWidth`, `rise`, `run`, `stepCount` |

Always visible, after the shape fields: `waste` (with `wasteHelp` text, a "Less extra" and a "More extra" button changing it by 5 points within the `min` and `max` of the `waste` descriptor, 0 to 50), the bag size (three buttons), `bagPrice`, `readyMixPrice`. The shape (four buttons) and the unit system (two buttons) come first. Single-choice buttons form a labelled group and expose their state with `aria-pressed`. Length, percent and money inputs use `inputmode="decimal"`, counts `inputmode="numeric"`, all `autocomplete="off"`; the form has no submit button. Number inputs are at least 56 CSS px tall and every other control (buttons, toggles) at least 44 by 44 px on a 390 px viewport. Every input has an associated visible label, and the focus ring is the orange ring of `site-shell`. Default text of inputs: `12 ft`, `10 ft`, `4 in`, `16 in`, `8 in`, `12 in`, `8 ft`, `4 ft`, `7 in`, `11 in`, `3`, `1`, `10`; the price inputs are empty with the placeholder `0.00`, and an empty price means `$0` (no error): the script passes an empty price to the engine as an explicitly `undefined` field, which validation reads as the default. The block size of the area a choice group drives is the same for every option of the group (it reserves the tallest visibility set of the group, four rows for the concrete shapes), so switching the option or restoring a shared link shifts nothing below it.

#### Scenario: [CP11] Visible fields per shape
- GIVEN the page with scripts running
- WHEN each shape button is pressed in turn
- THEN the visible shape fields and their order equal the table, the others are `hidden`, and the pressed button has `aria-pressed="true"` and the other three `false`

#### Scenario: [CP12] Labels and keyboards
- GIVEN the default page
- WHEN the controls are inspected
- THEN every input has a label whose text is the `calc.concrete.inputs.<key>` catalog value of the locale, length/percent/money inputs have `inputmode="decimal"`, count inputs `inputmode="numeric"`, and there is no submit button

#### Scenario: [CP51] Unit hint on every length field
- GIVEN the default page (US system)
- WHEN the ten length fields are read
- THEN each has a visible hint after its input, `site.calculator.hintFt` (`length`, `width`, `height`, `stepWidth`) or `site.calculator.hintIn` (the other six), and its input is described by it (`aria-describedby`); the count, waste and price inputs have no unit hint, and the waste input is described by its help text
- AND under `metric` the hints read `site.calculator.hintM` (the four long fields) and `site.calculator.hintCm` (the six others), written by the script from inert messages in the page

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

With scripts running, every edit MUST update the short answer, the figures and the shopping quantity without a button and without a page load, using the same validation and arithmetic as the engine (no second formula implementation). Updates happen on every `input` event and on every button press. The short answer is a polite live region. Pressing Enter in a field MUST NOT navigate or reload. A stepper clamps at the `min` and `max` of the descriptor of its input, never at a constant of the page code.
(Previously: the waste steppers were stated as "within 0 to 50"; the bounds were constants duplicated from the engine.)

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
- AND "Less extra" at `0` and "More extra" at `50` leave the value unchanged, and the bounds are those of the `waste` descriptor

#### Scenario: [CP23] Enter does not navigate
- GIVEN focus in any input
- WHEN Enter is pressed
- THEN the URL path and the page stay the same and no request is made

#### Scenario: [CP24] Client equals engine
- GIVEN the states of the table and the cases S2, S3 (metric), F1, C2, T1, H of `calc-concrete`
- WHEN each is loaded through its query in Chromium
- THEN every displayed figure equals the engine output rounded for display (the same strings the build-time render produces for that state)

#### Scenario: [CP57] Stepper bounds follow the descriptor
- GIVEN a calculator whose stepper input has descriptor bounds `min` 0 and `max` 20, a fixture, with the stepper at 20
- WHEN "More" is pressed
- THEN the value stays 20, and changing the descriptor bound to 30 lets it reach 25 with no change to page code

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

#### Scenario: [CP52] The link notice goes with the rewritten address
- GIVEN the page opened from `?v=1&sh=Slab&bg=50&ws=51`, which shows the `errors.INVALID_VALUE` notice
- WHEN a valid edit rewrites the address
- THEN the notice is gone; an invalid edit, which writes nothing, leaves it

#### Scenario: [CP53] Switching units never changes what was typed
- GIVEN thickness `150` typed in inches (more than the 10 ft maximum, so invalid) and then the metric toggle
- WHEN the view is re-rendered
- THEN the field keeps its unit as `150 in`, stays invalid, and nothing is written; the same holds for a metric entry such as `400` (cm) switched back to US (`400 cm`)

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

Each calculator MUST have one client entry module of its own (`apps/web/src/client/entries/<id>.ts`), shared by both locales of that calculator, produced by the web build and loaded with `<script type="module" src>` from the page. The entry MAY statically import same-origin hashed chunks, including the generic mount and controller; the entry plus its whole static import graph MUST be at most 49,152 bytes (`site-quality`). The entry imports only its own calculator and page module (never the registry `apps/web/src/lib/calculators.ts`) and builds it from the yields-only module of `@maestro-calc/data` (`material-data-contract`) when it needs yields, never from the material record, so no source name, URL or other metadata reaches the bundle. It uses the engine's validation, arithmetic and URL codec from the workspace packages (no copy of a formula). It MUST contain no message text (strings arrive as inert HTML templates in the page: error messages for the 12 user-facing codes, the answer sentences, labels), no storage or network API, no third-party code, and no `https://` URL other than the site origin. The same figures MUST come out of the build-time render and of the script for any state (shared formatting). These rules, and the contract tests that enforce them, hold for EVERY entry of `CALCULATOR_PAGES`, not only the concrete one.
(Previously: the entry rules were written for the concrete entry, and CP48 named `entries/concrete.ts`.)

#### Scenario: [CP42] One entry per calculator, shared by both locales
- GIVEN the built `dist`
- WHEN the script URLs of `/concrete-calculator` and `/es/calculadora-de-concreto` are compared and the static import graph of that entry is resolved
- THEN both pages load the same entry file, the entry plus its static graph is at most 49,152 bytes, and no file of the graph contains catalog message text of either locale

#### Scenario: [CP47] No foreign origin in the entry graph
- GIVEN the built entry of `concrete` and every file of its static import graph
- WHEN searched for `https://` and `http://`
- THEN the only match allowed is the site origin `https://maestrocalc.com`, and the QUIKRETE source URL appears only in the HTML (as an allowlisted outbound link), never in JavaScript

#### Scenario: [CP48] Entry does not import the registry
- GIVEN the module graph of every `apps/web/src/client/entries/<id>.ts` for each id in `CALCULATOR_PAGES` (today `concrete`)
- WHEN the contract test walks its imports
- THEN neither `apps/web/src/lib/calculators.ts`, nor the directory of another calculator of core (the forbidden pattern is derived from that entry's own id), nor the root entry of `@maestro-calc/data` is reached

#### Scenario: [CP43] Message templates are inert HTML
- GIVEN the built page
- WHEN the message templates are read
- THEN the 12 user-facing error messages (with their `{min}` / `{max}` placeholders), the four answer sentences, the copy states, the four unit hints and the two volume sentences (`{value} cubic yards`, `{value} cubic meters`) are present in the page's locale as entries (`<p id="errors.BELOW_MIN">`) of one inert `<template>` element, and none of them is rendered until the script uses it

### Requirement: Layout stability

The page MUST NOT shift layout when scripts run: the result panel and the form reserve their final block size in the server HTML, figures use fixed-width cells, and the area driven by a choice group has the size of its tallest visibility set (derived from the module, `calculator-web-core`). The elements the script reveals or rewrites also reserve their size in the server HTML: the "Copy link" button and its status line, the steppers, the notice area (the "not running" note, then URL notices), and the short answer.

The reserved blocks `answer`, `notice` and `copy` MUST reserve a block size that is set per viewport width, in CSS only (the reserve is the same with scripts disabled and no script measures it). The answer and the notice reserve through a line-count custom property (`--answer-lines`; `--notice-lines` where the notice needs a count of its own) multiplied by that block's line unit (Terms: the answer line for the answer; the body line for the notice when it has its own count), with the line counts changed at breakpoints expressed in `rem` (so they follow the user's text zoom). The copy block, whose mounted content does not wrap at any width, keeps one fixed reserve sized to that content. At each width of the set 320, 390, 480, 640, 768, 1024 and 1280 CSS px, in both directions:
- the content of the block fits its reserve (the content height is at most the reserved height), so nothing overflows or shifts when the script rewrites it;
- the unused reserve (reserved height minus content height) is less than one line of that block (Terms), so no empty gap of a full line or more is left under the answer, the notice or the copy block.

The line-count properties MUST be overridable by a calculator page: a page (or a fixture) that sets one of them on the calculator body changes the reserve of its block with no change to the shared stylesheet, and a calculator that has no such block reserves nothing for it.
(Previously: the short answer was "sized for its longest sentence at the phone width", through fixed reserves (answer 10.75 rem, notice 9 rem, copy 5 rem) that were measured at 320 and 390 px only and left about 104 px empty under the answer on desktop.)

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
- GIVEN the same widths, locales and sentences as [CP59]
- WHEN the reserved height minus the tallest natural height over both locales at that width is computed, and one answer line is read as the computed `line-height` of the answer text (`--text-h3 × --leading-body`, 34.1 px at the default size)
- THEN the difference is less than that line at all seven widths, except at the last pixel width before a breakpoint, where it is less than two lines (text wraps a few pixels earlier on some platforms than where the breakpoints were measured; the breakpoints follow the latest drop so the content fits everywhere, amended 2026-10-27 after CI on Linux Chromium); in particular at 1280 px the gap under the answer is no longer 100 px or more (an e2e test; a recorded measurement of the unused reserve per width is added to the apply progress)

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
