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

Both home pages MUST have one H1, a short honest introduction of what Maestro Calc is, and links to methodology, about and the published calculator (`concrete`) in the current locale. They MAY name and describe the calculators that are published (today the concrete calculator) and MUST NOT contain a list of upcoming calculators, "coming soon" / "próximamente" / "pronto" wording, names of calculators not yet published, usage numbers, testimonials or ratings. The introduction MUST use the PLAN.md §3 tagline from `site.tagline` (ICW8), not the removed `SITE.tagline` placeholder.
(Previously: links to methodology and about only, and no calculator names at all. The quoted EN tagline of the old text, "tell you exactly what to buy", was out of date: `i18n-catalog` ICW8 pins "estimate what to buy".)

#### Scenario: [TP7] Home links
- GIVEN built `/` and `/es`
- WHEN `main a[href]` is collected
- THEN `/methodology` and `/about` (EN) and `/es/metodologia` and `/es/sobre-nosotros` (ES) are present

#### Scenario: [TP8] No empty promises
- GIVEN built `/` and `/es`
- WHEN the text is searched case-insensitively for `coming soon`, `próximamente`, `pronto`, `trusted by`, `miles de`, `stars`, `estrellas`
- THEN there is no match

#### Scenario: [TP21] Home links the calculator
- GIVEN built `/` and `/es`
- WHEN `main a[href]` is collected
- THEN `/concrete-calculator` (EN) and `/es/calculadora-de-concreto` (ES) are present, each with link text taken from the catalog, and the home pages list no other calculator

### Requirement: Methodology page

The methodology page (`/methodology`, `/es/metodologia`) MUST describe today's approach in plain language: calculations are exact (no hidden rounding before display), every formula has automated tests with hand-verified cases, sources are cited with a review date on each calculator page, and corrections are handled per the about page. It MUST list the published calculator in one section whose heading carries the id `concrete` (EN) / `concreto` (ES), with: the formula of each shape, the bag yields with their source (name, URL, retrieval date) and the word "approximately" / "aproximadamente", the π disclosure, the waste default stated as a rule of thumb, and the published hand-verified test cases. It MUST NOT list calculators, formulas, yields or test cases that are not published, and MUST NOT claim third-party certification, licensed review or engineering approval.
(Previously: it listed no calculators, formulas, yields or test cases because none existed.)

#### Scenario: [TP9] Methodology content
- GIVEN built methodology pages
- WHEN parsed
- THEN each has one H1, at least two `h2`, a link to the about page corrections section, and none of the strings `certified`, `licensed engineer`, `ingeniero licenciado`, `certificado por`

#### Scenario: [TP22] Concrete section and anchor
- GIVEN built `/methodology` and `/es/metodologia`
- WHEN ids are collected
- THEN `concrete` (EN) and `concreto` (ES) exist exactly once, each on a heading, and the calculator page links to it (`/methodology#concrete`, `/es/metodologia#concreto`)

#### Scenario: [TP23] Formulas, yields and pi disclosure
- GIVEN the concrete section of each locale
- WHEN its text is read
- THEN it states the four formulas (slab and footing: length x width x thickness or depth, times the number of pieces for footings; column: π x (diameter / 2)² x height x pieces; steps: width x run x rise x N(N+1)/2), that the extra for waste is applied before the bags are counted and bags are rounded up, the three yields `0.30`, `0.45`, `0.60` cubic feet for 40, 60 and 80 lb with the source name, the URL and `2026-10-25` of `concreteMix`, and the value `3.14159265358979323846264338327950288` of π with the statement that it is an approximation whose error is below 10^-35

#### Scenario: [TP24] Published test cases match the engine
- GIVEN the table of published cases in each locale: slab default (net 40.00 ft3, total 44.00 ft3, 1.63 yd3, 74 bags of 80 lb), footing `l=216 n=3` (48.00, 52.80, 1.96, 88), column default (6.28, 6.91, 0.26, 12), steps default (12.83, 14.12, 0.52, 24)
- WHEN the content contract test runs each case through core
- THEN every figure equals the engine output at the displayed precision, and the test fails when a figure in the Markdown or in the engine changes alone

#### Scenario: [TP26] No "not published yet" wording once live
- GIVEN the built methodology pages once the calculator is routed
- WHEN searched case-insensitively
- THEN `No calculator is published yet` and `Todavía no hay ninguna calculadora publicada` (and any sentence saying no calculator exists) do not appear, and the concrete section reaches `main` in the same merge as the `ROUTES` row (never before it)

#### Scenario: [TP25] Methodology claims nothing unpublished
- GIVEN the built methodology pages
- WHEN searched, case-insensitively and as whole words, for the names of calculators other than the concrete calculator (`roofing`, `drywall`, `paint`, `gravel`, `mulch`, `topsoil`, `techado`, `pintura`, `grava`)
- THEN there is no match

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
