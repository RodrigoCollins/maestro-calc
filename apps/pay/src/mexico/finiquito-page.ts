import type { CivilDate } from '@maestro-calc/pay-core/calendar';
import {
  AGUINALDO_EXEMPT_CENTS,
  finiquitoOf,
  INDEMNIZACION_DAYS,
  MINIMUM_WAGE_2026,
  nextAnniversaryOf,
  PRIMA_EXEMPT_CENTS,
  SEPARATION_EXEMPT_UMA,
  UMA_2026,
  vacationDaysFor,
  VEINTE_DIAS_PER_YEAR,
  type Exit,
  type FiniquitoInput,
  type WagePeriod,
  type WageZone,
} from '@maestro-calc/pay-core/mexico';
import { pesosOf, shortDateOf } from '../dates/words.ts';
import type { LongTailSection, LongTailSource } from '../long-tail/sections.ts';
import { titleOf } from '../seo/meta.ts';
import { FINIQUITO_NAME, finiquitoTextOf, type FiniquitoKey } from './finiquito-words.ts';
import { ANTIGUEDAD_NAME, SDI_NAME } from './labor-words.ts';
import {
  AGUINALDO_PATH,
  ANTIGUEDAD_PATH,
  FINIQUITO_PATH,
  ISR_PATH,
  mexicoPathOf,
  SDI_PATH,
  VACACIONES_PATH,
} from './routes.ts';
import { ISR_NAME } from './salary-words.ts';
import { AGUINALDO_NAME, hundredthsDaysText, VACACIONES_NAME } from './words.ts';

/*
 * The finiquito and liquidación calculator of Mexico (Spanish only), with the result the build
 * works out for its defaults so it answers with no script. Every amount comes from `finiquitoOf`
 * of `@maestro-calc/pay-core/mexico`, which reuses the aguinaldo, vacation, prima de antigüedad
 * and SDI engine; every rule from the law as read first-hand. `client/finiquito.ts` redoes the
 * result on every edit.
 */

const READ = 'leído el 16 de noviembre de 2026';

/** The laws as published and the official notices the page cites. */
export const FINIQUITO_SOURCES = {
  lft: {
    label: `Ley Federal del Trabajo, arts. 33, 48, 49, 50, 52, 76, 79, 80, 84, 87, 89, 162, 485, 486, 518, 530, 534 y 947 (texto vigente de la Cámara de Diputados, última reforma DOF 21-02-2025), Orden Jurídico Nacional, ${READ}`,
    href: 'https://www.ordenjuridico.gob.mx/Documentos/Federal/wo125151.doc',
  },
  lisr: {
    label: `Ley del Impuesto sobre la Renta, arts. 93 fracciones XIII y XIV, 95 y 96 (texto vigente, última reforma DOF 01-04-2024), Orden Jurídico Nacional, ${READ}`,
    href: 'https://www.ordenjuridico.gob.mx/Documentos/Federal/wo25.doc',
  },
  dof2022: {
    label: `DOF 27-12-2022: Decreto por el que se reforman los artículos 76 y 78 de la Ley Federal del Trabajo, en materia de vacaciones, ${READ}`,
    href: 'https://dof.gob.mx/nota_detalle.php?codigo=5675889&fecha=27/12/2022',
  },
  desindexacion: {
    label: `DOF 27-01-2016: Decreto de desindexación del salario mínimo, artículo tercero transitorio (las menciones al salario mínimo como unidad de medida se entienden a la UMA), ${READ}`,
    href: 'https://dof.gob.mx/nota_detalle.php?codigo=5423663&fecha=27/01/2016',
  },
  uma: {
    label: `INEGI, valor de la Unidad de Medida y Actualización 2026, DOF 09-01-2026: $117.31 diarios desde el 1 de febrero de 2026, ${READ}`,
    href: 'https://dof.gob.mx/nota_detalle.php?codigo=5778072&fecha=09/01/2026',
  },
  conasami: {
    label: `CONASAMI, resolución que fija los salarios mínimos de 2026, DOF 09-12-2025: $315.04 diarios y $440.87 en la Zona Libre de la Frontera Norte, ${READ}`,
    href: 'https://dof.gob.mx/nota_detalle.php?codigo=5775534&fecha=09/12/2025',
  },
} as const satisfies Readonly<Record<string, LongTailSource>>;

const MINIMUM = MINIMUM_WAGE_2026.generalCents;
const UMA = pesosOf(UMA_2026.dailyCents);
const SEPARATION_UMA = pesosOf(SEPARATION_EXEMPT_UMA * UMA_2026.dailyCents);
const date = (y: number, m: number, d: number): CivilDate => ({ y, m, d });
const dateText = (day: CivilDate): string => `${shortDateOf(day)} de ${String(day.y)}`;

interface PageLink {
  readonly href: string;
  readonly label: string;
}

const LINKS = {
  aguinaldo: { href: AGUINALDO_PATH, label: AGUINALDO_NAME },
  vacaciones: { href: VACACIONES_PATH, label: VACACIONES_NAME },
  antiguedad: { href: ANTIGUEDAD_PATH, label: ANTIGUEDAD_NAME },
  sdi: { href: SDI_PATH, label: SDI_NAME },
  isr: { href: ISR_PATH, label: ISR_NAME },
  primaVacacional: {
    href: mexicoPathOf('prima-vacacional'),
    label: 'Prima vacacional: qué es y cómo se calcula',
  },
} as const satisfies Readonly<Record<string, PageLink>>;

/** The defaults: $15,000 a month for 7 years and 260 days, dismissed with no cause. */
export const FINIQUITO_DEFAULTS = {
  wage: '15000',
  period: 'month',
  zone: 'general',
  start: '2019-03-01',
  end: '2026-11-15',
  exit: 'unjustifiedDismissal',
  refused: false,
  taken: '4',
  unpaid: '15',
} as const;

/** The case of the defaults, and each variant the page works out. */
const DEFAULT_CASE: FiniquitoInput = {
  wageCents: 1_500_000,
  period: 'month',
  zone: 'general',
  start: date(2019, 3, 1),
  end: date(2026, 11, 15),
  exit: 'unjustifiedDismissal',
  refusedReinstatement: false,
  vacationTaken: 4,
  unpaidDays: 15,
};

const FIRST_YEAR: FiniquitoInput = {
  wageCents: MINIMUM,
  period: 'day',
  zone: 'general',
  start: date(2026, 2, 1),
  end: date(2026, 8, 31),
  exit: 'resignation',
  refusedReinstatement: false,
  vacationTaken: 0,
  unpaidDays: 0,
};

const FIFTEEN_YEARS: FiniquitoInput = {
  wageCents: 1_200_000,
  period: 'month',
  zone: 'general',
  start: date(2011, 7, 1),
  end: date(2026, 6, 30),
  exit: 'resignation',
  refusedReinstatement: false,
  vacationTaken: 0,
  unpaidDays: 5,
};

const LABELS: Readonly<Record<FiniquitoKey, string>> = {
  service: 'Tiempo de servicio',
  sdi: 'Salario diario integrado para las indemnizaciones (art. 89)',
  unpaid: 'Días trabajados sin pagar',
  aguinaldo: 'Aguinaldo proporcional (art. 87)',
  vacaciones: 'Vacaciones pendientes y proporcionales (arts. 76 y 79)',
  prima: 'Prima vacacional del 25% (art. 80)',
  antiguedad: 'Prima de antigüedad (art. 162)',
  finiquito: 'Finiquito',
  indemnizacion: 'Indemnización de 3 meses (arts. 48 y 50, fr. III)',
  veinte: '20 días por año (art. 50, fr. II)',
  liquidacion: 'Indemnizaciones de la liquidación',
  exempt: 'Parte exenta de ISR (LISR art. 93)',
  taxable: 'Parte gravada (el ISR no se calcula aquí)',
};

const PERIODS: readonly (readonly [WagePeriod, string])[] = [
  ['month', 'Por mes'],
  ['day', 'Por día'],
];

const ZONES: readonly (readonly [WageZone, string])[] = [
  ['general', 'Resto del país'],
  ['border', 'Zona Libre de la Frontera Norte'],
];

const EXITS: readonly (readonly [Exit, string])[] = [
  ['unjustifiedDismissal', 'Despido injustificado'],
  ['justifiedDismissal', 'Despido justificado'],
  ['resignation', 'Renuncia voluntaria'],
];

const sections = (): LongTailSection[] => {
  const base = finiquitoOf(DEFAULT_CASE);
  const refused = finiquitoOf({ ...DEFAULT_CASE, refusedReinstatement: true });
  const first = finiquitoOf(FIRST_YEAR);
  const fifteen = finiquitoOf(FIFTEEN_YEARS);
  const daily = pesosOf(base.dailyCents);
  const taken = DEFAULT_CASE.vacationTaken;
  const service = finiquitoTextOf(base).values.service;
  const anniversary = nextAnniversaryOf(DEFAULT_CASE.start, base.years - 1);
  const nextDays = vacationDaysFor(base.years + 1);
  return [
    {
      id: 'finiquito-o-liquidacion',
      heading: 'Finiquito o liquidación: qué te toca según cómo termina tu trabajo',
      paragraphs: [
        'El finiquito es lo que te deben al terminar cualquier relación de trabajo, renuncies o te despidan: los días trabajados que no te han pagado, la parte del aguinaldo del año, las vacaciones que no tomaste con su prima y, cuando aplica, la prima de antigüedad. La liquidación es el finiquito más las indemnizaciones de un despido injustificado.',
      ],
      table: {
        caption: 'Qué incluye el pago al terminar la relación de trabajo',
        head: ['Concepto', 'Renuncia', 'Despido justificado', 'Despido injustificado'],
        rows: [
          ['Días trabajados sin pagar', 'Sí', 'Sí', 'Sí'],
          ['Aguinaldo proporcional (art. 87)', 'Sí', 'Sí', 'Sí'],
          ['Vacaciones y prima vacacional (arts. 76, 79 y 80)', 'Sí', 'Sí', 'Sí'],
          ['Prima de antigüedad (art. 162)', 'Con 15 años o más', 'Sí', 'Sí'],
          ['3 meses de salario (arts. 48 y 50)', 'No', 'No', 'Sí'],
          ['20 días por año (art. 50)', 'No', 'No', 'Si el patrón no te reinstala'],
        ],
      },
      after: [
        'El artículo 33 dice que «es nula la renuncia que los trabajadores hagan de los salarios devengados, de las indemnizaciones y demás prestaciones que deriven de los servicios prestados», y que todo convenio o liquidación debe hacerse por escrito, con el detalle de los derechos que comprende.',
      ],
    },
    {
      id: 'como-se-calcula',
      heading: 'Cómo se calcula, línea por línea',
      paragraphs: [
        `El caso de la calculadora: ${pesosOf(DEFAULT_CASE.wageCents)} al mes, del ${dateText(DEFAULT_CASE.start)} al ${dateText(DEFAULT_CASE.end)}, despido injustificado, ${String(taken)} días de vacaciones ya tomados desde el último aniversario y ${String(DEFAULT_CASE.unpaidDays)} días sin pagar.`,
      ],
      steps: [
        `Salario diario: ${pesosOf(DEFAULT_CASE.wageCents)} / 30 = ${daily} (art. 89). Tiempo de servicio, contando tu último día: ${service}.`,
        `Días sin pagar: ${String(DEFAULT_CASE.unpaidDays)} × ${daily} = ${pesosOf(base.unpaidCents)}.`,
        `Aguinaldo proporcional: del 1 de enero al ${shortDateOf(DEFAULT_CASE.end)} van ${String(base.aguinaldo.daysWorked)} días; ${daily} × 15 × ${String(base.aguinaldo.daysWorked)} / 365 = ${pesosOf(base.aguinaldo.amountCents)}.`,
        `Vacaciones: los ${String(base.pendingVacationDays)} días del año ${String(base.years)}, cumplido el ${dateText(anniversary)}, menos ${String(taken)} tomados, más la parte del año en curso, ${String(nextDays)} × ${String(base.extraDays)} / 365 = ${hundredthsDaysText(base.proportionalHundredths)}: ${hundredthsDaysText(base.vacationHundredths)} × ${daily} = ${pesosOf(base.vacationCents)}.`,
        `Prima vacacional: 25% de ${pesosOf(base.vacationCents)} = ${pesosOf(base.primaVacacionalCents)}.`,
        `Prima de antigüedad: 12 × (${String(base.years)} + ${String(base.extraDays)}/365) = ${hundredthsDaysText(base.antiguedad.earnedHundredths)} × ${pesosOf(base.antiguedad.baseCents)} = ${pesosOf(base.antiguedadCents)}. Tu salario está bajo el tope de ${pesosOf(base.antiguedad.capCents)}, el doble del mínimo (art. 486).`,
        `Finiquito: ${pesosOf(base.finiquitoCents)}.`,
        `Salario integrado: ${daily} × (365 + 15 de aguinaldo + ${String(base.sdi.vacationDays)} × 25% de prima) / 365 = ${pesosOf(base.sdi.sdiCents)}. Indemnización de 3 meses: ${String(INDEMNIZACION_DAYS)} × ${pesosOf(base.sdi.sdiCents)} = ${pesosOf(base.indemnizacionCents)}.`,
        `Total: ${pesosOf(base.finiquitoCents)} + ${pesosOf(base.liquidacionCents)} = ${pesosOf(base.totalCents)}.`,
      ],
      after: [
        'La calculadora usa lo mínimo de la ley: 15 días de aguinaldo y una prima vacacional del 25%. Si tu contrato da más, tu finiquito es mayor. Los «tres meses» se cuentan como 90 días de salario integrado, y la parte de un año incompleto se cuenta en proporción a sus días.',
      ],
    },
    {
      id: 'veinte-dias',
      heading: 'La indemnización de 3 meses y los 20 días por año',
      paragraphs: [
        'Si te despiden sin causa justificada, el artículo 48 te deja pedir que te reinstalen o que te indemnicen «con el importe de tres meses de salario». El artículo 89 dice que las indemnizaciones se pagan con tu salario integrado: la cuota diaria más la parte proporcional de tus prestaciones.',
        `Los 20 días de salario por cada año de servicio (art. 50, fr. II) no se pagan en todo despido. Se suman cuando el patrón queda eximido de reinstalarte y te indemniza (art. 49: menos de un año de antigüedad, trabajadores de confianza, trabajo del hogar, entre otros casos), cuando se niega a someterse al juicio o a cumplir la sentencia (art. 947), o cuando tú te separas por una falta del patrón (art. 52). Si solo pides la indemnización y el patrón no se niega a reinstalarte, son los 3 meses. Por eso la calculadora los deja como opción: márcala si tu caso es uno de esos.`,
        `En el caso de la calculadora, los 20 días son ${String(VEINTE_DIAS_PER_YEAR)} × ${pesosOf(refused.sdi.sdiCents)} × (${String(refused.years)} + ${String(refused.extraDays)}/365) = ${pesosOf(refused.veinteDiasCents)}; las indemnizaciones suben a ${pesosOf(refused.liquidacionCents)} y el total a ${pesosOf(refused.totalCents)}.`,
        'La calculadora supone un contrato por tiempo indeterminado; con uno por tiempo determinado, la fracción I del artículo 50 es otra cuenta. Tampoco suma los salarios vencidos, de hasta 12 meses desde el despido si el patrón no prueba la causa en el juicio (art. 48): dependen de cuánto dure y de cómo termine.',
      ],
    },
    {
      id: 'isr',
      heading: 'Qué parte paga ISR',
      paragraphs: [
        `La Ley del ISR exenta, por separación, las primas de antigüedad y las indemnizaciones «hasta por el equivalente a noventa veces el salario mínimo general» por cada año de servicio, y «toda fracción de más de seis meses se considerará un año completo» (art. 93, fr. XIII). Desde la desindexación de 2016 se cuenta en UMA: 90 × ${UMA} = ${SEPARATION_UMA} por año en 2026.`,
        `En el caso de la calculadora son ${String(base.isr.exemptYears)} años (los ${String(base.extraDays)} días del último pasan de seis meses): ${String(base.isr.exemptYears)} × ${SEPARATION_UMA} = ${pesosOf(SEPARATION_EXEMPT_UMA * UMA_2026.dailyCents * base.isr.exemptYears)}. Además, la fracción XIV exenta el aguinaldo hasta 30 UMA (${pesosOf(AGUINALDO_EXEMPT_CENTS)}) y la prima vacacional hasta 15 UMA (${pesosOf(PRIMA_EXEMPT_CENTS)}) por año de calendario. Los días sin pagar y las vacaciones pagan ISR como salario.`,
        'La calculadora no calcula el ISR que te retienen. Por lo que pasa de la exención, la ley separa una cantidad igual a tu «último sueldo mensual ordinario», que paga como sueldo, y al resto le aplica la tasa que resulte de ese cálculo (arts. 95 y 96). Esa tasa depende de tu sueldo y de lo que ganaste en el año, así que el resultado sería una cifra que no podemos garantizar. Con la calculadora de ISR ves la retención de tu sueldo mensual.',
      ],
      links: [LINKS.isr],
    },
    {
      id: 'ejemplos',
      heading: 'Más ejemplos resueltos',
      paragraphs: ['Dos renuncias, con los salarios de 2026:'],
      steps: [
        `Renuncia en el primer año con el salario mínimo (${pesosOf(MINIMUM)} al día), del ${dateText(FIRST_YEAR.start)} al ${dateText(FIRST_YEAR.end)}: aguinaldo de ${String(first.aguinaldo.daysWorked)} días, ${pesosOf(first.aguinaldo.amountCents)}; vacaciones, 12 × ${String(first.extraDays)} / 365 = ${hundredthsDaysText(first.vacationHundredths)}, ${pesosOf(first.vacationCents)}; prima vacacional, ${pesosOf(first.primaVacacionalCents)}. Sin prima de antigüedad, que en la renuncia pide 15 años: finiquito de ${pesosOf(first.finiquitoCents)}.`,
        `Renuncia a los 15 años con ${pesosOf(FIFTEEN_YEARS.wageCents)} al mes (${pesosOf(fifteen.dailyCents)} al día), del ${dateText(FIFTEEN_YEARS.start)} al ${dateText(FIFTEEN_YEARS.end)}: prima de antigüedad de 12 × 15 × ${pesosOf(fifteen.dailyCents)} = ${pesosOf(fifteen.antiguedadCents)}, toda exenta de ISR; los ${hundredthsDaysText(fifteen.vacationHundredths)} de vacaciones del año 15, ${pesosOf(fifteen.vacationCents)}, y su prima, ${pesosOf(fifteen.primaVacacionalCents)}; aguinaldo, ${pesosOf(fifteen.aguinaldo.amountCents)}; ${String(FIFTEEN_YEARS.unpaidDays)} días sin pagar, ${pesosOf(fifteen.unpaidCents)}. Finiquito: ${pesosOf(fifteen.finiquitoCents)}.`,
      ],
    },
    {
      id: 'que-no-incluye',
      heading: 'Lo que la calculadora no incluye',
      paragraphs: [
        'Las vacaciones de años anteriores que no tomaste: se deben conceder en los seis meses siguientes a cada aniversario (art. 81) y la acción para cobrarlas prescribe en un año (art. 516). Tampoco incluye la PTU pendiente, las horas extras o bonos sin pagar ni las prestaciones de tu contrato que pasen de la ley.',
        'La prima de antigüedad se calcula con tu salario diario, del mínimo al doble del mínimo de tu zona (arts. 162, 485 y 486). La exención de 15 UMA de la prima vacacional y de 30 UMA del aguinaldo es por año de calendario: si ya cobraste parte de ellas este año, te queda menos exento.',
      ],
    },
    {
      id: 'revisa-tu-caso',
      heading: 'Antes de firmar: revisa tu caso',
      paragraphs: [
        'Esta calculadora da una estimación con las reglas generales de la ley, no una asesoría. Un abogado laboral o la Procuraduría Federal de la Defensa del Trabajo (PROFEDET) pueden revisar tu caso: la Procuraduría representa y asesora a los trabajadores (art. 530) y sus servicios «serán gratuitos» (art. 534).',
        'No dejes pasar el plazo: si te despidieron, tienes dos meses desde el día siguiente al despido para reclamar (art. 518), y el plazo se suspende al presentar la solicitud de conciliación. Lo primero es acudir al Centro de Conciliación de tu estado, o al federal si tu empresa es de competencia federal.',
      ],
    },
    {
      id: 'relacionadas',
      heading: 'Cada parte con su calculadora',
      paragraphs: [
        'Para revisar cada línea por separado, con sus tablas y ejemplos, y el salario integrado de las indemnizaciones:',
      ],
      links: [
        LINKS.aguinaldo,
        LINKS.vacaciones,
        LINKS.primaVacacional,
        LINKS.antiguedad,
        LINKS.sdi,
        LINKS.isr,
      ],
    },
  ];
};

/** The finiquito and liquidación calculator page: head, no-script result, sections. */
export const finiquitoPageOf = () => {
  const text = finiquitoTextOf(finiquitoOf(DEFAULT_CASE));
  return {
    title: titleOf('Calculadora de finiquito y liquidación 2026 (México)'),
    description:
      'Calcula tu finiquito y tu liquidación por despido injustificado con la Ley Federal del Trabajo: cada concepto con su artículo y la parte exenta de ISR, 2026.',
    kicker: 'México · Ley Federal del Trabajo y Ley del ISR',
    h1: FINIQUITO_NAME,
    lead: `Al renunciar o al ser despedido te toca un finiquito: días sin pagar, aguinaldo y vacaciones proporcionales, prima vacacional y, si aplica, prima de antigüedad. En un despido injustificado se suma la indemnización de 3 meses de salario integrado: la liquidación. Con ${pesosOf(DEFAULT_CASE.wageCents)} al mes y 7 años y 260 días de servicio, son ${text.figure}. Ingresa tus datos y ve cada línea con su artículo.`,
    labels: {
      wage: 'Salario',
      period: 'Periodo del salario',
      zone: 'Zona del salario mínimo',
      start: 'Fecha de ingreso',
      end: 'Último día de trabajo',
      exit: 'Cómo termina la relación de trabajo',
      refused: 'Sumar 20 días por año: el patrón no te reinstala (art. 50)',
      taken: 'Días de vacaciones tomados desde tu último aniversario',
      unpaid: 'Días trabajados sin pagar',
    },
    periods: PERIODS,
    zones: ZONES,
    exits: EXITS,
    defaults: FINIQUITO_DEFAULTS,
    invalid:
      'Revisa los datos: un salario mayor que cero, una fecha de ingreso anterior a tu último día y de 0 a 60 días de vacaciones tomados y sin pagar.',
    belowMinimum:
      'Tu salario es menor que el mínimo de tu zona: la prima de antigüedad se calcula con el salario mínimo (art. 485).',
    capped:
      'Tu salario pasa del doble del salario mínimo de tu zona: la prima de antigüedad se paga sobre ese doble (art. 486).',
    notOwed:
      'En la renuncia voluntaria, la prima de antigüedad se paga a partir de 15 años de servicio (art. 162, fracción III).',
    note: 'Es una estimación con lo mínimo de la ley (15 días de aguinaldo, prima vacacional del 25%) y un contrato por tiempo indeterminado. Separa la parte exenta y la gravada, pero no calcula el ISR que te retienen. No incluye salarios vencidos.',
    figureLabel: 'Total estimado: finiquito más indemnizaciones',
    breakdown: 'Cómo se forma tu finiquito o liquidación',
    paths: { es: FINIQUITO_PATH },
    result: {
      figure: text.figure,
      rows: (Object.keys(LABELS) as FiniquitoKey[]).map((key) => ({
        key,
        label: LABELS[key],
        value: text.values[key],
      })),
    },
    sections: sections(),
    sources: Object.values(FINIQUITO_SOURCES),
  };
};
