# Verification Report: foundation-monorepo-core-engine

Change: `foundation-monorepo-core-engine` · Mode: strict TDD (`npm test`), artifact store `openspec` · Target: tip `feat/foundation-12i-record-pr12` (`b27c59c`), 67 commits above `main` (`28971cb`, the merge base; PRs 1-8 are on `main`, PRs 9-12 are the stacked slices 09a..12o + 12i).
Date: 2026-10-23 · Verifier: sdd-verify (independent runtime verification, no source edits).

## Verdict: PASS WITH WARNINGS

0 CRITICAL, 5 WARNING, 5 SUGGESTION. Every gate is green at runtime, all 217 spec scenarios have a passing covering test or a recorded process proof, and the strict-TDD evidence exists for every PR.

## Completeness (tasks)

| Item | Result |
|------|--------|
| Tasks checked `[x]` | All numbered work tasks of PRs 1-12 except the ones listed below |
| Unchecked exit tasks (PR 1-8) | 1.13, 2.12, 3.17, 4.9, 5.9, 6.7, 7.11, 8.7 (reviews, Judgment Day and PR bodies; PRs 1-8 are merged on `main`, and the review rounds are recorded in apply-progress) |
| Unchecked follow-ups (deliberately deferred) | 2.14 (`checkJs`), 2.16 (tag remaining contract tests), 3.19 (Stryker/vitest 5 pin flip), 3.19b (mutation job wall time trigger), 4.11 (`qs` override, Dependabot #13) |
| Exit tasks with recorded evidence | 9.12, 10.7, 11.10, 12.12 record gates, mutation, size, SX4 grep, 4-lens review and Judgment Day verdicts |
| `[ ] SX1..SX7` (lines 54-60) | Template checklist applied per PR, not work tasks; not counted |

## Gate chain (run on the tip, cold)

| Gate | Command | Exit | Evidence |
|------|---------|------|----------|
| Whole chain | `npm run verify` | 0 | format:check, sync, lint, typecheck, test:coverage, build, check:dist in order (`&&` chain) |
| Format | `npm run format:check` | 0 | all files formatted |
| Sync | `npm run sync` | 0 | Astro types generated |
| Lint | `eslint . --max-warnings=0` | 0 | 0 errors, 0 warnings |
| Typecheck | `npm run typecheck` | 0 | no errors (incl. `.test-d.ts`) |
| Tests + coverage | `npm run test:coverage` | 0 | 76 test files, 1647 tests passed, type errors: none; statements 100% (950/950), branches 100% (550/550), functions 100% (229/229), lines 100% (826/826) |
| Build | `astro build` | 0 | 1 page, sitemap created |
| Dist check | `node scripts/check-dist.mjs` | 0 | no `packages/*/dist` |

Verify log: `/private/tmp/claude-501/-Users-rodrigocollins-maestro-calc/c26b7938-4b3e-4e55-ba23-f5e4d50d0214/scratchpad/verify.log`.

## Mutation (cold: `rm -rf packages/*/reports`, then `npm run mutation -- --shard <name>` per shard, break threshold 90)

| Shard | Exit | Score | Killed | Timeout | Survived | No cov |
|-------|------|-------|--------|---------|----------|--------|
| rational | 0 | 100.00 | 202 | 7 | 0 | 0 |
| units | 0 | 100.00 | 213 | 0 | 0 | 0 |
| format | 0 | 100.00 | 409 | 0 | 0 | 0 |
| calculator-define | 0 | 100.00 | 460 | 0 | 0 | 0 |
| calculator-run | 0 | 100.00 | 153 | 0 | 0 | 0 |
| url | 0 | 100.00 | 286 | 0 | 0 | 0 |
| calculators | 0 | 100.00 | 39 | 0 | 0 | 0 |
| data | 0 | 100.00 | 139 | 0 | 0 | 0 |

Total 1908 detected (1901 killed + 7 timeouts), 0 survivors, no coverage pragma. Wall time about 7.5 minutes sequential (17:24:26 to 17:31:48) (each call far under the 600000 ms timeout). Log: `.../scratchpad/verify-mutation.log`.

## Hygiene

| Check | Result |
|-------|--------|
| `fd -t d dist packages` | empty |
| `git status --porcelain` after verify + mutation | empty (reports, `.stryker-tmp`, coverage are ignored) |
| MW4 `rg "src/lib/(engine\|units\|format\|types)"` outside openspec | no match; `git ls-files src/lib` = 0 |
| Attribution in `git log --format=%B main..HEAD` | no hit (67 commits) |
| Attribution in `git log --format=%B 28971cb` (PR 1-8 range and all history) | no hit (116 commits) |
| Conventional subjects (both ranges) | all conventional |
| `npm query .workspace` | exactly `@maestro-calc/{web,core,data,i18n}`; `npm ls --workspaces` exit 0; one TypeScript, 6.0.3 (deduped) |
| Rename proof (MW3) | `astro.config.mjs -> apps/web/astro.config.mjs` is `R100` in history |

Note: the brief names `61fd7f8` as an unrelated `wrangler.jsonc` commit on `main`; that SHA is not in this repository (no branch contains it) and `main` is at `28971cb`. No finding results from it.

## Requirement coverage matrix

Method: every scenario of the 11 specs was mapped through the tasks.md traceability tables and cross-checked mechanically: All 217 traceability IDs (215 scenario IDs plus `ER-conv` and `MN-mix`) were searched in `*.ts`/`*.mjs` sources and 203 appear in a `// spec: <capability> › <scenario> [ID]` tag of a test (385 `spec:` tags in total). The remaining IDs and the two unmapped scenarios were checked by hand (see "Scenarios without a tagged automated test"). Spot reads of the tests (ER13, RA8, RA9, FF unicode minus, FF unknown mode, IN, CC guards) assert the values stated in the spec. All tests passed in the run above.

| Spec | Requirements | Scenarios | Tagged automated tests | Process or structural proof only | Status |
|------|--------------|-----------|------------------------|----------------------------------|--------|
| exact-rational | 8 | 31 | 31 (ER1-ER31, ER-conv) | 0 | COMPLIANT |
| units-quantities | 6 | 25 | 25 (UQ24, UQ25 under suffixed IDs `UQ24a-d`, `UQ25a/b`) | 0 | COMPLIANT |
| money | 5 | 10 | 10 (MN1-MN10, MN-mix) | 0 | COMPLIANT |
| fraction-format | 6 | 38 | 38 (FF1-21, FP1-13, FR1-2, plus Unknown mode and Typographic minus, which tasks.md does not map) | 0 | COMPLIANT (traceability gap W3) |
| calculator-contract | 5 | 26 | 26 (CC1-CC26) | 0 | COMPLIANT |
| url-state-codec | 4 | 23 | 23 (UC1-UC23) | 0 | COMPLIANT |
| i18n-catalog | 4 | 11 | 10 tagged; IN1 has a test but no tag (task 2.16) | 0 | COMPLIANT |
| material-data-contract | 2 | 5 | 5 (MD1-MD5) | 0 | COMPLIANT |
| calc-rectangle-area | 5 | 15 | 15 (RA1-RA15) | 0 | COMPLIANT |
| monorepo-workspace | 7 | 16 | 12 (MW2, MW5-MW15 incl. graph, pins, check:dist) | MW1, MW3, MW4, MW16 (recorded commands; re-run here, see Hygiene) | COMPLIANT (process proofs W4) |
| quality-gates | 7 | 17 | 14 (QG1-QG4, QG8-QG17 via gate, coverage, mutation and CI contract tests) | QG5 (the green `verify` chain), QG6, QG7 (recorded negative proofs, 2.10 a/b, also guarded by type tests), QG13 conditional (applied, 3.14) | COMPLIANT (process proofs W4) |

Requirement counts come from `rg -c "^### Requirement"` per spec; scenario counts from `rg -c "^#### Scenario"` (total 217).

### Scenarios without a tagged automated test

| ID or scenario | Why | Evidence | Severity |
|----------------|-----|----------|----------|
| MW1 clean install, MW3 renames, MW4 legacy gone, MW16 ignored artifacts | One-time repository or process proofs | Recorded in apply-progress 1.12 and 12.11; re-run in this verification (`npm ls --workspaces` 0, `R100` rename, empty MW4 `rg`, clean status, `git check-ignore` lists reports/dist/.stryker-tmp/coverage) | WARNING (W4) |
| QG5 no lint/format fight | Property of the whole chain | `format:check` then `lint` both exit 0 in the verify run | WARNING (W4) |
| QG6 type error, QG7 unused expect-error | Manual negative proofs (2.10 a/b) | Apply-progress negative-proof section; structurally guarded by `.test-d.ts` programs in `typecheck` | WARNING (W4) |
| QG14 (f) draft-PR CI-red proof | Deferred in 2.10 (no push in apply) | CI runs of the later stacked PRs; not reproduced here | SUGGESTION |
| IN1 locale list | Test exists (`locales.test.ts`) but carries no spec tag | Task 2.16 follow-up | SUGGESTION |
| fraction-format "Unknown mode", "Typographic minus as a separator" | Tested (`rounding.test.ts:65` `INVALID_MODE` for `toString` and `banana`; `parser.test.ts:81,214,224,232` with U+2212) but absent from the traceability table | See W3 | WARNING (W3) |

## Strict TDD compliance (apply-progress)

| Check | Result | Details |
|-------|--------|---------|
| TDD Cycle Evidence reported | OK | Tables present for PR 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 and each correction round; PR 1 records the documented bootstrap exception (no runner yet) |
| All tasks have tests | OK | Docs-only rows are marked n/a |
| RED confirmed | OK with lapses | Listed below |
| GREEN confirmed | OK | 76 files / 1647 tests pass at the tip; the cited test files exist |
| Triangulation | OK | Tables, property tests and `it.each` rows (for example 22 rejected rows in `run.test.ts`, 60 rows in `decode.test.ts`) |
| Safety net | OK | "N/N" recorded for modified files (for example 396/396 in PR 5) |
| Assertion quality | OK | No tautologies. Six `toBeDefined()` uses are guards before value assertions. `toEqual([])` rows sit beside non-empty and negative companions; loops over the registry are preceded by `length > 0` assertions (`i18n-contract`, `released.contract`, `language-free.contract`). No mock-heavy tests |

Recorded lapses (none leaves a spec rule untested):

| Lapse | Where | Judgment |
|-------|-------|----------|
| Bootstrap exception, no runner | PR 1 (1.x), and the `locales` test in PR 2 | Documented in tasks.md R4; `locales.test.ts` now covers IN1 |
| Characterization tests green on arrival | 3.11 properties, 6b property, 7.9 round trip, 9.13 REL-2/RES-4, 10.8 REL-4, 11.6 UC18, 11.7 UC19/UC20, 11.11 REL-1/REL-3, 12.3/12.5/12.7 rectangle-area cases and properties | Each has a recorded break-the-code spot check or mutation run (url shard 100.00, calculators 100.00); values were recomputed with `fractions.Fraction` for the area cases |
| RED not executed separately | `isMoney` (PR 9: test and export written in one step; the RED is the missing export) | `isMoney` is fully mutation-tested (money.ts 27 killed); `isQuantityOf` RED was executed |
| RED shown by a break-the-code check | 12.10 contracts (`missing-keys.ts`, `released.ts` written with their tests) | The check (second calculator in the registry) fails 5 tests; recorded as a deviation |
| Same-step helper creation | 9.0 mutation helpers, 12k identity helpers | RED executed on the contract tests (4 of 6 rows, 28 failing tests) |

## Design conformance (D1-D17)

| Decision | Status | Evidence |
|----------|--------|----------|
| D1 workspaces, no task runner | Honoured | Root scripts only; `workspace-graph.contract.test.ts` |
| D2 source-TS packages, `.ts` imports | Honoured | Spike passed without fallback; web build consumes source; `check:dist` |
| D3 frozen `Rational` class | Honoured | ER2-ER6 frozen-instance tests |
| D4 exponent-vector dimensions, canonical units | Honoured | UQ1-UQ25, type tests |
| D5 Result vs thrown `CoreError` | Honoured | ER-conv, CC24, `INVALID_STATE`/`INVALID_DEFINITION` (additive `reason` in the cause, recorded) |
| D6 hand-rolled descriptors | Honoured | `calculator/`; core manifest has no dependencies (CC26) |
| D7 calculators in core, own subpath | Honoured | `index.test.ts` asserts the barrel does not export `rectangleArea`; `./calculators/*` export pinned |
| D8, D9, D16, D17 URL text, comma, slash, unit system | Honoured | UC1-UC18, FP12, CC15 |
| D10 mutation job always runs, exact cache key | Honoured with recorded deviations | Matrix per shard (`mutation (<shard>)`), cache key in one step; per-shard identity added in PR 12 (deviation recorded) |
| D11 per-package Stryker config on `tooling/stryker.mjs` | Honoured | `packages/{core,data}/stryker.config.mjs` |
| D12 EN source of truth, ES `satisfies` | Honoured | IN2, IN9; Spanish in the neutral tu register (spec delta recorded) |
| D13 free functions | Honoured | units, money, format are functions |
| D14 pound canonical | Honoured | UQ9-UQ11 |
| D15 Money exact USD | Honoured | MN1-MN10 |

Deviations recorded in design.md and apply-progress: tsconfig solution layout (PR 2), mutation cache hardening and command runner fallback (PR 3, Stryker 10 cannot drive vitest 5), `ALL_ERROR_CODES` in PR 11, tasks.md R2 list.

Open Questions / follow-ups completeness: design.md "Open Questions" holds the Stryker runner, JD-2 `retiredUrlKeys`, RES-3 query cap, RES-5 CI wall time, RES-7, RES-9, mutation `break` 95, TypeScript checker, locale-aware decimals and the `wrangler.jsonc` 404 note. It does NOT hold (a) the Judgment Day follow-up of task 12.12 (per-shard identity of `rational`, `units`, `format`, `calculator-define` and `calculator-run` omits `src/url/**` although each shard runs `src/index.test.ts`, which loads the url codec through the root barrel, so a codec change can reuse stale verdicts on an exact cache hit; `mutation-identity.contract.test.ts:81` pins the gap with `expect(identity('rational')).not.toContain('src/url/codec.ts')`; also the stale `released-snapshot.ts` doc comment), (b) the PR 11 Judge A info items (`encode` does not enforce the 256-character value cap `decode` applies, `decode` throws a host `TypeError` for a non-string query, `StateLocus` is not exported), recorded only in task 11.10.

## Issues

### CRITICAL

None.

### WARNING

- W1 Exit tasks 1.13, 2.12, 3.17, 4.9, 5.9, 6.7, 7.11, 8.7 are still `[ ]` although PRs 1-8 are merged; `state.yaml` `phases.apply` still reads "in-progress" with stale "exit pending" text for PR 12 (task 12.12 is `[x]`). Bookkeeping only; reconcile before archive.
- W2 Follow-up tasks 2.14, 2.16, 3.19, 3.19b and 4.11 are open. They are tracked and out of scope for this change, but archive should carry them forward explicitly.
- W3 Two fraction-format scenarios ("Unknown mode", "Typographic minus as a separator") are missing from the traceability table (36 mapped of 38). Both are covered by passing tests; add IDs to the table.
- W4 Process proofs without an automated test: MW1, MW3, MW4, MW16, QG5, QG6, QG7 (QG14(f) deferred, see SUGGESTION). They were re-verified here by command or by the green chain, and the apply-progress negative proofs exist, but they are not re-checked by CI tests.
- W5 Follow-ups missing from `design.md` Open Questions: the `src/url/**` shard-identity gap (task 12.12, found by both Judgment Day judges and pinned by a test assertion) and the three PR 11 info items. Risk of the first: a codec change can reuse stale mutant verdicts on an exact cache hit in CI (cache is saved on `main` only; `verify` and any cold run still catch a broken codec; this run was cold and found 0 survivors).

### SUGGESTION

- S1 Make the identity gap the first task of the next change (follow the root barrel in the closure walk or add `src/url/**` to the kernel deps, drop the pinning assertion).
- S2 Run the draft-PR CI-red proof (QG14 f) once the stack is pushed.
- S3 Tag `locales.test.ts` with IN1 and finish task 2.16.
- S4 Test layer distribution is unit, property, type and contract tests only (76 files, 1647 tests); no browser-level test exists, which fits a foundation change with one prerendered page. Add integration/E2E when the UI lands.
- S5 Reconcile the brief's `61fd7f8` reference; the SHA is unknown to this repository.

## Changed-file coverage

100% statements, branches, functions and lines over `packages/core`, `packages/data` and `packages/i18n` (thresholds core 100, data and i18n 90). Linter 0/0, type checker 0 errors.

## Final verdict

PASS WITH WARNINGS. Recommended next phase: `sdd-archive`, after reconciling W1 and recording W5 in `design.md`.
