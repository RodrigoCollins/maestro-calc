# Apply progress: topsoil-calculator

Applied in the main thread on 2026-10-29 at the owner's "seguí". Strict TDD: each test was written first and run red, and every figure was checked by hand first.

| Commit | Content | Lines |
|---|---|---|
| `0129b64` feat(core) | `topsoil` (from `mulch`'s shape: 0.75/1/1.5 cu ft bags, 10 × 10 ft × 4 in, 10 % extra); unit, shape, URL and property tests; `RELEASED`, `REGISTRY`; catalogs; registry; `PAGELESS`; end state | 479 |
| (page) feat(web) | page module: plan (the square footage default layout), answer, bag line, two costs; page keys; `TopsoilPageKeys` | 288 |

The first commit is over 400 lines, as gravel's was: it is the smallest green unit.

**Hand verification:**
- [TS2]: 110/3 ft³ = 110/81 yd³ (1.36), 1.04 m³; 49, 37 and 25 bags.
- [TS3]: $148.00 and $61.11.
- [TS5]: "A 10 ft by 10 ft area, 4 in deep, needs 1.36 cubic yards of topsoil: 49 bags of 0.75 cu ft."

**Gates:** `npm run verify` exit 0 (4,188 tests). Mutation shard `calculators`: 459 mutants, 100 % (topsoil 83/83), 1 min 48 s locally. The CI cold time is to be read on the PR. The shard stays whole while that time is well under the 10 minute D10 trigger.

**Owner review:**
- The bag sizes.
- The 10 % extra for settling.
- The Spanish names: "Calculadora de Tierra para Jardín", with "tierra" in the copy.
