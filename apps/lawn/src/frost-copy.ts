import { FROST_SOURCE } from '@maestro-calc/lawn-data/frost/source';
import type { FrostPage } from './frost.ts';
import { FROST_STATES } from './frost.ts';

/** The words of the frost date pages. */
export const FROST_TEXT = {
  index: {
    title: 'Last and First Frost Dates by State and ZIP | Lawn Figures',
    description:
      'Last spring and first fall 32°F freeze dates for every state from the NOAA 1991-2020 normals, with a ZIP lookup for the nearest weather station.',
    h1: 'Last and first frost dates',
    lead: 'The last spring freeze and the first fall freeze, at 32°F, for the weather stations of every state, from the NOAA 1991-2020 climate normals. Type your ZIP to find the nearest station, or pick your state.',
    statesHeading: 'Pick your state',
    citiesHeading: 'Frost dates for big cities',
    citiesLead:
      'Some of the largest cities have a page of their own: the station nearest the city with its six dates, the stations around it, how it compares with the rest of its state, and the lawn and garden dates its extension service and the frost rules give.',
  },
  zip: {
    label: 'Your ZIP code',
    button: 'Find my station',
    hint: 'A ZIP code tabulation area is not exactly a ZIP code, so the station is the nearest to its center point.',
    invalid: 'Type a 5-digit ZIP code.',
    unknown: 'That ZIP is not in the list. Pick your state below.',
    failed: 'The lookup could not load. Pick your state below.',
    noscript: 'The ZIP lookup needs JavaScript. Pick your state below.',
  },
  columns: {
    station: 'Station',
    springHeading: 'Last spring freeze (32°F)',
    fallHeading: 'First fall freeze (32°F)',
    levels: ['10%', '50%', '90%'],
  },
  reading: [
    'Read the 50% column as the middle case: in half of the years the last spring freeze comes after that date and in half before it. For spring, the 10% date is a late one (a 10 percent chance the last freeze comes on or after it) and the 90% date an early one. For fall, the 10% date is an early one and the 90% date a late one.',
    'The dates are on a 365-day calendar with no February 29. A weather station is not your yard: hills, water and city heat move frost dates.',
  ],
  alwaysFreezing: 'Freeze risk all year; NOAA gives no dates',
} as const;

/** The title, description and heading of a state page or one part of it. */
export const frostCopyOf = (
  page: FrostPage,
): { title: string; description: string; h1: string; lead: string } => {
  const { name } = page.state;
  const part = page.parts > 1 ? ` (part ${String(page.part)} of ${String(page.parts)})` : '';
  const first = page.rows[0]?.name ?? '';
  const last = page.rows.at(-1)?.name ?? '';
  return {
    title: `Frost Dates in ${name}${part} | Lawn Figures`,
    description: `Last spring and first fall 32°F freeze dates for ${String(page.rows.length)} weather stations in ${name}${part}, from the NOAA 1991-2020 normals, with a ZIP lookup.`,
    h1: `Frost dates in ${name}${part}`,
    lead:
      page.parts > 1
        ? `Stations from ${first} to ${last}, sorted by name. The last spring and first fall 32°F freeze at three probability levels, from the NOAA 1991-2020 normals.`
        : `Every station with freeze data in ${name}, sorted by name: the last spring and first fall 32°F freeze at three probability levels, from the NOAA 1991-2020 normals.`,
  };
};

/** The source line under every frost table. */
export const FROST_FOOTNOTE = `Source: ${FROST_SOURCE.normals.name}; pulled ${FROST_SOURCE.pulled}.`;

/** The states in the order of the index. */
export const INDEX_STATES = FROST_STATES;
