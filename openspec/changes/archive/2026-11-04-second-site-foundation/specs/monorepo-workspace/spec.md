# Delta for monorepo-workspace

## MODIFIED Requirements

### Requirement: Workspace layout

The workspace table gains `apps/pay` (`@maestro-calc/pay`), the Astro app of the hourly pay site (Cuenta Horas). It MUST pass the same format, lint, typecheck and test gates as `apps/web`, MUST NOT be deployed until its domain exists, and MUST NOT change the build of `apps/web`.

#### Scenario: Workspace enumeration
- GIVEN the repository root
- WHEN `npm query .workspace` is executed
- THEN exactly `core`, `data`, `i18n`, `web` and `pay` are returned
