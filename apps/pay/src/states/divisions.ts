import type { GuideSource } from '../guide/texts.ts';
import type { Lang } from '../time-card/receipt.ts';

/*
 * The nine divisions of the U.S. Census Bureau ("Census Regions and Divisions of the United
 * States", `CENSUS_DIVISIONS`): the neighbours a state page compares its state with, as the wage
 * pages of Cuánto Le Cobro do (`apps/cobro/src/wages/divisions.ts`). Each lists its states by
 * their English name in the state tables, DC in the South Atlantic.
 */

export interface Division {
  readonly name: Readonly<Record<Lang, string>>;
  readonly states: readonly string[];
}

export const CENSUS_DIVISIONS: GuideSource = {
  label: 'U.S. Census Bureau, Census Regions and Divisions of the United States',
  href: 'https://www2.census.gov/geo/pdfs/maps-data/maps/reference/us_regdiv.pdf',
};

const division = (en: string, es: string, states: readonly string[]): Division => ({
  name: { en, es },
  states,
});

export const DIVISIONS: readonly Division[] = [
  division('New England', 'Nueva Inglaterra', [
    'Connecticut',
    'Maine',
    'Massachusetts',
    'New Hampshire',
    'Rhode Island',
    'Vermont',
  ]),
  division('Middle Atlantic', 'Atlántico Medio', ['New Jersey', 'New York', 'Pennsylvania']),
  division('East North Central', 'Centro Noreste', [
    'Illinois',
    'Indiana',
    'Michigan',
    'Ohio',
    'Wisconsin',
  ]),
  division('West North Central', 'Centro Noroeste', [
    'Iowa',
    'Kansas',
    'Minnesota',
    'Missouri',
    'Nebraska',
    'North Dakota',
    'South Dakota',
  ]),
  division('South Atlantic', 'Atlántico Sur', [
    'Delaware',
    'District of Columbia',
    'Florida',
    'Georgia',
    'Maryland',
    'North Carolina',
    'South Carolina',
    'Virginia',
    'West Virginia',
  ]),
  division('East South Central', 'Centro Sureste', [
    'Alabama',
    'Kentucky',
    'Mississippi',
    'Tennessee',
  ]),
  division('West South Central', 'Centro Suroeste', ['Arkansas', 'Louisiana', 'Oklahoma', 'Texas']),
  division('Mountain', 'Montaña', [
    'Arizona',
    'Colorado',
    'Idaho',
    'Montana',
    'Nevada',
    'New Mexico',
    'Utah',
    'Wyoming',
  ]),
  division('Pacific', 'Pacífico', ['Alaska', 'California', 'Hawaii', 'Oregon', 'Washington']),
];

/** The division of a state or DC, by its English name. */
export const divisionOf = (name: string): Division => {
  const found = DIVISIONS.find(({ states }) => states.includes(name));
  if (found === undefined) throw new Error(`no division for ${name}`);
  return found;
};
