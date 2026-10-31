# Proposal: roof-pitch-drawing

## Intent

PLAN §4.2 asks for a live drawing on the concrete and roof pages. Roof pitch went live without one (a tracked follow-up of roof-pitch-calculator); this change draws the slope.

## Decisions

1. **The pitch triangle in side view.** A right triangle rising to the right: the run measured under it, the rise on its right, as a carpenter marks a pitch. The rafter run and the overhang are not drawn: the triangle is the slope, and the rafter length is a figure of the result.
2. **The pitch as a note above**, through the page's existing `pitch` message (`6.00 in 12`, `6.00 en 12`): no new catalog key. The angle stays in the answer, which is the drawing's accessible name.
3. **Clamped like every plan** (ratio between 1:4 and 4:1, labels true), and a flat roof (rise 0) draws nothing (`null`).
4. **Its own module.** `slopeShape` lives in `slots/slope.ts`, not `drawing.ts`: the latter is one chunk shared by every page that draws, and the shape would cost the concrete page about 400 B for nothing. The shared geometry constants are exported from `drawing.ts` instead (51 B).
5. **The e2e ratio reads the outline's box** (`getBBox` of the one filled shape), so it holds for a path as for a rectangle.

## Slices

One PR, with the archive of `indexnow`.
