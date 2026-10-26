# Delta for site-shell

The zero client JavaScript rule becomes a per-template rule: static pages keep 0 bytes, calculator pages allow one same-origin module script. Continues the existing prefix SS (next free id: SS20).

## RENAMED Requirements

### Requirement: Zero client JavaScript on static pages → Client JavaScript only on calculator pages

(Reason: the first calculator needs a small script for live results; the zero-JS promise now applies to every page that is not a calculator page.)
(Migration: tests and checks that asserted "no script anywhere" derive the page template from the route table (calculator id list) and assert 0 bytes on non-calculator pages and the rules below on calculator pages.)

## MODIFIED Requirements

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

### Requirement: Client JavaScript only on calculator pages

Pages that are not calculator pages (the calculator id list of `site-routing-i18n`) MUST ship 0 bytes of client JavaScript: no external `<script src>`, no inline script other than `type="application/ld+json"`, no `modulepreload`, no `<astro-island>`, no inline event-handler attributes, no `.js` or `.mjs` file in the page asset graph.

A calculator page MUST ship exactly one client entry, the entry module of its own calculator (one module per calculator, shared by both locales; it may statically import same-origin hashed chunks, and the entry plus its static graph is bounded by `site-quality`): one `<script type="module" src="...">` whose URL is a same-origin file of the hashed asset directory (`/_astro/`), plus JSON-LD blocks. It MUST have no other external `<script src>`, no inline script, no inline event-handler attribute, no `<astro-island>`; `<link rel="modulepreload">` is allowed only on calculator pages and only to same-origin files. The script and everything it imports are bounded by the byte budget of `site-quality`. The script MUST NOT read or write cookies, `localStorage`, `sessionStorage` or `IndexedDB`, MUST NOT make network requests (`fetch`, `XMLHttpRequest`, `sendBeacon`, `WebSocket`), and MUST contain no localized message text (the page carries its messages as inert HTML), so that the privacy page stays true (`trust-pages`).
(Previously: every page shipped 0 bytes of client JavaScript.)

#### Scenario: [SS18] No scripts on non-calculator pages
- GIVEN every built HTML page that is not a calculator page
- WHEN parsed
- THEN the only `<script>` elements have `type="application/ld+json"`, and no `on*=` attribute, `astro-island` element or `rel="modulepreload"` link exists

#### Scenario: [SS19] No JS requests in the browser outside calculator pages
- GIVEN Chromium loading each non-calculator page with request logging
- WHEN the load settles
- THEN no request has resource type `script` and no request targets a non-same origin

#### Scenario: [SS20] Calculator page script shape
- GIVEN built `/concrete-calculator` and `/es/calculadora-de-concreto`
- WHEN parsed
- THEN each has exactly one `script[type=module][src]` (a `/_astro/*.js` path) and otherwise only `application/ld+json` scripts, no inline script text, no `on*=` attribute and no `astro-island`; both locales of the calculator reference the same entry file (a different calculator would reference its own entry)

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
