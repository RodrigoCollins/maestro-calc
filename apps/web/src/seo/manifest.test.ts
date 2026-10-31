import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { fromRoot } from '../contract/root.ts';
import { GET as getEnglish } from '../pages/manifest.webmanifest.ts';
import { GET as getSpanish } from '../pages/es/manifest.webmanifest.ts';
import { MANIFEST_PATHS, manifestOf } from './manifest.ts';

/** The width and height a PNG declares in its IHDR chunk. */
const sizeOf = (path: string): string => {
  const png = readFileSync(fromRoot('apps/web/public', path.slice(1)));
  return `${String(png.readUInt32BE(16))}x${String(png.readUInt32BE(20))}`;
};

describe('web app manifest (site-pwa › Manifest)', () => {
  it('names the app in each language and starts at that language home', () => {
    expect(manifestOf('en')).toMatchObject({
      name: 'Maestro Calc',
      short_name: 'Maestro Calc',
      description: 'Jobsite calculators that estimate what to buy',
      lang: 'en-US',
      id: '/',
      start_url: '/',
      scope: '/',
      display: 'standalone',
    });
    expect(manifestOf('es')).toMatchObject({
      description: 'Calcula tu obra y sabe qué comprar',
      lang: 'es-US',
      id: '/es',
      start_url: '/es',
      scope: '/',
    });
  });

  it('takes its colours from the Blueprint tokens', () => {
    expect(manifestOf('en')).toMatchObject({ theme_color: '#0E2240', background_color: '#EEF1EF' });
  });

  it('lists icons that exist at the size they declare, one of them maskable', () => {
    const { icons } = manifestOf('en');
    expect(icons.map(({ purpose }) => purpose)).toEqual(['any', 'any', 'maskable']);
    for (const icon of icons) {
      expect(icon.type).toBe('image/png');
      expect(sizeOf(icon.src), icon.src).toBe(icon.sizes);
    }
    expect(sizeOf('/apple-touch-icon.png')).toBe('180x180');
  });

  it('is served per language as JSON with the manifest type', async () => {
    expect(MANIFEST_PATHS).toEqual({ en: '/manifest.webmanifest', es: '/es/manifest.webmanifest' });
    for (const [get, locale] of [
      [getEnglish, 'en'],
      [getSpanish, 'es'],
    ] as const) {
      const response = get();
      expect(response.headers.get('content-type')).toBe('application/manifest+json');
      expect(JSON.parse(await response.text())).toEqual(manifestOf(locale));
    }
  });
});
