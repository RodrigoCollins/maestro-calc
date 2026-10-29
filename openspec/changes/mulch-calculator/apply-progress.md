# Apply progress: mulch-calculator

Applied in the main thread on 2026-10-29 (owner away). Strict TDD: each test was written first and run red, and every figure was checked by hand first. [MU2]: 20 ft³ net, 21 ft³ = 7/9 yd³ (0.78), 0.59 m³, 11 bags of 2 cu ft. [MU3]: 7 bags of 3 cu ft, $35.00 in bags, $28.00 in bulk.

- `mulch` is a plain calculator (no factory): a bag holds what its label says, so no material data is injected.
- The shopping line names `mulch` / `bag-2` or `bag-3`. There is no material record, since the page and its shopping slot come later.
- Spanish keeps the trade word "mulch", as US crews say it (PLAN §4.3); the owner reviews it.

Gates: `npm run verify` exit 0 (4,144 tests). Mutation shard `calculators`: 376 mutants, 100 % (mulch 83/83).

**Watch:** the shard is now close to the ~400-mutant split rule of `AGENTS.md`. The next calculator splits it into `calculators-<group>` shards (with the CI matrix entry and the exactly-once contract).

## PR 2 — page module without a route (`feat/mulch-page-module`)

Every figure was checked by hand first, and every test passed on the first green run. The 100 % branch gate caught an unreachable fallback for a missing bag line, which is now `required(...)` as rectangle-area does. Gates: typecheck, lint, `npm run test:coverage` (4,157 tests, thresholds met).
