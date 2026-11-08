import { ROUTES } from '../routes.ts';

/** The built pages that hold a calculator, each allowed one module script (`@maestro-calc/site-kit/budgets`). */
export const CALCULATOR_PAGES: readonly string[] = ROUTES.filter(
  ({ kind }) => kind === 'calculator',
).map(({ path }) => `${path.slice(1)}.html`);
