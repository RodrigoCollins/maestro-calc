import type { Locale } from '@maestro-calc/i18n';
import { LOCALE_TAGS } from '../routing/routes.ts';

/** A calendar day (`YYYY-MM-DD`) in the long form of the locale, in UTC so no timezone moves it. */
export const calendarDay = (iso: string, locale: Locale): string =>
  new Intl.DateTimeFormat(LOCALE_TAGS[locale], { dateStyle: 'long', timeZone: 'UTC' }).format(
    new Date(`${iso}T00:00:00Z`),
  );
