# Delta for site-seo

Implements PLAN.md §7.2, §7.4, §7.8 and decisions D6, D8. Per-page metadata comes from the `site` catalog; `npm run check:site` validates built HTML.

## ADDED Requirements

### Requirement: Title and meta description

Every page MUST have a non-empty `<title>` of 10 to 60 characters and exactly one `<meta name="description">` of 70 to 160 characters, both read from `page.<id>.title` and `page.<id>.description` of the page's locale. Titles MUST be unique across all 14 pages. Descriptions MUST be unique across the 12 routable pages. Non-home titles MUST end with ` | Maestro Calc`.

#### Scenario: [SE1] Lengths and uniqueness
- GIVEN the 14 built pages
- WHEN titles and descriptions are extracted
- THEN lengths are within the ranges above and no duplicates exist

#### Scenario: [SE2] Catalog is the source
- GIVEN the `site` catalog of each locale
- WHEN `page.<id>.title` is compared with the built `<title>` of that page
- THEN they are equal for every page id, including `notFound`

#### Scenario: [SE3] Missing description fails the gate
- GIVEN a built copy of `dist` with one description removed
- WHEN `npm run check:site` runs
- THEN it exits non-zero naming the file

### Requirement: Single H1

Every page MUST have exactly one `<h1>` with non-empty text. Heading levels MUST NOT skip (an `h3` requires a preceding `h2`).

#### Scenario: [SE4] Second H1 fails the gate
- GIVEN a built copy of `dist` where one page has two `<h1>`
- WHEN `npm run check:site` runs
- THEN it exits non-zero naming the page

#### Scenario: [SE5] Heading order
- GIVEN the 14 built pages
- WHEN heading levels are listed in order
- THEN no level increases by more than 1 from the previous heading

### Requirement: Structured data

Both home pages MUST contain JSON-LD (`<script type="application/ld+json">`) that parses as JSON and declares exactly one `Organization` and one `WebSite`. `Organization` MUST have `name` `Maestro Calc` and `url` `https://maestrocalc.com` and MUST NOT contain a `logo` property (D8). `WebSite` MUST have `name` `Maestro Calc`, `url` equal to the page's own canonical URL and `inLanguage` equal to `en-US` or `es-US`. Any JSON-LD on any other page MUST parse and MUST NOT declare types the page does not support (`Product`, `Review`, `AggregateRating`, `FAQPage`, `BreadcrumbList` are forbidden in this change).

#### Scenario: [SE6] Home JSON-LD
- GIVEN built `/` and `/es`
- WHEN JSON-LD blocks are parsed
- THEN `@type` values are exactly `Organization` and `WebSite`, with the property values above

#### Scenario: [SE7] No logo
- GIVEN the Organization node on both home pages
- WHEN its keys are listed
- THEN `logo` and `image` are absent

#### Scenario: [SE8] Malformed JSON-LD fails the gate
- GIVEN a built copy with a JSON-LD block that is not valid JSON
- WHEN `npm run check:site` runs
- THEN it exits non-zero

### Requirement: robots.txt

`/robots.txt` MUST exist, return plain text, allow all crawlers and reference the sitemap with an absolute URL.

#### Scenario: [SE9] robots content
- GIVEN `dist/robots.txt`
- WHEN parsed line by line
- THEN it contains `User-agent: *`, no `Disallow: /` line, and exactly `Sitemap: https://maestrocalc.com/sitemap.xml`

### Requirement: Sitemap with alternates

One sitemap at `/sitemap.xml` (D6) MUST list exactly the 12 canonical absolute URLs from the route table, each `<url>` carrying three `xhtml:link rel="alternate"` entries (`en-US`, `es-US`, `x-default`) whose `href`s equal the hreflang values of the page. It MUST NOT list the 404 pages, any URL with a query string, or any URL absent from the route table.

#### Scenario: [SE10] Sitemap entries
- GIVEN `dist/sitemap.xml`
- WHEN parsed
- THEN there are 12 `<loc>` values, equal to the canonical URLs, each with three alternates

Note: 12 is the end-of-change state; before the last content slice the sitemap lists exactly the URLs derived from the route table at that point.

#### Scenario: [SE11] Sitemap agrees with pages
- GIVEN the sitemap and the built pages
- WHEN each `<url>` alternates set is compared with the page's head hreflang set
- THEN they are equal

#### Scenario: [SE12] Sitemap is the only index
- GIVEN `dist`
- WHEN listing `sitemap*.xml`
- THEN only `sitemap.xml` exists

### Requirement: Indexing directives

Routable pages MUST NOT carry a `noindex` robots meta or `X-Robots-Tag: noindex`. 404 pages MUST carry `noindex`.

#### Scenario: [SE13] Index state
- GIVEN the 14 built pages and `_headers`
- WHEN robots directives are collected
- THEN only `/404.html` and `/es/404.html` contain `noindex`

### Requirement: Built-HTML SEO gate

`npm run check:site` MUST exit non-zero if any routable page lacks any of: title, description, canonical, three hreflang alternates with reciprocity, one H1, parseable JSON-LD (home pages), matching `lang`, or contains client JavaScript. It MUST exit 0 on the unmodified build.

#### Scenario: [SE14] Green build
- GIVEN a clean `npm run build`
- WHEN `npm run check:site` runs
- THEN it exits 0 and prints the number of pages checked (14)

Note: 14 is the end-of-change state (12 routable + 2 not-found); `check:site` derives the expected count from the route table, so intermediate slices print the table-derived number.

#### Scenario: [SE15] Missing canonical fails
- GIVEN a built copy with the canonical removed from one page
- WHEN `npm run check:site` runs
- THEN it exits non-zero naming the page
