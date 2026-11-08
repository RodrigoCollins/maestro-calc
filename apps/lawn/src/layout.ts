import { GUIDES } from './guide.ts';
import { hrefOf } from './routes.ts';

export { navOf } from './home.ts';

/** What the layout writes around every page. */
export const LAYOUT_TEXT = {
  navLabel: 'Calculators',
  warning:
    'Every figure is an estimate. Read the label of your product and follow your soil test and local rules before you spread it.',
} as const;

/** The footer links: the guides, the frost dates, the methodology and the policies. */
export const footerLinks = (): readonly { readonly href: string; readonly label: string }[] => [
  { href: hrefOf('methodology'), label: 'How we work it out' },
  { href: hrefOf('frost-index'), label: 'Frost dates by state' },
  ...GUIDES.map(({ path, card }) => ({ href: path, label: card.title })),
  { href: hrefOf('privacy'), label: 'Privacy' },
  { href: hrefOf('about'), label: 'About' },
  { href: hrefOf('editorial'), label: 'Editorial policy' },
];
