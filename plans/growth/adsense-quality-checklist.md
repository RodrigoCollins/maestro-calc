# AdSense quality checklist (every site)

Lessons of the maestrocalc.com "Low value content" rejection of 2026-11-07 (`plans/growth/adsense-low-value-audit-2026-11-08.md`), written for every site of this repository: Maestro Calc (`apps/web`), Cuenta Horas (`apps/pay`), Pool Figures (`apps/pool`), Lawn Figures (`apps/lawn`) and the sites still to come (Bowl Figures, Cuánto Le Cobro). Run it before asking AdSense to review a site, and before a re-review.

## The measuring tool

`packages/site-kit/src/content-audit.ts` (tested in `content-audit.test.ts`) reads only the `<main>` of each built page, without navigation, forms, breadcrumbs, bylines and call-to-action boxes, and reports per page: words, unique words (words of 6-word shingles that no other indexable page of the same language has), template share (shingles found on 3 or more pages of the language), worked example, sources, FAQ, internal links in and out, sitemap and `noindex`; plus the same-language near-duplicate pairs (shingle Jaccard 0.5 or more), the pages missing from the sitemap and the pages no main content links to. It reports and never fails.

Build the site, then run it on its own `dist`:

| Site         | Build                | Audit                                      |
| ------------ | -------------------- | ------------------------------------------ |
| Maestro Calc | `npm run build`      | `npm run audit:content -- apps/web/dist`   |
| Cuenta Horas | `npm run build:pay`  | `npm run audit:content -- apps/pay/dist`   |
| Pool Figures | `npm run build:pool` | `npm run audit:content -- apps/pool/dist`  |
| Lawn Figures | `npm run build:lawn` | `npm run audit:content -- apps/lawn/dist`  |
| A new app    | its build            | `npm run audit:content -- apps/<app>/dist` |

Options: `--limit <n>` (rows of the thinnest list, default 30), `--thin <words>` (default 120), `--json <file>` (the full report, every page). A site whose main content uses other chrome classes can pass its own `chrome` selector to `auditSite` from a script of its own.

Baseline on 2026-11-08 (`origin/main` plus the Maestro Calc job-page fix of PR #361): Maestro Calc 99 thin of 230 indexable pages; **Cuenta Horas 342 of 438**, the thinnest shift pages with 2 to 5 unique words and 96% template; **Pool Figures 98 of 136**, the stabilizer pages at 29 unique words and 85% template. Both are still in review; if either is rejected, this list is the fix order.

## The checklist

Each item: the rule, why Google cares, and how to check it.

1. **Most indexable pages carry text of their own.** Aim for no more than a third of the indexable pages under 120 unique words, and no indexable page under about 50.
   Why: scaled content abuse is "many pages ... generated for the primary purpose of manipulating Search rankings and not helping users", "no matter how it's created" (https://developers.google.com/search/docs/essentials/spam-policies); AdSense does not serve ads "on screens without publisher-content or with low-value content" (https://support.google.com/adsense/answer/10502938).
   Check: `thin (under 120 unique words)` and the thinnest list of the audit.

2. **Programmatic pages (one per size, pitch, shift, pool volume) explain and check their own answer.** Each shows the arithmetic of its answer step by step with the engine's figures, in both unit systems where the site has two, and a sentence about the case it answers that no sibling has.
   Why: helpful content offers "original information", "a substantial, complete, or comprehensive description of the topic" and value "beyond the obvious" (https://developers.google.com/search/docs/fundamentals/creating-helpful-content).
   Check: the `worked` column (a heading such as "How the figures are worked out"); unique words of the family in the audit.

3. **Shared advice is a means, not the fix.** Tips written once per kind of page help the reader, but they raise the template share. Keep them short, specific to the kind, and sourced; do not pad a family with more shared text to raise its word count.
   Why: the same spam policy names "stitching or combining content ... without adding value" (https://developers.google.com/search/docs/essentials/spam-policies).
   Check: `template %` per page and `near-duplicate pairs` before and after a change; a family whose pairs pass 0.7 needs per-page content, not more shared text.

4. **Every figure has a source or comes from the engine.** Yields, coverages, code minimums, rates and laws name a primary source with its retrieval date; the rest is the engine's arithmetic, tested against hand-verified cases.
   Why: trust is the center of E-E-A-T (https://developers.google.com/search/docs/fundamentals/creating-helpful-content); AdSense reviewers apply E-E-A-T and stricter YMYL standards to money and health topics (https://support.google.com/adsense/community-guide/241032356). Wages, overtime and taxes (Cuenta Horas, Cuánto Le Cobro) and pool chemicals are YMYL-adjacent.
   Check: the `sources` column (an external link, a sources heading or a link to `#sources`).

5. **Near-duplicates are merged or kept out of the index, not multiplied.** Same-language pages that differ only by a number and have no search demand are candidates for one page with all the cases, or `noindex, follow`. EN/ES pairs are not duplicates.
   Why: "large amounts of unoriginal content that provides little to no value" (https://developers.google.com/search/docs/essentials/spam-policies).
   Check: `closest pairs`; Search Console impressions per page before you decide (a merge changes published URLs, so it needs 301s).

6. **Hubs and index pages say something.** A hub that is a heading and a list of links is a navigation screen; give it a short sourced guide to the job it gathers (how to plan it in a few steps) and link the pages that go deeper.
   Why: AdSense does not allow ads on screens "used for alerts, navigation or other behavioral purposes" (https://support.google.com/adsense/answer/10502938).
   Check: hub rows of the audit (words and unique words).

7. **Trust pages are complete and honest.** About (who publishes, how a page is checked, corrections), contact, privacy, terms and an editorial policy, signed by the site's editorial team, never an invented person. If the about page says the site has no advertising, change it in the same merge that adds the ad code.
   Why: a site must offer "enough valuable content", a good user experience and navigation before it can show ads (https://support.google.com/adsense/answer/12176698 , https://support.google.com/adsense/answer/9724); E-E-A-T asks who made the content and how (https://developers.google.com/search/docs/fundamentals/creating-helpful-content).
   Check: the pages exist, are in the sitemap and are linked from the footer; `/about` should not be the thinnest page of the site.

8. **No orphans, every indexable page in the sitemap, nothing noindexed in it.** Every indexable page is linked from the main content of at least one other page (the footer alone does not count here), and embeds and 404s carry `noindex`.
   Why: content should be organized so users "easily find it" (https://support.google.com/adsense/answer/7299563).
   Check: `indexable pages missing from the sitemap` and `indexable pages no main content links to`.

9. **AI-assisted is fine, AI-mass-produced is not.** Say how AI is used (the about page does), have people review the text, test every formula, and never generate pages just to cover more queries.
   Why: https://developers.google.com/search/docs/fundamentals/using-gen-ai-content
   Check: a human read of a sample of the thinnest pages from the audit.

10. **Re-review only after the fix is crawled.** Deploy, check in Search Console that a sample of the fixed pages has a crawl date after the deploy, request indexing for the hubs and a few fixed pages, and wait two to three weeks from the rejection.
    Why: the reviewer sees what Google has crawled, and the AdSense help asks for the issues to be fixed before a new request (https://support.google.com/adsense/answer/81904).
    Check: Search Console URL inspection of the sample.
