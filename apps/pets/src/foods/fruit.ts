import { Rational } from '@maestro-calc/core';
import { S } from './sources.ts';
import type { Food } from './types.ts';

/** The fruit of the "can dogs eat" pages. */
export const FRUIT: readonly Food[] = [
  {
    id: 'strawberries',
    name: 'strawberries',
    alternates: [],
    verdict: 'safe',
    answer: 'strawberries are safe as a treat',
    summary:
      'Plain fresh strawberries are safe for most dogs in small amounts: the ASPCA rates the plant non-toxic.',
    why: [
      'The ASPCA plant list rates strawberries (Fragaria) non-toxic to dogs. AKC answers “yes, in moderation”, and PetMD says most dogs can safely eat them when properly prepared.',
      'They bring fiber and vitamin C, and PetMD adds B vitamins, vitamin K, magnesium and potassium. They also bring sugar: PetMD says dogs with diabetes, obesity or a sensitivity to sugar may not be good candidates for this treat.',
    ],
    serve: [
      'Wash them well and take off the stems and leaves (AKC, PetMD).',
      'Cut them into slices about a quarter of an inch thick, which PetMD recommends against choking; AKC suggests small pieces, and frozen pieces as a summer treat.',
      'Skip canned strawberries and any in syrup: AKC says they carry too much sugar, and some may contain xylitol.',
    ],
    never: [
      'The green tops: not poisonous, but AKC says they can upset the stomach and PetMD calls them a choking risk.',
      'Strawberry desserts, jams and sugar-free products, which can hide xylitol.',
    ],
    usda: { fdc: 167762, description: 'Strawberries, raw', kcalPer100g: 32 },
    piece: {
      grams: 12,
      one: 'medium strawberry',
      many: 'medium strawberries',
      basis: 'USDA: 1 medium (1¼ in across) = 12 g',
    },
    sizeGuide: {
      by: 'PetMD',
      note: 'PetMD’s serving table, in slices. AKC gives one to three strawberries a day as a reasonable starting point for most dogs.',
      rows: [
        ['Extra-small (2 to 20 lb)', '1 to 2 slices'],
        ['Small (21 to 30 lb)', '2 to 3 slices'],
        ['Medium (31 to 50 lb)', '5 to 6 slices'],
        ['Large (51 to 90 lb)', 'A handful of slices'],
        ['Extra-large (91 lb and up)', 'A large handful of slices'],
      ],
    },
    questions: [
      {
        question: 'Can puppies eat strawberries?',
        answer:
          'The sources give no separate rule for puppies. AKC advises asking your veterinarian before you add strawberries, especially for a dog with diabetes, weight problems or a sensitive stomach, and the same caution fits a puppy’s first try: one small slice, then wait.',
      },
    ],
    sources: [S.aspcaStrawberry, S.akcStrawberries, S.petmdStrawberries],
  },
  {
    id: 'bananas',
    name: 'bananas',
    alternates: [],
    verdict: 'moderation',
    answer: 'peeled, now and then',
    summary:
      'Peeled banana is safe in small pieces, but PetMD says bananas hold more sugar than many dog treats.',
    why: [
      'The ASPCA plant list rates the banana plant non-toxic to dogs. PetMD says dogs can safely eat bananas in moderation, and AKC says they should be served in moderation rather than as an everyday snack.',
      'The caution is sugar. PetMD notes that bananas contain more sugar than many dog treats; AKC says too much banana adds calories and may upset the stomach. Dogs with obesity or diabetes should not have them unless their veterinarian agrees (PetMD).',
      'In return they bring potassium, vitamin B6, vitamin C, fiber and magnesium (AKC), and biotin (PetMD).',
    ],
    serve: [
      'Peel it completely, then cut slices about a quarter of an inch thick (PetMD) or bite-sized pieces (AKC).',
      'Serve fresh, mashed into the food, or frozen in a stuffable toy (AKC, PetMD).',
    ],
    never: [
      'The peel. AKC: banana peels are not toxic, but they are hard to digest and could block the intestine; PetMD says the same.',
    ],
    usda: { fdc: 173944, description: 'Bananas, raw', kcalPer100g: 89 },
    piece: {
      grams: 118,
      one: 'medium banana',
      many: 'medium bananas',
      basis: 'USDA: 1 medium (7 to 7⅞ in long) = 118 g',
    },
    sizeGuide: {
      by: 'PetMD',
      note: 'PetMD’s daily amounts by size.',
      rows: [
        ['Extra-small (2 to 10 lb)', '1 to 2 slices'],
        ['Small (11 to 20 lb)', '2 to 3 slices'],
        ['Medium (21 to 50 lb)', '3 to 6 slices'],
        ['Large (51 to 90 lb)', 'A handful of slices'],
        ['Extra-large (91 lb and up)', 'Up to half a banana'],
      ],
    },
    questions: [
      {
        question: 'Can dogs eat banana every day?',
        answer:
          'PetMD’s table gives daily amounts, from one or two slices for the smallest dogs to half a banana for the largest. AKC prefers banana as an occasional extra rather than an everyday snack, because of its sugar.',
      },
    ],
    sources: [S.aspcaBanana, S.akcBananas, S.petmdBananas],
  },
  {
    id: 'grapes',
    name: 'grapes',
    alternates: [],
    verdict: 'toxic',
    answer: 'grapes are toxic to dogs',
    summary:
      'Grapes of any colour can cause kidney failure in dogs, and no source gives a safe number.',
    why: [
      'The Merck Veterinary Manual links grapes, raisins and Zante currants with kidney failure in dogs. The ASPCA says dogs cannot process tartaric acid, speculated to be the toxic part, so grapes can damage their kidneys.',
      'Tartaric acid is the leading explanation, not a settled one. Merck says these fruits hold it in high concentrations and that dogs lack the transporters other species use to clear it. A 2022 report by Wegenast and colleagues described six dogs with kidney injury after eating cream of tartar or tamarind, both rich in tartaric acid. AKC quotes an emergency veterinarian, Dr. Jessica Dowling, saying the exact compound is still unknown.',
      'VCA says the risk applies to seedless or seeded, red or green, organic or not. It also says grape juice, wine and grape seed extract do not appear to cause the same poisoning.',
    ],
    serve: [
      'Call your veterinarian or the ASPCA poison line now, even after one grape and even if your dog seems fine (PetMD, VCA).',
      'Do not make your dog vomit at home with hydrogen peroxide (AKC). Merck describes prompt decontamination by a veterinarian for dogs that still look normal, then intravenous fluids for at least 48 hours.',
      'Count what is missing and note the time: the first questions on the call are how many, how big your dog is and how long ago.',
    ],
    never: [
      'Fresh grapes of any kind, and the dried forms: raisins, sultanas and Zante currants.',
      'Baked goods, trail mix and cereals that contain them.',
    ],
    signs: [
      'Merck and AKC: vomiting or diarrhea within 6 to 12 hours, then kidney failure, with little or no urine, within 24 to 72 hours. VCA gives 12 to 24 hours for the first signs and 24 to 48 for the kidneys.',
      'Watch also for lethargy, loss of appetite, belly pain, weakness, thirst and tremors (Merck, AKC, PetMD).',
    ],
    disagree: [
      'On the amount: Merck says more than one grape or raisin per 10 lb of body weight may hold enough tartaric acid to harm the kidneys, and AKC says veterinarians have linked kidney failure to that little. VCA says there is no well-established toxic dose and some dogs are more sensitive, and PetMD says there is no safe number.',
      'On timing, the first signs come within a few hours for PetMD, 6 to 12 hours for Merck and AKC, and 12 to 24 hours for VCA.',
    ],
    usda: {
      fdc: 174683,
      description: 'Grapes, red or green (European type), raw',
      kcalPer100g: 69,
    },
    piece: { grams: 4.9, one: 'grape', many: 'grapes', basis: 'USDA: 10 grapes = 49 g' },
    thresholds: [
      {
        label: 'Merck: more than this may harm the kidneys',
        lead: 'the line Merck draws at one grape per 10 lb',
        piecesPer10Lb: Rational.of(1),
      },
    ],
    thresholdNote:
      'The grape counts below are Merck’s line of one grape or raisin per 10 lb, worked at four weights. They are not a safe amount: VCA says some dogs react to less, and the tartaric acid in grapes varies (Merck). Call for any amount.',
    questions: [
      {
        question: 'My dog ate one grape. What should I do?',
        answer:
          'Call your veterinarian or the ASPCA Animal Poison Control Center. PetMD says to call even if only one grape was eaten, because there is no known safe number and a small dog is near Merck’s line with a single grape.',
      },
      {
        question: 'Are green grapes safer than red ones?',
        answer:
          'No. VCA says the risk is the same for red or green, seedless or seeded, commercial or homegrown, organic or not.',
      },
    ],
    links: ['food-raisins'],
    sources: [S.merckGrapes, S.aspcaFoods, S.akcGrapes, S.petmdGrapes, S.vcaGrapes, S.wegenast],
  },
  {
    id: 'raisins',
    name: 'raisins',
    alternates: [
      {
        name: 'sultanas',
        answer:
          'No. Sultanas are dried grapes, and PDSA, the UK veterinary charity, lists grapes, raisins, currants and sultanas as all potentially poisonous to dogs.',
      },
      {
        name: 'currants',
        answer:
          'Not dried currants. Merck and VCA say Zante currants, the small dried grapes sold as currants, are as dangerous as raisins; true currants of the Ribes genus, such as blackcurrants, have not been linked with kidney injury. PDSA lists currants as poisonous without that distinction, so treat any dried currant as a raisin.',
      },
    ],
    verdict: 'toxic',
    answer: 'raisins are toxic to dogs',
    summary:
      'Raisins, sultanas and dried currants can cause kidney failure in dogs, even in small amounts.',
    why: [
      'Raisins are dried grapes, and Merck groups raisins, grapes and Zante currants as the fruits linked with kidney failure in dogs. The ASPCA names tartaric acid as the suspected cause.',
      'Drying concentrates the fruit. PetMD says raisins are technically more dangerous than grapes because the toxin is more concentrated, and AKC calls them equally dangerous. A raisin weighs about a tenth of a grape, so a small handful is many raisins.',
      'PDSA, the UK veterinary charity, says the toxic dose varies from dog to dog and in some cases can be very small.',
    ],
    serve: [
      'Call your veterinarian or a poison line now. PDSA: contact your vet immediately and do not wait to see whether signs develop.',
      'Have the packet: the weight eaten, or a count, and your dog’s weight are what the veterinarian needs.',
      'Do not make your dog vomit unless the veterinarian tells you to.',
    ],
    never: [
      'Raisins, sultanas and dried (Zante) currants, alone or in trail mix and cereal.',
      'Fruit cake, Christmas cake, hot cross buns, cookies and chocolate bars with raisins (PDSA).',
    ],
    signs: [
      'PDSA: signs can start just a few hours after eating, with vomiting, diarrhea, belly pain, lethargy and loss of appetite; kidney failure can follow within one to three days.',
      'Merck gives 6 to 12 hours for vomiting or diarrhea and 24 to 72 hours for kidney failure, with thirst, dehydration and tremors among the signs.',
    ],
    disagree: [
      'Merck sets a line at more than one raisin per 10 lb of body weight; VCA says there is no well-established toxic dose, and PDSA says it can be very small.',
      'On currants, Merck and VCA clear the Ribes currants (blackcurrants) and keep the dried Zante currants; PDSA lists currants without the difference.',
    ],
    usda: {
      fdc: 168165,
      description: 'Raisins, dark, seedless',
      kcalPer100g: 299,
    },
    piece: { grams: 0.52, one: 'raisin', many: 'raisins', basis: 'USDA: 50 raisins = 26 g' },
    thresholds: [
      {
        label: 'Merck: more than this may harm the kidneys',
        lead: 'Merck’s line of one raisin per 10 lb',
        piecesPer10Lb: Rational.of(1),
      },
    ],
    thresholdNote:
      'Merck’s line of one raisin per 10 lb, worked at four weights. A USDA mini box of raisins holds 14 g, about 27 raisins, which is past the line for every dog in the table. The line is not a safe amount: call for any raisins.',
    questions: [
      {
        question: 'My dog ate a raisin cookie. Is that an emergency?',
        answer:
          'Treat it as one and call your veterinarian or a poison line: PDSA lists cookies, cakes and buns among the foods that hold raisins, and a few raisins are past Merck’s line for a small dog.',
      },
    ],
    links: ['food-grapes'],
    sources: [S.merckGrapes, S.pdsaRaisins, S.petmdGrapes, S.akcGrapes, S.vcaGrapes, S.aspcaFoods],
  },
  {
    id: 'blueberries',
    name: 'blueberries',
    alternates: [],
    verdict: 'safe',
    answer: 'blueberries are a safe small treat',
    summary:
      'Fresh or frozen plain blueberries are safe for most dogs, a few at a time; skip muffins and sweetened berries.',
    why: [
      'AKC says dogs can eat blueberries in moderation, and PetMD says most dogs can safely eat them served plain.',
      'They are rich in antioxidants and plant compounds called phytochemicals, with fiber and vitamin C (PetMD, AKC). They are also among the smallest fruits a dog can be given: about 1.4 g a berry on USDA’s weights.',
    ],
    serve: [
      'Wash them under cool water and remove any stems (PetMD).',
      'Give them fresh or frozen (AKC). For very small dogs, halve or mash them so they cannot choke (AKC, PetMD).',
      'Plain only: PetMD says to avoid canned, sweetened, syrup-packed or flavored berries.',
    ],
    never: ['Blueberry muffins, pies and jams (PetMD).'],
    usda: { fdc: 171711, description: 'Blueberries, raw', kcalPer100g: 57 },
    piece: { grams: 1.36, one: 'blueberry', many: 'blueberries', basis: 'USDA: 50 berries = 68 g' },
    sizeGuide: {
      by: 'PetMD',
      note: 'PetMD’s daily amounts, in berries. AKC says two or three for a small dog and several more for a larger one.',
      rows: [
        ['Extra-small (2 to 10 lb)', '1 to 2 blueberries'],
        ['Small (11 to 20 lb)', '2 to 3 blueberries'],
        ['Medium (21 to 50 lb)', '3 to 5 blueberries'],
        ['Large (51 to 90 lb)', '5 to 6 blueberries'],
        ['Extra-large (91 lb and up)', '6 to 10 blueberries'],
      ],
    },
    questions: [
      {
        question:
          'Why do the serving tables give so few blueberries when the calorie budget allows more?',
        answer:
          'The treat budget is a ceiling for all treats together, not a target for one fruit. PetMD’s counts leave room for the rest of the day’s treats and for a stomach that is not used to fruit.',
      },
    ],
    sources: [S.akcBlueberries, S.petmdBlueberries],
  },
  {
    id: 'apples',
    name: 'apples',
    alternates: [],
    verdict: 'safe',
    answer: 'apple slices are safe, without the core',
    summary:
      'Cored, seeded apple slices are a safe treat; the seeds, core and stem are the parts to keep away.',
    why: [
      'AKC calls apples a safe, nutritious treat when served in moderation, and PetMD says dogs can safely eat them once the seeds, core and stem are removed.',
      'The ASPCA plant list marks the apple tree toxic to dogs, and says why: the stems, leaves and seeds contain cyanogenic glycosides, which release cyanide. The flesh is the part people and dogs eat.',
      'Apple flesh brings vitamin C, vitamin A, potassium and fiber (AKC), and is low in fat (PetMD).',
    ],
    serve: [
      'Wash the apple, then remove the core, seeds and stem (AKC, PetMD).',
      'Cut slices or cubes: PetMD suggests pieces about an inch wide and a quarter inch thick. Peeling helps a dog with a sensitive stomach (AKC, PetMD).',
      'AKC says an apple slice or two is enough to satisfy a dog.',
    ],
    never: [
      'The seeds, which hold a small amount of cyanide (AKC, PetMD), the core, a choking and blockage risk, and the stem.',
      'Apple pie, sweetened applesauce and apple products with xylitol.',
    ],
    signs: [
      'Too much apple can upset the stomach (AKC, PetMD). For cyanide from the seeds, stems and leaves, the ASPCA lists brick-red gums, dilated pupils, difficulty breathing, panting and shock: call a veterinarian or the ASPCA line if you see those.',
    ],
    usda: { fdc: 171688, description: 'Apples, raw, with skin', kcalPer100g: 52 },
    piece: {
      grams: 109,
      one: 'cup of apple slices',
      many: 'cups of apple slices',
      basis: 'USDA: 1 cup of slices = 109 g',
    },
    sizeGuide: {
      by: 'PetMD',
      note: 'PetMD’s daily amounts, in pieces about 1 in by ¼ in.',
      rows: [
        ['Extra-small (2 to 10 lb)', '1 to 2 pieces'],
        ['Small (11 to 20 lb)', '2 to 3 pieces'],
        ['Medium (21 to 50 lb)', '3 to 4 pieces'],
        ['Large (51 to 90 lb)', '4 to 5 pieces'],
        ['Extra-large (91 lb and up)', '5 to 6 pieces'],
      ],
    },
    questions: [
      {
        question: 'My dog ate an apple core. Is that dangerous?',
        answer:
          'A core is mostly a choking and blockage risk (AKC, PetMD); its few seeds hold only a small amount of cyanide, which AKC says harms in large doses. Watch for vomiting, a hard belly or a dog that stops eating, and call your veterinarian if you see them.',
      },
    ],
    sources: [S.akcApples, S.petmdApples, S.aspcaApple],
  },
  {
    id: 'watermelon',
    name: 'watermelon',
    alternates: [],
    verdict: 'safe',
    answer: 'seedless watermelon flesh is safe',
    summary:
      'Watermelon flesh without rind or seeds is safe and mostly water; the rind can block the gut.',
    why: [
      'PetMD says most dogs can safely eat watermelon served plain and prepared properly; AKC calls it a refreshing, hydrating treat when served safely and in moderation.',
      'It is about 92% water (AKC) with vitamins A, B6 and C and potassium, and on USDA’s figures it is one of the lightest fruits here: 30 kcal per 100 g.',
    ],
    serve: [
      'Wash the melon, then cut the flesh away from all the rind and take out the seeds (AKC, PetMD).',
      'PetMD suggests pieces about 1 in by 1 in by ¼ in; AKC says a few bite-sized pieces as an occasional treat.',
      'Frozen chunks or a purée blended with plain yogurt without xylitol make a summer treat (AKC).',
    ],
    never: [
      'The rind: PetMD says it can choke a dog or block its intestine, and AKC adds vomiting, diarrhea and stomach upset.',
      'The seeds: a choking and blockage risk (AKC); PetMD says they hold trace cyanide, though poisoning is highly unlikely.',
    ],
    usda: { fdc: 167765, description: 'Watermelon, raw', kcalPer100g: 30 },
    piece: {
      grams: 152,
      one: 'cup of diced watermelon',
      many: 'cups of diced watermelon',
      basis: 'USDA: 1 cup diced = 152 g',
    },
    sizeGuide: {
      by: 'PetMD',
      note: 'PetMD’s amounts, two or three times a week, in slices of 1 in by 1 in by ¼ in.',
      rows: [
        ['Extra-small (2 to 10 lb)', '2 to 3 slices'],
        ['Small (11 to 20 lb)', '3 to 4 slices'],
        ['Medium (21 to 50 lb)', '3 to 4 slices'],
        ['Large (51 to 90 lb)', '4 to 5 slices'],
        ['Extra-large (91 lb and up)', '5 to 6 slices'],
      ],
    },
    disagree: [
      'AKC gives roughly 50 calories per cup of watermelon; USDA’s figures work out to about 46 kcal for a cup diced (152 g at 30 kcal per 100 g), the figure this page uses.',
    ],
    questions: [
      {
        question: 'Is watermelon good for a dog with diabetes?',
        answer:
          'PetMD says to avoid it for dogs that are diabetic or obese. Ask your veterinarian first.',
      },
    ],
    sources: [S.akcWatermelon, S.petmdWatermelon],
  },
  {
    id: 'cherries',
    name: 'cherries',
    alternates: [],
    verdict: 'avoid',
    answer: 'the pits release cyanide',
    summary:
      'Cherry pits, stems and leaves release cyanide and the pits can block the gut, so AKC does not recommend cherries.',
    why: [
      'AKC says cherries are not recommended: small amounts of the flesh are fine, but the pits, stems and leaves contain cyanide, and the pits can block the digestive tract.',
      'The ASPCA plant list marks the cherry (Prunus) toxic to dogs for the same reason: its stems, leaves and seeds contain cyanogenic glycosides. PetMD names the compound amygdalin, which the body turns into cyanide.',
      'Maraschino cherries are no better: AKC and PetMD point to their added sugar and preservatives.',
    ],
    serve: [
      'If your dog ate a cherry or two with the pits, watch it and call your veterinarian if it eats several or shows any sign (AKC). The veterinarian may decide to make it vomit.',
      'Call at once if it chewed pits, stems or leaves, or shows signs of poisoning (PetMD), or call the ASPCA poison line.',
    ],
    never: [
      'The pits, stems and leaves of any cherry, and whole cherries a dog can swallow with the pit.',
      'Maraschino cherries and cherry desserts.',
    ],
    signs: [
      'Cyanide: difficult breathing, bright red gums and dilated pupils (AKC), panting, drooling, vomiting, tremors, seizures and collapse (PetMD). How many pits it takes depends on the size of the dog and whether it chewed them (PetMD).',
      'A blocked gut: vomiting, a dog that stops eating, constipation or few stools (AKC).',
    ],
    disagree: [
      'PetMD says dogs can have fresh cherries with the pits, stems and leaves removed, and gives a table from one cherry for a dog of 2 to 10 lb to five for a dog over 90 lb, two or three times a week. AKC does not recommend them and suggests safer fruit. This page follows AKC and the ASPCA; both sources agree the pit, stems and leaves are the danger.',
    ],
    usda: { fdc: 171719, description: 'Cherries, sweet, raw', kcalPer100g: 63 },
    piece: { grams: 8.2, one: 'cherry', many: 'cherries', basis: 'USDA: 1 cherry = 8.2 g' },
    questions: [
      {
        question: 'My dog swallowed a cherry pit. What now?',
        answer:
          'One swallowed pit is mostly a blockage risk, more so for a small dog. Watch for vomiting, constipation or a dog that stops eating, and call your veterinarian if it ate several cherries or chewed the pits (AKC, PetMD).',
      },
    ],
    sources: [S.akcCherries, S.petmdCherries, S.aspcaCherry],
  },
  {
    id: 'mango',
    name: 'mango',
    alternates: [],
    verdict: 'moderation',
    answer: 'peeled, without the pit',
    summary:
      'Ripe, peeled mango without the pit is safe in small pieces, but it is sugary and the pit is dangerous.',
    why: [
      'AKC says dogs can eat mango as long as it is properly prepared, and PetMD allows small amounts of the ripe flesh as an occasional treat.',
      'Mango brings fiber and vitamins A, B6, C and E (AKC). The caution is its sugar and fiber, which can upset the stomach; PetMD says diabetic dogs should avoid it.',
    ],
    serve: [
      'Wash and peel the mango and cut the flesh away from the pit (AKC, PetMD).',
      'Cut small, bite-sized pieces and start with a little (PetMD).',
    ],
    never: [
      'The pit: AKC calls it a serious choking hazard holding small amounts of cyanide; PetMD adds a blockage risk.',
      'The skin, which both sources say is hard to digest.',
    ],
    signs: [
      'Too much fruit can bring bellyaches and diarrhea (AKC). If your dog swallowed a pit, watch how it eats and call your veterinarian at the first change (AKC).',
    ],
    usda: { fdc: 169910, description: 'Mangos, raw', kcalPer100g: 60 },
    piece: {
      grams: 165,
      one: 'cup of mango pieces',
      many: 'cups of mango pieces',
      basis: 'USDA: 1 cup of pieces = 165 g',
    },
    sizeGuide: {
      by: 'PetMD',
      note: 'PetMD’s amounts, diced. Compare them with the treat budget above: for the largest dogs, a cup of mango is most of the day’s treats.',
      rows: [
        ['Extra-small (2 to 10 lb)', '⅛ cup diced'],
        ['Small (11 to 20 lb)', '⅓ cup diced'],
        ['Medium (21 to 50 lb)', '½ cup diced'],
        ['Large (51 to 90 lb)', '¾ cup diced'],
        ['Extra-large (91 lb and up)', '1 cup diced'],
      ],
    },
    questions: [
      {
        question: 'Can dogs eat dried mango?',
        answer:
          'The sources only cover fresh, ripe mango. Dried fruit packs the sugar of much more fruit into each piece, so it uses the treat budget far faster.',
      },
    ],
    sources: [S.akcMango, S.petmdMango],
  },
  {
    id: 'oranges',
    name: 'oranges',
    alternates: [],
    verdict: 'moderation',
    answer: 'a peeled segment or two',
    summary:
      'Peeled orange segments are safe in small amounts; the peel, seeds and acidity are the problems.',
    why: [
      'AKC says dogs can eat oranges only in limited amounts, because their natural sugar and acidity can upset the stomach. PetMD says yes in moderation, to the fleshy part only, and that dogs with diabetes or obesity should avoid them.',
      'The ASPCA plant list marks the orange tree toxic to dogs for its essential oils and psoralens, and adds that the fruit is edible while the skins and plant material cause the problems. Its citrus note says the peels, seeds and leaves hold citric acid and oils that can irritate in significant amounts.',
    ],
    serve: [
      'Peel the orange completely and take out the seeds (AKC, PetMD).',
      'Offer one segment, cut small (AKC).',
    ],
    never: [
      'The peel: PetMD says it is tough to digest, can block the intestine, and its oils may irritate the stomach.',
      'The seeds, a choking risk (AKC), and the leaves and stems of the tree (ASPCA).',
    ],
    signs: [
      'Diarrhea and stomach upset from too much fruit (AKC, PetMD). From the plant material, the ASPCA lists vomiting, diarrhea and depression, and skin irritation.',
    ],
    usda: { fdc: 169097, description: 'Oranges, raw, all commercial varieties', kcalPer100g: 47 },
    piece: {
      grams: 131,
      one: 'whole orange',
      many: 'whole oranges',
      basis: 'USDA: 1 fruit (2⅝ in across) = 131 g',
    },
    sizeGuide: {
      by: 'PetMD',
      note: 'PetMD’s amounts, once or twice a week. AKC says one or two small segments a day are typically enough, depending on size.',
      rows: [
        ['Extra-small (2 to 10 lb)', '½ segment'],
        ['Small (11 to 20 lb)', '1 segment'],
        ['Medium (21 to 50 lb)', '1½ segments'],
        ['Large (51 to 90 lb)', '2 segments'],
        ['Extra-large (91 lb and up)', '2½ segments'],
      ],
    },
    disagree: [
      'On how often: AKC allows one or two segments a day; PetMD keeps them to once or twice a week.',
    ],
    questions: [
      {
        question: 'Can dogs eat clementines or mandarins?',
        answer:
          'The sources here cover oranges. The ASPCA’s citrus note applies to all citrus plants: the peel, seeds and leaves are the problem parts, so the same peeled, seedless, small-amount rule is the careful reading.',
      },
    ],
    sources: [S.akcOranges, S.petmdOranges, S.aspcaOrange, S.aspcaFoods],
  },
  {
    id: 'pineapple',
    name: 'pineapple',
    alternates: [],
    verdict: 'safe',
    answer: 'fresh pineapple is safe',
    summary:
      'Raw, peeled pineapple without the core is a safe treat; skip canned pineapple in syrup.',
    why: [
      'PetMD says dogs can safely eat pineapple in moderation when it is properly prepared, and AKC says a few chunks of raw pineapple are usually enough for most dogs.',
      'It brings vitamin C, B vitamins, manganese, copper and potassium (AKC) and a lot of water. Its sugar, fiber and acidity can upset a sensitive stomach (PetMD).',
    ],
    serve: [
      'Peel it, take out the core and cut bite-sized pieces (AKC).',
      'Frozen chunks of fresh pineapple make a summer treat (AKC).',
      'Fresh only: AKC says the syrup of canned fruit is too sugary, and PetMD warns that dried pineapple may have added sugar and preservatives.',
    ],
    never: [
      'The core, rind, stem and leaves: PetMD says they are hard to digest and can choke a dog or block its intestine.',
    ],
    signs: [
      'Diarrhea or stomach upset after eating it; AKC says to call your veterinarian if you see them.',
    ],
    usda: { fdc: 169124, description: 'Pineapple, raw, all varieties', kcalPer100g: 50 },
    piece: {
      grams: 165,
      one: 'cup of pineapple chunks',
      many: 'cups of pineapple chunks',
      basis: 'USDA: 1 cup of chunks = 165 g',
    },
    sizeGuide: {
      by: 'PetMD',
      note: 'PetMD’s serving table, in bite-sized pieces.',
      rows: [
        ['Extra-small (2 to 20 lb)', '1 to 2 pieces'],
        ['Small (21 to 30 lb)', '2 to 3 pieces'],
        ['Medium (31 to 50 lb)', '5 to 6 pieces'],
        ['Large (51 to 90 lb)', 'A handful of pieces'],
        ['Extra-large (91 lb and up)', 'A large handful of pieces'],
      ],
    },
    questions: [
      {
        question: 'Does pineapple stop dogs from eating poop?',
        answer:
          'None of the veterinary sources on this page makes that claim. They treat pineapple only as an occasional treat.',
      },
    ],
    sources: [S.akcPineapple, S.petmdPineapple],
  },
];
