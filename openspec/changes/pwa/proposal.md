# Proposal: pwa

## Intent

PLAN §4.2 lists "PWA: installable and offline" as MVP ("offline en la obra"), and the competitive audit found no competitor with a real one. A contractor checks a calculator at home and opens it again in a basement or on a rural lot without signal.

## Decisions

1. **One manifest per language** (`/manifest.webmanifest`, `/es/manifest.webmanifest`): `start_url` and `id` are that language's home, `lang` its tag, the description the site tagline; scope `/`, `standalone`, Blueprint ink as theme and plan paper as background. Every page links its language's manifest, an apple-touch icon and `theme-color` (about 150 B of HTML).
2. **Icons drawn from `favicon.svg`** with `rsvg-convert`: 192 and 512 as they are, a maskable 512 and a 180 apple-touch icon with the mark at 62 % on full-bleed ink (inside the maskable safe zone).
3. **The worker is registered by the calculator pages only**, at the end of `mount`: the home and trust pages keep zero JavaScript. Cost: 589 B on every calculator bundle (concrete 47,020 of 49,152 B).
4. **Strategy.** Pages: network first, kept under their path (every query of a calculator shares one copy), the kept copy when the network fails, a network error for a page never kept. `/_astro/` files: cache first (hashed names never change). Other origins, other methods and other files pass untouched (analytics stays online-only). One versioned cache, `maestro-v1`; activation drops older ones and claims open pages.
5. **The page hands the worker what to keep** once it runs: itself and its own `/_astro/` files (Resource Timing), posted to the active worker, which fetches and keeps the same-origin ones. They were fetched before the worker existed, so without this a calculator used once would not open offline. The worker fetches them, not the page, so the page still makes no fetch or XHR request ([SS21]) and the client hygiene ban on `caches.` (design C13) holds without exception (a first version filled the cache from the page and failed [SS21] in the browser suite).
6. **Exceptions, each named and tested:** `sw.js` is the second root script after `analytics.js` (`check:site`), lint-ignored like it and run by its unit test in a VM; `_headers` serves it `no-cache` so an update reaches the phone on its next visit.
7. **The browser suites block service workers** (`serviceWorkers: 'block'`): `page.route` does not see requests a worker answers, so the font and script swaps of the layout and drawing suites would get cached files. `offline.spec.ts` allows them.

## Slices

One PR.
