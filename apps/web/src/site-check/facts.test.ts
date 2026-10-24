import { describe, expect, it } from 'vitest';
import { factProblems } from './facts.ts';
import { fixtureSite, validDist } from './__testing__/page-fixture.ts';

const problemsAfter = (mutate: (dist: Map<string, string>) => void = () => undefined) => {
  const site = fixtureSite();
  const dist = validDist(site);
  mutate(dist);
  return factProblems(site, dist);
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
