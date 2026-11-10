import type { AffiliateOffer } from '@maestro-calc/site-kit/affiliate';

/**
 * The affiliate offers of the site, in the order a page lists them. A link reaches a page only as
 * data here, never written into a page: a page shows `enabledOffers(OFFERS)` through
 * `AffiliateBlock.astro`. Each entry stays `enabled: false` until its program approves the site
 * and its tracked https link is checked by hand. An offer has no price field on purpose.
 */
export const OFFERS: readonly AffiliateOffer<'es' | 'en'>[] = [
  {
    id: 'invoicing-software',
    network: 'cj',
    name: 'Software de facturación (placeholder)',
    why: {
      es: 'Marcador: la frase de por qué encaja se escribe cuando el programa aprueba el sitio.',
      en: 'Placeholder: the sentence on why it fits is written when the program approves the site.',
    },
    url: 'https://example.com/affiliate-placeholder',
    enabled: false,
  },
];
