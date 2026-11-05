import { Rational, scaleMoney, subMoney, usd, type Money } from '@maestro-calc/core';
import { tippedWage } from '@maestro-calc/pay-core/tipped-wage';
import { hoursText, moneyText } from '../format.ts';
import type { CommonLinks } from '../long-tail/jobs.ts';
import { tippedLinksOf } from '../long-tail/tipped.ts';
import { TIPPED_PATHS } from '../tipped/texts.ts';
import type { Lang } from '../time-card/receipt.ts';
import { OVERTIME_GUIDE_PATHS } from './overtime.ts';
import { PAY_STUB_GUIDE_PATHS } from './paths.ts';
import type { GuideSource, GuideTexts } from './texts.ts';

export { TIP_CREDIT_GUIDE_PATHS } from './paths.ts';

/** The figures of one worked week, each written as the tipped wage calculator writes it. */
export interface TippedFigures {
  readonly wages: string;
  readonly tipCredit: string;
  readonly topUp: string;
  readonly overtimeHours: string;
  readonly overtimePremium: string;
  readonly totalPay: string;
  readonly perHour: string;
}

interface TippedWeek {
  readonly id: 'covered' | 'top-up' | 'overtime';
  /** The raw fields of the calculator, as a shared link would carry them. */
  readonly inputs: Readonly<Record<string, string>>;
}

const WEEKS: readonly TippedWeek[] = [
  // the calculator's default week: $2.13 an hour, $250 in tips, 40 hours
  { id: 'covered', inputs: {} },
  { id: 'top-up', inputs: { tips: '150' } },
  { id: 'overtime', inputs: { tips: '300', hours: '44' } },
];

const outputsOf = (inputs: Readonly<Record<string, string>>): ReadonlyMap<string, unknown> => {
  const ran = tippedWage.run(inputs);
  if (!ran.ok) throw new Error(`the tipped week ${JSON.stringify(inputs)} must run`);
  return new Map(ran.value.outputs.map(({ key, value }) => [key, value as unknown]));
};

const moneyOf = (out: ReadonlyMap<string, unknown>, key: string): Money => {
  const found = out.get(key);
  if (typeof found !== 'object' || found === null || !('currency' in found)) {
    throw new Error(`no tipped money output ${key}`);
  }
  return found as Money;
};

const figuresOf = (inputs: Readonly<Record<string, string>>): TippedFigures => {
  const out = outputsOf(inputs);
  const hours = out.get('overtimeHours');
  if (!(hours instanceof Rational)) throw new Error('no tipped hours output overtimeHours');
  return {
    wages: moneyText(moneyOf(out, 'wages')),
    tipCredit: moneyText(moneyOf(out, 'tipCredit')),
    topUp: moneyText(moneyOf(out, 'topUp')),
    overtimeHours: hoursText(hours),
    overtimePremium: moneyText(moneyOf(out, 'overtimePremium')),
    totalPay: moneyText(moneyOf(out, 'totalPay')),
    perHour: moneyText(moneyOf(out, 'perHour')),
  };
};

/** The weeks the guide works out, every figure from the tipped wage calculator at build. */
export const TIP_CREDIT_GUIDE_EXAMPLES: readonly (TippedWeek & {
  readonly figures: TippedFigures;
})[] = WEEKS.map((week) => ({ ...week, figures: figuresOf(week.inputs) }));

const exampleOf = (id: TippedWeek['id']): TippedFigures => {
  const found = TIP_CREDIT_GUIDE_EXAMPLES.find((each) => each.id === id);
  if (found === undefined) throw new Error(`no tipped example ${id}`);
  return found.figures;
};

/**
 * The 44-hour week with the overtime figured on the $2.13 cash wage instead of the $7.25 minimum
 * (half of $2.13 for each hour over 40): the premium it gives and how much less than the right one.
 */
export const TIP_CREDIT_GUIDE_CASH_WAGE_OVERTIME = ((): {
  readonly overtimePremium: string;
  readonly short: string;
} => {
  const right = outputsOf({ tips: '300', hours: '44' });
  const overtimeHours = right.get('overtimeHours');
  if (!(overtimeHours instanceof Rational)) throw new Error('no tipped overtime hours');
  const wrong = scaleMoney(usd(Rational.of(213, 100)), overtimeHours.mul(Rational.of(1, 2)));
  return {
    overtimePremium: moneyText(wrong),
    short: moneyText(subMoney(moneyOf(right, 'overtimePremium'), wrong)),
  };
})();

/** The tipped wage pages the guide lists under its body, in each language. */
export const TIP_CREDIT_GUIDE_LINKS: Readonly<Record<Lang, CommonLinks>> = {
  en: tippedLinksOf('en'),
  es: tippedLinksOf('es'),
};

const covered = exampleOf('covered');
const topUp = exampleOf('top-up');
const overtime = exampleOf('overtime');
const onCash = TIP_CREDIT_GUIDE_CASH_WAGE_OVERTIME;

const FACT_SHEET_15: GuideSource = {
  label: 'U.S. Department of Labor, Fact Sheet #15: Tipped Employees Under the FLSA',
  href: 'https://www.dol.gov/agencies/whd/fact-sheets/15-tipped-employees-flsa',
};
const ECFR_50: GuideSource = {
  label: '29 CFR 531.50, Statutory provisions with respect to tipped employees (eCFR)',
  href: 'https://www.ecfr.gov/current/title-29/subtitle-B/chapter-V/subchapter-A/part-531/subpart-D/section-531.50',
};
const ECFR_52: GuideSource = {
  label: '29 CFR 531.52, General restrictions on an employer’s use of its employees’ tips (eCFR)',
  href: 'https://www.ecfr.gov/current/title-29/subtitle-B/chapter-V/subchapter-A/part-531/subpart-D/section-531.52',
};
const ECFR_59: GuideSource = {
  label: '29 CFR 531.59, The tip wage credit (eCFR)',
  href: 'https://www.ecfr.gov/current/title-29/subtitle-B/chapter-V/subchapter-A/part-531/subpart-D/section-531.59',
};
const ECFR_60: GuideSource = {
  label: '29 CFR 531.60, Overtime payments (eCFR)',
  href: 'https://www.ecfr.gov/current/title-29/subtitle-B/chapter-V/subchapter-A/part-531/subpart-D/section-531.60',
};
const DOL_STATE_TABLE: GuideSource = {
  label: 'U.S. Department of Labor, Minimum Wages for Tipped Employees (table by state)',
  href: 'https://www.dol.gov/agencies/whd/state/minimum-wage/tipped',
};

export const TIP_CREDIT_GUIDE: Readonly<Record<Lang, GuideTexts>> = {
  en: {
    title: 'Tipped Minimum Wage and the Tip Credit | Cuenta Horas',
    description:
      'The $2.13 cash wage, the $5.12 tip credit and when your employer must top you up to $7.25 an hour. Overtime for tipped workers, with worked weeks.',
    kicker: 'Tipped pay · guide',
    h1: 'Tipped minimum wage and the tip credit: when your employer must top up',
    lead: 'If you earn tips, your employer may pay you less than the minimum wage in cash and count part of your tips toward it. This guide shows what federal law allows, what your employer must tell you first, when it has to make up the difference, and how your overtime is figured.',
    sections: [
      {
        id: 'cash-wage-and-tip-credit',
        heading: '$2.13 in cash, $7.25 in all',
        paragraphs: [
          'Under the Fair Labor Standards Act (FLSA), an employer must pay a tipped worker a cash wage of at least $2.13 an hour and may count the worker’s tips toward the rest of the $7.25 federal minimum wage. The part the tips cover is the tip credit: at most $5.12 an hour ($7.25 − $2.13), as DOL Fact Sheet #15 puts it.',
          'A tipped employee is one in an occupation in which they customarily and regularly receive more than $30 a month in tips (29 CFR 531.50). The credit can be smaller than $5.12, never larger, and never more than the tips you actually got (29 CFR 531.59).',
        ],
        sources: [FACT_SHEET_15, ECFR_50, ECFR_59],
      },
      {
        id: 'notice',
        heading: 'Your employer must tell you first',
        paragraphs: [
          'An employer cannot take the tip credit unless it has told you in advance: the cash wage it will pay you, the tip credit it claims (no more than the tips you actually receive), that you keep all your tips except in a tip pool limited to employees who customarily and regularly receive tips, and that the tip credit does not apply to an employee who has not been told these things (29 CFR 531.59(b)).',
          'Without that notice, the tip credit does not apply, and the employer owes the full minimum wage in cash.',
        ],
        sources: [ECFR_59, FACT_SHEET_15],
      },
      {
        id: 'top-up',
        heading: 'When the tips fall short, the employer makes up the difference',
        paragraphs: [
          'The check is made over each workweek: if your cash wage and your tips together do not reach $7.25 an hour for the week, the employer must make up the difference (Fact Sheet #15). To claim the full credit, the employer must show you got at least that much in tips; if you got less, it pays the balance so you earn at least the minimum wage (29 CFR 531.59(b)).',
          'Your tips are yours: the FLSA does not let an employer keep any part of them, and managers and supervisors may not keep any either, whether or not the employer takes a tip credit (29 CFR 531.52).',
        ],
        sources: [FACT_SHEET_15, ECFR_59, ECFR_52],
      },
      {
        id: 'overtime',
        heading: 'Overtime is figured on the full $7.25',
        paragraphs: [
          'For a tipped worker the overtime rate is not figured on the $2.13 cash wage: Fact Sheet #15 says overtime must be calculated on the full minimum wage, currently $7.25 an hour. Your regular rate includes the tip credit the employer takes and your cash wage; the tips above the tip credit do not count in it (29 CFR 531.60).',
          'So each hour over 40 in a workweek adds half of $7.25, which the employer pays on top of the cash wage.',
        ],
        sources: [FACT_SHEET_15, ECFR_60],
      },
      {
        id: 'worked-examples',
        heading: 'Worked examples',
        paragraphs: [
          `Tips cover the credit: 40 hours at $2.13 pay ${covered.wages} in cash wages. With $250 in tips, the employer takes a tip credit of ${covered.tipCredit} (40 × $5.12), owes a top-up of ${covered.topUp}, and with ${covered.overtimeHours} hours over 40 the overtime premium is ${covered.overtimePremium}. The week pays ${covered.totalPay}, or ${covered.perHour} an hour.`,
          `Tips fall short: 40 hours at $2.13 pay ${topUp.wages}, but the tips are only $150, so the tip credit is ${topUp.tipCredit} and the employer owes a top-up of ${topUp.topUp}. With ${topUp.overtimeHours} hours over 40 (overtime premium ${topUp.overtimePremium}), the week pays ${topUp.totalPay}: ${topUp.perHour} an hour, the minimum wage.`,
          `A week with overtime: 44 hours at $2.13 pay ${overtime.wages}. With $300 in tips the tip credit is ${overtime.tipCredit} and the top-up ${overtime.topUp}. Each of the ${overtime.overtimeHours} hours over 40 adds half of $7.25, an overtime premium of ${overtime.overtimePremium}, and the week pays ${overtime.totalPay}, or ${overtime.perHour} an hour.`,
          `If that overtime were figured on the $2.13 cash wage, the 4 hours over 40 would add only ${onCash.overtimePremium}: ${onCash.short} less than the law requires.`,
          'These figures come from the tipped wage calculator; enter your own cash wage, tips and hours there to see your week.',
        ],
        sources: [FACT_SHEET_15, ECFR_59, ECFR_60],
      },
      {
        id: 'states',
        heading: 'Check your state',
        paragraphs: [
          'These are the federal rules. When state law differs, the employer must follow the standard that protects the employee most (Fact Sheet #15). Many states set a higher minimum wage or a higher cash wage, and some require the full state minimum wage before tips, with no tip credit at all.',
          'The U.S. Department of Labor keeps a table of the minimum cash wage and the tip credit of each state; check your state there, and with its labor department.',
        ],
        sources: [DOL_STATE_TABLE, FACT_SHEET_15],
      },
    ],
    sourcesLabel: 'Sources',
    disclaimer:
      'A guide to what these rules and agencies publish, not legal advice. For your own case, check your state’s labor department.',
    reviewed: 'Checked against the eCFR and Department of Labor pages on November 5, 2026.',
    ctas: [
      { label: 'Open the tipped wage calculator', href: TIPPED_PATHS.en },
      { label: 'How overtime is calculated', href: OVERTIME_GUIDE_PATHS.federal.en },
      { label: 'How to read your pay stub', href: PAY_STUB_GUIDE_PATHS.en },
    ],
    linkLabel: 'When must your employer top up your tips?',
  },
  es: {
    title: 'Salario mínimo con propinas y crédito por propinas | Cuenta Horas',
    description:
      'El salario en efectivo de $2.13, el crédito por propinas de $5.12 y cuándo tu empleador debe completar $7.25 la hora. Horas extra con propinas, con ejemplos.',
    kicker: 'Pago con propinas · guía',
    h1: 'Salario mínimo con propinas y el crédito por propinas: cuándo tu empleador debe completar',
    lead: 'Si recibes propinas, tu empleador puede pagarte en efectivo menos que el salario mínimo y contar parte de tus propinas para llegar a él. Esta guía muestra qué permite la ley federal, qué debe avisarte tu empleador antes, cuándo tiene que completar la diferencia y cómo se calculan tus horas extra.',
    sections: [
      {
        id: 'salario-en-efectivo-y-credito',
        heading: '$2.13 en efectivo, $7.25 en total',
        paragraphs: [
          'Según la Ley de Normas Justas de Trabajo (FLSA), el empleador debe pagarle a quien recibe propinas un salario en efectivo de al menos $2.13 la hora y puede contar las propinas para el resto del salario mínimo federal de $7.25. La parte que cubren las propinas es el crédito por propinas: como máximo $5.12 la hora ($7.25 − $2.13), según la Fact Sheet #15 del Departamento de Trabajo.',
          'Un empleado con propinas es quien trabaja en una ocupación en la que recibe de forma habitual y regular más de $30 al mes en propinas (29 CFR 531.50). El crédito puede ser menor que $5.12, nunca mayor, y nunca más que las propinas que de verdad recibiste (29 CFR 531.59).',
        ],
        sources: [FACT_SHEET_15, ECFR_50, ECFR_59],
      },
      {
        id: 'aviso',
        heading: 'Tu empleador debe avisarte antes',
        paragraphs: [
          'El empleador no puede tomar el crédito por propinas si no te avisó antes: el salario en efectivo que te pagará, el crédito por propinas que toma (no más que las propinas que de verdad recibes), que te quedas con todas tus propinas salvo en un fondo común limitado a empleados que reciben propinas de forma habitual y regular, y que el crédito no se aplica a quien no recibió este aviso (29 CFR 531.59(b)).',
          'Sin ese aviso, el crédito por propinas no se aplica, y el empleador debe el salario mínimo completo en efectivo.',
        ],
        sources: [ECFR_59, FACT_SHEET_15],
      },
      {
        id: 'completar',
        heading: 'Si las propinas no alcanzan, el empleador completa la diferencia',
        paragraphs: [
          'La cuenta se hace por cada semana laboral: si tu salario en efectivo y tus propinas juntos no llegan a $7.25 la hora en la semana, el empleador debe completar la diferencia (Fact Sheet #15). Para tomar el crédito completo, el empleador debe mostrar que recibiste al menos esa cantidad en propinas; si recibiste menos, paga el resto para que ganes al menos el salario mínimo (29 CFR 531.59(b)).',
          'Tus propinas son tuyas: la FLSA no permite que el empleador se quede con ninguna parte de ellas, y los gerentes y supervisores tampoco pueden quedarse con ninguna, tome o no el empleador el crédito por propinas (29 CFR 531.52).',
        ],
        sources: [FACT_SHEET_15, ECFR_59, ECFR_52],
      },
      {
        id: 'horas-extra',
        heading: 'Las horas extra se calculan sobre los $7.25 completos',
        paragraphs: [
          'Para quien recibe propinas, la tarifa de horas extra no se calcula sobre el salario en efectivo de $2.13: la Fact Sheet #15 dice que las horas extra se calculan sobre el salario mínimo completo, hoy $7.25 la hora. Tu tarifa regular incluye el crédito por propinas que toma el empleador y tu salario en efectivo; las propinas por encima del crédito no cuentan en ella (29 CFR 531.60).',
          'Así, cada hora después de 40 en una semana laboral suma la mitad de $7.25, que paga el empleador además del salario en efectivo.',
        ],
        sources: [FACT_SHEET_15, ECFR_60],
      },
      {
        id: 'ejemplos-resueltos',
        heading: 'Ejemplos resueltos',
        paragraphs: [
          `Las propinas cubren el crédito: 40 horas a $2.13 pagan ${covered.wages} de salario en efectivo. Con $250 de propinas, el empleador toma un crédito por propinas de ${covered.tipCredit} (40 × $5.12), debe completar ${covered.topUp}, y con ${covered.overtimeHours} horas después de 40 la prima de horas extra es ${covered.overtimePremium}. La semana paga ${covered.totalPay}, o ${covered.perHour} la hora.`,
          `Las propinas no alcanzan: 40 horas a $2.13 pagan ${topUp.wages}, pero las propinas son solo $150, así que el crédito por propinas es ${topUp.tipCredit} y el empleador debe completar ${topUp.topUp}. Con ${topUp.overtimeHours} horas después de 40 (prima de horas extra ${topUp.overtimePremium}), la semana paga ${topUp.totalPay}: ${topUp.perHour} la hora, el salario mínimo.`,
          `Una semana con horas extra: 44 horas a $2.13 pagan ${overtime.wages}. Con $300 de propinas el crédito por propinas es ${overtime.tipCredit} y lo que debe completar, ${overtime.topUp}. Cada una de las ${overtime.overtimeHours} horas después de 40 suma la mitad de $7.25, una prima de horas extra de ${overtime.overtimePremium}, y la semana paga ${overtime.totalPay}, o ${overtime.perHour} la hora.`,
          `Si esas horas extra se calcularan sobre el salario en efectivo de $2.13, las 4 horas después de 40 sumarían solo ${onCash.overtimePremium}: ${onCash.short} menos de lo que exige la ley.`,
          'Estas cifras salen de la calculadora de propinas por hora; ingresa ahí tu salario en efectivo, tus propinas y tus horas para ver tu semana.',
        ],
        sources: [FACT_SHEET_15, ECFR_59, ECFR_60],
      },
      {
        id: 'estados',
        heading: 'Revisa tu estado',
        paragraphs: [
          'Estas son las reglas federales. Cuando la ley del estado es distinta, el empleador debe cumplir la norma que más protege al empleado (Fact Sheet #15). Muchos estados fijan un salario mínimo o un salario en efectivo más alto, y algunos exigen el salario mínimo estatal completo antes de las propinas, sin crédito por propinas.',
          'El Departamento de Trabajo de EE. UU. tiene una tabla, en inglés, con el salario mínimo en efectivo y el crédito por propinas de cada estado; revisa ahí tu estado, y consulta a su departamento de trabajo.',
        ],
        sources: [DOL_STATE_TABLE, FACT_SHEET_15],
      },
    ],
    sourcesLabel: 'Fuentes',
    disclaimer:
      'Una guía de lo que publican estas reglas y agencias, no asesoría legal. Para tu caso, consulta al departamento de trabajo de tu estado.',
    reviewed:
      'Revisada con el eCFR y páginas del Departamento de Trabajo el 5 de noviembre de 2026.',
    ctas: [
      { label: 'Abrir la calculadora de propinas por hora', href: TIPPED_PATHS.es },
      { label: 'Cómo se calculan las horas extra', href: OVERTIME_GUIDE_PATHS.federal.es },
      { label: 'Cómo leer tu talón de pago', href: PAY_STUB_GUIDE_PATHS.es },
    ],
    linkLabel: '¿Cuándo debe tu empleador completar tus propinas?',
  },
};
