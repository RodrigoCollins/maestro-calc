import { createConcreteQuote } from '@maestro-calc/cobro-core/concrete';
import { createConcrete } from '@maestro-calc/core/calculators/concrete';
import { CONCRETE_MIX_YIELDS } from '@maestro-calc/data/yields/concrete-mix';

/** The concrete quote of the site: the Maestro Calc concrete calculator with the bag yields. */
export const concreteQuote = createConcreteQuote(createConcrete(CONCRETE_MIX_YIELDS));
