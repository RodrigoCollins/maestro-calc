import { hrefOf, langOf, routeOf, type Lang, type Twin } from './routes.ts';

/** One link of the header or the footer: the route it leads to and its label. */
interface NavLink {
  readonly id: string;
  readonly label: string;
}

/** The header: the calculators people come for, as pills. */
const NAV: readonly NavLink[] = [
  { id: 'dog', label: 'Dog food' },
  { id: 'cat', label: 'Cat food' },
  { id: 'puppy', label: 'Puppy' },
  { id: 'kitten', label: 'Kitten' },
  { id: 'chocolate', label: 'Chocolate' },
  { id: 'due-date', label: 'Due date' },
  { id: 'dog-age', label: 'Dog age' },
  { id: 'cat-age', label: 'Cat age' },
  { id: 'puppy-weight', label: 'Puppy weight' },
];

/** The footer: the data, the guides and the pages about the site. */
const FOOTER: readonly NavLink[] = [
  { id: 'charts', label: 'Data and charts' },
  { id: 'dog-chart', label: 'Dog feeding chart' },
  { id: 'puppy-chart', label: 'Puppy feeding chart' },
  { id: 'chocolate-chart', label: 'Chocolate toxicity chart' },
  { id: 'dog-age-chart', label: 'Dog age chart' },
  { id: 'cat-age-chart', label: 'Cat age chart' },
  { id: 'cat-chart', label: 'Cat feeding chart' },
  { id: 'label-guide', label: 'How to read a pet food label' },
  { id: 'feed', label: 'How much to feed a dog' },
  { id: 'breed-guide', label: 'Dog food by breed' },
  { id: 'chocolate-guide', label: 'My dog ate chocolate' },
  { id: 'cat-growth-guide', label: 'When do cats stop growing?' },
  { id: 'dog-heat-guide', label: 'Dog in heat' },
  { id: 'foods', label: 'Can dogs eat it?' },
  { id: 'plants-cats', label: 'Plants toxic to cats' },
  { id: 'plants-dogs', label: 'Plants toxic to dogs' },
  { id: 'plants-safe', label: 'Pet-safe houseplants' },
  { id: 'methodology', label: 'How we work it out' },
  { id: 'about', label: 'About' },
  { id: 'editorial', label: 'Editorial policy' },
  { id: 'privacy', label: 'Privacy' },
];

/** The German header: the hub of the food pages, the dog age calculator and the chocolate guide. */
const NAV_DE: readonly NavLink[] = [
  { id: 'foods', label: 'Was dürfen Hunde essen?' },
  { id: 'dog-age', label: 'Hundejahre' },
  { id: 'chocolate-guide', label: 'Schokolade' },
];

/** The German footer: the same three, then the pages about the site. */
const FOOTER_DE: readonly NavLink[] = [
  { id: 'foods', label: 'Was dürfen Hunde essen? Alle Lebensmittel' },
  { id: 'dog-age', label: 'Hundejahre in Menschenjahre' },
  { id: 'chocolate-guide', label: 'Hund hat Schokolade gefressen' },
  { id: 'about', label: 'Über uns' },
  { id: 'editorial', label: 'Redaktionelle Grundsätze' },
  { id: 'privacy', label: 'Datenschutz' },
];

/** The French header: the hub of the food pages, the dog age calculator and the chocolate guide. */
const NAV_FR: readonly NavLink[] = [
  { id: 'foods', label: 'Que peut manger un chien ?' },
  { id: 'dog-age', label: 'Âge du chien' },
  { id: 'chocolate-guide', label: 'Chocolat' },
];

/** The French footer: the same three, then the pages about the site. */
const FOOTER_FR: readonly NavLink[] = [
  { id: 'foods', label: 'Que peut manger un chien ? Tous les aliments' },
  { id: 'dog-age', label: 'Âge du chien en âge humain' },
  { id: 'chocolate-guide', label: 'Mon chien a mangé du chocolat' },
  { id: 'about', label: 'À propos' },
  { id: 'editorial', label: 'Principes éditoriaux' },
  { id: 'privacy', label: 'Confidentialité' },
];

/** The Spanish header: the hub of the food pages, the dog age calculator and the chocolate guide. */
const NAV_ES: readonly NavLink[] = [
  { id: 'feed', label: '¿Cuánto debe comer?' },
  { id: 'foods', label: '¿Qué pueden comer?' },
  { id: 'dog-age', label: 'Edad del perro' },
  { id: 'chocolate-guide', label: 'Chocolate' },
];

/** The Spanish footer: the feeding pages, the same three, the plant hubs, then the pages about the site. */
const FOOTER_ES: readonly NavLink[] = [
  { id: 'feed', label: '¿Cuánto debe comer un perro según su peso?' },
  { id: 'dog', label: 'Calculadora de comida para perros' },
  { id: 'cat', label: 'Calculadora de comida para gatos' },
  { id: 'foods', label: '¿Qué frutas pueden comer los perros? Todos los alimentos' },
  { id: 'dog-age', label: 'Edad de perro en años humanos' },
  { id: 'chocolate-guide', label: '¿Qué pasa si un perro come chocolate?' },
  { id: 'plants-dogs', label: 'Plantas tóxicas para perros' },
  { id: 'plants-cats', label: 'Plantas tóxicas para gatos' },
  { id: 'plants-safe', label: 'Plantas seguras para perros y gatos' },
  { id: 'about', label: 'Acerca de' },
  { id: 'editorial', label: 'Política editorial' },
  { id: 'privacy', label: 'Privacidad' },
];

/** What the layout writes around every page, in each language. */
export const LAYOUT_TEXTS = {
  en: {
    navLabel: 'Calculators',
    warning:
      'Every figure is a starting point, not veterinary advice. Check the amount with your pet’s veterinarian.',
  },
  de: {
    navLabel: 'Rechner und Ratgeber',
    warning:
      'Jede Zahl ist ein Anhaltspunkt und keine tierärztliche Beratung. Besprechen Sie sie mit Ihrem Tierarzt oder Ihrer Tierärztin.',
  },
  fr: {
    navLabel: 'Calculateurs et guides',
    warning:
      'Chaque chiffre est un point de départ, pas un avis vétérinaire. Parlez-en avec votre vétérinaire.',
  },
  es: {
    navLabel: 'Calculadoras y guías',
    warning:
      'Cada cifra es un punto de partida, no un consejo veterinario. Coméntala con tu veterinario.',
  },
} as const satisfies Record<Lang, { readonly navLabel: string; readonly warning: string }>;

const linksOf = (links: readonly NavLink[], lang: Lang): { href: string; label: string }[] =>
  links.map(({ id, label }) => ({ href: hrefOf(id, lang), label }));

/** The header and footer links of each language. */
const LINKS: Readonly<
  Record<Lang, { readonly nav: readonly NavLink[]; readonly footer: readonly NavLink[] }>
> = {
  en: { nav: NAV, footer: FOOTER },
  de: { nav: NAV_DE, footer: FOOTER_DE },
  fr: { nav: NAV_FR, footer: FOOTER_FR },
  es: { nav: NAV_ES, footer: FOOTER_ES },
};

/** The header links of `lang`, each at its page. */
export const navLinks = (lang: Lang = 'en'): { href: string; label: string }[] =>
  linksOf(LINKS[lang].nav, lang);

/** The footer links of `lang`, each at its page. */
export const footerLinks = (lang: Lang = 'en'): { href: string; label: string }[] =>
  linksOf(LINKS[lang].footer, lang);

/** Each language named in itself, as the link to it reads. */
const NAMES: Readonly<Record<Lang, string>> = {
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
};

/** The languages in the order the header lists them. */
const ORDER: readonly Lang[] = ['en', 'de', 'fr', 'es'];

/**
 * The links to the other languages' pages, when the page at `path` has twins: a German, French or
 * Spanish page always leads to its English twin, and any page leads to a twin in another language
 * only once that language is open (`open`, from `SITE.deIndexable`, `SITE.frIndexable` and
 * `SITE.esIndexable`), so no page sends a reader to a page closed to search engines.
 */
export const switchesOf = (
  path: string,
  open: Readonly<Record<Twin, boolean>>,
): { readonly href: string; readonly lang: Lang; readonly label: string }[] => {
  const route = routeOf(path);
  if (route === undefined) return [];
  const own = langOf(path);
  return ORDER.flatMap((lang) => {
    if (lang === own) return [];
    const href = lang === 'en' ? route.path : route[lang];
    if (href === undefined || (lang !== 'en' && !open[lang])) return [];
    return [{ href, lang, label: NAMES[lang] }];
  });
};
