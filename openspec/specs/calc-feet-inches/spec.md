# calc-feet-inches

## Requirements

### Requirement: Inputs

The feet and inches calculator SHALL take a first length (0 to 1,000 ft, default 12 ft 6 in), an operation (`add` default, `subtract`, `multiply`, `divide`), a second length (0 to 1,000 ft, default 3 ft 8 1/4 in) shown for add and subtract, and a whole number (1 to 1,000, default 2) shown for multiply and divide; URL keys `a`, `o`, `b`, `n`.

- [FI1] The defaults are 12 ft 6 in plus 3 ft 8 1/4 in, with 2 as the number; a number of 0 is refused.

### Requirement: Operations

Add = first + second; subtract = first − second, or second − first with the warning `secondLonger` when the second is the longer; multiply = first × number; divide = first ÷ number. Exact arithmetic; the result is shown in feet and inches to the nearest 1/16 in, in inches (2 places) and in meters (3 places).

- [FI2] The default: 194.25 in = 16 ft 2 1/4 in = 4.934 m.
- [FI3] Subtract 105.75 in; multiply 300 in; divide 75 in; divide by 7: 150/7 in = 1 ft 9 7/16 in.
- [FI4] 10 ft − 12 ft 6 in gives 30 in and `secondLonger`; equal lengths give 0 and no warning.
- [FI5] A length output with a fraction hint is written as feet, inches and the nearest fraction (`16 ft 2 1/4 in`, `25 ft`, `0 in`, `1,000 ft`), or inches alone for an inch hint (`12 1/2 in`).

### Requirement: URL and catalog

- [FI6] Every valid state round-trips through the link, and the four released tuples are appended in input order.


### Requirement: Bars drawing

The page MUST draw a valid moment as horizontal bars to scale in the 300 by 200 frame, from the left margin, the longest spanning 288 units, each labelled above with its length as the answer writes it: the first length, the second length and the result for a sum or a difference; the first length and the result for a product or a quotient, whose longer bar is split into its `n` parts when `n` is at most 16. It is named by the answer sentence. Every length zero MUST draw nothing.

#### Scenario: [FID1] Default sum
- GIVEN the default state (12 ft 6 in plus 3 ft 8 1/4 in)
- THEN the bars are 222.4, 65.6 and 288 long, labelled `12 ft 6 in`, `3 ft 8 1/4 in` and `16 ft 2 1/4 in`

#### Scenario: [FID2] Quotient
- GIVEN 12 ft 6 in divided by 3
- THEN the first bar is 288 long with marks at 102 and 198, and the result bar 96 long, labelled `4 ft 2 in`
