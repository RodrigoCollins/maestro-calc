import { hrefOf } from './routes.ts';

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
];

/** The footer: the data, the guides and the pages about the site. */
const FOOTER: readonly NavLink[] = [
  { id: 'charts', label: 'Data and charts' },
  { id: 'dog-chart', label: 'Dog feeding chart' },
  { id: 'puppy-chart', label: 'Puppy feeding chart' },
  { id: 'chocolate-chart', label: 'Chocolate toxicity chart' },
  { id: 'dog-age-chart', label: 'Dog age chart' },
  { id: 'label-guide', label: 'How to read a pet food label' },
  { id: 'breed-guide', label: 'Dog food by breed' },
  { id: 'chocolate-guide', label: 'My dog ate chocolate' },
  { id: 'methodology', label: 'How we work it out' },
  { id: 'about', label: 'About' },
  { id: 'editorial', label: 'Editorial policy' },
  { id: 'privacy', label: 'Privacy' },
];

/** What the layout writes around every page. */
export const LAYOUT_TEXTS = {
  navLabel: 'Calculators',
  warning:
    'Every figure is a starting point, not veterinary advice. Check the amount with your pet’s veterinarian.',
} as const;

const linksOf = (links: readonly NavLink[]): { href: string; label: string }[] =>
  links.map(({ id, label }) => ({ href: hrefOf(id), label }));

/** The header links, each at its page. */
export const navLinks = (): { href: string; label: string }[] => linksOf(NAV);

/** The footer links, each at its page. */
export const footerLinks = (): { href: string; label: string }[] => linksOf(FOOTER);
