import { describe, expect, it } from 'vitest';
import { trackerOf } from './track.ts';

// spec: analytics-events › [AE1] one event per action, never a value
describe('trackerOf', () => {
  it('pushes the action and the calculator id, nothing else', () => {
    const layer: unknown[] = [];
    const track = trackerOf({ dataLayer: layer }, 'concrete');
    track('copy');
    track('print');
    expect(layer).toEqual([
      { event: 'calc_action', calc_action: 'copy', calc_id: 'concrete' },
      { event: 'calc_action', calc_action: 'print', calc_id: 'concrete' },
    ]);
  });

  it('sends calculate once per page load, however many edits follow', () => {
    const layer: unknown[] = [];
    const track = trackerOf({ dataLayer: layer }, 'gravel');
    track('calculate');
    track('calculate');
    track('share');
    track('calculate');
    expect(layer).toEqual([
      { event: 'calc_action', calc_action: 'calculate', calc_id: 'gravel' },
      { event: 'calc_action', calc_action: 'share', calc_id: 'gravel' },
    ]);
  });

  it('does nothing where no analytics loader made a data layer (tests, previews, other hosts)', () => {
    const scope: { dataLayer?: unknown } = {};
    expect(() => {
      trackerOf(scope, 'paint')('copy');
    }).not.toThrow();
    expect(scope).toEqual({});
    const notArray = { dataLayer: 'x' };
    trackerOf(notArray, 'paint')('copy');
    expect(notArray).toEqual({ dataLayer: 'x' });
  });
});
