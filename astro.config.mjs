// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://tonoplas909.github.io',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [sitemap()],
});
