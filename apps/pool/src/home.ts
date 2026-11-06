import {
  ALKALINITY,
  CALCIUM,
  CHLORINE,
  FILL_TIME,
  HEATER,
  PH,
  PUMP,
  SALT,
  STABILIZER,
} from './doses.ts';
import { hrefOf, routeOf, type Lang } from './routes.ts';
import { VOLUME_TEXTS } from './volume/texts.ts';

/** One calculator card of the home: its page, a short title and what it works out. */
export interface HomeTool {
  readonly href: string;
  readonly title: string;
  readonly summary: string;
}

/** The calculators the home lists, volume first: the gallons every other dose starts from. */
export const HOME_TOOLS: readonly HomeTool[] = [
  {
    href: VOLUME_TEXTS.path,
    title: 'Pool volume',
    summary: 'Gallons for a rectangle, round or oval pool.',
  },
  {
    href: SALT.path,
    title: 'Pool salt',
    summary: 'Pounds and 40 lb bags to reach your generator’s level.',
  },
  {
    href: CHLORINE.path,
    title: 'Chlorine',
    summary: 'The dose of liquid chlorine, cal-hypo or dichlor.',
  },
  {
    href: PUMP.path,
    title: 'Pump size',
    summary: 'The flow to turn your pool over in six hours, as the pool standard sizes it.',
  },
  {
    href: PH.path,
    title: 'pH',
    summary: 'Muriatic acid to lower pH, or soda ash to raise it.',
  },
  {
    href: ALKALINITY.path,
    title: 'Alkalinity',
    summary: 'Pounds of baking soda to raise total alkalinity.',
  },
  {
    href: STABILIZER.path,
    title: 'Stabilizer',
    summary: 'Pounds of cyanuric acid to raise your CYA.',
  },
  {
    href: CALCIUM.path,
    title: 'Calcium hardness',
    summary: 'Pounds of calcium chloride to raise calcium hardness.',
  },
  {
    href: HEATER.path,
    title: 'Heater size',
    summary: 'The BTU per hour to warm your pool in the hours you give it.',
  },
  {
    href: FILL_TIME.path,
    title: 'Fill time',
    summary: 'Hours and minutes to fill your pool from a hose.',
  },
];

/** The Spanish card of each calculator, by route id (US units, the neutral tú register). */
const SPANISH_TOOLS: Readonly<Record<string, Omit<HomeTool, 'href'>>> = {
  volume: { title: 'Volumen', summary: 'Galones de una piscina rectangular, redonda u ovalada.' },
  salt: { title: 'Sal', summary: 'Libras y bolsas de 40 lb para llegar al nivel de tu generador.' },
  chlorine: {
    title: 'Cloro',
    summary: 'La dosis de cloro líquido, hipoclorito de calcio (cal-hypo) o dicloro.',
  },
  pump: {
    title: 'Tamaño de bomba',
    summary: 'El caudal para filtrar toda el agua en seis horas, según la norma de piscinas.',
  },
  ph: {
    title: 'pH',
    summary: 'Ácido muriático para bajar el pH, o carbonato de sodio para subirlo.',
  },
  alkalinity: {
    title: 'Alcalinidad',
    summary: 'Libras de bicarbonato de sodio para subir la alcalinidad total.',
  },
  stabilizer: {
    title: 'Estabilizador',
    summary: 'Libras de ácido cianúrico para subir tu estabilizador (CYA).',
  },
  calcium: {
    title: 'Dureza de calcio',
    summary: 'Libras de cloruro de calcio para subir la dureza de calcio.',
  },
  heater: {
    title: 'Calentador',
    summary: 'Los BTU por hora para calentar tu piscina en las horas que le des.',
  },
  'fill-time': {
    title: 'Llenado',
    summary: 'Horas y minutos para llenar tu piscina con una manguera.',
  },
};

/**
 * The calculator cards of the home in `lang`, each at its page in that language once it is built;
 * until then a Spanish card leads to the English page and says so.
 */
export const toolsOf = (lang: Lang): readonly HomeTool[] =>
  lang === 'en'
    ? HOME_TOOLS
    : HOME_TOOLS.map((tool) => {
        const id = routeOf(tool.href)?.id ?? '';
        const card = SPANISH_TOOLS[id];
        if (card === undefined) throw new Error(`no Spanish card for ${tool.href}`);
        const href = hrefOf(id, lang);
        // a calculator whose Spanish page is not built yet says so on its card
        const english = href === routeOf(href)?.en;
        return { href, ...card, summary: english ? `${card.summary} (en inglés)` : card.summary };
      });

/**
 * The header links: the first four calculators, then every card of the home. Eight uppercase
 * links would wrap to four rows on a phone and push the calculator below the fold.
 */
export const navOf = (lang: Lang): readonly { readonly href: string; readonly title: string }[] => [
  ...toolsOf(lang)
    .slice(0, 4)
    .map(({ href, title }) => ({ href, title })),
  lang === 'en'
    ? { href: '/#pool-tools', title: 'All calculators' }
    : { href: '/es#pool-tools', title: 'Todas las calculadoras' },
];

/** The English header links (`navOf('en')`). */
export const NAV_LINKS = navOf('en');

/** The copy of the home in each language; the calculator cards are `toolsOf`. */
export const HOME_TEXTS = {
  en: {
    title: 'Pool Figures: pool volume, salt and chlorine calculators',
    description:
      'Pool calculators for gallons, salt, chlorine, pump size, pH, alkalinity, stabilizer, calcium hardness, heater size and fill time. Every figure shows its math.',
    h1: 'Know your pool by the gallon.',
    lead: 'Gallons first, then the exact pounds of salt and ounces of chlorine. Every dose shows its math.',
    volumeButton: 'Find my gallons',
    saltButton: 'Salt calculator',
    unit: 'GALLONS',
    caption: 'A 32 ft by 16 ft pool, 3 ft 6 in at the shallow end and 8 ft at the deep end.',
    toolsHeading: 'Calculators',
    jobsHeading: 'Common pools, worked out',
    bandHeading: 'Opening your pool this spring?',
    band: 'The order that saves a second trip to the store: water level, salt, pH, then chlorine. Every dose sized to your pool.',
    bandButton: 'Read the opening guide',
    guidesHeading: 'Guides',
  },
  es: {
    title: 'Pool Figures: calculadoras de volumen, sal y cloro para piscina',
    description:
      'Calculadoras de piscina en galones y libras: volumen, sal, cloro, pH, alcalinidad, bomba, calentador y llenado. Cada cifra muestra su cálculo.',
    h1: 'Conoce tu piscina galón por galón.',
    lead: 'Primero los galones, luego las libras exactas de sal y las onzas de cloro para tu piscina o alberca. Cada dosis muestra su cálculo.',
    volumeButton: 'Calcular mis galones',
    saltButton: 'Calculadora de sal',
    unit: 'GALONES',
    caption:
      'Una piscina de 32 por 16 pies, con 3 pies 6 pulgadas en la parte baja y 8 pies en la parte honda.',
    toolsHeading: 'Calculadoras',
    jobsHeading: '',
    bandHeading: '¿Vas a abrir tu piscina esta primavera?',
    band: 'El orden que te ahorra otra vuelta a la tienda: nivel del agua, sal, pH y luego cloro. Cada dosis, a la medida de tu piscina.',
    bandButton: 'Lee la guía de apertura (en inglés)',
    guidesHeading: 'Guías (en inglés)',
  },
} as const satisfies Record<Lang, Record<string, string>>;
