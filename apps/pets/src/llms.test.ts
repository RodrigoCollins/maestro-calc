import { describe, expect, it } from 'vitest';
import { llmsTxt } from './llms.ts';
import { ROUTES } from './routes.ts';

describe('llmsTxt', () => {
  const text = llmsTxt(false, false, false);

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

  it('names three sections, and no German or French page while both are closed', () => {
    expect(text.match(/^## /gm)).toHaveLength(3);
    expect(text).not.toContain('/de');
    expect(text).not.toContain('/fr/');
  });

  it('adds the German pages as a fourth section once German is open', () => {
    const open = llmsTxt(true, false, false);
    expect(open.match(/^## /gm)).toHaveLength(4);
    expect(open).toContain('## Auf Deutsch (German)');
    for (const { id, de } of ROUTES) {
      if (de === undefined || id === 'home' || id === 'privacy') continue;
      expect(open, de).toContain(`(https://bowlfigures.com${de})`);
    }
  });

  it('adds the French pages as their own section once French is open', () => {
    const open = llmsTxt(false, true, false);
    expect(open.match(/^## /gm)).toHaveLength(4);
    expect(open).toContain('## En français (French)');
    expect(open).not.toContain('## Auf Deutsch');
    for (const { id, fr } of ROUTES) {
      if (fr === undefined || id === 'home' || id === 'privacy') continue;
      expect(open, fr).toContain(`(https://bowlfigures.com${fr})`);
    }
    expect(llmsTxt(true, true, false).match(/^## /gm)).toHaveLength(5);
  });

  it('says every chocolate result tells the reader to call', () => {
    expect(text).toContain('call a veterinarian or a poison line');
  });
});

describe('llmsTxt, Spanish', () => {
  it('ships with the Spanish pages as their own section, German and French still out', () => {
    const shipped = llmsTxt();
    expect(shipped.match(/^## /gm)).toHaveLength(4);
    expect(shipped).toContain('## En español (Spanish)');
    expect(shipped).not.toContain('/de/');
    expect(shipped).not.toContain('/fr/');
    for (const { id, es } of ROUTES) {
      if (es === undefined || id === 'home' || id === 'privacy') continue;
      expect(shipped, es).toContain(`(https://bowlfigures.com${es})`);
    }
    expect(llmsTxt(true, true, true).match(/^## /gm)).toHaveLength(6);
  });
});
