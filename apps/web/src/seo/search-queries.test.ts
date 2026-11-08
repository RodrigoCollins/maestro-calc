import { yd3 } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { volumeText } from '../calculator/present.ts';
import { rectangleAreaPage } from '../calculator/rectangle-area/page.ts';
import { faqOf } from '../content/faq.ts';
import { concrete } from '../lib/concrete.ts';
import { shownFigures } from '../contract/__testing__/shown-figures.ts';
import { readEntries, sectionOf } from '../contract/content.ts';
import { fromRoot } from '../contract/root.ts';
import { siteText } from '../lib/site-text.ts';
import { jobView } from '../lib/job-view.ts';
import { isChartJob, JOBS, jobsOf } from '../routing/jobs.ts';
import { pathOf } from '../routing/routes.ts';
import { CALCULATOR_PAGES } from '../routing/templates.ts';
import { PAGES } from '../lib/pages.ts';

// Growth plan › lever 4: the title and the description of a page carry the words of the Search
// Console queries that already show it (maestrocalc.com, 28 days to 2026-11-02), so the result
// earns the click once the page climbs.
describe('titles from real queries (growth plan › lever 4)', () => {
  // Search Console, 28 days to 2026-11-04: the page has 192 impressions at position 43 and no click,
  // while "decimal to feet and inches calculator" ranks it at 4.9, "convert 11.65 feet to feet and
  // inches round to the nearest 1 16" at 3.0 and "75.5in to ft" at 7.0
  it('names the decimal feet conversion that shows the feet and inches page', () => {
    const en = siteText('en');
    expect(en('page.feet-inches.title')).toBe(
      'Decimal Feet to Feet and Inches Calculator | Maestro Calc',
    );
    expect(en('page.feet-inches.description')).toMatch(
      /^Convert decimal feet to feet and inches to the nearest 1\/16, such as 11\.65 ft = 11 ft 7 13\/16 in\./,
    );
    const es = siteText('es');
    expect(es('page.feet-inches.title')).toBe(
      'Calculadora de pies y pulgadas con decimales | Maestro Calc',
    );
    expect(es('page.feet-inches.description')).toMatch(
      /^Convierte pies decimales a pies y pulgadas al 1\/16, como 11\.65 ft = 11 ft 7 13\/16 in\./,
    );
  });

  it.each([
    ['en', 'how-to-use', /^To convert decimal feet to feet and inches, /],
    ['es', 'como-usar', /^Para convertir pies decimales a pies y pulgadas, /],
  ] as const)(
    'opens the %s feet and inches page with the decimal conversion',
    (locale, id, lead) => {
      const entry = readEntries(fromRoot('apps/web/src/content/calculators')).find(
        ({ path }) => path === `${locale}/feet-inches.md`,
      );
      const [, first = ''] = sectionOf(entry?.body ?? '', id).split('\n\n');
      expect(first).toMatch(lead);
      expect(first).toContain('11 ft 7 13/16 in');
      expect(first).toContain(`](${pathOf('decimal-feet-chart', locale)})`);
    },
  );

  // Search Console: /paint-calculator at 9.8 (19 impressions), /es/calculadora-de-pintura at 12.9
  // (14), no visible query; "cuanto cubre un galon de pintura" (78) and "cuanto es un cuarto de galon
  // de pintura" (6.0) for the Spanish page
  it('asks the gallons question in the paint titles and descriptions', () => {
    const en = siteText('en');
    expect(en('page.paint.title')).toBe(
      'Paint Calculator: How Many Gallons of Paint? | Maestro Calc',
    );
    expect(en('page.paint.description')).toMatch(/^How many gallons of paint do you need\? /);
    expect(en('page.paint.description')).toContain('350 sq ft per gallon');
    const es = siteText('es');
    expect(es('page.paint.title')).toBe('Calculadora de pintura: ¿cuántos galones? | Maestro Calc');
    expect(es('page.paint.description')).toMatch(/^¿Cuántos galones de pintura necesitas\? /);
    expect(es('page.paint.description')).toContain('cuánto cubre un galón');
  });

  // Search Console: /es/guias/leer-la-cinta-metrica-y-sumar-fracciones at 8.5 (11 impressions) and
  // /es/calculadora-de-concreto at 7.2 (4), both with no click
  it('answers first in the Spanish tape measure guide and concrete descriptions', () => {
    const es = siteText('es');
    expect(es('page.guide-tape-measure-fractions.description')).toMatch(
      /^Cómo leer la cinta métrica en pulgadas: /,
    );
    expect(es('page.guide-tape-measure-fractions.description')).toContain('1/16');
    expect(es('page.concrete.description')).toMatch(/^¿Cuántas bolsas de concreto o yardas /);
    expect(es('page.concrete.description')).toContain('40, 60 u 80 lb');
  });

  // Search Console, 2026-11-06: the Spanish pages rank far behind the English ones (square footage
  // 66.7 against 31.5). The Spanish head terms, as Spanish speakers in the US write them: GAF's
  // es-us blog counts roofs in "cuadrados" and shingles in "paquetes" of "tejas", and Spanish drywall
  // guides count "hojas de drywall"; the feet and inches page leads with its own name
  it('puts the Spanish head term of the roofing, drywall and feet and inches pages in the title', () => {
    const es = siteText('es');
    expect(es('page.roofing.title')).toBe('Calculadora de techo: cuadrados y tejas | Maestro Calc');
    expect(es('page.roofing.description')).toMatch(/^¿Cuántos paquetes de tejas necesitas\? /);
    expect(es('page.roofing.description')).toContain('en cuadrados');
    expect(es('page.drywall.title')).toBe(
      'Calculadora de drywall: hojas y compuesto | Maestro Calc',
    );
    expect(es('page.drywall.description')).toMatch(/^Calcula cuántas hojas de drywall /);
    expect(es('page.feet-inches.title')).toMatch(/^Calculadora de pies y pulgadas /);
  });

  // Spanish writes a heading in sentence case: only the first word and proper names take a capital
  it.each(CALCULATOR_PAGES)('writes the Spanish %s heading in sentence case', (id) => {
    const catalog: Readonly<Record<string, string>> = PAGES[id].catalogs.es;
    const title = catalog[`calc.${id}.title`] ?? '';
    expect(title).toMatch(/^Calculadora de /);
    expect(title.slice(1)).toBe(title.slice(1).toLowerCase());
  });

  // The heading is also the last crumb of the breadcrumb. At 320 px, "Calculadora de pendiente de
  // techo" ends within 2 px of the row's edge: on Linux CI the fallback face wrapped it and the web
  // font did not, which shifted the layout by 0.048 when the fonts swapped in. The plural wraps in
  // both faces with about 7 px to spare.
  it('keeps the Spanish roof pitch heading clear of the breadcrumb edge', () => {
    expect(PAGES['roof-pitch'].catalogs.es['calc.roof-pitch.title']).toBe(
      'Calculadora de pendiente de techos',
    );
  });

  // queries that rank the calculator instead of the job page that answers them: "how much concrete
  // for 650 sf slab" (9.5), "22 inches divided by 10" (42.5), "3 feet 9 inches divided by 2" (19),
  // "29 1 4 divided by 2 on a tape measure" (55), "7.5/12 roof pitch" (31), "6 12 roof pitch
  // calculator" (84), "12x7 square feet" (49): the first section of each calculator links the job
  // page with the words of the query
  it.each([
    [
      'en',
      'concrete',
      'how-to-use',
      'how much concrete for a 650 sq ft slab',
      'concrete-slab-650-sq-ft',
    ],
    [
      'es',
      'concrete',
      'como-usar',
      'cuánto concreto lleva una losa de 650 pies cuadrados',
      'concrete-slab-650-sq-ft',
    ],
    ['en', 'feet-inches', 'how-to-use', '22 inches divided by 10', 'divide-22-in-by-10'],
    ['es', 'feet-inches', 'como-usar', '22 pulgadas entre 10', 'divide-22-in-by-10'],
    ['en', 'feet-inches', 'how-to-use', '3 feet 9 inches divided by 2', 'divide-3-ft-9-in-by-2'],
    ['es', 'feet-inches', 'como-usar', '3 pies 9 pulgadas entre 2', 'divide-3-ft-9-in-by-2'],
    [
      'en',
      'feet-inches',
      'how-to-use',
      '29 1/4 divided by 2 on a tape measure',
      'divide-29-1-4-in-by-2',
    ],
    [
      'es',
      'feet-inches',
      'como-usar',
      '29 1/4 entre 2 en la cinta métrica',
      'divide-29-1-4-in-by-2',
    ],
    ['en', 'roof-pitch', 'how-to-use', '7.5/12 roof pitch', 'roof-pitch-7-5-12'],
    ['es', 'roof-pitch', 'como-usar', 'pendiente de techo 7.5/12', 'roof-pitch-7-5-12'],
    ['en', 'roof-pitch', 'how-to-use', '6/12 roof pitch', 'roof-pitch-6-12'],
    ['es', 'roof-pitch', 'como-usar', 'pendiente de techo 6/12', 'roof-pitch-6-12'],
    ['en', 'rectangle-area', 'how-to-use', '12x7 square feet', 'square-feet-7x12'],
    ['es', 'rectangle-area', 'como-usar', '12x7 pies cuadrados', 'square-feet-7x12'],
  ] as const)(
    'links the %s %s page to its job with the words of the query: %s',
    (locale, calculator, section, anchor, job) => {
      const entry = readEntries(fromRoot('apps/web/src/content/calculators')).find(
        ({ path }) => path === `${locale}/${calculator}.md`,
      );
      expect(sectionOf(entry?.body ?? '', section)).toContain(
        `[${anchor}](${pathOf(job, locale)})`,
      );
    },
  );

  // Search Console, 2026-11-06: "calculadora pies cuadrados" (72.0), "calculadora de pies
  // cuadrados" (74.0), "25 pies cuadrados" (33.0): the Spanish page opens with the words of the
  // query and a room measured in feet and inches, worked out with its square meters
  it('opens the Spanish square footage page with the query and a room in feet and inches', () => {
    const entry = readEntries(fromRoot('apps/web/src/content/calculators')).find(
      ({ path }) => path === 'es/rectangle-area.md',
    );
    const body = entry?.body ?? '';
    const [, first = ''] = sectionOf(body, 'como-usar').split('\n\n');
    expect(first).toMatch(/^La calculadora de pies cuadrados /);
    // 11 ft 6 in by 13 ft 3 in is 138 in by 159 in
    const { figures } = shownFigures(rectangleAreaPage, 'v=1&l=138&w=159');
    expect(first).toContain('11 ft 6 in por 13 ft 3 in');
    expect(first).toContain(`${figures['areaFt2'] ?? 'missing'} pies cuadrados`);
    expect(first).toContain(`${figures['areaM2'] ?? 'missing'} metros cuadrados`);
    const formulas = sectionOf(body, 'formulas');
    for (const figure of [figures['areaFt2'], figures['areaYd2'], figures['areaM2']]) {
      expect(formulas).toContain(figure ?? 'missing');
    }
    const faq = faqOf(body);
    expect(faq).toHaveLength(8);
    const meters = faq.find(({ question }) => question.includes('25 pies cuadrados'));
    // hand-verified: 25 × 0.09290304 = 2.322576 m²
    expect(meters?.answer).toContain('2.32 metros cuadrados');
  });

  // query: "the area of a large rug is 188 ft2. what is this area in units of m2?" (11.0)
  it('names the square meters chart after the conversion and answers the rug in its intro', () => {
    const id = 'square-feet-to-square-meters-chart';
    const en = siteText('en');
    expect(en(`page.${id}.title`)).toBe('Square Feet to Square Meters Chart | Maestro Calc');
    expect(en(`page.${id}.heading`)).toMatch(/^Square feet to square meters chart/);
    expect(en(`page.${id}.description`)).toContain('10 to 2,000 sq ft');
    const es = siteText('es');
    expect(es(`page.${id}.title`)).toBe(
      'Tabla de pies cuadrados a metros cuadrados | Maestro Calc',
    );
    expect(es(`page.${id}.description`)).toContain('10 a 2,000 pies cuadrados');
    for (const locale of ['en', 'es'] as const) {
      const view = jobView(id, locale);
      const shown = view.rows.find((row) => row.label === '188 ft²')?.cells[0] ?? 'missing';
      expect(view.intro).toContain('188');
      expect(view.intro).toContain(shown);
      expect(view.intro).toContain('0.09290304');
    }
  });

  it.each([
    ['en', 'how-to-use', 'square feet to square meters chart'],
    ['es', 'como-usar', 'tabla de pies cuadrados a metros cuadrados'],
  ] as const)(
    'links the %s square footage calculator to the square meters chart',
    (locale, section, anchor) => {
      const entry = readEntries(fromRoot('apps/web/src/content/calculators')).find(
        ({ path }) => path === `${locale}/rectangle-area.md`,
      );
      expect(sectionOf(entry?.body ?? '', section)).toContain(
        `[${anchor}](${pathOf('square-feet-to-square-meters-chart', locale)})`,
      );
    },
  );

  it('names the decimal feet chart after the conversion people ask for', () => {
    const en = siteText('en');
    expect(en('page.decimal-feet-chart.title')).toContain('Decimal Feet to Feet and Inches Chart');
    expect(en('page.decimal-feet-chart.heading')).toMatch(/^Decimal feet to feet and inches chart/);
    expect(en('page.decimal-feet-chart.description')).toContain('0.10 to 0.99 ft');
    expect(en('page.decimal-feet-chart.description')).toContain('1/16');
    const es = siteText('es');
    expect(es('page.decimal-feet-chart.title')).toContain('pies decimales a pies y pulgadas');
    expect(es('page.decimal-feet-chart.description')).toContain('0.10 a 0.99 ft');
    for (const locale of ['en', 'es'] as const) {
      const view = jobView('decimal-feet-chart', locale);
      const shown = (label: string) => view.rows.find((row) => row.label === label)?.cells[0];
      expect(view.intro).toContain(`11.65 ft`);
      expect(view.intro).toContain(shown('11.65 ft') ?? 'missing');
      expect(view.intro).toContain(shown('0.50 ft') ?? 'missing');
    }
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
    // "calculadora pies cuadrados" (72.0) and "calculadora de pies cuadrados" (74.0), 2026-11-06:
    // the Spanish title and description open with the words of the query
    expect(es('page.rectangle-area.title')).toBe(
      'Calculadora de pies cuadrados para un cuarto | Maestro Calc',
    );
    expect(es('page.rectangle-area.description')).toMatch(
      /^Calculadora de pies cuadrados gratis: multiplica el largo por el ancho de un cuarto, piso o pared/,
    );
    expect(es('page.rectangle-area.description')).toContain('pies y pulgadas');
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
    for (const id of jobsOf('rectangle-area').filter((each) =>
      /^square-feet-\d+x\d+$/.test(each),
    )) {
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

  // query: "how many square feet is a 12x12 room" (1.0K, KD 0, Ahrefs US 2026-11-08)
  it('answers the 12x12 room in its h1 first, with the square yards carpet is priced in', () => {
    expect(siteText('en')('page.square-feet-12x12.heading')).toBe(
      'A 12x12 room is 144 square feet',
    );
    expect(siteText('es')('page.square-feet-12x12.heading')).toBe(
      'Un cuarto de 12x12 tiene 144 pies cuadrados',
    );
    expect(siteText('en')('page.square-feet-12x12.intro')).toContain('16 square yards');
    expect(siteText('es')('page.square-feet-12x12.intro')).toContain('16 yardas cuadradas');
  });

  // queries: "how many square feet in an acre" (57K, KD 7), "in a quarter acre" (1.3K), "in half
  // an acre" (1.1K), "in a half acre" (1.0K), Ahrefs US 2026-11-08: the answer comes first
  it('answers each acre page with its square feet in the title, the h1 and the description', () => {
    const lots = [
      ['square-feet-in-an-acre', 'An Acre Is', 'Un acre tiene', 'in an acre?', 'tiene un acre?'],
      [
        'square-feet-in-a-half-acre',
        'Half an Acre Is',
        'Medio acre tiene',
        'in half an acre?',
        'tiene medio acre?',
      ],
      [
        'square-feet-in-a-quarter-acre',
        'A Quarter Acre Is',
        'Un cuarto de acre',
        'in a quarter acre?',
        'tiene un cuarto de acre?',
      ],
    ] as const;
    for (const [id, enTitle, esTitle, enQuery, esQuery] of lots) {
      const feet = jobView(id, 'en').rows[0].cells[0]?.replace(/\.00$/, '') ?? '';
      const en = siteText('en');
      const es = siteText('es');
      expect(en(`page.${id}.title`), id).toMatch(new RegExp(`^${enTitle} ${feet} Square Feet`));
      expect(es(`page.${id}.title`), id).toMatch(
        new RegExp(`^${esTitle}.* ${feet} pies cuadrados`),
      );
      expect(en(`page.${id}.heading`), id).toContain(`${feet} square feet`);
      expect(es(`page.${id}.heading`), id).toContain(`${feet} pies cuadrados`);
      expect(en(`page.${id}.description`), id).toContain(`How many square feet ${enQuery}`);
      expect(es(`page.${id}.description`), id).toContain(`¿Cuántos pies cuadrados ${esQuery}`);
    }
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
    for (const id of jobsOf('feet-inches').filter((each) => !isChartJob(each))) {
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
