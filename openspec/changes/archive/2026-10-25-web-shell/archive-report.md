# Archive report: web-shell

Archived on 2026-10-25 from `main` 9fd5faf.

## Final state

- Delivered in three grouped PRs (owner decision to save CI minutes and deploys): #82 group 1 (identity fix, routing/SEO helpers, Blueprint shell, home), #83 group 2 (404 pages, sitemap/robots/JSON-LD, `check:site`, `site-browser` job, `_headers`), #84 group 3 (trust pages, byte budgets, glyph check, Lighthouse), plus #85 (tagline softened to "Jobsite calculators that estimate what to buy", owner decision).
- Live on maestrocalc.com: 12 routable pages (EN/ES home, methodology, about, privacy, terms, contact) and two 404 pages; zero client JS; CSP `script-src 'none'`; no cookies.
- Gates on `main`: `npm run verify` exit 0 (2345 tests at verify time, 2346 after #85), `check:site` 14 pages, e2e 110 passed, Lighthouse 100 on the six audited pages with CLS 0; CI `verify` ~2 min, `site-browser` 2m52s.
- `sdd-verify`: PASS WITH WARNINGS, 0 critical, 106/106 scenarios traced (`verify-report.md`). Warning 1 (unticked exit tasks) and warning 5 (stale tagline quote in task 2.2) were reconciled in this archive commit; the `SX1`–`SX8` rows are the per-slice template and stay unticked by design.

## Owner decisions recorded

- F.2 waived on 2026-10-25: the change is archived with the 10 trust entries still `ownerReview: pending`. F.1 stays open: read and flip the entries, confirm the Cloudflare settings (Email Address Obfuscation, Rocket Loader, Web Analytics injection, Bot Fight Mode and challenges off), `site-browser` as a required check, `/sitemap.xml` in Search Console, `contacto@` mailbox.
- Amended during the change: TP15 wording ("local building code" / "código de construcción local"), ICW8 tagline, the about editorial claim limited to pages that show an update date.

## Specs promoted

New: `site-shell`, `site-routing-i18n`, `site-seo`, `site-quality`, `trust-pages`. Modified: `i18n-catalog` (2 modified, 2 added requirements), `monorepo-workspace` (1 modified, 1 added), `quality-gates` (2 modified).

## Follow-ups carried forward

Listed in `apply-progress.md` (group 2 and group 3 Judgment Day sections, correction rounds): `TRUST_IDS` type tie to `ROUTES`, frontmatter parsing before matching (CRLF), `STORAGE_APIS` breadth, `format12` group cap, `@lhci/cli` dev advisories, Lighthouse `numberOfRuns`, scenario-id comments on SS4/SR7/SR13/QGW1–QGW4, automated tests for SQ10/SQ11/QGW6, `mailto:` links once Email Obfuscation is confirmed off. The next change (`concrete-calculator`) picks up RES-3/RES-4 (calculator pages in Lighthouse and `check:site`).
