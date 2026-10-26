// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { alternates } from './src/lib/seo';

export default defineConfig({
  site: 'https://tonoplas909.github.io',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [
    sitemap({
      // L'option `i18n` de l'intégration associe `/en/projects/x/` à `/projects/x/`, ce qui est faux
      // ici (le chemin français est `/projets/x/`). Les alternatives viennent donc de `alternates()`,
      // la même source que les balises hreflang des pages.
      serialize(item) {
        const { pathname } = new URL(item.url);
        item.links = alternates(pathname).map(({ hreflang, href }) => ({ url: href, lang: hreflang }));
        return item;
      },
    }),
  ],
});
