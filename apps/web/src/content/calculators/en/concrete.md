---
id: concrete
locale: en
updated: 2026-10-25
ownerReview: approved
sources:
  - name: QUIKRETE Concrete Mix No. 1101 data sheet (product nos. 1101-40, 1101-60, 1101-80), revised October 2022
    url: https://www.quikrete.com/PDFs/DATA_SHEET-Concrete%20Mix%201101.pdf
    retrieved: 2026-10-25
  - name: NIST SP 811, Appendix B (conversion factors)
    url: https://www.nist.gov/pml/special-publication-811
    retrieved: 2026-10-25
workedExample:
  netFt3: '40.00'
  totalFt3: '44.00'
  yd3: '1.63'
  bags: 74
  bagLb: 80
---

<h2 id="how-to-use">How to use the concrete calculator</h2>

The calculator turns the size of a pour into the concrete you need and the bags to buy. The result updates as you type, so there is nothing to submit.

1. Pick the shape of the pour: a slab, a footing, a column or steps. Only the fields for that shape are shown.
2. Enter the measurements. Type them the way you read a tape: 12 ft, 12 ft 6 in or 5 ft 3 1/2 in. A plain number is read in the unit named beside each field: feet for length, width, height and step width, and inches for every other measurement. Switch to metric to type meters and centimeters.
3. Set the extra for waste. The calculator starts at 10 percent, and you can change it with the field or the two buttons.
4. Choose the bag size you will buy: 40, 60 or 80 lb.
5. If you want costs, type the price of one bag or the price of ready-mix per cubic yard. A price left empty counts as zero and its cost row stays hidden.

The result shows the concrete in cubic yards, cubic feet and cubic meters, the volume before the extra, and the number of whole bags. Use Copy link to send your exact numbers to a partner or a supplier, and the Español link to open the same numbers in Spanish.

<h2 id="formulas">Formulas and worked example</h2>

Every shape starts from a volume, and the volume is a plain geometric formula:

- Slab: length × width × thickness.
- Footing: length × footing width × footing depth × number of pieces.
- Column, a cylinder: π × (diameter ÷ 2)² × height × number of pieces.
- Steps: each step is a full-height block from the ground to its own tread, so step 1 is one rise high, step 2 is two rises high, and so on. With N steps the volume is step width × run × rise × N × (N + 1) ÷ 2.

The extra for waste is added to the volume: total volume = volume × (1 + extra ÷ 100). The bag count is the total volume divided by the volume one bag makes, rounded up to a whole bag. Three conversions do the rest: 1 cubic yard is 27 cubic feet (3 ft × 3 ft × 3 ft), 1 cubic foot is 1,728 cubic inches, and 1 cubic foot is 0.028316846592 cubic meters.

Worked example: a slab 12 ft long, 10 ft wide and 4 in thick.

- 4 in is 1/3 ft, so the volume is 12 × 10 × 1/3 = 40.00 cubic feet.
- With 10 percent extra the total is 40 × 1.10 = 44.00 cubic feet.
- In cubic yards, 44 ÷ 27 = 1.63 cubic yards.
- An 80 lb bag makes about 0.60 cubic feet, so 44 ÷ 0.60 = 73.3, and you buy 74 bags of 80 lb.

The same slab takes 98 bags of 60 lb (about 0.45 cubic feet each) or 147 bags of 40 lb (about 0.30 cubic feet each). The yields are the manufacturer's approximate figures for one mix. Another product can yield a little more or less, so check the label of the bag you buy.

The calculator keeps exact fractions from the first input to the last step. It rounds the bag count up, and it rounds the figures only when it shows them. The page [How we calculate](/methodology#concrete) lists the formulas, the yields and the tests.

<h2 id="tips">Tips and common mistakes</h2>

The extra is a rule of thumb, not a standard. Ten percent is a common starting point for spills, uneven ground and a trench dug a little deep. Use more when the ground is rough or the forms are not square, and less when the base is flat and the forms are tight. You decide, and the calculator follows.

Check the unit of every number before you read the answer. The most common mistake is typing inches where feet are expected, or the reverse. Write the unit yourself, for example 4 in or 12 ft, and the calculator reads exactly what you typed.

Round the bags up, never down. A slab that runs out of concrete halfway leaves a cold joint, so it is cheaper to carry one spare bag than to be one bag short.

For several identical footings or columns, enter one piece and set the number of pieces. For pieces of different sizes, run the calculator once for each size and add the results.

Bags and ready-mix are two ways to buy the same volume. Mixing dozens of bags by hand is slow work, so type both prices and compare the two costs. Ready-mix is ordered by the cubic yard, and your supplier sets the minimum load and the increments. This calculator does not round to truck sizes, so ask the supplier what the smallest delivery is and whether a short load costs extra.

A 4 in slab is a common thickness for sidewalks and patios, and driveways are often thicker. Measure the actual thickness you plan to pour, because a small change in thickness changes the volume of a large slab quickly.

These are estimates. Confirm the quantities with your supplier and with your local building code before you order.

<h2 id="faq">Frequently asked questions</h2>

### How many 80 lb bags of concrete do I need for a 12 ft by 10 ft slab that is 4 in thick?

About 74 bags with 10 percent extra. The slab is 40 cubic feet, 44 cubic feet with the extra, and an 80 lb bag makes about 0.60 cubic feet. With no extra you need 67 bags.

### How many cubic yards of concrete is a 4 in slab?

Multiply length by width in feet, multiply by 1/3 for 4 inches, and divide by 27. A 12 ft by 10 ft slab is 40 cubic feet, which is 1.48 cubic yards before the extra and 1.63 cubic yards with 10 percent extra.

### How much concrete does one bag of mix make?

According to the manufacturer data sheet, an 80 lb bag makes about 0.60 cubic feet, a 60 lb bag about 0.45 cubic feet and a 40 lb bag about 0.30 cubic feet. Check the label of your product, because yields differ between products.

### How much extra concrete should I order?

Ten percent is a common rule of thumb, and it is where the calculator starts. Raise it for uneven ground or hand-dug trenches, and lower it for a flat base with tight forms. The field and the two buttons let you set any value from 0 to 50 percent.

### Should I use bags or ready-mix?

Type the price of a bag and the price of ready-mix per cubic yard, and the calculator shows both costs. Ready-mix suppliers set a minimum order and delivery increments, and the calculator does not round to them, so ask your supplier before you decide.

### How do I calculate concrete for a round column?

Use the area of the circle times the height. With the default 12 in diameter and 8 ft height, one column is about 6.28 cubic feet. With 10 percent extra it is about 6.91 cubic feet, which is 12 bags of 80 lb.

### How do I calculate concrete for steps?

Pick Steps, then enter the step width, the rise, the run and the number of steps. Each step is a block from the ground up, so the volume grows with every step. The default three steps are about 12.83 cubic feet before the extra. With 10 percent extra, that is 24 bags of 80 lb.

### Can I use meters and centimeters?

Yes. Press Metric, then type meters for length, width, height and step width, and centimeters for every other measurement. Switching units never changes your numbers, only how they are written. Bag sizes stay in pounds, because that is how the bags are sold.

<h2 id="sources">Sources and review date</h2>

The bag yields come from the QUIKRETE data sheet for Concrete Mix No. 1101. The unit conversions come from NIST Special Publication 811, Appendix B. Each source below shows the date we retrieved it, and the review date follows.

Results are estimates. If you find a mistake, tell us: the [corrections section of the about page](/about#corrections) explains how.
