import pkg from '../package.json'

export default defineNuxtConfig({
  extends: ['docus'],

  routeRules: {
    '/guides/polaris-components': {
      redirect: { to: '/components', statusCode: 301 }
    },
    '/polaris-wc': { redirect: { to: '/components', statusCode: 301 } },
    '/polaris-wc/**': { redirect: { to: '/components/**', statusCode: 301 } }
  },

  modules: ['@nuxt/ui', '@nuxtjs/critters'],

  components: {
    dirs: [
      {
        path: '~/components/content',
        pathPrefix: false,
        global: true
      },
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
    url: 'https://shopify.yan.ad'
  },

  runtimeConfig: {
    public: {
      version: pkg.version
    }
  },

  vite: {
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
    domain: 'shopify.yan.ad'
  },

  ogImage: {
    defaults: {
      url: '/share-card.webp'
    }
  }
})
