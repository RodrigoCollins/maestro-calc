# Pinterest and Shorts brief: Pool Figures

For the session that publishes on social networks. Written 2026-11-03 from the repo (step 5 of
`plans/growth/PLAN.md`), in the format of the Maestro Calc brief: what the site is, the rules, the
links, pieces with verified figures, the calendar and how to measure.

## What it is and who it is for

**Pool Figures** (poolfigures.com) is a set of free pool calculators, in English, for US pool
owners who look after their own water: the gallons first, then a dose they can pour, in the units
on the jug or the bag. No sign-up; the page address carries the numbers typed, so a copied link
reopens the same calculation.

- **Audience:** owners of in-ground and above-ground pools, saltwater and chlorine. English only:
  Spanish searches are 70 to 140 a month (`plans/pool/PLAN.md`, section 1).
- **Season:** searches peak May to August. The site opened to search engines in November so Google
  has months to index it before the season.

## Content rules

**Do**

- Use only the figures below: each comes from the engine (`packages/pool-core`) with the inputs
  shown and was recomputed by hand; the volume, salt, chlorine and pump defaults match the
  hand-verified cases of `/methodology`.
- Say it is an estimate: volume assumes a straight slope between the ends, measured inside the
  walls.
- Say "follow the label of your product" on every chlorine piece, and "the level your cell asks
  for" on every salt piece (3,200 ppm is Hayward AquaRite's optimum, not every cell's).
- Disclose the AI voice where the platform asks.

**Don't**

- Give shock levels, algaecide doses, pH or alkalinity doses, or any chemical advice the site does
  not compute. The water targets the site cites are CDC's (free chlorine at least 1 ppm, at least
  2 ppm with cyanuric acid or a stabilized chlorine; pH 7.0 to 7.8) and Hayward's opening guide
  (1 to 3 ppm; pH 7.2 to 7.8).
- Mention household bleach: it is out of the calculator on purpose (its percent is by weight and
  its density varies).
- Name brands as sponsors: the site has no sponsors. Hayward, CDC and the ICC are cited as sources
  only.
- Show a kidney-shaped pool: the calculator has no exact formula for it.

## Links

| Page                                                       | URL                                               |
| ---------------------------------------------------------- | ------------------------------------------------- |
| Home                                                       | https://poolfigures.com/                          |
| Pool volume (rectangle, round, oval)                       | https://poolfigures.com/pool-volume-calculator    |
| Pool salt                                                  | https://poolfigures.com/pool-salt-calculator      |
| Chlorine (12.5% and 10% liquid, cal-hypo 65%, dichlor 56%) | https://poolfigures.com/pool-chlorine-calculator  |
| Pump size                                                  | https://poolfigures.com/pool-pump-size-calculator |
| Guide: opening your pool this spring                       | https://poolfigures.com/opening-your-pool         |
| Methodology                                                | https://poolfigures.com/methodology               |

## 20 pins

Format 1000 × 1500: the figure big, as the site's depth-marker tile ("22,023 GALLONS"), the inputs
small under it. `utm_campaign` = the id.

| Id     | Pin title                                  | Figure on screen (inputs → result)                                                                                                 | Link                       |
| ------ | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| pf-p01 | How many gallons is a 16 × 32 pool?        | Rectangle 32 × 16 ft, 3 ft 6 in to 8 ft deep → **22,023 gal** (83,365 L, 2,944.0 ft³)                                              | /pool-volume-calculator    |
| pf-p02 | Same pool, flat 4 ft: about 30% less water | Rectangle 32 × 16 ft, 4 ft both ends → **15,320 gal**, against 22,023 with a deep end                                              | /pool-volume-calculator    |
| pf-p03 | 24 ft round above-ground pool              | Round, 24 ft across, 4 ft deep → **13,536 gal**                                                                                    | /pool-volume-calculator    |
| pf-p04 | 18 ft round pool gallons                   | Round, 18 ft across, 4 ft deep → **7,614 gal**                                                                                     | /pool-volume-calculator    |
| pf-p05 | 15 ft round pool gallons                   | Round, 15 ft across, 4 ft deep → **5,288 gal**                                                                                     | /pool-volume-calculator    |
| pf-p06 | Oval 15 × 30 pool gallons                  | Oval 30 × 15 ft, 4 ft deep → **10,575 gal**                                                                                        | /pool-volume-calculator    |
| pf-p07 | A big 20 × 40 in-ground pool               | Rectangle 40 × 20 ft, 3 ft 6 in to 8 ft → **34,410 gal**                                                                           | /pool-volume-calculator    |
| pf-p08 | How many bags of pool salt?                | 20,000 gal, 2,400 → 3,200 ppm → **133.4 lb, 4 bags of 40 lb**; add 100.1 lb first                                                  | /pool-salt-calculator      |
| pf-p09 | Salt for a brand-new salt pool             | 15,000 gal, 0 → 3,200 ppm → **400.3 lb, 11 bags of 40 lb**                                                                         | /pool-salt-calculator      |
| pf-p10 | A spring salt top-up                       | 10,000 gal, 2,800 → 3,200 ppm → **33.4 lb, 1 bag**                                                                                 | /pool-salt-calculator      |
| pf-p11 | Too much salt? It does not wear off        | 20,000 gal reading 3,600 ppm, target 3,200 → **0 lb**: the only way down is to drain part and refill                               | /pool-salt-calculator      |
| pf-p12 | Three quarters first, then test            | 133.4 lb to add → **100.1 lb first**, run the pump 24 hours, test, then the rest (Hayward AquaRite manual)                         | /pool-salt-calculator      |
| pf-p13 | How much liquid chlorine to add            | 20,000 gal, free chlorine 1 → 3 ppm, liquid 12.5% → **41.0 fl oz**                                                                 | /pool-chlorine-calculator  |
| pf-p14 | Liquid, cal-hypo or dichlor?               | 20,000 gal, 1 → 3 ppm → 12.5% liquid **41.0 fl oz** · 10% liquid 51.2 fl oz · cal-hypo 65% 8.2 oz · dichlor 56% 9.5 oz (by weight) | /pool-chlorine-calculator  |
| pf-p15 | The chlorine rule of thumb                 | **10.24 fl oz** of 12.5% liquid raises 10,000 gal by 1 ppm                                                                         | /pool-chlorine-calculator  |
| pf-p16 | What size pool pump do I need?             | 20,000 gal → **55.6 gpm** for a 6-hour turnover; 41.7 gpm for 8 hours                                                              | /pool-pump-size-calculator |
| pf-p17 | Small pool, same minimum flow              | 10,000 gal → 27.8 gpm by turnover, but the standard's floor is **36 gpm** (ANSI/APSP/ICC-15)                                       | /pool-pump-size-calculator |
| pf-p18 | Opening your pool: the order               | Cover → equipment → water level → pump and leaks → test → salt → shock and chlorine → vacuum next day                              | /opening-your-pool         |
| pf-p19 | Opening day water targets                  | CDC: free chlorine **at least 1 ppm** (2 ppm with cyanuric acid), pH 7.0 to 7.8                                                    | /opening-your-pool         |
| pf-p20 | One 24 ft round pool, every number         | 13,536 gal → salt 0 → 3,200 ppm: 361.2 lb (10 bags) · chlorine 1 → 3 ppm, 12.5%: 27.7 fl oz · pump 37.6 gpm                        | /pool-volume-calculator    |

## 10 Shorts scripts

The Maestro Calc system: a screen recording of the phone, no face, AI voice, 30 to 45 seconds, the
big figure last. Link in the description, with UTM.

**pf-v01: "Your pool holds more than you think"** → `/pool-volume-calculator`

- Hook: "A 16 by 32 pool. How many gallons?"
- Type rectangle, 32 ft by 16 ft.
- Shallow end 3 ft 6 in, deep end 8 ft.
- On screen: 512 ft² × 5.75 ft average depth = 2,944 ft³.
- Figure: **22,023 gallons**. "Every dose starts from this number."

**pf-v02: "Above-ground pool gallons in 10 seconds"** → `/pool-volume-calculator`

- Hook: "A 24-foot round pool, 4 feet of water."
- Pick round; the length is the diameter.
- Depth 4 ft at both ends.
- On screen: π × 24² ÷ 4 = 452.4 ft² × 4 ft.
- Figure: **13,536 gallons**.

**pf-v03: "How many bags of salt?"** → `/pool-salt-calculator`

- Hook: "Your salt reads 2,400. Your cell wants 3,200."
- 20,000 gallons, 2,400 now, 3,200 target.
- On screen: 20,000 × 800 × 8.34 ÷ 1,000,000.
- 133.4 lb: four 40 lb bags.
- Figure: **add 100.1 lb first**, run the pump 24 hours, test, then the rest.

**pf-v04: "Salt for a new salt pool"** → `/pool-salt-calculator`

- Hook: "Converting to salt? Here is the first bag count."
- 15,000 gallons, salt now 0, target 3,200.
- On screen: 400.3 lb.
- "Pool salt over 99% sodium chloride. On new plaster, wait 10 to 14 days."
- Figure: **11 bags of 40 lb**.

**pf-v05: "How much liquid chlorine?"** → `/pool-chlorine-calculator`

- Hook: "Free chlorine at 1. You want 3. How much do you pour?"
- 20,000 gallons, 1 ppm now, 3 ppm target.
- Product: liquid chlorine 12.5%.
- On screen: 10.24 fl oz per ppm per 10,000 gallons × 2 ppm × 2.
- Figure: **41.0 fl oz**. "Follow the label of your product."

**pf-v06: "Same pool, four chlorines"** → `/pool-chlorine-calculator`

- Hook: "The dose depends on what is in your shed."
- 20,000 gallons, 1 → 3 ppm.
- Switch the product: 12.5% liquid 41.0 fl oz; 10% liquid 51.2 fl oz.
- Cal-hypo 65%: 8.2 oz by weight; dichlor 56%: 9.5 oz.
- Figure: the four side by side. "The strength is on the label."

**pf-v07: "What size pump?"** → `/pool-pump-size-calculator`

- Hook: "The pool standard wants all your water filtered in 6 hours."
- 20,000 gallons ÷ 360 minutes.
- On screen: 55.6 gpm; the gentler 8-hour run, 41.7 gpm.
- Then 10,000 gallons: 27.8 gpm by turnover, but never below 36.
- Figure: **55.6 gpm**, and 36 gpm as the floor.

**pf-v08: "Open your pool in this order"** → `/opening-your-pool` (late February to April)

- Hook: "Open your pool in the order that saves a second trip to the store."
- Check last season's chemicals; take the cover off; put the equipment back.
- Know your gallons; start the pump and look for leaks.
- Test; salt if you have a cell; shock at sundown, then chlorine; vacuum the next day.
- Figure: CDC's targets, free chlorine at least 1 ppm, pH 7.0 to 7.8.

**pf-v09: "Too much salt"** → `/pool-salt-calculator`

- Hook: "Your salt reads 3,600. Can you add something to bring it down?"
- 20,000 gallons, 3,600 now, 3,200 target.
- The calculator says 0 lb and shows the warning.
- "Salt does not wear off: the only way to lower it is to drain part of the water and refill."
- Figure: **0 lb**.

**pf-v10: "One pool, every number"** → `/pool-volume-calculator`

- Hook: "A 24-foot round pool. Here is everything you need to buy."
- Volume: 13,536 gallons.
- Salt from 0 to 3,200 ppm: 361.2 lb, 10 bags.
- Chlorine 1 → 3 ppm with 12.5% liquid: 27.7 fl oz.
- Figure: pump **37.6 gpm**.

## Calendar

Scheduled, never in bursts. The rule of `plans/growth/PLAN.md` (lever 5): index now, push in
season. Pins keep circulating for months, so a few evergreen volume pins go out early; the Shorts
wait for March.

| Window                     | Pins                                                                                                                      | Shorts                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| 10 Nov 2026 to 28 Feb 2027 | pf-p01, pf-p03, pf-p04, pf-p05, pf-p16: one every three weeks                                                             | none                                                                                   |
| 1 Mar to 31 May 2027       | pf-p18, pf-p19, pf-p12, pf-p08, pf-p09, pf-p10, pf-p02, pf-p06, pf-p13, pf-p14, pf-p20, pf-p07: one a week, opening first | pf-v08 (1 Mar), then pf-v01, pf-v02, pf-v03, pf-v04, pf-v05, pf-v06: one every 10 days |
| 1 Jun to 31 Aug 2027       | pf-p11, pf-p15, pf-p17, then repins of the five pins with most clicks: one a week                                         | pf-v07, pf-v09, pf-v10: one every two weeks from 1 Jun                                 |

Before each window, check Search Console queries for the site and move the matching pieces up
(lever 4 of `plans/growth/PLAN.md`).

## How to measure

Tag every link, for example:

`https://poolfigures.com/pool-salt-calculator?utm_source=pinterest&utm_medium=social&utm_campaign=pf-p08`

- `utm_source`: pinterest or youtube. `utm_medium`: social. `utm_campaign`: the piece's id.

## Unverified or owner items

- GA4 for Pool Figures is live since 2026-11-04 (property p562288527, seen in Realtime): UTM
  visits show under session source/medium and campaign.
- Pinterest and YouTube accounts for Pool Figures: nothing in the repo says they exist. Creating
  them is Rodrigo's call.
- The links with the inputs filled in are not written out here: type the values, then copy the
  address bar.
