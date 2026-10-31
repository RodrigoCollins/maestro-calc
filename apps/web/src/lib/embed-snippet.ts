import type { Locale } from '@maestro-calc/i18n';
import { EMBEDS, type Embed } from '../routing/embed.ts';
import { urlOf } from '../routing/routes.ts';
import { SITE } from '../site.config.ts';
import { pageView } from './pages.ts';
import { siteText } from './site-text.ts';

/*
 * The code another site pastes to embed a calculator (embed): the frame, then a visible text link
 * to the full page outside it, the brand link of PLAN §7.6. Built from `EMBEDS`, so a snippet can
 * never name a page that does not exist.
 */

/** The fixed height of the frame: the calculator scrolls inside it on a short screen. */
const HEIGHT = 900;

const escape = (text: string): string =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

/** The snippet of one embed: `name` titles the frame, `credit` is the text of the link. */
export const snippetOf = (embed: Embed, name: string, credit: string): string =>
  [
    `<iframe src="${urlOf(embed.path)}" title="${escape(name)}" width="100%" height="${String(HEIGHT)}" style="border:0" loading="lazy" allow="clipboard-write"></iframe>`,
    `<p><a href="${urlOf(embed.page)}">${escape(credit)}</a></p>`,
  ].join('\n');

export interface Snippet {
  readonly id: string;
  /** The calculator's name, its page heading. */
  readonly name: string;
  readonly code: string;
}

/** Every calculator's snippet in `locale`, in the order of the calculator pages. */
export const snippetsFor = (locale: Locale): Snippet[] => {
  const text = siteText(locale);
  return EMBEDS.filter((embed) => embed.locale === locale).map((embed) => {
    const name = pageView(embed.id, locale).title;
    // "Concrete Calculator by Maestro Calc": the same order in both languages, one word between
    const credit = `${name} ${text('site.embed.by')} ${SITE.name}`;
    return { id: embed.id, name, code: snippetOf(embed, name, credit) };
  });
};
