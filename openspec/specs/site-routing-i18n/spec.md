# site-routing-i18n

Implements PLAN.md §6.4 and §7.8, decision D2. One typed route table is the single source for links, the language switch, hreflang, canonical URLs and the sitemap.

## Requirements

### Requirement: Route table and URL set

A single typed route table MUST map each page id to an EN path and an ES path. The deployed, canonical paths MUST be exactly:

| Page id | EN | ES |
|---|---|---|
| `home` | `/` | `/es` |
| `methodology` | `/methodology` | `/es/metodologia` |
| `about` | `/about` | `/es/sobre-nosotros` |
| `privacy` | `/privacy` | `/es/privacidad` |
| `terms` | `/terms` | `/es/terminos` |
| `contact` | `/contact` | `/es/contacto` |
| `concrete` | `/concrete-calculator` | `/es/calculadora-de-concreto` |

Each canonical path MUST answer 200 without a redirect. Paths are lowercase, ASCII, with no trailing slash (except `/`), no file extension and no `index.html`. No other page, besides the two 404 pages, MAY be built. A query string on a calculator path (`/concrete-calculator?v=1&l=240`) is served by the same static file and answers 200.
(Previously: six page ids and 12 paths; no calculator row; no statement about queries.)

#### Scenario: [SR1] Exact page set
- GIVEN `dist` after `npm run build`
- WHEN the HTML files are listed and mapped to URLs
- THEN the URL set is exactly the 14 paths above plus `/404.html` and `/es/404.html` (16 pages)

Note: the exact counts (14 routable + 2 not-found) are the end-of-change state of the concrete-calculator change (they were 12 and 14 at the end of the web shell). Pages enter the route table slice by slice, so intermediate slices check the set derived from the table at that point.

#### Scenario: [SR2] Table drives links
- GIVEN the route table and all built pages
- WHEN every internal `href` in header, footer and body is collected
- THEN each internal `href` is a table path optionally followed by `#fragment`, a bare `#fragment`, `/favicon.svg`, or `mailto:contacto@maestrocalc.com`, with no literal path outside the table, and every fragment target id exists on the target page

#### Scenario: [SR3] Canonical path is served directly
- GIVEN the built site served by the Workers assets configuration (post-deploy smoke, or `wrangler dev` with the e2e config for the local equivalent)
- WHEN each of the 14 paths is requested
- THEN the status is 200 and no redirect occurred

#### Scenario: [SR16] Calculator path with a query
- GIVEN the same environment
- WHEN `/concrete-calculator?v=1&l=240` and `/es/calculadora-de-concreto?v=1&l=240` are requested
- THEN both answer 200 with the body of the clean path and no redirect

### Requirement: Language attribute

Pages under EN paths MUST have `<html lang="en-US">` and pages under `/es` MUST have `<html lang="es-US">`. The 404 pages follow their locale (`/404.html` is EN, `/es/404.html` is ES).

#### Scenario: [SR4] lang per page
- GIVEN the 14 built pages
- WHEN `html[lang]` is read
- THEN it is `en-US` for all pages whose path does not start with `/es` and `es-US` for the others

### Requirement: Language switch

Every page MUST contain a language switch in the header: a link to the equivalent page in the other locale, with visible text `Español` (on EN pages) or `English` (on ES pages), a `lang` attribute equal to the target language (`es` or `en`) and a `hreflang` attribute equal to the target alternate (`es-US` or `en-US`). On a 404 page, which has no known equivalent, the switch MUST link to the other locale's home. The static HTML of every page carries no query string on the switch. On a calculator page only, the page script MUST append the current query string to the switch `href` (and keep it current after every state change), so the other-locale page opens with the same state.
(Previously: the switch MUST NOT carry query strings in this change.)

#### Scenario: [SR5] Switch maps to the equivalent page
- GIVEN each of the 14 routable pages
- WHEN the switch `href` is read from the built HTML
- THEN it equals the table counterpart (for example `/about` gives `/es/sobre-nosotros`; `/es` gives `/`; `/concrete-calculator` gives `/es/calculadora-de-concreto`) with no query

#### Scenario: [SR6] Switch on 404 pages
- GIVEN `/404.html` and `/es/404.html`
- WHEN the switch `href` is read
- THEN it is `/es` and `/` respectively

#### Scenario: [SR7] Switch round trip in the browser
- GIVEN Chromium on `/privacy` at 390x844
- WHEN the switch is activated, then the switch on the resulting page is activated
- THEN the URLs are `/es/privacidad` and then `/privacy`, each with status 200

#### Scenario: [SR20] Switch keeps the calculator state
- GIVEN Chromium on `/concrete-calculator?v=1&l=240` with scripts enabled
- WHEN the switch `href` is read, then the switch is activated
- THEN the `href` is `/es/calculadora-de-concreto?v=1&l=240`, and the resulting ES page shows 2.72 yardas cúbicas and 123 bolsas of 80 lb (the same state as the EN page)

#### Scenario: [SR21] Switch follows edits
- GIVEN the EN calculator page after the script runs
- WHEN the user changes the bag size to 60 lb
- THEN the URL query becomes `?v=1&bg=60` and the switch `href` becomes `/es/calculadora-de-concreto?v=1&bg=60`

#### Scenario: [SR22] Canonical and alternates stay clean
- GIVEN the calculator page opened with a query and scripts enabled
- WHEN the head is read
- THEN the canonical and the three hreflang entries are the query-free absolute URLs of the table, and the sitemap lists no URL with a query

### Requirement: hreflang and canonical

Every routable page MUST contain a self-referencing canonical `<link rel="canonical">` with an absolute `https://maestrocalc.com` URL equal to the page's own canonical path (no query string, no fragment), and exactly three `<link rel="alternate" hreflang>` entries with values `en-US` (EN URL), `es-US` (ES URL) and `x-default` (the EN URL). The set MUST be reciprocal: if page A lists page B as an alternate, B lists A with the same values. The 404 pages MUST have no canonical and no hreflang.

#### Scenario: [SR8] Values on the about pages
- GIVEN built `/about` and `/es/sobre-nosotros`
- WHEN the head is parsed
- THEN both contain `en-US` -> `https://maestrocalc.com/about`, `es-US` -> `https://maestrocalc.com/es/sobre-nosotros`, `x-default` -> `https://maestrocalc.com/about`; the canonical is the page's own URL

#### Scenario: [SR9] Home canonicals
- GIVEN built `/` and `/es`
- WHEN canonical is read
- THEN they are `https://maestrocalc.com/` and `https://maestrocalc.com/es`

#### Scenario: [SR10] Reciprocity gate fails on a broken pair
- GIVEN a built copy of `dist` where `/es/privacidad` no longer lists `/privacy`
- WHEN `npm run check:site` runs
- THEN it exits non-zero naming both pages

### Requirement: 404 behaviour under Workers assets

The Workers assets configuration MUST set `not_found_handling` to `404-page`. An unknown path MUST answer HTTP 404 with the nearest `404.html` by directory: paths under `/es/` MUST get `/es/404.html` (Spanish, `lang="es-US"`), all others `/404.html` (English). `/es/` (trailing slash) MUST NOT answer 404: it serves the ES home with 200 or redirects once to `/es`. The 404 pages MUST be `noindex`, MUST contain a link to the locale's home, and MUST NOT appear in the sitemap.

#### Scenario: [SR11] Unknown EN path
- GIVEN the deployed site (or a Workers-assets emulation using the same lookup rule)
- WHEN `/does-not-exist` and `/essay` are requested
- THEN both answer 404 with the body of `/404.html` (`lang="en-US"`)

#### Scenario: [SR12] Unknown ES paths
- GIVEN the same environment
- WHEN `/es/does-not-exist` and `/es/a/b/c` are requested
- THEN both answer 404 with the body of `/es/404.html` (`lang="es-US"`)

#### Scenario: [SR13] ES trailing slash
- GIVEN the same environment
- WHEN `/es/` is requested
- THEN the final status is 200 on the ES home, reached with at most one redirect to `https://maestrocalc.com/es`

#### Scenario: [SR14] 404 page content
- GIVEN `dist/404.html` and `dist/es/404.html`
- WHEN parsed
- THEN each has `meta[name="robots"][content~="noindex"]`, one `h1`, a link whose `href` is `/` (EN) or `/es` (ES), and no canonical

#### Scenario: [SR15] Wrangler setting
- GIVEN the Workers configuration file of `apps/web`
- WHEN parsed
- THEN `assets.not_found_handling` equals `404-page`

### Requirement: Calculator pages in the route table

The route module MUST export a typed list of calculator page ids (`concrete` in this change) and an explicit list of registry calculators that have no page, `PAGELESS` (`['rectangle-area']`, the foundation proof calculator). Every id of the page list MUST be an id of the route table, and every calculator the site lists in `apps/web/src/lib/calculators.ts` MUST be either in the page list or in `PAGELESS`, never both, so one table drives the sitemap, hreflang, `check:site` templates and the browser URL lists. The catch-all page renders a calculator id with the calculator page template and every other id as before. Adding a calculator page takes the edits of the existing "add a page" recipe plus the content entry and the registry (documented in `AGENTS.md`).

#### Scenario: [SR17] List agrees with the table
- GIVEN the route module and the web registry
- WHEN the contract test runs
- THEN the calculator ids are `['concrete']` and `PAGELESS` is `['rectangle-area']`, each page id is a table id, and the test fails naming the id for: a page id missing from the table, a registry calculator in neither list, an id in both lists, or a `PAGELESS` id that is not in the registry

Note: the page goes live in the last slice of this change. Until then `concrete` is a registry calculator without a route and sits in `PAGELESS` (`['rectangle-area', 'concrete']`); the last slice moves it to the page list together with its `ROUTES` row, so every merged state of `main` satisfies [SR17].

#### Scenario: [SR18] Template per id
- GIVEN the built `/concrete-calculator` and `/privacy`
- WHEN parsed
- THEN the first contains the calculator form and result panel and one module script, and the second is a trust page with neither

### Requirement: Page totals after the calculator change

After this change the site has 7 page ids, 14 routable pages (7 per locale), 2 not-found pages and 16 built pages, 16 `page.*` catalog keys per locale, a sitemap of 14 URLs, 12 content entries (10 trust pages in the `pages` collection and 2 in the `calculators` collection), and one calculator page per locale. Every count of "12 routable", "14 pages" or "six pages" in the other site specs (`site-shell`, `site-quality`, `site-seo`, `trust-pages`) that this change does not rewrite is to be read as the table-derived value of this requirement; the pinned values live only in `end-state.contract.test.ts`.

#### Scenario: [SR19] Pinned end state
- GIVEN `end-state.contract.test.ts`
- WHEN it runs
- THEN it asserts the ids `home`, `methodology`, `about`, `privacy`, `terms`, `contact`, `concrete`, 14 static paths, a page count of 16, 16 `page.*` keys per locale, 14 `<loc>` entries in the sitemap, 10 trust entries and 2 calculator entries
