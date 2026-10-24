import { parse } from 'node-html-parser';
import { describe, expect, it } from 'vitest';
import { alternatesIn, attr, attrsOf } from './dom.ts';

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
