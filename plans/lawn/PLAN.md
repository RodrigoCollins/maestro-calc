# Plan — Lawn and garden calculators (niche 4)

Status: design approved 2026-11-07; built 2026-11-08 to the parity of Pool Figures, closed to
search engines (`SITE.indexable` false) until the owner opens it (section 7). Brand: Lawn Figures,
lawnfigures.com (bought).

## 1. Why this niche

- US homeowners who feed, seed and lime their own lawn need a number they can pour into the
  spreader: pounds of the bag in their garage, not pounds of nitrogen.
- The extension services publish the rates (lb of N, lb of seed, lb of lime per 1,000 sq ft) but
  leave the conversion to the reader. Most calculators that rank skip the sources.
- Seasonal: lawn fertilizer demand "spikes in April" (SaleHoo, secondary, in
  `~/research_notes/Nichos sitio de calculadoras EEUU/home_diy_garden.md`); the seeding sources
  below add a fall window for cool-season lawns. Google Trends curves were not pulled (they need a
  browser). Launch by early January 2027 so Google has two or three months before the March-April
  peak; September is the second chance.
- Low risk of harm compared with pool chemistry, but fertilizer runoff matters: the pages state
  the per-application limits of the sources and never suggest more.

## 2. Keyword data (seodata.dev, US, pulled 2026-11-07)

seodata.dev is the free API the pool plan used (`api.seodata.dev/v1/keyword?q=…&country=us`, 20
queries a day, no account). Volumes are Google Ads monthly buckets; variants share a bucket, so
they are not added up. "Cached" is the date seodata last refreshed the keyword.

| Keyword | Volume / month | CPC | Cached |
|---|---|---|---|
| "hardiness zone by zip code" (and "plant zones by zip code") | 18,100 | $0.27 | 2026-10-21 |
| "plant hardiness zones by zip code" | 22,200 | $0.71 | 2026-10-21 |
| "sod calculator" | 8,100 | $4.15 | 2026-08-07 |
| "sod estimate" | 6,600 | $2.06 | 2026-08-07 |
| "last frost date by zip code" | 6,600 | $0 | 2026-10-18 |
| "last frost date" | 5,400 | $0 | 2026-10-18 |
| "first frost date by zip code" | 2,900 | $0 | 2026-10-18 |
| "fertilizer calculator" | 2,400 | $2.55 | 2026-07-27 |
| "grass seed calculator" | 2,400 | $4.59 | 2026-06-10 |
| "plant spacing calculator" (5 variants at the same bucket) | 2,400 | $0-2.78 | 2026-07-27 |
| "lawn fertilizer calculator" / "yard fertilizer calculator" | 880 | $9.79 | 2026-07-27 |
| "lawn fertilization calculator" | 720 | — | 2026-07-27 |
| "lawn square footage calculator" | 720 | $1.17 | 2026-11-07 |
| "fertilizer calculator app" | 390 | — | 2026-11-07 |
| "how much grass seed per sq foot" | 390 | $0.23 | 2026-11-07 |
| "liquid fertilizer calculator" | 260 | — | 2026-11-07 |
| "lawn lime calculator" | 210 | — | 2026-10-18 |
| "lime rate calculator" / "lime application rate calculator" | 170 / 140 | — | 2026-10-18 |
| "npk calculator" / "fertilizer npk calculator" | 110 / 110 | — | 2026-07-27 |
| "sprinkler zone calculator" / "sprinkler calculator" | 260 / 140 | $13.28 / $6.33 | 2026-10-31 |
| "lawn watering calculator" / "grass watering calculator" | 70 / 70 | — | 2026-07-27 |

Already on Maestro Calc (section 3): "mulch calculator" 49,500 ($2.33), "soil calculator"
22,200 ($1.83), "raised bed soil calculator" 5,400 ($0.69), "compost calculator" 3,600 ($6),
"composting calculator" 1,000.

Ahrefs free view (owner, US, 2026-11-07): "fertilizer calculator" KD Easy, more than 1,000 a
month, 121 variants; "fertilizer calculator app", "lawn fertilizer calculator" and "liquid
fertilizer calculator" Easy, more than 100; "grass seed calculator" Easy, more than 1,000 (19
variants). The two sources agree on the order of size.

Avoid "garden calculator": 5,400 a month, CPC $0 (seodata 2026-11-02), and the results are about
the Roblox game "Grow a Garden".

Lawn care runs on watering and sprinkler searches far less than expected: under 300 a month each.
They go to guides, not calculators.

## 3. Launch set

Overlap check against `packages/core/src/calculators/` (2026-11-07): concrete, drywall,
feet-inches, gravel, mulch, paint, rectangle-area (square footage), roof-pitch, roofing, topsoil.
Maestro Calc also has the `/landscaping` hub and the guides "How much soil for a raised bed" and
"How much mulch do I need". The lawn site links to these and does not rebuild them:

- Mulch, gravel: `maestrocalc.com/mulch-calculator`, `/gravel-calculator`.
- Raised bed soil and compost: the same volume (length x width x depth, bags or cubic yards) as
  `/topsoil-calculator` and its raised-bed guide. A second copy on a new domain would compete with
  our own page for "soil calculator". Revisit only if the owner wants mix ratios (e.g. topsoil plus
  compost), which need a source first.
- Lawn area of odd shapes: `/square-footage-calculator`. Each lawn calculator takes the area as
  one number or as length x width.

Launch (all new, none in Maestro Calc):

1. Lawn fertilizer: area, the three numbers on the bag (N-P-K), the target pounds of N per
   1,000 sq ft (0.5 to 1.0, default 1.0), bag weight; pounds of product, bags, and the P and K
   that come with it. Granular only (liquid: section 4).
2. Grass seed: area, species, new lawn; pounds of seed and bags. Species limited to the ones with
   a verified rate (section 4).
3. Sod: area, waste allowance, pallet size of the supplier; square feet to order, pallets, slabs
   or rolls.
4. Lime: area, the soil test recommendation (lb per 1,000 sq ft), the CCE on the product label,
   bag weight; pounds of product and bags.
5. Frost dates (data pages, live before February 2027): one page per state with every station's
   last spring and first fall 32°F date at 10, 50 and 90% probability from the NOAA 1991-2020
   normals, a ZIP lookup inside the page, and a link to the nearest station's row. Same pattern
   as the per-state pages of Cuenta Horas (`apps/pay/src/states`). No page per ZIP: tens of
   thousands of near-identical pages would read as scaled content.

Plus a methodology page and one guide ("When to fertilize and seed your lawn").

Later, in order: plant spacing (geometry, needs one extension citation), hardiness zone by ZIP
(highest volume, but USDA's own map ranks first; the data terms in section 4 set what we may
show), lawn watering (guide: inches a week to gallons), sprinkler run time.

Competitors seen 2026-11-07 (web search; ads not measured, a fetch does not show them):

| Site | Keyword | Weakness |
|---|---|---|
| inchcalculator.com/grass-seed-calculator | grass seed | 12 species, no source cited for any rate; no Spanish |
| lawnphix.com/lawn-fertilizer-calculator | lawn fertilizer | about 2,000 words before the tool; affiliate and shop links; no source cited |
| lowes.com, angi.com, eartheasy.com | grass seed, sod | retailer or lead-gen pages; rates without sources |
| almanac.com/gardening/frostdates | frost dates | one date per place at a 30% threshold; the normals period is not named; store and newsletter prompts |
| many `*.pages.dev` clones (simplifycalc, nestquantum, calk-usa, landscape-calcs…) | all | AI-built, no sources: competition, never sources |

Our edge is the same as on the other sites: the extension source on the page, the per-application
limit shown, fast pages with no script outside the calculator.

## 4. Formulas and sources (checked 2026-11-07)

Fertilizer (granular)

- lb of product per 1,000 sq ft = target lb N per 1,000 sq ft / (%N / 100). Total = that x area /
  1,000. Bag coverage = bag lb / product lb per 1,000 x 1,000.
  - Purdue, "Calculating the pounds of fertilizer to apply", Zac Reicher, 2004:
    https://turf.purdue.edu/calculating-the-pounds-of-fertilizer-to-apply/ (0.75 lb N with 16-8-8
    = 4.69 lb per 1,000 sq ft).
  - Penn State Extension, "Calculations used to determine the amount of fertilizer needed to
    treat turf", Peter Landschoot, updated October 2025:
    https://extension.psu.edu/calculations-used-to-determine-the-amount-of-fertilizer-needed-to-treat-turf
    (1.0 lb N with 26-5-10 = 3.8 lb; a 50 lb bag covers 13,200 sq ft). These two cases become the
    hand-verified cases of the methodology table.
- P and K delivered: the same product weight x %P2O5 and x %K2O (the label states the oxides).
- Rates, cool-season lawns: Purdue AY-22-W, "Fertilizing Established Cool-season Lawns", Bigelow,
  Camberato, Patton, Aug. 2013 (https://www.extension.purdue.edu/extmedia/ay/ay-22-w.pdf): target
  normally 0.5 to 1.0 lb actual N per 1,000 sq ft; "Do not apply more than 1.0 pound of actual
  water-soluble N per 1,000 square feet in any single application"; up to 2 lb when more than 50%
  is slow-release; mature lawns need 1 to 5 lb N a year. The calculator caps the target at 1.0 lb
  and warns above it.
- Left out: warm-season N rates (the UF/IFAS page for centipedegrass, LH009, failed to load:
  redirect loop) and state fertilizer laws (phosphorus bans, blackout dates); both need a primary
  page before the site states them.
- Left out: liquid fertilizer. Its dose needs the product density (lb per gallon) from the label,
  and no extension page with that formula was read today. Volume is small (260).

Grass seed (new lawns, lb of seed per 1,000 sq ft)

| Species | Virginia Tech 426-718 | Tennessee W160-B (2007) |
|---|---|---|
| Kentucky bluegrass | 2 to 3 | 1½ to 2 |
| Tall fescue | 4 to 6 | 5 to 8 |
| Fine fescue (TN: chewings, red, sheep) | 3 to 5 | 3 to 5 |
| Perennial ryegrass | 3 to 5 | 4 to 6 |
| Bermudagrass, hulled | 1 to 1½ | ½ to 1 |
| Bermudagrass, unhulled | 5 to 10 | double the hulled rate |

- Virginia Cooperative Extension 426-718, "Establishing Lawns":
  https://vtechworks.lib.vt.edu/bitstreams/b0fdf313-cafa-4f60-a85b-68637d6bbd3c/download. Also:
  sow half the seed north-south and half east-west.
- University of Tennessee W160-B, "Turfgrass Establishment: Seeding", Samples and Sorochan, 2007:
  https://uthort.tennessee.edu/wp-content/uploads/sites/228/2023/11/W160-B.pdf.
- The sources disagree by up to 50% (bluegrass, bermudagrass). The calculator shows the range of
  the source the user picks, low and high, and names both on the methodology page.
- Zoysiagrass (Zoysia japonica): 1.0 to 2.0 lb pure live seed (PLS) per 1,000 sq ft for rapid
  establishment, 0.5 lb to reduce cost. University of Arkansas MP476, "Establishing Seeded
  Zoysiagrass on Lawns and Golf Courses", Aaron Patton:
  https://www.uaex.uada.edu/publications/PDF/MP476.pdf.
- Left out: centipedegrass (the Tennessee table's fractions do not survive text extraction, and the
  UGA and UF pages were not read), overseeding rates (no extension table read today), St.
  Augustinegrass and bahiagrass (not in the tables read).

Sod

- Square feet to order = area x (1 + waste %). Pallets = ceil(order / pallet sq ft). Slabs = ceil(
  order / slab sq ft). Plain geometry.
- Pallet and slab sizes are supplier choices: 400, 450 or 500 sq ft a pallet and 16 x 24 in slabs
  (2.67 sq ft) per supplier pages (thegrassoutlet.com, angi.com), not a primary source. The page
  asks for the supplier's figure and offers those as choices, labeled "ask your sod farm". No
  default waste figure is claimed: the user sets it.

Lime

- lb of product per 1,000 sq ft = soil test recommendation (lb CCE per 1,000 sq ft) x 100 / label
  CCE %. Total = that x area / 1,000. Penn State Agricultural Analytical Services Lab, "Lime
  recommendations, turf": recommendations are "pounds of calcium carbonate equivalent (CCE) per
  1000 square feet" and must be adjusted when the limestone "is significantly different from 100%
  CCE": https://agsci.psu.edu/aasl/soil-testing/fertility/handbooks/turf/tables/lime-recommendations-turf.
  The x 100 / CCE step is the plain adjustment; no extension page with the formula written out was
  read today.
- No soil test, no rate: the calculator never guesses a lime rate from pH alone.
- Left out: a per-application maximum (50 lb per 1,000 sq ft appears in search summaries, but the
  primary page was not read).

Frost dates (data pages)

- NOAA NCEI U.S. Climate Normals 1991-2020, annual/seasonal product, more than 15,000 stations in
  the normals overall (not all have freeze data). Fields `ann-tmin-prblst-t32fp10/50/90` (last
  spring 32°F) and `ann-tmin-prbfst-t32fp10/50/90` (first fall 32°F); 36°F (frost) and 28°F (hard
  freeze) also exist; flag `V` means year-round risk. Documentation:
  https://www.ncei.noaa.gov/pub/data/cdo/documentation/normals-annualseasonal-1991-2020_documentation.pdf.
  Data: https://www.ncei.noaa.gov/data/normals-annualseasonal/1991-2020/access/ (answers 200).
  US government data, public domain.
- NC State Extension explains how to read the probabilities (10/50/90%):
  https://content.ces.ncsu.edu/interpreting-freezefrost-probabilities-from-the-national-centers-for-environmental-information.
- ZIP lookup: the nearest station with freeze data to the ZIP's centroid (Census ZCTA gazetteer,
  public domain; a ZCTA is not exactly a ZIP and the page says so), with the station's name and
  distance shown. To build and verify before the frost pages ship.

Hardiness zones (later)

- PRISM Climate Group, Oregon State, 2023 USDA Plant Hardiness Zone Map, ZIP listing
  `phzm_us_zipcode_2023.csv` (plus AK, HI, PR): https://prism.oregonstate.edu/phzm. Terms: free
  to reproduce and redistribute; maps derived from the GIS data must show the USDA-ARS and OSU
  logos; altered data must carry a prominent "not the official USDA map" disclaimer. Read the full
  terms before building.

## 5. Design (approved: "mowing stripes", canvas v2, 2026-11-07)

Supersedes the "guaranteed analysis" proposal. Each site differs from its siblings in structure,
not only palette (Bowl Figures: the bowl; Cuenta Horas: cream paper; Pool Figures: depth marker).

- Tokens: page ground and cream text on green #F6F1E4; ink #1D3B22; hero of diagonal mowing
  stripes #2E6B34 / #367A3C; seed-bag yellow #F2D14B (dark text only). Dark-mode tokens too; text
  contrast of 4.5:1 measured, not assumed.
- Type: Young Serif (headings, figures) and Inter (text), self-hosted woff2 from Fontsource inside
  the four-file budget of `packages/site-kit/src/budgets.ts`.
- Structure: the hero is the stripes; a white form card floats over the bottom of the hero with a
  soft shadow; the N-P-K inputs are dark green tiles with yellow digits.
- Signature result: a yellow seed-bag tag tilted about -2.5deg with a punched hole and a string,
  reading like "20.8 lb = 2 bags of 15 lb". The over-limit warning is text with a rule, never
  colour alone.
- Crosswise spreader-pass drawing: half the rate north-south, half east-west (Virginia Tech).
- Frost pages: a growing-season bar chart per station with the 10, 50 and 90 percent dates.
- A dark green "the math" block with the sources.

## 6. Architecture

The same monorepo pattern as Cuenta Horas and Pool Figures: `apps/lawn` (Astro, its own Worker,
`wrangler.jsonc` and domain) and `packages/lawn-core` (calculators on `@maestro-calc/core`: the
input builders `lengthInput`, `percentInput`, `selectInput`, `moneyInput` and exact `Rational`
arithmetic; one subpath export per calculator, as in `packages/pool-core/package.json`; its own
Stryker shard and CI matrix entry). Reuse `packages/site-kit` as it is: `budgets` (the Maestro
Calc ceilings), `canonical`, `check-site`, `embed`, `indexnow`, `json-ld`, `link-preview`,
`seo-check`, `sitemap`, `track` (GA4 usage events, as in #352). Root scripts `build:lawn` and
`check:site:lawn`; an e2e suite `tooling/site-browser/e2e-lawn` (phone and no-js) against
`wrangler dev` on the next free port (8790), with `CALCULATOR_PAGES` held equal to the
`*-calculator.astro` pages by a test, as pool does.

Frost data: a build-time script reads the NCEI CSVs once and writes a numbers-only module per
state (station id, name, lat/lon, six dates), committed with its source URL and pull date, like
the state tables of Cuenta Horas. The ZIP lookup is a small per-state JSON loaded only by the
frost pages, inside the calculator-page JavaScript budget. Seeding rates live in `lawn-core` with
the source of each row, so the methodology page and the calculator read the same table.

Cross-links: lawn pages link to the Maestro Calc mulch, topsoil, gravel and square-footage
calculators; Maestro Calc's `/landscaping` hub links back once the site is live.

## 7. Open items for the owner

Built (2026-11-08): `apps/lawn` and `packages/lawn-core`, `packages/lawn-data`, the four
calculators, the frost date pages, the methodology, the timing guide, about, editorial policy,
privacy, `llms.txt`, sitemap, robots, `_headers`, the 404, the link preview, the e2e suites, the
CI jobs and the IndexNow step. What only the owner can do:

- Cloudflare: create the Workers Builds project `lawn-figures` (deploy command
  `npx wrangler deploy --config apps/lawn/wrangler.jsonc`, as for Pool Figures) and attach
  lawnfigures.com. Until the project exists, the `niche-sites` job of `deploy.yml` waits for its
  check and fails for `lawn`.
- Mail: forward `hello@lawnfigures.com` (the address the privacy page and the editorial policy give
  for error reports) to the team's inbox.
- Analytics: create the GA4 property and set `SITE.gaId` in `apps/lawn/src/site.config.ts`; the
  loader is already in place and stays inactive while it is empty. The privacy page already
  describes Google Analytics, so set the id at launch, not before opening the site.
- Launch: flip `SITE.indexable` to `true` (and update `site.config.test.ts`). `check:site:lawn`
  already checks every page as it will read at that moment (canonical, `og:url`, JSON-LD), so the
  flip is one line. Then submit the sitemap in Search Console and Bing.
- Pinterest tag: none, as the brief says; add one with the others if wanted.
- Approve the launch date: live by early January 2027 for the March to April fertilizer peak, with
  the frost pages before February.
- Optional: one month of Ahrefs or Semrush for keyword difficulty, to measure the frost-date and
  hardiness SERPs (Almanac, USDA) that the free views do not show.

Decisions taken during the build:

- Spanish: not at launch, as decided above. Spanish calculator searches return 0 (seodata
  2026-11-07); a Spanish fertilizer page can follow if Search Console shows Spanish queries.
- WhatsApp share on every calculator and on the frost pages, as Cuenta Horas does: a plain wa.me
  link whose address carries the calculator's state.
- Frost pages: one per state with every station of the NOAA 1991-2020 normals that has freeze
  data, 50 states (the District of Columbia has no station with freeze data; its ZIP codes resolve
  to a neighbouring station). A state with more than 200 stations is split into parts sorted by
  name (`/frost-dates/texas`, `/frost-dates/texas/2`, ...) so each page stays inside the 49,152 B
  HTML budget. The ZIP lookup downloads one static shard of ZIP codes by first digit and one JSON
  file of the station's state, both built by `packages/lawn-data/scripts/build-frost.ts`.
- Levels: 32°F only, at the 10, 50 and 90 percent levels. The 36°F and 28°F levels exist in the
  files and are left out.
- FAQ markup: the shared `seo-check` of `packages/site-kit` refuses `FAQPage` JSON-LD, so the
  guide shows its questions as plain text.

Left out, and why:

- Hardiness zones by ZIP, plant spacing, watering and sprinkler run time: "Later" in section 3.
- Warm-season nitrogen rates, state fertilizer laws, liquid fertilizer, centipedegrass,
  St. Augustinegrass, bahiagrass, overseeding rates and a lime per-application maximum: no primary
  page was read (section 4).
- Embeds: the site has no embed pages; add them as Pool Figures does if the growth plan wants them.
