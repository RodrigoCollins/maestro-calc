import { addMoney, encode } from '@maestro-calc/core';
import { timeCard } from '@maestro-calc/pay-core/time-card';
import { hoursText, moneyText } from '../format.ts';
import { MEAL_PERIODS } from '../long-tail/meal-periods.ts';
import { TIME_CARD_PATHS, type CommonLinks } from '../long-tail/jobs.ts';
import { OVERTIME_PATHS } from '../overtime/texts.ts';
import { statePathOf } from '../states/routes.ts';
import { outputOf, type Lang } from '../time-card/receipt.ts';
import { TIME_CARD_TEXTS } from '../time-card/texts.ts';
import {
  EMPLOYER_HOURS_GUIDE_PATHS,
  TIME_APPS_GUIDE_PATHS,
  TIMESHEET_GUIDE_PATHS,
} from './paths.ts';
import type { GuideSource, GuideTable, GuideTableCell, GuideTexts } from './texts.ts';

export {
  EMPLOYER_HOURS_GUIDE_PATHS,
  TIME_APPS_GUIDE_PATHS,
  TIMESHEET_GUIDE_PATHS,
} from './paths.ts';

/*
 * The pages for employers: how to keep the hours the FLSA asks for, a crew timesheet worked out by
 * the time card, and the public plan facts of a few time-tracking apps. The apps are linked to
 * their plain homepages; an affiliate link reaches these pages only through `../affiliate/offers.ts`
 * once a program approves the site, and then inside the disclosed block, never in the table.
 */

const CHECKED = '2026-11-15';

// ---------------------------------------------------------------------------------------------
// The crew timesheet: one time card week per worker, the figures the time card's own
// ---------------------------------------------------------------------------------------------

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
type Day = (typeof DAYS)[number];

interface CrewMember {
  readonly name: string;
  readonly rate: string;
  /** The shift of each day worked: in, out and the unpaid break in minutes. */
  readonly shifts: Partial<Record<Day, readonly [string, string, string]>>;
}

const weekdays = (shift: readonly [string, string, string]): CrewMember['shifts'] => ({
  mon: shift,
  tue: shift,
  wed: shift,
  thu: shift,
  fri: shift,
});

const CREW: readonly CrewMember[] = [
  { name: 'Ana', rate: '18', shifts: weekdays(['8:00', '16:30', '30']) },
  { name: 'Luis', rate: '20', shifts: weekdays(['7:00', '16:00', '30']) },
  {
    name: 'Marta',
    rate: '16',
    shifts: {
      mon: ['9:00', '14:00', '0'],
      wed: ['9:00', '14:00', '0'],
      fri: ['9:00', '14:00', '0'],
    },
  },
];

const rawOf = (member: CrewMember): Record<string, string> => {
  const raw: Record<string, string> = { rate: member.rate, rule: 'federal' };
  for (const day of DAYS) {
    const [start, end, unpaid] = member.shifts[day] ?? ['', '', '0'];
    raw[day] = start;
    raw[`${day}Out`] = end;
    raw[`${day}Break`] = unpaid;
  }
  return raw;
};

export interface CrewRow {
  readonly name: string;
  readonly days: readonly string[];
  readonly total: string;
  readonly overtime: string;
  readonly pay: string;
  /** The worker's week in the time card, to print, copy or share from there. */
  readonly href: Readonly<Record<Lang, string>>;
}

const crew = ((): {
  readonly rows: readonly CrewRow[];
  readonly total: { hours: string; pay: string };
} => {
  const runs = CREW.map((member) => {
    const raw = rawOf(member);
    const ran = timeCard.run(raw);
    const validated = timeCard.validate(raw);
    if (!ran.ok || !validated.ok) throw new Error(`the week of ${member.name} must run`);
    const query = encode(timeCard, validated.value);
    return { member, result: ran.value, query };
  });
  const rows = runs.map(({ member, result, query }) => ({
    name: member.name,
    days: DAYS.map((day) => hoursText(outputOf(result, `${day}Hours`))),
    total: hoursText(outputOf(result, 'totalHours')),
    overtime: hoursText(outputOf(result, 'overtimeHours')),
    pay: moneyText(outputOf(result, 'pay')),
    href: { en: `${TIME_CARD_PATHS.en}?${query}`, es: `${TIME_CARD_PATHS.es}?${query}` },
  }));
  const [first, ...rest] = runs;
  if (first === undefined) throw new Error('the crew has no one');
  const hours = rest.reduce(
    (sum, { result }) => sum.add(outputOf(result, 'totalHours')),
    outputOf(first.result, 'totalHours'),
  );
  const pay = rest.reduce(
    (sum, { result }) => addMoney(sum, outputOf(result, 'pay')),
    outputOf(first.result, 'pay'),
  );
  return { rows, total: { hours: hoursText(hours), pay: moneyText(pay) } };
})();

/** The worked crew of the timesheet page, every figure from the time card at build. */
export const TIMESHEET_CREW = crew;

const dayNames = (lang: Lang): readonly string[] =>
  TIME_CARD_TEXTS[lang].days.map(({ short }) => short);

const cell = (text: string, href?: string): GuideTableCell =>
  href === undefined ? { text } : { text, href };

const CREW_WORDS = {
  en: {
    employee: 'Employee',
    total: 'Total h',
    overtime: 'Overtime h',
    pay: 'Gross pay',
    card: 'Time card',
    open: 'Open',
    crew: 'Crew total',
    signature: 'Signature',
  },
  es: {
    employee: 'Empleado',
    total: 'Total h',
    overtime: 'Extra h',
    pay: 'Pago bruto',
    card: 'Tarjeta',
    open: 'Abrir',
    crew: 'Total del equipo',
    signature: 'Firma',
  },
} as const;

const crewTableOf = (
  lang: Lang,
  texts: Pick<GuideTable, 'heading' | 'lead' | 'caption' | 'note'>,
): GuideTable => {
  const w = CREW_WORDS[lang];
  return {
    id: 'worked-crew',
    ...texts,
    columns: [w.employee, ...dayNames(lang), w.total, w.overtime, w.pay, w.card],
    rows: crew.rows.map((row) => [
      cell(row.name),
      ...row.days.map((day) => cell(day)),
      cell(row.total),
      cell(row.overtime),
      cell(row.pay),
      cell(w.open, row.href[lang]),
    ]),
    foot: [
      cell(w.crew),
      ...DAYS.map(() => cell('')),
      cell(crew.total.hours),
      cell(''),
      cell(crew.total.pay),
      cell(''),
    ],
  };
};

const BLANK_ROWS = 6;

const blankTableOf = (
  lang: Lang,
  texts: Pick<GuideTable, 'heading' | 'lead' | 'caption' | 'note'>,
): GuideTable => {
  const w = CREW_WORDS[lang];
  // each row is numbered, so every row has its header and the sheet reads in print and to axe
  const columns = ['#', w.employee, ...dayNames(lang), w.total, w.signature];
  return {
    id: 'blank-timesheet',
    ...texts,
    columns,
    rows: Array.from({ length: BLANK_ROWS }, (_, index) =>
      columns.map((_column, at) => cell(at === 0 ? String(index + 1) : '')),
    ),
  };
};

// ---------------------------------------------------------------------------------------------
// The time-tracking apps: public plan facts, each read on the vendor's own pricing page
// ---------------------------------------------------------------------------------------------

type Fact = Readonly<Record<Lang, string>>;

export interface TimeApp {
  readonly id: 'clockify' | 'jibble' | 'connecteam' | 'deputy';
  readonly name: string;
  /** The plain homepage the table links to: no tracking, no affiliate code. */
  readonly homepage: string;
  /** The pricing page every fact of the row was read on. */
  readonly pricing: string;
  readonly checked: string;
  readonly free: Fact;
  readonly price: Fact;
  readonly gps: Fact;
  readonly payroll: Fact;
}

/** Read on 2026-11-15. Gusto (a bot check) and 7shifts (no plan text without scripts) are left out. */
export const TIME_APPS: readonly TimeApp[] = [
  {
    id: 'clockify',
    name: 'Clockify',
    homepage: 'https://clockify.me/',
    pricing: 'https://clockify.me/pricing',
    checked: CHECKED,
    free: { en: 'Yes, up to 5 users', es: 'Sí, hasta 5 usuarios' },
    price: {
      en: 'Basic: $3.99 per seat a month billed annually, $4.99 billed monthly',
      es: 'Basic: $3.99 por usuario al mes con pago anual, $4.99 con pago mensual',
    },
    gps: {
      en: 'Location tracking while on the clock, on the Pro plan and up',
      es: 'Ubicación mientras el reloj corre, desde el plan Pro',
    },
    payroll: {
      en: 'Sends time to QuickBooks for payroll (Standard plan and up)',
      es: 'Envía las horas a QuickBooks para la nómina (desde el plan Standard)',
    },
  },
  {
    id: 'jibble',
    name: 'Jibble',
    homepage: 'https://www.jibble.io/',
    pricing: 'https://www.jibble.io/pricing',
    checked: CHECKED,
    free: { en: 'Yes, unlimited users', es: 'Sí, usuarios ilimitados' },
    price: {
      en: 'Not in the text of its pricing page when we read it',
      es: 'No figuraba en el texto de su página de precios cuando la leímos',
    },
    gps: {
      en: 'Stamps location data on every clock-in and clock-out (plan not stated)',
      es: 'Registra la ubicación en cada entrada y salida (no indica el plan)',
    },
    payroll: {
      en: 'Exports approved timesheets to Xero, QuickBooks, Deel and others',
      es: 'Exporta las hojas aprobadas a Xero, QuickBooks, Deel y otros',
    },
  },
  {
    id: 'connecteam',
    name: 'Connecteam',
    homepage: 'https://connecteam.com/',
    pricing: 'https://connecteam.com/pricing/',
    checked: CHECKED,
    free: { en: 'Yes, up to 10 users', es: 'Sí, hasta 10 usuarios' },
    price: {
      en: 'Operations Basic: $29 a month for the first 30 users billed annually, $35 billed monthly',
      es: 'Operations Basic: $29 al mes por los primeros 30 usuarios con pago anual, $35 con pago mensual',
    },
    gps: {
      en: 'GPS stamps of where users clock in and out',
      es: 'Marca GPS de dónde se registra la entrada y la salida',
    },
    payroll: {
      en: 'Payroll integration listed in its plan table',
      es: 'Integración con nómina en su tabla de planes',
    },
  },
  {
    id: 'deputy',
    name: 'Deputy',
    homepage: 'https://www.deputy.com/',
    pricing: 'https://www.deputy.com/pricing',
    checked: CHECKED,
    free: { en: 'No free plan; a free trial', es: 'Sin plan gratis; prueba gratis' },
    price: {
      en: 'Lite: $5 per user a month, with a $30 minimum monthly spend',
      es: 'Lite: $5 por usuario al mes, con un gasto mínimo de $30 al mes',
    },
    gps: {
      en: 'Geofencing: stops clock-ins outside a set location',
      es: 'Geocerca: impide registrar la entrada fuera de un lugar fijado',
    },
    payroll: {
      en: 'Deputy Payroll by Paycor, an add-on at $8 per user a month plus a $49 monthly base fee',
      es: 'Deputy Payroll de Paycor, un extra de $8 por usuario al mes más $49 de cuota base mensual',
    },
  },
];

const APP_WORDS = {
  en: {
    app: 'App',
    free: 'Free plan',
    price: 'Lowest paid plan listed',
    gps: 'GPS clock-in',
    payroll: 'Payroll',
    source: 'Source',
    read: 'pricing page, read',
  },
  es: {
    app: 'App',
    free: 'Plan gratis',
    price: 'Plan pago más bajo publicado',
    gps: 'Entrada con GPS',
    payroll: 'Nómina',
    source: 'Fuente',
    read: 'página de precios, leída el',
  },
} as const;

const appsTableOf = (
  lang: Lang,
  texts: Pick<GuideTable, 'heading' | 'lead' | 'caption' | 'note'>,
): GuideTable => {
  const w = APP_WORDS[lang];
  return {
    id: 'apps',
    ...texts,
    columns: [w.app, w.free, w.price, w.gps, w.payroll, w.source],
    rows: TIME_APPS.map((app) => [
      cell(app.name, app.homepage),
      cell(app.free[lang]),
      cell(app.price[lang]),
      cell(app.gps[lang]),
      cell(app.payroll[lang]),
      cell(`${app.name}, ${w.read} ${app.checked}`, app.pricing),
    ]),
  };
};

const pricingSourceOf = (app: TimeApp, lang: Lang): GuideSource => ({
  label:
    lang === 'en'
      ? `${app.name}, pricing (read ${app.checked})`
      : `${app.name}, precios (leído el ${app.checked})`,
  href: app.pricing,
});

// ---------------------------------------------------------------------------------------------
// Sources and links
// ---------------------------------------------------------------------------------------------

const ecfr = (section: string, title: string): GuideSource => ({
  label: `29 CFR ${section}, ${title} (eCFR)`,
  href: `https://www.ecfr.gov/current/title-29/section-${section}`,
});

const CFR_516_1 = ecfr('516.1', 'Form of records');
const CFR_516_2 = ecfr('516.2', 'Employees subject to minimum wage or overtime provisions');
const CFR_516_5 = ecfr('516.5', 'Records to be preserved 3 years');
const CFR_516_6 = ecfr('516.6', 'Records to be preserved 2 years');
const CFR_778_105 = ecfr('778.105', 'Determining the workweek');
const CFR_785_48: GuideSource = {
  label: '29 CFR 785.48, Use of time clocks (eCFR)',
  href: 'https://www.ecfr.gov/current/title-29/subtitle-B/chapter-V/subchapter-B/part-785/subpart-D/section-785.48',
};
const FACT_SHEET_21: GuideSource = {
  label: 'U.S. Department of Labor, Fact Sheet #21: Recordkeeping Requirements under the FLSA',
  href: 'https://www.dol.gov/agencies/whd/fact-sheets/21-flsa-recordkeeping',
};
const FTC_ENDORSEMENTS: GuideSource = {
  label: 'Federal Trade Commission, FTC’s Endorsement Guides: What People Are Asking',
  href: 'https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking',
};
const DOL_MEAL_TABLE: GuideSource = {
  label:
    'U.S. Department of Labor, Minimum Length of Meal Period Required under State Law (table by state)',
  href: 'https://www.dol.gov/agencies/whd/state/meal-breaks',
};

/** The state pages of the states whose meal period the DOL table gives as a length. */
export const EMPLOYER_HOURS_GUIDE_LINKS: Readonly<Record<Lang, CommonLinks>> = {
  en: {
    heading: 'State meal break rules',
    links: MEAL_PERIODS.map(({ state }) => ({
      label: state.en,
      href: statePathOf(state.en, 'en'),
    })),
  },
  es: {
    heading: 'Descansos para comer por estado',
    links: MEAL_PERIODS.map(({ state }) => ({
      label: state.es,
      href: statePathOf(state.es, 'es'),
    })),
  },
};

/** The three employer pages, as the calculators list them under "For employers". */
export const EMPLOYER_GUIDE_LINKS: Readonly<Record<Lang, CommonLinks>> = {
  en: {
    heading: 'For employers',
    links: [
      { label: 'How to track employee hours', href: EMPLOYER_HOURS_GUIDE_PATHS.en },
      { label: 'Free employee timesheet template', href: TIMESHEET_GUIDE_PATHS.en },
      { label: 'Time-tracking apps for small business, compared', href: TIME_APPS_GUIDE_PATHS.en },
    ],
  },
  es: {
    heading: 'Para empleadores',
    links: [
      {
        label: 'Cómo llevar el registro de horas de tus empleados',
        href: EMPLOYER_HOURS_GUIDE_PATHS.es,
      },
      { label: 'Plantilla gratis de hoja de horas', href: TIMESHEET_GUIDE_PATHS.es },
      { label: 'Apps de control de horas para pequeñas empresas', href: TIME_APPS_GUIDE_PATHS.es },
    ],
  },
};

const otherEmployerLinks = (lang: Lang, except: string): CommonLinks => ({
  heading: EMPLOYER_GUIDE_LINKS[lang].heading,
  links: EMPLOYER_GUIDE_LINKS[lang].links.filter(({ href }) => href !== except),
});

export const TIMESHEET_GUIDE_LINKS: Readonly<Record<Lang, CommonLinks>> = {
  en: otherEmployerLinks('en', TIMESHEET_GUIDE_PATHS.en),
  es: otherEmployerLinks('es', TIMESHEET_GUIDE_PATHS.es),
};

export const TIME_APPS_GUIDE_LINKS: Readonly<Record<Lang, CommonLinks>> = {
  en: otherEmployerLinks('en', TIME_APPS_GUIDE_PATHS.en),
  es: otherEmployerLinks('es', TIME_APPS_GUIDE_PATHS.es),
};

const ana = crew.rows[0];
const luis = crew.rows[1];
if (ana === undefined || luis === undefined) throw new Error('the crew needs Ana and Luis');

// ---------------------------------------------------------------------------------------------
// How to track employee hours
// ---------------------------------------------------------------------------------------------

export const EMPLOYER_HOURS_GUIDE: Readonly<Record<Lang, GuideTexts>> = {
  en: {
    title: 'How to Track Employee Hours: What the FLSA Requires | Cuenta Horas',
    description:
      'What the FLSA asks employers to record for each hourly worker, how long to keep it (3 years for payroll, 2 for time cards), rounding and three ways to track.',
    kicker: 'Employers · guide',
    h1: 'How to track employee hours, and what the FLSA asks you to keep',
    lead: 'Federal law asks you to record the hours each nonexempt employee works every day and every week, keep payroll records for 3 years and time cards for 2. It names no form: paper time cards, a spreadsheet or an app all work if the records are complete and accurate.',
    sections: [
      {
        id: 'what-to-record',
        heading: 'What you must record for each employee',
        paragraphs: [
          'For each employee covered by the minimum wage or overtime rules, 29 CFR 516.2 lists what the records must show, among them: the full name used for Social Security, the home address, the date of birth if under 19, the time of day and day of the week the workweek begins, the hours worked each workday and the total each workweek, the regular hourly rate in any week with overtime, the straight-time earnings, the overtime premium, additions and deductions, the total wages of each pay period, and the date of payment and the pay period it covers.',
          'The hours are the part a time card holds. The workweek is a fixed and regularly recurring period of 168 hours, seven days in a row, and overtime is counted by that week (29 CFR 778.105).',
        ],
        sources: [CFR_516_2, CFR_778_105],
      },
      {
        id: 'how-long',
        heading: 'How long to keep the records',
        paragraphs: [
          'Payroll records, the ones of 29 CFR 516.2, are kept for at least 3 years (29 CFR 516.5).',
          'The records the wages are worked out from, such as time cards and sheets with the daily starting and stopping time of each employee, are kept for at least 2 years from the date of the last entry (29 CFR 516.6).',
        ],
        sources: [CFR_516_5, CFR_516_6],
      },
      {
        id: 'any-form',
        heading: 'Paper time cards, a spreadsheet or an app',
        paragraphs: [
          'No particular order or form of records is prescribed (29 CFR 516.1). The Department of Labor says you may use any timekeeping method: a time clock, a timekeeper who tracks the hours, or workers who write down their own times (Fact Sheet #21).',
          'Paper time cards cost nothing and suit a small crew in one place; someone still has to add them up each week and file them for 2 years. A spreadsheet adds the totals for you, but only as well as its formulas, and someone types every time in. A time-tracking app records the punches as they happen and can send them to payroll; most charge per user each month, and some have free plans for small teams.',
          'Whatever you use, a worker’s hours must add up the same way: the time from start to finish, less any unpaid meal break. The time card calculator does that sum for one worker’s week, with overtime.',
        ],
        sources: [CFR_516_1, FACT_SHEET_21],
      },
      {
        id: 'rounding',
        heading: 'Rounding clock punches',
        paragraphs: [
          'Some employers record the start and stop times to the nearest 5 minutes, or the nearest tenth or quarter of an hour. Federal enforcement accepts it only if, over time, it does not fail to pay employees for all the time they actually worked (29 CFR 785.48).',
          'In practice, a rule that rounds both ways, up and down, to the nearest mark is the kind 29 CFR 785.48 describes; a rule that always rounds in the employer’s favor is not.',
        ],
        sources: [CFR_785_48],
      },
      {
        id: 'breaks',
        heading: 'Breaks: federal law, then your state',
        paragraphs: [
          'Federal law does not require breaks, but short rest breaks you give are paid work time, and a meal break of usually 30 minutes or more is unpaid only when the worker is completely relieved from duty.',
          'Several states do require a meal period after a set number of hours. The state pages below give the rule from the Department of Labor table for each state that sets one as a length.',
        ],
        sources: [DOL_MEAL_TABLE],
      },
      {
        id: 'worked-week',
        heading: 'A worked week',
        paragraphs: [
          `Ana works Monday to Friday, 8:00 am to 4:30 pm with a 30-minute unpaid lunch: ${ana.days[0] ?? ''} hours a day, ${ana.total} hours in the week, ${ana.pay} at $18 an hour. Luis works 7:00 am to 4:00 pm with the same lunch: ${luis.total} hours, ${luis.overtime} of them overtime at time and a half, ${luis.pay} at $20 an hour.`,
          'Those figures come from the time card calculator; the free timesheet page shows the whole crew.',
        ],
        sources: [FACT_SHEET_21],
      },
    ],
    sourcesLabel: 'Sources',
    disclaimer:
      'A guide to what these rules and agencies publish, not legal advice. Your state may ask for more; check its labor department.',
    checked: CHECKED,
    ctas: [
      { label: 'Open the time card calculator', href: TIME_CARD_PATHS.en },
      { label: 'Open the overtime calculator', href: OVERTIME_PATHS.en },
    ],
    linkLabel: 'How to track employee hours',
  },
  es: {
    title: 'Registro de horas de empleados: qué pide la FLSA | Cuenta Horas',
    description:
      'Qué te pide la ley federal registrar de cada empleado por hora, cuánto guardarlo (3 años la nómina, 2 las tarjetas), el redondeo y tres formas de llevarlo.',
    kicker: 'Empleadores · guía',
    h1: 'Cómo llevar el registro de horas de tus empleados y qué te pide guardar la FLSA',
    lead: 'La ley federal te pide registrar las horas que trabaja cada empleado no exento cada día y cada semana, guardar la nómina 3 años y las tarjetas de horas 2. No exige un formato: tarjetas en papel, una hoja de cálculo o una app sirven si los registros están completos y son exactos.',
    sections: [
      {
        id: 'what-to-record',
        heading: 'Qué debes registrar de cada empleado',
        paragraphs: [
          'De cada empleado cubierto por el salario mínimo o las horas extra, 29 CFR 516.2 enumera lo que deben mostrar los registros, entre otras cosas: el nombre completo que usa para el Seguro Social, el domicilio, la fecha de nacimiento si es menor de 19 años, la hora y el día en que empieza la semana laboral, las horas trabajadas cada día y el total de cada semana, la tarifa por hora en cualquier semana con horas extra, el pago por horas normales, el recargo por horas extra, los agregados y descuentos, el total pagado en cada periodo y la fecha de pago con el periodo que cubre.',
          'Las horas son lo que guarda una tarjeta de horas. La semana laboral es un periodo fijo y recurrente de 168 horas, siete días seguidos, y las horas extra se cuentan por esa semana (29 CFR 778.105).',
        ],
        sources: [CFR_516_2, CFR_778_105],
      },
      {
        id: 'how-long',
        heading: 'Cuánto tiempo guardar los registros',
        paragraphs: [
          'Los registros de nómina, los de 29 CFR 516.2, se guardan al menos 3 años (29 CFR 516.5).',
          'Los registros con los que se calcula el pago, como las tarjetas y hojas con la hora de entrada y de salida de cada empleado, se guardan al menos 2 años desde la última anotación (29 CFR 516.6).',
        ],
        sources: [CFR_516_5, CFR_516_6],
      },
      {
        id: 'any-form',
        heading: 'Tarjetas en papel, hoja de cálculo o app',
        paragraphs: [
          'La norma no exige ningún orden ni formato de registro (29 CFR 516.1). El Departamento de Trabajo dice que puedes usar cualquier método: un reloj checador, una persona que anote las horas o que cada trabajador escriba las suyas (Fact Sheet #21).',
          'Las tarjetas en papel no cuestan nada y sirven para un equipo pequeño en un solo lugar; alguien igual tiene que sumarlas cada semana y archivarlas 2 años. Una hoja de cálculo suma por ti, pero solo tan bien como sus fórmulas, y alguien escribe cada hora. Una app de control de horas registra las entradas y salidas al momento y puede enviarlas a la nómina; la mayoría cobra por usuario al mes y algunas tienen planes gratis para equipos pequeños.',
          'Uses lo que uses, las horas de cada trabajador se suman igual: el tiempo de la entrada a la salida, menos el descanso para comer no pagado. La calculadora de tarjeta de horas hace esa suma para la semana de un trabajador, con horas extra.',
        ],
        sources: [CFR_516_1, FACT_SHEET_21],
      },
      {
        id: 'rounding',
        heading: 'Redondear las marcas del reloj',
        paragraphs: [
          'Algunos empleadores anotan la entrada y la salida a los 5 minutos más cercanos, o a la décima o al cuarto de hora más cercano. La autoridad federal lo acepta solo si, con el tiempo, no deja de pagar a los empleados todo el tiempo que de verdad trabajaron (29 CFR 785.48).',
          'En la práctica, una regla que redondea en los dos sentidos, hacia arriba y hacia abajo, a la marca más cercana es la que describe 29 CFR 785.48; una que siempre redondea a favor del empleador no lo es.',
        ],
        sources: [CFR_785_48],
      },
      {
        id: 'breaks',
        heading: 'Descansos: la ley federal y luego tu estado',
        paragraphs: [
          'La ley federal no exige descansos, pero los descansos cortos que das son tiempo de trabajo pagado, y un descanso para comer de normalmente 30 minutos o más es no pagado solo si el trabajador queda libre por completo de sus tareas.',
          'Varios estados sí exigen un descanso para comer después de cierto número de horas. Las páginas de estado de abajo dan la regla de la tabla del Departamento de Trabajo para cada estado que la fija como una duración.',
        ],
        sources: [DOL_MEAL_TABLE],
      },
      {
        id: 'worked-week',
        heading: 'Una semana resuelta',
        paragraphs: [
          `Ana trabaja de lunes a viernes, de 8:00 a 16:30 con 30 minutos de almuerzo sin pagar: ${ana.days[0] ?? ''} horas al día, ${ana.total} horas en la semana, ${ana.pay} a $18 la hora. Luis trabaja de 7:00 a 16:00 con el mismo almuerzo: ${luis.total} horas, ${luis.overtime} de ellas extra a tiempo y medio, ${luis.pay} a $20 la hora.`,
          'Esas cifras salen de la calculadora de tarjeta de horas; la página de la hoja de horas gratis muestra todo el equipo.',
        ],
        sources: [FACT_SHEET_21],
      },
    ],
    sourcesLabel: 'Fuentes',
    disclaimer:
      'Una guía de lo que publican estas normas y agencias, no asesoría legal. Tu estado puede pedir más; consulta su departamento de trabajo.',
    checked: CHECKED,
    ctas: [
      { label: 'Abre la calculadora de tarjeta de horas', href: TIME_CARD_PATHS.es },
      { label: 'Abre la calculadora de horas extra', href: OVERTIME_PATHS.es },
    ],
    linkLabel: 'Cómo llevar el registro de horas de tus empleados',
  },
};

// ---------------------------------------------------------------------------------------------
// The free timesheet template
// ---------------------------------------------------------------------------------------------

export const TIMESHEET_GUIDE: Readonly<Record<Lang, GuideTexts>> = {
  en: {
    title: 'Free Employee Timesheet Template for a Crew | Cuenta Horas',
    description:
      'A free weekly timesheet for your crew: one row per employee, the 7 days of the workweek, totals and a signature. Print it, or add up each week in the time card.',
    kicker: 'Employers · template',
    h1: 'Free employee timesheet template for your crew',
    lead: 'A weekly crew timesheet needs one row per employee and a column for each of the 7 days of your workweek, then the total hours and a signature. Print the blank sheet below, or open each worker’s week in the time card calculator to add it up with overtime and copy or share it.',
    sections: [
      {
        id: 'what-goes-on-it',
        heading: 'What goes on the sheet',
        paragraphs: [
          'Write the day your workweek begins at the top: federal records must show the time of day and the day of the week it starts (29 CFR 516.2). Then the hours each employee worked each day, and the week’s total.',
          'For the records the hours come from, keep the start and stop time of each day as well, on a time card for each worker; those are kept for 2 years (29 CFR 516.6). The time card calculator holds exactly that: in, out and the unpaid break for each day.',
        ],
        sources: [CFR_516_2, CFR_516_6],
      },
      {
        id: 'how-to-use',
        heading: 'How to use it each week',
        paragraphs: [
          'Enter each worker’s in and out times in the time card calculator, one worker at a time. It gives the hours of each day, the week’s total, the overtime past 40 hours and the gross pay; copy the totals into the crew sheet. The time card keeps the last week in your browser, and you can print it, copy it as text or share its link.',
          'Each worker’s link in the worked crew below opens that week in the time card, so you can check every figure or start from it.',
        ],
        sources: [FACT_SHEET_21],
      },
    ],
    tables: [
      blankTableOf('en', {
        heading: 'Blank crew timesheet',
        lead: 'Week beginning: ____________ · Workweek starts on: ____________ · Approved by: ____________',
        caption: 'Weekly crew timesheet: hours worked each day',
      }),
      crewTableOf('en', {
        heading: 'A worked crew',
        lead: 'Ana, Luis and Marta, federal overtime rule, each week run through the time card calculator.',
        caption: 'Hours worked each day, the week’s total, overtime and gross pay',
        note: 'Ana: 8:00 am to 4:30 pm, 30-minute unpaid lunch, $18 an hour. Luis: 7:00 am to 4:00 pm, 30-minute unpaid lunch, $20 an hour. Marta: 9:00 am to 2:00 pm on Monday, Wednesday and Friday, no break, $16 an hour.',
      }),
    ],
    sourcesLabel: 'Sources',
    disclaimer:
      'A template and a worked example, not legal advice. Your state may require more on a timesheet; check its labor department.',
    checked: CHECKED,
    ctas: [{ label: 'Open the time card calculator', href: TIME_CARD_PATHS.en }],
    linkLabel: 'Free employee timesheet template',
  },
  es: {
    title: 'Plantilla gratis de hoja de horas para tus empleados | Cuenta Horas',
    description:
      'Hoja de horas semanal gratis para tu equipo: una fila por empleado, los 7 días de la semana, totales y firma. Imprímela o suma cada semana en la tarjeta.',
    kicker: 'Empleadores · plantilla',
    h1: 'Plantilla gratis de hoja de horas para tu equipo',
    lead: 'Una hoja de horas semanal del equipo necesita una fila por empleado y una columna para cada uno de los 7 días de tu semana laboral, luego el total de horas y una firma. Imprime la hoja en blanco de abajo, o abre la semana de cada trabajador en la calculadora de tarjeta de horas para sumarla con horas extra y copiarla o compartirla.',
    sections: [
      {
        id: 'what-goes-on-it',
        heading: 'Qué va en la hoja',
        paragraphs: [
          'Escribe arriba el día en que empieza tu semana laboral: los registros federales deben mostrar la hora y el día de la semana en que empieza (29 CFR 516.2). Luego las horas que trabajó cada empleado cada día y el total de la semana.',
          'Para los registros de donde salen las horas, guarda también la hora de entrada y de salida de cada día, en una tarjeta por trabajador; esas se guardan 2 años (29 CFR 516.6). La calculadora de tarjeta de horas guarda justo eso: entrada, salida y el descanso no pagado de cada día.',
        ],
        sources: [CFR_516_2, CFR_516_6],
      },
      {
        id: 'how-to-use',
        heading: 'Cómo usarla cada semana',
        paragraphs: [
          'Ingresa la entrada y la salida de cada trabajador en la calculadora de tarjeta de horas, un trabajador a la vez. Te da las horas de cada día, el total de la semana, las horas extra pasadas las 40 y el pago bruto; copia los totales en la hoja del equipo. La tarjeta guarda la última semana en tu navegador, y puedes imprimirla, copiarla como texto o compartir su enlace.',
          'El enlace de cada trabajador en el equipo resuelto de abajo abre esa semana en la tarjeta, para que revises cada cifra o empieces desde ahí.',
        ],
        sources: [FACT_SHEET_21],
      },
    ],
    tables: [
      blankTableOf('es', {
        heading: 'Hoja de horas del equipo en blanco',
        lead: 'Semana del: ____________ · La semana laboral empieza el: ____________ · Aprobado por: ____________',
        caption: 'Hoja de horas semanal del equipo: horas trabajadas cada día',
      }),
      crewTableOf('es', {
        heading: 'Un equipo resuelto',
        lead: 'Ana, Luis y Marta, regla federal de horas extra, cada semana calculada con la tarjeta de horas.',
        caption: 'Horas trabajadas cada día, total de la semana, horas extra y pago bruto',
        note: 'Ana: de 8:00 a 16:30, 30 minutos de almuerzo sin pagar, $18 la hora. Luis: de 7:00 a 16:00, 30 minutos de almuerzo sin pagar, $20 la hora. Marta: de 9:00 a 14:00 el lunes, el miércoles y el viernes, sin descanso, $16 la hora.',
      }),
    ],
    sourcesLabel: 'Fuentes',
    disclaimer:
      'Una plantilla y un ejemplo resuelto, no asesoría legal. Tu estado puede pedir más en una hoja de horas; consulta su departamento de trabajo.',
    checked: CHECKED,
    ctas: [{ label: 'Abre la calculadora de tarjeta de horas', href: TIME_CARD_PATHS.es }],
    linkLabel: 'Plantilla gratis de hoja de horas',
  },
};

// ---------------------------------------------------------------------------------------------
// Time-tracking apps for small business
// ---------------------------------------------------------------------------------------------

export const TIME_APPS_GUIDE: Readonly<Record<Lang, GuideTexts>> = {
  en: {
    title: 'Time-Tracking Apps for Small Business: Plans Compared | Cuenta Horas',
    description:
      'Clockify, Jibble, Connecteam and Deputy: free plan, lowest paid price, GPS clock-in and payroll, each read on the vendor’s pricing page on 2026-11-15.',
    kicker: 'Employers · comparison',
    h1: 'Time-tracking apps for small business: the plans, compared',
    lead: 'Of 4 time-tracking apps whose pricing pages we read on 2026-11-15, three have a free plan: Clockify for up to 5 users, Connecteam for up to 10 and Jibble with no user limit; Deputy has a free trial. The table gives each one’s public facts as its own page states them, with no ranking.',
    sections: [
      {
        id: 'how-we-checked',
        heading: 'How we read the facts',
        paragraphs: [
          'Every fact in the table comes from the vendor’s own pricing page, read on the date in its row; prices are in US dollars as the page shows them, before tax. Plans and prices change, so check the vendor’s page before you sign up.',
          'We left out two apps we meant to include: Gusto’s pricing page answered our reader with a bot check, which we do not get around, and 7shifts showed no plan text without running its scripts. We do not rank the apps or say which one fits you: that depends on your crew, your payroll and your state.',
        ],
        sources: TIME_APPS.map((app) => pricingSourceOf(app, 'en')),
      },
      {
        id: 'what-to-look-for',
        heading: 'What to look for',
        paragraphs: [
          'A free plan’s user limit, if your crew will grow past it. How the price is counted: per user each month (Clockify, Deputy) or a flat price for the first users (Connecteam), and whether it is the annual or the monthly price. Whether workers can clock in from a phone with a location stamp or only inside a set area (a geofence). And whether the hours reach your payroll without retyping.',
          'Whatever app you choose, the records federal law asks for are the same: the hours worked each day and each week for each nonexempt employee, kept for 2 years for time cards and 3 for payroll (29 CFR 516.2, 516.5, 516.6).',
        ],
        sources: [CFR_516_2, CFR_516_5, CFR_516_6],
      },
      {
        id: 'links',
        heading: 'About the links on this page',
        paragraphs: [
          'The app names link to each vendor’s plain homepage, with no tracking code: we are not paid for them today. We have applied to some of these vendors’ affiliate programs. If one approves us, a paid link to it may appear on this page, marked as paid, with the disclosure right next to it; we would earn a commission if you sign up through it, at no cost to you. The facts in the table would not change.',
        ],
        sources: [FTC_ENDORSEMENTS],
      },
    ],
    tables: [
      appsTableOf('en', {
        heading: 'The apps side by side',
        lead: 'In the order we read them in, not an order of preference. Each row links the pricing page its facts come from.',
        caption: 'Time-tracking apps: free plan, lowest paid plan listed, GPS clock-in and payroll',
        note: 'Prices in US dollars before tax, as each vendor’s page showed them on the date read.',
      }),
    ],
    sourcesLabel: 'Sources',
    disclaimer:
      'Public facts as each vendor published them on the date read, not advice; check the vendor’s page before you buy.',
    checked: CHECKED,
    ctas: [{ label: 'Open the time card calculator', href: TIME_CARD_PATHS.en }],
    linkLabel: 'Time-tracking apps for small business, compared',
  },
  es: {
    title: 'Apps de control de horas para pequeñas empresas: planes | Cuenta Horas',
    description:
      'Clockify, Jibble, Connecteam y Deputy: plan gratis, precio pago más bajo, GPS y nómina, cada dato leído en la página de precios del proveedor el 2026-11-15.',
    kicker: 'Empleadores · comparación',
    h1: 'Apps de control de horas para pequeñas empresas: los planes, lado a lado',
    lead: 'De 4 apps de control de horas cuyas páginas de precios leímos el 2026-11-15, tres tienen plan gratis: Clockify hasta 5 usuarios, Connecteam hasta 10 y Jibble sin límite de usuarios; Deputy tiene una prueba gratis. La tabla da los datos públicos de cada una tal como los dice su propia página, sin ranking.',
    sections: [
      {
        id: 'how-we-checked',
        heading: 'Cómo leímos los datos',
        paragraphs: [
          'Cada dato de la tabla sale de la página de precios del propio proveedor, leída en la fecha de su fila; los precios están en dólares estadounidenses como los muestra la página, antes de impuestos. Los planes y precios cambian, así que revisa la página del proveedor antes de contratar.',
          'Dejamos fuera dos apps que pensábamos incluir: la página de precios de Gusto respondió a nuestro lector con una verificación antibots, que no evitamos, y 7shifts no mostraba el texto de sus planes sin ejecutar sus scripts. No clasificamos las apps ni decimos cuál te conviene: eso depende de tu equipo, tu nómina y tu estado.',
        ],
        sources: TIME_APPS.map((app) => pricingSourceOf(app, 'es')),
      },
      {
        id: 'what-to-look-for',
        heading: 'Qué mirar',
        paragraphs: [
          'El límite de usuarios del plan gratis, si tu equipo va a pasarlo. Cómo se cuenta el precio: por usuario al mes (Clockify, Deputy) o un precio fijo por los primeros usuarios (Connecteam), y si es el precio anual o el mensual. Si los trabajadores pueden registrar la entrada desde el teléfono con la ubicación o solo dentro de un área fijada (una geocerca). Y si las horas llegan a tu nómina sin volver a escribirlas.',
          'Elijas la app que elijas, los registros que pide la ley federal son los mismos: las horas trabajadas cada día y cada semana por cada empleado no exento, guardadas 2 años las tarjetas de horas y 3 la nómina (29 CFR 516.2, 516.5, 516.6).',
        ],
        sources: [CFR_516_2, CFR_516_5, CFR_516_6],
      },
      {
        id: 'links',
        heading: 'Sobre los enlaces de esta página',
        paragraphs: [
          'Los nombres de las apps enlazan a la página principal de cada proveedor, sin código de seguimiento: hoy no nos pagan por ellos. Pedimos entrar a los programas de afiliados de algunos de estos proveedores. Si uno nos aprueba, puede aparecer en esta página un enlace pagado a él, marcado como pagado y con el aviso justo al lado; ganaríamos una comisión si te registras a través de él, sin costo para ti. Los datos de la tabla no cambiarían.',
        ],
        sources: [FTC_ENDORSEMENTS],
      },
    ],
    tables: [
      appsTableOf('es', {
        heading: 'Las apps lado a lado',
        lead: 'En el orden en que las leímos, no en un orden de preferencia. Cada fila enlaza la página de precios de donde salen sus datos.',
        caption:
          'Apps de control de horas: plan gratis, plan pago más bajo publicado, entrada con GPS y nómina',
        note: 'Precios en dólares estadounidenses antes de impuestos, como los mostraba la página de cada proveedor en la fecha leída.',
      }),
    ],
    sourcesLabel: 'Fuentes',
    disclaimer:
      'Datos públicos tal como cada proveedor los publicó en la fecha leída, no una recomendación; revisa la página del proveedor antes de comprar.',
    checked: CHECKED,
    ctas: [{ label: 'Abre la calculadora de tarjeta de horas', href: TIME_CARD_PATHS.es }],
    linkLabel: 'Apps de control de horas para pequeñas empresas',
  },
};
