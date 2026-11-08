/** A page that carries the byline of the editorial team (`BYLINE_PAGES` of `src/bylines.ts`). */
export interface BylinePage {
  readonly path: string;
  readonly checked?: string;
  readonly sources: readonly { readonly name: string; readonly url?: string }[];
}

const BYLINE = /<\/h1>\s*<p\b[^>]*\sclass="bf-byline(?: [^"]*)?"[^>]*>([\s\S]*?)<\/p>/;
const TIME = /<time\b[^>]*\sdatetime="([^"]*)"/;
const MODIFIED = /"dateModified":"([^"]*)"/;
const SECTION = /<section\b[^>]*\saria-labelledby="sources"[^>]*>([\s\S]*?)<\/section>/;

/**
 * What the built byline pages must hold, by canonical path: the byline right under the h1,
 * crediting the editorial team at the policy, the review day exactly when the page's data carries
 * one (in the byline and, on an open site, as the JSON-LD `dateModified`), and the link to a
 * sources section that links every source of the page.
 */
export const bylineProblems = (
  site: ReadonlyMap<string, string>,
  pages: readonly BylinePage[],
  policy: string,
  indexable: boolean,
): string[] =>
  pages.flatMap(({ path, checked, sources }) => {
    const html = site.get(path);
    if (html === undefined) return [`${path}: a byline page the build does not hold`];
    const byline = BYLINE.exec(html)?.[1];
    if (byline === undefined) return [`${path}: no byline right under the h1`];
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
      // a closed site writes no JSON-LD (no canonical), so only an open one can be held to it
      ...(!indexable || checked === undefined || modified === checked
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
