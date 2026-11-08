// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import { SITE } from './src/site.config.ts';

/**
 * One self-hosted `latin` woff2 per weight from the exact-pinned fontsource packages, as Maestro
 * Calc does. The fallback is each family's metric-adjusted local face (top of `src/styles/site.css`),
 * not Astro's `local('Arial')` one, which Linux and Android lack.
 * @param {string} slug fontsource package name
 * @param {400 | 700 | 800} weight
 * @returns {{ weight: 400 | 700 | 800; style: 'normal'; src: [string] }}
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

// Cuánto Le Cobro, the quote site for tradespeople (plans/cobro/PLAN.md).
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
      fallbacks: ['Inter Fallback', 'sans-serif'],
      options: { variants: [variant('inter', 400), variant('inter', 700)] },
    },
    {
      ...shared,
      name: 'Bricolage Grotesque',
      cssVariable: '--font-display',
      fallbacks: ['Bricolage Grotesque Fallback', 'sans-serif'],
      options: { variants: [variant('bricolage-grotesque', 800)] },
    },
  ],
});
