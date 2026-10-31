import type { IndexNowRequest } from './indexnow.ts';

/** The `fetch` the checks need, injected so the tests never reach the network. */
export type Fetcher = (url: string, init?: RequestInit) => Promise<Response>;

/** The shared endpoint: one submission reaches every IndexNow engine (Bing, Yandex, Seznam...). */
export const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

const messageOf = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const problemOf = async (
  url: string,
  fetcher: Fetcher,
  expectedBody: string | undefined,
): Promise<string | undefined> => {
  try {
    // `manual`: a canonical URL that redirects is a broken canonical, not a pass.
    const response = await fetcher(url, { redirect: 'manual' });
    if (response.status !== 200) return `${url} answered ${String(response.status)}`;
    if (expectedBody !== undefined && (await response.text()) !== expectedBody)
      return `${url} does not hold the IndexNow key`;
    return undefined;
  } catch (error) {
    return `${url} failed: ${messageOf(error)}`;
  }
};

/** Every canonical URL and the key file answer 200 on production; returns what does not. */
export const smokeProblems = async (
  request: IndexNowRequest,
  fetcher: Fetcher,
): Promise<string[]> => {
  const checks = [
    ...request.urlList.map((url) => problemOf(url, fetcher, undefined)),
    problemOf(request.keyLocation, fetcher, request.key),
  ];
  return (await Promise.all(checks)).filter((problem) => problem !== undefined);
};

/** Sends the request; 200 (received) and 202 (key being validated) pass, anything else throws. */
export const submitIndexNow = async (
  request: IndexNowRequest,
  fetcher: Fetcher,
): Promise<number> => {
  const response = await fetcher(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(request),
  });
  if (response.status !== 200 && response.status !== 202)
    throw new Error(`IndexNow answered ${String(response.status)}: ${await response.text()}`);
  return response.status;
};
