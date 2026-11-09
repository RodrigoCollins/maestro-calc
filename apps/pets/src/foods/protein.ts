import { S } from './sources.ts';
import type { Food } from './types.ts';

/** The dairy, eggs, meat and fish of the "can dogs eat" pages. */
export const PROTEIN: readonly Food[] = [
  {
    id: 'cheese',
    name: 'cheese',
    alternates: [],
    verdict: 'moderation',
    answer: 'a small cube of plain cheese',
    summary:
      'A small cube of plain, lower-fat cheese is fine for most dogs, but most are lactose-intolerant and cheese is fatty.',
    why: [
      'PetMD says dogs can eat cheese in moderation, though most are lactose-intolerant; AKC says they can have it as an occasional treat. The ASPCA explains the limit: pets lack enough lactase, the enzyme that breaks down milk sugar, so dairy can cause diarrhea or other digestive upset.',
      'Cheese is also fatty and salty (PetMD). On USDA’s figures cheddar has 403 kcal per 100 g, so a little uses the treat budget quickly. PetMD says to avoid it for a dog that has had pancreatitis.',
    ],
    serve: [
      'A small cube or a few shreds is usually enough for training or as a reward (AKC).',
      'Choose lower-fat, lower-lactose cheeses such as mozzarella, cottage cheese or soft goat cheese (AKC, PetMD).',
    ],
    never: [
      'Blue cheese, which PetMD calls toxic to dogs (it contains roquefortine).',
      'Cheeses with garlic, onion or chives mixed in (AKC).',
    ],
    signs: ['Vomiting, diarrhea, bloating or gas (PetMD).'],
    usda: {
      fdc: 173414,
      description: 'Cheese, cheddar',
      kcalPer100g: 403,
      sodiumPer100g: 653,
    },
    piece: {
      grams: 17,
      one: 'one-inch cube',
      many: 'one-inch cubes',
      basis: 'USDA: 1 cubic inch = 17 g',
    },
    sizeGuide: {
      by: 'PetMD',
      note: 'PetMD’s amounts, a few times a week.',
      rows: [
        ['Extra-small (2 to 10 lb)', '1 to 2 pea-size pieces'],
        ['Small (11 to 20 lb)', '1 to 2 quarter-inch cubes'],
        ['Medium (21 to 50 lb)', '3 to 4 cubes'],
        ['Large (51 to 90 lb)', '5 to 6 cubes'],
        ['Extra-large (91 lb and up)', '7 to 8 cubes'],
      ],
    },
    questions: [
      {
        question: 'Can dogs eat cottage cheese?',
        answer:
          'Yes, in small amounts: AKC names cottage cheese among the better choices because it is lower in fat and sodium.',
      },
    ],
    sources: [S.petmdCheese, S.akcCheese, S.aspcaFoods],
  },
  {
    id: 'eggs',
    name: 'eggs',
    alternates: [],
    verdict: 'safe',
    answer: 'cooked eggs are safe',
    summary:
      'Fully cooked plain eggs are safe for dogs a few times a week; raw eggs carry Salmonella.',
    why: [
      'PetMD, written by Dr. Hector Joy, DVM, says dogs can safely eat cooked eggs in moderation; AKC says they are safe and nutritious when fully cooked and served occasionally.',
      'Eggs are high-quality, easy-to-digest protein with vitamins A, D and E, B vitamins, iron, zinc and selenium (PetMD). They are also fatty, which matters for a dog prone to pancreatitis (PetMD).',
    ],
    serve: [
      'Boil, scramble or poach them with no salt, butter or oil (PetMD).',
      'Hard-boiled eggs cooked until the white and yolk are solid, cooled and chopped into bite-sized pieces (PetMD).',
    ],
    never: [
      'Raw eggs: the ASPCA warns of Salmonella and E. coli, and PetMD and AKC add avidin, which binds biotin, a B vitamin.',
      'Eggs cooked with butter, salt, onion or cheese sauce.',
    ],
    signs: [
      'An egg allergy can show as itchy skin, ear infections, vomiting or diarrhea (PetMD); AKC adds hives and swelling, and says to introduce eggs gradually.',
    ],
    usda: { fdc: 173424, description: 'Egg, whole, cooked, hard-boiled', kcalPer100g: 155 },
    piece: { grams: 50, one: 'large egg', many: 'large eggs', basis: 'USDA: 1 large egg = 50 g' },
    sizeGuide: {
      by: 'PetMD',
      note: 'PetMD’s amounts, once or twice a week.',
      rows: [
        ['Extra-small (2 to 10 lb)', '¼ egg'],
        ['Small (11 to 20 lb)', '½ egg'],
        ['Medium (21 to 50 lb)', '1 egg'],
        ['Large (51 to 90 lb)', '1½ eggs'],
        ['Extra-large (91 lb and up)', '2 eggs'],
      ],
    },
    disagree: [
      'On eggshells: AKC says their sharp edges can choke a dog; PetMD allows shells baked or boiled and ground to a fine powder, as a calcium supplement under a veterinarian’s guidance.',
    ],
    questions: [
      {
        question: 'Can dogs eat raw eggs?',
        answer:
          'The sources say no: raw eggs can carry Salmonella and E. coli (ASPCA), and raw whites hold avidin, which blocks biotin (AKC, PetMD). Cook them through.',
      },
    ],
    sources: [S.petmdEggs, S.akcEggs, S.aspcaFoods],
  },
  {
    id: 'yogurt',
    name: 'yogurt',
    alternates: [
      {
        name: 'yoghurt',
        answer:
          'Yes, plain unsweetened yoghurt (the UK spelling of yogurt) in small amounts, and never one sweetened with xylitol (PetMD, AKC).',
      },
    ],
    verdict: 'moderation',
    answer: 'plain, with no xylitol',
    summary:
      'Plain, unsweetened yogurt (yoghurt) is fine in small amounts; check that it has no xylitol.',
    why: [
      'PetMD, written by Dr. Brittany Kleszynski, DVM, says plain unsweetened Greek yogurt is usually the best choice for dogs, with more protein and less sugar and lactose than regular yogurt. AKC says most dogs can eat yogurt but it is not always advisable, because of lactose.',
      'The ASPCA: dairy can cause diarrhea or other digestive upset, because pets lack enough lactase. AKC adds that its fat can risk pancreatitis, and that there are better sources of probiotics.',
    ],
    serve: [
      'Plain, unsweetened yogurt with live cultures; Greek-style has less lactose (AKC, PetMD).',
      'Start with a spoonful to see how your dog takes it (AKC).',
    ],
    never: [
      'Sweetened or flavored yogurt, and any yogurt with xylitol: PetMD says xylitol can cause severe liver damage, dangerously low blood sugar and death.',
    ],
    signs: ['Gas, diarrhea or vomiting from the lactose (AKC).'],
    usda: { fdc: 170887, description: 'Yogurt, plain, skim milk', kcalPer100g: 56 },
    piece: {
      grams: 15.3,
      one: 'tablespoon',
      many: 'tablespoons',
      basis: 'a sixteenth of USDA’s cup of 245 g',
    },
    sizeGuide: {
      by: 'PetMD',
      note: 'PetMD’s amounts, up to once a day.',
      rows: [
        ['Extra-small (2 to 10 lb)', '½ teaspoon'],
        ['Small (11 to 20 lb)', '1 teaspoon'],
        ['Medium (21 to 50 lb)', '1 tablespoon'],
        ['Large (51 to 90 lb)', '2 tablespoons'],
        ['Extra-large (91 lb and up)', '3 tablespoons'],
      ],
    },
    questions: [
      {
        question: 'Can dogs eat Greek yogurt?',
        answer:
          'Plain, unsweetened Greek yogurt is the kind PetMD prefers: more protein, less sugar and less lactose than regular yogurt.',
      },
    ],
    links: ['food-xylitol-gum'],
    sources: [S.petmdYogurt, S.akcYogurt, S.aspcaFoods],
  },
  {
    id: 'shrimp',
    name: 'shrimp',
    alternates: [
      {
        name: 'prawns',
        answer:
          'Yes, cooked prawns are shrimp by another name: thoroughly cooked, peeled, with the tail and vein removed and nothing added, they are safe in small amounts (PetMD, AKC).',
      },
    ],
    verdict: 'safe',
    answer: 'cooked, peeled shrimp is safe',
    summary:
      'Shrimp (prawns) cooked through, peeled and plain are safe in small amounts; raw shrimp and shells are not.',
    why: [
      'PetMD says dogs can safely eat properly prepared shrimp, and AKC says dogs can have it in moderation as an occasional treat.',
      'Shrimp brings vitamin B12, niacin, phosphorus and antioxidants and is low in fat (AKC, PetMD). It is high in cholesterol, so AKC keeps it occasional.',
    ],
    serve: [
      'Cook it through: boil, steam, grill or bake (PetMD); AKC says steaming is best.',
      'Remove the shell, the tail and the vein, and cut it into small pieces (PetMD).',
      'No butter, oil, seasoning, garlic or onion, and nothing breaded or fried (PetMD, AKC).',
    ],
    never: [
      'Raw shrimp, which AKC says carries harmful pathogens.',
      'Shells and tails, a choking risk, especially for small dogs (AKC).',
    ],
    signs: [
      'Vomiting or diarrhea from an intolerance (PetMD), and nausea and belly pain from raw shrimp (PetMD).',
    ],
    usda: { fdc: 175180, description: 'Crustaceans, shrimp, cooked', kcalPer100g: 99 },
    piece: { grams: 28.35, one: 'ounce', many: 'ounces', basis: '1 oz = 28.35 g' },
    sizeGuide: {
      by: 'PetMD',
      note: 'PetMD’s serving table. AKC says one or two pieces for most dogs and part of one for a small dog.',
      rows: [
        ['Extra-small (2 to 20 lb)', '½ medium shrimp'],
        ['Small (21 to 30 lb)', '1 medium shrimp'],
        ['Medium (31 to 50 lb)', '2 medium shrimp'],
        ['Large (51 to 90 lb)', '3 medium shrimp'],
        ['Extra-large (91 lb and up)', 'Up to 4 medium shrimp'],
      ],
    },
    questions: [
      {
        question: 'Can dogs eat shrimp tails?',
        answer:
          'No. PetMD says to remove the shell, the tail and the vein; AKC says shells can choke a dog.',
      },
    ],
    sources: [S.petmdShrimp, S.akcShrimp],
  },
  {
    id: 'salmon',
    name: 'salmon',
    alternates: [],
    verdict: 'safe',
    answer: 'cooked, boneless salmon is safe',
    summary:
      'Cooked, boneless salmon is safe for dogs; raw salmon can carry salmon poisoning disease, often fatal untreated.',
    why: [
      'PetMD says cooked salmon is safe for dogs, and AKC, reviewed by Dr. Ashly Smith, says dogs can safely eat it in moderation. It brings omega-3 fatty acids, protein and vitamin B12 (PetMD).',
      'The danger is raw or undercooked fish. Merck explains that dogs catch salmon poisoning disease from raw or undercooked trout, salmon or Pacific giant salamanders that carry a fluke infected with the bacterium Neorickettsia helminthoeca. It occurs in coastal areas of the Pacific Northwest, from northern California to Alaska (Merck).',
    ],
    serve: [
      'Fresh, cooked and boneless (PetMD). AKC: cook it to an internal temperature of 140 °F.',
      'Plain, with no seasoning, oil or sauce (AKC). Canned salmon: rinse it to remove salt and oil (PetMD), or choose low-sodium (AKC).',
    ],
    never: [
      'Raw or undercooked salmon or trout (Merck, PetMD, AKC), and smoked salmon (AKC).',
      'The bones: AKC says their small, brittle bones can perforate the intestines.',
    ],
    signs: [
      'Merck: signs of salmon poisoning disease begin about 5 to 7 days after a dog eats infected fish, though it can take up to 33 days. High fever, weakness, loss of appetite, vomiting, bloody diarrhea, dehydration and swollen lymph nodes.',
      'Without treatment, up to 90% of affected dogs die within 7 to 10 days (Merck). It is treated with early intravenous antibiotics and supportive care, so tell your veterinarian if your dog ate raw fish in the weeks before.',
    ],
    disagree: [
      'On salmon skin: PetMD says cooked skin is safe and holds even more omega-3 than the flesh; AKC advises against smoked or raw fish but does not single out cooked skin.',
    ],
    usda: {
      fdc: 175168,
      description: 'Fish, salmon, Atlantic, farmed, cooked, dry heat',
      kcalPer100g: 206,
    },
    piece: { grams: 28.35, one: 'ounce', many: 'ounces', basis: '1 oz = 28.35 g' },
    sizeGuide: {
      by: 'PetMD',
      note: 'PetMD’s amounts per week, cooked.',
      rows: [
        ['Extra-small (2 to 20 lb)', '1 to 2 ounces'],
        ['Small (21 to 30 lb)', '2 to 3 ounces'],
        ['Medium (31 to 50 lb)', '3 to 4 ounces'],
        ['Large (51 to 90 lb)', '4 to 6 ounces'],
        ['Extra-large (90 lb and up)', '6 to 8 ounces'],
      ],
    },
    questions: [
      {
        question: 'My dog ate raw salmon. What should I do?',
        answer:
          'Call your veterinarian, especially in the Pacific Northwest, where Merck says the infected fluke lives. Signs usually start 5 to 7 days later, and early antibiotics work; untreated, up to 90% of affected dogs die.',
      },
    ],
    sources: [S.merckSalmonOwner, S.merckSalmon, S.petmdSalmon, S.akcSalmon],
  },
  {
    id: 'pork',
    name: 'pork',
    alternates: [],
    verdict: 'moderation',
    answer: 'lean, plain and cooked through',
    summary:
      'Lean pork cooked through, plain and boneless is fine in small amounts; bacon, ham and raw pork are not.',
    why: [
      'PetMD says dogs can eat pork in moderation when it is fully cooked, plain, lean and boneless; AKC says plain cooked pork is safe in moderation but many pork products are dangerous.',
      'The caution is fat. PetMD says fatty cuts can trigger pancreatitis, and AKC that pork fat is hard to digest. Raw pork can carry the parasite Trichinella spiralis, and Salmonella (PetMD, AKC).',
    ],
    serve: [
      'Cook it through: ground pork to 160 °F, chops, steaks and roasts to 145 °F (PetMD).',
      'Lean cuts with the fat trimmed, such as tenderloin, in bite-sized pieces, unseasoned (PetMD). AKC: no onion powder, garlic powder, nutmeg or barbecue sauce.',
    ],
    never: [
      'Raw pork (PetMD, AKC).',
      'Bones: cooked bones turn brittle and splinter (AKC), and the ASPCA says bones can block the gut and need surgery.',
      'Bacon, ham and sausage (AKC, PetMD).',
    ],
    signs: [
      'Trichinosis from raw pork: upset stomach, vomiting, diarrhea, fever, lethargy and sore muscles (AKC).',
    ],
    usda: {
      fdc: 168233,
      description: 'Pork, fresh, loin, whole, separable lean only, cooked, roasted',
      kcalPer100g: 209,
    },
    piece: { grams: 28.35, one: 'ounce', many: 'ounces', basis: '1 oz = 28.35 g' },
    sizeGuide: {
      by: 'PetMD',
      note: 'PetMD’s amounts, in pieces about ½ in long by ½ in thick.',
      rows: [
        ['Extra-small (2 to 10 lb)', '1 piece'],
        ['Small (11 to 20 lb)', '1 to 2 pieces'],
        ['Medium (21 to 50 lb)', '2 to 3 pieces'],
        ['Large (51 to 90 lb)', '3 to 4 pieces'],
        ['Extra-large (91 lb and up)', '4 to 5 pieces'],
      ],
    },
    questions: [
      {
        question: 'Can dogs eat pork bones?',
        answer:
          'No. AKC says cooked bones become fragile and brittle and can splinter, and the ASPCA says a swallowed bone can injure or block the gut, sometimes needing surgery.',
      },
    ],
    links: ['food-ham', 'food-bacon'],
    sources: [S.petmdPork, S.akcPork, S.aspcaFoods],
  },
  {
    id: 'ham',
    name: 'ham',
    alternates: [],
    verdict: 'avoid',
    answer: 'it is too salty and fatty',
    summary:
      'Ham is not toxic, but it is salty and fatty, so PetMD and AKC both advise against it as a treat.',
    why: [
      'PetMD says ham is not toxic to dogs but is not a suitable treat; AKC says it is not advisable and healthier treats are better.',
      'The reasons are salt and fat. AKC says excess salt can be toxic to dogs, and that the nitrates and nitrites of cured ham add sodium. USDA’s sliced ham has 814 mg of sodium per 100 g. Its fat also raises the risk of pancreatitis (AKC, PetMD).',
    ],
    serve: [
      'A small piece that fell on the floor: PetMD says your dog should be totally fine.',
      'Call your veterinarian if it ate a lot, or shows any of the signs below (PetMD).',
    ],
    never: [
      'Ham bones: PetMD says cooked ham bones splinter easily and can choke a dog or block its gut.',
      'Glazed or honey-baked ham, for its sugar (PetMD).',
    ],
    signs: [
      'Lethargy, loss of appetite, drooling, belly pain, vomiting and diarrhea (PetMD). Too much salt: thirst, a lot of urine, vomiting and diarrhea, and in serious cases kidney damage, seizures and coma (AKC).',
    ],
    usda: {
      fdc: 173864,
      description: 'Ham, sliced, regular (approximately 11% fat)',
      kcalPer100g: 164,
      sodiumPer100g: 814,
    },
    piece: { grams: 28, one: 'slice', many: 'slices', basis: 'USDA: 1 slice = 28 g' },
    questions: [
      {
        question: 'Can dogs eat Christmas ham?',
        answer:
          'Not as a treat: glazed ham adds sugar to the salt and fat (PetMD), and the bone splinters. A small scrap is not an emergency; a bone, or a lot of ham, is a call to your veterinarian.',
      },
    ],
    links: ['food-pork', 'food-bacon'],
    sources: [S.petmdHam, S.akcHam, S.aspcaFoods],
  },
  {
    id: 'bacon',
    name: 'bacon',
    alternates: [],
    verdict: 'avoid',
    answer: 'it is too fatty and salty',
    summary:
      'Bacon is fatty and very salty, a risk for pancreatitis and salt poisoning, so veterinarians advise against it.',
    why: [
      'Chewy’s veterinarian-reviewed guide says dogs should not eat bacon, and AKC lists bacon and ham among the pork products to keep from dogs.',
      'The reasons are fat and salt. Merck counts eating large amounts of table scraps or other inappropriate food among the common risk factors for pancreatitis, and FirstVet calls pancreatitis a potentially fatal emergency. USDA’s baked bacon holds 2,193 mg of sodium per 100 g. Chewy adds that its nitrite preservatives can harm dogs.',
    ],
    serve: [
      'One stolen strip is not usually an emergency, but watch for the signs below.',
      'Chewy says to call your veterinarian at once if your dog vomits, has diarrhea, is lethargic or stops eating; FirstVet says belly pain needs emergency care.',
    ],
    never: [
      'Bacon, bacon grease and fat trimmings.',
      'Raw bacon, which carries the risks of raw pork (PetMD, ASPCA).',
    ],
    signs: [
      'Diarrhea, vomiting and discomfort soon after (Chewy). Pancreatitis: loss of appetite, vomiting, weakness, belly pain, dehydration and diarrhea (Merck). Too much salt: tremors, high fever and seizures (Chewy).',
    ],
    disagree: [
      'FirstVet says most dogs may tolerate controlled amounts of bacon treats; Chewy and AKC say no bacon at all. PetMD and AKC have no page on bacon alone.',
    ],
    usda: {
      fdc: 167914,
      description: 'Pork, cured, bacon, cooked, baked',
      kcalPer100g: 548,
      sodiumPer100g: 2193,
    },
    piece: { grams: 8.1, one: 'slice', many: 'slices', basis: 'USDA: 1 slice cooked = 8.1 g' },
    questions: [
      {
        question: 'My dog ate bacon grease. What now?',
        answer:
          'Grease is almost pure fat, the part that raises the risk of pancreatitis. Call your veterinarian, more so for a small dog or a large amount, and watch for vomiting, belly pain and a dog that stops eating (Merck, FirstVet).',
      },
    ],
    links: ['food-pork', 'food-ham'],
    sources: [
      S.chewyBacon,
      S.firstvetBacon,
      S.akcPork,
      S.petmdPork,
      S.merckPancreatitis,
      S.aspcaFoods,
    ],
  },
];
