## Development

npm workspaces monorepo: `apps/web` (Astro app, composition root) and `packages/{core,data,i18n}` (internal TypeScript-source packages). Use npm and Node 24 (`.nvmrc`).

When starting the dev server, run it from the web workspace in background mode:

```
cd apps/web && npx astro dev --background
```

Manage the background server with `npx astro dev stop`, `npx astro dev status`, and `npx astro dev logs` (from `apps/web`).

Root scripts:

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run check` (alias of `typecheck`)
- `npm run format:check`
- `npm run sync` (generates Astro types, needed before lint)
- `npm run lint` (uncached, as in CI; `npm run lint:fast` is the cached local variant)
- `npm test`
- `npm run test:coverage`
- `npm run check:site` (checks the built `apps/web/dist` against the route table and the `site` catalogs: head, links, zero JavaScript, sitemap, robots, JSON-LD; run it after `npm run build`; the rules live in `apps/web/src/site-check`, and it enforces the byte budgets: HTML 40,960 B, CSS 20,480 B, each woff2 30,720 B and four together 92,160 B, no JavaScript, page weight 163,840 B, and prints the largest page per category)
- `npm run test:e2e` (axe and phone smoke in Chromium against `wrangler dev` serving the built `apps/web/dist`; see below)
- `npm run lighthouse` (Lighthouse CI over six pages against `wrangler dev`; needs Google Chrome and the tooling install below; accessibility, SEO and best practices at 0.95 and layout shift at 0.01 block, performance only warns)
- `npm run verify` (all gates cheapest-first, same order as the CI `verify` job, ending `build`, `check:site`, `check:dist`; it does not run mutation testing or the browser tests)
- `npm run mutation` (Stryker over `packages/core` and `packages/data`, one shard at a time: `npm run mutation -- --list`, `-- --shard <name>`; cold wall times in `openspec/changes/archive/2026-10-23-foundation-monorepo-core-engine/apply-progress.md`; the CI `mutation` job runs one runner per shard after `verify`; POSIX shells only)

Run `npm ci` after cloning. `apps/web/src/contract/end-state.contract.test.ts` is the only pinned count (pages, URLs, entries); a new site-level page must update it, and every other test derives its counts from `ROUTES`.

Browser tests: `tooling/site-browser` is a package of its own (own `package-lock.json`, not an npm workspace) so the root install and the `verify` job never download Wrangler or a browser. It is excluded from the root ESLint, TypeScript and Vitest runs and typechecks itself (`npm run typecheck --prefix tooling/site-browser`). Once per machine: `npm ci --prefix tooling/site-browser` and `npx --prefix tooling/site-browser playwright install --only-shell chromium`. Then `npm run build && npm run test:e2e` (the specs read the route table from `apps/web`, so new pages are picked up). `npm run build && npm run lighthouse` audits the same build (reports go to the ignored `tooling/site-browser/.lighthouseci`). The `site-browser` CI job runs the same on the `dist` that `verify` uploads, then Lighthouse on the runner's Chrome.

## Adding a calculator

`rectangle-area` is the model. Do the steps in this order (strict TDD: each test first, run it red):

1. `packages/core/src/calculators/<id>/`: `<id>.ts` (the `defineCalculator` definition), `index.ts` (one `export` line) and the four tests `<id>.test.ts`, `<id>.shape.test.ts`, `<id>.property.test.ts`, `<id>.url.test.ts`. Never export it from `packages/core/src/index.ts`; the `./calculators/*` subpath of `package.json` already covers it. Forgotten: the web registry test lists every directory of `calculators/`, so step 5 fails; a directory with no `index.ts` fails `workspace-graph.contract.test.ts`.
2. `RELEASED` in `packages/core/src/__testing__/released-snapshot.ts`: one tuple per input, appended, never edited (the public URL contract). Forgotten: `apps/web/src/lib/released.contract.test.ts` fails with `no released tuple`.
3. `REGISTRY` in `packages/core/src/calculators/released.contract.test.ts`. Forgotten: `compareReleased` reports the released calculator as missing (step 2 done) and the web test above fails (step 2 undone).
4. `packages/i18n/src/catalogs/{en,es}/<id>.ts`: one named export per file, the English keys are what `messageKeysOf` derives plus nothing else, Spanish in the neutral tú register (Ingresa, Usa, Elige). Forgotten: `i18n-contract.test.ts` fails on the locale directories, on missing keys and on hygiene; a missing Spanish key is a compile error in `packages/i18n`.
5. `apps/web/src/lib/calculators.ts`: import the calculator through its own subpath and add it to the list. Forgotten: the registry-equals-directories test fails.
6. `apps/web/src/lib/i18n-contract.test-d.ts`: add the English module to `EnglishKeys`. Forgotten: `npm run typecheck` fails (the keys derived from the registry are not all in `EnglishKeys`).
7. `apps/web/src/routing/templates.ts`: add the id to `PAGELESS` until its page goes live (then move it to `CALCULATOR_PAGES` with its route). Forgotten: `templates.contract.test.ts` fails (the calculator is in neither list).

Nothing else is kept by hand. Mutation testing needs no step: the `calculators` shard mutates `src/calculators/**`, and only its identity and CI key change when a calculator is added. When the shard passes about 400 mutants (about 10 calculators of `rectangle-area` size, but a `concrete`-sized calculator adds about 190 mutants, so the split comes after about 2 of those), split it into `calculators-<group>` shards: each lists its own `src/calculators/<id>` directories in `mutate` and `tests` plus `index.test.ts` (and `released.contract.test.ts` in the first group), with a matching entry in the `.github/workflows/ci.yml` matrix; the exactly-once contract in `mutation.contract.test.ts` fails the build if a directory is left out. `npm run verify` runs every guard above.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
