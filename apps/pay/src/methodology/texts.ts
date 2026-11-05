import type { Lang } from '../time-card/receipt.ts';
import type {
  Example,
  HoursExample,
  OvertimeExample,
  PtoExample,
  ShiftExample,
  TippedExample,
} from './examples.ts';

export interface Source {
  readonly label: string;
  readonly href: string;
}

export interface Section {
  readonly id: string;
  readonly heading: string;
  readonly paragraphs: readonly string[];
  readonly sources: readonly Source[];
}

export interface MethodologyTexts {
  readonly title: string;
  readonly description: string;
  readonly kicker: string;
  readonly h1: string;
  readonly lead: string;
  readonly sections: readonly Section[];
  readonly examplesHeading: string;
  readonly examplesLead: string;
  readonly columns: {
    readonly week: string;
    readonly regular: string;
    readonly overtime: string;
    readonly double: string;
    readonly pay: string;
  };
  readonly examples: Readonly<Record<Example['id'], string>>;
  readonly overtimeExamplesHeading: string;
  readonly overtimeExamplesLead: string;
  readonly overtimeExamples: Readonly<Record<OvertimeExample['id'], string>>;
  readonly overtimeCta: { readonly label: string; readonly href: string };
  readonly hoursExamplesHeading: string;
  readonly hoursExamplesLead: string;
  readonly hoursColumns: { readonly hoursMinutes: string; readonly decimal: string };
  readonly hoursExamples: Readonly<Record<HoursExample['id'], string>>;
  readonly ptoExamplesHeading: string;
  readonly ptoExamplesLead: string;
  readonly ptoColumns: {
    readonly annual: string;
    readonly biweekly: string;
    readonly perHour: string;
  };
  readonly ptoExamples: Readonly<Record<PtoExample['id'], string>>;
  readonly shiftExamplesHeading: string;
  readonly shiftExamplesLead: string;
  readonly shiftColumns: {
    readonly shiftRate: string;
    readonly regularRate: string;
    readonly pay: string;
  };
  readonly shiftExamples: Readonly<Record<ShiftExample['id'], string>>;
  readonly tippedExamplesHeading: string;
  readonly tippedExamplesLead: string;
  readonly tippedColumns: {
    readonly perHour: string;
    readonly topUp: string;
    readonly totalPay: string;
  };
  readonly tippedExamples: Readonly<Record<TippedExample['id'], string>>;
  readonly sourcesLabel: string;
  readonly reviewed: string;
  readonly cta: { readonly label: string; readonly href: string };
}

const FLSA: Source = {
  label: 'U.S. Department of Labor, Fact Sheet #23: Overtime Pay Requirements of the FLSA',
  href: 'https://www.dol.gov/agencies/whd/fact-sheets/23-flsa-overtime-pay',
};
const FLSA_ES: Source = {
  label: 'Departamento de Trabajo de EE. UU., Hoja de datos #23 (horas extra bajo la FLSA)',
  href: 'https://www.dol.gov/agencies/whd/fact-sheets/23-flsa-overtime-pay/espanol',
};
const DLSE_FAQ: Source = {
  label: 'California Labor Commissioner (DLSE), Overtime FAQ',
  href: 'https://www.dir.ca.gov/dlse/faq_overtime.htm',
};
const SCHEDULE_1A: Source = {
  label: 'IRS, Schedule 1-A (Form 1040), Additional Deductions',
  href: 'https://www.irs.gov/pub/irs-pdf/f1040s1a.pdf',
};
const IRS_OVERTIME: Source = {
  label: 'IRS, questions and answers on the deduction for qualified overtime compensation',
  href: 'https://www.irs.gov/newsroom/questions-and-answers-about-the-new-deduction-for-qualified-overtime-compensation',
};
const DOL_VACATION: Source = {
  label: 'U.S. Department of Labor, Vacation Leave',
  href: 'https://www.dol.gov/general/topic/workhours/vacation_leave',
};
const DOL_VACATION_ES: Source = {
  label: 'Departamento de Trabajo de EE. UU., Vacation Leave (vacaciones, en inglés)',
  href: DOL_VACATION.href,
};
const DLSE_VACATION: Source = {
  label: 'California Labor Commissioner (DLSE), Vacation FAQ',
  href: 'https://www.dir.ca.gov/dlse/faq_vacation.htm',
};
const DLSE_VACATION_ES: Source = {
  label: 'Comisionado Laboral de California (DLSE), preguntas sobre vacaciones (en inglés)',
  href: DLSE_VACATION.href,
};
const DOL_NIGHT: Source = {
  label: 'U.S. Department of Labor, Night Work',
  href: 'https://www.dol.gov/general/topic/workhours/nightwork',
};
const DOL_NIGHT_ES: Source = {
  label: 'Departamento de Trabajo de EE. UU., Night Work (trabajo nocturno, en inglés)',
  href: DOL_NIGHT.href,
};
const ECFR_207: Source = {
  label: '29 CFR 778.207, other types of contract premium pay (shift differentials)',
  href: 'https://www.ecfr.gov/current/title-29/subtitle-B/chapter-V/subchapter-B/part-778/subpart-C/section-778.207',
};
const ECFR_207_ES: Source = {
  label: '29 CFR 778.207, primas que se incluyen en la tarifa regular (en inglés)',
  href: ECFR_207.href,
};
const ECFR_115: Source = {
  label: '29 CFR 778.115, employees working at two or more rates',
  href: 'https://www.ecfr.gov/current/title-29/subtitle-B/chapter-V/subchapter-B/part-778/subpart-C/section-778.115',
};
const ECFR_115_ES: Source = {
  label: '29 CFR 778.115, trabajo a dos o más tarifas (en inglés)',
  href: ECFR_115.href,
};
const DOL_TIPPED: Source = {
  label: 'U.S. Department of Labor, Fact Sheet #15: Tipped Employees Under the FLSA',
  href: 'https://www.dol.gov/agencies/whd/fact-sheets/15-tipped-employees-flsa',
};
const DOL_TIPPED_ES: Source = {
  label:
    'Departamento de Trabajo de EE. UU., Hoja de datos #15 (empleados que reciben propinas, en inglés)',
  href: DOL_TIPPED.href,
};
const DOL_TIPPED_STATES: Source = {
  label: 'U.S. Department of Labor, Minimum Wages for Tipped Employees (by state)',
  href: 'https://www.dol.gov/agencies/whd/state/minimum-wage/tipped',
};
const DOL_TIPPED_STATES_ES: Source = {
  label: 'Departamento de Trabajo de EE. UU., salario mínimo con propinas por estado (en inglés)',
  href: DOL_TIPPED_STATES.href,
};
const DLSE_LETTER: Source = {
  label: 'DLSE opinion letter 2000.01.19, no pyramiding of overtime hours',
  href: 'https://www.dir.ca.gov/dlse/opinions/2000-01-19.pdf',
};

export const METHODOLOGY_TEXTS: Readonly<Record<Lang, MethodologyTexts>> = {
  en: {
    title: 'How We Calculate Hours and Overtime | Cuenta Horas',
    description:
      'The rules behind the time card: how a day is counted, federal overtime after 40 hours, California daily overtime, and worked examples with their sources.',
    kicker: 'Methodology',
    h1: 'How we calculate your hours and pay',
    lead: 'Every figure on Cuenta Horas comes from the rules below. The examples at the end are run through the same calculator you use.',
    sections: [
      {
        id: 'hours',
        heading: 'How a day is counted',
        paragraphs: [
          'The hours of a day are the time from clock-in to clock-out, less the unpaid break. A shift that ends after midnight counts on the day it started.',
          'A day with only one of the two times is not counted, so a half-filled row never adds hours by mistake. A break as long as the shift, or longer, makes that day count zero and shows a warning.',
        ],
        sources: [],
      },
      {
        id: 'federal',
        heading: 'Federal rule: overtime after 40 hours in the week',
        paragraphs: [
          'Under the Fair Labor Standards Act, a covered employee is paid at least one and a half times the regular rate for every hour over 40 in a workweek. The workweek is a fixed period of seven days, and hours cannot be averaged over two or more weeks.',
          'Federal law has no daily overtime: a long day, a Saturday or a holiday is not overtime by itself. Some states, like California, add their own rules on top.',
        ],
        sources: [FLSA],
      },
      {
        id: 'california',
        heading: 'California: daily overtime and the seventh day',
        paragraphs: [
          'California Labor Code section 510 pays one and a half times the rate after 8 hours in a day, and double after 12. On the seventh consecutive day of work in the workweek, the first 8 hours are paid at one and a half and the rest at double.',
          'The weekly rule still applies, but an hour already paid as daily overtime is not counted again toward the 40. Only regular hours add up to the weekly limit; the Labor Commissioner calls this no pyramiding.',
        ],
        sources: [DLSE_FAQ, DLSE_LETTER],
      },
      {
        id: 'overtime-calculator',
        heading: 'The overtime calculator: hours by day',
        paragraphs: [
          'The overtime calculator takes the hours you worked each day, Monday to Sunday, instead of clock times, and splits them with the same federal or California rule as the time card. A day can be from 0 to 24 hours, in decimals: 8.25 is 8 hours 15 minutes.',
          'It also shows your overtime rate, 1.5 times your hourly rate, and your double-time rate, 2 times it, rounded to the cent.',
        ],
        sources: [],
      },
      {
        id: 'hours-calculator',
        heading: 'The hours calculator: one shift',
        paragraphs: [
          'The hours calculator counts one shift: the time from the start to the end, less the unpaid break, counted to the minute. An end time before the start time means the shift crosses midnight, so 10:00 pm to 6:15 am is 8 hours 15 minutes.',
          'A missing time, the same start and end, or a break as long as the shift, or longer, counts zero and shows a warning.',
        ],
        sources: [],
      },
      {
        id: 'decimal-hours',
        heading: 'Minutes and decimal hours',
        paragraphs: [
          'Decimal hours are the hours plus the minutes divided by 60: 45 minutes is 0.75 hours, and 8 hours 20 minutes is 8.33 hours. The calculators keep the exact fraction and round only what they show, to two places, to the nearest.',
          'Decimal hours read back to the nearest whole minute: 7.75 hours is 7 hours 45 minutes. Your employer’s payroll system may round in another way, so its figure can differ by a minute or a cent.',
        ],
        sources: [],
      },
      {
        id: 'pto-accrual',
        heading: 'PTO accrual: paid time off per paycheck',
        paragraphs: [
          'The PTO accrual calculator multiplies the paid days off a year by the hours of a day off, then divides by the pay periods of the year: 52 weeks, 26 two-week periods, 24 half months or 12 months. 10 days of 8 hours are 80 hours, or 3.08 hours every two weeks.',
          'The rate per hour worked divides the same hours by the hours worked in 52 weeks: 80 hours over 40 × 52 = 2,080 hours is 0.0385 hours per hour worked, or 1 hour off for every 26 hours worked. Figures are rounded to two places and the rate to four.',
          'The Fair Labor Standards Act does not require paid vacation; it is a matter of agreement with the employer. In California, vacation is a form of wages earned as you work: a use-it-or-lose-it policy is illegal, a reasonable cap is allowed, and unused vacation is paid at the final rate when the job ends (Labor Code section 227.3).',
        ],
        sources: [DOL_VACATION, DLSE_VACATION],
      },
      {
        id: 'shift-differential',
        heading: 'Shift differential: nights in the regular rate',
        paragraphs: [
          'The shift differential calculator adds to the base rate a percent of it or a flat amount an hour. At $20 an hour, 10% makes $22 on the shift; 24 hours at $20 and 16 at $22 are $832 for 40 hours.',
          'Over 40 hours in the week, the regular rate is the weighted average of the two rates: the pay before overtime divided by all the hours (29 CFR 778.115), and the differential is part of it (29 CFR 778.207(b)). 24 + 24 hours pay $480 + $528 = $1,008; $1,008 / 48 = $21.00 an hour, and each of the 8 hours over 40 adds half of it, $10.50: $84, for $1,092. Paying the overtime at 1.5 × $20 would come up short.',
          'The FLSA does not require extra pay for night or weekend work; it is a matter of agreement with the employer. Pay is rounded to the cent and the calculator uses the federal 40-hour week.',
        ],
        sources: [DOL_NIGHT, ECFR_207, ECFR_115],
      },
      {
        id: 'tipped-wage',
        heading: 'Tipped wage: the tip credit and the top-up',
        paragraphs: [
          'The tipped wage calculator adds the cash wage of the week and the tips, and divides by the hours. Under the FLSA an employer that counts tips toward the minimum wage pays a cash wage of at least $2.13 an hour and takes a tip credit of at most $5.12, the gap to the $7.25 federal minimum, and never more than the tips the employee got.',
          'Cash wage and tips must reach $7.25 an hour over the workweek; when they do not, the employer makes up the difference. At $2.13, 40 hours pay $85.20; with $150 in tips the week is $235.20, short of 40 × $7.25 = $290 by $54.80, which the employer owes.',
          'Overtime is figured on the full $7.25, not on the cash wage, and the tip credit is no larger in the hours over 40: each one adds half of $7.25, $3.625, paid by the employer. 44 hours at $2.13 with $300 in tips are $93.72 + $14.50 + $300 = $408.22. A cash wage of $7.25 or more takes no tip credit and is the rate the overtime is figured on; tips never enter it.',
          'States can require more: a higher minimum wage, a higher cash wage, or no tip credit at all. The calculator uses the federal rules; the DOL table lists the rules of each state. Pay is rounded to the cent.',
        ],
        sources: [DOL_TIPPED, DOL_TIPPED_STATES],
      },
      {
        id: 'pay',
        heading: 'From hours to pay',
        paragraphs: [
          'Regular hours are paid at your hourly rate, overtime hours at 1.5 times and double time at 2 times. The calculator keeps exact fractions until the end and rounds only the money to the cent; hours are shown with up to two decimals.',
        ],
        sources: [],
      },
      {
        id: 'salary',
        heading: 'Hourly pay and salary',
        paragraphs: [
          'Weekly pay is the hourly rate times the hours a week; every two weeks is twice that; the year is the weekly pay times the paid weeks. A month is the year divided by 12, and twice a month the year divided by 24, which is why a monthly check is not four weekly ones.',
          'From a salary the same steps run backwards: the yearly pay divided by the paid weeks and by the hours a week gives the hourly rate. Overtime is not included.',
        ],
        sources: [],
      },
      {
        id: 'deductions',
        heading: 'No tax on overtime and no tax on tips',
        paragraphs: [
          'For tax years 2025 through 2028, Schedule 1-A lets you deduct the qualified overtime pay, which is only the half of time and a half that the FLSA requires, up to $12,500 ($25,000 on a joint return), and qualified tips up to $25,000 on any return.',
          'Both shrink by $100 for each full $1,000 of modified adjusted gross income over $150,000 ($300,000 joint), never below zero; a part of a $1,000 does not count. The savings we show are the deduction times the bracket you pick, an estimate and not your tax.',
        ],
        sources: [SCHEDULE_1A, IRS_OVERTIME],
      },
      {
        id: 'limits',
        heading: 'What the calculator does not do',
        paragraphs: [
          'It shows gross pay, before taxes and deductions. It uses your hourly rate as the regular rate; under the FLSA, bonuses and commissions can raise the regular rate, so a paycheck with them can be higher.',
          'It treats Monday to Sunday as the workweek. If your employer starts the week on another day, the split between weeks can change. It does not decide whether a job is exempt from overtime.',
        ],
        sources: [],
      },
    ],
    examplesHeading: 'Worked examples',
    examplesLead: 'Each example is a week run through the time card at $22 an hour.',
    columns: {
      week: 'Week',
      regular: 'Regular h',
      overtime: 'Overtime h',
      double: 'Double h',
      pay: 'Gross pay',
    },
    examples: {
      'federal-week': 'Federal: Mon-Fri 9 h, Sat 4.5 h (49.5 h)',
      'california-long-day': 'California: the same week with a 13 h Monday',
      'california-ten-hour-days': 'California: 10 h a day, Mon-Fri (DLSE letter)',
      'california-seventh-day': 'California: 9 h every day, seven days',
    },
    overtimeExamplesHeading: 'Overtime calculator examples',
    overtimeExamplesLead:
      'Each example is the hours of each day run through the overtime calculator at $22 an hour.',
    overtimeExamples: {
      'four-tens-federal': 'Federal: 10 h a day, Mon-Thu (40 h)',
      'four-tens-california': 'California: the same four 10 h days',
      'long-day-california': 'California: a 13 h Monday, then 8 h Tue-Fri',
    },
    overtimeCta: { label: 'Open the overtime calculator', href: '/overtime-calculator' },
    hoursExamplesHeading: 'Hours and decimal hours examples',
    hoursExamplesLead:
      'Each example is run through the hours calculator or the minutes to decimal hours converter.',
    hoursColumns: { hoursMinutes: 'Hours and minutes', decimal: 'Decimal hours' },
    hoursExamples: {
      'day-shift': 'Hours: 9:00 am to 5:30 pm, 30 min break',
      'night-shift': 'Hours: 10:00 pm to 6:15 am, across midnight',
      'eight-twenty': 'Decimal: 8 h 20 min',
      'forty-five': 'Decimal: 45 min',
      'seven-seventy-five': 'Back to minutes: 7.75 h',
    },
    ptoExamplesHeading: 'PTO accrual examples',
    ptoExamplesLead: 'Each example is run through the PTO accrual calculator over 52 weeks.',
    ptoColumns: {
      annual: 'PTO hours a year',
      biweekly: 'Every two weeks',
      perHour: 'Per hour worked',
    },
    ptoExamples: {
      'two-weeks': '10 days of 8 h, 40 h a week',
      'three-weeks': '15 days of 8 h, 40 h a week',
      'part-time': '10 days of 6 h, 30 h a week',
      'four-weeks': '20 days of 8 h, 40 h a week',
    },
    shiftExamplesHeading: 'Shift differential examples',
    shiftExamplesLead:
      'Each example is run through the shift differential calculator at $20 an hour.',
    shiftColumns: {
      shiftRate: 'Shift rate',
      regularRate: 'Regular rate',
      pay: 'Pay of the week',
    },
    shiftExamples: {
      'ten-percent': '10% more, 24 h base and 16 h on the shift',
      'ten-percent-overtime': '10% more, 24 h base and 24 h on the shift',
      'dollar-fifty': '$1.50 more an hour, 24 h base and 16 h on the shift',
      'nights-overtime': '$2 more an hour, 45 h all on the shift',
    },
    tippedExamplesHeading: 'Tipped wage examples',
    tippedExamplesLead:
      'Each example is run through the tipped wage calculator at the federal cash wage of $2.13.',
    tippedColumns: {
      perHour: 'Pay per hour',
      topUp: 'Top-up owed',
      totalPay: 'Pay of the week',
    },
    tippedExamples: {
      'good-week': '40 h with $250 in tips',
      'slow-week': '40 h with $150 in tips',
      overtime: '44 h with $300 in tips',
      'slow-overtime': '44 h with $100 in tips',
    },
    sourcesLabel: 'Sources',
    reviewed: 'Reviewed November 5, 2026.',
    cta: { label: 'Open the time card', href: '/time-card-calculator' },
  },
  es: {
    title: 'Cómo Calculamos las Horas y las Horas Extra | Cuenta Horas',
    description:
      'Las reglas detrás de la tarjeta de horas: cómo se cuenta un día, las horas extra federales después de 40, las de California por día y ejemplos con sus fuentes.',
    kicker: 'Metodología',
    h1: 'Cómo calculamos tus horas y tu pago',
    lead: 'Cada número de Cuenta Horas sale de las reglas de abajo. Los ejemplos del final pasan por la misma calculadora que usas tú.',
    sections: [
      {
        id: 'hours',
        heading: 'Cómo se cuenta un día',
        paragraphs: [
          'Las horas de un día son el tiempo entre la entrada y la salida, menos el descanso sin pago. Un turno que termina después de la medianoche cuenta en el día en que empezó.',
          'Un día con solo una de las dos horas no se cuenta, así una fila a medio llenar nunca suma horas por error. Un descanso tan largo como el turno, o más, hace que ese día cuente cero y muestra un aviso.',
        ],
        sources: [],
      },
      {
        id: 'federal',
        heading: 'Regla federal: horas extra después de 40 en la semana',
        paragraphs: [
          'Bajo la Ley de Normas Razonables de Trabajo (FLSA), a un empleado cubierto se le paga al menos una vez y media su tarifa regular por cada hora después de 40 en la semana laboral. La semana laboral es un período fijo de siete días, y las horas no se pueden promediar entre dos o más semanas.',
          'La ley federal no tiene horas extra por día: un día largo, un sábado o un feriado no son horas extra por sí solos. Algunos estados, como California, suman sus propias reglas.',
        ],
        sources: [FLSA_ES],
      },
      {
        id: 'california',
        heading: 'California: horas extra por día y el séptimo día',
        paragraphs: [
          'La sección 510 del Código Laboral de California paga una vez y media la tarifa después de 8 horas en un día, y el doble después de 12. El séptimo día seguido de trabajo en la semana, las primeras 8 horas se pagan a una vez y media y el resto al doble.',
          'La regla semanal sigue valiendo, pero una hora ya pagada como extra del día no se vuelve a contar para las 40. Solo las horas regulares suman al límite semanal; el Comisionado Laboral lo llama no piramidar.',
        ],
        sources: [DLSE_FAQ, DLSE_LETTER],
      },
      {
        id: 'overtime-calculator',
        heading: 'La calculadora de horas extra: horas por día',
        paragraphs: [
          'La calculadora de horas extra toma las horas que trabajaste cada día, de lunes a domingo, en vez de la hora de entrada y salida, y las reparte con la misma regla federal o de California que la tarjeta de horas. Un día puede tener de 0 a 24 horas, con decimales: 8.25 son 8 horas y 15 minutos.',
          'También muestra tu tarifa de hora extra, 1.5 veces tu pago por hora, y tu tarifa de hora doble, 2 veces, redondeadas al centavo.',
        ],
        sources: [],
      },
      {
        id: 'hours-calculator',
        heading: 'La calculadora de horas: un turno',
        paragraphs: [
          'La calculadora de horas cuenta un turno: el tiempo de la entrada a la salida, menos el descanso sin pago, contado al minuto. Si la hora de salida es antes que la de entrada, el turno cruza la medianoche: de 10:00 pm a 6:15 am son 8 horas y 15 minutos.',
          'Si falta una hora, si la entrada y la salida son la misma, o si el descanso dura lo mismo que el turno o más, cuenta cero y muestra un aviso.',
        ],
        sources: [],
      },
      {
        id: 'decimal-hours',
        heading: 'Minutos y horas decimales',
        paragraphs: [
          'Las horas decimales son las horas más los minutos divididos por 60: 45 minutos son 0.75 horas, y 8 horas y 20 minutos son 8.33 horas. Las calculadoras guardan la fracción exacta y solo redondean lo que muestran, a dos decimales, al más cercano.',
          'Las horas decimales se leen al minuto entero más cercano: 7.75 horas son 7 horas y 45 minutos. El sistema de nómina de tu empleador puede redondear de otra forma, así que su número puede variar por un minuto o un centavo.',
        ],
        sources: [],
      },
      {
        id: 'pto-accrual',
        heading: 'Vacaciones pagadas (PTO): cuánto ganas por cheque',
        paragraphs: [
          'La calculadora de vacaciones pagadas multiplica los días libres pagados del año por las horas de un día libre, y divide por los períodos de pago del año: 52 semanas, 26 períodos de dos semanas, 24 quincenas o 12 meses. 10 días de 8 horas son 80 horas, o 3.08 horas cada dos semanas.',
          'La tasa por hora trabajada divide las mismas horas por las horas trabajadas en 52 semanas: 80 horas sobre 40 × 52 = 2,080 horas son 0.0385 horas por hora trabajada, o 1 hora libre por cada 26 horas de trabajo. Las cifras se redondean a dos decimales y la tasa a cuatro.',
          'La Ley de Normas Justas de Trabajo (FLSA) no exige vacaciones pagadas; es un acuerdo con el empleador. En California, las vacaciones son una forma de salario que se gana al trabajar: una política de "úsalas o piérdelas" es ilegal, un tope razonable está permitido, y las vacaciones no usadas se pagan a la última tarifa cuando termina el trabajo (Código Laboral, sección 227.3).',
        ],
        sources: [DOL_VACATION_ES, DLSE_VACATION_ES],
      },
      {
        id: 'shift-differential',
        heading: 'Diferencial de turno: la noche en la tarifa regular',
        paragraphs: [
          'La calculadora de diferencial de turno suma a la tarifa base un porcentaje de ella o un monto fijo por hora. A $20 la hora, un 10% da $22 en el turno; 24 horas a $20 y 16 a $22 son $832 por 40 horas.',
          'Después de 40 horas en la semana, la tarifa regular es el promedio ponderado de las dos tarifas: el pago sin horas extra dividido por todas las horas (29 CFR 778.115), y el diferencial se incluye en ella (29 CFR 778.207(b)). 24 + 24 horas pagan $480 + $528 = $1,008; $1,008 / 48 = $21.00 la hora, y las 8 horas después de 40 suman cada una la mitad, $10.50: $84, para $1,092. Pagar las extra a 1.5 × $20 se quedaría corto.',
          'La FLSA no exige pago extra por trabajar de noche ni en fin de semana; es un acuerdo con el empleador. El pago se redondea al centavo y la calculadora usa la semana federal de 40 horas.',
        ],
        sources: [DOL_NIGHT_ES, ECFR_207_ES, ECFR_115_ES],
      },
      {
        id: 'tipped-wage',
        heading: 'Propinas por hora: el crédito por propinas y lo que se completa',
        paragraphs: [
          'La calculadora de propinas por hora suma el salario en efectivo de la semana y las propinas, y divide por las horas. Según la FLSA, el empleador que cuenta las propinas para el salario mínimo paga un salario en efectivo de al menos $2.13 la hora y toma un crédito por propinas de como máximo $5.12, lo que falta hasta el mínimo federal de $7.25, y nunca más que las propinas que recibió el empleado.',
          'El salario en efectivo y las propinas deben llegar a $7.25 la hora en la semana laboral; si no llegan, el empleador completa la diferencia. A $2.13, 40 horas pagan $85.20; con $150 de propinas la semana suma $235.20, y faltan $54.80 para 40 × $7.25 = $290, que debe el empleador.',
          'Las horas extra se calculan sobre los $7.25 completos, no sobre el salario en efectivo, y el crédito por propinas no crece en las horas después de 40: cada una suma la mitad de $7.25, $3.625, que paga el empleador. 44 horas a $2.13 con $300 de propinas son $93.72 + $14.50 + $300 = $408.22. Un salario en efectivo de $7.25 o más no toma crédito por propinas y es la tarifa de las horas extra; las propinas nunca entran en ella.',
          'Los estados pueden exigir más: un salario mínimo más alto, un salario en efectivo más alto o ningún crédito por propinas. La calculadora usa las reglas federales; la tabla del DOL muestra las reglas de cada estado. El pago se redondea al centavo.',
        ],
        sources: [DOL_TIPPED_ES, DOL_TIPPED_STATES_ES],
      },
      {
        id: 'pay',
        heading: 'De las horas al pago',
        paragraphs: [
          'Las horas regulares se pagan a tu tarifa por hora, las extra a 1.5 veces y las dobles a 2 veces. La calculadora usa fracciones exactas hasta el final y solo redondea el dinero al centavo; las horas se muestran con hasta dos decimales.',
        ],
        sources: [],
      },
      {
        id: 'salary',
        heading: 'Pago por hora y sueldo',
        paragraphs: [
          'El pago semanal es la tarifa por hora por las horas de la semana; cada dos semanas es el doble; el año es el pago semanal por las semanas pagadas. Un mes es el año dividido por 12, y dos veces al mes el año dividido por 24; por eso un cheque mensual no son cuatro semanales.',
          'Desde un sueldo se hacen los mismos pasos al revés: el pago del año dividido por las semanas pagadas y por las horas de la semana da la tarifa por hora. No incluye horas extra.',
        ],
        sources: [],
      },
      {
        id: 'deductions',
        heading: 'Horas extra y propinas sin impuestos',
        paragraphs: [
          'Para los años fiscales 2025 a 2028, el Schedule 1-A te deja deducir el pago calificado de horas extra, que es solo la mitad del tiempo y medio que exige la FLSA, hasta $12,500 ($25,000 en una declaración conjunta), y las propinas calificadas hasta $25,000 en cualquier declaración.',
          'Las dos bajan $100 por cada $1,000 completos de ingreso bruto ajustado modificado por encima de $150,000 ($300,000 en conjunta), nunca por debajo de cero; una parte de $1,000 no cuenta. El ahorro que mostramos es la deducción por el tramo que eliges, una estimación y no tu impuesto.',
        ],
        sources: [SCHEDULE_1A, IRS_OVERTIME],
      },
      {
        id: 'limits',
        heading: 'Lo que la calculadora no hace',
        paragraphs: [
          'Muestra el pago bruto, antes de impuestos y descuentos. Usa tu pago por hora como tarifa regular; bajo la FLSA, los bonos y las comisiones pueden subir la tarifa regular, así que un cheque con ellos puede ser mayor.',
          'Toma la semana de lunes a domingo. Si tu empleador empieza la semana otro día, el reparto entre semanas puede cambiar. No decide si un trabajo está exento de horas extra.',
        ],
        sources: [],
      },
    ],
    examplesHeading: 'Ejemplos resueltos',
    examplesLead: 'Cada ejemplo es una semana pasada por la tarjeta de horas a $22 la hora.',
    columns: {
      week: 'Semana',
      regular: 'Horas regulares',
      overtime: 'Horas extra',
      double: 'Horas dobles',
      pay: 'Pago bruto',
    },
    examples: {
      'federal-week': 'Federal: lun-vie 9 h, sáb 4.5 h (49.5 h)',
      'california-long-day': 'California: la misma semana con un lunes de 13 h',
      'california-ten-hour-days': 'California: 10 h por día, lun-vie (carta de la DLSE)',
      'california-seventh-day': 'California: 9 h todos los días, siete días',
    },
    overtimeExamplesHeading: 'Ejemplos de la calculadora de horas extra',
    overtimeExamplesLead:
      'Cada ejemplo son las horas de cada día pasadas por la calculadora de horas extra a $22 la hora.',
    overtimeExamples: {
      'four-tens-federal': 'Federal: 10 h por día, lun-jue (40 h)',
      'four-tens-california': 'California: los mismos cuatro días de 10 h',
      'long-day-california': 'California: un lunes de 13 h y 8 h de mar a vie',
    },
    overtimeCta: {
      label: 'Abrir la calculadora de horas extra',
      href: '/es/calculadora-de-horas-extra',
    },
    hoursExamplesHeading: 'Ejemplos de horas y horas decimales',
    hoursExamplesLead:
      'Cada ejemplo pasa por la calculadora de horas o por el convertidor de minutos a horas decimales.',
    hoursColumns: { hoursMinutes: 'Horas y minutos', decimal: 'Horas decimales' },
    hoursExamples: {
      'day-shift': 'Horas: de 9:00 am a 5:30 pm, descanso de 30 min',
      'night-shift': 'Horas: de 10:00 pm a 6:15 am, cruzando la medianoche',
      'eight-twenty': 'Decimales: 8 h 20 min',
      'forty-five': 'Decimales: 45 min',
      'seven-seventy-five': 'De vuelta a minutos: 7.75 h',
    },
    ptoExamplesHeading: 'Ejemplos de vacaciones pagadas (PTO)',
    ptoExamplesLead:
      'Cada ejemplo pasa por la calculadora de vacaciones pagadas, sobre 52 semanas.',
    ptoColumns: {
      annual: 'Horas de PTO al año',
      biweekly: 'Cada dos semanas',
      perHour: 'Por hora trabajada',
    },
    ptoExamples: {
      'two-weeks': '10 días de 8 h, 40 h a la semana',
      'three-weeks': '15 días de 8 h, 40 h a la semana',
      'part-time': '10 días de 6 h, 30 h a la semana',
      'four-weeks': '20 días de 8 h, 40 h a la semana',
    },
    shiftExamplesHeading: 'Ejemplos de diferencial de turno',
    shiftExamplesLead:
      'Cada ejemplo pasa por la calculadora de diferencial de turno, a $20 la hora.',
    shiftColumns: {
      shiftRate: 'Tarifa del turno',
      regularRate: 'Tarifa regular',
      pay: 'Pago de la semana',
    },
    shiftExamples: {
      'ten-percent': '10% más, 24 h base y 16 h en el turno',
      'ten-percent-overtime': '10% más, 24 h base y 24 h en el turno',
      'dollar-fifty': '$1.50 más por hora, 24 h base y 16 h en el turno',
      'nights-overtime': '$2 más por hora, 45 h todas en el turno',
    },
    tippedExamplesHeading: 'Ejemplos de propinas por hora',
    tippedExamplesLead:
      'Cada ejemplo pasa por la calculadora de propinas por hora, con el salario federal en efectivo de $2.13.',
    tippedColumns: {
      perHour: 'Pago por hora',
      topUp: 'Lo que debe completar',
      totalPay: 'Pago de la semana',
    },
    tippedExamples: {
      'good-week': '40 h con $250 de propinas',
      'slow-week': '40 h con $150 de propinas',
      overtime: '44 h con $300 de propinas',
      'slow-overtime': '44 h con $100 de propinas',
    },
    sourcesLabel: 'Fuentes',
    reviewed: 'Revisado el 5 de noviembre de 2026.',
    cta: { label: 'Abrir la tarjeta de horas', href: '/es/calculadora-de-horas-trabajadas' },
  },
};
