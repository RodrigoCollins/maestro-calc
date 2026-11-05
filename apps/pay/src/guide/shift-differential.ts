import { Rational, subMoney, type Money } from '@maestro-calc/core';
import { shiftDifferential } from '@maestro-calc/pay-core/shift-differential';
import { hoursText, moneyText } from '../format.ts';
import { differentialLinksOf } from '../long-tail/differentials.ts';
import type { CommonLinks } from '../long-tail/jobs.ts';
import { SHIFT_PATHS } from '../shift/texts.ts';
import type { Lang } from '../time-card/receipt.ts';
import { OVERTIME_GUIDE_PATHS } from './overtime.ts';
import { PAY_STUB_GUIDE_PATHS } from './paths.ts';
import type { GuideSource, GuideTexts } from './texts.ts';

export { SHIFT_GUIDE_PATHS } from './paths.ts';

/** The figures of one worked week, each written as the shift differential calculator writes it. */
export interface ShiftFigures {
  readonly shiftRate: string;
  readonly straightPay: string;
  readonly totalHours: string;
  readonly regularRate: string;
  readonly overtimeHours: string;
  readonly overtimePremium: string;
  readonly pay: string;
}

interface ShiftWeek {
  readonly id: 'forty-hours' | 'forty-eight-hours' | 'flat-amount';
  /** The raw fields of the calculator, as a shared link would carry them. */
  readonly inputs: Readonly<Record<string, string>>;
}

const WEEKS: readonly ShiftWeek[] = [
  // the calculator's default week: $20, 10%, 24 hours at the base rate and 16 on the shift
  { id: 'forty-hours', inputs: {} },
  { id: 'forty-eight-hours', inputs: { shiftHours: '24' } },
  {
    id: 'flat-amount',
    inputs: { rate: '18', source: 'amount', amount: '1.50', baseHours: '30', shiftHours: '15' },
  },
];

const outputsOf = (inputs: Readonly<Record<string, string>>): ReadonlyMap<string, unknown> => {
  const ran = shiftDifferential.run(inputs);
  if (!ran.ok) throw new Error(`the shift week ${JSON.stringify(inputs)} must run`);
  return new Map(ran.value.outputs.map(({ key, value }) => [key, value as unknown]));
};

const moneyOf = (out: ReadonlyMap<string, unknown>, key: string): Money => {
  const found = out.get(key);
  if (typeof found !== 'object' || found === null || !('currency' in found)) {
    throw new Error(`no shift money output ${key}`);
  }
  return found as Money;
};

const figuresOf = (inputs: Readonly<Record<string, string>>): ShiftFigures => {
  const out = outputsOf(inputs);
  const hours = (key: string): string => {
    const found = out.get(key);
    if (!(found instanceof Rational)) throw new Error(`no shift hours output ${key}`);
    return hoursText(found);
  };
  return {
    shiftRate: moneyText(moneyOf(out, 'shiftRate')),
    straightPay: moneyText(moneyOf(out, 'straightPay')),
    totalHours: hours('totalHours'),
    regularRate: moneyText(moneyOf(out, 'regularRate')),
    overtimeHours: hours('overtimeHours'),
    overtimePremium: moneyText(moneyOf(out, 'overtimePremium')),
    pay: moneyText(moneyOf(out, 'pay')),
  };
};

/** The weeks the guide works out, every figure from the shift differential calculator at build. */
export const SHIFT_GUIDE_EXAMPLES: readonly (ShiftWeek & { readonly figures: ShiftFigures })[] =
  WEEKS.map((week) => ({ ...week, figures: figuresOf(week.inputs) }));

const exampleOf = (id: ShiftWeek['id']): ShiftFigures => {
  const found = SHIFT_GUIDE_EXAMPLES.find((each) => each.id === id);
  if (found === undefined) throw new Error(`no shift example ${id}`);
  return found.figures;
};

/**
 * The 48-hour week with the differential left out of the regular rate (a differential of $0, so
 * the regular rate is the base rate): the premium it gives and how much less than the right one.
 */
export const SHIFT_GUIDE_LEFT_OUT = ((): {
  readonly regularRate: string;
  readonly overtimePremium: string;
  readonly short: string;
} => {
  const right = outputsOf({ shiftHours: '24' });
  const wrong = outputsOf({ shiftHours: '24', source: 'amount', amount: '0' });
  return {
    regularRate: moneyText(moneyOf(wrong, 'regularRate')),
    overtimePremium: moneyText(moneyOf(wrong, 'overtimePremium')),
    short: moneyText(
      subMoney(moneyOf(right, 'overtimePremium'), moneyOf(wrong, 'overtimePremium')),
    ),
  };
})();

/** The shift differential pages the guide lists under its body, in each language. */
export const SHIFT_GUIDE_LINKS: Readonly<Record<Lang, CommonLinks>> = {
  en: differentialLinksOf('en'),
  es: differentialLinksOf('es'),
};

const forty = exampleOf('forty-hours');
const fortyEight = exampleOf('forty-eight-hours');
const flat = exampleOf('flat-amount');
const left = SHIFT_GUIDE_LEFT_OUT;

const ECFR_207: GuideSource = {
  label: '29 CFR 778.207, Other types of contract premium pay distinguished (eCFR)',
  href: 'https://www.ecfr.gov/current/title-29/subtitle-B/chapter-V/subchapter-B/part-778/subpart-C/section-778.207',
};
const ECFR_115: GuideSource = {
  label: '29 CFR 778.115, Employees working at two or more rates (eCFR)',
  href: 'https://www.ecfr.gov/current/title-29/subtitle-B/chapter-V/subchapter-B/part-778/subpart-C/section-778.115',
};
const DOL_NIGHT: GuideSource = {
  label: 'U.S. Department of Labor, Night Work and Shift Work',
  href: 'https://www.dol.gov/general/topic/workhours/nightwork',
};
const FACT_SHEET_23: GuideSource = {
  label: 'U.S. Department of Labor, Fact Sheet #23: Overtime Pay Requirements of the FLSA',
  href: 'https://www.dol.gov/agencies/whd/fact-sheets/23-flsa-overtime-pay',
};
const FACT_SHEET_56A: GuideSource = {
  label: 'U.S. Department of Labor, Fact Sheet #56A: Overview of the Regular Rate of Pay',
  href: 'https://www.dol.gov/agencies/whd/fact-sheets/56a-regular-rate',
};
const DLSE_OVERTIME: GuideSource = {
  label: 'California Labor Commissioner (DLSE), Overtime FAQ',
  href: 'https://www.dir.ca.gov/dlse/faq_overtime.htm',
};

export const SHIFT_GUIDE: Readonly<Record<Lang, GuideTexts>> = {
  en: {
    title: 'Night Shift Differential and Overtime | Cuenta Horas',
    description:
      'Is the night shift differential in your overtime rate? What federal law says, the weighted-average regular rate, and worked weeks.',
    kicker: 'Shift pay · guide',
    h1: 'Night shift differential and overtime: is the differential in the overtime rate?',
    lead: 'A shift differential is the extra you get an hour for nights, evenings or weekends. This guide shows what federal law says about it, why it belongs in the rate your overtime is figured on, and how that rate is worked out when a week has hours at two rates.',
    sections: [
      {
        id: 'not-required',
        heading: 'Federal law does not require a differential',
        paragraphs: [
          'The U.S. Department of Labor says extra pay for working night shifts is a matter of agreement between the employer and the employee (or the employee’s representative): the Fair Labor Standards Act (FLSA) does not require extra pay for night work.',
          'What the FLSA does require is overtime: covered, nonexempt workers must be paid not less than time and one-half their regular rate for the hours worked over 40 in a workweek. The question is what that regular rate is when part of the week paid more.',
        ],
        sources: [DOL_NIGHT, FACT_SHEET_23],
      },
      {
        id: 'in-the-regular-rate',
        heading: 'When you get a differential, it is in the regular rate',
        paragraphs: [
          'The regular rate includes all pay for employment except the payments the law itself excludes. The federal rule on premium pay names night shift differentials directly: the Act requires including them in the regular rate, whether they take the form of a percent of the base rate or an addition of so many cents per hour (29 CFR 778.207(b)).',
          'A differential is not an overtime premium, so it cannot be counted toward the overtime you are owed: it goes into the regular rate before overtime is computed, and no part of it can be credited toward the overtime pay (29 CFR 778.207(a)).',
        ],
        sources: [ECFR_207, FACT_SHEET_23, FACT_SHEET_56A],
      },
      {
        id: 'weighted-average',
        heading: 'Two rates in one week: the weighted average',
        paragraphs: [
          'When you work at two or more rates in one workweek, your regular rate for that week is the weighted average of the rates: your total earnings at all of them, divided by the total hours worked (29 CFR 778.115). Each hour over 40 then adds half of that regular rate on top of the straight-time pay you already got for it.',
          'So the steps are: add the pay of the hours at the base rate and the hours at the shift rate, divide by all the hours, and pay half of the result again for every hour over 40.',
        ],
        sources: [ECFR_115, FACT_SHEET_23],
      },
      {
        id: 'worked-examples',
        heading: 'Worked examples',
        paragraphs: [
          `40 hours, 10% differential: at $20 an hour with 10% more at night, the shift rate is ${forty.shiftRate}. 24 hours at $20 and 16 at ${forty.shiftRate} are ${forty.straightPay} for ${forty.totalHours} hours. The regular rate is ${forty.regularRate}, there are ${forty.overtimeHours} hours over 40, so the overtime premium is ${forty.overtimePremium} and the week pays ${forty.pay}.`,
          `48 hours, 10% differential: 24 hours at $20 and 24 at ${fortyEight.shiftRate} are ${fortyEight.straightPay} for ${fortyEight.totalHours} hours. The regular rate is ${fortyEight.straightPay} / ${fortyEight.totalHours} = ${fortyEight.regularRate}. Each of the ${fortyEight.overtimeHours} hours over 40 adds half of it, an overtime premium of ${fortyEight.overtimePremium}, and the week pays ${fortyEight.pay}.`,
          `If that differential were left out, the regular rate would be the base ${left.regularRate} and the ${fortyEight.overtimeHours} hours over 40 would add ${left.overtimePremium}: ${left.short} less than the law requires.`,
          `$1.50 an hour more: at $18 an hour plus $1.50 on the night shift, the shift rate is ${flat.shiftRate}. 30 hours at $18 and 15 at ${flat.shiftRate} are ${flat.straightPay} for ${flat.totalHours} hours. The regular rate is ${flat.regularRate}, the ${flat.overtimeHours} hours over 40 add an overtime premium of ${flat.overtimePremium}, and the week pays ${flat.pay}.`,
          'These figures come from the shift differential calculator; enter your own rate, differential and hours there to see your week.',
        ],
        sources: [ECFR_115, ECFR_207],
      },
      {
        id: 'states',
        heading: 'State rules',
        paragraphs: [
          'States can add to the federal rules. California’s Labor Commissioner says the regular rate of an hourly worker includes shift differentials, and that with two or more rates in a week it is the weighted average: the earnings of the week divided by all the hours worked, overtime hours included. In its example, 32 hours at $11.00 and 10 hours at $9.00 give a regular rate of $10.52.',
          'California also has daily overtime, which this guide and the shift differential calculator do not cover: for hours over 8 in a day, use the overtime calculator. Other states have their own rules; check your state’s labor department.',
        ],
        sources: [DLSE_OVERTIME],
      },
    ],
    sourcesLabel: 'Sources',
    disclaimer:
      'A guide to what these rules and agencies publish, not legal advice. For your own case, check your state’s labor department.',
    reviewed:
      'Checked against the eCFR, Department of Labor and California Labor Commissioner pages on November 5, 2026.',
    ctas: [
      { label: 'Open the shift differential calculator', href: SHIFT_PATHS.en },
      { label: 'How overtime is calculated', href: OVERTIME_GUIDE_PATHS.federal.en },
      { label: 'How to read your pay stub', href: PAY_STUB_GUIDE_PATHS.en },
    ],
    linkLabel: 'Is the night differential in the overtime rate?',
  },
  es: {
    title: 'Diferencial nocturno y horas extra | Cuenta Horas',
    description:
      '¿El diferencial nocturno entra en tu tarifa de horas extra? Qué dice la ley federal, la tarifa regular como promedio ponderado y semanas resueltas.',
    kicker: 'Pago por turno · guía',
    h1: 'Diferencial nocturno y horas extra: ¿entra en la tarifa de horas extra?',
    lead: 'El diferencial de turno es lo que te pagan de más por hora por trabajar de noche, de tarde o en fin de semana. Esta guía muestra qué dice la ley federal, por qué el diferencial entra en la tarifa sobre la que se calculan tus horas extra y cómo se calcula esa tarifa cuando una semana tiene horas a dos tarifas.',
    sections: [
      {
        id: 'no-es-obligatorio',
        heading: 'La ley federal no exige un diferencial',
        paragraphs: [
          'El Departamento de Trabajo de EE. UU. dice que el pago extra por trabajar turnos de noche es un acuerdo entre el empleador y el empleado (o su representante): la Ley de Normas Justas de Trabajo (FLSA) no exige pago extra por trabajar de noche.',
          'Lo que sí exige la FLSA son las horas extra: a los trabajadores cubiertos y no exentos se les debe pagar al menos una vez y media su tarifa regular por las horas trabajadas después de 40 en una semana laboral. La pregunta es cuál es esa tarifa regular cuando parte de la semana se pagó más.',
        ],
        sources: [DOL_NIGHT, FACT_SHEET_23],
      },
      {
        id: 'en-la-tarifa-regular',
        heading: 'Si recibes un diferencial, entra en la tarifa regular',
        paragraphs: [
          'La tarifa regular incluye todo el pago por el trabajo, salvo los pagos que la propia ley excluye. La regla federal sobre primas nombra directamente los diferenciales por turno de noche: la ley exige incluirlos en la tarifa regular, sea un porcentaje de la tarifa base o unos centavos más por hora (29 CFR 778.207(b)).',
          'Un diferencial no es una prima de horas extra, así que no se puede descontar de las horas extra que te deben: entra en la tarifa regular antes de calcular las horas extra, y ninguna parte de él cuenta como pago de horas extra (29 CFR 778.207(a)).',
        ],
        sources: [ECFR_207, FACT_SHEET_23, FACT_SHEET_56A],
      },
      {
        id: 'promedio-ponderado',
        heading: 'Dos tarifas en una semana: el promedio ponderado',
        paragraphs: [
          'Cuando trabajas a dos o más tarifas en una misma semana laboral, tu tarifa regular de esa semana es el promedio ponderado de las tarifas: lo que ganaste a todas ellas, dividido por el total de horas trabajadas (29 CFR 778.115). Cada hora después de 40 suma luego la mitad de esa tarifa regular, además del pago normal que ya recibiste por ella.',
          'Los pasos son: suma el pago de las horas a la tarifa base y el de las horas a la tarifa del turno, divídelo por todas las horas y paga otra vez la mitad del resultado por cada hora después de 40.',
        ],
        sources: [ECFR_115, FACT_SHEET_23],
      },
      {
        id: 'ejemplos-resueltos',
        heading: 'Ejemplos resueltos',
        paragraphs: [
          `40 horas, diferencial del 10%: a $20 la hora con un 10% más de noche, la tarifa del turno es ${forty.shiftRate}. 24 horas a $20 y 16 a ${forty.shiftRate} son ${forty.straightPay} por ${forty.totalHours} horas. La tarifa regular es ${forty.regularRate}, hay ${forty.overtimeHours} horas después de 40, así que la prima de horas extra es ${forty.overtimePremium} y la semana paga ${forty.pay}.`,
          `48 horas, diferencial del 10%: 24 horas a $20 y 24 a ${fortyEight.shiftRate} son ${fortyEight.straightPay} por ${fortyEight.totalHours} horas. La tarifa regular es ${fortyEight.straightPay} / ${fortyEight.totalHours} = ${fortyEight.regularRate}. Cada una de las ${fortyEight.overtimeHours} horas después de 40 suma la mitad, una prima de horas extra de ${fortyEight.overtimePremium}, y la semana paga ${fortyEight.pay}.`,
          `Si se dejara afuera ese diferencial, la tarifa regular sería la base de ${left.regularRate} y las ${fortyEight.overtimeHours} horas después de 40 sumarían ${left.overtimePremium}: ${left.short} menos de lo que exige la ley.`,
          `$1.50 más por hora: a $18 la hora más $1.50 en el turno de noche, la tarifa del turno es ${flat.shiftRate}. 30 horas a $18 y 15 a ${flat.shiftRate} son ${flat.straightPay} por ${flat.totalHours} horas. La tarifa regular es ${flat.regularRate}, las ${flat.overtimeHours} horas después de 40 suman una prima de horas extra de ${flat.overtimePremium}, y la semana paga ${flat.pay}.`,
          'Estas cifras salen de la calculadora de diferencial de turno; ingresa ahí tu tarifa, tu diferencial y tus horas para ver tu semana.',
        ],
        sources: [ECFR_115, ECFR_207],
      },
      {
        id: 'estados',
        heading: 'Reglas de los estados',
        paragraphs: [
          'Los estados pueden sumar reglas a las federales. El Comisionado Laboral de California dice que la tarifa regular de quien cobra por hora incluye los diferenciales de turno, y que con dos o más tarifas en una semana es el promedio ponderado: lo que ganaste en la semana dividido por todas las horas trabajadas, horas extra incluidas. En su ejemplo, 32 horas a $11.00 y 10 horas a $9.00 dan una tarifa regular de $10.52.',
          'California también tiene horas extra por día, que esta guía y la calculadora de diferencial de turno no cubren: para las horas después de 8 en un día, usa la calculadora de horas extra. Otros estados tienen sus propias reglas; consulta al departamento de trabajo de tu estado.',
        ],
        sources: [DLSE_OVERTIME],
      },
    ],
    sourcesLabel: 'Fuentes',
    disclaimer:
      'Una guía de lo que publican estas reglas y agencias, no asesoría legal. Para tu caso, consulta al departamento de trabajo de tu estado.',
    reviewed:
      'Revisada con el eCFR y páginas del Departamento de Trabajo y del Comisionado Laboral de California el 5 de noviembre de 2026.',
    ctas: [
      { label: 'Abrir la calculadora de diferencial de turno', href: SHIFT_PATHS.es },
      { label: 'Cómo se calculan las horas extra', href: OVERTIME_GUIDE_PATHS.federal.es },
      { label: 'Cómo leer tu talón de pago', href: PAY_STUB_GUIDE_PATHS.es },
    ],
    linkLabel: '¿El diferencial nocturno entra en la tarifa de horas extra?',
  },
};
