---
id: fence
locale: en
updated: 2026-11-10
ownerReview: approved
sources:
  - name: Quikrete, Setting Posts project sheet
    url: https://www.quikrete.com/PDFs/Projects/SettingPosts.pdf
    retrieved: 2026-11-10
  - name: QUIKRETE Concrete Mix No. 1101 data sheet, revised October 2022
    url: https://www.quikrete.com/PDFs/DATA_SHEET-Concrete%20Mix%201101.pdf
    retrieved: 2026-11-10
  - name: Viance, Treated Wood, Building a Fence
    url: https://treatedwood.com/projects/building-a-fence
    retrieved: 2026-11-10
  - name: The Home Depot, Wood Fencing guide
    url: https://images.homedepot-static.com/catalog/pdfImages/66/665f47cf-0ce3-4613-b7ca-88426b6f6e03.pdf
    retrieved: 2026-11-10
  - name: America's Fence Store, picket fence guide
    url: https://pros.americasfencestore.com/pages/how-to-building-a-picket-wood-fence
    retrieved: 2026-11-10
  - name: Alta Forest Products, cedar fence installation
    url: https://pdf.lowes.com/productdocuments/1bf53922-7486-4be3-bb5e-0ff3f42a5799/40459176.pdf
    retrieved: 2026-11-10
  - name: This Old House, How to Choose and Put Up a Fence, June 3, 2026
    url: https://www.thisoldhouse.com/fences/21014933/fencing-lessons
    retrieved: 2026-11-10
  - name: DOC PS 20-20, American Softwood Lumber Standard
    url: https://www.nist.gov/document/doc-ps-20-20-american-softwood-lumber-standard
    retrieved: 2026-11-10
  - name: NIST SP 811, Appendix B
    url: https://www.nist.gov/pml/special-publication-811
    retrieved: 2026-11-10
workedExample:
  query: v=1
  posts: 14
  rails: 39
  boards: 253
  bags: 37
  concreteFt3: '21.68'
  gravelFt3: '4.21'
---

<h2 id="how-to-use">How to use the fence calculator</h2>

The calculator counts what a straight run of wood fence takes: the posts, the rails, the boards or pickets and the bags of concrete that set the posts. The result updates as you type, so there is nothing to submit.

1. Measure the length of the run and type it the way you read a tape: 100 ft, 62 ft 6 in. A plain number is read in feet. For a fence with corners, work out each straight run on its own.
2. Type the height of the fence above the ground and the distance between posts. This Old House marks post holes every 6 to 8 ft; the calculator starts at 8 ft.
3. Choose the style. Board-on-board privacy fences take two rows of boards, picket fences one row with gaps, and rail fences no boards at all. Each style shows the board fields it uses.
4. Keep or change the rails per section, the gates and the post width.
5. To see the cost, type the price of a post, a rail, a board and a bag of concrete.

The result leads with the posts, then the post, the hole, the concrete and the gravel, and ends with the shopping list.

To work in metric, press Metric (m, cm). Lengths are then read in meters and centimeters. Switching units never changes your numbers, only how they are written. Use Copy link to send your exact numbers to a partner, a client or the supplier, and the Español link to open the same numbers in Spanish.

<h2 id="formulas">Formulas and worked example</h2>

The calculator works from the run to what you buy:

- Sections = length ÷ post spacing, rounded up. Posts = sections + 1, plus 1 for each gate, because an opening needs a post on both sides.
- Rails = sections × rails per section.
- Board-on-board boards = 2 × length ÷ (board width + space between boards in a row), rounded up: each row leaves a space that the other row covers.
- Pickets = length ÷ (picket width + gap), rounded up.
- Hole width = 3 × post width. The post goes a third of its length into the ground, which is half the height above it; the hole is that deep plus 6 in of gravel.
- Concrete = (the area of the hole − the area of the post) × the buried depth × posts; bags = concrete ÷ the yield of one bag, rounded up.
- Gravel = the area of the hole × 6 in × posts.

The hole rules come from Quikrete's instructions for setting posts: a hole 3 times the post's width, a third of the post in the ground and 6 in of gravel at the bottom. The concrete fills the hole above the gravel up to the ground, sloped to shed water, as the Viance guide to building a fence and the Quikrete Concrete Mix data sheet set it. The bag yields are the ones the concrete calculator uses, from the same data sheet: about 0.60 cubic feet for the 80 lb bag the calculator counts. For 40 or 60 lb bags, divide the concrete by 0.30 or 0.45.

Worked example: a privacy fence 100 ft long and 6 ft high, with 4x4 posts every 8 ft, three rails a section, no gate, and board-on-board boards 5 1/2 in wide with 4 in between the boards of a row.

- 100 ft ÷ 8 ft = 12.5, so 13 sections and 14 posts. 13 × 3 = 39 rails.
- Two boards cover 5.5 + 4 = 9.5 in, so 2 × 1,200 in ÷ 9.5 in = 252.6: 253 boards.
- A 4x4 is 3 1/2 in wide, so the hole is 10 1/2 in wide. Half of 6 ft is 36 in in the ground, plus 6 in of gravel: the hole is 42 in deep, and each post is 9 ft long.
- Each hole holds π × 5.25 × 5.25 × 36 − 3.5 × 3.5 × 36 = 2,676 cubic inches of concrete; 14 holes take 21.68 cubic feet. 21.68 ÷ 0.60 = 36.1, so you buy 37 bags of 80 lb.
- The gravel is π × 5.25 × 5.25 × 6 cubic inches a hole: 4.21 cubic feet for the 14 holes.
- At $20 a post, $8 a rail, $3 a board and $6 a bag, the materials cost $280, $312, $759 and $222.

The calculator keeps exact fractions from the first input to the last step. The counts are rounded up, and every other figure is rounded only when it is shown. The page [How we calculate](/methodology#fence) lists the formulas and the cases we test.

<h2 id="tips">Tips and common mistakes</h2>

Buy posts long enough for the height and the depth. A 6 ft fence with a third of the post in the ground takes a 9 ft post; if your yard sells 8, 10 and 12 ft posts, buy the next length up and cut it.

Match the rails to the height. The Home Depot fencing guide uses three rails for fences 6 ft tall and higher and two for shorter ones, and the Viance guide suggests three for pickets 60 in or longer.

Space the boards for the style you build. America's Fence Store puts about 2 1/2 in between the pickets of a picket fence, and Alta Forest Products spaces the boards of each row of a board-on-board fence 4 in apart when they are 6 in boards. If your fence is a pool barrier, check the local code for the largest opening it allows.

Wait before you load the posts. Quikrete's data sheet for its regular Concrete Mix says to wait 24 hours before a post takes any strain.

The calculator does not count nails, screws, hinges or latches.

Check the property line, the local code, the frost depth and any homeowners association rules before you dig, and call 811 so the buried utility lines are marked. These are estimates; confirm the quantities with your supplier before you order.

<h2 id="faq">Frequently asked questions</h2>

### How many posts do I need for a fence?

Divide the length by the post spacing, round up and add one, then add one for each gate. A 100 ft fence with posts every 8 ft needs 14 posts.

### How far apart should fence posts be?

This Old House marks post holes every 6 to 8 ft. Posts every 6 ft take more posts and rails: the example fence needs 18 posts and 51 rails instead of 14 and 39.

### How deep should a fence post be?

A third of the post's length, which is half the height above the ground, plus 6 in for the gravel, by Quikrete's instructions. A 6 ft fence needs holes 42 in deep, and deeper where the frost line or the local code asks for it.

### How much concrete does a fence post need?

A 4x4 post 36 in deep in a 10 1/2 in hole takes about 1.55 cubic feet of concrete, about 2.6 bags of 80 lb. The calculator adds up every hole and rounds the bags up for the whole fence.

### How many boards do I need for a privacy fence?

For board-on-board with boards 5 1/2 in wide and 4 in between them in each row, two boards cover 9 1/2 in of fence: 253 boards for 100 ft.

### How many pickets do I need?

Divide the length by the width of a picket plus the gap. Pickets 5 1/2 in wide with 2 1/2 in gaps cover 8 in each: 150 pickets for 100 ft.

### How long should fence posts be?

The height above the ground plus the part in the ground. With a third of the post buried, that is 1 1/2 times the height: a 9 ft post for a 6 ft fence and a 6 ft post for a 4 ft fence.

### Can I use meters?

Yes. Press Metric (m, cm), then type the length, the height and the spacing in meters and the board and post widths in centimeters. Switching units never changes your numbers, only how they are written.

<h2 id="sources">Sources and review date</h2>

The hole width, the depth and the 6 in of gravel come from Quikrete's Setting Posts project sheet. The concrete fill and the gravel come from the Viance guide to building a fence, and the bag yields and the 24-hour wait from the Quikrete Concrete Mix No. 1101 data sheet (revised October 2022). The rails by height come from The Home Depot's wood fencing guide, the picket gap from America's Fence Store, the board-on-board spacing from Alta Forest Products, and the post spacing from This Old House (updated June 3, 2026). The 3 1/2 in width of a 4x4 and the 5 1/2 in width of a 1x6 are the dry dressed sizes of DOC PS 20-20, and the metric factors come from NIST Special Publication 811, Appendix B. The sources below show the date we retrieved them, and the review date follows.

Results are estimates. If you find a mistake, tell us: the [corrections section of the about page](/about#corrections) explains how.
