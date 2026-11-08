// The post-deploy IndexNow ping of Bowl Figures (`.github/workflows/deploy.yml`), from the live sitemap.
// Usage: node apps/pets/scripts/indexnow.ts
import { notifyFromSitemap } from '@maestro-calc/site-kit/indexnow';
import { SITE } from '../src/site.config.ts';

const { status, urls } = await notifyFromSitemap(
  { origin: SITE.origin, key: SITE.indexNowKey },
  fetch,
);
console.log(`indexnow: ${String(urls)} URLs of ${SITE.origin}, answered ${String(status)}`);
