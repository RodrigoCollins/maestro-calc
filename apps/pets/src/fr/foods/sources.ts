import type { PageSource } from '../../guides.ts';

/** The day the French-language sources were read (the English ones: `FOODS_CHECKED`). */
export const SOURCES_FR_CHECKED = '2026-11-15';

/**
 * The French-language veterinary and poison-centre sources of the French pages, each read on
 * `SOURCES_FR_CHECKED`. France: the CNITV at VetAgro Sup (Lyon), the national veterinary poison
 * information centre. Belgium: the Centre Antipoisons, which answers about animals within set
 * hours, human calls first. Switzerland: Tox Info Suisse at 145, in French.
 */
export const SOURCES_FR = {
  cnitv: {
    name: 'VetAgro Sup : Centre national d’informations toxicologiques vétérinaires (CNITV), 04 78 87 10 40',
    url: 'https://www.vetagro-sup.fr/recherche-expertise/centre-national-dinformations-toxicologiques-veterinaires-cnitv/',
  },
  antipoisonsAnimals: {
    name: 'Centre Antipoisons (Belgique) : Animaux',
    url: 'https://www.centreantipoisons.be/animaux/',
  },
  antipoisonsChocolate: {
    name: 'Centre Antipoisons (Belgique) : Intoxication du chien au chocolat (pour les vétérinaires)',
    url: 'https://www.centreantipoisons.be/tox-infos/intoxication-du-chien-par-le-chocolat-pour-les-veterinaires/',
  },
  toxinfoAnimals: {
    name: 'Tox Info Suisse : Intoxication chez les animaux (numéro d’urgence 145)',
    url: 'https://www.toxinfo.ch/tiervergiftung_fr',
  },
} as const satisfies Record<string, PageSource>;

/** The sources of the French hub: who to call in France, Belgium and Switzerland. */
export const FR = {
  hub: [SOURCES_FR.cnitv, SOURCES_FR.antipoisonsAnimals, SOURCES_FR.toxinfoAnimals],
} as const;
