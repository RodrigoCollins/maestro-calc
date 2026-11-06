import { CHEMISTRY_CHART, type ChartRow, type ChemistryChart } from './chemistry.ts';
import type { GuideSource } from './guide.ts';
import { localHrefOf, type Lang } from './routes.ts';

/*
 * The Spanish water chemistry chart (plans/pool/SPANISH.md, slice 6): the rows, ranges, doses and
 * sources of the English chart of `chemistry.ts`, in neutral Spanish (tú) and US units. Each
 * example keeps the inputs and the figure of its English twin, and `charts-es.test.ts` holds every
 * figure of the Spanish copy to the English one.
 */

/** The same sources, by the same keys and links: only the description of each is Spanish. */
const SOURCES: Readonly<Record<keyof typeof CHEMISTRY_CHART.sources, GuideSource>> = {
  hayward: {
    name: 'Manual del usuario de Hayward AquaRite, 092538 Rev D: química del agua (los niveles que recomienda la APSP)',
    url: CHEMISTRY_CHART.sources.hayward.url,
  },
  mahc: {
    name: 'CDC, Model Aquatic Health Code de 2024, 5.ª edición: 5.7.3 y 5.7.4',
    url: CHEMISTRY_CHART.sources.mahc.url,
  },
  cdc: {
    name: 'CDC: Home Pool and Hot Tub Water Treatment and Testing (tratamiento y prueba del agua de piscinas y jacuzzis en casa)',
    url: CHEMISTRY_CHART.sources.cdc.url,
  },
};

/** The Spanish copy of each row, by id; the ranges, sources and example figures are the English ones. */
const ROWS: Readonly<
  Record<
    string,
    Pick<ChartRow, 'name' | 'home' | 'publicPool' | 'text'> & {
      readonly link?: string;
      readonly example?: { readonly text: string; readonly unit: string };
    }
  >
> = {
  chlorine: {
    name: 'Cloro libre',
    home: 'De 1.0 a 3.0 ppm',
    publicPool: 'Al menos 1.0 ppm, 2.0 ppm con CYA',
    text: 'Los CDC fijan el mínimo para una piscina en casa: cloro libre de al menos 1 ppm, y de al menos 2 ppm si usas ácido cianúrico o un cloro estabilizado como el dicloro o el tricloro. El código no fija un máximo propio: lo más es lo que permite la etiqueta de tu producto.',
    link: 'Calcula el cloro',
    example: {
      text: '20,000 galones de 1 a 3 ppm con cloro líquido al 12.5% requieren',
      unit: 'fl oz',
    },
  },
  ph: {
    name: 'pH',
    home: 'De 7.2 a 7.8',
    publicPool: 'De 7.0 a 7.8',
    text: 'Los CDC también dan un pH de 7.0 a 7.8 para una piscina en casa; el manual lo mantiene en 7.2 o más. Con la alcalinidad y el calcio en su rango, el agua no corroe la piscina ni deja sarro.',
    link: 'Calcula el ácido o el carbonato de sodio',
  },
  alkalinity: {
    name: 'Alcalinidad total',
    home: 'De 80 a 120 ppm',
    publicPool: 'De 60 a 180 ppm',
    text: 'La alcalinidad mantiene estable el pH. El bicarbonato de sodio la sube; bajarla requiere ácido.',
    link: 'Calcula el bicarbonato de sodio',
    example: {
      text: '10,000 galones de 80 a 90 ppm requieren',
      unit: 'lb de bicarbonato de sodio',
    },
  },
  stabilizer: {
    name: 'Ácido cianúrico (estabilizador)',
    home: 'De 30 a 50 ppm al aire libre, nada bajo techo',
    publicPool: '90 ppm como máximo',
    text: 'El estabilizador evita que el sol queme el cloro, así que una piscina bajo techo no lo necesita. El dicloro y el tricloro lo agregan cada vez que los usas, y no se gasta: solo vaciar agua lo baja. Una piscina pública con una lectura de 300 ppm o más permanece cerrada hasta que se corrija.',
    link: 'Calcula el estabilizador',
    example: { text: '10,000 galones de 20 a 30 ppm requieren', unit: 'oz de ácido cianúrico' },
  },
  calcium: {
    name: 'Dureza de calcio',
    home: 'De 200 a 400 ppm',
    publicPool: '2,500 ppm como máximo',
    text: 'El código solo limita el calcio. Con muy poco, el agua disuelve el yeso (plaster); con demasiado, deja sarro y manchas. El cloruro de calcio lo sube; solo vaciar parte del agua y volver a llenar lo baja.',
    link: 'Calcula el cloruro de calcio',
    example: { text: '20,000 galones de 180 a 200 ppm requieren', unit: 'lb de cloruro de calcio' },
  },
  salt: {
    name: 'Sal, para un generador de cloro salino',
    home: 'De 2,700 a 3,400 ppm, 3,200 lo mejor',
    publicPool: 'El rango que da el fabricante de la celda',
    text: 'El código remite al fabricante del generador, como debes hacerlo tú: lee el nivel que pide tu propia celda. La sal no se evapora; la lluvia, las salpicaduras y el retrolavado la diluyen.',
    link: 'Calcula la sal',
    example: { text: '20,000 galones de 2,400 a 3,200 ppm requieren', unit: 'lb de sal' },
  },
};

const rowOf = (row: ChartRow): ChartRow => {
  const es = ROWS[row.id];
  if (es === undefined) throw new Error(`no Spanish row ${row.id}`);
  const { link, example, ...copy } = es;
  return {
    ...row,
    ...copy,
    ...(row.link === undefined || link === undefined
      ? {}
      : { link: { href: localHrefOf(row.link.href, 'es'), label: link } }),
    ...(row.example === undefined || example === undefined
      ? {}
      : { example: { ...row.example, ...example } }),
  };
};

const homeOf = (id: string): string => ROWS[id]?.home.replace(/^De (.+) a /, 'entre $1 y ') ?? '';

export const CHEMISTRY_CHART_ES: ChemistryChart = {
  path: '/es/tabla-de-quimica-del-agua-de-piscina',
  checked: CHEMISTRY_CHART.checked,
  card: {
    title: 'Tabla de química del agua',
    summary: 'El rango de cada nivel, para una piscina en casa y una pública.',
  },
  title: 'Tabla de química del agua de piscina: niveles | Pool Figures',
  description:
    'Cloro libre, pH, alcalinidad, estabilizador, calcio y sal: el rango ideal para una piscina en casa y el límite de una pública, cada uno con su fuente.',
  h1: 'Tabla de química del agua de piscina',
  lead: `Mantén una piscina en casa con ${homeOf('chlorine')} de cloro libre, un pH ${homeOf('ph')} y ${homeOf('alkalinity')} de alcalinidad total, los niveles del manual del fabricante. Cada nivel aparece abajo con el límite que fija el código de los CDC para una piscina pública, y cada dosis enlaza la calculadora que la calcula.`,
  gallons: {
    text: 'Cada dosis depende de cuánta agua tiene la piscina.',
    href: localHrefOf(CHEMISTRY_CHART.gallons.href, 'es'),
    label: 'Calcula tus galones',
  },
  sources: SOURCES,
  rows: CHEMISTRY_CHART.rows.map(rowOf),
  page: {
    kicker: 'Guía · química del agua',
    caption: 'Niveles ideales (ppm son partes por millón)',
    level: 'Nivel',
    home: 'Piscina en casa',
    publicPool: 'Piscina pública',
    doses: 'La dosis de cada químico para piscinas de 5,000 a 40,000 galones está en la',
    source: 'Fuente:',
    note: 'Los rangos para una piscina en casa son los del fabricante; tu estado puede fijar sus propias reglas para una piscina pública. Lee la etiqueta de cada producto antes de agregarlo.',
  },
};

/** The water chemistry chart in each language. */
export const CHEMISTRY_CHARTS: Readonly<Record<Lang, ChemistryChart>> = {
  en: CHEMISTRY_CHART,
  es: CHEMISTRY_CHART_ES,
};
