/*
 * The page side of the offline worker (site-pwa). A calculator page registers `public/sw.js` and
 * puts itself and its hashed files in the worker's cache: they were fetched before the worker ran,
 * so without this a calculator used once with signal would not open again without it. The browser
 * is injected (`OfflineHost`), so the logic runs in the unit suite, which has no DOM.
 */

/** The cache the offline worker (`public/sw.js`) reads; the page fills it on registration. */
export const OFFLINE_CACHE = 'maestro-v1';

/** What the registration needs from the browser; a missing API leaves the page as it is. */
export interface OfflineHost {
  readonly origin: string;
  readonly path: string;
  /** The URLs the page has loaded so far (the Resource Timing entries). */
  readonly resources: () => readonly string[];
  readonly serviceWorker: { readonly register: (url: string) => Promise<unknown> } | undefined;
  readonly caches:
    | {
        readonly open: (name: string) => Promise<{ readonly add: (url: string) => Promise<void> }>;
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

/** Registers the worker and fills its cache; resolves in every case, a failure changes nothing. */
export const registerOffline = (host: OfflineHost): Promise<void> => {
  const { serviceWorker, caches } = host;
  if (serviceWorker === undefined || caches === undefined) return Promise.resolve();
  return serviceWorker
    .register('/sw.js')
    .then(() => caches.open(OFFLINE_CACHE))
    .then((cache) =>
      // each file on its own: one that fails (quota, a stale hash) keeps the others
      Promise.all(
        offlineUrls(host.path, host.resources(), host.origin).map((url) =>
          cache.add(url).catch(() => undefined),
        ),
      ),
    )
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
  caches: 'caches' in window ? window.caches : undefined,
});
