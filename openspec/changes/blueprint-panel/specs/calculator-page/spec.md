# Delta for calculator-page

The result panel gains the drawing box on pages that declare the `drawing` slot, and the page gains the WhatsApp share action next to "Copy link". Continues the prefix CP (next free id: CP76). Modified: Result panel (drawing box added; [CP15] to [CP18] kept as written), Public DOM hooks (`data-drawing`, `data-share`, the cost row and its hint merged; [CP54] to [CP56] kept), Form controls (inputs inherit the form's `autocomplete`; [CP12] reworded, the other scenarios kept), Client script contract (the entry import rule of [CP48] gains `../draw.ts` exactly when the module declares `drawing`). Added: [CP76] to [CP86]. Every other requirement is unchanged: Copy link ([CP38], [CP39]) is untouched, and [CP66] still holds at every pull-request tip of this change (the Spanish concrete fixture page is at most 40,836 B).

## MODIFIED Requirements

### Requirement: Result panel

The result panel shows, in order: the primary volume (cubic yards in the US unit system, cubic meters in the metric one) as the large figure; on a page that declares the `drawing` slot, the blueprint drawing box (`blueprint-drawing`, reserved in the server HTML, plain ink, empty and `aria-hidden` until the script draws) after the large figure (`.calc-primary`) and before the result rows (`dl.calc-rows`), as in the mockup (`docs/design/mockups/Main.dc.html` lines 85-95); the other two volumes; the volume before extra (`netVolume`, labelled); the shopping line (`shoppingLine`, the quantity, `bagYield` for the chosen bag); the cost rows (each one row: the figure when its price is above zero, otherwise its price hint); the ready-mix note; the estimate note followed by a link to the terms page in the current locale. Volumes are the engine outputs rounded for display (2 places); ready-mix volume is never rounded to a truck increment. The panel uses the Blueprint tokens (ink ground, safety orange for what to buy) and keeps the text contrast of `site-shell`.
(Previously: the panel had no drawing box, and each cost row had a separate hint row.)

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
| `data-cost="<outputKey>"` | the figure of each cost row (with `data-output`) | shown once its price is above zero |
| `data-price-hint="<outputKey>"` | the price hint inside the same cost row | shown while its price is zero |
| `data-drawing` | the drawing box of the result panel, on a page whose module declares the `drawing` slot (`blueprint-drawing`) | the `<svg>` the script draws into; empty and `aria-hidden` in the server HTML |
| `data-share="<base>"` | the WhatsApp share anchor of the copy area, on every calculator page | the inert share base (`https://wa.me/`) the script reads; the anchor has no `href` before the script |

The hooks are derived from the descriptor and the module (never typed per calculator in a generic component), and the concrete names `data-shape-button`, `data-bag`, `data-waste-step`, `data-bag-lb`, `data-bag-yield` and `data-yield` no longer exist. The visible markup, ids, aria and text of the concrete pages are unchanged by the rename. The cost row and its price hint are one row: the separate hint row and its `data-hint-row` hook no longer exist, and the figure hook is `data-cost`, since it marks a figure, not a row (the markup trim of this change; visible text, ids and ARIA unchanged).
(Previously: a separate hint row `data-hint-row` per cost row and `data-cost-row` on the cost row; no `data-drawing` or `data-share` hook.)

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
(Previously: every input carried its own `autocomplete="off"`.)

| shape | visible fields |
|---|---|
| `slab` | `length`, `width`, `thickness` |
| `footing` | `length`, `footingWidth`, `footingDepth`, `count` |
| `column` | `diameter`, `height`, `count` |
| `steps` | `stepWidth`, `rise`, `run`, `stepCount` |

Always visible, after the shape fields: `waste` (with `wasteHelp` text, a "Less extra" and a "More extra" button changing it by 5 points within the `min` and `max` of the `waste` descriptor, 0 to 50), the bag size (three buttons), `bagPrice`, `readyMixPrice`. The shape (four buttons) and the unit system (two buttons) come first. Single-choice buttons form a labelled group and expose their state with `aria-pressed`. Length, percent and money inputs use `inputmode="decimal"`, counts `inputmode="numeric"`; the form carries `autocomplete="off"` and every input inherits it from its form owner (no input sets its own `autocomplete`); the form has no submit button. Number inputs are at least 56 CSS px tall and every other control (buttons, toggles) at least 44 by 44 px on a 390 px viewport. Every input has an associated visible label, and the focus ring is the orange ring of `site-shell`. Default text of inputs: `12 ft`, `10 ft`, `4 in`, `16 in`, `8 in`, `12 in`, `8 ft`, `4 ft`, `7 in`, `11 in`, `3`, `1`, `10`; the price inputs are empty with the placeholder `0.00`, and an empty price means `$0` (no error): the script passes an empty price to the engine as an explicitly `undefined` field, which validation reads as the default. The block size of the area a choice group drives is the same for every option of the group (it reserves the tallest visibility set of the group, four rows for the concrete shapes), so switching the option or restoring a shared link shifts nothing below it.

#### Scenario: [CP11] Visible fields per shape
- GIVEN the page with scripts running
- WHEN each shape button is pressed in turn
- THEN the visible shape fields and their order equal the table, the others are `hidden`, and the pressed button has `aria-pressed="true"` and the other three `false`

#### Scenario: [CP12] Labels and keyboards
- GIVEN the default page
- WHEN the controls are inspected
- THEN every input has a label whose text is the `calc.concrete.inputs.<key>` catalog value of the locale, length/percent/money inputs have `inputmode="decimal"`, count inputs `inputmode="numeric"`, every input's autocomplete state is off because the form carries `autocomplete="off"` and no input overrides it, and there is no submit button

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

### Requirement: Client script contract

Each calculator MUST have one client entry module of its own (`apps/web/src/client/entries/<id>.ts`), shared by both locales of that calculator, produced by the web build and loaded with `<script type="module" src>` from the page. The entry MAY statically import same-origin hashed chunks, including the generic mount and controller; the entry plus its whole static import graph MUST be at most 49,152 bytes (`site-quality`). The entry imports exactly the generic mount and its own page module, plus the drawing writer `../draw.ts` exactly when that page module declares the `drawing` slot (`calculator-web-core`), and never the registry `apps/web/src/lib/calculators.ts`) and builds it from the yields-only module of `@maestro-calc/data` (`material-data-contract`) when it needs yields, never from the material record, so no source name, URL or other metadata reaches the bundle. It uses the engine's validation, arithmetic and URL codec from the workspace packages (no copy of a formula). It MUST contain no message text (strings arrive as inert HTML templates in the page: error messages for the 12 user-facing codes, the answer sentences, labels), no storage or network API, no third-party code, and no `https://` URL other than the site origin. The same figures MUST come out of the build-time render and of the script for any state (shared formatting). These rules, and the contract tests that enforce them, hold for EVERY entry of `CALCULATOR_PAGES`, not only the concrete one.
(Previously: the entry imported only the mount and its page module, with no drawing writer.)

#### Scenario: [CP42] One entry per calculator, shared by both locales
- GIVEN the built `dist`
- WHEN the script URLs of `/concrete-calculator` and `/es/calculadora-de-concreto` are compared and the static import graph of that entry is resolved
- THEN both pages load the same entry file, the entry plus its static graph is at most 49,152 bytes, and no file of the graph contains catalog message text of either locale

#### Scenario: [CP47] No foreign origin in the entry graph
- GIVEN the built entry of `concrete` and every file of its static import graph
- WHEN searched for `https://` and `http://`
- THEN the only match allowed is the site origin `https://maestrocalc.com`, and the QUIKRETE source URL appears only in the HTML (as an allowlisted outbound link), never in JavaScript

#### Scenario: [CP48] Entry imports and the registry
- GIVEN the module graph of every `apps/web/src/client/entries/<id>.ts` for each id in `CALCULATOR_PAGES` (today `concrete`)
- WHEN the contract test walks its imports
- THEN its own imports are exactly `../mount.ts` and `../../calculator/<id>/page.ts`, plus `../draw.ts` exactly when `PAGES[id].module.drawing` is declared (derived from the module, so a new page needs no test edit), and neither `apps/web/src/lib/calculators.ts`, nor the directory of another calculator of core (the forbidden pattern is derived from that entry's own id), nor the root entry of `@maestro-calc/data` is reached
- AND a seeded entry of a page without the slot that imports `../draw.ts` fails the test

#### Scenario: [CP43] Message templates are inert HTML
- GIVEN the built page
- WHEN the message templates are read
- THEN the 12 user-facing error messages (with their `{min}` / `{max}` placeholders), the four answer sentences, the copy states, the four unit hints and the two volume sentences (`{value} cubic yards`, `{value} cubic meters`) are present in the page's locale as entries (`<p id="errors.BELOW_MIN">`) of one inert `<template>` element, and none of them is rendered until the script uses it

## ADDED Requirements

### Requirement: Drawing box in the panel anatomy

A page whose module declares the `drawing` slot MUST render exactly one drawing box in the result panel, after the primary figure (`.calc-primary`) and before the result rows (`dl.calc-rows`), and a page whose module does not declare it MUST render none. The box is a `data-drawing` element, `aria-hidden="true"` and empty in the server HTML. The figures, their order and their server text are unchanged.

#### Scenario: [CP76] Box on the pages that declare the slot
- GIVEN the built `rectangle-area` pages (after PR 1) and the built `concrete` pages (after PR 3), both locales
- WHEN the panel markup is read
- THEN each has one `data-drawing` element that is empty with `aria-hidden="true"`, placed after `.calc-primary` and before `dl.calc-rows`; before PR 3 the concrete pages have none, and the test-only slot-free module has none (a unit test through the Astro container and a build test)

#### Scenario: [CP77] Figures are unchanged
- GIVEN the default render of each drawn page with the box present
- WHEN the figures and rows are read
- THEN they equal [CP15] for concrete and the four hand-verified cases of `calc-rectangle-area` for `rectangle-area`, byte for byte in visible text (a unit test)

### Requirement: Share on WhatsApp

Each calculator page MUST offer a share action next to "Copy link": an anchor `[data-share]` labelled `site.calculator.shareWhatsApp` ("Send on WhatsApp" / "Enviar por WhatsApp"). The script sets its `href` on every render to the `data-share` base plus `?text=` followed by the percent-encoded text `site.calculator.shareText`, one space and the current absolute address from the controller (the one "Copy link" copies, including the query). The anchor has `target="_blank"` and `rel="noopener noreferrer"`, is `hidden` in the server HTML and revealed by the script like the copy button, and has no `href` before the script; the base is the inert `data-share` attribute (`https://wa.me/`), which the script reads, so no foreign URL is in the client bundle. The message holds the short text and the link only (no formatted result or shopping list). It adds no event handler: the browser follows the link. "Copy link" stays as the fallback and is not changed.

#### Scenario: [CP78] Link carries the encoded current URL
- GIVEN the EN concrete page after `waste` is set to `15` at origin `https://maestrocalc.com`
- WHEN the share anchor is read
- THEN its `href` equals `https://wa.me/?text=` + `encodeURIComponent(shareText + ' https://maestrocalc.com/concrete-calculator?v=1&ws=15')`, decoding the `text` parameter gives exactly that sentence and URL, and the same holds on the ES page with the Spanish text and `/es/calculadora-de-concreto` (an e2e test and a unit test of `shareHref`)

#### Scenario: [CP79] Link follows every valid change and keeps the last on invalid
- GIVEN the `rectangle-area` page with scripts running
- WHEN `length` is set to `15 ft`, then to `abc`
- THEN after `15 ft` the encoded URL contains `l=180`, and after `abc` the `href` is unchanged (an e2e test; the URL is the copy address of [CWC17])

#### Scenario: [CP80] Hidden without JS
- GIVEN Chromium with JavaScript disabled opening each calculator page in both locales
- WHEN the share anchor is read
- THEN it is `hidden`, has no `href` (its only URL is the inert `data-share` base), and the page is otherwise as today ([SQ18]); with scripts it is visible after the mount (an e2e test)

#### Scenario: [CP81] Anchor attributes
- GIVEN the mounted page
- WHEN the share anchor is read
- THEN it is an `<a>` with `target="_blank"` and `rel="noopener noreferrer"`, an accessible name equal to its visible label, and the mount's only DOM writes on it are `setAttribute` and the reveal step of the copy button (an e2e test and a contract test)

#### Scenario: [CP82] Target size and contrast
- GIVEN the mounted page at 320, 390 and 1280 px, both locales
- WHEN the share anchor box and colours are measured
- THEN its height and width are at least 44 CSS px, its text `#06210F` (`--color-on-whatsapp`) on `#1FAF5A` (`--color-whatsapp`) is at least 4.5:1 (about 6.0:1), its focus ring is the orange ring of `site-shell`, and axe reports 0 violations ([SQ1]) (a unit test of the tokens and an e2e test)

#### Scenario: [CP83] Keyboard order
- GIVEN the EN calculator page
- WHEN the user tabs past the last field
- THEN focus visits "Copy link", then the share anchor, then the next control, each with the orange focus ring ([CP45] extended) (an e2e test)

### Requirement: The reserved copy area holds the share link

The copy block reserve (`data-reserved="copy"`) MUST grow to hold the mounted content of both the "Copy link" button and the share anchor with the status line, set in CSS only (no script measures it), and keep the rule of Layout stability: at each width of the set 320, 390, 480, 640, 768, 1024 and 1280 px the content fits the reserve and the unused reserve is less than one body line (or two within 0.5rem below a breakpoint of that page and block, as in [CP61]). The share anchor is revealed inside that reserve and shifts nothing.

#### Scenario: [CP84] The copy area fits both actions at seven widths
- GIVEN the built pages of `concrete` and `rectangle-area` in both locales at the seven widths, with the copy block holding both actions and the longest status text
- WHEN the content height and the reserved height are measured as in [CP61]
- THEN the content fits the reserve and the unused reserve is under one body line, except within 0.5rem below a breakpoint where it is under two (an e2e test, on Linux CI)

#### Scenario: [CP85] Revealing the share link shifts nothing
- GIVEN Chromium opening both pages at the seven widths, with and without a query
- WHEN the script mounts and reveals the share anchor
- THEN the sum of layout shifts is at most 0.01 and the position of the first element below the copy block does not change ([CP62], [CP44]) (an e2e test and the Lighthouse run)

#### Scenario: [CP86] The Spanish concrete page stays at the pin with both additions
- GIVEN the full-length Spanish concrete budget fixture at each pull-request tip, after the markup trim (PR 2, trim A–E) and with the share anchor (PR 2) and the drawing box with all four concrete shapes (PR 3)
- WHEN its size is measured
- THEN it is at most 40,836 B at every tip, the pin is not raised, the trim frees at least 700 B before the share anchor is added, the trim is measured before the share slice starts (a short margin stops the apply and is reported to the owner), and the measured size and margins are recorded in the apply progress ([CP66]; a build test)
