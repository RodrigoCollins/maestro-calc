import { embedPathOf, embedSnippetOf } from '@maestro-calc/site-kit/embed';
import { CONTACT_EMAIL } from './texts/articles.ts';
import { TRADE_PATHS, type Lang, type TradeId } from './routes.ts';
import { SITE } from './site.config.ts';
import { TRADE_TEXTS } from './texts/trades.ts';
import { OCCUPATIONS } from './wages/occupations.ts';

/*
 * The embeds of Cuánto Le Cobro (plans/growth/PLAN.md › lever 2), as Maestro Calc's `/embed`: every
 * quote calculator at `/embed` + its path, in both languages, a page other sites may frame. They
 * are not pages of the sitemap.
 */

export interface Embed {
  /** Where the embed is served. */
  readonly path: string;
  /** The full page it embeds: its canonical. */
  readonly page: string;
  readonly lang: Lang;
  readonly trade: TradeId;
  readonly name: string;
  readonly height: number;
}

/** The height of the frame of a quote calculator, in pixels: its form, its receipt and its buttons. */
const HEIGHT = 1500;

/** Every embed the build holds: the five calculators in Spanish, then in English. */
export const EMBEDS: readonly Embed[] = (['es', 'en'] as const).flatMap((lang) =>
  OCCUPATIONS.map(({ id }) => ({
    path: embedPathOf(TRADE_PATHS[id][lang]),
    page: TRADE_PATHS[id][lang],
    lang,
    trade: id,
    name: TRADE_TEXTS[lang][id].h1,
    height: HEIGHT,
  })),
);

/** The embed of a calculator page in a language. */
export const embedOf = (trade: TradeId, lang: Lang): Embed => {
  const found = EMBEDS.find((each) => each.trade === trade && each.lang === lang);
  if (found === undefined) throw new Error(`no embed for ${trade} in ${lang}`);
  return found;
};

const CREDIT = {
  es: (name: string) => `${name}, de ${SITE.name}`,
  en: (name: string) => `${name}, by ${SITE.name}`,
};

/** Every calculator's snippet in `lang`: the frame, then the visible link to the full page outside it. */
export const snippetsOf = (
  lang: Lang,
): readonly { readonly name: string; readonly code: string }[] =>
  EMBEDS.filter((embed) => embed.lang === lang).map(({ page, name, height }) => ({
    name,
    code: embedSnippetOf({ origin: SITE.origin, page, name, credit: CREDIT[lang](name), height }),
  }));

/** The page that offers every calculator to other sites. */
export interface EmbedPageText {
  readonly title: string;
  readonly description: string;
  readonly h1: string;
  readonly lead: string;
  readonly howHeading: string;
  readonly steps: readonly string[];
  readonly notes: readonly string[];
  readonly calculatorsHeading: string;
}

export const EMBED_PAGE_TEXTS: Readonly<Record<Lang, EmbedPageText>> = {
  es: {
    title: 'Calculadoras de presupuesto para tu sitio web | Cuánto Le Cobro',
    description:
      'Pon gratis en tu sitio web las calculadoras de presupuesto de limpieza, pintura, drywall, concreto y jardinería: copia el código y pégalo.',
    h1: 'Calculadoras para tu sitio',
    lead: 'Puedes poner cualquier calculadora de Cuánto Le Cobro en tu sitio web, gratis. Funciona igual que en nuestro sitio: las mismas fórmulas, las mismas cifras y el enlace que tus visitantes pueden compartir.',
    howHeading: 'Cómo poner una calculadora',
    steps: [
      'Busca la calculadora abajo y selecciona todo su código.',
      'Pega el código en tu página donde quieras que aparezca la calculadora. La mayoría de los creadores de sitios lo llaman bloque HTML o bloque para insertar.',
      'Deja el enlace debajo de la calculadora. Les dice a tus visitantes de dónde salen las cifras, y es lo único que te pedimos a cambio.',
    ],
    notes: [
      'La calculadora se abre al ancho de tu página. Si se ve muy corta o muy alta, cambia el número que va después de height en el código.',
      'La calculadora insertada no rastrea a tus visitantes y no carga anuncios. Sus cifras salen de las mismas fórmulas y fuentes que nuestras páginas, descritas en nuestra metodología.',
      `¿Preguntas, o necesitas una calculadora? Escríbenos a ${CONTACT_EMAIL}.`,
    ],
    calculatorsHeading: 'Las calculadoras',
  },
  en: {
    title: 'Embed Our Quote Calculators on Your Site | Cuánto Le Cobro',
    description:
      'Put the cleaning, painting, drywall, concrete and landscaping quote calculators on your own website for free: copy the code and paste it.',
    h1: 'Embed our calculators',
    lead: 'You can put any Cuánto Le Cobro calculator on your own website for free. It works the same as on our site: the same formulas, the same figures and the link your visitors can share.',
    howHeading: 'How to embed a calculator',
    steps: [
      'Find the calculator below and select its whole code.',
      'Paste the code into your page where you want the calculator to show. Most site builders call this an HTML or embed block.',
      'Keep the link under the calculator. It tells your visitors where the figures come from, and it is the only thing we ask in return.',
    ],
    notes: [
      'The calculator opens at the width of your page. If it looks too short or too tall, change the number after height in the code.',
      'The embedded calculator does not track your visitors and loads no ads. Its figures come from the same formulas and sources as our own pages, described in our methodology.',
      `Questions, or a calculator you need? Write to us at ${CONTACT_EMAIL}.`,
    ],
    calculatorsHeading: 'The calculators',
  },
};
