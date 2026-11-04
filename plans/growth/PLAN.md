# Plan — Traffic for every site (Maestro Calc, Cuenta Horas, Pool Figures, and the next ones)

Written 2026-11-04. Owner: push traffic now on all three sites, with one system that a new site
plugs into the same way.

## 1. The rule

A site is not live until it meets the **growth contract** below. The contract is the same for every
site and is checked by tests (section 4), so the fourth site starts where the third one ended, not
with less. Site-specific work (content, keywords) sits on top of it.

## 2. The growth contract (every site)

| # | Piece | Maestro Calc | Cuenta Horas | Pool Figures |
|---|---|---|---|---|
| G1 | Indexable, canonical on every page, 404 `noindex` | done | done | done |
| G2 | `sitemap.xml` from the pages themselves, `robots.txt` points to it | done | done | done |
| G3 | IndexNow ping of every URL after each deploy (Bing, Yandex) | done | done | done |
| G4 | Search Console domain property + sitemap submitted | done | done | done |
| G5 | Bing Webmaster Tools + sitemap submitted | done | done | done |
| G6 | GA4 property, page views + calculator events | done | done | done |
| G7 | Link preview: `og:title`, `og:description`, one `og.png` | done | done | done |
| G8 | JSON-LD (WebSite, WebApplication per calculator, Article per guide) | done | done | done |
| G9 | Methodology page with sources and hand-verified cases | done | done | done |
| G10 | Byte budgets and browser suites | done | done | done |

"owner" = an account action (Google, Bing, Cloudflare DNS) that Rodrigo does or approves.

## 3. Traffic levers, in order of impact for new domains

1. **Long-tail pages from the engines.** One page per common job ("how many bags of concrete for
   a 10 x 10 slab", "how much salt for 15,000 gallons"), its table worked out by the calculator at
   build time, never filler text. Low competition, exact intent, and it scales with the engine:
   a new site gets them by listing its common inputs. Guard: each page must carry a figure the
   engine computes and a link to the calculator; no page without a real search behind it.
2. **Links from other sites.** The embed page (Maestro Calc has it) for trade blogs; tool and
   calculator directories; answers in forums (Reddit, trade forums) posted by the owner from his
   accounts, drafted by Claude. Never automated posting.
3. **Pinterest and YouTube Shorts** per site, scheduled, not bursts (the publishing session and its
   brief already run this for Maestro Calc; extend to the other two).
4. **On-page tuning from real queries.** Every two weeks, read Search Console queries per page and
   adjust titles and the first paragraph to the searches that already show the page. Before data
   exists this is guessing, so it starts week 3.
5. **Seasonal timing.** Index a seasonal site months before its season (Pool Figures opened in
   November for May to August; taxes for Cuenta Horas in January).

## 4. How it scales

- `packages/site-kit` holds what every site shares: today the byte budgets and the site check;
  next the sitemap and canonical helpers, the IndexNow ping and the JSON-LD builders, each moved
  there when a second site uses it (the extract-on-second-use rule).
- A **growth contract test** lists every `apps/*` site and fails when one lacks G1, G2, G3, G7 or
  G8, so a new site cannot ship without them. G4 to G6 are account actions and live in the
  launch checklist artifact instead.
- One traffic dashboard with a section per site (the weekly refresh adds each new site).
- A new site's launch = the contract green + its account actions + its long-tail list.

## 5. Order of work (from 2026-11-04)

1. Pool Figures open to search engines (#220) and its account actions (G4 to G6).
2. G3 for Cuenta Horas and Pool Figures through `site-kit`, wired in the deploy workflow.
3. G7 and G8 for Pool Figures, then the growth contract test over `apps/*`.
4. Long-tail pages: Maestro Calc concrete first (the most searched engine), then pool salt and
   volume, then Cuenta Horas.
5. Distribution: Pinterest and Shorts briefs for Cuenta Horas and Pool Figures; link outreach list.
6. Week 3 on: query-driven tuning every two weeks; dashboard with all three sites.

## 6. Open engineering items

- [x] **Tree-shakable kind readers in `packages/core`** (from the archived
      `openspec/changes/archive/2026-11-04-core-clock-time`). Mandatory before any new Maestro Calc
      calculator or slot: the input kinds are dispatched by `switch` in `calculator/validate.ts`,
      `url/codec.ts` and `url/url-values.ts`, so every page script carries every kind's reader. Since
      the `clock` kind (c59cadb) the concrete page script was 48,653 B against the 49,152 B limit (499 B
      left). Make each definition carry only the readers of its own kinds, as its own change, and
      measure the concrete page before and after.
      Done in `feat/core-tree-shakable-kinds`: each input is built by its kind's builder
      (`lengthInput`, `countInput`, ... in `packages/core/src/calculator/kinds/`), which attaches
      that kind's codec; the concrete page script went from 48,955 B to 48,023 B.
