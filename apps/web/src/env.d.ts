// The Astro language server types `.astro` imports; plain `tsc` and typescript-eslint do not, so
// both programs see every `.astro` file as the component factory that Astro renders.
declare module '*.astro' {
  import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
  const component: AstroComponentFactory;
  export default component;
}
