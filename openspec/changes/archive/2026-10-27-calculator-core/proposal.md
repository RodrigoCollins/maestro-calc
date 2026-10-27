# Proposal: Calculator Core — Generic Web Layer for Every Calculator Page

Implements PLAN.md §6.1 (separated layers, reuse across 100+ calculators) and §4.1 (catalog readiness for #2 Square footage, #6 Drywall, #7 Paint, #8-10 Gravel/Mulch/Topsoil). Closes follow-up JD-5 of the archived `concrete-calculator` change. Source map: `explore.md` (file:line citations).

## Intent

The web layer is concrete-shaped. A second calculator today means a copy of the controller (529 lines), mount (295), layout, presenter, `concrete-page.ts`, the `Concrete*` model, three components, and `CONCRETE_PAGES`; and `CalculatorView.astro` renders `concreteView` for every id (`explore.md` §1, §2.3). This change extracts a generic, definition-driven core so the next calculator goes live by adding data and one thin page module, with no copy and no visible change to concrete.

## Scope

### In
- Generic controller: texts per input kind, validation, URL decode/encode with replace-only writes, unit toggle that keeps invalid texts, notice, copy link, element ids, aria wiring, event dispatch.
- Typed per-calculator page module with optional slots, each in its own importable module: choice groups that drive field visibility, steppers, figures, answer-sentence values and template keys, a list of shopping lines, cost rows, primary output per unit system.
- Concrete as module #1; `rectangle-area` as headless consumer #2 (unit and integration tests, plus an unrouted DOM page).
- Generic mount, model, components, page-view builder, `CalculatorView` per-id table.
- Generic DOM hooks; e2e and contract tests made generic over a typed per-id record.
- AGENTS.md "Adding a calculator" rewritten.

### Out (non-goals)
- No new live page (Square footage goes live in its own change with content and owner review).
- No change to `packages/core` or `packages/data`, no mutation-shard, `RELEASED` or URL-key change.
- No copy, layout, id (`calc-<key>`), aria or reserved-height change on the concrete pages.
- Repeatable input groups (Paint openings), new descriptor kinds, e2e sharding.

## Decisions

| # | Decision | Rejected | Why |
|---|---|---|---|
| D1 | Approach C: generic core for the definition-driven parts, calculator specifics as typed optional slots; concrete is module #1, zero visible change | A fully declarative core; B copy per calculator | One live example: build only what concrete needs plus what rectangle-area proves absent. B doubles ~1,300 lines and repeats JD-5 |
| D2 | No second live page; rectangle-area is the headless second consumer | Ship Square footage now | A live page brings a slug, 2×5-section content, methodology, owner review and counts, and with no select, shopping or cost it stresses nothing hard |
| D3 | No core/data change: primary-per-unit-system, templates and layout stay in the web module | A unit-system tag in core `DisplayHint` | A core change hits the `calculators` mutation shard and the release contract. Any unavoidable one becomes its own D-item with that cost named |
| D4 | Generic public hooks: `data-choice="<selectKey>"` + `data-value`, `data-step="<key>"` + direction, `data-copy`; `data-output`, `data-shopping`, `data-primary` kept | Keep `data-shape-button`, `data-bag`, `data-waste-step` as configured names | Concrete names do not fit gravel or drywall. 57 references in 11 files move once. Visible markup is unchanged, so the 283 e2e, axe states, CLS ≤ 0.01 and Lighthouse stay the regression net |
| D5 | Steppers clamp from the descriptor's `min`/`max` | `WASTE_MIN/MAX` constants in the controller | Duplicated engine bounds (0..50) drift |
| D6 | Shopping label stays a split template from the calculator's page catalog; shopping is a list of lines | Derive from `material.*.units.*`; a single line | Keeps the in-place rewrite; calculators 6-10 need several lines |
| D7 | Budgets and gates unchanged: graph ≤ 49,152 B per entry, page ≤ 196,608 B, HTML ≤ 40,960 B, 100 % on `apps/web/src/calculator/**`, zero JS on static pages, CSP `script-src 'self'`, Lighthouse 100 / CLS 0 | Raise the JS budget for the indirection | Concrete is at 36,450 B. Unused slots stay out of a page's graph because each lives in its own module |
| D8 | Remaining hand-kept lists each guarded by a test; per-id tables (`SCRIPTS`, page module, e2e record) become `Record<CalculatorPageId, …>`; the AGENTS.md recipe is rewritten and loses "generalise first" | Derive the lists from directories | Types cannot read directories. A missing row becomes a type error |
| D9 | Three groups, one PR each, `main` green and the site unchanged after each (forecast below); design may re-cut with reasons | One PR | Owner grouping rule; ~3,200 lines |
| D10 | Hooks are spec'd in a new `calculator-page` requirement. Today the spec names none of the concrete hooks (checked by grep; it names only `data-output`, `data-shopping`, `data-primary`) | Leave them unspecified | e2e and future calculators depend on them. Without a clause, a rename is an unreviewed contract break |
| D11 | Split: language-free page spec and generic core in `apps/web/src/calculator/` (client-importable, 100 % covered); server-only page-view builder in `lib/` | One module joining catalogs and logic | Same split as today's `concrete-present` / `concrete-page`. Keeps the client bundle free of message text (CP42) |
| D12 | The reserved block size of a choice-driven area comes from the tallest visibility set of its choice group, not a hand constant | Keep `RESERVED_ROWS` | Derived, so a new shape cannot break CLS without a failing test |
| D13 | rectangle-area DOM proof is an unrouted test page through the real view and mount, using the `contract/__testing__/budget-page.astro` mechanism, in G3; dropped to unit level only if the design measures it above ~250 lines | Unit level only | It is the only check that every optional slot can be absent from the markup and the graph |

## Capabilities

### New
- `calculator-web-core`: the generic controller, mount and page-view contract; the page-module interface and its optional slots; slot tree-shaking (an unused slot stays out of the entry graph); the per-id `Record` tables; the headless second-consumer proof.

### Modified
- `calculator-page`: the intro generalised from "first instance"; a new requirement for the public DOM hooks (D4, D10); the stepper bound from the descriptor (CP22 wording); the Client script contract and CP48 walk every calculator entry, not only `entries/concrete.ts`.
- `site-quality`: Calculator quality coverage runs its suites over a typed per-id e2e record derived from `CALCULATOR_PAGES`; concrete-specific states stay as concrete's record.
- `site-shell`: None (it names the concrete pages only as a scenario example).

## Approach

Move code before rewriting it. The current `concrete-controller.test.ts` and its friends are moved and re-pointed, not rewritten. The generic loop over `calculator.inputs` replaces the hand-expanded `TextKey` blocks. Concrete's slots implement shape visibility, the waste stepper, the bag choice, figures, answers and costs. The 283 e2e run unchanged in their assertions after each group. Selectors change only in the slice that renames the hooks.

## Affected Areas

| Area | Impact |
|---|---|
| `apps/web/src/calculator/**` | Generic core + `concrete` and `rectangle-area` modules (renames, new) |
| `apps/web/src/client/{concrete-mount.ts,entries/}`, `islands/` | Generic mount; thin entries |
| `apps/web/src/components/calculator/*`, `views/CalculatorView.astro`, `lib/concrete-page.ts` | Generic model, components, page-view builder, `Record` table |
| `apps/web/src/contract/*`, `__testing__/client-graph.ts`, `routing/templates.contract.test.ts` | Per-entry, derived pins |
| `tooling/site-browser/e2e/*` | Hook selectors, typed per-id record, generic suites |
| `AGENTS.md` | Recipe rewritten |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Interface shaped by one live calculator fails calculators 6-10 | Med | Lists from day one (shopping, choices); rectangle-area covers the absent branches; repeatable groups named out of scope |
| Byte growth from indirection or unshakable slots | Med | Per-entry graph test; G2 measures concrete on the real build; rectangle-area graph must exclude unused slots |
| Hook rename fans out (57 refs, 11 files) and breaks e2e mid-chain | Med | Rename and selector edits ship in one slice; e2e assertions unchanged |
| 100 % coverage work on the generic core | Med | Tests move with the code; the two fixtures cover both slot branches |
| Scope creep into core | Low | D3 gate: its own D-item with the mutation cost |

## Rollback Plan

Each group is a revert of one merge commit. No URL, data or content changes, so a revert restores the previous web layer with no contract fallout. G3 reverts alone (tests and docs only).

## Slice Forecast (authored lines, moves counted as delete + add)

| Group (PR) | Slice | Forecast |
|---|---|---|
| G1 core (`calculator/**`, 100 %) | S1 generic controller core: input-kind texts, validation, URL, unit toggle, notice, copy | ~380 |
| | S2 page-module interface + concrete slots (choices, stepper from bounds, shopping list, costs, primary per system) | ~380 |
| | S3 layout/present generalised (ids, derived reservation, `DisplayHint` places) + rectangle-area headless module | ~300 |
| G2 page parts (e2e green, budgets on the real build) | S4 generic mount and event wiring | ~380 |
| | S5 generic model and components, hooks renamed, e2e selectors in the same slice | ~400 |
| | S6 page-view builder, `CalculatorView` `Record` table, thin concrete page module | ~350 |
| G3 tests and docs | S7 typed e2e record + generic calculator/a11y/layout/csp suites | ~400 |
| | S8 per-entry contracts (entry-graph, client-entry, client-graph, hygiene, templates) | ~250 |
| | S9 rectangle-area unrouted DOM proof | ~200 |
| | S10 AGENTS.md recipe | ~120 |

Group totals: G1 ~1,060, G2 ~1,130, G3 ~970; total ~3,160.

- Decision needed before apply: No.
- Chained PRs recommended: Yes (3 group PRs; each group is above 400, as the owner accepts).
- 400-line budget risk: Medium (S5 and S7 are at the cap; split if they go over).

## Owner Actions

None beyond reading. No content, URL, data or price decision is involved.

## Success Criteria

- [ ] A second calculator needs only: core definition, catalogs, content, page module, entry + island, e2e record, route row, counts. No controller, mount, view or e2e-suite copy.
- [ ] Concrete pages are byte-for-byte unchanged in visible text, ids and aria. The 283 e2e, axe states, CLS ≤ 0.01 and Lighthouse 100 ×6 stay green with their assertions unchanged.
- [ ] rectangle-area runs through the generic controller and mount, and its graph excludes the unused slots.
- [ ] `npm run verify`, `check:site`, e2e and Lighthouse are green after each group; JS graph ≤ 49,152 B; 100 % coverage on `apps/web/src/calculator/**`.

## Proposal question round

Not asked: the owner authorized autonomous runs. Assumptions open to owner review: D2 (Square footage waits), D4 (hook rename), D13 (unrouted DOM proof).
