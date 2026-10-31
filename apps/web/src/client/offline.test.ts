import { describe, expect, it } from 'vitest';
import { offlineUrls, registerOffline, type OfflineHost } from './offline.ts';

const ORIGIN = 'https://maestrocalc.com';

const hostWith = (overrides: Partial<OfflineHost> = {}) => {
  const log: string[] = [];
  const host: OfflineHost = {
    origin: ORIGIN,
    path: '/concrete-calculator',
    resources: () => [
      `${ORIGIN}/_astro/mount.abc.js`,
      `${ORIGIN}/_astro/fonts/a.woff2`,
      `${ORIGIN}/analytics.js`,
      'https://www.googletagmanager.com/gtm.js',
    ],
    serviceWorker: {
      register: (url) => {
        log.push(`register ${url}`);
        return Promise.resolve();
      },
      ready: Promise.resolve({
        active: {
          postMessage: (message: unknown) => {
            log.push(`post ${JSON.stringify(message)}`);
          },
        },
      }),
    },
    ...overrides,
  };
  return { host, log };
};

describe('offline registration (site-pwa › Offline)', () => {
  it('keeps the page and its own hashed files, once each, and nothing else', () => {
    expect(
      offlineUrls(
        '/a',
        [`${ORIGIN}/_astro/x.js`, `${ORIGIN}/_astro/x.js`, `${ORIGIN}/b.js`],
        ORIGIN,
      ),
    ).toEqual(['/a', `${ORIGIN}/_astro/x.js`]);
  });

  // the worker fetches them, so the page itself makes no request (site-shell › [SS21])
  it('registers the worker, then hands it the page and its files to keep', async () => {
    const { host, log } = hostWith();
    await registerOffline(host);
    expect(log).toEqual([
      'register /sw.js',
      `post ${JSON.stringify({
        keep: [
          '/concrete-calculator',
          `${ORIGIN}/_astro/mount.abc.js`,
          `${ORIGIN}/_astro/fonts/a.woff2`,
        ],
      })}`,
    ]);
  });

  it('does nothing in a browser without service workers', async () => {
    const { host, log } = hostWith({ serviceWorker: undefined });
    await registerOffline(host);
    expect(log).toEqual([]);
  });

  it('hands nothing over while no worker is active', async () => {
    const { host, log } = hostWith({
      serviceWorker: {
        register: () => Promise.resolve(),
        ready: Promise.resolve({ active: null }),
      },
    });
    await registerOffline(host);
    expect(log).toEqual([]);
  });

  it('never rejects: a refused registration leaves the page as it is', async () => {
    const { host, log } = hostWith({
      serviceWorker: {
        register: () => Promise.reject(new Error('blocked')),
        ready: new Promise(() => undefined),
      },
    });
    await expect(registerOffline(host)).resolves.toBeUndefined();
    expect(log).toEqual([]);
  });
});
