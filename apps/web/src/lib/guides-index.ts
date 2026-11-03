import { GUIDE_IDS, type GuideId } from '../routing/guides.ts';
import { HUB_IDS, HUBS, type HubId } from '../routing/hubs.ts';

/** One section of the guides index: a trade hub and its guides, or `null` for the guides no hub lists. */
export interface GuideGroup {
  readonly hub: HubId | null;
  readonly guides: readonly GuideId[];
}

const hubGuides = new Set<string>(HUB_IDS.flatMap((hub) => HUBS[hub].guides));

/** The guides by trade, in hub order, then the guides of no trade in table order. */
export const guideGroups = (): GuideGroup[] => {
  const rest = GUIDE_IDS.filter((id) => !hubGuides.has(id));
  return [
    ...HUB_IDS.map((hub) => ({ hub, guides: HUBS[hub].guides })),
    ...(rest.length > 0 ? [{ hub: null, guides: rest }] : []),
  ];
};
