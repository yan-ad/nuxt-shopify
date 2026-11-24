import { fileURLToPath } from 'node:url'
import pkg from '../package.json'

export default defineNuxtConfig({
  extends: ['docus'],

  modules: ['@nuxt/ui', '@nuxtjs/critters'],

  components: {
    dirs: [
      {
        path: '~/components',
        pathPrefix: false
      }
    ]
  },

  app: {
    head: {
      link: [
        {
          rel: 'icon',
          type: 'image/png',
          href: '/icon.png'
        }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

  site: {
    name: 'Shopify App Nuxt',
    url: 'https://shopify-app-nuxt.vercel.app'
  },

  runtimeConfig: {
    public: {
      version: pkg.version
    }
  },

  vite: {
    // Do not discover the module workspace's tsconfig for external/layer files.
    // Its .nuxt directory is not generated when deploying only the docs app.
    tsconfig: fileURLToPath(new URL('./.nuxt/tsconfig.json', import.meta.url)),
    build: {
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('vaul-vue')) return 'vaul-vue'
            if (id.includes('reka-ui')) return 'reka-ui'
          }
        }
      }
    },
    optimizeDeps: {
      include: ['vaul-vue', 'reka-ui']
    }
  },

  image: {
    format: ['avif', 'webp'],

    provider: 'shopify',

    domains: ['cdn.shopify.com']
  },

  llms: {
    domain: 'shopify-app-nuxt.vercel.app'
  },

  ogImage: {
    defaults: {
      url: '/share-card.webp'
    }
  }
})