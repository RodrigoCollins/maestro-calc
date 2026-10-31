import { attr, attrsOf, urlsIn } from './dom.ts';
import { graphOf } from './graph.ts';
import { isCalculatorPage, problem } from './types.ts';
import type { HTMLElement } from 'node-html-parser';
import type { CheckContext, Dist, Page, Problem, Site } from './types.ts';

/** `docs/design/direction.md`: the seven palette values every build must carry. */
const PALETTE = ['#0E2240', '#1D4ED8', '#F06A1D', '#56616B', '#EEF1EF', '#FFFFFF', '#1FAF5A'];

const FONT_HOSTS = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'use.typekit.net',
  'cdn.jsdelivr.net',
  'unpkg.com',
];

/** The `file` of a finding about the build as a whole. */
const DIST = '(dist)';
const WOFF2_COUNT = 4;
const OFF_ORIGIN = /^(?:https?:)?\/\//i;
const ABSOLUTE = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;
const SCHEME_DECLARATION = /(?<![\w-])color-scheme\s*:([^;}]*)/g;

/** The CSS a page carries: its own `<style>` elements and every stylesheet file of `dist`. */
const cssOf = (page: Page, dist: Dist): string =>
  [
    ...page.root.querySelectorAll('style').map((style) => style.text),
    ...[...dist].filter(([file]) => file.endsWith('.css')).map(([, text]) => text),
  ].join('\n');

/** The URL of every candidate of a `srcset` value: the first token of each comma-separated item. */
const srcsetUrls = (srcset: string): string[] =>
  srcset
    .split(',')
    .map((candidate) => candidate.trim().replace(/\s.*$/s, ''))
    .filter((url) => url !== '');

/** `#fff` and `#FFFFFF` are the same colour: compare six upper-case digits. */
const hexColoursIn = (css: string): Set<string> =>
  new Set(
    Array.from(css.matchAll(/#([0-9a-f]{6}|[0-9a-f]{3})\b/gi), ([, digits = '']) =>
      `#${digits.length === 3 ? Array.from(digits, (digit) => digit + digit).join('') : digits}`.toUpperCase(),
    ),
  );

/** A same-origin absolute path: `/a/b.js`, not `//host/b.js` and not a URL. */
const isSameOriginPath = (ref: string): boolean => ref.startsWith('/') && !ref.startsWith('//');

/** An entry under `/_astro/`; a `..` segment would climb out of it. */
const isEntryPath = (src: string): boolean =>
  /^\/_astro\/[^?#]+\.js$/.test(src) && !src.split('/').includes('..');

/**
 * Event handlers, islands and module preloads: the rules both templates share. `preloadFault`
 * returns what is wrong with a preload target on this template, or `undefined` when it is allowed.
 */
const sharedScriptProblems = (
  page: Page,
  preloadFault: (href: string) => string | undefined,
): Problem[] => [
  ...page.root
    .querySelectorAll('*')
    .flatMap((element) => Object.keys(element.attributes))
    .filter((name) => name.toLowerCase().startsWith('on'))
    .map((name) => problem(page.file, 'inline-handler', `event handler attribute ${name}`)),
  ...page.root
    .querySelectorAll('astro-island')
    .map(() => problem(page.file, 'astro-island', 'hydrated islands ship JavaScript')),
  ...page.root.querySelectorAll('link[rel~=modulepreload]').flatMap((link) => {
    const fault = preloadFault(attr(link, 'href'));
    return fault === undefined ? [] : [problem(page.file, 'modulepreload', fault)];
  }),
];

/** The analytics tag of the layout (analytics-gtm): the one same-origin classic script any page may carry. */
export const ANALYTICS_SRC = '/analytics.js';

/** The offline worker (site-pwa): served by its fixed name, registered by the calculator pages. */
export const WORKER_SRC = '/sw.js';

const isAnalyticsTag = (script: HTMLElement): boolean =>
  script.getAttribute('src') === ANALYTICS_SRC;

/**
 * At most one analytics tag, and only in its one shape: a deferred classic script with no body,
 * carrying a Tag Manager container id and the production host as data (the file reads them).
 */
const analyticsProblems = (page: Page): Problem[] => {
  const tags = page.root.querySelectorAll('script').filter(isAnalyticsTag);
  return [
    ...(tags.length > 1
      ? [
          problem(
            page.file,
            'analytics',
            `expected at most one analytics tag, found ${String(tags.length)}`,
          ),
        ]
      : []),
    ...tags.flatMap((tag) =>
      tag.getAttribute('type') !== undefined ||
      !tag.hasAttribute('defer') ||
      tag.text.trim() !== '' ||
      !/^GTM-[A-Z0-9]+$/.test(tag.getAttribute('data-gtm') ?? '') ||
      tag.getAttribute('data-host') === undefined
        ? [
            problem(
              page.file,
              'analytics',
              'the analytics tag is a deferred classic script with no body, a data-gtm container id and a data-host',
            ),
          ]
        : [],
    ),
  ];
};

/** The scripts a page carries besides its JSON-LD and the analytics tag. */
const pageScripts = (page: Page): HTMLElement[] =>
  page.root
    .querySelectorAll('script')
    .filter(
      (script) => script.getAttribute('type') !== 'application/ld+json' && !isAnalyticsTag(script),
    );

/** A static page carries data blocks only: besides the analytics tag, the only script allowed is JSON-LD. */
const staticScriptProblems = (page: Page): Problem[] => [
  ...pageScripts(page).map(() =>
    problem(page.file, 'script', 'the only script allowed is JSON-LD data'),
  ),
  ...analyticsProblems(page),
  ...sharedScriptProblems(page, () => 'a module preload implies a script'),
];

/**
 * A calculator page carries JSON-LD, the analytics tag and exactly one external module script from
 * `/_astro/`: no inline script, no second file, no other origin (site-shell › [SS20], [SS22]).
 */
const calculatorScriptProblems = (page: Page): Problem[] => {
  const scripts = pageScripts(page);
  const entries = scripts.filter(
    (script) => script.getAttribute('type') === 'module' && script.hasAttribute('src'),
  );
  const shape = scripts
    .filter((script) => !entries.includes(script))
    .map((script) =>
      problem(
        page.file,
        'script',
        script.hasAttribute('src')
          ? 'only the module entry may be an external script'
          : 'an inline script is not allowed',
      ),
    );
  const [entry] = entries;
  const src = entry?.getAttribute('src') ?? '';
  return [
    ...shape,
    ...analyticsProblems(page),
    ...(entries.length === 1
      ? []
      : [
          problem(
            page.file,
            'script',
            `expected exactly one module script, found ${String(entries.length)}`,
          ),
        ]),
    ...(entry === undefined || isEntryPath(src)
      ? []
      : [
          problem(
            page.file,
            'script',
            `the module script ${src} must be a same-origin /_astro/ file`,
          ),
        ]),
    ...(entry !== undefined && entry.text.trim() !== ''
      ? [problem(page.file, 'script', 'the module script must have no inline body')]
      : []),
    ...sharedScriptProblems(page, (href) =>
      isSameOriginPath(href) ? undefined : `the module preload ${href} is not same-origin`,
    ),
  ];
};

/** The `dist` files a page loads directly: its module scripts and its module preloads. */
export const scriptRootsOf = (page: Page): string[] =>
  [
    ...attrsOf(page.root, 'script[type=module][src]', 'src'),
    ...attrsOf(page.root, 'link[rel~=modulepreload]', 'href'),
  ]
    .filter(isSameOriginPath)
    .map((ref) => ref.slice(1));

/** Both locales of a calculator load the same entry file (site-shell › [SS20]). */
const sharedEntryProblems = (pages: readonly Page[], site: Site): Problem[] => {
  const first = new Map<string, { file: string; entry: string }>();
  return pages
    .filter((page) => isCalculatorPage(page, site))
    .flatMap((page) => {
      const entry = attrsOf(page.root, 'script[type=module][src]', 'src')[0] ?? '';
      const earlier = first.get(page.id);
      if (earlier === undefined) {
        first.set(page.id, { file: page.file, entry });
        return [];
      }
      return earlier.entry === entry
        ? []
        : [
            problem(
              page.file,
              'script',
              `the entry ${entry} differs from the entry ${earlier.entry} of ${earlier.file}`,
            ),
          ];
    });
};

const originProblems = (page: Page, css: string): Problem[] => {
  const references = [
    ...attrsOf(page.root, '[src]', 'src'),
    ...attrsOf(page.root, '[srcset]', 'srcset').flatMap(srcsetUrls),
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

/** Palette and colour-scheme rules over the CSS of one page, against the build as a whole. */
const styleProblems = (css: string): Problem[] => {
  const colours = hexColoursIn(css);
  const schemes = Array.from(css.matchAll(SCHEME_DECLARATION), ([, value = '']) =>
    value.replace(/!important/i, '').trim(),
  );
  return [
    ...PALETTE.filter((colour) => !colours.has(colour)).map((colour) =>
      problem(DIST, 'palette', `the CSS lacks the palette colour ${colour}`),
    ),
    ...(schemes.length > 0 && schemes.every((value) => value === 'light')
      ? []
      : [problem(DIST, 'color-scheme', 'the CSS must declare color-scheme: light, only')]),
    ...(css.includes('prefers-color-scheme')
      ? [problem(DIST, 'prefers-color-scheme', 'the site has no dark theme')]
      : []),
  ];
};

const fontFaceProblems = (css: string): Problem[] =>
  Array.from(css.matchAll(/@font-face\s*\{([^}]*)\}/g), ([, body = '']) => body).flatMap((body) => [
    ...(/font-display\s*:\s*swap/.test(body)
      ? []
      : [problem(DIST, 'font-display', '@font-face must set font-display: swap')]),
    ...urlsIn(body)
      .filter((url) => ABSOLUTE.test(url))
      .map((url) => problem(DIST, 'font-url', `font url ${url} must be a same-origin path`)),
  ]);

/**
 * Every page is judged on the CSS it ships, but the CSS is one build artefact: the same finding on
 * several pages is reported once, against `(dist)`.
 */
const cssProblems = (pages: readonly Page[], dist: Dist): Problem[] => {
  const found = new Map<string, Problem>();
  for (const page of pages) {
    const css = cssOf(page, dist);
    for (const entry of [...styleProblems(css), ...fontFaceProblems(css)]) {
      found.set(`${entry.rule}\n${entry.message}`, entry);
    }
  }
  return [...found.values()];
};

const distProblems = (pages: readonly Page[], dist: Dist, site: Site): Problem[] => {
  const woff2 = [...dist.keys()].filter((file) => file.endsWith('.woff2')).length;
  const loaded = new Set(
    graphOf(pages.filter((page) => isCalculatorPage(page, site)).flatMap(scriptRootsOf), dist),
  );
  return [
    ...[...dist.keys()]
      .filter((file) => file.endsWith('.wasm'))
      .map((file) => problem(file, 'js-file', 'WebAssembly is not allowed')),
    ...[...dist.keys()]
      .filter((file) => /\.[cm]?js$/.test(file))
      .flatMap((file) => {
        // the two files outside _astro/: the analytics loader every page loads by its tag, and the
        // offline worker the calculator pages register by its fixed name
        if (file === ANALYTICS_SRC.slice(1) || file === WORKER_SRC.slice(1)) return [];
        if (!file.startsWith('_astro/')) {
          return [problem(file, 'js-file', 'JavaScript is only allowed under _astro/')];
        }
        return loaded.has(file)
          ? []
          : [problem(file, 'js-file', 'JavaScript must be reachable from a calculator page')];
      }),
    ...(woff2 === WOFF2_COUNT
      ? []
      : [problem(DIST, 'fonts', `expected exactly four .woff2 files, found ${String(woff2)}`)]),
  ];
};

/** Script, same-origin, palette and font rules over the built pages and files, per template. */
export const assetProblems = ({ pages, dist, site }: CheckContext): Problem[] => [
  ...pages.flatMap((page) => {
    const css = cssOf(page, dist);
    return [
      ...(isCalculatorPage(page, site)
        ? calculatorScriptProblems(page)
        : staticScriptProblems(page)),
      ...originProblems(page, css),
    ];
  }),
  ...sharedEntryProblems(pages, site),
  ...cssProblems(pages, dist),
  ...distProblems(pages, dist, site),
];
