# Proposal: feet-inches-calculator

## Intent

The feet-inch-fraction calculator, PLAN §4.1 #3, the last MVP calculator: tape-measure math in the style of a contractor's calculator. Content approved in advance under the owner's rule of 2026-10-29; technical decisions are the orchestrator's (owner, 2026-10-30: "segui autonomo todo el plan").

## Decisions

1. **Four operations.** Add or subtract two lengths; multiply or divide one length by a whole number (1 to 1,000), which covers cutting a board into equal parts. The operation select drives the second field: a length for add and subtract, the number for multiply and divide.
2. **Never a negative length.** A subtraction whose second length is the longer gives the difference and warns `secondLonger`; the answer names which length is longer.
3. **Fraction figures.** The primary output carries the display hint `{ unit: 'ft', format: 'fraction', denominator: 16 }`; the web now writes such a hint as feet, inches and the nearest 1/16 in (`16 ft 2 1/4 in`). The decimal inches (2 places) and meters (3 places) are secondary. The controller's creation check accepts the fraction hint.
4. **No material data.** 1 ft = 12 in and 1 in = 0.0254 m exactly (NIST SP 811).
5. **No drawing** in this change (a tape-bar drawing is a follow-up).

## Slices

One PR: core, page module, content EN/ES, methodology, route `/feet-and-inches-calculator` + `/es/calculadora-de-pies-y-pulgadas`, E2E record.
