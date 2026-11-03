import type { Route } from '../routes.ts';
import { SITE } from '../site.config.ts';

/** The page name without the ` | Cuenta Horas` suffix of its title. */
const nameOf = (title: string): string => title.replace(/\s*\|\s*Cuenta Horas$/, '');

/**
 * The schema.org description of a page: the home is the WebSite, a calculator a free
 * WebApplication, the methodology an Article. `<` is escaped so the text stays inside its script.
 */
export const jsonLdOf = (
  route: Route,
  lang: 'en' | 'es',
  page: { readonly title: string; readonly description: string },
  origin: string,
): string => {
  const url = new URL(lang === 'en' ? route.en : route.es, origin).href;
  const inLanguage = lang === 'en' ? 'en-US' : 'es-US';
  const data =
    route.kind === 'home'
      ? { '@type': 'WebSite', name: SITE.name, url, inLanguage }
      : route.kind === 'calculator'
        ? {
            '@type': 'WebApplication',
            name: nameOf(page.title),
            description: page.description,
            url,
            inLanguage,
            applicationCategory: 'FinanceApplication',
            operatingSystem: 'Any',
            isAccessibleForFree: true,
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          }
        : {
            '@type': 'Article',
            headline: nameOf(page.title),
            description: page.description,
            url,
            inLanguage,
            publisher: { '@type': 'Organization', name: SITE.name },
          };
  return JSON.stringify({ '@context': 'https://schema.org', ...data }).replaceAll('<', '\\u003c');
};
