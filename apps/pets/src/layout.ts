import { hrefOf, langOf, routeOf, type Lang } from './routes.ts';

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
} as const satisfies Record<Lang, { readonly navLabel: string; readonly warning: string }>;

const linksOf = (links: readonly NavLink[], lang: Lang): { href: string; label: string }[] =>
  links.map(({ id, label }) => ({ href: hrefOf(id, lang), label }));

/** The header links of `lang`, each at its page. */
export const navLinks = (lang: Lang = 'en'): { href: string; label: string }[] =>
  lang === 'en' ? linksOf(NAV, 'en') : linksOf(NAV_DE, 'de');

/** The footer links of `lang`, each at its page. */
export const footerLinks = (lang: Lang = 'en'): { href: string; label: string }[] =>
  lang === 'en' ? linksOf(FOOTER, 'en') : linksOf(FOOTER_DE, 'de');

/** Each language named in itself, as the switch to it reads. */
const NAMES: Readonly<Record<Lang, string>> = { en: 'English', de: 'Deutsch' };

/**
 * The link to the other language's page, when the page at `path` has a twin: a German page always
 * leads to its English twin; an English page leads to its German twin only once German is open
 * (`SITE.deIndexable`), so no open page sends a reader to a page closed to search engines.
 */
export const switchOf = (
  path: string,
  deOpen: boolean,
): { readonly href: string; readonly lang: Lang; readonly label: string } | undefined => {
  const route = routeOf(path);
  if (route?.de === undefined) return undefined;
  if (langOf(path) === 'de') return { href: route.path, lang: 'en', label: NAMES.en };
  return deOpen ? { href: route.de, lang: 'de', label: NAMES.de } : undefined;
};
