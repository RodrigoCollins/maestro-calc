import { P } from './sources.ts';
import type { Plant } from './types.ts';

/** Cut flowers, bulbs and the holiday plants: every verdict is read from the ASPCA entries named. */
export const FLOWERS: readonly Plant[] = [
  {
    id: 'lilies',
    name: 'lilies',
    verb: 'are',
    entries: [
      'lily',
      'easter-lily',
      'tiger-lily',
      'day-lilies-many-varieties',
      'stargazer-lily',
      'japanese-show-lily',
      'rubrum-lily',
      'gloriosa-lily',
      'peace-lily',
      'calla-lily',
      'lily-valley',
      'peruvian-lily',
    ],
    answer: 'true lilies cause kidney failure, even the pollen',
    short: 'Pollen Can Kill',
    summary:
      'True lilies and daylilies can kill a cat: a few grains of pollen or a sip of vase water can cause kidney failure. The ASPCA lists them as non-toxic to dogs.',
    parts:
      'Every part of a true lily or daylily: the FDA names the stem, leaves, flowers, pollen and even the water in the vase. Pet Poison Helpline adds the rhizome, the root.',
    why: [
      'The ASPCA gives the toxic principle of Lilium species as unknown. Nobody has named the compound, but the damage is known: acute kidney injury in cats. ASPCApro says there are documented cases where the pollen alone caused it.',
      'Which lilies: the genus Lilium (Easter, tiger, Asiatic, Oriental, stargazer, Japanese show and rubrum lilies) and the daylilies, Hemerocallis. Pet Poison Helpline says all parts of lilies of the Lilium genus are toxic for cats.',
      'The ASPCA entries of the true lilies and of the daylilies list them as toxic to cats only, and non-toxic to dogs; the Easter, tiger and stargazer entries add that cats are the only species known to be affected.',
    ],
    signs: [
      'The FDA gives the timeline: decreased activity, drooling, vomiting and loss of appetite 0 to 12 hours after eating; signs of kidney damage, such as more urination and dehydration, about 12 to 24 hours after; kidney failure within 24 to 72 hours, leading to death if the cat is not treated.',
      'Pet Poison Helpline lists vomiting, abdominal pain, dehydration and acute kidney failure.',
    ],
    act: [
      'Do not wait for signs. The FDA says that if treatment is delayed by 18 hours or more, the cat will generally have irreversible kidney failure. Call your veterinarian or a poison line now, and take the cat in.',
      'ASPCApro tells veterinarians that any cat exposed to any part of a true lily should be on IV fluid diuresis for 48 hours. Expect your cat to stay in the clinic.',
      'Wash pollen off the fur and face, so the cat does not keep licking it, and take the flowers out of the house.',
    ],
    disagree: [
      'Not every “lily” is a true lily. The peace lily and the calla lily hold oxalate crystals that burn the mouth; the lily of the valley acts on the heart and is toxic to dogs too; the gloriosa lily holds colchicine-like alkaloids and is toxic to dogs too. The Peruvian lily (Alstroemeria) is on the ASPCA list as non-toxic.',
      'For dogs, the true lilies are on the ASPCA non-toxic list. A dog that ate one may still vomit, as with any plant, but the kidney failure is a cat’s.',
    ],
    alternatives: ['peruvian-lily', 'rose', 'sunflower'],
    questions: [
      {
        question: 'Can lily pollen on the fur poison a cat?',
        answer:
          'Yes. The FDA says licking a few grains of pollen off the fur while grooming can cause fatal kidney failure, and ASPCApro cites documented cases from pollen alone.',
      },
      {
        question: 'Is the water in a vase of lilies dangerous?',
        answer: 'Yes: the FDA names the vase water among the toxic parts.',
      },
      {
        question: 'Which lilies are safe for cats?',
        answer:
          'None of the true lilies or daylilies. Of the plants named “lily”, the ASPCA lists the Peruvian lily (Alstroemeria) as non-toxic to cats, dogs and horses.',
      },
    ],
    sources: [P.fdaLilies, P.aspcaProLilies, P.pphLilies],
  },
  {
    id: 'tulips',
    name: 'tulips',
    verb: 'are',
    entries: ['tulip'],
    answer: 'the bulbs are the most toxic part',
    short: 'The Bulbs Are Worst',
    summary:
      'Tulips are toxic to cats, dogs and horses on the ASPCA list, and the bulb holds the most toxin, which matters most for a dog that digs.',
    parts:
      'The bulb first: the ASPCA entry says the highest concentration of toxin is in the bulb. Pet Poison Helpline says the leaves, stems and flowers cause milder signs.',
    why: [
      'The ASPCA gives tulipalin A and B as the toxic principles of Tulipa spp. Pet Poison Helpline says the toxins run through the whole plant, most of all in the bulbs.',
    ],
    signs: [
      'The ASPCA lists vomiting, depression, diarrhea and hypersalivation.',
      'Pet Poison Helpline separates the two cases: leaves, stems or flowers usually bring mild nausea with vomiting; bulb material risks persistent stomach upset (vomiting, loss of appetite, diarrhea, drooling) and lethargy.',
    ],
    act: [
      'Find out whether a bulb was eaten, from the garden or a bag of bulbs waiting to be planted: that is the case to call about at once.',
      'For a chewed cut flower, call and describe it; most such cases are the mild stomach upset Pet Poison Helpline describes.',
      'Store bulbs where a dog cannot reach them before planting.',
    ],
    alternatives: ['rose', 'gerber-daisy', 'sunflower'],
    questions: [
      {
        question: 'Are tulip bulbs worse than the flowers?',
        answer:
          'Yes. The ASPCA entry says the bulb has the highest concentration of toxin, and Pet Poison Helpline links bulb material to the more persistent signs.',
      },
      {
        question: 'Can a cat get sick from a vase of tulips?',
        answer:
          'Yes: the ASPCA lists the tulip as toxic to cats. Chewed petals or leaves usually cause mild vomiting, by Pet Poison Helpline.',
      },
    ],
    sources: [P.pphTulip],
  },
  {
    id: 'daffodils',
    name: 'daffodils',
    verb: 'are',
    entries: ['daffodil'],
    answer: 'the bulbs are the most poisonous part',
    short: 'The Bulbs Are Worst',
    summary:
      'Daffodils (narcissus, jonquils) are toxic to cats, dogs and horses on the ASPCA list; a large amount, the bulb above all, can cause convulsions.',
    parts:
      'The bulb: the ASPCA entry says bulbs are the most poisonous part, and Pet Poison Helpline gives the highest concentration of alkaloids there. The flowers and leaves are toxic too.',
    why: [
      'The ASPCA gives lycorine and other alkaloids as the toxic principles of Narcissus spp., the same family of compounds as in amaryllis.',
      'Pet Poison Helpline says all parts hold alkaloids that cause severe stomach upset and can bring life-threatening effects.',
    ],
    signs: [
      'The ASPCA lists vomiting, salivation and diarrhea; large ingestions cause convulsions, low blood pressure, tremors and cardiac arrhythmias.',
      'Pet Poison Helpline says the vomiting may be severe, leading to profound dehydration, weakness and shock.',
    ],
    act: [
      'A dug-up or chewed bulb is the call to make now. So is a pet that ate a paperwhite bulb set to force indoors.',
      'Note the time, the part and how much, and bring a bulb from the same bag.',
    ],
    alternatives: ['sunflower', 'gerber-daisy', 'phalaenopsis-orchid'],
    questions: [
      {
        question: 'Are paperwhites and jonquils daffodils?',
        answer:
          'Yes: the ASPCA gives narcissus, jonquil and paper white as other names on its daffodil entry.',
      },
    ],
    sources: [P.pphDaffodil],
  },
  {
    id: 'hyacinths',
    name: 'hyacinths',
    verb: 'are',
    entries: ['hyacinth'],
    answer: 'they cause intense vomiting, the bulbs most',
    short: 'Intense Vomiting',
    summary:
      'Hyacinths are toxic to cats, dogs and horses on the ASPCA list, which names intense vomiting and diarrhea, at times with blood.',
    parts:
      'The bulb, as with tulips: Pet Poison Helpline covers the two together and says bulb material carries the most risk.',
    why: [
      'The ASPCA gives the toxic principle of Hyacinthus orientalis as possibly narcissus-like alkaloids, the family of the daffodil’s lycorine.',
    ],
    signs: [
      'The ASPCA lists intense vomiting, diarrhea, occasionally with blood, depression and tremors.',
      'Pet Poison Helpline links persistent vomiting, loss of appetite, diarrhea, drooling and lethargy to the bulb.',
    ],
    act: [
      'Blood in the vomit or tremors means go to a veterinarian now. A potted hyacinth forced in a glass on a windowsill is easy for a cat to reach: move it.',
    ],
    alternatives: ['african-violet', 'phalaenopsis-orchid', 'christmas-cactus'],
    questions: [
      {
        question: 'Is a hyacinth worse than a tulip?',
        answer:
          'The ASPCA entry for hyacinth names intense vomiting with tremors; the tulip entry names vomiting, depression, diarrhea and drooling. Both are toxic, and both bulbs are the worst part.',
      },
    ],
    sources: [P.pphTulip],
  },
  {
    id: 'chrysanthemums',
    name: 'chrysanthemums',
    verb: 'are',
    entries: ['chrysanthemum', 'daisy'],
    answer: 'mums cause vomiting, drooling and a rash',
    short: 'Vomiting, Rash',
    summary:
      'Chrysanthemums (mums) are toxic to cats, dogs and horses on the ASPCA list, from pyrethrins and other irritants in the plant.',
    parts:
      'The flowers and leaves of a potted mum or a bouquet. The ASPCA entry does not name a worse part.',
    why: [
      'The ASPCA gives sesquiterpene lactones, pyrethrins and other potential irritants as the toxic principles of Chrysanthemum spp., and files daisy and mum as its other names.',
    ],
    signs: [
      'The ASPCA lists vomiting, diarrhea, hypersalivation, incoordination and dermatitis: the skin can react where the plant touched it.',
    ],
    act: [
      'Wash the face and paws if your pet rolled in or chewed the flowers, and call if it walks unsteadily.',
    ],
    alternatives: ['gerber-daisy', 'sunflower', 'african-violet'],
    questions: [
      {
        question: 'Are garden mums the same plant?',
        answer:
          'Yes. The ASPCA files mum and daisy as other names on its chrysanthemum entry, which covers many varieties.',
      },
    ],
    sources: [],
  },
  {
    id: 'daisies',
    name: 'daisies',
    verb: 'are',
    entries: ['daisy', 'gerber-daisy'],
    answer: 'most are, but the gerbera daisy is safe',
    short: 'Most, Not the Gerbera',
    summary:
      'The ASPCA lists the daisy (a chrysanthemum) as toxic to cats and dogs, but the gerbera daisy as non-toxic: the name hides two plants.',
    parts:
      'For the daisy of the ASPCA list, the flowers and leaves; the gerbera daisy has no toxic part on its entry.',
    why: [
      'The ASPCA files the daisy under Chrysanthemum species, with the same sesquiterpene lactones, pyrethrins and irritants as the chrysanthemum.',
      'The gerbera (Gerbera jamesonii, also Transvaal, African, veldt or Barberton daisy) is a different plant, and the ASPCA lists it as non-toxic to dogs, cats and horses.',
    ],
    signs: [
      'For the toxic daisy, the ASPCA lists vomiting, diarrhea, hypersalivation, incoordination and dermatitis.',
    ],
    act: [
      'Check the plant tag. A gerbera (Gerbera jamesonii) is on the safe list; a plant labelled Chrysanthemum, or a pot of mums, is the kind to call about.',
    ],
    disagree: [
      'The ASPCA entry for the daisy lists dogs and cats, not horses, while the chrysanthemum entry, under nearly the same name, adds horses.',
    ],
    alternatives: ['gerber-daisy', 'sunflower', 'rose'],
    questions: [
      {
        question: 'Are gerbera daisies safe for cats?',
        answer: 'Yes: the ASPCA lists the gerber daisy as non-toxic to dogs, cats and horses.',
      },
    ],
    sources: [],
  },
  {
    id: 'carnations',
    name: 'carnations',
    verb: 'are',
    entries: ['carnation'],
    answer: 'mildly: the stomach and skin',
    short: 'Mildly',
    summary:
      'Carnations are toxic to cats, dogs and horses on the ASPCA list, with mild stomach and skin signs from an unknown irritant.',
    parts: 'The flowers, stems and leaves of a bouquet. The ASPCA does not name a worse part.',
    why: [
      'The ASPCA gives an unknown irritant as the toxic principle of Dianthus caryophyllus, filed with the other names pinks, wild carnation and sweet William.',
    ],
    signs: ['The ASPCA lists mild gastrointestinal signs and mild dermatitis.'],
    act: [
      'Clear the chewed stems away and watch for vomiting or a red, itchy patch where the flowers touched. Call if it does not pass.',
    ],
    alternatives: ['rose', 'peruvian-lily', 'sunflower'],
    questions: [
      {
        question: 'Is sweet William the same as a carnation?',
        answer:
          'The ASPCA files sweet William and pinks under its carnation entry, Dianthus caryophyllus.',
      },
    ],
    sources: [],
  },
  {
    id: 'calla-lilies',
    name: 'calla lilies',
    verb: 'are',
    entries: ['calla-lily'],
    answer: 'they burn the mouth, but they are not true lilies',
    short: 'Not a True Lily',
    summary:
      'Calla lilies are toxic to cats and dogs on the ASPCA list for their oxalate crystals; they are not the true lilies that destroy a cat’s kidneys.',
    parts: 'The leaves, stems and the flower, all holding the crystals.',
    why: [
      'The ASPCA gives insoluble calcium oxalates as the toxic principle of Zantedeschia aethiopica, filed also as arum lily, pig lily, white arum and trumpet lily.',
      'The FDA separates calla and peace lilies from the true lilies: their crystals irritate the mouth and throat, without the kidney damage.',
    ],
    signs: [
      'The ASPCA lists oral irritation, intense burning and irritation of the mouth, tongue and lips, excessive drooling, vomiting and difficulty swallowing.',
    ],
    act: [
      'Offer water, wipe the mouth, and call if the drooling or the trouble swallowing goes on. Bouquets can mix callas with true lilies: if a cat chewed one, check every flower in it.',
    ],
    alternatives: ['rose', 'phalaenopsis-orchid', 'peruvian-lily'],
    questions: [
      {
        question: 'Can a calla lily cause kidney failure in a cat?',
        answer:
          'The FDA says no: the calla lily’s crystals irritate the mouth. The kidney failure comes from true lilies and daylilies.',
      },
    ],
    sources: [P.fdaLilies, P.pphOxalates],
  },
  {
    id: 'amaryllis',
    name: 'amaryllis',
    verb: 'is',
    entries: ['amaryllis', 'lily-palace'],
    answer: 'the bulb is the most poisonous part',
    short: 'The Bulb Is Worst',
    summary:
      'Amaryllis is toxic to cats, dogs and horses on the ASPCA list; the holiday Hippeastrum bulb holds the most of its lycorine.',
    parts:
      'The bulb: the ASPCA entry for Hippeastrum (lily of the palace) says bulbs are the most poisonous part.',
    why: [
      'The ASPCA gives lycorine and others for Amaryllis spp., and lycorine and other alkaloids for Hippeastrum spp., the bulb sold as amaryllis in winter kits.',
    ],
    signs: [
      'The amaryllis entry lists vomiting (not horses), depression, diarrhea, abdominal pain, hypersalivation, anorexia and tremors.',
      'The Hippeastrum entry adds that large ingestions cause convulsions, low blood pressure, tremors and cardiac arrhythmias.',
    ],
    act: [
      'A chewed bulb from a gift kit is the case to call about now. Keep the kit box: it names the plant.',
    ],
    disagree: [
      'The ASPCA files the naked lady and Belladonna lily as amaryllis, and the boxed winter amaryllis as Hippeastrum, lily of the palace. Both entries are toxic.',
    ],
    alternatives: ['christmas-cactus', 'phalaenopsis-orchid', 'african-violet'],
    questions: [
      {
        question: 'Is the amaryllis in a Christmas kit toxic?',
        answer:
          'Yes. Those bulbs are Hippeastrum, which the ASPCA files as lily of the palace, toxic to dogs and cats.',
      },
    ],
    sources: [],
  },
  {
    id: 'peonies',
    name: 'peonies',
    verb: 'are',
    entries: ['peony'],
    answer: 'they cause vomiting and diarrhea',
    short: 'Stomach Upset',
    summary:
      'Peonies are toxic to cats, dogs and horses on the ASPCA list, which names paeonol as the cause of vomiting, diarrhea and depression.',
    parts:
      'The ASPCA entry names no part, so treat the flowers and leaves of a bouquet or a bush alike.',
    why: ['The ASPCA gives paeonol as the toxic principle of Paeonia officinalis.'],
    signs: ['The ASPCA lists vomiting, diarrhea and depression.'],
    act: ['Note how much of the bouquet or the bush was eaten, and call if the vomiting goes on.'],
    alternatives: ['rose', 'peruvian-lily', 'hibiscus'],
    questions: [
      {
        question: 'Are peonies safe for a wedding bouquet near a cat?',
        answer:
          'The ASPCA lists the peony as toxic to cats. Roses and Peruvian lilies are on its non-toxic list.',
      },
    ],
    sources: [],
  },
  {
    id: 'poinsettias',
    name: 'poinsettias',
    verb: 'are',
    entries: ['poinsettia'],
    answer: 'mildly, and less than their reputation',
    short: 'Mildly',
    summary:
      'Poinsettias are toxic to cats and dogs on the ASPCA list, but both the ASPCA and Pet Poison Helpline say their danger is over-rated: the sap irritates.',
    parts:
      'The milky sap in the leaves and bracts. Pet Poison Helpline says it can irritate the skin and the eyes too.',
    grade: { by: 'Pet Poison Helpline', level: 'mild' },
    why: [
      'The ASPCA gives an irritant sap, and says the poinsettia is generally over-rated in toxicity. Pet Poison Helpline names diterpenoid euphorbol esters and saponin-like detergents in the milky sap.',
    ],
    signs: [
      'The ASPCA says it irritates the mouth and stomach, sometimes causing vomiting. Pet Poison Helpline adds drooling, lip licking, diarrhea, and redness, swelling and itching of the skin or eyes.',
    ],
    act: [
      'Pet Poison Helpline says the signs are generally self-limiting and rarely need treatment unless severe and persistent. Wash sap off the skin, offer water, and call if vomiting goes on.',
    ],
    disagree: [
      'The poinsettia is on the toxic list, and also the plant both sources call exaggerated. The listing is real; the fear of a deadly poinsettia is not.',
    ],
    alternatives: ['christmas-cactus', 'phalaenopsis-orchid', 'african-violet'],
    questions: [
      {
        question: 'Can a poinsettia kill a cat?',
        answer:
          'Neither source suggests it. Pet Poison Helpline grades it mild, and the ASPCA calls it generally over-rated in toxicity.',
      },
      {
        question: 'Which Christmas plant is safe?',
        answer:
          'The Christmas cactus is on the ASPCA list as non-toxic to dogs, cats and horses. Holly, mistletoe and amaryllis are toxic.',
      },
    ],
    sources: [P.pphPoinsettia],
  },
  {
    id: 'holly',
    name: 'holly',
    verb: 'is',
    entries: ['holly'],
    answer: 'its entry calls the leaves and berries low toxicity',
    short: 'Low Toxicity',
    summary:
      'Holly is toxic to cats, dogs and horses on the ASPCA list, though its entry calls the leaves and berries low toxicity.',
    parts: 'The leaves and the red berries. The ASPCA entry says both are low toxicity.',
    why: [
      'The ASPCA gives saponins as the toxic principle of Ilex opaca, filed with English, European, American and Oregon holly, inkberry and winterberry.',
    ],
    signs: ['The ASPCA lists vomiting, diarrhea and depression.'],
    act: [
      'Clear fallen berries from a wreath or a garden hedge, and call if your pet keeps vomiting.',
    ],
    alternatives: ['christmas-cactus', 'rosemary', 'parlor-palm'],
    questions: [
      {
        question: 'Are holly berries poisonous to dogs?',
        answer:
          'The ASPCA lists holly as toxic to dogs and says the leaves and berries are low toxicity, with vomiting, diarrhea and depression.',
      },
    ],
    sources: [],
  },
  {
    id: 'mistletoe',
    name: 'mistletoe',
    verb: 'is',
    entries: ['mistletoe-american'],
    answer: 'it can slow the heart and lower blood pressure',
    short: 'It Can Slow the Heart',
    summary:
      'American mistletoe is toxic to cats, dogs and horses on the ASPCA list, from toxalbumins and phoratoxins that can slow the heart.',
    parts: 'The berries and leaves of a sprig hung at the holidays, which drop to the floor.',
    why: [
      'The ASPCA gives toxalbumin and the lectins and phoratoxins of Phoradendron flavescens as its toxic principles.',
    ],
    signs: [
      'The ASPCA lists vomiting, diarrhea, low blood pressure (rare), difficulty breathing and low heart rate.',
    ],
    act: [
      'A pet with trouble breathing or that is weak after eating mistletoe needs a veterinarian now. Hang sprigs high and sweep up the fallen berries.',
    ],
    alternatives: ['christmas-cactus', 'rosemary', 'bamboo-palm'],
    questions: [
      {
        question: 'Is European mistletoe on the list?',
        answer:
          'The ASPCA entry used here is American mistletoe, Phoradendron flavescens. Ask the poison line about another kind.',
      },
    ],
    sources: [],
  },
];
