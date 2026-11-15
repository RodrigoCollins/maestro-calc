/** What a page is to search engines and link previews: the home, a calculator or an article. */
export type PageKind = 'home' | 'calculator' | 'article';

/** The languages of Bowl Figures: English, and German under `/de` (plans/growth/BACKLOG.md #50). */
export type Lang = 'en' | 'de';

/**
 * A page of Bowl Figures: its id, its kind, its English address and, once it is written, its
 * German twin. A German page is never a word-for-word translation of its English twin: it answers
 * the same question with the same facts, for a German reader.
 */
export interface Route {
  readonly id: string;
  readonly kind: PageKind;
  readonly path: string;
  readonly de?: string;
}

/** The page files of `src/pages` (the 404 is not a route), in the order of the site. */
export const ROUTES: readonly Route[] = [
  { id: 'home', kind: 'home', path: '/', de: '/de' },
  { id: 'dog', kind: 'calculator', path: '/dog-food-calculator' },
  { id: 'cat', kind: 'calculator', path: '/cat-food-calculator' },
  { id: 'puppy', kind: 'calculator', path: '/puppy-feeding-calculator' },
  { id: 'kitten', kind: 'calculator', path: '/kitten-feeding-calculator' },
  { id: 'chocolate', kind: 'calculator', path: '/dog-chocolate-toxicity-calculator' },
  { id: 'due-date', kind: 'calculator', path: '/dog-pregnancy-calculator' },
  { id: 'dog-age', kind: 'calculator', path: '/dog-age-calculator', de: '/de/hundejahre-rechner' },
  { id: 'cat-age', kind: 'calculator', path: '/cat-age-calculator' },
  { id: 'puppy-weight', kind: 'calculator', path: '/puppy-weight-calculator' },
  { id: 'charts', kind: 'article', path: '/charts' },
  { id: 'dog-chart', kind: 'article', path: '/dog-feeding-chart' },
  { id: 'puppy-chart', kind: 'article', path: '/puppy-feeding-chart' },
  { id: 'chocolate-chart', kind: 'article', path: '/dog-chocolate-toxicity-chart' },
  { id: 'dog-age-chart', kind: 'article', path: '/dog-age-chart' },
  { id: 'cat-age-chart', kind: 'article', path: '/cat-age-chart' },
  { id: 'cat-chart', kind: 'article', path: '/cat-feeding-chart' },
  { id: 'label-guide', kind: 'article', path: '/how-to-read-pet-food-label' },
  { id: 'breed-guide', kind: 'article', path: '/dog-food-by-breed' },
  {
    id: 'chocolate-guide',
    kind: 'article',
    path: '/my-dog-ate-chocolate',
    de: '/de/hund-hat-schokolade-gefressen',
  },
  { id: 'cat-growth-guide', kind: 'article', path: '/when-do-cats-stop-growing' },
  { id: 'dog-heat-guide', kind: 'article', path: '/dog-in-heat' },
  { id: 'feed', kind: 'article', path: '/how-much-should-i-feed-my-dog' },
  { id: 'feed-10', kind: 'article', path: '/how-much-to-feed-a-10-lb-dog' },
  { id: 'feed-15', kind: 'article', path: '/how-much-to-feed-a-15-lb-dog' },
  { id: 'feed-20', kind: 'article', path: '/how-much-to-feed-a-20-lb-dog' },
  { id: 'feed-25', kind: 'article', path: '/how-much-to-feed-a-25-lb-dog' },
  { id: 'feed-30', kind: 'article', path: '/how-much-to-feed-a-30-lb-dog' },
  { id: 'feed-40', kind: 'article', path: '/how-much-to-feed-a-40-lb-dog' },
  { id: 'feed-50', kind: 'article', path: '/how-much-to-feed-a-50-lb-dog' },
  { id: 'feed-60', kind: 'article', path: '/how-much-to-feed-a-60-lb-dog' },
  { id: 'feed-70', kind: 'article', path: '/how-much-to-feed-a-70-lb-dog' },
  { id: 'feed-80', kind: 'article', path: '/how-much-to-feed-an-80-lb-dog' },
  { id: 'feed-100', kind: 'article', path: '/how-much-to-feed-a-100-lb-dog' },
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
  { id: 'cat-years-1', kind: 'article', path: '/1-year-in-cat-years' },
  { id: 'cat-years-2', kind: 'article', path: '/2-years-in-cat-years' },
  { id: 'cat-years-3', kind: 'article', path: '/3-years-in-cat-years' },
  { id: 'cat-years-4', kind: 'article', path: '/4-years-in-cat-years' },
  { id: 'cat-years-5', kind: 'article', path: '/5-years-in-cat-years' },
  { id: 'cat-years-6', kind: 'article', path: '/6-years-in-cat-years' },
  { id: 'cat-years-7', kind: 'article', path: '/7-years-in-cat-years' },
  { id: 'cat-years-8', kind: 'article', path: '/8-years-in-cat-years' },
  { id: 'cat-years-9', kind: 'article', path: '/9-years-in-cat-years' },
  { id: 'cat-years-10', kind: 'article', path: '/10-years-in-cat-years' },
  { id: 'cat-years-11', kind: 'article', path: '/11-years-in-cat-years' },
  { id: 'cat-years-12', kind: 'article', path: '/12-years-in-cat-years' },
  { id: 'cat-years-13', kind: 'article', path: '/13-years-in-cat-years' },
  { id: 'cat-years-14', kind: 'article', path: '/14-years-in-cat-years' },
  { id: 'cat-years-15', kind: 'article', path: '/15-years-in-cat-years' },
  { id: 'cat-years-16', kind: 'article', path: '/16-years-in-cat-years' },
  { id: 'cat-years-17', kind: 'article', path: '/17-years-in-cat-years' },
  { id: 'cat-years-18', kind: 'article', path: '/18-years-in-cat-years' },
  { id: 'cat-years-19', kind: 'article', path: '/19-years-in-cat-years' },
  { id: 'cat-years-20', kind: 'article', path: '/20-years-in-cat-years' },
  { id: 'foods', kind: 'article', path: '/can-dogs-eat', de: '/de/was-duerfen-hunde-essen' },
  {
    id: 'food-strawberries',
    kind: 'article',
    path: '/can-dogs-eat-strawberries',
    de: '/de/duerfen-hunde-erdbeeren-essen',
  },
  {
    id: 'food-bananas',
    kind: 'article',
    path: '/can-dogs-eat-bananas',
    de: '/de/duerfen-hunde-bananen-essen',
  },
  {
    id: 'food-grapes',
    kind: 'article',
    path: '/can-dogs-eat-grapes',
    de: '/de/duerfen-hunde-weintrauben-essen',
  },
  { id: 'food-raisins', kind: 'article', path: '/can-dogs-eat-raisins' },
  {
    id: 'food-blueberries',
    kind: 'article',
    path: '/can-dogs-eat-blueberries',
    de: '/de/duerfen-hunde-blaubeeren-essen',
  },
  {
    id: 'food-apples',
    kind: 'article',
    path: '/can-dogs-eat-apples',
    de: '/de/duerfen-hunde-aepfel-essen',
  },
  {
    id: 'food-watermelon',
    kind: 'article',
    path: '/can-dogs-eat-watermelon',
    de: '/de/duerfen-hunde-wassermelone-essen',
  },
  { id: 'food-cherries', kind: 'article', path: '/can-dogs-eat-cherries' },
  {
    id: 'food-mango',
    kind: 'article',
    path: '/can-dogs-eat-mango',
    de: '/de/duerfen-hunde-mango-essen',
  },
  { id: 'food-oranges', kind: 'article', path: '/can-dogs-eat-oranges' },
  {
    id: 'food-pineapple',
    kind: 'article',
    path: '/can-dogs-eat-pineapple',
    de: '/de/duerfen-hunde-ananas-essen',
  },
  {
    id: 'food-tomatoes',
    kind: 'article',
    path: '/can-dogs-eat-tomatoes',
    de: '/de/duerfen-hunde-tomaten-essen',
  },
  { id: 'food-avocado', kind: 'article', path: '/can-dogs-eat-avocado' },
  { id: 'food-onions', kind: 'article', path: '/can-dogs-eat-onions' },
  { id: 'food-garlic', kind: 'article', path: '/can-dogs-eat-garlic' },
  { id: 'food-carrots', kind: 'article', path: '/can-dogs-eat-carrots' },
  { id: 'food-broccoli', kind: 'article', path: '/can-dogs-eat-broccoli' },
  {
    id: 'food-cucumber',
    kind: 'article',
    path: '/can-dogs-eat-cucumber',
    de: '/de/duerfen-hunde-gurken-essen',
  },
  {
    id: 'food-bell-peppers',
    kind: 'article',
    path: '/can-dogs-eat-bell-peppers',
    de: '/de/duerfen-hunde-paprika-essen',
  },
  { id: 'food-zucchini', kind: 'article', path: '/can-dogs-eat-zucchini' },
  { id: 'food-potatoes', kind: 'article', path: '/can-dogs-eat-potatoes' },
  { id: 'food-sweet-potatoes', kind: 'article', path: '/can-dogs-eat-sweet-potatoes' },
  { id: 'food-pumpkin', kind: 'article', path: '/can-dogs-eat-pumpkin' },
  {
    id: 'food-cheese',
    kind: 'article',
    path: '/can-dogs-eat-cheese',
    de: '/de/duerfen-hunde-kaese-essen',
  },
  { id: 'food-eggs', kind: 'article', path: '/can-dogs-eat-eggs' },
  { id: 'food-yogurt', kind: 'article', path: '/can-dogs-eat-yogurt' },
  { id: 'food-shrimp', kind: 'article', path: '/can-dogs-eat-shrimp' },
  { id: 'food-salmon', kind: 'article', path: '/can-dogs-eat-salmon' },
  { id: 'food-pork', kind: 'article', path: '/can-dogs-eat-pork' },
  { id: 'food-ham', kind: 'article', path: '/can-dogs-eat-ham' },
  { id: 'food-bacon', kind: 'article', path: '/can-dogs-eat-bacon' },
  { id: 'food-peanut-butter', kind: 'article', path: '/can-dogs-eat-peanut-butter' },
  { id: 'food-honey', kind: 'article', path: '/can-dogs-eat-honey' },
  {
    id: 'food-chocolate',
    kind: 'article',
    path: '/can-dogs-eat-chocolate',
    de: '/de/duerfen-hunde-schokolade-essen',
  },
  { id: 'food-rice', kind: 'article', path: '/can-dogs-eat-rice' },
  { id: 'food-popcorn', kind: 'article', path: '/can-dogs-eat-popcorn' },
  { id: 'food-bread', kind: 'article', path: '/can-dogs-eat-bread' },
  { id: 'food-almonds', kind: 'article', path: '/can-dogs-eat-almonds' },
  { id: 'food-cashews', kind: 'article', path: '/can-dogs-eat-cashews' },
  { id: 'food-macadamia-nuts', kind: 'article', path: '/can-dogs-eat-macadamia-nuts' },
  { id: 'food-xylitol-gum', kind: 'article', path: '/can-dogs-eat-xylitol-gum' },
  { id: 'plants-cats', kind: 'article', path: '/plants-toxic-to-cats' },
  { id: 'plants-dogs', kind: 'article', path: '/plants-toxic-to-dogs' },
  { id: 'plants-safe', kind: 'article', path: '/pet-safe-houseplants' },
  { id: 'plant-pothos', kind: 'article', path: '/is-pothos-toxic-to-cats-and-dogs' },
  { id: 'plant-snake-plants', kind: 'article', path: '/are-snake-plants-toxic-to-cats-and-dogs' },
  { id: 'plant-monstera', kind: 'article', path: '/is-monstera-toxic-to-cats-and-dogs' },
  { id: 'plant-aloe-vera', kind: 'article', path: '/is-aloe-vera-toxic-to-cats-and-dogs' },
  { id: 'plant-peace-lilies', kind: 'article', path: '/are-peace-lilies-toxic-to-cats-and-dogs' },
  { id: 'plant-jade-plants', kind: 'article', path: '/are-jade-plants-toxic-to-cats-and-dogs' },
  { id: 'plant-philodendrons', kind: 'article', path: '/are-philodendrons-toxic-to-cats-and-dogs' },
  { id: 'plant-dieffenbachia', kind: 'article', path: '/is-dieffenbachia-toxic-to-cats-and-dogs' },
  { id: 'plant-dracaena', kind: 'article', path: '/is-dracaena-toxic-to-cats-and-dogs' },
  { id: 'plant-english-ivy', kind: 'article', path: '/is-english-ivy-toxic-to-cats-and-dogs' },
  { id: 'plant-kalanchoe', kind: 'article', path: '/is-kalanchoe-toxic-to-cats-and-dogs' },
  { id: 'plant-begonias', kind: 'article', path: '/are-begonias-toxic-to-cats-and-dogs' },
  { id: 'plant-cyclamen', kind: 'article', path: '/is-cyclamen-toxic-to-cats-and-dogs' },
  { id: 'plant-lilies', kind: 'article', path: '/are-lilies-toxic-to-cats-and-dogs' },
  { id: 'plant-tulips', kind: 'article', path: '/are-tulips-toxic-to-cats-and-dogs' },
  { id: 'plant-daffodils', kind: 'article', path: '/are-daffodils-toxic-to-cats-and-dogs' },
  { id: 'plant-hyacinths', kind: 'article', path: '/are-hyacinths-toxic-to-cats-and-dogs' },
  {
    id: 'plant-chrysanthemums',
    kind: 'article',
    path: '/are-chrysanthemums-toxic-to-cats-and-dogs',
  },
  { id: 'plant-daisies', kind: 'article', path: '/are-daisies-toxic-to-cats-and-dogs' },
  { id: 'plant-carnations', kind: 'article', path: '/are-carnations-toxic-to-cats-and-dogs' },
  { id: 'plant-calla-lilies', kind: 'article', path: '/are-calla-lilies-toxic-to-cats-and-dogs' },
  { id: 'plant-amaryllis', kind: 'article', path: '/is-amaryllis-toxic-to-cats-and-dogs' },
  { id: 'plant-peonies', kind: 'article', path: '/are-peonies-toxic-to-cats-and-dogs' },
  { id: 'plant-poinsettias', kind: 'article', path: '/are-poinsettias-toxic-to-cats-and-dogs' },
  { id: 'plant-holly', kind: 'article', path: '/is-holly-toxic-to-cats-and-dogs' },
  { id: 'plant-mistletoe', kind: 'article', path: '/is-mistletoe-toxic-to-cats-and-dogs' },
  { id: 'plant-sago-palms', kind: 'article', path: '/are-sago-palms-toxic-to-cats-and-dogs' },
  { id: 'plant-oleander', kind: 'article', path: '/is-oleander-toxic-to-cats-and-dogs' },
  { id: 'plant-foxglove', kind: 'article', path: '/is-foxglove-toxic-to-cats-and-dogs' },
  {
    id: 'plant-lily-of-the-valley',
    kind: 'article',
    path: '/is-lily-of-the-valley-toxic-to-cats-and-dogs',
  },
  { id: 'plant-azaleas', kind: 'article', path: '/are-azaleas-toxic-to-cats-and-dogs' },
  { id: 'plant-hydrangeas', kind: 'article', path: '/are-hydrangeas-toxic-to-cats-and-dogs' },
  { id: 'plant-geraniums', kind: 'article', path: '/are-geraniums-toxic-to-cats-and-dogs' },
  { id: 'plant-lavender', kind: 'article', path: '/is-lavender-toxic-to-cats-and-dogs' },
  { id: 'plant-mint', kind: 'article', path: '/is-mint-toxic-to-cats-and-dogs' },
  { id: 'plant-eucalyptus', kind: 'article', path: '/is-eucalyptus-toxic-to-cats-and-dogs' },
  { id: 'plant-catnip', kind: 'article', path: '/is-catnip-toxic-to-cats-and-dogs' },
  { id: 'plant-tomato-plants', kind: 'article', path: '/are-tomato-plants-toxic-to-cats-and-dogs' },
  { id: 'plant-spider-plants', kind: 'article', path: '/are-spider-plants-toxic-to-cats-and-dogs' },
  {
    id: 'plant-christmas-cactus',
    kind: 'article',
    path: '/is-christmas-cactus-toxic-to-cats-and-dogs',
  },
  { id: 'plant-money-trees', kind: 'article', path: '/are-money-trees-toxic-to-cats-and-dogs' },
  { id: 'plant-roses', kind: 'article', path: '/are-roses-toxic-to-cats-and-dogs' },
  { id: 'plant-sunflowers', kind: 'article', path: '/are-sunflowers-toxic-to-cats-and-dogs' },
  { id: 'plant-orchids', kind: 'article', path: '/are-orchids-toxic-to-cats-and-dogs' },
  { id: 'plant-basil', kind: 'article', path: '/is-basil-toxic-to-cats-and-dogs' },
  { id: 'plant-rosemary', kind: 'article', path: '/is-rosemary-toxic-to-cats-and-dogs' },
  { id: 'plant-bamboo', kind: 'article', path: '/is-bamboo-toxic-to-cats-and-dogs' },
  { id: 'plant-calathea', kind: 'article', path: '/is-calathea-toxic-to-cats-and-dogs' },
  { id: 'plant-babys-breath', kind: 'article', path: '/is-babys-breath-toxic-to-cats-and-dogs' },
  {
    id: 'plant-african-violets',
    kind: 'article',
    path: '/are-african-violets-toxic-to-cats-and-dogs',
  },
  { id: 'plant-boston-ferns', kind: 'article', path: '/are-boston-ferns-toxic-to-cats-and-dogs' },
  { id: 'plant-hibiscus', kind: 'article', path: '/is-hibiscus-toxic-to-cats-and-dogs' },
  { id: 'methodology', kind: 'article', path: '/methodology' },
  { id: 'about', kind: 'article', path: '/about', de: '/de/ueber-uns' },
  {
    id: 'editorial',
    kind: 'article',
    path: '/editorial-policy',
    de: '/de/redaktionelle-grundsaetze',
  },
  { id: 'privacy', kind: 'article', path: '/privacy', de: '/de/datenschutz' },
];

/** The addresses of a route: the English page, then its German twin when it has one. */
export const pathsOf = ({ path, de }: Route): string[] => (de === undefined ? [path] : [path, de]);

/** The route of an address in either language, or `undefined` (the 404). */
export const routeOf = (path: string, routes: readonly Route[] = ROUTES): Route | undefined =>
  routes.find((route) => route.path === path || route.de === path);

/** The language of an address: `/de` and every page below it are German. */
export const langOf = (path: string): Lang =>
  path === '/de' || path.startsWith('/de/') ? 'de' : 'en';

/**
 * The address of route `id` in `lang`. A German page that links a page with no German twin links
 * the English page on purpose, with `hrefOf(id)`, and says so in its label.
 */
export const hrefOf = (id: string, lang: Lang = 'en'): string => {
  const route = ROUTES.find((candidate) => candidate.id === id);
  if (route === undefined) throw new Error(`no route ${id}`);
  if (lang === 'en') return route.path;
  if (route.de === undefined) throw new Error(`no German page for ${id}`);
  return route.de;
};
