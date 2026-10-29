# Apply progress: gravel-calculator

Applied in the main thread on 2026-10-28 night while the owner was away ("seguí en automático"). Strict TDD: each test was written first and run red.

## PR 1 — the calculator without a page (`feat/gravel-core`)

| Commit | Content | Lines |
|---|---|---|
| `0436f6b` feat(core) | `GRAVEL_DENSITIES` (data, numbers only); `createGravel` with density validation; `gravel.test.ts` [GR1]–[GR5]; fixture `gravel-yields.ts` (`./testing/gravel-yields`, manifest list); `RELEASED` tuples and `REGISTRY` row; catalogs EN/ES; web composition root `lib/gravel.ts` with drift guard; registry; `EnglishKeys`; `PAGELESS = ['gravel']`; end-state pin | 518 |
| `b42646d` test(core) | result shape, URL encode/decode and round trip [GR6], two property tests; arbitraries | 290 (incl. openspec) |

**Size deviation:** the first commit is 518 lines, over 400. It is the smallest green unit: the web registry-equals-directories test needs the registry, catalogs and pageless entry as soon as the core directory exists, and the 100 % coverage gate needs the factory validation tests with the factory.

**Hand verification:** every figure of [GR2]–[GR4] is an exact fraction checked by hand before the code existed: 200/3 ft³ placed, 427/90 short tons compacted, 301/90 loose, 4270/1161 yd³ to order, $213.50 at $45 a ton. Every test passed on the first green run.

**Decisions:**
- No material record: gravel has no shopping line, and the record exists for purchase units. The source is cited in the page and the methodology instead (design D1).
- The fixture is named `gravel-yields.ts`, so the existing `*-yields.ts` pattern of the mutation shard and CI inputs covers it with no config edit.

**Gates:** `npm run verify` exit 0 (4,112 tests, coverage thresholds met, build and `check:site`). Mutation shard `calculators`: 293 mutants, score 100 % (gravel 110 killed, 0 survived).

**Owner review needed before any page:**
- The densities: compacted 1.83, loose 1.29 t/yd³, from WisDOT WHRP G22-05, Table E2.
- The default placement (compacted).
- The 5 % default extra.
- The Spanish labels.

## PR 2 — page module without a route (`feat/gravel-page-module`)

Every figure in the tests was checked by hand before the code existed, and every test passed on the first green run. The page reuses the square footage rectangle plan, adds the depth note centred on the frame, and names the drawing by the answer sentence (`ANSWER`), as concrete does. The answer has one template per placement, so the Spanish agrees in gender ("compactada", "suelta"). The page copy to review, six keys per locale:

- the primary sentences `{value} tons` / `{value} toneladas`;
- the price hint;
- the two answers;
- the depth note.

Gates: typecheck, lint, `npm run test:coverage` (4,128 tests, thresholds met). No route, so nothing visible changes.
