# site-quality

Implements PLAN.md §6.3 (e2e on a simulated phone EN/ES, performance budget, Lighthouse >= 95) and decision D7. Deterministic checks (byte budgets, zero JS, SEO) run in `check:site` inside the `verify` job; browser checks run in one `site-browser` job.

## Requirements

### Requirement: Accessibility scan with axe

Every built page (14 routable plus 2 404 pages, all served from the built output) MUST be scanned in Chromium with axe-core using the tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa` and MUST report 0 violations (incomplete results are listed, not failing). The calculator pages are additionally scanned in the interactive states of "Calculator quality coverage".
(Previously: 12 routable plus 2 404 pages, no interactive states.)

#### Scenario: [SQ1] Zero violations
- GIVEN the built site served locally
- WHEN axe runs on each of the 16 pages
- THEN every page reports `violations.length === 0`

#### Scenario: [SQ2] Seeded violation fails
- GIVEN a built copy where one image lacks `alt` or one page has a duplicate `id`
- WHEN the axe job runs
- THEN the job fails naming the page and rule

### Requirement: Simulated-phone smoke in EN and ES

A Playwright smoke test MUST run on a 390x844 viewport with touch emulation and `deviceScaleFactor` 3 for both locales, covering the home, an inner page, the calculator page and a 404 page per locale. It MUST assert: status 200 (404 for unknown paths), `lang` attribute, one visible H1, no horizontal overflow (`document.documentElement.scrollWidth <= window.innerWidth`), the skip link, header navigation, language switch and footer links work, and no request to a non-same origin or, outside calculator pages, of type `script`.
(Previously: home, inner page and 404 only; no request of type `script` on any page.)

#### Scenario: [SQ3] EN and ES smoke
- GIVEN Chromium with the phone profile
- WHEN `/`, `/methodology`, `/concrete-calculator`, `/es`, `/es/metodologia`, `/es/calculadora-de-concreto` are opened
- THEN each has status 200, the expected `lang`, one visible H1 and no horizontal overflow

#### Scenario: [SQ4] Unknown paths in both locales
- GIVEN the local server (or the deployed site for the post-deploy smoke)
- WHEN `/x` and `/es/x` are opened
- THEN statuses are 404, `lang` is `en-US` and `es-US`, and each shows a link to its locale home

#### Scenario: [SQ5] No third-party requests
- GIVEN request logging on all 16 page loads
- WHEN requests are collected
- THEN every request origin equals the server origin

### Requirement: Byte budgets

`npm run check:site` MUST fail when, for any built page, any of these measured raw (uncompressed) sizes is exceeded: HTML <= 40,960 bytes; CSS (linked plus inline) <= 20,480 bytes; each woff2 <= 30,720 bytes and the four together <= 92,160 bytes; client JavaScript = 0 bytes on a page that is not a calculator page, and <= 49,152 bytes on a calculator page (the sum of every JS file reachable from the page: its entry script, its `modulepreload` targets and their static imports, i.e. the entry plus its static graph); page weight (HTML + CSS + fonts it loads + favicon + the JavaScript it loads) <= 163,840 bytes on a page that is not a calculator page and <= 196,608 bytes on a calculator page. The design phase MAY lower the calculator numbers after measuring the build, never raise them. Rationale: the longest trust page is about 1,500 words (about 12 KB of HTML), a Latin Barlow woff2 weighs about 15 to 25 KB, a token-based static CSS is under 10 KB; budgets leave about 2x headroom and keep first load under the 1 s goal of PLAN.md §4.3 on a mobile connection; a vanilla module that carries the exact-rational engine and the URL codec fits in 48 KiB.
(Previously: client JavaScript = 0 bytes everywhere and one page-weight ceiling of 163,840 bytes.)

#### Scenario: [SQ6] Budgets pass on the build
- GIVEN a clean build
- WHEN `npm run check:site` runs
- THEN it exits 0 and prints the largest page and its size per category, including the JavaScript of the calculator pages

#### Scenario: [SQ7] HTML over budget fails
- GIVEN a built copy where one HTML file is 40,961 bytes
- WHEN `npm run check:site` runs
- THEN it exits non-zero naming the file and limit

#### Scenario: [SQ8] Any JS byte on a static page fails
- GIVEN a built copy that adds a 1-byte `.js` file referenced by `/privacy` (or by the home page)
- WHEN `npm run check:site` runs
- THEN it exits non-zero

#### Scenario: [SQ22] Calculator JS budget edge
- GIVEN a built copy where the JS file of the calculator pages is 49,152 bytes, and another where it is 49,153 bytes
- WHEN `npm run check:site` runs
- THEN the first exits 0 and the second exits non-zero naming the page, the file and the 49,152 limit

#### Scenario: [SQ23] Imports are counted
- GIVEN a built copy where the calculator script statically imports a second JS file of 20,000 bytes while the entry is 20,000 bytes
- WHEN `npm run check:site` runs
- THEN it exits non-zero (50,000 > 49,152)

#### Scenario: [SQ24] Calculator weight ceiling
- GIVEN a built copy where a calculator page weighs 196,609 bytes, and another where a trust page weighs 163,841 bytes
- WHEN `npm run check:site` runs
- THEN both exit non-zero naming the page and its own limit

### Requirement: Lighthouse CI

Lighthouse CI MUST run in the `site-browser` job on exactly one page per template per locale with the mobile preset: `/`, `/es` (home), `/methodology`, `/es/metodologia` (trust pages) and one representative calculator page, named once in the browser tooling (today `concrete`: `/concrete-calculator`, `/es/calculadora-de-concreto`). Adding calculators does not add Lighthouse runs. Categories accessibility, SEO and best-practices MUST each score >= 0.95 (assertion level `error`, blocking). Performance >= 0.95 MUST be asserted at level `warn` (advisory, D7). Cumulative layout shift MUST be <= 0.01 at level `error`. At most 3 runs per page.
(Previously: `/privacy` and `/es/privacidad` as the third pair, no calculator template. Privacy shares the trust template with methodology.)

#### Scenario: [SQ9] Thresholds configured
- GIVEN the Lighthouse CI configuration file
- WHEN parsed
- THEN the URL list is the six pages above, the three category assertions have `minScore: 0.95` at `error`, performance is `warn` at 0.95, CLS `maxNumericValue` is 0.01 at `error`, and `numberOfRuns` is between 1 and 3

#### Scenario: [SQ10] Blocking category regression
- GIVEN a page scoring 0.94 in SEO
- WHEN Lighthouse CI asserts
- THEN the job fails

#### Scenario: [SQ11] Performance is advisory
- GIVEN a page scoring 0.90 in performance with other categories at 0.95 or higher
- WHEN Lighthouse CI asserts
- THEN the job passes and reports a warning

#### Scenario: [SQ25] One URL per template
- GIVEN the route table, the calculator id list, the representative calculator id and the Lighthouse URL list
- WHEN the configuration contract test runs
- THEN the list holds exactly the home, one trust page and the representative calculator page in each locale (six URLs), and it fails when the representative id is not a calculator page of the route table or its two paths are missing from the list

### Requirement: Security headers and caching

`apps/web/public/_headers` MUST set on all paths: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` disabling camera, microphone and geolocation, and a `Content-Security-Policy` containing `default-src 'self'`, `script-src 'self'`, `frame-ancestors 'none'`, `base-uri 'self'` and `form-action 'self'`. The `script-src` directive MUST NOT contain `'unsafe-inline'`, `'unsafe-eval'`, `'strict-dynamic'`, a nonce, a hash, `data:` or any host. The other directives are unchanged (`style-src 'self' 'unsafe-inline'`, `img-src 'self' data:`, `font-src 'self'`, `object-src 'none'`). Hashed assets (the build asset directory and fonts) MUST carry `Cache-Control: public, max-age=31536000, immutable`; HTML MUST NOT be immutable. The policy is global (one `/*` block): static pages carry no script, so `script-src 'self'` costs them nothing, and per-path policies do not scale (the rule file is capped at 100 rules).
(Previously: `script-src 'none'`.)

#### Scenario: [SQ12] Header content
- GIVEN `dist/_headers`
- WHEN parsed
- THEN the global block contains the four headers with the values above, the CSP `script-src` is exactly `'self'`, and no other `script-src` appears in the file

#### Scenario: [SQ13] Immutable assets only
- GIVEN `dist/_headers` and the built asset names
- WHEN cache rules are matched to paths
- THEN every hashed asset path (including the calculator JS) matches an `immutable` rule and no `.html` path does

#### Scenario: [SQ14] CSP does not break pages
- GIVEN Chromium on all 16 pages with console capture, and on the calculator pages while typing, switching shape, copying the link and switching language
- WHEN pages load and update with the headers applied
- THEN there are 0 CSP violation messages and the calculator updates its result

#### Scenario: [SQ26] CSP blocks inline script
- GIVEN a built copy with an inline `<script>alert(1)</script>` added to a calculator page and served with the headers
- WHEN the page loads in Chromium
- THEN the script does not run and a CSP violation is reported (and `check:site` also fails the copy, [SS22])

### Requirement: CI job shape and cost limits

The browser checks MUST run in one job named `site-browser`, `needs: verify`, Chromium only, with the Playwright browser directory cached keyed on the Playwright version and the runner image and saved right after the browser install, `timeout-minutes` <= 20, `permissions: contents: read`, no `continue-on-error`. Playwright reports and Lighthouse output MUST be uploaded as artifacts only on failure. The job MUST run on every pull request and push to `main` (no path filter).

#### Scenario: [SQ15] Job definition
- GIVEN `.github/workflows/ci.yml`
- WHEN parsed
- THEN job `site-browser` has `needs: verify`, `timeout-minutes` <= 20, installs only `chromium`, restores the browser directory from the cache and saves it right after the install, and no `continue-on-error`

(Amended 2026-10-26 after the concrete-calculator archive: the bound was 10 and the cache was saved by the implicit post-job step. A warm cache runs the job in about five minutes, but `main` cannot read the caches saved by pull-request branches, so its first run after a cache-key change installs Chromium and its OS packages cold, seven to twelve minutes, and the ten-minute bound killed run 40328577005 before the step that saves the cache; a fifteen-minute bound killed run 40330882184 the same way. The cache is now saved right after the install, so one cold run warms `main`, and the bound covers the worst cold run. The measured target stays about five minutes warm.)

#### Scenario: [SQ16] Not skipped
- GIVEN a pull request changing only documentation
- WHEN CI runs
- THEN `site-browser` runs and reports a conclusion

### Requirement: Calculator quality coverage

The browser job and `check:site` MUST cover the calculator template, in both locales, on top of the page lists derived from the route table. The browser suites MUST iterate one typed record per calculator page, `Record<CalculatorPageId, E2eSpec>`, in the browser tooling: a page id without a record is a type error. The generic suites (controls enabled after mount, aborted module leaves the static page, labels equal to the catalog, touch targets, unit toggle, copy link, CSP console, axe states, layout shift and reserved sizes) run for every record and name no calculator. Calculator-specific data (the default answer sentence per locale, the hand-verified states with their query and figures, and the optional choice groups, steppers, shopping lines and price states) is declared per id in its record, and a suite skips a group the record does not declare. The record of `concrete` carries the existing hand-written states, sentences and strings unchanged.
(Previously: the suites iterated a hand-kept concrete-only list `CONCRETE_PAGES`, and `csp.spec.ts` hardcoded `/concrete-calculator`.)

In detail:

- axe-core (same tags as above) runs on each calculator page in the default state and after interaction: every option of every choice group the record declares (concrete: shape switched to footing, to column and to steps), an invalid field (error shown), the metric unit system, and a non-zero price when the record declares cost rows (cost rows visible); 0 violations in each.
- A Playwright project with JavaScript disabled loads each calculator page and asserts the default result, the "not running" note (`calculator-page` [CP40]), and that no request has type `script`.
- A size probe runs in `verify` from the engine group onward: it bundles and minifies, with the web build's bundler, the engine surface the calculator entry will import (the calculator factory, the yields-only module, validation, the URL codec and the display formatting of core) and fails above 40,960 bytes, which leaves 8,192 bytes of the 49,152 budget for the page controller, presenter and DOM code. Its measured size is printed and recorded in the apply progress.
- A page loaded with a state in its query (`?v=1&sh=footing&l=216&n=3` for concrete) keeps cumulative layout shift at or below 0.01.
- No CSP violation message appears in the console during load or interaction.
- The `calculators` mutation shard's mutant count is measured and recorded in the apply progress; when it passes about 400 it is split per `AGENTS.md` (D14).

#### Scenario: [SQ17] axe on interactive states
- GIVEN the built site served locally and a phone-profile Chromium
- WHEN axe runs on `/concrete-calculator` and `/es/calculadora-de-concreto` in the default state and in the five interaction states above
- THEN every run reports `violations.length === 0`

#### Scenario: [SQ18] No-JS project
- GIVEN Chromium with `javaScriptEnabled: false`
- WHEN `/concrete-calculator` and `/es/calculadora-de-concreto` are opened
- THEN each shows the default result (1.63 cubic yards and 74 bags of 80 lb; 1.63 yardas cúbicas and 74 bolsas), shows the "not running" note, has status 200 and logs no `script` request

#### Scenario: [SQ27] Engine size probe
- GIVEN the size probe over the engine surface of the concrete entry
- WHEN `npm run verify` runs
- THEN it prints the minified size and fails when it exceeds 40,960 bytes

#### Scenario: [SQ28] Static pages request no script, including platform injections
- GIVEN Chromium loading every non-calculator page of the local build, and the post-deploy smoke loading `/` and `/privacy` in production
- WHEN requests are logged
- THEN no request has type `script`, and no page references a `/cdn-cgi/` script (Cloudflare features such as Email Address Obfuscation or Rocket Loader inject one, and `script-src 'self'` would allow it)

#### Scenario: [SQ19] Layout stability with a state in the URL
- GIVEN Chromium on the phone profile opening `/concrete-calculator?v=1&sh=footing&l=216&n=3`
- WHEN the load settles and layout-shift entries are summed
- THEN the total is at most 0.01

#### Scenario: [SQ20] Seeded violation on an interactive state
- GIVEN a built copy where the error message of an invalid field lacks its association with the input
- WHEN the axe job runs the error state
- THEN the job fails naming the page, the state and the rule

#### Scenario: [SQ21] Mutation measurement recorded
- GIVEN the apply progress of this change
- WHEN `npm run mutation -- --shard calculators` has run
- THEN the mutant count is recorded, and a shard split is made only when it exceeds about 400

#### Scenario: [SQ29] Missing record fails typecheck
- GIVEN an id added to `CALCULATOR_PAGES` with no entry in the per-id e2e record
- WHEN `npm run typecheck --prefix tooling/site-browser` runs
- THEN it fails naming the record and the id

#### Scenario: [SQ30] Generic suites iterate the record
- GIVEN a record for a second calculator declaring only a default sentence per locale, one figure state and the metric toggle (no choice group, stepper, shopping or price)
- WHEN the generic suites run
- THEN they run for both calculators, skip the groups the second record does not declare, and no suite file contains a concrete path, string or selector outside the concrete record

#### Scenario: [SQ31] Concrete assertions are unchanged
- GIVEN the concrete record after this change
- WHEN the calculator, axe, layout and CSP suites run on the build
- THEN the 283 existing tests pass with the same assertions, and the only edit to them is the selector rename of `calculator-page` [CP54]

#### Scenario: [SQ32] CSP suite covers every calculator
- GIVEN the CSP suite
- WHEN it loads each calculator page of the record while typing, pressing a choice button, copying the link and switching language
- THEN there are 0 CSP violation messages on every page, and no path is hardcoded in the suite

### Requirement: The budget proof covers every calculator page

The full-length budget fixture (`apps/web/src/contract/__testing__/budget-page.astro` and `CalculatorBody.budget.test.ts`) MUST be generated by calculator id: one fixture route `/zz-budget/[id]/[locale]` in the one `base` build (no build per id), whose paths are derived from `CALCULATOR_PAGES` × the locales (there is no separate budget table), built from the real components, the page's own entry sources, island and reserve, and the longest copy, with each page's HTML size and headroom against the 40,960 byte limit asserted. The padding of the seeded case is set per id and locale. A new calculator page is covered with no edit to the fixture or the test. No budget is raised: the HTML limit stays 40,960 B, CSS 20,480 B, the calculator entry static graph 49,152 B and the calculator page weight 196,608 B. The shared markup, CSS and page view MUST NOT grow the Spanish concrete page past 40,836 B at any pull-request tip (it measures 40,573 B before this change: 263 B under the pin, 387 B under 40,960 B). The placeholder copy of the fixture names no calculator (its FAQ questions are neutral) and keeps its byte length.

#### Scenario: [SQ33] One fixture route per calculator page and locale
- GIVEN the budget fixture after the go-live, with `CALCULATOR_PAGES` = `['concrete', 'rectangle-area']`
- WHEN the `base` build runs
- THEN `/zz-budget/concrete/en`, `/zz-budget/concrete/es`, `/zz-budget/rectangle-area/en` and `/zz-budget/rectangle-area/es` are built from one fixture file whose `getStaticPaths` is `CALCULATOR_PAGES` × the locales, each with its measured size and headroom printed; a page id without a content entry fails the build naming the id; and the padding variables are named by id and locale (`BUDGET_EXTRA_CONCRETE_ES`, `BUDGET_EXTRA_RECTANGLE_AREA_ES`), so padding one page never pads another (a build and unit test; before the go-live the same test builds the concrete paths only)

#### Scenario: [SQ34] Every calculator page fits with full-length copy
- GIVEN the four fixture pages built with the longest FAQ answers, the longest answer sentence and the full-length sections
- WHEN each size is compared with 40,960 bytes
- THEN every page is at most 40,960 bytes, the rectangle-area headroom is recorded in the apply progress, and the real built `rectangle-area` pages also pass `npm run check:site` (a build test)

#### Scenario: [SQ35] The tightest page stays at its ceiling
- GIVEN the Spanish concrete fixture page at every pull-request tip of this change
- WHEN its size is measured
- THEN it is at most 40,836 B, and the measured value of each tip is recorded in the apply progress ([CP66] holds; a build test)

#### Scenario: [SQ36] The seeded over-budget case stays on concrete Spanish
- GIVEN the seeded "one byte over" test, which pads the Spanish concrete fixture page by the headroom plus one byte
- WHEN the budget assertion runs
- THEN it fails naming the page and the 40,960 limit, the seeded build pads only the concrete pages (`BUDGET_EXTRA_CONCRETE_<LOCALE>`), and no second seeded case exists for another id (a unit test)

#### Scenario: [SQ37] Browser record for the second calculator
- GIVEN `tooling/site-browser/e2e/rectangle-area-pages.ts` exporting the `E2eSpec` with both locale catalogs, the ready input, the input count, the numeric inputs and figures with their defaults, the four hand-verified states of `calc-rectangle-area` [RAP3], the `metric` block, `tabOrder`, `bounds`, `layoutQueries` and the `answer` group, and no choice, stepper, shopping or price group, and its row in `E2E`
- WHEN `npm run build && npm run test:e2e` runs, and `npm run lighthouse` runs over the representative pages
- THEN the generic suites (`calculator.spec.ts`, `a11y.spec.ts`, `layout.spec.ts`, `csp.spec.ts`) run for both calculators and skip the groups the record does not declare, axe reports 0 violations on both locales ([SQ1]), the smoke and no-js projects pick up the two new routes from the route table, there are 0 CSP violations ([SQ32]), a missing `E2E` row fails `npm run typecheck --prefix tooling/site-browser` naming the id ([SQ29]), and Lighthouse keeps accessibility, SEO and best practices at 0.95 or higher and layout shift at 0.01 or lower ([SQ9]) (an e2e test; the concrete assertions are unchanged, [SQ31])

### Requirement: Budgets hold with the drawing and the share link

The HTML limit stays 40,960 B, CSS 20,480 B, the calculator entry static graph 49,152 B and the calculator page weight 196,608 B, and the Spanish concrete page pin stays 40,836 B ([CP66]). The shared markup, CSS and page view MUST NOT grow the Spanish concrete fixture page past 40,836 B at any pull-request tip; the concrete page measures 40,678 B before this change (158 B under the pin). The markup trim of the concrete page (target at least 700 B; trim A–E of the design, about 826 B; the `:root` tokens of `tokens.css` stay, site-shell [SS24]–[SS26]) MUST land and be measured before the share slice starts, and is behaviour-neutral: visible text, ids and ARIA unchanged; hook and guard changes are limited to the design's trim table. If the measured trim leaves less room than the forecast additions, the apply stops and reports to the owner; no budget is raised.

#### Scenario: [SQ38] The concrete pin at each tip
- GIVEN the Spanish concrete fixture page (`/zz-budget/concrete/es`) at the tip of each of the three pull requests of this change
- WHEN its size is measured
- THEN it is at most 40,836 B at every tip, the value of each tip is recorded in the apply progress, and `npm run check:site` passes on the real build (a build test; [SQ35] keeps holding)

#### Scenario: [SQ39] The trim is neutral
- GIVEN the concrete pages before and after the trim (PR 2, slice S3)
- WHEN their visible text, ids and ARIA attributes are compared
- THEN they are equal; the only hook change is the one of the trim table (the cost row and its price hint merge, so `data-hint-row` is gone and `data-cost-row`, `data-price-hint` sit in one row); the only guard changes are the ones the trim table lists; the fixture page is at least 700 B smaller; and no count or budget is edited (a build test and the existing unit suite)

#### Scenario: [SQ40] Square footage fits with the drawing
- GIVEN the full-length `rectangle-area` fixture pages (EN, ES) after PR 1 and PR 2
- WHEN each size is compared with 40,960 B
- THEN each is at most 40,960 B, and the headroom (6,801 B before this change for ES) is recorded in the apply progress (a build test; [SQ34])

#### Scenario: [SQ41] JS budgets with the writer
- GIVEN the built entries of `concrete` and `rectangle-area` after each pull request
- WHEN the entry-graph and client-entry contracts weigh each static graph
- THEN every graph is at most 49,152 B (39,164 B and 33,803 B before this change), the page weight is at most 196,608 B, the drawing writer and geometry appear only in graphs of pages that declare the slot ([CWC43]), and no file of any graph contains message text or an `https?://` URL other than the site origin `https://maestrocalc.com` (a contract test, `client-entry.contract.test.ts`; the SVG namespace comes from `box.namespaceURI` and the share base from the inert `data-share` attribute of the page, so no allowance is added; if a literal ever becomes unavoidable, it is an exact identifier anchored with `(?![\w.-])` and stripped before the scan, as `site-check/facts.ts` does for the SVG namespaces, never a host prefix)

### Requirement: Browser record covers the drawing and the share link

The `E2eSpec` of `tooling/site-browser/e2e/` gains an optional `drawing` group and an optional `share` group, each switching its tests on, like the existing optional groups. A page MUST declare the `drawing` group exactly when its module declares the `drawing` slot, enforced by a web-side contract test (`tooling/site-browser` resolves only `@maestro-calc/i18n` and cannot see `PAGES`, so no type error can carry this), and the generic suites skip the groups a record does not declare.

#### Scenario: [SQ42] Drawing group of the record
- GIVEN `rectangle-area-pages.ts` after PR 1 and the concrete record after PR 3 with a `drawing` group (the labels of the hand-verified states, the clamp-case inputs, the widths for the box check)
- WHEN `npm run build && npm run test:e2e` runs
- THEN [BD9] to [BD11], [BD14], [BD15], [BD17], [BD20], [BD23] and [BD25] run for each page with the group, axe reports 0 violations on both locales in every drawn state ([SQ1], [SQ17]), and for each id of `CALCULATOR_PAGES` a contract test in `apps/web` reads the record `tooling/site-browser/e2e/<id>-pages.ts` as text (as `styles.contract.test.ts` reads `layout.spec.ts` and `lighthouse.contract.test.ts` reads the representative) and fails, naming the id, unless `PAGES[id].module.drawing` is declared exactly when the record declares a `drawing` group (an e2e test and a contract test)

#### Scenario: [SQ43] Share group of the record
- GIVEN the records of both pages with the `share` group (the expected encoded text per locale and one state)
- WHEN `npm run test:e2e` runs
- THEN [CP78] to [CP83] run on both pages in both locales, and the smoke project confirms the share anchor is hidden without JS (an e2e test)

#### Scenario: [SQ44] CLS and Lighthouse with the additions
- GIVEN `npm run build && npm run lighthouse` over the representative pages and the e2e layout sweep, on Linux CI
- WHEN each drawn page is audited at the seven widths
- THEN layout shift is at most 0.01, accessibility, SEO and best practices stay at 0.95 or higher ([SQ9]), contrast reports 0 violations including the drawing and the share anchor, and Linux CI results decide layout and wrapping when they differ from macOS (an e2e test and a Lighthouse run)
