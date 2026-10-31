# site-pwa

## ADDED Requirements

### Requirement: Manifest

Each language MUST serve a web app manifest (`/manifest.webmanifest`, `/es/manifest.webmanifest`, `application/manifest+json`) naming the app, starting at that language's home, with scope `/`, display `standalone`, theme `#0E2240`, background `#EEF1EF` and PNG icons of 192 and 512 px plus a maskable 512 px icon, each of the size it declares. Every page MUST link its language's manifest, `/apple-touch-icon.png` (180 px) and `theme-color`.

#### Scenario: [PWA1] Manifest per language
- GIVEN `/es`
- THEN its head links `/es/manifest.webmanifest`, which answers 200 as a manifest whose `start_url` is `/es`

### Requirement: Offline

A calculator page MUST register `/sw.js` after it mounts and put itself and its own `/_astro/` files in the `maestro-v1` cache. The worker MUST serve pages network first, keeping each successful page under its path and serving the kept copy (whatever the query) when the network fails; serve `/_astro/` files cache first; and leave other origins, other methods and other files untouched. The home and trust pages MUST load no script and register no worker.

#### Scenario: [PWA2] A used calculator opens offline
- GIVEN `/concrete-calculator` loaded once with the network on
- WHEN the network is off and `/concrete-calculator?v=1&l=240` is opened
- THEN the page shows, its script runs, and the length field shows `20 ft`

#### Scenario: [PWA3] Static pages stay script-free
- GIVEN `/`, `/es` and `/about`
- THEN none registers a service worker
