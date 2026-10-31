import type { Locale } from '@maestro-calc/i18n';
import { parse } from 'node-html-parser';
import { OTHER_LOCALE } from '../routing/embed.ts';
import { LOCALES, pathOf, urlOf } from '../routing/routes.ts';
import { ANALYTICS_SRC } from './assets.ts';
import { LIMITS } from './budgets.ts';
import { fileOf } from './files.ts';
import { problem } from './types.ts';
import type { CheckContext, Problem, Site } from './types.ts';

/*
 * The embed pages (embed): one per calculator page and language at `/embed` + the page's path.
 * They are not routes, so the routed-page rules skip them; these rules check what makes an embed
 * safe to frame and invisible to search.
 */

export interface EmbedFile {
  readonly file: string;
  readonly id: string;
  readonly locale: Locale;
  /** The full page: the canonical. */
  readonly page: string;
  /** The other language's embed: the language switch. */
  readonly other: string;
}

const embedPath = (id: string, locale: Locale, site: Site): string =>
  `/embed${pathOf(id, locale, site.routes)}`;

/** Every embed the build must hold, derived from the calculator pages of the table. */
export const embedFilesOf = (site: Site): EmbedFile[] =>
  site.calculatorPages.flatMap((id) =>
    LOCALES.map((locale) => ({
      file: fileOf(embedPath(id, locale, site)),
      id,
      locale,
      page: pathOf(id, locale, site.routes),
      other: embedPath(id, OTHER_LOCALE[locale], site),
    })),
  );

const moduleScriptsOf = (html: string): string[] =>
  parse(html)
    .querySelectorAll('script[type=module]')
    .map((script) => script.getAttribute('src') ?? '');

const bytesOf = (text: string): number => new TextEncoder().encode(text).length;

const problemsOf = (embed: EmbedFile, html: string, fullPage: string | undefined): string[] => {
  const root = parse(html);
  const canonical = urlOf(embed.page);
  const scripts = moduleScriptsOf(html);
  const expected = fullPage === undefined ? [] : moduleScriptsOf(fullPage);
  const switches = root.querySelectorAll('header a[hreflang]');
  const size = bytesOf(html);
  return [
    ...(root.querySelector('link[rel=canonical]')?.getAttribute('href') === canonical
      ? []
      : [`the canonical must be ${canonical}`]),
    ...(root.querySelector('meta[name=robots]')?.getAttribute('content') === 'noindex'
      ? []
      : ['it must be noindex']),
    ...(root.querySelectorAll('link[rel=alternate][hreflang], script[type="application/ld+json"]')
      .length === 0
      ? []
      : ['it must have no hreflang alternate and no JSON-LD']),
    ...(root.querySelectorAll('base[target=_blank]').length === 1
      ? []
      : ['it must open its links in a new tab (<base target="_blank">)']),
    ...(root.querySelectorAll('h1').length === 1 ? [] : ['it must have exactly one h1']),
    ...(scripts.length > 0 && scripts.join(' ') === expected.join(' ')
      ? []
      : [`its module scripts must be the full page's: ${expected.join(' ')}`]),
    ...(root.querySelector(`script[src="${ANALYTICS_SRC}"]`) === null
      ? []
      : ['it must load no analytics']),
    ...(switches.length === 1 &&
    switches[0]?.getAttribute('target') === '_self' &&
    switches[0].getAttribute('href') === embed.other
      ? []
      : [`its language switch must stay in the frame and lead to ${embed.other}`]),
    ...(size <= LIMITS.html ? [] : [`${String(size)} B of HTML is over ${String(LIMITS.html)} B`]),
  ];
};

/** The embed rules over every built embed; a missing one is the file set's concern. */
export const embedProblems = ({ dist, site }: CheckContext): Problem[] =>
  embedFilesOf(site).flatMap((embed) => {
    const html = dist.get(embed.file);
    if (html === undefined) return [];
    return problemsOf(embed, html, dist.get(fileOf(embed.page))).map((message) =>
      problem(embed.file, 'embed', message),
    );
  });
