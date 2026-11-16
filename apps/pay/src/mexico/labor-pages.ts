import {
  horasExtrasOf,
  MINIMUM_WAGE_2026,
  primaAntiguedadOf,
  primaDominicalOf,
  SBC_CAP_CENTS,
  SDI_TABLE,
  sdiOf,
  UMA_2026,
  type Jornada,
  type WagePeriod,
  type WageZone,
} from '@maestro-calc/pay-core/mexico';
import { countOf, pesosOf } from '../dates/words.ts';
import type { LongTailSection, LongTailSource } from '../long-tail/sections.ts';
import { OVERTIME_PATHS } from '../overtime/texts.ts';
import { titleOf } from '../seo/meta.ts';
import type { MexicoArticle } from './pages.ts';
import {
  AGUINALDO_PATH,
  ANTIGUEDAD_PATH,
  mexicoPathOf,
  SDI_PATH,
  VACACIONES_PATH,
  type MexicoSlug,
} from './routes.ts';
import {
  ANTIGUEDAD_NAME,
  antiguedadTextOf,
  factorText,
  SDI_NAME,
  sdiTextOf,
  type AntiguedadKey,
  type SdiKey,
} from './labor-words.ts';
import { AGUINALDO_NAME, VACACIONES_NAME } from './words.ts';

/*
 * The second set of Mexico labor pages (Spanish only): the prima de antigüedad and salario diario
 * integrado calculators, with the result the build works out for their defaults so they answer
 * with no script, and the prima dominical and overtime answer pages. Every amount comes from the
 * engine of `@maestro-calc/pay-core/mexico`; every rule from the law as read first-hand.
 * `./pages.ts` lists these with the first set; this module imports it for types only.
 */

/** When the laws and the official figures below were read (the `CHECKED` of `./pages.ts`). */
const READ = 'leído el 15 de noviembre de 2026';

/** The laws as published and the official notices these pages cite. */
export const LABOR_SOURCES = {
  lft: {
    label: `Ley Federal del Trabajo, arts. 60, 61, 65, 66, 67, 68, 69, 71, 73, 75, 76, 80, 84, 87, 89, 162, 434, 436, 439, 485, 486 y 501 (texto vigente de la Cámara de Diputados, última reforma DOF 21-02-2025), Orden Jurídico Nacional, ${READ}`,
    href: 'https://www.ordenjuridico.gob.mx/Documentos/Federal/wo125151.doc',
  },
  lss: {
    label: `Ley del Seguro Social, arts. 27 a 30 (texto vigente de la Cámara de Diputados, última reforma DOF 15-01-2026, copia del IMSS), ${READ}`,
    href: 'https://www.imss.gob.mx/sites/all/statics/pdf/leyes/LSS.pdf',
  },
  lisr: {
    label: `Ley del Impuesto sobre la Renta, art. 93 fracciones I y XIV (texto vigente, última reforma DOF 01-04-2024), Orden Jurídico Nacional, ${READ}`,
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
const BORDER = MINIMUM_WAGE_2026.borderCents;
const UMA = pesosOf(UMA_2026.dailyCents);
const SBC_CAP = pesosOf(SBC_CAP_CENTS);
const date = (y: number, m: number, d: number) => ({ y, m, d });

interface PageLink {
  readonly href: string;
  readonly label: string;
}

const LINKS = {
  aguinaldo: { href: AGUINALDO_PATH, label: AGUINALDO_NAME },
  vacaciones: { href: VACACIONES_PATH, label: VACACIONES_NAME },
  antiguedad: { href: ANTIGUEDAD_PATH, label: ANTIGUEDAD_NAME },
  sdi: { href: SDI_PATH, label: SDI_NAME },
  primaVacacional: {
    href: mexicoPathOf('prima-vacacional'),
    label: 'Prima vacacional: qué es y cómo se calcula',
  },
  dominical: {
    href: mexicoPathOf('prima-dominical'),
    label: 'Prima dominical: qué es y cómo se calcula',
  },
  extras: {
    href: mexicoPathOf('como-se-pagan-las-horas-extras'),
    label: '¿Cómo se pagan las horas extras en México?',
  },
} as const satisfies Readonly<Record<string, PageLink>>;

/** The labels of the answer pages of this module, for the home and the other Mexico pages. */
export const LABOR_ARTICLE_LABELS = {
  'prima-dominical': LINKS.dominical.label,
  'como-se-pagan-las-horas-extras': LINKS.extras.label,
} as const;

/** The slugs of the answer pages this module writes. */
export type LaborSlug = keyof typeof LABOR_ARTICLE_LABELS;

/** The links to the two calculators of this module, for the home. */
export const laborCalculatorLinks = (): readonly PageLink[] => [LINKS.antiguedad, LINKS.sdi];

const PERIODS: readonly (readonly [WagePeriod, string])[] = [
  ['day', 'Por día'],
  ['month', 'Por mes'],
];

/** The span of years of service of a table row: `1 año`, `6 a 10 años`. */
const spanOf = (from: number, to: number): string =>
  from === to ? countOf(from, 'año', 'años') : `${String(from)} a ${String(to)} años`;

// ---------------------------------------------------------------- prima de antigüedad

/** The defaults of the prima de antigüedad calculator: 15 years at the minimum wage, by choice. */
export const ANTIGUEDAD_DEFAULTS = {
  wage: '315.04',
  period: 'day',
  zone: 'general',
  start: '2011-07-01',
  end: '2026-06-30',
  reason: 'voluntary',
} as const;

const ANTIGUEDAD_LABELS: Readonly<Record<AntiguedadKey, string>> = {
  service: 'Tiempo de servicio',
  base: 'Salario para la prima (del mínimo al doble del mínimo)',
  earned: 'Días de prima (12 por año de servicio)',
  whole: 'Solo con los años completos',
};

const ZONES: readonly (readonly [WageZone, string])[] = [
  ['general', 'Resto del país'],
  ['border', 'Zona Libre de la Frontera Norte'],
];

const REASONS: readonly (readonly [string, string])[] = [
  ['voluntary', 'Renuncia voluntaria'],
  ['dismissal', 'Despido, justificado o no'],
  ['justified', 'Te separas por causa justificada'],
  ['death', 'Fallecimiento del trabajador'],
];

/** The prima de antigüedad of one year of service on `wageCents` a day in `zone`. */
const oneYearOf = (wageCents: number, zone: WageZone) =>
  primaAntiguedadOf({
    wageCents,
    period: 'day',
    zone,
    start: date(2025, 7, 1),
    end: date(2026, 6, 30),
    reason: 'dismissal',
  });

const antiguedadSections = (): LongTailSection[] => {
  const fifteen = primaAntiguedadOf({
    wageCents: MINIMUM,
    period: 'day',
    zone: 'general',
    start: date(2011, 7, 1),
    end: date(2026, 6, 30),
    reason: 'voluntary',
  });
  const dismissal = primaAntiguedadOf({
    wageCents: 2_000_000,
    period: 'month',
    zone: 'general',
    start: date(2022, 1, 1),
    end: date(2026, 6, 30),
    reason: 'dismissal',
  });
  const ten = primaAntiguedadOf({
    wageCents: MINIMUM,
    period: 'day',
    zone: 'general',
    start: date(2016, 7, 1),
    end: date(2026, 6, 30),
    reason: 'voluntary',
  });
  const daysText = (hundredths: number): string => `${(hundredths / 100).toFixed(2)} días`;
  return [
    {
      id: 'que-dice-la-ley',
      heading: 'Qué dice el artículo 162',
      paragraphs: [
        'El artículo 162 de la Ley Federal del Trabajo dice que «Los trabajadores de planta tienen derecho a una prima de antigüedad», y su fracción I fija cuánto es: «La prima de antigüedad consistirá en el importe de doce días de salario, por cada año de servicios».',
        'La fracción II manda el salario a los artículos 485 y 486: no puede ser menor que el salario mínimo ni mayor que el doble del salario mínimo de tu zona. La fracción VI dice que se paga «independientemente de cualquier otra prestación»: va aparte de la indemnización, del aguinaldo proporcional y de las vacaciones que te deban.',
      ],
    },
    {
      id: 'quien-la-cobra',
      heading: 'Quién cobra la prima de antigüedad',
      paragraphs: [
        'Depende de cómo termina la relación de trabajo (art. 162, fracciones III y V):',
      ],
      table: {
        caption: 'Cuándo se paga la prima de antigüedad',
        head: ['Cómo termina', '¿Te toca?', 'Desde cuándo'],
        rows: [
          ['Renuncia voluntaria', 'Sí', 'Con 15 años de servicio o más (fr. III)'],
          ['Te separas por causa justificada', 'Sí', 'Con cualquier antigüedad (fr. III)'],
          ['Despido, justificado o injustificado', 'Sí', 'Con cualquier antigüedad (fr. III)'],
          [
            'Fallecimiento del trabajador',
            'Sí, a sus beneficiarios del art. 501',
            'Con cualquier antigüedad (fr. V)',
          ],
        ],
      },
      after: [
        'La ley también la da en la terminación colectiva de los trabajos por las causas del artículo 434, salvo la de su fracción IV (art. 436), y a quienes queden fuera por la implantación de maquinaria o procedimientos nuevos (art. 439).',
        'En la renuncia voluntaria, si en un año se retira más del 10% de los trabajadores de la empresa o de una categoría, el patrón puede pagar primero a los que se retiren antes o a los de mayor antigüedad y diferir al año siguiente el pago de los demás (fracción IV).',
      ],
    },
    {
      id: 'tope',
      heading: 'El tope: el doble del salario mínimo',
      paragraphs: [
        'El artículo 486 dice que, «si el salario que percibe el trabajador excede del doble del salario mínimo del área geográfica de aplicación a que corresponda el lugar de prestación del trabajo, se considerará esa cantidad como salario máximo». Y el 485, que la base «no podrá ser inferior al salario mínimo».',
        `Con los salarios mínimos de 2026, el tope es 2 × ${pesosOf(MINIMUM)} = ${pesosOf(2 * MINIMUM)} al día en el resto del país y 2 × ${pesosOf(BORDER)} = ${pesosOf(2 * BORDER)} en la Zona Libre de la Frontera Norte. La prima de un año de servicio (12 días) con cada salario:`,
      ],
      table: {
        caption: 'Prima de antigüedad de un año de servicio por salario diario y zona, 2026',
        head: ['Tu salario diario', 'Resto del país', 'Frontera norte'],
        rows: [MINIMUM, 50_000, 2 * MINIMUM, 80_000, 100_000, 150_000].map((cents) => [
          pesosOf(cents),
          pesosOf(oneYearOf(cents, 'general').amountCents),
          pesosOf(oneYearOf(cents, 'border').amountCents),
        ]),
      },
      after: [
        'Si te pagan por mes, divide entre 30 para el salario diario; si te pagan por semana, entre 7 (art. 89). Para las indemnizaciones, el mismo artículo 89 toma el salario del día en que nace el derecho, con la cuota diaria y la parte proporcional de las prestaciones del artículo 84: tu salario integrado. Si pasa del doble del mínimo, el tope del 486 deja la prima igual.',
      ],
      links: [LINKS.sdi],
    },
    {
      id: 'ejemplos',
      heading: 'Ejemplos resueltos',
      paragraphs: ['Tres casos con los salarios mínimos de 2026, en el resto del país:'],
      steps: [
        `Renuncia a los 15 años con el salario mínimo: del 1 de julio de 2011 al 30 de junio de 2026 son ${countOf(fifteen.years, 'año', 'años')}; 12 × 15 = ${String(fifteen.earnedHundredths / 100)} días; ${pesosOf(MINIMUM)} × 180 = ${pesosOf(fifteen.amountCents)}.`,
        `Despido a los 4 años y ${String(dismissal.extraDays)} días con ${pesosOf(2_000_000)} al mes: el salario diario es ${pesosOf(dismissal.dailyCents)}, más que el tope, así que la prima se paga sobre ${pesosOf(dismissal.baseCents)}. Son 12 × (4 + ${String(dismissal.extraDays)}/365) = ${daysText(dismissal.earnedHundredths)}: ${pesosOf(dismissal.amountCents)} (${pesosOf(dismissal.wholeYearsCents)} solo con los 4 años completos).`,
        `Renuncia a los ${String(ten.years)} años: no te toca prima de antigüedad, porque la renuncia voluntaria la pide de 15 años. Si te despiden con esos mismos ${String(ten.years)} años, sí: ${pesosOf(ten.amountCents)}.`,
      ],
    },
    {
      id: 'ano-incompleto',
      heading: 'El año que no completaste',
      paragraphs: [
        'El artículo 162 habla de doce días «por cada año de servicios» y no dice cómo contar el año que empezaste y no terminaste. La calculadora suma la parte de ese año en proporción a sus días; el renglón «Solo con los años completos» es la cuenta sin esa parte, para que veas las dos.',
        'Cuenta tu tiempo de servicio de tu fecha de ingreso a tu último día de trabajo, los dos incluidos.',
      ],
    },
    {
      id: 'relacionadas',
      heading: 'Lo demás que te toca al terminar',
      paragraphs: [
        'Al terminar la relación de trabajo también te toca el aguinaldo proporcional del año y las vacaciones que no tomaste, con su prima; y para una indemnización, tu salario integrado.',
      ],
      links: [LINKS.aguinaldo, LINKS.vacaciones, LINKS.sdi],
    },
  ];
};

/** The prima de antigüedad calculator page: its head, its no-script result, its sections. */
export const antiguedadPageOf = () => {
  const text = antiguedadTextOf(
    primaAntiguedadOf({
      wageCents: MINIMUM,
      period: 'day',
      zone: 'general',
      start: date(2011, 7, 1),
      end: date(2026, 6, 30),
      reason: 'voluntary',
    }),
  );
  return {
    title: titleOf('Calculadora de prima de antigüedad 2026 (México)'),
    description:
      'Calcula tu prima de antigüedad: 12 días de salario por año de servicio, con tope de dos salarios mínimos (LFT art. 162). Quién la cobra y ejemplos 2026.',
    kicker: 'México · Ley Federal del Trabajo',
    h1: ANTIGUEDAD_NAME,
    lead: 'La prima de antigüedad son 12 días de salario por cada año de servicio, con un salario de hasta el doble del mínimo (Ley Federal del Trabajo, arts. 162 y 486). Escribe tu salario, tus fechas y cómo termina tu trabajo: ve cuánto te toca y si te toca.',
    labels: {
      wage: 'Salario',
      period: 'Periodo del salario',
      zone: 'Zona del salario mínimo',
      start: 'Fecha de ingreso',
      end: 'Último día de trabajo',
      reason: 'Cómo termina la relación de trabajo',
    },
    periods: PERIODS,
    zones: ZONES,
    reasons: REASONS,
    defaults: ANTIGUEDAD_DEFAULTS,
    invalid:
      'Revisa los datos: un salario mayor que cero y una fecha de ingreso anterior a tu último día.',
    belowMinimum:
      'Tu salario es menor que el mínimo: la prima se calcula con el salario mínimo (art. 485).',
    capped:
      'Tu salario pasa del doble del salario mínimo de tu zona: la prima se paga sobre ese doble, el tope del artículo 486.',
    notOwed:
      'Con renuncia voluntaria, la prima se paga a partir de 15 años de servicio (art. 162, fracción III): con menos no te toca. Abajo ves cuánto sería.',
    note: 'Prima bruta. Cuenta el año incompleto en proporción a sus días; «Solo con los años completos» es la cuenta sin esa parte.',
    figureLabel: 'Tu prima de antigüedad',
    breakdown: 'Cómo se forma tu prima de antigüedad',
    paths: { es: ANTIGUEDAD_PATH },
    result: {
      figure: text.figure,
      rows: (Object.keys(ANTIGUEDAD_LABELS) as AntiguedadKey[]).map((key) => ({
        key,
        label: ANTIGUEDAD_LABELS[key],
        value: text.values[key],
      })),
    },
    sections: antiguedadSections(),
    sources: [LABOR_SOURCES.lft, LABOR_SOURCES.conasami],
  };
};

// ---------------------------------------------------------------- salario diario integrado

/** The defaults of the SDI calculator: the first year at the minimum wage. */
export const SDI_DEFAULTS = {
  wage: '315.04',
  period: 'day',
  aguinaldo: '15',
  prima: '25',
  start: '2026-01-15',
  on: '2026-12-31',
} as const;

const SDI_LABELS: Readonly<Record<SdiKey, string>> = {
  daily: 'Salario diario',
  year: 'Año de servicio en curso',
  factor: 'Factor de integración',
  aguinaldo: 'Aguinaldo por día (días ÷ 365)',
  prima: 'Prima vacacional por día',
  sbc: `Salario base de cotización del IMSS (tope 25 UMA, ${SBC_CAP})`,
};

const sdiAt = (wageCents: number, period: WagePeriod, completedYears: number) =>
  sdiOf({
    wageCents,
    period,
    aguinaldoDays: 15,
    primaPercent: 25,
    start: date(2026 - completedYears, 1, 1),
    on: date(2026, 1, 1),
  });

const sdiSections = (): LongTailSection[] => {
  const first = sdiAt(MINIMUM, 'day', 0);
  const high = sdiAt(10_000_000, 'month', 0);
  return [
    {
      id: 'que-es',
      heading: 'Qué es el salario diario integrado',
      paragraphs: [
        'El artículo 84 de la Ley Federal del Trabajo dice: «El salario se integra con los pagos hechos en efectivo por cuota diaria, gratificaciones, percepciones, habitación, primas, comisiones, prestaciones en especie y cualquiera otra cantidad o prestación que se entregue al trabajador por su trabajo.»',
        'La Ley del Seguro Social usa casi las mismas palabras para el salario base de cotización (art. 27). Por eso el salario diario integrado (SDI) es tu cuota diaria más la parte de cada día de tus prestaciones: como mínimo, el aguinaldo y la prima vacacional, que se pagan una vez al año.',
        'Para las indemnizaciones, la ley toma el salario del día en que nace el derecho, «incluyendo en él la cuota diaria y la parte proporcional de las prestaciones mencionadas en el artículo 84» (art. 89).',
      ],
    },
    {
      id: 'formula',
      heading: 'La fórmula y el factor de integración',
      paragraphs: [
        'SDI = salario diario × factor de integración, y el factor es (365 + días de aguinaldo + días de vacaciones × prima vacacional) / 365. Con el salario mínimo de 2026, en el primer año de servicio:',
      ],
      steps: [
        `Aguinaldo de 15 días repartido en el año: ${pesosOf(MINIMUM)} × 15 / 365 = ${pesosOf(first.aguinaldoDailyCents)} por día.`,
        `Prima vacacional: 12 días × 25% = 3 días; ${pesosOf(MINIMUM)} × 3 / 365 = ${pesosOf(first.primaDailyCents)} por día.`,
        `Factor de integración: (365 + 15 + 3) / 365 = 383 / 365 = ${factorText(first.factorTenThousandths)}.`,
        `SDI: ${pesosOf(MINIMUM)} × 383 / 365 = ${pesosOf(first.sdiCents)}.`,
      ],
      after: [
        'La calculadora usa la fracción exacta y redondea una sola vez, al final; con el factor ya redondeado a cuatro decimales el resultado puede variar un centavo.',
      ],
    },
    {
      id: 'tabla-factor',
      heading: 'Tabla del factor de integración 2026 por años de servicio',
      paragraphs: [
        'Con lo mínimo de la ley: 15 días de aguinaldo (art. 87), los días de vacaciones de cada año de servicio (art. 76, reformado en 2023) y una prima vacacional del 25% (art. 80). El año 1 va de tu ingreso a tu primer aniversario y usa los 12 días que ganas al cumplirlo:',
      ],
      table: {
        caption: 'Factor de integración y SDI por año de servicio, 2026',
        head: [
          'Año de servicio',
          'Días de vacaciones',
          'Factor',
          `SDI con ${pesosOf(MINIMUM)} al día`,
          `SDI con ${pesosOf(1_200_000)} al mes`,
        ],
        rows: SDI_TABLE.map(({ from, to, days, factorTenThousandths }) => [
          spanOf(from, to),
          countOf(days, 'día', 'días'),
          factorText(factorTenThousandths),
          pesosOf(sdiAt(MINIMUM, 'day', from - 1).sdiCents),
          pesosOf(sdiAt(1_200_000, 'month', from - 1).sdiCents),
        ]),
      },
      after: [
        'Antes de 2023 el primer año daba 6 días de vacaciones y el factor era (365 + 15 + 1.5) / 365 = 1.0452; con los 12 días de la reforma es 1.0493. Si tu contrato da más aguinaldo o más prima, escríbelos en la calculadora: el factor sube.',
      ],
    },
    {
      id: 'tope-imss',
      heading: 'El tope de 25 UMA del IMSS',
      paragraphs: [
        'El artículo 28 de la Ley del Seguro Social pone como límite superior del salario base de cotización «veinticinco veces el salario mínimo general que rija en el Distrito Federal» y como límite inferior «el salario mínimo general del área geográfica respectiva». Desde la desindexación de 2016, el límite superior se lee en UMA.',
        `Con la UMA de 2026, ${UMA} al día, el tope es 25 × ${UMA} = ${SBC_CAP}. Con ${pesosOf(10_000_000)} al mes, el SDI del primer año es ${pesosOf(high.sdiCents)}, pero el IMSS cotiza solo ${pesosOf(high.sbcCents)}. El SDI de la Ley Federal del Trabajo no tiene ese tope; la prima de antigüedad tiene el suyo (art. 486).`,
        'Si te pagan por semana, por quincena o por mes, el IMSS divide entre 7, 15 o 30 para el salario diario (LSS art. 29).',
      ],
    },
    {
      id: 'que-no-integra',
      heading: 'Lo que integra y lo que no',
      paragraphs: [
        'Integra todo lo que recibes por tu trabajo: comisiones, primas, gratificaciones, prestaciones en especie. Una prima dominical habitual, por ejemplo, forma parte de tu salario integrado. Si tus percepciones varían, el IMSS suma lo de los dos meses anteriores y lo divide entre los días de salario de ese periodo (LSS art. 30).',
        'El artículo 27 de la Ley del Seguro Social excluye, entre otros: los instrumentos de trabajo, el ahorro con depósitos iguales del trabajador y la empresa, las aportaciones al INFONAVIT y la participación en las utilidades, las despensas y los premios de asistencia y puntualidad dentro de sus límites, y «el tiempo extraordinario dentro de los márgenes señalados en la Ley Federal del Trabajo».',
      ],
    },
    {
      id: 'relacionadas',
      heading: 'Las prestaciones que forman tu SDI',
      paragraphs: [
        'Cada prestación del factor con su calculadora o su explicación, y las primas que también pueden integrar:',
      ],
      links: [
        LINKS.aguinaldo,
        LINKS.vacaciones,
        LINKS.primaVacacional,
        LINKS.dominical,
        LINKS.extras,
        LINKS.antiguedad,
      ],
    },
  ];
};

/** The SDI calculator page: its head, its no-script result for the defaults, its sections. */
export const sdiPageOf = () => {
  const text = sdiTextOf(
    sdiOf({
      wageCents: MINIMUM,
      period: 'day',
      aguinaldoDays: 15,
      primaPercent: 25,
      start: date(2026, 1, 15),
      on: date(2026, 12, 31),
    }),
    false,
  );
  return {
    title: titleOf('Calculadora de salario diario integrado (SDI) 2026'),
    description:
      'Calcula tu salario diario integrado con el factor de integración 2026: aguinaldo, prima vacacional y vacaciones por antigüedad, con el tope de 25 UMA del IMSS.',
    kicker: 'México · Ley Federal del Trabajo y Ley del Seguro Social',
    h1: SDI_NAME,
    lead: 'El salario diario integrado (SDI) es tu salario diario más la parte de cada día de tus prestaciones; con lo mínimo de la ley, el aguinaldo de 15 días y la prima vacacional del 25%. Escribe tu salario y tu fecha de ingreso: ve tu SDI, tu factor de integración y tu salario base de cotización del IMSS.',
    labels: {
      wage: 'Salario',
      period: 'Periodo del salario',
      aguinaldo: 'Días de aguinaldo (15 mínimo por ley)',
      prima: 'Prima vacacional, en % (25 mínimo por ley)',
      start: 'Fecha de ingreso',
      on: 'Fecha del cálculo',
    },
    periods: PERIODS,
    defaults: SDI_DEFAULTS,
    invalid:
      'Revisa los datos: un salario mayor que cero, de 1 a 365 días de aguinaldo, una prima de 1 a 100% y una fecha de ingreso anterior a la del cálculo.',
    belowMinimum:
      'La ley da al menos 15 días de aguinaldo (art. 87) y una prima vacacional del 25% (art. 80); con menos, tu factor sale por debajo del de la ley.',
    capped: `Tu SDI pasa de 25 UMA (${SBC_CAP} en 2026): el IMSS cotiza solo hasta ese tope (Ley del Seguro Social, art. 28).`,
    note: 'Integra el aguinaldo y la prima vacacional. Si recibes otras percepciones fijas, como comisiones o una prima dominical habitual, súmalas por día a tu salario: también integran (LSS art. 27).',
    figureLabel: 'Tu salario diario integrado',
    breakdown: 'Cómo se forma tu salario diario integrado',
    paths: { es: SDI_PATH },
    result: {
      figure: text.figure,
      rows: (Object.keys(SDI_LABELS) as SdiKey[]).map((key) => ({
        key,
        label: SDI_LABELS[key],
        value: text.values[key],
      })),
    },
    sections: sdiSections(),
    sources: [
      LABOR_SOURCES.lft,
      LABOR_SOURCES.lss,
      LABOR_SOURCES.dof2022,
      LABOR_SOURCES.desindexacion,
      LABOR_SOURCES.uma,
      LABOR_SOURCES.conasami,
    ],
  };
};

// ---------------------------------------------------------------- answer pages

const dominical = (wageCents: number, period: WagePeriod, sundays = 1) =>
  primaDominicalOf({ wageCents, period, percent: 25, sundays });

const extras = (wageCents: number, period: WagePeriod, jornada: Jornada, hours: number) =>
  horasExtrasOf({ wageCents, period, jornada, hours });

const SALARIES: readonly (readonly [string, number, WagePeriod])[] = [
  ['Salario mínimo general', MINIMUM, 'day'],
  ['Salario mínimo de la frontera norte', BORDER, 'day'],
  ['$10,000 al mes', 1_000_000, 'month'],
  ['$12,000 al mes', 1_200_000, 'month'],
  ['$15,000 al mes', 1_500_000, 'month'],
  ['$20,000 al mes', 2_000_000, 'month'],
];

const PRIMA_DOMINICAL = (): LongTailSection[] => {
  const monthly = dominical(1_200_000, 'month', 4);
  const restDay = 2 * MINIMUM + dominical(MINIMUM, 'day').primaCents;
  return [
    {
      id: 'que-dice-la-ley',
      heading: 'Qué dice la Ley Federal del Trabajo',
      paragraphs: [
        'El artículo 71 dice: «En los reglamentos de esta Ley se procurará que el día de descanso semanal sea el domingo.» Y sigue: «Los trabajadores que presten servicio en día domingo tendrán derecho a una prima adicional de un veinticinco por ciento, por lo menos, sobre el salario de los días ordinarios de trabajo.»',
        'La prima es por trabajar en domingo, aunque tu día de descanso sea otro. El 25% es el mínimo: tu contrato individual o colectivo puede dar más.',
      ],
    },
    {
      id: 'como-se-calcula',
      heading: 'Cómo se calcula la prima dominical',
      paragraphs: [
        'Prima dominical = salario diario × 25%, por cada domingo trabajado. Si te pagan por mes, el salario diario es el mensual entre 30; si te pagan por semana, entre 7 (art. 89).',
      ],
      steps: [
        `Con el salario mínimo de 2026: ${pesosOf(MINIMUM)} × 25% = ${pesosOf(dominical(MINIMUM, 'day').primaCents)} por domingo.`,
        `Con ${pesosOf(1_200_000)} al mes: ${pesosOf(1_200_000)} / 30 = ${pesosOf(monthly.dailyCents)} al día; × 25% = ${pesosOf(monthly.primaCents)} por domingo.`,
        `Si trabajas los cuatro domingos del mes: ${pesosOf(monthly.primaCents)} × 4 = ${pesosOf(monthly.totalCents)}.`,
      ],
    },
    {
      id: 'tabla',
      heading: 'Prima dominical 2026 por salario',
      paragraphs: ['La prima mínima del 25% por un domingo y por cuatro domingos al mes:'],
      table: {
        caption: 'Prima dominical del 25% por salario, 2026',
        head: ['Salario', 'Salario diario', 'Por domingo', 'Cuatro domingos'],
        rows: SALARIES.map(([label, cents, period]) => {
          const result = dominical(cents, period, 4);
          return [
            label,
            pesosOf(result.dailyCents),
            pesosOf(result.primaCents),
            pesosOf(result.totalCents),
          ];
        }),
      },
    },
    {
      id: 'domingo-de-descanso',
      heading: 'Si el domingo es tu día de descanso',
      paragraphs: [
        'Por cada seis días de trabajo te toca un día de descanso con salario íntegro (art. 69), y no estás obligado a trabajarlo (art. 73). Si lo trabajas, el artículo 73 dice que el patrón pagará, «independientemente del salario que le corresponda por el descanso, un salario doble por el servicio prestado».',
        `Cuando ese día es domingo se aplican los dos artículos, cada uno por lo suyo: el salario doble del art. 73 por trabajar tu descanso y la prima del art. 71 por trabajar en domingo. Con el salario mínimo de 2026: 2 × ${pesosOf(MINIMUM)} + ${pesosOf(dominical(MINIMUM, 'day').primaCents)} = ${pesosOf(restDay)}, además del salario de tu día de descanso.`,
        'En un día de descanso obligatorio, como el 1 de enero o el 25 de diciembre, la regla es la misma del salario doble (art. 75).',
      ],
    },
    {
      id: 'isr-y-sdi',
      heading: 'La prima dominical, el ISR y tu salario integrado',
      paragraphs: [
        `La Ley del ISR exenta las primas dominicales «hasta por el equivalente de un salario mínimo general del área geográfica del trabajador por cada domingo que se labore» (art. 93, fracción XIV); desde la desindexación de 2016, esa referencia se entiende a la UMA: ${UMA} por domingo en 2026. Con el salario mínimo, toda la prima de ${pesosOf(dominical(MINIMUM, 'day').primaCents)} está exenta.`,
        'La prima dominical es una de las primas del artículo 84: si trabajas domingos de forma habitual, forma parte de tu salario diario integrado y de tu salario base de cotización del IMSS (LSS art. 27).',
      ],
    },
    {
      id: 'preguntas',
      heading: 'Preguntas frecuentes',
      paragraphs: ['Lo que más se pregunta de la prima dominical, con el artículo que lo dice.'],
      questions: [
        {
          question: '¿Me toca prima dominical si mi día de descanso es otro?',
          answer:
            'Sí: el artículo 71 da la prima a quienes «presten servicio en día domingo», sin importar cuál sea su día de descanso.',
        },
        {
          question: '¿Me pueden pagar menos del 25%?',
          answer:
            'No: la ley dice una prima de un 25% «por lo menos». Un contrato puede dar más, nunca menos.',
        },
        {
          question: '¿Se paga sobre mi salario integrado?',
          answer:
            'El artículo 71 la calcula «sobre el salario de los días ordinarios de trabajo»: tu salario de un día normal, sin horas extras.',
        },
      ],
    },
  ];
};

const HORAS_EXTRAS = (): LongTailSection[] => {
  const twelve = extras(MINIMUM, 'day', 'diurna', 12);
  const double = extras(MINIMUM, 'day', 'diurna', 1).totalCents;
  const triple = extras(MINIMUM, 'day', 'diurna', 10).tripleCents;
  const night = extras(MINIMUM, 'day', 'nocturna', 9);
  const mixed = extras(MINIMUM, 'day', 'mixta', 9);
  const exemptCap = pesosOf(5 * UMA_2026.dailyCents);
  return [
    {
      id: 'que-dice-la-ley',
      heading: 'Qué dice la Ley Federal del Trabajo',
      paragraphs: [
        'El artículo 66: «Podrá también prolongarse la jornada de trabajo por circunstancias extraordinarias, sin exceder nunca de tres horas diarias ni de tres veces en una semana.» Son 9 horas extras a la semana como máximo.',
        'El artículo 67: «Las horas de trabajo extraordinario se pagarán con un ciento por ciento más del salario que corresponda a las horas de la jornada.» Es decir, al doble.',
        'El artículo 68: «La prolongación del tiempo extraordinario que exceda de nueve horas a la semana, obliga al patrón a pagar al trabajador el tiempo excedente con un doscientos por ciento más del salario que corresponda a las horas de la jornada, sin perjuicio de las sanciones establecidas en esta Ley.» Es decir, al triple.',
      ],
    },
    {
      id: 'formula',
      heading: 'Cómo se calculan las horas extras',
      paragraphs: [
        'La hora normal es tu salario diario entre las horas de tu jornada; la hora doble es dos veces esa hora y la triple, tres. Se cuentan por semana: las primeras 9 son dobles y las que pasan de 9, triples. Con el salario mínimo de 2026, jornada diurna de 8 horas y 12 horas extras en una semana:',
      ],
      steps: [
        `Hora normal: ${pesosOf(MINIMUM)} / 8 = ${pesosOf(twelve.hourCents)}.`,
        `9 horas dobles: 9 × ${pesosOf(double)} = ${pesosOf(twelve.doubleCents)}.`,
        `3 horas triples: 3 × ${pesosOf(triple)} = ${pesosOf(twelve.tripleCents)}.`,
        `Total de horas extras de la semana: ${pesosOf(twelve.totalCents)}.`,
      ],
    },
    {
      id: 'tabla',
      heading: 'Cuánto vale una hora extra en 2026',
      paragraphs: ['Con jornada diurna de 8 horas (art. 61):'],
      table: {
        caption: 'Hora normal, doble y triple por salario, jornada de 8 horas, 2026',
        head: ['Salario', 'Hora normal', 'Hora doble', 'Hora triple', '9 horas dobles'],
        rows: SALARIES.map(([label, cents, period]) => {
          const nine = extras(cents, period, 'diurna', 9);
          const ten = extras(cents, period, 'diurna', 10);
          return [
            label,
            pesosOf(nine.hourCents),
            pesosOf(extras(cents, period, 'diurna', 1).totalCents),
            pesosOf(ten.tripleCents),
            pesosOf(nine.totalCents),
          ];
        }),
      },
      after: [
        'Si te pagan por mes, el salario diario es el mensual entre 30; si te pagan por semana, entre 7 (art. 89).',
      ],
    },
    {
      id: 'jornada',
      heading: 'Jornada diurna, nocturna o mixta',
      paragraphs: [
        'La jornada diurna va de las seis a las veinte horas y la nocturna de las veinte a las seis; la mixta tiene parte de las dos, con menos de tres horas y media de noche (art. 60). Su duración máxima es de ocho horas la diurna, siete la nocturna y siete horas y media la mixta (art. 61).',
        `Con una jornada más corta, la hora vale más: con el salario mínimo, la hora nocturna es ${pesosOf(MINIMUM)} / 7 = ${pesosOf(night.hourCents)} y 9 horas dobles son ${pesosOf(night.totalCents)}; en jornada mixta, ${pesosOf(MINIMUM)} / 7.5 = ${pesosOf(mixed.hourCents)} y 9 horas dobles son ${pesosOf(mixed.totalCents)}.`,
      ],
    },
    {
      id: 'limites',
      heading: 'Los límites, el ISR y el IMSS',
      paragraphs: [
        'No estás obligado a trabajar más del tiempo que permite la ley (art. 68). Las horas para atender un siniestro o un riesgo inminente (art. 65) no son tiempo extraordinario: se pagan como horas normales (art. 67).',
        `ISR: si ganas el salario mínimo, tus horas extras dentro del límite de la ley no pagan ISR; si ganas más, está exento el 50%, sin pasar de cinco salarios mínimos por semana (Ley del ISR, art. 93, fracción I), que desde la desindexación de 2016 se leen como 5 UMA: ${exemptCap} en 2026.`,
        'IMSS: el tiempo extraordinario dentro de los márgenes de la Ley Federal del Trabajo no integra tu salario base de cotización (LSS art. 27, fracción IX); el que pasa de ellos, sí.',
      ],
    },
    {
      id: 'estados-unidos',
      heading: 'Si trabajas en Estados Unidos: otra ley',
      paragraphs: [
        'Todo lo de esta página es la ley de México. En Estados Unidos rige otra: la ley federal (FLSA) paga tiempo y medio por las horas que pasan de 40 en la semana, sin horas dobles ni triples. Para esa cuenta, en dólares, usa la calculadora de Estados Unidos.',
      ],
      links: [
        { href: OVERTIME_PATHS.es, label: 'Calculadora de horas extra de Estados Unidos (FLSA)' },
      ],
    },
    {
      id: 'preguntas',
      heading: 'Preguntas frecuentes',
      paragraphs: ['Lo que más se pregunta del pago de horas extras en México.'],
      questions: [
        {
          question: '¿Las horas extras se pagan dobles o triples?',
          answer:
            'Dobles las primeras 9 de la semana (art. 67) y triples las que pasan de 9 (art. 68). No se cuentan por día: se suman las de la semana.',
        },
        {
          question: '¿Cuántas horas extras me pueden pedir?',
          answer:
            'Hasta 3 al día y no más de 3 veces por semana (art. 66). Por encima de eso no estás obligado (art. 68) y, si las trabajas, el patrón las paga triples.',
        },
        {
          question: '¿Con qué salario se calcula la hora?',
          answer:
            'Con el salario de las horas de tu jornada: tu salario diario entre 8, 7 o 7.5 horas, según sea diurna, nocturna o mixta.',
        },
      ],
    },
  ];
};

/** The answer pages of this module, by slug, as `./pages.ts` lists them. */
export const LABOR_ARTICLES: Readonly<
  Record<LaborSlug, () => Omit<MexicoArticle, 'slug' | 'paths' | 'checked'>>
> = {
  'prima-dominical': () => {
    const minimum = dominical(MINIMUM, 'day');
    return {
      title: titleOf('Prima dominical 2026: qué es y cómo se calcula'),
      description: `La prima dominical es al menos el 25% de tu salario diario por cada domingo que trabajas (LFT art. 71). Con el salario mínimo de 2026 son ${pesosOf(minimum.primaCents)}.`,
      kicker: 'México · Prima dominical',
      h1: 'Prima dominical: qué es y cómo se calcula',
      lead: `La prima dominical es un pago extra de al menos el 25% del salario de un día ordinario por cada domingo que trabajas (Ley Federal del Trabajo, art. 71). Con el salario mínimo de 2026, ${pesosOf(MINIMUM)} al día, son ${pesosOf(minimum.primaCents)} por domingo.`,
      answer: {
        label: 'Prima dominical mínima por ley',
        figure: '25%',
        rows: [
          { label: 'Por domingo, salario mínimo general', value: pesosOf(minimum.primaCents) },
          {
            label: 'Por domingo, salario mínimo de la frontera norte',
            value: pesosOf(dominical(BORDER, 'day').primaCents),
          },
          { label: 'Exenta de ISR por domingo (1 UMA)', value: UMA },
        ],
      },
      calculator: LINKS.sdi,
      sections: PRIMA_DOMINICAL(),
      sources: [
        LABOR_SOURCES.lft,
        LABOR_SOURCES.lisr,
        LABOR_SOURCES.lss,
        LABOR_SOURCES.conasami,
        LABOR_SOURCES.uma,
        LABOR_SOURCES.desindexacion,
      ],
      others: [LINKS.extras, LINKS.primaVacacional, LINKS.aguinaldo],
    };
  },
  'como-se-pagan-las-horas-extras': () => {
    const double = pesosOf(extras(MINIMUM, 'day', 'diurna', 1).totalCents);
    const triple = pesosOf(extras(MINIMUM, 'day', 'diurna', 10).tripleCents);
    return {
      title: titleOf('Cómo se pagan las horas extras en México (2026)'),
      description:
        'En México, las primeras 9 horas extras de la semana se pagan dobles y las que pasan de 9, triples (LFT arts. 67 y 68). Fórmula, tabla y ejemplos 2026.',
      kicker: 'México · Horas extras',
      h1: '¿Cómo se pagan las horas extras en México?',
      lead: `En México, las horas extras se pagan dobles, con un 100% más del salario de una hora normal, hasta 9 a la semana; las que pasan de 9 se pagan triples, con un 200% más (Ley Federal del Trabajo, arts. 67 y 68). Con el salario mínimo de 2026 y jornada de 8 horas, una hora doble vale ${double} y una triple, ${triple}.`,
      answer: {
        label: 'Las primeras 9 horas extras de la semana',
        figure: 'Dobles',
        rows: [
          { label: 'Desde la hora 10 de la semana', value: 'Triples' },
          { label: 'Hora doble con el salario mínimo', value: double },
          { label: 'Hora triple con el salario mínimo', value: triple },
        ],
      },
      calculator: LINKS.sdi,
      sections: HORAS_EXTRAS(),
      sources: [
        LABOR_SOURCES.lft,
        LABOR_SOURCES.lisr,
        LABOR_SOURCES.lss,
        LABOR_SOURCES.uma,
        LABOR_SOURCES.desindexacion,
      ],
      others: [LINKS.dominical, LINKS.aguinaldo, LINKS.vacaciones],
    };
  },
};

/** Whether `slug` is one of the answer pages of this module. */
export const isLaborSlug = (slug: MexicoSlug): slug is LaborSlug => slug in LABOR_ARTICLE_LABELS;
