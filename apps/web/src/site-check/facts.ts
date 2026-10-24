import { problem } from './types.ts';
import type { Dist, Problem, Site } from './types.ts';

/** Browser APIs the privacy page says the site never uses. */
const STORAGE_APIS = ['document.cookie', 'localStorage'];

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

/** The facts the privacy page states, checked against the build (trust-pages › [TP12]). */
export const factProblems = (site: Site, dist: Dist): Problem[] => [
  ...cookieProblems(dist),
  ...storageProblems(dist),
  ...originProblems(site, dist),
];
