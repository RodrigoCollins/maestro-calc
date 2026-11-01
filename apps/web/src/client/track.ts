/*
 * Usage events for analytics (analytics-events): what a person did on a calculator page, never
 * the values. The loader in `public/analytics.js` creates `dataLayer` on the production host only,
 * so tests, previews and other hosts push nothing; Tag Manager forwards each event to GA4.
 */

/** What a person did: changed an input, copied the link, opened the share link, printed. */
export type CalcAction = 'calculate' | 'copy' | 'share' | 'print';

/**
 * A function that records one action of the calculator `id` in `scope.dataLayer` (the page's
 * `window`), when it exists.
 * `calculate` is recorded once per page load: the first edit is the signal, the rest is typing.
 */
export const trackerOf = (scope: object, id: string): ((action: CalcAction) => void) => {
  let calculated = false;
  return (action) => {
    const layer = 'dataLayer' in scope ? scope.dataLayer : undefined;
    if (!Array.isArray(layer)) return;
    if (action === 'calculate') {
      if (calculated) return;
      calculated = true;
    }
    layer.push({ event: 'calc_action', calc_action: action, calc_id: id });
  };
};
