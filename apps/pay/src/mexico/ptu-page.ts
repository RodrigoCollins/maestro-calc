import {
  EVENTUAL_MIN_DAYS,
  MINIMUM_WAGE_2026,
  PTU_CAP_DAYS,
  PTU_EXEMPT_CENTS,
  PTU_PERCENT,
  ptuOf,
  UMA_2026,
  type PtuBase,
  type PtuInput,
  type WagePeriod,
} from '@maestro-calc/pay-core/mexico';
import { pesosOf } from '../dates/words.ts';
import type { LongTailSection, LongTailSource } from '../long-tail/sections.ts';
import { titleOf } from '../seo/meta.ts';
import { FINIQUITO_SOURCES } from './finiquito-page.ts';
import { FINIQUITO_NAME } from './finiquito-words.ts';
import { SDI_NAME } from './labor-words.ts';
import { PTU_NAME, ptuTextOf, type PtuKey } from './ptu-words.ts';
import { AGUINALDO_PATH, FINIQUITO_PATH, ISR_PATH, PTU_PATH, SDI_PATH } from './routes.ts';
import { ISR_NAME } from './salary-words.ts';
import { AGUINALDO_NAME } from './words.ts';

/*
 * The PTU calculator of Mexico (Spanish only), with the result the build works out for its
 * defaults so it answers with no script. Every amount comes from `ptuOf` of
 * `@maestro-calc/pay-core/mexico`; every rule from the law as read first-hand. `client/ptu.ts`
 * redoes the result on every edit.
 */

const READ = 'leído el 16 de noviembre de 2026';

/** The laws as published and the official notices the page cites. */
export const PTU_SOURCES = {
  lft: {
    label: `Ley Federal del Trabajo, arts. 117 a 131, 516, 530 y 534 (texto vigente de la Cámara de Diputados, última reforma DOF 21-02-2025), Orden Jurídico Nacional, ${READ}`,
    href: 'https://www.ordenjuridico.gob.mx/Documentos/Federal/wo125151.doc',
  },
  comision: {
    label: `DOF 03-02-2009: Resolución del H. Consejo de Representantes de la Quinta Comisión Nacional para la Participación de los Trabajadores en las Utilidades de las Empresas, punto PRIMERO: «será del diez por ciento aplicable sobre la renta gravable», ${READ}`,
    href: 'https://dof.gob.mx/nota_detalle.php?codigo=5079190&fecha=03/02/2009',
  },
  lisr: {
    label: `Ley del Impuesto sobre la Renta, arts. 9, 93 fracción XIV y 150 (texto vigente, última reforma DOF 01-04-2024), Orden Jurídico Nacional, ${READ}`,
    href: 'https://www.ordenjuridico.gob.mx/Documentos/Federal/wo25.doc',
  },
  desindexacion: FINIQUITO_SOURCES.desindexacion,
  uma: FINIQUITO_SOURCES.uma,
  conasami: FINIQUITO_SOURCES.conasami,
} as const satisfies Readonly<Record<string, LongTailSource>>;

const MINIMUM = MINIMUM_WAGE_2026.generalCents;
const UMA = pesosOf(UMA_2026.dailyCents);

interface PageLink {
  readonly href: string;
  readonly label: string;
}

const LINKS = {
  aguinaldo: { href: AGUINALDO_PATH, label: AGUINALDO_NAME },
  sdi: { href: SDI_PATH, label: SDI_NAME },
  finiquito: { href: FINIQUITO_PATH, label: FINIQUITO_NAME },
  isr: { href: ISR_PATH, label: ISR_NAME },
} as const satisfies Readonly<Record<string, PageLink>>;

/** How the calculator works: with the company figures, or with the cap alone. */
export type PtuMode = 'exact' | 'cap';

/** The defaults: $12,000 a month all year, in a company with a renta gravable of $2,000,000. */
export const PTU_DEFAULTS = {
  mode: 'exact',
  wage: '12000',
  period: 'month',
  days: '365',
  base: 'profit',
  company: '2000000',
  totalDays: '7300',
  totalSalary: '3650000',
  past1: '',
  past2: '',
  past3: '',
} as const;

/** The case of the defaults, and each variant the page works out. */
const DEFAULT_CASE: PtuInput = {
  wageCents: 1_200_000,
  period: 'month',
  days: 365,
  company: {
    base: 'profit',
    amountCents: 200_000_000,
    totalDays: 7300,
    totalSalaryCents: 365_000_000,
  },
  pastCents: [0, 0, 0],
};

const CAPPED: PtuInput = {
  wageCents: MINIMUM,
  period: 'day',
  days: 365,
  company: {
    base: 'profit',
    amountCents: 500_000_000,
    totalDays: 1825,
    totalSalaryCents: 100_000_000,
  },
  pastCents: [2_000_000, 2_500_000, 3_000_000],
};

const ANNOUNCED: PtuInput = {
  wageCents: 987_654,
  period: 'month',
  days: 200,
  company: {
    base: 'amount',
    amountCents: 12_345_678,
    totalDays: 4321,
    totalSalaryCents: 234_567_890,
  },
  pastCents: [0, 0, 0],
};

const LABELS: Readonly<Record<PtuKey, string>> = {
  salary: 'Tu salario del año: cuota diaria × días (art. 124)',
  pool: 'PTU a repartir: 10% de la renta gravable (art. 120)',
  half: 'Cada una de las dos mitades (art. 123)',
  daysShare: 'Tu parte por días trabajados (art. 123)',
  salaryShare: 'Tu parte por salario (art. 123)',
  beforeCap: 'Suma de tus dos partes, antes del tope',
  capMonths: 'Tope de tres meses de salario (art. 127, fr. VIII)',
  capAverage: 'Promedio de tus últimos tres años (art. 127, fr. VIII)',
  cap: 'Tope que te aplica: el más favorable',
  exempt: 'Parte exenta de ISR: 15 UMA (LISR art. 93)',
  taxable: 'Parte gravada (el ISR no se calcula aquí)',
};

const MODES: readonly (readonly [PtuMode, string])[] = [
  ['exact', 'Con las cifras de la empresa'],
  ['cap', 'Estima con el tope (sin las cifras de la empresa)'],
];

const PERIODS: readonly (readonly [WagePeriod, string])[] = [
  ['month', 'Por mes'],
  ['day', 'Por día'],
];

const BASES: readonly (readonly [PtuBase, string])[] = [
  ['profit', 'Renta gravable de la empresa'],
  ['amount', 'PTU a repartir, ya calculada'],
];

const sections = (): LongTailSection[] => {
  const base = ptuOf(DEFAULT_CASE);
  const estimate = ptuOf({ ...DEFAULT_CASE, company: null });
  const capped = ptuOf(CAPPED);
  const average = ptuOf({ ...CAPPED, pastCents: [3_000_000, 3_200_000, 3_400_000] });
  const announced = ptuOf(ANNOUNCED);
  const eventual = ptuOf({ ...DEFAULT_CASE, days: 45 });
  const daily = pesosOf(base.dailyCents);
  const company = DEFAULT_CASE.company;
  const shares = base.company;
  if (company === null || shares === null) throw new Error('the default case has a company');
  const cappedShares = capped.company;
  const announcedShares = announced.company;
  const eventualShares = eventual.company;
  if (cappedShares === null || announcedShares === null || eventualShares === null)
    throw new Error('the worked cases have a company');
  const announcedCompany = ANNOUNCED.company;
  if (announcedCompany === null) throw new Error('the announced case has a company');
  return [
    {
      id: 'como-se-reparte',
      heading: 'Cómo se reparte la PTU, línea por línea',
      paragraphs: [
        `El caso de la calculadora: ganas ${pesosOf(DEFAULT_CASE.wageCents)} al mes y trabajaste los ${String(DEFAULT_CASE.days)} días del año en una empresa con una renta gravable de ${pesosOf(company.amountCents)}, cuyos trabajadores sumaron ${company.totalDays.toLocaleString('en-US')} días trabajados y ${pesosOf(company.totalSalaryCents)} de salarios.`,
      ],
      steps: [
        `PTU a repartir: el ${String(PTU_PERCENT)}% de la renta gravable, ${pesosOf(company.amountCents)} × 10% = ${pesosOf(shares.poolCents)} (arts. 117 y 120). Se divide en dos mitades de ${pesosOf(shares.halfCents)} (art. 123).`,
        `Tu salario del año: ${pesosOf(DEFAULT_CASE.wageCents)} / 30 = ${daily} de cuota diaria, × ${String(DEFAULT_CASE.days)} días = ${pesosOf(base.salaryCents)}. Cuenta solo la cuota diaria: sin aguinaldo, bonos ni horas extras (art. 124).`,
        `La mitad por días, igual para todos por cada día trabajado, sin importar el salario: ${pesosOf(shares.halfCents)} × ${String(DEFAULT_CASE.days)} / ${company.totalDays.toLocaleString('en-US')} = ${pesosOf(shares.daysShareCents)}.`,
        `La mitad por salario, en proporción a lo que ganaste: ${pesosOf(shares.halfCents)} × ${pesosOf(base.salaryCents)} / ${pesosOf(company.totalSalaryCents)} = ${pesosOf(shares.salaryShareCents)}.`,
        `Suma: ${pesosOf(shares.daysShareCents)} + ${pesosOf(shares.salaryShareCents)} = ${pesosOf(shares.beforeCapCents)}. El tope es de ${String(PTU_CAP_DAYS)} × ${daily} = ${pesosOf(base.capMonthsCents)}: no lo pasa, así que tu PTU es ${pesosOf(base.ptuCents)}.`,
        `De ella, ${pesosOf(base.exemptCents)} están exentos de ISR y ${pesosOf(base.taxableCents)} pagan ISR como un ingreso más.`,
      ],
      after: [
        'Si tu salario cambió en el año, la cuota diaria por los días no da exactamente lo que ganaste; con un salario variable, la ley toma el promedio de lo que percibiste en el año (art. 124).',
      ],
    },
    {
      id: 'sin-cifras',
      heading: 'Si no conoces las cifras de la empresa',
      paragraphs: [
        `Casi nadie conoce la renta gravable de su empresa ni los días y salarios de todos sus compañeros. Por eso la calculadora tiene la opción «Estima con el tope»: te da lo más que te puede tocar, el tope del artículo 127. En el caso de la calculadora son ${String(PTU_CAP_DAYS)} × ${daily} = ${pesosOf(estimate.ptuCents)}. Tu PTU real puede ser menor: depende de las utilidades de la empresa y de cuántos trabajadores la reparten.`,
        'Las cifras exactas te las debe dar la empresa. Dentro de los diez días siguientes a que presente su declaración anual, el patrón entrega a los trabajadores una copia, y sus anexos quedan a su disposición durante treinta días (art. 121). Una comisión con igual número de representantes de los trabajadores y del patrón hace el proyecto que fija la parte de cada trabajador y lo pone en un lugar visible; tienes quince días para hacer observaciones (art. 125).',
      ],
    },
    {
      id: 'tope',
      heading: 'El tope: tres meses de salario o el promedio de tres años',
      paragraphs: [
        'Desde la reforma de subcontratación de 2021, el artículo 127, fracción VIII, dice: «El monto de la participación de utilidades tendrá como límite máximo tres meses del salario del trabajador o el promedio de la participación recibida en los últimos tres años; se aplicará el monto que resulte más favorable al trabajador». La calculadora cuenta los tres meses como 90 días de tu cuota diaria y, si escribes la PTU que recibiste en cada uno de los últimos tres años, saca su promedio; un año que dejas vacío cuenta como $0.',
        `Un ejemplo con el salario mínimo de 2026 (${pesosOf(MINIMUM)} al día) en una empresa pequeña con mucha utilidad: ${pesosOf(cappedShares.poolCents)} a repartir, ${pesosOf(cappedShares.daysShareCents)} por días y ${pesosOf(cappedShares.salaryShareCents)} por salario, ${pesosOf(cappedShares.beforeCapCents)} en total. El tope es el mayor entre 90 × ${pesosOf(MINIMUM)} = ${pesosOf(capped.capMonthsCents)} y el promedio de $20,000, $25,000 y $30,000, que es ${pesosOf(capped.capAverageCents)}: te pagan ${pesosOf(capped.ptuCents)}.`,
        `Si en los últimos tres años recibiste $30,000, $32,000 y $34,000, el promedio, ${pesosOf(average.capAverageCents)}, es el más favorable y te pagan ${pesosOf(average.ptuCents)}.`,
      ],
    },
    {
      id: 'ejemplos',
      heading: 'Más ejemplos resueltos',
      paragraphs: ['Con la PTU que anuncia la empresa y con un año incompleto:'],
      steps: [
        `La empresa anuncia ${pesosOf(announcedShares.poolCents)} a repartir, entre ${announcedCompany.totalDays.toLocaleString('en-US')} días y ${pesosOf(announcedCompany.totalSalaryCents)} de salarios. Ganas ${pesosOf(ANNOUNCED.wageCents)} al mes y trabajaste ${String(ANNOUNCED.days)} días: tu salario del año es ${pesosOf(announced.salaryCents)}. Por días, ${pesosOf(announcedShares.halfCents)} × ${String(ANNOUNCED.days)} / ${announcedCompany.totalDays.toLocaleString('en-US')} = ${pesosOf(announcedShares.daysShareCents)}; por salario, ${pesosOf(announcedShares.halfCents)} × ${pesosOf(announced.salaryCents)} / ${pesosOf(announcedCompany.totalSalaryCents)} = ${pesosOf(announcedShares.salaryShareCents)}. PTU: ${pesosOf(announced.ptuCents)}.`,
        `En la empresa de la calculadora, con solo 45 días trabajados: ${pesosOf(eventualShares.daysShareCents)} por días y ${pesosOf(eventualShares.salaryShareCents)} por salario, ${pesosOf(eventual.ptuCents)}, todo exento de ISR. Si eres trabajador eventual, con menos de ${String(EVENTUAL_MIN_DAYS)} días no te toca (art. 127, fr. VII).`,
      ],
    },
    {
      id: 'fechas',
      heading: 'Cuándo te la pagan',
      paragraphs: [
        'El reparto se hace dentro de los sesenta días siguientes a la fecha en que la empresa debe pagar su impuesto anual (art. 122). Una empresa (persona moral) presenta su declaración anual en los tres meses siguientes al cierre del ejercicio, hasta el 31 de marzo (LISR art. 9): paga la PTU a más tardar el 30 de mayo. Un patrón persona física la presenta en abril (LISR art. 150): paga a más tardar el 29 de junio. La PTU del ejercicio 2026 se paga, entonces, a más tardar el 30 de mayo o el 29 de junio de 2027.',
        'Si no la cobras en el año en que puedes exigirla, se suma a la utilidad que se reparte el año siguiente (art. 122), y tu derecho a reclamarla prescribe en un año (art. 516). Si dejaste la empresa, también te toca la PTU de los días que trabajaste en ese ejercicio.',
      ],
    },
    {
      id: 'quien-no',
      heading: 'Quién no recibe PTU',
      paragraphs: [
        'Según el artículo 127: los directores, administradores y gerentes generales no participan (fr. I); los demás trabajadores de confianza sí, pero con su salario topado al del trabajador sindicalizado de más alto salario aumentado en un 20% (fr. II); los trabajadores del hogar no participan (fr. VI); y los trabajadores eventuales participan cuando trabajaron sesenta días durante el año, por lo menos (fr. VII). Las madres trabajadoras en sus periodos pre y postnatales y quien tiene una incapacidad temporal por riesgo de trabajo cuentan como trabajadores en servicio activo (fr. IV).',
        'Algunas empresas no reparten (art. 126): las de nueva creación en su primer año, las que elaboran un producto nuevo en sus dos primeros años, las de industria extractiva nuevas durante la exploración, las instituciones de asistencia privada, el IMSS y las instituciones públicas descentralizadas con fines culturales, asistenciales o de beneficencia, y las que tienen un capital menor del que fija la Secretaría del Trabajo. Si la empresa tuvo pérdidas, no hay renta gravable que repartir, y los años de pérdida no se compensan con los de ganancia (art. 128).',
      ],
    },
    {
      id: 'isr',
      heading: 'Qué parte paga ISR',
      paragraphs: [
        `La Ley del ISR exenta la participación en las utilidades «hasta por el equivalente a 15 días de salario mínimo general» (art. 93, fr. XIV). Desde la desindexación de 2016 se cuenta en UMA: 15 UMA, 15 × ${UMA} = ${pesosOf(PTU_EXEMPT_CENTS)} en 2026. Lo que pasa de eso paga ISR junto con tu sueldo del mes; la calculadora separa las dos partes, pero no calcula la retención, que depende de tu sueldo. Con la calculadora de ISR ves la de un salario mensual.`,
        'La PTU no forma parte de tu salario para las indemnizaciones (art. 129): no entra en el salario integrado de un finiquito o una liquidación.',
      ],
      links: [LINKS.isr],
    },
    {
      id: 'revisa-tu-caso',
      heading: 'Si no te pagan o no estás de acuerdo',
      paragraphs: [
        'Esta calculadora da una estimación con las reglas generales de la ley, no una asesoría. Si tu empresa no te paga o el reparto no cuadra con estas cuentas, la Procuraduría Federal de la Defensa del Trabajo (PROFEDET) asesora y representa a los trabajadores (art. 530) y sus servicios «serán gratuitos» (art. 534). Las objeciones a la declaración de la empresa se presentan ante el SAT por el sindicato o la mayoría de los trabajadores, dentro de los treinta días (art. 121).',
      ],
    },
    {
      id: 'relacionadas',
      heading: 'Las otras prestaciones del año',
      paragraphs: [
        'El aguinaldo de diciembre, el salario diario integrado, en el que la PTU no entra, y el finiquito, que debe incluir la PTU pendiente si dejas el trabajo:',
      ],
      links: [LINKS.aguinaldo, LINKS.sdi, LINKS.finiquito, LINKS.isr],
    },
  ];
};

/** The PTU calculator page: head, no-script result, sections. */
export const ptuPageOf = () => {
  const text = ptuTextOf(ptuOf(DEFAULT_CASE));
  return {
    title: titleOf('Calculadora de PTU 2026: reparto de utilidades'),
    description:
      'Calcula tu PTU con la Ley Federal del Trabajo: la mitad por días y la mitad por salario, el tope de 3 meses y la parte exenta de ISR. O estima solo con el tope.',
    kicker: 'México · Ley Federal del Trabajo, arts. 117 a 131',
    h1: PTU_NAME,
    lead: `La PTU es el 10% de la renta gravable de tu empresa, repartido entre los trabajadores: la mitad por los días trabajados y la mitad por el salario. Con ${pesosOf(DEFAULT_CASE.wageCents)} al mes todo el año, en una empresa con una renta gravable de $2,000,000, te tocan ${text.figure}. ¿No conoces las cifras de la empresa? Elige «Estima con el tope» y ve lo más que te puede tocar.`,
    labels: {
      mode: 'Cómo calcular',
      wage: 'Tu salario (cuota diaria, sin horas extras ni bonos)',
      period: 'Periodo del salario',
      days: 'Días que trabajaste en el año',
      base: 'Cifra de la empresa',
      company: 'Monto de la empresa',
      totalDays: 'Días trabajados por todos los trabajadores',
      totalSalary: 'Salarios de todos los trabajadores en el año',
      past1: 'PTU que recibiste el año pasado (opcional)',
      past2: 'PTU de hace dos años (opcional)',
      past3: 'PTU de hace tres años (opcional)',
    },
    modes: MODES,
    periods: PERIODS,
    bases: BASES,
    defaults: PTU_DEFAULTS,
    invalid:
      'Revisa los datos: un salario mayor que cero, de 0 a 366 días trabajados y cifras de la empresa que incluyan tus propios días y tu salario del año.',
    capped:
      'Tu parte pasa del tope: te pagan el tope, tres meses de salario o el promedio de tus últimos tres años, el que te favorezca más (art. 127, fr. VIII).',
    estimate:
      'Sin las cifras de la empresa, la cifra es el tope: lo más que te puede tocar. La exacta depende de la renta gravable y de los días y salarios de todos: el patrón te debe dar copia de su declaración anual (art. 121) y la comisión mixta publica la parte de cada trabajador (art. 125).',
    eventual:
      'Con menos de 60 días trabajados en el año, un trabajador eventual no recibe PTU (art. 127, fr. VII). Si eres de planta, sí te toca.',
    note: 'Es una estimación con las reglas generales de la ley: tu PTU la fija el proyecto de la comisión de tu empresa con sus cifras. No aplica el tope de salario de los trabajadores de confianza (art. 127, fr. II) ni calcula el ISR que te retienen.',
    figureLabel: 'Tu PTU estimada',
    breakdown: 'Cómo se forma tu PTU',
    paths: { es: PTU_PATH },
    result: {
      figure: text.figure,
      rows: (Object.keys(LABELS) as PtuKey[]).map((key) => ({
        key,
        label: LABELS[key],
        value: text.values[key],
      })),
    },
    sections: sections(),
    sources: Object.values(PTU_SOURCES),
  };
};
