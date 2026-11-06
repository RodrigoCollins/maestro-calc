import { addMoney, type Money, usd } from '@maestro-calc/core';
import { noTaxOnOvertime } from '@maestro-calc/pay-core/no-tax-on-overtime';
import { noTaxOnTips } from '@maestro-calc/pay-core/no-tax-on-tips';
import { DEDUCTION_PATHS } from '../deductions/texts.ts';
import { moneyText } from '../format.ts';
import type { Lang } from '../time-card/receipt.ts';
import { W2_BOX_12_GUIDE_PATHS } from './paths.ts';
import {
  GUIDE_PATHS,
  IRS_SOURCES,
  type GuideSource,
  type GuideTexts,
  type LedgerLine,
} from './texts.ts';

export { W2_BOX_12_GUIDE_PATHS };

/**
 * The example W-2 of the guide: a server's box 12 (TP and TT), single, under the phase-out, in the
 * 12% bracket. The TT amount is the half of time and a half of 150 hours at $22, as the overtime
 * calculator works it out from hours (`w2-box-12.test.ts` holds both ways equal).
 */
export const W2_BOX_12_EXAMPLE = {
  tips: '9800',
  overtime: '1650',
  rate: '22',
  overtimeHours: '150',
  filing: 'single',
  magi: '52000',
  bracket: '12',
} as const;

const outputOf = (
  engine: typeof noTaxOnTips | typeof noTaxOnOvertime,
  raw: Readonly<Record<string, string>>,
  key: string,
): Money => {
  const ran = engine.run(raw);
  if (!ran.ok) throw new Error(`the W-2 example must run: ${JSON.stringify(ran.errors)}`);
  const output = ran.value.outputs.find((candidate) => candidate.key === key);
  if (output === undefined) throw new Error(`no output ${key}`);
  return output.value;
};

const buildLedger = (): readonly LedgerLine[] => {
  const { tips, overtime, rate, overtimeHours, filing, magi, bracket } = W2_BOX_12_EXAMPLE;
  const tipsRaw = { tips, filing, magi, bracket };
  const overtimeRaw = { source: 'amount', premium: overtime, filing, magi, bracket };
  const tipsDeduction = outputOf(noTaxOnTips, tipsRaw, 'deduction');
  const overtimeDeduction = outputOf(noTaxOnOvertime, overtimeRaw, 'deduction');
  return [
    { id: 'tp', kind: 'info', amount: usd(Number(tips)), detail: 'W-2, box 12, TP' },
    { id: 'tips-deduction', kind: 'earning', amount: tipsDeduction },
    {
      id: 'tt',
      kind: 'info',
      amount: usd(Number(overtime)),
      detail: `W-2, box 12, TT: ${overtimeHours} h × ${moneyText(usd(Number(rate) / 2))}`,
    },
    { id: 'overtime-deduction', kind: 'earning', amount: overtimeDeduction },
    { id: 'total', kind: 'total', amount: addMoney(tipsDeduction, overtimeDeduction) },
    {
      id: 'tips-savings',
      kind: 'info',
      amount: outputOf(noTaxOnTips, tipsRaw, 'savings'),
      detail: `${bracket}%`,
    },
    {
      id: 'overtime-savings',
      kind: 'info',
      amount: outputOf(noTaxOnOvertime, overtimeRaw, 'savings'),
      detail: `${bracket}%`,
    },
  ];
};

/** The worked W-2 the guide shows, every amount from the two calculators' engines. */
export const W2_BOX_12_LEDGER: readonly LedgerLine[] = buildLedger();

const TOPIC_154: GuideSource = {
  label: 'IRS, Topic no. 154, Form W-2 and Form 1099-R (what to do if incorrect or not received)',
  href: 'https://www.irs.gov/taxtopics/tc154',
};
const FACT_SHEET: GuideSource = {
  label: 'IRS, FS-2025-03, Tax deductions for working Americans and seniors',
  href: 'https://www.irs.gov/newsroom/one-big-beautiful-bill-act-tax-deductions-for-working-americans-and-seniors',
};
const {
  w2: W2,
  schedule1a: SCHEDULE_1A,
  overtimeQa: OVERTIME_QA,
  tippedOccupations: TIPPED,
} = IRS_SOURCES;

export const W2_BOX_12_GUIDE: Readonly<Record<Lang, GuideTexts>> = {
  en: {
    title: 'W-2 Box 12 Codes TP and TT: Tips and Overtime (2026) | Cuenta Horas',
    description:
      'What codes TP and TT in box 12 of your 2026 W-2 mean, how much of each you can deduct, a worked example and what to do if a code is missing.',
    kicker: 'Tax year 2026 · guide',
    h1: 'Check your W-2 box 12: codes TP and TT, tax year 2026',
    lead: 'On your 2026 Form W-2, box 12 code TP is the cash tips you reported to your employer and code TT is your qualified overtime, only the half of time and a half, and they are the amounts you start from to deduct up to $25,000 of tips and $12,500 of overtime on Schedule 1-A. With TP of $9,800 and TT of $1,650 in the 12% bracket, that is about $1,374 less federal income tax. If a code is missing or wrong, ask your employer for a corrected W-2, Form W-2c.',
    sections: [
      {
        id: 'what-the-codes-mean',
        heading: 'What codes TP and TT mean',
        paragraphs: [
          'Box 12 of the 2026 Form W-2 lists amounts by a letter code. Code TP is the total amount of cash tips you reported to your employer. Code TT is the total amount of qualified overtime compensation: the pay above your regular rate that the federal law (FLSA) requires, so only the half of time and a half, never the whole overtime pay.',
          'Box 14b is new on the 2026 form. When there is a TP amount, it holds the Treasury Tipped Occupation Code of the job where you got the tips, up to two codes, such as 102 for wait staff or 101 for bartenders. A code of 000 means some of the tips came from a job that is not on the IRS list of tipped occupations, and those tips are not qualified tips.',
          'Tips and overtime are still subject to income tax withholding and to Social Security and Medicare taxes. The codes only show the amounts the two deductions start from.',
        ],
        sources: [W2, TIPPED],
      },
      {
        id: 'how-much',
        heading: 'How much of each you can deduct',
        paragraphs: [
          'Tips: up to $25,000 on any return, joint included. Overtime: up to $12,500, or $25,000 on a joint return. Both shrink by $100 for each full $1,000 of modified adjusted gross income over $150,000, or $300,000 on a joint return. The deductions apply to tax years 2025 through 2028.',
          'Tips count when they are voluntary cash or card tips received in an occupation on the IRS list. For both deductions, the person who got the pay needs a Social Security number valid for work, and a married couple must file a joint return.',
        ],
        sources: [FACT_SHEET, SCHEDULE_1A],
      },
      {
        id: 'example',
        heading: 'A worked example',
        paragraphs: [
          'A server’s 2026 W-2 shows TP 9800.00 and TT 1650.00 in box 12, and 102 in box 14b. She is single, her modified adjusted gross income is $52,000 and her top bracket is 12%. The TT amount is the half of time and a half: 150 overtime hours at a regular rate of $22 are $11 × 150 = $1,650.',
          'Both amounts are under their caps and her income is under $150,000, so the tips deduction is $9,800 and the overtime deduction is $1,650, $11,450 in all. In the 12% bracket they save about $1,176 and $198, about $1,374 of federal income tax.',
        ],
        sources: [W2, SCHEDULE_1A],
      },
      {
        id: 'if-a-code-is-missing',
        heading: 'If a code is missing or wrong',
        paragraphs: [
          'Employers must give you the 2026 W-2 by February 1, 2027. If it is missing, or TP or TT is missing or wrong, ask your employer for a corrected form, Form W-2c. If you still do not have it by the end of February, you can call the IRS at 800-829-1040: it contacts the employer and sends you Form 4852, a substitute for Form W-2 on which you estimate the amounts. If the W-2 that arrives later differs from your estimate, you file an amended return, Form 1040-X.',
          'Tips you did not report to your employer are not in TP. You report them yourself on Form 4137 with your return, and Schedule 1-A takes, for each employer, the larger of the qualified tips in TP and those on Form 4137.',
          'A W-2 with no TT can be right: overtime that only a state law requires, such as daily overtime in California, is not qualified overtime. For tax year 2025 employers did not have to report the amounts separately; for 2026 they must. The IRS pages this guide checked give no way to work out 2026 overtime yourself when TT is left off, so this guide gives none: ask for the W-2c.',
        ],
        sources: [TOPIC_154, W2, OVERTIME_QA, SCHEDULE_1A],
      },
      {
        id: 'where-it-goes',
        heading: 'Where the amounts go on the return',
        paragraphs: [
          'On the 2026 draft of Schedule 1-A (Form 1040), line 4 of Part II takes the tips of each employer and line 16 of Part III takes the TT amount of each employer, with the employer identification number of box b. The total of the schedule goes to Form 1040, line 13a. Line numbers can change when the IRS publishes the final form.',
          'You can take both deductions whether you itemize or take the standard deduction.',
        ],
        sources: [SCHEDULE_1A, FACT_SHEET],
      },
    ],
    ledger: {
      heading: 'The example W-2, worked out',
      lead: 'The amounts are the no tax on tips and no tax on overtime calculators’ own, for a single filer with a modified adjusted gross income of $52,000.',
      note: 'The tax saved is an estimate: the deduction times the bracket.',
      labels: {
        tp: 'Cash tips reported',
        'tips-deduction': 'No tax on tips deduction',
        tt: 'Qualified overtime',
        'overtime-deduction': 'No tax on overtime deduction',
        total: 'Both deductions',
        'tips-savings': 'Tax saved on the tips',
        'overtime-savings': 'Tax saved on the overtime',
      },
    },
    sourcesLabel: 'Sources',
    disclaimer:
      'A guide to the federal rules, not tax advice. Your return, credits and state taxes decide the real amount.',
    reviewed: 'Checked against IRS sources on November 6, 2026.',
    ctas: [
      { label: 'No tax on tips calculator', href: DEDUCTION_PATHS.tips.en },
      { label: 'No tax on overtime calculator', href: DEDUCTION_PATHS.overtime.en },
      { label: 'How to claim both on your 2026 return', href: GUIDE_PATHS.en },
    ],
    linkLabel: 'Check box 12 of your W-2: codes TP and TT',
  },
  es: {
    title: 'Códigos TP y TT de la casilla 12 del W-2 (2026) | Cuenta Horas',
    description:
      'Qué son los códigos TP y TT de la casilla 12 de tu W-2 2026, cuánto puedes deducir de cada uno, un ejemplo y qué hacer si falta un código.',
    kicker: 'Año fiscal 2026 · guía',
    h1: 'Revisa la casilla 12 de tu W-2: códigos TP y TT, año fiscal 2026',
    lead: 'En tu Formulario W-2 de 2026, la casilla 12 con el código TP son las propinas en efectivo que informaste a tu empleador y el código TT tus horas extra calificadas, solo la mitad del tiempo y medio, y son los montos de los que partes para deducir hasta $25,000 de propinas y $12,500 de horas extra en el Schedule 1-A. Con TP de $9,800 y TT de $1,650 en el tramo del 12%, son unos $1,374 menos de impuesto federal sobre la renta. Si falta un código o está mal, pide a tu empleador un W-2 corregido, el Formulario W-2c.',
    sections: [
      {
        id: 'que-significan-los-codigos',
        heading: 'Qué significan los códigos TP y TT',
        paragraphs: [
          'La casilla 12 del Formulario W-2 de 2026 lista montos con un código de letras. El código TP es el total de propinas en efectivo que informaste a tu empleador. El código TT es el total de la compensación calificada por horas extra: el pago sobre tu tarifa regular que exige la ley federal (FLSA), o sea solo la mitad del tiempo y medio, nunca todo el pago de horas extra.',
          'La casilla 14b es nueva en el formulario de 2026. Cuando hay un monto TP, lleva el código de ocupación con propinas del Tesoro (Treasury Tipped Occupation Code) del trabajo donde recibiste las propinas, hasta dos códigos, como 102 para meseros o 101 para bartenders. Un código 000 quiere decir que parte de las propinas vino de un trabajo que no está en la lista del IRS de ocupaciones con propinas, y esas propinas no son propinas calificadas.',
          'Las propinas y las horas extra siguen sujetas a la retención del impuesto sobre la renta y a los impuestos de Seguro Social y Medicare. Los códigos solo muestran los montos de los que parten las dos deducciones.',
        ],
        sources: [W2, TIPPED],
      },
      {
        id: 'cuanto',
        heading: 'Cuánto puedes deducir de cada uno',
        paragraphs: [
          'Propinas: hasta $25,000 en cualquier declaración, también la conjunta. Horas extra: hasta $12,500, o $25,000 en una declaración conjunta. Las dos bajan $100 por cada $1,000 completos de ingreso bruto ajustado modificado sobre $150,000, o $300,000 en una declaración conjunta. Las deducciones valen para los años fiscales 2025 a 2028.',
          'Las propinas cuentan cuando son voluntarias, en efectivo o con tarjeta, y las recibes en una ocupación de la lista del IRS. En las dos deducciones, quien recibió el pago necesita un número de Seguro Social válido para trabajar, y un matrimonio debe presentar una declaración conjunta.',
        ],
        sources: [FACT_SHEET, SCHEDULE_1A],
      },
      {
        id: 'ejemplo',
        heading: 'Un ejemplo resuelto',
        paragraphs: [
          'El W-2 de 2026 de una mesera muestra TP 9800.00 y TT 1650.00 en la casilla 12, y 102 en la casilla 14b. Es soltera, su ingreso bruto ajustado modificado es $52,000 y su tramo más alto es el 12%. El monto TT es la mitad del tiempo y medio: 150 horas extra con una tarifa regular de $22 son $11 × 150 = $1,650.',
          'Los dos montos están bajo sus topes y su ingreso está bajo $150,000, así que la deducción de propinas es $9,800 y la de horas extra $1,650, $11,450 en total. En el tramo del 12% ahorran unos $1,176 y $198, unos $1,374 de impuesto federal sobre la renta.',
        ],
        sources: [W2, SCHEDULE_1A],
      },
      {
        id: 'si-falta-un-codigo',
        heading: 'Si falta un código o está mal',
        paragraphs: [
          'Los empleadores deben darte el W-2 de 2026 a más tardar el 1 de febrero de 2027. Si no llega, o si TP o TT falta o está mal, pide a tu empleador un formulario corregido, el Formulario W-2c. Si a fines de febrero todavía no lo tienes, puedes llamar al IRS al 800-829-1040: el IRS contacta al empleador y te envía el Formulario 4852, un sustituto del W-2 en el que estimas los montos. Si el W-2 que llega después no coincide con tu estimación, presentas una declaración enmendada, el Formulario 1040-X.',
          'Las propinas que no informaste a tu empleador no están en TP. Las informas tú en el Formulario 4137 con tu declaración, y el Schedule 1-A toma, por cada empleador, lo mayor entre las propinas calificadas de TP y las del Formulario 4137.',
          'Un W-2 sin TT puede estar bien: las horas extra que exige solo una ley estatal, como las diarias de California, no son horas extra calificadas. Para el año fiscal 2025 los empleadores no tenían que informar los montos por separado; para 2026 sí. Las páginas del IRS que revisó esta guía no dan una forma de calcular tú las horas extra de 2026 cuando falta TT, así que esta guía no da ninguna: pide el W-2c.',
        ],
        sources: [TOPIC_154, W2, OVERTIME_QA, SCHEDULE_1A],
      },
      {
        id: 'donde-van',
        heading: 'Dónde van los montos en la declaración',
        paragraphs: [
          'En el borrador 2026 del Schedule 1-A (Formulario 1040), la línea 4 de la Parte II lleva las propinas de cada empleador y la línea 16 de la Parte III el monto TT de cada empleador, con el número de identificación del empleador de la casilla b. El total del anexo va al Formulario 1040, línea 13a. Los números de línea pueden cambiar cuando el IRS publique el formulario final.',
          'Puedes tomar las dos deducciones tanto si detallas tus deducciones como si tomas la deducción estándar.',
        ],
        sources: [SCHEDULE_1A, FACT_SHEET],
      },
    ],
    ledger: {
      heading: 'El W-2 del ejemplo, resuelto',
      lead: 'Los montos son los de las calculadoras de propinas y de horas extra sin impuestos, para una declarante soltera con un ingreso bruto ajustado modificado de $52,000.',
      note: 'El impuesto ahorrado es una estimación: la deducción por el tramo.',
      labels: {
        tp: 'Propinas en efectivo informadas',
        'tips-deduction': 'Deducción de propinas sin impuestos',
        tt: 'Horas extra calificadas',
        'overtime-deduction': 'Deducción de horas extra sin impuestos',
        total: 'Las dos deducciones',
        'tips-savings': 'Impuesto ahorrado en las propinas',
        'overtime-savings': 'Impuesto ahorrado en las horas extra',
      },
    },
    sourcesLabel: 'Fuentes',
    disclaimer:
      'Una guía de las reglas federales, no asesoría fiscal. Tu declaración, los créditos y los impuestos estatales deciden el monto real.',
    reviewed: 'Revisada con fuentes del IRS el 6 de noviembre de 2026.',
    ctas: [
      { label: 'Calculadora de propinas sin impuestos', href: DEDUCTION_PATHS.tips.es },
      { label: 'Calculadora de horas extra sin impuestos', href: DEDUCTION_PATHS.overtime.es },
      { label: 'Cómo pedir las dos en tu declaración 2026', href: GUIDE_PATHS.es },
    ],
    linkLabel: 'Revisa la casilla 12 de tu W-2: códigos TP y TT',
  },
};
