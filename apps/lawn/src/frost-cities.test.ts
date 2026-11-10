import { describe, expect, it } from 'vitest';
import { cityAt, cityPathOf, FROST_CITIES, milesBetween, nearestOf } from './frost-cities.ts';

describe('frost cities', () => {
  it('lists the 22 cities by slug, each at its 2020 Census internal point', () => {
    expect(FROST_CITIES.map(({ slug }) => slug)).toEqual([
      'chicago-il',
      'new-york-ny',
      'seattle-wa',
      'raleigh-nc',
      'dallas-tx',
      'houston-tx',
      'atlanta-ga',
      'philadelphia-pa',
      'phoenix-az',
      'detroit-mi',
      'denver-co',
      'baltimore-md',
      'st-louis-mo',
      'charlotte-nc',
      'austin-tx',
      'pittsburgh-pa',
      'columbus-oh',
      'indianapolis-in',
      'nashville-tn',
      'milwaukee-wi',
      'kansas-city-mo',
      'richmond-va',
    ]);
    // 2020_Gaz_place_national.txt: IL 1714000 Chicago city 41.837045 -87.684939
    expect(cityAt('chicago-il')).toMatchObject({
      name: 'Chicago',
      code: 'IL',
      geoid: '1714000',
      lat: 41.837045,
      lon: -87.684939,
    });
    expect(cityPathOf('chicago-il')).toBe('/last-frost-date/chicago-il');
    expect(() => cityAt('nope')).toThrow('no frost city nope');
  });

  it('measures haversine miles', () => {
    // one degree of latitude is 69.1 miles on a 3,958.8-mile sphere
    expect(milesBetween({ lat: 40, lon: -80 }, { lat: 41, lon: -80 })).toBeCloseTo(69.09, 1);
    expect(milesBetween({ lat: 40, lon: -80 }, { lat: 40, lon: -80 })).toBe(0);
  });

  it('finds the nearest NOAA stations with dates, across state lines', () => {
    const chicago = nearestOf(cityAt('chicago-il'), 3);
    // CHICAGO NORTHERLY IS (41.8558, -87.6094 in illinois.ts) is 4.1 miles from the Census point
    expect(chicago.map(({ station }) => station.id)).toEqual([
      'USC00111550',
      'USW00014819',
      'USC00111577',
    ]);
    expect(chicago[0]?.miles).toBeCloseTo(4.1, 1);
    expect(chicago[0]?.state.slug).toBe('illinois');
    // Philadelphia: the second nearest is across the river in New Jersey
    expect(nearestOf(cityAt('philadelphia-pa'), 2).map(({ state }) => state.code)).toEqual([
      'PA',
      'NJ',
    ]);
    // Denver: the old Stapleton airport station, 0.6 miles away
    expect(nearestOf(cityAt('denver-co'), 1)[0]?.station.name).toBe('DENVER-STAPLETON');
  });

  it('has a dated nearest station within 10 miles of every city', () => {
    for (const city of FROST_CITIES) {
      const [nearest] = nearestOf(city, 1);
      expect(nearest, city.slug).toBeDefined();
      expect(nearest?.miles ?? 99, city.slug).toBeLessThan(10);
    }
  });
});
