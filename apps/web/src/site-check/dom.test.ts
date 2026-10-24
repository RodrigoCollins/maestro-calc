import { parse } from 'node-html-parser';
import { describe, expect, it } from 'vitest';
import { alternatesIn, attr, attrsOf, hasWord, visibleText } from './dom.ts';

const root = parse(
  '<head><link rel="alternate" hreflang="es-US" href="/es"><link rel="alternate" hreflang="en-US" href="/"><link rel="alternate" href="/x"></head><a href="/a">a</a><a>b</a>',
);

describe('DOM helpers', () => {
  it('reads an attribute, or an empty string when it is absent', () => {
    expect(root.querySelectorAll('a').map((link) => attr(link, 'href'))).toEqual(['/a', '']);
  });

  it('reads one attribute from every match, in document order', () => {
    expect(attrsOf(root, 'a', 'href')).toEqual(['/a', '']);
  });

  it('lists the hreflang alternates of a head as sorted "hreflang href" pairs', () => {
    expect(alternatesIn(root)).toEqual(['en-US /', 'es-US /es']);
  });
});

describe('visible text', () => {
  const page = parse(
    '<html><head><title>Tit</title><style>.draft{}</style></head><body><p>One <b>two</b></p><script type="application/ld+json">{"draft":1}</script><!-- hidden note --></body></html>',
    { comment: true },
  );

  it('joins text and comments but leaves script and style bodies out', () => {
    const text = visibleText(page);
    expect(text).toContain('Tit');
    expect(text.split(/\s+/)).toEqual(expect.arrayContaining(['One', 'two']));
    expect(text).toContain('hidden note');
    expect(text).not.toContain('draft');
  });

  it('matches whole words, case-insensitively, through letters and digits', () => {
    expect(hasWord('A Draft here', 'draft')).toBe(true);
    expect(hasWord('pending REVIEW', 'pending review')).toBe(true);
    expect(hasWord('drafting', 'draft')).toBe(false);
    expect(hasWord('borradores', 'borrador')).toBe(false);
    expect(hasWord('redraft', 'draft')).toBe(false);
    expect(hasWord('draft2', 'draft')).toBe(false);
    expect(hasWord('un borrador.', 'borrador')).toBe(true);
  });
});
