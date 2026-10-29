import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import { fromRoot } from '../contract/root.ts';

const source = readFileSync(fromRoot('apps/web/public/analytics.js'), 'utf8');

interface Run {
  readonly dataLayer: unknown[] | undefined;
  readonly appended: string[];
  /** Fires the page's load event and the idle callback, as the browser would. */
  readonly finish: () => void;
}

/** Runs the loader in a bare context: a tag with `attrs`, on `hostname`, with `gpc` as the signal. */
const run = (
  attrs: Readonly<Record<string, string>>,
  { hostname = 'maestrocalc.com', gpc = false } = {},
): Run => {
  const appended: string[] = [];
  const pending: (() => void)[] = [];
  const window: Record<string, unknown> = {};
  const context = {
    window,
    location: {
      hostname,
      origin: `https://${hostname}`,
      pathname: '/concrete-calculator',
      search: '?v=1&l=240',
    },
    navigator: gpc ? { globalPrivacyControl: true } : {},
    document: {
      readyState: 'loading',
      currentScript: { getAttribute: (name: string) => attrs[name] ?? null },
      createElement: () => ({ async: false, src: '' }),
      head: { appendChild: (script: { src: string }) => appended.push(script.src) },
    },
    addEventListener: (_type: string, listener: () => void) => pending.push(listener),
    setTimeout: (callback: () => void) => pending.push(callback),
    Date,
  };
  runInNewContext(source, context);
  return {
    get dataLayer() {
      return window['dataLayer'] as unknown[] | undefined;
    },
    appended,
    finish: () => {
      while (pending.length > 0) pending.shift()?.();
    },
  };
};

const TAG = { 'data-gtm': 'GTM-TEST1', 'data-host': 'maestrocalc.com' };

/** The consent calls of the data layer, as plain arrays (gtag queues `arguments` objects). */
const consents = (dataLayer: unknown[] | undefined): unknown[][] =>
  (dataLayer ?? [])
    .map((entry) => Array.from(entry as ArrayLike<unknown>))
    .filter((entry) => entry[0] === 'consent');

describe('the analytics loader (analytics-gtm)', () => {
  it('does nothing off the production host or without a container id', () => {
    for (const loaded of [
      run(TAG, { hostname: '127.0.0.1' }),
      run(TAG, { hostname: 'feat-x.maestro-calc.workers.dev' }),
      run({ 'data-host': 'maestrocalc.com' }),
    ]) {
      loaded.finish();
      expect(loaded.dataLayer).toBeUndefined();
      expect(loaded.appended).toEqual([]);
    }
  });

  it('sets the consent defaults first: no ads, analytics denied in the EEA, the UK and Switzerland', () => {
    const [general, regional] = consents(run(TAG).dataLayer);
    expect(general).toEqual([
      'consent',
      'default',
      {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'granted',
      },
    ]);
    expect(regional?.[2]).toMatchObject({ analytics_storage: 'denied' });
    const { region } = regional?.[2] as { region: string[] };
    for (const code of ['DE', 'FR', 'ES', 'IT', 'IE', 'GB', 'CH', 'NO', 'IS', 'LI']) {
      expect(region).toContain(code);
    }
    // the 27 EU members, the three other EEA states, the United Kingdom and Switzerland
    expect(new Set(region).size).toBe(32);
    expect(region).not.toContain('US');
  });

  // the calculator values live in the query: the address offered to the GA4 tag leaves it out
  it('offers the address without its query for the GA4 tag', () => {
    expect(run(TAG).dataLayer).toContainEqual({
      page_location_clean: 'https://maestrocalc.com/concrete-calculator',
    });
  });

  it('denies analytics everywhere for a Global Privacy Control signal', () => {
    const [general] = consents(run(TAG, { gpc: true }).dataLayer);
    expect(general?.[2]).toMatchObject({ analytics_storage: 'denied', ad_storage: 'denied' });
  });

  it('loads the container only after the page load, from the Tag Manager host', () => {
    const loaded = run(TAG);
    expect(loaded.appended).toEqual([]);
    loaded.finish();
    expect(loaded.appended).toEqual(['https://www.googletagmanager.com/gtm.js?id=GTM-TEST1']);
    expect(
      loaded.dataLayer?.some((entry) => (entry as { event?: string }).event === 'gtm.js'),
    ).toBe(true);
  });
});
