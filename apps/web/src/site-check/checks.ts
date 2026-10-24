import { assetProblems } from './assets.ts';
import { budgetProblems } from './budgets.ts';
import { contentProblems } from './content.ts';
import { factProblems } from './facts.ts';
import { fileSetProblems, pagesOf } from './files.ts';
import { headProblems } from './head.ts';
import { structureProblems } from './structure.ts';
import { glyphProblems } from './woff2-cmap.ts';
import type { Binary, Dist, Problem, Site } from './types.ts';

export type { Binary, Dist, Problem, Site } from './types.ts';
export { budgetSummary } from './budgets.ts';
export { countPending, updatedOf } from './content.ts';
export { expectedFiles, pageCount, pagesOf } from './files.ts';

/** Every rule of `check:site` over a built `dist`, in the order the rules are documented. */
export const checkSite = (dist: Dist, site: Site, binary: Binary): Problem[] => {
  const pages = pagesOf(dist, site.routes);
  return [
    ...fileSetProblems(dist, site.routes),
    ...headProblems(pages, site),
    ...structureProblems(pages, site, dist),
    ...assetProblems(pages, dist),
    ...contentProblems(pages, site, dist),
    ...factProblems(site, dist),
    ...budgetProblems(pages, binary.sizes, dist),
    ...glyphProblems(binary.fonts),
  ];
};
