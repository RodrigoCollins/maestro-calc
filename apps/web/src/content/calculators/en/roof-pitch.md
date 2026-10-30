---
id: roof-pitch
locale: en
updated: 2026-10-30
ownerReview: approved
sources:
  - name: 2021 International Residential Code, Chapter 9, Section R905 (minimum roof slopes)
    url: https://codes.iccsafe.org/content/IRC2021P2/chapter-9-roof-assemblies
    retrieved: 2026-10-30
  - name: NIST SP 811, Appendix B (conversion factors)
    url: https://www.nist.gov/pml/special-publication-811
    retrieved: 2026-10-30
workedExample:
  query: v=1
  pitch: '6.00'
  angle: '26.57'
  rafterFt: '14.53'
  rafterM: '4.43'
---

<h2 id="how-to-use">How to use the roof pitch calculator</h2>

The calculator turns a rise and a run into the pitch of a roof, its angle and the length of a rafter, and it checks the pitch against the minimum slope the International Residential Code sets for the covering you plan to use. The result updates as you type, so there is nothing to submit.

1. Measure the rise and the run. The usual way is to hold a level against the roof, mark 12 inches along it and measure straight down to the roof: that is the rise over a 12 inch run. You can also use any rise and run you know, such as the height of the ridge over half the width of the building. A plain number is read in inches.
2. Type the rafter run: the horizontal distance the rafter covers, usually half the span of the building. A plain number is read in feet.
3. Type the overhang, measured level from the wall to the end of the rafter. A plain number is read in inches.
4. Choose the roof covering, so the calculator can check the pitch against its minimum slope.

The result leads with the pitch in inches of rise per 12 inches of run, the way roofers say it. It also shows the angle in degrees and the rafter length in feet and in meters. The answer sentence says whether the pitch meets the minimum slope for the covering, needs two layers of underlayment, or is too low.

To work in metric, press Metric (m, cm). Lengths are then read in centimeters and meters, and the result leads with the angle in degrees. Switching units never changes your numbers, only how they are written. Use Copy link to send your exact numbers to a partner, a client or the inspector, and the Español link to open the same numbers in Spanish.

<h2 id="formulas">Formulas and worked example</h2>

The calculator works from the rise and the run to the angle and the rafter:

- Slope = rise ÷ run.
- Pitch in 12 = slope × 12.
- Angle = arctangent of the slope, in degrees.
- Rafter length = (rafter run + overhang) × √(1 + slope²).

The angle and the square root are not exact fractions. The calculator keeps the square root to twenty decimals and the angle within a hundred-billion-billionth of a degree, far finer than any figure it shows.

Worked example: a roof that rises 6 in for every 12 in of run, with a 12 ft rafter run, a 12 in overhang and asphalt shingles.

- The slope is 6 ÷ 12 = 1/2, so the pitch is 6.00 in 12.
- The angle is the arctangent of 1/2, which is 26.57 degrees.
- The rafter covers 12 ft plus 12 in, or 13 ft of run. √(1 + 1/4) = 1.1180, so the rafter is 13 × 1.1180 = 14.53 ft, or 4.43 m.
- Asphalt shingles need at least 2 in 12, and two layers of underlayment below 4 in 12, so 6 in 12 meets the code with one layer.

The page [How we calculate](/methodology#roof-pitch) lists the formulas, the code sections and the cases we test.

<h2 id="tips">Tips and common mistakes</h2>

Measure the run level, not along the roof. A tape laid on the roof surface measures the rafter, not the run, and gives a pitch that is too low.

The rafter length here is the length along the top of the rafter from the plumb line at the ridge to the end of the overhang, before any cut. Subtract half the thickness of the ridge board, and add what your cuts need, before you order lumber.

Low slopes need care. Below 4 in 12, asphalt shingles and tile need two layers of underlayment under the code, and each covering has a floor it cannot go below. When the answer says the pitch is too low, choose another covering or ask your supplier for a low-slope system.

Local codes can amend the IRC, and manufacturers can ask for more than the code does. Check both before you start.

The calculator does not size rafters. Span tables depend on the species, the grade, the spacing and the loads where you build.

These are estimates. Confirm them with your plans and your local building department.

<h2 id="faq">Frequently asked questions</h2>

### How do I find the pitch of a roof?

Hold a level against the roof, mark 12 inches along it and measure straight down to the roof surface. That measure is the rise in 12. A rise of 6 inches is a 6 in 12 pitch, about 26.57 degrees.

### How do I convert roof pitch to degrees?

Divide the rise by the run and take the arctangent. A 4 in 12 pitch is about 18.43 degrees, 6 in 12 is about 26.57 degrees and 12 in 12 is 45 degrees.

### What is the minimum pitch for asphalt shingles?

The 2021 International Residential Code, Section R905.2.2, allows asphalt shingles from 2 in 12, and asks for two layers of underlayment from 2 in 12 up to 4 in 12.

### What is the minimum pitch for metal, tile and slate?

Under the 2021 IRC, metal roof shingles need at least 3 in 12, clay and concrete tile at least 2 1/2 in 12, slate at least 4 in 12, wood shingles and shakes at least 3 in 12, and mineral-surfaced roll roofing at least 1 in 12.

### How long is a rafter for a 6 in 12 roof?

Multiply the run by about 1.118. A rafter over 12 ft of run with a 12 in overhang is about 14.53 ft long before cuts.

### What is a 12 in 12 pitch?

A roof that rises 12 inches for every 12 inches of run, a 45 degree angle. Its rafters are about 1.414 times their run.

### Does the calculator size rafters?

No. Rafter size depends on the species, the grade, the spacing and the loads where you build. Use the span tables of your code or ask an engineer.

### Can I use centimeters?

Yes. Press Metric (m, cm), then type the rise, the run and the overhang in centimeters and the rafter run in meters. The result leads with the angle in degrees. Switching units never changes your numbers, only how they are written.

<h2 id="sources">Sources and review date</h2>

The minimum slopes come from the 2021 International Residential Code, Chapter 9, Section R905: R905.2.2 asphalt shingles, R905.3.2 clay and concrete tile, R905.4.2 metal roof shingles, R905.5.2 mineral-surfaced roll roofing, R905.6.2 slate, and R905.7.2 and R905.8.2 wood shingles and shakes. The inch-to-meter factor comes from NIST Special Publication 811, Appendix B. The sources below show the date we retrieved them, and the review date follows.

Results are estimates. If you find a mistake, tell us: the [corrections section of the about page](/about#corrections) explains how.
