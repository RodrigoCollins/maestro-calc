import { describe, expect, it } from 'vitest';
import { renderComponent } from '../__testing__/render-component.ts';
import Wordmark from './Wordmark.astro';

describe('Wordmark (site-shell › Header)', () => {
  it('is a link to the home page of the locale with the brand name', async () => {
    for (const href of ['/', '/es']) {
      const link = (await renderComponent(Wordmark, { href })).querySelector('a');
      expect(link?.getAttribute('href')).toBe(href);
      expect(link?.text).toBe('Maestro Calc');
      expect(link?.classList.contains('wordmark')).toBe(true);
    }
  });
});
