import { describe, expect, it } from 'vitest';
import {
  CALCIUM_GUIDE,
  CLOSING_GUIDE,
  OPENING_GUIDE,
  PH_GUIDE,
  PUMP_RUN_GUIDE,
  SALT_VS_CHLORINE_GUIDE,
  SHOCK_GUIDE,
  type StepGuide,
} from './guide.ts';
import {
  CALCIUM_GUIDE_ES,
  CLOSING_GUIDE_ES,
  OPENING_GUIDE_ES,
  PH_GUIDE_ES,
  PUMP_RUN_GUIDE_ES,
  SALT_VS_CHLORINE_GUIDE_ES,
  SHOCK_GUIDE_ES,
} from './guide-es.ts';
import { GALLONS_GUIDE, OLYMPIC_GUIDE } from './gallons.ts';
import { GALLONS_GUIDE_ES, OLYMPIC_GUIDE_ES } from './gallons-es.ts';
import { hrefOf, routeOf } from './routes.ts';

const PAIRS: readonly (readonly [string, StepGuide, StepGuide])[] = [
  ['opening-guide', OPENING_GUIDE, OPENING_GUIDE_ES],
  ['closing-guide', CLOSING_GUIDE, CLOSING_GUIDE_ES],
  ['pump-guide', PUMP_RUN_GUIDE, PUMP_RUN_GUIDE_ES],
  ['salt-guide', SALT_VS_CHLORINE_GUIDE, SALT_VS_CHLORINE_GUIDE_ES],
  ['shock-guide', SHOCK_GUIDE, SHOCK_GUIDE_ES],
  ['ph-guide', PH_GUIDE, PH_GUIDE_ES],
  ['calcium-guide', CALCIUM_GUIDE, CALCIUM_GUIDE_ES],
  ['gallons-guide', GALLONS_GUIDE, GALLONS_GUIDE_ES],
  ['olympic-guide', OLYMPIC_GUIDE, OLYMPIC_GUIDE_ES],
];

/** The numbers of a text, a thousands comma read inside its number: "20,000" is 20000. */
const numbersOf = (text: string): string[] =>
  (text.replace(/(\d),(?=\d{3})/g, '$1').match(/\d+(?:\.\d+)?/g) ?? []).sort();

/** Every text of a guide a reader sees, but its sources. */
const proseOf = (guide: StepGuide): string =>
  [
    guide.lead,
    guide.note ?? '',
    ...guide.steps.flatMap(({ title, text, link }) => [title, text, link?.label ?? '']),
  ].join('\n');

describe('the Spanish step guides', () => {
  for (const [id, en, es] of PAIRS) {
    describe(id, () => {
      it('lives at the Spanish address of its route', () => {
        expect(routeOf(en.path)?.es).toBe(es.path);
        expect(routeOf(es.path)?.id).toBe(id);
      });

      it('has the steps, the sources and the source keys of the English guide', () => {
        expect(es.steps).toHaveLength(en.steps.length);
        expect(es.sources).toEqual(en.sources);
        expect(es.steps.map(({ sources }) => sources)).toEqual(
          en.steps.map(({ sources }) => sources),
        );
        expect(es.note === undefined).toBe(en.note === undefined);
      });

      // a link leads to the Spanish twin once it is built, and says so while it is English
      it('links what the English step links, in Spanish where it can', () => {
        en.steps.forEach(({ link }, index) => {
          const spanish = es.steps[index]?.link;
          if (link === undefined) {
            expect(spanish, String(index)).toBeUndefined();
            return;
          }
          const route = routeOf(link.href);
          expect(route, link.href).toBeDefined();
          const href = hrefOf(route?.id ?? '', 'es');
          expect(spanish?.href, String(index)).toBe(href);
          expect(spanish?.label.endsWith(' (en inglés)'), String(index)).toBe(href === route?.en);
        });
      });

      // the safety and dose copy says what the English says: the same figures, none left out
      it('states every figure of the English lead, note and steps', () => {
        expect(numbersOf(es.lead)).toEqual(numbersOf(en.lead));
        expect(numbersOf(es.note ?? '')).toEqual(numbersOf(en.note ?? ''));
        en.steps.forEach(({ text }, index) => {
          expect(numbersOf(es.steps[index]?.text ?? ''), String(index)).toEqual(numbersOf(text));
        });
      });

      it('is titled for search, its own title and description', () => {
        expect(es.title.endsWith(' | Pool Figures')).toBe(true);
        expect(es.title.length).toBeLessThanOrEqual(65);
        expect(es.description.length).toBeGreaterThanOrEqual(50);
        expect(es.description.length).toBeLessThanOrEqual(160);
        expect(es.title).not.toBe(en.title);
      });

      // neutral Spanish, the tú register, and the US label names (plans/pool/SPANISH.md)
      it('speaks in the tú register, in US units and US product names', () => {
        const text = proseOf(es);
        expect(text).not.toMatch(/\busted\b|\bingrese\b|\bsalfumán\b|\bdepuradora\b/i);
        expect(text).not.toMatch(/\b(litros?|kilos?) de agua\b/);
      });
    });
  }

  const stepsOf = (guide: StepGuide): string => guide.steps.map(({ text }) => text).join(' ');

  it('keeps the acid safety rules of the English pH guide', () => {
    const text = stepsOf(PH_GUIDE_ES);
    expect(text).toContain('agrega el ácido al agua, nunca el agua al ácido');
    expect(text).toContain('nunca lo mezcles con blanqueadores de cloro');
    expect(text).toContain('ácido muriático');
    expect(text).toContain('carbonato de sodio');
  });

  it('keeps the never-mix rules of the English shock guide', () => {
    const text = stepsOf(SHOCK_GUIDE_ES);
    expect(text).toContain('no lo mezcles con ningún otro químico');
    expect(text).toContain('no le agregues agua');
    expect(text).toContain('explosión');
    expect(text).toContain('hipoclorito de calcio (cal-hypo)');
  });

  it('keeps the calcium chloride handling of the English calcium guide', () => {
    const text = stepsOf(CALCIUM_GUIDE_ES);
    expect(text).toContain('agua fría');
    expect(text).toContain('con la bomba funcionando');
  });

  it('keeps the acid safety rule of the English salt guide', () => {
    expect(SALT_VS_CHLORINE_GUIDE_ES.steps.map(({ text }) => text).join(' ')).toContain(
      'ácido muriático',
    );
  });
});
