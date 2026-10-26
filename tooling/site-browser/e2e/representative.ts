import { ROUTES } from '../../../apps/web/src/routing/routes.ts';
import type { CalculatorPageId } from '../../../apps/web/src/routing/templates.ts';

/**
 * The calculator page that Lighthouse audits: one is enough, because every calculator page shares
 * one template (site-quality › [SQ25]). Named once here; `lighthouse.contract.test.ts` fails when
 * it is not a calculator page of the route table or when its two paths are not in
 * `lighthouserc.json`.
 */
export const REPRESENTATIVE: CalculatorPageId = 'concrete';

/** Its paths, English then Spanish. */
export const representativePaths: string[] = [ROUTES[REPRESENTATIVE].en, ROUTES[REPRESENTATIVE].es];
