import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SITE } from '../site.config.ts';
import { FOOD_HUB_FR } from './can-dogs-eat.ts';
import { HOME_FR } from './home.ts';
import { MENTIONS_OWNER, mentionsReady } from './mentions-legales.ts';
import { ABOUT_FR, EDITORIAL_FR, PRIVACY_FR } from './trust.ts';

describe('the French pages about the site', () => {
  it('fit a search result, each with its own title', () => {
    const pages = [ABOUT_FR, EDITORIAL_FR, PRIVACY_FR, HOME_FR, FOOD_HUB_FR];
    for (const { title, description } of pages) {
      expect(title.length, title).toBeLessThanOrEqual(65);
      expect(description.length, title).toBeGreaterThanOrEqual(50);
      expect(description.length, title).toBeLessThanOrEqual(160);
    }
    expect(new Set(pages.map(({ title }) => title)).size).toBe(pages.length);
  });

  it('credit the editorial team as an organization, never a person', () => {
    const text = JSON.stringify([ABOUT_FR, EDITORIAL_FR]);
    expect(text).toContain('rédaction de Bowl Figures');
  });

  it('say the site has no advertising, as the English privacy page does', () => {
    expect(JSON.stringify(PRIVACY_FR)).toContain('pas de publicité');
  });
});

describe('the mentions légales', () => {
  // LCEN: a site published in France names its publisher; the owner has not given it yet
  it('keeps French closed to search engines until the owner gives the publisher details', () => {
    if (!mentionsReady()) expect(SITE.frIndexable).toBe(false);
  });

  it('is no page of the build until it is complete', () => {
    const page = resolve(import.meta.dirname, '../pages/fr/mentions-legales.astro');
    expect(existsSync(page)).toBe(mentionsReady());
  });

  it('still waits for the owner', () => {
    expect(Object.values(MENTIONS_OWNER).every((value) => value === '')).toBe(true);
  });
});
