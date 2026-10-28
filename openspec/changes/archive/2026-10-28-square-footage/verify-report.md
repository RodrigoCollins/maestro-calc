# Verify report: square-footage

Verdict: PASS WITH WARNINGS
Counts: CRITICAL 0, WARNING 3, SUGGESTION 2
Mode: strict TDD, openspec store. Base: main eac3569 (contains #102, #103, #104).
Specs: 7 delta specs, 11 requirements, 78 scenarios.

## Runtime evidence

| Command | Result |
|---|---|
| `npm run verify` (prettier, sync, lint, typecheck, test:coverage, build, check:site, check:dist) | exit 0; 212 files, 3,907 tests passed; check:site 18 pages; budgets within limits (HTML 33,753 B of 40,960; calculator JS 39,164 B of 49,152; calculator page weight 162,927 B of 196,608; fonts 89,720 B of 92,160); pending ownerReview entries 0 |
| Browser tests (not rerun, by instruction) | CI run 40720016205 on 834d063: verify and site-browser green, 7m43s |
| `git diff --stat c77f635~1 main -- packages/core packages/data` | empty (SX4, RAP8; `RELEASED`/`REGISTRY` untouched) |
| `git diff --stat c77f635~1 main -- .github/workflows/ci.yml 'packages/*/stryker.config.mjs'` | empty |
| Attribution scan over `c77f635~1..main` (co-authored, anthropic, generated with) | no matches (GX2) |

## Tasks

All task checkboxes were ticked or accounted for. Slice tasks (sections 1 to 7) were already ticked. The unticked remainder were the exit tasks (SX1-SX5, GX1-GX6, P1.3-P4.4, F.1-F.3), ticked now with this evidence: PRs #102, #103, #104 merged with CI green (site-browser 3m16s, 3m51s, 7m43s, all under 15 min); Judgment Day recorded for PR 1, PR 2+3 and PR 4 in `apply-progress.md`; dist diffs empty for PR 1 to PR 3 (apply-progress lines 73, 151, 329, 380); owner record 478c3e0 precedes approved flip 1d3db73; [TP39] holds (`id="square-footage"` enters methodology.md only in ca1e9bc, the go-live); ES concrete full-length 40,678 B against the 40,836 B pin; final-state facts supplied by the orchestrator.

## Spec compliance (scenario to evidence)

Every scenario id is traced in `apply-progress.md` (per-slice lists) and, for 100 of 109 distinct ids, cited by name in test or tooling sources; the full suite passes.

| Spec | Evidence |
|---|---|
| calculator-page (CP5-CP10, CP44, CP58-CP75) | `contract/calculator-content*`, `calculator-rows`, reserve tests, budget proof (`zz-budget` fixtures), `check:site`; CP59-CP62, CP64, CP71-CP74 in the Playwright records (`tooling/site-browser/e2e`), CI green |
| calc-rectangle-area (RAP1-RAP7, catalog, smoke) | `rectangle-area-catalog.test.ts`, `catalog-content.test.ts`, `present.test.ts`, `page-view.test.ts`, rectangle-area `controller.test.ts`, `old-title.contract.test.ts` |
| calc-rectangle-area RAP8 | empty core/data diff (above) |
| calculator-web-core (CWC31, CWC33, CWC40) | controller and entry-graph contract tests; CWC38/CWC39 by the per-id `entry-graph` and `client-entry` contracts (no literal id in source) |
| site-routing-i18n (SR17-SR19, SR23-SR25) | `end-state`, `templates`, `routes`, static-paths tests; built page has one module script |
| site-quality (SQ33-SQ37) | budget proof per id, ES concrete 40,678 B, SQ37 in `rectangle-area-pages.ts` record; SQ35 by the pinned size in the same proof |
| trust-pages (TP7-TP9, TP21-TP41) | methodology and home contract tests; TP36 by the axe spec in CI |
| i18n-catalog (4 scenarios) | catalog contract and `i18n-contract.test-d.ts` |

## Warnings

1. Nine scenario ids (CP71, CP72, CP75, CWC38, CWC39, RAP8, SQ35, TP36, TP39) are not named literally in test sources; they are covered by behavior, git-diff proofs or generic suites. Traceability rests on `apply-progress.md`, not on the tests.
2. Accepted deviations: PR 1 exceeded the 400-line slice budget; PR 2 and PR 3 merged as one PR (#103); PR 3 and PR 4 were built in parallel worktrees.
3. The Linux runner rejected the unused-reserve bound (run 40714831996, 8 misses); the window was widened to 0.5rem and CP60/CP61/CP73 amended (run 40718266723 green). The bound is now looser than the originally specified one.

## Suggestions

1. Cite CP71, CP72, CP75, CWC38, CWC39, SQ35 and TP36 by id in their tests.
2. Follow-ups already named: move concrete `:root` line counts into its own `reserve`; neutral budget vocabulary. At archive, sync the delta specs to `openspec/specs/` (F.3).

## Next

Ready for sdd-archive.
