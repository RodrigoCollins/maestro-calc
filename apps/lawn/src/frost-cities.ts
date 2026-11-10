import { STATES, type StateEntry } from '@maestro-calc/lawn-data/frost/states';
import type { Station } from '@maestro-calc/lawn-data/frost/types';
import type { CalendarStateCode } from './calendar-paths.ts';
import { STATIONS_OF } from './frost-stations.ts';
import type { GuideSource } from './guide.ts';

/*
 * The cities with a frost date page of their own. Each sits at the internal point the U.S. Census
 * Bureau gives for the place in its 2020 Gazetteer (`2020_Gaz_place_national.txt`, columns GEOID,
 * INTPTLAT and INTPTLONG), and takes the NOAA station with dates nearest that point. Chicago, New
 * York, Seattle and Raleigh come first: their "last frost date" searches were measured in Ahrefs
 * (plans/growth/ahrefs-2026-11-08.md); the others are large cities of the states with a seed and a
 * fertilizer calendar, so every city page has its extension service to cite.
 */

/** The day the Census internal points below were read. */
export const CITY_READ = '2026-11-10';

export const CENSUS_PLACES: GuideSource = {
  name: `U.S. Census Bureau, 2020 Gazetteer Files, places (internal points), accessed ${CITY_READ}`,
  url: 'https://www.census.gov/geographies/reference-files/time-series/geo/gazetteer-files.2020.html',
};

export interface FrostCity {
  readonly slug: string;
  /** The name the pages use. */
  readonly name: string;
  readonly code: CalendarStateCode;
  /** The Census GEOID of the place. */
  readonly geoid: string;
  readonly lat: number;
  readonly lon: number;
  /**
   * Where the city sits in the regions its extension service names, when the claims of
   * `state-calendars.ts` split the state: a fact of geography, said once.
   */
  readonly local?: string;
}

export const FROST_CITIES: readonly FrostCity[] = [
  {
    slug: 'chicago-il',
    name: 'Chicago',
    code: 'IL',
    geoid: '1714000',
    lat: 41.837045,
    lon: -87.684939,
    local:
      'Chicago lies in the northern counties of Illinois, so the northern dates of Illinois Extension below are the ones to read.',
  },
  {
    slug: 'new-york-ny',
    name: 'New York City',
    code: 'NY',
    geoid: '3651000',
    lat: 40.662712,
    lon: -73.938677,
  },
  {
    slug: 'seattle-wa',
    name: 'Seattle',
    code: 'WA',
    geoid: '5363000',
    lat: 47.619339,
    lon: -122.351565,
    local:
      'Seattle is in western Washington, so read the western Washington dates of WSU below, not the eastern ones.',
  },
  {
    slug: 'raleigh-nc',
    name: 'Raleigh',
    code: 'NC',
    geoid: '3755000',
    lat: 35.830204,
    lon: -78.641493,
    local:
      'Raleigh is in the piedmont, the part of North Carolina where NC State says both cool-season and warm-season lawns are grown.',
  },
  {
    slug: 'dallas-tx',
    name: 'Dallas',
    code: 'TX',
    geoid: '4819000',
    lat: 32.793333,
    lon: -96.766513,
  },
  {
    slug: 'houston-tx',
    name: 'Houston',
    code: 'TX',
    geoid: '4835000',
    lat: 29.785743,
    lon: -95.388806,
  },
  {
    slug: 'atlanta-ga',
    name: 'Atlanta',
    code: 'GA',
    geoid: '1304000',
    lat: 33.762909,
    lon: -84.422675,
  },
  {
    slug: 'philadelphia-pa',
    name: 'Philadelphia',
    code: 'PA',
    geoid: '4260000',
    lat: 40.009376,
    lon: -75.133346,
  },
  {
    slug: 'phoenix-az',
    name: 'Phoenix',
    code: 'AZ',
    geoid: '0455000',
    lat: 33.572154,
    lon: -112.090132,
  },
  {
    slug: 'detroit-mi',
    name: 'Detroit',
    code: 'MI',
    geoid: '2622000',
    lat: 42.383037,
    lon: -83.102237,
  },
  {
    slug: 'denver-co',
    name: 'Denver',
    code: 'CO',
    geoid: '0820000',
    lat: 39.76185,
    lon: -104.881105,
  },
  {
    slug: 'baltimore-md',
    name: 'Baltimore',
    code: 'MD',
    geoid: '2404000',
    lat: 39.300032,
    lon: -76.610476,
    local:
      'Baltimore is in central Maryland, where the University of Maryland plants zoysia in late May.',
  },
  {
    slug: 'st-louis-mo',
    name: 'St. Louis',
    code: 'MO',
    geoid: '2965000',
    lat: 38.635699,
    lon: -90.244582,
  },
  {
    slug: 'charlotte-nc',
    name: 'Charlotte',
    code: 'NC',
    geoid: '3712000',
    lat: 35.209045,
    lon: -80.83099,
    local:
      'Charlotte is in the piedmont, so the piedmont dates of NC State below apply, not those of the coastal plain or the mountains.',
  },
  {
    slug: 'austin-tx',
    name: 'Austin',
    code: 'TX',
    geoid: '4805000',
    lat: 30.301157,
    lon: -97.752695,
  },
  {
    slug: 'pittsburgh-pa',
    name: 'Pittsburgh',
    code: 'PA',
    geoid: '4261000',
    lat: 40.439775,
    lon: -79.976333,
  },
  {
    slug: 'columbus-oh',
    name: 'Columbus',
    code: 'OH',
    geoid: '3918000',
    lat: 39.985531,
    lon: -82.985594,
  },
  {
    slug: 'indianapolis-in',
    name: 'Indianapolis',
    code: 'IN',
    geoid: '1836003',
    lat: 39.776664,
    lon: -86.145935,
  },
  {
    slug: 'nashville-tn',
    name: 'Nashville',
    code: 'TN',
    geoid: '4752006',
    lat: 36.1718,
    lon: -86.785002,
  },
  {
    slug: 'milwaukee-wi',
    name: 'Milwaukee',
    code: 'WI',
    geoid: '5553000',
    lat: 43.063348,
    lon: -87.966695,
  },
  {
    slug: 'kansas-city-mo',
    name: 'Kansas City',
    code: 'MO',
    geoid: '2938000',
    lat: 39.122361,
    lon: -94.555117,
  },
  {
    slug: 'richmond-va',
    name: 'Richmond',
    code: 'VA',
    geoid: '5167000',
    lat: 37.531399,
    lon: -77.476009,
  },
];

/** The address of the frost page of city `slug`. */
export const cityPathOf = (slug: string): string => `/last-frost-date/${slug}`;

/** The city `slug`; an unknown one throws at build time. */
export const cityAt = (slug: string): FrostCity => {
  const city = FROST_CITIES.find((candidate) => candidate.slug === slug);
  if (city === undefined) throw new Error(`no frost city ${slug}`);
  return city;
};

/** The state entry of a postal code. */
export const stateOfCode = (code: string): StateEntry => {
  const state = STATES.find((candidate) => candidate.code === code);
  if (state === undefined) throw new Error(`no state ${code}`);
  return state;
};

const EARTH_MILES = 3958.8;
const RADIANS = Math.PI / 180;

/** Haversine miles between two points, as the ZIP lookup measures them. */
export const milesBetween = (
  a: { readonly lat: number; readonly lon: number },
  b: { readonly lat: number; readonly lon: number },
): number => {
  const h =
    Math.sin(((b.lat - a.lat) * RADIANS) / 2) ** 2 +
    Math.cos(a.lat * RADIANS) *
      Math.cos(b.lat * RADIANS) *
      Math.sin(((b.lon - a.lon) * RADIANS) / 2) ** 2;
  return 2 * EARTH_MILES * Math.asin(Math.sqrt(h));
};

/** A station near a city: the station, its state and its distance. */
export interface NearStation {
  readonly station: Station;
  readonly state: StateEntry;
  readonly miles: number;
}

/** Every station with both 50% dates, with its state. */
const DATED: readonly { readonly station: Station; readonly state: StateEntry }[] = STATES.flatMap(
  (state) =>
    (STATIONS_OF[state.slug] ?? [])
      .filter(
        ({ spring, fall, year }) =>
          year !== 'always-freezing' && spring[1] !== null && fall[1] !== null,
      )
      .map((station) => ({ station, state })),
);

/** The `limit` dated stations nearest the city, nearest first, in any state. */
export const nearestOf = (city: FrostCity, limit: number): readonly NearStation[] =>
  DATED.map((each) => ({ ...each, miles: milesBetween(city, each.station) }))
    .toSorted((a, b) => a.miles - b.miles)
    .slice(0, limit);
