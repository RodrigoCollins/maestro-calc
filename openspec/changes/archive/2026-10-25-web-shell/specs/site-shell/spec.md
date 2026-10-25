# Delta for site-shell

Implements PLAN.md §4.3 and `docs/design/direction.md` (Blueprint). Layout, tokens, fonts, header, footer, accessibility basics and the zero-client-JS rule. All checks run on built HTML/CSS in `apps/web/dist` or in the browser job.

## ADDED Requirements

### Requirement: Base layout and landmarks

Every built page (the 12 routable pages and the two 404 pages) MUST be rendered by one base layout that emits `<!doctype html>`, `<html lang>`, `<meta charset="utf-8">`, `<meta name="viewport" content="width=device-width, initial-scale=1">`, and exactly one each of `<header>`, `<nav>` (with a non-empty `aria-label` from the `site` catalog), `<main id="main">`, and `<footer>`. The page MUST contain exactly one `<h1>`, inside `<main>`.

#### Scenario: [SS1] Landmarks on every page
- GIVEN the built `dist` directory
- WHEN each of the 14 HTML pages is parsed
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

### Requirement: Zero client JavaScript on static pages

Built pages MUST ship 0 bytes of client JavaScript: no external `<script src>`, no inline script other than `type="application/ld+json"`, no `modulepreload`, no `<astro-island>`, no inline event-handler attributes, no `.js` or `.mjs` file in the page asset graph.

#### Scenario: [SS18] No scripts
- GIVEN every built HTML page
- WHEN parsed
- THEN the only `<script>` elements have `type="application/ld+json"`, and no `on*=` attribute, `astro-island` element or `rel="modulepreload"` link exists

#### Scenario: [SS19] No JS requests in the browser
- GIVEN Chromium loading each page with request logging
- WHEN the load settles
- THEN no request has resource type `script` and no request targets a non-same origin
