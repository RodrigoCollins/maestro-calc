# Proposal: embed

## Intent

PLAN §4.2 and §7.6: a calculator other sites can embed, with a brand link — the link channel of the plan and the resource for associations (NAHICA, Latin Builders). It is the last MVP function.

## Decisions

1. **One embed page per calculator page and language**, at `/embed` + the page's path (`/embed/concrete-calculator`, `/embed/es/calculadora-de-concreto`), generated from `CALCULATOR_PAGES` and `ROUTES`: a new calculator gets its embed with no edit.
2. **What it shows:** a slim header (the wordmark, opening the full page in a new tab, and the language switch to the other language's embed), the calculator body exactly as on the full page (form, result, drawing, answer, copy and WhatsApp), and the sources. No breadcrumb, no article, no footer navigation, no analytics (nothing tracks the visitors of another site).
3. **Not a second copy for search:** `noindex`, the canonical is the full page, no `hreflang`, not in the sitemap, no JSON-LD.
4. **Links lead to the real page.** The copy and WhatsApp links are built from the canonical path when the page has one (on every routed page it equals the path, so nothing changes there): a link shared from an embed opens the full page.
5. **Framing only there.** `_headers` detaches the site CSP on `/embed/*` (`! Content-Security-Policy`) and sets the same policy with `frame-ancestors *`; every other path keeps `frame-ancestors 'none'`. A browser spec proves both from another origin.
6. **The snippet** (slice 2): an `<iframe>` with a title, `loading="lazy"` and a fixed height, followed by a visible text link "Concrete calculator by Maestro Calc" to the full page — the brand link of §7.6, outside the frame. A page lists the snippets of every calculator in both languages.
7. **`check:site`** knows the embed pages as their own kind: they join the expected file set, skip the routed-page rules, and pass embed rules (canonical, `noindex`, one H1, the full page's single module script, no analytics, the calculator HTML budget).
8. **Browser proof.** `embed.spec.ts` frames the embed from an https origin served by `page.route` with Chrome's Local Network Access check off for that file only (it blocks a public page from framing the local `wrangler dev`; a real site framing maestrocalc.com is public to public).

## Slices

1. Embed pages, headers, mount canonical path, `check:site` rules, browser spec.
2. The embed page with the snippets (route, catalogs, footer link).
