import { Rational } from '@maestro-calc/core';
import { decimalHours } from '@maestro-calc/pay-core/decimal-hours';
import { hoursBetween } from '@maestro-calc/pay-core/hours';
import { decimalHoursText, hoursMinutesText } from '../format.ts';
import { DECIMAL_HOURS_PATHS, HOURS_PATHS } from '../hours/texts.ts';
import type { CommonLinks } from '../long-tail/jobs.ts';
import { minutesLinksOf } from '../long-tail/minutes.ts';
import { shiftLinksOf } from '../long-tail/shifts.ts';
import type { Lang } from '../time-card/receipt.ts';
import type { GuideSource, GuideTexts } from './texts.ts';

export { HOURS_WORKED_GUIDE_PATHS } from './paths.ts';

/** The figures of one worked shift, each written as the hours calculator writes it. */
export interface ShiftFigures {
  /** Start to end, before the break, in decimal hours. */
  readonly shift: string;
  /** The hours worked, in hours and minutes. */
  readonly hours: string;
  /** The hours worked, in decimal hours. */
  readonly decimal: string;
}

interface WorkedShift {
  readonly id: 'lunch' | 'minutes' | 'overnight';
  /** The raw fields of the hours calculator, as a shared link would carry them. */
  readonly inputs: Readonly<Record<string, string>>;
}

const SHIFTS: readonly WorkedShift[] = [
  { id: 'lunch', inputs: { start: '8:00', end: '16:30', unpaidBreak: '30' } },
  { id: 'minutes', inputs: { start: '8:10', end: '17:05', unpaidBreak: '30' } },
  { id: 'overnight', inputs: { start: '22:00', end: '6:15', unpaidBreak: '30' } },
];

const hoursOutputsOf = (
  inputs: Readonly<Record<string, string>>,
): ReadonlyMap<string, Rational> => {
  const ran = hoursBetween.run(inputs);
  if (!ran.ok) throw new Error(`the shift ${JSON.stringify(inputs)} must run`);
  return new Map(ran.value.outputs.map(({ key, value }) => [key, value]));
};

const rationalOf = (out: ReadonlyMap<string, Rational>, key: string): Rational => {
  const found = out.get(key);
  if (found === undefined) throw new Error(`no hours output ${key}`);
  return found;
};

const shiftFiguresOf = (inputs: Readonly<Record<string, string>>): ShiftFigures => {
  const out = hoursOutputsOf(inputs);
  const hours = rationalOf(out, 'hours');
  return {
    shift: decimalHoursText(rationalOf(out, 'shiftHours')),
    hours: hoursMinutesText(hours),
    decimal: decimalHoursText(hours),
  };
};

/** The shifts the guide works out, every figure from the hours calculator at build. */
export const HOURS_WORKED_GUIDE_SHIFTS: readonly (WorkedShift & {
  readonly figures: ShiftFigures;
})[] = SHIFTS.map((shift) => ({ ...shift, figures: shiftFiguresOf(shift.inputs) }));

const decimalOutputsOf = (
  inputs: Readonly<Record<string, string>>,
): ReadonlyMap<string, Rational> => {
  const ran = decimalHours.run(inputs);
  if (!ran.ok) throw new Error(`the converter on ${JSON.stringify(inputs)} must run`);
  return new Map(ran.value.outputs.map(({ key, value }) => [key, value]));
};

const decimalOf = (hours: number, minutes: number): string =>
  decimalHoursText(
    rationalOf(
      decimalOutputsOf({ hours: String(hours), minutes: String(minutes) }),
      'decimalHours',
    ),
  );

/** Minutes (and 8 h 25 min) in decimal hours, from the minutes to decimal hours converter. */
export const HOURS_WORKED_GUIDE_MINUTES = {
  '6': decimalOf(0, 6),
  '15': decimalOf(0, 15),
  '25': decimalOf(0, 25),
  '45': decimalOf(0, 45),
  '8:25': decimalOf(8, 25),
} as const;

/** 8.25 decimal hours read back as hours and minutes by the converter: not 8 h 25 min. */
export const HOURS_WORKED_GUIDE_MISREAD = ((): {
  readonly decimal: string;
  readonly reads: string;
} => {
  const decimal = Rational.of(33, 4);
  const out = decimalOutputsOf({ decimal: '8.25' });
  return {
    decimal: decimalHoursText(decimal),
    reads: hoursMinutesText(rationalOf(out, 'fromDecimal')),
  };
})();

const linksOf = (lang: Lang, heading: string): CommonLinks => ({
  heading,
  links: [...shiftLinksOf(lang).links, ...minutesLinksOf(lang).links],
});

/** The shift and minutes pages the guide lists under its body, in each language. */
export const HOURS_WORKED_GUIDE_LINKS: Readonly<Record<Lang, CommonLinks>> = {
  en: linksOf('en', 'Common shifts and minutes in decimal hours'),
  es: linksOf('es', 'Turnos comunes y minutos en horas decimales'),
};

const shiftOf = (id: WorkedShift['id']): ShiftFigures => {
  const found = HOURS_WORKED_GUIDE_SHIFTS.find((each) => each.id === id);
  if (found === undefined) throw new Error(`no worked shift ${id}`);
  return found.figures;
};

const lunch = shiftOf('lunch');
const odd = shiftOf('minutes');
const overnight = shiftOf('overnight');
const m = HOURS_WORKED_GUIDE_MINUTES;
const misread = HOURS_WORKED_GUIDE_MISREAD;

const FACT_SHEET_22: GuideSource = {
  label: 'U.S. Department of Labor, Fact Sheet #22: Hours Worked Under the FLSA',
  href: 'https://www.dol.gov/agencies/whd/fact-sheets/22-flsa-hours-worked',
};
const ECFR_18: GuideSource = {
  label: '29 CFR 785.18, Rest (eCFR)',
  href: 'https://www.ecfr.gov/current/title-29/subtitle-B/chapter-V/subchapter-B/part-785/subpart-C/subject-group-ECFR3d1222debcd8ec6/section-785.18',
};
const ECFR_19: GuideSource = {
  label: '29 CFR 785.19, Meal (eCFR)',
  href: 'https://www.ecfr.gov/current/title-29/subtitle-B/chapter-V/subchapter-B/part-785/subpart-C/subject-group-ECFR3d1222debcd8ec6/section-785.19',
};
const ECFR_48: GuideSource = {
  label: '29 CFR 785.48, Use of time clocks (eCFR)',
  href: 'https://www.ecfr.gov/current/title-29/subtitle-B/chapter-V/subchapter-B/part-785/subpart-D/section-785.48',
};
const DOL_MEAL_TABLE: GuideSource = {
  label:
    'U.S. Department of Labor, Minimum Length of Meal Period Required under State Law (table by state)',
  href: 'https://www.dol.gov/agencies/whd/state/meal-breaks',
};

export const HOURS_WORKED_GUIDE: Readonly<Record<Lang, GuideTexts>> = {
  en: {
    title: 'How to Calculate Hours Worked, with Lunch Breaks | Cuenta Horas',
    description:
      'Count your hours worked: end time less start time, less an unpaid lunch, then minutes to decimal hours (15 min = 0.25). Which breaks are paid, with examples.',
    kicker: 'Hours · guide',
    h1: 'How to calculate hours worked, with lunch breaks and minutes to decimal',
    lead: 'To count the hours you worked, take the time from start to finish, subtract an unpaid meal break, and turn the minutes into decimal hours the way payroll writes them. This guide shows which breaks count as work under federal law, how to do the math, and where rounding comes in.',
    sections: [
      {
        id: 'what-counts',
        heading: 'What counts as hours worked',
        paragraphs: [
          'Under the Fair Labor Standards Act (FLSA), the workweek ordinarily includes all the time you are required to be on the employer’s premises, on duty or at a prescribed workplace (DOL Fact Sheet #22).',
          'Work your employer did not ask for but suffered or permitted you to do is work time it must pay for: finishing a task after your shift, or answering work messages, counts (Fact Sheet #22).',
        ],
        sources: [FACT_SHEET_22],
      },
      {
        id: 'breaks',
        heading: 'Short breaks are paid; a real meal break usually is not',
        paragraphs: [
          'Rest periods of short duration, running from 5 minutes to about 20 minutes, are customarily paid for as working time and must be counted as hours worked (29 CFR 785.18). A coffee or snack break is one of these rest periods, not a meal period (29 CFR 785.19).',
          'A bona fide meal period is not work time. Ordinarily it lasts 30 minutes or more, and you must be completely relieved from duty: if you have to eat at your desk or stay at your machine, you are working while you eat (29 CFR 785.19). Your employer does not have to let you leave the premises for it to count as a meal period, as long as you are otherwise free of duties.',
          'So subtract only the unpaid meal period. Two paid 15-minute breaks stay in your hours.',
        ],
        sources: [ECFR_18, ECFR_19, FACT_SHEET_22],
      },
      {
        id: 'step-by-step',
        heading: 'Step by step',
        paragraphs: [
          'Write your start and end times on one clock (8:00 am and 4:30 pm, or 8:00 and 16:30). Subtract the start from the end; if the end is earlier than the start, the shift crossed midnight, so add 24 hours. Then subtract your unpaid meal period in minutes.',
          'What is left is your hours worked in hours and minutes. For a time card or a paycheck, turn the minutes into a decimal, as the next section shows. The hours calculator does all three steps for you.',
        ],
        sources: [FACT_SHEET_22, ECFR_19],
      },
      {
        id: 'minutes-to-decimal',
        heading: 'Minutes to decimal hours',
        paragraphs: [
          `Payroll writes hours as decimals: divide the minutes by 60. 15 minutes is ${m['15']} hours, 45 minutes is ${m['45']}, 6 minutes (a tenth of an hour) is ${m['6']}, and 25 minutes is ${m['25']}, rounded to two places. So 8 hours 25 minutes is ${m['8:25']} hours.`,
          `Do not read the minutes as the decimal: ${misread.decimal} hours is ${misread.reads}, not 8 hours 25 minutes, because 0.25 of an hour is 15 minutes. Mixing them up costs you 10 minutes on that day.`,
          'Some time clocks record your start and stop times to the nearest 5 minutes, or the nearest tenth or quarter of an hour. Federal enforcement accepts that only if, over time, it does not fail to pay you for all the time you actually worked (29 CFR 785.48).',
        ],
        sources: [ECFR_48],
      },
      {
        id: 'worked-examples',
        heading: 'Worked examples',
        paragraphs: [
          `A day with lunch: 8:00 am to 4:30 pm is ${lunch.shift} hours from start to end. Less a 30-minute unpaid lunch, you worked ${lunch.hours}, or ${lunch.decimal} hours.`,
          `Odd minutes: 8:10 am to 5:05 pm is ${odd.shift} hours from start to end. Less a 30-minute lunch, you worked ${odd.hours}, or ${odd.decimal} hours.`,
          `A night shift: 10:00 pm to 6:15 am crosses midnight, ${overnight.shift} hours from start to end. Less a 30-minute meal break, you worked ${overnight.hours}, or ${overnight.decimal} hours.`,
          'These figures come from the hours calculator and the minutes to decimal hours converter; enter your own times there to see your day.',
        ],
        sources: [ECFR_18, ECFR_19],
      },
      {
        id: 'states',
        heading: 'Check your state',
        paragraphs: [
          'These are the federal rules on which breaks count as hours worked. Some states also require employers to give a meal period or rest breaks, with their own lengths and timing.',
          'The U.S. Department of Labor keeps a table of the meal periods each state requires; check your state there, and with its labor department.',
        ],
        sources: [DOL_MEAL_TABLE, FACT_SHEET_22],
      },
    ],
    sourcesLabel: 'Sources',
    disclaimer:
      'A guide to what these rules and agencies publish, not legal advice. For your own case, check your state’s labor department.',
    reviewed: 'Checked against the eCFR and Department of Labor pages on November 5, 2026.',
    ctas: [
      { label: 'Open the hours calculator', href: HOURS_PATHS.en },
      { label: 'Convert minutes to decimal hours', href: DECIMAL_HOURS_PATHS.en },
      { label: 'Add up a whole week on the time card', href: '/time-card-calculator' },
    ],
    linkLabel: 'How to calculate hours worked, with lunch breaks',
  },
  es: {
    title: 'Cómo calcular las horas trabajadas, con descanso | Cuenta Horas',
    description:
      'Calcula tus horas trabajadas: salida menos entrada, menos el almuerzo sin pago, y minutos a horas decimales (15 min = 0.25). Qué descansos se pagan y ejemplos.',
    kicker: 'Horas · guía',
    h1: 'Cómo calcular las horas trabajadas, con descanso y minutos a decimal',
    lead: 'Para contar las horas que trabajaste, toma el tiempo de la entrada a la salida, resta el descanso para comer sin pago y convierte los minutos a horas decimales, como las escribe la nómina. Esta guía muestra qué descansos cuentan como trabajo según la ley federal, cómo hacer la cuenta y dónde entra el redondeo.',
    sections: [
      {
        id: 'que-cuenta',
        heading: 'Qué cuenta como horas trabajadas',
        paragraphs: [
          'Según la Ley de Normas Justas de Trabajo (FLSA), la semana laboral incluye por lo general todo el tiempo en que debes estar en el local del empleador, de servicio o en un lugar de trabajo indicado (Fact Sheet #22 del Departamento de Trabajo).',
          'El trabajo que tu empleador no pidió, pero que te permitió hacer, es tiempo de trabajo que debe pagar: terminar una tarea después de tu turno o responder mensajes de trabajo cuenta (Fact Sheet #22).',
        ],
        sources: [FACT_SHEET_22],
      },
      {
        id: 'descansos',
        heading:
          'Los descansos cortos se pagan; un descanso para comer de verdad, por lo general no',
        paragraphs: [
          'Los descansos cortos, de 5 minutos a unos 20 minutos, se pagan por costumbre como tiempo de trabajo y deben contarse como horas trabajadas (29 CFR 785.18). Una pausa para un café o un bocadillo es uno de estos descansos, no un descanso para comer (29 CFR 785.19).',
          'Un descanso para comer de buena fe no es tiempo de trabajo. Por lo general dura 30 minutos o más, y debes quedar libre por completo de tus tareas: si tienes que comer en tu escritorio o quedarte en tu máquina, estás trabajando mientras comes (29 CFR 785.19). Tu empleador no tiene que dejarte salir del local para que cuente como descanso para comer, siempre que estés libre de tareas.',
          'Así que resta solo el descanso para comer sin pago. Dos descansos pagados de 15 minutos se quedan en tus horas.',
        ],
        sources: [ECFR_18, ECFR_19, FACT_SHEET_22],
      },
      {
        id: 'paso-a-paso',
        heading: 'Paso a paso',
        paragraphs: [
          'Escribe tu hora de entrada y de salida en un mismo reloj (8:00 am y 4:30 pm, o 8:00 y 16:30). Resta la entrada de la salida; si la salida es antes que la entrada, el turno cruzó la medianoche, así que suma 24 horas. Luego resta tu descanso para comer sin pago, en minutos.',
          'Lo que queda son tus horas trabajadas en horas y minutos. Para una tarjeta de horas o un cheque, convierte los minutos a decimal, como muestra la sección siguiente. La calculadora de horas hace los tres pasos por ti.',
        ],
        sources: [FACT_SHEET_22, ECFR_19],
      },
      {
        id: 'minutos-a-decimal',
        heading: 'Minutos a horas decimales',
        paragraphs: [
          `La nómina escribe las horas en decimales: divide los minutos por 60. 15 minutos son ${m['15']} horas, 45 minutos son ${m['45']}, 6 minutos (una décima de hora) son ${m['6']}, y 25 minutos son ${m['25']}, redondeado a dos decimales. Así, 8 horas y 25 minutos son ${m['8:25']} horas.`,
          `No leas los minutos como el decimal: ${misread.decimal} horas son ${misread.reads}, no 8 horas y 25 minutos, porque 0.25 de hora son 15 minutos. Confundirlos te cuesta 10 minutos ese día.`,
          'Algunos relojes marcadores registran tu entrada y salida a los 5 minutos más cercanos, o a la décima o al cuarto de hora más cercano. La aplicación federal lo acepta solo si, con el tiempo, no deja de pagarte todo el tiempo que de verdad trabajaste (29 CFR 785.48).',
        ],
        sources: [ECFR_48],
      },
      {
        id: 'ejemplos-resueltos',
        heading: 'Ejemplos resueltos',
        paragraphs: [
          `Un día con almuerzo: de 8:00 am a 4:30 pm son ${lunch.shift} horas de la entrada a la salida. Menos 30 minutos de almuerzo sin pago, trabajaste ${lunch.hours}, o ${lunch.decimal} horas.`,
          `Minutos sueltos: de 8:10 am a 5:05 pm son ${odd.shift} horas de la entrada a la salida. Menos 30 minutos de almuerzo, trabajaste ${odd.hours}, o ${odd.decimal} horas.`,
          `Un turno de noche: de 10:00 pm a 6:15 am cruza la medianoche, ${overnight.shift} horas de la entrada a la salida. Menos 30 minutos de descanso para comer, trabajaste ${overnight.hours}, o ${overnight.decimal} horas.`,
          'Estas cifras salen de la calculadora de horas y del convertidor de minutos a horas decimales; ingresa ahí tus propias horas para ver tu día.',
        ],
        sources: [ECFR_18, ECFR_19],
      },
      {
        id: 'estados',
        heading: 'Revisa tu estado',
        paragraphs: [
          'Estas son las reglas federales sobre qué descansos cuentan como horas trabajadas. Algunos estados además exigen que el empleador dé un descanso para comer o descansos cortos, con su propia duración y horario.',
          'El Departamento de Trabajo de EE. UU. tiene una tabla, en inglés, con los descansos para comer que exige cada estado; revisa ahí tu estado, y consulta a su departamento de trabajo.',
        ],
        sources: [DOL_MEAL_TABLE, FACT_SHEET_22],
      },
    ],
    sourcesLabel: 'Fuentes',
    disclaimer:
      'Una guía de lo que publican estas reglas y agencias, no asesoría legal. Para tu caso, consulta al departamento de trabajo de tu estado.',
    reviewed:
      'Revisada con el eCFR y páginas del Departamento de Trabajo el 5 de noviembre de 2026.',
    ctas: [
      { label: 'Abrir la calculadora de horas', href: HOURS_PATHS.es },
      { label: 'Convierte minutos a horas decimales', href: DECIMAL_HOURS_PATHS.es },
      {
        label: 'Suma una semana entera en la tarjeta de horas',
        href: '/es/calculadora-de-horas-trabajadas',
      },
    ],
    linkLabel: 'Cómo calcular las horas trabajadas, con descanso',
  },
};
