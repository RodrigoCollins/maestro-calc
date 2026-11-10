import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SITE } from '../site.config.ts';
import { HOME_DE } from './home.ts';
import { IMPRESSUM_OWNER, impressumReady } from './impressum.ts';
import { ABOUT_DE, EDITORIAL_DE, PRIVACY_DE } from './trust.ts';

describe('the German pages about the site', () => {
  it('fit a search result, each with its own title', () => {
    const pages = [ABOUT_DE, EDITORIAL_DE, PRIVACY_DE, HOME_DE];
    for (const { title, description } of pages) {
      expect(title.length, title).toBeLessThanOrEqual(65);
      expect(description.length, title).toBeGreaterThanOrEqual(50);
      expect(description.length, title).toBeLessThanOrEqual(160);
    }
    expect(new Set(pages.map(({ title }) => title)).size).toBe(pages.length);
  });

  it('credit the editorial team as an organization, never a person', () => {
    const text = JSON.stringify([ABOUT_DE, EDITORIAL_DE]);
    expect(text).toContain('Redaktion Bowl Figures');
  });

  it('say the site has no advertising, as the English privacy page does', () => {
    expect(JSON.stringify(PRIVACY_DE)).toContain('keine Werbung');
  });
});

describe('the Impressum', () => {
  // § 5 DDG: a German-targeted commercial site names its operator; the owner has not given it yet
  it('keeps German closed to search engines until the owner gives the operator details', () => {
    if (!impressumReady()) expect(SITE.deIndexable).toBe(false);
  });

  it('is no page of the build until it is complete', () => {
    const page = resolve(import.meta.dirname, '../pages/de/impressum.astro');
    expect(existsSync(page)).toBe(impressumReady());
  });

  it('still waits for the owner (name, address, email)', () => {
    expect(IMPRESSUM_OWNER).toEqual({ name: '', address: '', email: '' });
  });
});
