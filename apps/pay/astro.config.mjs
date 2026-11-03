// @ts-check
import { defineConfig } from 'astro/config';
import { SITE } from './src/site.config.ts';

// Cuenta Horas, the hourly pay site (plans/pago-del-trabajador/PLAN.md). A scaffold: not deployed
// until its domain exists (second-site-foundation D3).
export default defineConfig({
  site: SITE.origin,
  output: 'static',
  build: { format: 'file' },
  trailingSlash: 'never',
});
