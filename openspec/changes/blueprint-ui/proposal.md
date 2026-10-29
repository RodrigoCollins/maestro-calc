# Proposal: blueprint-ui

## Intent

The owner (2026-10-29): "ajustá toda la UI, navbar, el espaciado; hacé un paneo completo y llevemos el diseño a todo". Bring the approved Blueprint direction (`docs/design/direction.md`, `docs/design/mockups/`) to every page, not just the result panel.

## Audit (live site, 2026-10-29, 390 and 1280 px; screenshots in the session scratchpad `audit/`)

| Area | Mockup | Live | Gap |
|---|---|---|---|
| Header | logo mark (orange bars) + "Maestro Calc", EN/ES pill toggle, menu icon on phone | plain wordmark, three underlined text links that wrap to a second row on phone | high |
| Breadcrumb | one baseline, muted | "Inicio" sits lower than "/ Calculadora…" (tap-target box vs inline text) | medium (bug) |
| Answer under H1 | body text, key figures bold | large semibold text, then ~100 px of empty reserve on phone and desktop | high |
| Form | white card, radius 16, two fields per row, unit inside the input, segmented shape control, inline −/+ for extra | one field per row full width, 6rem reserved rows (large gaps), square corners, separate "Menos/Más extra" buttons, unit hint above the field | high |
| Order | form → result → shopping list → WhatsApp → copy/share/print → ad | form → copy link + WhatsApp → result | high |
| Result panel | "You need X yd³", bags large in orange top right, drawing fills the panel | heading "Resultado", big figure, drawing, rows | medium |
| Shopping list | own white card: bags line, ready-mix alternative, price with estimated total | rows inside the dark panel | medium |
| Desktop | (mockups are phone-first) | single column 1,000 px wide: full-width inputs, result far below the fold | high (needs a desktop layout: form and result side by side) |
| Home | hero ok; cards | cards with blue link titles, loose footer spacing | low |
| Corners | radius 12–16 on cards, inputs, buttons; pill toggles | square everywhere (an earlier choice, "corners stay square like every site button") | owner choice |

## Constraint: bytes

The ES concrete page is at 40,797 B against the 40,836 B pin and the 40,960 B HTML budget, so every byte of new CSS or markup must be offset. The redesign removes markup (unit hints move into the input, the separate stepper buttons fold into the input row), but the new CSS (card, grid, segmented control, header) will not fit in 39 B. **Owner decision needed:** raise the HTML budget (and the pin) for this change, or cut page copy to make room.

## Plan (slices, each ≤ 400 lines, browser-verified with screenshots)

1. Header and footer: logo mark, language pill, menu on phone; footer spacing. Fix the breadcrumb baseline.
2. Answer block: body text with bold figures; reserve per breakpoint measured, not five phone lines.
2b. Notice block: the no-JS note and the URL notices reserve up to 6 lines under the answer, the remaining gap on every page with the script running. Move them where their reserve costs nothing visible (inside the form card's footer, or an overlay), keeping CLS 0.
3. Form card: two-column grid from 22rem, unit suffix inside the input, segmented choice control, inline stepper; reserved choice area recomputed.
4. Order and actions: result right after the form; shopping list card; WhatsApp + copy row after it.
5. Desktop layout: from 64rem, form left and sticky result right.
6. Home cards and trust pages: same tokens and spacing.

Every slice keeps CLS 0 (layout-stability e2e), axe 0, the 44 px targets and the 56 px inputs.

## Decision (owner, 2026-10-29): "sí, subí el presupuesto lo que necesites"

HTML budget 40,960 → 49,152 B (48 KiB); the ES concrete pin ([CP66]) follows it to 49,152 B. The page weight budgets are sums of their parts, so they rise by the same 8 KiB: 163,840 → 172,032 B (home and trust) and 196,608 → 204,800 B (calculator pages). CSS, fonts and the calculator JS graph keep their limits. The `site-quality` [SQ7] and `calculator-page` [CP66] figures in `openspec/specs/` are updated at archive.

## Decision (2026-10-29): rounded corners

Rodrigo said "seguimos" to the corners question, so the implementer chose the mockup corners: the approved direction wins over the earlier square choice. Three tokens in `tokens.css`: `--radius-card` 1rem, `--radius-control` 0.75rem, `--radius-segment` 0.5625rem. Going back to square is one edit per token. Spec changes at archive:
- site-shell [SS25]: drop "no token name contains `radius`".
- site-shell [SS26] "Corners from the radius tokens": every non-zero `border-radius` of the global sheets is `var(--radius-card|control|segment)`, those three are the only custom properties named after a radius, declared in `tokens.css` in rem.

## Progress

- Slice 1 (header): #117, with the follow-up #118 (CLS at 320 px on Linux).
- Slice 2 (answer): body text at weight 400. Answer reserve measured again 320–1280 px, both locales, every layout query: concrete 4 → 3 lines at 23.5rem → 2 at 35.5rem → 1 at 64rem (was 5 large lines); square footage 2 → 1 at 29rem.

## Slice 2b — notice block (branch `feat/blueprint-ui-notice`)

- The no-JS note no longer repeats the example (`page-view.ts`; unit tests and `no-js.spec.ts` updated).
- Answer and notice ladders hold the taller of the web font and the fallback font (fonts blocked):
  - Notice 4 → 3 at 21.5rem → 2 at 29.5rem → 1 at 55rem (both pages).
  - Concrete answer 4 → 3 at 24.5rem → 2 at 36.5rem. With the fallback font it never fits on one line.
  - Square footage answer 2 → 1 at 30rem.
- The CLS of 0.0105 from 472 px up was the note's paragraph margin collapsing through `.calc-notice`: the script swaps the note for the (hidden) notice, the 16 px margin went away and the form rose. `.calc-notice` now owns a 1rem bottom margin and its paragraphs have none.
- `layout.spec.ts` "fits every reserved block" measures both fonts: the fit check reads the web font (stable across platforms), the unused check takes the tallest of both.
- `WIDTHS` holds both edges of every step. `verify` 0, e2e 668 passed.

## Slice 3a — form card (branch `feat/blueprint-ui-form`)

- The form is a Sheet white card (1.5px `--color-line` edge, `--radius-card`, 1rem padding).
- Choice groups (units, shape, bag size) are segmented controls: a `.calc-segments` wrapper around the buttons, plan-paper track, ink pressed segment, 15 px labels; four options sit two by two below 22.5rem.
- Inputs: 56 px, `--radius-control`, condensed 600 figures at the H3 size, edge `--color-control-line` `#7A848C` (3.8:1 on white, WCAG 1.4.11; the mockup's `#C3CBC7` is 1.7:1).
- Deviation: the unit stays on the label row, not inside the input. The input value carries its own unit ("12 ft", mixed input like 5′ 3 1/2″ is accepted), so a suffix would repeat it.
- Next (3b): two fields per row from 22rem, inline −/+ stepper, smaller field reserve.

## Slice 3b — two fields per row and inline stepper (branch `feat/blueprint-ui-form-grid`)

- From 22rem the form is a two-column grid. A length field (the fields with a unit hint) and every field a choice drives take one column; groups, the waste field, prices and the copy area span the row. No markup or catalog change.
- A half field stacks a 15 px label in a row of two fixed lines (bottom-aligned, so the two inputs of a row line up), the input, and the unit below it. Fixed rows keep heights independent of the font (the lesson of 3a). `--half-row` 8.5rem; the choice area reserves `round(up, rows / 2)` half rows.
- The waste stepper is "−" and "+" beside the input (accessible names unchanged: "Less extra", "More extra"), in the focus order input, less, more. The stepper moved into `CalculatorField`; the separate stepper row and its 44 px reserve are gone.
- New e2e guards: every half-field label of every option fits two lines with the web font at every width; 351/352 px join `WIDTHS`.
- `verify` 0, e2e 688 + 4 passed.

## Slice 2c — notice in the card footer (branch `feat/blueprint-ui-notice-footer`)

- The notice block (no-JS note, URL notices) moved from under the answer to the end of the form card, after the copy and share actions (`CalculatorForm` takes it as its slot). Its reserve now reads as the card's footer; the first screen loses the empty block under the answer.
- The card is about 35 px narrower than the page, so the notice ladder was swept again 320–1100 px in 1 px steps, both pages, both locales, web and fallback font: 4 → 3 at 23.5rem → 2 at 31.5rem → 1 at 57.5rem (both pages; `rectangle-area/reserve.ts` follows). New `WIDTHS` edges 503/504 and 919/920.
- `verify` 0, e2e 708 passed.

## Slice 4 — order and actions (branch `feat/blueprint-ui-order`)

- Mockup order: form card (inputs only) → result panel → shopping list → actions → notice.
- The shopping lines, the cost rows and the costs note left the ink panel for a sheet-white card (`.calc-list`) right after it; the quantity is ink condensed 700 (orange text on white would be under 3:1 at body size). The panel keeps the figure, the drawing, the rows and the estimate note.
- The copy area (copy button, WhatsApp link, status) and the notice moved out of the form, after the shopping list. The mount gives the copy button its own listener and enables and reveals it outside the form; the slot-free proof follows.
- The notice is at the page width again, so its ladder returns to the slice 2b values (21.5/29.5/55rem); the 2c card-width ladder is superseded.
- Deviations: the price inputs stay in the form (moving them into the list would take inputs out of `<form>`), the list has no heading (no new catalog key), and the WhatsApp link stays after the copy button (CP80/CP81 order).
- `verify` 0, e2e 708 passed.
