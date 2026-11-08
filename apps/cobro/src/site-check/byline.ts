import type { BylinePage } from '../bylines.ts';
import { hrefOf, langOf } from '../routes.ts';

const BYLINE = /<\/h1>\s*<p\b[^>]*\sclass="byline"[^>]*>([\s\S]*?)<\/p>/;
const TIME = /<time\b[^>]*\sdatetime="([^"]*)"/;
const MODIFIED = /"dateModified":"([^"]*)"/;
const SOURCES_LINK = /href="#([^"]+)"/;

/**
 * What the built byline pages (`BYLINE_PAGES` of `src/bylines.ts`) must hold, by canonical path:
 * the byline right under the h1, crediting the editorial team at the policy of the page's
 * language, the review day (in the byline and as the JSON-LD `dateModified`), and the link to a
 * sources section of the page that links every source with an address.
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
    const anchor = SOURCES_LINK.exec(byline)?.[1];
    const section =
      anchor === undefined
        ? undefined
        : new RegExp(`id="${anchor}"[^>]*>([\\s\\S]*?)(?=<h2|</article>|$)`).exec(html)?.[1];
    return [
      ...(byline.includes(`href="${policy}"`)
        ? []
        : [`${path}: the byline must credit the editorial team at ${policy}`]),
      ...(day === checked ? [] : [`${path}: the byline must give the review day ${checked}`]),
      ...(modified === checked ? [] : [`${path}: the JSON-LD must give dateModified ${checked}`]),
      ...(sources.length === 0 || anchor !== undefined
        ? []
        : [`${path}: the byline must link its sources section`]),
      ...(anchor === undefined || sources.length === 0
        ? []
        : section === undefined
          ? [`${path}: the page has no #${anchor} section`]
          : sources.flatMap(({ url }) =>
              url === undefined || section.includes(`href="${url.replaceAll('&', '&amp;')}"`)
                ? []
                : [`${path}: the sources section does not link ${url}`],
            )),
    ];
  });
