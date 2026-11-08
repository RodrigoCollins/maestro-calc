# Plan — Pet feeding calculators (niche 6)

Status: research done 2026-11-07; design "the bowl" approved by the owner (canvas v2); build
started 2026-11-07 (brand Bowl Figures, `apps/pets`, `packages/pets-core`). The domain is the owner's
call: bowlfigures.com looked unregistered on 2026-11-07 and the site ships with `indexable: false`.

## 1. Why this niche

- Dog and cat owners want a portion they can scoop: calories a day first, then cups of their own
  food, read from the calorie line on the bag or can.
- Not seasonal: feeding, puppies and kittens run all year. Chocolate peaks around holidays
  (Halloween, Christmas, Easter, Valentine's Day), which gives the toxicity page recurring spikes.
- Pet health is YMYL. Every formula on the site comes from a veterinary primary source, and every
  result says it is a starting point to check with the pet's veterinarian. That is also how we
  beat the competition (section 2).
- Spanish is not worth it at launch (evidence below): English first, Spanish only if Search Console
  shows demand.

## 2. Keyword data (seodata.dev, US, 2026-11-07)

seodata.dev is free with no account (20 anonymous lookups a day,
`https://api.seodata.dev/v1/keyword?q=...&country=us`). Its volumes are Google Ads buckets:
close variants share one bucket, so the rows below are not summed.

| Cluster | Volume / month | CPC |
|---|---|---|
| Dog calorie ("dog calorie calculator"; "calorie calculator dog" 8,100) | 6,600 | $3.20 |
| Dog food ("dog food calculator" = "dog feeding calculator"; "dog feed calculator" 2,400) | 5,400 | $4.32 |
| "how much should I feed my dog" (+ "how much food should my dog eat" 6,600) | 3,600 | $3.72 |
| "how much to feed a puppy" (+ "puppy feeding chart" 5,400) | 6,600 | $3.82 |
| Puppy feeding ("puppy feeding calculator" 480-1,300, "puppy food calculator" 590) | 590-1,300 | $1.05-3.11 |
| Cat calorie ("cat calorie calculator"; "calorie calculator for cats" 3,600) | 4,400 | $1.74 |
| Cat food ("cat food calculator"; "how much wet food to feed a cat calculator" 1,300) | 1,900 | $2.54 |
| "kitten food calculator" | 110 | $1.14 |
| "cat weight loss calculator" | 320 | $1.59 |
| Raw dog food (about 10 variants in one bucket) | 1,900 | $2.09-3.12 |
| "homemade dog food calculator" | 1,300 | $1.76 |
| "dog food calculator by breed" / "purina dog food calculator" | 480 / 390 | $3.21 / $14.59 |
| Chocolate toxicity ("dog chocolate toxicity calculator"; "dog chocolate calculator" 3,600) | 6,600 | $0.19 |
| Dog pregnancy ("dog pregnancy calculator"; "dog due date calculator" 1,600) | 6,600 | $0 |
| Dog age ("dog years to human years" 74,000; "dog age calculator" 49,500) | 49,500-74,000 | $0.21-0.29 |
| Cat age ("cat years to human years" 74,000; "cat age calculator" 9,900) | 9,900-74,000 | $0.84-1.02 |
| Puppy weight ("puppy weight calculator" = "puppy weight estimator") | 14,800 | $0.15 |
| "dog water intake calculator" / "xylitol toxicity calculator" | 590 / 50 | $0 / $4.94 |
| "dog treat calculator" | 30 | $0 |

Ahrefs free data (US, 2026-11-07, given by the owner): "dog food calculator" KD Medium, > 1,000 a
month, 180 variants; "raw dog food calculator" and "homemade dog food calculator" Easy, > 100
each; "dog food calculator by breed", "by weight" and "purina dog food calculator" Medium, > 100.
Exact keyword difficulty needs one paid month of Ahrefs or Semrush (section 7).

Spanish (seodata.dev, US, 2026-11-07): 0 for all eight phrases tried ("calculadora de comida para
perros", "cuanto debe comer un perro", "cuanto debe comer mi perro", "cuanto come un perro al dia",
"calculadora de calorias para perros", "calculadora edad perro", "edad de perro en años humanos",
"años de perro a humano"). Hispanic adults own pets as often as anyone (66%, against 68% of White
adults and 62% overall; Pew Research Center, survey of 2023-04-10 to 04-16), but they search in
English: the Spanish volume is not there. Revisit with Search Console data after launch.

Competitors (checked 2026-11-07). Most results for "dog food calculator" and "chocolate toxicity
calculator" are AI-built clone sites on pages.dev and spam subdomains (`?p=` pages on unrelated
hosts): they are competition, never sources. The real ones:

| Site | What it offers | Weakness we can beat |
|---|---|---|
| omnicalculator.com (dog and cat calorie) | Activity level and weight; grams a day and bags | HTML 739 KB (dog) and 539 KB (cat); its own algorithm by one author, not the Merck or AAHA factors; no cups from the label's kcal per cup |
| dogfoodadvisor.com | Ideal weight, activity, food calories | HTML 392 KB with dozens of scripts; uses 110 x kg^0.75 (Waltham), a different formula from Merck and AAHA, not explained against them; affiliate-heavy |
| akc.org (feeding article) | Advice article, no calculator | HTML 671 KB; no number for the reader's dog |
| merckvetmanual.com clinical calculator | The primary formula | Written for veterinarians; no cups, no plain-language result, no Spanish need |
| purina.com, vets-now.com (chocolate) | Brand calculators | Tied to one brand's foods (Purina); both refused a plain fetch (403), so not measured |

Our edge: one page under the Maestro Calc byte budgets, no JavaScript beyond the calculator, the
Merck and AAHA factors shown with their ranges, cups and grams from the reader's own label, and
a dated methodology page.

## 3. Launch set

1. Dog food: weight (lb or kg), life stage and status (intact, neutered, inactive, weight loss,
   puppy under or over 4 months), the food's kcal per cup or kcal/kg from the label; calories a
   day, cups a day and grams a day, and the 10% treat allowance. Weight loss uses the ideal weight.
2. Cat food: the same for cats (intact, neutered, inactive, weight loss, kitten), dry by the cup
   and wet by the can (kcal per can from the label), or a mix of both.
3. Puppy and kitten feeding: a landing page per keyword cluster on the same engine as 1 and 2
   ("how much to feed a puppy" 6,600, "puppy feeding calculator").
4. Chocolate toxicity (dogs): weight, chocolate type, amount eaten; mg/kg of methylxanthines and
   the band it falls in (below 20, 20 mild signs, 40-50 heart effects, 60 and up seizures). Every
   result, even below 20, says to call a veterinarian or a poison line now.
5. Dog pregnancy due date: the breeding date (or the LH surge date when known); the whelping
   window as a range of dates, never one day.

Second wave, once each has a primary source (section 4): dog age, cat age, homemade and raw
portions (calories only).

Plus a methodology page and one guide ("How to read the calorie line on a pet food label").

## 4. Formulas and sources (verified 2026-11-07)

- Resting energy requirement (RER): RER = 70 x (body weight in kg)^0.75 kcal/day, for any body
  weight. The linear form 30 x kg + 70 holds only from 2 to 45 kg; we use the exponential form at
  all weights. Source: Merck Veterinary Manual, "Nutritional Requirements of Small Animals",
  Sherry Lynn Sanderson, DVM, PhD, DACVIM (Nutrition), last updated September 2024,
  https://www.merckvetmanual.com/management-and-nutrition/nutrition-small-animals/nutritional-requirements-and-related-diseases-of-small-animals
  It says any figure is a starting point and a pet may need 30% more or less. Same RER in the 2021
  AAHA Nutrition and Weight Management Guidelines, Box 1 (example: 10 lb neutered dog, RER =
  4.5^0.75 x 70 = 216 kcal/day, MER = 216 x 1.4 = 302 kcal/day),
  https://www.aaha.org/globalassets/02-guidelines/2021-nutrition-and-weight-management/resourcepdfs/nutritiongl_box1.pdf
- Maintenance energy requirement (MER) = RER x factor. The two sources disagree; the page shows
  Merck's point value as the default and AAHA's range beside it:

  | Category | Merck (dog / cat) | AAHA 2021 Box 1 (dog / cat) |
  |---|---|---|
  | Neutered adult | 1.6 / 1.2 | 1.4-1.6 / 1.2-1.4 |
  | Intact adult | 1.8 / 1.4 | 1.6-1.8 / 1.4-1.6 |
  | Inactive or obesity prone | 1.4 / 1.0 | 1.0-1.2 / 1.0 |
  | Weight loss (on ideal weight) | not given | 1.0 / 0.8 |
  | Growth | puppy < 4 mo 3.0, > 4 mo 2.0; kitten 2.5 | < 4 mo 3.0, >= 4 mo 2.0; kitten 2.5 |
  | Gestation | not given | 3.0 for the last 21 days / 1.6-2.0 |
  | Lactation | not given | 3.0 to >= 6.0 / 2.0-6.0 |

  Merck table: https://www.merckvetmanual.com/multimedia/table/daily-maintenance-energy-requirements-for-dogs-and-cats
  ("Kittens can alternatively be fed free choice"). AAHA: base weight-loss figures on ideal
  weight and adjust by body weight and body condition score. Gestation and lactation are out of
  the launch calculator: the ranges are too wide to give one number, so the page sends the reader
  to the veterinarian.
- Treats: complete and balanced food is at least 90% of intake; treats and other items at most
  10% (2021 AAHA guidelines, JAAHA 2021, read in the PDF copy at
  https://www.canadianveterinarians.net/media/iuqg3rfp/cline-2021-aaha-nutrition-and-weight-management-guidelines-for-dogs-and-cats-jaaha-2021.pdf).
- Portions: cups a day = MER / kcal per cup; grams a day = MER / (kcal/kg) x 1,000; cans a day =
  MER / kcal per can. The label must state "Calorie Content" in kcal ME per kg as fed and per
  familiar unit (cup, can, piece): AAFCO, https://www.aafco.org/consumers/understanding-pet-food/calories/
  When a label has no calorie line, AAFCO's modified Atwater estimate is kcal/kg = (3.5 x crude
  protein % + 8.5 x crude fat % + 3.5 x NFE %) x 10, with NFE = 100 - protein - fat - fiber -
  moisture - ash (https://www.aafco.org/resources/startups/calorie-content/). The guaranteed
  analysis gives minimums and maximums, not averages, so this is a fallback marked "estimate".
- Chocolate: thresholds are for theobromine and caffeine combined, in mg/kg: mild signs
  (vomiting, diarrhea, thirst) at 20, heart effects at 40-50, seizures at 60 and up. Content per
  gram: cocoa powder 28.5, unsweetened baking chocolate 15.5, semisweet and sweet dark 5.3-5.6,
  cocoa bean hulls 9, milk chocolate 2.3, white chocolate 0.04. Dose = grams eaten x mg/g / dog kg;
  for dark chocolate use the top of the range. About 62 g/kg (1 oz/lb) of milk chocolate is
  potentially lethal. Source: Merck Veterinary Manual, "Chocolate Toxicosis in Animals", Cristine
  Hayes, DVM (ASPCA Animal Poison Control Center), full review September 2024, updated February
  2026, https://www.merckvetmanual.com/toxicology/food-hazards/chocolate-toxicosis-in-animals
  Worked check: 10 kg dog, 50 g milk chocolate = 115 mg = 11.5 mg/kg (below 20, still call). The
  poison line phone numbers are not verified yet: verify them on aspca.org before the page ships.
- Dog due date: 58-72 days from the first day the female allowed breeding; 64-66 days from the
  LH surge or the first rise in progesterone (> 2 ng/mL); 56-58 days from the first day of
  diestrus. Cats: 64-66 days from the LH surge, which mating triggers. Source: Merck Veterinary
  Manual, "Whelping and Queening in Dogs and Cats", Autumn P. Davidson, DVM, last updated July
  2026, https://www.merckvetmanual.com/management-and-nutrition/management-of-reproduction-dogs-and-cats/whelping-and-queening-in-dogs-and-cats
  The page shows a window of dates and says a veterinarian can narrow it with ovulation timing.

Left out, and why:

- NRC 2006 (Nutrient Requirements of Dogs and Cats): a paid book, not read; not cited until
  someone reads the actual table.
- Dog age: the epigenetic formula human age = 16 ln(dog age) + 31 is verified (Wang et al.,
  "Quantitative Translation of Dog-to-Human Aging by Conserved Remodeling of the DNA Methylome",
  Cell Systems 2020;11(2):176-185, doi:10.1016/j.cels.2020.06.006, fitted on 104 Labrador
  retrievers only). The AVMA size chart (small, medium, large, very large) was not reachable:
  its PDF loops on redirects. A size-blind formula from one breed is not enough for the biggest
  keyword; second wave once the AVMA chart is read.
- Cat age: the "15, then 24, then 4 a year" chart is credited to AAHA/AAFP, but the 2021 Feline
  Life Stage Guidelines copy found (catvets.com) is a press summary with life stages only
  (kitten < 1 year, young adult 1-6, mature 7-10, senior > 10) and no human-age chart. Out until
  the chart is found in a primary source.
- Raw and homemade portions as "2-3% of body weight": no veterinary primary source. The AVMA
  discourages raw or undercooked animal-source protein for dogs and cats
  (https://www.avma.org/resources-tools/avma-policies/raw-or-undercooked-animal-source-protein-cat-and-dog-diets),
  and WSAVA says a homemade diet should be formulated by a board-certified veterinary nutritionist.
  Those pages, if built, give the calorie target only and say so.
- Puppy adult-weight estimator (14,800 a month): every online rule ("double at 16 weeks") is
  unsourced; out until a published growth curve is found.
- Breed-based feeding: breed does not enter the Merck or AAHA formula; weight and status do. The
  "by breed" page explains that instead of inventing breed factors.
- Water intake, xylitol, grapes: no primary threshold verified today.

## 5. Design: "the bowl" (approved, supersedes the measuring-scoop proposal)

- Ground: oat #FFF4E0; ink: plum #2A1F3D; coral #FF7A59 for shapes only (plum text on coral for
  buttons); pastels, borderless: mint #BFE3D0, butter #FFE2B8, lilac #E3D7F5. Chocolate bands:
  #F4B860 (20), #E8553A (40 to 50), #9E1F14 (60 and up). Dark mode tokens too; text contrast 4.5:1
  measured.
- Type: Fraunces (900 for figures, 700 for headings) and DM Sans (400 text, 700 labels),
  self-hosted woff2 from Fontsource (static files, so no SOFT axis: the variable file is far over
  the 30,720 B font budget), four files in all.
- Structure: pill nav and pill inputs; a plum rounded (36px) hero block holding the form and the
  result. The result is a top-view bowl (coral ring, cream inside split morning and evening by a
  dashed line, kibble dots, as many as the day's amount) with the huge figure ("2 3/4 cups a
  day"), and chips for kcal and treats. Cat page: the bowl plus a can for the wet share.
- Chocolate: a band ruler in mg/kg (20, 40 to 50, 60) with the dog's dose as a marker. Due date:
  a 10-week calendar strip with the whelping window shaded. Pastel cards for the home sections.
- Safety copy: every result says it is a starting point to check with the pet's veterinarian;
  every chocolate result, even below 20 mg/kg, says to call a veterinarian or the ASPCA Animal
  Poison Control Center now. The ASPCA number, (888) 426-4435, was read on
  https://www.aspca.org/pet-care/animal-poison-control on 2026-11-07 (24 hours a day, a consultation
  fee may apply).
- Scope of the first build: English only (section 1), no embeds, no job pages. Data pages from the
  engine: dog feeding chart by weight, puppy feeding chart, chocolate amount chart by dog weight.
  Guides: how to read the calorie line on a pet food label (AAFCO) and dog food by breed (why
  breed is not in the formula).

## 6. Architecture

The same monorepo pattern as Cuenta Horas and Pool Figures: `apps/<name>` (Astro, its own
Worker and domain, `wrangler.jsonc`) and `packages/<name>-core` (calculators on
`@maestro-calc/core`, one subpath export per calculator, its own Stryker shard). Reuse
`packages/site-kit` as `apps/pool` does: the byte budgets of `check:site` (`budgets`,
`check-site`, `seo-check`), the sitemap, canonical URLs, the link preview, JSON-LD (organization
and editorial-team bylines), IndexNow and the GA4 usage tracker (`track`). The app keeps its own
route table, `src/site-check/pages.ts` with its `CALCULATOR_PAGES`, the methodology and
editorial-policy pages. Add `build:<name>`, `check:site:<name>` and `test:e2e:<name>` (phone and
no-js suites in `tooling/site-browser/e2e-<name>`, a new wrangler port) and the matching CI and
`verify` steps. The engine tests pin the worked checks of section 4 (AAHA's 302 kcal dog, the
11.5 mg/kg chocolate case).

## 7. Open items for the owner

- Domain: bowlfigures.com is bought (2026-11-08). Create the Workers Builds project for `apps/pets/wrangler.jsonc`
  (`npx wrangler deploy --config apps/pets/wrangler.jsonc`), create the GA4 property and set
  `gaId` in `apps/pets/src/site.config.ts`, then flip `indexable` to true in the same file and
  ship. Add the domain to Search Console and Bing.

- Brand. .com names with no registration on 2026-11-07 (Verisign whois): bowlfigures.com,
  kibblefigures.com, scoopfigures.com, kibblecount.com, feedfigures.com, tailfigures.com,
  bowlandpaw.com. Taken: petfigures.com (2014), pawfigures.com, kibblemath.com, bowlmath.com,
  pawcount.com, pawmath.com, petportions.com. Proposed: Bowl Figures (bowlfigures.com), the
  same family as Pool Figures; Kibble Figures as backup. USPTO not searched yet. Rodrigo buys
  the domain, then the Workers Builds project.
- Built 2026-11-07/08 without: Spanish, embeds, job pages, FAQ JSON-LD (the shared SEO check refuses
  FAQPage markup, as on the other sites), dog and cat age, raw and homemade portions (section 4
  says why). Breeds are explained on /dog-food-by-breed, not modeled.
- One month of Ahrefs or Semrush for keyword difficulty, ideally before building (the free Ahrefs
  data only gives Easy/Medium bands).
- A veterinarian review of the methodology page before launch, if a reviewer can be found (YMYL).
