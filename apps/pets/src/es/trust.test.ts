import { describe, expect, it } from 'vitest';
import { SITE } from '../site.config.ts';
import { FOOD_HUB_ES } from './can-dogs-eat.ts';
import { CHOCOLATE_GUIDE_ES } from './chocolate.ts';
import { EDAD_PERRO_PAGE } from './edad-perro.ts';
import { HOME_ES } from './home.ts';
import { ABOUT_ES, EDITORIAL_ES, PRIVACY_ES } from './trust.ts';

describe('the Spanish pages about the site', () => {
  it('fit a search result, each with its own title', () => {
    const pages = [
      ABOUT_ES,
      EDITORIAL_ES,
      PRIVACY_ES,
      HOME_ES,
      FOOD_HUB_ES,
      CHOCOLATE_GUIDE_ES,
      EDAD_PERRO_PAGE,
    ];
    for (const { title, description } of pages) {
      expect(title.length, title).toBeLessThanOrEqual(65);
      expect(description.length, title).toBeGreaterThanOrEqual(50);
      expect(description.length, title).toBeLessThanOrEqual(160);
    }
    expect(new Set(pages.map(({ title }) => title)).size).toBe(pages.length);
  });

  it('credit the editorial team as an organization, never a person', () => {
    expect(JSON.stringify([ABOUT_ES, EDITORIAL_ES])).toContain('equipo editorial de Bowl Figures');
  });

  it('say the site has no advertising, as the English privacy page does', () => {
    expect(JSON.stringify(PRIVACY_ES)).toContain('sin publicidad');
  });

  it('are open to search engines from the start', () => {
    expect(SITE.esIndexable).toBe(true);
  });
});
