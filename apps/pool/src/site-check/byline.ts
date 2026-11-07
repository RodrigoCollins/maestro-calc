import type { BylinePage } from '../bylines.ts';
import { hrefOf, langOf } from '../routes.ts';

const BYLINE = /<\/h1>\s*<p\b[^>]*\sclass="pool-byline(?: [^"]*)?"[^>]*>([\s\S]*?)<\/p>/;
const TIME = /<time\b[^>]*\sdatetime="([^"]*)"/;
const MODIFIED = /"dateModified":"([^"]*)"/;
const SECTION = /<section\b[^>]*\saria-labelledby="sources"[^>]*>([\s\S]*?)<\/section>/;

/**
 * What the built byline pages (`BYLINE_PAGES` of `src/bylines.ts`) must hold, by canonical path:
 * the byline right under the h1, crediting the editorial team at the policy of the page's
 * language, the review day exactly when the page's data carries one (in the byline and as the
 * JSON-LD `dateModified`), and the link to a sources section that links every source of the page.
 */
export const bylineProblems = (
  site: ReadonlyMap<string, string>,
  pages: readonly BylinePage[],
): string[] =>
  pages.flatMap(({ path, checked, sources }) => {
    const html = site.get(path);
    if (html === undefined) return [`${path}: a byline page the build does not hold`];
    const byline = BYLINE.exec(html)?.[1];
    if (byline === undefined) return [`${path}: no byline right under the h1`];
    const policy = hrefOf('editorial', langOf(path));
    const day = TIME.exec(byline)?.[1];
    const modified = MODIFIED.exec(html)?.[1];
    const section = SECTION.exec(html)?.[1];
    return [
      ...(byline.includes(`href="${policy}"`)
        ? []
        : [`${path}: the byline must credit the editorial team at ${policy}`]),
      ...(checked === undefined
        ? day === undefined
          ? []
          : [`${path}: the byline gives a review day the page data does not carry`]
        : day === checked
          ? []
          : [`${path}: the byline must give the review day ${checked}`]),
      ...(checked === undefined
        ? modified === undefined
          ? []
          : [`${path}: the JSON-LD gives a dateModified the page data does not carry`]
        : modified === checked
          ? []
          : [`${path}: the JSON-LD must give dateModified ${checked}`]),
      ...(byline.includes('href="#sources"')
        ? []
        : [`${path}: the byline must link the #sources section`]),
      ...(section === undefined
        ? [`${path}: the page has no #sources section`]
        : sources.flatMap(({ url }) =>
            url === undefined || section.includes(`href="${url.replaceAll('&', '&amp;')}"`)
              ? []
              : [`${path}: the sources section does not link ${url}`],
          )),
    ];
  });
