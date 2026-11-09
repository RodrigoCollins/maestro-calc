# Pool Figures in Spanish (/es)

Status: plan, not started. Written 2026-11-06 from a read of `apps/pool`, `apps/pay` and `packages/site-kit`.

## Verdict

Worth it, as a staged and cheap bet, not as a 115-page push.

- Demand signal (WebSearch, 2026-11-06, no volume tool): "cuánta sal para piscina", "cómo bajar el pH de la piscina" and "cloro para piscina de 10000 galones" return thin result pages: miniwebtool's generic Spanish salt calculator, Spain forums (todoexpertos, "salfumán"), scraped English spam on parasite domains, and English pages. No US-units Spanish site answers them well. The queries exist (gallons in a Spanish query is a US Hispanic signal), the competition is weak, the volume is unknown and likely small.
- Cost is low: Cuenta Horas already proved the pattern (`Record<Lang, …>` texts, a route table with `en`/`es`, site-kit hreflang and sitemap alternates, `headProblems` with `['en-US', 'es-US']`). The engines (`packages/pool-core`) and the number format (en-US, as Cuenta Horas keeps for Spanish) do not change.
- Gate the expensive part: ship the shell, calculators, charts and guides (25 pages + 10 embeds), then build the 80 Spanish job pages only once Search Console shows `/es` impressions.

## Where pool copy lives today

| Copy                                                                              | Where                                                                                                                   | Spanish work                                                                                                |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Calculators (title, lead, field labels, options, results, warnings, method, note) | `src/doses.ts` (`DosePage` objects, 304 lines), `src/volume/texts.ts`, `src/strip.ts`                                   | `Record<Lang, DosePage>`; the `key`s stay, the text doubles                                                 |
| Guides (7 step guides, sources, steps)                                            | `src/guide.ts` (792 lines)                                                                                              | Spanish steps; sources keep their names and URLs                                                            |
| Job pages (80: 7 families of gallons + volume sizes)                              | `src/jobs.ts` (944 lines), English template literals (`Gallons in a ${name}`, `/how-much-salt-for-a-${g}-gallon-pool`)  | Spanish templates and slugs, same engine figures                                                            |
| Charts                                                                            | `src/chemistry.ts`, `src/dosing.ts`, `src/volume/chart.ts` plus hardcoded copy in `pages/pool-*-chart.astro` (17 lines) | Move the hardcoded lines into the modules first                                                             |
| Home, nav, footer, 404                                                            | `src/home.ts`, `pages/index.astro` (7 hardcoded lines), `components/Layout.astro` (13 footer links, the footer warning) | Layout gets `lang` and a texts table                                                                        |
| Methodology, about, privacy, embed page                                           | `src/methodology.ts` (369), `src/about.ts`, `src/privacy.ts`, `src/embed.ts`, plus 4 lines in `pages/methodology.astro` | Spanish texts                                                                                               |
| Client scripts                                                                    | `src/client/*.ts`, `run-dose.ts`                                                                                        | Write numbers into `[data-out]` only; verify no English string reaches the DOM (none found by a quick scan) |
| llms.txt                                                                          | `src/llms.ts`                                                                                                           | Add "En español: calculadoras / guías" sections as `apps/pay/src/seo/llms.ts` does                          |

No content collections: everything is TS modules plus a little markup copy.

## How Cuenta Horas does it (the model)

- `apps/pay/src/routes.ts`: `ROUTES: { id, kind, en, es }[]`; each feature module exports its `*_PATHS = { en, es }` and its `*_TEXTS: Record<Lang, …>`.
- Pages are one-liners per language: `pages/overtime-calculator.astro` and `pages/es/calculadora-de-horas-extra.astro` both render `<OvertimePage lang=… />`.
- `components/SiteLayout.astro` takes `lang` and `paths`: `<html lang>`, canonical, `hreflang` en-US / es-US / x-default (English), `og:locale` and `og:locale:alternate`, a header link to the other language (`a[hreflang]`), localized footer links.
- `seo/json-ld.ts`: `inLanguage` `en-US` or `es-US`, breadcrumb home `/` or `/es`.
- `seo/sitemap.ts`: `localizedUrls` of site-kit, every URL with its pair and x-default.
- `site-check/seo.ts`: `headProblems(pages, { languages: ['en-US', 'es-US'], … })` checks reciprocal alternates, `<html lang>` against the canonical, and the sitemap.
- `growth.ts`: pages from `ROUTES × ['en','es']`; the growth contract (`apps/web/src/contract/growth.contract.test.ts`, G1 to G10) is language-agnostic and needs no edit.
- Embeds in both languages (`pages/embed/es/…`), the language switch stays inside the frame.
- e2e: `tooling/site-browser/e2e-pay/pages.ts` lists `{ path, lang }`.

## What Pool Figures must change

1. **A route table.** Pool derives its pages from `import.meta.glob('./pages/*.astro')` (non-recursive: `pages/es/*` would be silently missing from the sitemap and growth), and its page kind from the path suffix (`pageKindOf`: `-calculator` → calculator). Spanish slugs (`calculadora-de-…`) break both. Add `src/routes.ts` with `{ id, kind, en, es? }`, `es` optional during the rollout, and derive sitemap, `GROWTH`, llms, JSON-LD kind and `CALCULATOR_PAGES` from it. Keep the job pages as routes built from `JOB_PAGES`.
2. **Partial pairing.** site-kit `headProblems` demands every indexable page carry all languages. Until every page has its twin, a page without `es` gets no alternates and is checked by the current pool rules; a page with `es` gets the full pair and `headProblems` over the paired subset. The sitemap emits `localizedUrls` for paired routes and a plain `<loc>` for the rest. Never emit an alternate to a page that does not exist.
3. **Layout.** `lang` prop; `<html lang>`, `og:locale` `es_US` + alternate, hreflang trio, header language link only when the twin exists, footer and nav texts per language. Brand stays "Pool Figures".
4. **JSON-LD.** `jsonLdOf` takes `lang`: `inLanguage` `es-US`, breadcrumb home `/es`; `nameOf` strips ` | Pool Figures` in both.
5. **Embeds.** `/embed/es/<slug>` per Spanish calculator, `embed.ts` `pagePathOf` must map them; site-kit embed rules already expect the `header a[hreflang]` switch.
6. **Budgets.** Same `packages/site-kit/src/budgets.ts` ceilings. The largest built page is about 20 KB of the 49,152 B HTML ceiling (methodology, stale dist), so Spanish text (about +15%) fits. Each Spanish calculator page and embed joins `CALCULATOR_PAGES` (one module script, same entry); the test that holds `CALCULATOR_PAGES` equal to the `*-calculator.astro` files must read the route table instead.
7. **Fonts.** The `latin` subset of Barlow already has á é í ó ú ñ ü ¿ ¡; no new font bytes.
8. **Tests that assume English only.** `site.config.ts` `locales: ['en']` (and its test), `seo/json-ld.test.ts` (`en-US`), `seo/sitemap.test.ts` (glob paths), `site-check/pages.ts` / `pages.test.ts`, `growth.ts`, `llms.test.ts`, `e2e-pool/pages.ts` (flat EN list, its comment says "English only"), `e2e-pool/pages.spec.ts:18` (`lang` must be `en`), `e2e-pool/calculators.spec.ts` and `no-js.spec.ts` (paths only), `dosing.test.ts` (`toLocaleString('en-US')`, stays).
9. **Copy rules.** Neutral tú register (Ingresa, Usa, Elige), as AGENTS.md asks of Maestro Calc. US units stay: galones, libras, onzas líquidas, ppm, gpm, BTU, °F, with litres and kilos beside them where a calculator has the units choice or a guide a metric table (2026-11-09, for Spain and Mexico). Product names as the US label says plus the Spanish name ("ácido muriático", Spain's "salfumán" and "depuradora" only beside the US word, in a sentence that says "en España"; "cloro líquido", "hipoclorito de calcio (cal-hypo)", "dicloro", "bicarbonato de sodio", "ácido cianúrico (estabilizador)"). Use "piscina" in slugs and titles, and "alberca" once in the home and the volume and salt leads (Mexican-American readers search both).

## Spanish slugs

| EN                                                     | ES                                                                                                                                                                                                |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                                                    | `/es`                                                                                                                                                                                             |
| `/pool-volume-calculator`                              | `/es/calculadora-de-volumen-de-piscina`                                                                                                                                                           |
| `/pool-salt-calculator`                                | `/es/calculadora-de-sal-para-piscina`                                                                                                                                                             |
| `/pool-chlorine-calculator`                            | `/es/calculadora-de-cloro-para-piscina`                                                                                                                                                           |
| `/pool-pump-size-calculator`                           | `/es/calculadora-de-bomba-para-piscina`                                                                                                                                                           |
| `/pool-ph-calculator`                                  | `/es/calculadora-de-ph-para-piscina`                                                                                                                                                              |
| `/pool-alkalinity-calculator`                          | `/es/calculadora-de-alcalinidad-para-piscina`                                                                                                                                                     |
| `/pool-stabilizer-calculator`                          | `/es/calculadora-de-estabilizador-para-piscina`                                                                                                                                                   |
| `/pool-calcium-hardness-calculator`                    | `/es/calculadora-de-dureza-de-calcio-para-piscina`                                                                                                                                                |
| `/pool-heater-size-calculator`                         | `/es/calculadora-de-calentador-para-piscina`                                                                                                                                                      |
| `/pool-fill-time-calculator`                           | `/es/calculadora-de-tiempo-de-llenado-de-piscina`                                                                                                                                                 |
| `/pool-water-chemistry-chart`                          | `/es/tabla-de-quimica-del-agua-de-piscina`                                                                                                                                                        |
| `/pool-chemical-dosing-chart`                          | `/es/tabla-de-dosis-de-quimicos-para-piscina`                                                                                                                                                     |
| `/pool-volume-chart`                                   | `/es/tabla-de-volumen-de-piscina`                                                                                                                                                                 |
| `/opening-your-pool`                                   | `/es/como-abrir-tu-piscina`                                                                                                                                                                       |
| `/closing-your-pool`                                   | `/es/como-cerrar-tu-piscina`                                                                                                                                                                      |
| `/how-long-to-run-pool-pump`                           | `/es/cuantas-horas-prender-la-bomba-de-la-piscina`                                                                                                                                                |
| `/salt-water-pool-vs-chlorine-pool`                    | `/es/piscina-de-agua-salada-o-de-cloro`                                                                                                                                                           |
| `/how-to-shock-a-pool`                                 | `/es/como-hacer-un-tratamiento-de-choque-a-la-piscina`                                                                                                                                            |
| `/how-to-lower-ph-in-a-pool`                           | `/es/como-bajar-el-ph-de-la-piscina`                                                                                                                                                              |
| `/how-to-raise-calcium-hardness-in-a-pool`             | `/es/como-subir-la-dureza-de-calcio-de-la-piscina`                                                                                                                                                |
| `/methodology`                                         | `/es/metodologia`                                                                                                                                                                                 |
| `/about`                                               | `/es/acerca`                                                                                                                                                                                      |
| `/privacy`                                             | `/es/privacidad`                                                                                                                                                                                  |
| `/embed-calculators`                                   | `/es/calculadoras-para-tu-sitio`                                                                                                                                                                  |
| `/how-much-salt-for-a-10000-gallon-pool` (job pattern) | `/es/cuanta-sal-para-una-piscina-de-10000-galones` (and `cuanto-cloro-…`, `cuanto-bicarbonato-…`, `cuanto-estabilizador-…`, `cuanto-cloro-de-choque-…`, `cuantos-galones-tiene-una-piscina-de-…`) |

Slugs are a public contract once live: pin them in a routes test, as `apps/web/src/routing/routes.test.ts` does.

## Page count

- English today: 25 indexable pages + 80 job pages = 105, plus 10 noindex embeds.
- Spanish, staged (slices 1 to 7): 25 pages + 10 embeds.
- Spanish, full (slice 8): +80 job pages, 115 Spanish builds in all; the site goes from 115 to 230 built pages.

## Slices (one PR each, about 400 changed lines or less)

Each slice adds its own e2e rows (`{ path, lang }`), its llms.txt entries, its routes test lines and its pinned slugs. Merge on green.

1. **Route table, no Spanish page.** `src/routes.ts` (`es` optional), `Lang`, sitemap, `GROWTH`, llms, JSON-LD kind and `CALCULATOR_PAGES` from it; Layout and `jsonLdOf` take `lang`; the partial-pairing rule in the site check and sitemap, unit-tested with a fixture route that has a twin. `e2e-pool/pages.ts` becomes `{ path, lang }`. The build stays byte-identical in content for English (sitemap unchanged, no alternates yet). About 350 lines.
2. **Spanish shell.** `/es` home, `/es/acerca`, `/es/privacidad`, `/es/calculadoras-para-tu-sitio`; Layout header, nav and footer texts per language, the language link, the 404 linking both homes. First live hreflang pairs. About 350 lines.
3. **Calculators ES, part 1** (the queries that showed up): volume, salt, chlorine, pH, alkalinity, with their 5 Spanish embeds. `DosePage` texts per language, `VolumePage` and `DosePage` take `lang`. About 400 lines.
4. **Calculators ES, part 2**: stabilizer, calcium hardness, pump size, heater size, fill time, with embeds. About 300 lines.
5. **Methodology ES** (`methodology.ts` texts, its hand-worked cases reuse the same engine runs). About 400 lines.
6. **Charts ES**: move the hardcoded chart copy into `chemistry.ts`, `dosing.ts`, `volume/chart.ts`, then the three Spanish charts. About 400 lines.
7. **Guides ES**, two PRs: (7a) opening, closing, pump hours, salt vs chlorine; (7b) shock, lower pH, raise calcium. About 400 lines each.
8. **Job pages ES** (gate: `/es` impressions in Search Console 4 to 6 weeks after slice 7): Spanish templates and slugs in `jobs.ts`, `[job].astro` per language (or `pages/es/[job].astro`), the volume family first. Two PRs, about 350 lines each. Until then the English job pages keep no alternates, which is valid.

About 10 PRs in all, 8 before the gate.

## Risks

- **Demand unproven (biggest).** No search volume data; the Spanish results are thin but the queries may be small, and Spanish-speaking US owners often search in English. Mitigation: the gate before slice 8, and measure `/es` in GSC and GA4 (same property) after slice 3.
- **Partial hreflang.** site-kit `headProblems` assumes every page is paired; running it over the whole build mid-rollout fails, running it over nothing hides errors. Slice 1 must test both sides of the subset rule.
- **Route-table refactor.** Replacing the file glob and the suffix-based page kind touches the sitemap, the growth adapter, the site check and the e2e table at once; a missed page drops out of the sitemap. Slice 1 asserts the English sitemap is unchanged.
- **Safety copy.** Acid and chlorine instructions in Spanish must say exactly what the English says (add acid to water, never mix products). Every warning key needs a Spanish text; a test that both languages have the same keys, as Cuenta Horas does, prevents a silent gap.
- **Vocabulary.** Spain terms ("salfumán", "depuradora") lose US readers; Mexican "alberca" vs "piscina". Pick one glossary in slice 2 and reuse it.
- **IndexNow and deploy.** Automatic: the deploy job reads the sitemap, so new URLs are smoke-tested and notified with no workflow edit.
