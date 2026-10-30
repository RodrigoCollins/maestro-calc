import { mulch } from '@maestro-calc/core/calculators/mulch';
import { rectangleArea } from '@maestro-calc/core/calculators/rectangle-area';
import { topsoil } from '@maestro-calc/core/calculators/topsoil';
import { concrete } from './concrete.ts';
import { gravel } from './gravel.ts';
import { paint } from './paint.ts';

/**
 * Every calculator the site lists. Each one is imported through its own subpath of
 * `@maestro-calc/core`, so a page bundles only what it renders. The contract tests iterate this
 * list: labels in every catalog (`i18n-contract.test.ts`), the released URL snapshot
 * (`released.contract.test.ts`) and language-free results (`language-free.contract.test.ts`).
 */
export const calculators = [rectangleArea, concrete, gravel, mulch, topsoil, paint] as const;
