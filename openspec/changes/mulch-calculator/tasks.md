# Tasks: mulch-calculator

PR 1 (`feat/mulch-core`): the calculator without a page. Strict TDD.

- [x] 1.1 `packages/core/src/calculators/mulch/`: `mulch.ts`, `index.ts`, `mulch.test.ts` [MU1]–[MU3], `mulch.shape.test.ts`, `mulch.property.test.ts`, `mulch.url.test.ts` [MU4]; arbitraries `mulch-arbitraries.ts`.
- [x] 1.2 `RELEASED` tuples appended; `REGISTRY` row.
- [x] 1.3 Catalogs EN/ES; web registry (`calculators.ts` imports the subpath), `EnglishKeys`, `PAGELESS`, end-state pin.
- [x] 1.4 Gates: `npm run verify`; mutation shard `calculators` (check the 400-mutant split rule).
