

### Requirement: Public construction glossary

Every glossary entry MUST name one trade of `GLOSSARY_GROUPS` and define the term in one sentence per language. The page `glossary` MUST list every entry once, under its trade, trades in `GLOSSARY_GROUPS` order: the term in the page's language, the term in the other language marked with its `lang`, and the definition in the page's language. The Spanish definitions MUST use no avoided variant and no formal or voseo form. Every page's footer MUST link the glossary.

#### Scenario: [ICW24] The Spanish glossary defines "colado"
- GIVEN `/es/glosario-de-construccion`
- THEN under "Concreto" a row holds "colado", "pour" with `lang="en"`, and "Colocar el concreto fresco en su cimbra, y también el trabajo en sí."
