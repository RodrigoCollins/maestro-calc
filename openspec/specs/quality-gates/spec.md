# quality-gates

Implements PLAN.md §6.2–6.3 (quality gates only; e2e, Lighthouse and SEO checks are out of scope).

## Requirements

### Requirement: Lint gate

`npm run lint` MUST run ESLint (flat config) over all workspaces with typescript-eslint `strictTypeChecked` and `stylisticTypeChecked` presets using type information. It MUST run with zero tolerated warnings. In `packages/core`: `any` (explicit), non-null assertions, `@ts-ignore`/`@ts-nocheck`, and unchecked type assertions that widen are errors; the restricted globals and imports of the `monorepo-workspace` spec are errors (enforced with `no-restricted-globals`, `no-restricted-properties`, and `no-restricted-imports`); coverage-ignore pragmas are errors via `no-warning-comments` configured with the terms `v8 ignore`, `c8 ignore`, `istanbul ignore` and `location: 'anywhere'`, scoped to `packages/core`. Astro files MUST be linted with the Astro plugin.

#### Scenario: Warning fails the gate
- GIVEN a source file that triggers any lint rule at warning level
- WHEN `npm run lint` runs
- THEN it exits non-zero

#### Scenario: `any` in core
- GIVEN `packages/core/src/x.ts` containing `const a: any = 1`
- WHEN lint runs
- THEN it fails

#### Scenario: Clean tree
- GIVEN the final tree
- WHEN `npm run lint` runs
- THEN it exits 0

### Requirement: Format gate

`npm run format:check` MUST run Prettier (with the Astro plugin) over the repository and exit non-zero if any tracked source, config, or markdown file under governed globs is not formatted. `npm run format` MUST rewrite files to the formatted state. Formatter and linter MUST NOT conflict (formatting-only lint rules are disabled).

#### Scenario: Unformatted file
- GIVEN a TypeScript file with a missing semicolon style violation per the Prettier config
- WHEN `npm run format:check` runs
- THEN it exits non-zero and names the file

#### Scenario: No lint/format fight
- GIVEN the final tree
- WHEN `npm run format` is followed by `npm run lint`
- THEN lint still exits 0 and `git diff` is empty after the format step

### Requirement: Typecheck gate

`npm run typecheck` MUST type-check every package and test file with `tsc --noEmit` against the shared base, and MUST run `astro check` for `apps/web`. Type tests (compile-time assertions that wrong-dimension operations are rejected) MUST be part of this gate.

#### Scenario: Type error fails the gate
- GIVEN a test file in `packages/core` that adds a length quantity to an area quantity without a `@ts-expect-error` marker
- WHEN `npm run typecheck` runs
- THEN it exits non-zero

#### Scenario: Unused expect-error
- GIVEN a `@ts-expect-error` comment above a line that does type-check
- WHEN `npm run typecheck` runs
- THEN it exits non-zero (the expectation is stale)

### Requirement: Test and coverage gate

`npm test` MUST run all workspace test suites through a single root vitest configuration using `projects` (one per workspace). `npm run test:coverage` MUST run the same with V8 coverage over `packages/*/src` and enforce thresholds that make the process exit non-zero when unmet:

| Scope | Lines | Branches | Functions | Statements |
|---|---|---|---|---|
| `packages/core` | 100 | 100 | 100 | 100 |
| `packages/data`, `packages/i18n` | >= 90 | >= 90 | >= 90 | >= 90 |

Coverage is collected only over `packages/*/src` (`apps/web` holds no logic in this change and is outside the coverage scope; its tests still run). Test files, test helpers, and configuration files MUST be excluded from the coverage denominator. Coverage-ignore pragmas (`v8 ignore`, `c8 ignore`, `istanbul ignore`) MUST NOT appear in `packages/core`. Property-based tests (fast-check) MUST be used where this change's specs require properties; their seeds MUST be reported on failure so failures are reproducible. Property tests run 1,000 cases per property (the counts in this change's scenarios refer to this run) except under mutation testing, where the environment variable `STRYKER` is set and they run 50 cases per property to keep the mutation job affordable.

#### Scenario: Core below 100 fails
- GIVEN an exported function in `packages/core/src` with one uncovered branch
- WHEN `npm run test:coverage` runs
- THEN it exits non-zero and reports the branch threshold violation

#### Scenario: Ignore pragma forbidden
- GIVEN a `/* v8 ignore next */` comment in `packages/core/src`
- WHEN the lint gate (or an equivalent repository check) runs
- THEN it fails

#### Scenario: Other packages at 90
- GIVEN `packages/i18n` with 85 percent statement coverage
- WHEN `npm run test:coverage` runs
- THEN it exits non-zero

### Requirement: Mutation gate on core

The gate runs per shard (`rational`, `units`, `format`) with the same thresholds; any shard below `break` fails the gate, and the `mutation-gate` job aggregates the matrix into one required check.

`npm run mutation` MUST run Stryker (vitest runner) over `packages/core/src` (excluding tests) and MUST fail when the mutation score is below the `break` threshold. Thresholds MUST be `high: 95`, `low: 90`, `break: 90`. Incremental mode MUST be enabled and its state cacheable in CI. The TypeScript checker plugin is not enabled initially (a tracked follow-up once mutation run time is measured). If the Stryker 10 + vitest 5 combination proves incompatible, the fallback MUST preserve an equivalent blocking mutation gate (e.g. a compatible runner version); the gate MUST NOT be dropped silently. Raising `break` to 95 once core stabilizes is a tracked follow-up, not part of this change.

#### Scenario: Score below break
- GIVEN a core module whose tests leave enough surviving mutants to score 89 percent overall
- WHEN `npm run mutation` runs
- THEN it exits non-zero

#### Scenario: Score at threshold
- GIVEN an overall score of 90 percent
- WHEN `npm run mutation` runs
- THEN it exits 0 and the report flags the score as `low`-band

#### Scenario: Equivalent gate on fallback
- GIVEN the compatibility spike shows Stryker 10 cannot drive vitest 5
- WHEN the mutation job is configured
- THEN a working mutation run with the same thresholds exists and the incompatibility and chosen fallback are documented in the PR description

### Requirement: Continuous integration workflow

`.github/workflows/ci.yml` MUST run on `pull_request` and on `push` to `main`. It MUST:

- declare `permissions: contents: read`;
- use a `concurrency` group per ref that cancels in-progress pull request runs (never runs on `main`);
- set up Node from `.nvmrc` with npm cache;
- run, in order (cheapest gate first): `npm ci`, `npm run format:check`, `npm run sync` (Astro types), `npm run lint`, `npm run typecheck`, `npm run test:coverage`, `npm run build`;
- run `npm run mutation` in a separate job (`needs: verify`) on every run where verify passes (no path filter, so the required check never stays pending), restoring the Stryker incremental report cache before the run and saving it on `main`, so unchanged core code costs little;
- not use `continue-on-error` on any gate step;
- not persist the checkout credentials (`persist-credentials: false`);
- SHOULD pin third-party actions to full-length commit SHAs.

Any failing gate MUST fail the workflow run.

#### Scenario: Gate failure blocks
- GIVEN a pull request whose change fails `npm run lint`
- WHEN CI runs
- THEN the workflow conclusion is failure and later steps in that job do not run

#### Scenario: Mutation job always runs incrementally
- GIVEN a pull request that changes only `apps/web/src/pages/index.astro`
- WHEN CI runs
- THEN the mutation job runs, restores the incremental cache, reuses prior results for unchanged core files, and reports a conclusion (never skipped or pending)

#### Scenario: Least privilege
- GIVEN the workflow file
- WHEN parsed
- THEN top-level `permissions` equals `{ contents: read }` and no job grants broader permissions

### Requirement: Dependency-bot major pinning

Automated dependency updates (if configured by the repository) SHOULD ignore semver-major updates of `typescript` until typescript-eslint and `@astrojs/check` declare support, to avoid breaking lint and typecheck.

#### Scenario: Bot configuration
- GIVEN a `.github/dependabot.yml` in the repository
- WHEN parsed
- THEN an `ignore` rule for `typescript` with `update-types: ["version-update:semver-major"]` is present
