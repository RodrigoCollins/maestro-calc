import { describe, expect, it } from 'vitest';
import { llmsTxt } from './llms.ts';
import { ROUTES } from './routes.ts';

describe('llmsTxt', () => {
  const text = llmsTxt();

  it('starts with the site name and a summary in the llmstxt.org shape', () => {
    expect(text.startsWith('# Bowl Figures\n\n> Free dog and cat feeding calculators')).toBe(true);
    expect(text).toContain('Merck Veterinary Manual');
    expect(text.endsWith('\n')).toBe(true);
  });

  it('links every page of the site but the home and the privacy page, by canonical address', () => {
    for (const { path, id } of ROUTES) {
      if (id === 'home' || id === 'privacy') continue;
      expect(text, path).toContain(`(https://bowlfigures.com${path})`);
    }
  });

  it('names three sections', () => {
    expect(text.match(/^## /gm)).toHaveLength(3);
  });

  it('says every chocolate result tells the reader to call', () => {
    expect(text).toContain('call a veterinarian or a poison line');
  });
});
