import type { Lang } from '../time-card/receipt.ts';
import { OVERTIME_GUIDE_PATHS, OVERTIME_GUIDES } from './overtime.ts';
import { PAY_STUB_GUIDE, PAY_STUB_GUIDE_PATHS } from './pay-stub.ts';
import { UNPAID_WAGES_GUIDE, UNPAID_WAGES_GUIDE_PATHS } from './unpaid-wages.ts';

/**
 * The guides about overtime and the pay it is owed, as links: the time card and the overtime
 * calculator both list them, so each guide is linked from the calculators it explains.
 */
export const overtimeGuideLinksOf = (
  lang: Lang,
): readonly { readonly href: string; readonly label: string }[] => [
  ...(['federal', 'california'] as const).map((guide) => ({
    href: OVERTIME_GUIDE_PATHS[guide][lang],
    label: OVERTIME_GUIDES[guide][lang].linkLabel,
  })),
  { href: PAY_STUB_GUIDE_PATHS[lang], label: PAY_STUB_GUIDE[lang].linkLabel },
  { href: UNPAID_WAGES_GUIDE_PATHS[lang], label: UNPAID_WAGES_GUIDE[lang].linkLabel },
];
