# hubs

## Requirements

### Requirement: Hub pages

A hub MUST be a route `/<slug>` and `/es/<slug>`, a `pages` entry in each language rendered with the trust template, and an entry of `HUBS` naming at least one routed calculator page and any guides of those calculators. After its intro it MUST list a card per calculator (the home card's title linking the calculator page, and its summary) and, when it has guides, a link per guide with the guide's heading, all in the page's language.

#### Scenario: [HB1] The Spanish concrete hub lists its calculator and guides
- GIVEN `/es/concreto`
- THEN it holds a card linking `/es/calculadora-de-concreto` and links to `/es/guias/concreto-en-bolsas-o-camion` and `/es/guias/como-cotizar-un-trabajo-de-concreto`

#### Scenario: [HB4] The paint hub lists its calculator and its guide
- GIVEN `/painting`
- THEN it holds a card linking `/paint-calculator` and a link to `/guides/how-to-quote-a-painting-job`
- AND `/paint-calculator` holds "More tools:" and a link to `/painting`

### Requirement: Calculator pages link their hub

A calculator page whose calculator is in a hub MUST hold, after its copy, `site.hub.more` and a link to that hub in the same language, named with the hub's page title without the site name. A calculator page whose trade has no hub MUST NOT hold it. `check:site` MUST report a hub that does not list one of its calculators, and a calculator page without the link to its hub, in each language.

#### Scenario: [HB3] The Spanish gravel calculator links the landscaping hub
- GIVEN `/es/calculadora-de-grava`
- THEN it holds "Más herramientas:" and a link to `/es/jardineria` named "Calculadoras de jardinería"
