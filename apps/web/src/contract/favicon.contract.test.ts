import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { fromRoot } from './root.ts';

describe('favicon (site-shell › Favicon)', () => {
  const svg = (): string => readFileSync(fromRoot('apps/web/public/favicon.svg'), 'utf8');

  // spec: site-shell › [SS17] file side
  it('is an SVG in the brand colours, not the Astro scaffold mark', () => {
    expect(svg().trimStart().startsWith('<svg')).toBe(true);
    expect(svg()).toMatch(/#0E2240|#F06A1D/i);
    expect(svg()).not.toContain('linearGradient');
  });

  it('has no .ico fallback, because every supported browser reads the SVG', () => {
    expect(existsSync(fromRoot('apps/web/public/favicon.ico'))).toBe(false);
  });
});
