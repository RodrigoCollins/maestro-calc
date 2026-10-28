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
| FAQ answers (characters) | | EN 289, 227, 241, 194, 229, 306, 229, 230; ES 297, 268, 290, 227, 250, 372, 269, 237 | 450 |
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

Prepared for the orchestrator to present (K12). It does not wait for the owner. Entries frozen at commit **7434baacad54827889f163a937bb05f9f25fd18d** (`docs(content): draft the square footage entries for review`):

- `apps/web/src/content/calculators/en/rectangle-area.md`
- `apps/web/src/content/calculators/es/rectangle-area.md`

| | English | Spanish |
|---|---|---|
| Title (page H1 and catalog title arrive in S3a: `Square Footage Calculator` / `Calculadora de pies cuadrados`) | How to use the square footage calculator (first section heading) | Cómo usar la calculadora de pies cuadrados (first section heading) |
| `updated` | 2026-10-27 | 2026-10-27 |
| Words | 1,290 | 1,346 |
| Worked example | 12 ft × 10 ft = 120.00 square feet; 120 ÷ 9 = 13.33 square yards; 120 × 0.09290304 = 11.1483648, which rounds to 11.15 square meters | 12 ft × 10 ft = 120.00 pies cuadrados; 120 ÷ 9 = 13.33 yardas cuadradas; 120 × 0.09290304 = 11.1483648, que se redondea a 11.15 metros cuadrados |
| Sources | NIST SP 811, Appendix B (conversion factors), `https://www.nist.gov/pml/special-publication-811`, retrieved 2026-10-27 (the Appendix B table read on that date: square foot to square meter 9.290 304 E-02, square yard 8.361 274 E-01) | NIST SP 811, Appendix B (factores de conversión), same URL and date |

Spanish terms used: pies cuadrados, yardas cuadradas, metros cuadrados, `ft` and `in` in every dimension (K8), cuarto, piso, loseta, alfombra, cinta métrica, clóset, nicho, isla de cocina, gabinetes, huella (footprint), colocación (layout), se encimen (overlap), anuncio de venta, avalúo, área habitable terminada; imperatives in tú: Mide, Ingresa, Lee, Presiona, Usa, Escribe, Revisa, Divide, Suma, Resta, Multiplica, Deja, Redondea, Confirma.

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
5. **¿Cómo calculo los pies cuadrados de un cuarto en forma de L?** Divídelo en dos rectángulos que no se encimen y suma sus áreas. Por ejemplo, un área principal de 12 ft por 10 ft con un nicho de 6 ft por 4 ft tiene 120 + 24 = 144 pies cuadrados. Usa la calculadora una vez por cada rectángulo y suma los resultados. (250 characters)
6. **¿Cuánto piso de más debo comprar?** La calculadora no agrega nada por desperdicio. Los instaladores suelen agregar aproximadamente 10 por ciento por los cortes en una colocación sencilla, y más en una diagonal o con patrón. Para un cuarto de 120 pies cuadrados, 10 por ciento de más son 132 pies cuadrados. Revisa lo que recomiendan tu producto y tu instalador, y luego redondea hacia arriba a cajas enteras. (372 characters)
7. **¿Cómo calculo los pies cuadrados de una pared?** Multiplica el ancho de la pared por su altura. Una pared de 12 ft de ancho y 8 ft de alto tiene 96 pies cuadrados. Para pintar, resta cada puerta y cada ventana como su propio rectángulo, y luego compara el resultado con la cobertura que trae la etiqueta de la pintura. (269 characters)
8. **¿Puedo usar metros y centímetros?** Sí. Presiona Métrico (m, cm) y escribe metros o centímetros, por ejemplo 3.5 m o 350 cm. Un número solo se lee en metros, y el resultado empieza por los metros cuadrados. Cambiar de unidad nunca cambia tus números, solo cómo se escriben. (237 characters)

Approval sentences the owner can answer:

- "approve EN": approves `apps/web/src/content/calculators/en/rectangle-area.md` as frozen at 7434baa.
- "approve ES": approves `apps/web/src/content/calculators/es/rectangle-area.md` as frozen at 7434baa.

Not approved yet. `ownerReview` stays `pending` until the owner's approval is recorded in the section Owner approval (K12).
