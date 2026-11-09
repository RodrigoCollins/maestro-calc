import type { PageSource } from '../guides.ts';

/** Pet Poison Helpline's line, read on its site on `PLANTS_CHECKED`. */
export const HELPLINE = {
  name: 'Pet Poison Helpline',
  phone: '(855) 764-7661',
  href: 'tel:+18557647661',
  source: 'https://www.petpoisonhelpline.com/',
} as const;

const pph = (title: string, slug: string): PageSource => ({
  name: `Pet Poison Helpline, ${title}`,
  url: `https://www.petpoisonhelpline.com/poison/${slug}/`,
});

/** The sources of the plant pages besides the ASPCA entries; each was read on `PLANTS_CHECKED`. */
export const P = {
  aspcaLine: {
    name: 'ASPCA Animal Poison Control Center: (888) 426-4435, a consultation fee may apply',
    url: 'https://www.aspca.org/pet-care/animal-poison-control',
  },
  aspcaList: {
    name: 'ASPCA Animal Poison Control Center, Toxic and Non-Toxic Plant List',
    url: 'https://www.aspca.org/pet-care/aspca-poison-control/toxic-and-non-toxic-plants',
  },
  aspcaCats: {
    name: 'ASPCA Animal Poison Control Center, Toxic and Non-Toxic Plant List: Cats',
    url: 'https://www.aspca.org/pet-care/animal-poison-control/cats-plant-list',
  },
  aspcaDogs: {
    name: 'ASPCA Animal Poison Control Center, Toxic and Non-Toxic Plant List: Dogs',
    url: 'https://www.aspca.org/pet-care/animal-poison-control/dogs-plant-list',
  },
  aspcaProLilies: {
    name: 'ASPCApro (ASPCA Animal Poison Control Center), How to Spot Which Lilies Are Dangerous to Cats and Plan Treatment',
    url: 'https://www.aspcapro.org/node/99981',
  },
  fdaLilies: {
    name: 'U.S. Food and Drug Administration, Lovely Lilies and Curious Cats: A Dangerous Combination (content current as of 16 September 2021)',
    url: 'https://www.fda.gov/animal-veterinary/animal-health-literacy/lovely-lilies-and-curious-cats-dangerous-combination',
  },
  merckCycad: {
    name: 'Merck Veterinary Manual, Hepatotoxins in Small Animals (Sharon A. Center, DVM, DACVIM; July 2026)',
    url: 'https://www.merckvetmanual.com/digestive-system/hepatic-disease-in-small-animals/hepatotoxins-in-small-animals',
  },
  pphList: {
    name: 'Pet Poison Helpline, List of Plants Toxic to Dogs and Cats',
    url: 'https://www.petpoisonhelpline.com/pet-tips/list-of-plants-toxic-to-dogs-and-cats/',
  },
  pphLilies: pph('Lilies', 'lilies'),
  pphEasterLily: pph('Easter Lily', 'easter-lily'),
  pphDayLily: pph('Daylily', 'day-lily'),
  pphCalla: pph('Calla Lily', 'calla-lily'),
  pphPeaceLily: pph('Peace Lily', 'mauna-loa-peace-lily'),
  pphTulip: pph('Tulips and Hyacinths', 'tulip'),
  pphPothos: pph('Devil’s Ivy', 'devils-ivy'),
  pphAloe: pph('Aloe Vera', 'aloe-vera'),
  pphPoinsettia: pph('Poinsettia', 'poinsettia'),
  pphJade: pph('Jade Plant', 'jade-plant'),
  pphRubber: pph('Rubber Tree Plant', 'rubber-tree-plant'),
  pphFicus: pph('Ficus', 'ficus'),
  pphWeepingFig: pph('Weeping Fig', 'weeping-fig'),
  pphHeartleaf: pph('Heartleaf Philodendron', 'heartleaf-philodendron'),
  pphSplitLeaf: pph('Split-Leaf Philodendron', 'split-leaf-philodendron'),
  pphMonstera: pph('Hurricane Plant (Monstera)', 'hurricane-plant'),
  pphOxalates: pph('Oxalates (Insoluble)', 'insoluble-oxalates'),
  pphSago: pph('Sago Palm', 'sago-palm'),
  pphHydrangea: pph('Hydrangea', 'hydrangea'),
  pphAzalea: pph('Azalea', 'azalea'),
  pphOleander: pph('Oleander', 'oleander'),
  pphDaffodil: pph('Daffodils', 'daffodil'),
  pphChrysanthemum: pph('Chrysanthemum', 'chrysanthemum'),
  pphEucalyptus: pph('Eucalyptus', 'eucalyptus'),
  pphHeavenlyBamboo: pph('Heavenly Bamboo', 'heavenly-bamboo'),
  pphRibbon: pph('Ribbon Plant', 'ribbon-plant'),
  pphEnglishIvy: pph('English Ivy', 'english-ivy'),
  pphDieffenbachia: pph('Dieffenbachia', 'dieffenbachia'),
  pphFoxglove: pph('Foxglove', 'foxglove'),
  pphLilyValley: pph('Lily of the Valley', 'lily-of-the-valley'),
  pphMarijuana: pph('Marijuana', 'marijuana'),
  pphTomato: pph('Tomato', 'tomato-plant'),
  pphHolly: pph('Holly', 'holly'),
  pphMistletoe: pph('Mistletoe', 'mistletoe'),
  pphBabysBreath: pph('Baby’s Breath', 'babys-breath'),
  pphGeranium: pph('Geranium', 'geranium'),
  pphCyclamen: pph('Cyclamen', 'cyclamen'),
  pphKalanchoe: pph('Kalanchoe', 'kalanchoe'),
  pphDracaena: pph('Dracaena', 'dracaena'),
  pphCornPlant: pph('Corn Plant', 'corn-plant'),
  pphAmaryllis: pph('Amaryllis', 'amaryllis'),
  pphPeony: pph('Peony', 'peony'),
} satisfies Record<string, PageSource>;
