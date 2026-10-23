## Development

npm workspaces monorepo: `apps/web` (Astro app, composition root) and `packages/{core,data,i18n}` (internal TypeScript-source packages). Use npm and Node 24 (`.nvmrc`).

When starting the dev server, run it from the web workspace in background mode:

```
cd apps/web && npx astro dev --background
```

Manage the background server with `npx astro dev stop`, `npx astro dev status`, and `npx astro dev logs` (from `apps/web`).

Root scripts: `npm run dev`, `npm run build`, `npm run preview`, `npm run check` (alias of `typecheck`), `npm run format:check`, `npm run sync` (generates Astro types, needed before lint), `npm run lint` (uncached, as in CI; `npm run lint:fast` is the cached local variant), `npm test`, `npm run test:coverage`, and `npm run verify` (all gates cheapest-first, same order as the CI `verify` job; it does not run mutation testing), and `npm run mutation` (Stryker over `packages/core` and `packages/data`, one shard at a time: `npm run mutation -- --list`, `-- --shard <name>`; cold wall times in `openspec/changes/foundation-monorepo-core-engine/apply-progress.md`; the CI `mutation` job runs one runner per shard after `verify`; POSIX shells only). Run `npm ci` after cloning.

## Adding a calculator

`rectangle-area` is the model. Do the steps in this order (strict TDD: each test first, run it red):

1. `packages/core/src/calculators/<id>/`: `<id>.ts` (the `defineCalculator` definition), `index.ts` (one `export` line) and the four tests `<id>.test.ts`, `<id>.shape.test.ts`, `<id>.property.test.ts`, `<id>.url.test.ts`. Never export it from `packages/core/src/index.ts`; the `./calculators/*` subpath of `package.json` already covers it. Forgotten: the web registry test lists every directory of `calculators/`, so step 5 fails; a directory with no `index.ts` fails `workspace-graph.contract.test.ts`.
2. `RELEASED` in `packages/core/src/__testing__/released-snapshot.ts`: one tuple per input, appended, never edited (the public URL contract). Forgotten: `apps/web/src/lib/released.contract.test.ts` fails with `no released tuple`.
3. `REGISTRY` in `packages/core/src/calculators/released.contract.test.ts`. Forgotten: `compareReleased` reports the released calculator as missing (step 2 done) and the web test above fails (step 2 undone).
4. `packages/i18n/src/catalogs/{en,es}/<id>.ts`: one named export per file, the English keys are what `messageKeysOf` derives plus nothing else, Spanish in the neutral tú register (Ingresa, Usa, Elige). Forgotten: `i18n-contract.test.ts` fails on the locale directories, on missing keys and on hygiene; a missing Spanish key is a compile error in `packages/i18n`.
5. `apps/web/src/lib/calculators.ts`: import the calculator through its own subpath and add it to the list. Forgotten: the registry-equals-directories test fails.
6. `apps/web/src/lib/i18n-contract.test-d.ts`: add the English module to `EnglishKeys`. Forgotten: `npm run typecheck` fails (the keys derived from the registry are not all in `EnglishKeys`).

Nothing else is kept by hand. Mutation testing needs no step: the `calculators` shard mutates `src/calculators/**`, and only its identity and CI key change when a calculator is added. When the shard passes about 400 mutants (about 10 calculators of `rectangle-area` size), split it into `calculators-<group>` shards: each lists its own `src/calculators/<id>` directories in `mutate` and `tests` plus `index.test.ts` (and `released.contract.test.ts` in the first group), with a matching entry in the `.github/workflows/ci.yml` matrix; the exactly-once contract in `mutation.contract.test.ts` fails the build if a directory is left out. `npm run verify` runs every guard above.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
