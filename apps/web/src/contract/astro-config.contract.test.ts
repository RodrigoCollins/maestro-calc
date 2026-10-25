import { describe, expect, it } from 'vitest';
import { importFromRoot } from './root.ts';

type InlineLimit = (file: string, content: Buffer) => boolean | undefined;

interface AstroConfig {
  default: { vite?: { build?: { assetsInlineLimit?: unknown } } };
}

const { default: config } = await importFromRoot<AstroConfig>('apps/web/astro.config.mjs');
const limit = config.vite?.build?.assetsInlineLimit;

describe('Astro build config (design C10; calculator-page › Client script contract)', () => {
  it('sets assetsInlineLimit as a function', () => {
    expect(typeof limit).toBe('function');
  });

  // Astro inlines import-free chunks below the limit; a calculator entry must stay a file
  // (CSP script-src 'self' forbids inline script, and the budget counts the file).
  const inlineLimit = (file: string): boolean | undefined =>
    (limit as InlineLimit)(file, Buffer.from(''));

  it.each(['/a/_astro/concrete.js', 'x.js'])('never inlines the script %s', (file) => {
    expect(inlineLimit(file)).toBe(false);
  });

  it.each(['/a/_astro/page.css', 'icon.svg', 'font.woff2', 'photo.png'])(
    'leaves %s to the default limit',
    (file) => {
      expect(inlineLimit(file)).toBeUndefined();
    },
  );
});
