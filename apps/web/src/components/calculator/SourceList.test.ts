import { describe, expect, it } from 'vitest';
import { renderComponent } from '../../__testing__/render-component.ts';
import SourceList from './SourceList.astro';

const content = {
  updatedLabel: 'Last updated',
  updated: '2026-10-25',
  updatedText: 'October 25, 2026',
  sources: [
    {
      name: 'QUIKRETE Concrete Mix No. 1101 data sheet',
      url: 'https://www.quikrete.com/PDFs/DATA_SHEET-Concrete%20Mix%201101.pdf',
      retrieved: 'October 25, 2026',
    },
    {
      name: 'NIST SP 811, Appendix B',
      url: 'https://www.nist.gov/pml/special-publication-811',
      retrieved: 'October 24, 2026',
    },
  ],
};

describe('SourceList (calculator-page › [CP8] source side)', () => {
  // spec: calculator-page › [CP8] name, link and retrieval date of each source
  it('lists each source as a link with its retrieval date', async () => {
    const root = await renderComponent(SourceList, { content });
    const items = root.querySelectorAll('li');
    expect(items.map((item) => item.text.trim())).toEqual([
      'QUIKRETE Concrete Mix No. 1101 data sheet, October 25, 2026',
      'NIST SP 811, Appendix B, October 24, 2026',
    ]);
    expect(root.querySelectorAll('li a').map((link) => link.getAttribute('href'))).toEqual(
      content.sources.map(({ url }) => url),
    );
  });

  // spec: calculator-page › [CP8] one time element, equal to the entry's updated
  it('shows the review date as the only time element, with the ISO date', async () => {
    const root = await renderComponent(SourceList, { content });
    const times = root.querySelectorAll('time');
    expect(times).toHaveLength(1);
    expect(times[0]?.getAttribute('datetime')).toBe('2026-10-25');
    expect(times[0]?.text).toBe('October 25, 2026');
    expect(root.querySelector('.calc-updated')?.text.trim()).toBe('Last updated: October 25, 2026');
  });
});
