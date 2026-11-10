import { describe, expect, it } from 'vitest';
import {
  AMAZON_DISCLOSURE,
  DISCLOSURE,
  affiliateBlockHtml,
  affiliateLinkProblems,
  enabledOffers,
  offerProblems,
  type AffiliateOffer,
} from './affiliate.ts';

const offer: AffiliateOffer = {
  id: 'payroll',
  network: 'impact',
  name: 'Payroll <Pro> & Co',
  why: { en: 'Runs payroll for "small" crews.', es: 'Hace la nómina de cuadrillas pequeñas.' },
  url: 'https://example.com/go?a=1&b=2',
  enabled: true,
};

const page = (body: string): string => `<!doctype html><html><body>${body}</body></html>`;

describe('the disclosure copy', () => {
  it('says the link is paid in both languages, and the Amazon line', () => {
    expect(DISCLOSURE.en).toBe(
      'Paid link: we earn a commission if you sign up through it, at no cost to you.',
    );
    expect(DISCLOSURE.es).toBe(
      'Enlace pagado: ganamos una comisión si te registras a través de él, sin costo para ti.',
    );
    expect(AMAZON_DISCLOSURE.en).toBe('As an Amazon Associate I earn from qualifying purchases.');
    expect(AMAZON_DISCLOSURE.es).toBe(
      'Como Afiliado de Amazon, gano con las compras que cumplen los requisitos.',
    );
  });
});

describe('affiliateBlockHtml', () => {
  it('renders the name, the why, a sponsored link and the disclosure next to it, escaped', () => {
    const html = affiliateBlockHtml(offer, 'en');
    expect(html).toContain('data-affiliate="block"');
    expect(html).toContain('Payroll &lt;Pro&gt; &amp; Co');
    expect(html).toContain('Runs payroll for &quot;small&quot; crews.');
    expect(html).toContain('href="https://example.com/go?a=1&amp;b=2"');
    expect(html).toContain('rel="sponsored noopener"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain(`<small data-affiliate="disclosure">${DISCLOSURE.en}</small>`);
    expect(html).not.toContain(AMAZON_DISCLOSURE.en);
  });

  it('writes the Spanish why and disclosure, and adds the Amazon line for amazon offers', () => {
    const html = affiliateBlockHtml({ ...offer, network: 'amazon' }, 'es');
    expect(html).toContain('Hace la nómina de cuadrillas pequeñas.');
    expect(html).toContain(DISCLOSURE.es);
    expect(html).toContain(AMAZON_DISCLOSURE.es);
  });

  it('carries no script and no price', () => {
    const html = affiliateBlockHtml({ ...offer, network: 'amazon' }, 'en');
    expect(html).not.toMatch(/<script/i);
    expect(html).not.toMatch(/\$|€|price/i);
    expect(Object.keys(offer)).not.toContain('price');
  });

  it('throws on a locale the offer has no why for', () => {
    const english: AffiliateOffer<'en'> = { ...offer, why: { en: 'Fits.' } };
    expect(() => affiliateBlockHtml(english as AffiliateOffer, 'es')).toThrow(
      'payroll: no why for "es"',
    );
  });

  it('passes its own site check', () => {
    expect(affiliateLinkProblems('a.html', page(affiliateBlockHtml(offer, 'en')))).toEqual([]);
  });
});

describe('enabledOffers and offerProblems', () => {
  it('keeps only the enabled offers', () => {
    const off = { ...offer, id: 'off', enabled: false };
    expect(enabledOffers([offer, off]).map(({ id }) => id)).toEqual(['payroll']);
  });

  it('accepts https offers with unique ids and every locale', () => {
    expect(offerProblems([offer], ['en', 'es'])).toEqual([]);
  });

  it('names an http url, a repeated id, an empty name and a missing why', () => {
    expect(
      offerProblems(
        [
          { ...offer, url: 'http://example.com' },
          { ...offer, name: ' ', why: { en: 'Fits.' } as AffiliateOffer['why'] },
        ],
        ['en', 'es'],
      ),
    ).toEqual([
      'payroll: the url must be https, found "http://example.com"',
      'payroll: the id is used twice',
      'payroll: the name is empty',
      'payroll: no why for "es"',
    ]);
  });
});

describe('affiliateLinkProblems', () => {
  it('passes a page with no sponsored link', () => {
    expect(affiliateLinkProblems('a.html', page('<a href="/x" rel="noopener">x</a>'))).toEqual([]);
  });

  it('names a sponsored link outside the block', () => {
    expect(
      affiliateLinkProblems(
        'a.html',
        page('<a href="https://x.com" rel="sponsored noopener" target="_blank">x</a>'),
      ),
    ).toEqual([
      'a.html: the sponsored link to https://x.com must be inside a data-affiliate block',
    ]);
  });

  it('names a sponsored link with no href as going nowhere', () => {
    expect(affiliateLinkProblems('a.html', page('<a rel="sponsored">x</a>'))).toEqual([
      'a.html: the sponsored link to nowhere must be inside a data-affiliate block',
    ]);
  });

  it('names a block with no disclosure or an empty one', () => {
    const link = '<a href="https://x.com" rel="sponsored noopener" target="_blank">x</a>';
    const expected = [
      'a.html: the affiliate block of https://x.com must hold a non-empty disclosure',
    ];
    expect(
      affiliateLinkProblems('a.html', page(`<aside data-affiliate="block">${link}</aside>`)),
    ).toEqual(expected);
    expect(
      affiliateLinkProblems(
        'a.html',
        page(
          `<aside data-affiliate="block">${link}<small data-affiliate="disclosure"> </small></aside>`,
        ),
      ),
    ).toEqual(expected);
  });

  it('names a missing target and a missing noopener, reading rel as tokens', () => {
    expect(
      affiliateLinkProblems(
        'a.html',
        page(
          '<aside data-affiliate="block"><a href="https://x.com" rel="SPONSORED nofollow">x</a><small data-affiliate="disclosure">Paid.</small></aside>',
        ),
      ),
    ).toEqual([
      'a.html: the sponsored link to https://x.com must open with target="_blank"',
      'a.html: the sponsored link to https://x.com must have rel noopener',
    ]);
  });
});
