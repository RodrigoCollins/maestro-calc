# AdSense "low value content" audit, maestrocalc.com (2026-11-08)

Google AdSense rejected maestrocalc.com on 2026-11-07 with "Low value content". This audit measures every built page, sets the result against Google's published guidance, and lists what was fixed and what is left before a re-review is requested.

## Method

- Built `apps/web` from `origin/main` at `7e2739ef` (`npm run build`): 252 HTML files, of which 230 are indexable (115 per language) and 22 carry `noindex` (the 20 embed pages and the two 404 pages). Every indexable page is in `sitemap.xml`; no noindexed page is.
- For each page, the script read only `<main>`, without the breadcrumb, the byline, the form, the call-to-action box and every `<nav>`, `<svg>`, `<script>` and `<style>`. Header, footer and form chrome are never counted.
- **Words**: words of that main content. **Unique words**: the words of the page's 6-word shingles that occur on no other page of the same language. **Template %**: the share of its shingles that occur on 3 or more pages of the same language (boilerplate). EN/ES pairs are not compared with each other.
- **Near-duplicates**: pairs of same-language pages whose shingle sets have a Jaccard similarity of 0.5 or more.
- **Links in / out**: internal links inside `<main>` only, so the sitewide header and footer links do not inflate them.
- **Answer or worked example**: the page states a computed answer (job pages) or has a worked example section (calculators). **Sources**: links to or names its sources. **FAQ**: number of FAQ questions.

The script is not committed (it is a one-off measurement); the numbers below are its output.

## What Google says

- AdSense program policies: content must be high quality and original and give value to users; Google acts on domains that add little value. Google-served ads are not allowed "on screens without publisher-content or with low-value content". Google Publisher Policies, https://support.google.com/adsense/answer/10502938 ; AdSense policies, a beginner's guide, https://support.google.com/adsense/answer/23921
- Before approval the site must provide "enough valuable content to users", a good user experience and navigation: https://support.google.com/adsense/answer/12176698 , https://support.google.com/adsense/answer/7299563 , https://support.google.com/adsense/answer/9724
- Scaled content abuse: "many pages are generated for the primary purpose of manipulating Search rankings and not helping users", "large amounts of unoriginal content that provides little to no value to users, no matter how it's created". Spam policies for Google web search, https://developers.google.com/search/docs/essentials/spam-policies
- Helpful content: original information or analysis, "a substantial, complete, or comprehensive description of the topic", value "beyond the obvious", and E-E-A-T (experience, expertise, authoritativeness, trust). https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- AI-assisted content is acceptable when it is helpful and not mass-produced for ranking: https://developers.google.com/search/docs/fundamentals/using-gen-ai-content
- The AdSense community guide on this rejection names thin pages, content that restates others without adding value, and weak E-E-A-T as the usual causes: https://support.google.com/adsense/community-guide/241032356

## Top findings

1. **Most of the site is programmatic job pages, and they were thin.** 66 of the 115 indexable pages per language (57%) are job pages (a slab size, a roof pitch, a room, a length divided by 2). Each had about 200 to 290 words, of which a median of 63 (EN) and 65 (ES) were its own; 60 to 76% of every page was the same text as its siblings. 142 of the 230 indexable pages (62%) had fewer than 120 unique words. This is the most likely cause of the rejection: it matches the scaled-content description closely, even though every figure is real.
2. **Same-language near-duplicates.** 292 pairs had a Jaccard similarity of 0.5 or more, all inside four families: the roof pitch pages (10 per language, up to 0.61), the concrete slabs, the three Sonotube pages (0.62) and the two footing pages (0.60). No page was a copy of another, but the roof pitch, Sonotube and footing pages differed mainly in their numbers.
3. **The job pages had no explanation of their own figures.** The answer and a table were there, but nothing a reader could check by hand, no advice on measuring or buying, and no per-page context for 30 of the 66 jobs per language (the slabs, the pad, the tubes, the footings, the roof pitches and the divisions had no intro sentence).
4. **Thin hub pages.** `/drywall` (180 words, 95 unique), `/painting` (232, 104) and `/measurement` (350, 106) are index pages with two short paragraphs and the generated lists.
5. **Trust pages are short.** `/about` has 195 words; `/contact` 49 and `/terms` 107 are short by nature. `/about` also says "The site has no advertising or sponsors today", which must change in the same merge that turns ads on.
6. **Orphans in the main content.** `/construction-glossary` (1,190 words), `/privacy` and `/embed-calculators` have no link from any page's main content (only from the footer).
7. **What is already strong.** The 10 calculator pages (about 1,500 to 1,900 words, 8 FAQ, worked example, sources), the 17 guides (480 to 750 words, 63 to 97% unique), `/methodology` (3,363 words) and the charts are substantive, sourced and original. Editorial policy, about, corrections and contact pages exist and name the editorial team.

### Pages that should be noindexed or merged, not expanded

- None needs `noindex` today: every job page answers a real query and several have impressions in Search Console (`plans/growth/gsc-2026-11-06.md`: 650 sq ft slab, 22 in ÷ 10, 3 ft 9 in ÷ 2, 6/12 and 7.5/12 pitch).
- If a re-review fails again, the first candidates are the families whose pages differ mostly by a number and have no impressions: the Sonotube pages (8, 10, 12 in) could be one page with three diameters, the two footing pages one page, and the roof pitch pages could be kept for 4/12, 6/12, 7.5/12, 8/12 and 12/12 with the rest noindexed. Merging changes published URLs (a public contract pinned in `routes.test.ts`), so a merge needs 301s and an explicit decision; `noindex, follow` is the cheaper first step.

## Ranking, thinnest to richest (English, before the fixes)

The Spanish pages mirror these within a few words (Spanish runs about 5 to 10% longer). The last column is the same measure after PR 1 (below).

| #   | Page (en)                                            | Words | Unique words | Template % | Answer or worked example | Sources | FAQ | Links out | Links in | Sitemap | Unique after PR 1 |
| --- | ---------------------------------------------------- | ----- | ------------ | ---------- | ------------------------ | ------- | --- | --------- | -------- | ------- | ----------------- |
| 1   | `/concrete/10x10-slab`                               | 290   | 42           | 76         | yes                      | yes     | -   | 22        | 21       | yes     | 97                |
| 2   | `/concrete/20x20-slab`                               | 290   | 42           | 75         | yes                      | yes     | -   | 22        | 19       | yes     | 86                |
| 3   | `/concrete/4x4-pad`                                  | 290   | 42           | 73         | yes                      | yes     | -   | 22        | 20       | yes     | 118               |
| 4   | `/concrete/10x12-slab`                               | 290   | 44           | 74         | yes                      | yes     | -   | 22        | 19       | yes     | 107               |
| 5   | `/painting/paint-for-12x12-room`                     | 200   | 45           | 68         | yes                      | yes     | -   | 9         | 7        | yes     | 85                |
| 6   | `/concrete/12x12-slab`                               | 290   | 46           | 74         | yes                      | yes     | -   | 22        | 19       | yes     | 113               |
| 7   | `/concrete/12x20-slab`                               | 290   | 46           | 74         | yes                      | yes     | -   | 22        | 19       | yes     | 112               |
| 8   | `/concrete/10x20-slab`                               | 290   | 46           | 75         | yes                      | yes     | -   | 22        | 19       | yes     | 110               |
| 9   | `/concrete/12x24-slab`                               | 290   | 46           | 74         | yes                      | yes     | -   | 22        | 19       | yes     | 112               |
| 10  | `/painting/paint-for-12x16-room`                     | 204   | 46           | 62         | yes                      | yes     | -   | 9         | 7        | yes     | 86                |
| 11  | `/painting/paint-for-10x12-room`                     | 200   | 46           | 68         | yes                      | yes     | -   | 9         | 6        | yes     | 86                |
| 12  | `/painting/paint-for-10x10-room`                     | 198   | 46           | 68         | yes                      | yes     | -   | 9         | 7        | yes     | 86                |
| 13  | `/contact`                                           | 49    | 48           | 0          | no                       | no      | -   | 1         | 0        | yes     | 48                |
| 14  | `/roofing/6-12-roof-pitch`                           | 202   | 48           | 76         | yes                      | yes     | -   | 15        | 12       | yes     | 92                |
| 15  | `/roofing/5-12-roof-pitch`                           | 202   | 49           | 76         | yes                      | yes     | -   | 15        | 12       | yes     | 107               |
| 16  | `/roofing/8-12-roof-pitch`                           | 202   | 49           | 76         | yes                      | yes     | -   | 15        | 12       | yes     | 98                |
| 17  | `/roofing/10-12-roof-pitch`                          | 202   | 49           | 76         | yes                      | yes     | -   | 15        | 12       | yes     | 92                |
| 18  | `/roofing/12-12-roof-pitch`                          | 202   | 49           | 76         | yes                      | yes     | -   | 15        | 12       | yes     | 100               |
| 19  | `/roofing/7-5-12-roof-pitch`                         | 202   | 49           | 76         | yes                      | yes     | -   | 15        | 12       | yes     | 99                |
| 20  | `/roofing/4-12-roof-pitch`                           | 202   | 49           | 76         | yes                      | yes     | -   | 15        | 12       | yes     | 118               |
| 21  | `/roofing/9-12-roof-pitch`                           | 202   | 49           | 76         | yes                      | yes     | -   | 15        | 12       | yes     | 98                |
| 22  | `/roofing/7-12-roof-pitch`                           | 202   | 49           | 76         | yes                      | yes     | -   | 15        | 12       | yes     | 92                |
| 23  | `/roofing/3-12-roof-pitch`                           | 202   | 50           | 75         | yes                      | yes     | -   | 15        | 12       | yes     | 141               |
| 24  | `/drywall/drywall-for-12x12-room`                    | 233   | 53           | 69         | yes                      | yes     | -   | 9         | 6        | yes     | 86                |
| 25  | `/concrete/24x24-slab`                               | 290   | 53           | 71         | yes                      | yes     | -   | 22        | 19       | yes     | 112               |
| 26  | `/drywall/drywall-for-10x12-room`                    | 233   | 54           | 69         | yes                      | yes     | -   | 9         | 6        | yes     | 87                |
| 27  | `/drywall/drywall-for-10x10-room`                    | 231   | 55           | 68         | yes                      | yes     | -   | 9         | 6        | yes     | 90                |
| 28  | `/drywall/drywall-for-12x16-room`                    | 237   | 55           | 63         | yes                      | yes     | -   | 9         | 6        | yes     | 90                |
| 29  | `/measurement/12x14-square-feet`                     | 201   | 58           | 70         | yes                      | yes     | -   | 16        | 13       | yes     | 92                |
| 30  | `/concrete/10-inch-sonotube`                         | 280   | 61           | 76         | yes                      | yes     | -   | 22        | 19       | yes     | 117               |
| 31  | `/measurement/10x12-square-feet`                     | 204   | 62           | 67         | yes                      | yes     | -   | 16        | 13       | yes     | 95                |
| 32  | `/painting/paint-for-12x14-room`                     | 198   | 62           | 57         | yes                      | yes     | -   | 9         | 6        | yes     | 102               |
| 33  | `/measurement/11x14-square-feet`                     | 200   | 63           | 66         | yes                      | yes     | -   | 16        | 13       | yes     | 96                |
| 34  | `/measurement/10x10-square-feet`                     | 203   | 63           | 67         | yes                      | yes     | -   | 16        | 13       | yes     | 96                |
| 35  | `/measurement/12x12-square-feet`                     | 204   | 63           | 67         | yes                      | yes     | -   | 16        | 13       | yes     | 96                |
| 36  | `/concrete/8-inch-sonotube`                          | 280   | 63           | 75         | yes                      | yes     | -   | 22        | 20       | yes     | 123               |
| 37  | `/measurement/35-5-inches-divided-by-2`              | 204   | 65           | 67         | yes                      | yes     | -   | 11        | 8        | yes     | 123               |
| 38  | `/measurement/11x16-square-feet`                     | 202   | 65           | 65         | yes                      | yes     | -   | 16        | 13       | yes     | 98                |
| 39  | `/measurement/5x5-square-feet`                       | 200   | 66           | 66         | yes                      | yes     | -   | 16        | 13       | yes     | 99                |
| 40  | `/measurement/5x10-square-feet`                      | 201   | 67           | 66         | yes                      | yes     | -   | 16        | 13       | yes     | 100               |
| 41  | `/roofing/shingles-for-30x40-roof`                   | 207   | 67           | 60         | yes                      | yes     | -   | 8         | 5        | yes     | 109               |
| 42  | `/concrete/12-inch-sonotube`                         | 280   | 69           | 75         | yes                      | yes     | -   | 22        | 19       | yes     | 136               |
| 43  | `/roofing/shingles-for-30x50-roof`                   | 203   | 69           | 61         | yes                      | yes     | -   | 8         | 5        | yes     | 111               |
| 44  | `/measurement/7x12-square-feet`                      | 202   | 70           | 65         | yes                      | yes     | -   | 16        | 13       | yes     | 107               |
| 45  | `/measurement/29-1-4-inches-divided-by-2`            | 206   | 70           | 64         | yes                      | yes     | -   | 11        | 8        | yes     | 134               |
| 46  | `/measurement/20x20-square-feet`                     | 200   | 71           | 64         | yes                      | yes     | -   | 16        | 13       | yes     | 108               |
| 47  | `/measurement/23-5-8-inches-divided-by-2`            | 202   | 71           | 64         | yes                      | yes     | -   | 11        | 8        | yes     | 130               |
| 48  | `/measurement/3-feet-9-inches-divided-by-2`          | 210   | 72           | 64         | yes                      | yes     | -   | 11        | 8        | yes     | 132               |
| 49  | `/measurement/9-feet-6-inches-divided-by-2`          | 208   | 73           | 64         | yes                      | yes     | -   | 11        | 8        | yes     | 140               |
| 50  | `/concrete/20x10-footing`                            | 294   | 73           | 70         | yes                      | yes     | -   | 22        | 19       | yes     | 148               |
| 51  | `/concrete/16x8-footing`                             | 294   | 74           | 70         | yes                      | yes     | -   | 22        | 19       | yes     | 139               |
| 52  | `/roofing/shingles-for-24x24-roof`                   | 203   | 74           | 61         | yes                      | yes     | -   | 8         | 5        | yes     | 117               |
| 53  | `/measurement/12x30-square-feet`                     | 210   | 76           | 64         | yes                      | yes     | -   | 16        | 13       | yes     | 109               |
| 54  | `/drywall/drywall-for-12x14-room`                    | 234   | 77           | 57         | yes                      | yes     | -   | 9         | 6        | yes     | 112               |
| 55  | `/measurement/22-inches-divided-by-10`               | 207   | 77           | 62         | yes                      | yes     | -   | 11        | 8        | yes     | 126               |
| 56  | `/roofing/shingles-for-12x16-roof`                   | 206   | 77           | 60         | yes                      | yes     | -   | 8         | 5        | yes     | 120               |
| 57  | `/landscaping/soil-for-4x4-raised-bed`               | 201   | 87           | 46         | yes                      | yes     | -   | 8         | 5        | yes     | 120               |
| 58  | `/landscaping/soil-for-4x8-raised-bed`               | 201   | 89           | 46         | yes                      | yes     | -   | 8         | 5        | yes     | 121               |
| 59  | `/landscaping/gravel-for-10x20-driveway`             | 192   | 90           | 53         | yes                      | yes     | -   | 8         | 6        | yes     | 139               |
| 60  | `/landscaping/topsoil-for-20x20-area`                | 196   | 93           | 49         | yes                      | yes     | -   | 8         | 5        | yes     | 111               |
| 61  | `/landscaping/gravel-for-12x50-driveway`             | 194   | 93           | 51         | yes                      | yes     | -   | 8         | 6        | yes     | 142               |
| 62  | `/drywall`                                           | 180   | 95           | 21         | no                       | no      | -   | 7         | 8        | yes     | 95                |
| 63  | `/concrete/650-sq-ft-slab`                           | 333   | 95           | 71         | yes                      | yes     | -   | 22        | 19       | yes     | 137               |
| 64  | `/concrete/1000-sq-ft-slab`                          | 333   | 97           | 70         | yes                      | yes     | -   | 22        | 19       | yes     | 139               |
| 65  | `/concrete/500-sq-ft-slab`                           | 333   | 97           | 71         | yes                      | yes     | -   | 22        | 19       | yes     | 139               |
| 66  | `/landscaping/gravel-for-12x100-driveway`            | 198   | 99           | 49         | yes                      | yes     | -   | 8         | 6        | yes     | 148               |
| 67  | `/landscaping/topsoil-for-10x10-area`                | 202   | 100          | 48         | yes                      | yes     | -   | 8         | 5        | yes     | 118               |
| 68  | `/painting`                                          | 232   | 104          | 21         | no                       | no      | -   | 8         | 9        | yes     | 104               |
| 69  | `/guides`                                            | 641   | 105          | 10         | no                       | no      | -   | 17        | 1        | yes     | 105               |
| 70  | `/terms`                                             | 107   | 106          | 0          | no                       | no      | -   | 0         | 20       | yes     | 106               |
| 71  | `/measurement`                                       | 350   | 106          | 45         | no                       | no      | -   | 23        | 24       | yes     | 106               |
| 72  | `/roofing`                                           | 392   | 158          | 33         | no                       | no      | -   | 19        | 20       | yes     | 158               |
| 73  | `/landscaping/bags-of-mulch-per-yard`                | 188   | 160          | 8          | yes                      | yes     | -   | 5         | 2        | yes     | 290               |
| 74  | `/about`                                             | 195   | 181          | 0          | no                       | no      | -   | 2         | 14       | yes     | 181               |
| 75  | `/concrete`                                          | 500   | 181          | 32         | no                       | no      | -   | 24        | 24       | yes     | 181               |
| 76  | `/landscaping`                                       | 505   | 240          | 16         | no                       | no      | -   | 17        | 18       | yes     | 239               |
| 77  | `/concrete/slab-chart`                               | 755   | 290          | 30         | no                       | yes     | -   | 23        | 21       | yes     | 290               |
| 78  | `/charts`                                            | 343   | 299          | 9          | no                       | no      | -   | 5         | 5        | yes     | 299               |
| 79  | `/privacy`                                           | 345   | 345          | 0          | no                       | no      | -   | 0         | 0        | yes     | 345               |
| 80  | `/`                                                  | 568   | 366          | 5          | no                       | yes     | -   | 23        | 99       | yes     | 366               |
| 81  | `/measurement/square-feet-to-square-meters-chart`    | 486   | 366          | 21         | no                       | yes     | -   | 17        | 14       | yes     | 366               |
| 82  | `/guides/how-to-quote-a-painting-job`                | 648   | 411          | 25         | no                       | yes     | -   | 5         | 5        | yes     | 409               |
| 83  | `/guides/how-much-does-a-gallon-of-paint-cover`      | 535   | 413          | 11         | no                       | yes     | -   | 9         | 3        | yes     | 413               |
| 84  | `/guides/how-to-quote-a-concrete-job`                | 609   | 418          | 22         | no                       | yes     | -   | 7         | 3        | yes     | 418               |
| 85  | `/roofing/roof-pitch-chart`                          | 559   | 420          | 20         | no                       | yes     | -   | 16        | 15       | yes     | 420               |
| 86  | `/editorial-policy`                                  | 501   | 436          | 6          | no                       | yes     | -   | 2         | 89       | yes     | 436               |
| 87  | `/guides/how-to-calculate-square-footage`            | 481   | 449          | 2          | no                       | yes     | -   | 4         | 3        | yes     | 449               |
| 88  | `/guides/concrete-bags-or-truck`                     | 528   | 450          | 6          | no                       | yes     | -   | 5         | 6        | yes     | 448               |
| 89  | `/guides/how-much-does-a-bag-of-concrete-cover`      | 619   | 507          | 9          | no                       | yes     | -   | 10        | 3        | yes     | 507               |
| 90  | `/guides/how-much-soil-for-a-raised-bed`             | 554   | 510          | 4          | no                       | yes     | -   | 4         | 4        | yes     | 510               |
| 91  | `/embed-calculators`                                 | 515   | 514          | 0          | no                       | no      | -   | 1         | 0        | yes     | 514               |
| 92  | `/guides/how-much-does-a-ton-of-gravel-cover`        | 646   | 525          | 7          | no                       | yes     | -   | 10        | 3        | yes     | 525               |
| 93  | `/guides/how-to-measure-roof-pitch`                  | 598   | 529          | 4          | no                       | yes     | -   | 6         | 4        | yes     | 524               |
| 94  | `/guides/how-much-gravel-for-a-driveway`             | 646   | 572          | 5          | no                       | yes     | -   | 4         | 6        | yes     | 571               |
| 95  | `/guides/how-to-quote-a-roofing-job`                 | 754   | 580          | 16         | no                       | yes     | -   | 7         | 3        | yes     | 580               |
| 96  | `/guides/read-a-tape-measure-and-add-fractions`      | 633   | 604          | 2          | no                       | yes     | -   | 4         | 4        | yes     | 604               |
| 97  | `/landscaping/cubic-yard-weight-chart`               | 674   | 618          | 8          | no                       | yes     | -   | 12        | 14       | yes     | 618               |
| 98  | `/guides/how-to-estimate-a-drywall-job`              | 734   | 619          | 7          | no                       | yes     | -   | 4         | 4        | yes     | 619               |
| 99  | `/guides/how-much-concrete-for-a-fence-post`         | 644   | 622          | 3          | no                       | yes     | -   | 4         | 3        | yes     | 622               |
| 100 | `/guides/how-much-mulch-do-i-need`                   | 706   | 630          | 4          | no                       | yes     | -   | 6         | 4        | yes     | 630               |
| 101 | `/guides/how-to-calculate-cubic-yards`               | 743   | 637          | 5          | no                       | yes     | -   | 12        | 6        | yes     | 637               |
| 102 | `/guides/how-to-get-a-contractor-license`            | 684   | 679          | 1          | no                       | yes     | -   | 2         | 4        | yes     | 679               |
| 103 | `/mulch-calculator`                                  | 1518  | 725          | 31         | yes                      | yes     | 8   | 8         | 7        | yes     | 714               |
| 104 | `/topsoil-calculator`                                | 1584  | 786          | 31         | yes                      | yes     | 8   | 11        | 10       | yes     | 763               |
| 105 | `/measurement/decimal-feet-to-feet-and-inches-chart` | 967   | 859          | 9          | no                       | yes     | -   | 12        | 9        | yes     | 859               |
| 106 | `/paint-calculator`                                  | 1481  | 911          | 28         | yes                      | yes     | 8   | 12        | 10       | yes     | 908               |
| 107 | `/drywall-calculator`                                | 1534  | 913          | 28         | yes                      | yes     | 8   | 11        | 9        | yes     | 911               |
| 108 | `/gravel-calculator`                                 | 1538  | 1062         | 27         | yes                      | yes     | 8   | 12        | 11       | yes     | 1056              |
| 109 | `/roof-pitch-calculator`                             | 1519  | 1131         | 20         | yes                      | yes     | 8   | 17        | 16       | yes     | 1119              |
| 110 | `/square-footage-calculator`                         | 1595  | 1174         | 20         | yes                      | yes     | 8   | 18        | 16       | yes     | 1164              |
| 111 | `/feet-and-inches-calculator`                        | 1512  | 1176         | 18         | yes                      | yes     | 8   | 13        | 11       | yes     | 1171              |
| 112 | `/construction-glossary`                             | 1190  | 1179         | 0          | no                       | no      | -   | 0         | 0        | yes     | 1179              |
| 113 | `/roofing-calculator`                                | 1732  | 1182         | 22         | yes                      | yes     | 8   | 11        | 9        | yes     | 1173              |
| 114 | `/concrete-calculator`                               | 1860  | 1450         | 17         | yes                      | yes     | 8   | 28        | 27       | yes     | 1449              |
| 115 | `/methodology`                                       | 3363  | 2853         | 3          | no                       | yes     | -   | 11        | 85       | yes     | 2852              |

## Fixes

### PR 1: job pages (all 66 per language)

Every figure comes from the engine of the page's calculator or from a source the calculator page already cites (QUIKRETE data sheet, IRC 2021 R905, USG, Sherwin-Williams, GAF, WisDOT, NIST SP 811).

- **An intro sentence for every job** (30 new per language): the use of the size (a 4 × 4 ft pad under a condenser, a 24 × 24 ft garage floor), the concrete per foot of depth of a tube (π × r²: 0.35, 0.55 and 0.79 ft³), the volume per foot of a footing, the grade of each roof pitch in percent (rise ÷ 12) and the IRC coverings it allows, the layout use of a division.
- **"How the figures are worked out"**: the first row of the table worked out step by step, in imperial and in metric, for every calculator with jobs except mulch (whose one page already explains its count): the volume, the extra, cubic yards and cubic meters, the bags and their weight for concrete; the area, square yards, square meters and the extra installers add for square footage; the walls, the openings, the gallons, liters and cans for paint; walls, ceiling and sheets for drywall; footprint, slope factor, area, squares and bundles for roofing; multiplier, rafter in feet and meters and the angle for a roof pitch; volume, settling and bags for topsoil; volume, extra, weight, tons and loose yards for gravel; inches, division, sixteenths and meters for a division. A step that rounds a figure it shows is written `≈`, so a reader who checks it by hand never finds a wrong sum.
- **"Before you ..." buying advice**: four tips written for each of 12 kinds of job (slab, tube, footing, roof pitch, area, mulch, gravel, paint, drywall, topsoil, roofing, division): how to measure, the common mistake, when to round up and how to buy, with a link to the guide that goes further.
- **"Roof coverings at this pitch"** on each roof pitch page: the IRC minimum of the six coverings the calculator checks and the verdict at that pitch, worked out by the roof pitch engine.
- Tests: `apps/web/src/lib/job-guide.test.ts`, `apps/web/src/lib/job-worked.test.ts` (hand-verified cases per calculator, and every job's worked example arrives at the answer its page shows), `apps/web/src/views/JobPageView.test.ts`.

| Family                     | Pages per language | Words before (median) | Words after | Unique words before | Unique words after |
| -------------------------- | ------------------ | --------------------- | ----------- | ------------------- | ------------------ |
| Concrete slab and pad      | 12                 | 290                   | 562         | 46                  | 112                |
| Concrete tube              | 3                  | 280                   | 564         | 63                  | 123                |
| Concrete footing           | 2                  | 294                   | 565         | 74                  | 144                |
| Roof pitch                 | 10                 | 202                   | 542         | 49                  | 98                 |
| Square feet                | 11                 | 202                   | 421         | 65                  | 98                 |
| Divide a length            | 6                  | 206                   | 421         | 72                  | 131                |
| Paint for a room           | 5                  | 200                   | 410         | 46                  | 86                 |
| Drywall for a room         | 5                  | 233                   | 451         | 55                  | 90                 |
| Shingles for a roof        | 4                  | 204                   | 454         | 72                  | 114                |
| Topsoil                    | 4                  | 201                   | 389         | 91                  | 119                |
| Gravel driveway            | 3                  | 194                   | 411         | 93                  | 142                |
| Mulch bags per yard        | 1                  | 188                   | 326         | 160                 | 290                |
| **All job pages, English** | 66                 | 204                   | 452         | 63                  | 111                |
| **All job pages, Spanish** | 66                 | 221                   | 484         | 65                  | 113                |

Indexable pages under 120 unique words: 142 of 230 before, 98 after. HTML budgets stay green: the largest job page is about 26 KB against the 49,152 B limit, and `check:site` passes.

One trade-off, stated plainly: the buying advice is shared by the pages of a kind, so the template share of a family rose (near-duplicate pairs 292 to 398, the highest 0.71 between two roof pitches). The unique text per page still nearly doubled, and each page now explains and checks its own answer. If the re-review fails again, the next lever is the noindex step above, not more shared text.

## Recommendation: when to request the re-review

Do not request it right after these merges. Wait until:

1. PR 1 and PR 2 are deployed and Google has recrawled the job pages: check in Search Console that a sample (for example `/concrete/10x10-slab`, `/roofing/6-12-roof-pitch`, `/measurement/22-inches-divided-by-10`) shows a crawl date after the deploy. Request indexing for the hubs and a handful of job pages to speed it up.
2. At least two to three weeks have passed since the rejection. That leaves time for the recrawl and for organic traffic, which a reviewer also sees, to grow a little.
3. The about page's "no advertising" sentence is ready to change in the same merge that adds the ad code.

Earliest sensible date: about **2026-11-24**, after a crawl check. If Cuenta Horas or Pool Figures are approved before then, compare their page mix: an approval there with a similar template points to volume of thin pages here, and the noindex step becomes the first thing to try.
