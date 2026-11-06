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

/** The module of core that holds the shape checks of a `compute` result, and its unchecked twin. */
const RESULT_CHECKS = '/packages/core/src/calculator/result-checks.ts';
const RESULT_SHAPE = 'result-shape.ts';

/**
 * Loads core's `result-shape.ts` instead of `result-checks.ts` in a client build (about 1.2 KB):
 * every calculator a page ships keeps the result contract on every input, which its property tests
 * prove in Node with the checks in place, and on such a result the two modules give the same
 * (`result-shape.test.ts`). Only the client environment is redirected, so the page builder and
 * Node keep the checks; registered beside `skipDefinitionChecks` in `astro.config.mjs` and in the
 * build the contract tests weigh.
 */
export const skipResultChecks = (): Plugin => ({
  name: 'maestro-skip-result-checks',
  enforce: 'pre',
  async resolveId(source, importer, options) {
    if (!source.endsWith('result-checks.ts') || this.environment.config.consumer !== 'client') {
      return null;
    }
    const resolved = await this.resolve(source, importer, { ...options, skipSelf: true });
    if (resolved?.id.endsWith(RESULT_CHECKS) !== true) return null;
    return this.resolve(`./${RESULT_SHAPE}`, resolved.id, { ...options, skipSelf: true });
  },
});
