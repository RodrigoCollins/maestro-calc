import { describe, expect, it } from 'vitest';
import {
  FENCE_MATERIALS,
  FENCE_PRICES,
  fenceCostOf,
  fenceMaterialsOf,
  perFootRange,
  perFootRangeOf,
} from './fence-cost.ts';

/*
 * Hand-verified against the two cost guides, read 2026-11-10: This Old House (updated 2026-06-08)
 * gives wood $15–$35, vinyl $15–$40 and chain link $13–$27 a linear foot installed, and metal (no
 * aluminum row) $15–$75; Bob Vila (updated 2024-04-17) gives wood $17–$45, vinyl $10–$40, chain link
 * $15–$30 and aluminum $17–$90. The lowest and the highest of both, per material: wood $15–$45,
 * vinyl $10–$40, chain link $13–$30, aluminum $17–$90; of every material, $10–$90.
 */
describe('fence prices (fence cost page)', () => {
  it('holds the two guides, each dated and linked', () => {
    expect(FENCE_PRICES.map(({ source }) => [source.url, source.retrieved])).toEqual([
      ['https://www.thisoldhouse.com/lawns/fencing-options', '2026-11-10'],
      ['https://www.bobvila.com/articles/fence-installation-cost/', '2026-11-10'],
    ]);
    expect(FENCE_MATERIALS).toEqual(['wood', 'vinyl', 'chain-link', 'aluminum']);
  });

  it('gives each material the lowest and the highest price of the guides that list it', () => {
    expect(FENCE_MATERIALS.map((material) => perFootRangeOf(material))).toEqual([
      '$15–$45',
      '$10–$40',
      '$13–$30',
      '$17–$90',
    ]);
    expect(perFootRange()).toEqual(['$10', '$90']);
  });

  // 50 ft of wood: 50 × $15 = $750 to 50 × $45 = $2,250; 200 ft of aluminum: $3,400 to $18,000
  it('prices each length by the foot, per material', () => {
    expect(fenceCostOf(50)).toEqual(['$750–$2,250', '$500–$2,000', '$650–$1,500', '$850–$4,500']);
    expect(fenceCostOf(100)).toEqual([
      '$1,500–$4,500',
      '$1,000–$4,000',
      '$1,300–$3,000',
      '$1,700–$9,000',
    ]);
    expect(fenceCostOf(200)).toEqual([
      '$3,000–$9,000',
      '$2,000–$8,000',
      '$2,600–$6,000',
      '$3,400–$18,000',
    ]);
  });

  // the engine at its defaults, a 6 ft privacy fence with posts every 8 ft (calc-fence › [FN8])
  it('works out the materials of each length with the fence engine', () => {
    expect(fenceMaterialsOf({ length: '50ft' })).toEqual({
      posts: '8',
      rails: '21',
      boards: '127',
      bags: '21',
    });
    expect(fenceMaterialsOf({ length: '200ft' })).toEqual({
      posts: '26',
      rails: '75',
      boards: '506',
      bags: '68',
    });
  });
});
