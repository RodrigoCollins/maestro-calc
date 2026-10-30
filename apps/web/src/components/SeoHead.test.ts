import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { parse } from 'node-html-parser';
import { describe, expect, it } from 'vitest';
import { serializeJsonLd } from '../seo/json-ld.ts';
import SeoHead from './SeoHead.astro';

const render = async (props: Record<string, unknown>) =>
  parse(`<head>${await (await AstroContainer.create()).renderToString(SeoHead, { props })}</head>`);

const indexable = {
  title: 'Maestro Calc: jobsite calculators',
  description: 'Jobsite calculators for builders.',
  canonical: 'https://maestrocalc.com/',
  alternates: [
    { hreflang: 'en-US', href: 'https://maestrocalc.com/' },
    { hreflang: 'es-US', href: 'https://maestrocalc.com/es' },
    { hreflang: 'x-default', href: 'https://maestrocalc.com/' },
  ],
};

describe('SeoHead (site-seo › Document head)', () => {
  // open-graph: an indexable page is shared with its title, description, address and the one image
  it('gives an indexable page the Open Graph and Twitter card of its own text and address', async () => {
    const head = await render({ ...indexable, ogLocale: 'en_US', ogAlternateLocales: ['es_US'] });
    const og = (property: string) =>
      head
        .querySelectorAll(`meta[property="${property}"]`)
        .map((tag) => tag.getAttribute('content'));
    expect(og('og:type')).toEqual(['website']);
    expect(og('og:site_name')).toEqual(['Maestro Calc']);
    expect(og('og:title')).toEqual([indexable.title]);
    expect(og('og:description')).toEqual([indexable.description]);
    expect(og('og:url')).toEqual([indexable.canonical]);
    expect(og('og:locale')).toEqual(['en_US']);
    expect(og('og:locale:alternate')).toEqual(['es_US']);
    expect(og('og:image')).toEqual(['https://maestrocalc.com/og.png']);
    expect([og('og:image:width'), og('og:image:height')]).toEqual([['1200'], ['630']]);
    expect(og('og:image:alt')).toEqual(['Maestro Calc']);
    expect(head.querySelector('meta[name="twitter:card"]')?.getAttribute('content')).toBe(
      'summary_large_image',
    );
  });

  it('gives a page without a canonical (the not-found page) no Open Graph and no card', async () => {
    const head = await render({
      title: 'Not found',
      description: 'Nothing here.',
      robots: 'noindex',
      ogLocale: 'en_US',
    });
    expect(head.querySelectorAll('meta[property^="og:"], meta[name^="twitter:"]')).toHaveLength(0);
  });

  // spec: site-seo › [SS2 / SE2] head essentials
  it('declares charset, the exact viewport, one title and one description', async () => {
    const head = await render(indexable);
    expect(head.querySelector('meta[charset]')?.getAttribute('charset')?.toLowerCase()).toBe(
      'utf-8',
    );
    expect(head.querySelector('meta[name=viewport]')?.getAttribute('content')).toBe(
      'width=device-width, initial-scale=1',
    );
    expect(head.querySelectorAll('title')).toHaveLength(1);
    expect(head.querySelector('title')?.text).toBe('Maestro Calc: jobsite calculators');
    expect(head.querySelectorAll('meta[name=description]')).toHaveLength(1);
    expect(head.querySelector('meta[name=description]')?.getAttribute('content')).toBe(
      'Jobsite calculators for builders.',
    );
  });

  it('adds the self canonical and the three hreflang alternates of an indexable page', async () => {
    const head = await render(indexable);
    expect(head.querySelector('link[rel=canonical]')?.getAttribute('href')).toBe(
      'https://maestrocalc.com/',
    );
    expect(
      head
        .querySelectorAll('link[rel=alternate][hreflang]')
        .map((link) => [link.getAttribute('hreflang'), link.getAttribute('href')]),
    ).toEqual([
      ['en-US', 'https://maestrocalc.com/'],
      ['es-US', 'https://maestrocalc.com/es'],
      ['x-default', 'https://maestrocalc.com/'],
    ]);
    expect(head.querySelector('meta[name=robots]')).toBeNull();
  });

  // trim E of blueprint-panel: the generator meta is gone (site-quality › [SQ39])
  it('names no generator', async () => {
    expect((await render(indexable)).querySelectorAll('meta[name=generator]')).toHaveLength(0);
  });

  // spec: site-shell › [SS17] icon link
  it('links the SVG favicon and no .ico', async () => {
    const head = await render(indexable);
    const icons = head.querySelectorAll('link[rel=icon]');
    expect(icons).toHaveLength(1);
    expect(icons[0]?.getAttribute('type')).toBe('image/svg+xml');
    expect(icons[0]?.getAttribute('href')).toBe('/favicon.svg');
  });

  // spec: site-routing-i18n › [SR14]
  it('marks a noindex head and leaves out canonical and alternates', async () => {
    const head = await render({
      title: 'Page not found | Maestro Calc',
      description: 'It moved.',
      robots: 'noindex',
    });
    expect(head.querySelector('meta[name=robots]')?.getAttribute('content')).toBe('noindex');
    expect(head.querySelector('link[rel=canonical]')).toBeNull();
    expect(head.querySelectorAll('link[rel=alternate]')).toHaveLength(0);
    expect(head.querySelector('title')?.text).toBe('Page not found | Maestro Calc');
  });

  // spec: site-seo › [SE6, SE7] render side
  it('renders one JSON-LD block that parses to the object, when given one', async () => {
    const data = { '@context': 'https://schema.org', name: 'A </script> & B' };
    const head = await render({ ...indexable, jsonLd: serializeJsonLd(data) });
    const scripts = head.querySelectorAll('script');
    expect(scripts).toHaveLength(1);
    expect(scripts[0]?.getAttribute('type')).toBe('application/ld+json');
    expect(JSON.parse(scripts[0]?.text ?? '')).toEqual(data);
  });

  it('renders no script at all without JSON-LD', async () => {
    expect((await render(indexable)).querySelectorAll('script')).toHaveLength(0);
  });
});
