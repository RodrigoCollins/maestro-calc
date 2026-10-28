import { controllerOf } from '../../calculator/controller.ts';
import type { AnyPageModule } from '../../calculator/page-module.ts';

/** What the page shows for a link: the panel figures by output key, then the shopping quantities. */
export interface ShownFigures {
  readonly figures: Readonly<Partial<Record<string, string>>>;
  readonly shopping: readonly string[];
}

/**
 * The figures a page shows for `query` (`v=1&l=144`, with or without the leading `?`), read from the
 * page's own controller: the one path every calculator takes, so no per-calculator mapping and no
 * special case. Test support only: it sits outside the coverage and the generic-code scans.
 */
export const shownFigures = (module: AnyPageModule, query: string): ShownFigures => {
  const search = query === '' || query.startsWith('?') ? query : `?${query}`;
  const { view } = controllerOf(module).start(
    { messages: {}, origin: 'https://example.test', path: '/', switchPath: '/', helps: new Set() },
    search,
  );
  return {
    figures: view.panel.figures,
    shopping: view.panel.shopping.map((line) => line.qty),
  };
};
