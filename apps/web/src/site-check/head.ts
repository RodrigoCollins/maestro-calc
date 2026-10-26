import { alternatesOf, LOCALE_TAGS } from '../routing/routes.ts';
import { alternatesIn, attrsOf } from './dom.ts';
import { urlOfPage } from './files.ts';
import { problem } from './types.ts';
import type { CheckContext, Page, Problem, Site } from './types.ts';

const VIEWPORT = 'width=device-width, initial-scale=1';
const TITLE_LENGTH = { min: 10, max: 60 } as const;
const DESCRIPTION_LENGTH = { min: 70, max: 160 } as const;
const TITLE_SUFFIX = ' | Maestro Calc';

const rangeOf = ({ min, max }: { min: number; max: number }): string =>
  `${String(min)} to ${String(max)}`;

const within = (text: string, { min, max }: { min: number; max: number }): boolean =>
  text.length >= min && text.length <= max;

const languageProblems = (page: Page): Problem[] => {
  const lang = page.root.querySelector('html')?.getAttribute('lang');
  const charsets = attrsOf(page.root, 'meta[charset]', 'charset');
  const viewports = attrsOf(page.root, 'meta[name=viewport]', 'content');
  return [
    ...(lang === LOCALE_TAGS[page.locale]
      ? []
      : [
          problem(
            page.file,
            'lang',
            `html lang is "${String(lang)}", expected ${LOCALE_TAGS[page.locale]}`,
          ),
        ]),
    ...(charsets.length === 1 && charsets[0]?.toLowerCase() === 'utf-8'
      ? []
      : [problem(page.file, 'charset', 'expected exactly one meta charset utf-8')]),
    ...(viewports.length === 1 && viewports[0] === VIEWPORT
      ? []
      : [problem(page.file, 'viewport', `expected exactly one viewport "${VIEWPORT}"`)]),
  ];
};

/** What the catalog holds for a page's `title` or `description`, or a problem naming the key. */
const catalogProblems = (
  page: Page,
  site: Site,
  field: 'title' | 'description',
  built: string,
): Problem[] => {
  const key = `page.${page.id}.${field}`;
  const expected = site.catalogs[page.locale][key];
  if (expected === undefined) {
    return [
      problem(page.file, `${field}-catalog`, `${key} is missing from the ${page.locale} catalog`),
    ];
  }
  return built === expected
    ? []
    : [problem(page.file, `${field}-catalog`, `${field} "${built}" is not ${key} "${expected}"`)];
};

const titleProblems = (page: Page, site: Site): Problem[] => {
  const titles = page.root.querySelectorAll('title');
  const [first] = titles;
  if (titles.length !== 1 || first === undefined) {
    return [
      problem(page.file, 'title', `expected exactly one title, found ${String(titles.length)}`),
    ];
  }
  const text = first.text;
  return [
    ...(within(text, TITLE_LENGTH)
      ? []
      : [
          problem(page.file, 'title', `title "${text}" is not ${rangeOf(TITLE_LENGTH)} characters`),
        ]),
    ...(page.id === 'home' || text.endsWith(TITLE_SUFFIX)
      ? []
      : [problem(page.file, 'title', `title "${text}" does not end with "${TITLE_SUFFIX}"`)]),
    ...catalogProblems(page, site, 'title', text),
  ];
};

const descriptionProblems = (page: Page, site: Site): Problem[] => {
  const descriptions = attrsOf(page.root, 'meta[name=description]', 'content');
  const [text] = descriptions;
  if (descriptions.length !== 1 || text === undefined) {
    return [
      problem(
        page.file,
        'description',
        `expected exactly one description, found ${String(descriptions.length)}`,
      ),
    ];
  }
  return [
    ...(within(text, DESCRIPTION_LENGTH)
      ? []
      : [
          problem(
            page.file,
            'description',
            `description is ${String(text.length)} characters, expected ${rangeOf(DESCRIPTION_LENGTH)}`,
          ),
        ]),
    ...catalogProblems(page, site, 'description', text),
  ];
};

/** A value that two pages share is reported against the later page, naming the earlier one. */
const uniqueProblems = (
  pages: readonly Page[],
  rule: string,
  label: string,
  valueOf: (page: Page) => string | undefined,
): Problem[] => {
  const owners = new Map<string, string>();
  return pages.flatMap((page) => {
    const value = valueOf(page);
    if (value === undefined) return [];
    const owner = owners.get(value);
    if (owner === undefined) {
      owners.set(value, page.file);
      return [];
    }
    return [problem(page.file, rule, `${label} is also the ${label} of ${owner}`)];
  });
};

const indexingProblems = (page: Page, site: Site): Problem[] => {
  const robots = attrsOf(page.root, 'meta[name=robots]', 'content').join(',').toLowerCase();
  const canonicals = attrsOf(page.root, 'link[rel=canonical]', 'href');
  const alternates = alternatesIn(page.root);
  if (!page.routable) {
    return [
      ...(robots.includes('noindex')
        ? []
        : [problem(page.file, 'noindex', 'a not-found page must carry noindex')]),
      ...(canonicals.length === 0
        ? []
        : [problem(page.file, 'canonical', 'a not-found page must have no canonical')]),
      ...(alternates.length === 0
        ? []
        : [problem(page.file, 'hreflang', 'a not-found page must have no hreflang')]),
    ];
  }
  const self = urlOfPage(page, site);
  const expected = alternatesOf(page.id, site.routes)
    .map(({ hreflang, href }) => `${hreflang} ${href}`)
    .sort();
  return [
    ...(robots.includes('noindex')
      ? [problem(page.file, 'noindex', 'a routable page must not carry noindex')]
      : []),
    ...(canonicals.length === 1 && canonicals[0] === self
      ? []
      : [problem(page.file, 'canonical', `expected exactly one canonical ${self}`)]),
    ...(alternates.join('\n') === expected.join('\n')
      ? []
      : [
          problem(
            page.file,
            'hreflang',
            `alternates differ from the route table: expected ${expected.join(', ')}`,
          ),
        ]),
  ];
};

/** Every alternate must be a page of the build that lists this page back (site-routing-i18n › [SR10]). */
const reciprocityProblems = (pages: readonly Page[], site: Site): Problem[] => {
  const routable = pages.filter((page) => page.routable);
  const byUrl = new Map(routable.map((page) => [urlOfPage(page, site), page]));
  return routable.flatMap((page) =>
    attrsOf(page.root, 'link[rel=alternate][hreflang]', 'href').flatMap((href) => {
      const target = byUrl.get(href);
      if (target === undefined) {
        return [problem(page.file, 'reciprocity', `alternate ${href} is not a page of the build`)];
      }
      return alternatesIn(target.root).some((entry) => entry.endsWith(` ${urlOfPage(page, site)}`))
        ? []
        : [
            problem(
              page.file,
              'reciprocity',
              `alternate ${target.file} does not list ${page.file} back`,
            ),
          ];
    }),
  );
};

/** Head rules of site-seo and site-routing-i18n over the parsed pages. */
export const headProblems = ({ pages, site }: CheckContext): Problem[] => [
  ...pages.flatMap((page) => [
    ...languageProblems(page),
    ...titleProblems(page, site),
    ...descriptionProblems(page, site),
    ...indexingProblems(page, site),
  ]),
  ...uniqueProblems(
    pages,
    'title-unique',
    'title',
    (page) => page.root.querySelector('title')?.text,
  ),
  ...uniqueProblems(
    pages.filter((page) => page.routable),
    'description-unique',
    'description',
    (page) => attrsOf(page.root, 'meta[name=description]', 'content')[0],
  ),
  ...reciprocityProblems(pages, site),
];
