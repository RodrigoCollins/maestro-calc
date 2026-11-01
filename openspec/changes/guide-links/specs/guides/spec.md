# guides

## ADDED Requirements

### Requirement: Calculator pages link their guides

A calculator page that a guide ends in MUST hold, after its copy, a box with `site.guide.links` and one link per such guide in the same language, whose text is the guide's heading, in `GUIDES` order. A calculator page that no guide ends in MUST NOT hold the box. `check:site` MUST report a guide page without its end link and a calculator page without the link back.

#### Scenario: [GU6] The roof pitch calculator links its guide
- GIVEN `/es/calculadora-de-pendiente-de-techo`
- THEN it holds a box "Aprende más en nuestras guías" linking `/es/guias/como-medir-la-pendiente-de-un-techo` with the text "Cómo medir un techo y entender su pendiente"

#### Scenario: [GU7] A calculator without a guide has no box
- GIVEN `/gravel-calculator`
- THEN it holds no guide box
