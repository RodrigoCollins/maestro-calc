import { describe, expect, it } from 'vitest';
import { PRIVACY } from './privacy.ts';

const text = PRIVACY.sections.flatMap(({ paragraphs }) => paragraphs).join('\n');

// The loader (public/analytics.js) denies analytics storage in these regions and for a GPC
// signal, and ad storage everywhere: the page says the same.
describe('the privacy page', () => {
  it('describes the Consent Mode defaults of the analytics loader', () => {
    expect(text).toContain('Google Analytics');
    expect(text).toContain('the European Economic Area, the United Kingdom and Switzerland');
    expect(text).toContain('Global Privacy Control');
    expect(text).toContain('Advertising storage and ad personalization are off everywhere');
  });

  it('says the values you type never reach analytics', () => {
    expect(text).toContain('without the values you typed');
    expect(text).toMatch(/Nothing you type[^.]*is sent to us or to Google Analytics/);
  });

  it('says the site has no advertising', () => {
    expect(text).toContain('The site has no advertising');
  });

  it('no longer says analytics is off or that the site sets no cookies', () => {
    expect(JSON.stringify(PRIVACY)).not.toContain('Until then no analytics runs');
    expect(JSON.stringify(PRIVACY)).not.toContain('no cookies');
  });
});
