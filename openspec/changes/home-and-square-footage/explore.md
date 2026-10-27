# Explore: home-and-square-footage

Artifact store: openspec. Base: `main` @ 15e4eeb. Read-only investigation (2026-10-27). Sizes marked "estimate" were not measured: the exploring agent could not run a build; replace them by measurement in the proposal.

## 0. Summary

- Build the home as a calculator directory generated from `CALCULATOR_PAGES`, with per-id card copy in the site catalogs. It needs no JavaScript and fits the budgets with a wide margin.
- Fix the desktop answer gap with CSS-only reservations per breakpoint, proven by e2e at more widths in both directions (no gap, no shift).
- Square footage is `rectangle-area` with a new route and slug. It needs more than content. The `workedExample` schema is concrete-shaped, and several contract tests are hard-wired to concrete.
- Recommend two OpenSpec changes, or one change in two PR groups (home first). Owner content review is the only external gate, and it should not block the home.
- Limits of this exploration: the sizes marked "estimate" were not measured. The `dist` read is the stale one in the main checkout (`apps/web/dist/index.html`).

## 1. Current state

### Home
- `apps/web/src/views/HomeView.astro` (45 lines) renders an h1, one paragraph with the intro and the concrete link, and one `.home-links` paragraph (methodology, about).
- No JS, no list, no hero. Catalog keys: `page.home.{heading,intro,links.*,title,description}` in `packages/i18n/src/catalogs/{en,es}/site.ts`.
- `HomeView.test.ts` pins this shape:
  - exactly 2 `<p>` and no `ul/ol`;
  - the first link is concrete, inside the intro paragraph;
  - `rectangle` and `rectángulo` must be absent;
  - the intro text equals `intro + links.concrete`.
- A directory home rewrites most of that test.
- `homeJsonLd` is Organization + WebSite only (`apps/web/src/seo/json-ld.ts`).

### Layout and styles
- `layouts/BaseLayout.astro` imports `styles/tokens.css` and `styles/base.css`. `main` is `max-width: 64rem` with a 1rem gutter.
- `components/calculator/CalculatorBody.astro` imports `styles/calculator.css`.
- Astro inlines all CSS into every page. The stale `dist/index.html` carries the `.calc-*` rules on the home too (about 5 KB of calculator CSS paid by a page that does not use it).
- Source sizes (estimate): tokens, base and calculator together are about 8 KB. `styles.contract.test.ts` caps the three sources at 20,480 B, so about 12 KB of headroom remains, shared by every page.
- Estimated home HTML is about 13 KB of 40,960 B (head, inlined CSS, font-face blocks, a small body). Roughly 27 KB of HTML headroom.

### Blueprint tokens: defined versus used

| Item | Direction doc (`docs/design/direction.md`) | Shipped |
|---|---|---|
| Ink, Chalk line, Orange, Form gray, Plan paper, Sheet white, Error red | defined | all defined; ink, ground, surface, link and error widely used |
| Safety orange | "what to buy, dimension ticks, focus ring" | used only for the focus ring (`base.css:58`) and `.calc-qty` (`calculator.css:204`); no dimension ticks |
| WhatsApp green and its text colour | share button | defined in `tokens.css:11-12`, used nowhere (no share button yet) |
| Type | Barlow Condensed 600-700 (numbers, headings) and Barlow 400-600 (body) | four woff2 files loaded; one scale: 15/17/22/28/36 px (`--text-small` through `--text-h1`) |
| Signature | "result panel is a live blueprint with real dimension lines" | `.calc-result` is a flat ink block |

Gaps between the approved mockup (`docs/design/mockups/Main.dc.html`) and the shipped code:
- The mockup has a 16 px blueprint grid on the panel (`.bp`, line 19).
- It has orange SVG dimension ticks (lines 100 and 105).
- It has radii of 16, 12 and 9 px.
- It has an `#D5DBD8` hairline border.
- Shipped is square corners, 2 px ink borders and no motif. `direction.md` is silent on radius and grid, so these are design decisions to confirm, not a regression.
- No fluid display size exists, and there is no scale step above 36 px for a home headline.
- `styles.contract.test.ts:256` comments a "1.42 line height", but the base is 1.55 (stale comment).

### Calculator page
- `CalculatorView.astro` joins `getEntry('calculators', locale/id)`, `pageView(id, locale)` and the `SCRIPTS` island. It is generic over `CalculatorPageId`.
- `CALCULATOR_PAGES = ['concrete']`, `PAGELESS = ['rectangle-area']` (`routing/templates.ts`). `PAGES` is in `lib/pages.ts`.
- G3 (browser record and docs) is not on this base. `tooling/site-browser/e2e/calculator-pages.ts` and the proof entry `__testing__/rectangle-area-entry.ts` do not exist here yet. Go-live must be sequenced after G3 merges.

## 2. The home as a calculator directory

### Approaches

| | A. Table-driven cards (recommended) | B. Content-collection-driven | C. A with categories |
|---|---|---|---|
| Source of cards | `CALCULATOR_PAGES` + `ROUTES` + per-id keys `page.home.cards.<id>.{title,summary}` in `site.ts`. Example line reuses the existing `calc.<id>.page.example`. | New `card` frontmatter on `content/calculators/{en,es}/<id>.md`; `getCollection` on the home | A plus a `HOME_GROUPS` table |
| Touches | `HomeView.astro`, `site.ts` EN/ES, `HomeView.test.ts`, `styles/` | the above plus `content/schema.ts` (strict), `schema.test.ts`, `content.config.test.ts`, the calculator-content contract | A plus the group table |
| HTML cost (estimate) | about 350 B per card; 2 cards plus grid about 1 KB EN | same; the home renders every entry's body at build (slower) | A plus about 150 B per group |
| CSS cost (estimate) | 1.5-2.5 KB for the grid, cards, display h1 and blueprint band | same | same |
| Scales | Linear. 12 cards is about 4 KB HTML, fine. Beyond about 20 needs grouping (C). | same | best beyond about 8 |
| Risks | New calculator needs 2 keys x 2 locales plus the list (type-checked: a `Record<CalculatorPageId, …>` row, or a derived key literal) | Couples home copy to long-form review state. A strict-schema change touches the `workedExample` contract anyway. | Premature now |
| No-JS / budget | no JS; well inside HTML and CSS | same | same |

Recommendation: A.
- The card copy is short and belongs with the catalogs, where the EN/ES key-parity contract already checks it.
- `page.<id>.title` already exists but is an SEO title with a site suffix ("Concrete Calculator: Cubic Yards and Bags | Maestro Calc"). It is unsuitable as a card label, hence the new keys.
- A grid of equal cards is the SaaS-card default. Make the card differ by content: the title in Barlow Condensed and the one worked example line as evidence, in plain text with no arrow glyphs and no all-caps eyebrow.

### Identity work (where it lives)
- Spend the boldness in one place: a home hero band on the Blueprint ink ground.
  - A 16 px grid as pure CSS (`background-image: linear-gradient`, about 250 B).
  - One dimension-line motif: orange end ticks drawn with CSS borders or pseudo-elements, no per-id SVG.
  - It is the same motif the calculator result panel should adopt later, so the signature is shared.
- Keep the cards quiet: Sheet white on Plan paper, Form gray summary text, one orange tick as a link affordance.
- Tokens in `apps/web/src/styles/tokens.css`:
  - add `--text-display` as a fluid clamp (about 2.5 to 4 rem) for the home h1 only;
  - add `--grid-size`, `--measure-card` and a radius decision (square, as shipped, versus the mockup's 12 px);
  - pin each in `styles.contract.test.ts`, as the existing tokens are.
- Component CSS stays in `HomeView.astro` (scoped) or a new `styles/home.css`. Today the only global sheets are the three `.css` files, and a contract test (`styles.contract.test.ts`) lists exactly `base`, `calculator` and `tokens`, so a fourth sheet means editing that list.
- Fonts: the preloads are body 400 and display 700. No new weights are needed; the font budget (30,720 B each, 92,160 B total) is untouched.
- Spanish copy stays in the neutral tú register. Run it through `contract/register.ts`.
- Tests to rewrite: `HomeView.test.ts` (paragraph count, `ul` ban, 'rectangle' absent, intro equality). Add a test that the directory equals `CALCULATOR_PAGES` in `ROUTES` order.
- No-JS risk: none (the home stays zero-script). The `check:site` rule "no JavaScript on the home" is untouched because the hero is CSS only.

## 3. Square footage going live

### What `rectangle-area` already has
- Core: `packages/core/src/calculators/rectangle-area/` with 4 tests; `RELEASED` and `REGISTRY` rows; URL keys `l` and `w` frozen.
- Catalogs: `packages/i18n/src/catalogs/{en,es}/rectangle-area.ts`. The title is "Rectangle Area" / "Área de un rectángulo".
- Web: `apps/web/src/lib/calculators.ts` includes it; `apps/web/src/calculator/rectangle-area/page.ts` is `definePage({ calculator })` with no slots; `controller.test.ts` proves it headless.
- Defaults: 10 x 10 ft gives 100.00 ft², 11.11 yd², 9.29 m². `?v=1&l=150` gives 125.00 / 13.89 / 11.61.
- Note: with no `primary`, the large figure is `areaFt2` in metric too, and with no `page.areaFt2` sentence key it shows a bare number with no unit.

### Missing, in recipe order (AGENTS.md steps 11-14)
1. Page module: `primary: { imperial: 'areaFt2', metric: 'areaM2' }`. Optional `answerSlot` (see Q3). Catalog `calc.rectangle-area.page.areaFt2` and `areaM2` sentences ("{value} square feet", "{value} square meters"), plus `page.example`. Retitle `calc.rectangle-area.title` to "Square Footage Calculator" (and the Spanish equivalent).
2. Content: `content/calculators/{en,es}/rectangle-area.md` with the five sections in order (`how-to-use, formulas, tips, faq, sources` / `como-usar, formulas, consejos, preguntas-frecuentes, fuentes`), 800-1,500 words, exactly 8 plain-text FAQ items of at most 450 characters, at least one source (NIST SP 811 Appendix B), `ownerReview`, and a link to the methodology anchor. Spanish must pass `registerProblems`.
3. Schema blocker: `calculatorSchema.workedExample` in `content/schema.ts` is `{ netFt3, totalFt3, yd3, bags, bagLb }`, which is concrete-shaped. Square footage has no bags. Options: per-id schema, or a generic record of display strings. Both touch `schema.test.ts`, `content.config.test.ts` and `contract/calculator-content.contract.test.ts` (which also pins the entry list to `['en/concrete.md','es/concrete.md']` and reads concrete's engine). The contract test must become per-id.
4. Worked example (hand-checkable): 12 ft x 10 ft = 120.00 ft², 13.33 yd² (120/9), 11.15 m² (120 x 0.09290304 = 11.1483648).
5. Methodology rows: a section in `content/pages/{en,es}/methodology.md` (anchor ids e.g. `square-footage` / `pies-cuadrados`), the formula, the exact conversion constants and a table of hand-verified cases. Candidates: default 10x10 (100.00 / 11.11 / 9.29), 12 ft 6 in x 10 ft (125.00 / 13.89 / 11.61), 20 x 15 ft (300.00 / 33.33 / 27.87). A contract test equivalent to `methodology-concrete.contract.test.ts` (concrete-only) is needed. The intro sentence ("the calculator we publish today, the concrete calculator", line 10) must be reworded in both locales, and the 'names no calculator other than concrete' test needs updating.
6. Go-live (one merge):
   - `ROUTES['rectangle-area']` with slugs (e.g. `/square-footage-calculator`, `/es/calculadora-de-pies-cuadrados`);
   - `page.rectangle-area.{title,description}` in both site catalogs;
   - move the id from `PAGELESS` to `CALCULATOR_PAGES`, so `PAGELESS` becomes `[]`;
   - rows in `SCRIPTS` (`views/CalculatorView.astro`) and `PAGES` (`lib/pages.ts`);
   - `client/entries/rectangle-area.ts` and `islands/RectangleAreaScript.astro`;
   - the home card keys.
7. Tests that name `rectangle-area` as pageless and must change: `routing/templates.test.ts`, `contract/templates.contract.test.ts`, `contract/end-state.contract.test.ts`, `components/calculator/CalculatorBody.test.ts` (check which assertions assume pageless). The G3 "no rectangle-area in dist" check and proof entry flip.
8. Pinned counts (`end-state.contract.test.ts`): ids 7 to 8; routable paths 14 to 16; pages with 404s 16 to 18; `page.*.title|description` keys 16 to 20; calculator entries 2 to 4; sitemap URLs 14 to 16; `CALCULATOR_PAGES` and `PAGELESS` expectations.
9. E2E: G3 adds `e2e/calculator-pages.ts` as `Record<CalculatorPageId, …>`, so a new id is a type error until a row exists. Add an `E2eSpec` (strings, hand-verified states from step 5, no shape fields). `CONCRETE_PAGES` is retired by G3.

### Owner review
- Draft with `ownerReview: pending`. `check:site` only prints the pending count (`apps/web/scripts/check-site.ts:113`); it does not fail on it.
- The review state must never reach the reader (`OWNER_REVIEW_MARKERS`).
- The merge commit flips both entries to `approved`.
- Owner checks: US construction terms in Spanish ("pies cuadrados", "yardas cuadradas"), the NIST citation, FAQ accuracy.

### HTML budget for its page
- The proof is `components/calculator/CalculatorBody.budget.test.ts` with fixture `contract/__testing__/budget-page.astro`. The fixture is hard-wired to `pageView('concrete')` and `ConcreteScript`. It builds the whole site (4 builds, 120 s timeouts each).
- Concrete ES has 124 B of headroom at full-length copy.
- A square footage page renders 2 fields instead of about 15 (12 shape-area fields plus waste, bag price and ready-mix price), no choice group, no steppers, no shopping line, no cost rows and no answer templates.
- Estimate: that is about 7-9 KB less markup, so about 31-34 KB at full-length copy and about 7-9 KB of headroom (estimate, to be replaced by measurement).
- The copy is the same full-length fixture, so the new page cannot be longer than concrete's copy allows.
- Parameterise the fixture by id with a second injected route in the same build, rather than doubling the builds, and assert the new page's headroom. Keep the existing seeded "one byte over" test on concrete, the tightest page.
- The owner decided budgets are not raised. Here nothing needs trimming; concrete ES is the one that cannot grow.
- The JS budget is a non-issue: the rectangle-area entry imports only core geometry and the generic mount, well under 49,152 B. Measure it in `client-size.contract.test.ts`.

## 4. The desktop answer gap

- Set in `apps/web/src/styles/calculator.css:22-26`: `.calc-answer { min-height: 10.75rem; }`.
- Why 10.75rem: `apply-progress.md` (archived concrete-calculator) records JD-4. The reserve was first 7.5rem (four lines); the longest shape sentence wraps to five lines at 320 px, so it was raised to 10.75rem (five lines x 1.375rem x 1.55 = 10.66rem, rounded up). The guard is `styles.contract.test.ts:255` (at least 170 px) and `e2e/layout.spec.ts`, which measures only 320 and 390 px.
- The cost on desktop (estimate, not browser-measured): the column is 62rem wide, so the same sentence wraps to about 2 lines (about 4.3rem). The unused reserve is about 6.5rem (about 104 px) between the answer and the form.
- A second, larger gap sits next to it: `.calc-notice { min-height: 9rem }` is reserved on every width and is empty after the script runs unless a link carries a bad `v=`. The `.calc-copy` block (5rem) reserves the same way. Fix all three with the same technique.

| Option | How | Trade-offs |
|---|---|---|
| 1. CSS-only per breakpoint (recommended) | `min-height: calc(var(--answer-lines) * var(--text-h3) * var(--leading-body))`, with line counts set per rem-based breakpoint (e.g. 5 lines under 30rem, 4 to 48rem, 3 to 64rem, 2 above) | About 150-250 B CSS, no JS, no shift. Breakpoints in rem follow user zoom. Line counts are hand-set, so extend `layout.spec.ts` to measure at 320/390/480/640/768/1024/1280 and assert both `height <= reserved` and `reserved - height < one line` (so a gap cannot creep back). Different fallback-font metrics could change a wrap, which is why the test uses the real build. |
| 2. Measure | (a) Client JS measures the longest sentence and sets the height. (b) Stacked ghost sentences in one grid cell (visibility hidden) so the browser sizes the cell to the tallest at any width. | (a) shifts layout after load (the CLS gate is 0.01), fails with JS off, adds bytes to the 49,152 B entry. (b) is exact, but each ghost adds about 600-700 B of HTML, which the 124 B headroom of the ES concrete page cannot absorb, and the owner has ruled out raising budgets. |

- If Square footage gets an answer slot (Q3), the reserve must be per calculator: derive the line counts from the page (as `--calc-rows` is derived), not one global constant. Without an answer slot there is no `.calc-answer` element, so the gap does not exist on that page.

## 5. Open questions for the owner (at most five)

1. Names and slugs: "Square footage calculator" at `/square-footage-calculator` and "Calculadora de pies cuadrados" at `/es/calculadora-de-pies-cuadrados`? The route id stays `rectangle-area`.
2. Home design: are the mockup elements that `direction.md` does not mention (16 px blueprint grid, 12-16 px radii, hairline borders) approved for the home, or do you want to keep the square corners as shipped?
3. Should Square footage get a short answer sentence under the H1 (adds an answer slot and one copy template per locale, and couples to the per-calculator reserve)?
4. One change or two (see section 6)?
5. Review timing: is review of the EN/ES entries on the go-live PR acceptable (draft `pending`, flipped to `approved` in the merge)?

## 6. Slicing and forecast

### One change or two
Recommend two OpenSpec changes, in this order: `home-directory` then `square-footage`.
- Different specs: `trust-pages` (Home), `site-shell` and `calculator-page` (tokens and gap) versus `calc-rectangle-area`, `site-routing-i18n` and `trust-pages` (methodology).
- The go-live has an external gate, the owner review, and a hard rule that a partial go-live is never merged. Coupling it to the home would hold the visible home work behind that review.
- Once the home is generated from `CALCULATOR_PAGES`, Square footage adds its card with catalog keys only.
- If you prefer one change, use two PR groups in the same order.

### Slices (changed lines include tests; estimates)

| PR | Content | Lines |
|---|---|---|
| H1 | Tokens and identity primitives (`--text-display`, grid, tick, radius decision), `styles.contract.test.ts` pins | 150-200 |
| H2 | Answer, notice and copy reservations per breakpoint; extend `layout.spec.ts` widths and add the lower-bound assertion | 110-140 |
| H3 | Home directory: `HomeView.astro`, catalog keys EN/ES, `HomeView.test.ts` rewrite, optional ItemList JSON-LD | 280-340 |
| S1 | Generalise the `workedExample` schema and the calculator-content contract per id; parameterise the budget fixture | about 250 |
| S2 | Content EN/ES (about 70 lines each) plus catalog keys and content tests (pageless, `pending`) | about 280 |
| S3 | Go-live: `ROUTES`, templates, `SCRIPTS`, `PAGES`, entry and island, methodology EN/ES (about 45 lines each) with its contract test, E2E row, pinned counts, home card keys | 400-490 |

- Forecast: home about 550-700 lines (2 PRs under 400, H1+H2 together and H3 alone); Square footage about 930-1,020 (3 PRs).
- S3 is the risk to the 400-line cap. If it overflows, move the methodology contract test and the template-test rewrites into S2. If lockfile or rename noise inflates the count, the standing approval for an `sdd-attempt` ledger reset applies.
- Sequence S3 after G3 merges.

## 7. Risks
- The `workedExample` schema and calculator-content contract are concrete-shaped (section 3, item 3).
- Home tests encode "no other calculator, two paragraphs, no list" and must be rewritten with the design (section 2).
- Only 124 B of HTML headroom on the ES concrete page: any shared markup change in `CalculatorBody` or the layout costs concrete ES first.
- The shared CSS sheet is inlined on every page, so identity CSS counts against all of them.
- Desktop line counts in section 4 are estimates; measure them in the browser before pinning.
- G3 is not merged, so the typed e2e record is not available on this base.

## 8. Ready for proposal
Yes, once the owner answers Q1-Q4 (Q5 can ride on the go-live PR).
