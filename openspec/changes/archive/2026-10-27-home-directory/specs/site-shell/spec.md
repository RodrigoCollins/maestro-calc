# Delta for site-shell

Adds the Blueprint identity primitives and square corners, states where the identity may appear, and pins that every page inlines all of its CSS. Continues the prefix SS (next free id: SS24). Kept as written: [SS5], [SS6], [SS7]. Added: [SS24] to [SS32]. Every other SS requirement is unchanged. The sheets are still the three global ones (`tokens`, `base`, `calculator`); the home-specific styles are not a new global sheet. Selectors in the scenarios below name the hero and the cards by their own classes (`home-hero`, `home-card`); they hold whatever scoping attribute or class Astro adds (design K9).

## MODIFIED Requirements

### Requirement: Blueprint design tokens

The global stylesheet MUST declare the Blueprint palette as CSS custom properties on `:root`: `#0E2240` (ink), `#1D4ED8` (links), `#F06A1D` (safety orange), `#56616B` (secondary text), `#EEF1EF` (page ground), `#FFFFFF` (surface), `#1FAF5A` (WhatsApp). Only the light theme MUST be shipped: `color-scheme: light` is declared and no `prefers-color-scheme: dark` rule exists. The page ground MUST be `#EEF1EF` and body text MUST be `#0E2240`.

It MUST also declare, on `:root`, the identity primitives of the home hero:
- a display size `--text-display`, a fluid `clamp()` with `rem` bounds, larger than the page H1 size (`--text-h1`) at every viewport width and reserved for the H1 of the home;
- a grid size `--grid-size` of `1rem` (16 px at the default size; it follows the user's text zoom);
- the dimension-tick primitive `--tick-weight` (the thickness of the dimension line and of its end ticks, a positive length, drawn in the safety orange). The tick length is not a token of its own: a tick is one grid cell tall, `var(--grid-size)`.

Corners MUST be square: no non-zero `border-radius` and no radius token exists in the shipped CSS of any page. No other new token is introduced by this change.
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
- THEN `--grid-size` equals `1rem`, `--tick-weight` exists with a positive length, no `--tick-length` or other tick token exists (the tick length is `var(--grid-size)` in the hero rule), no token name contains `radius`, and the stale "1.42 line height" comment of the test now states the real body leading, 1.55 (a unit test: removing or renaming either primitive fails it)

#### Scenario: [SS26] Square corners everywhere
- GIVEN the built CSS of every page
- WHEN searched for `border-radius` declarations with a non-zero value and for custom properties whose name contains `radius`
- THEN there is no match

## ADDED Requirements

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
