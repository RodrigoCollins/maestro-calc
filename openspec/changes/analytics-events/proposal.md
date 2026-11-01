# Proposal: analytics-events

## Intent

PLAN §11.1 makes "useful calculations per week" the main metric: sessions that calculate and then copy, share, print or come back. GA4 only counts page views today, so the metric cannot be measured. Send one event per action from the calculator pages, never a value.

## Decisions

1. **One event shape**: `{ event: 'calc_action', calc_action, calc_id }` pushed to `dataLayer`, with `calc_action` one of `calculate`, `copy`, `share`, `print` and `calc_id` the calculator's id. No typed value, no URL, no query ever enters it.
2. **`calculate` once per page load**, on the first edit (a typed value or a pressed button of the form); later edits are typing, not new calculations.
3. **Only where the loader runs.** `public/analytics.js` creates `dataLayer` on the production host only; `trackerOf` pushes nothing when `dataLayer` is not an array, so tests, previews and other hosts send nothing, and the calculator script still makes no request of its own ([TP12]).
4. **Wiring in the mount**: the input and form-click handlers record `calculate`, the copy and print handlers their action, and one delegated click listener on the copy area records `share` (the share link itself is unchanged).
5. **Privacy page** (owner approval delegated on 2026-11-01): one sentence per language says that on a calculator page Google Analytics also receives the action and the calculator's name, never the values.
6. **Tag Manager**: the container `GTM-MD8H6L5S` needs a Custom Event trigger on `calc_action` and a GA4 event tag that forwards `calc_action` and `calc_id`. That is an account step, done in the browser after this merges; until then the events sit in `dataLayer` unused.
