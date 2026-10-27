# Archive report: calculator-core

## Summary

Archived 2026-10-27. The generic web layer for every calculator page—extracted from concrete, proven by rectangle-area—is merged to `main` and complete on tip `a83a09e`. Three delta specs merged: new `calculator-web-core` (37 requirements, 37 scenarios CWC1-CWC37), modified `calculator-page` (added 5 requirements CP54-CP58, updated intro and field-visibility rules for generic page modules), modified `site-quality` (added 4 requirements SQ29-SQ32 for per-id e2e record). No CRITICAL issues; 6 WARNING and 6 SUGGESTION items are follow-ups to Square footage go-live and later work. The change closes follow-up JD-5 of the archived `concrete-calculator` change.

## Merged PRs and tips

| Group | PR | Merged | Tip | Scope |
|-------|----|---------|----|-------|
| G1 | #92 | 2026-10-26 19:02 UTC | `4fb7848` | S1-S6: generic controller, concrete as module #1, rectangle-area headless proof |
| G2 | #93 | 2026-10-27 00:38 UTC | `15e4eeb` | S7-S14: page parts (hooks, form, result, builder, mount) |
| G3 | #94 | 2026-10-27 11:33 UTC | `a83a09e` | S15-S18: browser record, entry contracts, docs |

Final tip: `main` at `a83a09e`. Commits: 13 (G1) + 14 (G2) + 21 (G3, incl. Judgment Day) = 48 work-unit commits.

## Gates at tip `a83a09e`

- **npm run verify**: exit 0 (format:check, lint, typecheck, test:coverage, build, check:site). 196 test files, 3,632 tests, 100 percent coverage (2,464 / 1,368 / 784 / 2,119).
- **npm run test:e2e**: 283 Playwright tests passed (38–40 s wall time locally, 3m12s in CI site-browser job at group tip).
- **npm run lighthouse**: exit 0 on six pages (accessibility, SEO, best practices >= 0.95; performance advisory; CLS <= 0.01).
- **check:site**: HTML budgets (largest 34,100 B / 40,960), CSS (7,399 B / 20,480), fonts (22,772 B per file, 92,160 B total), calculator page weight (162,888 B / 196,608), page JS graph (concrete 38,778 B / 49,152 B for entry + static imports), zero JS on static pages.
- **Dist diff** (M-6, design gate): git diff over normalized HTML and CSS (asset names standardized): empty at each group tip (G1, G2 with hook mapping applied, G3).
- **No mutation**: git diff --stat main -- packages/ .github/ is empty; released.contract and i18n-contract unchanged (no URL, catalog, or mutation-shard changes).

## Spec sync

### Created main spec

**openspec/specs/calculator-web-core/spec.md** (new capability)

- 37 requirements: Page-module contract (CWC1-4), Generic controller behaviour (CWC5-9), URL state (CWC10-13), Unit toggle (CWC14-17), Generic mount (CWC18-22), Page-view builder (CWC23-25), Per-id tables (CWC26-27), Reserved height (CWC28-30), Rectangle-area proof (CWC31-33), Success criterion (CWC34-37).
- 37 scenarios (CWC1-CWC37).
- No edit to spec text needed: CWC7 scenario already states bare `150` reads as feet (1,500.00 ft²); `150 in` gives 125.00 ft² (this was an earlier discrepancy resolved in G1, per apply-progress deviation 3).

### Modified main specs

**openspec/specs/calculator-page/spec.md**

- Updated intro: "every later calculator uses the same template through the generic core (`calculator-web-core`)".
- Added 1 requirement: Public DOM hooks (CP54-CP58), specifying the generic hook table and concrete/rectangle-area examples.
- Modified 4 existing requirements: Form controls (generalized to "fields the selected option of its choice group shows", added stepper bounds from descriptor wording), Live recalculation (added stepper bounds wording), Client script contract (added "generic mount and controller", widened to "EVERY entry of `CALCULATOR_PAGES`"), Layout stability (replaced "shape-dependent area has the size of its tallest shape" with "derived from the module, `calculator-web-core`").
- Added 2 scenarios: CP57 (stepper bounds follow descriptor), CP58 (reservation is derived, tested with five-field fixture).
- Total: 38 requirements (36 kept + 1 new Public DOM hooks + 1 modified layout stability), 61 scenarios (56 kept unchanged, 5 new/modified).

**openspec/specs/site-quality/spec.md**

- Updated intro of "Calculator quality coverage" (SQ29): "browser suites MUST iterate one typed record per calculator page, `Record<CalculatorPageId, E2eSpec>`", generic suites skip groups the record does not declare, concrete record carries existing data unchanged.
- Added 4 requirements: Missing record fails typecheck (SQ29), Generic suites iterate record (SQ30), Concrete assertions unchanged (SQ31), CSP covers every calculator (SQ32).
- Total: 19 requirements (15 kept + 4 new), 32 scenarios (28 kept unchanged, 4 new).

### Summary of merged counts

| Spec | Reqs | Scenarios | Comment |
|------|------|-----------|---------|
| calculator-web-core | 37 new | 37 | Entire new spec |
| calculator-page | +4 (46→50) | +5 (56→61) | CP54-58 added; existing 4 reqs updated |
| site-quality | +4 (15→19) | +4 (28→32) | SQ29-32 added |
| **Total merged** | **+45** | **+46** | All new scenario ids mapped |

## Task completion

- **G1.4** Ticked in tasks.md (PR #92 merged 2026-10-26).
- **F.1** (pre-change packages/ diff) Ticked: `git diff --stat a77cd56 HEAD -- packages/ .github/` is empty; site HTML differs only by mapped attributes (G2.4).
- **F.2** (apply-progress completeness) Ticked: all 18 slices have data; missing only G1 `site-browser` wall time (now recorded at G1 group tip from CI run 40381783849: 4m45s, within limit 15m, SQ15).
- **SX1-SX5 and GX1-GX6** template boxes Unticked by design: templates applied per slice and group; evidence is in apply-progress sections.

## Deviations by group (per apply-progress)

### G1

1. **S5 is one 1,098-line rewrite commit** (`f02978e`) plus 143-line prep. `controller.ts` replaced wholesale; named split S5b would have doubled churn.
2. **Library-build size gate measured wrong.** Commit 5953902 removes whitespace (`removeWhitespace: true`); proxy now matches shipped size. Measured with fix: `main` 37,330 B, S4 tree 37,299 B, tip 38,744 B.
3. **CWC7 text `150` reads as feet (1,500.00), not `125.00`.** Spec delta corrected. Test asserts both: bare and `150 in`.
4-9. Extra exports and TDD exceptions recorded (list in apply-progress G1 lines 92-93).

### G2

1-11. Slices split additive then switch (S9, S10, S11, S12); `pageViewOf` arrives in S11; guard tests in S8 later replaced; distdiff mapping needed one CSS rule rewrite; K13 rows added not replaced. See apply-progress lines 189-197.

### G3

1-10. Richer record, mappings, new files, proof entry replaces G1 stand-in, untested mount no-slot branches (F1), 38,778 B graph over 38,500 B soft target (F5), 124 B ES HTML headroom (F6). See apply-progress lines 98-99.

## Follow-ups (per verify-report)

| Id | Item | Level | Belongs to | Note |
|----|----|-------|-----------|------|
| F1 | Mount no-slot branches have no DOM test | WARNING | Square footage go-live (D13) | Proof is unit-level; browser test at next slot-free page |
| F2 | Page-content rules hard-wired to concrete | WARNING | Square footage go-live | Rules take id from table in generalization |
| F3 | Concrete slab carries unused `starts` prefix | SUGGESTION | Later record tightening | With second record |
| F4 | Generic e2e titles frozen to concrete | SUGGESTION | Square footage go-live | Split record into `press` and `price` |
| F5 | Concrete JS graph 38,778 B over 38,500 B soft target | SUGGESTION | Later, if owner wants reduction | Gate 49,152 B holds |
| F6 | Spanish HTML headroom 124 B at full length | WARNING | Square footage go-live | Budget decision first before growth |
| W2 | CWC20 proof weak (history.length poll, not spy) | WARNING | Square footage go-live (W2) | Strengthen with spy in e2e |
| W3 | CWC7 text correction | WARNING | None—already correct | Spec text says bare 150 = 1,500.00 ft² (feet, not 125.00) |
| W4 | G1 site-browser wall time unrecorded | WARNING | None—recorded here | G1 CI run 40381783849: 4m45s |
| S1 | CWC17 uses real origin, not example.test | SUGGESTION | None | Harmless; behaviour identical |
| S2 | CWC27 proved by scan + table | SUGGESTION | None | Executable only once second id exists |
| S3 | G1 review could not run (receipt-driven disabled) | SUGGESTION | None | Recorded; four-lens + Judgment Day reviews stand |

**No CRITICAL issues. Archive is unblocked.**

## Review and delivery status

```yaml
reviewGate:
  mode: disabled/unmanaged
  reason: Receipt-driven development disabled by owner 2026-10-26
  delivery: disabled/unmanaged
  native_lenses_executed:
    G1: 4-lens + Judgment Day (approved)
    G2: 4-lens + Judgment Day (approved)
    G3: 2-lens + Judgment Day (approved; no production code)
```

Kill switch is OFF (disabled mode is allowed). No review artifact found in active backend; reviews that stand are the approved Judgment Day verdicts per group.

## Final state

- **Closed**: calculator-core change archive complete at 2026-10-27.
- **Merged to main**: all implementation, all specs, all doc updates.
- **Delivered**: three delta specs synced to main specs; three new capabilities active (calculator-web-core, and modifications to calculator-page and site-quality).
- **Ready for next change**: Square footage calculator go-live uses calculator-web-core as the first live generic consumer. All follow-ups F1-F4, W2 deferred to that change.
- **Changelog**: closed follow-up JD-5 of `concrete-calculator` change. No new URLs, no routing changes. Rectangle-area is unrouted test-only. Concrete pages byte-identical in visible text.
