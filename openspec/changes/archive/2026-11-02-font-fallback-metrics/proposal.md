# Proposal: font-fallback-metrics

## Intent

Root-cause the intermittent CI failure of `layout.spec.ts` "shifts the layout by at most 0.01 on load … with a state in the link" (CLS 0.031 at 320 px, first width, cold cache) and fix it where it also hurts readers.

## Findings

- Astro's optimized fallback stands on `local("Arial")` only. Linux (the CI runner) and Android have no Arial, so the adjusted face never loads and the text falls back to an unadjusted sans-serif (Liberation Sans on CI; Roboto on Android). When the web font arrives after the first paint, the form and the answer move: 0.0318 on `/es/calculadora-de-pendiente-de-techo`, 0.0352 on `/drywall-calculator`, reproduced on macOS by removing Arial from the faces and delaying the woff2 by 600 ms. With Arial, 0.
- Astro also caches the metrics by family, so the second variant of each family (Barlow 600, Barlow Condensed 700) got the first variant's numbers (74.17 % instead of 76.04 % at 700).
- It was intermittent because it depends on whether the fonts arrive before the first paint; later widths of the test have the fonts cached.

## Decisions

1. **Own fallback faces.** `optimizedFallbacks: false`; each family falls back to `<name> Fallback`, declared at the top of `base.css` (no fourth global sheet, [SS30]): one face per variant, `src` Arial, ArialMT, Liberation Sans, LiberationSans, Arimo, Arimo-Regular, Roboto, Roboto-Regular (Bold names at 700), with Capsize's overrides computed per variant against Arial (Roboto is within 0.3 % of Arial's width). The contract test recomputes them from the woff2 files with `@capsizecss/unpack` (pinned dev dependency, the version Astro uses).
2. **A deterministic browser test.** Each calculator page, with and without a state, at 320 px, with every woff2 delayed 600 ms, must shift by 0.01 or less: on Linux CI it fails every run without the fix, not one in many.
3. The 0.01 threshold is unchanged.
4. **The reserve ladders stay; the Linux tolerance is stated.** The first CI run failed "less than one line unused" on every page: the ladders were measured on macOS, and Linux CI only matched them because its unadjusted fallback was as wide as macOS. A sweep on Linux CI (temporary branch, 320 to 1280 px in 1 px steps, both locales, web font and fallback) shows Linux Chromium setting the same text 2 to 4 percent narrower: every line is lost 9 to 39 px earlier than on macOS, and the concrete answer fits one line from 1013 px. Re-measuring the ladders on Linux would let the text overflow its reserve on macOS and iOS and move the page, so the widest platform keeps setting them and the unused check allows under two lines on Linux ([CP60], [CP61] amended). The fit check is unchanged.
5. **The drawing test's font lookup** excluded fallback faces by the lowercase `fallback` of Astro's names; it now matches any case, since the families are `<name> Fallback`.

Validated on macOS with Liberation Sans installed and Arial removed from the faces: 0.0318 → 0.0000 and 0.0352 → 0.0000.
