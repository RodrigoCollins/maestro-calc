import { describe, expect, it } from 'vitest';
import { headOf } from './head.ts';

const text = { title: 'Sod Calculator | Lawn Figures', description: 'Sod for your lawn.' };

describe('headOf', () => {
  it('gives an indexable page on an indexable site its canonical and no robots line', () => {
    const head = headOf('/sod-calculator', text, true, {
      origin: 'https://x.test',
      indexable: true,
    });
    expect(head.canonical).toBe('https://x.test/sod-calculator');
    expect(head.robots).toBeUndefined();
  });

  it('keeps every page out of search while the site is closed, with no canonical', () => {
    const head = headOf('/sod-calculator', text, true, {
      origin: 'https://x.test',
      indexable: false,
    });
    expect(head).toMatchObject({ robots: 'noindex' });
    expect(head.canonical).toBeUndefined();
  });

  it('keeps the 404 out of search on an indexable site', () => {
    const head = headOf('/404', text, false, { origin: 'https://x.test', indexable: true });
    expect(head).toMatchObject({ robots: 'noindex' });
    expect(head.canonical).toBeUndefined();
  });

  it('writes the link preview on the site origin', () => {
    const { preview } = headOf('/', text, true, { origin: 'https://x.test', indexable: true });
    expect(preview['og:image']).toBe('https://x.test/og.png');
    expect(preview['og:title']).toBe(text.title);
  });

  it('reads the site constants by default: open since launch', () => {
    expect(headOf('/', text, true).robots).toBeUndefined();
  });
});
