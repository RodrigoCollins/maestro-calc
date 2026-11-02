# Design: second-site-foundation

## Verified premise

Two consecutive builds of the same commit produce identical `apps/web/dist` trees (130 files, same SHA-256 each; checked 2026-11-02). A byte comparison is therefore a valid guard.

## D1. Fingerprint script

`scripts/dist-fingerprint.mjs <dir>` prints `<sha256>  <path>` for every file under `<dir>`, paths relative to it with `/` separators, sorted by path; it exits 2 with a message when `<dir>` is missing. Plain Node, no dependency, tested like `check-dist.mjs` (spawned against a temporary directory).

## D2. CI job `dist-identical`

Runs only on `pull_request` when `github.head_ref` starts with `refactor/`: a branch name is known when the run starts, unlike a label, so no extra trigger types are needed. Steps: checkout with full history, Node from `.nvmrc`, `npm ci`, build, fingerprint head; checkout `github.event.pull_request.base.sha`, `npm ci`, build, fingerprint base; `diff -u base head`. Bounded to 20 minutes, no `needs`, outside `verify` so the local `verify` script is unchanged. `ci.contract.test.ts` pins its condition and commands.

## D3. apps/pay scaffold (slice 2)

`@maestro-calc/pay`: Astro, one placeholder page per language, own `tsconfig` extending the base, vitest project, lint and typecheck coverage. The workspace contracts list it explicitly. No deploy config.

## D4. Extract on second use

Later changes move pieces of `apps/web` into `packages/site-kit` from `refactor/` branches, so D2 proves each move.
