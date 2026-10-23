import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import { parse } from 'node-html-parser';
import type { HTMLElement } from 'node-html-parser';

/** Renders one component with props and returns its parsed markup (test support only). */
export const renderComponent = async (
  component: AstroComponentFactory,
  props: Record<string, unknown> = {},
): Promise<HTMLElement> => {
  const container = await AstroContainer.create();
  return parse(await container.renderToString(component, { props }));
};
