# Tasks: gravel-calculator

PR 1 (`feat/gravel-core`): the calculator without a page. Strict TDD, each test first and run red. Slices of at most 400 lines.

## S1 — Data and core

- [x] 1.1 `packages/data/src/yields/gravel.ts` + test: `GRAVEL_DENSITIES` `{ compacted: 3660 lb/yd³, loose: 2580 lb/yd³ }`, frozen; subpath `./yields/*` already covers it.
- [x] 1.3 `packages/core/src/calculators/gravel/`: `gravel.ts` (`createGravel`), `index.ts`, and the four tests `gravel.test.ts` [GR1]–[GR5], `gravel.shape.test.ts`, `gravel.property.test.ts`, `gravel.url.test.ts` [GR6]; the fixture `packages/core/src/__testing__/gravel-yields.ts` exported as `./testing/gravel-yields` and listed in `manifest.contract.test.ts`.
- [x] 1.4 `RELEASED` tuples appended; `REGISTRY` row.

## S2 — Catalogs and web registry

- [x] 2.1 `packages/i18n/src/catalogs/{en,es}/gravel.ts` (the derived keys, nothing else).
- [x] 2.2 `apps/web/src/lib/gravel.ts` (composition root), `calculators.ts`, `i18n-contract.test-d.ts`, `PAGELESS`.
- [x] 2.3 Gates: `npm run verify`; mutation shard `calculators` passes.
