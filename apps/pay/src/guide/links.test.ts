import { describe, expect, it } from 'vitest';
import { GUIDE_CALCULATORS } from '../site-check/link-rules.ts';
import { ROUTES } from '../routes.ts';
import { EMPLOYER_GUIDE_LINKS } from './employers.ts';
import { overtimeGuideLinksOf } from './links.ts';

describe('overtimeGuideLinksOf', () => {
  it('links, in each language, every guide the overtime calculator and the time card explain, the employer ones apart', () => {
    for (const lang of ['en', 'es'] as const) {
      const explained = ROUTES.filter(({ id }) =>
        GUIDE_CALCULATORS[id]?.some((calculator) => ['overtime', 'time-card'].includes(calculator)),
      ).map((route) => route[lang]);
      // the employer guides are listed apart, under "For employers"
      const links = [...overtimeGuideLinksOf(lang), ...EMPLOYER_GUIDE_LINKS[lang].links];
      expect(links.map(({ href }) => href).sort()).toEqual(explained.sort());
      for (const { label } of links) expect(label.length, lang).toBeGreaterThan(0);
    }
  });
});
