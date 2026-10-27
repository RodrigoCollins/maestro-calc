# Delta for site-routing-i18n

Gives the home its own route files so that the home's scoped CSS ships on the home only (design K1). Only the "Calculator pages in the route table" requirement changes; every other SR requirement is unchanged, and so are the route table, the URL set, the sitemap and the pinned counts of "Page totals after the calculator change". Continues the prefix SR (next free id: SR23). Kept as written: [SR17], [SR18]. Added: [SR23].

## MODIFIED Requirements

### Requirement: Calculator pages in the route table

The route module MUST export a typed list of calculator page ids (`concrete` today) and an explicit list of registry calculators that have no page, `PAGELESS` (`['rectangle-area']`, the foundation proof calculator). Every id of the page list MUST be an id of the route table, and every calculator the site lists in `apps/web/src/lib/calculators.ts` MUST be either in the page list or in `PAGELESS`, never both, so one table drives the sitemap, hreflang, `check:site` templates and the browser URL lists.

The home pages MUST render from their own route files, `apps/web/src/pages/index.astro` (`/`, locale `en`) and `apps/web/src/pages/es.astro` (`/es`, locale `es`), the same shape as the two 404 route files. The catch-all page `apps/web/src/pages/[...path].astro` MUST build exactly the paths of `staticPaths()` whose template is not `home`, and it renders a calculator id with the calculator page template and every other id with its trust template as before. The two home files plus the catch-all paths MUST equal `staticPaths()`: no path is built twice and none is dropped. The route table, the sitemap, hreflang, the canonical URLs and the counts pinned in `end-state.contract.test.ts` are unchanged by the split. Adding a calculator page takes the edits of the existing "add a page" recipe plus the content entry and the registry (documented in `AGENTS.md`).
(Previously: the catch-all page rendered every id of the table, the home included, so the CSS scoped to the home view was bundled into the catch-all's chunk and shipped on every page.)

#### Scenario: [SR17] List agrees with the table
- GIVEN the route module and the web registry
- WHEN the contract test runs
- THEN the calculator ids are `['concrete']` and `PAGELESS` is `['rectangle-area']`, each page id is a table id, and the test fails naming the id for: a page id missing from the table, a registry calculator in neither list, an id in both lists, or a `PAGELESS` id that is not in the registry

#### Scenario: [SR18] Template per id
- GIVEN the built `/concrete-calculator` and `/privacy`
- WHEN parsed
- THEN the first contains the calculator form and result panel and one module script, and the second is a trust page with neither

#### Scenario: [SR23] The home has its own route files and the URL set does not change
- GIVEN the route files of `apps/web/src/pages` and `staticPaths()` from the route table
- WHEN the paths the catch-all builds are read from its `getStaticPaths` and the two home files are rendered through the Astro container
- THEN the catch-all paths are exactly `staticPaths()` minus the two `home` entries (12 today), the union with `/` and `/es` equals `staticPaths()` (14) with no duplicate, `index.astro` renders `html[lang="en-US"]` and `es.astro` renders `html[lang="es-US"]` with the home view of that locale, and after `npm run build` the built URL set ([SR1]), the sitemap (14 `<loc>` entries) and every count of [SR19] are unchanged (a unit test in `static-paths-page.test.ts` plus the existing end-state and sitemap contract tests)
