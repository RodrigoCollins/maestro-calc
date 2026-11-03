import { describe, expect, it } from 'vitest';
import { GUIDES } from '../routing/guides.ts';
import { HUB_IDS, HUBS } from '../routing/hubs.ts';
import { guideGroups } from './guides-index.ts';

describe('guideGroups (the guides index)', () => {
  it('lists every guide exactly once', () => {
    const listed = guideGroups().flatMap(({ guides }) => guides);
    expect([...listed].sort()).toEqual(Object.keys(GUIDES).sort());
  });

  it('groups the guides by trade in hub order, each in the order its hub lists it', () => {
    const groups = guideGroups().filter(({ hub }) => hub !== null);
    expect(groups.map(({ hub }) => hub)).toEqual(HUB_IDS);
    for (const { hub, guides } of groups)
      if (hub !== null) expect(guides).toEqual(HUBS[hub].guides);
  });

  it('closes with the guides no hub lists, in table order', () => {
    const last = guideGroups().at(-1);
    expect(last?.hub).toBeNull();
    expect(last?.guides).toEqual(['guide-contractor-license']);
  });
});
