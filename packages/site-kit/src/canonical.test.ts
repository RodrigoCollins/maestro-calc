import { describe, expect, it } from 'vitest';
import { canonicalUrl } from './canonical.ts';

describe('canonicalUrl', () => {
  it('writes a site path on the origin, the home with its slash', () => {
    expect(canonicalUrl('/', 'https://example.com')).toBe('https://example.com/');
    expect(canonicalUrl('/es', 'https://example.com')).toBe('https://example.com/es');
    expect(canonicalUrl('/es/metodologia', 'https://example.com')).toBe(
      'https://example.com/es/metodologia',
    );
  });

  it('keeps the origin root when the origin is given with a trailing slash', () => {
    expect(canonicalUrl('/about', 'https://example.com/')).toBe('https://example.com/about');
  });

  it('refuses a path that is not rooted on the site, so a canonical never leaves the origin', () => {
    expect(() => canonicalUrl('about', 'https://example.com')).toThrow('about');
    expect(() => canonicalUrl('', 'https://example.com')).toThrow('not a site path');
    expect(() => canonicalUrl('//evil.example/x', 'https://example.com')).toThrow(
      '//evil.example/x',
    );
    expect(() => canonicalUrl('https://evil.example/', 'https://example.com')).toThrow(
      'not a site path',
    );
  });
});
