import { liveTextOf } from '../long-tail/time-math.ts';

/*
 * The live answer of the time pages (`LongTailPage.live`): every `[data-time-now]` slot is filled
 * from the visitor's clock, in the page's language, and again each minute. The page as built
 * reads well without it; the arithmetic is `../long-tail/time-math.ts`.
 */

const lang = document.documentElement.lang;
const time = new Intl.DateTimeFormat(lang, { hour: 'numeric', minute: '2-digit' });
const weekday = new Intl.DateTimeFormat(lang, { weekday: 'long' });
const date = new Intl.DateTimeFormat(lang, {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});
const formats = {
  time: (moment: Date): string => time.format(moment),
  weekday: (moment: Date): string => weekday.format(moment),
  date: (moment: Date): string => date.format(moment),
};

const fill = (): void => {
  const now = new Date();
  for (const slot of document.querySelectorAll<HTMLElement>('[data-time-now]')) {
    const text = liveTextOf(slot.dataset['timeNow'] ?? '', slot.dataset, now, formats);
    if (text !== undefined) slot.textContent = text;
  }
};

fill();
setInterval(fill, 60_000);
