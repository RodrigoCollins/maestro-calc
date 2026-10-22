# Proposal: Foundation — Monorepo and Exact Core Engine

Implements PLAN.md §12 phase B (first item: monorepo, engine, data, i18n, tests, CI) and §6.1–6.3 (quality gates only).

## Intent

The scaffold cannot carry 100+ calculators: float unit factors are truncated, the feet-inch formatter is wrong for negatives and carry, logic is coupled to the DOM, labels are hardcoded English, and `npm run check` is broken. Every MVP calculator (§4.1) depends on exact lengths and fractions, so the engine and quality gates must exist, verified, before any calculator ships. The core must stay reusable for future mobile/API consumers (§6.1).

## Scope

### In Scope
- npm-workspaces monorepo: `packages/{core,data,i18n}`, `apps/web` (Astro app moved via `git mv`); `src/lib` deleted (replace, not migrate).
- Shared strict `tsconfig.base.json`; TypeScript pinned `~6.0`; `.nvmrc` = 24, `engines >=22.23.4`.
- Blocking gates: ESLint (typescript-eslint strict-type-checked), Prettier, typecheck (incl. `astro check`), vitest projects with coverage, Stryker on core, GitHub Actions CI.
- `core`: `Rational` over `bigint`; `Quantity<D>`/`Unit<D>` with exponent-vector dimensions (length, area, volume, mass, density; in, ft, yd, mm, cm, m and squares/cubes; lb, oz, short ton, kg, tonne; lb/ft³, lb/yd³, ton/yd³, kg/m³) with exact factors; `Money` (exact USD amounts, unit prices, cents display) for editable prices (PLAN §4.2); rounding policy (nearest, ties away from zero, denominators 2–64, decimal places 0–12, plus purchase ceiling); feet-inch-fraction parse/format; typed calculator contract (`defineCalculator`, descriptors incl. `money` kind, `validate` with imperial/metric unit system); versioned URL codec.
- Proof: one rectangle-area calculator (ft-in → ft², yd², m²) with EN/ES labels in `packages/i18n`.
- `packages/data`: material-record type contract only, no materials.

### Out of Scope
- Any other calculator; real materials data.
- Web UI, design system, layout, PWA, analytics, SEO.
- Deploy/Cloudflare, preview deploys, Playwright, Lighthouse, SEO checks.
- Irrational boundary (`Rational.approximate`) and angle/dimensionless ratio — specified with roof pitch/round footings.
- Multi-currency, taxes, locale-aware decimal input (commas are rejected with `DECIMAL_COMMA`).
- Turborepo/Nx, pnpm, core build step, TypeScript 7.

## Capabilities

### New Capabilities
- `monorepo-workspace`: package layout, boundaries, core purity rules, toolchain pins.
- `quality-gates`: lint, format, typecheck, coverage and mutation thresholds, CI workflow.
- `exact-rational`: exact rational arithmetic and decimal parsing.
- `units-quantities`: exponent-vector dimensions (incl. mass, density), quantities, units, exact conversions, typed ops.
- `money`: exact USD money, unit prices, cents display rounding, money input grammar and field kind.
- `fraction-format`: rounding policy (fractions, decimal places, purchase ceiling), feet-inch-fraction parse/format.
- `calculator-contract`: descriptors, validation, language-free results.
- `url-state-codec`: versioned, stable URL encode/decode.
- `i18n-catalog`: keyed EN/ES label catalog.
- `material-data-contract`: typed material record shape.
- `calc-rectangle-area`: proof calculator.

### Modified Capabilities
None (no existing specs).

## Approach

Follow explore.md recommendations: own zero-dependency `Rational`, canonical inch-based units, rounding only at display/purchase boundary, hand-rolled descriptors (zod stays build-time in web only), internal packages exported as TS source. Strict TDD with hand-verified values and fast-check properties.

### Delivery: 12 chained PRs (~3,880 lines; exceeds 400 total)

Re-sliced after design review round 1 (money and mass/density added to scope).

| PR | Slice | Forecast |
|---|---|---|
| 1 | Skeleton, `git mv`, tsconfigs, green build/check, SSR spike | ~220 + lockfile |
| 2 | ESLint, Prettier, vitest+coverage, CI | ~300 |
| 3 | `rational` + Stryker job | ~380 |
| 4 | `units` core (exponent vectors; length, area, volume; ops) | ~370 |
| 5 | Mass and density units | ~200 |
| 6 | Rounding (fractions, decimal parts, purchase ceiling) + feet-inch formatting | ~330 |
| 7 | Length parser | ~390 |
| 8 | `money` | ~280 |
| 9 | `calculator-contract`: descriptors, `defineCalculator`, `validate` | ~390 |
| 10 | `run`/result checks + `material-data-contract` | ~280 |
| 11 | URL codec + released URL contract test | ~380 |
| 12 | Rectangle area, i18n catalogs, web smoke import | ~360 |

Lockfile and pure renames excluded from counts. Total exceeds the 400-line budget; each slice stays within it. **Approved delivery plan:** `delivery_strategy: auto-chain`, chain strategy stacked-to-main (user-authorized autonomous execution, 2026-10-22). No ask-on-risk decision pending.

## Affected Areas

| Area | Impact |
|---|---|
| `package.json`, `package-lock.json` | Modified (workspace root) |
| `astro.config.mjs`, `src/pages`, `src/site.config.ts`, `public/`, `tsconfig.json` | Moved to `apps/web/` |
| `src/lib/*` | Removed |
| `packages/{core,data,i18n}` | New |
| `tsconfig.base.json`, `eslint.config.js`, `prettier.config.js`, `vitest.config.ts`, `.nvmrc`, `.github/workflows/ci.yml`, `.github/dependabot.yml` | New |
| `packages/core/stryker.config.mjs` | New (per-package mutation config) |
| `openspec/config.yaml`, `AGENTS.md` | Modified |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Stryker 10 + vitest 5 incompatibility | Med | Spike in PR3 |
| Astro SSR with symlinked TS source | Med | Spike in PR1; `vite.ssr.noExternal` |
| TS 7 breaks lint/check | Med | Pin `~6.0`, ignore major in bots |
| URL keys become public contract | Med | `v=1`, key-stability rules, committed released-keys contract test |
| Scope growth (money, mass) | Med | Re-sliced into 12 PRs, each ≤ 400 lines |
| `bigint` not JSON-serializable | Low | String codecs only |
| PR1/PR2 exceed 400 (renames/format) | Med | Split slice if needed |

## Rollback Plan

Each PR is an independent revert. Before merge of PR1: delete branch. After: `git revert` the PR in reverse order; PR1 revert restores the single-app scaffold (`src/lib` recoverable from history). No data, deploy, or users affected.

## Dependencies

- Node 24 locally and in CI; npm registry access.

## Success Criteria

- [ ] `npm ci`, lint, format:check, typecheck, test, build all green locally and in CI.
- [ ] Coverage: core 100% lines/branches/functions/statements; other packages ≥ 90%.
- [ ] Stryker on core: break 90, low 90, high 95; CI fails below break.
- [ ] Exactness: `0.1 + 0.2 = 3/10`; `(1/3 ft) × 3 = 1 ft`; yd³↔ft³ round trip identity; 11 15/16" + 1/16" = 1' 0"; negatives format correctly; 1 kg = 100000000/45359237 lb; 3 × $4.98 = $14.94; $0.37/ft² × 125 ft² = $46.25.
- [ ] Properties: `decode(encode(x)) == x`; `parse(format(q)) == q` at the chosen denominator.
- [ ] `packages/core` has no DOM types or globals (lint-enforced).
- [ ] Rectangle area returns exact ft², yd², m² for hand-verified cases; `apps/web` imports it.

## Proposal question round

Resolved by the orchestrator under the user's autonomous-execution authorization (2026-10-22):
1. Public URL contract: **yes**, permanent from the first calculator. `v=1` allows evolution; keys are never reused or repurposed; a future `v=2` decoder must still read `v=1` links.
2. Metric input: **yes**. The `length` field kind accepts any length unit (imperial and metric) via the shared parser; bare numbers follow the active unit system (`metricDefaultUnit`, URL param `u=m`); this proves the contract and serves PLAN §7.8 (metric button for Latin America).
3. Mutation thresholds on core: **break 90, low 90, high 95** to start; raise break to 95 once the core stabilizes (tracked as follow-up).

Assumptions: explore.md orchestrator decisions 1–5 are binding.
