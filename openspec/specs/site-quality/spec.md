# site-quality

Implements PLAN.md §6.3 (e2e on a simulated phone EN/ES, performance budget, Lighthouse >= 95) and decision D7. Deterministic checks (byte budgets, zero JS, SEO) run in `check:site` inside the `verify` job; browser checks run in one `site-browser` job.

## Requirements

### Requirement: Accessibility scan with axe

Every built page (12 routable plus 2 404 pages, all served from the built output) MUST be scanned in Chromium with axe-core using the tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa` and MUST report 0 violations (incomplete results are listed, not failing).

#### Scenario: [SQ1] Zero violations
- GIVEN the built site served locally
- WHEN axe runs on each of the 14 pages
- THEN every page reports `violations.length === 0`

#### Scenario: [SQ2] Seeded violation fails
- GIVEN a built copy where one image lacks `alt` or one page has a duplicate `id`
- WHEN the axe job runs
- THEN the job fails naming the page and rule

### Requirement: Simulated-phone smoke in EN and ES

A Playwright smoke test MUST run on a 390x844 viewport with touch emulation and `deviceScaleFactor` 3 for both locales, covering the home, an inner page and a 404 page per locale. It MUST assert: status 200 (404 for unknown paths), `lang` attribute, one visible H1, no horizontal overflow (`document.documentElement.scrollWidth <= window.innerWidth`), the skip link, header navigation, language switch and footer links work, and no request to a non-same origin or of type `script`.

#### Scenario: [SQ3] EN and ES smoke
- GIVEN Chromium with the phone profile
- WHEN `/`, `/methodology`, `/es`, `/es/metodologia` are opened
- THEN each has status 200, the expected `lang`, one visible H1 and no horizontal overflow

#### Scenario: [SQ4] Unknown paths in both locales
- GIVEN the local server (or the deployed site for the post-deploy smoke)
- WHEN `/x` and `/es/x` are opened
- THEN statuses are 404, `lang` is `en-US` and `es-US`, and each shows a link to its locale home

#### Scenario: [SQ5] No third-party requests
- GIVEN request logging on all 14 page loads
- WHEN requests are collected
- THEN every request origin equals the server origin

### Requirement: Byte budgets

`npm run check:site` MUST fail when, for any built page, any of these measured raw (uncompressed) sizes is exceeded: HTML <= 40,960 bytes; CSS (linked plus inline) <= 20,480 bytes; each woff2 <= 30,720 bytes and the four together <= 92,160 bytes; client JavaScript = 0 bytes; page weight (HTML + CSS + fonts it loads + favicon) <= 163,840 bytes. Rationale: the longest trust page is about 1,500 words (about 12 KB of HTML), a Latin Barlow woff2 weighs about 15 to 25 KB, a token-based static CSS is under 10 KB; budgets leave about 2x headroom and keep first load under the 1 s goal of PLAN.md §4.3 on a mobile connection.

#### Scenario: [SQ6] Budgets pass on the build
- GIVEN a clean build
- WHEN `npm run check:site` runs
- THEN it exits 0 and prints the largest page and its size per category

#### Scenario: [SQ7] HTML over budget fails
- GIVEN a built copy where one HTML file is 40,961 bytes
- WHEN `npm run check:site` runs
- THEN it exits non-zero naming the file and limit

#### Scenario: [SQ8] Any JS byte fails
- GIVEN a built copy that adds a 1-byte `.js` file referenced by a page
- WHEN `npm run check:site` runs
- THEN it exits non-zero

### Requirement: Lighthouse CI

Lighthouse CI MUST run in the `site-browser` job on exactly these six pages with the mobile preset: `/`, `/es`, `/methodology`, `/es/metodologia`, `/privacy`, `/es/privacidad`. Categories accessibility, SEO and best-practices MUST each score >= 0.95 (assertion level `error`, blocking). Performance >= 0.95 MUST be asserted at level `warn` (advisory, D7). Cumulative layout shift MUST be <= 0.01 at level `error`. At most 3 runs per page.

#### Scenario: [SQ9] Thresholds configured
- GIVEN the Lighthouse CI configuration file
- WHEN parsed
- THEN the URL list is the six pages, the three category assertions have `minScore: 0.95` at `error`, performance is `warn` at 0.95, CLS `maxNumericValue` is 0.01 at `error`, and `numberOfRuns` is between 1 and 3

#### Scenario: [SQ10] Blocking category regression
- GIVEN a page scoring 0.94 in SEO
- WHEN Lighthouse CI asserts
- THEN the job fails

#### Scenario: [SQ11] Performance is advisory
- GIVEN a page scoring 0.90 in performance with other categories at 0.95 or higher
- WHEN Lighthouse CI asserts
- THEN the job passes and reports a warning

### Requirement: Security headers and caching

`apps/web/public/_headers` MUST set on all paths: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` disabling camera, microphone and geolocation, and a `Content-Security-Policy` containing `default-src 'self'`, `frame-ancestors 'none'`, `base-uri 'self'` and `form-action 'self'`. Hashed assets (the build asset directory and fonts) MUST carry `Cache-Control: public, max-age=31536000, immutable`; HTML MUST NOT be immutable.

#### Scenario: [SQ12] Header content
- GIVEN `dist/_headers`
- WHEN parsed
- THEN the global block contains the four headers with the values above

#### Scenario: [SQ13] Immutable assets only
- GIVEN `dist/_headers` and the built asset names
- WHEN cache rules are matched to paths
- THEN every hashed asset path matches an `immutable` rule and no `.html` path does

#### Scenario: [SQ14] CSP does not break pages
- GIVEN Chromium on all 14 pages with console capture
- WHEN pages load with the headers applied
- THEN there are 0 CSP violation messages

### Requirement: CI job shape and cost limits

The browser checks MUST run in one job named `site-browser`, `needs: verify`, Chromium only, with the Playwright browser directory cached keyed on the Playwright version, `timeout-minutes` <= 10, `permissions: contents: read`, no `continue-on-error`. Playwright reports and Lighthouse output MUST be uploaded as artifacts only on failure. The job MUST run on every pull request and push to `main` (no path filter).

#### Scenario: [SQ15] Job definition
- GIVEN `.github/workflows/ci.yml`
- WHEN parsed
- THEN job `site-browser` has `needs: verify`, `timeout-minutes` <= 10, installs only `chromium`, has a cache step for the browser directory, and no `continue-on-error`

#### Scenario: [SQ16] Not skipped
- GIVEN a pull request changing only documentation
- WHEN CI runs
- THEN `site-browser` runs and reports a conclusion
