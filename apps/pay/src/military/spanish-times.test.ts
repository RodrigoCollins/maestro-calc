import { describe, expect, it } from 'vitest';
import { DESCRIPTION, TITLE_MAX } from '../seo/meta.ts';
import {
  MILITARY_CHART_PATHS,
  MILITARY_CONVERTER_PATHS,
  SPANISH_TIMES,
  type MilitaryTimeJob,
} from './routes.ts';
import { chartOf } from './chart.ts';
import { converterOf } from './converter.ts';
import { spanishTimePageOf, spanishTimesSectionOf, withSpanishTimes } from './spanish-times.ts';

const jobAt = (slug: string): MilitaryTimeJob => {
  const job = SPANISH_TIMES.find((each) => each.slug === slug);
  if (job === undefined) throw new Error(`no Spanish time ${slug}`);
  return job;
};
const page = (slug: string) => spanishTimePageOf(jobAt(slug));
const section = (slug: string, id: string) => {
  const found = page(slug).sections.find((each) => each.id === id);
  if (found === undefined) throw new Error(`no section ${id} on ${slug}`);
  return found;
};
const rowOf = (slug: string, id: string, label: string) =>
  section(slug, id).table?.rows.find(([first]) => first === label);
const textOf = (slug: string, id: string): string => {
  const { paragraphs, steps = [], after = [] } = section(slug, id);
  return [...paragraphs, ...steps, ...after].join(' ');
};

/** The six-word shingles of a text, as the content audit counts shared text. */
const shingles = (text: string): Set<string> => {
  const words = text.toLowerCase().match(/[\p{L}\p{N}'’.,/×-]+/gu) ?? [];
  return new Set(words.slice(0, -5).map((_, index) => words.slice(index, index + 6).join(' ')));
};

/** Everything a page shows in its main content, in reading order. */
const prose = (job: MilitaryTimeJob): string => {
  const view = spanishTimePageOf(job);
  return [
    view.kicker,
    view.h1,
    view.lead,
    view.figureLabel,
    view.figure,
    ...view.rows.flatMap(({ label, value }) => [label, value]),
    view.calculator.label,
    view.note,
    ...view.sections.flatMap((each) => [
      each.heading,
      ...each.paragraphs,
      ...(each.steps ?? []),
      ...(each.table === undefined
        ? []
        : [each.table.caption, ...each.table.head, ...each.table.rows.flat()]),
      ...(each.after ?? []),
      ...(each.links ?? []).map(({ label }) => label),
    ]),
    ...view.sources.map(({ label }) => label),
    view.others.heading,
    ...view.others.links.map(({ label }) => label),
  ].join(' ');
};

describe('the Spanish 24-hour clock pages', () => {
  it('answer first: las 19 horas son las 7 de la tarde (7:00 p. m.)', () => {
    const nineteen = page('1900');
    expect(nineteen.title).toBe('¿Qué hora son las 19 horas? Las 7 de la tarde (7:00 p. m.)');
    expect(nineteen.h1).toBe('Las 19 horas son las 7 de la tarde');
    expect(nineteen.lead).toMatch(/^Las 19 horas son las 7 de la tarde \(7:00 p\. m\.\)\. /);
    expect(nineteen.lead).toContain('19 − 12 = 7');
    expect(nineteen.lead).toContain('las diecinueve horas');
    expect(nineteen.figure).toBe('7:00 p. m.');
    expect(nineteen.paths).toEqual({ en: '/military-time/1900', es: '/es/hora/las-19-horas' });
    expect(page('1830').h1).toBe('Las 18:30 horas son las 6 y media de la tarde');
    expect(page('1300').h1).toBe('Las 13 horas son la 1 de la tarde');
    expect(page('2100').h1).toBe('Las 21 horas son las 9 de la noche');
    expect(page('1200').h1).toBe('Las 12 horas son las 12 del mediodía');
    expect(page('0000').h1).toBe('Las 00 horas son las 12 de la noche, la medianoche');
    expect(page('0000').lead).toContain('24:00');
    expect(page('0030').h1).toBe('Las 00:30 horas son las 12 y media de la noche');
  });

  it('gives every page a title and a description a result shows whole, each its own', () => {
    const titles = new Set<string>();
    const descriptions = new Set<string>();
    for (const job of SPANISH_TIMES) {
      const { title, description, h1 } = spanishTimePageOf(job);
      expect(title.length, job.slug).toBeLessThanOrEqual(TITLE_MAX);
      expect(title, job.slug).toMatch(/^¿Qué hora son las \d\d(:\d\d)? horas\? /);
      expect(description.length, job.slug).toBeGreaterThanOrEqual(DESCRIPTION.min);
      expect(description.length, job.slug).toBeLessThanOrEqual(DESCRIPTION.max);
      expect(description.startsWith(h1), job.slug).toBe(true);
      titles.add(title);
      descriptions.add(description);
    }
    expect(titles.size).toBe(26);
    expect(descriptions.size).toBe(26);
  });

  it('says it the way Mexico, Spain and Argentina do, and writes it each way', () => {
    expect(rowOf('1900', 'countries', 'México')).toEqual([
      'México',
      'las 7 de la noche',
      '19:00 h · 7:00 p. m.',
    ]);
    expect(rowOf('1900', 'countries', 'España')).toEqual([
      'España',
      'las 7 de la tarde',
      '19:00 h o 19.00 h',
    ]);
    expect(rowOf('1900', 'countries', 'Argentina')).toEqual([
      'Argentina',
      'las 7 de la tarde',
      '19 h o 19:00 hs',
    ]);
    expect(rowOf('2030', 'countries', 'España')?.[1]).toBe('las 8 y media de la tarde');
    expect(rowOf('2030', 'countries', 'Argentina')?.[1]).toBe('las 8 y media de la noche');
    expect(rowOf('2030', 'countries', 'Argentina')?.[2]).toBe('20:30 h o 20:30 hs');
    expect(textOf('1900', 'countries')).toContain('«diecinueve cero cero»');
    expect(textOf('1830', 'countries')).toContain('«dieciocho treinta»');
    expect(textOf('1830', 'countries')).toContain('«las dieciocho horas y treinta minutos»');
  });

  it('reads every five minutes of its hour, and the half hours up to the next hour', () => {
    const minutes = section('1900', 'minutes').table?.rows ?? [];
    expect(minutes).toHaveLength(12);
    expect(minutes[0]).toEqual(['19:00', '7:00 p. m.', 'las 7 en punto', 'las 7 en punto']);
    expect(rowOf('1900', 'minutes', '19:15')).toEqual([
      '19:15',
      '7:15 p. m.',
      'las 7 y cuarto',
      'las 7 y cuarto',
    ]);
    expect(rowOf('1900', 'minutes', '19:45')).toEqual([
      '19:45',
      '7:45 p. m.',
      'las 8 menos cuarto',
      'un cuarto para las 8',
    ]);
    expect(rowOf('1200', 'minutes', '12:50')?.slice(2)).toEqual([
      'la 1 menos diez',
      'diez para la 1',
    ]);
    const half = section('1830', 'minutes').table?.rows ?? [];
    expect(half.map(([first]) => first)).toEqual([
      '18:30',
      '18:33',
      '18:38',
      '18:42',
      '18:47',
      '18:52',
      '18:58',
    ]);
    expect(rowOf('1830', 'minutes', '18:42')?.slice(2)).toEqual([
      'las 7 menos dieciocho',
      'dieciocho para las 7',
    ]);
  });

  it('lists the hours before and after, across midnight', () => {
    expect(rowOf('1900', 'around', '3 horas después')).toEqual([
      '3 horas después',
      '22:00',
      '10:00 p. m.',
      'las 10 de la noche',
    ]);
    expect(rowOf('2300', 'around', '2 horas después')).toEqual([
      '2 horas después',
      '01:00, del día siguiente',
      '1:00 a. m.',
      'la 1 de la madrugada',
    ]);
    expect(rowOf('0030', 'around', '1 hora antes')?.[1]).toBe('23:30, del día anterior');
    expect(textOf('1900', 'around')).toContain('faltan 5 h 0 min');
    expect(textOf('1830', 'around')).toContain('han pasado 18 h 30 min');
  });

  it('works the change from the 12-hour clock for the hour it is', () => {
    expect(textOf('1900', 'from-twelve')).toContain('7 + 12 = 19');
    expect(textOf('1900', 'from-twelve')).toContain('19 − 12 = 7');
    expect(textOf('1200', 'from-twelve')).toContain('el 12 se queda igual');
    expect(textOf('0000', 'from-twelve')).toContain('el 12 se vuelve 00');
    expect(section('1830', 'from-twelve').heading).toBe(
      'Cómo pasar de 6:30 p. m. a las 18:30 horas',
    );
  });

  it('links its six nearest times, the chart and the converter', () => {
    const nineteen = page('1900');
    expect(nineteen.others.links.map(({ href }) => href)).toEqual([
      '/es/hora/las-17-30-horas',
      '/es/hora/las-18-horas',
      '/es/hora/las-18-30-horas',
      '/es/hora/las-19-30-horas',
      '/es/hora/las-20-horas',
      '/es/hora/las-20-30-horas',
      MILITARY_CHART_PATHS.es,
    ]);
    expect(nineteen.others.links[1]?.label).toBe('Las 18 horas son las 6:00 p. m.');
    expect(nineteen.calculator.href).toBe(MILITARY_CONVERTER_PATHS.es);
  });

  it('gives the chart and the converter one list of every page', () => {
    const list = spanishTimesSectionOf();
    expect(list.links?.map(({ href }) => href)).toHaveLength(26);
    expect(list.links?.[0]).toEqual({
      href: '/es/hora/las-00-horas',
      label: '00:00 · 12:00 a. m.',
    });
  });

  it('puts that list on the Spanish chart and converter, before their last section', () => {
    for (const { sections } of [chartOf('es'), converterOf('es')]) {
      const ids = withSpanishTimes(sections).map(({ id }) => id);
      expect(ids).toEqual([
        ...sections.slice(0, -1).map(({ id }) => id),
        'spanish-times',
        'related',
      ]);
    }
  });

  // the content audit flags two pages whose six-word shingles overlap by half or more
  it('are no near-duplicates of one another', () => {
    const sets = SPANISH_TIMES.map((job) => shingles(prose(job)));
    let most = 0;
    for (const [i, a] of sets.entries())
      for (const [j, b] of sets.entries()) {
        if (j <= i) continue;
        const both = [...a].filter((each) => b.has(each)).length;
        const similarity = both / new Set([...a, ...b]).size;
        most = Math.max(most, similarity);
        expect(similarity, `${String(i)} and ${String(j)}`).toBeLessThan(0.35);
      }
    console.log(`Spanish time pages: most similar pair ${most.toFixed(3)}`);
  });
});
