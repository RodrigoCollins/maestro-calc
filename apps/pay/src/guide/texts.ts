import type { Money } from '@maestro-calc/core';
import { DEDUCTION_PATHS } from '../deductions/texts.ts';
import type { Lang } from '../time-card/receipt.ts';

export interface GuideSource {
  readonly label: string;
  readonly href: string;
}

export interface GuideSection {
  readonly id: string;
  readonly heading: string;
  readonly paragraphs: readonly string[];
  readonly sources: readonly GuideSource[];
}

/** The worked examples a guide shows: weeks run through the time card, labelled per language. */
export interface GuideExamplesTexts {
  readonly heading: string;
  readonly lead: string;
  readonly columns: {
    readonly regular: string;
    readonly overtime: string;
    readonly double: string;
    readonly pay: string;
  };
  /** The label of each example, by the id of the example in the guide's list. */
  readonly labels: Readonly<Record<string, string>>;
}

/** One line of a worked ledger (a sample pay stub): the amount is computed, the label is text. */
export interface LedgerLine {
  readonly id: string;
  /** An earning, a deduction (a negative amount), a total, or a figure shown for reference. */
  readonly kind: 'earning' | 'deduction' | 'total' | 'info';
  readonly amount: Money;
  /** How the amount is worked out, the same in both languages: `40 h × $22.00`. */
  readonly detail?: string;
}

/** The texts of a worked ledger, labelled per language by the id of each line. */
export interface GuideLedgerTexts {
  readonly heading: string;
  readonly lead: string;
  readonly note: string;
  readonly labels: Readonly<Record<string, string>>;
}

export interface GuideTexts {
  readonly title: string;
  readonly description: string;
  readonly kicker: string;
  readonly h1: string;
  readonly lead: string;
  readonly sections: readonly GuideSection[];
  readonly examples?: GuideExamplesTexts;
  readonly ledger?: GuideLedgerTexts;
  readonly sourcesLabel: string;
  readonly disclaimer: string;
  readonly reviewed: string;
  readonly ctas: readonly { readonly label: string; readonly href: string }[];
  /** The text of the link other pages give to this guide. */
  readonly linkLabel: string;
}

/** The guide's path in each language. */
export const GUIDE_PATHS: Readonly<Record<Lang, string>> = {
  en: '/guides/no-tax-on-tips-and-overtime',
  es: '/es/guias/propinas-y-horas-extra-sin-impuestos',
};

/**
 * The worked examples of the guide, run through the engines by `texts.test.ts`: the overtime one
 * is the calculator's own default week (300 hours at $22, 12% bracket).
 */
export const GUIDE_EXAMPLES = {
  overtime: { rate: '22', overtimeHours: '300', bracket: '12', deduction: 3300, savings: 396 },
  tips: { tips: '8000', bracket: '12', deduction: 8000, savings: 960 },
} as const;

const W2: GuideSource = {
  label: 'IRS, 2026 General Instructions for Forms W-2 and W-3',
  href: 'https://www.irs.gov/instructions/iw2w3',
};
const SCHEDULE_1A_2026: GuideSource = {
  label: 'IRS, 2026 Schedule 1-A (Form 1040), draft',
  href: 'https://www.irs.gov/pub/irs-dft/f1040s1a--dft.pdf',
};
const OVERTIME_FACTS: GuideSource = {
  label: 'IRS, What to know about the No Tax on Overtime deduction',
  href: 'https://www.irs.gov/newsroom/what-to-know-about-the-no-tax-on-overtime-deduction',
};
const OVERTIME_QA: GuideSource = {
  label: 'IRS, questions and answers on the deduction for qualified overtime compensation',
  href: 'https://www.irs.gov/newsroom/questions-and-answers-about-the-new-deduction-for-qualified-overtime-compensation',
};
const TIPPED: GuideSource = {
  label: 'IRS, occupations that customarily received tips',
  href: 'https://www.irs.gov/TippedOccupations',
};
const FLSA: GuideSource = {
  label: 'U.S. Department of Labor, Fact Sheet #23: Overtime Pay Requirements of the FLSA',
  href: 'https://www.dol.gov/agencies/whd/fact-sheets/23-flsa-overtime-pay',
};

export const GUIDE_TEXTS: Readonly<Record<Lang, GuideTexts>> = {
  en: {
    title: 'How to Claim No Tax on Tips and Overtime (2026) | Cuenta Horas',
    description:
      'Who qualifies for the tips and overtime deductions, where the amounts are on your 2026 W-2, and where they go on Schedule 1-A of your return.',
    kicker: 'Tax year 2026 · guide',
    h1: 'How to claim no tax on tips and overtime on your 2026 return',
    lead: 'Tips are taxed as wages, but on your 2026 return, the one most people file in early 2027, you can deduct up to $25,000 of qualified tips and up to $12,500 of qualified overtime compensation ($25,000 on a joint return) from federal income tax, and the tax it saves is the deduction times your bracket: $960 on $8,000 of tips in the 12% bracket. Both shrink when modified adjusted gross income is over $150,000 ($300,000 on a joint return), and Social Security and Medicare taxes still apply. This guide covers who qualifies, where the amounts come from and where they go on the return.',
    sections: [
      {
        id: 'who-qualifies',
        heading: 'Who qualifies',
        paragraphs: [
          'Tips count when they are voluntary cash or card tips, including tips shared with you, received in an occupation on the IRS list of jobs that customarily received tips. A mandatory service charge added to the bill is not a tip.',
          'Overtime counts only for the part above your regular rate that the federal law (FLSA) requires: the half of time and a half, for hours over 40 in a workweek. Overtime that only a state law requires, such as daily overtime in California, does not count.',
          'For both, the person who received the pay needs a Social Security number valid for work, and a married couple must file a joint return. The deductions apply to tax years 2025 through 2028.',
        ],
        sources: [TIPPED, FLSA, OVERTIME_QA],
      },
      {
        id: 'how-much',
        heading: 'How much you can deduct',
        paragraphs: [
          'Tips: up to $25,000 on any return, joint included. Overtime: up to $12,500, or $25,000 on a joint return. Both shrink by $100 for each full $1,000 of modified adjusted gross income (MAGI) over $150,000, or $300,000 on a joint return.',
          'Overtime example: 300 overtime hours in the year at a regular rate of $22. The qualified part is half of $22 for each hour, $11 × 300 = $3,300, so the deduction is $3,300. In the 12% bracket it saves about $396.',
          'Tips example: $8,000 of qualified tips and an income under the limit. The deduction is $8,000, which saves about $960 in the 12% bracket.',
        ],
        sources: [OVERTIME_FACTS],
      },
      {
        id: 'where-the-numbers-are',
        heading: 'Where the amounts are on your W-2',
        paragraphs: [
          'From tax year 2026, employers must report these amounts separately. On the 2026 Form W-2, box 12 with code TT is the total qualified overtime compensation, and box 12 with code TP is the total of cash tips reported to the employer. Box 14b holds the Treasury Tipped Occupation Code of your job.',
          'For tax year 2025, employers did not have to report them separately, so many workers worked the amounts out from their pay stubs.',
        ],
        sources: [W2, OVERTIME_QA],
      },
      {
        id: 'where-it-goes',
        heading: 'Where it goes on the return',
        paragraphs: [
          'Both deductions are claimed on Schedule 1-A (Form 1040), Additional Deductions. On the 2026 draft of the schedule, Part II is no tax on tips and Part III is no tax on overtime. The total of the schedule goes to Form 1040, line 13a. Line numbers can change when the IRS publishes the final form.',
          'You can take them whether you itemize or take the standard deduction.',
        ],
        sources: [SCHEDULE_1A_2026, OVERTIME_FACTS],
      },
      {
        id: 'what-it-does-not-change',
        heading: 'What it does not change',
        paragraphs: [
          'The deductions lower federal income tax only. Tips and overtime are still wages for Social Security and Medicare taxes and for income tax withholding. State income tax follows your state rules.',
        ],
        sources: [OVERTIME_FACTS],
      },
    ],
    sourcesLabel: 'Sources',
    disclaimer:
      'A guide to the federal rules, not tax advice. Your return, credits and state taxes decide the real amount.',
    reviewed: 'Checked against IRS sources on November 3, 2026.',
    ctas: [
      { label: 'No tax on overtime calculator', href: DEDUCTION_PATHS.overtime.en },
      { label: 'No tax on tips calculator', href: DEDUCTION_PATHS.tips.en },
    ],
    linkLabel: 'How to claim it on your 2026 return',
  },
  es: {
    title: 'Cómo deducir propinas y horas extra (2026) | Cuenta Horas',
    description:
      'Quién califica para las deducciones de propinas y horas extra, dónde están los montos en tu W-2 2026 y dónde van en el Schedule 1-A de tu declaración.',
    kicker: 'Año fiscal 2026 · guía',
    h1: 'Cómo deducir propinas y horas extra en tu declaración 2026',
    lead: 'Las propinas pagan impuestos como salario, pero en tu declaración 2026, la que la mayoría presenta a principios de 2027, puedes deducir hasta $25,000 de propinas calificadas y hasta $12,500 de compensación calificada por horas extra ($25,000 en una declaración conjunta) del impuesto federal sobre la renta, y el impuesto que te ahorras es la deducción por tu tramo: $960 con $8,000 de propinas en el tramo del 12%. Las dos bajan cuando el ingreso bruto ajustado modificado pasa de $150,000 ($300,000 en una declaración conjunta), y los impuestos de Seguro Social y Medicare se siguen pagando. Esta guía explica quién califica, de dónde salen los montos y dónde van en la declaración.',
    sections: [
      {
        id: 'quien-califica',
        heading: 'Quién califica',
        paragraphs: [
          'Las propinas cuentan cuando son voluntarias, en efectivo o con tarjeta, incluidas las que te comparten, y las recibes en una ocupación de la lista del IRS de trabajos que habitualmente recibían propinas. Un cargo por servicio obligatorio que se suma a la cuenta no es propina.',
          'Las horas extra cuentan solo por la parte sobre tu tarifa regular que exige la ley federal (FLSA): la mitad del tiempo y medio, por las horas sobre 40 en una semana laboral. Las horas extra que exige solo una ley estatal, como las diarias de California, no cuentan.',
          'En los dos casos, quien recibió el pago necesita un número de Seguro Social válido para trabajar, y un matrimonio debe presentar una declaración conjunta. Las deducciones valen para los años fiscales 2025 a 2028.',
        ],
        sources: [TIPPED, FLSA, OVERTIME_QA],
      },
      {
        id: 'cuanto',
        heading: 'Cuánto puedes deducir',
        paragraphs: [
          'Propinas: hasta $25,000 en cualquier declaración, también la conjunta. Horas extra: hasta $12,500, o $25,000 en una declaración conjunta. Las dos bajan $100 por cada $1,000 completos de ingreso bruto ajustado modificado (MAGI) sobre $150,000, o $300,000 en una declaración conjunta.',
          'Ejemplo de horas extra: 300 horas extra en el año con una tarifa regular de $22. La parte calificada es la mitad de $22 por cada hora, $11 × 300 = $3,300, así que la deducción es $3,300. En la franja del 12% ahorra unos $396.',
          'Ejemplo de propinas: $8,000 de propinas calificadas y un ingreso bajo el límite. La deducción es $8,000, que ahorra unos $960 en la franja del 12%.',
        ],
        sources: [OVERTIME_FACTS],
      },
      {
        id: 'donde-estan-los-montos',
        heading: 'Dónde están los montos en tu W-2',
        paragraphs: [
          'Desde el año fiscal 2026, los empleadores deben informar estos montos por separado. En el Formulario W-2 de 2026, la casilla 12 con el código TT es el total de la compensación calificada por horas extra, y la casilla 12 con el código TP es el total de propinas en efectivo informadas al empleador. La casilla 14b lleva el código de ocupación con propinas del Tesoro (Treasury Tipped Occupation Code) de tu trabajo.',
          'Para el año fiscal 2025, los empleadores no tenían que informarlos por separado, así que muchos trabajadores calcularon los montos con sus talones de pago.',
        ],
        sources: [W2, OVERTIME_QA],
      },
      {
        id: 'donde-va',
        heading: 'Dónde va en la declaración',
        paragraphs: [
          'Las dos deducciones se piden en el Schedule 1-A (Formulario 1040), Additional Deductions. En el borrador 2026 del anexo, la Parte II es la de propinas y la Parte III la de horas extra. El total del anexo va al Formulario 1040, línea 13a. Los números de línea pueden cambiar cuando el IRS publique el formulario final.',
          'Puedes tomarlas tanto si detallas tus deducciones como si tomas la deducción estándar.',
        ],
        sources: [SCHEDULE_1A_2026, OVERTIME_FACTS],
      },
      {
        id: 'lo-que-no-cambia',
        heading: 'Lo que no cambia',
        paragraphs: [
          'Las deducciones bajan solo el impuesto federal sobre la renta. Las propinas y las horas extra siguen siendo salario para los impuestos de Seguro Social y Medicare y para la retención. El impuesto estatal sigue las reglas de tu estado.',
        ],
        sources: [OVERTIME_FACTS],
      },
    ],
    sourcesLabel: 'Fuentes',
    disclaimer:
      'Una guía de las reglas federales, no asesoría fiscal. Tu declaración, los créditos y los impuestos estatales deciden el monto real.',
    reviewed: 'Revisada con fuentes del IRS el 3 de noviembre de 2026.',
    ctas: [
      { label: 'Calculadora de horas extra sin impuestos', href: DEDUCTION_PATHS.overtime.es },
      { label: 'Calculadora de propinas sin impuestos', href: DEDUCTION_PATHS.tips.es },
    ],
    linkLabel: 'Cómo pedirla en tu declaración 2026',
  },
};
