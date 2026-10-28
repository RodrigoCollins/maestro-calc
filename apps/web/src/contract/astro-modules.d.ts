// `astro:content` is a virtual module that Astro types in its own program; the test program only
// needs the one function `content.config.ts` calls, which returns the collection it is given.
declare module 'astro:content' {
  export const defineCollection: <Config extends object>(config: Config) => Config;
}
