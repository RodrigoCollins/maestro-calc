import { hrefOf, TRADE_PATHS, type Lang, type TradeId } from './routes.ts';
import { COMMON } from './texts/common.ts';
import { TRADE_TEXTS } from './texts/trades.ts';
import { OCCUPATIONS } from './wages/occupations.ts';

/** The short name of each page that is not a calculator, as the footer and the cards write it. */
export const PAGE_LABELS: Readonly<Record<Lang, Readonly<Record<string, string>>>> = {
  es: {
    'quote-guide': 'Cómo armar un presupuesto',
    'markup-guide': 'Recargo o margen',
    'rate-guide': 'Cómo fijar tu tarifa por hora',
    wages: 'Salarios por oficio y estado',
    methodology: 'Metodología y fuentes',
    about: 'Acerca de',
    editorial: 'Política editorial',
    privacy: 'Privacidad',
    embed: 'Calculadoras para tu sitio',
  },
  en: {
    'quote-guide': 'How to write a quote',
    'markup-guide': 'Markup vs margin',
    'rate-guide': 'How to set your hourly rate',
    wages: 'Wages by trade and state',
    methodology: 'Methodology and sources',
    about: 'About',
    editorial: 'Editorial policy',
    privacy: 'Privacy',
    embed: 'Calculators for your site',
  },
};

export interface NavLink {
  readonly href: string;
  readonly label: string;
}

/** The chips of the trade pages in `lang`, in the order of the site. */
export const chipsOf = (lang: Lang): readonly (NavLink & { readonly id: TradeId })[] =>
  OCCUPATIONS.map(({ id }) => ({
    id,
    href: TRADE_PATHS[id][lang],
    label: TRADE_TEXTS[lang][id].name,
  }));

const linksOf = (lang: Lang, ids: readonly string[]): readonly NavLink[] =>
  ids.map((id) => ({ href: hrefOf(id, lang), label: PAGE_LABELS[lang][id] ?? id }));

/** The footer link groups in `lang`. */
export const footerOf = (
  lang: Lang,
): readonly { readonly title: string; readonly links: readonly NavLink[] }[] => [
  {
    title: COMMON[lang].footerGroups.guides,
    links: linksOf(lang, ['quote-guide', 'markup-guide', 'rate-guide', 'wages']),
  },
  {
    title: COMMON[lang].footerGroups.site,
    links: linksOf(lang, ['methodology', 'about', 'editorial', 'privacy', 'embed']),
  },
];

/** The header link to the same page in the other language. */
export const switchOf = (
  route: { readonly es: string; readonly en: string },
  lang: Lang,
): { readonly href: string; readonly lang: Lang; readonly label: string } => {
  const other: Lang = lang === 'es' ? 'en' : 'es';
  return { href: route[other], lang: other, label: COMMON[lang].lang.label };
};
