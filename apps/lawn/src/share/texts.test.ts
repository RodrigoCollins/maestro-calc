import { describe, expect, it } from 'vitest';
import { SITE } from '../site.config.ts';
import { shareOf, SHARE_TEXT } from './texts.ts';

describe('shareOf', () => {
  it('names the page and links its canonical address', () => {
    const share = shareOf('Sod Calculator | Lawn Figures', '/sod-calculator');
    const url = `${SITE.origin}/sod-calculator`;
    expect(share.label).toBe('Share on WhatsApp');
    expect(SHARE_TEXT.label).toBe(share.label);
    // the accessible name starts with the visible text (WCAG 2.5.3) and names the page
    expect(share.ariaLabel).toBe('Share on WhatsApp: Sod Calculator');
    expect(share.text).toBe('Sod Calculator, on Lawn Figures:');
    expect(share.href).toBe(`https://wa.me/?text=${encodeURIComponent(`${share.text}\n${url}`)}`);
  });

  it('never carries the site name twice', () => {
    expect(shareOf('Frost Dates in Texas | Lawn Figures', '/frost-dates/texas').text).toBe(
      'Frost Dates in Texas, on Lawn Figures:',
    );
  });
});
