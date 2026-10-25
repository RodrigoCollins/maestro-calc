# Apply progress: concrete-calculator (G1 engine)

Branch `feat/concrete-g1-engine` (all G1 slices are work-unit commits on this one branch; no push, no PR). Strict TDD (RED seen before GREEN in every slice). Baseline before S1 (`a0dddb2`): `npm run verify` green, 128 files, 2,346 tests.

## Status

| Slice | Status | Tip | Tests after `verify` | Changed lines (forecast) |
|---|---|---|---|---|
| S1 geometry | done | `90d9576` | 2,361 | 199 (~180) |
| S2 data | done | `a8e5c53` | 2,372 | 223 (~190) |
| S3a factory + coupling | done | `4d55474` | 2,428 | 750 (~380) |
| S3b yields, bags, costs, drift | done | `aaf78e9` | 2,463 | 535 (~300) |
| S4 footing, column | done | `84263aa` | 2,495 | 203 (~380) |
| S5 steps, properties, language-free | done | `7d01dcb` | 2,531 | 355 (~380) |
| S5 url test (contingency move into S6) | done | `cf2af4c` | 2,531 | 106 |
| S6 size probe | done after the owner budget decision | see below | 2,532 | 32 (pin and lockfile) |

G1 commits: `a0dddb2..a21055a` (8 commits). GX2 hygiene (`git log a0dddb2..HEAD --format=%B | rg -i 'co-authored|claude|anthropic|generated with'`) returns nothing.

## G1.1 Owner actions (information, not blockers)

- OA2: the 17 URL keys and defaults are approved as written in the spec by the pipeline (owner decision delegated): `sh l w t fw fd d h sw rs rn ns n ws bg bp rp` with defaults `slab 144 120 4 16 8 12 96 48 7 11 3 1 10 80 0 0`. They become permanent when G1 merges.
- OA3: the waste default `10` is a rule of thumb the user can change, never a standard (per spec).
- OA1 (S2): the yield source is the QUIKRETE Concrete Mix No. 1101 data sheet, URL `https://www.quikrete.com/PDFs/DATA_SHEET-Concrete%20Mix%201101.pdf`, retrieved `2026-10-25`, as stated by the spec.

## Mutation results (affected shards, all 100.00)

| Run | Shard | Mutants | Score |
|---|---|---|---|
| S1 | units | 219 (geometry 6) | 100.00 |
| S2 | data | 160 | 100.00 |
| S3a | calculators | 136 (concrete 97) | 100.00 |
| S3b | calculators | 174 (concrete 135) | 100.00 |
| S4 | calculators | 186 (concrete 147) | 100.00 |
| S5 | calculators | 193 (concrete 154) | 100.00 |
| S5 | units (again) | 219 | 100.00 |

The calculators shard is at 193 mutants, well under the ~400 split threshold, so no `calculators-<group>` split was made. The final full run of all eight shards is recorded in "G1.2" below.

## Per-slice evidence

### S1: geometry
- Commit `90d9576`. Files: `packages/core/src/geometry/{pi,circle,index}.ts` and tests (`pi.test.ts`, `circle.test.ts`, `circle.property.test.ts`), barrel export plus `index.test.ts` pin, `stryker.config.mjs` (core: kernel and `units` shard; data: deps), `.github/workflows/ci.yml` (`packages/core/src/geometry/**` in the eight matrix entries that hold core inputs), `apps/web/src/contract/pi-scan.contract.test.ts`.
- Scenarios proven: GEO1, GEO2, GEO3, GEO4, GEO5, GEO6, GEO7.
- Negative proofs (run, reverted, tree clean): last digit of `PI` `...288` to `...289` (GEO1 and GEO2 fail); negative-radius check removed (GEO6 fails); `export const leak = Math.PI;` added to `geometry/index.ts` (GEO3 names the file).
- RED evidence: the three geometry test files failed with `Cannot find module` before the code; the identity and exactly-once mutation contracts failed naming `src/geometry/` before the config edit (10 failures), green after.

### S2: data
- Commit `a8e5c53`. Files: `packages/data/src/yields/concrete-mix.ts`, `materials/concrete-mix.ts`, `index.ts`, `package.json` (`./yields/*`), tests under `packages/data/src` and `apps/web/src/contract/data-yields.contract.test.ts`.
- Scenarios proven: MDC1, MDC2, MDC3, MDC4, MDC5, Dependency direction.
- Negative proofs: `Rational.of(3, 5)` to `3, 6` (yields and record tests fail); the text `http` appended to the yields file (MDC5 text check fails); a record built with fresh `Quantity` objects (identity assertion `toBe` fails). All reverted.

### S3a: factory, 17 tuples, registry, catalogs
- Commit `4d55474`. Cut choice recorded (judge's cut): S3a = factory with all 17 inputs, slab only, volume outputs and the forced coupling; S3b = yield validation, bag line, costs, drift guard, material keys.
- Scenarios proven: CC1 (inputs and four outputs), CC2, CC3, CC4, CC7, CC8, CC12 (volumes), CC16 (volumes), CC30 (volumes); ICW10 (partial), ICW12 (derived rows).
- Negative proofs: `waste` default 10 to 12 (descriptor, snapshot and volume tests fail); `sh` renamed to `s` (the CC2 contract fails: `holds for every released calculator`); the Spanish `inputs.width` label removed (completeness names `calc.concrete.inputs.width: missing in es`). The "import the data root" proof is left to the S11b graph contract, as the task says. All reverted.

### S3b: bags, costs, drift guard
- Commit `aaf78e9`. Scenarios proven: CC1 (six outputs, one shopping line), CC5, CC6, CC12 (zero bags), CC14, CC16 (bags), CC19, CC20, CC21, CC30 (bags: 74 bags of `bag-80` through the registry); ICW10 (full set at that point), ICW11 (material part), ICW12, ICW14, ICW15.
- Negative proofs: net volume feeds the bag count (CC14 fails); bags priced by volume (CC19 fails); `BAG_YIELDS` check dropped (CC5 fails, seven cases); one yield changed in the data subpath alone (CC6 names the side); `units.bag-60` removed from the Spanish catalog (ICW14 names the key). All reverted.

### S4: footing and column
- Commit `84263aa`. Scenarios proven: CC2 (options), CC9, CC10, CC13, CC15, CC17 (C1, C2, S3, Z), CC22 (15 cases), CC23, CC24; ICW12 (footing and column rows).
- CC22 to CC24 are characterization tests (green on arrival); spot checks: `length` maximum 1000 ft to 1001 ft made the `1001ft` case and the descriptor test fail, restored.
- Negative proofs: diameter used as radius (CC10 and CC17 fail); `count` forgotten in the footing (CC9, CC15 fail); the shape option renamed to `Footing` (the transform fails). All reverted.

### S5: steps, properties, language-free, URL
- Commits `7d01dcb` (steps, properties, language-free, maximum, final tuple and catalog) and `cf2af4c` (url test, the contingency move into the S6 position so that S5 stays under 400).
- Scenarios proven: CC2 (final), CC11, CC12 (maximum displayed 370370.37 yd3 and 283168.47 m3), CC17 (T1), CC18, CC25 (P1 to P10 plus P11 bag cost), CC26, CC27, CC28, CC29 (1,000 random states per unit system); ICW10 final (43 required keys: title, 17 inputs, 4 shape options, 3 bag options, 6 outputs, 12 errors), ICW12 (steps row).
- Negative proofs: `N(N+1)/2` to `N*N` (CC11, P7 fail); waste not applied before the bag ceiling (CC14, CC16 fail); `ns` url key renamed (CC2 released contract, CC28 fail). All reverted.
- SQ21 mutation measurement: calculators shard 193 mutants, 100.00.

### S6: size probe (SQ27), BLOCKED
- Commit `a21055a`: `vite` pinned exactly to `8.3.5` in `apps/web/package.json` (devDependency), `package-lock.json` updated, `apps/web/src/contract/vite-version.contract.test.ts` (RED seen: not declared; GREEN after install). `npm install --save-exact` resolved offline; `npm ci` was not run.
- The probe (`client-size.contract.test.ts` and helper `client-build.ts`) was written and run (RED, then measured) but is NOT committed because it cannot be green. Copies are in the session scratchpad: `/private/tmp/claude-501/-Users-rodrigocollins-maestro-calc/4af92fd9-f973-466f-8762-b76010da1c78/scratchpad/s6-probe/`.
- Measured size of the engine surface (`concrete` from `lib/concrete.ts`, `encode`, `decode`, `toDecimalParts`, `toCents`, `formatFeetInches`; Vite 8.3.5 library build, minify on, target `esnext` as Astro's client build): **28,457 B** against the 24,576 B limit (3,881 B over; only 4,311 B would remain for the page code against the 32,768 B graph budget).
- Module breakdown (rendered bytes): `calculator/define.ts` 4,923; `calculators/concrete/concrete.ts` 4,775; `rational/rational.ts` 3,526; `format/length-parser/parser.ts` 3,516; `url/codec.ts` 3,448; `calculator/validate.ts` 3,314; `calculator/run.ts` 2,758; `units/catalog.ts` 2,698; `format/length-parser/scanner.ts` 2,617; `url/url-values.ts` 1,486; `calculator/constraints.ts` 1,297; the rest under 1,100 each. `@maestro-calc/data` contributes only `yields/concrete-mix.ts` (226 B).
- Mitigation ladder (C17), in order:
  1. Keep `defineMaterial`, the record and the data root off the client path, confirm `sideEffects: false` tree-shaking: already the case. The module list holds no `material.ts` and no source text; the seeded test (an entry that also exports `concreteMix` from `@maestro-calc/data`) proves the check works (the output then holds QUIKRETE and `https://`). No size gain.
  2. Stop pulling unused parsers through barrel re-exports: tested by importing the same functions from their own core modules (`url/codec.ts`, `format/feet-inches.ts`, `money/money.ts`, `format/decimal-parts.ts`) instead of the barrel: 28,447 B, a 10 B difference. The barrel is not the cause; every retained module is reachable from the API the entry needs. Narrow core subpath exports would not help.
  3. Drop client use of length-parser branches the page never accepts: not possible, CP24 needs the full parser (6.1 KB for parser and scanner).
  4. STOP and report `blocked` for an owner decision. Inlining and raising the budget are never options.
- Candidate reviewed core changes the owner may weigh (none attempted, each is a core design change with unproven gain): split `units/catalog.ts` so unused mass and density units are tree-shaken (about 1 to 1.5 KB, but `define.ts` references the full `UNITS` table), lighter definition-time validation on the client, or precomputed calculator metadata. None alone closes 3,881 B.
- Lint note for whoever resumes: `apps/web/src/contract/client-build.ts` (a non-test helper that imports `vite`) is flagged by `import-x/no-extraneous-dependencies` ("should be listed in dependencies, not devDependencies"); the helper needs a name or location the lint treats as test support.

## Deviations from the tasks (reality over assumption)

- Test file placement: the lint boundary forbids `node:*` inside `packages/core` and `packages/data`, tests included. The GEO3 scan (task 1.5 `geometry.scan.test.ts`) lives at `apps/web/src/contract/pi-scan.contract.test.ts`, and the MDC5 source-text and package-manifest assertions (tasks 2.1, 2.3) live at `apps/web/src/contract/data-yields.contract.test.ts`.
- Task 1.7: the mutation identity, exactly-once and CI-key contracts already derive everything from the filesystem and the import graph; no new assertions were needed, and they failed naming `src/geometry/` before the config edit (RED), so they were not duplicated. The CI inputs were inserted alphabetically (after `format/**`) rather than after `units/**`, because the CI-key contract compares sorted lists and the existing lists are alphabetical.
- Task 2.3: the old `Empty registry [MD4]` assertion moved from `material.test.ts` to the new `index.test.ts` and was replaced by [MDC1] (rename per the RENAMED requirement).
- Commits: the planned test-then-code commit pairs were merged into one green work-unit commit per behavior, because a commit holding only RED tests would leave the tree red. S3a is a single commit instead of three: the registry-equals-directories, released-snapshot and catalog-completeness tests couple the factory, the tuples, the web registry and the catalogs, so no smaller green split exists.
- Task 3a.5: `compareReleased` does not report a registered calculator with no tuples (it checks only calculators that have tuples), so the "REGISTRY row first, see 17 tuples missing" RED step was not observable in core; the web `released.contract.test.ts` is the test that requires tuples for a registered calculator. The 17 tuples and the registry row were added together. The existing rectangle-area assertions in `released.contract.test.ts` (core and web) were scoped to the `rectangle-area` tuples; nothing was weakened.
- Task 3a.2/3b.6: the core fixture is also exported as the test-support subpath `@maestro-calc/core/testing/concrete-yields` (and listed in `manifest.contract.test.ts`), so the web drift guard can import it; the CI inputs and the `calculators` shard deps list the file.
- Task 3b.7: the ICW15 extra-key check needed a runtime helper (`extraKeys` in `contract/missing-keys.ts`, with `materialsBoughtBy`); the material keys allowed for a calculator are those of the materials on its default shopping list.
- The S3a/S3b `concrete` module holds the material keys already in S3b as the tasks say; `calc.concrete.page.*` keys are not allowed yet (S7).
- Task 4.4 characterization tests live in `concrete.validation.test.ts`; the language-free case in `concrete.language-free.test.ts`; both new files instead of growing `concrete.test.ts`.
- S5 contingency used: `concrete.url.test.ts` is a separate commit (`cf2af4c`) counted on top of S5; S5 without it is 355 lines. Task 5.9: no calculators shard split (193 mutants).
- S6: see "S6 size probe, BLOCKED".

## Size (SX2)

Changed lines from `git diff -M --numstat <previous tip>..<tip> -- . ':(exclude)package-lock.json'`: S1 199, S2 223, S3a 750, S3b 535, S4 203, S5 355 (+ url test 106 = 461), S6 pin 29. S3a and S3b exceed the 400 cap and S5 with its url test is 461. The forecast for S3a/S3b was too low (the 17 `RELEASED` tuples alone are 121 formatted lines, the shape test 120, the core and web contract updates and the catalogs came on top); no green split exists for S3a (coupling), and S3b's contract/catalog tests are inseparable from its code. The group PR is above 400 by the owner's decision; flagged for the GX3 reviewers.

## G1.2 Full mutation run (all shards, as CI)

All eight shards, one after the other, on the tip `a21055a` (no source change since the S5 runs): rational 202 killed + 7 timeout (209 mutants), units 219, format 409, calculator-define 460, calculator-run 153, url 286, calculators 193, data 160. Every shard 100.00, exit 0. Logs: `mut-final-<shard>.log` in the session scratchpad.

G1.3 / GX1 to GX5 (push, CI, four reviewers, Judgment Day, PR against `main`): deferred to the orchestrator.

## Owner decision: raise the JS budget (2026-10-25)

After the S6 probe measured 28,457 B against 24,576 B, Rodrigo decided to raise the budgets: client entry graph at most 49,152 B (was 32,768), engine probe at most 40,960 B (was 24,576), leaving 8,192 B for page code; page weight stays 196,608 B. Core slimming is a recorded follow-up. Specs (site-quality, calculator-page), design.md ("Budget decision"), proposal D3, tasks.md and state.yaml were amended in one docs commit. The BLOCKED status of S6 above is superseded.

## S6 completed (after the budget decision)

- Probe committed: `apps/web/src/contract/client-size.contract.test.ts` with helper `apps/web/src/contract/__testing__/client-build.ts` (the `__testing__` directory is test support for the lint, so the vite import is allowed there with no config change).
- Measured size: **28,457 B** against the new cap **40,960 B** (12,503 B of headroom; the page-code allowance of 8,192 B fits inside it).
- Spot checks (reverted): cap set to 28,000 fails with `expected 28457 to be less than or equal to 28000`; extra unused core exports in the entry (29,752 B) fail against a 28,500 cap.
- Deviation: the helper lives under `contract/__testing__/` instead of `contract/client-build.ts`.
- No core or data file changed after the final mutation run, so no mutation re-run.
- G1.3: GX1 `verify` is green locally and GX2 is clean; push, CI, reviewers, Judgment Day and the PR stay with the orchestrator.
