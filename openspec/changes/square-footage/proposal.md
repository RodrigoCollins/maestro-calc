# Proposal: Square Footage — Go Live the `rectangle-area` Calculator (EN/ES)

Second live calculator. It runs the AGENTS.md "Adding a calculator" recipe from step 11 to step 14 for `rectangle-area`, which is done through step 7 and sits in `PAGELESS`. Source map: `openspec/changes/archive/2026-10-27-home-directory/explore.md` §3, §5–§7. That map predates calculator-core G3 and home-directory; the stale claims are listed at the end.

## Intent

The site has one calculator. Square footage is the most general jobsite measurement, and its engine, URL contract (`l`, `w` in `RELEASED`) and catalogs already ship. They have no page. Shipping the page proves that the second calculator is mostly catalog, content and table rows. It also removes the places where the content schema and the content contracts are concrete-shaped, so later calculators do not pay for them again.

## Scope

### In
- Page module: `primary: { imperial: 'areaFt2', metric: 'areaM2' }` and a one-template `answerSlot` (`calc.rectangle-area.page.answer`). Unit sentences `page.areaFt2` and `page.areaM2`, plus `page.example`. Titles change to "Square Footage Calculator" / "Calculadora de pies cuadrados".
- Content EN/ES (`content/calculators/{en,es}/rectangle-area.md`): five sections, 800–1,500 words, 8 FAQ items, NIST SP 811 Appendix B, a methodology link, and the worked example 12 ft × 10 ft. Drafted with `ownerReview: pending`.
- Generalisation by calculator id, in the same build:
  - the `workedExample` schema;
  - `calculator-content.contract.test.ts`;
  - the methodology contract;
  - the budget fixture `budget-page.astro`.
- Methodology section EN/ES with the formula, the exact constants and the hand-verified cases.
- Go-live (one merge):
  - the `ROUTES` row with `page.rectangle-area.{title,description}`;
  - the id moved from `PAGELESS` to `CALCULATOR_PAGES`;
  - the `SCRIPTS` and `PAGES` rows, the entry and the island;
  - the home card keys `page.home.cards.rectangle-area.{title,summary}`;
  - the `E2E` row;
  - the pinned counts;
  - the AGENTS.md recipe and its `docs.contract` rows;
  - the `approved` flip.

### Out
- Other shapes (L-shape, circle, multi-room sums), waste %, material lines, costs.
- Trade hubs and related-calculator links (PLAN §7.1).
- Any change to `packages/core` or to `RELEASED`/`REGISTRY`. Raising any budget.

## Decisions

| # | Decision | Rejected | Why |
|---|---|---|---|
| D1 | Route id `rectangle-area`. Slugs `/square-footage-calculator` and `/es/calculadora-de-pies-cuadrados`. Titles "Square Footage Calculator" / "Calculadora de pies cuadrados". URL keys `l`, `w` frozen | Rename the id to `square-footage` | Owner decision. `RELEASED` and `REGISTRY` are the public, append-only contract, and the id is internal. |
| D2 | Answer slot (one template) and `primary` per unit system, with unit sentences | No answer slot (bare figure) | Owner decision. Without `primary`, metric shows `areaFt2` as a bare number with no unit. |
| D3 | The answer and notice reserves of the page are per-page line counts per breakpoint, declared once (`PAGES[id].reserve`) and emitted as one `<style>` in the head of that page only (design K6; amended after the design review: an inline style on the body holds one value for every width, and concrete pages carry 0 extra bytes). Line counts are measured in a sweep on macOS and Linux Chromium, never guessed. | Global line counts; an inline style on the calculator body; JS measurement | The default 5/4/3/2 is sized for concrete's longest sentence. A short area sentence would leave more than one line unused ([CP60], [CP61]). JS shifts layout (CLS 0.01). |
| D4 | The worked example is strict per id, selected by `id`. The rectangle-area example carries its input state as a query (`v=1&l=144`). The contract runs the engine on that state and requires equality, and it requires each figure in Formulas. | A generic `Record<string,string>`; using the 10×10 default as the example | A generic record lets a typo pass the strict schema. The owner fixed 12×10, which is not the default, so the contract cannot reuse concrete's "run the default state". |
| D5 | Content, methodology and budget contracts become tables by id. Entries may exist for an id that is staged but not yet routed, so content can merge as `pending` before the go-live. | Keep concrete-only tests and copy them per calculator | Copying is about 300 lines per calculator. Today `setProblems` rejects any entry outside `CALCULATOR_PAGES` as "unexpected". |
| D6 | The budget fixture becomes `/zz-budget/[id]/[locale]` in the one `base` build and asserts each page's headroom. The seeded one-byte-over test stays on concrete ES, the tightest page. | One build per id | Each build costs about 120 s, and the copy fixture is shared anyway. |
| D7 | The rectangle-area proof (`rectangle-area-proof.contract.test.ts`) moves to a test-only slot-free page module, so [CWC33] and [CWC36] keep covering the mount's no-slot branches. Only the "stays unrouted" block ([CWC32]) retires at go-live. | Retire the whole proof at go-live, as recipe step 14 says | D2 adds a slot, so the proof breaks in the page-module slice, not at go-live. After go-live no routed page is slot-free, so retiring the proof would leave the no-slot branches untested. It also takes about 210 deleted lines out of the atomic slice. |
| D8 | Owner review: entries merge `pending` (PR 2). S4 is gated on the owner's explicit approval of both entries, recorded in `apply-progress.md` with its date and where it was given (the chat or a PR comment, linked). The flip to `approved` lands in S4a, after that record; no agent ever sets `ownerReview: approved` without it (design K12) | Draft the content in the go-live PR; flip by convention | Review then runs in parallel with PR 3. The approved-when-routed rule makes the flip the approval of the page, so it must be the owner's. A partial go-live is never merged. |
| D9 | Budgets unchanged. The concrete ES full-length proof stays ≤ 40,836 B at every PR tip (it is 40,573 B today: 263 B to the pin, 387 B to 40,960 B). The new page must fit 40,960 B with full-length copy. | Raise HTML/CSS | Owner rule. Shared markup changes are not allowed to grow concrete ES. |
| D10 | Delivery: auto-chain, one PR per group of slices. Each slice is at most 400 lines by `git diff --shortstat`. Each PR with production code gets 4R, one correction round and Judgment Day. | One big PR | Owner decision. |

## Hand-verified figures (1 ft² = 1/9 yd² = 0.09290304 m², exact by definition)

| Case | Query | ft² | yd² | m² |
|---|---|---|---|---|
| Worked example 12 ft × 10 ft | `v=1&l=144` | 120.00 | 120/9 = 13.333… → 13.33 | 120 × 0.09290304 = 11.1483648 → 11.15 |
| Default 10 × 10 | `v=1` | 100.00 | 11.111… → 11.11 | 9.290304 → 9.29 |
| 12 ft 6 in × 10 ft | `v=1&l=150` | 125.00 | 13.888… → 13.89 | 11.61288 → 11.61 |
| 20 × 15 | `v=1&l=240&w=180` | 300.00 | 33.333… → 33.33 | 27.870912 → 27.87 |

No value sits on a half-cent tie, so the rounding mode cannot change a displayed figure.

## Capabilities

### New
None.

### Modified
- `calc-rectangle-area`: "Bilingual labels" (new title EN/ES). A new requirement covers the page copy: answer and unit sentences, the example, and the four cases above.
- `i18n-catalog`: the exact-value row of `calc.rectangle-area.title`.
- `calculator-page`: "Page anatomy and content collection". [CP6]–[CP10] apply per entry and id, `workedExample` is per id (D4), and staged entries are allowed (D5). "Layout stability": the per-page reserve is a head `<style>` from `PAGES[id].reserve` (D3, design K6), [CP64] covers every `reserve`, [CP65] is re-proved on the head rule, [CP60] and [CP61] hold on the second page, and [CP66] states today's headroom.
- `calculator-web-core`: the proof moves to a test-only slot-free module, and [CWC32] retires (D7).
- `site-routing-i18n`: [SR17] (`['concrete','rectangle-area']`, `PAGELESS` empty), [SR19] and [SR23] counts.
- `trust-pages`: "Methodology page": a square footage section, the intro sentence no longer says "the calculator we publish today", and [TP22]–[TP26] apply per id. "Home page": None ([TP21] already derives from `CALCULATOR_PAGES`).
- `site-quality`: [SQ7]: the full-length budget proof covers every calculator page, derived from `CALCULATOR_PAGES` (D6). Budgets and gates are unchanged.
- `site-seo`: None. Title, description and JSON-LD derive from the table and the catalogs.

## Approach

The order puts the invisible groundwork first, then content early so the owner review can start, then one atomic go-live.

1. S1 generalises the contracts as tables by id. It is a behaviour-preserving refactor: the concrete assertions stay green and only the concrete row exists.
2. S2 adds the content entries (`pending`) and their rows in those tables.
3. S3 adds the page module slots, the catalog sentences and the retitle, moves the proof (D7), and pre-stages the E2E record module `tooling/site-browser/e2e/rectangle-area-pages.ts` and the per-page reserve mechanism (`PAGES[id].reserve` to a head `<style>`, design K6).
4. S4 waits for the owner's recorded approval (D8). S4a lands only what is legal while the id is staged: the `approved` flip, the measured reserve values and the new e2e widths. S4b is the atomic go-live: the route, the methodology section, the [CWC32] deletion and the pins.

Every byte figure is measured on the real build (`npm run build && npm run check:site`, the budget test) and recorded in apply progress.

## Slicing forecast (`git diff --shortstat`, tests included)

| PR | Slices | Forecast |
|---|---|---|
| PR 1 | S1a + S1b: per-id `workedExample` schema plus its tests, content contract tables, methodology contract tables (rename from `methodology-concrete`), budget fixture by id, `SCRIPTS` in `views/scripts.ts`, and the AGENTS.md recipe steps they move | ~570–670 (S1a ~300–340, S1b ~270–330) |
| PR 2 | S2: EN/ES entries (~70 lines each), the content table rows, the `end-state` pin for calculator entries 2→4 | ~200–250 |
| PR 3 | S3a + S3b: page module, catalog sentences and retitle (with the test pins that name the old title), controller cases, proof moved; E2E record module (~120–150), reserve mechanism, per-page `BEFORE_EDGE` | ~565–665 (S3a ~265–315, S3b ~300–350) |
| PR 4 | S4a (staged-legal: owner record, `approved` flip, reserve values, e2e widths) + S4b (the go-live: routes, keys, templates and tests, `SCRIPTS`/`PAGES`, entry and island, methodology EN/ES plus contract rows, `E2E` row, pins (8 ids, 16 paths, 18 pages, 18 `page.*` keys, 16 `<loc>`), AGENTS.md and `docs.contract`, [CWC32] removal) | ~235–335 (S4a ~25–45, S4b ~210–290) |

Users see the calculator on the domain at the PR 4 merge. Nothing can be visible earlier, because the go-live is atomic and depends on S1–S3. Each slice stays at most 400 lines. Split rules:
- A slice before S4 that measures over 400 moves its tests-only half into its own slice inside the same PR.
- S4b never splits: the route, the methodology section, the [CWC32] deletion and the pins land together. If it measures over 400, more staged-legal work moves to S4a. PR 4 is never merged partial.

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| S4 overruns 400 lines while it must stay atomic | Med | Pre-stage in S3 (E2E module, reserve mechanism, proof move) and in S4a (flip, reserve values, widths). S4b holds only what needs the route. |
| Owner review delays PR 4 | Med | Content lands in PR 2. PR 4 waits for the owner's recorded approval (D8) and is never merged partial. |
| Shared changes (page view, body, CSS) grow concrete ES past 40,836 B | Med | The per-page reserve is a head `<style>` on the rectangle-area page only (design K6): 0 B on concrete. [CP66] runs at every PR tip. |
| Wrong line counts for the answer or notice reserve leave a gap or an overflow, or Linux wraps earlier | Med | Swept on macOS and Linux Chromium before pinning (breakpoints at the later drop), then checked at seven widths and every breakpoint edge in both directions ([CP60], [CP61], [CP73]) through the E2E row, with `BEFORE_EDGE` per page. CLS ≤ 0.01. |
| The retitle breaks pins that name "Rectangle Area" (`catalog-content.test.ts`, `translate.test-d.ts`, `calculators.test.ts`, `page-view.test.ts`, the i18n-catalog spec) | High (expected) | Changed in S3 together with the delta spec. `pagelessTitles` follows the catalog. |
| Spanish trade terms ("pies cuadrados", "yardas cuadradas") or the NIST citation is wrong | Low | `registerProblems` check plus the owner review (D8). |

## Rollback Plan

- PRs 1–3 are invisible (no route), and each reverts as one merge commit.
- Reverting PR 4 restores `PAGELESS = ['rectangle-area']` and removes two URLs from the sitemap. `RELEASED`, the core and concrete are untouched.
- If those URLs are already indexed, they return 404 until the page is re-released.

## Success Criteria

- [ ] `/square-footage-calculator` and `/es/calculadora-de-pies-cuadrados` render the default 100.00 ft² with no JS. With JS, they reproduce the four hand-verified cases from their links. Metric shows m² with its unit.
- [ ] The home shows two cards in `ROUTES` order with no edit to `HomeView.astro`.
- [ ] `check:site` passes. The new page fits 40,960 B with full-length copy. Concrete ES is ≤ 40,836 B. The entry stays under 49,152 B. Measured sizes are recorded.
- [ ] Content, methodology and budget contracts are tables by id. A third calculator adds rows, not test files.
- [ ] Both entries are `approved` at the go-live merge, after the owner's approval recorded in apply progress (date and where). `verify`, `test:e2e` (axe, layout, smoke) and Lighthouse are green.

## Proposal question round

Not asked (autonomous mode). Assumptions for the owner to confirm:
1. The answer sentence states the two dimensions and the area, for example "A 12 ft by 10 ft area is 120.00 square feet." / "Un área de 12 ft por 10 ft mide 120.00 pies cuadrados." Spanish keeps the `ft` and `in` symbols, as the Spanish concrete page does (the dimension text is language-free).
2. The yd² figure stays a secondary row (it is not the headline) in both unit systems.
3. The card summary describes square feet, yards and meters for rooms and slabs, with no promise of material quantities.

## Explore claims found stale

- The content contract no longer pins `['en/concrete.md','es/concrete.md']` literally. It derives the list from `CALCULATOR_PAGES` through `setProblems`, which rejects pageless entries as "unexpected" (hence D5).
- The `page.*` title/description keys go from 16 to 18, not 20.
- G3 has merged. The typed `E2E` record exists, with an optional `answer` group.
- `--answer-lines` and the body override already exist (CP65), but no per-page source is wired yet.
- Adding the answer slot breaks the rectangle-area proof (D7), which the explore did not foresee.
- The worked example is not the default state (D4).
