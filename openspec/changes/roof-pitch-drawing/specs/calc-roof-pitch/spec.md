# Delta for calc-roof-pitch

## ADDED Requirements

### Requirement: Slope drawing

The page MUST draw the slope of a valid moment with a positive rise as a right triangle rising to the right in the 300 by 200 frame, clamped to a ratio between 1:4 and 4:1, with the run dimensioned under it, the rise on its right and the pitch note (`calc.roof-pitch.page.pitch`) above it, named by the answer sentence. A zero rise MUST draw nothing.

#### Scenario: [RPD1] Default slope
- GIVEN the default state (6 in over 1 ft)
- THEN the outline is `M6 137.5L188.9 137.5L188.9 46Z` and the labels are `1 ft`, `6 in` and `6.00 in 12` (`6.00 en 12` in Spanish)

#### Scenario: [RPD2] Flat roof
- GIVEN a rise of 0
- THEN the plan is `null`
