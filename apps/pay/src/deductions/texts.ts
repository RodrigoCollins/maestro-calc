import type { Lang } from '../time-card/receipt.ts';

export type Deduction = 'overtime' | 'tips';

export interface Field {
  readonly key: string;
  readonly label: string;
  /** A select's option labels, by option value. */
  readonly options?: Readonly<Record<string, string>>;
  /** Shown only while the `source` select has this value. */
  readonly when?: 'hours' | 'amount';
  readonly hint?: string;
}

export interface DeductionTexts {
  readonly title: string;
  readonly description: string;
  readonly kicker: string;
  readonly h1: string;
  readonly lead: string;
  readonly fields: readonly Field[];
  readonly figureLabel: string;
  readonly rows: Readonly<Record<string, string>>;
  readonly rules: readonly string[];
  readonly source: { readonly label: string; readonly href: string };
  readonly disclaimer: string;
  readonly otherLang: string;
}

export const DEDUCTION_PATHS: Readonly<Record<Deduction, Readonly<Record<Lang, string>>>> = {
  overtime: {
    en: '/no-tax-on-overtime-calculator',
    es: '/es/calculadora-horas-extra-sin-impuestos',
  },
  tips: { en: '/no-tax-on-tips-calculator', es: '/es/calculadora-propinas-sin-impuestos' },
};

const SCHEDULE_1A = 'https://www.irs.gov/pub/irs-pdf/f1040s1a.pdf';

const filingEn = { single: 'Single, head of household', joint: 'Married filing jointly' };
const filingEs = { single: 'Soltero o jefe de familia', joint: 'Casados, declaración conjunta' };
const brackets = Object.fromEntries(
  ['10', '12', '22', '24', '32', '35', '37'].map((rate) => [rate, `${rate}%`]),
);

export const DEDUCTION_TEXTS: Readonly<Record<Lang, Readonly<Record<Deduction, DeductionTexts>>>> =
  {
    en: {
      overtime: {
        title: 'No Tax on Overtime Calculator 2026: Your Deduction | Cuenta Horas',
        description:
          'Estimate the new overtime deduction: the half of time and a half, up to $12,500 ($25,000 joint), with the income phase-out of Schedule 1-A. Free.',
        kicker: 'Tax year 2026 · free',
        h1: 'No tax on overtime calculator',
        lead: 'Enter your overtime hours and rate, or the amount on your W-2. You get the deduction and about what it saves.',
        fields: [
          {
            key: 'source',
            label: 'Start from',
            options: { hours: 'My overtime hours', amount: 'My W-2, box 12, code TT' },
          },
          { key: 'rate', label: 'Hourly rate', when: 'hours' },
          { key: 'overtimeHours', label: 'Overtime hours in the year', when: 'hours' },
          {
            key: 'premium',
            label: 'Qualified overtime (W-2 box 12, code TT)',
            when: 'amount',
            hint: 'Only the half of time and a half, not the whole overtime pay.',
          },
          { key: 'filing', label: 'Filing status', options: filingEn },
          { key: 'magi', label: 'Modified adjusted gross income (MAGI)' },
          { key: 'bracket', label: 'Your tax bracket', options: brackets },
        ],
        figureLabel: 'Your overtime deduction',
        rows: {
          premium: 'Qualified overtime (the half)',
          reduction: 'Lost to the income limit',
          savings: 'About what it saves',
        },
        rules: [
          'Only overtime the federal law (FLSA) requires counts: hours over 40 in a week. California daily overtime alone does not.',
          'Up to $12,500, or $25,000 on a joint return. It shrinks by $100 for each full $1,000 of MAGI over $150,000 ($300,000 joint).',
          'You need a Social Security number valid for work, and married couples must file jointly. It applies to tax years 2025 through 2028.',
        ],
        source: { label: 'IRS Schedule 1-A (Form 1040), Part III', href: SCHEDULE_1A },
        disclaimer:
          'An estimate, not tax advice. The savings use your top bracket; your return, credits and state taxes decide the real amount.',
        otherLang: 'Español',
      },
      tips: {
        title: 'No Tax on Tips Calculator 2026: Your Tips Deduction | Cuenta Horas',
        description:
          'Estimate the new tips deduction: up to $25,000 of qualified tips, with the income phase-out of Schedule 1-A, and about what it saves. Free.',
        kicker: 'Tax year 2026 · free',
        h1: 'No tax on tips calculator',
        lead: 'Up to $25,000 of qualified tips comes off your federal taxable income for 2026, and the tax it saves is that deduction times your tax bracket. Enter the tips you received in the year and your income to get the deduction and about what it saves.',
        fields: [
          {
            key: 'tips',
            label: 'Qualified tips in the year',
            hint: 'Cash and card tips reported in a tipped job on the IRS list (W-2 box 12, code TP, as a start).',
          },
          { key: 'filing', label: 'Filing status', options: filingEn },
          { key: 'magi', label: 'Modified adjusted gross income (MAGI)' },
          { key: 'bracket', label: 'Your tax bracket', options: brackets },
        ],
        figureLabel: 'Your tips deduction',
        rows: { reduction: 'Lost to the income limit', savings: 'About what it saves' },
        rules: [
          'Tips must be voluntary and earned in an occupation the IRS lists as customarily receiving tips. Automatic service charges are not tips.',
          'Up to $25,000 on any return, joint included. It shrinks by $100 for each full $1,000 of MAGI over $150,000 ($300,000 joint).',
          'You need a Social Security number valid for work, and married couples must file jointly. It applies to tax years 2025 through 2028.',
        ],
        source: { label: 'IRS Schedule 1-A (Form 1040), Part II', href: SCHEDULE_1A },
        disclaimer:
          'An estimate, not tax advice. The savings use your top bracket; your return, credits and state taxes decide the real amount.',
        otherLang: 'Español',
      },
    },
    es: {
      overtime: {
        title: 'Calculadora de Horas Extra sin Impuestos 2026 | Cuenta Horas',
        description:
          'Calcula la nueva deducción de horas extra: la mitad del tiempo y medio, hasta $12,500 ($25,000 en conjunta), con el límite de ingresos del Schedule 1-A.',
        kicker: 'Año fiscal 2026 · gratis',
        h1: 'Calculadora de horas extra sin impuestos',
        lead: 'Anota tus horas extra y tu pago por hora, o el monto de tu W-2. Te da la deducción y más o menos cuánto te ahorras.',
        fields: [
          {
            key: 'source',
            label: 'Empezar desde',
            options: { hours: 'Mis horas extra', amount: 'Mi W-2, casilla 12, código TT' },
          },
          { key: 'rate', label: 'Pago por hora', when: 'hours' },
          { key: 'overtimeHours', label: 'Horas extra en el año', when: 'hours' },
          {
            key: 'premium',
            label: 'Horas extra calificadas (W-2 casilla 12, código TT)',
            when: 'amount',
            hint: 'Solo la mitad del tiempo y medio, no todo el pago de las horas extra.',
          },
          { key: 'filing', label: 'Estado civil para la declaración', options: filingEs },
          { key: 'magi', label: 'Ingreso bruto ajustado modificado (MAGI)' },
          { key: 'bracket', label: 'Tu tramo de impuesto', options: brackets },
        ],
        figureLabel: 'Tu deducción por horas extra',
        rows: {
          premium: 'Horas extra calificadas (la mitad)',
          reduction: 'Lo que quita el límite de ingresos',
          savings: 'Más o menos lo que te ahorras',
        },
        rules: [
          'Solo cuentan las horas extra que exige la ley federal (FLSA): las de más de 40 en la semana. Las horas extra diarias de California por sí solas no cuentan.',
          'Hasta $12,500, o $25,000 en una declaración conjunta. Baja $100 por cada $1,000 completos de MAGI por encima de $150,000 ($300,000 en conjunta).',
          'Necesitas un número de Seguro Social válido para trabajar, y los casados deben declarar en conjunto. Vale para los años fiscales 2025 a 2028.',
        ],
        source: { label: 'IRS, Schedule 1-A (Formulario 1040), Parte III', href: SCHEDULE_1A },
        disclaimer:
          'Es una estimación, no asesoría fiscal. El ahorro usa tu tramo más alto; tu declaración, los créditos y los impuestos del estado deciden el monto real.',
        otherLang: 'English',
      },
      tips: {
        title: 'Calculadora de Propinas sin Impuestos 2026 | Cuenta Horas',
        description:
          'Calcula la nueva deducción de propinas: hasta $25,000 de propinas calificadas, con el límite de ingresos del Schedule 1-A, y cuánto te ahorras.',
        kicker: 'Año fiscal 2026 · gratis',
        h1: 'Calculadora de propinas sin impuestos',
        lead: 'Hasta $25,000 de propinas calificadas se restan de tu ingreso gravable federal en 2026, y el impuesto que te ahorras es esa deducción por tu tramo. Anota las propinas que recibiste en el año y tus ingresos: te da la deducción y más o menos cuánto te ahorras.',
        fields: [
          {
            key: 'tips',
            label: 'Propinas calificadas en el año',
            hint: 'Propinas en efectivo y con tarjeta declaradas en un oficio de la lista del IRS (para empezar, W-2 casilla 12, código TP).',
          },
          { key: 'filing', label: 'Estado civil para la declaración', options: filingEs },
          { key: 'magi', label: 'Ingreso bruto ajustado modificado (MAGI)' },
          { key: 'bracket', label: 'Tu tramo de impuesto', options: brackets },
        ],
        figureLabel: 'Tu deducción por propinas',
        rows: {
          reduction: 'Lo que quita el límite de ingresos',
          savings: 'Más o menos lo que te ahorras',
        },
        rules: [
          'Las propinas deben ser voluntarias y ganadas en un oficio que el IRS lista como de propinas habituales. Los cargos por servicio automáticos no son propinas.',
          'Hasta $25,000 en cualquier declaración, también la conjunta. Baja $100 por cada $1,000 completos de MAGI por encima de $150,000 ($300,000 en conjunta).',
          'Necesitas un número de Seguro Social válido para trabajar, y los casados deben declarar en conjunto. Vale para los años fiscales 2025 a 2028.',
        ],
        source: { label: 'IRS, Schedule 1-A (Formulario 1040), Parte II', href: SCHEDULE_1A },
        disclaimer:
          'Es una estimación, no asesoría fiscal. El ahorro usa tu tramo más alto; tu declaración, los créditos y los impuestos del estado deciden el monto real.',
        otherLang: 'English',
      },
    },
  };
