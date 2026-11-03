// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import { SITE } from './src/site.config.ts';

/**
 * One self-hosted `latin` woff2 per weight from the exact-pinned fontsource packages, as Maestro
 * Calc and Cuenta Horas do.
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

// Pool Figures, the pool calculators site (plans/pool/PLAN.md).
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
      name: 'Barlow',
      cssVariable: '--font-body',
      fallbacks: ['Arial', 'sans-serif'],
      options: { variants: [variant('barlow', 400), variant('barlow', 600)] },
    },
    {
      ...shared,
      name: 'Barlow Condensed',
      cssVariable: '--font-display',
      fallbacks: ['Arial Narrow', 'sans-serif'],
      options: { variants: [variant('barlow-condensed', 700)] },
    },
  ],
});
