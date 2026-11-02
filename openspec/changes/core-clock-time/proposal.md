# Proposal: core-clock-time

## Intent

Spec 2 of `plans/pago-del-trabajador/PLAN.md`: give the shared engine what a time card needs, a time of day as an input (7:00 a.m., 16:30) and an amount of time as an output (49.5 hours), so the Cuenta Horas calculators are ordinary `defineCalculator` definitions with validation, URL state and tests like every Maestro Calc calculator.

## Findings (2026-11-02)

- The input kinds are closed (`length`, `count`, `percent`, `select`, `boolean`, `money`) and dispatched by `switch` in `calculator/validate.ts`, `url/codec.ts` and `url/url-values.ts`. Every kind's reader is therefore in every calculator's client bundle.
- Outputs must be a named dimension or money; the dimensions are length, area, volume, mass, density and angle over three bases (length, mass, angle). There is no time.
- **Budget constraint:** the largest Maestro Calc page script is 47,609 B against the 49,152 B limit (concrete), so a new kind costs every Maestro calculator bytes and there are only 1,543 B of headroom.

## Decisions to settle in design

1. A new input kind `clock`: minutes since midnight, read from `7:00 am`, `7am`, `7:00 p.m.`, `16:30`; its URL text is the canonical `HHMM`.
2. A fourth base dimension `time` with units `min` and `h`, so hours worked is a `Quantity<'time'>` and pay is money times hours.
3. **First, a spike that measures the bundle growth of 1 and 2 on the concrete page.** If it does not fit, the design makes kind readers tree-shakable (each definition carries only the readers of its kinds) before adding `clock`, as its own slice.
4. Overnight shifts (out before in) are one shift crossing midnight, never a negative duration.

## Non-goals

The calculators themselves, the week form slot and any page.
