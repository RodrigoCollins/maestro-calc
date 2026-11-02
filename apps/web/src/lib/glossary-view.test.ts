import { GLOSSARY, GLOSSARY_GROUPS } from '@maestro-calc/i18n/glossary';
import { describe, expect, it } from 'vitest';
import { glossaryView } from './glossary-view.ts';

// spec: i18n-catalog › [ICW24] the public glossary lists every entry by trade
describe('glossary view (i18n-catalog › Construction glossary)', () => {
  it('lists every entry once, in its group, groups in page order', () => {
    for (const locale of ['en', 'es'] as const) {
      const view = glossaryView(locale);
      expect(view.groups.map(({ id }) => id)).toEqual([...GLOSSARY_GROUPS]);
      expect(view.groups.flatMap(({ rows }) => rows)).toHaveLength(GLOSSARY.length);
    }
  });

  it('leads with the term of the page language and defines it in that language', () => {
    const en = glossaryView('en').groups[0]?.rows[1];
    const es = glossaryView('es').groups[0]?.rows[1];
    expect(en).toEqual({
      term: 'pour',
      other: 'colado',
      definition: 'Placing fresh concrete in its forms, and the job itself.',
    });
    expect(es).toEqual({
      term: 'colado',
      other: 'pour',
      definition: 'Colocar el concreto fresco en su cimbra, y también el trabajo en sí.',
    });
  });

  it('names the groups and the columns in the page language', () => {
    expect(glossaryView('en').groups[0]?.label).toBe('Concrete');
    expect(glossaryView('es').groups[6]?.label).toBe('El negocio');
    expect(glossaryView('en').columns).toEqual(['English', 'Spanish', 'What it means']);
    expect(glossaryView('es').columns).toEqual(['Español', 'Inglés', 'Qué significa']);
  });
});
