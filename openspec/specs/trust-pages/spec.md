# trust-pages

Implements PLAN.md §5.3 and §9.3, decisions D3, D4, D5. Home, methodology, about, privacy, terms, contact in EN and ES. Long-form copy is Markdown per locale with validated frontmatter.

## Requirements

### Requirement: Content entries and frontmatter

Each of `methodology`, `about`, `privacy`, `terms`, `contact` MUST exist as one content entry per locale (10 entries). Frontmatter MUST validate: `id` (one of the five), `locale` (`en` or `es`), `updated` (ISO date `YYYY-MM-DD`), `ownerReview` (`pending` or `approved`). The build MUST fail on a missing, unknown or invalid field, on a duplicate `(id, locale)` and on a missing counterpart locale.

#### Scenario: [TP1] Ten valid entries
- GIVEN the content collection
- WHEN the build loads it
- THEN it contains exactly 10 entries covering each id in both locales

#### Scenario: [TP2] Invalid frontmatter fails the build
- GIVEN an entry with `ownerReview: maybe` or `updated: 23/10/2026`
- WHEN `npm run build` runs
- THEN it exits non-zero naming the entry

#### Scenario: [TP3] Missing locale counterpart fails
- GIVEN `privacy` exists in EN only
- WHEN the content contract test runs
- THEN it fails naming `privacy` and `es`

### Requirement: Owner-review marking

At the time of this change every entry MUST carry `ownerReview: pending`, because legal and editorial copy is unreviewed by the owner. The marker MUST NOT be rendered: built HTML MUST NOT contain (case-insensitively) `ownerReview`, `draft`, `borrador`, `pending review` or any badge derived from it. `npm run check:site` MUST print the count of `pending` entries without failing on it. Changing an entry to `approved` is a deliberate owner action recorded in the archive report.

#### Scenario: [TP4] All pending at spec time
- GIVEN the 10 entries
- WHEN `ownerReview` is read
- THEN all equal `pending`

#### Scenario: [TP5] Marker is invisible
- GIVEN the built trust pages
- WHEN their text is searched case-insensitively for `ownerReview`, `draft`, `borrador`, `pending review`
- THEN there is no match

### Requirement: Visible update date

Each trust page MUST show its `updated` date as `<time datetime="YYYY-MM-DD">` with the same value as the frontmatter.

#### Scenario: [TP6] Time element
- GIVEN each built trust page
- WHEN `time[datetime]` is read
- THEN it equals the entry's `updated`

### Requirement: Home page

Both home pages (`/`, `/es`) MUST have exactly one H1 in a hero band, the site tagline `site.tagline` (ICW8, PLAN.md §3) as its supporting line, and a calculator directory. The H1 states what the site does and the supporting line adds no claim, number or promise.

The directory MUST list exactly the calculators of `CALCULATOR_PAGES`, in `ROUTES` order, as one card per calculator. A card shows, from the catalogs of the current locale: the title (`page.home.cards.<id>.title`), a one-line summary (`page.home.cards.<id>.summary`) and the worked example line of the calculator (`calc.<id>.page.example`) as its evidence. Its link points to the route path of the current locale. A calculator with no route has no card. A routed calculator without `page.home.cards.<id>.{title,summary}` in both locales MUST fail the build at the type level, and adding a routed calculator MUST need no edit of the home view. The square footage card summary describes square feet, yards and meters for rooms and slabs and promises no material quantities.

The methodology and about links stay on the home, in the current locale, after the directory. The pages MUST NOT contain a list of upcoming calculators, "coming soon" / "próximamente" / "pronto" wording, names of calculators that are not routed, usage numbers, testimonials or ratings.

The home MUST ship no client JavaScript (`site-shell` [SS18]), its HTML MUST stay within the byte budget of `site-quality` [SQ7] with the headroom of [TP35], and it MUST pass axe with 0 violations in both locales ([SQ1]). Card copy in Spanish uses the neutral tú register.

#### Scenario: [TP7] Home links
- GIVEN built `/` and `/es`
- WHEN `main a[href]` is collected
- THEN `/methodology` and `/about` (EN) and `/es/metodologia` and `/es/sobre-nosotros` (ES) are present

#### Scenario: [TP8] No empty promises
- GIVEN built `/` and `/es`
- WHEN the text is searched case-insensitively for `coming soon`, `próximamente`, `pronto`, `trusted by`, `miles de`, `stars`, `estrellas`
- THEN there is no match

#### Scenario: [TP21] Home lists exactly the routed calculators
- GIVEN built `/` and `/es`, and `CALCULATOR_PAGES` with the route table (`concrete`, then `rectangle-area`)
- WHEN the card links of `main` are collected
- THEN the set of card link targets equals the route paths of `CALCULATOR_PAGES` in the current locale, in `ROUTES` order (`/concrete-calculator`, `/square-footage-calculator` EN; `/es/calculadora-de-concreto`, `/es/calculadora-de-pies-cuadrados` ES), each with link text taken from the catalog, and no other calculator link exists (contract test over the built HTML)
(Previously: "today `concrete` only", with a single card.)

#### Scenario: [TP28] One card per calculator with catalog copy
- GIVEN built `/` and `/es`
- WHEN each card is read
- THEN it holds, in this order, the `page.home.cards.<id>.title` text, the `page.home.cards.<id>.summary` text and the `calc.<id>.page.example` text of that locale, exactly one link per card, and the cards sit in a list (`ul`) whose item count equals the number of ids of `CALCULATOR_PAGES` (two) (unit test on the rendered view, repeated on the built HTML)

#### Scenario: [TP29] Hero band
- GIVEN built `/` and `/es`
- WHEN the hero is read
- THEN there is one `h1` inside `main` whose text equals `page.home.heading`, followed by the text of `site.tagline`, both from the catalog of the locale, and the hero holds no link and no other heading (unit test on the rendered view)

#### Scenario: [TP30] Order follows the route table
- GIVEN the data module `apps/web/src/lib/home-directory.ts` and a fixture route table whose key order differs from the order of a fixture page list (two routed calculators, `b` before `a` in the table, `['a', 'b']` in the list, plus a trust id in the table)
- WHEN `directoryOrder(routes, pages)` is called with the fixture, and `homeCards(locale, routes, pages)` is called with it for `en` and for `es` with catalogs that hold keys for both ids
- THEN `directoryOrder` returns the calculator ids in the table's order (`['b', 'a']`), never the list's or alphabetical order, and omits the trust id; each card's `href` is the route path of the requested locale (`/es/...` for `es`); and the rendered view lists the cards in that same order (a unit test on the data module, with the real `ROUTES` and `CALCULATOR_PAGES` as the defaults the view passes, repeated once on the rendered view with the real tables, where the cards are `concrete` then `rectangle-area`)

#### Scenario: [TP31] A calculator with no route has no card
- GIVEN a fixture registry in which one calculator id is in `PAGELESS` and not in `CALCULATOR_PAGES` (the live `PAGELESS` is empty after this change)
- WHEN the home view is rendered with that fixture and searched for the fixture id and its English and Spanish names
- THEN there is no match, and the live built `/` and `/es` hold exactly the two cards of [TP21] (a unit test on the fixture; the built-HTML search of the former wording is retired because `rectangle-area` is routed)
(Previously: the live build with `rectangle-area` in `PAGELESS` was searched for `rectangle`, `rectángulo`, `square footage` and `pies cuadrados`, which the go-live makes true by design.)

#### Scenario: [TP32] A routed id without card keys fails the build
- GIVEN the type test `apps/web/src/views/home.test-d.ts`, which asserts that `` `page.home.cards.${id}.title` `` and `` `page.home.cards.${id}.summary` `` are keys of the English site catalog for every `id` of `CalculatorPageId` (`concrete`, `rectangle-area`), and under `@ts-expect-error` that they are not keys for an id outside the union (a literal fixture id such as `fixture-unrouted`)
- WHEN `npm run typecheck` runs
- THEN it passes, and it fails naming the key if a routed id has no card keys in the English catalog or if the `@ts-expect-error` line stops erroring (a non-routed id gained card keys); a Spanish-only gap is already a compile error because `esSite` is declared `satisfies CatalogOf<typeof enSite>` (a type test; no manual fixture)

#### Scenario: [TP33] Methodology and about links come after the directory
- GIVEN built `/` and `/es`
- WHEN `main a[href]` is read in document order
- THEN every card link precedes the methodology link, which precedes the about link ([TP7] still holds)

#### Scenario: [TP34] No JavaScript on the home, directory included
- GIVEN built `/` and `/es`
- WHEN parsed, and then loaded in Chromium with request logging
- THEN the only `script` elements are `application/ld+json`, no `on*=` attribute exists, and no request has type `script` (`site-shell` [SS18], [SS19]; `site-quality` [SQ8], [SQ28])

#### Scenario: [TP35] Home HTML budget with recorded headroom
- GIVEN a clean `npm run build` with both cards
- WHEN `npm run check:site` measures `dist/index.html` and `dist/es/index.html`
- THEN each is at most 24,576 bytes (a headroom of at least 16,384 bytes under the 40,960 limit of [SQ7]), the home CSS (inline plus linked) is within 20,480 bytes ([SQ6]), and both measured sizes are recorded in the apply progress (a recorded measurement; the 24,576 ceiling is a stated bound, not a new global budget)

#### Scenario: [TP36] Home passes axe and keeps contrast
- GIVEN the built site served locally and a phone-profile Chromium
- WHEN axe runs on `/` and `/es` with the tags of `site-quality`
- THEN each reports 0 violations (the hero text over the Blueprint ground, the card summary and the evidence line pass `color-contrast`), and Lighthouse on `/` and `/es` keeps accessibility, SEO and best practices at 0.95 or higher and layout shift at 0.01 or lower ([SQ9])

#### Scenario: [TP37] Cards are usable on a phone and do not overflow
- GIVEN Chromium at 320, 390 and 1280 px wide on `/` and `/es`
- WHEN the document width and the card link boxes are measured
- THEN `document.documentElement.scrollWidth <= window.innerWidth` at every width, and each card link has a hit area of at least 44 by 44 CSS px (an e2e test at three widths)

### Requirement: Methodology page

The methodology page (`/methodology`, `/es/metodologia`) MUST describe today's approach in plain language: calculations are exact (no hidden rounding before display), every formula has automated tests with hand-verified cases, sources are cited with a review date on each calculator page, and corrections are handled per the about page. It MUST list each published calculator in one section whose heading carries the id of that calculator: `concrete` (EN) / `concreto` (ES) with the formula of each shape, the bag yields with their source (name, URL, retrieval date) and the word "approximately" / "aproximadamente", the π disclosure, the waste default stated as a rule of thumb, and the published hand-verified test cases; and `square-footage` (EN) / `pies-cuadrados` (ES) with the formula, the exact constants and the published hand-verified test cases. The intro MUST NOT call a single calculator "the calculator we publish today". It MUST NOT list calculators, formulas, yields or test cases that are not published, and MUST NOT claim third-party certification, licensed review or engineering approval. The sections, constants and cases are table rows by calculator id in the methodology contract (renamed from `methodology-concrete`), so a third calculator adds a row.
(Previously: one section, concrete; the intro said it lists the formulas, yields and cases of "the calculator we publish today, the concrete calculator"; the contract was concrete-only.)

#### Scenario: [TP9] Methodology content
- GIVEN built methodology pages
- WHEN parsed
- THEN each has one H1, at least two `h2`, a link to the about page corrections section, and none of the strings `certified`, `licensed engineer`, `ingeniero licenciado`, `certificado por`

#### Scenario: [TP22] Calculator sections and anchors
- GIVEN built `/methodology` and `/es/metodologia`
- WHEN ids are collected for every id of the methodology table
- THEN `concrete` and `square-footage` (EN), `concreto` and `pies-cuadrados` (ES) each exist exactly once, each on a heading, and each calculator page links to its own anchor (`/methodology#concrete`, `/es/metodologia#concreto`, `/methodology#square-footage`, `/es/metodologia#pies-cuadrados`) (a contract test over the table)
(Previously: the concrete section only.)

#### Scenario: [TP23] Formulas, yields and pi disclosure
- GIVEN the concrete section of each locale
- WHEN its text is read
- THEN it states the four formulas (slab and footing: length x width x thickness or depth, times the number of pieces for footings; column: π x (diameter / 2)² x height x pieces; steps: width x run x rise x N(N+1)/2), that the extra for waste is applied before the bags are counted and bags are rounded up, the three yields `0.30`, `0.45`, `0.60` cubic feet for 40, 60 and 80 lb with the source name, the URL and `2026-10-25` of `concreteMix`, and the value `3.14159265358979323846264338327950288` of π with the statement that it is an approximation whose error is below 10^-35 (the concrete row of the table)

#### Scenario: [TP24] Published test cases match the engine
- GIVEN, per id, the table of published cases in each locale: for `concrete` slab default (net 40.00 ft3, total 44.00 ft3, 1.63 yd3, 74 bags of 80 lb), footing `l=216 n=3` (48.00, 52.80, 1.96, 88), column default (6.28, 6.91, 0.26, 12), steps default (12.83, 14.12, 0.52, 24); for `rectangle-area` the four cases of [TP40]
- WHEN the methodology contract test runs each case of each row through core
- THEN every figure equals the engine output at the displayed precision, and the test fails when a figure in the Markdown or in the engine changes alone (a contract test)

#### Scenario: [TP26] No "not published yet" wording once live
- GIVEN the built methodology pages once the calculators are routed
- WHEN searched case-insensitively
- THEN `No calculator is published yet` and `Todavía no hay ninguna calculadora publicada` (and any sentence saying no calculator exists) do not appear, and each calculator section reaches `main` in the same merge as its `ROUTES` row (never before it)

#### Scenario: [TP25] Methodology claims nothing unpublished
- GIVEN the built methodology pages
- WHEN searched, case-insensitively and as whole words, for the names of calculators other than the published ones (`roofing`, `drywall`, `paint`, `gravel`, `mulch`, `topsoil`, `techado`, `pintura`, `grava`)
- THEN there is no match
(Previously: "other than the concrete calculator".)

#### Scenario: [TP38] Square footage formula and exact constants
- GIVEN the square footage section of each locale
- WHEN its text is read
- THEN it states the formula area = length × width, that one square foot is exactly 1/9 of a square yard and exactly 0.09290304 square meters (the international foot of 0.3048 m, NIST SP 811 Appendix B), that the conversions are exact and that rounding happens only for display, and it names no yield and no π (a contract test over the table row)

#### Scenario: [TP39] Square footage section reaches main only with the route
- GIVEN the commit that adds the `rectangle-area` row to `ROUTES`
- WHEN the methodology Markdown of that commit is read
- THEN the square footage section is present in both locales, and no earlier commit of the change contains it (the section and the route go live in one merge; checked on the final diff of the go-live PR)

#### Scenario: [TP40] Published square footage cases match the engine
- GIVEN the table of published cases in each locale: 12 ft × 10 ft (`v=1&l=144`) 120.00 ft², 13.33 yd², 11.15 m²; default 10 × 10 (`v=1`) 100.00, 11.11, 9.29; 12 ft 6 in × 10 ft (`v=1&l=150`) 125.00, 13.89, 11.61; 20 × 15 (`v=1&l=240&w=180`) 300.00, 33.33, 27.87
- WHEN the methodology contract test runs each case through core
- THEN every figure equals the engine output at two decimals, and the table is identical in both locales apart from the language of the headings (a contract test; the cases are those of `calc-rectangle-area` [RAP3])

#### Scenario: [TP41] The introduction no longer singles out one calculator
- GIVEN the built methodology pages
- WHEN the first paragraph is searched
- THEN `the calculator we publish today` and `la calculadora que publicamos hoy` do not appear, and the paragraph says the page lists the formulas, constants and cases of every calculator the site publishes (a contract test on the Markdown)

### Requirement: About page and editorial policy

The about page (`/about`, `/es/sobre-nosotros`) MUST present authorship as "Maestro Calc Editorial Team" / "Equipo editorial de Maestro Calc" and MUST NOT name a person or invent credentials. It MUST contain three anchored sections: EN `#editorial-policy`, `#ai-use`, `#corrections`; ES `#politica-editorial`, `#uso-de-ia`, `#correcciones`. The AI section MUST state that content is AI-assisted and verified by people, with formulas tested and sources cited. The corrections section MUST state how to report an error using `contacto@maestrocalc.com` and that corrections are logged with a date. The URL `SITE.author.url` MUST resolve to `/about`.

#### Scenario: [TP10] Anchors exist
- GIVEN built `/about` and `/es/sobre-nosotros`
- WHEN ids are collected
- THEN the three ids of each locale exist exactly once, each on a heading

#### Scenario: [TP11] Authorship
- GIVEN the built about pages
- WHEN searched for the editorial team name
- THEN `Maestro Calc Editorial Team` (EN) and `Equipo editorial de Maestro Calc` (ES) appear, and no `Person` JSON-LD exists

### Requirement: Privacy page reflects only today's facts

The privacy page (`/privacy`, `/es/privacidad`) MUST describe only what the site does now (D4): hosting on Cloudflare, which processes standard request logs; no cookies set by the site; no analytics; no advertising; no accounts; email sent to the contact address is used only to reply. Because the calculator pages run a script and hold a form, it MUST also state, in a section with id `calculators` (EN) / `calculadoras` (ES), that: calculators run in your browser; nothing you type is sent to us; the values sit in the page address so you can share it; and opening or sharing such an address sends it like any page request, so it can appear in Cloudflare's request logs. It MUST NOT claim "no forms" (the calculator has a form that sends nothing). This change reaches `main` in the same merge as the first calculator `ROUTES` row, so the page never describes a calculator that is not live. It MUST state that the page will be updated before analytics or advertising is added. It MUST NOT name services the site does not use: `Google Analytics`, `GA4`, `Tag Manager`, `GTM`, `AdSense`, `Mediavine`, `Raptive`, `Amazon`, `affiliate`, `afiliad`. Spanish copy uses the neutral tú register.
(Previously: "no accounts or forms", and nothing about calculators, scripts or the page address.)

The section copy is exactly:

| locale | text |
|---|---|
| en | `## Calculators` (id `calculators`), then: `Calculators run in your browser. Nothing you type is sent to us. The values you enter sit in the page address, so you can copy the link and share it. Opening or sharing that address sends it like any page request, so it can appear in Cloudflare's request logs. The address with your values also stays in your browser history, like any page you visit.` |
| es | `## Calculadoras` (id `calculadoras`), then: `Las calculadoras funcionan en tu navegador. Nada de lo que escribes se nos envía. Los valores que ingresas quedan en la dirección de la página, así que puedes copiar el enlace y compartirlo. Al abrir o compartir esa dirección, se envía como cualquier solicitud de página, por lo que puede aparecer en los registros de solicitudes de Cloudflare. La dirección con tus valores también queda en el historial de tu navegador, como cualquier página que visitas.` |

The cookies sentence becomes `Maestro Calc does not use cookies. The site has no analytics, no advertising and no accounts, and it does not keep anything about you in your browser.` (EN) and `Maestro Calc no usa cookies. El sitio no tiene analítica, publicidad ni cuentas, y no guarda nada sobre ti en tu navegador.` (ES); the rest of the page is unchanged.

#### Scenario: [TP12] Facts match the build
- GIVEN the built site
- WHEN the privacy claims are cross-checked
- THEN no page issues `Set-Cookie` in `_headers`, no `document.cookie` or third-party origin exists in any built asset (the calculator JS included), `localStorage` is not referenced, and the calculator JS makes no network request (`site-shell` [SS21], [SS23])

#### Scenario: [TP13] No future-state claims
- GIVEN the built privacy pages
- WHEN searched for the forbidden names above (case-insensitive)
- THEN there is no match

#### Scenario: [TP14] Required statements
- GIVEN the built privacy pages
- WHEN parsed
- THEN each mentions Cloudflare, states that no cookies are used, and shows `contacto@maestrocalc.com`

#### Scenario: [TP27] Calculator statements pinned
- GIVEN the built privacy pages
- WHEN parsed
- THEN the `calculators` / `calculadoras` section exists exactly once with the copy above, the words `no forms` / `ni formularios` do not appear, and `no accounts` / `ni cuentas` still appear

### Requirement: Terms and disclaimer page

The terms page (`/terms`, `/es/terminos`) MUST state that results are estimates, that users must verify them with a qualified professional and the local building code, and that the service is provided as is without warranty. It MUST NOT assert a governing law, jurisdiction, legal entity name or postal address (undecided by the owner).

#### Scenario: [TP15] Disclaimer wording
- GIVEN built terms pages
- WHEN text is searched
- THEN EN contains `estimates` and `local building code`; ES contains `estimaciones` and `código de construcción local`

#### Scenario: [TP16] No invented legal facts
- GIVEN built terms pages
- WHEN searched case-insensitively for `governed by`, `jurisdiction`, `LLC`, `Inc.`, `se rige por`, `jurisdicción`
- THEN there is no match

### Requirement: Contact page

The contact pages (`/contact`, `/es/contacto`) MUST show `contacto@maestrocalc.com` as visible text on both locales (D5), MAY link it with `mailto:` of the same address, MUST include the prompt "Found an error?" / "¿Encontraste un error?", and MUST NOT contain a form, script or response-time promise. `hello@maestrocalc.com` MUST NOT appear in the built site.

#### Scenario: [TP17] Address and prompt
- GIVEN built contact pages
- WHEN parsed
- THEN the text contains `contacto@maestrocalc.com`, no `form` element exists, and the locale prompt is present

#### Scenario: [TP18] Old address gone
- GIVEN all built files under `dist`
- WHEN searched for `hello@maestrocalc.com`
- THEN there is no match

### Requirement: Spanish register and parity

Spanish copy (catalog and Markdown) MUST address the reader in neutral tú (per `docs/design/direction.md`), neither usted nor voseo. A test MUST reject, case-insensitively and as whole words, the formal imperatives `Ingrese`, `Elija`, `Utilice`, `Consulte`, `Contáctenos`, `Póngase`, `Verifique` and the common voseo forms `verificá`, `calculá`, `consultá`, `elegí`, `tenés`, `podés`, `querés`, `sabés`. Each page MUST exist with equivalent sections in both locales (same count of `h2`).

#### Scenario: [TP19] Formal imperative or voseo rejected
- GIVEN an ES entry containing `Consulte`, and separately an ES terms entry containing `verificá con un profesional y el código local` (the PLAN.md disclaimer wording)
- WHEN the content test runs
- THEN it fails in each case naming the entry and the rejected form

#### Scenario: [TP20] Section parity
- GIVEN each page id
- WHEN `h2` counts are compared between EN and ES
- THEN they are equal
