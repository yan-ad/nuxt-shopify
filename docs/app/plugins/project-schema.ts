import pkg from '../../../package.json'

export default defineNuxtPlugin(() => {
  useSchemaOrg([
    {
      '@type': 'SoftwareSourceCode',
      '@id': 'https://shopify.yan.ad/#software',
      name: '@yan-ad/nuxt-shopify',
      description:
        'Independent, community-maintained Nuxt module for Shopify apps. Not affiliated with, endorsed by, or sponsored by Shopify Inc.',
      url: 'https://shopify.yan.ad',
      codeRepository: 'https://github.com/yan-ad/nuxt-shopify',
      downloadUrl: 'https://www.npmjs.com/package/@yan-ad/nuxt-shopify',
      license: 'https://github.com/yan-ad/nuxt-shopify/blob/main/LICENSE',
      programmingLanguage: ['TypeScript', 'Vue'],
      runtimePlatform: ['Nuxt 4.7+', 'Nitro v3', 'Node.js 22.22+'],
      version: pkg.version,
      isAccessibleForFree: true,
      author: {
        '@type': 'Person',
        name: 'yan-ad',
        url: 'https://github.com/yan-ad'
      }
    }
  ])
  useHead({
    link: [
      {
        rel: 'alternate',
        type: 'text/plain',
        title: 'LLM documentation index',
        href: 'https://shopify.yan.ad/llms.txt'
      },
      {
        rel: 'alternate',
        type: 'text/plain',
        title: 'Full documentation for language models',
        href: 'https://shopify.yan.ad/llms-full.txt'
      }
    ]
  })
})
