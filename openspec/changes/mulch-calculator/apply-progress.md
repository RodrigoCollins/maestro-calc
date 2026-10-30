# Apply progress: mulch-calculator

Applied in the main thread on 2026-10-29 (owner away). Strict TDD: each test was written first and run red, and every figure was checked by hand first. [MU2]: 20 ft³ net, 21 ft³ = 7/9 yd³ (0.78), 0.59 m³, 11 bags of 2 cu ft. [MU3]: 7 bags of 3 cu ft, $35.00 in bags, $28.00 in bulk.

- `mulch` is a plain calculator (no factory): a bag holds what its label says, so no material data is injected.
- The shopping line names `mulch` / `bag-2` or `bag-3`. There is no material record, since the page and its shopping slot come later.
- Spanish keeps the trade word "mulch", as US crews say it (PLAN §4.3); the owner reviews it.

Gates: `npm run verify` exit 0 (4,144 tests). Mutation shard `calculators`: 376 mutants, 100 % (mulch 83/83).

**Watch:** the shard is now close to the ~400-mutant split rule of `AGENTS.md`. The next calculator splits it into `calculators-<group>` shards (with the CI matrix entry and the exactly-once contract).

## PR 2 — page module without a route (`feat/mulch-page-module`)

Every figure was checked by hand first, and every test passed on the first green run. The 100 % branch gate caught an unreachable fallback for a missing bag line, which is now `required(...)` as rectangle-area does. Gates: typecheck, lint, `npm run test:coverage` (4,157 tests, thresholds met).

## PR 3 — go-live (`feat/mulch-live`)

Applied in the main thread on 2026-10-29, with the content approved in advance by the owner (proposal, Owner approval). It follows the gravel go-live (#132) file by file.

- Pages `/mulch-calculator` and `/es/calculadora-de-mulch`: 8 FAQ items each, within 800–1,500 words; the only source is NIST SP 811 (a bag holds its label, the rest is exact conversion). Spanish uses "área" for a bed, in the neutral register.
- Methodology section `#mulch` in both languages with five cases.
- Answer reserve measured on the built page with both fonts, 320–1100 px: 4 → 3 at 21rem → 2 at 30rem → 1 at 55.5rem; the new edges (335/336, 887/888) joined `WIDTHS`.

**Hand verification** (every figure checked by hand first, then against the page's own controller):
- default 20 ft × 4 ft × 3 in: 20 ft³, 21.00 ft³ with 5 %, 0.78 yd³, 0.59 m³, 11 bags of 2 cu ft (10.5 up), 7 of 3 cu ft;
- no extra 0.74 yd³, 0.57 m³, 10 bags; 10 × 10 ft × 4 in 1.30 yd³, 0.99 m³, 18 bags; 30 × 3 ft × 2 in 0.58 yd³, 0.45 m³, 8 bags;
- costs: 7 bags × $5 = $35.00, 0.78 yd³ × $36 = $28.00; 11 bags × $5 = $55.00; 30 ft: 16 bags × $5 = $80.00, $42.00 bulk;
- coverage in the FAQ: 1 yd³ = 162/108/81 ft² at 2/3/4 in; a 2 cu ft bag 12/8 ft², a 3 cu ft bag 18/12 ft² at 2/3 in.

**Gates:** `npm run verify` exit 0; the mulch browser specs pass locally (265 before the reserve; the layout spec, 123, after it).
