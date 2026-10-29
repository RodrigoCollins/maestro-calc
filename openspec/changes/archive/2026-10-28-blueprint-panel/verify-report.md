# Verify report: blueprint-panel

Verdict: PASS WITH WARNINGS
Counts: CRITICAL 0, WARNING 3, SUGGESTION 1
Mode: strict TDD, openspec store. Base: `main` `fc277fd` (contains #106, #109, #110). Pre-change `main`: `05de1f7`.
Specs: 5 delta specs (1 new capability), 16 added and 5 modified requirements.

## Runtime evidence

| Command | Result |
|---|---|
| `npm run verify` on `fc277fd` | exit 0; 4,075 tests; `check:site` 18 pages; HTML 33,872 B of 40,960; calculator JS 47,293 B of 49,152; calculator page weight 171,175 B of 196,608; fonts 89,720 B of 92,160 |
| CI | PR 1 run 40749085905, PR 2 run 40796447511 (`site-browser` 7m24s), PR 3 run 40802960743 (`site-browser` 7m25s): all green, Linux gates 4.8, 6.11 and 9.10 included |
| Browser suite at the PR 3 tip | 604 cases locally; Lighthouse: every assertion passes on 6 pages |
| ES concrete full-length proof ([CP66], [CP86]) | 40,797 B of the 40,836 B pin (39 B margin) |
| `git diff --stat 05de1f7 main -- packages/core packages/data` | empty (mutation N/A) |
| Attribution scan over `05de1f7..main` | no matches |
| Live site (`maestrocalc.com`, after #110) | the four concrete shapes and the square footage plan are drawn; WhatsApp link full width on every calculator page |

## Spec compliance

Every scenario id is traced per slice in `apply-progress.md`. The drawing scenarios (BD1-BD25) are proven by the plan unit tables (hand-verified, and for concrete cross-checked against an independent calculation), the controller tests, `draw.test.ts` and `drawing.spec.ts` over both browser records. The share scenarios (CP78-CP86) are proven by the controller tests, `share.spec.ts`, `no-js.spec.ts` and `layout.spec.ts`. The budget scenarios (SQ38-SQ44) are proven by the budget proof, `check:site` and the entry contracts.

## Warnings

1. **Owner-accepted process gap:** PR 3 merged without the four reviewers and Judgment Day (the owner asked to merge on green CI). PR 1 and PR 2 had both.
2. **Design deviations, recorded in the spec:**
   - A concrete plan is named by the answer sentence, not one template per shape (−390 B, needed to stay under the pin).
   - Notes are centred on the frame.
   - The ES depth note reads `Profundidad: {depth}`.
   - The WhatsApp link has no icon and sits in the copy area (both carried over from PR 2).
3. **Size:** S5 measured 421 lines (over 400), and PR 1 also exceeded the slice budget. Both are recorded in `apply-progress.md`.

## Suggestion

1. **Byte headroom on concrete ES is 39 B.** Trim before the next concrete addition. The cheapest candidate is the 15 `class="calc-field"` attributes (~285 B) with a field selector.
