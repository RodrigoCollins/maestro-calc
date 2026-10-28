import { rectangleArea } from '@maestro-calc/core/calculators/rectangle-area';
import { definePage } from '../../calculator/page-module.ts';

/**
 * A test-only page module with no slot: the rectangle-area calculator and nothing else. After the
 * real rectangle-area page gained its answer, this is the module the generic mount, the page
 * builder and the body are proven on without any slot (calculator-web-core › [CWC4], [CWC33]).
 */
export const slotFreePage = definePage({ calculator: rectangleArea });
