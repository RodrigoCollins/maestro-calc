import { FAQ_SECTION_IDS } from '../content/faq-shape.ts';
import { FOOTER_PAGES, HEADER_PAGES, linksFor } from '../routing/links.ts';
import { pathOf } from '../routing/routes.ts';
import { switchFor } from '../routing/switch.ts';
import { attr, attrsOf } from './dom.ts';
import { isCalculatorPage, problem } from './types.ts';
import type { CheckContext, Dist, Page, Problem, Site } from './types.ts';

const FIRST_FOCUSABLE = 'a[href], button, input, select, textarea, [tabindex]';
const FAVICON_PATH = '/favicon.svg';

const landmarkProblems = (page: Page): Problem[] => {
  const count = (selector: string): number => page.root.querySelectorAll(selector).length;
  const labels = attrsOf(page.root, 'nav[aria-label]', 'aria-label').filter(
    (label) => label.trim() !== '',
  );
  const wrong = [
    ...(count('header') === 1 ? [] : ['one header']),
    ...(count('nav') === 1 && labels.length === 1 ? [] : ['one nav with a non-empty aria-label']),
    ...(count('main#main') === 1 ? [] : ['one main#main']),
    ...(count('footer') === 1 ? [] : ['one footer']),
  ];
  return wrong.map((what) => problem(page.file, 'landmarks', `expected ${what}`));
};

const h1Problems = (page: Page): Problem[] => {
  const all = page.root.querySelectorAll('h1');
  const inMain = page.root.querySelectorAll('main h1');
  if (all.length !== 1)
    return [problem(page.file, 'h1', `expected exactly one h1, found ${String(all.length)}`)];
  if (inMain.length !== 1) return [problem(page.file, 'h1', 'the h1 must be inside main')];
  return inMain.map((heading) => heading.text.trim()).join('') === ''
    ? [problem(page.file, 'h1', 'the h1 is empty')]
    : [];
};

/** A heading may be at most one level deeper than the one before it. */
const headingOrderProblems = (page: Page): Problem[] => {
  const levels = page.root
    .querySelectorAll('h1, h2, h3, h4, h5, h6')
    .map((heading) => Number(heading.tagName.slice(1)));
  const before = (index: number): number => (index === 0 ? 0 : Number(levels[index - 1]));
  return levels.flatMap((level, index) =>
    level - before(index) > 1
      ? [problem(page.file, 'heading-order', `h${String(level)} follows h${String(before(index))}`)]
      : [],
  );
};

/** The h2 ids of a calculator page: the result heading, then the five sections (calculator-page › [CP5]). */
const RESULT_ID = 'calc-result-heading';
const SECTION_IDS = {
  en: ['how-to-use', 'formulas', 'tips', 'faq', 'sources'],
  es: ['como-usar', 'formulas', 'consejos', 'preguntas-frecuentes', 'fuentes'],
} as const;

const breadcrumbProblems = (page: Page): Problem[] => {
  const first = page.root.querySelector('main ol[aria-label], main h1');
  return first?.tagName === 'OL' && attr(first, 'aria-label').trim() !== ''
    ? []
    : [problem(page.file, 'breadcrumb', 'a calculator page needs a labelled ol before the h1')];
};

const sectionProblems = (page: Page): Problem[] => {
  const ids = attrsOf(page.root, 'main h2', 'id');
  const expected = [RESULT_ID, ...SECTION_IDS[page.locale]];
  return ids.join(' ') === expected.join(' ')
    ? []
    : [
        problem(
          page.file,
          'sections',
          `the h2 ids are "${ids.join(' ')}", expected "${expected.join(' ')}"`,
        ),
      ];
};

/** FAQ questions are h3 under the FAQ h2: an h3 anywhere else is a heading out of place (site-seo › [SE18]). */
const faqHeadingProblems = (page: Page): Problem[] => {
  let section = '';
  return page.root.querySelectorAll('main h2, main h3').flatMap((heading) => {
    if (heading.tagName === 'H2') {
      section = attr(heading, 'id');
      return [];
    }
    return (FAQ_SECTION_IDS as readonly string[]).includes(section)
      ? []
      : [
          problem(
            page.file,
            'heading-order',
            `the h3 "${heading.text.trim()}" is outside the FAQ section`,
          ),
        ];
  });
};

const skipLinkProblems = (page: Page): Problem[] =>
  page.root.querySelector(FIRST_FOCUSABLE)?.getAttribute('href') === '#main'
    ? []
    : [problem(page.file, 'skip-link', 'the first focusable element must be the link to #main')];

const linkProblems = (page: Page, pages: readonly Page[], site: Site): Problem[] => {
  const byPath = new Map(
    pages.flatMap((target) =>
      target.routable ? [[pathOf(target.id, target.locale, site.routes), target] as const] : [],
    ),
  );
  const mailto = `mailto:${site.config.contactEmail}`;
  // a calculator page may link the sources of its entry; nothing else leaves the site
  const sources = site.externalLinks[page.id] ?? [];
  const idsOf = (target: Page): Set<string> => new Set(attrsOf(target.root, '[id]', 'id'));
  return page.root.querySelectorAll('a[href]').flatMap((link) => {
    const href = attr(link, 'href');
    if (sources.includes(href)) {
      // an outbound source link leaves without the referrer: the page address can hold a shared state
      return attr(link, 'rel').split(/\s+/).includes('noreferrer')
        ? []
        : [problem(page.file, 'link-rel', `${href} must carry rel="noreferrer"`)];
    }
    if (href === mailto || href === FAVICON_PATH) return [];
    if (href.startsWith('#')) {
      return idsOf(page).has(href.slice(1))
        ? []
        : [problem(page.file, 'fragment', `${href} matches no id on this page`)];
    }
    const [path = '', ...rest] = href.split('#');
    const target = byPath.get(path);
    if (target === undefined) {
      return [problem(page.file, 'link', `${href} is not a path of the route table`)];
    }
    return rest.length === 0 || idsOf(target).has(rest.join('#'))
      ? []
      : [problem(page.file, 'fragment', `${href} matches no id on ${target.file}`)];
  });
};

const navigationProblems = (page: Page, site: Site): Problem[] => {
  const { href: counterpart, lang, hreflang } = switchFor(page.id, page.locale, site.routes);
  const label = site.catalogs[page.locale]['site.switch.label'];
  const same = (actual: readonly string[], expected: readonly string[]): boolean =>
    actual.join('\n') === expected.join('\n');
  const expectedHrefs = (candidates: readonly string[]): string[] =>
    linksFor(candidates, page.locale, site.routes).map(({ href }) => href);
  return [
    ...(same(
      page.root
        .querySelectorAll('header a[hreflang]')
        .map(
          (link) =>
            `${attr(link, 'href')} ${attr(link, 'lang')} ${attr(link, 'hreflang')} ${link.text.trim()}`,
        ),
      [`${counterpart} ${lang} ${hreflang} ${String(label)}`],
    )
      ? []
      : [
          problem(
            page.file,
            'switch',
            `the language switch must be the single link to ${counterpart} (lang ${lang}, hreflang ${hreflang}, text "${String(label)}")`,
          ),
        ]),
    ...(same(attrsOf(page.root, 'header li a', 'href'), expectedHrefs(HEADER_PAGES))
      ? []
      : [problem(page.file, 'nav-links', 'header links differ from the route table')]),
    ...(same(attrsOf(page.root, 'footer li a', 'href'), expectedHrefs(FOOTER_PAGES))
      ? []
      : [problem(page.file, 'footer-links', 'footer links differ from the route table')]),
  ];
};

const iconProblems = (page: Page): Problem[] =>
  page.root.querySelector(`link[rel=icon][type="image/svg+xml"][href="${FAVICON_PATH}"]`) === null
    ? [problem(page.file, 'icon', `the head must link ${FAVICON_PATH} as an SVG icon`)]
    : [];

const faviconProblems = (dist: Dist): Problem[] => {
  const svg = dist.get('favicon.svg');
  if (svg === undefined) return [problem('favicon.svg', 'favicon', 'the favicon is missing')];
  const wrong = [
    ...(svg.trimStart().startsWith('<svg') ? [] : ['it is not an SVG']),
    ...(/#0E2240|#F06A1D/i.test(svg) ? [] : ['it holds neither brand colour']),
    ...(svg.includes('linearGradient') ? ['it holds the Astro scaffold gradient'] : []),
  ];
  return wrong.map((what) => problem('favicon.svg', 'favicon', what));
};

/** Landmarks, headings, skip link, links, language switch, navigation and favicon rules. */
export const structureProblems = ({ pages, site, dist }: CheckContext): Problem[] => [
  ...pages.flatMap((page) => [
    ...landmarkProblems(page),
    ...h1Problems(page),
    ...headingOrderProblems(page),
    ...skipLinkProblems(page),
    ...linkProblems(page, pages, site),
    ...navigationProblems(page, site),
    ...iconProblems(page),
    ...(isCalculatorPage(page, site)
      ? [...breadcrumbProblems(page), ...sectionProblems(page), ...faqHeadingProblems(page)]
      : []),
  ]),
  ...faviconProblems(dist),
];
