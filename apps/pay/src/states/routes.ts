/*
 * The state pages and their paths, with no import at all: the browser suites of
 * `tooling/site-browser/e2e-pay` read the page list from here without the workspace install (see
 * `../long-tail/routes.ts`). The slugs are written out so a published address never moves when a
 * name is reworded; `routes.test.ts` holds them to the names of the three state tables.
 */

type Lang = 'en' | 'es';

interface Route {
  readonly id: string;
  readonly kind: 'article' | 'collection';
  readonly en: string;
  readonly es: string;
}

/** A name as a slug: accents dropped, lowercase, every other run of characters one hyphen. */
export const slugOf = (name: string): string =>
  name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const both = (en: string, es: string = en): Readonly<Record<Lang, string>> => ({ en, es });

/** The 50 states and DC in the order of the state tables: by English name. */
export const STATE_SLUGS: readonly Readonly<Record<Lang, string>>[] = [
  both('alabama'),
  both('alaska'),
  both('arizona'),
  both('arkansas'),
  both('california'),
  both('colorado'),
  both('connecticut'),
  both('delaware'),
  both('district-of-columbia', 'distrito-de-columbia'),
  both('florida'),
  both('georgia'),
  both('hawaii', 'hawai'),
  both('idaho'),
  both('illinois'),
  both('indiana'),
  both('iowa'),
  both('kansas'),
  both('kentucky'),
  both('louisiana', 'luisiana'),
  both('maine'),
  both('maryland'),
  both('massachusetts'),
  both('michigan'),
  both('minnesota'),
  both('mississippi', 'misisipi'),
  both('missouri', 'misuri'),
  both('montana'),
  both('nebraska'),
  both('nevada'),
  both('new-hampshire', 'nuevo-hampshire'),
  both('new-jersey', 'nueva-jersey'),
  both('new-mexico', 'nuevo-mexico'),
  both('new-york', 'nueva-york'),
  both('north-carolina', 'carolina-del-norte'),
  both('north-dakota', 'dakota-del-norte'),
  both('ohio'),
  both('oklahoma'),
  both('oregon'),
  both('pennsylvania', 'pensilvania'),
  both('rhode-island'),
  both('south-carolina', 'carolina-del-sur'),
  both('south-dakota', 'dakota-del-sur'),
  both('tennessee'),
  both('texas'),
  both('utah'),
  both('vermont'),
  both('virginia'),
  both('washington'),
  both('west-virginia', 'virginia-occidental'),
  both('wisconsin'),
  both('wyoming'),
];

/** The index of the state pages. */
export const STATES_INDEX_PATHS: Readonly<Record<Lang, string>> = {
  en: '/states',
  es: '/es/estados',
};

const pathOfSlug = (slug: string, lang: Lang): string => `${STATES_INDEX_PATHS[lang]}/${slug}`;

/** The page of the state named `name` in `lang`, the name as the state tables write it. */
export const statePathOf = (name: string, lang: Lang): string => {
  const slug = slugOf(name);
  if (!STATE_SLUGS.some((each) => each[lang] === slug))
    throw new Error(`no state page for ${name}`);
  return pathOfSlug(slug, lang);
};

/** One page per state and DC, in both languages. */
export const STATE_ROUTES: readonly Route[] = STATE_SLUGS.map((slug) => ({
  id: `state-${slug.en}`,
  kind: 'article',
  en: pathOfSlug(slug.en, 'en'),
  es: pathOfSlug(slug.es, 'es'),
}));

export const STATES_ROUTE: Route = { id: 'states', kind: 'collection', ...STATES_INDEX_PATHS };
