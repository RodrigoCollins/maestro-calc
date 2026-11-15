import { MINIMUM_WAGE_2026, UMA_2026, vacationDaysFor } from '@maestro-calc/pay-core/mexico';
import {
  ISR_TARIFFS_2026,
  isrOf,
  netPayOf,
  SBC_CAP_CENTS,
  SBC_EXCESS_FLOOR_CENTS,
  SUBSIDY_2026,
  subsidyFor,
  type Isr,
  type PayPeriod,
  type TariffRow,
  type WageZone,
} from '@maestro-calc/pay-core/mexico-salary';
import { DAYS_BETWEEN_PATH } from '../dates/routes.ts';
import { DAYS_BETWEEN_NAME, pesosOf } from '../dates/words.ts';
import type { LongTailSection, LongTailSource } from '../long-tail/sections.ts';
import { titleOf } from '../seo/meta.ts';
import { MX_SOURCES } from './pages.ts';
import {
  AGUINALDO_PATH,
  ISR_PATH,
  mexicoPathOf,
  SUELDO_NETO_PATH,
  VACACIONES_PATH,
} from './routes.ts';
import {
  ISR_NAME,
  isrTextOf,
  netTextOf,
  percentOf,
  PERIOD_NAMES,
  SUELDO_NETO_NAME,
  type IsrKey,
  type NetKey,
} from './salary-words.ts';
import { AGUINALDO_NAME, VACACIONES_NAME } from './words.ts';

/*
 * The ISR and take-home pay calculators of Mexico (Spanish only), with the result the build
 * works out for their defaults so they answer with no script. Every amount comes from the engine
 * of `@maestro-calc/pay-core/mexico-salary`, every rule from a cited law or official publication.
 * `client/isr-mexico.ts` and `client/sueldo-neto.ts` redo the results on every edit.
 */

/** The primary sources of the two calculators, as published. */
export const SALARY_SOURCES = {
  anexo8: {
    label:
      'SAT, Anexo 8 de la Resolución Miscelánea Fiscal para 2026: tarifas para las retenciones del ISR del artículo 96 (7, 15 días y mensual), DOF 28-12-2025, leído el 15 de noviembre de 2026',
    href: 'https://www.sat.gob.mx/minisitio/NormatividadRMFyRGCE/documentos2026/rmf/anexos/Anexo-8-RMF-2026_DOF-28122025.pdf',
  },
  subsidio2026: {
    label:
      'DOF 31-12-2025: Decreto por el que se modifica el diverso que otorga el subsidio para el empleo (15.02% de la UMA mensual, ingresos de hasta $11,492.66 al mes), leído el 15 de noviembre de 2026',
    href: 'https://dof.gob.mx/nota_detalle.php?codigo=5777649&fecha=31/12/2025',
  },
  subsidio2024: {
    label:
      'DOF 01-05-2024: Decreto que otorga el subsidio para el empleo (la diferencia a favor no se entrega en efectivo), leído el 15 de noviembre de 2026',
    href: 'https://dof.gob.mx/nota_detalle.php?codigo=5725287&fecha=01/05/2024',
  },
  lisr96: {
    label:
      'Ley del Impuesto sobre la Renta, art. 96 (texto vigente, última reforma DOF 01-04-2024), Orden Jurídico Nacional, leído el 15 de noviembre de 2026',
    href: 'https://www.ordenjuridico.gob.mx/Documentos/Federal/wo25.doc',
  },
  lss: {
    label:
      'Ley del Seguro Social, arts. 25, 27, 28, 36, 106, 107, 147 y 168 y transitorio décimo noveno (texto vigente de la Cámara de Diputados, última reforma DOF 15-01-2026, copia del IMSS), leído el 15 de noviembre de 2026',
    href: 'https://www.imss.gob.mx/sites/all/statics/pdf/leyes/LSS.pdf',
  },
} as const satisfies Readonly<Record<string, LongTailSource>>;

const MINIMUM = MINIMUM_WAGE_2026.generalCents;
const BORDER = MINIMUM_WAGE_2026.borderCents;
const MINIMUM_MONTH = MINIMUM * 30;
const BORDER_MONTH = BORDER * 30;
const SUBSIDY_MONTH = subsidyFor('month');
const LIMIT = pesosOf(SUBSIDY_2026.limitCents);
const UMA_MONTH = pesosOf(SUBSIDY_2026.umaMonthlyCents);

/** A link to a page of the site. */
interface PageLink {
  readonly href: string;
  readonly label: string;
}

const ISR_LINK: PageLink = { href: ISR_PATH, label: ISR_NAME };
const SUELDO_NETO_LINK: PageLink = { href: SUELDO_NETO_PATH, label: SUELDO_NETO_NAME };
const RELATED: readonly PageLink[] = [
  { href: AGUINALDO_PATH, label: AGUINALDO_NAME },
  { href: VACACIONES_PATH, label: VACACIONES_NAME },
  { href: mexicoPathOf('prima-vacacional'), label: 'Prima vacacional: qué es y cómo se calcula' },
  { href: DAYS_BETWEEN_PATH, label: DAYS_BETWEEN_NAME },
];

/** The links to the two calculators, for the Spanish home. */
export const salaryLinks = (): readonly PageLink[] => [ISR_LINK, SUELDO_NETO_LINK];

const month = (grossCents: number, zone: WageZone = 'general'): Isr =>
  isrOf({ grossCents, period: 'month', zone });

/** The rows of a published tariff, as a table body. */
const tariffRows = (rows: readonly TariffRow[]): string[][] =>
  rows.map((row) => [
    pesosOf(row.lowerCents),
    row.upperCents === null ? 'En adelante' : pesosOf(row.upperCents),
    pesosOf(row.fixedCents),
    percentOf(row.rateBp),
  ]);

const TARIFF_HEAD = ['Límite inferior', 'Límite superior', 'Cuota fija', '% sobre el excedente'];

const PERIODS: readonly (readonly [PayPeriod, string])[] = (
  ['month', 'fortnight', 'week'] as const
).map((period) => [period, PERIOD_NAMES[period]]);

const ZONES: readonly (readonly [WageZone, string])[] = [
  ['general', 'Resto del país'],
  ['border', 'Zona Libre de la Frontera Norte'],
];

/** The defaults of the ISR calculator: $12,000 a month in the general zone. */
export const ISR_DEFAULTS = { wage: '12000', period: 'month', zone: 'general' } as const;

const ISR_LABELS: Readonly<Record<IsrKey, string>> = {
  lower: 'Límite inferior de tu renglón de la tarifa',
  excess: 'Excedente sobre el límite inferior',
  rate: 'Tasa sobre el excedente',
  marginal: 'Impuesto marginal (excedente × tasa)',
  fixed: 'Cuota fija',
  tariff: 'ISR según la tarifa',
  subsidy: 'Subsidio para el empleo aplicado',
};

const isrSections = (): LongTailSection[] => {
  const twelve = month(1_200_000);
  const minimum = month(MINIMUM_MONTH);
  const atLimit = month(SUBSIDY_2026.limitCents);
  const overLimit = month(SUBSIDY_2026.limitCents + 1);
  const examples: readonly (readonly [string, number])[] = [
    [`Salario mínimo (${pesosOf(MINIMUM)} × 30)`, MINIMUM_MONTH],
    [`${LIMIT} (límite del subsidio)`, SUBSIDY_2026.limitCents],
    ['$12,000', 1_200_000],
    ['$15,000', 1_500_000],
    ['$20,000', 2_000_000],
    ['$40,000', 4_000_000],
  ];
  const fortnight = isrOf({ grossCents: 600_000, period: 'fortnight', zone: 'general' });
  const week = isrOf({ grossCents: 250_000, period: 'week', zone: 'general' });
  return [
    {
      id: 'como-se-calcula',
      heading: 'Cómo se calcula el ISR de tu sueldo',
      paragraphs: [
        'Tu patrón busca tu sueldo del mes en la tarifa del artículo 96 de la Ley del ISR, le resta el límite inferior de su renglón, multiplica lo que sobra por el porcentaje del renglón y suma la cuota fija. Si tu ingreso no pasa del límite del subsidio para el empleo, le resta el subsidio. Con $12,000 al mes:',
      ],
      steps: [
        `$12,000 cae en el renglón de ${pesosOf(twelve.row.lowerCents)} a ${pesosOf(twelve.row.upperCents ?? 0)}.`,
        `Excedente: $12,000 − ${pesosOf(twelve.row.lowerCents)} = ${pesosOf(twelve.excessCents)}.`,
        `Impuesto marginal: ${pesosOf(twelve.excessCents)} × ${percentOf(twelve.row.rateBp)} = ${pesosOf(twelve.marginalCents)}.`,
        `ISR: ${pesosOf(twelve.marginalCents)} + ${pesosOf(twelve.row.fixedCents)} de cuota fija = ${pesosOf(twelve.tariffCents)}.`,
        `$12,000 pasa de ${LIMIT}, así que no hay subsidio: te retienen ${pesosOf(twelve.withheldCents)}.`,
      ],
    },
    {
      id: 'tarifa-mensual',
      heading: 'Tarifa mensual del ISR 2026',
      paragraphs: [
        'La tarifa para las retenciones mensuales de 2026, tal como la publicó el SAT en el Anexo 8 de la Resolución Miscelánea Fiscal (DOF del 28 de diciembre de 2025).',
      ],
      table: {
        caption: 'Tarifa mensual del artículo 96 de la Ley del ISR, 2026',
        head: TARIFF_HEAD,
        rows: tariffRows(ISR_TARIFFS_2026.month),
      },
    },
    {
      id: 'subsidio',
      heading: 'El subsidio para el empleo en 2026',
      paragraphs: [
        `Desde el 1 de enero de 2026, el subsidio para el empleo es el 15.02% de la UMA mensual para quien gana hasta ${LIMIT} al mes (decreto del DOF del 31 de diciembre de 2025). Con la UMA mensual de ${UMA_MONTH}, vigente desde el 1 de febrero, son ${pesosOf(SUBSIDY_MONTH)} al mes. En enero se calculó con el 15.59% de la UMA de 2025.`,
        `No baja poco a poco: con ${LIMIT} te toca completo y con un centavo más ya no te toca. Con ${LIMIT} la tarifa da ${pesosOf(atLimit.tariffCents)} y te retienen ${pesosOf(atLimit.withheldCents)}; con ${pesosOf(SUBSIDY_2026.limitCents + 1)} te retienen ${pesosOf(overLimit.withheldCents)}.`,
        'El subsidio solo reduce el ISR: si es mayor que tu impuesto, la diferencia no se te paga en efectivo ni se guarda para otro mes (decreto del DOF del 1 de mayo de 2024). Si te pagan por semana o por quincena, el subsidio es la parte de 30.4 días que corresponde a tu periodo.',
      ],
    },
    {
      id: 'ejemplos',
      heading: 'Cuánto ISR te retienen en 2026',
      paragraphs: ['Por un sueldo mensual, en el resto del país (fuera de la frontera norte):'],
      table: {
        caption: 'ISR mensual retenido en 2026 por sueldo',
        head: ['Sueldo mensual', 'ISR según la tarifa', 'Subsidio aplicado', 'ISR retenido'],
        rows: examples.map(([label, cents]) => {
          const isr = month(cents);
          return [
            label,
            pesosOf(isr.tariffCents),
            pesosOf(isr.subsidyAppliedCents),
            pesosOf(isr.withheldCents),
          ];
        }),
      },
      after: [
        `Con el salario mínimo la tarifa da ${pesosOf(minimum.tariffCents)}, pero no se retiene nada: la ley no permite retener ISR a quien gana solo el salario mínimo.`,
      ],
    },
    {
      id: 'salario-minimo',
      heading: 'Si ganas el salario mínimo',
      paragraphs: [
        `El artículo 96 de la Ley del ISR dice: «No se efectuará retención a las personas que en el mes únicamente perciban un salario mínimo general correspondiente al área geográfica del contribuyente.» En 2026 son ${pesosOf(MINIMUM)} al día (${pesosOf(MINIMUM_MONTH)} en 30 días) y ${pesosOf(BORDER)} en la Zona Libre de la Frontera Norte (${pesosOf(BORDER_MONTH)}).`,
        'La calculadora aplica esta regla cuando tu salario diario (el del periodo entre sus días: 30 al mes, 15 a la quincena, 7 a la semana) no pasa del mínimo de tu zona. Si además recibes horas extra u otros pagos gravados en el mes, ya no ganas «únicamente» el mínimo y sí puede haber retención.',
      ],
    },
    {
      id: 'tarifa-quincenal',
      heading: 'Tarifa quincenal del ISR 2026',
      paragraphs: [
        `Si te pagan cada 15 días, tu patrón usa esta tarifa (Anexo 8, apartado B, fracción IV). Con $6,000 a la quincena la tarifa da ${pesosOf(fortnight.tariffCents)}; como $6,000 llevados a un mes de 30.4 días pasan de ${LIMIT}, no hay subsidio y te retienen ${pesosOf(fortnight.withheldCents)}.`,
      ],
      table: {
        caption: 'Tarifa para pagos de 15 días, 2026',
        head: TARIFF_HEAD,
        rows: tariffRows(ISR_TARIFFS_2026.fortnight),
      },
    },
    {
      id: 'tarifa-semanal',
      heading: 'Tarifa semanal del ISR 2026',
      paragraphs: [
        `Para pagos de 7 días (fracción II). Con $2,500 a la semana la tarifa da ${pesosOf(week.tariffCents)} y el subsidio de la semana es ${pesosOf(week.subsidyCents)}: te retienen ${pesosOf(week.withheldCents)}.`,
      ],
      table: {
        caption: 'Tarifa para pagos de 7 días, 2026',
        head: TARIFF_HEAD,
        rows: tariffRows(ISR_TARIFFS_2026.week),
      },
      after: [
        'El decreto fija el límite del subsidio por mes. Para una semana o una quincena, la calculadora lleva tu pago a un mes de 30.4 días y lo compara con ese límite.',
      ],
    },
    {
      id: 'preguntas',
      heading: 'Preguntas frecuentes sobre el ISR de tu sueldo',
      paragraphs: [],
      questions: [
        {
          question: '¿El ISR se calcula sobre el sueldo bruto o el neto?',
          answer:
            'Sobre el bruto: el total de tus ingresos gravados del mes, antes de cualquier descuento. Las cuotas del IMSS que te descuentan no se restan antes de aplicar la tarifa.',
        },
        {
          question: '¿Por qué mi recibo de nómina dice otra cantidad?',
          answer:
            'Puede incluir horas extra, bonos o la parte gravada del aguinaldo, o tu patrón puede usar otra tarifa si te paga por periodos de 10 días. Además, al cerrar el año tu patrón calcula tu impuesto anual con la tarifa del artículo 152 (art. 97) y ajusta lo que te retuvo.',
        },
        {
          question: '¿Cuándo me toca el subsidio para el empleo?',
          answer: `Cuando tus ingresos del mes no pasan de ${LIMIT}. Si trabajas con dos patrones, solo uno te lo aplica: el que elijas por escrito antes del primer pago del año.`,
        },
        {
          question: '¿Esta calculadora sirve para enero de 2026?',
          answer: `La tarifa sí; el subsidio de enero fue el 15.59% de la UMA de 2025, no el 15.02% de la UMA de 2026. La calculadora usa ${pesosOf(SUBSIDY_MONTH)}, el de febrero a diciembre.`,
        },
      ],
    },
    {
      id: 'relacionadas',
      heading: 'Tu sueldo neto y tus prestaciones',
      paragraphs: [
        'El ISR es una de dos retenciones de tu sueldo: la otra son las cuotas del IMSS. La calculadora de sueldo neto resta las dos. El aguinaldo y la prima vacacional tienen su propia parte exenta de ISR.',
      ],
      links: [SUELDO_NETO_LINK, ...RELATED],
    },
  ];
};

/** The ISR calculator page: its head, its no-script result for the defaults, its sections. */
export const isrPageOf = () => {
  const text = isrTextOf(month(1_200_000));
  return {
    title: titleOf('Calculadora ISR 2026: ISR de tu sueldo mensual'),
    description:
      'Calculadora de ISR 2026: el impuesto que te retienen de tu sueldo mensual, quincenal o semanal con la tarifa del SAT y el subsidio para el empleo.',
    kicker: 'México · Ley del ISR, artículo 96',
    h1: ISR_NAME,
    lead: `Escribe tu sueldo bruto y el periodo de pago: ve el ISR que te retienen en 2026 con la tarifa oficial del SAT y el subsidio para el empleo. Con $12,000 al mes te retienen ${text.figure}.`,
    labels: {
      wage: 'Sueldo bruto del periodo',
      period: 'Periodo de pago',
      zone: 'Zona del salario mínimo',
    },
    periods: PERIODS,
    zones: ZONES,
    defaults: ISR_DEFAULTS,
    invalid: 'Escribe un sueldo mayor que cero, por ejemplo 12000 o 12,000.50.',
    belowMinimum:
      'Con el salario mínimo de tu zona no se retiene ISR (Ley del ISR, art. 96): la retención es $0.00.',
    note: `Es una estimación, no tu recibo de nómina: ISR de 2026, de febrero a diciembre, con el subsidio de ${pesosOf(SUBSIDY_MONTH)} al mes para ingresos de hasta ${LIMIT}. Solo sueldo: sin horas extra, aguinaldo ni otros pagos.`,
    figureLabel: 'ISR que te retienen',
    breakdown: 'Cómo se calcula tu ISR',
    paths: { es: ISR_PATH },
    result: {
      figure: text.figure,
      rows: (Object.keys(ISR_LABELS) as IsrKey[]).map((key) => ({
        key,
        label: ISR_LABELS[key],
        value: text.values[key],
      })),
    },
    sections: isrSections(),
    sources: [
      SALARY_SOURCES.anexo8,
      SALARY_SOURCES.subsidio2026,
      SALARY_SOURCES.subsidio2024,
      SALARY_SOURCES.lisr96,
      MX_SOURCES.uma,
      MX_SOURCES.conasami,
    ],
  };
};

/** The defaults of the take-home pay calculator: $20,000 a month, first year, general zone. */
export const SUELDO_NETO_DEFAULTS = { wage: '20000', years: '1', zone: 'general' } as const;

const NET_LABELS: Readonly<Record<NetKey, string>> = {
  gross: 'Sueldo bruto mensual',
  isr: 'ISR retenido (con el subsidio, si aplica)',
  sbc: 'Salario base de cotización diario (SBC)',
  excedente: 'IMSS: enfermedades y maternidad, excedente de 3 UMA (0.40%)',
  dinero: 'IMSS: prestaciones en dinero (0.25%)',
  pensionados: 'IMSS: gastos médicos de pensionados (0.375%)',
  invalidez: 'IMSS: invalidez y vida (0.625%)',
  cesantia: 'IMSS: cesantía en edad avanzada y vejez (1.125%)',
  imss: 'Total de cuotas del IMSS',
};

const sueldoNetoSections = (): LongTailSection[] => {
  const twenty = netPayOf({ monthlyCents: 2_000_000, years: 1, zone: 'general' });
  const eleven = netPayOf({ monthlyCents: 2_000_000, years: 11, zone: 'general' });
  const examples: readonly (readonly [string, number])[] = [
    [`Salario mínimo (${pesosOf(MINIMUM_MONTH)})`, MINIMUM_MONTH],
    ['$12,000', 1_200_000],
    ['$20,000', 2_000_000],
    ['$40,000', 4_000_000],
  ];
  const quotaRows: readonly (readonly [string, string, string, string])[] = [
    [
      'Enfermedades y maternidad, excedente',
      'Lo que tu SBC pasa de 3 UMA',
      '0.40%',
      'Art. 106, fr. II',
    ],
    ['Enfermedades y maternidad, en dinero', 'Tu SBC', '0.25%', 'Art. 107'],
    ['Gastos médicos de pensionados', 'Tu SBC', '0.375%', 'Art. 25'],
    ['Invalidez y vida', 'Tu SBC', '0.625%', 'Art. 147'],
    ['Cesantía en edad avanzada y vejez', 'Tu SBC', '1.125%', 'Art. 168, fr. II'],
  ];
  return [
    {
      id: 'paso-a-paso',
      heading: 'Cómo se calcula el sueldo neto, paso a paso',
      paragraphs: [
        'Tu sueldo neto es tu sueldo bruto menos dos retenciones de ley: el ISR y tus cuotas del IMSS. Con $20,000 al mes, en tu primer año:',
      ],
      steps: [
        `ISR: $20,000 está en el renglón de ${pesosOf(twenty.isr.row.lowerCents)}; ${pesosOf(twenty.isr.excessCents)} × ${percentOf(twenty.isr.row.rateBp)} + ${pesosOf(twenty.isr.row.fixedCents)} = ${pesosOf(twenty.isr.withheldCents)}, sin subsidio (pasa de ${LIMIT}).`,
        `Salario diario: $20,000 / 30 = ${pesosOf(twenty.dailyCents)}. Integrado con 15 días de aguinaldo y la prima del 25% de 12 días de vacaciones: × (365 + 15 + 3) / 365 = ${pesosOf(twenty.sbcCents)} de SBC.`,
        `Excedente de 3 UMA: (${pesosOf(twenty.sbcCents)} − ${pesosOf(SBC_EXCESS_FLOOR_CENTS)}) × 30 × 0.40% = ${pesosOf(twenty.quotas.excedente)}.`,
        `Sobre todo el SBC por 30 días: 0.25% = ${pesosOf(twenty.quotas.dinero)}, 0.375% = ${pesosOf(twenty.quotas.pensionados)}, 0.625% = ${pesosOf(twenty.quotas.invalidez)} y 1.125% = ${pesosOf(twenty.quotas.cesantia)}.`,
        `Cuotas del IMSS: ${pesosOf(twenty.imssCents)}. Sueldo neto: $20,000 − ${pesosOf(twenty.isr.withheldCents)} − ${pesosOf(twenty.imssCents)} = ${pesosOf(twenty.netCents)}.`,
      ],
    },
    {
      id: 'ejemplos',
      heading: 'Sueldo neto de $12,000, $20,000 y $40,000 en 2026',
      paragraphs: ['Mensual, primer año de servicio, en el resto del país:'],
      table: {
        caption: 'Sueldo neto mensual en 2026 por sueldo bruto',
        head: ['Sueldo bruto', 'ISR retenido', 'Cuotas del IMSS', 'Sueldo neto'],
        rows: examples.map(([label, cents]) => {
          const net = netPayOf({ monthlyCents: cents, years: 1, zone: 'general' });
          return [
            label,
            pesosOf(net.isr.withheldCents),
            pesosOf(net.imssCents),
            pesosOf(net.netCents),
          ];
        }),
      },
      after: [
        'Con el salario mínimo te queda completo: no se retiene ISR (Ley del ISR, art. 96) y tu patrón paga también tu parte de las cuotas del IMSS (Ley del Seguro Social, art. 36). La calculadora aplica esas dos reglas cuando tu salario diario no pasa del mínimo de tu zona.',
      ],
    },
    {
      id: 'cuotas-imss',
      heading: 'Las cuotas del IMSS que pagas tú',
      paragraphs: [
        'La Ley del Seguro Social reparte cada seguro entre el patrón, el trabajador y el gobierno. Tu parte, que el patrón te retiene al pagarte (art. 38), son estas cinco cuotas sobre tu salario base de cotización:',
      ],
      table: {
        caption: 'Cuotas obreras del IMSS en 2026',
        head: ['Seguro', 'Sobre', 'Tu cuota', 'Ley del Seguro Social'],
        rows: quotaRows.map((row) => [...row]),
      },
      after: [
        'En total, 2.375% de tu SBC más 0.40% de lo que pase de 3 UMA. El 0.40% es lo que quedó del 2% original después de bajar 0.16 puntos cada año de 1998 a 2007 (transitorio décimo noveno). El retiro (2%), la parte patronal de cesantía y vejez, los riesgos de trabajo y las guarderías los paga solo tu patrón.',
      ],
    },
    {
      id: 'salario-base',
      heading: 'El salario base de cotización',
      paragraphs: [
        `Las cuotas no se calculan sobre tu sueldo tal cual, sino sobre el salario base de cotización, que integra lo que recibes además del salario por día, como el aguinaldo y la prima vacacional (art. 27). Con las prestaciones mínimas de ley, el factor es (365 + 15 + días de vacaciones × 25%) / 365: 1.0493 en el primer año con 12 días.`,
        `Con más antigüedad hay más días de vacaciones y el SBC sube: con $20,000 al mes y 11 años de servicio (${String(vacationDaysFor(11))} días) el SBC es ${pesosOf(eleven.sbcCents)} y las cuotas son ${pesosOf(eleven.imssCents)}. El SBC tiene un tope de 25 UMA al día, ${pesosOf(SBC_CAP_CENTS)} en 2026 (art. 28). Si tu contrato da más aguinaldo, vales de despensa u otras prestaciones, tu SBC real es mayor.`,
        `La calculadora cuenta 30 días por mes. El IMSS cobra por los días del mes natural (art. 29), así que en un mes de 31 días las cuotas son un poco mayores.`,
      ],
    },
    {
      id: 'no-incluye',
      heading: 'Qué no incluye este sueldo neto',
      paragraphs: ['Solo las dos retenciones de ley sobre tu sueldo. No resta:'],
      steps: [
        'La aportación al INFONAVIT: la paga tu patrón, no sale de tu sueldo. Si tienes un crédito INFONAVIT o FONACOT, el abono que te descuentan sí reduce lo que recibes.',
        'El impuesto estatal sobre nóminas: lo paga tu patrón.',
        'Descuentos voluntarios o pactados: fondo o caja de ahorro, cuota sindical, seguros, préstamos de la empresa, y la pensión alimenticia ordenada por un juez.',
        'Pagos fuera del sueldo: horas extra, bonos, aguinaldo, prima vacacional o PTU, que tienen su propio cálculo.',
      ],
    },
    {
      id: 'preguntas',
      heading: 'Preguntas frecuentes sobre el sueldo neto',
      paragraphs: [],
      questions: [
        {
          question: '¿Qué es el sueldo neto?',
          answer:
            'Lo que recibes en tu cuenta: tu sueldo bruto, el que dice tu contrato, menos el ISR y las cuotas del IMSS que tu patrón te retiene para pagarlos por ti.',
        },
        {
          question: '¿Cuánto me descuentan de IMSS?',
          answer: `Entre el 2.5% y el 3% de tu sueldo: con $20,000 al mes, ${pesosOf(twenty.imssCents)}. Con el salario mínimo, nada: lo paga tu patrón.`,
        },
        {
          question: '¿Cómo calculo mi sueldo neto quincenal?',
          answer: `Con un sueldo mensual de $20,000 te pagan dos quincenas de $10,000; cada una lleva su propia retención con la tarifa quincenal. La calculadora de ISR hace el cálculo por quincena y por semana.`,
        },
        {
          question: '¿Las cuotas del IMSS se restan antes de calcular el ISR?',
          answer:
            'No: el ISR se calcula sobre tu sueldo bruto completo. Las dos retenciones se restan del bruto por separado.',
        },
      ],
    },
    {
      id: 'relacionadas',
      heading: 'El ISR, el aguinaldo y las vacaciones',
      paragraphs: [
        'La tarifa del ISR completa, mensual, quincenal y semanal, y las prestaciones de cada año con su parte exenta de ISR. Para contar los días trabajados entre dos fechas, la calculadora de fechas.',
      ],
      links: [ISR_LINK, ...RELATED],
    },
  ];
};

/** The take-home pay calculator page: head, no-script result for the defaults, sections. */
export const sueldoNetoPageOf = () => {
  const text = netTextOf(netPayOf({ monthlyCents: 2_000_000, years: 1, zone: 'general' }));
  return {
    title: titleOf('Calculadora de sueldo neto 2026 (México)'),
    description:
      'Calcula tu sueldo neto en México en 2026: tu sueldo bruto mensual menos el ISR y cada cuota del IMSS que te retienen, con ejemplos de $12,000 a $40,000.',
    kicker: 'México · Ley del ISR y Ley del Seguro Social',
    h1: SUELDO_NETO_NAME,
    lead: `Escribe tu sueldo bruto mensual: ve cuánto te queda después del ISR y de tus cuotas del IMSS, línea por línea. Con $20,000 al mes te quedan ${text.figure}.`,
    labels: {
      wage: 'Sueldo bruto mensual',
      years: 'Años de servicio cumplidos',
      zone: 'Zona del salario mínimo',
    },
    zones: ZONES,
    defaults: SUELDO_NETO_DEFAULTS,
    invalid: 'Escribe un sueldo mayor que cero y de 0 a 60 años de servicio.',
    belowMinimum:
      'Con el salario mínimo de tu zona no se retiene ISR (Ley del ISR, art. 96) y tu patrón paga tus cuotas del IMSS (Ley del Seguro Social, art. 36).',
    note: `Es una estimación, no tu recibo de nómina: mes de 30 días en 2026, de febrero a diciembre. SBC con 15 días de aguinaldo y prima vacacional del 25%, tope de 25 UMA (${pesosOf(SBC_CAP_CENTS)} al día). UMA: ${pesosOf(UMA_2026.dailyCents)}.`,
    figureLabel: 'Tu sueldo neto',
    breakdown: 'De tu sueldo bruto a tu sueldo neto',
    paths: { es: SUELDO_NETO_PATH },
    result: {
      figure: text.figure,
      rows: (Object.keys(NET_LABELS) as NetKey[]).map((key) => ({
        key,
        label: NET_LABELS[key],
        value: text.values[key],
      })),
    },
    sections: sueldoNetoSections(),
    sources: [
      SALARY_SOURCES.anexo8,
      SALARY_SOURCES.subsidio2026,
      SALARY_SOURCES.lisr96,
      SALARY_SOURCES.lss,
      MX_SOURCES.desindexacion,
      MX_SOURCES.uma,
      MX_SOURCES.conasami,
    ],
  };
};
