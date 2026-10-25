# Design: Concrete Calculator — First Live Calculator (EN/ES)

This design implements `proposal.md` (decisions D1–D14 are binding) against the delta specs in `specs/`. **The specs are the behavioral contract** and win over any value written here.

Revision history, recorded at the end:
- After the spec phase: "Reconciliation with the specs", R1–R12.
- After design review round 1: "Design review round 1", DR-1 to DR-18. The specs were amended in that round.

## Technical Approach

**Core.** A new `geometry` module holds a rational π and `circleArea`. The `concrete` calculator is built by `createConcrete(yields)`. The yields come from a **yields-only** subpath of `@maestro-calc/data`, wired in by the web composition root. Core never imports data.

**Page.** The calculator page is assembled and tested without a route through G1 and G2. It goes live only in the final slices of G3, in the same merge as:
- the client entry
- the methodology and privacy updates
- the home link
- the interactive gates

When built, the page shows the engine's default answer. One external entry module per calculator (`/_astro/*.js`) enables the controls. Messages reach the script as inert `<template>` HTML, so the bundle carries no text and no foreign origin. `check:site`, CSP, budgets, e2e and Lighthouse derive the page template (home / trust / calculator) from the route table.

## Architecture Decisions

| # | Decision | Rejected | Rationale |
|---|---|---|---|
| C1 | `packages/core/src/geometry/{pi.ts,circle.ts,index.ts}`. `PI = 314159265358979323846264338327950288/10^35`. `circleArea(radius)` = PI·r², and a negative radius throws `NEGATIVE_QUANTITY`. Exported from the root barrel. Mutated in the `units` shard. `src/geometry/**` is added to the core `kernel`, to the 7 CI matrix `inputs` and to the deps in `packages/data/stryker.config.mjs`. A GEO3 scan test guards it | 355/113 or a float; a shard of its own; placing it in `calculators/` | About 15 mutants. The barrel export lets the methodology contract compare the disclosed digits with `PI` |
| C2 | `createConcrete(yields: Readonly<Record<'40'\|'60'\|'80', Quantity<'volume'>>>)` validates its argument. On failure it throws `CoreError('INVALID_DEFINITION', 'BAG_YIELDS', { cause: { id: 'concrete', reason: 'BAG_YIELDS' } })` itself, before calling `defineCalculator`. `DEFINITION_REASONS` stays unchanged. Web: `apps/web/src/lib/concrete.ts` imports `CONCRETE_MIX_YIELDS` from `@maestro-calc/data/yields/concrete-mix` (`bag-<n>` → `<n>`) and exports `concrete`. Both the registry and the client entry use it | The factory reading the material record (that would pull source URLs into the bundle, DR-2); adding the reason to `DEFINITION_REASONS` | Core stays pure. The bundle carries yields only. CC6 compares three sides |
| C3 | The 17 inputs of `calc-concrete`, in spec order: `sh l w t fw fd d h sw rs rn ns n ws bg bp rp`. Append-only holds for future shapes: their fields go after `rp`. S3a declares all 17. S4 and S5 only extend the **same, still unmerged** `sh` options tuple in `RELEASED`: `[slab]`, then `[slab, footing, column]`, then all four (DR-10) | Per-shape groups | Required by the spec. Adding options is allowed |
| C4 | `compute` follows the formula table. Column volume = `multiply(circleArea(divideScalar(d, 2)), h)·n`. `Vt = V·(1 + ws/100)`. Bags = `ceilToPurchaseUnits(ratio(Vt, yield))`, one shopping line. Outputs: `volumeYd3`, `volumeFt3`, `volumeM3`, `netVolume`, `bagCost`, `readyMixCost` | Three shopping lines; rounding volumes; truck increments | Exact. The only rounding is the bag ceiling |
| C5 | Data. `src/yields/concrete-mix.ts` exports `CONCRETE_MIX_YIELDS` (subpath `./yields/*` in `package.json`; no text, no URL). `src/materials/concrete-mix.ts` builds `concreteMix` from those same objects (MDC5). The entry point exports `concreteMix` and `defineMaterial` | A root-barrel export (the record's `defineMaterial` call would survive tree-shaking together with its URL) | A separate module is the only reliable boundary |
| C6 | i18n follows the spec. `concrete.ts` holds the derived keys plus `material.concrete-mix.*` and `calc.concrete.page.*`, including `example` (DR-15). `site.ts` holds `site.calculator.*` and, at go-live, `page.concrete.*`. `i18n-contract.test-d.ts` widens its "no extra key" union accordingly | A `materials` module | The spec allows these namespaces |
| C7 | `routing/templates.ts` exports:<br>- `CALCULATOR_PAGES`<br>- `PAGELESS`<br>- `templateOf(id)`<br>`PAGELESS` is `['rectangle-area', 'concrete']` until go-live, then `['rectangle-area']`. The go-live slice adds the `ROUTES` row and moves `concrete` to `CALCULATOR_PAGES`. The page id equals the calculator id. SR17 is tested in both directions | An implicit exemption | Every merged `main` satisfies SR17 (DR-3, DR-5) |
| C8 | `components/calculator/CalculatorBody.astro` is a route-free container. It takes the view model, the content entry and the text, and renders the breadcrumb `<ol aria-label>`, H1, answer, form, result panel, templates and content. It is presentational below that level (`Breadcrumb`, `CalculatorForm`, `ResultPanel`, `ShoppingLine`, `SourceList`). `views/CalculatorView.astro` is thin and route-aware: head, JSON-LD, the per-id script component. It arrives with the route. Controls are `disabled` in the HTML; "Copy link" and the steppers are `hidden`. Reserved block sizes: the shape area (tallest shape), answer (longest sentence at 390 px), notice area, copy button and status line, steppers (DR-13) | One view that needs a `PageId` before the route exists | Render tests can cover the full page in G2 without routing it |
| C9 | **No-JS and failure path.** A static "not running" note sits in the reserved notice area: `site.calculator.noscript` + `calc.concrete.page.example`. It is not inside `<noscript>`. The script hides it only after a successful mount, so a module that fails to load or start leaves the note, the disabled controls and the default result in place (CP40, CP49, DR-14). Later the area shows URL notices | `<noscript>` (it misses JS-on module failures); a GET form | Honest about both failure modes, with no layout shift |
| C10 | **One entry per calculator (DR-1).** `client/entries/concrete.ts` imports `lib/concrete.ts`, `calculator/*` and `client/mount.ts`. It never imports `lib/calculators.ts` or the data root (contract CP48 walks the graph). `islands/ConcreteScript.astro` holds one processed `<script>import '../client/entries/concrete.ts'</script>`. `CalculatorView` picks it from `SCRIPTS: Record<CalculatorPageId, AstroComponent>`. `astro.config.mjs` sets `vite.build.assetsInlineLimit: (f) => f.endsWith('.js') ? false : undefined` (Astro 7.4.2 `plugin-scripts.js` inlines import-free chunks below the limit; `util.js#shouldInlineAsset` falls back to 4096 for CSS). The entry may share hashed chunks; the budget counts the entry plus its static graph | One module for all calculators | Each page bundles only its own calculator, and this scales to 100+ |
| C11 | Pure modules in `calculator/{present.ts,controller.ts,layout.ts}`, with node vitest at 100% coverage. `client/mount.ts` is tested with Playwright only. The controller builds its raw record as `{ ...lastValidState, ...visibleTexts }`. An empty price is set **explicitly** to `undefined` on its own key, which overrides the spread, so validation reads it as the default (DR-11, with its own test). Query writes happen only on valid state | happy-dom | Deterministic. A hidden field never blocks the visible shape |
| C12 | URL: `decode` on load, notices, no rewrite on load. After each valid change, `replaceState`; the switch `href` gets `location.search`. The toggle re-renders field texts losslessly. Metric texts use exact decimals, else exact inches. US texts use feet, inches and fractions with a denominator up to 64 when exact, else exact inches (`20000/127 in`). Round-trip tests run in both directions (CP33, CP50, DR-17) | Rounded field text | No state drift |
| C13 | All strings come from the page: `<template>`s for the 12 error messages, 4 answer sentences, notices and copy states. Labels, `inputmode`, `aria-invalid`/`aria-describedby`, "—" on error, bounds in the field's unit. The answer sentence is a polite live region. Copy has a status region plus a read-only fallback. Inputs ≥ 56 px, other targets ≥ 44 px | A JSON data block; strings in JS | The bundle stays language-free |
| C14 | CSP `script-src 'self'` (SQ12). **OA5 (owner, DR-18):** keep Cloudflare Email Address Obfuscation and Rocket Loader off, since `script-src 'self'` would allow their `/cdn-cgi/` scripts. SQ28 checks this locally (`check:site` plus e2e: static pages request no script and reference no `/cdn-cgi/`) and in the post-deploy smoke | Per-path CSP; nonce or hash | Closes the gap opened by the relaxed policy |
| C15 | `present.ts` formats both locales the same way: `,` grouping, `.` decimals, built on `toDecimalParts`/`toCents`/`formatFeetInches`. No `Intl` | `Intl.NumberFormat` | Build-time and live strings stay byte-identical |
| C16 | The FAQ lives in the Markdown body. `content/faq.ts#faqOf(body)` feeds `calculatorJsonLd`. `check:site` checks parity with the built HTML. Answers are plain text of at most 600 characters (DR-16) | A `faq` frontmatter field | One source, and the HTML stays bounded |
| C17 | **Size probe in G1 (DR-7, SQ27).** `apps/web/src/contract/client-size.contract.test.ts` calls Vite's `build()` with `write: false`, minify on, library mode, and a virtual entry that re-exports what the entry will use: `concrete` from `lib/concrete.ts`, `encode`, `decode`, `toDecimalParts`, `toCents`, `formatFeetInches`. It asserts ≤ 24,576 B (leaving 8,192 B for the presenter, controller and DOM code) and prints the size. `vite` becomes an explicit `apps/web` devDependency, pinned to Astro's version. **Mitigation path if over:**<br>(1) keep `defineMaterial`, the material record and the data root off the client path, and confirm `sideEffects: false` tree-shaking;<br>(2) stop pulling unused parsers in through barrel re-exports by importing core subpaths or modules where the package exports allow it, or add narrow core subpath exports (a reviewed core change);<br>(3) drop the client's use of the length-parser branches the page never accepts (none expected: CP24 needs the full parser);<br>(4) owner decision. Inlining is never an option | Measuring only in G3 | The 32 KiB risk is known before any page work |
| C18 | HTML budget proof in G2 (DR-16): a `CalculatorBody` render test with full-length placeholder copy (1,500 words, 8 FAQ answers of 600 characters, all templates) asserts the page HTML ≤ 40,960 B | Measuring after go-live | Finds the overrun before the copy is written |

### `check:site` and budgets (template derived from `ROUTES`, `CALCULATOR_PAGES`, `PAGELESS`)

| Rule | Home / trust / 404 | Calculator |
|---|---|---|
| Scripts | only ld+json; no `/cdn-cgi/` reference (SQ28) | exactly one `script[type=module][src^="/_astro/"]` (its calculator's entry), no body; both locales share the entry |
| `on*`, `astro-island` | forbidden | forbidden |
| `modulepreload` | forbidden | same-origin only |
| `dist` JS | only under `_astro/` and reachable from a calculator page | — |
| JS budget | 0 | entry + static graph ≤ 32,768 B |
| Page weight | ≤ 163,840 B | ≤ 196,608 B, JS included |
| HTML / CSS | 40,960 / 20,480 | same |
| JSON-LD | home graph; calculator types forbidden | exactly WebApplication + BreadcrumbList + FAQPage, with FAQ parity |
| Bundle facts | — | no storage or network APIs, no message text, no `http(s)://` other than the site origin (CP47, SS23); TP12 scan unchanged |
| Links | table paths, fragments, mailto, favicon, plus the `externalLinks` allowlist (calculator `sources[].url`) | same |
| Updated / breadcrumb | `time[datetime]` = entry `updated` | plus `ol[aria-label]` before the H1 and one `nav` |

## Data Flow

```
build:  CONCRETE_MIX_YIELDS ─► lib/concrete.ts ─► concrete.run({}) ─► present ─► CalculatorBody (disabled, "not running" note)
page:   CalculatorView ─► SCRIPTS[id] (ConcreteScript) ─► /_astro/<entry>.js (+ hashed chunks)

 user       mount.ts                 controller.ts             core            history / header
  │ load ─► mount OK? hide note ───► decode(search) ────────► (state, issues)
  │ input ► visible texts (price ''→undefined) ► step ─► run ─► result | errors
  │ ◄─ slots, errors, live region ◄─ present        └─(valid)► encode ─► replaceState + switch href
```

## File Changes (summary)

| Area | Action |
|---|---|
| `packages/core/src/geometry/**`, `index.ts`, Stryker configs, CI inputs | Create / Modify |
| `packages/core/src/calculators/concrete/**`, `released-snapshot.ts`, `released.contract.test.ts` | Create / Modify |
| `packages/data/{package.json,src/yields/concrete-mix.ts,src/materials/concrete-mix.ts,src/index.ts}` | Create / Modify |
| `packages/i18n/src/catalogs/{en,es}/{concrete,site}.ts` | Create / Modify |
| `apps/web/src/lib/{concrete,calculators}.ts`, `i18n-contract.test-d.ts`, `contract/client-size.contract.test.ts`, `package.json` (`vite`) | Create / Modify |
| `apps/web/src/calculator/**`, `client/{mount.ts,entries/concrete.ts}`, `islands/ConcreteScript.astro`, `components/calculator/**`, `views/CalculatorView.astro`, `routing/{routes,templates}.ts`, `pages/[...path].astro`, `seo/json-ld.ts`, `views/HomeView.astro` | Create / Modify |
| `apps/web/src/content.config.ts`, `content/{schema,faq}.ts`, `content/calculators/{en,es}/concrete.md`, `content/pages/{en,es}/{methodology,privacy}.md` | Create / Modify |
| `apps/web/src/site-check/**`, `scripts/check-site.ts`, `astro.config.mjs`, `public/_headers`, contracts | Modify |
| `tooling/site-browser/**` (e2e, URL lists, representative calculator, Lighthouse), `AGENTS.md` | Modify |

## Testing Strategy

| Layer | What | How |
|---|---|---|
| Unit (core/data/i18n) | GEO1–7, CC1–29, MDC1–5, ICW10–18 | vitest + fast-check, Stryker (`units`, `calculators`, `data`) |
| Unit (web) | presenter, controller (empty price → `undefined`, CP50 round trip), templates, JSON-LD, `faqOf`, every `check:site` rule with seeded failures | vitest, 100% coverage |
| Render | `CalculatorBody` with the default result, reserved areas, the "not running" note, and the HTML budget under full-length copy | Astro container |
| Contract | SR17 + `PAGELESS`, released tuples, CC6 (three sides), size probe, CP47 (built graph, no foreign origin), CP48 (source graph), CSP, Lighthouse representative (SQ25), end state, TP26/27 | `src/contract/*` |
| E2E | CP11–50 with JS; no-JS project; module-abort run (CP49); smoke per template, including SQ28; axe in six states; CLS with a query | Playwright + axe via `wrangler dev` |
| Lighthouse | home, methodology, representative calculator × 2 locales; `numberOfRuns` 1 | `lhci` |

## Threat Matrix

N/A: no shell, subprocess, VCS/PR automation or executable-file classification is involved. The client boundary is closed: query values enter only through `decode`, and the DOM is written only through `textContent`/`value`. The CSP forbids inline scripts and `eval`. OA5 and SQ28 cover platform-injected scripts.

## Migration / Rollout

No data migration. URL keys become permanent when G1 merges (owner action OA2 comes first). Each group merge leaves `main` green and production consistent:
- **G1** adds an engine nobody routes.
- **G2** adds unrouted page parts and copy. The CSP becomes `'self'` while no page carries a script.
- **G3** publishes everything that describes the page in one merge.

Rollback: remove the `ROUTES` row and its branch, move `concrete` back to `PAGELESS`, and revert the methodology, privacy and home edits.

## Slice Plan (stacked to main; one PR per group; review units ≤ 400 changed lines, lockfile excluded)

| Group (PR) | Slice | Content | Forecast |
|---|---|---|---|
| **G1 engine** (mergeable alone; nothing routed) | S1 | `geometry` (GEO1–7), barrel, `units` shard, kernel, data deps, CI inputs | ~180 |
| | S2 | yields-only subpath + `concreteMix` built from it (MDC1–5) | ~190 |
| | S3a | `createConcrete`: 17 inputs (`sh` = `[slab]`), outputs, `BAG_YIELDS` + cause, slab net volume (CC1, CC3–5, CC7 volumes); 17 `RELEASED` tuples, `REGISTRY`; `lib/concrete.ts`, registry; `concrete` catalogs (derived + material keys); widened type contract | ~400 |
| | S3b | waste, bags, costs (CC14, CC16, CC19–21), CC6 three-sided drift, CC30 | ~300 |
| | S4 | `footing`, `column` (the same `sh` tuple extended), CC8–10, CC13, CC15, CC17, CC22–24 | ~380 |
| | S5 | `steps` (tuple now all four shapes), CC11, CC12, CC18, CC25–29; mutation count recorded (SQ21) | ~380 |
| | S6 | size probe (C17, SQ27), `vite` devDependency, measured size and mitigation notes recorded | ~150 |
| **G2 page parts** (unrouted) | S7 | `present.ts` + tests; `calc.concrete.page.*`, `site.calculator.*` EN/ES | ~400 |
| | S8 | `CalculatorBody` + presentational components, templates, reserved areas, "not running" note; render tests incl. the HTML budget proof (C18) | ~400 |
| | S9 | `check:site` template rules, budgets, JSON-LD and FAQ parity, links allowlist, breadcrumb, bundle facts, SQ28; CSP; `assetsInlineLimit`; `templates.ts` with `PAGELESS` + SR17 | ~400 |
| | S10 | `calculators` collection + full EN/ES copy, `faqOf`, `calculatorJsonLd`, CP6–10 contracts (read entries directly) | ~400 |
| **G3 go-live** (one merge) | S11a | `controller.ts`, `layout.ts` + tests (DR-11, CP50 logic) | ~350 |
| | S11b | `mount.ts`, `entries/concrete.ts`, `ConcreteScript.astro`, enable/reveal/hide-note, CP48 graph contract | ~350 |
| | S12 | methodology concrete section (TP22–26), privacy `calculators` section (TP27), AGENTS.md recipe | ~300 |
| | S13a | **Route live:** `ROUTES` row, `page.concrete.*`, `PAGELESS` → `['rectangle-area']`, `CalculatorView` + catch-all branch, home link (TP21), Lighthouse representative (SQ25), end-state pin, smoke per template, no-JS project, CP47 built-graph test | ~280 |
| | S13b | JS e2e (CP11–39, CP49), axe interactive states (SQ17, SQ20), CLS with a query (SQ19, CP44) | ~350 |

Total ~5,210 lines across 17 review units in 3 PRs.

### Review Workload Forecast

Decision needed before apply: No
Chained PRs recommended: Yes
400-line budget risk: Medium

- Every review unit is ≤ 400 lines.
- S3a, S7–S10 sit at the cap; split at commit boundaries if they exceed it.
- The group PRs are larger than 400 lines by the owner's decision (one PR per group, to save CI minutes and deploys).

## Risks

| Risk | Mitigation |
|---|---|
| Engine surface > 24,576 B | Caught in G1 by S6; C17 mitigation path before G2 starts |
| Calculator HTML > 40,960 B | C18 proof in S8 with full-length copy; FAQ answer cap |
| `vite` import in the probe drifts from Astro's bundler version | Pinned to Astro's version; a contract test compares them |
| Platform-injected scripts allowed by `'self'` | OA5 + SQ28 (local and post-deploy) |
| G3 is the riskiest merge (publishes everything) | Its slices are reviewed separately, and the group is gated by the full e2e/axe/Lighthouse suite before merge |

## Open Questions

None blocking. Owner actions: OA1–OA4, plus OA5 (Cloudflare script-injecting features off).

## Reconciliation with the specs (after sdd-spec)

| # | Change | Spec |
|---|---|---|
| R1 | 17 spec inputs, shared `length`/`count`; append-only confirmed (new fields go after `rp`) | calc-concrete |
| R2 | 35-digit `PI`; `circleArea(radius)` | core-geometry |
| R3 | `calc.<id>.page.*` + `site.calculator.*`; no `materials` module; type contract widened | i18n-catalog |
| R4 | Breadcrumb `<ol aria-label>`, one `nav` | site-shell, calculator-page |
| R5 | Exactly WebApplication + BreadcrumbList + FAQPage; FAQ read from the body | site-seo |
| R6 | Calculator weight 196,608 B including JS; JS graph budget; `modulepreload` allowed | site-quality, site-shell |
| R7 | `workedExample` frontmatter; NIST SP 811 source | calculator-page |
| R8 | Static switch without a query; the script appends it | site-routing-i18n |
| R9 | Lighthouse drops the privacy pair; `numberOfRuns` unchanged | site-quality |
| R10 | Templates, disabled controls, `aria-pressed` buttons, unit-bearing field text, empty price = $0, no URL write while invalid | calculator-page |
| R11 | `netVolume` in ft³; yields keyed `40/60/80` | calc-concrete, material-data-contract |
| R12 | Full copy before go-live (CP10, SE19) | — |

## Design review round 1 (verdict: APPROVE WITH CHANGES)

| DR | Finding | Change (design § / spec) |
|---|---|---|
| DR-1 | One module for all calculators does not scale | C10: `client/entries/<id>.ts` + `islands/<Id>Script.astro` chosen from `SCRIPTS[id]`; no registry import (CP48). Specs: CP42 rewritten, SS20, site-quality budget wording |
| DR-2 | Source URL could reach the bundle | C2/C5: yields-only subpath; CP47 built-graph test (only the site origin allowed); TP12 scan unchanged. Specs: CP42, CP47, CP48, MDC5, CC6, SS23 |
| DR-3 | `rectangle-area` breaks SR17 | C7: `PAGELESS`. Spec SR17 + note about the temporary `concrete` entry |
| DR-4 | SQ25 does not scale | One representative calculator page. Spec SQ25 + requirement text |
| DR-5 | A live page before its trust copy and gates | Route lands in G3 S13a/S13b with entry, methodology, privacy, home link, axe/CLS; G1/G2 unrouted (`CalculatorBody` render tests, fixtures); C7 `PAGELESS` transition; slice table. Specs: SR17 note, TP26, privacy merge rule, CP6 `id` |
| DR-6 | Privacy says "no forms" and nothing about URL state | trust-pages privacy requirement MODIFIED with the EN/ES `calculators` section, a new cookies sentence, TP12 extended, TP27 pins (keeps "no accounts"); S12 |
| DR-7 | Bundle risk measured too late | C17 size probe in G1 S6 (SQ27, 24,576 B) with a written mitigation path |
| DR-8 | S3 over budget | S3a (metadata, tuples, registry, catalogs, slab volume) / S3b (waste, bags, costs, drift). The judge's exact split text was not in the message I received; this split follows the coupling constraints |
| DR-9 | S10 over budget | S11a (pure controller) / S11b (DOM + entry) |
| DR-10 | `sh` options across slices | C3: S4/S5 extend the same unmerged tuple |
| DR-11 | Empty price | C11: explicit `undefined` key + test. Spec CP form text |
| DR-12 | `BAG_YIELDS` ownership | C2 cause `{ id: 'concrete', reason: 'BAG_YIELDS' }`. Spec CC5 sentence + scenario |
| DR-13 | Shift from revealed elements | C8 reserved areas. Spec "Layout stability" |
| DR-14 | JS-on module failure | C9 static note hidden on mount. Spec CP40, CP41, CP49 |
| DR-15 | Concrete text in a shared key | `calc.concrete.page.example`; `site.calculator.noscript` made generic. Specs ICW11, ICW12, ICW17, CP40 |
| DR-16 | HTML budget | C18 render proof with full-length copy; FAQ answer cap of 600 characters. Spec CP content requirement |
| DR-17 | Metric → US exactness | C12; spec toggle text + CP50 |
| DR-18 | `/cdn-cgi` scripts allowed by `'self'` | C14 OA5 + SQ28 |
