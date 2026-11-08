# Plan — Cuánto Le Cobro (niche 4, quotes for tradespeople)

Status: design approved 2026-11-07 (canvas SHKtFSBFDtNZCv6QCbYkwn, v2 "el presupuesto"); built on
2026-11-07. Brand: Cuánto Le Cobro, planned origin https://cuantolecobro.com (not bought: the owner
buys it and flips `indexable`).

## 1. Why this niche

- Spanish-speaking tradespeople in the US (house cleaning, painting, drywall, concrete,
  landscaping) must put a number on a job for a client, usually on a phone, often on the spot.
- The searches are questions ("cuánto cobrar por ...") that no price list can answer honestly:
  prices depend on the city, the crew and the client. What can be answered exactly is how a
  quote is built: hours times rate, plus materials, plus overhead and profit, itemized.
- Spanish first (root `/`), English under `/en` for the same quote tools (hreflang pair, with
  `x-default` on the Spanish page).
- Sibling site: Cuenta Horas (`apps/pay`) serves the same audience (pay, overtime, minimum wage).
  The quote pages link to its calculators where natural; Cuenta Horas links back after launch.

## 2. Keyword data

Source of the first two rows: the owner's Ahrefs free lookup, US, 2026-11-07 (supplied in the
brief, not re-measured). Third row: seodata.dev, US, 2026-11-07 (the only lookup that answered; the
free quota of the shared address was spent by sibling agents, and the next tier needs an email
registration, which is the owner's call).

| Query | Volume / month | Notes |
|---|---|---|
| Spanish seed "cuanto cobrar" | 1,374 keyword variants, each under 100 | every visible one KD Easy (Ahrefs) |
| English "house cleaning calculator" | 12 variants, each over 100 | Ahrefs |
| "cuanto cobrar por limpiar una casa" | 260 (CPC $2.48); variants "cuánto cobrar por limpiar una casa" 260, "cuanto cobrar por limpiar casas" 260, "cuanto se cobra por limpiar una casa de 4 cuartos" 110, "cuanto se puede cobrar por limpiar una casa" 40 | seodata.dev |

Named long tails from Ahrefs: "cuanto cobrar por pie cuadrado de concreto", "cuanto cobrar por hoja
de drywall", "cuanto cobrar por pintar una casa", "cuanto cobrar por limpieza de oficinas". Each
volume is small: the bet is the long tail across five trades and the state wage pages, not one head
term. No volume is quoted that is not in this table.

## 3. Launch set

Five quote calculators, one page per trade in both languages (the trade chips of the design are
links between them), on one shared quote engine:

1. Limpieza (house and office cleaning): hours per cleaner, cleaners, rate, supplies.
2. Pintura: a room's walls (length, width, height, doors, windows, coats), paint at the user's
   price per gallon; gallons and cans from the Maestro Calc paint engine.
3. Drywall: the same room geometry, surfaces, sheet size, waste, price per sheet; sheets from the
   Maestro Calc drywall engine.
4. Concreto: a slab (length, width, thickness), waste, bag size, price per bag; bags from the
   Maestro Calc concrete engine.
5. Jardín (landscaping): a mulch bed (length, width, depth, waste, bag size, price per bag); bags
   from the Maestro Calc mulch engine.

Every page: labor by the hour (hours x crew x rate) or by area (the job's area x the user's own
price per sq ft), materials, optional overhead % and profit %, the itemized total as a paper
"PRESUPUESTO", a WhatsApp share of the itemized text, print / save as PDF (print stylesheet), and
the "¿Tu tarifa está bien?" card.

Data pages (BLS OEWS, May 2025): one page per trade and state ("cuánto gana un pintor en Texas"), a
state index per trade, and a hub. Guides (3): how to build a quote, markup versus margin, how to set
an hourly rate. Plus methodology, about, editorial policy, privacy, embeds, `llms.txt`.

Left out, on purpose:

- Market prices and production rates (what to charge per sq ft, how many sq ft a painter paints in
  an hour): no neutral primary source exists across cities; the user types their own.
- Sales tax and licensing rules: they differ by state and trade, and a wrong line in a quote is
  worse than none. A note says so.
- Percentile ranges of wages (OEWS 10th/90th): the free BLS API allows 25 requests of 25 series a
  day, so launch carries mean and median only; percentiles are a follow-up.

## 4. Formulas and sources (verified 2026-11-07)

- Labor by the hour = hours x cleaners (crew) x hourly rate; by area = area x price per sq ft.
- Materials = whole purchase units (cans, sheets, bags) from the shared engine x the user's price
  per unit. Coverage and yields are the sourced ones of `packages/data` (paint 350 sq ft per
  gallon, drywall sheet and finishing, concrete bag yields, mulch bag volumes), cited on the Maestro
  Calc methodology page; this site's methodology repeats the figures and links there.
- Subtotal = labor + materials. Overhead = subtotal x overhead %. Profit = (subtotal + overhead) x
  profit % (a markup on cost). Total = subtotal + overhead + profit. Margin on the price =
  markup / (1 + markup): pure algebra, shown in the markup guide with a hand-verified table.
- Wages: U.S. Bureau of Labor Statistics, Occupational Employment and Wage Statistics (OEWS), May
  2025, state estimates, hourly mean (data type 03) and hourly median (08), read through the BLS
  Public Data API (https://api.bls.gov/publicAPI/v1/timeseries/data/, series
  `OEUS<state fips>00000<industry 000000><SOC>03|08`), accessed 2026-11-08. Occupations: 37-2012
  maids and housekeeping cleaners, 47-2141 painters (construction and maintenance), 47-2081 drywall
  and ceiling tile installers, 47-2051 cement masons and concrete finishers, 37-3011 landscaping and
  groundskeeping workers. `apps/cobro/scripts/fetch-wages.ts` rebuilds the numbers-only data; a
  state without an estimate for an occupation gets no page. The bls.gov file download refuses
  scripted requests, so the API is the reproducible channel.
- A wage is what an employer pays an employee, not what a contractor bills: the card says so; the
  billing rate also carries the overhead and profit lines of the quote.
- Self-employment tax (hourly-rate guide): 12.4% Social Security plus 2.9% Medicare, owed when net
  earnings from self-employment are $400 or more. IRS Topic no. 554,
  https://www.irs.gov/taxtopics/tc554, accessed 2026-11-08.
- Target hourly rate (guide) = (target yearly income + yearly business costs) / billable hours per
  year, the user's own numbers; arithmetic only.

## 5. Design (approved)

Canvas https://claude.ai/artifact/SHKtFSBFDtNZCv6QCbYkwn, v2 "el presupuesto": phone first,
near-black ground #121212, text #F5F5F0, marigold #FFC233 for the brand mark and the active chip,
dark input tiles #1E1E1E / #2B2B2B, Bricolage Grotesque + Inter (self-hosted woff2; the design is
dark by nature, text contrast 4.5:1 measured). Horizontal trade chips; the result is a paper
receipt "PRESUPUESTO" (#FFFDF6), slightly rotated, zigzag torn edge, line items and a huge TOTAL; a
big green #3DDC84 button with dark text "Enviar presupuesto por WhatsApp"; a print action; the
"¿Tu tarifa está bien?" card.

## 6. Architecture

As Cuenta Horas and Pool Figures: `apps/cobro` (Astro, its own Worker and domain) and
`packages/cobro-core` (the quote engine and the five calculators on `@maestro-calc/core` builders,
composing its paint, drywall, concrete and mulch calculators; its own Stryker shard).
`packages/site-kit` supplies the budgets, check-site, JSON-LD, sitemap, embed, IndexNow, link
preview and the usage tracker. Root scripts `build:cobro`, `check:site:cobro`, `test:e2e:cobro`
(port 8792). Spanish is the root language: the Spanish path is the primary one and English lives
under `/en`.

## 7. Open items for the owner

- Buy cuantolecobro.com; create the Workers Builds project (`apps/cobro/wrangler.jsonc`); flip
  `SITE.indexable`; add the GA4 measurement id to `SITE.gaId`.
- Affiliate programs: none named. Jobber's page (getjobber.com/partners/affiliate, 2026-11-07)
  states "industry-leading commission" and "no minimum sales requirements" with no figures, so no
  terms can be cited; revisit after the owner applies (signing up is the owner's). AdSense first,
  as on the sibling sites, after launch.
- seodata.dev registration (email) for fresh volumes, or a month of Ahrefs for difficulty.
