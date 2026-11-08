import { parse, type HTMLElement } from 'node-html-parser';

/*
 * The content audit of a built site (AdSense audit 2026-11-08, `plans/growth/adsense-quality-checklist.md`):
 * the words of each page's main content, how many of them no other page of its language shares,
 * how much of it is template, whether it shows a worked example, sources and an FAQ, its internal
 * links in and out, whether it is in the sitemap, and the same-language pairs that read almost
 * the same. It reads the HTML only, so any site of the repository can run it on its own dist.
 */

/** A built HTML file: its path inside the dist, `concrete/10x10-slab.html`, and its markup. */
export interface AuditFile {
  readonly path: string;
  readonly html: string;
}

export interface AuditOptions {
  /** The sitemap XML; a page whose path none of its `<loc>` names is reported out of it. */
  readonly sitemap?: string;
  /** Words per shingle, the unit of shared text (default 6). */
  readonly shingle?: number;
  /** A page with fewer unique words is thin (default 120). */
  readonly thinBelow?: number;
  /** Two pages of one language whose shingles overlap this much are near-duplicates (default 0.5). */
  readonly duplicateAt?: number;
  /** What inside `<main>` is chrome, not content (default `CHROME`). */
  readonly chrome?: string;
  /**
   * Reads the site as it will be once open: a page the sitemap lists is indexable whatever its
   * robots meta says (a closed site carries `noindex` on every page); the rest keep their flag.
   */
  readonly asOpen?: boolean;
}

/** The chrome inside a main element that the audit leaves out: navigation, forms and bylines. */
export const CHROME =
  'nav, form, svg, script, style, template, [aria-label="Breadcrumb"], .calc-breadcrumb, .byline, .guide-cta';

const WORKED = /worked example|how the figures|ejemplo resuelto|cómo se calcula/i;
const FAQ = /frequently asked|^faq$|preguntas frecuentes/i;
const SOURCES = /sources|fuentes/i;

/** The path a built file is served at: `index.html` is `/`, `es/index.html` and `es.html` `/es`. */
export const urlOfFile = (path: string): string => {
  const bare = path.replace(/\.html$/, '').replace(/(^|\/)index$/, '');
  return `/${bare}`.replace(/\/$/, '') || '/';
};

export interface MainText {
  /** The primary language subtag of `<html lang>`: `en`, `es`. */
  readonly lang: string;
  readonly noindex: boolean;
  /** The words of the main content, lower case, in reading order. */
  readonly words: readonly string[];
  /** The h2 and h3 headings of the main content, in order, with their level. */
  readonly headings: readonly { readonly level: 2 | 3; readonly text: string }[];
  /** The internal paths the main content links to, without query or fragment, once each. */
  readonly linksOut: readonly string[];
  readonly externalLinks: number;
  /** Whether the main content links to a sources section of its own site. */
  readonly linksSources: boolean;
}

const WORD = /[\p{L}\p{N}][\p{L}\p{N}'’.,/×-]*/gu;

const wordsOf = (text: string): string[] =>
  [...text.matchAll(WORD)].map(([word]) => word.replace(/[.,]+$/, '').toLowerCase());

/** The main content of a page as the audit reads it: `chrome` left out, nothing outside `<main>`. */
export const mainTextOf = (html: string, chrome: string = CHROME): MainText => {
  const document = parse(html, { comment: false });
  const lang = (document.querySelector('html')?.getAttribute('lang') ?? '').replace(/-.*/, '');
  const robots = document.querySelector('meta[name="robots"]')?.getAttribute('content') ?? '';
  const main: HTMLElement | null = document.querySelector('main');
  if (main === null) {
    return {
      lang,
      noindex: robots.includes('noindex'),
      words: [],
      headings: [],
      linksOut: [],
      externalLinks: 0,
      linksSources: false,
    };
  }
  // a byline that points at the sources counts, though its words are chrome
  const linksSources = main
    .querySelectorAll('a')
    .some((a) => /#(sources|fuentes)$/.test(a.getAttribute('href') ?? ''));
  for (const node of main.querySelectorAll(chrome)) node.remove();
  const hrefs = main.querySelectorAll('a').map((a) => a.getAttribute('href') ?? '');
  const internal = hrefs.filter((href) => href.startsWith('/') && !href.startsWith('//'));
  return {
    lang,
    noindex: robots.includes('noindex'),
    words: wordsOf(main.structuredText),
    headings: main.querySelectorAll('h2, h3').map((heading) => ({
      level: heading.tagName === 'H2' ? 2 : 3,
      text: heading.text.trim(),
    })),
    linksOut: [...new Set(internal.map((href) => href.replace(/[?#].*$/, '')))],
    externalLinks: hrefs.filter((href) => /^https?:\/\//.test(href)).length,
    linksSources,
  };
};

export interface PageMetrics {
  readonly url: string;
  readonly lang: string;
  readonly noindex: boolean;
  readonly inSitemap: boolean;
  readonly words: number;
  /** The words of the page's shingles that no other indexable page of its language has. */
  readonly uniqueWords: number;
  /** The share of its shingles found on three or more pages of its language, 0 to 100. */
  readonly templatePercent: number;
  readonly worked: boolean;
  readonly sources: boolean;
  /** The h3 questions under an FAQ heading. */
  readonly faq: number;
  readonly linksOut: number;
  readonly linksIn: number;
}

export interface AuditReport {
  /** Every page: the indexable ones from thinnest to richest, then the noindex ones. */
  readonly pages: readonly PageMetrics[];
  readonly nearDuplicates: readonly {
    readonly similarity: number;
    readonly a: string;
    readonly b: string;
  }[];
  readonly indexable: number;
  readonly thin: number;
  readonly thinBelow: number;
}

const faqOf = (headings: MainText['headings']): number => {
  let inFaq = false;
  let count = 0;
  for (const { level, text } of headings) {
    if (level === 2) inFaq = FAQ.test(text);
    else if (inFaq) count += 1;
  }
  return count;
};

const shinglesOf = (words: readonly string[], size: number): Set<string> => {
  const shingles = new Set<string>();
  for (let index = 0; index + size <= words.length; index += 1) {
    shingles.add(words.slice(index, index + size).join(' '));
  }
  return shingles;
};

const pathsOf = (sitemap: string | undefined): Set<string> =>
  new Set(
    [...(sitemap ?? '').matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => {
      const path = String(match[1]).replace(/^https?:\/\/[^/]+/, '');
      return path === '' ? '/' : path.replace(/(.)\/$/, '$1');
    }),
  );

/** Audits the content of a built site. */
export const auditSite = (files: readonly AuditFile[], options: AuditOptions = {}): AuditReport => {
  const { shingle = 6, thinBelow = 120, duplicateAt = 0.5, chrome = CHROME } = options;
  const inSitemap = pathsOf(options.sitemap);
  const pages = files.map((file) => {
    const url = urlOfFile(file.path);
    const read = mainTextOf(file.html, chrome);
    const text = options.asOpen === true && inSitemap.has(url) ? { ...read, noindex: false } : read;
    return { url, text, shingles: shinglesOf(text.words, shingle) };
  });
  const linksIn = new Map<string, number>();
  for (const { url, text } of pages) {
    for (const link of text.linksOut) {
      if (link !== url) linksIn.set(link, (linksIn.get(link) ?? 0) + 1);
    }
  }
  // shared text is counted among the indexable pages of one language, keyed by language and shingle
  const counts = new Map<string, number>();
  const indexable = pages.filter(({ text }) => !text.noindex);
  for (const { text, shingles } of indexable) {
    for (const each of shingles) {
      const key = `${text.lang} ${each}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  const metrics = pages.map(({ url, text, shingles }): PageMetrics => {
    // a shingle of an indexable page was counted, so every count read here is at least 1
    const share = (least: number, most: number) =>
      [...shingles].filter((each) => {
        const seen = Number(counts.get(`${text.lang} ${each}`));
        return seen >= least && seen <= most;
      }).length / Math.max(shingles.size, 1);
    const words = text.words.length;
    return {
      url,
      lang: text.lang,
      noindex: text.noindex,
      inSitemap: inSitemap.has(url),
      words,
      uniqueWords: text.noindex ? 0 : Math.round(words * share(1, 1)),
      templatePercent: text.noindex ? 0 : Math.round(100 * share(3, Infinity)),
      worked: text.headings.some(({ text: heading }) => WORKED.test(heading)),
      sources:
        text.externalLinks > 0 ||
        text.linksSources ||
        text.headings.some(({ text: heading }) => SOURCES.test(heading)),
      faq: faqOf(text.headings),
      linksOut: text.linksOut.length,
      linksIn: linksIn.get(url) ?? 0,
    };
  });
  const nearDuplicates: { similarity: number; a: string; b: string }[] = [];
  for (const [index, first] of indexable.entries()) {
    for (const second of indexable.slice(index + 1)) {
      if (first.text.lang !== second.text.lang) continue;
      // an empty page shares nothing: Math.max keeps two of them from dividing by zero
      const together = Math.max(new Set([...first.shingles, ...second.shingles]).size, 1);
      const both = [...first.shingles].filter((each) => second.shingles.has(each)).length;
      const similarity = Math.round((100 * both) / together) / 100;
      if (similarity >= duplicateAt)
        nearDuplicates.push({ similarity, a: first.url, b: second.url });
    }
  }
  const ranked = metrics
    .filter(({ noindex }) => !noindex)
    .toSorted((x, y) => x.uniqueWords - y.uniqueWords || x.url.localeCompare(y.url));
  return {
    pages: [...ranked, ...metrics.filter(({ noindex }) => noindex)],
    nearDuplicates: nearDuplicates.toSorted((x, y) => y.similarity - x.similarity),
    indexable: ranked.length,
    thin: ranked.filter(({ uniqueWords }) => uniqueWords < thinBelow).length,
    thinBelow,
  };
};

const yes = (value: boolean): string => (value ? 'yes' : '-');

/** The report as text: the totals, the `limit` thinnest pages and the closest pairs. */
export const reportText = (report: AuditReport, limit = 30): string => {
  const outOfSitemap = report.pages.filter(({ noindex, inSitemap }) => !noindex && !inSitemap);
  const orphans = report.pages.filter(({ noindex, linksIn }) => !noindex && linksIn === 0);
  const lines = [
    `indexable pages: ${String(report.indexable)}`,
    `thin (under ${String(report.thinBelow)} unique words): ${String(report.thin)}`,
    `near-duplicate pairs (same language): ${String(report.nearDuplicates.length)}`,
    `indexable pages missing from the sitemap: ${outOfSitemap.map(({ url }) => url).join(', ') || 'none'}`,
    `indexable pages no main content links to: ${orphans.map(({ url }) => url).join(', ') || 'none'}`,
    '',
    `thinnest ${String(Math.min(limit, report.indexable))} (words, unique, template %, worked, sources, faq, out, in):`,
    ...report.pages
      .filter(({ noindex }) => !noindex)
      .slice(0, limit)
      .map(
        (page) =>
          `  ${page.url}  ${String(page.words)}  ${String(page.uniqueWords)}  ${String(page.templatePercent)}%  ${yes(page.worked)}  ${yes(page.sources)}  ${String(page.faq)}  ${String(page.linksOut)}  ${String(page.linksIn)}`,
      ),
    '',
    'closest pairs:',
    ...report.nearDuplicates
      .slice(0, limit)
      .map(({ similarity, a, b }) => `  ${similarity.toFixed(2)}  ${a}  ${b}`),
  ];
  return lines.join('\n');
};
