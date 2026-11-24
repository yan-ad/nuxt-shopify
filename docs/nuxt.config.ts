import pkg from '../package.json'

export default defineNuxtConfig({
  extends: ['docus'],

  routeRules: {
    '/llm.txt': { redirect: { to: '/llms.txt', statusCode: 301 } },
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
    name: '@yan-ad/nuxt-shopify',
    url: 'https://shopify.yan.ad',
    description:
      'Documentation for the independent Nuxt module for Shopify apps: authentication, expiring offline tokens, Admin API, webhooks, billing, Polaris v2 Vue components, and App Bridge.'
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
    domain: 'https://shopify.yan.ad',
    title: '@yan-ad/nuxt-shopify documentation',
    description:
      'Official project documentation for the independent, community-maintained Nuxt module. Not affiliated with, endorsed by, or sponsored by Shopify Inc.',
    full: {
      title: '@yan-ad/nuxt-shopify full documentation',
      description:
        'Complete configuration, authentication, server utilities, and Polaris v2 Vue wrapper reference.'
    },
    notes: [
      'Use Nuxt 4.7+ and Nitro v3. Polaris wrappers use the Sh prefix and mount client-side.',
      'Component examples use Vue wrappers, not the React Polaris package. Interactive iframe previews are illustrative; read the Markdown reference for props and events.',
      'Shopify API credentials must remain server-side. Installed app scopes determine real store access.',
      'Canonical documentation: https://shopify.yan.ad. Repository: https://github.com/yan-ad/nuxt-shopify.',
      'This project is independent and is not affiliated with Shopify Inc.'
    ]
  },

  ogImage: {
    defaults: {
      url: '/share-card.webp'
    }
  }
})
