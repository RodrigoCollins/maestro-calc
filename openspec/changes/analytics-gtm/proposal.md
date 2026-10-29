# Proposal: analytics-gtm

## Intent

The owner (2026-10-29): wire Google Tag Manager (container `GTM-MD8H6L5S`, created 2026-10-23) with GA4, with consent and without breaking the performance and layout budgets. First step of the post-design plan: analytics, then Open Graph, then the pageless calculators, then AdSense.

## Decisions

- **Loader, not an inline snippet.** Every page carries `<script src="/analytics.js" data-gtm="GTM-…" data-host="maestrocalc.com" defer>` at the end of the head (`BaseLayout`). The file (`apps/web/public/analytics.js`, 2,422 B) sets the Consent Mode v2 defaults, pushes the address and the referrer without their query as `page_location_clean` and `page_referrer_clean`, and adds `gtm.js` from `www.googletagmanager.com` after the `load` event and an idle moment. The CSP keeps no `'unsafe-inline'`, no eval, no nonce.
- **Production only.** The loader returns at once unless `location.hostname` equals `data-host`: preview deploys, `wrangler dev` and the browser tests send nothing to Google.
- **Consent Mode v2 defaults, no banner yet.** `ad_storage`, `ad_user_data`, `ad_personalization` denied everywhere (no advertising). `analytics_storage` granted by default, denied for the EEA, the United Kingdom and Switzerland (region default, 32 codes) and anywhere the browser sends Global Privacy Control. A consent banner (CMP) comes with AdSense, which needs one for those regions anyway.
- **The calculator values never reach GA4.** They live in the query. The loader offers `page_location_clean` (origin + path); the GA4 tag of the container must send it as `page_location` (owner step 3), and history-change page views must be off (owner step 4), because the controller rewrites the query with `history.replaceState` on every edit.
- **CSP** (Google's list for GTM with GA4 without advertising features, tag-platform/security/guides/csp, read 2026-10-29): `script-src 'self' https://www.googletagmanager.com`; `img-src` adds `https://www.googletagmanager.com https://*.google-analytics.com`; a new `connect-src 'self' https://www.googletagmanager.com https://*.google-analytics.com https://*.google.com`. Google Signals and ads features stay off (they would need `doubleclick.net`).
- **Guards.** `check:site` allows exactly one analytics tag per page in its one shape (deferred, classic, no body, `data-gtm` = `GTM-…`, `data-host`), the loader as the one script file outside `_astro/`, the exact `gtm.js` address in that file only, and gives it a budget of its own (3,072 B) that counts toward the page weight; the zero-JS budget of static pages stays 0 for anything else. The e2e helpers leave the loader out of "no script" checks and accept Google requests only when `BASE_URL` is production; a new e2e checks every page loads the loader once and reaches no Google host locally. A `node:vm` unit test runs the loader (host gate, consent defaults, GPC, clean address, load timing).
- **Privacy** (EN/ES) rewritten for GA4 through GTM: what is sent (page without the typed values, browser and device, screen size, approximate location), the `_ga` cookie outside the EEA/UK/CH, no cookie there or with GPC, advertising off, opt-out; the "update before analytics" promise now reads "before we add advertising". Both entries are `ownerReview: pending` until the owner reads them.

## Google Tag Manager and GA4 setup (done 2026-10-29, in the owner's browser with his approval)

- GA4 account "Maestro Calc" (Google account of the GTM container), property `maestrocalc.com` (time zone Buenos Aires, USD), terms accepted for Argentina; every data sharing option off; Google Signals not enabled.
- Web stream `https://maestrocalc.com`, measurement id **G-2N1E2VTEVN**. Enhanced measurement: page loads on; **page changes from browser history events off**; site search off; form interactions off; scrolls, outbound clicks, video and file downloads on.
- GTM container `GTM-MD8H6L5S`, published version 2 "GA4 with clean page_location and page_referrer": Data Layer Variables `DLV page_location_clean` (default `https://maestrocalc.com{{Page Path}}`, also without the query) and `DLV page_referrer_clean`; a Google tag `G-2N1E2VTEVN` on Initialization – All Pages with `page_location` = `{{DLV page_location_clean}}` and `page_referrer` = `{{DLV page_referrer_clean}}` (a same-site referrer is the full address of the page before, values included, under `strict-origin-when-cross-origin`).
- Remaining owner step: read and approve the new privacy text (EN and ES).
- Remaining check after the merge: a production load of a calculator link with a query sends `page_location` and `page_referrer` without it (Tag Assistant or the GA4 DebugView / Realtime report).

## Spec changes (at archive)

- site-quality [SQ12]: the CSP above. [SQ7]: the analytics loader budget (3,072 B, counted in the page weight). [SQ28]: "requests no script" means none besides the analytics loader; against production the Google requests of the loader are expected.
- site-shell [SS18]–[SS22]: a static page carries JSON-LD and the analytics tag; a calculator page also its one module.
- trust-pages [TP13], [TP14], [TP27], [TP34]: the privacy facts and copy above; the home requests no script of its own.

## Verification so far

`npm run verify` 0 (4,210 tests); `npm run test:e2e` 724 passed. Production verification waits for the owner steps.
