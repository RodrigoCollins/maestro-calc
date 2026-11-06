import { yd3 } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { volumeText } from '../calculator/present.ts';
import { concrete } from '../lib/concrete.ts';
import { siteText } from '../lib/site-text.ts';
import { jobView } from '../lib/job-view.ts';
import { isChartJob, JOBS, jobsOf } from '../routing/jobs.ts';

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

  // queries (28 days to 2026-11-03): "calculating square footage", "how to calculate square feet",
  // "square footage of a room", "how to figure out square footage of a wall", "calcular pies
  // cuadrados", "calculadora de pies cuadrados", "6 12 roof pitch calculator", "8 12 pitch in
  // degrees"
  it('answers the square footage and roof pitch queries in the titles and descriptions', () => {
    const en = siteText('en');
    const es = siteText('es');
    expect(en('page.rectangle-area.title')).toBe(
      'Square Footage Calculator for a Room or Wall | Maestro Calc',
    );
    expect(en('page.rectangle-area.description')).toMatch(
      /^Calculate square footage: multiply the length by the width\. .*room, floor or wall/,
    );
    expect(es('page.rectangle-area.title')).toBe(
      'Calculadora para calcular pies cuadrados | Maestro Calc',
    );
    expect(es('page.rectangle-area.description')).toMatch(
      /^Calcula los pies cuadrados de un cuarto, piso o pared: multiplica el largo por el ancho\./,
    );
    expect(en('page.guide-square-footage.description')).toMatch(
      /^How to calculate square feet: multiply the length by the width\. .*room, a wall/,
    );
    expect(es('page.guide-square-footage.description')).toMatch(
      /^Cómo calcular pies cuadrados: multiplica el largo por el ancho\. .*cuarto, una pared/,
    );
    expect(en('page.roof-pitch.title')).toBe(
      'Roof Pitch Calculator: Pitch in Degrees | Maestro Calc',
    );
    expect(en('page.roof-pitch.description')).toContain('such as 6 in 12');
    expect(en('page.roof-pitch.description')).toContain('angle in degrees');
    expect(es('page.roof-pitch.title')).toBe(
      'Calculadora de pendiente de techo en grados | Maestro Calc',
    );
    expect(es('page.roof-pitch.description')).toContain('como 6 en 12');
    expect(es('page.roof-pitch.description')).toContain('ángulo en grados');
  });

  it('names the pitch of each roof pitch job page in its title', () => {
    // queries: "6 12 roof pitch calculator", "7.5/12 roof pitch" (the rise 7.5 is `7-5` in the id)
    for (const id of jobsOf('roof-pitch').filter((each) => !isChartJob(each))) {
      const pitch = id.replace('roof-pitch-', '').replace(/-12$/, '/12').replace('-', '.');
      expect(siteText('en')(`page.${id}.title`)).toContain(`${pitch} Roof Pitch`);
      expect(siteText('es')(`page.${id}.title`)).toContain(`Pendiente de techo ${pitch}`);
    }
  });

  it('names the roof pitch chart after the chart, the degrees and the percent', () => {
    // queries: "roof pitch chart", "roof pitch to degrees", "60 degree pitch", "tabla de pendientes"
    expect(siteText('en')('page.roof-pitch-chart.title')).toContain('Roof Pitch Chart in Degrees');
    expect(siteText('en')('page.roof-pitch-chart.heading')).toContain('pitch to degrees, percent');
    expect(siteText('es')('page.roof-pitch-chart.title')).toContain('Tabla de pendientes de techo');
    for (const locale of ['en', 'es'] as const) {
      const reverse = jobView('roof-pitch-chart', locale).chart?.reverse;
      expect(reverse?.rows.map(({ label }) => label)).toContain('60°');
    }
  });

  it('names the cubic yard weight chart after the question and the materials people ask about', () => {
    // queries: "how much does a cubic yard of gravel weigh", "weight of a yard of dirt", "how much
    // does a yard of concrete weigh", "cubic yard of sand weight", "peso de una yarda cúbica"
    const en = siteText('en');
    expect(en('page.cubic-yard-weight-chart.title')).toContain('Cubic Yard Weight Chart');
    expect(en('page.cubic-yard-weight-chart.heading')).toContain(
      'How much does a cubic yard weigh?',
    );
    for (const material of ['gravel', 'concrete', 'sand', 'topsoil', 'dirt', 'mulch']) {
      expect(en('page.cubic-yard-weight-chart.description')).toContain(material);
    }
    expect(en('page.cubic-yard-weight-chart.intro')).toMatch(
      /^A cubic yard of gravel weighs about/,
    );
    expect(siteText('es')('page.cubic-yard-weight-chart.title')).toContain(
      'Peso de una yarda cúbica',
    );
    expect(siteText('es')('page.cubic-yard-weight-chart.intro')).toMatch(
      /^Una yarda cúbica de grava pesa aproximadamente/,
    );
  });

  it('states the angle of each roof pitch job page in its title, heading and description', () => {
    // queries: "8 12 pitch in degrees", "10 12 roof pitch", "what pitch is 26 degrees"
    for (const id of jobsOf('roof-pitch').filter((each) => !isChartJob(each))) {
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

  // target queries of the job pages batch 5 (growth plan › lever 1): "how many bags of concrete
  // for a 10x20 slab 4 inches", "how many bags of concrete for a footing"
  it('names the size and the bag sizes of each concrete slab and footing job', () => {
    const slabs = jobsOf('concrete').filter((id) => /^concrete-slab-\d+x\d+$/.test(id));
    const footings = jobsOf('concrete').filter((id) => id.startsWith('concrete-footing-'));
    for (const id of [...slabs, ...footings]) {
      const footing = id.startsWith('concrete-footing-');
      const size = id.replace(/^concrete-(slab|footing)-/, '');
      const en = siteText('en');
      const es = siteText('es');
      expect(en(`page.${id}.title`), id).toBe(
        `Bags of Concrete for a ${size}${footing ? ' in Footing' : ' Slab'} | Maestro Calc`,
      );
      expect(en(`page.${id}.heading`), id).toBe(
        `How many bags of concrete for a ${size}${footing ? ' in footing' : ' slab'}?`,
      );
      expect(es(`page.${id}.heading`), id).toBe(
        `¿Cuántas bolsas de concreto para una ${footing ? 'zapata' : 'losa'} de ${size}${footing ? ' in' : ''}?`,
      );
      for (const locale of ['en', 'es'] as const) {
        expect(siteText(locale)(`page.${id}.description`), id).toContain('40, 60 ');
        expect(siteText(locale)(`page.${id}.description`), id).toContain(' 80 lb');
      }
    }
  });

  // target queries of the job pages batch 3 (growth plan › lever 1): "how much gravel for a 10x20
  // driveway", "how much paint for a 12x12 room", "how many sheets of drywall for a 12x12 room"
  it('states the tons of gravel of each driveway in its title, heading and description', () => {
    for (const id of jobsOf('gravel').filter((each) => !isChartJob(each))) {
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

  // target queries of the job pages batch 4 (growth plan › lever 1): "how much soil for a 4x8
  // raised bed", "how much topsoil for a 10x10 area", "how many bundles of shingles for a 24x24
  // roof"
  it('states the cubic yards of topsoil of each job in its title and description', () => {
    for (const id of jobsOf('topsoil')) {
      const bed = id.startsWith('topsoil-raised-bed-');
      const size = id.replace('topsoil-raised-bed-', '').replace('topsoil-', '');
      for (const locale of ['en', 'es'] as const) {
        const text = siteText(locale);
        const { answer, facts } = jobView(id, locale);
        // the title holds the cubic yards (the Spanish one writes `yd³` to fit 60 characters)
        expect(text(`page.${id}.title`), id).toContain(`: ${answer.split(' ')[0] ?? ''} `);
        expect(text(`page.${id}.description`), id).toContain(answer);
        expect(text(`page.${id}.description`), id).toContain(` ${facts[1]?.value ?? ''} `);
      }
      const en = siteText('en');
      const es = siteText('es');
      if (bed) {
        expect(en(`page.${id}.title`)).toContain(`Soil for a ${size} Raised Bed`);
        expect(en(`page.${id}.heading`)).toBe(`How much soil for a ${size} raised bed?`);
        expect(es(`page.${id}.title`)).toContain(`Tierra para cama elevada de ${size}`);
      } else {
        expect(en(`page.${id}.title`)).toContain(`Topsoil for a ${size} Area`);
        expect(en(`page.${id}.heading`)).toBe(`How much topsoil for a ${size} area?`);
        expect(es(`page.${id}.title`)).toContain(`Tierra para un área de ${size}`);
      }
    }
  });

  it('states the bundles of shingles of each roof in its title, heading and description', () => {
    for (const id of jobsOf('roofing')) {
      const size = id.replace('roofing-', '');
      for (const locale of ['en', 'es'] as const) {
        const text = siteText(locale);
        const { answer, facts } = jobView(id, locale);
        const bundles = facts[0]?.value ?? '';
        expect(text(`page.${id}.title`), id).toContain(` ${bundles} `);
        expect(text(`page.${id}.description`), id).toContain(` ${bundles} `);
        expect(text(`page.${id}.description`), id).toContain(answer);
      }
      expect(siteText('en')(`page.${id}.title`)).toContain(`Shingles for a ${size} Roof`);
      expect(siteText('en')(`page.${id}.heading`)).toBe(
        `How many bundles of shingles for a ${size} roof?`,
      );
      expect(siteText('es')(`page.${id}.title`)).toContain(`Tejas para techo de ${size}`);
    }
  });

  // target queries of the tape division job pages (growth plan › lever 1, Search Console 28 days to
  // 2026-11-03): "29 1/4 divided by 2 on a tape measure", "what is half of 23 5/8 on a tape
  // measure", "35.5 inches divided by 2", "22 inches divided by 10", "9 feet 6 inches divided by
  // 2", "3 feet 9 inches divided by 2"
  it('states the result of each tape measure division in its title, heading and description', () => {
    for (const id of jobsOf('feet-inches')) {
      const factor = id.replace(/^.*-by-/, '');
      // a length in feet is answered in feet and inches, a length in inches on the tape
      const shown = id.includes('-ft-') ? 1 : 0;
      for (const locale of ['en', 'es'] as const) {
        const text = siteText(locale);
        const { rows, facts, answer } = jobView(id, locale);
        const result = rows[0].cells[shown] ?? '';
        expect(answer, id).toContain(` ${result} `);
        expect(text(`page.${id}.title`), id).toContain(`: ${result} |`);
        expect(text(`page.${id}.heading`), id).toContain(factor);
        expect(text(`page.${id}.description`), id).toContain(` ${result}`);
        expect(text(`page.${id}.description`), id).toContain(`${facts[1]?.value ?? ''} in`);
      }
      expect(siteText('en')(`page.${id}.description`), id).toContain(`divided by ${factor}`);
      expect(siteText('es')(`page.${id}.description`), id).toContain(`entre ${factor}`);
    }
    const en = siteText('en');
    expect(en('page.divide-29-1-4-in-by-2.title')).toMatch(/^29 1\/4 Divided by 2 on a Tape/);
    expect(en('page.divide-23-5-8-in-by-2.title')).toMatch(/^Half of 23 5\/8 on a Tape Measure/);
    expect(en('page.divide-35-5-in-by-2.title')).toMatch(/^35\.5 Inches Divided by 2/);
    expect(en('page.divide-22-in-by-10.title')).toMatch(/^22 Inches Divided by 10/);
    expect(en('page.divide-9-ft-6-in-by-2.title')).toMatch(/^9 Feet 6 Inches Divided by 2/);
    expect(en('page.divide-3-ft-9-in-by-2.title')).toMatch(/^3 Feet 9 Inches Divided by 2/);
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
