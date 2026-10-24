import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { fromRoot } from './root.ts';
import { appliesTo, parseHeaders } from './headers.ts';

const rules = parseHeaders(readFileSync(fromRoot('apps/web/public/_headers'), 'utf8'));
const block = (pattern: string) => rules.find((rule) => rule.pattern === pattern);

const CSP =
  "default-src 'self'; script-src 'none'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'";

describe('_headers parser', () => {
  it('reads path lines, indented headers and comments', () => {
    expect(parseHeaders('# note\n/a/*\n  X-One: 1\n  Y: a: b\n\n/b\n  Z: 2\n')).toEqual([
      {
        pattern: '/a/*',
        headers: { 'x-one': '1', y: 'a: b' },
        lines: [
          ['X-One', '1'],
          ['Y', 'a: b'],
        ],
      },
      { pattern: '/b', headers: { z: '2' }, lines: [['Z', '2']] },
    ]);
  });

  it('applies a splat across slashes and nothing beyond its prefix', () => {
    expect(appliesTo('/_astro/*', '/_astro/fonts/a.woff2')).toBe(true);
    expect(appliesTo('/_astro/*', '/about')).toBe(false);
    expect(appliesTo('/*', '/about.html')).toBe(true);
    expect(appliesTo('/a.b', '/aXb')).toBe(false);
  });
});

describe('security headers (site-quality › [SQ12])', () => {
  it('sets the hardening headers on every path', () => {
    const all = block('/*');
    expect(all?.headers['x-content-type-options']).toBe('nosniff');
    expect(all?.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(all?.headers['permissions-policy']).toContain('camera=()');
    expect(all?.headers['permissions-policy']).toContain('microphone=()');
    expect(all?.headers['permissions-policy']).toContain('geolocation=()');
    expect(all?.headers['content-security-policy']).toBe(CSP);
  });

  it('sets no cookie anywhere', () => {
    expect(rules.length).toBeGreaterThan(0);
    for (const rule of rules) {
      expect(
        rule.lines.map(([name]) => name.toLowerCase()),
        rule.pattern,
      ).not.toContain('set-cookie');
    }
  });
});

describe('asset caching (site-quality › [SQ13])', () => {
  const immutable = rules.filter((rule) =>
    (rule.headers['cache-control'] ?? '').includes('immutable'),
  );

  it('caches hashed assets for a year, immutable', () => {
    expect(block('/_astro/*')?.headers['cache-control']).toBe(
      'public, max-age=31536000, immutable',
    );
  });

  it.each([
    '/_astro/fonts/a3a3eff37ba0612c.woff2',
    '/_astro/index.Ab12Cd34.css',
    '/_astro/page.hash.js',
  ])('matches the built asset %s with the immutable rule', (path) => {
    expect(immutable.some((rule) => appliesTo(rule.pattern, path))).toBe(true);
  });

  it.each(['/', '/es', '/about', '/index.html', '/404.html', '/sitemap.xml', '/robots.txt'])(
    'never marks %s immutable',
    (path) => {
      expect(immutable.length).toBeGreaterThan(0);
      expect(immutable.filter((rule) => appliesTo(rule.pattern, path))).toEqual([]);
    },
  );
});
