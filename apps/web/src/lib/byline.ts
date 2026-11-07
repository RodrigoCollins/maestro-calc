import type { Locale } from '@maestro-calc/i18n';
import { pathOf } from '../routing/routes.ts';
import type { CalculatorPageId } from '../routing/templates.ts';
import { calendarDay } from './calendar-day.ts';
import { siteText } from './site-text.ts';

/**
 * The byline of a guide or a chart (editorial policy): the editorial team that signs the page,
 * linked to the policy, the day the page was last reviewed (the date it already carries, never
 * one written per page) and, when the page has them, where its sources are listed.
 */
export interface Byline {
  readonly by: string;
  readonly team: string;
  readonly teamHref: string;
  readonly reviewed: string;
  /** The ISO day, for the `datetime` of the `<time>`. */
  readonly updated: string;
  /** The same day in the long form of the locale. */
  readonly shown: string;
  readonly sources?: { readonly label: string; readonly href: string };
}

export const bylineOf = (
  locale: Locale,
  updated: string,
  sourcesHref: string | undefined,
): Byline => {
  const text = siteText(locale);
  return {
    by: text('site.byline.by'),
    team: text('site.byline.team'),
    teamHref: pathOf('editorial-policy', locale),
    reviewed: text('site.byline.reviewed'),
    updated,
    shown: calendarDay(updated, locale),
    ...(sourcesHref === undefined
      ? {}
      : { sources: { label: text('site.byline.sources'), href: sourcesHref } }),
  };
};

/** The id of the last section of a calculator page, where it links its sources (calculator-page › [CP5]). */
const SOURCES_ID = { en: 'sources', es: 'fuentes' } as const satisfies Record<Locale, string>;

/** The sources section of a calculator page in a locale. */
export const calculatorSourcesHref = (calculator: CalculatorPageId, locale: Locale): string =>
  `${pathOf(calculator, locale)}#${SOURCES_ID[locale]}`;

/** The id of the sources heading of a chart page, which its byline points at. */
export const CHART_SOURCES_ID = 'chart-sources';
