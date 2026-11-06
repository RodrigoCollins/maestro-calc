import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SITE } from './site.config.ts';

describe('Cuenta Horas site constants', () => {
  it('names the site and its canonical origin, English first', () => {
    expect(SITE).toEqual({
      name: 'Cuenta Horas',
      origin: 'https://cuentahoras.com',
      locales: ['en', 'es'],
      indexable: true,
      gaId: 'G-NNB8KG2TXZ',
      pinterestVerify: '8ed159206fe46e99ba11ac3ac0b8bff3',
      indexNowKey: 'dd860e1e00fb82df0feac833e84e8677',
    });
  });

  // pinterest-verify: the domain claim of the Pinterest profile, one meta tag in the head of every page
  it('names the Pinterest domain verification in one meta tag of the layout head', () => {
    const layout = readFileSync(
      resolve(import.meta.dirname, 'components/SiteLayout.astro'),
      'utf8',
    );
    const head = /<head>([\s\S]*)<\/head>/.exec(layout)?.[1] ?? '';
    expect(head.match(/name="p:domain_verify"/g)).toHaveLength(1);
    expect(head).toContain('<meta name="p:domain_verify" content={SITE.pinterestVerify} />');
    expect(SITE.pinterestVerify).toMatch(/^[0-9a-f]{32}$/);
  });
});
