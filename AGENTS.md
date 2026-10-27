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
- `npm run check:site` (checks the built `apps/web/dist` against the route table and the `site` catalogs: head, links, zero JavaScript, sitemap, robots, JSON-LD; run it after `npm run build`; the rules live in `apps/web/src/site-check`, and it enforces the byte budgets: HTML 40,960 B, CSS 20,480 B, each woff2 30,720 B and four together 92,160 B, no JavaScript on the home and trust pages, page weight 163,840 B there; a calculator page has exactly one module script from `/_astro/`, whose static import graph is at most 49,152 B, and a page weight of 196,608 B with it; it prints the largest page per category)
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

A calculator that needs data it must not import (`concrete`, which needs the bag yields) is built by a factory. Add these steps to the ones above, in this order:

8. `packages/core/src/calculators/<id>/<id>.ts` exports `create<Id>(data)` instead of a ready calculator. The factory validates the data it is given (a `null`, a missing key or a non-positive value throws a named `INVALID_DEFINITION`) and keeps a frozen snapshot, so the caller cannot change it later. Core never imports the data package. Forgotten: the web composition root (step 10) has nothing to call.
9. `packages/data/src/yields/<material>.ts` (numbers only: no text, no URL) behind the `./yields/*` subpath of `packages/data/package.json`, and the material record in `packages/data/src/materials/<material>.ts` built from the same objects. The client bundle imports the yields module only; the record carries the source name and URL, and `entry-graph.contract.test.ts` fails when the client entry reaches it.
10. `apps/web/src/lib/<id>.ts` is the composition root: `create<Id>(yields)` with the yields of step 9. Both the registry (step 5) and the client entry import this one module. A fixture of the same yields for the tests lives in `packages/core/src/__testing__/<id>-yields.ts`, exported as `./testing/<id>-yields` in `packages/core/package.json` and listed in `apps/web/src/contract/manifest.contract.test.ts` (the list is explicit on purpose: a wildcard would publish every file added to `__testing__`). The web drift guard compares the data package, the fixture and the factory.
11. The page: `apps/web/src/content/calculators/{en,es}/<id>.md` (frontmatter with the sources, the review date and the worked example, then the five sections in order; run `npm run build` to see the strict schema reject a bad entry), and the page builder `apps/web/src/lib/page-view.ts`, the one module that joins the engine, the presenter and the catalogs into the view the page renders. Forgotten: the content contracts fail naming the missing entry.
12. The script: `apps/web/src/client/entries/<id>.ts` (calls `mount` with the page module `apps/web/src/calculator/<id>/page.ts` and imports nothing else, never `lib/calculators.ts` or the data root) and the island `apps/web/src/islands/<Id>Script.astro` with one processed `<script>`. `entry-graph.contract.test.ts` and `client-entry.contract.test.ts` walk and weigh the entry (49,152 B for the entry and its static graph). The controller `apps/web/src/calculator/controller.ts` is generic: a calculator gives it that page module. The mount `apps/web/src/client/mount.ts` is generic: it takes the page module and looks the slot elements up as lists, so a page without a slot runs it over nothing. The files in `apps/web/src/calculator/concrete/` stay the concrete calculator's own.
13. The methodology section in `apps/web/src/content/pages/{en,es}/methodology.md`: a heading with an id, the formulas, the yields with their source and `approximately`, and a table of hand-verified cases that the contract tests run through the engine (see `apps/web/src/contract/methodology-concrete.contract.test.ts`). The page and the section go live in the same merge as the route (the "not published yet" sentence is gone once one calculator is routed).
14. Go live, all in one merge (a partial go-live is never merged): the `ROUTES` row in `apps/web/src/routing/routes.ts` with `page.<id>.title` and `page.<id>.description` in `packages/i18n/src/catalogs/{en,es}/site.ts` (the route and catalog contract tests name a missing key), the id moved from `PAGELESS` to `CALCULATOR_PAGES` in `apps/web/src/routing/templates.ts`, a row in the `SCRIPTS` table of `apps/web/src/views/CalculatorView.astro` (a missing row is a type error) and the home link in `apps/web/src/views/HomeView.astro` with its `page.home.links.<id>` key. Then update the pinned counts in `apps/web/src/contract/end-state.contract.test.ts` (the only place that pins them). The smoke and no-js browser projects and `check:site` derive the calculator pages from the table, and the `PAGES` table of `apps/web/src/lib/pages.ts` (the page module and the catalogs of both locales) needs its row too, as the `SCRIPTS` table does (each is a `Record<CalculatorPageId, …>`, so a missing row is a type error). The browser record is typed per calculator: `tooling/site-browser/e2e/concrete-pages.ts` is concrete's `E2eSpec` (the strings, states and shape fields) and `tooling/site-browser/e2e/calculator-pages.ts` is the `E2E` table, a `Record<CalculatorPageId, E2eSpec>` (a missing row is a type error) that `calculator.spec.ts` runs over. `a11y.spec.ts`, `layout.spec.ts` and `csp.spec.ts` still hold concrete's selectors and queries, and a second calculator must generalise them. The Lighthouse representative in `tooling/site-browser/e2e/representative.ts` stays the one calculator page it names unless you change it on purpose.

Kept by hand (a type or a security list cannot be derived from a directory; each is guarded by a test that fails when it is forgotten):

- `apps/web/src/lib/i18n-contract.test-d.ts`: the English module imports of `EnglishKeys` (step 6), its `MaterialKeys<typeof …>` union for the material keys and its page-key union for the `calc.<id>.page.*` keys.
- `packages/core/package.json` and `apps/web/src/contract/manifest.contract.test.ts`: the `./testing/<id>-yields` subpath and its entry in the explicit list (step 10).
- `RELEASED` and `REGISTRY` (steps 2 and 3): append-only by design, they are the public URL contract.
- `packages/core/src/__testing__/released-snapshot.ts` is named in the `deps` of the mutation shards by file (one file for every calculator); the per-calculator test support (`packages/core/src/__testing__/*-arbitraries.ts`, `packages/core/src/__testing__/*-yields.ts`) is named by pattern in `packages/core/stryker.config.mjs` and in the CI inputs, so a new one needs no edit.
- `apps/web/src/lib/calculators.ts` (step 5) is the one list of calculators; the registry-equals-directories test fails when a directory is missing.

Mutation testing needs no step: the `calculators` shard mutates `src/calculators/**`, and only its identity and CI key change when a calculator is added. When the shard passes about 400 mutants (about 10 calculators of `rectangle-area` size, but a `concrete`-sized calculator adds about 190 mutants, so the split comes after about 2 of those), split it into `calculators-<group>` shards: each lists its own `src/calculators/<id>` directories in `mutate` and `tests` plus `index.test.ts` (and `released.contract.test.ts` in the first group), with a matching entry in the `.github/workflows/ci.yml` matrix; the exactly-once contract in `mutation.contract.test.ts` fails the build if a directory is left out. `npm run verify` runs every guard above.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
