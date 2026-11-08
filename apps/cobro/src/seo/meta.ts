import { SITE } from '../site.config.ts';

/** The longest title a search result shows whole, in characters (`scripts/check-site.ts`). */
export const TITLE_MAX = 70;

/** A description long enough to answer and short enough that a result does not cut it. */
export const DESCRIPTION = { min: 70, max: 160 } as const;

/** The title of a page: its name and the site's, or the name alone when both would not fit. */
export const titleOf = (name: string): string => {
  const full = `${name} | ${SITE.name}`;
  return full.length <= TITLE_MAX ? full : name;
};

/** The sentences of a text: a stop followed by a space ends one, so `$16.50` stays whole. */
const sentencesOf = (text: string): readonly string[] => text.split(/(?<=[.!?])\s+/);

/** The longest run of `parts` from the first, joined by `glue`, that `fits`; at least one. */
const prefixOf = (
  parts: readonly string[],
  glue: string,
  fits: (text: string) => boolean,
): string => {
  let taken = parts[0] ?? '';
  for (const part of parts.slice(1)) {
    const next = `${taken}${glue}${part}`;
    if (!fits(next)) break;
    taken = next;
  }
  return taken;
};

/**
 * The meta description of a page that answers one question: the whole sentences of its answer
 * that fit, then as many of its figures (`label: value`) as still fit, ended by a stop. The first
 * sentence always stays, so a too long one reaches the site check instead of being cut.
 */
export const descriptionOf = (answer: string, figures: readonly string[] = []): string => {
  const fits = (text: string): boolean => text.length <= DESCRIPTION.max;
  const lead = prefixOf(sentencesOf(answer), ' ', fits);
  const [first, ...rest] = figures;
  if (first === undefined || !fits(`${lead} ${first}.`)) return lead;
  return `${lead} ${prefixOf([first, ...rest], '; ', (text) => fits(`${lead} ${text}.`))}.`;
};
