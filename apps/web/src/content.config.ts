import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { calculatorSchema, pageSchema } from './content/schema.ts';
import { calculators } from './lib/calculators.ts';

// `<locale>/<id>.md`: the entry id is that path without the extension (`en/about`).
const pages = defineCollection({
  loader: glob({ base: './src/content/pages', pattern: '{en,es}/*.md' }),
  schema: pageSchema,
});

// One entry per calculator and locale (`en/concrete`); the id must be a calculator of the registry.
const [firstId, ...otherIds] = calculators.map(({ id }) => id);
const calculatorEntries = defineCollection({
  loader: glob({ base: './src/content/calculators', pattern: '{en,es}/*.md' }),
  schema: calculatorSchema([firstId ?? '', ...otherIds]),
});

export const collections = { pages, calculators: calculatorEntries };
