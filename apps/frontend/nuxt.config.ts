import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { defineNuxtConfig } from 'nuxt/config';
import Aura from '@primeuix/themes/aura';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  workspaceDir: '../../',

  devtools: { enabled: true },

  devServer: {
    host: 'localhost',
    port: 4200,
  },

  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/hints',
    '@nuxt/image',
    '@nuxtjs/seo',
    '@primevue/nuxt-module',
    '@nuxtjs/tailwindcss',
    'nuxt-gtag',
  ],

  css: [
    '~/assets/css/main.css',
    'primeicons/primeicons.css',
  ],

  imports: {
    autoImport: true,
  },

  typescript: {
    typeCheck: true,
    tsConfig: {
      extends: '../../../tsconfig.base.json', // Nuxt copies this string as-is to the `./.nuxt/tsconfig.json`, therefore it needs to be relative to that directory
    },
  },

  vite: {
    plugins: [nxViteTsPaths() as any],
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001/api/v1',
    },
  },

  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:4200',
    name: 'Album Explorer',
  },

  sitemap: {
    enabled: true,
  },

  robots: {
    blockNonSeoBots: true,
    blockAiBots: true,
    groups: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
  },

  primevue: {
    autoImport: true,
    importTheme: { from: '@/themes/index.ts' },
    options: {
      ripple: true,
      theme: {
        preset: Aura,
      },
    },
  },

  gtag: {
    enabled: process.env.NODE_ENV === 'production',
    id: process.env.NUXT_PUBLIC_GTAG_ID,
    initCommands: [
      // Setup up consent mode
      [
        'consent',
        'default',
        {
          ad_user_data: 'denied',
          ad_personalization: 'denied',
          ad_storage: 'denied',
          analytics_storage: 'denied',
          wait_for_update: 500,
        },
      ],
    ],
  },

  app: {
    head: {
      title: 'Album Explorer',
      meta: [
        { name: 'description', content: 'Explore and collect your favorite albums.' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },
});
