# Delta for calc-feet-inches

## ADDED Requirements

### Requirement: Bars drawing

The page MUST draw a valid moment as horizontal bars to scale in the 300 by 200 frame, from the left margin, the longest spanning 288 units, each labelled above with its length as the answer writes it: the first length, the second length and the result for a sum or a difference; the first length and the result for a product or a quotient, whose longer bar is split into its `n` parts when `n` is at most 16. It is named by the answer sentence. Every length zero MUST draw nothing.

#### Scenario: [FID1] Default sum
- GIVEN the default state (12 ft 6 in plus 3 ft 8 1/4 in)
- THEN the bars are 222.4, 65.6 and 288 long, labelled `12 ft 6 in`, `3 ft 8 1/4 in` and `16 ft 2 1/4 in`

#### Scenario: [FID2] Quotient
- GIVEN 12 ft 6 in divided by 3
- THEN the first bar is 288 long with marks at 102 and 198, and the result bar 96 long, labelled `4 ft 2 in`
