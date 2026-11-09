import { CHARTS_INDEX } from './charts.ts';
import { GUIDES, guidesOf } from './guide.ts';
import { hrefOf, langOf, routeOf, type Lang } from './routes.ts';

export { navOf } from './home.ts';

/** One footer link: the route it leads to (`src/routes.ts`) and its label. */
interface FooterLink {
  readonly id: string;
  readonly label: string;
}

/** What the layout writes around every page, in each language. */
export const LAYOUT_TEXTS = {
  en: {
    navLabel: 'Calculators',
    warning: 'Every figure is an estimate. Read the label of your product before you add it.',
    footer: [
      { id: 'methodology', label: 'How we work it out' },
      { id: 'opening-guide', label: 'Opening your pool' },
      { id: 'closing-guide', label: 'Closing your pool' },
      { id: 'chemistry-chart', label: 'Water chemistry chart' },
      { id: 'dosing-chart', label: 'Chemical dosing chart' },
      { id: 'volume-chart', label: 'Pool volume chart' },
      { id: 'gallons-guide', label: 'How many gallons is my pool' },
      { id: 'olympic-guide', label: 'Gallons in an Olympic pool' },
      { id: 'charts', label: CHARTS_INDEX.name },
      { id: 'pump-guide', label: 'How long to run your pump' },
      { id: 'salt-guide', label: 'Salt water vs chlorine' },
      { id: 'shock-guide', label: 'How to shock a pool' },
      { id: 'shock-often-guide', label: 'How often to shock a pool' },
      { id: 'green-guide', label: 'How to fix a green pool' },
      { id: 'cloudy-guide', label: 'Why is my pool cloudy' },
      { id: 'ph-guide', label: 'How to lower pool pH' },
      { id: 'calcium-guide', label: 'How to raise calcium hardness' },
      { id: 'swim-guide', label: 'When to swim after chemicals' },
      { id: 'privacy', label: 'Privacy' },
      { id: 'about', label: 'About' },
      { id: 'editorial', label: 'Editorial policy' },
      { id: 'embed', label: 'Embed our calculators' },
    ],
  },
  es: {
    navLabel: 'Calculadoras',
    warning: 'Cada cifra es una estimación. Lee la etiqueta de tu producto antes de agregarlo.',
    footer: [
      { id: 'methodology', label: 'Cómo lo calculamos' },
      { id: 'opening-guide', label: 'Cómo abrir tu piscina' },
      { id: 'closing-guide', label: 'Cómo cerrar tu piscina' },
      { id: 'chemistry-chart', label: 'Tabla de química del agua' },
      { id: 'dosing-chart', label: 'Tabla de dosis de químicos' },
      { id: 'volume-chart', label: 'Tabla de volumen de piscina' },
      { id: 'gallons-guide', label: 'Cuántos galones tiene mi piscina' },
      { id: 'olympic-guide', label: 'Galones de una piscina olímpica' },
      { id: 'charts', label: 'Datos y tablas' },
      { id: 'pump-guide', label: 'Cuántas horas prender la bomba' },
      { id: 'salt-guide', label: 'Agua salada o cloro' },
      { id: 'shock-guide', label: 'Cómo hacer un tratamiento de choque' },
      { id: 'shock-often-guide', label: 'Cada cuánto hacer un choque' },
      { id: 'green-guide', label: 'Cómo arreglar una piscina verde' },
      { id: 'cloudy-guide', label: 'Por qué está turbia mi piscina' },
      { id: 'ph-guide', label: 'Cómo bajar el pH' },
      { id: 'calcium-guide', label: 'Cómo subir la dureza de calcio' },
      { id: 'swim-guide', label: 'Cuándo nadar después de los químicos' },
      { id: 'privacy', label: 'Privacidad' },
      { id: 'about', label: 'Acerca de' },
      { id: 'editorial', label: 'Política editorial' },
      { id: 'embed', label: 'Calculadoras para tu sitio' },
    ],
  },
} as const satisfies Record<
  Lang,
  { readonly navLabel: string; readonly warning: string; readonly footer: readonly FooterLink[] }
>;

/** The footer links in `lang`, each at its page in that language once it is built. */
export const footerLinksOf = (lang: Lang): { readonly href: string; readonly label: string }[] =>
  LAYOUT_TEXTS[lang].footer.map(({ id, label }) => ({ href: hrefOf(id, lang), label }));

/** The footer label of route `id` in `lang`: the Spanish home names its English guides by it. */
export const labelOf = (id: string, lang: Lang): string | undefined =>
  LAYOUT_TEXTS[lang].footer.find((link) => link.id === id)?.label;

/**
 * The guides as the home lists them in `lang`: in English with their card; in Spanish by their
 * footer label, at the Spanish twin once it is built, and marked while the page is still English.
 */
export const guideLinksOf = (
  lang: Lang,
): { readonly href: string; readonly title: string; readonly summary?: string }[] =>
  GUIDES.map(({ path, card }) => {
    if (lang === 'en') return { href: path, title: card.title, summary: card.summary };
    const id = routeOf(path)?.id ?? '';
    const href = hrefOf(id, lang);
    const title = labelOf(id, lang) ?? card.title;
    return { href, title: href === routeOf(href)?.en ? `${title} (en inglés)` : title };
  });

/**
 * The guides that explain the calculator at `path` (`guidesOf`), as its page lists them in the
 * page's language: in English with their card title; in Spanish by their footer label, and only
 * the guides whose Spanish twin is built, so a Spanish page links Spanish pages.
 */
export const calculatorGuidesOf = (
  path: string,
): { readonly href: string; readonly title: string }[] => {
  const english = routeOf(path)?.en ?? path;
  const guides = guidesOf(english);
  if (langOf(path) === 'en')
    return guides.map(({ path, card }) => ({ href: path, title: card.title }));
  return guides.flatMap(({ path: guide }) => {
    const route = routeOf(guide);
    const title = labelOf(route?.id ?? '', 'es');
    return route?.es === undefined || title === undefined ? [] : [{ href: route.es, title }];
  });
};

const NAMES = { en: 'English', es: 'Español' } as const;

/**
 * The header link to the same page in the other language, only when its route has the twin, so
 * the switch never leads to a page that does not exist.
 */
export const switchOf = (
  path: string,
): { readonly href: string; readonly lang: Lang; readonly label: string } | undefined => {
  const route = routeOf(path);
  if (route?.es === undefined) return undefined;
  const lang: Lang = langOf(path) === 'en' ? 'es' : 'en';
  return { href: lang === 'es' ? route.es : route.en, lang, label: NAMES[lang] };
};
