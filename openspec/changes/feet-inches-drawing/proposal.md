# Proposal: feet-inches-drawing

## Intent

The last live drawing the plan's signature asks for: feet and inches went live without one (a follow-up of feet-inches-calculator). With it, every routed calculator draws.

## Decisions

1. **Bars to scale**, as tape measurements laid side by side, all starting at the left margin and scaled so the longest spans the frame. A sum or a difference draws both lengths and the result (three rows); a product or a quotient draws the length and the result (two rows).
2. **The parts.** The longer bar of a product or a quotient (the result of a product, the length of a quotient) is split into its `n` equal parts with orange marks, up to 16 parts; above 16 the marks would merge, so none are drawn.
3. **Language-free.** Each bar carries its length above it as the answer writes it (the result as the large figure, `4.934 m` in metric), so the plan names no page message and needs no catalog key.
4. **In the calculator's folder** (`feet-inches/plan.ts`), using the geometry constants `drawing.ts` exports: nothing is added to the shared chunk.
5. **Every length zero draws nothing** (`null`).
6. The body test's "no drawing" case now uses the test-only slot-free page, since no routed page is without a drawing.

## Slices

One PR, with the archive of `roof-pitch-drawing` if it is still open.
