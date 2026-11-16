import { PUPPY_WEIGHT_PAGE } from './calc/puppy-weight.ts';
import { FOOD_HUB, FOOD_PAGES } from './can-dogs-eat.ts';
import { PUPPY_WEIGHT_ARTICLE } from './puppy-weight-article.ts';
import { CAT_YEARS_PAGES } from './cat-years.ts';
import { CHARTS } from './charts.ts';
import { FEED_HUB, FEED_PAGES } from './feed-by-weight.ts';
import { AGE_PAGES } from './dog-years.ts';
import { GUIDES, type PageSource } from './guides.ts';
import { FOOD_HUB_DE, FOOD_PAGES_DE } from './de/can-dogs-eat.ts';
import { HUNDEJAHRE_ARTICLE, HUNDEJAHRE_PAGE } from './de/hundejahre.ts';
import { SCHOKOLADE_GUIDE } from './de/schokolade.ts';
import { AGE_CHIEN_ARTICLE, AGE_CHIEN_PAGE } from './fr/age-chien.ts';
import { FOOD_HUB_FR, FOOD_PAGES_FR } from './fr/can-dogs-eat.ts';
import { CHOCOLAT_GUIDE } from './fr/chocolat.ts';
import { FOOD_HUB_ES, FOOD_PAGES_ES } from './es/can-dogs-eat.ts';
import { CHOCOLATE_GUIDE_ES } from './es/chocolate.ts';
import { EDAD_PERRO_ARTICLE, EDAD_PERRO_PAGE } from './es/edad-perro.ts';
import { COMIDA_PERRO_ARTICLE, COMIDA_PERRO_PAGE } from './es/comida-perro.ts';
import { CUANTO_COME } from './es/cuanto-come.ts';
import { COMIDA_GATO_ARTICLE, COMIDA_GATO_PAGE } from './es/comida-gato.ts';
import { CATS_HUB_ES, DOGS_HUB_ES, PLANT_PAGES_ES, SAFE_HUB_ES } from './es/toxic-plants.ts';
import { CATS_HUB, DOGS_HUB, PLANT_PAGES, SAFE_HUB } from './toxic-plants.ts';

/**
 * A page that carries the byline of the editorial team: its address, the day its data says its
 * figures were last checked, and the sources its sources section lists.
 */
export interface BylinePage {
  readonly path: string;
  readonly checked: string;
  readonly sources: readonly PageSource[];
}

/** Every guide and data page, each with its byline data (`site-check` holds the built pages to it). */
export const BYLINE_PAGES: readonly BylinePage[] = [
  ...GUIDES,
  ...CHARTS,
  ...AGE_PAGES,
  ...CAT_YEARS_PAGES,
  FOOD_HUB,
  ...FOOD_PAGES,
  CATS_HUB,
  DOGS_HUB,
  SAFE_HUB,
  ...PLANT_PAGES,
  FEED_HUB,
  ...FEED_PAGES,
  { path: PUPPY_WEIGHT_PAGE.path, ...PUPPY_WEIGHT_ARTICLE },
].map(({ path, checked, sources }) => ({ path, checked, sources }));

/** Every German page with a byline, credited to the German editorial policy (`site-check`). */
export const BYLINE_PAGES_DE: readonly BylinePage[] = [
  SCHOKOLADE_GUIDE,
  { path: HUNDEJAHRE_PAGE.path, ...HUNDEJAHRE_ARTICLE },
  FOOD_HUB_DE,
  ...FOOD_PAGES_DE,
].map(({ path, checked, sources }) => ({ path, checked, sources }));

/** Every French page with a byline, credited to the French editorial policy (`site-check`). */
export const BYLINE_PAGES_FR: readonly BylinePage[] = [
  CHOCOLAT_GUIDE,
  { path: AGE_CHIEN_PAGE.path, ...AGE_CHIEN_ARTICLE },
  FOOD_HUB_FR,
  ...FOOD_PAGES_FR,
].map(({ path, checked, sources }) => ({ path, checked, sources }));

/** Every Spanish page with a byline, credited to the Spanish editorial policy (`site-check`). */
export const BYLINE_PAGES_ES: readonly BylinePage[] = [
  CHOCOLATE_GUIDE_ES,
  { path: EDAD_PERRO_PAGE.path, ...EDAD_PERRO_ARTICLE },
  { path: COMIDA_PERRO_PAGE.path, ...COMIDA_PERRO_ARTICLE },
  { path: COMIDA_GATO_PAGE.path, ...COMIDA_GATO_ARTICLE },
  CUANTO_COME,
  FOOD_HUB_ES,
  ...FOOD_PAGES_ES,
  DOGS_HUB_ES,
  CATS_HUB_ES,
  SAFE_HUB_ES,
  ...PLANT_PAGES_ES,
].map(({ path, checked, sources }) => ({ path, checked, sources }));

/** The byline data of the page at `path`. */
export const bylinePageOf = (path: string): BylinePage => {
  const page = BYLINE_PAGES.find((candidate) => candidate.path === path);
  if (page === undefined) throw new Error(`no byline page ${path}`);
  return page;
};
