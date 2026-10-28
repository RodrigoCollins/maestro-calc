# Delta for site-routing-i18n

Routes `rectangle-area` (Square Footage) in the go-live merge. Two requirements change: "Calculator pages in the route table" ([SR17], [SR23] counts) and "Page totals after the calculator change" ([SR19]). Continues the prefix SR (next free id: SR24). Kept as written: [SR18]. Added: [SR24], [SR25]. Every other requirement is unchanged (hreflang and canonical gates of [SR8] to [SR10] derive from the table).

## MODIFIED Requirements

### Requirement: Calculator pages in the route table

The route module MUST export a typed list of calculator page ids (`concrete`, `rectangle-area`) and an explicit list of registry calculators that have no page, `PAGELESS` (empty after this change; the list and its contract stay for the next staged calculator). Every id of the page list MUST be an id of the route table, and every calculator the site lists in `apps/web/src/lib/calculators.ts` MUST be either in the page list or in `PAGELESS`, never both, so one table drives the sitemap, hreflang, `check:site` templates and the browser URL lists.

The home pages MUST render from their own route files, `apps/web/src/pages/index.astro` (`/`, locale `en`) and `apps/web/src/pages/es.astro` (`/es`, locale `es`), the same shape as the two 404 route files. The catch-all page `apps/web/src/pages/[...path].astro` MUST build exactly the paths of `staticPaths()` whose template is not `home`, and it renders a calculator id with the calculator page template and every other id with its trust template as before. The two home files plus the catch-all paths MUST equal `staticPaths()`: no path is built twice and none is dropped. Adding a calculator page takes the edits of the existing "add a page" recipe plus the content entry and the registry (documented in `AGENTS.md`).
(Previously: `concrete` was the only calculator page id and `PAGELESS` was `['rectangle-area']`; the route table and counts were those of the home-directory change.)

#### Scenario: [SR17] List agrees with the table
- GIVEN the route module and the web registry
- WHEN the contract test runs
- THEN the calculator ids are `['concrete', 'rectangle-area']` and `PAGELESS` is `[]`, each page id is a table id, and the test fails naming the id for: a page id missing from the table, a registry calculator in neither list, an id in both lists, or a `PAGELESS` id that is not in the registry (a contract test; the failing cases run on fixture lists, since `PAGELESS` is empty)

#### Scenario: [SR18] Template per id
- GIVEN the built `/concrete-calculator` and `/privacy`
- WHEN parsed
- THEN the first contains the calculator form and result panel and one module script, and the second is a trust page with neither

#### Scenario: [SR23] The home has its own route files and the URL set grows by the two new pages
- GIVEN the route files of `apps/web/src/pages` and `staticPaths()` from the route table
- WHEN the paths the catch-all builds are read from its `getStaticPaths` and the two home files are rendered through the Astro container
- THEN the catch-all paths are exactly `staticPaths()` minus the two `home` entries (14), the union with `/` and `/es` equals `staticPaths()` (16) with no duplicate, `index.astro` renders `html[lang="en-US"]` and `es.astro` renders `html[lang="es-US"]` with the home view of that locale, and after `npm run build` the built URL set ([SR1]), the sitemap (16 `<loc>` entries) and every count of [SR19] match the new totals (a unit test in `static-paths-page.test.ts` plus the existing end-state and sitemap contract tests)
(Previously: 12 catch-all paths, 14 in total, 14 `<loc>` entries.)

#### Scenario: [SR24] The square footage route row
- GIVEN `ROUTES` after the go-live
- WHEN the row of `rectangle-area` is read
- THEN its paths are `/square-footage-calculator` (en) and `/es/calculadora-de-pies-cuadrados` (es), its `page.rectangle-area.title` and `page.rectangle-area.description` exist in both site catalogs, it comes after `concrete` in the table (so the home lists concrete first, [TP30]), and the id of the calculator stays `rectangle-area` while the URL keys `l` and `w` stay frozen (a unit and contract test over `ROUTES` and the site catalogs)

#### Scenario: [SR25] Square footage is built and wired, never half live
- GIVEN the go-live merge and a clean `npm run build`
- WHEN `dist` is read
- THEN `dist/square-footage-calculator/index.html` and `dist/es/calculadora-de-pies-cuadrados/index.html` exist with the calculator template (form, result panel, one module script from `/_astro/`), the sitemap holds both URLs with reciprocal hreflang, the `SCRIPTS`, `PAGES` and `E2E` tables each have the `rectangle-area` row, and the id has moved from `PAGELESS` to `CALCULATOR_PAGES` in the same merge (a build test plus the type-level `Record<CalculatorPageId, …>` tables; a partial go-live fails a contract test)

### Requirement: Page totals after the calculator change

After this change the site has 8 page ids, 16 routable pages (8 per locale), 2 not-found pages and 18 built pages, 18 `page.*` catalog keys per locale, a sitemap of 16 URLs, 14 content entries (10 trust pages in the `pages` collection and 4 in the `calculators` collection), and two calculator pages per locale. Every count of "12 routable", "14 pages" or "six pages" in the other site specs (`site-shell`, `site-quality`, `site-seo`, `trust-pages`) that this change does not rewrite is to be read as the table-derived value of this requirement; the pinned values live only in `end-state.contract.test.ts`.
(Previously: 7 page ids, 14 routable pages, 16 built pages, 16 `page.*` keys, 14 sitemap URLs, 12 content entries and one calculator page per locale.)

#### Scenario: [SR19] Pinned end state
- GIVEN `end-state.contract.test.ts`
- WHEN it runs
- THEN it asserts the ids `home`, `methodology`, `about`, `privacy`, `terms`, `contact`, `concrete`, `rectangle-area`, 16 static paths, a page count of 18, 18 `page.*` keys per locale, 16 `<loc>` entries in the sitemap, 10 trust entries and 4 calculator entries (a contract test; the only place that pins the counts)
