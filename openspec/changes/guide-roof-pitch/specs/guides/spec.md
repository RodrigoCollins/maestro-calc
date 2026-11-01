# guides

## MODIFIED Requirements

### Requirement: Guide pages

A guide MUST be a route under `/guides/<slug>` and `/es/guias/<slug>`, a `pages` entry in each language rendered with the trust template, and an entry of `GUIDES` naming a routed calculator page. It MUST end with a box holding `site.guide.cta` and a link to that calculator page in the same language, whose text is the calculator's heading.

#### Scenario: [GU5] The roof pitch guide ends in its calculator
- GIVEN `/guides/how-to-measure-roof-pitch`
- THEN its last box links `/roof-pitch-calculator` with the text "Roof Pitch Calculator" under "Work it out for your job"
