# Delta for trust-pages

Implements PLAN.md §5.3 and §9.3, decisions D3, D4, D5. Home, methodology, about, privacy, terms, contact in EN and ES. Long-form copy is Markdown per locale with validated frontmatter.

## ADDED Requirements

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

Both home pages MUST have one H1, a short honest introduction of what Maestro Calc is, and links to methodology and about in the current locale. They MUST NOT contain a list of upcoming calculators, "coming soon" / "próximamente" / "pronto" wording, calculator names not yet published, usage numbers, testimonials or ratings. The introduction MUST use the PLAN.md §3 tagline from `site.tagline` — EN `Jobsite calculators that tell you exactly what to buy`, ES `Calcula tu obra y sabe qué comprar` — not the current `SITE.tagline` placeholder (which is removed).

#### Scenario: [TP7] Home links
- GIVEN built `/` and `/es`
- WHEN `main a[href]` is collected
- THEN `/methodology` and `/about` (EN) and `/es/metodologia` and `/es/sobre-nosotros` (ES) are present

#### Scenario: [TP8] No empty promises
- GIVEN built `/` and `/es`
- WHEN the text is searched case-insensitively for `coming soon`, `próximamente`, `pronto`, `trusted by`, `miles de`, `stars`, `estrellas`
- THEN there is no match

### Requirement: Methodology page

The methodology page (`/methodology`, `/es/metodologia`) MUST describe today's approach in plain language: calculations are exact (no hidden rounding before display), every formula has automated tests with hand-verified cases, sources are cited with a review date on each calculator page, and corrections are handled per the about page. It MUST NOT list calculators, formulas, yields or test cases that do not yet exist, and MUST NOT claim third-party certification, licensed review or engineering approval.

#### Scenario: [TP9] Methodology content
- GIVEN built methodology pages
- WHEN parsed
- THEN each has one H1, at least two `h2`, a link to the about page corrections section, and none of the strings `certified`, `licensed engineer`, `ingeniero licenciado`, `certificado por`

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

The privacy page (`/privacy`, `/es/privacidad`) MUST describe only what the site does now (D4): hosting on Cloudflare, which processes standard request logs; no cookies set by the site; no analytics; no advertising; no accounts or forms; email sent to the contact address is used only to reply. It MUST state that the page will be updated before analytics or advertising is added. It MUST NOT name services the site does not use: `Google Analytics`, `GA4`, `Tag Manager`, `GTM`, `AdSense`, `Mediavine`, `Raptive`, `Amazon`, `affiliate`, `afiliad`.

#### Scenario: [TP12] Facts match the build
- GIVEN the built site
- WHEN the privacy claims are cross-checked
- THEN no page issues `Set-Cookie` in `_headers`, no `document.cookie` or third-party origin exists in any built asset, and `localStorage` is not referenced

#### Scenario: [TP13] No future-state claims
- GIVEN the built privacy pages
- WHEN searched for the forbidden names above (case-insensitive)
- THEN there is no match

#### Scenario: [TP14] Required statements
- GIVEN the built privacy pages
- WHEN parsed
- THEN each mentions Cloudflare, states that no cookies are used, and shows `contacto@maestrocalc.com`

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
