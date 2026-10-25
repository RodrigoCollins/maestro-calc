import { createConcrete } from '@maestro-calc/core/calculators/concrete';
import { CONCRETE_MIX_YIELDS } from '@maestro-calc/data/yields/concrete-mix';

/**
 * The concrete calculator of the site: core's factory with the bag yields of `concrete-mix`.
 * The yields come from the yields-only subpath of the data package, keyed by purchase unit id
 * (`bag-<n>`) as core expects them, never from the material record or the package root, so a
 * client bundle that imports this module carries numbers and no source metadata.
 */
export const concrete = createConcrete(CONCRETE_MIX_YIELDS);
