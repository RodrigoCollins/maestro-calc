# Delta for i18n-catalog

## ADDED Requirements

### Requirement: Construction glossary

`packages/i18n` MUST hold one construction glossary: per concept, the English term, the Spanish term the site uses and the Spanish variants it avoids. English terms MUST be unique, and no Spanish term the site uses MAY be avoided by another entry. No Spanish catalog message and no Spanish Markdown entry MAY contain an avoided variant (whole word, any case, singular or plural); the contract test MUST name the file or key, the variant and the term to use instead.

#### Scenario: [ICW23] A pour is a colado
- GIVEN a Spanish entry that writes "la forma del vaciado"
- THEN the glossary contract reports the entry, "vaciado" and "colado"
