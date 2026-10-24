# Apply progress: web-shell

Groups: group 1 (PR 1 to PR 4, branch `feat/web-shell-g1-visible-site`) and group 2 (carry-overs, PR 5 to PR 8, branch `feat/web-shell-g2-seo-quality-infra`, below). PR 9 onward is pending.

## Group 1 (PR 1 to PR 4)

Mode: strict TDD (`npm test`). Delivery: the owner grouped slices to save CI minutes, so PR 1 to PR 4 live on ONE branch, `feat/web-shell-g1-visible-site`, created from `main` (`5cc30b0`), one conventional work-unit commit per unit, `npm run verify` after each PR section. Nothing was pushed, no PR opened, `gentle-ai` not run.
Tasks done: 1.1-1.6, 2.1-2.17, 3.1-3.13, 4.1-4.8. Open on purpose: 1.7 (needs the CI wall time), and the exit task of each section (1.8, 2.18, 3.14, 4.9: SX5 reviewers, SX6 Judgment Day, SX7 PR body).

### Commits and PR boundaries

| PR section | Boundary SHA | Commits (oldest first) | Changed lines (excl. lockfile) | `npm run verify` |
|---|---|---|---|---|
| planning | `dc20fbc` | `docs(repo): add the web-shell change proposal, specs, design and tasks` | n/a | n/a |
| PR 1 mutation identity | `115c83a` | `fix(core): include src/url in the kernel mutation shard identity` | 46 (32+, 14-) | exit 0, 1652 tests |
| PR 2 routing, SEO, catalog | `db4c629` | `e52970d` feat(i18n) site catalog · `e6eb6e9` test(web) register · `d1a3e89` feat(web) route table · `ed067c6` test(web) route/catalog agreement · `c2066fb` feat(web) head, JSON-LD, sitemap · `db4c629` build(repo) 100 percent coverage | 928 (926+, 2-) | exit 0, 1725 tests (84 files) |
| PR 3 tokens, fonts, layout | `9fa527c` | `53e38d4` build(web) fonts · `1717361` feat(web) tokens and base CSS · `b77bab4` feat(web) favicon · `a366c0e` build(web) component lint boundary · `9fa527c` feat(web) base layout, SEO head, skip link | 872 (830+, 42-) | exit 0, 1771 tests (92 files) |
| PR 4 header, footer, home | `59edc73` (code tip; the docs commit sits above it) | `cefc9a1` feat(web) link and switch helpers · `dcfce35` feat(web) header, wordmark, switch, footer · `6a76742` feat(web) home from route table, smoke page dropped · `d2b6938` refactor(web) tagline dropped, `contacto@` · `59edc73` refactor(web) role-named tokens and `.tap-target` | 913 (832+, 81-) | exit 0, 1826 tests (103 files) |

SHAs above are the ones after correction round 1 (the history was rewritten; the first-pass SHAs `95d434e`, `df938ad`, `95fc9c5` no longer exist).

Size: every section is over the 400-line review budget (tests carry most of the lines). The owner accepted one larger group PR (publishing rule); the per-section numbers are recorded so a split stays possible at the commit boundaries above. Whole branch: 67 files, 2,323 insertions, 75 deletions vs `dc20fbc`, lockfile excluded.

### Spike decisions

- **3.2 Astro Fonts API (passed, no fallback).** Astro 7.4.2. `fontProviders.local()` with package-import `src` (`@fontsource/barlow/files/barlow-latin-400-normal.woff2`, same for 600; `@fontsource/barlow-condensed` 600 and 700), exact-pinned `@fontsource/barlow@5.3.0` and `@fontsource/barlow-condensed@5.3.0`. `npm run build` emits four hashed woff2 under `dist/_astro/fonts/` and generates the metric-adjusted `Arial` fallback (`size-adjust`). No committed font files. `subsets: ['latin']` is accepted by the local provider.
- **3.9 Astro container under vitest (passed, no fallback).** `AstroContainer.create()` + `renderToString` work under vitest 5 when `apps/web/vitest.config.ts` uses `getViteConfig(config, { root: import.meta.dirname })`. Without the explicit root Astro resolves its project from the repository root (the root vitest config runs the `web` project from there) and warns `Missing pages directory`. Layouts need `partial: false` to render the doctype. `.astro` imports are untyped in plain `tsc` and typescript-eslint, so `src/contract/astro-modules.d.ts` declares them as `AstroComponentFactory`.

### TDD Cycle Evidence

| Task | Test file | Layer | Safety net | RED (observed) | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| 1.2 identity walk | `contract/mutation-identity.contract.test.ts` | Contract | 4 files, all green | 7 failed: 5 `%s: every file ... in its identity` listing only `src/url/index.ts`, `codec.ts`, `url-values.ts`, plus the codec pin and the hash equality | 89 pass after 1.4/1.5 | loop over five kernel shards; `calculators` stays distinct | walk comment rewritten |
| 1.3 CI key | `contract/mutation-ci-key.contract.test.ts` | Contract | green | 5 failed (one per kernel shard) | pass after 1.5 | 5 shards | none |
| 1.6 negative proof | identity test | Contract | n/a | `export * from './foo/x.ts'` with `src/foo/x.ts` fails naming `src/foo/x.ts` (8 failures); reverted, tree clean | n/a | n/a | n/a |
| 2.2/2.3 site catalog | `i18n/src/site-catalog.test.ts`, `catalog.test-d.ts`, `lib/i18n-contract.test.ts` | Unit, type | 44 i18n tests | module missing; module list pinned `['common','site',...]` failed | 65 pass | both locales, 4 titles, 4 descriptions, uniqueness | prettier |
| 2.4/2.5 register | `contract/register.contract.test.ts` | Unit | n/a (new) | module missing | 19 pass | 15 forms, whole word, case, real catalogs | none |
| 2.6/2.7 routes | `routing/routes.test.ts`, `routes.test-d.ts` | Unit, type | n/a (new) | module missing | 17 pass | 6 seeded invalid tables, fixture table, `/essay` vs `/es` | overloads instead of a cast |
| 2.8/2.9 agreement | `contract/site-catalog.contract.test.ts` | Contract | n/a | module moved away, run showed `Cannot find module './route-catalog.ts'` | pass | missing key, missing id, unexpected id | none |
| 2.10-2.15 SEO | `seo/head.test.ts`, `json-ld.test.ts`, `sitemap.test.ts` | Unit | n/a | 3 modules missing | 14 pass | en/es, injected table, escaping | chained `replaceAll` instead of lookup maps (removes unreachable `??` branches, keeps 100 percent branches) |
| 2.16 coverage | `contract/coverage.contract.test.ts` | Contract | 7 pass | 2 failed with `vitest.config.ts` reverted | pass; `test:coverage` 100/100/100/100 | two globs | none |
| 3.3/3.4 fonts | `contract/fonts.contract.test.ts` | Contract | n/a | 1 failed (no `fonts` in config); loops guarded with `toHaveLength(2)` after seeing four vacuous passes | 5 pass | two families, weights, hosts | `variant()` helper and typed `shared` block (astro check) |
| 3.5/3.6 tokens | `styles/styles.contract.test.ts`, `contract/contrast.test.ts` | Contract | n/a | `ENOENT tokens.css` | 14 pass | contrast pairs, focus rule, skip link | none |
| 3.7/3.8 favicon | `contract/favicon.contract.test.ts` | Contract | n/a | 2 failed | pass | svg and no ico | none |
| 3.10/3.11 layout | `SkipLink`, `SeoHead`, `BaseLayout` tests | Component | n/a | modules missing (`SkipLink.astro` pre-existed from the spike, so its test was spot-checked: `href="#top"` fails it) | 6+ pass | en/es lang, indexable vs noindex head | none |
| 3.12 lint boundary | `contract/gates.contract.test.ts` | Contract | 109 pass with old config | 4 failed with the old `eslint.config.js` | 109 pass | 4 banned, 2 allowed, layout allowed | none |
| 4.2/4.3 links, switch | `routing/links.test.ts`, `switch.test.ts` | Unit | n/a | modules missing | 25 routing tests pass | fixture and real table | none |
| 4.4/4.5 header, footer | four component tests, `BaseLayout.test.ts`, `styles.contract.test.ts` | Component, contract | green | 4 component modules missing, 9 other failures (no header/footer in layout, no target-size rules) | 436 web tests pass | en/es wiring, empty link list | `rulesOf` splits selector lists |
| 4.6/4.7 home | `views/HomeView.test.ts`, `routing/static-paths-page.test.ts` | Component | n/a | modules missing | 483 pass | en/es | none |

### Work Unit Evidence

| Evidence | PR 1 | PR 2 | PR 3 | PR 4 |
|---|---|---|---|---|
| Focused tests | `npm test -- apps/web/src/contract/mutation` 89 pass | `npm test -- packages/i18n apps/web/src/routing apps/web/src/seo apps/web/src/contract` pass | `npm test -- apps/web/src/styles apps/web/src/components apps/web/src/layouts` pass | `npm test -- apps/web/src` 483 pass |
| Runtime harness | cold `npm run mutation -- --shard <x>` for all 7 core shards (below) | N/A, pure functions at 100 percent coverage | `npm run build`, 4 woff2, 0 `<script` | `npm run build`, inspect `dist/index.html`, `dist/es.html` |
| Rollback boundary | `stryker.config.mjs`, `ci.yml` inputs, two contract tests | `routing/`, `seo/`, `site` catalogs, contract tests, `vitest.config.ts` coverage lines | fonts config, `styles/`, favicon, `layouts/`, `SeoHead`, `SkipLink`, lint override | header/footer components, `[...path].astro`, `HomeView` (restoring the smoke page needs the PR 3 tip) |

### Mutation (PR 1, SX2)

Identity proof (report names printed by `optionsFor(shard).incrementalFile`; a throwaway comment appended to `src/url/codec.ts`, then reverted):

| Shard | Before the fix | After the fix | After a codec edit |
|---|---|---|---|
| rational | `ba06789a...` | `5ed7aed6...` | `55b95c82...` |
| units | `ba06789a...` | `5ed7aed6...` | `55b95c82...` |
| format | `ba06789a...` | `5ed7aed6...` | `55b95c82...` |
| calculator-define | `0562cf75...` | `c2178fa2...` | `7ed8f800...` |
| calculator-run | `ba06789a...` | `5ed7aed6...` | `55b95c82...` |
| url | `943ef063...` | `5ed7aed6...` (equals the kernel, as the test pins) | `55b95c82...` |
| calculators | `35de9987...` | `ce557698...` | `21dcdce8...` |

The final-tree report names differ from the `After the fix` column because PR 2 (root `vitest.config.ts`) and PR 3 (`package-lock.json`) are also identity inputs. Every kernel shard name changes after a codec edit (it did not before the fix for `rational`, `units`, `format`, `calculator-run`).

Cold runs on the final tree (`npm run mutation -- --shard <x>`, logs `ws-mut-<shard>.log` in the session scratchpad; each started with "No incremental result file found"):

| Shard | Score | Killed | Timeout | Survived | No cov | Wall time |
|---|---|---|---|---|---|---|
| rational | 100.00 | 202 | 7 | 0 | 0 | 67.4 s |
| units | 100.00 | 213 | 0 | 0 | 0 | 47.7 s |
| format | 100.00 | 409 | 0 | 0 | 0 | 90.2 s |
| calculator-define | 100.00 | 460 | 0 | 0 | 0 | 105.4 s |
| calculator-run | 100.00 | 153 | 0 | 0 | 0 | 33.7 s |
| url | 100.00 | 286 | 0 | 0 | 0 | 62.9 s |
| calculators | 100.00 | 39 | 0 | 0 | 0 | 9.8 s |

No pragma added. calculator-run, url and calculators were rerun on the final tree after a working-tree accident (see Deviations) so the logs above are from a clean tree. Web helpers (`routing`, `seo`) are coverage-governed at 100 percent, not mutation-tested (the spec asks for mutation on core and data only).

### Built-HTML evidence (`npm run build`, `apps/web/dist`)

- HTML files: exactly `index.html` and `es.html` (plus the integration `sitemap-index.xml` and `sitemap-0.xml`, which PR 6 replaces).
- `lang`: `en-US` and `es-US`. Title: `Maestro Calc: jobsite calculators` and `Maestro Calc: calculadoras para tu obra` (from the catalog). Description present on both.
- Canonical `https://maestrocalc.com/` and `https://maestrocalc.com/es`; hreflang trio (`en-US`, `es-US`, `x-default` pointing at English) on both.
- One `<h1>Maestro Calc</h1>` inside `main#main`; skip link `<a class="skip-link" href="#main">` is the first body element (`Skip to main content`).
- Language switch: `/` links `/es` (`lang="es" hreflang="es-US"`), `/es` links `/`.
- Zero `<script` tags, zero third-party hosts, four woff2 in `dist/_astro/fonts`, two font preloads (weights 400 and 700), SVG favicon only, no `favicon.ico`.
- Header and footer link lists are empty (only the home page exists); the footer shows `contacto@maestrocalc.com` (moved forward from PR 5 in correction round 1).
- JSON-LD is not in group 1: it belongs to PR 6 (task 6.x), so the home pages have none yet.
- SX4: `git log main..HEAD --format=%B | rg -i 'co-authored|claude|anthropic|generated with'` is empty; longest subject 74 characters.

### Deviations

1. **One branch for four sections** (owner publishing rule) instead of four stacked branches; the 400-line budget is exceeded per section (46 / 928 / 872 / 913) because the strict-TDD tests carry most of the lines. Commits stay split at work-unit boundaries.
2. **Lint failures in intermediate commits (resolved in correction round 1)**: the lint-fix commit and the tsconfig fixup were folded into their owners, so every commit now passes format, lint, typecheck and tests.
3. **`node-html-parser` arrives in PR 3** (exact-pinned dev dependency of `apps/web`), earlier than the PR 7 slice that names it, because the component tests parse rendered HTML.
4. **Language switch inside the nav.** `SiteHeader` places the switch inside the single labelled `nav`, so the landmark that [SS1] requires on every page is never empty while the link list is. [SS1] and [SR5] still hold.
5. **`pathOf`, `alternatesOf`, `staticPaths` have overloads** with an optional injected table (`PageId` for the real table, `string` plus a table for fixtures) so seeded and fixture tests need no cast. `linksFor` and `switchFor` take a table with a default, as task 4.2 says.
6. **`.astro` typing shim and test support location.** `src/contract/astro-modules.d.ts` types `.astro` imports for tests; `renderComponent` lives in `src/__testing__/` (both web tsconfigs treat it as test support, the app program excludes it) because contract helpers are banned from shipped code and `node-html-parser` is a dev dependency. A first attempt to add `astro/client` to the test tsconfig `types` was reverted (the manifest contract pins `["node"]`, and it did not type `.astro` imports).
7. **Keyboard pass (4.8) not run in a browser.** Tab order was verified from the DOM order of the built HTML (skip link, wordmark, language switch, footer link); the dev-server walk is left to the browser gate of PR 8.
8. **Working-tree accident, no content lost.** A `git stash -- <untracked path>` failed and the following `git stash pop` applied an older, unrelated foundation stash onto the tree, producing conflicts in `ci.yml` and `stryker.config.mjs`. Both files were restored from `HEAD` (`git checkout HEAD -- <files>`); the two pre-existing stashes are untouched. Three mutation shards that were running in the background at that moment were rerun on the clean tree.
9. **Copy authored here**: home/not-found descriptions (EN and ES, 70-160 characters) and the `page.home.heading` key (`Maestro Calc` in both locales, task 4.7). Descriptions: EN `Jobsite calculators for builders and homeowners in the US. Enter your measurements and see exactly what to buy.`; ES `Calculadoras de obra para constructores y dueños de casa en EE. UU. Ingresa tus medidas y sabe exactamente qué comprar.` Neutral tú, no voseo (register test).
10. **Design W12 vs spec**: `WebSite` JSON-LD carries `name: 'Maestro Calc'` (spec wins), implemented in `homeJsonLd` but not yet rendered (PR 6).

### Key learnings

1. The core shard identity also hashes the root `vitest.config.ts` and `package-lock.json`, so PR 2 and PR 3 renamed every report again after the PR 1 fix and a cold run on the final tree is the only valid score.
2. The Astro container API renders `.astro` components under vitest only when `getViteConfig` receives the project root explicitly, and layouts need `partial: false` to emit the doctype.
3. Component and layout code stays testable without a build, but `tsc` and typescript-eslint need a `declare module '*.astro'` shim because only the Astro language server types those imports.
4. Coverage branch thresholds punish defensive `?? fallback` lookups that can never run, so chained `replaceAll` calls and overloads beat lookup maps and casts in 100-percent modules.
5. Never use `git stash` with an untracked pathspec while background jobs read the tree: the failed stash silently let `stash pop` apply an old stash.

## Group 1 correction round 1

Mode: strict TDD. Applied the single correction round on `feat/web-shell-g1-visible-site` (base `main` `5cc30b0`). Nothing pushed, no PR opened, `gentle-ai` not run. No `git stash` (fixup commits plus `GIT_SEQUENCE_EDITOR=true git rebase -i --autosquash 5cc30b0`). No core file changed, so mutation was not rerun; PR 1 (`115c83a`) is untouched.

### Applied by ID

| ID | What changed | Owner commit | RED observed |
|---|---|---|---|
| R1-2, RES-4 | `SITE.contactEmail` is `contacto@maestrocalc.com`; `SITE.tagline` and the unused `SITE.locale` removed; new `contract/site-config.contract.test.ts` (address, absent keys with `@ts-expect-error`, no `hello@` in `apps/web/src` or `apps/web/public`); footer test asserts `Escríbenos a contacto@maestrocalc.com`. Tasks 5.2 and 5.3 pulled forward and marked `[x]` | `d2b6938` (new, PR 4 section) | 4 failed |
| R1-1 | `testSupportImport` added to both `apps/web` lint blocks; 5-row probe in the gates contract test (lib, page, component rejected; test file and `__testing__` itself allowed) | `a366c0e` | 3 failed |
| RD-1 | duplicate `src/**/__testing__` exclude removed from `tsconfig.app.json` | `6a76742` | n/a (config) |
| RD-2 | "To add a page" comment above `ROUTES` naming the four edits and the check that catches each | `d1a3e89` | n/a (comment) |
| RD-3 | `NOT_FOUND_ID` and `ShellPageId` exported from `routes.ts`; used by `BaseLayout` props, `switchFor` (overloads) and `EXTRA_IDS` | `d1a3e89`, `ed067c6`, `cefc9a1`, `dcfce35` | type test failed (`ShellPageId` missing), runtime test failed (`NOT_FOUND_ID` undefined) |
| RD-4 | `linksFor` generic over the id literal; both casts removed from `BaseLayout.astro`; `links.test-d.ts` | `cefc9a1`, `dcfce35` | 2 type errors |
| RD-5 | `SiteText` moved to `lib/site-text.ts`; `seo/head.ts` imports the type | `9fa527c` | n/a (move, covered by existing tests) |
| RD-6 | `seo/sitemap.ts` uses `Locale` and maps over the exported `LOCALES` | `c2066fb`, `d1a3e89` | `LOCALES` undefined |
| RD-8 | role-named tokens (`--color-text`, `--color-link`, `--color-accent`, `--color-text-secondary`, `--color-ground`, `--color-surface`, `--color-whatsapp`, `--color-on-whatsapp` = `#06210F`), each with a trailing swatch comment; contrast test for the WhatsApp label (4.5 or more; white fails) | `59edc73` | 10 failed |
| RD-9 | one `.tap-target` utility in `base.css`, applied by the five components; no global selector keyed to a component class; contract renders each component and asserts the class on every link | `59edc73` | 11 failed |
| RD-10 | `renderComponent(component, props, { partial?, slots? })`; used by `HomeView.test.ts` and `BaseLayout.test.ts`; own test file (fragment by default, whole document with `partial: false`) | `6a76742` | `partial: false` ignored (doctype missing) |
| REL-1 | SS3 first-focusable selector is `a, button, input, select, textarea, [tabindex]` | `9fa527c` | n/a (hardening) |
| REL-2 | preload test ties each preload `href` to its `@font-face` (Barlow 400, Barlow Condensed 700); negative proof: preload weight 700 changed to 600 failed it, reverted | `9fa527c` | negative proof only |
| REL-3 | ICW6 dist pattern is `\b(errors|calc)\.[a-z]` in task 4.8; noted in 7.12 for `check:site`; run on `dist`: 0 hits | docs commit | n/a |
| RES-3 | `fonts.contract.test.ts` asserts four woff2 files, each 30,720 B or less, total 92,160 B or less (measured 89,720 B) | `53e38d4` | n/a (new bound over green state) |
| RES-1, RES-2 | recorded only: bold fallback calibration goes to task 11.9 (PR 11), immutable cache for `/_astro/*` goes to task 8.11 (PR 8) | tasks.md | n/a |
| RD-7 | `df938ad` folded into the layout commit; the lint-fix commit `95d434e` split by file into the i18n catalog commit and the route/catalog agreement commit; the fonts config typing and the `render-component` move (with tsconfig includes) pulled into the commits that need them | all | n/a |

### Tests and gates

- `npm run verify` exit 0 at each boundary after the fold: `db4c629` 1725 tests (84 files), `9fa527c` 1771 (92), `59edc73` 1826 (103). `115c83a` (PR 1) is unchanged from the first pass, 1652 tests.
- `format:check`, `lint`, `typecheck` and the full unit suite pass on EVERY commit from `115c83a` to `59edc73` (`git rebase --exec` over the whole range).
- Built HTML (`npm run build`, `apps/web/dist`): `index.html` and `es.html` only; 0 `<script`; `contacto@maestrocalc.com` once in each; `hello@` absent; ICW6 pattern `\b(errors|calc)\.[a-z]` 0 hits.
- SX4: no co-author, `claude`, `anthropic` or `generated with` text in `git log main..HEAD`.
- Whole branch vs `dc20fbc` (lockfile excluded): 74 files, 2,721 insertions, 124 deletions.

### TDD Cycle Evidence (round 1)

| Task | Test file | Layer | Safety net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| R1-1 | `contract/gates.contract.test.ts` | Contract | 111 pass | 3 failed | 114 pass | lib, page, component rejected; test file and `__testing__` allowed | none |
| R1-2/RES-4 | `contract/site-config.contract.test.ts`, `layouts/BaseLayout.test.ts` | Contract, component | green | 4 failed | pass | src and public scans, key absence | none |
| RD-3/4/6 | `routing/routes.test.ts`, `routes.test-d.ts`, `links.test-d.ts` | Unit, type | green | 3 failed | 453 web tests pass | two lists (header, footer) | prettier |
| RD-8/9 | `styles/styles.contract.test.ts` | Contract, component | green | 21 failed | 469 pass | 8 tokens, 5 components, 5 old selectors | duplicate `display` removed from `Wordmark` |
| RD-10 | `__testing__/render-component.test.ts` | Unit | green | 1 failed | 3 pass | fragment, document, layout as fragment | `exactOptionalPropertyTypes` spread for `slots` |
| REL-2 | `layouts/BaseLayout.test.ts` | Component | 11 pass | negative proof (weight 600) | pass | two preloads | none |
| RES-3 | `contract/fonts.contract.test.ts` | Contract | 5 pass | n/a (bound set above current sizes) | 6 pass | per file and total | none |

### Deviations and notes

1. Two commits were added to the PR 4 section (`d2b6938`, `59edc73`) for behaviour that has no earlier owner; everything else is folded into the commit that owns the file.
2. Folding forced three extra moves to keep each commit green: the typed `fontProviders` config (needed by lint in the fonts commit), the `render-component` move to `src/__testing__/` with its tsconfig includes (needed by `import-x/no-extraneous-dependencies` in the header commit), and `links.test-d.ts` (needs `HEADER_PAGES`, so it lives in the header commit).
3. First fixup attempts against the wrong owner commits conflicted in the autosquash and were skipped, then redone against the right owner; the final tree was compared with the pre-rewrite tree each time (`git diff <old tip>` empty).
4. The `renderComponent` options also take `slots`, because the `BaseLayout` test needs the default slot; `{ partial?: boolean }` alone was not enough.
5. The commit subject for the contact change was shortened to fit 74 characters or fewer.

### Key learnings

1. A review fold has a second job beyond the findings: running `lint`, `typecheck` and tests on every commit (`git rebase --exec`) surfaced three more commits that were not green (fonts config typing, `render-component` location, a type test ahead of its helper).
2. A fixup must target the commit that owns the file at that point in history, not the commit that owns the feature; the same filename moved directories mid-branch, which made the first targets conflict.
3. When a lint-fix commit touches several owners, split it by file with `git revert -n` plus `git checkout <sha> -- <paths>` fixups, then drop the original and the revert from the todo; compare trees to prove nothing was lost.
4. Test-support helpers need their lint and tsconfig placement in the first commit that uses them, not in a later cleanup.
5. A bound set above the current value (font sizes) is a hardening test, not a RED; record it as such and prove the other tests with a negative probe.

## Group 2 (G1 carry-overs, PR 5 to PR 8)

Mode: strict TDD (`npm test`). Delivery: owner decision, all slices of the group are work-unit commits on ONE branch, `feat/web-shell-g2-seo-quality-infra`, created from `b60556c` (the group 1 tip). Nothing pushed, no PR opened, `gentle-ai` not run. Task 8.14 (draft PR to measure CI) is deferred to the orchestrator.
Tasks done: 5.1, 5.4-5.9, 6.1-6.7, 7.1-7.18, 8.1-8.13 (5.2 and 5.3 were done in group 1). Open on purpose: the exit task of each section (5.10, 6.8, 7.19, 8.15: SX5 reviewers, SX6 Judgment Day, SX7 PR body), 8.14 (deferred), and 1.7 (CI wall time).

### Commits and PR boundaries

| Section | Boundary SHA (code tip) | Commits (oldest first) | Changed lines (excl. lockfiles) | `npm run verify` |
|---|---|---|---|---|
| G1 carry-overs 0(a), 0(b) | within PR 5 | `38d7899` fix(web) main gutter and page width · `9068796` refactor(web) typed locale tuple · `a0fd4b3` build(repo) unsafe-assertion rule on apps/web | (counted in PR 5) | n/a |
| PR 5 not-found, home copy | `50158fb` | `768d6a8` test(web) wrangler asset rules, JSONC reader · `9df2533` feat(web) not-found pages · `50158fb` feat(web) home introduction (+ docs `d09b224`) | 277 (273+, 4-) incl. carry-overs | exit 0, 1856 tests (106 files) |
| PR 6 endpoints, JSON-LD | `956652d` | `7520b6d` feat(web) sitemap.xml and robots.txt · `623ed85` feat(web) JSON-LD · `956652d` build(web) remove the sitemap integration (+ docs `2a05568`) | 133 (121+, 12-) | exit 0, 1866 tests |
| PR 7 check:site | `dd11569` | `bb3c362` feat(web) page-set, head, canonical checks · `099bd0a` structure, link, zero-JS checks · `b319d43` sitemap, robots, JSON-LD checks · `b4afac9` check:site CLI · `dd11569` ci: check:site between build and check:dist (+ docs `1f8aebb`, `1869a0c`) | 2,476 (2,465+, 11-); 1,560 of it is test files | exit 0, 2028 tests, `site-check` 100/100/100/100 |
| PR 8 browser gate | `d85f25a` | `5253c53` build(repo) site-browser tooling · `81783eb` build(web) security headers and caching · `90ab75b` test(web) axe and phone smoke · `d85f25a` ci: site-browser job and dist artifact (with docs contract, AGENTS.md, config.yaml) | 937 (909+, 28-) | exit 0, 2075 tests; `npm run test:e2e` 27 passed |

Whole group: 22 commits, 75 files, 3,768 insertions, 55 deletions vs `b60556c` (lockfiles excluded). Every section is over the 400-line review budget (PR 7 by far: the rules and their seeded-failure tests); the owner accepted one group PR. The PR 7 contingency split (`07a` rules, `07b` CLI and CI) is available at `b319d43` / `dd11569`.

SX4: `git log b60556c..HEAD --format=%B | rg -i 'co-authored|claude|anthropic|generated with'` is empty. Mutation: no `packages/core` or `packages/data` file changed and the root lockfile is unchanged since the group 1 mutation run except by the `@astrojs/sitemap` removal and the `node-html-parser` pin of group 1, so the CI `mutation` matrix will cold once; not run locally.

### TDD Cycle Evidence

| Task | Test file | Layer | Safety net | RED (observed) | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| 0(a) gutter | `styles/styles.contract.test.ts` | Contract | 30 pass | 2 failed (no `main` rule) | 32 pass | padding 16 px and column width | none |
| 0(b) locale tuple | `routing/routes.test-d.ts`, `routes.test.ts` | Type, unit | 29 pass | type test failed (`Locale[]` not a tuple) | 30 pass | tuple, `Locale` equality, `Object.keys` order | none |
| 0(b) lint rule | `contract/gates.contract.test.ts` | Contract | 114 pass | 1 failed with the old `eslint.config.js` (checked by restoring it) | 115 pass | source rejected, test file exempt | `root.ts` justified disable; lint found 2 violations, both fixed |
| 5.4 wrangler | `__testing__/jsonc.test.ts`, `contract/wrangler.contract.test.ts` | Unit, contract | n/a | module missing; characterization spot check (`single-page-application` failed it) | 9 pass | comments, trailing commas, error, real file | helper moved to `__testing__` (lint dependency rule) |
| 5.5/5.6 not found | `views/NotFoundView.test.ts` | Component | n/a | `NotFoundView.astro` missing | 16 pass | en/es, noindex, switch, 404 pages | none |
| 5.7/5.8 home copy | `views/HomeView.test.ts` | Component | green | 6 failed (no intro, key missing) | 545 web+i18n pass | en/es, 7 banned terms in markup and catalog | none |
| 6.2-6.5 endpoints | `seo/sitemap-endpoint.test.ts`, `contract/robots.contract.test.ts`, `components/SeoHead.test.ts`, `views/HomeView.test.ts` | Unit, contract, component | green | 2 modules missing, 3 render tests failed | 18 + 54 pass | with/without JSON-LD, en/es, other view none | none |
| 6.6 integration removal | `seo/sitemap-endpoint.test.ts` | Contract | green | 1 failed (dependency still present) | 513 pass | manifest and config | none |
| 7.4-7.7 files, head | `site-check/files.test.ts`, `head.test.ts`, `dom.test.ts` | Unit | n/a | modules missing | 31 pass | boundaries 10/60, 70/160, 9/61, 69/161, seeded per rule | `?? ''` centralised in `dom.ts` for branch coverage |
| 7.8-7.9 structure | `site-check/structure.test.ts` | Unit | n/a | module missing | 38 pass | 8 landmark cases, 6 bad hrefs, 5 good, fragments | nested ternary flattened |
| 7.10-7.11 assets | `site-check/assets.test.ts` | Unit | n/a | module missing; 6 failed on first run (comments dropped by the parser, case) fixed in the code | 28 pass | 6 script cases, 5 hosts, palette, fonts | `Page.html` added |
| 7.12-7.13 content | `site-check/content.test.ts`, `checks.test.ts` | Unit | n/a | module missing | 47 + 2 pass | 6 forbidden types, 5 robots, 4 sitemap cases | none |
| 7.14-7.15 CLI | `site-check/cli.test.ts` | Integration (spawns node) | n/a | 7 failed against the stub | 7 pass | 5 seeded copies, missing dir | none |
| 7.16-7.17 CI/manifest | `contract/ci.contract.test.ts`, `manifest.contract.test.ts`, `coverage.contract.test.ts` | Contract | 54 pass | 4 failed, then 1 for the coverage glob | 356 pass | order, root and web scripts | none |
| 8.2-8.6 | `browser-tooling`, `wrangler-e2e`, `headers`, `ci`, `gates` contract tests | Contract | green | 11 failed with `tooling/site-browser` moved aside | 398 pass | seeded wrong directory, every other difference | none |
| 8.9-8.11 | `e2e/a11y.spec.ts`, `e2e/smoke.spec.ts` | E2E | n/a | 2 failed (header tests) with `dist/_headers` removed; 25 page tests green first run | 27 passed | 2 locales, 4 unknown paths, round trips | none |
| 8.12 docs | `contract/docs.contract.test.ts` | Contract | green | 4 failed | 4 pass | two files, two scripts, install commands | none |

### Work Unit Evidence

| Evidence | PR 5 | PR 6 | PR 7 | PR 8 |
|---|---|---|---|---|
| Focused tests | `npm test -- apps/web/src/views packages/i18n` pass | `npm test -- apps/web/src/seo apps/web/src/components` pass | `npm test -- apps/web/src/site-check` 149 pass, 100 percent | `npm test -- apps/web/src/contract` 398 pass |
| Runtime harness | `npm run build`: `index.html`, `es.html`, `404.html`, `es/404.html`; `hello@` absent; footer shows `contacto@` | built `sitemap.xml` has 2 `<loc>`, alternates equal the head hreflang of both homes; one JSON-LD block on each home, none on 404s; only `sitemap.xml` in `dist` | `npm run build && npm run check:site` prints `checked 4 pages`, `pending ownerReview entries: 0`; negative proofs exit 1 | `npm run build && npm run test:e2e` 27 passed (wrangler dev on 127.0.0.1:8787) |
| Rollback boundary | `NotFoundView`, 404 pages, `home.intro`/`notFound.*` keys, `jsonc.ts`, wrangler contract | `sitemap.xml.ts`, `robots.txt`, `jsonLd` prop; restore the integration | `site-check/`, `scripts/check-site.ts`, the `ci.yml` step, scripts | `tooling/site-browser/`, `_headers`, the CI job, docs lines |

### Deviations

1. **One branch, section sizes** (as group 1): each section exceeds 400 lines; commits stay split at work units.
2. **5.4 helper location**: `jsonc.ts` is in `apps/web/src/__testing__/` (not `contract/`) because `import-x/no-extraneous-dependencies` allows the root devDependency `typescript` only in test support.
3. **7.x module layout**: the rules are split by concern (`files`, `head`, `structure`, `assets`, `content`, `dom`, `types`) with one test file each, behind the `checks.ts` aggregator, instead of one `checks.ts` and five parts of `checks.test.ts`.
4. **7.2**: `node-html-parser` was pinned in group 1 (deviation 3 there); nothing to add. It pulls `css-select` and `entities` as design W8 says.
5. **ESLint and tsconfig for check:site**: an override lets `site-check` and `scripts` use web devDependencies; `apps/web/scripts` joins `tsconfig.test.json` (types `node`) so the CLI is linted and typechecked.
6. **TP18 literal**: the retired address is joined from parts in `site-check/content.ts` so the source-side scan in `site-config.contract.test.ts` stays valid and unchanged.
7. **8.4**: ESLint ignores `tooling/site-browser/**` only, not `tooling/**`, so the root helpers stay linted; root `tsconfig.json` gained an `exclude`.
8. **8.3**: `assetsProblems` takes the two base directories as a third argument.
9. **8.5**: the immutable-name check uses sample `_astro` paths in the unit test; the served header on a real hashed asset is asserted in `smoke.spec.ts`.
10. **8.14 deferred** to the orchestrator (group PR pushed later): CI wall time of `site-browser` is not measured here.
11. **Task 5.4 path note**: followed reality (root `wrangler.jsonc`) as the task already said.

### Issues and risks

- None blocking. Wrangler dev and the Playwright headless shell run in this sandbox; no fallback was needed. `WRANGLER_SEND_METRICS=false` is set in the CI job and in the Playwright `webServer`.
- Wrangler 4.152 prints an "AI agent" banner for the dev session; harmless.
- The CI `site-browser` job (cache key, `--with-deps`, artifact hand-over) is verified by contract tests only; its first real run is on the group PR.
- Carry-overs still open: 11.9 (bold fallback CLS calibration, RES-1) belongs to PR 11.

### Key learnings

1. Astro inlines all CSS into `<style>` tags and minifies colours (`#fff`), so `check:site` reads inline styles and compares six-digit upper-case hex.
2. node-html-parser drops comments from `toString()`: rules that must see raw text keep the source (`Page.html`).
3. v8 branch coverage counts every `?? ''`: one helper (`attr`) with a test for the missing case keeps 100 percent without defensive branches elsewhere.
4. `wrangler dev` with `wrangler.e2e.jsonc` reproduces the 404-page, `drop-trailing-slash` and `_headers` behaviour locally, so the Workers rows of the design are testable without deploying.
5. When a contract test pins an exact list that a slice legitimately extends (dependabot ecosystems), update the pin to the new exact list instead of loosening it.

## G2 correction round 1

Mode: strict TDD. All four review lenses passed; this round folds the minor findings. Same branch, nothing pushed.

### Finding to commit map

| Finding | Commit |
|---|---|
| REL-1 (duplicate charset, viewport, description, nav, main#main), REL-2 (focusable before skip link, mixed-case handler), REL-5 (array `@type`, duplicate sitemap `<loc>`, exact `light`, `srcset`) | `d75ee75` test(web): seed site-check duplicate and focus cases and close four false negatives |
| RD-6 (not-found paths) | `d4b1bb3` feat(web): name the not-found paths in the routing module |
| RD-1, RD-2, RD-3, RD-4, RD-5, RD-6 (site-check side) | `56873d1` refactor(web): inject the site settings into check:site and share its helpers |
| REL-6 | `c052813` test(web): cover the check:site default-directory message |
| REL-3, REL-4, R1-3, RD-7, RES-2 | `a2fad9a` test(web): assert the focused shell link, redirect status and 404 headers in e2e |
| RES-11 | `292bac6` ci: typecheck the site-browser tooling before the browser tests |
| RD-8 | `a77e251` build(repo): leave .lighthouseci out of .gitignore until PR 11 |

### Evidence

- RED observed: 10 failed for REL-5 (array types, duplicate loc, scheme, srcset); `notFoundPathOf` missing; the CI typecheck step and the `.lighthouseci` pin failed before the edits.
- REL-1/REL-2 were test gaps over correct code. Mutation spot checks (mutate, run, revert): `charsets`, `viewports`, `descriptions` and `main#main` counts and the `FIRST_FOCUSABLE` list each turn a test red; the second-unlabelled-nav case was added for the `count('nav')` mutation. Two mutants are equivalent and survive by design: `labels.length === 1` (implied by `count('nav') === 1`) and removing `toLowerCase` on attribute names (node-html-parser already lowercases attribute names, so the mixed-case test passes either way and stays as a regression guard).
- RD-1: new tests inject a different contact address and site name through `Site`; `Site` now has `config` (name, url, contactEmail).
- RD-5 and RD-4 were refactored with the existing suite as the net; the "reported once per build" test was added with the change, not before it. CSS rules are still evaluated per page (a page missing CSS is still caught) and identical findings collapse to one `(dist)` entry.
- Tests: 2106 (120 files), up from 2075; `npm run verify` exit 0; `site-check` stays 100/100/100/100; `npm run test:e2e` 28 passed (was 27: the 404 header case); `npm run typecheck --prefix tooling/site-browser` clean.
- Changed lines vs `edea9a8` (lockfiles excluded): 375 added, 97 removed.

### Follow-ups (not in this round)

RES-1 (apt on cache hit), R1-1, R1-2 (HSTS at the zone), R1-4, R1-5, RES-3, RES-6, RES-10 (owner actions already in design.md), RD-9.

### Notes

- `assetProblems` keeps `(pages, dist)` (it needs no site) and `fileSetProblems`/`pagesOf` keep their `(dist, routes)` shape; the three rule families that use the site all take `(pages, site, dist)`.
- `urlOf` in the routing module still reads the global `SITE.url`, so `Site.config.url` only feeds the Organization url check.
- Task 8.8 text in `tasks.md` still lists `.lighthouseci`; PR 11 adds it.

## G2 Judgment Day

Both blind judges (A and B, full sweep after a completion request) returned **APPROVED** on `b60556c..d72a40f`, with no CRITICAL or MAJOR finding, so there is no Judgment Day fix round. Verified by the orchestrator: JD-A-1 (`npx --prefix tooling/site-browser playwright`) resolves the pinned 1.64.1 locally; the first real CI run confirms it.

### Follow-ups for group 3 (do first, before the trust pages)

- **JD-1 (both judges, WARNING)**: `site-check/content.ts` owner-review markers match substrings (`draft`, `borrador`) over the whole HTML, so copy such as "drafting" or "borradores" would fail `check:site`. Match whole words (and scope to visible text plus frontmatter), with a benign-substring test. The same applies to the `\b(errors|calc)\.[a-z]` scan (`calc.example`).
- **JD-2 (B, WARNING)**: `scripts/check-site.ts` resolves a relative directory against the workspace cwd and echoes the typed argument; print the resolved path and test a relative argument.
- **JD-3 (A, WARNING)**: the e2e foreign-origin / no-script / CSP-violation test runs only on routable pages; also run it on the two 404 responses [SQ5, SQ14, SS19].
- **JD-4 (A)**: assert in `headers.contract.test.ts` that no `_headers` rule sets `X-Robots-Tag` [SE13].
- **JD-5 (A, B)**: export the `/es` locale-by-path helper from `routes.ts` and reuse it in `tooling/site-browser/e2e/urls.ts`; drop the unused `_locale` of `notFoundHead`.
- **JD-6 (A)**: check:site asserts the switch's `lang`, `hreflang` and visible text, or documents that the component test owns them [SR5]; [SR7] round trip asserts 200 per hop.
- **JD-7 (B)**: tests that pin the one-page table (`links.test.ts:47`, `BaseLayout.test.ts:105`) and `.lighthouseci` absence (`gates.contract.test.ts:527`) must be updated by PR 9 and PR 11.
- Minor: record why the CSP keeps `style-src 'unsafe-inline'`; record `Person` in the forbidden JSON-LD types in the spec; `networkidle` in `smoke.spec.ts`.

## G2 CI evidence (PR #83, run 40049239116)

`verify` 2m45s; `site-browser` 1m12s (first real run, green); all mutation shards passed (slowest `format` 6m52s). Merged as `main` `4027573` and verified live: `/` and `/es` 200; `/does-not-exist` and `/es/nada` 404; `/sitemap.xml` and `/robots.txt` 200; CSP and `nosniff` served; the only `<script>` is the ld+json block. Tasks 8.14 and SX8 satisfied; the G2 exit tasks 5.10, 6.8, 7.19 and 8.15 are ticked (four reviewers PASS, correction round 1, Judgment Day APPROVED).

Group 3 (PR 9 to PR 11 plus the G2 follow-ups JD-1..JD-7) runs on ONE branch, `feat/web-shell-g3-trust-pages-final`, created from `main` `4027573`. Nothing pushed, no PR opened, `gentle-ai` not run. Sections follow below.

## Group 3 (G2 follow-ups, PR 9 to PR 11)

Mode: strict TDD (`npm test`). Branch `feat/web-shell-g3-trust-pages-final` from `main` `4027573`. Exit tasks 9.10, 10.9, 11.11 and F.1/F.2 stay open on purpose (reviews and owner actions pending).

### G2 Judgment Day follow-ups

| ID | What changed | Commit |
|---|---|---|
| JD-1 | Owner-review markers match whole words (Unicode lookarounds) in visible text plus HTML comments; script and style bodies and attributes are ignored; benign text (`drafting`, `borradores`, `calc.example`) passes. The message-key scan needs two segments after `calc` (`calc.rectangle-area.title`), as the real keys have. `Page.root` is parsed with `comment: true` | `32ddc13` |
| JD-2 | `check:site` prints the resolved directory for a relative argument; test spawns with a relative argument and a scratch cwd | `fd951e0` |
| JD-4 | `headers.contract.test.ts` asserts no rule sets `X-Robots-Tag` (spot check: appending one fails it) | `9e2e280` |
| JD-3, JD-5 | `localeOfPath` exported from `routes.ts` and used by `tooling/site-browser/e2e` (`urls.ts`, `smoke.spec.ts`); unused locale parameter of `notFoundHead` dropped; the foreign-origin, no-script and CSP test now also runs on both 404 responses | `8dc4c8a` |
| JD-6 | `check:site` asserts the switch `href`, `lang`, `hreflang` and visible text (`site.switch.label`); the [SR7] round trip asserts 200 on each hop | `8703b10` |
| JD-7 | One-page pins updated as the pages arrived (routes, links, BaseLayout, sitemap, files, CLI, catalog tests), counts derived from `ROUTES` wherever possible | `9ff5827` |
| Minor | CSP `style-src 'unsafe-inline'` rationale recorded in `_headers`; `Person` added to the forbidden JSON-LD list of the site-seo spec. `networkidle` in `smoke.spec.ts` left as is (the fonts and the CSP report need the page to settle) | `3d27d9d` |

JD follow-ups: 302 changed lines (241+, 61-).

### PR 9 (content collection, methodology, about)

Commits: `5bcdad8` feat(web) content collection and schema · `9ff5827` feat(web) methodology and about pages with the update-date rule · `6f34a5c` test(web) keyboard focus walk. PR 9 boundary (code tip): `6f34a5c`. Changed lines vs the JD tip `3d27d9d`: 959 (918+, 41-); the four Markdown files are 100 lines, tests carry most of the rest (contract helper and tests, schema test, view test).
`npm run verify` exit 0, 2210 tests (123 files); `check:site` `checked 8 pages`, `pending ownerReview entries: 4`; `npm run test:e2e` 62 passed (axe on the 6 routable pages and the 2 not-found pages).

Deviations: (1) one commit carries the pages, their catalog keys and the `updated` rule (they cannot be separated and stay green: the rule needs the entries and the fixture dates). (2) The catch-all dispatches by `id === 'home'`; the `views` map did not type once the two views took different props. (3) The container test of `TrustPageView` needs the content store: `vitest.global-setup.ts` runs `astro sync` and copies `node_modules/.astro/data-store.json` to `.astro/`. (4) The e2e keyboard walk tabs past page content to each shell link (home and prose links now sit between header and footer).

### PR 10 (privacy, terms, contact; pinned end state)

Commits: `d8f26cf` feat(web) cookie, storage and third-party facts in check:site · `9fd870f` feat(web) privacy, terms and contact pages and the pinned end state. PR 10 boundary (code tip): `9fd870f`. Changed lines vs the PR 9 code tip `6f34a5c` (docs excluded): 481 (467+, 14-); the six Markdown files and the catalog keys are 198 of them.
`npm run verify` exit 0, 2272 tests (125 files); `check:site` `checked 14 pages`, `pending ownerReview entries: 10`; `fd -e html . apps/web/dist` 14 files; `hello@` absent from `dist`; `npm run test:e2e` 110 passed (12 routable paths without redirect, the language round trip with a 200 per hop, axe on the 12 routable and 2 not-found pages).

Deviations: (1) 10.4 lives in `BaseLayout.test.ts` and `links.test.ts` (see the task). (2) The third rule of 10.5 reports `third-party-origin` for text assets (`.css`, `.js`, `.mjs`, `.json`, `.map`); the older `third-party` rule still reports the same CSS `@import` against the page, so a stylesheet pointing off-origin is named twice (file and page), which is intended. (3) The ICW4 seed uses an id that is not in the table (`pricing`) once `contact` became real. (4) Copy states only today's facts: Cloudflare hosting with standard request logs, no cookies, no analytics, no advertising, no accounts, no forms, mail used only to reply; terms assert no governing law, entity or address; contact promises no response time. All ten entries are `ownerReview: pending`.
