# Proposal: pwa

## Intent

PLAN §4.2 lists "PWA: installable and offline" as MVP ("offline en la obra"), and the competitive audit found no competitor with a real one. A contractor checks a calculator at home and opens it again in a basement or on a rural lot without signal.

## Decisions

1. **One manifest per language** (`/manifest.webmanifest`, `/es/manifest.webmanifest`): `start_url` and `id` are that language's home, `lang` its tag, the description the site tagline; scope `/`, `standalone`, Blueprint ink as theme and plan paper as background. Every page links its language's manifest, an apple-touch icon and `theme-color` (about 150 B of HTML).
2. **Icons drawn from `favicon.svg`** with `rsvg-convert`: 192 and 512 as they are, a maskable 512 and a 180 apple-touch icon with the mark at 62 % on full-bleed ink (inside the maskable safe zone).
3. **The worker is registered by the calculator pages only**, at the end of `mount`: the home and trust pages keep zero JavaScript. Cost: 589 B on every calculator bundle (concrete 47,020 of 49,152 B).
4. **Strategy.** Pages: network first, kept under their path (every query of a calculator shares one copy), the kept copy when the network fails, a network error for a page never kept. `/_astro/` files: cache first (hashed names never change). Other origins, other methods and other files pass untouched (analytics stays online-only). One versioned cache, `maestro-v1`; activation drops older ones and claims open pages.
5. **The page fills the cache on registration** with itself and its own `/_astro/` files (Resource Timing): they were fetched before the worker existed, so without this a calculator used once would not open offline.
6. **Exceptions, each named and tested:** `offline.ts` is the one client module that may use `caches.` (client hygiene, design C13); `sw.js` is the second root script after `analytics.js` (`check:site`), lint-ignored like it and run by its unit test in a VM; `_headers` serves it `no-cache` so an update reaches the phone on its next visit.

## Slices

One PR.
