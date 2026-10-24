import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { pageSchema } from './content/schema.ts';

// `<locale>/<id>.md`: the entry id is that path without the extension (`en/about`).
const pages = defineCollection({
  loader: glob({ base: './src/content/pages', pattern: '{en,es}/*.md' }),
  schema: pageSchema,
});

export const collections = { pages };
