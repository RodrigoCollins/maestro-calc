# Apply progress: drywall-calculator

Applied in the main thread on 2026-10-30. Strict TDD for the engine and the page module (each test file written first and run red; every figure worked by hand first).

## Hand verification

- default: 384 − 50 + 144 = 478 ft² (44.41 m²); × 1.1 = 525.8 ÷ 32 = 16.4 → 17 sheets (÷ 48 → 11); 4.302 gal → 1 pail; 176.86 ft → 1 roll; $12 × 17 = $204.00;
- walls only 334 ft², 367.4 ÷ 32 → 12 sheets (÷ 48 → 8); no extra 15 sheets;
- 20 × 15 ft, 9 ft walls: 580 + 300 = 880 ft², 31 sheets, 7.92 gal → 2 pails, 325.6 ft → 1 roll;
- 50 × 40 ft, 10 ft walls, 2 doors, 8 windows: 1,640 + 2,000 = 3,640 ft², 126 sheets (84 of 4 × 12), 32.76 gal → 8 pails, 1,346.8 ft → 3 rolls;
- typed 20 ft: 702 ft², 25 sheets, $300.00; 36 ft: 1,150 ft², 40 sheets; metric 4 × 3 m, 2.5 m walls: 455.90 ft² = 42.35 m², 16 sheets.

## Found by the browser specs

The drawing spec (`?v=1&l=1200&w=12`, 1,666 ft²) showed the large figure `1,666.00 pies cuadrados` wrapping at 768 px with the script, so the panel below moved against the script-free page. The large figure now uses the symbols `ft²` / `m²` in both languages; the reserve was measured again on the shorter answers: 4 → 3 at 23.5rem → 2 at 32rem → 1 at 61.5rem (edges 511/512 joined `WIDTHS`).

## Gates

`npm run verify`; drywall browser specs 291 passed locally.
