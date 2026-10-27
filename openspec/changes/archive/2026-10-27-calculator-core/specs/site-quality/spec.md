# Delta for site-quality

The browser suites for calculator pages run over a typed per-calculator record instead of a concrete-only list, so a second calculator adds a record and no suite. Continues the prefix SQ (next free id: SQ29). `calculator-web-core` owns the `Record<CalculatorPageId, …>` rule; this delta states what the suites do with it. Every other SQ requirement is unchanged.

## MODIFIED Requirements

### Requirement: Calculator quality coverage

The browser job and `check:site` MUST cover the calculator template, in both locales, on top of the page lists derived from the route table. The browser suites MUST iterate one typed record per calculator page, `Record<CalculatorPageId, E2eSpec>`, in the browser tooling: a page id without a record is a type error. The generic suites (controls enabled after mount, aborted module leaves the static page, labels equal to the catalog, touch targets, unit toggle, copy link, CSP console, axe states, layout shift and reserved sizes) run for every record and name no calculator. Calculator-specific data (the default answer sentence per locale, the hand-verified states with their query and figures, and the optional choice groups, steppers, shopping lines and price states) is declared per id in its record, and a suite skips a group the record does not declare. The record of `concrete` carries the existing hand-written states, sentences and strings unchanged.
(Previously: the suites iterated a hand-kept concrete-only list `CONCRETE_PAGES`, and `csp.spec.ts` hardcoded `/concrete-calculator`.)

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
