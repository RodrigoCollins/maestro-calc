import { describe, expect, it } from 'vitest';
import { asLaunched } from './launch.ts';

describe('asLaunched', () => {
  it('turns the noindex line into the canonical and adds og:url', () => {
    const closed =
      '<head><meta name="robots" content="noindex"><meta property="og:locale" content="en_US"></head>';
    expect(asLaunched(closed, '/sod-calculator', 'https://x.test')).toBe(
      '<head><link rel="canonical" href="https://x.test/sod-calculator"><meta property="og:url" content="https://x.test/sod-calculator"><meta property="og:locale" content="en_US"></head>',
    );
  });

  it('leaves a page with neither a noindex line nor an og:locale as it is', () => {
    expect(asLaunched('<head></head>', '/', 'https://x.test')).toBe('<head></head>');
  });
});
