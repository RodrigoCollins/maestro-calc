import { isChartId } from '../routing/jobs.ts';
import { LOCALES, pathOf } from '../routing/routes.ts';
import { fileOf } from './files.ts';
import { problem } from './types.ts';
import type { CheckContext, Problem } from './types.ts';

/*
 * The data and charts index: once the table has the `charts` page, it lists every reference chart
 * (a job whose id ends in `-chart`) and every chart links back to it, each in its own language, so
 * a reader who lands on one chart finds the others. A missing page is the file set's problem.
 */

const RULE = 'chart-index';
const INDEX = 'charts';

const hrefsOf = (context: CheckContext, file: string): string[] | undefined =>
  context.pages
    .find((page) => page.file === file)
    ?.root.querySelectorAll('main a')
    .map((link) => link.getAttribute('href') ?? '');

export const chartIndexProblems = (context: CheckContext): Problem[] => {
  const { site } = context;
  if (!Object.hasOwn(site.routes, INDEX)) return [];
  const charts = Object.keys(site.jobs).filter(isChartId);
  return LOCALES.flatMap((locale) => {
    const indexPath = pathOf(INDEX, locale, site.routes);
    const indexFile = fileOf(indexPath);
    const listed = hrefsOf(context, indexFile);
    return [
      ...charts.flatMap((chart) => {
        const chartPath = pathOf(chart, locale, site.routes);
        return listed === undefined || listed.includes(chartPath)
          ? []
          : [problem(indexFile, RULE, `the charts index must list the chart ${chartPath}`)];
      }),
      ...charts.flatMap((chart) => {
        const chartFile = fileOf(pathOf(chart, locale, site.routes));
        const out = hrefsOf(context, chartFile);
        return out === undefined || out.includes(indexPath)
          ? []
          : [problem(chartFile, RULE, `the chart must link the charts index ${indexPath}`)];
      }),
    ];
  });
};
