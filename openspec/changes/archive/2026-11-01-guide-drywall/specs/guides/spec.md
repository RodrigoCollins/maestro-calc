# guides

## MODIFIED Requirements

### Requirement: Guide pages

A guide MUST be a route under `/guides/<slug>` and `/es/guias/<slug>`, a `pages` entry in each language rendered with the trust template, and an entry of `GUIDES` naming a routed calculator page. It MUST end with a box holding `site.guide.cta` and a link to that calculator page in the same language, whose text is the calculator's heading.

#### Scenario: [GU4] The drywall guide ends in its calculator
- GIVEN `/es/guias/como-calcular-y-cotizar-un-trabajo-de-drywall`
- THEN its last box links `/es/calculadora-de-drywall` with the text "Calculadora de Drywall" under "Haz la cuenta para tu obra"
