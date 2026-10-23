# Delta for quality-gates

## MODIFIED Requirements

### Requirement: Mutation gate on core

The gate runs per shard (`rational`, `units`, `format`, `calculator-define`, `calculator-run`, `url`, `calculators` in `packages/core`, plus `data` in `packages/data`) with the same thresholds; any shard below `break` fails the gate, and the `mutation-gate` job aggregates the matrix into one required check. A shard's incremental-cache identity (the Stryker config hash inputs and the CI cache-key `hashFiles` inputs) MUST cover every source file that the shard's tests load, including files reached through the package root barrel. In particular the kernel shards `rational`, `units`, `format`, `calculator-define` and `calculator-run` MUST include `src/url/**` in their identity.
(Previously: shards listed were `rational`, `units`, `format`; no statement about identity coverage, and the kernel shards omitted `src/url/**` through the root barrel, so a `src/url/**` change could reuse stale verdicts.)

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

#### Scenario: [QGW1] Kernel shard identity includes url
- GIVEN the `identityFilesFor(shard)` result for each of `rational`, `units`, `format`, `calculator-define`, `calculator-run`
- WHEN searched for `src/url/codec.ts`
- THEN every result contains it

#### Scenario: [QGW2] Editing a url file changes the identity
- GIVEN the identity hash of the `rational` shard
- WHEN a file under `packages/core/src/url/` changes
- THEN the shard hash differs, and the CI cache key for `rational` (its `matrix.inputs` plus shared files) also changes

#### Scenario: [QGW3] Gap pin removed
- GIVEN `apps/web/src/contract/mutation-identity.contract.test.ts`
- WHEN searched for an assertion that a kernel shard identity does not contain `src/url/codec.ts`
- THEN no such assertion exists (`expect(identity('rational')).not.toContain('src/url/codec.ts')` is gone)

#### Scenario: [QGW4] CI shard list matches config
- GIVEN `.github/workflows/ci.yml` and the `shards` of `packages/core/stryker.config.mjs`
- WHEN compared by the contract test
- THEN the matrix lists exactly those shards followed by `data`

### Requirement: Continuous integration workflow

`.github/workflows/ci.yml` MUST run on `pull_request` and on `push` to `main`. It MUST:

- declare `permissions: contents: read`;
- use a `concurrency` group per ref that cancels in-progress pull request runs (never runs on `main`);
- set up Node from `.nvmrc` with npm cache;
- run, in order (cheapest gate first): `npm ci`, `npm run format:check`, `npm run sync` (Astro types), `npm run lint`, `npm run typecheck`, `npm run test:coverage`, `npm run build`, `npm run check:site`, `npm run check:dist` (the existing built-output gate stays last);
- run `npm run mutation` in a separate job (`needs: verify`) on every run where verify passes (no path filter, so the required check never stays pending), restoring the Stryker incremental report cache before the run and saving it on `main`, so unchanged core code costs little;
- run the browser checks (axe, phone smoke, Lighthouse CI) in a separate job `site-browser` (`needs: verify`, no path filter), as specified in `site-quality`;
- not use `continue-on-error` on any gate step;
- not persist the checkout credentials (`persist-credentials: false`);
- SHOULD pin third-party actions to full-length commit SHAs.

Any failing gate MUST fail the workflow run.
(Previously: the ordered list ended at `npm run build` followed by `npm run check:dist`, and no browser job existed.)

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

#### Scenario: [QGW5] Site gate order
- GIVEN the `verify` job steps
- WHEN listed
- THEN `npm run check:site` comes immediately after `npm run build`, `npm run check:dist` comes immediately after it and ends the job, and neither has `continue-on-error`

#### Scenario: [QGW6] Seeded site regression blocks
- GIVEN a pull request whose build drops a canonical link
- WHEN CI runs
- THEN `verify` fails at the `check:site` step and `mutation` and `site-browser` do not start

#### Scenario: [QGW7] Browser job runs independently of mutation
- GIVEN a green `verify`
- WHEN CI runs
- THEN `site-browser` and the `mutation` matrix start in parallel and neither lists the other in `needs`
