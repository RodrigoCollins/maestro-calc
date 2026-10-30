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

## PR 2 — go-live (`feat/topsoil-live`)

Applied in the main thread on 2026-10-29, with the content approved in advance by the owner (proposal, Owner approval). It follows the gravel (#132) and mulch (#133) go-lives file by file.

- Pages `/topsoil-calculator` and `/es/calculadora-de-tierra-para-jardin`: 8 FAQ items each, within 800–1,500 words; the only source is NIST SP 811, and the 10 % extra is stated as a rule of thumb. The Spanish SEO title was cut to 58 characters (`check:site` caps titles at 60).
- Methodology section `#topsoil` / `#tierra-para-jardin` with five cases.
- With topsoil routed, `PAGELESS` is empty: every registry calculator has a page.
- Answer reserve measured on the built page with both fonts, 320–1100 px: 4 → 3 at 21.5rem → 2 at 30rem → 1 at 58rem; the new edges 927/928 joined `WIDTHS`.

**Hand verification** (every figure checked by hand first, then against the page's own controller):
- default 10 × 10 ft × 4 in: 33.33 ft³, 36.67 ft³ with 10 %, 1.36 yd³, 1.04 m³; 49 bags of 0.75 cu ft (48.9 up), 37 of 1 cu ft, 25 of 1.5 cu ft;
- no extra 1.23 yd³, 0.94 m³, 45 bags; 20 × 10 ft × 6 in 4.07 yd³, 3.11 m³, 147 bags; 50 × 40 ft × 1 in 6.79 yd³, 5.19 m³, 245 bags;
- costs: 49 × $3 = $147.00, 1.36 yd³ × $45 = $61.11; 20 ft: 98 × $3 = $294.00, $122.22 bulk;
- coverage in the FAQ: 1 yd³ = 324/162/81/54 ft² at 1/2/4/6 in; 36, 27 and 18 bags per cubic yard.

**Gates:** `npm run verify` exit 0; the topsoil browser specs pass locally (279 passed).
