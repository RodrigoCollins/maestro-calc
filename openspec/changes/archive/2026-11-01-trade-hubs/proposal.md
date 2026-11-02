# Proposal: trade-hubs

## Intent

PLAN §7.1 and §7.3: hubs per trade that link the calculators and guides of the same trade. The guides change deferred them (decision 1) until there were guides to link; six guides are live now.

## Decisions

1. **Five hubs**: concrete, roofing, drywall, landscaping and measurement, EN/ES (`/concrete` · `/es/concreto`, `/roofing` · `/es/techos`, `/drywall` · `/es/drywall`, `/landscaping` · `/es/jardineria`, `/measurement` · `/es/medidas`). Paint waits: one calculator and no guide would be the thin page decision 1 avoided.
2. **Same frame as the guides**: each hub is a Markdown page of the trust template (`TRUST_IDS`, a `ROUTES` row, `page.<id>.title|description`), with a short intro built only from facts already published on the site, and `HUBS` (`routing/hubs.ts`) listing its calculators and guides. A calculator belongs to one hub at most; a guide sits in the hub of its calculator.
3. **The directory reuses the home cards** (`homeCards`): each calculator card shows the same title and summary as the home; guides link with their own heading. Two catalog keys: `site.hub.calculators`, `site.hub.guides`.
4. **Copy approved by delegation** (2026-11-01): `ownerReview: approved`.
5. **Follow-ups**: link each hub from its calculator pages and the home, a `check:site` rule for the hub links, and the paint hub with its guide.
6. **Also archives** `analytics-events` (#170, #171 deployed; Tag Manager configured and verified in GA4 Realtime).
