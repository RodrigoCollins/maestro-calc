# Apply progress: square-footage

## PR 1 (`feat/square-footage`): S1a and S1b done

Mode: strict TDD (`npm test`). Nothing was pushed. Pushing, CI, the four reviewers, Judgment Day, the PR and the merge belong to the orchestrator (P1.4).

### Commits (oldest first; code only, `openspec/` excluded)

| Slice | Commit | Subject | Changed lines |
|---|---|---|---|
| S1a | 23ad826 | test(web): check the calculator entries per id | 584+ / 150- (734) |
| S1b | caf4421 | test(web): run the methodology and budget proofs per id | 466+ / 224- (690, rename detected with `-M30%`) |

### Forecast vs actual

| Slice | Forecast | Actual | Note |
|---|---|---|---|
| S1a | 300-340 | **734** | over 400: see deviation 1 |
| S1b | 270-330 | **690** | over 400: see deviation 1 |
| PR 1 | 570-670 | **1,424** (1,050+ / 374-, `git diff -M30% --shortstat 33d79fa..HEAD -- . ':(exclude)openspec/'`, no lockfile changed) | |

`openspec/` planning lines on their own line: 11 files, 1,175 insertions (excluded from the count). `git diff --stat 33d79fa HEAD -- packages .github` is empty (SX4: mutation N/A; `packages/core`, `packages/data`, `packages/i18n`, CI and Stryker files untouched).

S1a per file (`--numstat`): `calculator-content.contract.test.ts` 250+/130-, `calculator-rows.ts` 135+, `schema.test.ts` 74+/4-, `schema.ts` 44+/16-, `shown-figures.test.ts` 40+, `shown-figures.ts` 25+, `schema.test-d.ts` 16+.
S1b per file: `methodology.contract.test.ts` 145+/133- (renamed), `CalculatorBody.budget.test.ts` 123+/38-, `methodology-rows.ts` 86+, `budget-paths.ts` 29+, `docs.contract.test.ts` 22+/1-, `scripts.ts` 20+, `budget-page.astro` 18+/22-, `CalculatorView.test.ts` 10+/1-, `pages.test.ts` 6+/17-, `AGENTS.md` 5+/4-, `CalculatorView.astro` 1+/7-, `budget-copy.ts` 1+/1-.

### Deviations

1. **Both slices are over 400 lines (734 and 690).** The forecast assumed edits to the existing tests; the contracts had to become tables, so `calculator-content.contract.test.ts` (313 lines) was rewritten as per-pair `it.each` plus a fixture block for the set check (seven fixture cases, 380 changed lines on its own), and `methodology-concrete` was reshaped into per-row blocks plus a rectangle-area fixture block. The tests-only split rule (tasks.md, Split rules) was not taken by apply: each slice is one coherent commit with the tree green; the orchestrator decides whether to split the tests-only half into its own slice.
2. **`shownFigures` returns `{ figures, shopping }`** (panel figures by output key, shopping quantities as a list) instead of a flat list: a flat list cannot be generic (concrete's panel also lists money and metric figures). Rows pick the columns (`figuresOf` in `METHODOLOGY_ROWS`, `engine`/`figures` in `CONTENT_ROWS`). The rectangle-area cases of 1.4 use the local `definePage({ calculator: rectangleArea })` as the task says (a `rectangleAreaPage` module already exists from the foundation change).
3. **`ContentRow` members are declared as methods**, not function properties, so a typed row is assignable to the id-free `LooseRow` the generic contract reads (method bivariance). `rowOf` is the one place the erasure happens, without a cast.
4. **`setProblems(entries, rows, routed, pageless)` lives in `calculator-rows.ts`**, not `content.ts`: the trust-page contract still uses the 3-argument `setProblems` of `content.ts`. Entries are `{ id, locale, ownerReview }` records.
5. **Type test for "routed id without a row":** `routedRowOf(id: CalculatorPageId)` in `calculator-rows.ts` indexes `CONTENT_ROWS` with every page id, so a missing row is a typecheck error (seen red, negative proof 2).
6. **Seeded second id in the budget proof is exercised at the helper level.** The pure parts (`budgetPaths`, `extraKey`, `extraOf`, `entryOrThrow`) moved to `contract/__testing__/budget-paths.ts` and are tested with a fixture list (`rectangle-area` as the seeded second id). A second Astro build is impossible before S4b (no `PAGES` row, no routed id). The real build covers every id of `CALCULATOR_PAGES` and is measured per id.
7. **ES full-length proof is 40,645 B, not 40,573 B (+72 B; EN 40,371 B, was 40,304 B).** K5 makes the budget page read the sources of the real entry (`getEntry`), whose source names are longer than the two hard-coded placeholders. Within the 40,836 B pin (191 B headroom, was 263 B) and under 40,960 B (315 B). The FAQ placeholder change is 0 B as designed. If the orchestrator wants 40,573 B kept, the fixture must go back to hard-coded names for concrete (a K5 deviation); not done.
8. ~~**`pascalOf` lives in `views/scripts.ts`** with `SCRIPTS`, and `scripts.ts` carries one `eslint-disable-next-line`.~~ Superseded by the correction round: `pascalOf` is test support, and `src/env.d.ts` types `.astro` imports for both programs, so the disable is gone.
9. **Task 1.8 `rg engineFigures`:** the function lived in the methodology test (S1b scope); it is gone from S1a's files, and in S1b the replacement is named `figuresOfCase`, so `rg -n engineFigures apps/web/src` is empty at the tip.
10. **e2e and Lighthouse were not run** (group task P1.3; the built `dist` is byte-identical to `main`, so the browser result cannot change). Baseline e2e count not recorded.
11. `budget-page.astro` narrows the route param with `isCalculatorPage` (no cast).

### Scenario ids proven

S1a: [CP6] (per-id strict example: rectangle-area without `query`, misspelled figure, bad query, concrete example on rectangle-area and the reverse, stray row throw, no row fails on `id`), [CP7] (missing `es` and duplicate, per id, on fixtures and on the real entries), [CP9] mechanism (`shownFigures`; frontmatter, Markdown or engine changing alone fails, per row), [CP69] (staged row passes, third id named), CP10 length/parity per row, K1/K2/K3.
S1b: [TP22] (anchor once, entry links to it, page link), [TP23] formulas and honesty per row, [TP24] (published cases equal the engine, a figure changed in Markdown alone or in the engine alone fails; rectangle-area [TP40] cases as a fixture), [TP25] kept over the whole body, [SQ33] (paths from `CALCULATOR_PAGES x LOCALES`), [SQ34] (per id, per locale HTML size and headroom printed), [SQ35], [SQ36] (concrete-only seeded padding, `afterAll` deletes the keys; the isolation over the other ids was **not** proven at this tip: the loop read the seeded build without its padding and ran zero times, see the correction round), [SQ33] env by id and locale, [CP66] pin kept (40,645 of 40,836), K7 (`SCRIPTS` keys equal page ids, `pascalOf`), K13 (docs tokens).

### Negative proofs (applied, run red, reverted, `git status --porcelain` clean after each)

S1a:
1. Stray `asphalt: z.strictObject(...)` row in `WORKED_EXAMPLES`: red as a vitest startup error, `TypeError: code.charCodeAt is not a function` raised while printing the failure of `content.config.ts`, which calls `calculatorSchema` and throws `worked example for an id outside the registry: asphalt` at config load (the unit test `throws when the table has a row for an id outside the registry` covers the message and is green on the real table).
2. Deleted the `concrete` row of `CONTENT_ROWS`: `calculator-content`: `× has one entry per row of the table and locale` (`AssertionError: expected [ Array(1) ] to deeply equal []`), `× lists a calculator id of the registry for every row` (`expected [ 'en/concrete.md', 'es/concrete.md' ] to deeply equal []`); `npm run typecheck`: `calculator-rows.ts:78:54 ts(7053): Element implicitly has an 'any' type because expression of type '"concrete"' can't be used to index type '{}'`.
3. `shownFigures` ignoring the query (`''` instead of `search`): `× gives the three areas of rectangle-area for v=1&l=144` and `for ?v=1&l=144` (`expected [ '100.00', '11.11', '9.29' ] to deeply equal [ '120.00', '13.33', '11.15' ]`).

S1b:
4. Extra quoted key `'zz-extra'` in `SCRIPTS`: `× has a SCRIPTS row for each calculator page id and no other` (`expected [ 'concrete', 'zz-extra' ] to deeply equal [ 'concrete' ]`).
5. ES concrete fixture padded 185 characters (185 + 7 B of `<p></p>` = 40,837 B): `[CP66] Spanish full-length proof: 40837 B of 40836 B`, `× keeps the Spanish full-length proof at 40,836 B or less` (`expected 40837 to be less than or equal to 40836`).
6. `extraKey` ignoring the id (a padding variable would leak to every id): `× names the padding variable by id and locale` (`expected 'BUDGET_EXTRA_ES' to be 'BUDGET_EXTRA_CONCRETE_ES'`), `× pads only the page its variable names` (`expected +0 to be 12`).
7. Methodology Markdown `52.80` to `52.81` in the EN footing row: `× publishes the hand-verified cases of concrete that the engine reproduces in en`.
8. `METHODOLOGY_ROWS` renamed in AGENTS.md: `× names the methodology rows in a step`, `× names each per-id table in the step that edits it and in the list kept by hand`.

Reds seen before the GREEN code (right reason): schema tests (10 failed: `WORKED_EXAMPLES` absent, plus `schema.test-d.ts` typecheck failure on the missing export), `shown-figures.test.ts` (`Cannot find module './shown-figures.ts'`), `calculator-content` (`Cannot find module './__testing__/calculator-rows.ts'`), `methodology` (`Cannot find module './__testing__/methodology-rows.ts'`), budget (`Cannot find module '../../contract/__testing__/budget-paths.ts'`), pages and CalculatorView (`Cannot find module '../views/scripts.ts'`), docs (10 failed: tokens and `views/scripts.ts` absent). Several tests are green on arrival for the rules the old schema already had (an extra key on `concrete`); the negative proofs above cover the rules that matter.

### Measurements

| Item | main (33d79fa) | PR 1 tip | Limit |
|---|---|---|---|
| ES full-length proof (`CalculatorBody.budget`) | 40,573 B | **40,645 B** (deviation 7) | 40,836 pin, 40,960 |
| EN full-length proof | 40,304 B | 40,371 B | 40,960 |
| Real pages (`dist`) | | byte-identical | |
| `check:site` largest HTML | | unchanged (`budget js (calculator)` 38,778 B of 49,152; weight 162,541 B of 196,608) | |
| Budget test wall time (all builds, cached Astro) | 3.2 s | 3.3 s | |
| Vitest | 202 files, 3,732 tests after S1a | 202 files, 3,748 tests | |

### Dist diff against `main` (P1.2)

`main` (33d79fa) built into `<scratch>/dist-main-sf` before any code change (the branch carries openspec files only, so the branch start builds the same). `npm run build && diff -r <scratch>/dist-main-sf apps/web/dist` at the S1a tip, at the S1b tip and after `npm run verify`: empty each time (no hashed asset name changed, no normalisation needed).

### Gates

`npm run verify` exit 0 on the tip (36 s): format:check, sync and lint, typecheck, test:coverage, build, check:site, check:dist. `npm run lint` clean (`--max-warnings=0`).

## PR 1 correction round

One scoped correction of the review findings on 10c744a..ecba56e. Strict TDD; no budget raised; nothing pushed.

| # | Finding | What was done | Commit |
|---|---|---|---|
| 1 | MAJOR: the seeded isolation loop called `sizeOf('seeded', id)` without the padding, so the cache throws once a second id exists; it ran zero times and SQ36 was claimed | The cache (`buildCache`) and the loop (`leakedPadding`) moved to `contract/__testing__/budget-paths.ts`; the seeded padding is one `padding` constant passed to every `'seeded'` read. Proven with a fixture second id (`['concrete', 'rectangle-area']`, a fake build): red first with the loop moved verbatim (`Error: build 'seeded' was already made with other extra copy`, 2 tests), green after the fix; a leaking fake build is named (`['rectangle-area']`). SQ36 claim corrected above | e31c442 |
| 2 | MAJOR/MINOR: hand-written `discriminatedUnion` and the key pin | The union maps the keys of `WORKED_EXAMPLES` (type-guarded, `nonEmpty`) through `entryOf`, typed `EntrySchemas<Id>[Id]` so the mapped ids give the correlated union **without a cast**. `schema.test-d.ts` asserts `CalculatorFrontmatter['id']` equals `ExampleId` and each id keeps its own `workedExample`; the pin became "keys ⊆ registry ids" plus "one union member per row, in order". Calculator N+1 needs its row only | 95473f4 |
| 3 | MINOR: four copies of `LOCALES` | Imported from `routing/routes.ts` in `calculator-rows.ts`, the budget test, `calculator-content` and `methodology` contracts (older copies outside PR 1 untouched) | 0e8a03b |
| 4 | MINOR: `pascalOf` only used by tests | Moved into `views/CalculatorView.test.ts`, next to its test | ba9fbd9 |
| 5 | MINOR: eslint-disable in `views/scripts.ts` | The `*.astro` declaration moved from `contract/astro-modules.d.ts` to `src/env.d.ts`, included by the app program and added to `tsconfig.test.json`; disable removed. `astro check` 0 errors, `tsc -p tsconfig.test.json` and `npm run lint` clean | ba9fbd9 |
| 6 | MINOR: engine-drift test could pass vacuously | Asserts a starting-values case per row, drifts the first published case and expects the exact string (`default: bags 74 is 749` for concrete) | e6ae2c2 |
| 7 | MINOR: TP25 title | "names no calculator other than the published ones" | e6ae2c2 |
| 8 | MINOR: AGENTS.md step 11 sentence | Ends after "read both."; "The page module … is `definePage(…)`" is its own sentence; `docs.contract` green | baf2d86 |
| 9 | INFO: scenario tags | Whole-token test tagged [CP9] (was [CP10]); env naming tagged [SQ33] (was [SQ36]) | e6ae2c2, e31c442 |

### Negative proofs of the correction round (applied, run red, reverted, `git status --porcelain` clean)

9. `leakedPadding` never comparing (`seeded` against itself): `× names the id a build pads by another id’s variable` (`AssertionError: expected [] to deeply equal [ 'rectangle-area' ]`).
10. Seeded read without its padding (the original bug, moved verbatim before the fix): `× reads every other id from the seeded build and finds no leak`, `× names the id a build pads by another id’s variable` (`Error: build 'seeded' was already made with other extra copy`).
11. Union back to a hand list of one member (`[entryOf('concrete')]`): 8 unit tests red (`× selects one member of the union per row of the table, in its order`, `× parses a rectangle-area entry with its own example`, …, `AssertionError: expected [ 'id' ] to include 'workedExample'`) and both new type tests red (`× selects the frontmatter by every id of the table and no other`, `× keeps each id with its own worked example`).
12. `caseProblems` comparing the first column only: `× fails when one figure of concrete changes in the engine alone` (`expected [] to deeply equal [ 'default: bags 74 is 749' ]`), `× fails when one figure changes in the table alone`.
13. [CP70] concrete ES link anchor changed in `CONTENT_ROWS` (`#concreto` to `#hormigon`): `× links concrete/es to its methodology section` (`expected '…' to contain '](/es/metodologia#hormigon)'`).

Guards still without a negative proof of their own: `setProblems` unexpected and routed-approved branches (covered by the fixture cases of `calculator-content`, which assert each problem string on seeded entries; no production mutation was run).

### Gates after the round

`npm run format` no change; `npm run verify` exit 0 (202 files, 3,754 tests); `npm run build` then `diff -r <scratch>/dist-main-sf apps/web/dist` empty. ES full-length proof **40,645 B** of 40,836 B (EN 40,371 B), unchanged by the round.

### Judgment Day (PR 1)

Two blind judges on `10c744a..eb4b6e0`: both **APPROVED**, no CRITICAL or WARNING. Folded:

- The budget fixture passed the entry dates as raw ISO text (`2026-10-25`), while the view writes them in the long form of the locale (`25 de octubre de 2026`), so the proof measured about 11 B less per date than the routed page (pre-existing: the old fixture hard-coded the same ISO text). The formatter is now `apps/web/src/lib/calendar-day.ts` (unit test, red before the module existed), used by `CalculatorView.astro` and the fixture. **ES full-length proof: 40,678 B** (+33 B, three dates; 158 B to the 40,836 B pin), EN 40,379 B. The built site is unchanged (the view's output is the same string).
- The "writes the id in Pascal case" test checked a helper defined in the test file itself; removed. The island-file test that uses `pascalOf` against the files on disk stays.
- Task 2.6's stale "unchanged (40,573 B)" now carries the measured figures.

Noted, no change: the real-build isolation loop of [SQ36] runs over zero ids until a second id is routed (the seeded fixture proves its logic, as recorded); `buildCache` compares the padding with `JSON.stringify`, so the same padding in another key order fails loudly (a false positive, never a silent pass); PR 1 is 1,424 lines against a 400-line slice budget (accepted by the orchestrator, like calculator-core G1).

## PR 2 (`feat/square-footage-content`): S2 done

Mode: strict TDD (`npm test`). Nothing was pushed. Pushing, CI, the four reviewers, Judgment Day, the PR and the merge belong to the orchestrator (P2.4).

### Baseline (3.1)

The orchestrator created `feat/square-footage-content` from `main` at 9aac302, which already contains PR 1, so the PR 1 tip and `main` are the same commit (the branch name differs from the planned `feat/square-footage-p2-entries`). `npm run verify` exit 0 at 9aac302 (203 files, 3,755 tests). `npm run build` copied to `<scratch>/dist-prev-sf2` before any change. e2e count: 324 tests in 7 files (`npx playwright test --list` in `tooling/site-browser`; not run, see below).

### Commit

| Slice | Commit | Subject | Changed lines |
|---|---|---|---|
| S2 | 7434baa | docs(content): draft the square footage entries for review | 243+ / 2- (245) |

Forecast 200-240, actual **245** (`git diff -M --shortstat 9aac302..7434baa -- . ':(exclude)package-lock.json' ':(exclude)tooling/site-browser/package-lock.json' ':(exclude)openspec/'`, 4 files): `en/rectangle-area.md` 107+, `es/rectangle-area.md` 107+, `calculator-rows.ts` 26+, `end-state.contract.test.ts` 3+/2-. Under 400; no split. `git diff --stat main -- packages/` is empty (SX4: mutation N/A; core, data, i18n, CI and Stryker untouched).

### TDD cycle evidence

| Task | RED | GREEN | REFACTOR |
|---|---|---|---|
| 3.2 | `calculator-rows.ts` gains the `rectangle-area` row (local `definePage({ calculator: rectangleArea })`, `updated` 2026-10-27, NIST SP 811 Appendix B, `engine` through `shownFigures(module, example.query)`, `figures` `[ft2, yd2, m2, '12 ft', '10 ft']`, methodology links `/methodology#square-footage`, `/es/metodologia#pies-cuadrados`); `end-state` calculator entries 2 to 4. `npx vitest run apps/web/src/contract/calculator-content apps/web/src/contract/end-state`: **23 failed** / 48 passed (entries missing: set check, frontmatter, section ids, sources, figures, words, parity, 8 FAQ, register, links, end-state count) | | |
| 3.3 | (3.2) | EN entry: the same run, 13 failed, all `rectangle-area/es` or the cross-locale checks | |
| 3.4 | (3.2) | ES entry: 71 / 71 passed; `registerProblems` empty | |
| 3.5 | | | `npm run format` (no change to the slice), `npm run sync && npm run lint` clean, `npm run typecheck` clean, `npm test` 203 files, 3,775 tests |

### Work unit evidence

| Evidence | Value |
|---|---|
| Focused test | `npx vitest run apps/web/src/contract/calculator-content apps/web/src/contract/end-state`: 2 files, 71 passed |
| Runtime harness | `npm run build && npm run check:site`: exit 0, `pending ownerReview entries: 2` (printed, not failing); `diff -r <scratch>/dist-prev-sf2 apps/web/dist` empty |
| Rollback boundary | revert 7434baa: the two `.md` entries, the `rectangle-area` row of `CONTENT_ROWS`, the end-state count |

### Scenario ids proven

[CP6] (both entries parse with the strict per-id schema; `workedExample` `{query: v=1&l=144, ft2: 120.00, yd2: 13.33, m2: 11.15}`; negative proof 3 through the build), [CP7] (one entry per row and locale, no duplicate, on the real entries), [CP8] content side (NIST SP 811 Appendix B, `https://www.nist.gov/pml/special-publication-811`, retrieved 2026-10-27, in both; no review marker in the bodies), [CP9] (the example equals the controller's figures for `v=1&l=144`; `120.00`, `13.33`, `11.15`, `12 ft`, `10 ft` in Formulas; one side changed alone fails, per locale), [CP10] (800-1,500 words, equal `h2` and FAQ counts, 8 FAQ items of at most 450 characters), [CP69] (staged `pending` entries in `PAGELESS` pass the set check; `check:site` prints the pending count), [CP70] content side (Formulas figures, NIST source, methodology links; the `approved` flip and the owner record are S4a), [RAP3] figures in Formulas, [TP39] (the anchors `#square-footage` / `#pies-cuadrados` do not exist yet and nothing renders the staged entries: the dist is byte-identical).

### Negative proofs (3.8; applied, run red, reverted, `git status --porcelain` clean after each apart from the foreign `.claude/` worktree)

1. EN Formulas `12 ft` to `13 ft` (every occurrence inside the Formulas section): `× keeps the worked example of rectangle-area/en equal to the engine and in Formulas` (`expected [ Array(1) ] to deeply equal []`: `12 ft is missing from the Formulas section`), `× fails when the frontmatter, the Markdown or the engine of rectangle-area/en changes alone`.
2. ES FAQ item 8 dropped: `× has the same number of h2 headings and FAQ items in both locales of rectangle-area` (`expected … to have a length of 7 but got 8`), `× has eight plain-text FAQ items of at most 450 characters in rectangle-area/es` (`… length of 8 but got 7`).
3. EN `ownerReview: maybe`: `npm run build` exit 1, `[InvalidContentEntryDataError] calculators → en/rectangle-area data does not match collection schema. ownerReview: Invalid option: expected one of "pending"|"approved"`.
4. ES `Ingresa` to `Ingrese`: `× passes the Spanish register check for rectangle-area` (`expected [ 'Ingrese' ] to deeply equal []`).

### Measurements (3.6)

| Item | PR 1 tip (9aac302) | S2 tip | Limit |
|---|---|---|---|
| Words (contract's `wordsOf`) | | EN **1,290**, ES **1,346** | 800-1,500 |
| FAQ answers (characters) | | EN 289, 227, 241, 194, 229, 306, 229, 230; ES 297, 268, 290, 227, 250 (254 after 478c3e0), 372, 269, 237 | 450 |
| ES full-length proof (`[CP66]`) | 40,678 B | **40,678 B** (EN 40,389 B) | 40,836 pin, 40,960 |
| Real pages (`dist`) | | byte-identical (`diff -r` empty, no normalisation needed) | |
| `check:site` | pending 0 | pending **2**; largest HTML 33,753 B, calculator JS 38,778 B, calculator weight 162,541 B (unchanged) | |
| Vitest | 203 files, 3,755 tests | 203 files, 3,775 tests | |

### Gates

`npm run verify` at the S2 tip: **exit 1, only because of a foreign untracked worktree** `.claude/worktrees/agent-ae75461ed96ba2c82/` (another agent's in-progress PR 3 files) that `prettier --check .` and `eslint .` scan; every reported file is under that path. The same chain with that path excluded is **exit 0**: `prettier --check . --ignore-path .gitignore --ignore-path .prettierignore --ignore-path <.claude>` (all matched files formatted; `git ls-files | prettier --check` also clean), `npm run sync`, `eslint . --max-warnings=0 --ignore-pattern '.claude/**'` (0 problems), `npm run typecheck`, `npm run test:coverage` (203 files, 3,775 tests), `npm run build`, `npm run check:site`, `npm run check:dist`. CI checks out no `.claude/` directory. e2e and Lighthouse not run (P2.3 is the orchestrator's; the built `dist` is byte-identical to `main`, so the browser result cannot change).

### Deviations

1. Branch `feat/square-footage-content` instead of `feat/square-footage-p2-entries` (created by the orchestrator from `main`, which holds PR 1).
2. The `figures` of the row hard-code `12 ft` and `10 ft` (the sides of `v=1&l=144` with the 120 in default width, as written in Formulas) instead of deriving them: `dimensionText` belongs to the page change (S3a). The engine side still pins the example through the three areas.
3. Shortstat 245 against a 200-240 forecast (+5).
4. Early in the slice `npm run format` (`prettier --write .`) ran while the foreign worktree existed, so it may have rewritten that worktree's in-progress files; after that only `prettier --check` and scoped `--write` were used. Its owner should re-check its formatting.

## Owner review artifact

Prepared for the orchestrator to present (K12). It does not wait for the owner. Entries frozen at commit **7434baacad54827889f163a937bb05f9f25fd18d** (`docs(content): draft the square footage entries for review`).

Changed after the freeze, at the owner's request: 478c3e0 on `main` (befd9ac before the rebase; `docs(content): record the owner approval of the square footage entries`) replaced the Spanish `se encimen` with `se superpongan` in two places of the ES entry (the Methodology paragraph on L-shaped rooms and FAQ 5). The text below shows the approved wording; ES FAQ 5 is 254 characters after the change (250 at 7434baa), still under 450. Nothing else changed.

- `apps/web/src/content/calculators/en/rectangle-area.md`
- `apps/web/src/content/calculators/es/rectangle-area.md`

| | English | Spanish |
|---|---|---|
| Title (page H1 and catalog title arrive in S3a: `Square Footage Calculator` / `Calculadora de pies cuadrados`) | How to use the square footage calculator (first section heading) | Cómo usar la calculadora de pies cuadrados (first section heading) |
| `updated` | 2026-10-27 | 2026-10-27 |
| Words | 1,290 | 1,346 |
| Worked example | 12 ft × 10 ft = 120.00 square feet; 120 ÷ 9 = 13.33 square yards; 120 × 0.09290304 = 11.1483648, which rounds to 11.15 square meters | 12 ft × 10 ft = 120.00 pies cuadrados; 120 ÷ 9 = 13.33 yardas cuadradas; 120 × 0.09290304 = 11.1483648, que se redondea a 11.15 metros cuadrados |
| Sources | NIST SP 811, Appendix B (conversion factors), `https://www.nist.gov/pml/special-publication-811`, retrieved 2026-10-27 (the Appendix B table read on that date: square foot to square meter 9.290 304 E-02, square yard 8.361 274 E-01) | NIST SP 811, Appendix B (factores de conversión), same URL and date |

Spanish terms used: pies cuadrados, yardas cuadradas, metros cuadrados, `ft` and `in` in every dimension (K8), cuarto, piso, loseta, alfombra, cinta métrica, clóset, nicho, isla de cocina, gabinetes, huella (footprint), colocación (layout), se superpongan (overlap), anuncio de venta, avalúo, área habitable terminada; imperatives in tú: Mide, Ingresa, Lee, Presiona, Usa, Escribe, Revisa, Divide, Suma, Resta, Multiplica, Deja, Redondea, Confirma.

Claims the owner should check: the waste allowance ("installers commonly add about 10 percent for a simple layout and more for a diagonal or patterned one", tips and FAQ 6), "a quote for carpet is given by the square yard" (FAQ 2), and the sentence that the measured area is not the finished living area of a listing or an appraisal (tips).

### English (`apps/web/src/content/calculators/en/rectangle-area.md`)

- First heading: How to use the square footage calculator
- `updated`: 2026-10-27; `ownerReview`: pending

**Formulas and worked example** (verbatim):

> The area of a rectangle is its length times its width:
>
> - Area in square feet = length in feet × width in feet.
> - Area in square yards = area in square feet ÷ 9, because a square yard is 3 ft × 3 ft.
> - Area in square meters = area in square feet × 0.09290304.
>
> The last factor is exact. A foot is defined as exactly 0.3048 meters, so a square foot is 0.3048 × 0.3048 = 0.09290304 square meters. Inches count as twelfths of a foot, so 6 in is 0.5 ft and 12 ft 6 in is 12.5 ft.
>
> Worked example: a room 12 ft long and 10 ft wide.
>
> - The area is 12 ft × 10 ft = 120.00 square feet.
> - In square yards, 120 ÷ 9 = 13.33 square yards.
> - In square meters, 120 × 0.09290304 = 11.1483648, which rounds to 11.15 square meters.
>
> If the same room were 12 ft 6 in long, the area would be 12.5 × 10 = 125.00 square feet, which is 13.89 square yards and 11.61 square meters.
>
> The calculator keeps exact fractions from the first input to the last step, and it rounds the figures only when it shows them. The page [How we calculate](/methodology#square-footage) lists the formulas and the cases we test.

**FAQ** (verbatim):

1. **How do I calculate the square footage of a room?** Measure the length and the width in feet and multiply them. A room 12 ft long and 10 ft wide is 12 × 10 = 120 square feet. If a side has inches, turn them into feet first by dividing by 12, or type the measurement as you read it, such as 12 ft 6 in, and the calculator converts it for you. (289 characters)
2. **How do I convert square feet to square yards?** Divide by 9, because a square yard is 3 ft by 3 ft. A 120 square foot room is 120 ÷ 9 = 13.33 square yards. The calculator shows square yards next to square feet, which helps when a quote for carpet is given by the square yard. (227 characters)
3. **How do I convert square feet to square meters?** Multiply by 0.09290304, the exact number of square meters in one square foot. A 120 square foot room is about 11.15 square meters. To go the other way, divide square meters by 0.09290304, or press Metric (m, cm) and type the sides in meters. (241 characters)
4. **How do I enter feet and inches?** Type them as you read the tape: 12 ft 6 in, or 12 ft 6 1/2 in for a fraction. A plain number is read in feet, so type 150 in to mean 150 inches. A room 12 ft 6 in by 10 ft is 125.00 square feet. (194 characters)
5. **How do I find the square footage of an L-shaped room?** Split it into two rectangles that do not overlap and add their areas. For example, a 12 ft by 10 ft main area with a 6 ft by 4 ft nook is 120 + 24 = 144 square feet. Run the calculator once for each rectangle and add the results. (229 characters)
6. **How much extra flooring should I buy?** The calculator adds nothing for waste. Installers commonly add about 10 percent for cuts on a simple layout, and more for a diagonal or patterned one. For a 120 square foot room, 10 percent extra is 132 square feet. Check the recommendation of your product and your installer, then round up to whole boxes. (306 characters)
7. **How do I find the square footage of a wall?** Multiply the width of the wall by its height. A wall 12 ft wide and 8 ft high is 96 square feet. For paint, subtract each door and window as its own rectangle, then compare the result with the coverage printed on the paint label. (229 characters)
8. **Can I use meters and centimeters?** Yes. Press Metric (m, cm), then type meters or centimeters, such as 3.5 m or 350 cm. A plain number is read in meters, and the result leads with square meters. Switching units never changes your numbers, only how they are written. (230 characters)

### Spanish (`apps/web/src/content/calculators/es/rectangle-area.md`)

- First heading: Cómo usar la calculadora de pies cuadrados
- `updated`: 2026-10-27; `ownerReview`: pending

**Formulas and worked example** (verbatim):

> El área de un rectángulo es su largo por su ancho:
>
> - Área en pies cuadrados = largo en pies × ancho en pies.
> - Área en yardas cuadradas = área en pies cuadrados ÷ 9, porque una yarda cuadrada mide 3 ft × 3 ft.
> - Área en metros cuadrados = área en pies cuadrados × 0.09290304.
>
> El último factor es exacto. Un pie mide por definición exactamente 0.3048 metros, así que un pie cuadrado son 0.3048 × 0.3048 = 0.09290304 metros cuadrados. Las pulgadas cuentan como doceavos de pie, así que 6 in son 0.5 ft y 12 ft 6 in son 12.5 ft.
>
> Ejemplo resuelto: un cuarto de 12 ft de largo y 10 ft de ancho.
>
> - El área es 12 ft × 10 ft = 120.00 pies cuadrados.
> - En yardas cuadradas, 120 ÷ 9 = 13.33 yardas cuadradas.
> - En metros cuadrados, 120 × 0.09290304 = 11.1483648, que se redondea a 11.15 metros cuadrados.
>
> Si el mismo cuarto midiera 12 ft 6 in de largo, el área sería 12.5 × 10 = 125.00 pies cuadrados, es decir 13.89 yardas cuadradas y 11.61 metros cuadrados.
>
> La calculadora conserva fracciones exactas desde el primer dato hasta el último paso, y redondea las cifras solo cuando te las muestra. La página [Cómo calculamos](/es/metodologia#pies-cuadrados) detalla las fórmulas y los casos que probamos.

**FAQ** (verbatim):

1. **¿Cómo calculo los pies cuadrados de un cuarto?** Mide el largo y el ancho en pies y multiplícalos. Un cuarto de 12 ft de largo y 10 ft de ancho tiene 12 × 10 = 120 pies cuadrados. Si un lado tiene pulgadas, pásalas primero a pies dividiendo entre 12, o escribe la medida como la lees, por ejemplo 12 ft 6 in, y la calculadora la convierte por ti. (297 characters)
2. **¿Cómo paso pies cuadrados a yardas cuadradas?** Divide entre 9, porque una yarda cuadrada mide 3 ft por 3 ft. Un cuarto de 120 pies cuadrados tiene 120 ÷ 9 = 13.33 yardas cuadradas. La calculadora muestra las yardas cuadradas junto a los pies cuadrados, lo que ayuda cuando te cotizan la alfombra por yarda cuadrada. (268 characters)
3. **¿Cómo paso pies cuadrados a metros cuadrados?** Multiplica por 0.09290304, el número exacto de metros cuadrados que tiene un pie cuadrado. Un cuarto de 120 pies cuadrados tiene aproximadamente 11.15 metros cuadrados. Para ir al revés, divide los metros cuadrados entre 0.09290304, o presiona Métrico (m, cm) y escribe los lados en metros. (290 characters)
4. **¿Cómo escribo pies y pulgadas?** Escríbelos como los lees en la cinta: 12 ft 6 in, o 12 ft 6 1/2 in para una fracción. Un número solo se lee en pies, así que escribe 150 in para decir 150 pulgadas. Un cuarto de 12 ft 6 in por 10 ft tiene 125.00 pies cuadrados. (227 characters)
5. **¿Cómo calculo los pies cuadrados de un cuarto en forma de L?** Divídelo en dos rectángulos que no se superpongan y suma sus áreas. Por ejemplo, un área principal de 12 ft por 10 ft con un nicho de 6 ft por 4 ft tiene 120 + 24 = 144 pies cuadrados. Usa la calculadora una vez por cada rectángulo y suma los resultados. (254 characters; 250 at 7434baa with `se encimen`)
6. **¿Cuánto piso de más debo comprar?** La calculadora no agrega nada por desperdicio. Los instaladores suelen agregar aproximadamente 10 por ciento por los cortes en una colocación sencilla, y más en una diagonal o con patrón. Para un cuarto de 120 pies cuadrados, 10 por ciento de más son 132 pies cuadrados. Revisa lo que recomiendan tu producto y tu instalador, y luego redondea hacia arriba a cajas enteras. (372 characters)
7. **¿Cómo calculo los pies cuadrados de una pared?** Multiplica el ancho de la pared por su altura. Una pared de 12 ft de ancho y 8 ft de alto tiene 96 pies cuadrados. Para pintar, resta cada puerta y cada ventana como su propio rectángulo, y luego compara el resultado con la cobertura que trae la etiqueta de la pintura. (269 characters)
8. **¿Puedo usar metros y centímetros?** Sí. Presiona Métrico (m, cm) y escribe metros o centímetros, por ejemplo 3.5 m o 350 cm. Un número solo se lee en metros, y el resultado empieza por los metros cuadrados. Cambiar de unidad nunca cambia tus números, solo cómo se escriben. (237 characters)

Approval sentences the owner can answer:

- "approve EN": approves `apps/web/src/content/calculators/en/rectangle-area.md` as frozen at 7434baa.
- "approve ES": approves `apps/web/src/content/calculators/es/rectangle-area.md` as frozen at 7434baa.

Not approved yet. `ownerReview` stays `pending` until the owner's approval is recorded in the section Owner approval (K12).

## Owner approval (K12)

- **Date:** 2026-10-27 local time (America, UTC−3; the owner's message came shortly before 478c3e0, committed 2026-10-27 22:07:22 −0300), which is 2026-10-28 UTC. Both dates refer to the same message.
- **Place:** the Claude Code chat with the owner (Rodrigo Collins), in reply to the review summary above. His words: "si, apruebo con se superpongan".
- **Approved entries:** `apps/web/src/content/calculators/en/rectangle-area.md` and `apps/web/src/content/calculators/es/rectangle-area.md`, both, with one change he asked for: the Spanish `se encimen` (Mexican-leaning) becomes the neutral `se superpongan` (two places in the ES entry), applied on `feat/square-footage-content` in the same commit as this record.
- **Recorded by:** the orchestrator, from the owner's message. The `ownerReview: approved` flip itself stays task 6.9 (S4a), which may now proceed.

## PR 3 (on `feat/square-footage-content`): S3a and S3b done

Written on branch `feat/square-footage-page`, created from `main` (9aac302, PR 1 included; PR 2 not in that base), in the worktree `.claude/worktrees/agent-ae75461ed96ba2c82`. The orchestrator then cherry-picked the four commits onto PR 2 on `feat/square-footage-content`; the SHAs below are the cherry-picked ones (pre-rebase: a9a8bbe, 7506044, 6f0fb4b and the progress commit), and PR 2 + PR 3 ship together (candidate 9aac302..6fd9830). Strict TDD; every test seen red for the right reason first. Nothing pushed.

### Commits and size (`git diff -M --shortstat`, lockfiles and `openspec/` excluded)

| Slice | Commit | Lines | Forecast |
|---|---|---|---|
| S3a | c715c04 `feat(web): give the square footage page its answer and unit sentences` | 409 (347 + 62) | 265-315 |
| S3b-1 | ba87276 `feat(web): reserve the answer and notice lines per page in the head` | 404 (353 + 51) | (half of 300-350) |
| S3b-2 | 3f7efa3 `test(e2e): stage the square footage record and the per-page edges` | 233 (217 + 16) | (half of 300-350) |

S3b measured 637 as one commit, so the split rule (over 400: move the tests-only half to its own slice inside the same PR) was applied: S3b-1 is the mechanism with its unit tests, S3b-2 is the e2e side (`edgesOf`, per-page `BEFORE_EDGE`, the staged record and the recipe/docs tokens). Both are green on their own. PR 3 total: 36 files, 915 + 127 = 1,042 lines against 565-665 forecast.

Overrun causes: S3a 409 (9 over the line): tests carry most of it (the RAP table, the catalog test, the RAP7 contract test, the proof move edits). S3b 637 against 300-350: the test side was under-forecast (reserve builder cases 56, CalculatorView mock test 55, override rewrite about 85, styles contract +60, BaseLayout +40, css-media test 40) plus the 112-line e2e record.

### Tasks

- 4.1 done (branch from `main`; `npm ci`; baseline build copied to a scratch dir).
- 4.2-4.9, 4.11-4.14 done (progress recorded in b97e3c6).
- 4.10 done by the orchestrator in 6fd9830 (`test(web): read the square footage content row from its real page module`), after the cherry-pick onto PR 2: the `rectangle-area` row of `calculator-rows.ts` reads `rectangleAreaPage` instead of the local `definePage` of 3.2.
- 5.1-5.15 done. e2e and Lighthouse run (below).

### Scenarios proven

RAP1 (`packages/i18n/src/rectangle-area-catalog.test.ts`, `catalog-content.test.ts`, `i18n-contract.test-d.ts` exact union), RAP2 (controller default sentences, 4 of them; `page-view.test.ts` answer and not-running note), RAP3 (`present.test.ts` and the four cases in both locales), RAP4 (metric headline and sentence end, four cases, both locales), RAP5, RAP6, RAP7 (`contract/old-title.contract.test.ts`: no match of either old title in apps, packages, tooling), RAP8 (`git diff --stat main -- packages/core packages/data` empty). CWC33 and CWC38 on the slot-free module (`slot-free-proof.contract.test.ts`, entry `slot-free-entry.ts`, page `slot-free-page.ts`; the CWC32 block untouched), CWC40 prep (AGENTS steps 12 and 14, docs.contract rows). CP65 (no-answer case on the slot-free module; head-style fixture; `CalculatorView.reserve.test.ts` with a mocked `PAGES` row; concrete emits none), CP64 (`reserve.test.ts` builder and throws; `styles.contract` over every `PAGES.reserve` plus seeded px and missing-edge cases), CP60/CP61 mechanism (`edgesOf`, `layout.spec.ts` per-page and per-block `BEFORE_EDGE` through `edgesOf` on the served CSS), SQ37 staged (`rectangle-area-pages.ts`, `staged: E2eSpec`), SS32 (BaseLayout test: one head style, none in the body). The e2e record's figures were checked against the page controller (200.00/22.22/18.58, 129.17/14.35/12.00 for 4 m by 3 m).

### Negative proofs (applied, run red, reverted; `git status --porcelain` clean)

S3a: (1) `{value} sq ft` for en `areaFt2`: catalog test and 5 controller cases red. (2) `answerSlot` dropped: 13 red (page-view answer, 4 default sentences, RAP3/RAP4 cases). (3) ES template `Un área de {length} pies por {width}`: catalog tests and ES sentences red (8). (4) `slot-free-page.ts` pointed at the real page: CWC4 graph test, the override no-answer case and the body test red. (5) Old Spanish title back in the catalog: RAP6 title test and RAP7 contract red.
S3b: (6) style emitted in `<body>`: 2 BaseLayout tests and the override test red. (7) concrete row given a `reserve`: the CalculatorView 0-B case, both pages tests and the built-CSS rem-set test red. (8) unit check removed from the breakpoint helper: `flags a px breakpoint` red. (9) `edgesOf` ignoring `.calculator`: 3 css-media tests red. (10) `RECTANGLE_AREA.answer` renamed: `tsc` in `tooling/site-browser` fails (`'answered' does not exist in type 'E2eSpec'`).

### Gates

- `npm run verify` exit 0 (209 files, 3,817 tests; check:site and check:dist pass).
- Dist diff against the base build (`main`/PR 1 tip): `diff -r` empty, at the S3a tip and at the PR tip. Nothing hashed changed.
- ES concrete full-length proof: 40,678 B of 40,836 B (EN 40,389 B); unchanged by S3a and S3b (K6 adds 0 B on concrete).
- `npm run test:e2e`: 324 passed (1.2 min). The suite has no new test; `layout.spec.ts` now reads its before-edge widths per page and block from the served CSS and passes for concrete with the same bounds. `npm run lighthouse`: all 6 URLs pass. `npm run typecheck --prefix tooling/site-browser` clean.
- SX4: `git diff --stat main -- packages/core packages/data .github/workflows/ci.yml` empty.

### Deviations

1. S3b split in two commits (above).
2. [CP65] "CalculatorBody rejects a `style` prop at type level (`@ts-expect-error`)" is not expressible: `.astro` components are typed through a `*.astro` shim in the test program. Replaced with a source assertion (no `style` in `CalculatorBody.astro`) and a runtime one (a passed `style` renders no attribute); `astro check` types the real call sites.
3. `PageEntry.reserve` is read through `headStyleOf(entry)` (new, `lib/pages.ts`) so the view and the budget page share one rule and the view test can mock `PAGES`.
4. The existing headless `rectangle-area/controller.test.ts` cases moved to the slot-free module in the same file instead of a second controller test file; the RAP cases are added to it.
5. `BaseLayout` prop typed `style?: string | undefined` (exactOptionalPropertyTypes).
6. RAP1's catalog test lives in `packages/i18n/src/rectangle-area-catalog.test.ts`, beside the catalogs it pins, not in `apps/web`. Task 4.2 lists the i18n tests among its files, so the location matches the tasks.
7. The staged record's `bounds` use 100,001 ft (the descriptor max is 100,000 ft) and `hints` list both inputs; neither is exercised until the `E2E` row exists (S4b), so they are checked only by type until then.

### For the orchestrator

- Task 4.10: done in 6fd9830.
- Rebase note: PR 2 edits `calculator-rows.ts` and `end-state.contract.test.ts` and adds the two entries; this branch touches neither. `AGENTS.md` and `docs.contract.test.ts` are edited here (steps 12, 14, Kept by hand).
- Not done by design: measured counts, the `reserve.ts` values, the `PAGES`/`SCRIPTS`/`E2E` rows, the route (PR 4).

## PR 2+3 correction round

One scoped round on `feat/square-footage-content` after the four-lens review of 9aac302..6fd9830 (all four lenses PASS; these are its minors). Strict TDD for the code and test fixes; nothing pushed.

| # | Finding | Done | Commit |
|---|---|---|---|
| 1 | `headStyleOf` gave `''` for `reserve: {}`, so `BaseLayout` rendered an empty `<style></style>` | `reserveCss` returns `undefined` for an empty reserve; new cases in `reserve.test.ts` and `pages.test.ts` (a row with `reserve: {}` has no head style) | a9fc19a |
| 2 | `BaseLayout` `style?: string` rendered any string with `set:html` | Branded `ReserveCss` (`lib/reserve.ts`), returned by `reserveCss` and `headStyleOf` only; `BaseLayout` takes `style?: ReserveCss`; the one assertion sits in `reserve.ts` with a reasoned lint disable; `reserve.test-d.ts` refuses a plain string | a9fc19a |
| 3 | `PROPERTIES` was not checked against `keyof Reserve` | `RESERVE_PROPERTIES` `satisfies readonly (readonly [keyof Reserve, \`--${string}\`])[]`, and `reserve.test-d.ts` requires its keys to equal `keyof Reserve` | a9fc19a |
| 4 | The reserve doc comment and AGENTS.md step 14 did not say a page reserve replaces the shared ladder | Both now say a property set on `.calculator` replaces, at every width, the `:root` ladder of `calculator.css` for that property | a9fc19a, fccc760 |
| 5 | `calculator.css` comment "on its own body (CP65)" was stale | Points to the head `<style>` built from `PAGES[id].reserve` | fccc760 |
| 6a | The `PAGES` reserve loop of `styles.contract.test.ts` checked nothing | The rows with a reserve are listed and asserted empty ("flips at PR 4 (S4b)"); the check runs over that list | 77d284d |
| 6b | The [CP64] "a condition with no length fails" check was dropped with the shared helper | `breakpointProblems` reports `no length`; seeded `prefers-reduced-motion` case | 77d284d |
| 7 | `layout.spec.ts` imports `apps/web/src/__testing__/css-media.ts`, a rule AGENTS.md did not state | Documented (smaller than moving the helper, which `styles.contract.test.ts` shares): the browser-tests paragraph names what the specs import from `apps/web` | fccc760 |
| 8 | `old-title.contract.test.ts` globbed the working tree (ignored mutation reports and browser test results counted locally) | Reads `git ls-files --cached --others --exclude-standard` under `apps`, `packages`, `tooling`: ignored files and `.claude/` worktrees never count, a new untracked source still does | bf7dbff |
| 9 | apply-progress: stale PR 3 SHAs and branch, 4.10 marked deferred, artifact frozen at 7434baa without the later wording change, one approval date, RAP1 location | Updated above (PR 3 SHAs c715c04/ba87276/3f7efa3/b97e3c6 on `feat/square-footage-content`, 4.10 done in 6fd9830, `se superpongan` note and ES FAQ 5 = 254 characters, both approval dates, deviation 6) | this commit |

### Negative proofs of the round (applied, run red, reverted; `git status --porcelain` clean apart from the foreign `.claude/` worktree)

1. Before the fix: `reserveCss({})` and `headStyleOf({ ...concrete, reserve: {} })` returned `''`: `× returns nothing for an empty reserve`, `× is nothing for a row whose reserve is empty`. After it, putting `return '' as ReserveCss` back reds the same two.
2. `ReserveCss` made a plain `string`: `× is returned by reserveCss and refuses a plain string` (`Unused '@ts-expect-error' directive`). `CalculatorView.astro` passing a `string | undefined` style: `astro check` `ts(2322)` (`Type 'string | undefined' is not assignable to type 'ReserveCss | undefined'`).
3. `Reserve` given a `hint?: LineSteps` key with no row: `× gives every key of a reserve its custom property` in `reserve.test-d.ts`.
4. The `no length` line removed from `breakpointProblems`: `× flags a condition with no length`.
5. The concrete row given `reserve: { answer: [5] }`: `× has no page row with a reserve before PR 4 (S4b), …`.
6. Before the fix, an ignored `packages/core/reports/zz-probe.json` holding the old English title: `× is found in no source, test or catalog`. After it the ignored probe passes, and an untracked `apps/web/src/zz-probe.ts` with the same title is still red.

### Gates after the round

- `npm run format`: no change. `npm run verify` exit 0 (210 files, 3,843 tests; build, check:site, check:dist pass), run at fccc760; this commit adds only this file.
- `npm run typecheck --prefix tooling/site-browser` clean.
- Dist diff: `diff -r apps/web/dist` against the PR 2+3 baseline build is empty (the CSS comment is stripped by the build).
- ES concrete full-length proof: 40,678 B of 40,836 B (EN 40,389 B), unchanged.

## PR 4 (`feat/square-footage-live`): S4a and S4b done

Branch `feat/square-footage-live`, created from `origin/feat/square-footage-content` (6fd9830) and rebased onto `origin/main` 889af79 (PR 2+3 merged as #103, with its correction round) after the first S4a commit. Strict TDD; every new test seen red for the right reason first. Nothing pushed. Worktree `.claude/worktrees/agent-a46898f42c1fd4900`.

PR 2+3 review record (from the orchestrator): Judgment Day APPROVED by both judges, with one cosmetic suggestion (two sentences merged on one line of the `reserveCss` doc comment in `apps/web/src/lib/reserve.ts`), folded here as f8f0167. CI on #103 green; `site-browser` 3m51s.

### Owner gate (6.8, 7.1)

The section "Owner approval (K12)" above holds the record: 2026-10-27 local time (UTC−3), which is 2026-10-28 UTC, the Claude Code chat with the owner, both entries, with the `se superpongan` change. The `ownerReview: approved` flip (1d3db73) is the last commit of S4a and comes after the commit that recorded the approval (478c3e0 on `main`) in `git log`. Gate proven by reading: without that section apply stops at 6.8 and edits neither entry (no approval was simulated in the repository). The entries changed after the frozen 7434baa only by the two `se superpongan` edits the record names, so the owner review artifact was not regenerated.

### Commits and size (`git diff -M --shortstat`, lockfiles and `openspec/` excluded)

| Slice | Commit | Lines | Forecast |
|---|---|---|---|
| S4a-1 | a456572 `test(e2e): pin the square footage reserve and its layout edges` | 77 (71 + 6) | 25-45 (S4a) |
| JD fold | f8f0167 `docs(web): split the reserve builder comment into its two sentences` | 6 (4 + 2) | - |
| S4a-2 | d994508 `test(web): read each calculator page's sources, example and no-script state from its row` | 88 (58 + 30) | - |
| S4a-3 | 1d3db73 `docs(content): approve the square footage entries` | 10 (8 + 2) | - |
| S4b | 1383264 `feat(web): publish the square footage calculator` | 385 (315 + 70) | 210-290 |

PR 4 total: 40 files, 455 + 109 = 564 lines against 235-335. S4b measured 563 in its first form; the split rule moved staged-legal test work to S4a (S4a-2: the per-page sources of the site-check fixture, the `exampleOf` lookups of `HomeView.test.ts` and the budget test, the `PageEntry` typing of `pages.test.ts`, the [TP31] fixture case, and `no-js.spec.ts` read from each `E2E` record), the methodology fixture block was kept instead of deleted, and the built-page test was trimmed to what `check:site` does not already check. Overrun causes: the forecast missed the built-page test (89), the pinned lists outside `end-state` (`routes.test.ts`, `files.test.ts`, `templates.test.ts`, `site-catalog.test.ts`), the concrete-only `no-js.spec.ts`, and the site-check fixture that linked QUIKRETE from every calculator page.

### Sweep (6.3, macOS, K11)

Scratch worktree at 6fd9830 with the route wiring applied and never committed (`ROUTES` row, `CALCULATOR_PAGES`, `PAGES` row without reserve, `SCRIPTS` row, entry, island, site keys), built and served with `wrangler dev`; removed afterwards (`git worktree list` has no sweep entry). Chromium of Playwright 1.64.1 with the phone profile (DPR 3, mobile, touch), 320-1280 px in 1 px steps, both locales. Answer content: the `—` state and the sentences of all eight `layoutQueries` (four cases, imperial and metric). Notice content: the "not running" note (`noscript` + `calc.rectangle-area.page.example`) and both URL notices (`INVALID_VALUE`, `UNSUPPORTED_VERSION`), the variants `layout.spec.ts` measures. Natural height with `min-height: 0` and `display: flow-root`. Answer line 34.10 px, body line 26.35 px.

Tallest natural height per range (both locales), and where each locale drops:

| Block | Range (px) | Tallest (px) | Lines |
|---|---|---|---|
| answer | 320 | 102.28 | 3 |
| answer | 321-597 | 68.19 | 2 |
| answer | 598-1280 | 34.09 | 1 |
| notice | 320-385 | 147.72 | 6 |
| notice | 386-485 | 121.38 | 5 |
| notice | 486-704 | 95.03 | 4 |
| notice | 705-1280 | 68.69 | 3 |

Per locale: answer en 2 lines from 320, 1 from 480; es 3 at 320, 2 from 321, 1 from 598. Notice en 6 at 320-326, 5 from 327, 4 from 399, 3 from 597; es 6 to 385, 5 from 386, 4 from 486, 3 from 705. Spanish sets every latest drop. At the seven widths (tallest en / es): answer 320: 68.19 / 102.28; 390: 68.19 / 68.19; 480: 34.09 / 68.19; 640 to 1280: 34.09 / 34.09. Notice 320: 147.72 / 147.72; 390: 121.38 / 121.38; 480: 95.03 / 121.38; 640: 68.69 / 95.03; 768 to 1280: 68.69 / 68.69.

Chosen reserve (`apps/web/src/calculator/rectangle-area/reserve.ts`, at the latest drop, rounded up to 0.5rem):

- answer `[3, [20.5, 2], [37.5, 1]]`: drop to 2 at 321 px, breakpoint 20.5rem (328 px, edges 327/328); drop to 1 at 598 px, breakpoint 37.5rem (600 px, edges 599/600).
- notice `[6, [24.1875, 5], [30.5, 4], [44.5, 3]]`: drop to 5 at 386 px, breakpoint 24.1875rem (387 px, edges 386/387; not 0.5rem, deviation 1); drop to 4 at 486 px, 30.5rem (488 px, edges 487/488); drop to 3 at 705 px, 44.5rem (712 px, edges 711/712).
- New `WIDTHS`: 327, 328, 387, 487, 488, 599, 600, 711, 712 (386 was already there); 27 widths in all.

Unused reserve at every e2e width (macOS sweep): answer 0.0 px everywhere except 34.1 px at 327 and 599 (before-edge widths, two lines allowed); notice 10.4 px everywhere except 36.7 px at 386, 487 and 711 (before-edge widths). At 1280 px the gap under the answer is 0.0 px. The head style `.calculator{--answer-lines:3;--notice-lines:6}` and its five media blocks replace the shared ladder for both properties at every width.

Linux (6.4): not run by apply (no Linux runner here); closed by the PR 4 correction round below (the widened window). The orchestrator confirms on the PR 4 `site-browser` CI job; if Linux Chromium wraps later than these drops, the breakpoints move to the later drop. Room before an e2e width would fail: answer 3 to 2 up to 356 px, 2 to 1 up to 641 px; notice 5 to 4 up to 640 px, 4 to 3 up to 730 px; the notice 6 to 5 step has 1 px (387) because 386 px is an e2e width (a concrete edge).

### TDD cycle evidence

| Task | RED (seen failing) | GREEN | REFACTOR |
|---|---|---|---|
| 6.2, 6.5 | `reserve.test.ts`: module missing; then `20.5rem: expected [...] to include 327` | `reserve.ts`, nine `WIDTHS` | format, lint, typecheck (+ tooling), `npm test` 3,841 green |
| 6.7 | green on arrival; spot check: `page.home.cards.fixture-unrouted.title` in the English catalog gives `home.test-d.ts(19,5): Unused '@ts-expect-error'` | fixture id | typecheck |
| 6.9 | `expected 'pending' to be 'approved'` (en, es) | flip both entries | content contract 67 green |
| S4a-2 | green on arrival (behaviour-preserving); spot check: the [TP31] case with `['a', 'b']` fails | moved from S4b | lint, typecheck, unit, `no-js.spec` 8 passed |
| 7.2-7.6 | 22 red: end-state (5), SR24, the styles flip, TP41 (2), docs, built page (10) | route, templates, catalogs, `PAGES`/`SCRIPTS`/`E2E` rows, entry, island, methodology EN/ES and its row, AGENTS steps 12/14, CWC32 block deleted | format, lint, typecheck (+ tooling), `npm test` 3,884 green |
| 7.7 | `tsc`: `pages.ts` `TS1360` (missing row), `methodology-rows.ts` `TS1360`, `home-directory.ts` card keys; tooling: `calculator-pages.ts` `TS1360`, test-d `Property '"rectangle-area"' is missing`; `astro check`: `scripts.ts` `TS1360`, `Property '"rectangle-area"' is missing` | rows added | - |

Pins found red outside the plan and updated in S4b: `routes.test.ts` (static paths), `files.test.ts` (expected files), `templates.test.ts` ([SR17] lists), `packages/i18n/src/site-catalog.test.ts` (page ids), `cli.test.ts` (its fixture linked QUIKRETE from the square footage page), and the e2e `no-js.spec.ts` (concrete-only expectations; 6 tests failed on the first full e2e run, fixed in S4a-2 and S4b).

### Scenarios proven

SR17 (end-state, templates), SR19 (end-state: 8 ids, 16 paths, 18 pages, 18 keys, 16 `<loc>`, 10 + 4 entries), SR23 (static-paths test derived, end-state), SR24 (`routes.test.ts`), SR25 (built page: one module script from its island; the type tables). TP21, TP28, TP30 (HomeView and home-directory tests derived from `CALCULATOR_PAGES` in `ROUTES` order; e2e home), TP31 (fixture case), TP32 (fixture id), TP22, TP24, TP26 (methodology rows for both ids), TP25, TP38 (formulas, honesty patterns, no yield, no π), TP39 (the section is only in 1383264, both locales), TP40 (published cases equal the page controller), TP41 (intro test). CP64 (reserve test, `styles.contract` over the `PAGES` row), CP65 built (one head style equal to `headStyleOf(PAGES['rectangle-area'])` with both properties, none in the body, no `style` attribute; concrete none in `CalculatorView.reserve.test.ts`), CP67, CP70 (approved; Formulas figures; methodology link; markers by `check:site`), CP5 and CP68 (by `check:site` structure rules on both pages), CP71-CP74 (e2e: states, metric, layout at 27 widths, no-js), CP75 (sizes below). CWC38 (slot-free entry), CWC39 (entry contracts walk `client/entries/rectangle-area.ts` with no test edit), CWC40 (docs contract, block deleted). SQ33, SQ34 (budget fixture builds `/zz-budget/rectangle-area/{en,es}`), SQ35, SQ36, SQ37 (`E2E` row, generic suites). RAP2 built. RAP8: `git diff --stat origin/main -- packages/core packages/data .github/workflows/ci.yml` empty.

### Negative proofs (applied, run red, reverted; `git status --porcelain` clean after each)

S4a: (1) breakpoint 30.5 to 30.5625rem without edges: `30.5625rem: expected [...] to include 489`. (2) a notice count of 0: `--notice-lines: the count 0 is not a positive integer` (a `px` breakpoint is not expressible: `LineSteps` holds rem numbers and the builder writes `rem`). (3) `ownerReview: pending`: the 6.9 case red (its RED run).
S4b: (4) route row before `concrete`: SR24, the static-paths list and end-state red (the home order follows `ROUTES`, so it moves with the row). (5) `SCRIPTS` row removed: `astro check` `scripts.ts` `TS1360` plus the `SCRIPTS[id]` lookups. (6) `rectangle-area` also in `PAGELESS`: `id is in both the page list and PAGELESS` and the [SR17] pins red. (7) methodology section removed in both locales: 10 methodology tests red. (8) ES entry back to `pending`: the routed-must-be-approved set check and the 6.9 case red. (9) head reserve dropped from the row: both CP65 built tests and the `styles.contract` row check red. (10) `WIDTHS` edge 711 dropped: `(min-width:44.5rem): no width 711` and the reserve test red. (11) old methodology intro: TP41 red.

### Measurements

- ES concrete full-length proof: 40,678 B of 40,836 B (282 B to 40,960 B), EN 40,389 B; unchanged by PR 4.
- Square footage full-length proof (`/zz-budget/rectangle-area`): EN 34,122 B, ES 34,159 B of 40,960 B (headroom 6,838 B and 6,801 B).
- Built pages: `/square-footage-calculator.html` 25,155 B, `/es/calculadora-de-pies-cuadrados.html` 26,593 B; entry static graph 33,803 B (2 files) of 49,152 B; page weight about 150,400 B of 196,608 B (HTML, 89,720 B of fonts, icons, JS; `check:site` passes and prints concrete ES as the heaviest calculator page, 162,927 B). Largest CSS `/square-footage-calculator.html` 7,813 B of 20,480 B.
- Concrete entry graph 38,778 to 39,164 B (2 files: Vite splits a shared `mount` chunk once two entries exist); the concrete HTML differs only in the hashed script name.
- Homes 9,671 B (en) and 9,807 B (es), under 24,576 B ([TP35]).
- Sitemap 16 `<loc>`; `pending ownerReview entries: 0`.
- Dist diff against the PR 3 tip build: the two new pages, both homes, both methodology pages, the sitemap, the two concrete pages (script hash only), and in `_astro` the two island scripts and the shared `mount` chunk. S4a alone: dist identical.
- Layout suite: `layout.spec.ts` alone 61 tests in 1.7 min at S4a (concrete only, 27 widths).

### Gates

- `npm run verify` exit 0 at 1383264 (212 files, 3,884 tests; build 18 pages; check:site and check:dist pass).
- `npm run typecheck --prefix tooling/site-browser` clean.
- `npm run test:e2e`: 489 passed (3.3 min); 324 at the start. `layout.spec.ts` passes for both calculators at all 27 widths on macOS.
- `npm run lighthouse`: all 6 URLs pass the assertions (representative unchanged).
- SX4: nothing changed under `packages/core`, `packages/data`, `.github/workflows/ci.yml`, `packages/*/stryker.config.mjs`. GX2: `git log origin/main..HEAD --format=%B` has no attribution line.

### Deviations

1. Notice breakpoint 24.1875rem (387 px), not a 0.5rem rounding: 386 px is an e2e width (a concrete edge), and a breakpoint above 387 px leaves more than one notice line unused there on this page. 1 px of Linux room at that step.
2. Breakpoints pinned from the macOS sweep only; the Linux confirmation (6.4) is the orchestrator's PR 4 CI run.
3. S4a has four commits (reserve and edges, the Judgment Day fold, staged-legal tests moved out of S4b, the flip) against two planned; S4b 385 lines against 210-290 (over the forecast, under 400).
4. The [CP65], [CP67], [CP70] "build tests" render the real view through the Astro container (the unit suite runs before the build); the built `dist` is checked by `check:site` and the e2e suites.
5. The methodology fixture block ([TP40] on a slot-free module) stays; the real row covers the same cases on the real page module.
6. ~~`no-js.spec.ts` reads its answer and large figure from a table by id; the concrete floor became at least `spec.inputs`.~~ Superseded by the PR 4 correction round: everything comes from the `E2E` record, with an exact control count.
7. Both methodology entries now say `updated: 2026-10-28` (their content changed).

### For the orchestrator

- Linux sweep or CI confirmation of the breakpoints (6.4, 7.14).
- PR 4 group tasks P4.1-P4.4 (push, CI, reviews, PR, merge).

## PR 4 correction round

One scoped round on `feat/square-footage-live` after the four-lens review of PR #104 (all four lenses PASS; these are their findings), plus item 7 from the PR #104 Linux CI run. Strict TDD; nothing pushed.

| # | Finding | Done | Commit |
|---|---|---|---|
| 1 | MAJOR: `no-js.spec.ts` kept `EXPECTED`, a table by id outside the `E2E` record and the recipe, and always checked `[data-answer]` (a slot-free page would fail) | `E2eSpec` gains `primary` (per language), `controls` and `answer.default`; `EXPECTED` deleted; the answer is checked only when the record declares one; both records and the `minimal` fixture updated; `browser-record.contract.test.ts` now holds `no-js.spec.ts` to the generic-suite rules (no id, no path; answer read only when declared) | 35ed4e2 |
| 2 | `?? ''` fallbacks on catalog lookups; concrete control floor weakened from `> 20` to `>= spec.inputs` | `textOf` names a missing key; exact `controls` per record (concrete 27, square footage 5, counted in the built HTML) | 35ed4e2 |
| 3 | Pinned lists outside end-state: `routes.test.ts`, `files.test.ts`, `templates.test.ts`, `site-catalog.test.ts`, `styles.contract.test.ts` | Static paths and expected files derived from `ROUTES` (mapping kept on fixtures); the templates pins removed (the registry lists are `templates.contract.test.ts`), every `CALCULATOR_PAGES` id checked for the calculator template; the i18n page ids checked by property (same in both locales, home first, not-found last; the exact set stays in the web `site-catalog.contract.test.ts`); the reserve rows asserted non-empty and routed. The URL literals of `routes.test.ts` stay (a public contract), named in AGENTS.md step 14 and "Kept by hand" | 86c8c96 |
| 4 | AGENTS.md step 12 "both live calculators"; step 14 claimed the no-js project derives its pages | "every routed calculator declares a slot"; step 14 lists `primary` and `controls` and says `no-js.spec.ts` reads its values from the `E2E` row | 35ed4e2 |
| 5 | The rectangle-area-approved case duplicated routed-must-be-approved | Removed; [CP70] named on the routed check | 86c8c96 |
| 6 | apply-progress: approval SHA befd9ac (pre-rebase), one date | 478c3e0 on `main`; 2026-10-27 local (UTC−3), 2026-10-28 UTC | this commit |
| 7 | PR #104 `site-browser` CI (run 40714831996) failed on unused reserve only, never on fit, rectangle-area: answer en/es at 320 px (34.11 px, line 34.1), notice en/es at 385 px (36.72), at 480 px and 481 px (36.72; body line 26.35): 8 misses. Linux Chromium drops a line up to about 8 px before the macOS breakpoints 20.5rem (328 px), 24.1875rem (387 px), 30.5rem (488 px) | Decision (orchestrator): breakpoints stay at the macOS (later) drop and the fit stays strict; the second-line allowance widens from the last pixel width before a breakpoint to any width within 0.5rem (8 px) below a breakpoint of that page and block (`nearBreakpoint` in `apps/web/src/__testing__/css-media.ts`, used per page and per block by `layout.spec.ts`); [CP60], [CP61], [CP73] and the tasks note amended 2026-10-28 | e4bb81a |

### Negative proofs of the round (applied, run red, reverted; `git status --porcelain` clean)

1. Before the fix, `no-js.spec.ts` added to the contract suites: `× no-js.spec.ts names no calculator, path or shape` ("rectangle-area") and `× … reads the answer only when the record declares it`. `E2eSpec` extended before the records: tooling `tsc` `TS2741` (`default` missing) and `TS1360` on the `minimal` fixture.
2. Concrete `controls: 26`: no-js red on both concrete pages (`Expected: 26, Received: 27`).
3. `textOf(site, 'site.calculator.copyLinkGone')`: four no-js tests red with `the catalog has no key "site.calculator.copyLinkGone"`.
4. Square footage `answer.default.en` changed to `100.01`: `× /square-footage-calculator › answers 200 and shows the default result`.
5. `staticPaths` giving `''` for the root: both static-path tests red. `expectedFiles` sorted: three `files.test.ts` tests red.
6. Reserve removed from the square footage `PAGES` row: `× has at least one reserve, each on the row of a routed calculator page`.
7. `page.about.title` removed from the ES site catalog: `× has the same pages in both locales …` (and three title/description checks).
8. ES entry back to `pending`: `× parses the frontmatter of rectangle-area/es …` and the per-row entry check.
9. `nearBreakpoint` first run: missing export (`TypeError: nearBreakpoint is not a function`, 23 red). Window shrunk to 1 px (0.0625rem): `× holds 320 px`, `379`, `385`, `480`, `481` (the Linux miss pattern). On macOS the layout spec stays green with a 1 px window (its drops sit at the last pixel), so the unit test is the proof.

### Gates after the round

- `npm run format`: no change. `npm run verify` exit 0 at e4bb81a (212 files, 3,906 tests; build, check:site, check:dist pass); this commit adds only openspec text.
- `npm run typecheck --prefix tooling/site-browser` clean.
- `npm run test:e2e -- no-js.spec calculator.spec layout.spec`: 271 passed (3.3 min, macOS); `layout.spec.ts` alone 122 passed.
- Task 6.4: Linux confirmed by CI with the widened window: fit strict at every width; the rerun after this round is the confirmation.
