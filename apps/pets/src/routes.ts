/** What a page is to search engines and link previews: the home, a calculator or an article. */
export type PageKind = 'home' | 'calculator' | 'article';

/** A page of Bowl Figures: its id, its kind and its address (English only at launch, plans/pets/PLAN.md). */
export interface Route {
  readonly id: string;
  readonly kind: PageKind;
  readonly path: string;
}

/** The page files of `src/pages` (the 404 is not a route), in the order of the site. */
export const ROUTES: readonly Route[] = [
  { id: 'home', kind: 'home', path: '/' },
  { id: 'dog', kind: 'calculator', path: '/dog-food-calculator' },
  { id: 'cat', kind: 'calculator', path: '/cat-food-calculator' },
  { id: 'puppy', kind: 'calculator', path: '/puppy-feeding-calculator' },
  { id: 'kitten', kind: 'calculator', path: '/kitten-feeding-calculator' },
  { id: 'chocolate', kind: 'calculator', path: '/dog-chocolate-toxicity-calculator' },
  { id: 'due-date', kind: 'calculator', path: '/dog-pregnancy-calculator' },
  { id: 'dog-age', kind: 'calculator', path: '/dog-age-calculator' },
  { id: 'charts', kind: 'article', path: '/charts' },
  { id: 'dog-chart', kind: 'article', path: '/dog-feeding-chart' },
  { id: 'puppy-chart', kind: 'article', path: '/puppy-feeding-chart' },
  { id: 'chocolate-chart', kind: 'article', path: '/dog-chocolate-toxicity-chart' },
  { id: 'dog-age-chart', kind: 'article', path: '/dog-age-chart' },
  { id: 'label-guide', kind: 'article', path: '/how-to-read-pet-food-label' },
  { id: 'breed-guide', kind: 'article', path: '/dog-food-by-breed' },
  { id: 'chocolate-guide', kind: 'article', path: '/my-dog-ate-chocolate' },
  { id: 'dog-years-1', kind: 'article', path: '/1-year-in-dog-years' },
  { id: 'dog-years-2', kind: 'article', path: '/2-years-in-dog-years' },
  { id: 'dog-years-3', kind: 'article', path: '/3-years-in-dog-years' },
  { id: 'dog-years-4', kind: 'article', path: '/4-years-in-dog-years' },
  { id: 'dog-years-5', kind: 'article', path: '/5-years-in-dog-years' },
  { id: 'dog-years-6', kind: 'article', path: '/6-years-in-dog-years' },
  { id: 'dog-years-7', kind: 'article', path: '/7-years-in-dog-years' },
  { id: 'dog-years-8', kind: 'article', path: '/8-years-in-dog-years' },
  { id: 'dog-years-9', kind: 'article', path: '/9-years-in-dog-years' },
  { id: 'dog-years-10', kind: 'article', path: '/10-years-in-dog-years' },
  { id: 'dog-years-11', kind: 'article', path: '/11-years-in-dog-years' },
  { id: 'dog-years-12', kind: 'article', path: '/12-years-in-dog-years' },
  { id: 'dog-years-13', kind: 'article', path: '/13-years-in-dog-years' },
  { id: 'dog-years-14', kind: 'article', path: '/14-years-in-dog-years' },
  { id: 'dog-years-15', kind: 'article', path: '/15-years-in-dog-years' },
  { id: 'dog-years-16', kind: 'article', path: '/16-years-in-dog-years' },
  { id: 'methodology', kind: 'article', path: '/methodology' },
  { id: 'about', kind: 'article', path: '/about' },
  { id: 'editorial', kind: 'article', path: '/editorial-policy' },
  { id: 'privacy', kind: 'article', path: '/privacy' },
];

/** The route of an address, or `undefined` (the 404). */
export const routeOf = (path: string, routes: readonly Route[] = ROUTES): Route | undefined =>
  routes.find((route) => route.path === path);

/** The address of route `id`. */
export const hrefOf = (id: string): string => {
  const route = ROUTES.find((candidate) => candidate.id === id);
  if (route === undefined) throw new Error(`no route ${id}`);
  return route.path;
};
