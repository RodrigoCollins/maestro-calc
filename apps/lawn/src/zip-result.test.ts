import { describe, expect, it } from 'vitest';
import { dateText, titleCase } from './frost-text.ts';
import { zipResultOf, type StateData } from './zip-result.ts';

const data: StateData = {
  name: 'Indiana',
  stations: {
    // NOAA normals, LAFAYETTE PURDUE UNIV AP (USW00014835), by hand from its station file:
    // spring 05/14, 04/26, 04/11 and fall 10/04, 10/18, 10/31 (days 134, 116, 101 and 277, 291, 304)
    USW00014835: [1, 'LAFAYETTE PURDUE UNIV AP', 134, 116, 101, 277, 291, 304],
    USW00099999: [2, 'COLD PLACE', null, null, null, null, null, null],
  },
};
const text = { dateText, titleCase };

describe('zipResultOf', () => {
  it('names the nearest station, its distance and its six dates', () => {
    const result = zipResultOf(
      '47906',
      { stationId: 'USW00014835', stationState: 'indiana', miles: 4 },
      data,
      text,
    );
    expect(result).toEqual({
      text: 'Nearest station to 47906: Lafayette Purdue Univ AP, Indiana, 4 miles away. Last spring freeze (32°F) at 10%, 50%, 90%: May 14, Apr 26, Apr 11. First fall freeze: Oct 4, Oct 18, Oct 31.',
      href: '/frost-dates/indiana#USW00014835',
      linkLabel: 'See its row',
    });
  });

  it('says one mile in the singular and links a later part of the state', () => {
    const result = zipResultOf(
      '47906',
      { stationId: 'USW00099999', stationState: 'indiana', miles: 1 },
      data,
      text,
    );
    expect(result?.text).toContain('1 mile away. NOAA flags it with freeze risk all year');
    expect(result?.href).toBe('/frost-dates/indiana/2#USW00099999');
  });

  it('gives nothing for a station the state file does not hold', () => {
    expect(
      zipResultOf('47906', { stationId: 'NOPE', stationState: 'indiana', miles: 4 }, data, text),
    ).toBeUndefined();
  });
});
