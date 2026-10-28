# Design Review: blueprint-panel

Fresh-context architecture review of `proposal.md`, `design.md` and the five delta specs on branch `feat/blueprint-panel` (2026-10-28), plus two orchestrator decisions (M-7 and the PR slicing).

**Verdict: APPROVE WITH CHANGES.** The architecture holds (geometry-only `drawing` slot, injected writer, per-page head CSS, share base in the markup, behaviour-neutral trim before the additions). Two blockers must change before tasks: [SQ41] still allows a `wa.me` prefix in the bundle, which the client-entry gate rejects (B-1), and the entry-graph rule [CP48] widens without a spec delta (B-2). The majors are spec statements the code contradicts (gradient ban, mockup order, `3.05 m`, a DOM-less unit suite, the throwing-lookup proof, the hint-row hook, the `:root` token rule, an impossible type error). None reopens D1–D9.

## Findings

| # | Sev | Location | Claim | Proof | Resolution |
|---|---|---|---|---|---|
| B-1 | BLOCKER | site-quality [SQ41]; calculator-page share requirement | `client-entry.contract.test.ts:39-41` flags every `https?://` URL that is not `https://maestrocalc.com`, so "and the `wa.me` template prefix" is not allowed in the bundle. Keep the design: the namespace from `box.namespaceURI`, the share base from the inert `data-share`. If a literal is ever unavoidable, follow `site-check/facts.ts:37-42` (exact identifiers anchored with `(?![\w.-])`, stripped before the scan), never a host prefix. Share wording: "no `href` before the script; the base is the inert `data-share`" | `client-entry.contract.test.ts:39-41`; `site-check/facts.ts:37-42` | Applied. [SQ41] allows only `https://maestrocalc.com` and names the `facts.ts` precedent as the only escape; share requirement and [CP80] say no `href` before the script, the base is the inert `data-share`; [BD24] adds `box.namespaceURI` and the URL scan; proposal D3b; design Answer first and correction 2 |
| B-2 | BLOCKER | calculator-page delta | `entry-graph.contract.test.ts:27` pins an entry's imports to exactly the mount and the page module ([CP48]); the design widens it (B2) with no MODIFIED requirement. Add a MODIFIED [CP48]: an entry imports exactly the mount, the page module, and `../draw.ts` exactly when `module.drawing` is declared | `entry-graph.contract.test.ts:24-32` | Applied. MODIFIED Client script contract in the calculator-page delta: the entry imports exactly the mount and the page module, plus `../draw.ts` exactly when `module.drawing` is declared; [CP48] states the derived rule and a seeded failing entry |
| M-1 | MAJOR | proposal; [BD19], [BD23] | `CalculatorBody.budget.test.ts:215` bans `linear-gradient` off the homes. Without JS the box is plain ink; the grid is an SVG path the writer draws | `CalculatorBody.budget.test.ts:210-217` | Applied. Proposal scope, D6 and question 2; [BD19] and [BD23] (plain ink, no gradient; the grid is an SVG path); design B4 and correction 1 |
| M-2 | MAJOR | [CP76]; MODIFIED Result panel | The mockup puts the SVG after the figures: "after `.calc-primary`, before `dl.calc-rows`" | `docs/design/mockups/Main.dc.html:85-95` | Applied. [CP76], the drawing-box requirement and the MODIFIED Result panel: after `.calc-primary`, before `dl.calc-rows`; proposal scope; design S2a test |
| M-3 | MAJOR | [BD11] | `3.048 m` is wrong: `dimensionText` gives `3.05 m` | `apps/web/src/calculator/present.ts:150` (`decimalText(metres, 2)`) | Applied. [BD11] reads `3.05 m` |
| M-4 | MAJOR | [CWC41], [CWC44]–[CWC47], [BD10], [BD19] | The web unit suite runs in `node` (no DOM). Drop the `data-share` clause from [CWC45] (share is generic, B11). Retarget: [CWC41]/[BD10] → controller spy; [CWC46] → a `shareHref` unit test plus e2e [CP78]; [BD19] → `nodesOf`, the markup contract and e2e; [CWC44]/[CWC47] → the static lookup proof | `apps/web/vitest.config.ts:10`; `slot-free-proof.contract.test.ts:114-119` | Applied. [CWC45] drops the `data-share` clause; [CWC41]/[BD10] controller spy; [CWC46] `shareHref` unit test plus e2e [CP78]; [BD19] `nodesOf`, markup contract, e2e; [CWC44]/[CWC47] the static lookup proof |
| M-5 | MAJOR | design B2, B10 | The slot-free proof flags every throwing `find(` whose selector is missing from slot-free markup, whatever guards it. `[data-drawing]` and `[data-share]` lookups must use `findAll` | `slot-free-proof.contract.test.ts:95-119` | Applied. Design Answer first, B2, B10, data flow and S1b/S4; [CWC44]/[CWC47]; the requirement text names `findAll`. [CWC47] asserts the throwing selectors exclude `[data-share]` directly, since the slot-free markup carries the generic anchor |
| M-6 | MAJOR | [SQ39] | Trim C removes the `data-hint-row` hook (`ResultPanel.astro:42`, `mount.ts:135,192`), so "hooks unchanged" is false. Reword: visible text, ids and ARIA equal; hook and guard changes limited to the trim table | `ResultPanel.astro:42`; `mount.ts:135,192` | Applied. [SQ39] and the site-quality requirement reworded; trim row C names the removed hook and its guards; MODIFIED Public DOM hooks (cost row and hint merged) |
| M-7 | MAJOR (orchestrator decision) | design trim F | Drop trim F: moving `--text-display`, `--grid-size`, `--tick-weight` to the home rule breaks site-shell [SS24]–[SS26], which read them from `tokens.css` (`:root`). Update the trim table and the margin; add a task-level rule: measure S3 with the budget test before S4 is sliced; if the margin is short, stop and report (never raise the budget) | `openspec/specs/site-shell/spec.md:63-76` | Applied. Trim F struck from the table (total −826 B); running sizes 39,852 → 40,192 (PR 2) → 40,748 (PR 3), margin ≈ 88 B; stop rule in design, proposal Approach and risk, [CP86], site-quality requirement |
| M-8 | MAJOR | [SQ42] | "a type error naming the id" is impossible: `tooling/site-browser` resolves only `@maestro-calc/i18n` and cannot see `PAGES`. Enforce with a web-side contract test: `PAGES[id].module.drawing` declared iff the E2E record has a `drawing` group, reading the record as the existing contracts read browser files | `tooling/site-browser/tsconfig.json` `paths`; `styles.contract.test.ts:56`; `lighthouse.contract.test.ts:29-30` | Applied. [SQ42] and its requirement: a web-side contract reads `tooling/site-browser/e2e/<id>-pages.ts` as text and fails naming the id unless the slot and the `drawing` group match; planned in S2b |
| m-1 | MINOR | design B8, B9; [BD1]; i18n [ICW19], [ICW20] | Align names: B9's language-free symbols vs [BD1] "unit keys"; one set of drawing keys (`drawing.<shape>.note` vs [ICW20] "area-note"); one share text key (`site.calculator.shareText` vs `share.text`) | design B8-B9, S4; delta [ICW19]-[ICW20] | Applied. One key set: `calc.rectangle-area.page.drawing`; `calc.concrete.page.drawing.<shape>` and `.<shape>.note` (8 per locale); no unit key ([BD1], B8, B9, [ICW19]-[ICW21]); share text is `site.calculator.shareText` everywhere |
| m-2 | MINOR | [BD14] | Assert measured `getBBox` width ≤ the estimated width for the longest labels, after `document.fonts.ready` and with the fallback font, on Linux CI | design B5 (0.56 em estimate) | Applied. [BD14]: measured `getBBox` width ≤ estimate, after `document.fonts.ready` and with fonts blocked, Linux CI; design B5, S2b, risks |
| m-3 | MINOR | `docs/design/direction.md`; design B6 | Add the helper colour `#B9C6DA` to the direction tokens (and state the `tokens.css` plan); record the width line on the left as a deliberate departure from the mockup | `direction.md` tokens table; mockup lines 102-106 (width line on the right) | Applied. `docs/design/direction.md` gains "Helper line `#B9C6DA`"; `tokens.css` plan: no property (presentation attributes; a `:root` token costs bytes on the concrete pin), [BD18] pins the writer constants to the table; B5 records the left width line as a deliberate departure |
| m-4 | MINOR | [CP12] | Trim A drops the per-input `autocomplete="off"`: [CP12] must say inputs inherit the form's `autocomplete` | `CalculatorForm.astro:13`; `openspec/specs/calculator-page/spec.md:198` | Applied. MODIFIED Form controls: the form carries `autocomplete="off"`, inputs inherit it; [CP12] asserts no input overrides it |
| S-1 | DECISION (orchestrator) | proposal, design slicing | All four concrete shapes ship in ONE PR (PR 3), so no concrete shape shows an empty box on the domain. PR plan: PR 1 square footage drawing, PR 2 trim + share, PR 3 concrete drawings; ≤ 400 lines per slice (split inside PR 3); update the slice count and "what the user sees" per PR | owner order (visible progress first) | Applied. PR 1 = S1a–S2b, PR 2 = S3–S4, PR 3 = S5–S7 (all four shapes); [BD8] no longer has an undelivered shape; [SQ38] three tips; proposal and design tables updated |

## Reconciliation before tasks

Applied in this revision; see the Resolution column. Found while applying:

- The Public DOM hooks table of `calculator-page` lists `data-hint-row` (main spec line 165), so trim C is a hook change: the delta now carries a MODIFIED Public DOM hooks (also adding `data-drawing` and `data-share`).
- The share anchor is generic, so the slot-free markup has `[data-share]`; the markup check of the slot-free proof cannot catch a throwing `find(root, '[data-share]')`. [CWC47] asserts the absence of that selector from the throwing lookups directly.
- [SQ42]'s contract would fail a slice that declares the slot before its record exists: the contract lands in S2b with the square footage record, and concrete declares the slot and its record in the same slice (S7).
- The SVG namespace precedent lives in `site-check/facts.ts:37-42` (`NAMESPACE`), not in `client-entry.contract.test.ts`; the client gate has no exception today and none is added.

## Slices after the review

| PR | Slice | Content | Forecast (`--shortstat`) |
|---|---|---|---|
| 1 | S1a | Drawing slot and generic geometry | 280–330 |
| 1 | S1b | Controller plans, injected writer (`nodesOf`, `draw`), `findAll` lookup, entry-graph [CP48] | 300–360 |
| 1 | S2a | Square footage plan, box, head CSS, catalogs | 280–340 |
| 1 | S2b | e2e drawing record, [SQ42] contract, AGENTS.md | 200–260 |
| 2 | S3 | Trim A–E (≈ 826 B), measured before S4 (stop rule) | 200–260 |
| 2 | S4 | WhatsApp share on both pages | 280–340 |
| 3 | S5 | Concrete slab, footing, column geometry | 300–370 |
| 3 | S6 | Concrete steps geometry | 200–260 |
| 3 | S7 | Concrete slot, entry, 8 keys per locale, e2e drawing group | 300–370 |

Total about 2,340–2,890 lines in 9 slices, 3 PRs.

| Concrete bytes (ES fixture, pin 40,836 B) | Change | Running |
|---|---|---|
| Base | | 40,678 |
| PR 2 S3 trim A–E | −826 | 39,852 |
| PR 2 S4 share | +340 | 40,192 |
| PR 3 S7 box, head style, 8 drawing entries | +556 | 40,748 (≈ 88 B margin) |
