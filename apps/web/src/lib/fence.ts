import { createFence } from '@maestro-calc/core/calculators/fence';
import { CONCRETE_MIX_YIELDS } from '@maestro-calc/data/yields/concrete-mix';

/**
 * The fence calculator of the site: core's factory with the bag yields of `concrete-mix`, the ones
 * the concrete calculator sets its bags with, from the yields-only subpath of the data package, so
 * a client bundle that imports this module carries numbers and no source metadata.
 */
export const fence = createFence(CONCRETE_MIX_YIELDS);
