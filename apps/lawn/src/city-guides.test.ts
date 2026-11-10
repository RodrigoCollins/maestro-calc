import { describe, expect, it } from 'vitest';
import { CITY_GUIDES, cityGuidesOfState } from './city-guides.ts';
import { FROST_CITIES } from './frost-cities.ts';
import { DATA_GUIDES, guideAt, type Guide } from './guide.ts';

const textOf = (guide: Guide): string =>
  [
    guide.lead,
    ...guide.sections.flatMap(({ paragraphs, items = [] }) => [...paragraphs, ...items]),
    ...guide.questions.map(({ answer }) => answer),
  ].join(' ');

const sectionOf = (guide: Guide, id: string) => {
  const section = guide.sections.find((candidate) => candidate.id === id);
  if (section === undefined) throw new Error(`${guide.path} has no section ${id}`);
  return [...section.paragraphs, ...(section.items ?? [])].join(' ');
};

const hrefsOf = (guide: Guide): readonly string[] =>
  guide.sections.flatMap(({ links = [] }) => links.map(({ href }) => href));

describe('city frost pages', () => {
  it('gives every city a data page under the frost dates, answer first', () => {
    expect(CITY_GUIDES.map(({ path }) => path)).toEqual(
      FROST_CITIES.map(({ slug }) => `/last-frost-date/${slug}`),
    );
    for (const guide of CITY_GUIDES) {
      expect(DATA_GUIDES).toContain(guide);
      expect(guide.parent).toEqual({ name: 'Frost dates', path: '/frost-dates' });
      expect(guide.title).toMatch(/^When Is the Last Frost in .+\? \| Lawn Figures$/);
      expect(guide.h1).toMatch(/^When is the last frost in .+\?$/);
      expect(guide.questions[0]?.question).toBe(guide.h1);
    }
    expect(guideAt('/last-frost-date/new-york-ny').h1).toBe(
      'When is the last frost in New York City?',
    );
  });

  it('answers Chicago from its nearest station, hand-checked against illinois.ts', () => {
    const chicago = guideAt('/last-frost-date/chicago-il');
    expect(chicago.title).toBe('When Is the Last Frost in Chicago? | Lawn Figures');
    // CHICAGO NORTHERLY IS (USC00111550), 4.1 miles from the Census point, 177.7 m:
    // spring [115, 100, 88] = Apr 25, Apr 10, Mar 29; fall [297, 309, 324] = Oct 24, Nov 5, Nov 20
    expect(chicago.lead).toContain('around Apr 10');
    expect(chicago.lead).toContain('Chicago Northerly Is');
    expect(chicago.lead).toContain('4.1 miles');
    expect(chicago.lead).toContain('Apr 25');
    expect(chicago.lead).toContain('Nov 5');
    const dates = sectionOf(chicago, 'dates');
    for (const date of ['Apr 25', 'Apr 10', 'Mar 29', 'Oct 24', 'Nov 5', 'Nov 20'])
      expect(dates).toContain(date);
    expect(dates).toContain('583 ft');
    // 309 - 100 = 209 days between the 50% dates; 297 - 115 = 182 between the 10% dates
    const season = sectionOf(chicago, 'season');
    expect(season).toContain('209 days');
    expect(season).toContain('182 days');
    // Midway 4.9 miles, Apr 11; Lisle-Morton Arboretum 20.0 miles, Apr 28: 18 days after Apr 10
    const nearby = sectionOf(chicago, 'nearby');
    expect(nearby).toContain('Chicago Midway AP (IL), 4.9 miles');
    expect(nearby).toContain('Lisle-Morton Arboretum (IL), 20.0 miles');
    expect(nearby).toContain('Apr 28');
    expect(nearby).toContain('18 days');
    // 170 dated Illinois stations, middle 50% last freeze day 108 (Apr 18); 136 are later
    const state = sectionOf(chicago, 'state');
    expect(state).toContain('Apr 18');
    expect(state).toContain('8 days earlier');
    expect(state).toContain('136 of the 170');
    expect(state).toContain('zone 6b');
    // cool-season seed 45 days before Nov 5 (Illinois): Sep 21; four to six weeks (UGA): Sep 24 to Oct 8
    const lawn = sectionOf(chicago, 'lawn');
    expect(lawn).toContain('Sep 21');
    expect(lawn).toContain('Sep 24 to Oct 8');
    expect(lawn).toContain('northern counties');
    // UNH, from Apr 10 (day 100): tomatoes 7 to 14 days after, Apr 17 to Apr 24
    expect(sectionOf(chicago, 'garden')).toContain('Tomato transplants: Apr 17 to Apr 24.');
    const hrefs = hrefsOf(chicago);
    expect(hrefs).toContain('/frost-dates/illinois#USC00111550');
    expect(hrefs).toContain('/frost-dates#zip');
    expect(hrefs).toContain('/when-to-plant-grass-seed/illinois');
    expect(hrefs).toContain('/when-to-fertilize-lawn/illinois');
    expect(hrefs).toContain('/planting-zones/zone-6b');
  });

  it('reads a warm station across the new year: Houston', () => {
    const houston = guideAt('/last-frost-date/houston-tx');
    // HOUSTON-PORT (USC00414326): spring [64, 33, 365] = Mar 5, Feb 2, Dec 31 of the year before;
    // fall [331, 359, 21] = Nov 27, Dec 25, Jan 21 of the next year
    const dates = sectionOf(houston, 'dates');
    expect(dates).toContain('Dec 31 of the year before');
    expect(dates).toContain('Jan 21 of the next year');
    // 359 - 33 = 326 days
    expect(sectionOf(houston, 'season')).toContain('326 days');
    // 476 dated Texas stations, middle day 73 (Mar 14): 40 days later than Feb 2
    expect(sectionOf(houston, 'state')).toContain('40 days earlier');
    // warm season: first feeding 33 + 42 = Mar 16; last 359 - 42 = Nov 13; plugs two months
    // before Dec 25: Oct 25
    const lawn = sectionOf(houston, 'lawn');
    expect(lawn).toContain('Mar 16');
    expect(lawn).toContain('Nov 13');
    expect(lawn).toContain('Oct 25');
    expect(lawn).not.toContain('cool-season seed');
    // the UNH table counts from a spring frost: not applied before March
    expect(sectionOf(houston, 'garden')).not.toContain('Tomato');
    expect(
      hrefsOf(houston).some((href) => /^\/frost-dates\/texas(\/\d)?#USC00414326$/.test(href)),
    ).toBe(true);
  });

  it('leaves the Texas feeding rule to Texas when the last frost is in January: Phoenix', () => {
    const phoenix = guideAt('/last-frost-date/phoenix-az');
    // PHOENIX DEER VALLEY MUNI AP: 50% Jan 8 and Dec 25; plugs two months before, Oct 25
    const lawn = sectionOf(phoenix, 'lawn');
    expect(lawn).not.toContain('Texas A&M AgriLife makes the first feeding');
    expect(lawn).toContain('once the soil holds at 60°F');
    expect(lawn).toContain('by Oct 25');
    expect(Object.keys(phoenix.sources)).not.toContain('texas');
    expect(sectionOf(phoenix, 'dates')).toContain('Dec 16 of the year before');
  });

  it('names the measured cities from their own stations', () => {
    // RALEIGH STATE UNIV 4.2 miles: Mar 28, Nov 8; SEATTLE SAND PT WSFO 6.5 miles: Mar 8, Nov 23;
    // NY AVE V BROOKLYN 5.2 miles: Apr 1, Nov 19, Central Park Mar 30 among its neighbors
    expect(guideAt('/last-frost-date/raleigh-nc').lead).toMatch(
      /around Mar 28 .*Raleigh State Univ.* 4\.2 miles.*Nov 8/,
    );
    expect(guideAt('/last-frost-date/seattle-wa').lead).toMatch(
      /around Mar 8 .*6\.5 miles.*Nov 23/,
    );
    const york = guideAt('/last-frost-date/new-york-ny');
    expect(york.lead).toMatch(/around Apr 1 .*NY Ave V Brooklyn.*5\.2 miles.*Nov 19/);
    expect(sectionOf(york, 'nearby')).toContain('New York Cntrl Pk Twr (NY), 8.2 miles');
  });

  it('cites NOAA, the Census points and the extension service of the state on every page', () => {
    for (const guide of CITY_GUIDES) {
      const urls = Object.values(guide.sources).map(({ url }) => url);
      expect(urls).toContain(
        'https://www.ncei.noaa.gov/data/normals-annualseasonal/1991-2020/access/',
      );
      expect(urls).toContain(
        'https://www.census.gov/geographies/reference-files/time-series/geo/gazetteer-files.2020.html',
      );
      expect(new Set(urls).size).toBe(urls.length);
      expect(guide.checked).toBe('2026-11-10');
      expect(textOf(guide)).not.toMatch(/undefined|NaN/);
    }
  });

  it('lists the city pages of a state for its frost page', () => {
    expect(cityGuidesOfState('texas').map(({ path }) => path)).toEqual([
      '/last-frost-date/dallas-tx',
      '/last-frost-date/houston-tx',
      '/last-frost-date/austin-tx',
    ]);
    expect(cityGuidesOfState('alaska')).toEqual([]);
  });
});
