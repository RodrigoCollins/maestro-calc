# Tasks: Web Shell — Bilingual Site Frame, Trust Pages and Site Quality Gates

Change: `web-shell` · Inputs: `proposal.md` (D1–D8), `design.md` (revised after design review round 1; W1–W13), 8 delta specs under `specs/` · Mode: strict TDD (`npm test`), artifact store `openspec`, delivery `auto-chain`, chain `stacked-to-main`.

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~3,240 total (additions + deletions, lockfiles excluded); 11 slices of 100–380 each |
| 400-line budget risk | High overall (single PR impossible); PRs 2, 7, 9, 10 forecast at 370–380 and PR 8 carries the most files, so each has a named split contingency |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → … → PR 11 (strictly ordered; each merged to `main` before the next merges) |
| Delivery strategy | auto-chain |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

Notes on the estimate: the design forecast is kept per PR; strict-TDD tests are inside those numbers. Added versus the design (not sized there): the AstroContainer spike and component tests (PRs 3–5), pure `routing/links.ts` and `routing/switch.ts` (PR 4), contract tests for the second lockfile, `wrangler.e2e.jsonc`, dependabot, lint/typecheck exclusion and CI job shape (PR 8). If a slice passes 400, split at its last RED/GREEN boundary (see the overflow rule); do not request an exception.

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Kernel mutation shards cover `src/url/**` (W1); walk follows the barrel | PR 1 `fix/web-shell-01-mutation-identity` | `npm test -- apps/web/src/contract/mutation` | `npm run mutation -- --list`; CI `mutation-gate` cold | `stryker.config.mjs`, `ci.yml` inputs, one contract test; no web code |
| 2 | Route table, SEO helpers, `site` catalog, register test | PR 2 `feat/web-shell-02-routing-seo-catalog` | `npm test -- apps/web/src/routing apps/web/src/seo packages/i18n` | N/A (pure functions; 100 percent coverage) | `routing/`, `seo/`, `site` catalogs, contract tests |
| 3 | Tokens, base CSS, fonts, favicon, `BaseLayout`, `SeoHead`, `SkipLink` | PR 3 `feat/web-shell-03-tokens-fonts-layout` | `npm test -- apps/web/src/styles apps/web/src/components` | `npm run build`; `rg` over `apps/web/dist` | Restores the smoke page; `styles/`, `layouts/`, fonts config |
| 4 | Header, wordmark, language switch, footer, catch-all route + `HomeView` | PR 4 `feat/web-shell-04-header-footer-home` | `npm test -- apps/web/src/routing apps/web/src/components` | `npm run build`; inspect `dist/index.html`, `dist/es.html` | Reverts to PR 3 smoke page |
| 5 | 404 EN/ES, full home copy, `SITE.tagline` removed, `contacto@` | PR 5 `feat/web-shell-05-not-found-home-copy` | `npm test -- apps/web/src/contract apps/web/src/views` | `npm run build`; `dist/404.html`, `dist/es/404.html` | `NotFoundView`, 404 pages, copy keys, `site.config.ts` |
| 6 | `sitemap.xml` endpoint, `robots.txt`, JSON-LD in head, `@astrojs/sitemap` removed | PR 6 `feat/web-shell-06-endpoints-jsonld` | `npm test -- apps/web/src/seo` | `npm run build`; parse `dist/sitemap.xml` | Restores the integration sitemap |
| 7 | `site-check` rules, `check:site` CLI, CI/`verify` wiring | PR 7 `feat/web-shell-07-check-site` | `npm test -- apps/web/src/site-check` | `npm run build && npm run check:site` | `site-check/`, CLI, one `ci.yml` step, scripts |
| 8 | `tooling/site-browser`, `_headers`, axe + phone smoke, `site-browser` job | PR 8 `feat/web-shell-08-browser-gate` | `npm test -- apps/web/src/contract` | `npm ci --prefix tooling/site-browser && npm run test:e2e` | `tooling/site-browser/`, `_headers`, CI job; CI-only plus headers |
| 9 | Content collection, `TrustPageView`, methodology + about EN/ES | PR 9 `feat/web-shell-09-trust-methodology-about` | `npm test -- apps/web/src/contract apps/web/src/content` | `npm run verify && npm run test:e2e` | content, two route rows, view |
| 10 | Privacy, terms, contact EN/ES; pinned `12 + 2` end state | PR 10 `feat/web-shell-10-trust-legal-contact` | `npm test -- apps/web/src/contract` | `npm run verify && npm run test:e2e` | three route rows, six Markdown files, extra `check:site` rules |
| 11 | Byte budgets, woff2 cmap check, Lighthouse CI | PR 11 `feat/web-shell-11-budgets-glyphs-lighthouse` | `npm test -- apps/web/src/site-check` | `npm run verify && npm run lighthouse` | `budgets.ts`, `woff2-cmap.ts`, `lighthouserc.json`, CI step |

## Conventions (apply to every slice)

**Branches and stacking.** Slice PR N is branched from the tip of slice N-1 (from `main` for PR 1; retarget onto `main` after each predecessor merges, never leaving child diffs that include parent changes). Branch names are in the table above. The first task of every PR says so.

**Commits (work-unit-commits).** One commit per work unit: tests and the code that proves them ship together; docs/config that explain a unit travel with it. Conventional Commits only, no `Co-Authored-By`, no AI attribution; each commit leaves the tree green. Scopes: `repo`, `web`, `core`, `i18n`, `ci`. Each PR lists its planned commits.

**Strict TDD loop.** RED (failing test with hand-verified values from the cited scenario; see it fail for the right reason) → GREEN (smallest code) → REFACTOR. Tasks are tagged `[RED]`, `[GREEN]`, `[REFACTOR]`; a test written against code that is already green says so and requires a break-the-code spot check. Test names cite the scenario id (`// spec: site-seo › [SE9]`). Spikes and pure config use a recorded exception to RED-first (as in foundation PR 1).

**Counts derive from `ROUTES`.** Every test, rule and URL list computes routable pages as `2 × Object.keys(ROUTES).length`, plus 2 not-found. Only task 10.2 pins `6` ids, `12` routable and `14` pages. Expected end-state numbers per PR: after PR 4/5: 2 routable (4 pages with 404s); after PR 9: 6 routable (8 pages); after PR 10: 12 (14).

**Pages enter the table only when they exist.** Header and footer link lists are filtered by `ROUTES` presence (tasks 4.2–4.3), so production never links to a missing page. Catalog keys enter with their consumer (`page.<id>.*` with the page).

**Verification commands.** `npm test -- <path>` = `vitest run <path>`. Local gate order (cheapest first): `npm run format:check && npm run sync && npm run lint && npm run typecheck && npm run test:coverage && npm run build`, then from PR 7 `npm run check:site`, then `npm run check:dist` (= `npm run verify`). Browser: from PR 8 `npm run test:e2e`; from PR 11 `npm run lighthouse`.

**Slice-overflow rule.** Measure with `git diff --shortstat main...HEAD -- . ':(exclude)package-lock.json' ':(exclude)tooling/site-browser/package-lock.json'` (additions + deletions; against the parent tip while stacked). Over 400: split at the last RED/GREEN boundary into `NNa`/`NNb`, update `state.yaml`, never request an exception.

### Standard Exit Criteria (SX): every PR, in order, before merge

- [ ] SX1 Local gates green: format:check, sync, lint, typecheck, test:coverage (core 100; data/i18n 90; `apps/web/src/{routing,seo}` 100 from PR 2, `site-check` 100 from PR 7), build, `check:site` (from PR 7), `check:dist`.
- [ ] SX2 Mutation (when `packages/core` or `packages/data` changed, i.e. PR 1): `npm run mutation` ≥ 90 per shard; CI `mutation-gate` green. The CI `mutation` matrix runs on every PR regardless.
- [ ] SX3 Size: the shortstat above ≤ 400 changed lines; actual vs forecast recorded in the PR body.
- [ ] SX4 History hygiene: `git log main..HEAD --format=%B | rg -i 'co-authored|claude|anthropic|generated with'` returns nothing; every subject is a conventional commit.
- [ ] SX5 Four specialized reviewers on the frozen candidate (after `npm run format`): (1) spec conformance against the cited scenarios, (2) types, API design, package boundaries, (3) test quality (hand-verified values, TDD order, surviving mutants), (4) maintainability, security and performance. Only candidate-caused blocking findings gate.
- [ ] SX6 Judgment Day (two judges); at most one scoped correction transaction, then re-run SX1/SX2 on the corrected tree.
- [ ] SX7 PR opened against `main` with scope, scenario ids covered (traceability table), forecast vs actual, negative-proof evidence and rollback note; CI green; merged before the next slice merges.
- [ ] SX8 (from PR 8) The `site-browser` job is green on the PR and its wall time is recorded (limit 10 minutes).

---

## PR 1 — Mutation identity fix (`fix/web-shell-01-mutation-identity`)

Forecast: ~100 changed lines. Specs: quality-gates (Mutation gate on core: [QGW1]–[QGW4]). No web code is touched. Green because: the contract walk now follows the root barrel and every kernel shard identity holds `src/url/**`.

Planned commits: `test(repo): follow the root barrel in the mutation identity walk` (RED, folded into the fix commit when pushed) · `fix(core): include src/url in the kernel mutation shard identity` · `ci: add src/url to the kernel mutation matrix inputs`. Single work unit if it stays under ~120 lines.

- [x] 1.1 Create the branch from `main`. Baseline: `npm test -- apps/web/src/contract/mutation` green; `rg -n "src/url" .github/workflows/ci.yml packages/core/stryker.config.mjs` shows `src/url/**` only in the `url`, `calculators` and `data` entries. Applied in group 1. Branch is the group branch `feat/web-shell-g1-visible-site` (owner decision), not the per-PR branch.
- [x] 1.2 [RED] `apps/web/src/contract/mutation-identity.contract.test.ts`: (a) in the "keeps the sources of the other shards in step" test replace `expect(identity('rational')).not.toContain('src/url/codec.ts')` with a loop over `['rational','units','format','calculator-define','calculator-run']` expecting `toContain('src/url/codec.ts')` [QGW1, QGW3]; (b) `expect(hashOf('url')).not.toBe(hashOf('rational'))` becomes `toBe(hashOf('rational'))` (calculators stays `not.toBe`) [QGW2]; (c) delete the `rootBarrel` const and drop the `[rootBarrel]` argument from both `it.each` bodies (the `leaves` parameter stays: the probe test uses it). Verify: the file fails with five `%s: every file its sources and tests import…` cases listing only `src/url/**` paths in `missing`, plus the hash assertion. STOP and report if the walk reports any path outside `src/url/**` (design W1 assumes none). Applied in group 1.
- [x] 1.3 [RED] `apps/web/src/contract/mutation-ci-key.contract.test.ts` (extend; it already compares `ci.yml` inputs with the config): for each of the five kernel shards the matrix `inputs` contain `packages/core/src/url/**` [QGW2 CI-key side]; the shard-name list equals `shardNames` followed by `data` stays green [QGW4]. Verify: five new failures. Applied in group 1.
- [x] 1.4 [GREEN] `packages/core/stryker.config.mjs`: add `'src/url/**'` after `'src/units/**'` in `kernel`; remove the now duplicate `'src/url/**'` from the `calculators` deps; rewrite the kernel comment (the root barrel is followed by the contract walk, `src/*.ts` covers it, and `src/url/**` is in the kernel because the barrel test imports it; a codec change colds every core shard). Verify: 1.2 passes. Applied in group 1.
- [x] 1.5 [GREEN] `.github/workflows/ci.yml`: add `packages/core/src/url/**` after the `packages/core/src/units/**` line in the `inputs` of `rational`, `units`, `format`, `calculator-define`, `calculator-run` (not `url`, `calculators`, `data`). Verify: `npm test -- apps/web/src/contract/mutation` all green; `npm run mutation -- --list` unchanged. Applied in group 1.
- [x] 1.6 [REFACTOR] Update the comment above the walk ("the barrel is read for its own text and not followed" → "the barrel is followed"). Negative proof (temporary, never committed, log in the PR body): add `export * from './foo/index.ts'` to `packages/core/src/index.ts` with a new `src/foo/x.ts` outside every identity → the contract fails naming `src/foo/x.ts`; revert. Verify: `git status --porcelain` clean. Applied in group 1.
- [ ] 1.7 Evidence: record the cold CI wall time of the slowest shard on this PR (every shard colds once) and compare with the 10 minute trigger of foundation design D10. Verify: PR body line.
- [ ] 1.8 Exit: SX1–SX7 (SX2 applies); `git diff --stat main...HEAD -- apps/web/src ':!apps/web/src/contract'` is empty (no web code).

---

## PR 2 — Routing, SEO helpers, `site` catalog (`feat/web-shell-02-routing-seo-catalog`)

Forecast: ~380 changed lines. Specs: i18n-catalog (ICW1–ICW9), site-routing-i18n (route table units), site-seo (units). Green because: all new modules are pure, covered at 100 percent (`routing`, `seo`) and nothing renders yet. Contingency: split `02a` (2.2–2.5 catalog + register) / `02b` (2.6–2.17).

Planned commits: `feat(i18n): add the site catalog scope` · `test(web): reject formal imperatives and voseo in Spanish copy` · `feat(web): add the typed route table` · `test(web): prove route and catalog agreement` · `feat(web): add head, JSON-LD and sitemap helpers` · `build(repo): cover routing and seo at 100 percent`.

- [x] 2.1 Create the branch from the PR 1 tip (or `main` once PR 1 is merged). Applied in group 1.
- [x] 2.2 [RED] `packages/i18n/src/site-catalog.test.ts` (new), `catalogs.contract.test.ts`, `catalog.test-d.ts`: expected module list becomes `['common','site',...calculatorIds]`; `enSite['site.skipLink']` is `Skip to main content` and `esSite` is `Saltar al contenido principal` [ICW2]; `site.tagline` is exactly `Jobsite calculators that tell you exactly what to buy` and `Calcula tu obra y sabe qué comprar` [ICW8]; every `page.*` title is 10–60 characters, non-home titles (including `notFound`) end with ` | Maestro Calc`, titles unique across ids and locales, descriptions 70–160 characters and unique across non-`notFound` ids [SE1]; no `{placeholder}` in `site`; type test: an `es` object without `site.skipLink` and one with an extra key each need `@ts-expect-error` [ICW3]; a contract that `site` modules import no other catalog module (groundwork for [ICW6]). Also confirm the existing completeness suite iterates `site` (parity, whitespace, placeholders). Verify: fails (no `site` module). Applied in group 1.
- [x] 2.3 [GREEN] `packages/i18n/src/catalogs/{en,es}/site.ts` (`enSite` and `esSite`, `esSite … satisfies CatalogOf<typeof enSite>`); check the package `exports` map already exposes `./catalogs/*/site`, add it if not. Keys (PR 2 scope only): `site.tagline`, `site.skipLink`, `site.nav.label` (`Main navigation` / `Navegación principal`), `site.nav.methodology` (`Methodology` / `Metodología`), `site.nav.about` (`About` / `Sobre nosotros`), `site.switch.label` (`Español` on the en module, `English` on the es module), `site.footer.privacy` (`Privacy` / `Privacidad`), `site.footer.terms` (`Terms` / `Términos`), `site.footer.contact` (`Contact` / `Contacto`), `site.footer.contactLabel` (`Contact us at` / `Escríbenos a`), `page.home.title|description`, `page.notFound.title|description`. Proposed titles: `Maestro Calc: jobsite calculators` / `Maestro Calc: calculadoras para tu obra`; `Page not found | Maestro Calc` / `Página no encontrada | Maestro Calc`. Descriptions: author to the 70–160 range (the 2.2 test is the oracle; neutral tú). Verify: `npm test -- packages/i18n`. Applied in group 1.
- [x] 2.4 [RED] `apps/web/src/contract/register.contract.test.ts` (new, imports `./register.ts`): `registerProblems(text)` flags each of `Ingrese`, `Elija`, `Utilice`, `Consulte`, `Contáctenos`, `Póngase`, `Verifique` and `verificá`, `calculá`, `consultá`, `elegí`, `tenés`, `podés`, `querés`, `sabés`, case-insensitively and as whole words (`VERIFICÁ` flagged; `Consultar`, `verifica`, `tienes`, `puedes` not flagged); seeded: an `es` module with `'x.y': 'Consulte la guía'` fails naming the key [ICW5]; `'x.y': 'verificá con un profesional'` fails naming the key and `verificá` [ICW9]; every real `es` module (glob of `packages/i18n/src/catalogs/es/*.ts`) yields no problems. Verify: fails (helper missing). Applied in group 1.
- [x] 2.5 [GREEN] `apps/web/src/contract/register.ts`: forms list and `registerProblems` using Unicode lookarounds (`(?<![\p{L}\p{N}])…(?![\p{L}\p{N}])` with flags `iu`), reusable by the Markdown test in PR 9. Verify: 2.4 passes. Applied in group 1.
- [x] 2.6 [RED] `apps/web/src/routing/routes.test.ts` and `routes.test-d.ts` (new): `LOCALE_TAGS` equals `{ en: 'en-US', es: 'es-US' }`; `ROUTES.home` is `{ en: '/', es: '/es' }`; pure `routeProblems(table)` accepts `ROUTES` and rejects seeded tables (duplicate path, uppercase, trailing slash `/x/`, non-ASCII `/es/metodología`, EN path starting `/es`, ES path not starting `/es`); `pathOf('home','es')` is `/es`; `urlOf('/')` is `https://maestrocalc.com/`, `urlOf('/es')` is `https://maestrocalc.com/es`; `alternatesOf('home')` equals `[{hreflang:'en-US',href:'https://maestrocalc.com/'},{hreflang:'es-US',href:'https://maestrocalc.com/es'},{hreflang:'x-default',href:'https://maestrocalc.com/'}]` [SR8, SR9 unit side]; `staticPaths()` for the current table equals `[{params:{path:undefined},props:{id:'home',locale:'en'}},{params:{path:'es'},props:{id:'home',locale:'es'}}]` and has length `2 × ids`; the `routes.ts` source imports from `@maestro-calc/i18n` only through `import type`; type test: for every `PageId`, `` `page.${PageId}.title` `` and `.description` are keys of `enSite`. Verify: fails (module missing). Applied in group 1.
- [x] 2.7 [GREEN] `apps/web/src/routing/routes.ts` per the design contract (`urlOf` builds on `SITE.url` from `../site.config.ts`). Verify: 2.6 passes. Applied in group 1.
- [x] 2.8 [RED] `apps/web/src/contract/site-catalog.contract.test.ts` (new): every `ROUTES` id has `page.<id>.title|description` in both locales and no other `page.<id>` exists except `notFound` [ICW4]; the derived `page.*` key count per locale equals `(ids + 1) × 2` [ICW1, derived form]; seeded: a catalog copy without `es` `page.contact.description` fails naming that key via `routeCatalogProblems` [ICW7]. Verify: fails (helper missing). Applied in group 1.
- [x] 2.9 [GREEN] `apps/web/src/contract/route-catalog.ts` with `routeCatalogProblems(ids, catalogs)`. Verify: 2.8 passes. Applied in group 1.
- [x] 2.10 [RED] `apps/web/src/seo/head.test.ts`: `headFor('home','en',text)` equals `{ title: text('page.home.title'), description: text('page.home.description'), canonical: 'https://maestrocalc.com/', alternates: <the three of 2.6> }` and `headFor('home','es',text).canonical` is `https://maestrocalc.com/es` [SE2 source, SR8, SR9]; for every `ROUTES` id canonical equals `urlOf(pathOf(id, locale))` and has no query or fragment; `notFoundHead('es',text)` equals `{ title, description, robots: 'noindex' }` with no `canonical` or `alternates` keys (`toStrictEqual`). Verify: fails. Applied in group 1.
- [x] 2.11 [GREEN] `apps/web/src/seo/head.ts` (`SiteText = (key: SiteKey) => string`). Verify: pass. Applied in group 1.
- [x] 2.12 [RED] `apps/web/src/seo/json-ld.test.ts`: `homeJsonLd('en')` equals `{ '@context': 'https://schema.org', '@graph': [ { '@type':'Organization', '@id':'https://maestrocalc.com/#organization', name:'Maestro Calc', url:'https://maestrocalc.com' }, { '@type':'WebSite', name:'Maestro Calc', url:'https://maestrocalc.com/', inLanguage:'en-US', publisher:{ '@id':'https://maestrocalc.com/#organization' } } ] }`; `es` has `url` `https://maestrocalc.com/es` and `inLanguage` `es-US`; no `logo` or `image` key [SE6, SE7]. `serializeJsonLd({ a: '</script><b>&' })` contains no `<`, `>` or `&` characters and `JSON.parse` returns the original value (escapes are `<`, `>`, `&`). Note: the spec requires `name` on `WebSite`; design W12 omits it, the spec wins. Verify: fails. Applied in group 1.
- [x] 2.13 [GREEN] `apps/web/src/seo/json-ld.ts`. Verify: pass. Applied in group 1.
- [x] 2.14 [RED] `apps/web/src/seo/sitemap.test.ts`: `sitemapXml()` parses to exactly `2 × ids` `<url>` blocks whose `<loc>` equal `urlOf` of every table path; each carries three `xhtml:link rel="alternate"` entries equal to `alternatesOf(id)` [SE10 derived, SE11 source]; the home block is `<url><loc>https://maestrocalc.com/</loc>` followed by `en-US` → `…/`, `es-US` → `…/es`, `x-default` → `…/`; no `404`, no `?`; XML special characters in a seeded table path are escaped. Verify: fails. Applied in group 1.
- [x] 2.15 [GREEN] `apps/web/src/seo/sitemap.ts`. Verify: pass. Applied in group 1.
- [x] 2.16 [RED→GREEN] Coverage: extend `apps/web/src/contract/coverage.contract.test.ts` to expect root `vitest.config.ts` coverage `include` to hold `apps/web/src/routing/**` and `apps/web/src/seo/**` with thresholds 100/100/100/100 (the `site-check` glob is added in PR 7 when its directory exists); then edit `vitest.config.ts`. Verify: `npm run test:coverage`. Applied in group 1.
- [x] 2.17 [REFACTOR] No behaviour change: `npm run format && npm run lint && npm run typecheck`; `rg -n "from '@maestro-calc/(core|data)'" apps/web/src/routing apps/web/src/seo` is empty. Applied in group 1.
- [ ] 2.18 Exit: SX1, SX3–SX7. PR body lists the scenarios covered (see traceability).

---

## PR 3 — Tokens, fonts, layout (`feat/web-shell-03-tokens-fonts-layout`)

Forecast: ~250 changed lines. Specs: site-shell (tokens, fonts, skip link, favicon, base layout). Green because: `npm run build` renders the smoke page inside the new `BaseLayout`; the smoke page (`src/pages/index.astro`) still exists and is only re-wrapped.

Planned commits: `build(web): add self-hosted Barlow fonts through the Astro Fonts API` · `feat(web): add Blueprint tokens and base styles` · `feat(web): replace the scaffold favicon with the brand mark` · `feat(web): add base layout, SEO head and skip link`.

- [x] 3.1 Create the branch from the PR 2 tip. Applied in group 1.
- [x] 3.2 [GREEN] SPIKE (recorded exception to RED-first): `npm ls astro`; add exact-pinned (no `^`/`~`) `@fontsource/barlow` and `@fontsource/barlow-condensed` to `apps/web/package.json`, record resolved versions in the PR body. Pass condition: a draft `fonts` block with `fontProviders.local()` and package-import `src` for the four variants builds and `fd -e woff2 . apps/web/dist` lists woff2 files. Fallback (only if the Fonts API or package-import `src` is unavailable in the installed Astro): committed `latin` woff2 copies under `apps/web/src/assets/fonts/` with hand-written `@font-face` including `size-adjust`; if neither works STOP and report `blocked`. Applied in group 1. Spike passed: Fonts API with `fontProviders.local()` and package-import `src` emits four woff2 files; no committed fonts.
- [x] 3.3 [RED] `apps/web/src/contract/fonts.contract.test.ts`: imported `astro.config.mjs` default `fonts` holds two families, `Barlow` (`--font-body`, weights 400 and 600) and `Barlow Condensed` (`--font-display`, weights 600 and 700), `display: 'swap'`, `latin` only, `fallbacks` containing `Arial`, `optimizedFallbacks` not `false`; both `@fontsource` versions match `^\d+\.\d+\.\d+$` [SS8 config side]; `astro.config.mjs` and every file under `apps/web/src/styles` contain none of `fonts.googleapis.com`, `fonts.gstatic.com`, `use.typekit.net`, `cdn.jsdelivr.net`, `unpkg.com` [SS9]. Verify: fails. Applied in group 1.
- [x] 3.4 [GREEN] `apps/web/astro.config.mjs`: add the `fonts` block from 3.2 (leave `integrations: [sitemap()]` until PR 6). Verify: 3.3 passes; `npm run build`. Applied in group 1.
- [x] 3.5 [RED] `apps/web/src/contract/contrast.ts` (+ `contrast.test.ts`: `contrast('#000000','#FFFFFF')` is 21) and `apps/web/src/styles/styles.contract.test.ts`: `:root` in `tokens.css` declares `#0E2240`, `#1D4ED8`, `#F06A1D`, `#56616B`, `#EEF1EF`, `#FFFFFF`, `#1FAF5A` case-insensitively and `color-scheme: light` [SS5]; no `prefers-color-scheme` in any stylesheet [SS6]; ground `#EEF1EF`, body text `#0E2240`; body `font-size` computes to at least 17 px (rem × 16) [SS11 source side]; contrast: ink on ground ≥ 4.5 (about 14), link `#1D4ED8` on ground ≥ 4.5 (about 5.9), secondary `#56616B` on ground ≥ 4.5 (about 5.6) [SS7]; focus rule uses a 3 px `#F06A1D` outline plus a 2 px `#0E2240` ring, never `outline: none`, orange on ground is below 3 (about 2.7, documents W6) and ink on ground and on surface is at least 3 [SS14, SS16]; skip link becomes visible on `:focus`; `--target-size` is 2.75rem (44 px). Verify: fails (files missing). Applied in group 1.
- [x] 3.6 [GREEN] `apps/web/src/styles/tokens.css` and `base.css` (reset, type scale, `:focus-visible` ring, skip link, `.prose` widths); body uses `var(--font-body)`, headings `var(--font-display)`. Verify: 3.5 passes. Applied in group 1.
- [x] 3.7 [RED] `apps/web/src/contract/favicon.contract.test.ts`: `apps/web/public/favicon.svg` starts with `<svg`, contains `#0E2240` or `#F06A1D`, contains no `linearGradient` (the Astro scaffold marker); `apps/web/public/favicon.ico` does not exist [SS17 file side]. Verify: fails. Applied in group 1.
- [x] 3.8 [GREEN] Replace `apps/web/public/favicon.svg` with a brand mark in the two colours; `git rm apps/web/public/favicon.ico`. Verify: 3.7 passes. Applied in group 1.
- [x] 3.9 [GREEN] SPIKE (recorded exception): render `.astro` components in vitest through `getViteConfig` in `apps/web/vitest.config.ts` and Astro's container API (`AstroContainer.create()` + `renderToString`). Pass condition: a throwaway test renders `SkipLink.astro` in the `web` project under vitest 5. Fallback: a `globalSetup` that runs `astro build` into a temp `outDir` and tests parse that HTML; record the choice in the PR body (it decides the shape of 3.10 and later component tests). Applied in group 1. Spike passed: Astro container API under vitest 5 via `getViteConfig` with an explicit root; no globalSetup build needed.
- [x] 3.10 [RED] Component tests (`apps/web/src/components/SkipLink.test.ts`, `SeoHead.test.ts`, `apps/web/src/layouts/BaseLayout.test.ts`): `SkipLink` renders `<a href="#main">` with its label prop; `SeoHead` renders `meta[charset="utf-8"]`, viewport exactly `width=device-width, initial-scale=1`, one `title`, one `meta[name=description]`, self canonical, three `link[rel=alternate][hreflang]`, `<link rel="icon" type="image/svg+xml" href="/favicon.svg">` [SS2, SS17], and for a `noindex` head: `meta[name=robots][content=noindex]`, no canonical, no alternates; `BaseLayout` emits `<!doctype html>`, `<html lang="en-US">` for `en` and `es-US` for `es` (from `LOCALE_TAGS`), the skip link as the first focusable element [SS3], one `main#main`, and two preload links for the fonts. Verify: fails. Applied in group 1.
- [x] 3.11 [GREEN] `apps/web/src/components/{SkipLink,SeoHead}.astro`, `apps/web/src/layouts/BaseLayout.astro` (two `<Font>` tags: `--font-body` preload weight 400, `--font-display` preload weight 700; styles imported once). Rewrap `apps/web/src/pages/index.astro` in `BaseLayout` with props from `headFor('home','en',…)` so `npm run build` exercises it. Verify: 3.10 passes. Applied in group 1.
- [x] 3.12 [RED→GREEN] Presentational boundary lint: extend `apps/web/src/contract/gates.contract.test.ts` so a virtual file under `apps/web/src/components/` importing `@maestro-calc/i18n`, `../routing/routes.ts` or `astro:content` is rejected by `no-restricted-imports`; then add the override in `eslint.config.js`. Verify: `npm test -- apps/web/src/contract/gates && npm run lint`. Applied in group 1.
- [x] 3.13 [REFACTOR] Runtime check: `npm run build`; `fd -e woff2 . apps/web/dist` lists the emitted files (record the count; if fewer than four, the scale and display styles must actually use weights 400, 600 and 600, 700 — adjust `base.css` so `SS8` ("exactly four") holds in PR 7); `rg -c "<script" apps/web/dist/index.html` is 0; `rg -n "fonts.g(oogleapis|static)" apps/web/dist` is empty; first focusable element of `dist/index.html` is the skip link. Applied in group 1. Runtime check: 4 woff2 emitted, 0 `<script`, no third-party font host, skip link first.
- [ ] 3.14 Exit: SX1, SX3–SX7.

---

## PR 4 — Header, footer, home route (`feat/web-shell-04-header-footer-home`)

Forecast: ~280 changed lines. Specs: site-shell (header, footer, landmarks, touch targets), site-routing-i18n (links, switch, lang). Green because: the catch-all builds `/` and `/es` from the table; the smoke page is deleted.

Planned commits: `feat(web): add link and language-switch helpers over the route table` · `feat(web): add header, wordmark, language switch and footer` · `feat(web): serve the home pages from the route table and drop the smoke page`.

- [x] 4.1 Create the branch from the PR 3 tip. Applied in group 1.
- [x] 4.2 [RED] `apps/web/src/routing/links.test.ts` and `switch.test.ts` (new; table injected with a fixture containing all six ids plus the real `ROUTES`): `linksFor(candidates, locale, table = ROUTES)` returns only candidates present in the table, as `{ id, href }` (fixture: header `['methodology','about']` → `/methodology`,`/about` and `/es/metodologia`,`/es/sobre-nosotros`; footer `['privacy','terms','contact']` → `/privacy`,`/terms`,`/contact` and `/es/privacidad`,`/es/terminos`,`/es/contacto`; with the real PR-4 table → `[]`) [SR2, SS12, SS13 logic]; `switchFor(id, locale, table)` returns `{ href, lang, hreflang }`: `home` en → `{ href:'/es', lang:'es', hreflang:'es-US' }`, es → `{ href:'/', lang:'en', hreflang:'en-US' }`, fixture `about` en → `/es/sobre-nosotros` [SR5]; `switchFor('notFound','en')` → `/es` and `('notFound','es')` → `/` [SR6]; never carries a query string. Verify: fails. Applied in group 1.
- [x] 4.3 [GREEN] `apps/web/src/routing/links.ts`, `switch.ts` (100 percent covered; already inside the coverage glob). Verify: pass. Applied in group 1.
- [x] 4.4 [RED] Component tests: `Wordmark` (text `Maestro Calc`, `href` prop), `LanguageSwitch` (`<a href lang="es" hreflang="es-US">Español</a>`), `SiteHeader` (wordmark, one `nav[aria-label]`, no `<ul>` when the link list is empty, then the switch), `SiteFooter` (link list prop, visible `contacto@maestrocalc.com` from `SITE.contactEmail` with the `site.footer.contactLabel` text, optional `mailto:` of the same address, no social/affiliate/analytics links, no `<nav>`); `BaseLayout` page-level landmarks: exactly one `header`, one `nav[aria-label]`, one `main#main`, one `footer` [SS1]; header wordmark `href` is `/` and `/es` [SS12 wiring]; `styles.contract.test.ts` additions: `.skip-link`, `.wordmark`, `.nav-link`, `.footer-link`, `.lang-switch` have `min-height` and `min-width` of `var(--target-size)` [SS15 source side]. Verify: fails. Applied in group 1.
- [x] 4.5 [GREEN] `apps/web/src/components/{Wordmark,LanguageSwitch,SiteHeader,SiteFooter}.astro`, `apps/web/src/lib/site-text.ts` (`siteText(locale)`: typed lookup over `enSite`/`esSite`, no fallback), `BaseLayout.astro` composes header/footer from `linksFor` and `switchFor`. Verify: 4.4 passes. Applied in group 1.
- [x] 4.6 [RED] `apps/web/src/views/HomeView.test.ts` and `apps/web/src/routing/static-paths-page.test.ts`: `HomeView` renders one `h1` from `page.home.heading` (`Maestro Calc` / `Maestro Calc`), inside `main`; the catch-all `getStaticPaths` equals `staticPaths()`; `<html lang>` is `en-US` for `/` and `es-US` for `/es` [SR4 wiring]. Verify: fails. Applied in group 1.
- [x] 4.7 [GREEN] `page.home.heading` in both `site` catalogs; `apps/web/src/views/HomeView.astro`; `apps/web/src/pages/[...path].astro` (`getStaticPaths = () => staticPaths()`, keeps the `@maestro-calc/i18n` import used to validate the locale); `git rm apps/web/src/pages/index.astro`. Verify: 4.6 passes; `npm test -- packages/i18n` (completeness picks up the new key). Applied in group 1.
- [x] 4.8 [REFACTOR] Runtime check: `npm run build`; `fd -e html . apps/web/dist` lists exactly `index.html` and `es.html`; `rg -o 'lang="[a-z-]+"' apps/web/dist/index.html apps/web/dist/es.html` gives `en-US`, `es-US`; the switch on `/` links `/es` and on `/es` links `/`; `rg -c '\b(errors|calc)\.[a-z]' apps/web/dist` finds no message text [ICW6 build side] (group 1 review REL-3: the earlier unanchored `errors\.|calc\.` also hit a sentence ending in "errors." and substrings such as "recalc."; the word boundary and the required letter after the dot match only catalog-style keys); SX1 order unchanged. Manual keyboard pass with `cd apps/web && npx astro dev --background` (Tab order: skip link, wordmark, switch, footer), then `npx astro dev stop`. Applied in group 1. Runtime check done on `dist`; the manual keyboard pass in a browser was not run (Tab order verified from DOM order only).
- [ ] 4.9 Exit: SX1, SX3–SX7.

---

## PR 5 — 404 pages, home copy, site config (`feat/web-shell-05-not-found-home-copy`)

Forecast: ~220 changed lines. Specs: site-routing-i18n (404 content, wrangler), trust-pages (home), site-shell (footer contact), trust-pages ([TP18] groundwork). Green because: `dist/404.html` and `dist/es/404.html` build and the placeholder tagline and address are gone.

Planned commits: `refactor(web): drop the placeholder tagline and move to contacto@maestrocalc.com` · `feat(web): add English and Spanish not-found pages` · `feat(web): write the home introduction from the site tagline`.

- [ ] 5.1 Create the branch from the PR 4 tip.
- [x] 5.2 [RED] `apps/web/src/contract/site-config.contract.test.ts` and a type test: `'tagline' in SITE` is `false` (type test: `SITE['tagline']` needs `@ts-expect-error`); `SITE.contactEmail` is `contacto@maestrocalc.com`; no file under `apps/web/src` or `apps/web/public` contains `hello@maestrocalc.com` or `SITE.tagline` [TP18 source side]. Verify: fails. Applied in group 1 correction (pulled forward from PR 5): `apps/web/src/contract/site-config.contract.test.ts` holds the address, the absent `tagline`/`locale` keys (with `@ts-expect-error`) and the no-`hello@` scan of `apps/web/src` and `apps/web/public`.
- [x] 5.3 [GREEN] `apps/web/src/site.config.ts`: delete `tagline`, set `contactEmail: 'contacto@maestrocalc.com'`, update the header comment. Verify: 5.2 passes; `npm run typecheck`. Applied in group 1 correction (also removed the unused `SITE.locale`).
- [ ] 5.4 [RED] `apps/web/src/contract/jsonc.ts` (+ test) reads JSONC through `ts.parseConfigFileTextToJson` (no new dependency), and `apps/web/src/contract/wrangler.contract.test.ts`: the root `wrangler.jsonc` (the file lives at the repository root, not in `apps/web`; the design names the wrong path) has `assets.not_found_handling === '404-page'` [SR15] and `html_handling === 'drop-trailing-slash'`. Written against code that is already green (characterization): spot check by temporarily setting `404-page` to `single-page-application` and seeing it fail, then restore.
- [ ] 5.5 [RED] `apps/web/src/views/NotFoundView.test.ts`: for `en`/`es`: `<html lang>` `en-US`/`es-US`; `meta[name=robots][content~=noindex]`; no canonical and no hreflang link [SR14]; exactly one `h1` (`Page not found` / `Página no encontrada`) inside `main`; a link `href="/"` (EN) or `/es` (ES) with text `Go to the home page` / `Ir a la página de inicio`; the language switch links `/es` and `/` respectively [SR6]; `<title>` equals `page.notFound.title` [SE2 for notFound]. Verify: fails.
- [ ] 5.6 [GREEN] Catalog keys `page.notFound.heading` (above), `page.notFound.body` (`The page you are looking for does not exist or has moved.` / `La página que buscas no existe o cambió de lugar.`), `page.notFound.homeLink`; `apps/web/src/views/NotFoundView.astro`, `apps/web/src/pages/404.astro` (en), `apps/web/src/pages/es/404.astro` (es), both using `notFoundHead`. Verify: 5.5 passes; `npm run build` emits `dist/404.html` and `dist/es/404.html`.
- [ ] 5.7 [RED] `apps/web/src/views/HomeView.test.ts` additions: the introduction paragraph contains `site.tagline` verbatim for each locale; `main` of `/` and `/es` has no `ul`/`ol` (no list of upcoming calculators) and the case-insensitive text contains none of `coming soon`, `próximamente`, `pronto`, `trusted by`, `miles de`, `stars`, `estrellas` [TP8]; the same terms are absent from every `page.home.*` catalog value. Verify: fails.
- [ ] 5.8 [GREEN] `page.home.intro` in both catalogs (at most two short sentences, built around the tagline, honest about the current state, neutral tú) rendered by `HomeView.astro`. Methodology/about links are not added here (they arrive with the pages in PR 9). Verify: 5.7 passes; `npm test -- packages/i18n apps/web` (register test covers the new copy).
- [ ] 5.9 [REFACTOR] Runtime check: `npm run build`; HTML set is `index.html`, `es.html`, `404.html`, `es/404.html`; `rg -n "hello@" apps/web/dist` is empty; footer shows `contacto@maestrocalc.com` on both homes [SS13 contact text].
- [ ] 5.10 Exit: SX1, SX3–SX7.

---

## PR 6 — Sitemap, robots, JSON-LD (`feat/web-shell-06-endpoints-jsonld`)

Forecast: ~250 changed lines. Specs: site-seo (robots, sitemap, structured data). Green because: `dist/sitemap.xml` is built from the table and `@astrojs/sitemap` is gone.

Planned commits: `feat(web): serve sitemap.xml and robots.txt from the route table` · `feat(web): add Organization and WebSite JSON-LD to the home pages` · `build(web): remove the sitemap integration`.

- [ ] 6.1 Create the branch from the PR 5 tip.
- [ ] 6.2 [RED] `apps/web/src/seo/sitemap-endpoint.test.ts` (kept out of `src/pages`, where Astro would build any `.ts` as an endpoint): importing `../pages/sitemap.xml.ts`, `GET()` returns status 200, `content-type` `application/xml; charset=utf-8` and a body equal to `sitemapXml()`; `apps/web/package.json` has no `@astrojs/sitemap` and `astro.config.mjs` has no `sitemap(` call [SE12 source side]. Verify: fails.
- [ ] 6.3 [RED] `apps/web/src/contract/robots.contract.test.ts`: `apps/web/public/robots.txt` lines are exactly `User-agent: *`, `Allow: /`, `Sitemap: https://maestrocalc.com/sitemap.xml`; no line starts with `Disallow: /` [SE9]. Verify: fails.
- [ ] 6.4 [RED] `SeoHead.test.ts` additions: with a `jsonLd` string prop it renders exactly one `<script type="application/ld+json">` whose text parses to the object; without it, no `<script>` at all; `HomeView` passes `serializeJsonLd(homeJsonLd(locale))` for both locales (types exactly `Organization` and `WebSite`, no `logo`) [SE6, SE7 render side]; no other view passes it. Verify: fails.
- [ ] 6.5 [GREEN] `apps/web/src/pages/sitemap.xml.ts` (`GET`), `apps/web/public/robots.txt`, `jsonLd` prop in `SeoHead.astro` wired from `HomeView`. Verify: 6.2–6.4 pass.
- [ ] 6.6 [GREEN] Remove `@astrojs/sitemap` from `apps/web/package.json`, `astro.config.mjs` (`integrations` becomes empty or is dropped) and the lockfile. Verify: `npm ls @astrojs/sitemap` reports it missing; `npm run build`.
- [ ] 6.7 [REFACTOR] Runtime check: `fd 'sitemap' apps/web/dist` lists only `sitemap.xml` [SE12]; a Node one-liner counts `<loc>` equal to `2 × ids` (now 2) with three alternates each, equal to the head hreflang of `dist/index.html` and `dist/es.html` [SE10, SE11]; `dist/robots.txt` as in 6.3; `dist/index.html` contains exactly one JSON-LD block and `dist/404.html` none; `/sitemap-index.xml` and `/sitemap-0.xml` are gone (record in the PR body; submit `/sitemap.xml` to Search Console after PR 10).
- [ ] 6.8 Exit: SX1, SX3–SX7.

---

## PR 7 — `check:site` (`feat/web-shell-07-check-site`)

Forecast: ~380 changed lines (at the cap). Specs: site-seo (gate, [SE1]–[SE15]), site-routing-i18n ([SR1], [SR2], [SR10]), site-shell (built-HTML checks), quality-gates ([QGW5], [QGW6]), monorepo-workspace ([MWW3] part, [MWW4]). Green because: `verify` runs `build → check:site → check:dist`. Contingency: split `07a` (7.2–7.13, rules) / `07b` (7.14–7.19, CLI, scripts, CI).

Planned commits: `build(web): add node-html-parser for built-HTML checks` · `feat(web): add page-set, head and canonical checks` · `feat(web): add structure, link and zero-JS checks` · `feat(web): add sitemap, robots and JSON-LD checks` · `feat(web): add the check:site CLI` · `ci: run check:site between build and check:dist`.

- [ ] 7.1 Create the branch from the PR 6 tip.
- [ ] 7.2 [GREEN] Add `node-html-parser` to `apps/web` devDependencies, exact version; record that it pulls `entities` and `css-select` (so it is not dependency-free; design W8). Verify: `npm ls node-html-parser`.
- [ ] 7.3 [GREEN] SPIKE (recorded exception): confirm Node 24 type stripping runs `apps/web/scripts/check-site.ts` when it imports `../src/routing/routes.ts` and `@maestro-calc/i18n/catalogs/en/site` (a symlinked workspace file resolves outside `node_modules`). Pass condition: `node apps/web/scripts/check-site.ts` prints a stub line. Fallback if refused (`ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING`): pass the expected titles to the CLI through relative imports kept inside `apps/web`; if no variant works STOP and report `blocked`.
- [ ] 7.4 [RED] `apps/web/src/site-check/__testing__/page-fixture.ts` (valid page builder for any id/locale) and `checks.test.ts` part 1: `expectedFiles(routes)` for `ROUTES` equals `index.html`, `es.html`, `404.html`, `es/404.html` (for any table: `/x`→`x.html`, `/es/x`→`es/x.html`); an extra HTML file is reported as an orphan, a missing one by name [SR1 derived]; `pageCount(routes) = 2 × ids + 2` [SE14 derived]. Verify: fails.
- [ ] 7.5 [GREEN] `apps/web/src/site-check/checks.ts` (`Problem = { file, rule, message }`): file-set rules. Verify: pass.
- [ ] 7.6 [RED] `checks.test.ts` part 2 (head), each rule with a seeded failure naming the file: `lang` is `en-US` for non-`/es` paths and `es-US` otherwise [SR4]; charset and viewport exact, no `maximum-scale` [SS2]; title 10–60 chars, non-home ends ` | Maestro Calc`, unique [SE1]; title equals the catalog value for the page id, including `notFound` [SE2]; exactly one description 70–160 chars, unique across routable pages [SE1]; missing description fails [SE3]; canonical is the absolute self URL (removed canonical fails naming the page [SE15]); exactly three hreflang values with `en-US`/`es-US`/`x-default` equal to `alternatesOf` [SR8, SR9]; reciprocity: with `/es/privacidad` no longer listing `/privacy` the failure names both pages [SR10]; 404 pages: `noindex`, no canonical, no hreflang [SR14]; routable pages carry no `noindex` [SE13]. Verify: fails.
- [ ] 7.7 [GREEN] head rules in `checks.ts`. Verify: pass.
- [ ] 7.8 [RED] `checks.test.ts` part 3 (body): exactly one `header`, one `nav[aria-label]` non-empty, one `main#main`, one `footer`, one non-empty `h1` inside `main` [SS1]; a second `h1` fails naming the page [SE4]; no heading level jumps by more than one [SE5]; first focusable element is `a[href="#main"]` [SS3]; every internal `href` is a table path (+ optional `#fragment`), a bare fragment, `/favicon.svg` or `mailto:contacto@maestrocalc.com`, and every fragment resolves to an id on the target page [SR2]; switch `href` equals the table counterpart and on 404 pages the other home [SR5, SR6]; header and footer links equal `linksFor` of the page's locale [SS12, SS13]; `link[rel=icon][type="image/svg+xml"][href="/favicon.svg"]` exists and `dist/favicon.svg` is valid SVG with `#0E2240` or `#F06A1D` and no `linearGradient` [SS17]. Verify: fails.
- [ ] 7.9 [GREEN] structure/link rules. Verify: pass.
- [ ] 7.10 [RED] `checks.test.ts` part 4 (zero JS, third parties, CSS): the only `<script>` has `type="application/ld+json"`; no `on*=` attribute, `astro-island`, or `rel=modulepreload` [SS18]; any `.js`/`.mjs` file in `dist` fails [SQ8 early form]; no subresource (`src`, stylesheet/preload/icon `href`, CSS `url()`) points off-origin and none of the five font hosts appears [SS9]; CSS holds the seven palette hex values, `color-scheme: light` and no `prefers-color-scheme` [SS5, SS6]; exactly four `.woff2` files, every `@font-face` has `font-display: swap`, every `src: url()` is a same-origin relative path [SS8]. Verify: fails.
- [ ] 7.11 [GREEN] zero-JS/CSS rules. Verify: pass.
- [ ] 7.12 [RED] `checks.test.ts` part 5 (content, robots, sitemap, JSON-LD): built text (case-insensitive) contains none of `ownerReview`, `draft`, `borrador`, `pending review` (a bare `pending` is allowed) [TP5]; no `hello@maestrocalc.com` anywhere under `dist` [TP18]; `countPending(entries)` reads `ownerReview: pending` frontmatter under `apps/web/src/content/pages` (0 when the directory is absent) and is reported, never failed [TP4 evidence]; `robots.txt` as in 6.3 [SE9]; sitemap `<loc>` set equals the table URLs, each with three alternates equal to the page head set, no 404, no `?` [SE10, SE11]; only `sitemap.xml` exists [SE12]; home JSON-LD parses, types exactly `Organization` + `WebSite`, no `logo`/`image`, `WebSite.url` equals the canonical, `inLanguage` equals the locale tag [SE6, SE7]; malformed JSON-LD fails [SE8]; other pages' JSON-LD must not declare `Product`, `Review`, `AggregateRating`, `FAQPage`, `BreadcrumbList` or `Person`. Verify: fails. Carry-over (group 1 review REL-3): the ICW6 message scan of `dist` uses `\b(errors|calc)\.[a-z]`, never `errors\.|calc\.`.
- [ ] 7.13 [GREEN] content/sitemap/JSON-LD rules. Verify: pass; `site-check/checks.ts` at 100 percent.
- [ ] 7.14 [RED] `apps/web/src/site-check/cli.test.ts` (spawns `node apps/web/scripts/check-site.ts <dir>` over temp copies of a generated valid `dist`; fixed arguments only): exit 0 prints `check:site: checked 4 pages` (`2 × ids + 2`) and `pending ownerReview entries: 0`; seeded copies exit 1 and name the file: removed description [SE3], two `h1` [SE4], removed canonical [SE15], malformed JSON-LD [SE8], broken reciprocity naming both pages [SR10]; with the default directory missing the message is `check:site: apps/web/dist not found. Run \`npm run build\` first.` and exit 1 [MWW3 message]. Verify: fails.
- [ ] 7.15 [GREEN] `apps/web/scripts/check-site.ts` (reads `dist`, runs the rules, prints problems as `file: rule: message`, exits 1 on any); `apps/web/package.json` script `check:site`. Verify: 7.14 passes; `npm run build && npm run check:site -w @maestro-calc/web` exits 0.
- [ ] 7.16 [RED] `ci.contract.test.ts` and `manifest.contract.test.ts`: the `verify` job's `run` steps in order are `npm ci`, `format:check`, `sync`, `lint`, `typecheck`, `test:coverage`, `build`, `check:site`, `check:dist` with `check:site` immediately after `build` and `check:dist` the last `npm run` step, none with `continue-on-error` [QGW5]; root `scripts.check:site` exists [MWW3]; the root `verify` script ends `npm run build && npm run check:site && npm run check:dist` [MWW4]; `mutation` does not list `site-browser` and the reverse (vacuous until PR 8). Verify: fails.
- [ ] 7.17 [GREEN] Root `package.json` (`check:site` delegating to the web workspace, `verify` updated), `.github/workflows/ci.yml` (`npm run check:site` step), root `vitest.config.ts` coverage `include` + `coverage.contract.test.ts` gain `apps/web/src/site-check/**` at 100. Verify: `npm run verify`.
- [ ] 7.18 [REFACTOR] Negative proofs (temporary, logs in the PR body): remove the canonical line from `SeoHead.astro` → `npm run build && npm run check:site` exits non-zero naming the page, so on CI `verify` fails at that step and `mutation` does not start [QGW6]; add a `<script>` to `BaseLayout.astro` → non-zero [SS18]. Revert; `git status --porcelain` clean.
- [ ] 7.19 Exit: SX1 (now with `check:site`), SX3–SX7. Verify: `npm run verify`.

---

## PR 8 — Browser gate (`feat/web-shell-08-browser-gate`)

Forecast: ~330 changed lines (most files of any slice). Specs: site-quality (axe, smoke, headers, CI job), monorepo-workspace ([MWW1]–[MWW3], [MWW5]), quality-gates ([QGW5], [QGW7]), site-routing-i18n (browser scenarios). Green because: the `site-browser` job passes against `wrangler dev` with `wrangler.e2e.jsonc`. Contingency: split `08a` (8.2–8.8, 8.11 tooling skeleton, contracts, `_headers`) / `08b` (8.9–8.10, 8.12–8.14 specs and CI).

Planned commits: `build(repo): add the site-browser tooling package` · `build(web): add security headers and asset caching` · `test(web): add axe and phone smoke against wrangler dev` · `ci: add the site-browser job and dist artifact`.

- [ ] 8.1 Create the branch from the PR 7 tip.
- [ ] 8.2 [RED] `apps/web/src/contract/browser-tooling.contract.test.ts`: no manifest under `packages/*` mentions `playwright`, `axe-core`, `lhci` or `wrangler`; `packages/core/package.json` has no `dependencies` [MWW1]; root `workspaces` does not list `tooling/site-browser`; `tooling/site-browser/package.json` is `private`, pins `wrangler`, `@playwright/test`, `@axe-core/playwright` exactly (no `^`/`~`), and its lockfile exists; the root `package-lock.json` has none of those names, and the `verify` job has no `playwright install` step [MWW2]; dependabot has an `npm` entry with `directory: /tooling/site-browser` (weekly, a `playwright` group for `@playwright/*` and `playwright*`) so the second lockfile is covered (design risk); `tooling/site-browser/tsconfig.json` extends `../../tsconfig.base.json`, includes `e2e` and the root `*.ts` configs, and maps `@maestro-calc/i18n` to `../../packages/i18n/src/index.ts` through `paths`, so the type-only import in `apps/web/src/routing/routes.ts` resolves without a root install. Verify: fails.
- [ ] 8.3 [RED] `apps/web/src/contract/wrangler-e2e.contract.test.ts`: `assetsProblems(root, e2e)` over the root `wrangler.jsonc` and `tooling/site-browser/wrangler.e2e.jsonc`: `assets.html_handling` and `not_found_handling` equal; `resolve(repoRoot, root.assets.directory) === resolve(toolingDir, e2e.assets.directory)` (resolved paths, never string equality: root is `./apps/web/dist`, e2e is `../../apps/web/dist`); the e2e config has no `build`; `name` and `compatibility_date` equal. Seeded: an e2e directory `../../apps/web/dist2` fails. Verify: fails.
- [ ] 8.4 [RED] Tooling exclusion in `gates.contract.test.ts`: `new ESLint().isPathIgnored('tooling/site-browser/e2e/smoke.spec.ts')` is `true`; no file listed by the root `tsconfig*.json` programs (via `ts.parseJsonConfigFileContent`) is under `tooling/`; no root vitest project includes `tooling/`; Prettier still checks `tooling/` sources but ignores `tooling/site-browser/package-lock.json`. Verify: fails (not yet excluded).
- [ ] 8.5 [RED] `apps/web/src/contract/headers.contract.test.ts` parsing `apps/web/public/_headers`: the `/*` block holds `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` with `camera=()`, `microphone=()`, `geolocation=()`, and `Content-Security-Policy: default-src 'self'; script-src 'none'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'` [SQ12]; `/_astro/*` has `Cache-Control: public, max-age=31536000, immutable`; no rule marks a path ending `.html` (or `/*`) immutable; every built `dist/_astro/*` name matches the immutable rule [SQ13]; no `Set-Cookie`. Verify: fails.
- [ ] 8.6 [RED] `ci.contract.test.ts`: job `site-browser` has `needs: verify` only (no `mutation`), no `if`, no path filters, `timeout-minutes` ≤ 10, no job-level `permissions` override (top level stays `{ contents: read }`), `env.WRANGLER_SEND_METRICS: 'false'`, no `continue-on-error`; steps include `actions/download-artifact` of the dist artifact, `actions/setup-node` with `node-version-file: .nvmrc` and `cache-dependency-path: tooling/site-browser/package-lock.json`, `npm ci --prefix tooling/site-browser`, an `actions/cache` step on `~/.cache/ms-playwright` keyed on the Playwright version, a browser install naming `chromium` and neither `firefox` nor `webkit`, `npm run test:e2e`, and artifact uploads with `if: failure()` only [SQ15, SQ16]; `mutation` does not need `site-browser` and `site-browser` does not need `mutation` [QGW7]; `verify` ends with `actions/upload-artifact` of `apps/web/dist` after `npm run check:dist` (the 7.16 test already treats `check:dist` as the last `run` step, so an upload `uses` step does not break [QGW5]); `playwright.config.ts` text sets `WRANGLER_SEND_METRICS: 'false'` on the web server. Verify: fails.
- [ ] 8.7 [GREEN] `tooling/site-browser/`: `package.json` (exact pins; scripts `test` = `playwright test`, `typecheck` = `tsc -p tsconfig.json`), generated `package-lock.json` (`npm install --package-lock-only --prefix tooling/site-browser`, then `npm ci`), `tsconfig.json` (8.2), `wrangler.e2e.jsonc` (same `assets` block, `directory: "../../apps/web/dist"`, no `build`), `playwright.config.ts` (one project `phone`: Chromium headless shell, viewport 390×844, `deviceScaleFactor: 3`, `isMobile`, `hasTouch`; `forbidOnly: true`, `retries: 0`; `webServer` runs `npx wrangler dev --config wrangler.e2e.jsonc --port 8787 --ip 127.0.0.1` with `env: { WRANGLER_SEND_METRICS: 'false' }`, `reuseExistingServer: false`). Verify: 8.2, 8.3 pass; `npx tsc -p tooling/site-browser` exits 0 (resolves the type-only i18n import).
- [ ] 8.8 [GREEN] Exclusions and ignore files: `eslint.config.js` ignores `tooling/**`; confirm root tsconfigs do not include it; `.prettierignore` gets `tooling/site-browser/package-lock.json`; `.gitignore` gets `tooling/site-browser/node_modules`, `tooling/site-browser/playwright-report`, `tooling/site-browser/test-results`, `.lighthouseci`; `.github/dependabot.yml` gets the `/tooling/site-browser` entry. Verify: 8.4 passes; after an e2e run `git status --porcelain` shows none of those directories ("Ignored artifacts").
- [ ] 8.9 [RED] `tooling/site-browser/e2e/urls.ts` (derived: `routable = Object.values(ROUTES).flatMap(({en,es}) => [en,es])`, unknown probes `/does-not-exist`, `/essay`, `/es/does-not-exist`, `/es/a/b/c`) and `e2e/a11y.spec.ts`: axe with tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa` on every routable URL and on `/does-not-exist` and `/es/does-not-exist` (the two 404 responses); `violations.length` must be 0 and the failure message lists page and rule ids [SQ1, SS7 via `color-contrast`]; self-test (seeded): `page.setContent('<html lang="en"><title>t</title><img src="x.png">')` reports `image-alt` and the formatter names the page and rule [SQ2]. Verify: `npm run test:e2e` runs and the self-test passes; the page scans may already pass (record).
- [ ] 8.10 [RED] `e2e/smoke.spec.ts` on the phone project: for `/`, the first inner page in `ROUTES` (if any) and `/es` equivalents, and both unknown paths: status 200 (404 for unknown), expected `lang`, one visible `h1`, `scrollWidth <= innerWidth`, header/footer/switch links work [SQ3, SQ4]; every request origin equals the server origin and none is of type `script`, with zero console CSP violation messages [SQ5, SQ14, SS19]; keyboard: first Tab focuses a visible skip link (non-zero box in the viewport), Enter sets `location.hash` to `#main` [SS4]; each header, footer and skip-link element focused by keyboard has `outline-color` `rgb(240, 106, 29)` and width ≥ 2 px [SS14]; body `font-size` ≥ 17 px [SS11]; boxes of header, footer and skip-link interactive elements ≥ 44×44 on `/` and `/es` [SS15]; each routable path answers 200 with `request().redirectedFrom()` null [SR3]; the switch round trip (`path` → counterpart → `path`) holds for every routable page, covering `/privacy` once it exists [SR7]; `/does-not-exist`, `/essay` → 404 `lang="en-US"`; `/es/does-not-exist`, `/es/a/b/c` → 404 `lang="es-US"` [SR11, SR12]; `/es/` ends 200 on `/es` with at most one redirect (307) [SR13]; headers on `/` and `/_astro/*` match `_headers`, `/_headers` is 404 (design Workers rows). Verify: `npm run test:e2e`; expected RED: the header assertions fail (no `_headers` yet). Other failures are real defects to fix in this PR.
- [ ] 8.11 [GREEN] `apps/web/public/_headers` as in 8.5. Fix any defect 8.9/8.10 expose in tokens, components or markup (each fix gets its own scoped commit). Verify: 8.5 passes and `npm run test:e2e` is green. Carry-over (group 1 review RES-2): add a `/_astro/*` block with `Cache-Control: public, max-age=31536000, immutable` to `_headers` (the hashed fonts and CSS never change under one name), with a line in 8.5's contract test.
- [ ] 8.12 [GREEN] CI and entry points: `.github/workflows/ci.yml` (`site-browser` job per 8.6; `verify` uploads the dist artifact), root `package.json` `test:e2e` (`npm test --prefix tooling/site-browser`); `AGENTS.md` (scripts `check:site`, `test:e2e`, the `npm ci --prefix tooling/site-browser` and `npx playwright install chromium` steps, the `tooling/` exclusion); `openspec/config.yaml` (`check:site` and `test:e2e` commands, e2e marked available) [MWW3, MWW5]. Verify: `npm test -- apps/web/src/contract`.
- [ ] 8.13 [REFACTOR] Negative proofs (temporary, logs in the PR body): add `<img src="https://example.com/x.png">` to the home → smoke fails [SQ5, SQ14]; delete `_headers` → header assertions fail; drop the skip link → [SS4] fails. Revert. Verify: `git status --porcelain` clean.
- [ ] 8.14 Evidence: open a draft PR and confirm `site-browser` runs (also on a docs-only follow-up commit), its wall time is under 10 minutes and the post-deploy-only rows (`/x`, `/es/x`, one header in production) are listed for the owner in task F.1 [SQ16]. Local first run: `npm ci --prefix tooling/site-browser && npx --prefix tooling/site-browser playwright install --only-shell chromium && npm run build && npm run test:e2e`.
- [ ] 8.15 Exit: SX1, SX3–SX8.

---

## PR 9 — Content collection, methodology, about (`feat/web-shell-09-trust-methodology-about`)

Forecast: ~380 changed lines. Specs: trust-pages ([TP1]–[TP3], [TP5]–[TP7], [TP9]–[TP11], [TP19], [TP20]), site-shell ([SS12]), site-routing-i18n (table rows). Green because: `verify` and `site-browser` gate the new pages. Contingency: split `09a` (9.2–9.5, schema, contract, view) / `09b` (9.6–9.9, rows, copy, rules).

Planned commits: `feat(web): add the pages content collection and schema` · `feat(web): add the trust page view` · `feat(web): add methodology and about pages in English and Spanish`.

- [ ] 9.1 Create the branch from the PR 8 tip.
- [ ] 9.2 [RED] `apps/web/src/content/schema.test.ts` (`pageSchema` over `astro/zod`, kept in plain TS): valid `{ id:'about', locale:'en', updated:'2026-10-23', ownerReview:'pending' }` parses; `ownerReview:'maybe'`, `updated:'23/10/2026'`, an impossible date `2026-02-30`, an unknown `id`, an unknown extra field and a missing field each fail [TP2 schema side]. Verify: fails.
- [ ] 9.3 [GREEN] `apps/web/src/content/schema.ts`, `apps/web/src/content.config.ts` (`pages` collection, glob loader over `content/pages/{en,es}/*.md`, strict schema). Verify: 9.2 passes.
- [ ] 9.4 [RED] `apps/web/src/contract/content.contract.test.ts` over the real files: the set of `<locale>/<id>.md` equals the trust ids of `ROUTES` (ids except `home`) × `['en','es']`, each frontmatter `id`/`locale` equals its path; a lone `privacy` EN fixture fails naming `privacy` and `es` [TP3]; the number of entries is `2 × trust ids` [TP1 derived]; exactly one `# ` H1 per body; `h2` counts equal between locales for each id [TP20]; methodology has at least two `h2`, a link to the about corrections anchor (`](/about#corrections)`, `](/es/sobre-nosotros#correcciones)`), and none of `certified`, `licensed engineer`, `ingeniero licenciado`, `certificado por` [TP9]; about has raw `<h2 id>` for `editorial-policy`, `ai-use`, `corrections` (EN) and `politica-editorial`, `uso-de-ia`, `correcciones` (ES), each exactly once, plus `Maestro Calc Editorial Team` / `Equipo editorial de Maestro Calc`, no `Person` JSON-LD, and `SITE.author.url === pathOf('about','en')` [TP10, TP11]; the AI section says content is AI-assisted and verified by people; any e-mail address in a file equals `SITE.contactEmail`; Spanish files pass `registerProblems`, with seeded entries `Consulte …` and a terms entry `verificá con un profesional y el código local` each failing naming the entry and the form [TP19]. Frontmatter validity is tested, but `ownerReview` is never pinned to `pending` (the owner flips it to `approved` before archive; TP4 is evidenced by the `check:site` count). Verify: fails.
- [ ] 9.5 [RED] `routes.test.ts`/`routes.test-d.ts` and component tests: table gains `methodology` (`/methodology`, `/es/metodologia`) and `about` (`/about`, `/es/sobre-nosotros`); the type test requires `page.methodology.*` and `page.about.*`; header nav hrefs are `/methodology`,`/about` and `/es/metodologia`,`/es/sobre-nosotros`, wordmark `/` and `/es` [SS12]; `HomeView` `main a[href]` contains the methodology and about paths per locale [TP7]; `TrustPageView` renders the entry's H1 inside `main`, a `<time datetime="2026-10-23">` equal to `updated` [TP6], and no `ownerReview`, `draft`, `borrador`, `pending review` text [TP5]; links in prose are table paths. Verify: fails.
- [ ] 9.6 [GREEN] `routes.ts` rows; catalog keys `page.methodology.title|description`, `page.about.title|description` and `page.home.links.methodology|about` (`How we calculate` / `Cómo calculamos`; `About Maestro Calc` / `Sobre Maestro Calc`) in both locales (titles `Methodology | Maestro Calc`, `About | Maestro Calc`, `Metodología | Maestro Calc`, `Sobre nosotros | Maestro Calc`; descriptions 70–160 chars); `apps/web/src/views/TrustPageView.astro` (container: entry lookup, Markdown render, `<time>` formatted by `Intl.DateTimeFormat` with the locale tag and `timeZone: 'UTC'`); catch-all dispatches `home` to `HomeView` and other ids to `TrustPageView`; `HomeView` links. Verify: 9.5 passes.
- [ ] 9.7 [GREEN] Markdown: `apps/web/src/content/pages/{en,es}/{methodology,about}.md`, frontmatter `ownerReview: pending`, `updated: 2026-10-23`. Methodology: exact calculations (no hidden rounding before display), every formula tested with hand-verified cases, sources with review date on each calculator page, corrections per the about page; no calculators, formulas or yields that do not exist; no certification claims. About: team authorship only, three anchored `<h2 id>` sections, AI-assisted and verified by people, corrections by `contacto@maestrocalc.com` with a dated log. Neutral tú. Verify: 9.4 passes.
- [ ] 9.8 [RED→GREEN] `site-check`: rule that every trust page has `time[datetime]` equal to its entry's `updated` (units in `checks.test.ts`, seeded mismatch fails naming the page) [TP6 built side]; wire into the CLI. Verify: `npm test -- apps/web/src/site-check`; coverage 100.
- [ ] 9.9 [REFACTOR] Negative proof: temporarily set `updated: 23/10/2026` in `about.md` → `npm run build` exits non-zero naming the entry [TP2]; revert. Runtime: `npm run verify` (check:site prints `checked 8 pages` and `pending ownerReview entries: 4`, the TP4 evidence) and `npm run test:e2e` (new URLs picked up from `ROUTES`; axe on the four pages); `dist` holds `methodology.html`, `about.html`, `es/metodologia.html`, `es/sobre-nosotros.html`; sitemap lists 6 URLs.
- [ ] 9.10 Exit: SX1, SX3–SX8.

---

## PR 10 — Privacy, terms, contact (`feat/web-shell-10-trust-legal-contact`)

Forecast: ~370 changed lines. Specs: trust-pages ([TP12]–[TP18]), the pinned end-state of [SR1], [SE10], [SE14], [ICW1], [TP1], site-shell ([SS13]). Green because: the table reaches 6 ids and the pinned `12 + 2` assertion passes. Contingency: split `10a` (privacy, terms) / `10b` (contact, pinned assertions).

Planned commits: `test(web): pin the 12 routable plus 2 not-found end state` · `feat(web): add privacy, terms and contact pages` · `feat(web): check cookie and storage facts in check:site`.

- [ ] 10.1 Create the branch from the PR 9 tip.
- [ ] 10.2 [RED] `apps/web/src/contract/end-state.contract.test.ts` (the only pinned counts): `Object.keys(ROUTES).length === 6`; `staticPaths().length === 12`; routable URLs 12 and `pageCount(ROUTES) === 14` [SR1, SE14]; each locale has exactly 14 `page.*` keys [ICW1]; content entries 10 [TP1]; `sitemapXml()` has 12 `<loc>` [SE10]. Verify: fails (3 ids, 6 routable, 8 pages).
- [ ] 10.3 [RED] `content.contract.test.ts` additions: privacy EN/ES contain `Cloudflare`, `does not use cookies` / `no usa cookies`, `before we add analytics or advertising` / `antes de añadir analítica o publicidad` and the contact address, and none (case-insensitive) of `Google Analytics`, `GA4`, `Tag Manager`, `GTM`, `AdSense`, `Mediavine`, `Raptive`, `Amazon`, `affiliate`, `afiliad` [TP13, TP14]; terms EN contain `estimates`, `local code`, `as is`; ES `estimaciones`, `código local`, `tal cual`, and none of `governed by`, `jurisdiction`, `LLC`, `Inc.`, `se rige por`, `jurisdicción` [TP15, TP16]; contact contains `contacto@maestrocalc.com` and the prompt `Found an error?` / `¿Encontraste un error?`, no `<form`, no `<script`, no response-time promise (`/\b(within|in)\s+\d+\s+(hour|day|business)/i`, `/\ben\s+\d+\s+(hora|día)/i`) [TP17]. Verify: fails (files missing). Pinned phrases are the test's constants; the copy follows them.
- [ ] 10.4 [RED] `apps/web/src/components/SiteFooter.test.ts` addition using the real `ROUTES`: footer hrefs are `/privacy`,`/terms`,`/contact` (EN) and `/es/privacidad`,`/es/terminos`,`/es/contacto` (ES) and `contacto@maestrocalc.com` is visible on both [SS13]. Verify: fails.
- [ ] 10.5 [RED] `site-check` rules (`checks.test.ts` + CLI seeded copies): `_headers` contains no `Set-Cookie`; no built asset or HTML references `document.cookie` or `localStorage`; no third-party origin in any built asset [TP12]. Verify: fails (rules missing).
- [ ] 10.6 [GREEN] `routes.ts` rows `privacy` (`/privacy`, `/es/privacidad`), `terms` (`/terms`, `/es/terminos`), `contact` (`/contact`, `/es/contacto`); catalog `page.{privacy,terms,contact}.title|description` both locales (titles `Privacy | Maestro Calc`, `Terms | Maestro Calc`, `Contact | Maestro Calc`, `Privacidad | …`, `Términos | …`, `Contacto | …`); six Markdown files (`ownerReview: pending`). Privacy states only today's facts (Cloudflare hosting with standard request logs, no cookies, no analytics, no advertising, no accounts or forms, mail used only to reply). Terms state estimates, verification with a qualified professional and the local code, as is without warranty, no governing law, jurisdiction, entity or address. Contact shows the address, the prompt and no form. Verify: 10.2–10.4 pass.
- [ ] 10.7 [GREEN] The three `site-check` rules of 10.5 in `checks.ts` and the CLI. Verify: pass; coverage 100.
- [ ] 10.8 [REFACTOR] Runtime: `npm run verify` (check:site prints `checked 14 pages` and `pending ownerReview entries: 10`, the TP4 evidence); `npm run test:e2e` (12 paths 200 without redirect, `/privacy` ↔ `/es/privacidad` round trip, axe on all 14 [SR7, SQ1]); `fd -e html . apps/web/dist | wc -l` is 14; `rg -n "hello@" apps/web/dist` is empty [TP18]; post-merge note: submit `/sitemap.xml` in Search Console (owner action F.1).
- [ ] 10.9 Exit: SX1, SX3–SX8.

---

## PR 11 — Budgets, glyph check, Lighthouse (`feat/web-shell-11-budgets-glyphs-lighthouse`)

Forecast: ~300 changed lines. Specs: site-quality (byte budgets, Lighthouse), site-shell ([SS8], [SS10]). Green because: `check:site` enforces budgets and glyph coverage, and `site-browser` runs Lighthouse CI. Contingency: split `11a` (11.2–11.6 budgets and glyphs) / `11b` (11.7–11.10 Lighthouse).

Planned commits: `feat(web): enforce byte budgets in check:site` · `feat(web): verify Spanish glyph coverage from the woff2 cmap` · `ci: add Lighthouse CI to the site-browser job`.

- [ ] 11.1 Create the branch from the PR 10 tip.
- [ ] 11.2 [RED] `apps/web/src/site-check/budgets.test.ts`: `budgetProblems(files)` passes at the limits and fails one byte above, naming file and limit: HTML 40,960 / 40,961 [SQ7]; CSS linked plus inline 20,480 / 20,481; each woff2 30,720 / 30,721; four woff2 together 92,160 (four fonts of 23,041 bytes fail); any referenced `.js` byte fails [SQ8]; page weight (HTML + referenced CSS + referenced fonts + favicon) 163,840 / 163,841; the summary prints the largest page and its size per category (`budget html: largest /about.html 12,345 B (limit 40,960)` format) [SQ6]. Verify: fails.
- [ ] 11.3 [GREEN] `apps/web/src/site-check/budgets.ts`. Verify: pass.
- [ ] 11.4 [RED] `apps/web/src/site-check/woff2-cmap.test.ts`: `parseCmap(buffer)` over hand-built format 4 and format 12 tables returns the exact code point sets (hand-verified); `readWoff2Tables(buffer)` over a synthetic WOFF2 built in the test (`zlib.brotliCompressSync` stream) finds `cmap`; bad signature, truncated header, unsupported cmap format each throw; the real `@fontsource/barlow/files/barlow-latin-400-normal.woff2` contains `U+00A1 U+00BF U+00E1 U+00E9 U+00ED U+00F1 U+00F3 U+00FA U+00FC` [SS10] and the `latin-ext` file lacks `U+00F1` (the negative). Verify: fails.
- [ ] 11.5 [GREEN] `apps/web/src/site-check/woff2-cmap.ts` (zero dependency: WOFF2 table directory, `zlib.brotliDecompressSync`, untransformed `cmap`, formats 4 and 12). Verify: pass; 100 percent coverage.
- [ ] 11.6 [GREEN] Wire both into the CLI and `cli.test.ts` (seeded: an HTML file of 40,961 bytes exits 1 naming file and limit [SQ7]; a copy with a `.js` file referenced exits 1 [SQ8]; a woff2 without `ñ` exits 1 naming the code point [SS10]; the green build prints the per-category largest sizes [SQ6]). Verify: `npm test -- apps/web/src/site-check && npm run build && npm run check:site` (record the largest page and sizes).
- [ ] 11.7 [RED] `apps/web/src/contract/lighthouse.contract.test.ts`: `tooling/site-browser/lighthouserc.json` collects exactly `/`, `/es`, `/methodology`, `/es/metodologia`, `/privacy`, `/es/privacidad`, `numberOfRuns` 1; assertions `categories:accessibility`, `categories:seo`, `categories:best-practices` are `["error",{"minScore":0.95}]`, `categories:performance` is `["warn",{"minScore":0.95}]`, `cumulative-layout-shift` is `["error",{"maxNumericValue":0.01}]`; `upload.target` is `filesystem`; `@lhci/cli` is pinned exactly in `tooling/site-browser/package.json` [SQ9]; the `site-browser` job has a Lighthouse step after the Playwright step that uses the runner's Chrome, uploads `.lighthouseci` only `if: failure()`, and the job stays ≤ 10 minutes [SQ15]; root script `lighthouse` exists. Verify: fails.
- [ ] 11.8 [GREEN] Add `@lhci/cli` (exact) to `tooling/site-browser` and refresh its lockfile; `tooling/site-browser/lighthouserc.json` (server started with the e2e wrangler config, `WRANGLER_SEND_METRICS=false`); `lighthouse` scripts (tooling and root); the `ci.yml` step; `.gitignore` already covers `.lighthouseci`. Verify: 11.7 passes; `npm run lighthouse` locally.
- [ ] 11.9 [REFACTOR] Negative proofs (temporary, logs in the PR body): run `lhci assert` with `categories:seo` minScore `1.01` at `error` → exit non-zero [SQ10]; with `categories:performance` minScore `1.01` at `warn` → exit 0 with a warning [SQ11]. Record Lighthouse scores and CLS for the six pages (canonical on `localhost` with `https://maestrocalc.com` URLs must not fail the SEO audit; design says it does not) and the `site-browser` wall time (limit 10 minutes; if exceeded, trim runs before touching limits). Carry-over (group 1 review RES-1): measure the layout shift of the 700-weight display fallback and calibrate its `size-adjust`/overrides if it exceeds the CLS budget.
- [ ] 11.10 [REFACTOR] Docs: `AGENTS.md` (`npm run lighthouse`, budgets in `check:site`), `openspec/config.yaml` (lighthouse command, byte budgets). Verify: `npm run format:check`.
- [ ] 11.11 Exit: SX1, SX3–SX8. After merge, `npm run verify && npm run test:e2e && npm run lighthouse` on `main` is the end-of-change proof for `sdd-verify`.

---

## Final — Owner actions that cannot be automated (task F.1, F.2)

- [ ] F.1 Record in `openspec/changes/web-shell/apply-progress.md` (and in the PR 10 and PR 11 bodies) this checklist for the owner, each item with date and result:
  - [ ] Cloudflare Email Routing: `contacto@maestrocalc.com` forwards to the owner's mailbox (before PR 10 deploys the contact page).
  - [ ] Email Address Obfuscation (Scrape Shield) set to off: it injects a script and breaks the zero-JS and `script-src 'none'` rules. Post-deploy check: `curl -s https://maestrocalc.com/contact | rg 'cdn-cgi'` returns nothing.
  - [ ] Cloudflare Web Analytics JS snippet auto-injection set to off. Post-deploy check: `curl -s https://maestrocalc.com/ | rg 'cloudflareinsights|<script'` shows only the JSON-LD block.
  - [ ] `site-browser` added as a required status check on `main` (after its first green run on PR 8), next to `verify` and `mutation-gate`.
  - [ ] Post-deploy manual smoke in production: `/x` → 404 English, `/es/x` → 404 Spanish, `/es/` → 307 to `/es`, one response carrying the `_headers` values; submit `/sitemap.xml` in Search Console after PR 10.
  - [ ] Owner reads all 10 trust entries and flips `ownerReview: pending` to `approved` in each `apps/web/src/content/pages/{en,es}/*.md`; `check:site` then prints `pending ownerReview entries: 0`.
- [ ] F.2 Archive precondition: F.1 is complete (at minimum the `ownerReview` flip and the three Cloudflare settings), `sdd-verify` has passed, and the flip is recorded in the archive report. Archive stays blocked until then.

---

## Traceability: spec scenario → task

| Scenario | Name | Tasks |
|---|---|---|
| QGW1 | Kernel shard identity includes url | 1.2, 1.4, 1.5 |
| QGW2 | Editing a url file changes the identity | 1.2, 1.3, 1.5 |
| QGW3 | Gap pin removed | 1.2 |
| QGW4 | CI shard list matches config | 1.3, 1.5 |
| QGW5 | Site gate order | 7.16, 7.17, 8.6 |
| QGW6 | Seeded site regression blocks | 7.18 |
| QGW7 | Browser job runs independently | 7.16, 8.6, 8.12 |
| Existing quality-gates scenarios (score, least privilege, gate failure, mutation always runs) | Regression | SX1, SX2, 8.6 |
| MWW1 | Packages stay clean | 8.2, 8.7 |
| MWW2 | Install does not fetch browsers | 8.2, 8.14 |
| MWW3 | Site scripts exist | 7.14, 7.16, 8.12 |
| MWW4 | Verify order | 7.16, 7.17 |
| MWW5 | Docs reflect the scripts | 8.12, 11.10 |
| Baseline check green; Ignored artifacts | Existing | SX1, 8.8, 11.8 |
| ICW1 | Required page keys | 2.8, 10.2 |
| ICW2 | Skip link labels | 2.2 |
| ICW3 | Missing Spanish site key is a compile error | 2.2 |
| ICW4 | Route table and catalog agree | 2.8 |
| ICW5 | Formal imperative rejected | 2.4 |
| ICW6 | Site module separately importable | 2.2, 4.8 |
| ICW7 | Route page without metadata fails | 2.8 |
| ICW8 | Site tagline | 2.2 |
| ICW9 | Voseo rejected | 2.4 |
| Locale list; completeness and placeholder scenarios | Existing | 2.2 |
| SR1 | Exact page set | 7.4, 10.2, 10.8 |
| SR2 | Table drives links | 4.2, 7.8, 9.5 |
| SR3 | Canonical path served directly | 8.10, 10.8 |
| SR4 | lang per page | 4.6, 7.6 |
| SR5 | Switch maps to the equivalent page | 4.2, 7.8 |
| SR6 | Switch on 404 pages | 4.2, 5.5, 7.8 |
| SR7 | Switch round trip in the browser | 8.10, 10.8 |
| SR8 | Values on the about pages | 2.6, 2.10, 7.6 |
| SR9 | Home canonicals | 2.6, 2.10, 7.6 |
| SR10 | Reciprocity gate | 7.6, 7.14 |
| SR11 | Unknown EN path | 8.10 |
| SR12 | Unknown ES paths | 8.10 |
| SR13 | ES trailing slash | 8.10 |
| SR14 | 404 page content | 5.5, 7.6 |
| SR15 | Wrangler setting | 5.4 |
| SS1 | Landmarks on every page | 4.4, 7.8 |
| SS2 | Viewport and charset | 3.10, 7.6 |
| SS3 | Skip link first in DOM order | 3.10, 7.8 |
| SS4 | Skip link works by keyboard | 8.10 |
| SS5 | Palette values present | 3.5, 7.10 |
| SS6 | No dark theme | 3.5, 7.10 |
| SS7 | Text contrast | 3.5, 8.9 |
| SS8 | Four font files, same origin | 3.3, 3.13, 7.10 |
| SS9 | No third-party font origin | 3.3, 7.10 |
| SS10 | Spanish glyph coverage | 11.4, 11.5, 11.6 |
| SS11 | Body size | 3.5, 8.10 |
| SS12 | Header links | 4.4, 7.8, 9.5 |
| SS13 | Footer links | 4.4, 7.8, 10.4 |
| SS14 | Focus ring computed style | 3.5, 8.10 |
| SS15 | Touch target size | 4.4, 8.10 |
| SS16 | Focus indicator contrast | 3.5 |
| SS17 | Favicon linked and branded | 3.7, 3.10, 7.8 |
| SS18 | No scripts | 7.10, 7.18 |
| SS19 | No JS requests in the browser | 8.10 |
| SE1 | Lengths and uniqueness | 2.2, 7.6 |
| SE2 | Catalog is the source | 2.10, 5.5, 7.6 |
| SE3 | Missing description fails | 7.6, 7.14 |
| SE4 | Second H1 fails | 7.8, 7.14 |
| SE5 | Heading order | 7.8 |
| SE6 | Home JSON-LD | 2.12, 6.4, 7.12 |
| SE7 | No logo | 2.12, 6.4, 7.12 |
| SE8 | Malformed JSON-LD fails | 7.12, 7.14 |
| SE9 | robots content | 6.3, 7.12 |
| SE10 | Sitemap entries | 2.14, 7.12, 10.2 |
| SE11 | Sitemap agrees with pages | 2.14, 6.7, 7.12 |
| SE12 | Sitemap is the only index | 6.2, 6.7, 7.12 |
| SE13 | Index state | 7.6 |
| SE14 | Green build | 7.4, 7.14, 10.2 |
| SE15 | Missing canonical fails | 7.6, 7.14 |
| SQ1 | Zero violations | 8.9 |
| SQ2 | Seeded violation fails | 8.9 |
| SQ3 | EN and ES smoke | 8.10 |
| SQ4 | Unknown paths in both locales | 8.10 |
| SQ5 | No third-party requests | 8.10, 8.13 |
| SQ6 | Budgets pass on the build | 11.2, 11.6 |
| SQ7 | HTML over budget fails | 11.2, 11.6 |
| SQ8 | Any JS byte fails | 7.10, 11.2, 11.6 |
| SQ9 | Thresholds configured | 11.7, 11.8 |
| SQ10 | Blocking category regression | 11.9 |
| SQ11 | Performance is advisory | 11.9 |
| SQ12 | Header content | 8.5, 8.11 |
| SQ13 | Immutable assets only | 8.5, 8.11 |
| SQ14 | CSP does not break pages | 8.10, 8.13 |
| SQ15 | Job definition | 8.6, 11.7 |
| SQ16 | Not skipped | 8.6, 8.14 |
| TP1 | Ten valid entries | 9.4, 10.2 |
| TP2 | Invalid frontmatter fails the build | 9.2, 9.9 |
| TP3 | Missing locale counterpart fails | 9.4 |
| TP4 | All pending at spec time | 9.9, 10.8 (check:site count; not pinned in tests) |
| TP5 | Marker is invisible | 7.12, 9.5 |
| TP6 | Time element | 9.5, 9.8 |
| TP7 | Home links | 9.5 |
| TP8 | No empty promises | 5.7 |
| TP9 | Methodology content | 9.4, 9.7 |
| TP10 | Anchors exist | 9.4, 9.7 |
| TP11 | Authorship | 9.4, 9.7 |
| TP12 | Facts match the build | 10.5, 10.7 |
| TP13 | No future-state claims | 10.3 |
| TP14 | Required statements | 10.3 |
| TP15 | Disclaimer wording | 10.3 |
| TP16 | No invented legal facts | 10.3 |
| TP17 | Address and prompt | 10.3 |
| TP18 | Old address gone | 5.2, 5.9, 7.12, 10.8 |
| TP19 | Formal imperative or voseo rejected | 2.4, 9.4 |
| TP20 | Section parity | 9.4 |

Design risks as explicit tasks: root lint/typecheck exclude `tooling/` (8.4, 8.8); `tooling/site-browser` tsconfig resolves the type-only i18n import (2.6, 8.2, 8.7); Dependabot covers the second lockfile (8.2, 8.8); `wrangler.e2e.jsonc` compares resolved `assets.directory` (8.3); `WRANGLER_SEND_METRICS=false` (8.6, 8.7); `SITE.tagline` removed and `hello@` → `contacto@maestrocalc.com` (5.2, 5.3); owner actions (F.1, F.2).
