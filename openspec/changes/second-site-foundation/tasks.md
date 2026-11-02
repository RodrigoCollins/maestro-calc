# Tasks: second-site-foundation

Mode: strict TDD · store openspec · delivery auto-chain · budget 400 lines.

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | ~350 (slice 1 ~200 including docs, slice 2 ~150) |
| 400-line budget risk | Low |
| Chained PRs recommended | Yes (two slices) |
| Delivery strategy | auto-chain |
| Chain strategy | stacked-to-main |

Decision needed before apply: No

## Slice 1 — `refactor/second-site-01-dist-guard`

- [x] 1.1 RED: contract test spawns `scripts/dist-fingerprint.mjs` on a temporary tree: sorted lines, stable output, content change changes the hash, missing dir exits 2.
- [x] 1.2 GREEN: write the script.
- [x] 1.3 RED: `ci.contract.test.ts` pins the `dist-identical` job (condition, commands, timeout, pinned actions).
- [x] 1.4 GREEN: add the job to `ci.yml`.
- [x] 1.5 Verify locally: fingerprint two builds; `npm run verify`.

## Slice 2 — `feat/second-site-02-pay-scaffold`

- [ ] 2.1 RED: workspace contracts list `@maestro-calc/pay`.
- [ ] 2.2 GREEN: scaffold `apps/pay` (placeholder EN/ES), vitest project, tsconfig, lint.
- [ ] 2.3 Verify: `npm run verify`; `apps/web/dist` fingerprint unchanged.
