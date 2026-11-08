# AdSense content audit of the three closed sites (2026-11-08)

Lawn Figures (`apps/lawn`), Bowl Figures (`apps/pets`) and Cuánto Le Cobro (`apps/cobro`) are built and deployed but closed (`SITE.indexable: false`). Before they open and apply to AdSense they must pass `plans/growth/adsense-quality-checklist.md`, written after the maestrocalc.com "low value content" rejection of 2026-11-07 (`plans/growth/adsense-low-value-audit-2026-11-08.md`).

## How the closed sites were measured

A closed site carries `noindex` on every page, so `npm run audit:content -- apps/<app>/dist` reports 0 indexable pages. The audit now takes `--as-open`: every page the sitemap lists counts as indexable whatever its robots meta says, and the pages outside the sitemap (embeds, the 404) keep their own flag. The default is unchanged.

```
npm run build:cobro && npm run audit:content -- apps/cobro/dist --as-open
npm run build:pets  && npm run audit:content -- apps/pets/dist --as-open
npm run build:lawn  && npm run audit:content -- apps/lawn/dist --as-open
```

"Thin" is under 120 unique words (words of 6-word shingles no other indexable page of the language has); "pairs" are same-language near-duplicates (shingle Jaccard 0.5 or more). Medians are per family.

## Baseline and after, per site and family

### Cuánto Le Cobro (546 indexable pages, ES at the root and EN under `/en`)

| Family                                                         | Pages | Thin before | Thin after | Unique words, min / median, before | After     | Template median before / after |
| -------------------------------------------------------------- | ----: | ----------: | ---------: | ---------------------------------- | --------- | ------------------------------ |
| Wage page of a trade in a state                                |   506 |         506 |          8 | 15 / 39                            | 100 / 190 | 78% / 64%                      |
| Wages hub (`/salarios-por-oficio`, `/en/trade-wages-by-state`) |     2 |           2 |          0 | 75 / 75                            | 358 / 387 | 3% / 1%                        |
| Trade quote page (calculator)                                  |    10 |           2 |          0 | 106 / 144                          | 139 / 148 | 59% / 57%                      |
| Wage index of a trade                                          |    10 |           0 |          0 | 194 / 203                          | 188 / 198 | 10% / 11%                      |
| Guides, methodology, trust, embeds index                       |    18 |           0 |          0 | 170 / 191 and up                   | unchanged | unchanged                      |
| **Site**                                                       |   546 |     **510** |      **8** |                                    |           |                                |

Near-duplicate pairs: **767 before, 1 after** (0.50, the landscaper pages of Idaho and Utah, which share most of a Mountain-division table).

What changed on each wage page (`apps/cobro/src/wages/view.ts`, every figure from its own BLS row and tested by hand in `view.test.ts`):

- the week (40 h) and the BLS year of 2,080 hours ("the annual rate for an occupation is calculated by multiplying the hourly wage rate by a typical work year of 2,080 hours", BLS technical notes for the May 2025 OEWS estimates), and the mean against the median, with what the gap says;
- the state against the nation in dollars, percent and a year of work, and its rank;
- its Census division (Census Bureau, "Census Regions and Divisions of the United States"): its place among the states of the division with data, the highest and lowest, and a table of the neighbours with the gap to this state, each linked;
- the five trades of the site in the same state, ranked, with the gap to this trade;
- the state minimum wage, copied from the Cuenta Horas table (U.S. DOL "State Minimum Wage Laws", July 1, 2026; Florida from its constitution), held equal to that table state by state by `minimum-wage.test.ts`: the median against it, in dollars and as a multiple or a percent, and the minimum over 2,080 hours; New York names its upstate rate;
- the starting job of the trade's quote calculator priced by the engine with the state median as the labor rate, against the same job at the national median, with a link that opens the calculator at that rate;
- a sources section listing every source the page reads.

The wages hub now names, per trade, the state that pays the most and the least (from the data) and explains how to read a mean, a median and the 2,080-hour year. The landscaping quote page gained one FAQ, the coverage of a bag of mulch, which is the engine's own arithmetic.

### Bowl Figures (17 indexable pages, English)

| Family                 | Pages | Thin before | Thin after | Unique min / median before | After     |
| ---------------------- | ----: | ----------: | ---------: | -------------------------- | --------- |
| Charts hub (`/charts`) |     1 |           1 |          0 | 27                         | 239       |
| Calculators            |     6 |           4 |          4 | 93 / 104                   | unchanged |
| Charts, guides, home   |     6 |           0 |          0 | 171 / 201                  | unchanged |
| Trust pages            |     4 |           0 |          0 | 124 / 262                  | unchanged |
| **Site**               |    17 |       **5** |      **4** |                            |           |

The charts hub now says what the charts show, each figure read off the charts themselves (a 100 lb dog against a 25 lb dog, a puppy before and after 4 months, the grams of each chocolate for a 20 lb dog), with its Merck and AAHA sources.

The four calculators under 120 (kitten 93, cat 100, dog 102, puppy 104) are tool pages with a sourced method and links to their charts; they pass the checklist thresholds (a quarter of the site, none under 50). Padding them with more shared text would only raise the template share. The one addition worth making is a cat and kitten feeding chart (a data page like the dog and puppy charts, computed by the cat engine), which no page has today.

### Lawn Figures (68 indexable pages, English)

| Family                  | Pages | Thin before | Thin after | Unique min / median before | After       |
| ----------------------- | ----: | ----------: | ---------: | -------------------------- | ----------- |
| Frost page of a state   |    50 |           2 |          1 | 35 / 1,609                 | 115 / 1,693 |
| Frost page, part 2 or 3 |     7 |           1 |          0 | 54 / 504                   | 148 / 608   |
| Frost dates index       |     1 |           1 |          0 | 83                         | 188         |
| Calculators             |     4 |           4 |          2 | 47 / 105                   | 73 / 138    |
| Home, guide, trust      |     6 |           0 |          0 | 147 and up                 | unchanged   |
| **Site**                |    68 |       **8** |      **3** |                            |             |

Near-duplicate pairs: **5 before, 0 after**. Orphans: the part pages (`/frost-dates/<state>/2`) were linked only from the parts navigation; each frost page now links its other parts from its text.

Each frost page sums up its own stations (`apps/lawn/src/frost-summary.ts`, Delaware and Hawaii worked by hand in the test): the range and the middle of the 50% last spring and first fall freeze, the days between the two, and the highest station against the lowest, on the NOAA season line (a spring day from August belongs to the year before, a fall day before August to the year after). The index compares the middle station of each state. Each calculator page shows the engine at its starting values for five lawn sizes (`apps/lawn/src/sizes.ts`).

Left thin: the lime calculator (73) and the sod calculator (95), short tools whose method and sources are complete, and Hawaii (115), which has two NOAA stations: its page says everything its data allows. The lawn tests were not in the root vitest projects, so CI never ran them; they now are.

## Families that cannot be made substantive

None needs to be noindexed or merged. The candidates were the cobro wage pages: 253 per language that read as a table plus one comparison. They now carry eight computed sections from their own BLS row, the state's minimum wage and the engine, and share less than half of their text with any sibling. If Search Console later shows no impressions for a trade in the small states, the fallback is `noindex, follow` on that trade's state pages (they stay linked from the trade index), not more shared text.

## Other checklist items

- Sources (item 4): every wage page lists the BLS OEWS release, the BLS technical notes, the DOL table (or the Florida constitution) and the Census divisions, and the byline check (`check:site:cobro`) holds each link.
- Trust pages (item 7) exist on all three sites; `/about` and `/privacy` are linked only from the footer, which the audit counts as orphaned. A sentence in the home page's main text linking the about page would clear it.
- The template share of the wage pages is still 64% at the median: the sentences are the same frame with different numbers. Near-duplicate pairs fell from 767 to 1, so the frame no longer makes two pages read alike.

## Go or no-go for opening

- **Cuánto Le Cobro: go.** 8 thin of 546 (1.5%), none under 100 unique words, 1 near-duplicate pair at the threshold. YMYL-adjacent (wages): every figure is sourced and tested.
- **Lawn Figures: go.** 3 thin of 68, none under 50, no near-duplicates.
- **Bowl Figures: go, with the cat chart as the next content.** 4 thin of 17 (24%), none under 90, no near-duplicates; pet health is YMYL-adjacent, and every figure cites Merck, AAHA or the ASPCA.

Flipping `SITE.indexable` stays the owner's call; then follow item 10 of the checklist before applying.
