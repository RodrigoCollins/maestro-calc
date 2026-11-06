import { canonicalUrl } from '@maestro-calc/site-kit/canonical';
import { CHEMISTRY_CHART_ES } from './chemistry-es.ts';
import {
  DOSING_CHART,
  mainDoseOf,
  type DoseColumn,
  type DoseTable,
  type DosingChart,
} from './dosing.ts';
import type { GuideSource } from './guide.ts';
import { localHrefOf, type Lang } from './routes.ts';
import { SITE } from './site.config.ts';

/*
 * The Spanish dosing chart (plans/pool/SPANISH.md, slice 6). Its tables print the very rows of the
 * English chart of `dosing.ts`, worked out once by the calculators at build time; only the
 * captions, the column names, their assumptions and the links are Spanish, each link to the
 * Spanish page of its calculator once it is built. `charts-es.test.ts` holds every figure of the
 * Spanish copy to the English one.
 */

const { sources: EN } = DOSING_CHART;

/** The same sources, by the same keys and links: only the description of each is Spanish. */
const SOURCES: Readonly<Record<keyof typeof EN, GuideSource>> = {
  hayward: CHEMISTRY_CHART_ES.sources['hayward'] ?? EN.hayward,
  cdc: CHEMISTRY_CHART_ES.sources['cdc'] ?? EN.cdc,
  mahc: CHEMISTRY_CHART_ES.sources['mahc'] ?? EN.mahc,
  calHypo: {
    name: 'Etiqueta de Clor Mor Calcium Hypochlorite Granules, EPA Reg. No. 69681-6 (aceptada el 18 de septiembre de 2014)',
    url: EN.calHypo.url,
  },
  taylor: {
    name: 'Taylor Technologies, instrucciones del kit K-1003 (Instr. #5816): pruebas de pH, de demanda de ácido y de demanda de base, y las tablas de dosis de pH',
    url: EN.taylor.url,
  },
  hasa: {
    name: 'HASA Muriatic Acid (31.45% de ácido clorhídrico), ficha del producto: modo de uso',
    url: EN.hasa.url,
  },
  clearView: {
    name: 'ClearView Calcium Increaser, información crítica de uso (Oreq Corporation): instrucciones',
    url: EN.clearView.url,
  },
};

/** The caption of each table, by id. */
const CAPTIONS: Readonly<Record<string, string>> = {
  sanitizer: 'Cloro, choque y sal',
  balance: 'Alcalinidad, estabilizador y calcio',
  ph: 'Para bajar el pH',
};

/** The Spanish copy of each column, by id; its unit, calculator and cells are the English ones. */
const COLUMNS: Readonly<
  Record<string, { readonly head: string; readonly assumption: string; readonly label: string }>
> = {
  liquid: {
    head: 'Cloro líquido, +1 ppm',
    assumption:
      'Cloro líquido (hipoclorito de sodio) con 12.5% de cloro disponible, para subir el cloro libre 1 ppm. 1 ppm es 1 mg por litro: 10.24 fl oz por cada 10,000 galones. Los CDC mantienen una piscina en casa en 1 ppm o más, 2 ppm o más con estabilizador.',
    label: 'Calcula el cloro según tu lectura',
  },
  calHypo: {
    head: 'Choque de hipoclorito de calcio (cal-hypo), de 0 a 10 ppm',
    assumption:
      'Gránulos de hipoclorito de calcio con 65% de cloro disponible, por peso, de 0 ppm a 10 ppm: lo más alto de los 5 a 10 ppm a los que la etiqueta hace el choque con 10 a 20 oz por cada 10,000 galones. Vuelve a nadar solo con 4 ppm o menos, el nivel de reingreso de la etiqueta.',
    label: 'Calcula el choque según tu lectura',
  },
  salt: {
    head: 'Sal, de 0 a 3,200 ppm',
    assumption:
      'Sal para piscina con más de 99% de cloruro de sodio, de agua nueva (0 ppm) a 3,200 ppm, el nivel que el manual de AquaRite de Hayward llama el mejor. Un galón de agua pesa unas 8.34 lb. Sigue el nivel que pide tu propia celda.',
    label: 'Calcula la sal según tu lectura',
  },
  bakingSoda: {
    head: 'Bicarbonato de sodio, +10 ppm de alcalinidad',
    assumption:
      'Bicarbonato de sodio puro (baking soda), para subir la alcalinidad total 10 ppm. La alcalinidad se mide como carbonato de calcio, así que 1 ppm requiere 1.6788 mg de bicarbonato por litro. El manual de Hayward mantiene una piscina en casa entre 80 y 120 ppm; el código de los CDC mantiene una pública entre 60 y 180.',
    label: 'Calcula el bicarbonato de sodio según tu lectura',
  },
  stabilizer: {
    head: 'Estabilizador, +10 ppm de CYA',
    assumption:
      'Un producto de 100% ácido cianúrico, para subir el CYA 10 ppm: 1 ppm es 1 mg por litro. Para un estabilizador líquido o mezclado, divide entre su porcentaje y multiplica por 100. El manual de Hayward mantiene una piscina al aire libre entre 30 y 50 ppm; el código de los CDC limita una pública a 90.',
    label: 'Calcula el estabilizador según tu lectura',
  },
  calcium: {
    head: 'Cloruro de calcio, +10 ppm de dureza',
    assumption:
      'Cloruro de calcio en escamas, con la dosis de la etiqueta de ClearView: 2 oz por cada 1,000 galones suben la dureza de calcio 10 ppm. Por encima de 3 lb por cada 10,000 galones, la etiqueta divide la dosis en partes separadas por al menos 12 horas.',
    label: 'Calcula el cloruro de calcio según tu lectura',
  },
  acid: {
    head: 'Ácido muriático, por gota de demanda de ácido',
    assumption:
      'Ácido muriático al 31.45% (20° Baumé), según la tabla de dosis de pH de Taylor: 9.16 fl oz por cada gota de reactivo de demanda de ácido que pide la prueba de un kit Taylor, por cada 10,000 galones. La prueba se hace con tu propia agua, así que su alcalinidad ya está en la cuenta.',
    label: 'Calcula el ácido según tus gotas',
  },
  acidPerDay: {
    head: 'Ácido muriático, lo más en 24 horas',
    assumption:
      'La etiqueta de ácido muriático de HASA agrega como máximo un cuarto de galón por cada 20,000 galones en 24 horas, y lo repite cada 24 horas: una dosis mayor se agrega en varios días, con una prueba de pH antes de cada parte.',
    label: 'Calcula los días que toma una dosis',
  },
};

const columnOf = (column: DoseColumn): DoseColumn => {
  const es = COLUMNS[column.id];
  if (es === undefined) throw new Error(`no Spanish column ${column.id}`);
  return {
    ...column,
    head: es.head,
    assumption: es.assumption,
    link: { href: localHrefOf(column.link.href, 'es'), label: es.label },
    method: localHrefOf(column.method, 'es'),
  };
};

const tableOf = (table: DoseTable): DoseTable => {
  const caption = CAPTIONS[table.id];
  if (caption === undefined) throw new Error(`no Spanish caption ${table.id}`);
  // the very rows of the English table: the cells are worked out once, by the calculators
  return { ...table, caption, columns: table.columns.map(columnOf), rows: table.rows };
};

const H1 = 'Tabla de dosis de químicos para piscina por tamaño';
const PATH = '/es/tabla-de-dosis-de-quimicos-para-piscina';

export const DOSING_CHART_ES: DosingChart = {
  path: PATH,
  checked: DOSING_CHART.checked,
  card: {
    title: 'Tabla de dosis de químicos',
    summary:
      'Cloro, choque, sal, bicarbonato, estabilizador, calcio y ácido, de 5,000 a 40,000 galones.',
  },
  title: 'Tabla de dosis de químicos para piscina por tamaño | Pool Figures',
  description:
    'Cuánto cloro, choque, sal, bicarbonato, estabilizador, cloruro de calcio y ácido muriático lleva una piscina de 5,000 a 40,000 galones, con su fuente.',
  h1: H1,
  lead: `Una piscina de 10,000 galones lleva ${mainDoseOf('liquid')} fl oz de cloro líquido al 12.5% para subir el cloro libre 1 ppm, ${mainDoseOf('bakingSoda')} lb de bicarbonato de sodio para subir la alcalinidad 10 ppm, ${mainDoseOf('acid')} fl oz de ácido muriático por cada gota de la prueba de demanda de ácido, y ${mainDoseOf('salt')} lb de sal para llegar a 3,200 ppm desde agua nueva. Cada dosis crece en línea recta: el doble de galones o el doble de aumento lleva el doble.`,
  gallons: {
    text: '¿No sabes cuántos galones tiene tu piscina?',
    href: localHrefOf(DOSING_CHART.gallons.href, 'es'),
    label: 'Calcúlalos',
  },
  chart: {
    text: 'o busca tu tamaño en la',
    href: localHrefOf(DOSING_CHART.chart.href, 'es'),
    label: 'tabla de volumen de piscina',
  },
  ranges: {
    text: 'El nivel que buscas está en la',
    href: localHrefOf(DOSING_CHART.ranges.href, 'es'),
    label: 'tabla de química del agua',
  },
  tables: DOSING_CHART.tables.map(tableOf),
  sources: SOURCES,
  cite: {
    url: canonicalUrl(PATH, SITE.origin),
    text: `Pool Figures, “${H1}”, actualizada en noviembre de 2026.`,
  },
  page: {
    kicker: 'Tabla · dosis por tamaño de piscina',
    gallons: 'Galones',
    region: (caption: string) => `Tabla: ${caption}`,
    method: 'Cómo se calcula',
    source: 'Fuente:',
    citeHeading: 'Cita esta tabla',
    citeText:
      'Cada cifra la calculan las calculadoras de este sitio cuando se genera la página, con las fuentes de arriba. Para citarla:',
    note: 'Cada cifra es una estimación para la concentración de producto que indica su columna. Lee la etiqueta de cada producto antes de agregarlo, y síguela cuando sea distinta de esta tabla.',
  },
};

/** The dosing chart in each language. */
export const DOSING_CHARTS: Readonly<Record<Lang, DosingChart>> = {
  en: DOSING_CHART,
  es: DOSING_CHART_ES,
};
