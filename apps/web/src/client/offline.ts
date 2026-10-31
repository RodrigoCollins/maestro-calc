/*
 * The page side of the offline worker (site-pwa). A calculator page registers `public/sw.js` and
 * hands it the page and its own hashed files to keep: they were fetched before the worker ran, so
 * without this a calculator used once with signal would not open again without it. The worker
 * fetches them, so the page itself makes no request (site-shell › [SS21]). The browser is injected
 * (`OfflineHost`), so the logic runs in the unit suite, which has no DOM.
 */

/** The cache the offline worker (`public/sw.js`) fills and reads. */
export const OFFLINE_CACHE = 'maestro-v1';

/** What the registration needs from the browser; without service workers the page stays as it is. */
export interface OfflineHost {
  readonly origin: string;
  readonly path: string;
  /** The URLs the page has loaded so far (the Resource Timing entries). */
  readonly resources: () => readonly string[];
  readonly serviceWorker:
    | {
        readonly register: (url: string) => Promise<unknown>;
        readonly ready: Promise<{
          readonly active: { readonly postMessage: (message: unknown) => void } | null;
        }>;
      }
    | undefined;
}

/** The page's path and its own hashed files (scripts, fonts), each once. */
export const offlineUrls = (
  path: string,
  resources: readonly string[],
  origin: string,
): readonly string[] => [
  path,
  ...new Set(resources.filter((url) => url.startsWith(`${origin}/_astro/`))),
];

/** Registers the worker and hands it what to keep; resolves in every case, a failure changes nothing. */
export const registerOffline = (host: OfflineHost): Promise<void> => {
  const { serviceWorker } = host;
  if (serviceWorker === undefined) return Promise.resolve();
  return serviceWorker
    .register('/sw.js')
    .then(() => serviceWorker.ready)
    .then(({ active }) => {
      active?.postMessage({ keep: offlineUrls(host.path, host.resources(), host.origin) });
    })
    .then(
      () => undefined,
      () => undefined,
    );
};

/** The live browser as an `OfflineHost`. */
export const browserHost = (): OfflineHost => ({
  origin: location.origin,
  path: location.pathname,
  resources: () => performance.getEntriesByType('resource').map((entry) => entry.name),
  serviceWorker: 'serviceWorker' in navigator ? navigator.serviceWorker : undefined,
});
