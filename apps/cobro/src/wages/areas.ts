/** A state or DC: its FIPS code (the BLS area code), its names and its page slugs in each language. */
export interface Area {
  readonly fips: string;
  readonly name: Readonly<Record<'es' | 'en', string>>;
  readonly slug: Readonly<Record<'es' | 'en', string>>;
}

/** A name as a slug: accents dropped, lowercase, every other run of characters one hyphen. */
export const slugOf = (name: string): string =>
  name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const area = (fips: string, en: string, es: string = en): Area => ({
  fips,
  name: { en, es },
  slug: { en: slugOf(en), es: slugOf(es) },
});

/** The 50 states and DC in the order of their FIPS codes. */
export const AREAS: readonly Area[] = [
  area('01', 'Alabama'),
  area('02', 'Alaska'),
  area('04', 'Arizona'),
  area('05', 'Arkansas'),
  area('06', 'California'),
  area('08', 'Colorado'),
  area('09', 'Connecticut'),
  area('10', 'Delaware'),
  area('11', 'District of Columbia', 'Distrito de Columbia'),
  area('12', 'Florida'),
  area('13', 'Georgia'),
  area('15', 'Hawaii', 'Hawái'),
  area('16', 'Idaho'),
  area('17', 'Illinois'),
  area('18', 'Indiana'),
  area('19', 'Iowa'),
  area('20', 'Kansas'),
  area('21', 'Kentucky'),
  area('22', 'Louisiana', 'Luisiana'),
  area('23', 'Maine'),
  area('24', 'Maryland'),
  area('25', 'Massachusetts'),
  area('26', 'Michigan'),
  area('27', 'Minnesota'),
  area('28', 'Mississippi', 'Misisipi'),
  area('29', 'Missouri', 'Misuri'),
  area('30', 'Montana'),
  area('31', 'Nebraska'),
  area('32', 'Nevada'),
  area('33', 'New Hampshire', 'Nuevo Hampshire'),
  area('34', 'New Jersey', 'Nueva Jersey'),
  area('35', 'New Mexico', 'Nuevo México'),
  area('36', 'New York', 'Nueva York'),
  area('37', 'North Carolina', 'Carolina del Norte'),
  area('38', 'North Dakota', 'Dakota del Norte'),
  area('39', 'Ohio'),
  area('40', 'Oklahoma'),
  area('41', 'Oregon'),
  area('42', 'Pennsylvania', 'Pensilvania'),
  area('44', 'Rhode Island'),
  area('45', 'South Carolina', 'Carolina del Sur'),
  area('46', 'South Dakota', 'Dakota del Sur'),
  area('47', 'Tennessee'),
  area('48', 'Texas'),
  area('49', 'Utah'),
  area('50', 'Vermont'),
  area('51', 'Virginia'),
  area('53', 'Washington'),
  area('54', 'West Virginia', 'Virginia Occidental'),
  area('55', 'Wisconsin'),
  area('56', 'Wyoming'),
];
