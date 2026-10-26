import { scriptRootsOf } from './assets.ts';
import { graphOf } from './graph.ts';
import { isCalculatorPage, problem } from './types.ts';
import type { CheckContext, Dist, Page, Problem, Site } from './types.ts';

/** Browser APIs the privacy page says the site never uses. */
const STORAGE_APIS = ['document.cookie', 'localStorage', 'sessionStorage', 'indexedDB'];

/** Network APIs the calculator bundle never calls: it makes no request (site-shell › [SS23]). */
const NETWORK_APIS = ['fetch(', 'XMLHttpRequest', 'sendBeacon', 'WebSocket'];

/** The catalog messages that must stay out of the bundle: one error and one UI label, per locale. */
const SAMPLE_KEYS = ['errors.DECIMAL_COMMA', 'site.calculator.copyLink'];

/** Built files that carry code or data and so must not point at another origin. */
const TEXT_ASSET = /\.(?:css|m?js|json|map)$/;

const hostOf = (url: string): string => new URL(url).host;

/** XML namespace names inline SVG carries: identifiers that no browser ever requests. */
const NAMESPACES = ['http://www.w3.org/2000/svg', 'http://www.w3.org/1999/xlink'];

const NAMESPACE = new RegExp(
  `(?:${NAMESPACES.map((name) => name.replaceAll('.', String.raw`\.`)).join('|')})(?![\\w.-])`,
  'g',
);

const otherOrigin = (origin: string) =>
  new RegExp(
    String.raw`(?:https?:)?//(?!${origin.replaceAll('.', String.raw`\.`)}(?![\w.-]))[\w-]+(?:\.[\w-]+)+`,
  );

/** Cookie header: the privacy page promises the site sets none. */
const cookieProblems = (dist: Dist): Problem[] =>
  /set-cookie/i.test(dist.get('_headers') ?? '')
    ? [problem('_headers', 'cookie-header', 'the headers file must set no cookie')]
    : [];

const storageProblems = (dist: Dist): Problem[] =>
  [...dist].flatMap(([file, text]) =>
    STORAGE_APIS.filter((api) => text.includes(api)).map((api) =>
      problem(file, 'storage', `${api} must not appear in a built file`),
    ),
  );

const originProblems = (site: Site, dist: Dist): Problem[] => {
  const foreign = otherOrigin(hostOf(site.config.url));
  return [...dist]
    .filter(([file, text]) => TEXT_ASSET.test(file) && foreign.test(text.replace(NAMESPACE, '')))
    .map(([file]) =>
      problem(file, 'third-party-origin', 'a built asset references another origin'),
    );
};

/** Every file the calculator pages load: the entries, the preloads and their static imports. */
const bundleFiles = (pages: readonly Page[], site: Site, dist: Dist): string[] =>
  graphOf(pages.filter((page) => isCalculatorPage(page, site)).flatMap(scriptRootsOf), dist);

/** The bundle makes no request, holds no message text and is served over https only. */
const bundleProblems = (pages: readonly Page[], site: Site, dist: Dist): Problem[] => {
  const insecure = `http://${hostOf(site.config.url)}`;
  return bundleFiles(pages, site, dist).flatMap((file) => {
    const text = dist.get(file) ?? '';
    return [
      ...NETWORK_APIS.filter((api) => text.includes(api)).map((api) =>
        problem(file, 'bundle-api', `${api} must not appear in the calculator bundle`),
      ),
      ...Object.entries(site.catalogs).flatMap(([locale, catalog]) =>
        SAMPLE_KEYS.filter((key) => catalog[key] !== undefined && text.includes(catalog[key])).map(
          (key) =>
            problem(
              file,
              'bundle-text',
              `the ${locale} message ${key} must not appear in the calculator bundle`,
            ),
        ),
      ),
      ...(text.includes(insecure)
        ? [problem(file, 'bundle-origin', `${insecure} must be https`)]
        : []),
    ];
  });
};

/** Cloudflare features inject a `/cdn-cgi/` script, which `script-src 'self'` would allow (SQ28). */
const injectionProblems = (pages: readonly Page[]): Problem[] =>
  pages
    .filter((page) => page.html.includes('/cdn-cgi/'))
    .map((page) => problem(page.file, 'cdn-cgi', 'a page must not reference a /cdn-cgi/ script'));

/** The facts the privacy page states, checked against the build (trust-pages › [TP12]), and the calculator bundle. */
export const factProblems = ({ pages, site, dist }: CheckContext): Problem[] => [
  ...cookieProblems(dist),
  ...storageProblems(dist),
  ...originProblems(site, dist),
  ...bundleProblems(pages, site, dist),
  ...injectionProblems(pages),
];
