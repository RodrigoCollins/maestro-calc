# Tasks: roofing-calculator

- [x] 1.1 [RED→GREEN] `sq` unit (100 ft²) in the catalog, 32 units.
- [x] 1.2 [RED→GREEN] `createRoofing` [RF1]–[RF7]; fixture, data module, drift guard, registry, catalogs, `PAGELESS`.
- [x] 1.3 Shape, URL [RF8] and property tests; `RELEASED`; `REGISTRY`.
- [x] 2.1 Page module, content, methodology, route, E2E record, reserve, end-state counts.

## Apply notes

- Reserve measured on the built page in Chromium, 320 to 1100 px in 1 px steps, both locales, the eight `layoutQueries`, web font and fallback: 6 lines at 320 px, 5 from 322, 4 from 378, 3 from 481, 2 from 710 → `[6, [20.5, 5], [24, 4], [30.5, 3], [44.5, 2]]` (every edge already in `WIDTHS`). CI (Linux Chromium) then found the Spanish answer on a seventh line at 320 px (load CLS 0.016 at 320 px, both layout tests), so 320 px alone reserves 7 lines and 321 px (20.0625rem) steps down to 6 (321 joins `WIDTHS`).
- The worked example's square feet are grouped by thousands (`1,341.64`): the strict schema gains `groupedDecimalText` for that field.
- The trust-pages words that no unpublished calculator may appear under ([TP25], [TP31]) now name the feet-inch-fraction calculator, the one MVP calculator of PLAN §4.1 not published yet.
- Gates: `npm run verify` (4,795 tests); roofing browser specs 301 passed locally; mutation units 274, calculators 947, data 164, all 100.00. Concrete JS 48,452 / 49,152 B (the `sq` unit is shared).
