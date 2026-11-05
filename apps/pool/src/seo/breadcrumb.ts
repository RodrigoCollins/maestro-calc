import { HOME_TOOLS } from '../home.ts';
import { SITE } from '../site.config.ts';

/** One step of a breadcrumb: what it is called and its canonical path. */
export interface Crumb {
  readonly name: string;
  readonly path: string;
}

/**
 * The breadcrumb of a job page: the home, the calculator it belongs to (named by its home card,
 * "Pool salt calculator"), then the page itself, named by its title without the site. It is drawn
 * above the page heading and given to search engines as its `BreadcrumbList`.
 */
export const jobTrailOf = (job: {
  readonly path: string;
  readonly title: string;
  readonly calculator: { readonly path: string };
}): readonly Crumb[] => {
  const tool = HOME_TOOLS.find(({ href }) => href === job.calculator.path);
  if (tool === undefined) throw new Error(`no calculator ${job.calculator.path}`);
  return [
    { name: SITE.name, path: '/' },
    { name: `${tool.title} calculator`, path: tool.href },
    { name: job.title.replace(/\s*\|\s*Pool Figures$/, ''), path: job.path },
  ];
};
