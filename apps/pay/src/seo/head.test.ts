import { describe, expect, it } from 'vitest';
import { embedHeadOf, headOf } from './head.ts';

const paths = { en: '/time-card-calculator', es: '/es/calculadora-de-horas-trabajadas' };
const text = { title: 'T', description: 'D' };
const site = { origin: 'https://x.test', indexable: true };

describe('headOf', () => {
  it('gives a page its canonical and leaves it indexable', () => {
    expect(headOf(paths, 'es', text, site)).toMatchObject({
      canonical: 'https://x.test/es/calculadora-de-horas-trabajadas',
    });
    expect(headOf(paths, 'es', text, site)).not.toHaveProperty('robots');
  });
});

describe('embedHeadOf', () => {
  // an embed is the full page in another site's frame: search sees the full page only
  it('points an embed at the full page it embeds and keeps it out of search', () => {
    expect(embedHeadOf(paths, 'en', text, site)).toMatchObject({
      canonical: 'https://x.test/time-card-calculator',
      robots: 'noindex',
    });
  });

  it('switches language to the other embed', () => {
    expect(embedHeadOf(paths, 'en', text, site).other).toBe(
      '/embed/es/calculadora-de-horas-trabajadas',
    );
    expect(embedHeadOf(paths, 'es', text, site).other).toBe('/embed/time-card-calculator');
  });
});
