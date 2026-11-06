import { embedPathOf, embedSnippetOf } from '@maestro-calc/site-kit/embed';
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
import { HOME_TOOLS } from './home.ts';
import { CONTACT_EMAIL } from './privacy.ts';
import type { Lang } from './routes.ts';
import { SITE } from './site.config.ts';
import { VOLUME_TEXTS } from './volume/texts.ts';

/*
 * The embeds of Pool Figures (plans/growth/PLAN.md › lever 2), as Maestro Calc's `/embed`: every
 * calculator at `/embed` + its path, a page other sites may frame. They are not pages of the
 * sitemap, which lists the top-level page files only.
 */

/** Each calculator's name (its page heading) and the height of its frame, by page path. */
const CALCULATORS: Readonly<Record<string, { readonly name: string; readonly height: number }>> = {
  [VOLUME_TEXTS.path]: { name: VOLUME_TEXTS.h1, height: 1300 },
  [SALT.path]: { name: SALT.h1, height: 1100 },
  [CHLORINE.path]: { name: CHLORINE.h1, height: 1200 },
  [PUMP.path]: { name: PUMP.h1, height: 1000 },
  [PH.path]: { name: PH.h1, height: 1300 },
  [ALKALINITY.path]: { name: ALKALINITY.h1, height: 1100 },
  [STABILIZER.path]: { name: STABILIZER.h1, height: 1100 },
  [CALCIUM.path]: { name: CALCIUM.h1, height: 1200 },
  [HEATER.path]: { name: HEATER.h1, height: 1100 },
  [FILL_TIME.path]: { name: FILL_TIME.h1, height: 1000 },
};

export interface Embed {
  /** Where the embed is served. */
  readonly path: string;
  /** The full page it embeds: its canonical. */
  readonly page: string;
  readonly name: string;
  readonly height: number;
}

/** The calculators of the home, in its order, each embedded. */
export const EMBEDS: readonly Embed[] = HOME_TOOLS.map(({ href }) => {
  const calculator = CALCULATORS[href];
  if (calculator === undefined) throw new Error(`no embed for the calculator ${href}`);
  return { path: embedPathOf(href), page: href, ...calculator };
});

/** Every calculator's snippet: the frame, then the visible link to the full page outside it. */
export const snippets: readonly { readonly name: string; readonly code: string }[] = EMBEDS.map(
  ({ page, name, height }) => ({
    name,
    code: embedSnippetOf({
      origin: SITE.origin,
      page,
      name,
      credit: `${name} by ${SITE.name}`,
      height,
    }),
  }),
);

/** The page that offers every calculator to other sites. */
export const EMBED_PAGE = {
  path: '/embed-calculators',
  title: 'Embed Our Pool Calculators on Your Site | Pool Figures',
  description:
    'Put the Pool Figures volume, chemical, pump, heater and fill time calculators on your own website for free: copy the code and paste it.',
  h1: 'Embed our calculators',
  lead: 'You can put any Pool Figures calculator on your own website for free. It works the same as on our site: the same formulas, the same figures and the link your visitors can share.',
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
} as const;

/** The embed page in Spanish: the same steps and notes. */
const EMBED_PAGE_ES = {
  path: '/es/calculadoras-para-tu-sitio',
  title: 'Calculadoras de piscina para tu sitio web | Pool Figures',
  description:
    'Pon gratis en tu sitio web las calculadoras de volumen, químicos, bomba, calentador y llenado de Pool Figures: copia el código y pégalo.',
  h1: 'Calculadoras para tu sitio',
  lead: 'Puedes poner cualquier calculadora de Pool Figures en tu sitio web, gratis. Funciona igual que en nuestro sitio: las mismas fórmulas, las mismas cifras y el enlace que tus visitantes pueden compartir.',
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
  calculatorsHeading: 'Las calculadoras (en inglés por ahora)',
} as const;

/** The embed page in each language. */
export const EMBED_PAGE_TEXTS: {
  readonly [lang in Lang]: lang extends 'en' ? typeof EMBED_PAGE : typeof EMBED_PAGE_ES;
} = { en: EMBED_PAGE, es: EMBED_PAGE_ES };
