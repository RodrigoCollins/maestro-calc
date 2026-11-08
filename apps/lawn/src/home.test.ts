import { describe, expect, it } from 'vitest';
import { HOME_TRUST } from './home.ts';
import { ROUTES } from './routes.ts';

describe('the home trust line', () => {
  it('links the about and privacy pages from the main content, so neither is an orphan', () => {
    expect(HOME_TRUST.links.map(({ href }) => href)).toEqual(['/about', '/privacy']);
    for (const { href } of HOME_TRUST.links) {
      expect(ROUTES.some(({ path }) => path === href)).toBe(true);
    }
    expect(HOME_TRUST.text).not.toBe('');
  });
});
