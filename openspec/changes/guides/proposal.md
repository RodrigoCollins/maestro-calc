# Proposal: guides

## Intent

PLAN §7.1 and §5: seven guides EN/ES under `/guides/<slug>` and `/es/guias/<slug>`, each ending in its calculator (§7.3, "CTA de guía a calculadora"). This change builds the frame and the first guide, "Concrete: bags or a truck?", tied to the most used calculator.

## Decisions

1. **Guides before hubs.** Three of the six hubs of §7.1 (concrete, drywall, paint) would hold one calculator each today: thin pages that compete with the calculator for the same search. A hub links calculators and guides (§7.3), so the hubs come once there are guides to link.
2. **A guide is a Markdown page of the trust template**: an entry of the `pages` collection (its id in `TRUST_IDS`), a `ROUTES` row under `/guides` and `/es/guias`, `page.<id>.title|description`. Every trust-page rule of `check:site` and every generic browser suite applies with no new template. `GUIDES` (`routing/guides.ts`) ties each guide to its calculator page; the guide ends in a box linking it (`site.guide.cta`, the calculator's heading as the link).
3. **Facts with sources, no invented prices.** Bag yields come from the QUIKRETE data sheet the calculator already uses; the arithmetic is exact (27 ft³ per yd³: 45, 60 or 90 bags). Short-load charges come from a public document, the Jefferson County, Missouri, ready-mix bid tabulation of 2020, and are given as an example. ASTM C94's 90-minute discharge limit is not cited: the 2024 edition no longer sets it. Bag prices are left to the reader's store, through the calculator's price fields. Sources are written as text with the URL in code, as the methodology does.
4. **Inline code wraps** (`.prose code { overflow-wrap: anywhere }`): a source URL showed past the column on a phone.
5. **Copy pending** the owner's reading (`ownerReview: pending`).
6. **Follow-ups:** the calculator page linking back to its guides, `Article` JSON-LD and a breadcrumb come with the next guides or the hubs.
