# Design: Web Shell — Bilingual Site Frame, Trust Pages and Site Quality Gates

Implements `proposal.md` (decisions D1–D8 binding) against the main specs in `openspec/specs/*` and the delta specs under `specs/` (`site-shell`, `site-routing-i18n`, `site-seo`, `trust-pages`, `site-quality`; modified `quality-gates`, `i18n-catalog`, `monorepo-workspace`). **The specs are the behavioral contract**; where this design names a value the specs do not fix, the spec wins at apply time. Revised after design review round 1 (see the last section).

## Technical Approach

`apps/web` stays the only composition root. One typed route table (`apps/web/src/routing/routes.ts`) is the single source for page paths; every derived artifact (static paths, links, language switch, hreflang, canonical, sitemap, `check:site` expectations, browser URL lists) is a pure function of it. Pure TypeScript helpers (routing, SEO head, JSON-LD, sitemap, built-HTML checks) live outside `.astro` files so vitest covers them at 100 percent; `.astro` files only compose. Short UI strings come from a new `site` catalog scope in `packages/i18n`; long-form trust copy is Markdown in a content collection. Pages are static, ship zero client JavaScript and load only same-origin subresources. Built HTML is checked deterministically in `verify` (`check:site`); browser-level checks (axe, phone smoke, Lighthouse) run in one Chromium job against `wrangler dev`, which reproduces the Workers asset rules that production uses.

**Counts derive from `ROUTES`.** `check:site`, the content/catalog contract tests, the sitemap tests and the browser URL lists compute every expected count and set from `ROUTES` (routable = 2 × table size; not-found = 2). Exactly one pinned end-state assertion (`12 routable + 2 not-found`, i.e. `Object.keys(ROUTES).length === 6`) lands in the last content slice (PR 10). The exact counts in ICW1, SR1, SE10 and SE14 are end-of-change states (each carries a note saying so).

## Architecture Decisions

| # | Decision | Alternatives rejected | Rationale |
|---|---|---|---|
| W1 | **Mutation identity**: add `src/url/**` to the `kernel` deps in `packages/core/stryker.config.mjs` and to the five kernel CI matrix `inputs`; the contract walk in `mutation-identity.contract.test.ts` follows the root barrel (the `[rootBarrel]` leaf argument is removed). Update the kernel comment in `stryker.config.mjs` ("the root barrel is listed as a file …") and the walk comment ("the barrel is read for its own text and not followed") to say the barrel is followed; `expect(hashOf('url')).not.toBe(hashOf('rational'))` becomes `toBe` (equal identities) and the `not.toContain('src/url/codec.ts')` pin is removed | (a) Keep the barrel as a leaf and only add the glob; (b) derive `deps` from the import graph at config load; (c) drop `src/index.test.ts` from kernel shards | Following the barrel makes the walk report what a shard really loads, so the next module behind the barrel fails the test instead of hiding. (a) fixes today but not the next module. (b) puts a TS parser in every Stryker run. (c) loses the barrel wiring tests. Cost accepted: a codec change colds all core shards (rare; correctness over cache hits). The calculators-forbidden test still holds (the root barrel exports no calculator). |
| W2 | One `routes.ts` table `PageId → { en, es }`; a single catch-all page `src/pages/[...path].astro` whose `getStaticPaths` maps the table; 404 pages are explicit files | One `.astro` file per page per locale; Astro i18n routing | The table cannot diverge from the files because the files are generated from it. Astro i18n routing assumes identical slugs across locales (D2 needs translated slugs). Static routes still outrank the rest route, so future calculator pages can be explicit files. |
| W3 | Sitemap as an endpoint `src/pages/sitemap.xml.ts` over a pure `sitemapXml()`; remove `@astrojs/sitemap` | Integration with a `serialize` hook reverse-mapping URLs | One dependency less, one file (`/sitemap.xml`, D6), unit-testable, alternates straight from the table. |
| W4 | Fonts through the Astro Fonts API (`fontProviders.local()`, package-import `src` from exact-pinned `@fontsource/barlow` and `@fontsource/barlow-condensed`, `latin` woff2), `display: 'swap'`, `fallbacks: ['Arial', 'sans-serif']`, `optimizedFallbacks`. Preload uses **two `<Font>` tags**: `<Font cssVariable="--font-body" preload={[{ weight: '400' }]} />` and `<Font cssVariable="--font-display" preload={[{ weight: '700' }]} />` (Astro's `preload` takes `{ weight?, style?, subset? }[]`) | Committed font files; `@fontsource` CSS imports with hand-written metrics; pyftsubset | No network at build or run time, hashed immutable URLs, generated fallback metrics. The `latin` subset covers U+0000–00FF (all Spanish letters and `¿¡`). Two preloads cover body text and H1; the 600 weights load on use. |
| W5 | Global CSS limited to `styles/tokens.css` and `styles/base.css` (reset, type scale, focus, skip link); component styles scoped | Tailwind; CSS modules; UI framework | Proposal: no framework. Tokens are the Blueprint table verbatim. |
| W6 | Focus: 3 px Safety-orange outline plus 2 px Blueprint-ink ring | Orange outline alone | Orange `#F06A1D` on Plan paper `#EEF1EF` is about 2.7:1, below WCAG 1.4.11's 3:1; the ink ring guarantees 3:1 on every ground. |
| W7 | Trust copy as Markdown (`.md`) in a `pages` collection at `content/pages/<locale>/<id>.md`; strict frontmatter `{ id, locale, updated: YYYY-MM-DD, ownerReview: pending \| approved }`; contract test: path = `<locale>/<id>.md`, set = table trust ids × 2 locales; H1 is the body's single `#` heading; ASCII-id anchored `h2`s (`#politica-editorial`, `#uso-de-ia`) as raw `<h2 id>`; title/description from the `site` catalog | MDX; inline copy; frontmatter titles; rehype heading-id plugin | No component in prose yet, so no `@astrojs/mdx` and no executable content. Titles stay in the catalog so every SEO string shares one completeness proof. |
| W8 | `check:site`: pure checks in `apps/web/src/site-check/*.ts` (vitest, 100 percent) plus a thin CLI `apps/web/scripts/check-site.ts` run by Node 24 type stripping; HTML parsed with `node-html-parser` (`apps/web` devDependency) | A `.mjs` script with logic inline; `tsx`; cheerio/parse5 | Seeded failures become fast unit tests over HTML strings. `node-html-parser` is small but **not** dependency-free (it pulls `entities` and `css-select`); still far lighter than cheerio/parse5 trees. The routing module imports only types from workspace packages so the CLI never strips TS under `node_modules`. |
| W9 | Browser tooling (`wrangler`, `@playwright/test`, `@axe-core/playwright`, `@lhci/cli`) lives in a **non-workspace** package `tooling/site-browser/` with its own `package-lock.json`, installed only in the `site-browser` job. It holds `wrangler.e2e.jsonc` (same `assets` block, `assets.directory` → `../../apps/web/dist`, no `build`), `playwright.config.ts`, `lighthouserc.json`, `e2e/*.spec.ts`. A root contract test asserts its `assets` settings equal `apps/web/wrangler.jsonc`, comparing **resolved** `assets.directory` paths | Root devDependencies (workerd and browser tooling in every job's `npm ci`); `astro preview`; hand-written static server | Keeps `verify`/`mutation` installs unchanged while the browser job tests the real asset router (Miniflare). `astro preview` implements none of the three Workers rules below. The root config's `build.command` would rebuild inside the job. Root lint/typecheck exclude `tooling/`; the job typechecks it with its own `tsconfig`. |
| W10 | One `site-browser` job (`needs: verify`, parallel to `mutation`, never path-filtered, `timeout-minutes: 10`, env `WRANGLER_SEND_METRICS=false`): downloads `dist` from `verify`, `npm ci --prefix tooling/site-browser`, Playwright (one `phone` project, Chromium headless shell, 390×844, `deviceScaleFactor: 3`, `isMobile`, `hasTouch`) for axe and smoke, then Lighthouse CI on the runner's Google Chrome | Separate jobs; WebKit/Firefox; full Playwright Chromium for Lighthouse | One install, one server, no rebuild. A skipped required check stays pending (D10 lesson). |
| W11 | Blocking: `check:site` (incl. byte budgets, zero JS), axe (0 violations), phone smoke, Lighthouse a11y/SEO/BP ≥ 0.95. Advisory: Lighthouse performance (D7) | Performance blocking | CI performance is noisy; budgets enforce the same intent deterministically. |
| W12 | JSON-LD on the two home pages only: one `@graph` with `Organization` (`@id …/#organization`, `name`, `url`; no `logo`, D8) and `WebSite` (`url` = page canonical, `inLanguage`, `publisher` → `#organization`), built by pure `homeJsonLd(locale)`; serialization escapes `<` as `<`, `>` as `>` and `&` as `&` | Every page; per-page `WebPage` | Matches spec and Google guidance; the escapes make `</script>` and HTML entity injection impossible while staying valid JSON. |
| W13 | `apps/web/public/_headers`: `nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera, microphone, geolocation off), CSP `default-src 'self'; script-src 'none'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'`; `/_astro/*` immutable cache | No CSP; nonce/hash CSP | Zero JS makes `script-src 'none'` free (JSON-LD data blocks are not executed). Astro inlines small stylesheets, hence `'unsafe-inline'` for styles only. |

## Structure (container / presentational)

```
tooling/site-browser/   package.json  package-lock.json  tsconfig.json  wrangler.e2e.jsonc
                        playwright.config.ts  lighthouserc.json  e2e/{smoke,a11y}.spec.ts   # URL lists import ROUTES
apps/web/
├── astro.config.mjs            # fonts, no sitemap integration
├── scripts/check-site.ts       # CLI: reads dist, runs site-check, exits 1 on any problem
├── public/  favicon.svg  robots.txt  _headers         # favicon.ico deleted
└── src/
    ├── site.config.ts          # `tagline` removed (now `site.tagline` in the catalog); contactEmail hello@ → contacto@maestrocalc.com
    ├── routing/  routes.ts  routes.test.ts  routes.test-d.ts
    ├── seo/      head.ts  json-ld.ts  sitemap.ts  (+ tests)
    ├── site-check/  checks.ts  budgets.ts  woff2-cmap.ts  (+ tests with HTML/font fixtures)
    ├── lib/      site-text.ts
    ├── styles/   tokens.css  base.css
    ├── layouts/  BaseLayout.astro             # container: lang, head, skip link, header, <main id="main">, footer
    ├── components/  SeoHead SiteHeader Wordmark LanguageSwitch SiteFooter SkipLink .astro   # presentational
    ├── views/    HomeView  TrustPageView  NotFoundView .astro                            # containers
    ├── content.config.ts       # `pages` collection over content/pages/{en,es}/*.md
    ├── content/pages/{en,es}/{methodology,about,privacy,terms,contact}.md
    └── pages/  [...path].astro  404.astro  es/404.astro  sitemap.xml.ts
```

Presentational components never import `@maestro-calc/i18n`, `routing` or content APIs (lint `no-restricted-imports` on `src/components/**`). `src/pages/index.astro` (smoke) is deleted; the catch-all keeps importing `@maestro-calc/i18n`.

## Interfaces / Contracts

```ts
// routing/routes.ts — imports only `type Locale` from @maestro-calc/i18n
export const LOCALE_TAGS = { en: 'en-US', es: 'es-US' } as const satisfies Record<Locale, string>;
export const ROUTES = { home: { en: '/', es: '/es' }, /* grows per PR: methodology/about in 9, privacy/terms/contact in 10 */ }
  as const satisfies Record<string, Record<Locale, `/${string}`>>;
export type PageId = keyof typeof ROUTES;
export const pathOf: (id: PageId, locale: Locale) => string;
export const urlOf: (path: string) => string;            // '/' → 'https://maestrocalc.com/', '/es' → '…/es'
export const alternatesOf: (id: PageId) => readonly { hreflang: 'en-US' | 'es-US' | 'x-default'; href: string }[];
export const staticPaths: () => { params: { path: string | undefined }; props: { id: PageId; locale: Locale } }[];
```

- Table invariants: unique paths; `^/([a-z0-9-]+(/[a-z0-9-]+)*)?$`; ES paths `/es` or `/es/…`, EN never; ASCII only.
- Type test: for every `PageId`, `` `page.${PageId}.title|description` `` are keys of `enSite` (plus `page.notFound.*`).
- `site` catalog (`packages/i18n/src/catalogs/{en,es}/site.ts`, `enSite`/`esSite`, `satisfies CatalogOf`): `site.tagline` (ICW8 values), `site.skipLink`, `site.nav.label`, `site.switch.label`, `site.footer.*`, `page.<id>.title|description`, `page.home.*`, `page.notFound.*`. Expected module list becomes `['common', 'site', ...calculatorIds]`. The register test rejects formal imperatives and the voseo forms of ICW5/TP19 (neutral tú, `docs/design/direction.md`), whole-word and case-insensitive, over catalogs and Markdown.
- `headFor(id, locale, text)`; `notFoundHead(locale, text)` → `noindex`, no canonical, no alternates.
- Internal links (SR2): table path optionally + `#fragment`, bare `#fragment`, `/favicon.svg`, `mailto:contacto@maestrocalc.com`; `check:site` resolves every fragment against the target page's ids.

## Data Flow

```
routes.ts ──► staticPaths ──► [...path].astro ──► View ──► BaseLayout ──► components
    ├──► headFor / alternatesOf ──► SeoHead (title, description, canonical, hreflang, JSON-LD)
    ├──► sitemapXml ──► sitemap.xml.ts
    ├──► site-check (expected files, URLs, reciprocity, fragments) ◄── dist/**
    └──► tooling/site-browser URL lists (axe, smoke)
```

## Cloudflare Workers Assets Behaviour (verified)

| Concern | Behaviour | Source |
|---|---|---|
| Pages | `build.format: 'file'`; `drop-trailing-slash` serves `x.html` at `/x` and 307-redirects `/x/` and `/x.html` to `/x` | developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/ |
| Not found | `404-page` serves the nearest `404.html` walking up, status 404: `/es/x`, `/es/x/y` → `es/404.html`; `/x`, `/esx` → `404.html` | developers.cloudflare.com/workers/static-assets/routing/static-site-generation/ |
| `/404`, `/es/404` | 200 (file exists); harmless: `noindex`, not in sitemap | — |
| Headers | `_headers` supported for Workers static assets, applied by `wrangler dev`, not served as a file | developers.cloudflare.com/workers/static-assets/headers/ |
| robots | static `public/robots.txt` with `Sitemap: https://maestrocalc.com/sitemap.xml` | — |

The smoke asserts these rows through `wrangler dev` (`/es/no-existe` → 404 `lang="es-US"`; `/es/` → 307 to `/es`; headers on `/` and `/_astro/*`; `/_headers` 404). A post-deploy manual check repeats `/x`, `/es/x` and one header in production.

## Testing Strategy

| Layer | What | How | Placement |
|---|---|---|---|
| Unit | Route invariants, `alternatesOf`, `urlOf`, `headFor`, JSON-LD escaping (`<`, `>`, `&`), `sitemapXml`, every `site-check` rule incl. seeded failures | vitest; coverage 100 on `apps/web/src/{routing,seo,site-check}/**` | `verify` |
| Type | PageId ↔ catalog keys; `esSite satisfies CatalogOf<typeof enSite>` | `*.test-d.ts` | `verify` |
| Contract | `site` module; content entries = table trust ids × locales; EN/ES `h2` parity; register (usted + voseo); e-mail = `SITE.contactEmail`; `wrangler.e2e.jsonc` assets equal (resolved dirs); CI shape; `tooling/site-browser` not a workspace | vitest `src/contract/*` | `verify` |
| Built HTML | `check:site`: expected file set derived from `ROUTES` (+2 not-found, no orphans); per page `lang`, title, description, self canonical, hreflang + reciprocity, one H1 in `main#main`, heading order, skip link first; SR2 links and fragment targets; home JSON-LD; zero JS; no third-party subresource; 404 `noindex`; sitemap = table; robots; no `hello@`; owner-review strings `ownerReview`, `draft`, `borrador`, `pending review` (case-insensitive, never bare `pending`); prints the `pending`-entry count; byte budgets; "build first" when `dist` is missing | Node CLI | `verify`: `build` → `check:site` → `check:dist` |
| Font glyphs (SS10) | The nine Spanish code points in each woff2 cmap | `site-check/woff2-cmap.ts`: zero-dependency reader (parse the WOFF2 table directory, `zlib.brotliDecompressSync` the stream, read the untransformed `cmap` format 4/12) | `verify` (`check:site`) |
| Browser | axe (`wcag2a/aa`, `wcag21a/aa`, `wcag22aa`) and phone smoke on URLs derived from `ROUTES` plus both 404s; statuses, `lang`, H1, overflow, skip link, targets ≥ 44 px, body ≥ 17 px, Barlow loaded, zero script/third-party requests, zero CSP violations, Workers rows | `@playwright/test` + `@axe-core/playwright`, `forbidOnly`, `retries: 0` | `site-browser` |
| Lighthouse | `/`, `/es`, `/methodology`, `/es/metodologia`, `/privacy`, `/es/privacidad`; mobile; 1 run | `@lhci/cli`, `upload.target: filesystem` | `site-browser`; a11y/SEO/BP ≥ 0.95 + CLS ≤ 0.01 error, perf warn |

Byte budgets: HTML ≤ 40,960; CSS ≤ 20,480; each woff2 ≤ 30,720, four ≤ 92,160; JS 0; page weight ≤ 163,840. Lighthouse runs on `localhost` with `https://maestrocalc.com` canonicals; its canonical audit does not fail cross-origin canonicals (github.com/GoogleChrome/lighthouse `core/audits/seo/canonical.js`), so no host mapping is needed.

## Threat Matrix

N/A — no shell-command composition, VCS/PR automation or executable-file classification. New subprocesses are fixed CI/test commands (`wrangler dev`, `lhci`) with constant arguments under `contents: read`. Trust content is plain Markdown (no MDX, no evaluated code).

## PR Slicing (stacked to main, ≤ 400 changed lines, lockfiles excluded)

| PR | (was) | Content | Forecast |
|---|---|---|---|
| 1 | 1 | W1 identity fix, comments, hash/pin flips | ~100 |
| 2 | 2 | `routing/`, `seo/{head,json-ld,sitemap}.ts`, `site` catalog (shell, `home`, `notFound`, tagline), register test incl. voseo, i18n contract, coverage include | ~380 |
| 3 | 3a | Tokens, base CSS, fonts config + fontsource deps, favicon, BaseLayout, SkipLink | ~250 |
| 4 | 3b | Header, Wordmark, LanguageSwitch, footer, catch-all + HomeView, smoke page deleted | ~280 |
| 5 | 4 | 404 EN/ES (NotFoundView), full home copy, `SITE` tagline removed and `contacto@` | ~220 |
| 6 | 5a | Endpoints: `sitemap.xml.ts`, `robots.txt`, JSON-LD in head, `@astrojs/sitemap` removed | ~250 |
| 7 | 5b | `site-check` + CLI + `check:site` in CI/`verify` before `check:dist`, CI contract | ~380 |
| 8 | 8 | `tooling/site-browser`, `_headers`, axe + phone smoke (URLs from `ROUTES`), `site-browser` job, `dist` artifact, `test:e2e`, contracts | ~330 |
| 9 | 6 | Content collection, `TrustPageView`, methodology + about EN/ES | ~380 |
| 10 | 7 | Privacy, terms + disclaimer, contact EN/ES; pinned `12 + 2` end-state assertion | ~370 |
| 11 | 9 | Byte budgets, woff2 cmap check, Lighthouse CI, `lighthouse` script | ~300 |

Order rationale: `check:site` (7) and the browser gate with `_headers` (8) land before any prose page (9–10), so every content PR is gated by both; pages appear in the table only when they exist, so production never links to a missing page. Each row reverts alone; 3–4 revert to the smoke page, 6 to the integration sitemap, 8 and 11 are CI-only plus headers.

## Migration / Rollout

No data migration. `/sitemap-index.xml` and `/sitemap-0.xml` disappear in PR 6; submit `/sitemap.xml` after PR 10. Owner actions: Email Routing for `contacto@`; disable Email Address Obfuscation (it injects a script); add `site-browser` to required checks; review copy and flip `ownerReview` before archive.

## Open Questions

None. Closed in round 1: Lighthouse canonical on localhost (no fallback needed), `_headers` under `wrangler dev` (verified), `npm ci` cost of `wrangler` (isolated in `tooling/site-browser`), `check:dist` position (kept last, specs updated), `<Font preload>` per weight (two `<Font>` tags).

## Risks

| Risk | Mitigation |
|---|---|
| Codec edits cold all core shards | Accepted; rare |
| Zone features add scripts in production only | Owner disables; post-deploy check greps `/cdn-cgi/` scripts |
| Second lockfile (`tooling/site-browser`) drifts from update tooling | Dependency-update config covers the directory; exact pins |
| Runner Chrome drift under Lighthouse | Performance advisory only |
| Legal/editorial copy accuracy | `ownerReview: pending`; archive blocked until approved |

## Design review round 1

| Finding | Resolution |
|---|---|
| M1 SR2 too narrow | SR2 allows table path + optional fragment, bare fragment, `/favicon.svg`, `mailto:contacto@`; fragment targets checked |
| M2 `check:dist` dropped | quality-gates CI list and MWW4 end `build, check:site, check:dist` |
| M3 voseo not rejected | ICW5/TP19 reject 8 voseo forms; ICW9 + TP19 seeded from `verificá` |
| M4 slices 3 and 5 oversized | Pre-split into PRs 3/4 and 6/7 |
| M5 browser gate after prose | Order 1, 2, 3a, 3b, 4, 5a, 5b, 8, 6, 7, 9 → PRs 1–11 |
| M6 hard-coded counts | Derived from `ROUTES`; one pinned assertion in PR 10; notes on ICW1, SR1, SE10, SE14 |
| m1 key name | `page.notFound.*` |
| m2 Lighthouse canonical | Open question and host-mapping fallback deleted |
| m3 JSON-LD escaping | `<`, `>`, `&` as `<`, `>`, `&` |
| m4 owner-review strings | `ownerReview`, `draft`, `borrador`, `pending review` in requirement, TP5, checker |
| m5 SR3 local server | `wrangler dev` with the e2e config |
| m6 tagline | ICW8 values; trust-pages Home quotes them; `SITE.tagline` removed, `hello@` → `contacto@` |
| m7 tooling placement | W8 rationale corrected; W9 `tooling/site-browser`; MWW1 widened; resolved-path contract; `WRANGLER_SEND_METRICS=false` |
| m8 glyph mechanism | Zero-dependency WOFF2 cmap reader (`node:zlib` brotli) |
| Platform facts | Cited in the Workers table; open questions 2 and 5 closed; W4 two `<Font>` tags |
| W1 notes | Comments updated; `hashOf('url')` equals `hashOf('rational')` |
