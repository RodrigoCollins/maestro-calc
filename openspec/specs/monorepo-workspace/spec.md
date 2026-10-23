# monorepo-workspace

Implements PLAN.md §6.1 (package separation) and §12 phase B. Specifies WHAT the repository layout and boundaries MUST be, not how they are configured.

## Requirements

### Requirement: Workspace layout

The repository MUST be an npm-workspaces monorepo. The root `package.json` MUST be `private`, MUST declare `workspaces` covering `packages/*` and `apps/*`, and MUST contain no application source. The following workspaces MUST exist, named under the scope `@maestro-calc`:

| Path | Package name | Role |
|---|---|---|
| `packages/core` | `@maestro-calc/core` | Pure calculation engine |
| `packages/data` | `@maestro-calc/data` | Typed material-record contract |
| `packages/i18n` | `@maestro-calc/i18n` | EN/ES label catalog |
| `apps/web` | `@maestro-calc/web` | Astro application |

A single `package-lock.json` at the root MUST be committed and in sync with all workspace manifests.

#### Scenario: Clean install from lockfile
- GIVEN a fresh clone of the repository on Node 24
- WHEN `npm ci` runs at the root
- THEN it exits 0 and links all four workspaces under `node_modules/@maestro-calc/`
- AND `npm ls --workspaces` reports no missing, invalid, or extraneous workspace

#### Scenario: Workspace enumeration
- GIVEN the repository root
- WHEN `npm query .workspace` is executed
- THEN exactly the four packages in the table above are returned

### Requirement: Scaffold relocation preserves history

The Astro app (`astro.config.mjs`, `src/pages`, `src/site.config.ts`, `public/`, `tsconfig.json`) MUST live under `apps/web/`, moved so that git detects renames (not delete plus add). The directory `src/lib` and its files (`engine.ts`, `units.ts`, `format.ts`, `types.ts`) MUST NOT exist anywhere in the working tree; they are replaced, not migrated.

#### Scenario: Moves are detected as renames
- GIVEN the commit that relocates the app
- WHEN `git diff -M --name-status <parent> <commit>` is run
- THEN the relocated files appear with status `R` (rename) and not as `D` plus `A`

#### Scenario: Legacy library is gone
- GIVEN the final tree of this change
- WHEN searching the repository (excluding `.git`, `node_modules`, `openspec/`) for the paths `src/lib/engine.ts`, `src/lib/units.ts`, `src/lib/format.ts`, `src/lib/types.ts`
- THEN no match exists

### Requirement: Dependency direction

Workspace dependencies MUST form an acyclic graph with exactly these allowed edges: `data -> core`, `web -> core`, `web -> data`, `web -> i18n`. `core` and `i18n` MUST NOT depend on any other workspace. `packages/core` MUST declare no runtime `dependencies` (zero third-party runtime code). Cross-workspace imports MUST go through the target package's public entry point, never through its internal file paths.

#### Scenario: Forbidden edge fails lint
- GIVEN a source file in `packages/core` that imports `@maestro-calc/i18n`
- WHEN the repository lint gate runs
- THEN lint fails with a diagnostic naming the forbidden import

#### Scenario: Core has no runtime dependencies
- GIVEN `packages/core/package.json`
- WHEN its `dependencies` field is read
- THEN it is absent or an empty object

#### Scenario: Deep import rejected
- GIVEN a file in `apps/web` importing `@maestro-calc/core/src/rational`
- WHEN lint runs
- THEN lint fails because the import bypasses the package entry point

### Requirement: Core purity (platform independence)

`packages/core` MUST be usable from any JavaScript runtime (browser, Node, React Native, edge worker). Its sources MUST NOT reference DOM or host globals (`window`, `document`, `location`, `history`, `navigator`, `localStorage`, `sessionStorage`, `fetch`, `process`) and MUST NOT use nondeterministic sources (`Math.random`, `Date`, `performance`). The type environment for core MUST NOT include DOM or Node typings. Lint enforces this with `no-restricted-globals` listing at least `window`, `document`, `location`, `history`, `navigator`, `localStorage`, `sessionStorage`, `fetch`, `process`, `Date`, and `performance`, plus `no-restricted-properties` for `Math.random`.

#### Scenario: DOM reference rejected by the type checker
- GIVEN a file in `packages/core/src` containing `const w = document.title`
- WHEN the typecheck gate runs
- THEN it fails with an error that `document` cannot be found

#### Scenario: DOM reference rejected by lint
- GIVEN the same file
- WHEN the lint gate runs
- THEN it fails with a restricted-global diagnostic for `document`

#### Scenario: Nondeterminism rejected
- GIVEN a file in `packages/core/src` calling `Math.random()` or `new Date()`
- WHEN lint runs
- THEN lint fails

### Requirement: Internal packages ship TypeScript source

Internal packages MUST expose their public API through `exports` pointing to TypeScript source. There MUST be no build step, emitted `dist`, or generated declaration step for `core`, `data`, or `i18n` in this change. Consumers (Vite, Astro, vitest) MUST resolve and compile that source directly. A package MAY also expose named test-support subpaths under `testing/` (one explicit entry per file, never a wildcard) for the contract tests of `apps/web`; shipped sources, including `packages/data` and shipped web code, MUST NOT import them, and lint rejects such an import (a probe test pins it).

#### Scenario: Web build consumes workspace source
- GIVEN `apps/web` importing `@maestro-calc/core`, `@maestro-calc/data`, and `@maestro-calc/i18n`
- WHEN `npm run build` runs at the root
- THEN `astro build` exits 0 (including server-side bundling of symlinked workspace TypeScript)
- AND no `dist` directory is produced inside `packages/*`

#### Scenario: Web smoke import executes core
- GIVEN the web workspace test suite
- WHEN it runs
- THEN at least one test imports the rectangle-area calculator and the i18n catalog through their package names and asserts a computed value (125 ft² for 10' by 12' 6")

### Requirement: Toolchain pins

- `.nvmrc` MUST contain `24`.
- Root `package.json` `engines.node` MUST be `>=22.23.4`.
- `typescript` MUST be pinned to the `~6.0` range, declared once at the root; no workspace may declare a different TypeScript version.
- A shared `tsconfig.base.json` MUST enable `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`, `noImplicitOverride`, `moduleResolution: Bundler`, and a `target` of ES2022 or later (required for `bigint` literals). Every workspace tsconfig MUST extend it and MUST NOT weaken these options.

#### Scenario: Compiler options inherited
- GIVEN each workspace `tsconfig.json`
- WHEN resolved with `tsc --showConfig`
- THEN `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`, `noImplicitOverride` are all `true`
- NOTE the leaf program configs (`tsconfig.src.json`, `tsconfig.test.json`, `tsconfig.app.json`) are what MUST extend the base; solution `tsconfig.json` files have `files: []` and only reference them

#### Scenario: Single TypeScript version
- GIVEN the installed tree
- WHEN `npm ls typescript` runs
- THEN every occurrence resolves to one `6.0.x` version

### Requirement: Developer entry points

Root scripts MUST exist for `dev`, `build`, `lint`, `format`, `format:check`, `typecheck`, `check`, `test`, `test:coverage`, and `mutation`, delegating to workspaces. `npm run check` MUST remain valid (alias of `typecheck`) so existing tooling configuration keeps working. `AGENTS.md` MUST document that the dev server is started from the web workspace and `openspec/config.yaml` MUST reflect the new test, coverage, mutation, lint, and format commands.

#### Scenario: Baseline check is green
- GIVEN a clean install
- WHEN `npm run check` runs
- THEN it exits 0 (the previously broken script now works because `typescript` and `@astrojs/check` are installed)

#### Scenario: Ignored artifacts
- GIVEN a completed test, coverage, and mutation run
- WHEN `git status --porcelain` is inspected
- THEN `node_modules`, coverage output, Stryker temp and report directories, and build output do not appear as untracked
