# Proposal: guides-tape-measure-square-footage

## Intent

PLAN §5.4, guides 5 and 6: "How to read a tape measure and add fractions", ending in the feet and inches calculator, and "How to calculate square footage", ending in the square footage calculator, EN/ES. They are the second and third guides of seven and need no price or code citation: every figure is a definition or exact arithmetic.

## Decisions

1. **Same frame as the first guide.** Per guide, a `ROUTES` row under `/guides` and `/es/guias`, a `TRUST_IDS` entry, a `GUIDES` row tied to its calculator (`feet-inches`, `rectangle-area`), `page.<id>.title|description` in both site catalogs. No new template, component or style.
2. **Facts with sources.** A foot is 12 inches, an inch is exactly 25.4 mm and a foot exactly 0.3048 m (NIST SP 811, Appendix B, the source the methodology already cites). Waste allowances for flooring are left to the maker of each product, with no invented percentage. The marks of a tape (sixteenths, the 16 in stud marks, the 19.2 in marks) are described as what most tapes show, with no brand claim; 19.2 in is 96 in divided by 5, said as arithmetic.
3. **Worked examples match the calculator.** Every sum, difference and division in the guide is one the calculator returns with the same rounding to the nearest 1/16 in; the guide's examples are checked by hand in `tasks.md`.
4. **Copy pending** the owner's reading (`ownerReview: pending`).
5. **Follow-ups unchanged:** the calculator page linking back to its guides, `Article` JSON-LD and a breadcrumb.
