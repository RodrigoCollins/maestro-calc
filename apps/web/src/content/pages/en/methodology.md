---
id: methodology
locale: en
updated: 2026-10-23
ownerReview: pending
---

# How we calculate

Maestro Calc builds jobsite calculators. This page describes the rules every calculator follows, and it lists the formulas, the yields and the test cases of the calculator we publish today, the concrete calculator. Every calculator we publish follows everything below.

## Exact calculations

Calculations use exact numbers, written as fractions, from the first input to the last step. Nothing is rounded along the way. A result is rounded once, when it is shown to you, and the calculator tells you how it was rounded.

## Tested formulas

Every formula has automated tests. Each test uses a case worked out by hand, so a wrong formula fails a test before it reaches you.

## Sources and review dates

Each calculator page names its sources and shows the date we last reviewed them. When a source changes, we review the calculator again.

<!-- A raw h2 element keeps the section anchor stable if the heading is reworded. -->

<h2 id="concrete">Concrete calculator</h2>

The [concrete calculator](/concrete-calculator) estimates the concrete for a slab, a footing, a column or a set of steps, and the bags of mix to buy. Every length is kept as an exact number, and the result is rounded only when it is shown.

Each shape starts from a volume:

- Slab: length × width × thickness.
- Footing: length × width × depth × pieces.
- Column, a cylinder: π × (diameter / 2)² × height × pieces.
- Steps: step width × run × rise × N(N+1)/2, where N is the number of steps. Each step is a full-height block from the ground to its own tread.

The extra for waste is added to the volume before the bags are counted: total volume = volume × (1 + extra / 100). The number of bags is the total volume divided by the volume one bag makes, rounded up to a whole bag. The 10 percent extra we start with is a rule of thumb that you can change, not a standard.

A bag makes approximately 0.30 cubic feet (40 lb), 0.45 cubic feet (60 lb) or 0.60 cubic feet (80 lb). These yields come from the manufacturer's data sheet: QUIKRETE Concrete Mix No. 1101 data sheet (product nos. 1101-40, 1101-60, 1101-80), revised October 2022, `https://www.quikrete.com/PDFs/DATA_SHEET-Concrete%20Mix%201101.pdf`, retrieved 2026-10-25. Real yields vary with the product and the mix, so treat the bag count as an estimate.

The column uses π = 3.14159265358979323846264338327950288. It is an approximation, and its error is less than 10^-35.

Hand-verified cases. The automated tests run these cases through the calculator and compare every figure below with the result. Volumes are in cubic feet, and bags are 80 lb bags.

| Case                                                                  | Volume before extra | Volume with 10% extra | Cubic yards | Bags |
| --------------------------------------------------------------------- | ------------------- | --------------------- | ----------- | ---- |
| Slab, 12 ft × 10 ft × 4 in (`default`)                                | 40.00               | 44.00                 | 1.63        | 74   |
| Footing, 18 ft × 16 in × 8 in, 3 pieces (`?v=1&sh=footing&l=216&n=3`) | 48.00               | 52.80                 | 1.96        | 88   |
| Column, 12 in diameter × 8 ft, 1 piece (`?v=1&sh=column`)             | 6.28                | 6.91                  | 0.26        | 12   |
| Steps, 3 steps, 4 ft wide, 7 in rise, 11 in run (`?v=1&sh=steps`)     | 12.83               | 14.12                 | 0.52        | 24   |

## Corrections

If you find a mistake, tell us. The [corrections section of the about page](/about#corrections) explains how to report it and how we log the fix.
