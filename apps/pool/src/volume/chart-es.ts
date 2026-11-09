import { canonicalUrl } from '@maestro-calc/site-kit/canonical';
import { localHrefOf, type Lang } from '../routes.ts';
import { SITE } from '../site.config.ts';
import {
  METRIC_POOL,
  VOLUME_CHART,
  type VolumeChart,
  type VolumeColumn,
  type VolumeRow,
  type VolumeTable,
} from './chart.ts';

/*
 * The Spanish volume chart (plans/pool/SPANISH.md, slice 6). Its tables print the very gallons of
 * the English chart of `chart.ts`, worked out once by the volume calculator at build time; only the
 * captions, the names of the sizes and depths, and the links are Spanish, each row opening the
 * Spanish calculator. `charts-es.test.ts` holds every figure of the Spanish copy to the English one.
 */

/** The caption and the note of each table, by id. */
const TABLES: Readonly<Record<string, { readonly caption: string; readonly note: string }>> = {
  round: {
    caption: 'Piscinas redondas',
    note: 'Medida de lado a lado por dentro de la pared. La profundidad es la del agua, que queda por debajo del borde de la pared.',
  },
  oval: {
    caption: 'Piscinas ovaladas',
    note: 'Calculada como un óvalo verdadero (una elipse). Un óvalo de lados rectos, dos medios círculos unidos por paredes rectas, tiene más agua: para uno así, usa la calculadora con sus propias medidas.',
  },
  rectangle: {
    caption: 'Piscinas rectangulares',
    note: 'Una piscina con pendiente se calcula con una pendiente recta de la parte baja a la parte honda. Para un fondo de otra forma, usa la calculadora con tus propias profundidades.',
  },
};

/** The name of a size as the Spanish table prints it: `24 ft round` is `Redonda de 24 ft`. */
const labelOf = (id: string, label: string): string =>
  id === 'round'
    ? label.replace(/^(.+) ft round$/, 'Redonda de $1 ft')
    : id === 'oval'
      ? label.replace(/^(.+) ft oval$/, 'Ovalada de $1 ft')
      : label;

const columnOf = (column: VolumeColumn): VolumeColumn => ({
  ...column,
  head:
    column.shallow === column.deep
      ? `${column.shallow} de profundidad`
      : `De ${column.shallow} a ${column.deep}`,
});

const rowOf = (id: string, row: VolumeRow): VolumeRow => ({
  ...row,
  label: labelOf(id, row.label),
  href: localHrefOf(row.href, 'es'),
});

const tableOf = (table: VolumeTable): VolumeTable => {
  const copy = TABLES[table.id];
  if (copy === undefined) throw new Error(`no Spanish volume table ${table.id}`);
  return {
    ...table,
    ...copy,
    columns: table.columns.map(columnOf),
    rows: table.rows.map((row) => rowOf(table.id, row)),
  };
};

/** The gallons of the English row `label` of the table `id` at the middle depth, as the lead quotes them. */
const at = (id: string, label: string): string => {
  const found = VOLUME_CHART.tables
    .find((table) => table.id === id)
    ?.rows.find((row) => row.label === label)?.cells[1];
  if (found === undefined) throw new Error(`no ${label} in the ${id} table`);
  return found;
};

const { factors } = VOLUME_CHART;
const H1 = 'Tabla de volumen de piscina: galones por tamaño y forma';
const PATH = '/es/tabla-de-volumen-de-piscina';

export const VOLUME_CHART_ES: VolumeChart = {
  path: PATH,
  checked: VOLUME_CHART.checked,
  card: {
    title: 'Tabla de volumen de piscina',
    summary:
      'Galones de piscinas redondas, ovaladas y rectangulares, de 12 a 33 ft, a profundidades comunes.',
  },
  title: 'Tabla de volumen de piscina: galones por tamaño | Pool Figures',
  description:
    'Cuántos galones tiene una piscina redonda de 12 a 33 ft, una ovalada o una rectangular de 12 x 24 a 20 x 40 ft a sus profundidades comunes.',
  h1: H1,
  lead: `Una piscina redonda de 24 ft con 4 ft de profundidad tiene ${at('round', '24 ft round')} galones, una ovalada de 15 x 30 ft con 4 ft de profundidad tiene ${at('oval', '15 x 30 ft oval')}, y una rectangular de 16 x 32 ft de 3 ft a 6 ft de profundidad tiene ${at('rectangle', '16 x 32 ft')}. En metros, una piscina de 8 x 4 m de 1 m a 2 m de profundidad tiene ${METRIC_POOL.litres} litros (${METRIC_POOL.cubicMetres} m³). Cada cifra es la superficie de la piscina por su profundidad promedio, a ${factors.cubicFoot} galones por pie cúbico.`,
  tables: VOLUME_CHART.tables.map(tableOf),
  factors,
  assumptions: [
    'La profundidad promedio es la mitad de la parte baja más la parte honda: una piscina de 3 ft a 6 ft se calcula con 4 ft 6 in en toda su superficie.',
    `Un pie cúbico tiene 1,728 pulgadas cúbicas y un galón de EE. UU. tiene 231, así que un pie cúbico contiene ${factors.cubicFoot} galones.`,
    'La superficie de una piscina redonda es π × diámetro² ÷ 4; la de una ovalada, π × largo × ancho ÷ 4; la de una rectangular, largo × ancho.',
    'Cada cifra está redondeada al galón, y medida por dentro de las paredes.',
  ],
  shortcuts: [
    `Rectangular: largo × ancho × profundidad promedio × ${factors.cubicFoot}.`,
    `Redonda: diámetro × diámetro × profundidad promedio × ${factors.round}.`,
    `Ovalada: largo × ancho × profundidad promedio × ${factors.round}.`,
  ],
  calculator: {
    href: localHrefOf(VOLUME_CHART.calculator.href, 'es'),
    label: 'Calcula tu propia piscina',
  },
  method: localHrefOf(VOLUME_CHART.method, 'es'),
  source: {
    name: 'NIST Handbook 44, apéndice C: un galón de EE. UU. tiene 231 pulgadas cúbicas',
    url: VOLUME_CHART.source.url,
  },
  cite: {
    url: canonicalUrl(PATH, SITE.origin),
    text: `Pool Figures, “${H1}”, actualizada en noviembre de 2026.`,
  },
  page: {
    kicker: 'Tabla · galones por tamaño de piscina',
    notHere: '¿No está tu tamaño?',
    doses: 'Cuando sepas los galones, la',
    dosesAfter: 'te da la dosis de cada químico.',
    region: (caption: string) => `Tabla: ${caption}`,
    size: 'Tamaño',
    average: (average: string) => `(promedio ${average})`,
    calculator: 'Calculadora',
    open: 'Abrir',
    openLabel: (label: string) => `Abrir en la calculadora: ${label}`,
    gallons: 'Galones de EE. UU.',
    assumptionsHeading: 'Cómo se calculan los galones',
    shortcuts: 'Las mismas cifras de memoria, con precisión suficiente para una dosis:',
    method: 'Cómo se calcula',
    methodAfter: ', con los casos resueltos a mano.',
    source: 'Fuente:',
    citeHeading: 'Cita esta tabla',
    citeText:
      'Cada cifra la calcula la calculadora de volumen de este sitio cuando se genera la página. Para citarla:',
    note: 'Cada cifra es una estimación para una piscina de la forma y las profundidades que indica su tabla. Mide tu propia piscina por dentro de las paredes para la cifra más cercana.',
  },
};

/** The volume chart in each language. */
export const VOLUME_CHARTS: Readonly<Record<Lang, VolumeChart>> = {
  en: VOLUME_CHART,
  es: VOLUME_CHART_ES,
};
