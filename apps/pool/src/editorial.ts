import { checkedText } from './charts.ts';
import { CHEMISTRY_CHART } from './chemistry.ts';
import { DOSING_CHART } from './dosing.ts';
import {
  CALCIUM_GUIDE,
  CLOSING_GUIDE,
  OPENING_GUIDE,
  PH_GUIDE,
  PUMP_RUN_GUIDE,
  SALT_VS_CHLORINE_GUIDE,
  SHOCK_GUIDE,
  type GuideSource,
} from './guide.ts';
import { METHOD_SECTIONS } from './methodology.ts';
import { CONTACT_EMAIL } from './privacy.ts';
import { hrefOf, type Lang } from './routes.ts';
import { SWIM_GUIDE } from './swim.ts';
import { VOLUME_CHART } from './volume/chart.ts';

/** Every source the site cites: the methodology's, then those of the guides and the charts. */
export const citedSources = (): GuideSource[] => [
  ...METHOD_SECTIONS.flatMap(({ sources }) => sources),
  ...[
    OPENING_GUIDE,
    CLOSING_GUIDE,
    PUMP_RUN_GUIDE,
    SALT_VS_CHLORINE_GUIDE,
    SHOCK_GUIDE,
    PH_GUIDE,
    CALCIUM_GUIDE,
    SWIM_GUIDE,
    CHEMISTRY_CHART,
    DOSING_CHART,
  ].flatMap(({ sources }) => Object.values<GuideSource>(sources)),
  VOLUME_CHART.source,
];

/**
 * The kinds of official source the policy names, each found by what the name of a cited source
 * holds (`mark`) and linked at the first document of that kind the site cites, so the page links
 * no address the site does not already cite.
 */
export const OFFICIAL_SOURCES: readonly {
  readonly mark: string;
  readonly en: string;
  readonly es: string;
}[] = [
  {
    mark: 'EPA Reg. No.',
    en: 'Product labels, EPA-registered for chlorine products (here, a calcium hypochlorite label)',
    es: 'Etiquetas de los productos, registradas ante la EPA para los productos de cloro (aquí, una etiqueta de hipoclorito de calcio)',
  },
  {
    mark: 'Model Aquatic Health Code',
    en: 'CDC Model Aquatic Health Code (MAHC)',
    es: 'Model Aquatic Health Code (MAHC) de los CDC',
  },
  {
    mark: 'Taylor',
    en: 'Taylor Technologies test kits and their dosage charts',
    es: 'Kits de prueba de Taylor Technologies y sus tablas de dosis',
  },
  {
    mark: 'HASA',
    en: 'HASA directions for muriatic acid',
    es: 'Instrucciones de HASA para el ácido muriático',
  },
  { mark: 'Hayward', en: 'Hayward manuals and guides', es: 'Manuales y guías de Hayward' },
  { mark: 'Pentair', en: 'Pentair IntelliChlor manual', es: 'Manual de Pentair IntelliChlor' },
  { mark: 'Jandy', en: 'Jandy AquaPure manual', es: 'Manual de Jandy AquaPure' },
  {
    mark: 'NIST',
    en: 'NIST Handbook 44, for the size of a gallon',
    es: 'NIST Handbook 44, para el tamaño de un galón',
  },
  { mark: 'USGS', en: 'USGS, for the weight of water', es: 'USGS, para el peso del agua' },
  {
    mark: 'Department of Energy',
    en: 'U.S. Department of Energy, for heaters and pump run time',
    es: 'Department of Energy de Estados Unidos, para calentadores y horas de bomba',
  },
  {
    mark: 'ANSI/APSP/ICC-15',
    en: 'ANSI/APSP/ICC-15, for pump flow',
    es: 'ANSI/APSP/ICC-15, para el caudal de la bomba',
  },
];

const sourcesIn = (lang: Lang): GuideSource[] => {
  const cited = citedSources();
  return OFFICIAL_SOURCES.map((official) => {
    const found = cited.find(({ name }) => name.includes(official.mark));
    if (found === undefined) throw new Error(`the site cites no source of ${official.mark}`);
    return { name: official[lang], url: found.url };
  });
};

export interface EditorialSection {
  readonly id: string;
  readonly heading: string;
  readonly paragraphs: readonly string[];
  /** The sources the section lists, each linked. */
  readonly sources?: readonly GuideSource[];
  /** A page of the site the section points to. */
  readonly link?: { readonly href: string; readonly label: string };
}

export interface Editorial {
  readonly title: string;
  readonly description: string;
  readonly h1: string;
  readonly lead: string;
  readonly sections: readonly EditorialSection[];
  readonly reviewed: string;
}

/** Who writes Pool Figures and how its figures are sourced, checked and reviewed. */
const EDITORIAL: Editorial = {
  title: 'Editorial policy | Pool Figures',
  description:
    'Who writes Pool Figures, where its numbers come from, how each figure is checked and reviewed, and how to report an error.',
  h1: 'Editorial policy',
  lead: 'Every calculator, guide and chart of Pool Figures is written by the Pool Figures editorial team. This page says how we work.',
  sections: [
    {
      id: 'who',
      heading: 'Who we are',
      paragraphs: [
        'The Pool Figures editorial team is a small independent team that builds free pool calculators for home pool owners. We are not pool operators, chemists or lifeguards, and we claim no credential we do not hold. That is why every figure comes from a published source, named on its page.',
      ],
    },
    {
      id: 'sources',
      heading: 'Where the numbers come from',
      paragraphs: [
        'We work from official and primary sources only: the label of the product, the public health code, the test kit maker and the equipment manuals. These are the ones the site cites:',
      ],
      sources: sourcesIn('en'),
    },
    {
      id: 'checks',
      heading: 'How figures are checked',
      paragraphs: [
        'Every calculator does exact arithmetic and rounds only the figure you read. Each formula is tested against cases worked out by hand before a page goes live, and the tests run again on every change. The methodology page shows the formulas, the sources and those cases.',
      ],
      link: { href: '/methodology', label: 'How we work it out' },
    },
    {
      id: 'reviews',
      heading: 'When pages are reviewed',
      paragraphs: [
        'Each chart and reference page shows the day its figures were last checked against their sources. We recheck a figure when the label or the standard it comes from changes, and we recheck every source at least once a year.',
      ],
    },
    {
      id: 'errors',
      heading: 'How to report an error',
      paragraphs: [
        `Found a wrong figure or a broken source? Write to ${CONTACT_EMAIL} with the page and what you found. We read every message, and we fix confirmed errors on the page.`,
      ],
    },
    {
      id: 'advice',
      heading: 'Not professional advice',
      paragraphs: [
        'The figures are estimates for the product strength each page names. What we publish is not professional advice. Read the label of your product and follow it where it differs from our figures. For a problem with your pool, ask a pool professional.',
      ],
    },
  ],
  reviewed: 'Last updated November 6, 2026.',
};

/** The editorial policy in Spanish: the same sections and sources, in the neutral tú register. */
const EDITORIAL_ES: Editorial = {
  title: 'Política editorial | Pool Figures',
  description:
    'Quién escribe Pool Figures, de dónde salen sus cifras, cómo se comprueba y revisa cada una y cómo avisarnos de un error.',
  h1: 'Política editorial',
  lead: 'Cada calculadora, guía y tabla de Pool Figures la escribe el equipo editorial de Pool Figures. Esta página explica cómo trabajamos.',
  sections: [
    {
      id: 'who',
      heading: 'Quiénes somos',
      paragraphs: [
        'El equipo editorial de Pool Figures es un equipo pequeño e independiente que hace calculadoras gratis para dueños de piscinas en casa. No somos operadores de piscinas, químicos ni salvavidas, y no decimos tener credenciales que no tenemos. Por eso cada cifra sale de una fuente publicada, que su página nombra.',
      ],
    },
    {
      id: 'sources',
      heading: 'De dónde salen las cifras',
      paragraphs: [
        'Solo usamos fuentes oficiales y primarias: la etiqueta del producto, el código de salud pública, el fabricante del kit de prueba y los manuales de los equipos. Estas son las que cita el sitio:',
      ],
      sources: sourcesIn('es'),
    },
    {
      id: 'checks',
      heading: 'Cómo se comprueban las cifras',
      paragraphs: [
        'Cada calculadora hace aritmética exacta y solo redondea la cifra que lees. Cada fórmula se prueba con casos resueltos a mano antes de publicar una página, y las pruebas se repiten con cada cambio. La página de metodología muestra las fórmulas, las fuentes y esos casos.',
      ],
      link: { href: hrefOf('methodology', 'es'), label: 'Cómo lo calculamos' },
    },
    {
      id: 'reviews',
      heading: 'Cuándo se revisan las páginas',
      paragraphs: [
        'Cada tabla y página de referencia muestra el día en que se revisaron sus cifras contra sus fuentes. Revisamos una cifra cuando cambia la etiqueta o la norma de la que sale, y revisamos cada fuente al menos una vez al año.',
      ],
    },
    {
      id: 'errors',
      heading: 'Cómo avisarnos de un error',
      paragraphs: [
        `¿Encontraste una cifra equivocada o una fuente que no abre? Escribe a ${CONTACT_EMAIL} con la página y lo que encontraste. Leemos cada mensaje y corregimos en la página los errores confirmados.`,
      ],
    },
    {
      id: 'advice',
      heading: 'No es asesoría profesional',
      paragraphs: [
        'Las cifras son estimaciones para la concentración de producto que nombra cada página. Lo que publicamos no es asesoría profesional. Lee la etiqueta de tu producto y síguela donde sea distinta de nuestras cifras. Si tienes un problema con tu piscina, consulta a un profesional de piscinas.',
      ],
    },
  ],
  reviewed: 'Actualizado el 6 de noviembre de 2026.',
};

/** The editorial policy in each language. */
export const EDITORIAL_TEXTS: Readonly<Record<Lang, Editorial>> = {
  en: EDITORIAL,
  es: EDITORIAL_ES,
};

/** The words of the byline under the h1 of a guide, a chart or a job page. */
export const BYLINE_TEXTS = {
  en: {
    by: 'By',
    team: 'the Pool Figures editorial team',
    reviewed: 'Reviewed',
    sources: 'Sources',
  },
  es: {
    by: 'Por',
    team: 'el equipo editorial de Pool Figures',
    reviewed: 'Revisado el',
    sources: 'Fuentes',
  },
} as const satisfies Record<Lang, Record<string, string>>;

/** The id of the sources section a byline links to. */
export const SOURCES_ID = 'sources';

export interface Byline {
  readonly by: string;
  readonly team: { readonly href: string; readonly label: string };
  readonly reviewed?: { readonly label: string; readonly datetime: string; readonly text: string };
  readonly sources?: { readonly href: string; readonly label: string };
}

/**
 * The byline of a page in `lang`: the editorial team, linked to the policy of that language; the
 * day the page's data says it was last checked (`checked`, `YYYY-MM-DD`), only when it has one;
 * and the link to its sources section, only when it has one.
 */
export const bylineOf = (
  lang: Lang,
  { checked, sources = false }: { readonly checked?: string; readonly sources?: boolean },
): Byline => {
  const text = BYLINE_TEXTS[lang];
  return {
    by: text.by,
    team: { href: hrefOf('editorial', lang), label: text.team },
    ...(checked === undefined
      ? {}
      : {
          reviewed: { label: text.reviewed, datetime: checked, text: checkedText(checked, lang) },
        }),
    ...(sources ? { sources: { href: `#${SOURCES_ID}`, label: text.sources } } : {}),
  };
};
