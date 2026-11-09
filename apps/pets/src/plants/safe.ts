import type { Plant } from './types.ts';

/** What the ASPCA says of every plant on its list, the non-toxic ones included. */
const ANY_PLANT =
  'The ASPCA adds, for every plant on its list, that eating any plant material may cause vomiting and stomach upset in dogs and cats, and that the non-toxic ones are not expected to be life-threatening.';

/** The plants the ASPCA lists as non-toxic to cats and dogs: every verdict is read from the entries named. */
export const SAFE: readonly Plant[] = [
  {
    id: 'spider-plants',
    name: 'spider plants',
    verb: 'are',
    entries: ['spider-plant'],
    answer: 'the ASPCA lists them as non-toxic to cats and dogs',
    short: 'Non-Toxic',
    summary:
      'Spider plants (Chlorophytum comosum) are on the ASPCA list as non-toxic to cats and dogs, one of the safest hanging plants for a home with pets.',
    parts:
      'No part: the ASPCA entry gives no toxic principle and no clinical signs. A cat that chews the long arching leaves may still vomit, as with any plant.',
    why: [
      'The ASPCA lists Chlorophytum comosum as non-toxic to dogs and to cats, with ribbon plant, anthericum and spider ivy as its other names. Its entry does not name horses.',
    ],
    signs: [ANY_PLANT],
    act: [
      'Nothing urgent. Move the pot if your cat chews it often enough to vomit, and call your veterinarian if the vomiting goes on: that is not the plant’s doing alone.',
    ],
    disagree: [
      'The ASPCA uses “ribbon plant” for both the spider plant and a dracaena, which is toxic. Check for the scientific name Chlorophytum comosum on the label.',
    ],
    alternatives: ['boston-fern', 'swedish-ivy', 'african-violet'],
    questions: [
      {
        question: 'Why does my cat love chewing the spider plant?',
        answer:
          'The ASPCA sources here do not say. They say only that it is non-toxic, and that chewing any plant can make a cat vomit.',
      },
    ],
    sources: [],
  },
  {
    id: 'christmas-cactus',
    name: 'Christmas cactus',
    verb: 'is',
    entries: ['christmas-cactus'],
    answer: 'it is on the ASPCA non-toxic list',
    short: 'Non-Toxic',
    summary:
      'The Christmas cactus (Schlumbergera) is non-toxic to cats, dogs and horses on the ASPCA list, a safe swap for a poinsettia or amaryllis.',
    parts: 'No part: the ASPCA entry gives no toxic principle.',
    why: [
      'The ASPCA lists Schlumbergera bridgesii as non-toxic to dogs, cats and horses, and files the Easter cactus under the same entry.',
    ],
    signs: [ANY_PLANT],
    act: [
      'Wait and watch: a little vomiting can follow chewing any plant. Call your veterinarian if it does not pass.',
    ],
    alternatives: ['phalaenopsis-orchid', 'african-violet', 'haworthia'],
    questions: [
      {
        question: 'Is the Easter cactus safe too?',
        answer:
          'The ASPCA files the Easter cactus as another name on the Christmas cactus entry, non-toxic to dogs, cats and horses.',
      },
      {
        question: 'Which holiday plants are toxic instead?',
        answer:
          'The poinsettia, holly, American mistletoe and amaryllis are all on the ASPCA toxic list.',
      },
    ],
    sources: [],
  },
  {
    id: 'money-trees',
    name: 'money trees',
    verb: 'are',
    entries: ['money-tree'],
    answer: 'non-toxic, though they can upset a stomach',
    short: 'Non-Toxic',
    summary:
      'The money tree (Pachira aquatica) is non-toxic to cats, dogs and horses on the ASPCA list, though its entry names nausea, vomiting and loose stool.',
    parts:
      'No toxic part: the ASPCA gives its toxic principle as none. Its braided trunk and leaves are what a pet chews.',
    why: [
      'The ASPCA lists Pachira aquatica as non-toxic to dogs, cats and horses, with money plant as another name, and gives “None” as its toxic principle.',
    ],
    signs: ['The ASPCA entry still lists nausea, vomiting and loose stool.'],
    act: [
      'Expect the stomach signs at most. Call if they go on past a day or your pet will not eat.',
    ],
    disagree: [
      'The entry says non-toxic and also lists signs. Non-toxic on the ASPCA list means not expected to be life-threatening, not that a pet will feel nothing.',
      '“Money plant” is a name shop labels give other plants too, so check for Pachira aquatica on the label.',
    ],
    alternatives: ['parlor-palm', 'areca-palm', 'pony-tail'],
    questions: [
      {
        question: 'Why does the ASPCA list signs for a non-toxic plant?',
        answer:
          'Because a non-toxic plant can still cause stomach upset; the ASPCA says so of every plant on its list.',
      },
    ],
    sources: [],
  },
  {
    id: 'roses',
    name: 'roses',
    verb: 'are',
    entries: ['rose'],
    answer: 'the ASPCA lists roses as non-toxic',
    short: 'Non-Toxic',
    summary:
      'Roses are non-toxic to cats, dogs and horses on the ASPCA list, and the safe choice for a bouquet in a house with a cat.',
    parts: 'No toxic part on the ASPCA entry, which covers Rosa species.',
    why: [
      'The ASPCA lists Rosa species as non-toxic to dogs, cats and horses, and gives its toxic principle as non-toxic.',
    ],
    signs: [ANY_PLANT],
    act: [
      'Check the rest of the bouquet: a rose is safe, but the lilies, carnations or baby’s breath sold with it are separate entries.',
      'A thorn caught in the mouth or a paw is a separate injury, not poisoning; see your veterinarian if it will not come out.',
    ],
    alternatives: ['sunflower', 'gerber-daisy', 'peruvian-lily'],
    questions: [
      {
        question: 'Is a mixed bouquet with roses safe for a cat?',
        answer:
          'Only if every flower in it is. Roses are on the ASPCA non-toxic list; lilies in the same bouquet can kill a cat.',
      },
    ],
    sources: [],
  },
  {
    id: 'sunflowers',
    name: 'sunflowers',
    verb: 'are',
    entries: ['sunflower'],
    answer: 'the ASPCA lists the sunflower as non-toxic',
    short: 'Non-Toxic',
    summary:
      'The ASPCA lists the sunflower as non-toxic to cats, dogs and horses; its entry is the swamp sunflower, Helianthus angustifolius.',
    parts: 'No toxic part on the ASPCA entry.',
    why: [
      'The ASPCA lists Helianthus angustifolius, the swamp sunflower, as non-toxic to dogs, cats and horses.',
    ],
    signs: [ANY_PLANT],
    act: [
      'A swamp sunflower in a border is on the safe list. A sunflower in a mixed bouquet is only as safe as the flowers around it, so check those by name.',
    ],
    disagree: [
      'The entry names the swamp sunflower, not the common garden sunflower (Helianthus annuus), which the list does not name. Ask the poison line about a sunflower that is not on it.',
    ],
    alternatives: ['gerber-daisy', 'rose', 'hibiscus'],
    questions: [
      {
        question: 'Can dogs eat sunflower seeds?',
        answer:
          'The ASPCA entry is about the plant, not the seeds as food. Ask your veterinarian about seeds as a treat.',
      },
    ],
    sources: [],
  },
  {
    id: 'orchids',
    name: 'orchids',
    verb: 'are',
    entries: ['phalaenopsis-orchid'],
    answer: 'the moth orchid is on the non-toxic list',
    short: 'The Moth Orchid Is Not',
    summary:
      'The ASPCA lists the phalaenopsis, or moth orchid, as non-toxic to cats, dogs and horses: the orchid sold in most supermarkets.',
    parts: 'No toxic part on the ASPCA entry.',
    why: [
      'The ASPCA lists Phalaenopsis sp., the moth or moon orchid, as non-toxic to dogs, cats and horses.',
    ],
    signs: [ANY_PLANT],
    act: [
      'Nothing urgent. Bark potting mix and fertilizer are separate questions from the plant: ask the poison line if your pet ate those.',
    ],
    disagree: [
      'The entry is for Phalaenopsis only. Other orchids are other entries, or none: check the label.',
    ],
    alternatives: ['african-violet', 'christmas-cactus', 'prayer-plant'],
    questions: [
      {
        question: 'Are all orchids safe for cats?',
        answer:
          'The ASPCA entry used here covers the phalaenopsis (moth) orchid. Check another orchid by its scientific name.',
      },
    ],
    sources: [],
  },
  {
    id: 'basil',
    name: 'basil',
    verb: 'is',
    entries: ['basil'],
    answer: 'the ASPCA lists it as non-toxic to cats and dogs',
    short: 'Non-Toxic',
    summary:
      'Basil (Ocimum basilicum) is non-toxic to cats and dogs on the ASPCA list, one of the herbs safe to grow where pets can reach.',
    parts: 'No toxic part on the ASPCA entry.',
    why: [
      'The ASPCA lists sweet basil, Thai basil and Saint Joseph’s wort under Ocimum basilicum, non-toxic to dogs and cats. Its entry does not name horses.',
    ],
    signs: [ANY_PLANT],
    act: [
      'Nothing urgent. Pesto and sauces are a different matter: they often hold garlic, which is toxic to dogs.',
    ],
    alternatives: ['rosemary', 'thyme', 'spider-plant'],
    questions: [
      {
        question: 'Which kitchen herbs are toxic instead?',
        answer:
          'Of the herbs on these pages, the ASPCA lists mint and lavender as toxic to dogs and cats, and catnip as toxic to cats.',
      },
    ],
    sources: [],
  },
  {
    id: 'rosemary',
    name: 'rosemary',
    verb: 'is',
    entries: ['rosemary'],
    answer: 'the ASPCA lists it as non-toxic',
    short: 'Non-Toxic',
    summary:
      'Rosemary is non-toxic to cats, dogs and horses on the ASPCA list, a safe herb for a pot or a border.',
    parts: 'No toxic part on the ASPCA entry.',
    why: [
      'The ASPCA lists Rosmarinus officinalis, also called anthos, as non-toxic to dogs, cats and horses.',
    ],
    signs: [ANY_PLANT],
    act: [
      'A cat that nibbles a potted rosemary on a sill is on the safe side of the list. If the plant was sprayed or fed, ask the poison line about the product, not the herb.',
    ],
    alternatives: ['thyme', 'basil', 'swedish-ivy'],
    questions: [
      {
        question: 'Is rosemary oil the same as the plant?',
        answer:
          'No. The ASPCA entry is for the plant. Ask your veterinarian before using any essential oil around a pet.',
      },
    ],
    sources: [],
  },
  {
    id: 'bamboo',
    name: 'bamboo',
    verb: 'is',
    entries: ['bamboo', 'bamboo-palm', 'heavenly-bamboo'],
    answer: 'true bamboo is not, but heavenly bamboo is',
    short: 'True Bamboo Is Not',
    summary:
      'True bamboo and the bamboo palm are non-toxic to cats and dogs on the ASPCA list; heavenly bamboo, a different shrub, is toxic.',
    parts:
      'No toxic part in golden bamboo (Phyllostachys aurea). In heavenly bamboo (Nandina domestica), the ASPCA names cyanogenic glycosides.',
    why: [
      'The ASPCA lists Phyllostachys aurea, golden or fishpole bamboo, as non-toxic to dogs, cats and horses. The bamboo palm (Chamaedorea elegans) is non-toxic too.',
      'Heavenly bamboo, or nandina, is not a bamboo. The ASPCA lists it as toxic to dogs, cats and horses for its cyanogenic glycosides.',
    ],
    signs: [
      'For true bamboo, none on the entry. For heavenly bamboo, the ASPCA lists weakness, incoordination, seizures, coma, respiratory failure and death, which it calls rare in pets.',
    ],
    act: [
      'Check which plant it is. A pet that chewed nandina berries or leaves and seems weak or unsteady needs a veterinarian now; true bamboo is nothing urgent.',
    ],
    disagree: [
      'Three plants share the name. The “lucky bamboo” sold in water is a dracaena (Dracaena sanderiana), not a bamboo, and the ASPCA lists Dracaena spp. as toxic to dogs and cats.',
    ],
    alternatives: ['bamboo-palm', 'areca-palm', 'parlor-palm'],
    questions: [
      {
        question: 'Is lucky bamboo toxic to cats?',
        answer:
          'Lucky bamboo is a dracaena, and the ASPCA lists Dracaena spp. as toxic to dogs and cats, with dilated pupils in cats among the signs.',
      },
      {
        question: 'Is heavenly bamboo toxic to dogs?',
        answer: 'Yes: the ASPCA lists Nandina domestica as toxic to dogs, cats and horses.',
      },
    ],
    sources: [],
  },
  {
    id: 'calathea',
    name: 'calathea',
    verb: 'is',
    entries: ['calathea', 'prayer-plant'],
    answer: 'calatheas and prayer plants are on the non-toxic list',
    short: 'Non-Toxic',
    summary:
      'Calatheas and the prayer plant are non-toxic to cats, dogs and horses on the ASPCA list: patterned leaves safe for a home with pets.',
    parts: 'No toxic part on either ASPCA entry.',
    why: [
      'The ASPCA lists Calathea spp. as non-toxic to dogs, cats and horses. Its prayer plant entry (Calathea insignis) is non-toxic too, and gives maranta, peacock plant, rattlesnake plant and zebra plant as other names.',
    ],
    signs: [ANY_PLANT],
    act: [
      'A chewed calathea or prayer plant leaf is on the safe side of the list. Move the pot if your cat keeps chewing it and vomits often.',
    ],
    alternatives: ['prayer-plant', 'boston-fern', 'cast-iron-plant'],
    questions: [
      {
        question: 'Is a maranta safe for cats?',
        answer:
          'The ASPCA gives maranta as another name on its prayer plant entry, which it lists as non-toxic.',
      },
    ],
    sources: [],
  },
  {
    id: 'babys-breath',
    name: 'baby’s breath',
    verb: 'is',
    entries: ['babys-breath'],
    answer: 'non-toxic, with mild stomach upset at most',
    short: 'Mild Upset at Most',
    summary:
      'Baby’s breath is non-toxic to cats, dogs and horses on the ASPCA list, which still names mild vomiting and diarrhea if it is eaten.',
    parts: 'The small flowers and stems of a bouquet filler; the ASPCA names no toxic part.',
    why: [
      'The ASPCA lists Gypsophila elegans, also maiden’s breath, as non-toxic to dogs, cats and horses.',
    ],
    signs: [
      'The ASPCA says mild GI upset such as vomiting and diarrhea may be seen if it is eaten.',
    ],
    act: [
      'Check the rest of the bouquet; baby’s breath is often the filler around lilies or carnations, which are separate entries.',
    ],
    alternatives: ['rose', 'gerber-daisy', 'peruvian-lily'],
    questions: [
      {
        question: 'Is baby’s breath toxic to cats?',
        answer:
          'Not on the ASPCA list, which calls it non-toxic but says it may cause mild vomiting and diarrhea.',
      },
    ],
    sources: [],
  },
  {
    id: 'african-violets',
    name: 'African violets',
    verb: 'are',
    entries: ['african-violet'],
    answer: 'the ASPCA lists them as non-toxic',
    short: 'Non-Toxic',
    summary:
      'African violets (Saintpaulia) are non-toxic to cats, dogs and horses on the ASPCA list: a flowering pot plant safe for a windowsill cats walk.',
    parts: 'No toxic part on the ASPCA entry.',
    why: ['The ASPCA lists Saintpaulia spp. as non-toxic to dogs, cats and horses.'],
    signs: [ANY_PLANT],
    act: [
      'A violet knocked off a sill and chewed is on the safe side of the list. If plant food was in the water, ask the poison line about the food.',
    ],
    alternatives: ['phalaenopsis-orchid', 'christmas-cactus', 'gerber-daisy'],
    questions: [
      {
        question: 'Which flowering pot plants are toxic instead?',
        answer:
          'Of the ones on these pages: kalanchoe, cyclamen, begonias, chrysanthemums and amaryllis are all on the ASPCA toxic list.',
      },
    ],
    sources: [],
  },
  {
    id: 'boston-ferns',
    name: 'Boston ferns',
    verb: 'are',
    entries: ['boston-fern'],
    answer: 'the ASPCA lists them as non-toxic to cats and dogs',
    short: 'Non-Toxic',
    summary:
      'Boston ferns are non-toxic to cats and dogs on the ASPCA list, a hanging plant safe to keep within a pet’s reach.',
    parts: 'No toxic part on the ASPCA entry.',
    why: [
      'The ASPCA lists Nephrolepis exalta bostoniensis as non-toxic to dogs and cats. Its entry does not name horses.',
    ],
    signs: [ANY_PLANT],
    act: [
      'A fern hanging within reach of a cat is a plant the ASPCA lists as safe. Leaf litter on the floor is the only clean-up.',
    ],
    alternatives: ['spider-plant', 'parlor-palm', 'calathea'],
    questions: [
      {
        question: 'Are all ferns safe for cats?',
        answer:
          'The ASPCA entry used here is the Boston fern. Check another fern by its own entry.',
      },
    ],
    sources: [],
  },
  {
    id: 'hibiscus',
    name: 'hibiscus',
    verb: 'is',
    entries: ['hibiscus'],
    answer: 'the rose of Sharon is on the non-toxic list',
    short: 'Non-Toxic',
    summary:
      'The ASPCA lists hibiscus (Hibiscus syriacus, the rose of Sharon) as non-toxic to cats, dogs and horses.',
    parts: 'No toxic part on the ASPCA entry.',
    why: [
      'The ASPCA lists Hibiscus syriacus, also rose of Sharon and rose of China, as non-toxic to dogs, cats and horses.',
    ],
    signs: [ANY_PLANT],
    act: [
      'Fallen rose of Sharon flowers on a lawn are on the safe side of the list. Ask the poison line about any spray used on the shrub.',
    ],
    disagree: [
      'The entry names Hibiscus syriacus. Other hibiscus species are not named on it; check the label of a tropical one.',
    ],
    alternatives: ['rose', 'sunflower', 'bamboo'],
    questions: [
      {
        question: 'Is a hibiscus hedge safe for a dog?',
        answer: 'A hedge of Hibiscus syriacus, the rose of Sharon, is on the ASPCA non-toxic list.',
      },
    ],
    sources: [],
  },
];
