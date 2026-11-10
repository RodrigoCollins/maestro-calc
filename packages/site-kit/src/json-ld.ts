/**
 * The schema.org nodes the niche sites (Cuenta Horas, Pool Figures) describe their pages with: the
 * home is the WebSite, a calculator a free WebApplication, a guide an Article. Each is a whole
 * JSON-LD document with its `@context`.
 */
const CONTEXT = 'https://schema.org';

/** A page of one site: its canonical URL and its BCP 47 language (`en-US`). */
interface Page {
  readonly url: string;
  readonly inLanguage: string;
}

export const webSiteLd = ({ name, url, inLanguage }: Page & { readonly name: string }) => ({
  '@context': CONTEXT,
  '@type': 'WebSite',
  name,
  url,
  inLanguage,
});

export const webApplicationLd = ({
  name,
  description,
  url,
  inLanguage,
  applicationCategory,
  dateModified,
}: Page & {
  readonly name: string;
  readonly description: string;
  /** A schema.org category such as `UtilitiesApplication` or `FinanceApplication`. */
  readonly applicationCategory: string;
  /** The day the page's cited content was last checked (`YYYY-MM-DD`), when it carries one. */
  readonly dateModified?: string;
}) => ({
  '@context': CONTEXT,
  '@type': 'WebApplication',
  name,
  description,
  url,
  inLanguage,
  applicationCategory,
  operatingSystem: 'Any',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  ...(dateModified === undefined ? {} : { dateModified }),
});

/**
 * The organization behind an article: its name alone, or with its home page and the page of its
 * editorial policy (`publishingPrinciples`).
 */
export type OrganizationRef =
  | string
  | {
      readonly name: string;
      readonly url?: string;
      readonly publishingPrinciples?: string;
    };

/** The `Organization` node of a site's publisher, for its home graph and as an author. */
export const organizationLd = (organization: OrganizationRef) => ({
  '@type': 'Organization',
  ...(typeof organization === 'string' ? { name: organization } : organization),
});

export const articleLd = ({
  headline,
  description,
  url,
  inLanguage,
  publisher,
  author,
  dateModified,
}: Page & {
  readonly headline: string;
  readonly description: string;
  /** The site that publishes it: its name, or the organization with its address and policy. */
  readonly publisher: OrganizationRef;
  /** Who wrote it, when the site names it (an organization: its editorial team). */
  readonly author?: OrganizationRef;
  /** The day the page was last reviewed, as `YYYY-MM-DD`, when the page carries one. */
  readonly dateModified?: string;
}) => ({
  '@context': CONTEXT,
  '@type': 'Article',
  headline,
  description,
  url,
  inLanguage,
  ...(author === undefined ? {} : { author: organizationLd(author) }),
  publisher: organizationLd(publisher),
  ...(dateModified === undefined ? {} : { dateModified }),
});

/** The trail from the home to a page (a job page: home, its calculator, itself), each item at its 1-based position. */
export const breadcrumbListLd = (
  items: readonly { readonly name: string; readonly url: string }[],
) => ({
  '@context': CONTEXT,
  '@type': 'BreadcrumbList',
  itemListElement: items.map(({ name, url }, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name,
    item: url,
  })),
});

/** Several nodes of one page as one document: one `@context`, the nodes in its `@graph`. */
export const graphLd = (...nodes: readonly Readonly<Record<string, unknown>>[]) => ({
  '@context': CONTEXT,
  '@graph': nodes.map((node) =>
    Object.fromEntries(Object.entries(node).filter(([key]) => key !== '@context')),
  ),
});

/** A step of a breadcrumb: the name of a page and its canonical URL. */
export interface Crumb {
  readonly name: string;
  readonly url: string;
}

/**
 * A page and the BreadcrumbList of its trail (`trail`, from the home to the page itself) in one
 * graph, the page first, so its `@type` and `url` stay the first node's.
 */
export const withBreadcrumb = (page: Readonly<Record<string, unknown>>, trail: readonly Crumb[]) =>
  graphLd(page, breadcrumbListLd(trail));

/** The JSON text of a document for a `<script type="application/ld+json">`: `<`, `>` and `&` escaped, so it stays inside its script. */
export const serializeJsonLd = (value: unknown): string =>
  JSON.stringify(value)
    .replaceAll('<', '\\u003c')
    .replaceAll('>', '\\u003e')
    .replaceAll('&', '\\u0026');
