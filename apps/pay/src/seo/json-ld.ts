import {
  articleLd,
  serializeJsonLd,
  webApplicationLd,
  webSiteLd,
} from '@maestro-calc/site-kit/json-ld';
import type { Route } from '../routes.ts';
import { SITE } from '../site.config.ts';

/** The page name without the ` | Cuenta Horas` suffix of its title. */
const nameOf = (title: string): string => title.replace(/\s*\|\s*Cuenta Horas$/, '');

/**
 * The schema.org description of a page (`@maestro-calc/site-kit/json-ld`): the home is the
 * WebSite, a calculator a free WebApplication, the methodology an Article.
 */
export const jsonLdOf = (
  route: Route,
  lang: 'en' | 'es',
  page: { readonly title: string; readonly description: string },
  origin: string,
): string => {
  const url = new URL(lang === 'en' ? route.en : route.es, origin).href;
  const inLanguage = lang === 'en' ? 'en-US' : 'es-US';
  const { description } = page;
  return serializeJsonLd(
    route.kind === 'home'
      ? webSiteLd({ name: SITE.name, url, inLanguage })
      : route.kind === 'calculator'
        ? webApplicationLd({
            name: nameOf(page.title),
            description,
            url,
            inLanguage,
            applicationCategory: 'FinanceApplication',
          })
        : articleLd({
            headline: nameOf(page.title),
            description,
            url,
            inLanguage,
            publisher: SITE.name,
          }),
  );
};
