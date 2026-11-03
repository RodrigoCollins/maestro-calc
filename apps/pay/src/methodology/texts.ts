import type { Lang } from '../time-card/receipt.ts';
import type { Example } from './examples.ts';

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
    sourcesLabel: 'Sources',
    reviewed: 'Reviewed November 3, 2026.',
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
    sourcesLabel: 'Fuentes',
    reviewed: 'Revisado el 3 de noviembre de 2026.',
    cta: { label: 'Abrir la tarjeta de horas', href: '/es/calculadora-de-horas-trabajadas' },
  },
};
