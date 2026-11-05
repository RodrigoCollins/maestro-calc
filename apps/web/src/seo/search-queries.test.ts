import { yd3 } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { volumeText } from '../calculator/present.ts';
import { concrete } from '../lib/concrete.ts';
import { siteText } from '../lib/site-text.ts';
import { jobView } from '../lib/job-view.ts';
import { JOBS, jobsOf } from '../routing/jobs.ts';

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

  it('states the cubic yards of each slab by area in its title and description', () => {
    // query: "how much concrete for 650 sf slab", position 9.5
    for (const id of jobsOf('concrete').filter((each) => each.endsWith('-sq-ft'))) {
      const area = id.replace('concrete-slab-', '').replace('-sq-ft', '');
      const state = concrete.validate(JOBS[id].cases[0]);
      if (!state.ok) throw new Error(id);
      // the volume before the 10% extra, which the description gives first
      const net = volumeText(concrete.compute(state.value).outputs.netVolume, yd3);
      for (const locale of ['en', 'es'] as const) {
        const text = siteText(locale);
        const yards = jobView(id, locale).rows[0].cells[0] ?? '';
        expect(text(`page.${id}.title`), id).toContain(yards);
        expect(text(`page.${id}.description`), id).toContain(`${net} `);
        expect(text(`page.${id}.description`), id).toContain(`${yards} `);
      }
      expect(siteText('en')(`page.${id}.title`)).toContain(`${area} Sq Ft Slab`);
      expect(siteText('es')(`page.${id}.title`)).toContain(`losa de ${area} ft²`);
    }
  });

  // target queries of the job pages batch 3 (growth plan › lever 1): "how much gravel for a 10x20
  // driveway", "how much paint for a 12x12 room", "how many sheets of drywall for a 12x12 room"
  it('states the tons of gravel of each driveway in its title, heading and description', () => {
    for (const id of jobsOf('gravel')) {
      const size = id.replace('gravel-driveway-', '');
      for (const locale of ['en', 'es'] as const) {
        const text = siteText(locale);
        const { answer, facts } = jobView(id, locale);
        expect(text(`page.${id}.title`), id).toContain(answer.split(' ')[0]);
        expect(text(`page.${id}.description`), id).toContain(`${answer.split(' ')[0] ?? ''} `);
        expect(text(`page.${id}.description`), id).toContain(`${facts[0]?.value ?? ''} `);
      }
      expect(siteText('en')(`page.${id}.title`)).toContain(`Gravel for a ${size} Driveway`);
      expect(siteText('en')(`page.${id}.heading`)).toBe(`How much gravel for a ${size} driveway?`);
      expect(siteText('es')(`page.${id}.title`)).toContain(`Grava para entrada de ${size}`);
    }
  });

  it('states the gallons of paint of each room in its title, heading and description', () => {
    for (const id of jobsOf('paint')) {
      const size = id.replace('paint-room-', '');
      for (const locale of ['en', 'es'] as const) {
        const text = siteText(locale);
        const { answer, facts } = jobView(id, locale);
        // the English title writes the unit in title case: `1.91 Gallons`
        expect(text(`page.${id}.title`).toLowerCase(), id).toContain(answer.toLowerCase());
        expect(text(`page.${id}.description`), id).toContain(answer);
        expect(text(`page.${id}.description`), id).toContain(`${facts[0]?.value ?? ''} `);
      }
      expect(siteText('en')(`page.${id}.title`)).toContain(`Paint for a ${size} Room`);
      expect(siteText('en')(`page.${id}.heading`)).toBe(`How much paint for a ${size} room?`);
      expect(siteText('es')(`page.${id}.title`)).toContain(`Pintura para un cuarto de ${size}`);
    }
  });

  it('states the sheets of drywall of each room in its title, heading and description', () => {
    for (const id of jobsOf('drywall')) {
      const size = id.replace('drywall-room-', '');
      for (const locale of ['en', 'es'] as const) {
        const text = siteText(locale);
        const { answer, facts } = jobView(id, locale);
        const sheets = answer.split(' ')[0] ?? '';
        expect(text(`page.${id}.title`), id).toContain(` ${sheets} `);
        expect(text(`page.${id}.description`), id).toContain(` ${sheets} `);
        expect(text(`page.${id}.description`), id).toContain(` ${facts[0]?.value ?? ''} `);
      }
      expect(siteText('en')(`page.${id}.title`)).toContain(`Drywall for a ${size} Room`);
      expect(siteText('en')(`page.${id}.heading`)).toBe(
        `How many sheets of drywall for a ${size} room?`,
      );
      expect(siteText('es')(`page.${id}.title`)).toContain(`Drywall para cuarto de ${size}`);
    }
  });

  it('answers the bags of mulch in a cubic yard in the title and the description', () => {
    // queries: "how many bags of 1.5 cubic feet in a yard", "bag of mulch cubic feet"
    for (const locale of ['en', 'es'] as const) {
      const { facts } = jobView('mulch-bags-per-yard', locale);
      const description = siteText(locale)('page.mulch-bags-per-yard.description');
      for (const { value } of facts) expect(description).toContain(` ${value} `);
      expect(description).toContain('27');
    }
    expect(siteText('en')('page.mulch-bags-per-yard.title')).toContain(
      'Bags of Mulch in a Cubic Yard',
    );
  });
});
