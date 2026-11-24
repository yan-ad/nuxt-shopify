import {
  defineNuxtModule,
  addPlugin,
  addServerHandler,
  addImportsDir,
  createResolver,
  addServerImportsDir,
  addRouteMiddleware,
  extendPages,
  addNitroPlugin,
  useNitro,
  useLogger
} from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { addCustomTab } from '@nuxt/devtools-kit'
import {
  AppDistribution,
  type ModuleOptions,
  type PolarisIcon
} from './runtime/types'
import { ApiVersion } from '@shopify/shopify-api'
import { APP_BRIDGE_URL, POLARIS_URL } from './runtime/shared/polaris'

export type { ModuleOptions, PolarisIcon }

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@yan-ad/nuxt-shopify',
    configKey: 'shopify',
    compatibility: {
      nuxt: '^4.7.0'
    }
  },
  defaults: {
    apiKey: '',
    apiSecretKey: '',
    appUrl: '',
    allowedHosts: ['.trycloudflare.com'],
    apiVersion: ApiVersion.January26,
    authPathPrefix: '/_shopify/auth',
    distribution: AppDistribution.AppStore,
    useOnlineTokens: false,
    componentPrefix: 'Sh',
    redirectCookie: 'sh-redirect-to'
  },
  onInstall() {
    console.log('🛍️ Shopify App Module installed!')
  },
  onUpgrade() {
    console.log(
      `🛍️ Shopify App Module upgraded! Please always read the docs https://github.com/yan-ad/nuxt-shopify`
    )
  },
  setup(options, nuxt: Nuxt) {
    const { resolve } = createResolver(import.meta.url)
    const logger = useLogger('@yan-ad/nuxt-shopify:module')

    // Configure before Vue's SSR compiler is initialized, not in app:resolve.
    const isCustomElement = nuxt.options.vue.compilerOptions.isCustomElement
    nuxt.options.vue.compilerOptions.isCustomElement = (tag) =>
      tag.startsWith('s-') ||
      tag.startsWith('ui-') ||
      Boolean(isCustomElement?.(tag))

    if (nuxt.options.dev) {
      addPlugin({
        src: resolve('./runtime/plugins/devtools.client'),
        mode: 'client'
      })
      extendPages((pages) => {
        pages.push({
          name: 'shopify-devtools',
          path: '/_shopify/devtools',
          file: resolve('./runtime/pages/shopify-devtools.vue')
        })
      })
      addServerHandler({
        route: '/_shopify/devtools/store',
        method: 'get',
        handler: resolve('./runtime/server/routes/devtools-store')
      })
      addCustomTab(
        {
          name: 'nuxt-shopify',
          title: 'Shopify',
          icon: 'simple-icons:shopify',
          view: { type: 'iframe', src: '/_shopify/devtools' }
        },
        nuxt
      )
      // Shopify CLI captures Nuxt's output but cannot display its auth prompt.
      // Disable the DevTools browser authorization gate for local development.
      if (nuxt.options.devtools !== false) {
        nuxt.options.devtools = {
          ...(typeof nuxt.options.devtools === 'object'
            ? nuxt.options.devtools
            : {}),
          enabled:
            typeof nuxt.options.devtools === 'object'
              ? (nuxt.options.devtools.enabled ?? true)
              : true,
          disableAuthorization: true
        }
      }

      nuxt.hook('listen', async (_server, listener) => {
        const urls = await listener?.getURLs?.()
        const url = urls?.[0]?.url || listener?.url
        if (url) logger.info(`Nuxt local URL: ${url}`)
      })
    }

    // ─── Runtime Config ────────────────────────────────────────────────
    // Private server-side config (secrets — not exposed to client)
    nuxt.options.runtimeConfig.shopify = {
      apiKey: options.apiKey,
      apiSecretKey: options.apiSecretKey,
      scopes: options.scopes || [],
      appUrl: options.appUrl,
      apiVersion: options.apiVersion || ApiVersion.January26,
      authPathPrefix: options.authPathPrefix || '/_shopify/auth',
      distribution: options.distribution || AppDistribution.AppStore,
      useOnlineTokens: options.useOnlineTokens || false
    }

    // Public config (safe to expose to client — only the API key)
    nuxt.options.runtimeConfig.public.shopify = {
      apiKey: options.apiKey,
      authPagePath: options.authPage !== false ? '/auth' : '',
      authPathPrefix: options.authPathPrefix || '/_shopify/auth',
      redirectCookie: options.redirectCookie || 'sh-redirect-to',
      navLinks: options.navLinks || []
    }

    // ─── Aliases ───────────────────────────────────────────────────────
    // Allow importing from '#shopify/server' in server code
    nuxt.options.alias['#shopify/server'] = resolve('./runtime/server')

    // ─── Server Auto-Imports ───────────────────────────────────────────
    // Auto-import server utilities (useShopifyAdmin, useShopifyWebhook, etc.)
    addServerImportsDir(resolve('./runtime/server/utils'))

    // ─── Client Auto-Imports ───────────────────────────────────────────
    // Auto-import composables (useAppBridge, useShopifyFetch)
    addImportsDir(resolve('./runtime/composables'))

    // ─── Components ────────────────────────────────────────────────────
    // Auto-register Polaris components from the CDN as Vue components.
    const componentsDir = resolve('./runtime/components')
    nuxt.hook('components:dirs', (dirs) => {
      dirs.push({
        path: componentsDir,
        prefix: options.componentPrefix,
        pathPrefix: false,
        extensions: ['vue']
      })
    })

    // ─── App Bridge Head Tags (SSR) ─────────────────────────────────
    nuxt.hook('app:resolve', () => {
      nuxt.options.app.head = nuxt.options.app.head || {}
      nuxt.options.app.head.meta = [...(nuxt.options.app.head.meta || [])]

      nuxt.options.app.head.script = [
        // 1. Inline script to create the meta tag imperatively — guarantees it exists in the DOM before the CDN script executes.
        {
          key: 'shopify-api-key-meta',
          innerHTML: `var m=document.createElement('meta');m.name='shopify-api-key';m.content='${options.apiKey}';document.head.appendChild(m);`,
          tagPosition: 'head'
        },
        {
          src: APP_BRIDGE_URL,
          tagPosition: 'head'
        },
        {
          src: POLARIS_URL,
          tagPosition: 'head'
        },
        ...(nuxt.options.app.head.script || [])
      ]
    })

    // ─── Client Plugin ─────────────────────────────────────────────────
    // App Bridge npm package initialization (client-side only)
    addPlugin({
      src: resolve('./runtime/plugins/app-bridge'),
      mode: 'client'
    })

    // ─── Server Routes ─────────────────────────────────────────────────
    const authPrefix = options.authPathPrefix || '/_shopify/auth'

    // OAuth start
    addServerHandler({
      route: authPrefix,
      method: 'get',
      handler: resolve('./runtime/server/routes/auth')
    })

    // OAuth callback
    addServerHandler({
      route: `${authPrefix}/callback`,
      method: 'get',
      handler: resolve('./runtime/server/routes/auth-callback')
    })

    // Exit iframe page
    addServerHandler({
      route: `${authPrefix}/exit-iframe`,
      method: 'get',
      handler: resolve('./runtime/server/routes/auth-exit-iframe')
    })

    // Session token bounce page
    addServerHandler({
      route: `${authPrefix}/session-token`,
      method: 'get',
      handler: resolve('./runtime/server/routes/auth-session-token')
    })

    addRouteMiddleware({
      name: 'shopify-auth',
      path: resolve('./runtime/middleware/shopify-auth'),
      global: false
    })

    addRouteMiddleware({
      name: 'shopify-guest',
      path: resolve('./runtime/middleware/shopify-guest'),
      global: false
    })

    // ─── Auth Login Page ───────────────────────────────────────────────
    // Built-in /auth page with shop domain input for non-embedded flows.
    // Set `authPage: false` to disable, or provide a custom component path.
    if (options.authPage !== false) {
      logger.info(
        'Adding default /auth login page for non-embedded apps (can be customized or disabled with the authPage option)...'
      )
      extendPages((pages) => {
        pages.push({
          name: 'shopify-auth-login',
          path: '/auth',
          file: options.authPage || resolve('./runtime/pages/auth-login.vue')
        })
      })
    }

    // ─── Server Plugins ───
    addNitroPlugin(resolve('./runtime/server/plugins/shopify-defaults'))
    addNitroPlugin(resolve('./runtime/server/plugins/add-response-headers'))

    // ─── Transpile ─────────────────────────────────────────────────────
    nuxt.options.build.transpile.push(resolve('./runtime'))

    // Ensure @shopify/shopify-api adapter side-effects are preserved in the Nitro bundle
    nuxt.hook('ready', () => {
      const nitro = useNitro()

      const noExternals = nitro.options.noExternals
      if (noExternals === true) return
      nitro.options.noExternals = [
        ...(noExternals || []),
        '@shopify/shopify-api',
        '@shopify/shopify-api/adapters/node',
        '@shopify/shopify-app-session-storage-memory',
        'isbot'
      ]
    })

    // ─── Type Declarations ─────────────────────────────────────────────
    nuxt.hook('prepare:types', ({ references }) => {
      references.push({
        path: resolve('./runtime/types/index.ts')
      })
    })

    // ─── GraphQL Codegen ───────────────────────────────────────────────
    if (options.codegen) {
      const codegenVersions: string[] = Array.isArray(options.codegen)
        ? options.codegen
        : [options.apiVersion || ApiVersion.January26]

      logger.info(
        `Codegen enabled for API version(s): ${codegenVersions.join(', ')}`
      )

      // Register aliases so users can import from #shopify/types/<version>/admin
      for (const version of codegenVersions) {
        const outputPath = `${nuxt.options.buildDir}/types/shopify/${version}`
        nuxt.options.alias[`#shopify/types/${version}/admin`] =
          outputPath + '/admin'
      }

      // Run codegen during prepare (dev:prepare / nuxt prepare)
      nuxt.hook('prepare:types', async () => {
        const { runCodegen } = await import('./codegen')
        await runCodegen({
          versions: codegenVersions,
          rootDir: nuxt.options.rootDir,
          logger
        })
      })
    }
  }
})
