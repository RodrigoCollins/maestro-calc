# Tasks: trade-hubs

- [x] 1.1 [RED→GREEN] `HUBS`, `hubOf` with tests (routed calculators, published guides, one hub per calculator, guides in their calculator's hub); routes pinned; `TRUST_IDS`; counts (28 ids, 56 URLs).
- [x] 1.2 Hub pages EN/ES; `HubDirectory.astro` from the home cards and the guide headings; `site.hub.*` keys; `npm run verify` green (58 pages).
- [x] 2.1 The home links every hub after the cards, in a labelled section (`HUB_IDS`, `page.home.hubs` "By trade" / "Por oficio"; the name is the hub's page title without the site name) ([HB2]).
- [x] 2.2 Each calculator page links its hub after the copy (`hubOfCalculator`, `site.hub.more` "More tools:" / "Más herramientas:"); paint, with no hub, shows nothing ([HB3]).
- [x] 2.3 [RED→GREEN] `check:site` rule `hub-link` (site-check/hubs.ts): each hub lists its calculators and each of them links back, per language; a link with no href counts as missing, a missing page is left to the file set; `Site.hubs`, fixture directory and line, CLI and its test.
- [ ] 2.4 Paint hub once paint has a guide (one calculator and no guide would be a thin page).
