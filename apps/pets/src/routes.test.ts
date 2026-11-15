import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { hrefOf, langOf, pathsOf, routeOf, ROUTES } from './routes.ts';

const pagesDir = resolve(import.meta.dirname, 'pages');

/** The canonical path of every page source file. */
const sourcePaths = (dir = pagesDir, prefix = ''): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory())
      return sourcePaths(resolve(dir, entry.name), `${prefix}/${entry.name}`);
    if (!entry.name.endsWith('.astro') || entry.name === '404.astro') return [];
    const name = entry.name.replace(/\.astro$/, '');
    return [name === 'index' ? prefix || '/' : `${prefix}/${name}`];
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
      ['puppy-weight', '/puppy-weight-calculator'],
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

  // the German twins (plans/growth/BACKLOG.md #50), pinned like the English addresses
  it('pins the address of every German page', () => {
    expect(ROUTES.flatMap(({ id, de }) => (de === undefined ? [] : [[id, de]]))).toEqual([
      ['home', '/de'],
      ['dog-age', '/de/hundejahre-rechner'],
      ['chocolate-guide', '/de/hund-hat-schokolade-gefressen'],
      ['foods', '/de/was-duerfen-hunde-essen'],
      ['food-strawberries', '/de/duerfen-hunde-erdbeeren-essen'],
      ['food-bananas', '/de/duerfen-hunde-bananen-essen'],
      ['food-grapes', '/de/duerfen-hunde-weintrauben-essen'],
      ['food-raisins', '/de/duerfen-hunde-rosinen-essen'],
      ['food-blueberries', '/de/duerfen-hunde-blaubeeren-essen'],
      ['food-apples', '/de/duerfen-hunde-aepfel-essen'],
      ['food-watermelon', '/de/duerfen-hunde-wassermelone-essen'],
      ['food-cherries', '/de/duerfen-hunde-kirschen-essen'],
      ['food-mango', '/de/duerfen-hunde-mango-essen'],
      ['food-oranges', '/de/duerfen-hunde-orangen-essen'],
      ['food-pineapple', '/de/duerfen-hunde-ananas-essen'],
      ['food-tomatoes', '/de/duerfen-hunde-tomaten-essen'],
      ['food-avocado', '/de/duerfen-hunde-avocado-essen'],
      ['food-onions', '/de/duerfen-hunde-zwiebeln-essen'],
      ['food-garlic', '/de/duerfen-hunde-knoblauch-essen'],
      ['food-carrots', '/de/duerfen-hunde-karotten-essen'],
      ['food-broccoli', '/de/duerfen-hunde-brokkoli-essen'],
      ['food-cucumber', '/de/duerfen-hunde-gurken-essen'],
      ['food-bell-peppers', '/de/duerfen-hunde-paprika-essen'],
      ['food-zucchini', '/de/duerfen-hunde-zucchini-essen'],
      ['food-potatoes', '/de/duerfen-hunde-kartoffeln-essen'],
      ['food-sweet-potatoes', '/de/duerfen-hunde-suesskartoffeln-essen'],
      ['food-pumpkin', '/de/duerfen-hunde-kuerbis-essen'],
      ['food-cheese', '/de/duerfen-hunde-kaese-essen'],
      ['food-eggs', '/de/duerfen-hunde-eier-essen'],
      ['food-yogurt', '/de/duerfen-hunde-joghurt-essen'],
      ['food-shrimp', '/de/duerfen-hunde-garnelen-essen'],
      ['food-salmon', '/de/duerfen-hunde-lachs-essen'],
      ['food-pork', '/de/duerfen-hunde-schweinefleisch-essen'],
      ['food-ham', '/de/duerfen-hunde-schinken-essen'],
      ['food-bacon', '/de/duerfen-hunde-speck-essen'],
      ['food-peanut-butter', '/de/duerfen-hunde-erdnussbutter-essen'],
      ['food-honey', '/de/duerfen-hunde-honig-essen'],
      ['food-chocolate', '/de/duerfen-hunde-schokolade-essen'],
      ['food-rice', '/de/duerfen-hunde-reis-essen'],
      ['food-popcorn', '/de/duerfen-hunde-popcorn-essen'],
      ['food-bread', '/de/duerfen-hunde-brot-essen'],
      ['food-almonds', '/de/duerfen-hunde-mandeln-essen'],
      ['food-cashews', '/de/duerfen-hunde-cashewkerne-essen'],
      ['food-macadamia-nuts', '/de/duerfen-hunde-macadamianuesse-essen'],
      ['food-xylitol-gum', '/de/duerfen-hunde-kaugummi-essen'],
      ['about', '/de/ueber-uns'],
      ['editorial', '/de/redaktionelle-grundsaetze'],
      ['privacy', '/de/datenschutz'],
    ]);
  });

  // the French twins (plans/growth/BACKLOG.md #51), pinned like the English and German addresses
  it('pins the address of every French page', () => {
    expect(ROUTES.flatMap(({ id, fr }) => (fr === undefined ? [] : [[id, fr]]))).toEqual([
      ['home', '/fr'],
      ['dog-age', '/fr/age-chien-en-humain'],
      ['chocolate-guide', '/fr/mon-chien-a-mange-du-chocolat'],
      ['foods', '/fr/que-peut-manger-un-chien'],
      ['food-strawberries', '/fr/chien-peut-il-manger-des-fraises'],
      ['food-bananas', '/fr/chien-peut-il-manger-de-la-banane'],
      ['food-grapes', '/fr/chien-peut-il-manger-du-raisin'],
      ['food-raisins', '/fr/chien-peut-il-manger-des-raisins-secs'],
      ['food-blueberries', '/fr/chien-peut-il-manger-des-myrtilles'],
      ['food-apples', '/fr/chien-peut-il-manger-des-pommes'],
      ['food-watermelon', '/fr/chien-peut-il-manger-de-la-pasteque'],
      ['food-cherries', '/fr/chien-peut-il-manger-des-cerises'],
      ['food-mango', '/fr/chien-peut-il-manger-de-la-mangue'],
      ['food-oranges', '/fr/chien-peut-il-manger-des-oranges'],
      ['food-pineapple', '/fr/chien-peut-il-manger-de-l-ananas'],
      ['food-tomatoes', '/fr/chien-peut-il-manger-des-tomates'],
      ['food-avocado', '/fr/chien-peut-il-manger-de-l-avocat'],
      ['food-onions', '/fr/chien-peut-il-manger-des-oignons'],
      ['food-garlic', '/fr/chien-peut-il-manger-de-l-ail'],
      ['food-carrots', '/fr/chien-peut-il-manger-des-carottes'],
      ['food-broccoli', '/fr/chien-peut-il-manger-du-brocoli'],
      ['food-cucumber', '/fr/chien-peut-il-manger-du-concombre'],
      ['food-bell-peppers', '/fr/chien-peut-il-manger-du-poivron'],
      ['food-zucchini', '/fr/chien-peut-il-manger-de-la-courgette'],
      ['food-potatoes', '/fr/chien-peut-il-manger-des-pommes-de-terre'],
      ['food-sweet-potatoes', '/fr/chien-peut-il-manger-de-la-patate-douce'],
      ['food-pumpkin', '/fr/chien-peut-il-manger-de-la-citrouille'],
      ['food-cheese', '/fr/chien-peut-il-manger-du-fromage'],
      ['food-eggs', '/fr/chien-peut-il-manger-des-oeufs'],
      ['food-yogurt', '/fr/chien-peut-il-manger-du-yaourt'],
      ['food-shrimp', '/fr/chien-peut-il-manger-des-crevettes'],
      ['food-salmon', '/fr/chien-peut-il-manger-du-saumon'],
      ['food-pork', '/fr/chien-peut-il-manger-du-porc'],
      ['food-ham', '/fr/chien-peut-il-manger-du-jambon'],
      ['food-bacon', '/fr/chien-peut-il-manger-du-bacon'],
      ['food-peanut-butter', '/fr/chien-peut-il-manger-du-beurre-de-cacahuete'],
      ['food-honey', '/fr/chien-peut-il-manger-du-miel'],
      ['food-chocolate', '/fr/chien-peut-il-manger-du-chocolat'],
      ['food-rice', '/fr/chien-peut-il-manger-du-riz'],
      ['food-popcorn', '/fr/chien-peut-il-manger-du-pop-corn'],
      ['food-bread', '/fr/chien-peut-il-manger-du-pain'],
      ['food-almonds', '/fr/chien-peut-il-manger-des-amandes'],
      ['food-cashews', '/fr/chien-peut-il-manger-des-noix-de-cajou'],
      ['food-macadamia-nuts', '/fr/chien-peut-il-manger-des-noix-de-macadamia'],
      ['food-xylitol-gum', '/fr/chien-peut-il-manger-du-chewing-gum'],
      ['about', '/fr/a-propos'],
      ['editorial', '/fr/principes-editoriaux'],
      ['privacy', '/fr/confidentialite'],
    ]);
  });

  // the Spanish twins (plans/growth/BACKLOG.md #86), pinned like the other addresses
  it('pins the address of every Spanish page', () => {
    expect(ROUTES.flatMap(({ id, es }) => (es === undefined ? [] : [[id, es]]))).toEqual([
      ['home', '/es'],
      ['dog-age', '/es/edad-de-perro-en-anos-humanos'],
      ['chocolate-guide', '/es/que-pasa-si-un-perro-come-chocolate'],
      ['foods', '/es/que-frutas-pueden-comer-los-perros'],
      ['food-strawberries', '/es/los-perros-pueden-comer-fresas'],
      ['food-bananas', '/es/los-perros-pueden-comer-platano'],
      ['food-grapes', '/es/los-perros-pueden-comer-uvas'],
      ['food-raisins', '/es/los-perros-pueden-comer-pasas'],
      ['food-blueberries', '/es/los-perros-pueden-comer-arandanos'],
      ['food-apples', '/es/los-perros-pueden-comer-manzana'],
      ['food-watermelon', '/es/los-perros-pueden-comer-sandia'],
      ['food-cherries', '/es/los-perros-pueden-comer-cerezas'],
      ['food-mango', '/es/los-perros-pueden-comer-mango'],
      ['food-oranges', '/es/los-perros-pueden-comer-naranja'],
      ['food-pineapple', '/es/los-perros-pueden-comer-pina'],
      ['food-tomatoes', '/es/los-perros-pueden-comer-tomate'],
      ['food-avocado', '/es/los-perros-pueden-comer-aguacate'],
      ['food-onions', '/es/los-perros-pueden-comer-cebolla'],
      ['food-garlic', '/es/los-perros-pueden-comer-ajo'],
      ['food-carrots', '/es/los-perros-pueden-comer-zanahoria'],
      ['food-broccoli', '/es/los-perros-pueden-comer-brocoli'],
      ['food-cucumber', '/es/los-perros-pueden-comer-pepino'],
      ['food-bell-peppers', '/es/los-perros-pueden-comer-pimiento'],
      ['food-zucchini', '/es/los-perros-pueden-comer-calabacin'],
      ['food-potatoes', '/es/los-perros-pueden-comer-papa'],
      ['food-sweet-potatoes', '/es/los-perros-pueden-comer-camote'],
      ['food-pumpkin', '/es/los-perros-pueden-comer-calabaza'],
      ['food-cheese', '/es/los-perros-pueden-comer-queso'],
      ['food-eggs', '/es/los-perros-pueden-comer-huevo'],
      ['food-yogurt', '/es/los-perros-pueden-comer-yogur'],
      ['food-shrimp', '/es/los-perros-pueden-comer-camarones'],
      ['food-salmon', '/es/los-perros-pueden-comer-salmon'],
      ['food-pork', '/es/los-perros-pueden-comer-cerdo'],
      ['food-ham', '/es/los-perros-pueden-comer-jamon'],
      ['food-bacon', '/es/los-perros-pueden-comer-tocino'],
      ['food-peanut-butter', '/es/los-perros-pueden-comer-crema-de-cacahuate'],
      ['food-honey', '/es/los-perros-pueden-comer-miel'],
      ['food-chocolate', '/es/los-perros-pueden-comer-chocolate'],
      ['food-rice', '/es/los-perros-pueden-comer-arroz'],
      ['food-popcorn', '/es/los-perros-pueden-comer-palomitas'],
      ['food-bread', '/es/los-perros-pueden-comer-pan'],
      ['food-almonds', '/es/los-perros-pueden-comer-almendras'],
      ['food-cashews', '/es/los-perros-pueden-comer-nueces-de-la-india'],
      ['food-macadamia-nuts', '/es/los-perros-pueden-comer-nueces-de-macadamia'],
      ['food-xylitol-gum', '/es/los-perros-pueden-comer-chicle'],
      ['plants-cats', '/es/plantas-toxicas-para-gatos'],
      ['plants-dogs', '/es/plantas-toxicas-para-perros'],
      ['plants-safe', '/es/plantas-seguras-para-perros-y-gatos'],
      ['plant-pothos', '/es/potus-es-toxico-para-perros-y-gatos'],
      ['plant-snake-plants', '/es/sansevieria-es-toxica-para-perros-y-gatos'],
      ['plant-monstera', '/es/monstera-es-toxica-para-perros-y-gatos'],
      ['plant-aloe-vera', '/es/aloe-vera-es-toxico-para-perros-y-gatos'],
      ['plant-peace-lilies', '/es/espatifilo-es-toxico-para-perros-y-gatos'],
      ['plant-jade-plants', '/es/arbol-de-jade-es-toxico-para-perros-y-gatos'],
      ['plant-philodendrons', '/es/filodendro-es-toxico-para-perros-y-gatos'],
      ['plant-dieffenbachia', '/es/difenbaquia-es-toxica-para-perros-y-gatos'],
      ['plant-dracaena', '/es/dracena-es-toxica-para-perros-y-gatos'],
      ['plant-english-ivy', '/es/hiedra-es-toxica-para-perros-y-gatos'],
      ['plant-kalanchoe', '/es/kalanchoe-es-toxico-para-perros-y-gatos'],
      ['plant-begonias', '/es/begonias-son-toxicas-para-perros-y-gatos'],
      ['plant-cyclamen', '/es/ciclamen-es-toxico-para-perros-y-gatos'],
      ['plant-lilies', '/es/lirios-son-toxicos-para-perros-y-gatos'],
      ['plant-tulips', '/es/tulipanes-son-toxicos-para-perros-y-gatos'],
      ['plant-daffodils', '/es/narcisos-son-toxicos-para-perros-y-gatos'],
      ['plant-hyacinths', '/es/jacintos-son-toxicos-para-perros-y-gatos'],
      ['plant-chrysanthemums', '/es/crisantemos-son-toxicos-para-perros-y-gatos'],
      ['plant-daisies', '/es/margaritas-son-toxicas-para-perros-y-gatos'],
      ['plant-carnations', '/es/claveles-son-toxicos-para-perros-y-gatos'],
      ['plant-calla-lilies', '/es/alcatraces-son-toxicos-para-perros-y-gatos'],
      ['plant-amaryllis', '/es/amarilis-es-toxica-para-perros-y-gatos'],
      ['plant-peonies', '/es/peonias-son-toxicas-para-perros-y-gatos'],
      ['plant-poinsettias', '/es/nochebuena-es-toxica-para-perros-y-gatos'],
      ['plant-holly', '/es/acebo-es-toxico-para-perros-y-gatos'],
      ['plant-mistletoe', '/es/muerdago-es-toxico-para-perros-y-gatos'],
      ['plant-sago-palms', '/es/palma-sago-es-toxica-para-perros-y-gatos'],
      ['plant-oleander', '/es/adelfa-es-toxica-para-perros-y-gatos'],
      ['plant-foxglove', '/es/dedalera-es-toxica-para-perros-y-gatos'],
      ['plant-lily-of-the-valley', '/es/lirio-de-los-valles-es-toxico-para-perros-y-gatos'],
      ['plant-azaleas', '/es/azaleas-son-toxicas-para-perros-y-gatos'],
      ['plant-hydrangeas', '/es/hortensias-son-toxicas-para-perros-y-gatos'],
      ['plant-geraniums', '/es/geranios-son-toxicos-para-perros-y-gatos'],
      ['plant-lavender', '/es/lavanda-es-toxica-para-perros-y-gatos'],
      ['plant-mint', '/es/menta-es-toxica-para-perros-y-gatos'],
      ['plant-eucalyptus', '/es/eucalipto-es-toxico-para-perros-y-gatos'],
      ['plant-catnip', '/es/hierba-gatera-es-toxica-para-perros-y-gatos'],
      ['plant-tomato-plants', '/es/tomatera-es-toxica-para-perros-y-gatos'],
      ['plant-spider-plants', '/es/cinta-es-toxica-para-perros-y-gatos'],
      ['plant-christmas-cactus', '/es/cactus-de-navidad-es-toxico-para-perros-y-gatos'],
      ['plant-money-trees', '/es/pachira-es-toxica-para-perros-y-gatos'],
      ['plant-roses', '/es/rosas-son-toxicas-para-perros-y-gatos'],
      ['plant-sunflowers', '/es/girasoles-son-toxicos-para-perros-y-gatos'],
      ['plant-orchids', '/es/orquideas-son-toxicas-para-perros-y-gatos'],
      ['plant-basil', '/es/albahaca-es-toxica-para-perros-y-gatos'],
      ['plant-rosemary', '/es/romero-es-toxico-para-perros-y-gatos'],
      ['plant-bamboo', '/es/bambu-es-toxico-para-perros-y-gatos'],
      ['plant-calathea', '/es/calathea-es-toxica-para-perros-y-gatos'],
      ['plant-babys-breath', '/es/gypsophila-es-toxica-para-perros-y-gatos'],
      ['plant-african-violets', '/es/violetas-africanas-son-toxicas-para-perros-y-gatos'],
      ['plant-boston-ferns', '/es/helecho-de-boston-es-toxico-para-perros-y-gatos'],
      ['plant-hibiscus', '/es/hibisco-es-toxico-para-perros-y-gatos'],
      ['about', '/es/acerca-de'],
      ['editorial', '/es/politica-editorial'],
      ['privacy', '/es/privacidad'],
    ]);
  });

  it('holds every page source file and no page without one', () => {
    expect(ROUTES.flatMap(pathsOf).sort()).toEqual(sourcePaths().sort());
  });

  it('gives every route its own id and every page its own address', () => {
    expect(new Set(ROUTES.map(({ id }) => id)).size).toBe(ROUTES.length);
    const paths = ROUTES.flatMap(pathsOf);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('finds a route by its German address too, with the kind of its English page', () => {
    expect(routeOf('/de/hundejahre-rechner')).toMatchObject({ id: 'dog-age', kind: 'calculator' });
    expect(routeOf('/de')?.kind).toBe('home');
  });

  it('finds a route by its Spanish address too', () => {
    expect(routeOf('/es/edad-de-perro-en-anos-humanos')).toMatchObject({
      id: 'dog-age',
      kind: 'calculator',
    });
    expect(routeOf('/es')?.kind).toBe('home');
  });

  it('finds a route by its French address too', () => {
    expect(routeOf('/fr/age-chien-en-humain')).toMatchObject({ id: 'dog-age', kind: 'calculator' });
    expect(routeOf('/fr')?.kind).toBe('home');
  });

  it('names the home, nine calculators, and every other page an article', () => {
    expect(routeOf('/')?.kind).toBe('home');
    expect(ROUTES.filter(({ kind }) => kind === 'calculator')).toHaveLength(9);
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

  it('leads to the German page of a route, and refuses a route with none', () => {
    expect(hrefOf('dog-age', 'de')).toBe('/de/hundejahre-rechner');
    expect(hrefOf('home', 'de')).toBe('/de');
    expect(() => hrefOf('dog', 'de')).toThrow('no German page for dog');
  });

  it('leads to the Spanish page of a route, and refuses a route with none', () => {
    expect(hrefOf('dog-age', 'es')).toBe('/es/edad-de-perro-en-anos-humanos');
    expect(hrefOf('home', 'es')).toBe('/es');
    expect(() => hrefOf('dog', 'es')).toThrow('no Spanish page for dog');
  });

  it('leads to the French page of a route, and refuses a route with none', () => {
    expect(hrefOf('dog-age', 'fr')).toBe('/fr/age-chien-en-humain');
    expect(hrefOf('home', 'fr')).toBe('/fr');
    expect(() => hrefOf('dog', 'fr')).toThrow('no French page for dog');
  });
});

describe('langOf', () => {
  it('reads German under /de and English everywhere else', () => {
    expect(langOf('/de')).toBe('de');
    expect(langOf('/de/hundejahre-rechner')).toBe('de');
    expect(langOf('/')).toBe('en');
    expect(langOf('/dog-age-calculator')).toBe('en');
    expect(langOf('/deer')).toBe('en');
  });

  it('reads French under /fr', () => {
    expect(langOf('/fr')).toBe('fr');
    expect(langOf('/fr/que-peut-manger-un-chien')).toBe('fr');
    expect(langOf('/fresh')).toBe('en');
  });

  it('reads Spanish under /es', () => {
    expect(langOf('/es')).toBe('es');
    expect(langOf('/es/los-perros-pueden-comer-uvas')).toBe('es');
    expect(langOf('/especially')).toBe('en');
  });
});
