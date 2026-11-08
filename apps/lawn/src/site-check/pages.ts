import { ROUTES } from '../routes.ts';

/**
 * The built pages that hold a script, each allowed one module script
 * (`@maestro-calc/site-kit/budgets`): every calculator, the frost dates index and every frost page
 * (the ZIP lookup).
 */
export const CALCULATOR_PAGES: readonly string[] = ROUTES.filter(
  ({ kind, id }) => kind === 'calculator' || id === 'frost-index' || id.startsWith('frost:'),
).map(({ path }) => `${path.slice(1)}.html`);
