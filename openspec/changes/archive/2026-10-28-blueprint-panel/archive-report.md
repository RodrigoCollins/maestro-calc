# Archive report: blueprint-panel

Closed 2026-10-28. PRs #106 (square footage drawing), #109 (markup trim + WhatsApp), #110 (concrete drawings).

## Specs synced to `openspec/specs/`

| Capability | Change |
|---|---|
| `blueprint-drawing` | new: 8 requirements (plan geometry, labels, ratio, name, contrast, reserved box, CSP) |
| `calculator-page` | 4 modified (Result panel, Public DOM hooks, Form controls, Client script contract), 3 added (drawing box, Share on WhatsApp, copy reserve) |
| `calculator-web-core` | 1 modified (Page-module contract), 2 added (drawing slot and writer, share lookup) |
| `i18n-catalog` | 1 added (share and drawing keys) |
| `site-quality` | 2 added (budgets with the drawing and share, browser record) |

## Follow-ups: the live site against the mockups (`docs/design/mockups/`)

Compared on 2026-10-28 at 390 px, ES concrete. Delivered: the live blueprint drawing (signature element) and the WhatsApp link. Still different from the approved mockups:

1. **Form layout.** The mockup puts two fields per row (length and width; thickness and extra with inline −/+) inside a white rounded card. Live, there is one field per row with tall reserved gaps, square corners, and separate "Less/More extra" buttons.
2. **Order.** In the mockup the result follows the fields directly, and the actions come after the shopping list. Live, "Copy link" and WhatsApp sit between the form and the result.
3. **Shopping list card.** The mockup has a separate "Shopping list" card: bags, the ready-mix truck alternative, and a price with an estimated total. Live, all of it is inside the result panel.
4. **Actions.** The mockup has "Send list on WhatsApp" with an icon, plus "Copy list", "Share link" and "Print". Live, there is "Send on WhatsApp" (no icon) and "Copy link".
5. **Result hierarchy.** The mockup shows "You need X yd³" with the bag count large in orange at the top right. Live, there is the large volume figure, then rows.
6. **Ad slot.** The mockup reserves a 300 × 250 slot after the actions. The live site has none yet (AdSense not set up).

Each is a candidate for its own change. Items 1, 2 and 5 change the reserved layout, so they need the layout-stability proofs again.
