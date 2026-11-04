import { describe, expect, it } from 'vitest';
import {
  embedHeaderProblems,
  embedPageProblems,
  embedPathOf,
  embedSnippetOf,
  headerRulesOf,
  moduleScriptsOf,
  pagePathOf,
} from './embed.ts';

describe('embedPathOf and pagePathOf', () => {
  it('serves the embed of a page at /embed + its path, and reads the page back', () => {
    expect(embedPathOf('/pool-salt-calculator')).toBe('/embed/pool-salt-calculator');
    expect(embedPathOf('/es/calculadora-de-horas-trabajadas')).toBe(
      '/embed/es/calculadora-de-horas-trabajadas',
    );
    expect(pagePathOf('/embed/es/calculadora-de-horas-trabajadas')).toBe(
      '/es/calculadora-de-horas-trabajadas',
    );
  });

  it('refuses the home and a relative path, and reads no page from a path outside /embed/', () => {
    expect(() => embedPathOf('/')).toThrow('no embed for "/"');
    expect(() => embedPathOf('salt')).toThrow('no embed for "salt"');
    expect(pagePathOf('/embed-calculators')).toBeUndefined();
    expect(pagePathOf('/embed/')).toBeUndefined();
    expect(pagePathOf('/pool-salt-calculator')).toBeUndefined();
  });
});

describe('embedSnippetOf', () => {
  const snippet = embedSnippetOf({
    origin: 'https://x.test',
    page: '/salt-calculator',
    name: 'Salt "pro" <calculator> & more',
    credit: 'Salt calculator by X',
    height: 1000,
  });

  it('frames the embed, then links the full page outside the frame, both absolute', () => {
    expect(snippet).toBe(
      [
        '<iframe src="https://x.test/embed/salt-calculator" title="Salt &quot;pro&quot; &lt;calculator&gt; &amp; more" width="100%" height="1000" style="border:0" loading="lazy"></iframe>',
        '<p><a href="https://x.test/salt-calculator">Salt calculator by X</a></p>',
      ].join('\n'),
    );
  });
});

const page = (overrides: Record<string, string> = {}): string => {
  const parts: Record<string, string> = {
    canonical: '<link rel="canonical" href="https://x.test/salt-calculator">',
    robots: '<meta name="robots" content="noindex">',
    base: '<base target="_blank">',
    script: '<script type="module" src="/_astro/salt.js"></script>',
    switch:
      '<header><a class="lang" href="/embed/es/sal" hreflang="es" target="_self">ES</a></header>',
    h1: '<h1>Salt</h1>',
    ...overrides,
  };
  const { h1, switch: header, ...head } = parts;
  return `<!doctype html><html><head>${Object.values(head).join('')}</head><body>${header ?? ''}${h1 ?? ''}</body></html>`;
};

const expected = {
  canonical: 'https://x.test/salt-calculator',
  scripts: ['/_astro/salt.js'],
  other: '/embed/es/sal',
};

describe('embedPageProblems', () => {
  it('finds nothing on an embed that is safe to frame and invisible to search', () => {
    expect(embedPageProblems(page(), expected)).toEqual([]);
  });

  it('names a wrong canonical, a missing noindex and a missing new-tab base', () => {
    expect(
      embedPageProblems(
        page({
          canonical: '<link rel="canonical" href="https://x.test/embed/salt-calculator">',
          robots: '',
          base: '',
        }),
        expected,
      ),
    ).toEqual([
      'the canonical must be https://x.test/salt-calculator',
      'it must be noindex',
      'it must open its links in a new tab (<base target="_blank">)',
    ]);
  });

  it('refuses language alternates, JSON-LD, analytics, a second h1 and other scripts', () => {
    expect(
      embedPageProblems(
        page({
          alternate: '<link rel="alternate" hreflang="es-US" href="https://x.test/es/sal">',
          ld: '<script type="application/ld+json">{}</script>',
          analytics: '<script src="/analytics.js" defer></script>',
          h1: '<h1>Salt</h1><h1>Again</h1>',
          script: '<script type="module" src="/_astro/other.js"></script>',
        }),
        expected,
      ),
    ).toEqual([
      'it must have no hreflang alternate and no JSON-LD',
      'it must have exactly one h1',
      "its module scripts must be the full page's: /_astro/salt.js",
      'it must load no analytics',
    ]);
  });

  it('keeps the language switch in the frame, and checks none when the site has one language', () => {
    expect(
      embedPageProblems(
        page({ switch: '<header><a href="/es/sal" hreflang="es">ES</a></header>' }),
        expected,
      ),
    ).toEqual(['its language switch must stay in the frame and lead to /embed/es/sal']);
    expect(embedPageProblems(page({ switch: '' }), { ...expected, other: undefined })).toEqual([]);
  });
});

const HEADERS = [
  '# comment',
  '/*',
  '  X-Content-Type-Options: nosniff',
  "  Content-Security-Policy: default-src 'self'; script-src 'self' https://www.googletagmanager.com; img-src 'self' https://*.google-analytics.com; connect-src 'self' https://*.google-analytics.com; frame-ancestors 'none'",
  '',
  '/_astro/*',
  '  Cache-Control: immutable',
  '',
  '/embed/*',
  '  ! Content-Security-Policy',
  "  Content-Security-Policy: default-src 'self'; script-src 'self'; img-src 'self'; connect-src 'self'; frame-ancestors *",
  '',
].join('\n');

describe('headerRulesOf', () => {
  it('reads each path of a _headers file with its lines, without comments or blank lines', () => {
    expect(headerRulesOf(HEADERS).get('/_astro/*')).toEqual(['Cache-Control: immutable']);
    expect(headerRulesOf(HEADERS).get('/embed/*')).toEqual([
      '! Content-Security-Policy',
      "Content-Security-Policy: default-src 'self'; script-src 'self'; img-src 'self'; connect-src 'self'; frame-ancestors *",
    ]);
  });
});

describe('embedHeaderProblems', () => {
  it('finds nothing when only /embed/* may be framed, by the site policy without the analytics hosts', () => {
    expect(embedHeaderProblems(HEADERS)).toEqual([]);
  });

  it('names a site that lets every page be framed, or an embed policy that is missing', () => {
    expect(
      embedHeaderProblems(HEADERS.replace("frame-ancestors 'none'", 'frame-ancestors *')),
    ).toEqual([
      "/*: the site policy must keep frame-ancestors 'none'",
      '/embed/*: its policy must be the site policy with frame-ancestors * and no other origin',
    ]);
    expect(embedHeaderProblems(HEADERS.split('/embed/*')[0] ?? '')).toEqual([
      '/embed/*: it must detach the site policy (! Content-Security-Policy)',
      '/embed/*: its policy must be the site policy with frame-ancestors * and no other origin',
    ]);
  });

  it('names an embed policy that keeps an analytics host', () => {
    expect(
      embedHeaderProblems(
        HEADERS.replace(
          "connect-src 'self'; frame-ancestors *",
          "connect-src 'self' https://*.google-analytics.com; frame-ancestors *",
        ),
      ),
    ).toEqual([
      '/embed/*: its policy must be the site policy with frame-ancestors * and no other origin',
    ]);
  });
});

describe('moduleScriptsOf', () => {
  it('lists the module scripts of a page in order, and none of its classic scripts', () => {
    expect(
      moduleScriptsOf(
        '<script src="/analytics.js"></script><script type="module" src="/a.js"></script><script type="module">x</script>',
      ),
    ).toEqual(['/a.js', '']);
  });
});
