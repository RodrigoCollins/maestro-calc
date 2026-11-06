import { pathsOf, ROUTES } from '../routes.ts';

/** The built calculator pages: every calculator route of `src/routes.ts`, in each language it has. */
export const ROUTED_PAGES: readonly string[] = ROUTES.filter(({ kind }) => kind === 'calculator')
  .flatMap(pathsOf)
  .map((path) => `${path.slice(1)}.html`);

/** The embed of each (`src/embed.ts`): `/embed` + its path, the same one calculator script. */
export const EMBED_PAGES = ROUTED_PAGES.map((page) => `embed/${page}`);

/** The built pages that hold a calculator, each allowed one module script (`@maestro-calc/site-kit/budgets`). */
export const CALCULATOR_PAGES: readonly string[] = [...ROUTED_PAGES, ...EMBED_PAGES];
