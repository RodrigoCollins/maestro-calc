import { Rational } from '@maestro-calc/core';
import { KG_PER_LB } from '@maestro-calc/pets-core/energy';
import { S } from './sources.ts';
import type { Food } from './types.ts';

/** The vegetables of the "can dogs eat" pages. */
export const VEGETABLES: readonly Food[] = [
  {
    id: 'tomatoes',
    name: 'tomatoes',
    alternates: [],
    verdict: 'moderation',
    answer: 'ripe red flesh only',
    summary:
      'Ripe tomato flesh is non-toxic, but the green parts of the plant and unripe tomatoes are not.',
    why: [
      'The ASPCA lists the tomato plant as toxic to dogs, cats and horses for its solanine, and adds that the ripe fruit is non-toxic. AKC says dogs can eat ripe tomatoes, but only in small amounts.',
      'AKC names solanine and its cousin tomatine as the toxins, found mostly in the green parts of the plant; PetMD points to tomatine in the stems, leaves and unripe green tomatoes.',
      'Ripe tomatoes bring fiber, vitamin C, potassium and antioxidants such as lycopene (AKC, PetMD).',
    ],
    serve: [
      'Fully red, ripe tomatoes only. AKC: remove all the green parts and dice the flesh.',
      'Wash it, take off the stem and leaves, and serve it plain or mixed into the food (PetMD).',
    ],
    never: [
      'The leaves, stems and vines of the plant, and green, unripe tomatoes (ASPCA, AKC, PetMD). Keep dogs out of the vegetable bed.',
      'Tomato sauce, soup, ketchup and salsa, which often hold garlic and onion (AKC, PetMD).',
    ],
    signs: [
      'From the plant, the ASPCA lists drooling, loss of appetite, severe stomach upset, depression, weakness, dilated pupils and a slow heart rate. AKC adds loss of coordination, tremors and an irregular heartbeat.',
      'AKC: if your dog ate a large amount of tomatoes or the plant itself, call your veterinarian for guidance.',
    ],
    usda: {
      fdc: 170457,
      description: 'Tomatoes, red, ripe, raw, year round average',
      kcalPer100g: 18,
    },
    piece: {
      grams: 17,
      one: 'cherry tomato',
      many: 'cherry tomatoes',
      basis: 'USDA: 1 cherry tomato = 17 g',
    },
    questions: [
      {
        question: 'My dog ate tomato leaves from the garden. Is that serious?',
        answer:
          'The leaves and stems are the toxic parts (ASPCA). Call your veterinarian or the ASPCA line and say how much it ate and how big it is; AKC says to call for a large amount of tomatoes or any of the plant.',
      },
    ],
    sources: [S.aspcaTomato, S.akcTomatoes, S.petmdTomatoes],
  },
  {
    id: 'avocado',
    name: 'avocado',
    alternates: [],
    verdict: 'avoid',
    answer: 'the pit and the fat are risks',
    summary:
      'Dogs resist the persin in avocado better than birds or horses, but the pit, the fat and guacamole make it a poor treat.',
    why: [
      'Avocado is far more dangerous to other animals. The ASPCA plant list rates it toxic to horses, and its foods page says avocado is primarily a problem for birds, rabbits, donkeys, horses and ruminants. Merck says dogs seem relatively resistant, with a single report of two dogs whose hearts were damaged after eating it.',
      'The risks for a dog are elsewhere. Merck says a swallowed pit can block the gut. PetMD, written by a veterinarian, says its fat can cause pancreatitis and concludes the risks outweigh the benefits. The leaves, skin and pit hold the most persin (AKC, quoting Dr. Michael Hyder).',
    ],
    serve: [
      'If your dog ate some flesh, watch it for vomiting, diarrhea or lethargy and call your veterinarian if you see them (AKC).',
      'If it ate the pit or seems to be choking, PetMD says to go to an emergency clinic as quickly as possible.',
      'AKC and PetMD both set a ceiling for a taste of the plain flesh: no more than one teaspoon per 10 lb of body weight, worked out below. Skip even that for a dog prone to pancreatitis or overweight (AKC).',
    ],
    never: [
      'The pit, skin and leaves (PetMD, AKC).',
      'Guacamole: it holds onion, garlic and salt (PetMD).',
    ],
    signs: [
      'Vomiting, diarrhea and belly discomfort (PetMD), lethargy (AKC), and the signs of pancreatitis from the fat.',
    ],
    disagree: [
      'Many lists call avocado toxic to dogs. The primary sources here do not: the ASPCA plant entry names horses only, and Merck calls dogs relatively resistant. AKC and PetMD allow a small amount of flesh, and PetMD still advises against it.',
    ],
    thresholds: [
      {
        label: 'AKC and PetMD: at most, in teaspoons of plain flesh',
        lead: 'the ceiling AKC and PetMD set at one teaspoon per 10 lb',
        piecesPer10Lb: Rational.of(1),
        unit: { one: 'teaspoon', many: 'teaspoons' },
      },
    ],
    thresholdNote:
      'The ceiling AKC and PetMD give for a taste of plain avocado flesh, one teaspoon per 10 lb of body weight, worked at four weights. It is a most, not a serving the sources recommend.',
    questions: [
      {
        question: 'My dog ate guacamole. What should I do?',
        answer:
          'Call your veterinarian or a poison line. The avocado is the smaller worry: guacamole usually holds onion and garlic, both toxic to dogs (PetMD).',
      },
    ],
    links: ['food-onions', 'food-garlic'],
    sources: [S.aspcaAvocado, S.aspcaFoods, S.merckAvocado, S.akcAvocado, S.petmdAvocado],
  },
  {
    id: 'onions',
    name: 'onions',
    alternates: [],
    verdict: 'toxic',
    answer: 'onions are toxic to dogs',
    summary:
      'Onions in every form damage a dog’s red blood cells, and the signs often show only days later.',
    why: [
      'The ASPCA rates the onion toxic to dogs, cats and horses; its toxic principle is N-propyl disulfide. Merck says the sulfur-containing oxidants of the onion family destroy red blood cells (hemolysis), which can lead to anemia.',
      'Cooking does not help. AKC: whether raw or cooked, fried or powdered, onions and the rest of the allium family are harmful to dogs. PetMD adds green onions, chives and leeks.',
      'PetMD names the dogs most at risk: Japanese breeds such as the Akita and Shiba Inu, and dogs with diabetes, liver disease or anemia, or on certain medicines.',
    ],
    serve: [
      'Call your veterinarian or the ASPCA poison line now, even if your dog seems fine: the damage builds before it shows.',
      'Say how much onion it ate and in what form; onion powder, soup mix and gravy are concentrated.',
      'Do not wait for signs and do not treat it at home.',
    ],
    never: [
      'Onions raw, cooked, fried or powdered, and green onions, chives and leeks (AKC, PetMD).',
      'Leftovers made with them: stuffing, gravy, soup, pizza, burgers and baby food with onion powder.',
    ],
    signs: [
      'Merck: signs are generally not seen until substantial hemolysis has occurred, usually a few days after the dog ate the onion. PetMD says they may develop within a day or more.',
      'Watch for weakness, pale gums, red or brown urine, a fast heart and fast breathing, lethargy, loss of appetite and collapse (ASPCA, Merck, AKC). VCA says any amount can upset the stomach, and larger amounts damage the red cells; kidney damage can follow.',
    ],
    disagree: [
      'The sources draw the line in different places. PetMD says onion poisoning is consistently seen in dogs that eat more than 0.5% of their body weight in onion, and AKC’s 100 g per 20 kg of dog is the same figure. Merck reports clinical signs after 15 to 30 g of raw onion per kg, three to six times as much. The table shows both.',
    ],
    usda: { fdc: 170000, description: 'Onions, raw', kcalPer100g: 40 },
    piece: {
      grams: 110,
      one: 'medium onion',
      many: 'medium onions',
      basis: 'USDA: 1 medium (2½ in across) = 110 g',
    },
    thresholds: [
      {
        label: 'PetMD and AKC: 0.5% of body weight',
        lead: 'the 0.5% of body weight where PetMD says onion poisoning is consistently seen',
        gramsPerKg: Rational.of(5),
      },
      {
        label: 'Merck: signs reported from 15 g/kg',
        lead: 'the lowest dose Merck reports signs at, 15 g/kg',
        gramsPerKg: Rational.of(15),
      },
    ],
    thresholdNote:
      'The grams of onion that reach each source’s line at four weights, and the same in USDA medium onions of 110 g. They are where the sources see harm, not a safe amount below it: onion damage adds up, and some dogs react to less.',
    questions: [
      {
        question: 'My dog ate food cooked with onion. Is a little onion OK?',
        answer:
          'No amount is recommended. Call your veterinarian or the ASPCA line and say what the dish was and how much your dog ate; onion powder and dried onion hold far more per spoon than fresh onion.',
      },
      {
        question: 'How long after eating onion do signs start?',
        answer:
          'Often days: Merck says signs are usually not seen until a few days after the dog ate it, once enough red cells are destroyed. That is why the call comes before the signs.',
      },
    ],
    links: ['food-garlic'],
    sources: [S.aspcaOnion, S.aspcaFoods, S.merckAllium, S.akcOnions, S.petmdOnions, S.vcaAllium],
  },
  {
    id: 'garlic',
    name: 'garlic',
    alternates: [],
    verdict: 'toxic',
    answer: 'garlic is toxic to dogs',
    summary:
      'Garlic is several times more toxic to dogs than onion, in any form, and garlic powder is the most concentrated.',
    why: [
      'The ASPCA rates garlic toxic to dogs, cats and horses, for the same N-propyl disulfide as onion. Merck says garlic is 3 to 5 times more toxic than onion; AKC and PetMD say five times.',
      'PetMD: garlic is toxic to dogs in any form, fresh, dried or powdered. VCA says one teaspoon of garlic powder equals eight cloves of fresh garlic.',
      'AKC, with Dr. Michael Hyder, says dogs should not eat garlic even as an ingredient, such as in pizza crust, and does not recommend garlic-based flea and tick products. Akitas and Shiba Inus are more sensitive (AKC).',
    ],
    serve: [
      'Call your veterinarian or the ASPCA poison line. AKC says to call even for small amounts, because early treatment makes the difference.',
      'Say what form it was: a clove, a garlic bread, or powder, which is the most concentrated.',
    ],
    never: [
      'Fresh garlic, garlic powder, garlic salt, garlic bread and dishes cooked with garlic.',
      'Garlic supplements and garlic flea remedies (AKC).',
    ],
    signs: [
      'PetMD: signs generally show within 24 hours, but can take up to a week. AKC: vomiting and diarrhea within hours; pale gums, weakness, dark urine and anemia after two to five days.',
      'Also lethargy, drooling, fast breathing and a wobbly walk (PetMD, AKC).',
    ],
    disagree: [
      'PetMD says as little as 2 g of garlic per pound of body weight can cause stomach upset and vomiting, and that a 25 lb dog needs treatment after 50 g, about 10 cloves by its count of 5 g a clove. USDA weighs a clove at 3 g, so the same 50 g is about 17 USDA cloves. Merck gives no garlic dose, only that it is 3 to 5 times as toxic as onion.',
    ],
    usda: { fdc: 169230, description: 'Garlic, raw', kcalPer100g: 149 },
    piece: { grams: 3, one: 'clove', many: 'cloves', basis: 'USDA: 1 clove = 3 g' },
    thresholds: [
      {
        label: 'PetMD: stomach upset from 2 g per lb',
        lead: 'the 2 g per pound where PetMD says stomach upset and vomiting can start',
        gramsPerKg: Rational.of(2).div(KG_PER_LB),
      },
    ],
    thresholdNote:
      'PetMD’s figure of 2 g of garlic per pound of body weight, worked at four weights, in grams and in USDA cloves of 3 g. It is where PetMD says stomach upset starts; red cell damage comes with more. Call for any garlic.',
    questions: [
      {
        question: 'Is a little garlic good for dogs?',
        answer:
          'No. Every veterinary source here calls garlic toxic to dogs in any form, and AKC’s veterinarian does not recommend garlic products for fleas.',
      },
    ],
    links: ['food-onions'],
    sources: [S.aspcaGarlic, S.merckAllium, S.akcGarlic, S.petmdGarlic, S.vcaAllium],
  },
  {
    id: 'carrots',
    name: 'carrots',
    alternates: [],
    verdict: 'safe',
    answer: 'carrots are a safe, low-calorie treat',
    summary: 'Raw or cooked plain carrots are safe for dogs; cut them small so they cannot choke.',
    why: [
      'AKC says dogs can safely eat carrots as a healthy, low-calorie snack, and PetMD says they are safe for most dogs.',
      'They bring beta-carotene, which the body turns into vitamin A, fiber and potassium, and the crunch helps teeth (AKC, PetMD). At 35 kcal per 100 g for baby carrots (USDA), they are one of the lightest treats on this site.',
    ],
    serve: [
      'Wash or peel them to remove dirt and pesticides (AKC).',
      'Raw or cooked, plain (AKC, PetMD). Cut whole carrots and even carrot sticks into bite-size chunks to prevent choking (AKC); PetMD suggests slices about a quarter inch thick.',
    ],
    never: [
      'Whole carrots for a dog that gulps: large pieces can choke or block (AKC, PetMD).',
      'Carrots cooked with butter, salt, onion or garlic, and carrot cake.',
    ],
    usda: { fdc: 168568, description: 'Carrots, baby, raw', kcalPer100g: 35 },
    piece: {
      grams: 10,
      one: 'baby carrot',
      many: 'baby carrots',
      basis: 'USDA: 1 medium baby carrot = 10 g',
    },
    disagree: [
      'AKC suggests cold or frozen carrots for teething puppies; PetMD counts frozen carrots as a risk to teeth. PetMD also notes their natural sugar for diabetic or obese dogs.',
    ],
    questions: [
      {
        question: 'Can dogs eat carrots every day?',
        answer:
          'The sources treat carrots as a treat, so the 10% rule applies: on this page, a 25 lb dog’s whole treat budget is a lot of baby carrots, which is why the carrots should not be the only treat.',
      },
    ],
    sources: [S.akcCarrots, S.petmdCarrots],
  },
  {
    id: 'broccoli',
    name: 'broccoli',
    alternates: [],
    verdict: 'moderation',
    answer: 'plain, in small pieces',
    summary:
      'Plain broccoli is safe in small amounts, but AKC calls more than a quarter of the day’s intake toxic.',
    why: [
      'AKC, reviewed by its chief veterinarian, Dr. Jerry Klein, says dogs can eat broccoli cooked or raw with no seasoning or oil. It is high in fiber and vitamin C and low in fat (AKC).',
      'The limit comes from isothiocyanates in the florets, which can irritate the stomach (AKC, PetMD). AKC: broccoli is considered safe if it is less than 10% of the daily intake, and more than 25% is considered toxic. PetMD quotes a veterinary behaviorist, Dr. Leslie Sinn, putting the toxic line at more than 20% to 25% of the daily diet.',
    ],
    serve: [
      'Steam, boil or microwave it, chop it, let it cool and serve it plain (PetMD); AKC also allows it raw.',
      'Cut it into bite-sized pieces and start small (AKC).',
    ],
    never: [
      'Big pieces of stalk: AKC says they can block the esophagus, especially in small dogs, and PetMD calls raw stems a choking and blockage risk.',
      'Broccoli with butter, oil, cheese sauce or garlic.',
    ],
    signs: [
      'Stomach irritation: vomiting, gas or diarrhea. PetMD says to see an emergency veterinarian for choking, vomiting or diarrhea lasting more than 24 hours, a hard or bloated belly, or lethargy.',
    ],
    usda: { fdc: 170379, description: 'Broccoli, raw', kcalPer100g: 34 },
    piece: {
      grams: 31,
      one: 'spear',
      many: 'spears',
      basis: 'USDA: 1 spear (about 5 in long) = 31 g',
    },
    ceiling: {
      share: Rational.of(1, 4),
      label: 'AKC’s toxic line: 25% of the day',
    },
    sizeGuide: {
      by: 'PetMD',
      note: 'PetMD’s amounts, one to three times a week.',
      rows: [
        ['Extra-small (2 to 10 lb)', '½ to 1 teaspoon'],
        ['Small (11 to 20 lb)', '1 to 2 teaspoons'],
        ['Medium (21 to 50 lb)', '1 to 2 tablespoons'],
        ['Large (51 to 90 lb)', '2 to 3 tablespoons'],
        ['Extra-large (91 lb and up)', '3 to 4 tablespoons'],
      ],
    },
    disagree: [
      'AKC puts the toxic line at more than 25% of the daily intake; PetMD’s source says more than 20% to 25%. Neither says whether the share is of calories or of weight; the table reads it as calories, at the same maintenance need as the treat budget.',
    ],
    questions: [
      {
        question: 'Can dogs eat broccoli stalks?',
        answer:
          'Cut small and cooked, yes; whole or in big pieces, no. AKC warns the stalks can block the esophagus, especially in small dogs.',
      },
    ],
    sources: [S.akcBroccoli, S.petmdBroccoli],
  },
  {
    id: 'cucumber',
    name: 'cucumber',
    alternates: [],
    verdict: 'safe',
    answer: 'cucumber is a safe, light treat',
    summary:
      'Sliced plain cucumber is safe for dogs and almost all water; pickles are not the same food.',
    why: [
      'PetMD says cucumbers are safe and healthy for dogs, and AKC calls them safe and low in calories when served properly.',
      'They are about 96% water (AKC, PetMD), fat-free and very low in sodium (AKC), with vitamin K, potassium and magnesium (PetMD). On USDA’s figures, 15 kcal per 100 g, cucumber is the lightest of all the foods on this site’s list.',
    ],
    serve: [
      'Wash it and cut slices sized for your dog, never a whole cucumber (AKC). PetMD suggests slices no wider than an inch and about a quarter inch thick.',
      'Raw slices as a treat or topper, or frozen in a toy with dog-safe fruit (PetMD).',
    ],
    never: [
      'A whole cucumber or large chunks, which can choke or block the gut, especially in small dogs (PetMD, AKC).',
      'Pickles: PetMD says they hold a lot of salt and seasonings such as garlic and onion.',
    ],
    usda: { fdc: 168409, description: 'Cucumber, with peel, raw', kcalPer100g: 15 },
    piece: {
      grams: 52,
      one: 'half cup of slices',
      many: 'half cups of slices',
      basis: 'USDA: ½ cup of slices = 52 g',
    },
    sizeGuide: {
      by: 'PetMD',
      note: 'PetMD’s serving table, in slices.',
      rows: [
        ['Extra-small (2 to 20 lb)', '1 to 2 slices'],
        ['Small (21 to 30 lb)', '2 to 3 slices'],
        ['Medium (31 to 50 lb)', '5 to 6 slices'],
        ['Large (51 to 90 lb)', 'A handful of slices'],
        ['Extra-large (91 lb and up)', 'A large handful'],
      ],
    },
    questions: [
      {
        question: 'Can dogs eat cucumber skin?',
        answer:
          'Yes: the sources serve it with the peel on, washed and sliced. AKC gives about 8 calories per half cup of slices.',
      },
    ],
    sources: [S.akcCucumbers, S.petmdCucumbers],
  },
  {
    id: 'bell-peppers',
    name: 'bell peppers',
    alternates: [
      {
        name: 'capsicum',
        answer:
          'Yes, sweet capsicum is the bell pepper: plain, seeded and in small pieces it is safe. Hot chillies are not (PetMD).',
      },
    ],
    verdict: 'safe',
    answer: 'plain bell peppers are safe',
    summary:
      'Sweet bell peppers (capsicum) of any colour are safe for dogs, seeded and plain; hot peppers are not.',
    why: [
      'Dr. Carly Fox, a veterinarian quoted by AKC: they are not toxic, and they are a healthy alternative snack to share with your dog. PetMD says plain bell peppers are safe in moderation.',
      'Every colour is safe, and red has the most vitamins and antioxidants (AKC). They bring vitamins A, C, E and B6, beta-carotene and lutein (AKC) and fiber (PetMD).',
    ],
    serve: [
      'Remove the seeds and stem, which AKC says prevents indigestion.',
      'Serve it raw and chopped, or steamed or puréed, plain: no garlic, onion, salt, oil or butter (PetMD, AKC). The skin can be hard to chew raw (AKC).',
    ],
    never: [
      'Hot peppers: PetMD says never to feed dogs hot peppers or food seasoned with capsaicin, such as chili powder; AKC adds jalapeños.',
      'Stuffed peppers and pepper dishes cooked with onion or garlic.',
    ],
    signs: ['Too much bell pepper may cause vomiting or diarrhea (AKC), gas or bloating (PetMD).'],
    usda: { fdc: 170108, description: 'Peppers, sweet, red, raw', kcalPer100g: 26 },
    piece: {
      grams: 10,
      one: 'ring',
      many: 'rings',
      basis: 'USDA: 1 ring (3 in across, ¼ in thick) = 10 g',
    },
    sizeGuide: {
      by: 'PetMD',
      note: 'PetMD’s amounts per week. AKC gives a limit per serving instead: less than a quarter of a pepper at a time for a small dog, less than half for a large one.',
      rows: [
        ['Extra-small (2 to 10 lb)', '1 to 2 small pieces'],
        ['Small (11 to 20 lb)', 'Less than ¼ of a pepper, chopped'],
        ['Medium (21 to 50 lb)', '¼ of a pepper, chopped'],
        ['Large (51 to 90 lb)', '½ of a pepper, chopped'],
        ['Extra-large (91 lb and up)', '¾ of a pepper, chopped'],
      ],
    },
    disagree: [
      'AKC’s limits are per serving and PetMD’s per week, so for a large dog AKC allows almost half a pepper at a time where PetMD allows half a pepper in a week.',
    ],
    questions: [
      {
        question: 'Can dogs eat green bell peppers?',
        answer:
          'Yes. AKC says every colour is safe; red is simply the ripest, with the most vitamins and antioxidants.',
      },
    ],
    sources: [S.akcPeppers, S.petmdPeppers],
  },
  {
    id: 'zucchini',
    name: 'zucchini',
    alternates: [
      {
        name: 'courgette',
        answer:
          'Yes: courgette is the British name for zucchini, and plain courgette, raw or cooked, is safe for dogs in moderation (AKC, PetMD).',
      },
    ],
    verdict: 'safe',
    answer: 'plain zucchini is safe',
    summary:
      'Plain zucchini (courgette), raw or cooked, is safe for dogs; zucchini bread and fried zucchini are not.',
    why: [
      'AKC: zucchini is perfectly safe for dogs. PetMD: plain zucchini, raw or cooked, is safe and healthy for dogs in moderation.',
      'It is low in fat and brings fiber, vitamins A, C and B6, potassium, and lutein (PetMD). AKC gives about 20 calories a cup, raw.',
    ],
    serve: [
      'Wash it, remove the stem and dice it (PetMD); chop small or steam it so it cannot choke (AKC).',
      'Set a plain portion aside before you season the family’s dish (AKC).',
    ],
    never: [
      'Zucchini bread and other baked goods, which may contain xylitol (AKC), and fried zucchini (PetMD).',
      'Zucchini cooked with oil, salt, garlic or onion (AKC).',
    ],
    usda: {
      fdc: 169291,
      description: 'Squash, summer, zucchini, includes skin, raw',
      kcalPer100g: 17,
    },
    piece: { grams: 9.9, one: 'slice', many: 'slices', basis: 'USDA: 1 slice = 9.9 g' },
    sizeGuide: {
      by: 'PetMD',
      note: 'PetMD’s daily amounts.',
      rows: [
        ['Extra-small (2 to 10 lb)', '1 teaspoon'],
        ['Small (11 to 20 lb)', '2 teaspoons'],
        ['Medium (21 to 50 lb)', '3 teaspoons'],
        ['Large (51 to 90 lb)', '2 tablespoons'],
        ['Extra-large (91 lb and up)', '3 tablespoons'],
      ],
    },
    questions: [
      {
        question: 'Can dogs eat raw zucchini?',
        answer:
          'Yes, in small pieces: AKC says plain raw, steamed or cooked zucchini is safe, and chopping it small prevents choking.',
      },
    ],
    sources: [S.akcZucchini, S.petmdZucchini],
  },
  {
    id: 'potatoes',
    name: 'potatoes',
    alternates: [],
    verdict: 'moderation',
    answer: 'cooked plain, never green',
    summary:
      'Plain cooked potato is safe in moderation; raw, green or sprouting potatoes hold solanine.',
    why: [
      'AKC and PetMD both say plain cooked potatoes are safe in moderation. AKC quotes Dr. Patricia Kennedy: cooked potatoes are fine, but not with tons of butter, which can trigger pancreatitis.',
      'The danger is solanine, a toxin of the nightshade family. AKC says green potatoes are toxic because of it, and PetMD says the green parts and sprouts hold solanine, which can cause vomiting, diarrhea, weakness and even nervous system problems.',
    ],
    serve: [
      'Boiled, baked or mashed, with no butter, salt or seasoning (PetMD, AKC).',
      'Cook it through so it is soft; cooked skin is fine if it is not green (AKC).',
    ],
    never: [
      'Raw potatoes, green potatoes, green skin and sprouts (AKC, PetMD).',
      'Fries, chips, and mash made with butter, cream, garlic or onion.',
    ],
    signs: [
      'From solanine: vomiting, diarrhea, weakness and nervous system signs (PetMD). Call your veterinarian if your dog ate raw or green potato and shows any of them.',
    ],
    usda: {
      fdc: 170093,
      description: 'Potatoes, baked, flesh and skin, without salt',
      kcalPer100g: 93,
    },
    piece: {
      grams: 173,
      one: 'medium baked potato',
      many: 'medium baked potatoes',
      basis: 'USDA: 1 medium potato = 173 g',
    },
    questions: [
      {
        question: 'Can dogs eat mashed potatoes?',
        answer:
          'Plain mashed potato, yes, in small amounts (AKC). Mash made with butter, cream, garlic or onion is not a dog food: the fat can trigger pancreatitis and the garlic and onion are toxic.',
      },
    ],
    links: ['food-sweet-potatoes'],
    sources: [S.akcPotatoes, S.petmdPotatoes],
  },
  {
    id: 'sweet-potatoes',
    name: 'sweet potatoes',
    alternates: [],
    verdict: 'safe',
    answer: 'cooked sweet potato is safe',
    summary:
      'Sweet potato cooked through and served plain is safe for dogs in moderation; never raw.',
    why: [
      'PetMD says sweet potatoes are safe when fully cooked, plain and fed in moderation; AKC says yes, with caution.',
      'They bring fiber, beta-carotene, vitamins A, B6 and C, potassium and calcium (AKC, PetMD). AKC quotes Dr. Rachel Barrack that too much can cause bone and muscle weakness from excess vitamin A.',
    ],
    serve: [
      'Wash and peel it, then steam, boil, bake or microwave it until soft, and mash or cut it into small pieces (PetMD).',
      'Serve it plain, without butter, sugar or marshmallows.',
    ],
    never: [
      'Raw sweet potato: hard to chew and digest, and a choking risk (PetMD, AKC).',
      'The skin, which PetMD says is not toxic but can be hard to digest and may block the gut.',
    ],
    usda: {
      fdc: 168483,
      description: 'Sweet potato, cooked, baked in skin, flesh, without salt',
      kcalPer100g: 90,
    },
    piece: {
      grams: 12.5,
      one: 'tablespoon',
      many: 'tablespoons',
      basis: 'a sixteenth of USDA’s cup of 200 g',
    },
    sizeGuide: {
      by: 'PetMD',
      note: 'PetMD’s amounts, two or three times a week.',
      rows: [
        ['Extra-small (2 to 10 lb)', '1 tablespoon'],
        ['Small (11 to 20 lb)', '1 to 2 tablespoons'],
        ['Medium (21 to 50 lb)', '2 to 3 tablespoons'],
        ['Large (51 to 90 lb)', '3 tablespoons'],
        ['Extra-large (91 lb and up)', '4 tablespoons'],
      ],
    },
    disagree: [
      'AKC’s veterinarian says sweet potatoes have a high glycemic index and calls for caution in diabetic dogs; PetMD says their glycemic index is relatively low. Ask your veterinarian for a dog with diabetes.',
    ],
    questions: [
      {
        question: 'Are sweet potatoes better for dogs than white potatoes?',
        answer:
          'Both are safe cooked and plain. The difference that matters is what never to give: green or raw white potato holds solanine (AKC, PetMD), and raw sweet potato is a choking risk.',
      },
    ],
    links: ['food-potatoes'],
    sources: [S.akcSweetPotatoes, S.petmdSweetPotatoes],
  },
  {
    id: 'pumpkin',
    name: 'pumpkin',
    alternates: [],
    verdict: 'safe',
    answer: 'plain pumpkin is safe',
    summary: 'Plain cooked or 100% canned pumpkin is safe for dogs; pumpkin pie filling is not.',
    why: [
      'PetMD says dogs can safely eat plain cooked pumpkin and 100% canned pumpkin with nothing added, and AKC calls plain canned pumpkin the healthiest choice.',
      'It is rich in fiber, and AKC says its soluble fiber works as a prebiotic. AKC suggests 1 to 4 tablespoons of pumpkin added to a meal for mild diarrhea, starting small.',
    ],
    serve: [
      'Canned pumpkin with no salt, spices or sugar (AKC), or plain cooked pumpkin (PetMD).',
      'Mix a spoonful into the meal rather than serving a bowl of it.',
    ],
    never: [
      'Pumpkin pie filling or pie mix: PetMD says it may hold sugar, nutmeg and cloves, which can be dangerous to dogs, and sometimes xylitol.',
      'Raw pumpkin, the rind and the stem, which are hard to digest (PetMD).',
    ],
    signs: [
      'Pumpkin is for mild, non-serious diarrhea (AKC). AKC says to call your veterinarian at once for lethargy, fever, vomiting or weakness, or for bloody or lasting diarrhea, especially in a puppy.',
    ],
    usda: { fdc: 168450, description: 'Pumpkin, canned, without salt', kcalPer100g: 34 },
    piece: {
      grams: 15.3,
      one: 'tablespoon',
      many: 'tablespoons',
      basis: 'a sixteenth of USDA’s cup of 245 g',
    },
    questions: [
      {
        question: 'Is pumpkin pie filling the same as canned pumpkin?',
        answer:
          'No. The can should say 100% pumpkin. Pie filling is sweetened and spiced, and PetMD says it can hold nutmeg, cloves and xylitol.',
      },
    ],
    links: ['food-xylitol-gum'],
    sources: [S.akcPumpkin, S.petmdPumpkin],
  },
];
