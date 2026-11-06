import { describe, expect, it } from 'vitest';
import { JOBS } from '../routing/jobs.ts';
import { LOCALES, pathOf, ROUTES } from '../routing/routes.ts';
import { calendarDay } from './calendar-day.ts';
import { chartCards, CHART_OWNERS } from './charts-index.ts';
import { jobView } from './job-view.ts';
import { siteText } from './site-text.ts';

/** Every routed page whose id names a reference chart, read from the route table itself. */
const routedCharts = Object.keys(ROUTES).filter((id) => id.endsWith('-chart'));

describe('chartCards (the data and charts index)', () => {
  it('has reference charts to list', () => {
    expect(routedCharts.length).toBeGreaterThan(0);
  });

  it.each(LOCALES)('lists every routed chart exactly once, in table order, in %s', (locale) => {
    expect(chartCards(locale).map(({ id }) => id)).toEqual(routedCharts);
  });

  it.each(LOCALES)(
    'gives each chart its address, its h1, its description and its checked day in %s',
    (locale) => {
      const text = siteText(locale);
      for (const card of chartCards(locale)) {
        expect(card.href).toBe(pathOf(card.id, locale));
        expect(card.title).toBe(text(`page.${card.id}.heading`));
        expect(card.summary).toBe(text(`page.${card.id}.description`));
        expect(card.updated).toBe(JOBS[card.id].updated);
        expect(card.checked).toBe(calendarDay(JOBS[card.id].updated, locale));
      }
    },
  );

  it('names the owner of every source a chart rests on, and only owners of its sources', () => {
    for (const card of chartCards('en')) {
      const names = (jobView(card.id, 'en').chart?.sources ?? []).map(({ source }) => source.name);
      expect(names.length, card.id).toBeGreaterThan(0);
      const owners = CHART_OWNERS[card.id];
      for (const name of names)
        expect(
          owners.some((owner) => name.includes(owner)),
          `${card.id}: no owner for ${name}`,
        ).toBe(true);
      for (const owner of owners)
        expect(
          names.some((name) => name.includes(owner)),
          `${card.id}: ${owner} owns no source`,
        ).toBe(true);
      expect(card.owners).toEqual(owners);
    }
  });
});
