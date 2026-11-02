import type { Locale } from '@maestro-calc/i18n';
import { GLOSSARY, GLOSSARY_GROUPS } from '@maestro-calc/i18n/glossary';
import type { GlossaryGroup } from '@maestro-calc/i18n/glossary';
import { siteText } from './site-text.ts';

/*
 * The public construction glossary (i18n-catalog › Construction glossary): every entry of
 * `GLOSSARY` under its trade, the term of the page language first, then the other language's term
 * and the definition in the page language.
 */

export interface GlossaryRow {
  readonly term: string;
  readonly other: string;
  readonly definition: string;
}

export interface GlossaryView {
  readonly columns: readonly [string, string, string];
  /** The language of the second column, for its `lang` attribute. */
  readonly otherLocale: Locale;
  readonly groups: readonly {
    readonly id: GlossaryGroup;
    readonly label: string;
    readonly rows: readonly GlossaryRow[];
  }[];
}

export const glossaryView = (locale: Locale): GlossaryView => {
  const text = siteText(locale);
  return {
    columns: [
      text('site.glossary.term'),
      text('site.glossary.other'),
      text('site.glossary.definition'),
    ],
    otherLocale: locale === 'en' ? 'es' : 'en',
    groups: GLOSSARY_GROUPS.map((id) => ({
      id,
      label: text(`site.glossary.groups.${id}`),
      rows: GLOSSARY.filter((entry) => entry.group === id).map(({ en, es, define }) => ({
        term: locale === 'en' ? en : es,
        other: locale === 'en' ? es : en,
        definition: define[locale],
      })),
    })),
  };
};
