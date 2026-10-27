# Verify report: calculator-core

## Summary

**Verdict: PASS WITH FOLLOW-UPS.** 0 CRITICAL, 6 WARNING, 6 SUGGESTION. Every scenario of the three delta specs (46 new ids) has a proof or a documented exclusion; `npm run verify` was re-run on `main` and matches the recorded numbers exactly; the public URL contract is untouched. Nothing blocks archive. The warnings are bookkeeping and proof-strength notes, listed under Follow-ups.

Mode: strict TDD (`npm test`, vitest). Artifact store: openspec. Read-only validation; no code was changed.

## Scope verified

| Item | Value |
|---|---|
| Base before the change | `a77cd56` (`main`) |
| G1 | PR #92, merged 2026-10-26, merge commit `4fb7848`, head `013524b` |
| G2 | PR #93, merged 2026-10-26/27, merge commit `15e4eeb`, head `29a3502` |
| G3 | PR #94, merged 2026-10-27, merge commit `a83a09e`, head `9ce7235` |
| Verified tip | `main` at `a83a09e`, clean checkout |
| PR #94 checks | all green at merge: `verify` 2m12s, 8 `mutation` shards, `mutation-gate`, `site-browser` 3m9s, Workers Builds |
| Artifacts read | proposal, design, design-review, tasks (all groups and Traceability), three delta specs, state.yaml, apply-progress (all 441 lines) |

## Spec conformance

Proof kinds: T = unit or contract test run in `npm run verify`; E = Playwright suite (recorded 283 passed at each group tip, CI `site-browser` green on every merged tip, not re-run here); M = recorded measurement. "Opened" marks the scenarios whose test I read and compared with the scenario text.

### calculator-web-core

| Id | Proof | Status |
|---|---|---|
| CWC1 Minimal module | T `rectangle-area/controller.test.ts` | compliant |
| CWC2 Concrete is module #1 | T `concrete/page.test.ts` | compliant |
| CWC3 Shopping is a list | T `page-module.test.ts`, `slots/shopping.test.ts`, `calculator/controller.test.ts` (opened: declared order, drift on a later run, creation failure `SHOPPING_LINES`), `ShoppingLine.test.ts` | compliant |
| CWC4 Absent slots import nothing | T `rectangle-area-proof.contract.test.ts` (graph of the real proof entry) | compliant |
| CWC5 Texts and figures | T `texts.test.ts`, `concrete/controller.test.ts`, `lib/page-view.test.ts` | compliant |
| CWC6 Raw record shape | T own-key `undefined` via spy on `validate`; rectangle record is exactly `length`, `width` | compliant |
| CWC7 Invalid text blocks everything | T `rectangle-area/controller.test.ts` (opened) | compliant, spec text wrong, see W3 |
| CWC8 Bounds in the field unit | T `concrete/controller.test.ts` | compliant |
| CWC9 No DOM, no window | T `generic-code.contract` plus ESLint `no-restricted-globals` plus 100 percent coverage | compliant |
| CWC10 to CWC12 URL state | T `concrete/controller.test.ts` | compliant |
| CWC13 Second consumer keys | T `rectangle-area/controller.test.ts` (opened: `12 ft 6 in`, `?v=1&u=m&l=150`) | compliant |
| CWC14, CWC15 Metric toggle | T `texts.test.ts`, `concrete/controller.test.ts` | compliant |
| CWC16 Toggle, no slot | T `rectangle-area/controller.test.ts` (opened) | compliant |
| CWC17 Copy address | T `concrete/controller.test.ts` | compliant; uses origin `https://maestrocalc.com`, spec says `https://example.test` (S1) |
| CWC18, CWC19, CWC21, CWC22 Mount behaviour | E `calculator.spec.ts` | compliant (E only, no unit proof) |
| CWC20 replaceState only when valid | E `calculator.spec.ts` (opened) | partial, see W2 |
| CWC23 Concrete view unchanged | T `lib/pages.test.ts`, `page-view.test.ts`; M dist diffs (G1, G2 mapped, G3) empty | compliant |
| CWC24 Module with no slots renders | T `page-view.test.ts`, `CalculatorBody.test.ts` (container render) | compliant |
| CWC25 No message text in client | T `client-entry`, `entry-graph` contracts | compliant |
| CWC26 Missing row fails typecheck | T `lib/pages.test-d.ts`; negative proof run in S12 | compliant |
| CWC27 View follows the id | T `lib/pages.test.ts` source scan plus per-id table | compliant, source proxy only (S2) |
| CWC28, CWC29 Reserved rows | T `slots/choices.test.ts` (opened: 4 rows, five-field fixture gives 5), `CalculatorForm.test.ts` | compliant |
| CWC30 No choice group | T `form-layout.test.ts` | compliant |
| CWC31 Area through the controller | T `rectangle-area/controller.test.ts` (opened) | compliant |
| CWC32 Unrouted proof excluded | T proof contract; M `rg -l rectangle-area apps/web/dist` empty | compliant |
| CWC33 Markup has no slot elements | T proof contract (opened: no slot hooks, three outputs, every failing lookup resolves, seeded cases) | compliant |
| CWC34 No id in generic code | T `generic-code.contract`, `browser-record.contract` | compliant |
| CWC35 Recipe matches | T `docs.contract.test.ts` (52 tests) | compliant |
| CWC36 Budgets | M re-measured below; T limits in `client-entry.contract` | compliant |
| CWC37 Per-entry contracts iterate pages | T `describe.each(CALCULATOR_PAGES)` in `entry-graph`, `client-entry`, `client-hygiene`, `templates`; seeded `client-graph` | compliant |

### calculator-page

| Id | Proof | Status |
|---|---|---|
| CP54 Hooks on the concrete page | T `CalculatorBody.test.ts`, `CalculatorForm.test.ts`, `ShoppingLine.test.ts`; E | compliant (value/key placement is deviation 10 of G2) |
| CP55 Hooks drive behaviour | E `calculator.spec.ts` | compliant |
| CP56 Absent features have no hooks | T `CalculatorBody.test.ts` rectangle-area render | compliant |
| CP57 Stepper bounds follow the descriptor | T `slots/steppers.test.ts` (opened: max 20 stays, max 30 reaches 25), `controller.test.ts` | compliant |
| CP58 Reservation is derived | T `slots/choices.test.ts`, `lib/page-view.test.ts` | compliant |
| Kept ids CP11 to CP14, CP19 to CP24, CP31, CP33, CP42 to CP44, CP47, CP48, CP51 | T plus E as in the Traceability table | compliant |

### site-quality

| Id | Proof | Status |
|---|---|---|
| SQ29 Missing record fails typecheck | T `calculator-pages.test-d.ts` via `npm run typecheck --prefix tooling/site-browser`; negative proof recorded | compliant |
| SQ30 Generic suites iterate the record | T `calculator-pages.test-d.ts` (minimal spec compiles), `browser-record.contract.test.ts` (seeded literals) | compliant |
| SQ31 Concrete assertions unchanged | M 283 tests, titles identical to the parent tree, selector-only assertion diff | compliant (M only) |
| SQ32 CSP suite covers every calculator | T contract; E `csp.spec.ts` loops `calculatorPages` | compliant |
| SQ17 to SQ19, SQ27 (kept) | E suites, `client-size.contract` | compliant |

Opened and compared: CWC3, CWC7, CWC13, CWC16, CWC20, CWC28, CWC29, CWC31, CWC33, CP57, CP58 (13 scenarios, above the minimum of ten). No scenario is without proof. Assertions weaker than the scenario text: CWC20 (W2), CWC17 origin (cosmetic), CWC7 text (spec error, W3).

## Design conformance

Implemented as designed: page module with optional slots (`definePage`, five slot modules under `calculator/slots/`), generic `controllerOf`, `lib/page-view.ts` builder with `formOf` layout, `PAGES`, `SCRIPTS` and the typed `E2E` record as `Record<CalculatorPageId, ...>`, generic `client/mount.ts` (`mount(module)`), trimmed DOM hooks (key on the group as `data-choice`/`data-step`, option or direction as the button `value`), slot-free proof entry under `contract/__testing__/`, K12 (list lookups for slots), K13 (AGENTS.md rows moved with each rename and pinned by `docs.contract`), K15 (shopping check at creation), m-2 (unit-hint rule, `PAGE_KEY`), m-6 (derived `--calc-rows` CSS).

| Deviation (apply-progress number) | Recorded | Effect |
|---|---|---|
| G1 1: S5 one 1,098-line rewrite commit | yes | none functional |
| G1 2: library-build size gate measured whitespace; fixed in `5953902` | yes | budgets unchanged, proxy now matches |
| G1 3: CWC7 `150` reads as feet | yes | spec text still wrong, see W3 |
| G1 4 to 9: extra exports, `OUTPUT_HINT`, `SHAPE_FIELDS` answer values, TDD exceptions | yes | none |
| G2 1: slices split additive then switch | yes | none |
| G2 2: `pageViewOf` arrives in S11 | yes | none |
| G2 3 to 9: guard tests, mapping change, K13 rows, `primaryOutputOf`, fixtures, TDD exceptions | yes | none |
| G2 10: hook trim (value/key placement, no `data-reserved` on area/steppers) after the HTML budget proof under-measured by 90 B | yes | CP54 text mapped; ES headroom 124 B (F5) |
| G2 11: `checkModule` replayed in the builder | yes | build fails first |
| G3 1 to 10: richer record, mappings for SQ31, extra files, proof entry replaces G1 stand-in, no-slot mount paths untested, 38,778 B graph, TDD exceptions, transient worktree | yes | see Follow-ups |
| Proof entry 33,355 B vs task forecast 29,500 to 31,000 B and design 31,000 to 33,000 B | yes (G3 correction round) | under 49,152 B |

Strict TDD credibility: RED is recorded per new module and per changed signature; every exception (renames, already-green pins, suite rewrites) is named with a break-the-code spot check or the "same titles, same assertions" rule, and each slice lists negative proofs that were run and reverted. The G3 Judgment Day info item 1 (a `SIGABRT` RED for the unterminated comment) shows RED was observed for the right reason. Accepted as credible.

## Gates

Run here on `main` at `a83a09e` (clean): `npm run verify`, exit 0.

| Measure | Recorded | Measured now |
|---|---|---|
| Test files | 196 | 196 |
| Tests | 3,632 | 3,632 |
| Coverage statements / branches / functions / lines | 100 (2,464 / 1,368 / 784 / 2,119) | 100 (2,464 / 1,368 / 784 / 2,119) |
| Concrete page JS graph | 38,778 B of 49,152 | 38,778 B |
| Largest HTML | 34,100 B of 40,960 | 34,100 B (`/es/calculadora-de-concreto`) |
| Calculator page weight | 162,888 B of 196,608 | 162,888 B |
| Largest CSS / font / non-calculator page weight | 7,399 / 22,772 / 104,178 B | same |
| `check:site`, `check:dist` | green | green |

Recorded, not re-run (per instruction): e2e 283 passed at each group tip (38 to 40 s locally); Lighthouse exit 0 at G2 and G3 tips; CI `site-browser` 3m36s (G2), 3m12s (G3), G1 not recorded (W4); library-build entry sizes concrete 39,674 B and proof entry 33,355 B. PR #94 checks re-read with `gh pr checks`: 12 of 12 pass.

## Tasks

All task boxes are ticked except:

| Box | State | Assessment |
|---|---|---|
| G1.4 Exit GX1 to GX6 | unticked | done in fact (PR #92 merged); apply-progress G1 has no GX evidence section and no `site-browser` wall time (W4) |
| F.1 pre-change `packages/` diff | unticked | verified here: `git diff --stat a77cd56 HEAD -- packages/ .github/` is empty and no commit in `a77cd56..HEAD` touches either path; site HTML differs only by the mapped attributes (G2.4) |
| F.2 apply-progress completeness | unticked | per-slice data present for all 18 slices; missing only the G1 `site-browser` wall time |
| SX1 to SX5, GX1 to GX6 (template lists) | unticked by design | templates applied per slice and group; evidence is in apply-progress |

No box is ticked wrongly. `state.yaml` is stale: `apply: partial`, `verify: pending`, and it describes G3 as unpushed although the three PRs are merged. Archive should refresh it.

## Public contract

- `RELEASED` (`packages/core/src/__testing__/released-snapshot.ts`) and `REGISTRY` (`packages/core/src/calculators/released.contract.test.ts`): last commits are `cd0139b`, `7febe7f`, `f4bb0c8`, all from the earlier `concrete-calculator` change. None belongs to the 19 + 28 + 45 commits of G1 to G3.
- `git log a77cd56..HEAD -- packages/ .github/` is empty; `git diff --stat a77cd56 HEAD -- packages/ .github/` is empty. No URL key, catalog key, mutation shard or CI matrix changed.
- `rectangle-area` stays unrouted: not in `ROUTES`, sitemap or `dist` (CWC32).

## Follow-ups and known gaps

None blocks archive.

| Id | Item | Level | Blocks archive | Belongs to |
|---|---|---|---|---|
| F1 | The mount's no-slot branches (no `answer`, `[data-line]`, `[data-primary-before]`, choice group) have no DOM-level test; the proof covers graph, markup and lookups only | WARNING | no | Square footage go-live (first slot-free page, real browser proof, D13) |
| F2 | Page-content rules of `calculator-content.contract.test.ts` are hard-wired to concrete through `entryOf`; only the set and registry checks derive from `CALCULATOR_PAGES` | WARNING | no | Square footage go-live (rules take the id from the table) |
| F3 | Concrete's slab option carries a `starts` prefix no test reads | SUGGESTION | no | later record tightening, with the second record |
| F4 | Generic e2e titles still read as concrete's (frozen by SQ31); the record's `variant` couples a press and a price | SUGGESTION | no | Square footage go-live (rename titles; split into `press` and `price`) |
| F5 | Concrete page JS graph 38,778 B is 278 B over the G1 soft target 38,500 B (gate 49,152 B holds) | SUGGESTION | no | later, only if the owner wants it back under |
| F6 | Spanish concrete page has 124 B of HTML headroom at full length (40,836 of 40,960 B, real head and island); the next markup growth needs a budget decision | WARNING | no | Square footage go-live (budget decision first) |
| F7 | Native Gentle AI review could not run from this runtime; the owner disabled receipt-driven development; the four-lens reviews (G1, G2) or two-lens review (G3) plus Judgment Day stand | SUGGESTION | no | none, recorded |

Additional findings from this verification:

- W2 (WARNING) CWC20 asks to count `history.replaceState` calls (none for `abc`, one for `20`). The e2e (`calculator.spec.ts`, variant test) polls the query and asserts `history.length` is unchanged; no test spies on `replaceState`. The behaviour is covered indirectly by controller tests (`write` undefined for invalid state) and `mount.ts` line 296 is the only call. Strengthen with a spy in the Square footage e2e.
- W3 (WARNING) CWC7 in the delta spec still says a bare `150` restores `125.00`; the implementation and tests (correctly) read a bare number in feet (`1,500.00`) and use `150 in` for `125.00`. Apply-progress G1 deviation 3 records this and asks for the spec text to be corrected. Fix the text when the delta is merged at archive.
- W4 (WARNING) G1 `site-browser` CI wall time (GX6, F.2) was never recorded. Fill it from the run history of PR #92 or note it as unrecorded at archive.
- S1 (SUGGESTION) CWC17 uses origin `https://maestrocalc.com` in the controller test, not `https://example.test`; behaviour identical, harmless.
- S2 (SUGGESTION) CWC27 is proved by a source scan plus the per-id table, executable only once a second id exists.

## Verdict

**PASS WITH FOLLOW-UPS.** 0 CRITICAL, 6 WARNING (F1, F2, F6, W2, W3, W4), 6 SUGGESTION (F3, F4, F5, F7, S1, S2). The change is complete on `main`; recommended next step is `sdd-archive`, after correcting the CWC7 text and refreshing `state.yaml`.
