import { embedPathOf, embedSnippetOf } from '@maestro-calc/site-kit/embed';
import { CHLORINE, PUMP, SALT } from './doses.ts';
import { HOME_TOOLS } from './home.ts';
import { CONTACT_EMAIL } from './privacy.ts';
import { SITE } from './site.config.ts';
import { VOLUME_TEXTS } from './volume/texts.ts';

/*
 * The embeds of Pool Figures (plans/growth/PLAN.md › lever 2), as Maestro Calc's `/embed`: every
 * calculator at `/embed` + its path, a page other sites may frame. They are not pages of the
 * sitemap, which lists the top-level page files only.
 */

/** Each calculator's name (its page heading) and the height of its frame, by page path. */
const CALCULATORS: Readonly<Record<string, { readonly name: string; readonly height: number }>> = {
  [VOLUME_TEXTS.path]: { name: VOLUME_TEXTS.h1, height: 1300 },
  [SALT.path]: { name: SALT.h1, height: 1100 },
  [CHLORINE.path]: { name: CHLORINE.h1, height: 1200 },
  [PUMP.path]: { name: PUMP.h1, height: 1000 },
};

export interface Embed {
  /** Where the embed is served. */
  readonly path: string;
  /** The full page it embeds: its canonical. */
  readonly page: string;
  readonly name: string;
  readonly height: number;
}

/** The calculators of the home, in its order, each embedded. */
export const EMBEDS: readonly Embed[] = HOME_TOOLS.map(({ href }) => {
  const calculator = CALCULATORS[href];
  if (calculator === undefined) throw new Error(`no embed for the calculator ${href}`);
  return { path: embedPathOf(href), page: href, ...calculator };
});

/** Every calculator's snippet: the frame, then the visible link to the full page outside it. */
export const snippets: readonly { readonly name: string; readonly code: string }[] = EMBEDS.map(
  ({ page, name, height }) => ({
    name,
    code: embedSnippetOf({
      origin: SITE.origin,
      page,
      name,
      credit: `${name} by ${SITE.name}`,
      height,
    }),
  }),
);

/** The page that offers every calculator to other sites. */
export const EMBED_PAGE = {
  path: '/embed-calculators',
  title: 'Embed Our Pool Calculators on Your Site | Pool Figures',
  description:
    'Put the Pool Figures volume, salt, chlorine and pump size calculators on your own website for free: copy the code and paste it.',
  h1: 'Embed our calculators',
  lead: 'You can put any Pool Figures calculator on your own website for free. It works the same as on our site: the same formulas, the same figures and the link your visitors can share.',
  howHeading: 'How to embed a calculator',
  steps: [
    'Find the calculator below and select its whole code.',
    'Paste the code into your page where you want the calculator to show. Most site builders call this an HTML or embed block.',
    'Keep the link under the calculator. It tells your visitors where the figures come from, and it is the only thing we ask in return.',
  ],
  notes: [
    'The calculator opens at the width of your page. If it looks too short or too tall, change the number after height in the code.',
    'The embedded calculator does not track your visitors and loads no ads. Its figures come from the same formulas and sources as our own pages, described in our methodology.',
    `Questions, or a calculator you need? Write to us at ${CONTACT_EMAIL}.`,
  ],
  calculatorsHeading: 'The calculators',
} as const;
