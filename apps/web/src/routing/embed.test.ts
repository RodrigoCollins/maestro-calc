import { describe, expect, it } from 'vitest';
import { EMBEDS, embedPathOf } from './embed.ts';
import { LOCALES, pathOf } from './routes.ts';
import { CALCULATOR_PAGES } from './templates.ts';

describe('embed routes (embed › Embed pages)', () => {
  it('puts each calculator page under /embed with its own path', () => {
    expect(embedPathOf('concrete', 'en')).toBe('/embed/concrete-calculator');
    expect(embedPathOf('concrete', 'es')).toBe('/embed/es/calculadora-de-concreto');
  });

  it('has one embed per calculator page and language, derived from the table', () => {
    expect(EMBEDS).toHaveLength(CALCULATOR_PAGES.length * LOCALES.length);
    expect(EMBEDS).toEqual(
      CALCULATOR_PAGES.flatMap((id) =>
        LOCALES.map((locale) => ({
          id,
          locale,
          path: `/embed${pathOf(id, locale)}`,
          page: pathOf(id, locale),
          other: `/embed${pathOf(id, locale === 'en' ? 'es' : 'en')}`,
        })),
      ),
    );
  });
});
