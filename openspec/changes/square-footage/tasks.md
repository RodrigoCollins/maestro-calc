# Tasks: Square Footage — Go Live the `rectangle-area` Calculator (EN/ES)

Change: `square-footage` · Inputs: `proposal.md` (D1–D10), `design.md` (K1–K13, slices S1a–S4b and the PR plan are authoritative), `design-review.md` (APPROVE WITH CHANGES, B-1/B-2, M-1..M-4, m-5..m-10 reconciled), 7 delta specs under `specs/` (`calculator-page` CP6–CP10, CP60–CP66 changed and CP67–CP75 added · `calc-rectangle-area` RAP1–RAP8 · `calculator-web-core` CWC33 changed, CWC38–CWC40 added, CWC32 retired · `site-quality` SQ33–SQ37 · `site-routing-i18n` SR17, SR19, SR23 changed, SR24–SR25 added · `trust-pages` TP22–TP26 changed, TP38–TP41 added, TP21/TP28/TP31/TP32 reworded · `i18n-catalog` exact-label row) · Mode: strict TDD (`npm test`), artifact store `openspec`, delivery `auto-chain`, chain `stacked-to-main`, one PR per group of slices, work-unit commits per slice. Technical artifacts are English.

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1,570–1,910 authored in total (`git diff --shortstat`, insertions plus deletions; renames count edited lines only; lockfiles and `openspec/` excluded and reported on their own line) |
| 400-line budget risk | Medium. S3b (300–350) and S1a (300–340) are the largest slices; S4b (210–290) must stay atomic and is the one whose overrun has no split (see Risks 1) |
| Chained PRs recommended | Yes (4 PRs) |
| Delivery strategy | auto-chain |
| Chain strategy | stacked-to-main |

Decision needed before apply: No (S4 is blocked on the owner gate K12, see S4a 6.8)
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: Medium

Per-slice forecast (each slice is at most 400 by `git diff -M --shortstat`): S1a 300–340 · S1b 270–330 · S2 200–240 · S3a 265–315 · S3b 300–350 · S4a 25–45 · S4b 210–290.
Per-PR forecast: PR 1 (S1a + S1b) 570–670 · PR 2 (S2) 200–240 · PR 3 (S3a + S3b) 565–665 · PR 4 (S4a + S4b) 235–335. Each slice is the unit of the 400 rule; a PR is the sum of its slices (as in home-directory PR 3).

Split rules (applied by measurement, no exception is requested):
- A slice before S4 that measures over 400 moves its tests-only half into its own slice inside the same PR; `state.yaml` is updated.
- S4b never splits. If it measures over 400, more staged-legal work moves to S4a (nothing a `Record<CalculatorPageId, …>`, [TP39] or a route contract forbids before the route). PR 4 is never merged partial.

### Suggested Work Units

| Unit | Goal | PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|----|----------------------|-----------------|-------------------|
| S1a | `WORKED_EXAMPLES` per id, `CONTENT_ROWS`, `shownFigures`, content contract as a table | 1 | `npm test -- apps/web/src/content apps/web/src/contract/calculator-content apps/web/src/contract/__testing__` | `npm run build && npm run check:site` | `schema.ts`, `__testing__/{calculator-rows,shown-figures}.ts`, the contract test |
| S1b | `METHODOLOGY_ROWS` + rename, budget fixture by id, `views/scripts.ts`, recipe steps 11/13/14 | 1 | `npm test -- apps/web/src/contract apps/web/src/lib/pages apps/web/src/views apps/web/src/components/calculator/CalculatorBody.budget` | `npm run build && npm run check:site` | the fixture, `scripts.ts`, the renamed contract, AGENTS.md edits |
| S2 | Entries EN/ES (`pending`), content row, end-state 2→4 | 2 | `npm test -- apps/web/src/contract/calculator-content apps/web/src/contract/end-state` | `npm run build && npm run check:site` | the two `.md` files and one row |
| S3a | Page module, answer and unit sentences, retitle pins, proof move | 3 | `npm test -- apps/web/src/calculator apps/web/src/lib packages/i18n apps/web/src/contract` | `npm run build && npm run check:site` | `calculator/rectangle-area/`, four catalog keys, the renamed proof |
| S3b | Reserve mechanism, head style, `[CP64]`/`[CP65]`, per-page `BEFORE_EDGE`, staged E2E record | 3 | `npm test -- apps/web/src/lib/reserve apps/web/src/layouts apps/web/src/styles apps/web/src/components/calculator apps/web/src/__testing__` | `npm run build && npm run test:e2e -- layout.spec` | `lib/reserve.ts`, `BaseLayout`, `layout.spec.ts`, `rectangle-area-pages.ts` |
| S4a | Measured reserve, `WIDTHS` edges, owner record, `approved` flip | 4 | `npm test -- apps/web/src/calculator/rectangle-area apps/web/src/styles apps/web/src/contract/calculator-content` | `npm run build && npm run test:e2e -- layout.spec` | `reserve.ts`, two `WIDTHS` entries, two frontmatter lines |
| S4b | Atomic go-live | 4 | `npm test` (all go-live contracts) | `npm run verify && npm run test:e2e && npm run lighthouse` | the whole PR 4 merge commit |

## Conventions (apply to every slice)

**Branches and stacking.** PR 1 is the existing branch `feat/square-footage` (it carries the openspec planning commits; those lines are excluded from the budget count and listed on their own line). PR 2 is `feat/square-footage-p2-entries`, PR 3 is `feat/square-footage-p3-page`, PR 4 is `feat/square-footage-p4-go-live`; each is created from the previous PR tip and retargeted onto `main` after its parent merges. A child diff never includes parent changes. The first task of each group says so.

**Commits (work-unit commits).** Tests ship with the code that proves them: a [RED] test is run red locally, then its [GREEN] code is written, and the slice is committed with the tree green (a RED-only commit is never made). Conventional Commits only, no `Co-Authored-By`, no AI attribution. Subjects are the design's:
- S1a `test(web): check the calculator entries per id`
- S1b `test(web): run the methodology and budget proofs per id`
- S2 `docs(content): draft the square footage entries for review`
- S3a `feat(web): give the square footage page its answer and unit sentences`
- S3b `test(e2e): stage the square footage record and the per-page reserve`
- S4a `docs(content): approve the square footage entries` (the measured-reserve work may be a first commit `test(e2e): pin the square footage reserve and its layout edges`; the `approved` flip is always its own last commit)
- S4b `feat(web): publish the square footage calculator`

**Strict TDD loop.** `[RED]` (a failing test, seen failing for the right reason, with the exact verify command) → `[GREEN]` (smallest code) → `[REFACTOR]`, which runs the four commands: `npm run format`, `npm run sync && npm run lint`, `npm run typecheck`, `npm test`. A test that is green on arrival says so and requires a break-the-code spot check (run it, see it fail, revert). Test names cite the scenario id (`// spec: calculator-page › [CP9]`). Negative proofs are applied, run red, reverted; `git status --porcelain` is clean afterwards.

**Measurements are recorded, not assumed.** Each slice records in `apply-progress.md`: the ES concrete full-length bytes (the `CalculatorBody.budget.test.ts` print; at most 40,836 B at every tip, 40,573 B at the start), `git diff --shortstat`, the e2e test count, and the scenario ids proven.

**Size measurement.** `git diff -M --shortstat <previous slice tip>..HEAD -- . ':(exclude)package-lock.json' ':(exclude)tooling/site-browser/package-lock.json' ':(exclude)openspec/'` (insertions plus deletions).

**Slice gates (run before the slice's last commit).**
- `npm run format:check`
- `npm run sync && npm run lint`
- `npm run typecheck`, plus `npm run typecheck --prefix tooling/site-browser` in S3b, S4a, S4b (and any slice touching `tooling/`)
- `npm run test:coverage` (includes the budget proof)
- `npm run build && npm run check:site`
- `npm run test:e2e` in S3b, S4a, S4b (record the count)

**Group rules.**
- Every PR tip leaves `main` green: `npm run verify` and the browser job pass.
- **Mutation (SX4).** The `calculators` Stryker shard is affected only if `packages/core` changes. This change touches none: `git diff --stat main -- packages/core packages/data` is empty at every tip (also proves [RAP8]). `packages/i18n` changes only in S3a (catalogs, one test-d) and S4b (site catalogs); i18n is not in the Stryker shards, so mutation is N/A in every slice and `.github/workflows/ci.yml` and `packages/*/stryker.config.mjs` stay unedited (`git diff --stat main -- .github/workflows/ci.yml 'packages/*/stryker.config.mjs'` is empty).
- **Dist diff, PRs 1–3 (byte-identical).** Task 1.1 / 3.1 / 4.1 copies the previous tip build to `<scratch>/dist-prev` (`npm run build && cp -R apps/web/dist <scratch>/dist-prev`; PR 1 baseline is `main`, whose build equals the branch start). At each PR tip run `npm run build && diff -r <scratch>/dist-prev apps/web/dist`: the output must be empty. If only hashed `/_astro/*` file names differ with equal contents, normalise names (`sd '/_astro/[A-Za-z0-9_.-]+\.(js|css)' '/_astro/ASSET.$1'` on both trees) and diff again, recording each difference; any HTML or CSS content difference fails the gate and the slice stops. The `zz-budget` fixture pages exist only in the test build and are not in `dist`.
- Budgets never rise (D9): HTML 40,960 B, CSS 20,480 B, entry graph 49,152 B, calculator page weight 196,608 B; ES concrete full-length at most 40,836 B ([CP66], [SQ35]).
- Rollback: revert PR merge commits newest first (PR 4, 3, 2, 1). PR 3 cannot revert alone after PR 4.

### Standard Exit Criteria per slice (SX)

- [ ] SX1 Slice gates green in the order above.
- [ ] SX2 Size: shortstat recorded (renames as renames), at most 400, forecast vs actual in `apply-progress.md`.
- [ ] SX3 Commits: conventional subjects, tree green at each commit, no attribution.
- [ ] SX4 Mutation: N/A, `git diff --stat main -- packages/core packages/data` empty (stated per slice, proof recorded).
- [ ] SX5 Traceability: `apply-progress.md` lists the scenario ids proven, each negative proof run and reverted (`git status --porcelain` clean), and the measured sizes.

### Group Exit Criteria (GX): once per PR, before merge

- [ ] GX1 `npm run verify` green on the PR tip; CI green (`verify`, `mutation` matrix and `mutation-gate`, `site-browser`).
- [ ] GX2 `git log main..HEAD --format=%B | rg -i 'co-authored|claude|anthropic|generated with'` returns nothing.
- [ ] GX3 Four specialized reviewers on the frozen candidate (after `npm run format`): spec conformance, types and package boundaries, test quality, maintainability and performance. Only candidate-caused blocking findings gate.
- [ ] GX4 Judgment Day (two judges); at most one scoped correction transaction, then GX1 again.
- [ ] GX5 PR opened against `main` with the body contents of the group's exit task and a Chain Context section (dependency diagram marking the current PR, start state, end state, prior dependencies, follow-ups, out of scope); merged before the next PR merges.
- [ ] GX6 `site-browser` job green and its wall time recorded (limit 15 minutes).

---

## PR 1 — Generalise the content, methodology and budget contracts (`feat/square-footage`)

### S1a — Entries per id: schema, rows, shown figures

Forecast 300–340. Specs: calculator-page [CP6], [CP7], [CP9] (mechanism), [CP69]; calc-rectangle-area (none directly; K3 helper). Green because: behaviour-preserving, only the `concrete` row exists, the build output is unchanged.

Commit: `test(web): check the calculator entries per id`.

- [ ] 1.1 Baseline on `feat/square-footage`: `npm run verify` green; `npm run build && cp -R apps/web/dist <scratch>/dist-prev`; record ES concrete full-length (expect 40,573 B), e2e count, and `rg -n "workedExample|CALCULATOR_PAGES" apps/web/src/content apps/web/src/contract` importers. Verify: numbers in `apply-progress.md`.
- [ ] 1.2 [RED] `apps/web/src/content/schema.test.ts` (edit) [CP6]: a `rectangle-area` entry carrying concrete's example fails naming the field; a `rectangle-area` example without `query` or with a misspelled figure name fails; a `query` not matching `^v=1(&[a-z]+=[\w/.]+)*$` fails; `calculatorSchema(ids)` with a `WORKED_EXAMPLES` row for an id outside the registry throws `worked example for an id outside the registry: <id>`; an entry whose id has no row fails the parse on `id`. Verify: `npm test -- apps/web/src/content/schema` fails (union missing).
- [ ] 1.3 [RED] `apps/web/src/content/schema.test-d.ts` (new) [CP6, K1]: `CalculatorPageId` extends `keyof typeof WORKED_EXAMPLES`; under `@ts-expect-error` an id outside the table is not a key. Verify: `npm run typecheck` fails (export missing).
- [ ] 1.4 [RED] `apps/web/src/contract/__testing__/shown-figures.test.ts` (new) [CP9, K3]: `shownFigures(module, query)` returns the controller panel figures. Rectangle-area is built in the test with a local `definePage({ calculator: rectangleArea })` (the real page module arrives in S3a): `v=1&l=144` gives `120.00`, `13.33`, `11.15`; `v=1` gives `100.00`, `11.11`, `9.29`; concrete default gives `40.00`, `44.00`, `1.63`, `74`. Verify: `npm test -- apps/web/src/contract/__testing__/shown-figures` fails (module missing).
- [ ] 1.5 [RED] `apps/web/src/contract/calculator-content.contract.test.ts` (edit) [CP6, CP7, CP69]: the expected set comes from `Object.keys(CONTENT_ROWS)` and generic `it.each` over `(id, locale)`, driven through a pure `setProblems(entries, rows, routed, pageless)` so fixtures can run. Seeded cases: a staged row (id in `PAGELESS`, entry `pending` or `approved`) passes; an entry whose id is in neither the page list nor a row fails naming the id (CP69); a routed entry that is `pending` fails; a routed id with no row fails; per id the missing `es` counterpart and a duplicate `(id, en)` fail naming the id and locale (CP7). Concrete's prose pins stay in `describe('concrete prose')`. Verify: `npm test -- apps/web/src/contract/calculator-content` fails (rows module missing).
- [ ] 1.6 [GREEN] `apps/web/src/content/schema.ts`: `WORKED_EXAMPLES = { concrete: strictObject({…}), 'rectangle-area': strictObject({query, ft2, yd2, m2}) }`, `calculatorSchema(ids)` as `z.discriminatedUnion('id', …)` with the stray-row throw. Verify: 1.2 and 1.3 pass (`npm test -- apps/web/src/content`, `npm run typecheck`), and `npm run build` still parses both concrete entries.
- [ ] 1.7 [GREEN] `apps/web/src/contract/__testing__/shown-figures.ts` and `calculator-rows.ts` (`CONTENT_ROWS satisfies { [Id in ExampleId]?: ContentRow<Id> }`, concrete row only; interfaces as in `design.md`); the contract test reads the table. Verify: 1.4 and 1.5 pass.
- [ ] 1.8 [REFACTOR] The four commands. `rg -n "engineFigures" apps/web/src` is empty (the `waste` special case is gone).
- [ ] 1.9 Gates and measure: `npm run build && npm run check:site`; dist diff against `<scratch>/dist-prev` empty; record ES full-length (unchanged), shortstat of S1a.
- [ ] 1.10 Negative proofs: add a stray `WORKED_EXAMPLES` row (the throw test fails); delete the concrete row of `CONTENT_ROWS` (the routed-without-row case and typecheck fail); revert `shownFigures` to `decode`+`run` for rectangle-area and change one figure in the engine fixture (the figure case fails); revert each, `git status --porcelain` clean.
- [ ] 1.11 Exit: SX1–SX5.

### S1b — Methodology and budget proofs per id, `SCRIPTS` module, recipe

Forecast 270–330. Specs: trust-pages [TP22], [TP24] (mechanism), [TP38]/[TP40] (row shape); site-quality [SQ33]–[SQ36] (concrete paths only until the go-live); calculator-page [CP66] pin kept; the K7 latent fixes; AGENTS.md recipe (K13). Green because: the concrete assertions stay green and the zz-budget pages are test-only.

Commit: `test(web): run the methodology and budget proofs per id`.

- [ ] 2.1 [RED] `apps/web/src/contract/methodology.contract.test.ts` (`git mv` from `methodology-concrete.contract.test.ts`, then edit; renames count edited lines only) [TP22, TP24]: sections, anchors, formulas and published cases read from `METHODOLOGY_ROWS`; `casesOf(section, columns.length)` and `caseProblems` generic over `shownFigures`; a fixture row (rectangle-area cases of [TP40], as data in the test) proves a changed figure fails; concrete yields and π tests stay in a concrete block; [TP25] word list keeps scanning the whole body. Verify: `npm test -- apps/web/src/contract/methodology` fails (`methodology-rows` missing).
- [ ] 2.2 [RED] `apps/web/src/components/calculator/CalculatorBody.budget.test.ts` (edit) [SQ33, SQ34, SQ35, SQ36, CP66]: paths derive from `CALCULATOR_PAGES × LOCALES`; the env is `BUDGET_EXTRA_<ID>_<LOCALE>` (`BUDGET_EXTRA_CONCRETE_ES`); `extra` is a map by id and locale; `afterAll` deletes every key it set; a seeded second id (fixture list) is built and measured; a page id without an entry throws naming the id; each `zz-budget/<id>/<locale>.html` is at most 40,960 B and prints its headroom; the concrete ES pin (at most 40,836 B) and the seeded one-byte-over test stay on concrete. Verify: `npm test -- apps/web/src/components/calculator/CalculatorBody.budget` fails (route and env names).
- [ ] 2.3 [RED] `apps/web/src/lib/pages.test.ts` and `apps/web/src/views/CalculatorView.test.ts` (edit) [K7]: `Object.keys(SCRIPTS)` equals `CALCULATOR_PAGES` (the regex is dropped); `pascalOf('rectangle-area')` returns `'RectangleArea'`, `pascalOf('concrete')` returns `'Concrete'`; the island-name test uses `pascalOf`. Verify: `npm test -- apps/web/src/lib/pages apps/web/src/views/CalculatorView` fails (module missing).
- [ ] 2.4 [RED] `apps/web/src/contract/docs.contract.test.ts` (edit) [K13]: tokens `WORKED_EXAMPLES` and `apps/web/src/content/schema.ts` (step 11), `CONTENT_ROWS` and `apps/web/src/contract/__testing__/calculator-rows.ts` (step 11), `apps/web/src/contract/methodology.contract.test.ts` (step 13), `METHODOLOGY_ROWS` and `apps/web/src/contract/__testing__/methodology-rows.ts`, `apps/web/src/views/scripts.ts` (step 14 and "Kept by hand"); the "script row" path now `apps/web/src/views/scripts.ts`. Verify: `npm test -- apps/web/src/contract/docs` fails.
- [ ] 2.5 [GREEN] `apps/web/src/contract/__testing__/methodology-rows.ts` (`METHODOLOGY_ROWS satisfies Record<CalculatorPageId, MethodologyRow>`: `anchor`, `pageLink`, `formulas`, `honesty`, `columns`, `published`; concrete row only). Verify: 2.1 passes.
- [ ] 2.6 [GREEN] `apps/web/src/contract/__testing__/budget-page.astro` (route `/zz-budget/[id]/[locale]`, `getStaticPaths` from `CALCULATOR_PAGES × LOCALES`, `sources` from `getEntry`, island from `SCRIPTS[id]`), `budget-copy.ts` (FAQ placeholder `about the page?`, 8 characters, 0 B change), `CalculatorBody.budget.test.ts` helpers. Verify: 2.2 passes; the ES full-length size is unchanged (40,573 B).
- [ ] 2.7 [GREEN] `apps/web/src/views/scripts.ts` (`SCRIPTS satisfies Record<CalculatorPageId, AstroComponentFactory>`, plus `pascalOf` helper where the test imports it), `CalculatorView.astro` imports it, `pages.test.ts` fixed. Verify: 2.3 passes and `npm run build` renders the concrete pages as before.
- [ ] 2.8 [GREEN] `AGENTS.md` steps 11, 13, 14 and "Kept by hand" per K13 (S1b part). Verify: 2.4 passes (`docs.contract` requires every named path to exist).
- [ ] 2.9 [REFACTOR] The four commands.
- [ ] 2.10 Gates and measure: `npm run build && npm run check:site`; dist diff against `<scratch>/dist-prev` empty; record ES full-length (expect 40,573 B; the placeholder keeps its length), the four-build time of the budget test, shortstat of S1b and of S1a + S1b.
- [ ] 2.11 Negative proofs: add a quoted-key `SCRIPTS` entry without a page id (the keys test fails); pad the concrete ES fixture one byte past the pin (the 40,836 pin fails); pad with `BUDGET_EXTRA_RECTANGLE_AREA_ES` while only concrete is built (concrete is not padded: no leak); change one methodology figure in the Markdown (`caseProblems` fails); delete the AGENTS.md `METHODOLOGY_ROWS` token (docs row fails); revert each.
- [ ] 2.12 Exit: SX1–SX5.

### PR 1 group tasks

- [ ] P1.1 Tip checks: `git log main..HEAD --oneline` shows the planning commits, then S1a and S1b; `git diff --stat main -- packages/core packages/data` is empty and `git diff --stat main -- packages/` is empty; CI/stryker paths unchanged. Record `git diff -M --shortstat main..HEAD -- . ':(exclude)package-lock.json' ':(exclude)tooling/site-browser/package-lock.json' ':(exclude)openspec/'` and the `openspec/` lines on a separate line.
- [ ] P1.2 Dist diff of the PR 1 tip against `<scratch>/dist-prev` (the `main` build): empty (rule in Group rules). Record the result.
- [ ] P1.3 `npm run verify`; `npm run build && npm run check:site && npm run test:e2e && npm run lighthouse`; ES full-length at most 40,836 B (exact figure and headroom); e2e count; `site-browser` wall time.
- [ ] P1.4 Exit: GX1–GX6. PR body: scope (per-id schema, `CONTENT_ROWS`, `shownFigures`, `METHODOLOGY_ROWS` and the rename, budget fixture by id, `views/scripts.ts`, recipe steps 11/13/14), forecast vs actual per slice, scenario ids covered (CP6, CP7, CP9, CP69, TP22, TP24, SQ33–SQ36, CP66 pin), negative-proof evidence, the dist-diff result, the ES full-length size, rollback. Chain Context: PR 1 of 4, start state `main`, end state contracts that take a second calculator as rows while only concrete has one, follow-ups PR 2 (entries), PR 3 (page, reserve), PR 4 (go-live), out of scope the entries and any page change. **Pushing, CI, the four reviewers, Judgment Day, the PR and the merge belong to the orchestrator, not to apply.**

---

## PR 2 — The square footage entries, `pending` (`feat/square-footage-p2-entries`)

### S2 — Draft the EN/ES entries

Forecast 200–240. Specs: calculator-page [CP6]–[CP10], [CP8] (content side), [CP69], [CP70] (content side; the review process check is S4a); calc-rectangle-area [RAP3] figures in Formulas. Green because: entries are staged (`PAGELESS`), `pending`, and nothing renders them.

Commit: `docs(content): draft the square footage entries for review`.

- [ ] 3.1 Create `feat/square-footage-p2-entries` from the PR 1 tip (retarget onto `main` after PR 1 merges). Baseline: `npm run verify` green; `npm run build && cp -R apps/web/dist <scratch>/dist-prev`; record the e2e count.
- [ ] 3.2 [RED] `apps/web/src/contract/__testing__/calculator-rows.ts` (edit: the `rectangle-area` row: module built with a local `definePage({ calculator: rectangleArea })` until S3a swaps it, `updated`, `sources(locale)` NIST SP 811 Appendix B, `engine` via `shownFigures(module, example.query)`, `figures` = `[ft2, yd2, m2]` plus the `12 ft` and `10 ft` dimensions, `methodologyLink` `/methodology#square-footage` and `/es/metodologia#pies-cuadrados`) and `apps/web/src/contract/end-state.contract.test.ts` (calculator entries 2→4, 14 content entries total as the staged count; all other pins untouched). Verify: `npm test -- apps/web/src/contract/calculator-content apps/web/src/contract/end-state` fails (entries missing): [CP8], [CP9], [CP10] (800–1,500 words, equal `h2` and FAQ counts, 8 FAQ items), [CP6], [CP7].
- [ ] 3.3 [GREEN] `apps/web/src/content/calculators/en/rectangle-area.md`: frontmatter (`id`, `locale`, `updated`, `ownerReview: pending`, `sources` NIST SP 811 Appendix B with a retrieval date, `workedExample` `{query: v=1&l=144, ft2: 120.00, yd2: 13.33, m2: 11.15}`), the five sections in order with ids `how-to-use`, `formulas`, `tips`, `faq`, `sources`, 8 FAQ answers of at most 450 plain-text characters, the link to `/methodology#square-footage`, Formulas showing `12 ft`, `10 ft`, `120.00`, `13.33`, `11.15`. Verify: the EN rows of 3.2 pass; `npm run build` parses the entry.
- [ ] 3.4 [GREEN] `apps/web/src/content/calculators/es/rectangle-area.md`: same structure, ids `como-usar`, `formulas`, `consejos`, `preguntas-frecuentes`, `fuentes`, neutral tú register, `pies cuadrados` and `yardas cuadradas`, `ft` kept in dimensions, link `/es/metodologia#pies-cuadrados`. Verify: all of 3.2 passes, `registerProblems` finds no formal imperative or voseo.
- [ ] 3.5 [REFACTOR] The four commands.
- [ ] 3.6 Gates and measure: `npm run build && npm run check:site` (prints the `pending` count, does not fail on it); dist diff against `<scratch>/dist-prev` empty (a staged entry is not rendered and the anchor target does not exist yet by design, [TP39]); record word counts per entry, shortstat of S2, ES full-length unchanged.
- [ ] 3.7 Owner review artifact (prepared for the orchestrator to present; it does not wait for the owner). In `apply-progress.md` section "Owner review artifact": for each locale the title, `updated`, word count, the eight FAQ questions with their answers, the Formulas paragraph and the worked example, the sources, and the Spanish terms used; the exact entry file paths and the commit sha they are frozen at; the two approval sentences the owner can answer ("approve EN", "approve ES"). End the section with the line "Not approved yet. `ownerReview` stays `pending` until the owner's approval is recorded in the section Owner approval (K12)." Verify: the section exists and the figures in it equal the entries (read back, no test).
- [ ] 3.8 Negative proofs: change `12 ft` to `13 ft` in the Formulas of one entry (the figures check fails); drop one FAQ item (parity and 8-count fail); set `ownerReview: maybe` (the strict schema fails the build naming the entry and field); use `Ingrese` in the ES entry (register fails); revert each.
- [ ] 3.9 Exit: SX1–SX5.

### PR 2 group tasks

- [ ] P2.1 Tip checks: `git log main..HEAD --oneline` shows S2 only; `git diff --stat main -- packages/` is empty; record `--shortstat main..HEAD`.
- [ ] P2.2 Dist diff of the PR 2 tip against `<scratch>/dist-prev` (the PR 1 tip build): empty. Record the result.
- [ ] P2.3 `npm run verify`; `npm run build && npm run check:site && npm run test:e2e && npm run lighthouse`; ES full-length at most 40,836 B; e2e count; `site-browser` wall time.
- [ ] P2.4 Exit: GX1–GX6. PR body: scope (two `pending` entries, one content row, end-state 2→4), forecast vs actual (200–240), scenario ids (CP6–CP10, CP69, CP70 content side), the owner review artifact reference (the orchestrator presents it to the owner), negative-proof evidence, the dist-diff result, rollback. Chain Context: PR 2 of 4, start state the PR 1 tip, end state staged entries (`pending`), follow-ups PR 3 and PR 4 (blocked on the owner gate K12), out of scope the page and the route. **Pushing, CI, the four reviewers, Judgment Day, the PR and the merge belong to the orchestrator, not to apply.**

---

## PR 3 — The page module and the per-page reserve mechanism (`feat/square-footage-p3-page`)

### S3a — Answer and unit sentences, retitle, proof move

Forecast 265–315. Specs: calc-rectangle-area [RAP1]–[RAP8]; i18n-catalog exact labels; calculator-web-core [CWC33], [CWC38], [CWC40] (prep); calculator-page [CP65] (no-answer case moved). Green because: the page module is unrouted, no built page changes.

Commit: `feat(web): give the square footage page its answer and unit sentences`.

- [ ] 4.1 Create `feat/square-footage-p3-page` from the PR 2 tip (retarget onto `main` after PR 2 merges). Baseline: `npm run verify` green; `npm run build && cp -R apps/web/dist <scratch>/dist-prev`; record the e2e count.
- [ ] 4.2 [RED] Catalog tests (files `catalog-content.test.ts`, `apps/web/src/lib/calculators.test.ts`, `packages/i18n/src/translate.test-d.ts`, the i18n exact-label test; locate with `fd`) [RAP1, RAP5, RAP6, RAP7]: the page keys of `rectangle-area` are exactly `answer`, `areaFt2`, `areaM2`, `example` with `{length}`,`{width}`,`{area}` and `{value}` placeholders equal across locales; `example` names `12 ft`, `10 ft`, `120.00` in both locales; the ES module uses `pies cuadrados`/`yardas cuadradas` with no `rectángulo` in the title; `calc.rectangle-area.title` is `Square Footage Calculator` / `Calculadora de pies cuadrados`; `Rectangle Area` and `Área de un rectángulo` have no match outside the archive. Verify: `npm test -- packages/i18n apps/web/src/lib` and `npm run typecheck` fail.
- [ ] 4.3 [RED] `apps/web/src/calculator/rectangle-area/present.test.ts` (new) [RAP2, RAP3]: `dimensionText` use gives `10 ft`, `12 ft 6 in`, `3.05 m`; `area` fills `page.areaFt2`/`page.areaM2` with the displayed figure. Verify: `npm test -- apps/web/src/calculator/rectangle-area/present` fails (module missing).
- [ ] 4.4 [RED] `apps/web/src/calculator/rectangle-area/controller.test.ts` (new) [RAP2, RAP3, RAP4]: through `controllerOf`, the four cases of the table in imperial (figures `120.00/13.33/11.15`, `100.00/11.11/9.29`, `125.00/13.89/11.61`, `300.00/33.33/27.87`; large figure the ft² value; answer names `12 ft by 10 ft`, `10 ft by 10 ft`, `12 ft 6 in by 10 ft`, `20 ft by 15 ft` and the Spanish `por` forms); default sentences exactly `A 10 ft by 10 ft area is 100.00 square feet.`, `Un área de 10 ft por 10 ft mide 100.00 pies cuadrados.`, `A 3.05 m by 3.05 m area is 9.29 square meters.`, `Un área de 3.05 m por 3.05 m mide 9.29 metros cuadrados.`; under `u=m` the large figure is `11.15`, `9.29`, `11.61`, `27.87` and the sentence ends `square meters.`/`metros cuadrados.`. Verify: `npm test -- apps/web/src/calculator/rectangle-area/controller` fails (page module missing).
- [ ] 4.5 [RED] `apps/web/src/lib/page-view.test.ts` (edit) [RAP2, CP67 mechanism]: the answer, `prefixed`, and the not-running note (`noscript + ' ' + example`) for the real rectangle-area page; the no-slot cases use the slot-free module of 4.6. Verify: `npm test -- apps/web/src/lib/page-view` fails.
- [ ] 4.6 [RED] Proof move [CWC33, CWC38, CP65 no-answer case, K9]: `git mv` `rectangle-area-proof.contract.test.ts` → `slot-free-proof.contract.test.ts` and `__testing__/rectangle-area-entry.ts` → `__testing__/slot-free-entry.ts`; both import `apps/web/src/contract/__testing__/slot-free-page.ts` (new, `definePage({ calculator: rectangleArea })`); `CalculatorBody.override.test.ts` (edit): the no-answer case uses the slot-free module; the [CWC32] "stays unrouted" `describe` is kept untouched; `docs.contract.test.ts` rows "the proof contract" and "the proof entry" name the new paths. Verify: `npm test -- apps/web/src/contract/slot-free apps/web/src/components/calculator/CalculatorBody.override apps/web/src/contract/docs` fails (new paths and module missing).
- [ ] 4.7 [GREEN] `packages/i18n/src/catalogs/{en,es}/rectangle-area.ts`: the four page keys (templates per RAP spec) and the retitle; `apps/web/src/lib/i18n-contract.test-d.ts` gets the exact `RectangleAreaPageKeys` union; the pins of 4.2 updated to the new titles. Verify: 4.2 passes; `npm run typecheck`.
- [ ] 4.8 [GREEN] `apps/web/src/calculator/rectangle-area/present.ts` and `page.ts`: `definePage({ calculator: rectangleArea, primary: { imperial: 'areaFt2', metric: 'areaM2' }, answer: answerSlot(rectangleArea, { values: answerValues }) })`, language-free, one template `answer`, no `by`. The page module is not added to `PAGES` yet. Verify: 4.3, 4.4, 4.5 pass.
- [ ] 4.9 [GREEN] Proof move files and `slot-free-page.ts`; `AGENTS.md` steps 12 and 14 name the moved proof files (K13 S3a part; step 14 says the go-live retires the [CWC32] block only). Verify: 4.6 passes; `npm test -- apps/web/src/contract`.
- [ ] 4.10 [GREEN] `calculator-rows.ts`: swap the `rectangle-area` row `module` from the local `definePage` of 3.2 to the real page module. Verify: `npm test -- apps/web/src/contract/calculator-content` still passes.
- [ ] 4.11 [REFACTOR] The four commands. `rg -n "Rectangle Area|Área de un rectángulo" apps packages tooling` has no hit.
- [ ] 4.12 Gates and measure: `npm run build && npm run check:site`; dist diff against `<scratch>/dist-prev` empty (the page module and catalogs of an unrouted id reach no built file); `git diff --stat main -- packages/core packages/data` empty (RAP8, SX4); record ES full-length and the shortstat of S3a.
- [ ] 4.13 Negative proofs: swap `en` `areaFt2` for `{value} sq ft` (RAP1/RAP2 fail); drop the `answerSlot` (RAP2 and the page-view answer fail); change the Spanish template to `Un área de {length} pies por {width}` (RAP3 fails); point `slot-free-page.ts` at the real page module (CWC33 finds an answer element); put `Área de un rectángulo` back in a catalog (RAP7 fails); revert each.
- [ ] 4.14 Exit: SX1–SX5.

### S3b — Per-page reserve mechanism and the staged E2E record

Forecast 300–350. Specs: calculator-page [CP60]–[CP61] (per-page `BEFORE_EDGE`), [CP64], [CP65]; site-quality [SQ37] (record staged); site-shell [SS32] (no `<style>` in the body, held). Green because: no `PAGES` row has a `reserve` yet, so `BaseLayout` emits no new bytes; concrete keeps its shared counts.

Commit: `test(e2e): stage the square footage record and the per-page reserve`.

- [ ] 5.1 [RED] `apps/web/src/lib/reserve.test.ts` (new) [CP64]: `reserveCss({ answer: [5, [30, 4]] })` returns exactly `.calculator{--answer-lines:5}@media(min-width:30rem){.calculator{--answer-lines:4}}`; `answer` and `notice` together; it throws on a non-increasing rem, a count that is not a positive integer, a `px` breakpoint; an empty reserve returns `''`. Verify: `npm test -- apps/web/src/lib/reserve` fails (module missing).
- [ ] 5.2 [RED] `BaseLayout` test (next to `apps/web/src/layouts/BaseLayout.astro`; locate with `fd BaseLayout`) [CP65, SS32]: with `style` it renders one `<style>` inside `<head>`, none in `<body>`; without it the output is byte-equal to today's. Verify: `npm test -- apps/web/src/layouts` fails.
- [ ] 5.3 [RED] `apps/web/src/views/CalculatorView.test.ts` and `apps/web/src/components/calculator/CalculatorBody.override.test.ts` (edit) [CP65, K6]: a fixture `PAGES` row with a `reserve` yields the head `<style>` equal to `reserveCss(reserve)`; a row without one yields none (0 B); the concrete page has no calculator-body `style` attribute; the override fixture is a head `.calculator{--answer-lines:3}` rule with no `style` attribute on the body and the shared formula unchanged; `CalculatorBody` rejects a `style` prop at type level (`@ts-expect-error`). Verify: `npm test -- apps/web/src/views apps/web/src/components/calculator/CalculatorBody.override` fails.
- [ ] 5.4 [RED] `apps/web/src/styles/styles.contract.test.ts` (edit) [CP64]: the rem check and the `WIDTHS` cross-check extend to every `reserve` of `PAGES` (builder output) with a seeded fixture reserve using a `px` breakpoint (flagged) and one whose edge is absent from `WIDTHS` (flagged). Verify: `npm test -- apps/web/src/styles` fails on the seeded cases.
- [ ] 5.5 [RED] `apps/web/src/__testing__/css-media.test.ts` (new) [CP60]: `edgesOf(css, property)` returns only the breakpoints of `.calculator` rules for a fixture that sets the property on `.calculator`, and the `:root` rules' breakpoints when it does not. Verify: `npm test -- apps/web/src/__testing__/css-media` fails (module missing).
- [ ] 5.6 [RED] `tooling/site-browser/e2e/calculator-pages.test-d.ts` (edit) [SQ37]: `export const staged: E2eSpec = RECTANGLE_AREA` importing the new module. Verify: `npm run typecheck --prefix tooling/site-browser` fails (module missing).
- [ ] 5.7 [GREEN] `apps/web/src/lib/reserve.ts` (`LineSteps`, `Reserve`, `reserveCss`) and `PageEntry.reserve?` in `apps/web/src/lib/pages.ts`. Verify: 5.1 passes; `npm run typecheck`.
- [ ] 5.8 [GREEN] `apps/web/src/layouts/BaseLayout.astro` optional `style` prop rendered as one `<style is:inline set:html>` in `<head>`; `CalculatorView.astro` and `budget-page.astro` pass `reserveCss(PAGES[id].reserve)` when present; the unused `CalculatorBody.style` prop removed. Verify: 5.2, 5.3 pass; `npm run build` shows no `<style>` change on concrete pages.
- [ ] 5.9 [GREEN] `apps/web/src/__testing__/css-media.ts` (`edgesOf`, no imports) and `tooling/site-browser/e2e/layout.spec.ts` (`BEFORE_EDGE` per page and block, read through `edgesOf` from the inline `<style>` text of the served page; otherwise the `:root` rules of `calculator.css`); the `styles.contract` extension of 5.4. Verify: 5.4, 5.5 pass; `npm run build && npm run test:e2e -- layout.spec` still passes for concrete with the same bounds (record the test count).
- [ ] 5.10 [GREEN] `tooling/site-browser/e2e/rectangle-area-pages.ts`: `RECTANGLE_AREA: E2eSpec` with `locales`, `ready`, input count, numeric inputs, figures and defaults, the four hand-verified `states` ([CP71] values, answer sentence names the dimensions), the `metric` block ([CP72]), `answer`, `tabOrder`, `bounds`, `layoutQueries` (the four cases in both systems), no `choices`, `steppers`, `shopping`, `prices`. No `E2E` row yet. Verify: 5.6 passes (`npm run typecheck --prefix tooling/site-browser`).
- [ ] 5.11 [GREEN] `AGENTS.md` step 14 and "Kept by hand" name `PAGES.reserve`, the bare file name `reserve.ts` beside the page module (not a path with `<id>`), and the `WIDTHS` edges of `tooling/site-browser/e2e/layout.spec.ts` (K13 S3b part), with the `docs.contract` tokens. Verify: `npm test -- apps/web/src/contract/docs` passes.
- [ ] 5.12 [REFACTOR] The four commands, with `npm run typecheck --prefix tooling/site-browser`.
- [ ] 5.13 Gates and measure: `npm run build && npm run check:site && npm run test:e2e` (record the count, expect the baseline unchanged) and `npm run lighthouse`; dist diff against `<scratch>/dist-prev` empty; ES full-length unchanged (K6 adds 0 B on concrete, [CP66]); `git diff --stat main -- packages/core packages/data` empty; shortstat of S3b and of S3a + S3b.
- [ ] 5.14 Negative proofs: emit a `reserve` style inside `<body>` (BaseLayout/SS32 fails); give the concrete row a `reserve` (the 0-B and body-style cases fail and the ES full-length changes); a `px` breakpoint in a fixture reserve (CP64 fails); drop `edgesOf` for one global `BEFORE_EDGE` (the unit test on the per-page derivation fails); rename `RECTANGLE_AREA` field `answer` (typecheck fails); revert each.
- [ ] 5.15 Exit: SX1–SX5.

### PR 3 group tasks

- [ ] P3.1 Tip checks: `git log main..HEAD --oneline` shows S3a and S3b only; `git diff --stat main -- packages/core packages/data` empty; CI/stryker paths unchanged; record `--shortstat main..HEAD`.
- [ ] P3.2 Dist diff of the PR 3 tip against `<scratch>/dist-prev` (the PR 2 tip build): empty. Record the result.
- [ ] P3.3 `npm run verify`; `npm run build && npm run check:site && npm run test:e2e && npm run lighthouse`; ES full-length at most 40,836 B; e2e count; `site-browser` wall time and its delta.
- [ ] P3.4 Exit: GX1–GX6. PR body: scope (page module, four sentences, retitle, proof move, reserve mechanism, head style, per-page `BEFORE_EDGE`, staged record), forecast vs actual (S3a 265–315, S3b 300–350), scenario ids (RAP1–RAP8, CWC33, CWC38, CWC40 prep, CP64, CP65, CP60/CP61 mechanism, SQ37 staged), negative-proof evidence, dist-diff result, ES full-length, rollback (reverts only before PR 4). Chain Context: PR 3 of 4, start state the PR 2 tip, end state an unrouted but complete page module with the reserve mechanism, follow-up PR 4 (go-live, owner-gated), out of scope the measured counts, the route, the `approved` flip. **Pushing, CI, the four reviewers, Judgment Day, the PR and the merge belong to the orchestrator, not to apply.**

---

## PR 4 — Go live (`feat/square-footage-p4-go-live`)

**PR 4 starts only after the owner's recorded approval (K12). Without it, apply stops and reports at task 6.8.**

### S4a — Measured reserve, layout edges, owner approval

Forecast 25–45. Specs: calculator-page [CP60], [CP61], [CP64], [CP73] (values), [CP70] (process); trust-pages [TP32] (fixture id, legal early). Green because: only what is legal while the id is staged.

Commits: `test(e2e): pin the square footage reserve and its layout edges` (6.2–6.7), then `docs(content): approve the square footage entries` (6.9, last).

- [ ] 6.1 Create `feat/square-footage-p4-go-live` from the PR 3 tip (retarget onto `main` after PR 3 merges). Baseline: `npm run verify` green; record e2e count. Re-read the "Owner review artifact" of `apply-progress.md` against the entries: if either entry changed since it was frozen, regenerate the artifact (same format as 3.7) and report that the orchestrator must re-present it.
- [ ] 6.2 [RED] `apps/web/src/calculator/rectangle-area/reserve.test.ts` (new) [CP64, CP73]: `reserve.ts` is importable with type-only imports; `reserveCss(reserve)` does not throw; every breakpoint is `rem`, increasing; every edge `N·16` and `N·16 − 1` is in `WIDTHS` (read from `layout.spec.ts` as text). Reads `reserve.ts` directly because the `PAGES` row cannot exist before S4b (`satisfies Record<CalculatorPageId, …>`). Verify: `npm test -- apps/web/src/calculator/rectangle-area/reserve` fails (module missing).
- [ ] 6.3 Sweep, macOS (scratch, not committed; results in `apply-progress.md`). On a scratch worktree (`git worktree add <scratch>/sweep`) with the S4b route edits applied and never committed: run the K11 probe (Playwright, widths 320–1280 in 1 px steps, both locales, every `layoutQueries` entry of `RECTANGLE_AREA`, `min-height: 0` plus `display: flow-root`) recording the tallest natural answer height and the tallest notice height (the "not running" note with `noscript` + example, and each URL notice). Output per block: the width where the line count drops, each breakpoint as that value in rem rounded up to 0.5rem, and the line counts per range. Remove the worktree afterwards. Verify: tables written; `git worktree list` has no sweep entry; `git status --porcelain` clean.
- [ ] 6.4 Sweep, Linux (confirm before pinning, lesson of design m-7). Run the same probe on Linux Chromium: first with the Playwright Linux image at the `tooling/site-browser` Playwright version through local Docker if available; if not, STOP and hand the exact script and the commit sha to the orchestrator, who runs it on CI (apply cannot push or run CI). Breakpoints follow the later drop of the two platforms; the fit stays strict. Verify: both sweeps recorded side by side; chosen values are the later drop; if Linux is not yet available, 6.5 is not started.
- [ ] 6.5 [GREEN] `apps/web/src/calculator/rectangle-area/reserve.ts` (type-only imports, never imported by the page module or the client entry) with the answer and notice counts of 6.3/6.4; the new edges (`N·16`, `N·16 − 1`) of every breakpoint added to `WIDTHS` in `tooling/site-browser/e2e/layout.spec.ts`. Verify: 6.2 passes; `npm run build && npm run test:e2e -- layout.spec` passes with the concrete bounds unchanged (extra widths change no concrete check since `BEFORE_EDGE` is per page).
- [ ] 6.6 [REFACTOR] The four commands, with `npm run typecheck --prefix tooling/site-browser`. Record the layout suite time added by the new widths.
- [ ] 6.7 Test edit legal while staged [TP32]: `apps/web/src/views/home.test-d.ts` uses a literal fixture id (`fixture-unrouted`) instead of `rectangle-area` for the `@ts-expect-error` cases, so S4b does not carry it. Green on arrival: spot-check by adding `page.home.cards.fixture-unrouted.title` to the English catalog, see it fail, revert. Verify: `npm run typecheck`.
- [ ] 6.8 **OWNER GATE (K12, D8, [CP70]). BLOCKED.** The `ownerReview: approved` flip (6.9) and all of S4b (7.x) are blocked until `apply-progress.md` has a section "Owner approval (K12)" with: the date, the place where the owner approved both entries (the chat, or a PR comment with its link), and the approved entry paths. The agent never sets `ownerReview: approved` on its own, never infers approval from silence, from a merge of PR 2 or from an earlier message about the draft, and never writes that record itself on the owner's behalf. If the record is absent, apply STOPS and reports that PR 4 waits on the owner; it does not edit either entry.
- [ ] 6.9 [RED] then [GREEN] only after 6.8 holds. RED: in `calculator-content.contract.test.ts` a `rectangle-area` case asserts both entries are `ownerReview: approved` (fails with `pending`). Verify: `npm test -- apps/web/src/contract/calculator-content` fails. GREEN: set `ownerReview: approved` in `apps/web/src/content/calculators/{en,es}/rectangle-area.md`, nothing else, as the last commit of S4a. Verify: passes; the generic K2 rule (a routed entry must be approved) is now satisfiable for S4b.
- [ ] 6.10 Gates and measure: `npm run build && npm run check:site && npm run test:e2e` (record the count); dist diff against the PR 3 tip build still empty (nothing is routed); `git diff --stat main -- packages/core packages/data` empty; shortstat of S4a.
- [ ] 6.11 Negative proofs: move a breakpoint by 1 px without its `WIDTHS` edges (6.2 fails); set a `px` breakpoint (the builder throws); set `ownerReview: pending` again (6.9 case fails); revert each. The gate itself is proven by reading: with the record removed from `apply-progress.md` in a scratch copy, 6.8 reports STOP (state the observed behaviour, do not simulate an approval in the repository).
- [ ] 6.12 Exit: SX1–SX5.

### S4b — The atomic go-live

Forecast 210–290. Specs: site-routing-i18n [SR17], [SR19], [SR23], [SR24], [SR25]; trust-pages [TP21], [TP22], [TP24]–[TP26], [TP28], [TP31], [TP32], [TP38]–[TP41]; calculator-page [CP5]/[CP68], [CP63], [CP65] (built), [CP67]–[CP75]; calculator-web-core [CWC38]–[CWC40]; site-quality [SQ33]–[SQ37]; calc-rectangle-area [RAP2] (built). Green because: the route, the methodology section, the [CWC32] deletion and the pins land in one commit with the tree green; no partial go-live is ever committed or merged.

Commit: `feat(web): publish the square footage calculator`.

- [ ] 7.1 Gate and baseline: confirm 6.8's record exists and both entries are `approved` (if not, STOP). `npm run verify` green on the S4a tip. `rg -l "PAGELESS|rectangle-area|Rectangle" apps tooling --glob '!**/archive/**'` lists every file that mentions the id as pageless or unrouted; record it (the S4b file list below must cover each).
- [ ] 7.2 [RED] Routing and totals [SR17, SR19, SR23, SR24, SR25]: `apps/web/src/routing/templates.contract.test.ts` (`CALCULATOR_PAGES` is `['concrete','rectangle-area']`, `PAGELESS` is `[]`, failing cases on fixture lists), routes/catalog contracts (`ROUTES` row `/square-footage-calculator`, `/es/calculadora-de-pies-cuadrados`, after `concrete`, `page.rectangle-area.{title,description}` in both site catalogs), `apps/web/src/routing/static-paths-page.test.ts` (catch-all builds 14, union with `/` and `/es` is 16), `apps/web/src/contract/end-state.contract.test.ts` (8 ids, 16 paths, 18 pages, 18 `page.*` keys, 16 `<loc>`; 10 trust and 4 calculator entries), a build test that both `dist` files exist with the calculator template. Verify: `npm test -- apps/web/src/routing apps/web/src/contract/end-state` fails.
- [ ] 7.3 [RED] Home [TP21, TP28, TP31, TP32]: `HomeView.test.ts` (two cards in `ROUTES` order, both with title, summary and example; the unrouted-name absence moves to a fixture registry per [TP31]), `lib/home-directory.test.ts` (real defaults give `['concrete','rectangle-area']`), `content.contract.test.ts` card-key row (both ids, both locales), the built-HTML home contracts (two card links, `ul` of two, each home at most 24,576 B), `page.home.cards.rectangle-area.{title,summary}` in both site catalogs (summary describes square feet, yards and meters for rooms and slabs, no material quantities). Verify: `npm test -- apps/web/src/views apps/web/src/lib/home-directory apps/web/src/contract/content` fails.
- [ ] 7.4 [RED] Methodology [TP22, TP24, TP25, TP26, TP38, TP40, TP41]: the `METHODOLOGY_ROWS` row for `rectangle-area` (anchors `square-footage` / `pies-cuadrados`, formula, the exact constants `1/9` and `0.09290304`, the four published cases, no yield, no π, honesty regexes); the intro no longer says "the calculator we publish today" / "la calculadora que publicamos hoy"; no "not published yet" sentence. Verify: `npm test -- apps/web/src/contract/methodology` fails.
- [ ] 7.5 [RED] Page, entry and budget [CP5/CP68 through the table-driven helper, CP63, CP65 built, CP67, CP70, CP74 (static), CP75, CWC38, CWC39, SQ33, SQ34]: built-HTML tests for the two pages (H1, default answer sentence, `data-output` `100.00`/`11.11`/`9.29`, `[data-primary]`, no choice/stepper/shopping/cost element, section order, 8 FAQ per locale, one breadcrumb `ol`, one `nav`, the methodology links, no `ownerReview`/`draft`/`borrador`/`pending review`, one head `<style>` equal to `reserveCss(PAGES['rectangle-area'].reserve)` with both properties, none on concrete); `entry-graph.contract` and `client-entry.contract` walk `client/entries/rectangle-area.ts` (only the answer slot, 49,152 B ceiling, no concrete module, no data package); `CalculatorBody.budget.test.ts` builds `/zz-budget/rectangle-area/{en,es}` and asserts each at most 40,960 B with headroom printed; `pages.test.ts` keys equal `CALCULATOR_PAGES` including `rectangle-area`. Verify: `npm test` fails on these (rows and files missing).
- [ ] 7.6 [RED] Recipe and proof retirement [CWC40]: `docs.contract.test.ts` drops the "steps 12 and 14" assertion about the proof; the recipe names only existing paths; the [CWC32] "stays unrouted" `describe` is deleted from `slot-free-proof.contract.test.ts`. Verify: `npm test -- apps/web/src/contract/docs apps/web/src/contract/slot-free` fails.
- [ ] 7.7 [RED] Typed tables: move `rectangle-area` to `CALCULATOR_PAGES` in `apps/web/src/routing/templates.ts` locally and run `npm run typecheck` and `npm run typecheck --prefix tooling/site-browser`: they fail naming the missing `PAGES`, `SCRIPTS` and `E2E` rows (the `Record<CalculatorPageId, …>` tables). Record the three errors.
- [ ] 7.8 [GREEN] Routing: `apps/web/src/routing/routes.ts` row, `packages/i18n/src/catalogs/{en,es}/site.ts` (title, description, card title and summary), `templates.ts` (`PAGELESS` empty, id in `CALCULATOR_PAGES`). Verify: 7.2 and 7.3 pass.
- [ ] 7.9 [GREEN] Page wiring: `apps/web/src/client/entries/rectangle-area.ts` (calls `mount` with the page module), `apps/web/src/islands/RectangleAreaScript.astro`, the `SCRIPTS` row in `apps/web/src/views/scripts.ts`, the `PAGES` row in `apps/web/src/lib/pages.ts` (module, catalogs, `reserve` from `reserve.ts`). `styles.contract` now reads the reserve through `PAGES` as well. Verify: 7.5 and 7.7 pass.
- [ ] 7.10 [GREEN] Methodology EN/ES (`apps/web/src/content/pages/{en,es}/methodology.md`): section `square-footage` / `pies-cuadrados`, intro sentence rewritten, the cases table; the `METHODOLOGY_ROWS` row; delete the "not published yet" sentence if present. Verify: 7.4 passes.
- [ ] 7.11 [GREEN] E2E row: `E2E['rectangle-area']` in `tooling/site-browser/e2e/calculator-pages.ts` (the `staged` constant of the type test is removed), covering [SQ37]. Verify: `npm run typecheck --prefix tooling/site-browser`.
- [ ] 7.12 [GREEN] Retire and rewrite: delete the [CWC32] block; `AGENTS.md` steps 12–14 rewritten (the "steps 12 and 14" sentence retires, the remaining proof files are named as test support); the `end-state` pins. Verify: 7.6 passes.
- [ ] 7.13 [REFACTOR] The four commands, with `npm run typecheck --prefix tooling/site-browser`. Then the whole slice is one commit; confirm `git diff -M --shortstat` of S4b is at most 400 (else move staged-legal work to S4a per the split rule).
- [ ] 7.14 Build and measure: `npm run build && npm run check:site` (record each `rectangle-area` HTML size against 40,960 B, the entry graph size against 49,152 B, the page weight against 196,608 B, the pending count, the sitemap 16 `<loc>`); ES concrete full-length at most 40,836 B; dist diff against the PR 3 tip build: only the two new pages, both homes, both methodology pages and the sitemap differ (record the file list). `npm run test:e2e` (the generic suites for both calculators: [CP71] four states, [CP72] metric, [CP73] layout at every width and edge, [CP74] scripts disabled, a11y 0 violations, CSP 0; record the count) and `npm run lighthouse` (accessibility, SEO, best practices at 0.95 or higher, CLS at most 0.01). Confirm on Linux CI that the pinned breakpoints hold (orchestrator-owned CI run; apply records the request).
- [ ] 7.15 Negative proofs: move the route row before `concrete` (SR24 and the home order fail); remove the `SCRIPTS` row (typecheck fails naming the id); leave `rectangle-area` in `PAGELESS` too (SR17 fails naming the id); remove the methodology section (the row, TP39 and the anchor links fail); put a `pending` entry back (K2 routed-must-be-approved fails); drop the head `reserve` style (CP65 built fails); drop a `WIDTHS` edge (the cross-check fails); revert each, `git status --porcelain` clean.
- [ ] 7.16 Exit: SX1–SX5.

### PR 4 group tasks

- [ ] P4.1 Tip checks: `git log main..HEAD --oneline` shows S4a and S4b only; `git diff --stat main -- packages/core packages/data` is empty ([RAP8], SX4: the `calculators` shard is not affected); `git diff --stat main -- .github/workflows/ci.yml 'packages/*/stryker.config.mjs'` is empty; record `--shortstat main..HEAD`. Confirm the owner record (date and place) exists before the `approved` commit in `git log`.
- [ ] P4.2 [TP39] check on the final diff: the square footage methodology section appears only in the S4b commit, in both locales.
- [ ] P4.3 `npm run verify`; `npm run build && npm run check:site && npm run test:e2e && npm run lighthouse`; ES full-length at most 40,836 B; rectangle-area HTML sizes and headroom; the `site-browser` wall time (limit 15 minutes).
- [ ] P4.4 Exit: GX1–GX6. PR body: scope (reserve values, `WIDTHS`, owner approval, the go-live), forecast vs actual (S4a 25–45, S4b 210–290), the owner approval record (date, place), the sweep tables from macOS and Linux with the breakpoints chosen, scenario ids (SR17, SR19, SR23–SR25, TP21, TP22, TP24–TP26, TP28, TP31, TP32, TP38–TP41, CP60–CP65, CP67–CP75, CWC38–CWC40, SQ33–SQ37), negative-proof evidence, the dist-diff file list, sizes against budgets, rollback (revert PR 4 restores `PAGELESS = ['rectangle-area']`, two URLs 404). Chain Context: PR 4 of 4, start state the PR 3 tip, end state the second live calculator, prior dependencies PR 1–3, follow-ups (concrete `:root` counts into its own `reserve`; neutral budget vocabulary), out of scope other shapes, hubs, waste, costs. **Pushing, CI, the four reviewers, Judgment Day, the PR and the merge belong to the orchestrator, not to apply.**

---

## Final — Change-level checks

- [ ] F.1 After PR 4 merges: `git diff --stat <pre-change main> -- packages/core packages/data` is empty; `RELEASED` and `REGISTRY` untouched; no budget raised; `end-state.contract.test.ts` is the only place with pinned counts.
- [ ] F.2 `apply-progress.md` lists per slice the forecast vs actual lines, scenario ids proven, each negative proof run and reverted, the measured sizes (ES concrete full-length per PR tip, each `rectangle-area` HTML, entry graph, page weight, e2e count, both sweeps) and the four `site-browser` wall times.
- [ ] F.3 Archive-ready: delta specs synced to `openspec/specs/` at archive time (calculator-page, calc-rectangle-area, calculator-web-core, site-quality, site-routing-i18n, trust-pages, i18n-catalog); `reviewGate` and the owner record present for the archive report.

---

## Traceability: spec scenario → slice, tasks

| Scenario | Slice | Tasks |
|---|---|---|
| CP6, CP7 (per id) | S1a, S2 | 1.2, 1.5, 3.2, 3.8 |
| CP8, CP9, CP10 | S2 (mechanism S1a) | 1.4, 3.2–3.4 |
| CP69 | S1a | 1.5 |
| CP5, CP68 | S4b | 7.5 |
| CP60, CP61 | S3b (mechanism), S4a (values), S4b (run) | 5.5, 5.9, 6.3–6.5, 7.14 |
| CP62, CP63, CP44 | S4b (regression + second page) | 7.5, 7.14 |
| CP64 | S3b, S4a | 5.1, 5.4, 6.2 |
| CP65 | S3a (no-answer), S3b (head style), S4b (built) | 4.6, 5.2, 5.3, 7.5 |
| CP66 | every slice | 2.2, 2.10, 5.13, 7.14 |
| CP67, CP75 | S4b | 7.5, 7.14 |
| CP70 | S2 (content), S4a (process gate), S4b (built) | 3.2, 6.8, 6.9, 7.5 |
| CP71, CP72, CP73, CP74 | S3b (record), S4b (run) | 5.10, 7.14 |
| RAP1, RAP5, RAP6, RAP7 | S3a | 4.2, 4.7 |
| RAP2, RAP3, RAP4 | S3a | 4.3, 4.4, 4.8 |
| RAP8 | every slice | SX4 checks, P4.1, F.1 |
| CWC33, CWC38 | S3a | 4.6, 4.9 |
| CWC39, CWC40 | S4b | 7.5, 7.6, 7.12 |
| SQ33–SQ36 | S1b (concrete), S4b (both ids) | 2.2, 2.6, 7.5 |
| SQ37 | S3b (staged), S4b (row) | 5.6, 5.10, 7.11 |
| SR17, SR19, SR23, SR24, SR25 | S4b | 7.2, 7.8 |
| TP22, TP24 | S1b (mechanism), S4b (row) | 2.1, 2.5, 7.4 |
| TP25, TP26, TP38, TP40, TP41 | S4b | 7.4, 7.10 |
| TP39 | S4b (final diff check) | P4.2 |
| TP21, TP28, TP31 | S4b | 7.3 |
| TP32 | S4a (fixture id), S4b | 6.7, 7.3 |
| i18n-catalog exact labels | S3a | 4.2, 4.7 |

---

## Risks and deviations the apply must know

1. **S4b is the one slice that cannot split and the design's file list is incomplete.** The go-live also changes `HomeView.test.ts`, `home-directory.test.ts`, the built-HTML home contracts, `templates.contract`, `static-paths-page.test.ts`, `content.contract` card rows (7.3) and `home.test-d.ts` (moved to S4a 6.7 to relieve S4b). If S4b measures over 400, more staged-legal edits move to S4a.
2. **S4a cannot test the reserve through `PAGES`** (the row exists only at S4b), so 6.2 reads `reserve.ts` directly; S4b 7.9 extends the same checks to `PAGES`.
3. **S2's `CONTENT_ROWS` row has no real page module** until S3a: it uses a local `definePage` and S3a task 4.10 swaps it.
4. **The Linux sweep (6.4) is not runnable by apply alone** when Docker is unavailable; the orchestrator runs it on CI before 6.5.
5. **S4a is two commits** (reserve and edges, then the `approved` flip) so the flip stays isolated after the owner gate; the design names one S4a subject.
6. **The entries link to `/methodology#square-footage` before the anchor exists** (TP39 forbids the section earlier). Nothing renders the entries until S4b, and the staged contract must not check anchor existence until then.
7. **The owner gate (K12) can delay PR 4 indefinitely.** Apply never fabricates or infers the approval.
8. **Linux Chromium may wrap earlier than macOS** (home-directory PR 3 lesson): breakpoints follow the later drop, the fit is strict, two lines are allowed only at the last pixel width before a breakpoint of that page and block.
