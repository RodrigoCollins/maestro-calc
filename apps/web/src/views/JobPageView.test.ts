import { describe, expect, it } from 'vitest';
import { renderComponent } from '../__testing__/render-component.ts';
import { CHART_SOURCES_ID, calculatorSourcesHref } from '../lib/byline.ts';
import { JOBS } from '../routing/jobs.ts';
import { pathOf } from '../routing/routes.ts';
import JobPageView from './JobPageView.astro';

const render = (id: keyof typeof JOBS, locale: 'en' | 'es') =>
  renderComponent(JobPageView, { id, locale }, { partial: false });

// editorial policy: a job page or chart is signed under its h1, with its day and its sources
describe('JobPageView byline (editorial policy)', () => {
  it.each(['en', 'es'] as const)(
    'signs a chart and points at its own sources in %s',
    async (locale) => {
      const document = await render('concrete-slab-chart', locale);
      const byline = document.querySelector('main h1 + .byline');
      expect(byline?.querySelectorAll('a').map((a) => a.getAttribute('href'))).toEqual([
        pathOf('editorial-policy', locale),
        `#${CHART_SOURCES_ID}`,
      ]);
      expect(document.querySelector(`main h2#${CHART_SOURCES_ID}`)).not.toBeNull();
      const times = document.querySelectorAll('main time');
      expect(times).toHaveLength(1);
      expect(times[0]?.getAttribute('datetime')).toBe(JOBS['concrete-slab-chart'].updated);
    },
  );

  it('points a job page without a chart at the sources of its calculator', async () => {
    const document = await render('concrete-slab-10x10', 'es');
    const links = document.querySelectorAll('main .byline a').map((a) => a.getAttribute('href'));
    expect(links).toEqual([
      pathOf('editorial-policy', 'es'),
      calculatorSourcesHref(JOBS['concrete-slab-10x10'].calculator, 'es'),
    ]);
    expect(document.querySelectorAll('main time')).toHaveLength(1);
  });
});
