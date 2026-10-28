# Archive report: square-footage

## Summary

Archived 2026-10-28. `rectangle-area` went live as the second calculator (Square Footage Calculator at `/square-footage-calculator`, Calculadora de pies cuadrados at `/es/calculadora-de-pies-cuadrados`). Seven delta specs merged into main specs. No CRITICAL issues. Verify verdict: PASS WITH WARNINGS; the warnings are follow-ups or accepted deviations.

## Merged PRs

All merged to `main` on 2026-10-28 (UTC); the per-PR scope is in `apply-progress.md`.

| PR | Merged (UTC) | Scope |
|----|--------------|-------|
| #102 | 00:52 | PR 1: content schema, content and methodology contracts and the HTML budget proof per calculator id; `SCRIPTS` in `views/scripts.ts`; dates through `lib/calendar-day.ts` |
| #103 | 14:52 | PR 2+3: the EN/ES entries (owner-approved), answer and unit sentences, retitle, per-page reserve as a head `<style>` (`lib/reserve.ts`), slot-free proof on a test-only module, staged e2e record |
| #104 | 16:03 | Go-live: measured reserve, owner approval flip, routes, methodology, home card, browser record |

Main at close: `eac3569`. Archive branch tip before this commit: `c7f2ccb`.

## Production and approvals

- Production verified: both URLs answer 200, the title is "Square Footage Calculator: Area of a Room", the home shows both cards, the sitemap lists both URLs.
- Owner approval of both entries (EN and ES): 2026-10-27 (UTC-3), in chat; recorded in `apply-progress.md` section "Owner approval (K12)" before the `ownerReview: approved` commit.
- Linux CI: run 40714831996 missed only the unused-reserve bound; run 40718266723 green after the 0.5rem window ([CP60], [CP61], [CP73] amended 2026-10-28).
- Receipt-driven development is disabled by the owner (disabled/unmanaged); four-lens reviews and Judgment Day verdicts per PR stand as recorded in `apply-progress.md`.

## Final counts

- Unit tests: 3,907.
- e2e: 489 Playwright tests.
- ES concrete full-length: 40,678 B against the 40,836 B pin of [CP66]/[SQ35] (limit 40,960 B).
- Square footage full-length fixture: 34,122 B (EN) and 34,159 B (ES).
- Built square footage pages: 25,155 B (EN) and 26,593 B (ES).
- Square footage entry static graph: 33,803 B; concrete graph: 39,164 B (limit 49,152 B).
- No budget raised; `git diff --stat main -- packages/core packages/data` empty (RAP8, SX4).

## Spec sync

Counts are scenario ids added or removed by this change; before/after totals per spec were not counted.

| Main spec | Requirement | Action | Scenario ids |
|-----------|-------------|--------|--------------|
| calc-rectangle-area | Bilingual labels | Replaced by delta block (title retitled; the two unnumbered scenarios kept, smoke import now expects `Calculadora de pies cuadrados`) | 0 |
| calc-rectangle-area | Page copy and hand-verified display cases | Added | +8 (RAP1-RAP8) |
| i18n-catalog | Message resolution | Replaced by delta block (title row of the exact-label table, with the two Previously notes) | 0 |
| calculator-web-core | Rectangle-area headless proof | Replaced by delta block (test-only slot-free module; CWC31 kept; CWC33 changed) | +3 (CWC38-CWC40), -1 (CWC32 removed) |
| site-routing-i18n | Calculator pages in the route table | Replaced by delta block (SR17 and SR23 changed, SR18 kept; the "counts unchanged by the split" sentence dropped with the block) | +2 (SR24, SR25) |
| site-routing-i18n | Page totals after the calculator change | Replaced by delta block (8 ids, 16 routable, 18 built, 18 keys, 16 sitemap, 14 entries; SR19 changed) | 0 |
| site-quality | The budget proof covers every calculator page | Added | +5 (SQ33-SQ37) |
| trust-pages | Methodology page | Replaced by delta block (TP22, TP24-TP26 per id; TP9, TP23 kept) | +4 (TP38-TP41) |
| trust-pages | Home page | Replaced by delta block (TP21, TP28, TP30, TP31, TP32, TP35 reworded; TP7, TP8, TP29, TP33, TP34, TP36, TP37 kept) | 0 |
| calculator-page | Page anatomy and content collection | Replaced by delta block (CP6-CP10 per id, CP5 kept) | +9 (CP67-CP75, placed here as in the delta) |
| calculator-page | Layout stability | Replaced by delta block (CP60, CP61, CP64, CP65, CP66 changed; CP44, CP58, CP59, CP62, CP63 kept) | 0 |

Total: 31 scenario ids added (RAP 8, CWC 3, SR 2, SQ 5, TP 4, CP 9), 1 removed (CWC32); 2 requirements added, 9 replaced.

## Task completion

All tasks ticked in `tasks.md` (SX, GX, 1.x to 7.x, P1 to P4, F.1 to F.3). F.3 (archive-ready) is satisfied by this sync; no task was unticked at close, so no checkbox changed.

## Verify-report

PASS WITH WARNINGS. Nine ids are cited only through behaviour (not tagged in test names); accepted deviations are listed in the verify-report.

## Follow-ups

| Item | Note |
|------|------|
| Cite CP71, CP72, CP75, CWC38, CWC39, SQ35, TP36 in tests | These pass through behaviour only; tag the tests with the scenario ids |
| `calculator.css` reaches trust pages | Through the shared catch-all CSS chunk |
| The 0.5rem Linux window has no margin left | A further Linux drop earlier than 8 px would fail [CP60], [CP61], [CP73] |
| Hub-era card keys | Revisit when hubs arrive |

## Stale text left in main specs (not in any delta)

Not changed because no delta covers it; revisit in a later change.

- `calc-rectangle-area` preamble: "single proof calculator ... not a product page; no UI is in scope".
- `calculator-web-core` preamble: "Out of scope: a second live page (rectangle-area stays unrouted)"; [CWC4] and [CWC24] still describe the rectangle-area module as slot-free.
- `site-routing-i18n` "Route table and URL set": table lists 7 ids, [SR1] says 14 paths.
- `i18n-catalog` "Site catalog scope": [ICW1] says 16 `page.*` keys and eight ids (now 18).
- `calculator-page` preamble: "First instance: concrete".

## Final state

Closed 2026-10-28. Ready for the next change.
