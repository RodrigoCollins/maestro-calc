import type { GuideQuestion, PageSource } from '../../guides.ts';

/**
 * One plant of the Spanish "¿… es tóxica para perros y gatos?" pages, in neutral Spanish (tú) for a
 * reader in Mexico, Spain or South America. The verdict, the ASPCA entries, the alternatives and
 * the English sources come from the English plant of the same `id` (`src/plants`), so the facts
 * cannot drift apart: this record holds the words only.
 */
export interface PlantEs {
  /** The id of the English plant (`src/plants`). */
  readonly id: string;
  /**
   * The first part of the address, no accents: `nochebuena` gives
   * `/es/nochebuena-es-toxica-para-perros-y-gatos`.
   */
  readonly slug: string;
  /** The plant as the question asks it, with its article, lower case: `la flor de Nochebuena`. */
  readonly subject: string;
  /** The gender and number the question agrees with: `es tóxica`, `son tóxicos`. */
  readonly gender: 'm' | 'f';
  readonly plural: boolean;
  /** The plant as a list names it, capitalized, no article: `Flor de Nochebuena`. */
  readonly name: string;
  /** The other common names, by country where they differ: `flor de Pascua (España), …`. */
  readonly names: string;
  /**
   * The answer word, when the plain verdict word (`Sí`, `No`, `Para gatos, sí`) would mislead:
   * `Poco` for a plant the ASPCA lists as toxic whose sources call it a mild irritant.
   */
  readonly word?: 'Poco';
  /** The answer after the verdict word, a clause: `irrita la boca y el estómago`. */
  readonly answer: string;
  /** A shorter answer for the title, where the whole one does not fit in 65 characters. */
  readonly short?: string;
  /** One or two sentences for the hubs and the description. */
  readonly summary: string;
  /** Which parts the sources name, most toxic first. */
  readonly parts: string;
  /** The grade of severity of the English plant, in Spanish, as one sentence. */
  readonly grade?: string;
  readonly why: readonly string[];
  readonly signs: readonly string[];
  readonly act: readonly string[];
  readonly disagree?: readonly string[];
  readonly questions: readonly GuideQuestion[];
  /** The Spanish-language sources cited beside the English plant's own (`SOURCES_ES`). */
  readonly sources: readonly PageSource[];
}
