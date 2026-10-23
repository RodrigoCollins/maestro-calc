# Tasks: Foundation — Monorepo and Exact Core Engine

Change: `foundation-monorepo-core-engine` · Inputs: `proposal.md`, `design.md` (revised, "Design review resolution" applied), 11 delta specs, `openspec/config.yaml` · Mode: strict TDD (`npm test`), artifact store `openspec`.

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~4,100 total (additions + deletions, lockfile and pure renames excluded); 12 slices of 220-390 each |
| 400-line budget risk | High overall (single PR impossible); each slice is sized to fit, 7 slices are within 30 lines of the cap |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → ... → PR 12 (strictly ordered, each merged to `main` before the next is opened for merge) |
| Delivery strategy | auto-chain |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

Forecast delta versus `design.md` (~3,880): +~220 lines from pieces the design implied but did not size: gate contract tests (PR2), workspace contract test (PR5), `messageKeysOf` (PR10), and the 12 EN/ES error messages (PR12). Slices near the cap carry an explicit split contingency (see "Slice-overflow rule").

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Monorepo skeleton + Astro SSR source-TS spike | PR 1 `feat/foundation-01-skeleton` | `npm run check && npm run build` | `npm ci`, `npm query .workspace`, `astro build` | Revert restores single-app scaffold (`src/lib` recoverable from history) |
| 2 | Blocking gates: lint, format, typecheck, vitest projects, coverage thresholds, CI `verify` job | PR 2 `feat/foundation-02-gates` | `npm test -- apps/web/src/contract packages/i18n` | `npm run verify`; negative-proof logs | Config-only revert; no product code |
| 3 | `Result`/`CoreError`, exact `Rational`, parseDecimal, Stryker spike + CI `mutation` job | PR 3 `feat/foundation-03-rational` | `npm test -- packages/core/src/rational` | `npm run mutation` | `core/src/{result,errors}.ts`, `rational/`, stryker config, mutation job |
| 4 | Dimensions, length/area/volume units, quantities, ops | PR 4 `feat/foundation-04-units-core` | `npm test -- packages/core/src/units` | `npm run typecheck` (type tests) | `core/src/units/` |
| 5 | Mass + density units, derived dimensions, workspace contract test | PR 5 `feat/foundation-05-mass-density` | `npm test -- packages/core/src/units apps/web/src/contract/workspace` | `npm run typecheck` | catalog rows + tests |
| 6 | Rounding, decimal parts, purchase ceiling, feet-inch formatting | PR 6 `feat/foundation-06-rounding-format` | `npm test -- packages/core/src/format` | N/A (pure functions; properties cover) | `core/src/format/*` except `length-parser` |
| 7 | `parseLength` scanner/parser + format/parse round trip | PR 7 `feat/foundation-07-length-parser` | `npm test -- packages/core/src/format/length-parser` | N/A (pure functions) | `core/src/format/length-parser/` |
| 8 | Money, unit prices, `parseMoney` | PR 8 `feat/foundation-08-money` | `npm test -- packages/core/src/money` | N/A | `core/src/money/` (+ one guard line in `units/ops.ts`) |
| 9 | Calculator contract: descriptors, constraints, `defineCalculator`, `validate` | PR 9 `feat/foundation-09-contract-validate` | `npm test -- packages/core/src/calculator` | `npm run typecheck` | `core/src/calculator/`, `error-codes.ts` |
| 10 | `run`, `messageKeysOf`, `@maestro-calc/data` material contract | PR 10 `feat/foundation-10-contract-run-data` | `npm test -- packages/core/src/calculator packages/data` | N/A | `calculator/run.ts`, `message-keys.ts`, `packages/data/src` |
| 11 | URL state codec + released-key contract harness | PR 11 `feat/foundation-11-url-codec` | `npm test -- packages/core/src/url` | N/A | `core/src/url/`, `ALL_ERROR_CODES` |
| 12 | Proof: `rectangle-area`, i18n translator + catalogs, web registry/contract/smoke | PR 12 `feat/foundation-12-proof-calculator` | `npm test` | `npm run verify` (full chain incl. `astro build`) | `calculators/rectangle-area`, i18n `translate.ts`/`catalogs`, web `lib/` |

## Conventions (apply to every slice)

**Branches and stacking.** Branch `feat/foundation-NN-<slug>` from `main` once PR NN-1 is merged (stacked-to-main: every PR targets `main`; while the predecessor is unmerged, branch from its tip and retarget/rebase onto `main` after it merges, never leaving child diffs that include parent changes). Slugs: `01-skeleton`, `02-gates`, `03-rational`, `04-units-core`, `05-mass-density`, `06-rounding-format`, `07-length-parser`, `08-money`, `09-contract-validate`, `10-contract-run-data`, `11-url-codec`, `12-proof-calculator`.

**Commits (work-unit-commits).** One commit per work unit: tests and the code they prove ship together; docs/config that explain a unit travel with it. Conventional Commits only (`feat(core): ...`, `test(core): ...` only when a commit is tests-only, `build:`, `ci:`, `chore:`, `docs:`, `refactor:`), no `Co-Authored-By`, no AI attribution. Each commit leaves the tree green except the pure-rename commit in PR 1 (renames only, exempt). Scopes: `repo`, `web`, `core`, `data`, `i18n`, `ci`.

**Strict TDD loop inside every slice.** Order is always RED (write the failing test with hand-verified values copied from the cited spec scenario; run it and see it fail for the right reason) → GREEN (smallest code to pass) → REFACTOR (tests stay green; no behavior change). Tasks are labeled `[RED]`, `[GREEN]`, `[REFACTOR]`. Test names cite the scenario (`// spec: exact-rational › Reduction (6/8)`). Property tests use `numRuns` from `__testing__/property-runs.ts` (1000; 50 under `STRYKER`). When a test is written for code that is already green (characterization of a spike or pure config), the task says so and requires a break-the-code spot check (temporarily mutate the implementation, see the test fail, restore).

**Verification commands.** `npm test -- <path>` = `vitest run <path>` (available from PR 2; PR 1 uses npm commands). `npm run typecheck` includes `.test-d.ts` files. Full local gate order (CI order, cheapest first): `npm run format:check && npm run sync && npm run lint && npm run typecheck && npm run test:coverage && npm run build`. Mutation (from PR 3, any PR touching `packages/core`): `npm run mutation`.

**Slice-overflow rule.** Forecasts are estimates. Measure with `git diff --shortstat main...HEAD -- . ':(exclude)package-lock.json'` (additions + deletions). If a slice exceeds 400, split it at its last RED/GREEN boundary into `NNa`/`NNb` stacked PRs (`feat/foundation-NNa-...`), update `state.yaml`, and do not request an exception.

### Standard Exit Criteria (SX): every PR, in order, before merge

- [ ] SX1 Local gates green: lint, format:check, typecheck, test:coverage (thresholds: core 100, data/i18n 90 once those packages carry code), build. From PR 1 to PR 2 only the gates that exist apply (PR 1: `check` + `build`).
- [ ] SX2 Mutation gate (PR 3 onward when `packages/core` changed): `npm run mutation` score ≥ 90 (`break`); CI `mutation` job green.
- [ ] SX3 Size: `git diff --shortstat main...HEAD -- . ':(exclude)package-lock.json'` ≤ 400 changed lines; actual vs forecast recorded in the PR body.
- [ ] SX4 History hygiene: `git log main..HEAD --format=%B | rg -i 'co-authored|claude|anthropic|generated with'` returns nothing; every subject is a conventional commit.
- [ ] SX5 Four specialized reviewers on the frozen candidate (after final normalization `npm run format`): (1) spec conformance and correctness against the cited scenarios, (2) types, API design and package boundaries, (3) test quality (hand-verified values, TDD order evidence, surviving mutants), (4) maintainability, security (input bounds) and performance. Only candidate-caused blocking findings gate; others become follow-ups.
- [ ] SX6 Judgment Day (two judges) on the reviewed candidate; at most one scoped correction transaction, then re-run SX1/SX2 on the corrected tree.
- [ ] SX7 PR opened against `main` with: scope, spec scenarios covered (IDs from the traceability table), forecast vs actual, spike/negative-proof evidence where the slice has any, and rollback note; CI green; merged before the next slice is merged.

---

## PR 1 — Skeleton (`feat/foundation-01-skeleton`)

Forecast: ~220 changed lines (excl. lockfile and renames). Specs: monorepo-workspace. Green because: `npm run check` and `npm run build` pass; no test runner exists yet, so verification is by command (bootstrap exception to RED-first, recorded in the PR body).

Overflow applied: legacy `src/lib` deletion (361 lines) split into stacked PR `01a` (`feat/foundation-01a-remove-legacy`); remaining skeleton is PR `01b` (`feat/foundation-01b-skeleton`, ~160 lines). Task 1.13 (SX3-SX7) pending for both.

Planned commits: `refactor(web): move astro scaffold into apps/web` (renames only) · `chore(repo): remove legacy src/lib prototype` · `build(repo): add npm workspaces, shared tsconfig base and package skeletons` · `docs(repo): document monorepo dev entry points in AGENTS.md`.

- [x] 1.1 Create the branch from `main`; record baseline with `git status` and `npm ls --depth=0` (expected: single-app layout, `npm run check` failing or absent).
- [x] 1.2 [RED] Capture the failing baseline checks to paste into the PR body: `npm query .workspace` returns `[]` (target: 4 packages) [MW2]; `npm run check` fails or `typescript` is not installed [MW15]; `git ls-files src/lib` lists 4 files [MW4]. Verify: commands run and outputs saved.
- [x] 1.3 [GREEN] Pure-rename commit: `mkdir -p apps/web/src && git mv astro.config.mjs apps/web/ && git mv src/pages apps/web/src/pages && git mv src/site.config.ts apps/web/src/site.config.ts && git mv public apps/web/public && git mv tsconfig.json apps/web/tsconfig.json`. No content edits in this commit. Verify: `git diff -M --name-status HEAD~1 HEAD` shows only `R` entries [MW3].
- [x] 1.4 [GREEN] `git rm -r src/lib` (engine, units, format, types and their tests). Files: `src/lib/*`. Verify: `rg -n "src/lib/(engine|units|format|types)" --glob '!openspec/**' --glob '!node_modules/**' --glob '!.git/**'` has no match [MW4].
- [x] 1.5 [GREEN] Root `package.json`: `private`, `type: module`, `workspaces: ["packages/*","apps/*"]`, `engines.node: ">=22.23.4"`, devDependencies `typescript ~6.0`, `@astrojs/check`, `vitest 5.0.5` (exact), scripts `dev`, `build` (delegate to `@maestro-calc/web`), `typecheck` (`npm run typecheck --workspaces --if-present`), `check` (= `npm run typecheck`), `test` (`vitest run --passWithNoTests`). Move app-only deps (`astro`) to `apps/web/package.json`. Add `.nvmrc` containing `24` and `.gitignore` (`node_modules`, `dist`, `.astro`, `coverage`, `reports`, `.stryker-tmp`) [MW16 groundwork]. Files: `package.json`, `.nvmrc`, `.gitignore`. Verify: `node -e "console.log(require('./package.json').workspaces)"`.
- [x] 1.6 [GREEN] `tsconfig.base.json` exactly per design (target ES2022, lib ES2023, Bundler resolution, strict family, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `noFallthroughCasesInSwitch`, `verbatimModuleSyntax`, `isolatedModules`, `erasableSyntaxOnly`, `allowImportingTsExtensions`, `rewriteRelativeImportExtensions`, `noEmit`, `types: []`, no `baseUrl`). The root tool `tsconfig.json` is deferred to PR 2 (no root config files exist yet; TS rejects an empty file list). Files: `tsconfig.base.json`. Verify: `npx tsc -p tsconfig.base.json --showConfig` exits 0.
- [x] 1.7 [GREEN] Package skeletons `packages/{core,data,i18n}`: `package.json` (`name @maestro-calc/*`, `private`, `type module`, `sideEffects false`, `exports` per design, allowed workspace deps only: `data` → `@maestro-calc/core: "*"`; `core` has no `dependencies`), `tsconfig.json` (extends base, `include: ["src"]`, scripts `typecheck: tsc --noEmit`), `src/index.ts` (`export {}` for core/data), `packages/i18n/src/locales.ts` exporting `locales = ['en','es'] as const`, `defaultLocale = 'en'`, `type Locale`, re-exported from `src/index.ts`. Files: 3 × (`package.json`, `tsconfig.json`, `src/index.ts`) + `locales.ts`. Verify: `npm run typecheck -w @maestro-calc/core -w @maestro-calc/data -w @maestro-calc/i18n`.
- [x] 1.8 [GREEN] `apps/web/package.json` (`@maestro-calc/web`, deps `astro`, `@maestro-calc/{core,data,i18n}: "*"`, scripts `dev`, `build` = `astro build`, `typecheck` = `astro check`) and `apps/web/tsconfig.json` (`extends: ["astro/tsconfigs/strict","../../tsconfig.base.json"]`, re-add `lib: ["ES2023","DOM","DOM.Iterable"]`, `types` for Astro). `apps/web/src/pages/index.astro` imports the runtime constant `locales` from `@maestro-calc/i18n` and renders it (spike probe). Files: `apps/web/{package.json,tsconfig.json,src/pages/index.astro}`. Verify: `npm install` then `npm run check`.
- [x] 1.9 [GREEN] SPIKE (Astro SSR consuming workspace TS source): run `npm install` (creates the root `package-lock.json`), then `npm run build`. Pass condition: `astro build` exits 0, `apps/web/dist` exists, no `packages/*/dist` exists [MW11]. Record the outcome in the PR body ("SSR resolved `@maestro-calc/i18n` source TS: yes/no, fallback used: none/noExternal"). Verify: `npm run build && fd -t d dist packages`.
- [x] 1.10 (not needed: 1.9 passed without fallback) [GREEN] SPIKE FALLBACK (only if 1.9 fails to resolve or externalizes symlinked TS): add `vite: { ssr: { noExternal: [/^@maestro-calc\//] } }` to `apps/web/astro.config.mjs`; re-run 1.9. If it still fails, STOP the chain and report `blocked` with the build log (design assumption D2 invalid). Verify: same as 1.9.
- [x] 1.11 [GREEN] Update `AGENTS.md`: dev server started from the web workspace (`cd apps/web && astro dev --background`; `astro dev stop|status|logs`), root script table pointer, packages layout one-liner. Files: `AGENTS.md`. Verify: manual read-through; `rg -n "apps/web" AGENTS.md`.
- [x] 1.12 [REFACTOR] Prove the clean-install story: `rm -rf node_modules && npm ci`; `npm ls --workspaces` (no missing/invalid/extraneous) [MW1]; `npm query .workspace` returns exactly the 4 names [MW2]; `for w in core data i18n; do npx tsc -p packages/$w --showConfig; done` and `cd apps/web && npx tsc --showConfig` show `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`, `noImplicitOverride` all `true` [MW13]; `npm ls typescript` shows one 6.0.x [MW14]; `npm run check` exits 0 [MW15]; `git status --porcelain` shows no build output untracked [MW16].
- [ ] 1.13 Exit: SX1 (check + build), SX3, SX4, SX5, SX6, SX7. PR body includes the 1.2 baseline, the 1.9/1.10 spike result, and the rename proof from 1.3.

---

## PR 2 — Gates (`feat/foundation-02-gates`)

Forecast: ~370 changed lines. Specs: quality-gates, monorepo-workspace (lint/purity requirements), i18n-catalog (locale list). Green because: CI `verify` is green; only `packages/i18n` has code and it is covered.

Planned commits: `build(repo): add vitest projects with coverage thresholds` · `build(repo): add eslint flat config with core purity and boundary rules` · `build(repo): add prettier with astro plugin` · `ci: add verify workflow and dependabot config` · `docs(repo): update openspec config with real gate commands`. Contingency: if >400, move `.github/dependabot.yml` and its assertion to PR 3.

Overflow applied: measured 734 changed lines (excl. lockfile) against ~370 forecast, so PR 2 is split into three stacked PRs (each branched from the previous tip): `02a` (`feat/foundation-02a-vitest-prettier`, 395 after review correction round 1: tasks 2.2-2.4, prettier part of 2.7, split tsconfig programs, manifest/tsconfig/coverage contract tests, 2.10b), `02b` (`feat/foundation-02b-eslint-gates`, 400: 2.5-2.6, lint script, root tool tsconfig), `02c` (`feat/foundation-02c-ci-docs`, 368: 2.8-2.9, 2.10, 2.11, 2.13). Task 2.12 (SX3-SX7) pending for each.

- [x] 2.1 Create branch from `main` (PR 1 merged).
- [x] 2.2 [GREEN] Install pinned devDependencies at the root: `eslint ^10.13`, `typescript-eslint ^8.72`, `eslint-plugin-astro`, `eslint-plugin-import-x`, `eslint-config-prettier`, `prettier 3.9.10` (exact), `prettier-plugin-astro`, `@vitest/coverage-v8 5.0.5` (exact, matches vitest), `@types/node` and `yaml` (used only by `apps/web` contract tests). Files: `package.json`, lockfile. Verify: `npm ls eslint prettier vitest @vitest/coverage-v8`.
- [x] 2.3 [RED] `packages/i18n/src/locales.test.ts` asserting `locales` equals `['en','es']`, `defaultLocale` is `'en'` and is a member of `locales` [IN1]. Write it before the vitest wiring so `npm test -- packages/i18n` fails (no projects). Verify: fails with no test project/config.
- [x] 2.4 [GREEN] Vitest wiring: root `vitest.config.ts` (`test.projects: ['packages/*','apps/web']`, v8 coverage over `packages/*/src/**`, excluding `**/*.test.ts`, `**/*.test-d.ts`, `**/__testing__/**`, `**/*.d.ts`, per-glob thresholds core 100/100/100/100, data and i18n 90); per-project `vitest.config.ts` via `defineProject({ test: { name, environment: 'node', include: ['src/**/*.test.ts'], typecheck: { enabled: true, include: ['src/**/*.test-d.ts'] } } })` for core, data, i18n, web. Root scripts: `test` (`vitest run`), `test:coverage` (`vitest run --coverage`). Files: `vitest.config.ts`, 4 × `vitest.config.ts`, `package.json`. Verify: `npm test -- packages/i18n` passes IN1; `npm run test:coverage` exits 0 with i18n ≥ 90.
- [x] 2.5 [RED] `apps/web/src/contract/gates.contract.test.ts` (Node API, `ESLint.lintText` with virtual file paths inside real package dirs; `prettier.check`): expectations that FAIL until 2.6: in `packages/core/src/x.ts`: `const a: any = 1` → `@typescript-eslint/no-explicit-any` [QG2]; `document.title` → `no-restricted-globals` and `window`, `fetch`, `process`, `Date`, `performance` likewise [MW9]; `Math.random()` and `Date.now()` → `no-restricted-properties`, `new Date()` → `no-restricted-globals` [MW10]; `x.toFixed(2)` and `parseFloat('1')` → restricted syntax/globals; `/* v8 ignore next */`, `/* c8 ignore next */`, `/* istanbul ignore next */` → `no-warning-comments` [QG9]; `export default 1` in a package → `import-x/no-default-export`; `import {x} from '@maestro-calc/i18n'` in core → `no-restricted-imports` naming the import [MW5]; `import {x} from '@maestro-calc/core/src/rational'` in `apps/web/src/lib/x.ts` → deep-import rejection [MW7]; i18n importing `@maestro-calc/core` rejected; a clean file passes with 0 errors and 0 warnings [QG3]; any rule at warning level makes `warningCount > 0` and `package.json` script `lint` equals `eslint . --max-warnings=0` [QG1]; `prettier.check` of an unformatted TS snippet is `false` and of the formatted one `true` [QG4]. Fallback if type-aware `lintText` on virtual paths is not workable: write disk fixtures under `apps/web/src/contract/fixtures/` mapped by an ESLint `files` override to the package rules, and excluded from the main lint run. Verify: `npm test -- apps/web/src/contract/gates` fails on every missing rule.
- [x] 2.6 [GREEN] `eslint.config.js`: `strictTypeChecked` + `stylisticTypeChecked` with `projectService`, `eslint-plugin-astro` for `.astro`, `import-x` rules (`no-extraneous-dependencies` per-package `packageDir`, `no-relative-packages`, `no-cycle`, `no-default-export`), `no-restricted-imports` / `no-restricted-globals` / `no-restricted-properties` / `no-restricted-syntax (.toFixed)` per the design's layer table, `no-warning-comments` (terms `v8 ignore`, `c8 ignore`, `istanbul ignore`, `location: 'anywhere'`) scoped to `packages/core/**`, `eslint-config-prettier` last, `reportUnusedDisableDirectives`. Files: `eslint.config.js`. Verify: 2.5 test passes.
- [x] 2.7 [GREEN] `prettier.config.js` (plugin astro, repo style), `.prettierignore` (lockfile, build outputs, `openspec/` if not governed, coverage, reports). Root scripts `lint`, `format`, `format:check`. Root tool `tsconfig.json` (extends base, `include` the root `*.config.{js,ts}` files, `allowJs`/`checkJs` as needed) and extend `typecheck` with `tsc -p tsconfig.json`. Files: `prettier.config.js`, `.prettierignore`, `tsconfig.json`, `package.json`. Verify: `npm run format && npm run lint && git diff --exit-code -- . ':!package-lock.json'` is clean after the format commit [QG5]; `npm run lint` exits 0 on the final tree [QG3].
- [x] 2.8 [RED] `apps/web/src/contract/ci.contract.test.ts` (parse YAML with `yaml`): `.github/workflows/ci.yml` triggers `pull_request` and `push` to `main`; top-level `permissions` equals `{ contents: read }` and no job overrides [QG16]; `concurrency.cancel-in-progress` cancels pull request runs only; `verify` job uses `actions/setup-node` with `node-version-file: .nvmrc` and `cache: npm`; steps appear in order `npm ci`, `npm run format:check`, `npm run sync`, `npm run lint`, `npm run typecheck`, `npm run test:coverage`, `npm run build`, none with `continue-on-error` [QG14]; `timeout-minutes` set; third-party `uses:` pinned to 40-char SHAs; `.github/dependabot.yml` has an `ignore` entry for `typescript` with `update-types: ["version-update:semver-major"]` [QG17]. Verify: fails (files missing).
- [x] 2.9 [GREEN] `.github/workflows/ci.yml` (`verify` job only; mutation job arrives in PR 3) and `.github/dependabot.yml` (npm + github-actions ecosystems, typescript major ignore). Root script `verify` running the gates in CI order. Files: `.github/workflows/ci.yml`, `.github/dependabot.yml`, `package.json`. Verify: 2.8 passes; `npm run verify` exits 0.
- [x] 2.10 (a-e done locally; (f) draft-PR CI-red proof deferred to PR opening: no push in apply) [REFACTOR] Negative proofs (temporary files, never committed; paste logs in the PR body): (a) `packages/core/src/tmp.ts` adding a length-like object to an area-like object with no `@ts-expect-error` → `npm run typecheck` non-zero [QG6]; (b) a `@ts-expect-error` above a valid line → non-zero [QG7]; (c) `const w = document.title` in core → `tsc` error "Cannot find name 'document'" [MW8]; (d) an exported function with an untested branch in `packages/core/src` → `npm run test:coverage` non-zero with a branch-threshold message [QG8]; (e) uncovered code in `packages/i18n/src` dropping it below 90 → non-zero [QG10]; (f) a deliberately lint-failing commit on a throwaway draft PR turns CI red and later steps do not run [QG14]. Remove all temporaries afterwards. Verify: `git status --porcelain` clean.
- [x] 2.10b [REFACTOR] Remove `--passWithNoTests` from the root `test` script once the first test files exist, so a broken test glob fails CI (PR 1 review finding). Files: `package.json`. Verify: `npm test`.
- [x] 2.11 [REFACTOR] Update `openspec/config.yaml`: `testing.coverage` (available, `npm run test:coverage`), `testing.quality` (eslint `npm run lint`, prettier `npm run format:check`, type checker `npm run typecheck`), `verify.mutation_command: "npm run mutation"` marked as arriving in PR 3. Files: `openspec/config.yaml`. Verify: `npm run format:check`.
- [ ] 2.12 Exit: SX1 (all five gates), SX3 to SX7. PR body lists the 2.10 negative-proof logs.
- [x] 2.13 [REFACTOR] Review correction round 1 (4-lens findings): M1 solution-style tsconfigs (`tsconfig.src.json` purity gate + `tsconfig.test.json`, web `tsconfig.app.json`) with a type-check probe; M2 triple-slash and global-object purity bypass rules with probes; plus MINORs R-02/03/05/07/08/09/10/11, risk R1-R3/R5/R6, resilience R1-R6 and reliability R2-R4/R6; 02a history rewritten for commit hygiene (R-06). Verify: `npm run verify` on each branch tip.
- [ ] 2.14 [FOLLOW-UP reliability R7] Enable `checkJs` in the root `tsconfig.json`. It needs JSDoc types on `eslint.config.js` (`Linter.RulesRecord` for the rule objects and `importsFor`, tuple type for the restricted-globals groups, `Linter.Config[]` for `dependencyBlocks`); deferred because 02b is at the 400-line cap. Until then JS configs are linted but not type-checked (noted in `openspec/config.yaml`).
- [x] 2.15 [REFACTOR] Review correction round 2 (final bounded round, slice `feat/foundation-02d-lint-hardening`): ids 1 `no-unsafe-type-assertion` in package sources; 2 coverage threshold values and directory-only package list; 3 uncached `lint` plus `lint:fast`; 4 workspace list derived once in `tooling/workspaces.js` and all script extensions in dependency blocks; 5 config-file exemption limited to workspace roots; 6 float formatters including computed string access; 7 ambient redeclaration ban; 8 extra host globals and `__testing__` import ban; suggestions B8 (spec note and negative proof), B9 (root tsconfig header). Verify: `npm run verify`.
- [ ] 2.16 [FOLLOW-UP A-7] Tag the remaining untagged contract tests with spec ids and extend the `testGlobs` consistency check to the `tsconfig.test.json` include lists (deferred from round 2: suggestions budget).

---

## PR 3 — Rational (`feat/foundation-03-rational`)

Forecast: ~380 changed lines. Specs: exact-rational, quality-gates (mutation). Spike: Stryker 10 + vitest 5. Green because: 100% core coverage, mutation ≥ 90, CI `mutation` job green.

Planned commits: `feat(core): add Result and CoreError` · `feat(core): add exact Rational with normalization and field arithmetic` · `feat(core): add parseDecimal and canonical string codec` · `feat(core): add lossy toNumber and serialization guards` · `test(core): add Rational algebraic property tests` · `ci: add stryker mutation gate and incremental job`. Contingency: split `03a` (tasks 3.1-3.12) / `03b` (3.13-3.17).

Overflow applied (stacked branches, each ≤ 400): `03a` `feat/foundation-03a-followups-result-support` (3.0-3.4), `03b` `feat/foundation-03b-rational-core` (3.5-3.7), `03c` `feat/foundation-03c-decimal-codec-lossy` (3.8-3.10), `03d` `feat/foundation-03d-properties-barrels` (3.11-3.12), `03e` `feat/foundation-03e-mutation-gate` (3.13-3.17), `03f` `feat/foundation-03f-mutation-hardening` (3.18, review correction round 1). Task 3.17 (SX3-SX7) pending for each.

- [x] 3.0 [RED→GREEN] PR 2 Judgment Day follow-ups (both judges, WARNING/SUGGESTION): (F1) extend `ambientSyntax` with `ClassDeclaration[declare=true]`, `TSEnumDeclaration[declare=true]`, `TSModuleDeclaration[declare=true]` + probes (`declare class URL {}`); (F2) replace `packages/{a,b}` brace glob with one glob per package so a single/zero-package repo cannot silently match nothing + contract test; (F3) keep corePurity on `.d.ts` and exempt only ambient rules; (F4) separate relative config-glob list for dependency test blocks; assert `errorCount === 0` in the `.d.ts` allow test. Files: `eslint.config.js`, `apps/web/src/contract/gates.contract.test.ts`. Verify: `npm run lint && npm test`.
- [x] 3.1 Create branch from `main`.
- [x] 3.2 [GREEN] Install `fast-check ^4` (verify the resolved major and record it), `@stryker-mutator/core 10.0.0`, `@stryker-mutator/vitest-runner 10.0.0` at the root. Files: `package.json`, lockfile. Verify: `npm ls fast-check @stryker-mutator/core`.
- [x] 3.3 [RED] `packages/core/src/result.test.ts` (`ok(1)` → `{ ok: true, value: 1 }`; `err('X')` → `{ ok: false, errors: ['X'] }`) and `errors.test.ts` (`new CoreError('DIVISION_BY_ZERO')` is an `Error`, `name === 'CoreError'`, exposes `code`, `reason` absent unless given and present as given) [ER-conv]. [GREEN] `core/src/result.ts`, `errors.ts`. Verify: `npm test -- packages/core/src/result packages/core/src/errors`.
- [x] 3.4 (arbitraries.ts moved to 3.11 where it is first used: it needs `Rational`) [GREEN] Test support (excluded from coverage and Stryker): `packages/core/vitest.config.ts` adds `define: { __STRYKER__: Boolean(process.env.STRYKER) }` (config runs in Node; core sources never touch `process`), `core/src/__testing__/property-runs.ts` exports `numRuns = __STRYKER__ ? 50 : 1000`, `arbitraries.ts` exports `rationalArb` (bigint numerators in ±2^80 and positive denominators, so magnitudes exceed 2^64), `nonZeroRationalArb`. Add `property-runs.test.ts` asserting `numRuns === (__STRYKER__ ? 50 : 1000)`. Verify: `npm test -- packages/core/src/__testing__` and `STRYKER=1 npm test -- packages/core/src/__testing__` both pass.
- [x] 3.5 [RED] `rational/rational.test.ts` construction block: `Rational.of(6,8)` equals `{num:3n,den:4n}` [ER2]; `of(3,-6)` is `-1/2` [ER3]; `of(0,5)` and `of(0,-7)` are deeply equal `0/1` (`toEqual`) [ER4]; `of(1,0)` throws `CoreError` code `ZERO_DENOMINATOR` [ER5]; numbers `1.5`, `NaN`, `Infinity`, `9007199254740992` throw `NOT_AN_INTEGER`, while `9007199254740991` and `-4` succeed as `9007199254740991/1`, `-4/1` [ER6]; bigint args accepted; instances frozen (assignment throws in strict mode); `ZERO`, `ONE` constants. [GREEN] `rational/rational.ts` (private constructor, `gcd`, `of`). Verify: `npm test -- packages/core/src/rational/rational.test`.
- [x] 3.6 [RED] Arithmetic block: `1/10 + 2/10 = 3/10` [ER7]; `1/2 + 1/3 = 5/6` [ER8]; `2/3 × 3/4 = 1/2` [ER9]; `(1/2) ÷ (3/4) = 2/3` [ER10]; `(1/3) × 3 = 1` [ER11]; `x.div(ZERO)` and `ZERO.inv()` throw `DIVISION_BY_ZERO` [ER12]; `(10^30/3) × 3 = 10^30`, `(2^100+1) − 2^100 = 1` [ER13]; ordering `-1/2 < -1/3 < 0 < 1/3` (ascending pairs `compare = -1`, descending `1`, identical `0`), plus `sign`, `isZero`, `isInteger`, `equals`, `neg`, `abs` on negatives and zero [ER14]. [GREEN] `add sub mul div neg abs inv compare equals sign isZero isInteger`. Verify: same file.
- [x] 3.7 [RED] `floor`/`ceil` return `bigint`: `7/2 → 3n/4n`, `-7/2 → -4n/-3n` [ER16]; `-4/1 → -4n/-4n`, `0 → 0n/0n` [ER17]; extra hand-verified `-1/2 → floor -1n, ceil 0n`. [GREEN] implement. Verify: same file.
- [x] 3.8 [RED] `rational/decimal.test.ts` for `parseDecimal`: `"abc"` → `{ ok:false, errors:[{code:'MALFORMED'}] }` and no throw [ER1]; `"0.1"` → `1/10` [ER18]; `"-0.250"` → `-1/4` [ER19]; `".5"`, `"12"`, `"1.50"`, `"00.5"`, `"+3"` → `1/2`, `12`, `3/2`, `1/2`, `3` [ER20]; `"-0"`, `"-0.0"` → `0/1` [ER21]; 22 threes `"0.3333333333333333333333"` equals `Rational.of(3333333333333333333333n, 10n**22n)` and is NOT `1/3` [ER22]; `""`, `" 1"`, `"1 "`, `"5."`, `"."`, `"-"`, `"--1"`, `"1e3"`, `"0x10"`, `"５"`, `"NaN"` → `MALFORMED` [ER23]; `"1,5"`, `"1,000"`, `"1,000.5"`, `","` → `DECIMAL_COMMA` [ER24]; `parseDecimal("0.3")` equals `1/10 + 2/10` [ER7b]. [GREEN] `rational/decimal.ts`. Verify: `npm test -- packages/core/src/rational/decimal`.
- [x] 3.9 [RED] `toString`/`fromString`: `127/2`, `-5/2`, `4/1`, `0/1` → `"127/2"`, `"-5/2"`, `"4"`, `"0"` [ER25]; `"4/2"` → `2`, `"-6/8"` → `-3/4` [ER26]; `""`, `"1/"`, `"/2"`, `"1/-2"`, `"+1/2"`, `"1.5"`, `" 1/2"`, `"1/2/3"`, and any comma → `MALFORMED` [ER27]; `"1/0"` → `ZERO_DENOMINATOR` [ER28]. [GREEN] implement in `rational.ts`. Verify: `npm test -- packages/core/src/rational`.
- [x] 3.10 [RED] Lossy exit and guards: `1/10 → 0.1`, `1/3 → 0.3333333333333333` [ER29]; `(10^400+1)/10^399` is finite, not `NaN`, `|r − 10| ≤ 2^-49`; negative counterpart; `10^400 → Infinity`, `-10^400 → -Infinity`, `1/10^400 → 0` [ER30]; `JSON.stringify(1/3)` and `JSON.stringify({ x: 1/3 })` throw `TypeError` [ER31]; `` `${r}` `` equals `toString()`, `Number(r)` / `r + 1` (via cast) throw `TypeError`. [GREEN] `toNumber` with bit-length shifting, `toJSON`, `[Symbol.toPrimitive]`. Verify: same file.
- [x] 3.11 [RED] `rational/rational.property.test.ts` using `rationalArb`/`numRuns`: commutativity of `+`,`×`; associativity of `+`; distributivity; `(a+b)−b = a`; `(a/b)×b = a` for `b ≠ 0`; every result satisfies `den > 0n` and `gcd(|num|,den) = 1n`; `fromString(toString(x)) = x`; `floor(x) ≤ x < floor(x)+1` [ER15]. These pass against the 3.5-3.10 code (characterization): spot-check by temporarily breaking `gcd` normalization and seeing failures with a printed seed, then restore. Verify: `npm test -- packages/core/src/rational`.
- [x] 3.12 [REFACTOR] Clean `rational.ts` (extract private helpers, no behavior change); `rational/index.ts` and `core/src/index.ts` barrels export `Rational`, `parseDecimal`, `Result`, `ok`, `err`, `CoreError`. Verify: `npm run test:coverage` shows core 100/100/100/100; `npm run lint && npm run typecheck`.
- [x] 3.13 [GREEN] SPIKE (Stryker 10 + vitest 5): `packages/core/stryker.config.json` (since 3.18: `stryker.config.mjs`) per design (`testRunner vitest`, no checkers, `coverageAnalysis perTest`, `mutate ["src/**/*.ts", "!src/**/*.test.ts", "!src/**/*.test-d.ts", "!src/__testing__/**", "!src/**/index.ts"]`, `incremental true`, `incrementalFile reports/stryker-incremental.json`, thresholds `high 95 / low 90 / break 90`); `packages/core/package.json` script `mutation: stryker run`; root script `mutation: STRYKER=1 npm run mutation -w @maestro-calc/core`. Pass condition: `npm run mutation` completes and prints a score for `rational/` (the `STRYKER` define yields 50 runs). Record result and wall time in the PR body. Verify: `npm run mutation`.
- [x] 3.14 (applied: F1 unavailable, `10.0.0` is the newest runner; F2 command runner used) [GREEN] SPIKE FALLBACK (only if 3.13 shows Stryker 10 cannot drive vitest 5): F1 try the newest compatible `@stryker-mutator/vitest-runner` (`npm view @stryker-mutator/vitest-runner versions`) pinned exactly; F2 if still incompatible, use the `command` test runner (`"testRunner": "command"`, `"commandRunner": { "command": "npx vitest run --project core" }`, `coverageAnalysis: "off"`) with the same thresholds. The gate is never dropped; document the incompatibility and chosen fallback in the PR body and in `design.md` Open Questions [QG13]. Verify: `npm run mutation` exits 0 with the same thresholds.
- [x] 3.15 [REFACTOR] Kill surviving mutants: for each survivor in the Stryker report, add a hand-verified test or delete dead code until score ≥ 90. Negative proof: temporarily delete one test file, `npm run mutation` exits non-zero [QG11]; with the real suite the report marks the score in its band (low or higher) and exit 0 [QG12]. Verify: `npm run mutation`.
- [x] 3.16 [RED] Extend `ci.contract.test.ts`: a `mutation` job exists with `needs: verify`, no `paths`/`paths-ignore` and no job-level `if` that can skip it, restores a cache keyed on a hash of the core sources, tests, config and lockfile (exact hit only: the command runner reports no test files, so a `restore-keys` fallback could reuse stale kills; deviation recorded in design.md) and saves it only on `main`, runs `npm run mutation`, no `continue-on-error`; top-level permissions still `{ contents: read }` [QG15, QG16]. [GREEN] add the job to `.github/workflows/ci.yml` (actions pinned by SHA). Verify: `npm test -- apps/web/src/contract/ci`.
- [ ] 3.17 Exit: SX1, SX2 (local + CI), SX3 to SX7; `git status --porcelain` clean after a full `verify` + `mutation` run (`reports/`, `.stryker-tmp/` ignored) [MW16].
- [x] 3.18 [RED→GREEN] PR 3 correction round 1 (4-lens review, all pass; applied M1, M2, M3 and MINOR R1, R2, R3, R4, R5, R6, RES-3, RES-4, RES-5, RES-6, RD-2 to RD-11; none deferred except the job-level `env` form of M1, see design deviation). Gate hardening lands in slice `03f` `feat/foundation-03f-mutation-hardening`: `stryker.config.mjs` computes the incremental file hash once (M1); explicit `timeoutMS 30000`, `timeoutFactor 4`, `concurrency 3` and a serial run (M2); `--typecheck.enabled=false` (M3); contract tests for the config, the single audited pragma and export-only barrels (R2); CI cache key defined once and a failure artifact (M1, RES-5). Source and test fixes live in the branches that own the files (03a `property-runs` seed and `declare` comment; 03b compare message; 03c parser cap, `*_PARSE_CODES` naming, `fromString` and `Symbol.toPrimitive`, `toBe(0.1)`; 03d weighted arbitraries, oracle comment, barrels; 03e `isNegative` helper with one pragma, retitled commit). Verify: `npm run verify` on every tip, `npm run mutation` on the 03f tip.
- [ ] 3.19 Follow-up (RES-6): when Stryker supports vitest 5 (trigger: `npm view @stryker-mutator/vitest-runner versions` lists a release above `10.0.0`, or the upstream ` > ` name-join fix lands), flip the three pins together: `mutation.contract.test.ts` (runner and `coverageAnalysis`), `ci.contract.test.ts` (`restore-keys` allowed), and the hashed `incrementalFile` in `stryker.config.mjs`; re-measure the run time without the serial run.
- [ ] 3.19b Follow-up (PR 3 Judgment Day A1/B2, PR 4 review RES-2, PR 5/6 review RES-1 to RES-3): the trigger is the CI `mutation` job wall time above 20 minutes (the job limit stays 30). Baseline in CI: PR 3 tip 7.95 min (208 mutants, `concurrency 3`); PR 4 tip 14.87 min on `main` and 15.87 min on the PR (329 mutants, `concurrency 4`); CI is 4.5 to 4.8 times slower than local, and the 06c tip was projected at 18.7 to 20 min. Task 6.8 applied `--isolate=false` (local cold 4 min 57 s to 2 min 24 s, same verdicts); the first CI run after it must record the wall time, and `concurrency 3` versus `4` must be re-measured there (`4` was neutral on the 4-vCPU runner). If any CI run exceeds 20 min before sharding ships, raise `timeout-minutes` from 30 to 45 as an interim guard. The per-mutant cost is the vitest boot, not the tests, so sharding on one runner helps only once boot stops dominating. The shard plan must split the test command as well as `mutate`: one Stryker invocation per `src/<module>` whose command is `vitest run src/<module>` (plus one cross-module shard for the contract tests that import several modules), because the command runner reruns the whole suite per mutant. Alternative: re-evaluate `perTest` coverage once the vitest runner works (3.19).

---

## PR 4 — Units core (`feat/foundation-04-units-core`)

Forecast: ~370 changed lines. Specs: units-quantities (dimension model, length/area/volume factors, conversion, same-dimension arithmetic, derived products, lookup).

Planned commits: `feat(core): add dimension exponent model and unit catalog` · `feat(core): add quantity construction and conversion` · `feat(core): add same-dimension arithmetic and derived products` · `test(core): add compile-time dimension tests`. Contingency: split `04a` (4.2-4.4) / `04b` (4.5-4.8).

Overflow applied (stacked branches, each ≤ 400 against its parent): `04a` `feat/foundation-04a-followups` (4.0, 4.1; 293), `04b` `feat/foundation-04b-dimension-catalog` (4.2, 4.3; 391), `04c` `feat/foundation-04c-quantity-conversion` (4.4; 241), `04d` `feat/foundation-04d-ops-derived` (4.5-4.7 incl. `ops.test-d.ts`; 352), `04e` `feat/foundation-04e-mass-density-barrel` (4.8 plus tasks 5.2-5.6 and 5.8, pulled forward from PR 5 by the orchestrator PR 4 scope; 400). `04f` `feat/foundation-04f-type-cost-and-hygiene` (4.10, 4.11: the type-cost, catalog and hygiene part of correction round 1, which no earlier slice could absorb). Task 4.9 (SX1-SX7) pending for each; PR 5 keeps 5.1, 5.7 and 5.9.

- [x] 4.0 [RED→GREEN] PR 3 Judgment Day follow-ups (both judges, WARNING/SUGGESTION): (A3/B3) add `../../tsconfig.base.json`, `../../vitest.config.ts` and `.nvmrc`/`process.version` to `incrementalIdentityFiles` in `stryker.config.mjs` and a contract test asserting the config list covers every `hashFiles` glob in `ci.yml`; (A6/B1) re-export `RATIONAL_PARSE_CODES` from `rational/index.ts` and both code arrays from `core/index.ts`; clarify design.md that `DECIMAL_COMMA` belongs to `parseDecimal` only; (A2/B6) express `isNegative` so no equivalent mutant exists (e.g. `value <= -1n`) and drop the last pragma, or add a direct `>=`-killing test; (A5/B5) prune sibling `stryker-incremental-*.json` at config load; (A4/B4) `__STRYKER__: process.env['STRYKER'] === '1'`, drop the redundant root `STRYKER=1` prefix; (A1/B2) reword design D10 (cache is all-or-nothing per core change) and add follow-up 3.19b: when a cold mutation run exceeds 10 min, shard by directory or re-evaluate perTest coverage. Files: `packages/core/stryker.config.mjs`, `packages/core/vitest.config.ts`, `packages/core/src/rational/{rational,index}.ts`, `packages/core/src/index.ts`, `apps/web/src/contract/mutation.contract.test.ts`, `package.json`, design.md. Verify: `npm run verify && npm run mutation`.
- [x] 4.1 Create branch from `main` (stacked slices 04a to 04f, see the PR 4 overflow note).
- [x] 4.2 [RED] `units/dimension.test.ts`: named exponent table `length (1,0)`, `area (2,0)`, `volume (3,0)`, `mass (0,1)`, `density (-3,1)`; `nameOf({length:2,mass:0}) = 'area'`; `nameOf({length:4,mass:0})` and `nameOf({length:1,mass:1})` are `undefined`; vector add/sub (`length+length = area`, `volume−area = length`, `mass−volume = density`). [GREEN] `units/dimension.ts` (single `Dimensions` interface + runtime table, `AddVec`/`SubVec` helpers). Verify: `npm test -- packages/core/src/units/dimension`.
- [x] 4.3 [RED] `units/catalog.test.ts`: literal factor table for the 18 length/area/volume rows (e.g. `mm 5/127`, `cm 50/127`, `m 5000/127`, `ft2 144`, `mm2 25/16129`, `m2 25000000/16129`, `ft3 1728`, `yd3 46656`, `mm3 125/2048383`, `m3 125000000000/2048383`); audit that each area factor = length factor² and each volume factor = length factor³ [UQ12a]; `findUnit('length','ft')` resolves, `'FT'`, `'furlong'`, `'ft2'` are `undefined`, `findUnit('area','ft2')` resolves [UQ25a]; no float literal present (the file is built only from `Rational.of`; an `rg` check in 4.8). [GREEN] `units/unit.ts` (`Unit<D>`), `units/catalog.ts` (rows computed from length factors at module init), `findUnit`. Verify: `npm test -- packages/core/src/units/catalog`.
- [x] 4.4 [RED] `units/quantity.test.ts` and `units/units.property.test.ts`: `quantity(2, ft)` and `quantity(1, lb)`-style untyped runtime vectors read as `(1,0)` and `(0,1)` (mass vector asserted through the dimension table until PR 5 adds `lb`) [UQ2]; `25.4 mm` (`127/5`) → `1 in` [UQ3]; `1 m → ft = 1250/381` [UQ4]; `1 ft → m = 381/1250` [UQ5]; `1 yd → m = 1143/1250` [UQ6]; `1 yd3 → ft3 = 27`, `1 ft3 → yd3 = 1/27` [UQ7]; `1 m2 → ft2 = 1562500/145161` [UQ8]; `7/3 yd3 → 63 ft3 → 7/3 yd3` [UQ13]; `quantity(1/3, ft) → 4 in` and `scale(…, 3)` equals `quantity(1, ft)` [UQ15]; `valueIn(lengthQ, ft2)` (cast) throws `DIMENSION_MISMATCH`; `quantity` accepts a safe-integer `number`. Property: for each of the 18 units, `valueIn(quantity(x,u),u) = x`, and conversion through a second unit of the same dimension leaves the quantity equal [UQ14a]. [GREEN] `units/quantity.ts`. Spot check: temporarily set `ft` factor to `11`, property fails with seed, restore. Verify: `npm test -- packages/core/src/units`.
- [x] 4.5 [RED] `units/ops.test.ts` same-dimension block: `1 ft + 6 in = 18 in` [UQ16]; `abs`/`negate` of `-5/2 in` both `5/2 in`, `sign = -1`, `quantity(0,m)` `isZero` and `equals quantity(0,ft)` [UQ17]; untyped `add(length, area)`, `sub`, `compare`, `equals`, `ratio` throw `DIMENSION_MISMATCH` (objects built with casts) [UQ18]; `scale`, `divideScalar` (by `0` → `DIVISION_BY_ZERO`), `ratio(a, b)` plain Rational and `ratio` with zero divisor → `DIVISION_BY_ZERO`; `compare` ordering across units. [GREEN] `units/ops.ts` same-dimension functions. Verify: `npm test -- packages/core/src/units/ops`.
- [x] 4.6 [RED] Derived block: `120 in × 150 in = 18000 in2 = 125 ft2 = 125/9 yd2` [UQ19]; `18000 in2 × 24 in = 432000 in3 = 250 ft3`, and `length × area` commutes [UQ20]; `432000 in3 ÷ 18000 in2 = 24 in`, `volume ÷ length = area`, `area ÷ length = length` [UQ21]; `divide(area, quantity(0,in))` → `DIVISION_BY_ZERO` [UQ23]; untyped `multiply(area, area)` → `DIMENSION_MISMATCH` [UQ24a]. [GREEN] `multiply`, `divide` (vector add/sub, `nameOf` or throw). Verify: same file.
- [x] 4.7 [RED] `units/ops.test-d.ts` (type tests; run by `npm run typecheck`): `Quantity<'length'>` passed where `Quantity<'area'>` is expected needs `@ts-expect-error` [UQ1]; `add(length, area)` and `valueIn(length, ft2)` rejected; `multiply(length, length)` is `Quantity<'area'>`, `multiply(area, length)` and `(length, area)` are `Quantity<'volume'>`, `divide(volume, area)` and `(area, length)` are `Quantity<'length'>`, `divide(volume, length)` is `Quantity<'area'>`; `multiply(area, area)` rejected [UQ24b]; unique-symbol brand prevents `{ exponents, canonical }` literals from being accepted. [GREEN] type-level `Product`, `Quotient`, `NameOf`, `Named`, brand. Verify: `npm run typecheck`.
- [x] 4.8 [REFACTOR] `units/index.ts` and `core/src/index.ts` barrel (`quantity`, `valueIn`, ops, `findUnit`, unit constants `in ft yd mm cm m in2 ... m3`); confirm no float literal: `rg -n "0\.0254|0\.3048|0\.45359237" packages/core/src` is empty. Verify: `npm run test:coverage` core 100%; `npm run mutation` ≥ 90.
- [ ] 4.9 Exit: SX1 to SX7.
- [x] 4.10 [RED→GREEN] PR 4 correction round 1 (4-lens review): M1 (type-level `Add`/`Sub` cost, `typecost.contract.test.ts`), M2 (`timeoutMS 10000`, `concurrency 4`, 3.19b rewritten on CI wall time), M3 (forged-literal brand test), and the MINORs RISK-2, RISK-3, R2, R3, R5, R6, RES-3, RES-4, RD-2 to RD-19 (commit `bf0ca02` split into three work units). Deferred: none. See `apply-progress.md`.
- [ ] 4.11 Follow-up (RISK-1): at the next lockfile touch add the root `overrides: { "qs": "^6.16.1" }` (or wait for Stryker to bump `typed-rest-client`), and merge Dependabot #13 to clear the 5 high `braces` findings; the audit findings are dev-only (Stryker), accepted for PR 4.

---

## PR 5 — Mass and density (`feat/foundation-05-mass-density`)

Forecast: ~250 changed lines. Specs: units-quantities (mass, density, derived dimensions), monorepo-workspace (layout, graph, pins, purity assertions as contract tests), material-data-contract (dependency direction).

Planned commits: `feat(core): add mass and density units` · `test(core): cover mass and density derived products` · `test(web): add workspace layout and toolchain contract tests`.

- [x] 5.0 [RED→GREEN] PR 4 Judgment Day follow-ups (both judges, WARNING/SUGGESTION): (A-1/B-1) fix the Stryker timeout wording in `stryker.config.mjs`, `mutation.contract.test.ts`, design.md and apply-progress: timeout = netTime × timeoutFactor + timeoutMS (≈ 19 s here), values unchanged; (B-2) tighten `INSTANTIATION_BUDGET` to 40_000 (baseline 16,272), handle `\r?$` in the regex, resolve `tsc` via `require.resolve('typescript/bin/tsc')`, optionally also measure `tsconfig.test.json`; (A-2) document in design.md the known limitation that a widened `Quantity<DimensionName>` union defeats the compile-time same-dimension check (runtime guard still throws); (A-3) `readdirSync(..., { withFileTypes: true })` + `isFile()` instead of `statSync` in `sourceFilesIn`; (B-3) derive the catalog definition count from `Object.values(UNITS).flat().length` and accept numeric separators in the float-literal scan; (B-4) drop the stale `bf0ca02` reference in task 4.10 and add the 04f row to the apply-progress PR 4 table; (B-5) filter dotfiles in the package-root `*.json` identity list for symmetry. Files: `packages/core/stryker.config.mjs`, `apps/web/src/contract/{mutation,typecost,catalog}.contract.test.ts`, design.md, apply-progress.md, tasks.md. Verify: `npm run verify`.
- [x] 5.1 Create branch from `main` (slice `feat/foundation-05-followups-workspace`: mass and density already shipped in PR 4, so PR 5 holds 5.0, 5.7 and 5.9 only).
- [x] 5.2 [RED] Extend `units/catalog.test.ts`: factors `lb 1`, `oz 1/16`, `ton 2000`, `kg 100000000/45359237`, `tonne 100000000000/45359237`, `lb/in3 1`, `lb/ft3 1/1728`, `lb/yd3 1/46656`, `ton/yd3 125/2916`, `kg/m3 2048383/56699046250`; total catalog size is exactly 28; full audit: each density factor = mass factor ÷ volume factor of its pair (`lb/ft3 = lb ÷ ft3`, `ton/yd3 = ton ÷ yd3`, `kg/m3 = kg ÷ m3`) [UQ12]. [GREEN] add rows to `units/catalog.ts`. Verify: `npm test -- packages/core/src/units/catalog`.
- [x] 5.3 [RED] Conversions: `1 kg → lb = 100000000/45359237`, `1 lb → kg = 45359237/100000000`, `1 ton → kg = 45359237/50000`, `32 oz → lb = 2`, `1 tonne → ton = 50000000/45359237` [UQ9]; `findUnit('mass','kg')` resolves while `findUnit('length','kg')` is `undefined` [UQ25b]; `quantity(1, lb)` runtime vector `(0,1)` [UQ2b]. [GREEN] none expected beyond 5.2 (fix on failure). Verify: `npm test -- packages/core/src/units`.
- [x] 5.4 [RED] Derived: `1.4 ton/yd3` (`7/5`) → `lb/ft3 = 2800/27`; `× 3 yd3` is a `Quantity<'mass'>` of `8400 lb` = `21/5 ton`; `volume × density` commutes [UQ10]; `1000 kg/m3 → lb/ft3 = 14158423296/226796185` [UQ11]; `8400 lb ÷ 3 yd3` is a density equal to `2800/27 lb/ft3`, and `mass ÷ density` returns `3 yd3` [UQ22]; untyped `compare(mass, length)` and `multiply(mass, length)` throw `DIMENSION_MISMATCH` [UQ18b, UQ24c]. [GREEN] fix `nameOf`/ops if needed (generic code should pass). Verify: `npm test -- packages/core/src/units/ops`.
- [x] 5.5 [RED] Extend `ops.test-d.ts`: type of `mass ÷ volume` is `Quantity<'density'>`; `density × volume` and `volume × density` are `Quantity<'mass'>`; `mass ÷ density` is `Quantity<'volume'>`; `multiply(mass, length)`, `multiply(density, length)`, `add(mass, length)` rejected [UQ24d]. [GREEN] adjust type helpers if any fail. Verify: `npm run typecheck`.
- [x] 5.6 [RED] Extend `units.property.test.ts` to all 28 units (`valueIn(quantity(x,u),u) = x`, via-unit invariance) [UQ14]. Spot check by mutating the `kg` factor. Verify: `npm test -- packages/core/src/units`.
- [x] 5.7 [RED then GREEN as characterization] `apps/web/src/contract/workspace-graph.contract.test.ts` (renamed: `workspaces.contract.test.ts` already tests the derived workspace list) (Node `fs`, `@types/node` from PR 2; placed here to balance slice sizes, independent of units): workspace globs resolve to exactly the 4 package names [MW2]; `packages/core/package.json` has no `dependencies` or an empty object and no schema/fraction library anywhere in its manifest [MW6, CC26]; the workspace dependency graph equals the allowed edges `data→core`, `web→core`, `web→data`, `web→i18n`, `core` and `i18n` depend on no workspace [MW5b, MD5]; every workspace `tsconfig.json` extends `tsconfig.base.json` and the base enables `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`, `noImplicitOverride`, `moduleResolution: Bundler`, target ≥ ES2022 [MW13]; only the root declares `typescript`, matching `~6.0` [MW14]; `.nvmrc` is `24`; `engines.node` is `>=22.23.4`; root scripts include `dev build lint format format:check typecheck check test test:coverage mutation` and `check` equals `typecheck` [MW15b]; `exports` of core/data/i18n point to `.ts` files and no `dist` directory exists in `packages/*` [MW11b]. These pass on the PR 1-3 config (characterization): spot-check each assertion by temporarily editing the manifest. Verify: `npm test -- apps/web/src/contract/workspace`.
- [x] 5.8 [REFACTOR] Exports of the new unit constants in the barrel; coverage and mutation to threshold. Verify: `npm run test:coverage && npm run mutation`.
- [ ] 5.9 Exit: SX1 to SX7.

---

## PR 6 — Rounding and formatting (`feat/foundation-06-rounding-format`)

Forecast: ~330 changed lines. Specs: fraction-format (rounding, decimal display, purchase ceiling, feet-inch formatting).

Planned commits: `feat(core): add fraction rounding kernel` · `feat(core): add decimal parts and purchase ceiling` · `feat(core): add feet-inch-fraction formatting`.

Overflow applied (stacked branches, each ≤ 400 against its parent): `06a` `feat/foundation-06a-rounding-kernel` (6.1, 6.2), `06b` `feat/foundation-06b-decimal-purchase` (6.3, 6.4), `06c` `feat/foundation-06c-feet-inches` (6.5, 6.6). Task 6.7 (SX1-SX7) pending for each.

- [x] 6.1 Create branch from `main` (stacked slices 06a to 06c, see the PR 6 overflow note).
- [x] 6.2 [RED] `format/rounding.test.ts` + `format/rounding.property.test.ts`: the 11-row hand-verified table in all three modes (33 cells; e.g. `1/128,d64` → nearest 1 / up 1 / down 0; `-3/128` → -2 / -1 / -2; `1/3,d16` → 5 / 6 / 5; `-1/3,d16` → -5 / -5 / -6; `5/4,d2` → 3 / 3 / 2; `1/2,d3` → 2 / 2 / 1; `0,d7` → 0 / 0 / 0) [FF2]; ties at `±1/128` [FF1]; `1/2,d3` nearest `k=2` [FF3]; `0, 1, 65, -2, 2.5, NaN` throw `INVALID_DENOMINATOR`, `2` and `64` succeed [FF4]; multiples (`3/4,d16 → 12`) unchanged in all modes; properties over every `d` in 2..64: idempotence, `round(−x) = −round(x)`, `|x − round(x)| ≤ 1/(2d)`, `down ≤ x ≤ up`, `up − down ≤ 1/d` [FF5]. [GREEN] `format/rounding.ts` (private `roundScaled(r, scale, mode)` kernel, `roundToFraction`). Verify: `npm test -- packages/core/src/format/rounding`.
- [x] 6.3 [RED] `format/decimal-parts.test.ts`: 11-row table × 3 modes with exact parts (e.g. `-1/8,p2,nearest = { negative:true, integer:0n, fraction:'13' }`; `7,p3 = { false, 7n, '000' }`; `145161/12500,p2` → `11.61 / 11.62 / 11.61`; `p4` → `11.6129 / 11.6129 / 11.6128`; `5/2,p0` → 3 / 3 / 2; `1/20,p1` → `0.1 / 0.1 / 0.0`) [FF6]; `-1/1000,p2` nearest and up → `{ false, 0n, '00' }`, down → `-0.01` [FF7]; `1/3,p12 → '333333333333'`, `p0` gives `fraction ''`, places `-1, 13, 1.5, NaN` throw `INVALID_PLACES` [FF8]; property: reassembled value is within `10^-p / 2` of the input in `nearest`. [GREEN] `format/decimal-parts.ts` reusing the kernel. Verify: `npm test -- packages/core/src/format/decimal-parts`.
- [x] 6.4 [RED] `format/purchase.test.ts`: `18000/144 → 125n`, `(7/10)×(10/7) → 1n` [FF9]; `7/2 → 4n`, `1/10^30 → 1n`, `0 → 0n` [FF10]; `-1/2` throws `NEGATIVE_QUANTITY` [FF11]; property `n ≥ x > n − 1` for non-negative `x`. [GREEN] `format/purchase.ts`. Verify: same folder.
- [x] 6.5 [RED] `format/feet-inches.test.ts`: `127/2 in, d16` → text `5' 3 1/2"`, parts `{ negative:false, feet:5n, inches:3n, fraction:{numerator:1n, denominator:2n} }` [FF12]; `191/16 → 0' 11 15/16"` and `191/16 + 1/16` → `1' 0"` [FF13]; `383/32,d16 → 1' 0"`, `9215/64,d32 → 12' 0"`, `d64 → 11' 11 63/64"` [FF14]; `0 in` → `0' 0"`, `negative:false` [FF15]; `-127/2,d16 → -5' 3 1/2"`, `-1/128,d64 → -0' 1/64"` [FF16]; `-1/200,d64 → 0' 0"`, `negative:false` [FF17]; `144 in → 12' 0"`, `2401/2 in,d2 → 100' 1/2"` [FF18]; `3/4,d8 → 0' 3/4"`, `1/2,d3 → 0' 2/3"` [FF19]; `1/128,d64` up `0' 1/64"` / down `0' 0"`, `-1/128` up `0' 0"` / down `-0' 1/64"` [FF20]; `1/3 ft,d16 → 0' 4"`, `1/3 in,d16 → 0' 5/16"` [FF21]; invalid `denominator` throws `INVALID_DENOMINATOR`; property: `feet×12 + inches + num/den` equals the signed rounded total and `0 ≤ inches ≤ 11`. [GREEN] `format/feet-inches.ts` (round the signed total first, then decompose). Verify: `npm test -- packages/core/src/format/feet-inches`.
- [x] 6.6 [REFACTOR] `format/index.ts` and `core/src/index.ts` export `roundToFraction`, `toDecimalParts`, `ceilToPurchaseUnits`, `formatFeetInches`, `RoundingMode`; remove duplicate helpers. Verify: `npm run test:coverage && npm run mutation`.
- [ ] 6.7 Exit: SX1 to SX7.
- [x] 6.8 [RED→GREEN] PR 5 + PR 6 correction round 1 (4-lens review, all pass; applied M1 and the MINORs RISK-1, RISK-2, R1, R2, R3, RD-1 to RD-11, RES-4, RES-6; deferred: none). Owner-branch fixes: 05 (symlink fail-closed, `rootJsonFiles`, timeout-wording commit split, test hygiene), 06a (`INVALID_MODE` in the kernel, spec and design code lists), 06b (mode property over all three modes, JSDoc), 06c (JSDoc, test helper); new slice `06d` `feat/foundation-06d-gate-isolate-and-hygiene` (`--isolate=false`, `check:dist` post-build step, `@__PURE__` on the dimension names, docs). See `apply-progress.md`.

---

## PR 7 — Length parser (`feat/foundation-07-length-parser`)

Forecast: ~390 changed lines (tightest slice; use the overflow rule if the tests grow). Specs: fraction-format (length text grammar, format/parse round trip).

Planned commits: `feat(core): add length scanner and pre-processing rules` · `feat(core): add length parser (simple, compound, units)` · `test(core): add format/parse round-trip properties`. Contingency: split `07a` (7.2-7.5) / `07b` (7.6-7.9).

- [ ] 7.1 Create branch from `main`.
- [ ] 7.2 [GREEN, decision] Record the `offset` policy in `length-parser/codes.ts` doc comment: `offset` is the zero-based index in the ORIGINAL text of the first character of the offending token (additive, MAY per spec; consumers must not depend on it). Verify: reviewed in SX5.
- [ ] 7.3 [RED] `length-parser/parser.test.ts` pre-processing: `""`, `"   "` → `EMPTY`; `"1"` + 126 spaces + `"'"` (128 chars) → success `12 in`; same with 127 spaces (129 chars) → `TOO_LONG` [FP8]; `5,5`, `1,000 ft`, `1,000.5"`, `5' 3,5"` → `DECIMAL_COMMA` [FP12]; precedence: a 129-char input containing a comma → `TOO_LONG`, whitespace-only with a comma → `DECIMAL_COMMA`; embedded newline → `MALFORMED`; leading/trailing U+0020, tab, U+00A0 trimmed. [GREEN] `length-parser/scanner.ts` (trim, caps) + `codes.ts` (`LENGTH_PARSE_CODES`) + minimal `parser.ts` entry. Verify: `npm test -- packages/core/src/format/length-parser`.
- [ ] 7.4 [RED] `length-parser/scanner.test.ts` tokens: 18-digit run accepted, 19-digit run `TOO_LARGE`, including the fractional run in `0.1234567890123456789` [FP10]; smart marks `′ ’ ″ ” −` map to feet/inch/minus tokens; unit token is the maximal `[A-Za-z]+[0-9]*` run, case-insensitive; `1e3`, `1E9`, `0x10` → `MALFORMED`; `5 furlongs`, `5 sq ft`, `5 m2`, `5 ft2`, `5ft2`, `2 yd3` → `UNKNOWN_UNIT` [FP11]; full-width `５'` → `MALFORMED`. [GREEN] `scanner.ts`. Verify: same folder.
- [ ] 7.5 [RED] Simple forms: `5'` = `60`, `3/4` default in → `3/4`, default ft → `9`, `5` default in → `5`, default ft → `60`, `3-1/2` → `7/2` [FP2]; units: `1.5 m = 7500/127`, `10 mm = 50/127`, `2.54 cm = 1`, `1 yd = 36`, `0.1 ft = 6/5`, `1 1/2 ft = 18`, `5 FT = 60` [FP6]; exactness `1/3"` and `3/7"` [FP7]; `1/0"` and `3 1/0` → `ZERO_DENOMINATOR` [FP9]; 18-digit `123456789012345678"` exact. [GREEN] `parser.ts` `number := mixed | fraction | decimal`, `simple := number UNIT?`. Verify: same folder.
- [ ] 7.6 [RED] Compound and signs: the eight spellings `5' 3-1/2"`, `5ft 3 1/2in`, `63.5in`, `5' 3.5"`, `5'-3 1/2"`, `5'3 1/2`, `5′ 3 1/2″`, `5’ 3 1/2”` all equal `127/2` [FP1]; `5'3"` = `63`, `5 ft 3 in` = `63` [FP2b]; `-5' 3"` and U+2212 variant = `-63`, `+5'` = `60`, `-0"` = `0`, `0' 0"` = `0` [FP3]; `  5'   3  1/2"  ` = `127/2`, `5'` U+00A0 `3"` = `63` [FP4]; `5' 15"` = `75`, `100'` = `1200` [FP5]; sign applies to the whole value; word feet without an inch mark (`5 ft 2`) → `MALFORMED`. [GREEN] `compound`, `sep`, sign handling. Verify: same folder.
- [ ] 7.7 [RED] `MALFORMED` table: `"`, `'`, `ft`, `abc`, `5' 3 1/2 1/2"`, `5.5' 3"`, `5' -3"`, `5" 3'`, `3//4`, `1 / 2`, `1e3`, `1E9`, `0x10`, `５'`, `5'3'`, `--5`, `- 5`, `5 3 1/2`, `.`, `1.`, `5'-`, `3.5 1/2`, `1/2.5`, `1 yd 2 ft`, `5 ft 2`, and a newline input all return `{ ok:false, errors:[{code:'MALFORMED'}] }` [FP13]; fuzz property: for arbitrary strings `parseLength` never throws and every success has a length-dimension quantity. [GREEN] fix remaining grammar gaps. Verify: same folder.
- [ ] 7.8 [RED] Offset: `"5 furlongs"` → `UNKNOWN_UNIT` with `offset 2`; `'1/0"'` → `ZERO_DENOMINATOR` with `offset 2` (policy 7.2); offsets index the untrimmed original text. [GREEN] thread offsets through scanner tokens. Verify: same folder.
- [ ] 7.9 [RED] `length-parser/length-parser.property.test.ts`: for `d` in 2..64 and integer `k` (negatives, zero, magnitudes beyond 10^9) with `|k/d| < 10^15`, `parseLength(formatFeetInches(k/d in, d).text) = k/d` [FR1]; the texts `5' 3 1/2"` (d2), `1' 0"` (d2), `-0' 1/64"` (d64) re-format to themselves, and for generated canonical texts `format(parse(t), d).text = t` [FR2]. Likely green on arrival (characterization); spot-check by breaking the fraction branch. Verify: same folder.
- [ ] 7.10 [REFACTOR] `length-parser/index.ts` + core barrel export `parseLength`, `LengthParseError`; drive core coverage to 100% and kill survivors. Verify: `npm run test:coverage && npm run mutation`.
- [ ] 7.11 Exit: SX1 to SX7.

---

## PR 8 — Money (`feat/foundation-08-money`)

Forecast: ~300 changed lines. Specs: money. Depends on PR 4-7.

Planned commits: `feat(core): add exact Money and arithmetic` · `feat(core): add unit prices` · `feat(core): add parseMoney`.

- [ ] 8.1 Create branch from `main`.
- [ ] 8.2 [RED] `money/money.test.ts`: `usd(498/100) × 3` via `multiplyCount` = `747/50` [MN1]; `usd(333/1000) × 3 = 999/1000` and `toCents` yields `{ false, 1n, '00' }` [MN2]; `multiplyCount(usd(249/50), 4n) = 498/25` and `ceilToPurchaseUnits(7/2) = 4n` feeds it [MN3]; `addMoney`, `subMoney` (negative result allowed), `compareMoney`, `equalsMoney`, `scaleMoney(usd(1/3), 3) = usd(1)`; `multiplyCount` with `-1` throws `NEGATIVE_QUANTITY`, with `1.5` throws `NOT_AN_INTEGER`, bigint accepted; `usd` accepts safe integer; untyped `addMoney(money, quantity)` and `add(quantity, money)` throw `DIMENSION_MISMATCH` [MN-mix]. [GREEN] `money/money.ts` and a guard in `units/ops.ts` (operands lacking an exponent vector throw `DIMENSION_MISMATCH`). Verify: `npm test -- packages/core/src/money packages/core/src/units`.
- [ ] 8.3 [RED] Cents table via `toCents`: `747/50 → {false,14n,'94'}`, `185/4 → {false,46n,'25'}`, `37/8 → {false,4n,'63'}`, `999/1000 → {false,1n,'00'}`, `-1/200 → {true,0n,'01'}` [MN7]. [GREEN] `toCents`. Verify: same folder.
- [ ] 8.4 [RED] `money/unit-price.test.ts`: `costOf(unitPrice(usd(37/100), ft2), 125 ft2) = 185/4` [MN4]; same price × `1 yd2 = 333/100` [MN5]; `unitPrice(usd(1), m)` × `1 ft` = `381/1250`; untyped `costOf` of a `ft2` price with a length quantity throws `DIMENSION_MISMATCH` [MN6a]; `unit-price.test-d.ts`: the same call is a compile error [MN6b]. [GREEN] `money/unit-price.ts`. Verify: same folder + `npm run typecheck`.
- [ ] 8.5 [RED] `money/parse.test.ts`: `4.98`, `$4.98`, `$0.37`, `.5`, `$12`, `4.987`, `007` → `249/50`, `249/50`, `37/100`, `1/2`, `12`, `4987/1000`, `7` [MN8]; `1,000`, `4,98` → `DECIMAL_COMMA`; `-5`, `$-5`, `$ 5`, `5$`, `USD 5`, `$`, `1e3`, `1.5.5` → `MALFORMED`; `""` → `EMPTY`; 19-digit integer → `TOO_LARGE`; 18-digit integer accepted; precedence `EMPTY` > `DECIMAL_COMMA` > `TOO_LARGE` > `MALFORMED` (e.g. a comma plus a 19-digit run is `DECIMAL_COMMA`) [MN9]. Decision recorded for review (spec wording conflict, see Risks R3): the 18-digit cap applies to every digit run, fractional runs included, for consistency with `parseLength`; `4.987` (3 fractional digits) stays exact. Property: never throws on arbitrary strings. [GREEN] `money/parse.ts`. Verify: same folder.
- [ ] 8.6 [REFACTOR] `money/index.ts` + barrel exports (`Money`, `usd`, `addMoney`, `subMoney`, `compareMoney`, `equalsMoney`, `scaleMoney`, `multiplyCount`, `unitPrice`, `costOf`, `toCents`, `parseMoney`). Verify: `npm run test:coverage && npm run mutation`.
- [ ] 8.7 Exit: SX1 to SX7.

---

## PR 9 — Contract: define and validate (`feat/foundation-09-contract-validate`)

Forecast: ~390 changed lines (near cap; overflow rule applies). Specs: calculator-contract (field kinds, definition-time validation, total validation). The returned calculator exposes `validate` and `compute`; `run` arrives in PR 10.

Planned commits: `feat(core): add calculator descriptor types and constraint checks` · `feat(core): add defineCalculator definition-time validation` · `feat(core): add calculator validate pipeline` · `feat(core): add field error codes`. Contingency: split `09a` (9.2-9.5) / `09b` (9.6-9.10).

- [ ] 9.1 Create branch from `main`.
- [ ] 9.2 [RED] `calculator/descriptors.test-d.ts`: an inline `fixture-box`-shaped definition infers `compute` input as `{ len: Quantity<'length'>; cnt: number; pct: Rational; sel: 'x' | 'y'; flg: boolean; prc: Money }`; reading `inputs.zzz` and comparing `sel === 'z'` need `@ts-expect-error`; the compute return must be exactly `{ area: Quantity<'area'>; cost: Money }` (omitting `cost` or returning `area` as a length is an error) [CC2]. [GREEN] `calculator/descriptors.ts` (descriptor unions, `InputsOf`, `ComputeResult`), `define.ts` signature with `const` generics. Verify: `npm run typecheck`.
- [ ] 9.3 [RED] `calculator/constraints.test.ts`: `checkConstraints` returns `BELOW_MIN`/`ABOVE_MAX` with canonical-string `params` (`{ min: '0' }`, `{ max: '1200' }`, `{ max: '25/2' }`), bounds are inclusive on both ends for length/count/percent/money, defaults for omitted bounds (count `0..MAX_SAFE_INTEGER`, percent `0..100`, money min `usd(0)`), select membership → `UNKNOWN_OPTION`. [GREEN] `calculator/constraints.ts`. Verify: `npm test -- packages/core/src/calculator/constraints`.
- [ ] 9.4 [RED] `calculator/define.test.ts` (table-driven over every reason): `INVALID_ID` (`'Rect Area'`), `INVALID_KEY` (field `'1abc'`, output key, warning code) , `INVALID_URL_KEY` (`'abcd'`, `''`, `'A'`; `'abc'` accepted) [CC6], `RESERVED_URL_KEY` (`'v'`, `'u'`, and `'q'` listed in `retiredUrlKeys`) [CC4], `DUPLICATE_KEY`, `DUPLICATE_URL_KEY` (two `'a'`) [CC3], `NO_INPUTS` [CC8], `NO_OPTIONS`, `DUPLICATE_OPTION`, `INVALID_OPTION_ID`, `INVALID_UNIT` (`metricDefaultUnit: 'ft'`, `defaultUnit: 'm'`) [CC6], `INVALID_BOUNDS` (percent `min 50 max 10`; negative money `min`) [CC6], `DEFAULT_INVALID` (count `min 5 max 10 default 3`; select default not in options) [CC5], `NO_OUTPUTS`, `DUPLICATE_OUTPUT_KEY`, `PRIMARY_COUNT` (zero and two primaries), `INVALID_DISPLAY` (`area` output with unit `'ft'`; `length` fraction `denominator 65`; money with `display`; decimal `places 13`; fraction on non-length) [CC7]. Each throws `CoreError` with `code 'INVALID_DEFINITION'` and the exact `reason`. [GREEN] `calculator/define.ts` validation. Verify: same folder.
- [ ] 9.5 [RED] `__testing__/fixture-box.ts` per the spec table (urlKeys `a..f`, defaults `12 in`, `3`, `10`, `x`, `false`, `usd(249/50)`; outputs `area` primary with display `{ unit:'ft2', format:'decimal', places:2 }`, `cost` secondary; warning `bigCount`), plus `fixture-box.test.ts` asserting the metadata is readable in declared order with key, kind, urlKey, default, role, display and constraints [CC1]. [GREEN] fixture and `Calculator` object (`id`, `inputs`, `outputs`, `warnings`, `retiredUrlKeys`, `validate`, `compute`). Verify: `npm test -- packages/core/src/calculator packages/core/src/__testing__`.
- [ ] 9.6 [RED] `calculator/validate.test.ts` defaults: `{}` → `len 12 in, cnt 3, pct 10, sel 'x', flg false, prc usd(249/50)` [CC9]; `{ zzz: 1, len: undefined }` → all defaults, no error [CC20]. [GREEN] `calculator/validate.ts` skeleton (iteration, ordering, absent/undefined → default, undeclared ignored). Verify: same folder.
- [ ] 9.7 [RED] Length: `len` `"-1"`, `"0"`, `"100'"`, `"1200"`, `"101'"`, `"1200 1/64"` → `BELOW_MIN{min:'0'}`, `0 in`, `1200 in`, `1200 in`, `ABOVE_MAX{max:'1200'}`, `ABOVE_MAX` [CC12]; parser codes `abc`, `1/0`, `5 furlongs`, `""`, `1,5` → `MALFORMED`, `ZERO_DENOMINATOR`, `UNKNOWN_UNIT`, `EMPTY`, `DECIMAL_COMMA` [CC13]; `"1 m"` → `5000/127 in` [CC14]; `"5"` imperial/default → `5 in`, metric → `250/127 in`, `"5'"` metric → `60 in` [CC15]; a `Quantity<'length'>` raw value accepted; 129-char string → `TOO_LONG`. [GREEN] length branch (`parseLength` with `defaultUnit`/`metricDefaultUnit`). Verify: same folder.
- [ ] 9.8 [RED] Other kinds: count outcomes for `"abc"`, `"-1"`, `"1.5"`, `"12abc"`, `""`, `"007"`, `7`, `7.5`, `"101"`, `"9007199254740992"`, `null`, `"1,000"`, 129 × `"1"` → `MALFORMED`, `MALFORMED`, `MALFORMED`, `MALFORMED`, `EMPTY`, `7`, `7`, `MALFORMED`, `ABOVE_MAX{max:'100'}`, `ABOVE_MAX`, `MALFORMED`, `DECIMAL_COMMA`, `TOO_LONG`, never coerced to 0 [CC11]; percent `"12.5%"`, `"12.5"`, `"-0"`, `"100"`, `"100.0001"`, `"12.5 %"`, `"abc"`, `"-1"`, `"12,5"` → `25/2`, `25/2`, `0`, `100`, `ABOVE_MAX`, `MALFORMED`, `MALFORMED`, `BELOW_MIN`, `DECIMAL_COMMA` [CC16]; money `"$4.98"`, `"4.987"`, `"1,000"`, `"-1"`, `"10000"`, `"10000.01"`, `""`, `usd(-1)` → `usd(249/50)`, `usd(4987/1000)`, `DECIMAL_COMMA`, `MALFORMED`, `usd(10000)`, `ABOVE_MAX{max:'10000'}`, `EMPTY`, `BELOW_MIN{min:'0'}` [CC17]; select `"y"`, `"Y"`, `"z"`, `1` → `'y'`, `UNKNOWN_OPTION` ×3; boolean `false`, `"true"`, `1`, `null` → `false`, `MALFORMED` ×3 [CC18]; `null` for non-select → `MALFORMED`. [GREEN] count/percent/money/select/boolean branches. Verify: same folder.
- [ ] 9.9 [RED] Aggregation: `{ len: "5' 3\"", cnt: "7", pct: "12.5%", sel: "y", flg: true, prc: "$5" }` → `63 in, 7, 25/2, 'y', true, usd(5)` [CC10]; `{ cnt: "x", len: "abc", pct: "5" }` → errors exactly `[ {field:'len',code:'MALFORMED'}, {field:'cnt',code:'MALFORMED'} ]`, at most one per field, no value [CC19]. [GREEN] wire error aggregation. Verify: same folder.
- [ ] 9.10 [RED] `error-codes.test.ts`: `FIELD_ERROR_CODES` equals the 10 codes `EMPTY, MALFORMED, DECIMAL_COMMA, ZERO_DENOMINATOR, UNKNOWN_UNIT, TOO_LONG, TOO_LARGE, BELOW_MIN, ABOVE_MAX, UNKNOWN_OPTION` (type `FieldErrorCode`); `ALL_ERROR_CODES` joins in PR 11 when the URL codes exist. [GREEN] `core/src/error-codes.ts`. Verify: `npm test -- packages/core/src/error-codes`.
- [ ] 9.11 [REFACTOR] `calculator/index.ts` + barrel (`defineCalculator`, types). Verify: `npm run test:coverage && npm run mutation`.
- [ ] 9.12 Exit: SX1 to SX7.

---

## PR 10 — Contract: run + material contract (`feat/foundation-10-contract-run-data`)

Forecast: ~340 changed lines. Specs: calculator-contract (pure compute, run, result shape, language-free), i18n-catalog (key derivation, core side), material-data-contract. `packages/data` becomes a coverage-governed package (≥ 90).

Planned commits: `feat(core): add calculator run with result-shape enforcement` · `feat(core): derive i18n message keys from calculators` · `feat(data): add material record contract`.

- [ ] 10.1 Create branch from `main`.
- [ ] 10.2 [RED] `calculator/run.test.ts` with fixture-box `compute` (`area = len × len`, `cost = multiplyCount(prc, cnt)`): frozen validated inputs, two `compute` calls deeply equal, no frozen-object error [CC21]; spy `compute` never called for `run({ cnt: "x" })`, result `{ ok:false, errors:[{field:'cnt',code:'MALFORMED'}] }` [CC22]; `run({})` outputs `[ {key:'area', role:'primary', value:144 in2}, {key:'cost', role:'secondary', value:usd(747/50)} ]` [CC23]; `INVALID_RESULT` thrown for a compute (cast) that omits `cost`, returns `area` as a length, returns `cost` as a quantity, emits warning `'nope'`, returns `qty = -1n`, returns `qty` as a `number`, or adds an undeclared output key; a shopping line with `qty 0n` is accepted [CC24]. [GREEN] `calculator/run.ts`, `define.ts` attaches `run`. Verify: `npm test -- packages/core/src/calculator/run`.
- [ ] 10.3 [RED] Language-free: `collectStrings(result)` helper (`__testing__/`) over `fixtureBox.run({})`; every string matches `^[a-z][A-Za-z0-9._-]*$`, is a canonical Rational string, or is `USD`; none contains whitespace, `<`, `>` [CC25]. [GREEN] helper (should pass; spot-check by injecting `"<b>"` into a fixture result). Verify: same folder.
- [ ] 10.4 [RED] `calculator/message-keys.test.ts` and `message-keys.test-d.ts`: `messageKeysOf(fixtureBox)` contains `calc.fixture-box.title`, `calc.fixture-box.inputs.len`..`prc`, `calc.fixture-box.options.sel.x`, `calc.fixture-box.options.sel.y`, `calc.fixture-box.outputs.area`, `...outputs.cost`, `calc.fixture-box.warnings.bigCount` and nothing else [IN4]; `MessageKeysOf<typeof fixtureBox>` is the matching literal union; a rectangle-area-shaped definition yields exactly title + 2 inputs + 3 outputs (the full 6-key set is re-asserted against the real calculator in PR 12) [IN3a]. [GREEN] `calculator/message-keys.ts`. Verify: `npm test -- packages/core/src/calculator/message-keys && npm run typecheck`.
- [ ] 10.5 [RED] `packages/data/src/material.test.ts`: plywood sheet (`id 'plywood-sheet'`, `nameKey 'material.plywood-sheet.name'`, unit `{ id:'sheet', nameKey:'material.plywood-sheet.units.sheet', size: 32 ft2 }`, `source { name:'Manufacturer catalog', retrieved:'2026-10-22' }`) is returned with equal content, deeply frozen (record, `purchaseUnits`, unit, `source`; mutation attempt throws in strict mode), and `valueIn(size, in2) = 4608` [MD1]; rejections: `'Plywood'` → `INVALID_ID`, `'plywood.name'` → `INVALID_NAME_KEY`, `[]` → `NO_PURCHASE_UNITS`, duplicate unit ids → `DUPLICATE_UNIT_ID`, `0 ft2` and negative → `NON_POSITIVE_SIZE`, missing or empty-name source → `MISSING_SOURCE`, `'2026-02-30'` and `'22/10/2026'` → `INVALID_SOURCE_DATE`; also `INVALID_UNIT_ID` (`'Sheet'`), `INVALID_UNIT_NAME_KEY` (`material.plywood-sheet.units.board` for unit `sheet`), date edge cases (`2024-02-29` valid, `2100-02-29` and `2026-13-01` and `2026-00-10` invalid, `2000-02-29` valid; integer calendar arithmetic, no `Date`) [MD2]; `material.test-d.ts`: `size: 32` is a compile error [MD3]; exports test: enumerating the package entry's runtime exports yields only `defineMaterial` [MD4]. [GREEN] `packages/data/src/material.ts`, `index.ts` (`MaterialRecord`, `PurchaseUnit`, `MaterialSource`, `defineMaterial`); data imports core only through `@maestro-calc/core`. Verify: `npm test -- packages/data && npm run typecheck`.
- [ ] 10.6 [REFACTOR] Barrel exports `messageKeysOf`, `MessageKeysOf`; confirm lint passes for the `data → core` edge and rejects `data → i18n`; coverage core 100 / data ≥ 90. Verify: `npm run lint && npm run test:coverage && npm run mutation`.
- [ ] 10.7 Exit: SX1 to SX7 (workspace contract from PR 5 re-run covers MD5).

---

## PR 11 — URL codec (`feat/foundation-11-url-codec`)

Forecast: ~380 changed lines. Specs: url-state-codec, money (URL value), quality-gates/i18n (`ALL_ERROR_CODES`). The released-snapshot test starts empty; entries arrive in PR 12.

Planned commits: `feat(core): add strict url value parsers and url issue codes` · `feat(core): add url encode` · `feat(core): add url decode with versioning` · `test(core): add url round-trip and fuzz properties and released-key contract harness`. Contingency: split `11a` (11.2-11.5) / `11b` (11.6-11.9).

- [ ] 11.1 Create branch from `main`.
- [ ] 11.2 [RED] `error-codes.test.ts`: `URL_ISSUE_CODES = ['INVALID_VALUE','UNSUPPORTED_VERSION']`; `ALL_ERROR_CODES` is exactly the 12 distinct user-facing codes (10 field + 2 URL) in a stable order; type `AllErrorCode` equals the union. [GREEN] extend `error-codes.ts`, add `url/` codes. Verify: `npm test -- packages/core/src/error-codes`.
- [ ] 11.3 [RED] `url/url-values.test.ts`: length/percent/money accept only `-? digits ( / digits )?` (`127/2`, `150`, `24/2 → 12`, `498/100 → 249/50`, `1/0` invalid, `5'`, `63.5in`, `4.98`, `$5`, `1 m`, empty, `+1` invalid); count `^[0-9]+$` (`007 → 7`, `-1`, `1.5`, `1e3`, `9007199254740992` invalid); select exact option id; boolean only `1`/`0` (`true` invalid); raw length > 256 invalid; then bounds/options through the shared `checkConstraints` (`-1` and `1201` and `2401/2` invalid for fixture `len`; `1200` valid). [GREEN] `url/url-values.ts`. Verify: `npm test -- packages/core/src/url/url-values`.
- [ ] 11.4 [RED] `url/codec.test.ts` encode with fixture-box: default → `v=1`, metric → `v=1&u=m` [UC1]; `cnt 7 → v=1&b=7`, `pct 25/2 → v=1&c=25/2`, `flg → v=1&e=1`, `sel 'y' → v=1&d=y`, `len 63.5 in → v=1&a=127/2`, `prc usd(37/100) → v=1&f=37/100`, and the full state in declaration order `v=1&a=127/2&b=7&c=25/2&d=y&e=1&f=5` [UC2]; `len = 1 ft` equals the default so `v=1` [UC3]; `1 m` with metric → `v=1&u=m&a=5000/127` [UC4]; `len 0 in → v=1&a=0` and an inline calculator with boolean default `true` and value `false` includes `e=0` [UC5]; money `$0.37` encodes as `37/100` and decodes to exactly `usd(37/100)` [MN10]; output contains only `[0-9a-z/=&-]` and never `%`. [GREEN] `url/codec.ts` `encode` (custom serializer). Verify: same folder.
- [ ] 11.5 [RED] decode: `v=1&a=127/2&b=7&c=25/2&d=y&e=1&f=5` → full state, `imperial`, no issues [UC6]; `a=24`, `?a=24`, `""`, `v=1` [UC7]; `127%2F2` and `127%2f2` [UC8]; `v=1&u=m&a=5` → metric and `len 5 in`, `u=x` → imperial + `INVALID_VALUE` on `u`, `u=m&u=i` → metric no issue [UC9]; `utm_source=x&A=5&zz=1&v=1&b=7` → `cnt 7`, no issues [UC10]; `v=1&a=abc&b=101&c=-1&d=z&e=true&f=4.98` → all defaults with issues for `a,b,c,d,e,f` in order, and `v=1&a=abc&b=7` → one issue [UC11]; `a=5'`, `a=63.5in`, `f=$5` default with one issue each [UC12]; `a=-1`, `1201`, `1/0`, `2401/2`, `f=-1`, `f=10001` default + issue, `a=1200` valid [UC13]; `a=24/2&b=007&c=25/2&f=498/100` → `12 in, 7, 12.5, usd(249/50)` no issues [UC14]; `a=`, `a=` + 257 digits, `a=1%zz` [UC15]; `b=5&b=7` → 5 [UC16]; `+` not special; percent-encoded keys decode; a query with only `v=1&u=m`. [GREEN] `decode` (first-wins, `decodeURIComponent` in `try`, 256 cap). Verify: same folder.
- [ ] 11.6 [RED] Versioning: `v=2&b=7`, `v=0&b=7`, `v=01&b=7`, `v=&b=7`, `v=abc&b=7`, `v=2&u=m` → all defaults, `imperial`, exactly one `{ code:'UNSUPPORTED_VERSION', key:'v' }` [UC17]; a huge value: a no-`max` length calculator with `a=` + 200 × `1` + `/3` (204 chars) decodes, re-encodes to the identical string, and the `%2F3` variant re-encodes with a literal `/` [UC18]. [GREEN] decoder registry `{ 1: decodeV1 }`. Verify: same folder.
- [ ] 11.7 [RED] `url/codec.property.test.ts`: random valid fixture-box states (negatives where permitted, zero, thirds, sub-cent money, both unit systems) satisfy `decode(encode(x,{unitSystem:s})) ≡ (x,s)` with no issues; a no-`max` calculator covers values beyond 64 bits [UC19]; for any query string (arbitrary garbage), `decode` never throws, the state satisfies all descriptor constraints, and `encode(decode(q)…)` is a fixed point of decode-then-encode [UC20]. [GREEN] fix defects found. Verify: `npm test -- packages/core/src/url`.
- [ ] 11.8 [RED] `__testing__/released.ts` harness `compareReleased(snapshot, calculators): string[]` with `url/released.contract.test.ts` holding `const RELEASED: readonly ReleasedField[] = []` (kept empty until PR 12) plus harness tests on synthetic data: renaming `l` to `len` fails [UC21]; changing a `length` default `120` to `144` fails [UC22]; appending field `h` with a default passes and an old link without `h` decodes to the default [UC23]; removing a tuple and a vanished calculator fail; `options` required for `select` tuples only. [GREEN] harness. Verify: `npm test -- packages/core/src/url/released`.
- [ ] 11.9 [REFACTOR] `url/index.ts` + barrel (`encode`, `decode`, `RESERVED_URL_KEYS`, `ALL_ERROR_CODES`). Verify: `npm run test:coverage && npm run mutation`.
- [ ] 11.10 Exit: SX1 to SX7.

---

## PR 12 — Proof calculator, i18n, web wiring (`feat/foundation-12-proof-calculator`)

Forecast: ~380 changed lines (overflow rule applies: split `12a` core calculator + snapshot (12.2-12.7) / `12b` i18n + web (12.8-12.12)). Specs: calc-rectangle-area, i18n-catalog, url-state-codec (released snapshot), monorepo-workspace (web smoke), quality-gates (full chain).

Planned commits: `feat(core): add rectangle-area calculator` · `test(core): register rectangle-area in released url snapshot` · `feat(i18n): add translator and en/es catalogs` · `feat(web): register calculators and add i18n contract and smoke tests`.

- [ ] 12.1 Create branch from `main`.
- [ ] 12.2 [RED] `calculators/rectangle-area/rectangle-area.test.ts` metadata and defaults: inputs `length` (`l`, `120 in`, `defaultUnit ft`, `metricDefaultUnit m`, min `0`, max `100000 ft`) and `width` (`w`, same) in order; outputs `areaFt2` primary `{ft2, decimal, 2}`, `areaYd2` secondary `{yd2, decimal, 2}`, `areaM2` secondary `{m2, decimal, 2}`; no warnings, `retiredUrlKeys []` [RA1]; defaults `{}` (case F) → `100 ft2`, `100/9 yd2`, `145161/15625 m2` [RA4]. A helper expresses each output in its display unit via `valueIn(q, findUnit('area', display.unit))`. [GREEN] `calculators/rectangle-area/rectangle-area.ts` (`defineCalculator`, `compute` multiplies in canonical inches and returns three area quantities), `index.ts`. Verify: `npm test -- packages/core/src/calculators`.
- [ ] 12.3 [RED] Cases through `run`: A `{length:"10'", width:"12' 6\""}` → `125`, `125/9`, `145161/12500`; B `3' 6"` × `2'` → `7`, `7/9`, `1016127/1562500`; C `5' 3-1/2"` × `2'` → `127/12`, `127/108`, `6145149/6250000` [RA2]; D `3 m` × `2 m` → `3125000/48387`, `3125000/435483`, `6` [RA3]; E `10'` × `2 m` → `25000/381`, `25000/3429`, `762/125` [RA3]; G `0` × `10'` → all `0` [RA5]; unit-less feet: `{length:"10", width:"12.5"}` → `areaFt2 = 125` [RA6]; metric `{3,2}` equals D, `{length:"10'", width:"2"}` metric equals E [RA7]; H `100000'` × `100000'` → `10000000000`, `10000000000/9`, `929030400`, and `100001'` → `{ field:'length', code:'ABOVE_MAX' }` [RA8]. [GREEN] fix as needed. Verify: same folder.
- [ ] 12.4 [RED] Invalid inputs alone: `{length:"-1"}`, `{width:"abc"}`, `{length:"1/0"}`, `{width:"5 furlongs"}`, `{length:""}`, `{length:"1e9"}`, `{length:"999999999999999999 ft"}`, `{width:"10,5"}`, `{length:"10 ft2"}` → `BELOW_MIN`, `MALFORMED`, `ZERO_DENOMINATOR`, `UNKNOWN_UNIT`, `EMPTY`, `MALFORMED`, `ABOVE_MAX`, `DECIMAL_COMMA`, `UNKNOWN_UNIT` on the named field, no result [RA9]. Verify: same folder.
- [ ] 12.5 [RED] Shape and properties: outputs keys exactly `areaFt2`, `areaYd2`, `areaM2` in order with roles primary/secondary/secondary, each an area `Quantity`, `shopping` and `warnings` empty; all strings language-free (reuse `collectStrings`) [RA10]; `rectangle-area.property.test.ts` for random valid lengths: swap invariance, `areaYd2 × 9 = areaFt2` (in display units), `areaM2 = areaFt2 × 381/1250 × 381/1250`, non-negative [RA11]. Verify: same folder.
- [ ] 12.6 [RED] URL for the calculator + released snapshot: `{length:150 in}` encodes `v=1&l=150`; `127/2` × `24` encodes `v=1&l=127/2&w=24`; case D under metric encodes `v=1&u=m&l=15000/127&w=10000/127` [RA12]; decode `v=1&l=150`, `v=1&l=abc&w=24` (default `l` + one `INVALID_VALUE` for `l`), `l=150&w=24&utm_source=x`, `v=1&u=m&l=127%2F2` give the specified states [RA13]; fill `RELEASED` in `url/released.contract.test.ts` with `{ calculatorId:'rectangle-area', key:'length', urlKey:'l', kind:'length', default:'120' }` and `{ ..., key:'width', urlKey:'w', ... default:'120' }` and register the calculator so the harness runs for real [UC21-UC23 applied]. [GREEN] none beyond wiring. Verify: `npm test -- packages/core/src`.
- [ ] 12.7 [REFACTOR] Confirm the `@maestro-calc/core/calculators/*` export subpath works and that `core/src/index.ts` never re-exports calculators (test asserts the barrel has no `rectangleArea`). Verify: `npm run lint && npm run typecheck`.
- [ ] 12.8 [RED] i18n tests: `translate.test.ts`: `"Max {max} items"` with `{max:"100"}` → `Max 100 items`, with `{}` (cast) throws `MISSING_PARAM`, with `{max:"{x}", extra:1}` → `Max {x} items` [IN8]; unknown key (cast) throws `MISSING_MESSAGE` with no locale fallback [IN7]; `translate.test-d.ts`: `t('calc.rectangle-area.nope')` is an error, params typed from placeholders (`t('errors.BELOW_MIN')` requires `{min}`) [IN5]; `catalog.test-d.ts`: an `es` fixture missing or adding a key relative to `en` is a compile error naming the key via `as const satisfies CatalogOf<typeof en>` [IN2, IN9a]; `catalogs.contract.test.ts`: for every `en` module key the `es` key exists, both non-empty without surrounding whitespace, identical placeholder-name sets, no `es`-only keys, no stray braces; a fixture pair `"Max {max}"` / `"Máximo"` fails the placeholder check [IN9b, IN10]. [GREEN] `i18n/src/translate.ts` (`createTranslator`, `CatalogOf`, `ParamsOf`, error codes `MISSING_MESSAGE`/`MISSING_PARAM`), `index.ts`. Verify: `npm test -- packages/i18n && npm run typecheck`.
- [ ] 12.9 [RED then GREEN] Catalog content `catalogs/{en,es}/{common,rectangle-area}.ts` (flat dotted keys, `{name}` placeholders, ES via `as const satisfies CatalogOf<typeof en>`): exact labels `calc.rectangle-area.title` Rectangle Area / Área de un rectángulo, `inputs.length` Length / Largo, `inputs.width` Width / Ancho, `outputs.areaFt2` Area (square feet) / Área (pies cuadrados), `outputs.areaYd2` Area (square yards) / Área (yardas cuadradas), `outputs.areaM2` Area (square meters) / Área (metros cuadrados), `errors.DECIMAL_COMMA` per spec [IN6]. Common error messages (authored here; only `{min}` in `BELOW_MIN` and `{max}` in `ABOVE_MAX`): `EMPTY` Enter a value. / Ingrese un valor.; `MALFORMED` This value is not valid. / Este valor no es válido.; `ZERO_DENOMINATOR` A fraction cannot have zero as its denominator. / Una fracción no puede tener cero como denominador.; `UNKNOWN_UNIT` Unit not recognized. Use ft, in, yd, m, cm, or mm. / Unidad no reconocida. Use ft, in, yd, m, cm o mm.; `TOO_LONG` The value is too long. / El valor es demasiado largo.; `TOO_LARGE` The number is too large. / El número es demasiado grande.; `BELOW_MIN` The value must be at least {min}. / El valor debe ser al menos {min}.; `ABOVE_MAX` The value must be at most {max}. / El valor debe ser como máximo {max}.; `UNKNOWN_OPTION` Choose one of the available options. / Elija una de las opciones disponibles.; `INVALID_VALUE` A value in the link was not valid and was replaced by the default. / Un valor del enlace no era válido y se reemplazó por el valor predeterminado.; `UNSUPPORTED_VERSION` This link uses an unsupported version, so default values were used. / Este enlace usa una versión no compatible, por lo que se usaron los valores predeterminados. Test (RED first, in `catalog-content.test.ts`): `t` over `{...esCommon, ...esRectangleArea}` returns the exact table; `{min}`/`{max}` rule holds and other errors have no placeholders. Verify: `npm test -- packages/i18n && npm run test:coverage` (i18n ≥ 90).
- [ ] 12.10 [RED] Web registry and contract tests: `apps/web/src/lib/calculators.test.ts` computes case A through `@maestro-calc/core/calculators/rectangle-area` (`areaFt2 = 125`) and renders `t('calc.rectangle-area.title')` as `Área de un rectángulo` with `t = createTranslator({ ...esCommon, ...esRectangleArea })` imported via `@maestro-calc/i18n/catalogs/es/*` [RA15, MW12]; `i18n-contract.test-d.ts`: `MessageKeysOf<typeof rectangleArea>` and `` `errors.${AllErrorCode}` `` extend the EN key unions; `i18n-contract.test.ts`: iterates `calculators.ts`, `messageKeysOf(calc)` equals exactly `calc.rectangle-area.title`, `.inputs.length`, `.inputs.width`, `.outputs.areaFt2`, `.outputs.areaYd2`, `.outputs.areaM2` plus the twelve `errors.<CODE>` keys [IN3, RA14], all present in `en` and `es` with matching placeholder sets, `errors.BELOW_MIN` contains `{min}`, `errors.ABOVE_MAX` contains `{max}`; negative case with a synthetic calculator whose output key has no entry: the `missingKeys` helper reports that key by name [IN11]; and every `calculators.ts` entry appears in the released snapshot (soft check recorded as follow-up if not automated). [GREEN] `apps/web/src/lib/calculators.ts`, the contract helper, and a smoke import in `apps/web/src/pages/index.astro` (renders the default area via the package entry points). Verify: `npm test -- apps/web && npm run typecheck`.
- [ ] 12.10b [REFACTOR] Remove the PR 1 spike probe line (`Locales: ...`) from `apps/web/src/pages/index.astro`; the web smoke test now proves consumption (PR 1 Judgment Day suggestion). Files: `apps/web/src/pages/index.astro`. Verify: `npm run build`.
- [ ] 12.11 [REFACTOR] Full-chain proof and hygiene: `npm run verify` (format:check, sync, lint, typecheck, test:coverage, build) exits 0 [MW11, MW15, QG3, QG5]; `npm run mutation` ≥ 90; `fd -t d dist packages` empty [MW11]; `rg -n "src/lib/(engine|units|format|types)" --glob '!openspec/**' --glob '!node_modules/**'` empty [MW4]; `git status --porcelain` clean after the run [MW16]; coverage report: core 100, data and i18n ≥ 90.
- [ ] 12.12 Exit: SX1 to SX7. After merge, hand off to `sdd-verify` for the change; the tracked follow-ups (mutation `break` to 95, Stryker TypeScript checker, locale-aware decimals, automated snapshot completeness) are recorded in `design.md` Open Questions and stay out of this change.

---

## Traceability: spec scenario → task

Scenario IDs below are assigned in this document (spec order). "App" = applied/asserted at the cited task; where a scenario is split across slices, every task is listed.

### exact-rational

| ID | Scenario | Task(s) |
|----|----------|---------|
| ER1 | Parser failure shape | 3.8 |
| ER2 | Reduction (6/8) | 3.5 |
| ER3 | Sign moves to the numerator | 3.5 |
| ER4 | Zero is unique | 3.5 |
| ER5 | Zero denominator | 3.5 |
| ER6 | Unsafe or fractional number input | 3.5 |
| ER7 | Floating-point trap (0.1 + 0.2) | 3.6, 3.8 (ER7b) |
| ER8 | Unlike denominators | 3.6 |
| ER9 | Multiplication reduces | 3.6 |
| ER10 | Division | 3.6 |
| ER11 | Thirds are exact | 3.6 |
| ER12 | Division by zero | 3.6 |
| ER13 | Huge operands stay exact | 3.6 |
| ER14 | Ordering | 3.6 |
| ER15 | Properties hold | 3.11 |
| ER16 | Floor and ceil of halves | 3.7 |
| ER17 | Integers fixed | 3.7 |
| ER18 | Decimal tenths | 3.8 |
| ER19 | Negative with trailing zero | 3.8 |
| ER20 | Leading-dot and integer | 3.8 |
| ER21 | Negative zero | 3.8 |
| ER22 | Long decimal exactness | 3.8 |
| ER23 | Malformed decimals | 3.8 |
| ER24 | Comma separators | 3.8 |
| ER25 | Canonical output | 3.9 |
| ER26 | Non-reduced input accepted and normalized | 3.9 |
| ER27 | Invalid canonical text | 3.9 |
| ER28 | Zero denominator text | 3.9 |
| ER29 | Nearest double | 3.10 |
| ER30 | Huge numerator and denominator | 3.10 |
| ER31 | JSON guard | 3.10 |
| ER-conv | Failure conventions (`Result`, `CoreError` with `code`) | 3.3 |

### units-quantities

| ID | Scenario | Task(s) |
|----|----------|---------|
| UQ1 | Dimension in the type | 4.7 |
| UQ2 | Runtime exponent vector | 4.2, 4.4, 5.3 (UQ2b) |
| UQ3 | Millimetre definition of the inch | 4.4 |
| UQ4 | Metre to feet | 4.4 |
| UQ5 | Foot to metre | 4.4 |
| UQ6 | Yard to metre | 4.4 |
| UQ7 | Cubic yard and cubic foot | 4.4 |
| UQ8 | Square metre to square feet | 4.4 |
| UQ9 | Mass conversions | 5.3 |
| UQ10 | Density as a derived dimension | 5.4 |
| UQ11 | Metric density | 5.4 |
| UQ12 | Table factor audit | 4.3 (UQ12a), 5.2 |
| UQ13 | Round trip across yd3 and ft3 | 4.4 |
| UQ14 | Round trip property (28 units) | 4.4 (UQ14a, 18 units), 5.6 |
| UQ15 | Exact thirds of a foot | 4.4 |
| UQ16 | Addition across units | 4.5 |
| UQ17 | Negative and zero | 4.5 |
| UQ18 | Runtime dimension guard | 4.5, 5.4 (UQ18b) |
| UQ19 | Length times length | 4.6 |
| UQ20 | Area times length | 4.6 |
| UQ21 | Inverse operation | 4.6 |
| UQ22 | Mass over volume | 5.4 |
| UQ23 | Division by zero quantity | 4.6 |
| UQ24 | Unnamed product rejected | 4.6 (UQ24a runtime), 4.7 (UQ24b), 5.4 (UQ24c), 5.5 (UQ24d) |
| UQ25 | Known and unknown ids | 4.3 (UQ25a), 5.3 (UQ25b) |

### fraction-format

| ID | Scenario | Task(s) |
|----|----------|---------|
| FF1 | Tie at 1/128 inch rounds away from zero | 6.2 |
| FF2 | Directed modes on ties and non-ties | 6.2 |
| FF3 | Non-power-of-two denominator | 6.2 |
| FF4 | Invalid denominators | 6.2 |
| FF5 | Idempotence and symmetry properties | 6.2 |
| FF6 | Decimal table | 6.3 |
| FF7 | No negative zero in decimals | 6.3 |
| FF8 | Places boundaries | 6.3 |
| FF9 | Exact integers do not overshoot | 6.4 |
| FF10 | Fractions round up | 6.4 |
| FF11 | Negative rejected | 6.4 |
| FF12 | Mixed number | 6.5 |
| FF13 | Carry at the foot boundary | 6.5 |
| FF14 | Rounding carries across inch and foot | 6.5 |
| FF15 | Zero | 6.5 |
| FF16 | Negative values | 6.5 |
| FF17 | No negative zero | 6.5 |
| FF18 | Exact feet and large values | 6.5 |
| FF19 | Reduced fractions and non-binary denominators | 6.5 |
| FF20 | Directed modes (format) | 6.5 |
| FF21 | Thirds of a foot | 6.5 |
| FP1 | Equivalent spellings of 63.5 inches | 7.6 |
| FP2 | Feet only, inches only, bare numbers | 7.5 (FP2), 7.6 (FP2b) |
| FP3 | Signs and unicode minus | 7.6 |
| FP4 | Whitespace tolerance | 7.6 |
| FP5 | Inches beyond 11 and large feet | 7.6 |
| FP6 | Metric and other units | 7.5 |
| FP7 | Exactness (no rounding in parse) | 7.5 |
| FP8 | Empty and too long | 7.3 |
| FP9 | Zero denominator | 7.5 |
| FP10 | Huge digit runs | 7.4, 7.5 |
| FP11 | Unknown unit | 7.4 |
| FP12 | Comma rejected with a dedicated code | 7.3 |
| FP13 | Malformed inputs | 7.7 |
| FR1 | Property-based round trip | 7.9 |
| FR2 | Idempotent formatting | 7.9 |

### money

| ID | Scenario | Task(s) |
|----|----------|---------|
| MN1 | Price times count | 8.2 |
| MN2 | Sub-cent amounts stay exact | 8.2 |
| MN3 | Count from the purchase ceiling | 8.2 |
| MN4 | Price per square foot times area | 8.4 |
| MN5 | Price applies across units of the same dimension | 8.4 |
| MN6 | Mismatched dimension | 8.4 |
| MN7 | Cents table | 8.3 |
| MN8 | Accepted spellings | 8.5 |
| MN9 | Rejections | 8.5 |
| MN10 | URL value is exact | 11.4 |
| MN-mix | Money not mixable with quantities (requirement text) | 8.2 |

### calculator-contract

| ID | Scenario | Task(s) |
|----|----------|---------|
| CC1 | Descriptor metadata is queryable | 9.5 |
| CC2 | Input type inference | 9.2 |
| CC3 | Duplicate URL key | 9.4 |
| CC4 | Reserved URL keys | 9.4 |
| CC5 | Invalid default | 9.4 |
| CC6 | Bad identifiers, units, and bounds | 9.4 |
| CC7 | Output declarations | 9.4 |
| CC8 | No inputs | 9.4 |
| CC9 | Empty record yields defaults | 9.6 |
| CC10 | Full valid record | 9.9 |
| CC11 | Count edge cases | 9.8 |
| CC12 | Length bounds are inclusive | 9.7 |
| CC13 | Length parser errors surface | 9.7 |
| CC14 | Metric input to a length field | 9.7 |
| CC15 | Unit system selects the default unit | 9.7 |
| CC16 | Percent edge cases | 9.8 |
| CC17 | Money edge cases | 9.8 |
| CC18 | Select and boolean | 9.8 |
| CC19 | Multiple errors in declaration order | 9.9 |
| CC20 | Unknown keys and undefined | 9.6 |
| CC21 | Determinism and non-mutation | 10.2 |
| CC22 | Validation failure short-circuits compute | 10.2 |
| CC23 | Ordered outputs | 10.2 |
| CC24 | Result shape enforcement | 10.2 |
| CC25 | Language-free results | 10.3, 12.5 |
| CC26 | Core manifest (no non-core dependencies) | 5.7 |

### url-state-codec

| ID | Scenario | Task(s) |
|----|----------|---------|
| UC1 | All defaults | 11.4 |
| UC2 | Single and combined fields | 11.4 |
| UC3 | Equal value, different spelling is omitted | 11.4 |
| UC4 | Metric input canonicalizes to inches | 11.4 |
| UC5 | Zero and non-default boolean false | 11.4 |
| UC6 | Round trip of a full state | 11.5 |
| UC7 | Missing version and empty query | 11.5 |
| UC8 | Encoded slash accepted | 11.5 |
| UC9 | Unit-system preference | 11.5 |
| UC10 | Unknown keys ignored | 11.5 |
| UC11 | Invalid values default individually | 11.5 |
| UC12 | User-input spellings rejected | 11.5 |
| UC13 | Out-of-range and zero denominator | 11.5 |
| UC14 | Non-canonical but valid values | 11.5 |
| UC15 | Empty, overlong, and malformed-escape values | 11.5 |
| UC16 | Duplicate keys | 11.5 |
| UC17 | Unsupported versions | 11.6 |
| UC18 | Huge value within the length cap | 11.6 |
| UC19 | Property-based round trip | 11.7 |
| UC20 | Fuzzed queries never throw | 11.7 |
| UC21 | Registry guards existing keys | 11.8, 12.6 |
| UC22 | Default change rejected | 11.8, 12.6 |
| UC23 | Additive change allowed | 11.8, 12.6 |

### calc-rectangle-area

| ID | Scenario | Task(s) |
|----|----------|---------|
| RA1 | Metadata | 12.2 |
| RA2 | Mixed imperial feet-inch-fraction (A, B, C) | 12.3 |
| RA3 | Metric and mixed units (D, E) | 12.3 |
| RA4 | Defaults (F) | 12.2 |
| RA5 | Zero dimension (G) | 12.3 |
| RA6 | Unit-less numbers are feet (imperial) | 12.3 |
| RA7 | Unit-less numbers are metres (metric) | 12.3 |
| RA8 | Maximum bounds (H) | 12.3 |
| RA9 | Invalid inputs | 12.4 |
| RA10 | Result shape | 12.5 |
| RA11 | Consistency properties hold | 12.5 |
| RA12 | Encoding | 12.6 |
| RA13 | Decoding links | 12.6 |
| RA14 | Catalog completeness for the calculator | 12.10 |
| RA15 | Web smoke import | 12.10 |

### i18n-catalog

| ID | Scenario | Task(s) |
|----|----------|---------|
| IN1 | Locale list | 2.3 |
| IN2 | Missing Spanish key is a compile error | 12.8 |
| IN3 | Convention for the proof calculator | 10.4 (IN3a), 12.10 |
| IN4 | Option keys | 10.4 |
| IN5 | Compile-time keys | 12.8 |
| IN6 | Exact labels | 12.9 |
| IN7 | Unknown key at runtime | 12.8 |
| IN8 | Interpolation | 12.8 |
| IN9 | Missing Spanish key fails the build | 12.8 (IN9a type gate, IN9b test) |
| IN10 | Placeholder mismatch fails | 12.8 |
| IN11 | Calculator without labels fails | 12.10 |

### material-data-contract

| ID | Scenario | Task(s) |
|----|----------|---------|
| MD1 | Valid plywood sheet | 10.5 |
| MD2 | Rejections | 10.5 |
| MD3 | No float amounts | 10.5 |
| MD4 | Empty registry | 10.5 |
| MD5 | Dependency direction | 5.7, 10.6 |

### quality-gates

| ID | Scenario | Task(s) |
|----|----------|---------|
| QG1 | Warning fails the gate | 2.5, 2.6 |
| QG2 | `any` in core | 2.5, 2.6 |
| QG3 | Clean tree | 2.5, 2.7, 12.11 |
| QG4 | Unformatted file | 2.5, 2.7 |
| QG5 | No lint/format fight | 2.7, 12.11 |
| QG6 | Type error fails the gate | 2.10 (a) |
| QG7 | Unused expect-error | 2.10 (b) |
| QG8 | Core below 100 fails | 2.10 (d) |
| QG9 | Ignore pragma forbidden | 2.5, 2.6 |
| QG10 | Other packages at 90 | 2.10 (e) |
| QG11 | Score below break | 3.15 |
| QG12 | Score at threshold | 3.15 |
| QG13 | Equivalent gate on fallback | 3.14 (conditional) |
| QG14 | Gate failure blocks | 2.8, 2.9, 2.10 (f) |
| QG15 | Mutation job always runs incrementally | 3.16 |
| QG16 | Least privilege | 2.8, 3.16 |
| QG17 | Bot configuration | 2.8, 2.9 |

### monorepo-workspace

| ID | Scenario | Task(s) |
|----|----------|---------|
| MW1 | Clean install from lockfile | 1.12 |
| MW2 | Workspace enumeration | 1.2, 1.12, 5.7 |
| MW3 | Moves are detected as renames | 1.3 |
| MW4 | Legacy library is gone | 1.2, 1.4, 12.11 |
| MW5 | Forbidden edge fails lint | 2.5, 2.6 (MW5b graph: 5.7) |
| MW6 | Core has no runtime dependencies | 5.7 |
| MW7 | Deep import rejected | 2.5, 2.6 |
| MW8 | DOM reference rejected by the type checker | 2.10 (c) |
| MW9 | DOM reference rejected by lint | 2.5, 2.6 |
| MW10 | Nondeterminism rejected | 2.5, 2.6 |
| MW11 | Web build consumes workspace source | 1.9, 1.10, 5.7 (MW11b), 12.11 |
| MW12 | Web smoke import executes core | 12.10 |
| MW13 | Compiler options inherited | 1.12, 5.7 |
| MW14 | Single TypeScript version | 1.12, 5.7 |
| MW15 | Baseline check is green | 1.2, 1.12, 5.7 (MW15b), 12.11 |
| MW16 | Ignored artifacts | 1.5, 1.12, 3.17, 12.11 |

Coverage check: every scenario of all 11 capabilities has at least one task; the one conditional entry is QG13 (only if the Stryker spike fails). Scenarios proven by manual negative proof (QG6-QG8, QG10, MW8) are also guarded structurally by later type tests, thresholds, and CI config.

---

## Risks and Notes for the Orchestrator

- R1 Slices at the cap: PR 2 (370), 3 (380), 4 (370), 7 (390), 9 (390), 11 (380), 12 (380). Each names a split point; use `NNa`/`NNb` stacked PRs instead of seeking a `size:exception`.
- R2 Design deviations introduced to keep slices green and TDD-honest (none change observable behavior): root `tsconfig.json` arrives in PR 2, not PR 1 (nothing for it to include yet); `ALL_ERROR_CODES` completes in PR 11 (PR 9 ships `FIELD_ERROR_CODES`); `numRuns` reads `__STRYKER__` injected by `vitest.config.ts` `define` because core code and types cannot reference `process`; `messageKeysOf` lives in `calculator/message-keys.ts`; gate and workspace contract tests live in `apps/web/src/contract/` (web is the composition root and may use Node); the workspace contract test ships in PR 5 purely for slice balance.
- R3 Spec wording conflict (money): "any digit run longer than 18 digits fails `TOO_LARGE`" versus "any number of fractional digits is accepted". Task 8.5 applies the 18-digit cap to every run, consistent with `parseLength` and the design; request a spec clarification if the maintainer prefers uncapped fractional digits.
- R4 Bootstrap exceptions to RED-first: PR 1 (no test runner exists; verified by npm commands) and the `locales` test in PR 2 (characterization of PR 1 spike code). Both are called out in their PR bodies.
- R5 Spikes with explicit stop conditions: Astro SSR source-TS (PR 1, tasks 1.9/1.10; failure after the `noExternal` fallback blocks the chain) and Stryker 10 + vitest 5 (PR 3, tasks 3.13/3.14; fallback keeps an equivalent blocking gate).
- R6 Type-aware `ESLint.lintText` on virtual paths may not work with `projectService`; task 2.5 includes the on-disk fixture fallback.
- R7 Strict ordering: PRs 4-8 all touch `packages/core/src/index.ts` (barrel lines); merge strictly in order to avoid conflicts.
