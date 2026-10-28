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
