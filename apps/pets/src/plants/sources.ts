import type { PageSource } from '../guides.ts';

/** Pet Poison Helpline's line, read on its site on `PLANTS_CHECKED`: 24/7, a fee per incident. */
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
  helpline: {
    name: 'Pet Poison Helpline: (855) 764-7661, available 24/7, a fee per incident applies',
    url: 'https://www.petpoisonhelpline.com/',
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
  pphLilies: pph('Lilies', 'lilies'),
  pphTulip: pph('Tulips and Hyacinths', 'tulip'),
  pphAloe: pph('Aloe Vera', 'aloe-vera'),
  pphPoinsettia: pph('Poinsettia', 'poinsettia'),
  pphOxalates: pph('Oxalates (Insoluble)', 'insoluble-oxalates'),
  pphSago: pph('Sago Palm', 'sago-palm'),
  pphAzalea: pph('Azalea', 'azalea'),
  pphOleander: pph('Oleander', 'oleander'),
  pphDaffodil: pph('Daffodils', 'daffodil'),
  pphFoxglove: pph('Foxglove', 'foxglove'),
  pphLilyValley: pph('Lily of the Valley', 'lily-of-the-valley'),
  pphKalanchoe: pph('Kalanchoe', 'kalanchoe'),
} satisfies Record<string, PageSource>;
