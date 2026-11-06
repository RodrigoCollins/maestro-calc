import { describe, expect, it } from 'vitest';
import { whatsappHref } from '../share/href.ts';
import { shareProblems } from './share.ts';

const origin = 'https://cuentahoras.com';
const link = (url: string, extra = 'rel="noopener" aria-label="Share on WhatsApp: X"'): string =>
  `<a class="button" href="${whatsappHref(`X, free on Cuenta Horas:\n${url}`).replaceAll('&', '&amp;')}" ${extra}>Share on WhatsApp</a>`;
const page = (body: string): string => `<html><body><main>${body}</main></body></html>`;

describe('shareProblems', () => {
  it('passes a page with one WhatsApp link to its own canonical address', () => {
    const pages = new Map([['/a', page(link(`${origin}/a`))]]);
    expect(shareProblems(pages, origin, ['/a'])).toEqual([]);
  });

  it('names a page with no WhatsApp link, or with two', () => {
    const pages = new Map([
      ['/a', page('<a href="/b">b</a>')],
      ['/b', page(link(`${origin}/b`) + link(`${origin}/b`))],
    ]);
    expect(shareProblems(pages, origin, ['/a', '/b'])).toEqual([
      '/a: no WhatsApp share link',
      '/b: 2 WhatsApp share links, one expected',
    ]);
  });

  it('names a link to another address, one without noopener and a missing page', () => {
    const pages = new Map([
      ['/a', page(link(`${origin}/elsewhere`))],
      ['/b', page(link(`${origin}/b`, 'aria-label="Share"'))],
    ]);
    expect(shareProblems(pages, origin, ['/a', '/b', '/c'])).toEqual([
      `/a: the WhatsApp link does not share ${origin}/a`,
      '/b: the WhatsApp link has no rel="noopener"',
      '/c: a page the build does not hold',
    ]);
  });
});
