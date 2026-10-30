import type { Plugin } from 'vite';

/** The module of core that holds the definition checks of `defineCalculator`. */
const CHECKS = '/packages/core/src/calculator/definition-checks.ts';

/** The empty stand-in a client build loads instead. */
const STUB = '\0definition-checks-stub';

/**
 * Leaves `defineCalculator`'s definition checks out of a client build (about 2.4 KB): the
 * definitions are constants, and every registry calculator is built, and so checked, in the Node
 * tests, so the browser would only run them again. Used by Astro's build (`astro.config.mjs`) and by
 * the build the contract tests weigh (`contract/__testing__/client-build.ts`), so the measured
 * bundle is the shipped one. Node and the tests import core directly and keep the checks.
 */
export const skipDefinitionChecks = (): Plugin => ({
  name: 'maestro-skip-definition-checks',
  enforce: 'pre',
  async resolveId(source, importer, options) {
    if (!source.endsWith('definition-checks.ts')) return null;
    const resolved = await this.resolve(source, importer, { ...options, skipSelf: true });
    return resolved?.id.endsWith(CHECKS) === true ? STUB : null;
  },
  load: (id) => (id === STUB ? 'export const checkDefinition = () => {};' : null),
});
