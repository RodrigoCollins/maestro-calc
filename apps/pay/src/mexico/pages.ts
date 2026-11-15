import { addDays, weekdayOf, type CivilDate } from '@maestro-calc/pay-core/calendar';
import {
  AGUINALDO_EXEMPT_CENTS,
  aguinaldoOf,
  MINIMUM_WAGE_2026,
  PRIMA_EXEMPT_CENTS,
  UMA_2026,
  VACATION_TABLE,
  vacacionesOf,
  type WagePeriod,
} from '@maestro-calc/pay-core/mexico';
import { DAYS_BETWEEN_PATH } from '../dates/routes.ts';
import { countOf, DAYS_BETWEEN_NAME, longDateOf, pesosOf, shortDateOf } from '../dates/words.ts';
import type { LongTailSection, LongTailSource } from '../long-tail/sections.ts';
import { titleOf } from '../seo/meta.ts';
import { LABOR_ARTICLE_LABELS, LABOR_ARTICLES, laborCalculatorLinks } from './labor-pages.ts';
import {
  AGUINALDO_PATH,
  ANTIGUEDAD_PATH,
  mexicoPathOf,
  SDI_PATH,
  VACACIONES_PATH,
  type MexicoSlug,
} from './routes.ts';
import { ANTIGUEDAD_NAME, SDI_NAME } from './labor-words.ts';
import {
  AGUINALDO_NAME,
  aguinaldoTextOf,
  hundredthsDaysText,
  VACACIONES_NAME,
  vacacionesTextOf,
  type AguinaldoKey,
  type VacacionesKey,
} from './words.ts';

/*
 * The Mexico labor pages (Spanish only): the aguinaldo and vacation calculators, with the result
 * the build works out for their defaults so they answer with no script, and four answer pages.
 * Every amount comes from the engine of `@maestro-calc/pay-core/mexico`; every rule from a cited
 * law or official notice. The components render them; `client/aguinaldo.ts` and
 * `client/vacaciones-mexico.ts` redo the results on every edit.
 */

/** The day the laws and the official figures below were read. */
export const CHECKED = '2026-11-15';

/** The primary sources: the laws as published and the official notices of the 2026 figures. */
export const MX_SOURCES = {
  lft: {
    label:
      'Ley Federal del Trabajo, arts. 76 a 81, 87 y 89 (texto vigente de la Cámara de Diputados, última reforma DOF 21-02-2025), Orden Jurídico Nacional, leído el 15 de noviembre de 2026',
    href: 'https://www.ordenjuridico.gob.mx/Documentos/Federal/wo125151.doc',
  },
  dof2022: {
    label:
      'DOF 27-12-2022: Decreto por el que se reforman los artículos 76 y 78 de la Ley Federal del Trabajo, en materia de vacaciones, leído el 15 de noviembre de 2026',
    href: 'https://dof.gob.mx/nota_detalle.php?codigo=5675889&fecha=27/12/2022',
  },
  lisr: {
    label:
      'Ley del Impuesto sobre la Renta, art. 93 fracción XIV (texto vigente, última reforma DOF 01-04-2024), Orden Jurídico Nacional, leído el 15 de noviembre de 2026',
    href: 'https://www.ordenjuridico.gob.mx/Documentos/Federal/wo25.doc',
  },
  desindexacion: {
    label:
      'DOF 27-01-2016: Decreto de desindexación del salario mínimo, artículo tercero transitorio (las menciones al salario mínimo como unidad de medida se entienden a la UMA), leído el 15 de noviembre de 2026',
    href: 'https://dof.gob.mx/nota_detalle.php?codigo=5423663&fecha=27/01/2016',
  },
  uma: {
    label:
      'INEGI, valor de la Unidad de Medida y Actualización 2026, DOF 09-01-2026: $117.31 diarios desde el 1 de febrero de 2026, leído el 15 de noviembre de 2026',
    href: 'https://dof.gob.mx/nota_detalle.php?codigo=5778072&fecha=09/01/2026',
  },
  conasami: {
    label:
      'CONASAMI, resolución que fija los salarios mínimos de 2026, DOF 09-12-2025: $315.04 diarios y $440.87 en la Zona Libre de la Frontera Norte, leído el 15 de noviembre de 2026',
    href: 'https://dof.gob.mx/nota_detalle.php?codigo=5775534&fecha=09/12/2025',
  },
} as const satisfies Readonly<Record<string, LongTailSource>>;

const MINIMUM = MINIMUM_WAGE_2026.generalCents;
const BORDER = MINIMUM_WAGE_2026.borderCents;
const UMA = pesosOf(UMA_2026.dailyCents);
const AGUINALDO_EXEMPT = pesosOf(AGUINALDO_EXEMPT_CENTS);
const PRIMA_EXEMPT = pesosOf(PRIMA_EXEMPT_CENTS);
const date = (y: number, m: number, d: number): CivilDate => ({ y, m, d });
const YEAR_START = date(2026, 1, 1);
const YEAR_END = date(2026, 12, 31);

const aguinaldo2026 = (wageCents: number, period: WagePeriod, days: number, start = YEAR_START) =>
  aguinaldoOf({ wageCents, period, days, start, end: YEAR_END });

/** The calculator a page links under its answer. */
interface CalculatorLink {
  readonly href: string;
  readonly label: string;
}

const AGUINALDO_LINK: CalculatorLink = { href: AGUINALDO_PATH, label: AGUINALDO_NAME };
const DAYS_BETWEEN_LINK: CalculatorLink = { href: DAYS_BETWEEN_PATH, label: DAYS_BETWEEN_NAME };
const VACACIONES_LINK: CalculatorLink = { href: VACACIONES_PATH, label: VACACIONES_NAME };
const ANTIGUEDAD_LINK: CalculatorLink = { href: ANTIGUEDAD_PATH, label: ANTIGUEDAD_NAME };
const SDI_LINK: CalculatorLink = { href: SDI_PATH, label: SDI_NAME };

const ARTICLE_LABELS: Readonly<Record<MexicoSlug, string>> = {
  'cuantos-dias-de-aguinaldo-son-por-ley': '¿Cuántos días de aguinaldo son por ley?',
  'aguinaldo-2026': 'Aguinaldo 2026: cuánto te toca y cuándo se paga',
  'cuantos-dias-de-vacaciones-son-por-ano': 'Días de vacaciones por ley en México',
  'prima-vacacional': 'Prima vacacional: qué es y cómo se calcula',
  ...LABOR_ARTICLE_LABELS,
};

const articleLink = (slug: MexicoSlug): CalculatorLink => ({
  href: mexicoPathOf(slug),
  label: ARTICLE_LABELS[slug],
});

/** The links to every Mexico labor page, for the home and the hubs. */
export const mexicoLinks = (): readonly CalculatorLink[] => [
  AGUINALDO_LINK,
  VACACIONES_LINK,
  ...laborCalculatorLinks(),
  ...(Object.keys(ARTICLE_LABELS) as MexicoSlug[]).map(articleLink),
];

/** The defaults of the aguinaldo calculator: a whole 2026 at the general minimum wage. */
export const AGUINALDO_DEFAULTS = {
  wage: '315.04',
  period: 'day',
  days: '15',
  start: '2026-01-01',
  end: '2026-12-31',
} as const;

const AGUINALDO_LABELS: Readonly<Record<AguinaldoKey, string>> = {
  daily: 'Salario diario',
  worked: 'Días trabajados en el año',
  earned: 'Días de aguinaldo que te tocan',
  exempt: `Parte exenta de ISR (30 UMA, hasta ${AGUINALDO_EXEMPT})`,
  taxable: 'Parte gravada (sobre la que se retiene ISR)',
};

const PERIODS: readonly (readonly [WagePeriod, string])[] = [
  ['day', 'Por día'],
  ['month', 'Por mes'],
];

const aguinaldoSections = (): LongTailSection[] => {
  const whole = aguinaldo2026(MINIMUM, 'day', 15);
  const july = aguinaldo2026(MINIMUM, 'day', 15, date(2026, 7, 1));
  const monthly = aguinaldo2026(1_200_000, 'month', 15);
  return [
    {
      id: 'como-se-calcula',
      heading: 'Cómo se calcula el aguinaldo',
      paragraphs: [
        'El aguinaldo es el salario diario por los días de aguinaldo: 15 como mínimo por ley, o los que dé tu contrato si son más. Si no trabajaste el año completo, te toca la parte proporcional a los días trabajados.',
      ],
      steps: [
        `Año completo con el salario mínimo de 2026: ${pesosOf(MINIMUM)} × 15 días = ${pesosOf(whole.amountCents)}.`,
        `Si entraste el 1 de julio, del 1 de julio al 31 de diciembre trabajaste ${countOf(july.daysWorked, 'día', 'días')} (se cuentan los dos extremos).`,
        `Tu parte es 15 × ${String(july.daysWorked)} / 365 = ${hundredthsDaysText(july.earnedHundredths)} de salario.`,
        `${pesosOf(whole.amountCents)} × ${String(july.daysWorked)} / 365 = ${pesosOf(july.amountCents)} de aguinaldo proporcional.`,
      ],
    },
    {
      id: 'salario-mensual',
      heading: 'Si te pagan por mes',
      paragraphs: [
        `La ley divide el salario mensual entre 30 para el salario diario (art. 89). Con ${pesosOf(1_200_000)} al mes, el salario diario es ${pesosOf(monthly.dailyCents)} y 15 días de aguinaldo son ${pesosOf(monthly.amountCents)}. Si te pagan por semana, divide entre 7.`,
        'Usa tu salario por cuota diaria: lo que ganas por día sin horas extra ni bonos ocasionales. Si tu contrato da más de 15 días, escríbelos en «Días de aguinaldo».',
      ],
    },
    {
      id: 'isr',
      heading: 'La parte exenta de ISR',
      paragraphs: [
        `Los primeros 30 UMA del aguinaldo no pagan ISR (Ley del ISR, art. 93, fracción XIV). Con la UMA de 2026, ${UMA} al día, son ${AGUINALDO_EXEMPT}. Con ${pesosOf(1_200_000)} al mes, la parte gravada es ${pesosOf(monthly.amountCents)} − ${AGUINALDO_EXEMPT} = ${pesosOf(monthly.taxableCents)}.`,
        'La calculadora no calcula la retención de ISR de la parte gravada: depende de tu sueldo del mes y de la tarifa que aplique tu patrón. El aguinaldo que ves es bruto.',
      ],
    },
    {
      id: 'relacionadas',
      heading: 'Más sobre el aguinaldo y las vacaciones',
      paragraphs: [
        'Las reglas con sus fuentes, la otra prestación de cada año, la calculadora de fechas, para contar los días trabajados entre tu fecha de ingreso y tu último día (marca «Contar también el día de inicio»), y la prima de antigüedad, que también va en tu finiquito si dejas el trabajo.',
      ],
      links: [
        articleLink('cuantos-dias-de-aguinaldo-son-por-ley'),
        articleLink('aguinaldo-2026'),
        VACACIONES_LINK,
        DAYS_BETWEEN_LINK,
        ANTIGUEDAD_LINK,
      ],
    },
  ];
};

/** The aguinaldo calculator page: its head, its no-script result for the defaults, its sections. */
export const aguinaldoPageOf = () => {
  const text = aguinaldoTextOf(aguinaldo2026(MINIMUM, 'day', 15));
  return {
    title: titleOf('Calculadora de aguinaldo 2026: calcular el aguinaldo en México'),
    description:
      'Calculadora de aguinaldo 2026 para México: calcula tus 15 días de salario por ley, la parte proporcional si no trabajaste todo el año y lo exento de ISR.',
    kicker: 'México · Ley Federal del Trabajo',
    h1: AGUINALDO_NAME,
    lead: 'Para calcular tu aguinaldo, escribe tu salario, los días de aguinaldo y tu fecha de ingreso: ve cuánto te toca este año, la parte proporcional si entraste o saliste a mitad de año y cuánto está exento de ISR.',
    labels: {
      wage: 'Salario',
      period: 'Periodo del salario',
      days: 'Días de aguinaldo (15 mínimo por ley)',
      start: 'Fecha de ingreso',
      end: 'Último día que cuenta (31 de diciembre o tu fecha de salida)',
    },
    periods: PERIODS,
    defaults: AGUINALDO_DEFAULTS,
    invalid:
      'Revisa los datos: un salario mayor que cero, de 1 a 365 días y una fecha de ingreso anterior al último día.',
    belowMinimum:
      'La ley da al menos 15 días de aguinaldo (art. 87); con menos, tu patrón paga de menos.',
    note: `Aguinaldo bruto, antes de la retención de ISR de la parte gravada. UMA de 2026: ${UMA} al día.`,
    figureLabel: 'Tu aguinaldo',
    breakdown: 'Cómo se forma tu aguinaldo',
    paths: { es: AGUINALDO_PATH },
    result: {
      figure: text.figure,
      rows: (Object.keys(AGUINALDO_LABELS) as AguinaldoKey[]).map((key) => ({
        key,
        label: AGUINALDO_LABELS[key],
        value: text.values[key],
      })),
    },
    sections: aguinaldoSections(),
    sources: [MX_SOURCES.lft, MX_SOURCES.lisr, MX_SOURCES.uma, MX_SOURCES.conasami],
  };
};

/** The defaults of the vacation calculator: five years of service at the minimum wage. */
export const VACACIONES_DEFAULTS = {
  wage: '315.04',
  period: 'day',
  prima: '25',
  start: '2021-01-15',
  on: '2026-12-31',
} as const;

const VACACIONES_LABELS: Readonly<Record<VacacionesKey, string>> = {
  years: 'Años de servicio cumplidos',
  pay: 'Salario de los días de vacaciones',
  prima: 'Prima vacacional',
  exempt: `Prima exenta de ISR (15 UMA, hasta ${PRIMA_EXEMPT})`,
  taxable: 'Prima gravada',
  next: 'Tu siguiente año de servicio',
};

const vacacionesSections = (): LongTailSection[] => {
  const five = vacacionesOf({
    wageCents: MINIMUM,
    period: 'day',
    primaPercent: 25,
    start: date(2021, 1, 15),
    on: YEAR_END,
  });
  const eleven = vacacionesOf({
    wageCents: 1_500_000,
    period: 'month',
    primaPercent: 25,
    start: date(2015, 6, 1),
    on: YEAR_END,
  });
  return [
    {
      id: 'como-se-calcula',
      heading: 'Cómo se calculan las vacaciones y la prima',
      paragraphs: [
        'Los días salen de tus años de servicio cumplidos (art. 76); el pago de esos días es tu salario diario por los días, y la prima vacacional es al menos el 25% de ese pago (art. 80).',
      ],
      steps: [
        `Entraste el 15 de enero de 2021: al 31 de diciembre de 2026 llevas ${countOf(five.years, 'año cumplido', 'años cumplidos')}, que dan ${countOf(five.days, 'día', 'días')} de vacaciones.`,
        `Pago de los días: ${pesosOf(MINIMUM)} × ${String(five.days)} = ${pesosOf(five.payCents)}.`,
        `Prima vacacional: ${pesosOf(five.payCents)} × 25% = ${pesosOf(five.primaCents)}.`,
        `El ${longDateOf(five.next.date)} cumples ${String(five.years + 1)} años y te tocan ${countOf(five.next.days, 'día', 'días')}.`,
      ],
    },
    {
      id: 'isr-prima',
      heading: 'La prima vacacional y el ISR',
      paragraphs: [
        `La prima vacacional está exenta de ISR hasta 15 UMA al año (Ley del ISR, art. 93, fracción XIV): ${PRIMA_EXEMPT} en 2026. Con ${pesosOf(1_500_000)} al mes (${pesosOf(eleven.dailyCents)} al día) y ${String(eleven.years)} años de servicio te tocan ${countOf(eleven.days, 'día', 'días')}: ${pesosOf(eleven.payCents)} de salario y ${pesosOf(eleven.primaCents)} de prima, de los que ${pesosOf(eleven.primaExemptCents)} están exentos y ${pesosOf(eleven.primaTaxableCents)} son gravados.`,
        'El salario de los días de vacaciones es tu sueldo normal de esos días: no es un pago extra, y paga ISR como el resto de tu sueldo.',
      ],
    },
    {
      id: 'primer-ano',
      heading: 'Antes de cumplir el primer año',
      paragraphs: [
        'Las vacaciones se ganan al cumplir cada año de servicio. Si aún no cumples el primero, la calculadora te muestra los 12 días que te tocarán y la fecha en que los ganas.',
        'Si la relación de trabajo termina antes de cumplir el año, te toca una remuneración proporcional al tiempo trabajado (art. 79). Mientras sigas trabajando, las vacaciones no se pueden cambiar por dinero.',
      ],
    },
    {
      id: 'relacionadas',
      heading: 'La tabla completa, la prima y el aguinaldo',
      paragraphs: [
        'Los días de cada año de servicio, la prima vacacional explicada con ejemplos, la otra prestación de fin de año y el salario diario integrado, que suma las dos a tu salario.',
      ],
      links: [
        articleLink('cuantos-dias-de-vacaciones-son-por-ano'),
        articleLink('prima-vacacional'),
        AGUINALDO_LINK,
        SDI_LINK,
      ],
    },
  ];
};

/** The vacation calculator page: its head, its no-script result for the defaults, its sections. */
export const vacacionesPageOf = () => {
  const text = vacacionesTextOf(
    vacacionesOf({
      wageCents: MINIMUM,
      period: 'day',
      primaPercent: 25,
      start: date(2021, 1, 15),
      on: YEAR_END,
    }),
  );
  return {
    title: titleOf('Calculadora de vacaciones y prima vacacional (México)'),
    description:
      'Calcula cuántos días de vacaciones te tocan por tus años de servicio en México, su pago y tu prima vacacional del 25%, con la ley vigente desde 2023.',
    kicker: 'México · Ley Federal del Trabajo',
    h1: VACACIONES_NAME,
    lead: 'Escribe tu fecha de ingreso y tu salario: ve cuántos días de vacaciones te tocan por ley, cuánto es su pago, tu prima vacacional y cuándo ganas los días de tu siguiente año.',
    labels: {
      wage: 'Salario',
      period: 'Periodo del salario',
      prima: 'Prima vacacional, en % (25 mínimo por ley)',
      start: 'Fecha de ingreso',
      on: 'Fecha del cálculo',
    },
    periods: PERIODS,
    defaults: VACACIONES_DEFAULTS,
    invalid:
      'Revisa los datos: un salario mayor que cero, una prima de 1 a 100% y una fecha de ingreso anterior a la del cálculo.',
    belowMinimum:
      'La ley da una prima de al menos 25% (art. 80); con menos, tu patrón paga de menos.',
    notEarned: 'Aún no cumples tu primer año: son los días que ganas al cumplirlo.',
    note: 'Días laborables de vacaciones (art. 76). Al menos 12 deben ser continuos si tú los pides así (art. 78).',
    figureLabel: 'Tus días de vacaciones',
    breakdown: 'Pago y prima de tus vacaciones',
    paths: { es: VACACIONES_PATH },
    result: {
      figure: text.figure,
      rows: (Object.keys(VACACIONES_LABELS) as VacacionesKey[]).map((key) => ({
        key,
        label: VACACIONES_LABELS[key],
        value: text.values[key],
      })),
    },
    sections: vacacionesSections(),
    sources: [MX_SOURCES.lft, MX_SOURCES.dof2022, MX_SOURCES.lisr, MX_SOURCES.uma],
  };
};

/** An answer page: the answer first, its figures, the calculator, the explained sections. */
export interface MexicoArticle {
  readonly slug: MexicoSlug;
  readonly title: string;
  readonly description: string;
  readonly kicker: string;
  readonly h1: string;
  readonly lead: string;
  readonly answer: {
    readonly label: string;
    readonly figure: string;
    readonly rows: readonly { readonly label: string; readonly value: string }[];
  };
  readonly calculator: CalculatorLink;
  readonly sections: readonly LongTailSection[];
  readonly sources: readonly LongTailSource[];
  readonly checked: string;
  readonly paths: { readonly es: string };
  readonly others: readonly CalculatorLink[];
}

const DAYS_BY_LAW = (): LongTailSection[] => {
  const months = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  return [
    {
      id: 'que-dice-la-ley',
      heading: 'Qué dice la Ley Federal del Trabajo',
      paragraphs: [
        'El artículo 87 dice: «Los trabajadores tendrán derecho a un aguinaldo anual que deberá pagarse antes del día veinte de diciembre, equivalente a quince días de salario, por lo menos.»',
        'Y sigue: quienes no hayan cumplido el año de servicios, «independientemente de que se encuentren laborando o no en la fecha de liquidación del aguinaldo», tienen derecho a la parte proporcional, «conforme al tiempo que hubieren trabajado, cualquiera que fuere éste».',
        'Quince días es el mínimo: tu contrato individual o colectivo puede dar más, y entonces te toca lo que diga el contrato.',
      ],
    },
    {
      id: 'mas-de-15',
      heading: 'Cuánto es el aguinaldo de 15, 20, 30 o 40 días',
      paragraphs: [
        'Por un año completo, con el salario mínimo general de 2026 y con un salario de $500 al día:',
      ],
      table: {
        caption: 'Aguinaldo de un año completo por días de aguinaldo',
        head: [
          'Días de aguinaldo',
          `Con ${pesosOf(MINIMUM)} al día`,
          `Con ${pesosOf(50_000)} al día`,
        ],
        rows: [15, 20, 30, 40].map((days) => [
          countOf(days, 'día', 'días'),
          pesosOf(aguinaldo2026(MINIMUM, 'day', days).amountCents),
          pesosOf(aguinaldo2026(50_000, 'day', days).amountCents),
        ]),
      },
    },
    {
      id: 'proporcional',
      heading: 'El aguinaldo proporcional si entraste este año',
      paragraphs: [
        'Se cuentan los días del día de ingreso al 31 de diciembre, los dos incluidos, y se toma esa parte de los 365 días del año. Con 15 días de aguinaldo y el salario mínimo general de 2026:',
      ],
      table: {
        caption: 'Aguinaldo proporcional de 2026 por fecha de ingreso',
        head: ['Fecha de ingreso', 'Días trabajados', 'Días de aguinaldo', 'Aguinaldo'],
        rows: months.map((m) => {
          const result = aguinaldo2026(MINIMUM, 'day', 15, date(2026, m, 1));
          return [
            `${shortDateOf(date(2026, m, 1))} de 2026`,
            countOf(result.daysWorked, 'día', 'días'),
            hundredthsDaysText(result.earnedHundredths),
            pesosOf(result.amountCents),
          ];
        }),
      },
      after: [
        'Si dejas el trabajo antes de diciembre, la cuenta es la misma, del 1 de enero (o tu fecha de ingreso) a tu último día: el aguinaldo proporcional va en tu finiquito.',
      ],
    },
    {
      id: 'que-salario',
      heading: 'Con qué salario se calcula',
      paragraphs: [
        'Con tu salario diario. Si te pagan por semana se divide entre 7, y si te pagan por mes, entre 30 (art. 89): con $9,000 al mes, el salario diario es $300.00 y 15 días son $4,500.00.',
      ],
      questions: [
        {
          question: '¿Me toca aguinaldo si renuncio o me despiden antes de diciembre?',
          answer:
            'Sí: el artículo 87 da la parte proporcional a quien no cumplió el año, trabaje o no en la fecha del pago. Se calcula con los días trabajados del año.',
        },
        {
          question: '¿Y si solo trabajé unas semanas?',
          answer:
            'También: la parte proporcional se paga por el tiempo trabajado «cualquiera que fuere éste». Con un mes de 31 días y el salario mínimo de 2026 son $401.35.',
        },
        {
          question: '¿El aguinaldo paga ISR?',
          answer: `Solo la parte que pasa de 30 UMA (Ley del ISR, art. 93, fracción XIV): con la UMA de 2026, ${UMA} al día, los primeros ${AGUINALDO_EXEMPT} están exentos.`,
        },
      ],
    },
  ];
};

const AGUINALDO_2026 = (): LongTailSection[] => {
  const levels: readonly (readonly [string, number, WagePeriod])[] = [
    ['Salario mínimo general', MINIMUM, 'day'],
    ['Salario mínimo de la frontera norte', BORDER, 'day'],
    ['$12,000 al mes', 1_200_000, 'month'],
    ['$15,000 al mes', 1_500_000, 'month'],
    ['$20,000 al mes', 2_000_000, 'month'],
    ['$1,000 al día', 100_000, 'day'],
  ];
  return [
    {
      id: 'cifras-2026',
      heading: 'Las cifras oficiales de 2026',
      paragraphs: [
        `El salario mínimo general de 2026 es de ${pesosOf(MINIMUM)} al día y el de la Zona Libre de la Frontera Norte, ${pesosOf(BORDER)}, desde el 1 de enero (resolución de la CONASAMI, DOF del 9 de diciembre de 2025).`,
        `La UMA de 2026 es de ${UMA} al día, ${pesosOf(356_622)} al mes y ${pesosOf(4_279_464)} al año, desde el 1 de febrero de 2026 (INEGI, DOF del 9 de enero de 2026). Es la que cuenta para el aguinaldo de diciembre de 2026.`,
        `La Ley del ISR exenta el aguinaldo hasta 30 veces el salario mínimo (art. 93, fracción XIV); desde la reforma de desindexación de 2016, esa referencia se entiende a la UMA: 30 × ${UMA} = ${AGUINALDO_EXEMPT}.`,
      ],
    },
    {
      id: 'tabla-2026',
      heading: 'Cuánto te toca de aguinaldo en 2026',
      paragraphs: [
        'Por un año completo con los 15 días de la ley; la parte gravada es la que pasa de 30 UMA:',
      ],
      table: {
        caption: 'Aguinaldo 2026 de 15 días por salario',
        head: ['Salario', 'Salario diario', 'Aguinaldo', 'Exento de ISR', 'Gravado'],
        rows: levels.map(([label, cents, period]) => {
          const result = aguinaldo2026(cents, period, 15);
          return [
            label,
            pesosOf(result.dailyCents),
            pesosOf(result.amountCents),
            pesosOf(result.exemptCents),
            pesosOf(result.taxableCents),
          ];
        }),
      },
      after: [
        'Un salario mensual se divide entre 30 (art. 89): $20,000 al mes son $666.67 al día, y el aguinaldo sale de $20,000 × 15 / 30, sin redondear antes.',
        'El patrón retiene el ISR de la parte gravada junto con tu sueldo; esa retención depende de tu sueldo del mes, así que no la calculamos aquí.',
      ],
    },
  ];
};

const VACACIONES_LAW = (): LongTailSection[] => [
  {
    id: 'tabla',
    heading: 'Tabla de vacaciones por años de servicio',
    paragraphs: [
      'Los días de cada año de servicio, con el pago de esos días y la prima vacacional mínima del 25% al salario mínimo general de 2026:',
    ],
    table: {
      caption: 'Días de vacaciones por año de servicio (art. 76)',
      head: ['Años de servicio', 'Días de vacaciones', 'Pago de los días', 'Prima del 25%'],
      rows: VACATION_TABLE.map(({ from, to, days }) => {
        const result = vacacionesOf({
          wageCents: MINIMUM,
          period: 'day',
          primaPercent: 25,
          start: date(2026 - from, 1, 1),
          on: date(2026, 1, 1),
        });
        return [
          from === to ? countOf(from, 'año', 'años') : `${String(from)} a ${String(to)} años`,
          countOf(days, 'día', 'días'),
          pesosOf(result.payCents),
          pesosOf(result.primaCents),
        ];
      }),
    },
    after: [
      'Después de 35 años la cuenta sigue igual: 2 días más por cada cinco años de servicio.',
    ],
  },
  {
    id: 'la-reforma',
    heading: 'Vacaciones dignas: la reforma de 2023',
    paragraphs: [
      'El decreto publicado en el DOF el 27 de diciembre de 2022 reformó los artículos 76 y 78 y entró en vigor el 1 de enero de 2023. El artículo 76 dice hoy que quien tenga más de un año de servicios disfruta de un periodo anual de vacaciones pagadas «que en ningún caso podrá ser inferior a doce días laborables, y que aumentará en dos días laborables, hasta llegar a veinte, por cada año subsecuente de servicios. A partir del sexto año, el periodo de vacaciones aumentará en dos días por cada cinco de servicios».',
      'El decreto se aplica también a los contratos individuales y colectivos que ya existían, siempre que sea más favorable para la persona trabajadora (artículo segundo transitorio).',
    ],
  },
  {
    id: 'como-se-toman',
    heading: 'Cómo y cuándo se toman',
    paragraphs: [
      'Son días laborables: los días de descanso no se cuentan como vacaciones. De los días que te tocan, al menos 12 deben ser continuos, y puedes repartir el resto como lo necesites (art. 78).',
      'El patrón debe darte las vacaciones dentro de los seis meses siguientes a que cumples cada año, y entregarte cada año una constancia con tu antigüedad, tus días y la fecha en que debes disfrutarlos (art. 81).',
      'Las vacaciones no se pueden cambiar por dinero. Si la relación de trabajo termina antes de que cumplas el año, te toca una remuneración proporcional al tiempo trabajado (art. 79).',
    ],
  },
  {
    id: 'prima',
    heading: 'La prima vacacional',
    paragraphs: [
      `Además del salario de esos días, te toca una prima de al menos el 25% (art. 80). Con el salario mínimo de 2026 y 12 días son ${pesosOf(MINIMUM * 12)} de salario y ${pesosOf((MINIMUM * 12) / 4)} de prima. La prima no paga ISR hasta 15 UMA al año: ${PRIMA_EXEMPT} en 2026 (Ley del ISR, art. 93, fracción XIV).`,
    ],
  },
];

/** The vacation pay and prima of `years` of service on 1 January 2026, at the 25% of the law. */
const primaOf = (wageCents: number, period: WagePeriod, years: number) =>
  vacacionesOf({
    wageCents,
    period,
    primaPercent: 25,
    start: date(2026 - years, 1, 1),
    on: date(2026, 1, 1),
  });

const PRIMA_VACACIONAL = (): LongTailSection[] => {
  const three = primaOf(1_200_000, 'month', 3);
  const ten = primaOf(2_000_000, 'month', 10);
  const salaries: readonly (readonly [number, WagePeriod])[] = [
    [MINIMUM, 'day'],
    [1_200_000, 'month'],
    [2_000_000, 'month'],
  ];
  return [
    {
      id: 'que-es',
      heading: 'Qué es la prima vacacional',
      paragraphs: [
        'El artículo 80 de la Ley Federal del Trabajo dice: «Los trabajadores tendrán derecho a una prima no menor de veinticinco por ciento sobre los salarios que les correspondan durante el período de vacaciones.»',
        'Es un pago aparte del salario de los días de vacaciones: tu patrón te paga esos días como si los trabajaras y, además, la prima. El 25% es el mínimo; tu contrato individual o colectivo puede dar más, y entonces te toca lo que diga el contrato.',
        'Se calcula sobre el salario de los días de vacaciones, no sobre tu sueldo del mes ni del año: por eso crece con tu antigüedad, porque los días de vacaciones crecen (art. 76).',
      ],
    },
    {
      id: 'formula',
      heading: 'La fórmula de la prima vacacional',
      paragraphs: [
        'Prima vacacional = salario diario × días de vacaciones × 25%. Si te pagan por mes, el salario diario es el mensual entre 30; si te pagan por semana, entre 7 (art. 89). Con 3 años de servicio y $12,000 al mes:',
      ],
      steps: [
        `Salario diario: ${pesosOf(1_200_000)} / 30 = ${pesosOf(three.dailyCents)}.`,
        `Días de vacaciones al cumplir 3 años (art. 76): ${countOf(three.days, 'día', 'días')}.`,
        `Salario de los días de vacaciones: ${pesosOf(three.dailyCents)} × ${String(three.days)} = ${pesosOf(three.payCents)}.`,
        `Prima vacacional: ${pesosOf(three.payCents)} × 25% = ${pesosOf(three.primaCents)}.`,
      ],
    },
    {
      id: 'tabla',
      heading: 'Prima vacacional por años de servicio',
      paragraphs: [
        'La prima del 25% de cada año de servicio, con los días de la tabla vigente desde 2023 (art. 76), al salario mínimo general de 2026 y con dos sueldos mensuales:',
      ],
      table: {
        caption: 'Prima vacacional del 25% por años de servicio y salario',
        head: [
          'Años de servicio',
          'Días de vacaciones',
          `Con ${pesosOf(MINIMUM)} al día`,
          `Con ${pesosOf(1_200_000)} al mes`,
          `Con ${pesosOf(2_000_000)} al mes`,
        ],
        rows: VACATION_TABLE.map(({ from, to, days }) => [
          from === to ? countOf(from, 'año', 'años') : `${String(from)} a ${String(to)} años`,
          countOf(days, 'día', 'días'),
          ...salaries.map(([cents, period]) => pesosOf(primaOf(cents, period, from).primaCents)),
        ]),
      },
      after: [
        'Con una prima mayor que la de la ley, cambia el 25% por tu porcentaje: con el 50%, la prima es el doble de la de la tabla.',
      ],
    },
    {
      id: 'cuando-se-paga',
      heading: 'Cuándo se paga la prima vacacional',
      paragraphs: [
        'La ley no fija una fecha de pago para la prima: el artículo 80 la calcula sobre los salarios del periodo de vacaciones, y lo usual es que se pague junto con ellos, cuando sales de vacaciones. Tu contrato colectivo o el reglamento de tu empresa pueden fijar la fecha.',
        'Las vacaciones se ganan al cumplir cada año de servicio, y el patrón debe darlas dentro de los seis meses siguientes, con una constancia anual de tu antigüedad, tus días y la fecha en que debes disfrutarlos (art. 81).',
      ],
    },
    {
      id: 'isr',
      heading: 'La prima vacacional y el ISR',
      paragraphs: [
        `La prima vacacional no paga ISR hasta 15 UMA al año (Ley del ISR, art. 93, fracción XIV). Con la UMA de 2026, ${UMA} al día, son ${PRIMA_EXEMPT}; solo lo que pasa de esa cantidad es gravado.`,
        `Con ${pesosOf(2_000_000)} al mes y 10 años de servicio te tocan ${countOf(ten.days, 'día', 'días')}: ${pesosOf(ten.payCents)} de salario y ${pesosOf(ten.primaCents)} de prima, de los que ${pesosOf(ten.primaExemptCents)} están exentos y ${pesosOf(ten.primaTaxableCents)} son gravados. El salario de los días de vacaciones paga ISR como el resto de tu sueldo.`,
      ],
    },
    {
      id: 'preguntas',
      heading: 'Preguntas frecuentes',
      paragraphs: ['Lo que más se pregunta de la prima vacacional, con el artículo que lo dice.'],
      questions: [
        {
          question: '¿La prima vacacional es el 25% de mi sueldo mensual?',
          answer: `No: es el 25% del salario de tus días de vacaciones (art. 80). Con ${pesosOf(1_200_000)} al mes y 12 días, es ${pesosOf(primaOf(1_200_000, 'month', 1).primaCents)}, no ${pesosOf(300_000)}.`,
        },
        {
          question: '¿Me pueden pagar menos del 25%?',
          answer:
            'No: el artículo 80 dice una prima «no menor de veinticinco por ciento». Un contrato puede dar más, nunca menos.',
        },
        {
          question: '¿Me toca prima vacacional antes de cumplir un año?',
          answer:
            'Las vacaciones se ganan al cumplir cada año de servicio (art. 76), y la prima se calcula sobre su salario. Si la relación de trabajo termina antes de cumplir el año, el artículo 79 te da una remuneración proporcional al tiempo de servicios prestados.',
        },
        {
          question: '¿Puedo cambiar mis vacaciones por dinero?',
          answer:
            'No mientras sigas trabajando: «Las vacaciones no podrán compensarse con una remuneración» (art. 79). Tomas los días con su salario y su prima.',
        },
      ],
    },
  ];
};

/** The last day the aguinaldo of `year` can be paid: the day before 20 December. */
const aguinaldoDeadlineOf = (year: number): CivilDate => addDays(date(year, 12, 20), -1);

const WEEKDAY_NAMES = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

const ARTICLES: Readonly<
  Record<MexicoSlug, () => Omit<MexicoArticle, 'slug' | 'paths' | 'checked'>>
> = {
  'cuantos-dias-de-aguinaldo-son-por-ley': () => {
    const whole = aguinaldo2026(MINIMUM, 'day', 15);
    return {
      title: titleOf('¿Cuántos días de aguinaldo son por ley?'),
      description:
        'Por ley son 15 días de salario como mínimo, pagados antes del 20 de diciembre (LFT art. 87), o la parte proporcional si no trabajaste el año completo.',
      kicker: 'México · Aguinaldo',
      h1: '¿Cuántos días de aguinaldo son por ley?',
      lead: 'Por ley, el aguinaldo es de 15 días de salario como mínimo y se paga antes del 20 de diciembre (Ley Federal del Trabajo, art. 87). Si no trabajaste el año completo, te toca la parte proporcional a los días trabajados.',
      answer: {
        label: 'Aguinaldo mínimo por ley',
        figure: countOf(15, 'día', 'días'),
        rows: [
          { label: 'Se paga', value: 'antes del 20 de diciembre' },
          { label: `Con ${pesosOf(MINIMUM)} al día (2026)`, value: pesosOf(whole.amountCents) },
          { label: 'Si no trabajaste todo el año', value: 'la parte proporcional' },
        ],
      },
      calculator: AGUINALDO_LINK,
      sections: DAYS_BY_LAW(),
      sources: [MX_SOURCES.lft, MX_SOURCES.conasami, MX_SOURCES.lisr, MX_SOURCES.uma],
      others: [
        articleLink('aguinaldo-2026'),
        articleLink('cuantos-dias-de-vacaciones-son-por-ano'),
      ],
    };
  },
  'aguinaldo-2026': () => {
    const deadline = aguinaldoDeadlineOf(2026);
    const twentieth = WEEKDAY_NAMES[weekdayOf(date(2026, 12, 20))] ?? '';
    const whole = aguinaldo2026(MINIMUM, 'day', 15);
    return {
      title: titleOf('Aguinaldo 2026: cuánto te toca y cuándo se paga'),
      description: `El aguinaldo 2026 se paga a más tardar el ${longDateOf(deadline)}. Con el salario mínimo son ${pesosOf(whole.amountCents)}; ${AGUINALDO_EXEMPT} no pagan ISR.`,
      kicker: 'México · Aguinaldo 2026',
      h1: 'Aguinaldo 2026: cuánto te toca y cuándo se paga',
      lead: `El aguinaldo 2026 debe pagarse antes del 20 de diciembre; como el 20 cae en ${twentieth}, el último día es el ${longDateOf(deadline)}. Con el salario mínimo de 2026, ${pesosOf(MINIMUM)} al día, 15 días son ${pesosOf(whole.amountCents)}, y los primeros ${AGUINALDO_EXEMPT} (30 UMA) no pagan ISR.`,
      answer: {
        label: 'Último día para pagar el aguinaldo 2026',
        figure: shortDateOf(deadline),
        rows: [
          { label: 'Con el salario mínimo general', value: pesosOf(whole.amountCents) },
          {
            label: 'Con el mínimo de la frontera norte',
            value: pesosOf(aguinaldo2026(BORDER, 'day', 15).amountCents),
          },
          { label: 'Exento de ISR (30 UMA)', value: AGUINALDO_EXEMPT },
        ],
      },
      calculator: AGUINALDO_LINK,
      sections: AGUINALDO_2026(),
      sources: [
        MX_SOURCES.lft,
        MX_SOURCES.conasami,
        MX_SOURCES.uma,
        MX_SOURCES.lisr,
        MX_SOURCES.desindexacion,
      ],
      others: [articleLink('cuantos-dias-de-aguinaldo-son-por-ley'), VACACIONES_LINK],
    };
  },
  'cuantos-dias-de-vacaciones-son-por-ano': () => ({
    title: titleOf('Días de vacaciones por ley en México: tabla 2026'),
    description:
      'Vacaciones por ley en México: 12 días el primer año, 2 más por año hasta 20 en el quinto y, desde el sexto, 2 más cada cinco años (LFT art. 76, desde 2023).',
    kicker: 'México · Vacaciones',
    h1: 'Días de vacaciones por ley en México',
    lead: 'Los días de vacaciones por ley en México son 12 al cumplir el primer año, 2 más por cada año hasta llegar a 20 en el quinto y, a partir del sexto, 2 más por cada cinco años de servicio (Ley Federal del Trabajo, art. 76, reformado en 2023). Además, te toca una prima vacacional de al menos el 25%.',
    answer: {
      label: 'Vacaciones del primer año',
      figure: countOf(12, 'día', 'días'),
      rows: [
        { label: 'Al quinto año', value: countOf(20, 'día', 'días') },
        { label: 'Del sexto al décimo año', value: countOf(22, 'día', 'días') },
        { label: 'Prima vacacional mínima', value: '25%' },
      ],
    },
    calculator: VACACIONES_LINK,
    sections: VACACIONES_LAW(),
    sources: [MX_SOURCES.lft, MX_SOURCES.dof2022, MX_SOURCES.lisr, MX_SOURCES.uma],
    others: [
      articleLink('prima-vacacional'),
      articleLink('cuantos-dias-de-aguinaldo-son-por-ley'),
      AGUINALDO_LINK,
    ],
  }),
  'prima-vacacional': () => {
    const first = primaOf(MINIMUM, 'day', 1);
    const fifth = primaOf(MINIMUM, 'day', 5);
    return {
      title: titleOf('Prima vacacional 2026: qué es y cómo se calcula'),
      description:
        'La prima vacacional es al menos el 25% del salario de tus días de vacaciones (LFT art. 80). Fórmula, tabla por años de servicio, ISR y ejemplos de 2026.',
      kicker: 'México · Prima vacacional',
      h1: 'Prima vacacional: qué es, cuánto es y cómo se calcula',
      lead: `La prima vacacional es un pago de al menos el 25% del salario de tus días de vacaciones, además de ese salario (Ley Federal del Trabajo, art. 80). Con el salario mínimo de 2026, ${pesosOf(MINIMUM)} al día, y los 12 días del primer año, son ${pesosOf(first.primaCents)}.`,
      answer: {
        label: 'Prima vacacional mínima por ley',
        figure: '25%',
        rows: [
          { label: 'Primer año, 12 días, salario mínimo', value: pesosOf(first.primaCents) },
          { label: 'Quinto año, 20 días, salario mínimo', value: pesosOf(fifth.primaCents) },
          { label: 'Exenta de ISR hasta (15 UMA)', value: PRIMA_EXEMPT },
        ],
      },
      calculator: VACACIONES_LINK,
      sections: PRIMA_VACACIONAL(),
      sources: [MX_SOURCES.lft, MX_SOURCES.dof2022, MX_SOURCES.lisr, MX_SOURCES.uma],
      others: [articleLink('cuantos-dias-de-vacaciones-son-por-ano'), AGUINALDO_LINK, SDI_LINK],
    };
  },
  ...LABOR_ARTICLES,
};

/** The answer page of `slug`. */
export const mexicoArticleOf = (slug: MexicoSlug): MexicoArticle => ({
  slug,
  ...ARTICLES[slug](),
  checked: CHECKED,
  paths: { es: mexicoPathOf(slug) },
});
