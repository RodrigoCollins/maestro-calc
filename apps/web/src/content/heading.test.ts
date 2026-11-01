import { describe, expect, it } from 'vitest';
import { headingOf } from './heading.ts';

describe('headingOf', () => {
  it('returns the text of the first level-one heading', () => {
    expect(headingOf('\n# Concrete: bags or a truck?\n\nText.\n\n## Part\n')).toBe(
      'Concrete: bags or a truck?',
    );
  });

  it('skips deeper headings before it and trims the text', () => {
    expect(headingOf('## Not this\n#   Cómo medir un techo  \n')).toBe('Cómo medir un techo');
  });

  it('throws when the body has no level-one heading', () => {
    expect(() => headingOf('Text only.\n## Part\n')).toThrow('no level-one heading');
  });
});
