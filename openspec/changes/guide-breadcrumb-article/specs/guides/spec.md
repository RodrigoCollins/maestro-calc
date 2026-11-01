# guides

## ADDED Requirements

### Requirement: Guide breadcrumb and structured data

A guide page MUST open, before its `h1`, with a labelled breadcrumb of two items (the home in its language, then the guide's heading), and MUST declare exactly one `Article` and one `BreadcrumbList` as JSON-LD: the Article's `headline` is the `h1`, its `url` the canonical, its `inLanguage` the page's language tag and its `dateModified` the entry's `updated` day, written and published by the organization, with no image, rating or person. `check:site` MUST report a guide without the breadcrumb, without either node, with any other type, or with an Article that differs from the page.

#### Scenario: [GU9] The Spanish roof guide has its breadcrumb and Article
- GIVEN `/es/guias/como-medir-la-pendiente-de-un-techo`
- THEN it opens with "Inicio" linking `/es` and then "Cómo medir un techo y entender su pendiente"
- AND its JSON-LD holds one `Article` with that headline, `inLanguage` `es-US` and the canonical url, and one `BreadcrumbList` with the same two items
