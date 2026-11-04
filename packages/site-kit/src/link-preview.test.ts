import { describe, expect, it } from 'vitest';
import { linkPreviewOf } from './link-preview.ts';

describe('linkPreviewOf (plans/growth/PLAN.md › G7)', () => {
  it('shares the page title and description with the one 1200 by 630 image and a large card', () => {
    expect(linkPreviewOf('https://example.com', { title: 'T', description: 'D' })).toEqual({
      'og:title': 'T',
      'og:description': 'D',
      'og:image': 'https://example.com/og.png',
      'og:image:width': '1200',
      'og:image:height': '630',
      'twitter:card': 'summary_large_image',
    });
  });
});
