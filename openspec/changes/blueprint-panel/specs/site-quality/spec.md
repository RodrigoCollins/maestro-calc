# Delta for site-quality

Budgets and gates are unchanged ([SQ6], [SQ7], [SQ8], [SQ22], [SQ24] keep their text; no limit is raised). What changes is what proves them for the drawing and the share link, and the browser records gain the drawing group. Continues the prefix SQ (next free id: SQ38). Added: [SQ38] to [SQ44]. Every existing requirement is unchanged.

## ADDED Requirements

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
