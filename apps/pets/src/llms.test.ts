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

  it('names three sections, and no German page while German is closed', () => {
    expect(text.match(/^## /gm)).toHaveLength(3);
    expect(text).not.toContain('/de');
  });

  it('adds the German pages as a fourth section once German is open', () => {
    const open = llmsTxt(true);
    expect(open.match(/^## /gm)).toHaveLength(4);
    expect(open).toContain('## Auf Deutsch (German)');
    for (const { id, de } of ROUTES) {
      if (de === undefined || id === 'home' || id === 'privacy') continue;
      expect(open, de).toContain(`(https://bowlfigures.com${de})`);
    }
  });

  it('says every chocolate result tells the reader to call', () => {
    expect(text).toContain('call a veterinarian or a poison line');
  });
});
