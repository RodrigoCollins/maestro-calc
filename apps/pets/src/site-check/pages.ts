import { pathsOf, ROUTES } from '../routes.ts';

/**
 * The built pages that hold a calculator, each allowed one module script
 * (`@maestro-calc/site-kit/budgets`): every calculator route in each language it has.
 */
export const CALCULATOR_PAGES: readonly string[] = ROUTES.filter(
  ({ kind }) => kind === 'calculator',
)
  .flatMap(pathsOf)
  .map((path) => `${path.slice(1)}.html`);
