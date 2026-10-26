import { describe, expect, it } from 'vitest';
import { factProblems } from './facts.ts';
import {
  calculatorSite,
  CHUNK_FILE,
  contextOf,
  ENTRY_FILE,
  fixtureSite,
  QUIKRETE_URL,
  validDist,
} from './__testing__/page-fixture.ts';

const problemsAfter = (mutate: (dist: Map<string, string>) => void = () => undefined) => {
  const site = fixtureSite();
  const dist = validDist(site);
  mutate(dist);
  return factProblems(contextOf(dist, site));
};

// spec: trust-pages › [TP12] — what the privacy page says must match what the build does
describe('privacy facts match the build (trust-pages › [TP12])', () => {
  it('finds nothing wrong with a valid dist, with or without a headers file', () => {
    expect(problemsAfter()).toEqual([]);
    expect(
      problemsAfter((dist) => dist.set('_headers', '/*\n  X-Content-Type-Options: nosniff\n')),
    ).toEqual([]);
  });

  it('fails a cookie header, whatever its case', () => {
    for (const line of ['Set-Cookie: a=1', 'set-cookie: a=1', 'SET-COOKIE: a=1']) {
      expect(problemsAfter((dist) => dist.set('_headers', `/*\n  ${line}\n`))).toEqual([
        { file: '_headers', rule: 'cookie-header', message: 'the headers file must set no cookie' },
      ]);
    }
  });

  it.each([
    ['index.html', 'document.cookie', '<p>document.cookie</p>'],
    ['about.html', 'localStorage', '<p>localStorage</p>'],
    ['about.html', 'sessionStorage', '<p>sessionStorage</p>'],
    ['index.html', 'indexedDB', '<p>indexedDB</p>'],
    ['_astro/a.css', 'document.cookie', '/* document.cookie */'],
  ])('fails %s that references %s', (file, what, markup) => {
    const problems = problemsAfter((dist) =>
      dist.set(
        file,
        file.endsWith('.html')
          ? (dist.get(file) ?? '').replace('</main>', `${markup}</main>`)
          : markup,
      ),
    );
    expect(problems).toEqual([
      { file, rule: 'storage', message: `${what} must not appear in a built file` },
    ]);
  });

  it('allows the words in plain prose that is not the API name', () => {
    expect(
      problemsAfter((dist) =>
        dist.set(
          'about.html',
          (dist.get('about.html') ?? '').replace(
            '</main>',
            '<p>No cookies, no local storage.</p></main>',
          ),
        ),
      ),
    ).toEqual([]);
  });

  it.each([
    ['a css url', '_astro/a.css', '@import url(https://cdn.example.com/a.css);'],
    ['a protocol-relative url', '_astro/b.css', '@import "//cdn.example.com/a.css";'],
    ['a script file', '_astro/c.js', 'fetch("https://api.example.com/x")'],
    [
      'a host that only starts like the site',
      '_astro/d.css',
      '@import "//maestrocalc.com.evil.com/a.css";',
    ],
    [
      'a namespace host with a longer name',
      '_astro/e.js',
      'x("http://www.w3.org/2000/svg.evil.com")',
    ],
  ])('fails %s that points off the site origin', (_name, file, text) => {
    expect(problemsAfter((dist) => dist.set(file, text))).toEqual([
      { file, rule: 'third-party-origin', message: 'a built asset references another origin' },
    ]);
  });

  it('allows the site origin and the SVG namespace in built assets', () => {
    expect(
      problemsAfter((dist) => {
        dist.set('_astro/a.css', '/* https://maestrocalc.com/about */');
        dist.set('_astro/b.css', '@import "/local.css";');
        dist.set(
          '_astro/c.js',
          'e("http://www.w3.org/2000/svg");a("http://www.w3.org/1999/xlink")',
        );
        dist.set('_astro/d.json', '{"xmlns":"http://www.w3.org/2000/svg"}');
      }),
    ).toEqual([]);
  });
});

// ---- the calculator bundle: no storage, no network, no message text, no foreign origin ----

const calcProblemsAfter = (mutate: (dist: Map<string, string>) => void = () => undefined) => {
  const site = calculatorSite();
  const dist = validDist(site);
  mutate(dist);
  return factProblems(contextOf(dist, site));
};

const appended = (file: string, text: string) => (dist: Map<string, string>) =>
  dist.set(file, `${dist.get(file) ?? ''}${text}`);

describe('calculator bundle facts (site-shell › [SS23], calculator-page › [CP42], [CP47])', () => {
  it('finds nothing wrong with the valid entry and its chunk', () => {
    expect(calcProblemsAfter()).toEqual([]);
  });

  // spec: site-shell › [SS23] the network and storage APIs, in the entry and in any imported chunk
  it.each([
    ['fetch(', 'fetch("/x")'],
    ['XMLHttpRequest', 'new XMLHttpRequest()'],
    ['sendBeacon', 'navigator.sendBeacon("/x")'],
    ['WebSocket', 'new WebSocket("wss://x")'],
  ])('fails %s in the entry and in a chunk, naming the file', (api, code) => {
    for (const file of [ENTRY_FILE, CHUNK_FILE]) {
      const found = calcProblemsAfter(appended(file, `;${code}`)).filter(
        (entry) => entry.rule === 'bundle-api',
      );
      expect(found).toEqual([
        { file, rule: 'bundle-api', message: `${api} must not appear in the calculator bundle` },
      ]);
    }
  });

  it('leaves the storage APIs to the sitewide storage rule', () => {
    expect(
      calcProblemsAfter(
        appended(ENTRY_FILE, ';document.cookie;localStorage.x;sessionStorage.y;indexedDB.open()'),
      ).map((entry) => entry.rule),
    ).toEqual(['storage', 'storage', 'storage', 'storage']);
  });

  // spec: site-shell › [SS23], calculator-page › [CP42] no catalog message text of either locale
  it.each([
    ['en', 'Use a period for decimals', 'errors.DECIMAL_COMMA'],
    ['es', 'Usa punto para los decimales', 'errors.DECIMAL_COMMA'],
    ['en', 'Copy link', 'site.calculator.copyLink'],
    ['es', 'Copiar enlace', 'site.calculator.copyLink'],
  ])(
    'fails the %s message "%s" in the bundle, naming the file and the key',
    (locale, text, key) => {
      expect(calcProblemsAfter(appended(CHUNK_FILE, `;t("${text}")`))).toEqual([
        {
          file: CHUNK_FILE,
          rule: 'bundle-text',
          message: `the ${locale} message ${key} must not appear in the calculator bundle`,
        },
      ]);
    },
  );

  it('does not look for the messages in the page, where they belong', () => {
    expect(
      calcProblemsAfter((dist) =>
        dist.set(
          'privacy.html',
          (dist.get('privacy.html') ?? '').replace('</main>', '<p>Copy link</p></main>'),
        ),
      ),
    ).toEqual([]);
  });

  // spec: calculator-page › [CP47] only the site origin, over https
  it('fails the source URL in the bundle through the third-party scan, naming the file', () => {
    expect(calcProblemsAfter(appended(ENTRY_FILE, `;u("${QUIKRETE_URL}")`))).toEqual([
      {
        file: ENTRY_FILE,
        rule: 'third-party-origin',
        message: 'a built asset references another origin',
      },
    ]);
  });

  it('allows https://maestrocalc.com in the bundle and fails the insecure form', () => {
    expect(calcProblemsAfter(appended(ENTRY_FILE, ';u("https://maestrocalc.com/x")'))).toEqual([]);
    expect(calcProblemsAfter(appended(ENTRY_FILE, ';u("http://maestrocalc.com/x")'))).toEqual([
      { file: ENTRY_FILE, rule: 'bundle-origin', message: 'http://maestrocalc.com must be https' },
    ]);
  });

  it('reads an import that dist lacks as an empty file', () => {
    expect(calcProblemsAfter(appended(ENTRY_FILE, ';import"./chunks/gone.js"'))).toEqual([]);
  });

  it("checks only the files of the graph: a script nobody loads is the file-set rule's concern", () => {
    expect(calcProblemsAfter((dist) => dist.set('_astro/orphan.js', 'fetch("/x")'))).toEqual([]);
  });
});

// spec: site-quality › [SQ28] no page references a /cdn-cgi/ script
describe('platform-injected scripts (site-quality › [SQ28])', () => {
  it.each([
    ['index.html', 'a home page'],
    ['privacy.html', 'a trust page'],
    ['concrete-calculator.html', 'a calculator page'],
    ['404.html', 'a not-found page'],
  ])('fails %s (%s) that references a /cdn-cgi/ script', (file) => {
    const found = calcProblemsAfter((dist) =>
      dist.set(
        file,
        (dist.get(file) ?? '').replace(
          '</body>',
          '<script src="/cdn-cgi/scripts/x/cloudflare-static/email-decode.min.js"></script></body>',
        ),
      ),
    );
    expect(found).toEqual([
      { file, rule: 'cdn-cgi', message: 'a page must not reference a /cdn-cgi/ script' },
    ]);
  });
});
