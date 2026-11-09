import { P } from './sources.ts';
import type { Plant } from './types.ts';

/** Garden shrubs, flowers and herbs: every verdict is read from the ASPCA entries named. */
export const GARDEN: readonly Plant[] = [
  {
    id: 'sago-palms',
    name: 'sago palms',
    verb: 'are',
    entries: ['sago-palm'],
    answer: 'the seeds can cause fatal liver failure',
    short: 'Seeds Can Be Fatal',
    summary:
      'Sago palms are toxic to cats, dogs and horses on the ASPCA list and among the worst for a dog: cycasin, in the seeds above all, destroys the liver.',
    parts:
      'Every part, the seed (or nut) most of all, by Pet Poison Helpline. The Merck Veterinary Manual names cycasin in the seeds, roots and leaves.',
    why: [
      'The ASPCA gives cycasin as the toxic principle of Cycas revoluta and the zamias, also called coontie and cardboard palms. The sago is a cycad, not a true palm.',
      'The Merck Veterinary Manual explains that gut bacteria turn cycasin into methylazoxymethanol, the toxic metabolite, which harms the liver.',
    ],
    signs: [
      'The ASPCA lists vomiting, melena (black stool), icterus (yellow gums and eyes), increased thirst, hemorrhagic gastroenteritis, bruising, coagulopathy (poor clotting), liver damage, liver failure and death.',
      'Merck says dogs seen within 24 hours most often vomit, then show diarrhea, poor appetite, lethargy, drooling, more thirst, neurologic signs (a wobbly gait, confusion, head pressing, rarely seizures), bleeding into the gut and tremors.',
    ],
    act: [
      'Treat any chewing of a sago palm, a seed above all, as an emergency: call your veterinarian or a poison line now, and go in even if your dog seems well.',
      'Merck cites studies in which half to about two thirds of dogs with confirmed cycad poisoning survived. The odds are why the advice is to dig the plant out of a yard a dog uses.',
    ],
    alternatives: ['areca-palm', 'parlor-palm', 'pony-tail'],
    questions: [
      {
        question: 'Is a sago palm a real palm?',
        answer:
          'No: it is a cycad. The ASPCA files it with the zamias and other cycads, all toxic.',
      },
      {
        question: 'Which palm is safe for dogs?',
        answer:
          'The areca palm, the parlor palm and the ponytail palm are on the ASPCA list as non-toxic to dogs and cats.',
      },
    ],
    sources: [P.pphSago, P.merckCycad],
  },
  {
    id: 'oleander',
    name: 'oleander',
    verb: 'is',
    entries: ['oleander'],
    answer: 'its heart toxin runs through the whole plant',
    short: 'A Heart Toxin',
    summary:
      'Oleander is toxic to cats, dogs and horses on the ASPCA list: oleandrin, a cardiac glycoside in every part of the plant, can be fatal.',
    parts:
      'The whole shrub: Pet Poison Helpline says oleandrin is found throughout the plant, the leaves, flowers and stems alike.',
    why: [
      'The ASPCA gives cardiac glycosides as the toxic principle of Nerium oleander, also called rose-bay. Pet Poison Helpline names the glycoside as oleandrin.',
    ],
    signs: [
      'The ASPCA lists drooling, abdominal pain, diarrhea, colic, depression and death.',
      'Pet Poison Helpline sorts the signs into three: the stomach (vomiting, loss of appetite), the heart (an irregular rate and rhythm) and the nerves (weakness, collapse).',
    ],
    act: [
      'Call now and go to a veterinarian: a heart toxin is not one to watch at home. Bring a sprig of the shrub.',
      'Hedge clippings are a hidden source: rake them up instead of leaving them where a dog plays.',
    ],
    alternatives: ['hibiscus', 'rose', 'bamboo'],
    questions: [
      {
        question: 'Can dried oleander leaves still poison a dog?',
        answer:
          'The sources here do not say the toxin goes when a leaf dries, so treat clippings as you treat the shrub.',
      },
    ],
    sources: [P.pphOleander],
  },
  {
    id: 'foxglove',
    name: 'foxglove',
    verb: 'is',
    entries: ['foxglove'],
    answer: 'its cardiac glycosides can stop the heart',
    short: 'A Heart Toxin',
    summary:
      'Foxglove (Digitalis purpurea) is toxic to cats, dogs and horses on the ASPCA list: its cardiac glycosides can cause arrhythmias, heart failure and death.',
    parts: 'The whole plant: Pet Poison Helpline says the entire plant is toxic.',
    why: [
      'The ASPCA gives cardiac glycosides as the toxic principle of Digitalis purpurea. Pet Poison Helpline says they act directly on the heart.',
    ],
    signs: [
      'The ASPCA lists cardiac arrhythmias, vomiting, diarrhea, weakness, cardiac failure and death.',
    ],
    act: [
      'Call now and go to a veterinarian even if your pet seems well: a heart toxin is not one to watch at home. Bring a flower stalk.',
    ],
    alternatives: ['sunflower', 'rose', 'gerber-daisy'],
    questions: [
      {
        question: 'Is foxglove toxic to dogs as well as cats?',
        answer:
          'Yes: the ASPCA lists Digitalis purpurea as toxic to dogs, cats and horses, and Pet Poison Helpline says eating it can be fatal for dogs.',
      },
    ],
    sources: [P.pphFoxglove],
  },
  {
    id: 'lily-of-the-valley',
    name: 'lily of the valley',
    verb: 'is',
    entries: ['lily-valley'],
    answer: 'it is a heart toxin, not a true lily',
    short: 'A Heart Toxin',
    summary:
      'Lily of the valley is toxic to cats, dogs and horses on the ASPCA list: its cardenolides act on the heart, unlike the lilies that harm the kidneys.',
    parts:
      'The whole plant: Pet Poison Helpline names the cardenolides without singling out a part.',
    why: [
      'The ASPCA gives cardenolides (convallarin and others) as the toxic principle of Convallaria majalis. Pet Poison Helpline calls them cardiac toxins.',
      'The FDA and ASPCApro both set it apart from the true lilies: it acts on the heart rhythm, not the kidneys.',
    ],
    signs: [
      'The ASPCA lists vomiting, irregular heart beat, low blood pressure, disorientation, coma and seizures.',
      'Pet Poison Helpline says dogs and cats often show vomiting and loss of appetite, and may go on to changes in heart rate and rhythm, weakness and seizures.',
    ],
    act: [
      'Call now. Unlike the true lilies, it harms dogs as well as cats, so the dog that dug in the shade bed counts too.',
    ],
    alternatives: ['boston-fern', 'african-violet', 'cast-iron-plant'],
    questions: [
      {
        question: 'Is lily of the valley a true lily?',
        answer:
          'No. The FDA says it causes abnormal heart rhythm, unlike the kidney damage of true lilies, and the ASPCA lists it as toxic to dogs too.',
      },
    ],
    sources: [P.pphLilyValley, P.fdaLilies, P.aspcaProLilies],
  },
  {
    id: 'azaleas',
    name: 'azaleas',
    verb: 'are',
    entries: ['azalea'],
    answer: 'they affect the gut and the heart',
    short: 'The Gut and the Heart',
    summary:
      'Azaleas and rhododendrons are toxic to cats, dogs and horses on the ASPCA list; their grayanotoxin can cause weakness and heart failure.',
    parts: 'All parts of the plant, by Pet Poison Helpline.',
    why: [
      'The ASPCA gives grayanotoxin (spelled grayantoxin on its entry) as the toxic principle of Rhododendron spp., filed also as rosebay and rhododendron.',
    ],
    signs: [
      'The ASPCA lists vomiting (not in horses), diarrhea, weakness and cardiac failure. Pet Poison Helpline describes stomach upset and cardiovascular dysfunction.',
    ],
    act: [
      'Weakness after chewing an azalea is a reason to go in now. Bring a cutting so the clinic knows it is a rhododendron.',
    ],
    alternatives: ['hibiscus', 'rose', 'boston-fern'],
    questions: [
      {
        question: 'Are rhododendrons the same as azaleas?',
        answer:
          'For the ASPCA, yes: its azalea entry is Rhododendron spp., with rhododendron as another name.',
      },
    ],
    sources: [P.pphAzalea],
  },
  {
    id: 'hydrangeas',
    name: 'hydrangeas',
    verb: 'are',
    entries: ['hydrangea'],
    answer: 'mostly an upset stomach, rarely cyanide',
    short: 'Mostly Stomach Upset',
    summary:
      'Hydrangeas are toxic to cats, dogs and horses on the ASPCA list; they hold a cyanogenic glycoside, though the entry says stomach upset is the usual result.',
    parts: 'The leaves, buds and flowers. The ASPCA entry does not separate them.',
    why: [
      'The ASPCA gives a cyanogenic glycoside as the toxic principle of Hydrangea arborescens, also hortensia, hills of snow and seven bark.',
    ],
    signs: [
      'The ASPCA lists vomiting, depression and diarrhea, and says cyanide intoxication is rare: the plant usually causes more of a gastrointestinal disturbance.',
    ],
    act: [
      'Call and describe how much was eaten; with stomach signs the usual result, the line will tell you whether to watch at home.',
    ],
    alternatives: ['rose', 'hibiscus', 'sunflower'],
    questions: [
      {
        question: 'Can hydrangeas give a dog cyanide poisoning?',
        answer:
          'The ASPCA entry says cyanide intoxication is rare; the plant usually upsets the stomach.',
      },
    ],
    sources: [],
  },
  {
    id: 'geraniums',
    name: 'geraniums',
    verb: 'are',
    entries: ['geranium'],
    answer: 'their oils upset the stomach and skin',
    short: 'Stomach and Skin',
    summary:
      'Geraniums (Pelargonium) are toxic to cats, dogs and horses on the ASPCA list, from the geraniol and linalool in their scented leaves.',
    parts: 'The scented leaves and the flowers. The ASPCA entry does not separate them.',
    why: [
      'The ASPCA gives geraniol and linalool as the toxic principles of Pelargonium species, the many cultivars sold as geraniums.',
    ],
    signs: ['The ASPCA lists vomiting, anorexia, depression and dermatitis.'],
    act: [
      'Wash the face and paws, watch for a rash, and call if your pet stops eating or keeps vomiting.',
    ],
    alternatives: ['african-violet', 'gerber-daisy', 'rose'],
    questions: [
      {
        question: 'Are scented geraniums toxic too?',
        answer:
          'The ASPCA entry covers Pelargonium species and their many cultivars, scented ones among them.',
      },
    ],
    sources: [],
  },
  {
    id: 'lavender',
    name: 'lavender',
    verb: 'is',
    entries: ['lavender'],
    answer: 'mildly, with nausea and vomiting',
    short: 'Mildly',
    summary:
      'Lavender is toxic to cats, dogs and horses on the ASPCA list, from linalool and linalyl acetate; the signs it names are nausea, vomiting and not eating.',
    parts: 'The flowers and leaves, which hold the oil. The ASPCA does not separate them.',
    why: [
      'The ASPCA gives linalool and linalyl acetate (spelled linlool on its entry) as the toxic principles of common or English lavender.',
    ],
    signs: ['The ASPCA lists nausea, vomiting (not in horses) and inappetence.'],
    act: [
      'A sprig from a border usually brings the stomach signs above. Call if they go on.',
      'Lavender oil is not the plant: ask your veterinarian before using any essential oil around a pet.',
    ],
    alternatives: ['rosemary', 'thyme', 'basil'],
    questions: [
      {
        question: 'Is dried lavender in a sachet toxic?',
        answer:
          'The ASPCA entry is for the plant; it does not say drying changes it. Keep sachets out of reach.',
      },
    ],
    sources: [],
  },
  {
    id: 'mint',
    name: 'mint',
    verb: 'is',
    entries: ['mint'],
    answer: 'in large amounts, from its oils',
    short: 'In Large Amounts',
    summary:
      'Garden mint is toxic to cats, dogs and horses on the ASPCA list, which names vomiting and diarrhea with large ingestions.',
    parts: 'The leaves and stems, which hold the oils.',
    why: ['The ASPCA gives essential oils as the toxic principle of Mentha species.'],
    signs: ['The ASPCA lists vomiting and diarrhea with large ingestions.'],
    act: [
      'A leaf or two is not the large ingestion the entry describes; a stripped pot is. Call if your pet keeps vomiting.',
    ],
    alternatives: ['basil', 'rosemary', 'thyme'],
    questions: [
      {
        question: 'Is catnip a mint?',
        answer:
          'Catnip has its own ASPCA entry, Nepeta cataria, listed as toxic to cats; the mint entry is Mentha.',
      },
    ],
    sources: [],
  },
  {
    id: 'eucalyptus',
    name: 'eucalyptus',
    verb: 'is',
    entries: ['eucalyptus'],
    answer: 'its oil causes drooling and vomiting',
    short: 'Drooling and Vomiting',
    summary:
      'Eucalyptus is toxic to cats, dogs and horses on the ASPCA list: eucalyptol, its essential oil, causes salivation, vomiting and weakness.',
    parts: 'The leaves, which hold the oil, in a dried bunch or a live plant.',
    why: ['The ASPCA gives essential oils, eucalyptol, as the toxic principle.'],
    signs: ['The ASPCA lists salivation, vomiting, diarrhea, depression and weakness.'],
    act: [
      'Take the bunch out of the shower or the vase, and call if your pet is weak or keeps vomiting.',
    ],
    alternatives: ['bamboo-palm', 'boston-fern', 'areca-palm'],
    questions: [
      {
        question: 'Is a eucalyptus bunch in the shower dangerous to a cat?',
        answer:
          'The ASPCA lists eucalyptus as toxic to cats, so keep the bunch where your cat cannot chew it.',
      },
    ],
    sources: [],
  },
  {
    id: 'catnip',
    name: 'catnip',
    verb: 'is',
    entries: ['catnip'],
    answer: 'it can cause vomiting and diarrhea',
    short: 'Stomach Upset',
    summary:
      'Catnip is on the ASPCA toxic list for cats: its entry says many cats love it, but it can cause vomiting and diarrhea. The entry does not list dogs.',
    parts: 'The leaves and flowers, fresh or dried. The ASPCA entry does not name a worse part.',
    why: [
      'The ASPCA gives nepetalactone as the toxic principle of Nepeta cataria, also catswort and catmint. It says the plant makes some cats sedated and others stimulated.',
    ],
    signs: [
      'The ASPCA says it can cause vomiting and diarrhea, and that it makes some cats sedated and others stimulated.',
    ],
    act: [
      'Take away the rest of the catnip and let your cat settle. Call if vomiting or diarrhea goes on.',
    ],
    disagree: [
      'The verdict surprises people because catnip is sold for cats. The ASPCA entry lists it as toxic for its stomach effects, and in the same line says many cats love it. It gives no amount, so watch how your own cat reacts.',
      'The entry does not name dogs at all, so this page cannot give a verdict for dogs.',
    ],
    alternatives: ['spider-plant', 'basil', 'rosemary'],
    questions: [
      {
        question: 'How much catnip is too much?',
        answer:
          'The ASPCA entry gives no amount. If your cat vomits or has diarrhea after catnip, give it less, and ask your veterinarian.',
      },
    ],
    sources: [],
  },
  {
    id: 'tomato-plants',
    name: 'tomato plants',
    verb: 'are',
    entries: ['tomato-plant'],
    answer: 'the green plant is, the ripe fruit is not',
    short: 'Not Ripe Fruit',
    summary:
      'The tomato plant is toxic to cats, dogs and horses on the ASPCA list for its solanine; the same entry says the ripe fruit is non-toxic.',
    parts: 'The leaves, stems and green fruit. The ASPCA entry says the ripe fruit is non-toxic.',
    why: ['The ASPCA gives solanine as the toxic principle of Lycopersicon spp.'],
    signs: [
      'The ASPCA lists hypersalivation, inappetence, severe gastrointestinal upset, depression, weakness, dilated pupils and slow heart rate.',
    ],
    act: [
      'Fence the vegetable bed. If your pet chewed the plant or green tomatoes, call; a ripe tomato is the non-toxic part of the entry.',
    ],
    alternatives: ['basil', 'rosemary', 'sunflower'],
    questions: [
      {
        question: 'Can dogs eat ripe tomatoes?',
        answer:
          'The ASPCA entry says the ripe fruit is non-toxic. The can-dogs-eat page on tomatoes covers the amounts.',
      },
    ],
    sources: [],
  },
];
