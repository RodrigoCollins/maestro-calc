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
}: Page & {
  readonly name: string;
  readonly description: string;
  /** A schema.org category such as `UtilitiesApplication` or `FinanceApplication`. */
  readonly applicationCategory: string;
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
});

export const articleLd = ({
  headline,
  description,
  url,
  inLanguage,
  publisher,
}: Page & {
  readonly headline: string;
  readonly description: string;
  /** The name of the site that publishes it. */
  readonly publisher: string;
}) => ({
  '@context': CONTEXT,
  '@type': 'Article',
  headline,
  description,
  url,
  inLanguage,
  publisher: { '@type': 'Organization', name: publisher },
});

/** The JSON text of a document for a `<script type="application/ld+json">`: `<`, `>` and `&` escaped, so it stays inside its script. */
export const serializeJsonLd = (value: unknown): string =>
  JSON.stringify(value)
    .replaceAll('<', '\\u003c')
    .replaceAll('>', '\\u003e')
    .replaceAll('&', '\\u0026');
