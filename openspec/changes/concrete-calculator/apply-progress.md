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

## G1 correction round 1

All four review lenses passed; this round folds their findings. Base `12ea373`.

| Finding | Commit | Change |
| --- | --- | --- |
| R1-1 / RD-1 / RES-1 | `fed82ad` | `.bak` removed from git, `*.bak` ignored, gates contract assertion |
| RD-2 | `545c16a` | one `SHAPES` and one `BAG_SIZES` feed descriptors, types and a `Record<Shape, fn>` table (the switch is gone); `stepsVolume` above its user. `Dimensions` stays hand-written (the inferred input type is not reachable from `compute`'s parameter without a larger change), only its `shape` is derived |
| REL-1 | `0d461fe` | steps triangular number built with `Rational` (`n.mul(n.add(1)).div(2)`) |
| RD-5 | `455e37d` | bag key decision below |
| RD-4 | `b89c7d6` | `inches`, `cents` and the state arbitrary in `packages/core/src/__testing__/concrete-arbitraries.ts`; listed in the `calculators` shard `deps` and in the CI inputs |
| RD-3 | `eb78912` | ICW10 comment says final (17 inputs, four shapes, six outputs) |
| RES-7 | `5586992` | AGENTS.md: a concrete-sized calculator adds about 190 mutants, split after about 2 |

### Bag key decision (RD-5)

One convention, the purchase unit id `bag-<n>`: core `BagYields` is `Record<'bag-40' | 'bag-60' | 'bag-80', Quantity<'volume'>>`, data `CONCRETE_MIX_YIELDS` already was, and the shopping line `purchaseUnit` is the same string, built by one helper (`bagUnitOf`) that also looks the yield up. The web root passes `CONCRETE_MIX_YIELDS` straight to `createConcrete` (no remap) and the drift guard compares by id (no regex, `yieldsOfSubpath` removed). The select option ids (`bg=40|60|80`), `RELEASED` and every spec'd purchase unit id are untouched. The spec (calc-concrete Yield injection), design C2 and task 3a.6 were amended to the new key set; this is a core API key rename, not a URL change.

### Results

- `npm run verify` exit 0: 148 test files, 2536 tests (unchanged count; one gates test added, one test moved nowhere).
- Mutation: calculators 179 mutants (140 in concrete.ts, was 193 before the table refactor), 100.00; data 100.00 (no data source changed); other shards have no changed inputs. Logs: `c1-*.log` in the session scratchpad.

### Follow-ups (out of scope)

RD-6 (AGENTS.md factory recipe, G3 S12), RD-7, RD-8 (Title Case labels and "Number of pieces" are spec-mandated; owner copy review), RD-9 (ci.yml anchors), RES-2 (URL contract is frozen at merge: owner approval OA2 requested by the orchestrator before merge; codec v2 is the escape hatch), RES-3 to RES-6, REL-2.

## G1 Judgment Day

Both blind judges returned **APPROVED** on `477fb75..c574bdf` (no CRITICAL or MAJOR). Both recomputed the default slab (74 bags of 80 lb) and a column or steps case by hand, and confirmed the 17 released URL tuples against the spec. The stale size-probe comment (both judges) is fixed in the same commit as this note.

### Follow-ups for group 2 (do first)

- **JD-1 (A, B)**: `createConcrete` keeps the caller's yields object after validating it; snapshot the three validated volumes into a frozen local record and turn a `null`/non-object argument into `BAG_YIELDS`, with tests.
- **JD-2 (A, B)**: hand-kept per-calculator lists (`calculators.test.ts` id literals, the concrete key literal in `i18n-contract.test.ts`, `MaterialKeys<typeof concreteMix>`, the `testing/*` fixture exports, the `calculators` shard `deps`, the CI inputs and the manifest list) contradict "Nothing else is kept by hand"; derive what can be derived (directory listing, `requiredKeys`, a `src/__testing__/*-yields.ts` glob) and document the rest in the AGENTS.md factory recipe (G3 S12).
- **JD-3 (B)**: property tests P1, P2 and P10 mirror the implementation; add one independent oracle (a bigint-only integer slab computation).

---

# Apply progress: concrete-calculator (G2 unrouted page parts)

Branch `feat/concrete-g2-page-parts` (created from `main` `1691d83`, which contains merged G1; all G2 slices are work-unit commits on this one branch, no push, no PR). Strict TDD. Invariant (DR-5): nothing in G2 routes the page; `concrete` stays in `PAGELESS`.

## G2 status

| Slice | Status | Tip | Tests after `verify` | Changed lines (forecast) |
|---|---|---|---|---|
| JD-1 snapshot of the yields | done | `fdd80f9` | 2,547 (after JD-3) | see JD |
| JD-2 derived lists | done | `05f1bf1` | 2,547 | see JD |
| JD-3 bigint slab oracle | done | `38f5027` | 2,547 | see JD |
| JD total | done | `05f1bf1` | 2,547 | 229 |
| S7 presenter and copy | done (four commits, each at most 400) | `ff198ce` | 2,694 | 1,162 (~400): 123 + 333 + 399 + 307 |
| S8 body, parts, styles, budget | done (seven commits, each at most 400; two correction commits follow) | `38f5358`, then `2c47f88` | 2,768 | 1,863 (~400): 348 + 169 + 317 + 290 + 292 + 267 + 180 (+ 167 + 406 corrections) |
| S9 templates, check:site, CSP | done (nine commits, three above 400) | `2515838` | 2,913 | 2,856 (~400) |
| S10 collection, copy, faqOf, JSON-LD | done (five commits, one above 400) | `447ebcc` | 2,983 | 946 (~400): 177 + 152 + 163 + 423 + 69 |

## G1 Judgment Day follow-ups (done first, own commits)

- **JD-1** (`fdd80f9`): `createConcrete` snapshots the three validated volumes (read once each, `Object.freeze`) and a `null`, `undefined` or non-object argument throws `BAG_YIELDS`. Tests: null, undefined, number, string, an inherited key beside an own extra key, a post-validation mutation and a getter that returns a different value on its second read (`reads` is 1). RED seen: 4 failed (null, undefined, mutation, getter). Mutation `calculators` shard: 183 mutants, 100.00 (concrete.ts 144).
- **JD-3** (`38f5027`): property P12 in `concrete.property.test.ts`: slab in eighths of an inch, waste in tenths, bag yields written as 2592/5, 3888/5, 5184/5 in3, all `bigint`; checks the total volume (cross-multiplied against `num/den`) and the bags with an integer ceiling. Spot check: waste divisor `HUNDRED` changed to 101 fails P1 and P12 (reverted).
- **JD-2** (`05f1bf1`): derived what can be derived: `calculators.test.ts` no longer lists the ids (concrete once, the directory listing equals the registry); the ICW10 test derives the convention keys from every calculator's descriptors (`conventionKeys`) and pins only the spec count 43 for concrete; the `calculators` shard `deps` and the CI inputs name the per-calculator test support by pattern (`src/__testing__/*-arbitraries.ts`, `*-yields.ts`), with a new contract that the globs match the files, that the shard holds them and no other shard does, and that no dep names a calculator. Mutation `calculators` after the config change: 183 mutants, 100.00.
- **Left by hand, for the AGENTS.md recipe (G3 S12)**: (1) the English module imports in `apps/web/src/lib/i18n-contract.test-d.ts` (`EnglishKeys`; a type cannot read a directory), plus its `MaterialKeys<typeof concreteMix>` union and the new `ConcretePageKeys` union; (2) the `./testing/<name>` subpath in `packages/core/package.json` and the explicit list in `manifest.contract.test.ts` (deliberately no wildcard, PR 12 review R1-3); (3) `RELEASED` and `REGISTRY` (append-only by design); (4) `released-snapshot.ts` in the shard deps (one file for all calculators); (5) the web `calculators.ts` list.

## S7: presenter and catalog copy

Commits (work-unit split inside the S7a/S7b contingency, because the presenter with its tests is 867 lines): `ab2d2f6` number and money text (123), `0f146b6` length, field and bound text with the round-trip property (333), `17875b1` figures and answer values (399), `ff198ce` i18n page copy and `site.calculator.*` (307). Each commit is green.

- Scenarios proven: CP1/CP2/CP3 values (default figures through the engine), CP15 order, CP16 (`$481.00`, `$244.44`), CP18 (`2.72`, `$407.41`), CP19 to CP22 table (10 rows through the engine), CP24 engine side, CP31 bound formatting (`1,000 ft`, `50%`, `1,000`, `$10,000.00`, metric `304.8 m`), CP33 text and sentences, CP34 codec side (`l=20000/127&w=15000/127&t=500/127`), CP50 round trips (three properties, 1,000 runs each, both unit systems, both directions); ICW11, ICW12 (page rows included), ICW13 (placeholders, openings, endings), ICW17 (eleven keys), ICW18 (the `concrete` module and `site.calculator.*` are scanned, with a seeded `Elegí` that is reported).
- `apps/web/src/calculator/**` is covered at 100 (`coverage.contract.test.ts` first, then `vitest.config.ts`).
- Negative proofs (run, reverted): grouping `,` swapped for `.` (12 tests fail); `moneyText` rounding down (3 fail); `{bags}` removed from the ES footing sentence (5 fail across catalog and web completeness); `Ingrese` in `site.calculator.copyFailed` (3 fail: register and catalog).
- `rg -n "from '@maestro-calc/i18n'" apps/web/src/calculator` is empty.

### Deviations (S7)

- API names are the design's own (the tasks give no signatures): `figuresOf(state, result, yields, system)` takes the state and the bag yields, returns texts, cost visibility and the volume order (not a filled sentence; the caller does `fillMessage(template, { yield: figures.bagYield })`); `answerValues(state, result, system, templates)`; `fieldText(length, { defaultUnit, metricDefaultUnit }, system)`; `boundText(descriptor, bound, system)`.
- `dimensionText` depends on the value only (US `1 ft 4 in` for 16 in, 1/64 rounding; metric metres from 1 m else centimetres), while `fieldText` depends on the field's default unit (`16 in` in an inch field, `12 ft 6 in` in a foot field). So the footing sentence reads `1 ft 4 in` where the field reads `16 in`.
- Footing, column and steps sentences are authored (no plural form needed): `Footing ({length} long, {width} wide, {depth} deep, count {count}): ...`, `Column ({diameter} diameter, {height} tall, count {count}): ...`, `Steps (count {stepCount}, {stepWidth} wide, {rise} rise, {run} run): ...` and the Spanish counterparts. They are copy for the owner to review.
- The ICW10 web test now derives the convention keys per calculator instead of listing 43 literals (JD-2), and `extraKeys` allows `calc.<id>.page.*` of that calculator.
- Size: forecast 400, actual 1,162; the group PR is above 400 by the owner's decision, the unit of review is the commit (all at most 400).

## S8: CalculatorBody, parts, styles, HTML budget proof

Commits (the S8a/S8b contingency, cut further because the slice is about 1,860 lines): `7af7c7e` shopping/breadcrumb/source parts with the model types and `shapes.ts` (348), `afc7b52` result panel (169), `c5fb21e` the view builder `lib/calculator-page.ts` (317), `785a5fa` the form (290), `1505418` the container (292), `1f0b4e2` `styles/calculator.css` and its contract (267), `38f5358` the budget proof (180). Each commit is green; `npm run verify` at the tip: 161 files, 2,747 tests.

- Scenarios proven (static, by rendering): CP1, CP2, CP3 (figures equal `run({})` of the registry calculator rounded), CP4 (six `data-output` in order plus one `data-shopping="bag-80"`), CP5 (breadcrumb `ol[aria-label]` before the H1, the result `h2`, no `nav`), CP8 source side (`SourceList`: name, link, retrieval date, exactly one `time` equal to `updated`), CP11 static (four groups, only the slab visible, `aria-pressed`), CP12 (labels from the catalog, `inputmode`, `autocomplete="off"`, no submit), CP15, CP17, CP40 static (note visible, outside `<noscript>`, exact EN and ES text), CP41 static (every input and button `disabled`, copy and steppers `hidden`), CP43 (12 error templates with `{min}`/`{max}`, 4 sentences, 2 copy states), CP44 static (reserved `data-reserved` areas: answer, notice, shape, steppers, copy).
- HTML budget proof (SQ7, C18, DR-16): first written as a render in the test container (`38f5358`, measured 37,754 B). That figure was wrong: the container emits neither the inlined global CSS nor the minified font CSS, so it under-reported by about 2.8 KB. The proof was rewritten (`2c47f88`) to build the site with the production pipeline plus an injected placeholder route and to measure the real file; see "S8 budget correction" below.
- Negative proofs (run, reverted): a cost row un-hidden (2 fail), `disabled` dropped from the shape and unit buttons (2 fail), the messages moved out of `<template>` (1 fails), the note moved into `<noscript>` (3 fail).
- `npm run build` still builds 14 pages; `rg -l -i "calc-result|concrete" apps/web/dist` finds nothing (nothing routed, `concrete` stays in `PAGELESS`).

### Deviations (S8)

- Styles are the global `styles/calculator.css`, imported by `CalculatorBody.astro`; `styles.contract.test.ts` now expects the three stylesheets by name (it pinned a count of two).
- The page text is resolved by `apps/web/src/lib/calculator-page.ts` (`concreteView(locale)`), the only module that joins the engine, the presenter and the catalogs; the container and parts stay catalog-free. Hidden shape groups render their own inputs (ids `calc-<shape>-<key>`, `name` is the field key), so `length` and `count` appear in two groups each; the controller (G3) keeps them in step.
- Cost rows come as two elements per cost (the row, hidden without a price, and the hint line, hidden with one) so that the price hint can be addressed per row; the `data-price-hint` text is the catalog `priceHint` exactly.
- `SourceList` shows the retrieval date as plain text and the review date as the one `time` element, so `time[datetime]` equals the entry's `updated` (CP8); no catalog word for "retrieved" exists in the ICW17 key set, so the Sources section copy (S10) carries that wording.
- The unit hint next to each label is not rendered: the field text itself carries the unit (`12 ft`), and the spec's key set has no hint key.
- CSS reserved sizes (`7.5rem` answer, `9rem` notice, four rows of `6rem` for the shape area, `5rem` copy) are estimates from the longest sentences; the CLS e2e in G3 measures them.

### S8 budget correction (HTML, ladder of task 8.5)

- The production-pipeline proof (`CalculatorBody.budget.test.ts`, support in `contract/__testing__/budget-{copy.ts,page.astro}`) injects a route into the real Astro build (`injectRoute`, output to a temporary directory, about 1.5 s) and measures `zz-budget/<locale>.html`: BaseLayout, `CalculatorBody`, 1,500 words in five sections, 8 FAQ answers, a JSON-LD graph with the same FAQ text, the 18 templates and the inlined CSS. Placeholder prose averages 5.0 letters per word in English and 5.2 in Spanish (natural 4.7 and 5.0), so it is slightly heavier than real copy.
- First measurement: **42,321 B (EN), 42,603 B (ES)** against 40,960 B, over. Ladder: (1) one list of dimension inputs instead of four groups and no `type="text"`: 650 B saved; (2) not applied (the bytes would only move into templates); (3) FAQ answer cap lowered from 600 to 450 characters by a recorded pipeline decision (design "Budget decision: HTML", specs and tasks amended): 2.4 KB saved. Final: **39,268 B (EN), 39,517 B (ES)**, margin 1,692 B and 1,443 B (4.1 and 3.5 percent). The budget was not raised; the words cap stays 1,500.
- The seeded test adds more copy than the headroom and requires the HTML to exceed the budget in both locales.
- For whoever writes the copy (S10): the ES page has 1,443 B of headroom at the maximum copy, so the entries must stay at or under the cap in words and FAQ characters; check:site will fail the build otherwise.

## S9: templates, check:site template rules, CSP, `assetsInlineLimit`

Commits (the S9a/S9b contingency, cut into work units): `8bd20f8` template lists with `PAGELESS` and the SR17 contract (180), `794091f` CSP `script-src 'self'` and `assetsInlineLimit` (92), `83e6f0a` calculator script rules and the JavaScript files of dist, with the graph walker and the calculator fixtures (551), `eecd34a` JavaScript graph budget and per-template weight (297), `5edd7b8` bundle facts and platform-injected scripts (189), `d9a5940` calculator JSON-LD, FAQ parity, sections, breadcrumb and source links (880), `2515838` CLI wiring and source-link parsing (120). Between them, `b4f027d` (167) and `2c47f88` (406) are the S8 budget correction above. `npm run verify` at the tip: 165 files, 2,913 tests. `npm run build && npm run test:e2e`: 110 passed, the live site is unchanged (14 pages, no script, only `_headers` differs in `dist`).

- Scenarios proven: SR17 and SR18 logic (templates and contract with the four seeded failures), SS18, SS20 (one module script from `/_astro/`, both locales share the entry), SS22 (inline script, second `<script src>`, `onclick`, foreign origin, `/privacy` script), SS23, SQ6 (summary with the calculator JavaScript line), SQ7, SQ8, SQ12, SQ13, SQ22 to SQ24 (49,152 edge, imports counted, own weight ceilings), SQ26 gate side, SQ28 rule side, SE8, SE18 to SE23, CP5 built side (breadcrumb list before the h1, five sections in order per locale, h3 only inside the FAQ), CP8 built side (one `time` equal to `updated`), CP42 and CP47 rule sides, TP12 unchanged; the templates and the rules derive from `templateOf` and the injected lists, never from the HTML.
- Negative proofs (run, reverted): static-page script guard removed (4 fail), the import graph left out of the budget (5 fail), CSP widened to `'unsafe-inline'` (2 fail), `concrete` listed in both lists (SR17 names it twice).
- 9.10: `rg -n -i "javascript|no scripts|sin scripts|sin javascript|script" apps/web/src/content/pages` finds nothing, and the privacy sentence "no forms ... nothing about you in your browser" is still true while no page is live; nothing needed fixing (the privacy update is S12).
- `CALCULATOR_PAGES` is empty and `PAGELESS` is `['rectangle-area', 'concrete']`: nothing is routed.

### Deviations (S9)

- Site-check API: `Site` gained optional `calculatorPages` and `externalLinks`; `assetProblems`, `budgetProblems`, `budgetSummary` and `factProblems` take the site (or pages) as a defaulted extra argument, so every existing call and fixture is unchanged. The CLI builds `catalogs` from common plus site (the bundle samples `errors.DECIMAL_COMMA` and `site.calculator.copyLink` live in both).
- The global `storage` rule now also bans `sessionStorage` and `indexedDB` in every built file (the privacy page says nothing is kept in the browser); the calculator-only rule bans `fetch(`, `XMLHttpRequest`, `sendBeacon`, `WebSocket`, the two sample messages per locale and `http://maestrocalc.com`. The foreign-origin URL case reuses the existing `third-party-origin` rule (TP12).
- The old `js-file` rule (no JavaScript file in dist) became: only under `_astro/`, and reachable from a calculator page by static imports (an entry that only dynamic-imports a chunk would dodge the byte budget, so that chunk is reported). The test message changed accordingly; the file is still named.
- The tests of the byte budget read "entry 20,000 + import 20,000 > 49,152" in the spec; the arithmetic is 40,000, so the fixture uses 30,000 + 20,000 = 50,000.
- Size: forecast 400, actual 2,856 over nine commits. Three commits are above 400 (551, 880, 406) because the fixtures, the rule and its tests are inseparable (the 100 percent coverage gate on `site-check` and the calculator fixtures are shared); flagged for the GX3 reviewers. The S8 correction commits sit after the first S9 commit in the history.

## S10: `calculators` collection, EN/ES copy, `faqOf`, `calculatorJsonLd`

Commits: `d3eb0e2` the collection and `calculatorSchema` (177), `f5a2d36` `faqOf` (152), `4dc4bad` `calculatorJsonLd` (163), `2053854` the two entries with their content contract (423, above 400: the contract needs both locales to be green), `447ebcc` the pending count of the new collection and the worked-example guard (69). `npm run verify` at the tip: 168 files, 2,983 tests. `npm run test:e2e`: 110 passed, the site is unchanged.

- Scenarios proven: CP5 source side (five `h2` ids per locale, in order), CP6 (the strict schema rejects `sources: []`, an unknown review state, a day-first date, an `http` source url, a worked example without `bags`, and `npm run build` exits non-zero naming the entry and the field), CP7 (missing `es` counterpart named, duplicate `(concrete, en)` named), CP8 and MDC4 (the QUIKRETE source equals `concreteMix.source` in name, URL and date; a NIST SP 811 Appendix B source with a retrieval date; no `ownerReview`, `draft`, `borrador`, `pending review` in a body), CP9 (the worked example equals the engine through the page builder and every figure `40.00`, `44.00`, `1.63`, `74`, `80` is in the Formulas section, with the three one-sided changes failing), CP10 (1,339 words in EN, between 800 and 1,500 in both, equal `h2` and FAQ counts, 8 plain-text answers of at most 450 characters), the Spanish register, the rule-of-thumb and approximate wording and the methodology links; SE19 and SE20 builder side (`calculatorJsonLd`: three types, `Home`/`Inicio`, no offers, rating, review or image, no `</script>` once serialized).
- 10.10 negative proofs (run, reverted): `sources: []` in the English entry (the build fails: `calculators → en/concrete data does not match collection schema`, `sources: Too small: expected array to have >=1 items`); `bags: 75` (CP9 fails); a 851-character answer (`faqOf` fails naming the question).
- G2.1 production-consistency review of the tip: `npm run build` builds 14 pages, no JavaScript file, CSP `script-src 'self'`; `rg -i "calc.concrete|concrete|calc-result|concreto"` over `apps/web/dist` finds nothing (the entries and keys are not rendered). `concrete` stays in `PAGELESS`, `CALCULATOR_PAGES` is empty.

### Deviations (S10)

- `calculatorSchema(ids)` is a factory (the registry ids come from `content.config.ts`), and the NIST source is the landing page of SP 811 (`https://www.nist.gov/pml/special-publication-811`) because no deeper stable URL could be verified offline; its `retrieved` date is the pipeline date `2026-10-25` like the QUIKRETE one. Both are for the owner to confirm in the pending review.
- The Sources section copy carries the "retrieved" wording (no catalog key exists for it); the retrieval dates render as plain text and the review date is the one `time` element.
- `astro-modules.d.ts` now declares the one function the test program needs from `astro:content` (`defineCollection`), so `content.config.ts` can be unit tested without the Astro program.
- The FAQ cap is 450 characters (design "Budget decision: HTML"). The ES entry has 1,443 B of HTML headroom at the maximum copy; the real entries are 1,339 words (EN) and about the same in ES, so there is margin.
- The two content commits were merged with their contract test into one (423 lines), because a contract test that needs both locales cannot be green with one entry.
- An accidental `git stash pop` (the stash list holds two older stashes of other branches) applied the top old stash and conflicted in three files; the three files were restored from HEAD and no stash was dropped. No code or history was lost (`git diff HEAD` empty for tracked files).

## G2 results

- Commits: `git log 1691d83..HEAD` on `feat/concrete-g2-page-parts` (all work-unit commits; no push, no PR). History hygiene: no `Co-Authored-By`, `claude`, `anthropic` or `generated with` in the messages.
- `npm run verify` at the G2 tip: exit 0, 168 test files, 2,983 tests (baseline at the G1 tip: 148 files, 2,536; JD added 11).
- `npm run build && npm run test:e2e` after S9 and after S10: 110 passed each time, the built site is unchanged (14 pages, no script).
- Mutation: `calculators` shard 183 mutants, 100.00 after JD-1 and again after JD-2's config change (concrete.ts 144 mutants); no other core or data source changed in G2.
- HTML budget (calculator page, production pipeline): 39,268 B (EN), 39,517 B (ES) of 40,960 B.
- Remaining for the orchestrator: G2.2 / GX1 to GX5 (push, CI, four reviewers, Judgment Day, PR against `main`).

## G2 correction round 1

All four lenses passed; these are the folded findings. Thirteen commits on top of `10db593` (52 files, 661 insertions, 323 deletions; the check-context refactor `35f2b8c` is mechanical and above 400 lines). No core or data source changed, so no mutation run. `npm run verify`: exit 0, 170 files, 3,025 tests (was 168 and 2,983), site-check coverage 100. `npm run build && npm run test:e2e`: 110 passed, the built site is unchanged (14 pages, `concrete` and `calc-result` absent from `dist`). `CALCULATOR_PAGES` is still empty and `concrete` stays in `PAGELESS`.

### Finding to commit

| Finding | Commit |
|---|---|
| REL-1 (`12 ft 1/64 in`, kills the `<= 32n` mutant), REL-2 (`1/8192 in` and the 12-place `0.006201171875 mm` boundary), REL-8 (`<1/64 in`, `<0.01 cm`, `1.00 m` from 0.995 m) | `4bd2382` |
| RD-8 (`lib/calculator-page.ts` is now `lib/concrete-page.ts`; `registryIds` throws on an empty registry) | `d1d2ceb` |
| RD-2 (JSON-LD home name from `site.calculator.breadcrumbHome`), RD-3 (home link uses `routes`), RD-4 (`content/faq-shape.ts`: limits, section ids, one `FaqItem`), REL-9 (faqOf straightens quotes) | `2936c80` |
| RD-1 (`CheckContext { pages, dist, site, sizes }` to every rule group and `budgetSummary`; `calculatorPages` and `externalLinks` required on `Site`) | `35f2b8c` |
| REL-9 (parity folds quotes, ellipsis and dashes on both sides), RD-2 (site-check keeps `HOME_NAME` as a documented oracle), RD-4, RD-5, RD-14 | `ca8fedf`, `323f618` |
| REL-3 (budget page uses the real `calculatorJsonLd` and a test asserts the built JSON-LD equals it), REL-4 (seeded failure is exactly budget + 1 byte per locale), REL-5 (non-ASCII inline CSS counted in bytes; the `.length` mutant fails), REL-6 (stale 600 comments) | `355522f` |
| REL-7 (worked-example figures must be whole tokens in Formulas) | `132c33d` |
| RD-7 error colour: `--color-error` `#B42318` (4.5:1 on Plan paper and Sheet white) in `docs/design/direction.md` | `9fca03f` |
| RD-7 CSS (dead `.calc-fields` removed, `.calc-shape-area` is a grid with the gap its reserved height counts, `aria-invalid` uses the token) | `c5b6909` |
| R1-5 (`rel="external noreferrer"`, no `target`, pinned) | `753d92b` |
| RD-6 (`CalculatorField.astro`) | `ba0d107` |
| RD-9 copy, R1-2 NIST pin (`^NIST SP 811, Appendix B`) | `f65106c` |

### Decisions and deviations

- REL-8: tiny nonzero lengths read `<1/64 in` (US) and `<0.01 cm` (metric); zero stays `0 in` and `0.00 cm`. The metric unit is chosen from the rounded value: from 0.995 m the text is metres.
- REL-9: smartypants stays on (the live trust pages keep their typography). `faqOf` writes quotes straight, and the parity check compares both sides after undoing smartypants (`sourceTypography`: quotes, ellipsis, `--` and `---`). Visible text is quoted in messages.
- REL-3: no `page.concrete.*` head keys exist before G3 routes the page, so the proof keeps `about`'s head and uses the real builder with the concrete paths added to the route table; the real head arrives with the route. The JSON-LD grew by about 65 B (real canonical URLs).
- RD-1: `glyphProblems` still takes the font map (fonts are not in the four-field context named by the review). `contextOf` lives in `checks.ts` and the CLI uses it too.
- RD-9: the answer templates read `Footing (...) × {count}: ...`, `Column (...) × {count}`, `Steps (...) × {stepCount}`, and the Spanish counterparts; for the owner: `banquetas` is kept in the Spanish copy (regional, owner to confirm), and the `×` forms are copy for review.
- HTML budget after the copy (production pipeline, 1,500 words, 8 FAQ answers): **39,353 B (EN), 39,601 B (ES)** of 40,960 B; headroom 1,607 B and 1,359 B. Budget not raised.
- R1-2: the orchestrator verified the sources on 2026-10-25: the QUIKRETE data sheet PDF shows "Revised October 2022" and the NIST SP 811 landing page lists "Appendix B – Conversion Factors". `retrieved: 2026-10-25` stays; the NIST name is `NIST SP 811, Appendix B (...)` in both locales.

### Follow-ups (out of scope)

RES-1 (one build with two injected routes; reconsider in G3 if test time grows), RES-2, R1-1 (CSP flip before the script; production verified clean by the orchestrator: no `/cdn-cgi` or scripts on `/`, `/contact`, `/es/contacto`, `/privacy`), R1-3, R1-4 (add `caches.`, `cookieStore` and `EventSource` bans in G3 with the bundle), RD-10, RD-11, RD-12, RD-13 (the breadcrumb `ol[aria-label]` is spec'd because of SS1), RD-15. Owner review: `banquetas`, the `×` answer wording and the `<1/64 in` texts.

## G2 Judgment Day

Both blind judges returned **APPROVED** on `1691d83..39c994b` (no CRITICAL or MAJOR; judge B completed its sweep on request). Both recomputed the default slab figures (74 bags, $481.00, $244.44) and tried to bypass the CSP and `check:site` rules without success. The AGENTS.md recipe gains step 7 (`PAGELESS`) in the same commit as this note (JD-A-6).

### Follow-ups for group 3 (do first)

- **JD-1 (A, B)**: the copy says a bare number is read in inches for "thickness, depth and rise"; footing width, diameter and run are inch fields too. Name every small field (or refer to the unit shown in each field) in EN/ES Step 2 and the metric FAQ, with a pin.
- **JD-2 (A)**: the spec asks for the active unit hint on every field (calculator-page, Form controls) and it is not rendered; add it (new ICW keys or `aria-describedby` text) before G3 enables the inputs, or amend the spec.
- **JD-3 (A, B)**: tie the waste help to its input with `aria-describedby` through `CalculatorField` (the same slot errors will use).
- **JD-4 (A, B)**: measure the reserved answer height at 320/390 px for the longest EN/ES sentence in the G3 e2e and size to it (CP44, CLS ≤ 0.01).
- **JD-5 (A, B)**: the "generic" calculator model and presenter are concrete-shaped; rename to concrete-scoped names or split a generic core before calculator 2 (record as a change-level follow-up if not done in G3).
- **JD-6 (B)**: `check:site` should require `rel~=noreferrer` on allowlisted source links (now pinned only by the SourceList unit test).
- **JD-7 (A, B)**: live-site smoke for `/cdn-cgi/` and scripts on static pages after G3 deploys (F.4); the CSP flip in G2 was verified clean in production by the orchestrator.
- Minor: `CalculatorBody.test.ts` picks `calculators[1]` (use `find`), the budget test leaves `BUDGET_EXTRA_*` set and runs four builds (RES-1), regression tests for `/_astro/../x.js` and `&amp;` in FAQ parity, storage/network ban list (`caches.`, `cookieStore`, `EventSource`, `navigator.storage`) and `.cjs`/`.wasm` in the js-file rule, "banquetas" for owner review.

## S13b: JS end-to-end, axe states, CLS, CSP console (group 3)

Commits: `a43f3a3` test(e2e) drive the calculator with scripts enabled; `c0006db` fix(web) reserve five lines for the short answer; `3381099` test(e2e) axe states, layout shift, CSP console. 7 files, +922/-1 lines (forecast ~350: the data-driven EN/ES spec over 17 states and 40 scenarios is the bulk; no split taken because the work was already written when this agent took over).

### What was added
- `calculator.spec.ts` (CP11-CP50, SS21, SR7, SR20-22), `calculator-pages.ts` (per-locale data: strings, states, shape fields), `a11y.spec.ts` (8 states x 2 pages, plus the seeded lost-association run [SQ20]), `layout.spec.ts` (CLS <= 0.01 per locale with and without a state; reserved answer height at 320 and 390 px; notice block), `csp.spec.ts` (0 CSP messages on the 16 pages and while typing, shape, copy, language switch; injected inline script blocked [SQ26]).
- SS19 (static pages load no script) stays pinned by the existing smoke and `no-js` projects.

### App defect found (JD-4)
`.calc-answer` reserved 7.5rem (four lines); the longest shape sentence wraps to five at 320 px. Fixed to 10.75rem with a pin in `styles.contract.test.ts` (`fix(web)`, `c0006db`). No spec change needed.

### Results (local)
- `npm run verify` exit 0: 177 files, 3230 tests (G2 tip had 2983).
- `npm run build && npm run test:e2e`: 281 passed (phone 273: smoke 125, calculator 83, a11y 34, csp 19, layout 12; no-js 8), wall time 30.0 s (CI limit 10 min).
- `npm run lighthouse`: exit 0, all six URLs (`/`, `/es`, `/methodology`, `/es/metodologia`, `/concrete-calculator`, `/es/calculadora-de-concreto`) performance 100, accessibility 100, best practices 100, SEO 100; CLS 0.0000 on each.
- Budgets (build): JS graph of the concrete entry 35,712 B / 49,152 B; calculator page weight largest (ES) 159,795 B / 196,608 B; HTML EN 32,070 B, ES 34,073 B / 40,960 B. No budget raised.

### Negative proofs (temporary, reverted, tree clean)
1. `aria-describedby` removed in `mount.ts`: CP46 test and the axe error state fail on both pages (description "" instead of the message). Red as intended.
2. `.calc-answer` reserved size cut to 2rem: the reserved-size tests of `layout.spec.ts` fail (answer 102 to 136 px vs 32 px) on both locales at both widths. Deviation: the on-load CLS tests stayed green, because the static HTML already renders the same default sentence, so they do not catch it alone; the reserved-size test is the guard that does.
3. Entry throws at load: the CP49 path still shows the note and the default result; every mount-dependent test (CP41, CP24 states) fails. Red as intended.

### Group 3 summary and G3.1
`git log main..HEAD` shows S11a to S13b (route, templates, methodology, privacy, home, tooling all present). G3.2 (GX1-GX6, PR) belongs to the orchestrator. Nothing pushed.
