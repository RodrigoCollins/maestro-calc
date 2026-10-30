# Delta for calc-drywall

## ADDED Requirements

### Requirement: Inputs

Room length and width (0 to 1,000 ft, default 12 ft), wall height (0 to 50 ft, default 8 ft), doors (0–50, default 1), windows (0–100, default 2), surfaces (`walls-ceiling` default, `walls`), sheet (`4x8` default, `4x12`), extra (0–50 %, default 10) and an optional price per sheet; URL keys `l`, `w`, `h`, `dr`, `wn`, `sf`, `sz`, `ws`, `sp`.

- [DW1] The defaults are a 12 ft by 12 ft room, 8 ft walls, 1 door, 2 windows, walls and ceiling, 4 × 8 sheets, 10 % extra, no price.

### Requirement: Area and materials

- [DW2] The default room: 478 ft²; 17 sheets; 2151/500 gal of compound (1 pail); 8843/50 ft of tape (1 roll).
- [DW3] 4 × 12 sheets: 11; walls only: 334 ft², 12 sheets; no extra: 15 sheets, the same compound.
- [DW4] 50 × 40 ft, 10 ft walls, 2 doors, 8 windows: 3,640 ft², 126 sheets, 8 pails, 3 rolls.
- [DW5] Openings larger than the walls cover nothing; a 1 × 1 × 1 ft room covers its 1 ft² ceiling, or nothing with walls only.
- [DW6] At $12 a sheet the default costs $204.00.

### Requirement: Injected finishing rates

- [DW7] `createDrywall` accepts exactly `{ per, compound, tape }` (an area, a volume and a length above zero), keeps a frozen snapshot, and otherwise throws `INVALID_DEFINITION` with reason `DRYWALL_FINISHING`.

### Requirement: URL and catalog

- [DW8] Every valid state round-trips through the link, and the nine released tuples are appended in input order.
