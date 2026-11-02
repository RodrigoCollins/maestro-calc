# Delta for guides

## MODIFIED Requirements

### Requirement: Guide pages

A guide MUST be a route under `/guides/<slug>` and `/es/guias/<slug>`, a `pages` entry in each language rendered with the trust template, and an entry of `GUIDES` naming a routed calculator page or `null`. It MUST end with a box holding `site.guide.cta` and one link in the same language: to that calculator page, whose text is the calculator's heading, or, for `null`, to the home, whose text is `site.guide.allCalculators`.

#### Scenario: [GU10] The contractor license guide ends in every calculator
- GIVEN `/es/guias/como-sacar-la-licencia-de-contratista`
- THEN its last box links `/es` with the text "Todas nuestras calculadoras" under "Haz la cuenta para tu obra"
- AND no calculator page links it
