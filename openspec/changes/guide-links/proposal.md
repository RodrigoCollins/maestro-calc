# Proposal: guide-links

## Intent

A follow-up of the guides change (decision 6): each calculator page links back to the guides that end in it, so a reader of the calculator finds the guide and search engines see the pair linked both ways.

## Decisions

1. **One box after the calculator's copy**, outside `.prose`, so the five content sections and their checks are unchanged. It has the look of the guide's own end box, a short label (`site.guide.links`) and one link per guide. No `h2`: the page's sections stay as the content contract pins them.
2. **The link text is the guide's own `#` heading**, read from its `pages` entry (`headingOf`), so it never drifts from the guide; `guidesOf` derives the list from `GUIDES`, in table order. A calculator without a guide renders nothing.
3. **`check:site` holds both directions** on the real build: rule `guide-link` asks each guide page for its end box linking the calculator in the same language, and each calculator page for its link back. `Site` gains `guides` (guide id → calculator id); the fixture renders both boxes, so a valid fixture build stays valid.
4. **Cost:** the box's CSS (about 390 B) is inlined on every calculator page, also the ones without a guide; well inside the 20,480 B CSS budget.
