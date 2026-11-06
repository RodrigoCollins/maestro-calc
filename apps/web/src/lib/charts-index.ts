import type { Locale } from '@maestro-calc/i18n';
import { CHART_IDS, JOBS, type ChartId } from '../routing/jobs.ts';
import { pathOf } from '../routing/routes.ts';
import { calendarDay } from './calendar-day.ts';
import { siteText } from './site-text.ts';

/*
 * The data and charts index: every reference chart (`CHART_IDS`, the jobs whose id ends in
 * `-chart`) with its description, the day its figures were checked and who publishes the sources
 * they rest on, so a reporter who lands on one chart finds the others. A new chart is listed
 * without an edit here, except its owners: `CHART_OWNERS` is keyed by every chart id, so a chart
 * without them is a type error, and the index test holds each owner to the chart's own sources.
 */

/**
 * Who publishes the sources of each chart, as each source names it: every source of the chart
 * names one of them, and each of them names a source.
 */
export const CHART_OWNERS = {
  'concrete-slab-chart': ['QUIKRETE'],
  'roof-pitch-chart': ['International Residential Code'],
  'square-feet-to-square-meters-chart': ['NIST'],
  'cubic-yard-weight-chart': ['WisDOT', 'New Mexico EMNRD', 'FHWA', 'WSDOT', 'USDA NRCS', 'US EPA'],
  'decimal-feet-chart': ['NIST'],
} as const satisfies Record<ChartId, readonly [string, ...string[]]>;

/** One chart of the index. */
export interface ChartCard {
  readonly id: ChartId;
  readonly href: string;
  /** The chart's h1. */
  readonly title: string;
  /** The chart's description, one line. */
  readonly summary: string;
  /** The day the figures were last checked, `YYYY-MM-DD`. */
  readonly updated: string;
  /** That day in the long form of the locale. */
  readonly checked: string;
  /** Who publishes its sources. */
  readonly owners: readonly string[];
}

/** The reference charts in table order, each as the index shows it in `locale`. */
export const chartCards = (locale: Locale): ChartCard[] => {
  const text = siteText(locale);
  return CHART_IDS.map((id) => ({
    id,
    href: pathOf(id, locale),
    title: text(`page.${id}.heading`),
    summary: text(`page.${id}.description`),
    updated: JOBS[id].updated,
    checked: calendarDay(JOBS[id].updated, locale),
    owners: CHART_OWNERS[id],
  }));
};
