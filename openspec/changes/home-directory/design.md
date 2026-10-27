# Design: Home Directory — the Home as a Calculator Directory with the Blueprint Identity

This design implements `proposal.md` (D1–D8 are binding) and `explore.md` §§1, 2, 4. The delta specs win over any value written here. Sizes marked "est." come from source reading and the existing `apps/web/dist`. This phase had no shell, so the apply measures them before H1 and records them in `apply-progress.md`.

## Answer first

- **Scoped CSS alone does not keep the home CSS off the other pages.** Astro bundles CSS by route file, and every routable page, the home included, is one route: `pages/[...path].astro`. Evidence: the built `es/calculadora-de-concreto.html` carries the home rule `.home-links[data-astro-cid-6voplrxj]{…}` (83 B). **K1 gives the home its own route files** (`pages/index.astro`, `pages/es.astro`), which is a `site-routing-i18n` delta ([SR23]). That makes D4 true: HomeView's scoped CSS ships on the two homes only, and the catch-all's own CSS chunk (2,917 B measured) leaves the home.
- **No CSS chunk may flip to a link.** Astro inlines each chunk only while it is under 4,096 B; today a calculator page carries two chunks (shared 2,568 B, catch-all 2,917 B) merged into one `<style>`. **K2 sets `build.inlineStylesheets: 'always'`**, so every page inlines all of its CSS whatever the chunk sizes; [SQ6] bounds the result and the `.home-` leak assertion is the guard ([SS32], [SS28]).
- **The directory is data.** `lib/home-directory.ts` joins `ROUTES` order, `CALCULATOR_PAGES`, the typed card keys `page.home.cards.<id>.{title,summary}` and `calc.<id>.page.example`. A routed id without its keys is a type error that names the key. After this change, `HomeView.astro` is not edited when a calculator is added.
- **Identity is spent once.** A hero band on ink holds:
  - the 16 px grid, drawn as two CSS gradients;
  - the H1 in `--text-display`;
  - one orange dimension line that measures the H1 (a pseudo-element: a 2 px line and two end ticks, each one grid cell tall).
  
  The cards stay quiet. Corners stay square.
- **Gap fix (D5) and its bytes.** `.calc-answer` reserves `min-height: calc(var(--answer-lines, 5) * var(--text-h3) * var(--leading-body))`, and `.calc-notice` either shares it or, where the sweep shows the shared count fails a bound, gets `--notice-lines` in its own unit (the body line). Three rem breakpoints set the counts on `:root`. Measured on the minified output: the rule with its three media blocks is 242 B and replaces 62 B (+180 B); the `--notice-lines` variant is 371 B (+129 B more). **K9 pays for the base rule**: `scopedStyleStrategy: 'class'` saves 160 B on the Spanish concrete page, and two trims save 35 B, so H2 lands near 40,821 B without `--notice-lines`. With it, the measured trim rungs of K10 (about −190 B) bring it back under the gate: **H2 may not merge above 40,836 B** on the Spanish full-length proof ([CP66]).
- **Slices, in the owner's order (the visible home first, the gap fix last):** H1 (route split, tokens, K2), then H3 (directory) as three slices, H3a (keys and data module), H3b (hero and view skeleton), H3c (cards), about 550–650 lines in total, then H2 (class scoping, reservations, layout e2e, the [CP65] fixture). Grouped as PR 1 = H1 + H3a (+ H3b only if the measured `--shortstat` stays under 400), PR 2 = the rest of H3, PR 3 = H2; H3c becomes a PR of its own if H3b + H3c pass 400, and H2 moves one PR later.

## Architecture decisions (K-rules)

| # | Decision | Rejected | Rationale |
|---|---|---|---|
| K1 | Home routes: `apps/web/src/pages/index.astro` (`<HomeView locale="en" />`) and `apps/web/src/pages/es.astro` (`locale="es"`), the same pattern as `404.astro` / `es/404.astro`. The catch-all filters out `home`: `staticPaths().filter(({ props }) => templateOf(props.id) !== 'home')`. It also drops its HomeView import and branch. `ROUTES`, `staticPaths()` (14), the sitemap and the pinned counts do not change | Scoped `<style>` in HomeView alone (the D4 text); `<style is:inline>`; a fourth sheet | Scoped CSS reaches every page the route file can render, and the catch-all renders all 14. With `is:inline`, the `<style>` lands in `<body>`, which is non-conforming, and it is neither minified nor scoped. D4 already rejected a fourth sheet. As a bonus, the calculator CSS chunk leaves both homes |
| K2 | **The CSS chunk rule, and `build.inlineStylesheets: 'always'`.** CSS imported only from one route's graph forms that route's chunk; CSS reachable from several routes forms a shared chunk (`tokens.css`, `base.css`, header, footer and wordmark, all through `BaseLayout`). Measured today: the shared chunk is 2,568 B (the 404 pages carry it alone), the catch-all's own chunk (`calculator.css` plus `.home-links`) is 2,917 B, and Astro inlines both and merges them into one 5,485 B `<style>` on a calculator page; there is no linked stylesheet anywhere. By default each chunk is inlined only while it is under 4,096 B (`shouldInlineAsset` tests each chunk when the limit function returns `undefined`), so both chunks have a cliff of their own (headroom about 1.1 KB on the catch-all's, 1.5 KB on the shared one). Setting `build.inlineStylesheets: 'always'` in `astro.config.mjs` (H1) removes the cliff: every page inlines all of its CSS whatever the sizes | Accepting a chunk that may flip to a link; a per-chunk byte guard | A flip would give every calculator page a render-blocking request and change the dist shape. With `'always'` the only bound is [SQ6] (20,480 B per page, 5.5 KB used today), which `check:site` already enforces, and the guard of the K1 split stays the `.home-` leak assertion: `CalculatorBody.budget.test.ts` asserts that the built calculator page has no `link[rel=stylesheet]` and no `.home-` selector ([SS28], [SS32]) |
| K3 | Tokens in `tokens.css`: `--text-display: clamp(2.5rem, 1.5rem + 5vw, 4rem)`, `--grid-size: 1rem`, `--tick-weight: 2px`. The tick length is `var(--grid-size)`: one grid cell. No radius token | `--tick-length`, `--measure-card` and a grid-colour token | Every token costs every page (about 82 B for these three) and the Spanish concrete page has little headroom. The clamp floor (40 px) is above `--text-h1` (36 px), and its rem term follows user zoom |
| K4 | Square corners: no `border-radius` in any stylesheet or in HomeView's style | Mockup radii of 9–16 px | Owner decision (D3). Pinned by contract |
| K5 | Card data: `homeCards(locale)`. Ids are `directoryOrder(ROUTES, CALCULATOR_PAGES)`, the `ROUTES` keys that are calculator pages, in `ROUTES` order. Title and summary come from `siteText(locale)` with the template key over `CalculatorPageId`. The example comes from `PAGES[id].catalogs[locale]`; if it is missing, `exampleOf` throws naming `calc.<id>.page.example` and the locale | `card` frontmatter (rejected by D1); an optional example line | `SiteText` takes `keyof typeof enSite`, so `` `page.home.cards.${id}.title` `` fails to compile for an id without the key. `PAGES` is already the one per-id catalog table |
| K6 | Card markup: `ul.home-cards[role=list] > li.home-card`. Inside each card, in order: `h2 > a.tap-target` (title), then `p` (summary), then `p.home-example`. The link is stretched over the card with `a::after { position: absolute; inset: 0 }`, so there is one link per card and its name is the title | The whole card as one `<a>` (a long accessible name); an arrow glyph or "View" text | Heading navigation lists the calculators. `role=list` keeps list semantics in Safari under `list-style: none` |
| K7 | Hero: `div.home-hero` inside `main` (H1, then `p` with `page.home.intro`). It is full width in the column: `margin-inline: calc(-1 * var(--space-3))`. The H1 is `width: fit-content`, so its `::after` dimension line is exactly as wide as the longest heading line | `<header>` (a landmark inside main); a full-viewport bleed (`50vw` tricks cause scrollbar overflow) | The band lines up with the header and footer column. The motif is a real dimension of real content, not decoration |
| K8 | Spanish copy uses the neutral tú register. The new `esSite` values are covered by the existing `register.contract.test.ts`, which already runs `catalogRegisterProblems` over every exported catalog module. Claims stay out through the `FORBIDDEN` test over `page.home.*` | A new register test | The guard already exists |
| K9 | Trim before the H2 growth: set `scopedStyleStrategy: 'class'` in `apps/web/astro.config.mjs`. Scoped elements get an `astro-<hash>` class instead of `data-astro-cid-<hash>` | Raising the budget (D8); dropping a breakpoint without measuring | Verified in Astro 7.4.2 (`config.d.ts`, since 2.4): specificity is +1 class, the same as the attribute (0,1,0). Measured on the built Spanish concrete page: 18 scoped elements (9 with a class, 9 without) and 7 scoped selectors, **160 B** saved. Only `HomeView`, `Wordmark`, `SiteHeader` and `SiteFooter` have a `<style>`; no test, spec or e2e reads `data-astro-cid`, and `CalculatorForm.test.ts` compares `class` exactly on a component with no `<style>`, so nothing breaks |
| K10 | Reservations: `.calc-answer { min-height: calc(var(--answer-lines, 5) * var(--text-h3) * var(--leading-body)) }`, with `@media (min-width: Nrem) { :root { --answer-lines: k } }`, three blocks in `calculator.css`. The notice shares the rule only while the sweep shows that the shared count fits it with less than one **body** line unused at every width; otherwise `.calc-notice { min-height: calc(var(--notice-lines, m) * var(--text-base) * var(--leading-body)) }` gets its own counts in the same media blocks, in its own unit (the notice's "line" is the body line, 26.35 px, not the answer's 34.1 px; a notice reserve counted in answer lines cannot keep the unused part under a body line). The counts are set by the tallest content of **either locale**, because one CSS rule serves both. **Bytes, measured on the minified output:** the answer rule plus three media blocks is 242 B and replaces 62 B (+180 B); the `--notice-lines` variant is 371 B (+129 B more, not +45). The notice variant is likely: at ≥ 60rem the Spanish note (177 characters, `noscript + ' ' + example`) is two body lines plus its 1rem margin, about 68.7 px, over a 2-answer-line reserve of 68.2 px. **Trim rungs, counted on the minified form and measured in H2 before any is taken** (the gate is [CP66]: H2 may not merge above 40,836 B on the Spanish full-length proof): (1) one shared rule `.calc-row, .calc-shopping, .calc-cost, .calc-hint { display: flex; justify-content: space-between; gap: var(--space-3) }` with the two leftovers (`.calc-row` padding; `.calc-shopping` baseline and weight), about −100 B; (2) one shared control rule for `.calc-choice`, `.calc-field input` and `.calc-fallback` (border, background, colour, `font: inherit`), about −60 B, the pressed-state rule stays after it; (3) `.calc-error, .calc-help` sharing `grid-column`, `margin` and `font-size`, about −31 B; (4) merging two adjacent ranges where the sweep allows, −42 B each (−60 B with `--notice-lines`). A `--line` token for `calc(var(--text-h3) * var(--leading-body))` is **not** a rung: it saves 22 B per use and costs 48 B to declare, so it is +4 B at two uses, and the notice uses a different unit anyway | Per-locale counts with `:lang(es)` (about 140 B more); `lh` units (Safari before 16.4 drops them, giving min-height 0 and a shift); counting the notice in answer lines | Rungs 1–3 total about −190 B, more than the +129 B of the notice variant, so H2 can land near 40,760 B with every rule in place; the apply records each rung it takes, and stops and reports if the measured size is still over 40,836 B (D8: the budget is never raised) |
| K11 | `.calc-copy` keeps `min-height: 5rem`, measured against the **mounted** content | A line count per breakpoint; a reserve that includes the clipboard fallback field | The mounted content never wraps: a 44 px button (2.75rem), a 0.25rem gap and one status line (1.6rem) total 4.6rem at every width, so a count would be the constant 1 and add bytes for nothing. The clipboard fallback field (a 56 px input that `mount.ts` inserts only after the user presses the button) is not content of the block: it is a user-initiated state, its shift carries `hadRecentInput` and is excluded from the layout-shift sum, and it predates this change. The delta's Terms say so, and [CP61] measures the copy reserve against the mounted content |
| K12 | Per-page override: rules on `.calculator[data-calculator="<id>"] { --answer-lines: k }` under the same media queries in `calculator.css`. They beat `:root` by inheritance | A page-module field for counts | YAGNI until a second calculator has an answer slot (D6). An inline `style` cannot hold media queries |
| K13 | The breakpoints come from a measured sweep (below). The e2e `WIDTHS` are the seven of the proposal plus both edges of every breakpoint. A vitest cross-check fails when `calculator.css` and `WIDTHS` disagree | Breakpoints from estimates | Inside a range, the narrowest width is the worst case for fit and the widest for the gap, so testing both edges bounds the whole range |
| K14 | Budget at every commit: `CalculatorBody.budget.test.ts` passes, and the measured Spanish full-length size is recorded. Every PR tip ends at 40,836 B or less (today's size, no net growth; the [CP66] gate). PR 1 (H1 + H3a, and H3b if it fits) touches the calculator page only through H1, because H3 edits the home view and the site catalogs after the route split, so the calculator page forecast after PR 1 is the H1 figure, ≈ 40,836 B by equality; PR 2 leaves it unchanged; PR 3 (H2) is the slice that must pay for its growth | Checking only at the PR tip | Headroom is 124 B, so a slice that overruns is caught while it is still small |
| K15 | Docs follow the code: H1 rewrites the `routes.ts` recipe comment ("`pages/index.astro` and `pages/es.astro` render the home"). H3a rewrites AGENTS.md step 14: "the card keys `page.home.cards.<id>.{title,summary}` in both site catalogs; `HomeView.astro` needs no edit; `calc.<id>.page.example` is required (it is optional in `page-view.ts` and becomes a build-time throw, not a type error, for a routed id without it)". It also changes the `docs.contract.test.ts` row `['the home link', …HomeView.astro]` to `['the home card keys', 'page.home.cards.<id>']` | Fixing the docs at the end | Stale recipe text misleads `square-footage`, which is next |

## Module map

| File | Action | Slice |
|---|---|---|
| `apps/web/src/pages/index.astro`, `pages/es.astro` | Create (K1; `site-routing-i18n` [SR23]) | H1 |
| `apps/web/src/pages/[...path].astro` | Filter out `home`; drop the HomeView import and branch | H1 |
| `apps/web/src/routing/routes.ts` | Recipe comment (K15) | H1 |
| `apps/web/src/routing/static-paths-page.test.ts` | [SR23]: the catch-all paths plus the two homes equal `staticPaths()`, no duplicate; each home file renders `lang` en-US / es-US | H1 |
| `apps/web/astro.config.mjs` | H1: `build.inlineStylesheets: 'always'` with a comment (K2). H2: `scopedStyleStrategy: 'class'` with a comment (K9) | H1, H2 |
| `apps/web/src/components/calculator/CalculatorBody.budget.test.ts` | Leak guard: no `link[rel=stylesheet]`, no `.home-` rule (K2, [SS28], [SS32]) | H1 |
| `apps/web/src/styles/tokens.css` | K3 tokens | H1 |
| `apps/web/src/styles/styles.contract.test.ts` | H1: token pins (`--grid-size` = `1rem`, `--tick-weight`), no radius. H2: media parser (unit-only, syntax-agnostic, [CP64]), reservation pins, copy pin, `WIDTHS` cross-check; the "≥ 170 px / 1.42 line height" test is removed | H1, H2 |
| `apps/web/src/styles/calculator.css` | K10 rule and media; trims: `box-sizing:border-box` in `.calc-field input, .calc-fallback` (base `*` already sets it) and `.calc-row dt` from its selector list (`dt` has no default margin); the K10 rungs as measured | H2 |
| `apps/web/src/components/calculator/CalculatorBody.override.test.ts` | [CP65] fixture test: Astro container render of `CalculatorBody` with the concrete page view and `style="--answer-lines:3"`, and of the rectangle-area page view (no answer slot) | H2 |
| `tooling/site-browser/e2e/layout.spec.ts` | `WIDTHS`, natural heights with `display: flow-root`, both directions, per-block line unit | H2 |
| `packages/i18n/src/catalogs/{en,es}/site.ts` | `page.home.heading` reworded; `page.home.cards.concrete.{title,summary}` added; `page.home.links.concrete` removed | H3a |
| `apps/web/src/lib/home-directory.ts` + `.test.ts` | Create (K5; [TP30] on the data module); joins the 100 % coverage list in the root `vitest.config.ts` | H3a |
| `apps/web/src/views/home.test-d.ts` | [TP32]: card keys exist for every `CalculatorPageId`; `@ts-expect-error` on a non-routed id | H3a |
| `apps/web/src/contract/content.contract.test.ts` | [TP26] row: card keys exist exactly for the routed calculators | H3a |
| `AGENTS.md`, `apps/web/src/contract/docs.contract.test.ts` | K15 | H3a |
| `apps/web/src/views/HomeView.astro`, `HomeView.test.ts` | H3b: hero band, the view skeleton (hero, empty directory list from `homeCards`, links) and the kept guards of the test rewritten; H3c: the cards, their CSS and the card tests ([TP28], [TP30] on the view, [TP33]) | H3b, H3c |

H3b is the view with `homeCards(locale)` rendered into `ul.home-cards` with the title link only, so [TP21] and [TP7] hold at its tip; H3c adds the summary, the example line, the card styles and the card scenarios. The H3b tip is a merged state in which the home is complete but plainer, never a broken one.

Unchanged: `json-ld.ts` (D7), `routes.ts` data, `templates.ts`, `lib/pages.ts`, `i18n-contract.test-d.ts`, and the `packages/i18n` tests. The `site-catalog.test.ts` and `route-catalog.ts` regexes ignore the dotted card keys; `route-catalog` reads them as id `home`, which is known.

## Interfaces

```ts
// apps/web/src/lib/home-directory.ts (server only)
export interface HomeCard {
  readonly id: CalculatorPageId; readonly href: string;
  readonly title: string; readonly summary: string; readonly example: string;
}
/** The ids of `routes` that are calculator pages, in `routes` order. */
export const directoryOrder: (routes: RouteTable, pages: readonly string[]) => string[];
/** `calc.<id>.page.example` of a catalog; throws naming the key and the locale. */
export const exampleOf: (catalog: Messages, id: string, locale: Locale) => string;
/** The view calls `homeCards(locale)`; the tables default to the real ones and exist for [TP30]. */
export const homeCards: (
  locale: Locale,
  routes?: RouteTable,          // default ROUTES
  pages?: readonly string[],    // default CALCULATOR_PAGES
) => readonly HomeCard[];
// title: siteText(locale)(`page.home.cards.${id}.title`), so a missing key is a compile error
```

[TP30] is proved on this module with a fixture table whose order differs from the page list, and once more on the rendered view with the real tables. `HomeView.astro` keeps `locale` as its only prop; no table is injected into the view.

### Home DOM contract

```html
<div class="home-hero"><h1>{page.home.heading}</h1><p>{page.home.intro}</p></div>
<ul class="home-cards" role="list">
  <li class="home-card"><h2><a class="tap-target" href="{path}">{title}</a></h2>
    <p>{summary}</p><p class="home-example">{example}</p></li>
</ul>
<p class="home-links"><a class="tap-target" …>methodology</a><a …>about</a></p>
```

The cards use Sheet white on Plan paper, with a 2 px border in `--color-surface` that turns `--color-text` on `:hover` and `:focus-within` (no layout change). The title is Barlow Condensed through the base `h2` rule (no new CSS), in the link colour, underlined on hover. The example uses Form gray at `--text-small`. The grid is `repeat(auto-fill, minmax(min(100%, 18rem), 1fr))`. There is no motion, no shadow, no `text-transform`, and no arrow or `›`/`»` glyph. The link keeps the base focus ring.

The non-obvious CSS of the hero:

```css
.home-hero {
  --grid-line: color-mix(in srgb, var(--color-surface) 12%, transparent);
  margin: 0 calc(-1 * var(--space-3)) var(--space-5);
  padding: var(--space-5) var(--space-3);
  background: var(--color-text);
  background-image: linear-gradient(var(--grid-line) 1px, transparent 0),
    linear-gradient(90deg, var(--grid-line) 1px, transparent 0);
  background-size: var(--grid-size) var(--grid-size);
  color: var(--color-surface);
}
.home-hero h1 { width: fit-content; font-size: var(--text-display); }
.home-hero h1::after {
  content: '';
  display: block;
  height: var(--grid-size);
  margin-top: var(--space-2);
  border-inline: var(--tick-weight) solid var(--color-accent);
  background: linear-gradient(var(--color-accent), var(--color-accent)) center / 100% var(--tick-weight) no-repeat;
}
```

Fallbacks: without `color-mix`, the grid drops out and the band is plain ink. In forced colours, the backgrounds drop out and the borders (the ticks) remain.

**Copy (defaults, see Q1):**

| Key | EN | ES |
|---|---|---|
| `page.home.heading` | From measurements to a shopping list | De tus medidas a la lista de compras |
| `page.home.intro` | unchanged: it starts with `site.tagline`, so [TP8] holds | unchanged |
| `page.home.cards.concrete.title` | Concrete calculator | Calculadora de concreto |
| `page.home.cards.concrete.summary` | Cubic yards and bags for a slab, footing, column or steps. | Yardas cúbicas y bolsas para una losa, zapata, columna o escalones. |

**Bytes per card** (class scoping, est.): about 350 B in EN and about 380 B in ES. The hero and list wrapper add about 200 B, and the scoped home CSS is about 1.4–1.8 KB. Until H2 switches K9 on, the home ships under attribute scoping, about 8 B more per scoped element; the home has more than 14 KB of headroom under [TP35], so the order does not matter for it.

## Gap fix detail

**Line counts. Every value here must be measured in the browser before it is pinned.** Basis: content width is `min(viewport − 32, 992)` px; the answer is Barlow 600 at 22 px, about 10.3 px per character, consistent with JD-4's 5 lines at 320 px. The longest sentences are Spanish steps or footing in metric (about 140 characters) and English steps (about 100). The notice text is Spanish `noscript + ' ' + example` (177 characters at 17 px) plus its 1rem paragraph margin, compared in body lines (26.35 px), its own unit; the sweep records its tallest natural height per width next to the answer's.

| Range | Tested widths | Longest answer, ES / EN (lines) | `--answer-lines` |
|---|---|---|---|
| < 30rem | 320, 390, 479 | 5 / 4 | 5 (fallback) |
| ≥ 30rem | 480, 639 | 4 / 3 | 4 |
| ≥ 40rem | 640, 768, 959 | 3 / 2 | 3 |
| ≥ 60rem | 960, 1024, 1280 | 2 / 2 | 2 |

**Sweep (apply, before pinning; not committed).** A scratch Playwright run over the built site, from 320 to 1280 px in 1 px steps, for every `layoutQueries` entry in both locales. It records the tallest natural height of the answer and of the notice. Each breakpoint is the rem value (rounded up to 0.5rem) where the tallest line count drops. The results go in `apply-progress.md`.

**The `layout.spec.ts` extension (H2).** For each calculator id, it loads each layout query once per locale and resizes through `WIDTHS`. At each width it measures the natural height of each reserved block with one probe: set `el.style.minHeight = '0px'` **and** `el.style.display = 'flow-root'`, read `getBoundingClientRect().height`, restore both. The `flow-root` is required: with `min-height: 0` alone the note's 1rem bottom margin (`base.css` `p { margin: 0 0 var(--space-3) }`) collapses through `.calc-notice` and the notice reads 16 px short (today the non-zero `min-height` is what blocks the collapse). The blocks probed:
- the answer, rewritten to each of its sentences and to `—`;
- the notice area, with `[data-not-running]` un-hidden (scripts disabled) and with the `?v=2` link notice;
- the copy area after mount (button, gap, status line; the fallback field is never inserted by the test).

It asserts, per width and per block:
- `natural ≤ reserved` for each locale;
- `reserved − max(natural over both locales) < line`, where `line` is that block's unit read from the computed `line-height` of its text: the answer's 34.1 px for the answer, the body's 26.35 px for the notice and the copy block (delta Terms). The notice is never bounded in answer lines.

The CLS ≤ 0.01 load test stays. The notice-shown `scrollHeight` test runs at every width.

**Contract pins (H2), replacing the 170 px floor:**
- `rulesOf` skips `@media` blocks, and a new `mediaRulesOf` returns `[query, rules]`; the parser extracts every length of a media condition as `(number, unit)` and does not depend on the `min-width:` versus `width>=` syntax, because lightningcss rewrites `(min-width: 30rem)` to `(width>=30rem)` in the build ([CP64] reads both the source and the built CSS);
- the exact formula on `.calc-answer`, and on `.calc-notice` either the same formula or the `--notice-lines` one in the body unit (K10), whichever H2 measures in;
- the media list (widths strictly increasing, counts strictly decreasing, values as measured);
- `.calc-copy` at or above the 4.6rem sum and less than 4.6rem plus one body line;
- every breakpoint `N` puts `N·16` and `N·16 − 1` in `WIDTHS` (read from the e2e file as text, as `browser-record.contract.test.ts` does).

**The [CP65] fixture test (H2).** An Astro container render of `CalculatorBody` with the concrete page view and `style="--answer-lines:3"` on the body asserts the inline property on the body and the unchanged `data-reserved="answer"` block (the reserve resolves through the shared formula, so no stylesheet edit); the rectangle-area page view rendered the same way has no `data-reserved="answer"` at all (`CalculatorBody.astro` renders `.calc-answer` only when `view.answer` exists). Both are unit tests in the style of [CP56]; no e2e is needed for them.

**What stays a gap by design.** After mount, the notice area is blank unless a link notice shows. It must hold the not-running note before mount ([CP40]: the note is outside `noscript`). This change shrinks that blank from 9rem to the per-width reserve; at 1024 px, from 144 px to the Spanish note's height plus less than one body line (about 69–95 px, measured).

## Budgets

Today, measured on a clean checkout (design review, 2026-10-27): the Spanish concrete page at full length is **40,836 B** (of 40,960 B, 124 B headroom; the English one 40,567 B); the real Spanish concrete page is 34,100 B; the EN home is 10,498 B and the ES home 10,586 B. Inline CSS per catch-all page: font-face 888 + 1,026 B, the shared chunk 2,568 B and the catch-all's own chunk 2,917 B, merged into one 5,485 B `<style>`; the 404 pages carry the shared chunk only; no linked stylesheet anywhere. The K3 tokens minified are 83 B, the same as the `.home-links` rule they replace on the catch-all pages. The slice columns are forecasts from those measurements; each slice records the measured value.

The columns follow the PR order (H1 and H3a in PR 1, H3b and H3c in PR 2, H2 in PR 3); each is the forecast at that PR's tip.

| Item | Today | PR 1 tip (H1 + H3a) | PR 2 tip (H3b + H3c) | PR 3 tip (H2) | Limit |
|---|---|---|---|---|---|
| ES concrete, full length | 40,836 | ≈ 40,836 (−83 `.home-links`, +83 tokens: K14 holds by equality, not margin; H3a adds keys no calculator page renders) | ≈ 40,836 (H3 edits the home only) | ≈ 40,821 without `--notice-lines` (−160 K9, +180 rule, −35 trims); with it +129 before the K10 rungs (≈ −190), ≈ 40,760 after | 40,960; every PR tip ≤ 40,836 ([CP66]) |
| Shared CSS chunk | 2,568 B | +83 B tokens | same | ±0 | inlined always (K2); [SQ6] |
| Catch-all's own chunk | 2,917 B | 2,834 B (`.home-links` gone) | same | ≈ 2,800–2,990 B (K10 rule and rungs) | inlined always (K2); no 4,096 B cliff |
| Home EN HTML | 10,498 | ≈ 7.6 KB (catch-all chunk gone, +83 B tokens) | ≈ 9.6–10.1 KB (hero, two cards' worth of markup, 1.4–1.8 KB scoped CSS, attribute scoping) | ≈ 9.5–10 KB (K9) | 40,960; [TP35] bound 24,576 |
| Home CSS (inline, font-face included) | 7,399 | ≈ 4.5 KB | ≈ 5.9–6.3 KB | ≈ 5.8–6.2 KB | 20,480 |
| Three source sheets | ~6.4 KB | +~0.1 KB | ±0 | ≈ −0.1 KB | 20,480 (`styles.contract`) |
| Home JS | 0 | 0 | 0 | 0 | 0 |

**Trim ladder** if H2 measures over 40,836 B: the K10 rungs in order, (1) the shared flex rule (about −100 B), (2) the shared control rule (about −60 B), (3) `.calc-error, .calc-help` (about −31 B), (4) merge adjacent ranges where the sweep allows (−42 B each, −60 B with `--notice-lines`); then (5) stop and report. Each rung taken is recorded with its measured saving. The budget is never raised (D8).

## Testing per slice (RED first)

| Slice | RED first | Then |
|---|---|---|
| H1 | Budget leak guard (fails today on `.home-links`); `static-paths-page.test.ts` split ([SR23]); the `inlineStylesheets` pin ([SS32]); token pins and the no-radius pin | Route files, catch-all filter, config, tokens |
| H3a | `home-directory.test.ts` (`directoryOrder` with a fixture whose `ROUTES` order differs from the page list; `exampleOf` throws; [TP30]); `home.test-d.ts` ([TP32]); the content.contract [TP26] row | Keys, data module, docs |
| H3b | The `HomeView.test.ts` rewrite: hero ([TP29]), the kept guards, the list equal to `directoryOrder` ([TP21]) | Hero, view skeleton |
| H3c | The card scenarios on the view and the built HTML ([TP28], [TP30] on the view, [TP33], [TP37]) | Cards, card CSS |
| H2 | `layout.spec.ts` at the new `WIDTHS` (fails today: the gap at 1024 and 1280); reservation, media and `WIDTHS` pins; the [CP65] fixture test | Sweep, K9, CSS, trims, rungs |

**What happens to each `HomeView.test.ts` guard:**

| Today | After |
|---|---|
| Whole document, lang, title, canonical; one H1 in main; language switch | Kept. The H1 text is now `page.home.heading` from the catalog |
| [TP7] methodology and about links (`slice(1)`) | Kept, selected as the `main` links outside the list |
| [TP21] concrete link inside the intro paragraph | Replaced: one `li` per id of `directoryOrder(ROUTES, CALCULATOR_PAGES)`, in that order. Each has exactly one `a[href]`, equal to `pathOf(id, locale)`, with the title text, the summary and the example |
| [TP21] names no other calculator (hard-coded words) | Generalised: `calc.<id>.title` of every `PAGELESS` id is absent in both locales; the roofing and paint words stay |
| [TP8] tagline verbatim; intro equals `intro + links.concrete` | Tagline kept. The equality becomes "the hero paragraph equals `page.home.intro`" (the link moved to the card) |
| Exactly 2 `<p>`, no `ul`/`ol` | Dropped. The directory is a list by design, and upcoming calculators are excluded by the equality test plus `FORBIDDEN` |
| No promises; claims out of `page.home.*` values; nothing "still being built" | Kept; they now cover the card keys too |
| JSON-LD (Organization and WebSite, one script); NotFound has none | Kept (D7). The single `script` also proves zero JavaScript |
| — (new) | No `→ › »` in `main`; the HomeView style has no `text-transform`, `border-radius`, `transition` or `animation` |

Browser: `a11y.spec.ts` and `smoke` already cover `/` and `/es` from the route table. Lighthouse covers the homes among its six pages. No spec edit is needed.

## Review units and gates

`git diff --shortstat` counts insertions plus deletions (the archived calculator-core review counted `31 insertions(+), 31 deletions(-)` as 62). `HomeView.test.ts` is 163 lines and `HomeView.astro` 44 today, and both are mostly rewritten, so H3 as one slice would be about 550–650, not 300–400. It is three slices from the start:

The order is the owner's: the visible home ships first, and the desktop gap, a small live defect, waits one PR.

| Slice | Commit | Forecast |
|---|---|---|
| H1 | `feat(web): give the home its own route and add the display, grid and tick tokens` (K2 included) | ~100–130 |
| H3a | `feat(web): add the home card keys and the directory data module` (keys, `home-directory.ts` + test, `home.test-d.ts`, the `content.contract` row, AGENTS.md and `docs.contract`) | ~170–210 |
| H3b | `feat(web): add the home hero and render the directory skeleton` (hero, view skeleton, the kept `HomeView.test.ts` guards rewritten) | ~190–230 |
| H3c | `feat(web): render the calculator cards on the home` (cards, card CSS, card tests) | ~190–210 |
| H2 | `fix(web): size the answer and notice reserves per breakpoint` (K9 and the [CP65] fixture test included) | ~170–200 |

**PR 1 = H1 + H3a** (about 270–340 lines; H3b joins only if the measured `--shortstat` stays under 400, which the forecast does not expect). **PR 2 = H3b + H3c** (about 380–440): if the measured sum passes 400, H3c becomes a PR of its own and H2 moves one PR later, with no change to the slices. **PR 3 = H2.** The proposal's guard lines: decision needed No, chained PRs Yes, 400-line risk Medium with that split rule.

**Every slice:**
- `npm run format:check`
- `npm run sync && npm run lint`
- `npm run typecheck`, plus `--prefix tooling/site-browser` in H3c and H2
- `npm run test:coverage`, which includes the budget proof
- `npm run build && npm run check:site`
- `npm run test:e2e`
- record the Spanish full-length size and `--shortstat`

**PR tip:**
- `npm run verify`
- `npm run build && npm run check:site && npm run test:e2e && npm run lighthouse`
- the dist diff below
- H3c only: screenshots of both homes at 390 and 1280 px in the PR

**Dist diff.** Build `main` once into scratch. Normalise both trees:
- asset names: `/_astro/ASSET.$1`;
- scoping: strip ` data-astro-cid-\w+`, ` class="astro-\w+"`, the ` astro-\w+` class tokens, `[data-astro-cid-\w+]` and `.astro-\w+`;
- CSS order on the two home pages only: after K1 the home's CSS arrives as the shared chunk and its own chunk, merged by `mergeInlineCss` in a different depth order than today, so on `index.html` and `es.html` each `<style>` is split into its rules and the rule set is compared as a sorted set, not byte for byte. Every other page keeps the byte comparison.

Then `diff -r -x '*.js'`.
- **PR 1 tip (H1 + H3a) versus `main`.** Only these differences are allowed:
  - every page: `:root` gains the two tokens and the display size; no page gains or loses a `link[rel=stylesheet]` (there is none today and `inlineStylesheets: 'always'` keeps it so);
  - the 12 catch-all pages: `.home-links{…}` removed;
  - the 2 homes: the catch-all's own chunk removed; the rule set of the remaining CSS equal to today's shared chunk plus the tokens and `.home-links`.
  
  H3a adds keys that no page renders yet, so it changes no built page (`page.home.links.concrete` is removed only when the view stops reading it in H3b, so H3a keeps it and H3b removes it). Anything else fails the gate. This replaces the narrower expectation "only the reserved-block CSS changes", because K1, K2 and K3 touch every page by construction.
- **PR 2 tip (H3b + H3c) versus PR 1 tip:** only `index.html` and `es.html` differ.
- **PR 3 tip (H2) versus PR 2 tip:** after the scoping normalisation (K9 rewrites every page's scoping markup, which the normalisation strips), only the 2 calculator pages differ: the old reserve declarations, the two trimmed declarations and the rules of any K10 rung taken are replaced by the K10 rule, its media blocks and the merged rules.

## Threat matrix

N/A. The change has no shell, subprocess, Git or PR automation, executable-file classification or process boundary. The new route files are static pages. Every row (documentation-like paths, repository selection, commit state, push state, PR commands) is N/A for that reason.

## Migration / rollout

No URL, data, core or catalog-shape migration; `ROUTES` and the sitemap are unchanged. Revert newest first: PR 3 (H2), then PR 2, then PR 1. PR 3 reverts alone without fallout (it touches the calculator stylesheet, the config and the e2e only). Reverting PR 1 alone after PR 2 would put the home CSS back into the catch-all chunk, on every page.

## Reconciliation with the proposal and specs (for sdd-spec)

| # | Where | Applied |
|---|---|---|
| R1 | `site-routing-i18n` › Calculator pages ("the catch-all renders … every other id as before") | The homes render from `pages/index.astro` and `pages/es.astro` (K1). The delta exists: `specs/site-routing-i18n/spec.md`, scenario [SR23], and the proposal lists the capability as modified |
| R2 | D4 rationale | Scoping alone leaks the CSS. K1 is the mechanism that makes D4 hold, and K2 (`inlineStylesheets: 'always'`) removes the chunk cliff that the proposal's risk table named |
| R3 | `calculator-page` › Layout stability | `.calc-copy` keeps its fixed reserve, measured against the mounted content; the clipboard fallback field is excluded by the delta's Terms (K11). "Unused reserve under one line" is per block: the answer in answer lines, the notice and the copy block in body lines (K10) |
| R4 | `site-shell` › tokens | The primitives are `--grid-size: 1rem` and `--tick-weight`, plus the rule that tick length equals `--grid-size` ([SS25]) |
| R5 | `trust-pages` › Home page | The H1 is catalog copy, not the brand. [TP21] becomes "exactly `CALCULATOR_PAGES` in `ROUTES` order". `page.home.links.concrete` is retired, and the [TP26] `content.contract` row reads the card keys (a test edit; the main-spec [TP26] text is about the methodology and is unaffected) |

## Follow-ups (not part of this change)

- **Hub-era card keys.** At about 350–380 B per card, [TP35]'s 24,576 B bound is reached near 45 cards and [SQ7] near 90; `site.ts` grows four lines per calculator, and grouping (PLAN.md §7.1 hubs) is needed for usability around 20 cards. When the hubs come, move the card keys into the calculator's own catalog (`calc.<id>.card.{title,summary}`; no client cost, the messages are templated server-side) so `site.ts` stops growing per calculator. D2 is decided for this change; this is recorded as the hub-era refactor, not done here.
- **Trust pages carry the catch-all chunk.** The trust pages keep the 2.9 KB calculator chunk because they share the catch-all route file. Pre-existing and out of scope; a later change may split the trust template into its own route file the same way K1 does for the home.

## Open questions (the apply takes the default if unanswered)

1. **Hero H1 copy.** Default: "From measurements to a shopping list" / "De tus medidas a la lista de compras", with `page.home.intro` unchanged below it.
2. **K9 touches every page's markup** (scoping attribute to class). Default: adopt it in H2. Without it, H2 adds about 145 B (+180 rule, −35 trims) and ends near 40,981 B, over the 40,960 B budget at full length, before any `--notice-lines` cost; the K10 rungs alone (about −190 B) would then be spent on standing still instead of on the notice variant.
