import type { Locale } from '@maestro-calc/i18n';
import { jobsOf, type JobId } from '../routing/jobs.ts';
import { pathOf } from '../routing/routes.ts';
import type { CalculatorPageId } from '../routing/templates.ts';
import { siteText } from './site-text.ts';

/** One link to a job page: its heading, and the short label a calculator page lists it by. */
export interface JobLink {
  readonly href: string;
  readonly title: string;
  /** `page.<id>.label`: `10x10 slab`, `4/12 pitch`. */
  readonly label: string;
}

/**
 * The job pages of `calculator` in `locale`, in table order, leaving out `except` (a job page lists
 * its siblings): the "Common jobs" of the calculator page, of its hub and of each job page.
 */
export const jobLinks = (
  calculator: CalculatorPageId,
  locale: Locale,
  except?: JobId,
): JobLink[] => {
  const text = siteText(locale);
  return jobsOf(calculator)
    .filter((id) => id !== except)
    .map((id) => ({
      href: pathOf(id, locale),
      title: text(`page.${id}.heading`),
      label: text(`page.${id}.label`),
    }));
};
