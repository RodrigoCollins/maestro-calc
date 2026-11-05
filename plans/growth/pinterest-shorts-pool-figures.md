# Pinterest and Shorts brief: Pool Figures

For the session that publishes on social networks. Written 2026-11-03 from the repo (step 5 of
`plans/growth/PLAN.md`), in the format of the Maestro Calc brief: what the site is, the rules, the
links, pieces with verified figures, the calendar and how to measure. Extended 2026-11-05 with what
shipped since (the pH, calcium hardness, heater size, fill time, alkalinity and stabilizer
calculators, six guides and the job pages): pins pf-p21 to pf-p39 and Shorts pf-v11 to pf-v18,
each figure copied from the text of the live page.

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
- Keep the label safety note the page states on every chemical piece (pf-p21 onward): on acid, "add
  acid to water, never water to acid", at the deep end with the pump running, never mixed with
  chlorine, and the label's most a day (32.0 fl oz per 20,000 gallons, so a bigger dose goes in over
  more than one day, with a test before each part); on soda ash, at most 1 lb per 10,000 gallons at
  a time, then 2 to 3 hours and a retest; on calcium chloride, the first part, 12 hours with the
  pump, a test, then the rest; on shock, never mixed with anything, and swim only when free
  chlorine is back down to the label's level (4 ppm cal-hypo, 3 ppm dichlor).

**Don't**

- Give algaecide doses, or any chemical dose or advice the site does not compute. The pH,
  alkalinity, stabilizer, calcium and shock doses in the pieces below are the calculators' and job
  pages' own figures. The water targets the site cites are CDC's (free chlorine at least 1 ppm, at least
  2 ppm with cyanuric acid or a stabilized chlorine; pH 7.0 to 7.8) and Hayward's opening guide
  (1 to 3 ppm; pH 7.2 to 7.8).
- Mention household bleach: it is out of the calculator on purpose (its percent is by weight and
  its density varies).
- Name brands as sponsors: the site has no sponsors. Hayward, CDC and the ICC are cited as sources
  only.
- Show a kidney-shaped pool: the calculator has no exact formula for it.

## Links

| Page                                                       | URL                                                                         |
| ---------------------------------------------------------- | --------------------------------------------------------------------------- |
| Home                                                       | https://poolfigures.com/                                                    |
| Pool volume (rectangle, round, oval)                       | https://poolfigures.com/pool-volume-calculator                              |
| Pool salt                                                  | https://poolfigures.com/pool-salt-calculator                                |
| Chlorine (12.5% and 10% liquid, cal-hypo 65%, dichlor 56%) | https://poolfigures.com/pool-chlorine-calculator                            |
| Pump size                                                  | https://poolfigures.com/pool-pump-size-calculator                           |
| Guide: opening your pool this spring                       | https://poolfigures.com/opening-your-pool                                   |
| Methodology                                                | https://poolfigures.com/methodology                                         |
| pH (muriatic acid to lower, soda ash to raise)             | https://poolfigures.com/pool-ph-calculator                                  |
| Alkalinity (baking soda)                                   | https://poolfigures.com/pool-alkalinity-calculator                          |
| Stabilizer (cyanuric acid)                                 | https://poolfigures.com/pool-stabilizer-calculator                          |
| Calcium hardness (calcium chloride)                        | https://poolfigures.com/pool-calcium-hardness-calculator                    |
| Heater size                                                | https://poolfigures.com/pool-heater-size-calculator                         |
| Fill time                                                  | https://poolfigures.com/pool-fill-time-calculator                           |
| Guide: water chemistry chart                               | https://poolfigures.com/pool-water-chemistry-chart                          |
| Guide: closing your pool                                   | https://poolfigures.com/closing-your-pool                                   |
| Guide: how long to run your pump                           | https://poolfigures.com/how-long-to-run-pool-pump                           |
| Guide: salt water vs chlorine                              | https://poolfigures.com/salt-water-pool-vs-chlorine-pool                    |
| Guide: how to shock a pool                                 | https://poolfigures.com/how-to-shock-a-pool                                 |
| Guide: how to lower pH                                     | https://poolfigures.com/how-to-lower-ph-in-a-pool                           |
| Job pages (each piece names its own)                       | https://poolfigures.com/how-much-shock-for-a-20000-gallon-pool and the like |

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

### New pins: pf-p21 to pf-p39

Same format. Each figure is copied from the text of the live page (2026-11-05), and every link
answered 200. The safety note in the figure column is part of the pin: keep it in small type under
the inputs.

| Id     | Pin title                                 | Figure on screen (inputs → result)                                                                                                                                                                        | Link                                               |
| ------ | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| pf-p21 | How much muriatic acid to lower pH?       | 20,000 gal, acid demand test 2 drops → **36.6 fl oz** of 31.45% muriatic acid; the label adds at most 32.0 fl oz a day, so over 2 days, testing before each part. Add acid to water, never water to acid  | /pool-ph-calculator                                |
| pf-p22 | Muriatic acid for a 20,000 gallon pool    | 1 drop 18.3 fl oz · 2 drops **36.6 fl oz** · 3 drops 55.0 fl oz; at most 32.0 fl oz a day, so 2 days for 2 or 3 drops. Deep end, pump running, never mixed with chlorine                                  | /how-much-muriatic-acid-for-a-20000-gallon-pool    |
| pf-p23 | Raise pH with soda ash                    | 20,000 gal, base demand test 2 drops → **20.5 oz** of soda ash; the label adds at most 32.0 oz at a time there, so it goes in at once; let it circulate 2 to 3 hours, then retest                         | /how-to-lower-ph-in-a-pool                         |
| pf-p24 | Lower pool pH in this order               | Test pH → alkalinity to 80 to 120 ppm first → acid demand test → acid at the deep end, pump running → retest before adding more. Add acid to water, never water to acid                                   | /how-to-lower-ph-in-a-pool                         |
| pf-p25 | How much baking soda to raise alkalinity? | 20,000 gal, 70 → 100 ppm → **8.4 lb** of baking soda (134.5 oz); 1.4 lb per 10 ppm per 10,000 gal                                                                                                         | /pool-alkalinity-calculator                        |
| pf-p26 | Baking soda for a 20,000 gallon pool      | From 90 ppm to 100: **2.8 lb** · from 80: 5.6 lb · from 70: 8.4 lb (pure sodium bicarbonate)                                                                                                              | /how-much-baking-soda-for-a-20000-gallon-pool      |
| pf-p27 | Stabilizer for a freshly filled pool      | 20,000 gal, CYA 0 → 30 ppm → **5.0 lb** of cyanuric acid (80.1 oz), for a 100% product; dichlor and trichlor add CYA too                                                                                  | /how-much-stabilizer-for-a-20000-gallon-pool       |
| pf-p28 | Calcium chloride: add it in two parts     | 20,000 gal, 150 → 250 ppm → **25.0 lb** of flake; add 6.0 lb first, run the pump 12 hours, test, then the rest. Dissolve it first, pour at the deep end                                                   | /how-much-calcium-chloride-for-a-20000-gallon-pool |
| pf-p29 | A small calcium top-up                    | 20,000 gal, 180 → 200 ppm → **5.0 lb** of calcium chloride (80.0 oz); "add this first, then wait 12 hours" shows the same 5.0 lb. Dissolve it first, pump running                                         | /pool-calcium-hardness-calculator                  |
| pf-p30 | What size pool heater?                    | 20,000 gal, warm 10 °F in 24 hours → **69,500 BTU/h** (1,668,000 BTU), before any heat lost: a real heater is sized larger                                                                                | /pool-heater-size-calculator                       |
| pf-p31 | Heater size for a 20,000 gallon pool      | In 24 hours: 10 °F **69,500 BTU/h** · 15 °F 104,250 · 20 °F 139,000                                                                                                                                       | /what-size-pool-heater-for-a-20000-gallon-pool     |
| pf-p32 | How long to fill a 20,000 gallon pool?    | At 10 gallons a minute → **33 h 20 min** (2,000 min); 5 gpm 66 h 40 min; 20 gpm 16 h 40 min. Time a 5-gallon bucket: gpm = 300 ÷ seconds                                                                  | /how-long-to-fill-a-20000-gallon-pool              |
| pf-p33 | Pool water chemistry chart                | Home pool: free chlorine 1.0 to 3.0 ppm · pH 7.2 to 7.8 · alkalinity 80 to 120 · CYA 30 to 50 outdoors · calcium 200 to 400 · salt 2,700 to 3,400, 3,200 best                                             | /pool-water-chemistry-chart                        |
| pf-p34 | How much shock for a 20,000 gallon pool?  | 65% cal-hypo, 0 → 10 ppm → **41.1 oz** (2.57 lb); 0 → 5 ppm 20.5 oz; dichlor 56%, 0 → 8.7 ppm 41.5 oz. Never mix it with anything; swim once free chlorine is back to 4 ppm (cal-hypo) or 3 ppm (dichlor) | /how-much-shock-for-a-20000-gallon-pool            |
| pf-p35 | How much shock for a 10,000 gallon pool?  | 65% cal-hypo, 0 → 10 ppm → **20.5 oz** (1.28 lb); 0 → 5 ppm 10.3 oz: the label's 10 to 20 oz. Swim once free chlorine is back to the label's level                                                        | /how-much-shock-for-a-10000-gallon-pool            |
| pf-p36 | How to shock a pool                       | Balance pH to 7.2 to 7.6 → test free chlorine → dose to the label's level → add in the evening, pump running → never pre-mix → swim when chlorine is back down                                            | /how-to-shock-a-pool                               |
| pf-p37 | How long to run your pool pump            | 20,000 gal at 40 gpm → **8 h 20 min** for one turnover; DOE: start at 6 hours, add half an hour at a time                                                                                                 | /how-long-to-run-pool-pump                         |
| pf-p38 | Closing your pool, in order               | pH 7.2 to 7.8 → shock, filter 24 to 48 h → brush and vacuum → water below the skimmer → drain the equipment → power off. Mild winter: half the filter time                                                | /closing-your-pool                                 |
| pf-p39 | Salt pool vs chlorine pool                | Same water targets; 20,000 gal from 0 to 3,200 ppm → **533.8 lb** of salt, or 41.0 fl oz of 12.5% liquid for 1 → 3 ppm. The level your cell asks for                                                      | /salt-water-pool-vs-chlorine-pool                  |

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

### New Shorts: pf-v11 to pf-v18

Same system. Every chemical script says its label safety note out loud and keeps it on screen.

**pf-v11: "How much acid to lower pH?"** → `/pool-ph-calculator`

- Hook: "Your pH is high. How much muriatic acid do you pour?"
- Run the acid demand test of your kit: 2 drops. Type 20,000 gallons and 2 drops.
- On screen: 36.6 fl oz of 31.45% muriatic acid.
- The label adds at most 32.0 fl oz a day, so it goes in over 2 days, with a test before each part.
- "Add acid to water, never water to acid: slowly, at the deep end, pump running, gloves and eye
  protection, never mixed with chlorine." Figure: **36.6 fl oz over 2 days**.

**pf-v12: "Baking soda for alkalinity"** → `/pool-alkalinity-calculator`

- Hook: "Alkalinity at 70. The chart wants 80 to 120. How much baking soda?"
- 20,000 gallons, 70 ppm now, 100 target.
- On screen: 1.4 lb per 10 ppm per 10,000 gallons.
- "Pure sodium bicarbonate: check the label of an alkalinity increaser."
- Figure: **8.4 lb**.

**pf-v13: "How much shock?"** → `/how-much-shock-for-a-20000-gallon-pool`

- Hook: "A 20,000 gallon pool. How much shock does the label's 10 ppm take?"
- 65% cal-hypo, from 0 to 10 ppm: 41.1 oz, 2.57 lb.
- To 5 ppm: 20.5 oz. Dichlor 56% to 8.7 ppm: 41.5 oz.
- "Add it in the evening with the pump running, and never mix it with anything."
- Figure: **41.1 oz**. "Swim again only when free chlorine is back to 4 ppm (cal-hypo) or 3 ppm
  (dichlor)."

**pf-v14: "Calcium chloride in two parts"** → `/how-much-calcium-chloride-for-a-20000-gallon-pool`

- Hook: "Calcium at 150. The chart wants 200 to 400. How much calcium chloride?"
- 20,000 gallons, 150 → 250 ppm: 25.0 lb of flake.
- Over 3 lb per 10,000 gallons, so the label splits it.
- "Dissolve it first, about ½ lb to a gallon of water, pour it at the deep end, pump running."
- Figure: **6.0 lb first**, 12 hours with the pump, test, then the rest.

**pf-v15: "How long to fill a pool?"** → `/pool-fill-time-calculator`

- Hook: "A 20,000 gallon pool and a garden hose. How long?"
- Time a 5-gallon bucket: 30 seconds is 10 gallons a minute (300 ÷ 30).
- On screen: 20,000 ÷ 10 = 2,000 minutes.
- At 5 gallons a minute: 66 h 40 min.
- Figure: **33 h 20 min**.

**pf-v16: "What size heater?"** → `/pool-heater-size-calculator`

- Hook: "Warm 20,000 gallons by 10 degrees in a day. How big a heater?"
- One BTU warms 1 lb of water 1 °F; a gallon weighs about 8.34 lb.
- On screen: 20,000 × 8.34 × 10 = 1,668,000 BTU, over 24 hours.
- "That is with nothing lost: wind and cool nights take heat, so a real heater is sized larger."
- Figure: **69,500 BTU an hour**.

**pf-v17: "Close your pool in this order"** → `/closing-your-pool` (September to October)

- Hook: "Where the water freezes, close the pool in this order."
- pH to 7.2 to 7.8; shock, then the filter 24 to 48 hours.
- Brush, skim, vacuum; drain to below the skimmer.
- Empty the filter, the pump and the heater; blow out the lines; power off.
- Figure: a mild winter keeps running at **half the filter time**.

**pf-v18: "Stabilizer for a new fill"** → `/pool-stabilizer-calculator`

- Hook: "Fresh water has no stabilizer. The sun burns your chlorine off."
- 20,000 gallons, CYA 0 now, 30 target.
- On screen: 13.35 oz per 10 ppm per 10,000 gallons, for a 100% product.
- "It does not wear off: only draining lowers it. Dichlor and trichlor add it too."
- Figure: **5.0 lb**.

## Calendar

Scheduled, never in bursts. The rule of `plans/growth/PLAN.md` (lever 5): index now, push in
season. Pins keep circulating for months, so a few evergreen volume pins go out early; the Shorts
wait for March.

| Window                     | Pins                                                                                                                      | Shorts                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| 10 Nov 2026 to 28 Feb 2027 | pf-p01, pf-p03, pf-p04, pf-p05, pf-p16: one every three weeks                                                             | none                                                                                   |
| 1 Mar to 31 May 2027       | pf-p18, pf-p19, pf-p12, pf-p08, pf-p09, pf-p10, pf-p02, pf-p06, pf-p13, pf-p14, pf-p20, pf-p07: one a week, opening first | pf-v08 (1 Mar), then pf-v01, pf-v02, pf-v03, pf-v04, pf-v05, pf-v06: one every 10 days |
| 1 Jun to 31 Aug 2027       | pf-p11, pf-p15, pf-p17, then repins of the five pins with most clicks: one a week                                         | pf-v07, pf-v09, pf-v10: one every two weeks from 1 Jun                                 |

The new pieces join the same windows, after the ones above:

| Window                     | Pins                                                                                   | Shorts                                        |
| -------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------- |
| 10 Nov 2026 to 28 Feb 2027 | pf-p33, pf-p37: one every three weeks, between the evergreen volume pins               | none                                          |
| 1 Mar to 31 May 2027       | pf-p32, pf-p27, pf-p25, pf-p26, pf-p24, pf-p21, pf-p22, pf-p23, pf-p28, pf-p29, pf-p39 | pf-v15, pf-v18, pf-v12, pf-v11, in that order |
| 1 Jun to 31 Aug 2027       | pf-p34, pf-p35, pf-p36, pf-p30, pf-p31                                                 | pf-v13, pf-v14, pf-v16                        |
| 1 Sep to 31 Oct 2027       | pf-p38 (1 Sep), repinned 1 Oct                                                         | pf-v17 (1 Sep)                                |

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
