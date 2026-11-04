import { parse, type HTMLElement } from 'node-html-parser';

/** What a site's pages must say about themselves to link previews and search engines. */
export interface SeoRules {
  /** The site origin, `https://poolfigures.com`. */
  readonly origin: string;
  /** The path of the one link preview image every indexable page names, `/og.png`. */
  readonly image: string;
  /** The `og:type` and the schema.org `@type` of the page at a canonical path. */
  readonly typesOf: (path: string) => { readonly og: string; readonly schema: string };
}

const shown = (value: string | undefined): string => (value === undefined ? 'none' : `"${value}"`);

const must = (file: string, what: string, expected: string, found: string | undefined): string[] =>
  found === expected ? [] : [`${file}: ${what} must be "${expected}", found ${shown(found)}`];

/** The string field of a JSON-LD document, when it is an object that has one. */
const fieldOf = (document: unknown, key: string): string | undefined => {
  if (typeof document !== 'object' || document === null || Array.isArray(document)) return;
  const value: unknown = Reflect.get(document, key);
  return typeof value === 'string' ? value : undefined;
};

const jsonLdProblems = (file: string, root: HTMLElement, schema: string, url: string): string[] => {
  const blocks = root.querySelectorAll('script[type="application/ld+json"]');
  if (blocks.length !== 1)
    return [`${file}: expected one JSON-LD block, found ${String(blocks.length)}`];
  let document: unknown;
  try {
    document = JSON.parse(blocks.map(({ text }) => text).join(''));
  } catch {
    return [`${file}: the JSON-LD block is not valid JSON`];
  }
  return [
    ...must(file, 'the JSON-LD @type', schema, fieldOf(document, '@type')),
    ...must(file, 'the JSON-LD url', url, fieldOf(document, 'url')),
  ];
};

const pageProblems = (file: string, html: string, rules: SeoRules): string[] => {
  const root = parse(html);
  const content = (selector: string): string | undefined =>
    root.querySelector(selector)?.getAttribute('content');
  if (content('meta[name="robots"]')?.includes('noindex') === true) return [];
  const canonicals = root.querySelectorAll('link[rel="canonical"]');
  const canonical = canonicals[0]?.getAttribute('href');
  if (canonicals.length !== 1 || canonical === undefined)
    return [`${file}: an indexable page needs one canonical link`];
  const types = rules.typesOf(new URL(canonical).pathname);
  const meta = (property: string): string | undefined => content(`meta[property="${property}"]`);
  return [
    ...must(file, 'og:title', root.querySelector('title')?.text ?? '', meta('og:title')),
    ...must(
      file,
      'og:description',
      content('meta[name="description"]') ?? '',
      meta('og:description'),
    ),
    ...must(file, 'og:url', canonical, meta('og:url')),
    ...must(file, 'og:type', types.og, meta('og:type')),
    ...must(file, 'og:image', new URL(rules.image, rules.origin).href, meta('og:image')),
    ...must(file, 'twitter:card', 'summary_large_image', content('meta[name="twitter:card"]')),
    ...jsonLdProblems(file, root, types.schema, canonical),
  ];
};

/**
 * Every built page (`file` to HTML) that is indexable (no `noindex`) needs one canonical, the
 * Open Graph tags of its link preview (`og:url` at the canonical, the one absolute image) with a
 * large Twitter card, and exactly one JSON-LD block of its schema.org type at the canonical.
 */
export const seoProblems = (pages: ReadonlyMap<string, string>, rules: SeoRules): string[] =>
  [...pages].flatMap(([file, html]) => pageProblems(file, html, rules));

const PNG_SIGNATURE = '89504e470d0a1a0a';

/** The link preview image is a PNG of 1200 by 630 pixels (its IHDR width and height). */
export const imageProblems = (file: string, bytes: Uint8Array | undefined): string[] => {
  if (bytes === undefined) return [`${file}: the link preview image is not in the build`];
  const view = Buffer.from(bytes);
  if (view.length < 24 || view.subarray(0, 8).toString('hex') !== PNG_SIGNATURE)
    return [`${file}: is not a PNG`];
  const [width, height] = [view.readUInt32BE(16), view.readUInt32BE(20)];
  return width === 1200 && height === 630
    ? []
    : [
        `${file}: is ${String(width)} by ${String(height)} pixels, and a link preview is 1200 by 630`,
      ];
};
