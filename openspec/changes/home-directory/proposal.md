# Proposal: Home Directory — the Home as a Calculator Directory with the Blueprint Identity

Implements PLAN.md §4.3 (mobile first, load under 1 s), §7.3 (internal links from the home to every calculator) and `docs/design/direction.md` (Blueprint). It also fixes the known desktop answer-gap defect left by `concrete-calculator`. Source map: `explore.md` (sections 1, 2, 4, 6). This is the first of two changes; `square-footage` (the go-live of `rectangle-area`) follows it.

## Intent

The live home is a placeholder: one H1, a tagline paragraph with the concrete link, and a methodology/about line (`HomeView.astro`, 45 lines). It reads as "just a simple html" and shows no product progress. It also cannot scale: the concrete link is hand-written, and `HomeView.test.ts` pins "no other calculator, two paragraphs, no list". This change does three things:
- It turns the home into a directory generated from `CALCULATOR_PAGES` and `ROUTES`, so every later calculator gets a card through catalog keys alone.
- It puts the Blueprint identity in one place, a hero band.
- It removes the empty reserved space under the answer on desktop.

## Scope

### In
- Home directory: one card per id of `CALCULATOR_PAGES`, in `ROUTES` order. Each card links to the route path of the current locale. Its copy comes from `page.home.cards.<id>.{title,summary}` in `packages/i18n/src/catalogs/{en,es}/site.ts`, and its evidence line is the existing `calc.<id>.page.example`. No JavaScript.
- Hero band on Blueprint ink: a 16 px grid in pure CSS and one orange dimension-line motif (end ticks drawn with borders or pseudo-elements, no SVG per id). The H1 is set in `--text-display`.
- Tokens in `apps/web/src/styles/tokens.css`: `--text-display` (fluid `clamp`), `--grid-size`, and the tick primitives. Each one is pinned in `styles.contract.test.ts`, which also gets its stale "1.42 line height" comment corrected. Corners stay square, with no radius token.
- A rewrite of `HomeView.test.ts`, plus a test that the directory equals `CALCULATOR_PAGES` in `ROUTES` order.
- Answer-gap fix: the reservations for `.calc-answer`, `.calc-notice` and `.calc-copy` become CSS-only and set per rem breakpoint, through line-count custom properties. The proof is `layout.spec.ts` at 320, 390, 480, 640, 768, 1024 and 1280 px, in both directions: the content fits, and the unused reserve is less than one line.

### Out (non-goals)
- The whole Square footage go-live: content, methodology section, `ROUTES` row and slugs (`/square-footage-calculator`, `/es/calculadora-de-pies-cuadrados`, route id `rectangle-area`), `SCRIPTS`/`PAGES` rows, entry and island, the e2e record row, the pinned counts and its card keys. This change only makes a second card need no code edit.
- Any `packages/core` or `packages/data` change. In `packages/i18n`, only the new `site.ts` keys.
- Raising any budget: HTML 40,960 B per page, CSS 20,480 B, home JavaScript 0, four woff2.
- The share button (the WhatsApp tokens stay unused). The live-blueprint result panel, a later use of the same motif.
- Trade hubs and grouping (PLAN.md §7.1). ItemList JSON-LD (see D7).

## Decisions

| # | Decision | Rejected | Why |
|---|---|---|---|
| D1 | Approach A: the cards come from `CALCULATOR_PAGES` + `ROUTES` + per-id keys in `site.ts` | B: `card` frontmatter on the calculator content; C: A plus a `HOME_GROUPS` table | Card copy is short catalog copy, and the EN/ES key-parity contract already checks it. B couples the home to the long-form review state and to the strict content schema that `square-footage` must change anyway. C is premature with two cards; the PLAN §7.1 hubs will do the grouping. |
| D2 | New keys `page.home.cards.<id>.{title,summary}`, typed over `CalculatorPageId`, so a routed id without keys is a type error | Reuse `page.<id>.title` | `page.<id>.title` is an SEO title with the site suffix ("… \| Maestro Calc") and does not work as a card label. |
| D3 | Identity spent once: a hero band with the 16 px grid and the orange tick. Cards stay quiet: Sheet white on Plan paper, the title in Barlow Condensed and the worked example as evidence. No arrow glyphs, all-caps eyebrows or radii. | Spread the motif over the cards, header and footer; adopt the mockup radii | Owner decision. Everything else stays quiet. The equal-card grid differs from the SaaS default by its content (a real worked example), not by decoration. |
| D4 | Home CSS is scoped in `HomeView.astro`. Only the tokens go in the global `tokens.css`. | A fourth sheet `styles/home.css` | Scoped CSS ships on the home only, so the calculator pages (ES concrete: 124 B of HTML headroom) do not pay for it. A fourth sheet means editing the three-sheet list in `styles.contract.test.ts` and risks reaching every page. |
| D5 | Gap fix: CSS-only `min-height: calc(var(--answer-lines) * var(--text-h3) * var(--leading-body))`, with line counts per rem breakpoint, measured at seven widths in both directions | (a) client JS measures the sentence; (b) stacked hidden ghost sentences | (a) shifts layout after load (CLS gate 0.01), fails with JS off and adds bytes to the entry. (b) is exact but costs about 600–700 B of HTML per ghost, against 124 B of headroom. |
| D6 | The gap fix belongs in this change (H2), not in the go-live | Fix it in `square-footage` | It is a defect on the live concrete page today, independent of Square footage. It touches the same styles contract as the H1 tokens. The go-live slice S3 is already 400–490 lines. The line counts stay custom properties, so a later calculator with an answer slot can override them per page. |
| D7 | No ItemList JSON-LD | Add it to `homeJsonLd` | With one or two cards it gives no rich result. It would change `site-seo` (whose scenario pins `Organization` + `WebSite` exactly) and add bytes in both locales. Revisit with the hubs. |
| D8 | Budgets unchanged; growth is paid by trimming (for example, the new reservation rule replaces the three fixed `min-height` rules instead of adding to them) | Raise HTML or CSS | Owner decision. |

## Capabilities

### New
None.

### Modified
- `trust-pages`: the "Home page" requirement. The calculator link list becomes "one card per routed calculator, in `ROUTES` order, with catalog copy". [TP21] is generalised from "lists no other calculator" to "lists exactly `CALCULATOR_PAGES`". [TP7] and [TP8] are kept.
- `site-shell`: "Blueprint design tokens" gains `--text-display`, the grid and tick primitives, and square corners (no radius).
- `calculator-page`: "Layout stability". The answer, notice and copy reservations are sized per breakpoint (not only at phone width). New scenarios cover the wide widths: no gap of a full line or more, and CLS ≤ 0.01.
- `site-quality`: None (budgets, the Lighthouse list and the smoke test are unchanged).
- `site-seo`: None (D7).

## Approach

H1 adds and pins the tokens first (red contract tests). H2 replaces the fixed reservations, with `layout.spec.ts` widened first and run red against today's 10.75rem reserve on desktop. H3 rewrites `HomeView.test.ts` to the directory contract, then builds the view and the keys. Every size is measured on the real build (`npm run build && npm run check:site`) and recorded in apply progress, replacing the exploration's estimates.

## Affected Areas

| Area | Impact |
|---|---|
| `apps/web/src/styles/{tokens,calculator}.css`, `styles.contract.test.ts` | Tokens; per-breakpoint reservations |
| `apps/web/src/views/HomeView.astro`, `HomeView.test.ts` | Directory, hero band, scoped CSS |
| `packages/i18n/src/catalogs/{en,es}/site.ts` | `page.home.cards.concrete.*`; intro keys adjusted |
| `tooling/site-browser/e2e/layout.spec.ts` | Seven widths, lower bound |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| ES concrete has 124 B of HTML headroom. Any shared CSS growth (tokens, reservations) costs it first. Astro inlines a CSS chunk under 4,096 B, so a size change can move a chunk between inline and linked. | High | D4 keeps the home CSS scoped. D8 makes the reservation net-zero or negative. `CalculatorBody.budget.test.ts` and `check:site` run after H1 and after H2. |
| The `HomeView.test.ts` rewrite drops a guard (no promises, tagline, links) | Med | Port each current assertion explicitly or record why it goes. [TP8] stays in `check:site`. |
| Hand-set line counts drift and a gap or overflow comes back at an untested width | Med | Both-direction assertions at seven widths on the real build |
| Fallback-font metrics change a wrap before the woff2 loads | Low | Metric-adjusted fallback already ships. The e2e runs on the built fonts, and the CLS gate covers the swap. |

## Rollback Plan

Each PR reverts as one merge commit. Nothing changes in URLs, data or core, so a revert restores the placeholder home or the fixed reservations without any contract fallout.

## Review Workload Forecast (authored lines, `git diff --shortstat`)

| PR | Slices | Forecast |
|---|---|---|
| PR 1 | H1 tokens and primitives (~150–200) + H2 reservations and layout widths (~110–140) | ~260–340 |
| PR 2 | H3 directory: view, EN/ES keys, test rewrite | ~280–340 |

- Decision needed before apply: No
- Chained PRs recommended: Yes
- 400-line budget risk: Medium (PR 1 reaches about 340 at the top of the range; if H1 grows, H2 moves to its own PR)

## Success Criteria

- [ ] `/` and `/es` render one card per id of `CALCULATOR_PAGES`, in `ROUTES` order (a test asserts that equality), with zero JavaScript.
- [ ] Adding a routed id needs only its `page.home.cards.<id>.*` keys (a missing key is a type error). `HomeView.astro` is not edited.
- [ ] `check:site` passes: home HTML ≤ 40,960 B, CSS ≤ 20,480 B, ES concrete HTML still ≤ 40,960 B. Measured sizes are recorded.
- [ ] `layout.spec.ts` at seven widths: answer, notice and copy fit their reserve, and the unused reserve is under one line. CLS ≤ 0.01.
- [ ] axe reports 0 violations on the home in both locales. Lighthouse accessibility, SEO and best practices ≥ 0.95 and CLS ≤ 0.01 on the six pages. `npm run verify` and `test:e2e` are green after each PR.

## Proposal question round

Not asked (auto mode). Assumptions the owner should confirm:
1. Card content: title, a one-line summary, and the worked example line (`calc.<id>.page.example`). No icon or image.
2. Hero copy: the H1 states what the site does, with the PLAN §3 tagline (`site.tagline`) as the supporting line. No new claim, number or promise.
3. The methodology and about links stay on the home, below the directory ([TP7] unchanged).
4. Card order follows `ROUTES` (concrete first), not popularity or alphabet.
