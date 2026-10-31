# guides

## Requirements

### Requirement: Guide pages

A guide MUST be a route under `/guides/<slug>` and `/es/guias/<slug>`, a `pages` entry in each language rendered with the trust template, and an entry of `GUIDES` naming a routed calculator page. It MUST end with a box holding `site.guide.cta` and a link to that calculator page in the same language, whose text is the calculator's heading.

#### Scenario: [GU1] The concrete guide ends in its calculator
- GIVEN `/es/guias/concreto-en-bolsas-o-camion`
- THEN its last box links `/es/calculadora-de-concreto` with the text "Calculadora de Concreto" under "Haz la cuenta para tu obra"

### Requirement: Sourced facts

Every figure in a guide MUST come from a source the guide lists, or be arithmetic on such figures; prices that vary by store MUST be left to the reader.
