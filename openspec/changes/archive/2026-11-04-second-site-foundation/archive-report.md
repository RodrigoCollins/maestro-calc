# Archive report: second-site-foundation

Archived on 2026-11-04. All eight tasks were checked; `apps/pay` and `packages/site-kit` are live (Cuenta Horas at cuentahoras.com).

Specs synced:

- `openspec/specs/monorepo-workspace/spec.md`, requirement "Workspace layout": the `apps/pay` row, its gate and build rules, and the enumeration scenario of the delta.
- `openspec/specs/quality-gates/spec.md`: requirement "Byte-identical Maestro Calc build on refactor branches" added (the `dist-identical` job of `.github/workflows/ci.yml` and `scripts/dist-fingerprint.mjs`).

Known gap (open): the workspace table of `monorepo-workspace` still lists only the workspaces of the openspec changes. `packages/site-kit`, `packages/pay-core`, `apps/pool` and `packages/pool-core` were added later without a delta, so the enumeration scenario is behind the repository (nine workspaces today). A later change should bring the table up to date.
