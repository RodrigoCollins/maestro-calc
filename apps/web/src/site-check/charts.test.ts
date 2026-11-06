import { describe, expect, it } from 'vitest';
import { jobSite } from './__testing__/page-fixture.ts';
import { chartIndexProblems } from './charts.ts';
import { contextOf } from './checks.ts';
import type { Site } from './types.ts';

/** The job fixture with two reference charts and, unless `index` is false, the charts index. */
const chartSite = (index = true): Site => {
  const site = jobSite();
  return {
    ...site,
    routes: {
      ...site.routes,
      ...(index ? { charts: { en: '/charts', es: '/es/tablas' } } : {}),
      'concrete-slab-chart': { en: '/slab-chart', es: '/es/tabla-de-losas' },
      'roof-pitch-chart': { en: '/pitch-chart', es: '/es/tabla-de-pendientes' },
    },
    jobs: { ...site.jobs, 'concrete-slab-chart': 'concrete', 'roof-pitch-chart': 'concrete' },
  };
};

const page = (links: readonly string[]): string =>
  `<!doctype html><html><body><main>${links.map((href) => `<a href="${href}">x</a>`).join('')}</main></body></html>`;

/** A build in which the index links every chart and every chart links the index, both languages. */
const validDist = (): Map<string, string> =>
  new Map([
    ['charts.html', page(['/slab-chart', '/pitch-chart'])],
    ['es/tablas.html', page(['/es/tabla-de-losas', '/es/tabla-de-pendientes'])],
    ['slab-chart.html', page(['/charts'])],
    ['pitch-chart.html', page(['/charts'])],
    ['es/tabla-de-losas.html', page(['/es/tablas'])],
    ['es/tabla-de-pendientes.html', page(['/es/tablas'])],
  ]);

const messagesOf = (dist: Map<string, string>, site: Site = chartSite()): string[] =>
  chartIndexProblems(contextOf(dist, site, new Map())).map(
    ({ file, rule, message }) => `${file} ${rule}: ${message}`,
  );

// the data and charts index lists every reference chart, and every chart links back to it
describe('chart index links (check:site)', () => {
  it('asks nothing of a site without the charts index', () => {
    expect(messagesOf(new Map(), chartSite(false))).toEqual([]);
  });

  it('accepts a build where the index and the charts link one another in both languages', () => {
    expect(messagesOf(validDist())).toEqual([]);
  });

  it('names each chart the index does not list, per language', () => {
    const dist = validDist();
    dist.set('charts.html', page(['/slab-chart']));
    dist.set('es/tablas.html', page([]));
    expect(messagesOf(dist)).toEqual([
      'charts.html chart-index: the charts index must list the chart /pitch-chart',
      'es/tablas.html chart-index: the charts index must list the chart /es/tabla-de-losas',
      'es/tablas.html chart-index: the charts index must list the chart /es/tabla-de-pendientes',
    ]);
  });

  it('names a chart that does not link the index of its language', () => {
    const dist = validDist();
    dist.set('es/tabla-de-losas.html', page(['/charts']));
    expect(messagesOf(dist)).toEqual([
      'es/tabla-de-losas.html chart-index: the chart must link the charts index /es/tablas',
    ]);
  });

  it('counts an anchor with no address as no link', () => {
    const dist = validDist();
    dist.set('pitch-chart.html', '<!doctype html><html><body><main><a>x</a></main></body></html>');
    expect(messagesOf(dist)).toEqual([
      'pitch-chart.html chart-index: the chart must link the charts index /charts',
    ]);
  });

  it('asks nothing of a job page that is not a chart', () => {
    const dist = validDist();
    dist.set('concrete-slab-12x12.html', page([]));
    expect(messagesOf(dist)).toEqual([]);
  });
});
