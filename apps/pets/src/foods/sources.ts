import type { PageSource } from '../guides.ts';

/** The day every source of the "can dogs eat" pages was read. */
export const FOODS_CHECKED = '2026-11-08';

const akc = (title: string, slug: string, by: string): PageSource => ({
  name: `AKC, ${title} (${by})`,
  url: `https://www.akc.org/expert-advice/nutrition/${slug}/`,
});
const petmd = (title: string, slug: string, by: string): PageSource => ({
  name: `PetMD, ${title} (${by})`,
  url: `https://www.petmd.com/dog/nutrition/${slug}`,
});
const aspcaPlant = (plant: string, path: string): PageSource => ({
  name: `ASPCA Animal Poison Control, toxic and non-toxic plants: ${plant}`,
  url: `https://www.aspca.org/pet-care/${path}`,
});
const usda = (fdc: number, description: string): PageSource => ({
  name: `USDA FoodData Central, SR Legacy: ${description} (FDC ${String(fdc)})`,
  url: `https://fdc.nal.usda.gov/food-details/${String(fdc)}/nutrients`,
});

/** The USDA record of a food, as its page cites it. */
export const usdaSource = usda;

/** The sources the "can dogs eat" pages cite, by key; each was read on `FOODS_CHECKED`. */
export const S = {
  aspcaFoods: {
    name: 'ASPCA Animal Poison Control, People Foods to Avoid Feeding Your Pets',
    url: 'https://www.aspca.org/pet-care/animal-poison-control/people-foods-avoid-feeding-your-pets',
  },
  aspcaLine: {
    name: 'ASPCA Animal Poison Control Center: (888) 426-4435, a consultation fee may apply',
    url: 'https://www.aspca.org/pet-care/animal-poison-control',
  },
  vcaTreats: {
    name: 'VCA Animal Hospitals, Dog Treats (Canadian Academy of Veterinary Nutrition; Grant, DVM; Williams, DVM; Downing, DVM; September 2024)',
    url: 'https://vcahospitals.com/know-your-pet/dog-treats',
  },
  akcTreats: akc(
    'How Many Treats Can Your Dog Have?',
    'how-many-treats-can-dog-have',
    'Anna Burke, August 2026',
  ),
  merckEnergy: {
    name: 'Merck Veterinary Manual, Daily maintenance energy requirements for dogs and cats',
    url: 'https://www.merckvetmanual.com/multimedia/table/daily-maintenance-energy-requirements-for-dogs-and-cats',
  },

  // fruit
  akcStrawberries: akc(
    'Can Dogs Eat Strawberries?',
    'can-dogs-eat-strawberries',
    'Harriet Meyers, August 2026',
  ),
  petmdStrawberries: petmd(
    'Can Dogs Eat Strawberries?',
    'can-dogs-eat-strawberries',
    'reviewed by Molly Price, DVM, July 2024',
  ),
  aspcaStrawberry: aspcaPlant(
    'Strawberry',
    'aspca-poison-control/toxic-and-non-toxic-plants/strawberry',
  ),
  akcBananas: akc('Can Dogs Eat Bananas?', 'can-dogs-eat-bananas', 'AKC Staff, September 2026'),
  petmdBananas: petmd(
    'Can Dogs Eat Bananas?',
    'can-dogs-eat-bananas',
    'reviewed by Hannah Hart, DVM, August 2026',
  ),
  aspcaBanana: aspcaPlant('Banana', 'aspca-poison-control/toxic-and-non-toxic-plants/banana'),
  merckGrapes: {
    name: 'Merck Veterinary Manual, Grape, Raisin, and Tamarind Toxicosis in Dogs (Cristine Hayes, DVM, ASPCA APCC; reviewed by Ahna Brutlag, DVM, DABT, DABVT; September 2024)',
    url: 'https://www.merckvetmanual.com/toxicology/food-hazards/grape-raisin-and-tamarind-vitis-spp-tamarindus-spp-toxicosis-in-dogs',
  },
  akcGrapes: akc(
    'Can Dogs Eat Grapes?',
    'can-dogs-eat-grapes',
    'AKC Staff, quoting Jessica Dowling, DVM, August 2026',
  ),
  petmdGrapes: petmd(
    'Can Dogs Eat Grapes?',
    'can-dogs-eat-grapes',
    'reviewed by Jennifer Coates, DVM, February 2025',
  ),
  vcaGrapes: {
    name: 'VCA Animal Hospitals, Grape, Raisin, and Currant Poisoning in Dogs (Renee Schmid, DVM, DABVT, DABT; Ahna Brutlag, DVM, DABT, DABVT)',
    url: 'https://vcahospitals.com/know-your-pet/grape-raisin-and-currant-poisoning-in-dogs',
  },
  wegenast: {
    name: 'Pet Poison Helpline review (Heather Handley, DVM) of Wegenast CA et al., Acute kidney injury in dogs following ingestion of cream of tartar and tamarinds, J Vet Emerg Crit Care 2022',
    url: 'https://www.petpoisonhelpline.com/uncategorized/journal-review-wegenast-ca-et-al-acute-kidney-injury-in-dogs-following-ingestion-of-cream-of-tartar-and-tamarinds-and-the-connection-to-tartaric-acid-as-the-proposed-toxic-principle-in-grapes-and-r/',
  },
  pdsaRaisins: {
    name: 'PDSA, Grape, raisin, currant and sultana poisoning in dogs (written by vets and vet nurses, November 2020)',
    url: 'https://www.pdsa.org.uk/pet-help-and-advice/pet-health-hub/conditions/grape-raisin-currant-and-sultana-poisoning-in-dogs',
  },
  akcBlueberries: akc(
    'Can Dogs Eat Blueberries?',
    'can-dogs-eat-blueberries',
    'Anna Burke, October 2026',
  ),
  petmdBlueberries: petmd(
    'Can Dogs Eat Blueberries?',
    'can-dogs-eat-blueberries',
    'reviewed by Sandra C. Mitchell, DVM, DABVP, July 2025',
  ),
  akcApples: akc('Can Dogs Eat Apples?', 'can-dogs-eat-apples', 'Kaitlyn Arford, June 2026'),
  petmdApples: petmd(
    'Can Dogs Eat Apples?',
    'can-dogs-eat-apples',
    'Hector Joy, DVM; reviewed by Jennifer Coates, DVM, September 2025',
  ),
  aspcaApple: aspcaPlant('Apple', 'aspca-poison-control/toxic-and-non-toxic-plants/apple'),
  akcWatermelon: akc(
    'Can Dogs Eat Watermelon?',
    'can-dogs-eat-watermelon',
    'Mara Bovsun, September 2026',
  ),
  petmdWatermelon: petmd(
    'Can Dogs Eat Watermelon?',
    'can-dogs-eat-watermelon',
    'reviewed by Jennifer Coates, DVM, April 2025',
  ),
  akcCherries: akc(
    'Can Dogs Have Cherries?',
    'can-dogs-have-cherries',
    'Katherine Ripley, June 2026',
  ),
  petmdCherries: petmd(
    'Can Dogs Eat Cherries?',
    'can-dogs-eat-cherries',
    'reviewed by Jennifer Coates, DVM, April 2025',
  ),
  aspcaCherry: aspcaPlant('Cherry', 'aspca-poison-control/toxic-and-non-toxic-plants/cherry'),
  akcMango: akc('Can Dogs Eat Mango?', 'can-dogs-eat-mango', 'Katherine Ripley, April 2026'),
  petmdMango: petmd(
    'Can Dogs Eat Mango?',
    'can-dogs-eat-mango',
    'reviewed by Hannah Hart, DVM, November 2026',
  ),
  akcOranges: akc('Can Dogs Eat Oranges?', 'can-dogs-eat-oranges', 'Anna Burke, October 2026'),
  petmdOranges: petmd(
    'Can Dogs Eat Oranges?',
    'can-dogs-eat-oranges',
    'Ellen Malmanger, DVM; reviewed by Sandra C. Mitchell, DVM, DABVP, September 2025',
  ),
  aspcaOrange: aspcaPlant('Orange', 'aspca-poison-control/toxic-and-non-toxic-plants/orange'),
  akcPineapple: akc('Can Dogs Eat Pineapple?', 'can-dogs-eat-pineapple', 'Anna Burke, April 2026'),
  petmdPineapple: petmd(
    'Can Dogs Eat Pineapple?',
    'can-dogs-eat-pineapple',
    'reviewed by Molly Price, DVM, July 2024',
  ),

  // vegetables
  aspcaTomato: aspcaPlant(
    'Tomato Plant',
    'animal-poison-control/toxic-and-non-toxic-plants/tomato-plant',
  ),
  akcTomatoes: akc('Can Dogs Eat Tomatoes?', 'can-dogs-eat-tomatoes', 'Anna Burke, June 2026'),
  petmdTomatoes: petmd(
    'Can Dogs Eat Tomatoes?',
    'can-dogs-eat-tomatoes',
    'reviewed by Sandra C. Mitchell, DVM, DABVP, September 2025',
  ),
  aspcaAvocado: aspcaPlant('Avocado', 'animal-poison-control/toxic-and-non-toxic-plants/avocado'),
  merckAvocado: {
    name: 'Merck Veterinary Manual, Avocado Toxicosis in Animals (Cristine Hayes, DVM; reviewed by Ahna Brutlag, DVM, DABT, DABVT; September 2024)',
    url: 'https://www.merckvetmanual.com/toxicology/food-hazards/avocado-toxicosis-in-animals',
  },
  akcAvocado: akc(
    'Can Dogs Eat Avocado?',
    'can-dogs-eat-avocado',
    'Colt Dodd; reviewed by Michael Hyder, DVM, June 2026',
  ),
  petmdAvocado: petmd(
    'Can Dogs Eat Avocado?',
    'can-dogs-eat-avocado',
    'Sandra C. Mitchell, DVM, DABVP, February 2025',
  ),
  aspcaOnion: aspcaPlant('Onion', 'animal-poison-control/toxic-and-non-toxic-plants/onion'),
  aspcaGarlic: aspcaPlant('Garlic', 'animal-poison-control/toxic-and-non-toxic-plants/garlic'),
  merckAllium: {
    name: 'Merck Veterinary Manual, Garlic and Onion (Allium spp) Toxicosis in Animals (Cristine Hayes, DVM; reviewed by Ahna Brutlag, DVM, DABT, DABVT; September 2024)',
    url: 'https://www.merckvetmanual.com/toxicology/food-hazards/allium-spp-toxicosis-in-animals',
  },
  akcOnions: akc('Can Dogs Eat Onions?', 'can-dogs-eat-onions', 'Anna Burke, April 2026'),
  petmdOnions: petmd(
    'Can Dogs Eat Onions?',
    'can-dogs-eat-onions',
    'Veronica Higgs, DVM, August 2022',
  ),
  vcaAllium: {
    name: 'VCA Animal Hospitals, Onion, Garlic, Chive, and Leek Toxicity in Dogs (Renee Schmid, DVM, DABVT, DABT; Ahna Brutlag, DVM; Lynn Buzhardt, DVM; August 2026)',
    url: 'https://vcahospitals.com/know-your-pet/onion-garlic-chive-and-leek-toxicity-in-dogs',
  },
  akcGarlic: akc(
    'Can Dogs Eat Garlic?',
    'can-dogs-eat-garlic',
    'Colt Dodd; reviewed by Michael Hyder, DVM, February 2026',
  ),
  petmdGarlic: petmd(
    'Can Dogs Eat Garlic?',
    'can-dogs-eat-garlic',
    'Sean Jones, DVM; reviewed by Sandra C. Mitchell, DVM, DABVP, March 2025',
  ),
  akcCarrots: akc('Can Dogs Eat Carrots?', 'can-dogs-eat-carrots', 'Randa Kriss, January 2025'),
  petmdCarrots: petmd(
    'Can Dogs Eat Carrots?',
    'can-dogs-eat-carrots',
    'reviewed by Jennifer Coates, DVM, October 2025',
  ),
  akcBroccoli: akc(
    'Can Dogs Eat Broccoli?',
    'can-dogs-eat-broccoli',
    'Anna Burke; reviewed by Jerry Klein, DVM, March 2026',
  ),
  petmdBroccoli: petmd(
    'Can Dogs Eat Broccoli?',
    'can-dogs-eat-broccoli',
    'reviewed by Hannah Hart, DVM, November 2026',
  ),
  akcCucumbers: akc('Can Dogs Eat Cucumbers?', 'can-dogs-eat-cucumbers', 'Anna Burke, June 2026'),
  petmdCucumbers: petmd(
    'Can Dogs Eat Cucumbers?',
    'can-dogs-eat-cucumbers',
    'reviewed by Sandra C. Mitchell, DVM, DABVP, August 2022',
  ),
  akcPeppers: akc(
    'Can Dogs Eat Bell Peppers?',
    'can-dogs-eat-bell-peppers',
    'Alexandra Anastasio; reviewed by Carly Fox, DVM, October 2026',
  ),
  petmdPeppers: petmd(
    'Can Dogs Eat Bell Peppers?',
    'can-dogs-eat-bell-peppers',
    'reviewed by Brittany Kleszynski, DVM, September 2026',
  ),
  akcZucchini: akc('Can Dogs Eat Zucchini?', 'can-dogs-eat-zucchini', 'Anna Burke, April 2025'),
  petmdZucchini: petmd(
    'Can Dogs Eat Zucchini?',
    'can-dogs-eat-zucchini',
    'reviewed by Jennifer Coates, DVM, July 2025',
  ),
  akcPotatoes: akc(
    'Can Dogs Eat Potatoes?',
    'can-dogs-eat-potatoes',
    'Katherine Ripley; reviewed by Patricia Kennedy, DVM, June 2026',
  ),
  petmdPotatoes: petmd(
    'Can Dogs Eat Potatoes?',
    'can-dogs-eat-potatoes',
    'reviewed by Jennifer Coates, DVM, October 2025',
  ),
  akcSweetPotatoes: akc(
    'Can Dogs Eat Sweet Potatoes?',
    'can-dogs-eat-sweet-potatoes',
    'Alexandra Anastasio, quoting Rachel Barrack, DVM, May 2026',
  ),
  petmdSweetPotatoes: petmd(
    'Can Dogs Eat Sweet Potatoes?',
    'can-dogs-eat-sweet-potatoes',
    'reviewed by Jennifer Coates, DVM, May 2025',
  ),
  akcPumpkin: akc(
    'Can Pumpkin Help With Dog Diarrhea?',
    'can-pumpkin-help-with-dog-diarrhea',
    'Anna Burke, November 2025',
  ),
  petmdPumpkin: petmd(
    'Can Dogs Eat Pumpkin?',
    'can-dogs-eat-pumpkin',
    'reviewed by Jennifer Coates, DVM, July 2025',
  ),

  // dairy, eggs, meat and fish
  akcCheese: akc('Can Dogs Eat Cheese?', 'can-dogs-eat-cheese', 'Randa Kriss, August 2025'),
  petmdCheese: petmd(
    'Can Dogs Eat Cheese?',
    'can-dogs-eat-cheese',
    'reviewed by Teresa Manucy, DVM, August 2025',
  ),
  akcEggs: akc('Can Dogs Eat Eggs?', 'can-dogs-eat-eggs', 'Kaitlyn Arford, July 2026'),
  petmdEggs: petmd(
    'Can Dogs Eat Eggs?',
    'can-dogs-eat-eggs',
    'Hector Joy, DVM; reviewed by Sandra C. Mitchell, DVM, DABVP, September 2025',
  ),
  akcYogurt: akc('Can Dogs Eat Yogurt?', 'can-dogs-eat-yogurt', 'Katherine Ripley, October 2025'),
  petmdYogurt: petmd(
    'Can Dogs Eat Yogurt?',
    'can-dogs-eat-yogurt',
    'Brittany Kleszynski, DVM, December 2025',
  ),
  akcShrimp: akc('Can Dogs Eat Shrimp?', 'can-dogs-eat-shrimp', 'Anna Burke, February 2025'),
  petmdShrimp: petmd(
    'Can Dogs Eat Shrimp?',
    'can-dogs-eat-shrimp',
    'reviewed by Sandra C. Mitchell, DVM, DABVP, August 2022',
  ),
  merckSalmonOwner: {
    name: 'Merck Veterinary Manual (pet owner version), Salmon Poisoning Disease and Elokomin Fluke Fever in Dogs (Nick Roman, DVM, MPH; June 2026)',
    url: 'https://www.merckvetmanual.com/dog-owners/disorders-affecting-multiple-body-systems-of-dogs/salmon-poisoning-disease-and-elokomin-fluke-fever-in-dogs',
  },
  merckSalmon: {
    name: 'Merck Veterinary Manual, Salmon Poisoning Disease in Dogs (Jean-Sebastien Palerme, DVM, DACVIM; June 2026)',
    url: 'https://www.merckvetmanual.com/infectious-diseases/rickettsial-diseases-in-dogs/salmon-poisoning-disease-in-dogs',
  },
  akcSalmon: akc(
    'Can Dogs Eat Salmon?',
    'can-dogs-eat-salmon',
    'Colt Dodd; reviewed by Ashly Smith, DVM, February 2026',
  ),
  petmdSalmon: petmd(
    'Can Dogs Eat Salmon?',
    'can-dogs-eat-salmon',
    'reviewed by Sandra C. Mitchell, DVM, DABVP, March 2023',
  ),
  akcPork: akc('Can Dogs Eat Pork?', 'can-dogs-eat-pork', 'Alexandra Anastasio, April 2026'),
  petmdPork: petmd(
    'Can Dogs Eat Pork?',
    'can-dogs-eat-pork',
    'reviewed by Molly Price, DVM, March 2025',
  ),
  akcHam: akc('Can Dogs Eat Ham?', 'can-dogs-eat-ham', 'Jan Reisen, May 2025'),
  petmdHam: petmd(
    'Can Dogs Eat Ham?',
    'can-dogs-eat-ham',
    'reviewed by Veronica Higgs, DVM, February 2023',
  ),
  chewyBacon: {
    name: 'Chewy, Can Dogs Eat Bacon? (Katie Koschalk; reviewed by Hannah Hart, DVM, October 2025)',
    url: 'https://www.chewy.com/education/dog/food-and-nutrition/can-dogs-eat-bacon',
  },
  firstvetBacon: {
    name: 'FirstVet, Can Dogs Eat Bacon? (September 2021)',
    url: 'https://firstvet.com/us/articles/can-dogs-eat-bacon',
  },
  merckPancreatitis: {
    name: 'Merck Veterinary Manual (pet owner version), Pancreatitis and Other Disorders of the Pancreas in Dogs (Jörg M. Steiner, Med Vet, Dr Med Vet, PhD; December 2024)',
    url: 'https://www.merckvetmanual.com/dog-owners/digestive-disorders-of-dogs/pancreatitis-and-other-disorders-of-the-pancreas-in-dogs',
  },

  // pantry
  fdaXylitol: {
    name: 'FDA, Paws Off Xylitol; It’s Dangerous for Dogs (consumer update, December 2025)',
    url: 'https://www.fda.gov/consumers/consumer-updates/paws-xylitol-its-dangerous-dogs',
  },
  akcPeanutButter: akc(
    'Can Dogs Eat Peanut Butter?',
    'can-dogs-eat-peanut-butter',
    'Anna Burke, March 2026',
  ),
  petmdPeanutButter: petmd(
    'Can Dogs Eat Peanut Butter?',
    'can-dogs-eat-peanut-butter',
    'reviewed by Teresa Manucy, DVM, August 2025',
  ),
  akcHoney: akc('Can Dogs Eat Honey?', 'can-dogs-eat-honey', 'Anna Burke, October 2026'),
  petmdHoney: petmd(
    'Can Dogs Eat Honey?',
    'can-dogs-eat-honey',
    'reviewed by Sandra C. Mitchell, DVM, DABVP, March 2025',
  ),
  merckChocolate: {
    name: 'Merck Veterinary Manual, Chocolate Toxicosis in Animals (Cristine Hayes, DVM, ASPCA APCC; reviewed by Ahna Brutlag, DVM, DABT, DABVT; updated February 2026)',
    url: 'https://www.merckvetmanual.com/toxicology/food-hazards/chocolate-toxicosis-in-animals',
  },
  akcChocolate: akc(
    'Chocolate Toxicity in Dogs',
    'can-dogs-eat-chocolate',
    'AKC Staff, March 2026',
  ),
  akcRice: akc(
    'Can Dogs Eat Rice?',
    'can-dogs-eat-rice',
    'Alexandra Anastasio; reviewed by Steve Weinberg, DVM, and Carly Fox, DVM, February 2025',
  ),
  petmdRice: petmd(
    'Can Dogs Eat Rice?',
    'can-dogs-eat-rice',
    'reviewed by Brittany Kleszynski, DVM, September 2026',
  ),
  akcPopcorn: akc('Can Dogs Eat Popcorn?', 'can-dogs-eat-popcorn', 'Anna Burke, October 2026'),
  petmdPopcorn: petmd(
    'Can Dogs Eat Popcorn?',
    'can-dogs-eat-popcorn',
    'reviewed by Sandra C. Mitchell, DVM, DABVP, November 2022',
  ),
  merckBreadDough: {
    name: 'Merck Veterinary Manual, Bread Dough Toxicosis in Animals (Cristine Hayes, DVM; reviewed by Ahna Brutlag, DVM, DABT, DABVT; August 2025)',
    url: 'https://www.merckvetmanual.com/toxicology/food-hazards/bread-dough-toxicosis-in-animals',
  },
  merckFoodHazards: {
    name: 'Merck Veterinary Manual (pet owner version), Food Hazards (Sharon M. Gwaltney-Brant, DVM, PhD, DABVT, DABT; May 2026)',
    url: 'https://www.merckvetmanual.com/special-pet-topics/poisoning/food-hazards',
  },
  akcBread: akc('Can Dogs Eat Bread?', 'can-dogs-eat-bread', 'Anna Burke, May 2025'),
  petmdBread: petmd(
    'Can Dogs Eat Bread?',
    'can-dogs-eat-bread',
    'reviewed by Sandra C. Mitchell, DVM, DABVP, December 2022',
  ),
  akcAlmonds: akc('Can Dogs Eat Almonds?', 'can-dogs-eat-almonds', 'Anna Burke, March 2025'),
  petmdAlmonds: petmd(
    'Can Dogs Eat Almonds?',
    'can-dogs-eat-almonds',
    'reviewed by Sandra C. Mitchell, DVM, DABVP, November 2022',
  ),
  petmdNuts: petmd(
    'Can Dogs Eat Nuts?',
    'evr_dg_dog-owners-guide-to-nuts-and-seeds',
    'Amanda Ardente, DVM, PhD; reviewed by Veronica Higgs, DVM, January 2023',
  ),
  akcCashews: akc('Can Dogs Eat Cashews?', 'can-dogs-eat-cashews', 'Anna Burke, February 2025'),
  petmdCashews: petmd(
    'Can Dogs Eat Cashews?',
    'can-dogs-eat-cashews',
    'reviewed by Sandra C. Mitchell, DVM, DABVP, December 2022',
  ),
  merckMacadamia: {
    name: 'Merck Veterinary Manual, Macadamia Nut Toxicosis in Dogs (Cristine Hayes, DVM; reviewed by Ahna Brutlag, DVM, DABT, DABVT; September 2024)',
    url: 'https://www.merckvetmanual.com/toxicology/food-hazards/macadamia-nut-toxicosis-in-dogs',
  },
  aspcaMacadamia: {
    name: 'ASPCA, Animal Poison Control Alert: Macadamia Nuts are Toxic to Dogs (October 2015)',
    url: 'https://www.aspca.org/news/animal-poison-control-alert-macadamia-nuts-are-toxic-dogs',
  },
  vcaMacadamia: {
    name: 'VCA Animal Hospitals, Macadamia Nut Poisoning in Dogs (Renee Schmid, DVM, DABT, DABVT; Ahna Brutlag, DVM; August 2026)',
    url: 'https://vcahospitals.com/know-your-pet/macadamia-nut-poisoning',
  },
  akcMacadamia: akc(
    'Can Dogs Eat Macadamia Nuts?',
    'can-dogs-eat-macadamia-nuts',
    'Jan Reisen, February 2025',
  ),
  merckXylitol: {
    name: 'Merck Veterinary Manual, Xylitol Toxicosis in Dogs (Cristine Hayes, DVM; Ahna Brutlag, DVM, DABT, DABVT; June 2025)',
    url: 'https://www.merckvetmanual.com/toxicology/food-hazards/xylitol-toxicosis-in-dogs',
  },
  vcaXylitol: {
    name: 'VCA Animal Hospitals, Xylitol Poisoning in Dogs (Renee Schmid, DVM, DABT, DABVT; Ahna Brutlag, DVM; October 2026)',
    url: 'https://vcahospitals.com/know-your-pet/xylitol-toxicity-in-dogs',
  },
  dvm360Xylitol: {
    name: 'dvm360, People food toxic to pets: Xylitol (Ahna Brutlag, DVM, MS, DABT, DABVT; May 2010)',
    url: 'https://dvm360.com/view/people-food-toxic-pets-xylitol',
  },
} as const satisfies Record<string, PageSource>;
