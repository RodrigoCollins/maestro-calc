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

Mutation, 04e tip, cold (`reports/` pruned by the new config): score 100.00 (total and covered), 318 killed, 8 timeouts, 0 survived, 0 ignored (no pragma left), 326 mutants, 4 min 53 s wall (`time`: 499 s user, 198 percent cpu). The 8 timeouts are the same `rational.ts` `gcd` mutants as in PR 3. Per-file: catalog 58 killed, dimension 20, ops 24, quantity 15, rational 189 plus 8 timeouts. Intermediate: 04a 100.00 (201 killed), 04b 98.89 on the first run (3 survivors: `addVec`/`subVec` mass components and the empty mass and density placeholders) then 100.00 after two vector cases and a placeholder test, 04d 100.00 (301 killed, 4 min 39 s). Cold local time was 4 min 53 s (the CI trigger of follow-up 3.19b is a CI wall time of 20 minutes, and CI runs 4.5 to 4.8 times slower than local, see PR 5/6 correction round 1); `Step` returns the wide `number` outside `-6..6`, pinned by the `volume × volume` and `area × area` `never` tests.

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
| `feat/foundation-06a-rounding-kernel` | 6.1, 6.2 | PR 5 slice | 223 | 450 |
| `feat/foundation-06b-decimal-purchase` | 6.3, 6.4 | 06a | 266 | 478 |
| `feat/foundation-06c-feet-inches` | 6.5, 6.6 | 06b | 286 | 496 |

### TDD Cycle Evidence

| Task | Test file | Layer | Safety net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| 6.2 | `rounding.test.ts`, `rounding.property.test.ts` | Unit, property | 418/418 | module not found (both files) | 32/32 | 11 rows x 3 modes (33 cells), ties in both signs, 8 invalid denominators, boundaries 2 and 64, multiples in every mode, 10^30 magnitudes, 5 properties over d in 2..64 | mutation run on 06b: the `'nearest'` default literal survived (any unknown mode fell through to nearest), so the kernel became a `Record<RoundingMode, …>` table where an unknown mode throws |
| 6.3 | `decimal-parts.test.ts` | Unit, property | 450/450 | module not found | 55/55 in the folder | 11 rows x 3 modes rendered as `[-]int.frac` plus exact parts for the spec examples, no negative zero in 3 modes and zero, places 0 and 12, 10^25 magnitude, 5 invalid places, one property (within half a unit, `places` digits) | none needed |
| 6.4 | `purchase.test.ts` | Unit, property | 450/450 | module not found | 60/60 in the folder | exact integers (125, 1, 10^30), fractions (7/2, 1/10^30, (10^30+1)/3), zero, 3 negatives, property `n >= x > n - 1` | none needed |
| 6.5 | `feet-inches.test.ts` | Unit, property | 478/478 | module not found | 77/77 in the folder | FF12-FF21 (every spec scenario, parts and text), negative and carry cases beyond the spec (`-23 1/2 in` is `-1' 11 1/2"`, `-12 in` is `-1' 0"`), 10^14 in, 5 invalid denominators, untyped area quantity, one property over modes (recomposition, `0 <= inches <= 11`, reduced fraction, no negative zero) | none needed |
| 6.6 | `index.test.ts` | Unit | 496/496 | 2 failed (export list, wiring) | 5/5 | exports list plus one wiring test through the barrel | none needed |

Spot check: dropping the sign restoration in `roundScaled` fails 9 tests (the negative table rows, the tie cases and the oddness property, which printed a seed and a shrunk counterexample).

All hand-verified values were re-computed with Python `fractions.Fraction` before use (33 table cells plus the magnitude cases).

Spot checks for 6.5: returning `whole + 1n` for a zero fraction fails 8 tests; the `whole === 0n` test replaced by `=== 1n` fails 5.

### Work Unit Evidence

| Evidence | Value |
|---|---|
| Focused tests | `npm test -- packages/core/src/format` 77 passed (5 files); `npm test -- packages/core/src/index` 5 passed |
| Runtime harness | `npm run verify` exit 0 on every tip (450, 478, 496 tests); core coverage 100/100/100/100 (253 statements, 90 branches, 72 functions, 226 lines on the 06c tip). Mutation: below. N/A for a runtime path: pure functions |
| Rollback boundary | `packages/core/src/format/*` and its two lines in `core/src/index.ts` (+ `index.test.ts`); nothing outside core changes |

Mutation, 06c tip, cold (`reports/` removed): score 100.00 (total and covered), 406 killed, 8 timeouts, 0 survived, 0 ignored, 414 mutants, 5 min 7 s wall (`time`: 942 s user, 355 percent cpu). The 8 timeouts are the same `rational.ts` mutants as in PR 3 and PR 4 (itemized there); no new timeout. Per-file: decimal-parts 27 killed, feet-inches 26, purchase 6, rounding 26, rational 189 plus 8 timeouts, units 120, other core files (`errors.ts` 5, `result.ts` 7) 12; the sum is 406 killed plus 8 timeouts = 414. The earlier 06b run (before the kernel table) scored 99.49 with 2 survivors, both the `'nearest'` default literal. Cold time grew from 3 min 13 s because every mutant reruns the whole suite (2.3 s, up from about 2 s). The trigger of 3.19b is a CI wall time of 20 minutes, not a local one; with CI 4.5 to 4.8 times slower than local, this tip projected to 18.7 to 20 min before the `--isolate=false` fix (PR 5/6 correction round 1).

Negative proof [QG11], 06c tip: with all five `format/*.test.ts` files moved away the score is 90.82 (index wiring still kills 47 of the 85 format mutants), so the gate stays green; with `index.test.ts` moved away as well the score is 79.47 (321 killed, 8 timeouts, 85 survived), `Final mutation score 79.47 under breaking threshold 90`, exit 1 after 4 min 15 s. The files were restored and the tree is clean.

All hand-verified values were re-computed with Python `fractions.Fraction` before use: the 11-row rounding table (33 cells), the 11-row decimal table (33 cells), the 16 feet-inch scenarios (FF12-FF21 including the directed modes) and the extra cases above.

### Scope and deviations (PR 6)

- Parser out of scope: `parseLength`, its scanner and the format/parse round trip are tasks 7.1-7.11 (PR 7) and are left for the next slice. The spec scenarios `Format/parse round trip` and everything under `Length text grammar` stay unimplemented here.
- `roundScaled` is exported from `rounding.ts` for `decimal-parts.ts` but not from the barrel (the same pattern as `makeQuantity`). It is a lookup table over `RoundingMode` guarded by `Object.hasOwn`, so an unknown mode throws `CoreError('INVALID_MODE')` instead of acting like `nearest` (the mutation run showed the fall-through; correction round 1 added the own-property guard).
- `roundToFraction`, `toDecimalParts` take `number` for `denominator` and `places` (the spec's invalid inputs include `2.5` and `NaN`), and `formatFeetInches` converts through `valueIn(length, inch)`, so an untyped non-length quantity throws `DIMENSION_MISMATCH`.
- The formatter returns `{ parts, text }` with exported types `FeetInches`, `FeetInchesParts`, `FeetInchesOptions`, `DecimalParts`, `RoundingMode`.


## PR 5/6 correction round 1 (4-lens review, all pass; task 6.8)

Mode: strict TDD. Applied M1 and every MINOR (RISK-1, RISK-2, R1, R2, R3, RD-1 to RD-11, RES-4, RES-6); each new enforcement had a failing test first. Deferred: none (RES-4 is a documented decision, no code). The stack was first rebased onto `origin/main` (`a4cca05`, a Dependabot bump touching `package.json` and the lockfile only). Fixes went into the branch that owns the file (fixup commits plus `git rebase -i --autosquash --update-refs`) and the Stryker, CI and docs changes into the new slice `06d`.

| Branch | Tip | Changed lines (excl. lockfile) | `npm run verify` tests |
|---|---|---|---|
| 05 | `6542b11` | 389 | 420 |
| 06a | `3687441` | 248 | 458 |
| 06b | `d5e5bb1` | 301 | 490 |
| 06c | `a5d5dd8` | 302 | 509 |
| 06d | see `git log` | 118 | 509 |

| Id | Branch | RED | GREEN |
|---|---|---|---|
| RISK-1 | 05 | `refuses a regular/dangling symlink in the identity set`: `sourceFilesIn` and `rootJsonFiles` returned without throwing | both throw `symlink in identity set: <path>` for any non-dotfile link |
| RD-3 | 05 | n/a (rename) | `packageJsonFiles` is `rootJsonFiles` in config and contract test |
| RD-5 | 05 | n/a (history) | commit `aa1c653` split into the identity-files refactor and `docs(repo): correct the Stryker timeout formula` |
| RD-8, RD-9 | 05 | n/a (refactor, tests stay green) | dead `dir !== '.'` filter dropped, `extendsBase` a hoisted const arrow using `relative()`, typecost count is checked once without `Number(count)` |
| RISK-2, R1 | 06a | `rejects mode "toString" / "constructor" / "__proto__" / "banana" / ""`: nothing thrown (inherited names crashed with `TypeError` or fell through) | `Object.hasOwn(ROUNDERS, mode)` in `roundScaled` throws `INVALID_MODE`; the denominator is still checked first. Spec and design code lists amended |
| R3 | 06b | characterization (green on arrival): the property now covers all three modes (`places` digits, nearest within half a unit, `down <= x <= up` at most one unit apart, nearest between) | none needed |
| RD-1, RD-2, RD-6, RD-7, RD-10, RD-11 | 06a to 06c | JSDoc, helper typing and test hygiene only | `INVALID_MODE` tests through `toDecimalParts` and `formatFeetInches` (green by construction through the shared kernel); `reduced` computed once; `Rational.of(127, 2)` inlined in `index.test.ts`; `RoundingMode` imported by the feet-inches helper with the `exactOptionalPropertyTypes` comment |
| R2 | 06d | the old `has no dist directory` check ran before any build and could never fail; new tests: `check:dist` script missing, CI step list without it | `check:dist` (`node --input-type=module -e` over `packages/*/dist`) runs in `verify` and CI after `npm run build`; 3 tests run the script in a temporary workspace (clean exits 0, `packages/core/dist` and `packages/data/dist` exit 1) |
| RES-6 | 06d | n/a (annotation) | `/* @__PURE__ */ Object.values(NAME_RECORD)` |
| M1 | 06d | contract pin for `--isolate=false` failed | command updated; numbers below |

Mutation, cold (`reports/` removed), same 418 mutants, before and after `--isolate=false`:

| | Score | Killed | Timeouts | Survived | Cold wall | CPU (user) |
|---|---|---|---|---|---|---|
| before (06c tip) | 100.00 | 410 | 8 | 0 | 296.99 s (4 min 57 s) | 920 s |
| after (06d tip) | 100.00 | 410 | 8 | 0 | 143.63 s (2 min 24 s) | 322 s |

The 8 timeouts are the same `rational.ts` mutants as before (the `abs` arrow at line 9, the `gcd` loop block, array and `x * y` at lines 14 and 15, the `toBigInt` block, `typeof` condition and equality at lines 31 and 32, and the `isZero` condition at line 122). Per-file at 418 mutants: decimal-parts 27, feet-inches 26, purchase 6, rounding 30 (four new `INVALID_MODE` mutants), rational 189 plus 8 timeouts, units 120, `errors.ts` 5, `result.ts` 7 (410 killed plus 8 timeouts).

CI numbers behind the decision (the CI trigger is a wall time of 20 min, not a local one): PR 3 tip 7.95 min (208 mutants, `concurrency 3`); PR 4 tip 14.87 min on `main` and 15.87 min on the PR (329 mutants, `concurrency 4`); CI is 4.5 to 4.8 times slower than local, so the 06c tip projected to 18.7 to 20 min before this fix. The cost per mutant is the vitest boot (one fork per test file), which `--isolate=false` removes; `concurrency 4` was neutral on the 4-vCPU runner, and `3` versus `4` must be re-measured on CI (follow-up in 3.19b, with `timeout-minutes` 45 as the interim guard).

Negative proof [QG11], 06d tip: with the five `format/*.test.ts` files and `index.test.ts` moved away the run scored 78.71 (321 killed, 8 timeouts, 89 survived), `Final mutation score 78.71 under breaking threshold 90`, exit 1 after 2 min 24 s. The files were restored (`git checkout`) and the tree is clean.

Work Unit Evidence: focused tests `npx vitest run packages/core/src/format apps/web/src/contract` green on every tip; runtime harness `npm run verify` exit 0 on every tip (table above) and `npm run mutation` on the 06d tip; rollback boundary per branch: revert its commits (06d removes `--isolate=false`, `check:dist` and the annotation, nothing else).

## PR 7 (split into 07a to 07e by the slice-overflow rule)

Mode: strict TDD, runner `npm test`. Stacked branches, each branched from the previous tip (07a from `main` at `403b0d4`), none pushed. Scope per the orchestrator: task 7.0 (PR 5/6 Judgment Day follow-ups) and the `parseLength` requirements of `fraction-format` (Length text grammar, Format/parse round trip), tasks 7.0-7.10. Task 7.11 (SX5 reviews, SX6 Judgment Day, PRs) belongs to the orchestrator. The forecast of ~390 lines would have fit one branch only without tests for the offsets and the whole MALFORMED table; the first cut (follow-ups plus scanner) measured 431 lines, so the stack was cut into five.

| Branch | Tasks | Base | Changed lines (excl. lockfile) | `npm run verify` tests |
|---|---|---|---|---|
| `feat/foundation-07a-followups` | 7.0, 7.1 | `main` | 61 (93 after round 1) | 509 (516) |
| `feat/foundation-07b-length-scanner` | 7.2, 7.4 | 07a | 371 (392) | 575 (583) |
| `feat/foundation-07c-length-parser-simple` | 7.3, 7.5 | 07b | 331 (328) | 653 (662) |
| `feat/foundation-07d-length-parser-compound` | 7.6, 7.7, 7.8 | 07c | 209 (306) | 730 (731) |
| `feat/foundation-07e-length-round-trip` | 7.9, 7.10 | 07d | 163 (219) | 737 (738) |

Commits (conventional, one work unit each, no attribution; subjects as rewritten in round 1): `refactor(repo): apply PR 5/6 judgment day follow-ups`, `feat(repo): reject raw irregular whitespace in TS and JS files`, `feat(core): add length scanner and pre-processing rules`, `feat(core): add length parser simple forms`, `feat(core): add length parser compound forms, signs and offsets`, `test(core): add format/parse round-trip properties, export parseLength`, and this docs commit.

### Design as built

`scanner.ts` does the pre-processing (128 cap, blank, comma) and one linear `matchAll` pass over a single regex (whitespace run, digit run, word `[A-Za-z]+[0-9]*`, any other single character), so there is no backtracking. Whitespace at either end is not emitted; every token keeps its index in the original text. `parser.ts` is a cursor over the tokens: every reader returns `undefined` when its part of the grammar does not match, `attempt` rewinds optional parts (the denominator of a fraction, the tail of a mixed number), and the cursor position at the end is the MALFORMED offset. The only other fault, a zero denominator, is recorded in `cursor.zeroAt`. Digits go through `BigInt` of scanner-validated ASCII runs (at most 18 digits each); there is no `number`, `parseFloat`, `parseDecimal` or float formatter. Feet and inches are added with `add(quantity(feet, ft), quantity(inches, inch))`, the sign with `negate`.

### TDD Cycle Evidence

| Task | Test file | Layer | Safety net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| 7.0 | `workspace-graph.contract.test.ts`, `mutation.contract.test.ts`, `rounding.test.ts` | Contract | 509/509 | the script tests failed once `check:dist` pointed at the file (script missing), then the success run asserted empty stderr | 509/509 | clean exits 0 with empty stderr; `packages/core/dist` and `packages/data/dist` exit 1 and name the directory | `scripts/*.mjs` joined the no-type-info lint block; docs only for B-1, B-2, A-3 |
| 7.2, 7.4 | `scanner.test.ts` | Unit | 509/509 | module not found | 66/66, then 575/575 in `verify` | 16 unit words x 3 spellings, 13 unknown-unit cases with offsets, 5 numeric-notation cases, 5 word-not-after-number cases, 5 unmapped characters (full-width digit, astral emoji, U+2003), 18 vs 19 digit runs including the fractional run, 128 vs 129 characters, precedence of the codes, edge versus inner whitespace | none needed |
| 7.3, 7.5 | `parser.test.ts` | Unit | 575/575 | module not found | 78/78 in the folder, 653/653 in `verify` | FP2 (8 rows), FP6 (7 spec rows plus 9 more), FP7, FP9 (4 offsets), FP10, 16 decimal/mark spellings, default unit | `1.` and `.` now consume the point and fail at the end of the input (a point must be followed by digits), which also made the `?? text.length` branch reachable and covered |
| 7.6, 7.7, 7.8 | `parser.test.ts` | Unit, fuzz | 653/653 | 51 failed (compound and sign forms) | 153/153 in the folder, 730/730 in `verify` | FP1 (8 spellings), FP2b (12), FP3 (11), FP4, FP5 plus an 18-digit feet value, 26 MALFORMED rows from the spec table each with a hand-counted offset, 13 more rejections (word feet without inch mark, fractional feet, hyphen separator not touching both neighbours, double signs), offsets from the untrimmed text, one fuzz property (never throws, one known code, a success is a length) | none needed |
| 7.9 | `length-parser.property.test.ts` | Property | 730/730 | characterization (green on arrival, as the task says) | 6/6 | FR1 over d in 2..64 with zero, small, full-range and boundary ticks; FR2 over the same texts; the three canonical texts; `83333333333333' 3 63/64"` at the bound | spot check: `divisor + 1n` in the fraction branch fails 3 tests (both properties and the bound case); restored |
| 7.10 | `index.test.ts` | Unit | 735/735 | 2 failed (export list, wiring) | 6/6 | export list plus one wiring test (spec example, `defaultUnit: cm`, an offset) | two mutants from the first mutation run killed: see below |

All expected values were recomputed with Python `fractions.Fraction` before use: the 12 unit conversions (`7500/127`, `50/127`, `1`, `36`, `6/5`, `18`, `60`, `5/254`, `12500/127`), `127/2`, `243/4`, `76801/64`, `61728394506172839/500000000000000000`, `1481481468148148137`, the bound text, and every offset was counted by hand on the quoted text (one count was wrong, `5-/2`, and the test run showed the rewind: offset 1, not 2).

### Work Unit Evidence

| Evidence | Value |
|---|---|
| Focused tests | `npx vitest run packages/core/src/format/length-parser` 227 passed (3 files) on the 07e tip; `packages/core/src/index` 6 passed |
| Runtime harness | `npm run verify` exit 0 on all five tips (509, 575, 653, 730, 737 tests); core coverage 100/100/100/100. Mutation: below. N/A for a runtime path: pure functions |
| Rollback boundary | `packages/core/src/format/length-parser/`, one export block in `format/index.ts`, one test in `index.test.ts`; 07a alone is the follow-ups (`scripts/check-dist.mjs`, `package.json`, `eslint.config.js`, two contract tests, design, spec, Stryker comment) |

Mutation, 07e tip, cold (`npm run mutation`, new content hash so no incremental hit): the first run scored 99.73 (727 killed, 8 timeouts, 2 survived, 4 min 7 s). Survivor 1, `scanner.ts` `/^[eExX][0-9]+$/` without `$`, is an equivalent mutant (a word is letters then digits, so it never continues after the digits); the regex became `/^[eExX][0-9]/` and the leading `e`/`x` plus digit is exactly the rule. Survivor 2, `parser.ts` `if (numerator === undefined) return undefined;` in `takeMixedTail`, was real: tests `5 /2` (offset 2) and `5-/2` (offset 1) kill it. Final run: score 100.00 (total and covered), 727 killed, 8 timeouts, 0 survived, 735 mutants, 4 min 14 s wall (`time`: 666 s user, 306 percent cpu). The 8 timeouts are the same `rational.ts` `gcd`-family mutants as in PR 3 to PR 6; no new timeout. Per file: parser.ts 139 killed, scanner.ts 178, decimal-parts 27, feet-inches 26, purchase 6, rounding 30, rational 189 plus 8 timeouts, units 120, `errors.ts` 5, `result.ts` 7. No pragma. The mutation contract test pins that `index.ts` barrels are excluded from `mutate`, so `length-parser/index.ts` is `export … from` only.

Negative proof [QG11], 07e tip, with `parser.test.ts`, `length-parser.property.test.ts` and `index.test.ts` moved away: `npm run test:coverage` exits 1 (`parser.ts` 0 percent, lines 78.13 against 100, branches 64.24); `npm run mutation` scores 81.09 (588 killed, 8 timeouts, 139 survived), `Final mutation score 81.09 under breaking threshold 90`, exit 1 after 4 min 3 s. The files were restored and the tree was clean.

### Scope and deviations (PR 7)

- Slicing: five branches instead of the contingency of two. Task 7.3 is split across slices: its pre-processing assertions are tested on `scan` in 07b and on `parseLength` in 07c, because the 128-character success case needs the simple form.
- Spec versus the hand-off text: `5 ft2` is `UNKNOWN_UNIT` (spec scenario "Unknown unit", unit token `ft2`) and `5 ft 2` is `MALFORMED`; the hand-off listed `5 ft2` as a missing-inch-mark case, which is the `5 ft 2` row of the table. For the same maximal-run rule `5ft3in` is `UNKNOWN_UNIT` (`ft3` is one token); `5ft 3in` is the valid spelling. Both are tested.
- `defaultUnit` is a `Unit<'length'>` (an object such as `ft`), not a unit id string; PR 9 maps `'in' | 'ft' | 'yd'` and the metric ids through `findUnit`. An untyped caller passing a unit of another dimension gets a quantity of that dimension (no throw, no check), the same trust the other typed signatures place on the caller.
- Offset policy (task 7.2, in `codes.ts`): zero-based index in the original text of the first character of the offending token; for MALFORMED it is the first token the parser could not use, or, when the input ended too early (`1.`, `5'-`, `5 ft 2`), the end of the last token (round 1 REL-2; it was the untrimmed text length). It is not rewound to an earlier token, so `5.5' 3"` points at the space after the feet mark (4). `EMPTY` and `TOO_LONG` carry no offset; `DECIMAL_COMMA` points at the first comma.
- The 128-character cap counts UTF-16 code units (`text.length`), like the other boundaries; an astral character counts as two.
- The fuzz property lives in `parser.test.ts` (task 7.7), the round-trip properties in `length-parser.property.test.ts` (task 7.9).
- 7.0: the A-2/B-3 script prints through `process.stderr.write` (the `no-undef` rule has no `console` outside core) and runs from the repository root; the check no longer uses `fs.globSync`, and the test asserts empty stderr on success.

### Key learnings

- A parser built from "take or undefined" readers plus an `attempt` rewind needs no error plumbing: the cursor position when everything unwinds is the error offset, and a dangling `1/` or `1 1/` falls out as leftover input at the right token.
- Mutation testing found an equivalent regex mutant (the `$` anchor) that could not be killed; the fix is to write the regex so that it has no equivalent form, not to add a test.
- A tool input that carries `\u00A0` can arrive as a raw U+00A0; `no-irregular-whitespace` catches it in sources, but not in test strings, so a scan for `\u00a0` after each write is cheap insurance.

## PR 7 correction round 1 (task 7.12)

Mode: strict TDD, runner `npm test`. Input: the consolidated 4-lens review (all pass; 2 MAJOR, MINORs). Each fix went into the branch that owns the file and the later slices were rebased with `git rebase --onto`; fixes are folded into the owning commits through `--fixup=amend:` and `--autosquash --update-refs`, so history stays one work unit per commit. No overflow slice `07f` was needed: every branch stays under 400 changed lines. History is local and unpushed, so subjects over 72 characters were reworded and the commits with non-obvious decisions got bodies (RD-10).

Applied: M1, M2, REL-1, REL-2, REL-3, REL-4, R1, R2, RES-3, RD-2, RD-3, RD-4, RD-5, RD-6, RD-7, RD-8, RD-9, RD-10. Deferred: none. RD-8 took the comment option (the invariant "a plain `uint` is exactly one token" is documented where it is used) instead of changing `parseNumber`'s return type, which would have added equivalent mutants.

| Branch | Fixes | Changed lines (excl. lockfile) | Tests in `verify` |
|---|---|---|---|
| `feat/foundation-07a-followups` | M1 lint rule and probes; commit rewording | 93 | 516 |
| `feat/foundation-07b-length-scanner` | M1 escape, RD-5, RD-6, RD-7, RES-3, R2 (doc and test), RD-9 helper | 392 | 583 |
| `feat/foundation-07c-length-parser-simple` | RD-9, REL-1 mixed-number row | 328 | 662 |
| `feat/foundation-07d-length-parser-compound` | REL-1, REL-2, REL-4, R1, RD-2, RD-3, RD-4, RD-5, RD-8 (comment) | 306 | 731 |
| `feat/foundation-07e-length-round-trip` | M2 and REL-3 docs, 7.12, 8.0 | 219 | 738 |

### TDD Cycle Evidence (round 1)

| Item | Test | RED | GREEN | Notes |
|---|---|---|---|---|
| M1 lint | `gates.contract.test.ts` irregular-whitespace probes (string, template, comment; test, type-test, source and config files; escaped form accepted) | 4 of 6 probes failed (strings are skipped by default; templates and comments already failed); `eslint scanner.test.ts` reported the raw U+2003 at 75:8 | 90/90 in the file; `npm run lint` clean after the escape | rule applies to every TS and JS file; sweep of the tree with `rg -P` found one raw character (the em space) plus a ZWJ in `README.md` (not linted) |
| REL-1 | `3\u22121/2` row (07c), `5'\u22123"` row (07d) | characterization; proved non-vacuous by changing the scanner map entry to U+2213: both rows and the marks test fail | pass | spec EBNF `hyphen := "-" \| "−"` and a scenario |
| REL-2 | `1. ` (2), `5 ft 2 ` (6), NBSP/tab variant (4) | failed: trailing blanks counted (3, 7, 5) | pass with `text.trimEnd().length` | the scanner rejects every whitespace that `trimEnd` strips beyond blank, so it equals the end of the last token |
| R1 | fuzz property with the offset invariant and six more characters | with the EOF offset broken to `text.length + 1` the property failed in 3 of 3 normal runs (1000 cases); under Stryker (50 cases) only the unit rows catch it | pass | EMPTY and TOO_LONG carry no offset; others an integer in [0, text.length] |
| R2 | `scan('\u{1F600},')` offset 2 and a 129-unit input of 128 code points | pinned behaviour (green on arrival) | pass | documented in `scan` and `codes.ts` |
| REL-4, RD-2 | table rows `5'3''` (3), `1/` (1), `5" 3` (2), `5 m 5` (3), `1/2 3/4` (4), `1 1/2 1/2` (6) | offsets hand-counted before running | pass | the two 07c MALFORMED lists were removed; the point-consumes test keeps `1.x`, `1."`, `1 2` |
| RES-3 | mutation run | first run left one survivor: the `?.` on `tokens[length - 2]` in `lastKind` was an equivalent mutant (whitespace is never first) | rewritten with `filter`; second run 0 survivors | |

### CI evidence for the mutation job (M2, RES-1, RES-2)

First `--isolate=false` run on `main` at `403b0d4`, cold, 418 mutants, `concurrency 4`: job 10 min 22 s, Stryker 10 min 3 s, dry run net 1663 ms. CI over local (143.63 s) is 4.0 times, down from 4.5 to 4.8. CI per killed mutant 1.38 s. Projection: PR 7 (735 mutants) about 17.6 min, PR 8 about 20 to 21 min (crosses the 20-minute trigger of 3.19b), PR 11 above 30 min (the job limit). Therefore task 8.0 (3-runner matrix, one Stryker invocation per module with a matching `vitest run src/<module>`, plus a cross-module shard, per-shard incremental file and cache key, thresholds, `needs: verify`, unchanged `timeout-minutes`, contract test update, one run re-measuring `concurrency 3` versus `4`) is the blocking first task of PR 8. design.md Performance levers and D10 and tasks 3.19b carry the numbers.

### Gates

`npm run verify` exit 0 on all five tips (516, 583, 662, 731, 738 tests; core coverage 100/100/100/100). Lint probe: see the table. Mutation, 07e tip, cold (`packages/core/reports` removed first, `npm run mutation`): score 100.00, 732 killed, 8 timeouts, 0 survived, 740 mutants, 4 min 8 s wall (`time`: 249.43 s real, 656 s user). The 8 timeouts are the known `rational.ts` mutants (lines 9, 14, 15 twice, 31, 32 twice, 122), none in the length parser. Per file: parser.ts 140, scanner.ts 182. The first run, before the `lastKind` rewrite, scored 99.87 with the one equivalent survivor above (741 mutants, 4 min 2 s).

Negative proof [QG11], 07e tip, with `parser.test.ts`, `length-parser.property.test.ts` and `index.test.ts` moved away: `Final mutation score 81.08 under breaking threshold 90`, 592 killed, 8 timeouts, 140 survived, exit 1 after 3 min 59 s. The files were restored and the tree was clean.

Work Unit Evidence: focused tests `npx vitest run packages/core/src/format/length-parser apps/web/src/contract/gates.contract.test.ts` green on every tip; runtime harness `npm run verify` exit 0 on every tip and `npm run mutation` on the 07e tip; rollback boundary per branch: revert its commits (07a alone removes the lint rule and its probes; 07b to 07d keep their behaviour apart from the listed fixes).

### Key learnings (round 1)

- `no-irregular-whitespace` skips strings by default, which is exactly where an invisible test character hides; enabling strings, templates and comments is a one-line config change, and it needs a probe that lints a string with the raw character.
- Equivalent mutants also appear when a lint-driven `?.` guards an index that cannot be out of range; replacing the index arithmetic with a `filter` removed the guard instead of suppressing the mutant.
- Folding review fixes into the owning commits with `--fixup=amend:` and `--autosquash --update-refs` keeps a stack at one work unit per commit, but every later branch needs its own `--onto` rebase and a conflict check on shared test files.

## PR 8 (tasks 8.0 to 8.6, money)

Mode: strict TDD, runner `npm test`. Stacked branches from `main` (none pushed): `08a` shard the mutation job (8.0), `08b` PR 7 Judgment Day follow-ups (8.1), `08c` money type and `toCents` (8.2, 8.3), `08d` unit prices, `parseMoney`, barrels (8.4 to 8.6). 8.7 (SX5 to SX7) stays with the orchestrator.

| Branch | Changed lines (excl. lockfile) | Tests in `verify` |
|---|---|---|
| `feat/foundation-08a-mutation-shards` | 398 (against `main`) | 748 |
| `feat/foundation-08b-length-followups` | 38 (against 08a) | 749 |
| `feat/foundation-08c-money-type` | 199 (against 08b) | 763 |
| `feat/foundation-08d-money-parse-prices` | about 395 (against 08c, docs included) | 813 |

### TDD Cycle Evidence

| Task | Test | RED | GREEN | Notes |
|---|---|---|---|---|
| 8.0 | `mutation.contract.test.ts`, `ci.contract.test.ts` | 17 failed (no `shards`, `optionsFor`, `scripts/mutation.mjs`, matrix) | 214/214, then 748/748 in `verify` | shard coverage asserted from the filesystem (each mutable source file in exactly one shard, sibling test run by its shard), matrix equals `shardNames`, per-shard report name and cache key, prune keeps other shards |
| 8.1 | `parser.test.ts` | characterization plus a real finding | 222/222 | the fuzz offset invariant of the review (`text[offset]` not blank, bound `trimEnd().length`) failed on ` U+FEFF`, `+\t` and `. 0`; the sound form is: offset at most the text minus trailing blanks, and a blank only right after a non-blank. `lastKind` is a `reduceRight` walk (an index loop left 2 equivalent mutants) |
| 8.2, 8.3 | `money.test.ts` | module not found | 14/14 | MN1 to MN3, MN7, MN-mix; `Money` only from `usd` (private class) so a quantity is rejected; `requireSameVector` rejects an operand with no vector |
| 8.4 | `unit-price.test.ts`, `.test-d.ts` | module not found | 8/8 + typecheck | MN4 to MN6; first mutation run left 2 survivors (freeze, currency): pinned |
| 8.5 | `parse.test.ts` | module not found | 36/36 | MN8, MN9, 12 more MALFORMED rows, 18 versus 19 digits in each run, precedence, two properties (never throws; digits.digits equals an independent bigint computation) |
| 8.6 | `index.test.ts` | export list failed | 6/6 | 12 new exports plus a wiring test: `$0.37/ft2 x 12.5 ft2` shows `4.63` |

All expected values were recomputed with Python `fractions.Fraction`: `747/50` (14.94), `999/1000` (1.00), `498/25` (19.92), `185/4` (46.25), `37/8` (4.63 by tie), `333/100`, `381/1250`, `-1/200` (-0.01), `37/14400`, `523/25`, `249/25`, `61728394506172839/50`, `61728394506172839/500000000000000000`.

### Work Unit Evidence

| Evidence | Value |
|---|---|
| Focused tests | `npx vitest run packages/core/src/money` 63 passed (3 files); contract tests 214 passed |
| Runtime harness | `npm run verify` exit 0 on all four tips (748, 749, 763, 813 tests; core coverage 100/100/100/100); `npm run mutation` below. Pure functions, no runtime path |
| Rollback boundary | 08a: `ci.yml`, `stryker.config.mjs`, `scripts/mutation.mjs`, two contract tests; 08b: `scanner.ts` `lastKind` and test; 08c and 08d: `packages/core/src/money/`, one line in `units/quantity.ts`, one export line in `index.ts` |

### Mutation (final tip, cold, `reports` removed, `npm run mutation`, all shards sequentially)

| Shard | Mutate | Score | Killed | Timeouts | Survived | Wall |
|---|---|---|---|---|---|---|
| rational | `rational/**`, `errors.ts`, `result.ts` | 100.00 | 201 | 8 | 0 | 74.6 s |
| units | `units/**`, `money/**` | 100.00 | 202 | 0 | 0 | 53.8 s |
| format | `format/**` | 100.00 | 409 | 0 | 0 | 110.6 s |

Total 820 mutants, 3 min 59 s wall sequentially (`time`: 508 s user). Before sharding the same code was one run of 740 mutants at 4 min 8 s; the first sharded run on the 08a tip (740 mutants) took 73.7 s, 31.0 s and 106.2 s (3 min 31 s). On CI the shards run in parallel, so the job takes about the slowest shard (format, about 4 times local, so about 7 to 8 min) instead of about 17 to 21 min; a CI run is needed to confirm and to re-measure `concurrency 3` versus `4` (not possible locally). The 8 timeouts are the known `rational.ts` `gcd` mutants. No pragma.

Negative proof [QG11], per shard on the 08a tip with a test file group moved away: rational (`rational.test.ts`, `rational.property.test.ts`) 51.67, units (`ops.test.ts`, `quantity.test.ts`) 80.83, format (`length-parser/parser.test.ts`) 87.59, each `under breaking threshold 90`, exit 1. On the final tip, money (`money.test.ts`, `parse.test.ts`, `unit-price.test.ts` moved away): units shard 81.68, exit 1, 37 survived. Files restored, tree clean.

### Scope and deviations (PR 8)

- Three runners, not four: the cross-module `src/index.test.ts` is added to every shard's test command (barrels are excluded from `mutate`, so a fourth runner would score nothing). Shard assignment: `errors.ts` and `result.ts` with `rational`, `money` with `units`.
- A shard rerun keeps the whole identity hash (all core inputs), so a change in one module colds every shard; a per-shard hash would need a dependency graph and is not worth it at this size.
- 8.1 A-4 (the already pushed commit `7644bb6` mixes `feat` and `test`): the repository has no CHANGELOG file, so the note is this line. A-3/B-2: see the table; the review's literal invariant is false for the documented offset policy (a failure may point just after a token, onto a blank).
- 8.2: the vector guard is in `requireSameVector` (`units/quantity.ts`), the place every same-dimension binary op in `ops.ts` uses (`add`, `sub`, `compare`, `equals`, `ratio`); unary ops and `multiply`/`divide` are not guarded, not in `ops.ts` itself.
- R3 (spec wording conflict): the 18-digit cap applies to fractional runs too, as the task says; `0.1234567890123456789` is `TOO_LARGE`.
- The tasks.md numbering has two `8.1` entries (follow-ups and "create branch"); both are marked done.

### Key learnings (PR 8)

- The command runner reruns the whole test command per mutant, so a shard needs both a narrower `mutate` and a narrower test command, and the shard set is only trustworthy if a test derives it from the filesystem.
- A fuzz invariant copied from a review needs to be run against the real offset policy before it is enforced: three counterexamples (` U+FEFF`, `+\t`, `. 0`) showed that "not on a blank" and "within trimEnd" were both wrong.
- A runtime guard for untyped callers should be one instance check on a private class, not a chain of property checks: each extra condition is another mutant that needs its own test.

## PR 8 correction round 1 (4 lenses PASS; orchestrator-finished after two agent stalls)

- M1: `Money` carries a unique-symbol brand (`money.ts`); `money.test-d.ts` rejects a literal, `add(money, money)`, `add(length, money)`, `addMoney(money, length)`, `addMoney(length, money)` and `costOf(price, money)`.
- RISK-1/REL-2: `requireUnitPrice` (`instanceof UnitPriceValue`) guards `costOf`.
- RES-1/2/3: `mutation-gate` aggregate job; per-shard `reports/mutation/<shard>/`; `--reporter=dot`. Incremental report sizes after: format 800 KB, rational 368 KB, units 364 KB (format was 12.7 MB).
- REL-4/5, RISK-2/REL-6: contract and script hardening as listed in task 8.8.
- Gates on the 08e tip (`npm run verify`): 821 tests, coverage 100/100/100/100, exit 0. Cold `npm run mutation` (all shards): rational 100.00 (202 killed, 7 timeouts, 0 survived, 66.5 s), units 100.00 (207 killed, 45.2 s), format 100.00 (409 killed, 88.7 s); exit 0.
- Note: the command also carries `--bail=1` (verdict-safe); the gcd timeout count moved from 8 to 7 because bail makes a run fail at the first failing test instead of hanging in a later one; all remaining timeouts are the known `rational.ts` gcd family, none survived.


## PR 9 (tasks 9.0 to 9.11, calculator contract)

Mode: strict TDD, runner `npm test`. Stacked local branches from `main` at `28971cb` (none pushed): `09a` mutation-runner follow-ups and the first sharded CI run (9.0, 9.1), `09b` descriptor types, `defineCalculator` signature and the `calculator` mutation shard (9.2), `09c` constraint checks (9.3), `09d` definition-time validation (9.4), `09e` field error codes, `fixture-box` and the validate skeleton (9.10, 9.5, 9.6), `09f` length validation (9.7), `09g` count, percent, money, select and boolean validation (9.8), `09h` `Calculator.validate` with ordered aggregation and the barrels (9.9, 9.11). 9.12 (SX1 to SX7) stays with the orchestrator. The planned four branches became eight because the first build of 09a to 09c measured 805 changed lines.

| Branch | Base | Changed lines (excl. lockfile) | Tests in `verify` |
|---|---|---|---|
| `feat/foundation-09a-mutation-follow-ups` | `main` | 141 | 828 |
| `feat/foundation-09b-descriptors` | 09a | 399 | 833 |
| `feat/foundation-09c-constraints` | 09b | 214 | 842 |
| `feat/foundation-09d-define-validation` | 09c | 391 | 945 |
| `feat/foundation-09e-fixture-validate-skeleton` | 09d | 362 | 956 |
| `feat/foundation-09f-validate-length` | 09e | 239 | 983 |
| `feat/foundation-09g-validate-kinds` | 09f | 298 | 1069 |
| `feat/foundation-09h-aggregation-barrel` | 09g | about 250 (151 before this section) | 1076 |

### First CI run of the sharded gate (task 9.0)

GitHub Actions run 39954771896 on `feat/foundation-08e-gate-aggregate-and-reports` (the tree of `main` at `28971cb`), cold (every `stryker-Linux-<shard>-…` cache key was a miss), `concurrency 4`, 4-vCPU runners, 2026-10-23 UTC:

| Job | Started to completed | Wall | Result |
|---|---|---|---|
| verify | 12:37:55 to 12:39:26 | 1 min 31 s | success, 821 tests |
| mutation (rational) | 12:39:29 to 12:43:19 | 3 min 50 s | 100.00, 209 mutants, 0 survived, 7 timed out (the known gcd family) |
| mutation (units) | 12:39:29 to 12:42:51 | 3 min 22 s | 100.00, 207 mutants, 0 survived, 0 timed out |
| mutation (format) | 12:39:29 to 12:43:48 | 4 min 19 s | 100.00, 409 mutants, 0 survived, 0 timed out |
| mutation-gate | 12:43:50 to 12:43:53 | 3 s | success |

The whole workflow took 5 min 58 s (12:37:55 to 12:43:53). The matrix wall time is the slowest shard, 4 min 19 s, against 18 min 57 s for the last unsharded run on `main` (run 39889564663, PR 7 tip, 735 mutants, 02:38:03 to 02:57:00). CI over local on the format shard: 259 s over 88.7 s, 2.9 times. The `concurrency 3` result (throwaway draft PR #41 on the same tree, run 39955834926, cold, closed without merging and branch deleted): `mutation (rational)` 4 min 01 s, `(units)` 2 min 12 s, `(format)` 6 min 24 s, all 100.00 with 0 survivors; the bounding shard (format) got 2 min 05 s slower and the matrix wall time rose from 4 min 19 s to 6 min 24 s, so `concurrency 4` stays (units was faster at 3, which shows runner-to-runner noise of about a minute on the smaller shards). No 2-D matrix was created. The `calculator` shard added in this PR runs 93.3 s cold locally, so about 3 to 5 minutes on CI at the measured ratios, below the format shard's 4 min 19 s plus some headroom; the 30-minute job limit is far away.

### TDD Cycle Evidence

| Task | Test | Layer | RED | GREEN | Triangulate and notes |
|---|---|---|---|---|---|
| 9.0 | `mutation.contract.test.ts` | Unit (contract) | 4 failed of the 6 rows run first (`pruneStaleReports` with a legacy kept report and a shard named `undefined`, a shard `a.c` pruning `abc`, `STRYKER_SHARD=''` throwing `unknown mutation shard: `, `selectShards` accepting `--list=1` and `b`) | 61/61 (54 before, 7 new), 828 in `verify` | the process-level `unknown argument` test was not run in RED: the old script then launched every Stryker shard (it started one and was killed), so only its `selectShards` twin was observed failing; both pass in GREEN |
| 9.2 | `descriptors.test-d.ts`, `define.test.ts`, `mutation.contract.test.ts` | Type + unit | `tsc`: `define.ts` not found, `inputs` implicitly `any`, `toEqualTypeOf` against `never` (5 errors); the contract test failed 3 (a fourth shard, a source file owned by no shard, a test file run by no shard) | typecheck clean, 7/7, contracts 226/226 | break-the-code spot check: `ValueOf` returning `string` for `count` fails `tsc` with `Types of property 'cnt' are incompatible`; the cases cover input inference, `sel === 'z'`, `inputs.zzz`, a missing output, an area returned as a length, money returned as a quantity, an undeclared warning code |
| 9.3 | `constraints.test.ts` | Unit | module not found | 9/9 | both ends of every bound for four kinds, the defaults (count `0..MAX_SAFE_INTEGER`, percent `0..100`, money minimum $0), no bound unless declared (length), a bound as a fraction (`25/2`, `1/3`, `5/2`, `25/127`), a count beyond the safe integers; mutation 56/56 killed |
| 9.4 | `define.test.ts` | Unit (table) | `DEFINITION_REASONS is not iterable`, 78 failed | 100/100, then 105/105 | 17 reasons, 78 rejected rows (one fault per row) and 24 accepted rows on the other side of each boundary; the first mutation run left 10 survivors (units `ft` and `m` never accepted, a count without bounds, a boolean input, a two-output list with one bad key), each killed by a new row or a rewrite (see deviations) |
| 9.10 | `error-codes.test.ts`, `error-codes.test-d.ts` | Unit + type | module not found; contract: a source file with no shard (2 failed) | 1/1 + 2 type tests, contracts 229/229 | exact list of ten codes; every parser and constraint code extends `FieldErrorCode` |
| 9.5 | `fixture-box.test.ts` | Unit | module not found | 3/3 | the spec table as canonical strings; outputs with role and display; compute 144 in2 and 747/50 |
| 9.6 | `validate.test.ts` | Unit | module not found | 5/5 | defaults [CC9], `undefined` and undeclared keys [CC20], declaration order of the keys, a field named `valueOf` or `toString` is not read from the prototype |
| 9.7 | `validate.test.ts`, `quantity.test.ts` | Unit | `tsc`: no `ValidateOptions`, third argument rejected; `isQuantityOf`: 2 failed | 30/30, units 18/18 | CC12 to CC15 plus the six default-unit pairs, a quantity as raw value, lookalike and other-dimension rejection |
| 9.8 | `validate.test.ts`, `money.test.ts` | Unit (table) | 55 failed of 111 | 111/111, then 120 after the survivors | CC11, CC16 to CC18 and 71 more rows; the first mutation run left 4 survivors (whitespace run quantifiers, the number `0`, an equivalent select guard, an equivalent TOO_LONG guard), fixed by rows and rewrites |
| 9.9 | `validate.test.ts`, `descriptors.test-d.ts` | Unit + type | `tsc`: `validate` does not exist on `Calculator` (5 errors) | 238/238 in the folder | CC10, CC19, one error per field with params, the unit system passed through |
| 9.11 | `index.test.ts` | Unit | export list and the wiring test failed (2) | 8/8 | `defineCalculator` through the root barrel, `validate` and `compute` on it |

Expected values were recomputed independently: Python `fractions.Fraction` for `5000/127` (1 m in inches), `250/127` (5 cm), `25000/127` (5 m), `25/127` (5 mm), `76799/64` (1199 63/64 in), `747/50` (3 x 249/50) and `249/50`; the inches of 5 ft (60), 5 yd (180) and 100 ft (1200) by hand. The rows copy the cited spec scenarios (CC1 to CC20) and add rows only where the code has an extra branch.

### Work Unit Evidence

| Evidence | Value |
|---|---|
| Focused tests | `npx vitest run packages/core/src/calculator packages/core/src/error-codes.test.ts packages/core/src/__testing__/fixture-box.test.ts packages/core/src/index.test.ts` all green (`define` 105, `validate` 120, `constraints` 9, `fixture-box` 3, `error-codes` 1, plus 6 type tests); contract tests 229 |
| Runtime harness | `npm run verify` exit 0 on all eight tips (828, 833, 842, 945, 956, 983, 1069, 1076 tests; core coverage 100/100/100/100: 631 statements, 356 branches, 145 functions, 546 lines); `npm run mutation` per shard below. Pure functions, no I/O |
| Rollback boundary | 09a: `stryker.config.mjs`, `scripts/mutation.mjs`, two contract tests; 09b to 09h: `packages/core/src/calculator/`, `error-codes.ts`, `__testing__/fixture-box*`, one line each in `units/quantity.ts` (`isQuantityOf`) and `money/money.ts` (`isMoney`), two lines in `index.ts`, the `calculator` shard in `stryker.config.mjs` and `ci.yml` |

### Mutation (final tip 09h, cold, `reports` removed, one `npm run mutation -- --shard <name>` per shard)

| Shard | Mutate | Score | Killed | Timeouts | Survived | Wall |
|---|---|---|---|---|---|---|
| rational | `rational/**`, `errors.ts`, `result.ts` | 100.00 | 202 | 7 | 0 | 66.0 s |
| units | `units/**`, `money/**` | 100.00 | 212 | 0 | 0 | 48.3 s |
| format | `format/**` | 100.00 | 409 | 0 | 0 | 92.7 s |
| calculator | `calculator/**`, `error-codes.ts` | 100.00 | 418 | 0 | 0 | 93.3 s |

Total 1248 mutants. The 7 timeouts are the known `rational.ts` `gcd` family. In the calculator shard `constraints.ts` has 61 mutants, `define.ts` 237 and `validate.ts` 120; `descriptors.ts` and `error-codes.ts` have none (Stryker does not mutate type declarations or a string array under `as const`, so `FIELD_ERROR_CODES` is pinned by an exact-equality test and a type test instead). No pragma.

Negative proof [QG11] on the final tip: `define.test.ts`, `validate.test.ts` and `constraints.test.ts` moved away, `npm run mutation -- --shard calculator` scored 31.34 (131 killed, 287 survived), `under breaking threshold 90`, exit 1, 87.7 s. The files were restored and `git status` was clean.

### Scope and deviations (PR 9)

- Eight branches, not four. The first build of the descriptors, constraints and `define` pieces measured 805 changed lines, so the PR is cut at the last RED/GREEN boundary into `09a` to `09h`, each at most 399. 09b holds the first calculator source files and therefore the `calculator` shard (the contract tests demand one); `src/error-codes.ts` and its test joined the shard in 09e, when the file first existed.
- `checkConstraints(descriptor, value)` became `checkAmount(descriptor, amount: Rational)` and `findOption(descriptor, value: unknown)`: one function over the descriptor union would need a type assertion to correlate kind and value, and the lint forbids them. A count is compared as a Rational so a value beyond the safe integers keeps its precision. `findOption` (instead of `checkOption`) returns the matching id so that `UNKNOWN_OPTION` for a non-string needs no guard that mutation testing proves redundant.
- Task 9.10 ran before 9.6 because `FieldError` is typed with `FieldErrorCode`. `Calculator.validate` is wired in 9.9, not 9.5: 9.6 to 9.8 test `validateRecord(inputs, raw, options)` directly, so a half-built validator is never reachable through the public object. In between, one characterization test pinned "a given value is refused as `MALFORMED`" and was replaced by the kind tests in 9.8.
- `defineCalculator` is an overload (generic signature plus a wide implementation signature), so an omitted `warnings` keeps the default `readonly []` without a type assertion. `Calculator.validate` and `compute` are readonly function properties (the lint rejects unbound methods).
- Extra definition rules beyond the spec rows, to keep `Rational.of` from throwing `NOT_AN_INTEGER` at call time: a count bound that is not a non-negative safe integer is `INVALID_BOUNDS`, a fractional or out-of-range count default is `DEFAULT_INVALID`. Duplicate warning codes are `DUPLICATE_KEY`. Checks run in a fixed order, so a definition with two faults reports the first.
- An undeclared extra output is not a compile error (TypeScript skips excess-property checks on an inferred return); the spec's "exactly the outputs" is enforced for a missing or mistyped output, and `run` (PR 10) rejects an undeclared key at runtime.
- `TOO_LONG` applies to every string raw value, select and boolean included (the spec's first rule says "String raw values"). A percent accepts strings only; a number is `MALFORMED`.
- Equivalent mutants were removed by rewriting, never by a pragma: the display unit check indexes `UNITS[measure]` (so a missing money guard throws) instead of `findUnit`; retired URL keys are `new Set(definition.retiredUrlKeys)` (no `?? []` default that survives as `["Stryker was here"]`); `unitSystem` has no default string (only `=== 'metric'` is read); the `TOO_LONG` check lives at the one place where it is observable.
- `isQuantityOf` (units) and `isMoney` (money) are new guards for untyped raw values; they live in the units shard and are fully mutation-tested (quantity.ts 27, money.ts 27 killed). RED for `isMoney`: the test and the export were written in one step, so its RED is the missing export and was not executed separately; `isQuantityOf` RED was executed (2 failed).
- Spec reading, for the reviewers: `UnitSystem` is `'imperial' | 'metric'` (default imperial when the option or the whole options object is absent); the percent bound strings are percent points; a money bound is dollars.

### Key learnings (PR 9)

- A type assertion ban shapes the API: correlating a descriptor kind with its value type in one function was impossible without a cast, so the constraint checks became two typed functions and the wide-implementation overload became the pattern for defaults.
- Mutation testing found redundancy in the design, not just missing tests: a guard whose only effect is also produced by the next call (`typeof` before an option lookup, a money check before a unit lookup) is an equivalent mutant, and the fix is to make one mechanism carry the behavior.
- A validator is easier to review when it is introduced behind an internal function and exposed on the public object only after every kind parses; the half-built state then needs one temporary characterization test instead of a public lie.
- The CI wall time of a sharded Stryker job tracks the slowest shard (4 min 19 s on the cold format shard), so a new module needs its own shard rather than a place in an existing one.
