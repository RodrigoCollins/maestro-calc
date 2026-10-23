# Exploration: foundation-monorepo-core-engine

Implements PLAN.md §12 phase B (first item) and §6.1–6.3. Persisted by the orchestrator from the sdd-explore result (2026-10-22).

## Current state (verified)

- Astro 7.4.2 scaffold, one commit. Deps: astro, @astrojs/sitemap, vitest 5.0.5 (vite 8.3.5 and zod 4.6.7 transitive via Astro).
- `src/pages/index.astro` is the unmodified starter. No vitest config, lint, format, CI, `.nvmrc` or tests.
- `npm run check` is broken: `typescript` and `@astrojs/check` are not installed.
- `src/lib/engine.ts` mixes DOM queries, `location`/`history` URL state, clipboard, `window.print`, `innerHTML` rendering and the compute loop; references a non-existent `Calculator.astro`; hardcoded English strings.
- `src/lib/units.ts`: truncated float factors (`gal: 0.133680556`, `kg: 2.20462262`, while 1 US gal = 231 in³ and 1 lb = 0.45359237 kg are exact); `Record<string, …>` units without compile-time safety; `Dim` mixes physical dimensions with presentation kinds (money, percent, angle).
- `src/lib/format.ts`: hardcoded en-US/USD; `feetInches()` rounds floats, only 1/16", wrong for negatives (`Math.floor` on negative sixteenths).
- `src/lib/types.ts`: `Values` is `Record<string, number|string>` (untyped per calculator); labels are plain strings, not i18n keys; core returns SVG markup as `diagram` (UI concern); `parseFloat` silently turns bad input into 0.
- Reusable: only the spec shape (fields, results, materials, warnings; `showIf`; CalcMeta split; purchase-unit shopping lines). No code is reusable.

## Affected areas

- `package.json` → workspace root; app deps move to `apps/web`.
- `astro.config.mjs`, `src/pages/index.astro`, `src/site.config.ts`, `public/`, `tsconfig.json` → `git mv` into `apps/web/`.
- `src/lib/*` → deleted, replaced by `packages/core`.
- New: `packages/{core,data,i18n}`, `tsconfig.base.json`, `eslint.config.js`, `prettier.config.js`, root `vitest.config.ts` (`projects`), `stryker.config.json`, `.github/workflows/ci.yml`, `.nvmrc`.
- Updates: `openspec/config.yaml` (testing/mutation fields), `AGENTS.md` (dev server now in `apps/web`).

## 1. Workspace tooling

- **npm workspaces (recommended).** Already in config, lockfile exists, native CI/Cloudflare support. Phantom-dependency risk mitigated with `import-x/no-extraneous-dependencies`. pnpm: stricter/faster, extra tool; revisit past ~6 packages.
- **No Turborepo/Nx yet.** Root `npm run --workspaces --if-present` + vitest `projects`. Add Turborepo when CI > ~5 min or packages > 6–8.
- **Internal packages:** `exports` point at TS source; Vite/Astro/vitest consume directly, no build step. `tsc --noEmit` per package on a shared `tsconfig.base.json`. Add a `tsdown`/`tsc` build for core only when a second consumer (mobile/API) appears.
- **Core purity:** no DOM in `lib`, `types: []`, ESLint restricted globals/imports.
- **Base compiler options:** `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`, `noImplicitOverride`, Bundler resolution, target ≥ ES2022 (bigint).
- **Spike (PR1):** Astro SSR build bundling symlinked workspace TS source; fallback `vite.ssr.noExternal`.

## 2. Numeric model

All requested units are exactly rational in inches: ft = 12, yd = 36, m = 5000/127 (inch = 25.4 mm exactly); areas/volumes are squares/cubes. Only π, sqrt, trig are irrational — none needed here.

| Option | Verdict |
|---|---|
| A. IEEE `number` | 0.1+0.2 errors, 1/3 ft unrepresentable, epsilon tests |
| B. Integer 1/64" ticks | Exact for tape math; metric and area/volume need a second model |
| **C. Own `Rational` over `bigint`** | **Recommended.** Exact everywhere, ~150 lines, zero deps, < 5 KB |
| D. Decimal libs | Not exact for thirds |
| E. fraction.js | Third-party dep in the most critical layer |

Proposed model:
- `Rational` normalized by gcd; `parseDecimal("0.1")` string → exact, never via `Number`; `toNumber()` is the only lossy exit.
- `Quantity<D>` with phantom dimension brand from a closed set (length, area, volume now; mass, angle, count, money later), stored as Rational in inch-based canonical units (in, in², in³).
- Explicit typed ops (length×length → area, area×length → volume), not type-level dimensional algebra.
- `Unit<D>` constants with exact factors: in, ft, yd, mm, cm, m and their squares/cubes. Wrong-dimension unit = compile error.
- One rounding policy: `roundToFraction(q, denominator 2..64, nearest | up | down)`, ties away from zero, plus purchase-unit ceiling.
- Calculation never rounds; rounding happens once at display/purchase boundary.
- Feet-inch-fraction formatter → `{sign, feet, inches, num, den}`; correct carry (11 15/16" + 1/16") and negatives. Parser accepts `5' 3-1/2"`, `5ft 3 1/2in`, `63.5in`, `3/4`.
- Reserved: `Rational.approximate(x, maxDenominator)` for the float boundary — to specify before roof pitch / round footings.
- Pitfall tests: 0.1+0.2; 1/3 ft × 3 = 1 ft; yd³↔ft³ round trip; ties at 1/128"; negatives; carry; zero denominator; malformed parse; fast-check properties.

## 3. Calculator contract and URL state

- **Hand-rolled typed field descriptors in core (recommended).** Kinds: length, count, percent, select, boolean. Input types inferred from the descriptor map. One codec derives defaults, validation, form metadata and URL encode/decode. Zero runtime deps, Rational-aware.
- zod 4: heavier client, float-only, no units. valibot 1.5: same gap. Keep zod only for build-time MDX frontmatter in `apps/web`. Leave a seam for Standard Schema.
- Contract: `defineCalculator({ id, inputs, compute })`, pure compute. Results are language-free: `{ key, quantity, role }`, shopping lines `{ materialId, purchaseUnit, qty: integer }`, warnings `{ code, params }`, diagram as geometry (not SVG). Labels by key in i18n; materials from `packages/data`. `validate(raw)` → `Result<Inputs, FieldError[]>` with codes, no silent coercion.
- URL codec: only non-default values; short per-field keys declared in the descriptor (public, stable contract); lengths as canonical exact string; `v=1` param; unknown keys ignored, invalid values → defaults; property test `decode(encode(x)) == x`. Canonicalizing `?params` is a web SEO concern (PLAN §7.4).
- Proof: ONE calculator — rectangle area (ft-in input → ft², yd², m²).

## 4. Scaffold fate

Replace, don't migrate: migrating carries the float model and untested DOM-coupled code and conflicts with strict TDD. `git mv` the Astro app; delete `src/lib` (history preserves it).

## 5. Tooling versions (checked 2026-10-22)

- **Node:** 22.23.4 is real (Maintenance LTS, EOL 2027-04-30) and is Astro 7.4.2's own floor. 24.x left Active LTS 2026-10-20 (EOL 2028-04-30). 26.x enters LTS 2026-10-28. Recommend `.nvmrc` = 24 via `node-version-file`; keep `engines >=22.23.4`; bump to 26 later.
- **TypeScript ~6.0 pinned.** npm `latest` is 7.0.2, but typescript-eslint 8.72.0 peers `<6.1.0` and @astrojs/check 0.9.12 peers `^5 || ^6`. Dependabot/Renovate ignore TS major.
- **ESLint 10.13.0** flat config; typescript-eslint 8.72.0 `strictTypeChecked` + `stylisticTypeChecked` with `projectService`; eslint-plugin-astro.
- **Prettier 3.9.10** + prettier-plugin-astro + eslint-config-prettier.
- **vitest / @vitest/coverage-v8 5.0.5** (exact-match peer); root `projects`, thresholds core 100, others 90.
- **Stryker core + vitest-runner 10.0.0** (peer `vitest >=2`, node ≥ 22); vitest 5 combo untested → spike in PR3. Thresholds high 95 / low 90 / break 90.
- fast-check: version not verified.
- **CI:** one workflow on PRs and pushes to main: `npm ci` (cached) → lint → format:check → typecheck (packages + `astro check`) → test+coverage → build. Separate path-filtered mutation job for core, Stryker incremental with cached report. `permissions: contents: read`, concurrency cancel-in-progress. Playwright/Lighthouse/SEO out of scope.

## 6. Slicing (~1,950–2,300 changed lines, ~45% tests)

Lockfile and pure renames excluded from the 400 count (noted in each PR body).

| PR | Scope | Lines |
|---|---|---|
| 1 | Monorepo skeleton, `git mv` app, tsconfigs, `.nvmrc`, package skeletons, delete `src/lib`, TS ~6.0 + `@astrojs/check`, green build/check, SSR spike | ~220 + lockfile |
| 2 | Quality gates: ESLint, Prettier, vitest projects + coverage, root scripts, CI, config.yaml | ~300 |
| 3 | `core/rational` + tests, Stryker config + CI mutation job | ~380 |
| 4 | `core/units`: Dimension, Quantity, Unit, exact conversions, typed ops | ~350 |
| 5 | `core/fraction-format`: rounding, ft-in-fraction parse/format, property tests | ~380 |
| 6 | `core/calculator` contract: descriptors, validate, `defineCalculator`, result types | ~330 |
| 7 | `core/url-codec`, rectangle-area proof, `apps/web` smoke import | ~380 |

## Risks

- TS 7 unpinned breaks typescript-eslint and @astrojs/check.
- Baseline not green (`npm run check` broken) — fix in PR1.
- Stryker 10 + vitest 5 only covered by a loose peer range — early spike.
- Astro SSR + symlinked workspace TS unverified — fallback `vite.ssr.noExternal`.
- `bigint` not JSON-serializable — all state through string codecs; guard against `JSON.stringify(rational)`.
- Irrational boundary deferred — must be specified before roof pitch / round footings.
- URL keys and length grammar become a compatibility contract (`v=1`, key-stability rules in spec).
- PR1 renames/lockfile and PR2 format pass may exceed 400 — split if needed.
- Mutation runtime grows — incremental cache + path filters from day one.
- `data`/`i18n` skeletons risk dead code.
- Cloudflare Pages Node 24/26 and `apps/web` root unverified — belongs to the deploy change.

## Open questions → orchestrator decisions (2026-10-22)

1. Replace, not migrate, `src/lib`: **accepted**.
2. Single proof calculator is rectangle area; no other calculators in this change: **accepted**.
3. `packages/i18n` ships with real content (the proof calculator's labels EN/ES); `packages/data` ships as a minimal typed package with the material-record contract only, no materials (first materials arrive with Concrete). Keeps PLAN §6.1 "day one" without dead code.
4. Rounding default: nearest, ties away from zero, denominators 2–64, no "round intermediates" mode in v1: **accepted**.
5. Node: `.nvmrc` = 24 now, follow-up to 26 after LTS: **accepted**.

## Ready for proposal

Yes.

Sources: nodejs.org/dist/index.json · endoflife.date/nodejs · stryker-mutator.io/docs/stryker-js/vitest-runner/ · npm registry metadata (2026-10-22).
