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
  { id: 'foods', kind: 'article', path: '/can-dogs-eat' },
  { id: 'food-strawberries', kind: 'article', path: '/can-dogs-eat-strawberries' },
  { id: 'food-bananas', kind: 'article', path: '/can-dogs-eat-bananas' },
  { id: 'food-grapes', kind: 'article', path: '/can-dogs-eat-grapes' },
  { id: 'food-raisins', kind: 'article', path: '/can-dogs-eat-raisins' },
  { id: 'food-blueberries', kind: 'article', path: '/can-dogs-eat-blueberries' },
  { id: 'food-apples', kind: 'article', path: '/can-dogs-eat-apples' },
  { id: 'food-watermelon', kind: 'article', path: '/can-dogs-eat-watermelon' },
  { id: 'food-cherries', kind: 'article', path: '/can-dogs-eat-cherries' },
  { id: 'food-mango', kind: 'article', path: '/can-dogs-eat-mango' },
  { id: 'food-oranges', kind: 'article', path: '/can-dogs-eat-oranges' },
  { id: 'food-pineapple', kind: 'article', path: '/can-dogs-eat-pineapple' },
  { id: 'food-tomatoes', kind: 'article', path: '/can-dogs-eat-tomatoes' },
  { id: 'food-avocado', kind: 'article', path: '/can-dogs-eat-avocado' },
  { id: 'food-onions', kind: 'article', path: '/can-dogs-eat-onions' },
  { id: 'food-garlic', kind: 'article', path: '/can-dogs-eat-garlic' },
  { id: 'food-carrots', kind: 'article', path: '/can-dogs-eat-carrots' },
  { id: 'food-broccoli', kind: 'article', path: '/can-dogs-eat-broccoli' },
  { id: 'food-cucumber', kind: 'article', path: '/can-dogs-eat-cucumber' },
  { id: 'food-bell-peppers', kind: 'article', path: '/can-dogs-eat-bell-peppers' },
  { id: 'food-zucchini', kind: 'article', path: '/can-dogs-eat-zucchini' },
  { id: 'food-potatoes', kind: 'article', path: '/can-dogs-eat-potatoes' },
  { id: 'food-sweet-potatoes', kind: 'article', path: '/can-dogs-eat-sweet-potatoes' },
  { id: 'food-pumpkin', kind: 'article', path: '/can-dogs-eat-pumpkin' },
  { id: 'food-cheese', kind: 'article', path: '/can-dogs-eat-cheese' },
  { id: 'food-eggs', kind: 'article', path: '/can-dogs-eat-eggs' },
  { id: 'food-yogurt', kind: 'article', path: '/can-dogs-eat-yogurt' },
  { id: 'food-shrimp', kind: 'article', path: '/can-dogs-eat-shrimp' },
  { id: 'food-salmon', kind: 'article', path: '/can-dogs-eat-salmon' },
  { id: 'food-pork', kind: 'article', path: '/can-dogs-eat-pork' },
  { id: 'food-ham', kind: 'article', path: '/can-dogs-eat-ham' },
  { id: 'food-bacon', kind: 'article', path: '/can-dogs-eat-bacon' },
  { id: 'food-peanut-butter', kind: 'article', path: '/can-dogs-eat-peanut-butter' },
  { id: 'food-honey', kind: 'article', path: '/can-dogs-eat-honey' },
  { id: 'food-chocolate', kind: 'article', path: '/can-dogs-eat-chocolate' },
  { id: 'food-rice', kind: 'article', path: '/can-dogs-eat-rice' },
  { id: 'food-popcorn', kind: 'article', path: '/can-dogs-eat-popcorn' },
  { id: 'food-bread', kind: 'article', path: '/can-dogs-eat-bread' },
  { id: 'food-almonds', kind: 'article', path: '/can-dogs-eat-almonds' },
  { id: 'food-cashews', kind: 'article', path: '/can-dogs-eat-cashews' },
  { id: 'food-macadamia-nuts', kind: 'article', path: '/can-dogs-eat-macadamia-nuts' },
  { id: 'food-xylitol-gum', kind: 'article', path: '/can-dogs-eat-xylitol-gum' },
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
