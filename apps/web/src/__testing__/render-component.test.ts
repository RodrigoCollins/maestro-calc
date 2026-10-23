import { describe, expect, it } from 'vitest';
import BaseLayout from '../layouts/BaseLayout.astro';
import SkipLink from '../components/SkipLink.astro';
import { renderComponent } from './render-component.ts';

const head = {
  title: 'Title',
  description: 'Description',
  canonical: 'https://maestrocalc.com/',
  alternates: [],
};
const props = { locale: 'en', id: 'home', head };
const slots = { default: '<h1>Body</h1>' };

describe('renderComponent (test support)', () => {
  it('renders a fragment by default, with no document around a component', async () => {
    const document = await renderComponent(SkipLink, { label: 'Skip' });
    expect(document.querySelector('a.skip-link')?.text).toBe('Skip');
    expect(document.querySelector('html')).toBeNull();
  });

  it('renders a whole document when partial is false, keeping the doctype and the slot', async () => {
    const document = await renderComponent(BaseLayout, props, { partial: false, slots });
    expect(document.toString().trimStart().toLowerCase()).toMatch(/^<!doctype html>/);
    expect(document.querySelector('html')?.getAttribute('lang')).toBe('en-US');
    expect(document.querySelector('main h1')?.text).toBe('Body');
  });

  it('renders a layout as a fragment when partial is left on', async () => {
    const document = await renderComponent(BaseLayout, props, { slots });
    expect(document.toString().toLowerCase()).not.toContain('<!doctype html>');
  });
});
