import { describe, expect, it } from 'vitest';
import { HOURS_PATHS, HOURS_TEXTS } from '../hours/texts.ts';
import { popularOf } from '../hours/popular.ts';
import { DESCRIPTION, TITLE_MAX } from '../seo/meta.ts';
import { longTailPageOf, type LongTailPage } from './jobs.ts';
import {
  DAYS,
  HOURS_AGO,
  pathOf,
  SHIFTS,
  type Days,
  type Shift,
  type TimeOffset,
} from './routes.ts';
import type { LongTailSection } from './sections.ts';

/*
 * The Spanish searches of Search Console (7-13 Nov 2026): the "cuántos días son N horas", the
 * "cuántas horas son de X a Y" and the "hace N horas" pages show at position 9 with almost no
 * clicks. Each answers in its title, gives a reason to click in its description, and carries a
 * table and an FAQ no sibling has.
 */

const daysOf = (hours: number): Days => {
  const job = DAYS.find((each) => each.hours === hours);
  if (job === undefined) throw new Error(`no days job of ${String(hours)}`);
  return job;
};

const shiftOf = (start: number, end: number): Shift => {
  const job = SHIFTS.find((each) => each.start === start * 60 && each.end === end * 60);
  if (job === undefined) throw new Error(`no shift ${String(start)}-${String(end)}`);
  return job;
};

const agoOf = (hours: number): TimeOffset => {
  const job = HOURS_AGO.find((each) => each.amount === hours);
  if (job === undefined) throw new Error(`no hours ago job of ${String(hours)}`);
  return job;
};

const es = (job: Days | Shift | TimeOffset): LongTailPage => longTailPageOf(job, 'es');

const sectionOf = (page: LongTailPage, id: string): LongTailSection => {
  const section = page.sections?.find((each) => each.id === id);
  if (section === undefined) throw new Error(`no section ${id}`);
  return section;
};

const faqOf = (page: LongTailPage): readonly { question: string; answer: string }[] =>
  sectionOf(page, 'faq').questions ?? [];

describe('the Spanish hours in days pages', () => {
  it('answer in the title with the exact figure', () => {
    expect(es(daysOf(48)).title).toBe('48 horas son 2 días exactos | Cuenta Horas');
    expect(es(daysOf(24)).title).toBe('24 horas son 1 día exacto | Cuenta Horas');
    expect(es(daysOf(72)).title).toBe('72 horas son 3 días exactos | Cuenta Horas');
    expect(es(daysOf(168)).title).toBe('168 horas son 7 días exactos (1 semana) | Cuenta Horas');
    // 100 = 4 × 24 + 4; 100 / 24 = 4.1666...
    expect(es(daysOf(100)).title).toBe('100 horas son 4 días y 4 horas (4.17 días) | Cuenta Horas');
    expect(es(daysOf(36)).title).toBe('36 horas son 1 día y 12 horas (1.5 días) | Cuenta Horas');
    // 200 = 8 × 24 + 8; 2,000 = 83 × 24 + 8
    expect(es(daysOf(200)).title).toBe('200 horas son 8 días y 8 horas (8.33 días) | Cuenta Horas');
    expect(es(daysOf(2000)).title).toBe(
      '2,000 horas son 83 días y 8 horas (83.33 días) | Cuenta Horas',
    );
  });

  it('give a reason to click in the description: minutes, seconds, workdays and the table', () => {
    expect(es(daysOf(48)).description).toBe(
      '48 horas son 2 días exactos: 2,880 minutos o 172,800 segundos. Como trabajo, son 6 jornadas de 8 horas. Con tabla de 24 a 72 horas y la calculadora de horas.',
    );
    expect(es(daysOf(100)).description).toMatch(
      /^100 horas son 4 días y 4 horas: 6,000 minutos o 360,000 segundos\. Como trabajo, son 12\.5 jornadas de 8 horas\./,
    );
  });

  it('keep the answer in the first sentence of the lead', () => {
    expect(es(daysOf(48)).lead).toMatch(/^48 horas son exactamente 2 días: /);
  });

  it('give a table of their own neighbours, from half to one and a half times the hours', () => {
    const nearby = sectionOf(es(daysOf(48)), 'nearby');
    expect(nearby.heading).toBe('De 24 a 72 horas en días');
    expect(nearby.table?.head).toEqual(['Horas', 'Días', 'Días y horas', 'Jornadas de 8 h']);
    expect(nearby.table?.rows).toEqual([
      ['24', '1', '1 día', '3'],
      ['36', '1.5', '1 día y 12 horas', '4.5'],
      ['48', '2', '2 días', '6'],
      ['60', '2.5', '2 días y 12 horas', '7.5'],
      ['72', '3', '3 días', '9'],
    ]);
    // 2,000 / 2 = 1,000 and 2,000 × 1.5 = 3,000
    expect(sectionOf(es(daysOf(2000)), 'nearby').table?.rows.map(([hours]) => hours)).toEqual([
      '1,000',
      '1,500',
      '2,000',
      '2,500',
      '3,000',
    ]);
  });

  it('give the working days at 8 hours a day, five and six days a week', () => {
    // 48 h = 6 workdays: Monday to the next Monday (8 days), or Monday to Saturday (6)
    expect(sectionOf(es(daysOf(48)), 'workdays').table?.rows).toEqual([
      ['5, de lunes a viernes', '40', '1.2', '8'],
      ['6, de lunes a sábado', '48', '1', '6'],
    ]);
    // 200 h = 25 workdays: 4 weeks of 5 and a Friday (33 days), or 4 weeks of 6 and a Monday (29)
    expect(sectionOf(es(daysOf(200)), 'workdays').table?.rows).toEqual([
      ['5, de lunes a viernes', '40', '5', '33'],
      ['6, de lunes a sábado', '48', '4.17', '29'],
    ]);
  });

  it('answer the questions people ask in Spanish', () => {
    expect(sectionOf(es(daysOf(48)), 'faq').heading).toBe('Preguntas frecuentes');
    expect(faqOf(es(daysOf(48)))).toEqual([
      {
        question: '¿48 horas son 2 días?',
        answer: 'Sí, exactamente: 2 × 24 = 48 horas, sin horas de sobra.',
      },
      {
        question: '¿Cuántas semanas son 48 horas?',
        answer:
          '0.29 semanas: 48 ÷ 168, las horas de una semana de 7 días. Es menos de una semana.',
      },
      {
        question: '¿Cuántos minutos y segundos son 48 horas?',
        answer: '2,880 minutos (48 × 60) y 172,800 segundos (2,880 × 60).',
      },
      {
        question: '¿Cuántos días de trabajo son 48 horas?',
        answer: '6 jornadas de 8 horas (48 ÷ 8), o 4 turnos de 12 horas.',
      },
      {
        question: 'Si empiezo un lunes a las 9:00 a. m., ¿cuándo se cumplen 48 horas?',
        answer: 'El miércoles a las 9:00 a. m., 2 días después, contando de día y de noche.',
      },
    ]);
    expect(faqOf(es(daysOf(100)))[0]).toEqual({
      question: '¿100 horas son 4 días?',
      answer:
        'No del todo: 4 días son 96 horas, así que 100 horas son 4 días y 4 horas, o 4.17 días.',
    });
    // 2,000 = 11 × 168 + 6 × 24 + 8; 2,000 / 730 = 2.7397; 2,000 / 720 = 2.7778
    const thousands = faqOf(es(daysOf(2000)));
    expect(thousands[1]?.answer).toBe(
      '11.9 semanas: 2,000 ÷ 168, las horas de una semana de 7 días. Son 11 semanas, 6 días y 8 horas.',
    );
    expect(thousands.at(-1)).toEqual({
      question: '¿Cuántos meses son 2,000 horas?',
      answer:
        '2.74 meses de 730 horas, lo que dura en promedio un mes (8,760 horas de un año de 365 días ÷ 12), o 2.78 meses de 30 días.',
    });
  });

  it('keep the English pages as they were', () => {
    expect(longTailPageOf(daysOf(48), 'en').sections?.map(({ id }) => id)).not.toContain('faq');
    expect(longTailPageOf(daysOf(48), 'en').title).toBe('48 hours is 2 days | Cuenta Horas');
  });
});

describe('the Spanish shift pages', () => {
  it('answer in the title, with the hours after a 30-minute break', () => {
    // 8 to 5 is 9 h, 8 h 30 min after the break: past 70 with the site name, so without it
    expect(es(shiftOf(8, 17)).title).toBe(
      'De 8 a 5 son 9 horas (8 h 30 min con 30 min de descanso)',
    );
    expect(es(shiftOf(9, 17)).title).toBe(
      'De 9 a 5 son 8 horas (7 h 30 min con 30 min de descanso)',
    );
    expect(es(shiftOf(22, 6)).title).toBe(
      'De 10 pm a 6 am son 8 horas (7 h 30 min con 30 min de descanso)',
    );
  });

  it('give the breaks, the week and the tools in the description', () => {
    expect(es(shiftOf(8, 17)).description).toBe(
      'De 8 a 5 son 9 horas. Con 30 minutos de descanso son 8 h 30 min, y con 1 hora, 8 h; en 5 días, 45 h. Tabla hora por hora y calculadora con tu pago.',
    );
  });

  it('answer the questions people ask in Spanish', () => {
    expect(faqOf(es(shiftOf(8, 17)))).toEqual([
      {
        question: '¿Cuántas horas son de 8 a 5 con 1 hora de comida?',
        answer:
          '8 horas, o 8.00 horas decimales: las 9 horas del turno menos 60 minutos de descanso sin pago.',
      },
      {
        question: '¿Cuántas horas a la semana son de 8 a 5?',
        answer:
          '45 h de lunes a viernes y 54 h de lunes a sábado, sin descanso. Con 30 minutos de descanso al día, 42 h 30 min y 51 h.',
      },
      {
        question: 'Si entro a las 8 am, ¿a qué hora salgo para trabajar 8 horas?',
        answer: 'A las 4 pm sin descanso, o a las 4:30 pm con 30 minutos de descanso sin pago.',
      },
    ]);
    // 1 pm on the 12-hour clock takes the singular article
    expect(faqOf(es(shiftOf(5, 13)))[2]?.answer).toBe(
      'A la 1 pm sin descanso, o a la 1:30 pm con 30 minutos de descanso sin pago.',
    );
  });
});

describe('the Spanish hours ago pages', () => {
  it('answer in the title with a worked time, never a time of the build', () => {
    expect(es(agoOf(5)).title).toBe(
      'Hace 5 horas eran las 10:00 si ahora son las 15:00 | Cuenta Horas',
    );
    expect(es(agoOf(1)).title).toBe(
      'Hace 1 hora eran las 14:00 si ahora son las 15:00 | Cuenta Horas',
    );
    expect(es(agoOf(14)).title).toBe(
      'Hace 14 horas era la 1:00 si ahora son las 15:00 | Cuenta Horas',
    );
    expect(es(agoOf(20)).title).toBe('Hace 20 horas eran las 19:00 de ayer si ahora son las 15:00');
    expect(es(agoOf(36)).title).toBe('Hace 36 horas eran las 3:00 de ayer si ahora son las 15:00');
    expect(es(agoOf(24)).title).toBe('Hace 24 horas: la misma hora de ayer | Cuenta Horas');
    expect(es(agoOf(48)).title).toBe('Hace 48 horas: la misma hora de anteayer | Cuenta Horas');
    expect(es(agoOf(72)).title).toBe('Hace 72 horas: la misma hora de hace 3 días | Cuenta Horas');
  });

  it('give the rule and the tables in the description', () => {
    expect(es(agoOf(5)).description).toBe(
      'Qué hora era hace 5 horas, calculada con tu reloj: tu hora menos 5 h. Antes de las 5:00, la fecha es la de ayer; con tabla de las 24 horas.',
    );
    expect(es(agoOf(1)).description).toContain('Antes de la 1:00, la fecha es la de ayer');
    expect(es(agoOf(24)).description).toBe(
      'Qué hora era hace 24 horas, calculada con tu reloj: la misma hora, 1 día atrás. Con tabla de cada día de la semana y de cada mes.',
    );
    expect(es(agoOf(36)).description).toBe(
      'Qué hora era hace 36 horas, calculada con tu reloj: tu hora menos 12 h, 1 día atrás. Antes de las 12:00, son 2 días atrás; con tabla de las 24 horas.',
    );
  });

  it('answer the questions people ask in Spanish', () => {
    expect(faqOf(es(agoOf(5)))).toEqual([
      {
        question: '¿Qué hora era hace 5 horas si son las 8:00?',
        answer: 'Eran las 3:00 del mismo día.',
      },
      {
        question: '¿Qué hora era hace 5 horas si son las 22:00?',
        answer: 'Eran las 17:00 del mismo día.',
      },
      {
        question: '¿Hace 5 horas fue ayer?',
        answer:
          'Solo si ahora es antes de las 5:00: entonces la cuenta cruza la medianoche y cae en el día anterior. Desde las 5:00, es hoy.',
      },
      {
        question: '¿Cuántos minutos son 5 horas?',
        answer: '300 minutos (5 × 60), o 18,000 segundos.',
      },
    ]);
    // 8:00 less 20 h crosses midnight: 12:00 the day before
    expect(faqOf(es(agoOf(20)))[0]?.answer).toBe(
      'Eran las 12:00 de ayer: la cuenta cruza la medianoche.',
    );
    expect(faqOf(es(agoOf(24)))[2]?.answer).toBe(
      'Sí: hace 24 horas es ayer, a la misma hora del reloj.',
    );
    expect(faqOf(es(agoOf(48)))[2]?.answer).toBe(
      'No: hace 48 horas es anteayer, a la misma hora del reloj.',
    );
    expect(faqOf(es(agoOf(36)))[2]?.answer).toBe(
      'Desde las 12:00, hace 36 horas es ayer; antes de las 12:00, es anteayer.',
    );
    expect(faqOf(es(agoOf(1)))[3]?.question).toBe('¿Cuántos minutos es 1 hora?');
  });

  it('keep the English pages and the hours from now as they were', () => {
    const later = HOURS_AGO.map((job) => longTailPageOf(job, 'en'));
    for (const page of later) expect(page.sections?.map(({ id }) => id)).not.toContain('faq');
  });
});

describe('every Spanish page of the three families', () => {
  const pages = [...DAYS, ...SHIFTS, ...HOURS_AGO].map((job) => ({
    path: pathOf(job, 'es'),
    ...es(job),
  }));

  it.each(pages)('$path fits a search result and has an FAQ of three questions or more', (page) => {
    expect(page.title.length).toBeLessThanOrEqual(TITLE_MAX);
    expect(page.description.length).toBeGreaterThanOrEqual(DESCRIPTION.min);
    expect(page.description.length).toBeLessThanOrEqual(DESCRIPTION.max);
    expect(faqOf(page).length).toBeGreaterThanOrEqual(3);
    const text = JSON.stringify(page);
    expect(text).not.toMatch(/undefined|NaN/);
  });

  it('give each page its own title', () => {
    const titles = pages.map(({ title }) => title);
    expect(new Set(titles).size).toBe(titles.length);
  });
});

describe('the Spanish hours calculator', () => {
  it('answers the search in its title and description', () => {
    expect(HOURS_TEXTS.es.title).toBe(
      'Calculadora de Horas y Minutos Gratis: Suma y Resta | Cuenta Horas',
    );
    expect(HOURS_TEXTS.es.description.length).toBeLessThanOrEqual(DESCRIPTION.max);
    expect(HOURS_TEXTS.es.description).toMatch(/48, 72 o 200 horas/);
  });

  it('links the most searched pages under the tool, each labelled with its answer', () => {
    const popular = popularOf('es');
    expect(popular?.heading).toBe('Lo más buscado');
    expect(popular?.links.map(({ href }) => href)).toEqual([
      pathOf(daysOf(48), 'es'),
      pathOf(daysOf(72), 'es'),
      pathOf(daysOf(96), 'es'),
      pathOf(daysOf(100), 'es'),
      pathOf(daysOf(200), 'es'),
      pathOf(daysOf(2000), 'es'),
      pathOf(shiftOf(8, 17), 'es'),
      pathOf(shiftOf(9, 17), 'es'),
      pathOf(agoOf(1), 'es'),
      pathOf(agoOf(5), 'es'),
      pathOf(agoOf(24), 'es'),
    ]);
    expect(popular?.links[0]?.label).toBe('48 horas son 2 días exactos');
    expect(popular?.links[6]?.label).toBe(
      'De 8 a 5 son 9 horas (8 h 30 min con 30 min de descanso)',
    );
    expect(popularOf('en')).toBeUndefined();
  });

  it('is the page every Spanish page of the three families links back to', () => {
    for (const job of [...DAYS, ...SHIFTS, ...HOURS_AGO]) {
      expect(es(job).calculator.href.replace(/\?.*$/, '')).toBe(HOURS_PATHS.es);
    }
  });
});
