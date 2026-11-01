# guides

## Requirements

### Requirement: Guide pages

A guide MUST be a route under `/guides/<slug>` and `/es/guias/<slug>`, a `pages` entry in each language rendered with the trust template, and an entry of `GUIDES` naming a routed calculator page. It MUST end with a box holding `site.guide.cta` and a link to that calculator page in the same language, whose text is the calculator's heading.

#### Scenario: [GU1] The concrete guide ends in its calculator
- GIVEN `/es/guias/concreto-en-bolsas-o-camion`
- THEN its last box links `/es/calculadora-de-concreto` with the text "Calculadora de Concreto" under "Haz la cuenta para tu obra"

#### Scenario: [GU2] The tape measure guide ends in its calculator
- GIVEN `/guides/read-a-tape-measure-and-add-fractions`
- THEN its last box links `/feet-and-inches-calculator` with the text "Feet and Inches Calculator" under "Work it out for your job"

#### Scenario: [GU3] The square footage guide ends in its calculator
- GIVEN `/es/guias/como-calcular-pies-cuadrados`
- THEN its last box links `/es/calculadora-de-pies-cuadrados` with the text "Calculadora de pies cuadrados" under "Haz la cuenta para tu obra"

### Requirement: Sourced facts

Every figure in a guide MUST come from a source the guide lists, or be arithmetic on such figures; prices that vary by store MUST be left to the reader.
