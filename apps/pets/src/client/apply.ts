import type { Patch } from '../calc/view.ts';

/** The few things of the DOM a patch touches, so a test can stand in for the page. */
export interface Target {
  querySelectorAll(selector: string): Iterable<{
    textContent: string | null;
    innerHTML: string;
    hidden: boolean;
    dataset: Record<string, string | undefined>;
    style: { setProperty(name: string, value: string): void };
  }>;
}

/**
 * Writes a patch into the page: each `[data-text]`, `[data-html]` and `[data-show]` element named
 * by it, and the variables and flags on every `[data-result]` element.
 */
export const applyPatch = (root: Target, patch: Patch): void => {
  for (const [key, value] of Object.entries(patch.text))
    for (const node of root.querySelectorAll(`[data-text="${key}"]`)) node.textContent = value;
  for (const [key, value] of Object.entries(patch.html))
    for (const node of root.querySelectorAll(`[data-html="${key}"]`)) node.innerHTML = value;
  for (const [key, shown] of Object.entries(patch.show))
    for (const node of root.querySelectorAll(`[data-show="${key}"]`)) node.hidden = !shown;
  for (const node of root.querySelectorAll('[data-result]')) {
    for (const [name, value] of Object.entries(patch.vars))
      node.style.setProperty(`--${name}`, value);
    for (const [name, value] of Object.entries(patch.flags)) node.dataset[name] = value;
  }
};
