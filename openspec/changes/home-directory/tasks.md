# Tasks: Home Directory — the Home as a Calculator Directory with the Blueprint Identity

Change: `home-directory` · Inputs: `proposal.md` (D1–D8), `design.md` (K1–K15, the five-slice plan in "Review units and gates" is authoritative), `design-review.md` (verdict APPROVE WITH CHANGES, M-1..M-5 and m-6..m-12 reconciled), 4 delta specs under `specs/` (`trust-pages` TP28–TP37 plus kept TP7, TP8, TP21 · `site-shell` SS24–SS32 plus kept SS5–SS7 · `calculator-page` CP59–CP66 plus kept CP44, CP58 · `site-routing-i18n` SR23 plus kept SR17, SR18) · Mode: strict TDD (`npm test`), artifact store `openspec`, delivery `auto-chain`, chain `stacked-to-main`, one PR per group (owner rule), work-unit commits per slice.

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~820–980 authored in total (`git diff --shortstat`, insertions plus deletions; renames count only edited lines; `package-lock.json` files excluded; the `openspec/` planning artifacts excluded and reported on their own line) |
| 400-line budget risk | Medium. PR 2 (H3b + H3c, about 380–440) is the one at the cap, with a named split; H3b alone, H3c alone and H2 sit near 200 |
| Chained PRs recommended | Yes (3 group PRs, 4 if the PR 2 split rule fires) |
| Suggested split | PR 1 = H1 + H3a (~270–340) → PR 2 = H3b + H3c (~380–440) → PR 3 = H2 (~170–200) |
| Delivery strategy | auto-chain |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: Medium

Per-slice forecast: H1 ~100–130 · H3a ~170–210 · H3b ~190–230 · H3c ~190–210 · H2 ~170–200.
Per-PR forecast: PR 1 ~270–340 (H1 + H3a; H3b joins only if the measured `--shortstat` of H1 + H3a + H3b stays under 400, which the forecast does not expect) · PR 2 ~380–440 (H3b + H3c) · PR 3 ~170–200 (H2).

Split rules (no decision needed, applied by measurement):
- PR 1: if the measured H1 + H3a is under ~190 lines, H3b may join it; otherwise it stays in PR 2.
- PR 2: if the measured H3b + H3c passes 400, H3c becomes a PR of its own (PR 3) and H2 moves one PR later (PR 4). The slices do not change.
- A slice that alone passes 400 is split at its last RED/GREEN boundary and `state.yaml` is updated; an exception is never requested.

At-risk items and where the cut goes: H3b (the `HomeView.test.ts` rewrite is the bulk; the kept-guard ledger of 3.1 is test code that may not grow beyond the table in `design.md`) · H3c (the card scenarios of 4.1 and `home.spec.ts` of 4.3; the e2e file may move to its own commit inside the slice) · H2 (the trim rungs are taken only when the measured size demands them).

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| H1 | Home route files, catch-all minus `home`, `inlineStylesheets: 'always'`, the three tokens, leak guard | PR 1 | `npm test -- apps/web/src/routing apps/web/src/styles apps/web/src/components/calculator/CalculatorBody.budget` | `npm run build && npm run check:site && npm run test:e2e` | `pages/index.astro`, `pages/es.astro`, the catch-all edit, `astro.config.mjs`, `tokens.css` and their tests |
| H3a | Card keys EN/ES, `home-directory.ts`, `home.test-d.ts`, `content.contract` row, AGENTS.md step 14 with its `docs.contract` row | PR 1 | `npm test -- apps/web/src/lib/home-directory apps/web/src/contract/content apps/web/src/contract/docs && npm run typecheck` | `npm run build` (the dist is unchanged) | `home-directory.ts` and its test, `home.test-d.ts`, the two `site.ts` additions, one AGENTS.md sentence |
| H3b | Hero band, view skeleton, `HomeView.test.ts` rewrite | PR 2 | `npm test -- apps/web/src/views apps/web/src/styles` | `npm run build && npm run check:site && npm run test:e2e` | `HomeView.astro`, `HomeView.test.ts`, the two heading keys, `home.spec.ts` hero part |
| H3c | Cards, card CSS, card tests, hit-area and overflow proofs | PR 2 | `npm test -- apps/web/src/views` and the built-HTML contract | `npm run build && npm run check:site && npm run test:e2e && npm run lighthouse` | the card markup and CSS in `HomeView.astro`, the card tests, `home.spec.ts` card part |
| H2 | `scopedStyleStrategy: 'class'`, reserves per breakpoint, trims, layout widths, CP65 fixture test | PR 3 | `npm test -- apps/web/src/styles apps/web/src/components/calculator` | `npm run build && npm run check:site && npm run test:e2e && npm run lighthouse` | `calculator.css`, `astro.config.mjs`, `styles.contract.test.ts`, `layout.spec.ts`, `CalculatorBody.override.test.ts` (PR 3 reverts alone) |

## Conventions (apply to every slice)

**Branches and stacking.** PR 1 is the existing branch `feat/home-directory` (it carries the openspec planning commits; those lines are excluded from the budget count and listed on their own line). PR 2 is `feat/home-directory-p2-hero-and-cards`, created from the PR 1 tip and retargeted onto `main` after PR 1 merges; PR 3 is `feat/home-directory-p3-reserves`, created from the PR 2 tip and retargeted the same way. A child diff never includes parent changes (chained-pr rule: a polluted diff is a base bug). The first task of each group says so. If the PR 2 split rule fires, the extra branch is `feat/home-directory-p3-cards` and H2 becomes `feat/home-directory-p4-reserves`.

**Commits (work-unit commits).** Each slice is one or more commits; tests ship with the code that proves them (a RED test may be committed with its GREEN code). Conventional Commits only, no `Co-Authored-By`, no AI attribution; every commit leaves the tree green. Subjects are the design's "Review units" subjects:
- H1 `feat(web): give the home its own route and add the display, grid and tick tokens`
- H3a `feat(web): add the home card keys and the directory data module`
- H3b `feat(web): add the home hero and render the directory skeleton`
- H3c `feat(web): render the calculator cards on the home`
- H2 `fix(web): size the answer and notice reserves per breakpoint`

**Strict TDD loop.** RED (a failing test, seen failing for the right reason) → GREEN (smallest code) → REFACTOR (the four commands: `npm run format`, `npm run sync && npm run lint`, `npm run typecheck`, `npm run test:coverage`). Tags `[RED]`, `[GREEN]`, `[REFACTOR]`. A test that is green on arrival says so and requires a break-the-code spot check (run it, see it fail, revert). Test names cite the scenario id (`// spec: trust-pages › [TP28]`). Negative proofs are run and reverted; `git status --porcelain` is clean afterwards.

**Built-HTML assertions.** Several scenarios are "a contract test over the build" (SS28, SS29, SS32, TP21, TP28, TP31, TP34, TP35 on the built pages). Task 1.3 reads how `CalculatorBody.budget.test.ts` obtains built HTML and the rules of `apps/web/src/site-check`, records the host it picks for these assertions in `apply-progress.md`, and every later slice reuses that host and one helper. A test that needs `dist` fails with a named message when `dist` is missing; it does not skip.

**Measurements are recorded, not assumed.** Every size in `design.md` is a forecast. Each slice records the measured value in `apply-progress.md`: ES concrete full-length bytes (`CalculatorBody.budget.test.ts` print), EN and ES home HTML bytes, home inline CSS, largest CSS per page, and `git diff --shortstat`.

**Size measurement.** `git diff --shortstat <previous slice tip>..HEAD -M -- . ':(exclude)package-lock.json' ':(exclude)tooling/site-browser/package-lock.json' ':(exclude)openspec/'` (insertions plus deletions). Over 400 for a PR: apply the split rules above.

**Slice gates (run before the slice's last commit).**
- `npm run format:check`
- `npm run sync && npm run lint`
- `npm run typecheck`, plus `npm run typecheck --prefix tooling/site-browser` in H3b, H3c and H2 (and in any slice that touches `tooling/`)
- `npm run test:coverage` (includes the budget proof; 100 percent on `apps/web/src/lib/home-directory.ts` from H3a, entry in the root `vitest.config.ts` after `coverage.contract.test.ts`)
- `npm run build && npm run check:site`
- `npm run test:e2e` (283 tests at the baseline; H3b, H3c and H2 add tests: record the count each time)
- the ES concrete full-length size recorded (must stay at most 40,836 B, [CP66]) and the shortstat recorded.

**Group rules (main stays green, the URL set does not change).**
- Every PR tip leaves `main` green: `npm run verify` and the browser job pass.
- No change to `packages/core`, `packages/data` or the `packages/i18n` tests or catalog shapes. Proof, run at every PR tip and recorded: `git diff --stat main -- packages/` lists only `packages/i18n/src/catalogs/en/site.ts` and `packages/i18n/src/catalogs/es/site.ts` (empty at the PR 3 tip, which adds no key; against the previous PR tip while its PR is open). `git diff --stat main -- .github/workflows/ci.yml 'packages/*/stryker.config.mjs'` is empty. SX4 (mutation) is therefore N/A for every slice and is not repeated below.
- `ROUTES`, `staticPaths()` (14), the sitemap (14 `<loc>`), the pinned counts of `end-state.contract.test.ts` and the URL set do not change at any tip; `end-state.contract.test.ts` stays unedited.
- Budgets never rise (D8): HTML 40,960 B, CSS 20,480 B per page, home JavaScript 0, four woff2. [CP66]: the ES full-length proof is at most 40,836 B at every PR tip. [TP35]: each home at most 24,576 B.
- Rollback: revert the PR merge commits newest first (PR 3, then PR 2, then PR 1). PR 3 reverts alone; reverting PR 1 alone after PR 2 would put the home CSS back into the catch-all chunk on every page.

### Standard Exit Criteria per slice (SX)

- [ ] SX1 Slice gates green in the order above (100 percent coverage where required).
- [ ] SX2 Size: the shortstat is recorded and the PR running total is on track for 400; renames show as renames; actual vs forecast is recorded in `apply-progress.md`.
- [ ] SX3 Commits: each subject is a conventional commit and the tree is green at each commit.
- [ ] SX4 Mutation: N/A for the whole change (`packages/core` and `packages/data` untouched; stated once here).
- [ ] SX5 Traceability: `apply-progress.md` lists the scenario ids proven and each negative proof run and reverted (`git status --porcelain` clean), and the measured sizes of the slice.

### Group Exit Criteria (GX): once per PR, before merge

- [ ] GX1 `npm run verify` green on the PR tip; CI green (`verify`, `mutation` matrix and `mutation-gate`, `site-browser`).
- [ ] GX2 History hygiene: `git log main..HEAD --format=%B | rg -i 'co-authored|claude|anthropic|generated with'` returns nothing.
- [ ] GX3 Four specialized reviewers on the frozen candidate (after `npm run format`): spec conformance, types and package boundaries, test quality, maintainability and performance. All three PRs ship production code, so four lenses apply to each. Only candidate-caused blocking findings gate.
- [ ] GX4 Judgment Day (two judges); at most one scoped correction transaction, then GX1 again on the corrected tree.
- [ ] GX5 PR opened against `main` (the stacked base retargeted after the parent merges) with the body contents listed in the group's exit task and a Chain Context section (dependency diagram marking the current PR, start state, end state, prior dependencies, follow-ups, out of scope); merged before the next PR merges.
- [ ] GX6 `site-browser` job green and its wall time recorded in `apply-progress.md` (limit 15 minutes, SQ15).

---

## PR 1 — Home route, tokens and card data (`feat/home-directory`)

### H1 — Give the home its own route and add the tokens

Forecast: ~100–130 changed lines. Specs: site-routing-i18n [SR23]; site-shell [SS24] (token side), [SS25], [SS26], [SS28] (leak side), [SS29], [SS30], [SS32]; calculator-page [CP66] (gate pinned). Green because: the homes render from the same `HomeView`; no URL moves; no page gains or loses a stylesheet link.

Planned commit: `feat(web): give the home its own route and add the display, grid and tick tokens`.

- [x] 1.1 Baseline, on `feat/home-directory` (the checkout carries only openspec commits, so its build equals `main`). `npm run verify` green. Build once into scratch: copy `apps/web/dist` to `<scratch>/dist-main` (the dist-diff baseline for PR 1 and the byte baseline for every page). Record the measurements of `design-review.md`: ES concrete full-length **40,836 B** (EN 40,567 B), real ES concrete page 34,100 B, EN home **10,498 B**, ES home **10,586 B**, inline CSS per catch-all page (font-face 888 + 1,026 B, shared chunk **2,568 B**, catch-all chunk **2,917 B**, merged 5,485 B), 404 pages 2,568 B, **283** e2e tests, the concrete entry size printed by `client-entry.contract`, the Astro version (7.4.2), and the `site-browser` baseline wall time from the last green CI run. Run `rg -n "home-links|HomeView" apps tooling` and list every importer. Verify: numbers written to `apply-progress.md`.
- [x] 1.2 [RED] `apps/web/src/routing/static-paths-page.test.ts` (edit) [SR23]: the paths the catch-all builds (its `getStaticPaths` result) equal `staticPaths()` minus the two `home` entries (12); the union with `/` and `/es` equals `staticPaths()` (14) with no duplicate and none dropped; `pages/index.astro` rendered through the Astro container gives `html[lang="en-US"]` and `pages/es.astro` gives `html[lang="es-US"]`, each with the home view of its locale (the H1 element exists); the sitemap keeps 14 `<loc>` entries and `end-state.contract.test.ts` is not edited. Verify: `npm test -- apps/web/src/routing/static-paths-page` fails (route files missing; the catch-all still builds `home`).
- [x] 1.3 [RED] `apps/web/src/components/calculator/CalculatorBody.budget.test.ts` (edit) [SS28, SS29, SS32, CP66]: on the built concrete pages (EN and ES) and one trust page: no `link[rel="stylesheet"]`, every page's CSS in `<style>` elements of `<head>`, no `/_astro/*.css` file in `dist`, no substring `.home-` and no `linear-gradient`; `apps/web/astro.config.mjs` read as text has `inlineStylesheets: 'always'` under `build`; a new assertion pins the ES full-length proof at most **40,836 B** (the 124 B headroom of [CP66]; green on arrival, so spot-check it by adding one byte to the fixture copy and seeing it fail, then revert). In this task also decide and record the host of every later built-HTML assertion (Conventions). Verify: the leak and config assertions fail today (`.home-links` on the catch-all pages; no `inlineStylesheets`); the 40,836 pin is green on arrival.
- [x] 1.4 [RED] `apps/web/src/styles/styles.contract.test.ts` (edit) [SS24, SS25, SS26, SS30]: `--text-display` is a `clamp(` with `rem` minimum and maximum and its minimum (2.5rem) is above `--text-h1`; `--grid-size` equals `1rem`; `--tick-weight` exists and is a positive length; no `--tick-length` or other tick token; no custom property name contains `radius`; no `border-radius` with a non-zero value in `tokens.css`, `base.css`, `calculator.css`; the stale "1.42 line height" comment of the test now says 1.55 (the "≥ 170 px" test itself stays until H2); the global sheet list is still exactly `tokens`, `base`, `calculator`. Verify: fails on the missing tokens (the radius and sheet-list assertions are green on arrival: spot-check the radius one by adding `border-radius: 4px` to a scratch rule and reverting).
- [x] 1.5 [GREEN] `apps/web/src/pages/index.astro` (`<HomeView locale="en" />`) and `apps/web/src/pages/es.astro` (`locale="es"`), the same shape as `404.astro` and `es/404.astro`; `apps/web/src/pages/[...path].astro`: `staticPaths().filter(({ props }) => templateOf(props.id) !== 'home')` and the `HomeView` import and branch removed; `apps/web/src/routing/routes.ts` recipe comment now says "`pages/index.astro` and `pages/es.astro` render the home" (K15). Verify: 1.2 passes; `npm test -- apps/web/src/routing`.
- [x] 1.6 [GREEN] `apps/web/astro.config.mjs`: `build.inlineStylesheets: 'always'` with a comment naming the 4,096 B chunk cliff it removes (K2). Verify: the config assertions of 1.3 pass after `npm run build`.
- [x] 1.7 [GREEN] `apps/web/src/styles/tokens.css`: `--text-display: clamp(2.5rem, 1.5rem + 5vw, 4rem)`, `--grid-size: 1rem`, `--tick-weight: 2px` on `:root` (K3); no radius token. Verify: 1.4 passes; `npm test -- apps/web/src/styles`.
- [x] 1.8 [REFACTOR] The four commands. `rg -n "border-radius" apps/web/src` has no non-zero hit.
- [x] 1.9 Build and measure: `npm run build && npm run check:site`. Record the ES concrete full-length size (expect 40,836 B by equality: −83 B `.home-links`, +83 B tokens; a different figure is recorded and, if above 40,836 B, the slice stops and reports), the catch-all chunk (expect 2,834 B), EN and ES home bytes (expect about 7.6 KB), largest CSS per page, and the shortstat. Run `rg -l '\.home-' apps/web/dist` and confirm only `index.html` and `es.html` match (SS29 recorded measurement).
- [x] 1.10 `npm run test:e2e` green (283 tests, count recorded). Both homes render as before (same H1 and links); a11y and smoke already cover `/` and `/es` from the route table.
- [x] 1.11 Negative proofs: re-add `home` to the catch-all paths (SR23 duplicate case fails); delete `index.astro` (SR23 fails and `check:site` reports a missing file); remove `inlineStylesheets` (the config pin fails); rename `--grid-size` (SS25 fails); import `HomeView` back into the catch-all (the leak guard fails naming `.home-`); revert each.
- [x] 1.12 Exit: SX1–SX3, SX5.

### H3a — Card keys and the directory data module

Forecast: ~170–210 changed lines. Specs: trust-pages [TP30] (data module), [TP32]; the [TP26] content-contract row (test edit); `docs.contract` row. Green because: new keys and a new module nothing renders yet, so no built page changes (`page.home.links.concrete` stays until H3b).

Planned commit: `feat(web): add the home card keys and the directory data module`.

- [x] 2.1 [RED] `apps/web/src/lib/home-directory.test.ts` (new) [TP30]: with a fixture route table whose key order is `b`, a trust id, `a` and a fixture page list `['a', 'b']`, `directoryOrder(routes, pages)` returns `['b', 'a']` (table order, not list order, not alphabetical) and omits the trust id; `homeCards(locale, routes, pages)` for `en` and `es` returns each card with `href` the route path of that locale (`/es/...` for `es`) and `title`, `summary`, `example` read from catalogs that hold keys for both ids; `exampleOf(catalog, id, locale)` returns `calc.<id>.page.example` and throws naming the key and the locale when it is missing; the real defaults (`ROUTES`, `CALCULATOR_PAGES`) give exactly `['concrete']` with the real EN and ES copy of 2.5. Verify: fails (module missing).
- [x] 2.2 [RED] `apps/web/src/views/home.test-d.ts` (new) [TP32]: `` `page.home.cards.${id}.title` `` and `` `page.home.cards.${id}.summary` `` are keys of the English site catalog for every `CalculatorPageId`; under `@ts-expect-error` they are not keys for a non-routed id (`rectangle-area`). Verify: `npm run typecheck` fails (keys missing).
- [x] 2.3 [RED] `apps/web/src/contract/content.contract.test.ts` (edit) [TP26 row]: the row that read `page.home.links.<id>` reads the card keys: `page.home.cards.<id>.{title,summary}` exist in both locales for exactly the ids of `CALCULATOR_PAGES` and for no `PAGELESS` id. Verify: fails (keys missing). The main-spec [TP26] methodology text is untouched.
- [x] 2.4 [RED] `apps/web/src/contract/docs.contract.test.ts` (edit): the row `['the home link', …HomeView.astro]` becomes `['the home card keys', 'page.home.cards.<id>']`. `apps/web/src/contract/coverage.contract.test.ts` (edit): expects `lib/home-directory.ts` at 100 in `vitest.config.ts`. Verify: both fail.
- [x] 2.5 [GREEN] `packages/i18n/src/catalogs/en/site.ts` and `es/site.ts`: add `page.home.cards.concrete.title` ("Concrete calculator" / "Calculadora de concreto") and `page.home.cards.concrete.summary` ("Cubic yards and bags for a slab, footing, column or steps." / "Yardas cúbicas y bolsas para una losa, zapata, columna o escalones."). The heading is **not** reworded here: it changes a built page, which H3a must not do (see Risks, deviation 1). `register.contract.test.ts` and the `FORBIDDEN` test over `page.home.*` cover the new Spanish and English values (K8). Verify: 2.2, 2.3 and `npm test -- packages/i18n apps/web/src/contract` pass.
- [x] 2.6 [GREEN] `apps/web/src/lib/home-directory.ts` (K5): `HomeCard`, `directoryOrder`, `exampleOf`, `homeCards(locale, routes = ROUTES, pages = CALCULATOR_PAGES)`; the title is `siteText(locale)(`page.home.cards.${id}.title`)` so a missing key is a compile error; the example comes from `PAGES[id].catalogs[locale]`. Entry for `apps/web/src/lib/home-directory.ts` at 100 in the root `vitest.config.ts`. Verify: 2.1 and 2.4 pass; `npm run test:coverage` shows 100 percent on the file.
- [x] 2.7 [GREEN] `AGENTS.md` step 14 (K15): "the card keys `page.home.cards.<id>.{title,summary}` in both site catalogs; `HomeView.astro` needs no edit; `calc.<id>.page.example` is required (it is optional in `page-view.ts` and becomes a build-time throw, not a type error, for a routed id without it)", in place of the home-link sentence. Verify: the `docs.contract` row of 2.4 passes.
- [x] 2.8 [REFACTOR] The four commands; `npm run typecheck` includes the new `test-d`.
- [x] 2.9 Build: `npm run build && npm run check:site`; the normalised dist (design "Dist diff" normalisation) equals the H1-tip build byte for byte (H3a changes no built page). Record the ES full-length size (unchanged) and the shortstat of H3a and of H1 + H3a.
- [x] 2.10 Negative proofs: delete `page.home.cards.concrete.summary` in `en/site.ts` (typecheck fails naming the key); list the cards in alphabetical order (the fixture case of 2.1 fails); make `exampleOf` return `''` for a missing key (the throw case fails); remove the AGENTS.md sentence (the docs row fails); revert each.
- [x] 2.11 Exit: SX1–SX3, SX5.

### PR 1 group tasks

- [x] P1.1 Tip checks: `git log main..HEAD --oneline` shows the planning commits, then H1 and H3a; `git diff --stat main -- packages/` lists only `packages/i18n/src/catalogs/{en,es}/site.ts`; `git diff --stat main -- .github/workflows/ci.yml 'packages/*/stryker.config.mjs'` is empty. Record `git diff --shortstat main..HEAD -M -- . ':(exclude)package-lock.json' ':(exclude)tooling/site-browser/package-lock.json' ':(exclude)openspec/'` and the `openspec/` lines on a separate line. H3b joins this PR only if the authored sum is under 400 (it is not expected to be).
- [x] P1.2 Dist diff of the PR 1 tip against `<scratch>/dist-main`. Normalise both trees: asset names `sd '/_astro/[A-Za-z0-9_.-]+\.(js|css)' '/_astro/ASSET.$1'`; scoping strip of ` data-astro-cid-\w+`, ` class="astro-\w+"`, ` astro-\w+` class tokens, `[data-astro-cid-\w+]` and `.astro-\w+`; on `index.html` and `es.html` only, split each `<style>` into rules and compare the rule set as a sorted set. Then `diff -r -x '*.js'`. The only allowed differences: every page's `:root` gains the two tokens and the display size, with no `link[rel=stylesheet]` gained or lost; the 12 catch-all pages lose `.home-links{…}`; the 2 homes lose the catch-all's own chunk and their remaining rule set equals today's shared chunk plus the tokens plus `.home-links`. Anything else fails the gate. **Extended (H1 deviation 1):** K9 is in H1, so after the scoping normalisation above every calculator and trust page (and both 404 pages) must equal `dist-main` apart from the two tokens-and-`.home-links` differences; the raw per-page byte deltas are recorded too (K9 saves 150 B on each catch-all page, 66 B on each 404 page). Record the result.
- [x] P1.3 `npm run verify`; `npm run build && npm run check:site && npm run test:e2e && npm run lighthouse`; the ES full-length proof at most 40,836 B (record the exact figure and the headroom); record the e2e count, the largest CSS per page, the EN and ES home bytes, the `site-browser` wall time.
- [ ] P1.4 Exit: GX1–GX6. PR body: scope (home route files, catch-all minus `home`, `inlineStylesheets: 'always'`, tokens, card keys, data module, docs row), per-slice forecast vs actual (H1 ~100–130, H3a ~170–210), scenario ids covered (SR23, SS24 token side, SS25, SS26, SS28 leak side, SS29, SS30, SS32, TP26 row, TP30 data module, TP32, CP66 gate), negative-proof evidence per slice, the dist-diff result, the `packages/` result limited to the two `site.ts` files, the measured sizes (ES full-length vs 40,836 B, home bytes, chunk sizes), and rollback (revert this merge last, after PR 2 and PR 3). Chain Context: PR 1 of 3, start state `main`, end state the home on its own route files with the card data module unused by any view, follow-ups PR 2 and PR 3, out of scope the hero, the cards and the gap fix. **Pushing the branch, CI, the four reviewers, Judgment Day, the PR and the merge belong to the orchestrator, not to apply.**

---

## PR 2 — Hero band and cards (`feat/home-directory-p2-hero-and-cards`)

### H3b — Hero band and the view skeleton

Forecast: ~190–230 changed lines. Specs: trust-pages [TP7], [TP8], [TP21], [TP29], [TP31], [TP33] (partial), [TP34] (script scan), [TP35] (measured); site-shell [SS24] (use scan), [SS26] (view style), [SS27], [SS31]; the D7 JSON-LD guard kept. Green because: the home is complete but plainer: hero, one title link per directory entry, the methodology and about links; never a broken home.

Planned commit: `feat(web): add the home hero and render the directory skeleton`.

- [x] 3.1 Create `feat/home-directory-p2-hero-and-cards` from the PR 1 tip (retarget onto `main` after PR 1 merges). Baseline: `npm run verify` green; record the e2e count and the home sizes at the PR 1 tip.
- [x] 3.2 [RED] `apps/web/src/views/HomeView.test.ts` (rewrite, `design.md` guard table). Write a guard ledger first in `apply-progress.md`: each current assertion, then kept / replaced / dropped with the reason. Assertions:
  - the whole document, `lang`, title and canonical are kept; one H1 in `main` whose text equals `page.home.heading` from the catalog; the language switch kept [TP29];
  - [TP29] the H1 is followed by the paragraph equal to `page.home.intro`, which starts with `site.tagline` verbatim; the hero holds no link and no other heading;
  - [TP21] one `li` per id of `directoryOrder(ROUTES, CALCULATOR_PAGES)`, in that order, each with exactly one `a[href]` equal to `pathOf(id, locale)` whose text is the card title; the `calc.<id>.title` of every `PAGELESS` id and the words `rectangle`, `rectángulo`, `square footage`, `pies cuadrados`, roofing and paint are absent in both locales [TP31];
  - [TP7] `main` links outside the list are the methodology and about links in the current locale; [TP33] they come after every card link;
  - [TP8] no `coming soon`, `próximamente`, `pronto`, `trusted by`, `miles de`, `stars`, `estrellas`; the claims check over `page.home.*` values (the `FORBIDDEN` list) kept; nothing "still being built";
  - JSON-LD kept (D7): one `script`, `Organization` and `WebSite` only; `NotFoundView` has none;
  - new: no `→ › »` in `main`; the HomeView `<style>` has no `text-transform`, `border-radius`, `transition` or `animation` [SS26];
  - dropped with the recorded reason: exactly 2 `<p>` and no `ul`/`ol`; intro equals `intro + links.concrete`.
  Verify: `npm test -- apps/web/src/views/HomeView` fails (hero and list missing; the heading is still the old one).
- [x] 3.3 [RED] `apps/web/src/styles/styles.contract.test.ts` (edit): [SS24] `var(--text-display)` is referenced in `HomeView.astro` only and in no sheet and no other component; [SS31] a unit test on the token values: the hero text colours (`--color-surface` on `--color-text`) and the lightest grid line colour (`color-mix(in srgb, var(--color-surface) 12%, transparent)` composited on ink) give at least 4.5:1 against the ink ground for the H1 and the tagline. Verify: fails (token unused; view style missing).
- [x] 3.4 [RED] `tooling/site-browser/e2e/home.spec.ts` (new) [SS27, TP34]: on `/` and `/es` at 390 and 1280 px, the element with class `home-hero` inside `main` (selected by class only) has a computed `background-image` with two `linear-gradient` layers, `background-size` equal to the computed `--grid-size` in both axes, `background-color` `rgb(14, 34, 64)`; the H1 `::after` has computed height equal to `--grid-size` and `border-inline` of `--tick-weight` in `rgb(240, 106, 29)`; the computed H1 font-size is above the `--text-h1` size at 320 and 1280 px and larger at 1280 [SS24]; at 320 px `scrollWidth <= innerWidth` for the hero and the document. Request logging confirms no request of type `script` on the homes [TP34]. Verify: `npm run typecheck --prefix tooling/site-browser`, then `npm run build && npm run test:e2e -- home.spec` fails (hero missing).
- [x] 3.5 [RED] Built-HTML contract in the host chosen at 1.3 [SS28 home side, TP34, TP35, TP31]: `dist/index.html` and `dist/es/index.html` match `.home-hero` and `linear-gradient` (the `.home-card` match joins at H3c); every other page has neither `.home-` nor `linear-gradient`; the only `script` elements of the homes are `application/ld+json`, no `on*=` attribute; each home is at most **24,576 B**; neither home names a pageless calculator. Verify: fails on the hero match.
- [x] 3.6 [GREEN] `packages/i18n/src/catalogs/{en,es}/site.ts`: `page.home.heading` reworded ("From measurements to a shopping list" / "De tus medidas a la lista de compras"); `page.home.links.concrete` removed in both locales (the view stops reading it, so the dist diff of PR 2 shows it); `page.home.intro` unchanged. Verify: `npm test -- packages/i18n apps/web/src/contract` pass; `rg -n "links.concrete" apps packages` is empty outside the archive.
- [x] 3.7 [GREEN] `apps/web/src/views/HomeView.astro` (K6, K7): `div.home-hero` inside `main` holding the H1 (`page.home.heading`) and the intro `p`; `ul.home-cards[role=list]` rendering `homeCards(locale)` with the title link only (`li.home-card > h2 > a.tap-target`); the methodology and about links after the list. Scoped `<style>` with the hero rule of the design (grid as two gradients, `--text-display` on the H1, `::after` dimension line of `--grid-size` height and `--tick-weight` ticks), square corners, no motion; the `.home-links` rule stays for the two links. `HomeView.astro` keeps `locale` as its only prop. Verify: 3.2, 3.3, 3.4, 3.5 pass.
- [x] 3.8 [REFACTOR] The four commands, with `npm run typecheck --prefix tooling/site-browser`. `rg -n "border-radius|text-transform" apps/web/src/views/HomeView.astro` is empty.
- [x] 3.9 Build and measure: `npm run build && npm run check:site`; `npm run test:e2e` (record the new count: 283 plus the `home.spec.ts` tests). Record the ES full-length size (must be unchanged, at most 40,836 B; H3b touches the home only), EN and ES home bytes (forecast about 9.6–10.1 KB at the PR 2 tip; at most 24,576 B), home inline CSS, largest CSS per page, the shortstat of H3b. Contrast: axe on the homes reports 0 violations (`a11y.spec.ts` from the route table).
- [x] 3.10 Negative proofs: drop the `ul` skeleton to a hard-coded concrete link (the directory-order case fails); put `border-radius: 4px` in the view style (SS26 fails); use `--text-display` in `base.css` (SS24 use scan fails); lighten the grid line colour past contrast (SS31 fails); put the hero rule on a differently named class (SS27 e2e fails); revert each.
- [x] 3.11 Exit: SX1–SX3, SX5.

### H3c — Cards

Forecast: ~190–210 changed lines. Specs: trust-pages [TP21] (built), [TP28], [TP30] (on the view), [TP33], [TP34], [TP35], [TP36], [TP37]; site-shell [SS26] (card style), [SS28] (home side complete). Green because: each directory item gains its summary and example line and the card styling; the document structure is already there.

Planned commit: `feat(web): render the calculator cards on the home`.

- [x] 4.1 [RED] `apps/web/src/views/HomeView.test.ts` (edit) [TP28, TP30, TP33]: each `li.home-card` holds, in order, `h2 > a.tap-target` with the `page.home.cards.<id>.title` text, a `p` with the `page.home.cards.<id>.summary` text and `p.home-example` with the `calc.<id>.page.example` text of that locale; exactly one link per card; the list is a `ul` with `role="list"` whose item count equals the ids of `CALCULATOR_PAGES`; the rendered view with the real tables lists the cards in `directoryOrder(ROUTES, CALCULATOR_PAGES)` order [TP30 on the view]; a fixture `ROUTES` order is proved on the data module in H3a, so no table is injected into the view; every card link precedes the methodology link, which precedes the about link [TP33]; no arrow glyph in a card; the view style has no `box-shadow`, `text-transform`, `transition`, `animation` or radius. Verify: fails (summary and example missing).
- [x] 4.2 [RED] Built-HTML contract (host of 1.3): `dist/index.html` and `dist/es/index.html` also match `.home-card`; the card link targets equal the route paths of `CALCULATOR_PAGES` in the current locale (`/concrete-calculator`, `/es/calculadora-de-concreto`) and no other calculator link exists [TP21]; `ul` item count equals `CALCULATOR_PAGES.length` on the built HTML [TP28]; the only `script` is JSON-LD [TP34]; each home at most 24,576 B with the measured size recorded [TP35]; the largest CSS per page at most 20,480 B [SS30]. Verify: fails on the `.home-card` match.
- [x] 4.3 [RED] `tooling/site-browser/e2e/home.spec.ts` (edit) [TP37]: at 320, 390 and 1280 px on `/` and `/es`, `document.documentElement.scrollWidth <= window.innerWidth`, and each card link box is at least 44 by 44 CSS px. Verify: `npm run typecheck --prefix tooling/site-browser`, then `npm run build && npm run test:e2e -- home.spec` fails on the missing cards (no `.home-card` link).
- [x] 4.4 [GREEN] `apps/web/src/views/HomeView.astro`: the summary `p` and `p.home-example` inside each card; the stretched link `a::after { position: absolute; inset: 0 }` on a positioned `li`; card CSS (Sheet white on Plan paper, 2 px `--color-surface` border turning `--color-text` on `:hover` and `:focus-within` with no layout change, grid `repeat(auto-fill, minmax(min(100%, 18rem), 1fr))`, example in Form gray at `--text-small`, title underline on hover, base focus ring kept, square corners, no motion or shadow). Verify: 4.1, 4.2, 4.3 pass.
- [x] 4.5 [REFACTOR] The four commands, with `npm run typecheck --prefix tooling/site-browser`.
- [x] 4.6 Build and measure: `npm run build && npm run check:site && npm run test:e2e` (record the count) and `npm run lighthouse`. Record: ES full-length size (at most 40,836 B), EN and ES home bytes (forecast about 9.6–10.1 KB; at most 24,576 B), home inline CSS (forecast about 5.9–6.3 KB), `git diff --shortstat` of H3c and of H3b + H3c. Check [TP36]: `a11y.spec.ts` axe reports 0 violations on `/` and `/es` (card summary and example lines pass `color-contrast`), and Lighthouse keeps accessibility, SEO and best practices at 0.95 or higher and layout shift at 0.01 or lower on both homes.
- [x] 4.7 Split rule: if the measured authored `--shortstat` of H3b + H3c against the PR 1 tip passes 400, stop. H3c becomes its own PR (`feat/home-directory-p3-cards`, from the H3b tip) and H2 moves one PR later (PR 4); record the numbers and update `state.yaml`; no slice changes.
- [x] 4.8 Screenshots of both homes at 390 and 1280 px (four images, built site, saved to the scratch directory) for the PR body.
- [x] 4.9 Negative proofs: link the whole card as one `a` (the one-link and heading structure cases fail); put an arrow glyph in a card (the glyph guard fails); make the card link 20 px tall (TP37 fails); add `min-width: 30rem` to the grid so it overflows at 320 (the overflow case fails); add a `.home-card` rule to `base.css` (the leak guard fails); revert each.
- [x] 4.10 Exit: SX1–SX3, SX5.

### PR 2 group tasks

- [x] P2.1 Tip checks: `git log main..HEAD --oneline` shows H3b and H3c only (PR 1 merged first, and the branch was retargeted so the diff has no PR 1 content); `git diff --stat main -- packages/` lists only `packages/i18n/src/catalogs/{en,es}/site.ts`; the CI/stryker paths are unchanged. Record the authored `--shortstat main..HEAD` for the PR (the split rule of 4.7 applies).
- [x] P2.2 Dist diff of the PR 2 tip against the PR 1 tip build (normalised as in P1.2): only `index.html` and `es.html` differ. Record the result.
- [x] P2.3 `npm run verify`; `npm run build && npm run check:site && npm run test:e2e && npm run lighthouse`; the ES full-length proof at most 40,836 B (exact figure and headroom recorded); the e2e count; EN and ES home bytes; the `site-browser` wall time.
- [ ] P2.4 Exit: GX1–GX6. PR body: scope (hero band, directory cards, `HomeView.test.ts` rewrite with the guard ledger, `home.spec.ts`), per-slice forecast vs actual (H3b ~190–230, H3c ~190–210), scenario ids covered (TP7, TP8, TP21, TP28–TP37, SS24 use, SS26, SS27, SS28 home side, SS31), the guard ledger (each kept, replaced or dropped assertion with its reason), negative-proof evidence, the dist-diff result, the measured home bytes against 24,576 B, the four screenshots (both homes at 390 and 1280 px), the Lighthouse and axe results, rollback. Chain Context: PR 2 of 3 (marked with the current-PR marker in the dependency diagram), start state the PR 1 tip, end state the finished home, follow-up PR 3 (the gap fix), out of scope square-footage and hub grouping. **Pushing, CI, review, the PR and the merge belong to the orchestrator.**

---

## PR 3 — Reserves per breakpoint (`feat/home-directory-p3-reserves`)

### H2 — Size the answer and notice reserves per breakpoint

**Note (H1 deviation 1, owner decision 2026-10-27):** K9 (`scopedStyleStrategy: 'class'`, task 5.7) was done in H1 because the full-length proof fixture never carried `.home-links`, so the tokens alone took it to 40,920 B. H2 starts at 40,770 B: its room is 66 B plus the trim rungs (a K9 saving is no longer available to H2; task 5.7 is already done and only needs its record kept).

Forecast: ~170–200 changed lines. Specs: calculator-page [CP44], [CP58] (kept, regression), [CP59]–[CP66]; site-shell [SS30] (sheet list and CSS budget). Green because: one reserve rule replaces three fixed reserves, paid for by `scopedStyleStrategy: 'class'` and the measured trims; the ES full-length proof never exceeds 40,836 B.

Planned commit: `fix(web): size the answer and notice reserves per breakpoint`.

- [x] 5.1 Create `feat/home-directory-p3-reserves` from the PR 2 tip (retarget onto `main` after PR 2 merges). Baseline: `npm run verify` green; record the ES full-length size (at most 40,836 B), the e2e count, the three source sheet sizes, and copy the PR 2 tip `apps/web/dist` to `<scratch>/dist-pr2` for the PR 3 dist diff.
- [x] 5.2 Sweep (scratch, not committed; results in `apply-progress.md`): a Playwright script over the built site, widths 320 to 1280 in 1 px steps, every `layoutQueries` entry in both locales, recording the tallest natural height (`min-height: 0` and `display: flow-root`) of the answer (over its four sentences and `—`) and of the notice (the "not running" note with `[data-not-running]` un-hidden, and the `?v=2` link notice), plus the copy block mounted content. Output: for each block the width where the tallest line count drops; each breakpoint is that value in rem, rounded up to 0.5rem; the line counts per range (the design's table is the forecast: 5 / 4 / 3 / 2 at <30, ≥30, ≥40, ≥60 rem); the decision whether the notice shares `--answer-lines` (unused under one body line at every width) or needs `--notice-lines` in the body unit (K10; likely at ≥ 60rem). Per-width tallest heights of both blocks are recorded next to the answer's.
- [x] 5.3 [RED] `tooling/site-browser/e2e/layout.spec.ts` (edit) [CP59, CP60, CP61, CP62, CP63, CP44]: `WIDTHS` = 320, 390, 480, 640, 768, 1024, 1280 plus both edges (`N·16` and `N·16 − 1` px) of every breakpoint of 5.2; for each calculator id (read from the record) and locale, the probe sets `el.style.minHeight = '0px'` **and** `el.style.display = 'flow-root'`, reads `getBoundingClientRect().height`, restores both; blocks probed: the answer rewritten to each of its sentences and to `—`, the notice (note scripts-disabled, and the `?v=2` link notice), the copy block after mount (button, gap, status; the fallback field is never inserted); per width and block: `natural ≤ reserved` and `reserved − max(natural over both locales) < line`, where `line` is read from the computed `line-height` of the block's text (answer line 34.1 px for the answer, body line 26.35 px for the notice and copy), never from a constant; CLS ≤ 0.01 at every width with and without `?v=1&sh=footing&l=216&n=3`, and the position of the first element below each reserved block is equal before and after mount [CP62]; JavaScript on and off give equal reserved heights at 390 and 1280 [CP63]; the notice-shown `scrollHeight` test runs at every width. Verify: `npm run typecheck --prefix tooling/site-browser`, then `npm run build && npm run test:e2e -- layout.spec` fails against today's 10.75 / 9 / 5 rem reserves (the unused answer reserve is a line or more at 768, 1024 and 1280).
- [x] 5.4 [RED] `apps/web/src/styles/styles.contract.test.ts` (edit) [CP64, CP59–CP61 pins]: add `mediaRulesOf` returning `[query, rules]`, with `rulesOf` still skipping `@media`; a parser that extracts every length of a media condition as `(number, unit)` and does not depend on `min-width` versus `width>=` syntax; seeded unit cases: `(min-width: 30rem)`, `(width>=30rem)` and a `px` length (flagged); pins: the exact `min-height: calc(var(--answer-lines, 5) * var(--text-h3) * var(--leading-body))` formula on `.calc-answer`; `.calc-notice` either the same formula or the `--notice-lines` formula in the body unit (`--text-base × --leading-body`), as 5.2 decided; the media list (widths strictly increasing, counts strictly decreasing, the measured values); `.calc-copy` min-height at least 4.6rem and less than 4.6rem plus one body line; every length is `rem` and none `px`, in the source and in the built CSS of the concrete page, with the two rem sets equal; every breakpoint `N` puts `N·16` and `N·16 − 1` in `WIDTHS` (read from `layout.spec.ts` as text, as `browser-record.contract.test.ts` does); the "≥ 170 px / 1.42 line height" test is removed. Verify: fails (no media blocks; the old pins removed).
- [x] 5.5 [RED] `apps/web/src/components/calculator/CalculatorBody.override.test.ts` (new) [CP65]: Astro container render of `CalculatorBody` with the concrete page view and `style="--answer-lines:3"` on the body: the inline property is on the calculator body and `data-reserved="answer"` is unchanged (the reserve resolves through the shared formula of 5.4, so no stylesheet edit); the rectangle-area page view rendered the same way has no `data-reserved="answer"` at all (the answer region renders only when `view.answer` exists). If the body already forwards the style attribute this test is green on arrival: spot-check by dropping the forwarded style and seeing it fail, then revert. Verify: runs; records red or green on arrival.
- [x] 5.6 [RED] `apps/web/src/contract/client-entry.contract.test.ts` (edit) [CP63]: the built entry graph of each calculator contains no code that sets a reserved height (`min-height`, `--answer-lines`, `--notice-lines`, `data-reserved` writes); seeded: a module that sets `style.minHeight` is flagged. Green on arrival (the script never sets a reserve today): spot-check by adding the seeded line to `mount.ts` and reverting.
- [x] 5.7 [GREEN] `apps/web/astro.config.mjs`: `scopedStyleStrategy: 'class'` with a comment naming the bytes it saves (K9). Verify: `npm run build`; record the measured saving on the ES full-length proof and on the real ES concrete page (forecast 160 B); `rg -n "data-astro-cid" apps tooling` finds no reader.
- [x] 5.8 [GREEN] `apps/web/src/styles/calculator.css` (K10): the `.calc-answer` min-height formula with `--answer-lines` fallback 5; the three `@media (min-width: Nrem) { :root { --answer-lines: k } }` blocks with the 5.2 values; `.calc-notice` sharing the formula or with `--notice-lines` in its own unit and counts in the same media blocks; the three fixed `min-height` rules removed; the two trims `box-sizing: border-box` removed from `.calc-field input, .calc-fallback` and `.calc-row dt` removed from its selector list; `.calc-copy` keeps `min-height: 5rem` against the mounted content (K11). No per-page override rule is added (K12, D6: YAGNI; [CP65] proves the mechanism). Verify: `npm test -- apps/web/src/styles`; `npm run build && npm run test:e2e -- layout.spec` passes at every width.
- [x] 5.9 Size gate [CP66]: `npm test -- apps/web/src/components/calculator/CalculatorBody.budget` prints the ES full-length size. Forecast about 40,821 B without `--notice-lines` and about 40,760 B after the rungs with it. If it is **at most 40,836 B**, continue. If above, take the trim ladder in order, one rung per measurement, recording each rung's measured saving: (1) one shared `.calc-row, .calc-shopping, .calc-cost, .calc-hint { display: flex; justify-content: space-between; gap: var(--space-3) }` with the leftovers (about −100 B); (2) one shared control rule for `.calc-choice`, `.calc-field input`, `.calc-fallback` (about −60 B; the pressed-state rule stays after it); (3) `.calc-error, .calc-help` sharing `grid-column`, `margin`, `font-size` (about −31 B); (4) merge adjacent ranges where the sweep allows (−42 B each, −60 B with `--notice-lines`). A `--line` token is not a rung. If still over after rung 4, **stop and report**: the budget is never raised (D8) and H2 does not merge.
- [x] 5.10 [REFACTOR] The four commands, with `npm run typecheck --prefix tooling/site-browser`.
- [x] 5.11 Build and measure: `npm run build && npm run check:site && npm run test:e2e` (record the count: 283 plus the home and layout additions) and `npm run lighthouse` (CLS at most 0.01 on both concrete pages, [CP62]). Record: the unused reserve per block and width (CP60 and CP61 table), the ES and EN full-length sizes with the headroom, the three source sheet sizes (forecast about −0.1 KB), the home bytes (forecast about 9.5–10 KB), the largest CSS per page, the shortstat of H2.
- [x] 5.12 Negative proofs: put back `min-height: 10.75rem` on `.calc-answer` (the layout spec fails at 1024 and 1280; the formula pin fails); set a breakpoint in `px` (CP64 fails in source and built text); move a breakpoint by 1 px so an edge is not in `WIDTHS` (the cross-check fails); drop `display: flow-root` from the probe (the notice reads 16 px short and CP61 fails or mismatches the record); set the notice count one too high (the under-one-line assertion fails); set `.calc-copy` to 3rem (the copy pin fails); remove the style forwarding of the body (CP65 fails); add one byte of HTML to the ES fixture past the pin (the 40,836 B pin fails); revert each.
- [x] 5.13 Exit: SX1–SX3, SX5.

### PR 3 group tasks

- [x] P3.1 Tip checks: `git log main..HEAD --oneline` shows H2 only; `git diff --stat main -- packages/` is empty; the CI/stryker paths are unchanged; record the authored `--shortstat main..HEAD`.
- [x] P3.2 Dist diff of the PR 3 tip against `<scratch>/dist-pr2` (normalised as in P1.2; the scoping strip removes the K9 markup change on every page): only the 2 calculator pages differ, and only in the old reserve declarations, the two trimmed declarations and the rules of any taken rung being replaced by the K10 rule, its media blocks and the merged rules. Record the result.
- [x] P3.3 `npm run verify`; `npm run build && npm run check:site && npm run test:e2e && npm run lighthouse`; the ES full-length proof at most 40,836 B (exact figure, headroom and every rung taken recorded); the e2e count; the `site-browser` wall time (the seven widths plus the breakpoint edges add runs: record the delta against the PR 2 tip).
- [ ] P3.4 Exit: GX1–GX6. PR body: scope (class scoping, reservations per breakpoint, trims, `layout.spec.ts` widths, the CP65 fixture test), forecast vs actual (H2 ~170–200), scenario ids covered (CP59–CP66, CP44, CP58 regression, SS30), the sweep results (breakpoints, line counts, notice decision), the unused reserve per block and width, the trim rungs taken with measured savings, the ES full-length size against 40,836 B, the dist-diff result, negative-proof evidence, rollback (this PR reverts alone). Chain Context: PR 3 of 3, start state the PR 2 tip, end state the gap fix, follow-ups the two recorded in `design.md` (hub-era card keys; trust pages carry the catch-all chunk), out of scope square-footage. **Pushing, CI, review, the PR and the merge belong to the orchestrator.**

---

## Final — Change-level checks

- [ ] F.1 After PR 3 merges: `git diff --stat <pre-change main> -- packages/` lists only `packages/i18n/src/catalogs/{en,es}/site.ts`; `ROUTES`, `staticPaths()` (14), the sitemap and the pinned counts are unchanged; no budget was raised.
- [ ] F.2 `apply-progress.md` lists, per slice, forecast vs actual lines, the scenario ids proven, each negative proof run and reverted, the measured sizes (ES full-length per PR tip, home bytes, chunks, CSS per page, e2e count) and the three `site-browser` wall times.
- [ ] F.3 Archive-ready: the delta specs are synced to `openspec/specs/` at archive time (SR23, SS24–SS32, CP59–CP66, TP28–TP37; the main-spec text of TP26 is untouched).

---

## Traceability: spec scenario → slice, proof

Legend: [T] proved by a unit or contract test in the named file; [E] proved by a Playwright suite on the built site; [M] proved by a recorded measurement with its task.

### trust-pages

| Scenario | Slice | Proof | Tasks |
|---|---|---|---|
| TP7 Home links (kept) | H3b | [T] `views/HomeView.test.ts` | 3.2 |
| TP8 No empty promises (kept) | H3b | [T] `views/HomeView.test.ts` | 3.2 |
| TP21 Lists exactly the routed calculators | H3b, H3c | [T] `HomeView.test.ts` (order and link), built-HTML contract | 3.2, 4.2 |
| TP26 row (content contract, test edit) | H3a | [T] `contract/content.contract.test.ts` | 2.3 |
| TP28 One card per calculator | H3c | [T] `HomeView.test.ts`, built-HTML contract | 4.1, 4.2 |
| TP29 Hero band | H3b | [T] `HomeView.test.ts` | 3.2 |
| TP30 Order follows the route table | H3a, H3c | [T] `lib/home-directory.test.ts` (fixture), `HomeView.test.ts` (real tables) | 2.1, 4.1 |
| TP31 No card for an unrouted calculator | H3b | [T] `HomeView.test.ts`, built-HTML contract | 3.2, 3.5 |
| TP32 Missing card keys fail the build | H3a | [T] `views/home.test-d.ts` (`npm run typecheck`) | 2.2 |
| TP33 Links after the directory | H3b, H3c | [T] `HomeView.test.ts` | 3.2, 4.1 |
| TP34 No JavaScript on the home | H3b, H3c | [T] built-HTML contract; [E] `home.spec.ts` request log and existing smoke/no-js projects | 3.4, 3.5, 4.2 |
| TP35 Home HTML budget with headroom | H3b, H3c | [T] built-HTML contract (at most 24,576 B); [M] sizes recorded | 3.5, 3.9, 4.2, 4.6 |
| TP36 Axe and contrast | H3b, H3c | [E] `a11y.spec.ts` (route table); [M] Lighthouse at 0.95 and CLS 0.01 | 3.9, 4.6, P2.3 |
| TP37 Cards usable on a phone | H3c | [E] `home.spec.ts` at 320, 390, 1280 | 4.3 |

### site-shell

| Scenario | Slice | Proof | Tasks |
|---|---|---|---|
| SS5, SS6, SS7 (kept) | H1, H3b | [T] existing `styles.contract.test.ts` unchanged and green; [E] axe contrast | 1.4, 3.9 |
| SS24 Display size above H1 | H1, H3b | [T] `styles.contract.test.ts` (clamp, use scan); [E] `home.spec.ts` computed sizes | 1.4, 3.3, 3.4 |
| SS25 Grid and tick primitives pinned | H1 | [T] `styles.contract.test.ts` | 1.4 |
| SS26 Square corners | H1, H3b, H3c | [T] `styles.contract.test.ts`, `HomeView.test.ts`; [M] `rg border-radius` on source and dist | 1.4, 3.2, 4.1, 1.8 |
| SS27 Hero carries the grid and tick | H3b | [E] `home.spec.ts` | 3.4 |
| SS28 The identity does not leak | H1, H3b, H3c | [T] `CalculatorBody.budget.test.ts` (calculator pages), built-HTML contract (all pages and homes) | 1.3, 3.5, 4.2 |
| SS29 Other pages carry no home rule | H1 | [T] `CalculatorBody.budget.test.ts`; [M] sizes recorded | 1.3, 1.9 |
| SS30 Three sheets and the CSS budget | H1, every slice | [T] `styles.contract.test.ts`; [M] `check:site` largest CSS recorded | 1.4, 4.2, 5.11 |
| SS31 Hero contrast over the grid | H3b | [T] `styles.contract.test.ts`; [E] axe | 3.3, 3.9 |
| SS32 Every page inlines its CSS | H1 | [T] `CalculatorBody.budget.test.ts` (config and build); [M] `check:site` | 1.3, 1.6 |

### calculator-page

| Scenario | Slice | Proof | Tasks |
|---|---|---|---|
| CP44 Load shift (kept) | H2 | [E] `layout.spec.ts`; [M] Lighthouse CLS | 5.3, 5.11 |
| CP58 Reservation is derived (kept) | H2 (regression) | [T] existing `slots/choices.test.ts`, `lib/page-view.test.ts` unchanged | 5.10 |
| CP59 Answer fits at seven widths | H2 | [E] `layout.spec.ts` | 5.3 |
| CP60 Unused answer reserve under one line | H2 | [E] `layout.spec.ts`; [M] unused reserve per width | 5.3, 5.11 |
| CP61 Notice and copy fit with under one body line unused | H2 | [E] `layout.spec.ts` | 5.3 |
| CP62 Nothing shifts at any width | H2 | [E] `layout.spec.ts`; [M] Lighthouse CLS | 5.3, 5.11 |
| CP63 Reserve is CSS-only | H2 | [E] `layout.spec.ts` (JS on and off); [T] `client-entry.contract.test.ts` | 5.3, 5.6 |
| CP64 Breakpoints follow text zoom | H2 | [T] `styles.contract.test.ts` (source and built) | 5.4 |
| CP65 Page can override the line counts | H2 | [T] `CalculatorBody.override.test.ts` | 5.5 |
| CP66 ES concrete within the HTML budget | H1 (pin), every PR tip | [T] `CalculatorBody.budget.test.ts` (at most 40,836 B); [M] size at each tip | 1.3, 1.9, 5.9, P1.3, P2.3, P3.3 |

### site-routing-i18n

| Scenario | Slice | Proof | Tasks |
|---|---|---|---|
| SR17 List agrees with the table (kept) | H1 (regression) | [T] existing contract unchanged | 1.8 |
| SR18 Template per id (kept) | H1 (regression) | [T] existing contract unchanged | 1.8 |
| SR23 Home route files, URL set unchanged | H1 | [T] `routing/static-paths-page.test.ts`; existing `end-state` and sitemap contracts | 1.2, 1.5 |

Counts: 10 TP (TP28–TP37) + 9 SS (SS24–SS32) + 8 CP (CP59–CP66) + 1 SR (SR23) = 28 new ids, all mapped; kept ids named above: TP7, TP8, TP21, SS5, SS6, SS7, CP44, CP58, SR17, SR18 = 10; 38 ids in all.

---

## Risks and deviations the apply must know

1. **Heading rewording moves from H3a to H3b.** The module map lists the `page.home.heading` rewording under H3a, but the dist-diff rule says H3a changes no built page. The rewording would change the home H1, so it ships in H3b with the hero test (task 3.6). H3a adds only the new card keys.
2. **`home.spec.ts` is not in the design's module map.** [SS27] and [TP37] are e2e scenarios and need a spec; the design says no spec edit is needed only for `a11y.spec.ts` and `smoke`. A new `tooling/site-browser/e2e/home.spec.ts` carries them (hero in H3b, cards in H3c). Its lines count toward the PR 2 budget and are the first thing to move into a separate commit if H3b + H3c pass 400.
3. **The CP66 pin lands in H1, not H2.** The gate applies at every PR tip (K14), so the 40,836 B assertion is added in task 1.3 and H2 only keeps it. It is green on arrival and spot-checked.
4. **PR 1 diff includes the openspec planning commits.** They are excluded from the budget count and reported on their own line; if the reviewer cannot filter them, the orchestrator may open PR 1 from a fresh branch that carries only H1 and H3a.
5. **H1 holds CP66 by equality, not margin** (−83 B +83 B). Any difference in the measured token bytes either way is recorded and, if over 40,836 B, stops the slice.
6. **PR 2 is the one at the cap** (~380–440); the split rule of 4.7 is applied by measurement, never by exception.
7. **H2 may not merge** if the trim ladder cannot bring the ES full-length proof to 40,836 B or less (D8).
8. **Built-HTML host is decided at task 1.3** (the budget test versus `site-check`); later slices follow it. The choice does not change any scenario.
