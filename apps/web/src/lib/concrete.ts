import { createConcrete } from '@maestro-calc/core/calculators/concrete';
import { CONCRETE_MIX_YIELDS } from '@maestro-calc/data/yields/concrete-mix';

/**
 * The concrete calculator of the site: core's factory with the bag yields of `concrete-mix`.
 * The yields come from the yields-only subpath of the data package (purchase unit `bag-<n>` to
 * key `<n>`), never from the material record or the package root, so a client bundle that imports
 * this module carries numbers and no source metadata.
 */
export const concrete = createConcrete({
  '40': CONCRETE_MIX_YIELDS['bag-40'],
  '60': CONCRETE_MIX_YIELDS['bag-60'],
  '80': CONCRETE_MIX_YIELDS['bag-80'],
});
