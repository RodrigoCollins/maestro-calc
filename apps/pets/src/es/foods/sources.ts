import type { PageSource } from '../../guides.ts';

/** The day the Spanish-language sources were read (the English ones: `FOODS_CHECKED`). */
export const SOURCES_ES_CHECKED = '2026-11-15';

/** The Spanish edition of the MSD Veterinary Manual (the Merck Veterinary Manual outside the US). */
const MSD_ES = 'https://www.msdvetmanual.com/es/toxicolog%C3%ADa/peligros-alimentarios';

/**
 * The Spanish-language veterinary and poison-centre sources of the Spanish pages, each read on
 * `SOURCES_ES_CHECKED`. The Manual de veterinaria de MSD is the Spanish edition of the Merck
 * Veterinary Manual the English pages cite, its food pages written by Cristine Hayes, DVM, of the
 * ASPCA Animal Poison Control Center; its figures match the English edition. CITUC, the poison
 * centre of the Pontificia Universidad Católica de Chile, answers 24 hours a day and names
 * veterinary clinics among its callers. No national poison line of Mexico, Spain or Argentina was
 * confirmed to take calls about animals, so no page names one.
 */
export const SOURCES_ES = {
  msdChocolate: {
    name: 'Manual de veterinaria de MSD: Toxicosis por chocolate en animales',
    url: `${MSD_ES}/toxicosis-por-chocolate-en-animales`,
  },
  msdGrapes: {
    name: 'Manual de veterinaria de MSD: Toxicosis por pasas, uvas y tamarindo en perros',
    url: `${MSD_ES}/toxicosis-por-pasas-uvas-y-tamarindo-vitis-spp-tamarindus-spp-en-perros`,
  },
  msdAllium: {
    name: 'Manual de veterinaria de MSD: Toxicosis por ajo y cebolla (Allium spp.) en animales',
    url: `${MSD_ES}/toxicosis-por-ajo-y-cebolla-allium-spp-en-animales`,
  },
  msdXylitol: {
    name: 'Manual de veterinaria de MSD: Toxicosis por xilitol en perros',
    url: `${MSD_ES}/toxicosis-por-xilitol-en-perros`,
  },
  msdMacadamia: {
    name: 'Manual de veterinaria de MSD: Toxicosis por nueces de macadamia en perros',
    url: `${MSD_ES}/toxicosis-por-nueces-de-macadamia-en-perros`,
  },
  msdAvocado: {
    name: 'Manual de veterinaria de MSD: Toxicosis por aguacate (Persea spp.) en animales',
    url: `${MSD_ES}/toxicosis-por-aguacate-persea-spp-en-animales`,
  },
  cituc: {
    name: 'CITUC, Centro de Información Toxicológica de la Pontificia Universidad Católica de Chile: Quiénes somos',
    url: 'https://cituc.uc.cl/a-cerca-del-cituc/quienes-somos/',
  },
} as const satisfies Record<string, PageSource>;

/** The sources of the Spanish hub: the MSD pages on the toxic foods. */
export const ES = {
  hub: [
    SOURCES_ES.msdChocolate,
    SOURCES_ES.msdGrapes,
    SOURCES_ES.msdAllium,
    SOURCES_ES.msdXylitol,
    SOURCES_ES.msdMacadamia,
  ],
} as const;
