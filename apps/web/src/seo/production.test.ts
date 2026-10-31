import { describe, expect, it } from 'vitest';
import type { IndexNowRequest } from './indexnow.ts';
import { INDEXNOW_ENDPOINT, smokeProblems, submitIndexNow } from './production.ts';

const request: IndexNowRequest = {
  host: 'maestrocalc.com',
  key: '0123456789abcdef0123456789abcdef',
  keyLocation: 'https://maestrocalc.com/0123456789abcdef0123456789abcdef.txt',
  urlList: ['https://maestrocalc.com/', 'https://maestrocalc.com/es'],
};

interface Call {
  url: string;
  init: RequestInit | undefined;
}

const fetcherOf = (answer: (url: string) => Response) => {
  const calls: Call[] = [];
  const fetcher = (url: string, init?: RequestInit): Promise<Response> => {
    calls.push({ url, init });
    return Promise.resolve(answer(url));
  };
  return { calls, fetcher };
};

describe('post-deploy smoke (site-seo › Post-deploy check and notification)', () => {
  it('asks every URL and the key file without following redirects, and passes on 200s', async () => {
    const { calls, fetcher } = fetcherOf(
      (url) => new Response(url === request.keyLocation ? request.key : 'page'),
    );
    expect(await smokeProblems(request, fetcher)).toEqual([]);
    expect(calls.map(({ url }) => url)).toEqual([...request.urlList, request.keyLocation]);
    expect(calls.every(({ init }) => init?.redirect === 'manual')).toBe(true);
  });

  it('names each URL that does not answer 200, a redirect included', async () => {
    const { fetcher } = fetcherOf((url) =>
      url.endsWith('/es')
        ? new Response(null, { status: 301, headers: { location: '/es/' } })
        : new Response(url === request.keyLocation ? request.key : 'page'),
    );
    expect(await smokeProblems(request, fetcher)).toEqual([
      'https://maestrocalc.com/es answered 301',
    ]);
  });

  it('fails when the key file does not hold the key', async () => {
    const { fetcher } = fetcherOf(() => new Response('other'));
    expect(await smokeProblems(request, fetcher)).toEqual([
      `${request.keyLocation} does not hold the IndexNow key`,
    ]);
  });

  it('reports a network error as a problem instead of throwing', async () => {
    const fetcher = (): Promise<Response> => Promise.reject(new TypeError('fetch failed'));
    expect(await smokeProblems(request, fetcher)).toEqual([
      'https://maestrocalc.com/ failed: fetch failed',
      'https://maestrocalc.com/es failed: fetch failed',
      `${request.keyLocation} failed: fetch failed`,
    ]);
  });

  it('reports a rejection that is not an Error by its text', async () => {
    // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- the case under test
    const fetcher = (): Promise<Response> => Promise.reject('offline');
    expect(await smokeProblems({ ...request, urlList: [] }, fetcher)).toEqual([
      `${request.keyLocation} failed: offline`,
    ]);
  });
});

describe('IndexNow submission (site-seo › Post-deploy check and notification)', () => {
  it('posts the request as JSON to the shared endpoint', async () => {
    const { calls, fetcher } = fetcherOf(() => new Response(null, { status: 200 }));
    expect(await submitIndexNow(request, fetcher)).toBe(200);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.url).toBe(INDEXNOW_ENDPOINT);
    expect(INDEXNOW_ENDPOINT).toBe('https://api.indexnow.org/indexnow');
    expect(calls[0]?.init?.method).toBe('POST');
    expect(calls[0]?.init?.headers).toEqual({ 'Content-Type': 'application/json; charset=utf-8' });
    expect(JSON.parse(calls[0]?.init?.body as string)).toEqual(request);
  });

  it('accepts 202, the answer while the key is still being validated', async () => {
    const { fetcher } = fetcherOf(() => new Response(null, { status: 202 }));
    expect(await submitIndexNow(request, fetcher)).toBe(202);
  });

  it.each([400, 403, 422, 429])('throws on %i with the status in the message', async (status) => {
    const { fetcher } = fetcherOf(() => new Response('why', { status }));
    await expect(submitIndexNow(request, fetcher)).rejects.toThrow(
      `IndexNow answered ${String(status)}: why`,
    );
  });
});
