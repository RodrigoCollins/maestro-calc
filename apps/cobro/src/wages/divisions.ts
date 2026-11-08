/**
 * The nine divisions of the U.S. Census Bureau ("Census Regions and Divisions of the United
 * States", `CENSUS_DIVISIONS_URL`): the neighbours a wage page compares its state with. Each lists
 * the FIPS codes of its states, DC in the South Atlantic.
 */
export interface Division {
  readonly name: Readonly<Record<'es' | 'en', string>>;
  readonly fips: readonly string[];
}

export const CENSUS_DIVISIONS_URL =
  'https://www2.census.gov/geo/pdfs/maps-data/maps/reference/us_regdiv.pdf';

const division = (en: string, es: string, fips: readonly string[]): Division => ({
  name: { en, es },
  fips,
});

export const DIVISIONS: readonly Division[] = [
  division('New England', 'Nueva Inglaterra', ['09', '23', '25', '33', '44', '50']),
  division('Middle Atlantic', 'Atlántico Medio', ['34', '36', '42']),
  division('East North Central', 'Centro Noreste', ['17', '18', '26', '39', '55']),
  division('West North Central', 'Centro Noroeste', ['19', '20', '27', '29', '31', '38', '46']),
  division('South Atlantic', 'Atlántico Sur', [
    '10',
    '11',
    '12',
    '13',
    '24',
    '37',
    '45',
    '51',
    '54',
  ]),
  division('East South Central', 'Centro Sureste', ['01', '21', '28', '47']),
  division('West South Central', 'Centro Suroeste', ['05', '22', '40', '48']),
  division('Mountain', 'Montaña', ['04', '08', '16', '30', '32', '35', '49', '56']),
  division('Pacific', 'Pacífico', ['02', '06', '15', '41', '53']),
];

/** The division of a state or DC. */
export const divisionOf = (fips: string): Division => {
  const found = DIVISIONS.find((each) => each.fips.includes(fips));
  if (found === undefined) throw new Error(`no division for ${fips}`);
  return found;
};
