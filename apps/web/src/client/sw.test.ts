import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import { fromRoot } from '../contract/root.ts';
import { OFFLINE_CACHE } from './offline.ts';

const SOURCE = readFileSync(fromRoot('apps/web/public/sw.js'), 'utf8');
const ORIGIN = 'https://maestrocalc.com';

type Handler = (event: FakeEvent) => void;

interface FakeEvent {
  data?: unknown;
  request?: { url: string; method: string; mode: string };
  respondWith: (response: Promise<Response>) => void;
  waitUntil: (work: Promise<unknown>) => void;
}

/** A Cache Storage of named caches keyed by path, as the worker stores them. */
const fakeCaches = (
  seed: Record<string, Record<string, string>> = {},
  network: (url: string) => Promise<Response> = () => Promise.resolve(new Response('added')),
) => {
  const store = new Map(
    Object.entries(seed).map(([name, entries]) => [name, new Map(Object.entries(entries))]),
  );
  const pathOf = (key: string | { url: string }) =>
    new URL(typeof key === 'string' ? key : key.url, ORIGIN).pathname;
  const open = (name: string) => {
    const cache = store.get(name) ?? new Map<string, string>();
    store.set(name, cache);
    return Promise.resolve({
      match: (key: { url: string }, options?: { ignoreSearch?: boolean }) =>
        Promise.resolve(
          options?.ignoreSearch === true && cache.has(pathOf(key))
            ? new Response(cache.get(pathOf(key)))
            : undefined,
        ),
      put: async (key: string, response: Response) => {
        cache.set(pathOf(key), await response.text());
      },
      add: async (key: string) => {
        const response = await network(new URL(key, ORIGIN).href);
        if (!response.ok) throw new TypeError('bad status');
        cache.set(pathOf(key), await response.text());
      },
    });
  };
  return {
    store,
    api: {
      open,
      keys: () => Promise.resolve([...store.keys()]),
      delete: (name: string) => Promise.resolve(store.delete(name)),
    },
  };
};

/** Runs the worker source against fakes and returns its handlers and what they did. */
const workerWith = (
  caches: ReturnType<typeof fakeCaches>,
  network: (url: string) => Promise<Response>,
) => {
  const handlers: Record<string, Handler> = {};
  const calls = { skipWaiting: 0, claim: 0, fetched: [] as string[] };
  const self = {
    location: { origin: ORIGIN },
    addEventListener: (type: string, handler: Handler) => {
      handlers[type] = handler;
    },
    skipWaiting: () => {
      calls.skipWaiting += 1;
      return Promise.resolve();
    },
    clients: {
      claim: () => {
        calls.claim += 1;
        return Promise.resolve();
      },
    },
  };
  const fetch = (request: { url: string }) => {
    calls.fetched.push(request.url);
    return network(request.url);
  };
  runInNewContext(SOURCE, { self, caches: caches.api, fetch, URL, Response, Promise });
  /** Dispatches a fetch; resolves to the response, or `undefined` when the worker lets it pass. */
  const request = async (url: string, mode = 'navigate', method = 'GET') => {
    let answer: Promise<Response> | undefined;
    handlers['fetch']?.({
      request: { url, method, mode },
      respondWith: (response) => {
        answer = response;
      },
      waitUntil: () => undefined,
    });
    return answer === undefined ? undefined : await answer;
  };
  /** Dispatches a message from a page and waits for the work it starts. */
  const message = async (data: unknown) => {
    const work: Promise<unknown>[] = [];
    handlers['message']?.({
      data,
      respondWith: () => undefined,
      waitUntil: (each) => work.push(each),
    });
    await Promise.all(work);
  };
  const lifecycle = async (type: 'install' | 'activate') => {
    const work: Promise<unknown>[] = [];
    handlers[type]?.({ respondWith: () => undefined, waitUntil: (each) => work.push(each) });
    await Promise.all(work);
  };
  return { request, message, lifecycle, calls };
};

const page = (body: string) => () => Promise.resolve(new Response(body, { status: 200 }));
const offline = () => Promise.reject(new TypeError('Failed to fetch'));

describe('the offline worker (site-pwa › Offline)', () => {
  it('names the cache of the page module', () => {
    expect(SOURCE).toContain(`const CACHE = '${OFFLINE_CACHE}';`);
  });

  it('takes over at once and drops the caches of older versions', async () => {
    const caches = fakeCaches({ 'maestro-v0': { '/': 'old' }, [OFFLINE_CACHE]: {} });
    const worker = workerWith(caches, page('x'));
    await worker.lifecycle('install');
    await worker.lifecycle('activate');
    expect(worker.calls).toMatchObject({ skipWaiting: 1, claim: 1 });
    expect([...caches.store.keys()]).toEqual([OFFLINE_CACHE]);
  });

  it('serves a page from the network and keeps it under its path', async () => {
    const caches = fakeCaches();
    const worker = workerWith(caches, page('fresh'));
    const response = await worker.request(`${ORIGIN}/concrete-calculator?v=1&l=240`);
    expect(await response?.text()).toBe('fresh');
    expect(caches.store.get(OFFLINE_CACHE)?.get('/concrete-calculator')).toBe('fresh');
  });

  it('serves the kept page when the network fails, whatever its query', async () => {
    const caches = fakeCaches({ [OFFLINE_CACHE]: { '/concrete-calculator': 'kept' } });
    const worker = workerWith(caches, offline);
    const response = await worker.request(`${ORIGIN}/concrete-calculator?v=1&l=120`);
    expect(await response?.text()).toBe('kept');
  });

  it('answers a network error for a page it never kept', async () => {
    const worker = workerWith(fakeCaches(), offline);
    expect((await worker.request(`${ORIGIN}/roofing-calculator`))?.type).toBe('error');
  });

  it('serves a hashed asset from the cache before the network', async () => {
    const caches = fakeCaches({ [OFFLINE_CACHE]: { '/_astro/mount.abc.js': 'cached' } });
    const worker = workerWith(caches, page('network'));
    const hit = await worker.request(`${ORIGIN}/_astro/mount.abc.js`, 'no-cors');
    expect(await hit?.text()).toBe('cached');
    const miss = await worker.request(`${ORIGIN}/_astro/fonts/a.woff2`, 'cors');
    expect(await miss?.text()).toBe('network');
    expect(caches.store.get(OFFLINE_CACHE)?.get('/_astro/fonts/a.woff2')).toBe('network');
    expect(worker.calls.fetched).toEqual([`${ORIGIN}/_astro/fonts/a.woff2`]);
  });

  it('keeps no failed answer', async () => {
    const caches = fakeCaches();
    const worker = workerWith(caches, () => Promise.resolve(new Response('gone', { status: 404 })));
    expect((await worker.request(`${ORIGIN}/nope`))?.status).toBe(404);
    expect(caches.store.get(OFFLINE_CACHE)?.size ?? 0).toBe(0);
  });

  it('keeps what a page hands it: same-origin paths and files only, a failed one skipped', async () => {
    const caches = fakeCaches({}, (url) =>
      Promise.resolve(new Response(url, { status: url.endsWith('.woff2') ? 404 : 200 })),
    );
    const worker = workerWith(caches, page('x'));
    await worker.message({
      keep: [
        '/concrete-calculator',
        `${ORIGIN}/_astro/mount.abc.js`,
        `${ORIGIN}/_astro/fonts/a.woff2`,
        'https://evil.example/x.js',
        42,
      ],
    });
    expect([...(caches.store.get(OFFLINE_CACHE)?.keys() ?? [])]).toEqual([
      '/concrete-calculator',
      '/_astro/mount.abc.js',
    ]);
  });

  it('ignores a message that is not a list to keep', async () => {
    const caches = fakeCaches();
    const worker = workerWith(caches, page('x'));
    for (const data of [null, 'keep', { keep: 'x' }]) await worker.message(data);
    expect(caches.store.get(OFFLINE_CACHE)?.size ?? 0).toBe(0);
  });

  it('lets other origins, other methods and other files pass untouched', async () => {
    const worker = workerWith(fakeCaches(), page('x'));
    expect(
      await worker.request('https://www.googletagmanager.com/gtm.js', 'no-cors'),
    ).toBeUndefined();
    expect(await worker.request(`${ORIGIN}/`, 'navigate', 'POST')).toBeUndefined();
    expect(await worker.request(`${ORIGIN}/analytics.js`, 'no-cors')).toBeUndefined();
    expect(worker.calls.fetched).toEqual([]);
  });
});
