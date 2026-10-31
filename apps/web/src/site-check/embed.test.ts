import { describe, expect, it } from 'vitest';
import { calculatorSite, ENTRY_FILE, validDist } from './__testing__/page-fixture.ts';
import { contextOf } from './checks.ts';
import { embedFilesOf, embedProblems } from './embed.ts';
import { fileSetProblems } from './files.ts';
import type { Dist } from './types.ts';

const FILE = 'embed/concrete-calculator.html';
const SCRIPT = `<script type="module" src="/${ENTRY_FILE}"></script>`;

/** The valid fixture dist with the English concrete embed changed by `edit`. */
const distWith = (edit: (html: string) => string = (html) => html): Map<string, string> => {
  const dist = validDist(calculatorSite());
  dist.set(FILE, edit(dist.get(FILE) ?? ''));
  return dist;
};

const messagesOf = (dist: Dist): string[] =>
  embedProblems(contextOf(dist, calculatorSite(), new Map())).map(
    ({ file, rule, message }) => `${file} ${rule}: ${message}`,
  );

describe('embed pages (embed › check:site)', () => {
  it('expects one embed per calculator page and language', () => {
    expect(embedFilesOf(calculatorSite())).toEqual([
      {
        file: FILE,
        id: 'concrete',
        locale: 'en',
        page: '/concrete-calculator',
        other: '/embed/es/calculadora-de-concreto',
      },
      {
        file: 'embed/es/calculadora-de-concreto.html',
        id: 'concrete',
        locale: 'es',
        page: '/es/calculadora-de-concreto',
        other: '/embed/concrete-calculator',
      },
    ]);
  });

  it('counts the embeds in the file set: built ones are no orphans, missing ones are named', () => {
    const files = (dist: Dist) =>
      fileSetProblems(contextOf(dist, calculatorSite(), new Map())).map(
        ({ file, message }) => `${file}: ${message}`,
      );
    expect(files(distWith())).toEqual([]);
    const missing = distWith();
    missing.delete('embed/es/calculadora-de-concreto.html');
    expect(files(missing)).toEqual([
      'embed/es/calculadora-de-concreto.html: missing page: the route table expects it',
    ]);
  });

  it('leaves a missing embed to the file set', () => {
    const dist = distWith();
    dist.delete(FILE);
    expect(messagesOf(dist)).toEqual([]);
  });

  it('passes a valid embed in both languages', () => {
    expect(messagesOf(distWith())).toEqual([]);
  });

  it.each([
    [
      'a canonical other than the full page',
      (h: string) =>
        h.replace(
          '<link rel="canonical" href="https://maestrocalc.com/concrete-calculator">',
          '<link rel="canonical" href="https://maestrocalc.com/embed/concrete-calculator">',
        ),
      'the canonical must be https://maestrocalc.com/concrete-calculator',
    ],
    [
      'no noindex',
      (h: string) => h.replace('<meta name="robots" content="noindex">', ''),
      'it must be noindex',
    ],
    [
      'an hreflang alternate',
      (h: string) =>
        h.replace(
          '</head>',
          '<link rel="alternate" hreflang="es-US" href="https://maestrocalc.com/x"></head>',
        ),
      'it must have no hreflang alternate and no JSON-LD',
    ],
    [
      'JSON-LD',
      (h: string) => h.replace('</head>', '<script type="application/ld+json">{}</script></head>'),
      'it must have no hreflang alternate and no JSON-LD',
    ],
    [
      'no base target',
      (h: string) => h.replace('<base target="_blank">', ''),
      'it must open its links in a new tab (<base target="_blank">)',
    ],
    [
      'two h1',
      (h: string) => h.replace('</main>', '<h1>x</h1></main>'),
      'it must have exactly one h1',
    ],
    [
      'another script',
      (h: string) => h.replace(SCRIPT, '<script type="module" src="/_astro/other.js"></script>'),
      `its module scripts must be the full page's: /${ENTRY_FILE}`,
    ],
    [
      'analytics',
      (h: string) => h.replace('</head>', '<script src="/analytics.js" defer></script></head>'),
      'it must load no analytics',
    ],
    [
      'a switch out of the frame',
      (h: string) => h.replace(' target="_self"', ''),
      'its language switch must stay in the frame and lead to /embed/es/calculadora-de-concreto',
    ],
    [
      'a switch to the full page',
      (h: string) =>
        h.replace('href="/embed/es/calculadora-de-concreto"', 'href="/es/calculadora-de-concreto"'),
      'its language switch must stay in the frame and lead to /embed/es/calculadora-de-concreto',
    ],
  ])('flags %s', (_name, edit, message) => {
    expect(messagesOf(distWith(edit))).toEqual([`${FILE} embed: ${message}`]);
  });

  it('flags an inline module script, which no full page has', () => {
    const dist = distWith((h) => h.replace(SCRIPT, '<script type="module">x</script>'));
    expect(messagesOf(dist)).toEqual([
      `${FILE} embed: its module scripts must be the full page's: /${ENTRY_FILE}`,
    ]);
  });

  it('flags the scripts of an embed whose full page is missing', () => {
    const dist = distWith();
    dist.delete('concrete-calculator.html');
    expect(messagesOf(dist)).toEqual([
      `${FILE} embed: its module scripts must be the full page's: `,
    ]);
  });

  it('flags an embed over the HTML budget', () => {
    const dist = distWith((h) => h.replace('</main>', `<p>${'x'.repeat(49_200)}</p></main>`));
    const size = new TextEncoder().encode(dist.get(FILE) ?? '').length;
    expect(messagesOf(dist)).toEqual([`${FILE} embed: ${String(size)} B of HTML is over 49152 B`]);
  });
});
