# Apply progress: home-directory

## PR 1 (`feat/home-directory`): H1 and H3a done, H3b not included

Mode: strict TDD (`npm test`). Nothing was pushed. Pushing, CI, the four reviewers, Judgment Day, the PR and the merge belong to the orchestrator (P1.4).

### Commits (oldest first; code only, `openspec/` excluded)

| Slice | Commit | Subject | Changed lines |
|---|---|---|---|
| H1 | a2b65a9 | feat(web): give the home its own route and add the display, grid and tick tokens | 234+ / 27- (261) |
| H3a | d900e03 | feat(web): add the home card keys and the directory data module | 197+ / 6- (203) |

### Forecast vs actual

| Slice | Forecast | Actual | Note |
|---|---|---|---|
| H1 | ~100-130 | 261 | tests (budget 81, static-paths 58, styles 54) and K9 (deviation 1) |
| H3a | ~170-210 | 203 | within forecast |
| PR 1 | ~270-340 | **464** (431+ / 33-, `git diff --shortstat main -- . ':!openspec'`) | over 400 by 64: see deviation 2 |

`openspec/` planning lines on their own line: 9 files, 1,217 insertions (excluded from the count).

### H3b

Not included: the authored sum is 464, already over 400.

### Deviations

1. **K9 (`scopedStyleStrategy: 'class'`) moved from H2 into H1 (owner decision).** The ES full-length proof is an injected route (`zz-budget`) that never carried the 83 B `.home-links` rule, so the three tokens alone took it from 40,836 B to **40,920 B** (84 B over the CP66 pin). With K9 it is **40,770 B** (EN 40,501 B), 66 B under the pin. The real catch-all pages hold by equality of tokens and `.home-links` before K9 (real ES concrete page 34,100 B both ways) and lose 150 B with it. H2 now starts at 40,770 B: its room is 66 B plus the trim rungs (tasks.md note on H2 updated; P1.2 allowance extended). K9 has its own RED-first pin (`CalculatorBody.budget.test.ts`: config strategy and no `data-astro-cid-` on the built concrete and trust pages), seen red on the attribute strategy, green with `'class'`. `Props.id` of the catch-all became `Exclude<PageId, 'home'>`.
2. **PR 1 is 464 changed lines, over the 400 budget.** The two commits are independent work units, so the split is at the commit boundary: PR 1 = H1 (261), a stacked PR 1b = H3a (203). Not taken by apply (the strategy names no PR 1 split rule); the orchestrator decides.
3. **`CalculatorView.test.ts`:** the `home` row of "still renders %s with its own template" was removed (the catch-all no longer renders `home`; [SR23] covers both home route files in `static-paths-page.test.ts`). Edit not in the module map.
4. **`homeCards` has a fourth parameter `copy`** (default: the real catalogs) so [TP30] order is proved with a fixture whose ids have no catalog keys; `directoryOrder` and `exampleOf` are as designed. The real copy reader throws for a non-calculator id (a test covers it).
5. **Built-HTML host (1.3):** the production-pipeline build inside `CalculatorBody.budget.test.ts`, memoised per name (`build('base')`): `npm run verify` runs the tests before `build`, so `dist` does not exist then. Later slices reuse it. The 40,836 pin was green on arrival at the tree without tokens; its red was seen for real at 40,920 B (a stronger proof than the one-byte spot check).
6. **e2e once at the PR tip** (owner rule), not per slice.

### Measurements

| Item | main | PR 1 tip | Limit |
|---|---|---|---|
| ES full-length proof (`CalculatorBody.budget`) | 40,836 B | **40,770 B** (after H1 and at the tip; H3a changes no built page) | 40,836 pin, 40,960 |
| EN full-length proof | 40,567 B | 40,501 B | 40,960 |
| Real ES concrete page | 34,100 B | 33,950 B | 40,960 |
| Real EN concrete page | 32,097 B | 31,947 B | 40,960 |
| Trust pages (about, methodology, ...) | | -150 B each | |
| 404 pages | 6,623 / 6,704 B | 6,557 / 6,638 B (-66 B each) | |
| EN home / ES home HTML | 10,498 / 10,586 B | 7,552 / 7,640 B | 24,576 (TP35) |
| Home inline CSS | 7,399 B | 4,581 B | 20,480 |
| Largest CSS per page | 7,399 B (/index.html) | 7,339 B (/methodology.html) | 20,480 |
| Calculator page weight | 162,888 B | check:site green | 196,608 |
| e2e (Chromium) | 283 | **283 passed** (38.3 s) | |
| Lighthouse (6 pages) | | assertions passed (exit 0) | |

Vitest: 198 files, 3,659 tests at the tip (baseline 196 files, 3,632). `rg -l '\.home-' apps/web/dist` lists `index.html` and `es.html` only. `site-browser` CI baseline wall time: **3 min 12 s** (run 40495578751, the last green run before PR 1).

### Baseline and build records of tasks 1.1 and 1.9

- Astro **7.4.2** (`node_modules/astro/package.json`), unchanged by the PR.
- Concrete client entry (`client-entry.contract`, library build): **39,674 B** of 49,152 B at the tip; the PR touches no client code.
- Inline CSS per page (bytes of each `<style>` element, `dist-main` against the PR 1 tip build; no page links a stylesheet in either):

| Page | main | PR 1 tip |
|---|---|---|
| `concrete-calculator.html` | 888 + 1,026 + 5,485 = 7,399 B | 888 + 1,026 + 5,425 = 7,339 B |
| `es/calculadora-de-concreto.html` | 888 + 1,026 + 5,485 = 7,399 B | 888 + 1,026 + 5,425 = 7,339 B |
| `methodology.html` | 888 + 1,026 + 5,485 = 7,399 B | 888 + 1,026 + 5,425 = 7,339 B |
| `index.html` / `es.html` | 888 + 1,026 + 5,485 = 7,399 B | 888 + 1,026 + 2,667 = 4,581 B |
| `404.html` | 888 + 1,026 + 2,568 = 4,482 B | 888 + 1,026 + 2,592 = 4,506 B |

  The two font-face blocks are 888 B and 1,026 B. The third block is the shared chunk merged with the page's own chunk; the 404 page carries the shared chunk alone (2,568 B on main, 2,592 B at the tip: +84 B of tokens, -60 B of class scoping). Catch-all chunk: **2,917 B** on main (5,485 - 2,568) and **2,833 B** at the tip (5,425 - 2,592), 1 B under the 2,834 B task 1.9 expected.
- Importers (`rg -n "home-links|HomeView" apps tooling`). On main: `pages/[...path].astro` (import and render), `views/HomeView.astro` (the `.home-links` markup and rule), `views/HomeView.test.ts`, `views/CalculatorView.test.ts` (the `home` row with `p.home-links`), `routing/routes.ts` (the recipe comment) and `contract/docs.contract.test.ts` (the AGENTS.md home-link row). At the tip: `pages/index.astro` and `pages/es.astro` (import and render), `views/HomeView.astro`, `views/HomeView.test.ts`, and the K9 comment in `astro.config.mjs`. `tooling/` has none either way.

### Dist diff against `dist-main` (P1.2, normalised: asset names, scoping markup)

Script in the scratch directory. After normalisation, every catalog page that is not a home (concrete EN/ES, trust pages EN/ES, both 404 pages) equals `dist-main` once the three tokens in `:root` and the `.home-links{...}` rule are removed from the comparison: 0 differing files beyond those. The H3a-tip build is byte-identical to the H1-tip build (`diff -r -x '*.js'` empty). Homes: rule sets compared as sorted sets: the calculator chunk's rules are gone (`.calc-*`), `.home-links` and the footer rule remain; nothing else differs. No `link[rel=stylesheet]` gained or lost.

### Scenario ids proven

H1: [SR23] (`static-paths-page.test.ts`: 12 catch-all paths, union 14 with no duplicate, both home files' `lang`, title, canonical, one H1), [SS24] token side, [SS25], [SS26] global-sheet side, [SS28] leak side, [SS29], [SS30] sheet list, [SS32] (config, no stylesheet link, no CSS file, CSS in head), [CP66] pin, K9 pin. H3a: [TP30] (data module, fixture order), [TP32] (`home.test-d.ts`), [TP26] row, `docs.contract` row, coverage entry (100 percent on `lib/home-directory.ts`).

### Negative proofs (each run, then reverted; `git status --porcelain` clean afterwards)

H1: home back in the catch-all paths (2 SR23 cases red); `index.astro` removed (3 red); `--grid-size` renamed (SS25 red); `inlineStylesheets` removed (config pin red); `HomeView` imported back into the catch-all (3 leak cases red naming `.home-`); `scopedStyleStrategy` removed (K9 pin and CP66 pin red); the CP66 pin was red at 40,920 B before K9. H3a: cards sorted alphabetically (4 red); `exampleOf` returning `''` (throw case red); AGENTS.md key sentence cut (docs row red); `page.home.cards.concrete.summary` deleted from `en/site.ts` (typecheck fails naming the key in `packages/i18n`).

### What remains for the orchestrator

Push; CI; four reviewers and Judgment Day on the frozen candidate; decision on deviation 2 (split PR 1 at the commit boundary); PR body from this file. Next apply: PR 2 (H3b + H3c), which starts from a tree where K9 is already on.

## PR 1 correction round

The four lens reviews (spec conformance SC, types and boundaries TB, test quality TQ, maintainability and performance MP) found no blocker. Each finding and what was done, in the commits below (oldest first):

| Commit | Subject |
|---|---|
| 243b7fe | test(web): guard every built page but the homes and read the resolved Astro config |
| 2596a70 | test(web): derive the routing and directory expectations from the route table |
| 66953d5 | refactor(web): type the home cards by their page id and check each pageless card key |
| 82cc961 | test(web): scan every radius property and keep one sheet-list assertion |

| Finding | What was done |
|---|---|
| SC-leak-scan-covers-three-pages-not-every-page, TQ-leak-guard-samples-three-pages | `CalculatorBody.budget.test.ts` globs `**/*.html` of the production build minus `index.html`, `es.html` and `zz-budget/*`; the leak, SS32 and K9 guards run over that list, both 404 pages included (a test asserts they are in it). The literal list is gone. Negative proof: a global `.home-x` rule in `NotFoundView.astro` fails the leak guard naming `404.html`. |
| TQ suggestion: positive control | `index.html` and `es.html` each carry `.home-`. |
| TQ-inline-css-config-pin-is-text-only | The test imports `apps/web/astro.config.mjs` (as `astro-config.contract` does) and asserts `build.inlineStylesheets === 'always'` and `scopedStyleStrategy === 'class'`; the source regexes are gone. Negative proof: `'auto'` fails it. |
| TQ-build-memo-ignores-extra | The memo stores `extra` and throws when a name is reused with another `extra`. |
| TQ/MP-static-paths-literal-counts | The 12 and 14 pins are dropped: the `toEqual` against `staticPaths()` minus the homes and the sorted-set equality of the union already prove them, and `end-state.contract` stays the only pinned count. |
| TQ suggestion: weakened first test | Dropped: the [SR23] `toEqual` test subsumes it. |
| TQ-non-calculator-throw-matches-one-letter | `toThrow(new Error('b is not a calculator page'))`. Negative proof: another message fails it. |
| MP-real-card-golden-unnamed | The real cards are matched with `toContainEqual` and their ids against `directoryOrder(ROUTES, CALCULATOR_PAGES)`; the real order test checks it is `CALCULATOR_PAGES` in route table order. A second routed calculator needs no edit to this file. |
| SC/TB-homecard-id-widened-to-string | `HomeCard<Id extends string = CalculatorPageId>`, `CardCopy<Id>`, `directoryOrder<Id>` and `homeCards` overloads (the `pathOf` pattern): `homeCards(locale)` yields `HomeCard<CalculatorPageId>[]`, a fixture yields its own ids, no cast. `directoryOrder` filters `pages` per route key, so it needs no type guard either. Pinned in `home.test-d.ts` (red first: `HomeCard` was not generic). No deviation to record: the design's `id: CalculatorPageId` holds. |
| TB-test-d-negative-case-needs-both-keys | `home.test-d.ts` has one `@ts-expect-error` case for `.title` and one for `.summary`. |
| TB suggestion via content.contract | `content.contract` checks `page.home.cards.<id>.summary` absent for every `PAGELESS` id, as it does `title`. |
| TB-messages-type-from-calculator-controller | `lib/pages.ts` re-exports `Messages`; `lib/home-directory.ts` imports nothing from `calculator/`. |
| SC-radius-scan-source-sheets-only (partly), TQ suggestion: radius long-hands | The square-corner scan matches `/[\w-]*radius\s*:/`, long-hands included. Negative proof: `border-top-left-radius: 4px` in `base.css` fails it. The scoped `<style>` blocks of the shell components are not scanned by a test: left as it was, because the tasks split [SS26] into this global-sheet test, the home view style tests of H3b and H3c, and the manual `rg border-radius` over source and `dist` (task 1.8). That `rg` finds no `radius` in any `.astro`, `.css` or built `.html` file at the tip. |
| MP-three-sheets-asserted-twice | The dark-theme test no longer lists the sheets; the [SS30] test owns it. |
| SC-ticked-tasks-1-1-and-1-9-records-missing | Written above: Astro version, entry size, per-page inline CSS before and after, the catch-all chunk, the importer list and the `site-browser` baseline wall time. |
| TQ suggestion: `content.contract` links-key tie | Not changed: H3b replaces `page.home.links.concrete` with the cards, so the tie is handled there. |
| TB-catch-all-exclusion-runtime-only | Not changed: the runtime filter through `templateOf` is design K1. |

CP66 after the round: Spanish full-length proof **40,770 B** of 40,836 B (EN 40,501 B); the built pages are unchanged (the round touches tests and types only).
Vitest after the round: 198 files, 3,662 tests (`npm run verify` exit 0, which ends `build`, `check:site`, `check:dist`).

Push; CI; four reviewers and Judgment Day on the frozen candidate; decision on deviation 2 (split PR 1 at the commit boundary); PR body from this file; `site-browser` CI wall time. Next apply: PR 2 (H3b + H3c), which starts from a tree where K9 is already on.

---

## PR 2 (`feat/home-directory-p2-hero-and-cards`, from `feat/home-directory-p1b-cards` at 7958a05 after two rebases, see deviation 1): H3b and H3c

Mode: strict TDD (`npm test`). Nothing was pushed.

### Baseline (3.1)

Branch created from the PR 1b tip (then `bc54012`); `npm ci` (root and `tooling/site-browser`) and the Chromium shell installed in the worktree. Build at the tip copied to `<worktree>/../dist-p1b` for the P2.2 dist diff. EN home 7,552 B, ES home 7,640 B (the ES home file is `dist/es.html`, not `dist/es/index.html`: the route is `/es`). Safety net before touching the views and styles: `npx vitest run apps/web/src/views apps/web/src/styles` 166 passed.

### Guard ledger of `HomeView.test.ts` (3.2; written before the rewrite)

| Current assertion | Fate | Reason |
|---|---|---|
| whole document, `lang`, title, canonical (en, es) | kept | unchanged |
| one h1, in `main`, text `Maestro Calc` | replaced | the text is now `page.home.heading` read from the catalog; one h1 and in `main` kept |
| language switch points at the other home | kept | unchanged |
| [TP7] `main a[href]` `.slice(1)` equals methodology and about | replaced | the `main` links outside the list (`.home-links a`) equal them, so no positional slice; hrefs and labels kept |
| [TP21] first link is the concrete link inside the first `p` (`links.concrete`) | replaced | one `li` per `directoryOrder(ROUTES, CALCULATOR_PAGES)` id, in order, each with exactly one `a[href]` equal to `pathOf(id, locale)` and the title as text; `links.concrete` is retired |
| [TP21] names no other calculator (rectangle, rectángulo, roofing, techado, paint, pintura) | generalised | `calc.<id>.title` of every `PAGELESS` id in both locales, plus the same words, plus `square footage` and `pies cuadrados` [TP31] |
| [TP8] tagline verbatim in the first paragraph | kept | the hero paragraph equals `page.home.intro` and starts with `site.tagline` [TP29] |
| [TP8] paragraph equals `intro + links.concrete` | dropped | the concrete link moved to the card; the equality is now "the hero paragraph equals `page.home.intro`" |
| nothing "still being built" | kept | unchanged |
| exactly 2 `<p>`, no `ul`/`ol` | dropped | the directory is a list by design; upcoming calculators are excluded by the equality with `directoryOrder`, the `PAGELESS` names absent and `FORBIDDEN` |
| no promise or claim in `main` | kept | unchanged |
| `FORBIDDEN` absent from every `page.home.*` value | kept | now covers the card keys too (the count floor rises) |
| JSON-LD graph, one `script`; NotFound has none | kept | D7; the single `script` also proves zero JavaScript |
| (new) no `→ › »` in `main`; no `text-transform`, `border-radius`, `transition`, `animation` in the view style | added | [SS26] |

### H3b: hero band and view skeleton (commit `f9aeace`)

`feat(web): add the home hero and render the directory skeleton`: 7 files, 312 insertions and 72 deletions = **384** changed lines against the PR 1b tip `7958a05` (forecast 190-230; see deviations). The H3b RED order was 3.2 `HomeView.test.ts` (6 red for the right reasons: hero, list, links), 3.3 the two `styles.contract` tests (red: `--text-display` unread, no grid line to mix), 3.4 `home.spec.ts` (8 tests: 6 red on the missing hero, 2 green on arrival), 3.5 the built-home contract in `CalculatorBody.budget.test.ts` (red on the hero match), then GREEN 3.6 and 3.7. The grid-size assertion first failed against my own test, not the code: the computed `background-size` of two gradient layers is `16px 16px, 16px 16px`; the test now expects the cell per layer.

Tasks 3.1-3.8 and 3.11 done. 3.9: the full e2e suite was run once at the PR tip (below), not at the slice tip (owner rule).

#### Deviations (H3b)

1. **The PR 1b branch moved twice while this apply ran, and its history was rewritten.** The apply started from `bc54012`. The branch then held two review-correction test commits (`243b7fe`, `2596a70`), and was finally rewritten to `7958a05` (the same commits under new hashes, plus `c1a676e` typing the cards by page id and `1d65647` scanning every radius property). The H3b commit was rebased onto each tip. The first rebase had one conflict in `CalculatorBody.budget.test.ts`: the corrected file already holds the positive `.home-` control on the homes and the leak guard over every built page but the homes (`HOMES`, `builtPage`, `pagesWithoutHome`), so the conflict was resolved by taking that file and adding only the home-specific describe (hero and gradient, JSON-LD only, no `on*`, no pageless name, 24,576 B), which uses those helpers. The second rebase had no code conflict, only this file. Every size and gate below was re-measured on the final base `7958a05`. If the branch moves again, rebase with `git rebase --onto <new tip> 7958a05 feat/home-directory-p2-hero-and-cards` (and the same for `feat/home-directory-p2b-cards`).
2. **The ES home file is `dist/es.html`**, not `dist/es/index.html` (the route is `/es`); the contract reads `index.html` and `es.html`.
3. **H3b is 384 lines against a forecast of 190-230.** `home.spec.ts` is 85 and the `HomeView.test.ts` rewrite 173 (112 added, 61 removed); the budget test needed only 30 after the rebase. The slice stays under 400 only after merging the built-home assertions into one parameterised case, so H3c cannot join: **task 4.7 fires and H3c is its own PR** (`feat/home-directory-p2b-cards`, from the H3b tip).
4. **`HomeView.test.ts` pins the heading copy** ("From measurements to a shopping list" / "De tus medidas a la lista de compras") as its own case, because reading the heading from the catalog alone is green before the reword.

#### Measurements at the H3b tip (the PR 2 tip)

| Item | PR 1b tip | H3b tip | Limit |
|---|---|---|---|
| EN home / ES home HTML | 7,552 / 7,640 B | **8,705 / 8,791 B** | 24,576 (TP35) |
| Home inline CSS | 4,581 B | 5,546 B | 20,480 |
| ES full-length proof | 40,770 B | **40,770 B** (66 B headroom) | 40,836 pin |
| EN full-length proof | 40,501 B | 40,501 B | 40,960 |
| Largest CSS per page | 7,339 B (`/methodology.html`) | 7,339 B | 20,480 |
| Largest HTML per page | 33,950 B (ES concrete) | 33,950 B | 40,960 |
| Vitest | 198 files, 3,662 tests | 198 files, 3,666 tests | |
| e2e (Chromium) | 283 | **291 passed** (283 + 8 `home.spec.ts`; 46 s) | |
| Lighthouse (6 pages) | assertions passed | assertions passed (exit 0) | 0.95 / CLS 0.01 |

`npm run verify` green at the tip (40 s wall). `git diff --stat feat/home-directory-p1b-cards -- packages` lists only `packages/i18n/src/catalogs/{en,es}/site.ts` (2 insertions, 4 deletions); the CI and stryker paths are unchanged. `rg "links.concrete" apps packages` is empty.

#### Dist diff against the PR 1b tip build (P2.2, normalised: asset names, scoping markup)

`diff -r -x '*.js'` of the two normalised trees lists exactly `index.html` and `es.html`; every other file (calculator and trust pages, both 404 pages, `_astro` fonts, sitemap, robots, `_headers`) is byte-identical.

#### Scenario ids proven (H3b)

[TP7], [TP8], [TP21] (unit, order and link), [TP29], [TP31] (unit and built HTML), [TP33] (partial), [TP34] (script scan on the built HTML, request log in `home.spec.ts`), [TP35] (measured above), [SS24] (use scan and computed sizes; the use scan reads the sources, `apps/web/src/**/*.{astro,css,ts}` without tests, as task 3.3 asked, which is narrower than the spec's built-CSS wording), [SS26] (view style), [SS27], [SS28] home side (hero and gradient), [SS31] (unit; axe 0 violations on `/` and `/es` in the a11y suite), JSON-LD guard kept (D7).

#### Negative proofs (H3b; each run, then reverted; `git status --porcelain` clean afterwards)

Hard-coded card href in the view (1 red, the directory case); `border-radius: 4px` in the view style (1 red, SS26); `var(--text-display)` appended to `base.css` (1 red, SS24 use scan); grid line mix raised from 12% to 90% (1 red, SS31); `home-hero` renamed in the view (the budget contract: 2 red, one per home; `home.spec.ts`: the 6 hero cases red); a `<script>` added to the view (`requests no script`: red on both homes, which also spot-checks that case, green on arrival).

#### PR 2 tip checks (P2.1-P2.3)

`git log feat/home-directory-p1b-cards..HEAD` lists H3b and this record only. The authored `--shortstat feat/home-directory-p1b-cards -- . ':!openspec'` is 384 changed lines (7 files). The `site-browser` CI wall time is not measurable locally (CI only). Pushing, CI, the four reviewers, Judgment Day, the PR and the merge (P2.4) belong to the orchestrator; the split rule moved H3c to `feat/home-directory-p2b-cards` (tasks 4.1-4.10 and a second tip check), so PR 2 is H3b alone.

---

## PR 2b (`feat/home-directory-p2b-cards`, from the H3b tip `618ac91`): H3c cards

The split rule of task 4.7 fired (H3b alone is 384 lines; with H3c the authored sum is 490 against the PR 1b tip). H3c is its own PR, stacked on PR 2; H2 stays PR 3 (the tasks file names it PR 4 after a split; the orchestrator keeps the numbering). There is no `state.yaml` in this change, so there was nothing to update there.

### H3c: cards (commit `63a14c6`)

`feat(web): render the calculator cards on the home`: 4 files, 113 insertions and 5 deletions = **118** changed lines against the H3b tip (forecast 190-210: the H3b skeleton had already added the list, the title link and the 44 px target, so H3c is the summary and example lines, the card CSS and the card proofs). H3b + H3c against `7958a05`: 490.

RED order: 4.1 the card-structure case in `HomeView.test.ts` (2 red: summary and example missing); 4.2 the built-home assertions (first written as `.home-card`, which already matched `.home-cards`, so it was green on arrival: tightened to `/\.home-card(?![\w-])/`, then red on both homes); 4.3 the `home.spec.ts` card case (green on arrival: the H3b skeleton already links each card title with `.tap-target`, 44 px tall, and has no overflow). GREEN 4.4.

#### Deviations (H3c)

1. **The overflow proof was blind on the phone profile.** The first version of the 4.3 case compared `scrollWidth` with `window.innerWidth`. On the `phone` project (`isMobile`), wide content makes `innerWidth` grow to fit it, so a `min-width: 30rem` grid at 320 px still passed (negative proof D, 10 passed). Both overflow checks of `home.spec.ts` (the H3b hero at 320 px and the H3c card case) now compare `scrollWidth` with the width the test sets; the same proof then fails for the right reason (4 red) and the unmutated tree is green. **Finding, not fixed (outside this change):** `smoke.spec.ts` "fits the phone width" has the same `innerWidth` comparison and is blind to overflow on the same profile.
2. The card summary and example reuse `homeCards`; the view only renders. No new key and no catalog edit in H3c.

#### Measurements at the PR 2b tip

| Item | H3b tip | H3c tip | Limit |
|---|---|---|---|
| EN home / ES home HTML | 8,705 / 8,791 B | **9,708 / 9,818 B** | 24,576 (TP35) |
| Home inline CSS | 5,546 B | **6,375 B** | 20,480 |
| ES full-length proof | 40,770 B | **40,770 B** (66 B headroom) | 40,836 pin |
| EN full-length proof | 40,501 B | 40,501 B | 40,960 |
| Largest CSS per page | 7,339 B (`/methodology.html`) | 7,339 B | 20,480 |
| Largest HTML per page | 33,950 B (ES concrete) | 33,950 B | 40,960 |
| Vitest | 198 files, 3,666 tests | 198 files, 3,668 tests | |
| e2e (Chromium) | 291 | **293 passed** (283 + 10 `home.spec.ts`; 42 s) | |
| Lighthouse (6 pages, both homes included) | assertions passed | assertions passed (exit 0); accessibility, best practices, SEO and performance 1.00 and CLS 0 on `/` and `/es` | 0.95 / CLS 0.01 |

`npm run verify` green at the tip (38 s wall). Axe: 0 violations on `/` and `/es` in the a11y suite (card summary and example pass `color-contrast`). `git diff --stat 7958a05 -- packages` lists only `packages/i18n/src/catalogs/{en,es}/site.ts` (2 insertions, 4 deletions, all H3b); the CI and stryker paths are unchanged. `git log --format=%B 7958a05..HEAD | rg -i 'co-authored|claude|anthropic|generated with'` is empty.

#### Dist diff of the PR 2b tip against the PR 2 tip build (normalised)

`diff -r -x '*.js'` lists exactly `index.html` and `es.html`. The PR 2 tip against the PR 1b tip build (`7958a05`) lists the same two files.

#### Scenario ids proven (H3c)

[TP21] built (card targets equal the route paths of `CALCULATOR_PAGES` per locale; corrected below: at `63a14c6` the built check was the item count and the first `a` of each item only, and "no other calculator link" was a unit proof), [TP28] (unit: `ul[role=list]`, item count, the first card's title link, summary, example and one link; corrected below: the built HTML held only the item count and the first href until the correction round), [TP30] on the view (real tables, order), [TP33] (every card link before methodology, then about), [TP34], [TP35] (9,708 / 9,818 B), [TP36] (axe 0, Lighthouse), [TP37] (320, 390, 1280 px, 44 by 44 links), [SS26] (card style: no `box-shadow`, radius, `text-transform`, transition, animation; corrected below: `transform` itself was added in the correction round), [SS28] home side (the `.home-card` rule on both homes, on no other page), [SS30] (largest CSS 7,339 B).

#### Screenshots (4.8)

Built site, saved to the scratchpad directory of this session: `home-en-390.png`, `home-en-1280.png`, `home-es-390.png`, `home-es-1280.png`.

#### Negative proofs (H3c; each run, then reverted; `git status --porcelain` clean afterwards)

A second link inside the card summary (4 red: one-link and structure); an arrow glyph after the summary (4 red: glyph guard); a global `.home-card` rule appended to `base.css` (1 red: leak guard, naming the page); the card link forced to 20 px tall (2 red: TP37, both homes); `min-width: 30rem` on the grid (4 red after deviation 1: TP37 at 320 px and the H3b hero overflow case; green before the fix, which is how the blind spot was found).

### PR 2 and PR 2b group tasks

Tip checks, dist diffs, `npm run verify`, `npm run build && npm run check:site && npm run test:e2e && npm run lighthouse`, the ES full-length proof (40,770 B, 66 B under the 40,836 pin) and the home bytes are recorded above for both tips. The `site-browser` CI wall time is CI only. **P2.4 (GX1-GX6: CI, the four reviewers, Judgment Day, the PR bodies with their Chain Context, the merge) belongs to the orchestrator.** PR body inputs: the guard ledger and the H3b section above (PR 2); this section, the forecast versus actual (H3b 190-230 forecast, 384 actual; H3c 190-210 forecast, 118 actual), the screenshots and the Lighthouse and axe results (PR 2b). Rollback: revert PR 2b alone (card markup, card CSS, card tests, `home.spec.ts` card case), then PR 2 (the hero, the heading reword and the `links.concrete` removal come back as one unit).

---

## PR 2 correction round (`feat/home-directory-p2b-cards`, from `fe83905`)

Two lens reviews of the PR 2 and PR 2b tip found no blocker (spec and tests: ST; design, accessibility and bytes: DA). Strict TDD: each widened guard was shown red by a negative proof, then reverted. Tests and docs only: the build of the round's tip is byte-identical to the `fe83905` build (`diff -r` of the two `dist` trees, homes included, prints nothing).

| Finding | What was done | Commit |
|---|---|---|
| ST-literal-routed-set-pin | `HomeView.test.ts` reads the routed set from `directoryOrder(ROUTES, CALCULATOR_PAGES)` with a `> 0` non-vacuity floor; the literal `['concrete']` is gone | `81df1f5` |
| DA-pageless-words-break-go-live, ST-tp31-pageless-lookup-fragile | New test support `apps/web/src/__testing__/pageless-titles.ts`: `calc.<id>.title` of every `PAGELESS` id in both locales, read from `packages/i18n/src/catalogs/<locale>/<id>.ts` with no cast, throwing naming the key and the locale when the module or the key is missing; empty (so the checks hold vacuously) when `PAGELESS` is empty, with no count floor. `HomeView.test.ts` and `CalculatorBody.budget.test.ts` use it; `rectangle`, `rectángulo`, `square footage` and `pies cuadrados` are removed. Negative proof: `Rectangle Area` in the card heading (4 red: both units, both built homes) | `81df1f5` |
| ST-tp28-first-card-only | The [TP28] unit case loops over `homeCards(locale)` and checks each card with its own `page.home.cards.<id>.*` and `calc.<id>.page.example` keys | `81df1f5` |
| ST-built-tp21-tp28-overclaimed | On both built homes: one `ul[role=list]` in `main`, one `li` per routed card in route table order, exactly one link per card which is the `h2 > a` title link with href `pathOf(id, locale)` and the catalog title, then the summary and the example from the catalogs; the calculator paths linked from `main a[href]` equal the card hrefs ([TP21]). Negative proofs: a second link in the summary (2 red), a concrete link in `.home-links` (2 red), `role="list"` removed (2 red), example before summary (2 red). The H3c record above is corrected where it claimed these on the build | `ad16ddc` |
| ST-arrow-glyph-set-narrow | The glyph guard is the Unicode arrow blocks `U+2190-21FF`, `U+27F0-27FF`, `U+2900-297F` plus `›` and `»`, on the rendered text and on every `content:` value of the view style with CSS escapes decoded; a unit case pins the range. Negative proofs: `⇒` after the summary (4 red), `content: '\2192'` (1 red) | `1b961d0` |
| ST-records-overstate-ss24-ss26 | SS26: the card-style case also forbids `transform` (negative proof: 1 red). Hero: no `h2` to `h6` (negative proof: an `h4`, 2 red). SS24: recorded as a source scan (above), as task 3.3 asked; it is narrower than the spec's built-CSS wording | `1b961d0`, this record |
| DA-tick-overshoots-wrapped-h1 | Design call, no CSS change: K7 now says the dimension line spans the heading box (the heading line on a single-line heading, the column on a wrapped one), the owner-accepted behaviour, decided by the orchestrator on 2026-10-27 | this record |
| DA-lonely-card-1280 | Follow-up, no change: one card in three `auto-fill` tracks at 1280 px is transient until Square footage ships | — |
| DA-links-footer-gap | Follow-up, no change: the ~110-130 px between the home links and the footer is pre-existing, from the footer margin (plus the `main` padding and the tap-target line) | — |

Left as it was: `roofing`, `techado`, `paint` and `pintura` stay in the [TP31] unit word list (they name no calculator of the registry, so no go-live turns them red); `smoke.spec.ts` "fits the phone width" keeps its blind `innerWidth` comparison (H3c deviation 1, outside this change).

Measurements at the round's tip: EN home 9,708 B, ES home 9,818 B (of 24,576 B); ES full-length proof 40,770 B (of the 40,836 B pin), EN 40,501 B; largest HTML 33,950 B (ES concrete), largest CSS 7,339 B (`/methodology.html`). `npm run verify` exit 0: Vitest 199 files, 3,679 tests. `npm run build && npm run test:e2e`: 293 passed.

---

## PR 3 (`feat/home-directory-p3-reserves`, H2)

Commits: `dda2486` (CP65 body style forwarding, CP63 entry contract), `3db6dda` (shell styles global), `1339949` (K10 reserves per breakpoint, trims, layout spec). Authored `--shortstat origin/main..HEAD`: 11 files, +502 / −76.

### Sweep result (5.2) and K10

The sweep raw output was not kept in the repository; its result is pinned in `STEPS` of `styles.contract.test.ts` and in the edges of `WIDTHS` in `layout.spec.ts`:

| Block | Fallback (narrowest) | Steps (min-width → lines) |
|---|---|---|
| answer (`--answer-lines`, h3 line) | 5 | 24.125rem → 4, 30.0625rem → 3, 45.625rem → 2 |
| notice (`--notice-lines`, body line) | 6 | 22.25rem → 5, 29rem → 4, 41.6875rem → 3 |

The notice needs its own count (K10 decision): its steps fall at other widths than the answer's. Six `@media (min-width: …rem) { :root { … } }` blocks; `.calc-copy` keeps `min-height: 5rem`.

### Size gate (5.9) and deviation

With the six blocks and rungs 1–3 (shared flex rule, shared control rule, shared `.calc-error, .calc-help`), the ES full-length proof measured **40,966 B**, 130 B over the 40,836 B pin. Rung 4 (merging adjacent ranges) cannot apply: no two adjacent steps can share a width without leaving a line or more unused at the narrower edge. Following the owner rule (trim markup before touching a budget), **deviation**: `SiteHeader`, `SiteFooter` and `Wordmark` styles became `is:global` with explicit selectors (`.site-header nav`, `.site-header ul`, `.site-footer ul`), so no shell element carries an `astro-*` class. Measured saving: −393 B. Result: **ES 40,573 B** (263 B under the pin), EN 40,304 B. Consequence for P3.2: the dist diff touches every page (the shell markup and its CSS), not only the two calculator pages.

### Measurements (5.11)

`npm run verify` exit 0. `npm run check:site` exit 0 (largest CSS 7,484 B `/methodology.html`; calculator JS 38,778 B; largest calculator page weight 162,541 B). `npm run test:e2e`: **324 passed**. `npm run lighthouse`: 6 URLs, every category 1.0, CLS 0 on both concrete pages. Built HTML: `/` 9,315 B, `/es` 9,425 B, `/concrete-calculator` 31,750 B, `/es/calculadora-de-concreto` 33,753 B. Source sheets: base 1,655 B, calculator 4,449 B, tokens 1,257 B.

### Negative proofs (5.12, run and reverted)

`min-height: 10.75rem` back on `.calc-answer`: the layout spec fails (`answer en at 386 px: unused reserve`) and the formula pin fails. The other proofs of 5.12 were not run in this session.
