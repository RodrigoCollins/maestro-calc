import { Rational, toCents, usd, type Money } from '@maestro-calc/core';
import { hoursText, moneyText } from '../format.ts';
import { figuresOf } from '../methodology/examples.ts';
import { OVERTIME_PATHS } from '../overtime/texts.ts';
import { TIME_CARD_PATHS } from '../long-tail/jobs.ts';
import type { Lang } from '../time-card/receipt.ts';
import { OVERTIME_GUIDE_PATHS } from './overtime.ts';
import { UNPAID_WAGES_GUIDE_PATHS } from './paths.ts';
import type { GuideSource, GuideTexts, LedgerLine } from './texts.ts';

export { PAY_STUB_GUIDE_PATHS } from './paths.ts';

/**
 * The made-up stub the guide works through: the time card's default week (49.5 hours at $22),
 * a $40 health premium through a cafeteria plan and a 5% pre-tax 401(k) deferral. The rates are
 * the 2026 ones of IRS Topic 751 and Publication 15; `pay-stub.test.ts` pins every amount.
 */
export const PAY_STUB_EXAMPLE_INPUTS = {
  rate: 22n,
  healthPremiumCents: 4000n,
  retirementPercent: 5n,
  /** Social Security, 6.2%, in tenths of a percent. */
  socialSecurityPerMille: 62n,
  /** Medicare, 1.45%, in hundredths of a percent. */
  medicarePerTenThousand: 145n,
} as const;

const centsOf = (money: Money): bigint => {
  const { negative, integer, fraction } = toCents(money);
  const cents = integer * 100n + BigInt(fraction);
  return negative ? -cents : cents;
};
const money = (cents: bigint): Money => usd(Rational.of(cents, 100n));
/** A positive share rounded half up to the cent, as `cents × numerator / denominator`. */
const share = (cents: bigint, numerator: bigint, denominator: bigint): bigint =>
  (cents * numerator * 2n + denominator) / (denominator * 2n);

const buildExample = (): readonly LedgerLine[] => {
  const input = PAY_STUB_EXAMPLE_INPUTS;
  const week = figuresOf({ id: 'pay-stub', inputs: {} });
  const rate = Rational.of(input.rate);
  const overtimeRate = rate.mul(Rational.of(3n, 2n));
  const regular = centsOf(usd(week.regularHours.mul(rate)));
  const overtime = centsOf(usd(week.overtimeHours.mul(overtimeRate)));
  const gross = centsOf(week.pay);
  if (regular + overtime !== gross) throw new Error('the stub lines must add up to the gross pay');
  const health = input.healthPremiumCents;
  const retirement = share(gross, input.retirementPercent, 100n);
  // A cafeteria plan premium leaves both taxes' wages; a pre-tax 401(k) deferral only income tax's.
  const ficaWages = gross - health;
  const incomeTaxWages = gross - health - retirement;
  const socialSecurity = share(ficaWages, input.socialSecurityPerMille, 1000n);
  const medicare = share(ficaWages, input.medicarePerTenThousand, 10000n);
  const net = gross - health - retirement - socialSecurity - medicare;
  return [
    {
      id: 'regular',
      kind: 'earning',
      amount: money(regular),
      detail: `${hoursText(week.regularHours)} h × ${moneyText(usd(rate))}`,
    },
    {
      id: 'overtime',
      kind: 'earning',
      amount: money(overtime),
      detail: `${hoursText(week.overtimeHours)} h × ${moneyText(usd(overtimeRate))}`,
    },
    { id: 'gross', kind: 'total', amount: money(gross) },
    { id: 'health', kind: 'deduction', amount: money(-health) },
    {
      id: 'retirement',
      kind: 'deduction',
      amount: money(-retirement),
      detail: `${String(input.retirementPercent)}% × ${moneyText(money(gross))}`,
    },
    {
      id: 'social-security',
      kind: 'deduction',
      amount: money(-socialSecurity),
      detail: `6.2% × ${moneyText(money(ficaWages))}`,
    },
    {
      id: 'medicare',
      kind: 'deduction',
      amount: money(-medicare),
      detail: `1.45% × ${moneyText(money(ficaWages))}`,
    },
    { id: 'net', kind: 'total', amount: money(net) },
    { id: 'income-tax-wages', kind: 'info', amount: money(incomeTaxWages) },
  ];
};

/** The lines of the sample stub, computed once from the engine and the 2026 rates. */
export const PAY_STUB_EXAMPLE: readonly LedgerLine[] = buildExample();

const TOPIC_751: GuideSource = {
  label: 'IRS, Topic no. 751, Social Security and Medicare withholding rates',
  href: 'https://www.irs.gov/taxtopics/tc751',
};
const PUB_15: GuideSource = {
  label: "IRS, Publication 15 (2026), Employer's Tax Guide",
  href: 'https://www.irs.gov/publications/p15',
};
const PUB_15_B: GuideSource = {
  label: "IRS, Publication 15-B (2026), Employer's Tax Guide to Fringe Benefits",
  href: 'https://www.irs.gov/publications/p15b',
};
const RETIREMENT_FAQ: GuideSource = {
  label:
    'IRS, are retirement plan contributions subject to withholding for FICA, Medicare or federal income tax?',
  href: 'https://www.irs.gov/retirement-plans/retirement-plan-faqs-regarding-contributions-are-retirement-plan-contributions-subject-to-withholding-for-fica-medicare-or-federal-income-tax',
};
const TOPIC_753: GuideSource = {
  label: 'IRS, Topic no. 753, Form W-4, Employee’s Withholding Certificate',
  href: 'https://www.irs.gov/taxtopics/tc753',
};
const FACT_SHEET_21: GuideSource = {
  label: 'U.S. Department of Labor, Fact Sheet #21: Recordkeeping Requirements under the FLSA',
  href: 'https://www.dol.gov/agencies/whd/fact-sheets/21-flsa-recordkeeping',
};
const FACT_SHEET_23: GuideSource = {
  label: 'U.S. Department of Labor, Fact Sheet #23: Overtime Pay Requirements of the FLSA',
  href: 'https://www.dol.gov/agencies/whd/fact-sheets/23-flsa-overtime-pay',
};
const DLSE_PAYDAYS: GuideSource = {
  label: 'California Labor Commissioner (DLSE), Paydays, pay periods and final wages FAQ',
  href: 'https://www.dir.ca.gov/dlse/FAQ_Paydays.htm',
};

export const PAY_STUB_GUIDE: Readonly<Record<Lang, GuideTexts>> = {
  en: {
    title: 'How to Read a Pay Stub, Line by Line (2026) | Cuenta Horas',
    description:
      'Gross pay, hours and rates, the overtime line, pre-tax and after-tax deductions, federal withholding, Social Security and Medicare, net pay and YTD.',
    kicker: 'Pay stub · guide',
    h1: 'How to read your pay stub, line by line',
    lead: 'A pay stub shows what you earned in the pay period, what came out of it and why. This guide walks through each line, with the 2026 Social Security and Medicare rates, and works a sample stub at the end.',
    sections: [
      {
        id: 'gross-pay',
        heading: 'Gross pay, hours and rates',
        paragraphs: [
          'Gross pay is what you earned before anything is taken out. Above it, the stub usually lists each kind of pay with its hours and its rate: regular hours at your regular rate, overtime hours at the overtime rate, and other pay such as tips or bonuses. Check that the hours match your own record of the period.',
          'Under federal law your employer must keep, for each nonexempt worker, the hours worked each day and each workweek, the regular hourly rate, the straight-time and overtime earnings, every addition to or deduction from the wages, and the total wages of each pay period.',
          'In California, semimonthly or each time you are paid, you must get a statement with your gross wages, total hours worked (unless you are a salaried exempt employee), every hourly rate in effect and the hours at each rate, all deductions, net wages, the dates of the pay period, your name with only the last four digits of your Social Security number or an employee ID, and the name and address of the employer.',
        ],
        sources: [FACT_SHEET_21, DLSE_PAYDAYS],
      },
      {
        id: 'overtime-line',
        heading: 'The overtime line',
        paragraphs: [
          'Under the FLSA, a covered nonexempt employee is owed at least one and a half times the regular rate for every hour over 40 in the workweek. On the stub, the overtime rate should be at least 1.5 times the regular rate: $33 for a $22 regular rate.',
          'The overtime hours are counted per workweek, so a two-week pay period can have overtime in one week and none in the other. California also pays overtime by the day; the California guide covers it.',
        ],
        sources: [FACT_SHEET_23],
      },
      {
        id: 'pre-tax-and-after-tax',
        heading: 'Pre-tax and after-tax deductions',
        paragraphs: [
          'Some deductions come out before taxes are figured, and they lower the wages that are taxed. A pre-tax 401(k) deferral is not subject to federal income tax withholding, but it is still subject to Social Security and Medicare taxes. A Roth 401(k) deferral is subject to both.',
          'Health coverage you pay for through your employer’s cafeteria plan (section 125) is, in most cases, exempt from federal income tax withholding and from Social Security and Medicare taxes.',
          'That is why a stub can show two different taxable wage figures: one for federal income tax and one for Social Security and Medicare. After-tax deductions, such as a Roth deferral, come out of pay that was already taxed.',
        ],
        sources: [RETIREMENT_FAQ, PUB_15_B],
      },
      {
        id: 'federal-withholding',
        heading: 'Federal income tax withholding',
        paragraphs: [
          'The federal income tax line is set by the Form W-4 you gave your employer and the withholding tables of IRS Publication 15-T. If you did not give a valid W-4, the employer must withhold as if you were single or married filing separately with no other entries.',
          'When you hand in a new W-4, the employer has to apply it no later than the first payroll period ending on or after the 30th day after receiving it. The IRS Tax Withholding Estimator helps you fill it in.',
          'A state income tax line follows the rules of your state; this guide covers the federal lines.',
        ],
        sources: [TOPIC_753, PUB_15],
      },
      {
        id: 'social-security-and-medicare',
        heading: 'Social Security and Medicare (FICA)',
        paragraphs: [
          'The Social Security tax is 6.2% for the employee and 6.2% for the employer. For 2026, it applies only to the first $184,500 of wages; the wage base limit is the maximum wage subject to the tax for that year.',
          'The Medicare tax is 1.45% for the employee and 1.45% for the employer, with no wage base limit. Your employer must also withhold an Additional Medicare Tax of 0.9% on your wages paid over $200,000 in a calendar year, with no employer match.',
          'On the stub, the two lines are your share: 6.2% and 1.45% of the wages they apply to. The employer pays its matching share on top.',
        ],
        sources: [TOPIC_751, PUB_15],
      },
      {
        id: 'net-pay-and-ytd',
        heading: 'Net pay and year to date (YTD)',
        paragraphs: [
          'Net pay is what reaches you: gross pay minus every tax and deduction on the stub. If your net pay looks wrong, start from the gross pay and the hours, then check each deduction.',
          'The year-to-date column adds up each line since the start of the calendar year. It is the quickest way to see how much has been withheld so far and, for a high earner, when the year’s Social Security wages reach the $184,500 limit and that line stops.',
        ],
        sources: [DLSE_PAYDAYS, TOPIC_751],
      },
    ],
    ledger: {
      heading: 'A sample stub, worked out',
      lead: 'A made-up example, not a real employer’s stub: the time card’s default week (49.5 hours at $22), a $40 health premium through a cafeteria plan and a 5% pre-tax 401(k) deferral.',
      note: 'Each amount is rounded to the cent. Federal and state income tax withholding are left out: they depend on your W-4 and your state, so the last total is net pay before income tax withholding.',
      labels: {
        regular: 'Regular pay',
        overtime: 'Overtime pay',
        gross: 'Gross pay',
        health: 'Health premium (pre-tax, cafeteria plan)',
        retirement: '401(k) deferral (pre-tax)',
        'social-security': 'Social Security',
        medicare: 'Medicare',
        net: 'Net pay before income tax withholding',
        'income-tax-wages': 'Wages for federal income tax',
      },
    },
    sourcesLabel: 'Sources',
    disclaimer:
      'A guide to reading a pay stub, not legal or tax advice. Your employer’s payroll, your W-4 and your state rules decide the real amounts.',
    reviewed:
      'Checked against IRS, Department of Labor and California Labor Commissioner sources on November 4, 2026.',
    ctas: [
      { label: 'Check your hours with the time card', href: TIME_CARD_PATHS.en },
      { label: 'Open the overtime calculator', href: OVERTIME_PATHS.en },
      { label: 'If your overtime was not paid', href: UNPAID_WAGES_GUIDE_PATHS.en },
      { label: 'California overtime by day and week', href: OVERTIME_GUIDE_PATHS.california.en },
    ],
    linkLabel: 'How to read your pay stub',
  },
  es: {
    title: 'Cómo Leer tu Talón de Pago, Línea por Línea (2026) | Cuenta Horas',
    description:
      'Pago bruto, horas y tarifas, la línea de horas extra, deducciones antes y después de impuestos, retención federal, Seguro Social, Medicare, neto y YTD.',
    kicker: 'Talón de pago · guía',
    h1: 'Cómo leer tu talón de pago, línea por línea',
    lead: 'El talón de pago (pay stub) muestra lo que ganaste en el período de pago, lo que se descontó y por qué. Esta guía repasa cada línea, con las tasas de Seguro Social y Medicare de 2026, y resuelve un talón de ejemplo al final.',
    sections: [
      {
        id: 'pago-bruto',
        heading: 'Pago bruto, horas y tarifas',
        paragraphs: [
          'El pago bruto (gross pay) es lo que ganaste antes de cualquier descuento. Encima, el talón suele listar cada tipo de pago con sus horas y su tarifa: las horas normales a tu tarifa regular, las horas extra a la tarifa de horas extra y otros pagos, como propinas o bonos. Revisa que las horas coincidan con tu propio registro del período.',
          'Según la ley federal, tu empleador debe llevar, por cada trabajador no exento, las horas trabajadas cada día y cada semana laboral, la tarifa regular por hora, las ganancias normales y las de horas extra, cada suma o descuento al salario y el salario total de cada período de pago.',
          'En California, dos veces al mes o cada vez que te pagan, debes recibir un comprobante con tu salario bruto, el total de horas trabajadas (salvo que seas un empleado exento con sueldo fijo), cada tarifa por hora vigente y las horas a cada tarifa, todas las deducciones, el salario neto, las fechas del período de pago, tu nombre con solo los últimos cuatro dígitos de tu número de Seguro Social o un número de empleado, y el nombre y la dirección del empleador.',
        ],
        sources: [FACT_SHEET_21, DLSE_PAYDAYS],
      },
      {
        id: 'linea-de-horas-extra',
        heading: 'La línea de horas extra',
        paragraphs: [
          'Según la FLSA, a un empleado cubierto no exento se le debe al menos una vez y media su tarifa regular por cada hora sobre 40 en la semana laboral. En el talón, la tarifa de horas extra debe ser al menos 1.5 veces la tarifa regular: $33 para una tarifa regular de $22.',
          'Las horas extra se cuentan por semana laboral, así que un período de pago de dos semanas puede tener horas extra en una semana y ninguna en la otra. California también paga horas extra por día; la guía de California lo explica.',
        ],
        sources: [FACT_SHEET_23],
      },
      {
        id: 'antes-y-despues-de-impuestos',
        heading: 'Deducciones antes y después de impuestos',
        paragraphs: [
          'Algunas deducciones salen antes de calcular los impuestos y bajan el salario que se grava. Una contribución antes de impuestos a un 401(k) no está sujeta a la retención federal del impuesto sobre la renta, pero sí a los impuestos de Seguro Social y Medicare. Una contribución Roth a un 401(k) está sujeta a los dos.',
          'La cobertura de salud que pagas por el plan cafetería (sección 125) de tu empleador está, en la mayoría de los casos, exenta de la retención federal del impuesto sobre la renta y de los impuestos de Seguro Social y Medicare.',
          'Por eso un talón puede mostrar dos salarios gravables distintos: uno para el impuesto federal sobre la renta y otro para Seguro Social y Medicare. Las deducciones después de impuestos, como una contribución Roth, salen de un pago que ya pagó impuestos.',
        ],
        sources: [RETIREMENT_FAQ, PUB_15_B],
      },
      {
        id: 'retencion-federal',
        heading: 'La retención del impuesto federal sobre la renta',
        paragraphs: [
          'La línea del impuesto federal sobre la renta depende del Formulario W-4 que le diste a tu empleador y de las tablas de retención de la Publicación 15-T del IRS. Si no entregaste un W-4 válido, el empleador debe retener como si fueras soltero o casado que declara por separado, sin otros datos.',
          'Cuando entregas un W-4 nuevo, el empleador debe aplicarlo a más tardar en el primer período de nómina que termine el día 30 o después de recibirlo. El Estimador de Retención de Impuestos del IRS (Tax Withholding Estimator) te ayuda a llenarlo.',
          'Una línea de impuesto estatal sobre la renta sigue las reglas de tu estado; esta guía explica las líneas federales.',
        ],
        sources: [TOPIC_753, PUB_15],
      },
      {
        id: 'seguro-social-y-medicare',
        heading: 'Seguro Social y Medicare (FICA)',
        paragraphs: [
          'El impuesto de Seguro Social es 6.2% para el empleado y 6.2% para el empleador. Para 2026 se aplica solo a los primeros $184,500 de salario; el límite de la base salarial es el salario máximo sujeto al impuesto en ese año.',
          'El impuesto de Medicare es 1.45% para el empleado y 1.45% para el empleador, sin límite de base salarial. Tu empleador también debe retener un Impuesto Adicional de Medicare de 0.9% sobre tu salario pagado por encima de $200,000 en un año calendario, sin aporte igual del empleador.',
          'En el talón, las dos líneas son tu parte: 6.2% y 1.45% del salario al que se aplican. El empleador paga además su propia parte igual.',
        ],
        sources: [TOPIC_751, PUB_15],
      },
      {
        id: 'neto-y-acumulado',
        heading: 'El pago neto y el acumulado del año (YTD)',
        paragraphs: [
          'El pago neto (net pay) es lo que te llega: el pago bruto menos cada impuesto y deducción del talón. Si tu pago neto no cuadra, empieza por el pago bruto y las horas, y luego revisa cada deducción.',
          'La columna del acumulado del año (year to date, YTD) suma cada línea desde el inicio del año calendario. Es la forma más rápida de ver cuánto se retuvo hasta ahora y, si ganas mucho, cuándo el salario de Seguro Social del año llega al límite de $184,500 y esa línea se detiene.',
        ],
        sources: [DLSE_PAYDAYS, TOPIC_751],
      },
    ],
    ledger: {
      heading: 'Un talón de ejemplo, resuelto',
      lead: 'Un ejemplo inventado, no el talón de un empleador real: la semana predeterminada de la tarjeta de horas (49.5 horas a $22), una prima de salud de $40 por un plan cafetería y una contribución de 5% antes de impuestos a un 401(k).',
      note: 'Cada monto se redondea al centavo. Las retenciones de impuesto federal y estatal sobre la renta quedan fuera: dependen de tu W-4 y de tu estado, así que el último total es el pago neto antes de la retención del impuesto sobre la renta.',
      labels: {
        regular: 'Pago normal',
        overtime: 'Pago de horas extra',
        gross: 'Pago bruto',
        health: 'Prima de salud (antes de impuestos, plan cafetería)',
        retirement: 'Contribución al 401(k) (antes de impuestos)',
        'social-security': 'Seguro Social',
        medicare: 'Medicare',
        net: 'Pago neto antes de la retención del impuesto sobre la renta',
        'income-tax-wages': 'Salario para el impuesto federal sobre la renta',
      },
    },
    sourcesLabel: 'Fuentes',
    disclaimer:
      'Una guía para leer un talón de pago, no asesoría legal ni fiscal. La nómina de tu empleador, tu W-4 y las reglas de tu estado deciden los montos reales.',
    reviewed:
      'Revisada con fuentes del IRS, del Departamento de Trabajo y del Comisionado Laboral de California el 4 de noviembre de 2026.',
    ctas: [
      { label: 'Revisa tus horas con la tarjeta de horas', href: TIME_CARD_PATHS.es },
      { label: 'Abrir la calculadora de horas extra', href: OVERTIME_PATHS.es },
      { label: 'Si no te pagaron las horas extra', href: UNPAID_WAGES_GUIDE_PATHS.es },
      {
        label: 'Horas extra en California por día y por semana',
        href: OVERTIME_GUIDE_PATHS.california.es,
      },
    ],
    linkLabel: 'Cómo leer tu talón de pago',
  },
};
