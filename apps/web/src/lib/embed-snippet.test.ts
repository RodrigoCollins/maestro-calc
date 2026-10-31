import { describe, expect, it } from 'vitest';
import { EMBEDS } from '../routing/embed.ts';
import { snippetOf, snippetsFor } from './embed-snippet.ts';

const concrete = EMBEDS.find(({ id, locale }) => id === 'concrete' && locale === 'en');

describe('embed snippets (embed › The snippet)', () => {
  it('frames the embed and credits the full page with a visible link outside the frame', () => {
    expect(concrete).toBeDefined();
    if (concrete === undefined) return;
    expect(snippetOf(concrete, 'Concrete Calculator', 'Concrete Calculator by Maestro Calc')).toBe(
      [
        '<iframe src="https://maestrocalc.com/embed/concrete-calculator" title="Concrete Calculator" width="100%" height="900" style="border:0" loading="lazy" allow="clipboard-write"></iframe>',
        '<p><a href="https://maestrocalc.com/concrete-calculator">Concrete Calculator by Maestro Calc</a></p>',
      ].join('\n'),
    );
  });

  it('escapes what it writes into attributes and text', () => {
    if (concrete === undefined) return;
    expect(snippetOf(concrete, 'A "B" & <C>', 'x & y')).toContain(
      'title="A &quot;B&quot; &amp; &lt;C&gt;"',
    );
    expect(snippetOf(concrete, 'A', 'x & y')).toContain('>x &amp; y</a>');
  });

  it('lists one snippet per calculator in the page language, named by the calculator', () => {
    const spanish = snippetsFor('es');
    const embed = EMBEDS.find(({ id, locale }) => id === 'concrete' && locale === 'es');
    expect(spanish).toHaveLength(EMBEDS.length / 2);
    expect(embed).toBeDefined();
    if (embed === undefined) return;
    expect(spanish[0]).toEqual({
      id: 'concrete',
      name: 'Calculadora de Concreto',
      code: snippetOf(embed, 'Calculadora de Concreto', 'Calculadora de Concreto de Maestro Calc'),
    });
  });
});
