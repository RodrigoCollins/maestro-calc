# Proposal: Blueprint panel (live plan drawing and WhatsApp share)

Implements PLAN.md section 4.2: "Dibujo en vivo" (MVP for concrete) and "Link compartible, botón WhatsApp" (MVP), in the approved Blueprint direction (`docs/design/direction.md`: "Signature element: the result panel is a live blueprint with real dimension lines").

## Intent

The live site does not look like the approved design. The result panel shows figures only. The mockup (`docs/design/mockups/Main.dc.html` lines 84-110) draws a plan of the measured shape, with orange dimension ticks and the entered dimensions as labels. It also shows a green "Send on WhatsApp" button (lines 145-148). PLAN.md names WhatsApp as the main channel for Spanish-speaking contractors (56 percent use). Success means both live pages show a drawing that follows the inputs as the person types, and they can share the current state in one tap, with no budget raised and no gate weakened.

## Current state (exploration, main 05de1f7)

- Two routed pages: `concrete` (shapes `slab`, `footing`, `column`, `steps`, `apps/web/src/calculator/concrete/shapes.ts`) and `rectangle-area` (square footage, inputs `length` and `width`).
- Page modules are language-free and DOM-free (`page-module.ts`). They declare optional slots (`choices`, `steppers`, `shopping`, `costs`, `answer`). `client/mount.ts` writes only with `textContent` and attributes, and it looks up slot hooks as lists that may be empty.
- `ResultPanel.astro` has no drawing hook. The copy-link button (`data-copy`, `hidden disabled` in HTML) sits in `[data-reserved="copy"]`. `copyAddress(env, state)` already builds the stateful URL.
- `astro.config.mjs` sets `inlineStylesheets: 'always'`, so every CSS byte in `calculator.css` lands in the concrete HTML as well. Per-page head CSS already exists (`headStyleOf` from the `PAGES` row reserve).
- Measured: the ES concrete full-length proof is 40,678 B against the [CP66] pin of 40,836 B (158 B of headroom; the SQ7 limit is 40,960 B). Square footage full-length is ES 34,159 B (6,801 B headroom). The JS entry graphs are concrete 39,164 B and square footage 33,803 B, against a limit of 49,152 B.
- `WhatsApp` tokens are already in `apps/web/src/styles/tokens.css`. There is no share link today.

## Scope

### In Scope
- A `drawing` page slot. Pure geometry: from a `Moment` it returns the shape outline, the dimension lines and the label values. The DOM writer is injected only by entries of pages that declare the slot.
- A square footage rectangle plan with length and width dimension lines and the area label.
- Concrete plans for all four shapes, shipped together in one PR so no concrete shape ever shows an empty box on the domain: `slab` and `footing` (rectangle plan with a thickness or depth note and a count), `column` (a circle with a diameter line) and `steps` (a side profile with rise and run).
- A reserved, fixed-aspect drawing box in the server HTML, scoped to pages that declare the slot, placed after the large figure and before the result rows (mockup lines 85-95). Without JS it is plain ink, the panel's own ground: the grid is an SVG path the script draws, because a CSS gradient is banned off the homes (`CalculatorBody.budget.test.ts:215`). `role="img"` with an accessible name that updates silently.
- A WhatsApp share link on both pages: `https://wa.me/?text=` + encoded (short localized text + `copyAddress`). The base `https://wa.me/` lives only in the inert `data-share` attribute of the server markup, never in the bundle (the client-entry gate rejects any foreign `https://` URL); the anchor has no `href` before the script. EN and ES catalog keys (`site.calculator.shareWhatsApp`, `site.calculator.shareText`), neutral tú.
- A markup trim of the concrete page (design trim table A–E, about 826 B) so that both additions fit under the 40,836 B pin. The `:root` tokens stay where they are (site-shell [SS24]–[SS26]).

### Out of Scope
- "Copy list" and "Print" buttons from the mockup. Formatting the shopping list into the WhatsApp message (PLAN.md line 356 is deferred).
- Drawings for future calculators. Analytics events. Changes to the URL codec.
- Raising any byte budget or the [CP66] pin.

## Decisions

| # | Decision | Rejected alternatives (why) |
|---|---|---|
| D1 | The script builds the drawing with `createElementNS` into a server-reserved box. | Inline SVG in the server HTML: it does not fit in 158 B on concrete. `innerHTML`: CSP and injection risk. Canvas: no accessible structure and blurry text. |
| D2 | The `drawing` slot holds pure geometry. The SVG writer lives in its own client module that only declaring entries import. | Writer inside `mount.ts`: every page would ship it, breaking the slot pattern and the entry-graph contracts. |
| D3 | The box size comes from per-page head CSS (`PAGES` row, like the reserve) using `aspect-ratio`. | Shared `calculator.css`: it is inlined on every page and eats concrete headroom before concrete draws anything. |
| D3b | The SVG namespace comes from `box.namespaceURI` (the server box is an `<svg>`) and the share base from `data-share`, so no foreign URL is in the bundle. | A literal in code: it fails `client-entry.contract.test.ts:39-41`. If one is ever unavoidable, the `site-check/facts.ts:37-42` precedent applies (exact identifiers anchored with `(?![\w.-])`, stripped before the scan), never a host prefix. |
| D4 | Labels come from the last valid state, formatted like the panel figures. An invalid field keeps the last drawing. The plan is proportional with a clamped aspect ratio, so extreme ratios stay legible and the labels carry the true values. | Raw typed text: it shows invalid strings. True scale only: a 100 x 1 ft slab becomes a line. |
| D5 | Accessible name via `aria-label` on `role="img"`, with no `aria-live`. The answer sentence stays the one live announcement. | A live region on the drawing: it would announce twice on every keystroke. |
| D6 | No JS: the box stays empty plain ink (`aria-hidden` until it is drawn), and the share link stays `hidden`, the same as the copy button. | Showing the box on mount: a load-time layout shift that counts against CLS 0.01. |
| D7 | A state with no plan (`plan` returns `null`) keeps the box at the same size, empty and `aria-hidden`. Concrete never uses it on the domain (all four shapes ship in PR 3); it stays the generic rule for a future calculator. | Hiding the box per shape: a restored `?sh=column` link would shift the layout at load. |
| D8 | The share link is an anchor whose `href` the mount rewrites on each render, with `target="_blank"` and `rel="noopener noreferrer"`. | The Web Share API: inconsistent on desktop and not WhatsApp-specific. A third-party SDK: CSP and weight. |
| D9 | Order: square footage first (6.8 KB of HTML and 15 KB of JS headroom). Then the concrete trim and share, then all four concrete drawings in one PR. | Concrete first: blocked on the trim, so it is slower to reach the domain. Concrete shapes over two PRs: the domain would show an empty box for column and steps in between. |

## Capabilities

### New Capabilities
- `blueprint-drawing`: plan geometry per shape, proportional scaling and clamping, dimension lines and labels, accessible name, reserved box, progressive enhancement.

### Modified Capabilities
- `calculator-web-core`: the new `drawing` slot in the page-module contract, injection of the mount writer, and entry-graph absence for pages without the slot.
- `calculator-page`: the result panel anatomy (drawing box), the public hooks (`data-drawing`, `data-share`, the merged cost row), the form's inherited `autocomplete`, the entry import rule [CP48] (plus `../draw.ts` exactly when the module declares `drawing`) and the share action next to copy link. [CP66] still holds at every PR tip.
- `site-quality`: CLS, axe and contrast scenarios for the drawing and the share link; budget proofs for the new markup.
- `i18n-catalog`: keys for the share text and label and for the drawing names and concrete notes (EN and ES); units are the language-free symbols of `dimensionText`.

## Approach

Geometry functions are pure and TDD'd with hand-verified coordinates. A small SVG writer is covered by the browser tests. The mount gets an optional `draw` hook and looks up `[data-drawing]` and `[data-share]` with `findAll` (lists that may be empty: the slot-free proof flags every throwing `find(` whose selector the slot-free markup lacks). Contrast: white outline and labels on Blueprint ink, orange ticks (#F06A1D on #0E2240 is about 5.1:1, computed), and `#B9C6DA` helper lines (added to `docs/design/direction.md` as "Helper line"). Linux CI is the final word on layout and wrapping.

Task-level rule: S3 (the trim) is measured with `CalculatorBody.budget.test.ts` before S4 is sliced. If the measured trim leaves less than the forecast additions of PR 2 and PR 3 under the 40,836 B pin, the apply stops and reports to the owner; the budget is never raised.

## Delivery forecast (auto-chain, one PR per group, 400 lines per slice by `git diff --shortstat`)

| PR | Slices | Lines (est.) | What the user sees on maestrocalc.com after merge |
|---|---|---|---|
| 1 | S1a slot and geometry; S1b controller plans and injected writer; S2a square footage plan, box, head CSS, catalogs; S2b e2e record | 280–330 + 300–360 + 280–340 + 200–260 | The square footage panel draws the rectangle under the big figure, with orange-ticked length (top) and width (left) lines and the area, updating while typing. Concrete is unchanged. |
| 2 | S3 concrete markup trim A–E (about 826 B, ≥ 700 B required); S4 WhatsApp share on both pages | 200–260 + 280–340 | A green "Send on WhatsApp" / "Enviar por WhatsApp" button after "Copy link" on both pages; the chat opens with the short text and the current calculation link. The trim changes nothing on screen. |
| 3 | S5 slab, footing and column geometry; S6 steps geometry; S7 concrete wiring, catalogs and e2e drawing group | 300–370 + 200–260 + 300–370 | The concrete panel draws every shape live: slab and footing plans with the thickness or depth note and the count, the column circle with its diameter, the stair profile with rise and run. No shape shows an empty box. |

Total of about 2,340–2,890 lines in 9 slices, 3 PRs. Each slice stays at or under 400 lines (`git diff --shortstat`); a slice that measures over moves its test-only half into its own slice inside the same PR. Each PR goes through the 4 lenses, at most 1 correction, then Judgment Day. Linux CI confirms layout before merge.

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| The concrete trim does not free enough bytes for both additions (forecast margin at PR 3 about 88 B after dropping trim F). | High | S3 measures first with the faithful fixture, before S4 is sliced; if the margin is short, stop and report. The share text lives in the messages template only once. Fallbacks: shorter note templates, then a shorter `.calc-share` rule, then ask the owner (never raise the budget). |
| CLS from the reserved box or the share button revealed on mount. | Med | `aspect-ratio` box in the server HTML; the copy area reserve grows to fit the share link; Lighthouse CLS gate. |
| Label overlap on narrow phones or with long metric labels. | Med | Clamped geometry plus a layout e2e query per page at 320 px, on Linux. |
| The square footage JS graph grows past 49,152 B. | Low | The writer is about 2 KB; the entry contract weighs it. |
| `wa.me` behavior changes (desktop vs app). | Low | A plain link only; the copy link stays as the fallback. |

## Rollback Plan

Each PR reverts on its own. Reverting PR 1 removes the slot and the square footage drawing. A page without the slot is today's page. PR 2's trim is behavior-neutral for the reader (only the `data-hint-row` hook merges into the cost row), and the share link is an isolated anchor plus keys. PR 3 only removes the concrete slot declaration, its geometry and its keys. No data or URL contract changes, so old links keep working.

## Dependencies

- None external. The `wa.me` link scheme is public.

## Success Criteria

- [ ] Both pages draw a live plan with real dimension lines; axe 0 violations; Lighthouse a11y, SEO and best practices >= 0.95; CLS <= 0.01.
- [ ] [CP66] <= 40,836 B and SQ7 <= 40,960 B at every PR tip; each entry graph <= 49,152 B; pages without a slot ship no drawing code (entry-graph contract).
- [ ] With no JS, the page works as today; no `innerHTML`; CSP `script-src 'self'` unchanged.
- [ ] The WhatsApp link opens with localized text plus the stateful URL in EN and ES.

## Proposal question round (owner review; autonomous mode, assumptions applied)

1. Message content: the link and a short text only (assumed), or also the formatted result and shopping list (PLAN.md line 356)?
2. With no JS: an empty plain-ink box (assumed; a CSS grid gradient is banned off the homes), or a `noscript` rule that hides it (costs bytes)?
3. Order: is the concrete drawing after WhatsApp acceptable, or should the concrete drawing come before the share link?
4. Column and steps ship in this change, with slab and footing, in one PR (orchestrator decision after the design review, so no concrete shape shows an empty box).
