import { describe, expect, it } from 'vitest';
import { FULL_TIME_GUIDE, PART_TIME_GUIDE } from './full-part-time.ts';
import { HOURS_WORKED_GUIDE } from './hours-worked.ts';
import { OVERTIME_GUIDES } from './overtime.ts';
import { MINIMUM_WAGE_2027_GUIDE } from './minimum-wage-2027.ts';
import { MINIMUM_WAGE_STATES_GUIDE } from './minimum-wage-states.ts';
import { OVERTIME_STATES_GUIDE } from './overtime-states.ts';
import { PAY_STUB_GUIDE } from './pay-stub.ts';
import { PTO_GUIDE } from './pto.ts';
import { SHIFT_GUIDE } from './shift-differential.ts';
import { GUIDE_TEXTS } from './texts.ts';
import { TIP_CREDIT_GUIDE } from './tip-credit.ts';
import { TIPPED_STATES_GUIDE } from './tipped-states.ts';
import { UNPAID_WAGES_GUIDE } from './unpaid-wages.ts';
import { W2_BOX_12_GUIDE } from './w2-box-12.ts';

// What an answer engine or a featured snippet lifts is the first paragraph: it must answer the
// question the title asks, with the number that answers it, before it says what the guide covers.
const GUIDES = {
  'tax-guide': GUIDE_TEXTS,
  'overtime-guide': OVERTIME_GUIDES.federal,
  'california-overtime-guide': OVERTIME_GUIDES.california,
  'pay-stub-guide': PAY_STUB_GUIDE,
  'unpaid-wages-guide': UNPAID_WAGES_GUIDE,
  'pto-guide': PTO_GUIDE,
  'shift-differential-guide': SHIFT_GUIDE,
  'tip-credit-guide': TIP_CREDIT_GUIDE,
  'tipped-states-guide': TIPPED_STATES_GUIDE,
  'hours-worked-guide': HOURS_WORKED_GUIDE,
  'overtime-states-guide': OVERTIME_STATES_GUIDE,
  'minimum-wage-states-guide': MINIMUM_WAGE_STATES_GUIDE,
  'minimum-wage-2027-states-guide': MINIMUM_WAGE_2027_GUIDE,
  'w2-box-12-guide': W2_BOX_12_GUIDE,
  'full-time-guide': FULL_TIME_GUIDE,
  'part-time-guide': PART_TIME_GUIDE,
};

/** The first sentence: up to the first full stop followed by a space, or the end. */
const firstSentenceOf = (lead: string): string => /^.+?[.!?](?=\s|$)/.exec(lead)?.[0] ?? lead;

// the key number each lead must give in its first sentence
const KEY: Readonly<Record<keyof typeof GUIDES, string>> = {
  'tax-guide': '$25,000',
  'overtime-guide': '40',
  'california-overtime-guide': '8',
  'pay-stub-guide': '6.2%',
  'unpaid-wages-guide': '2',
  'pto-guide': '3.08',
  'shift-differential-guide': '$1.50',
  'tip-credit-guide': '$2.13',
  'tipped-states-guide': '$2.13',
  'hours-worked-guide': '8',
  'overtime-states-guide': '40',
  'minimum-wage-states-guide': '$7.25',
  'minimum-wage-2027-states-guide': '$17.73',
  'w2-box-12-guide': '$12,500',
  'full-time-guide': '30',
  'part-time-guide': '35',
};

describe('the opening of each guide', () => {
  for (const [id, texts] of Object.entries(GUIDES)) {
    it.each(['en', 'es'] as const)(`${id} (%s): answers first, with its key number`, (lang) => {
      const { lead } = texts[lang];
      const first = firstSentenceOf(lead);
      expect(first, lead).toMatch(/\d/);
      expect(first, lead).toContain(KEY[id as keyof typeof GUIDES]);
      expect(lead, lead).not.toMatch(/^(This guide|Esta guía)/);
      // one or two sentences of answer, then at most one about the guide
      expect(lead.split(/(?<=[.!?])\s+/).length, lead).toBeLessThanOrEqual(3);
    });
  }
});
