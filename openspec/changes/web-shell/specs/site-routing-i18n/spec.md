# Delta for site-routing-i18n

Implements PLAN.md §6.4 and §7.8, decision D2. One typed route table is the single source for links, the language switch, hreflang, canonical URLs and the sitemap.

## ADDED Requirements

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

Each canonical path MUST answer 200 without a redirect. Paths are lowercase, ASCII, with no trailing slash (except `/`), no file extension and no `index.html`. No other page, besides the two 404 pages, MAY be built.

#### Scenario: [SR1] Exact page set
- GIVEN `dist` after `npm run build`
- WHEN the HTML files are listed and mapped to URLs
- THEN the URL set is exactly the 12 paths above plus `/404.html` and `/es/404.html`

Note: the exact count (12 routable + 2 not-found) is the end-of-change state. Pages enter the route table slice by slice, so intermediate slices check the set derived from the table at that point; the pinned count is asserted once the last content slice lands.

#### Scenario: [SR2] Table drives links
- GIVEN the route table and all built pages
- WHEN every internal `href` in header, footer and body is collected
- THEN each internal `href` is a table path optionally followed by `#fragment`, a bare `#fragment`, `/favicon.svg`, or `mailto:contacto@maestrocalc.com`, with no literal path outside the table, and every fragment target id exists on the target page

#### Scenario: [SR3] Canonical path is served directly
- GIVEN the built site served by the Workers assets configuration (post-deploy smoke, or `wrangler dev` with the e2e config for the local equivalent)
- WHEN each of the 12 paths is requested
- THEN the status is 200 and no redirect occurred

### Requirement: Language attribute

Pages under EN paths MUST have `<html lang="en-US">` and pages under `/es` MUST have `<html lang="es-US">`. The 404 pages follow their locale (`/404.html` is EN, `/es/404.html` is ES).

#### Scenario: [SR4] lang per page
- GIVEN the 14 built pages
- WHEN `html[lang]` is read
- THEN it is `en-US` for all pages whose path does not start with `/es` and `es-US` for the others

### Requirement: Language switch

Every page MUST contain a language switch in the header: a link to the equivalent page in the other locale, with visible text `Español` (on EN pages) or `English` (on ES pages), a `lang` attribute equal to the target language (`es` or `en`) and a `hreflang` attribute equal to the target alternate (`es-US` or `en-US`). On a 404 page, which has no known equivalent, the switch MUST link to the other locale's home. The switch MUST NOT carry query strings in this change.

#### Scenario: [SR5] Switch maps to the equivalent page
- GIVEN each of the 12 routable pages
- WHEN the switch `href` is read
- THEN it equals the table counterpart (for example `/about` gives `/es/sobre-nosotros`; `/es` gives `/`)

#### Scenario: [SR6] Switch on 404 pages
- GIVEN `/404.html` and `/es/404.html`
- WHEN the switch `href` is read
- THEN it is `/es` and `/` respectively

#### Scenario: [SR7] Switch round trip in the browser
- GIVEN Chromium on `/privacy` at 390x844
- WHEN the switch is activated, then the switch on the resulting page is activated
- THEN the URLs are `/es/privacidad` and then `/privacy`, each with status 200

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
