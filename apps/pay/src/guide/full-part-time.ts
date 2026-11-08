import { Rational } from '@maestro-calc/core';
import { hoursBetween } from '@maestro-calc/pay-core/hours';
import { hoursMinutesText, hoursText } from '../format.ts';
import { HOURS_PATHS } from '../hours/texts.ts';
import type { CommonLinks } from '../long-tail/jobs.ts';
import { pathOf, SHIFTS } from '../long-tail/routes.ts';
import { SOURCES } from '../long-tail/sections.ts';
import { shiftLinksOf } from '../long-tail/shifts.ts';
import { titleOf } from '../seo/meta.ts';
import type { Lang } from '../time-card/receipt.ts';
import { FULL_TIME_GUIDE_PATHS, PART_TIME_GUIDE_PATHS } from './paths.ts';
import type { GuideSource, GuideTexts } from './texts.ts';

export { FULL_TIME_GUIDE_PATHS, PART_TIME_GUIDE_PATHS } from './paths.ts';

/** The figures of one worked week, each written as the hours calculator writes it. */
export interface WeekFigures {
  /** The hours of one day, start to end less the unpaid break, in hours and minutes. */
  readonly day: string;
  /** The hours of the week, the day times the days worked. */
  readonly week: string;
}

interface WorkWeek {
  readonly id: 'day-shift' | 'long-days' | 'short-days' | 'three-days';
  /** The raw fields of the hours calculator, as a shared link would carry them. */
  readonly inputs: Readonly<Record<string, string>>;
  readonly days: number;
}

const WEEKS: readonly WorkWeek[] = [
  { id: 'day-shift', inputs: { start: '9:00', end: '17:00', unpaidBreak: '30' }, days: 5 },
  { id: 'long-days', inputs: { start: '8:00', end: '17:00', unpaidBreak: '60' }, days: 5 },
  { id: 'short-days', inputs: { start: '9:00', end: '15:00', unpaidBreak: '0' }, days: 5 },
  { id: 'three-days', inputs: { start: '9:00', end: '17:00', unpaidBreak: '30' }, days: 3 },
];

const dayHoursOf = (inputs: Readonly<Record<string, string>>): Rational => {
  const ran = hoursBetween.run(inputs);
  if (!ran.ok) throw new Error(`the shift ${JSON.stringify(inputs)} must run`);
  const hours = ran.value.outputs.find(({ key }) => key === 'hours')?.value;
  if (hours === undefined) throw new Error('no hours output');
  return hours;
};

/** The weeks the guides work out, every figure from the hours calculator at build. */
export const WORK_WEEK_EXAMPLES: readonly (WorkWeek & { readonly figures: WeekFigures })[] =
  WEEKS.map((week) => {
    const day = dayHoursOf(week.inputs);
    return {
      ...week,
      figures: {
        day: hoursMinutesText(day),
        week: hoursText(day.mul(Rational.of(week.days))),
      },
    };
  });

const weekOf = (id: WorkWeek['id']): WeekFigures => {
  const found = WORK_WEEK_EXAMPLES.find((each) => each.id === id);
  if (found === undefined) throw new Error(`no worked week ${id}`);
  return found.figures;
};

const dayShift = weekOf('day-shift');
const longDays = weekOf('long-days');
const shortDays = weekOf('short-days');
const threeDays = weekOf('three-days');

/** The shift pages a guide lists, each `start-end` on a 24-hour clock, in the given order. */
const shiftPagesOf = (lang: Lang, heading: string, names: readonly string[]): CommonLinks => {
  const clock = (minutes: number): string =>
    `${String(Math.floor(minutes / 60))}:${String(minutes % 60).padStart(2, '0')}`;
  const all = shiftLinksOf(lang).links;
  return {
    heading,
    links: names.map((name) => {
      const shift = SHIFTS.find((each) => `${clock(each.start)}-${clock(each.end)}` === name);
      const link = all.find(({ href }) => shift !== undefined && href === pathOf(shift, lang));
      if (link === undefined) throw new Error(`no shift page ${name}`);
      return link;
    }),
  };
};

const FULL_SHIFTS = ['7:00-15:00', '8:00-16:00', '8:00-16:30', '8:00-17:00', '9:00-17:00'];
const PART_SHIFTS = ['9:00-15:00', '10:00-16:00', '9:00-16:00'];

/** The shift pages of full-time days, in each language. */
export const FULL_TIME_GUIDE_LINKS: Readonly<Record<Lang, CommonLinks>> = {
  en: shiftPagesOf('en', 'Hours of common full-time shifts', FULL_SHIFTS),
  es: shiftPagesOf('es', 'Horas de turnos comunes de tiempo completo', FULL_SHIFTS),
};

/** The shift pages of shorter days, in each language. */
export const PART_TIME_GUIDE_LINKS: Readonly<Record<Lang, CommonLinks>> = {
  en: shiftPagesOf('en', 'Hours of shorter shifts', PART_SHIFTS),
  es: shiftPagesOf('es', 'Horas de turnos más cortos', PART_SHIFTS),
};

const IRS_FULL_TIME: GuideSource = SOURCES.irsFullTime;
const IRS_ALE: GuideSource = {
  label: 'IRS, Determining if an employer is an applicable large employer',
  href: 'https://www.irs.gov/affordable-care-act/employers/determining-if-an-employer-is-an-applicable-large-employer',
};
const BLS_CPS: GuideSource = SOURCES.blsCps;
const DOL_FULL_TIME: GuideSource = {
  label: 'U.S. Department of Labor, Full-Time Employment',
  href: 'https://www.dol.gov/general/topic/workhours/full-time',
};
const FACT_SHEET_23: GuideSource = {
  label: 'U.S. Department of Labor, Fact Sheet #23: Overtime Pay Requirements of the FLSA',
  href: 'https://www.dol.gov/agencies/whd/fact-sheets/23-flsa-overtime-pay',
};
const ECFR_610: GuideSource = {
  label: '5 CFR 610.102, Definitions (eCFR)',
  href: 'https://www.ecfr.gov/current/title-5/section-610.102',
};
const ECFR_340: GuideSource = {
  label: '5 CFR 340.202, Part-time career employment (eCFR)',
  href: 'https://www.ecfr.gov/current/title-5/section-340.202',
};

/** The day every source of both guides was read. */
const CHECKED = '2026-11-08';

const FULL_ANSWER = {
  en: 'Full time is 30 to 40 hours a week',
  es: 'Tiempo completo es de 30 a 40 horas a la semana',
} as const;

const PART_ANSWER = {
  en: 'Part time is under 30 or 35 hours a week',
  es: 'Medio tiempo es menos de 30 o 35 horas a la semana',
} as const;

export const FULL_TIME_GUIDE: Readonly<Record<Lang, GuideTexts>> = {
  en: {
    title: titleOf(`${FULL_ANSWER.en}: what counts`),
    description: `${FULL_ANSWER.en}: 30 for employer health coverage (IRS), 35 in BLS job statistics, 40 for federal employees. Federal wage law sets none.`,
    kicker: 'Hours · guide',
    h1: 'How many hours is full time?',
    lead: 'Full time is 30 to 40 hours a week, depending on who is counting: the IRS counts 30 hours a week (130 a month) for employer health coverage, the Bureau of Labor Statistics counts 35 for its job statistics, and federal agencies schedule full-time employees for 40. The federal wage law, the FLSA, sets no number, so for pay, benefits and schedules your employer decides. Here is each line, where it comes from and what it changes.',
    sections: [
      {
        id: 'irs-30-hours',
        heading: '30 hours a week: the IRS line for health coverage',
        paragraphs: [
          'For the employer shared responsibility provisions of the Affordable Care Act, a full-time employee is one employed on average at least 30 hours of service per week, or 130 hours of service per month (IRS).',
          'An hour of service is each hour you are paid, or entitled to pay, for work, and also each hour paid when you do no work because of vacation, a holiday, illness, disability, layoff, jury duty, military duty or a leave of absence.',
          'The line matters to employers with at least 50 full-time employees, including full-time equivalent employees, on average during the prior year: they are applicable large employers, subject to those provisions on offering health coverage. An employer may count your hours month by month, at least 130 in each month, or look back over a measurement period.',
        ],
        sources: [IRS_FULL_TIME, IRS_ALE],
      },
      {
        id: 'bls-35-hours',
        heading: '35 hours a week: the line of the job statistics',
        paragraphs: [
          'In the Current Population Survey, the Bureau of Labor Statistics (BLS) counts as full time those who usually work 35 or more hours per week.',
          'It goes by your usual schedule, not one week: a full-time worker may work fewer than 35 hours in a given week. If you hold more than one job, the usual hours at all your jobs combined decide whether you count as full time.',
        ],
        sources: [BLS_CPS],
      },
      {
        id: 'federal-40-hours',
        heading: '40 hours a week: federal employees, and where overtime starts',
        paragraphs: [
          'For full-time federal employees, the basic workweek is the 40-hour workweek their agency sets (5 CFR 610.102).',
          '40 is also where federal overtime starts: covered nonexempt employees must be paid at least time and a half for the hours over 40 in a workweek (DOL Fact Sheet #23). That is an overtime rule, not a definition of full time, and it applies whether you are full time or part time.',
        ],
        sources: [ECFR_610, FACT_SHEET_23],
      },
      {
        id: 'flsa-no-number',
        heading: 'Federal wage law sets no number',
        paragraphs: [
          'In the words of the U.S. Department of Labor, the Fair Labor Standards Act (FLSA) does not define full-time employment or part-time employment. It is a matter generally to be determined by the employer.',
          'Whether you are considered full time or part time does not change how the FLSA applies to you. So the hours that make you full time for benefits, paid time off or a schedule are the ones your employer’s policy or your contract sets: check them there.',
        ],
        sources: [DOL_FULL_TIME],
      },
      {
        id: 'count-your-week',
        heading: 'Count your week',
        paragraphs: [
          `9 am to 5 pm with a 30-minute unpaid lunch is ${dayShift.day} a day, ${dayShift.week} h a week over five days: full time for the BLS (35 or more) and for the IRS (30 or more), and under the 40 where overtime starts.`,
          `8 am to 5 pm with a 60-minute unpaid lunch is ${longDays.day} a day, ${longDays.week} h a week: full time on every line.`,
          `9 am to 3 pm with no break is ${shortDays.day} a day, ${shortDays.week} h a week: full time for the IRS, but part time in the BLS statistics, which start at 35.`,
          'These figures come from the hours calculator; enter your own start, end and break there, and add a whole week on the time card.',
        ],
        sources: [BLS_CPS, IRS_FULL_TIME],
      },
    ],
    sourcesLabel: 'Sources',
    disclaimer:
      'A guide to what these agencies and rules publish, not legal advice. Your employer’s policy decides full time for its benefits; for your own case, check your state’s labor department.',
    checked: CHECKED,
    ctas: [
      { label: 'Open the hours calculator', href: HOURS_PATHS.en },
      { label: 'Add up a whole week on the time card', href: '/time-card-calculator' },
      { label: 'How many hours is part time?', href: PART_TIME_GUIDE_PATHS.en },
    ],
    linkLabel: 'How many hours is full time?',
  },
  es: {
    title: titleOf(FULL_ANSWER.es),
    description: `${FULL_ANSWER.es}: 30 para la cobertura médica (IRS), 35 en las estadísticas de la BLS y 40 para empleados federales.`,
    kicker: 'Horas · guía',
    h1: '¿Cuántas horas son tiempo completo?',
    lead: 'El tiempo completo es de 30 a 40 horas a la semana, según quién cuente: el IRS cuenta 30 horas a la semana (130 al mes) para la cobertura médica del empleador, la Oficina de Estadísticas Laborales (BLS) cuenta 35 en sus estadísticas de empleo y las agencias federales programan 40 para sus empleados de tiempo completo. La ley federal de salarios, la FLSA, no fija ningún número, así que para el pago, los beneficios y el horario decide tu empleador. Aquí tienes cada línea, de dónde sale y qué cambia.',
    sections: [
      {
        id: 'irs-30-horas',
        heading: '30 horas a la semana: la línea del IRS para la cobertura médica',
        paragraphs: [
          'Para las disposiciones de responsabilidad compartida del empleador de la Ley de Cuidado de Salud a Bajo Precio (ACA), un empleado de tiempo completo es el que trabaja en promedio al menos 30 horas de servicio por semana, o 130 horas de servicio por mes (IRS).',
          'Una hora de servicio es cada hora que te pagan, o que te deben pagar, por trabajar, y también cada hora pagada en la que no trabajas por vacaciones, un día feriado, enfermedad, incapacidad, suspensión, servicio de jurado, servicio militar o una licencia.',
          'La línea importa a los empleadores con al menos 50 empleados de tiempo completo, incluidos los equivalentes a tiempo completo, en promedio durante el año anterior: son empleadores grandes aplicables, sujetos a esas disposiciones sobre ofrecer cobertura médica. Un empleador puede contar tus horas mes a mes, al menos 130 en cada mes, o mirar hacia atrás un período de medición.',
        ],
        sources: [IRS_FULL_TIME, IRS_ALE],
      },
      {
        id: 'bls-35-horas',
        heading: '35 horas a la semana: la línea de las estadísticas de empleo',
        paragraphs: [
          'En la Encuesta de Población Actual (CPS), la Oficina de Estadísticas Laborales (BLS) cuenta como de tiempo completo a quienes trabajan por lo general 35 horas o más por semana.',
          'Se guía por tu horario habitual, no por una semana: alguien de tiempo completo puede trabajar menos de 35 horas en una semana dada. Si tienes más de un trabajo, las horas habituales de todos tus trabajos juntos deciden si cuentas como de tiempo completo.',
        ],
        sources: [BLS_CPS],
      },
      {
        id: 'federal-40-horas',
        heading: '40 horas a la semana: los empleados federales, y donde empiezan las horas extra',
        paragraphs: [
          'Para los empleados federales de tiempo completo, la semana laboral básica es la de 40 horas que fija su agencia (5 CFR 610.102).',
          '40 es también donde empiezan las horas extra federales: a los empleados cubiertos y no exentos se les debe pagar al menos tiempo y medio por las horas sobre 40 en una semana laboral (Fact Sheet #23 del Departamento de Trabajo). Es una regla de horas extra, no una definición de tiempo completo, y vale tanto si trabajas tiempo completo como medio tiempo.',
        ],
        sources: [ECFR_610, FACT_SHEET_23],
      },
      {
        id: 'flsa-sin-numero',
        heading: 'La ley federal de salarios no fija un número',
        paragraphs: [
          'En palabras del Departamento de Trabajo de EE. UU., la Ley de Normas Justas de Trabajo (FLSA) no define el empleo de tiempo completo ni el de medio tiempo. Es algo que por lo general decide el empleador.',
          'Que te consideren de tiempo completo o de medio tiempo no cambia cómo se te aplica la FLSA. Así que las horas que te hacen de tiempo completo para los beneficios, las vacaciones pagadas o un horario son las que fija la política de tu empleador o tu contrato: revísalas ahí.',
        ],
        sources: [DOL_FULL_TIME],
      },
      {
        id: 'cuenta-tu-semana',
        heading: 'Cuenta tu semana',
        paragraphs: [
          `De 9 am a 5 pm con 30 minutos de almuerzo sin pago son ${dayShift.day} al día, ${dayShift.week} h a la semana en cinco días: tiempo completo para la BLS (35 o más) y para el IRS (30 o más), y menos de las 40 donde empiezan las horas extra.`,
          `De 8 am a 5 pm con 60 minutos de almuerzo sin pago son ${longDays.day} al día, ${longDays.week} h a la semana: tiempo completo en todas las líneas.`,
          `De 9 am a 3 pm sin descanso son ${shortDays.day} al día, ${shortDays.week} h a la semana: tiempo completo para el IRS, pero medio tiempo en las estadísticas de la BLS, que empiezan en 35.`,
          'Estas cifras salen de la calculadora de horas; ingresa ahí tu entrada, tu salida y tu descanso, y suma una semana entera en la tarjeta de horas.',
        ],
        sources: [BLS_CPS, IRS_FULL_TIME],
      },
    ],
    sourcesLabel: 'Fuentes',
    disclaimer:
      'Una guía de lo que publican estas agencias y reglas, no asesoría legal. La política de tu empleador decide el tiempo completo para sus beneficios; para tu caso, consulta al departamento de trabajo de tu estado.',
    checked: CHECKED,
    ctas: [
      { label: 'Abrir la calculadora de horas', href: HOURS_PATHS.es },
      {
        label: 'Suma una semana entera en la tarjeta de horas',
        href: '/es/calculadora-de-horas-trabajadas',
      },
      { label: '¿Cuántas horas son medio tiempo?', href: PART_TIME_GUIDE_PATHS.es },
    ],
    linkLabel: '¿Cuántas horas son tiempo completo?',
  },
};

export const PART_TIME_GUIDE: Readonly<Record<Lang, GuideTexts>> = {
  en: {
    title: titleOf(`${PART_ANSWER.en}: what counts`),
    description: `${PART_ANSWER.en}: under 35 in BLS job statistics, under 30 (130 a month) for employer health coverage (IRS). The FLSA sets no number.`,
    kicker: 'Hours · guide',
    h1: 'How many hours is part time?',
    lead: 'Part time is fewer than 35 hours a week in the government’s job statistics, and under 30 hours a week (130 a month) for employer health coverage under the Affordable Care Act. No federal wage law sets a number: the FLSA leaves it to your employer, and part time or not, you keep the right to the minimum wage and to overtime after 40 hours. Here is each line, where it comes from and what it changes.',
    sections: [
      {
        id: 'bls-under-35',
        heading: 'Fewer than 35 hours: the line of the job statistics',
        paragraphs: [
          'In the Current Population Survey, the Bureau of Labor Statistics (BLS) counts as part time those who usually work fewer than 35 hours per week. In the week the survey asks about, part-time work is 1 to 34 hours.',
          'It goes by your usual schedule: a part-time worker may work more than 34 hours in a given week. If you hold more than one job, your usual hours at all of them combined decide it, so two part-time jobs can add up to full time in the statistics.',
        ],
        sources: [BLS_CPS],
      },
      {
        id: 'irs-under-30',
        heading: 'Under 30 hours a week: not full time for health coverage',
        paragraphs: [
          'For the Affordable Care Act’s employer shared responsibility provisions, a full-time employee works on average at least 30 hours of service per week, or 130 hours of service per month (IRS). Below that, you are not a full-time employee for those provisions.',
          'Your hours still count toward the size of your employer. To find whether it has at least 50 full-time employees, including full-time equivalent employees, it adds the hours of service of everyone who is not full time, at most 120 per person in a month, and divides the total by 120.',
        ],
        sources: [IRS_FULL_TIME, IRS_ALE],
      },
      {
        id: 'federal-16-to-32',
        heading: '16 to 32 hours a week: part-time federal jobs',
        paragraphs: [
          'For federal agencies, part-time career employment means regularly scheduled work of from 16 to 32 hours per week (5 CFR 340.202). An agency may let an employee work a regular schedule of 1 to 15 hours a week as an exception.',
          'Full-time federal employees have a basic workweek of 40 hours (5 CFR 610.102).',
        ],
        sources: [ECFR_340, ECFR_610],
      },
      {
        id: 'flsa-no-number',
        heading: 'Your rights do not depend on the label',
        paragraphs: [
          'In the words of the U.S. Department of Labor, the Fair Labor Standards Act (FLSA) does not define full-time employment or part-time employment. It is a matter generally to be determined by the employer, and whether you are considered part time does not change how the FLSA applies to you.',
          'So a covered part-time worker is owed the minimum wage for every hour, and at least time and a half for the hours over 40 in a workweek (DOL Fact Sheet #23). Benefits such as health coverage or paid time off follow your employer’s policy and, for coverage, the 30-hour line above.',
        ],
        sources: [DOL_FULL_TIME, FACT_SHEET_23],
      },
      {
        id: 'count-your-week',
        heading: 'Count your week',
        paragraphs: [
          `9 am to 3 pm with no break is ${shortDays.day} a day, ${shortDays.week} h a week over five days: part time in the BLS statistics, which start full time at 35, but full time for the IRS, which starts at 30.`,
          `Three days of 9 am to 5 pm with a 30-minute unpaid lunch are ${threeDays.day} a day, ${threeDays.week} h a week: part time on every line.`,
          'These figures come from the hours calculator; enter your own start, end and break there, and add a whole week on the time card.',
        ],
        sources: [BLS_CPS, IRS_FULL_TIME],
      },
    ],
    sourcesLabel: 'Sources',
    disclaimer:
      'A guide to what these agencies and rules publish, not legal advice. Your employer’s policy decides part time for its benefits; for your own case, check your state’s labor department.',
    checked: CHECKED,
    ctas: [
      { label: 'Open the hours calculator', href: HOURS_PATHS.en },
      { label: 'Add up a whole week on the time card', href: '/time-card-calculator' },
      { label: 'How many hours is full time?', href: FULL_TIME_GUIDE_PATHS.en },
    ],
    linkLabel: 'How many hours is part time?',
  },
  es: {
    title: titleOf(PART_ANSWER.es),
    description: `${PART_ANSWER.es}: menos de 35 en las estadísticas de la BLS y menos de 30 para la cobertura médica (IRS).`,
    kicker: 'Horas · guía',
    h1: '¿Cuántas horas son medio tiempo?',
    lead: 'El medio tiempo, o tiempo parcial, es menos de 35 horas a la semana en las estadísticas de empleo del gobierno, y menos de 30 horas a la semana (130 al mes) para la cobertura médica del empleador según la Ley de Cuidado de Salud a Bajo Precio. Ninguna ley federal de salarios fija un número: la FLSA lo deja a tu empleador, y con medio tiempo o no, conservas el derecho al salario mínimo y a las horas extra después de 40 horas. Aquí tienes cada línea, de dónde sale y qué cambia.',
    sections: [
      {
        id: 'bls-menos-de-35',
        heading: 'Menos de 35 horas: la línea de las estadísticas de empleo',
        paragraphs: [
          'En la Encuesta de Población Actual (CPS), la Oficina de Estadísticas Laborales (BLS) cuenta como de medio tiempo a quienes trabajan por lo general menos de 35 horas por semana. En la semana por la que pregunta la encuesta, el trabajo de medio tiempo es de 1 a 34 horas.',
          'Se guía por tu horario habitual: alguien de medio tiempo puede trabajar más de 34 horas en una semana dada. Si tienes más de un trabajo, lo deciden tus horas habituales en todos juntos, así que dos trabajos de medio tiempo pueden sumar tiempo completo en las estadísticas.',
        ],
        sources: [BLS_CPS],
      },
      {
        id: 'irs-menos-de-30',
        heading: 'Menos de 30 horas a la semana: no es tiempo completo para la cobertura médica',
        paragraphs: [
          'Para las disposiciones de responsabilidad compartida del empleador de la Ley de Cuidado de Salud a Bajo Precio (ACA), un empleado de tiempo completo trabaja en promedio al menos 30 horas de servicio por semana, o 130 horas de servicio por mes (IRS). Por debajo de eso, no eres un empleado de tiempo completo para esas disposiciones.',
          'Tus horas igual cuentan para el tamaño de tu empleador. Para saber si tiene al menos 50 empleados de tiempo completo, incluidos los equivalentes a tiempo completo, suma las horas de servicio de todos los que no son de tiempo completo, como máximo 120 por persona en un mes, y divide el total por 120.',
        ],
        sources: [IRS_FULL_TIME, IRS_ALE],
      },
      {
        id: 'federal-16-a-32',
        heading: 'De 16 a 32 horas a la semana: los empleos federales de medio tiempo',
        paragraphs: [
          'En las agencias federales, el empleo de carrera de medio tiempo es el trabajo con horario regular de 16 a 32 horas por semana (5 CFR 340.202). Una agencia puede permitir, como excepción, un horario regular de 1 a 15 horas a la semana.',
          'Los empleados federales de tiempo completo tienen una semana laboral básica de 40 horas (5 CFR 610.102).',
        ],
        sources: [ECFR_340, ECFR_610],
      },
      {
        id: 'flsa-sin-numero',
        heading: 'Tus derechos no dependen de la etiqueta',
        paragraphs: [
          'En palabras del Departamento de Trabajo de EE. UU., la Ley de Normas Justas de Trabajo (FLSA) no define el empleo de tiempo completo ni el de medio tiempo. Es algo que por lo general decide el empleador, y que te consideren de medio tiempo no cambia cómo se te aplica la FLSA.',
          'Así que a quien trabaja medio tiempo y está cubierto se le debe el salario mínimo por cada hora, y al menos tiempo y medio por las horas sobre 40 en una semana laboral (Fact Sheet #23 del Departamento de Trabajo). Beneficios como la cobertura médica o las vacaciones pagadas siguen la política de tu empleador y, para la cobertura, la línea de 30 horas de arriba.',
        ],
        sources: [DOL_FULL_TIME, FACT_SHEET_23],
      },
      {
        id: 'cuenta-tu-semana',
        heading: 'Cuenta tu semana',
        paragraphs: [
          `De 9 am a 3 pm sin descanso son ${shortDays.day} al día, ${shortDays.week} h a la semana en cinco días: medio tiempo en las estadísticas de la BLS, donde el tiempo completo empieza en 35, pero tiempo completo para el IRS, que empieza en 30.`,
          `Tres días de 9 am a 5 pm con 30 minutos de almuerzo sin pago son ${threeDays.day} al día, ${threeDays.week} h a la semana: medio tiempo en todas las líneas.`,
          'Estas cifras salen de la calculadora de horas; ingresa ahí tu entrada, tu salida y tu descanso, y suma una semana entera en la tarjeta de horas.',
        ],
        sources: [BLS_CPS, IRS_FULL_TIME],
      },
    ],
    sourcesLabel: 'Fuentes',
    disclaimer:
      'Una guía de lo que publican estas agencias y reglas, no asesoría legal. La política de tu empleador decide el medio tiempo para sus beneficios; para tu caso, consulta al departamento de trabajo de tu estado.',
    checked: CHECKED,
    ctas: [
      { label: 'Abrir la calculadora de horas', href: HOURS_PATHS.es },
      {
        label: 'Suma una semana entera en la tarjeta de horas',
        href: '/es/calculadora-de-horas-trabajadas',
      },
      { label: '¿Cuántas horas son tiempo completo?', href: FULL_TIME_GUIDE_PATHS.es },
    ],
    linkLabel: '¿Cuántas horas son medio tiempo?',
  },
};
