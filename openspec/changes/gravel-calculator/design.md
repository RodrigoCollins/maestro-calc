# Design: gravel-calculator

Follows the calculator recipe of `AGENTS.md` (steps 1–10, factory variant) exactly as `concrete` does.

| Decision | Choice | Why |
|---|---|---|
| D1 Densities | injected `{ compacted, loose }` as `Quantity<'density'>`, exact (3660 and 2580 lb/yd³), in `packages/data/src/yields/gravel.ts`; no material record | core holds no material constant; a material record exists for purchase units a shopping line uses, and gravel has none (D4), so its source is cited where the site cites sources: the page frontmatter and the methodology section |
| D2 Placement | a `select` with two options, the density chosen by key | the weight changes by ~40 %; one honest question instead of a hidden assumption |
| D3 Outputs | `tons` (mass, `ton`, primary), `tonnes` (mass, `tonne`), `orderYd3`, `orderM3` (volume), `placedYd3` (volume, intermediate), `cost` (money) | the yard sells by the ton; some sell by the yard, and they quote the loose volume |
| D4 No shopping line | the primary figure is the weight | yards sell fractions of a ton; a whole-unit shopping line would misstate the order |
| D5 Waste default 5 % | spillage and uneven ground | compaction is already in the density; 10 % (concrete's) would double count |
| D6 Pageless | `PAGELESS` in `templates.ts` | publication waits for the owner (PLAN §5.2) |
