# Tasks: font-fallback-metrics

- [x] 1.1 [RED→GREEN] Contract test: one fallback face per variant, the local-font list, Capsize's overrides recomputed from the woff2 ([SS33]).
- [x] 1.2 [RED→GREEN] Browser test: late web fonts shift nothing at 320 px, with and without a state, on every calculator page.
- [x] 1.3 Fallback faces in `base.css`, `optimizedFallbacks: false`; `npm run verify` green; the 40 new browser cases pass locally.
