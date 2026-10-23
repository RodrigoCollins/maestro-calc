import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { parse } from 'node-html-parser';
import { describe, expect, it } from 'vitest';
import SkipLink from './SkipLink.astro';

const render = async (label: string) =>
  parse(await (await AstroContainer.create()).renderToString(SkipLink, { props: { label } }));

describe('SkipLink (site-shell › Skip link)', () => {
  it('links to #main with the label it is given', async () => {
    const link = (await render('Skip to main content')).querySelector('a');
    expect(link?.getAttribute('href')).toBe('#main');
    expect(link?.text).toBe('Skip to main content');
    expect(link?.classList.contains('skip-link')).toBe(true);
  });

  it('renders another label verbatim', async () => {
    expect((await render('Saltar al contenido principal')).querySelector('a')?.text).toBe(
      'Saltar al contenido principal',
    );
  });
});
