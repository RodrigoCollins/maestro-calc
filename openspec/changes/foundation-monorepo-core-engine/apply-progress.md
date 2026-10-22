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
