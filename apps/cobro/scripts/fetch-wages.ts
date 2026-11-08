// Rebuilds `src/wages/oews-2025.ts` (numbers only) from the BLS Public Data API, version 1: no key,
// 25 requests a day of 25 series each. One run asks 22 times: the hourly mean and median of 5
// occupations in 51 states and the nation. The direct file downloads of bls.gov refuse scripted
// requests, so the API is the reproducible channel. Rerun it after each May release (and update
// `OEWS_RELEASE` in `src/wages/series.ts`).
// Usage: node apps/cobro/scripts/fetch-wages.ts
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { AREAS } from '../src/wages/areas.ts';
import { OCCUPATIONS } from '../src/wages/occupations.ts';
import { seriesIdOf, wagesModule } from '../src/wages/series.ts';

const ENDPOINT = 'https://api.bls.gov/publicAPI/v1/timeseries/data/';
const BATCH = 25;
const YEAR = '2025';

interface Answer {
  readonly Results?: {
    readonly series?: readonly {
      readonly seriesID: string;
      readonly data: readonly { year: string; period: string; value: string }[];
    }[];
  };
}

const ids = OCCUPATIONS.flatMap(({ soc }) =>
  ['US', ...AREAS.map(({ fips }) => fips)].flatMap((area) => [
    seriesIdOf(area, soc, 'mean'),
    seriesIdOf(area, soc, 'median'),
  ]),
);

const readings = new Map<string, number>();
for (let at = 0; at < ids.length; at += BATCH) {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ seriesid: ids.slice(at, at + BATCH) }),
  });
  const body = (await response.json()) as Answer;
  if (body.Results?.series === undefined) {
    throw new Error(`BLS answered: ${JSON.stringify(body).slice(0, 300)}`);
  }
  for (const { seriesID, data } of body.Results.series) {
    const point = data.find(({ year, period }) => year === YEAR && period === 'A01');
    const value = point === undefined ? Number.NaN : Number(point.value);
    if (Number.isFinite(value)) readings.set(seriesID, value);
  }
  console.log(`fetched ${String(Math.min(at + BATCH, ids.length))} of ${String(ids.length)} series`);
}
writeFileSync(join(import.meta.dirname, '../src/wages/oews-2025.ts'), wagesModule(readings));
console.log(`wrote ${String(readings.size)} readings`);
