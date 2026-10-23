# Delta for monorepo-workspace

## ADDED Requirements

### Requirement: Browser tooling placement

Site-audit tooling used by `verify` (the HTML parser and font reader used by `check:site`) MUST be devDependencies declared at the root or in `apps/web`. Browser tooling (`wrangler`, `@playwright/test`, `@axe-core/playwright`, `@lhci/cli`) MAY instead live in a non-workspace package `tooling/site-browser/` with its own committed lockfile, installed (`npm ci`) only by the browser job. No manifest under `packages/*` MAY declare any of them, and `packages/core` MUST remain without runtime `dependencies`. The root `npm ci` MUST NOT download browser binaries; browsers are installed by an explicit command in the browser job.

#### Scenario: [MWW1] Packages stay clean
- GIVEN the manifests of `packages/core`, `packages/data` and `packages/i18n`
- WHEN searched for `playwright`, `axe-core`, `lhci`, `wrangler`
- THEN there is no match and `packages/core` has no `dependencies`; any manifest declaring them is the root, `apps/web` or `tooling/site-browser`, and `tooling/site-browser` is not listed in the root `workspaces`

#### Scenario: [MWW2] Install does not fetch browsers
- GIVEN a fresh clone
- WHEN `npm ci` runs
- THEN it exits 0 and no Playwright browser directory is created

## MODIFIED Requirements

### Requirement: Developer entry points

Root scripts MUST exist for `dev`, `build`, `lint`, `format`, `format:check`, `typecheck`, `check`, `test`, `test:coverage`, `mutation`, `check:site` (checks built HTML in `apps/web/dist`: SEO, hreflang, JSON-LD, zero JS, byte budgets) and `test:e2e` (Playwright with axe and the phone smoke against the built site), delegating to workspaces. `npm run check` MUST remain valid (alias of `typecheck`) so existing tooling configuration keeps working. `npm run verify` MUST include `check:site` after `build` and keep `check:dist` last. `AGENTS.md` MUST document that the dev server is started from the web workspace and the new scripts, and `openspec/config.yaml` MUST reflect the new test, coverage, mutation, lint, format, site-check and e2e commands.
(Previously: scripts ended at `mutation`; `check:site` and `test:e2e` did not exist and e2e was listed as unavailable.)

#### Scenario: Baseline check is green
- GIVEN a clean install
- WHEN `npm run check` runs
- THEN it exits 0 (the previously broken script now works because `typescript` and `@astrojs/check` are installed)

#### Scenario: Ignored artifacts
- GIVEN a completed test, coverage, mutation, e2e and Lighthouse run
- WHEN `git status --porcelain` is inspected
- THEN `node_modules`, coverage output, Stryker temp and report directories, build output, Playwright report and `test-results`, and `.lighthouseci` do not appear as untracked

#### Scenario: [MWW3] Site scripts exist
- GIVEN the root `package.json`
- WHEN `scripts` is read
- THEN `check:site` and `test:e2e` are present, and `check:site` fails with a message to build first when `apps/web/dist` is missing

#### Scenario: [MWW4] Verify order
- GIVEN the `verify` script
- WHEN its command sequence is read
- THEN the sequence ends `… npm run build, npm run check:site, npm run check:dist` and the other gates keep their cheapest-first order

#### Scenario: [MWW5] Docs reflect the scripts
- GIVEN `AGENTS.md` and `openspec/config.yaml`
- WHEN searched
- THEN both mention `check:site` and `test:e2e`, and `config.yaml` lists e2e as available
