# Tasks: mulch-calculator

PR 1 (`feat/mulch-core`): the calculator without a page. Strict TDD.

- [x] 1.1 `packages/core/src/calculators/mulch/`: `mulch.ts`, `index.ts`, `mulch.test.ts` [MU1]–[MU3], `mulch.shape.test.ts`, `mulch.property.test.ts`, `mulch.url.test.ts` [MU4]; arbitraries `mulch-arbitraries.ts`.
- [x] 1.2 `RELEASED` tuples appended; `REGISTRY` row.
- [x] 1.3 Catalogs EN/ES; web registry (`calculators.ts` imports the subpath), `EnglishKeys`, `PAGELESS`, end-state pin.
- [x] 1.4 Gates: `npm run verify`; mutation shard `calculators` (check the 400-mutant split rule).

## S2 — Page module without a route (PR 2, `feat/mulch-page-module`)

- [x] 2.1 [RED] `apps/web/src/calculator/mulch/plan.test.ts`: the bed as a rectangle plan (5:1 drawn at the 4:1 clamp, hand-verified), the depth note, the name `ANSWER`, metric and bag size move nothing.
- [x] 2.2 [RED] `apps/web/src/calculator/mulch/controller.test.ts`: the answer EN/ES/metric/3 cu ft (hand-verified), the figures, the bag line, both costs, the drawing named by the answer.
- [x] 2.3 [GREEN] `page.ts` (primary yd³/m³, shopping slot, two costs, answer, drawing), `plan.ts`, `present.ts`; six page keys per locale; `MulchPageKeys`.
- [x] 2.4 Go-live after the owner's review (content, methodology, route, entry, E2E record): approved in advance on 2026-10-29 (proposal, Owner approval).
