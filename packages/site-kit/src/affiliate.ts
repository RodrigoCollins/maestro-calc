import { parse } from 'node-html-parser';

/** The affiliate networks an offer can come from. */
export type AffiliateNetwork = 'cj' | 'impact' | 'partnerstack' | 'amazon';

/** The languages an offer can be shown in. */
export type AffiliateLocale = 'en' | 'es';

/**
 * One affiliate offer of a site's registry: links are added as data, never written into a page.
 * It has no price on purpose: a page never quotes what a program costs.
 */
export interface AffiliateOffer<L extends AffiliateLocale = AffiliateLocale> {
  readonly id: string;
  readonly network: AffiliateNetwork;
  /** The product or program name. */
  readonly name: string;
  /** One sentence per language on why it fits the page it is shown on. */
  readonly why: Readonly<Record<L, string>>;
  /** The tracked https link the network gives. */
  readonly url: string;
  /** False until the program approves the site and the link is checked by hand. */
  readonly enabled: boolean;
}

/** The disclosure shown right next to every affiliate link. */
export const DISCLOSURE: Readonly<Record<AffiliateLocale, string>> = {
  en: 'Paid link: we earn a commission if you sign up through it, at no cost to you.',
  es: 'Enlace pagado: ganamos una comisión si te registras a través de él, sin costo para ti.',
};

/** The statement the Amazon Associates agreement requires, added to an Amazon offer. */
export const AMAZON_DISCLOSURE: Readonly<Record<AffiliateLocale, string>> = {
  en: 'As an Amazon Associate I earn from qualifying purchases.',
  es: 'Como Afiliado de Amazon, gano con las compras que cumplen los requisitos.',
};

/** The offers a page may show: the enabled ones, in registry order. */
export const enabledOffers = <O extends Pick<AffiliateOffer, 'enabled'>>(
  offers: readonly O[],
): O[] => offers.filter(({ enabled }) => enabled);

const whyOf = <L extends AffiliateLocale>(
  offer: AffiliateOffer<L>,
  locale: L,
): string | undefined => {
  const why: Partial<Record<AffiliateLocale, string>> = offer.why;
  const text = (why[locale] ?? '').trim();
  return text === '' ? undefined : text;
};

/** What is wrong with a registry: a non-https url, a repeated id, an empty name or why. */
export const offerProblems = <L extends AffiliateLocale>(
  offers: readonly AffiliateOffer<L>[],
  locales: readonly L[],
): string[] =>
  offers.flatMap((offer, index) => [
    ...(offer.url.startsWith('https://')
      ? []
      : [`${offer.id}: the url must be https, found "${offer.url}"`]),
    ...(offers.findIndex(({ id }) => id === offer.id) === index
      ? []
      : [`${offer.id}: the id is used twice`]),
    ...(offer.name.trim() === '' ? [`${offer.id}: the name is empty`] : []),
    ...locales
      .filter((locale) => whyOf(offer, locale) === undefined)
      .map((locale) => `${offer.id}: no why for "${locale}"`),
  ]);

const escape = (text: string): string =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

/**
 * The markup of the recommendation block of one offer: its name, why it fits, the sponsored link
 * and the disclosure next to it. No script, no price. The `data-affiliate` hooks are what
 * `affiliateLinkProblems` reads in the built pages.
 */
export const affiliateBlockHtml = <L extends AffiliateLocale>(
  offer: AffiliateOffer<L>,
  locale: L,
): string => {
  const why = whyOf(offer, locale);
  if (why === undefined) throw new Error(`${offer.id}: no why for "${locale}"`);
  const disclosure =
    offer.network === 'amazon'
      ? `${DISCLOSURE[locale]} ${AMAZON_DISCLOSURE[locale]}`
      : DISCLOSURE[locale];
  return [
    `<aside class="affiliate" data-affiliate="block">`,
    `<p class="affiliate-name">${escape(offer.name)}</p>`,
    `<p>${escape(why)}</p>`,
    `<p><a href="${escape(offer.url)}" rel="sponsored noopener" target="_blank">${escape(offer.name)}</a> `,
    `<small data-affiliate="disclosure">${disclosure}</small></p>`,
    `</aside>`,
  ].join('');
};

/**
 * The site-check rule of a built page: every link whose rel holds `sponsored` sits in a
 * `data-affiliate="block"` wrapper that holds a non-empty disclosure, opens in a new tab and has
 * rel `noopener`.
 */
export const affiliateLinkProblems = (file: string, html: string): string[] =>
  parse(html)
    .querySelectorAll('a[rel]')
    .flatMap((link) => {
      const rel = String(link.getAttribute('rel')).toLowerCase().split(/\s+/);
      if (!rel.includes('sponsored')) return [];
      const href = link.getAttribute('href') ?? 'nowhere';
      const block = link.closest('[data-affiliate="block"]');
      if (block === null)
        return [`${file}: the sponsored link to ${href} must be inside a data-affiliate block`];
      const disclosed = block
        .querySelectorAll('[data-affiliate="disclosure"]')
        .some(({ text }) => text.trim() !== '');
      return [
        ...(disclosed
          ? []
          : [`${file}: the affiliate block of ${href} must hold a non-empty disclosure`]),
        ...(link.getAttribute('target') === '_blank'
          ? []
          : [`${file}: the sponsored link to ${href} must open with target="_blank"`]),
        ...(rel.includes('noopener')
          ? []
          : [`${file}: the sponsored link to ${href} must have rel noopener`]),
      ];
    });
