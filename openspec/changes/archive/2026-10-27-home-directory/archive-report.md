# Archive report: home-directory

## Summary

Archived 2026-10-27. The home became a calculator directory generated from the route table, with the Blueprint identity (grid and orange dimension tick) spent once in the home hero. The gap under the answer on desktop is fixed by per-breakpoint reserves. Four delta specs merged into main specs. No CRITICAL issues. Verify verdict: PASS WITH WARNINGS; the remaining warning is a follow-up.

## Merged PRs

All merged to `main` on 2026-10-27; production verified on maestrocalc.com.

| PR | Merged (UTC) | Scope |
|----|--------------|-------|
| #96 | 16:01 | PR 1: home route files, `inlineStylesheets: 'always'`, tokens, card keys, data module |
| #97 | 16:34 | PR 1b |
| #98 | 16:53 | PR 2: hero band and cards, with 2b folded in (#99 closed) |
| #100 | 19:41 | PR 3: reserves per breakpoint (four lenses, one correction round, Judgment Day approved) |

Main at merge of the last PR: `5604ced`. Archive branch tip: `acf2d14`.

## Final counts

- Unit tests: 3,699 (`npm run verify` exit 0).
- e2e: 324 Playwright tests.
- ES concrete full-length proof: 40,573 B against the 40,836 B pin of CP66 (limit 40,960 B).
- Home HTML: 9,315 B (EN) and 9,425 B (ES), against the 24,576 B ceiling of TP35.
- Largest CSS per page: 7,484 B (limit 20,480 B).
- `site-browser` CI wall times: 3m13s (PR 1), 3m38s (PR 1b), 3m16s (PR 2), 3m09s (PR 2b branch), 3m53s (PR 3); limit 15 min.
- `packages/` touched only in `packages/i18n/src/catalogs/{en,es}/site.ts`; no budget raised; URL set, sitemap (14) and pinned counts unchanged.

## Spec sync

| Main spec | Requirement | Action | Scenarios added |
|-----------|-------------|--------|-----------------|
| calculator-page | Layout stability | Replaced by delta block (CP44, CP58 kept; CP59-CP66 added); Terms paragraph of the delta preamble placed inside the requirement | +8 |
| site-routing-i18n | Calculator pages in the route table | Replaced by delta block (SR17, SR18 kept; SR23 added); the stale "page goes live in the last slice" note dropped with the block | +1 |
| site-shell | Blueprint design tokens | Replaced by delta block (SS5-SS7 kept; SS24-SS26 added) | +3 |
| site-shell | The identity is spent once and scoped to the home | Added (SS27-SS32) | +6 |
| trust-pages | Home page | Replaced by delta block (TP7, TP8 kept; TP21 generalised; TP28-TP37 added) | +10 |

Total: 28 new scenario ids, 4 requirements replaced, 1 added.

The main-spec text of TP26 (methodology, "No not-published-yet wording") is untouched, as the delta states. The CP60/CP61 wording is the amended one (two-line bound at the last pixel width before a breakpoint).

## Task completion

All tasks ticked in `tasks.md`, including F.3 at archive time. Task checkboxes were not reconciled from stale state.

## Final-state notes

- Verify-report (PASS WITH WARNINGS), warning 1 (CP60/CP61 amendment missing from the delta spec): not true at close; the delta `specs/calculator-page/spec.md` carries the amendment (checked by the orchestrator and confirmed in the merged main spec).
- Warnings 3-4 (P1.4, P2.4, SX1-SX5, F.2 unticked; CI wall times unrecorded): resolved in `acf2d14`.

## Follow-ups

| Item | Note |
|------|------|
| TP36 has no tagged test | Covered by the generic axe suite over `/` and `/es`; tag the axe home case with [TP36] |
| `calculator.css` reaches trust pages | Through the shared catch-all CSS chunk |
| `CalculatorBody` `style` prop | Could narrow to the two custom properties |
| Hub-era card keys | Revisit when hubs arrive |
| One card in three auto-fill tracks at 1280 px | Until square-footage ships |

## Review and delivery status

Receipt-driven development is disabled by the owner (disabled/unmanaged). Four-lens reviews and Judgment Day verdicts per PR stand as recorded in `apply-progress.md`.

## Final state

Closed 2026-10-27. Ready for the next change (square-footage go-live is the first consumer of the new directory).
