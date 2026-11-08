import { describe, expect, it } from 'vitest';
import { ARTICLES } from './articles.ts';

const textOf = (lang: 'es' | 'en') =>
  ARTICLES[lang].privacy.blocks.flatMap(({ paragraphs = [] }) => paragraphs).join('\n');

// The loader (public/analytics.js) denies analytics storage in these regions and for a GPC
// signal, and ad storage everywhere: the page says the same in both languages.
describe('the Spanish privacy page', () => {
  const text = textOf('es');

  it('describes the Consent Mode defaults of the analytics loader', () => {
    expect(text).toContain('Google Analytics');
    expect(text).toContain('el Espacio Económico Europeo, el Reino Unido y Suiza');
    expect(text).toContain('Global Privacy Control');
    expect(text).toContain(
      'El almacenamiento publicitario y la personalización de anuncios están desactivados en todas partes',
    );
  });

  it('says the values you type never reach analytics', () => {
    expect(text).toContain('sin los valores que escribiste');
    expect(text).toMatch(/Nada de lo que escribes[^.]*se nos envía ni se envía a Google Analytics/);
  });

  it('says the site has no advertising', () => {
    expect(text).toContain('El sitio no tiene publicidad');
  });
});

describe('the English privacy page', () => {
  const text = textOf('en');

  it('describes the Consent Mode defaults of the analytics loader', () => {
    expect(text).toContain('Google Analytics');
    expect(text).toContain('the European Economic Area, the United Kingdom and Switzerland');
    expect(text).toContain('Global Privacy Control');
    expect(text).toContain('Advertising storage and ad personalization are off everywhere');
  });

  it('says the values you type never reach analytics', () => {
    expect(text).toContain('without the values you typed');
    expect(text).toMatch(/Nothing you type[^.]*is sent to us or to Google Analytics/);
  });

  it('says the site has no advertising', () => {
    expect(text).toContain('The site has no advertising');
  });
});
