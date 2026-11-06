import { CONTACT_EMAIL } from './privacy.ts';
import { hrefOf, type Lang } from './routes.ts';

/**
 * The sources the about page names, each as it appears in the source names the methodology and the
 * guides cite; `about.test.ts` holds the two lists to each other, so the page claims no
 * source the site does not cite.
 */
export const NAMED_SOURCES = [
  'NIST',
  'USGS',
  'Department of Energy',
  'ANSI/APSP/ICC-15',
  'CDC',
  'EPA',
  'Hayward',
  'Pentair',
  'Jandy',
  'Taylor Technologies',
  'HASA',
  'Alliance Trading',
  'Oreq Corporation',
] as const;

export interface AboutSection {
  readonly id: string;
  readonly heading: string;
  readonly paragraphs: readonly string[];
  /** A page of the site the section points to. */
  readonly link?: { readonly href: string; readonly label: string };
}

export interface About {
  readonly title: string;
  readonly description: string;
  readonly h1: string;
  readonly lead: string;
  readonly sections: readonly AboutSection[];
  readonly reviewed: string;
}

/** Who runs Pool Figures and how it works (the about page, as Cuenta Horas' `/about`). */
export const ABOUT: About = {
  title: 'About | Pool Figures',
  description:
    'Who runs Pool Figures, what its free pool calculators do, where their numbers come from and how to reach us.',
  h1: 'About Pool Figures',
  lead: `Pool Figures is an independent site with free calculators for home pool owners in the US. The team behind Maestro Calc and Cuenta Horas runs it. You can write to us at ${CONTACT_EMAIL}.`,
  sections: [
    {
      id: 'what',
      heading: 'What the site does',
      paragraphs: [
        'Pool Figures works out the volume of your pool, the salt, the chlorine, the pH dose and the calcium chloride to add, and the pump flow your pool needs. Step-by-step guides cover opening the pool in spring and closing it for winter, a water chemistry chart gives the target range of each level, a guide works out how long to run the pump, another compares a salt water pool with a chlorine one, another says how to shock the pool and how much shock to add, another how to lower or raise the pH, and another how to raise calcium hardness and why only draining lowers it, and another how long to wait to swim after adding each chemical. Each calculator shows the figure and the formula behind it.',
      ],
    },
    {
      id: 'method',
      heading: 'How the figures are worked out',
      paragraphs: [
        'Every calculator does exact arithmetic and rounds only the figure you read. Each formula is tested against cases worked out by hand, and the methodology page shows those cases. We use AI tools to help write text and code; the formulas are checked against those cases before a page goes live.',
      ],
      link: { href: '/methodology', label: 'How we work it out' },
    },
    {
      id: 'sources',
      heading: 'Sources',
      paragraphs: [
        'We cite primary sources only: NIST Handbook 44 for the size of a gallon, the USGS for the weight of water, the U.S. Department of Energy for heater sizing and pump run time, ENERGY STAR (EPA) for pump energy, the ANSI/APSP/ICC-15 standard for the pump flow, the CDC for water targets and public-pool limits, the pH dosage chart of Taylor Technologies’ test kits for acid and soda ash, HASA’s directions for muriatic acid and a pH Up label made for Alliance Trading for how to add them, and the manufacturer: the label of a calcium hardness increaser (ClearView, by Oreq Corporation) for calcium chloride, the Hayward manuals and guides for salt, water levels, pump turnover, opening and closing, the Pentair IntelliChlor and Jandy AquaPure manuals for how other salt cells differ, and the EPA-registered label of a product for its strength. Each page names the source of its figures.',
      ],
    },
    {
      id: 'estimates',
      heading: 'Estimates, not instructions',
      paragraphs: [
        'The figures are estimates. Pool chemicals can harm you when they are misused: read the label of your product and follow it, and test the water after each dose. For a problem you cannot solve, ask a pool professional.',
      ],
    },
    {
      id: 'data',
      heading: 'Your data',
      paragraphs: [
        'The site has no accounts, and the calculators run in your browser: the values you type are not sent to us. We do not sell data. The site has no advertising today. The privacy page describes the hosting logs and the analytics we use.',
      ],
      link: { href: '/privacy', label: 'Privacy' },
    },
    {
      id: 'contact',
      heading: 'Contact and corrections',
      paragraphs: [
        `Found an error? Write to ${CONTACT_EMAIL}. We read every message and fix confirmed errors.`,
      ],
    },
  ],
  reviewed: 'Last updated November 4, 2026.',
};

/** The about page in Spanish: the same sections, sources and address. */
const ABOUT_ES: About = {
  title: 'Acerca de | Pool Figures',
  description:
    'Quién hace Pool Figures, qué hacen sus calculadoras gratis para piscina, de dónde salen sus cifras y cómo escribirnos.',
  h1: 'Acerca de Pool Figures',
  lead: `Pool Figures es un sitio independiente con calculadoras gratis para dueños de piscinas en casa en Estados Unidos. Lo hace el equipo de Maestro Calc y Cuenta Horas. Puedes escribirnos a ${CONTACT_EMAIL}.`,
  sections: [
    {
      id: 'what',
      heading: 'Qué hace el sitio',
      paragraphs: [
        'Pool Figures calcula el volumen de tu piscina, la sal, el cloro, la dosis para el pH y el cloruro de calcio que debes agregar, y el caudal que necesita tu bomba. Las guías paso a paso explican cómo abrir la piscina en primavera y cómo cerrarla para el invierno, una tabla de química del agua da el rango de cada nivel, una guía calcula cuántas horas prender la bomba, otra compara una piscina de agua salada con una de cloro, otra explica el tratamiento de choque y cuánto producto agregar, otra cómo bajar o subir el pH, otra cómo subir la dureza de calcio y por qué solo vaciar agua la baja, y otra cuánto esperar para nadar después de cada químico. Por ahora las tablas y algunas guías están en inglés. Cada calculadora muestra la cifra y la fórmula que hay detrás.',
      ],
    },
    {
      id: 'method',
      heading: 'Cómo se calculan las cifras',
      paragraphs: [
        'Cada calculadora hace aritmética exacta y solo redondea la cifra que lees. Cada fórmula se prueba con casos resueltos a mano, y la página de metodología muestra esos casos. Usamos herramientas de IA para ayudar a escribir textos y código; las fórmulas se comprueban con esos casos antes de publicar una página.',
      ],
      link: { href: hrefOf('methodology', 'es'), label: 'Cómo lo calculamos' },
    },
    {
      id: 'sources',
      heading: 'Fuentes',
      paragraphs: [
        'Solo citamos fuentes primarias: el NIST Handbook 44 para el tamaño de un galón, el USGS para el peso del agua, el Department of Energy de Estados Unidos para el tamaño del calentador y las horas de bomba, ENERGY STAR (EPA) para el consumo de la bomba, la norma ANSI/APSP/ICC-15 para el caudal de la bomba, los CDC para los niveles del agua y los límites de piscinas públicas, la tabla de dosis de pH de los kits de Taylor Technologies para el ácido y el carbonato de sodio, las instrucciones de HASA para el ácido muriático y una etiqueta de pH Up hecha para Alliance Trading para cómo agregarlos, y el fabricante: la etiqueta de un aumentador de dureza de calcio (ClearView, de Oreq Corporation) para el cloruro de calcio, los manuales y guías de Hayward para la sal, el nivel del agua, la recirculación de la bomba, la apertura y el cierre, los manuales de Pentair IntelliChlor y Jandy AquaPure para cómo cambian otras celdas de sal, y la etiqueta registrada ante la EPA de cada producto para su concentración. Cada página nombra la fuente de sus cifras.',
      ],
    },
    {
      id: 'estimates',
      heading: 'Estimaciones, no instrucciones',
      paragraphs: [
        'Las cifras son estimaciones. Los químicos de piscina pueden hacerte daño si se usan mal: lee la etiqueta de tu producto y síguela, y mide el agua después de cada dosis. Si tienes un problema que no puedes resolver, consulta a un profesional de piscinas.',
      ],
    },
    {
      id: 'data',
      heading: 'Tus datos',
      paragraphs: [
        'El sitio no tiene cuentas, y las calculadoras funcionan en tu navegador: los valores que escribes no nos llegan. No vendemos datos. Hoy el sitio no tiene publicidad. La página de privacidad describe los registros del hosting y la analítica que usamos.',
      ],
      link: { href: hrefOf('privacy', 'es'), label: 'Privacidad' },
    },
    {
      id: 'contact',
      heading: 'Contacto y correcciones',
      paragraphs: [
        `¿Encontraste un error? Escribe a ${CONTACT_EMAIL}. Leemos cada mensaje y corregimos los errores confirmados.`,
      ],
    },
  ],
  reviewed: 'Actualizado el 6 de noviembre de 2026.',
};

/** The about page in each language. */
export const ABOUT_TEXTS: Readonly<Record<Lang, About>> = { en: ABOUT, es: ABOUT_ES };
