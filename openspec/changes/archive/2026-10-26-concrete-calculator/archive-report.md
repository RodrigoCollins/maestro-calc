# Archive report: concrete-calculator

Archived on 2026-10-26 from `main` e8cf809.

## Final state

- Delivered in three grouped PRs (owner decision to save CI minutes and deploys): #87 group 1 (engine: rational geometry, yields in `@maestro-calc/data`, `createConcrete`, URL contract, size probe), #88 group 2 (presenter, page parts, `calculators` content collection, template gates in `check:site`, CSP `script-src 'self'`), #89 group 3 (controller, script, route, methodology, privacy, home links, e2e and Lighthouse tooling; one merge for the go-live).
- Live on maestrocalc.com since 2026-10-26: `/concrete-calculator` and `/es/calculadora-de-concreto` (16 pages in total), one same-origin module script on the two calculator pages, zero scripts on every other page, CSP `script-src 'self'`, no cookies.
- Gates on `main`: `npm run verify` exit 0 (3,268 tests, coverage 100), `check:site` 16 pages (JS graph 36,450 B of 49,152; calculator page weight 160,533 B of 196,608; HTML 34,073 B of 40,960), e2e 283 passed, Lighthouse 100 in the four categories on the six audited pages with CLS 0; CI run 40326958127 (PR head identical to the merged tree): `verify` 2m42s, `site-browser` 5m25s, 8 mutation shards at 100.00.
- Review: four lenses, one correction round and a Judgment Day per group. Group 3 Judgment Day found one MAJOR (Enter could not press a focused button), reproduced in Chromium, fixed with an e2e test, scoped re-judgment clean, APPROVED.
- `sdd-verify`: PASS WITH WARNINGS, 0 critical, 54/54 requirements and 198/198 scenarios (192 id'd, 6 unnamed) (`verify-report.md`). The warnings are owner items, bookkeeping and follow-ups; the `SX`/`GX` rows are the per-slice template and stay unticked by design.

## Owner decisions and open owner items

- Recorded during the change: OA1 yields from the QUIKRETE No. 1101 data sheet (0.30 / 0.45 / 0.60 ft³ per 40 / 60 / 80 lb bag); OA2 the 17 URL keys and defaults are permanent from the group 1 merge (`RELEASED`); OA3 10 percent waste is a rule of thumb the user can change; budgets raised once (engine graph 49,152 B, probe 40,960 B); FAQ answers capped at 450 characters for the HTML budget; one PR per group.
- Open (F.3): 12 content entries still `ownerReview: pending` (the concrete EN/ES entries and the trust pages); copy for the owner to confirm: `banquetas`, the `×` answer wording, the `<1/64 in` texts, the ready-mix price per m³ question.
- Open (F.4): Cloudflare still auto-injects the Web Analytics beacon for real browsers; the CSP blocks it, but the owner must turn the injection off (and keep Email Address Obfuscation and Rocket Loader off). Automated post-deploy smoke stays a follow-up.

## Specs promoted

New: `calc-concrete` (10 requirements), `calculator-page` (14), `core-geometry` (2). Modified: `fraction-format` (Length text grammar amended with the glued feet-inches and abbreviation-period rules, FPX1 to FPX3), `i18n-catalog` (3 modified), `material-data-contract` (1 renamed, 1 modified), `site-quality` (5 modified, 1 added), `site-routing-i18n` (2 modified, 2 added), `site-seo` (4 modified, 2 added), `site-shell` (1 renamed, 2 modified), `trust-pages` (3 modified). Promotion done by hand with a script that replaced each modified requirement block, appended the added ones, renamed the headers and asserted every delta block present verbatim.

## Follow-ups carried forward

From `apply-progress.md` (correction rounds and Judgment Day sections): automated post-deploy smoke against production (JD-7), e2e sharding as the suite grows, ready-mix price per m³ (owner), a generic calculator core before the second calculator (JD-5: `CalculatorView.astro` calls `concreteView` for every id and the e2e page list is hand-kept), seeded Lighthouse-threshold tests for SQ10/SQ11, names for the 6 unnamed scenarios, RES-1 (one build with two injected routes in the budget test), RES-2, R1-3, R1-4, RD-10 to RD-15.
