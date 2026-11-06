import { describe, expect, it } from 'vitest';
import { renderComponent } from '../__testing__/render-component.ts';
import { chartCards } from '../lib/charts-index.ts';
import { siteText } from '../lib/site-text.ts';
import { LOCALES } from '../routing/routes.ts';
import ChartsIndex from './ChartsIndex.astro';

/** The props the page passes, from the chart cards and the site catalog of `locale`. */
const render = (locale: (typeof LOCALES)[number]) => {
  const text = siteText(locale);
  return renderComponent(ChartsIndex, {
    cards: chartCards(locale),
    checkedLabel: text('site.charts.checked'),
    sourcesLabel: text('site.charts.sources'),
    press: { heading: text('site.charts.press.heading'), text: text('site.charts.press.text') },
  });
};

// the data and charts index: every chart with its line, its day and its owners, then the press note
describe('ChartsIndex (the data and charts index)', () => {
  it.each(LOCALES)(
    'links every chart with its description, day and owners in %s',
    async (locale) => {
      const document = await render(locale);
      const text = siteText(locale);
      const items = document.querySelectorAll('section.charts-index li');
      const cards = chartCards(locale);
      expect(items).toHaveLength(cards.length);
      cards.forEach((card, index) => {
        const item = items[index];
        expect(item?.querySelector('a')?.getAttribute('href')).toBe(card.href);
        expect(item?.querySelector('a')?.text.trim()).toBe(card.title);
        expect(item?.text).toContain(card.summary);
        expect(item?.text).toContain(`${text('site.charts.checked')} ${card.checked}`);
        expect(item?.text).toContain(`${text('site.charts.sources')} ${card.owners.join(', ')}`);
      });
    },
  );

  it.each(LOCALES)(
    'ends with the note for journalists and the press address in %s',
    async (locale) => {
      const document = await render(locale);
      const text = siteText(locale);
      expect(document.querySelector('section.charts-press h2')?.text.trim()).toBe(
        text('site.charts.press.heading'),
      );
      expect(document.querySelector('section.charts-press p')?.text).toContain(
        'press@maestrocalc.com',
      );
    },
  );

  it('shows no time element: the page has one, its own update day', async () => {
    expect((await render('en')).querySelectorAll('time')).toHaveLength(0);
  });
});
