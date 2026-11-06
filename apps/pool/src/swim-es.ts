import { CHEMISTRY_CHART_ES } from './chemistry-es.ts';
import { DOSING_CHART_ES } from './dosing-es.ts';
import type { GuideSource } from './guide.ts';
import { localHrefOf, routeOf, type Lang } from './routes.ts';
import { liquidDoseOf, SWIM_GUIDE, type SwimGuide, type SwimRow } from './swim.ts';

/*
 * The Spanish guide to when to swim after each chemical (plans/pool/SPANISH.md, slice 6): the rows,
 * readings, times and sources of the English guide of `swim.ts`, in neutral Spanish (tú). The rule
 * stays the test reading, never a clock time, and each label's words are given in Spanish.
 * `charts-es.test.ts` holds every figure of the Spanish copy to the English one.
 */

const { sources: EN } = SWIM_GUIDE;

/** The same sources, by the same keys and links: only the description of each is Spanish. */
const SOURCES: Readonly<Record<keyof typeof EN, GuideSource>> = {
  cdc: CHEMISTRY_CHART_ES.sources['cdc'] ?? EN.cdc,
  mahc: CHEMISTRY_CHART_ES.sources['mahc'] ?? EN.mahc,
  calHypo: DOSING_CHART_ES.sources['calHypo'] ?? EN.calHypo,
  dichlor: {
    name: 'Etiqueta de Nu-Clo Concentrated Pool Chlorinating Granules (dicloro), EPA Reg. No. 7124-31 (aceptada el 5 de enero de 2012)',
    url: EN.dichlor.url,
  },
  liquid: {
    name: 'Etiqueta de B’s Pool Supply Sodium Hypochlorite Solution (12.5%), EPA Reg. No. 55487-20001 (aceptada el 16 de noviembre de 2017)',
    url: EN.liquid.url,
  },
  hasa: DOSING_CHART_ES.sources['hasa'] ?? EN.hasa,
  sodaAsh: {
    name: 'Etiqueta de pH Up (carbonato de sodio 100%), fabricado para Alliance Trading, Inc. (etiqueta 01616483, REV050824)',
    url: EN.sodaAsh.url,
  },
  alkalinity: {
    name: 'ClearView Total Alkalinity, información crítica de uso (Oreq Corporation): instrucciones',
    url: EN.alkalinity.url,
  },
  alkalinitySds: {
    name: 'Hoja de datos de seguridad de ClearView Total Alkalinity (Oreq Corporation): sección 3',
    url: EN.alkalinitySds.url,
  },
  hayward: {
    name: 'Manual del usuario de Hayward AquaRite, 092538 Rev D: How to Add or Remove Salt (cómo agregar o quitar sal)',
    url: EN.hayward.url,
  },
  calcium: DOSING_CHART_ES.sources['clearView'] ?? EN.calcium,
  stabilizer: {
    name: 'ClearView Primo Powder (ácido isocianúrico 99%), información crítica de uso (Oreq Corporation): instrucciones',
    url: EN.stabilizer.url,
  },
};

/** The Spanish name of each guide a row links, by its English page. */
const GUIDE_NAMES: Readonly<Record<string, string>> = {
  '/how-to-shock-a-pool': 'Cómo hacer un tratamiento de choque',
  '/how-to-lower-ph-in-a-pool': 'Cómo bajar el pH de la piscina',
  '/how-to-raise-calcium-hardness-in-a-pool': 'Cómo subir la dureza de calcio',
};

/** A guide of the site in Spanish once it is built; in English until then, and the link says so. */
const guideOf = (guide: { readonly href: string }): { href: string; label: string } => {
  const name = GUIDE_NAMES[guide.href];
  if (name === undefined) throw new Error(`no Spanish name for the guide ${guide.href}`);
  const href = localHrefOf(guide.href, 'es');
  return { href, label: href === routeOf(guide.href)?.en ? `${name} (en inglés)` : name };
};

const NO_TIME = 'ninguna espera antes de nadar';

/** The Spanish copy of each row, by id; its sources and its figures are the English ones. */
const ROWS: Readonly<
  Record<string, Pick<SwimRow, 'chemical' | 'when' | 'time' | 'text'> & { readonly link: string }>
> = {
  'cal-hypo': {
    chemical: 'Choque: hipoclorito de calcio (cal-hypo) al 65%',
    when: 'Cloro libre en 4 ppm o menos',
    time: 'La etiqueta no da horas: una lectura de prueba',
    text: 'La etiqueta del hipoclorito de calcio hace el choque a 5 a 10 ppm y prohíbe volver a entrar por encima de 4 ppm. El agua queda cerrada hasta que una prueba lea 4 ppm o menos, sin importar cuánto tarde, con el pH en los 7.2 a 7.6 de la etiqueta.',
    link: 'Calcula la dosis de choque',
  },
  dichlor: {
    chemical: 'Choque: dicloro al 56%',
    when: 'Cloro libre en 3 ppm o menos',
    time: 'La etiqueta no da horas: una lectura de prueba',
    text: 'La etiqueta del dicloro hace el choque con 2 oz por cada 1,000 galones, 8.7 ppm en una piscina nueva, y prohíbe volver a entrar por encima de 3 ppm. Mide otra vez antes de que alguien nade. El dicloro también agrega estabilizador, así que el mínimo de cloro es el de 2 ppm de los CDC.',
    link: 'Calcula la dosis de dicloro',
  },
  'liquid-chlorine': {
    chemical: 'Cloro líquido al 12.5%',
    when: 'Cloro libre en 4 ppm o menos',
    time: 'La etiqueta no da horas: una lectura de prueba',
    text: `La etiqueta hace la supercloración con 52 a 104 fl oz por cada 10,000 galones para llegar a 5 a 10 ppm, y dice que no entres a la piscina tratada por encima de 4 ppm de cloro por el riesgo de daño corporal. En 10,000 galones desde 0 ppm, la calculadora da ${liquidDoseOf('5')} fl oz para 5 ppm y ${liquidDoseOf('10')} fl oz para 10.`,
    link: 'Calcula el cloro líquido',
  },
  'muriatic-acid': {
    chemical: 'Ácido muriático (para bajar el pH)',
    when: 'El pH otra vez en su rango: 7.2 a 7.6 según la etiqueta',
    time: `La bomba funcionando al menos 1 hora después; ${NO_TIME}`,
    text: 'Las instrucciones de HASA mantienen el pH en 7.2-7.6, agregan como máximo un cuarto de galón por cada 20,000 galones cada 24 horas, y mantienen el filtro y la bomba funcionando mientras lo agregas y al menos una (1) hora después. No dan ningún tiempo antes de nadar: mide otra vez el pH cuando la bomba haya funcionado, y nada cuando esté en su rango.',
    link: 'Calcula el ácido muriático',
  },
  'soda-ash': {
    chemical: 'Carbonato de sodio (para subir el pH)',
    when: 'El pH otra vez en su rango',
    time: `De 2 a 3 horas de circulación, luego otra prueba; ${NO_TIME}`,
    text: 'La etiqueta de pH Up agrega como máximo 1 libra por cada 10,000 galones de una vez, y luego dice que dejes recircular el agua de dos a tres horas, midas otra vez el pH y repitas si hace falta. No da ningún tiempo antes de nadar: la nueva prueba es cuando lo sabes.',
    link: 'Calcula el carbonato de sodio',
  },
  'baking-soda': {
    chemical: 'Bicarbonato de sodio (para subir la alcalinidad)',
    when: 'El cloro libre y el pH en su rango',
    time: `Agrégalo en la tarde, con el filtro funcionando; ${NO_TIME}`,
    text: 'ClearView Total Alkalinity, 100% bicarbonato de sodio según su hoja de datos de seguridad, se agrega en la tarde o la noche con el filtro funcionando, esparcido sobre la parte más honda de la piscina. Sus instrucciones no dan ningún tiempo antes de nadar: mide el cloro y el pH antes de que alguien entre.',
    link: 'Calcula el bicarbonato de sodio',
  },
  salt: {
    chemical: 'Sal, para una celda de sal',
    when: 'La sal disuelta, el cloro libre y el pH en su rango',
    time: `24 horas de filtrado para repartirla; ${NO_TIME}`,
    text: 'El manual de AquaRite de Hayward agrega la sal con la bomba funcionando, cepillándola: no dejes que la sal se amontone en el fondo de la piscina. Deja funcionando la bomba del filtro 24 horas con la succión del drenaje principal para repartirla; la pantalla de sal puede tardar 24 horas en responder. El manual no da ningún tiempo antes de nadar.',
    link: 'Calcula la sal',
  },
  calcium: {
    chemical: 'Cloruro de calcio (para subir la dureza)',
    when: 'Disuelto, con el cloro libre y el pH en su rango',
    time: `Dosis grandes separadas por al menos 12 horas; ${NO_TIME}`,
    text: 'La etiqueta de ClearView lo disuelve primero en una cubeta y lo vierte en la parte honda con la bomba funcionando. Por encima de 3 libras por cada 10,000 galones, separa las dosis por al menos 12 horas, para que el agua se ajuste y no se enturbie. No da ningún tiempo antes de nadar.',
    link: 'Calcula el cloruro de calcio',
  },
  stabilizer: {
    chemical: 'Estabilizador (ácido cianúrico)',
    when: 'Disuelto, con el cloro libre en al menos 2 ppm y el pH en su rango',
    time: `24 horas de circulación para disolverlo; ${NO_TIME}`,
    text: 'Las instrucciones de ClearView Primo lo agregan por el skimmer con el filtro limpio y recirculan el agua sin parar durante 24 horas para que se disuelva bien, con un pH de 7.2 a 7.6, y mantienen el ácido cianúrico entre 30 y 50 ppm. No dan ningún tiempo antes de nadar. Con estabilizador en el agua, el mínimo de cloro de los CDC es de 2 ppm; una piscina pública lo mantiene en 90 ppm como máximo, según el código de los CDC.',
    link: 'Calcula el estabilizador',
  },
};

const rowOf = (row: SwimRow): SwimRow => {
  const es = ROWS[row.id];
  if (es === undefined) throw new Error(`no Spanish row ${row.id}`);
  const { link, ...copy } = es;
  return {
    ...row,
    ...copy,
    link: { href: localHrefOf(row.link.href, 'es'), label: link },
    ...(row.guide === undefined ? {} : { guide: guideOf(row.guide) }),
  };
};

/** The Spanish name of each chart the guide links, by its English page. */
const CHART_LINKS: Readonly<Record<string, string>> = {
  '/pool-chemical-dosing-chart': 'Mira la dosis de cada químico por tamaño de piscina',
  '/pool-water-chemistry-chart': 'Mira el rango ideal de cada nivel',
};

export const SWIM_GUIDE_ES: SwimGuide = {
  path: '/es/cuanto-esperar-para-nadar-despues-de-agregar-quimicos',
  checked: SWIM_GUIDE.checked,
  kicker: 'Guía · nadar',
  card: {
    title: 'Cuándo nadar después de los químicos',
    summary:
      'La lectura que debes esperar después del choque, el ácido, la sal y cada balanceador.',
  },
  title: '¿Cuánto esperar para nadar tras agregar químicos? | Pool Figures',
  description:
    'Cuándo nadar después del choque, el cloro, el ácido, el bicarbonato, la sal, el calcio o el estabilizador: la lectura que fija cada etiqueta.',
  h1: '¿Cuánto esperar para nadar después de agregar químicos?',
  lead: 'Vuelve a nadar cuando una prueba diga que el agua está otra vez en su rango, no después de un número fijo de horas: cloro libre en el nivel de reingreso de la etiqueta de tu producto o por debajo, 4 ppm para el hipoclorito de calcio al 65% y el cloro líquido al 12.5% y 3 ppm para el dicloro, pero al menos el 1 ppm de los CDC, 2 ppm con estabilizador, y un pH de 7.0 a 7.8. Ninguna de las etiquetas de abajo da un número de horas antes de nadar: los tiempos que dan son para la bomba, para repartir el producto o entre dos dosis. Mide el cloro libre y el pH antes de que alguien entre.',
  rules: {
    text: 'El mínimo de los CDC para una piscina en casa es un cloro libre de al menos 1 ppm, de al menos 2 ppm si usas ácido cianúrico o un cloro estabilizado como el dicloro o el tricloro, y un pH de 7.0 a 7.8, medido con un kit DPD. Para una piscina pública, el Model Aquatic Health Code de los CDC también mantiene el pH entre 7.0 y 7.8.',
    sources: SWIM_GUIDE.rules.sources,
  },
  charts: SWIM_GUIDE.charts.map(({ href }) => {
    const label = CHART_LINKS[href];
    if (label === undefined) throw new Error(`no Spanish name for the chart ${href}`);
    return { href: localHrefOf(href, 'es'), label };
  }),
  sources: SOURCES,
  rows: SWIM_GUIDE.rows.map(rowOf),
  page: {
    region: 'Cuándo nadar, por químico',
    caption: 'Cuándo volver a nadar (ppm son partes por millón)',
    chemical: 'Químico',
    when: 'Vuelve a nadar cuando',
    time: 'Tiempo que da la fuente',
    timeShort: 'Tiempo',
    source: 'Fuente:',
    note: 'Sigue la etiqueta de tu propio producto cuando sea distinta de esta guía: su concentración y su nivel de reingreso cambian según el producto. Si tienes dudas, mide otra vez antes de que alguien nade.',
  },
};

/** The guide in each language. */
export const SWIM_GUIDES: Readonly<Record<Lang, SwimGuide>> = {
  en: SWIM_GUIDE,
  es: SWIM_GUIDE_ES,
};
