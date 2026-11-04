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

## Measured (2026-11-02)

The `clock` kind (parser, validation, URL text) raised the concrete page script from 47,609 B to 48,653 B against the 49,152 B limit: it fits, with 499 B left. **Follow-up before any new Maestro Calc calculator or slot:** make the kind readers tree-shakable so a page carries only the kinds it uses.

A property test found a real bug while adding it: the decoder filled a decoded `null` with the default (`??`); it now treats only an absent value as absent.

## Decision 2 revised (2026-11-02)

A fourth base dimension touches about 20 files across core and web and adds an exponent to every quantity of every Maestro Calc page, with 499 B of script budget left. Instead, an output may declare `measure: 'hours'`, an exact `Rational` of hours (not a `Quantity`): the time card needs hours to add, multiply by a rate and show, not unit conversion. `run` checks its shape like the other measures; only `apps/pay` renders it. Measure the bundle again after it; the kind-reader tree-shaking follow-up stays mandatory.

## Archive notes (2026-11-04)

Archived as shipped: the `clock` kind is in c59cadb. One follow-up is still open and is **mandatory before any new Maestro Calc calculator or slot**: make the kind readers tree-shakable (each definition carries only the readers of its own kinds), so a page's script stops paying for kinds it does not use. When `clock` landed, the concrete page script was 48,653 B against the 49,152 B limit, 499 B of headroom. The item is tracked in `plans/growth/PLAN.md`, section "Open engineering items".
