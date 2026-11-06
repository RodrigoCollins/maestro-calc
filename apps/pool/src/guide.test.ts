import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { figure } from './__testing__/figure.ts';
import { CHEMISTRY_CHART } from './chemistry.ts';
import { DOSING_CHART } from './dosing.ts';
import { VOLUME_CHART } from './volume/chart.ts';
import { ALKALINITY, CALCIUM, CHLORINE, FILL_TIME, HEATER, PH, PUMP, SALT } from './doses.ts';
import {
  CALCIUM_GUIDE,
  CLOSING_GUIDE,
  GUIDES,
  guidesOf,
  OPENING_GUIDE,
  PH_GUIDE,
  PUMP_RUN_GUIDE,
  SALT_VS_CHLORINE_GUIDE,
  SHOCK_GUIDE,
  type GuideSource,
} from './guide.ts';
import { HOME_TOOLS } from './home.ts';
import { SWIM_GUIDE } from './swim.ts';
import { VOLUME_TEXTS } from './volume/texts.ts';

const pages = readdirSync(fileURLToPath(new URL('pages/', import.meta.url)))
  .filter((name) => name.endsWith('.astro'))
  .map((name) => `/${name.replace(/\.astro$/, '').replace(/^index$/, '')}`);
const layout = readFileSync(
  fileURLToPath(new URL('components/Layout.astro', import.meta.url)),
  'utf8',
);
const footer = /<footer[\s\S]*<\/footer>/.exec(layout)?.[0] ?? '';

const textOf = (
  guide:
    | typeof OPENING_GUIDE
    | typeof CLOSING_GUIDE
    | typeof PUMP_RUN_GUIDE
    | typeof SALT_VS_CHLORINE_GUIDE
    | typeof SHOCK_GUIDE
    | typeof PH_GUIDE
    | typeof CALCIUM_GUIDE,
): string => guide.steps.map(({ text }) => text).join(' ');

describe.each([
  ['spring opening', OPENING_GUIDE],
  ['winter closing', CLOSING_GUIDE],
  ['pump run time', PUMP_RUN_GUIDE],
  ['salt water vs chlorine', SALT_VS_CHLORINE_GUIDE],
  ['pool shock', SHOCK_GUIDE],
  ['pool pH', PH_GUIDE],
  ['calcium hardness', CALCIUM_GUIDE],
] as const)('the %s guide', (_name, guide) => {
  it('lives at its own page, with a description search engines can show whole', () => {
    expect(pages).toContain(guide.path);
    expect(guide.description.length).toBeGreaterThan(50);
    expect(guide.description.length).toBeLessThanOrEqual(160);
  });

  it('numbers its steps from one, each with a title and a text', () => {
    expect(guide.steps.length).toBeGreaterThan(4);
    for (const { title, text } of guide.steps) {
      expect(title.length).toBeGreaterThan(0);
      expect(text.length).toBeGreaterThan(0);
    }
  });

  it('sends each dose to a calculator page that exists', () => {
    const links = guide.steps.flatMap(({ link }) => (link === undefined ? [] : [link.href]));
    expect(links.length).toBeGreaterThan(0);
    for (const href of links) expect(pages, href).toContain(href);
  });

  it('cites every source it names on https, and names every source it cites', () => {
    const cited = new Set(guide.steps.flatMap(({ sources }) => sources ?? []));
    expect([...cited].sort()).toEqual(Object.keys(guide.sources).sort());
    for (const { url } of Object.values<GuideSource>(guide.sources))
      expect(url.startsWith('https://')).toBe(true);
  });
});

describe('the guide figures', () => {
  // the figures come from the sources as published; a changed one must be checked against them again
  it('gives the opening water targets exactly as CDC and Hayward publish them', () => {
    const text = textOf(OPENING_GUIDE);
    expect(text).toContain('at least 1 ppm');
    expect(text).toContain('at least 2 ppm');
    expect(text).toContain('pH 7.0 to 7.8');
    expect(text).toContain('7.2 to 7.8');
    expect(text).toContain('1 to 3 ppm');
  });

  it('gives the closing figures exactly as Hayward’s closing guide publishes them', () => {
    const text = textOf(CLOSING_GUIDE);
    expect(text).toContain('pH to 7.2 to 7.8');
    expect(text).toContain('24 to 48 hours');
    expect(text).toContain('below the skimmer');
    expect(text).toContain('in half');
    expect(text).toContain('1.0 to 3.0 ppm');
  });

  it('sizes the closing doses with the volume and chlorine calculators, and points to the chart', () => {
    const links = CLOSING_GUIDE.steps.flatMap(({ link }) =>
      link === undefined ? [] : [link.href],
    );
    expect(links).toEqual(
      expect.arrayContaining([VOLUME_TEXTS.path, CHLORINE.path, CHEMISTRY_CHART.path]),
    );
  });
});

describe('the pump run time guide', () => {
  const text = textOf(PUMP_RUN_GUIDE);

  // the figures come from the sources as published; a changed one must be checked against them again
  it('gives the standard, the manual, DOE and ENERGY STAR figures exactly as they publish them', () => {
    expect(text).toContain('6-hour turnover or 36 gpm, whichever is greater');
    expect(text).toContain('8 ft per second in the return and 6 in the suction');
    expect(text).toContain('at least once every 24 hours');
    expect(text).toContain('6 hours a day');
    expect(text).toContain('half-hour');
    expect(text).toContain('less than 3 hours a day');
    expect(text).toContain('60%');
    expect(text).toContain('one-eighth');
    expect(text).toContain('75%');
    expect(text).toContain('in half');
  });

  it('calls 8 hours what it is: an informal trade figure, in no source it cites', () => {
    expect(text).toContain('informal trade figure');
  });

  // a figure a calculator works out is the calculator's own, to the digit
  it('works out the flows as the pump size calculator does', () => {
    expect(text).toContain(`${figure(PUMP.path, { gallons: '20000' }, 'flow')} gpm`);
    expect(text).toContain(`${figure(PUMP.path, { gallons: '20000' }, 'eightHour')} gpm`);
    expect(text).toContain(`${figure(PUMP.path, { gallons: '10000' }, 'flow')} gpm`);
  });

  it('works out one turnover at a slower flow as gallons ÷ gallons a minute', () => {
    expect(figure(FILL_TIME.path, { gallons: '20000', flow: '40' }, 'time')).toBe('8 h 20 min');
    expect(text).toContain('20,000 ÷ 40 = 500 minutes, 8 h 20 min');
  });

  it('links the volume, the pump size and the heater calculators', () => {
    const links = PUMP_RUN_GUIDE.steps.flatMap(({ link }) =>
      link === undefined ? [] : [link.href],
    );
    expect(links).toEqual([VOLUME_TEXTS.path, PUMP.path, HEATER.path]);
  });
});

describe('the salt water vs chlorine guide', () => {
  const text = textOf(SALT_VS_CHLORINE_GUIDE);

  it('says a salt pool is a chlorine pool, as the three makers describe their cells', () => {
    expect(SALT_VS_CHLORINE_GUIDE.lead).toContain('A salt water pool is a chlorine pool');
    expect(text).toContain('reverts back to salt');
    expect(text).toContain('hypochlorous acid');
    expect(text).toContain('sodium hypochlorite, liquid chlorine');
  });

  // the figures come from the sources as published; a changed one must be checked against them again
  it('gives the same water targets as CDC publishes them for every home pool', () => {
    expect(text).toContain('at least 1 ppm');
    expect(text).toContain('at least 2 ppm');
    expect(text).toContain('pH 7.0 to 7.8');
    expect(text).toContain('at least twice a day');
  });

  it('gives each maker’s salt level, salt purity and plaster wait exactly as its manual does', () => {
    expect(text).toContain('2,700 to 3,400 ppm, 3,200 the best');
    expect(text).toContain('3,500 to 4,000');
    expect(text).toContain('3,600 ppm');
    expect(text).toContain('below 2,600');
    expect(text).toContain('above 4,500');
    expect(text).toContain('3,000 to 3,500 ppm');
    expect(text).toContain('below 2,000');
    expect(text).toContain('over 99% pure');
    expect(text).toContain('at least 99.8%');
    expect(text).toContain('10 to 14 days');
    expect(text).toContain('at least 4 weeks');
    expect(text).toContain('at least one month');
  });

  it('gives the stabilizer, the cell care and the cell life exactly as the manuals do', () => {
    expect(text).toContain('40 ppm');
    expect(text).toContain('30 to 50 ppm');
    expect(text).toContain('50 to 75');
    expect(text).toContain('90%');
    expect(text).toContain('below 50°F');
    expect(text).toContain('about 50%');
    expect(text).toContain('every 3 months');
    expect(text).toContain('every two months');
    expect(text).toContain('1 quart of muriatic acid to 1 gallon of water');
    expect(text).toContain('about 10,000 hours, roughly five years of average use');
    expect(text).toContain('dry acid');
  });

  it('prices nothing: no cost figure that no source gives', () => {
    expect(`${SALT_VS_CHLORINE_GUIDE.lead} ${text}`).not.toMatch(/\$/);
  });

  // a figure a calculator works out is the calculator's own, to the digit
  it('works out the salt and the chlorine as their calculators do', () => {
    expect(text).toContain(
      `${figure(SALT.path, { gallons: '20000', current: '0', target: '3200' }, 'pounds')} lb`,
    );
    expect(text).toContain(
      `${figure(CHLORINE.path, { gallons: '20000', current: '1', target: '3', product: 'liquid-12-5' }, 'liquid')} fl oz`,
    );
  });

  it('links the chart, the volume, the chlorine and the salt calculators', () => {
    const links = SALT_VS_CHLORINE_GUIDE.steps.flatMap(({ link }) =>
      link === undefined ? [] : [link.href],
    );
    expect(links).toEqual([CHEMISTRY_CHART.path, VOLUME_TEXTS.path, CHLORINE.path, SALT.path]);
  });
});

describe('the pool shock guide', () => {
  const text = textOf(SHOCK_GUIDE);
  const dose = (gallons: string, current: string, target: string, product: string): string =>
    figure(
      CHLORINE.path,
      { gallons, current, target, product },
      product.startsWith('liquid') ? 'liquid' : 'dry',
    );

  it('sizes the shock as the chlorine calculator raising free chlorine to the shock level', () => {
    expect(SHOCK_GUIDE.lead).toContain('free chlorine');
    expect(text).toContain('from your reading to the shock level');
  });

  // the figures come from the sources as published; a changed one must be checked against them again
  it('gives the cal-hypo label’s strength, dose, timing and reentry level exactly as it does', () => {
    expect(text).toContain('65% available chlorine');
    expect(text).toContain('10 to 20 oz per 10,000 gallons');
    expect(text).toContain('5 to 10 ppm');
    expect(text).toContain('every 7 days');
    expect(text).toContain('evening hours while the filter pump is running');
    expect(text).toContain('above 4 ppm');
  });

  it('gives the dichlor label’s strength, dose and reentry level exactly as it does', () => {
    expect(text).toContain('56% available chlorine');
    expect(text).toContain('2 oz per 1,000 gallons');
    expect(text).toContain('8.7 ppm');
    expect(text).toContain('above 3 ppm');
  });

  it('balances the pH first, at the 7.2 to 7.6 both labels ask for', () => {
    expect(text).toContain('7.2 to 7.6');
  });

  it('gives CDC’s home pool floor and its hyperchlorination exactly as CDC publishes them', () => {
    expect(text).toContain('at least 1 ppm');
    expect(text).toContain('at least 2 ppm');
    expect(text).toContain('DPD');
    expect(text).toContain('aquatic staff');
    expect(text).toContain('unstabilized chlorine');
    expect(text).toContain('20 ppm for 12.75 hours');
    expect(text).toContain('1 to 15 ppm');
    expect(text).toContain('20 ppm for 28 hours');
    expect(text).toContain('pH 7.5 or less');
    expect(text).toContain('2 ppm for 25 to 30 minutes');
  });

  it('states no breakpoint rule that no source it cites gives', () => {
    expect(`${SHOCK_GUIDE.lead} ${text}`).not.toMatch(
      /breakpoint|combined chlorine|10 ?(x|×|times)/i,
    );
  });

  // a figure a calculator works out is the calculator's own, to the digit
  it('works out every shock dose as the chlorine calculator does', () => {
    expect(text).toContain(`${dose('10000', '0', '5', 'cal-hypo-65')} oz`);
    expect(text).toContain(`${dose('10000', '0', '10', 'cal-hypo-65')} oz`);
    expect(text).toContain(`${dose('1000', '0', '8.7', 'dichlor-56')} oz`);
    expect(text).toContain(`${dose('20000', '1', '10', 'cal-hypo-65')} oz`);
    expect(text).toContain(`${dose('20000', '1', '10', 'liquid-12-5')} fl oz`);
    expect(text).toContain(`${dose('20000', '2', '20', 'liquid-12-5')} fl oz`);
  });

  it('links the volume, the pH and the chlorine calculators and the chart', () => {
    const links = SHOCK_GUIDE.steps.flatMap(({ link }) => (link === undefined ? [] : [link.href]));
    expect(links).toEqual([VOLUME_TEXTS.path, PH.path, CHEMISTRY_CHART.path, CHLORINE.path]);
  });
});

describe('the pool pH guide', () => {
  const text = textOf(PH_GUIDE);
  const acid = (gallons: string, drops: string): string =>
    figure(PH.path, { gallons, product: 'muriatic-31-45', drops }, 'liquid');
  const soda = (gallons: string, drops: string): string =>
    figure(PH.path, { gallons, product: 'soda-ash', drops }, 'dry');

  it('sizes the acid and the soda ash from the demand test, as the pH calculator does', () => {
    expect(PH_GUIDE.lead).toContain('acid demand test');
    expect(text).toContain('base demand test');
  });

  // the figures come from the sources as published; a changed one must be checked against them again
  it('gives Taylor’s range, test and chart exactly as its K-1003 instructions publish them', () => {
    expect(text).toContain('7.2 to 7.8');
    expect(text).toContain('80 to 120 ppm');
    expect(text).toContain('R-0015');
    expect(text).toContain('R-0016');
    expect(text).toContain('9.16 fl oz');
    expect(text).toContain('5.13 oz');
    expect(text).toContain('3 drops');
    expect(text).toContain('recheck total alkalinity');
  });

  it('gives CDC’s home pool range and its testing exactly as CDC publishes them', () => {
    expect(text).toContain('7.0 to 7.8');
    expect(text).toContain('at least twice a day');
    expect(text).toContain('above 8.0');
    expect(text).toContain('below 7.0');
  });

  it('adds the acid as HASA’s directions say, and no faster', () => {
    expect(text).toContain('31.45%');
    expect(text).toContain('add acid to water, never water to acid');
    expect(text).toContain('at least one foot from the wall');
    expect(text).toContain('at least 1 hour after');
    expect(text).toContain('one quart per 20,000 gallons in 24 hours');
    expect(text).toContain('7.2 to 7.6');
    expect(text).toContain('chlorine');
  });

  it('adds the soda ash as its label says', () => {
    expect(text).toContain('1 pound per 10,000 gallons');
    expect(text).toContain('2 to 3 hours');
    expect(text).toContain('do not mix it with other chemicals');
  });

  // a figure a calculator works out is the calculator's own, to the digit
  it('works out every dose as the pH calculator does, never past the chart’s 3 drops', () => {
    expect(text).toContain(`${acid('10000', '1')} fl oz`);
    expect(text).toContain(`${acid('10000', '2')} fl oz`);
    expect(text).toContain(`${acid('10000', '3')} fl oz`);
    expect(text).toContain(`${acid('20000', '2')} fl oz`);
    expect(text).toContain(`${soda('10000', '1')} oz`);
    expect(text).toContain(`${soda('10000', '3')} oz`);
    expect(text).toContain(`${soda('20000', '2')} oz`);
    expect(`${PH_GUIDE.lead} ${text}`).not.toMatch(/\b([4-9]|10) drops\b/);
  });

  // HASA's quart per 20,000 gallons a day and the pH Up pound per 10,000 gallons a time: the most and
  // the days the guide gives are the calculator's own, so a dose over the label is split as it splits it
  it('splits the acid over the days the pH calculator gives, at the label’s most a day', () => {
    const acid20k = { gallons: '20000', product: 'muriatic-31-45', drops: '2' };
    const acid10k = { gallons: '10000', product: 'muriatic-31-45', drops: '3' };
    const soda20k = { gallons: '20000', product: 'soda-ash', drops: '2' };
    expect(text).toContain(
      `${figure(PH.path, acid20k, 'liquidPerDay')} fl oz a day, so it goes in over ${figure(PH.path, acid20k, 'days')} days`,
    );
    expect(text).toContain(
      `${figure(PH.path, acid10k, 'liquidPerDay')} fl oz a day: the 3-drop dose of 10,000 gallons takes ${figure(PH.path, acid10k, 'days')} days`,
    );
    expect(figure(PH.path, soda20k, 'additions')).toBe('1');
    expect(text).toContain(
      `in 20,000 gallons, ${figure(PH.path, soda20k, 'dryPerAddition')} oz, so the 2-drop dose goes in at once`,
    );
  });

  it('links the volume, the alkalinity and the pH calculators and the chart', () => {
    const links = PH_GUIDE.steps.flatMap(({ link }) => (link === undefined ? [] : [link.href]));
    expect(links).toEqual([
      VOLUME_TEXTS.path,
      CHEMISTRY_CHART.path,
      ALKALINITY.path,
      PH.path,
      PH.path,
    ]);
  });
});

describe('the calcium hardness guide', () => {
  const text = textOf(CALCIUM_GUIDE);
  const calcium = (gallons: string, current: string, target: string, key: string): string =>
    figure(CALCIUM.path, { gallons, current, target }, key);

  // the figures come from the sources as published; a changed one must be checked against them again
  it('gives the ranges exactly as Hayward’s manual, the label and the CDC’s code publish them', () => {
    expect(text).toContain('200 to 400 ppm');
    expect(text).toContain('between 150 and 350 ppm');
    expect(text).toContain('2,500 ppm');
  });

  it('says what low and high calcium do exactly as Hayward’s manual does', () => {
    expect(text).toContain('below -0.2');
    expect(text).toContain('plaster pool walls will be dissolved into the water');
    expect(text).toContain('above +0.2');
    expect(text).toContain('scaling and staining will occur');
    expect(text).toContain('old pool water is usually the cause');
  });

  it('doses and adds the calcium chloride as the label and its safety data sheet say', () => {
    expect(text).toContain('2 ounces per 1,000 gallons');
    expect(text).toContain('1.25 lb per 10 ppm per 10,000 gallons');
    expect(text).toContain('Avoid overtreating');
    expect(text).toContain('74 to 100%');
    expect(text).toContain('adding 1/2 pound of product to one gallon of water');
    expect(text).toContain('deep end of the pool with the pump running');
    expect(text).toContain('always use cool water');
    expect(text).toContain('Heat evolved is significant');
    expect(text).toContain('chemical goggles');
  });

  // the label's rule as the calculator applies it: over 3 lb per 10,000 gallons, the first part is
  // 3 lb per 10,000 gallons, and the next waits at least 12 hours
  it('splits a dose over 3 lb per 10,000 gallons 12 hours apart, as the calculator does', () => {
    expect(text).toContain(
      'If more than 3 pounds of this product is needed per 10,000 gallons of pool water, separate doses and apply this product at least 12 hours apart',
    );
    expect(calcium('20000', '180', '200', 'firstAddition')).toBe(
      calcium('20000', '180', '200', 'pounds'),
    );
    expect(text).toContain(
      `takes ${calcium('20000', '150', '250', 'pounds')} lb, more than 3 lb per 10,000 gallons, so add ${calcium('20000', '150', '250', 'firstAddition')} lb first`,
    );
    expect(text).toContain(
      `In 10,000 gallons, ${calcium('10000', '150', '250', 'pounds')} lb starts with ${calcium('10000', '150', '250', 'firstAddition')} lb`,
    );
  });

  // a figure a calculator works out is the calculator's own, to the digit
  it('works out every dose as the calcium calculator does', () => {
    expect(text).toContain(
      `10,000 gallons from 200 to 220 ppm take ${calcium('10000', '200', '220', 'pounds')} lb`,
    );
    expect(text).toContain(
      `20,000 gallons from 180 to 200 ppm take ${calcium('20000', '180', '200', 'pounds')} lb`,
    );
    expect(text).toContain(
      `from 600 to 400 ppm, the calculator adds ${calcium('20000', '600', '400', 'pounds')} lb`,
    );
  });

  // plain dilution, worked by hand: drain d of G gallons at reading R, refill with water at F, and
  // the pool reads ((G − d) × R + d × F) ÷ G, so d = G × (R − T) ÷ (R − F) reaches the target T:
  // 20,000 × (600 − 400) ÷ (600 − 100) = 8,000 gallons, and (12,000 × 600 + 8,000 × 100) ÷ 20,000 = 400
  it('lowers it only by draining and refilling, with the dilution worked out in the open', () => {
    const [gallons, reading, target, fill] = [20_000, 600, 400, 100];
    const drain = (gallons * (reading - target)) / (reading - fill);
    expect(drain).toBe(8000);
    expect(((gallons - drain) * reading + drain * fill) / gallons).toBe(target);
    expect(CALCIUM_GUIDE.lead).toContain('draining part of the water');
    expect(text).toContain(
      'gallons to drain = gallons × (reading − target) ÷ (reading − fill water)',
    );
    expect(text).toContain(
      'A 20,000-gallon pool at 600 ppm, brought down to 400 ppm with fill water at 100 ppm, drains 8,000 gallons',
    );
    expect(text).toContain(
      '12,000 gallons at 600 ppm and 8,000 gallons at 100 ppm make 20,000 gallons at 400 ppm',
    );
  });

  it('links the volume and calcium calculators, the chart and the fill time', () => {
    const links = CALCIUM_GUIDE.steps.flatMap(({ link }) =>
      link === undefined ? [] : [link.href],
    );
    expect(links).toEqual([
      VOLUME_TEXTS.path,
      CHEMISTRY_CHART.path,
      CALCIUM.path,
      CALCIUM.path,
      FILL_TIME.path,
      CHEMISTRY_CHART.path,
    ]);
  });
});

describe('the guides', () => {
  it('lists every guide once, each with a short card', () => {
    expect(GUIDES.map(({ path }) => path)).toEqual([
      OPENING_GUIDE.path,
      CLOSING_GUIDE.path,
      CHEMISTRY_CHART.path,
      DOSING_CHART.path,
      VOLUME_CHART.path,
      PUMP_RUN_GUIDE.path,
      SALT_VS_CHLORINE_GUIDE.path,
      SHOCK_GUIDE.path,
      PH_GUIDE.path,
      CALCIUM_GUIDE.path,
      SWIM_GUIDE.path,
    ]);
    for (const { card } of GUIDES) {
      expect(card.title.length).toBeGreaterThan(0);
      expect(card.title.length).toBeLessThanOrEqual(30);
      expect(card.summary.length).toBeLessThanOrEqual(90);
    }
  });

  it('links every guide from the footer of every page', () => {
    for (const { path } of GUIDES) expect(footer, path).toContain(`href="${path}"`);
  });
});

describe('the calculators each guide explains', () => {
  const calculators = HOME_TOOLS.map(({ href }) => href);
  const linksOf = (guide: (typeof GUIDES)[number]): string[] =>
    guide.path === CHEMISTRY_CHART.path
      ? [
          CHEMISTRY_CHART.gallons.href,
          ...CHEMISTRY_CHART.rows.flatMap(({ link }) => (link === undefined ? [] : [link.href])),
        ]
      : guide.path === DOSING_CHART.path
        ? [
            DOSING_CHART.gallons.href,
            ...DOSING_CHART.tables.flatMap(({ columns }) =>
              columns.map(({ calculator }) => calculator),
            ),
          ]
        : guide.path === VOLUME_CHART.path
          ? [VOLUME_CHART.calculator.href]
          : guide.path === SWIM_GUIDE.path
            ? SWIM_GUIDE.rows.map(({ link }) => link.href)
            : [
                OPENING_GUIDE,
                CLOSING_GUIDE,
                PUMP_RUN_GUIDE,
                SALT_VS_CHLORINE_GUIDE,
                SHOCK_GUIDE,
                PH_GUIDE,
                CALCIUM_GUIDE,
              ]
                .filter(({ path }) => path === guide.path)
                .flatMap(({ steps }) =>
                  steps.flatMap(({ link }) => (link === undefined ? [] : [link.href])),
                );

  // a calculator page links back each guide that names it (`src/site-check/links.ts` checks the build)
  it.each(GUIDES.map((guide) => [guide.path, guide] as const))(
    'are the calculators %s links, each once, in its order',
    (_path, guide) => {
      expect(guide.calculators).toEqual([
        ...new Set(linksOf(guide).filter((href) => calculators.includes(href))),
      ]);
    },
  );

  it('are the guides a calculator page links, in the order of the list', () => {
    expect(guidesOf(PH.path).map(({ path }) => path)).toEqual([
      OPENING_GUIDE.path,
      CHEMISTRY_CHART.path,
      DOSING_CHART.path,
      SHOCK_GUIDE.path,
      PH_GUIDE.path,
      SWIM_GUIDE.path,
    ]);
  });

  it('send the calcium calculator to the chart, the calcium guide and the swim guide', () => {
    expect(guidesOf(CALCIUM.path).map(({ path }) => path)).toEqual([
      CHEMISTRY_CHART.path,
      DOSING_CHART.path,
      CALCIUM_GUIDE.path,
      SWIM_GUIDE.path,
    ]);
  });

  it('cover every calculator, so each calculator page links at least one guide', () => {
    const explained = new Set(GUIDES.flatMap((guide) => guide.calculators));
    expect(calculators.filter((href) => !explained.has(href))).toEqual([]);
  });

  it('send the opening guide’s water level to the fill time and its balance to the doses', () => {
    expect(GUIDES.find(({ path }) => path === OPENING_GUIDE.path)?.calculators).toEqual([
      FILL_TIME.path,
      VOLUME_TEXTS.path,
      ALKALINITY.path,
      PH.path,
      SALT.path,
      CHLORINE.path,
    ]);
  });
});

// A search answer quotes the opening: its first two sentences answer the question with the number,
// and the number is the calculator's own, to the digit, or the source's as the guide cites it.
describe('the opening of each top guide', () => {
  const opening = (lead: string): string =>
    lead
      .split(/(?<=[.:]) (?=[A-Z])/)
      .slice(0, 2)
      .join(' ');

  it('shocks with the cal-hypo dose for 10,000 gallons and the reentry level', () => {
    const dose = figure(
      CHLORINE.path,
      { gallons: '10000', current: '0', target: '10', product: 'cal-hypo-65' },
      'dry',
    );
    expect(opening(SHOCK_GUIDE.lead)).toContain(`${dose} oz of 65% cal-hypo`);
    expect(opening(SHOCK_GUIDE.lead)).toContain('10,000 gallons');
    expect(opening(SHOCK_GUIDE.lead)).toContain('4 ppm');
    expect(textOf(SHOCK_GUIDE)).toContain('prohibits reentry above 4 ppm');
  });

  it('opens a pool in its order, with the doses for 10,000 gallons', () => {
    const soda = figure(
      ALKALINITY.path,
      { gallons: '10000', current: '80', target: '90' },
      'pounds',
    );
    const acid = figure(
      PH.path,
      { gallons: '10000', product: 'muriatic-31-45', drops: '1' },
      'liquid',
    );
    const shock = figure(
      CHLORINE.path,
      { gallons: '10000', current: '0', target: '10', product: 'cal-hypo-65' },
      'dry',
    );
    const lead = opening(OPENING_GUIDE.lead);
    expect(lead).toContain('10,000 gallons');
    expect(lead).toContain(`${soda} lb of baking soda`);
    expect(lead).toContain(`${acid} fl oz of 31.45% muriatic acid`);
    expect(lead).toContain(`${shock} oz of 65% cal-hypo`);
  });

  it('balances alkalinity before pH and doses each step as its calculator does', () => {
    const titles = OPENING_GUIDE.steps.map(({ title }) => title);
    expect(titles.indexOf('Bring the alkalinity into range first')).toBeLessThan(
      titles.indexOf('Then correct the pH'),
    );
    expect(titles.indexOf('Then correct the pH')).toBeLessThan(
      titles.indexOf('Shock, then raise the chlorine'),
    );
    const step = (title: string) => OPENING_GUIDE.steps.find((s) => s.title === title);
    expect(step('Bring the alkalinity into range first')?.sources).toEqual(['taylor']);
    expect(step('Then correct the pH')?.text).toContain('one quart per 20,000 gallons');
    const salt = figure(SALT.path, { gallons: '10000', current: '3000', target: '3200' }, 'pounds');
    expect(step('Bring the salt up, if you have a salt cell')?.text).toContain(`${salt} lb`);
    expect(step('Shock, then raise the chlorine')?.text).toContain('4 ppm');
    expect(OPENING_GUIDE.sources.taylor).toEqual(PH_GUIDE.sources.taylor);
    expect(OPENING_GUIDE.sources.hasa).toEqual(PH_GUIDE.sources.hasa);
    expect(OPENING_GUIDE.sources.calHypo).toEqual(SHOCK_GUIDE.sources.calHypo);
    expect(OPENING_GUIDE.sources.manual).toEqual(CHEMISTRY_CHART.sources.hayward);
  });

  it('lowers pH with the muriatic acid a drop of the acid demand test takes', () => {
    const dose = figure(
      PH.path,
      { gallons: '10000', product: 'muriatic-31-45', drops: '1' },
      'liquid',
    );
    expect(opening(PH_GUIDE.lead)).toContain(`${dose} fl oz of 31.45% muriatic acid`);
    expect(opening(PH_GUIDE.lead)).toContain('10,000 gallons');
  });

  it('raises calcium hardness with the label’s dose and its most at a time', () => {
    const dose = figure(
      CALCIUM.path,
      { gallons: '10000', current: '200', target: '210' },
      'ounces',
    );
    expect(opening(CALCIUM_GUIDE.lead)).toContain(`${dose} oz of calcium chloride flake`);
    expect(opening(CALCIUM_GUIDE.lead)).toContain('3 lb per 10,000 gallons');
  });

  it('runs the pump the 6 hours of the standard’s flow', () => {
    const flow = figure(PUMP.path, { gallons: '20000' }, 'flow');
    expect(opening(PUMP_RUN_GUIDE.lead)).toContain('6 hours');
    expect(opening(PUMP_RUN_GUIDE.lead)).toContain(`${flow} gpm for 20,000 gallons`);
  });

  it('gives the salt level of a salt water pool', () => {
    expect(opening(SALT_VS_CHLORINE_GUIDE.lead)).toContain('3,200 ppm');
    expect(textOf(SALT_VS_CHLORINE_GUIDE)).toContain('2,700 to 3,400 ppm, 3,200 the best');
  });

  it('gives the home ranges of the water chemistry chart', () => {
    const home = (id: string) => CHEMISTRY_CHART.rows.find((row) => row.id === id)?.home ?? '?';
    for (const id of ['chlorine', 'ph', 'alkalinity'])
      expect(opening(CHEMISTRY_CHART.lead)).toContain(home(id));
  });
});
