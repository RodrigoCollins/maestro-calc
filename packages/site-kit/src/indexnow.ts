/** The IndexNow endpoint every participating engine shares (indexnow.org/documentation). */
export const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

export type Fetcher = (url: string, init?: RequestInit) => Promise<Response>;

/** A site that IndexNow knows by its origin and the key it serves at `<origin>/<key>.txt`. */
export interface IndexNowSite {
  readonly origin: string;
  readonly key: string;
}

/** Every `<loc>` of a sitemap, in its order; alternate links are not pages of their own. */
export const sitemapUrls = (xml: string): string[] =>
  Array.from(xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g), (match) => String(match[1]));

/**
 * Tells IndexNow about every page the live site lists: it reads `<origin>/sitemap.xml`, checks that
 * the live key file holds the key (IndexNow rejects the key otherwise), then sends the URLs. Any site
 * with a sitemap gets this the same way, so a new site needs only its key file.
 */
export const notifyFromSitemap = async (
  site: IndexNowSite,
  fetcher: Fetcher,
): Promise<{ status: number; urls: number }> => {
  const keyLocation = new URL(`/${site.key}.txt`, site.origin).href;
  const key = (await (await fetcher(keyLocation)).text()).trim();
  if (key !== site.key) throw new Error(`${keyLocation} does not hold the key`);
  const sitemap = new URL('/sitemap.xml', site.origin).href;
  const urlList = sitemapUrls(await (await fetcher(sitemap)).text());
  if (urlList.length === 0) throw new Error(`${sitemap} lists no page`);
  const response = await fetcher(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: new URL(site.origin).host, key: site.key, keyLocation, urlList }),
  });
  if (response.status !== 200 && response.status !== 202)
    throw new Error(`IndexNow answered ${String(response.status)}`);
  return { status: response.status, urls: urlList.length };
};
