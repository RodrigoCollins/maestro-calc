/** The built calculator pages: the `*-calculator.astro` files of `src/pages`. */
export const ROUTED_PAGES = [
  'pool-volume-calculator.html',
  'pool-salt-calculator.html',
  'pool-chlorine-calculator.html',
  'pool-pump-size-calculator.html',
] as const;

/** The embed of each (`src/embed.ts`): `/embed` + its path, the same one calculator script. */
export const EMBED_PAGES = ROUTED_PAGES.map((page) => `embed/${page}`);

/** The built pages that hold a calculator, each allowed one module script (`@maestro-calc/site-kit/budgets`). */
export const CALCULATOR_PAGES: readonly string[] = [...ROUTED_PAGES, ...EMBED_PAGES];
