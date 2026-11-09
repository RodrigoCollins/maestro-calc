import type { GuideQuestion, PageSource } from '../guides.ts';

/** A grade of severity a source gives a plant, copied as the source words it. */
export interface Grade {
  readonly level: string;
  readonly by: string;
}

/**
 * One plant of the "toxic to cats and dogs" pages. The verdict is never written here: it is read
 * from the ASPCA entries the plant names (`entries`, the first is the plant itself).
 */
export interface Plant {
  /** The slug inside the address: `/are-<id>-toxic-to-cats-and-dogs`. */
  readonly id: string;
  /** Lower case, as a sentence names it: `tulips`, `pothos`. */
  readonly name: string;
  /** How the question asks about it: `are tulips`, `is pothos`. */
  readonly verb: 'is' | 'are';
  /** The ASPCA entries the page cites, the plant itself first, then its kin and look-alikes. */
  readonly entries: readonly string[];
  /** The answer after the verdict word: `the bulbs are the most toxic part`. Short: it is the title. */
  readonly answer: string;
  /** One or two sentences for the hubs and the description. */
  readonly summary: string;
  /** Which parts the sources name, most toxic first. */
  readonly parts: string;
  /** A grade of severity where a source gives one. */
  readonly grade?: Grade;
  /** What the poison is and how it acts, attributed to its sources. */
  readonly why: readonly string[];
  /** The signs and when they start, where a source says. */
  readonly signs: readonly string[];
  /** What to do if a pet ate some (toxic), or what to expect (non-toxic). */
  readonly act: readonly string[];
  /** Where the sources disagree, or what the name mixes up. */
  readonly disagree?: readonly string[];
  /** ASPCA entries listed as non-toxic to cats and dogs, offered instead. */
  readonly alternatives: readonly string[];
  readonly questions: readonly GuideQuestion[];
  /** Sources besides the ASPCA entries. */
  readonly sources: readonly PageSource[];
}
