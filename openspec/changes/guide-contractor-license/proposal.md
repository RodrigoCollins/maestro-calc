# Proposal: guide-contractor-license

## Intent

PLAN §5.4, guide 7: "How to get a contractor license in the US", EN/ES. It is the last guide of the MVP and the only one with no calculator of its own (its trade is the business).

## Decisions

1. **A guide may end in the calculator directory.** `GUIDES` rows keep `calculator`, now `CalculatorPageId | null`; `null` means the guide ends in a box linking the home (where every calculator is listed), named by `site.guide.allCalculators` ("All our calculators" / "Todas nuestras calculadoras"). No calculator page links back to such a guide, and it belongs to no hub.
2. **`check:site` keeps both directions.** `Site.guides` becomes the page each guide ends in (`home` for a `null` row); the link back is asked of calculator pages only.
3. **A method, not a state table.** The guide teaches the steps every state shares (find the board, check whether the work needs a license, document the experience, pass the exams, bond and insurance, the business, another state) and shows each with an official example: California (CSLB: the $1,000 threshold, four years of experience, the $25,000 bond, the ten exams offered in Spanish) and Texas (TDLR: every electrical job needs a license). No fees and no other states: every figure comes from the board's own page, and the guide says it is general information, not legal advice.
4. **Same frame as the other guides.** `ROUTES` row, `TRUST_IDS` entry, `page.<id>.title|description` in both site catalogs, end-state counts (29 ids, 58 URLs, 60 pages).
