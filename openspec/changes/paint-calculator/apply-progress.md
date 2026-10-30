# Apply progress: paint-calculator

Applied in the main thread on 2026-10-30, in the owner's autonomous run (content approved in advance; see the proposal).

## Commits

1. `feat(core)`: the gallon (231 in³) and the liter (1,000 cm³) join the volume units (tests first, red).
2. `feat(core)`: `createPaint` with the injected coverage, data module, fixture, registry, catalogs, `PAGELESS` (unit tests first, red; the shape, URL and property tests pin the definition after it).
3. `feat(web)`: the page module (plan and controller tests first, red; green on the first run).
4. `fix(web)`: the answer read "1 coats: 1 gallon cans" for one coat. It now reads "… needs 0.95 gallons of paint. Coats: 1. Gallon cans to buy: 1.", which holds for any count in both languages (test first, red).
5. `feat(web)`: the go-live.

## Hand verification

Every figure was worked by hand first, then checked against the page's own controller:
- default 12 × 12 ft, 8 ft walls: 384 ft² of walls, − 20 − 2 × 15 = 334 ft², × 2 ÷ 350 = 334/175 = 1.91 gal = 7.22 L, 2 cans; $40 × 2 = $80.00;
- 3 coats 2.86 gal, 10.84 L, 3 cans; 1 coat 0.95 gal, 3.61 L, 1 can; no openings 768/350 = 2.19 gal, 8.31 L, 3 cans;
- 20 × 15 ft, 9 ft walls: 630 − 50 = 580 ft², 3.31 gal, 12.55 L, 4 cans; 50 × 40 ft, 10 ft walls, 2 doors, 8 windows: 1,800 − 160 = 1,640 ft², 9.37 gal, 35.47 L, 10 cans;
- typed 20 ft: 512 − 50 = 462 ft², 2.64 gal, 3 cans, $120.00; drawing 36 ft: 718 ft², 4.10 gal, 5 cans;
- metric 4 × 3 m, 2.5 m walls: 35 m² = 376.74 ft², 326.74 to paint, 1.87 gal, 7.07 L, 2 cans.

## Reserve

Measured on the built page with both fonts, 320–1100 px: 4 → 3 at 23.5rem → 2 at 32.5rem → 1 at 61.5rem; edges 519/520 and 983/984 joined `WIDTHS`.

## Watch

- The shared units catalog grew by two units, and every calculator bundle with it: concrete's entry graph went from 47,761 B to 48,032 B of its 49,152 B budget (1,120 B left).
- The `calculators` mutation shard grows by the paint mutants; read its cold CI time on the PR against the 10-minute split trigger.

## Gates

`npm run verify` and the paint browser specs (285 passed locally).
