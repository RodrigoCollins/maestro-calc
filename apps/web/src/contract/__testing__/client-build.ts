import { build } from 'vite';
import type { Rolldown } from 'vite';
import { fromRoot } from '../root.ts';

/** An absolute path no file lives at: library mode resolves its entry against the root. */
const VIRTUAL_ENTRY = fromRoot('apps/web/src/virtual-client-entry.ts');

/** The minified library build of a virtual entry module, as Vite would ship it to a browser. */
export interface ClientBuild {
  /** The bytes of all emitted chunks. */
  readonly size: number;
  /** The text of all emitted chunks. */
  readonly code: string;
  /** Every module the bundler loaded before tree shaking: the source graph of the entry. */
  readonly modules: readonly string[];
}

const isChunk = (item: Rolldown.OutputChunk | Rolldown.OutputAsset): item is Rolldown.OutputChunk =>
  item.type === 'chunk';

/**
 * Builds `source` (the text of a virtual entry module that re-exports what a client entry will
 * use) with Vite in library mode: minified, in memory, from the real workspace sources. Nothing
 * is written. The result is the size and the text of the emitted chunks (design C17, SQ27).
 */
export const buildClient = async (source: string): Promise<ClientBuild> => {
  let modules: readonly string[] = [];
  const output = await build({
    root: fromRoot('apps/web'),
    configFile: false,
    logLevel: 'silent',
    plugins: [
      {
        name: 'virtual-client-entry',
        resolveId: (id) => (id === VIRTUAL_ENTRY ? id : undefined),
        load: (id) => (id === VIRTUAL_ENTRY ? source : undefined),
        buildEnd() {
          modules = Array.from(this.getModuleIds());
        },
      },
    ],
    build: {
      write: false,
      // the client build of Astro (vite-build-config): esnext target, minified
      target: 'esnext',
      minify: true,
      lib: { entry: VIRTUAL_ENTRY, formats: ['es'], fileName: 'client' },
    },
  });
  const results = Array.isArray(output) ? output : [output];
  const chunks = results.flatMap((result) =>
    'output' in result ? result.output.filter(isChunk) : [],
  );
  const code = chunks.map((chunk) => chunk.code).join('\n');
  return {
    size: chunks.reduce((total, chunk) => total + Buffer.byteLength(chunk.code), 0),
    code,
    modules,
  };
};
