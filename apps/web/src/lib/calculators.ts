import { rectangleArea } from '@maestro-calc/core/calculators/rectangle-area';
import { concrete } from './concrete.ts';

/**
 * Every calculator the site lists. Each one is imported through its own subpath of
 * `@maestro-calc/core`, so a page bundles only what it renders. The contract tests iterate this
 * list: labels in every catalog (`i18n-contract.test.ts`), the released URL snapshot
 * (`released.contract.test.ts`) and language-free results (`language-free.contract.test.ts`).
 */
export const calculators = [rectangleArea, concrete] as const;
