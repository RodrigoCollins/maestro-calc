import type { Locale } from '@maestro-calc/i18n';
import { siteText } from '../lib/site-text.ts';
import { LOCALE_TAGS, pathOf } from '../routing/routes.ts';
import { SITE } from '../site.config.ts';

/** One icon of the manifest: the PNGs of `public/`, drawn from `favicon.svg`. */
export interface ManifestIcon {
  readonly src: string;
  readonly sizes: string;
  readonly type: 'image/png';
  readonly purpose: 'any' | 'maskable';
}

/** The web app manifest of one language (site-pwa): installable, opening at that language home. */
export interface WebManifest {
  readonly id: string;
  readonly name: string;
  readonly short_name: string;
  readonly description: string;
  readonly lang: string;
  readonly start_url: string;
  readonly scope: string;
  readonly display: 'standalone';
  readonly theme_color: string;
  readonly background_color: string;
  readonly icons: readonly ManifestIcon[];
}

/** Where each language's manifest is served; the head of every page links its own. */
export const MANIFEST_PATHS: Readonly<Record<Locale, string>> = {
  en: '/manifest.webmanifest',
  es: '/es/manifest.webmanifest',
};

/** Blueprint ink and plan paper (`docs/design/direction.md`): the title bar and the splash. */
export const THEME_COLOR = '#0E2240';
const BACKGROUND_COLOR = '#EEF1EF';

const ICONS: readonly ManifestIcon[] = [
  { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
  { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
  { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
];

export const manifestOf = (locale: Locale): WebManifest => {
  const home = pathOf('home', locale);
  return {
    id: home,
    name: SITE.name,
    short_name: SITE.name,
    description: siteText(locale)('site.tagline'),
    lang: LOCALE_TAGS[locale],
    start_url: home,
    scope: '/',
    display: 'standalone',
    theme_color: THEME_COLOR,
    background_color: BACKGROUND_COLOR,
    icons: ICONS,
  };
};

/** The response of a manifest endpoint, built at build time. */
export const manifestResponse = (locale: Locale): Response =>
  new Response(JSON.stringify(manifestOf(locale)), {
    headers: { 'Content-Type': 'application/manifest+json' },
  });
