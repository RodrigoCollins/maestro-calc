# Design: Home Directory — the Home as a Calculator Directory with the Blueprint Identity

This design implements `proposal.md` (D1–D8 are binding) and `explore.md` §§1, 2, 4. The delta specs win over any value written here. Sizes marked "est." come from source reading and the existing `apps/web/dist`. This phase had no shell, so the apply measures them before H1 and records them in `apply-progress.md`.

## Answer first

- **Scoped CSS alone does not keep the home CSS off the other pages.** Astro bundles CSS by route file, and every routable page, the home included, is one route: `pages/[...path].astro`. Evidence: the built `es/calculadora-de-concreto.html` carries the home rule `.home-links[data-astro-cid-6voplrxj]{…}`. **K1 gives the home its own route files** (`pages/index.astro`, `pages/es.astro`). That makes D4 true: HomeView's scoped CSS ships on the two homes only, and the calculator CSS (about 3.4 KB) leaves the home.
- **The directory is data.** `lib/home-directory.ts` joins `ROUTES` order, `CALCULATOR_PAGES`, the typed card keys `page.home.cards.<id>.{title,summary}` and `calc.<id>.page.example`. A routed id without its keys is a type error that names the key. After this change, `HomeView.astro` is not edited when a calculator is added.
- **Identity is spent once.** A hero band on ink holds:
  - the 16 px grid, drawn as two CSS gradients;
  - the H1 in `--text-display`;
  - one orange dimension line that measures the H1 (a pseudo-element: a 2 px line and two end ticks, each one grid cell tall).
  
  The cards stay quiet. Corners stay square.
- **Gap fix (D5) and its bytes.** `.calc-answer` and `.calc-notice` share `min-height: calc(var(--answer-lines, 5) * var(--text-h3) * var(--leading-body))`. Three rem breakpoints set `--answer-lines` on `:root`. As written, the rule adds about 139 B to the Spanish concrete page. **K9 pays for it**: `scopedStyleStrategy: 'class'` saves about 150 B on every page. PR 1 then ends at or below today's 40,836 B.
- **Slices:** H1 (route split, tokens), H2 (class scoping, reservations, layout e2e) in PR 1, about 270–330 lines; H3 (directory) in PR 2, about 300–400 lines, with a split contingency.

## Architecture decisions (K-rules)

| # | Decision | Rejected | Rationale |
|---|---|---|---|
| K1 | Home routes: `apps/web/src/pages/index.astro` (`<HomeView locale="en" />`) and `apps/web/src/pages/es.astro` (`locale="es"`), the same pattern as `404.astro` / `es/404.astro`. The catch-all filters out `home`: `staticPaths().filter(({ props }) => templateOf(props.id) !== 'home')`. It also drops its HomeView import and branch. `ROUTES`, `staticPaths()` (14), the sitemap and the pinned counts do not change | Scoped `<style>` in HomeView alone (the D4 text); `<style is:inline>`; a fourth sheet | Scoped CSS reaches every page the route file can render, and the catch-all renders all 14. With `is:inline`, the `<style>` lands in `<body>`, which is non-conforming, and it is neither minified nor scoped. D4 already rejected a fourth sheet. As a bonus, the calculator CSS chunk leaves both homes |
| K2 | **The CSS chunk rule.** CSS imported only from one route's graph forms that route's chunk. CSS reachable from several routes forms a shared chunk: `tokens.css`, `base.css`, header and footer, all through `BaseLayout`. A chunk under 4,096 B is inlined (`assetsInlineLimit` returns `undefined` for CSS); at 4,096 B or more it becomes a linked `/_astro/*.css` | Accepting a chunk that flips to a link | The catch-all chunk (`calculator.css`) is about 3.4 KB, est. If it flips, every calculator page gains a render-blocking request, and the dist diff changes shape. Guard: `CalculatorBody.budget.test.ts` asserts that the built calculator page has no `link[rel=stylesheet]` and no `.home-` selector |
| K3 | Tokens in `tokens.css`: `--text-display: clamp(2.5rem, 1.5rem + 5vw, 4rem)`, `--grid-size: 1rem`, `--tick-weight: 2px`. The tick length is `var(--grid-size)`: one grid cell. No radius token | `--tick-length`, `--measure-card` and a grid-colour token | Every token costs every page (about 82 B for these three) and the Spanish concrete page has little headroom. The clamp floor (40 px) is above `--text-h1` (36 px), and its rem term follows user zoom |
| K4 | Square corners: no `border-radius` in any stylesheet or in HomeView's style | Mockup radii of 9–16 px | Owner decision (D3). Pinned by contract |
| K5 | Card data: `homeCards(locale)`. Ids are `directoryOrder(ROUTES, CALCULATOR_PAGES)`, the `ROUTES` keys that are calculator pages, in `ROUTES` order. Title and summary come from `siteText(locale)` with the template key over `CalculatorPageId`. The example comes from `PAGES[id].catalogs[locale]`; if it is missing, `exampleOf` throws naming `calc.<id>.page.example` and the locale | `card` frontmatter (rejected by D1); an optional example line | `SiteText` takes `keyof typeof enSite`, so `` `page.home.cards.${id}.title` `` fails to compile for an id without the key. `PAGES` is already the one per-id catalog table |
| K6 | Card markup: `ul.home-cards[role=list] > li.home-card`. Inside each card, in order: `h2 > a.tap-target` (title), then `p` (summary), then `p.home-example`. The link is stretched over the card with `a::after { position: absolute; inset: 0 }`, so there is one link per card and its name is the title | The whole card as one `<a>` (a long accessible name); an arrow glyph or "View" text | Heading navigation lists the calculators. `role=list` keeps list semantics in Safari under `list-style: none` |
| K7 | Hero: `div.home-hero` inside `main` (H1, then `p` with `page.home.intro`). It is full width in the column: `margin-inline: calc(-1 * var(--space-3))`. The H1 is `width: fit-content`, so its `::after` dimension line is exactly as wide as the longest heading line | `<header>` (a landmark inside main); a full-viewport bleed (`50vw` tricks cause scrollbar overflow) | The band lines up with the header and footer column. The motif is a real dimension of real content, not decoration |
| K8 | Spanish copy uses the neutral tú register. The new `esSite` values are covered by the existing `register.contract.test.ts`, which already runs `catalogRegisterProblems` over every exported catalog module. Claims stay out through the `FORBIDDEN` test over `page.home.*` | A new register test | The guard already exists |
| K9 | Trim before the H2 growth: set `scopedStyleStrategy: 'class'` in `apps/web/astro.config.mjs`. Scoped elements get an `astro-<hash>` class instead of `data-astro-cid-<hash>` | Raising the budget (D8); dropping a breakpoint without measuring | Specificity does not change (a class and an attribute selector are both 0,1,0). It saves about 150 B on the Spanish concrete page (19 attributes and 6 selectors). No test reads the attribute (checked with `rg`). Before H2, confirm the option against the Astro 7 docs |
| K10 | Reservations: `.calc-answer, .calc-notice { min-height: calc(var(--answer-lines, 5) * var(--text-h3) * var(--leading-body)) }`. `@media (min-width: Nrem) { :root { --answer-lines: k } }`, three blocks in `calculator.css`. The counts are set by the tallest content of **either locale**, because one CSS rule serves both | `--notice-lines`; per-locale counts with `:lang(es)` (about 140 B more); `lh` units (Safari before 16.4 drops them, giving min-height 0 and a shift) | Measured against the reserve unit, the notice (body lines plus the 1rem `p` margin) is within one line of the answer at every estimated width. If the sweep shows otherwise, `--notice-lines` is added with the same breakpoints (about +45 B, recorded) |
| K11 | `.calc-copy` keeps `min-height: 5rem` | A line count per breakpoint | Nothing in the block wraps on load: a 44 px button, a 0.25rem gap and one empty status line (1.6rem) total 4.6rem at every width. Its count would be the constant 1, so it would add bytes and change nothing. The e2e proves both directions at every width |
| K12 | Per-page override: rules on `.calculator[data-calculator="<id>"] { --answer-lines: k }` under the same media queries in `calculator.css`. They beat `:root` by inheritance | A page-module field for counts | YAGNI until a second calculator has an answer slot (D6). An inline `style` cannot hold media queries |
| K13 | The breakpoints come from a measured sweep (below). The e2e `WIDTHS` are the seven of the proposal plus both edges of every breakpoint. A vitest cross-check fails when `calculator.css` and `WIDTHS` disagree | Breakpoints from estimates | Inside a range, the narrowest width is the worst case for fit and the widest for the gap, so testing both edges bounds the whole range |
| K14 | Budget at every commit: `CalculatorBody.budget.test.ts` passes, and the measured Spanish full-length size is recorded. PR 1 ends at 40,836 B or less (no net growth) | Checking only at the PR tip | Headroom is 124 B, so a slice that overruns is caught while it is still small |
| K15 | Docs follow the code: H1 rewrites the `routes.ts` recipe comment ("`pages/index.astro` and `pages/es.astro` render the home"). H3 rewrites AGENTS.md step 14: "the card keys `page.home.cards.<id>.{title,summary}` in both site catalogs; `HomeView.astro` needs no edit; `calc.<id>.page.example` is required". It also changes the `docs.contract.test.ts` row `['the home link', …HomeView.astro]` to `['the home card keys', 'page.home.cards.<id>']` | Fixing the docs at the end | Stale recipe text misleads `square-footage`, which is next |

## Module map

| File | Action | Slice |
|---|---|---|
| `apps/web/src/pages/index.astro`, `pages/es.astro` | Create (K1) | H1 |
| `apps/web/src/pages/[...path].astro` | Filter out `home`; drop the HomeView import and branch | H1 |
| `apps/web/src/routing/routes.ts` | Recipe comment (K15) | H1 |
| `apps/web/src/routing/static-paths-page.test.ts` | The catch-all paths plus the two homes equal `staticPaths()`; each home file renders `lang` en-US / es-US | H1 |
| `apps/web/src/components/calculator/CalculatorBody.budget.test.ts` | Leak guard (K2) | H1 |
| `apps/web/src/styles/tokens.css` | K3 tokens | H1 |
| `apps/web/src/styles/styles.contract.test.ts` | H1: token pins, no radius. H2: media parser, reservation pins, copy pin, `WIDTHS` cross-check; the "≥ 170 px / 1.42 line height" test is removed | H1, H2 |
| `apps/web/astro.config.mjs` | `scopedStyleStrategy: 'class'` with a comment (K9) | H2 |
| `apps/web/src/styles/calculator.css` | K10 rule and media; trims: `box-sizing:border-box` in `.calc-field input, .calc-fallback` (base `*` already sets it) and `.calc-row dt` from its selector list (`dt` has no default margin) | H2 |
| `tooling/site-browser/e2e/layout.spec.ts` | `WIDTHS`, natural heights, both directions | H2 |
| `apps/web/src/lib/home-directory.ts` + `.test.ts` | Create (K5); joins the 100 % coverage list in the root `vitest.config.ts` | H3 |
| `apps/web/src/views/HomeView.astro`, `HomeView.test.ts` | Rewrite | H3 |
| `apps/web/src/views/home.test-d.ts` | Card keys exist for every `CalculatorPageId` | H3 |
| `packages/i18n/src/catalogs/{en,es}/site.ts` | `page.home.heading` reworded; `page.home.cards.concrete.{title,summary}` added; `page.home.links.concrete` removed | H3 |
| `apps/web/src/contract/content.contract.test.ts` | [TP26] row: card keys exist exactly for the routed calculators | H3 |
| `AGENTS.md`, `apps/web/src/contract/docs.contract.test.ts` | K15 | H3 |

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
export const homeCards: (locale: Locale) => readonly HomeCard[];
// title: siteText(locale)(`page.home.cards.${id}.title`), so a missing key is a compile error
```

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

**Bytes per card** (class scoping, est.): about 350 B in EN and about 380 B in ES. The hero and list wrapper add about 200 B, and the scoped home CSS is about 1.4–1.8 KB.

## Gap fix detail

**Line counts. Every value here must be measured in the browser before it is pinned.** Basis: content width is `min(viewport − 32, 992)` px; the answer is Barlow 600 at 22 px, about 10.3 px per character, consistent with JD-4's 5 lines at 320 px. The longest sentences are Spanish steps or footing in metric (about 140 characters) and English steps (about 100). The notice text is Spanish `notRunning` (about 176 characters at 17 px) plus a 1rem margin, compared in answer lines.

| Range | Tested widths | Longest answer, ES / EN (lines) | `--answer-lines` |
|---|---|---|---|
| < 30rem | 320, 390, 479 | 5 / 4 | 5 (fallback) |
| ≥ 30rem | 480, 639 | 4 / 3 | 4 |
| ≥ 40rem | 640, 768, 959 | 3 / 2 | 3 |
| ≥ 60rem | 960, 1024, 1280 | 2 / 2 | 2 |

**Sweep (apply, before pinning; not committed).** A scratch Playwright run over the built site, from 320 to 1280 px in 1 px steps, for every `layoutQueries` entry in both locales. It records the tallest natural height of the answer and of the notice. Each breakpoint is the rem value (rounded up to 0.5rem) where the tallest line count drops. The results go in `apply-progress.md`.

**The `layout.spec.ts` extension (H2).** For each calculator id, it loads each layout query once per locale and resizes through `WIDTHS`. At each width it measures:
- the natural height of the answer (`el.style.minHeight = '0px'`, read `getBoundingClientRect().height`, restore);
- the natural height of the notice area, with `[data-not-running]` un-hidden and with the `?v=2` link notice;
- the natural height of the copy area after mount.

It asserts, per width:
- `natural ≤ reserved` for each locale;
- `reserved − max(natural over both locales) < line`, where `line` is the answer's computed `line-height` (34.1 px).

The CLS ≤ 0.01 load test stays. The notice-shown `scrollHeight` test runs at every width.

**Contract pins (H2), replacing the 170 px floor:**
- `rulesOf` skips `@media` blocks, and a new `mediaRulesOf` returns `[query, rules]`;
- the exact formula on both selectors;
- the media list (widths strictly increasing, counts strictly decreasing, values as measured);
- `.calc-copy` at or above the 4.6rem sum and less than 4.6rem plus one line;
- every breakpoint `N` puts `N·16` and `N·16 − 1` in `WIDTHS` (read from the e2e file as text, as `browser-record.contract.test.ts` does).

**What stays a gap by design.** After mount, the notice area is blank unless a link notice shows. It must hold the not-running note before mount ([CP40]: the note is outside `noscript`). This change shrinks that blank from 9rem to the per-width count; at 1024 px, from 144 px to about 68 px.

## Budgets

Today: the Spanish concrete page at full length is **40,836 B** (measured, of 40,960 B). The values below are estimates; each slice records the measured value.

| Item | Today | H1 | H2 | H3 | Limit |
|---|---|---|---|---|---|
| ES concrete, full length | 40,836 | ~40,834 (−84 `.home-links`, +82 tokens) | ~40,823 (−150 K9, +174 rule, −35 trims) | ~40,823 | 40,960; PR 1 ≤ 40,836 |
| Catch-all CSS chunk (inlined) | ~3.5 KB | ~3.4 KB | ~3.55 KB | same | stays < 4,096 B (K2) |
| Home EN HTML | ~10.0 KB | ~6.6 KB (calculator chunk gone) | ~6.5 KB | ~8.7 KB | 40,960 |
| Home CSS (inline) | ~5.9 KB | ~2.5 KB | ~2.4 KB | ~4.1 KB | 20,480 |
| Three source sheets | ~6.4 KB | +~0.1 KB | ±0 | ±0 | 20,480 (`styles.contract`) |
| Home JS | 0 | 0 | 0 | 0 | 0 |

**Trim ladder** if H2 measures over: (1) merge adjacent ranges where the sweep allows (−42 B each); (2) stop and report. The budget is never raised (D8).

## Testing per slice (RED first)

| Slice | RED first | Then |
|---|---|---|
| H1 | Budget leak guard (fails today on `.home-links`); `static-paths-page.test.ts` split; token pins and the no-radius pin | Route files, catch-all filter, tokens |
| H2 | `layout.spec.ts` at the new `WIDTHS` (fails today: the gap at 1024 and 1280); reservation, media and `WIDTHS` pins | Sweep, K9, CSS, trims |
| H3 | `home-directory.test.ts` (`directoryOrder` with a fixture whose `ROUTES` order differs from the page list; `exampleOf` throws); `home.test-d.ts`; the `HomeView.test.ts` rewrite; content.contract [TP26] | Keys, view, docs |

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

| Slice | Commit | Forecast |
|---|---|---|
| H1 | `feat(web): give the home its own route and add the display, grid and tick tokens` | ~100–130 |
| H2 | `fix(web): size the answer and notice reserves per breakpoint` (K9 included) | ~170–200 |
| H3 | `feat(web): turn the home into the calculator directory` | ~300–400 |

**PR 1 = H1 + H2** (about 270–330 lines). **PR 2 = H3.** If H3 measures over 400 with `git diff --shortstat`, it splits into H3a (keys, `home-directory.ts` and its tests, test-d, content.contract) and H3b (view, test rewrite, docs). The proposal's guard lines stand: decision needed No, chained PRs Yes, 400-line risk Medium.

**Every slice:**
- `npm run format:check`
- `npm run sync && npm run lint`
- `npm run typecheck`, plus `--prefix tooling/site-browser` in H2
- `npm run test:coverage`, which includes the budget proof
- `npm run build && npm run check:site`
- `npm run test:e2e`
- record the Spanish full-length size and `--shortstat`

**PR tip:**
- `npm run verify`
- `npm run build && npm run check:site && npm run test:e2e && npm run lighthouse`
- the dist diff below
- H3 only: screenshots of both homes at 390 and 1280 px in the PR

**Dist diff.** Build `main` once into scratch. Normalise both trees:
- asset names: `/_astro/ASSET.$1`;
- scoping: strip ` data-astro-cid-\w+`, ` class="astro-\w+"`, the ` astro-\w+` class tokens, `[data-astro-cid-\w+]` and `.astro-\w+`.

Then `diff -r -x '*.js'`.
- **PR 1 tip.** Only these differences are allowed:
  - every page: `:root` gains the three tokens;
  - the 12 catch-all pages: `.home-links{…}` removed;
  - the 2 calculator pages: the old reserve declarations and the two trimmed declarations are replaced by the K10 rule and its media blocks;
  - the 2 homes: the calculator chunk removed.
  
  Anything else fails the gate. This replaces the narrower expectation "only the reserved-block CSS changes", because K1, K3 and K9 touch every page by construction.
- **PR 2 tip versus PR 1 tip:** only `index.html` and `es.html` differ.

## Threat matrix

N/A. The change has no shell, subprocess, Git or PR automation, executable-file classification or process boundary. The new route files are static pages. Every row (documentation-like paths, repository selection, commit state, push state, PR commands) is N/A for that reason.

## Migration / rollout

No URL, data, core or catalog-shape migration; `ROUTES` and the sitemap are unchanged. Revert newest first: PR 2, then PR 1. Reverting PR 1 alone after PR 2 would put the home CSS back into the catch-all chunk.

## Reconciliation with the proposal and specs (for sdd-spec)

| # | Where | Applied |
|---|---|---|
| R1 | `site-routing-i18n` › Calculator pages ("the catch-all renders … every other id as before") | The homes render from `pages/index.astro` and `pages/es.astro` (K1). A delta is needed, although the proposal listed no change here |
| R2 | D4 rationale | Scoping alone leaks the CSS. K1 is the mechanism that makes D4 hold |
| R3 | `calculator-page` › Layout stability | `.calc-copy` keeps its fixed reserve (K11). "Unused reserve under one line" is measured against the tallest content of both locales, in answer lines (K10) |
| R4 | `site-shell` › tokens | The tick primitives are `--tick-weight` plus the rule that tick length equals `--grid-size` |
| R5 | `trust-pages` › Home page | The H1 is catalog copy, not the brand. [TP21] becomes "exactly `CALCULATOR_PAGES` in `ROUTES` order". `page.home.links.concrete` is retired, and [TP26] reads the card keys |

## Open questions (the apply takes the default if unanswered)

1. **Hero H1 copy.** Default: "From measurements to a shopping list" / "De tus medidas a la lista de compras", with `page.home.intro` unchanged below it.
2. **K9 touches every page's markup** (scoping attribute to class). Default: adopt it in H2. Without it, H2 adds about 139 B and ends near 40,973 B, over the 40,960 B budget at full length, unless the sweep allows fewer breakpoints.
