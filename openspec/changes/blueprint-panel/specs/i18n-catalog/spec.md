# Delta for i18n-catalog

New keys for the share action and the drawing, in the site catalogs and the page keys of each calculator, in English and Spanish (neutral tú register). Continues the prefix ICW (next free id: ICW19). Added: [ICW19] to [ICW22]. Every existing requirement is unchanged; completeness, hygiene and the Spanish register rules apply to the new keys as to all others.

## ADDED Requirements

### Requirement: Share and drawing keys

The site catalogs MUST define `site.calculator.shareWhatsApp` (the visible label) and `site.calculator.shareText` (the short message placed before the link) in `en` and `es`. Each calculator that declares the drawing slot MUST define, in both locales, its drawing keys: `calc.rectangle-area.page.drawing` (the accessible-name template, `{length}`, `{width}`, `{area}`), and for `concrete` `calc.concrete.page.drawing.<shape>` (the accessible-name template) and `calc.concrete.page.drawing.<shape>.note` (the worded note: thickness, depth, height, number of steps) for each of `slab`, `footing`, `column` and `steps`. There is no unit key: the labels use the language-free symbols of the shared `dimensionText` (`ft`, `in`, `m`, `cm`) and `ft²`/`m²`. The English keys are what the message-key derivation produces plus nothing else; the share text lives once, in the messages template, and not in the client bundle.

#### Scenario: [ICW19] Share keys exist in both locales
- GIVEN the `en` and `es` site catalogs
- WHEN the keys are read
- THEN `site.calculator.shareWhatsApp` is `Send on WhatsApp` (ES `Enviar por WhatsApp`), `site.calculator.shareText` is a single short sentence with no URL (for example `Check this calculation:`; ES `Mira este cálculo:`), and both keys are non-empty in each locale (a unit test)

#### Scenario: [ICW20] Drawing names exist for every shape
- GIVEN the module of each calculator that declares the `drawing` slot and its catalogs
- WHEN the contract test derives the required `calc.<id>.page.drawing.*` keys from the module's shapes
- THEN `rectangle-area` has `calc.rectangle-area.page.drawing`, and `concrete` has `calc.concrete.page.drawing.<shape>` and `calc.concrete.page.drawing.<shape>.note` for each of `slab`, `footing`, `column` and `steps` (all added in PR 3), and a missing key in either locale fails `i18n-contract.test.ts` naming the key (a contract test)

#### Scenario: [ICW21] Spanish register and hygiene
- GIVEN the new Spanish values
- WHEN the register and hygiene rules run
- THEN the text is in the neutral tú register (no vos, no usted), contains no unit symbol (the labels supply them, language-free), and the English and Spanish placeholders are identical sets (a unit test)

#### Scenario: [ICW22] No message text in the client
- GIVEN the built entries and their static graphs for both calculators after each pull request
- WHEN they are searched for any value of the new keys in either locale
- THEN none is found; the values reach the client only as inert template entries of the page ([CP43], [CWC25]) (a contract test)
