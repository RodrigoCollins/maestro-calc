import { P } from './sources.ts';
import type { Plant } from './types.ts';

/** The toxic houseplants: every verdict is read from the ASPCA entries each one names. */
export const HOUSEPLANTS: readonly Plant[] = [
  {
    id: 'pothos',
    name: 'pothos',
    verb: 'is',
    entries: ['golden-pothos', 'devils-ivy', 'satin-pothos'],
    answer: 'its oxalate crystals burn the mouth',
    short: 'Crystals Burn the Mouth',
    summary:
      'Pothos, also sold as devil’s ivy, is on the ASPCA toxic list for cats and dogs: chewing a leaf releases crystals that burn the mouth.',
    parts:
      'The leaves and stems, the parts a cat or dog chews on a trailing vine. The ASPCA entries name no part as safer than another.',
    why: [
      'The ASPCA gives insoluble calcium oxalates as the toxic principle of golden pothos, devil’s ivy and satin pothos alike. Pet Poison Helpline explains that these are microscopic crystals inside the plant, released when a pet chews it, which irritate and hurt the lips, mouth and throat.',
      'The plant sold as satin or silk pothos (Scindapsus pictus) is a different genus from golden pothos (Epipremnum aureum), but its ASPCA entry gives the same crystals and the same signs.',
    ],
    signs: [
      'The ASPCA lists oral irritation, intense burning and irritation of the mouth, tongue and lips, excessive drooling, vomiting and difficulty swallowing. They come with the first bite, because the crystals act where they touch.',
      'Pet Poison Helpline says drooling, gagging and vomiting are common, and that in rare instances the throat swells enough to make breathing hard.',
    ],
    act: [
      'Take the leaves away and look in the mouth for pieces of leaf. A pet pawing at its face and drooling after chewing pothos is showing the burning the ASPCA describes.',
      'Call if your pet keeps drooling, cannot swallow, or breathes noisily: the rare throat swelling Pet Poison Helpline warns of is the reason not to wait it out.',
    ],
    alternatives: ['swedish-ivy', 'american-rubber-plant', 'spider-plant'],
    questions: [
      {
        question: 'Is devil’s ivy the same plant as pothos?',
        answer:
          'Yes. The ASPCA files golden pothos and devil’s ivy under the same scientific name, Epipremnum aureum, and lists both as toxic to dogs and cats; the devil’s ivy entry adds horses.',
      },
      {
        question: 'Is there a trailing plant that is safe instead?',
        answer:
          'Swedish ivy (Plectranthus australis), sold as creeping Charlie, is on the ASPCA list as non-toxic to dogs, cats and horses, and trails like pothos does.',
      },
    ],
    sources: [P.pphOxalates],
  },
  {
    id: 'snake-plants',
    name: 'snake plants',
    verb: 'are',
    entries: ['snake-plant'],
    answer: 'mildly, with nausea, vomiting and diarrhea',
    short: 'Mildly',
    summary:
      'The ASPCA lists the snake plant, or mother-in-law’s tongue, as toxic to cats and dogs, with stomach upset as the signs it names.',
    parts:
      'The long leaves, the only part a pet can reach. The ASPCA entry does not say one part is worse than another.',
    why: [
      'The toxic principle the ASPCA gives for Sansevieria trifasciata is saponins, soap-like compounds that irritate the stomach and gut. The entry names no crystals and no damage to the heart, kidneys or liver.',
      'The ASPCA files it with the other names golden bird’s nest, mother-in-law’s tongue and good luck plant, so a pot with any of those labels is the same plant.',
    ],
    signs: [
      'The ASPCA names three signs only: nausea, vomiting and diarrhea. Nausea in a pet shows as drooling, lip licking and refusing food.',
    ],
    act: [
      'Move the pot out of reach and note how much leaf is missing. With signs of stomach upset only on the ASPCA entry, the question for the poison line is how much your pet ate and how small it is.',
      'Call your veterinarian if the vomiting or diarrhea goes on, or there is blood in it.',
    ],
    alternatives: ['cast-iron-plant', 'pony-tail', 'haworthia'],
    questions: [
      {
        question: 'Is mother-in-law’s tongue the same as a snake plant?',
        answer:
          'Yes. The ASPCA gives mother-in-law’s tongue, golden bird’s nest and good luck plant as other names of the snake plant, Sansevieria trifasciata.',
      },
      {
        question: 'Which upright plant is safe instead?',
        answer:
          'The cast iron plant (Aspidistra elatior) and the ponytail palm (Beaucarnea recurvata) are both on the ASPCA list as non-toxic to dogs, cats and horses, and both take low light as a snake plant does.',
      },
    ],
    sources: [],
  },
  {
    id: 'monstera',
    name: 'monstera',
    verb: 'is',
    entries: ['swiss-cheese-plant', 'split-leaf-philodendron'],
    answer: 'the ASPCA lists it as toxic to cats and dogs',
    short: 'Leaves Burn the Mouth',
    summary:
      'Monstera deliciosa, the Swiss cheese plant, is toxic to cats and dogs on the ASPCA list: its leaves hold oxalate crystals that burn the mouth.',
    parts:
      'The big split leaves and the stems. The ASPCA entry does not separate the parts; the fruit that gives Monstera deliciosa its name is not on it.',
    why: [
      'The ASPCA files Monstera deliciosa as the Swiss cheese plant, with the other names cutleaf philodendron, hurricane plant, ceriman and Mexican breadfruit, and gives insoluble calcium oxalates as its toxic principle.',
      'Monstera is often sold as a “split-leaf philodendron”. The ASPCA has a separate split leaf philodendron entry (Philodendron bipennifolium) with the same verdict and the same crystals, so either label means the same caution.',
    ],
    signs: [
      'The ASPCA lists oral irritation, intense burning and irritation of the mouth, tongue and lips, excessive drooling, vomiting and difficulty swallowing.',
    ],
    act: [
      'Wipe any sap and pieces of leaf from the mouth and face, and give your pet water to drink if it wants it.',
      'Call your veterinarian or a poison line if the drooling does not settle, your pet will not eat, or its breathing sounds harsh.',
    ],
    alternatives: ['areca-palm', 'calathea', 'parlor-palm'],
    questions: [
      {
        question: 'Is Monstera adansonii toxic too?',
        answer:
          'The ASPCA entries name Monstera deliciosa only. Ask the poison line about a Monstera adansonii, and keep it out of reach until you know.',
      },
      {
        question: 'Which big-leaved plant is safe instead?',
        answer:
          'The areca palm (Dypsis lutescens) and the calathea are both on the ASPCA list as non-toxic to dogs, cats and horses.',
      },
    ],
    sources: [P.pphOxalates],
  },
  {
    id: 'aloe-vera',
    name: 'aloe vera',
    verb: 'is',
    entries: ['aloe'],
    answer: 'the plant is toxic, though the ASPCA calls the gel edible',
    short: 'The Plant, Not the Gel',
    summary:
      'The ASPCA lists aloe vera as toxic to cats and dogs for its saponins and anthraquinones, and adds that the gel is considered edible.',
    parts:
      'The green skin and the yellow juice under it, which carry the purgatives. The clear gel inside the leaf is the part the ASPCA says is considered edible.',
    why: [
      'The ASPCA gives saponins and anthraquinones as the toxic principles of aloe. Pet Poison Helpline names the anthraquinone glycosides as purgatives: they make the bowel move and cause the vomiting and diarrhea.',
      'That is why a gel sold for burns, made from the inner leaf, is not the same question as a pet chewing the whole leaf off the plant.',
    ],
    signs: [
      'The ASPCA lists vomiting, lethargy and diarrhea (in dogs and cats; it notes horses do not vomit). Pet Poison Helpline describes stomach and gut upset with vomiting and diarrhea.',
    ],
    act: [
      'Look for chewed leaf tips and yellow juice on the face or paws. Note how much of the leaf is gone.',
      'Call if your pet is lethargic, vomits more than once, or has diarrhea: a small pet loses water fast.',
    ],
    disagree: [
      'The ASPCA lists the plant as toxic and, on the same entry, says the gel is considered edible. Pet Poison Helpline names the purgatives without separating gel and leaf, so the safe reading is: keep the plant away, and ask before giving anything with aloe in it.',
    ],
    alternatives: ['haworthia', 'christmas-cactus', 'pony-tail'],
    questions: [
      {
        question: 'Is aloe vera gel safe for my dog’s skin?',
        answer:
          'The ASPCA says the gel is considered edible; the toxic principles are in the plant. Ask your veterinarian before putting any product on a pet’s skin, since a pet will lick it off.',
      },
      {
        question: 'Which succulent is safe instead?',
        answer:
          'Haworthia, which looks much like a small aloe, is on the ASPCA list as non-toxic to dogs and cats.',
      },
    ],
    sources: [P.pphAloe],
  },
  {
    id: 'peace-lilies',
    name: 'peace lilies',
    verb: 'are',
    entries: ['peace-lily'],
    answer: 'they burn the mouth, but they are not true lilies',
    short: 'Not a True Lily',
    summary:
      'Peace lilies are toxic to cats and dogs on the ASPCA list for their oxalate crystals, but they are not the true lilies that cause kidney failure in cats.',
    parts:
      'The leaves, stems and the white flower spathe all hold the crystals. The flower’s pollen is not the danger it is with a true lily.',
    why: [
      'The ASPCA gives insoluble calcium oxalates as the toxic principle of Spathiphyllum, which it lists as toxic to dogs and cats. Pet Poison Helpline names the peace lily among the plants whose crystals irritate the lips, mouth and throat when chewed.',
      'The FDA and ASPCApro both separate the peace lily from true lilies: it irritates the mouth and does not cause the kidney damage of Lilium and Hemerocallis.',
    ],
    signs: [
      'The ASPCA lists oral irritation, intense burning and irritation of the mouth, tongue and lips, excessive drooling, vomiting and difficulty swallowing, which start with the first chew.',
    ],
    act: [
      'Make sure of the plant: a peace lily has broad dark leaves and a white hood around a spike. If it could be an Easter, tiger, Asiatic or daylily, treat it as an emergency for a cat and call at once.',
      'For a peace lily, rinse the mouth area, offer water, and call if drooling, gagging or trouble swallowing goes on.',
    ],
    disagree: [
      'The name misleads both ways. Owners panic over a peace lily, which the sources call irritating, and miss a bouquet of Asiatic lilies, which can kill a cat.',
    ],
    alternatives: ['phalaenopsis-orchid', 'cast-iron-plant', 'boston-fern'],
    questions: [
      {
        question: 'Can a peace lily cause kidney failure in cats?',
        answer:
          'The FDA and ASPCApro say no: the kidney failure comes from true lilies (Lilium) and daylilies (Hemerocallis). The peace lily irritates the mouth.',
      },
      {
        question: 'Is the Mauna Loa peace lily the same plant?',
        answer:
          'Yes. The ASPCA gives Mauna Loa peace lily as another name of its peace lily entry.',
      },
    ],
    sources: [P.fdaLilies, P.aspcaProLilies, P.pphOxalates],
  },
  {
    id: 'jade-plants',
    name: 'jade plants',
    verb: 'are',
    entries: ['jade-plant'],
    answer: 'the ASPCA names vomiting and incoordination',
    short: 'It Causes Vomiting',
    summary:
      'The ASPCA lists the jade plant as toxic to cats, dogs and horses; its toxic principle is unknown, and it names vomiting, depression and incoordination.',
    parts:
      'The thick leaves and stems. The ASPCA does not know which compound is to blame, so it names no safer part.',
    why: [
      'For Crassula argentea, the ASPCA gives the toxic principle as unknown. The verdict comes from what the poison center sees in pets that ate it, not from a known poison.',
      'The ASPCA files it with the other names baby jade, dwarf rubber plant, jade tree, Chinese rubber plant and Japanese rubber plant, which are easy to confuse with the safe American rubber plant (Peperomia obtusifolia).',
    ],
    signs: [
      'The ASPCA lists vomiting, depression and incoordination. Incoordination shows as a wobbly walk; depression as a pet that is quiet and will not play.',
    ],
    act: [
      'A wobbly walk after chewing a succulent is a reason to call now, not to wait for it to pass.',
      'Bring the pot or a photo, since several succulents share the rubber plant names.',
    ],
    alternatives: ['american-rubber-plant', 'haworthia', 'christmas-cactus'],
    questions: [
      {
        question: 'Is a baby rubber plant the same as a jade plant?',
        answer:
          'No. The ASPCA files baby rubber plant as another name of the American rubber plant (Peperomia obtusifolia), which it lists as non-toxic; it files baby jade under the jade plant, which is toxic.',
      },
    ],
    sources: [],
  },
  {
    id: 'philodendrons',
    name: 'philodendrons',
    verb: 'are',
    entries: ['heartleaf-philodendron', 'split-leaf-philodendron'],
    answer: 'their crystals irritate the mouth',
    short: 'Mouth Irritants',
    summary:
      'Heartleaf and split leaf philodendrons are toxic to cats and dogs on the ASPCA list, for the oxalate crystals in their leaves.',
    parts:
      'The heart-shaped or split leaves and the vines. A trailing heartleaf in a hanging pot is the one cats reach.',
    why: [
      'The ASPCA gives insoluble calcium oxalates for both Philodendron hederaceum (heartleaf, also cordatum or sweetheart plant) and Philodendron bipennifolium (split leaf, also horsehead philodendron and fiddle-leaf). The heartleaf entry adds horses.',
      'Pet Poison Helpline names the philodendron among the plants whose crystals hurt the lips, mouth and throat when a pet chews them.',
    ],
    signs: [
      'The heartleaf entry lists oral irritation, pain and swelling of the mouth, tongue and lips, excessive drooling, vomiting (not horses) and difficulty swallowing; the split leaf entry lists the same with intense burning.',
    ],
    act: [
      'Remove the vine, check the mouth and offer water. Swelling of the lips and tongue is expected; trouble breathing is not, and needs your veterinarian now.',
    ],
    alternatives: ['swedish-ivy', 'boston-fern', 'prayer-plant'],
    questions: [
      {
        question: 'Is the fiddle-leaf philodendron the same as the fiddle-leaf fig?',
        answer:
          'No. The ASPCA gives fiddle-leaf as another name of the split leaf philodendron. The fiddle-leaf fig (Ficus lyrata) is a different plant, which the ASPCA list does not name.',
      },
    ],
    sources: [P.pphOxalates],
  },
  {
    id: 'dieffenbachia',
    name: 'dieffenbachia',
    verb: 'is',
    entries: ['dieffenbachia'],
    answer: 'the dumb cane burns the mouth and tongue',
    short: 'It Burns the Mouth',
    summary:
      'Dieffenbachia, the dumb cane, is toxic to cats and dogs on the ASPCA list, for its oxalate crystals and a protein-digesting enzyme.',
    parts:
      'The thick stem (the cane) and the leaves. The ASPCA entry does not say one is worse than the other.',
    why: [
      'The ASPCA gives two toxic principles: insoluble calcium oxalates and a proteolytic enzyme, one that breaks down protein. It is the one plant of the oxalate group whose entry adds the enzyme.',
      'Pet Poison Helpline lists dieffenbachia and dumbcane among the plants whose crystals are released by chewing.',
    ],
    signs: [
      'The ASPCA lists oral irritation, intense burning and irritation of the mouth, tongue and lips, excessive drooling, vomiting and difficulty swallowing.',
    ],
    act: [
      'Take away the cane, rinse the mouth area and watch the tongue and throat. Call your veterinarian if the swelling grows or your pet struggles to swallow or breathe.',
    ],
    alternatives: ['bamboo-palm', 'cast-iron-plant', 'calathea'],
    questions: [
      {
        question: 'Is dumb cane the same plant as dieffenbachia?',
        answer:
          'Yes. The ASPCA lists dumbcane, giant dumb cane, spotted dumb cane, tropic snow and exotica among the other names of its dieffenbachia entry.',
      },
    ],
    sources: [P.pphOxalates],
  },
  {
    id: 'dracaena',
    name: 'dracaena',
    verb: 'is',
    entries: ['dracaena', 'corn-plant', 'ribbon-plant'],
    answer: 'its saponins cause vomiting, and dilated pupils in cats',
    short: 'Vomiting, Dilated Pupils',
    summary:
      'Dracaena, the corn plant and dragon tree, is toxic to cats and dogs on the ASPCA list: its saponins cause vomiting, and dilated pupils in cats.',
    parts: 'The strap-shaped leaves. The ASPCA does not name a worse part.',
    why: [
      'The ASPCA gives saponins as the toxic principle of Dracaena spp., the corn plant (Dracaena fragrans) and the ribbon plant. The corn plant entry also lists horses.',
    ],
    signs: [
      'The ASPCA lists vomiting (occasionally with blood), depression, anorexia, hypersalivation, and dilated pupils in cats. Anorexia here means not eating; hypersalivation means drooling.',
      'The dilated pupils are named for cats only, so a cat with wide pupils after chewing a dracaena leaf fits the entry.',
    ],
    act: [
      'Call if the vomit has blood in it, or your cat’s pupils stay wide. Note the plant name on the pot: dracaenas are sold under many names.',
    ],
    disagree: [
      'The ASPCA gives “ribbon plant” as another name of both a dracaena (toxic) and the spider plant (non-toxic), so a plant label of ribbon plant alone does not settle it.',
    ],
    alternatives: ['spider-plant', 'pony-tail', 'parlor-palm'],
    questions: [
      {
        question: 'Is a corn plant the same as a dracaena?',
        answer:
          'Yes: the corn plant is Dracaena fragrans, and the ASPCA lists it as toxic to dogs, cats and horses.',
      },
    ],
    sources: [],
  },
  {
    id: 'english-ivy',
    name: 'English ivy',
    verb: 'is',
    entries: ['english-ivy'],
    answer: 'the leaves are more toxic than the berries',
    short: 'Leaves Are Worst',
    summary:
      'English ivy is toxic to cats, dogs and horses on the ASPCA list; its entry says the foliage is more toxic than the berries.',
    parts:
      'The leaves first: the ASPCA entry says the foliage is more toxic than the berries. Both are on the plant indoors and on walls outside.',
    why: [
      'The ASPCA gives triterpenoid saponins (hederagenin) as the toxic principle of Hedera helix. Saponins irritate the gut, which is what the signs on the entry are.',
      'The ASPCA files branching, glacier, needlepoint, sweetheart and California ivy under the same entry: they are varieties of the same plant.',
    ],
    signs: ['The ASPCA lists vomiting, abdominal pain, hypersalivation and diarrhea.'],
    act: [
      'Clear the leaves away, indoors or along a fence, and note how much was eaten. Call if the vomiting or pain goes on.',
    ],
    alternatives: ['swedish-ivy', 'boston-fern', 'spider-plant'],
    questions: [
      {
        question: 'Is Swedish ivy toxic like English ivy?',
        answer:
          'No. Swedish ivy (Plectranthus australis) is not an ivy at all; the ASPCA lists it as non-toxic to dogs, cats and horses.',
      },
    ],
    sources: [],
  },
  {
    id: 'kalanchoe',
    name: 'kalanchoe',
    verb: 'is',
    entries: ['kalanchoe'],
    answer: 'mostly stomach upset, rarely the heart',
    short: 'Mostly Stomach Upset',
    summary:
      'Kalanchoe, the florist’s succulent, is toxic to cats and dogs on the ASPCA list: it carries heart toxins, though stomach upset is the usual sign.',
    parts:
      'The whole plant. Pet Poison Helpline does not name a worse part; the danger rises with the amount eaten.',
    grade: { by: 'Pet Poison Helpline', level: 'mild to moderate' },
    why: [
      'The ASPCA gives bufodienolides as the toxic principle; Pet Poison Helpline calls them cardiac toxins (bufadienolides), the same family of compound that acts on the heart.',
      'Pet Poison Helpline says eating it most often causes stomach irritation or upset, and that larger amounts can affect the heart.',
    ],
    signs: [
      'The ASPCA lists vomiting, diarrhea and abnormal heart rhythm (rare). Pet Poison Helpline adds weakness and collapse after a large amount.',
    ],
    act: [
      'Estimate how much is gone: a nibbled leaf and a stripped plant are different calls. Weakness or collapse means go to a veterinarian now.',
    ],
    alternatives: ['christmas-cactus', 'african-violet', 'haworthia'],
    questions: [
      {
        question: 'Is mother of millions a kalanchoe?',
        answer:
          'Yes: the ASPCA gives mother of millions, mother-in-law plant, devil’s backbone and chandelier plant as other names on its kalanchoe entry.',
      },
    ],
    sources: [P.pphKalanchoe],
  },
  {
    id: 'begonias',
    name: 'begonias',
    verb: 'are',
    entries: ['begonia'],
    answer: 'the part under the soil is the most toxic',
    short: 'The Roots Are Worst',
    summary:
      'Begonias are toxic to cats, dogs and horses on the ASPCA list; the most toxic part is underground, which matters for a dog that digs.',
    parts:
      'The tubers and roots: the ASPCA entry says the most toxic part is underground. The leaves and flowers are less of a concern.',
    why: [
      'The ASPCA gives soluble calcium oxalates as the toxic principle, where the pothos and philodendron entries give insoluble ones. The begonia entry names kidney failure, in grazing animals, which the insoluble-oxalate entries do not.',
      'The entry covers over 1,000 species and 10,000 hybrids of Begonia.',
    ],
    signs: [
      'In dogs and cats, the ASPCA names vomiting and salivation; kidney failure is named for grazing animals, which eat far more.',
    ],
    act: [
      'Check whether the tuber was dug up or chewed: that is the part the ASPCA calls most toxic. Call with what part and how much.',
    ],
    alternatives: ['african-violet', 'gerber-daisy', 'prayer-plant'],
    questions: [
      {
        question: 'Can begonias cause kidney failure in a dog?',
        answer:
          'The ASPCA names kidney failure in grazing animals, and vomiting and salivation in dogs and cats.',
      },
    ],
    sources: [],
  },
  {
    id: 'cyclamen',
    name: 'cyclamen',
    verb: 'is',
    entries: ['cyclamen'],
    answer: 'the tubers can affect the heart',
    short: 'The Tubers Are Worst',
    summary:
      'Cyclamen is toxic to cats, dogs and horses on the ASPCA list; a large amount of the tuber can cause heart rhythm problems and seizures.',
    parts:
      'The tuber, the round root at the base: the ASPCA names its severe signs after large ingestions of tubers. Leaves and flowers cause the milder ones.',
    why: [
      'The ASPCA gives terpenoid saponins as the toxic principle of Cyclamen spp., also called sowbread.',
    ],
    signs: [
      'The ASPCA lists salivation, vomiting and diarrhea; following large ingestions of tubers, heart rhythm abnormalities, seizures and death.',
    ],
    act: [
      'If the pot is tipped and the tuber chewed, call now. For a nibbled flower, call and describe it: the line will say whether to watch at home.',
    ],
    alternatives: ['african-violet', 'phalaenopsis-orchid', 'christmas-cactus'],
    questions: [
      {
        question: 'Is a cyclamen a safe winter pot plant for a cat?',
        answer:
          'No. The ASPCA lists it as toxic to cats; a Christmas cactus or an African violet are on its non-toxic list instead.',
      },
    ],
    sources: [],
  },
];
