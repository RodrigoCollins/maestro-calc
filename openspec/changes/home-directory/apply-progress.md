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

Vitest: 198 files, 3,659 tests at the tip (baseline 196 files, 3,632). `rg -l '\.home-' apps/web/dist` lists `index.html` and `es.html` only. `site-browser` CI wall time: not measurable locally (CI only).

### Dist diff against `dist-main` (P1.2, normalised: asset names, scoping markup)

Script in the scratch directory. After normalisation, every catalog page that is not a home (concrete EN/ES, trust pages EN/ES, both 404 pages) equals `dist-main` once the three tokens in `:root` and the `.home-links{...}` rule are removed from the comparison: 0 differing files beyond those. The H3a-tip build is byte-identical to the H1-tip build (`diff -r -x '*.js'` empty). Homes: rule sets compared as sorted sets: the calculator chunk's rules are gone (`.calc-*`), `.home-links` and the footer rule remain; nothing else differs. No `link[rel=stylesheet]` gained or lost.

### Scenario ids proven

H1: [SR23] (`static-paths-page.test.ts`: 12 catch-all paths, union 14 with no duplicate, both home files' `lang`, title, canonical, one H1), [SS24] token side, [SS25], [SS26] global-sheet side, [SS28] leak side, [SS29], [SS30] sheet list, [SS32] (config, no stylesheet link, no CSS file, CSS in head), [CP66] pin, K9 pin. H3a: [TP30] (data module, fixture order), [TP32] (`home.test-d.ts`), [TP26] row, `docs.contract` row, coverage entry (100 percent on `lib/home-directory.ts`).

### Negative proofs (each run, then reverted; `git status --porcelain` clean afterwards)

H1: home back in the catch-all paths (2 SR23 cases red); `index.astro` removed (3 red); `--grid-size` renamed (SS25 red); `inlineStylesheets` removed (config pin red); `HomeView` imported back into the catch-all (3 leak cases red naming `.home-`); `scopedStyleStrategy` removed (K9 pin and CP66 pin red); the CP66 pin was red at 40,920 B before K9. H3a: cards sorted alphabetically (4 red); `exampleOf` returning `''` (throw case red); AGENTS.md key sentence cut (docs row red); `page.home.cards.concrete.summary` deleted from `en/site.ts` (typecheck fails naming the key in `packages/i18n`).

### What remains for the orchestrator

Push; CI; four reviewers and Judgment Day on the frozen candidate; decision on deviation 2 (split PR 1 at the commit boundary); PR body from this file; `site-browser` CI wall time. Next apply: PR 2 (H3b + H3c), which starts from a tree where K9 is already on.
