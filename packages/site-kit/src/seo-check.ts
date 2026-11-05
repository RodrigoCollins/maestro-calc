import { parse, type HTMLElement } from 'node-html-parser';

/** What a site's pages must say about themselves to link previews and search engines. */
export interface SeoRules {
  /** The site origin, `https://poolfigures.com`. */
  readonly origin: string;
  /** The path of the one link preview image every indexable page names, `/og.png`. */
  readonly image: string;
  /** The `og:type` and the schema.org `@type` of the page at a canonical path. */
  readonly typesOf: (path: string) => { readonly og: string; readonly schema: string };
  /**
   * The path of the home the BreadcrumbList of the page at a canonical path starts at, or
   * undefined when the page has none (a home). Without it no page needs a breadcrumb.
   */
  readonly breadcrumbHomeOf?: (path: string) => string | undefined;
}

/** Markup the sites never publish: rich results Google limits, and spam on a calculator page. */
const REFUSED = ['FAQPage', 'HowTo'];

const shown = (value: string | undefined): string => (value === undefined ? 'none' : `"${value}"`);

const must = (file: string, what: string, expected: string, found: string | undefined): string[] =>
  found === expected ? [] : [`${file}: ${what} must be "${expected}", found ${shown(found)}`];

/** The field of a JSON-LD node, when it is an object (not an array) that has one. */
const valueOf = (node: unknown, key: string): unknown =>
  typeof node !== 'object' || node === null || Array.isArray(node)
    ? undefined
    : Reflect.get(node, key);

/** The string field of a JSON-LD node, when it is an object that has one. */
const fieldOf = (node: unknown, key: string): string | undefined => {
  const value = valueOf(node, key);
  return typeof value === 'string' ? value : undefined;
};

/** The nodes of a JSON-LD document: those of its `@graph`, or the document itself. */
const nodesOf = (document: unknown): readonly unknown[] => {
  const graph = valueOf(document, '@graph');
  return Array.isArray(graph) ? graph : [document];
};

const ends = (file: string, end: string, expected: string, found: string | undefined): string[] =>
  found === expected
    ? []
    : [`${file}: the BreadcrumbList must ${end} at "${expected}", found ${shown(found)}`];

const breadcrumbProblems = (file: string, nodes: readonly unknown[], home: string, url: string) => {
  const list = nodes.find((node) => fieldOf(node, '@type') === 'BreadcrumbList');
  if (list === undefined) return [`${file}: the JSON-LD needs a BreadcrumbList`];
  const raw = valueOf(list, 'itemListElement');
  const items: readonly unknown[] = Array.isArray(raw) ? raw : [];
  const positions = items.map((item) => String(valueOf(item, 'position')));
  const numbered = positions.every((position, index) => position === String(index + 1));
  return [
    ...(numbered && items.length > 0
      ? []
      : [
          `${file}: the BreadcrumbList must be numbered 1 to ${String(items.length)}, found ${positions.join(', ') || 'none'}`,
        ]),
    ...ends(file, 'start', home, fieldOf(items[0], 'item')),
    ...ends(file, 'end', url, fieldOf(items.at(-1), 'item')),
  ];
};

const jsonLdProblems = (
  file: string,
  root: HTMLElement,
  rules: SeoRules,
  schema: string,
  url: string,
): string[] => {
  const blocks = root.querySelectorAll('script[type="application/ld+json"]');
  if (blocks.length !== 1)
    return [`${file}: expected one JSON-LD block, found ${String(blocks.length)}`];
  let document: unknown;
  try {
    document = JSON.parse(blocks.map(({ text }) => text).join(''));
  } catch {
    return [`${file}: the JSON-LD block is not valid JSON`];
  }
  const nodes = nodesOf(document);
  const [main] = nodes;
  const types = new Set(nodes.map((node) => fieldOf(node, '@type')));
  const home = rules.breadcrumbHomeOf?.(new URL(url).pathname);
  return [
    ...must(file, 'the JSON-LD @type', schema, fieldOf(main, '@type')),
    ...must(file, 'the JSON-LD url', url, fieldOf(main, 'url')),
    ...(home === undefined
      ? []
      : breadcrumbProblems(file, nodes, new URL(home, rules.origin).href, url)),
    ...REFUSED.filter((type) => types.has(type)).map(
      (type) => `${file}: the JSON-LD must not hold a ${type} node`,
    ),
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
    ...jsonLdProblems(file, root, rules, types.schema, canonical),
  ];
};

/**
 * Every built page (`file` to HTML) that is indexable (no `noindex`) needs one canonical, the
 * Open Graph tags of its link preview (`og:url` at the canonical, the one absolute image) with a
 * large Twitter card, and exactly one JSON-LD block of its schema.org type at the canonical.
 */
export const seoProblems = (pages: ReadonlyMap<string, string>, rules: SeoRules): string[] =>
  [...pages].flatMap(([file, html]) => pageProblems(file, html, rules));

/** What the head of every indexable page and the sitemap must agree on. */
export interface HeadRules {
  /** The hreflang of each language, the first also the x-default: `['en-US', 'es-US']`. */
  readonly languages: readonly string[];
  /** The longest title a result shows whole, in characters. */
  readonly title: { readonly max: number };
  /** The description a result shows: long enough to answer, short enough not to be cut. */
  readonly description: { readonly min: number; readonly max: number };
  /** The text of `sitemap.xml`. */
  readonly sitemap: string;
}

/** What the head of one indexable page says about itself. */
interface Head {
  readonly file: string;
  readonly lang: string;
  readonly title: string;
  readonly description: string;
  readonly canonical: string | undefined;
  /** Every alternate link, as hreflang and address, in order. */
  readonly alternates: readonly (readonly [string, string])[];
}

const headOf = (file: string, html: string): Head | undefined => {
  const root = parse(html);
  const content = (selector: string): string | undefined =>
    root.querySelector(selector)?.getAttribute('content');
  if (content('meta[name="robots"]')?.includes('noindex') === true) return undefined;
  return {
    file,
    lang: root.querySelector('html')?.getAttribute('lang') ?? '',
    title: root.querySelector('title')?.text ?? '',
    description: content('meta[name="description"]') ?? '',
    canonical: root.querySelector('link[rel="canonical"]')?.getAttribute('href'),
    alternates: root
      .querySelectorAll('link[rel="alternate"]')
      .map(
        (link) => [link.getAttribute('hreflang') ?? '', link.getAttribute('href') ?? ''] as const,
      ),
  };
};

/** The alternates as one comparable key, in the order of the languages and x-default. */
const pairKey = (alternates: readonly (readonly [string, string])[]): string =>
  [...alternates]
    .map(([hreflang, href]) => `${hreflang}=${href}`)
    .sort()
    .join(' ');

const textProblems = (heads: readonly Head[], rules: HeadRules): string[] => {
  const { title, description } = rules;
  const lengths = heads.flatMap((head) => [
    ...(head.title === ''
      ? [`${head.file}: no title`]
      : head.title.length > title.max
        ? [
            `${head.file}: the title is ${String(head.title.length)} characters, more than ${String(title.max)}`,
          ]
        : []),
    ...(head.description.length < description.min || head.description.length > description.max
      ? [
          `${head.file}: the description is ${String(head.description.length)} characters, outside ${String(description.min)} to ${String(description.max)}`,
        ]
      : []),
  ]);
  const shared = (key: 'title' | 'description'): string[] => {
    const files = new Map<string, string[]>();
    for (const head of heads) files.set(head[key], [...(files.get(head[key]) ?? []), head.file]);
    return [...files]
      .filter(([text, owners]) => text !== '' && owners.length > 1)
      .map(([text, owners]) => `${owners.join(', ')}: share the ${key} "${text}"`);
  };
  return [...lengths, ...shared('title'), ...shared('description')];
};

const alternateProblems = (head: Head, byUrl: ReadonlyMap<string, Head>, rules: HeadRules) => {
  const { file, canonical, alternates } = head;
  const [first = ''] = rules.languages;
  const hrefOf = (hreflang: string): string | undefined =>
    alternates.find(([candidate]) => candidate === hreflang)?.[1];
  const counts = [...rules.languages, 'x-default'].flatMap((hreflang) => {
    const found = alternates.filter(([candidate]) => candidate === hreflang).length;
    return found === 1 ? [] : [`${file}: needs one ${hreflang} alternate, found ${String(found)}`];
  });
  const own = alternates.find(([hreflang, href]) => hreflang !== 'x-default' && href === canonical);
  const language = own?.[0].split('-')[0];
  return [
    ...counts,
    ...(hrefOf('x-default') === hrefOf(first)
      ? []
      : [
          `${file}: x-default must be the ${first} alternate ${shown(hrefOf(first))}, found ${shown(hrefOf('x-default'))}`,
        ]),
    ...(own === undefined
      ? [`${file}: the canonical ${shown(canonical)} is none of its alternates`]
      : language === head.lang
        ? []
        : [
            `${file}: <html lang> is ${shown(head.lang)}, and its canonical is the ${own[0]} alternate`,
          ]),
    ...rules.languages.flatMap((hreflang) => {
      const href = hrefOf(hreflang);
      if (href === undefined || href === canonical) return [];
      const other = byUrl.get(href);
      if (other === undefined)
        return [
          `${file}: its ${hreflang} alternate "${href}" is not an indexable page of the build`,
        ];
      return pairKey(other.alternates) === pairKey(alternates)
        ? []
        : [`${file}: its ${hreflang} alternate "${href}" does not name the same alternates back`];
    }),
  ];
};

const sitemapProblems = (heads: readonly Head[], byUrl: ReadonlyMap<string, Head>, xml: string) => {
  const entries = new Map(
    [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(([, block = '']) => {
      const loc = /<loc>([^<]+)<\/loc>/.exec(block)?.[1] ?? '';
      const alternates = [
        ...block.matchAll(/<xhtml:link rel="alternate" hreflang="([^"]+)" href="([^"]+)"\/>/g),
      ].map(([, hreflang = '', href = '']) => [hreflang, href] as const);
      return [loc, alternates] as const;
    }),
  );
  return [
    ...heads
      .filter(({ canonical }) => canonical === undefined || !entries.has(canonical))
      .map(({ file, canonical }) => `${file}: ${shown(canonical)} is not in the sitemap`),
    ...[...entries].flatMap(([loc, alternates]) => {
      const head = byUrl.get(loc);
      if (head === undefined)
        return [`sitemap.xml: "${loc}" is not an indexable page of the build`];
      return pairKey(head.alternates) === pairKey(alternates)
        ? []
        : [`sitemap.xml: the alternates of "${loc}" are not those of its page`];
    }),
  ];
};

/**
 * What breaks the head of the indexable pages (no `noindex`) as a site: a missing title, one too
 * long or a description outside its range; a title or description another page has too; an
 * `<html lang>` that is not the language of the canonical; alternates that do not hold each
 * language and x-default once (x-default at the first language), that miss the canonical, or
 * that lead to a page that does not name the same alternates back; and a sitemap that does not
 * list exactly these pages, each with the alternates of its page.
 */
export const headProblems = (pages: ReadonlyMap<string, string>, rules: HeadRules): string[] => {
  const heads = [...pages].flatMap(([file, html]) => headOf(file, html) ?? []);
  const byUrl = new Map(
    heads.flatMap((head) => (head.canonical === undefined ? [] : [[head.canonical, head]])),
  );
  return [
    ...textProblems(heads, rules),
    ...heads.flatMap((head) => alternateProblems(head, byUrl, rules)),
    ...sitemapProblems(heads, byUrl, rules.sitemap),
  ];
};

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
