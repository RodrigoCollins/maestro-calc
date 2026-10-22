## Development

npm workspaces monorepo: `apps/web` (Astro app, composition root) and `packages/{core,data,i18n}` (internal TypeScript-source packages). Use npm and Node 24 (`.nvmrc`).

When starting the dev server, run it from the web workspace in background mode:

```
cd apps/web && npx astro dev --background
```

Manage the background server with `npx astro dev stop`, `npx astro dev status`, and `npx astro dev logs` (from `apps/web`).

Root scripts: `npm run dev`, `npm run build`, `npm run preview`, `npm run check` (alias of `typecheck`), `npm run format:check`, `npm run sync` (generates Astro types, needed before lint), `npm run lint`, `npm test`, `npm run test:coverage`, and `npm run verify` (all gates cheapest-first, same order as CI). Run `npm ci` after cloning.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
