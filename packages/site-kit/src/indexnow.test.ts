import { describe, expect, it } from 'vitest';
import { INDEXNOW_ENDPOINT, notifyFromSitemap, sitemapUrls, type Fetcher } from './indexnow.ts';

const SITEMAP = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://example.com/</loc></url>
  <url><loc>https://example.com/a-calculator</loc><xhtml:link rel="alternate" href="https://example.com/es/x"/></url>
</urlset>`;

/** A fetcher that serves the sitemap and the key file, and records what IndexNow is sent. */
const fake = (answers: { indexnow?: number; key?: string } = {}) => {
  const sent: { url: string; body: unknown }[] = [];
  const fetcher: Fetcher = (url, init) => {
    if (url === 'https://example.com/sitemap.xml') return Promise.resolve(new Response(SITEMAP));
    if (url === 'https://example.com/k1.txt')
      return Promise.resolve(new Response(answers.key ?? 'k1'));
    sent.push({ url, body: typeof init?.body === 'string' ? JSON.parse(init.body) : null });
    return Promise.resolve(new Response('', { status: answers.indexnow ?? 202 }));
  };
  return { fetcher, sent };
};

describe('sitemapUrls', () => {
  it('reads every <loc> of a sitemap, never the alternate links', () => {
    expect(sitemapUrls(SITEMAP)).toEqual([
      'https://example.com/',
      'https://example.com/a-calculator',
    ]);
  });
});

describe('notifyFromSitemap', () => {
  it('sends IndexNow every URL of the live sitemap under the site key', async () => {
    const { fetcher, sent } = fake();
    const result = await notifyFromSitemap({ origin: 'https://example.com', key: 'k1' }, fetcher);
    expect(result).toEqual({ status: 202, urls: 2 });
    expect(sent).toEqual([
      {
        url: INDEXNOW_ENDPOINT,
        body: {
          host: 'example.com',
          key: 'k1',
          keyLocation: 'https://example.com/k1.txt',
          urlList: ['https://example.com/', 'https://example.com/a-calculator'],
        },
      },
    ]);
  });

  it('refuses to send when the live key file does not hold the key', async () => {
    const { fetcher, sent } = fake({ key: 'other' });
    await expect(
      notifyFromSitemap({ origin: 'https://example.com', key: 'k1' }, fetcher),
    ).rejects.toThrow('https://example.com/k1.txt does not hold the key');
    expect(sent).toEqual([]);
  });

  it('refuses to send an empty list when the live sitemap has no page', async () => {
    const fetcher: Fetcher = (url) =>
      Promise.resolve(new Response(url.endsWith('.txt') ? 'k1' : '<html>Page not found</html>'));
    await expect(
      notifyFromSitemap({ origin: 'https://example.com', key: 'k1' }, fetcher),
    ).rejects.toThrow('https://example.com/sitemap.xml lists no page');
  });

  it('fails on an answer IndexNow does not accept', async () => {
    const { fetcher } = fake({ indexnow: 403 });
    await expect(
      notifyFromSitemap({ origin: 'https://example.com', key: 'k1' }, fetcher),
    ).rejects.toThrow('IndexNow answered 403');
  });
});
