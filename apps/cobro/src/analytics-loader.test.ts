import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

const source = readFileSync(resolve(import.meta.dirname, '../public/analytics.js'), 'utf8');

/** Runs the loader in a bare context on `hostname`; returns the `window` it leaves behind. */
const run = (attrs: Readonly<Record<string, string>>, hostname = 'poolfigures.com') => {
  const window: Record<string, unknown> = {};
  runInNewContext(source, {
    window,
    location: { hostname, origin: `https://${hostname}`, pathname: '/', search: '' },
    navigator: {},
    document: {
      readyState: 'loading',
      referrer: '',
      currentScript: { getAttribute: (name: string) => attrs[name] ?? null },
      createElement: () => ({ async: false, src: '' }),
      head: { appendChild: () => undefined },
      addEventListener: () => undefined,
    },
    addEventListener: () => undefined,
    setTimeout: () => undefined,
    Date,
  });
  return window;
};

const TAG = { 'data-ga': 'G-TEST1', 'data-host': 'poolfigures.com' };

describe('the analytics loader', () => {
  it('does nothing off the production host or without a measurement id', () => {
    for (const window of [run(TAG, '127.0.0.1'), run({ 'data-host': 'poolfigures.com' })]) {
      expect(window).toEqual({});
    }
  });

  it('sets the consent defaults first: no ads, analytics denied in the EEA, the UK and Switzerland', () => {
    const [general, regional] = (run(TAG)['dataLayer'] as ArrayLike<unknown>[]).map((entry) =>
      Array.from(entry),
    );
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
  });

  // analytics-events: the calculator scripts send their usage events through this gtag
  it('leaves gtag on window, queueing on the same data layer', () => {
    const window = run(TAG);
    const gtag = window['gtag'] as (...args: unknown[]) => void;
    expect(typeof gtag).toBe('function');
    gtag('event', 'calc_action', { calc_id: 'pool-ph' });
    const last = (window['dataLayer'] as ArrayLike<unknown>[]).at(-1);
    expect(Array.from(last ?? [])).toEqual(['event', 'calc_action', { calc_id: 'pool-ph' }]);
  });
});
