import { describe, expect, it } from 'vitest';
import { OFFLINE_CACHE, offlineUrls, registerOffline, type OfflineHost } from './offline.ts';

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
    },
    caches: {
      open: (name) => {
        log.push(`open ${name}`);
        return Promise.resolve({
          add: (url) => {
            log.push(`add ${url}`);
            return url.endsWith('.woff2') ? Promise.reject(new Error('quota')) : Promise.resolve();
          },
        });
      },
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

  it('registers the worker, then fills its cache with the page and its files', async () => {
    const { host, log } = hostWith();
    await registerOffline(host);
    expect(log).toEqual([
      'register /sw.js',
      `open ${OFFLINE_CACHE}`,
      'add /concrete-calculator',
      `add ${ORIGIN}/_astro/mount.abc.js`,
      `add ${ORIGIN}/_astro/fonts/a.woff2`,
    ]);
  });

  it('does nothing in a browser without service workers or caches', async () => {
    for (const missing of [{ serviceWorker: undefined }, { caches: undefined }]) {
      const { host, log } = hostWith(missing);
      await registerOffline(host);
      expect(log).toEqual([]);
    }
  });

  it('never rejects: a refused registration leaves the page as it is', async () => {
    const { host, log } = hostWith({
      serviceWorker: { register: () => Promise.reject(new Error('blocked')) },
    });
    await expect(registerOffline(host)).resolves.toBeUndefined();
    expect(log).toEqual([]);
  });
});
