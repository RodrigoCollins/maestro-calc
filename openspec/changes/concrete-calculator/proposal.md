# Proposal: Concrete Calculator — First Live Calculator (EN/ES)

Implements PLAN.md §4.1 #1 (concrete: slab, footing, column, steps, bags 40/60/80 lb), §4.2 (MVP functions, partially), §4.3 (instant result, mobile-first, neutral tú), §5.1–5.3 (page anatomy, sources, review date, methodology), §6.4/§7.1–7.4 (slugs, on-page and technical SEO), §8.1 (no ad slots yet, CLS 0). Closes web-shell follow-ups RES-3 and RES-4.

## Intent

maestrocalc.com has a finished shell and trust pages but no calculator. Concrete is the top-volume MVP tool (550K EN, 63% Latino trade). It also turns the zero-JS site into an interactive one, so the client-script, CSP, budget and browser-test rules get set here, once, for the 100+ calculators that follow.

## Scope

### In
- Core: `concrete` calculator (shapes slab, footing, column, steps; waste %; bag size; bag and ready-mix prices; volume in yd³/ft³/m³; bag shopping line; costs); shared rational π + circle area.
- Data: first shipped material `concrete-mix` (40/60/80 lb bag yields, cited source).
- i18n: `concrete` catalogs EN/ES, material keys.
- Web: `/concrete-calculator` and `/es/calculadora-de-concreto`; server-rendered form + default result; small same-origin module script for live results, URL state (codec), unit-system toggle, language switch carrying the query, "Copy link".
- Content: page copy per §5.1 (how-to, formula + worked example, tips, FAQ, sources + review date), methodology section for concrete, home link.
- Gates: CSP, per-template JS rule and budget in `check:site`, JSON-LD checks, e2e interaction + no-JS, axe, Lighthouse per template, end-state pin.

### Out (follow-up changes)
WhatsApp share, print, PWA/offline, embed, live drawing (Blueprint dimension lines), ready-mix order increments, IRC warnings, hubs (`/concrete`), guides, related calculators, analytics events, ads, rectangular columns, slab with thickened edges.

## Capabilities

### New
- `calc-concrete`: inputs, URL keys, defaults, formulas with sources and hand-verified cases, shopping and cost outputs.
- `core-geometry`: documented rational π approximation and `circleArea`, reusable by later calculators.
- `calculator-page`: page template, progressive enhancement, client behaviour (live result, URL read/write, errors, unit toggle, copy link), content collection with sources/review date, calculator JSON-LD.

### Modified
- `material-data-contract`: ships the first material records (drops "no shipped materials").
- `i18n-catalog`: `material.<id>.*` keys and calculator-page UI keys.
- `site-shell`: [SS18]/[SS19] zero JS becomes per template (calculator pages allow one same-origin module).
- `site-quality`: [SQ8] JS budget per template, CSP `script-src 'self'`, calculator e2e, Lighthouse URLs per template.
- `site-seo`: calculator titles/descriptions, WebApplication + BreadcrumbList + FAQPage; forbidden Product/Review/AggregateRating; `check:site` scope.
- `site-routing-i18n`: calculator pages in `ROUTES`; switch keeps the query string.
- `trust-pages`: methodology lists concrete formulas, yields, sources, π disclosure, published test cases; home links the calculator.

## Approach

Core stays pure: `createConcrete(bags)` returns a `defineCalculator` definition; yields are injected from `@maestro-calc/data` by the web composition root (core cannot import data). The page is static HTML rendered at build with the default state (so no-JS readers and crawlers see a real answer); one bundled module (`apps/web/src/client/`) reads `location.search` with `decode`, recomputes on every `input`, writes `history.replaceState(encode(...))`, and fills server-rendered message templates, so one bundle serves both locales. The page joins `ROUTES` with a catch-all branch, so sitemap, hreflang, `check:site` and browser URL lists cover it automatically.

## Decisions (autonomous, recorded)

| # | Decision | Rejected | Why |
|---|---|---|---|
| D1 | Progressive enhancement: build-time default result + one same-origin module script; `<noscript>` note | Worker SSR for a GET result path; framework island (Preact) | Static hosting cannot compute a GET; SSR adds runtime cost and a second render path. Vanilla TS keeps bytes low |
| D2 | Global CSP `script-src 'self'` (no inline, no eval); `check:site` allows scripts only on calculator pages | Per-path CSP in `_headers`; nonce/hash | `_headers` caps at 100 rules and slugs are flat, so per-path cannot scale to 100+ calculators × 2 locales; static build has no nonce |
| D3 | JS budget ≤ 49,152 B raw per calculator page; 0 elsewhere; calculator page-weight ceiling set in design from a measurement (≤ 196,608 B) | One global JS number | Keeps static pages at zero; bounds the island |
| D4 | One calculator `concrete` with a `shape` select; per-shape fields where meaning differs; footing/column have a piece count | One calculator per shape; one page per shape | §4.1 one page; one URL contract; shared waste/bag/price |
| D5 | Formulas: slab and footing L×W×T(×n); column π(d/2)²h×n; steps W×run×rise×N(N+1)/2; waste applied before bags; bags = ⌈V/yield⌉ | Integer-step approximations | Standard prism/cylinder geometry; steps stacked as full-height blocks |
| D6 | π as a ≥ 30-digit rational in `core-geometry`, disclosed on methodology | 355/113; floats | Exact pipeline stays rational; error far below display rounding and bag ceilings |
| D7 | Yields from `data`, injected (`createConcrete`) | Constants in core | PLAN §6.1 data separation; future brands/regions |
| D8 | Prices default `$0` = "add your price" (cost hidden until > 0); no built-in prices | Seeded prices | Defaults are permanent URL contract; prices rot; no invented numbers |
| D9 | Ready-mix shown as exact yd³ incl. waste; no order rounding | Quarter-yard rounding (mockup) | No citable rule; supplier-specific |
| D10 | Slugs `/concrete-calculator`, `/es/calculadora-de-concreto`; titles "Concrete Calculator: Cubic Yards and Bags \| Maestro Calc" / "Calculadora de Concreto en Yardas y Bolsas \| Maestro Calc" | `hormigón`, `/es/concreto` | §6.4/§7.2; "concreto" is the US Latino term |
| D11 | Calculator page in `ROUTES` + catch-all branch | Explicit `.astro` files per locale (W2 option) | One table drives every derived check; no file/table drift |
| D12 | Long copy in a `calculators` content collection; frontmatter `sources[]` (name, url, retrieved) + `updated`, `ownerReview`; a contract test runs the worked example through core | Copy in catalogs | Prose stays editable; numbers in copy cannot drift from code |
| D13 | Lighthouse: one URL per template per locale (home, methodology, calculator); 6 runs | Add 2 more runs | RES-3; Actions minutes |
| D14 | Mutation: keep one `calculators` shard; measure mutants; split per AGENTS.md if > ~400 | Pre-split | Rule already defined; split only on evidence |

Defaults from the approved mockup: slab 12 ft × 10 ft × 4 in, waste 10%, bag 80 lb. They become permanent on merge to `main` (URL rule 3).

## Affected Areas

| Area | Impact |
|---|---|
| `packages/core/src/{geometry,calculators/concrete}/`, `__testing__/released-snapshot.ts`, `calculators/released.contract.test.ts` | New/Modified |
| `packages/data/src/materials/concrete-mix.ts`, `index.ts` | New/Modified |
| `packages/i18n/src/catalogs/{en,es}/concrete.ts` (+ `site.ts` keys) | New/Modified |
| `apps/web/src/{routing,views,client,content/calculators,seo,site-check,lib,contract}`, `pages/[...path].astro`, `public/_headers` | New/Modified |
| `tooling/site-browser/{e2e,lighthouserc.json}`, `AGENTS.md` | Modified |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Bag yields wrong or unsourced | Med | Fetch datasheet at spec; owner confirms (OA1) before data slice merges |
| Defaults/URL keys frozen by mistake | Med | Owner review of tuples before group 1 merges (OA2) |
| Astro inlines a small script (blocked by CSP) | Med | `check:site` rejects inline scripts; design pins an external bundle |
| Bundle exceeds 48 KiB (bigint rational, parser, codec) | Med | Measure in the island slice; subpath imports, PURE annotations |
| Spec deltas target web-shell specs not yet promoted | High | Archive web-shell before `sdd-spec` of this change |
| Deferred live drawing weakens the Blueprint signature | Low | Follow-up change; result panel keeps tokens |

## Rollback Plan

Unpublish by removing the `ROUTES` entry and its catch-all branch (one revert); core calculator, `RELEASED` tuples and data stay (the released contract forbids removing a merged calculator). CSP/`check:site` changes revert alone. Workers redeploys the previous `dist` on push.

## Slice Forecast (≤ 400 changed lines each, lockfiles excluded)

| Group (PR) | Slice | Forecast |
|---|---|---|
| G1 engine | S1 `core-geometry` (π, circle area) | ~150 |
| | S2 `concrete` definition, slab/footing, unit + shape tests, `RELEASED`, `REGISTRY` | ~380 |
| | S3 column/steps, property + URL tests | ~330 |
| | S4 `concrete-mix` data + i18n catalogs + type contract | ~320 |
| G2 page | S5 `ROUTES` entry, catch-all branch, `CalculatorView` (form, default result), page keys, end-state pin | ~390 |
| | S6 client island (controller, URL, switch, copy link, errors) | ~400 |
| | S7 CSP, `check:site` template rules (scripts, JS budget, JSON-LD types), inline-script guard | ~300 |
| G3 content + quality | S8 content collection, EN copy, sources block, JSON-LD | ~380 |
| | S9 ES copy, methodology + home updates | ~350 |
| | S10 e2e interaction + no-JS, axe, Lighthouse URLs, mutation measurement | ~300 |

Total ~3,300. Decision needed before apply: No. Chained PRs recommended: Yes (3 PR groups). 400-line budget risk: Medium (S2, S5, S6 near the cap; split if over).

## Owner Actions

- OA1: confirm bag yields and source (expected QUIKRETE Concrete Mix No. 1101: 40 lb ≈ 0.30 ft³, 60 lb ≈ 0.45 ft³, 80 lb ≈ 0.60 ft³; values to be re-fetched and dated at spec).
- OA2: approve defaults and URL keys before G1 merges (permanent).
- OA3: confirm the 10% waste default and its cited explanation.
- OA4: review EN/ES copy (`ownerReview`, §5.2).

## Success Criteria

- [ ] Both pages live; typing updates the result with no button; reload and shared links restore state; switch keeps the query.
- [ ] No-JS shows the default result and a note; every result matches a hand-verified case (e.g. 12 × 10 ft × 4 in = 40 ft³ = 1.48 yd³; +10% = 44 ft³ → 74 bags of 80 lb at 0.60 ft³).
- [ ] `npm run verify`, `check:site`, e2e, axe and Lighthouse green; static pages still ship 0 JS; calculator JS ≤ budget.
- [ ] Every yield and formula cites a source with a review date on the page and in methodology.

## Proposal question round

Not asked: the owner authorized autonomous decisions. Assumptions for owner review: D4 single page, D8 zero-price defaults, D9 no truck rounding, deferred live drawing and WhatsApp, OA1–OA3.
