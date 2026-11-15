import { describe, expect, it } from 'vitest';
import { OVERTIME_PATHS } from '../overtime/texts.ts';
import { DESCRIPTION, TITLE_MAX } from '../seo/meta.ts';
import { antiguedadPageOf, LABOR_ARTICLES, LABOR_SOURCES, sdiPageOf } from './labor-pages.ts';
import { MX_SOURCES } from './pages.ts';
import {
  AGUINALDO_PATH,
  ANTIGUEDAD_PATH,
  mexicoPathOf,
  SDI_PATH,
  VACACIONES_PATH,
} from './routes.ts';

const textOf = (value: unknown): string => JSON.stringify(value);
const hrefsOf = (sections: readonly { readonly links?: readonly { href: string }[] }[]) =>
  sections.flatMap(({ links }) => links ?? []).map(({ href }) => href);

describe('LABOR_SOURCES', () => {
  it('reuses the official notices the other Mexico pages cite, word for word', () => {
    expect(LABOR_SOURCES.uma).toEqual(MX_SOURCES.uma);
    expect(LABOR_SOURCES.conasami).toEqual(MX_SOURCES.conasami);
    expect(LABOR_SOURCES.desindexacion).toEqual(MX_SOURCES.desindexacion);
    expect(LABOR_SOURCES.dof2022).toEqual(MX_SOURCES.dof2022);
    expect(LABOR_SOURCES.lft.href).toBe(MX_SOURCES.lft.href);
    expect(LABOR_SOURCES.lisr.href).toBe(MX_SOURCES.lisr.href);
  });

  it('names every article of the LFT the new pages cite', () => {
    for (const article of [
      '61',
      '66',
      '67',
      '68',
      '69',
      '71',
      '73',
      '84',
      '89',
      '162',
      '485',
      '486',
    ])
      expect(LABOR_SOURCES.lft.label).toContain(article);
    expect(LABOR_SOURCES.lss.label).toContain('arts. 27 a 30');
  });
});

describe('antiguedadPageOf', () => {
  const page = antiguedadPageOf();
  const text = textOf(page.sections);

  it('answers with no script: 15 years at the minimum wage, $56,707.20', () => {
    // 1 July 2011 to 30 June 2026: 15 years; 12 × 15 = 180 days; 315.04 × 180 = 56,707.20
    expect(page.result.figure).toBe('$56,707.20');
    expect(page.result.rows.map(({ key, value }) => [key, value])).toEqual([
      ['service', '15 años'],
      ['base', '$315.04'],
      ['earned', '180 días'],
      ['whole', '$56,707.20'],
    ]);
    expect(page.paths).toEqual({ es: ANTIGUEDAD_PATH });
  });

  it('targets «prima de antigüedad» and «cálculo de prima de antigüedad»', () => {
    expect(page.h1).toBe('Calculadora de prima de antigüedad');
    expect(page.title.startsWith('Calculadora de prima de antigüedad')).toBe(true);
    expect(page.lead.startsWith('La prima de antigüedad son 12 días de salario')).toBe(true);
  });

  it('quotes art. 162 and 486 word for word', () => {
    expect(text).toContain(
      '«La prima de antigüedad consistirá en el importe de doce días de salario, por cada año de servicios»',
    );
    expect(text).toContain(
      '«si el salario que percibe el trabajador excede del doble del salario mínimo del área geográfica de aplicación a que corresponda el lugar de prestación del trabajo, se considerará esa cantidad como salario máximo»',
    );
  });

  it('caps the salary at twice the minimum of each zone: $630.08 and $881.74', () => {
    for (const figure of ['$630.08', '$881.74']) expect(text).toContain(figure);
    const table = page.sections.find(({ id }) => id === 'tope')?.table;
    // 500 × 12 = 6,000.00 in both; 800 capped at 630.08 → 7,560.96 in the general zone, 9,600.00 at
    // the border; 1,000 → 7,560.96 and 881.74 × 12 = 10,580.88
    expect(table?.rows).toContainEqual(['$500.00', '$6,000.00', '$6,000.00']);
    expect(table?.rows).toContainEqual(['$800.00', '$7,560.96', '$9,600.00']);
    expect(table?.rows).toContainEqual(['$1,000.00', '$7,560.96', '$10,580.88']);
  });

  it('works the dismissal at 4 years and 181 days on $20,000 a month out by the engine', () => {
    // 630.08 × 12 × 1,641 / 365 = 33,993.25; 12 × 1,641 / 365 = 53.95 days
    for (const figure of ['$666.67', '53.95 días', '$33,993.25']) expect(text).toContain(figure);
  });

  it('tells who gets it: 15 years to leave by choice, any seniority on dismissal or death', () => {
    const table = page.sections.find(({ id }) => id === 'quien-la-cobra')?.table;
    expect(table?.rows).toHaveLength(4);
    expect(textOf(table)).toContain('15 años');
    expect(textOf(table)).toContain('art. 501');
  });

  it('links the salario integrado, the aguinaldo and the vacation calculators', () => {
    const hrefs = hrefsOf(page.sections);
    for (const href of [SDI_PATH, AGUINALDO_PATH, VACACIONES_PATH]) expect(hrefs).toContain(href);
  });
});

describe('sdiPageOf', () => {
  const page = sdiPageOf();
  const text = textOf(page.sections);

  it('answers with no script: the first year at the minimum wage, $330.58', () => {
    expect(page.result.figure).toBe('$330.58');
    expect(page.result.rows.map(({ key, value }) => [key, value])).toEqual([
      ['daily', '$315.04'],
      ['year', 'Año 1 · 12 días de vacaciones'],
      ['factor', '1.0493'],
      ['aguinaldo', '$12.95'],
      ['prima', '$2.59'],
      ['sbc', '$330.58'],
    ]);
    expect(page.paths).toEqual({ es: SDI_PATH });
  });

  it('targets «salario diario integrado» and «calculadora de salario diario integrado»', () => {
    expect(page.h1).toBe('Calculadora de salario diario integrado');
    expect(page.lead.startsWith('El salario diario integrado')).toBe(true);
  });

  it('tabulates the factor by years of service, with the SDI at two salaries', () => {
    const table = page.sections.find(({ id }) => id === 'tabla-factor')?.table;
    expect(table?.rows).toHaveLength(11);
    // 12,000 / 30 × 383 / 365 = 419.73
    expect(table?.rows[0]).toEqual(['1 año', '12 días', '1.0493', '$330.58', '$419.73']);
    // 22 days: 315.04 × 385.5 / 365 = 332.73; 400 × 385.5 / 365 = 422.47
    expect(table?.rows[5]).toEqual(['6 a 10 años', '22 días', '1.0562', '$332.73', '$422.47']);
  });

  it('quotes art. 84 and caps the IMSS base at 25 UMA, $2,932.75', () => {
    expect(text).toContain(
      '«El salario se integra con los pagos hechos en efectivo por cuota diaria, gratificaciones, percepciones, habitación, primas, comisiones, prestaciones en especie y cualquiera otra cantidad o prestación que se entregue al trabajador por su trabajo.»',
    );
    // 100,000 / 30 × 383 / 365 = 3,497.72
    for (const figure of ['$2,932.75', '$3,497.72']) expect(text).toContain(figure);
  });

  it('links the aguinaldo, the vacation pages and the new answer pages', () => {
    const hrefs = hrefsOf(page.sections);
    for (const href of [
      AGUINALDO_PATH,
      VACACIONES_PATH,
      mexicoPathOf('prima-vacacional'),
      mexicoPathOf('prima-dominical'),
      mexicoPathOf('como-se-pagan-las-horas-extras'),
      ANTIGUEDAD_PATH,
    ])
      expect(hrefs).toContain(href);
  });
});

describe('LABOR_ARTICLES', () => {
  describe('the prima dominical page', () => {
    const page = LABOR_ARTICLES['prima-dominical']();
    const text = textOf(page.sections);

    it('answers 25% at least (art. 71): $78.76 a Sunday at the minimum wage', () => {
      expect(page.answer.figure).toBe('25%');
      expect(page.lead).toContain('art. 71');
      expect(page.lead).toContain('$78.76');
      // 440.87 × 25% = 110.2175 → 110.22
      expect(textOf(page.answer)).toContain('$110.22');
    });

    it('quotes article 71 word for word', () => {
      expect(text).toContain(
        '«Los trabajadores que presten servicio en día domingo tendrán derecho a una prima adicional de un veinticinco por ciento, por lo menos, sobre el salario de los días ordinarios de trabajo.»',
      );
    });

    it('adds the double salary of art. 73 when the Sunday is the rest day: $708.84', () => {
      // 315.04 × 2 = 630.08; + 78.76 = 708.84
      expect(text).toContain('$708.84');
      expect(text).toContain('art. 73');
    });

    it('exempts one UMA a Sunday from ISR: $117.31', () => {
      expect(text).toContain('$117.31');
    });
  });

  describe('the overtime page', () => {
    const page = LABOR_ARTICLES['como-se-pagan-las-horas-extras']();
    const text = textOf(page.sections);

    it('answers double for the first nine hours of a week, triple past them', () => {
      expect(page.h1).toBe('¿Cómo se pagan las horas extras en México?');
      expect(page.answer.figure).toBe('Dobles');
      // 315.04 / 8 = 39.38; × 2 = 78.76; × 3 = 118.14
      for (const figure of ['$78.76', '$118.14']) expect(page.lead).toContain(figure);
    });

    it('quotes arts. 66, 67 and 68 word for word', () => {
      for (const quote of [
        '«Podrá también prolongarse la jornada de trabajo por circunstancias extraordinarias, sin exceder nunca de tres horas diarias ni de tres veces en una semana.»',
        '«Las horas de trabajo extraordinario se pagarán con un ciento por ciento más del salario que corresponda a las horas de la jornada.»',
        '«La prolongación del tiempo extraordinario que exceda de nueve horas a la semana, obliga al patrón a pagar al trabajador el tiempo excedente con un doscientos por ciento más del salario que corresponda a las horas de la jornada',
      ])
        expect(text).toContain(quote);
    });

    it('works 12 hours at the minimum wage and 9 night hours out by the engine', () => {
      // 9 × 78.76 = 708.84; 3 × 118.14 = 354.42; 1,063.26; night: 315.04 × 18 / 7 = 810.10
      for (const figure of ['$708.84', '$354.42', '$1,063.26', '$810.10'])
        expect(text).toContain(figure);
    });

    it('exempts half of the overtime up to 5 UMA a week: $586.55', () => {
      expect(text).toContain('$586.55');
    });

    it('links the U.S. overtime calculator in its own section, named by country', () => {
      const us = page.sections.find(({ id }) => id === 'estados-unidos');
      expect(us?.heading).toContain('Estados Unidos');
      expect(us?.links?.map(({ href }) => href)).toEqual([OVERTIME_PATHS.es]);
      expect(us?.links?.[0]?.label).toContain('Estados Unidos');
      // nowhere else
      const others = page.sections.filter(({ id }) => id !== 'estados-unidos');
      expect(hrefsOf(others)).not.toContain(OVERTIME_PATHS.es);
    });
  });

  it.each(Object.keys(LABOR_ARTICLES) as (keyof typeof LABOR_ARTICLES)[])(
    '%s has a head that fits, three sources and the SDI calculator',
    (slug) => {
      const page = LABOR_ARTICLES[slug]();
      expect(page.title.length).toBeLessThanOrEqual(TITLE_MAX);
      expect(page.description.length).toBeGreaterThanOrEqual(DESCRIPTION.min);
      expect(page.description.length).toBeLessThanOrEqual(DESCRIPTION.max);
      expect(page.sources.length).toBeGreaterThanOrEqual(3);
      expect(page.calculator.href).toBe(SDI_PATH);
    },
  );

  it('fits the heads of the two calculators', () => {
    for (const page of [antiguedadPageOf(), sdiPageOf()]) {
      expect(page.title.length).toBeLessThanOrEqual(TITLE_MAX);
      expect(page.description.length).toBeGreaterThanOrEqual(DESCRIPTION.min);
      expect(page.description.length).toBeLessThanOrEqual(DESCRIPTION.max);
    }
  });
});
