# Verify report: home-directory

Date: 2026-10-27. Base: main `5604ced` (PRs #96/#97, #98, #100 merged). Mode: strict TDD, openspec store.

## Verdict: PASS WITH WARNINGS

0 CRITICAL, 4 WARNING, 2 SUGGESTION.

## Runs

- `npm run verify`: exit 0 (200 test files, 3,699 tests; build, `check:site`, `check:dist` pass; largest calculator JS graph 38,778 B of 49,152; largest page weight 162,541 B of 196,608).
- Browser tests not re-run: CI on `5604ced` passed (site-browser 3m53s, 324 tests).
- `git diff --stat a77cd56 HEAD -- packages/`: only `packages/i18n/src/catalogs/{en,es}/site.ts` (F.1).
- History hygiene: no co-author, anthropic or "generated with" lines since `a77cd56` (GX2).

## Counts

Requirements: 8 (calculator-page 1, site-routing-i18n 1, site-shell 2, trust-pages 1 modified, plus the home requirements in the same delta; all traced).
Scenarios: 33 tagged ids checked (new: SR23, SS24-SS32, CP59-CP66, TP28-TP37 = 28; modified and regression: TP7, TP8, TP21, CP44, CP58). 33 of 33 have evidence; 1 (TP36) is evidenced by a generic suite without its tag.

## Evidence (scenario to test)

| Ids | Evidence |
|---|---|
| SR23 | `apps/web/src/routing/static-paths-page.test.ts`, `views/CalculatorView.test.ts` |
| SS24, SS25, SS26, SS30, SS31 | `apps/web/src/styles/styles.contract.test.ts`; SS24 computed sizes and SS26 also in `tooling/site-browser/e2e/home.spec.ts` and `views/HomeView.test.ts` |
| SS27 | `tooling/site-browser/e2e/home.spec.ts` |
| SS28, SS29, SS32 | `components/calculator/CalculatorBody.budget.test.ts` (built-page leak, CSS size, inlining) |
| CP59, CP60, CP61, CP62, CP63 | `tooling/site-browser/e2e/layout.spec.ts` (CP61/CP59 also `styles.contract.test.ts`; CP63 also `contract/client-entry.contract.test.ts`) |
| CP64 | `styles.contract.test.ts`, `CalculatorBody.budget.test.ts` |
| CP65 | `components/calculator/CalculatorBody.override.test.ts` |
| CP66 | `CalculatorBody.budget.test.ts` (ES full-length 40,770 B of 40,836 B) |
| CP44, CP58 | `layout.spec.ts`, `styles.contract.test.ts`, `CalculatorBody.test.ts`, `lib/page-view.test.ts` |
| TP7, TP8, TP21, TP29, TP31, TP33 | `views/HomeView.test.ts` (TP21 also `contract/content.contract.test.ts`) |
| TP28, TP30 | `lib/home-directory.test.ts`, `HomeView.test.ts` |
| TP32 | `views/home.test-d.ts` (type level) |
| TP34, TP37 | `home.spec.ts`, `CalculatorBody.budget.test.ts` |
| TP35 | `CalculatorBody.budget.test.ts` (home 9,708 / 9,818 B of 24,576 B) |
| TP36 | `a11y.spec.ts` axe over every routable path including `/` and `/es`; 0 violations recorded in apply-progress.md; contrast token side in SS31. No test carries the tag. |

## Tasks

- Ticked by this verify with evidence: P3.4, GX1 to GX6, F.1.
- Left unticked: SX1 to SX5 (per-slice template, accounted for in apply-progress.md per slice), P1.4 and P2.4 (PR exits; PRs merged but their GX records are in apply-progress.md, not re-evidenced here), F.2, F.3 (archive-time).
- Recorded deviations accepted: K9 moved into PR 1; shell styles `is:global` (-393 B); breakpoints not rounded to 0.5rem and six media blocks instead of three; CP60/CP61 amended (two-line unused bound before each breakpoint, fit strict) after Linux CI.

## Warnings

1. CP60/CP61 text in the delta spec still says one line / under one line; the amendment lives only in apply-progress.md. Sync the spec wording at archive.
2. TP36 has no tagged test; coverage is the generic axe suite.
3. P1.4, P2.4, F.2 remain unticked; PR 2 `site-browser` wall time is not located in apply-progress.md.
4. SX1 to SX5 template boxes unticked despite per-slice records.

## Suggestions

1. Tag the axe home case with [TP36].
2. Record the PR 2 CI wall time in apply-progress.md before archive.

## Follow-ups (from design.md)

Hub-era card keys; trust pages carry the catch-all chunk. Next: sdd-archive (sync specs, including the CP60/CP61 amendment).
