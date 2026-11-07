import { describe, expect, it } from 'vitest';
import { trackerOf, viaDataLayer, viaGtag, watchUsage } from './track.ts';

// spec: analytics-events › [AE1] one event per action, never a value
describe('trackerOf', () => {
  it('sends the action and the calculator id, nothing else', () => {
    const sent: unknown[] = [];
    const track = trackerOf((params) => sent.push(params), 'concrete');
    track('copy');
    track('print');
    expect(sent).toEqual([
      { calc_action: 'copy', calc_id: 'concrete' },
      { calc_action: 'print', calc_id: 'concrete' },
    ]);
  });

  it('sends calculate once per page load, however many edits follow', () => {
    const sent: unknown[] = [];
    const track = trackerOf((params) => sent.push(params), 'gravel');
    track('calculate');
    track('calculate');
    track('share');
    track('calculate');
    expect(sent).toEqual([
      { calc_action: 'calculate', calc_id: 'gravel' },
      { calc_action: 'share', calc_id: 'gravel' },
    ]);
  });
});

// Maestro Calc: Tag Manager reads plain objects from the data layer
describe('viaDataLayer', () => {
  it('pushes a calc_action event to the data layer', () => {
    const layer: unknown[] = [];
    viaDataLayer({ dataLayer: layer })({ calc_action: 'copy', calc_id: 'paint' });
    expect(layer).toEqual([{ event: 'calc_action', calc_action: 'copy', calc_id: 'paint' }]);
  });

  it('does nothing where no analytics loader made a data layer (tests, previews, other hosts)', () => {
    const scope: { dataLayer?: unknown } = {};
    viaDataLayer(scope)({ calc_action: 'copy', calc_id: 'paint' });
    expect(scope).toEqual({});
    const notArray = { dataLayer: 'x' };
    viaDataLayer(notArray)({ calc_action: 'copy', calc_id: 'paint' });
    expect(notArray).toEqual({ dataLayer: 'x' });
  });
});

// Cuenta Horas and Pool Figures: gtag.js reads only gtag() calls, so a plain object would be lost
describe('viaGtag', () => {
  it('calls gtag with a calc_action event and its two parameters', () => {
    const calls: unknown[][] = [];
    const scope = { gtag: (...args: unknown[]) => calls.push(args) };
    viaGtag(scope)({ calc_action: 'share', calc_id: 'overtime' });
    expect(calls).toEqual([
      ['event', 'calc_action', { calc_action: 'share', calc_id: 'overtime' }],
    ]);
  });

  it('does nothing where the loader defined no gtag (tests, previews, other hosts)', () => {
    expect(() => {
      viaGtag({})({ calc_action: 'share', calc_id: 'overtime' });
      viaGtag({ gtag: 'x' })({ calc_action: 'share', calc_id: 'overtime' });
    }).not.toThrow();
  });
});

/** A form or a document: the listeners added to it, by event type, to fire by hand. */
const listenable = () => {
  const listeners = new Map<string, ((event: { target: unknown }) => void)[]>();
  return {
    addEventListener: (type: string, listener: (event: { target: unknown }) => void) => {
      listeners.set(type, [...(listeners.get(type) ?? []), listener]);
    },
    fire: (type: string, target: unknown = null) => {
      for (const listener of listeners.get(type) ?? []) listener({ target });
    },
  };
};

/** An element inside the elements that `matches` names. */
const inside = (...matches: string[]) => ({
  closest: (selector: string) => (matches.includes(selector) ? {} : null),
});

describe('watchUsage', () => {
  it('sends calculate on the first edit of the form only', () => {
    const calls: unknown[][] = [];
    const form = listenable();
    watchUsage({ gtag: (...args: unknown[]) => calls.push(args) }, 'pool-ph', form, listenable());
    form.fire('input');
    form.fire('input');
    expect(calls).toEqual([
      ['event', 'calc_action', { calc_action: 'calculate', calc_id: 'pool-ph' }],
    ]);
  });

  it('sends the action of each click inside the element its selector names, and no other click', () => {
    const calls: unknown[][] = [];
    const page = listenable();
    watchUsage(
      { gtag: (...args: unknown[]) => calls.push(args) },
      'time-card',
      listenable(),
      page,
      { share: 'a[data-whatsapp]', print: '[data-print]' },
    );
    page.fire('click', inside('a[data-whatsapp]'));
    page.fire('click', inside('[data-print]'));
    page.fire('click', inside('a[data-share]'));
    page.fire('click', null);
    page.fire('click', 'text');
    expect(calls).toEqual([
      ['event', 'calc_action', { calc_action: 'share', calc_id: 'time-card' }],
      ['event', 'calc_action', { calc_action: 'print', calc_id: 'time-card' }],
    ]);
  });

  it('adds no click listener when no click is watched', () => {
    const page = { addEventListener: () => expect.unreachable('a click listener') };
    watchUsage({}, 'pool-ph', listenable(), page);
  });
});
