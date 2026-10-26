# site-seo

Implements PLAN.md §7.2, §7.4, §7.8 and decisions D6, D8. Per-page metadata comes from the `site` catalog; `npm run check:site` validates built HTML.

## Requirements

### Requirement: Title and meta description

Every page MUST have a non-empty `<title>` of 10 to 60 characters and exactly one `<meta name="description">` of 70 to 160 characters, both read from `page.<id>.title` and `page.<id>.description` of the page's locale. Titles MUST be unique across all built pages (16). Descriptions MUST be unique across the routable pages (14). Non-home titles MUST end with ` | Maestro Calc`.
(Previously: 14 pages and 12 routable pages.)

#### Scenario: [SE1] Lengths and uniqueness
- GIVEN the 16 built pages
- WHEN titles and descriptions are extracted
- THEN lengths are within the ranges above and no duplicates exist

#### Scenario: [SE2] Catalog is the source
- GIVEN the `site` catalog of each locale
- WHEN `page.<id>.title` is compared with the built `<title>` of that page
- THEN they are equal for every page id, including `concrete` and `notFound`

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

Both home pages MUST contain JSON-LD (`<script type="application/ld+json">`) that parses as JSON and declares exactly one `Organization` and one `WebSite`. `Organization` MUST have `name` `Maestro Calc` and `url` `https://maestrocalc.com` and MUST NOT contain a `logo` property (D8). `WebSite` MUST have `name` `Maestro Calc`, `url` equal to the page's own canonical URL and `inLanguage` equal to `en-US` or `es-US`. Calculator pages carry the JSON-LD of "Calculator structured data". Any JSON-LD on any other page MUST parse and MUST NOT declare types the page does not support (`Product`, `Review`, `AggregateRating`, `FAQPage`, `BreadcrumbList`, `WebApplication`, `Person` are forbidden outside the pages that this spec allows them on).
(Previously: `FAQPage` and `BreadcrumbList` were forbidden everywhere and `WebApplication` was not mentioned; there were no calculator pages.)

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

#### Scenario: [SE23] Other pages stay free of calculator types
- GIVEN the built trust pages
- WHEN their JSON-LD is read
- THEN they declare no `WebApplication`, `BreadcrumbList`, `FAQPage`, `Product`, `Review`, `AggregateRating` or `Person`

### Requirement: robots.txt

`/robots.txt` MUST exist, return plain text, allow all crawlers and reference the sitemap with an absolute URL.

#### Scenario: [SE9] robots content
- GIVEN `dist/robots.txt`
- WHEN parsed line by line
- THEN it contains `User-agent: *`, no `Disallow: /` line, and exactly `Sitemap: https://maestrocalc.com/sitemap.xml`

### Requirement: Sitemap with alternates

One sitemap at `/sitemap.xml` (D6) MUST list exactly the 14 canonical absolute URLs from the route table, each `<url>` carrying three `xhtml:link rel="alternate"` entries (`en-US`, `es-US`, `x-default`) whose `href`s equal the hreflang values of the page. It MUST NOT list the 404 pages, any URL with a query string, or any URL absent from the route table.
(Previously: 12 URLs.)

#### Scenario: [SE10] Sitemap entries
- GIVEN `dist/sitemap.xml`
- WHEN parsed
- THEN there are 14 `<loc>` values, equal to the canonical URLs (including `https://maestrocalc.com/concrete-calculator` and `https://maestrocalc.com/es/calculadora-de-concreto`), each with three alternates

Note: 14 is the end-of-change state; before the last content slice the sitemap lists exactly the URLs derived from the route table at that point.

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

`npm run check:site` MUST exit non-zero if any routable page lacks any of: title, description, canonical, three hreflang alternates with reciprocity, one H1, parseable JSON-LD (home pages and calculator pages, with the types each requires), matching `lang`, or contains client JavaScript outside the rules of `site-shell` (a calculator page may carry its one module script; every other page none). It MUST exit 0 on the unmodified build. The template of a page (static, home, calculator) is derived from the route table and the calculator id list, never guessed from the HTML.
(Previously: parseable JSON-LD on home pages only, and no client JavaScript on any page.)

#### Scenario: [SE14] Green build
- GIVEN a clean `npm run build`
- WHEN `npm run check:site` runs
- THEN it exits 0 and prints the number of pages checked (16)

Note: 16 is the end-of-change state (14 routable + 2 not-found); `check:site` derives the expected count from the route table.

#### Scenario: [SE15] Missing canonical fails
- GIVEN a built copy with the canonical removed from one page
- WHEN `npm run check:site` runs
- THEN it exits non-zero naming the page

### Requirement: Calculator page metadata

The calculator pages MUST carry the metadata of `ICW16`, read from `page.concrete.title` / `page.concrete.description`, a self-referencing canonical without query, three reciprocal hreflang alternates (`en-US` `https://maestrocalc.com/concrete-calculator`, `es-US` `https://maestrocalc.com/es/calculadora-de-concreto`, `x-default` the EN URL), no `noindex`, and exactly one `<h1>` whose text is the calculator title (`Concrete Calculator` / `Calculadora de Concreto`). The keyword of the page is "concrete calculator" (EN) and "calculadora de concreto" (ES); no other page uses that phrase as its title.

#### Scenario: [SE16] Titles and descriptions
- GIVEN built `/concrete-calculator` and `/es/calculadora-de-concreto`
- WHEN the head is parsed
- THEN the titles are `Concrete Calculator: Cubic Yards and Bags | Maestro Calc` (56 characters) and `Calculadora de concreto en yardas y bolsas | Maestro Calc` (57), the descriptions are the 125 and 144 character strings of `ICW16`, and all four are unique in the site

#### Scenario: [SE17] hreflang and canonical
- GIVEN the same pages
- WHEN canonical and alternates are read
- THEN the canonical is the page's own query-free URL, and the alternate set is the three values above on both pages (reciprocal)

#### Scenario: [SE18] H1 and heading order
- GIVEN the same pages
- WHEN headings are listed in order
- THEN there is one `h1` (`Concrete Calculator` / `Calculadora de Concreto`), the sections are `h2`, FAQ questions are `h3` under the FAQ `h2`, and no level jumps by more than 1

### Requirement: Calculator structured data

A calculator page MUST contain JSON-LD blocks that parse as JSON and declare exactly these types: one `WebApplication`, one `BreadcrumbList` and one `FAQPage` (in one `@graph` or in three blocks).

- `WebApplication`: `name` equal to the H1, `url` equal to the page's canonical URL, `inLanguage` `en-US` or `es-US`, `applicationCategory` `UtilitiesApplication`, `operatingSystem` `Any`, `isAccessibleForFree` `true`. It MUST NOT contain `offers`, `aggregateRating`, `review`, `ratingValue` or `image`.
- `BreadcrumbList`: two `ListItem`s with `position` 1 (`name` `Home` / `Inicio`, `item` `https://maestrocalc.com/` / `https://maestrocalc.com/es`) and 2 (`name` equal to the H1, `item` the canonical URL).
- `FAQPage`: one `Question` per visible FAQ item on the page (at least 4), whose `name` equals the visible question text and whose `acceptedAnswer.text` equals the visible answer text after whitespace normalization; no question exists in JSON-LD that is not visible.

No other type is allowed on a calculator page. `Product`, `Review`, `AggregateRating` and `Person` are forbidden everywhere.

#### Scenario: [SE19] Calculator JSON-LD
- GIVEN built `/concrete-calculator` and `/es/calculadora-de-concreto`
- WHEN the JSON-LD blocks are parsed
- THEN the `@type` values are exactly `WebApplication`, `BreadcrumbList`, `FAQPage`; `inLanguage` is `en-US` and `es-US`; the breadcrumb items and the `WebApplication.url` have the values above

#### Scenario: [SE20] FAQ parity
- GIVEN the same pages
- WHEN the FAQ `h3` texts and answers are compared with the `FAQPage` entities
- THEN they are equal one to one, in the same order, with the same count in EN and ES

#### Scenario: [SE21] Forbidden types fail the gate
- GIVEN a built copy where a calculator page has an `AggregateRating`, or an `offers` property, or a `Product` node, or a `FAQPage` question not shown in the HTML
- WHEN `npm run check:site` runs
- THEN it exits non-zero naming the page and the type or property

#### Scenario: [SE22] Missing type fails the gate
- GIVEN a built copy where `/es/calculadora-de-concreto` lacks its `BreadcrumbList`
- WHEN `npm run check:site` runs
- THEN it exits non-zero naming the page and the missing type
