import { Rational } from '@maestro-calc/core';
import { S } from './sources.ts';
import type { Food } from './types.ts';

/** Merck's methylxanthines per gram of chocolate (the chocolate calculator's own figures). */
const MG_PER_GRAM = {
  milk: Rational.of(23, 10),
  dark: Rational.of(56, 10),
  baking: Rational.of(155, 10),
};

/** The grams of chocolate per kg of dog that reach Merck's first band, 20 mg/kg of methylxanthines. */
const firstBand = (mgPerGram: Rational): Rational => Rational.of(20).div(mgPerGram);

/** The pantry foods of the "can dogs eat" pages: spreads, sweets, grains, snacks and nuts. */
export const PANTRY: readonly Food[] = [
  {
    id: 'peanut-butter',
    name: 'peanut butter',
    alternates: [],
    verdict: 'moderation',
    answer: 'if it has no xylitol',
    summary:
      'Plain peanut butter is fine in small amounts if the label has no xylitol (birch sugar), which is toxic to dogs.',
    why: [
      'PetMD and AKC both say dogs can eat peanut butter in moderation. AKC credits it with protein, healthy fats, vitamins B and E and niacin; PetMD warns it holds a significant amount of fat and calories.',
      'The real danger is a sweetener. The FDA warns that some peanut and nut butters contain xylitol, also sold as birch sugar or wood sugar, which can make a dog’s pancreas release insulin and drop its blood sugar within 10 to 60 minutes. The ASPCA adds possible liver damage.',
    ],
    serve: [
      'Read the label first and make sure it has no xylitol (FDA). Unsalted peanut butter with no added sugar is best (AKC).',
      'A small lick, in a toy or on a spoon, as an occasional treat inside the 10% rule (PetMD, AKC).',
    ],
    never: [
      'Any peanut butter, nut butter or spread with xylitol or birch sugar (FDA, PetMD).',
      'Peanut butter cups, cookies and other chocolate or sugar-free sweets.',
    ],
    signs: [
      'If the jar had xylitol: vomiting, then weakness, staggering, collapse and seizures as the blood sugar falls (FDA). The FDA says signs can start within 10 to 60 minutes but may take 12 to 24 hours; call your veterinarian, an emergency clinic or a poison line right away.',
    ],
    usda: {
      fdc: 172470,
      description: 'Peanut butter, smooth style, without salt',
      kcalPer100g: 598,
    },
    piece: {
      grams: 16,
      one: 'tablespoon',
      many: 'tablespoons',
      basis: 'half of USDA’s 2 tablespoons = 32 g',
    },
    sizeGuide: {
      by: 'PetMD',
      note: 'PetMD’s amounts. AKC gives no table and says to keep all treats within 10% of the day.',
      rows: [
        ['Extra-small (2 to 10 lb)', '½ teaspoon, once a day'],
        ['Small (11 to 20 lb)', '½ teaspoon, twice a day'],
        ['Medium (21 to 50 lb)', '1 teaspoon, once a day'],
        ['Large (51 to 90 lb)', '1 teaspoon, twice a day'],
        ['Extra-large (91 lb and up)', '1 tablespoon, once a day'],
      ],
    },
    questions: [
      {
        question: 'How do I know if my peanut butter has xylitol?',
        answer:
          'Read the ingredient list. The FDA says xylitol may be listed as birch sugar or wood sugar; if any of the three names is there, it is not for your dog.',
      },
    ],
    links: ['food-xylitol-gum'],
    sources: [S.fdaXylitol, S.petmdPeanutButter, S.akcPeanutButter, S.aspcaFoods],
  },
  {
    id: 'honey',
    name: 'honey',
    alternates: [],
    verdict: 'moderation',
    answer: 'a tiny amount, not for puppies',
    summary:
      'A little honey is safe for most adult dogs, but it is nearly all sugar, and raw honey is not for puppies.',
    why: [
      'AKC: honey is safe for dogs to eat in small quantities. PetMD says dogs can have it in moderation as an occasional treat.',
      'It is mostly sugar, and PetMD says too much sugar can upset a dog’s stomach and add to obesity and diabetes; AKC adds tooth decay. On USDA’s figures a tablespoon holds about 64 kcal, a large share of a small dog’s treat budget.',
      'Raw honey may contain Clostridium botulinum spores (PetMD), which is why the sources keep it from puppies and dogs with weak immune systems.',
    ],
    serve: [
      'A small amount, once or twice a week at most (PetMD); less is more, especially for small breeds (AKC).',
      'AKC suggests brushing your dog’s teeth afterwards.',
    ],
    never: [
      'Raw honey for puppies under a year, or for dogs with weakened immune systems such as those on chemotherapy (PetMD, AKC).',
      'Honey for a diabetic dog (AKC, PetMD).',
    ],
    usda: { fdc: 169640, description: 'Honey', kcalPer100g: 304 },
    piece: {
      grams: 7,
      one: 'teaspoon',
      many: 'teaspoons',
      basis: 'a third of USDA’s tablespoon of 21 g',
    },
    sizeGuide: {
      by: 'PetMD',
      note: 'PetMD’s amounts, once or twice a week at most.',
      rows: [
        ['Extra-small (2 to 10 lb)', '⅛ teaspoon'],
        ['Small (11 to 20 lb)', '¼ teaspoon'],
        ['Medium (21 to 50 lb)', '½ to 1 teaspoon'],
        ['Large (51 to 90 lb)', '2 teaspoons'],
        ['Extra-large (91 lb and up)', '1 tablespoon'],
      ],
    },
    disagree: [
      'PetMD lists overweight dogs among those that should not have raw honey; AKC names puppies, dogs with weak immune systems and diabetic dogs, but not overweight dogs. AKC mentions possible benefits for sore throats and allergies, and says the allergy claims lack conclusive evidence.',
    ],
    questions: [
      {
        question: 'Does honey help a dog’s allergies?',
        answer:
          'AKC says the claims that local honey relieves allergies lack conclusive evidence. Ask your veterinarian about allergy treatment.',
      },
    ],
    sources: [S.akcHoney, S.petmdHoney],
  },
  {
    id: 'chocolate',
    name: 'chocolate',
    alternates: [],
    verdict: 'toxic',
    answer: 'chocolate is toxic to dogs',
    summary:
      'Chocolate holds theobromine and caffeine, which dogs clear slowly; the darker it is, the less it takes.',
    why: [
      'Merck names the toxic principles: theobromine and caffeine, the methylxanthines of cocoa. The ASPCA says they can cause vomiting and diarrhea, panting, thirst, a racing heart rhythm, tremors, seizures and even death.',
      'The dose depends on the kind, the amount and the dog. Merck lists about 2.3 mg of methylxanthines per gram of milk chocolate, 5.6 for semisweet and dark, and 15.5 for unsweetened baking chocolate, and puts mild signs at 20 mg/kg, heart effects at 40 to 50 mg/kg and seizures at 60 mg/kg and up.',
    ],
    serve: [
      'Call your veterinarian or the ASPCA poison line now, even if your dog seems fine: signs usually start 6 to 12 hours later (Merck).',
      'Have the wrapper, the amount missing and your dog’s weight ready, then use the chocolate calculator to see the dose the veterinarian will ask about.',
    ],
    never: [
      'Every kind of chocolate, cocoa powder and cacao nibs, and brownies, cakes and cookies made with them.',
      'Chocolate with raisins, macadamia nuts or xylitol adds a second poison.',
    ],
    signs: [
      'Merck: signs usually appear 6 to 12 hours after the dog ate it, starting with thirst, vomiting, diarrhea, a swollen belly and restlessness, and can progress to hyperactivity, tremors and seizures. In severe cases they can last up to 72 hours.',
    ],
    piece: { grams: 28.35, one: 'ounce', many: 'ounces', basis: '1 oz = 28.35 g' },
    thresholds: [
      {
        label: 'Milk chocolate at 20 mg/kg',
        lead: 'Merck’s first band of 20 mg/kg in milk chocolate',
        gramsPerKg: firstBand(MG_PER_GRAM.milk),
      },
      {
        label: 'Dark or semisweet at 20 mg/kg',
        lead: 'Merck’s first band of 20 mg/kg in dark chocolate',
        gramsPerKg: firstBand(MG_PER_GRAM.dark),
      },
      {
        label: 'Baking chocolate at 20 mg/kg',
        lead: 'Merck’s first band of 20 mg/kg in baking chocolate',
        gramsPerKg: firstBand(MG_PER_GRAM.baking),
      },
    ],
    thresholdNote:
      'The amount of each kind that reaches 20 mg/kg, where Merck lists the first mild signs, worked from its milligrams per gram at four weights. Less than this is not an all clear; the calculator works out any amount and kind, and the call comes first.',
    questions: [
      {
        question: 'Is white chocolate toxic to dogs?',
        answer:
          'It holds very little theobromine: the ASPCA names white chocolate as the least dangerous kind. Call your veterinarian with the amount and the label to be sure.',
      },
    ],
    links: ['chocolate', 'chocolate-guide', 'chocolate-chart'],
    sources: [S.merckChocolate, S.aspcaFoods, S.akcChocolate, S.aspcaLine],
  },
  {
    id: 'rice',
    name: 'rice',
    alternates: [],
    verdict: 'safe',
    answer: 'plain cooked rice is safe',
    summary:
      'Plain white or brown rice, boiled in water, is safe for dogs and a common bland food for an upset stomach.',
    why: [
      'AKC says dogs can safely eat rice boiled in water only, and PetMD says plain cooked white or brown rice is safe in moderation.',
      'It is bland and easy to digest. AKC quotes Dr. Steve Weinberg: rice helps to bind the stool in cases of diarrhea. White rice is the one for an upset stomach, being lower in fiber (AKC).',
    ],
    serve: [
      'Boil it in water with no seasoning, butter or spices (AKC), and let it cool.',
      'For a stomach upset, PetMD mixes it two to one with boiled, boneless, skinless chicken or turkey.',
    ],
    never: ['Fried rice and rice seasoned with garlic or onion (PetMD).'],
    usda: {
      fdc: 168878,
      description: 'Rice, white, long-grain, regular, enriched, cooked',
      kcalPer100g: 130,
    },
    piece: {
      grams: 9.9,
      one: 'tablespoon',
      many: 'tablespoons',
      basis: 'a sixteenth of USDA’s cup of 158 g',
    },
    sizeGuide: {
      by: 'PetMD',
      note: 'PetMD’s amounts as a treat, two or three times a week, cooked.',
      rows: [
        ['Extra-small (2 to 10 lb)', '1 to 2 tablespoons'],
        ['Small (11 to 20 lb)', '2 to 3 tablespoons'],
        ['Medium (21 to 50 lb)', '¼ cup'],
        ['Large (51 to 90 lb)', '½ cup'],
        ['Extra-large (91 lb and up)', '⅔ cup'],
      ],
    },
    questions: [
      {
        question: 'Is rice good for a dog with diabetes?',
        answer:
          'AKC says diabetic dogs should avoid regular white rice for its higher glycemic index, and PetMD says to ask your veterinarian first.',
      },
    ],
    links: ['dog'],
    sources: [S.akcRice, S.petmdRice],
  },
  {
    id: 'popcorn',
    name: 'popcorn',
    alternates: [],
    verdict: 'moderation',
    answer: 'plain and air-popped only',
    summary:
      'A few pieces of plain, air-popped popcorn are fine; butter, salt and unpopped kernels are the problems.',
    why: [
      'AKC: plain, air-popped popcorn is generally safe for dogs in small amounts. PetMD says completely plain, air-popped popcorn, with no oil, butter, salt or sugar.',
      'Cinema and microwave popcorn are another food: PetMD says butter can upset the stomach and lead to pancreatitis, and salt to salt poisoning.',
    ],
    serve: [
      'Air-popped and plain, as an occasional treat (AKC).',
      'Only fully popped pieces (AKC, PetMD).',
    ],
    never: [
      'Unpopped and half-popped kernels: they lodge between teeth and can choke a dog or block its gut (AKC, PetMD).',
      'Buttered, salted, caramel or flavored popcorn (AKC, PetMD).',
    ],
    signs: [
      'A few dropped pieces likely will not hurt, but AKC says to call your veterinarian for vomiting, diarrhea or lethargy.',
    ],
    usda: { fdc: 167959, description: 'Snacks, popcorn, air-popped', kcalPer100g: 387 },
    piece: { grams: 8, one: 'cup', many: 'cups', basis: 'USDA: 1 cup = 8 g' },
    sizeGuide: {
      by: 'PetMD',
      note: 'PetMD’s serving table, in pieces.',
      rows: [
        ['Extra-small (2 to 20 lb)', '1 to 2 pieces'],
        ['Small (21 to 30 lb)', '2 to 3 pieces'],
        ['Medium (31 to 50 lb)', '5 to 6 pieces'],
        ['Large (51 to 90 lb)', 'A small handful'],
        ['Extra-large (91 lb and up)', 'A handful'],
      ],
    },
    questions: [
      {
        question: 'Can dogs eat microwave popcorn?',
        answer:
          'Not as sold: it is made with oil, butter flavoring and salt. AKC and PetMD allow only plain, air-popped popcorn.',
      },
    ],
    sources: [S.akcPopcorn, S.petmdPopcorn],
  },
  {
    id: 'bread',
    name: 'bread',
    alternates: [],
    verdict: 'moderation',
    answer: 'plain bread, never raw dough',
    summary:
      'Plain white or wheat bread is safe in small pieces, but raw yeast dough is an emergency.',
    why: [
      'AKC says plain white and wheat bread are generally safe for dogs in moderation, and calls bread essentially a filler food. PetMD says it offers little nutrition.',
      'Raw yeast dough is the danger. The ASPCA says it can rise and swell the stomach, and Merck explains that the yeast also makes ethanol, which is absorbed into the blood and causes drunkenness and acidosis. PetMD calls it a medical emergency, with a risk of bloat and twisted stomach.',
    ],
    serve: [
      'Plain bread, a small piece at a time (AKC).',
      'If your dog ate raw dough, call your veterinarian or the ASPCA poison line at once (PetMD).',
    ],
    never: [
      'Raw bread or pizza dough (ASPCA, Merck).',
      'Bread with raisins, chocolate, xylitol, garlic, onion, nutmeg or nuts, such as garlic bread, banana bread or raisin toast (PetMD, AKC).',
    ],
    signs: [
      'Raw dough: retching without bringing anything up, a swollen belly and lethargy first (Merck), then a wobbly walk, disorientation, weakness, low blood sugar and, in severe cases, seizures or coma.',
    ],
    usda: {
      fdc: 174924,
      description: 'Bread, white, commercially prepared',
      kcalPer100g: 266,
      sodiumPer100g: 490,
    },
    piece: { grams: 29, one: 'slice', many: 'slices', basis: 'USDA: 1 slice = 29 g' },
    questions: [
      {
        question: 'My dog ate raw pizza dough. What should I do?',
        answer:
          'Call your veterinarian or a poison line now. The dough keeps rising in the warm stomach and makes alcohol as it ferments (ASPCA, Merck); PetMD treats it as an emergency.',
      },
    ],
    links: ['food-raisins', 'food-garlic'],
    sources: [S.akcBread, S.petmdBread, S.aspcaFoods, S.merckBreadDough, S.merckFoodHazards],
  },
  {
    id: 'almonds',
    name: 'almonds',
    alternates: [],
    verdict: 'avoid',
    answer: 'too fatty, and a choking risk',
    summary:
      'Almonds are not poisonous like macadamias, but they are fatty, often salted, and a choking hazard for dogs.',
    why: [
      'AKC answers no. Almonds, like most nuts, are high in fat, which can bring on pancreatitis (AKC, PetMD), and packaged almonds are often heavily salted (PetMD). The ASPCA says the oils and fats of nuts can cause vomiting and diarrhea.',
      'Their size and shape is the other problem: AKC says an almond can block a dog’s esophagus, intestines or windpipe, especially in small breeds.',
    ],
    serve: [
      'One or two almonds: watch your dog closely. More than a few: call your veterinarian or an emergency clinic (AKC).',
      'For a small breed or a larger amount, PetMD says to call at once; within about 30 minutes, the veterinarian may decide to make it vomit.',
    ],
    never: [
      'Whole almonds, in or out of the shell, salted or flavored almonds (AKC, PetMD).',
      'Almond butter with salt, sugar or xylitol (PetMD).',
    ],
    signs: [
      'Vomiting, diarrhea, gas, loss of appetite and lethargy; gagging, bloating or choking if one is stuck (AKC, PetMD).',
    ],
    usda: { fdc: 170567, description: 'Nuts, almonds', kcalPer100g: 579 },
    piece: { grams: 1.2, one: 'almond', many: 'almonds', basis: 'USDA: 1 almond = 1.2 g' },
    questions: [
      {
        question: 'Are almonds toxic to dogs?',
        answer:
          'Not in the way macadamia nuts are. The sources warn against them for their fat and salt and the risk of a blockage (AKC, PetMD).',
      },
    ],
    links: ['food-macadamia-nuts', 'food-cashews'],
    sources: [S.aspcaFoods, S.akcAlmonds, S.petmdAlmonds, S.petmdNuts],
  },
  {
    id: 'cashews',
    name: 'cashews',
    alternates: [],
    verdict: 'moderation',
    answer: 'a plain one or two at most',
    summary:
      'A plain, unsalted cashew or two is not toxic, but cashews are fatty and mixed nuts may hide macadamias.',
    why: [
      'PetMD says cashews are not toxic to dogs, and AKC says they are generally safe. Both stop at a few: cashews are high in fat, which AKC says can lead to pancreatitis, a potentially life-threatening condition.',
      'AKC sees no reason to feed nuts to a dog at all; PetMD notes that cashews are softer than most nuts, so less of a choking risk.',
    ],
    serve: [
      'Plain, unsalted cashews only, as a rare treat (AKC). Chop or grind them over the food to cut the choking risk (PetMD).',
    ],
    never: [
      'Salted cashews: AKC says the salt can cause vomiting, weakness, diarrhea, tremors and seizures.',
      'Mixed nuts and variety packs, which may hold macadamia nuts (AKC, PetMD).',
    ],
    signs: ['Vomiting or diarrhea; rarely an allergy, with swelling, itching and hives (PetMD).'],
    usda: {
      fdc: 170572,
      description: 'Nuts, cashew nuts, oil roasted, without salt added',
      kcalPer100g: 580,
    },
    piece: {
      grams: 1.575,
      one: 'cashew',
      many: 'cashews',
      basis: 'USDA: 1 oz (18 kernels) = 28.35 g',
    },
    sizeGuide: {
      by: 'PetMD',
      note: 'PetMD’s amounts of whole cashews. AKC gives no amount and discourages nuts.',
      rows: [
        ['Extra-small (2 to 20 lb)', '1 or 2 cashews'],
        ['Small (21 to 30 lb)', '2 to 3 cashews'],
        ['Medium (31 to 50 lb)', '5 to 6 cashews'],
        ['Large (51 to 90 lb)', '10 to 12 cashews'],
        ['Extra-large (91 lb and up)', '12 to 18 cashews'],
      ],
    },
    questions: [
      {
        question: 'Can dogs eat mixed nuts?',
        answer:
          'No: a mix may contain macadamia nuts, which are toxic to dogs, and is usually salted (AKC, PetMD).',
      },
    ],
    links: ['food-macadamia-nuts', 'food-almonds'],
    sources: [S.akcCashews, S.petmdCashews, S.petmdNuts],
  },
  {
    id: 'macadamia-nuts',
    name: 'macadamia nuts',
    alternates: [],
    verdict: 'toxic',
    answer: 'macadamia nuts are toxic to dogs',
    summary:
      'Macadamia nuts cause weakness, tremors and fever in dogs within 12 hours; the cause is unknown.',
    why: [
      'The ASPCA: macadamia nuts can cause weakness, incoordination, depression, vomiting, tremors and hyperthermia in dogs. Merck describes the poisoning in dogs; how the nut does it is not known (Merck, VCA).',
      'Merck reports signs in dogs that ate 2.4 g per kg of body weight, which is only a few nuts for a small dog. VCA says it takes only a few nuts to make a dog ill.',
    ],
    serve: [
      'Call your veterinarian or the ASPCA poison line. For a dog that ate them recently, Merck says veterinarians make it vomit above 1 to 2 g per kg.',
      'Go to an emergency clinic if your dog cannot stand or walk, or has severe tremors (ASPCA).',
    ],
    never: ['Macadamia nuts, mixed nuts, and cookies, brownies and chocolates made with them.'],
    signs: [
      'Merck: within 12 hours, weakness (most often in the hind legs), depression, vomiting, a wobbly walk, tremors or fever. The signs generally pass within 12 to 48 hours; VCA expects full recovery within 24 to 48 hours with treatment.',
      'Chocolate-covered macadamias add chocolate poisoning to the nut.',
    ],
    disagree: [
      'On how worried to be: Merck calls the signs generally mild and self-limiting, and the ASPCA says most cases can be managed at home with a veterinary professional’s guidance. VCA and AKC say to call a veterinarian or poison line at once. Calling is how you get that guidance either way.',
    ],
    usda: { fdc: 170178, description: 'Nuts, macadamia nuts, raw', kcalPer100g: 718 },
    piece: {
      grams: 2.58,
      one: 'nut',
      many: 'nuts',
      basis: 'USDA: 1 oz (10 to 12 kernels) = 28.35 g, at 11 a ounce',
    },
    thresholds: [
      {
        label: 'Merck: signs reported at 2.4 g/kg',
        lead: 'the 2.4 g/kg at which Merck reports signs',
        gramsPerKg: Rational.of(24, 10),
      },
    ],
    thresholdNote:
      'The grams of macadamia nuts that reach the 2.4 g/kg where Merck reports signs in dogs, worked at four weights, and the same in nuts of about 2.6 g (USDA’s ounce of 10 to 12 kernels). It is a reported case, not a safe line.',
    questions: [
      {
        question: 'How many macadamia nuts can hurt a dog?',
        answer:
          'Merck reports signs at 2.4 g per kg of body weight. That is a handful of nuts for a small dog and more for a large one, as the table shows; VCA says only a few nuts can make a dog ill.',
      },
    ],
    links: ['food-cashews', 'food-almonds', 'chocolate'],
    sources: [
      S.merckMacadamia,
      S.aspcaFoods,
      S.aspcaMacadamia,
      S.vcaMacadamia,
      S.akcMacadamia,
      S.petmdNuts,
    ],
  },
  {
    id: 'xylitol-gum',
    name: 'xylitol gum',
    alternates: [
      {
        name: 'birch sugar',
        answer:
          'No. Birch sugar is another name for xylitol (FDA), and VCA adds wood sugar and birch bark extract: the same sweetener and the same danger.',
      },
    ],
    verdict: 'toxic',
    answer: 'xylitol in gum is toxic to dogs',
    summary:
      'Xylitol, in sugar-free gum, mints and some nut butters, drops a dog’s blood sugar fast and can destroy the liver.',
    why: [
      'The FDA warns that in dogs xylitol can cause a potent release of insulin from the pancreas and a rapid, profound fall in blood sugar. Merck, VCA and the ASPCA describe the same poisoning, and higher doses cause liver failure.',
      'Merck gives the doses: low blood sugar from more than about 100 mg per kg of body weight, and liver failure above 500 mg per kg. One piece of gum or a breath mint holds 0.22 to 1.0 g of xylitol, according to a veterinary toxicologist, Dr. Ahna Brutlag, writing in dvm360.',
    ],
    serve: [
      'Call your veterinarian, an emergency clinic or a poison line right away, or go straight in (FDA). Bring the pack: the brand and how many pieces are what the veterinarian needs.',
      'Do not make your dog vomit unless the veterinarian tells you to (VCA).',
    ],
    never: [
      'Sugar-free gum, mints and candy, and anything sweetened with xylitol, birch sugar or wood sugar.',
      'The FDA also lists some peanut and nut butters, baked goods, toothpaste and mouthwash, chewable vitamins, cough syrup and supplements.',
    ],
    signs: [
      'Low blood sugar within 10 to 60 minutes (FDA) or about 30 minutes (Merck), though it can be delayed up to 12 to 18 hours (Merck), and gum can slow it (Merck’s owner guide): vomiting, weakness, staggering, collapse and seizures.',
      'Liver failure may not show for 24 to 48 hours or more (Merck). In dogs with severe liver injury, Merck reports that 62.5% died or were euthanized despite aggressive treatment.',
    ],
    disagree: [
      'The timing differs between sources: 10 to 15 minutes for dvm360, 10 to 60 minutes for the FDA, about 30 minutes for Merck and 30 minutes to two hours for VCA. The FDA and VCA both say to call right away rather than wait for them.',
    ],
    usda: { fdc: 169882, description: 'Chewing gum, sugarless', kcalPer100g: 268 },
    piece: { grams: 2, one: 'piece of gum', many: 'pieces of gum', basis: 'USDA: 1 piece = 2 g' },
    compound: { name: 'xylitol', perPiece: [Rational.of(1), Rational.of(22, 100)] },
    thresholds: [
      {
        label: 'Merck: low blood sugar above 0.1 g/kg',
        lead: 'the 0.1 g of xylitol per kg where Merck says blood sugar falls',
        gramsPerKg: Rational.of(1, 10),
      },
      {
        label: 'Merck: liver failure above 0.5 g/kg',
        lead: 'the 0.5 g per kg Merck links with liver failure',
        gramsPerKg: Rational.of(1, 2),
      },
    ],
    thresholdNote:
      'The xylitol that reaches each of Merck’s lines at four weights, and how many pieces of gum hold it: from a strong gum with 1 g a piece to a light one with 0.22 g (dvm360). Read the pack: the true figure is on the brand, and the call comes first.',
    questions: [
      {
        question: 'My dog ate one piece of sugar-free gum. Is that enough to matter?',
        answer:
          'It can be. A strong gum with 1 g of xylitol a piece passes Merck’s line for low blood sugar in any dog under about 22 lb, as the table shows. Call right away and have the pack ready.',
      },
    ],
    links: ['food-peanut-butter'],
    sources: [
      S.fdaXylitol,
      S.merckXylitol,
      S.merckFoodHazards,
      S.vcaXylitol,
      S.aspcaFoods,
      S.dvm360Xylitol,
    ],
  },
];
