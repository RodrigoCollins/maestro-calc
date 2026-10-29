# Proposal: topsoil-calculator

## Intent

Add the Topsoil calculator, #10 of the MVP catalogue (PLAN §4.1: 12.1K searches a month in English). It answers: how many cubic yards or bags of topsoil for a bed or a lawn patch at a given depth, and what does it cost. Chosen by the orchestrator on 2026-10-29 at the owner's "seguí". **Go-live waits for the owner's review** (PLAN §5.2).

## Scope

One PR, two commits (owner rule: group PRs to save CI):
1. Core `topsoil`, a plain calculator like `mulch`, with catalogs, registry and `PAGELESS`.
2. The page module without a route: answer, bag line, two costs, the plan.

## Owner decisions

- Bag sizes 0.75, 1 and 1.5 cubic feet (0.75 by default, the common bagged topsoil); bulk price per cubic yard.
- Default bed 10 ft by 10 ft, 4 in deep, **10 % extra** for settling (mulch uses 5 %).

## Mutation shard

The `calculators` shard was not split: its cold CI run measured 2 min 19 s for 376 mutants (PR #114, run 40809811678), well under the 10 minute trigger of design D10, which the ~400-mutant figure of `AGENTS.md` only approximates. It is split when the measured cold time nears 10 minutes.
