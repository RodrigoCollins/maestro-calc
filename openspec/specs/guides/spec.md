# guides

## Requirements

### Requirement: Guide pages

A guide MUST be a route under `/guides/<slug>` and `/es/guias/<slug>`, a `pages` entry in each language rendered with the trust template, and an entry of `GUIDES` naming a routed calculator page or `null`. It MUST end with a box holding `site.guide.cta` and one link in the same language: to that calculator page, whose text is the calculator's heading, or, for `null`, to the home, whose text is `site.guide.allCalculators`.

#### Scenario: [GU1] The concrete guide ends in its calculator
- GIVEN `/es/guias/concreto-en-bolsas-o-camion`
- THEN its last box links `/es/calculadora-de-concreto` with the text "Calculadora de Concreto" under "Haz la cuenta para tu obra"

#### Scenario: [GU2] The tape measure guide ends in its calculator
- GIVEN `/guides/read-a-tape-measure-and-add-fractions`
- THEN its last box links `/feet-and-inches-calculator` with the text "Feet and Inches Calculator" under "Work it out for your job"

#### Scenario: [GU3] The square footage guide ends in its calculator
- GIVEN `/es/guias/como-calcular-pies-cuadrados`
- THEN its last box links `/es/calculadora-de-pies-cuadrados` with the text "Calculadora de pies cuadrados" under "Haz la cuenta para tu obra"

#### Scenario: [GU4] The drywall guide ends in its calculator
- GIVEN `/es/guias/como-calcular-y-cotizar-un-trabajo-de-drywall`
- THEN its last box links `/es/calculadora-de-drywall` with the text "Calculadora de Drywall" under "Haz la cuenta para tu obra"

#### Scenario: [GU5] The roof pitch guide ends in its calculator
- GIVEN `/guides/how-to-measure-roof-pitch`
- THEN its last box links `/roof-pitch-calculator` with the text "Roof Pitch Calculator" under "Work it out for your job"

#### Scenario: [GU10] The contractor license guide ends in every calculator
- GIVEN `/es/guias/como-sacar-la-licencia-de-contratista`
- THEN its last box links `/es` with the text "Todas nuestras calculadoras" under "Haz la cuenta para tu obra"
- AND no calculator page links it

#### Scenario: [GU11] The paint guide ends in its calculator
- GIVEN `/es/guias/como-cotizar-un-trabajo-de-pintura`
- THEN its last box links `/es/calculadora-de-pintura` with the text of the paint calculator's heading under "Haz la cuenta para tu obra"

#### Scenario: [GU12] The gravel driveway guide ends in its calculator
- GIVEN `/guides/how-much-gravel-for-a-driveway`
- THEN its last box links `/gravel-calculator` with the text of the gravel calculator's heading under "Work it out for your job"
- AND `/landscaping` lists it

#### Scenario: [GU13] The raised bed guide ends in the topsoil calculator
- GIVEN `/es/guias/cuanta-tierra-para-una-cama-elevada`
- THEN its last box links `/es/calculadora-de-tierra-para-jardin` with the text of the topsoil calculator's heading under "Haz la cuenta para tu obra"
- AND `/es/jardineria` lists it after the gravel driveway guide

#### Scenario: [GU14] The roofing quote guide ends in the roofing calculator
- GIVEN `/guides/how-to-quote-a-roofing-job`
- THEN its last box links `/roofing-calculator` with the text of the roofing calculator's heading under "Work it out for your job"
- AND `/roofing` lists it after the roof pitch guide

#### Scenario: [GU15] The fence post guide ends in the concrete calculator
- GIVEN `/guides/how-much-concrete-for-a-fence-post`
- THEN its last box links `/concrete-calculator` with the text of the concrete calculator's heading under "Work it out for your job"
- AND `/concrete` lists it after the concrete quote guide
- AND `/concrete-calculator` links it third in its guide box

#### Scenario: [GU16] The mulch guide ends in the mulch calculator
- GIVEN `/guides/how-much-mulch-do-i-need`
- THEN its last box links `/mulch-calculator` with the text of the mulch calculator's heading under "Work it out for your job"
- AND `/landscaping` lists it after the raised bed guide
- AND its depth of 2 to 3 inches cites the university extension pages it was read from
- AND every figure of its worked examples is one the mulch calculator shows for the same link, pinned in `apps/web/src/contract/guide-figures.contract.test.ts`, in both languages

#### Scenario: [GU17] The cubic yards guide ends in the gravel calculator
- GIVEN `/guides/how-to-calculate-cubic-yards`
- THEN its last box links `/gravel-calculator` with the text of the gravel calculator's heading under "Work it out for your job"
- AND `/landscaping` lists it after the mulch guide
- AND it links the concrete, gravel, topsoil and mulch calculators, and every figure of its worked examples is one that calculator shows for the same link, pinned in `apps/web/src/contract/guide-figures.contract.test.ts`, in both languages
- AND it states no weight, density or price

#### Scenario: [GU18] The concrete bag coverage guide ends in the concrete calculator
- GIVEN `/guides/how-much-does-a-bag-of-concrete-cover`
- THEN its last box links `/concrete-calculator` with the text of the concrete calculator's heading under "Work it out for your job"
- AND `/concrete` lists it after the fence post guide
- AND `/concrete-calculator` links it fourth in its guide box
- AND its bag yields of 0.30, 0.45 and 0.60 cubic feet cite the manufacturer's data sheet the concrete calculator uses
- AND every figure of its worked examples is one the concrete calculator shows for the same link, pinned in `apps/web/src/contract/guide-figures.contract.test.ts`, in both languages
- AND it links the cubic yards guide, the bags or truck guide and the concrete job pages it names

### Requirement: Calculator pages link their guides

A calculator page that a guide ends in MUST hold, after its copy, a box with `site.guide.links` and one link per such guide in the same language, whose text is the guide's heading, in `GUIDES` order. A calculator page that no guide ends in MUST NOT hold the box. `check:site` MUST report a guide page without its end link and a calculator page without the link back.

#### Scenario: [GU6] The roof pitch calculator links its guide
- GIVEN `/es/calculadora-de-pendiente-de-techo`
- THEN it holds a box "Aprende más en nuestras guías" linking `/es/guias/como-medir-la-pendiente-de-un-techo` with the text "Cómo medir un techo y entender su pendiente"

#### Scenario: [GU7] A calculator without a guide has no box
- GIVEN `/gravel-calculator`
- THEN it holds no guide box

#### Scenario: [GU8] The concrete calculator links both its guides
- GIVEN `/concrete-calculator`
- THEN its guide box links `/guides/concrete-bags-or-truck` and then `/guides/how-to-quote-a-concrete-job`

### Requirement: Guide breadcrumb and structured data

A guide page MUST open, before its `h1`, with a labelled breadcrumb of two items (the home in its language, then the guide's heading), and MUST declare exactly one `Article` and one `BreadcrumbList` as JSON-LD: the Article's `headline` is the `h1`, its `url` the canonical, its `inLanguage` the page's language tag and its `dateModified` the entry's `updated` day, written and published by the organization, with no image, rating or person. `check:site` MUST report a guide without the breadcrumb, without either node, with any other type, or with an Article that differs from the page.

#### Scenario: [GU9] The Spanish roof guide has its breadcrumb and Article
- GIVEN `/es/guias/como-medir-la-pendiente-de-un-techo`
- THEN it opens with "Inicio" linking `/es` and then "Cómo medir un techo y entender su pendiente"
- AND its JSON-LD holds one `Article` with that headline, `inLanguage` `es-US` and the canonical url, and one `BreadcrumbList` with the same two items

### Requirement: Sourced facts

Every figure in a guide MUST come from a source the guide lists, or be arithmetic on such figures; prices that vary by store MUST be left to the reader.
