import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { hrefOf, routeOf, ROUTES } from './routes.ts';

const pagesDir = resolve(import.meta.dirname, 'pages');

/** The canonical path of every page source file. */
const sourcePaths = (): string[] =>
  readdirSync(pagesDir, { withFileTypes: true }).flatMap((entry) => {
    if (!entry.name.endsWith('.astro') || entry.name === '404.astro') return [];
    const name = entry.name.replace(/\.astro$/, '');
    return [name === 'index' ? '/' : `/${name}`];
  });

describe('ROUTES', () => {
  // a published URL is a public contract: every slug is written out, so a changed one fails here
  it('pins the address of every page', () => {
    expect(ROUTES.map(({ id, path }) => [id, path])).toEqual([
      ['home', '/'],
      ['dog', '/dog-food-calculator'],
      ['cat', '/cat-food-calculator'],
      ['puppy', '/puppy-feeding-calculator'],
      ['kitten', '/kitten-feeding-calculator'],
      ['chocolate', '/dog-chocolate-toxicity-calculator'],
      ['due-date', '/dog-pregnancy-calculator'],
      ['dog-age', '/dog-age-calculator'],
      ['cat-age', '/cat-age-calculator'],
      ['charts', '/charts'],
      ['dog-chart', '/dog-feeding-chart'],
      ['puppy-chart', '/puppy-feeding-chart'],
      ['chocolate-chart', '/dog-chocolate-toxicity-chart'],
      ['dog-age-chart', '/dog-age-chart'],
      ['cat-age-chart', '/cat-age-chart'],
      ['cat-chart', '/cat-feeding-chart'],
      ['label-guide', '/how-to-read-pet-food-label'],
      ['breed-guide', '/dog-food-by-breed'],
      ['chocolate-guide', '/my-dog-ate-chocolate'],
      ['cat-growth-guide', '/when-do-cats-stop-growing'],
      ['dog-heat-guide', '/dog-in-heat'],
      ['feed', '/how-much-should-i-feed-my-dog'],
      ['feed-10', '/how-much-to-feed-a-10-lb-dog'],
      ['feed-15', '/how-much-to-feed-a-15-lb-dog'],
      ['feed-20', '/how-much-to-feed-a-20-lb-dog'],
      ['feed-25', '/how-much-to-feed-a-25-lb-dog'],
      ['feed-30', '/how-much-to-feed-a-30-lb-dog'],
      ['feed-40', '/how-much-to-feed-a-40-lb-dog'],
      ['feed-50', '/how-much-to-feed-a-50-lb-dog'],
      ['feed-60', '/how-much-to-feed-a-60-lb-dog'],
      ['feed-70', '/how-much-to-feed-a-70-lb-dog'],
      ['feed-80', '/how-much-to-feed-an-80-lb-dog'],
      ['feed-100', '/how-much-to-feed-a-100-lb-dog'],
      ['dog-years-1', '/1-year-in-dog-years'],
      ['dog-years-2', '/2-years-in-dog-years'],
      ['dog-years-3', '/3-years-in-dog-years'],
      ['dog-years-4', '/4-years-in-dog-years'],
      ['dog-years-5', '/5-years-in-dog-years'],
      ['dog-years-6', '/6-years-in-dog-years'],
      ['dog-years-7', '/7-years-in-dog-years'],
      ['dog-years-8', '/8-years-in-dog-years'],
      ['dog-years-9', '/9-years-in-dog-years'],
      ['dog-years-10', '/10-years-in-dog-years'],
      ['dog-years-11', '/11-years-in-dog-years'],
      ['dog-years-12', '/12-years-in-dog-years'],
      ['dog-years-13', '/13-years-in-dog-years'],
      ['dog-years-14', '/14-years-in-dog-years'],
      ['dog-years-15', '/15-years-in-dog-years'],
      ['dog-years-16', '/16-years-in-dog-years'],
      ['cat-years-1', '/1-year-in-cat-years'],
      ['cat-years-2', '/2-years-in-cat-years'],
      ['cat-years-3', '/3-years-in-cat-years'],
      ['cat-years-4', '/4-years-in-cat-years'],
      ['cat-years-5', '/5-years-in-cat-years'],
      ['cat-years-6', '/6-years-in-cat-years'],
      ['cat-years-7', '/7-years-in-cat-years'],
      ['cat-years-8', '/8-years-in-cat-years'],
      ['cat-years-9', '/9-years-in-cat-years'],
      ['cat-years-10', '/10-years-in-cat-years'],
      ['cat-years-11', '/11-years-in-cat-years'],
      ['cat-years-12', '/12-years-in-cat-years'],
      ['cat-years-13', '/13-years-in-cat-years'],
      ['cat-years-14', '/14-years-in-cat-years'],
      ['cat-years-15', '/15-years-in-cat-years'],
      ['cat-years-16', '/16-years-in-cat-years'],
      ['cat-years-17', '/17-years-in-cat-years'],
      ['cat-years-18', '/18-years-in-cat-years'],
      ['cat-years-19', '/19-years-in-cat-years'],
      ['cat-years-20', '/20-years-in-cat-years'],
      ['foods', '/can-dogs-eat'],
      ['food-strawberries', '/can-dogs-eat-strawberries'],
      ['food-bananas', '/can-dogs-eat-bananas'],
      ['food-grapes', '/can-dogs-eat-grapes'],
      ['food-raisins', '/can-dogs-eat-raisins'],
      ['food-blueberries', '/can-dogs-eat-blueberries'],
      ['food-apples', '/can-dogs-eat-apples'],
      ['food-watermelon', '/can-dogs-eat-watermelon'],
      ['food-cherries', '/can-dogs-eat-cherries'],
      ['food-mango', '/can-dogs-eat-mango'],
      ['food-oranges', '/can-dogs-eat-oranges'],
      ['food-pineapple', '/can-dogs-eat-pineapple'],
      ['food-tomatoes', '/can-dogs-eat-tomatoes'],
      ['food-avocado', '/can-dogs-eat-avocado'],
      ['food-onions', '/can-dogs-eat-onions'],
      ['food-garlic', '/can-dogs-eat-garlic'],
      ['food-carrots', '/can-dogs-eat-carrots'],
      ['food-broccoli', '/can-dogs-eat-broccoli'],
      ['food-cucumber', '/can-dogs-eat-cucumber'],
      ['food-bell-peppers', '/can-dogs-eat-bell-peppers'],
      ['food-zucchini', '/can-dogs-eat-zucchini'],
      ['food-potatoes', '/can-dogs-eat-potatoes'],
      ['food-sweet-potatoes', '/can-dogs-eat-sweet-potatoes'],
      ['food-pumpkin', '/can-dogs-eat-pumpkin'],
      ['food-cheese', '/can-dogs-eat-cheese'],
      ['food-eggs', '/can-dogs-eat-eggs'],
      ['food-yogurt', '/can-dogs-eat-yogurt'],
      ['food-shrimp', '/can-dogs-eat-shrimp'],
      ['food-salmon', '/can-dogs-eat-salmon'],
      ['food-pork', '/can-dogs-eat-pork'],
      ['food-ham', '/can-dogs-eat-ham'],
      ['food-bacon', '/can-dogs-eat-bacon'],
      ['food-peanut-butter', '/can-dogs-eat-peanut-butter'],
      ['food-honey', '/can-dogs-eat-honey'],
      ['food-chocolate', '/can-dogs-eat-chocolate'],
      ['food-rice', '/can-dogs-eat-rice'],
      ['food-popcorn', '/can-dogs-eat-popcorn'],
      ['food-bread', '/can-dogs-eat-bread'],
      ['food-almonds', '/can-dogs-eat-almonds'],
      ['food-cashews', '/can-dogs-eat-cashews'],
      ['food-macadamia-nuts', '/can-dogs-eat-macadamia-nuts'],
      ['food-xylitol-gum', '/can-dogs-eat-xylitol-gum'],
      ['plants-cats', '/plants-toxic-to-cats'],
      ['plants-dogs', '/plants-toxic-to-dogs'],
      ['plants-safe', '/pet-safe-houseplants'],
      ['plant-pothos', '/is-pothos-toxic-to-cats-and-dogs'],
      ['plant-snake-plants', '/are-snake-plants-toxic-to-cats-and-dogs'],
      ['plant-monstera', '/is-monstera-toxic-to-cats-and-dogs'],
      ['plant-aloe-vera', '/is-aloe-vera-toxic-to-cats-and-dogs'],
      ['plant-peace-lilies', '/are-peace-lilies-toxic-to-cats-and-dogs'],
      ['plant-jade-plants', '/are-jade-plants-toxic-to-cats-and-dogs'],
      ['plant-philodendrons', '/are-philodendrons-toxic-to-cats-and-dogs'],
      ['plant-dieffenbachia', '/is-dieffenbachia-toxic-to-cats-and-dogs'],
      ['plant-dracaena', '/is-dracaena-toxic-to-cats-and-dogs'],
      ['plant-english-ivy', '/is-english-ivy-toxic-to-cats-and-dogs'],
      ['plant-kalanchoe', '/is-kalanchoe-toxic-to-cats-and-dogs'],
      ['plant-begonias', '/are-begonias-toxic-to-cats-and-dogs'],
      ['plant-cyclamen', '/is-cyclamen-toxic-to-cats-and-dogs'],
      ['plant-lilies', '/are-lilies-toxic-to-cats-and-dogs'],
      ['plant-tulips', '/are-tulips-toxic-to-cats-and-dogs'],
      ['plant-daffodils', '/are-daffodils-toxic-to-cats-and-dogs'],
      ['plant-hyacinths', '/are-hyacinths-toxic-to-cats-and-dogs'],
      ['plant-chrysanthemums', '/are-chrysanthemums-toxic-to-cats-and-dogs'],
      ['plant-daisies', '/are-daisies-toxic-to-cats-and-dogs'],
      ['plant-carnations', '/are-carnations-toxic-to-cats-and-dogs'],
      ['plant-calla-lilies', '/are-calla-lilies-toxic-to-cats-and-dogs'],
      ['plant-amaryllis', '/is-amaryllis-toxic-to-cats-and-dogs'],
      ['plant-peonies', '/are-peonies-toxic-to-cats-and-dogs'],
      ['plant-poinsettias', '/are-poinsettias-toxic-to-cats-and-dogs'],
      ['plant-holly', '/is-holly-toxic-to-cats-and-dogs'],
      ['plant-mistletoe', '/is-mistletoe-toxic-to-cats-and-dogs'],
      ['plant-sago-palms', '/are-sago-palms-toxic-to-cats-and-dogs'],
      ['plant-oleander', '/is-oleander-toxic-to-cats-and-dogs'],
      ['plant-foxglove', '/is-foxglove-toxic-to-cats-and-dogs'],
      ['plant-lily-of-the-valley', '/is-lily-of-the-valley-toxic-to-cats-and-dogs'],
      ['plant-azaleas', '/are-azaleas-toxic-to-cats-and-dogs'],
      ['plant-hydrangeas', '/are-hydrangeas-toxic-to-cats-and-dogs'],
      ['plant-geraniums', '/are-geraniums-toxic-to-cats-and-dogs'],
      ['plant-lavender', '/is-lavender-toxic-to-cats-and-dogs'],
      ['plant-mint', '/is-mint-toxic-to-cats-and-dogs'],
      ['plant-eucalyptus', '/is-eucalyptus-toxic-to-cats-and-dogs'],
      ['plant-catnip', '/is-catnip-toxic-to-cats-and-dogs'],
      ['plant-tomato-plants', '/are-tomato-plants-toxic-to-cats-and-dogs'],
      ['plant-spider-plants', '/are-spider-plants-toxic-to-cats-and-dogs'],
      ['plant-christmas-cactus', '/is-christmas-cactus-toxic-to-cats-and-dogs'],
      ['plant-money-trees', '/are-money-trees-toxic-to-cats-and-dogs'],
      ['plant-roses', '/are-roses-toxic-to-cats-and-dogs'],
      ['plant-sunflowers', '/are-sunflowers-toxic-to-cats-and-dogs'],
      ['plant-orchids', '/are-orchids-toxic-to-cats-and-dogs'],
      ['plant-basil', '/is-basil-toxic-to-cats-and-dogs'],
      ['plant-rosemary', '/is-rosemary-toxic-to-cats-and-dogs'],
      ['plant-bamboo', '/is-bamboo-toxic-to-cats-and-dogs'],
      ['plant-calathea', '/is-calathea-toxic-to-cats-and-dogs'],
      ['plant-babys-breath', '/is-babys-breath-toxic-to-cats-and-dogs'],
      ['plant-african-violets', '/are-african-violets-toxic-to-cats-and-dogs'],
      ['plant-boston-ferns', '/are-boston-ferns-toxic-to-cats-and-dogs'],
      ['plant-hibiscus', '/is-hibiscus-toxic-to-cats-and-dogs'],
      ['methodology', '/methodology'],
      ['about', '/about'],
      ['editorial', '/editorial-policy'],
      ['privacy', '/privacy'],
    ]);
  });

  it('holds every page source file and no page without one', () => {
    expect(ROUTES.map(({ path }) => path).sort()).toEqual(sourcePaths().sort());
  });

  it('gives every route its own id and address', () => {
    expect(new Set(ROUTES.map(({ id }) => id)).size).toBe(ROUTES.length);
    expect(new Set(ROUTES.map(({ path }) => path)).size).toBe(ROUTES.length);
  });

  it('names the home, eight calculators, and every other page an article', () => {
    expect(routeOf('/')?.kind).toBe('home');
    expect(ROUTES.filter(({ kind }) => kind === 'calculator')).toHaveLength(8);
    expect(routeOf('/methodology')?.kind).toBe('article');
    expect(routeOf('/no-such-page')).toBeUndefined();
  });
});

describe('hrefOf', () => {
  it('leads to the page of a route', () => {
    expect(hrefOf('about')).toBe('/about');
    expect(hrefOf('home')).toBe('/');
  });

  it('refuses an id that is not a route', () => {
    expect(() => hrefOf('nowhere')).toThrow('no route nowhere');
  });
});
