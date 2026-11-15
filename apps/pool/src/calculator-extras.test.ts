import { describe, expect, it } from 'vitest';
import { CALCULATOR_EXTRAS, EXTRAS_CHECKED, extrasOf } from './calculator-extras.ts';
import { CHLORINE, PH, SALT } from './doses.ts';
import { SALT_ES } from './doses-es.ts';
import { JOB_PAGES } from './jobs.ts';
import { langOf, routeOf } from './routes.ts';
import { VOLUME_TEXTS } from './volume/texts.ts';

const cellOf = (path: string, table: string, row: string, column: number): string | undefined =>
  extrasOf(path)
    ?.tables.find(({ id }) => id === table)
    ?.rows.find(({ label }) => label === row)?.cells[column];

const JOB_PATHS = new Set(JOB_PAGES.map(({ path }) => path));

describe('the extras of the main calculator pages', () => {
  it('are on the pH, chlorine, salt and volume pages, and the Spanish salt page', () => {
    expect(CALCULATOR_EXTRAS.map(({ path }) => path)).toEqual([
      PH.path,
      CHLORINE.path,
      SALT.path,
      VOLUME_TEXTS.path,
      SALT_ES.path,
    ]);
    expect(extrasOf('/pool-pump-size-calculator')).toBeUndefined();
  });

  it('were checked against their sources on the day the pages were reworked', () => {
    expect(EXTRAS_CHECKED).toBe('2026-11-10');
    for (const extras of CALCULATOR_EXTRAS) expect(extras.checked).toBe(EXTRAS_CHECKED);
  });

  // Taylor's chart per drop per 10,000 gallons: 9.16 fl oz of muriatic acid, 12.32 oz of dry acid
  // and 5.13 oz of soda ash, times the drops and the gallons over 10,000
  it('works the pH table out by the engine, as the Taylor chart reads by hand', () => {
    expect(cellOf(PH.path, 'muriatic', '10,000', 0)).toBe('9.2');
    expect(cellOf(PH.path, 'muriatic', '20,000', 1)).toBe('36.6');
    expect(cellOf(PH.path, 'muriatic', '40,000', 2)).toBe('109.9');
    expect(cellOf(PH.path, 'dry-acid', '10,000', 0)).toBe('12.3');
    expect(cellOf(PH.path, 'dry-acid', '30,000', 2)).toBe('110.9');
    expect(cellOf(PH.path, 'soda-ash', '10,000', 2)).toBe('15.4');
    expect(cellOf(PH.path, 'soda-ash', '5,000', 0)).toBe('2.6');
  });

  // 1 ppm is 1 mg/L: 10,000 gal x 3.785411784 L = 37,854 L, so +1 ppm takes 37.854 g of available
  // chlorine: 302.8 mL (10.2 fl oz) of 12.5% liquid; 0 to 10 ppm of 65% cal-hypo is 582.4 g, 20.5 oz
  it('works the chlorine table out by the engine', () => {
    expect(cellOf(CHLORINE.path, 'raise', '10,000', 0)).toBe('10.2');
    expect(cellOf(CHLORINE.path, 'raise', '20,000', 1)).toBe('25.6');
    expect(cellOf(CHLORINE.path, 'shock', '10,000', 0)).toBe('102.4');
    expect(cellOf(CHLORINE.path, 'shock', '10,000', 1)).toBe('20.5');
    expect(cellOf(CHLORINE.path, 'shock', '10,000', 2)).toBe('23.8');
  });

  // pounds = gallons x ppm x 8.34 / 1,000,000: 10,000 gal from 0 to 3,200 ppm is 266.9 lb, 7 bags
  it('works the salt tables out by the engine, in pounds and in kilograms', () => {
    expect(cellOf(SALT.path, 'salt', '10,000', 0)).toBe('41.7');
    expect(cellOf(SALT.path, 'salt', '10,000', 2)).toBe('266.9');
    expect(cellOf(SALT.path, 'salt', '10,000', 3)).toBe('7');
    expect(cellOf(SALT.path, 'salt', '20,000', 0)).toBe('83.4');
    expect(cellOf(SALT.path, 'salt', '20,000', 1)).toBe('166.8');
    // 50,000 L x 4,000 ppm / 1,000,000 = 200 kg, ten 20 kg bags; to 3,200 ppm, 160 kg
    expect(cellOf(SALT_ES.path, 'sal', '50,000', 0)).toBe('160.0');
    expect(cellOf(SALT_ES.path, 'sal', '50,000', 1)).toBe('200.0');
    expect(cellOf(SALT_ES.path, 'sal', '50,000', 2)).toBe('10');
  });

  // a 30 ft round pool 4 ft deep: pi x 15^2 x 4 = 2,827.4 cubic feet, x 7.48052 = 21,151 gallons;
  // 18 x 36 ft from 3 to 6 ft deep: 18 x 36 x 4.5 = 2,916 cubic feet, 21,813 gallons
  it('gives the gallons of each common size by the volume engine', () => {
    expect(cellOf(VOLUME_TEXTS.path, 'round', '30 ft round', 0)).toBe('21,151');
    expect(cellOf(VOLUME_TEXTS.path, 'rectangle', '18 x 36 ft', 0)).toBe('21,813');
    const round = extrasOf(VOLUME_TEXTS.path)?.tables.find(({ id }) => id === 'round');
    expect(round?.rows.map(({ label }) => label)).toEqual(
      [12, 15, 18, 21, 24, 27, 30, 33].map((feet) => `${String(feet)} ft round`),
    );
    const rectangle = extrasOf(VOLUME_TEXTS.path)?.tables.find(({ id }) => id === 'rectangle');
    expect(rectangle?.rows.map(({ label }) => label)).toEqual([
      '12 x 24 ft',
      '14 x 28 ft',
      '16 x 32 ft',
      '18 x 36 ft',
      '20 x 40 ft',
    ]);
  });

  // a size or dose with a page of its own links it, rather than this page restating it
  it('links each row to the page of its size where there is one, and to nothing else', () => {
    const linked = (path: string) =>
      extrasOf(path)?.tables.flatMap(({ rows }) => rows.flatMap(({ href }) => href ?? [])) ?? [];
    for (const { path } of CALCULATOR_EXTRAS)
      for (const href of linked(path)) expect(JOB_PATHS.has(href), href).toBe(true);
    expect(linked(VOLUME_TEXTS.path)).toContain('/30-ft-round-pool-gallons');
    expect(linked(VOLUME_TEXTS.path)).toContain('/18x36-pool-gallons');
    expect(linked(PH.path)).toContain('/how-much-muriatic-acid-for-a-20000-gallon-pool');
    expect(linked(SALT.path)).toContain('/how-much-salt-for-a-20000-gallon-pool');
    expect(linked(CHLORINE.path)).toContain('/how-much-shock-for-a-20000-gallon-pool');
  });

  it('answers the questions under the dose with sources the page lists', () => {
    for (const extras of CALCULATOR_EXTRAS.filter(({ path }) => path !== VOLUME_TEXTS.path)) {
      expect(extras.faq.length, extras.path).toBeGreaterThanOrEqual(5);
      for (const { question, answer, sources } of extras.faq) {
        expect(question.endsWith('?'), question).toBe(true);
        expect(answer.length, question).toBeGreaterThan(80);
        expect(sources.length, question).toBeGreaterThan(0);
        for (const key of sources) expect(extras.sources[key], key).toBeDefined();
      }
    }
    // the wait to swim links the guide that gives it for every product, in the page's language
    for (const extras of CALCULATOR_EXTRAS)
      for (const { link } of extras.faq)
        if (link !== undefined)
          expect(routeOf(link.href)?.[extras.lang], link.href).toBe(link.href);
    expect(extrasOf(PH.path)?.faq.some(({ link }) => link !== undefined)).toBe(true);
    const questions = CALCULATOR_EXTRAS.flatMap(({ faq }) => faq.map(({ question }) => question));
    expect(new Set(questions).size).toBe(questions.length);
  });

  it('asks how long to wait to swim, how much at a time and when to retest on each dose page', () => {
    for (const path of [PH.path, CHLORINE.path, SALT.path]) {
      const text = extrasOf(path)
        ?.faq.map(({ question }) => question.toLowerCase())
        .join(' ');
      expect(text, path).toContain('swim');
      expect(text, path).toMatch(/at a time|at once/);
      expect(text, path).toMatch(/retest|test (the \w+ )?again/);
    }
    const es = extrasOf(SALT_ES.path)
      ?.faq.map(({ question }) => question.toLowerCase())
      .join(' ');
    expect(es).toContain('nadar');
    expect(es).toContain('de una vez');
    expect(es).toContain('medir');
  });

  it('cites the labels and manuals it quotes, each with its address', () => {
    for (const extras of CALCULATOR_EXTRAS)
      for (const source of Object.values(extras.sources)) {
        expect(source.url, source.name).toMatch(/^https:\/\//);
        expect(source.name.length).toBeGreaterThan(10);
      }
    const sourcesOf = (path: string) =>
      Object.values(extrasOf(path)?.sources ?? {})
        .map(({ name }) => name)
        .join(' ');
    expect(sourcesOf(PH.path)).toContain('Taylor');
    expect(sourcesOf(PH.path)).toContain('HASA');
    expect(sourcesOf(PH.path)).toContain('pH Down');
    expect(sourcesOf(CHLORINE.path)).toContain('EPA Reg. No. 55487-20001');
    expect(sourcesOf(CHLORINE.path)).toContain('CDC');
    expect(sourcesOf(SALT.path)).toContain('Hayward');
    const chlorine = JSON.stringify(extrasOf(CHLORINE.path)?.faq);
    expect(chlorine).toContain('0.91 ppm of stabilizer');
    expect(chlorine).toContain('0.71 ppm of calcium hardness');
  });

  it('writes each page in its own language, the Spanish one in the tú register', () => {
    for (const extras of CALCULATOR_EXTRAS) {
      expect(routeOf(extras.path), extras.path).toBeDefined();
      expect(extras.lang).toBe(langOf(extras.path));
    }
    const es = extrasOf(SALT_ES.path);
    const text = JSON.stringify(es);
    expect(text).not.toMatch(/\busted\b|\bIngrese\b|\bAgregue\b/);
    expect(es?.tables[0]?.caption.toLowerCase()).toContain('kilos de sal');
  });
});

// the words of the queries the pages are found for, as the title, inside a result's 65 characters
describe('the titles of the main calculator pages', () => {
  it('say what the reader searched for', () => {
    expect(PH.title).toBe('Pool pH Calculator: How Much pH Up or Down to Add | Pool Figures');
    expect(CHLORINE.title).toBe(
      'Pool Chlorine Calculator: How Much Chlorine to Add | Pool Figures',
    );
    expect(SALT.title).toBe('Pool Salt Calculator: How Many Pounds and Bags | Pool Figures');
    expect(SALT_ES.title).toBe('Calculadora de sal para piscina: kilos y sacos | Pool Figures');
    for (const { title } of [PH, CHLORINE, SALT, SALT_ES, VOLUME_TEXTS])
      expect(title.length, title).toBeLessThanOrEqual(65);
  });

  it('name the table and the questions in the description', () => {
    expect(PH.description).toMatch(/dry acid/);
    expect(PH.description).toMatch(/oz and lb/);
    expect(CHLORINE.description).toMatch(/pool size/);
    expect(SALT.description).toMatch(/pool size/);
    expect(VOLUME_TEXTS.description).toMatch(/12 to 33 ft round/);
    expect(SALT_ES.description).toMatch(/kilos/);
  });
});
