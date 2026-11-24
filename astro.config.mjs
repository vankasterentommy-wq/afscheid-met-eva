// @ts-check
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import sitemap from '@astrojs/sitemap';
import tina from '@tinacms/astro/integration';

// Definitieve domeinnaam: pas aan via de env-variabele SITE_URL (Netlify) zodra het domein gekoppeld is.
const site = process.env.SITE_URL || 'https://afscheidmeteva.nl';
const onNetlify = process.env.NETLIFY === 'true';

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file' },
  adapter: netlify({
    // Netlify Image CDN (AVIF/WebP) alleen in de Netlify-build; lokaal gewone <img>.
    imageCDN: onNetlify,
    devFeatures: false,
  }),
  image: {
    domains: ['assets.tina.io'],
  },
  integrations: [
    tina(),
    sitemap({
      filter: (page) => !/\/(bedankt|404)$/.test(page.replace(/\/$/, '')),
    }),
  ],
  vite: {
    ssr: { noExternal: ['@tinacms/astro', '@tinacms/bridge'] },
    build: {
      rollupOptions: {
        onwarn(warning, warn) {
          if (warning.code === 'UNUSED_EXTERNAL_IMPORT' && warning.exporter === 'tinacms/dist/client') return;
          warn(warning);
        },
      },
    },
  },
});
