# hubs

## ADDED Requirements

### Requirement: Hub pages

A hub MUST be a route `/<slug>` and `/es/<slug>`, a `pages` entry in each language rendered with the trust template, and an entry of `HUBS` naming at least one routed calculator page and any guides of those calculators. After its intro it MUST list a card per calculator (the home card's title linking the calculator page, and its summary) and, when it has guides, a link per guide with the guide's heading, all in the page's language.

#### Scenario: [HB1] The Spanish concrete hub lists its calculator and guides
- GIVEN `/es/concreto`
- THEN it holds a card linking `/es/calculadora-de-concreto` and links to `/es/guias/concreto-en-bolsas-o-camion` and `/es/guias/como-cotizar-un-trabajo-de-concreto`
