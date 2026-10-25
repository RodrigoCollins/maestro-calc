# Verify report: web-shell

Change: web-shell | Mode: strict TDD (`npm test`), openspec | Tree: `main` 9fd5faf (throwaway detached worktree, removed) | Date: 2026-10-25
Verdict: **PASS WITH WARNINGS** (0 CRITICAL, 5 WARNING, 2 SUGGESTION)

## Gate results (clean `npm ci`, Node 24)

| Gate | Result |
|---|---|
| `npm run verify` (format:check, sync, lint, typecheck, test:coverage, build, check:site, check:dist) | exit 0; 128 files, 2345 tests passed; type errors none; 0 lint errors |
| `check:site` | checked 14 pages; `pending ownerReview entries: 10` |
| Budgets | html 8,559 B (limit 40,960); css 4,545 B (20,480); largest font 22,772 B (30,720); fonts 89,720 B in 4 files (92,160); js 0 B (0); weight 98,569 B (163,840) |
| `npm run build && npm run test:e2e` | exit 0; 110 passed (16.6 s) |
| `npm run lighthouse` | exit 0; 6 URLs, assertions passed |
| Mutation | not run: no `packages/core` or `packages/data` change since the PR 1 cold runs (100 on all 7 shards, recorded in apply-progress) |

## Completeness (tasks.md)

All implementation tasks (1.1-1.6, 2.1-2.17, 3.1-3.13, 4.1-4.8, 5.x-11.x) are ticked and match code state. Unticked on purpose:
- Exit/process tasks 1.8, 2.18, 3.14, 4.9, 9.10, 10.9, 11.11 and the SX1-SX8 template rows: the work they describe is recorded as done (reviewers, Judgment Day, PRs #82-#85 merged); only the checkboxes were never ticked. Task 1.7 (cold CI wall time of the slowest shard): apply-progress records `format` 6m52s on PR #83 CI.
- F.1 (owner checklist, 6 sub-items): OPEN OWNER ACTION, recorded, not a failure. The 10 trust entries remain `ownerReview: pending`.
- F.2 (archive precondition): the owner waived the flip precondition on 2026-10-25 to archive with the 10 entries still pending. `sdd-verify` passes with this report. Recorded here as an owner-accepted waiver.

## Scenario coverage (106 scenarios)

Method: every id was searched in tests, contracts, e2e and tooling. Scenarios by capability: site-shell SS1-SS19, site-routing-i18n SR1-SR15, site-seo SE1-SE15, trust-pages TP1-TP20, site-quality SQ1-SQ16, quality-gates QGW1-QGW7, i18n-catalog ICW1-ICW9, monorepo-workspace MWW1-MWW5. Runtime: the covering suites all passed in the runs above.

| Capability | Scenarios | Compliant (test cites id, passed) | Compliant via test without id comment | Evidence-only (recorded negative proof) |
|---|---|---|---|---|
| i18n-catalog | ICW1-ICW9 (9) | 9 | 0 | 0 |
| monorepo-workspace | MWW1-MWW5 (5) | 5 | 0 | 0 |
| quality-gates | QGW1-QGW7 (7) | QGW5, QGW7 | QGW1-QGW4 (mutation-identity and mutation-ci-key contract tests, tasks 1.2/1.3 map) | QGW6 (task 7.18 negative proof) |
| site-seo | SE1-SE15 (15) | 15 | 0 | 0 |
| site-routing-i18n | SR1-SR15 (15) | 13 | SR7 (smoke.spec.ts round trip), SR13 (smoke.spec.ts `/es/`) | 0 |
| site-shell | SS1-SS19 (19) | 18 | SS4 (smoke.spec.ts skip-link Tab+Enter) | 0 |
| trust-pages | TP1-TP20 (20) | 20 | 0 | 0 |
| site-quality | SQ1-SQ16 (16) | 14 | 0 | SQ10, SQ11 (lighthouserc thresholds plus task 11.9 negative proofs, no automated test) |

Result: 106 of 106 scenarios have a passing covering test or a recorded evidence item; 99 cite the id directly, 4 are covered by tests that do not carry the id comment, 3 rest on recorded negative proofs.

## Intentional amendments checked

- ICW8: EN tagline is `Jobsite calculators that estimate what to buy`, ES `Calcula tu obra y sabe qué comprar`; spec, catalog and `site-catalog.test.ts` agree ("exactly what to buy" is now banned by test).
- TP15: terms EN "local building code", ES "código de construcción local" in spec, Markdown and test.
- About page claim narrowed to policy and methodology pages, pinned in `content.contract.test.ts`.

## Design coherence

No deviation breaks a spec. Recorded deviations (route-table-driven catch-all dispatch, `jsonc.ts` in `__testing__`, rules split by concern in `site-check`, WebSite `name` per spec over W12, root `wrangler.jsonc` path) are all documented in apply-progress.

## Strict TDD evidence

apply-progress has RED/GREEN/TRIANGULATE tables per group, with observed RED and spot checks or mutants for characterization tests. Not independently re-run here: the RED phases (history).

## CRITICAL

None.

## WARNING

1. tasks.md leaves exit tasks (1.7, 1.8, 2.18, 3.14, 4.9, 9.10, 10.9, 11.11) and SX1-SX8 unticked although their work is done and merged; archive should reconcile or note them.
2. F.1 owner actions are open (Email Routing, Scrape Shield off, Web Analytics injection off, `site-browser` required check, post-deploy smoke, Bot Fight Mode check, legal facts, `ownerReview` flip). F.2 precondition waived by the owner 2026-10-25. Production claims "no cookies / no analytics" depend on these Cloudflare settings.
3. SQ10, SQ11 and QGW6 have no automated test, only config plus recorded one-off negative proofs.
4. Mutation was not re-run on the final tree (no core/data change); relies on recorded PR 1 runs and CI.
5. Spec/tasks text drift: tasks 2.2 still quotes the old tagline `…tell you exactly what to buy` (superseded by ICW8 amendment); 10 trust entries are published with `ownerReview: pending` (visible only to `check:site`, never in HTML).

## SUGGESTION

1. Add the scenario id comment to the smoke tests covering SS4, SR7, SR13 and to the mutation contract tests (QGW1-QGW4) for grep-level traceability.
2. Track the open follow-ups listed in apply-progress (R1-1 `@lhci/cli` dev advisories, RES-2 measure `site-browser` wall time with Lighthouse, TRUST_IDS type tie, CRLF frontmatter parsing).

## Next recommended

`sdd-archive` (owner waiver for F.2 recorded above).
