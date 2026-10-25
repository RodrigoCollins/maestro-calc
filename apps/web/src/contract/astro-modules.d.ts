// The Astro language server types `.astro` imports; plain `tsc` and typescript-eslint do not, so
// the component tests see every `.astro` file as the factory that Astro's container renders.
declare module '*.astro' {
  import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
  const component: AstroComponentFactory;
  export default component;
}

// `astro:content` is a virtual module that Astro types in its own program; the test program only
// needs the one function `content.config.ts` calls, which returns the collection it is given.
declare module 'astro:content' {
  export const defineCollection: <Config extends object>(config: Config) => Config;
}
