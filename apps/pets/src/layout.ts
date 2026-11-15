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
};

/** The header links of `lang`, each at its page. */
export const navLinks = (lang: Lang = 'en'): { href: string; label: string }[] =>
  linksOf(LINKS[lang].nav, lang);

/** The footer links of `lang`, each at its page. */
export const footerLinks = (lang: Lang = 'en'): { href: string; label: string }[] =>
  linksOf(LINKS[lang].footer, lang);

/** Each language named in itself, as the link to it reads. */
const NAMES: Readonly<Record<Lang, string>> = { en: 'English', de: 'Deutsch', fr: 'Français' };

/** The languages in the order the header lists them. */
const ORDER: readonly Lang[] = ['en', 'de', 'fr'];

/**
 * The links to the other languages' pages, when the page at `path` has twins: a German or French
 * page always leads to its English twin, and any page leads to a German or French twin only once
 * that language is open (`open`, from `SITE.deIndexable` and `SITE.frIndexable`), so no page sends a
 * reader to a page closed to search engines.
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
