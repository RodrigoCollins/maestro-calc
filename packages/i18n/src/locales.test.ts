import { describe, expect, it } from 'vitest';
import { defaultLocale, locales } from './locales.ts';

describe('locales', () => {
  // spec: i18n-catalog › Locale list
  it('lists exactly English and Spanish, in order', () => {
    expect(locales).toEqual(['en', 'es']);
  });

  it('uses English as the default locale and it is a supported locale', () => {
    expect(defaultLocale).toBe('en');
    expect(locales).toContain(defaultLocale);
  });
});
