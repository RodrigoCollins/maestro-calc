import { assetProblems } from './assets.ts';
import { budgetProblems } from './budgets.ts';
import { contentProblems } from './content.ts';
import { factProblems } from './facts.ts';
import { fileSetProblems, pagesOf } from './files.ts';
import { headProblems } from './head.ts';
import { structureProblems } from './structure.ts';
import { glyphProblems } from './woff2-cmap.ts';
import type { BuildBytes, Dist, Problem, Site } from './types.ts';

export type { BuildBytes, Dist, Problem, Site } from './types.ts';
export { budgetSummary } from './budgets.ts';
export { countPending, updatedOf } from './content.ts';
export { expectedFiles, pageCount, pagesOf } from './files.ts';

/** Every rule of `check:site` over a built `dist`, in the order the rules are documented. */
export const checkSite = (dist: Dist, site: Site, buildBytes: BuildBytes): Problem[] => {
  const pages = pagesOf(dist, site.routes);
  return [
    ...fileSetProblems(dist, site.routes),
    ...headProblems(pages, site),
    ...structureProblems(pages, site, dist),
    ...assetProblems(pages, dist),
    ...contentProblems(pages, site, dist),
    ...factProblems(site, dist),
    ...budgetProblems(pages, buildBytes.sizes, dist),
    ...glyphProblems(buildBytes.fonts),
  ];
};
