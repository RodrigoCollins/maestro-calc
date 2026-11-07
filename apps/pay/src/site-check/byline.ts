import type { BylinePage } from '../editorial/bylines.ts';
import { EDITORIAL_PATHS } from '../editorial/paths.ts';

const BYLINE = /<\/h1>\s*<p\b[^>]*\sclass="byline(?: [^"]*)?"[^>]*>([\s\S]*?)<\/p>/;
const TIME = /<time\b[^>]*\sdatetime="([^"]*)"/;
// the sources a byline links: a section labelled `sources`, or the element of id `sources` (the
// line under a table), up to the end of that element
const SECTION = /<section\b[^>]*\saria-labelledby="sources"[^>]*>([\s\S]*?)<\/section>/;
const LINE = /<p\b[^>]*\sid="sources"[^>]*>([\s\S]*?)<\/p>/;

/**
 * What the built byline pages (`BYLINE_PAGES` of `src/editorial/bylines.ts`) must hold, by path:
 * the byline right under the h1, crediting the editorial team at the policy of the page's
 * language, the review day its data carries, and the link to the sources of the page, which link
 * every source the page cites.
 */
export const bylineProblems = (
  read: (path: string) => string | undefined,
  pages: readonly BylinePage[],
): string[] =>
  pages.flatMap(({ path, checked, sources }) => {
    const html = read(path);
    if (html === undefined) return [`${path}: a byline page the build does not hold`];
    const byline = BYLINE.exec(html)?.[1];
    if (byline === undefined) return [`${path}: no byline right under the h1`];
    const policy = EDITORIAL_PATHS[path === '/es' || path.startsWith('/es/') ? 'es' : 'en'];
    const section = SECTION.exec(html)?.[1] ?? LINE.exec(html)?.[1];
    return [
      ...(byline.includes(`href="${policy}"`)
        ? []
        : [`${path}: the byline must credit the editorial team at ${policy}`]),
      ...(TIME.exec(byline)?.[1] === checked
        ? []
        : [`${path}: the byline must give the review day ${checked}`]),
      ...(byline.includes('href="#sources"')
        ? []
        : [`${path}: the byline must link the #sources section`]),
      ...(section === undefined
        ? [`${path}: the page has no #sources section`]
        : sources.flatMap((url) =>
            section.includes(`href="${url.replaceAll('&', '&amp;')}"`)
              ? []
              : [`${path}: the sources section does not link ${url}`],
          )),
    ];
  });
