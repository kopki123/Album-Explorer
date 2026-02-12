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
  typescript: {
    typeCheck: true,
    tsConfig: {
      extends: '../../../tsconfig.base.json', // Nuxt copies this string as-is to the `./.nuxt/tsconfig.json`, therefore it needs to be relative to that directory
    },
  },
  imports: {
    autoImport: true,
  },
  css: [
    '~/assets/css/main.css',
    'primeicons/primeicons.css'
  ],
  vite: {
    plugins: [nxViteTsPaths() as any],
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001'
    }
  },

  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/hints',
    '@nuxt/image',
    '@primevue/nuxt-module',
    '@nuxtjs/tailwindcss'
  ],

  primevue: {
    autoImport: true,
    importTheme: { from: '@/themes/index.ts' },
    options: {
      ripple: true,
      theme: {
        preset: Aura
      }
    }
  },

  app: {
    head: {
      title: 'Album Explorer',
      meta: [
        { name: 'description', content: 'Explore and collect your favorite albums.' }
      ]
    }
  },
});