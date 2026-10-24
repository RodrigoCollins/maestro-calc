import { attrsOf } from './dom.ts';
import { problem } from './types.ts';
import type { Dist, Page, Problem } from './types.ts';

/** `docs/design/direction.md`: the seven palette values every build must carry. */
const PALETTE = ['#0E2240', '#1D4ED8', '#F06A1D', '#56616B', '#EEF1EF', '#FFFFFF', '#1FAF5A'];

const FONT_HOSTS = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'use.typekit.net',
  'cdn.jsdelivr.net',
  'unpkg.com',
];

const WOFF2_COUNT = 4;
const OFF_ORIGIN = /^(?:https?:)?\/\//i;
const ABSOLUTE = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;
const CSS_URL = /url\(\s*["']?([^"')]*)["']?\s*\)/g;

/** The CSS a page carries: its own `<style>` elements and every stylesheet file of `dist`. */
const cssOf = (page: Page, dist: Dist): string =>
  [
    ...page.root.querySelectorAll('style').map((style) => style.text),
    ...[...dist].filter(([file]) => file.endsWith('.css')).map(([, text]) => text),
  ].join('\n');

const urlsIn = (css: string): string[] => Array.from(css.matchAll(CSS_URL), ([, url = '']) => url);

/** `#fff` and `#FFFFFF` are the same colour: compare six upper-case digits. */
const hexColoursIn = (css: string): Set<string> =>
  new Set(
    Array.from(css.matchAll(/#([0-9a-f]{6}|[0-9a-f]{3})\b/gi), ([, digits = '']) =>
      `#${digits.length === 3 ? Array.from(digits, (digit) => digit + digit).join('') : digits}`.toUpperCase(),
    ),
  );

const scriptProblems = (page: Page): Problem[] => [
  ...page.root
    .querySelectorAll('script')
    .filter((script) => script.getAttribute('type') !== 'application/ld+json')
    .map(() => problem(page.file, 'script', 'the only script allowed is JSON-LD data')),
  ...page.root
    .querySelectorAll('*')
    .flatMap((element) => Object.keys(element.attributes))
    .filter((name) => name.toLowerCase().startsWith('on'))
    .map((name) => problem(page.file, 'inline-handler', `event handler attribute ${name}`)),
  ...page.root
    .querySelectorAll('astro-island')
    .map(() => problem(page.file, 'astro-island', 'hydrated islands ship JavaScript')),
  ...page.root
    .querySelectorAll('link[rel~=modulepreload]')
    .map(() => problem(page.file, 'modulepreload', 'a module preload implies a script')),
];

const originProblems = (page: Page, css: string): Problem[] => {
  const references = [
    ...attrsOf(page.root, '[src]', 'src'),
    ...attrsOf(page.root, 'link[rel~=stylesheet], link[rel~=preload], link[rel~=icon]', 'href'),
    ...urlsIn(css),
  ];
  const text = page.html + css;
  return [
    ...references
      .filter((reference) => OFF_ORIGIN.test(reference))
      .map((reference) => problem(page.file, 'third-party', `${reference} is not same-origin`)),
    ...FONT_HOSTS.filter((host) => text.includes(host)).map((host) =>
      problem(page.file, 'font-host', `${host} must not be referenced`),
    ),
  ];
};

const styleProblems = (page: Page, css: string): Problem[] => {
  const colours = hexColoursIn(css);
  return [
    ...PALETTE.filter((colour) => !colours.has(colour)).map((colour) =>
      problem(page.file, 'palette', `the CSS lacks the palette colour ${colour}`),
    ),
    ...(/color-scheme\s*:\s*light/.test(css)
      ? []
      : [problem(page.file, 'color-scheme', 'the CSS must declare color-scheme: light')]),
    ...(css.includes('prefers-color-scheme')
      ? [problem(page.file, 'prefers-color-scheme', 'the site has no dark theme')]
      : []),
  ];
};

const fontFaceProblems = (page: Page, css: string): Problem[] =>
  Array.from(css.matchAll(/@font-face\s*\{([^}]*)\}/g), ([, body = '']) => body).flatMap((body) => [
    ...(/font-display\s*:\s*swap/.test(body)
      ? []
      : [problem(page.file, 'font-display', '@font-face must set font-display: swap')]),
    ...urlsIn(body)
      .filter((url) => ABSOLUTE.test(url))
      .map((url) => problem(page.file, 'font-url', `font url ${url} must be a same-origin path`)),
  ]);

const distProblems = (dist: Dist): Problem[] => {
  const woff2 = [...dist.keys()].filter((file) => file.endsWith('.woff2')).length;
  return [
    ...[...dist.keys()]
      .filter((file) => /\.m?js$/.test(file))
      .map((file) => problem(file, 'js-file', 'dist must hold no JavaScript file')),
    ...(woff2 === WOFF2_COUNT
      ? []
      : [problem('(dist)', 'fonts', `expected exactly four .woff2 files, found ${String(woff2)}`)]),
  ];
};

/** Zero-JavaScript, same-origin, palette and font rules over the built pages and files. */
export const assetProblems = (pages: readonly Page[], dist: Dist): Problem[] => [
  ...pages.flatMap((page) => {
    const css = cssOf(page, dist);
    return [
      ...scriptProblems(page),
      ...originProblems(page, css),
      ...styleProblems(page, css),
      ...fontFaceProblems(page, css),
    ];
  }),
  ...distProblems(dist),
];
