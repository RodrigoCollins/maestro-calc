# Apply progress: foundation-monorepo-core-engine

## PR 1 (split into 01a + 01b by the slice-overflow rule)

Mode: strict TDD, bootstrap exception (no test runner yet; verified by npm commands per tasks.md).

Branches (stacked): `feat/foundation-01a-remove-legacy` then `feat/foundation-01b-skeleton`.
Tasks done: 1.1-1.12 (1.10 not needed). Pending: 1.13 (reviews, PR bodies).

Baseline (1.2, before changes): `npm query .workspace` -> `[]`; `npm run check` -> astro prompts to install `@astrojs/check typescript` (fails); `git ls-files src/lib` -> 4 files.

Gates on final tree: `npm ci` ok; `npm ls --workspaces` clean; `npm query .workspace` -> 4 names; `npm ls typescript` -> single 6.0.3; `npm run check` 0 errors; `npm run build` ok; no `packages/*/dist`; strict flags all true in each package and web `--showConfig`.

Spike: Astro SSR resolved `@maestro-calc/i18n` source TS via symlink: yes. Fallback used: none (`dist/index.html` renders `Locales: en, es`).

Size (excl. lockfile): 01a = 361 deletions; 01b = 141 insertions + 19 deletions vs 01a. Original single PR was 521 (> 400), hence the split. Renames shown `R100` for all moved files.

Deviations: split into 01a/01b; commit order changed (legacy removal first); `vitest` pinned 5.0.5; TS resolved 6.0.3; `@astrojs/sitemap` moved to web deps; web tsconfig `types` = `astro/client`, include narrowed to `src/**/*` and `astro.config.mjs`.

## PR 2 (split into 02a + 02b + 02c by the slice-overflow rule)

Mode: strict TDD (`npm test`). Branches (stacked, each from the previous tip): `feat/foundation-02a-vitest-prettier` -> `feat/foundation-02b-eslint-gates` -> `feat/foundation-02c-ci-docs` (alias `feat/foundation-02-quality-gates` = scratch tip with all commits in original order, not for PR).
Tasks done: 2.1-2.11 including 2.10b. Pending: 2.12 (reviews SX5/SX6, PR bodies, 2.10(f) draft-PR proof).

### TDD Cycle Evidence

| Task | RED | GREEN | REFACTOR |
|------|-----|-------|----------|
| 2.3 locales | `locales.test.ts` written first; vitest defaults pick it up with no projects, so it passed immediately (characterization; spec said it would fail, it cannot) | projects wiring in 2.4 | n/a |
| 2.4 vitest projects | n/a (config) | `npm test -- packages/i18n` passes; `npm run test:coverage` exits 0 | `--passWithNoTests` removed (2.10b) |
| 2.5 gates contract | 21 of 22 failed (no `eslint.config.js`); one failure mode corrected: virtual file paths are unknown to the type-aware project service, so probes run the repo config with `disableTypeChecked` (documented in the test) | `eslint.config.js`, `prettier.config.js`, `lint` script: 36 tests pass; spot check: removing `istanbul ignore` term fails exactly that test | n/a |
| 2.8 CI contract | file missing (ENOENT suite failure) | `ci.yml`, `dependabot.yml`: 43 tests pass | n/a |
| manifest contract (key order, strict flags, source purity) | characterization of existing config; spot checks: reordering `scripts` in data fails the order test, `exactOptionalPropertyTypes:false` in core fails the strict test, `types:["node"]` in `tsconfig.src.json` fails the purity test | n/a | n/a |

### Work Unit Evidence

| Evidence | Value |
|---|---|
| Focused tests | `npm test -- apps/web/src/contract packages/i18n` -> 43 tests pass on 02c tip |
| Runtime harness | `npm run verify` exit 0 (format:check, sync, lint, typecheck, test:coverage, build) |
| Rollback | config-only: revert 02a/02b/02c commits; no product code |

### Negative proofs (2.10, run on final tree)

- (a) length-like arg to area-like param: `TS2345 Argument of type 'Area' is not assignable to parameter of type 'Length'`, typecheck non-zero.
- (b) stale `@ts-expect-error`: `TS2578 Unused '@ts-expect-error' directive`, non-zero.
- (c) `document.title` in core: `TS2584 Cannot find name 'document'`; `process.env` in core: `TS2591 Cannot find name 'process'`; ESLint also reports `no-restricted-globals`.
- (d) core function with an untested branch: `ERROR: Coverage for branches (50%) does not meet "packages/core/src/**" threshold (100%)`, exit 1.
- (e) i18n below 90: `ERROR: Coverage for lines (62.5%) does not meet "packages/i18n/src/**" threshold (90%)`, exit non-zero.
- (f) deliberately failing draft PR in CI: deferred to PR opening (no push permitted in apply).

### Size (excl. lockfile, `git diff -M --numstat`)
Superseded by the correction round below; original single-PR measure 734 (> 400), forecast 370.

### Deviations
- Split into 02a/02b/02c (the tasks.md contingency alone, moving dependabot, was insufficient).
- Package `tsconfig.json` is a solution config over `tsconfig.src.json` (types `[]`, tests excluded: the purity gate) and `tsconfig.test.json` (Node typings); see design.md "Design deviation applied in PR 2 review round 1".
- Gate probes run with type-aware linting disabled (virtual paths); the full type-aware run is `npm run lint` over the real tree. Task fallback (disk fixtures) not needed.
- `eslint.config.js`: `@eslint/js` recommended added (devDependency), import-x uses the node resolver (`resolver-next`).
- `packageManager: npm@11.6.1` added; canonical manifest key order enforced by a contract test (includes `engines`, `packageManager`, `workspaces`).
- Root `tsconfig.json` uses `allowJs` without `checkJs` (task 2.14), `skipLibCheck` (a transitive `type-fest` import is unresolved in `eslint-import-context` types; commented in the file).
- Prettier reformatted `apps/web/src/pages/index.astro` (tabs to spaces, 24 lines) and some package files; `.prettierignore` excludes `openspec/`, `docs/`, `PLAN.md`.

### PR 2 correction round 1 (4-lens review, strict TDD)

History of the unpushed stack was rewritten (R-06): vitest, tsconfig split and `@types/node` arrive in the vitest commit, prettier in its own commit (no quote churn), `packageManager` in the manifest-contract commit, each tool's devDependencies in the commit that configures it. Every commit is green for the gates that exist at that commit. Old tips kept locally as `backup/02{a,b,c}-old`.

Applied: M1, M2, and MINORs risk R1 (audit acceptance below), R2, R3, R5, R6; resilience R1-R6; readability R-02, R-03, R-05, R-07 to R-11; reliability R2, R3, R4, R6. Deferred: reliability R7 `checkJs` (task 2.14, 02b is at the cap).

| Finding | RED | GREEN |
|---|---|---|
| M1 tsconfig layout | solution-style `tsconfig.json` made 4 strict-flag tests fail (old per-package config assumption); sensitivity probe: `types: ["node"]` in `tsconfig.src.json` fails 5 manifest tests | `tsconfig.src.json`/`tsconfig.test.json`/`tsconfig.app.json`; new type-check probes (`console`, `process`, `URLSearchParams` fail to compile in a core source program) |
| M2 purity bypass | 7 gate probes failed (`reference types="node"`, `reference lib="dom"`, `globalThis`/`self`/`global`, extensions, test support) | `triple-slash-reference` rule, global-object aliases, extension globs, `ignores: testGlobs` for purity |
| R4 coverage fallback | global-threshold test failed | `...ninety` at top level of `thresholds`; per-package glob test |
| CI/dependabot MINORs | 6 ci contract tests failed | `ci.yml`, `dependabot.yml`, `verify` mirrors CI steps (asserted) |

Negative probes on the final tree: `/// <reference types="node" />` + `globalThis.process.env` and `/// <reference lib="dom" />` + `HTMLElement` in `packages/core/src` fail `eslint` (`@typescript-eslint/triple-slash-reference`, `no-restricted-globals`). `console.log(1)` in `packages/core/src` fails `npm run typecheck` (`TS2584 Cannot find name 'console'`) and also fails lint: projectService resolves the file through the solution config to `tsconfig.src.json`, so `console` is unresolved (`no-unsafe-call`, `no-unsafe-member-access`).

npm audit: 5 high, dev-only lint chain, GHSA-vfj7-8cjw-p6xm, no patched version, accepted, revisit on eslint-plugin-astro/astro-eslint-parser bump (same text goes in the PR bodies).

Sizes (excl. lockfile, `git diff -M --numstat <base>...<tip>`): 02a 395, 02b 400, 02c 368 (includes these docs).

### PR 2 Judgment Day round 2 (final bounded round, slice 02d-lint-hardening)

Applied: 1-8 plus suggestions B8, B9 (task 2.15). Deferred: A-7 (task 2.16, suggestions budget). Each item had a failing contract test first.

| Id | RED | GREEN |
|---|---|---|
| 1 | 3 tests: widening cast passed lint (rule absent; `disableTypeChecked` turns it off, so the probe uses a type-aware instance on an on-disk path) | `no-unsafe-type-assertion` for package sources, tests excluded |
| 2 | mutating core threshold to 99 now fails (value assertions) | values asserted; `.DS_Store` filtered |
| 3 | `lint` still carried `--cache` | `lint` uncached, `lint:fast` cached |
| 4, 5 | 6 undeclared-dependency probes on `.mts/.cts/.tsx/.js/.mjs/.cjs` and `src/x.config.ts` purity passed lint | `tooling/workspaces.js` derivation, full extension list, root-only config globs |
| 6 | 5 formatter probes passed | name and computed-value selectors |
| 7, 8 | 18 probes (ambient, 12 globals, `__testing__`) passed | ambient selectors (core merges them into `corePurity`, because per-block `no-restricted-syntax` replaces), host globals, per-package import blocks with `**/__testing__` |

Negative probes on the tip (real `eslint` on temporary files, removed afterwards): widening cast in core and data `@typescript-eslint/no-unsafe-type-assertion`; `x.config.ts` with `Math.random()` `no-restricted-properties`; `toPrecision` `no-restricted-syntax`; `x["toFixed"](2)` `no-restricted-syntax`; ambient `declare const process` `no-restricted-syntax`; `console` `no-restricted-globals`; `./__testing__/x.ts` import `no-restricted-imports`; round 1 triple-slash `@typescript-eslint/triple-slash-reference` plus `no-restricted-globals`. B8: `const bad: number = 'x'` in `apps/web/src/pages/index.astro` makes `npm run typecheck` exit 1 (`ts(2322)`).

## PR 3 (split into 03a to 03f by the slice-overflow rule)

Mode: strict TDD, runner `npm test`. Stacked branches, each branched from the previous tip, none pushed:

| Branch | Tasks | Base | Changed lines (excl. lockfile) |
|---|---|---|---|
| `feat/foundation-03a-followups-result-support` | 3.0, 3.2-3.4 | `main` | 230 (after round 1; was 213) |
| `feat/foundation-03b-rational-core` | 3.5-3.7 | 03a | 332 |
| `feat/foundation-03c-decimal-codec-lossy` | 3.8-3.10 | 03b | 346 (was 310) |
| `feat/foundation-03d-properties-barrels` | 3.11-3.12 | 03c | 210 (was 148) |
| `feat/foundation-03e-mutation-gate` | 3.13-3.16 | 03d | 332 (was 322) |
| `feat/foundation-03f-mutation-hardening` | 3.18 | 03e | 362 |

### TDD Cycle Evidence

| Task | Test file | Layer | Safety net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| 3.0 F1-F4 | `gates.contract.test.ts`, `workspaces.contract.test.ts` | Contract | 140/140 | 9 failed (ambient class/enum/namespace/module, `packageGlobs`), then 2 more for the `.d.ts` probes | 146/146, lint clean | 3 package counts, 4 ambient forms | F4 is a hygiene split of glob lists, not observable by a probe (config unchanged for 3 packages) |
| 3.3 | `result.test.ts`, `errors.test.ts` | Unit | N/A (new) | module not found | 5/5 | success and failure shapes, reason present or absent | `declare readonly reason?` keeps the property absent |
| 3.4 | `property-runs.test.ts` | Unit | 150/150 | module not found | passes with and without `STRYKER=1` | both modes run | none needed |
| 3.5 | `rational.test.ts` | Unit | N/A (new) | module not found | 13/13 | ER2-ER6 with 2-5 inputs each | none needed |
| 3.6 | `rational.test.ts` | Unit | 13/13 | 12 failed | 25/25 | ER7-ER14, negatives and zero | none needed |
| 3.7 | `rational.test.ts` | Unit | 25/25 | 7 failed | 32/32 | ER16, ER17 plus `-1/2` | floor via modulo (3.15) |
| 3.8 | `decimal.test.ts` | Unit | 256 baseline | module not found | 35/35 | ER1, ER18-ER24, ER7b | sign and point handled by `BigInt` (3.15) |
| 3.9 | `rational.test.ts` | Unit | 35/35 | 27 failed | 94/94 | ER25-ER28 plus round trip | none needed |
| 3.10 | `rational.test.ts` | Unit | 94/94 | 7 failed (JSON guard passed by accident on bigint, so its own message is asserted) | 67/67 | ER29-ER31, range edges | single shift formula (3.15) |
| 3.11 | `rational.property.test.ts` | Property | 256/256 | characterization; spot check: removing `gcd` made 3 properties fail with a printed seed and counterexample, restored | 7/7 | 1000 runs per property, parts above 2^64 | none needed |
| 3.12 | `index.test.ts` | Unit | 263/263 | 2 failed (empty barrel) | 2/2, core coverage 100/100/100/100 | exports list and wiring | none needed |
| 3.13-3.15 | `mutation.contract.test.ts`, Stryker | Gate | 265/265 | first run 9.84 percent (vacuous, see spike) | 100 percent after killing 16 survivors | 1 pragma on the `isNegative` helper hides 2 equivalent-or-shadowed mutants (round 1; was 5 lines) | see Deviations |
| 3.16 | `ci.contract.test.ts` | Contract | 13/13 | 3 failed | 16/16 | job shape, cache key, save on main only | none needed |

Totals: 276 tests passing at the 03e tip (140 before PR 3).

### Work Unit Evidence

| Evidence | Value |
|---|---|
| Focused tests | `npm test -- packages/core/src/rational` 119 passed; `npm test -- apps/web/src/contract` 155 passed |
| Runtime harness | `npm run verify` exit 0 on every tip (tests 154, 186, 256, 265, 276); `npm run mutation` on 03e: score 100.00 (197 killed, 8 timeouts, 0 survived), 1 min 9 s cold, about 2 s when the report is reused (superseded by round 1) |
| Rollback | per branch: revert its commits; 03e removes `stryker.config.json`, the `mutation` scripts and the `mutation` CI job; 03f replaces the config by `stryker.config.mjs` and hardens the CI job |

### Spike: Stryker 10 with vitest 5 (tasks 3.13, 3.14)

- Result: incompatible. `@stryker-mutator/vitest-runner@10.0.0` (newest release) ran, printed a score and exited 1, but the score was vacuous: 9.84 percent, 229 survivors including `ok = () => ({})`.
- Cause (verified with a script against the vitest node API): in mutant runs the runner restricts tests with `testNamePattern` built from `suite name + ' ' + test name`; vitest 5 matches the full name joined with ` > `, so no test is selected, none fails (`testsCompleted: 0` in the JSON report). Mutant activation itself works (a probe test saw `ok={}` under the active mutant). `coverageAnalysis: off` does not avoid the filter. Debug logging also crashes the runner (`Converting circular structure to JSON` on vitest 5 config).
- Fallback: F1 unavailable (no newer runner), so F2: `testRunner: command`, `npx vitest run` in the sandbox, `coverageAnalysis: off`, same thresholds. `@stryker-mutator/vitest-runner` removed from devDependencies.
- Consequence for incremental mode: the command runner reports no test files, so Stryker reused stale survivors after tests were added. The core script therefore passes `--incrementalFile reports/stryker-incremental-<hash of src, config, vitest config>.json`, and CI restores the report on an exact key hit only (no `restore-keys` fallback).
- Negative proof [QG11]: moving `rational.test.ts` away made `npm run mutation` exit 1 (`score 68.29 under breaking threshold 90`). [QG12] the 90 to 94 band is not reproduced: the real suite scores 100 (high band); the thresholds are asserted by `mutation.contract.test.ts`.

### Deviations

- Slice plan: five stacked branches instead of the `03a/03b` contingency (the group is about 1,150 lines).
- `arbitraries.ts` moved from 3.4 to 3.11 (needs `Rational`).
- `Rational.ZERO` and `Rational.ONE` are static members; `Rational` methods `compare` and `sign` return `-1 | 0 | 1`.
- Mutation gate lands in 03e only; 03a to 03d have no `mutation` script (nothing to mutate before `Rational`).
- fast-check resolved to `4.10.2` (`^4.10.2`); Stryker `10.0.0` exact.
- Equivalent `<=` mutants of the sign test are suppressed by ONE pragma, `// Stryker disable next-line EqualityOperator`, on the private `isNegative` helper that every sign test routes through (round 1 replaced five scattered pragmas). The pragma ignores every EqualityOperator mutant on that line, so exactly 2 mutants are ignored: `<=` (equivalent: no caller passes zero where it matters, and `-0n` is `0n`) and `>=` (hidden with it). Earlier text said five equivalent mutants; the precise count was ten possible hidden mutants over five lines.
- Task 3.17 (SX3-SX7) is pending for every branch: reviews, Judgment Day and PRs belong to the orchestrator; CI mutation job could not run (no push). Task 3.0 F4 has no observable probe.
- Risk: the command runner reruns the whole core suite per mutant, so mutation time grows with core (about 70 s now); the CI job has `timeout-minutes: 30`.

### PR 3 correction round 1 (4-lens review, all pass; task 3.18)

Mode: strict TDD. Applied M1, M2, M3 and the MINORs R1-R6, RES-3 to RES-6, RD-2 to RD-11; each new enforcement had a failing test first (pre-change measurements below). Branches stay stacked: owner-branch fixes were folded into 03a-03d and 03e by `--fixup` plus `GIT_SEQUENCE_EDITOR=true git rebase -i --autosquash --update-refs`; 03e would have reached 499 lines, so the gate hardening is a new slice `feat/foundation-03f-mutation-hardening` on top of 03e. History is local and unpushed.

| Id | RED | GREEN |
|---|---|---|
| M1 | `mutation.contract` could not load `stryker.config.mjs` (module not found); `ci.contract` failed 3 tests (shared key, superset, upload) | `stryker.config.mjs` hashes sorted `src/**`, itself, `vitest.config.ts`, `tsconfig*.json` and the lockfile once with `node:crypto`; `ignorePatterns ["reports"]`; plain `stryker run`; CI key computed in one step and shared by restore and save |
| M2, M3 | contract assertions for timeouts, concurrency and the command failed against the old command | `timeoutMS 30000`, `timeoutFactor 4`, `concurrency 3`; `STRYKER=1 npx --no-install vitest run --no-file-parallelism --typecheck.enabled=false` |
| R1 | 1025-character inputs were parsed (decimal and fromString) | `MAX_PARSE_LENGTH = 1024` in `rational/limits.ts`; 1024 accepted, 1025 `MALFORMED`; JSDoc preconditions; spec NOTE |
| R2 | probe: an added `Stryker disable next-line all` and a barrel with `export const` made both new tests fail | contract test: exactly 1 pragma, `next-line EqualityOperator` with a reason, barrels contain only `export … from` |
| R3 | arbitrary shares measured before: zero 0.4 percent, small numerator 11.6, small denominator 13.3 | weighted `oneof` (numerators 1 zero, 2 small, 7 huge; denominators 3 small, 7 huge); `arbitraries.test.ts` asserts the shares |
| RES-4 | seed was `undefined` under `STRYKER=1` | `fc.configureGlobal({ seed: STRYKER_SEED, numRuns })` only under `__STRYKER__` |
| R5, RES-3 | n/a (refactor, existing tests as net) | one `isNegative` helper and one pragma; 2 ignored mutants |
| R4, R6, RD-2 to RD-11 | n/a (mechanical or documentation) | `toBe(0.1)`; spec wording; compare message with `String(i)`/`String(j)` (the template needs strings for lint, and 03b has no `toString`); `*_PARSE_CODES` exported `as const` arrays and `*ParseCode`/`*ParseError` names; comments; AGENTS.md; design rows; commit retitled to `test(core): suppress equivalent EqualityOperator mutants and pin toNumber boundaries` |
| RES-5 | `ci.contract` failed (no upload step) | `actions/upload-artifact@cf430e0… # v7.0.2` (tag verified with `gh api repos/actions/upload-artifact/git/ref/tags/v7.0.2`, a commit object) with `if: failure()` on `packages/core/reports/mutation` |
| RES-6 | n/a | design Open Questions lists the three pins and the trigger; follow-up task 3.19 |

Deferred: none. Deviation: M1 asked for a job-level `env` cache key; GitHub does not expose `runner` or `hashFiles` there, so one step writes `STRYKER_CACHE_KEY` to `$GITHUB_ENV` (recorded in design.md). RD-2 uses indices instead of values for the message because 03b's `Rational` has no `toString` yet.

Gate results (`npm run verify`, exit 0 on every tip): 03a 155 tests, 03b 187, 03c 259, 03d 271, 03e 282, 03f 289; core coverage 100/100/100/100.

Mutation, before (03e as first implemented) and after (03f tip, cold, `reports/` removed):

| | Score | Killed | Timeouts | Survived | Ignored | Mutants run | Cold | Warm (report reused) |
|---|---|---|---|---|---|---|---|---|
| before | 100.00 | 197 | 8 | 0 | 5 pragma lines | 205 | 1 min 9 s | about 2 s |
| after | 100.00 | 198 | 8 | 0 | 2 | 206 of 208 | 3 min 0 s (3:01 wall) | 2.3 s (206 of 208 results reused) |

The 8 timeouts are the same count as before, all in `rational.ts` (the negative run listed the `gcd` arrow, its loop body, swap and `x * y` variants, and callers that then never terminate); with `timeoutMS 30000` and factor 4 they remain 8, so the generous budget did not change the count. Cold time grew (serial runs, three workers) and stays far under the 30-minute job limit.

Negative proof [QG11] on the 03f tip: `rational.test.ts` moved away changes the input hash, so Stryker starts a fresh run: score 69.90 (137 killed, 7 timeouts, 62 survived), `Final mutation score 69.90 under breaking threshold 90`, exit 1 after 2 min 47 s; the file was restored and the tree is clean.

PR description text (spec scenario "Equivalent gate on fallback" [QG13]): "Stryker 10.0.0 with `@stryker-mutator/vitest-runner@10.0.0` (the newest release) cannot drive vitest 5.0.5: the runner restricts mutant runs with a `testNamePattern` built from names joined by a space, while vitest 5 matches names joined by ` > `, so no test runs and every mutant survives (9.8 percent, a vacuous score). The gate therefore uses Stryker's `command` test runner over the whole core suite (`coverageAnalysis: off`) with the same thresholds (95/90/90). The command runner cannot report changed tests, so the incremental report file is named after a hash of all inputs and CI restores it on an exact key hit only. Revisit when a Stryker release supports vitest 5."

## PR 4 (split into 04a to 04e by the slice-overflow rule)

Mode: strict TDD, runner `npm test`. Stacked branches, each branched from the previous tip, none pushed. Scope per the orchestrator: tasks 4.0-4.8 plus the mass and density work of tasks 5.2-5.6 and 5.8 (PR 5 keeps 5.1, 5.7 and 5.9). Task 4.9 (SX1-SX7) is pending for every branch: reviews, Judgment Day and PRs belong to the orchestrator.

| Branch | Tasks | Base | Changed lines (excl. lockfile) | `npm run verify` tests |
|---|---|---|---|---|
| `feat/foundation-04a-followups` | 4.0, 4.1 | `main` | 196 | 294 |
| `feat/foundation-04b-dimension-catalog` | 4.2, 4.3 | 04a | 391 | 326 |
| `feat/foundation-04c-quantity-conversion` | 4.4 | 04b | 229 | 343 |
| `feat/foundation-04d-ops-derived` | 4.5-4.7 | 04c | 336 | 365 |
| `feat/foundation-04e-mass-density-barrel` | 4.8, 5.2-5.6, 5.8 | 04d | 400 | 386 |

### TDD Cycle Evidence

| Task | Test file | Layer | Safety net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| 4.0 A3/B3, A5/B5, A4/B4, A2/B6 | `mutation.contract.test.ts` | Contract | 289/289 | 7 failed (identity list, CI-key equality, prune function missing, root script, pragma count, `STRYKER=0` flag) | 294/294 | `STRYKER` 1, 0, empty, unset; prune keeps current and foreign files; missing directory | `isNegative` is `value <= -1n`, zero pragmas |
| 4.0 A6/B1 | `index.test.ts` | Unit | 289/289 | 2 failed (exports list, code arrays) | passes | both arrays plus the `DECIMAL_COMMA` boundary between `fromString` and `parseDecimal` | none needed |
| 4.2 | `dimension.test.ts`, `dimension.test-d.ts` | Unit, type | N/A (new) | module not found | 7/7 | 8 names, 6 vector sums or differences, unnamed vectors, type negative proof (a wrong `toEqualTypeOf` fails typecheck) | `Step` chain replaced 26 table lines |
| 4.3 | `catalog.test.ts` | Unit | N/A (new) | module not found | 31/31 | 18 table rows, squares and cubes, lookup hits and misses | none needed |
| 4.4 | `quantity.test.ts`, `units.property.test.ts` | Unit, property | 326/326 | module not found | 49/49 | UQ2-UQ8, UQ13, UQ15 (conversion half), negatives and zero, property over 18 units | spot checks below |
| 4.5, 4.6, 4.7 | `ops.test.ts`, `ops.test-d.ts` | Unit, type | 343/343 | module not found | 71/71, typecheck clean | UQ15-UQ21, UQ23, UQ24, runtime guards per op, 6 derived types, 3 rejected products | none needed |
| 4.8, 5.2-5.6, 5.8 | `catalog.test.ts`, `quantity.test.ts`, `ops.test.ts`, `ops.test-d.ts`, `units.property.test.ts`, `index.test.ts` | Unit, type, property | 365/365 | 21 failed (mass and density constants missing), then 2 for the barrel | 91/91 units, 386/386 full | UQ9-UQ11, UQ22, UQ25b, UQ18b, UQ24c, 28-unit audit and properties | none needed |

Spot checks: setting the `ft` factor to 11 fails 10 catalog and conversion tests but NOT the properties (a round trip is linear in the factor, so only the literal tables and conversions can see a wrong factor; the task text expected the property to fail, which cannot happen). Replacing `canonical.div(unit.factor)` by `mul` in `valueIn` fails 9 tests including both properties with a printed seed and counterexample `[18446744073709551616]`. Type-level proof: changing an expected `toEqualTypeOf<'area'>()` to `'mass'` fails the vitest typecheck with the expected and actual literals.

All hand-verified values were re-computed with bigint fractions before use (38 checks).
### Work Unit Evidence

| Evidence | Value |
|---|---|
| Focused tests | `npm test -- packages/core/src/units` 91 passed; `npm test -- apps/web/src/contract/mutation packages/core/src/index` 19 passed |
| Runtime harness | `npm run verify` exit 0 on every tip; core coverage 100/100/100/100 (207 statements, 61 branches, 63 functions, 183 lines on the 04e tip). Mutation on the 04e tip: see below |

Mutation, 04e tip, cold (`reports/` pruned by the new config): score 100.00 (total and covered), 318 killed, 8 timeouts, 0 survived, 0 ignored (no pragma left), 326 mutants, 4 min 53 s wall (`time`: 499 s user, 198 percent cpu). The 8 timeouts are the same `rational.ts` `gcd` mutants as in PR 3. Per-file: catalog 58 killed, dimension 20, ops 24, quantity 15, rational 189 plus 8 timeouts. Intermediate: 04a 100.00 (201 killed), 04b 98.89 on the first run (3 survivors: `addVec`/`subVec` mass components and the empty mass and density placeholders) then 100.00 after two vector cases and a placeholder test, 04d 100.00 (301 killed, 4 min 39 s). Cold time is under the 10-minute trigger of follow-up 3.19b; `Step` returns the wide `number` outside `-6..6`, pinned by the `volume × volume` and `area × area` `never` tests.

### Deviations

- Mass and density units (5.2-5.6, 5.8) ship in this PR (slice 04e), as the orchestrator scoped PR 4; PR 5 shrinks to 5.1, 5.7, 5.9.
- Unit constants: `in` is reserved, so the inch is `inch`; the other ids are lower-case identifiers (`ft`, `m2`, `yd3`); density constants are camel case (`lbIn3`, `lbFt3`, `lbYd3`, `tonYd3`, `kgM3`).
- `Quantity<D>` is an exported interface (`exponents`, `canonical`, `[brand]`); the branded value is built by an internal frozen class with a `declare`d brand field and one internal factory `makeQuantity`, which is not in the barrel. A `declare const` brand would break the ambient-declaration ban, so the brand is `const brand: unique symbol = Symbol()`.
- `scale` and `divideScalar` take a `Rational` only, as the spec says "exact Rational".
- Task 4.0 A3/B3: the identity list hashes `.nvmrc` (not `process.version`), the whole package `*.json` set (adds `package.json`), `../../tsconfig.base.json` and `../../vitest.config.ts`. The new contract test asserts the config list EQUALS the files matched by the CI `hashFiles` globs (both directions), a stronger form of "covers every glob".

### PR 4 correction round 1 (4-lens review, all pass; task 4.10)

Mode: strict TDD. Applied M1, M2, M3 and every MINOR (RISK-2, RISK-3, R2, R3, R5, R6, RES-3, RES-4, RD-2 to RD-19); each new enforcement had a failing test or probe first. Deferred: none; follow-up 4.11 records RISK-1. Owner-branch fixes went into 04a, 04c and 04d (plain commits, later slices rebased with `git rebase --onto --update-refs`); 04b (391) and 04e (400) had no room, so the dimension and catalog fixes form the new slice `feat/foundation-04f-type-cost-and-hygiene`. `bf0ca02` was split into three work units (identity hash and prune, exact `STRYKER` flag, `isNegative` without a pragma). History is local and unpushed.

| Branch | Changed lines (excl. lockfile) | `npm run verify` tests |
|---|---|---|
| 04a | 293 | 297 |
| 04b | 391 | 329 |
| 04c | 241 | 346 |
| 04d | 352 | 368 |
| 04e | 400 | 389 |
| 04f | 363 | 396 |

| Id | RED | GREEN |
|---|---|---|
| M1 | `typecost.contract.test.ts`: `expected 1354888 to be less than 100000` | `infer … extends InRange` guard in `SumOf`/`DifferenceOf`; 16,272 instantiations. Broken `Step` or `Add` variants still fail 42 and 26 typecheck errors |
| M2 | contract pins for `timeoutMS 10000`, `concurrency 4` failed | config changed; 8 timeouts unchanged (below) |
| M3 | n/a (vacuous check) | real `Rational.ONE` plus an unbranded control; removing the brand reports TS2578 at that line |
| RISK-3, R2 | importing the config deleted a probe report; `sourceFilesIn` and `isStrykerEntry` missing | prune runs only for the `stryker` executable; dotfiles skipped in the list |
| RISK-2, R5, R6, RES-4 | `findUnit('__proto__')` threw; catalog not frozen; no pure annotations | frozen catalog, `Object.hasOwn` guard, float scan, `/* @__PURE__ */` pins |

Type cost (`npx tsc -p packages/core/tsconfig.src.json --noEmit --extendedDiagnostics`), before and after: types 187,715 to 4,934; instantiations 1,354,888 to 16,272; memory 347,393K to 47,216K; check time 1.14 s to 0.12 s.

Mutation, 04f tip, cold (`reports/` removed), before (04e tip, `timeoutMS 30000`, `concurrency 3`) and after:

| | Score | Killed | Timeouts | Survived | Mutants | Cold wall | Warm |
|---|---|---|---|---|---|---|---|
| before | 100.00 | 318 | 8 | 0 | 326 | 4 min 53 s | not measured |
| after | 100.00 | 321 | 8 | 0 | 329 | 3 min 13 s | 2.6 s (329 of 329 reused) |

The 8 timeouts are all in `rational.ts`: the `abs` arrow, the `gcd` loop block, array and `x * y` mutants, the `toBigInt` block, its `typeof` condition and equality, and the `isZero` condition; no new timeouts, so the shorter budget misclassified nothing. A stale `stryker-incremental-*.json` was pruned by a real run and survives a plain import. Negative proof [QG11]: `rational.test.ts` moved away gave score 86.63 (278 killed, 7 timeouts, 44 survived), exit 1 after 3 min 6 s; the file was restored and the tree is clean.

Bundle (Rolldown, minified, gzip -9): `import { ft }` 3,020 B (1,380 gzip) before and 2,340 B (1,125 gzip) after; full barrel 5,762 B (2,413 gzip) before and 6,607 B (2,467 gzip) after (freezing and the `findUnit` guard cost about 0.8 kB when everything is imported).

Accepted risk (RISK-1, also for the 04e and 04f PR bodies): `npm audit` reports dev-only findings through Stryker (`typed-rest-client` pulls an old `qs`, and 5 high `braces` findings that Dependabot #13 clears); none ships in the web bundle. Task 4.11 holds the fix at the next lockfile touch.

## PR 5 (slice `feat/foundation-05-followups-workspace`)

Mode: strict TDD, runner `npm test`. One branch from `main` (PRs 1 to 4 merged, 396 tests). Scope: tasks 5.0, 5.1 and 5.7 (mass and density, tasks 5.2-5.6 and 5.8, shipped in PR 4). Task 5.9 (SX1-SX7) is pending: reviews, Judgment Day and the PR belong to the orchestrator.

| Task | Test file | Layer | Safety net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| 5.0 B-2 | `typecost.contract.test.ts` | Contract | 396/396 | control tests for the count line | 3/3 | LF, CRLF, bare line, missing line; two programs (src 16,272, test 84,398) | `tsc` via `require.resolve` |
| 5.0 B-3 | `catalog.contract.test.ts` | Contract | 396/396 | `f(1_000.5)` was not noticed (1 failed) | 3/3 | `0.304_8`, `1_0e3`, clean controls | count from `Object.values(UNITS).flat()` |
| 5.0 B-5, A-3 | `mutation.contract.test.ts` | Contract | 396/396 | `packageJsonFiles is not a function` | 19/19 | dotfile json, directory named `nested.json`, wrong extension | `sourceFilesIn` by `Dirent.isFile()` |
| 5.0 A-1, A-2, B-4 | none (wording, design note, bookkeeping) | Docs | n/a | n/a | n/a | n/a | n/a |
| 5.7 | `workspace-graph.contract.test.ts` | Contract | 396/396 | n/a (characterization) | 19/19 | see spot checks | none needed |

Spot checks for 5.7 (each edit made to the real manifest, tests run, edit reverted): a `zod` dependency in core, `data` without its core edge, `web` without its i18n edge, `i18n` depending on core, `moduleResolution` `Node`, `strict` false, target ES2020, a test tsconfig without `extends`, `typescript` declared in `data`, `.nvmrc` 22, `engines` `>=20`, `check` not an alias, a core export ending `.js`, a `packages/core/dist` directory: every one failed exactly one test; changing the `workspaces` globs failed two.

Deviations:

- B-2 `\r?$`: unnecessary. With the `m` flag `$` already matches before a CR in JavaScript, so CRLF output parses as is; a control test pins it instead of changing the regex. The instantiation budget is 40,000 (baseline 16,272); the test program (`tsconfig.test.json`, 84,398) has its own budget of 150,000.
- A-1: Stryker allows `netTime * timeoutFactor + timeoutMS` per mutant run (2.3 s * 4 + 10 s, about 19 s); the earlier "10 s each" wording in `stryker.config.mjs`, the contract test comment and design.md is corrected. Values are unchanged. Past apply-progress text for PR 3 and PR 4 keeps its original numbers (they describe measurements, not the mechanism).
- A-3: `Dirent.isFile()` does not follow symlinks (the old `statSync` did); `src` holds none, and the CI `hashFiles` key remains a superset.
- 5.7: the file is `workspace-graph.contract.test.ts`, because `workspaces.contract.test.ts` already exists. Installed-tree single version (`npm ls typescript`) is checked as "the resolved `typescript` is 6.0.x" instead of spawning `npm ls`.

## PR 6 (split into 06a to 06c by the slice-overflow rule)

Mode: strict TDD, runner `npm test`. Stacked branches, each branched from the previous tip (06a from the PR 5 slice), none pushed. Scope per the orchestrator: the `fraction-format` rounding, decimal, purchase and feet-inch formatting requirements (tasks 6.1-6.6). The length parser (PR 7, tasks 7.1-7.11) and the format/parse round trip are NOT in this PR. Task 6.7 (SX1-SX7) is pending for every branch: reviews, Judgment Day and PRs belong to the orchestrator.

| Branch | Tasks | Base | Changed lines (excl. lockfile) | `npm run verify` tests |
|---|---|---|---|---|
| `feat/foundation-06a-rounding-kernel` | 6.1, 6.2 | PR 5 slice | 217 | 450 |
| `feat/foundation-06b-decimal-purchase` | 6.3, 6.4 | 06a | 266 | 478 |

### TDD Cycle Evidence

| Task | Test file | Layer | Safety net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| 6.2 | `rounding.test.ts`, `rounding.property.test.ts` | Unit, property | 418/418 | module not found (both files) | 32/32 | 11 rows x 3 modes (33 cells), ties in both signs, 8 invalid denominators, boundaries 2 and 64, multiples in every mode, 10^30 magnitudes, 5 properties over d in 2..64 | mutation run on 06b: the `'nearest'` default literal survived (any unknown mode fell through to nearest), so the kernel became a `Record<RoundingMode, …>` table where an unknown mode throws |
| 6.3 | `decimal-parts.test.ts` | Unit, property | 450/450 | module not found | 55/55 in the folder | 11 rows x 3 modes rendered as `[-]int.frac` plus exact parts for the spec examples, no negative zero in 3 modes and zero, places 0 and 12, 10^25 magnitude, 5 invalid places, one property (within half a unit, `places` digits) | none needed |
| 6.4 | `purchase.test.ts` | Unit, property | 450/450 | module not found | 60/60 in the folder | exact integers (125, 1, 10^30), fractions (7/2, 1/10^30, (10^30+1)/3), zero, 3 negatives, property `n >= x > n - 1` | none needed |

Spot check: dropping the sign restoration in `roundScaled` fails 9 tests (the negative table rows, the tie cases and the oddness property, which printed a seed and a shrunk counterexample).

All hand-verified values were re-computed with Python `fractions.Fraction` before use (33 table cells plus the magnitude cases).

