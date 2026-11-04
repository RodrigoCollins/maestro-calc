# Archive report: core-clock-time

Archived on 2026-11-04 with its proposal only. The `clock` input kind shipped in c59cadb (`feat(core): add the clock input kind with a day-off null value`), and the hours output followed decision 2 as revised (`measure: 'hours'`, an exact `Rational`). No spec delta was written, so no main spec changes.

Open follow-up, carried to `plans/growth/PLAN.md` (section "Open engineering items"): make the kind readers tree-shakable before any new Maestro Calc calculator or slot. See the notes at the end of `proposal.md`.
