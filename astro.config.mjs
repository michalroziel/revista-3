import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import markdoc from '@astrojs/markdoc';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import icon from 'astro-icon';
import { remarkReadingTime } from './src/scripts/remark-reading-time.mjs';
import undiciRetry from './src/scripts/undici-retry.js';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// Name of your repository (used for the GitHub Pages sub-path)
const repo = 'revista-3';

export default defineConfig({
  // Full URL where your site will be hosted
  site: `https://michalroziel.github.io/${repo}`,

  // Base path for pages and assets (no trailing slash)
  base: `/${repo}`,

  image: {
    domains: ['erfianugrah.com', 'cdn.erfianugrah.com'],
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: {
        limitInputPixels: false,
      },
    },
  },

  integrations: [
    icon(),
    sitemap(),
    mdx({
      syntaxHighlight: 'shiki',
      shikiConfig: {
        theme: 'rose-pine-dawn',
        defaultColor: false,
        themes: {
          light: 'rose-pine-dawn',
          dark: 'tokyo-night',
        },
        langs: [],
        wrap: true,
      },
      gfm: false,
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
    markdoc(),
    undiciRetry(),
    react(),
  ],

  markdown: {
    syntaxHighlight: 'shiki',
    shikiConfig: {
      theme: 'rose-pine-dawn',
      defaultColor: false,
      themes: {
        light: 'rose-pine-dawn',
        dark: 'tokyo-night',
      },
      langs: [],
      wrap: true,
    },
    gfm: false,
    remarkPlugins: [remarkGfm, remarkMath, remarkReadingTime],
    rehypePlugins: [rehypeKatex],
  },

  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },

  experimental: {
    clientPrerender: true,
    fonts: [
      {
        provider: fontProviders.fontsource(),
        name: 'Inconsolata',
        cssVariable: '--font-inconsolata',
        display: 'swap',
        fallbacks: ['monospace'],
        weights: [200, 400, 700, 900],
        optimizedFallbacks: true,
      },
      {
        provider: fontProviders.fontsource(),
        name: 'Overpass Mono',
        cssVariable: '--font-overpass-mono',
        display: 'swap',
        fallbacks: ['monospace'],
        weights: [300, 400, 700],
        optimizedFallbacks: true,
      },
    ],
  },

  build: {
    concurrency: 4,
    measuring: {
      entryBuilding: true,
      pageGeneration: true,
      bundling: true,
      rendering: true,
      assetProcessing: true,
    },
  },

  security: {
    checkOrigin: false,
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
