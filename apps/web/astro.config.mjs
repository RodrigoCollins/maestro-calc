// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import { SITE } from './src/site.config.ts';

/**
 * One self-hosted `latin` woff2 per weight, read from the exact-pinned fontsource packages and
 * emitted with hashed names under `/_astro/fonts`. The `latin` subset covers U+0000-00FF, which
 * holds every Spanish letter, `¿` and `¡`. Astro generates the metric-adjusted Arial fallback.
 */
/**
 * @param {string} slug fontsource package name
 * @param {400 | 600 | 700} weight
 * @returns {{ weight: 400 | 600 | 700; style: 'normal'; src: [string] }}
 */
const variant = (slug, weight) => ({
  weight,
  style: 'normal',
  src: [`@fontsource/${slug}/files/${slug}-latin-${String(weight)}-normal.woff2`],
});

/** What every family shares: swap, the latin subset and the metric-adjusted Arial fallback. */
const shared = {
  provider: fontProviders.local(),
  display: /** @type {const} */ ('swap'),
  subsets: /** @type {[string]} */ (['latin']),
  fallbacks: ['Arial', 'sans-serif'],
  optimizedFallbacks: true,
};

/**
 * Astro inlines an import-free script chunk below `assetsInlineLimit` (4,096 B by default) into the
 * page, which `script-src 'self'` forbids and the JavaScript budget cannot count. A function that
 * returns `false` for `.js` keeps every script a file; `undefined` leaves CSS, SVG and the rest to
 * the default limit.
 * @param {string} file
 * @returns {boolean | undefined}
 */
const assetsInlineLimit = (file) => (file.endsWith('.js') ? false : undefined);

// https://astro.build/config
export default defineConfig({
  site: SITE.url,
  trailingSlash: 'never',
  build: { format: 'file' },
  vite: { build: { assetsInlineLimit } },
  fonts: [
    {
      ...shared,
      name: 'Barlow',
      cssVariable: '--font-body',
      options: { variants: [variant('barlow', 400), variant('barlow', 600)] },
    },
    {
      ...shared,
      name: 'Barlow Condensed',
      cssVariable: '--font-display',
      options: {
        variants: [variant('barlow-condensed', 600), variant('barlow-condensed', 700)],
      },
    },
  ],
});
