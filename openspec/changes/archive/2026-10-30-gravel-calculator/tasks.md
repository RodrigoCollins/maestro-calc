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

## S3 — Page module without a route (PR 2, `feat/gravel-page-module`)

- [x] 3.1 [RED] `apps/web/src/calculator/gravel/plan.test.ts`: the rectangle plan of the square footage page (hand-verified 2:1 layout), the depth note centred on the frame, the name `ANSWER`, metric keeps every coordinate, the placement does not change the plan.
- [x] 3.2 [RED] `apps/web/src/calculator/gravel/controller.test.ts`: the answer per placement and locale (hand-verified: 4.74 and 3.34 tons, a 30 × 3 ft path at 1.13 tons, metric 4.30 metric tonnes), the figures, the cost ($213.50 at $45), the drawing named by the answer.
- [x] 3.3 [GREEN] `page.ts` (primary `tons`/`tonnes`, cost slot, answer by placement, drawing), `plan.ts`, `present.ts`; six page keys per locale; `GravelPageKeys` in `i18n-contract.test-d.ts`.
- [ ] 3.4 Go-live (after the owner's review): content EN/ES from `content-draft.md`, `WORKED_EXAMPLES`, `CONTENT_ROWS`, `METHODOLOGY_ROWS` and the methodology section, `PAGES` row, entry and island with `draw`, `ROUTES`, `SCRIPTS`, home cards, `page.example`, the E2E record, the end-state counts.
