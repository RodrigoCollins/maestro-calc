# Proposal: Web Shell — Bilingual Site Frame, Trust Pages and Site Quality Gates

Implements PLAN.md §4.3 (experience), §5.3 (trust pages), §6.2–6.4 (stack, CI quality, URLs), §7.2/§7.4/§7.8 (on-page and technical SEO, hreflang), §8.1 (CLS 0 rule, applied to the shell), §9.3 (legal pages EN/ES), and `docs/design/direction.md` (Blueprint). Closes the first follow-up of the archived foundation change (Judgment Day, verify S1).

## Intent

`maestrocalc.com` is live on Cloudflare Workers but serves a bare smoke page (`apps/web/src/pages/index.astro`). There is no layout, no Spanish route, no SEO surface, no trust pages and no browser-level test. The next change ships the first real calculator (concrete); it needs a finished frame to drop into: layout, locale routing with translated slugs, per-page SEO, trust pages that back E-E-A-T (§5.3), and CI gates that catch SEO, accessibility and weight regressions on built HTML. Separately, the mutation cache can reuse stale verdicts after a `src/url/**` change (kernel shard identity gap); that must close before more code lands.

## Scope

### In Scope (priority order)
1. **Mutation identity fix**: kernel shards (`rational`, `units`, `format`, `calculator-define`, `calculator-run`) include `src/url/**` in their identity and CI `hashFiles` inputs (preferred: follow the root barrel in the closure walk); remove the gap-pinning assertion in `apps/web/src/contract/mutation-identity.contract.test.ts`.
2. **Site shell**: base layout; Blueprint tokens as CSS custom properties; self-hosted Barlow (400/600) and Barlow Condensed (600/700), Latin subset, no third-party font request; header (wordmark, EN/ES switch keeping the current page), footer (legal links, contact), skip link, landmarks, orange focus ring, touch targets ≥ 44 px, body ≥ 17 px; light theme only; brand SVG favicon replacing Astro's default.
3. **Routing and i18n**: English at root, Spanish under `/es/` with translated slugs; one typed route table (page id → EN/ES path) drives links, switch, hreflang, canonical and sitemap; `lang` per page; `hreflang` `en-US`, `es-US`, `x-default` (→ EN); self canonical.
4. **SEO base**: title and meta description per page from i18n catalogs; Organization + WebSite JSON-LD; `robots.txt`; sitemap with EN/ES alternates; `check:site` gate over built HTML (title, description, canonical, hreflang reciprocity, one H1, JSON-LD parses, `lang`, no client JS).
5. **Pages (EN + ES)**: home (honest intro, links to methodology/about; no "coming soon" list), 404 (useful, `noindex`, links home), methodology, about (editorial policy, AI use, corrections policy), privacy, terms + disclaimer, contact (`contacto@maestrocalc.com` as text).
6. **Quality**: Playwright job (Chromium only) with axe on every built page and a simulated-phone smoke in EN and ES; deterministic performance budget (HTML/CSS/font bytes per page, zero client JS); Lighthouse CI on a few pages; `_headers` with baseline security headers and immutable caching for hashed assets.

### Out of Scope
- Any calculator page, hub, guide, breadcrumbs (no hierarchy yet), embed, PWA, print.
- GA4/GTM (`GTM-MD8H6L5S`), Cloudflare Web Analytics, consent/CMP, ads, affiliate/FTC disclosure page (added with the first ad or affiliate link).
- Dark theme, search, newsletter, contact form, query-string carry-over in the language switch (calculator change).
- Other foundation follow-ups (translator mutation shard, `encode` cap, `decode` guard, break 95, checkJs).

## Capabilities

### New Capabilities
- `site-shell`: layout, tokens, fonts, header/footer, skip link, landmarks, focus, zero client JS on static pages.
- `site-routing-i18n`: route table, translated slugs, `lang`, language switch mapping, hreflang, canonical, 404 per locale.
- `site-seo`: titles/descriptions from catalogs, JSON-LD, robots, sitemap alternates, built-HTML SEO checks.
- `trust-pages`: home, methodology, about/editorial, privacy, terms + disclaimer, contact; owner-review marking; no fabricated claims.
- `site-quality`: axe, phone smoke EN/ES, byte budgets, Lighthouse targets, CI job shape and cost limits.

### Modified Capabilities
- `quality-gates`: mutation shard identity covers every file the shard's tests load; CI gains the site gate and the browser job (stale shard list in "Mutation gate on core" refreshed).
- `i18n-catalog`: a `site` catalog scope (`site.*`, `page.<id>.title|description`) beside `common` and calculator modules, with the same completeness and tú-register rules.
- `monorepo-workspace`: new root developer entry points (`check:site`, `test:e2e`).

## Approach

- Static Astro pages, scoped CSS on global tokens, no UI framework, no Tailwind, no client scripts.
- Short UI strings in `packages/i18n` (`site` module); long-form trust copy as Markdown content collections per locale with validated frontmatter (page id, locale, `updated`, `ownerReview: pending|approved`), never shown as a draft badge to visitors.
- Fonts: Astro Fonts API with local files, or `@fontsource` packages; constraint for design: no runtime third-party request and no build-time network fetch.
- Sitemap: keep `@astrojs/sitemap`, add alternates from the route table (its i18n option assumes identical slugs); design may replace it with an endpoint.
- `check:site` is a Node script over `apps/web/dist` in the `verify` job after `build`; axe, smoke and Lighthouse run in one `site-browser` job beside `mutation`, Chromium only with browser cache.

## Decisions (autonomous, recorded)

| # | Decision | Why |
|---|---|---|
| D1 | Identity fix first, own PR | Owner priority; smallest, unblocks trust in the cache |
| D2 | Spanish slugs: `/es`, `/es/metodologia`, `/es/sobre-nosotros`, `/es/privacidad`, `/es/terminos`, `/es/contacto`; EN `/methodology`, `/about`, `/privacy`, `/terms`, `/contact` | §6.4 translated slugs; common neutral Spanish |
| D3 | About carries editorial, AI and corrections policy (anchored sections) | `SITE.author.url` is `/about`; fewer thin pages |
| D4 | Privacy describes today's reality (Cloudflare hosting logs, no cookies, no analytics); rewritten when GA4/ads land | No fabricated claims; no CMP needed yet |
| D5 | Contact email `contacto@maestrocalc.com` for both locales; tagline from §3 | Owner instruction; `site.config.ts` holds `hello@` and an off-plan tagline |
| D6 | One sitemap with alternates, not one per language | Owner allowed either; one route table, one file |
| D7 | Lighthouse: accessibility, SEO, best-practices ≥ 95 blocking; performance ≥ 95 advisory, enforced by blocking byte budgets | CI performance scores are noisy; budgets are deterministic |
| D8 | Organization JSON-LD without `logo` until a raster brand mark exists | No invented asset |

## Affected Areas

| Area | Impact |
|---|---|
| `tooling/stryker.mjs`, `packages/*/stryker.config.mjs`, `.github/workflows/ci.yml`, `apps/web/src/contract/mutation-identity*.test.ts` | Modified |
| `apps/web/src/{layouts,components,styles,routes,content,pages}` | New (pages replace the smoke `index.astro`) |
| `apps/web/public/{robots.txt,_headers,favicon.svg}`, `apps/web/astro.config.mjs`, `apps/web/src/site.config.ts` | New/Modified |
| `packages/i18n/src/catalogs/{en,es}/site.ts` + contract tests | New/Modified |
| `scripts/check-site.mjs`, `apps/web/e2e/`, `playwright.config.ts`, `lighthouserc` | New |
| `package.json`, `apps/web/package.json`, `AGENTS.md`, `openspec/config.yaml` | Modified |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| `astro preview` differs from Workers assets (trailing slash, nested `es/404.html`) | Med | Design verifies Workers `404-page` nearest-file lookup; post-deploy smoke of `/x` and `/es/x` |
| Actions minutes (private repo) grow | Med | Chromium only, browser cache, one browser job, ≤ 6 pages for Lighthouse, 10-min timeouts |
| Legal copy read as legal advice or inaccurate | Med | Plain, conservative text, `ownerReview: pending`, owner sign-off before archive |
| Sitemap alternates with translated slugs | Low | Route table is the single source; `check:site` asserts reciprocity |
| `site` catalog breaks the i18n locale-directory contract | Low | Delta spec first, contract tests updated in the same slice |
| Font weight/CLS | Low | Four woff2 files, `font-display: swap`, metric-adjusted fallback, byte budget |

## Rollback Plan

Each slice is an independent `git revert` in reverse order. Reverting slices 2–9 restores the smoke page; Workers redeploys the previous `dist` on push to `main`. Slice 1 reverts alone (restores the pinned gap). No data, accounts or URLs with inbound links exist yet.

## Review Workload Forecast

| PR | Slice | Forecast |
|---|---|---|
| 1 | Mutation identity follow-up | ~100 |
| 2 | Tokens, fonts, base layout, header/footer, skip link, favicon | ~360 |
| 3 | Route table, `site` catalog + contract, `lang`, switch, hreflang/canonical | ~370 |
| 4 | Titles/descriptions, JSON-LD, robots, sitemap alternates, `check:site` | ~380 |
| 5 | Home EN/ES + 404 EN/ES (smoke page removed) | ~260 |
| 6 | Content collection + methodology + about EN/ES | ~380 |
| 7 | Privacy, terms + disclaimer, contact EN/ES | ~360 |
| 8 | Playwright job: axe + phone smoke EN/ES | ~300 |
| 9 | Byte budgets, zero-JS check, Lighthouse CI, `_headers` | ~280 |

Total ~2,800 lines (lockfile excluded). Decision needed before apply: No. Chained PRs recommended: Yes. 400-line budget risk: Medium (prose slices 6–7 split per page if over). Strategy: auto-chain, stacked-to-main.

## Dependencies

- Owner: `contacto@maestrocalc.com` mailbox or Cloudflare Email Routing; review of legal and editorial copy.
- npm: `@playwright/test`, `@axe-core/playwright`, `@lhci/cli`, an HTML parser for `check:site`, font packages if chosen.

## Success Criteria

- [ ] Every page exists in EN and ES at the decided paths; the switch lands on the equivalent page.
- [ ] `check:site` passes on all built pages and fails on a seeded missing canonical, broken hreflang pair, or second H1.
- [ ] axe reports 0 violations; phone smoke passes in EN and ES; built static pages ship 0 bytes of client JS.
- [ ] Lighthouse accessibility/SEO/best-practices ≥ 95 on sampled pages; byte budgets green.
- [ ] Kernel shard identities change when a `src/url/**` file changes; the pinning assertion is gone.
- [ ] No request to a third-party origin when loading any page.

## Proposal question round

Not asked: the owner authorized autonomous execution. Assumptions for owner review: D2 slugs, D3 single about page, D4 privacy scope, D5 contact address, and deferring the FTC disclosure page until monetization.
