import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { fromRoot } from './root.ts';
import { appliesTo, parseHeaders } from './headers.ts';

const rules = parseHeaders(readFileSync(fromRoot('apps/web/public/_headers'), 'utf8'));
const block = (pattern: string) => rules.find((rule) => rule.pattern === pattern);

const CSP =
  "default-src 'self'; script-src 'self' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://www.googletagmanager.com https://*.google-analytics.com; connect-src 'self' https://www.googletagmanager.com https://*.google-analytics.com https://*.google.com; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'";

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

  // spec: site-quality › [SQ12] script-src is the page origin and the one Tag Manager host (analytics-gtm), once in the file
  it('allows scripts from the page origin and the Tag Manager host only, with no inline or eval', () => {
    const directives = (block('/*')?.headers['content-security-policy'] ?? '').split('; ');
    expect(directives.filter((directive) => directive.startsWith('script-src'))).toEqual([
      "script-src 'self' https://www.googletagmanager.com",
    ]);
    const text = readFileSync(fromRoot('apps/web/public/_headers'), 'utf8');
    // two policies: the site's and the embed's, whose own test pins it exactly
    expect(text.match(/script-src/g)).toHaveLength(2);
    const scriptSrc = directives.find((directive) => directive.startsWith('script-src')) ?? '';
    for (const forbidden of [
      "'unsafe-inline'",
      "'unsafe-eval'",
      "'strict-dynamic'",
      "'nonce-",
      "'sha256-",
      'data:',
      'http:',
      '*',
    ]) {
      expect(scriptSrc, forbidden).not.toContain(forbidden);
    }
  });

  // spec: site-quality › [SQ12] the other directives: as before, plus the Google hosts GA4 needs for its beacons
  it('keeps the other directives, adding only the GA4 image and connect hosts', () => {
    const directives = (block('/*')?.headers['content-security-policy'] ?? '').split('; ');
    expect(directives.filter((directive) => !directive.startsWith('script-src'))).toEqual([
      "default-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https://www.googletagmanager.com https://*.google-analytics.com",
      "connect-src 'self' https://www.googletagmanager.com https://*.google-analytics.com https://*.google.com",
      "font-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ]);
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

  // spec: site-seo › [SE13] (indexability is the HTML head's job; a header must never override it)
  it('sets no X-Robots-Tag on any path, so routable pages stay indexable', () => {
    expect(rules.length).toBeGreaterThan(0);
    for (const rule of rules) {
      expect(
        rule.lines.map(([name]) => name.toLowerCase()),
        rule.pattern,
      ).not.toContain('x-robots-tag');
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
    '/_astro/concrete.Ab12Cd34.js',
    '/_astro/chunks/rational.Zz99.js',
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

// embed: the embed pages, and they alone, may be framed by any site
describe('embed framing (embed › Framing only there)', () => {
  const embed = rules.find((rule) => rule.pattern === '/embed/*');
  const directives = (embed?.headers['content-security-policy'] ?? '').split('; ');

  it('detaches the site policy on /embed/* and sets its own, framable by any site', () => {
    expect(embed?.lines.map(([name]) => name)).toEqual([
      '! Content-Security-Policy',
      'Content-Security-Policy',
    ]);
    expect(directives).toContain('frame-ancestors *');
  });

  it('keeps the embed to its own origin: no analytics host, no inline script', () => {
    expect(directives).toEqual([
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "connect-src 'self'",
      "font-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      'frame-ancestors *',
    ]);
  });

  it.each(['/', '/es', '/concrete-calculator', '/es/calculadora-de-concreto', '/about'])(
    'lets no rule but the site policy set the framing of %s',
    (path) => {
      const framing = rules
        .filter((rule) => appliesTo(rule.pattern, path))
        .map((rule) => rule.headers['content-security-policy'] ?? '')
        .filter((policy) => policy.includes('frame-ancestors'));
      expect(framing).toEqual([CSP]);
    },
  );
});
