# Proposal: glossary-page

## Intent

Publish the construction glossary of `construction-glossary` as a page, EN/ES (`/construction-glossary`, `/es/glosario-de-construccion`): Spanish-English construction terms are searched by exactly the readers the site is for, and the page shows that the site's words are chosen on purpose.

## Decisions

1. **The data stays in `packages/i18n`.** Each `GLOSSARY` entry gains a `group` (one of seven trades, `GLOSSARY_GROUPS`) and a one-sentence `define` per language. Definitions use only facts the site already publishes or that are exact (27 cubic feet in a cubic yard, 2.54 cm in an inch); the Spanish ones follow the glossary and the neutral tú register, both checked.
2. **A trust page with a generated table.** A short Markdown intro, then `GlossaryTable` renders `glossaryView(locale)`: one `h2` and one table per trade, the page language's term first (row header), the other language's term (with its `lang`) and the definition.
3. **Linked from the footer** of every page ("Construction glossary" / "Glosario de obra"), after the embed page.
4. Counts: 32 ids, 64 URLs, 66 pages.
