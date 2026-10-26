# Tasks: Concrete Calculator — First Live Calculator (EN/ES)

Change: `concrete-calculator` · Inputs: `proposal.md` (D1–D14), `design.md` (C1–C18, "Reconciliation with the specs" R1–R12, "Design review round 1" DR-1..DR-18; the slice plan there is authoritative), 10 delta specs under `specs/` · Mode: strict TDD (`npm test`), artifact store `openspec`, delivery `auto-chain`, chain `stacked-to-main`, one PR per group (owner decision).

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~5,190 total (additions + deletions, lockfiles excluded); 17 review units of 150–400 each |
| 400-line budget risk | Medium. S3a, S4, S5, S7, S8, S9, S10 sit at or near the cap; each has a named split contingency. S9 is the most likely to overflow |
| Chained PRs recommended | Yes (3 group PRs; every slice is a work-unit commit set inside its group) |
| Suggested split | G1 engine (S1–S6) → G2 unrouted page parts (S7–S10) → G3 go-live (S11a–S13b) |
| Delivery strategy | auto-chain |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: Medium

Notes:
- Each slice is at most 400 changed lines. The group PRs are larger than 400 by the owner's decision (one PR per group saves CI minutes and deploys). `main` is green after each group merge and production never contradicts itself (see "Group rules").
- **Recorded choice for the DR-8 cut of S3.** The judge's cut is used: S3a = factory with all 17 inputs, slab only, volume outputs and the forced coupling (calculator directory, `RELEASED`, `REGISTRY`, web registry, derived catalog keys, `EnglishKeys`); S3b = `BAG_YIELDS` validation (CC5), the bag shopping line, cost outputs and their catalog keys, the drift guard (CC6), material keys and the widened type contract. Reasons: (1) it keeps both halves green, because the registry-completeness and `released` tests only need the derived keys and the 17 tuples, and the material-completeness test (ICW14) lands with the material keys; (2) the design's S3b (waste, bags, costs, drift) would leave S3a with a `BAG_YIELDS`-less factory anyway; (3) waste stays in S3a because the volume outputs include it (CC7 needs 44 ft³). Estimated S3a ~380, S3b ~300 (the judge's ~150 plus the bag line and its tests that the design had in S3b). S3a contingency: move CC12 (Z, H volumes), the CC16 volume rows and the CC8 metric case into S4 (same test files).
- Slice order is by dependency: engine (G1) → page parts nobody routes (G2) → everything that describes the page, in one merge (G3).

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| S1 | Rational π + `circleArea`; `units` shard, kernel, data deps, CI inputs | G1 `feat/concrete-g1-engine` | `npm test -- packages/core/src/geometry apps/web/src/contract/mutation` | `npm run mutation -- --list`; `units` shard in background | `packages/core/src/geometry/`, barrel line, three config/CI edits |
| S2 | Yields-only subpath + `concreteMix` built from it | G1 | `npm test -- packages/data` | `npm run typecheck`; `data` shard in background | `packages/data/src/{yields,materials}`, `package.json` exports, index |
| S3a | `createConcrete` (17 inputs, slab, volumes) + coupling | G1 | `npm test -- packages/core/src/calculators packages/i18n apps/web/src/lib` | `npm run build` (registry and catalogs wired) | `calculators/concrete/`, `RELEASED`/`REGISTRY` rows, web registry line, catalogs |
| S3b | `BAG_YIELDS`, bags, costs, drift guard, material keys | G1 | same as S3a | `npm run verify` | additive to S3a; reverts to S3a |
| S4 | `footing`, `column`; validation and unit-input characterization | G1 | `npm test -- packages/core/src/calculators/concrete` | `calculators` shard smoke in background | additive; reverts to S3b |
| S5 | `steps`; properties, language-free, URL; mutation measurement | G1 | same as S4 | `npm run mutation -- --shard calculators` in background | additive; reverts to S4 |
| S6 | Size probe (SQ27) with `vite` pinned | G1 | `npm test -- apps/web/src/contract/client-size` | probe prints the size | one contract test, one helper, one devDependency |
| S7 | `present.ts`, `calc.concrete.page.*`, `site.calculator.*` | G2 `feat/concrete-g2-page-parts` | `npm test -- apps/web/src/calculator packages/i18n` | `npm run test:coverage` (100 on `calculator/**`) | `calculator/present.ts`, catalog additions |
| S8 | `CalculatorBody` + presentational components, templates, HTML budget proof | G2 | `npm test -- apps/web/src/components apps/web/src/styles` | `npm run build` (nothing routed) | `components/calculator/`, `styles/calculator.css` |
| S9 | `templates.ts`, `check:site` template rules, CSP, `assetsInlineLimit` | G2 | `npm test -- apps/web/src/site-check apps/web/src/routing apps/web/src/contract` | `npm run build && npm run check:site` | `site-check/`, `routing/templates.ts`, `_headers`, `astro.config.mjs` |
| S10 | `calculators` collection, full EN/ES copy, `faqOf`, `calculatorJsonLd` | G2 | `npm test -- apps/web/src/content apps/web/src/seo apps/web/src/contract` | `npm run build` (collection validated, not rendered) | `content/calculators/`, schema, `faq.ts`, JSON-LD builder |
| S11a | Pure `controller.ts` + `layout.ts` | G3 `feat/concrete-g3-go-live` | `npm test -- apps/web/src/calculator` | `npm run test:coverage` | `calculator/{controller,layout}.ts` |
| S11b | `mount.ts`, entry, `ConcreteScript.astro`, CP48 graph | G3 | `npm test -- apps/web/src/contract/entry apps/web/src/contract/client` | Vite lib build of the real entry; temporary dev page (not committed) | `client/**`, `islands/ConcreteScript.astro` |
| S12 | Methodology concrete section, privacy `calculators` section, `AGENTS.md` recipe | G3 | `npm test -- apps/web/src/contract/content apps/web/src/contract/docs` | `npm run build` | content Markdown (4 files), `AGENTS.md` |
| S13a | Route live: `ROUTES` row, view, home link, Lighthouse, end state, smoke, no-JS | G3 | `npm test -- apps/web/src/contract apps/web/src/views apps/web/src/routing` | `npm run build && npm run check:site && npm run test:e2e` (no-JS, smoke) | `ROUTES` row + view branch + template lists (see Rollback) |
| S13b | JS e2e (CP11–CP50), axe states, CLS, CSP console | G3 | `npm run test:e2e` | full `site-browser` job locally | `tooling/site-browser/e2e/*` plus defect fixes |

## Conventions (apply to every slice)

**Branches and stacking.** One branch per group: G1 `feat/concrete-g1-engine`, G2 `feat/concrete-g2-page-parts`, G3 `feat/concrete-g3-go-live`. G2 branches from the G1 tip and is retargeted onto `main` after G1 merges (never a child diff that includes parent changes); the same for G3. The first task of every group says so.

**Commits (work-unit commits).** Each slice is one or more commits; tests and the code that proves them ship together; docs/config that explain a unit travel with it. Conventional Commits only, no `Co-Authored-By`, no AI attribution; every commit leaves the tree green. Scopes: `repo`, `core`, `data`, `i18n`, `web`, `ci`, `e2e`. Planned commits are listed per slice.

**Strict TDD loop.** RED (failing test with hand-verified values from the cited scenario; see it fail for the right reason) → GREEN (smallest code) → REFACTOR. Tasks are tagged `[RED]`, `[GREEN]`, `[REFACTOR]`. A test written against code that is already green says so and requires a break-the-code spot check. Test names cite the scenario id (`// spec: calc-concrete › [CC7]`). Spikes and pure config use a recorded exception to RED-first.

**Counts derive from the tables.** Page counts come from `ROUTES`, `CALCULATOR_PAGES` and `PAGELESS`; only task 13a.1 pins `7` ids, `14` routable, `16` built pages, `16` `page.*` keys, `14` sitemap entries, `10 + 2` content entries (SR19).

**Append-only `RELEASED`.** Tuples are appended and never edited, except the `sh` options tuple of this still-unmerged change (DR-10): S3a `[slab]`, S4 `[slab, footing, column]`, S5 all four. G1 merges only after S5, so `main` sees the final tuple. OA2 is recorded before the G1 merge (task G1.1).

**Mutation runs are background runs with log files.** Never in the foreground: start `npm run mutation -- --shard <name> > <log> 2>&1` as a background command with `<log>` under the session scratchpad (outside the repo), then read the log with the Read tool until it ends. `npm run mutation -- --list` shows shard names. The `calculators` shard keeps its current break threshold (100 per the owner brief); a shard split follows AGENTS.md when the count passes about 400 mutants.

**Verification commands.** `npm test -- <path>` = `vitest run <path>`. Local gate order (cheapest first): `npm run format:check && npm run sync && npm run lint && npm run typecheck && npm run test:coverage && npm run build && npm run check:site && npm run check:dist` (= `npm run verify`). Browser (G3): `npm ci --prefix tooling/site-browser && npm run test:e2e`, `npm run lighthouse`.

**Size measurement.** `git diff --shortstat <previous slice tip>..HEAD -- . ':(exclude)package-lock.json' ':(exclude)tooling/site-browser/package-lock.json'` (additions + deletions). Over 400: split at the last RED/GREEN boundary into `NNa`/`NNb`, update `state.yaml`, never request an exception.

**Group rules (production never contradicts itself).**
- G1 adds an engine nobody routes: no visible change.
- G2 adds unrouted page parts and copy; the CSP becomes `script-src 'self'` while no page carries a script, and no existing copy may claim "no scripts" (task 9.10).
- G3 publishes everything that describes the page in one merge (route, entry, methodology, privacy, home link, gates). Intermediate commits of G3 may describe a page not yet routed; only the group tip is deployable and a partial G3 is never merged.
- Rollback of G3: remove the `ROUTES` row and its view branch, move `concrete` back to `PAGELESS` and `CALCULATOR_PAGES` to `[]`, revert the methodology, privacy and home edits (the engine, `RELEASED` tuples and data stay).

### Standard Exit Criteria per slice (SX)

- [ ] SX1 Local gates green in the order above (core 100; data/i18n 90; `apps/web/src/{routing,seo,site-check,calculator}` 100 from the slice that creates them).
- [ ] SX2 Size: the shortstat ≤ 400; actual vs forecast recorded in `apply-progress.md`.
- [ ] SX3 Commits: each subject is a conventional commit and the tree is green at each commit.
- [ ] SX4 Mutation (slices that change `packages/core` or `packages/data`): the affected shard runs in the background, score meets the shard threshold, mutant count recorded.
- [ ] SX5 Traceability: `apply-progress.md` lists the scenario ids proven and each negative proof run (and reverted: `git status --porcelain` clean).

### Group Exit Criteria (GX): once per group PR, before merge

- [ ] GX1 `npm run verify` green on the group tip; CI green (`verify`, `mutation` matrix + `mutation-gate`, `site-browser`).
- [ ] GX2 History hygiene: `git log main..HEAD --format=%B | rg -i 'co-authored|claude|anthropic|generated with'` returns nothing.
- [ ] GX3 Four specialized reviewers on the frozen candidate (after `npm run format`): (1) spec conformance against the cited scenarios, (2) types, API design, package boundaries, (3) test quality (hand-verified values, TDD order, surviving mutants), (4) maintainability, security and performance. Only candidate-caused blocking findings gate.
- [ ] GX4 Judgment Day (two judges); at most one scoped correction transaction, then re-run GX1 on the corrected tree.
- [ ] GX5 PR opened against `main` with scope, per-slice forecast vs actual, scenario ids covered (traceability), negative-proof evidence, rollback note; merged before the next group merges.
- [ ] GX6 (G3) `site-browser` job green and its wall time recorded (limit 10 minutes).

---

## G1 — Engine (`feat/concrete-g1-engine`)

### S1 — `core-geometry`: π and `circleArea`

Forecast: ~180 changed lines. Specs: core-geometry [GEO1]–[GEO7]. Green because: new pure modules only, covered at 100 percent, mutated in the `units` shard.

Planned commits: `test(core): pin the rational pi and the circle area` · `feat(core): add geometry with pi and circleArea` · `build(repo): put src/geometry in the kernel, the units shard and the CI inputs`.

- [x] 1.1 Create `feat/concrete-g1-engine` from `main`. Baseline: `npm run verify` green; `fd geometry packages/core/src` is empty; `rg -n "units" packages/core/stryker.config.mjs` shows the `kernel` and `units` entries to extend.
- [x] 1.2 [RED] `packages/core/src/geometry/pi.test.ts` (new): `PI` equals the Rational `314159265358979323846264338327950288 / 10^35` [GEO1]; `31415926535897932384626433832795028841971 / 10^40 - PI` is exactly `41971 / 10^40`, strictly greater than `0` and strictly less than `1 / 10^35` [GEO2]. Verify: fails (module missing).
- [x] 1.3 [GREEN] `packages/core/src/geometry/pi.ts`: `PI` built with the exact-rational constructor, comment cites OEIS A000796 and the bound `0 < π − PI < 10^-35`. Verify: 1.2 passes.
- [x] 1.4 [RED] `packages/core/src/geometry/circle.test.ts` and `circle.property.test.ts` (new): table [GEO4] radii `0 in`, `1 in`, `6 in`, `1 ft`, `1/2 in` give in² `0`, `PI`, `36·PI`, `144·PI`, `PI/4` and ft² `0`, `PI/144`, `PI/4`, `PI`, `PI/576`, exactly; `circleArea(-1 in)` throws `CoreError` `NEGATIVE_QUANTITY` (through `__testing__/thrown-code.ts`) [GEO6]; `multiply(circleArea(6 in), 96 in)` is a `Quantity<'volume'>` of exactly `3456·PI` in³ = `2·PI` ft³ [GEO7]; property (at least 1,000 runs through `__testing__/property-runs.ts`): `circleArea(2r) = 4·circleArea(r)` exactly, and for `r > 0` area over `r·r` (plain Rational) equals `PI` and lies strictly between `31415/10000` and `31416/10000` [GEO5]. Verify: fails.
- [x] 1.5 [RED] `packages/core/src/geometry/geometry.scan.test.ts` (new): walks every non-test source file of `packages/core/src` (excluding `*.test.ts`, `*.test-d.ts`) and reports any match of `Math.PI`, `22/7`, `22 / 7`, `355/113`, `355 / 113` [GEO3]. The pattern helper lives inside this test file (a helper in `src` would match itself). Seeded: a string containing each pattern is flagged by the helper. Verify: fails only once a seeded line is added to a source file (see 1.10).
- [x] 1.6 [GREEN] `packages/core/src/geometry/circle.ts` (`circleArea`: `PI · r · r` as `Quantity<'area'>`, throws on negative), `geometry/index.ts`, export from `packages/core/src/index.ts`; update the barrel pin in `packages/core/src/index.test.ts`. Verify: 1.2, 1.4, 1.5 pass; `npm run typecheck`.
- [x] 1.7 [RED] Mutation identity (C1): extend `apps/web/src/contract/mutation.contract.test.ts` (every file mutated exactly once: `src/geometry/**` is in the `units` shard `mutate` and `tests`), `mutation-identity.contract.test.ts` (the walk finds `src/geometry/**` in the identity of every core shard and of `data`), `mutation-ci-key.contract.test.ts` (the `inputs` of all seven core matrix entries and of the `data` entry contain `packages/core/src/geometry/**`). Verify: fails naming the missing paths only under `src/geometry/`.
- [x] 1.8 [GREEN] `packages/core/stryker.config.mjs` (`kernel` += `src/geometry/**`; `units` `mutate` += `src/geometry/**`, `tests` += `src/geometry`, comment updated), `packages/data/stryker.config.mjs` (`deps` += `../core/src/geometry/**`), `.github/workflows/ci.yml` (`packages/core/src/geometry/**` after the `units/**` line in the seven core entries and in `data`). Verify: 1.7 passes; `npm run mutation -- --list` unchanged.
- [x] 1.9 [REFACTOR] `rg -n "@maestro-calc|Math\.PI" packages/core/src/geometry` is empty; `npm run format && npm run lint && npm run typecheck`.
- [x] 1.10 Negative proofs (temporary, never committed, log in `apply-progress.md`): (a) change the last digit of `PI` (`...288` to `...289`): GEO1 and GEO2 fail; (b) drop the negative-radius check: GEO6 fails; (c) add `const x = Math.PI;` to any core source file: GEO3 names the file; revert each; `git status --porcelain` clean.
- [x] 1.11 Mutation [SX4]: `units` shard in the background to a log; about 15 new mutants, none surviving; record the count.
- [x] 1.12 Exit: SX1–SX5.

### S2 — `concrete-mix` data: yields-only subpath and the record

Forecast: ~190 changed lines. Specs: material-data-contract [MDC1]–[MDC5], "Dependency direction". Green because: additive exports; the web has no material test yet and no consumer.

Planned commits: `test(data): pin the concrete mix record and the yields-only module` · `feat(data): ship concreteMix and the yields subpath`.

- [x] 2.1 [RED] `packages/data/src/yields/concrete-mix.test.ts` (new): the module exports exactly `CONCRETE_MIX_YIELDS`; keys `bag-40`, `bag-60`, `bag-80` are `Quantity<'volume'>` of `2592/5`, `3888/5`, `5184/5` in³ (= `3/10`, `9/20`, `3/5` ft³); the record is frozen; the source text (read from disk) contains no `http`, no `material.`, no `QUIKRETE`, and imports only `@maestro-calc/core` [MDC5]. Verify: fails (module missing).
- [x] 2.2 [RED] `packages/data/src/materials/concrete-mix.test.ts` (new): `concreteMix` matches the table exactly: `id` `concrete-mix`, `nameKey` `material.concrete-mix.name`, three purchase units in order with `material.concrete-mix.units.bag-<n>` keys and the sizes above, `source.name`, `source.url` `https://www.quikrete.com/PDFs/DATA_SHEET-Concrete%20Mix%201101.pdf`, `retrieved` `2026-10-25`, frozen [MDC2]; `defineMaterial(concreteMix)` accepts it unchanged, sizes are strictly positive volumes, `retrieved` is a real date [MDC3]; name and URL non-empty, URL `https`, date `2026-10-25` [MDC4]; each `purchaseUnits[i].size` is the very object `CONCRETE_MIX_YIELDS['bag-<n>']` (`toBe`) [MDC5]. Verify: fails.
- [x] 2.3 [RED] `packages/data/src/index.test.ts` (extend or create; replace the "Empty registry" assertion, rename per the RENAMED requirement): the entry point exports exactly `concreteMix` and `defineMaterial` as values [MDC1]; `packages/data/package.json` `dependencies` hold only `@maestro-calc/core` and `exports` holds `.` and `./yields/*` [Dependency direction]. Verify: fails.
- [x] 2.4 [GREEN] `packages/data/src/yields/concrete-mix.ts` (frozen record, imports core only) and `packages/data/package.json` `exports["./yields/*"]`. Verify: 2.1 passes.
- [x] 2.5 [GREEN] `packages/data/src/materials/concrete-mix.ts` (built with `defineMaterial`, sizes taken from `CONCRETE_MIX_YIELDS`) and `packages/data/src/index.ts` (exports `concreteMix`, `defineMaterial`, types). Verify: 2.2, 2.3 pass.
- [x] 2.6 [REFACTOR] `npm run typecheck` (the subpath resolves from `apps/web` once S3a imports it; here check `apps/web/src/contract/workspace-graph.contract.test.ts` still reports data to core only); `npm run format && npm run lint`.
- [x] 2.7 Negative proofs: change `3/5` to `3/6` in the yields file (MDC2/MDC5 fail); add the text `http` to the yields file (MDC5 fails); rebuild the record with fresh `Quantity` objects instead of the shared ones (identity assertion fails); revert each.
- [x] 2.8 Mutation [SX4]: `data` shard in the background; score meets its threshold; record the count. Record OA1 in `apply-progress.md`: source, URL and date `2026-10-25` as stated by the spec.
- [x] 2.9 Exit: SX1–SX5.

### S3a — `createConcrete`: 17 inputs, slab volumes, forced coupling

Forecast: ~380 changed lines (the judge's cut, see the Forecast notes). Specs: calc-concrete [CC1] (inputs and four outputs), [CC2], [CC3], [CC4], [CC7], [CC8], [CC12] (volumes), [CC16] (volumes), [CC30] (first part); i18n-catalog [ICW10] (partial), [ICW12] (derived rows), [ICW18] (glob). Green because: the calculator, its 17 `RELEASED` tuples, its `REGISTRY` row, the web registry line and the derived catalog keys all arrive together, so the registry-equals-directories, released, language-free and catalog-completeness tests are satisfied in this one slice.

Planned commits: `feat(core): add the concrete factory with the slab volume` · `feat(core): release the 17 concrete url tuples` · `feat(web): register concrete with its yields and catalogs`.

- [x] 3a.1 Baseline: S2 tip. Record in `apply-progress.md` the cut choice and the contingency (Forecast notes). `rg -n "rectangle" apps/web/src/lib packages/core/src/__testing__/released-snapshot.ts packages/core/src/calculators/released.contract.test.ts` shows the places a calculator is listed.
- [x] 3a.2 [RED] `packages/core/src/__testing__/concrete-yields.ts` (test fixture: `3/10`, `9/20`, `3/5` ft³ keyed `40`, `60`, `80`; the only yield constants in `core`; add it to the `calculators` shard `deps` beside `released-snapshot.ts` so the identity contract holds) and `packages/core/src/calculators/concrete/concrete.shape.test.ts`: the 17 input descriptors equal the CC1 table in order (kind, `urlKey`, default as canonical inches or number, default unit and metric unit, inclusive bounds, `sh` options `[slab]`, `bg` options `40/60/80`), the first four outputs (`volumeYd3` primary, `volumeFt3` secondary, `volumeM3` secondary, `netVolume` intermediate) with their display hints, no warnings [CC1]; every `urlKey` matches `^[a-z][a-z0-9]{0,2}$`, none is `v` or `u`, all distinct [CC3]. Verify: fails (module missing).
- [x] 3a.3 [RED] `packages/core/src/calculators/concrete/concrete.test.ts`: valid yields give a calculator whose 80 lb bag divides by `3/5 ft3` (through the volume of S1: `netVolume` ratio) [CC4]; S1 default: `netVolume` exactly `40 ft3`, `volumeFt3` `44 ft3`, `volumeYd3` `44/27`, `volumeM3` `608369751/488281250`, all three volumes the same quantity `76032 in3` [CC7]; S2 (`length: "20"`, `width: "15"`, `thickness: "6in"`) `volumeFt3 165`, `volumeYd3 55/9`; S3 metric (`4`,`3`,`10`, `unitSystem: 'metric'`) `netVolume 6/5 m3`, `volumeM3 33/25`, yd³ 1.73 and ft³ 46.62 at 2 places [CC8]; `length: "0"` gives all volumes exactly `0`, no error; `1000ft × 1000ft × 10ft`, `waste: "0"` gives `netVolume` `10000000 ft3`, `volumeYd3` `10000000/27` [CC12 volumes]; waste `0`, `10`, `12.5` give `volumeFt3` `40`, `44`, `45` [CC16 volumes]. Verify: fails.
- [x] 3a.4 [GREEN] `packages/core/src/calculators/concrete/concrete.ts` (`createConcrete(yields)`: 17 inputs in spec order, `sh` options `[slab]`, four outputs, `compute` = slab prism × `(1 + waste/100)`; no yield validation and no shopping yet) and `index.ts` (one `export` line). Verify: 3a.2, 3a.3 pass.
- [x] 3a.5 [RED→GREEN] `RELEASED` and `REGISTRY` (C3): append the 17 tuples to `packages/core/src/__testing__/released-snapshot.ts` (`sh` `slab`, `l` `144`, `w` `120`, `t` `4`, `fw` `16`, `fd` `8`, `d` `12`, `h` `96`, `sw` `48`, `rs` `7`, `rn` `11`, `ns` `3`, `n` `1`, `ws` `10`, `bg` `80`, `bp` `0`, `rp` `0`; options for `sh` `[slab]` and `bg` `[40,60,80]`) and register `createConcrete(fixture)` in `packages/core/src/calculators/released.contract.test.ts` [CC2]. First add only the `REGISTRY` row and see `compareReleased` report the 17 tuples missing (RED), then append them (GREEN). Verify: `npm test -- packages/core/src/calculators`.
- [x] 3a.6 [RED] Web and catalog expectations: `apps/web/src/lib/calculators.test.ts` (registry lists `rectangle-area` and `concrete`; S1 through the registry gives `volumeYd3` `44/27` [CC30, bags in 3b.9]); `apps/web/src/lib/concrete.test.ts` (new: the web `concrete` is built from `CONCRETE_MIX_YIELDS`, keyed by purchase unit id `bag-<n>` like core, S1 volumes equal the core fixture result); `apps/web/src/lib/i18n-contract.test.ts` (module list now includes `concrete`; `requiredKeys(concrete)` is `calc.concrete.title`, 17 inputs, `options.shape.slab`, `options.bag.{40,60,80}`, four outputs, then the twelve `errors.*` [ICW10 partial]); `packages/i18n/src/concrete-catalog.test.ts` (new: exact EN/ES labels of the derived rows of the ICW12 table) [ICW12 partial]; the web `released.contract.test.ts` and `language-free.contract.test.ts` pick `concrete` up from the registry. Verify: fails.
- [x] 3a.7 [GREEN] `apps/web/src/lib/concrete.ts` (imports `CONCRETE_MIX_YIELDS` from `@maestro-calc/data/yields/concrete-mix`, never the data root; exports `concrete`), `apps/web/src/lib/calculators.ts` (adds `concrete` through its own core subpath), `packages/i18n/src/catalogs/{en,es}/concrete.ts` (`enConcrete`, `esConcrete`; derived keys only, ES in neutral tú, `satisfies` completeness; check the package `exports` map exposes `./catalogs/*/concrete`), `apps/web/src/lib/i18n-contract.test-d.ts` (`EnglishKeys` += `keyof typeof enConcrete`). The existing register test globs every `es` module, so the new module is covered [ICW18 partial]. Verify: 3a.6 passes; `npm run typecheck`.
- [x] 3a.8 [REFACTOR] Runtime: `npm run build` (the registry now imports concrete; nothing is routed); `rg -n "quikrete|material\." apps/web/dist` is empty; `npm run format && npm run lint`.
- [x] 3a.9 Negative proofs: change the `waste` default `10` to `12` and rename `sh` to `s` (the CC2 contract fails for each), remove one `es` input label (completeness names the key), import `@maestro-calc/data` in `lib/concrete.ts` root form (the S11b graph contract will catch it; for now the web `workspace-graph` test must stay green); revert.
- [x] 3a.10 Mutation smoke [SX4]: `calculators` shard in the background; survivors in `concrete.ts` fixed before S3b.
- [x] 3a.11 Exit: SX1–SX5.

### S3b — Yield validation, bags, costs, drift guard, material keys

Forecast: ~300 changed lines. Specs: calc-concrete [CC1] (six outputs, one shopping line), [CC5], [CC6], [CC12] (zero bags), [CC14], [CC16] (bags), [CC19]–[CC21], [CC30]; i18n-catalog [ICW10] (full), [ICW11] (material keys), [ICW12] (new rows), [ICW14], [ICW15]. Green because: the cost outputs and their catalog keys arrive in the same commit, and the material keys arrive with their completeness test.

Planned commits: `feat(core): validate the bag yields and add the bag shopping line` · `feat(core): add the bag and ready-mix costs` · `test(web): guard the yields and the material keys against drift`.

- [x] 3b.1 [RED] In `concrete.test.ts`: yields missing `60`, with an extra key `50`, with `80: 0 ft3`, with `80: 1 ft` (a length) each make `createConcrete` throw `CoreError` code `INVALID_DEFINITION`, reason `BAG_YIELDS`, cause `{ id: 'concrete', reason: 'BAG_YIELDS' }`; `DEFINITION_REASONS` does not contain `BAG_YIELDS` [CC5]; the error comes from the factory (a record with an extra key fails with `BAG_YIELDS`, not with a `defineCalculator` reason). Verify: fails.
- [x] 3b.2 [GREEN] `concrete.ts`: validate the argument before `defineCalculator` (exact keys `40`, `60`, `80`; each a volume strictly greater than zero). `DEFINITION_REASONS` untouched. Verify: 3b.1 passes.
- [x] 3b.3 [RED] Bags: `shopping` is `[ { materialId: 'concrete-mix', purchaseUnit: 'bag-80', qty: 74n } ]`, then `bag-60` `98n`, then `bag-40` `147n` for `{}`, `{ bag: "60" }`, `{ bag: "40" }` [CC14]; waste `0`, `10`, `12.5` with the 80 lb bag give `67n`, `74n`, `75n` (45 / 0.6 = 75 exactly) [CC16 bags]; `length: "0"` gives one line with `qty: 0n` [CC12 zero bags]; `shape.test.ts` declares exactly one shopping line (`purchaseUnit` `bag-<bag>`) and the full six outputs list [CC1]. Verify: fails.
- [x] 3b.4 [RED] Costs: `{ bagPrice: "6.50" }` gives `bagCost` exactly `usd(481)`; `{ bag: "60", bagPrice: "$4.25" }` gives `usd(833/2)` [CC19]; `{ readyMixPrice: "150" }` gives `readyMixCost` `usd(2200/9)` and `bagCost` `usd(0)` [CC20]; `{}` gives both `usd(0)` [CC21]; `bagCost` and `readyMixCost` roles `secondary`, no display hint [CC1]. Verify: fails.
- [x] 3b.5 [GREEN] `concrete.ts`: shopping line from `ceilToPurchaseUnits(ratio(Vt, yield))` (net volume never feeds the bag count), outputs `bagCost` (`multiplyCount`) and `readyMixCost` (`unitPrice` and `costOf` over `Vt` in yd³), both unrounded. Verify: 3b.3, 3b.4 pass.
- [x] 3b.6 [RED] `apps/web/src/lib/concrete-yields.contract.test.ts` and `apps/web/src/contract/yield-drift.ts` (new helper): the yields of `__testing__/concrete-yields.ts`, of `CONCRETE_MIX_YIELDS` and of `concreteMix.purchaseUnits` are equal at `3/10`, `9/20`, `3/5` ft³; seeded: changing one side alone (a copy with `3/5` replaced by `3/6`) makes the helper report that side [CC6]. Verify: fails (helper missing).
- [x] 3b.7 [RED] Catalog side: `apps/web/src/contract/material-catalog.contract.test.ts` (every material exported by `@maestro-calc/data` has `material.<id>.name` and `material.<id>.units.<unitId>` in both locales; seeded: a catalog without `material.concrete-mix.units.bag-60` fails naming the key [ICW14]); registry-completeness: an `en` module with an extra `calc.concrete.extra` fails naming the key, and the allowed extras are exactly the material keys of the materials the calculator uses (page keys are added in 7.6) [ICW15, ICW11 material part]; `requiredKeys(concrete)` now ends the outputs with `bagCost`, `readyMixCost` [ICW10]; `concrete-catalog.test.ts` adds the rows `outputs.bagCost`, `outputs.readyMixCost`, `material.concrete-mix.name`, `units.bag-40/60/80` [ICW12]. Verify: fails.
- [x] 3b.8 [GREEN] `packages/i18n/src/catalogs/{en,es}/concrete.ts` (two output keys and four material keys), `apps/web/src/contract/yield-drift.ts` and `material-catalog.ts` helpers, `i18n-contract.test-d.ts`: `EnglishKeys` stays an exact union and the "no extra key" check widens to `DerivedKeys | errors | MaterialKeys<typeof concreteMix> | `calc.${id}.page.${string}``. Verify: 3b.6, 3b.7 pass; `npm run typecheck`.
- [x] 3b.9 [RED→GREEN] `apps/web/src/lib/calculators.test.ts`: S1 through the registry gives `volumeYd3` `44/27` and `qty` `74n` of `bag-80` [CC30]. Verify: passes after 3b.5.
- [x] 3b.10 Negative proofs: use `Math.ceil`-style rounding of the volume instead of the bag count (CC14 fails); price the bags by volume (CC19 fails); drop the `BAG_YIELDS` check (CC5 fails); change a yield in the data subpath alone (CC6 fails); remove a `units.bag-60` key (ICW14 fails); revert.
- [x] 3b.11 Mutation smoke [SX4]: `calculators` shard in the background; no survivors in new code.
- [x] 3b.12 Exit: SX1–SX5.

### S4 — `footing` and `column`; validation characterization

Forecast: ~380 changed lines. Specs: calc-concrete [CC2] (options), [CC9], [CC10], [CC13], [CC15], [CC17] (C1, C2, S3, Z), [CC22]–[CC24]. Contingency: move the CC22–CC24 characterization tests into S5.

Planned commits: `feat(core): compute the footing and column volumes` · `test(core): characterize concrete validation and unit-aware inputs` · `feat(i18n): label the footing and column shapes`.

- [x] 4.1 [RED] Extend the same unmerged `sh` options tuple (DR-10): the contract expects `[slab, footing, column]` [CC2]; `concrete-catalog.test.ts` adds the rows `options.shape.footing` (`Footing`/`Zapata`) and `options.shape.column` (`Column`/`Columna`) [ICW12]; `shape.test.ts` options. Verify: fails.
- [x] 4.2 [RED] `concrete.test.ts`: `{ shape: "footing", length: "18ft", count: "3" }` gives `netVolume` exactly `48 ft3`, `volumeFt3` `264/5`, `volumeYd3` `88/45`, and `count: "1"` gives `16 ft3` [CC9]; `{ shape: "column" }` and `{ shape: "column", count: "4" }` give `netVolume` exactly `2·PI ft3` and `8·PI ft3` built from the geometry `PI` as Rationals, `volumeFt3` `11·PI/5` and `44·PI/5`, displayed 0.26 and 1.02 yd³ [CC10]; S2 with bag `80` and `40` give `275n`, `550n`, F1 gives `88n`, `176n` [CC15]; bag quantities for C1 `12n/16n/24n` (80/60/40), C2 `47n/62n/93n`, S3 metric `78n/104n/156n`, Z `0n` with the three bags [CC17, T1 rows in 5.2]. Verify: fails (shapes not computed).
- [x] 4.3 [RED] Unused fields do not matter: the same footing state with default `diameter`, `height`, `stepCount` and with `diameter = 5 ft`, `height = 50 ft`, `stepCount = 40` gives equal outputs exactly [CC13]. Verify: passes only after 4.5 (footing exists).
- [x] 4.4 [RED, characterization: already green on arrival, spot-checked] Validation: each alone `{ length: "abc" }`, `{ length: "1001ft" }`, `{ thickness: "1,5" }`, `{ count: "0" }`, `{ count: "1001" }`, `{ stepCount: "51" }`, `{ waste: "51" }`, `{ waste: "-1" }`, `{ shape: "pool" }`, `{ shape: "Slab" }`, `{ bag: "50" }`, `{ bagPrice: "-1" }`, `{ bagPrice: "10000.01" }`, `{ readyMixPrice: "1,50" }`, `{ diameter: "" }` give `MALFORMED`, `ABOVE_MAX`, `DECIMAL_COMMA`, `BELOW_MIN` (`min: "1"`), `ABOVE_MAX` (`max: "1000"`), `ABOVE_MAX` (`max: "50"`), `ABOVE_MAX` (`max: "50"`), `BELOW_MIN`, `UNKNOWN_OPTION` ×3, `MALFORMED`, `ABOVE_MAX`, `DECIMAL_COMMA`, `EMPTY` on the named field with no result [CC22]; `{ shape: "slab", diameter: "abc" }` gives `{ ok: false }` with one `MALFORMED` on `diameter` [CC23]; `{ length: "12' 6\"" }` and `{ length: "3.81 m" }` give `netVolume` exactly `125/3 ft3` [CC24]. Spot check: change a bound or an option id in the descriptors and see the matching case fail, then restore.
- [x] 4.5 [GREEN] `concrete.ts`: `sh` options `[slab, footing, column]`; `footing` = `length × footingWidth × footingDepth × count`; `column` = `multiply(circleArea(divideScalar(diameter, 2)), height) · count` (C4); `released-snapshot.ts` `sh` options tuple edited to the three shapes. Verify: 4.1–4.3 pass.
- [x] 4.6 [GREEN] `packages/i18n/src/catalogs/{en,es}/concrete.ts`: the two option keys. Verify: `npm test -- packages/i18n apps/web/src/lib`.
- [x] 4.7 [REFACTOR] Extract the per-shape volume into one function per shape; `npm run format && npm run lint && npm run typecheck`.
- [x] 4.8 Negative proofs: use `PI/2` or `Math.PI`-style float in the column (CC10 fails, GEO3 names the file); use the diameter as a radius (CC10 fails); forget `count` in the footing (CC9 fails); round before the bag ceiling (CC15 fails); revert.
- [x] 4.9 Mutation smoke [SX4]: `calculators` shard in the background.
- [x] 4.10 Exit: SX1–SX5.

### S5 — `steps`; properties, language-free, URL; mutation measurement

Forecast: ~380 changed lines. Specs: calc-concrete [CC2] (final), [CC11], [CC12], [CC17] (T1), [CC18], [CC25]–[CC29]; i18n-catalog [ICW10] (final), [ICW12] (steps row); site-quality [SQ21]. Contingency: move `concrete.url.test.ts` ([CC27]–[CC29]) into S6.

Planned commits: `feat(core): compute the steps volume` · `test(core): property, language-free and url tests for concrete` · `feat(i18n): label the steps shape`.

- [x] 5.1 [RED] The `sh` options tuple is now all four shapes [CC2]; `requiredKeys(concrete)` equals the final ICW10 list (title, 17 inputs, `options.shape.{slab,footing,column,steps}`, `options.bag.{40,60,80}`, six outputs, twelve `errors.*`: 43 keys) [ICW10]; `concrete-catalog.test.ts` adds `options.shape.steps` (`Steps`/`Escalones`) [ICW12]. Verify: fails.
- [x] 5.2 [RED] Steps: `{ shape: "steps" }`, `stepCount: "1"`, `stepCount: "0"` give `netVolume` exactly `77/6 ft3`, `77/36 ft3`, `0` with no error [CC11]; T1 bag quantities `24n/32n/48n` (80/60/40 lb) [CC17]. Verify: fails.
- [x] 5.3 [RED] Maximum: case H with each bag gives `33333334n`, `22222223n`, `16666667n` as `bigint` (40/60/80) [CC18]; `volumeFt3` `10000000` and the displayed `370,370.37` yd³ and `283,168.47` m³ at 2 places [CC12]. Verify: passes once volumes exist (spot-check with a wrong constant).
- [x] 5.4 [RED] `concrete.property.test.ts`: at least 1,000 random valid states per run (all four shapes, all bags) with exact equality: P1 `volumeFt3 = netVolume·(1 + waste/100)`; P2 `volumeYd3·27 = volumeFt3`; P3 `qty·yield ≥ Vt` and `(qty−1)·yield < Vt` for `qty > 0`; P4 bag count never decreases with `waste`, `qty40 ≥ qty60 ≥ qty80`; P5 `count = k·m` equals `k ×` the `m` result (footing, column); P6 slab `length`/`width` swap; P7 steps net volume equals the sum over `k = 1..N` of `stepWidth·run·(k·rise)`; P8 unused fields do not matter; P9 non-negative; P10 `readyMixCost = readyMixPrice·volumeYd3` [CC25]. Verify: fails for steps.
- [x] 5.5 [RED] Language-free: every string of the results of S1, C2 and T1 matches an identifier pattern, a canonical Rational string, or the code `USD` (through `__testing__/collect-strings.ts` and `language-free.ts`) [CC26]. Verify: passes after 5.7 (T1 needs steps).
- [x] 5.6 [RED] `concrete.url.test.ts`: encoding of the default, F1 and the metric state gives `v=1`, `v=1&sh=footing&l=216&n=3`, `v=1&u=m&l=240&ws=25/2&bg=60&bp=13/2`; `sh=steps` alone `v=1&sh=steps`; `rp = $150` `v=1&rp=150`; `rs = 8 in` with `rn = 10 in` `v=1&rs=8&rn=10` [CC27]; decoding `v=1&sh=column&n=4`, `l=240&utm_source=x`, `v=1&u=m&l=240`, `v=1&sh=Slab&bg=50&ws=51&n=0&ns=51` gives the C2 state with no issues, `length = 240 in`, the metric state, and defaults with one `INVALID_VALUE` per `sh`, `bg`, `ws`, `n`, `ns` in that order [CC28]; round trip over at least 1,000 random valid states in both unit systems [CC29]. Verify: fails for `sh=steps` until 5.7.
- [x] 5.7 [GREEN] `concrete.ts`: `sh` options all four; `steps` = `stepWidth × run × rise × N(N+1)/2`; `released-snapshot.ts` `sh` options tuple final; catalogs `options.shape.steps` (EN/ES). Verify: 5.1–5.6 pass.
- [x] 5.8 [REFACTOR] Coverage 100 on `packages/core`; `npm run format && npm run lint && npm run typecheck`.
- [x] 5.9 Mutation measurement (SQ21): `npm run mutation -- --shard calculators` in the background to a log; record the mutant count and score in `apply-progress.md`. If the count passes about 400, split per AGENTS.md before S6: `calculators-<group>` shards (`mutate` and `tests` list the own `src/calculators/<id>` directories plus `index.test.ts`, and `released.contract.test.ts` in the first group), matching `.github/workflows/ci.yml` matrix entries, `mutation.contract.test.ts` exactly-once green (a separate commit `build(repo): split the calculators mutation shard`, forecast ~120 lines). Also run `units` once more: the geometry mutants are exercised by the column path.
- [x] 5.10 Negative proofs: replace `N(N+1)/2` by `N²` (CC11, P7 fail); apply waste after the bag ceiling (CC16, P1/P3 fail); drop a key from the encoded query (CC27 fails); revert.
- [x] 5.11 Exit: SX1–SX5.

### S6 — Engine size probe (SQ27)

Forecast: ~150 changed lines. Specs: site-quality [SQ27] (design C17, DR-7). Green because: the probe is a test over the engine surface; the budget leaves 8,192 B for the page code.

Planned commits: `build(web): pin vite to the version of astro` · `test(web): probe the minified size of the concrete engine surface`.

- [x] 6.1 [RED] `apps/web/src/contract/vite-version.contract.test.ts` (new): the `vite` devDependency of `apps/web/package.json` is an exact version (no `^`/`~`) equal to the `vite` version Astro resolves (read from `node_modules/astro/package.json` and `node_modules/vite/package.json`). Verify: fails (not declared).
- [x] 6.2 [GREEN] `apps/web/package.json`: add `vite` as an exact-pinned devDependency (record the resolved version in the PR body; the lockfile is excluded from the size count). Verify: 6.1 passes; `npm ci` clean.
- [x] 6.3 [RED] `apps/web/src/contract/client-size.contract.test.ts` and helper `apps/web/src/contract/client-build.ts`: Vite `build()` with `write: false`, minify on, library mode, and a virtual entry that re-exports what the entry will use (`concrete` from `lib/concrete.ts`, `encode`, `decode`, `toDecimalParts`, `toCents`, `formatFeetInches`); asserts the output ≤ 40,960 B and prints the size [SQ27]; asserts the output holds no `quikrete`, no `http://` and no `https://` text. Seeded: a virtual entry that imports `concreteMix` from `@maestro-calc/data` fails the "no source text" assertion (proves mitigation step 1 of C17). Verify: fails first with a helper missing, then reports the size.
- [x] 6.4 [GREEN] Implement `client-build.ts` and make the probe green. Record the measured size in `apply-progress.md`. Fallbacks, only if over 40,960 B (C17, in order, each a separate commit with the new size recorded): (1) keep `defineMaterial`, the record and the data root off the client path and confirm `sideEffects: false` tree-shaking; (2) stop pulling unused parsers through barrel re-exports by importing core subpaths or modules where `exports` allow, or add narrow core subpath exports (a reviewed core change); (3) drop client use of length-parser branches the page never accepts (none expected: CP24 needs the full parser); (4) STOP and report `blocked` for an owner decision. Inlining and raising the budget are never options.
- [x] 6.5 Negative proof: temporarily add a large unused import to the virtual entry and see the probe fail with the size; revert.
- [x] 6.6 Exit: SX1–SX3, SX5.

### G1 group tasks

- [x] G1.1 Record OA2 in `apply-progress.md`: the 17 URL keys and defaults are approved as written in the spec by the pipeline (owner decision delegated); listed for the owner's information, not a blocker. Record OA3 likewise (waste default `10` as a rule of thumb, per spec).
- [x] G1.2 Full mutation run, all shards, as CI does (background logs): `npm run mutation -- --list` then each shard; `calculators` meets its threshold; the geometry mutants live in `units`.
- [x] G1.3 Exit: GX1–GX5 (PR "feat(core): concrete engine (geometry, yields, calculator)" against `main`, merged before G2 merges). Done: PR #87 merged. **Deferred to the orchestrator** (push, CI, review, PR).

---

## G2 — Unrouted page parts (`feat/concrete-g2-page-parts`)

### S7 — Presenter and catalog copy

Forecast: ~400 changed lines. Specs: calculator-page [CP1]–[CP3] (values), [CP15], [CP16], [CP18], [CP24], [CP33], [CP34], [CP50] (text round trip); i18n-catalog [ICW11], [ICW12], [ICW13], [ICW17], [ICW18]. Green because: pure functions at 100 percent coverage and additive catalog keys; no page uses them yet. Contingency: split `S7a` (7.2–7.5, 7.8) / `S7b` (7.6–7.7).

Planned commits: `feat(web): add the pure calculator presenter` · `feat(i18n): add the concrete page copy and the calculator UI keys`.

- [x] 7.1 Create `feat/concrete-g2-page-parts` from the G1 tip (retarget onto `main` after G1 merges). Baseline: `npm run verify` green; `fd calculator apps/web/src` shows no `calculator/` directory yet.
- [x] 7.2 [RED] `apps/web/src/calculator/present.test.ts` (new), figures: `volumeText` (2 places, `,` grouping: `370,370.37`, `283,168.47` for case H), `moneyText` (`$481.00`, `$244.44`, `$407.41` for the 20 ft × 10 ft slab at `$150`), whole bags with grouping, percent `10`/`12.5`; `figuresOf(result, system)` for `run({})` gives `1.63`, `44.00`, `1.25`, `40.00`, `74`, `About 0.60 cubic feet per bag` from the template [CP1, CP2, CP3 values, CP15 order]; the live table of CP19–CP22 (default, `length` = `20`, bag 60, bag 40, `waste` 0, `waste` 15, footing defaults, F1, column defaults, C2, steps defaults) matches the spec numbers (yd³, ft³, m³, net ft³, bags), computed through core [CP24 engine side]; `$481.00` and `$244.44` [CP16 values]; `2.72` yd³ and `$407.41` unrounded ready-mix [CP18]. Verify: fails (module missing).
- [x] 7.3 [RED] Dimension and field text (same file): `dimensionText` US `12 ft`, `4 in`, `12 ft 6 in`, `5 ft 3 1/2 in`, metric `3.66 m`, `3.05 m`, `10.16 cm`; `fieldText` metric `3.6576 m`, `3.048 m`, `10.16 cm`, US restores `12 ft`, `10 ft`, `4 in` [CP33]; a metric entry `4` (m) has the US text `20000/127 in` and re-parsing gives exactly `20000/127 in`; metric text of `127/3 in` stays exact inches [CP50, C12]; round trip text to quantity to text over at least 1,000 random lengths in both directions (property) [CP50]; the S3 metric state encodes `l=20000/127&w=15000/127&t=500/127` [CP34 codec side]. Verify: fails.
- [x] 7.4 [RED] Sentences and bounds: `fillMessage(template, values)` replaces `{name}` placeholders; `answerValues(state, result, system)` yields the placeholder values of the four shapes; the default EN and ES sentences equal `Slab (12 ft × 10 ft, 4 in thick): 1.63 cubic yards with 10% extra. Bags of 80 lb: 74.` and `Losa (12 ft × 10 ft, 4 in de espesor): 1.63 yardas cúbicas con 10% de extra. Bolsas de 80 lb: 74.` [CP1, CP2]; metric sentence `Slab (3.66 m × 3.05 m, 10.16 cm thick): 1.25 cubic meters with 10% extra. Bags of 80 lb: 74.` [CP33]; `boundText` gives `1,000 ft`, `50%`, `1,000` [CP31 formatting]. Verify: fails.
- [x] 7.5 [GREEN] `apps/web/src/calculator/present.ts` (built on `toDecimalParts`, `toCents`, `formatFeetInches`; `,` grouping and `.` decimals in both locales; no `Intl`) [C15]. Add `apps/web/src/calculator/**` to the coverage `include` at 100 (`coverage.contract.test.ts` first, then `vitest.config.ts`). Verify: 7.2–7.4 pass; `npm run test:coverage`.
- [x] 7.6 [RED] i18n: the keys beyond the derived set are exactly the four material keys plus `calc.concrete.page.answer.{slab,footing,column,steps}`, `.example`, `.volumeYd3`, `.volumeM3`, `.shoppingLine`, `.bagYield`, `.wasteHelp`, `.wasteLess`, `.wasteMore`, `.priceHint`, `.readyMixNote` in both locales [ICW11]; every row of the ICW12 table resolves exactly (page rows included); answer placeholders per shape identical in both locales, the exact slab sentences, and the other three start with `Footing (`, `Column (`, `Steps (` / `Zapata (`, `Columna (`, `Escalones (` and end with `Bags of {bagLb} lb: {bags}.` / `Bolsas de {bagLb} lb: {bags}.` [ICW13]; `site.calculator.*` are exactly the eleven keys of the ICW17 table with no placeholders; the register test covers the `concrete` module and the `site` module (add an explicit assertion that `site.calculator.*` is scanned) [ICW17, ICW18]. Verify: fails.
- [x] 7.7 [GREEN] `packages/i18n/src/catalogs/{en,es}/concrete.ts` (page keys; footing, column and steps sentences authored to ICW13, ES neutral tú), `{en,es}/site.ts` (`site.calculator.*`), `apps/web/src/lib/i18n-contract.test-d.ts` (the page keys as an exact union). Verify: 7.6 passes; `npm test -- packages/i18n apps/web/src/lib apps/web/src/contract`.
- [x] 7.8 [REFACTOR] `npm run format && npm run lint && npm run typecheck`; `rg -n "from '@maestro-calc/i18n'" apps/web/src/calculator` is empty (the presenter takes text as arguments).
- [x] 7.9 Negative proofs: swap `,` and `.` in grouping (CP15 fails); round half down in `moneyText` (CP16 fails); remove `{bags}` from one ES sentence (ICW13 and completeness fail); use `Ingrese` in ES copy (ICW18 fails); revert.
- [x] 7.10 Exit: SX1–SX3, SX5.

### S8 — `CalculatorBody`, presentational components, templates, HTML budget proof

Forecast: ~400 changed lines. Specs: calculator-page [CP1], [CP2], [CP3], [CP4], [CP5] (anatomy), [CP8] (source list), [CP11] (static), [CP12], [CP14] (static), [CP15], [CP17], [CP40] (static), [CP41] (static), [CP43], [CP44] (static). Green because: nothing is routed; the container and parts are tested by rendering. Contingency: split `S8a` (8.1–8.3) / `S8b` (8.4–8.5).

Planned commits: `feat(web): add the presentational calculator components` · `feat(web): add the route-free CalculatorBody container` · `feat(web): style the calculator with the Blueprint tokens` · `test(web): prove the calculator HTML budget with full-length copy`.

- [x] 8.1 [RED] `apps/web/src/components/calculator/CalculatorBody.test.ts` (new; uses `__testing__/render-component.ts`): rendering the default view model for `en` and `es` gives the H1, the short answer, the figures and the "not running" note exactly as the CP1/CP2 table, `data-output` elements one per output key in the order `volumeYd3`, `volumeFt3`, `volumeM3`, `netVolume`, `bagCost`, `readyMixCost` plus one `[data-shopping="bag-80"]`, `bagCost`/`readyMixCost` `hidden` and the price hint visible [CP1, CP2, CP4]; the figures equal `run({})` of the registry calculator rounded for display [CP3]; breadcrumb `ol[aria-label]` (catalog value) before the H1, the result `h2`, and no `nav` inside the body [CP5]; every input has a label with the `calc.concrete.inputs.<key>` text, `inputmode="decimal"` for length/percent/money and `numeric` for counts, `autocomplete="off"`, no submit button [CP12]; all four shape groups are in the HTML, only `slab` visible, the shape buttons carry `aria-pressed` [CP11 static]; the controls are `disabled`, "Copy link" and the steppers `hidden` [CP41 static]; the "not running" note is visible, outside `<noscript>`, with the exact EN/ES text (`site.calculator.noscript` + `calc.concrete.page.example`) [CP40 static]; panel order and units: `1.63` yd³, `44.00` ft³, `1.25` m³, `40.00`, `Concrete mix, 80 lb bags`, `74`, `About 0.60 cubic feet per bag` [CP15]; the estimate note and the terms link `/terms` / `/es/terminos` [CP17]; the reserved areas exist as `data-reserved` blocks (shape area with the tallest shape, answer, notice, copy and status line, steppers) [CP44 static, DR-13]; `<template>` elements hold the twelve `errors.*` messages with their `{min}` / `{max}`, the four answer sentences, the notice texts and the copy states, none rendered [CP43]. Verify: fails.
- [x] 8.2 [RED] One test per part under `apps/web/src/components/calculator/`: `Breadcrumb`, `CalculatorForm` (fields per shape in spec order, default texts `12 ft`, `10 ft`, `4 in`, `16 in`, `8 in`, `12 in`, `8 ft`, `4 ft`, `7 in`, `11 in`, `3`, `1`, `10`; price inputs empty with placeholder `0.00`), `ResultPanel`, `ShoppingLine`, `SourceList` (name, link, `retrieved` date and `<time datetime>` equal to the entry's `updated`) [CP8 source side]. Verify: fails.
- [x] 8.3 [GREEN] `apps/web/src/components/calculator/{Breadcrumb,CalculatorForm,ResultPanel,ShoppingLine,SourceList}.astro` and the container `CalculatorBody.astro` (takes the view model, the content entry and the text as props; imports nothing from `@maestro-calc/i18n`, `routing` or `astro:content`, so the existing presentational-boundary lint holds). Verify: 8.1, 8.2 pass; `npm run lint`.
- [x] 8.4 [RED→GREEN] `apps/web/src/styles/calculator.css` and `styles.contract.test.ts` additions: number inputs `min-height` of `3.5rem` (56 px), other controls `var(--target-size)`, figures with `font-variant-numeric: tabular-nums` in fixed-width cells, reserved blocks with `min-height`, no animation under `prefers-reduced-motion`, the focus ring unchanged, orange-on-ink contrast at least 4.5 (through `contrast.ts`), total CSS within the 20,480 B budget (measured on the build in S13a). Verify: `npm test -- apps/web/src/styles`.
- [x] 8.5 [RED→GREEN] HTML budget proof (C18, DR-16): `apps/web/src/components/calculator/CalculatorBody.budget.test.ts` renders `CalculatorBody` inside `BaseLayout` with full-length placeholder copy (1,500 words, 8 FAQ answers of 450 characters (600 before the budget decision), a JSON-LD block holding the same FAQ text, all templates) and asserts the page HTML ≤ 40,960 B; prints the size. Implemented with the production pipeline (an injected route built by the real Astro build, because a container render omits the inlined CSS); see design "Budget decision: HTML". Seeded: 2,000 more characters of copy make it fail. Record the measured size. Fallbacks if over (each recorded, the budget is never raised): (1) shorten markup (class names, repeated attributes) and share templates; (2) render only the active shape's field markup and clone the others from templates (recheck CP11); (3) amend the spec and design by a recorded pipeline decision to lower the FAQ cap (600 to 450 characters) or the maximum words (1,500 to 1,200); (4) STOP and report `blocked` for an owner decision.
- [x] 8.6 [REFACTOR] `npm run format && npm run lint && npm run typecheck && npm run build` (still no route; `fd -e html . apps/web/dist` unchanged).
- [x] 8.7 Negative proofs: un-hide a cost row (CP1 fails); drop `disabled` from a control (CP41/CP40 static fails); move a message out of `<template>` (CP43 fails); put the note inside `<noscript>` (CP40 fails); revert.
- [x] 8.8 Exit: SX1–SX3, SX5.

### S9 — `templates.ts`, `check:site` template rules, CSP, `assetsInlineLimit`

Forecast: ~400 changed lines (the most likely overflow; planned cut `S9a` = 9.1–9.2, 9.8–9.10 about 150 lines, `S9b` = 9.3–9.7 about 250 lines). Specs: site-routing-i18n [SR17], [SR18]; site-shell [SS18], [SS20], [SS22], [SS23]; site-quality [SQ6]–[SQ8], [SQ12], [SQ13], [SQ22]–[SQ24], [SQ26], [SQ28]; site-seo [SE8], [SE18]–[SE23]; calculator-page [CP42], [CP47] (rule side); trust-pages [TP12]. Green because: the rules derive the template from the route table, which has no calculator page yet, so every existing page keeps being checked as before and the new rules are proven by seeded fixtures.

Planned commits: `feat(web): add the template lists with PAGELESS and the SR17 contract` · `feat(web): derive check:site rules from the page template` · `build(web): allow script-src self and keep scripts out of the inline limit`.

- [x] 9.1 [RED] `apps/web/src/routing/templates.test.ts` and `apps/web/src/contract/templates.contract.test.ts` (new): `templateOf` returns the template per id; `CALCULATOR_PAGES` is `[]` and `PAGELESS` is `['rectangle-area', 'concrete']` for now; each page id is a table id and each registry calculator is in exactly one list; seeded failures name the id for: a page id missing from the table, a registry calculator in neither list, an id in both lists, a `PAGELESS` id that is not in the registry [SR17]; the template of `home`, a trust id and `notFound` [SR18 logic]. Verify: fails.
- [x] 9.2 [GREEN] `apps/web/src/routing/templates.ts` (`CALCULATOR_PAGES`, `PAGELESS`, `templateOf`; 100 percent covered). Verify: 9.1 passes.
- [x] 9.3 [RED→GREEN] Scripts, budgets and weight in `apps/web/src/site-check/{structure,budgets,files}.ts` with tests on in-memory fixtures: a static page keeps only `application/ld+json`, no `on*`, no `astro-island`, no `modulepreload` [SS18]; a calculator page has exactly one `script[type=module][src^="/_astro/"]` with no body, `modulepreload` same-origin only, both locales share the entry [SS20]; seeded SS22 failures (inline script with text, a second `<script src>`, an `onclick`, a non-same-origin script, a `<script src>` on `/privacy`) each name the page and the rule [SS22]; any 1-byte `.js` referenced from a static page fails [SQ8]; entry at 49,152 B passes and 49,153 fails naming page, file and limit [SQ22]; an entry of 20,000 B plus a static import of 20,000 B fails [SQ23]; a calculator page of 196,609 B and a trust page of 163,841 B fail with their own limits [SQ24]; an HTML of 40,961 B fails [SQ7]; the CLI prints the largest page per category including the JavaScript of the calculator pages [SQ6]; `dist` JavaScript is allowed only under `_astro/` and reachable from a calculator page.
- [x] 9.4 [RED→GREEN] Bundle facts in `site-check/facts.ts`: the calculator JS graph holds none of `document.cookie`, `localStorage`, `sessionStorage`, `indexedDB`, `fetch(`, `XMLHttpRequest`, `sendBeacon`, a sample of catalog message text of both locales (taken from the catalogs: `errors.DECIMAL_COMMA` and `site.calculator.copyLink` in each locale) and no `http://` or `https://` URL other than `https://maestrocalc.com`; the QUIKRETE URL may appear only in HTML as an allowlisted outbound link [SS23, CP47 rule side]; both locales load the same entry and the entry plus its static graph is within 49,152 B with no catalog message text in any file of the graph [CP42 rule side]; the existing third-party-origin scan [TP12] stays green; no page references a `/cdn-cgi/` script and static pages request no script [SQ28 rule side]. Seeded: each forbidden string fails naming the file.
- [x] 9.5 [RED→GREEN] JSON-LD rules in `site-check/head.ts` and `types.ts`: a calculator page declares exactly `WebApplication`, `BreadcrumbList`, `FAQPage` with the property rules of site-seo (name equals the H1, `url` equals the canonical, `inLanguage`, `applicationCategory` `UtilitiesApplication`, `operatingSystem` `Any`, `isAccessibleForFree` `true`, no `offers`, `aggregateRating`, `review`, `ratingValue`, `image`; breadcrumb items `Home`/`Inicio`) [SE19]; FAQ entities equal the visible FAQ `h3` and answers one to one in order, at least four [SE20]; seeded `AggregateRating`, an `offers` property, a `Product` node, a FAQ question not in the HTML each fail naming the page and the property [SE21]; a missing `BreadcrumbList` fails [SE22]; trust and home pages declare none of the calculator or forbidden types [SE23]; a malformed block still fails [SE8]; heading order: one `h1`, no level jumps over 1, FAQ questions `h3` under the FAQ `h2` [SE18].
- [x] 9.6 [RED→GREEN] Links, dates and breadcrumb in `site-check`: external links allowed only from a calculator's `sources[].url` allowlist; `time[datetime]` equals the entry `updated`; a calculator page has the breadcrumb `ol[aria-label]` before the `h1` and exactly one `nav` (CP5 built side); the template of each page is read from `templateOf`, never guessed [SR2 allowlist].
- [x] 9.7 [GREEN] `apps/web/scripts/check-site.ts` and `site-check/cli.ts`: the expected page counts derive from `ROUTES`; `npm run build && npm run check:site` stays green on the current build (no calculator page: JS budget 0 everywhere).
- [x] 9.8 [RED→GREEN] `apps/web/public/_headers` and `apps/web/src/contract/headers.contract.test.ts`: the global block's CSP `script-src` is exactly `'self'` and no other `script-src` appears; it contains none of `'unsafe-inline'`, `'unsafe-eval'`, `'strict-dynamic'`, a nonce, a hash, `data:` or a host; the other directives are unchanged [SQ12]; hashed assets (including calculator JS) match an `immutable` rule and no `.html` path does [SQ13]; an inline `<script>alert(1)</script>` in a calculator page fails `check:site` [SQ26 gate side].
- [x] 9.9 [RED→GREEN] `apps/web/astro.config.mjs` `vite.build.assetsInlineLimit: (file) => file.endsWith('.js') ? false : undefined` (C10) and `apps/web/src/contract/astro-config.contract.test.ts`: the function returns `false` for `.js` and `undefined` for `.css` and `.svg`. The real build proof is in 13a.9.
- [x] 9.10 [REFACTOR] Production-consistency check: `rg -n -i "javascript|no scripts|sin scripts|sin javascript" apps/web/src/content/pages` shows no copy that the new CSP or the per-template rule contradicts (calculator pages are not yet live; the privacy update is S12). Fix only wording that is false today. `npm run format && npm run lint && npm run typecheck && npm run verify`.
- [x] 9.11 Negative proofs: remove a rule's guard so a `<script src>` on `/privacy` passes (SS22 fails); drop the graph from the budget sum (SQ23 fails); widen the CSP to `'self' 'unsafe-inline'` (SQ12 fails); list `concrete` in both lists (SR17 names it); revert.
- [x] 9.12 Exit: SX1–SX3, SX5.

### S10 — `calculators` collection, EN/ES copy, `faqOf`, `calculatorJsonLd`

Forecast: ~400 changed lines (two entries of 800–1,500 words each). Specs: calculator-page [CP5] (ids), [CP6]–[CP10]; site-seo [SE19], [SE20] (builder side); material-data-contract [MDC4] (copy side). Green because: entries are validated at build and read directly by contract tests; no page renders them yet. Contingency: split `S10a` (schema, `faqOf`, JSON-LD, contract tests, ~200 lines) / `S10b` (the two entries).

Planned commits: `feat(web): add the calculators content collection and its schema` · `feat(web): add faqOf and the calculator JSON-LD builder` · `docs(web): write the English concrete calculator copy` · `docs(web): write the Spanish concrete calculator copy`.

- [x] 10.1 [RED] `apps/web/src/content/schema.test.ts` additions: the calculator frontmatter accepts a valid entry and rejects, each naming the entry and the field, `sources: []`, `ownerReview: maybe`, `updated: 25/10/2026`, a source `url` starting `http://`, a `workedExample` without `bags` [CP6]; `id` must be a registry calculator id; an entry for an unknown id fails.
- [x] 10.2 [GREEN] `apps/web/src/content/schema.ts` (calculator schema: `id`, `locale`, `updated`, `ownerReview`, `sources[{name,url,retrieved}]`, `workedExample{netFt3,totalFt3,yd3,bags,bagLb}`) and `apps/web/src/content.config.ts` (`calculators` collection over `content/calculators/{en,es}/*.md`, duplicate `(id, locale)` and missing counterpart rejected). Verify: 10.1 passes.
- [x] 10.3 [RED] `apps/web/src/content/faq.test.ts` (new): `faqOf(body)` returns the questions (`###`) and plain-text answers of the FAQ section in order, for the EN id `faq` and the ES id `preguntas-frecuentes`; throws on an answer over 450 characters, on links, emphasis or lists inside an answer, and on fewer than 4 items. Verify: fails.
- [x] 10.4 [GREEN] `apps/web/src/content/faq.ts`. Verify: passes.
- [x] 10.5 [RED] `apps/web/src/seo/json-ld.test.ts` additions: `calculatorJsonLd(entry, locale, faq)` returns the three types with the values of site-seo (EN and ES `inLanguage`, breadcrumb items `Home`/`Inicio` with `https://maestrocalc.com/` and `/es`, item 2 equals the H1 and the canonical, `WebApplication.url` the canonical), one `Question` per FAQ item with equal text, no `offers`, `aggregateRating`, `review`, `ratingValue`, `image` [SE19, SE20 builder side]. Verify: fails.
- [x] 10.6 [GREEN] `apps/web/src/seo/json-ld.ts`: `calculatorJsonLd`. Verify: passes.
- [x] 10.7 [RED] `apps/web/src/contract/calculator-content.contract.test.ts` (reads the entries directly through `contract/content.ts`): a missing `es` counterpart fails naming `concrete` and `es`; a duplicate `(concrete, en)` fails [CP7]; the five `h2` ids in order (EN `how-to-use`, `formulas`, `tips`, `faq`, `sources`; ES `como-usar`, `formulas`, `consejos`, `preguntas-frecuentes`, `fuentes`) [CP5 source side]; sources include the QUIKRETE source (name, URL, `2026-10-25` equal to `concreteMix.source`) and a NIST SP 811 Appendix B source with a retrieval date; the body never contains `ownerReview`, `draft`, `borrador`, `pending review` [CP8, MDC4]; `workedExample` equals the default state through the registry `concrete` (`40.00`, `44.00`, `1.63`, `74`, `80`), each figure appears in the Formulas section, and changing one in the Markdown or in the engine alone fails [CP9]; 800 to 1,500 words per entry, equal counts of `h2` and FAQ items across locales, each FAQ answer plain text of at most 450 characters [CP10]; the ES entry passes `registerProblems`; the waste default is described as a rule of thumb (`rule of thumb` / `regla general`), yields use "about" / "aproximadamente", and the page links `/methodology#concrete` / `/es/metodologia#concreto`. Verify: fails (entries missing).
- [x] 10.8 [GREEN] Author `apps/web/src/content/calculators/en/concrete.md` and `es/concrete.md` per PLAN.md §5.1: frontmatter `id: concrete`, `locale`, `updated: 2026-10-25`, `ownerReview: pending`, the two sources, `workedExample`; sections How to use, Formulas and worked example (12 × 10 ft × 4 in = 40 ft³; +10% = 44 ft³ = 1.63 yd³; 74 bags of 80 lb), Tips and common mistakes, FAQ (8 questions, plain-text answers of at most 450 characters), Sources and review date. ES in neutral tú with US trade terms ("losa", "zapata", "yardas cúbicas", "bolsas de 80 lb"). Two commits (EN, ES). Verify: 10.7 passes; `npm run build` validates the collection (no page renders it).
- [x] 10.9 [RED→GREEN] `apps/web/src/site-check/content.test.ts` and `content.ts`: the count of `pending` entries now also counts the `calculators` collection and is printed, never failing on it.
- [x] 10.10 Negative proofs: set `sources: []` in a temporary copy and run `npm run build` (exits non-zero naming the entry and field), restore; change `workedExample.bags` to 75 (CP9 fails); add a 650-character answer (CP10, `faqOf` fail); revert.
- [x] 10.11 Exit: SX1–SX3, SX5.

### G2 group tasks

- [x] G2.1 Production-consistency review of the group tip: `npm run build` output has no new page, no script, CSP `script-src 'self'`; `rg -n "calc.concrete|concrete" apps/web/dist` finds no calculator copy in the built site (entries and keys are not rendered).
- [x] G2.2 Exit: GX1–GX5. Done: PR #88 merged (main `a4bb08a`), JD APPROVED.

---

## G3 — Go-live (`feat/concrete-g3-go-live`)

### S11a — Pure controller and layout

Forecast: ~350 changed lines. Specs: calculator-page [CP11] (data), [CP14] (logic), [CP16], [CP18]–[CP22], [CP25]–[CP39], [CP46] (state side), [CP50] (controller); site-routing-i18n [SR20], [SR21] (href values). Green because: pure modules at 100 percent coverage, unused until S11b.

Planned commits: `feat(web): add the calculator layout table` · `feat(web): add the pure calculator controller`.

- [x] 11a.1 Create `feat/concrete-g3-go-live` from the G2 tip (retarget onto `main` after G2 merges). Baseline: `npm run verify` green.
- [x] 11a.2 [RED] `apps/web/src/calculator/layout.test.ts` (new): visible fields per shape equal the CP11 table in order (`slab` `length`, `width`, `thickness`; `footing` `length`, `footingWidth`, `footingDepth`, `count`; `column` `diameter`, `height`, `count`; `steps` `stepWidth`, `rise`, `run`, `stepCount`), the always-visible tail (`waste`, bag, `bagPrice`, `readyMixPrice`); the reserved row count is the maximum over shapes (4) for all four shapes [CP14 logic]. Verify: fails.
- [x] 11a.3 [RED] `apps/web/src/calculator/controller.test.ts` (new), grouped: **load** `?v=1&sh=footing&l=216&n=3` gives Footing, length text `18 ft`, count `3` and the F1 figures `1.96 / 52.80 / 1.50 / 48.00 / 88` [CP25]; `?v=1&sh=Slab&bg=50&ws=51` gives defaults and the `errors.INVALID_VALUE` notice, `?v=2&l=240` gives defaults and `errors.UNSUPPORTED_VERSION`, `?utm_source=x&l=240` gives the 20 ft state with no notice, and a bare `?utm_source=x` visit writes nothing until the first edit [CP29]; **edits** typing `20` gives the answer `Slab (20 ft × 10 ft, 4 in thick): 2.72 cubic yards with 10% extra. Bags of 80 lb: 123.` and the row `length` = `20` [CP19]; Footing, Column, Steps give the default rows and the sentence starts [CP20]; bag 60 then 40 give `98`, `147`, unchanged volumes and the yield lines [CP21]; `0` in waste and "More extra" once give the `waste` = `0` and `15` rows, "Less extra" at `0` and "More extra" at `50` change nothing [CP22]; **price** an empty price is set explicitly to `undefined` on its own key and overrides the spread of the last valid state (type a price, clear it: `bagCost` hidden, `bp` dropped from the query) [DR-11, C11]; `bagPrice` `6.50` gives `$481.00` and with `readyMixPrice` `150` `$244.44` [CP16]; 20 ft × 10 ft slab at `$150` gives `2.72` and `$407.41` [CP18]; **URL** the writes `?v=1&l=240`, then `?v=1&l=240&bg=60`, then `?v=1&l=240&bg=60&bp=13/2` happen only on valid state, `history.length` unchanged by contract (the controller returns a replace instruction, never a push) [CP26]; typing `12` returns the query to `?v=1` [CP27]; decoding the written query restores the same state and texts [CP28]; **errors** `abc` marks the field invalid with code `MALFORMED`, the answer and every figure are `—`, no URL write, then `20` restores `2.72` and `123` [CP30]; `1001 ft`, `51`, footing `1001`, `0` give `max` `1,000 ft`, `50%`, `1,000`, and `min` `1` messages' parameters [CP31]; `1,5` and `5 furlongs` in thickness give `DECIMAL_COMMA` and `UNKNOWN_UNIT` with no figure [CP32]; each invalid field has an id and a described-by id for its message [CP46 state side]; a hidden field never blocks the visible shape (the record is `{ ...lastValidState, ...visibleTexts }`); **units** the toggle keeps every exact value and re-renders field texts (`3.6576 m`, `3.048 m`, `10.16 cm`, `?v=1&u=m`, primary figure in m³, the metric sentence, `74` bags) and back restores `12 ft`, `10 ft`, `4 in`, `?v=1` [CP33]; metric entry `4`, `3`, `10` gives `1.32 / 1.73 / 46.62`, `42.38` before extra, `78` bags and `?v=1&u=m&l=20000/127&w=15000/127&t=500/127` [CP34]; `20 ft` typed under metric gives `l=240` [CP35]; metric `4` then US shows `20000/127 in` with the figures and query unchanged [CP50]; **switch** `/concrete-calculator?v=1&l=240` gives `/es/calculadora-de-concreto?v=1&l=240` [CP36, SR20], a bare visit gives `/concrete-calculator` [CP37], the bag 60 edit gives `/es/calculadora-de-concreto?v=1&bg=60` [SR21]; **copy** the payload for `waste` 15 is `<origin>/concrete-calculator?v=1&ws=15` with the status key `site.calculator.linkCopied` [CP38]; a rejection selects `site.calculator.copyFailed` and a read-only field with the address [CP39]. Verify: fails.
- [x] 11a.4 [GREEN] `apps/web/src/calculator/layout.ts` and `controller.ts`: pure state machine over the engine (`decode`, `run`, `encode`) and `present.ts`; the raw record is `{ ...lastValidState, ...visibleTexts }` with the explicit `undefined` price; query writes only on valid state; no DOM, no `window`. Verify: 11a.2, 11a.3 pass; 100 percent coverage.
- [x] 11a.5 [REFACTOR] `npm run format && npm run lint && npm run typecheck && npm run test:coverage`.
- [x] 11a.6 Negative proofs: drop the `undefined` override (DR-11 test fails); write the URL while a field is invalid (CP30 fails); push instead of replace (CP26 fails); lose exactness in the toggle (CP50 fails); revert.
- [x] 11a.7 Exit: SX1–SX3, SX5.

### S11b — `mount.ts`, entry, `ConcreteScript.astro`, graph contract

Forecast: ~350 changed lines. Specs: calculator-page [CP23], [CP41], [CP42] (graph), [CP47] (early check), [CP48]; site-shell [SS23] (early check). Green because: no page references the script component yet, and the built-graph proof runs on a Vite library build of the real entry. `mount.ts` is tested by Playwright in S13b only (coverage exclusion pinned).

Planned commits: `test(web): walk the client entry import graph` · `feat(web): add the concrete client entry and DOM mount` · `feat(web): add the concrete script island`.

- [x] 11b.1 [RED] `apps/web/src/contract/entry-graph.contract.test.ts` (new): the module graph of `apps/web/src/client/entries/concrete.ts` never reaches `apps/web/src/lib/calculators.ts`, another calculator directory of core, or the root entry of `@maestro-calc/data`; it reaches `lib/concrete.ts` and the `yields/concrete-mix` subpath [CP48]; seeded virtual graphs for each violation name the path. `apps/web/src/contract/client-entry.contract.test.ts` (new, uses `client-build.ts` from S6): a Vite library build of the real entry is at most 49,152 B, contains none of the SS23 forbidden strings or catalog messages, and no URL other than `https://maestrocalc.com` [CP42, CP47, SS23 early check]. `client-hygiene.contract.test.ts`: `rg`-style scan of `apps/web/src/client` for `innerHTML`, `insertAdjacentHTML`, `document.write`, `eval`, `new Function`, `localStorage`, `sessionStorage`, `fetch(`, `XMLHttpRequest`, `sendBeacon` finds nothing. Verify: fails (entry missing).
- [x] 11b.2 [GREEN] `apps/web/src/client/entries/concrete.ts` (imports `lib/concrete.ts`, `calculator/*`, `client/mount.ts`; never the registry or the data root). Verify: the graph contract passes.
- [x] 11b.3 [GREEN] `apps/web/src/client/mount.ts`: thin DOM glue, written only with `textContent`, `value`, attributes and `hidden`/`disabled`: reads the `<template>` messages, decodes `location.search`, enables the controls and reveals "Copy link" and the steppers, hides the "not running" note only after a successful mount [CP41, DR-14]; listens to `input` and `click` and prevents Enter from submitting [CP23]; sets `aria-invalid`, `aria-describedby` and the polite live region; `history.replaceState`; updates the switch `href`; copies with `navigator.clipboard.writeText` and shows the fallback [CP38, CP39]. Add the two exclusions (`client/mount.ts`, `client/entries/**`) to `coverage.contract.test.ts` then `vitest.config.ts` (exactly these two). Verify: typecheck, lint, the hygiene scan.
- [x] 11b.4 [GREEN] `apps/web/src/islands/ConcreteScript.astro`: one processed `<script>import '../client/entries/concrete.ts'</script>` (the `SCRIPTS` map arrives with the route in 13a.4).
- [x] 11b.5 [REFACTOR] Runtime harness (recorded, not committed): a temporary page `apps/web/src/pages/__concrete-dev.astro` rendering `CalculatorBody` and `ConcreteScript` under `cd apps/web && npx astro dev --background`; type in a field, press a shape button, reload with a query; `npx astro dev stop`; delete the page; `git status --porcelain` clean; log the observations. Then `npm run build` (no page references the island, no script emitted: `fd -e js . apps/web/dist` empty).
- [x] 11b.6 Negative proofs: import `lib/calculators.ts` from the entry (CP48 names it); import `concreteMix` from the data root (CP47 early check finds `quikrete`); add `innerHTML` (hygiene fails); revert.
- [x] 11b.7 Exit: SX1–SX3, SX5.

### S12 — Methodology, privacy, `AGENTS.md`

Forecast: ~300 changed lines. Specs: trust-pages [TP9], [TP12], [TP13], [TP14], [TP22]–[TP27]. Green because: contract tests read the Markdown directly; the pages go live only with the group tip (G3 rule).

Planned commits: `docs(web): document the concrete calculator in the methodology (EN/ES)` · `docs(web): describe calculators in the privacy page (EN/ES)` · `docs(repo): extend the adding-a-calculator recipe`.

- [x] 12.1 [RED] `apps/web/src/contract/methodology-concrete.contract.test.ts` and `content.contract.test.ts` updates: ids `concrete` (EN) and `concreto` (ES) exist exactly once on headings and the calculator entries link to `/methodology#concrete` and `/es/metodologia#concreto` [TP22]; the section states the four formulas (slab and footing, column with `π × (diameter / 2)² × height × pieces`, steps `N(N+1)/2`), waste applied before bags and bags rounded up, yields `0.30`, `0.45`, `0.60` ft³ with the source name, URL and `2026-10-25` read from `concreteMix`, "approximately" / "aproximadamente", the waste default as a rule of thumb, and the π digits `3.14159265358979323846264338327950288` equal to the digits of the core `PI` with the error statement below `10^-35` [TP23, MDC4]; the published cases table (slab default 40.00 / 44.00 / 1.63 / 74, footing `l=216 n=3` 48.00 / 52.80 / 1.96 / 88, column default 6.28 / 6.91 / 0.26 / 12, steps default 12.83 / 14.12 / 0.52 / 24) is parsed and run through core at the displayed precision, and the test fails when a figure changes in the Markdown or in the engine alone [TP24]; none of `No calculator is published yet`, `Todavía no hay ninguna calculadora publicada` [TP26]; whole-word scan for `roofing`, `drywall`, `paint`, `gravel`, `mulch`, `topsoil`, `techado`, `pintura`, `grava` finds nothing [TP25]; one H1, at least two `h2`, the about-corrections link and none of `certified`, `licensed engineer`, `ingeniero licenciado`, `certificado por` [TP9]. Verify: fails.
- [x] 12.2 [GREEN] `apps/web/src/content/pages/{en,es}/methodology.md`: the concrete section; replace the "no calculator published" sentence. Verify: 12.1 passes.
- [x] 12.3 [RED] Privacy: the section `## Calculators` (id `calculators`) / `## Calculadoras` (id `calculadoras`) exists exactly once with the exact copy of the spec; the cookies sentence is exactly `Maestro Calc does not use cookies. The site has no analytics, no advertising and no accounts, and it does not keep anything about you in your browser.` / `Maestro Calc no usa cookies. El sitio no tiene analítica, publicidad ni cuentas, y no guarda nada sobre ti en tu navegador.`; `no forms` / `ni formularios` absent, `no accounts` / `ni cuentas` present [TP27]; forbidden names (`Google Analytics`, `GA4`, `Tag Manager`, `GTM`, `AdSense`, `Mediavine`, `Raptive`, `Amazon`, `affiliate`, `afiliad`) absent [TP13]; Cloudflare, no cookies and `contacto@maestrocalc.com` present [TP14]; `site-check/facts.test.ts` proves the facts rule scans the calculator JS for cookies, storage and third-party origins [TP12 unit side]. Verify: fails.
- [x] 12.4 [GREEN] `apps/web/src/content/pages/{en,es}/privacy.md`. Verify: 12.3 passes; `registerProblems` clean on the ES copy.
- [x] 12.5 [RED→GREEN] `AGENTS.md` "Adding a calculator": keep steps 1–6 and add the content entry (`content/calculators/{en,es}/<id>.md`), the client entry (`client/entries/<id>.ts`) and island (`islands/<Id>Script.astro`) with its `SCRIPTS` row, the `ROUTES` row with `page.<id>.title|description`, and `CALCULATOR_PAGES`/`PAGELESS`; note that the Lighthouse representative stays unchanged. `apps/web/src/contract/docs.contract.test.ts` first pins the new step list (RED), then the edit (GREEN).
- [x] 12.6 Negative proofs: change a published case figure in the Markdown only (TP24 fails); re-add "No calculator is published yet" (TP26 fails); add `ni formularios` (TP27 fails); revert.
- [x] 12.7 Exit: SX1–SX3, SX5.

### S13a — Route live

Forecast: ~280 changed lines. Specs: site-routing-i18n [SR1]–[SR3], [SR5], [SR16], [SR18], [SR19]; i18n-catalog [ICW1], [ICW4], [ICW7], [ICW16]; site-seo [SE1]–[SE3], [SE10]–[SE12], [SE14]–[SE18]; site-shell [SS1], [SS20]; site-quality [SQ3]–[SQ6], [SQ9], [SQ18], [SQ25], [SQ28]; trust-pages [TP7], [TP8], [TP21], [TP26]; calculator-page [CP5], [CP8], [CP17], [CP40], [CP42], [CP47]. Green because: the route, the entry, the methodology and privacy copy, the home link and the gates reach `main` in the same merge.

Planned commits: `feat(web): publish the concrete calculator route and page` · `feat(web): link the calculator from the home pages` · `test(e2e): cover the calculator in Lighthouse, smoke and the no-JS project`.

- [x] 13a.1 [RED] Route, catalog and end state: `routes.test.ts` row `concrete` = `/concrete-calculator` and `/es/calculadora-de-concreto`; `site-catalog.contract.test.ts`: every table id has `page.<id>.title|description` in both locales, none beyond `notFound` [ICW4], a catalog without `es` `page.contact.description` still fails naming the key [ICW7]; `page.concrete.title|description` equal the ICW16 strings (56, 125, 57, 144 characters) and all four are unique in the site [ICW16, SE16 values, SE1]; `end-state.contract.test.ts` is rewritten to pin the ids `home`, `methodology`, `about`, `privacy`, `terms`, `contact`, `concrete`, 14 static paths, 16 pages, 16 `page.*` keys per locale [ICW1], 14 `<loc>` in the sitemap, 10 trust entries and 2 calculator entries [SR19]; `templates.contract.test.ts` now expects `CALCULATOR_PAGES` `['concrete']` and `PAGELESS` `['rectangle-area']` [SR17]; the methodology, privacy and home copy must mention the concrete calculator only when `ROUTES` has it (the "iff" assertion for TP26). Verify: fails.
- [x] 13a.2 [GREEN] `apps/web/src/routing/routes.ts` (`concrete` row), `packages/i18n/src/catalogs/{en,es}/site.ts` (`page.concrete.title|description`), `apps/web/src/routing/templates.ts` (`CALCULATOR_PAGES` `['concrete']`, `PAGELESS` `['rectangle-area']`). Verify: 13a.1 passes except the view tests.
- [x] 13a.3 [RED] `apps/web/src/views/CalculatorView.test.ts` and `routing/static-paths-page.test.ts`: `CalculatorView` renders head (title and description from the catalog, query-free canonical, three reciprocal hreflang, no `noindex`) [SE16, SE17, SE2], one H1 equal to the calculator title [SE18], the sections of CP5 in order (`h1`, result `h2`, five content `h2` with the ids, FAQ `h3`, one `ol[aria-label]` above the H1, exactly one `nav`) [CP5, SS1], the three JSON-LD types from the real entries [SE19, SE20], the terms link [CP17], the sources and `time[datetime]` [CP8], and exactly one `script[type=module][src^="/_astro/"]` chosen from `SCRIPTS[id]` [SS20]; the catch-all renders `concrete` with the calculator template and every other id as before [SR18].
- [x] 13a.4 [GREEN] `apps/web/src/views/CalculatorView.astro` (route-aware: head, JSON-LD, `SCRIPTS: Record<CalculatorPageId, AstroComponent>`), `apps/web/src/pages/[...path].astro` branch for calculator ids, calculator content read through the `calculators` collection. Verify: 13a.3 passes; `npm run build` emits `dist/concrete-calculator.html` and `dist/es/calculadora-de-concreto.html`.
- [x] 13a.5 [RED→GREEN] Home link: `HomeView.test.ts`: `main a[href]` holds `/concrete-calculator` (EN) and `/es/calculadora-de-concreto` (ES) with link text from the catalog (a new `site.home.*` key; exact name recorded in `apply-progress.md`), no other calculator is named [TP21]; `/methodology`, `/about` (and the ES paths) still present [TP7]; none of `coming soon`, `próximamente`, `pronto`, `trusted by`, `miles de`, `stars`, `estrellas`, and the link sits inside the introduction paragraph (no `ul`/`ol` in `main`) [TP8]. Then edit `HomeView.astro` and the catalogs.
- [x] 13a.6 [RED→GREEN] Browser tooling: `tooling/site-browser/e2e/urls.ts` derives routable pages, calculator pages and static pages from `ROUTES`/templates; `tooling/site-browser/e2e/representative.ts` names `concrete` once; `tooling/site-browser/lighthouserc.json` URLs become `/`, `/es`, `/methodology`, `/es/metodologia`, `/concrete-calculator`, `/es/calculadora-de-concreto` (the privacy pair is dropped), thresholds unchanged (categories 0.95 `error`, performance `warn`, CLS 0.01 `error`, `numberOfRuns` unchanged) [SQ9]; `apps/web/src/contract/lighthouse.contract.test.ts` asserts the six URLs, and fails when the representative id is not a calculator page of the table or its two paths are missing [SQ25]. SQ10 and SQ11 stay as regression (thresholds unchanged).
- [x] 13a.7 [RED→GREEN] E2E (first part): `tooling/site-browser/playwright.config.ts` adds a `no-js` project (`javaScriptEnabled: false`) and `e2e/no-js.spec.ts`: both calculator pages answer 200, show `1.63 cubic yards` / `74` and `1.63 yardas cúbicas` / `74`, the "not running" note with the exact text, "Copy link" not visible, controls disabled, and no request of type `script` [SQ18, CP40]; `e2e/smoke.spec.ts` adds the calculator page per locale to the phone smoke (status 200, `lang`, one visible H1, no horizontal overflow) [SQ3], keeps SQ4, asserts every request origin equals the server origin [SQ5], and adds the SQ28 test (every non-calculator page requests no script and references no `/cdn-cgi/`; the target base URL is read from `BASE_URL` so the same test runs as the post-deploy smoke in F.2); the 14 canonical paths answer 200 without redirect and `/concrete-calculator?v=1&l=240` and its ES twin answer 200 with the clean-path body [SR3, SR16]. Run: `npm ci --prefix tooling/site-browser && npm run test:e2e` (project filter for the new files).
- [x] 13a.8 Real-build gates: `npm run build && npm run check:site` green with the calculator pages; record sizes in `apply-progress.md`: entry plus graph vs 49,152 B, calculator HTML vs 40,960 B, CSS vs 20,480 B, page weight vs 196,608 B. Both locales load the same entry file, the graph holds no catalog text, the only URL is the site origin, the QUIKRETE URL is only in HTML [CP42, CP47, SS20, SS23]; the built set is the 14 canonical paths plus the two 404 files [SR1], sitemap lists 14 URLs with three alternates each and equals the head hreflang [SE10, SE11, SE12], 16 pages checked [SE14], titles and descriptions unique and from the catalog [SE1, SE2, SE3], every internal link and fragment resolves including `/methodology#concrete` [SR2], the language switch equals the table counterpart with no query [SR5], home and trust JSON-LD unchanged [SE6, SE7, SE8, SE23], missing canonical still fails [SE15], budgets print [SQ6]. If a budget fails, apply the fallbacks recorded in 6.4 and 8.5 (never raise a budget).
- [x] 13a.9 Negative proofs (temporary, not committed): restore the default `assetsInlineLimit` and rebuild (the entry would be inlined; `check:site` fails SS22/SS20; keep the config); add the QUIKRETE URL string to `client/entries/concrete.ts` (CP47 fails); move `concrete` back to `PAGELESS` while the route exists (SR17 names it); remove `page.concrete.description` for `es` (ICW7 fails); revert; `git status --porcelain` clean.
- [x] 13a.10 Exit: SX1–SX3, SX5. Record the rollback boundary in the PR body (see "Group rules").

### S13b — JS end-to-end, axe states, CLS, CSP console

Forecast: ~350 changed lines (defect fixes found here count toward the cap). Specs: calculator-page [CP11]–[CP14], [CP16], [CP18]–[CP46], [CP49], [CP50]; site-quality [SQ1], [SQ2], [SQ14], [SQ17], [SQ19], [SQ20], [SQ26]; site-shell [SS19], [SS21]; site-routing-i18n [SR7], [SR20]–[SR22]. Contingency: split `S13b-1` (13b.1) / `S13b-2` (13b.2).

Planned commits: `test(e2e): drive the calculator with scripts enabled` · `test(e2e): scan the interactive states with axe and measure layout shift` · `fix(web): <defect found by the browser suite>` (as needed).

- [x] 13b.1 [RED] `tooling/site-browser/e2e/calculator.spec.ts` (new; phone profile, data-driven over the EN and ES pages; expected values taken from the spec tables): shape buttons show the CP11 field sets and `aria-pressed` [CP11]; labels equal the catalog text, `inputmode`, no submit [CP12]; touch targets at 390 × 844 (buttons ≥ 44 × 44, number inputs ≥ 56 px) [CP13]; the shape area has the same height for the four shapes [CP14]; typing, shapes, bag sizes, waste field and steppers reproduce the live table and the sentences [CP19, CP20, CP21, CP22]; costs `$481.00`, `$244.44`, `2.72` and `$407.41` [CP16, CP18]; Enter changes neither URL nor page and triggers no request [CP23]; every state of the CP24 list loaded through its query shows the strings of the build-time render for that state [CP24]; restore from `?v=1&sh=footing&l=216&n=3` [CP25], the query writes and `history.length` [CP26], back to `?v=1` [CP27], reload [CP28], bad and noisy links with the notices [CP29]; errors, bounds and comma/unit messages [CP30, CP31, CP32]; the toggle texts, the metric entry query, explicit units and the exact metric to US round trip [CP33, CP34, CP35, CP50]; the switch `href`, the ES page opened from it showing `2.72 yardas cúbicas` and `Bolsas de 80 lb: 123`, the bare visit, the follow-up after a bag edit, and the canonical and alternates staying query-free [CP36, CP37, SR20, SR21, SR22]; copy success with clipboard permission and the failing `writeText` fallback [CP38, CP39]; after mount no control is `disabled`, "Copy link" is visible and the note is hidden [CP41]; with `**/_astro/*.js` aborted the note stays visible, controls stay disabled and the default result shows (a JS-enabled project) [CP49]; the Tab order and the orange focus ring [CP45]; `aria-invalid` and the accessible description equal the message [CP46]; requests: the only `script` requests are the entry (and its modulepreload targets), no `fetch` or XHR, all same origin [SS21]; the language switch round trip on `/privacy` keeps working [SR7]. Verify: runs red against the app; each failure is triaged as a test defect or an app defect.
- [x] 13b.2 [RED] Gates (extend `a11y.spec.ts`, `axe-report.ts`): axe (tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`) on both calculator pages in the default state and in footing, column, steps, error, metric, cost-rows-visible and copy-failed states, 0 violations each [SQ17, SQ1]; a seeded run where the error message loses its association (served through `page.route`) fails naming the page, state and rule, and the seeded image without `alt` still fails [SQ20, SQ2]; console capture on all 16 pages and during typing, shape switch, copy and language switch has 0 CSP violation messages and the result updates [SQ14]; an inline `<script>alert(1)</script>` injected into a calculator page response does not run and a CSP violation is reported [SQ26]; non-calculator pages load no script [SS19]; layout shift at most 0.01 on the phone profile for both locales with and without `?v=1&sh=footing&l=216&n=3` [CP44, SQ19]; `npm run lighthouse` meets the thresholds on the six URLs [SQ10, SQ11 regression].
- [x] 13b.3 [GREEN] Fix every app defect the suite finds in `client/mount.ts`, `components/calculator/**`, `styles/calculator.css` or the controller (reserved sizes, `aria` wiring, focus order), each as its own `fix(web)` commit with the failing scenario in the body; re-run S11a/S8 unit tests. Anything that needs a spec change is recorded in `apply-progress.md` and the spec amended before the code.
- [x] 13b.4 Gate: `npm ci --prefix tooling/site-browser && npm run test:e2e` all projects green; `npm run lighthouse` green; local wall time recorded (CI limit 10 minutes).
- [x] 13b.5 Negative proofs: remove `aria-describedby` from the error message (CP46, SQ20 fail); remove a reserved block size (CP44 fails with CLS above 0.01); make the entry import fail (CP49 path still shows the note); revert.
- [x] 13b.6 Exit: SX1–SX3, SX5.

### G3 group tasks

- [x] G3.1 Verify the group tip is complete before opening the PR: `git log main..HEAD --oneline` shows S11a to S13b; `ROUTES`, `templates.ts`, methodology, privacy, home and tooling all in the same PR.
- [x] G3.2 Exit: GX1–GX6 (the `site-browser` job runs `test:e2e` and `lighthouse`; wall time recorded). Done 2026-10-26: PR #89 rebase-merged (main `e8cf809`); CI run 40326958127: verify 2m42s, site-browser 5m25s (GX6 under 10 min), 8 mutation shards + gate green; JD APPROVED after one fix round (JD-B-1); live: both calculator pages 200 with one `/_astro/` module script, static pages with no script and no `/cdn-cgi/`, sitemap lists both URLs, `?v=1&l=240` shows 2.72 and Enter presses a focused button.

---

## Final — Owner actions and information (tasks F.1 to F.4)

The owner delegated decisions to the pipeline. OA2 and OA3 are recorded as decided by the pipeline per spec and are listed for information only; they do not block a merge.

- [x] F.1 OA2 (information): the 17 URL keys and defaults of `calc-concrete` become permanent when G1 merges; the pipeline approved them as written in the spec (recorded in G1.1). Reverting after the merge needs a URL-contract change, not a tuple edit.
- [x] F.2 OA3 (information): the 10 % waste default is a rule of thumb the user can change, never a standard; recorded in G1.1 and in the page copy (S10).
- [x] F.3 OA4 (owner): review the EN/ES copy and flip `ownerReview: pending` to `approved` in `apps/web/src/content/calculators/{en,es}/concrete.md` and in the methodology and privacy entries; `check:site` prints the remaining `pending` count and never fails on it. Archive may proceed with entries still `pending` if the owner waives it, as for the web shell. Done 2026-10-26: the owner reviewed the 12 entries on a review page and approved all of them, keeping `banquetas`, the `× count` answer sentences and the `<1/64 in` texts; flipped in PR #91.
- [x] F.4 OA5 (owner, DR-18), before or right after the G3 deploy: keep Cloudflare Email Address Obfuscation and Rocket Loader off (`script-src 'self'` would allow their `/cdn-cgi/` scripts). Post-deploy checks, recorded with date and result in `apply-progress.md`: `curl -s https://maestrocalc.com/ | rg 'cdn-cgi'` and `curl -s https://maestrocalc.com/privacy | rg 'cdn-cgi'` return nothing; `BASE_URL=https://maestrocalc.com` with the SQ28 smoke (13a.7) is green (no `script` request on `/` and `/privacy`); one production load of `/concrete-calculator` and `/es/calculadora-de-concreto` shows the result updating; submit `/sitemap.xml` in Search Console. Done 2026-10-26: no `cdn-cgi` on `/` or `/privacy`; the Cloudflare Web Analytics beacon was still injected for real browsers after the go-live (blocked by the CSP), the owner turned the injection off and a Chromium probe of six production pages showed no beacon and no console error; both calculator pages update live (`?v=1&l=240` reads 2.72). Search Console submission is the owner's, not verified here.

---

## Traceability: spec scenario → task

Unnamed scenarios (no id in the delta spec) are listed at the end. "Regression" means an existing scenario that must stay green and is covered by the named gate task.

### core-geometry

| Scenario | Name | Tasks |
|---|---|---|
| GEO1 | Exact value | 1.2, 1.10 |
| GEO2 | Error bound against a longer literal | 1.2, 1.10 |
| GEO3 | No float or short fraction in core | 1.5, 1.10, 4.8 |
| GEO4 | Table values | 1.4 |
| GEO5 | Scaling and ratio properties | 1.4 |
| GEO6 | Negative radius | 1.4, 1.10 |
| GEO7 | Cylinder volume composes with the unit algebra | 1.4 |

### material-data-contract

| Scenario | Name | Tasks |
|---|---|---|
| MDC1 | Exports | 2.3 |
| MDC2 | Concrete mix record | 2.2, 2.7 |
| MDC3 | Record passes the contract | 2.2 |
| MDC4 | Source is cited | 2.2, 10.7, 12.1 |
| MDC5 | Yields-only module | 2.1, 2.2, 2.7, 3b.6 |
| (unnamed) | Dependency direction | 2.3, 2.6 |

### calc-concrete

| Scenario | Name | Tasks |
|---|---|---|
| CC1 | Metadata | 3a.2, 3b.3, 3b.4 |
| CC2 | Released snapshot | 3a.5, 3a.9, 4.1, 4.5, 5.1, 5.7 |
| CC3 | urlKeys are legal | 3a.2 |
| CC4 | Valid yields | 3a.3 |
| CC5 | Invalid yields | 3b.1, 3b.2, 3b.10 |
| CC6 | Yield drift guard | 3b.6, 3b.8, 3b.10 |
| CC7 | Slab default (S1) | 3a.3 |
| CC8 | Other slabs (S2, S3) | 3a.3 |
| CC9 | Footing with a piece count (F1) | 4.2, 4.8 |
| CC10 | Column uses PI exactly (C1, C2) | 4.2, 4.8 |
| CC11 | Steps stacked as full-height blocks | 5.2, 5.10 |
| CC12 | Zero dimension and maximum bounds | 3a.3, 3b.3, 5.3 |
| CC13 | Unused fields do not matter | 4.3 |
| CC14 | Default example, three bag sizes | 3b.3 |
| CC15 | Exact integers do not round up | 4.2, 4.8 |
| CC16 | Waste is applied before bags | 3a.3, 3b.3, 5.10 |
| CC17 | Other shapes and zero | 4.2, 5.2 |
| CC18 | Maximum | 5.3 |
| CC19 | Bag cost | 3b.4, 3b.10 |
| CC20 | Ready-mix cost | 3b.4 |
| CC21 | Prices default to zero | 3b.4 |
| CC22 | Rejected inputs | 4.4 |
| CC23 | Hidden fields are validated too | 4.4 |
| CC24 | Inputs accept feet-inch-fraction and metric | 4.4 |
| CC25 | Properties hold | 5.4 |
| CC26 | Language-free | 5.5 |
| CC27 | Encoding | 5.6, 5.10 |
| CC28 | Decoding links | 5.6 |
| CC29 | Round trip | 5.6 |
| CC30 | Web registry | 3a.6, 3a.7, 3b.9 |

### i18n-catalog

| Scenario | Name | Tasks |
|---|---|---|
| ICW1 | Required page keys | 13a.1 |
| ICW2 | Skip link labels | Regression (SX1 in every slice, 13a.8) |
| ICW3 | Missing Spanish site key is a compile error | Regression (SX1) |
| ICW4 | Route table and catalog agree | 13a.1 |
| ICW7 | Route page without metadata fails | 13a.1, 13a.9 |
| ICW8 | Site tagline | Regression (SX1, 13a.5) |
| ICW10 | Derived keys of concrete | 3a.6, 3b.7, 5.1 |
| ICW11 | Material and page keys | 3b.7, 7.6, 7.7 |
| ICW12 | Exact labels of concrete | 3a.6, 3b.7, 4.1, 5.1, 7.6 |
| ICW13 | Answer sentences | 7.6, 7.7 |
| ICW14 | Material without keys fails | 3b.7, 3b.10 |
| ICW15 | Undeclared extra key fails | 3b.7 |
| ICW16 | Concrete page metadata | 13a.1 |
| ICW17 | Calculator-page UI keys | 7.6, 7.7 |
| ICW18 | Concrete register | 3a.7, 7.6, 7.9 |
| (unnamed) | Convention for the proof calculator; Option keys; Missing Spanish key fails the build; Placeholder mismatch fails; Calculator without labels fails | Regression (3a.6, 3a.7, 3b.7, SX1) |

### calculator-page

| Scenario | Name | Tasks |
|---|---|---|
| CP1 | Default result in the HTML (EN) | 7.2, 7.4, 8.1, 13a.8 |
| CP2 | Default result in the HTML (ES) | 7.2, 7.4, 8.1, 13a.8 |
| CP3 | Built figures come from the engine | 7.2, 8.1 |
| CP4 | Result addressable by key | 8.1 |
| CP5 | Section order and ids | 8.1, 9.6, 10.7, 13a.3 |
| CP6 | Frontmatter is validated | 10.1, 10.2, 10.10 |
| CP7 | Counterpart and duplicates | 10.7 |
| CP8 | Sources and review date | 8.2, 10.7, 13a.3 |
| CP9 | Worked example cannot drift | 10.7, 10.10 |
| CP10 | Length and parity | 10.7, 10.10 |
| CP11 | Visible fields per shape | 8.1, 11a.2, 13b.1 |
| CP12 | Labels and keyboards | 8.1, 13b.1 |
| CP13 | Touch targets on a phone | 8.4, 13b.1 |
| CP14 | Same block size for all shapes | 11a.2, 13b.1 |
| CP15 | Order and units | 7.2, 8.1 |
| CP16 | Costs appear with a price | 7.2, 11a.3, 13b.1 |
| CP17 | Estimate note and terms link | 8.1, 13a.3 |
| CP18 | Ready-mix is not rounded | 7.2, 11a.3, 13b.1 |
| CP19 | Typing updates the result | 11a.3, 13b.1 |
| CP20 | Shape switching | 11a.3, 13b.1 |
| CP21 | Bag size | 11a.3, 13b.1 |
| CP22 | Waste field and steppers | 11a.3, 13b.1 |
| CP23 | Enter does not navigate | 11b.3, 13b.1 |
| CP24 | Client equals engine | 7.2, 13b.1 |
| CP25 | Restore from a shared link | 11a.3, 13b.1 |
| CP26 | Writing the query | 11a.3, 13b.1 |
| CP27 | Back to defaults | 11a.3, 13b.1 |
| CP28 | Reload keeps the state | 11a.3, 13b.1 |
| CP29 | Bad and noisy links | 11a.3, 13b.1 |
| CP30 | Malformed length | 11a.3, 13b.1 |
| CP31 | Bounds with formatted limits | 7.4, 11a.3, 13b.1 |
| CP32 | Comma and unit errors | 11a.3, 13b.1 |
| CP33 | Toggle keeps the state | 7.3, 7.4, 11a.3, 13b.1 |
| CP34 | Metric entry | 7.3, 11a.3, 13b.1 |
| CP35 | Explicit units win | 11a.3, 13b.1 |
| CP36 | Switch href | 11a.3, 13b.1 |
| CP37 | Bare visit | 11a.3, 13b.1 |
| CP38 | Copy succeeds | 11a.3, 11b.3, 13b.1 |
| CP39 | Copy fails | 11a.3, 11b.3, 13b.1 |
| CP40 | No-JS reader | 8.1, 13a.7 |
| CP41 | Script enables the controls | 8.1, 11b.3, 13b.1 |
| CP42 | One entry per calculator, shared by both locales | 9.4, 11b.1, 13a.8 |
| CP43 | Message templates are inert HTML | 8.1, 8.7 |
| CP44 | Load shift | 8.1, 13b.2 |
| CP45 | Keyboard path | 13b.1 |
| CP46 | Error association | 11a.3, 13b.1 |
| CP47 | No foreign origin in the entry graph | 9.4, 11b.1, 13a.8, 13a.9 |
| CP48 | Entry does not import the registry | 11b.1, 11b.6 |
| CP49 | Module fails to load | 13b.1, 13b.5 |
| CP50 | Metric entry back to US is exact | 7.3, 11a.3, 13b.1 |

### site-quality

| Scenario | Name | Tasks |
|---|---|---|
| SQ1 | Zero violations | 13b.2 (16 pages, derived from `ROUTES`) |
| SQ2 | Seeded violation fails | 13b.2 |
| SQ3 | EN and ES smoke | 13a.7 |
| SQ4 | Unknown paths in both locales | 13a.7 (regression) |
| SQ5 | No third-party requests | 13a.7 |
| SQ6 | Budgets pass on the build | 9.3, 13a.8 |
| SQ7 | HTML over budget fails | 9.3 |
| SQ8 | Any JS byte on a static page fails | 9.3 |
| SQ9 | Thresholds configured | 13a.6 |
| SQ10 | Blocking category regression | 13a.6, 13b.2 (regression) |
| SQ11 | Performance is advisory | 13a.6, 13b.2 (regression) |
| SQ12 | Header content | 9.8 |
| SQ13 | Immutable assets only | 9.8 |
| SQ14 | CSP does not break pages | 13b.2 |
| SQ17 | axe on interactive states | 13b.2 |
| SQ18 | No-JS project | 13a.7 |
| SQ19 | Layout stability with a state in the URL | 13b.2 |
| SQ20 | Seeded violation on an interactive state | 13b.2, 13b.5 |
| SQ21 | Mutation measurement recorded | 5.9 |
| SQ22 | Calculator JS budget edge | 9.3 |
| SQ23 | Imports are counted | 9.3, 9.11 |
| SQ24 | Calculator weight ceiling | 9.3 |
| SQ25 | One URL per template | 13a.6 |
| SQ26 | CSP blocks inline script | 9.8, 13b.2 |
| SQ27 | Engine size probe | 6.3, 6.4, 6.5 |
| SQ28 | Static pages request no script, including platform injections | 9.4, 13a.7, F.4 |

### site-shell

| Scenario | Name | Tasks |
|---|---|---|
| SS1 | Landmarks on every page | 13a.3, 13a.8 |
| SS2 | Viewport and charset | Regression (13a.8) |
| SS18 | No scripts on non-calculator pages | 9.3 |
| SS19 | No JS requests in the browser outside calculator pages | 13a.7, 13b.2 |
| SS20 | Calculator page script shape | 9.3, 13a.3, 13a.8 |
| SS21 | Calculator pages in the browser | 13b.1 |
| SS22 | Script violations fail the gate | 9.3, 9.11, 13a.9 |
| SS23 | Bundle forbids storage, network and message text | 9.4, 11b.1, 13a.8 |

### site-seo

| Scenario | Name | Tasks |
|---|---|---|
| SE1 | Lengths and uniqueness | 13a.1, 13a.8 |
| SE2 | Catalog is the source | 13a.3, 13a.8 |
| SE3 | Missing description fails the gate | 13a.8 (regression) |
| SE6 | Home JSON-LD | 13a.8 (regression) |
| SE7 | No logo | 13a.8 (regression) |
| SE8 | Malformed JSON-LD fails the gate | 9.5, 13a.8 |
| SE10 | Sitemap entries | 13a.8 |
| SE11 | Sitemap agrees with pages | 13a.8 |
| SE12 | Sitemap is the only index | 13a.8 |
| SE14 | Green build | 9.7, 13a.8 |
| SE15 | Missing canonical fails | 13a.8 (regression) |
| SE16 | Titles and descriptions | 13a.1, 13a.3 |
| SE17 | hreflang and canonical | 13a.3 |
| SE18 | H1 and heading order | 9.5, 13a.3 |
| SE19 | Calculator JSON-LD | 9.5, 10.5, 13a.3 |
| SE20 | FAQ parity | 9.5, 10.5, 13a.3 |
| SE21 | Forbidden types fail the gate | 9.5 |
| SE22 | Missing type fails the gate | 9.5 |
| SE23 | Other pages stay free of calculator types | 9.5, 13a.8 |

### site-routing-i18n

| Scenario | Name | Tasks |
|---|---|---|
| SR1 | Exact page set | 13a.8 |
| SR2 | Table drives links | 9.6, 13a.8 |
| SR3 | Canonical path is served directly | 13a.7 |
| SR5 | Switch maps to the equivalent page | 13a.8 |
| SR6 | Switch on 404 pages | Regression (13a.8) |
| SR7 | Switch round trip in the browser | 13b.1 |
| SR16 | Calculator path with a query | 13a.7 |
| SR17 | List agrees with the table | 9.1, 9.2, 9.11, 13a.1 |
| SR18 | Template per id | 9.1, 13a.3 |
| SR19 | Pinned end state | 13a.1 |
| SR20 | Switch keeps the calculator state | 11a.3, 13b.1 |
| SR21 | Switch follows edits | 11a.3, 13b.1 |
| SR22 | Canonical and alternates stay clean | 13b.1 |

### trust-pages

| Scenario | Name | Tasks |
|---|---|---|
| TP7 | Home links | 13a.5 |
| TP8 | No empty promises | 13a.5 |
| TP9 | Methodology content | 12.1 |
| TP12 | Facts match the build | 9.4, 12.3 |
| TP13 | No future-state claims | 12.3 |
| TP14 | Required statements | 12.3 |
| TP21 | Home links the calculator | 13a.5 |
| TP22 | Concrete section and anchor | 12.1 |
| TP23 | Formulas, yields and pi disclosure | 12.1 |
| TP24 | Published test cases match the engine | 12.1, 12.6 |
| TP25 | Methodology claims nothing unpublished | 12.1 |
| TP26 | No "not published yet" wording once live | 12.1, 12.6, 13a.1 |
| TP27 | Calculator statements pinned | 12.3, 12.6 |

Coverage: every scenario carrying an id in the ten delta specs is mapped to at least one task. The unnamed scenarios of `i18n-catalog` and `material-data-contract` are mapped under the tables above.
