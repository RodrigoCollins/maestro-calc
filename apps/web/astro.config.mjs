// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
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

// https://astro.build/config
export default defineConfig({
  site: SITE.url,
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [sitemap()],
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
