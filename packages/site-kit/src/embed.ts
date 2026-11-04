import { parse } from 'node-html-parser';
import { ANALYTICS_LOADER } from './budgets.ts';

/*
 * The embed pages of the niche sites (plans/growth/PLAN.md › lever 2), as Maestro Calc's `/embed`:
 * a calculator page at `/embed` + its path, in a slim shell another site may frame. Its canonical is
 * the full page and it is `noindex`, so search sees one page; it loads no analytics, and `<base>`
 * opens every link in a new tab (the full site refuses to be framed). The snippet another site
 * pastes is the frame and, outside it, a visible text link to the full page.
 */

const PREFIX = '/embed';

/** `/pool-salt-calculator` is embedded at `/embed/pool-salt-calculator`; the home has no embed. */
export const embedPathOf = (page: string): string => {
  if (page === '/' || !page.startsWith('/')) throw new Error(`no embed for "${page}"`);
  return `${PREFIX}${page}`;
};

/** The full page of an embed path, or `undefined` for a path that is not an embed. */
export const pagePathOf = (path: string): string | undefined =>
  path.startsWith(`${PREFIX}/`) && path.length > PREFIX.length + 1
    ? path.slice(PREFIX.length)
    : undefined;

const escape = (text: string): string =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

export interface SnippetInput {
  /** The site origin, `https://poolfigures.com`. */
  readonly origin: string;
  /** The full page's path. */
  readonly page: string;
  /** The calculator's name: the frame's title. */
  readonly name: string;
  /** The text of the link to the full page, `Pool salt calculator by Pool Figures`. */
  readonly credit: string;
  /** The fixed height of the frame in pixels; the calculator scrolls inside it when taller. */
  readonly height: number;
}

/** The code another site pastes: the frame, then the visible link to the full page outside it. */
export const embedSnippetOf = ({ origin, page, name, credit, height }: SnippetInput): string =>
  [
    `<iframe src="${new URL(embedPathOf(page), origin).href}" title="${escape(name)}" width="100%" height="${String(height)}" style="border:0" loading="lazy"></iframe>`,
    `<p><a href="${new URL(page, origin).href}">${escape(credit)}</a></p>`,
  ].join('\n');

export interface EmbedExpectation {
  /** The full page's absolute URL. */
  readonly canonical: string;
  /** The module scripts of the full page: the embed runs the same calculator. */
  readonly scripts: readonly string[];
  /** The other language's embed, the target of the language switch; none on a one-language site. */
  readonly other?: string | undefined;
}

/** The module scripts of a built page, in order: an embed must run the full page's. */
export const moduleScriptsOf = (html: string): string[] =>
  parse(html)
    .querySelectorAll('script[type=module]')
    .map((script) => script.getAttribute('src') ?? '');

/** What a built embed breaks of the rules that make it safe to frame and invisible to search. */
export const embedPageProblems = (html: string, expected: EmbedExpectation): string[] => {
  const root = parse(html);
  const scripts = moduleScriptsOf(html);
  const switches = root.querySelectorAll('header a[hreflang]');
  const { canonical, other } = expected;
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
    ...(scripts.length > 0 && scripts.join(' ') === expected.scripts.join(' ')
      ? []
      : [`its module scripts must be the full page's: ${expected.scripts.join(' ')}`]),
    ...(root.querySelector(`script[src="/${ANALYTICS_LOADER}"]`) === null
      ? []
      : ['it must load no analytics']),
    ...(other === undefined ||
    (switches.length === 1 &&
      switches[0]?.getAttribute('target') === '_self' &&
      switches[0].getAttribute('href') === other)
      ? []
      : [`its language switch must stay in the frame and lead to ${other}`]),
  ];
};

/** The rules of a Cloudflare `_headers` file: each path with its trimmed header lines. */
export const headerRulesOf = (text: string): Map<string, string[]> => {
  const rules = new Map<string, string[]>();
  let lines: string[] = [];
  for (const line of text.split('\n')) {
    if (line.trim() === '' || line.trimStart().startsWith('#')) continue;
    if (/^\S/.test(line)) {
      lines = [];
      rules.set(line.trim(), lines);
    } else lines.push(line.trim());
  }
  return rules;
};

const CSP = 'Content-Security-Policy: ';

const policyOf = (lines: readonly string[] | undefined): string =>
  lines?.find((line) => line.startsWith(CSP))?.slice(CSP.length) ?? '';

/** The site policy with every other origin dropped (an embed loads no analytics), framable anywhere. */
const embedPolicyOf = (site: string): string =>
  site
    .split(';')
    .map((directive) =>
      directive
        .trim()
        .split(' ')
        .filter((token) => !/^https?:/.test(token))
        .join(' '),
    )
    .map((directive) => (directive.startsWith('frame-ancestors') ? 'frame-ancestors *' : directive))
    .join('; ');

/**
 * The framing rules of a site's `_headers`: every path keeps `frame-ancestors 'none'`, and only
 * `/embed/*` detaches that policy for the same one with `frame-ancestors *` and no other origin.
 */
export const embedHeaderProblems = (text: string): string[] => {
  const rules = headerRulesOf(text);
  const site = policyOf(rules.get('/*'));
  const embed = rules.get('/embed/*') ?? [];
  return [
    ...(site.includes("frame-ancestors 'none'")
      ? []
      : ["/*: the site policy must keep frame-ancestors 'none'"]),
    ...(embed.includes('! Content-Security-Policy')
      ? []
      : ['/embed/*: it must detach the site policy (! Content-Security-Policy)']),
    ...(policyOf(embed) === embedPolicyOf(site) && site.includes("frame-ancestors 'none'")
      ? []
      : [
          '/embed/*: its policy must be the site policy with frame-ancestors * and no other origin',
        ]),
  ];
};
