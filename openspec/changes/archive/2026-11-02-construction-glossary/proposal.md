# Proposal: construction-glossary

## Intent

PLAN §5.2 and §6.1: one ES/EN construction glossary for the whole site, kept in `packages/i18n`, that the Spanish adaptation follows and the owner reviews against. Today the Spanish copy says "colado" in the guides and "vaciado" in the concrete calculator, and "balde" for drywall but "cubeta" for paint: nothing keeps the words aligned.

## Decisions

1. **Data, not a document.** `GLOSSARY` (`packages/i18n/src/glossary.ts`, subpath `./glossary`): one entry per concept with the English term, the Spanish term the site uses, the variants it avoids and an optional note. Concepts that look alike but differ (roof pitch vs slope, drywall level of finish vs paint sheen) are separate entries.
2. **The majority of approved copy wins, unless the market says otherwise.** Where the site already uses two words for one concept, the glossary keeps the one most of the approved copy uses ("colado" over "vaciado", 9 to 2). The exception is the pail: the copy said "balde" 12 times and "cubeta" twice, but "cubeta" is the word of the stores most of our readers buy in (Home Depot México lists "cubetas"; joint compound is sold as a "cubeta"), and the paint FAQ asks "¿una cubeta de 5 galones?" the way people search it. So "cubeta" wins and drywall is rewritten.
3. **Enforced like the register.** A contract test scans every Spanish catalog message and every Spanish Markdown entry for an avoided variant, whole word, ignoring case, singular or plural, and names the file or key, the variant and the term to use ([ICW23]). Avoided variants are only words with no other meaning on the site ("saco" is a verb too, so only "saco de" is avoided).
4. **Not a public page yet.** A bilingual glossary page could rank for Spanish-English construction terms; it needs a definition per term and is left for a later change.
