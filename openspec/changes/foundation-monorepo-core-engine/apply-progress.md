# Apply progress: foundation-monorepo-core-engine

## PR 1 (split into 01a + 01b by the slice-overflow rule)

Mode: strict TDD, bootstrap exception (no test runner yet; verified by npm commands per tasks.md).

Branches (stacked, local only): `feat/foundation-01a-remove-legacy` (00de733) then `feat/foundation-01b-skeleton`.
Tasks done: 1.1-1.12 (1.10 not needed). Pending: 1.13 (reviews, PR bodies).

Baseline (1.2, before changes): `npm query .workspace` -> `[]`; `npm run check` -> astro prompts to install `@astrojs/check typescript` (fails); `git ls-files src/lib` -> 4 files.

Gates on final tree: `npm ci` ok; `npm ls --workspaces` clean; `npm query .workspace` -> 4 names; `npm ls typescript` -> single 6.0.3; `npm run check` 0 errors; `npm run build` ok; no `packages/*/dist`; strict flags all true in each package and web `--showConfig`.

Spike: Astro SSR resolved `@maestro-calc/i18n` source TS via symlink: yes. Fallback used: none (`dist/index.html` renders `Locales: en, es`).

Size (excl. lockfile): 01a = 361 deletions; 01b = 141 insertions + 19 deletions vs 01a. Original single PR was 521 (> 400), hence the split. Renames shown `R100` for all moved files.

Deviations: split into 01a/01b; commit order changed (legacy removal first); `vitest` pinned 5.0.5; TS resolved 6.0.3; `@astrojs/sitemap` moved to web deps; web tsconfig `types` = `astro/client`, include narrowed to `src/**/*` and `astro.config.mjs`.
