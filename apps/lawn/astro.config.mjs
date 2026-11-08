// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import { SITE } from './src/site.config.ts';

/**
 * One self-hosted `latin` woff2 per weight from the exact-pinned fontsource packages, as Maestro
 * Calc, Cuenta Horas and Pool Figures do.
 * @param {string} slug fontsource package name
 * @param {400 | 600 | 700} weight
 * @returns {{ weight: 400 | 600 | 700; style: 'normal'; src: [string] }}
 */
const variant = (slug, weight) => ({
  weight,
  style: 'normal',
  src: [`@fontsource/${slug}/files/${slug}-latin-${String(weight)}-normal.woff2`],
});

const shared = {
  provider: fontProviders.local(),
  display: /** @type {const} */ ('swap'),
  subsets: /** @type {[string]} */ (['latin']),
  optimizedFallbacks: false,
};

/**
 * Keeps every script a file (`script-src 'self'`), as in Maestro Calc.
 * @param {string} file
 * @returns {boolean | undefined}
 */
const assetsInlineLimit = (file) => (file.endsWith('.js') ? false : undefined);

// Lawn Figures, the lawn and garden calculators site (plans/lawn/PLAN.md).
export default defineConfig({
  site: SITE.origin,
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file', inlineStylesheets: 'always' },
  scopedStyleStrategy: 'class',
  vite: { build: { assetsInlineLimit } },
  fonts: [
    {
      ...shared,
      name: 'Inter',
      cssVariable: '--font-body',
      fallbacks: ['Arial', 'sans-serif'],
      options: { variants: [variant('inter', 400), variant('inter', 600)] },
    },
    {
      ...shared,
      name: 'Young Serif',
      cssVariable: '--font-display',
      fallbacks: ['Georgia', 'serif'],
      options: { variants: [variant('young-serif', 400)] },
    },
  ],
});
