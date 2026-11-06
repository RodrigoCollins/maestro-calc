import { describe, expect, it } from 'vitest';
import { OVERTIME_PATHS, OVERTIME_TEXTS } from '../overtime/texts.ts';
import { SITE } from '../site.config.ts';
import { shareOf, SHARE_TEXTS } from './texts.ts';

describe('shareOf', () => {
  it.each([
    ['en', 'Share on WhatsApp', 'on Cuenta Horas'],
    ['es', 'Compartir por WhatsApp', 'en Cuenta Horas'],
  ] as const)('%s: names the page and links its canonical address', (lang, label, words) => {
    const share = shareOf(lang, OVERTIME_TEXTS[lang].title, OVERTIME_PATHS[lang]);
    const name = OVERTIME_TEXTS[lang].title.replace(/\s*\|\s*Cuenta Horas$/, '');
    const url = `${SITE.origin}${OVERTIME_PATHS[lang]}`;
    expect(share.label).toBe(label);
    expect(SHARE_TEXTS[lang].label).toBe(label);
    // the accessible name starts with the visible text (WCAG 2.5.3) and names the page
    expect(share.ariaLabel).toBe(`${label}: ${name}`);
    expect(share.text).toBe(`${name}, ${words}:`);
    expect(share.href).toBe(`https://wa.me/?text=${encodeURIComponent(`${share.text}\n${url}`)}`);
  });

  it('never carries the site name twice', () => {
    const share = shareOf('en', 'Texas | Cuenta Horas', '/states/texas');
    expect(share.text).toBe('Texas, on Cuenta Horas:');
  });
});
