import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

const source = readFileSync(resolve(import.meta.dirname, '../public/analytics.js'), 'utf8');

interface Run {
  readonly dataLayer: unknown[] | undefined;
  /** The `gtag` the loader left on `window` for the calculator scripts. */
  readonly gtag: unknown;
  /** Clicks `target` (an element with `closest`), as the browser would deliver it to the document. */
  readonly click: (target: unknown) => void;
  readonly appended: string[];
  /** Fires the page's load event and the idle callback, as the browser would. */
  readonly finish: () => void;
}

/** Runs the loader in a bare context: a tag with `attrs`, on `hostname`, with `gpc` as the signal. */
const run = (
  attrs: Readonly<Record<string, string>>,
  {
    hostname = 'cuentahoras.com',
    gpc = false,
    search = '?d=0900-1700&r=20',
    pathname = '/time-card-calculator',
    modules = 0,
  } = {},
): Run => {
  const appended: string[] = [];
  const clicks: ((event: { target: unknown }) => void)[] = [];
  const pending: (() => void)[] = [];
  const window: Record<string, unknown> = {};
  const context = {
    window,
    location: {
      hostname,
      origin: `https://${hostname}`,
      pathname,
      search,
    },
    navigator: gpc ? { globalPrivacyControl: true } : {},
    document: {
      readyState: 'loading',
      referrer: 'https://cuentahoras.com/es/calculadora-de-horas-trabajadas?r=20#x',
      currentScript: { getAttribute: (name: string) => attrs[name] ?? null },
      createElement: () => ({ async: false, src: '' }),
      head: { appendChild: (script: { src: string }) => appended.push(script.src) },
      querySelectorAll: (selector: string) =>
        selector === 'script[type=module]' ? Array.from({ length: modules }) : [],
      addEventListener: (type: string, listener: (event: { target: unknown }) => void) => {
        if (type === 'click') clicks.push(listener);
      },
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
    get gtag() {
      return window['gtag'];
    },
    click: (target) => {
      for (const listener of clicks) listener({ target });
    },
    appended,
    finish: () => {
      while (pending.length > 0) pending.shift()?.();
    },
  };
};

const TAG = { 'data-ga': 'G-TEST1', 'data-host': 'cuentahoras.com' };

/** The gtag calls of the data layer named `command`, as plain arrays (gtag queues `arguments`). */
const calls = (dataLayer: unknown[] | undefined, command: string): unknown[][] =>
  (dataLayer ?? [])
    .map((entry) => Array.from(entry as ArrayLike<unknown>))
    .filter((entry) => entry[0] === command);

describe('the analytics loader', () => {
  it('does nothing off the production host or without a measurement id', () => {
    for (const loaded of [
      run(TAG, { hostname: '127.0.0.1' }),
      run(TAG, { hostname: 'feat-x.cuenta-horas.workers.dev' }),
      run({ 'data-host': 'cuentahoras.com' }),
    ]) {
      loaded.finish();
      expect(loaded.dataLayer).toBeUndefined();
      expect(loaded.gtag).toBeUndefined();
      expect(loaded.appended).toEqual([]);
    }
  });

  it('sets the consent defaults first: no ads, analytics denied in the EEA, the UK and Switzerland', () => {
    const [general, regional] = calls(run(TAG).dataLayer, 'consent');
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
    // the 27 EU members, the three other EEA states, the United Kingdom and Switzerland
    expect(new Set(region).size).toBe(32);
    expect(region).toContain('GB');
    expect(region).not.toContain('US');
  });

  it('denies analytics everywhere for a Global Privacy Control signal', () => {
    const [general] = calls(run(TAG, { gpc: true }).dataLayer, 'consent');
    expect(general?.[2]).toMatchObject({ analytics_storage: 'denied', ad_storage: 'denied' });
  });

  // the hours and the pay live in the query: the page and the referrer reach GA4 without it
  it('configures the measurement id with the address and the referrer without their query', () => {
    expect(calls(run(TAG).dataLayer, 'config')).toEqual([
      [
        'config',
        'G-TEST1',
        {
          page_location: 'https://cuentahoras.com/time-card-calculator',
          page_referrer: 'https://cuentahoras.com/es/calculadora-de-horas-trabajadas',
        },
      ],
    ]);
  });

  it('keeps only the utm_ parameters of the address, in their order, for campaign attribution', () => {
    const [config] = calls(
      run(TAG, { search: '?utm_source=pinterest&r=20&utm_campaign=p01&utmx=1' }).dataLayer,
      'config',
    );
    expect(config?.[2]).toMatchObject({
      page_location:
        'https://cuentahoras.com/time-card-calculator?utm_source=pinterest&utm_campaign=p01',
    });
  });

  it('loads gtag.js only after the page load, from the Google tag host', () => {
    const loaded = run(TAG);
    expect(loaded.appended).toEqual([]);
    loaded.finish();
    expect(loaded.appended).toEqual(['https://www.googletagmanager.com/gtag/js?id=G-TEST1']);
  });

  // analytics-events: the calculator scripts send their usage events through this gtag
  it('leaves gtag on window, queueing on the same data layer', () => {
    const loaded = run(TAG);
    expect(typeof loaded.gtag).toBe('function');
    (loaded.gtag as (...args: unknown[]) => void)('event', 'calc_action', { calc_id: 'overtime' });
    expect(calls(loaded.dataLayer, 'event')).toEqual([
      ['event', 'calc_action', { calc_id: 'overtime' }],
    ]);
  });

  // a page with no calculator (a state page) has no script of its own to count its share link
  it('counts a share link click on a page without a calculator, under the page path', () => {
    const link = { closest: (selector: string) => (selector === 'a[data-share]' ? {} : null) };
    const other = { closest: () => null };
    const loaded = run(TAG, { pathname: '/minimum-wage/texas' });
    loaded.click(other);
    loaded.click(link);
    expect(calls(loaded.dataLayer, 'event')).toEqual([
      ['event', 'calc_action', { calc_action: 'share', calc_id: '/minimum-wage/texas' }],
    ]);
  });

  it('leaves the share link of a calculator page to its script, which names the calculator', () => {
    const link = { closest: () => ({}) };
    const loaded = run(TAG, { modules: 1 });
    loaded.click(link);
    expect(calls(loaded.dataLayer, 'event')).toEqual([]);
  });
});
