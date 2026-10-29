# Proposal: analytics-gtm

## Intent

The owner (2026-10-29): wire Google Tag Manager (container `GTM-MD8H6L5S`, created 2026-10-23) with GA4, with consent and without breaking the performance and layout budgets. First step of the post-design plan: analytics, then Open Graph, then the pageless calculators, then AdSense.

## Decisions

- **Loader, not an inline snippet.** Every page carries `<script src="/analytics.js" data-gtm="GTM-…" data-host="maestrocalc.com" defer>` at the end of the head (`BaseLayout`). The file (`apps/web/public/analytics.js`, 2,422 B) sets the Consent Mode v2 defaults, pushes the address without its query as `page_location_clean`, and adds `gtm.js` from `www.googletagmanager.com` after the `load` event and an idle moment. The CSP keeps no `'unsafe-inline'`, no eval, no nonce.
- **Production only.** The loader returns at once unless `location.hostname` equals `data-host`: preview deploys, `wrangler dev` and the browser tests send nothing to Google.
- **Consent Mode v2 defaults, no banner yet.** `ad_storage`, `ad_user_data`, `ad_personalization` denied everywhere (no advertising). `analytics_storage` granted by default, denied for the EEA, the United Kingdom and Switzerland (region default, 32 codes) and anywhere the browser sends Global Privacy Control. A consent banner (CMP) comes with AdSense, which needs one for those regions anyway.
- **The calculator values never reach GA4.** They live in the query. The loader offers `page_location_clean` (origin + path); the GA4 tag of the container must send it as `page_location` (owner step 3), and history-change page views must be off (owner step 4), because the controller rewrites the query with `history.replaceState` on every edit.
- **CSP** (Google's list for GTM with GA4 without advertising features, tag-platform/security/guides/csp, read 2026-10-29): `script-src 'self' https://www.googletagmanager.com`; `img-src` adds `https://www.googletagmanager.com https://*.google-analytics.com`; a new `connect-src 'self' https://www.googletagmanager.com https://*.google-analytics.com https://*.google.com`. Google Signals and ads features stay off (they would need `doubleclick.net`).
- **Guards.** `check:site` allows exactly one analytics tag per page in its one shape (deferred, classic, no body, `data-gtm` = `GTM-…`, `data-host`), the loader as the one script file outside `_astro/`, the exact `gtm.js` address in that file only, and gives it a budget of its own (3,072 B) that counts toward the page weight; the zero-JS budget of static pages stays 0 for anything else. The e2e helpers leave the loader out of "no script" checks and accept Google requests only when `BASE_URL` is production; a new e2e checks every page loads the loader once and reaches no Google host locally. A `node:vm` unit test runs the loader (host gate, consent defaults, GPC, clean address, load timing).
- **Privacy** (EN/ES) rewritten for GA4 through GTM: what is sent (page without the typed values, browser and device, screen size, approximate location), the `_ga` cookie outside the EEA/UK/CH, no cookie there or with GPC, advertising off, opt-out; the "update before analytics" promise now reads "before we add advertising". Both entries are `ownerReview: pending` until the owner reads them.

## Owner steps (Google Tag Manager and GA4)

1. GA4: create a property and a web data stream for `https://maestrocalc.com`; note the measurement id `G-…`. Keep Google Signals off.
2. GTM, container `GTM-MD8H6L5S`: add a Data Layer Variable named `DLV page_location_clean`, data layer variable name `page_location_clean`.
3. Add a **Google tag** with the tag id `G-…`; under Configuration settings add the parameter `page_location` = `{{DLV page_location_clean}}`; trigger: Initialization – All Pages.
4. GA4 data stream → Enhanced measurement → Page views → Show advanced settings: turn **off** "Page changes based on browser history events". Turn off Form interactions and Site search (the site has neither).
5. Publish the container. Check with GTM Preview on `https://maestrocalc.com/concrete-calculator?v=1&l=240` that the page_view carries `page_location` without `?v=1&l=240`.
6. Read and approve the new privacy text (EN and ES).

Until steps 1–5 are done the loader loads an empty container: nothing is measured.

## Spec changes (at archive)

- site-quality [SQ12]: the CSP above. [SQ7]: the analytics loader budget (3,072 B, counted in the page weight). [SQ28]: "requests no script" means none besides the analytics loader; against production the Google requests of the loader are expected.
- site-shell [SS18]–[SS22]: a static page carries JSON-LD and the analytics tag; a calculator page also its one module.
- trust-pages [TP13], [TP14], [TP27], [TP34]: the privacy facts and copy above; the home requests no script of its own.

## Verification so far

`npm run verify` 0 (4,210 tests); `npm run test:e2e` 724 passed. Production verification waits for the owner steps.
