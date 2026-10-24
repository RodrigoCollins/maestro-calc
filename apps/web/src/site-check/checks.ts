import { assetProblems } from './assets.ts';
import { contentProblems } from './content.ts';
import { fileSetProblems, pagesOf } from './files.ts';
import { headProblems } from './head.ts';
import { structureProblems } from './structure.ts';
import type { Dist, Problem, Site } from './types.ts';

export type { Dist, Problem, Site } from './types.ts';
export { countPending, updatedOf } from './content.ts';
export { expectedFiles, pageCount } from './files.ts';

/** Every rule of `check:site` over a built `dist`, in the order the rules are documented. */
export const checkSite = (dist: Dist, site: Site): Problem[] => {
  const pages = pagesOf(dist, site.routes);
  return [
    ...fileSetProblems(dist, site.routes),
    ...headProblems(pages, site),
    ...structureProblems(pages, site, dist),
    ...assetProblems(pages, dist),
    ...contentProblems(pages, site, dist),
  ];
};
