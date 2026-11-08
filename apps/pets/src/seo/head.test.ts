import { describe, expect, it } from 'vitest';
import { headOf } from './head.ts';

const text = { title: 'T | Bowl Figures', description: 'D' };
const open = { origin: 'https://bowlfigures.com', indexable: true };
const closed = { origin: 'https://bowlfigures.com', indexable: false };

describe('headOf', () => {
  it('gives an indexed page of an open site its canonical and no robots line', () => {
    const head = headOf('/dog-food-calculator', text, true, open);
    expect(head.canonical).toBe('https://bowlfigures.com/dog-food-calculator');
    expect(head.robots).toBeUndefined();
    expect(head.preview['og:image']).toBe('https://bowlfigures.com/og.png');
  });

  it('gives the home the bare origin as its canonical', () => {
    expect(headOf('/', text, true, open).canonical).toBe('https://bowlfigures.com/');
  });

  it('keeps the 404 out of the index even on an open site', () => {
    const head = headOf('/404', text, false, open);
    expect(head).toMatchObject({ robots: 'noindex' });
    expect(head.canonical).toBeUndefined();
  });

  it('keeps every page out of the index while the site is closed', () => {
    const head = headOf('/dog-food-calculator', text, true, closed);
    expect(head).toMatchObject({ robots: 'noindex' });
    expect(head.canonical).toBeUndefined();
  });

  it('ships open by default', () => {
    expect(headOf('/', text, true).robots).toBeUndefined();
  });
});
