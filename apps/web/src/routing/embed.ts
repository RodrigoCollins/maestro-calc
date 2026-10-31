import type { Locale } from '@maestro-calc/i18n';
import { LOCALES, pathOf } from './routes.ts';
import { CALCULATOR_PAGES, type CalculatorPageId } from './templates.ts';

/*
 * The embed pages (embed): one per calculator page and language, at `/embed` + the page's path, so
 * a new calculator page gets its embed with no edit. They are not routes: the route table, the
 * sitemap and the language alternates never list them.
 */

const PREFIX = '/embed';

/** The other language of each: the target of an embed's language switch. */
export const OTHER_LOCALE: Readonly<Record<Locale, Locale>> = { en: 'es', es: 'en' };

/** `/embed/concrete-calculator`, `/embed/es/calculadora-de-concreto`. */
export const embedPathOf = (id: CalculatorPageId, locale: Locale): string =>
  `${PREFIX}${pathOf(id, locale)}`;

export interface Embed {
  readonly id: CalculatorPageId;
  readonly locale: Locale;
  /** Where the embed is served. */
  readonly path: string;
  /** The full page it embeds: its canonical and the target of its brand link. */
  readonly page: string;
  /** The same calculator's embed in the other language: the target of the language switch. */
  readonly other: string;
}

export const EMBEDS: readonly Embed[] = CALCULATOR_PAGES.flatMap((id) =>
  LOCALES.map((locale) => ({
    id,
    locale,
    path: embedPathOf(id, locale),
    page: pathOf(id, locale),
    other: embedPathOf(id, OTHER_LOCALE[locale]),
  })),
);
