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

## Progress

- Slice 1 (header): #117, with the follow-up #118 (CLS at 320 px on Linux).
- Slice 2 (answer): body text at weight 400. Answer reserve measured again 320–1280 px, both locales, every layout query: concrete 4 → 3 lines at 23.5rem → 2 at 35.5rem → 1 at 64rem (was 5 large lines); square footage 2 → 1 at 29rem.
