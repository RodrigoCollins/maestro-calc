# Proposal: indexnow

## Intent

PLAN §7 asks for IndexNow next to Search Console and Bing Webmaster Tools (both live since 2026-10-30): Bing, which feeds ChatGPT search, learns about a published or changed page within minutes instead of waiting for a crawl. The same post-deploy job closes the backlog item "smoke after every deploy": Cloudflare once did not build a merge (#133) and nobody noticed.

## Decisions

1. **One sitemap stays.** PLAN §7 mentions a sitemap per language; web-shell D6 chose one sitemap with `hreflang` alternates, which search engines treat the same. Per-language files would add a sitemap index and change the URL already submitted to Google and Bing for no indexing gain. D6 holds.
2. **Key file at the root.** `SITE.indexNowKey` (32 hex characters, public by design) and `apps/web/public/<key>.txt` holding exactly the key; the request names it as `keyLocation`.
3. **The URL list is the route table.** `indexNowRequest()` in `apps/web/src/seo/indexnow.ts` builds the body from `ROUTES` (every canonical URL, both locales), the same source as the sitemap, so the two never disagree.
4. **After the deploy, not after the merge.** `.github/workflows/deploy.yml` runs on every push to `main`: it waits (at most 20 minutes) for the `Workers Builds: maestro-calc` check of that commit to succeed, then asks every canonical URL for a 200 (the smoke), then notifies IndexNow. A missing or failed build fails the job, which is the #133 alarm.
5. **Notify only when the site changed.** The ping runs when the push touches `apps/web` or `packages` outside test files; a docs-only push (an openspec archive) smokes but does not ping. The whole URL list is sent (32 URLs, far below the 10,000 limit), since a change in a shared package can change every page.
6. **No secret.** The job needs `contents: read` and `checks: read`; IndexNow takes no credentials.

## Slices

One PR: key, request builder, script, workflow, contracts.
