import { countdownOf, ruleOfData } from '../dates/live.ts';

/**
 * The live countdown of a date page: counts from the visitor's local date (never UTC, so the day
 * turns at their own midnight) to the next date of the rule in `[data-countdown-rule]`, and writes
 * the days, the weeks and the date into the `[data-countdown]` nodes.
 */
const box = document.querySelector<HTMLElement>('[data-countdown-rule]');
const rule = box === null ? null : ruleOfData(box.dataset);
if (rule !== null) {
  const now = new Date();
  const today = { y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() };
  const text = countdownOf(rule, today);
  const texts: Readonly<Record<string, string>> = {
    days: text.days,
    weeks: text.weeks,
    date: text.date,
  };
  for (const node of document.querySelectorAll<HTMLElement>('[data-countdown]')) {
    const value = texts[node.dataset['countdown'] ?? ''];
    if (value !== undefined) node.textContent = value;
  }
}
