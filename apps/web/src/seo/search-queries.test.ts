import { describe, expect, it } from 'vitest';
import { siteText } from '../lib/site-text.ts';
import { jobsOf } from '../routing/jobs.ts';

// Growth plan › lever 4: the title and the description of a page carry the words of the Search
// Console queries that already show it (maestrocalc.com, 28 days to 2026-11-02), so the result
// earns the click once the page climbs.
describe('titles from real queries (growth plan › lever 4)', () => {
  it('names the decimal conversion that shows the feet and inches page', () => {
    // query: "decimal to feet and inches calculator", 126 impressions and no click
    const en = siteText('en');
    expect(en('page.feet-inches.title')).toBe(
      'Decimal to Feet and Inches Calculator | Maestro Calc',
    );
    expect(en('page.feet-inches.description')).toMatch(/^Convert decimal feet or inches to feet/);
    const es = siteText('es');
    expect(es('page.feet-inches.title')).toBe(
      'Calculadora de decimales a pies y pulgadas | Maestro Calc',
    );
    expect(es('page.feet-inches.description')).toContain('decimales a pies y pulgadas');
  });

  it('names the pitch of each roof pitch job page in its title', () => {
    // query: "6 12 roof pitch calculator"
    for (const id of jobsOf('roof-pitch')) {
      const pitch = id.replace('roof-pitch-', '').replace('-', '/');
      expect(siteText('en')(`page.${id}.title`)).toContain(`${pitch} Roof Pitch`);
      expect(siteText('es')(`page.${id}.title`)).toContain(`Pendiente de techo ${pitch}`);
    }
  });
});
