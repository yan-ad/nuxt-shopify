export default defineAppConfig({
  seo: {
    description:
      'Build Shopify apps with Nuxt 4: authentication, expiring offline tokens, Admin API, webhooks, billing, Polaris v2 Vue components, and App Bridge. Independent community project.'
  },

  socials: {
    x: 'https://go.nuxt.com/x',
    discord: 'https://go.nuxt.com/discord',
    shopify: 'https://shopify.dev/docs',
    nuxt: 'https://nuxt.com'
  },

  github: {
    rootDir: 'docs'
  },

  ui: {
    colors: {
      primary: 'primary',
      neutral: 'zinc'
    },
    pageHero: {
      slots: {
        title:
          'text-5xl sm:text-5xl text-pretty tracking-tight font-bold text-highlighted'
      }
    }
  }
})
