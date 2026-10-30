# site-shell

Implements PLAN.md §4.3 and `docs/design/direction.md` (Blueprint). Layout, tokens, fonts, header, footer, accessibility basics and the zero-client-JS rule. All checks run on built HTML/CSS in `apps/web/dist` or in the browser job.

## Requirements

### Requirement: Base layout and landmarks

Every built page (the 14 routable pages and the two 404 pages) MUST be rendered by one base layout that emits `<!doctype html>`, `<html lang>`, `<meta charset="utf-8">`, `<meta name="viewport" content="width=device-width, initial-scale=1">`, and exactly one each of `<header>`, `<nav>` (with a non-empty `aria-label` from the `site` catalog), `<main id="main">`, and `<footer>`. The page MUST contain exactly one `<h1>`, inside `<main>`. A calculator page's breadcrumb is not a second `<nav>`: it is a list with an `aria-label`.
(Previously: 12 routable pages, 14 pages in total; no statement about breadcrumbs.)

#### Scenario: [SS1] Landmarks on every page
- GIVEN the built `dist` directory
- WHEN each of the 16 HTML pages is parsed
- THEN each has exactly one `header`, one `nav[aria-label]`, one `main#main`, one `footer`, and one `h1` located inside `main`

#### Scenario: [SS2] Viewport and charset
- GIVEN any built page
- WHEN its `<head>` is parsed
- THEN it has `meta[charset="utf-8"]` and a viewport meta equal to `width=device-width, initial-scale=1` (no `maximum-scale`, no `user-scalable=no`)

### Requirement: Skip link

The first focusable element in every page MUST be a skip link whose `href` is `#main`, with visible text from the `site` catalog (`Skip to main content` / `Saltar al contenido principal`). It MAY be visually hidden until focused but MUST become visible on focus.

#### Scenario: [SS3] Skip link is first in DOM order
- GIVEN any built page
- WHEN the document is parsed
- THEN the first `a`, `button`, `input`, `select`, `textarea` or `[tabindex]` element in document order is `a[href="#main"]`

#### Scenario: [SS4] Skip link works by keyboard
- GIVEN the EN home page loaded in Chromium
- WHEN the first Tab key press is followed by Enter
- THEN the skip link had focus and was visible (non-zero bounding box inside the viewport) before Enter, and after Enter `location.hash` equals `#main` and focus or the sequential focus start point is inside `main`

### Requirement: Blueprint design tokens

The global stylesheet MUST declare the Blueprint palette as CSS custom properties on `:root`: `#0E2240` (ink), `#1D4ED8` (links), `#F06A1D` (safety orange), `#56616B` (secondary text), `#EEF1EF` (page ground), `#FFFFFF` (surface), `#1FAF5A` (WhatsApp). Only the light theme MUST be shipped: `color-scheme: light` is declared and no `prefers-color-scheme: dark` rule exists. The page ground MUST be `#EEF1EF` and body text MUST be `#0E2240`.

It MUST also declare, on `:root`, the identity primitives of the home hero:
- a display size `--text-display`, a fluid `clamp()` with `rem` bounds, larger than the page H1 size (`--text-h1`) at every viewport width and reserved for the H1 of the home;
- a grid size `--grid-size` of `1rem` (16 px at the default size; it follows the user's text zoom);
- the dimension-tick primitive `--tick-weight` (the thickness of the dimension line and of its end ticks, a positive length, drawn in the safety orange). The tick length is not a token of its own: a tick is one grid cell tall, `var(--grid-size)`.

Corners MUST come from three rem tokens of `tokens.css`, the corners of the Blueprint mockups: `--radius-card` (1rem: cards, the form card, the result panel, the shopping list, the home cards and the desktop home hero), `--radius-control` (0.75rem: inputs, buttons, segmented tracks, the share link) and `--radius-segment` (0.5625rem: the segments inside a segmented control). Every non-zero `border-radius` of the shipped CSS uses one of them, and no other custom property is named after a radius.
(Previously, until blueprint-ui 2026-10-29: corners were square, with no non-zero `border-radius` and no radius token.)
(Previously: the palette, the light theme and the page ground only; no display size, grid or tick primitive; nothing stated about corners.)

#### Scenario: [SS5] Palette values present
- GIVEN the built CSS of any page
- WHEN custom properties on `:root` are collected
- THEN the set of values includes all seven hex values above (case-insensitive)

#### Scenario: [SS6] No dark theme
- GIVEN the built CSS of all pages
- WHEN searched for `prefers-color-scheme`
- THEN there is no match, and `color-scheme: light` is present

#### Scenario: [SS7] Text contrast
- GIVEN the computed colors of body text on the page ground and of link text on the page ground
- WHEN contrast ratios are computed
- THEN body text is at least 4.5:1 and links at least 4.5:1 (axe `color-contrast` reports 0 violations)

#### Scenario: [SS24] Display size is a fluid clamp above the H1 size
- GIVEN `tokens.css` read by the styles contract test, and the computed `font-size` of the home H1 in Chromium at 320 and 1280 px
- WHEN `--text-display` is parsed and the computed sizes are read
- THEN its value is a `clamp(` with `rem` minimum and maximum, the computed home H1 size is greater than the `--text-h1` size at both widths and the larger at 1280 px, and no other element of the home or of any other page uses the token (a contract test over the built CSS and HTML)

#### Scenario: [SS25] Grid and tick primitives are pinned
- GIVEN `tokens.css` read by the styles contract test
- WHEN the primitives are collected
- THEN `--grid-size` equals `1rem`, `--tick-weight` exists with a positive length, no `--tick-length` or other tick token exists (the tick length is `var(--grid-size)` in the hero rule), and the stale "1.42 line height" comment of the test now states the real body leading, 1.55 (a unit test: removing or renaming either primitive fails it)

#### Scenario: [SS26] Corners from the radius tokens
- GIVEN the global sheets and the home view style
- WHEN searched for `border-radius` declarations with a non-zero value and for custom properties whose name contains `radius`
- THEN every such value is `var(--radius-card)`, `var(--radius-control)` or `var(--radius-segment)`, the three are declared in `tokens.css` only and in rem, and no arrow glyph is drawn by a pseudo-element of the home (a unit test)

### Requirement: Self-hosted fonts

The site MUST use Barlow (weights 400, 600) and Barlow Condensed (weights 600, 700) as exactly four self-hosted `woff2` files, Latin subset, declared with `font-display: swap` and a metric-adjusted fallback (`size-adjust`) to limit layout shift. The Latin subset MUST cover U+00A1, U+00BF, U+00E1, U+00E9, U+00ED, U+00F1, U+00F3, U+00FA, U+00FC (Spanish glyphs). No built file and no browser request MAY reference a third-party font origin. Body text MUST compute to at least 17px.

#### Scenario: [SS8] Four font files, same origin
- GIVEN `dist`
- WHEN `.woff2` files are listed and every `src: url(...)` in built CSS is resolved
- THEN exactly four woff2 files exist, every `@font-face` uses `font-display: swap`, and all URLs are same-origin relative paths

#### Scenario: [SS9] No third-party font origin
- GIVEN all built HTML and CSS
- WHEN searched for `fonts.googleapis.com`, `fonts.gstatic.com`, `use.typekit.net`, `cdn.jsdelivr.net`, `unpkg.com`
- THEN there is no match

#### Scenario: [SS10] Spanish glyph coverage
- GIVEN the four woff2 files
- WHEN their cmap is read
- THEN each contains the nine code points listed above

#### Scenario: [SS11] Body size
- GIVEN the EN home page in Chromium
- WHEN `getComputedStyle(document.body).fontSize` is read
- THEN it is greater than or equal to `17px`

### Requirement: Header

The header MUST contain a wordmark link whose text is `Maestro Calc` and whose `href` is the current locale's home (`/` or `/es`), a primary navigation with links to methodology and about in the current locale, and a language switch (see `site-routing-i18n`). Visible text MUST come from the `site` catalog.

#### Scenario: [SS12] Header links
- GIVEN the built `/about` and `/es/sobre-nosotros`
- WHEN the header is parsed
- THEN the wordmark `href` is `/` and `/es` respectively, and the nav `href`s are `/methodology`, `/about` and `/es/metodologia`, `/es/sobre-nosotros` respectively

### Requirement: Footer

The footer MUST contain links to privacy, terms and contact in the current locale, and MUST show the contact address `contacto@maestrocalc.com` as visible text on both locales. It MUST NOT contain social, affiliate, advertising or analytics links.

#### Scenario: [SS13] Footer links
- GIVEN the built `/` and `/es`
- WHEN the footer is parsed
- THEN the `href`s are `/privacy`, `/terms`, `/contact` and `/es/privacidad`, `/es/terminos`, `/es/contacto` respectively, and the text `contacto@maestrocalc.com` is visible

### Requirement: Focus visibility and touch targets

Every interactive element MUST show an orange (`#F06A1D`) focus ring on `:focus-visible` with a width of at least 2px and no `outline: none` without a replacement. The focus indicator, including any inner contrast band, MUST reach at least 3:1 contrast against the adjacent background. Interactive elements in the header, footer and skip link MUST have a rendered hit area of at least 44 by 44 CSS px. Inline links inside prose are exempt.

#### Scenario: [SS14] Focus ring computed style
- GIVEN the EN home page in Chromium
- WHEN each header, footer and skip-link element is focused with the keyboard
- THEN its computed `outline-color` or box-shadow ring contains `rgb(240, 106, 29)` and its width is at least 2px

#### Scenario: [SS15] Touch target size on a phone
- GIVEN Chromium with a 390x844 viewport on `/` and `/es`
- WHEN the bounding boxes of the header, footer and skip-link interactive elements are measured
- THEN every width and height is at least 44

#### Scenario: [SS16] Focus indicator contrast
- GIVEN the focus ring colors and the adjacent page and surface colors
- WHEN contrast is computed
- THEN each pairing is at least 3:1

### Requirement: Favicon

`/favicon.svg` MUST be a brand SVG using at least one Blueprint color (`#0E2240` or `#F06A1D`), MUST NOT be the Astro scaffold icon, and every page MUST link it with `<link rel="icon" type="image/svg+xml" href="/favicon.svg">`.

#### Scenario: [SS17] Favicon linked and branded
- GIVEN `dist/favicon.svg` and any built page
- WHEN parsed
- THEN the link tag exists, the file is valid SVG, contains `#0E2240` or `#F06A1D`, and does not contain the Astro default gradient ids

### Requirement: Client JavaScript only on calculator pages

Pages that are not calculator pages (the calculator id list of `site-routing-i18n`) MUST ship 0 bytes of client JavaScript: no external `<script src>`, no inline script other than `type="application/ld+json"`, no `modulepreload`, no `<astro-island>`, no inline event-handler attributes, no `.js` or `.mjs` file in the page asset graph.

A calculator page MUST ship exactly one client entry, the entry module of its own calculator (one module per calculator, shared by both locales; it may statically import same-origin hashed chunks, and the entry plus its static graph is bounded by `site-quality`): one `<script type="module" src="...">` whose URL is a same-origin file of the hashed asset directory (`/_astro/`), plus JSON-LD blocks. It MUST have no other external `<script src>`, no inline script, no inline event-handler attribute, no `<astro-island>`; `<link rel="modulepreload">` is allowed only on calculator pages and only to same-origin files. The script and everything it imports are bounded by the byte budget of `site-quality`. The script MUST NOT read or write cookies, `localStorage`, `sessionStorage` or `IndexedDB`, MUST NOT make network requests (`fetch`, `XMLHttpRequest`, `sendBeacon`, `WebSocket`), and MUST contain no localized message text (the page carries its messages as inert HTML), so that the privacy page stays true (`trust-pages`).
Amended by analytics-gtm (2026-10-29): every page, calculator or not, MAY also carry exactly one analytics tag, `<script src="/analytics.js" data-gtm="GTM-…" data-host="maestrocalc.com" defer>` with no body, at the end of the head; the loader is the one script file outside `/_astro/`, it is not part of any calculator graph, and it is the only built file that names a foreign address (the Tag Manager script). It sets Consent Mode v2 defaults and loads Tag Manager after the page load on the production host only.
(Previously: every page shipped 0 bytes of client JavaScript; until analytics-gtm, no page carried a script outside its calculator module and JSON-LD.)

#### Scenario: [SS18] No scripts on non-calculator pages
- GIVEN every built HTML page that is not a calculator page
- WHEN parsed
- THEN the only `<script>` elements have `type="application/ld+json"`, besides the one analytics tag in its exact shape, and no `on*=` attribute, `astro-island` element or `rel="modulepreload"` link exists

#### Scenario: [SS19] No JS requests in the browser outside calculator pages
- GIVEN Chromium loading each non-calculator page with request logging
- WHEN the load settles
- THEN no request has resource type `script` besides `/analytics.js`, and no request targets a non-same origin (against production, the Tag Manager and GA4 requests the loader causes are expected)

#### Scenario: [SS20] Calculator page script shape
- GIVEN built `/concrete-calculator` and `/es/calculadora-de-concreto`
- WHEN parsed
- THEN each has exactly one `script[type=module][src]` (a `/_astro/*.js` path) and otherwise only `application/ld+json` scripts and the analytics tag, no inline script text, no `on*=` attribute and no `astro-island`; both locales of the calculator reference the same entry file (a different calculator would reference its own entry)

#### Scenario: [SS21] Calculator pages in the browser
- GIVEN Chromium loading each calculator page, then typing in a field, with request logging
- WHEN the load settles and the result updates
- THEN every request targets the page origin, the only `script` requests are the module file (and any `modulepreload` target), and there is no `fetch` or XHR request

#### Scenario: [SS22] Script violations fail the gate
- GIVEN a built copy where a calculator page has an inline `<script>` with text, or a second `<script src>`, or an `onclick` attribute, or a non-same-origin script URL, or where `/privacy` gains any `<script src>`
- WHEN `npm run check:site` runs
- THEN it exits non-zero naming the page and the rule

#### Scenario: [SS23] Bundle forbids storage, network and message text
- GIVEN the built calculator JS file
- WHEN searched for `document.cookie`, `localStorage`, `sessionStorage`, `indexedDB`, `fetch(`, `XMLHttpRequest`, `sendBeacon`, for a sample of catalog message text of both locales (for example `Use a period for decimals`, `Usa punto para los decimales`, `Copy link`, `Copiar enlace`), and for any `http://` or `https://` URL other than the site origin (for example the QUIKRETE source URL)
- THEN there is no match (the existing third-party-origin scan of built assets, `trust-pages` [TP12], stays unchanged and also passes)

### Requirement: The identity is spent once and scoped to the home

The Blueprint grid and the orange dimension tick MUST appear only in the home hero, on the Blueprint ink ground. They MUST NOT appear on the header, the footer, the cards or any page other than the home. The grid is drawn in pure CSS and the dimension line with borders or pseudo-elements: no SVG, image or font is added for them and no request is added. The home-specific styles MUST ship only on the home pages (the home renders from its own route files, `site-routing-i18n` [SR23]), so the other pages, in particular the Spanish concrete page whose HTML is near its budget, do not pay for them. Every page MUST inline all of its CSS (`build.inlineStylesheets: 'always'`): no page links a stylesheet, so the size of a CSS chunk never moves it between inline and a render-blocking link, and the inlined CSS of a page is bounded by [SQ6]. The set of global sheets stays `tokens`, `base` and `calculator`, and the CSS budget of `site-quality` [SQ6] is unchanged (20,480 bytes per page).

#### Scenario: [SS27] The hero carries the grid and the tick
- GIVEN Chromium on `/` and `/es` at 390 and 1280 px
- WHEN the element with the class `home-hero` inside `main` is inspected (selected by that class only, not by a scoping attribute or hash class)
- THEN its computed `background-image` contains two `linear-gradient` layers and its computed `background-size` equals the computed value of `--grid-size` (16 px at the default size) in both axes, its computed `background-color` is the ink color `rgb(14, 34, 64)`, and the `::after` pseudo-element of its `h1` is rendered with a computed height equal to `--grid-size` and `border-inline` of `--tick-weight` in `rgb(240, 106, 29)` (an e2e test; at 320 px the hero and its `h1` fit the viewport, `scrollWidth <= innerWidth`)

#### Scenario: [SS28] The identity does not leak
- GIVEN every built page other than the two home pages (the trust pages, the calculator pages, the two 404 pages), read as text after `npm run build`
- WHEN each page's HTML, inline `<style>` blocks included, is searched for the substrings `.home-` and `linear-gradient`
- THEN there is no match on any of those pages, no page has a `link[rel="stylesheet"]` to search besides, and `dist/index.html` and `dist/es/index.html` both match `.home-hero`, `.home-card` and `linear-gradient` (a contract test over the build; class scoping keeps `.home-hero` as a substring of the scoped selector)

#### Scenario: [SS29] The other pages carry no home rule and their CSS size is recorded
- GIVEN a clean build
- WHEN the inline CSS of `/concrete-calculator`, `/es/calculadora-de-concreto` and `/methodology` is read
- THEN it carries no rule whose selector contains `.home-` (today every catch-all page carries `.home-links{…}`, 83 bytes, which is gone), its size is measured and recorded in the apply progress next to the size before this change, and the home pages carry the hero and card CSS (a contract test for the absence; a recorded measurement for the sizes, which may fall under the trims of design K9 and K10)

#### Scenario: [SS30] Same three global sheets and the CSS budget
- GIVEN the styles contract test and `npm run check:site` on the build
- WHEN the global stylesheet list and the largest CSS size per page are read
- THEN the list is exactly `tokens`, `base` and `calculator`, and the largest CSS size is at most 20,480 bytes ([SQ6]) with the measured value recorded in the apply progress

#### Scenario: [SS31] Hero text keeps its contrast over the grid
- GIVEN the hero H1 and tagline text colors and the ink ground with the grid line color
- WHEN contrast ratios are computed against the ink ground and against the lightest grid line color
- THEN each is at least 4.5:1 (a unit test on the token values, with axe `color-contrast` reporting 0 violations on `/` and `/es`)

#### Scenario: [SS32] Every page inlines its CSS
- GIVEN `apps/web/astro.config.mjs` and `dist` after `npm run build`
- WHEN the config is read and every built page is parsed
- THEN `build.inlineStylesheets` is `'always'`, no page has a `link[rel="stylesheet"]`, every page's CSS is in `<style>` elements of its `<head>`, no `/_astro/*.css` file exists in `dist`, and `npm run check:site` reports the largest CSS size per page at most 20,480 bytes ([SQ6]) with the measured value recorded in the apply progress (a contract test over the config and the build, plus the `check:site` gate)
