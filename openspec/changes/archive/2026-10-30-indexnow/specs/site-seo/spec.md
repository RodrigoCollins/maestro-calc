# Delta for site-seo

## ADDED Requirements

### Requirement: IndexNow

The site MUST publish an IndexNow key at `/<key>.txt` whose body is exactly the key of `SITE.indexNowKey` (32 lowercase hexadecimal characters). The IndexNow request MUST name host `maestrocalc.com`, that key, its `keyLocation`, and as `urlList` exactly the canonical absolute URLs of the route table in both locales (the `<loc>` values of the sitemap).

#### Scenario: [IN1] Key file
- GIVEN `apps/web/public/<SITE.indexNowKey>.txt`
- WHEN read
- THEN its body is the key, and the key matches `^[0-9a-f]{32}$`

#### Scenario: [IN2] Request body
- GIVEN the route table
- WHEN `indexNowRequest()` builds the body
- THEN `urlList` equals the sitemap `<loc>` values in the same order, with no duplicate and no query string

### Requirement: Post-deploy check and notification

A workflow MUST run on every push to `main`, wait for the Cloudflare build check of that commit, fail when the check does not succeed within 20 minutes, request every canonical URL and fail on any status other than 200, and only then send the IndexNow request when the push changed site files (`apps/web` or `packages`, test files excluded). It MUST hold only `contents: read` and `checks: read`, pin every action to a commit SHA and not persist the checkout token.

#### Scenario: [IN3] Order of steps
- GIVEN `.github/workflows/deploy.yml`
- WHEN parsed
- THEN the steps wait for the build, then smoke, then notify, and the notify step is conditional on the site-change step

#### Scenario: [IN4] Least privilege
- GIVEN the same workflow
- THEN its permissions are exactly `contents: read` and `checks: read` and every `uses` is pinned to a 40-character SHA
