import { describe, expect, it } from 'vitest';
import { PRIVACY_TEXTS } from './texts.ts';

const sectionOf = (lang: 'en' | 'es', id: string): string =>
  (PRIVACY_TEXTS[lang].sections.find((section) => section.id === id)?.paragraphs ?? []).join('\n');

// what the site keeps in the browser: the time card's saved week (`src/time-card/saved.ts`)
describe('the privacy page', () => {
  it('says the time card keeps the week in this browser, never sends it, and how to clear it', () => {
    const en = sectionOf('en', 'calculators');
    expect(en).toMatch(/time card keeps your last week in your browser's local storage/);
    expect(en).toMatch(/never sent/);
    expect(en).toMatch(/Clear my week/);
    const es = sectionOf('es', 'calculadoras');
    expect(es).toMatch(/tarjeta de horas guarda tu última semana en el almacenamiento local/);
    expect(es).toMatch(/nunca se envía/);
    expect(es).toMatch(/Borrar mi semana/);
  });
});
