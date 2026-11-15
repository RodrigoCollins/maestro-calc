import { describe, expect, it } from 'vitest';
import { ABOUT } from './about.ts';
import {
  BYLINE_TEXTS,
  bylineOf,
  checkedText,
  EDITORIAL,
  PRIMARY_SOURCES,
  SOURCES_ID,
} from './editorial.ts';
import { PRIVACY } from './privacy.ts';

describe('the byline', () => {
  it('credits the editorial team at the policy, never a person', () => {
    const byline = bylineOf({});
    expect(byline.by).toBe('By');
    expect(byline.team).toEqual({
      href: '/editorial-policy',
      label: 'the Bowl Figures editorial team',
    });
    expect(byline.reviewed).toBeUndefined();
    expect(byline.sources).toBeUndefined();
  });

  it('gives the review day only when the page has one, and the sources link only when asked', () => {
    const byline = bylineOf({ checked: '2026-11-07', sources: true });
    expect(byline.reviewed).toEqual({
      label: 'Reviewed',
      datetime: '2026-11-07',
      text: 'Nov 7, 2026',
    });
    expect(byline.sources).toEqual({ href: `#${SOURCES_ID}`, label: BYLINE_TEXTS.sources });
    expect(SOURCES_ID).toBe('sources');
  });

  it('writes a day in English', () => {
    expect(checkedText('2027-01-05')).toBe('Jan 5, 2027');
  });

  it('writes a day in German, the month in full', () => {
    expect(checkedText('2027-01-05', 'de')).toBe('5. Januar 2027');
    expect(checkedText('2026-11-08', 'de')).toBe('8. November 2026');
    expect(checkedText('2026-03-31', 'de')).toBe('31. März 2026');
  });

  it('credits the German editorial team at the German policy, in German', () => {
    expect(bylineOf({ checked: '2026-11-08', sources: true, lang: 'de' })).toEqual({
      by: 'Von der',
      team: { href: '/de/redaktionelle-grundsaetze', label: 'Redaktion Bowl Figures' },
      reviewed: { label: 'Geprüft am', datetime: '2026-11-08', text: '8. November 2026' },
      sources: { href: '#sources', label: 'Quellen' },
    });
  });
});

describe('the text pages', () => {
  const pages = [EDITORIAL, ABOUT, PRIVACY];

  it('keep titles and descriptions where a result shows them whole', () => {
    for (const page of pages) {
      expect(page.title.length).toBeLessThanOrEqual(65);
      expect(page.title.endsWith(' | Bowl Figures')).toBe(true);
      expect(page.description.length).toBeGreaterThanOrEqual(50);
      expect(page.description.length).toBeLessThanOrEqual(160);
    }
  });

  it('give every section its own id', () => {
    for (const page of pages) {
      const ids = page.sections.map(({ id }) => id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('name Merck, AAHA and AAFCO as the only sources, each with an address', () => {
    expect(PRIMARY_SOURCES.map(({ url }) => new URL(url).hostname)).toEqual([
      'www.merckvetmanual.com',
      'www.aaha.org',
      'www.aafco.org',
    ]);
  });

  it('say the figures are not veterinary advice', () => {
    expect(JSON.stringify(EDITORIAL)).toContain('Not veterinary advice');
    expect(JSON.stringify(EDITORIAL)).toContain('call a veterinarian or a poison line');
  });

  it('disclose paid links in the policy: the label, the commission and the Amazon statement', () => {
    const affiliate = EDITORIAL.sections
      .filter(({ id }) => id === 'affiliate')
      .flatMap(({ paragraphs }) => paragraphs)
      .join('\n');
    expect(affiliate).toContain('"Paid link"');
    expect(affiliate).toContain('commission at no extra cost to you');
    expect(affiliate).toContain('never changes a calculator result');
    expect(affiliate).toContain('As an Amazon Associate we earn from qualifying purchases');
  });

  it('say the values entered are never sent', () => {
    expect(JSON.stringify(PRIVACY)).toContain('never sent to us');
  });
});
