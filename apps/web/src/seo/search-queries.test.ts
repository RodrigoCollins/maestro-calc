import { describe, expect, it } from 'vitest';
import { siteText } from '../lib/site-text.ts';
import { jobView } from '../lib/job-view.ts';
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

  it('states the angle of each roof pitch job page in its title, heading and description', () => {
    // queries: "8 12 pitch in degrees", "10 12 roof pitch", "what pitch is 26 degrees"
    for (const id of jobsOf('roof-pitch')) {
      for (const locale of ['en', 'es'] as const) {
        const text = siteText(locale);
        const { answer } = jobView(id, locale);
        expect(text(`page.${id}.title`), id).toContain(answer);
        expect(text(`page.${id}.heading`), id).toContain(answer);
        expect(text(`page.${id}.description`), id).toContain(answer.replace('°', ''));
      }
      expect(siteText('en')(`page.${id}.title`)).toContain('in Degrees');
      expect(siteText('es')(`page.${id}.title`)).toContain('en grados');
    }
  });

  it('names the size and the square feet of each square footage job page in its title', () => {
    // queries: "12x7 square feet", "30 by 12 square feet", "5 by 10 in square feet",
    // "14 11 square feet", "16 11 square feet", "25 pies cuadrados"
    for (const id of jobsOf('rectangle-area')) {
      const size = id.replace('square-feet-', '');
      const feet = jobView(id, 'en').rows[0].cells[0]?.replace(/\.00$/, '') ?? '';
      expect(siteText('en')(`page.${id}.title`)).toMatch(
        new RegExp(`^${size}( \\(\\d+x\\d+\\))? in Square Feet: ${feet} sq ft \\|`),
      );
      expect(siteText('es')(`page.${id}.title`)).toBe(
        `${size} en pies cuadrados: ${feet} pies cuadrados | Maestro Calc`,
      );
      expect(siteText('en')(`page.${id}.description`)).toContain(`${feet} square feet`);
      expect(siteText('es')(`page.${id}.description`)).toContain(`${feet} pies cuadrados`);
    }
    expect(siteText('en')('page.square-feet-7x12.title')).toContain('(12x7)');
  });
});
