# Proposal: second-site-foundation

## Intent

Let the monorepo host a second site, the hourly pay niche of `plans/pago-del-trabajador/PLAN.md`, as `apps/pay`, without changing a single byte of what Maestro Calc publishes. This is spec 1 of that plan; the time-of-day and duration unit in `packages/core` is spec 2, a separate change.

## Findings (exploration, 2026-11-02)

- `apps/web/src` has about 178 non-test source files. Most of the infrastructure is tied to Maestro Calc: `lib` (13 of 14 files name the site or its packages), `seo` (5 of 6), `routing` (4 of 7), `site-check` (5 of 15), `views` (4 of 6). `styles` (0 of 3) and `client` (1 of 15) are close to generic.
- So a big-bang extraction would move code whose second consumer does not exist yet, and its right shape is unknown.

## Decisions

1. **Extract on second use.** `apps/pay` starts as a thin Astro app that depends on `@maestro-calc/core`. A piece of `apps/web` moves to a new `packages/site-kit` only in the change where `apps/pay` needs it, with its tests, and never as a speculative copy.
2. **Byte-identical guard.** Every change that touches shared code proves that the built `apps/web/dist` of the head commit equals the one of its base, file by file (paths and SHA-256). The guard is a CI job on pull requests that touch `packages/` or `apps/web`; a deliberate Maestro Calc change states why its dist differs.
3. **Scaffold only.** `apps/pay` builds a placeholder page in both languages, passes the same gates as `apps/web` (format, lint, typecheck, tests) and is not deployed: no domain, no Workers Builds project, no IndexNow, until the owner picks the brand (plan point 3).
4. **CI per app.** Jobs that only concern one app run when its paths change; `npm run verify` keeps every Maestro Calc gate in the same order. The workspace contracts (`workspace-graph.contract.test.ts`, the manifest list) learn the new workspace instead of being loosened.
5. **Package names stay `@maestro-calc/*`** for now; renaming the scope is a later, mechanical change.

## Non-goals

Brand, domain, deploy, content, calculators and the core time unit.

## Risks

- CI time grows; mitigated by path filters and by building `apps/pay` only when it changes.
- The dist comparison must ignore nothing; if Astro's output is not deterministic between two builds of the same commit, that is found first and fixed or documented in the design.
