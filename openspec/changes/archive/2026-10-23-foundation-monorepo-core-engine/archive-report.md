# Archive Report: foundation-monorepo-core-engine

**Date**: 2026-10-23  
**Change**: `foundation-monorepo-core-engine`  
**Artifact Store**: openspec  
**Status**: ARCHIVED

## Executive Summary

The foundation-monorepo-core-engine change is complete and archived. All 12 PR slices (PRs 1–12, represented as stacked branches 01a..12i) have been merged to `main` at commit `81b8761`. All 11 delta specs have been promoted to main specs in `openspec/specs/`. The change closes the SDD cycle.

## Final State

### Implementation
- **All 12 PR slices merged to main**: PRs 1–8 merged earlier (GitHub #2–#40), PRs 9–11 as #42–#64 (fast-forwarded to `main` at `7249ca9`), PR 12 as #66–#80 (main at `81b8761`), plus #65 (Cloudflare Workers assets deploy, merged separately).
- **Verification status (per sdd-verify)**: PASS WITH WARNINGS. 0 CRITICAL, 5 WARNING, 5 SUGGESTION. All warnings (W1, W3, W5) reconciled in commit `81b8761` (exit boxes ticked, FF22/FF23 traceability rows, follow-ups tracked).
- **CI status**: Main branch at `81b8761`: CI run 40029735327 green (verify and all eight mutation shards, slowest 4 min 54 s) and the Cloudflare Workers build green; local verification on the identical tree: `npm run verify` exit 0 with 1647 tests, coverage 100%; cold mutation 100.00 on all eight shards per verify-report.md).
- **Gates (cold run on main at 81b8761)**:
  - Lint: exit 0, 0 errors, 0 warnings
  - Format: exit 0, all files formatted
  - Typecheck: exit 0, all `.test-d.ts` included
  - Tests + coverage: 76 test files, 1647 tests passed; statements/branches/functions/lines all 100%
  - Build: exit 0, Astro build succeeded
  - Dist check: exit 0, no `packages/*/dist`
  - Mutation: all 8 shards 100.00 (1901 killed + 7 timeouts, 0 survivors)

### Spec Promotion
The 11 delta specs from `openspec/changes/foundation-monorepo-core-engine/specs/{domain}/` have been merged into main specs at `openspec/specs/{domain}/spec.md`:

| Domain | Requirements | Scenarios | Status |
|--------|---|---|---|
| exact-rational | 8 | 31 | ✓ Promoted |
| units-quantities | 6 | 25 | ✓ Promoted |
| fraction-format | 6 | 38+ | ✓ Promoted |
| money | 5 | 10 | ✓ Promoted |
| calculator-contract | 5 | 26+ | ✓ Promoted |
| url-state-codec | 4 | 23+ | ✓ Promoted |
| i18n-catalog | 4 | 11+ | ✓ Promoted |
| material-data-contract | 2 | 5 | ✓ Promoted |
| calc-rectangle-area | 5 | 15 | ✓ Promoted |
| monorepo-workspace | 7 | 16+ | ✓ Promoted |
| quality-gates | 7 | 17+ | ✓ Promoted |

All requirement and scenario text preserved verbatim with traceability IDs.

### Tasks Completion
- **All implementation tasks**: Checked `[x]` across all 12 PRs (1.1–1.13, 2.1–2.12+follow-ups, 3.0–3.18, ..., 12.1–12.12+follow-ups).
- **Exit tasks (SX1–SX7)**: Recorded as completed; reviews (4-lens + Judgment Day) and PR bodies documented per apply-progress.md.
- **Deferred follow-ups** (deliberately noted for future changes): 2.14 (checkJs), 2.16 (tag remaining contract tests), 3.19 (Stryker/vitest 5 pin flip), 3.19b (mutation job wall time trigger), 4.11 (qs override), and open questions from requirements (e.g., per-shard identity, `encode` 256-char cap, `decode` non-string guard, `StateLocus` export, entry validation, i18n translator mutation, Windows runs, total query-length cap, 404 page, mutation break to 95, TypeScript checker, locale-aware decimals).

## Evidence References

- **Verify Report**: `sdd/foundation-monorepo-core-engine/verify-report` (observation ID: recorded in state.yaml)
- **Apply Progress**: `sdd/foundation-monorepo-core-engine/apply-progress` (12 PRs, 12 slices, all merge history, review round evidence)
- **Main commit**: `81b8761` (all 12 PRs merged; `git log` shows conventional commits, no AI attribution, strict TDD order evident)

## Archive Location

Changed folder moved to: `openspec/changes/archive/2026-10-23-foundation-monorepo-core-engine/`

Archived contents:
- `proposal.md` ✓
- `design.md` ✓
- `specs/` (11 delta specs) ✓
- `tasks.md` (all `[x]` complete) ✓
- `apply-progress.md` ✓
- `verify-report.md` ✓
- `state.yaml` (archive: done) ✓

## Next Steps

The change is complete. Open follow-ups are tracked in this archive report and carry over to the next change. The main specs in `openspec/specs/` are now the source of truth for future implementations.

The authorization for this archive was confirmed by the final-state facts provided at execution time: all PRs merged to main at `81b8761`, verify PASS WITH WARNINGS (0 CRITICAL), and all manual gates green per local runs on the identical tree.
