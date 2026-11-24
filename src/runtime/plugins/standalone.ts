import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import type { Session } from '@shopify/shopify-api'
import type { ShopifyGlobal } from '@shopify/app-bridge-types'

export default defineNuxtPlugin({
  name: 'shopify-standalone',
  enforce: 'pre',
  setup(nuxtApp) {
    if (!import.meta.dev) return
    if (import.meta.server) {
      const session = nuxtApp.ssrContext?.event.context.shopifyStandalone as
        | Session
        | undefined
      if (session) nuxtApp.payload.shopifyStandalone = { shop: session.shop }
      return
    }
    const context = nuxtApp.payload.shopifyStandalone as
      | { shop: string }
      | undefined
    if (!context) return
    const config = useRuntimeConfig().public.shopify
    const shim = {
      config: { shop: context.shop, apiKey: config.apiKey },
      idToken: async () => {
        throw new Error(
          'Standalone development uses an authenticated server cookie, not a Shopify ID token.'
        )
      },
      loading: (active: boolean) => {
        document.documentElement.style.cursor = active ? 'progress' : ''
      },
      toast: {
        show: (message: string) => {
          const status = document.getElementById('shopify-standalone-status')
          if (status) status.textContent = message
          return 'standalone-toast'
        },
        hide: () => {}
      },
      modal: {
        show: (id: string) => {
          const el = document.getElementById(id) as HTMLElement & {
            showOverlay?: () => void
          }
          el?.showOverlay?.()
        },
        hide: (id: string) => {
          const el = document.getElementById(id) as HTMLElement & {
            hideOverlay?: () => void
          }
          el?.hideOverlay?.()
        }
      }
    } as unknown as ShopifyGlobal
    Object.defineProperty(window, 'shopify', {
      configurable: true,
      value: shim
    })
    nuxtApp.hook('app:mounted', () => {
      const bar = document.createElement('nav')
      bar.setAttribute('aria-label', 'Standalone development navigation')
      bar.style.cssText =
        'position:sticky;top:0;z-index:10000;display:flex;gap:16px;align-items:center;flex-wrap:wrap;padding:12px 20px;background:#202223;color:white;font:14px system-ui'
      const label = document.createElement('strong')
      label.textContent = `Standalone dev · ${context.shop}`
      bar.append(label)
      for (const link of config.navLinks) {
        const a = document.createElement('a')
        a.textContent = link.label
        a.href = link.href
        a.style.color = '#b5d8ff'
        bar.append(a)
      }
      const status = document.createElement('span')
      status.id = 'shopify-standalone-status'
      status.setAttribute('role', 'status')
      bar.append(status)
      const disconnect = document.createElement('button')
      disconnect.textContent = 'Disconnect'
      disconnect.onclick = async () => {
        await fetch('/_shopify/devtools/standalone', { method: 'DELETE' })
        window.location.replace('/auth')
      }
      bar.append(disconnect)
      document.body.prepend(bar)
    })
  }
})
