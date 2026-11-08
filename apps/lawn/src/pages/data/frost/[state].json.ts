import type { APIRoute, GetStaticPaths } from 'astro';
import { FROST_STATES } from '../../../frost.ts';
import { stateJsonOf } from '../../../frost-json.ts';

// One static JSON per state, for the ZIP lookup of the frost pages (`src/client/frost.ts`).
export const getStaticPaths = (() =>
  FROST_STATES.map(({ slug, name }) => ({
    params: { state: slug },
    props: { name },
  }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ params, props }) =>
  new Response(JSON.stringify(stateJsonOf(params['state'] ?? '', String(props['name']))), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
