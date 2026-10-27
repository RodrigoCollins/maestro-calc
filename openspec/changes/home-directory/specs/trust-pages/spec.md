# Delta for trust-pages

Turns the home from a placeholder into a calculator directory generated from the route table. Only the "Home page" requirement changes; every other trust-pages requirement is unchanged. Continues the prefix TP (next free id: TP28). Kept as written: [TP7], [TP8]. Generalised: [TP21]. Added: [TP28] to [TP37].

Placeholder-shape assertions removed. The unit test `HomeView.test.ts` pinned the placeholder (exactly two paragraphs, no `ul`/`ol`, the first link being concrete inside the intro paragraph, `rectangle`/`rectángulo` absent, intro text equal to `intro` + `links.concrete`). None of them is a scenario of the main spec, so they are removed with the rewrite of that test, and each guard that still matters is carried by a scenario below:

| Removed assertion | Replaced by |
|---|---|
| two paragraphs, no list | [TP28] (the directory is a list of cards) |
| first link is concrete, in the intro paragraph | [TP30] (cards are generated, order from `ROUTES`) |
| `rectangle` / `rectángulo` absent | [TP31] (a calculator with no route has no card; it appears only when routed) |
| intro text equals `intro` + `links.concrete` | [TP29] (hero text equals catalog keys) |

## MODIFIED Requirements

### Requirement: Home page

Both home pages (`/`, `/es`) MUST have exactly one H1 in a hero band, the site tagline `site.tagline` (ICW8, PLAN.md §3) as its supporting line, and a calculator directory. The H1 states what the site does and the supporting line adds no claim, number or promise.

The directory MUST list exactly the calculators of `CALCULATOR_PAGES`, in `ROUTES` order, as one card per calculator. A card shows, from the catalogs of the current locale: the title (`page.home.cards.<id>.title`), a one-line summary (`page.home.cards.<id>.summary`) and the worked example line of the calculator (`calc.<id>.page.example`) as its evidence. Its link points to the route path of the current locale. A calculator with no route has no card. A routed calculator without `page.home.cards.<id>.{title,summary}` in both locales MUST fail the build at the type level, and adding a routed calculator MUST need no edit of the home view.

The methodology and about links stay on the home, in the current locale, after the directory. The pages MUST NOT contain a list of upcoming calculators, "coming soon" / "próximamente" / "pronto" wording, names of calculators that are not routed, usage numbers, testimonials or ratings.

The home MUST ship no client JavaScript (`site-shell` [SS18]), its HTML MUST stay within the byte budget of `site-quality` [SQ7] with the headroom of [TP35], and it MUST pass axe with 0 violations in both locales ([SQ1]). Card copy in Spanish uses the neutral tú register.
(Previously: one H1, a short introduction and links to methodology, about and the single published calculator; the link list was not a directory and the pages "list no other calculator".)

#### Scenario: [TP7] Home links
- GIVEN built `/` and `/es`
- WHEN `main a[href]` is collected
- THEN `/methodology` and `/about` (EN) and `/es/metodologia` and `/es/sobre-nosotros` (ES) are present

#### Scenario: [TP8] No empty promises
- GIVEN built `/` and `/es`
- WHEN the text is searched case-insensitively for `coming soon`, `próximamente`, `pronto`, `trusted by`, `miles de`, `stars`, `estrellas`
- THEN there is no match

#### Scenario: [TP21] Home lists exactly the routed calculators
- GIVEN built `/` and `/es`, and `CALCULATOR_PAGES` with the route table (today `concrete` only)
- WHEN the card links of `main` are collected
- THEN the set of card link targets equals the route paths of `CALCULATOR_PAGES` in the current locale (`/concrete-calculator` EN, `/es/calculadora-de-concreto` ES), each with link text taken from the catalog, and no other calculator link exists (contract test over the built HTML)

#### Scenario: [TP28] One card per calculator with catalog copy
- GIVEN built `/` and `/es`
- WHEN each card is read
- THEN it holds, in this order, the `page.home.cards.<id>.title` text, the `page.home.cards.<id>.summary` text and the `calc.<id>.page.example` text of that locale, exactly one link per card, and the cards sit in a list (`ul`) whose item count equals the number of ids of `CALCULATOR_PAGES` (unit test on the rendered view, repeated on the built HTML)

#### Scenario: [TP29] Hero band
- GIVEN built `/` and `/es`
- WHEN the hero is read
- THEN there is one `h1` inside `main` whose text equals `page.home.heading`, followed by the text of `site.tagline`, both from the catalog of the locale, and the hero holds no link and no other heading (unit test on the rendered view)

#### Scenario: [TP30] Order follows the route table
- GIVEN a fixture route table with two routed calculators (a unit test over the view with injected `CALCULATOR_PAGES` and `ROUTES`, with catalog keys for both)
- WHEN the directory is rendered
- THEN the cards appear in `ROUTES` order, not alphabetical order, and each link is the route path of the current locale (`/es/...` paths for `es`)

#### Scenario: [TP31] A calculator with no route has no card
- GIVEN the live build in which `rectangle-area` is in `PAGELESS` and `concrete` in `CALCULATOR_PAGES`
- WHEN built `/` and `/es` are searched for the id, the English or the Spanish name of every pageless calculator (`rectangle`, `rectángulo`, `square footage`, `pies cuadrados`)
- THEN there is no match

#### Scenario: [TP32] A routed id without card keys fails the build
- GIVEN a type-level fixture (a `.test-d.ts` check) in which an id is in `CALCULATOR_PAGES` and `page.home.cards.<id>` is missing from the English catalog, and separately only from the Spanish one
- WHEN `npm run typecheck` runs
- THEN it fails naming the missing key, and removing the fixture makes it pass

#### Scenario: [TP33] Methodology and about links come after the directory
- GIVEN built `/` and `/es`
- WHEN `main a[href]` is read in document order
- THEN every card link precedes the methodology link, which precedes the about link ([TP7] still holds)

#### Scenario: [TP34] No JavaScript on the home, directory included
- GIVEN built `/` and `/es`
- WHEN parsed, and then loaded in Chromium with request logging
- THEN the only `script` elements are `application/ld+json`, no `on*=` attribute exists, and no request has type `script` (`site-shell` [SS18], [SS19]; `site-quality` [SQ8], [SQ28])

#### Scenario: [TP35] Home HTML budget with recorded headroom
- GIVEN a clean `npm run build`
- WHEN `npm run check:site` measures `dist/index.html` and `dist/es/index.html`
- THEN each is at most 24,576 bytes (a headroom of at least 16,384 bytes under the 40,960 limit of [SQ7]), the home CSS (inline plus linked) is within 20,480 bytes ([SQ6]), and both measured sizes are recorded in the apply progress (a recorded measurement; the 24,576 ceiling is a stated bound for this change, not a new global budget)

#### Scenario: [TP36] Home passes axe and keeps contrast
- GIVEN the built site served locally and a phone-profile Chromium
- WHEN axe runs on `/` and `/es` with the tags of `site-quality`
- THEN each reports 0 violations (the hero text over the Blueprint ground, the card summary and the evidence line pass `color-contrast`), and Lighthouse on `/` and `/es` keeps accessibility, SEO and best practices at 0.95 or higher and layout shift at 0.01 or lower ([SQ9])

#### Scenario: [TP37] Cards are usable on a phone and do not overflow
- GIVEN Chromium at 320, 390 and 1280 px wide on `/` and `/es`
- WHEN the document width and the card link boxes are measured
- THEN `document.documentElement.scrollWidth <= window.innerWidth` at every width, and each card link has a hit area of at least 44 by 44 CSS px (an e2e test at three widths)
