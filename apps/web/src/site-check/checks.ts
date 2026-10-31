import { assetProblems } from './assets.ts';
import { budgetProblems } from './budgets.ts';
import { contentProblems } from './content.ts';
import { factProblems } from './facts.ts';
import { fileSetProblems, pagesOf } from './files.ts';
import { headProblems } from './head.ts';
import { structureProblems } from './structure.ts';
import { glyphProblems } from './woff2-cmap.ts';
import type { BuildBytes, CheckContext, Dist, Problem, Site } from './types.ts';
import { embedProblems } from './embed.ts';

export type { BuildBytes, CheckContext, Dist, Problem, Site } from './types.ts';
export { budgetSummary } from './budgets.ts';
export { countPending, sourceUrlsOf, updatedOf } from './content.ts';
export { expectedFiles, pageCount, pagesOf } from './files.ts';

/** The context every rule group reads: the pages of `dist` for the site's routes, and the sizes. */
export const contextOf = (dist: Dist, site: Site, sizes: BuildBytes['sizes']): CheckContext => ({
  pages: pagesOf(dist, site.routes),
  dist,
  site,
  sizes,
});

/** Every rule of `check:site` over a built `dist`, in the order the rules are documented. */
export const checkSite = (dist: Dist, site: Site, buildBytes: BuildBytes): Problem[] => {
  const context = contextOf(dist, site, buildBytes.sizes);
  return [
    ...fileSetProblems(context),
    ...headProblems(context),
    ...structureProblems(context),
    ...assetProblems(context),
    ...contentProblems(context),
    ...factProblems(context),
    ...budgetProblems(context),
    ...embedProblems(context),
    ...glyphProblems(buildBytes.fonts),
  ];
};
